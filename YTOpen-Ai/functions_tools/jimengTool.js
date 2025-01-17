import { AbstractTool } from './AbstractTool.js';
import { dependencies } from '../../YTdependence/dependencies.js';
const { fs, path, fetch, YAML } = dependencies;

/**
 * 多模型AI绘图工具类
 */
export class JimengTool extends AbstractTool {
  constructor() {
    super();
    this.name = 'jimengTool';
    this.description = '根据提示词生成图片, 使用jimeng(即梦)模型进行绘图';
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
   * jimeng API调用函数
   * @param {string} prompt - 绘图的描述提示词
   * @returns {Promise<string|null>} - 返回图片链接或null
   */
  async JimengProxy(prompt) {
    try {
      const configPath = path.join(process.cwd(), 'plugins/y-tian-plugin/config/message.yaml')

      let Authorization = null
      try {
        if (fs.existsSync(configPath)) {
          const file = fs.readFileSync(configPath, 'utf8')
          const config = YAML.parse(file)
          Authorization = config.pluginSettings?.jimengsessionid;
        }
      } catch(err) { 
        console.log(err);
      }

      const url = 'https://yuanpluss.online:3000/v1/images/jimeng/generations';
      const data = {
        prompt,
        quality: 'best'
      };
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': Authorization
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        return null;
      }
      const responseData = await response.text();
      return responseData && responseData.length > 0 ? responseData.trim() : null;
    } catch (error) {
      console.log('JimengProxy API错误:', error);
      return null;
    }
  }

  /**
 * 从文本中提取图片链接
 * @param {string} text - 包含图片链接的文本
 * @returns {string[]} - 提取的图片链接数组
 */
  async extractImageUrls(text) {
    if (!text) return [];

    // 匹配 ![image_x](url) 格式的图片链接
    const regex = /!\[.*?\]\((.*?)\)/g;
    const matches = [...text.matchAll(regex)];

    // 提取所有URL并返回数组
    return matches.map(match => match[1]);
  }

  /**
   * 执行绘图操作
   */
  async func(opts, e) {
    const { prompt } = opts;

    if (!prompt) {
      return '绘图描述提示词（prompt）是必填项。';
    }

    try {
      const imageArray = await this.JimengProxy(prompt);

      console.log(imageArray)
      if (imageArray.includes("提示词违规")) {
        return '生成失败了，大概率提示词违规，请修改提示词稍后尝试';
      }

      const urls = await this.extractImageUrls(imageArray);
      if (urls && urls.length > 0) {
        const images = urls.map(imgurl => segment.image(imgurl.trim()));
        await e.reply(images);
        return {
          imageUrl: urls,
          prompt
        };
      } else {
        return '生成失败了，可能负载过高，请稍后再试！';
      }
    } catch (error) {
      console.log('其他模型处理错误:', error);
      return '生成失败了，可能负载过高，请稍后再试！';
    }
  }
}