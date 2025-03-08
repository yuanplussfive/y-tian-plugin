import { AbstractTool } from './AbstractTool.js';
import { YTOtherModels, get_address } from '../../utils/fileUtils.js';

/**
* 多模型AI绘图工具类
*/
export class RecraftTool extends AbstractTool {
  constructor() {
    super();
    this.name = 'recraftTool';
    this.description = '根据提示词生成图片, 使用flux(黑森林实验室)模型进行绘图';
    this.parameters = {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: '绘图的描述提示词',
          minLength: 1,
          maxLength: 4000
        }
      },
      required: ['prompt'],
      additionalProperties: false
    };
  }

  /**
   * 执行绘图操作
   */
  async func(opts, e) {
    const { prompt } = opts;
    let success = false; // 初始设置为失败
    let imageUrls = [];
    let message = '';

    if (!prompt) {
      message = '绘图描述提示词（prompt）是必填项。';
      return {
        success: false,
        message: message,
        imageUrls: [],
        prompt: prompt || null
      };
    }

    try {
      const imageArray = await YTOtherModels([{ role: "user", content: prompt }], "recraft-v3");

      console.log(imageArray)
      if (!imageArray) {
        message = '生成失败了，可能服务器无响应，请稍后再试！';
      } else if (imageArray.includes("提示词违规")) {
        message = '生成失败了，大概率提示词违规，无法发送，请修改提示词稍后尝试';
      } else {
        imageUrls = await get_address(imageArray);
        if (imageUrls && imageUrls.length > 0) {
          success = true; // 成功生成图片
          message = '图片生成成功，我已经发送图片给你了';
          const images = imageUrls.map(imgurl => segment.image(imgurl.trim()));
          await e.reply(images); // 发送图片
        } else {
          message = '生成失败了，没有提取到图片链接，无法发送，请稍后再试！';
        }
      }
    } catch (error) {
      console.log('其他模型处理错误:', error);
      message = '生成失败了，可能负载过高，请稍后再试！无法发送';
    }

    return {
      success: success,
      result: message,
      imageUrls: imageUrls,
      prompt: prompt
    };
  }
}