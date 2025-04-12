import { AbstractTool } from './AbstractTool.js';
import { YTOtherModels, get_address } from '../../utils/fileUtils.js';

/**
* 多模型AI绘图工具类
*/
export class DalleTool extends AbstractTool {
  constructor() {
    super();
    this.name = 'dalleTool';
    this.description = '根据提示词生成图片, 使用dalle(OpenAi团队)模型进行绘图';
    this.parameters = {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: '绘图的描述提示词',
          minLength: 1,
          maxLength: 4000
        },
        model: {
          type: 'string',
          description: '使用的模型名称',
          enum: [
            'dall-e-3', 'jimeng-2.1',
            'pix', 'sdxl', 'sd35', 'sd3', 'play3', 'gen3', 'play'
          ],
          default: 'dall-e-3'
        },
        size: {
          type: 'string',
          description: '生成图片的尺寸',
          enum: ['1792x1024', '1024x1792', '1024x1024'],
          default: '1792x1024'
        }
      },
      required: ['prompt', 'size'],
      additionalProperties: false
    };
  }

  /**
   * 执行绘图操作
   */
  async func(opts, e) {
    const { prompt, size } = opts;
    let imageUrls = [];

    if (!prompt) {
      return "错误：绘图提示词（prompt）不能为空。";
    }

    try {
      const imageArray = await YTOtherModels([{
        role: 'user',
        content: `你需要根据我的要求生成一个图片。
                  要求按照：${prompt}\n
                  尺寸：${size}\n
                  直接把图片发给我`
      }], "gpt-4o-all");

      console.log(imageArray)
      if (!imageArray) {
        return "错误：生成失败，服务器无响应，请稍后再试。";
      } else {
        imageUrls = await get_address(imageArray);
        if (imageUrls && imageUrls.length > 0) {
          const images = imageUrls.map(imgurl => segment.image(imgurl.trim()));
          await e.reply(images); // 发送图片
          return `好的，${prompt}，成功了，我已生成并发送图片到群里了`;
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