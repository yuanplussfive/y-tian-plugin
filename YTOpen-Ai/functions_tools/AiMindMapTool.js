import { AbstractTool } from './AbstractTool.js';
import { YTalltools } from '../../utils/fileUtils.js';
import { dependencies } from '../../YTdependence/dependencies.js';
const { extractAndRender } = dependencies;
import { YTapi } from '../../utils/apiClient.js';

/**
 * AI图表生成工具类，支持多种Mermaid.js图表格式
 */
export class AiMindMapTool extends AbstractTool {
  constructor() {
    super();
    this.name = 'aiMindMapTool';
    this.description = '基于描述生成多种类型的图表，支持思维导图、流程图、饼图、时序图等';

    // 定义支持的图表类型
    this.chartTypes = {
      mindmap: '思维导图',
      flowchart: '流程图',
      pie: '饼状图',
      sequence: '时序图',
      gantt: '甘特图',
      classDiagram: '类图',
      stateDiagram: '状态图'
    };

    // 定义图表主题样式
    this.themes = {
      default: {
        fontFamily: 'arial',
        fontSize: '14px',
        lineColor: '#333333',
        background: '#ffffff'
      },
      dark: {
        fontFamily: 'arial',
        fontSize: '14px',
        lineColor: '#ffffff',
        background: '#333333'
      },
      forest: {
        fontFamily: 'arial',
        fontSize: '14px',
        lineColor: '#1b512d',
        background: '#e6f3e9'
      }
    };

    // 参数定义
    this.parameters = {
      type: "object",
      properties: {
        prompt: {
          type: 'string',
          description: '图表内容描述',
          minLength: 1,
          maxLength: 4000
        },
        chartType: {
          type: 'string',
          description: '图表类型',
          enum: Object.keys(this.chartTypes),
          default: 'mindmap'
        },
        direction: {
          type: 'string',
          description: '图表方向（适用于思维导图和流程图）',
          enum: ['TB', 'BT', 'LR', 'RL'],
          default: 'TB'
        },
        theme: {
          type: 'string',
          description: '图表主题',
          enum: Object.keys(this.themes),
          default: 'default'
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
    // 基础提示词
    const basePrompt = `你是一个专业的图表生成助手。请根据用户的描述生成符合Mermaid.js语法的图表代码。
要求：
1. 只输出Mermaid代码，不要其他解释
2. 确保语法正确可渲染
3. 使用简洁清晰的布局
4. 适当使用颜色和样式增强可读性
5. 对于时序图和类图，文本换行使用<br>，其他图表使用\\n`;

    // 针对不同图表类型的特定提示词
    const typeSpecificPrompts = {
      mindmap: `
- 使用mindmap语法
- 合理组织层级结构
- 使用不同层级的缩进表示关系`,

      flowchart: `
- 使用flowchart ${opts.direction} 语法
- 使用适当的节点形状表示不同类型的步骤
- 使用清晰的箭头指示流程方向
- 可以使用subgraph表示分组`,

      pie: `
- 使用pie语法
- 确保各个部分的占比合理
- 使用title定义图表标题
- 可以使用showData显示具体数值`,

      sequence: `
- 使用sequenceDiagram语法
- 清晰展示参与者之间的交互
- 使用不同类型的箭头表示不同的消息类型
- 使用<br>实现文本换行
- 可以使用loop、alt等组合语句`,

      gantt: `
- 使用gantt语法
- 合理设置日期格式
- 使用section进行任务分组
- 标注关键里程碑`,

      classDiagram: `
- 使用classDiagram语法
- 清晰展示类的属性和方法
- 正确使用关系连接符
- 使用<br>实现文本换行
- 可以使用note添加说明`,

      stateDiagram: `
- 使用stateDiagram-v2语法
- 清晰展示状态转换关系
- 使用[*]表示开始和结束状态
- 可以使用state表示嵌套关系`
    };

    return `${basePrompt}\n${typeSpecificPrompts[opts.chartType] || ''}`;
  }

  /**
   * 生成图表样式配置
   * @param {string} theme - 主题名称
   * @returns {string} - Mermaid样式配置代码
   */
  generateThemeConfig(theme) {
    // 移除主题配置，因为某些版本可能不支持
    return '';
  }

  /**
   * 处理文本中的换行符，针对不同图表类型使用不同的处理方式
   * @param {string} text - 需要处理的文本
   * @param {string} chartType - 图表类型
   * @returns {string} - 处理后的文本
   */
  processLineBreaks(text, chartType) {
    if (chartType === 'sequence' || chartType === 'classDiagram') {
      // 对于时序图和类图，将换行替换为 <br>
      return text.replace(/\\n/g, '<br>');
    } else {
      // 其他图表类型使用普通换行符
      return text.replace(/\\n/g, '\n');
    }
  }

  /**
   * 执行图表生成操作
   * @param {Object} opts - 参数选项
   * @param {Object} e - 事件对象
   * @returns {Promise<string>} - 执行结果
   */
  async func(opts, e) {
    const { prompt, chartType = 'mindmap', direction = 'TB', theme = 'default' } = opts;

    if (!prompt) {
      return '图表描述内容不能为空';
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
          content: `请根据以下描述生成图表：${prompt}`
        }
      ];

      // 构建请求体
      const requestData = {
        model: 'gpt-4o-fc',
        messages,
        temperature: 0,
        top_p: 0.1,
        frequency_penalty: 0.8,
        presence_penalty: 0.2
      };

      const output = await YTapi(requestData, { providers: 'OpenAI' });

      const result = output?.choices[0]?.message?.content;
      if (!result) {
        return '生成失败，请检查输入或稍后重试';
      }

      // 提取Mermaid代码
      let mermaidCode = this.extractMermaidCode(result);

      if (!mermaidCode) {
        return '未能生成有效的Mermaid代码';
      }

      // 处理换行符，传入图表类型
      mermaidCode = this.processLineBreaks(mermaidCode, chartType);

      console.log('生成的Mermaid代码:', mermaidCode);

      // 渲染图表
      const results = await extractAndRender(`\`\`\`mermaid\n${mermaidCode}\n\`\`\``, {
        outputDir: './resources',
        backgroundColor: this.themes[theme].background
      });

      // 发送图片
      results.forEach(result => {
        e.reply(segment.image(result.outputPath));
      });

      return prompt;

    } catch (error) {
      console.error('图表生成错误:', error);
      return `生成失败: ${error.message}`;
    }
  }

  /**
   * 从返回结果中提取Mermaid代码
   * @param {string} text - API返回的文本
   * @returns {string} - 提取的Mermaid代码
   */
  extractMermaidCode(text) {
    const mermaidMatch = text.match(/```(?:mermaid)?\s*([\s\S]*?)```/);
    if (mermaidMatch) {
      return mermaidMatch[1].trim();
    }
    return text.trim();
  }
}