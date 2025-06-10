import { AbstractTool } from './AbstractTool.js';
import { YTOtherModels } from "../../utils/fileUtils.js";
import { TotalTokens } from "../../YTOpen-Ai/tools/CalculateToken.js";

/**
 * Search 工具类，用于自由搜索并控制返回结果的大小
 */
export class FreeSearchTool extends AbstractTool {
  constructor() {
    super();
    this.name = 'freeSearchTool';
    this.description = '请求外部 API 进行自由搜索，检索结果，对于需要进行搜索的时候使用';
    this.parameters = {
      type: "object",
      properties: {
        query: {
          type: 'string',
          description: '搜索的查询关键词'
        }
      },
      required: ['query']
    };
    
    // 固定最大 token 数量为 30000
    this.maxTokens = 30000;
  }

  /**
   * 截断文本以控制 token 数量
   * @param {string} text - 需要截断的文本
   * @returns {Promise<string>} 截断后的文本
   */
  async truncateText(text) {
    if (!text) return '未找到相关搜索结果';
    
    const tokens = await TotalTokens(text);
    
    if (tokens.completion_tokens <= this.maxTokens) {
      return text;
    }
    
    // 如果超出限制，按比例截断文本
    const ratio = this.maxTokens / tokens.completion_tokens;
    const truncatedLength = Math.floor(text.length * ratio);
    const truncated = text.substring(0, truncatedLength);
    
    return `${truncated}\n\n[注意：结果已截断，显示内容已达到长度限制]`;
  }

  /**
   * 将各种格式的结果转换为字符串
   * @param {any} result - 任意类型的结果
   * @returns {string} 转换后的字符串
   */
  resultToString(result) {
    if (typeof result === 'string') {
      return result;
    }
    
    if (result === null || result === undefined) {
      return '未找到相关搜索结果';
    }

    if (typeof result === 'object') {
      // 处理常见的结果格式
      if (result.content) {
        return String(result.content);
      }
      if (result.results && Array.isArray(result.results)) {
        return result.results.map((item, index) => {
          if (typeof item === 'string') {
            return `${index + 1}. ${item}`;
          }
          if (item.title && item.content) {
            return `${index + 1}. ${item.title}\n${item.content}`;
          }
          return `${index + 1}. ${JSON.stringify(item)}`;
        }).join('\n\n');
      }
      if (result.message) {
        return String(result.message);
      }
    }
    
    // 最后的兜底方案
    try {
      return JSON.stringify(result, null, 2);
    } catch {
      return String(result);
    }
  }

  /**
   * 处理搜索操作并返回字符串结果
   * @param {Object} opts - 参数选项
   * @param {Object} e - 事件对象
   * @returns {Promise<string>} 字符串形式的搜索结果
   */
  async func(opts, e) {
    const { query } = opts;

    if (!query?.trim()) {
      return '搜索失败：搜索关键词不能为空';
    }

    try {
      const result = await YTOtherModels([{ role: "user", content: query }], 'llm-search');
      
      if (!result) {
        return '搜索失败：未获取到搜索结果，请稍后重试';
      }
      
      // 将结果转换为字符串
      const stringResult = this.resultToString(result);
      
      // 截断控制 token 数量
      return await this.truncateText(stringResult);
      
    } catch (error) {
      console.error('搜索过程发生错误:', error);
      return `搜索失败：${error.message || '发生未知错误'}`;
    }
  }
}