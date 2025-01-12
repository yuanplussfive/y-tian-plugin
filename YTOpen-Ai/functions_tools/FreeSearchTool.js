import { AbstractTool } from './AbstractTool.js';
import searchClient from '../tools/SearchClient.js';

/**
 * FreeSearch 工具类，用于请求外部 API 进行自由搜索
 */
export class FreeSearchTool extends AbstractTool {
  constructor() {
    super();
    this.name = 'FreeSearch';
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

  /**
   * 执行自由搜索操作
   * @param {string} query - 搜索关键词
   * @returns {Promise<Array|null>} - 搜索结果列表或null
   */
  async freeSearch(query) {
    try {
      const result = await searchClient.search(query);
      console.log('第一层结果:', result);

      const finalList = await result.list;
      console.log('解析后的list:', finalList); // 看看最终解析的数据

      return finalList;

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