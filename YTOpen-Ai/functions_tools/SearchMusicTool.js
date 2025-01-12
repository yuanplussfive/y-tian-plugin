import { AbstractTool } from './AbstractTool.js';
import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs';

/**
 * SearchMusic 工具类，用于搜索网易云音乐歌曲
 */
export class SearchMusicTool extends AbstractTool {
  constructor() {
    super();
    this.name = 'searchMusicTool';
    this.description = '根据关键词搜索网易云音乐的歌曲信息';
    this.parameters = {
      type: "object",
      properties: {
        keyword: {
          type: 'string',
          description: '音乐的标题或关键词, 可以是歌曲名或歌曲名+歌手名的组合'
        }
      },
      required: ['keyword']
    };
  }

  /**
   * 执行网易云音乐搜索
   * @param {string} name - 音乐关键词
   * @returns {Promise<Object|null>} - 搜索结果对象或错误信息
   */
  async searchMusic163(name) {
    try {
      const response = await fetch(`http://music.163.com/api/search/get/web?s=${encodeURIComponent(name)}&type=1&offset=0&total=true&limit=6`);
      const json = await response.json();
      if (json.result?.songCount > 0) {
        const songs = json.result.songs;
        // 随机选择一首歌曲
        const randomSong = songs[Math.floor(Math.random() * songs.length)];
        return {
          id: randomSong.id,
          name: randomSong.name,
          artists: randomSong.artists.map(a => a.name).join('&'),
          alias: randomSong.alias || 'none'
        };
      }
      return null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  /**
   * 获取歌曲播放链接
   * @param {number} ids - 歌曲ID
   * @param {string} wyck - 网易云音乐的MUSIC_U Cookie
   * @returns {Promise<string>} - 歌曲播放链接
   */
  async getMusicUrl(ids, wyck) {
    let url = 'http://music.163.com/song/media/outer/url?id=' + ids;

    try {
      let options = {
        method: 'POST', // POST请求 
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 12; MI Build/SKQ1.211230.001)',
          'Cookie': 'versioncode=8008070; os=android; channel=xiaomi; appver=8.8.70; MUSIC_U=' + wyck
        },
        body: `ids=${JSON.stringify([ids])}&level=standard&encodeType=mp3`
      };
      let response = await fetch('https://music.163.com/api/song/enhance/player/url/v1', options); //调用接口获取数据

      let res = await response.json();

      if (res.code === 200) {
        url = res.data[0]?.url || '';
      }

      if (url) {
        return url;
      }
      return '';
    } catch (error) {
      console.error(error);
      return '';
    }
  }

  /**
   * 执行音乐搜索操作并分享歌曲
   * @param {Object} opts - 参数选项
   * @param {Object} e - 事件对象
   * @returns {Promise<string>} - 搜索结果或错误信息
   */
  async func(opts, e) {
    let { keyword } = opts;

    try {
      const song = await this.searchMusic163(keyword);

      if (!song) {
        return '未找到相关的音乐。';
      }

      const ids = song.id;
      const cookiewy = '';
      const musicUrl = await this.getMusicUrl(ids, cookiewy);

      if (!musicUrl) {
        return '获取歌曲播放链接失败。';
      }

      try {
        if (e.group_id) {
          await e.group.shareMusic('163', ids);
        } else {
          await e.friend.shareMusic('163', ids);
        }

        await e.reply(segment.record(musicUrl));

        return `搜索结果:\nid: ${song.id}, name: ${song.name}, artists: ${song.artists}, alias: ${song.alias}`;
      } catch (shareError) {
        console.error('分享或发送过程出错:', shareError);
        return `分享音乐失败: ${shareError.message}`;
      }
    } catch (err) {
      console.error('执行过程中发生错误:', err);
      return `音乐搜索失败: ${err.message}`;
    }
  }
}