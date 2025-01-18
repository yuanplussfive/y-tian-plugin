import { AbstractTool } from './AbstractTool.js';
import { YTalltools } from '../../utils/fileUtils.js';
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

      return (await response.text()).trim();
    } catch (error) {
      return null;
    }
  };

  /**
   * 执行自由搜索操作
   * @param {string} query - 搜索关键词
   * @returns {Promise<Array|null>} - 搜索结果列表或null
   */
  async freeSearch(query) {
    try {
      // 构建消息历史
      const messages = [{
        role: 'user',
        content: `搜索${query}\n
                直接把相关搜索结果总结给我`
      }];

      const primaryResult = await YTalltools(messages);
      const result = (primaryResult?.length >= 200) ? primaryResult : await this.FreeSearch(query);
      return result;

    } catch (error) {
      console.error('FreeSearch 错误:', error);
      return null;
    }
  }

  /**
   * 执行自由搜索操作
   * @param {Object} opts - 参数选项
   * @param {Object} e - 事件对象
   * @returns {Promise<string>} - 搜索结果或错误信息
   */
  async func(opts, e) {
    const { query } = opts;

    if (!query) {
      return '搜索关键词（query）是必填项。';
    }

    const result = await this.freeSearch(query);

    if (result) {
      return `搜索结果:\n${JSON.stringify(result, null, 2)}`;
    } else {
      return '搜索失败，请检查关键词或稍后再试。';
    }
  }
}