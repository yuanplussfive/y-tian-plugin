import { god_models } from "../YTOpen-Ai/god-models.js";

async function god_conversation(UploadFiles, extractCodeBlocks, extractAndRender, FreeChat35_3, FreeChat35_4, FreeChat35_5, FreeGemini_1, FreeGemini_2, FreeGemini_3, FreeClaude_1, imgurl, dirpath, e, apiurl, group, common, puppeteer, fs, _path, path, Bot_Name, fetch, replyBasedOnStyle, handleTTS, stoken, WebSocket, crypto, querystring, https, request, ocrurl, axios, GPT4oResponse, GeminiResponse, claudeResponse, Anime_tts_roles) {
  const chatgptConfig = JSON.parse(fs.readFileSync(`${dirpath}/data.json`, "utf-8")).chatgpt;
  const { search } = chatgptConfig;
  const godgptConfig = JSON.parse(fs.readFileSync(`${dirpath}/model.json`, "utf-8")).godgpt;
  const { model } = godgptConfig
  let msg = await formatMessage(e.msg) || '...';
  let SettingsPath = _path + '/data/YTAi_Setting/data.json';
  let Settings = JSON.parse(await fs.promises.readFile(SettingsPath, "utf-8"));
  let { god_moment_numbers, god_moment_open } = Settings.chatgpt;
  let userid = group ? (e.group_id ?? e.user_id) : e.user_id;
  //console.log(userid)
  let history = await loadUserHistory(path, userid, dirpath);
  if (god_moment_open) {
    history = await processArray(history, god_moment_numbers)
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
  let { prompts_answers, prompts_answer_open, ai_private_plan, ai_private_open } = aiSettings.chatgpt;
  if (prompts_answers && prompts_answer_open) {
    const tips = prompts_answers
    await e.reply(tips, true, { recallMsg: 6 });
  }
  let message = msg;
  if (imgurl.length > 0) {

    const isValidModel = (() => {
      try {
        if (!god_models?.models) return false;
        const CurrentModel = god_models.models.find(m => m?.name === model);
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
  await MainModel(e, history, stoken, search, model, apiurl, path);

  async function formatMessage(originalMsg) {
    if (originalMsg) {
      const msgs = originalMsg.replace(/(\/|#)godgpt|(#|\/)chat/g, "").trim().replace(new RegExp(Bot_Name, "g"), "");
      return msgs
    } else {
      return undefined
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
    const redisKey = `YTUSER_GOD:${userId}`;
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

  async function handleSunoModel(e, stoken, msg, model, apiurl, _path) {
    try {
      let answer;
      const response = await fetch(apiurl, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${stoken}`,
        },
        body: JSON.stringify({
          model: model,
          stream: true,
          messages: [{ role: "user", content: msg }]
        }),
      });
      const input = await response.text();
      console.log(input)
      const urlRegex = /https:\/\/filesystem\.site\/cdn\/[0-9]{8}\/[A-Za-z0-9]+(\.(mp3|mp4))/g;
      const contentMatch = input.match(/"delta":{"content":"([\s\S]*?)"}/g);
      const contentArray = contentMatch?.map(match => match.replace(/"delta":{"content":"([\s\S]*?)"}/, '$1').replace(/\\n/g, "\n")) || [];
      answer = contentArray.join('').trim();
      e.reply(answer);
      console.log(answer)
      const urls = answer.match(urlRegex)
      console.log(urls)
      if (urls.length !== 0) {
        urls.filter(url => url.endsWith('.mp3')).map(url => e.reply(segment.record(url)));
        urls.filter(url => url.endsWith('.mp4')).map(url => e.reply(segment.video(url)));
      }
    } catch (error) {
      console.log(error)
      e.reply("通讯失败, 稍后再试")
    }
  }

  async function handlesdModel(e, stoken, msg, model, apiurl, _path) {
    async function transform(msg) {
      try {
        let response = await fetch("https://translate-api-fykz.xiangtatech.com/translation/webs/index", {
          "method": "POST",
          "headers": {
            "content-type": "application/x-www-form-urlencoded",
          },
          "body": `appid=105&sgid=auto&sbid=auto&egid=en&ebid=en&content=${msg}&type=2`
        });
        let response_json = await response.json()
        return await response_json.by
      } catch {
        return msg
      }
    }
    try {
      const response = await fetch(apiurl, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${stoken}`,
        },
        body: JSON.stringify({
          model: model,
          stream: false,
          messages: [{ role: "user", content: await transform(msg) }]
        }),
      });
      const input = await response.json();
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
        let styles = JSON.parse(fs.readFileSync(_path + '/data/YTAi_Setting/data.json')).chatgpt.ai_chat_style;
        await replyBasedOnStyle(styles, output, e, model, puppeteer, fs, _path, msg, common)
        const downloadAndSendImages = async (imgUrls, basePath) => {
          try {
            for (const [index, url] of imgUrls.entries()) {
              if (!url?.trim()) {
                continue;
              }
              const filePath = `${basePath}/resources/other_drawing_${index}_chat.png`;
              try {
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
                await e.reply(segment.image(filePath));
              } catch (downloadError) {
                console.error(`下载图片失败 [${url}]:`, downloadError);
                await e.reply(`第${index + 1}张图片下载失败: ${downloadError.message}`);
              }
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

  async function handlelumaModel(e, stoken, msg, model, apiurl, _path) {
    try {
      let answer;
      let question = msg
      const links = await extractUrl(imgurl);
      console.log(links)
      if (links && links.length !== 0) {
        question = `${links} ${question}`
      }
      const response = await fetch(apiurl, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${stoken}`,
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
      let styles = JSON.parse(fs.readFileSync(_path + '/data/YTAi_Setting/data.json')).chatgpt.ai_chat_style;
      await replyBasedOnStyle(styles, answer, e, model, puppeteer, fs, _path, question, common)
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

  async function handleideoModel(e, stoken, msg, model, apiurl, _path) {
    try {
      const extractAndProcessUrls = (inputString) => {
        const regex = /https:\/\/(?:filesystem\.site\/cdn\/\d{8}\/[a-zA-Z0-9]+?\.[a-z]{2,4}|yuanpluss\.online:\d+\/files\/[a-zA-Z0-9_\/]+?\.[a-z]{2,4})/g;
        const matches = inputString.match(regex) || [];
        const uniqueUrls = [...new Set(matches)];
        const urls = uniqueUrls.map(url => ({ url }));
        return urls;
      };
      const response = await fetch(apiurl, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${stoken}`,
        },
        body: JSON.stringify({
          "model": "ideogram",
          "stream": true,
          "messages": [
            {
              "role": "user",
              "content": msg
            }
          ]
        }),
      });
      const input = await response.text();
      const inputString = await extractContent(input);
      const urls = extractAndProcessUrls(inputString);
      console.log(urls);
      if (urls.length !== 0) {
        let images = [];
        urls.forEach(urlObj => {
          images.push(segment.image(urlObj.url));
        });
        e.reply(images);
      }
    } catch (error) {
      console.log(error)
      e.reply("通讯失败, 稍后再试")
    }
  }

  async function MainModel(e, history, stoken, search, model, apiurl, path) {
    try {
      const CurrentModels = ["gpt-4-all", "gpt-4-dalle", "gpt-4o-all", "gpt-4-v", "gpt-4o", "o1-preview", "o1-mini"];
      search = CurrentModels.includes(model) ? false : search;
      const modelType = {
        suno: model.includes("suno"),
        luma: model.includes("luma") ||
          model.includes("sora"),
        ideogram: model.includes("ideogram"),
        sd: model.includes("stable-diffusion") ||
          model.includes("playground") ||
          model.includes("ssd") ||
          model.includes("sd3.5") ||
          model.includes("flux")
      };
      switch (true) {
        case modelType.suno:
          await handleSunoModel(e, stoken, msg, model, apiurl, _path);
          return false;
        case modelType.luma:
          await handlelumaModel(e, stoken, msg, model, apiurl, _path);
          return false;
        case modelType.ideogram:
          await handleideoModel(e, stoken, msg, model, apiurl, _path);
          return false;
        case modelType.sd:
          await handlesdModel(e, stoken, msg, model, apiurl, _path);
          return false;
      }
      console.log(history)
      let History = await reduceConsecutiveRoles(history);
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
      async function handleModelResponse(model, history, fetch) {
        const responder = await getModelResponder(model);
        return await responder(history, fetch);
      }

      try {
        const timeoutSettings = {
          'claude': 100000,
          'gemini': 120000,
          'all': 210000,
          'default': 180000
        };
        const timeoutDuration = Object.entries(timeoutSettings).find(([key, _]) =>
          model.toLowerCase().includes(key)
        )?.[1] || timeoutSettings.default;
        const response = await Promise.race([
          fetch(apiurl, {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${stoken}`,
            },
            body: JSON.stringify({
              model: model,
              messages: History,
              search: search,
            }),
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), timeoutDuration)
          ),
        ]);

        let response_json = await response.json();
        const errorMessage = response_json?.msg;

        if (errorMessage) {
          if (errorMessage.includes('无效的api')) {
            e.reply('无效的令牌，请填写正确的阴天密钥后使用!');
            return false;
          } else if (errorMessage.includes('剩余积分不足')) {
            e.reply('该令牌额度已用尽，请更换密钥后使用!');
            return false;
          } else if (
            errorMessage.includes('上游负载已饱和') ||
            /not cfg .+ in site_map/.test(errorMessage)
          ) {
            answer = await handleModelResponse(model, History, fetch);
          } else {
            e.reply(`请求出错: ${errorMessage}`);
            return false;
          }
        } else {
          answer = (response_json?.choices?.length > 0) ? response_json.choices[0]?.message?.content : null;
        }

      } catch (error) {
        console.log(error);
        const networkErrors = ['Failed to fetch', 'request to', 'network'];
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
      history.push({
        "role": "assistant",
        "content": answer
      });
      await saveUserHistory(path, userid, dirpath, history);
      let Messages = answer
      const models = ["gpt-4-all", "gpt-4-dalle", "gpt-4-v", "gpt-4o", "gpt-4o-all", "ideogram", "o1-preview", "o1-mini"];
      const keywords = ["json dalle-prompt", `"prompt":`, `"size":`, "json dalle"];
      if (models.includes(model) && keywords.some(keyword => answer.includes(keyword))) {
        const result = await extractDescription(answer);
        Messages = result.descriptionMatch.trim()
        console.log(result)
        try {
          if (result.hasOwnProperty('jsonPart') && JSON.parse(result.jsonPart)) {
            let forwardMsg = []
            forwardMsg.push(JSON.parse(result.jsonPart).prompt)
            forwardMsg.push(JSON.parse(result.jsonPart).size)
            const JsonPart = await common.makeForwardMsg(e, forwardMsg, 'dall-e-3绘图prompt');
            e.reply(JsonPart)
          }
        } catch { }
      }
      console.log(Messages)
      let styles = JSON.parse(fs.readFileSync(_path + '/data/YTAi_Setting/data.json')).chatgpt.ai_chat_style;
      let urls = await get_address(answer);
      if (styles == "picture") {
        let forwardMsg = [];
        try {
          const results = await extractAndRender(Messages, {
            outputDir: './resources'
          });
          forwardMsg.push("预览效果");
          results.forEach(result => {
            forwardMsg.push(segment.image(result.outputPath));
          });
        } catch { }
        forwardMsg.push(Messages);
        const JsonPart = await common.makeForwardMsg(e, forwardMsg, 'Preview');
        //e.reply(Messages)
        e.reply(JsonPart);
        if (urls.length !== 0) {
          let uniqueUrls = [...new Set(urls)];
          if (uniqueUrls.length > 1) {
            const duplicateIndex = uniqueUrls.findIndex(url => url.includes('download'));
            uniqueUrls.splice(duplicateIndex, 1);
          }
          console.log(uniqueUrls)
        }
      }
      await replyBasedOnStyle(styles, Messages, e, model, puppeteer, fs, _path, msg, common)
      let aiSettingsPath = _path + '/data/YTAi_Setting/data.json';
      let aiSettings = JSON.parse(await fs.promises.readFile(aiSettingsPath, "utf-8"));
      if (aiSettings.chatgpt.ai_tts_open) {
        const speakers = aiSettings.chatgpt.ai_tts_role;
        console.log(aiSettings.chatgpt.ai_tts_role);
        const roles = Anime_tts_roles(speakers);
        if (roles) {
          await handleTTS(e, roles, Messages, fetch, _path);
        }
      }
      if (model == "gpt-4-dalle") {
        let result = await extractImageLinks2(answer)
        console.log(result)
        if (result.length === 0) {
          return false
        }
        result.forEach((url, index) => {
          const dirpath = `${_path}/resources/dall_e_plus_${index}_god.png`;
          downloadImage(path, url, e, dirpath);
        })
      }
      const highmodels = ["gpt-4-all", "gpt-4o", "gpt-4o-all", "o1-mini", "o1-preview"];

      if (highmodels.includes(model)) {
        let urls = await get_address(answer);
        if (urls.length !== 0) {
          try {
            urls = await removeDuplicates(urls);
          } catch (error) {
            e.reply(error);
          }
          const filePath = path.join(_path, 'resources', 'dall_e_god.png');
          for (const url of urls) {
            try {
              await downloadImage(path, url, e, filePath);
            } catch (error) {
              e.reply(error);
            }
          }
        }
        console.log(3, urls)
        urls.forEach(async (url) => {
          await downloadAndSaveFile(url, path, fetch, _path, fs, e);
        });
      }
    } catch (error) {
      console.log(error);
      const networkErrors = ['Failed to fetch', 'request to', 'network'];
      if (networkErrors.some(msg => error.message?.toLowerCase().includes(msg))) {
        e.reply('与服务器通讯失败，请稍后再试');
      } else {
        e.reply("通讯失败: " + error.message);
      }
    }
  }

  async function removeDuplicates(array) {
    const result = array.filter((item, index) => {
      if (item.indexOf('/cdn/download/') == -1) {
        return true;
      } else {
        const nonDownloadUrl = item.replace('/cdn/download/', '/cdn/');
        return array.indexOf(nonDownloadUrl) == -1;
      }
    });
    return result;
  }

  async function getFileUrl(e, type) {
    return await e[type].getFileUrl(e.file.fid);
  }

  async function TakeFiles(e) {
    let files = await getFileUrl(e, e.group_id ? 'group' : 'friend');
    if (files) {
      files = [files]
    }
    return files
  }

  async function TakeImages(e) {
    let imgurl;
    if (e.getReply) {
      imgurl = await e.getReply()
    } else if (e.source) {
      if (e.group?.getChatHistory)
        imgurl = (await e.group.getChatHistory(e.source.seq, 1)).pop()
      else if (e.friend?.getChatHistory)
        imgurl = (await e.friend.getChatHistory(e.source.time, 1)).pop()
    }
    if (imgurl?.message) for (const i of imgurl.message)
      if ((i.type == "image" || i.type == "file") && i.url) {
        imgurl = [i.url]
        break
      }
    if (e.img) {
      imgurl = e.img
    }
    return imgurl
  }

  async function downloadImage(path, url, e, filePath) {
    const fileExtension = path.extname(url).toLowerCase();
    console.log(fileExtension);

    if (!['.webp', '.png', '.jpg'].includes(fileExtension)) {
      return;
    }
    const downloadTimeout = 40000;
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
        console.log(111);
        e.reply(segment.image(filePath));
      } catch (err) {
        console.log(err);
        e.reply(url.trim());
      }
    };
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Download timed out')), downloadTimeout)
    );

    try {
      await Promise.race([downloadPromise(), timeoutPromise]);
    } catch (err) {
      if (err.message === 'Download timed out') {
        e.reply(segment.image(url.trim()));
      } else {
        throw err;
      }
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
    const redisKey = `YTUSER_GOD:${userId}`;
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

  async function get_address(inputString) {
    const regex = /!?\[([^\]]*?)\]\((https:\/\/(?:filesystem\.site\/cdn\/\d{8}\/[a-zA-Z0-9]+?\.[a-z]{2,4}|yuanpluss\.online:\d+\/files\/[a-zA-Z0-9_\/]+?\.[a-z]{2,4}))\)/g;
    let match;
    let links = [];
    while ((match = regex.exec(inputString)) !== null) {
      const link = match[2];
      if (!links.includes(link)) {
        links.push(link);
      }
    }
    console.log(links);
    return links
  }

  async function downloadAndSaveFile(url, path, fetch, _path, fs, e) {
    try {
      const response = await fetch(url.trim());
      const fileBuffer = await response.arrayBuffer();
      const urlPartArray = url.split('/');
      const filename = urlPartArray[urlPartArray.length - 1];
      function getFileExtension(filename) {
        let ext = path.extname(filename);
        if (ext.startsWith(".")) {
          return ext;
        }
        return '无法识别的文件类型';
      }
      function getFileExtensionFromUrl(url) {
        let filename = path.basename(url);
        return getFileExtension(filename);
      }
      let fileExtension = getFileExtensionFromUrl(url);
      const time = new Date().getTime()
      if (!fs.existsSync(`${_path}/resources/YT_alltools`)) {
        fs.mkdirSync(`${_path}/resources/YT_alltools`)
      }
      const filePath = `${_path}/resources/YT_alltools/${time}${fileExtension}`
      fs.writeFileSync(filePath, Buffer.from(fileBuffer));
      if (!['.webp', '.png', '.jpg'].includes(fileExtension) && fileExtension !== '无法识别的文件类型') {
        if (e.group_id) {
          await e.group.sendFile(filePath);
        } else {
          await e.friend.sendFile(filePath);
        }
      }
      e.reply(`${filename}文件成功保存在 ${filePath}`, true, { recallMsg: 6 });
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

  async function processArray(arr, numbers) {
    const userCount = arr.reduce((count, obj) => {
      if (obj.role === "user") {
        if (Array.isArray(obj.content)) {
          return count + obj.content.reduce((acc, item) => item.type === "text" ? acc + 1 : acc, 0);
        }
        return count + 1;
      }
      return count;
    }, 0);
    const systemIndex = arr.findIndex(obj => obj.role === "system");
    if (userCount >= numbers) {
      let newArr = [];
      if (systemIndex !== -1) {
        newArr.push(arr[systemIndex]);
      }
      for (let i = arr.length - 1; i >= 0; i--) {
        const obj = arr[i];
        if (obj.role !== "user" && obj.role !== "assistant") {
          newArr.unshift(obj);
        } else if (newArr.length < numbers) {
          if (obj.role === "user") {
            if (Array.isArray(obj.content)) {
              let validContent = obj.content.filter(item => item.type === "text");
              if (validContent.length > 0) {
                newArr.unshift({
                  ...obj,
                  content: validContent
                });
              }
            } else {
              newArr.unshift(obj);
            }
            if (arr[i + 1]?.role === "assistant") {
              newArr.unshift(arr[i + 1]);
              i--;
            }
          } else {
            newArr.unshift(obj);
          }
        }
      }
      return newArr;
    }
    return arr;
  }
}

export { god_conversation }