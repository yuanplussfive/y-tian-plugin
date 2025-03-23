import WebParser from '../YTOpen-Ai/functions_tools/puppeteer/WebParser.js';
import { YTOtherModels } from '../utils/fileUtils.js';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 网页解析插件
 * 用于解析网页内容并返回文本和截图
 */
export class WebParserPlugin extends plugin {
  constructor() {
    super({
      name: '网页解析',
      dsc: '解析网页内容并返回文本和截图',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^#?解析网页\\s*(.+)$',
          fnc: 'parseWebpage'
        },
        {
          reg: '^#?网页截图\\s*(.+)$',
          fnc: 'screenshotWebpage'
        }
      ]
    });
    const configPath = path.join(__dirname, '../config/message.yaml');
    console.log(configPath)
    let config = {};
    if (fs.existsSync(configPath)) {
        const file = fs.readFileSync(configPath, 'utf8');
        const configs = YAML.parse(file);
        config = configs.pluginSettings;
    }
    const proxy = config?.ClashProxy;
    this.parser = new WebParser({
      proxy: proxy,
      timeout: 35000,
      maxRetries: 2,
      retryDelay: 2000
    });
    
    // 创建临时目录用于保存截图
    this.tempDir = path.join('./data/webparser');
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * 解析网页内容并返回文本和截图
   * @param {object} e - 消息事件对象
   * @returns {Promise<boolean>} - 是否处理成功
   */
  async parseWebpage(e) {
    // 获取URL
    const url = e.msg.replace(/^#?解析网页\s*/, '').trim();
    if (!url) {
      await e.reply('请提供要解析的网页链接');
      return false;
    }

    // 发送处理中提示
    await e.reply('正在解析网页，请稍候...');

    try {
      // 处理URL
      const processedUrl = await this.parser.processUrl(url);
      if (!processedUrl) {
        await e.reply('无效的网页链接，请检查后重试');
        return false;
      }

      // 解析网页内容
      const result = await this.parser.processContent(processedUrl);
      if (!result) {
        await e.reply('网页内容解析失败，请稍后重试');
        return false;
      }

      // 准备回复消息
      const messages = [`标题：${result.title}\n\n`];
      
      // 如果有截图，保存并添加到消息中
      if (result.screenshot) {
        const screenshotPath = path.join(this.tempDir, `${Date.now()}.jpg`);
        fs.writeFileSync(screenshotPath, result.screenshot);
        messages.push(segment.image(screenshotPath));
        messages.push('\n\n');
      }
      
      const textContent = await YTOtherModels([{role: "user", content: "简要分析网页内容，不超过200字\n\n" + result.text}], "gpt-4o-mini");
      
      messages.push(`Ai简析：\n${textContent}`);
      
      // 发送消息
      await e.reply(messages);
      return true;
      
    } catch (error) {
      console.error('网页解析错误:', error);
      await e.reply(`网页解析出错：${error.message}`);
      return false;
    }
  }

  /**
   * 仅获取网页截图
   * @param {object} e - 消息事件对象
   * @returns {Promise<boolean>} - 是否处理成功
   */
  async screenshotWebpage(e) {
    // 获取URL
    const url = e.msg.replace(/^#?网页截图\s*/, '').trim();
    if (!url) {
      await e.reply('请提供要截图的网页链接');
      return false;
    }

    // 发送处理中提示
    await e.reply('正在获取网页截图，请稍候...');

    try {
      // 处理URL
      const processedUrl = await this.parser.processUrl(url);
      if (!processedUrl) {
        await e.reply('无效的网页链接，请检查后重试');
        return false;
      }

      // 解析网页内容
      const result = await this.parser.processContent(processedUrl);
      if (!result || !result.screenshot) {
        await e.reply('网页截图获取失败，请稍后重试');
        return false;
      }

      // 保存截图
      const screenshotPath = path.join(this.tempDir, `${Date.now()}.jpg`);
      fs.writeFileSync(screenshotPath, result.screenshot);
      
      // 发送截图和标题
      await e.reply([
        `标题：${result.title}\n`,
        segment.image(screenshotPath)
      ]);
      
      return true;
      
    } catch (error) {
      console.error('网页截图错误:', error);
      await e.reply(`网页截图出错：${error.message}`);
      return false;
    }
  }
}