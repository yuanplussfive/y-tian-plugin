import { AbstractTool } from './AbstractTool.js';
import { YTalltools, get_address, chunk, downloadAndSaveFile, removeDuplicates } from '../../utils/fileUtils.js';

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
      const fileResult = await YTalltools(messages);
      
      if (!fileResult) {
        return '多模态请求失败，请检查提示词或稍后再试';
      }

      const links = await Promise.resolve(fileResult)
        .then(get_address)
        .then(links => links?.length ? removeDuplicates(links) : [])
        .catch(error => {
          console.error('链接处理错误:', error);
          return [];
        });

      if (!links.length) {
        return '未能获取到有效的文件链接';
      }

      // 并发下载文件
      const CONCURRENT_LIMIT = 3;
      const chunkedLinks = chunk(links, CONCURRENT_LIMIT);
      const downloadResults = [];

      for (const linkGroup of chunkedLinks) {
        const results = await Promise.allSettled(
          linkGroup.map(url =>
            downloadAndSaveFile(url, fileName, e)
          )
        );
        downloadResults.push(...results);
      }

      // 处理下载结果
      const successCount = downloadResults.filter(r => 
        r.status === 'fulfilled' && r.value?.success
      ).length;

      if (successCount > 0) {
        return `文件制作成功！已保存并发送 ${successCount} 个文件。详情: ${fileResult}`;
      } else {
        return `文件处理失败，请检查文件格式或重试。详情: ${fileResult}`;
      }

    } catch (error) {
      console.error('文件制作过程发生错误:', error);
      return `文件制作失败: ${error.message}`;
    }
  }
}