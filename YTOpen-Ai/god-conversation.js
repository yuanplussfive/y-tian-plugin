async function god_conversation(imgurl, dirpath, e, apiurl, group, common, puppeteer, fs, _path, path, Bot_Name, fetch, replyBasedOnStyle, AnimeTTS, stoken, WebSocket, crypto, querystring, https, request, ocrurl, appId, apiKey, apiSecret, AK, SK) {
    const chatgptConfig = JSON.parse(fs.readFileSync(`${dirpath}/data.json`, "utf-8")).chatgpt;
    const { search } = chatgptConfig;
    const godgptConfig = JSON.parse(fs.readFileSync(`${dirpath}/model.json`, "utf-8")).godgpt;
    const { model } = godgptConfig
    const imageConfig = JSON.parse(fs.readFileSync(`${dirpath}/setting.json`, "utf-8")).godgpt;
    const { image } = imageConfig
    let msg = await formatMessage(e.msg);
    let SettingsPath = _path + '/data/YTAi_Setting/data.json';
    let Settings = JSON.parse(await fs.promises.readFile(SettingsPath, "utf-8"));
    let { ai_moment_numbers, ai_moment_open } = Settings.chatgpt;
    let history 
    if(group == false){
    history = await loadUserHistory(e.user_id);
    } else {
    history = await loadUserHistory(e.group_id);
    }
    if (ai_moment_open == true) {
    history = await processArray(history, ai_moment_numbers)
    }
    let image_url = 0
    let message = msg
    if (e.message.find(val => val.type === 'image')) {
        if (image == "gpt-4-v" || image == "gemini-pro-vision" ) {
       message = await handleMsg(e, msg)
        msg = [ 
        {
         "type": "image_url",
         "image_url": imgurl
        }, 
        {
         "type": "text",
         "text": await handleMsg(e, msg)
        }
       ]
     } else {
        msg = await handleImages(e, msg);
     }
        image_url = 1
    }
    history.push({
        "role": "user",
        "content": msg
    });
        if(image_url == 1) {
            await OtherModel(e, msg, stoken, apiurl, image);
         } else {   
            await MainModel(e, history, stoken, search, model, apiurl, path);
    }
     if(group == false){
    await saveUserHistory(e.user_id, history);
    } else {
    await saveUserHistory(e.group_id, history);
    }

async function formatMessage(originalMsg) {
    return originalMsg.replace(/\/chat|#chat/g, "").trim().replace(new RegExp(Bot_Name, "g"), "");
}

async function loadUserHistory(userId) {
    const historyPath = `${dirpath}/user_cache/${userId}.json`;
    if (fs.existsSync(historyPath)) {
        return JSON.parse(fs.readFileSync(historyPath, "utf-8"));
    }
    return [];
}

async function handleMsg(e, msg) {
    let images = e.img.map(imgUrl => `${imgUrl} `).join('');
    let msgs = msg.replace(new RegExp(images, "g"), "")
    return msgs.trim()
}

async function handleImages(e, msg) {
    let images = e.img.map(imgUrl => `${imgUrl} `).join('');
    return images + msg;
}

async function TakeImages(e, msg) {
    let images = e.img.map(imgUrl => `${imgUrl} `).join('');
    return images
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
 try{
    if (model == "gpt-4-all" || model == "gpt-4-dalle" || model == "gpt-4-v") {
     search = false
    }
    const response = await fetch(apiurl, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${stoken}`,
        },
        body: JSON.stringify({
            model: model,
            messages: history,
            search: search,
        }),
    });
 let response_json = await response.json()
 //console.log(response_json)
 let answer = await response_json.choices[0].message.content
history.push({
        "role": "assistant",
        "content": answer
    });
   let Messages = "undefined"
  const models = ["gpt-4-all", "gpt-4-dalle", "gpt-4-v"];
 const keywords = ["json dalle-prompt", `"prompt":"`, `"size":"`, "json dalle"];
if (models.includes(model) && keywords.some(keyword => answer.includes(keyword))) {
   const extractJsonAndDescription = (str) => {
   let jsonMatch = str
   function removeAllOccurrences(array, str) {
    if (Array.isArray(array) && array.length) {
        array.forEach(item => {
            if (item && str) {
                str = str.split(item).join('');
            }
        });
    }
    return str;
   }
   let Dalle_Prompt = str.match(/\s*{\s*\n*\s*"size"\s*:\s*"(.*?)"\s*\n*}\s*/gs)
   let Dalle_Prompt2 = str.match(/\s*{\s*\n*\s*"prompt"\s*:\s*"(.*?)"\s*\n*}\s*/gs)
   try {
   let Rules = jsonMatch.replace(/[\r\n\x0B\x0C\u0085\u2028\u2029]+/g,""); 
    Rules = Rules.replace(/[\u007F-\uFFFF]/g, ""); 
    jsonMatch = Rules.match(/\s*{\s*"prompt"\s*:\s*"(.*?)"\s*}\s*/s);
    if (!jsonMatch || jsonMatch.length === null) {
     jsonMatch = Rules.match(/\s*{\s*"size"\s*:\s*"(.*?)"\s*}\s*/s)
    }
  } catch {
     jsonMatch = jsonMatch.match(/\s*{\s*"size"\s*:\s*"(.*?)"\s*}\s*/s);
 }
 let descriptionMatch = str.replace(/(```json\sdalle-prompt|```json\sdalle|```json|```)/g, '')
 try {
  const jsonPart = jsonMatch[0];
  const regex = /\s*{\s*"prompt"\s*:\s*"(.*?)"\s*}\s*/s
  let matches
  try {
    matches = str.match(regex);
    if (!matches || matches.length === null) {
    descriptionMatch = descriptionMatch.replace(/\s*{\s*"size"\s*:\s*"(.*?)"\s*}\s*/s, "")
    } else {
    descriptionMatch = descriptionMatch.replace(/\s*{\s*"prompt"\s*:\s*"(.*?)"\s*}\s*/s, "")
   }
  } catch {
    descriptionMatch = descriptionMatch.replace(/\s*{\s*"size"\s*:\s*"(.*?)"\s*}\s*/s, "")
 }
descriptionMatch = descriptionMatch.replace(/\!\[[\s\S]*?\]\(https:\/\/filesystem\.site\/cdn\/.*?\)\n\n/g, '');
descriptionMatch = descriptionMatch.replace(/\[下载[\s\S]*?\]\(https:\/\/filesystem\.site\/cdn\/download\/.*?\)\n/g, '');
descriptionMatch = removeAllOccurrences(Dalle_Prompt, descriptionMatch);
descriptionMatch = removeAllOccurrences(Dalle_Prompt2, descriptionMatch);
 descriptionMatch = descriptionMatch.replace(jsonPart, '')
  return { jsonPart, descriptionMatch };
} catch (error) {
 let descriptionMatch = str.replace(/(```json\sdalle-prompt|```json\sdalle|```json|```)/g, '')
 return { descriptionMatch };
}
}
   const result = extractJsonAndDescription(answer);
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
   if (Messages == "undefined") {
    Messages = answer
    Messages = Messages.replace(/\!\[[\s\S]*?\]\(https:\/\/filesystem\.site\/cdn\/.*?\)\n\n/g, '');
    Messages = Messages.replace(/\[下载[\s\S]*?\]\(https:\/\/filesystem\.site\/cdn\/download\/.*?\)\n/g, '');
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
      const urls = await get_address(answer);
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
     let fileExtension = getFileExtensionFromUrl(urls[0]);
     console.log(fileExtension)
      if (fileExtension == ".webp") {
       let url = urls[0];  
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
    fs.unlink(path);
    console.error(err);
  });
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
 } catch(error) { 
   e.reply("与服务器通讯失败")
 }
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