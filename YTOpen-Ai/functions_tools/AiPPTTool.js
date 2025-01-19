import { AbstractTool } from './AbstractTool.js';
import { get_address, downloadAndSaveFile } from '../../utils/fileUtils.js';
import { dependencies } from '../../YTdependence/dependencies.js';
const { fs, _path, fetch } = dependencies;

/**
 * PPT制作工具类，用于根据用户的prompt制作演示文稿
 */
export class AiPPTTool extends AbstractTool {
  constructor() {
    super();
    this.name = 'aiPPTTool';
    this.description = '根据用户的描述生成PPT演示文稿。生成文件时必须指定文件名，文件格式为.pptx';
    this.parameters = {
      type: "object",
      properties: {
        prompt: {
          type: 'string',
          description: 'PPT内容的描述提示词',
          minLength: 1,
          maxLength: 4000
        },
        fileName: {
          type: 'string',
          description: 'PPT文件名称，需包含扩展名(.pptx)',
        }
      },
      required: ['prompt', 'fileName'],
      additionalProperties: false
    };
  }

  async PPTtools(messages) {
    const dirpath = `${_path}/data/YTotherai`;
    const dataPath = dirpath + "/data.json";
    const data = JSON.parse(await fs.promises.readFile(dataPath, "utf-8"));
    const token = data.chatgpt.stoken;
    try {
      const url = 'https://yuanpluss.online:3000/api/v1/chat/completions';
      const data = {
        model: 'generate-pptx',
        messages
      };
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      //console.log(response.ok)
      const responseData = await response.json();
      if (responseData.error) {
        return responseData.error;
      }
      console.log(responseData);
      return responseData?.choices[0]?.message?.content;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  /**
   * 执行PPT制作操作
   * @param {Object} opts - 参数选项
   * @param {Object} e - 事件对象
   * @returns {Promise<string|Object>} - PPT文件链接或错误信息
   */
  async func(opts, e) {
    let { prompt, fileName } = opts;

    if (!prompt) {
      return 'PPT内容描述提示词（prompt）是必填项。';
    }

    if (!fileName.toLowerCase().endsWith('.pptx')) {
      fileName += '.pptx';
    }

    const messages = [{
      role: 'user',
      content: prompt
    }];

    try {
      const fileResult = await this.PPTtools(messages);

      if (!fileResult) {
        return 'PPT生成请求失败，请检查提示词或稍后重试';
      }

      const link = await Promise.resolve(fileResult)
        .then(get_address)
        .then(links => {
          if (!links?.length) return null;
          return links.find(url => url.toLowerCase().includes('.pptx')) || links[0];
        })
        .catch(error => {
          console.error('PPT链接处理错误:', error);
          return null;
        });

      if (!link) {
        return '未能获取到有效的PPT文件链接';
      }

      // 简化为单个文件下载
      try {
        const downloadResult = await downloadAndSaveFile(link, fileName, e);

        if (downloadResult?.success) {
          return `PPT制作成功！文件已保存并发送。详情: ${fileResult}`;
        } else {
          return `PPT处理失败，请检查文件格式或重试。详情: ${fileResult}`;
        }
      } catch (error) {
        console.error('文件下载失败:', error);
        return `文件下载失败: ${error.message}`;
      }

    } catch (error) {
      console.error('PPT制作过程发生错误:', error);
      return `PPT制作失败: ${error.message}`;
    }
  }
}