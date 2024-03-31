import { dependencies } from "../YTdependence/dependencies.js";
const  { fs, fetch, _path, common, FormData, handleSystemCommand } = dependencies
let time, prompt, user_channel, user_botid, user_d, user_token = ""
let slackhistory = "114514"
let dirpath = _path + '/data/YTslack2.0'
if (!fs.existsSync(dirpath)) {
fs.mkdirSync(dirpath)
}
if (!fs.existsSync(dirpath + "/" + "data.json")) {
fs.writeFileSync(dirpath + "/" + "data.json", JSON.stringify({
   "slack": {
      "bot_token": "",
      "channel_id": "",
      "bot_id": "",
      "cookie_d": ""
    }
  }))
}

export class slack extends plugin {
  constructor() {
    super({
      name: '阴天[SlackAi]',
      dsc: '',
      event: 'message',
      priority: 1500,
      rule: [
        {
          reg: "^/slack(.*)",
          fnc: 'Slack_Chat'
       },
       {
          reg: "^(/|#)?结束slack对话$",
          fnc: 'Slack_Ends'
       },
       {
          reg: "^/查看slack预设|^/切换slack预设(.*?)$",
          fnc: 'Slack_Prompts'
       }
      ]
    })
  }

async Slack_Prompts(e, prompt) {
    const fileNames = await getSlackPresetsSummary(_path);
    if (e.msg.includes("/查看slack预设")) {
        let forwardMsg = fileNames.map((file, index) => 
            `序号:${index + 1}\n名称:${file.cleanName}\n内容简述:${file.weight}`
        ).join("\n\n");
        forwardMsg = await common.makeForwardMsg(e, forwardMsg, '预设魔法大全');
        await e.reply(forwardMsg);
    } else if (e.msg.includes("/切换slack预设")) {
        await switchSlackPreset(e, _path, prompt, fileNames);
    }
}

async Slack_Ends(e){
    time = ""
    slackhistory = "114514"
    prompt = ""
    e.reply(`成功重置slack对话`,true)
}

async Slack_Chat(e) {
    const msg = e.msg.replace(/(\/|#)slack/g, "").trim();
    if (prompt) {
        msg = prompt + "\n" + msg;
    }
    await claude(msg, e);
  }
}

async function claude(message, e) {
    const userId = e.user_id;
     let { bot_token, cookie_d, bot_id, channel_id } = await getcookie()
      const blocks = [{
        "type": "rich_text",
         "elements": [{
            "type": "rich_text_section",
            "elements": [{
                "type": "user",
                "user_id": bot_id
             }, 
             {
                "type": "text",
                "text": message
            }]
        }]
    }];
    const payload = {
        blocks: blocks,
        channel: channel_id,
        "thread_ts": time
    };
    const url = 'https://slack.com/api/chat.postMessage';
    const headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Bearer ${bot_token}`,
        "cookie": `d=${cookie_d}`
    };
    let response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    });
    response = await response.json();
    console.log(response);
    if (response.error == 'invalid_auth' || response.error == 'not_authed') {
        e.reply("slack身份验证失败,请确认相关值填写的正确性!");
        return false;
    }
    let ts = await response.message.ts;
    if (slackhistory == "114514") {
        slackhistory = ts;
        time = ts;
        console.log(slackhistory)
    }
    let count = 0;
    let typingCount = 0;
    let hasReplied = false;
    async function executeRequest() {
     const boundary = '------WebKitFormBoundaryTotJQ9kaNkT7dchz';
     const formData = new FormData();
     formData.setBoundary(boundary);
     formData.append('content', 'null');
     formData.append('token', bot_token);
      const answer  = await fetch(`https://slack.com/api/conversations.replies?channel=${channel_id}&ts=${slackhistory}&pretty=1&oldest=${ts}`, {
        method: 'POST',
        body: formData,
        headers: headers
     })
      const result = await answer.json();
    if (result.error == 'invalid_auth' || result.error == 'not_authed') {
        e.reply("身份验证失败,请确认相关值填写的正确性!");
        return true;
    } else if (result.error) {
        count++;
        console.log(`slack通信速率被限制,正在尝试绕过! 次数:${count}`, true);
        await new Promise(r => setTimeout(r, 4000));
        return;
    }

   if (result.messages[1]) {
      const output = await isNonEmptyString(result.messages[1].text)
        if (!hasReplied && output) {
           let replies = result.messages[1].text;
            replies = await decodeHtmlEntities(replies);
            e.reply(replies.trim());
            hasReplied = true;
         } else {
            typingCount++;
        } 
    }

    if (typingCount === 8) {
        e.reply("slack通讯失败，请重置对话!", true);
        return true;
    }
    return false;
}

async function executeWhileLoop() {
    while(!hasReplied) {
        let shouldBreak = await executeRequest();
        if(shouldBreak) {
            break;
        }
        await new Promise(r => setTimeout(r, 5000));
      }
  }
 executeWhileLoop();
}

async function getcookie(){
    const data = JSON.parse(fs.readFileSync(dirpath+"/"+"data.json")).slack
    const { bot_token, cookie_d, bot_id, channel_id } = data
    return { bot_token, cookie_d, bot_id, channel_id }
}

async function getRandomObjectFromArray(array) {
  if (!Array.isArray(array) || array.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

async function readJsonFile(filepath) {
  const data = await fs.promises.readFile(filepath, 'utf-8');
  return JSON.parse(data);
}

async function writeJsonFile(filepath, data) {
  await fs.promises.writeFile(filepath, JSON.stringify(data), 'utf-8');
}

async function getSlackPresetsSummary(_path) {
    const fileNames = await fs.promises.readdir(`${_path}/data/阴天预设`, "utf-8");
    return fileNames.map(name => {
        const cleanName = name.replace(/.txt/g, "");
        const weight = fs.readFileSync(`${_path}/data/阴天预设/${name}`, "utf-8").slice(0, 100);
        return { cleanName, weight };
    });
}

async function switchSlackPreset(e, _path, prompt, fileNames) {
    const msgIndex = parseInt(e.msg.replace(/[^0-9]/g, ""));
    if(fileNames[msgIndex-1]) {
        const prompts = fs.readFileSync(`${_path}/data/阴天预设/${fileNames[msgIndex-1]}`, "utf-8");
        prompt[e.user_id] = prompts;
        e.reply("成功切换slack预设");
    } else {
        e.reply("输入序号错误!");
        return false;
    }
}

async function decodeHtmlEntities(text) {
    const entities = {
        '&lt;': '<',
        '&gt;': '>',
        '&amp;': '&',
        '&quot;': '"',
        '&apos;': "'"
    };
    return Object.keys(entities).reduce((acc, key) => {
        return acc.replace(new RegExp(key, 'g'), entities[key]);
    }, text);
}

async function isNonEmptyString(str) {
  return str !== null && str !== undefined && typeof str === 'string' && str.trim().length > 0  && str !== ""  && str.trim().length !== 0
}