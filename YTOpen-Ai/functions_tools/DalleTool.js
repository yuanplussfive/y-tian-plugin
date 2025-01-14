import { AbstractTool } from './AbstractTool.js';
import { YTalltools, get_address } from '../../utils/fileUtils.js';
import { dependencies } from '../../YTdependence/dependencies.js';
const { fs, _path, fetch } = dependencies;

/**
 * 多模型AI绘图工具类
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
      required: ['prompt'],
      additionalProperties: false
    };

    // Zaiwen 平台模型映射
    this.zaiwenModels = {
      'pix': "poe_model_pixart",
      'sdxl': "poe_model_stablediffusionxl",
      'sd35': "poe_model_stablediffusion35t",
      'sd3': "poe_model_fluxdev",
      'play3': "poe_model_playgroundv3.0",
      'gen3': "poe_model_imagen3fast",
      'play': "poe_model_playgroundv2.5"
    };
  }

  /**
   * DALL-E API调用函数
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

      if (!response.ok) {
        return null;
      }
      const responseData = await response.text();
      return responseData && responseData.length > 0 ? responseData.trim() : null;
    } catch (error) {
      console.log('DALL-E API错误:', error);
      return null;
    }
  }

  /**
   * YT API调用函数
   * @param {Array} messages - 消息数组
   * @param {string} model - 模型名称
   * @returns {Promise<string|null>} - 返回API响应内容
   */
  async YTapi(messages, model) {
    try {
      const dirpath = `${_path}/data/YTotherai`;
      const dataPath = dirpath + "/data.json";
      const data = JSON.parse(await fs.promises.readFile(dataPath, "utf-8"));
      const token = data.chatgpt.stoken;

      const url = 'https://yuanpluss.online:3000/api/v1/chat/completions';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ model, messages })
      });

      const responseData = await response.json();
      if (responseData.error) {
        return responseData.error;
      }
      return responseData?.choices[0]?.message?.content;
    } catch (error) {
      console.log('YT API错误:', error);
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
   * 处理其他模型的绘图请求
   * @param {string} prompt - 绘图提示词
   * @param {string} model - 模型名称
   * @param {Object} e - 事件对象
   * @returns {Promise<boolean>} - 处理结果
   */
  async handleOtherModels(prompt, model, e) {
    try {
      const imageArray = await this.YTapi([{ role: 'user', content: prompt }], model);

      if (imageArray.includes("提示词违规")) {
        return e.reply('生成失败了，大概率提示词违规，请修改提示词稍后尝试');
      }

      const urls = await get_address(response);
      if (urls && urls.length > 0) {
        const images = urls.map(imgurl => segment.image(imgurl.trim()));
        await e.reply(images);
        return urls;
      } else {
        return e.reply('生成失败了，可能负载过高，请稍后再试！');
      }
    } catch (error) {
      console.log('其他模型处理错误:', error);
      return e.reply('生成失败了，可能负载过高，请稍后再试！');
    }
  }

  /**
     * Zaiwen 平台图片生成
     */
  async zaiwenDraw(prompt, model, size) {
    // 转换尺寸为比例
    const ratioMap = {
      '1792x1024': '16:9',
      '1024x1792': '9:16',
      '1024x1024': '1:1'
    };
    const ratio = ratioMap[size] || '16:9';

    const modelName = this.zaiwenModels[model];
    if (!modelName) return null;

    try {
      const imageUrl = await this.zaiwen_drawing(modelName, prompt, ratio);
      return imageUrl;
    } catch (error) {
      console.log('Zaiwen API错误:', error);
      return null;
    }
  }

  async sendImageTask(model, prompt, ratio) {
    const url = 'https://aliyun.zaiwen.top/draw/mj/imagine';
    const options = {
      method: 'POST',
      headers: {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
        'access-control-allow-origin': '*',
        'content-type': 'application/json',
        'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Microsoft Edge";v="128"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'Referer': 'https://zaiwen.xueban.org.cn/',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      },
      body: JSON.stringify({
        model_name: model,
        prompt: prompt,
        ratio: ratio,
        seed: Math.floor(Math.random() * 10000000000)
      })
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      if (result.status && result.status.code === 0) {
        return result?.info?.task_id;
      } else {
        console.error('Failed to add task:', result.status ? result.status.msg : 'Unknown error');
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  async checkTaskStatus(taskId, maxAttempts = 40, interval = 5000) {
    const url = 'https://aliyun.zaiwen.top/draw/mj/fetch';
    let attempt = 0;

    while (attempt < maxAttempts) {
      attempt++;
      console.log(`Attempt ${attempt}: Checking task status for Task ID ${taskId}...`);

      const options = {
        method: 'POST',
        headers: {
          'accept': 'application/json, text/plain, */*',
          'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
          'access-control-allow-origin': '*',
          'content-type': 'application/json',
          'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Microsoft Edge";v="128"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
          'Referer': 'https://zaiwen.xueban.org.cn/',
          'Referrer-Policy': 'strict-origin-when-cross-origin'
        },
        body: JSON.stringify({ task_id: taskId })
      };

      try {
        const response = await fetch(url, options);
        const result = await response.json();

        if (result.status && result.status.code === 0) {
          const taskStatus = result.info.status;

          if (taskStatus === 'SUCCESS') {
            console.log('Task completed successfully!');
            console.log('Image URL:', result.info.imageUrl[0]);
            return result.info.imageUrl[0];
          } else if (taskStatus === 'PENDING') {
            console.log('Task still in progress. Retrying...');
          } else {
            console.error('Unexpected task status:', taskStatus);
            return null;
          }
        } else {
          console.error('Error fetching task status:', result.status ? result.status.msg : 'Unknown error');
          return null;
        }
      } catch (error) {
        console.error('Request failed:', error);
        return null;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    console.error('Max attempts reached. Task did not complete successfully.');
    return null;
  }

  async zaiwen_drawing(model, prompt, ratio) {
    const taskId = await this.sendImageTask(model, prompt, ratio);
    if (taskId) {
      const imageUrl = await this.checkTaskStatus(taskId);
      if (imageUrl && !imageUrl.startsWith('https://zaiwen.superatmas.com/images/refer_images/banedMessage.jpg')) {
        console.log('Image generated successfully:', imageUrl);
        return imageUrl;
      } else {
        console.log('Task failed or did not complete within the maximum attempts.');
        return null;
      }
    } else {
      console.log('Task submission failed.');
      return null;
    }
  }

  /**
   * 执行绘图操作
   */
  async func(opts, e) {
    const { prompt, model = 'dall-e-3', size = '1792x1024' } = opts;

    if (!prompt) {
      return '绘图描述提示词（prompt）是必填项。';
    }

    // Zaiwen平台模型处理
    if (Object.keys(this.zaiwenModels).includes(model)) {
      const imageUrl = await this.zaiwenDraw(prompt, model, size);
      if (imageUrl) {
        await e.reply(segment.image(imageUrl));
        return {
          imageUrl,
          prompt,
          model
        };
      }
      return '生成失败，请稍后重试。';
    }

    // 处理其他模型
    if (['jimeng-2.1'].includes(model)) {
      try {
        const imageArray = await this.YTapi([{ role: 'user', content: prompt }], model);

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
            prompt,
            model
          };
        } else {
          return '生成失败了，可能负载过高，请稍后再试！';
        }
      } catch (error) {
        console.log('其他模型处理错误:', error);
        return '生成失败了，可能负载过高，请稍后再试！';
      }
    }

    // DALL-E处理流程
    const messages = [{
      role: 'user',
      content: `你需要根据我的要求生成一个图片。
                要求按照：${prompt}\n
                尺寸：${size}\n
                直接把图片发给我`
    }];

    let imageUrl;
    const response = await YTalltools(messages);

    if (response) {
      const links = await get_address(response);
      imageUrl = links.length > 0 ? links[0] : null;
    }

    if (!imageUrl) {
      imageUrl = await this.dalle(prompt, model);
    }

    if (imageUrl) {
      await e.reply(segment.image(imageUrl));
      return {
        imageUrl,
        prompt,
        model
      };
    }

    return '绘图失败，请检查提示词或稍后再试。';
  }
}