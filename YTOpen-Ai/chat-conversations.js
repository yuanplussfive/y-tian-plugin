async function run_conversation(dirpath, e, apiurl, group, common, puppeteer, fs, _path, Bot_Name, fetch, replyBasedOnStyle, Anime_tts) {
    const chatgptConfig = JSON.parse(fs.readFileSync(`${dirpath}/data.json`, "utf-8")).chatgpt;
    const { model, stoken, search } = chatgptConfig;
    let msg = await formatMessage(e.msg);
    let history 
    if(group == false){
    history = await loadUserHistory(e.user_id);
    } else {
    history = await loadUserHistory(e.group_id);
    }
    //console.log(history)
    if (e.message.find(val => val.type === 'image')) {
        msg = await handleImages(e, msg);
    }
    history.push({
        "role": "user",
        "content": msg
    });
    switch (model) {
        case "search":
            await handleSearchModel(e, msg, stoken, apiurl);
            break;
        default:
            await handleGpt4AllModel(e, history, stoken, search, model, apiurl);
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
async function handleImages(e, msg) {
    let images = e.img.map(imgUrl => `${imgUrl} `).join('');
    return images + msg;
}
async function handleSearchModel(e, msg, stoken, apiurl) {
    const response = await fetch(apiurl, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${stoken}`,
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
}
async function handleGpt4AllModel(e, history, stoken, search, model, apiurl) {
//console.log(history)
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
let styles = JSON.parse(fs.readFileSync(_path + '/data/YTAi_Setting/data.json')).chatgpt.ai_chat_style
  await replyBasedOnStyle(styles, answer, e, common, puppeteer, fs, _path, msg)
let aiSettingsPath = _path + '/data/YTAi_Setting/data.json';
    let aiSettings = JSON.parse(await fs.promises.readFile(aiSettingsPath, "utf-8"));
    let { ai_chat_at, ai_chat, ai_ban_plans, ai_ban_number, ai_ban_group } = aiSettings.chatgpt;
if (aiSettings.chatgpt.ai_tts_open) {
   await handleTTS(e, aiSettings.chatgpt.ai_tts_role, answer);
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

export { run_conversation }






























