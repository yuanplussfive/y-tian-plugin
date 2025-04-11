import { AbstractTool } from './AbstractTool.js';
import { YTOtherModels, get_address } from '../../utils/fileUtils.js';

/**
* 多模型AI绘图工具类
*/
export class FluxTool extends AbstractTool {
  constructor() {
    super();
    this.name = 'fluxTool';
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
    let imageUrls = [];

    if (!prompt) {
      return "错误：绘图提示词（prompt）不能为空。";
    }

    try {
      const imageArray = await YTOtherModels([{ role: "user", content: prompt }], "flux-sch");

      console.log(imageArray)
      if (!imageArray) {
        return "错误：生成失败，服务器无响应，请稍后再试。";
      } else {
        imageUrls = await get_address(imageArray);
        if (imageUrls && imageUrls.length > 0) {
          const images = imageUrls.map(imgurl => segment.image(imgurl.trim()));
          await e.reply(images); // 发送图片
          return `绘图提示词：${prompt}，成功了，我已生成并发送图片到群里了，图片在线链接: ${imageUrls[0]}`;
        } else {
          return "绘图生成失败了，可能负载过高或提示词违规，请稍后再试。";
        }
      }
    } catch (error) {
      console.log('其他模型处理错误:', error);
      return "绘图生成失败了，可能负载过高或提示词违规，请稍后再试。";
    }
  }
}