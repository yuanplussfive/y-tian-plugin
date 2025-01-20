import puppeteer from 'puppeteer';

export class WebContentExtractor {
  constructor(options = {}) {
    this.options = {
      viewport: { width: 1920, height: 1080 },
      timeout: 60000,
      maxRetries: 3,
      waitTime: 2000,
      maxContentLength: 6000,
      ...options
    };

    // 内容选择器配置
    this.contentSelectors = {
      exclude: [
        '.advertisement', '.ads', '.banner',
        'nav', 'header', 'footer', 'aside',
        '.sidebar', '.menu', '.navigation',
        '.social-share', '.comment'
      ],
      priority: [
        'article',
        'main',
        '.article-content',
        '.post-content',
        '.content',
        '#content',
        '.main-content',
        '.article',
        '.readme-box',
        '.repository-content',
        '#readme'
      ]
    };
  }

  /**
   * 初始化浏览器实例
   * @private
   */
  async initBrowser() {
    return await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--enable-javascript',
        '--window-size=1920,1080'
      ]
    });
  }

/**
 * 模拟用户交互
 * @private
 * @param {Page} page - Puppeteer页面实例
 */
async simulateUserInteraction(page) {
  try {
    // 模拟滚动
    await page.evaluate(() => {
      return new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer);
            window.scrollTo(0, 0);
            resolve();
          }
        }, 100);
      });
    });

    // 模拟鼠标移动
    await page.mouse.move(100, 100);
    await page.mouse.move(200, 200);

    // 等待一小段时间让可能的动态内容加载
    await page.waitForTimeout(1000);
  } catch (error) {
    console.warn('模拟用户交互警告:', error.message);
    // 继续执行，不抛出错误
  }
}

/**
 * 配置页面设置
 * @private
 */
async setupPage(page) {
  // 设置视口
  await page.setViewport(this.options.viewport);

  // 注入辅助函数来处理常见的浏览器API
  await page.evaluateOnNewDocument(() => {
    // 模拟语音相关API
    window.speechSynthesis = {
      speak: () => {},
      cancel: () => {},
      pause: () => {},
      resume: () => {},
      getVoices: () => []
    };

    // 模拟其他可能缺失的API
    window.hwbr = {
      voiceRead: {
        isSupportRead: () => false,
        startRead: () => {},
        stopRead: () => {}
      }
    };

    // 通用错误处理
    window.addEventListener('error', (event) => {
      // 忽略非关键错误
      if (event.message.includes('notSupport') || 
          event.message.includes('undefined') ||
          event.message.includes('null')) {
        event.preventDefault();
        return true;
      }
    });
  });

  // 设置请求拦截
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    const resourceType = request.resourceType();
    const url = request.url();
    
    // 允许API请求和必要的资源
    if (url.includes('/api/') || url.includes('/data/') || 
        ['script', 'xhr', 'fetch', 'document'].includes(resourceType)) {
      request.continue();
    } else if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
      request.abort();
    } else {
      request.continue();
    }
  });

  // 忽略特定的控制台错误
  page.on('pageerror', error => {
    const errorText = error.toString();
    const ignoredErrors = [
      'notSupport',
      'hwbr',
      'undefined',
      'null',
      'Cannot read property'
    ];
    
    if (!ignoredErrors.some(e => errorText.includes(e))) {
      console.error('页面JS错误:', error);
    }
  });

  // 设置默认超时时间
  page.setDefaultTimeout(this.options.timeout);
}

  /**
   * 处理动态加载内容
   * @private
   */
