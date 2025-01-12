import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';
import fetch from 'node-fetch';
import { bilibiliParser } from '../../YTOpen-Ai/tools/bilibilivideoanalysis.js';

const streamPipeline = promisify(pipeline);

export const sendvideos = async (answer, e) => {
  try {
    const results = await bilibiliParser(answer);
    let validVideosSent = 0;
    const MAX_VIDEOS = 2;
    const MAX_SIZE_MB = 30;
    const TIMEOUT_MS = 40000; // 40秒超时
    const TEMP_DIR = './resources/temp_videos'; // 临时文件夹

    // 确保临时文件夹存在
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR);
    }

    for (const result of results) {
      if (validVideosSent >= MAX_VIDEOS) {
        console.log('已发送2个有效视频，停止处理');
        break;
      }

      if (!result.success || !result.videoUrl) {
        console.log('跳过无效视频链接');
        continue;
      }

      try {
        // 检查视频大小
        const response = await fetch(result.videoUrl, { method: 'HEAD' });
        const contentLength = response.headers.get('content-length');
        const sizeInMB = contentLength ? parseInt(contentLength) / (1024 * 1024) : 0;

        if (sizeInMB > MAX_SIZE_MB) {
          console.log(`跳过大视频: ${sizeInMB.toFixed(2)}MB > ${MAX_SIZE_MB}MB`);
          continue;
        }

        // 生成临时文件路径
        const tempFilePath = path.join(TEMP_DIR, `video_${Date.now()}.mp4`);

        // 下载视频，带超时控制
        const downloadPromise = async () => {
          const downloadResponse = await fetch(result.videoUrl);
          if (!downloadResponse.ok) throw new Error('下载失败');
          await streamPipeline(downloadResponse.body, fs.createWriteStream(tempFilePath));
        };

        // 设置超时
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('下载超时')), TIMEOUT_MS);
        });

        // 等待下载完成或超时
        await Promise.race([downloadPromise(), timeoutPromise]);

        // 发送本地视频
        await e.reply(segment.video(tempFilePath));
        validVideosSent++;
        console.log(`发送视频成功: ${sizeInMB.toFixed(2)}MB`);

      } catch (error) {
        console.log(error.message === '下载超时' ? '视频下载超时，跳过' : '视频处理失败，跳过');
        continue;
      } finally {
        // 清理临时文件
        const tempFiles = fs.readdirSync(TEMP_DIR);
        for (const file of tempFiles) {
          try {
            fs.unlinkSync(path.join(TEMP_DIR, file));
          } catch (err) {
            console.log('临时文件删除失败');
          }
        }
      }
    }
  } catch (error) {
    console.log('视频处理出错，跳过', error?.message);
  } finally {
    // 确保最后清理临时文件夹
    try {
      if (fs.existsSync(TEMP_DIR)) {
        const tempFiles = fs.readdirSync(TEMP_DIR);
        for (const file of tempFiles) {
          fs.unlinkSync(path.join(TEMP_DIR, file));
        }
        fs.rmdirSync(TEMP_DIR);
      }
    } catch (err) {
      console.log('临时文件夹清理失败');
    }
  }
}