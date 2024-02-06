import { dependencies } from "../YTdependence/dependencies.js";
const  { fetch, request, crypto } = dependencies
let botname = "#Bot";//这里可以更改名
let time = new Date().getTime()
let msgData = []

export class example extends plugin {
  constructor() {
    super({
      name: '阴天[gpt3.5]',
      dsc: '',
      event: 'message',
      priority: 2000,
      rule: [
        {
          reg: `^${botname}(.*)`,
          fnc: 'free_chat'
        }, 
        {
          reg: "^#结束问答$",
          fnc: 'endchat'
        }
      ]
    })
  }
  
async endchat(e){
time = new Date().getTime()
msgData = []
e.reply("对话已重置")
}

async free_chat(e){
   const msg = await formatMessage(e.msg)
    msgData.push({ role: "user", content: msg })
    const functions_35 = [chat35_1, chat35_2];
    let answer = await executeFunctions(functions_35, msgData, msg);
   if (answer == undefined) {
    await chat35_3(e, msg)
    return false
  }
    e.reply(answer)
    msgData.push({ role: "assistant", content: answer })
  }
}

async function executeFunctions(functions, history, msg) {
    let result;
    for (let func of functions) {
        try {
            result = await func(history, msg);
            if (result !== undefined && result !== null && result !== "" ) {
                console.log(func.name)
                return result;
            }
        } catch (error) {
            console.log("Error in function", func.name, ":", error);
        }
    }
    return "无有效回复,请稍候重试";
}

  async function chat35_3(e, msg) {
    const options = {
      method: 'POST',
      url: 'https://api.binjie.fun/api/generateStream',
      headers: {
        authority: 'api.binjie.fun',
        accept: 'application/json, text/plain, */*',
        'content-type': 'application/json',
        origin: 'https://chat18.aichatos.top',
        referer: 'https://chat18.aichatos.top/',
        'sec-ch-ua': '"Microsoft Edge";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': 'Windows',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.35',
      },
      body: JSON.stringify({
        prompt: msg,
        stream: false,
        system: '',
        userId: "#/chat/" + time,
        withoutContext: false,
      }),
    };
    request(options, (error, response, body) => {
      if (error) {
       return false
      }
      body = body.replace(/(B|b)injie/g,"ChatGPT")
      e.reply(body)
    });
}

async function chat35_2(msgData, msg){
    let data = {
               messages: msgData,
               stream: false,
               model: 'gpt-3.5-turbo-16k',
               temperature: 0.7,
               presence_penalty: 0
            }
    try{
     let response = await fetch("https://openai.lbbai.cc/v1/chat/completions", {
          "headers": {
            "accept": "text/event-stream",
            "content-type": "application/json",
            "x-requested-with": "XMLHttpRequest",
            "Referer": "https://124389964761.ai701.live/",
             },
            "body": JSON.stringify(data),
            "method": "POST"
            });
        let res = await response.json()
return res.choices[0].message.content
} catch { return undefined }}

async function chat35_1(msgData, msg){
const generateSignature = async r => {
    const { t: e, m: t } = r,
          n = {}.PUBLIC_SECRET_KEY || "",
          a = `${e}:${t}:${n}`;
    return await digestMessage(a);
}
const be = Date.now();
const _e = msgData
let sign = await generateSignature({
    t: be,
    m: _e[_e.length - 1].content
})
let body = {
"model": "gpt-3.5-turbo-16k",
"messages": msgData,
"time": be,
"pass": null,
"sign": sign
}
let response = await fetch("https://s.aifree.site/api/generate", {
  "headers": {
    "authorization": "Bearer null",
    "content-type": "text/plain;charset=UTF-8",
    "Referer": "https://zz.aifree.site/"
  },
  "body": JSON.stringify(body),
  "method": "POST"
});
let answer = await response.text()
return answer
}

async function digestMessage(r) {
    if (typeof crypto < "u" && crypto?.subtle?.digest) {
        const e = new TextEncoder().encode(r),
              t = await crypto.subtle.digest("SHA-256", e);
        return Array.from(new Uint8Array(t)).map(a => a.toString(16).padStart(2, "0")).join("");
    } else {
        const hash = crypto.createHash('sha256');
        hash.update(r);
        return hash.digest('hex');
    }
}

async function formatMessage(msg) {
    return msg.replace(/#Bot/g, "").trim().replace(new RegExp(botname, "g"), "");
}