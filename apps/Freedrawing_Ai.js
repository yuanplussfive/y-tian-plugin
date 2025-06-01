import { dependencies } from "../YTdependence/dependencies.js";
const { fetch, _path, fs } = dependencies;
import { ZaiwenDrawing } from "../utils/providers/DrawingModels/zaiwen/zaiwen.js";
import { jimengClient } from "../utils/providers/ChatModels/jimeng/jimengClient.js";
import { liblib } from "../utils/providers/ChatModels/liblib/liblib.js";
import { YTOtherModels } from "../utils/fileUtils.js";
import { OpenAigenerateImage } from "../YTOpen-Ai/OpenAiChatCmpletions.js";
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import dotenv from 'dotenv';
let ratio = "9:16";
let lastUsedTimestamps = 0;
let dalle_size = '1024x1792';

export class FreeDrawing extends plugin {
  constructor() {
    super({
      name: '阴天[free_drawing]',
      dsc: '',
      event: 'message',
      priority: 3000,
      rule: [
        {
          reg: "^#(pix|play|play3|sdxl|flux|pro|sch|max|realism|sd3|sd35|gen3|recraft|ty)绘图(.*)",
          fnc: 'handleImageCommand'
        },
        {
          reg: "^#dalle(3)?绘图(.*)",
          fnc: 'handleDalleCommand'
        },
        {
          reg: "^#(激萌|即梦|jimeng)绘图(.*)",
          fnc: 'handleJimengCommand'
        },
        {
          reg: "^#(激萌|即梦|jimeng)视频(.*)",
          fnc: 'handleJimengVideoCommand'
        },
        {
          reg: "^#(noob|Noob|noobai)绘图(.*)",
          fnc: 'handleNoobaiCommand'
        },
        {
          reg: "^#(nbxl|Nbxl)绘图(.*)",
          fnc: 'handleNoobxlCommand'
        },
        {
          reg: "^#(Wai|wai)绘图(.*)",
          fnc: 'handleWaiCommand'
        },
        {
          reg: "^#(Ani|ani)绘图(.*)",
          fnc: 'handleAniCommand'
        },
        {
          reg: "^#(Af|af)绘图(.*)",
          fnc: 'handleAfCommand'
        },
        {
          reg: "^#(md|Md|Ms|ms)绘图(.*)",
          fnc: 'handleMdCommand'
        },
        {
          reg: "^#(Nai|nai)绘图(.*)",
          fnc: 'handleNaiCommand'
        }
      ]
    })
  }

