async function god_conversation(FreeChat35_1, FreeChat35_2, FreeChat35_3, FreeChat35_4, FreeChat35_5, FreeGemini_1, FreeGemini_2, FreeGemini_3, FreeClaude_1, imgurl, dirpath, e, apiurl, group, common, puppeteer, fs, _path, path, Bot_Name, fetch, replyBasedOnStyle, handleTTS, stoken, WebSocket, crypto, querystring, https, request, ocrurl, axios, GPT4oResponse) {
  const chatgptConfig = JSON.parse(fs.readFileSync(`${dirpath}/data.json`, "utf-8")).chatgpt;
  const { search } = chatgptConfig;
  const godgptConfig = JSON.parse(fs.readFileSync(`${dirpath}/model.json`, "utf-8")).godgpt;
  const { model } = godgptConfig
  let msg = await formatMessage(e.msg);
  let SettingsPath = _path + '/data/YTAi_Setting/data.json';
  let Settings = JSON.parse(await fs.promises.readFile(SettingsPath, "utf-8"));
  let { god_moment_numbers, god_moment_open } = Settings.chatgpt;
  let userid = (group == false)
    ? (e.isPrivate ? e.from_id : e.user_id)
    : (e.isPrivate ? e.from_id : e.group_id);
  let history = await loadUserHistory(path, userid, dirpath);
  if (god_moment_open) {
    history = await processArray(history, god_moment_numbers)
  }
  let source
  try {
    if (e.isGroup) {
      const history = await e.group.getChatHistory(e.source.seq, 1)
      source = history.pop()
    } else {
      const history = await e.friend.getChatHistory(e.source.time, 1)
      source = history.pop()
    }
  } catch (error) {
    source = "undefined"
  }
  //console.log(source.raw_message)
  let aiSettingsPath = _path + '/data/YTAi_Setting/data.json';
  let aiSettings = JSON.parse(await fs.promises.readFile(aiSettingsPath, "utf-8"));
  let { prompts_answers, prompts_answer_open, ai_private_plan, ai_private_open } = aiSettings.chatgpt;
  if (prompts_answers && prompts_answer_open) {
    const tips = prompts_answers
    await e.reply(tips, true, { recallMsg: 6 });
  }
  if ((e?.message.find(val => val.type === 'image') && e?.msg) || (source && source?.raw_message && (source?.raw_message?.includes('[图片]') || source?.raw_message?.includes('[动画表情]'))) || (e?.file && e?.isPrivate && ai_private_plan === "god" && ai_private_open === true)) {
    const Models = [
      "gpt-4-all",
      "gpt-4-dalle",
      "gpt-4o",
      "gpt-4o-all",
      "gpt-4-v",
      "gemini-pro-vision",
      "claude-3-opus-20240229",
      "claude-3-sonnet-20240229",
      "claude-3-haiku-20240307"
  ];
  
  if (Models.includes(model) || model.includes("claude-3-5") || model.includes("gpt-4-gizmo")) {
      if (e?.file) {
        msg = "帮我分析这个文件"
      }
      msg = [
        {
          "type": "text",
          "text": msg
        }
      ]
      msg.push(...imgurl);
      console.log(msg)
    }
  }
  console.log(msg)
  history.push({
    "role": "user",
    "content": msg
  });
  if (model.includes("claude")) {
    history = history.map(obj => {
      if (obj.role === "system") {
        return { ...obj, role: "user" };
      } else {
        return obj;
      }
    });
  }
  await MainModel(e, history, stoken, search, model, apiurl, path);

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

  async function MainModel(e, history, stoken, search, model, apiurl, path) {
    try {
      if (model == "gpt-4-all" || model == "gpt-4-dalle" || model == "gpt-4o-all" || model == "gpt-4-v" || model == "gpt-4o") {
        search = false
      }
      if (model.includes("suno")) {
        await handleSunoModel(e, stoken, msg, model, apiurl, _path);
        return false
      }
      console.log(history)
      let History = await reduceConsecutiveRoles(history);
      let answer
      try {
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
            setTimeout(() => reject(new Error('Timeout')), 150000)
          ),
        ]);

        let response_json = await response.json();
        console.log(response_json)
        answer = (response_json?.choices?.length > 0) ? response_json.choices[0]?.message?.content : null;
      } catch (error) {
        if (error.message === 'Timeout') {
          answer = model.includes("gpt-3.5-turbo") ? await FreeChat35Functions(FreeChat35_1, FreeChat35_2, FreeChat35_3, FreeChat35_4, FreeChat35_5, History, fetch, crypto)
            : model.includes("gemini-pro") ? await FreeGeminiFunctions(FreeGemini_1, FreeGemini_2, FreeGemini_3, History, fetch, crypto)
              : model.includes("gpt-4") ? await GPT4oResponse(msg, History, axios)
                : model.includes("claude") ? await FreeClaudeFunctions(FreeClaude_1, History, fetch, crypto)
                  : null;
        } else {
          answer = null;
        }
      }

      if (!answer) {
        answer = model.includes("gpt-3.5-turbo") ? await FreeChat35Functions(FreeChat35_1, FreeChat35_2, FreeChat35_3, FreeChat35_4, FreeChat35_5, History, fetch, crypto)
          : model.includes("gemini-pro") ? await FreeGeminiFunctions(FreeGemini_1, FreeGemini_2, FreeGemini_3, History, fetch, crypto)
            : model.includes("gpt-4") ? await GPT4oResponse(msg, History, axios)
              : model.includes("claude") ? await FreeClaudeFunctions(FreeClaude_1, History, fetch, crypto)
                : null;
      }

      if (!answer) {
        try {
          const retryResponse = await fetch(apiurl, {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${stoken}`,
            },
            body: JSON.stringify({
              model: 'gpt-4o-all',
              messages: History,
              search: search,
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
      const models = ["gpt-4-all", "gpt-4-dalle", "gpt-4-v", "gpt-4o", "gpt-4o-all"];
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
      if (styles == "picture" && urls.length !== 0) {
        let forwardMsg = [Messages]
        const JsonPart = await common.makeForwardMsg(e, forwardMsg, 'text');
        e.reply(JsonPart)
        let uniqueUrls = [...new Set(urls)];
        if (uniqueUrls.length > 1) {
          const duplicateIndex = uniqueUrls.findIndex(url => url.includes('download'));
          uniqueUrls.splice(duplicateIndex, 1);
        }
        console.log(uniqueUrls)
        if (uniqueUrls.length > 0) {
          let imgs = ""
          for (let i = 0; i < uniqueUrls.length; i++) {
            imgs += `![image${i + 1}](${uniqueUrls[i]})\n`;
          }
          Messages = imgs + Messages;
        }
      }
      await replyBasedOnStyle(styles, Messages, e, model, puppeteer, fs, _path, msg)
      let aiSettingsPath = _path + '/data/YTAi_Setting/data.json';
      let aiSettings = JSON.parse(await fs.promises.readFile(aiSettingsPath, "utf-8"));
      if (aiSettings.chatgpt.ai_tts_open) {
        await handleTTS(e, speakers, answer, WebSocket, fs, _path);
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
      if (model == "gpt-4-all" || model == "gpt-4o" || model == "gpt-4o-all") {
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
        const set = new Set(urls.filter(url => url.startsWith("https://filesystem.site/cdn/") && !url.includes("/download/")));
        const filteredUrls = urls.filter(url => {
          if (url.startsWith("https://filesystem.site/cdn/download/")) {
            return !set.has(url.replace('/download', ''));
          } else {
            return true;
          }
        });
        filteredUrls.forEach(async (url) => {
          await downloadAndSaveFile(url, path, fetch, _path, fs, e);
        });
      }
    } catch (error) {
      e.reply("与服务器通讯失败，请尝试开启god代理或结束对话")
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
      FreeChat35_3,
      FreeChat35_4,
      FreeChat35_5,
      FreeChat35_2,
      FreeChat35_1,
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

  async function FreeGeminiFunctions(FreeGemini_1, FreeGemini_2, FreeGemini_3, messages, fetch, crypto) {
    let response;
    const functionsToTry = [
      FreeGemini_1,
      FreeGemini_2,
      FreeGemini_3
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

  async function FreeClaudeFunctions(FreeClaude_1, messages, fetch, crypto) {
    let response;
    const functionsToTry = [
      FreeClaude_1
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
    const regex = /(?:\[(.*?)\]\((https:\/\/(?:filesystem\.site\/cdn\/download|files\.oaiusercontent\.com)[^\s\)]+)\))/g;
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
      e.reply(`${filename}文件成功保存在 ${filePath}`, true, { recallMsg: 6 });
    } catch (error) {
      console.error(`失败了: ${url}: ${error}`);
    }
  }

  async function reduceConsecutiveRoles(array) {
    const result = [];
    let consecutiveUserItems = [];
    let lastSystemItem = null;
    if (array.length > 0 && array[0].role === 'assistant') {
      array = array.slice(1);
    }

    for (const item of array) {
      if (item.role === 'user') {
        if (Array.isArray(item.content)) {
          if (consecutiveUserItems.length > 0) {
            result.push({
              role: 'user',
              content: consecutiveUserItems.join('\n')
            });
            consecutiveUserItems = [];
          }
          result.push(item);
        } else {
          consecutiveUserItems.push(item.content);
        }
      } else if (item.role === 'system') {
        lastSystemItem = item;
      } else {
        if (consecutiveUserItems.length > 0) {
          result.push({
            role: 'user',
            content: consecutiveUserItems.join('\n')
          });
          consecutiveUserItems = [];
        }
        result.push(item);
      }
    }

    if (consecutiveUserItems.length > 0) {
      result.push({
        role: 'user',
        content: consecutiveUserItems.join('\n')
      });
    }

    if (lastSystemItem !== null) {
      result.unshift(lastSystemItem);
    }

    return result;
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

export { god_conversation }