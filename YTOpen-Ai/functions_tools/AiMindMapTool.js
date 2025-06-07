
import { AbstractTool } from './AbstractTool.js';
import { YTOtherModels } from '../../utils/fileUtils.js';
import puppeteer from 'puppeteer';
import { Transformer } from 'markmap-lib';

/**
 * AI图表生成工具类，专注于生成Markmap格式的思维导图
 */
export class AiMindMapTool extends AbstractTool {
  constructor() {
    super();
    this.name = 'aiMindMapTool';
    this.description = '基于描述生成Markmap格式的思维导图';

    // 参数定义
    this.parameters = {
      type: "object",
      properties: {
        prompt: {
          type: 'string',
          description: '思维导图内容描述',
          minLength: 1,
          maxLength: 4000
        },
        width: {
          type: 'number',
          description: '输出图片宽度',
          default: 2400
        },
        height: {
          type: 'number',
          description: '输出图片高度',
          default: 1600
        },
        waitTime: {
          type: 'number',
          description: '渲染等待时间（毫秒）',
          default: 5000 // Increased default wait time to ensure rendering
        }
      },
      required: ['prompt'],
      additionalProperties: false
    };
  }

  /**
   * 生成系统提示词
   * @param {Object} opts - 用户选项
   * @returns {string} - 系统提示词
   */
  generateSystemPrompt(opts) {
    return `你是一个专业的思维导图生成助手。请根据用户的描述生成符合Markdown语法的思维导图代码。
要求：
1. 只输出Markdown代码，不要其他解释或代码块标记
2. 确保语法正确，适合Markmap渲染
3. 使用#表示主节点，##表示一级子节点，###表示二级子节点，以此类推
4. 合理组织层级结构，最多5级
5. 使用简洁清晰的描述
6. 避免非Markdown内容（如HTML标签或其他格式）
7. 确保每个节点有清晰的标题`;
  }

  /**
   * 验证Markdown内容是否有效
   * @param {string} markdown - Markdown内容
   * @returns {boolean} - 是否有效
   */
  validateMarkdown(markdown) {
    const lines = markdown.split('\n').map(line => line.trim());
    return lines.some(line => line.startsWith('#')) && lines.every(line => !line.includes('```'));
  }

  /**
   * 执行思维导图生成操作
   * @param {Object} opts - 参数选项
   * @param {Object} e - 事件对象
   * @returns {Promise<string>} - 执行结果
   */
  async func(opts, e) {
    const { prompt, width = 2400, height = 1600, waitTime = 8000 } = opts;

    if (!prompt) {
      return '思维导图描述内容不能为空';
    }

    try {
      // 构建消息历史
      const messages = [
        {
          role: 'system',
          content: this.generateSystemPrompt(opts)
        },
        {
          role: 'user',
          content: `请根据以下描述生成思维导图：${prompt}`
        }
      ];

      const markdownContent = await YTOtherModels(messages, "gemini-2.0-flash");

      if (!markdownContent) {
        console.error('API返回空内容');
        return '生成失败，请检查输入或稍后重试';
      }

      if (!this.validateMarkdown(markdownContent)) {
        console.error('无效的Markdown内容:', markdownContent);
        return '生成失败：Markdown内容无效，请确保包含正确的标题层级';
      }

      console.log('生成的Markdown代码:', markdownContent);

      // 转换 Markdown 为 markmap 数据
      const transformer = new Transformer();
      const { root } = transformer.transform(markdownContent);
      const data = JSON.stringify(root, null, 2);
      console.log('转换后的Markmap数据:', data);

      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();

      await page.setViewport({ width, height });

      page.on('console', msg => console.log('页面控制台:', msg.text()));
      page.on('pageerror', err => console.error('页面错误:', err));

      // 创建 HTML 页面，确保SVG渲染
      await page.setContent(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.jsdelivr.net/npm/d3@6"></script>
          <script src="https://cdn.jsdelivr.net/npm/markmap-view@0.18.10"></script>
          <style>
            body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
            #markmap { width: 100%; height: 100%; }
          </style>
        </head>
        <body>
          <svg id="markmap" width="${width}" height="${height}"></svg>
          <script>
            const { Markmap } = window.markmap;
            const svg = document.getElementById('markmap');
            const mm = Markmap.create(svg, null, ${data});
            setTimeout(() => {
              mm.fit();
              console.log('Markmap渲染完成');
            }, 100);
          </script>
        </body>
        </html>
      `, { waitUntil: 'networkidle0' });
      // 等待渲染完成
      await page.waitForFunction('document.querySelector("#markmap").children.length > 0', { timeout: waitTime });
      console.log('SVG元素已渲染');

      // 截图保存为PNG
      const outputPath = './resources/markmap-output.png';
      await page.screenshot({ path: outputPath, fullPage: true, type: 'png' });

      await browser.close();
      console.log(`Markmap 图片已生成到 ${outputPath}`);

      // 发送图片
      e.reply(segment.image(outputPath));

      return `Markmap 图片已生成, 我已经发到群聊了`;

    } catch (error) {
      console.error('思维导图生成错误:', error);
      return `生成失败: ${error.message}`;
    }
  }
}