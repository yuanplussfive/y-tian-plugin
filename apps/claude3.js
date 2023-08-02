//方法，机器人名+问题,名字自己在下面改;
//更详细教程加群了解：756783127
import plugin from '../../../lib/plugins/plugin.js'
import cfg from '../../../lib/config/config.js'
import common from'../../../lib/common/common.js'
import fetch from 'node-fetch'
import fs from 'fs'
import _ from 'lodash'
const _path = process.cwd()
let dirpath = _path + '/data/YTclaude'
if(!fs.existsSync(dirpath)){
fs.mkdirSync(dirpath)    
}
if (!fs.existsSync(dirpath + "/" + "data.json")){
  fs.writeFileSync(dirpath+ "/" + "data.json",JSON.stringify({
"claude":{
"token":
"xoxc-5206162159894-5215260943140-5212779910274-b5a7235511b9f846ba88974fd8dcfff808fdc457f19eee1da992005946243c2b",
"d":"xoxd-TZ9cxp%2BOClKHTf2bM%2BWryz9xMFk3ocMNlzzgOvVg8%2BZET62y3Uhi%2BwRhA%2BpJhV1xeOqG2Dfidn%2F5RIZllv2dG4gr6aVIabvL%2FJJZDyGCQ1Gj9EEY3Afa0NwDx7b90jJl1f%2Fu%2F6LbBAdY3lCVd1jJ1Y2PIjOp6k5Wy3As0V6vVwoXM8NQFV4UleZcoCnZjq5D95jcxN3eZ7E%3D",
"channel":"114514",
"botname":"/claude"
}}))
}
let botname;
let d;
let token;
if (fs.existsSync(dirpath + "/" + "data.json")){
botname = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json")).claude.botname
d = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json")).claude.d
token = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json")).claude.token
}

export class example extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: '阴天claude',
      /** 功能描述 */
      dsc: 'mm',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: -558885,
      rule: [
        {
          /** 命令正则匹配 */
          reg: `^${botname}(.*)`,
          /** 执行方法 */
          fnc: 'help'
},{
          reg: "^/slack创建频道",
          /** 执行方法 */
          fnc: 'setup'

}
      ]
    })
}
async setup(e){
if(!e.isMaster){e.reply("你无权创建",true);return false}
if (fs.existsSync(dirpath + "/" + "data.json")){
let data = JSON.parse(fs.readFileSync(dirpath+"/"+"data.json"))
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
if(infor.error){e.reply("你已经创建过频道了.",true);return false}
e.reply("已检验到您当前未有任何slack频道,开始自行创建~")
data.claude.channel = infor.channel.id
fs.writeFileSync(dirpath + "/" + "data.json",JSON.stringify(data),"utf-8")
await common.sleep(1400)
e.reply("创建成功!")
}
}






async help2(e) {

if (fs.existsSync(dirpath + "/" + "data.json")){
let js2 = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json",'utf8'))
token = js2.claude.token//token
d = js2.claude.d//cookie中的d值
channel = js2.claude.channel//频道
chong = js2.claude.chong//url
channel = "C0565QF77QD"
}
let name = e.sender.nickname
msg = e.msg.replace(botname,"").trim()
msg = "@U056B7NTR44"
let b = await fetch("https://slack.com/api/conversations.replies?channel=C0565QF77QD&ts=1690935571.014509&include_all_metadata=1&limit=1&pretty=1", {
  "headers": {
    "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryTotJQ9kaNkT7dchz",
    "cookie": `d=${d}`
  },
  "body": `------WebKitFormBoundaryTotJQ9kaNkT7dchz\r\nContent-Disposition: form-data; name=\"content\"\r\n\r\nnull\r\n------WebKitFormBoundaryTotJQ9kaNkT7dchz\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${token}\r\n------WebKitFormBoundaryTotJQ9kaNkT7dchz--\r\n`,
  "method": "POST"
});
b= await b.json()
console.log(b)
}
async help(e){
let msg = e.msg.replace(botname,"").trim()
if (fs.existsSync(dirpath + "/" + "data.json")){
let data = JSON.parse(fs.readFileSync(dirpath+"/"+"data.json"))
let channel = data.claude.channel
if(channel == "114514"){e.reply("请先发送/slack创建频道");return false}
d = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json")).claude.d
token = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json")).claude.token
let body =  `------WebKitFormBoundaryAFymXOzqBWzA5q5R\r\nContent-Disposition: form-data; name=\"content\"\r\n\r\nnull\r\n------WebKitFormBoundaryAFymXOzqBWzA5q5R\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${token}\r\n------WebKitFormBoundaryAFymXOzqBWzA5q5R--\r\n`
  const blocks = [{
"type":"rich_text",
"elements":
[{"type":"rich_text_section",
"elements":
[{"type":"user",
"user_id":"U057DD1UCLF"
},
{"type":"text","text": msg
}]}]}]

  const payload = { blocks: blocks, channel: channel };
  const data2 = JSON.stringify(payload);
  const url = 'https://slack.com/api/chat.postMessage';
  const header = {
    "Content-Type": "application/json; charset=utf-8",
    "Authorization": "Bearer " + token,
    "cookie": `d=${d}`
  };
let c = await  fetch(url, {
    method: 'POST',
    headers: header,
    body: data2
  })
c = await c.json()
console.log(c)
let ts = await c.message.ts
let answer
do{
answer = await fetch(`https://slack.com/api/conversations.replies?channel=${channel}&ts=${ts}&pretty=1&oldest=${ts}`, {
  "headers": {
    "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryTotJQ9kaNkT7dchz",
    "cookie": `d=${d}`
  },
  "body": `------WebKitFormBoundaryTotJQ9kaNkT7dchz\r\nContent-Disposition: form-data; name=\"content\"\r\n\r\nnull\r\n------WebKitFormBoundaryTotJQ9kaNkT7dchz\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${token}\r\n------WebKitFormBoundaryTotJQ9kaNkT7dchz--\r\n`,
  "method": "POST"
});
answer = await answer.json()
if(answer.messages[1]&&!answer.messages[1].text.includes("_Typing…_")){
e.reply(answer.messages[1].text)
}
}while(!answer.messages[1]||answer.messages[1].text.includes("_Typing…_"))
}}}


















