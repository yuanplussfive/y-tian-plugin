async function run_conversation(FreeChat35_1, FreeChat35_2, FreeChat35_3, FreeChat35_4, FreeChat35_5, FreeGemini_1, FreeGemini_2, FreeGemini_3, FreeClaude_1, dirpath, e, apiurl, group, common, puppeteer, fs, _path, path, Bot_Name, fetch, replyBasedOnStyle, Anime_tts, Apikey, imgurl, https, crypto) {
    const chatgptConfig = JSON.parse(fs.readFileSync(`${dirpath}/data.json`, "utf-8")).chatgpt;
    const { model, search } = chatgptConfig;
    let msg = await formatMessage(e.msg);
    if (!msg && !e?.file) { return false }
    let SettingsPath = _path + '/data/YTAi_Setting/data.json';
    let Settings = JSON.parse(await fs.promises.readFile(SettingsPath, "utf-8"));
    let { chat_moment_numbers, chat_moment_open } = Settings.chatgpt;
    let userid = (group == false)
  ? (e.isPrivate ? e.from_id : e.user_id)
  : (e.isPrivate ? e.from_id : e.group_id);
    let history = await loadUserHistory(userid);
    if (chat_moment_open) {
    history = await processArray(history, chat_moment_numbers)
    }
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
   console.log(source)
    let aiSettingsPath = _path + '/data/YTAi_Setting/data.json';
    let aiSettings = JSON.parse(await fs.promises.readFile(aiSettingsPath, "utf-8"));
    let { ai_private_plan, ai_private_open } = aiSettings.chatgpt;
    if ((e?.message.find(val => val.type === 'image') && e?.msg) || (source && source?.raw_message && (source?.raw_message?.includes('[图片]') || source?.raw_message?.includes('[动画表情]'))) || (e?.file && e?.isPrivate && ai_private_plan === "chat" && ai_private_open === true)) {    
      if (model == "gpt-4-all" || model == "gpt-4-dalle" || model == "gpt-4-v" || model == "gemini-pro-vision" || model == "claude-3-opus-20240229" || model == "claude-3-sonnet-20240229" || model == "claude-3-haiku-20240307" || model.includes("gpt-4-gizmo")){
       message = await handleMsg(e, msg, imgurl)
       const Msg = await handleMsg(e, msg, imgurl)
       console.log(Msg)
        msg = [ 
        {
         "type": "image_url",
         "image_url": imgurl 
        }, 
        {
         "type": "text",
         "text": Msg
        }
       ]
     } else {
        msg = await handleImages(e, msg, imgurl);
     }
    }
    console.log(msg)
    history.push({
        "role": "user",
        "content": msg
    });
    switch (model) {
        case "search":
            await handleSearchModel(e, msg, Apikey, apiurl);
            break;
        case "mj-chat":
            await handleMJModel(e, history, Apikey, search, model, apiurl, path, https, _path);
            break;
        default:
            await handleGpt4AllModel(e, history, Apikey, search, model, apiurl, path, https, _path);
    }
     await saveUserHistory(userid, history);
    
async function formatMessage(originalMsg) {
    if (originalMsg) {
    const msgs = originalMsg.replace(/\/chat|#chat/g, "").trim().replace(new RegExp(Bot_Name, "g"), "");
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

async function handleSearchModel(e, msg, Apikey, apiurl) {
  try{
    const response = await fetch(apiurl, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Apikey}`,
        },
        body: JSON.stringify({
            model: "search",
            messages: [{ role: "user", content: msg }],
        }),
    });
    let response_json = await response.json()
 //console.log(response_json)
 let answer = await response_json.choices[0].message.content
 e.reply(answer);
} catch { 
e.reply("与服务器通讯失败!") 
}}

async function handleMJModel(e, history, Apikey, search, model, apiurl, path, https, _path) {
  const filteredArray = history.filter(function(item) {
   return item.role !== "system";
  });
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
    answer = await response_json.choices[0].message.content
    console.log(answer)
    let url = await extractImageLinks3(answer)
    if (answer.includes("服务器已掉线") || url == null || url == "undefined") {
    e.reply("该图像处理服务器已掉线, 请结束对话后重试")
    return false
    }
    if (url.length == 0) {
    e.reply("提示词违规, 请更改后重试")
    return false
    }
    url = url[url.length-1]
      let path2 = _path + '/resources/MJ.png'
        let file = fs.createWriteStream(path2);        
        let request = https.get(url, function(response) {
            response.pipe(file);
            file.on('finish', function() {
                file.close(() => {
                    e.reply(segment.image(path2));       
                }); 
            });
        }).on('error', function(err) {
            e.reply(segment.image(url));
        });
     history.push({
      "role": "assistant",
      "content": answer
    });
   } catch {
   e.reply("通讯失败, 稍后再试")
 }
}

async function handleGpt4AllModel(e, history, Apikey, search, model, apiurl, path, https, _path) {
  try {
   let answer;
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
    const History = reduceConsecutiveRoles(history);
    if (model == "gpt-4-all" || model == "gpt-4-dalle" || model == "gpt-4-v") {
     search = false
    }
    const response = await fetch(apiurl, {
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
    });
    let response_json = await response.json();
    console.log(response_json)
    answer = (response_json?.choices?.length > 0) ? response_json.choices[0]?.message?.content : null;
    if (!answer) {
answer = model.includes("gpt-3.5-turbo") ? await FreeChat35Functions(FreeChat35_1, FreeChat35_2, FreeChat35_3, FreeChat35_4, FreeChat35_5, History, fetch, crypto)
        : model.includes("gemini-pro") ? await FreeGeminiFunctions(FreeGemini_1, FreeGemini_2, FreeGemini_3, History, fetch, crypto)
        : model.includes("claude") ? await FreeClaudeFunctions(FreeClaude_1, History, fetch, crypto)
        : answer;
    }
    answer = answer.replace(/Content\s*is\s*blocked/g, "  ");
    console.log(answer+"\n---------")
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
 descriptionMatch = descriptionMatch.replace(/\!\[.*?\]\(https:\/\/filesystem.site\/cdn\/.*?\)\n\n/g, '')
 descriptionMatch = descriptionMatch.replace(/\[下载\d+\]\(https:\/\/filesystem.site\/cdn\/download\/.*?\)\n/g, '')
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
   }
   console.log(Messages)
    let styles = JSON.parse(fs.readFileSync(_path + '/data/YTAi_Setting/data.json')).chatgpt.ai_chat_style;
    await replyBasedOnStyle(styles, Messages, e, common, puppeteer, fs, _path, message);
    let aiSettingsPath = _path + '/data/YTAi_Setting/data.json';
    let aiSettings = JSON.parse(await fs.promises.readFile(aiSettingsPath, "utf-8"));
    let { ai_chat_at, ai_chat, ai_ban_plans, ai_ban_number, ai_ban_group } = aiSettings.chatgpt;
    if (aiSettings.chatgpt.ai_tts_open) {
      await handleTTS(e, aiSettings.chatgpt.ai_tts_role, answer);
    }
    if (model == "gpt-4-dalle") {
    let result = await extractImageLinks2(answer)
    console.log(result)
     if (result.length === 0) {
     return false
    }
     result.forEach((url, index) => {
     const path = `${_path}/resources/dall_e_plus_${index}.png`;
     const file = fs.createWriteStream(path);
     https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
         file.close(() => {
          e.reply(segment.image(path));
         });
        });
      }).on('error', (err) => {
      fs.unlink(path);
      console.error(err);
     });
    }); 
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
  e.reply("与服务器通讯失败，请尝试开启chat代理或结束对话")
 }
}

async function saveUserHistory(userId, history) {
    fs.writeFileSync(`${dirpath}/user_cache/${userId}.json`, JSON.stringify(history), "utf-8");
 }
async function handleTTS(e, speakers, answer) {
    try {
        let record_url = await Anime_tts(speakers, answer);
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

async function get_address(inputString){
const regex = /(?:\[(.*?)\]\((https:\/\/(?:filesystem\.site\/cdn\/)[^\s\)]+)\))/g;
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

async function extractImageLinks(answer) {
       const imageLinkRegex = /!\[.*?\]\((https?:\/\/.*?)\)/g;
       const imageLinks = answer.matchAll(imageLinkRegex);
  return Array.from(imageLinks, (match) => match[1]);
}

async function extractImageLinks2(answer) {
  const imageLinkRegex = /\[下载.*?\]\((https:\/\/filesystem.site\/cdn\/download\/.*?)\)/g;
  const imageLinks = answer.matchAll(imageLinkRegex);
  return Array.from(imageLinks, (match) => match[1]);
}

async function extractImageLinks3(answer) {
  const imageLinkRegex = /\[.*\]\((https:\/\/filesystem.site\/cdn\/.*?)\)/g;
  const imageLinks = answer.matchAll(imageLinkRegex);
  return Array.from(imageLinks, (match) => match[1]);
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

export { run_conversation }