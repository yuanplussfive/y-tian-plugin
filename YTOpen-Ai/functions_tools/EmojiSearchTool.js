import { AbstractTool } from './AbstractTool.js';
import fetch from 'node-fetch';

/**
 * EmojiSearch 工具类，用于根据关键词搜索表情包，并随机发送指定数量的表情包
 */
export class EmojiSearchTool extends AbstractTool {
  constructor() {
    super();
    this.name = 'emojiSearchTool';
    this.description = '根据关键词搜索表情包，并随机发送指定数量的表情包';
    this.parameters = {
      type: "object",
      properties: {
        keyword: {
          type: 'string',
          description: '表情包的搜索关键词'
        },
        count: {
          type: 'number', // 允许接收字符串或整数
          description: '要发送的表情包数量(1-10)',
          minimum: 1,
          maximum: 10,
          default: 1
        }
      },
      required: ['keyword', 'count'],
      additionalProperties: false
    };
  }

  /**
 * 搜索Duitang网站的表情包图片
 * @param {string} keyword - 搜索关键词
 * @param {number} maxImages - 最大返回图片数量
 * @returns {Promise<Array>} - 返回图片URL数组
 */
  async searchDuitangImages(keyword, maxImages = 24) {
    maxImages = Math.max(24, maxImages);
    const headers = {
      'accept': 'application/json',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'x-requested-with': 'XMLHttpRequest'
    };

    const imageUrls = new Set();
    let start = 0;
    let limit = 24;

    try {
      while (imageUrls.size < maxImages) {
        const apiUrl = `https://www.duitang.com/napi/blog/list/by_search/?kw=${encodeURIComponent(keyword)}&start=${start}&limit=${limit}`;
        const response = await fetch(apiUrl, { headers });
        const data = await response.json();

        if (!data.data.object_list || data.data.object_list.length === 0) {
          break;
        }

        data.data.object_list.forEach(item => {
          if (item.photo && item.photo.path) {
            imageUrls.add(item.photo.path);
          }
        });

        start += limit;

        // 添加延迟避免请求过快
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Fisher-Yates 洗牌算法
      const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
      };

      // 生成一个随机数在指定范围内
      const getRandomInt = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      };

      // 将Set转为数组并进行多重随机打乱
      let results = Array.from(imageUrls);

      // 进行多次随机打乱
      const shuffleCount = getRandomInt(3, 5); // 随机进行3-5次打乱
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

      return results.slice(0, maxImages);
    } catch (error) {
      console.error('搜索图片时出错:', error);
      return Array.from(imageUrls);
    }
  }

  /**
   * 执行表情包搜索并随机发送一个表情包
   * @param {Object} opts - 参数选项
   * @param {Object} e - 事件对象
   * @returns {Promise<string>} - 成功消息或错误信息
   */
  async func(opts, e) {
    const { keyword } = opts;
    // 更安全的count解析
    let count = 1;
    if (opts.count !== undefined) {
      const parsedCount = parseInt(opts.count);
      count = !isNaN(parsedCount) ? Math.min(Math.max(parsedCount, 1), 10) : 1;
    }

    // 确保count在1-10之间
    const validCount = Math.min(Math.max(parseInt(count) || 1, 1), 10);

    const imageUrls = await this.searchDuitangImages(keyword, count * 20);

    if (imageUrls && imageUrls.length > 0) {
      // 创建检查图片可用性的函数
      async function isImageAccessible(url) {
        try {
          const response = await fetch(url, {
            method: 'HEAD',
            timeout: 4000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Referer': new URL(url).origin
            },
            retry: 1,
            retryDelay: 1000
          });

          if (response.ok) {
            const contentType = response.headers.get('content-type');
            return contentType && contentType.startsWith('image/');
          }
          return false;
        } catch (error) {
          console.log(`图片检查失败 ${url}:`, {
            message: error.message,
            name: error.name,
            stack: error.stack
          });
          return false;
        }
      }

      // 添加延迟函数，避免频繁请求
      function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

      // 打乱数组
      const shuffled = imageUrls.sort(() => 0.5 - Math.random());

      const urlChecks = [];
      for (const url of shuffled) {
        try {
          const isAccessible = await isImageAccessible(url);
          urlChecks.push({ url, isAccessible });
        } catch (error) {
          urlChecks.push({ url, isAccessible: false, error });
        }
      }

      //console.log(urlChecks);

      // 过滤出可用的图片URL
      const validUrls = urlChecks
        .filter(result => result.isAccessible)
        .map(result => result.url)
        .slice(0, validCount);

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