import { dependencies } from "../YTdependence/dependencies.js";
const  { fetch, request } = dependencies
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
   const msg = e.msg.replace(/#Bot/g,"").trim()
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

async function chat35_1(msgData, msg){
    let data = {
               messages: msgData,
               stream: false,
               model: 'gpt-3.5-turbo-16k',
               temperature: 0.7,
               presence_penalty: 0
              }
    try{
     let response = await fetch("https://postapi.lbbai.cc/v1/chat/completions", {
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

async function chat35_2(msgData, msg){
try{
let response = await fetch("https://promplate-demo.onrender.com/single/chat_messages", {
  "headers": {
    "content-type": "application/json",
    "Referer": "https://she1.free-chat.asia/"
  },
  "body": JSON.stringify({messages:msgData}),
  "method": "PUT"
});
let result = await response.text()
return result
} catch { return undefined }}