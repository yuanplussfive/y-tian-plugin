import { AbstractTool } from './AbstractTool.js';
import fetch from 'node-fetch';
import crypto from 'crypto';

/**
 * BingImageSearch 工具类，用于搜索 Bing 图片
 */
export class BingImageSearchTool extends AbstractTool {
    constructor() {
        super();
        this.name = 'bingImageSearchTool';
        this.description = '根据关键词搜索图片并返回图片 URL 列表';
        this.parameters = {
            type: "object",
            properties: {
                query: {
                    type: 'string',
                    description: '搜索的图片关键词'
                },
                count: {
                    type: 'number',
                    description: '返回结果数量',
                    default: 35
                }
            },
            required: ['query']
        };
    }

    /**
     * 生成请求所需的签名和headers
     * @returns {Promise<Object>} 请求头对象
     */
    async buildHeaders() {
        const gecSignature = crypto.randomBytes(32).toString('hex').toUpperCase();
        const clientData = Buffer.from(JSON.stringify({
            "1": "2",
            "2": "1",
            "3": "0",
            "4": Date.now().toString(),
            "6": "stable",
            "7": Math.floor(Math.random() * 9999999999999),
            "9": "desktop"
        })).toString('base64');

        return {
            'accept': '*/*',
            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'sec-ch-ua': '"Microsoft Edge";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'sec-ms-gec': gecSignature,
            'sec-ms-gec-version': '1-131.0.2903.112',
            'x-client-data': clientData,
            'x-edge-shopping-flag': '1',
            'Referer': 'https://cn.bing.com/visualsearch',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        };
    }

