import CryptoJS from 'crypto-js';
import { dependencies } from "../YTdependence/dependencies.js";
const { fetch, axios, common, YAML, path, fs } = dependencies;

export class vega extends plugin {
  constructor() {
    super({
      name: '阴天[vega绘图]',
      dsc: '',
      event: 'message',
      priority: 0,
      rule: [
        {
          reg: "^#vg(绘|画)图(.*?)",
          fnc: 'drawing'
        },
        {
          reg: "^#搜索vg模型(.*?)",
          fnc: 'search'
        }
      ]
    })
  }

  async search(e) {
    const data = await getBaseModels();

    if (!data || data.code !== "20000" || !data.data || data.data.length === 0) {
      await e.reply(`获取VegaAI模型列表失败: ${data?.message || '未知错误'}`);
      return true;
    }

    // 创建消息数组
    const msgList = [];

    // 添加标题消息
    msgList.push("VegaAI基础模型列表");

    // 为每个模型创建一条消息
    data.data.forEach((model, index) => {
      let modelMsg = `${index + 1}. ${model.name}\n`;
      modelMsg += `代码: ${model.code}\n`;

      if (model.tag) {
        modelMsg += `标签: ${model.tag}\n`;
      }

      modelMsg += `负面提示词: ${model.negPrompt}\n\n`;

      // 处理示例提示词
      try {
        const examples = JSON.parse(model.remark);
        if (examples && examples.length > 0) {
          modelMsg += `示例提示词:\n`;
          examples.forEach((example, i) => {
            modelMsg += `${i + 1}. ${example}\n`;
          });
        }
      } catch (e) {
        // 如果解析失败，直接显示原始内容
        if (model.remark) {
          modelMsg += `示例提示词: ${model.remark}\n`;
        }
      }

      msgList.push(modelMsg);
    });

    // 使用common模块的makeForwardMsg函数制作转发消息
    const forwardMsg = await common.makeForwardMsg(e, msgList, 'VegaAI模型列表', false);

    // 发送转发消息
    await e.reply(forwardMsg);

    // 添加提示信息
    setTimeout(() => {
      e.reply("以上是VegaAI的所有基础模型，可以根据需要选择合适的模型进行创作");
    }, 500);

    return true;
  }

  async drawing(e) {
    const satoken = await getStoken();
    const prompt = e.msg.replace(/#vg(绘|画)图/g, "").trim();
    console.log(`发送创建图像请求，提示词: "${prompt}"`);
    const { requestId, dealTime, queueingTime, timeWait } = await createImage({ prompt }, satoken);
    e.reply(`开始vega绘图任务\n绘图id：${requestId}\n预计排队时长：${queueingTime} s\n预计绘图时长：${dealTime} s\n预计总时长：${timeWait} s`)
    console.log(`图像请求已创建，requestId: ${requestId}`);
    const imageUrls = await getImageUrls(requestId, satoken);
    if (!Array.isArray(imageUrls)) {
      e.reply(imageUrls);
      return false;
    }
    console.log('获取到的图像URL:', imageUrls);
    if (imageUrls && imageUrls.length !== 0) {
      let imgurls = []
      imageUrls.map(url => imgurls.push(segment.image(url)));
      e.reply(imgurls);
    }
  }
}

/**
 * 获取请求头的函数
 * @param {string} satoken - 用于设置Cookie中的satoken
 * @param {Object} additionalHeaders - 额外需要添加的请求头
 * @returns {Object} 完整的请求头对象
 */
const getHeaders = (satoken, additionalHeaders = {}) => {
  // 基础请求头
  const headers = {
    'Accept': 'application/json, text/plain, */*',
    'sec-ch-ua': '"Microsoft Edge";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    'sec-ch-ua-platform': '"Windows"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'Referer': 'https://applet.rightbrainai.cn/text2Image',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cookie': `satoken=${satoken}; token=${satoken}`,
    ...additionalHeaders, // 合并额外的请求头
  };

  return headers;
};

/**
 * 解密函数
 * @param {string} encryptedData - 加密后的数据
 * @param {string} key - 解密密钥，取自satoken的前16位
 * @returns {Promise<string>} 解密后的明文
 */
const decrypt = async (encryptedData, key) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const plaintext = bytes.toString(CryptoJS.enc.Utf8);
    if (!plaintext) throw new Error('解密失败，可能是密钥不正确或数据被篡改');
    return plaintext;
  } catch (error) {
    console.error('解密错误:', error);
    throw error;
  }
};

/**
 * 加密函数
 * @param {Object} data - 需要加密的数据对象
 * @param {string} satoken - 用于生成加密密钥的satoken
 * @returns {Promise<string>} 加密后的密文
 */
const encrypt = async (data, satoken) => {
  try {
    const key = (satoken.includes('=') ? satoken.split('=')[1] : satoken).substring(0, 16);
    const plaintext = JSON.stringify(data);
    const ciphertext = CryptoJS.AES.encrypt(plaintext, key).toString();
    return ciphertext;
  } catch (error) {
    console.error('加密错误:', error);
    throw error;
  }
};

const createRequestBody = (options = {}) => {
  const defaultConfig = {
    modelType: 'old',
    relation: true,
    imageRatio: '1:1',
    width: 512,
    height: 512,
    useHd: 1,
    imageNum: 4,
    stepNum: 20,
    cfgScale: 7,
    sampler: 'DPM++ 2M Karras',
    seed: -1,
    negPrompt: [
      'unrealistic',
      'worst quality',
      'low quality',
      'painting',
      'drawing',
      'sketch',
      'cartoon',
      'anime',
      'manga',
      'render',
      'CG',
      '3d',
      'watermark',
      'signature',
      'label'
    ].join(', '),
    model: 'ad23ccaf-0f6b-4971-8034-cfabf0673024',
    loraId: "990bfa2b-263d-4a98-b0ab-35490c628365",
    loraKeyword: "wlcocz",
    loraWeight: 1
  };

  return {
    ...defaultConfig,
    ...options,
    // 确保必填项
    prompt: options.prompt ?? (() => {
      throw new Error('Prompt is required');
    })()
  };
};

