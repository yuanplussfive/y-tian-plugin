import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { executablePath } from 'puppeteer';

puppeteer.use(StealthPlugin());

const nodeVersion = process.version.slice(1).split('.')[0];

class WebParser {
 constructor() {
   this.maxRetries = 2;
   this.retryDelay = 2000;
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

 async fetchContent(url) {
   let browser = null;

   for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
     try {
       browser = await puppeteer.launch({
         headless: parseInt(nodeVersion) >= 16 ? "new" : true,
         defaultViewport: null,
         timeout: 35000,
         executablePath: executablePath(),
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

       await page.setJavaScriptEnabled(true);
       await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
       await page.setExtraHTTPHeaders({
         'Accept-Language': 'zh-CN,zh;q=0.9',
         'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
         'Cache-Control': 'no-cache',
         'Pragma': 'no-cache'
       });

       await page.setDefaultNavigationTimeout(30000);

       await page.setRequestInterception(true);
       page.on('request', request => {
         if (['image', 'font', 'media'].includes(request.resourceType())) {
           request.abort();
         } else {
           request.continue();
         }
       });

       await page.goto(url, {
         waitUntil: ['networkidle0', 'domcontentloaded', 'load'],
         timeout: 35000
       });

       await page.waitForTimeout(3000);

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

       try {
         await page.waitForFunction(() => {
           const loaders = document.querySelectorAll('.loading, .spinner, [role="progressbar"]');
           return loaders.length === 0;
         }, { timeout: 5000 });
       } catch (e) {
         console.log('等待加载指示器超时，继续处理');
       }

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
             } catch (e) {
               // 忽略解析错误
             }
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

       if (!content.textContent ||
         content.textContent.trim().length === 0 ||
         content.textContent.includes("doesn't work properly without JavaScript enabled") ||
         content.textContent.includes("请启用JavaScript")) {
         throw new Error('提取的内容无效或为空');
       }

       return content;

     } catch (error) {
       console.error(`Attempt ${attempt} failed:`, error);
       if (attempt === this.maxRetries) {
         throw new Error(`Failed to fetch content from ${url} after ${this.maxRetries} attempts: ${error.message}`);
       }
       await new Promise(resolve => setTimeout(resolve, this.retryDelay));
     } finally {
       if (browser) {
         await browser.close();
         browser = null;
       }
     }
   }
   return null;
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
       browser = await puppeteer.launch({
         headless: parseInt(nodeVersion) >= 16 ? "new" : true,
         executablePath: executablePath(),
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
       await page.goto(url, {
         waitUntil: ['networkidle0', 'domcontentloaded', 'load'],
         timeout: 35000
       });
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
       console.error("Screenshot failed:", screenshotError);
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
     console.error("Content processing error:", error);
     return null;
   }
 }
}

export default WebParser;