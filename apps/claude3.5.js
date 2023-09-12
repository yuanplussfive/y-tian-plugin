import plugin from '../../../lib/plugins/plugin.js'
import common from '../../../lib/common/common.js'
import fetch from 'node-fetch'
import fs from 'fs'
import _ from 'lodash'
const _path = process.cwd()
let dirpath = _path + '/data/YTclaude'
if (!fs.existsSync(dirpath)) {
  fs.mkdirSync(dirpath)
}
if (!fs.existsSync(dirpath + "/" + "data.json")) {
  fs.writeFileSync(dirpath + "/" + "data.json", JSON.stringify({
    "claude": {
      "token":
        "xoxc-5206162159894-5215260943140-5212779910274-b5a7235511b9f846ba88974fd8dcfff808fdc457f19eee1da992005946243c2b",
      "d": "xoxd-%2FDNeKnjJyBhuwn1xy4NL3xCiI4u8O1%2F4knv61sLw6oTzeYSGfdVzAnQko8iDCCfzd4UPe3oiHRwGZ0YLPpcvDCG5oHj6UNlrk2KyiFPlCl2TzJCpD7NQojlBueNm9As99Ri0eo9vm3qCvqpSCwqWDoF3dYRTjDuXBUzGqiyVAQmYYQeX2kf40bb%2B7ma27AO837Gw5J96TXk%3D",
      "channel": "114514",
      "botname": "/claude"
    }
  }))
}
let botname = "/claude"
let d;
let token;
let history = {}
let time = {}
try {
  if (fs.existsSync(dirpath + "/" + "data.json")) {
    d = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json")).claude.d
    token = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json")).claude.token
  }
} catch { }
async function claudename() {
  if (fs.existsSync(dirpath + "/" + "data.json")) {
    let data = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json"))
    botname = data.claude.botname
    console.log(`现在slack频道claude名称为${botname}`)
  }
}
await claudename()
let botid = "U057DD1UCLF"
export class example extends plugin {
  constructor() {
    super({
      name: '阴天[claude2]',
      dsc: 'mm',
      event: 'message',
      priority: -11145,
      rule: [
        {
          reg: `^${botname}(.*)`,
          fnc: 'chat'
        }, {
          reg: "^/slack创建",
          fnc: 'setup'

        }, {
          reg: "^/slack触发(.*?)",
          fnc: 'changename'
        }, {
          reg: "^/Reset",
          fnc: 'endchat'
        }, {
          reg: "^/切换预设(.*?)",
          fnc: 'change'
        }, {
          reg: "^/slack切换(.*?)",
          fnc: 'changemodel'
        }, {
          reg: "^/slack帮助",
          fnc: 'slackhelp'
        }, {
          reg: "^/slack重建",
          fnc: 'slackform'
        }
      ]
    })
  }
  async slackform(e) {
    if (!e.isMaster) { e.reply("你无权创建", true); return false }
    if (fs.existsSync(dirpath + "/" + "data.json")) {
      let data = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json"))
      token = data.claude.token
      d = data.claude.d
      var randomNumber = Math.floor(Math.random() * 90000) + 10000;
      let infor = await
        fetch(`https://slack.com/api/conversations.create?name=${e.user_id}-${randomNumber}&pretty=1`, {
          "headers": {
            "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryKVFfuTLPotnFX8F7",
            "cookie": `d=${d}`
          },
          "body": `------WebKitFormBoundaryKVFfuTLPotnFX8F7\r\nContent-Disposition: form-data; name=\"content\"\r\n\r\nnull\r\n------WebKitFormBoundaryKVFfuTLPotnFX8F7\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${token}\r\n------WebKitFormBoundaryKVFfuTLPotnFX8F7--\r\n`,
          "method": "POST"
        });
      infor = await infor.json()
      //console.log(infor)
      if (infor.error) { e.reply("你已经创建过频道了.", true); return false }
      data.claude.channel = await infor.channel.id
      fs.writeFileSync(dirpath + "/" + "data.json", JSON.stringify(data), "utf-8")
      let content = await fetch(`https://slack.com/api/conversations.invite?channel=${infor.channel.id}&users=U057DD1UCLF&pretty=1`, {
        "headers": {
          "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryfEj5VJT61Hk62UNo",
          "cookie": `d=${d}`
        },
        "body": `------WebKitFormBoundaryfEj5VJT61Hk62UNo\r\nContent-Disposition: form-data; name=\"content\"\r\n\r\nnull\r\n------WebKitFormBoundaryfEj5VJT61Hk62UNo\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${token}\r\n------WebKitFormBoundaryfEj5VJT61Hk62UNo--\r\n`,
        "method": "POST"
      });
      content = await content.json()
      console.log(content)
      if (content.error) { e.reply("创建失败了!"); return false }
      e.reply("正在将claude应用添加到slack频道中")
      await common.sleep(1400)
      e.reply("创建成功!")
    }
  }
  async slackhelp(e) {
    let answer = `简略功能表(懒得写HTML)\n①:设置名称+问题触发(默认为/claude)\n②:/slack触发+名称;更改名称\n③:/切换预设+预设名称;将预设文件放在${_path}/data/YTclaude下,TXT文件\n④:/Reset;重置对话\n⑤:/slack创建;创建claude\n⑥:/slack重建;若出现无法对话的情况,可尝试重建工作区;`
    e.reply(answer)
  }
  async chat(e) {
    if (botid == "U057DD1UCLF") {
      await this.help(e)
    } else if (botid == "U05MCG81Z9A") {
      await this.webgpt(e)
    }
  }
  async webgpt(e) {
    let msg = e.msg.replace(botname, "").trim()
    console.log(msg)
    if (fs.existsSync(dirpath + "/" + "data.json")) {
      let data = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json"))
      let channel = data.claude.channel
      if (channel == "114514") { e.reply("请先发送:\n/slack创建→以创建slack频道"); return false }
      d = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json")).claude.d
      token = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json")).claude.token
      let body = `------WebKitFormBoundaryAFymXOzqBWzA5q5R\r\nContent-Disposition: form-data; name=\"content\"\r\n\r\nnull\r\n------WebKitFormBoundaryAFymXOzqBWzA5q5R\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${token}\r\n------WebKitFormBoundaryAFymXOzqBWzA5q5R--\r\n`
      const blocks = [{
        "type": "rich_text",
        "elements":
          [{
            "type": "rich_text_section",
            "elements":
              [{
                "type": "user",
                "user_id": botid
              },
              {
                "type": "text", "text": msg
              }]
          }]
      }]
      if (history[e.user_id] == undefined || history[e.user_id] == "114514") {
        time[e.user_id] = ""
      }
      const payload = { blocks: blocks, channel: channel, "thread_ts": time[e.user_id] };
      const data2 = JSON.stringify(payload);
      const url = 'https://slack.com/api/chat.postMessage';
      const header = {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Bearer " + token,
        "cookie": `d=${d}`
      };
      let c = await fetch(url, {
        method: 'POST',
        headers: header,
        body: data2
      })
      c = await c.json()
      console.log(c)
      let ts = await c.message.ts
      if (history[e.user_id] == undefined || history[e.user_id] == "114514") {
        history[e.user_id] = ts
        time[e.user_id] = ts
      }
      let answer
      //console.log(history[e.user_id])
      do {
        answer = await fetch(`https://slack.com/api/conversations.replies?channel=${channel}&ts=${ts}`, {
          "headers": {
            "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryTotJQ9kaNkT7dchz",
            "cookie": `d=${d}`
          },
          "body": `------WebKitFormBoundaryTotJQ9kaNkT7dchz\r\nContent-Disposition: form-data; name=\"content\"\r\n\r\nnull\r\n------WebKitFormBoundaryTotJQ9kaNkT7dchz\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${token}\r\n------WebKitFormBoundaryTotJQ9kaNkT7dchz--\r\n`,
          "method": "POST"
        });
        answer = await answer.json()
        await common.sleep(5550)
        console.log(answer)
        if (answer.messages[1] && !answer.messages[1].text.includes("_Typing…_")) {
          let answer = answer.messages[1].text
          function escape2Html(str) {
            var arrEntities = { 'lt': '<', 'gt': '>', 'nbsp': ' ', 'amp': '&', 'quot': '"' };
            return str.replace(/&(lt|gt|nbsp|amp|quot);/ig, function (all, t) {
              return arrEntities[t];
            });
          }
          let daan = [segment.at(e.user_id), escape2Html(answer)];
          e.reply(daan);
        }
      } while (answer.messages[1] || answer.messages[1].text.includes("_Typing…_"))
    }
  }
  async changemodel(e) {
    let msg = e.msg.replace(/\/slack切换/g, "")
    if (msg == "claude") { botid = "U057DD1UCLF" }
    else if (msg == "webgpt") { botid = "U05MCG81Z9A" }
    e.reply("切换成功")
  }
  async change(e) {
    let msg = e.msg.replace(/\/切换预设/g, "")
    if (!fs.existsSync(dirpath + "/" + `${msg}.txt`)) {
      e.reply("当前预设不存在,无法切换!", true)
      return false
    }
    if (fs.existsSync(dirpath + "/" + `${msg}.txt`)) {
      e.reply("正在切换中，请稍后", true)
      if (fs.existsSync(dirpath + "/" + "data.json")) {
        let data = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json"))
        let channel = data.claude.channel
        if (channel == "114514") { e.reply("请先发送:\n/slack创建→以创建slack频道"); return false }
        d = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json")).claude.d
        token = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json")).claude.token
        let ys = fs.readFileSync(dirpath + "/" + `${msg}.txt`, "utf-8")
        //console.log(ys)
        let body = `------WebKitFormBoundaryAFymXOzqBWzA5q5R\r\nContent-Disposition: form-data; name=\"content\"\r\n\r\nnull\r\n------WebKitFormBoundaryAFymXOzqBWzA5q5R\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${token}\r\n------WebKitFormBoundaryAFymXOzqBWzA5q5R--\r\n`
        const blocks = [{
          "type": "rich_text",
          "elements":
            [{
              "type": "rich_text_section",
              "elements":
                [{
                  "type": "user",
                  "user_id": "U057DD1UCLF"
                },
                {
                  "type": "text", "text": ys
                }]
            }]
        }]
        const payload = { blocks: blocks, channel: channel };
        const data2 = JSON.stringify(payload);
        const url = 'https://slack.com/api/chat.postMessage';
        const header = {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": "Bearer " + token,
          "cookie": `d=${d}`
        };
        let c = await fetch(url, {
          method: 'POST',
          headers: header,
          body: data2
        })
        c = await c.json()
        console.log(c)
        if (c.error) { e.reply("当前预设过长", true); return false }
        let ts = await c.message.ts
        if (history[e.user_id] == undefined || history[e.user_id] == "114514") {
          history[e.user_id] = ts
          time[e.user_id] = ts
        }
        let answer;
        let count = 0;
        let ifclose = "open"
        let typingCount = 0; // 计数器，记录"Typing..."的次数
        async function executeRequest() {
          let answer = await fetch(`https://slack.com/api/conversations.replies?channel=${channel}&ts=${history[e.user_id]}&pretty=1&oldest=${ts}`, {
            "headers": {
              "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryTotJQ9kaNkT7dchz",
              "cookie": `d=${d}`
            },
            "body": `------WebKitFormBoundaryTotJQ9kaNkT7dchz\r\nContent-Disposition: form-data; name=\"content\"\r\n\r\nnull\r\n------WebKitFormBoundaryTotJQ9kaNkT7dchz\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${token}\r\n------WebKitFormBoundaryTotJQ9kaNkT7dchz--\r\n`,
            "method": "POST"
          });

          const result = await answer.json();
          //console.log(result);

          if (count === 15) {
            e.reply("slack通讯失败,请尝试重新对话!")
            clearInterval(intervalId)
            return true
          }
          if (result.error) {
            count++
            console.log(`slack通信速率被限制,正在尝试绕过! 次数:${count}`, true);
            await common.sleep(4000);
            return; // 如果出现错误，则等待一段时间后直接返回，不执行下面的逻辑
          }

          if (result.messages[1]) {
            if (result.messages[1].text === "_Typing…_") {
              typingCount++;
            } else if (!result.messages[1].text.includes("_Typing…_")) {
              let daan = [segment.at(e.user_id), result.messages[1].text];
              e.reply(daan);
              clearInterval(intervalId); // 有回复消息，停止定时请求
            }
          }

          if (typingCount === 10) {
            clearInterval(intervalId); // 达到十次，停止定时请求
            e.reply("slack通讯失败，请重置对话!", true);
            return true;
          }
        }

        // 每隔五秒钟执行一次请求
        const intervalId = setInterval(executeRequest, 5000);
      }
    }
  }
  async endchat(e) {
    time[e.user_id] = ""
    history[e.user_id] = "114514"
    e.reply(`用户:${e.sender.nickname}成功重置对话了`, true)
  }
  async changename(e) {
    try {
      let msg = e.msg.replace(/\/slack触发/g, "").trim()
      if (fs.existsSync(dirpath + "/" + "data.json")) {
        let data = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json"))
        data.claude.botname = msg
        fs.writeFileSync(dirpath + "/" + "data.json", JSON.stringify(data), "utf-8")
        e.reply(`slack频道claude成功改名为[${msg}]`, true)
      }
    } catch { e.reply("改名失败了", true) }
  }
  async setup(e) {
    if (!e.isMaster) { e.reply("你无权创建", true); return false }
    if (fs.existsSync(dirpath + "/" + "data.json")) {
      let data = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json"))
      token = data.claude.token
      d = data.claude.d
      let infor = await
        fetch(`https://slack.com/api/conversations.create?name=${e.user_id}&pretty=1`, {
          "headers": {
            "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryKVFfuTLPotnFX8F7",
            "cookie": `d=${d}`
          },
          "body": `------WebKitFormBoundaryKVFfuTLPotnFX8F7\r\nContent-Disposition: form-data; name=\"content\"\r\n\r\nnull\r\n------WebKitFormBoundaryKVFfuTLPotnFX8F7\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${token}\r\n------WebKitFormBoundaryKVFfuTLPotnFX8F7--\r\n`,
          "method": "POST"
        });
      infor = await infor.json()
      console.log(infor)
      if (infor.error) { e.reply("你已经创建过频道了.", true); return false }
      await e.reply("已检验到您当前未有任何slack频道,开始自行创建~")
      data.claude.channel = await infor.channel.id
      fs.writeFileSync(dirpath + "/" + "data.json", JSON.stringify(data), "utf-8")
      let content = await fetch(`https://slack.com/api/conversations.invite?channel=${infor.channel.id}&users=U057DD1UCLF&pretty=1`, {
        "headers": {
          "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryfEj5VJT61Hk62UNo",
          "cookie": `d=${d}`
        },
        "body": `------WebKitFormBoundaryfEj5VJT61Hk62UNo\r\nContent-Disposition: form-data; name=\"content\"\r\n\r\nnull\r\n------WebKitFormBoundaryfEj5VJT61Hk62UNo\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${token}\r\n------WebKitFormBoundaryfEj5VJT61Hk62UNo--\r\n`,
        "method": "POST"
      });
      content = await content.json()
      //console.log(content)
      if (content.error) { e.reply("创建失败了!"); return false }
      e.reply("正在将claude应用添加到slack频道中")
      await common.sleep(1400)
      e.reply("创建成功!")
    }
  }






