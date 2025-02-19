import { createRequire } from 'module'
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer');
const nodeVersion = process.version.slice(1).split('.')[0];

class WebContentExtractor {
  /**
   * 构造函数
   */
  constructor() {
    this.MAX_RETRIES = 2; // 最大重试次数
    this.RETRY_DELAY = 2000; // 重试延迟时间(毫秒)
    this.HEADLESS = parseInt(nodeVersion) >= 16 ? "new" : true,
      this.NAVIGATION_TIMEOUT = 30000; // 页面导航超时时间
    this.CONTENT_SELECTOR_TIMEOUT = 5000; // 内容选择器超时时间
    this.JAVASCRIPT_DISABLED_HINTS = [ // JavaScript 禁用提示语列表
      "doesn't work properly without JavaScript enabled",
      "请启用JavaScript",
      "需要启用JavaScript",
      "JavaScript is required"
    ];
    this.CONTENT_SELECTORS = [ // 内容选择器列表
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
      console.warn('URL格式错误:', error.message);
      return null;
    }
  }

  /**
   * 计算两个字符串的相似度（Levenshtein距离）
   * @param {string} str1 - 第一个字符串
   * @param {string} str2 - 第二个字符串
   * @returns {number} - 返回相似度(0-1之间)
   */
  calculateSimilarity(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;

    // 创建一个二维数组来存储距离
    const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

    // 初始化第一行和第一列
    for (let i = 0; i <= len1; i++) {
      matrix[i][0] = i;
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // 填充矩阵
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // 删除
          matrix[i][j - 1] + 1, // 插入
          matrix[i - 1][j - 1] + cost // 替换
        );
      }
    }

    // 计算相似度
    const distance = matrix[len1][len2];
    const maxLength = Math.max(len1, len2);
    return 1 - (distance / maxLength);
  }

  /**
   * 提取页面中的JSON数据
   * @param {puppeteer.Page} page - Puppeteer 页面对象
   * @returns {object} - 提取的JSON数据
   */
  async extractJsonData(page) {
    const jsonData = {};
    try {
      const scripts = await page.$('script'); // 获取所有 script 标签

      for (const script of scripts) {
        const text = await script.evaluate(node => node.textContent); // 获取 script 标签的内容

        // 定义匹配 JSON 数据的正则表达式模式
        const patterns = [
          /window\.([\w\.]+)\s*=\s*({[\s\S]+?});/,
          /var\s+([\w\.]+)\s*=\s*({[\s\S]+?});/,
          /const\s+([\w\.]+)\s*=\s*({[\s\S]+?});/,
          /let\s+([\w\.]+)\s*=\s*({[\s\S]+?});/
        ];

        for (const pattern of patterns) {
          try {
            const matches = text.match(pattern);
            if (matches && matches[2]) {
              const key = matches[1];
              const value = JSON.parse(matches[2]);
              jsonData[key] = value;
            }
          } catch (e) {
            console.warn('JSON解析错误:', e.message);
            // 忽略解析错误
          }
        }
      }
    } catch (error) {
      console.error('提取JSON数据失败:', error.message);
    }
    return jsonData;
  }

  /**
   * 智能提取页面主要内容
   * @param {puppeteer.Page} page - Puppeteer 页面对象
   * @returns {Promise<{jsonData: object, textContent: string, title: string, meta: object}>}
   */
  async extractPageContent(page) {
    try {
      // 尝试使用预定义的选择器来定位主要内容区域
      let mainElement = null;
      for (const selector of this.CONTENT_SELECTORS) {
        const elements = await page.$$(selector); // 使用 $$ 获取所有匹配的元素
        if (elements.length > 0) {
          // 选择文本内容最长的元素作为主要内容区域
          mainElement = elements.reduce((a, b) =>
            (a && a.evaluate ? a.evaluate(el => el.textContent || '') : Promise.resolve(''))
              .then(aText => (b && b.evaluate ? b.evaluate(el => el.textContent || '') : Promise.resolve(''))
                .then(bText => aText.length > bText.length ? a : b))
          );
          mainElement = await mainElement; // Resolve the promise
          break;
        }
      }

      // 如果没有找到特定内容区域，则使用可见的正文内容
      if (!mainElement || !(await mainElement.evaluate(el => el.textContent.trim()))) {
        const visibleText = await page.evaluate(() => {
          return Array.from(document.body.getElementsByTagName('*'))
            .filter(el => {
              const style = window.getComputedStyle(el);
              return style.display !== 'none' &&
                style.visibility !== 'hidden' &&
                el.textContent.trim().length > 0;
            })
            .map(el => el.textContent)
            .join('\n');
        });

        return {
          jsonData: {},
          textContent: visibleText,
          title: await page.title(),
          meta: {
            description: await page.$eval('meta[name="description"]', el => el.content).catch(() => ''),
            keywords: await page.$eval('meta[name="keywords"]', el => el.content).catch(() => '')
          }
        };
      }

      // 获取文本内容
      const textContent = await mainElement.evaluate(el => el.innerText || el.textContent);

      return {
        jsonData: {},
        textContent: textContent.trim(),
        title: await page.title(),
        meta: {
          description: await page.$eval('meta[name="description"]', el => el.content).catch(() => ''),
          keywords: await page.$eval('meta[name="keywords"]', el => el.content).catch(() => '')
        }
      };
    } catch (error) {
      console.error('提取页面内容失败:', error.message);
      return {
        jsonData: {},
        textContent: '',
        title: '',
        meta: {}
      };
    }
  }

  /**
   * 清理和格式化文本内容
   * @param {string} content - 原始文本内容
   * @returns {string} - 清理后的文本内容
   */
  cleanTextContent(content) {
    return content
      .replace(/<style\b[^<]*>(?:(?!<\/style>)[^<])*<\/style>/gi, '') // 移除 style 标签
      .replace(/<script\b[^<]*>(?:(?!<\/script>)[^<])*<\/script>/gi, '') // 移除 script 标签
      .replace(/<[^>]+>/g, '') // 移除 HTML 标签
      .replace(/\s+/g, ' ') // 将多个空格替换为单个空格
      .replace(/[^\S\r\n]+/g, ' ') // 移除除换行符外的所有空白字符
      .replace(/[\n\r]+/g, '\n') // 将多个换行符替换为单个换行符
      .trim(); // 移除首尾空格
  }

  /**
   * 抓取网页内容并进行清理
   * @param {string} url - 要抓取的URL
   * @returns {Promise<{title: string, text: string, metadata: object, url: string, timestamp: string, screenshot: Buffer}>}
   */
  async fetchAndCleanContent(url) {
    let browser = null;
    let finalContent = null; // 用于存储最终结果，以便在finally块中使用

    try {
      // 启动浏览器，添加更多配置选项
      browser = await puppeteer.launch({
        headless: this.HEADLESS,
        defaultViewport: null,
        timeout: this.NAVIGATION_TIMEOUT,
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
      await page.setDefaultNavigationTimeout(this.NAVIGATION_TIMEOUT);

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
        timeout: this.NAVIGATION_TIMEOUT
      });

      // 等待页面JavaScript执行完成
      await page.waitForTimeout(3000);

      // 检查页面是否包含JavaScript禁用提示
      const jsDisabledContent = await page.evaluate((hints) => {
        const text = document.body.innerText;
        return hints.some(hint => text.includes(hint));
      }, this.JAVASCRIPT_DISABLED_HINTS);

      if (jsDisabledContent) {
        throw new Error('检测到JavaScript禁用提示，重试加载');
      }

      // 等待页面主要内容加载
      try {
        await Promise.race([
          page.waitForSelector('.articleContent', { timeout: this.CONTENT_SELECTOR_TIMEOUT }),
          page.waitForSelector('#newsText', { timeout: this.CONTENT_SELECTOR_TIMEOUT }),
          page.waitForSelector('.article-content', { timeout: this.CONTENT_SELECTOR_TIMEOUT }),
          page.waitForSelector('.content', { timeout: this.CONTENT_SELECTOR_TIMEOUT }),
          page.waitForSelector('article', { timeout: this.CONTENT_SELECTOR_TIMEOUT })
        ]);
      } catch (e) {
        console.log('等待内容选择器超时，继续处理');
      }

      // 等待动态加载指示器消失
      try {
        await page.waitForFunction(() => {
          const loaders = document.querySelectorAll('.loading, .spinner, [role="progressbar"]');
          return loaders.length === 0;
        }, { timeout: this.CONTENT_SELECTOR_TIMEOUT });
      } catch (e) {
        console.log('等待加载指示器超时，继续处理');
      }

      // 智能提取页面内容
      const content = await this.extractPageContent(page);

      // 验证提取的内容
      if (!content.textContent ||
        content.textContent.trim().length === 0 ||
        this.JAVASCRIPT_DISABLED_HINTS.some(hint => content.textContent.includes(hint))) {
        throw new Error('提取的内容无效或为空');
      }

      // 清理和格式化文本内容
      const cleanContent = this.cleanTextContent(content.textContent);

      // 构建最终返回的数据结构
      finalContent = {
        title: content.title,
        text: cleanContent.substring(0, 4500), // 限制文本长度
        metadata: {
          ...content.meta
        },
        url: url,
        timestamp: new Date().toISOString()
      };

      return finalContent;

    } catch (error) {
      console.error(`抓取 ${url} 失败:`, error.message);
      throw error; // 重新抛出错误，以便在调用者处处理
    } finally {
      if (browser) {
        try {
          await browser.close();
          console.log('浏览器已关闭');
        } catch (closeError) {
          console.error('关闭浏览器失败:', closeError.message);
        }
      }
    }
  }
}

export async function PuppeteerToText(url) {
  const extractor = new WebContentExtractor();

  try {
    const result = await extractor.fetchAndCleanContent(url);
    return result;
  } catch (error) {
    console.error('抓取失败:', error.message);
    return null;
  }
}