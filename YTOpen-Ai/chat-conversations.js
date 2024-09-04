async function run_conversation(UploadFiles, FreeChat35_1, FreeChat35_2, FreeChat35_3, FreeChat35_4, FreeChat35_5, FreeGemini_1, FreeGemini_2, FreeGemini_3, FreeClaude_1, dirpath, e, apiurl, group, common, puppeteer, fs, _path, path, Bot_Name, fetch, replyBasedOnStyle, handleTTS, Apikey, imgurl, https, crypto, WebSocket, axios, GPT4oResponse, GeminiResponse, claudeResponse) {
  const chatgptConfig = JSON.parse(fs.readFileSync(`${dirpath}/data.json`, "utf-8")).chatgpt;
  const { model, search } = chatgptConfig;
  let msg = await formatMessage(e.msg) || '分析这个文件';
  let SettingsPath = _path + '/data/YTAi_Setting/data.json';
  let Settings = JSON.parse(await fs.promises.readFile(SettingsPath, "utf-8"));
  let { chat_moment_numbers, chat_moment_open } = Settings.chatgpt;
  let userid = (group == false)
    ? (!e.group_id ? (e.from_id ?? e.user_id) : e.user_id)
    : (!e.group_id ? (e.from_id ?? e.user_id) : e.group_id);
  //console.log(userid)
  let history = await loadUserHistory(path, userid, dirpath);
  if (chat_moment_open) {
    history = await processArray(history, chat_moment_numbers)
  }
  const hasSystemRole = history.some(item => item.role === "system");
  const datas = JSON.parse(await fs.promises.readFile(`${_path}/data/YTAi_Setting/data.json`, "utf-8"));
  const hasSystemItem = datas.chatgpt?.add_systems_open?.[userid] || false;
  //console.log('开关', hasSystemItem)
  if (fs.existsSync(`${_path}/data/YTAi_Setting/user_system/${userid}.json`) && !hasSystemRole && hasSystemItem) {
    const systemObj = JSON.parse(fs.readFileSync(`${_path}/data/YTAi_Setting/user_system/${userid}.json`, "utf-8"));
    history.unshift(...systemObj);
  }
  let aiSettingsPath = _path + '/data/YTAi_Setting/data.json';
  let aiSettings = JSON.parse(await fs.promises.readFile(aiSettingsPath, "utf-8"));
  let { prompts_answers, prompts_answer_open } = aiSettings.chatgpt;
  if (prompts_answers && prompts_answer_open) {
    const tips = prompts_answers
    await e.reply(tips, true, { recallMsg: 6 });
  }
  let message = msg;
  if (imgurl.length > 0) {
    const Models = [
      "gpt-4-all",
      "claude-3-5-sonnet-20240620",
      "gpt-4-dalle",
      "gpt-4o",
      "gpt-4o-all",
      "gpt-4-v",
      "gemini"
    ];
    if (Models.includes(model) || model.includes("gpt-4-gizmo")) {
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
  await handleGpt4AllModel(e, history, Apikey, search, model, apiurl, path, https, _path);

  async function formatMessage(originalMsg) {
    if (originalMsg) {
      const msgs = originalMsg.replace(/(\/|#)godgpt|(#|\/)chat/g, "").trim().replace(new RegExp(Bot_Name, "g"), "");
      return msgs
    } else {
      return undefined
    }
  }

  async function loadUserHistory(path, userId, dirpath) {
    const historyPath = path.join(dirpath, 'user_cache', `${userId}.json`);
    try {
      const data = fs.readFileSync(historyPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      } else {
        throw error;
      }
    }
  }

  async function handleMJModel(e, history, Apikey, search, model, apiurl, path, https, _path) {
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
      const response = await fetch(apiurl, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Apikey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: filteredArray
        }),
      });
      let response_json = await response.json();
      console.log(response_json)
      answer = await response_json.choices[0].message.content;
      e.reply(answer);
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
        const filePath = path.join(_path, 'resources', 'dall_e_chat.png');
        for (const url of urls) {
          try {
            const downloadTimeout = 40000;
            let urlSent = false;
            let downloadAborted = false;
            let url = urls[0];
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
            e.reply(error);
          }
        }
      }
      await saveUserHistory(path, userid, history);
    } catch {
      e.reply("通讯失败, 稍后再试")
    }
  }

  async function handleSunoModel(e, Apikey, msg, model, apiurl, _path) {
    try {
      let answer;
      const response = await fetch(apiurl, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Apikey}`,
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

  async function handlelumaModel(e, Apikey, msg, model, apiurl, _path) {
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
      e.reply(answer);
      console.log(answer)
      const urls = answer.match(urlRegex)
      console.log(urls)
      if (urls.length !== 0) {
        urls.filter(url => url.endsWith('.mp4')).map(url => e.reply(segment.video(url)));
      }
    } catch (error) {
      console.log(error)
      e.reply("通讯失败, 稍后再试")
    }
  }

  async function handlesdModel(e, Apikey, msg, model, apiurl, _path) {
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
          "Authorization": `Bearer ${Apikey}`,
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
        if (!imgUrl) {
          e.reply("生成失败了, 请修改提示词或稍后再试");
          return false;
        }
        console.log(imgUrl)
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => {
            resolve('timeout');
          }, 15000);
        });
        try {
          const result = await Promise.race([
            UploadFiles(imgUrl[0], 'chat.png'),
            timeoutPromise
          ]);
          if (result === 'timeout') {
            e.reply(imgUrl[0]);
          } else {
            e.reply(segment.image(result));
          }
        } catch (error) {
          console.error(error);
          e.reply(imgUrl[0]);
        }
      } else {
        e.reply(output);
      }
    } catch (error) {
      console.log(error);
      e.reply("生成失败了, 请修改提示词或稍后再试");
    }
  }

  async function handleGpt4AllModel(e, history, Apikey, search, model, apiurl, path, https, _path) {
    switch (true) {
      case model === "mj-chat":
        await handleMJModel(e, history, Apikey, search, model, apiurl, path, https, _path);
        return false;
      case /suno/.test(model):
        await handleSunoModel(e, Apikey, msg, model, apiurl, _path);
        return false;
      case /(luma|runway|vidu)/.test(model):
        await handlelumaModel(e, Apikey, msg, model, apiurl, _path);
        return false;
      case /(stable-diffusion|playground)/.test(model):
        await handlesdModel(e, Apikey, msg, model, apiurl, _path);
        return false;
    }
    try {
      const CurrentModels = ["gpt-4-all", "gpt-4-dalle", "gpt-4o-all", "gpt-4-v", "gpt-4o"];
      search = CurrentModels.includes(model) ? false : true;
      let History = await reduceConsecutiveRoles(history);
      console.log(History);
      let answer
      try {
        const response = await Promise.race([
          fetch(apiurl, {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Apikey}`,
            },
            body: JSON.stringify({
              model: model,
              messages: History,
              search: search,
            }),
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 300000)
          ),
        ]);

        let response_json = await response.json();
        console.log(response_json)
        const errorMessage = response_json?.error?.message;
        if (errorMessage) {
          if (errorMessage.includes('无效的令牌')) {
            e.reply('无效的令牌，请填写正确的阴天密钥后使用!');
            return false;
          } else if (errorMessage.includes('该令牌额度已用尽')) {
            e.reply('该令牌额度已用尽，请更换密钥后使用!');
            return false;
          }
        }
        answer = (response_json?.choices?.length > 0) ? response_json.choices[0]?.message?.content : null;
      } catch (error) {
        if (error.message === 'Timeout') {
          answer = model.includes("gpt-3.5-turbo") ? await FreeChat35Functions(FreeChat35_1, FreeChat35_2, FreeChat35_3, FreeChat35_4, FreeChat35_5, History, fetch, crypto)
            : model.includes("gemini") ? await GeminiResponse(History, null, fetch)
              : model.includes("gpt-4") ? await GPT4oResponse(msg, History, fetch, axios)
                : model.includes("claude") ? await claudeResponse(History, fetch, crypto)
                  : null;
        } else {
          answer = null;
        }
      }

      if (!answer) {
        answer = model.includes("gpt-3.5-turbo") ? await FreeChat35Functions(FreeChat35_1, FreeChat35_2, FreeChat35_3, FreeChat35_4, FreeChat35_5, History, fetch, crypto)
          : model.includes("gemini") ? await GeminiResponse(History, null, fetch)
            : model.includes("gpt-4") ? await GPT4oResponse(msg, History, fetch, axios)
              : model.includes("claude") ? await claudeResponse(History, fetch, crypto)
                : null;
      }

      if (!answer) {
        try {
          const retryResponse = await fetch(apiurl, {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Apikey}`,
            },
            body: JSON.stringify({
              model: 'gpt-4o-all',
              messages: History
            }),
          });
          const retryResponseJson = await retryResponse.json();
          answer = (retryResponseJson?.choices?.length > 0) ? retryResponseJson.choices[0]?.message?.content : null;
        } catch (error) {
          console.error('Retry with model gpt-4o-all failed: ', error);
        }
      }

      answer = answer.replace(/Content is blocked/g, "  ").trim()
      history.push({
        "role": "assistant",
        "content": answer
      });
      await saveUserHistory(path, userid, history);
      let Messages = answer
      const models = ["gpt-4-all", "gpt-4-dalle", "gpt-4-v", "gpt-4o", "gpt-4o-all", "ideogram"];
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
            const JsonPart = await common.makeForwardMsg(e, forwardMsg, '绘图prompt');
            e.reply(JsonPart)
          }
        } catch { }
      }
      console.log(Messages)
      let styles = JSON.parse(fs.readFileSync(_path + '/data/YTAi_Setting/data.json')).chatgpt.ai_chat_style;
      let urls = await get_address(answer);
      if (styles == "picture") {
        let forwardMsg = [Messages]
        const JsonPart = await common.makeForwardMsg(e, forwardMsg, 'text');
        e.reply(JsonPart)
        if (urls.length !== 0) {
          let uniqueUrls = [...new Set(urls)];
          if (uniqueUrls.length > 1) {
            const duplicateIndex = uniqueUrls.findIndex(url => url.includes('download'));
            uniqueUrls.splice(duplicateIndex, 1);
          }
          console.log(uniqueUrls)
        }
      }
      if (!model.includes("ideogram")) {
        await replyBasedOnStyle(styles, Messages, e, model, puppeteer, fs, _path, msg, common)
      }
      let aiSettingsPath = _path + '/data/YTAi_Setting/data.json';
      let aiSettings = JSON.parse(await fs.promises.readFile(aiSettingsPath, "utf-8"));
      if (aiSettings.chatgpt.ai_tts_open) {
        const speakers = aiSettings.chatgpt.ai_tts_role
        await handleTTS(e, speakers, answer, WebSocket, fs, _path)
      }
      if (model == "gpt-4-dalle") {
        let result = await extractImageLinks2(answer)
        console.log(result)
        if (result.length === 0) {
          return false
        }
        result.forEach((url, index) => {
          const filePath = `${_path}/resources/dall_e_plus_${index}_chat.png`;
          downloadImage(path, url, e, filePath);
        })
      }
      if (model == "ideogram") {
        let urls = await get_address(answer);
        if (urls.length !== 0) {
          try {
            urls = await removeDuplicates(urls);
          } catch (error) {
            e.reply(error);
          }
          const filePath = path.join(_path, 'resources', 'ideogram.png');
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
      if (model == "gpt-4-all" || model == "gpt-4o" || model == "gpt-4o-all") {
        let urls = await get_address(answer);
        if (urls.length !== 0) {
          try {
            urls = await removeDuplicates(urls);
          } catch (error) {
            e.reply(error);
          }
          const filePath = path.join(_path, 'resources', 'dall_e_chat.png');
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
      console.log(error)
      e.reply("与服务器通讯失败，请尝试开启chat代理或结束对话")
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

  async function downloadImage(path, url, e, filePath) {
    const fileExtension = path.extname(url).toLowerCase();
    console.log(fileExtension);
    if (!['.webp', '.png', '.jpg'].includes(fileExtension)) {
      return;
    }

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

  async function saveUserHistory(path, userId, history) {
    try {
      const lastSystemMessage = history.filter(item => item.role === 'system').pop();
      if (lastSystemMessage) {
        history = history.filter(item => item.role !== 'system');
        history.unshift(lastSystemMessage);
      }
      const filepath = path.join(dirpath, 'user_cache', `${userId}.json`);
      await fs.writeFileSync(filepath, JSON.stringify(history), { encoding: 'utf-8' });
      console.log(`User history saved to ${filepath}`);
    } catch (error) {
      console.error(`Error saving user history: ${error}`);
    }
  }

  async function FreeChat35Functions(FreeChat35_1, FreeChat35_2, FreeChat35_3, FreeChat35_4, FreeChat35_5, messages, fetch, crypto) {
    let response;
    const functionsToTry = [
      FreeChat35_1,
      FreeChat35_2,
      FreeChat35_3,
      FreeChat35_4,
      FreeChat35_5,
    ];
    for (let func of functionsToTry) {
      response = await func(messages, fetch, crypto);
      if (response) break;
    }
    if (!response) {
      return null;
    }
    return response;
  }

  async function get_address(inputString) {
    const regex = /\[([^\]]*?)\]\((https:\/\/filesystem\.site\/cdn\/\d{8}\/[a-zA-Z0-9]+?\.[a-z]{2,4})\)/g;
    let match;
    let links = [];
    while ((match = regex.exec(inputString)) !== null) {
      const link = match[2];
      if (!links.includes(link)) {
        links.push(link);
      }
    }
    console.log(2, links);
    return links
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
        if (e.isGroup) {
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

  async function extractImageLinks2(answer) {
    const imageLinkRegex = /\[下载.*?\]\((https:\/\/filesystem.site\/cdn\/download\/.*?)\)/g;
    const imageLinks = answer.matchAll(imageLinkRegex);
    return Array.from(imageLinks, (match) => match[1]);
  }

  async function processArray(arr, numbers) {
    const userCount = arr.reduce((count, obj) => obj.role === "user" ? count + 1 : count, 0);
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
          if (obj.role === "user" && arr[i + 1]?.role === "assistant") {
            newArr.unshift(arr[i + 1], obj);
            i--;
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

export { run_conversation }