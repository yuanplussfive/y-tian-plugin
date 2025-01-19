import { AbstractTool } from './AbstractTool.js';
import fetch from 'node-fetch';

/**
 * Search 工具类，用于自由搜索
 */
export class FreeSearchTool extends AbstractTool {
  constructor() {
    super();
    this.name = 'freeSearchTool';
    this.description = '请求外部 API 进行自由搜索';
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
  }

  async FreeSearch(query) {
    const url = 'https://yuanpluss.online:3000/api/v1/search';
    const data = { messages: [{ role: "user", content: query }], stream: false };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      return null;
    }
  };

  /**
   * 处理搜索操作并返回结构化结果
   * @param {Object} opts - 参数选项
   * @param {Object} e - 事件对象
   * @returns {Promise<Object>} 结构化的搜索结果或错误对象
   */
  async func(opts, e) {
    const { query } = opts;

    if (!query?.trim()) {
      return {
        status: 'error',
        code: 400,
        message: '搜索关键词不能为空'
      };
    }

    const result = await this.FreeSearch(query);

    console.log(result);
    if (!result) {
      return {
        status: 'error',
        code: 500,
        message: '搜索失败，请稍后重试'
      };
    }

    return result;
  }
}