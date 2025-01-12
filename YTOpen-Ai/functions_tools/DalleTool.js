import { AbstractTool } from './AbstractTool.js';
import { YTalltools, get_address } from '../../utils/fileUtils.js';
import fetch from 'node-fetch';

/**
 * DALL·E 绘图工具类，用于根据提示词生成图片
 */
export class DalleTool extends AbstractTool {
  constructor() {
    super();
    this.name = 'dalleTool';
    this.description = '根据提示词生成图片';
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
          enum: ['dall-e-2', 'dall-e-3'],
          default: 'dall-e-3'
        },
        size: {
          type: 'string',
          description: '生成图片的尺寸',
          enum: ['1792x1024', '1024x1792', '1024x1024'],
          default: '1792x1024'
        }
      },
      required: ['prompt'],
      additionalProperties: false
    };
  }

  /**
   * 绘图请求函数
   * @param {string} prompt - 绘图的描述提示词
   * @param {string} model - 使用的模型名称
   * @returns {Promise<string|null>} - 返回图片链接或null
   */
  async dalle(prompt, model = 'dall-e-3') {
    try {
      const url = 'https://yuanpluss.online:3000/v1/images/generations';
      const data = {
        prompt,
        model: 'dall-e-3',
        stream: false,
        n: 1,
        size: '1792x1024',
        quality: 'hd'
      };
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      console.log(response.ok);
      if (!response.ok) {
        return null;
      }
      const responseData = await response.text();
      if (responseData && responseData.length > 0) {
        return responseData.trim();
      }
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  /**
   * 执行绘图操作
   * @param {Object} opts - 参数选项
   * @param {Object} e - 事件对象
   * @returns {Promise<Object|string>} - 图片链接和提示词或错误信息
   */
  async func(opts, e) {
    let { prompt, model = 'dall-e-3', size } = opts;

    if (!prompt) {
      return '绘图描述提示词（prompt）是必填项。';
    }

    // 构建消息历史
    const messages = [{
      role: 'user',
      content: `你需要根据我的要求生成一个图片。
                       要求按照：${prompt}\n
                       尺寸：${size ? size : '1792x1024'}\n
                       直接把图片发给我`
    }];

    const response = await YTalltools(messages);
    let imageUrl;

    if (response) {
      const links = await get_address(response);
      imageUrl = links.length > 0 ? links[0] : null;
    }

    if (!imageUrl) {
      imageUrl = await this.dalle(prompt, model);
    }

    if (imageUrl) {
      return {
        imageUrl,
        prompt
      };

    } else {
      return '绘图失败，请检查提示词或稍后再试。';
    }
  }
}