  async handleNaiCommand(e) {
    try {
      const prompt = e.msg.replace(/#(Nai|nai)绘图/g, "")?.trim()
      const imageArray = await YTOtherModels([{ role: "user", content: prompt }], 'novelai-v3-fast');
      let imageUrls = [];
      console.log(imageArray);
      if (!imageArray) {
        e.reply('生成失败了，可能服务器无响应，请稍后再试！');
      } else {
        imageUrls = await extractImageUrls(imageArray);
        if (imageUrls && imageUrls.length > 0) {
          const images = imageUrls.map(imgurl => segment.image(imgurl.trim()));
          await e.reply(images);
        } else {
          e.reply(imageArray);
        }
      }
    } catch (error) {
      console.log('处理错误:', error);
      e.reply('生成失败了，请稍后再试！');
    }
  }

  async handleMdCommand(e) {
    const prompt = e.msg.replace(/#(Md|md|ms|Ms)绘图/g, "")?.trim()
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const pluginPath = path.join(__dirname, '../');
    dotenv.config({ path: path.join(pluginPath, '.env') });
    const config = {
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost',
      port: process.env.PORT || 7799,
      apikey: process.env.DEFAULT_API_KEY
    };
    const options = {
      model: "anishadow-v10",
      size: '1024x1024',
      prompt: prompt,
      n: 1,
    };
    const apiBaseUrl = `${config.apiBaseUrl}:${config.port}/v1/`
    const result = await OpenAigenerateImage(apiBaseUrl, config.apikey, options);
    if (result.error) {
      e.reply(result.error);
    }
    e.reply(segment.image(result.data[0].url))
  }

  async handleAfCommand(e) {
    try {
      const prompt = e.msg.replace(/#(Af|af)绘图/g, "")?.trim()
      const imageArray = await YTOtherModels([{ role: "user", content: prompt }], 'wai-noobai-fast');
      let imageUrls = [];
      console.log(imageArray);
      if (!imageArray) {
        e.reply('生成失败了，可能服务器无响应，请稍后再试！');
      } else {
        imageUrls = await extractImageUrls(imageArray);
        if (imageUrls && imageUrls.length > 0) {
          const images = imageUrls.map(imgurl => segment.image(imgurl.trim()));
          await e.reply(images);
        } else {
          e.reply(imageArray);
        }
      }
    } catch (error) {
      console.log('处理错误:', error);
      e.reply('生成失败了，请稍后再试！');
    }
  }

  async handleAniCommand(e) {
    try {
      const prompt = e.msg.replace(/#(Ani|ani)绘图/g, "")?.trim()
      const imageArray = await YTOtherModels([{ role: "user", content: prompt }], 'anishadow-v10-fast');
      let imageUrls = [];
      console.log(imageArray);
      if (!imageArray) {
        e.reply('生成失败了，可能服务器无响应，请稍后再试！');
      } else {
        imageUrls = await extractImageUrls(imageArray);
        if (imageUrls && imageUrls.length > 0) {
          const images = imageUrls.map(imgurl => segment.image(imgurl.trim()));
          await e.reply(images);
        } else {
          e.reply(imageArray);
        }
      }
    } catch (error) {
      console.log('处理错误:', error);
      e.reply('生成失败了，请稍后再试！');
    }
  }

  async handleNoobxlCommand(e) {
    try {
      const prompt = e.msg.replace(/#(nbxl|Nbxl)绘图/g, "")?.trim()
      const imageArray = await YTOtherModels([{ role: "user", content: prompt }], 'noobai-xl-fast');
      let imageUrls = [];
      console.log(imageArray);
      if (!imageArray) {
        e.reply('生成失败了，可能服务器无响应，请稍后再试！');
      } else {
        imageUrls = await extractImageUrls(imageArray);
        if (imageUrls && imageUrls.length > 0) {
          const images = imageUrls.map(imgurl => segment.image(imgurl.trim()));
          await e.reply(images);
        } else {
          e.reply(imageArray);
        }
      }
    } catch (error) {
      console.log('处理错误:', error);
      e.reply('生成失败了，请稍后再试！');
    }
  }

  async handleNoobaiCommand(e) {
    try {
      const prompt = e.msg.replace(/#(noob|Noob|noobai)绘图/g, "")?.trim()
      const imageArray = await YTOtherModels([{ role: "user", content: prompt }], 'noobai-fast');
      let imageUrls = [];
      console.log(imageArray);
      if (!imageArray) {
        e.reply('生成失败了，可能服务器无响应，请稍后再试！');
      } else {
        imageUrls = await extractImageUrls(imageArray);
        if (imageUrls && imageUrls.length > 0) {
          const images = imageUrls.map(imgurl => segment.image(imgurl.trim()));
          await e.reply(images);
        } else {
          e.reply(imageArray);
        }
      }
    } catch (error) {
      console.log('处理错误:', error);
      e.reply('生成失败了，请稍后再试！');
    }
  }

  async handleWaiCommand(e) {
    try {
      const prompt = e.msg.replace(/#(Wai|wai)绘图/g, "")?.trim()
      const imageArray = await YTOtherModels([{ role: "user", content: prompt }], 'wai-illustrious-fast');
      let imageUrls = [];
      console.log(imageArray);
      if (!imageArray) {
        e.reply('生成失败了，可能服务器无响应，请稍后再试！');
      } else {
        imageUrls = await extractImageUrls(imageArray);
        if (imageUrls && imageUrls.length > 0) {
          const images = imageUrls.map(imgurl => segment.image(imgurl.trim()));
          await e.reply(images);
        } else {
          e.reply(imageArray);
        }
      }
    } catch (error) {
      console.log('处理错误:', error);
      e.reply('生成失败了，请稍后再试！');
    }
  }

  async handleJimengVideoCommand(e) {
    try {
      const prompt = e.msg.replace(/#(激萌|即梦|jimeng)视频/g, "")?.trim()
      const imageArray = await jimengClient([{ role: "user", content: prompt }], "jimeng-video-2.0", "video");
      let imageUrls = [];
      console.log(imageArray);
      if (!imageArray) {
        e.reply('生成失败了，可能服务器无响应，请稍后再试！');
      } else {
        imageUrls = await extractImageUrls(imageArray);
        if (imageUrls && imageUrls.length > 0) {
          const images = imageUrls.map(imgurl => segment.video(imgurl.trim()));
          await e.reply(images);
        } else {
          e.reply('生成失败了，无法发送，请稍后再试！');
        }
      }
    } catch (error) {
      console.log('处理错误:', error);
      e.reply('生成失败了，请稍后再试！');
    }
  }

  async handleJimengCommand(e) {
    try {
      const prompt = e.msg.replace(/#(激萌|即梦|jimeng)绘图/g, "")?.trim()
      const imageArray = await jimengClient([{ role: "user", content: prompt }], "jimeng-3.0", "image");
      let imageUrls = [];
      console.log(imageArray);
      if (!imageArray) {
        e.reply('生成失败了，可能服务器无响应，请稍后再试！');
      } else if (imageArray.includes("提示词违规")) {
        e.reply('生成失败了，大概率提示词违规，无法发送，请修改提示词稍后尝试');
      } else {
        imageUrls = await extractImageUrls(imageArray);
        if (imageUrls && imageUrls.length > 0) {
          const images = imageUrls.map(imgurl => segment.image(imgurl.trim()));
          await e.reply(images); // 发送图片
        } else {
          e.reply('生成失败了，无法发送，请稍后再试！');
        }
      }
    } catch (error) {
      console.log('处理错误:', error);
      e.reply('生成失败了，请稍后再试！');
    }
  }

  async handleDalleCommand(e) {
    const now = Date.now();
    const lastUsed = lastUsedTimestamps || 0;
    const timeElapsed = now - lastUsed;
    const COOLDOWN_TIME = 5 * 60 * 1000;
    if (timeElapsed < COOLDOWN_TIME) {
      const timeRemaining = Math.ceil((COOLDOWN_TIME - timeElapsed) / 1000);
      e.reply(`命令：[dalle-3-hd]，免费使用，但成本过高进行限速. 请等待 ${timeRemaining}s 之后重试(使用免费附加模型无此限制)`);
      return false;
    }
    lastUsedTimestamps = now;
    await e.reply("我在画了, 大约需要2-3分钟", true, { recallMsg: 8 });
    let imageUrls;

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 300000)
      );
      const mainPromise = (async () => {
        imageUrls = await dalle(e.msg.replace(/#dalle(3)?绘图/g, ''), 'dall-e-3', false, 1, dalle_size, 'hd');
        //e.reply(imageUrls, true);
        if (imageUrls == '你的提示词违反了OpenAi的政策，请更改') {
          e.reply('你的提示词违反了OpenAi的政策，请更改', true);
          return false;
        }
        e.reply(segment.image(imageUrls), true);
        return true;
      })();
      await Promise.race([mainPromise, timeoutPromise]);
    } catch (error) {
      if (error.message === 'timeout') {
        e.reply(imageUrls, true);
        return false;
      } else {
        console.error('操作失败', error);
        e.reply('请求失败，请稍后重试！');
        return false;
      }
    }
  }

  async handleImageCommand(e) {
    await e.reply("我在画了,着什么急?", true, { recallMsg: 8 });

    const modelMap = {
      '#pix': "poe_model_pixart",
      '#sdxl': "poe_model_stablediffusionxl",
      '#sd35': "poe_model_stablediffusion35t",
      '#sd3': "poe_model_stablediffusion35t",
      '#play3': "poe_model_playgroundv3.0",
      '#gen3': "poe_model_imagen3fast",
      '#play': "poe_model_playgroundv2.5",
      '#sch': "poe_model_fluxschnell",
      '#flux': "poe_model_fluxdev",
      '#pro': "poe_model_fluxdev",
      '#realism': "poe_model_fluxdev",
      '#max': "poe_model_fluxdev",
      '#ty': "tongyi",
      '#recraft': "poe_model_recraftv3",
    };

    const command = e.msg.match(/^#(pix|play|play3|sdxl|flux|pro|sch|max|realism|sd3|sd35|gen3|recraft|ty)/);
    if (!command) {
      e.reply("未识别的命令", true, { recallMsg: 8 });
    }

    const model = modelMap[command[0]];
    const msg = e.msg.replace(/^#(pix|play|play3|sdxl|flux|pro|sch|max|realism|sd3|sd35|gen3|recraft|ty)绘图/g, "").trim();
    console.log(msg);
    const imgUrls = await ZaiwenDrawing(model, msg, ratio);

    if (imgUrls) {
      const downloadAndSaveImage = async () => {
        const response = await fetch(imgUrls);
        const fileBuffer = await response.arrayBuffer();
        const filePath = `${_path}/resources/1.png`;
        fs.writeFileSync(filePath, Buffer.from(fileBuffer), "binary");
        e.reply(segment.image(filePath), true);
      };
      const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('Operation timed out')), 120000);
      });
      try {
        await Promise.race([downloadAndSaveImage(), timeoutPromise]);
      } catch (error) {
        if (error.message === 'Operation timed out' && imgUrls.startsWith('https://yuanpluss')) {
          e.reply(imgUrls, true);
        } else {
          e.reply('请求超时，请稍后重试！');
          return false;
        }
      }
    } else {
      e.reply('当前绘图存在违规词或访问量过大，请更改提示词或稍后重试！')
      return false;
    }
    const totalTimeout = setTimeout(() => {
      return false;
    }, 120000);
    clearTimeout(totalTimeout);
  }
}

async function dalle(prompt, model, stream, n, size, quality) {
  try {
    const url = 'https://yuanpluss.online:3000/v1/images/generations';
    const data = {
      prompt, model, stream, n, size, quality
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    console.log(response.ok)
    if (!response.ok) {
      return null;
    }
    const responseData = await response.text();
    return responseData;
  } catch (error) {
    console.log(error)
    return null;
  }
}

/**
* 从文本中提取图片链接
* @param {string} text - 包含图片链接的文本
* @returns {string[]} - 提取的图片链接数组
*/
async function extractImageUrls(text) {
  if (!text) return [];

  // 匹配 ![image_x](url) 格式的图片链接
  const regex = /!\[.*?\]\((.*?)\)/g;
  const matches = [...text.matchAll(regex)];

  // 提取所有URL并返回数组
  return matches.map(match => match[1]);
}