/**
 * 创建图像请求
 * @param {Object} params - 请求参数，包括prompt等
 * @returns {Promise<string>} 请求ID
 */
const createImage = async (options, satoken) => {
  const requestBody = createRequestBody(options);

  try {
    let encryptedRequestBody = await encrypt(requestBody, satoken);
    //encryptedRequestBody = "U2FsdGVkX18ps43Akv5SwUZGwExhdpyMHIBrZC9W48ZqkNtE7Xv0C5ZSnI64TppsrAfirxA8ZKy47UcRJhpxkvUdpXNkk6qpjljRpSOec+th3TgC9tm6qOjyW404LnhO8Keckpm5Gthx50FBEaYXHMiDyXOMwSZHi87dM5YC1WvhyB+A1N7hdLTyl67sxGp/meefAyDEaj8M98kS9e7ikA1FDkn4vzXajI3n7t5iMFhJXu1YGiYYHAhaE9bxtI1c7XD0Beex6VNq+dQgTokaIZ3vd8r1uufDvgp31wd0JIa7gypCY9b21+CIegZecq/QzOqndn52qSNUFZ1IRXVtcNg7tCWmsQ6TPHkWQL7bDl6Y5G5FcMgtmF7GdKJHEu+sJhwQVK6lkTKSYi3iKPSEs2dky0IuAhqRtjcy3g7FQJTXr7ionG/eDL8jo+AO7CeiYY7US+OF2sh7NLvFQzytWBcc9h1t6mjYUqRxTMSXuOyuOqEuUic9f+4DAqHlKlxOtofwYhDOYs6F5pXIpCHSmTd/tOsSb0CDNYeixHnJiy0="
    console.log('加密后的请求体:', encryptedRequestBody);

    const response = await fetch('https://applet.rightbrainai.cn/apis/text2image/create/VqLjFh', {
      method: 'POST',
      headers: getHeaders(satoken, {
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ data: encryptedRequestBody }),
    });

    if (!response.ok) {
      throw new Error(`创建图像请求失败，状态码: ${response.status}`);
    }

    const responseData = await response.json();
    console.log(responseData);
    if (responseData.code !== '20000') {
      throw new Error(`API错误: ${responseData.message || '未知错误'}`);
    }

    return {
      requestId: responseData.data.requestId,
      dealTime: responseData.data.dealTime,
      queueingTime: responseData.data.queueingTime,
      timeWait: responseData.data.timeWait
    };
  } catch (error) {
    console.error('创建图像请求时发生错误:', error);
    throw error;
  }
};

/**
 * 获取图像URL
 * @param {string} requestId - 创建图像请求返回的requestId
 * @returns {Promise<string[]>} 图像URL数组
 */
const getImageUrls = async (requestId, satoken, maxRetries = 150) => {
  const retryInterval = 6000; // 重试间隔时间（毫秒）
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(
        `https://applet.rightbrainai.cn/apis/text2image/getImage?requestId=${encodeURIComponent(requestId)}`,
        {
          method: 'GET',
          headers: getHeaders(satoken, {
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
          }),
        }
      );

      if (!response.ok) {
        return `获取图像URL失败，状态码: ${response.status}`
      }

      const data = await response.json();
      console.log(data);
      if (data.code !== '20000' && data.message.includes("failure")) {
        return "生成时失败了，可能当前队列过多，请重新尝试"
      }
      if (data.code === '20000' && Array.isArray(data.data?.list) && data.data.list.length > 0) {
        const imageUrls = data.data.list.filter((url) => url.startsWith('http'));
        if (imageUrls.length > 0) {
          return imageUrls;
        }
      }

      console.warn(`尝试 ${attempt} 次后未获取到图像URL，等待 ${retryInterval / 1000} 秒后重试...`);
      await new Promise((resolve) => setTimeout(resolve, retryInterval));
    } catch (error) {
      console.error(`第 ${attempt} 次获取图像URL时发生错误:`, error);
      if (attempt === maxRetries) {
        return '超出最大重试次数，未能获取到图像URL';
      }
      await new Promise((resolve) => setTimeout(resolve, retryInterval));
    }
  }

  return '超出最大重试次数，未能获取到图像URL';
};

async function getStoken() {
  const configPath = path.join(process.cwd(), 'plugins/y-tian-plugin/config/message.yaml');
  const configFile = fs.readFileSync(configPath, 'utf8');
  const config = YAML.parse(configFile);
  return config?.pluginSettings?.VegaStoken || null;
}

async function getBaseModels() {
  try {
    const response = await axios({
      method: 'GET',
      url: 'https://www.vegaai.art/apis/model/getBaseModels',
      headers: {
        "accept": "application/json, text/plain, */*",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
        "sec-ch-ua": "\"Chromium\";v=\"134\", \"Not:A-Brand\";v=\"24\", \"Microsoft Edge\";v=\"134\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        'Cookie': `satoken=${await getStoken()}; token=${await getStoken()}`,
        "Referer": "https://www.vegaai.art/text2Image"
      }
    });

    return response.data;
  } catch (error) {
    console.error('请求失败:', error);
    return null;
  }
}