    /**
     * 执行 Bing 图片搜索
     * @param {string} query - 搜索关键词
     * @param {number} count - 返回结果数量，最小为24
     * @returns {Promise<Array<string>|null>} - 图片URL列表或null
     */
    async searchImages(query, count = 35) {
        // 确保最少返回24张图片
        count = Math.max(24, Math.min(35, count)); // 限制最大请求数为35

        try {
            const url = new URL('https://cn.bing.com/images/vsasync');
            url.searchParams.set('q', query);
            url.searchParams.set('count', count);

            let imageUrls = [];
            let retryCount = 0;
            const maxRetries = 3;

            while (imageUrls.length < count && retryCount < maxRetries) {
                const response = await fetch(url.toString(), {
                    method: 'GET',
                    headers: await this.buildHeaders()
                });

                if (!response.ok) {
                    retryCount++;
                    if (retryCount >= maxRetries) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    // 添加延迟后重试
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    continue;
                }

                const data = await response.json();

                // 提取图片URL
                imageUrls = data.results
                    .map(item => item.imageUrl)
                    .filter(url => url);

                // 如果获取的图片不足，增加重试次数
                if (imageUrls.length < 24) {
                    retryCount++;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            // 如果获取的图片不足24张，通过重复已有图片来补足
            while (imageUrls.length < 24) {
                imageUrls = imageUrls.concat(imageUrls.slice(0, 24 - imageUrls.length));
            }

            // Fisher-Yates 洗牌算法
            const shuffleArray = (array) => {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
                return array;
            };

            // 生成随机数
            const getRandomInt = (min, max) => {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            };

            // 进行多次随机打乱
            const shuffleCount = getRandomInt(3, 5); // 随机进行3-5次打乱
            for (let i = 0; i < shuffleCount; i++) {
                // Fisher-Yates 洗牌
                shuffleArray(imageUrls);

                // 随机排序
                imageUrls.sort(() => Math.random() - 0.5);

                // 随机反转
                if (Math.random() > 0.5) {
                    imageUrls.reverse();
                }

                // 随机分段重组
                if (Math.random() > 0.5) {
                    const splitIndex = Math.floor(imageUrls.length / 2);
                    const firstHalf = imageUrls.slice(0, splitIndex);
                    const secondHalf = imageUrls.slice(splitIndex);
                    imageUrls = [...secondHalf, ...firstHalf];
                }
            }

            // 最后再进行一次 Fisher-Yates 洗牌
            shuffleArray(imageUrls);

            return imageUrls.slice(0, count);

        } catch (error) {
            console.error('Bing图片搜索错误:', error);
            return null;
        }
    }

    /**
 * 执行壁纸搜索
 * @param {string} query - 搜索关键词
 * @param {number} numResults - 需要的结果数量
 * @returns {Promise<Array<string>|null>} - 图片URL列表或null
 */
    async searchWallpapers(query, numResults = 35) {
        try {
            const hashValue = crypto.randomBytes(32).toString('hex');
            const params = new URLSearchParams({
                product_id: 52,
                version_code: 28103,
                page: 0,
                search_word: query,
                maxWidth: 99999,
                minWidth: 0,
                maxHeight: 99999,
                minHeight: 0,
                searchMode: "ACCURATE_SEARCH",
                sort: 0,
                sign: hashValue
            });

            const response = await fetch("https://wallpaper.soutushenqi.com/v1/wallpaper/list", {
                method: 'POST',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                },
                body: params.toString(),
                timeout: 10000,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.data || !Array.isArray(data.data)) {
                return null;
            }

            // 提取并过滤有效的图片URL
            const imageUrls = data.data
                .filter(item => item.largeUrl && !item.largeUrl.includes('fw480'))
                .map(item => item.largeUrl);

            // 去重
            const uniqueUrls = [...new Set(imageUrls)];

            // Fisher-Yates 洗牌算法
            const shuffleArray = (array) => {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
                return array;
            };

            // 生成随机数
            const getRandomInt = (min, max) => {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            };

            // 进行多次随机打乱
            const shuffleCount = getRandomInt(3, 5); // 随机进行3-5次打乱
            let results = [...uniqueUrls];

            for (let i = 0; i < shuffleCount; i++) {
                // Fisher-Yates 洗牌
                shuffleArray(results);

                // 随机排序
                results.sort(() => Math.random() - 0.5);

                // 随机反转
                if (Math.random() > 0.5) {
                    results.reverse();
                }

                // 随机分段重组
                if (Math.random() > 0.5) {
                    const splitIndex = Math.floor(results.length / 2);
                    const firstHalf = results.slice(0, splitIndex);
                    const secondHalf = results.slice(splitIndex);
                    results = [...secondHalf, ...firstHalf];
                }
            }

            // 最后再进行一次 Fisher-Yates 洗牌
            shuffleArray(results);

            return results.slice(0, numResults);

        } catch (error) {
            console.error('壁纸搜索错误:', error);
            return null;
        }
    }

    /**
     * Tool 执行函数
     * @param {Object} opts - 参数选项
     * @param {Object} e - 事件对象
     * @returns {Promise<string>} - 搜索结果或错误信息
     */
    async func(opts, e) {
        const { query } = opts;
        let count = 35; // 默认值

        // 验证并处理 count 参数
        if (opts.count !== undefined) {
            const parsedCount = parseInt(opts.count);
            count = !isNaN(parsedCount) ? Math.min(Math.max(parsedCount, 1), 35) : 1;
        }

        if (!query) {
            return '搜索关键词（query）是必填项。';
        }

        let imageUrls = await this.searchWallpapers(query, count);

        // 如果壁纸搜索完全失败，切换到 Bing 搜索
        if (!imageUrls || imageUrls.length === 0) {
            console.log('壁纸搜索无结果，切换到 Bing 搜索');
            imageUrls = await this.searchImages(query, count);
        }
        // 如果壁纸搜索结果不足，使用 Bing 搜索补充
        else if (imageUrls.length < count) {
            console.log(`壁纸搜索结果不足(${imageUrls.length}/${count})，使用 Bing 搜索补充`);
            const remainingCount = count - imageUrls.length;
            const bingResults = await this.searchImages(query, remainingCount);

            if (bingResults && bingResults.length > 0) {
                // 合并结果并去重
                imageUrls = [...new Set([...imageUrls, ...bingResults])];
                // 如果去重后数量仍然超过要求，截取所需数量
                if (imageUrls.length > count) {
                    imageUrls = imageUrls.slice(0, count);
                }
            }
        }
        console.log(imageUrls);
        if (imageUrls && imageUrls.length > 0) {
            // 创建检查图片可用性的函数
            async function isImageAccessible(url) {
                try {
                    const response = await fetch(url, {
                        method: 'HEAD',
                        timeout: 3000 // 3秒超时
                    });

                    // 检查响应状态和内容类型
                    if (response.ok) {
                        const contentType = response.headers.get('content-type');
                        return contentType && contentType.startsWith('image/');
                    }
                    return false;
                } catch (error) {
                    console.log(`图片检查失败 ${url}:`, error);
                    return false;
                }
            }

            // 打乱数组
            const shuffled = imageUrls.sort(() => 0.5 - Math.random());

            // 并行检查所有图片的可用性
            const urlChecks = await Promise.allSettled(
                shuffled.map(async url => ({
                    url,
                    isAccessible: await isImageAccessible(url)
                }))
            );

            // 过滤出可用的图片URL
            const validUrls = urlChecks
                .filter(result => result.status === 'fulfilled' && result.value.isAccessible)
                .map(result => result.value.url)
                .slice(0, count);

            if (validUrls.length === 0) {
                await e.reply('抱歉，未找到可用的图片，请重试。');
                return;
            }

            const allimages = [];
            const failedUrls = [];

            // 尝试构建图片消息
            for (const url of validUrls) {
                try {
                    const img = segment.image(url);
                    allimages.push(img);
                } catch (error) {
                    console.error(`构建图片消息失败 ${url}:`, error);
                    failedUrls.push(url);
                }
            }

            if (allimages.length === 0) {
                await e.reply('抱歉，所有图片都无法发送，请重试。');
                return;
            }

            const BATCH_SIZE = 8;  // 正常批次大小
            const RETRY_BATCH_SIZE = 5;  // 风控后的批次大小
            let successCount = 0;
            let failedBatches = 0;

            async function sendSingleImage(image) {
                const maxRetries = 3;
                for (let i = 0; i < maxRetries; i++) {
                    try {
                        const result = await Bot.pickGroup(e.group_id).sendMsg(image).catch(err => {
                            return { error: err };
                        });

                        if (!result.error) {
                            return { success: true };
                        }

                        // 特别处理 ECONNRESET 错误
                        if (result.error.message?.includes('ECONNRESET')) {
                            logger.warn(`[图片搜索] 图片发送失败(ECONNRESET)，第 ${i + 1} 次重试`);
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            continue;
                        }

                        return { success: false, error: result.error };
                    } catch (err) {
                        logger.error(`[图片搜索] 图片发送异常: ${err.message}`);
                        if (i === maxRetries - 1) {
                            return { success: false, error: err };
                        }
                    }
                }
                return { success: false, error: new Error('达到最大重试次数') };
            }

            async function sendBatchWithRetry(images, batchSize) {
                const maxRetries = 3;  // 每个批次最大重试次数
                const minBatchSize = 4;  // 最小批次大小
            
                // 将图片按指定大小分组
                const batches = [];
                for (let i = 0; i < images.length; i += batchSize) {
                    batches.push(images.slice(i, i + batchSize));
                }
            
                // 逐批次发送
                for (const batch of batches) {
                    let retryCount = 0;
                    let success = false;
            
                    while (!success && retryCount < maxRetries) {
                        try {
                            const result = await Bot.pickGroup(e.group_id).sendMsg(batch).catch(err => {
                                return { error: err };
                            });
            
                            if (!result.error) {
                                success = true;
                                successCount += batch.length;
                                break;
                            }
            
                            // ECONNRESET 错误特殊处理
                            if (result.error.message?.includes('ECONNRESET')) {
                                logger.warn(`[图片搜索] 批次发送失败(ECONNRESET)，第 ${retryCount + 1} 次重试`);
                                await new Promise(resolve => setTimeout(resolve, 1000));
                                retryCount++;
                                continue;
                            }
            
                            // 风控错误，尝试减小批次
                            if (result.error?.code === -70 && batch.length > minBatchSize) {
                                logger.mark(`[图片搜索] 检测到风控，尝试减小批次大小`);
                                // 将当前批次拆分为更小的批次重试
                                const smallerBatches = [];
                                for (let i = 0; i < batch.length; i += minBatchSize) {
                                    smallerBatches.push(batch.slice(i, i + minBatchSize));
                                }
            
                                // 发送更小的批次
                                for (const smallBatch of smallerBatches) {
                                    await new Promise(resolve => setTimeout(resolve, 1500));
                                    const smallResult = await Bot.pickGroup(e.group_id).sendMsg(smallBatch);
                                    if (!smallResult.error) {
                                        successCount += smallBatch.length;
                                    }
                                }
                                success = true;
                                break;
                            }
            
                            retryCount++;
                        } catch (err) {
                            logger.error(`[图片搜索] 批次发送异常: ${err.message}`);
                            retryCount++;
                        }
                    }
            
                    if (!success) {
                        logger.error(`[图片搜索] 批次发送失败，达到最大重试次数`);
                        failedBatches++;
                    }
            
                    // 批次间延迟
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            
                return { success: true };
            }            

            await sendBatchWithRetry(allimages, BATCH_SIZE);

            // 返回结果
            if (successCount === 0) {
                return '抱歉，所有图片都发送失败了，可能被风控，请稍后再试。';
            } else if (failedBatches > 0) {
                return `已发送 ${successCount} 张图片，但有 ${failedBatches} 批发送失败，可能部分被风控。`;
            }

            return `已成功发送 ${successCount} 张图片~`;
        }
    }
}