  async help2(e) {

    if (fs.existsSync(dirpath + "/" + "data.json")) {
      let js2 = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json", 'utf8'))
      token = js2.claude.token//token
      d = js2.claude.d//cookie中的d值
      channel = js2.claude.channel//频道
      chong = js2.claude.chong//url
      channel = "C0565QF77QD"
    }
    let name = e.sender.nickname
    msg = e.msg.replace(botname, "").trim()
    msg = "@U056B7NTR44"
    let b = await fetch("https://slack.com/api/conversations.replies?channel=C0565QF77QD&ts=1690935571.014509&include_all_metadata=1&limit=1&pretty=1", {
      "method": "POST",
      "headers": {
        "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryTotJQ9kaNkT7dchz",
        "cookie": `d=${d}`
      },
      "body": `------WebKitFormBoundaryTotJQ9kaNkT7dchz\r\nContent-Disposition: form-data; name=\"content\"\r\n\r\nnull\r\n------WebKitFormBoundaryTotJQ9kaNkT7dchz\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${token}\r\n------WebKitFormBoundaryTotJQ9kaNkT7dchz--\r\n`,
    });
    b = await b.json()
    console.log(b)
  }
  async help(e) {
    let msg = e.msg.replace(botname, "").trim()
    console.log(msg)
    if (fs.existsSync(dirpath + "/" + "data.json")) {
      let data = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json"))
      let channel = data.claude.channel
      if (channel == "114514") { e.reply("请先发送:\n/slack创建→以创建slack频道"); return false }
      d = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json")).claude.d
      token = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json")).claude.token
      let body = `------WebKitFormBoundaryAFymXOzqBWzA5q5R\r\nContent-Disposition: form-data; name=\"content\"\r\n\r\nnull\r\n------WebKitFormBoundaryAFymXOzqBWzA5q5R\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${token}\r\n------WebKitFormBoundaryAFymXOzqBWzA5q5R--\r\n`
      const blocks = [{
        "type": "rich_text",
        "elements":
          [{
            "type": "rich_text_section",
            "elements":
              [{
                "type": "user",
                "user_id": botid
              },
              {
                "type": "text", "text": msg
              }]
          }]
      }]
      if (history[e.user_id] == undefined || history[e.user_id] == "114514") {
        time[e.user_id] = ""
      }
      const payload = { blocks: blocks, channel: channel, "thread_ts": time[e.user_id] };
      const data2 = JSON.stringify(payload);
      const url = 'https://slack.com/api/chat.postMessage';
      const header = {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Bearer " + token,
        "cookie": `d=${d}`
      };
      let c = await fetch(url, {
        method: 'POST',
        headers: header,
        body: data2
      })
      c = await c.json()
      console.log(c)
      let ts = await c.message.ts
      if (history[e.user_id] == undefined || history[e.user_id] == "114514") {
        history[e.user_id] = ts
        time[e.user_id] = ts
      }
      let answer
      //console.log(history[e.user_id])
      let count = 0;
      let ifclose = "open"
      let typingCount = 0; // 计数器，记录"Typing..."的次数
      async function executeRequest() {
        let answer = await fetch(`https://slack.com/api/conversations.replies?channel=${channel}&ts=${history[e.user_id]}&pretty=1&oldest=${ts}`, {
          "headers": {
            "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryTotJQ9kaNkT7dchz",
            "cookie": `d=${d}`
          },
          "body": `------WebKitFormBoundaryTotJQ9kaNkT7dchz\r\nContent-Disposition: form-data; name=\"content\"\r\n\r\nnull\r\n------WebKitFormBoundaryTotJQ9kaNkT7dchz\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${token}\r\n------WebKitFormBoundaryTotJQ9kaNkT7dchz--\r\n`,
          "method": "POST"
        });

        const result = await answer.json();
        //console.log(result);

        if (count === 15) {
          e.reply("slack通讯失败,请尝试重新对话!")
          clearInterval(intervalId)
          return true
        }
        if (result.error) {
          count++
          console.log(`slack通信速率被限制,正在尝试绕过! 次数:${count}`, true);
          await common.sleep(4000);
          return; // 如果出现错误，则等待一段时间后直接返回，不执行下面的逻辑
        }

        if (result.messages[1]) {
          if (result.messages[1].text === "_Typing…_") {
            typingCount++;
          } else if (!result.messages[1].text.includes("_Typing…_")) {
            let daan = [segment.at(e.user_id), result.messages[1].text];
            e.reply(daan);
            clearInterval(intervalId); // 有回复消息，停止定时请求
          }
        }

        if (typingCount === 10) {
          clearInterval(intervalId); // 达到十次，停止定时请求
          e.reply("slack通讯失败，请重置对话!", true);
          return true;
        }
      }

      // 每隔五秒钟执行一次请求
      const intervalId = setInterval(executeRequest, 5000);
    }
  }
}