import { AbstractTool } from './AbstractTool.js';
import { createRequire } from 'module'
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer');
const nodeVersion = process.version.slice(1).split('.')[0];

/**
 * 网页内容解析工具类
 */
export class WebParserTool extends AbstractTool {
  constructor() {
    super();
    this.name = 'webParserTool';
    this.description = '如果用户需要解析网页链接, 解析网页链接内容，提取关键信息';
    this.parameters = {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: '需要解析的网页URL',
          minLength: 1,
          maxLength: 2000
        }
      },
      required: ['url'],
      additionalProperties: false
    };
  }

  /**
   * 处理URL，确保格式正确
   * @param {string} url - 输入的URL
   * @returns {string|null} - 处理后的URL或null
   */
  processUrl(url) {
    try {
      // 移除首尾空格
      url = url.trim();

      // 如果不包含协议，添加https://
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }

      // 验证URL格式
      new URL(url);
      return url;
    } catch (error) {
      return null;
    }
  }

  /**
   * 计算两个字符串的相似度
   * @param {string} str1 - 第一个字符串
   * @param {string} str2 - 第二个字符串
   * @returns {number} - 返回相似度(0-1之间)
   */
  calculateSimilarity(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));

    // 初始化矩阵
    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    // 计算Levenshtein距离
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // 删除
          matrix[i][j - 1] + 1,      // 插入
          matrix[i - 1][j - 1] + cost // 替换
        );
      }
    }

    // 计算相似度
    return 1 - matrix[len1][len2] / Math.max(len1, len2);
  }

  async fetchAndCleanContent(url) {
    let browser;
    const MAX_RETRIES = 2; // 最大重试次数
    const RETRY_DELAY = 2000; // 重试延迟时间(毫秒)

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        // 启动浏览器，添加更多配置选项
        browser = await puppeteer.launch({
          headless: parseInt(nodeVersion) >= 16 ? "new" : true,
          defaultViewport: null,
          timeout: 35000,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--enable-javascript',
            '--window-size=1920,1080'
          ]
        });

        const page = await browser.newPage();

        // 启用JavaScript
        await page.setJavaScriptEnabled(true);

        // 设置移动端用户代理和HTTP头
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        await page.setExtraHTTPHeaders({
          'Accept-Language': 'zh-CN,zh;q=0.9',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        });

        // 设置导航超时时间
        await page.setDefaultNavigationTimeout(30000);

        // 设置请求拦截，优化加载性能
        await page.setRequestInterception(true);
        page.on('request', request => {
          if (['image', 'font', 'media'].includes(request.resourceType())) {
            request.abort();
          } else {
            request.continue();
          }
        });

        // 导航到页面并等待加载完成
        await page.goto(url, {
          waitUntil: ['networkidle0', 'domcontentloaded', 'load'],
          timeout: 35000
        });

        // 等待页面JavaScript执行完成
        await page.waitForTimeout(3000);

        // 检查页面是否包含JavaScript禁用提示
        const jsDisabledContent = await page.evaluate(() => {
          const text = document.body.innerText;
          return text.includes("doesn't work properly without JavaScript enabled") ||
            text.includes("请启用JavaScript") ||
            text.includes("需要启用JavaScript") ||
            text.includes("JavaScript is required");
        });

        if (jsDisabledContent) {
          throw new Error('检测到JavaScript禁用提示，重试加载');
        }

        // 等待页面主要内容加载
        try {
          await Promise.race([
            page.waitForSelector('.articleContent', { timeout: 5000 }),
            page.waitForSelector('#newsText', { timeout: 5000 }),
            page.waitForSelector('.article-content', { timeout: 5000 }),
            page.waitForSelector('.content', { timeout: 5000 }),
            page.waitForSelector('article', { timeout: 5000 })
          ]);
        } catch (e) {
          console.log('等待内容选择器超时，继续处理');
        }

        // 等待动态加载指示器消失
        try {
          await page.waitForFunction(() => {
            const loaders = document.querySelectorAll('.loading, .spinner, [role="progressbar"]');
            return loaders.length === 0;
          }, { timeout: 5000 });
        } catch (e) {
          console.log('等待加载指示器超时，继续处理');
        }

        // 智能提取页面内容
        const content = await page.evaluate(() => {
          // 提取页面中的JSON数据
          const jsonData = {};
          const scripts = document.querySelectorAll('script');

          scripts.forEach(script => {
            const text = script.textContent || '';
            const patterns = [
              /window\.([\w\.]+)\s*=\s*({[\s\S]+?});/,
              /var\s+([\w\.]+)\s*=\s*({[\s\S]+?});/,
              /const\s+([\w\.]+)\s*=\s*({[\s\S]+?});/,
              /let\s+([\w\.]+)\s*=\s*({[\s\S]+?});/
            ];

            patterns.forEach(pattern => {
              try {
                const matches = text.match(pattern);
                if (matches && matches[2]) {
                  const key = matches[1];
                  const value = JSON.parse(matches[2]);
                  jsonData[key] = value;
                }
              } catch (e) {
                // 忽略解析错误
              }
            });
          });

          // 扩展的内容选择器列表
          const contentSelectors = [
            '.articleContent',
            '#newsText',
            '.article-content',
            '.post-content',
            '#content',
            '.content',
            '[role="main"]',
            '.main-content',
            '.repository-content',
            '.blob-wrapper',
            '#wiki_panel',
            '.markdown-body',
            '#readme',
            '.entry-content',
            '.article-body',
            '.post-body',
            'article'
          ];

          // 获取所有可能的内容区域
          let mainElement = null;
          for (const selector of contentSelectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
              mainElement = Array.from(elements).reduce((a, b) =>
                (a.textContent || '').length > (b.textContent || '').length ? a : b
              );
              break;
            }
          }

          // 如果没有找到特定内容区域，使用可见的正文内容
          if (!mainElement || !mainElement.textContent.trim()) {
            const visibleText = Array.from(document.body.getElementsByTagName('*'))
              .filter(el => {
                const style = window.getComputedStyle(el);
                return style.display !== 'none' &&
                  style.visibility !== 'hidden' &&
                  el.textContent.trim().length > 0;
              })
              .map(el => el.textContent)
              .join('\n');

            return {
              jsonData: {},
              textContent: visibleText,
              title: document.title,
              meta: {
                description: document.querySelector('meta[name="description"]')?.content || '',
                keywords: document.querySelector('meta[name="keywords"]')?.content || ''
              }
            };
          }

          // 获取文本内容
          let textContent = mainElement.innerText || mainElement.textContent;

          return {
            jsonData,
            textContent: textContent.trim(),
            title: document.title,
            meta: {
              description: document.querySelector('meta[name="description"]')?.content || '',
              keywords: document.querySelector('meta[name="keywords"]')?.content || ''
            }
          };
        });

        // 验证提取的内容
        if (!content.textContent ||
          content.textContent.trim().length === 0 ||
          content.textContent.includes("doesn't work properly without JavaScript enabled") ||
          content.textContent.includes("请启用JavaScript")) {
          throw new Error('提取的内容无效或为空');
        }

        // 清理和格式化文本内容
        let cleanContent = content.textContent
          .replace(/<style\b[^<]*>(?:(?!<\/style>)[^<])*<\/style>/gi, '')
          .replace(/<script\b[^<]*>(?:(?!<\/script>)[^<])*<\/script>/gi, '')
          .replace(/<[^>]+>/g, '')
          .replace(/\s+/g, ' ')
          .replace(/[^\S\r\n]+/g, ' ')
          .replace(/[\n\r]+/g, '\n')
          .trim();

        // 新增: 获取页面截图
        const screenshotBuffer = await page.screenshot({
          fullPage: true,
          type: 'jpeg',
          quality: 100
        });

        // 构建最终返回的数据结构
        const finalContent = {
          title: content.title,
          text: cleanContent.substring(0, 4500),
          metadata: {
            ...content.meta
          },
          url: url,
          timestamp: new Date().toISOString(),
          // 新增: 添加截图相关信息
          screenshot: screenshotBuffer
        };

        return finalContent;

      } catch (error) {
        console.error(`第 ${attempt} 次尝试失败:`, error);

        if (browser) {
          await browser.close();
          browser = null;
        }

        if (attempt === MAX_RETRIES) {
          throw new Error(`在 ${MAX_RETRIES} 次尝试后仍然无法从 ${url} 获取内容: ${error.message}`);
        }

        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      } finally {
        if (browser) {
          await browser.close();
        }
      }
    }
  }

  /**
   * 执行网页解析操作
   */
  async func(opts, e) {
    const { url } = opts;

    if (!url) {
      return '请提供网页链接。';
    }

    const processedUrl = this.processUrl(url);
    if (!processedUrl) {
      return '请提供有效的网页链接。';
    }

    try {
      const result = await this.fetchAndCleanContent(processedUrl);

      if (!result) {
        return '网页内容获取失败，请检查链接是否有效。';
      }

      // 新增: 处理截图发送
      if (result.screenshot) {
        // 使用 Yunzai-Bot 的 e.reply 发送图片
        await e.reply([
          `标题：${result.title}\n`,
          segment.image(result.screenshot)
        ]);
        return `页面解析完成，已发送页面截图。网页主要内容: \n\n${result.text}`;
      }

      // 如果不需要发送截图，返回解析的文本内容
      return result;
    } catch (error) {
      console.log('网页解析错误:', error);
      return '网页解析失败，请稍后重试。';
    }
  }
}