async handleDynamicContent(page) {
  try {
    // 等待页面加载完成
    await page.waitForFunction(() => {
      return document.readyState === 'complete';
    }, { timeout: this.options.timeout });

    // 等待内容加载
    await Promise.race([
      // 等待主要内容选择器
      ...this.contentSelectors.priority.map(selector => 
        page.waitForSelector(selector, { 
          timeout: this.options.timeout / 2,
          visible: true 
        }).catch(() => null)
      ),
      
      // 等待文章标题
      page.waitForFunction(() => {
        const title = document.querySelector('h1, .title, .article-title');
        return title && title.textContent.trim().length > 0;
      }, { timeout: this.options.timeout / 2 }).catch(() => null),

      // 等待文章内容
      page.waitForFunction(() => {
        const article = document.querySelector('article, .article, .content');
        return article && article.textContent.trim().length > 100;
      }, { timeout: this.options.timeout / 2 }).catch(() => null),

      // 等待基本文本内容
      page.waitForFunction(() => {
        const bodyText = document.body.innerText.trim();
        return bodyText.length > 100;
      }, { timeout: this.options.timeout }).catch(() => null)
    ]);

    // 处理可能的弹窗或遮罩
    await page.evaluate(() => {
      const removeElements = (selectors) => {
        selectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => el.remove());
        });
      };

      // 移除常见的遮罩和弹窗
      removeElements([
        '.modal',
        '.popup',
        '.overlay',
        '.mask',
        '[class*="modal"]',
        '[class*="popup"]',
        '[class*="overlay"]',
        '[class*="mask"]'
      ]);
    });

    // 模拟用户交互
    await this.simulateUserInteraction(page);

    // 等待额外的动态内容
    await page.waitForTimeout(this.options.waitTime);

    // 验证内容是否加载成功
    const contentLoaded = await page.evaluate(() => {
      const bodyText = document.body.innerText.trim();
      const title = document.querySelector('h1, .title, .article-title');
      const content = document.querySelector('article, .article, .content');
      
      return {
        hasContent: bodyText.length > 100 || 
                    (title && title.textContent.trim().length > 0) ||
                    (content && content.textContent.trim().length > 0),
        text: bodyText.substring(0, 100) // 用于调试
      };
    });

    if (!contentLoaded.hasContent) {
      console.warn('内容加载验证失败，当前文本:', contentLoaded.text);
      throw new Error('页面内容未正确加载');
    }

  } catch (error) {
    console.warn('动态内容处理警告:', error.message);
    throw error; // 向上传递错误以便重试
  }
}
  

  /**
   * 注入内容提取脚本
   * @private
   */
  async extractPageContent(page) {
    return await page.evaluate((config) => {
      const { exclude, priority } = config;

      // 移除广告和无关内容
      exclude.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.remove());
      });

      // 查找主要内容区域
      let mainContent = null;
      for (const selector of priority) {
        const element = document.querySelector(selector);
        if (element) {
          mainContent = element;
          break;
        }
      }

      // 内容提取辅助函数
      class ContentProcessor {
        static truncateString(str, maxLength) {
          if (!str || str.length <= maxLength) return str || '';
          return str.substring(0, maxLength - 3) + '...';
        }

        static extractMetadata() {
          return {
            url: window.location.href,
            title: document.title,
            description: document.querySelector('meta[name="description"]')?.content || '',
            keywords: document.querySelector('meta[name="keywords"]')?.content || '',
            author: document.querySelector('meta[name="author"]')?.content || '',
            timestamp: new Date().toISOString(),
          };
        }

        static processNode(node, context) {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent.trim();
            if (text) context.currentSection.content.push(text);
            return;
          }

          const tagName = node.tagName?.toLowerCase();
          if (!tagName || ['script', 'style', 'noscript', 'iframe', 'svg'].includes(tagName)) {
            return;
          }

          // 处理不同类型的节点
          this.handleSpecialNodes(node, tagName, context);

          // 递归处理子节点
          node.childNodes.forEach(child => this.processNode(child, context));
        }

        static handleSpecialNodes(node, tagName, context) {
          // 处理标题
          if (/^h[1-6]$/.test(tagName)) {
            this.handleHeading(node, tagName, context);
            return;
          }

          // 处理段落
          if (tagName === 'p') {
            const text = this.truncateString(node.textContent.trim(), 1000);
            if (text) context.currentSection.content.push(`\n${text}\n`);
            return;
          }

          // 处理列表
          if (tagName === 'li') {
            const text = this.truncateString(node.textContent.trim(), 500);
            if (text) context.currentSection.content.push(`* ${text}`);
            return;
          }

          // 处理表格
          if (tagName === 'table') {
            this.handleTable(node, context);
          }
        }

        static handleHeading(node, tagName, context) {
          const level = parseInt(tagName.charAt(1));
          const title = this.truncateString(node.textContent.trim(), 100);

          if (level === 1) {
            context.title = title;
          } else {
            if (context.currentSection.content.length > 0) {
              context.sections.push({ ...context.currentSection });
            }
            context.currentSection = {
              title: `${'#'.repeat(level)} ${title}`,
              content: []
            };
          }
        }

        static handleTable(node, context) {
          const mdTable = [];
          const rows = node.querySelectorAll('tr');
          let totalLength = 0;

          for (let i = 0; i < rows.length && totalLength < 1000; i++) {
            const cells = Array.from(rows[i].querySelectorAll('td, th'))
              .map(cell => this.truncateString(cell.textContent.trim(), 100));

            const rowText = `| ${cells.join(' | ')} |`;
            totalLength += rowText.length;

            mdTable.push(rowText);
            if (i === 0) {
              mdTable.push(`| ${'-|'.repeat(cells.length)}`);
            }
          }

          context.currentSection.content.push(mdTable.join('\n'));
        }
      }

      // 提取内容
      const context = {
        title: '',
        sections: [],
        currentSection: { title: '', content: [] }
      };

      ContentProcessor.processNode(mainContent || document.body, context);

      // 保存最后一个section
      if (context.currentSection.content.length > 0) {
        context.sections.push(context.currentSection);
      }
      delete context.currentSection;

      return {
        metadata: ContentProcessor.extractMetadata(),
        content: context
      };
    }, this.contentSelectors);
  }

  /**
   * 主要提取方法
   * @public
   */
  async extract(url) {
    let browser;
    let retries = 0;
  
    while (retries < this.options.maxRetries) {
      try {
        browser = await this.initBrowser();
        const page = await browser.newPage();
        
        // 设置更宽松的超时时间
        page.setDefaultNavigationTimeout(this.options.timeout * 2);
        
        await this.setupPage(page);
  
        // 访问页面
        await page.goto(url, {
          waitUntil: ['networkidle0', 'domcontentloaded'],
          timeout: this.options.timeout * 2
        });
  
        // 处理动态内容
        await this.handleDynamicContent(page);
  
        // 检查内容是否成功加载
        const hasContent = await page.evaluate(() => {
          const bodyText = document.body.innerText.trim();
          const title = document.querySelector('h1, .title, .article-title');
          const content = document.querySelector('article, .article, .content');
          
          return (bodyText.length > 100 || 
                  (title && title.textContent.trim().length > 0) ||
                  (content && content.textContent.trim().length > 0)) &&
                 !bodyText.includes("doesn't work properly without JavaScript enabled");
        });
  
        if (!hasContent) {
          throw new Error('页面内容未正确加载');
        }
  
        // 提取内容
        const content = await this.extractPageContent(page);
        
        // 验证内容
        if (!content.content.title && !content.content.sections.length) {
          throw new Error('未能提取到有效内容');
        }
  
        return this.postProcessContent(content);
  
      } catch (error) {
        console.error(`提取失败 (尝试 ${retries + 1}/${this.options.maxRetries}):`, error);
        retries++;
        if (retries === this.options.maxRetries) {
          throw new Error(`内容提取失败: ${error.message}`);
        }
        // 重试前等待更长时间
        await new Promise(resolve => setTimeout(resolve, 3000));
      } finally {
        if (browser) await browser.close();
      }
    }
  }

  /**
   * 后处理提取的内容
   * @private
   */
  postProcessContent(content) {
    let totalLength = 0;
    return {
      metadata: content.metadata,
      content: {
        title: content.content.title,
        sections: content.content.sections
          .map(section => ({
            title: section.title,
            content: section.content
              .filter(text => text.trim())
              .join('\n')
              .replace(/\n{3,}/g, '\n\n')
              .trim()
          }))
          .filter(section => {
            totalLength += section.title.length + section.content.length;
            return totalLength <= this.options.maxContentLength;
          })
      }
    };
  }
}

// 使用示例
// async function example() {
//   try {
//     const extractor = new WebContentExtractor({
//       maxRetries: 1,
//       waitTime: 3000,
//       maxContentLength: 8000
//     });

//     const url = 'https://m.chinanews.com/wap/detail/chs/zw/10355812.shtml';
//     const result = await extractor.extract(url);
//     console.log(JSON.stringify(result, null, 2));
//   } catch (error) {
//     console.error('示例运行失败:', error);
//   }
// }