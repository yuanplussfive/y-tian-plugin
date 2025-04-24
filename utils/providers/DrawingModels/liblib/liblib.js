import crypto from 'crypto';
import fetch from 'node-fetch';
import path from 'path';
import YAML from 'yaml';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { random_safe } from '../../../../utils/requests/safeurl.js';

class ImageGenerator {
  constructor(token, payload) {
    this.token = token;
    this.payload = {
      ...payload,
      frontCustomerReq: {
        ...payload.frontCustomerReq,
        frontId: crypto.randomUUID(),
      },
    };
  }

  generateHeaders() {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    return {
      'accept': 'application/json, text/plain, */*',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
      'content-type': 'application/json',
      'priority': 'u=1, i',
      'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Microsoft Edge";v="134"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'token': this.token,
      'Referer': random_safe('aHR0cHM6Ly93d3cubGlibGliLmFydC8='),
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'User-Agent': userAgent,
    };
  }

  // 发起图像生成请求
  async generateImage() {
    try {
      console.log('发起图像生成请求...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 秒超时

      const response = await fetch(random_safe('aHR0cHM6Ly9icmlkZ2UubGlibGliLmFydC9nYXRld2F5L3NkLWFwaS9nZW5lcmF0ZS9pbWFnZQ=='), {
        method: 'POST',
        headers: this.generateHeaders(),
        body: JSON.stringify(this.payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`图像生成请求失败，状态码: ${response.status}`);
      }

      const result = await response.json();
      if (result.code !== 0) {
        throw new Error(`图像生成失败: ${result.msg || '未知错误'}`);
      }

      const generateId = result.data;
      console.log(`图像生成请求成功，生成 ID: ${generateId}`);
      return generateId;
    } catch (error) {
      console.error('图像生成请求出错:', error.message);
      throw error;
    }
  }

  // 查询图像生成进度（带重试）
  async checkProgress(generateId, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`查询生成进度，生成 ID: ${generateId}，第 ${attempt} 次尝试...`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 秒超时

        const response = await fetch(
          `${random_safe('aHR0cHM6Ly9icmlkZ2UubGlibGliLmFydC9nYXRld2F5L3NkLWFwaS9nZW5lcmF0ZS9wcm9ncmVzcy9tc2cvdjMv')}${generateId}`,
          {
            method: 'POST',
            headers: this.generateHeaders(),
            body: JSON.stringify({ flag: 0 }),
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`进度查询失败，状态码: ${response.status}`);
        }

        const result = await response.json();
        if (result.code !== 0) {
          throw new Error(`进度查询失败: ${result.msg || '未知错误'}`);
        }

        console.log('进度查询响应:', JSON.stringify(result.data, null, 2));
        return result.data;
      } catch (error) {
        console.error(`进度查询出错 (尝试 ${attempt}/${retries}):`, error.message);
        if (attempt === retries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  async generate(maxAttempts = 60, pollInterval = 5000) {
    try {
      const generateId = await this.generateImage();
      let attempts = 0;
      while (attempts < maxAttempts) {
        attempts++;
        console.log(`第 ${attempts} 次轮询，剩余尝试次数: ${maxAttempts - attempts}`);
        const progressData = await this.checkProgress(generateId);
        const percentCompleted = progressData.percentCompleted || 0;
        const subStatus = progressData.subStatus;
        const currentSteps = progressData.currentSteps || 0;
        const totalStep = progressData.totalStep || 0;
        console.log(
          `当前进度: ${percentCompleted}%，状态: ${subStatus}，步骤: ${currentSteps}/${totalStep}`
        );
        if (subStatus === 2 || (progressData.images && progressData.images.length > 0)) {
          if (!progressData.images || !progressData.images[0].previewPath) {
            throw new Error('图像生成完成，但未找到图片链接');
          }
          const imageUrl = progressData.images[0].previewPath;
          console.log('图像生成成功，图片链接:', imageUrl);
          return imageUrl;
        }
        if (
          (subStatus !== undefined && subStatus < 0) ||
          (progressData.errorMsg && progressData.errorMsg !== '')
        ) {
          throw new Error(
            `图像生成失败: ${progressData.errorMsg || `状态码 ${subStatus}，无详细错误信息`}`
          );
        }
        console.log('任务仍在进行，继续轮询...');
        await new Promise(resolve => setTimeout(resolve, pollInterval + Math.random() * 500));
      }
      throw new Error('图像生成超时，超过最大尝试次数');
    } catch (error) {
      console.error('生成图像流程失败:', error.message);
      throw error;
    }
  }
}

export async function liblib(messages) {
  const configPath = path.join(__dirname, '../../../../config/message.yaml');
  console.log(configPath)
  let config = {};
  if (fs.existsSync(configPath)) {
    const file = fs.readFileSync(configPath, 'utf8');
    const configs = YAML.parse(file);
    config = configs.pluginSettings;
  }
  const checkpointId = config?.liblibcheckpointId || '';
  const token = config?.liblibtoken || '';
  const prompt = messages[messages.length - 1].content;

  const payload = {
    checkpointId: checkpointId,
    promptMagic: 0,
    generateType: 1,
    frontCustomerReq: {
      frontId: '',
      windowId: '',
      tabType: 'txt2img',
      conAndSegAndGen: 'gen',
    },
    originalPrompt: prompt,
    triggerWords: '',
    text2img: {
      prompt: prompt,
      negativePrompt: 'ng_deepnegative_v1_75t,(badhandv4:1.2),EasyNegative,(worst quality:2),',
      extraNetwork: '',
      samplingMethod: 6,
      samplingStep: 20,
      width: 1024,
      height: 1288,
      imgCount: 1,
      cfgScale: 7,
      seed: -1,
      seedExtra: 0,
      clipSkip: 2,
      randnSource: 1,
      refiner: 0,
      restoreFaces: 0,
      hiResFix: 0,
      tiling: 0,
      tileDiffusion: null,
      original_prompt: prompt,
    },
    adetailerEnable: 0,
    taskQueuePriority: 1,
  };

  try {
    const generator = new ImageGenerator(token, payload);
    const imageUrl = await generator.generate();
    console.log('最终结果:', imageUrl);
    return `![liblib_Image](${imageUrl})`;
  } catch (error) {
    console.error('执行失败:', error.message);
    return null;
  }
}