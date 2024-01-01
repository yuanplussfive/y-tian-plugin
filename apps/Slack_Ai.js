import { dependencies } from "../YTdependence/dependencies.js";
const  { fs, fetch, _path, common, handleSystemCommand } = dependencies
let dirpath = _path + '/data/YTslack'
if (!fs.existsSync(dirpath)) {
fs.mkdirSync(dirpath)
}
if (!fs.existsSync(dirpath + "/" + "data.json")) {
fs.writeFileSync(dirpath + "/" + "data.json", JSON.stringify({
    "slack": {
      "key": []
    }
  }))
}
let slackhistory = {}
let time = {}
let prompt = {}
let user_channel = {}
let user_botid = {}
let user_d = {}
let user_token = {}
const tokenRegex = /token:(\S+)/;
const botIdRegex = /bot_id:(\S+)/;
const dRegex = /d:(\S+)/;

export class slack extends plugin {
  constructor() {
    super({
      name: '阴天[SlackAi]',
      dsc: '',
      event: 'message',
      priority: 2000,
      rule: [
        {
          reg: "^/slack(.*)",
          fnc: 'chat'
       },
       {
          reg: "^(/|#)?结束slack对话$",
          fnc: 'ends'
       },
       {
          reg: "^/查看slack预设|^/切换slack预设(.*?)$",
          fnc: 'slackprompts'
       },
       {
          reg: "^(/|#)创建slack频道$",
          fnc: 'slackform'
       },
       {
          reg: "^(/|#)填写slack密钥(.*)",
          fnc: 'slackkey'
       },
       {
          reg: "^(/|#)查看slack负载",
          fnc: 'slackround'
       }
      ]
    })
  }

async slackround(e) {
  try {
    let context = await fs.promises.readFile(dirpath + "/" + "data.json", "utf8");
    let data = JSON.parse(context);
    let workspaces = data.slack.key;
    let numChannels = workspaces.reduce((total, workspace) => total + workspace.channel.length, 0);
    e.reply(`当前共有${workspaces.length}个工作区,${numChannels}个频道`);
  } catch (error) {
    console.error('读取或解析文件时发生错误:', error);
    e.reply('无法获取工作区和频道数据');
  }
}

async slackkey(e){
  let str = e.msg
    .replace(/\/填写slack密钥/g,"")
    .replace(/#填写slack密钥/g,"")
    .trim();
  const tokenMatch = str.match(tokenRegex);
  const botIdMatch = str.match(botIdRegex);
  const dMatch = str.match(dRegex);
  const token = tokenMatch ? tokenMatch[1] : null;
  const botid = botIdMatch ? botIdMatch[1] : null;
  const d = dMatch ? dMatch[1] : null;
  try {
    let data = await readJsonFile(dirpath+"/"+"data.json");
    let hasValue = data.slack.key.some(obj => obj.token === token);
    if (hasValue) {
      e.reply("已存在当前工作区");
      return false;
    }
    console.log({ token, botid, d });
    if (token === null || botid === null || d === null) {
      e.reply('当前输入值存在错误,无法填写!');
    } else {
      let context = await readJsonFile(dirpath+"/"+"data.json");
      console.log(context);
      let channel = [];
      context.slack.key.push({ token, botid, d,channel });
      await writeJsonFile(dirpath+"/data.json",context);
      e.reply("写入slack密钥成功")
    }
  } catch (err) {
    console.error(err);
    e.reply('写入文件失败!');
  }
}

async slackform(e){
   let data = JSON.parse(fs.readFileSync(dirpath+"/"+"data.json")).slack.key
    const randomObject = await getRandomObjectFromArray(data);
    const { token, d, botid } = randomObject
     var randomNumber = Math.floor(Math.random() * 90000) + 10000;
    let channel = await createchannel(randomNumber,token,d,botid,e)
  if (channel !== undefined) {
     let information = JSON.parse(fs.readFileSync(dirpath+"/"+"data.json"))
information.slack.key[0].channel.push(channel)
     fs.writeFileSync(dirpath+"/data.json",JSON.stringify(information),"utf-8")
     e.reply("已成功创建一个slack频道")
   }
}

async slackprompts(e){
   let dirname = await fs.promises.readdir(`${_path}/data/阴天预设`, "utf-8");
        if (e.msg.includes("/查看slack预设")) {
            let forwardMsg = dirname.map((name, index) => {
                let cleanName = name.replace(/.txt/g, "");
                let weight = fs.readFileSync(`${_path}/data/阴天预设/${name}`, "utf-8").slice(0, 100);
                return `序号:${index + 1}\n名称:${cleanName}\n内容简述:${weight}`;
            });
            forwardMsg = await common.makeForwardMsg(e, forwardMsg, '预设魔法大全');
            await e.reply(forwardMsg);
        } else if (e.msg.includes("/切换slack预设")){
               let msg = e.msg.replace(/[^0-9]/g,"");
                if(dirname[msg-1]){
                 let prompts = fs.readFileSync(`${_path}/data/阴天预设/${dirname[msg-1]}`,"utf-8")
                 if(prompt[e.user_id] == undefined){
                  prompt[e.user_id] = prompts
            }
                e.reply("成功切换slack预设")
         } else {
                e.reply("输入序号错误!");return false}
     }
}

async ends(e){
   time[e.user_id] = ""
    slackhistory[e.user_id] = undefined
    prompt[e.user_id] = undefined
    e.reply(`用户:${e.sender.nickname}成功重置slack对话`,true)
}

async chat(e) {
    let cookie = await getcookie();
    if (!cookie || cookie.length < 4) {
        e.reply("请先填写slack密钥");
        return false;
    }
    let msg = e.msg.replace(/\/slack/g, "").replace(/#slack/g, "").trim();
    if (prompt[e.user_id]) {
        msg = prompt[e.user_id] + "\n" + msg;
    }
    let [token, d, channel, botid] = cookie;
    console.log(cookie)
    if (!channel || !channel.length) {
        e.reply("请先创建slack频道");
        return false;
    }
    let channels = channel[Math.floor(Math.random() * channel.length)];
    console.log(channels)
    await claude(msg, botid, channels, d, token, e);
  }
}

async function claude(message, botId, channel, d, token, e) {
    // Initialize user data if not already done
    const userId = e.user_id;
    time[userId] = time[userId] || "";
    user_channel[userId] = user_channel[userId] || channel;
    user_d[userId] = user_d[userId] || d;
    user_botid[userId] = user_botid[userId] || botId;
    user_token[userId] = user_token[userId] || token;
    const blocks = [{
        "type": "rich_text",
        "elements": [{
            "type": "rich_text_section",
            "elements": [{
                "type": "user",
                "user_id": user_botid[userId]
            }, {
                "type": "text",
                "text": message
            }]
        }]
    }];
    const payload = {
        blocks: blocks,
        channel: user_channel[userId],
        "thread_ts": time[userId]
    };
    const url = 'https://slack.com/api/chat.postMessage';
    const headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Bearer ${user_token[userId]}`,
        "cookie": `d=${user_d[userId]}`
    };
    let response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    });
    response = await response.json();
    console.log(response);
    if (response.error == 'invalid_auth') {
        e.reply("slack身份验证失败,请确认相关值填写的正确性!");
        return false;
    }
    let ts = await response.message.ts;
    if (slackhistory[userId] == undefined || slackhistory[userId] == "114514") {
        slackhistory[userId] = ts;
        time[userId] = ts;
    }
    let count = 0;
    let typingCount = 0;
    let hasReplied = false;
    async function executeRequest() {
    let answer = await fetch(`https://slack.com/api/conversations.replies?channel=${user_channel[userId]}&ts=${slackhistory[userId]}&pretty=1&oldest=${ts}`, {
        "headers": headers,
        "body": `------WebKitFormBoundaryTotJQ9kaNkT7dchz\r\nContent-Disposition: form-data; name=\"content\"\r\n\r\nnull\r\n------WebKitFormBoundaryTotJQ9kaNkT7dchz\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${user_token[userId]}\r\n------WebKitFormBoundaryTotJQ9kaNkT7dchz--\r\n`,
        "method": "POST"
    });
    const result = await answer.json();
    console.log(result);
    if (result.error == 'invalid_auth') {
        e.reply("身份验证失败,请确认相关值填写的正确性!");
        return false;
    } else if (result.error) {
        count++;
        console.log(`slack通信速率被限制,正在尝试绕过! 次数:${count}`, true);
        await new Promise(r => setTimeout(r, 4000));
        return;
    }
    if (result.messages[1]) {
        if (!hasReplied && result.messages[1].text === '...Typing') {
            typingCount++;
        } else if (!hasReplied && !result.messages[1].text.includes("...Typing")) {
            let hd = result.messages[1].text
            hd = hd.replace(/&lt;/g, '<');
            hd = hd.replace(/&gt;/g, '>');
            hd = hd.replace(/&amp;/g, '&');
            hd = hd.replace(/&quot;/g, '"');
            hd = hd.replace(/&apos;/g, "'");
            e.reply(hd);
            hasReplied = true;
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
    let data = JSON.parse(fs.readFileSync(dirpath+"/"+"data.json")).slack.key
     const randomItem = data.filter(item => item.channel.length > 0)[Math.floor(Math.random() * data.filter(item => item.channel.length > 0).length)];
     const { token, d, botid, channel } = randomItem
   return [token, d, channel, botid]
}

async function getRandomObjectFromArray(array) {
  if (!Array.isArray(array) || array.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

async function createchannel(randomNumber, token, d, botid, e) {
  e.reply("正在将应用添加到slack频道中");
  const createChannelEndpoint = `https://slack.com/api/conversations.create?name=${e.user_id}-${randomNumber}&pretty=1`;
  const headers = {
    "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryKVFfuTLPotnFX8F7",
    "cookie": `d=${d}`
  };
  const body = (boundary, token) => `------${boundary}\r\nContent-Disposition: form-data; name=\"content\"\r\n\r\nnull\r\n------${boundary}\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${token}\r\n------${boundary}--\r\n`;
  let channelId;
  try {
    let response = await fetch(createChannelEndpoint, {
      headers,
      body: body('WebKitFormBoundaryKVFfuTLPotnFX8F7', token),
      method: "POST"
    });
    const info = await response.json();
    if (info.error) {
      console.error('Failed to create the channel:', info.error);
      return;
    }
    channelId = info.channel.id;
    const inviteEndpoint = `https://slack.com/api/conversations.invite?channel=${channelId}&users=${botid}&pretty=1`;
    response = await fetch(inviteEndpoint, {
      headers: {
        ...headers,
        "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryfEj5VJT61Hk62UNo"
      },
      body: body('WebKitFormBoundaryfEj5VJT61Hk62UNo', token),
      method: "POST"
    });
    const content = await response.json();
    if (content.error) {
      console.error('添加应用失败了:', content.error);
      return;
    }
  } catch (error) {
    console.error('未知的错误:', error);
  }
  return channelId;
}

async function readJsonFile(filepath) {
  const data = await fs.promises.readFile(filepath, 'utf-8');
  return JSON.parse(data);
}

async function writeJsonFile(filepath, data) {
  await fs.promises.writeFile(filepath, JSON.stringify(data), 'utf-8');
}