import fetch from 'node-fetch';
import md5 from 'md5';

class BilibiliAPI {
    constructor(sessdata = '') {
        this.sessdata = sessdata;
        this.wbiKeys = null;
        this.baseHeaders = {
            'accept': '*/*',
            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'
        };
    }

    /**
     * 获取B站Cookie
     * @private
     * @returns {Promise<string>}
     */
    async getCookie() {
        if (this.sessdata) {
            return `SESSDATA=${this.sessdata}`;
        }

        try {
            const response = await fetch('https://www.bilibili.com');
            const headers = response.headers.raw();
            const setCookieHeaders = headers['set-cookie'];

            if (!setCookieHeaders) {
                throw new Error('未能获取到cookie');
            }

            const cookies = setCookieHeaders.map(header => header.split(';')[0]);
            return cookies.join('; ');
        } catch (error) {
            console.error('获取cookie失败:', error);
            throw error;
        }
    }

    /**
     * 初始化WBI密钥
     * @private
     */
    async initWbiKeys() {
        if (this.wbiKeys) return;

        const response = await fetch('https://api.bilibili.com/x/web-interface/nav', {
            headers: {
                ...this.baseHeaders,
                cookie: `SESSDATA=${this.sessdata};`
            }
        });
        const { data } = await response.json();

        const { img_url, sub_url } = data.wbi_img;
        this.wbiKeys = {
            img_key: img_url.split('/').pop().split('.')[0],
            sub_key: sub_url.split('/').pop().split('.')[0]
        };
    }

    /**
     * 获取视频基础信息
     * @param {string} bvid - 视频BV号
     * @returns {Promise<Object>}
     */
    async getVideoInfo(bvid) {
        const url = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`;
        const response = await fetch(url, {
            headers: {
                ...this.baseHeaders,
                cookie: await this.getCookie()
            }
        });

        const data = await response.json();
        if (data.code !== 0) {
            throw new Error(`API错误: ${data.message}`);
        }
        return data.data;
    }

    /**
    * 格式化视频AI总结内容，包含视频摘要、大纲和精选弹幕
    * @param {Object} aiResult - AI总结的原始返回数据
    * @returns {string} 格式化后的总结文本
    */
    async formatVideoSummary(aiResult) {
        if (!aiResult?.data?.model_result) {
            return '暂无视频总结';
        }

        const { summary, outline, subtitle } = aiResult.data.model_result;
        const parts = [];

        // 添加总体摘要
        if (summary) {
            parts.push('【视频摘要】', summary, '');
        }

        // 添加时间轴大纲
        if (outline?.[0]?.part_outline?.length > 0) {
            parts.push('【视频大纲】');
            outline[0].part_outline.forEach(({ timestamp, content }) => {
                const minutes = Math.floor(timestamp / 60);
                const seconds = timestamp % 60;
                const time = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                parts.push(`${time} - ${content}`);
            });
            parts.push('');
        }

        // 添加精选弹幕
        if (subtitle?.[0]?.part_subtitle?.length > 0) {
            parts.push('【精选弹幕】');
            subtitle[0].part_subtitle.forEach(({ start_timestamp, end_timestamp, content }) => {
                const startTime = `${Math.floor(start_timestamp / 60).toString().padStart(2, '0')}:${(start_timestamp % 60).toString().padStart(2, '0')}`;
                parts.push(`${startTime} - ${content}`);
            });
        }

        return parts.join('\n');
    }


    /**
     * 获取视频AI总结
     * @param {string} bvid - 视频BV号
     * @returns {Promise<Object>}
     */
    async getVideoSummary(bvid) {
        await this.initWbiKeys();
        const videoInfo = await this.getVideoInfo(bvid);
        const { cid, owner: { mid: upMid } } = videoInfo;
        const params = {
            bvid,
            cid,
            up_mid: upMid,
            web_location: '333.788'
        };


        const queryString = this.generateWbiQuery(params);

        const url = `https://api.bilibili.com/x/web-interface/view/conclusion/get?${queryString}`;
        const response = await fetch(url, {
            headers: {
                ...this.baseHeaders,
                cookie: await this.getCookie(),
                referer: `https://www.bilibili.com/video/${bvid}`
            }
        });

        const data = await response.json();
        if (data.code !== 0) {
            return `获取AI总结失败: ${data.message}`;
        }

        return data;
    }

    generateWbiQuery(params) {
        const mixinKey = this.getMixinKey(this.wbiKeys.img_key + this.wbiKeys.sub_key);
        const currTime = Math.round(Date.now() / 1000);
        const chrFilter = /[!'()*]/g;

        Object.assign(params, { wts: currTime });

        const query = Object.keys(params)
            .sort()
            .map(key => {
                const value = params[key].toString().replace(chrFilter, '');
                return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
            })
            .join('&');

        const wbiSign = md5(query + mixinKey);
        return query + '&w_rid=' + wbiSign;
    }

    getMixinKey(orig) {
        const mixinKeyEncTab = [
            46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35,
            27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13,
            37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4,
            22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52
        ];

        return mixinKeyEncTab
            .map(index => orig[index])
            .join('')
            .slice(0, 32);
    }
}

export async function BilibiliVideoSummary(sessdata, bvid) {
    try {
        const biliApi = new BilibiliAPI(sessdata);
        const summary = await biliApi.getVideoSummary(bvid);
        return await biliApi.formatVideoSummary(summary);
    } catch (error) {
        return `获取失败: ${error.message}`;
    }
}