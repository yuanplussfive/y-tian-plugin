import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { executablePath } from 'puppeteer';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { promisify } from 'util';
import https from 'https';
import net from 'net';

puppeteer.use(StealthPlugin());
const nodeVersion = process.version.slice(1).split('.')[0];

class WebParser {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 2;
    this.retryDelay = options.retryDelay || 2000;
    this.proxy = options.proxy || null;
    this.timeout = options.timeout || 35000;
    this.proxyAuth = options.proxyAuth || null;
    this.useProxy = false;
  }

  async processUrl(url) {
    try {
      url = url.trim();
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }
      new URL(url);
      return url;
    } catch (error) {
      return null;
    }
  }

  async testProxy(proxyUrl) {
    if (!proxyUrl) return false;

    const proxyParts = proxyUrl.split(':');
    if (proxyParts.length !== 2) return false;

    const [host, port] = proxyParts;
    const isLocalProxy = ['localhost', '127.0.0.1'].includes(host.toLowerCase());
    
    try {
      const socket = new net.Socket();
      const connectPromise = promisify(socket.connect.bind(socket));
      
      await Promise.race([
        connectPromise(parseInt(port), host),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]);
      
      socket.destroy();

      if (isLocalProxy) {
        const testUrl = 'https://www.google.com';
        const agent = new HttpsProxyAgent(proxyUrl);
        
        const response = await new Promise((resolve, reject) => {
          const req = https.get(testUrl, { 
            agent,
            timeout: 5000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            }
          }, resolve);
          
          req.on('error', reject);
        }).catch(() => null);

        return response !== null;
      }

      return true;
    } catch (error) {
      console.error(`代理测试失败: ${error.message}`);
      return false;
    }
  }

  async initializeProxy() {
    if (this.proxy) {
      this.useProxy = await this.testProxy(this.proxy);
      if (!this.useProxy) {
        console.log(`代理 ${this.proxy} 不可用，将使用直接连接`);
      } else {
        console.log(`代理 ${this.proxy} 可用，将使用代理连接`);
      }
    }
  }

  getLaunchOptions() {
    const options = {
      headless: parseInt(nodeVersion) >= 16 ? "new" : true,
      defaultViewport: null,
      timeout: this.timeout,
      executablePath: executablePath(),
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--enable-javascript',
        '--window-size=1920,1080'
      ]
    };

    if (this.useProxy && this.proxy) {
      options.args.push(`--proxy-server=${this.proxy}`);
    }

    return options;
  }

  async createPage(browser) {
    const page = await browser.newPage();
    
    await page.setJavaScriptEnabled(true);
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'zh-CN,zh;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    });

    await page.setDefaultNavigationTimeout(this.timeout);

    if (this.useProxy && this.proxy && this.proxyAuth) {
      await page.authenticate(this.proxyAuth);
    }

    await page.setRequestInterception(true);
    page.on('request', request => {
      if (['image', 'font', 'media'].includes(request.resourceType())) {
        request.abort();
      } else {
        request.continue();
      }
    });

    return page;
  }

  async extractPageContent(page) {
    const content = await page.evaluate(() => {
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
          } catch (e) {}
        });
      });

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

    return content;
  }

  async fetchContent(url) {
    if (this.proxy && this.useProxy === undefined) {
      await this.initializeProxy();
    }

    let browser = null;
    let currentAttempt = 1;
    let lastError = null;

    while (currentAttempt <= this.maxRetries) {
      try {
        browser = await puppeteer.launch(this.getLaunchOptions());
        const page = await this.createPage(browser);

        const fetchOptions = {
          waitUntil: ['networkidle0', 'domcontentloaded', 'load'],
          timeout: this.timeout
        };

        if (this.useProxy && this.proxy) {
          const proxyAgent = new HttpsProxyAgent(this.proxy);
          fetchOptions.agent = proxyAgent;
        }

        const response = await page.goto(url, fetchOptions);
        
        if (!response.ok()) {
          throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
        }

        await page.waitForTimeout(3000);

        const jsDisabledContent = await page.evaluate(() => {
          const text = document.body.innerText;
          return text.includes("doesn't work properly without JavaScript enabled") ||
            text.includes("请启用JavaScript") ||
            text.includes("需要启用JavaScript") ||
            text.includes("JavaScript is required");
        });

        if (jsDisabledContent) {
          throw new Error('检测到JavaScript禁用提示,重试加载');
        }

        try {
          await Promise.race([
            page.waitForSelector('.articleContent', { timeout: 5000 }),
            page.waitForSelector('#newsText', { timeout: 5000 }),
            page.waitForSelector('.article-content', { timeout: 5000 }),
            page.waitForSelector('.content', { timeout: 5000 }),
            page.waitForSelector('article', { timeout: 5000 })
          ]);
        } catch (e) {
          console.log('等待内容选择器超时,继续处理');
        }

        try {
          await page.waitForFunction(() => {
            const loaders = document.querySelectorAll('.loading, .spinner, [role="progressbar"]');
            return loaders.length === 0;
          }, { timeout: 5000 });
        } catch (e) {
          console.log('等待加载指示器超时,继续处理');
        }

        const content = await this.extractPageContent(page);

        if (!content.textContent ||
          content.textContent.trim().length === 0 ||
          content.textContent.includes("doesn't work properly without JavaScript enabled") ||
          content.textContent.includes("请启用JavaScript")) {
          throw new Error('提取的内容无效或为空');
        }

        return content;

      } catch (error) {
        lastError = error;
        console.error(`第 ${currentAttempt} 次尝试失败:`, error.message);

        if (this.useProxy && currentAttempt === 1) {
          console.log('代理连接失败，尝试直接连接...');
          this.useProxy = false;
          continue;
        }

        if (currentAttempt === this.maxRetries) {
          throw new Error(`在 ${this.maxRetries} 次尝试后无法从 ${url} 获取内容: ${error.message}`);
        }

        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        currentAttempt++;

      } finally {
        if (browser) {
          await browser.close();
          browser = null;
        }
      }
    }

    throw lastError || new Error('无法获取页面内容');
  }

  async processContent(url) {
    try {
      const content = await this.fetchContent(url);
      if (!content) return null;

      let cleanContent = content.textContent
        .replace(/<style\b[^<]*>(?:(?!<\/style>)[^<])*<\/style>/gi, '')
        .replace(/<script\b[^<]*>(?:(?!<\/script>)[^<])*<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .replace(/[^\S\r\n]+/g, ' ')
        .replace(/[\n\r]+/g, '\n')
        .trim();

      let browser = null;
      try {
        browser = await puppeteer.launch(this.getLaunchOptions());
        const page = await this.createPage(browser);
        
        const fetchOptions = {
          waitUntil: ['networkidle0', 'domcontentloaded', 'load'],
          timeout: this.timeout
        };

        if (this.useProxy && this.proxy) {
          const proxyAgent = new HttpsProxyAgent(this.proxy);
          fetchOptions.agent = proxyAgent;
        }

        await page.goto(url, fetchOptions);
        
        const screenshotBuffer = await page.screenshot({
          fullPage: true,
          type: 'jpeg',
          quality: 100
        });

        return {
          title: content.title,
          text: cleanContent.substring(0, 4500),
          metadata: { ...content.meta },
          url: url,
          timestamp: new Date().toISOString(),
          screenshot: screenshotBuffer
        };
      } catch (screenshotError) {
        console.error("截图失败:", screenshotError);
        return {
          title: content.title,
          text: cleanContent.substring(0, 4500),
          metadata: { ...content.meta },
          url: url,
          timestamp: new Date().toISOString(),
          screenshot: null
        };
      } finally {
        if (browser) await browser.close();
      }

    } catch (error) {
      console.error("内容处理错误:", error);
      return null;
    }
  }
}

export default WebParser;