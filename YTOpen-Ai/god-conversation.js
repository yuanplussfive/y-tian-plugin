async function god_conversation(FreeChat35_1, FreeChat35_2, FreeChat35_3, FreeChat35_4, FreeChat35_5, FreeGemini_1, FreeGemini_2, FreeGemini_3, FreeClaude_1, imgurl, dirpath, e, apiurl, group, common, puppeteer, fs, _path, path, Bot_Name, fetch, replyBasedOnStyle, AnimeTTS, stoken, WebSocket, crypto, querystring, https, request, ocrurl) {
    const chatgptConfig = JSON.parse(fs.readFileSync(`${dirpath}/data.json`, "utf-8")).chatgpt;
    const { search } = chatgptConfig;
    const godgptConfig = JSON.parse(fs.readFileSync(`${dirpath}/model.json`, "utf-8")).godgpt;
    const { model } = godgptConfig
    const imageConfig = JSON.parse(fs.readFileSync(`${dirpath}/setting.json`, "utf-8")).godgpt;
    const { image } = imageConfig
    let msg = await formatMessage(e.msg);
    let SettingsPath = _path + '/data/YTAi_Setting/data.json';
    let Settings = JSON.parse(await fs.promises.readFile(SettingsPath, "utf-8"));
    let { god_moment_numbers, god_moment_open } = Settings.chatgpt;
    let userid = (group == false)
  ? (e.isPrivate ? e.from_id : e.user_id)
  : (e.isPrivate ? e.from_id : e.group_id);
    let history = await loadUserHistory(userid);
    if (god_moment_open) {
    history = await processArray(history, god_moment_numbers)
    }
    let image_url = 0
    let message = msg
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
 console.log(source.raw_message)
    let aiSettingsPath = _path + '/data/YTAi_Setting/data.json';
    let aiSettings = JSON.parse(await fs.promises.readFile(aiSettingsPath, "utf-8"));
    let { ai_private_plan, ai_private_open } = aiSettings.chatgpt;
      if ((e?.message.find(val => val.type === 'image') && e?.msg) || (source && source?.raw_message && (source?.raw_message?.includes('[图片]') || source?.raw_message?.includes('[动画表情]'))) || (e?.file && e?.isPrivate && ai_private_plan === "god" && ai_private_open === true)) {    
      if (model == "gpt-4-all" || model == "gpt-4-dalle" || model == "gpt-4-v" || model == "gemini-pro-vision" || model == "claude-3-opus-20240229" || model == "claude-3-sonnet-20240229" || model == "claude-3-haiku-20240307") {
       message = await handleMsg(e, msg)
        msg = [ 
        {
         "type": "image_url",
         "image_url": imgurl
        }, 
        {
         "type": "text",
         "text": await handleMsg(e, msg, imgurl)
        }
       ]
     } else {
        msg = await handleImages(e, msg, imgurl);
     }
        image_url = 1
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
    await saveUserHistory(userid, history);

async function formatMessage(originalMsg) {
    if (originalMsg) {
    const msgs = originalMsg.replace(/\/godgpt|#chat/g, "").trim().replace(new RegExp(Bot_Name, "g"), "");
    return msgs
  } else {
  return undefined
 }
}

async function loadUserHistory(userId) {
    const historyPath = `${dirpath}/user_cache/${userId}.json`;
    if (fs.existsSync(historyPath)) {
        return JSON.parse(fs.readFileSync(historyPath, "utf-8"));
    }
    return [];
}

async function handleImages(e, msg, imgurl) {
    let images = imgurl
    return images + msg;
}

async function handleMsg(e, msg, imgurl) {
    let images = imgurl
    let msgs
    if (!e?.file) {
    msgs = msg.replace(new RegExp(images, "g"), "")
    } else {
    msgs = "帮我分析这个文件"
   }
    return msgs.trim()
}

async function OtherModel(e, msg, stoken, apiurl, image) {
 try{
   if(image == "gpt-4-v" || image == "gemini-pro-vision") {
    const response = await fetch(apiurl, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${stoken}`,
        },
        body: JSON.stringify({
            model: image,
            messages: [{ role: "user", content: msg }],
        }),
    });
    let response_json = await response.json()
    let answer = await response_json.choices[0].message.content
    let styles = JSON.parse(fs.readFileSync(_path + '/data/YTAi_Setting/data.json')).chatgpt.ai_chat_style
  await replyBasedOnStyle(styles, answer, e, common, puppeteer, fs, _path, message)
let aiSettingsPath = _path + '/data/YTAi_Setting/data.json';
    let aiSettings = JSON.parse(await fs.promises.readFile(aiSettingsPath, "utf-8"));
    let { ai_chat_at, ai_chat, ai_ban_plans, ai_ban_number, ai_ban_group } = aiSettings.chatgpt;
if (aiSettings.chatgpt.ai_tts_open) {
   await handleTTS(e, aiSettings.chatgpt.ai_tts_role, answer);
}
   } else if (image == "ocr") {
      const gettk = await getBaiduToken(AK, SK, request)
      await handleOCR(e, gettk, stoken, puppeteer, replyBasedOnStyle, fs, _path, fetch, ocrurl, common, handleTTS)
   } else if (image == "xinghuo") {
     await xinghuo_analysis(e, msg, crypto, querystring, common, appId, apiKey, apiSecret, fs, _path, https, WebSocket, replyBasedOnStyle, puppeteer, handleTTS)
    }
} catch { e.reply("与服务器通讯失败!") }}

async function MainModel(e, history, stoken, search, model, apiurl, path) {
  try {
    if (model == "gpt-4-all" || model == "gpt-4-dalle" || model == "gpt-4-v") {
     search = false
   }
    function reduceConsecutiveRoles(array) {
     const result = [];
      let previousItem = null;
      for (const item of array) {
        if (previousItem && previousItem.role === item.role) {
         result.pop();
        }
        result.push(item);
        previousItem = item;
      }
     return result;
    }
    let History = history
   if (!model.includes("claude")) {
     History = reduceConsecutiveRoles(history);
}
   let answer
   try {
    const response = await fetch(apiurl, {
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
     });
     console.log(History)
     let response_json = await response.json()
     answer = (response_json?.choices?.length > 0) ? response_json.choices[0]?.message?.content : null;
    } catch {
    answer = null;
   }
     if (!answer) {
    answer = model.includes("gpt-3.5-turbo") ? await FreeChat35Functions(FreeChat35_1, FreeChat35_2, FreeChat35_3, FreeChat35_4, FreeChat35_5, History, fetch, crypto)
        : model.includes("gemini-pro") ? await FreeGeminiFunctions(FreeGemini_1, FreeGemini_2, FreeGemini_3, History, fetch, crypto)
        : model.includes("gpt-4") ? await FreeChat40Functions(History)
        : model.includes("claude") ? await FreeClaudeFunctions(FreeClaude_1, History, fetch, crypto)
        : answer;
    }
    answer = answer.replace(/Content is blocked/g, "  ")
     history.push({
        "role": "assistant",
        "content": answer
    });
    let Messages = answer
 const models = ["gpt-4-all", "gpt-4-dalle", "gpt-4-v"];
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
   } catch {}
   }   
   console.log(Messages)
   let styles = JSON.parse(fs.readFileSync(_path + '/data/YTAi_Setting/data.json')).chatgpt.ai_chat_style
  await replyBasedOnStyle(styles, Messages, e, common, puppeteer, fs, _path, msg)
let aiSettingsPath = _path + '/data/YTAi_Setting/data.json';
    let aiSettings = JSON.parse(await fs.promises.readFile(aiSettingsPath, "utf-8"));
    let { ai_chat_at, ai_chat, ai_ban_plans, ai_ban_number, ai_ban_group } = aiSettings.chatgpt;
if (aiSettings.chatgpt.ai_tts_open) {
   await handleTTS(e, aiSettings.chatgpt.ai_tts_role, answer);
    }
    if (model == "gpt-4-all") {
      let urls = await get_address(answer);
      if (urls.length !== 0) {
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
   function removeDuplicates(array) {
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
    urls = removeDuplicates(urls)
    for (let url of urls) {
    let fileExtension = getFileExtensionFromUrl(url);
    console.log(fileExtension);
    if (fileExtension == ".webp" || fileExtension == ".png" || fileExtension == ".jpg") {
        let path = _path + '/resources/dall_e_plus.png'
        let file = fs.createWriteStream(path);        
        let request = https.get(url, function(response) {
            response.pipe(file);
            file.on('finish', function() {
                file.close(() => {
                    e.reply(segment.image(path));
                }); 
            });
        }).on('error', function(err) {
            e.reply(segment.image(url));
        });
    }
}}
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
  } catch(error) {
  e.reply("与服务器通讯失败，请尝试开启god代理或结束对话")
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

async function saveUserHistory(userId, history) {
    fs.writeFileSync(`${dirpath}/user_cache/${userId}.json`, JSON.stringify(history), "utf-8");
}

async function handleTTS(e, speakers, answer) {
    try {
        let record_url = await AnimeTTS(speakers, answer);
        let record_response = await fetch(record_url);
        if (record_response.ok) {
            e.reply(segment.record(record_url));
        } else {
            e.reply("tts合成失败,可能句子过长");
        }
    } catch (error) {
        e.reply("tts服务通讯失败,请稍候重试");
    }
  }
}

async function xinghuo_analysis(e, msg, crypto, querystring, common, appId, apiKey, apiSecret, fs, _path, https, WebSocket, replyBasedOnStyle, puppeteer, handleTTS){
const downloadImage = (url, path) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(path);
    https.get(url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', error => {
      reject(error);
    });
  });
};
let answer = ""
let curTime = new Date();
const filePath = `${_path}/resources/xinghuo.jpg`
let date = curTime.toGMTString();
let tmp = `host: spark-api.cn-huabei-1.xf-yun.com\ndate: ${date}\nGET /v2.1/image HTTP/1.1`;
let tmp_sha = crypto.createHmac('sha256', apiSecret).update(tmp, 'utf-8').digest();
let signature = Buffer.from(tmp_sha).toString('base64');
const authorization_origin = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
const authorization = Buffer.from(authorization_origin).toString('base64');
const v = {
  "authorization": authorization,
  "date": date,
  "host": "spark-api.cn-huabei-1.xf-yun.com"
};
const url = "wss://spark-api.cn-huabei-1.xf-yun.com/v2.1/image?" + querystring.stringify(v);
const imageUrl = e.img[0].toString();
await downloadImage(imageUrl, filePath)
await common.sleep(1250)
let base64 = await fs.readFileSync(filePath,{encoding: 'base64'})
let body = {
    "header": {
        "app_id": appId,
        "uid": "yuan"
    },
    "parameter": {
        "chat": {
            "domain": "general",
            "temperature": 0.5,
            "top_k": 4,
            "max_tokens": 2028,
            "auditing": "default"
        }
    },
    "payload": {
        "message": {
            "text": [
                {
                    "role": "user",
                    "content": base64,
                    "content_type": "image"
                },
                {
                    "role": "user",
                    "content": msg,
                    "content_type": "text"
                }
            ]
        }
    }
}
const connectWebSocket = (url, body) => {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.on('open', () => {
      console.log('开始建立ws连接');
      ws.send(JSON.stringify(body));
    })
    ws.on('message', (data) => {
      //console.log('传递数据:', data);
      let Data = JSON.parse(data.toString("utf-8"))
      if(!Data.payload){resolve("请求被阻止,可能图像涉政或色情(或者图片太大了)");return}
      answer += Data.payload.choices.text[0].content
      console.log(answer)
    });
    ws.on('close', () => {
      resolve(answer);
    });
    ws.on('error', (error) => {
      reject(error);
      });
    });
  };
       await connectWebSocket(url, body);
      let styles = JSON.parse(fs.readFileSync(_path + '/data/YTAi_Setting/data.json')).chatgpt.ai_chat_style
  await replyBasedOnStyle(styles, answer, e, common, puppeteer, fs, _path, msg)
let aiSettingsPath = _path + '/data/YTAi_Setting/data.json';
    let aiSettings = JSON.parse(await fs.promises.readFile(aiSettingsPath, "utf-8"));
    let { ai_chat_at, ai_chat, ai_ban_plans, ai_ban_number, ai_ban_group } = aiSettings.chatgpt;
if (aiSettings.chatgpt.ai_tts_open) {
   await handleTTS(e, aiSettings.chatgpt.ai_tts_role, answer); 
  }
}

async function getBaiduToken(AK, SK, request) {
    let options = {
        'method': 'POST',
        'url': `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${AK}&client_secret=${SK}`,
    };
    return new Promise((resolve, reject) => {
        request(options, (error, response) => {
            if (error) reject(error);
            else resolve(JSON.parse(response.body).access_token);
        });
    });
}

async function FreeChat40Functions(History) {
   const url = "https://y-tian-plugin.top:8080/api/v1/freechat4/completions";
    const body = {
        messages: History
     };
     const options = {
        "method": "POST",
        "headers": {
            "Content-Type": "application/json"
      },
      "body": JSON.stringify(body)
     };
     try {
       const response = await fetch(url, options);
       return await response.text()
    } catch {
    return null
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

async function handleOCR(e, gettk, stoken, puppeteer, replyBasedOnStyle, fs, _path, fetch, ocrurl, common, handleTTS) {
    const varUrl = e.img[0];
    const url = `https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=${gettk}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        body: new URLSearchParams({ url: varUrl })
    });
    let imageData = await response.json();
    imageData = JSON.stringify(imageData.words_result);
 const res = await fetch(ocrurl, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${stoken}`,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo-16k",
            messages: [{ role: "user", content: imageData }],
        }),
    });
    let response_json = await res.json()
    let answer = await response_json.choices[0].message.content
    let styles = JSON.parse(fs.readFileSync(_path + '/data/YTAi_Setting/data.json')).chatgpt.ai_chat_style
  await replyBasedOnStyle(styles, answer, e, common, puppeteer, fs, _path, imageData)
let aiSettingsPath = _path + '/data/YTAi_Setting/data.json';
    let aiSettings = JSON.parse(await fs.promises.readFile(aiSettingsPath, "utf-8"));
    let { ai_chat_at, ai_chat, ai_ban_plans, ai_ban_number, ai_ban_group } = aiSettings.chatgpt;
if (aiSettings.chatgpt.ai_tts_open) {
   await handleTTS(e, aiSettings.chatgpt.ai_tts_role, answer);
  }
}

async function get_address(inputString){
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
    const response = await fetch(url);
    const fileBuffer = await response.buffer();
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
    if (!fs.existsSync(`${_path}/resources/YT_alltools`)){
     fs.mkdirSync(`${_path}/resources/YT_alltools`)    
    }
    const filePath = `${_path}/resources/YT_alltools/${time}${fileExtension}`
    fs.writeFileSync(filePath, fileBuffer);
    e.reply(`${filename}文件成功保存在 ${filePath}`, true, { recallMsg: 6 });
  } catch (error) {
    console.error(`失败了: ${url}: ${error}`);
  }
}

async function processArray(arr, numbers) {
    const userCount = arr.reduce((count, obj) => obj.role === "user" ? count + 1 : count, 0);
    if (userCount >= numbers) {
        const systemIndex = arr.findIndex(obj => obj.role === "system");
        if (systemIndex !== -1) {
            return [arr[systemIndex]];
        } else {
            return [];
        }
    }
    return arr;
}

export { god_conversation }