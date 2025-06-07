import { AbstractTool } from './AbstractTool.js';
import { YTOtherModels, get_address, downloadAndSaveFile, removeDuplicates } from '../../utils/fileUtils.js';

/**
 * 文件制作工具类，用于根据用户的prompt制作各种文件（如doc、excel、pdf等）
 */
export class AiALLTool extends AbstractTool {
  constructor() {
    super();
    this.name = 'aiALLTool';
    this.description = '根据用户的描述进行多模态请求，生成各种文件（如doc、excel、pdf等）。生成文件时必须指定文件名和格式, 但是不能生成图片形式的文件';
    this.parameters = {
      type: "object",
      properties: {
        prompt: {
          type: 'string',
          description: '多模态文件请求的描述提示词',
          minLength: 1,
          maxLength: 4000
        },
        fileName: {
          type: 'string',
          description: '生成文件的名称，需包含文件扩展名（如：.docx、.xlsx、.pdf、.js、.go、.py）等等',
        }
      },
      required: ['prompt', 'fileName'],
      additionalProperties: false
    };
  }

  /**
   * 执行文件制作操作
   * @param {Object} opts - 参数选项
   * @param {Object} e - 事件对象
   * @returns {Promise<string|Object>} - 文件链接或错误信息
   */
  async func(opts, e) {
    let { prompt, fileName } = opts;

    if (!prompt) {
      return '文件制作描述提示词（prompt）是必填项。';
    }

    // 构建消息历史
    const messages = [{
      role: 'user',
      content: `你需要根据用户的要求生成一个${fileName || 'docx'}文件。
               要求按照：${prompt}\n
               生成文件，直接把最终的文件发给我, 不要单纯的文本内容，把生成的文件链接给我`
    }];

    try {
      const fileResult = await YTOtherModels(messages, "gpt-4o-plugins");

      if (!fileResult) {
        return '文件生成请求失败，请检查提示词或稍后再试';
      }

      let links = await get_address(fileResult);
      if (links?.length > 0) {
        console.log(links)
        try {
          links = await removeDuplicates(links);
        } catch (error) {
          return `文件处理失败，请检查文件格式或重试。详情: ${error.message}`;
        }
        links.forEach(async (url) => {
          await downloadAndSaveFile(url, fileName, e);
        });
        return `文件制作成功！我已经成功保存保存并发送到群里面了。请查收`;
      }

    } catch (error) {
      console.error('文件制作过程发生错误:', error);
      return `文件制作失败: ${error.message}`;
    }
  }
}