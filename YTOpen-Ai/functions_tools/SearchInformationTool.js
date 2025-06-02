import { AbstractTool } from './AbstractTool.js';
import { YTOtherModels } from "../../utils/fileUtils.js";

/**
 * Search 工具类，用于自由搜索
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
  }

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

    const result = await YTOtherModels([{ role: "user", content: query }], 'llm-search');

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