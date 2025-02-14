import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import puppeteer, { Browser, Page } from 'puppeteer';

/**
* RekaAIChat 类，用于与 Reka AI 聊天网站进行交互。
*/
class RekaAIChat {
   private headless: boolean;
   private browser: Browser | null;
   private page: Page | null;
   private autoCloseTimeout: number;
   private lastActivity: number | null;
   private closeTimer: NodeJS.Timeout | null;
   private isInitialized: boolean;

   /**
    * 构造函数。
    * @param {boolean} headless 是否以无头模式运行浏览器。默认为 false。
    * @param {number} autoCloseTimeout 自动关闭浏览器的超时时间（毫秒）。默认为 300000 (5 分钟)。
    */
   constructor(headless: boolean = false, autoCloseTimeout: number = 300000) {
       this.headless = headless;
       this.browser = null;
       this.page = null;
       this.autoCloseTimeout = autoCloseTimeout;
       this.lastActivity = null;
       this.closeTimer = null;
       this.isInitialized = false;
   }

   /**
    * 确保浏览器和页面已初始化。如果尚未初始化，则启动浏览器并导航到 Reka AI 聊天页面。
    * @returns {Promise<void>}
    * @throws {Error} 如果初始化失败。
    */
   async ensureInitialized(): Promise<void> {
       if (!this.isInitialized) {
           try {
               let launchOptions: any = {};
               // 获取 Node.js 主版本号
               const nodeVersion = process.version.slice(1).split('.')[0];

               // 根据 Node.js 版本设置 headless 模式。Node.js 20+ 推荐使用 "new"
               launchOptions = {
                   headless: parseInt(nodeVersion) >= 20 ? "new" : true
               };

               this.browser = await puppeteer.launch(launchOptions);
               this.page = await this.browser.newPage();
               await this.page.goto('https://chat.reka.ai/', { waitUntil: 'networkidle2' });
               console.log('RekaAIChat 初始化完成。');
               this.resetCloseTimer(); // 初始化时启动定时器
               this.isInitialized = true;
           } catch (error) {
               console.error('RekaAIChat 初始化失败:', error);
               await this.close(); // 尝试关闭浏览器
               throw error;
           }
       }
   }

   /**
    * 向聊天机器人提问。
    * @param {string[]} questions 用户提出的问题数组。只处理最后一个问题。
    * @returns {Promise<string>} 聊天机器人的回复。
    * @throws {Error} 如果发生任何错误。
    */
   async ask(questions: string[]): Promise<string> {
       if (!Array.isArray(questions) || questions.length === 0) {
           throw new Error('问题必须是一个非空数组。');
       }

       const lastQuestion = questions[questions.length - 1];

       // 如果只有一个问题，则重新启动浏览器
       if (questions.length === 1) {
           if (this.isInitialized) {
               console.log('检测到单个问题，重新启动浏览器...');
               await this.close(); // 关闭旧的浏览器
               this.isInitialized = false; // 重置初始化状态
           }
           await this.ensureInitialized(); // 确保浏览器已启动
       } else {
           await this.ensureInitialized(); // 确保浏览器已启动
       }

       try {
           if (!this.page) {
               throw new Error('页面未初始化。请先调用 initialize() 方法。');
           }

           // 1. 等待 textarea 加载
           const textareaSelector = 'textarea[placeholder="Send a message"]';
           await this.page.waitForSelector(textareaSelector);

           // 2. 将问题输入到 textarea
           await this.page.type(textareaSelector, lastQuestion);

           // 3. 按 Enter 发送消息
           await this.page.keyboard.press('Enter');

           // 4. 等待回复出现
           const responseSelector = 'div.components_messageContainer__tm7Df.css-1ehrkp5';
           await this.page.waitForSelector(responseSelector, { timeout: 60000 }); // 增加超时时间

           // 5. 等待回复完全加载完毕 (添加延迟确保回复完整)
           await this.page.waitForTimeout(1000);

           // 6. 获取所有回复元素，选择最后一个
           const responseText = await this.page.evaluate((selector: string) => {
               const elements = document.querySelectorAll(selector);
               // 获取最后一个元素的内容
               const lastElement = elements[elements.length - 1];
               if (lastElement) {
                   return lastElement.textContent || ''; // 获取整个元素的文本内容
               }
               return '';
           }, responseSelector);

           console.log('问题:', lastQuestion);
           console.log('回复:', responseText);

           this.resetCloseTimer(); // 每次提问后重置定时器
           return responseText;
       } catch (error) {
           console.error('提问失败:', error);
           throw error;
       }
   }

   /**
    * 重置自动关闭定时器。每次用户活动后调用此方法。
    */
   resetCloseTimer(): void {
       if (this.closeTimer) {
           clearTimeout(this.closeTimer);
       }

       this.lastActivity = Date.now();
       this.closeTimer = setTimeout(() => {
           this.close();
       }, this.autoCloseTimeout);

       console.log(`自动关闭定时器已重置，${this.autoCloseTimeout / 60000} 分钟后关闭。`);
   }

   /**
    * 关闭浏览器。
    * @returns {Promise<void>}
    */
   async close(): Promise<void> {
       if (this.browser) {
           await this.browser.close();
           this.browser = null;
           this.page = null;
           this.closeTimer = null; // 清除定时器
           this.isInitialized = false; // 重置初始化状态
           console.log('浏览器已关闭。');
       }
   }
}

const rekaInstance = new RekaAIChat(false);

/**
* 从消息数组中提取内容。
* @param {any[]} arr 消息数组。
* @returns {string[]} 提取的内容数组。
*/
function extractContentsWithMap(arr: any[]): string[] {
   if (!arr || arr.length === 0) {
       return [];
   }

   return arr.map(obj => obj && obj.hasOwnProperty('content') ? obj.content : undefined).filter(content => content !== undefined);
}

/**
* 与 Reka AI 聊天。
* @param {any} messages 消息对象。
* @returns {Promise<string | null>} 聊天机器人的回复，如果发生错误则返回 null。
*/
export async function reka(messages: any): Promise<string | null> {
   try {
       await rekaInstance.ensureInitialized();

       const questions = extractContentsWithMap([messages[messages.length - 1]]);
       console.log(questions);
       const response = await rekaInstance.ask(questions);
       console.log('回复:', response);
       return response.trim();
   } catch (error) {
       console.error('发生错误:', error);
       return null;
   }
}