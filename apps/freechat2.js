//名称触发,自己在下方改;
import plugin from '../../../lib/plugins/plugin.js'
import _ from 'lodash'
import fetch from "node-fetch";
import request from "../node_modules/request/index.js"
let botname = "#Bot";//这里是名字
let time = new Date().getTime()
let msg = ""
let ai = "gpt3"
var tempMsg = ""
let history = []
let prompt = ""
let content2;
let zs;
let model;
let ming
let ming2
let history2 = []
export class example extends plugin {
  constructor() {
    super({
      name: '阴天[freeai]',
      dsc: 'm',
      event: 'message',
      priority: 9000,
      rule: [
        {
          reg: "^#?AI列表$",
          fnc: 'AIlist'
        }, {
          reg: "^#?切换AI(.*)$",
          fnc: 'change'
        }, {
          reg: `^${botname}(.*)$`,
          fnc: 'chatlist'
        }, {
          reg: "^#结束问答$",
          fnc: 'jsdh'
        }
      ]
    })
  }
  async gpt5(e) {
    msg = _.trimStart(e.msg, botname)
    history2.push({ "role": "user", "content": msg })
    let data = {
      "model": {
        "id": ming,
        "name": ming2,
        "maxLength": 24000,
        "tokenLimit": 8192
      },
      "messages": history2,
      "prompt": "",
      "temperature": 1
    }
    let a = await fetch("https://gpt.free.lsdev.me/api/chat", {
      "headers": {
        "content-type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.67"
      },
      "body": JSON.stringify(data),
      "method": "POST"
    });
    a = await a.text()
    if (a.includes("ERROR") || a.includes("error")) {
      e.reply("当前模型使用失败，请稍后再试")
      return true
    }
    e.reply(a, true)
    history2.push({ "role": "assistant", "content": a })
  }
  async AIlist(e) {
    await this.makeForwardMsg(e)
    e.reply("请发送#切换AI+序号切换", true)
  }
  async jsdh(e) {
    if (!e.isMaster) {
      return false
    }
    time = new Date().getTime()
    let msg = "gpt对话已经重置了"
    history = []
    history2 = []
    e.reply(msg, true)
  }
  async gpt1(e) {
    msg = _.trimStart(e.msg, botname)
    let data = { "prompt": msg }
    let url = await fetch("https://linglu.pro/api/generate", {
      "headers": {
        "Referer": "https://linglu.pro/zh", "Content-Type": "application/json"
      },
      "body": JSON.stringify(data),
      "method": "POST"
    });
    url = await url.text()
    e.reply(url, true)
  }
  async gpt2(e) {
    msg = _.trimStart(e.msg, botname)
    history.push({ "role": "user", "content": msg })
    prompt = prompt + `\nUser: ${msg}\nAI:`
    if (typeof (content2) == "undefined") {
      content = "你是阴天机器人你为阴天插件服务"
    }
    let data = {
      "env": "chatbot",
      "session": "N/A",
      "prompt": prompt,
      "context": content2,
      "messages": history,
      "newMessage": msg,
      "userName": "<div class=\"mwai-name-text\">User:</div>",
      "aiName": "<div class=\"mwai-name-text\">AI:</div>",
      "model": "gpt-3.5-turbo",
      "temperature": 0.8,
      "maxTokens": 1024,
      "maxResults": 1,
      "apiKey": "",
      "service": "openai",
      "embeddingsIndex": "",
      "stop": ""
    }
    let a = await fetch("https://chatgptlogin.ac/wp-json/ai-chatbot/v1/chat", {
      "headers": {
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
        "content-type": "application/json",

      },
      "body": JSON.stringify(data),
      "method": "POST"
    });
    a = await a.json()
    let b = await a.reply
    history.push({ "role": "assistant", "content": b })
    prompt = prompt + b
    e.reply(b, true)
  }
  async gpt3(e) {
    msg = _.trimStart(e.msg, botname)
    msg = `用户:${e.sender.nickname},qq:${e.user_id},说:` + msg
    const options = {
      method: 'POST',
      url: 'https://api.binjie.fun/api/generateStream',
      headers: {
        authority: 'api.binjie.fun',
        accept: 'application/json, text/plain, */*',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
        'content-type': 'application/json',
        origin: 'https://chat3.aichatos.top',
        referer: 'https://chat3.aichatos.top/',
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
        console.error(`Error occur: ${error}`);
        return;
      }

      console.log(`Response body: ${body}`);
      e.reply(`${body}`)
    });


  }
  async gpt4(e) {
    msg = _.trimStart(e.msg, botname)
    history.push({ "role": "user", "content": msg })
    let data = {
      messages: JSON.stringify(history),
      temperature: 1
    }
    let a = await fetch("https://chat.miaorun.dev/api/chat-stream", {
      "headers": {
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
        "content-type": "application/json",
        "sec-ch-ua": "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"114\", \"Microsoft Edge\";v=\"114\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "Referer": "https://chat.miaorun.dev/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      "body": JSON.stringify(data),
      "method": "POST"
    });
    a = await a.text()
    e.reply(a)
    history.push({ "role": "assistant", "content": a })
  }

  async change(e) {
    if (!e.isMaster) {
      return false
    }
    let num = e.msg.replace('#切换AI', '').trim()
    console.log(num)
    let p = num.match(/\d+/g)
    if (p == 1) {
      ai = "xiaoai"
      e.reply("切换成功，当前为小爱ai")
      return
    }
    if (p == 5) {
      ai = "mly"
      e.reply("切换成功，当前为茉莉云ai")
      return
    }
    if (p == 6) {
      ai = "businessai"
      e.reply("切换成功，当前为businessai")
      return
    }
    if (p == 7) {
      ai = "dilly"
      e.reply("切换成功，当前为dillyai")
      return
    }
    if (p == 11) {
      ai = "waifuai"
      e.reply("切换成功，当前为waifuai")
      return
    }
    if (p == 8) {
      ai = "gpt1"
      e.reply("切换成功，当前为gpt-3.5")
      return
    }
    if (p == 12) {
      ai = "gpt4"
      e.reply("切换成功，当前为gpt-3.5")
      return
    }
    if (p == 9) {
      ai = "gpt2"
      e.reply("切换成功，当前为gpt-3.5-lx")
      return
    }
    if (p == 10) {
      ai = "gpt3"
      e.reply("切换成功，当前为gpt-3.5-16k")
      return
    }
    if (p == 2) {
      ai = "qingyunke"
      e.reply("切换成功，当前为qingyunkeai")
      return
    }
    if (p == 4) {
      ai = "welmai"
      e.reply("切换成功，当前为welmai")
      return
    }
    if (p == 3) {
      ai = "ownthink"
      e.reply("切换成功，当前为思知ai")
      return
    }
    try {
      let url = await fetch("https://gpt.free.lsdev.me/api/models", {
        "headers": {
          "content-type": "application/json"
        },
        "body": "{\"key\":\"\"}",
        "method": "POST"
      });
      url = await url.json()
      if (p > 12 && p <= 12 + url.length) {
        ming = url[p - 13].id
        ming2 = url[p - 13].name
        e.reply(`切换成功，当前为${ming}`)
        ai = url[p - 13].id
        return true
      }
    } catch { e.reply("当前模型由于限制无法使用") }
  }
  async chatlist(e) {
    try {
      let url = await fetch("https://gpt.free.lsdev.me/api/models", {
        "headers": {
          "content-type": "application/json"
        },
        "body": "{\"key\":\"\"}",
        "method": "POST"
      });
      url = await url.json()
      for (var i = 0; i < url.length; i++) {
        if (ai == url[i].id) {
          await this.gpt5(e)
          return true
        }
      }
    } catch { }
    if (ai == "xiaoai") {
      await this.xiaoai(e)
      return true
    }
    if (ai == "gpt1") {
      await this.gpt1(e)
      return true
    }
    if (ai == "gpt2") {
      await this.gpt2(e)
      return true
    }
    if (ai == "gpt3") {
      await this.gpt3(e)
      return true
    }
    if (ai == "gpt4") {
      await this.gpt4(e)
      return true
    }
    if (ai == "waifuai") {
      await this.waifuai(e)
      return true
    }
    if (ai == "mly") {
      await this.mly(e)
      return true
    }
    if (ai == "ownthink") {
      await this.ownthink(e)
      return true
    }
    if (ai == "businessai") {
      await this.businessai(e)
      return true
    }
    if (ai == "welmai") {
      await this.welmai(e)
      return true
    }
    if (ai == "qingyunke") {
      await this.qingyunke(e)
      return true
    }
    if (ai == "dilly") {
      await this.dilly(e)
      return true
    }
  }
  async ownthink(e) {
    console.log("当前为思知ai")
    msg = _.trimStart(e.msg, botname)
    let url = `https://api.ownthink.com/bot?appid=xiaosi&userid=user&spoken=${msg}`;
    let response = await fetch(url);
    let res = await response.json();
    let text = await res.data.info.text
    console.log(res.data.type);
    e.reply(text)
  }
  async qingyunke(e) {
    console.log("当前为青云客ai")
    msg = _.trimStart(e.msg, botname)
    let op = await fetch(`http://api.qingyunke.com/api.php?key=free&appid=0&msg=${msg}_=1679304122248`, {
      method: "get",
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        'key': 'free',
        appid: 0,
        msg: msg,
        '_': 1679304122249
      }
    }).then((data) => {
      return data.json();
    })
    console.log(op)
    let content = await op.content
    e.reply(content)
  }
  async welmai(e) {
    console.log("当前为welmai")
    msg = _.trimStart(e.msg, botname)
    let url = `https://v1.welm.cc/?q=${msg}&apitype=sql`
    let res = await fetch(url)
    res = await res.json()
    let code = await res.code
    if (code == "200") {
      let Welm_Answer = await res.Welm_Answer
      e.reply(Welm_Answer)
    } else {
      e.reply("连接失败了")
    }
  }
  async waifuai(e) {
    console.log("waifuai")
    msg = _.trimStart(e.msg, botname)
    let name = e.sender.nickname
    let op = ""
    let url = "https://waifu.p.rapidapi.com/v1/waifu"
    op = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        "user_id": name,
        message: msg,
        "from_name": name,
        "to_name": botname,
        situation: ` ${botname} is ${name}'s girlfriend`,
        "translate_from": 'auto',
        "translate_to": 'auto'
      }),
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': 'f9f619ad56mshaac66164ef8f398p177a60jsna0af321e44c5',
        'X-RapidAPI-Host': 'waifu.p.rapidapi.com'
      }
    })
    let o = await op.json()
    let response = await o.response
    console.log(o)
    e.reply(response)
  }
  async xiaoai(e) {
    console.log("当前为小爱ai")
    msg = _.trimStart(e.msg, botname)
    let url = `https://xiaoapi.cn/API/lt_xiaoai.php?type=json&msg=${msg}`
    //console.log(url)
    let res = await fetch(url)
    res = await res.json()
    let txt = await res.data.txt
    txt = txt.replace(/小爱/g, botname)
    //console.log(res)
    e.reply(txt)
  }

  async mly(e) {
    console.log("当前为茉莉云ai")
    let ApiSecret = "yuuc2m72"
    let url = "https://i.mly.app/reply";
    msg = _.trimStart(e.msg, botname)
    let type = e.isPrivate == true ? 1 : 2;
    let from = e.isPrivate == true ? e.user_id : e.group.group_id;
    let fromName = e.isPrivate == true ? e.friend.remark : e.group.name;
    let params = {
      "content": msg,
      "type": type,
      "from": from,
      "fromName": fromName,
      "to": from,
      "toName": fromName
    };
    const response = await fetch(url, {
      method: "post",
      headers: {
        'Api-Key': ApiKey,
        'Api-Secret': ApiSecret,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      let res = data.data[0];
      if (res) {
        if (res.typed == 1) {
          e.reply(res.content);
        }
      }
    });
    return true;
  }
  async businessai(e) {
    console.log("当前为businessai")
    msg = _.trimStart(e.msg, botname)
    const encodedParams = new URLSearchParams();
    encodedParams.append("in", `${msg}`);
    encodedParams.append("op", "in");
    encodedParams.append("cbot", "1");
    encodedParams.append("SessionID", "RapidAPI1");
    encodedParams.append("cbid", "1");
    encodedParams.append("key", "RHMN5hnQ4wTYZBGCF3dfxzypt68rVP");
    encodedParams.append("ChatSource", "RapidAPI");
    encodedParams.append("duration", "1");

    const options = await fetch("https://robomatic-ai.p.rapidapi.com/api", {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'X-RapidAPI-Key': 'f9f619ad56mshaac66164ef8f398p177a60jsna0af321e44c5',
        'X-RapidAPI-Host': 'robomatic-ai.p.rapidapi.com'
      },
      body: encodedParams
    })
    let yuan = await options.json()
    let out = await yuan.out
    e.reply(out)
  }
  async Aeonaai(e) {
    console.log("当前为Aeonaai")
    msg = _.trimStart(e.msg, botname)
    const url = 'https://aeona3.p.rapidapi.com/?text=%3CREQUIRED%3E&userId=12312312312';

    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': '3ed845021amsh2712e272b3f2affp122ca1jsnd0276a2db8de',
        'X-RapidAPI-Host': 'aeona3.p.rapidapi.com'
      }
    };

    fetch(url, options)
      .then(res => res.text())
      .then(json => console.log(json))
      .catch(err => console.error('error:' + err))

  }
  async tu(e) {
    let url = "https://randomfox.ca/floof/"
    let res = await fetch(url)
    res = await res.json()
    let img = await res.image
    console.log(res)
    e.reply([segment.image(img)])
    let url2 = "https://api.thecatapi.com/v1/images/search?limit=1"
    let response = await fetch(url2)
    response = await response.text()
    let image = await response.match(/"http(.*?)"/g)
    let y = `${image}`
    y = y.replace(/"/g, "")
    e.reply([segment.image(y)])
  }
  async dilly(e) {
    msg = _.trimStart(e.msg, botname)
    let response = await fetch('https://lemurbot.p.rapidapi.com/chat', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': 'f9f619ad56mshaac66164ef8f398p177a60jsna0af321e44c5',
        'X-RapidAPI-Host': 'lemurbot.p.rapidapi.com'
      },
      body: JSON.stringify({
        bot: 'dilly',
        client: 'd531e3bd-b6c3-4f3f-bb58-a6632cbed5e2',
        message: msg
      })
    })
    response = await response.json()
    e.reply(response.data.conversation.output);
  }

  async makeForwardMsg(e) {
    let nickname = Bot.nickname
    let title = "阴天免费ai模型"
    if (this.e.isGroup) {
      let info = await Bot.getGroupMemberInfo(this.e.group_id, Bot.uin)
      nickname = info.card ?? info.nickname
    }
    let userInfo = {
      user_id: Bot.uin,
      nickname
    }
    let forwardMsg = [{
      ...userInfo,
      message: "id:1\n模型:小爱\n简介:简单的时尚对话功能,天气等"
    }, {
      ...userInfo,
      message: "id:2\n模型:青云客\n简介:嘴臭机器人"
    }, {
      ...userInfo,
      message: "id:3\n模型:思知\n简介:可以对话的金融机器人"
    }, {
      ...userInfo,
      message: "id:4\n模型:welm\n简介:微信推出的对话模型,主要功能为联想续写,并不能主动交互"
    }, {
      ...userInfo,
      message: "id:5\n模型:茉莉云\n简介:简单的对话机器人"
    }, {
      ...userInfo,
      message: "id:6\n模型:businessai\n简介:商业对话模型ai(仅限英文对话)"
    }, {
      ...userInfo,
      message: "id:7\n模型:dilly\n简介:娱乐性机器人"
    }, {
      ...userInfo,
      message: "id:8\n模型:gpt-3.5\n简介:chatgpt-3.5,不能连续对话"
    }, {
      ...userInfo,
      message: "id:9\n模型:gpt-3.5-lx\n简介:chatgpt-3.5,可连续对话"
    }, {
      ...userInfo,
      message: "id:10\n模型:gpt-3.5-16k\n简介:chatgpt新的3.5模型,支持更长的token,可连续对话"
    }, {
      ...userInfo,
      message: "id:11\n模型:waifu\n简介:娱乐对话型机器人"
    }, {
      ...userInfo,
      message: "id:12\n模型:gpt-3.5\n简介:另一个连续对话的gpt-3.5"
    }]
    let t = {
      ...userInfo,
      message: "请发送#切换AI+id来切换"
    }
    try {
      let url = await fetch("https://gpt.free.lsdev.me/api/models", {
        "headers": {
          "content-type": "application/json"
        },
        "body": "{\"key\":\"\"}",
        "method": "POST"
      });
      url = await url.json()
      for (var i = 0; i < url.length; i++) {
        let id = "id:" + Number(i + 13) + "\n" + "模型:" + url[i].id
        let c = {
          ...userInfo,
          message: id
        }
        forwardMsg.push(c)
      }
    } catch { }
    forwardMsg.push(t)
    if (this.e.isGroup) {
      forwardMsg = await this.e.group.makeForwardMsg(forwardMsg)
    } else {
      forwardMsg = await this.e.friend.makeForwardMsg(forwardMsg)
    }
    e.reply(forwardMsg)

  }

}