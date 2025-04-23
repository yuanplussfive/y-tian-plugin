const _path = process.cwd();
import { get_address } from "../utils/fileUtils.js";
import { chat_models } from "../YTOpen-Ai/chat-models.js";
import { OpenAiChatCmpletions } from "../YTOpen-Ai/OpenAiChatCmpletions.js";
import https from "https";
import axios from "../node_modules/axios/index.js";
import common from "../../../lib/common/common.js";
import puppeteer from "../../../lib/puppeteer/puppeteer.js";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { extractAndRender } from '../YTOpen-Ai/tools/preview.js';
import { handleTTS } from "../model/Anime_tts.js";
import { replyBasedOnStyle } from "../YTOpen-Ai/answer-styles.js";
let dirpath = `${_path}/data/YTopenai`;

async function run_conversation(e, apiurl, group, Bot_Name, Apikey, imgurl, Anime_tts_roles) {
  const chatgptConfig = JSON.parse(fs.readFileSync(`${dirpath}/data.json`, "utf-8")).chatgpt;
  const { model, search } = chatgptConfig;
  let msg = await formatMessage(e.msg) || '...';
  let SettingsPath = _path + '/data/YTAi_Setting/data.json';
  let Settings = JSON.parse(await fs.promises.readFile(SettingsPath, "utf-8"));
  let { chat_moment_numbers, chat_moment_open } = Settings.chatgpt;
  let userid = group ? (e.group_id ?? e.user_id) : e.user_id;
  //console.log(userid)
  let history = await loadUserHistory(path, userid, dirpath);
  if (chat_moment_open) {
    history = await processArray(history, chat_moment_numbers)
  }
  let all_system = fs.existsSync(`${dirpath}/user_cache/all.json`)
    ? JSON.parse(await fs.promises.readFile(`${dirpath}/user_cache/all.json`, "utf-8"))
    : [];
  const hasSystemRole = all_system.some(item => item.role === "system");
  const HistoryhasSystemRole = history.some(item => item.role === "system");
  if (hasSystemRole && !HistoryhasSystemRole) {
    history = history.filter(item => item.role !== "system");
    history.unshift(...all_system);
  }
  let aiSettingsPath = _path + '/data/YTAi_Setting/data.json';
  let aiSettings = JSON.parse(await fs.promises.readFile(aiSettingsPath, "utf-8"));
  let { prompts_answers, prompts_answer_open } = aiSettings.chatgpt;
  if (prompts_answers && prompts_answer_open) {
    const tips = prompts_answers
    await e.reply(tips, true, { recallMsg: 6 });
  }
  let message = msg;
  if (imgurl && imgurl.length > 0) {

    const isValidModel = (() => {
      try {
        if (!chat_models) return false;
        const CurrentModel = chat_models.find(m => m?.name === model);
        if (!CurrentModel?.features) return false;
        return CurrentModel.features.includes('image_recognition') || CurrentModel.features.includes('file');
      } catch {
        return false;
      }
    })();

    console.log(isValidModel);
    if (isValidModel || model.includes("gpt-4-gizmo")) {
      message = [
        {
          "type": "text",
          "text": message
        }
      ]
      message.push(...imgurl);
      console.log(message)
    }
  }
  history.push({
    "role": "user",
    "content": message
  });
  await handleGpt4AllModel(e, history, Apikey, search, model, apiurl);

  async function formatMessage(originalMsg) {
    if (originalMsg) {
      const msgs = originalMsg.replace(/(\/|#)godgpt|(#|\/)chat/g, "").trim().replace(new RegExp(Bot_Name, "g"), "");
      return msgs
    } else {
      return null
    }
  }

  /**
   * 加载用户历史记录
   * 优先从 Redis 获取，如果失败则从本地 JSON 文件读取
   * @param {string} userId - 用户 ID
   * @param {string} dirpath - 本地存储目录路径
   * @returns {Array} 用户历史记录数组
   */
  async function loadUserHistory(path, userId, dirpath) {
    const redisKey = `YTUSER_CHAT:${userId}`;
    const historyPath = path.join(dirpath, 'user_cache', `${userId}.json`);
    try {
      const data = await global.redis.get(redisKey);
      if (data) {
        console.log(`从 Redis 加载用户历史成功: ${userId}`);
        return JSON.parse(data);
      } else {
        console.warn(`Redis 中没有数据，尝试从本地文件加载: ${historyPath}`);
        if (fs.existsSync(historyPath)) {
          const fileData = fs.readFileSync(historyPath, 'utf-8');
          const parsedData = JSON.parse(fileData);
          try {
            await global.redis.set(redisKey, JSON.stringify(parsedData));
            console.log(`将本地数据缓存到 Redis 成功: ${userId}`);
          } catch (err) {
            console.error(`将本地数据缓存到 Redis 失败: ${err}`);
          }
          return parsedData;
        } else {
          console.warn(`本地文件不存在: ${historyPath}`);
          return [];
        }
      }
    } catch (err) {
      console.error(`从 Redis 加载用户历史失败: ${err}，尝试从本地文件加载`);
      try {
        if (fs.existsSync(historyPath)) {
          const fileData = fs.readFileSync(historyPath, 'utf-8');
          return JSON.parse(fileData);
        } else {
          console.warn(`本地文件不存在: ${historyPath}`);
          return [];
        }
      } catch (fileErr) {
        console.error(`从本地文件加载用户历史失败: ${fileErr}`);
        return [];
      }
    }
  }

  async function handleMJModel(e) {
    let filteredArray = history.filter(function (item) {
      return item.role !== "system";
    });
    const links = await extractUrl(imgurl);
    console.log(links)
    if (links && links.length !== 0) {
      filteredArray.forEach((item, index) => {
        if (index === filteredArray.length - 1) {
          item.content = links + ' ' + item.content;
        }
      });
    }
    try {
      let answer;
      console.log(filteredArray)
      const response = await OpenAiChatCmpletions(apiurl, Apikey, model, filteredArray);
      answer = await response.choices[0].message.content;
      const markdownText = answer?.replace(/!\[[\s\S]*?\]\(.*?\)[\s\n]*/m, '');
      await replyBasedOnStyle(markdownText, e, model, msg)

      history.push({
        "role": "assistant",
        "content": answer
      });
      if (answer.includes("服务器已掉线")) {
        e.reply("该图像处理服务器已掉线, 请结束对话后重试");
        return false;
      }
      let urls = [];
      const linkRegex = /\((https?:\/\/[^\s]+)\)/;
      const match = answer.match(linkRegex);
      console.log(match[1]);
      if (match && match[1]) {
        urls = [match[1]];
      }
      if (urls.length !== 0) {
        const filePath = path.join(_path, 'resources', 'mj_chat.png');
        for (const url of urls) {
          try {
            const downloadTimeout = 40000;
            let urlSent = false;
            let downloadAborted = false;
            const sendUrl = () => {
              if (!urlSent) {
                e.reply(url.trim());
                urlSent = true;
              }
            };

            const downloadPromise = async () => {
              try {
                const response = await axios({
                  url: url.trim(),
                  method: 'GET',
                  responseType: 'stream'
                });
                if (response.status >= 400) {
                  throw new Error(`Failed to download ${url}: ${response.status}`);
                }
                const file = fs.createWriteStream(filePath);
                response.data.pipe(file);
                await new Promise((resolve, reject) => {
                  file.on('finish', resolve);
                  file.on('error', reject);
                });
                if (!downloadAborted) {
                  console.log(111);
                  e.reply(segment.image(filePath));
                }
              } catch (err) {
                console.log(err);
                if (!downloadAborted) {
                  sendUrl();
                }
              }
            };

            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => {
                downloadAborted = true;
                reject(new Error('Download timed out'));
              }, downloadTimeout)
            );

            try {
              await Promise.race([downloadPromise(), timeoutPromise]);
            } catch (err) {
              if (err.message === 'Download timed out') {
                sendUrl();
              } else {
                throw err;
              }
            }
          } catch (error) {
            const errorMessage = error.message || '';
            if (errorMessage.toLowerCase().includes('socket hang up') ||
              errorMessage.toLowerCase().includes('request to') ||
              errorMessage.toLowerCase().includes('failed to fetch')) {
              e.reply('与服务器连接失败，请检查网络连接或尝试更改方案代理！');
            } else {
              e.reply('与服务器连接失败，未知错误！')
            }
          }
        }
      }
      await saveUserHistory(path, userid, dirpath, history);
    } catch (error) {
      let errorMessage = "通讯失败, 错误详情: " + error.message;
      e.reply(errorMessage);
      //e.reply("通讯失败, 稍后再试")
    }
  }

  async function handleSunoModel(e, Apikey, msg, model, apiurl, _path) {
    try {
      const response = await OpenAiChatCmpletions(apiurl, Apikey, model, [{ role: "user", content: msg }]);
      const answer = response?.choices[0]?.message?.content;
      await replyBasedOnStyle(answer, e, model, msg);
      const urls = await get_address(answer);
      console.log(urls);
      if (urls.length !== 0) {
        urls.filter(url => url.endsWith('.mp3')).map(url => e.reply(segment.record(url)));
        urls.filter(url => url.endsWith('.mp4')).map(url => e.reply(segment.video(url)));
      }
    } catch (error) {
      console.log(error)
      e.reply("通讯失败, 稍后再试");
    }
  }

  async function handleideoModel(e) {
    try {
      const response = await OpenAiChatCmpletions(apiurl, Apikey, model, [{ role: "user", content: msg }]);
      const OnputString = response?.choices[0]?.message?.content;
      console.log(OnputString)
      const urls = await get_address(OnputString);
      console.log(urls);
      if (urls.length !== 0) {
        const images = urls.map(url => segment.image(url));
        e.reply(images);
      }
    } catch (error) {
      console.log(error)
      e.reply("通讯失败, 稍后再试")
    }
  }

  async function handlelumaModel(e) {
    try {
      let answer;
      let question = msg;
      //console.log(imgurl);
      const links = await extractUrl(imgurl);
      //console.log(links)
      if (links && links.length !== 0) {
        question = `${links}\n${question}`
      }
      console.log(question);
      const response = await fetch(`${apiurl}chat/completions`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Apikey}`,
        },
        body: JSON.stringify({
          model: model,
          stream: true,
          messages: [{ role: "user", content: question }]
        }),
      });
      const input = await response.text();
      console.log(input)
      const urlRegex = /https:\/\/filesystem\.site\/cdn\/[0-9]{8}\/[A-Za-z0-9]+(\.(mp3|mp4))/g;
      const contentMatch = input.match(/"delta":{"content":"([\s\S]*?)"}/g);
      const contentArray = contentMatch?.map(match => match.replace(/"delta":{"content":"([\s\S]*?)"}/, '$1').replace(/\\n/g, "\n")) || [];
      answer = contentArray.join('').trim();
      await replyBasedOnStyle(answer, e, model, question)
      //e.reply(answer);
      console.log(answer);
      const urls = answer.match(urlRegex);
      console.log(urls);
      if (urls && urls.length !== 0) {
        urls.filter(url => url.endsWith('.mp4')).map(url => e.reply(segment.video(url)));
      }
    } catch (error) {
      console.log(error)
      e.reply("通讯失败, 稍后再试")
    }
  }

  async function handlevoiceModel(e) {
    let response, input, inputStr, forwardMsg, jsonPart, match, url, browser, page;
    try {
      response = await OpenAiChatCmpletions(apiurl, Apikey, model, [{ role: "user", content: msg }]);

      if (!response.ok) {
        e.reply(`HTTP error! status: ${response.status}`);
      }

      input = await response.json();
      inputStr = input?.choices[0]?.message?.content;
      if (!inputStr) {
        e.reply('No content received from API');
      }

      forwardMsg = [inputStr];
      jsonPart = await common.makeForwardMsg(e, forwardMsg, '实时通讯链接');

      match = inputStr.match(/\[.*?\]\((.*?)\)/);
      if (match && match[1]) {
        console.log('提取的URL:', match[1]);
        let forwardMsg = []
        forwardMsg.push('复制到浏览器打开：不要中途打开！！！');
        forwardMsg.push(match[1]);
        const JsonPart = await common.makeForwardMsg(e, forwardMsg, '神秘链接');
        e.reply(JsonPart);
        //url = match[1];
        //browser = await puppeteers.launch({ headless: false });
        //page = await browser.newPage();
        //await page.goto(url, { waitUntil: 'networkidle2' });
      }
    } catch (error) {
      e.reply(error.message);
    }
  }

  async function handlesdModel(e, Apikey, msg, model, apiurl, _path) {
    try {
      const input = await OpenAiChatCmpletions(apiurl, Apikey, model, [{ role: "user", content: msg }]);
      const output = input?.choices[0]?.message?.content
      const imageLinkRegex = /!\[.*?\]\((https?:\/\/.*?)\)/g;
      const imageLinks = output.matchAll(imageLinkRegex);
      if (imageLinks.length !== 0) {
        const imgUrl = Array.from(imageLinks, (match) => match[1]);
        if (!imgUrl || imgUrl.length == 0) {
          e.reply("生成失败了, 请修改提示词或稍后再试");
          return false;
        }
        console.log(imgUrl);
        await replyBasedOnStyle(output, e, model, msg)
        const downloadAndSendImages = async (imgUrls, basePath) => {
          if (!imgUrls || imgUrls.length === 0) {
            return;
          }

          const downloadPromises = imgUrls
            .filter(url => url?.trim())
            .map(async (url, index) => {
              try {
                const filePath = `${basePath}/resources/other_drawing_${index}_chat.png`;
                const response = await fetch(url.trim());

                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }

                const buffer = Buffer.from(await response.arrayBuffer());
                fs.writeFileSync(filePath, buffer, {
                  encoding: null,
                  flag: 'w',
                  mode: 0o666
                });

                return filePath;
              } catch (downloadError) {
                console.error(`下载图片失败 [${url}]:`, downloadError);
                return null;
              }
            });

          try {
            const downloadedFiles = await Promise.all(downloadPromises);
            const validFiles = downloadedFiles.filter(file => file !== null);

            if (validFiles.length > 0) {
              const imageSegments = validFiles.map(filePath => segment.image(filePath));
              await e.reply(imageSegments);
            } else {
              await e.reply('所有图片下载失败');
            }
          } catch (error) {
            console.error('处理图片时发生错误:', error);
            await e.reply('处理图片时发生错误: ' + error.message);
          }
        };

        await downloadAndSendImages(imgUrl, _path);
      }
    } catch (error) {
      console.log(error);
      e.reply("生成失败了, 请修改提示词或稍后再试");
    }
  }

  async function handleGpt4AllModel(e, history, Apikey, search, model, apiurl) {
    const GPT4oResponse = async (messages) => await OpenAiChatCmpletions(apiurl, Apikey, 'gpt-4o', messages);
    const claudeResponse = async (messages) => await OpenAiChatCmpletions(apiurl, Apikey, 'claude-3-5-sonnet', messages);
    const GeminiResponse = async (messages) => await OpenAiChatCmpletions(apiurl, Apikey, 'gemini-2.0-flash-exp', messages);
    switch (true) {
      case model === "mj-chat":
        await handleMJModel(e);
        return false;
      case /(suno|udio)/.test(model):
        await handleSunoModel(e);
        return false;
      case /(luma|runway|vidu|sora)/.test(model):
        await handlelumaModel(e);
        return false;
      case /(ideogram)/.test(model):
        await handleideoModel(e);
        return false;
      case /(stable-diffusion|playground|flux|sd3.5|ssd)/.test(model):
        await handlesdModel(e);
        return false;
      case /(advanced-voice)/.test(model):
        await handlevoiceModel(e);
        return false;
    }
    try {
      const CurrentModels = ["gpt-4-all", "gpt-4-dalle", "gpt-4o-all", "gpt-4-v", "gpt-4o", "o1-preview", "o1-mini"];
      search = CurrentModels.includes(model) ? false : search;
      let History = await reduceConsecutiveRoles(history);
      console.log(History);
      let answer;
      const modelResponders = {
        'gpt': GPT4oResponse,
        'gemini': GeminiResponse,
        'claude': claudeResponse
      };
      async function getModelResponder(model) {
        const modelKey = model.toLowerCase();
        const matchedKey = Object.keys(modelResponders).find(key =>
          modelKey.includes(key)
        );
        return matchedKey ? modelResponders[matchedKey] : GPT4oResponse;
      }
      async function handleModelResponse(history, model) {
        const responder = await getModelResponder(model);
        return await responder(history, model);
      }

      try {
        const response = await OpenAiChatCmpletions(apiurl, Apikey, model, history);
        console.log(response);
        const errorMessage = response?.error?.message;

        if (errorMessage) {
          if (errorMessage.includes('无效的令牌')) {
            e.reply('无效的令牌，请填写正确的阴天密钥后使用!');
            return false;
          } else if (errorMessage.includes('该令牌额度已用尽')) {
            e.reply('该令牌额度已用尽，请更换密钥后使用!');
            return false;
          } else if (
            errorMessage.includes('上游负载已饱和') ||
            errorMessage.includes('当前模型负载较高') ||
            /not cfg .+ in site_map/.test(errorMessage)
          ) {
            answer = await handleModelResponse(model, History, fetch);
          } else {
            e.reply(`请求出错: ${errorMessage}`);
            return false;
          }
          history.pop();
        } else {
          answer = (response?.choices?.length > 0) ? response.choices[0]?.message?.content : null;
        }

      } catch (error) {
        console.log(error);
        const networkErrors = ['Failed to fetch', 'request to', 'network', 'socket hang up'];
        const otherErrors = ['Unexpected token'];
        if (networkErrors.some(msg => error.message?.toLowerCase().includes(msg))) {
          e.reply('与服务器通讯失败，请稍后再试');
          return false;
        } else if (otherErrors.some(msg => error.message?.toLowerCase().includes(msg))) {
          answer = await handleModelResponse(model, History, fetch);
        }

        answer = error.message === 'Timeout' || !answer ?
          await handleModelResponse(model, History, fetch) :
          null;
      }

      if (!answer) {
        e.reply('无有效回复，请稍后再试');
        return false;
      }

      answer = answer.replace(/Content\s+is\s+blocked/gi, '').trim();
      //e.reply(answer);
      history.push({
        "role": "assistant",
        "content": answer
      });
      await saveUserHistory(path, userid, dirpath, history);
      let forwardMsg = []
      let Messages = answer
      const models = ["gpt-4-all", "gpt-4-dalle", "gpt-4-v", "gpt-4o", "gpt-4o-all", "o1-preview", "o1-mini"];
      const keywords = ["json dalle-prompt", `"prompt":`, `"size":`, "json dalle"];
      if (models.includes(model) && keywords.some(keyword => answer.includes(keyword))) {
        const result = await extractDescription(answer);
        Messages = result.descriptionMatch.trim()
        console.log(result)
        try {
          if (result.hasOwnProperty('jsonPart') && JSON.parse(result.jsonPart)) {
            forwardMsg.push(`绘图提示词: \n${JSON.parse(result.jsonPart).prompt || '无'}`)
            forwardMsg.push(`规格: ${JSON.parse(result.jsonPart).size || '1024x1024'}`)
          }

        } catch { }
      }
      console.log(Messages);
      /**
      * 将长文本消息分段添加到转发消息数组
      * @param {Object} e 事件对象
      * @param {String|Array} messages 要发送的消息
      * @param {Number} maxLength 单段最大长度，默认1000字符
      */
      async function sendLongMessage(e, messages, forwardMsg, maxLength = 1000) {
        // 如果是字符串，转换为数组处理
        const msgArray = typeof messages === 'string' ? [messages] : messages;

        try {
          // 先尝试直接将所有消息添加到转发消息中
          const directForwardMsg = [...forwardMsg];
          msgArray.forEach(msg => directForwardMsg.push(msg));

          // 尝试一次性发送所有消息
          const jsonPart = await common.makeForwardMsg(e, directForwardMsg, 'Preview');
          await e.reply(jsonPart);
          logger.info('消息已成功一次性发送');

        } catch (error) {
          logger.warn(`一次性发送失败，将尝试分段发送: ${error.message}`);

          try {
            // 创建新的转发消息数组
            const segmentedForwardMsg = [...forwardMsg];

            // 对每条消息进行处理
            for (let msg of msgArray) {
              if (typeof msg === 'string' && msg.length > maxLength) {
                // 计算需要分成几段
                const segmentCount = Math.ceil(msg.length / maxLength);
                logger.info(`消息长度为${msg.length}，将分为${segmentCount}段发送`);

                // 分段处理文本
                for (let i = 0; i < segmentCount; i++) {
                  const start = i * maxLength;
                  const end = Math.min(start + maxLength, msg.length);
                  const segment = msg.substring(start, end);

                  if (segment.trim()) {
                    segmentedForwardMsg.push(segment);
                  }
                }
              } else {
                segmentedForwardMsg.push(msg);
              }
            }

            // 生成转发消息并发送
            const jsonPart = await common.makeForwardMsg(e, segmentedForwardMsg, 'Preview');
            await e.reply(jsonPart);
            logger.info('消息已成功分段发送');

          } catch (secondError) {
            logger.error(`分段发送也失败了: ${secondError.message}`);
            await e.reply('消息发送失败，请稍后重试');
          }
        }
      }

      let styles = JSON.parse(fs.readFileSync(_path + '/data/YTAi_Setting/data.json')).chatgpt.ai_chat_style;
      let urls = await get_address(answer);
      let pictureProcessed = false; // 标记是否处理了 picture

      if (styles == "picture") {
        try {
          const results = await extractAndRender(answer, {
            outputDir: './resources'
          });
          results.forEach(result => {
            forwardMsg.push(segment.image(result.outputPath));
          });
          pictureProcessed = true; // 标记为已处理
        } catch (error) {
          console.error(error);
        }
      }

      if (urls.length >= 1) {
        const images = await handleImages(urls, _path);
        if (images.length > 0) {
          forwardMsg = [...images, ...forwardMsg];
        }
      }

      // 只发送一次消息
      if (pictureProcessed || urls.length >= 1) {
        await sendLongMessage(e, Messages, forwardMsg);
      }
      await replyBasedOnStyle(Messages, e, model, msg)
      let aiSettingsPath = _path + '/data/YTAi_Setting/data.json';
      let aiSettings = JSON.parse(await fs.promises.readFile(aiSettingsPath, "utf-8"));
      if (aiSettings.chatgpt.ai_tts_open) {
        await handleTTS(e, Messages);
      }
      const isDrawModel = (() => {
        try {
          if (!chat_models) return false;
          const CurrentModel = chat_models.find(m => m?.name === model);
          if (!CurrentModel?.features) return false;
          return CurrentModel.features.includes('drawing');
        } catch {
          return false;
        }
      })();

      console.log(isDrawModel);
      if (isDrawModel || model.includes("gpt-4-gizmo")) {
        let urls = await get_address(answer);
        console.log(3, urls)
        urls.forEach(async (url) => {
          await downloadAndSaveFile(url, path, fetch, _path, fs, e);
        });
      }
    } catch (error) {
      console.log(error);
      const networkErrors = ['Failed to fetch', 'request to', 'network', 'socket hang up'];
      if (networkErrors.some(msg => error.message?.toLowerCase().includes(msg))) {
        e.reply('与服务器通讯失败，请稍后再试');
      } else {
        e.reply("通讯失败: " + error.message);
      }
    }
  }

  async function extractUrl(array) {
    for (const item of array) {
      if (item.type === 'image_url' && item.image_url && item.image_url.url) {
        const url = item.image_url.url;
        if (url.startsWith('https://filesystem.site')) {
          return url;
        }
      }
    }
    return null;
  }

  async function handleImages(urls, _path) {
    // 如果没有URLs，直接返回
    if (!urls || urls.length === 0) {
      return ["预览:"];
    }

    // 并行下载所有图片
    const downloadPromises = urls.map(async (url, index) => {
      const filePath = path.join(_path, 'resources', `dall_e_chat_${index}.png`);
      try {
        const result = await downloadImage(path, url, filePath);
        if (result.success) {
          // 下载成功返回文件路径
          return { success: true, path: filePath };
        } else {
          // 下载失败返回URL
          return { success: false, url: url.trim() };
        }
      } catch (error) {
        console.error(`下载失败: ${url}`, error);
        return { success: false, url: url.trim() };
      }
    });

    try {
      // 等待所有下载完成
      const results = await Promise.all(downloadPromises);

      // 初始化结果数组
      const imageResults = ["预览:"];

      // 收集所有成功下载的图片
      const successfulImages = results
        .filter(result => result.success)
        .map(result => segment.image(result.path));

      // 如果有成功下载的图片，一次性发送
      if (successfulImages.length > 0) {
        await e.reply(successfulImages);
      }

      // 将失败的URL添加到结果数组
      results.forEach(result => {
        if (!result.success) {
          imageResults.push(result.url);
        }
      });

      return imageResults;
    } catch (error) {
      console.error('处理图片时发生错误:', error);
      return ["预览:", "处理图片时发生错误"];
    }
  }

  async function downloadImage(path, url, filePath) {
    const fileExtension = path.extname(url).toLowerCase();
    if (!['.webp', '.png', '.jpg'].includes(fileExtension) && fileExtension) {
      return { success: false };
    }

    const downloadTimeout = 40000;
    let downloadAborted = false;

    const downloadPromise = async () => {
      try {
        const response = await axios({
          url: url.trim(),
          method: 'GET',
          responseType: 'stream'
        });

        if (response.status >= 400) {
          throw new Error(`Failed to download ${url}: ${response.status}`);
        }

        const file = fs.createWriteStream(filePath);
        response.data.pipe(file);

        await new Promise((resolve, reject) => {
          file.on('finish', resolve);
          file.on('error', reject);
        });

        if (!downloadAborted) {
          return { success: true };
        }
        return { success: false };

      } catch (err) {
        console.error(err);
        return { success: false };
      }
    };

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => {
        downloadAborted = true;
        reject(new Error('Download timed out'));
      }, downloadTimeout)
    );

    try {
      const result = await Promise.race([downloadPromise(), timeoutPromise]);
      return result;
    } catch (err) {
      console.error(err);
      return { success: false };
    }
  }

  async function extractDescription(str) {
    const removeAllOccurrences = (array, str) =>
      Array.isArray(array) && array.length
        ? array.reduce((acc, item) => (item && str ? acc.split(item).join('') : acc), str)
        : str;
    const jsonMatch = str.match(/\s*{\s*\n*\s*"size"\s*:\s*"(.*?)"\s*\n*}\s*/gs) || str.match(/\s*{\s*\n*\s*"prompt"\s*:\s*"(.*?)"\s*\n*}\s*/gs);
    try {
      const rules = str.replace(/[\r\n\x0B\x0C\u0085\u2028\u2029]+/g, '').replace(/[\u007F-\uFFFF]/g, '');
      const jsonPart = rules.match(/\s*{\s*"prompt"\s*:\s*"(.*?)"\s*}\s*/s)?.[0] || rules.match(/\s*{\s*"size"\s*:\s*"(.*?)"\s*}\s*/s)?.[0];
      let descriptionMatch = str.replace(/(```json\sdalle-prompt|```json\sdalle|```json|```)/g, '');
      descriptionMatch = descriptionMatch.replace(jsonPart, '');
      descriptionMatch = removeAllOccurrences(jsonMatch, descriptionMatch);
      descriptionMatch = await Replaces(descriptionMatch)
      return { jsonPart, descriptionMatch };
    } catch {
      let descriptionMatch = str.replace(/(```json\sdalle-prompt|```json\sdalle|```json|```)/g, '');
      descriptionMatch = await Replaces(descriptionMatch)
      return { descriptionMatch };
    }
  }

  async function Replaces(descriptionMatch) {
    let description = descriptionMatch.replace(/\!\[[\s\S]*?\]\(https:\/\/filesystem\.site\/cdn\/.*?\)\n\n/g, '');
    description = description.replace(/\[下载[\s\S]*?\]\(https:\/\/filesystem\.site\/cdn\/download\/.*?\)\n/g, '');
    description = description.replace(/\!\[.*?\]\(https:\/\/filesystem.site\/cdn\/.*?\)\n\n/g, '');
    description = description.replace(/\[下载\d+\]\(https:\/\/filesystem.site\/cdn\/download\/.*?\)\n/g, '');
    description = description.replace(/\{[^{}]*"prompt"[^{}]*"size"[^{}]*\}\s*/g, '');
    return description
  }

  /**
   * 保存用户历史记录
   * 优先保存到 Redis，然后同步保存到本地 JSON 文件
   * 即使 Redis 保存成功，也会同步保存到本地
   * 如果 Redis 保存失败，仍然会保存到本地文件
   * @param {string} userId - 用户 ID
   * @param {string} dirpath - 本地存储目录路径
   * @param {Array} history - 用户历史记录数组
   */
  async function saveUserHistory(path, userId, dirpath, history) {
    const redisKey = `YTUSER_CHAT:${userId}`;
    const historyPath = path.join(dirpath, 'user_cache', `${userId}.json`);
    try {
      const lastSystemMessage = history.filter(item => item.role === 'system').pop();
      if (lastSystemMessage) {
        history = history.filter(item => item.role !== 'system');
        history.unshift(lastSystemMessage);
      }
      const historyJson = JSON.stringify(history, null, 2);
      try {
        await global.redis.set(redisKey, historyJson);
        console.log(`用户历史已保存到 Redis: ${userId}`);
      } catch (redisErr) {
        console.error(`保存用户历史到 Redis 失败: ${redisErr}`);
      }
      const dir = path.dirname(historyPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(historyPath, historyJson, { encoding: 'utf-8' });
      console.log(`用户历史已保存到本地文件: ${historyPath}`);
    } catch (err) {
      console.error(`保存用户历史失败: ${err}`);
    }
  }

  async function downloadAndSaveFile(url, path, fetch, _path, fs, e) {
    try {
      const response = await fetch(url.trim());
      const fileBuffer = await response.arrayBuffer();
      const urlPartArray = url.split('/');
      const filename = urlPartArray[urlPartArray.length - 1];
      async function getFileExtension(filename) {
        let ext = path.extname(filename);
        if (ext.startsWith(".")) {
          return ext;
        }
        return '无法识别的文件类型';
      }
      async function getFileExtensionFromUrl(url) {
        let filename = path.basename(url);
        return await getFileExtension(filename);
      }
      let fileExtension = await getFileExtensionFromUrl(url);
      const time = new Date().getTime()
      if (!fs.existsSync(`${_path}/resources/YT_alltools`)) {
        fs.mkdirSync(`${_path}/resources/YT_alltools`)
      }
      const filePath = `${_path}/resources/YT_alltools/${time}${fileExtension}`
      fs.writeFileSync(filePath, Buffer.from(fileBuffer));
      console.log(fileExtension)
      if (!['.webp', '.png', '.jpg'].includes(fileExtension) && fileExtension !== '无法识别的文件类型') {
        if (e.group_id) {
          await e.group.sendFile(filePath);
        } else {
          await e.friend.sendFile(filePath);
        }
      }
      //e.reply(`${filename}文件成功保存在 ${filePath}`, true, { recallMsg: 6 });
    } catch (error) {
      console.error(`失败了: ${url}: ${error}`);
    }
  }

  async function reduceConsecutiveRoles(array) {
    let lastSystemItem = null;
    const result = [];
    let currentUserContent = [];
    if (array.length > 0 && array[0].role === 'assistant') {
      array = array.slice(1);
    }
    for (const item of array) {
      switch (item.role) {
        case 'user':
          if (Array.isArray(item.content)) {
            if (currentUserContent.length > 0) {
              result.push({ role: 'user', content: currentUserContent.join('\n') });
              currentUserContent = [];
            }
            result.push(item);
          } else {
            currentUserContent.push(item.content);
          }
          break;
        case 'system':
          lastSystemItem = item;
          break;
        default:
          if (currentUserContent.length > 0) {
            result.push({ role: 'user', content: currentUserContent.join('\n') });
            currentUserContent = [];
          }
          result.push(item);
      }
    }
    if (currentUserContent.length > 0) {
      result.push({ role: 'user', content: currentUserContent.join('\n') });
    }
    if (lastSystemItem) {
      result.unshift(lastSystemItem);
    }

    return result;
  }

  async function extractImageLinks2(answer) {
    const imageLinkRegex = /\[下载.*?\]\((https:\/\/filesystem.site\/cdn\/download\/.*?)\)/g;
    const imageLinks = answer.matchAll(imageLinkRegex);
    return Array.from(imageLinks, (match) => match[1]);
  }

  async function processArray(arr, limit) {
    if (!arr?.length || limit <= 1) return [];

    // 提取system消息
    const systemMsg = arr.find(item => item.role === 'system');

    // 从数组末尾开始处理对话组
    const processedGroups = [];
    let currentGroup = {
      assistant: null,
      user: null
    };

    // 处理content数组，保留原始结构
    const processContent = (content) => {
      if (!Array.isArray(content)) return content;

      // 分离text类型和非text类型的内容
      const textItems = content.filter(item => item.type === 'text');
      const nonTextItems = content.filter(item => item.type !== 'text');

      // 如果没有text类型，直接返回原内容
      if (textItems.length === 0) return content;

      // 合并所有text类型项
      const mergedTextItem = {
        type: 'text',
        text: textItems.map(item => item.text).join(' ')
      };

      // 返回合并后的数组，保持原有顺序
      return [mergedTextItem, ...nonTextItems];
    };

    // 从后向前遍历数组
    for (let i = arr.length - 1; i >= 0; i--) {
      const current = arr[i];

      if (current.role === 'system') continue;

      if (current.role === 'assistant') {
        if (!currentGroup.assistant) {
          currentGroup.assistant = {
            ...current,
            content: processContent(current.content)
          };
        } else {
          // 合并assistant消息，保持content结构
          const mergedContent = Array.isArray(current.content) && Array.isArray(currentGroup.assistant.content)
            ? [...processContent(current.content), ...currentGroup.assistant.content]
            : current.content;
          currentGroup.assistant.content = mergedContent;
        }
      }

      if (current.role === 'user') {
        if (!currentGroup.user) {
          currentGroup.user = {
            ...current,
            content: processContent(current.content)
          };
        } else {
          // 合并user消息，保持content结构
          const mergedContent = Array.isArray(current.content) && Array.isArray(currentGroup.user.content)
            ? [...processContent(current.content), ...currentGroup.user.content]
            : current.content;
          currentGroup.user.content = mergedContent;
        }

        if (currentGroup.assistant) {
          processedGroups.push([currentGroup.user, currentGroup.assistant]);
          if (processedGroups.length >= limit) break;
          currentGroup = { assistant: null, user: null };
        }
      }
    }

    // 构建最终结果数组
    const result = [];
    if (systemMsg) result.push(systemMsg);

    processedGroups.reverse().forEach(group => {
      result.push(...group);
    });

    return result;
  }
}

export { run_conversation }