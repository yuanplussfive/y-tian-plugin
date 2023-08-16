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
let botname = "/claude"
let d;
let token;
let history = {}
let time = {}
try{
if (fs.existsSync(dirpath + "/" + "data.json")){
d = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json")).claude.d
token = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json")).claude.token
}}catch{}
async function claudename(){
if (fs.existsSync(dirpath + "/" + "data.json")){
let data = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json"))
botname = data.claude.botname
console.log(`现在slack频道claude名称为${botname}`)
}}
await claudename()
let botid = "U057DD1UCLF"
export class example extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: '阴天[claude2]',
      /** 功能描述 */
      dsc: 'mm',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: -1145,
      rule: [
        {
          /** 命令正则匹配 */
          reg: `^${botname}(.*)`,
          /** 执行方法 */
          fnc: 'chat'
},{
          reg: "^/slack创建",
          /** 执行方法 */
          fnc: 'setup'

},{
          reg: "^/slack触发(.*?)",
          /** 执行方法 */
          fnc: 'changename'
},{
          reg: "^/Reset",
          /** 执行方法 */
          fnc: 'endchat'
},{
          reg: "^/切换预设(.*?)",
          /** 执行方法 */
          fnc: 'change'
},{
          reg: "^/slack切换(.*?)",
          /** 执行方法 */
          fnc: 'changemodel'
},{
          reg: "^/slack帮助",
          /** 执行方法 */
          fnc: 'slackhelp'

}
      ]
    })
}
async slackhelp(e){
let answer = "简略功能表(懒得写HTML)\n①:设置名称+问题触发(默认为/claude)\n②:/slack触发+名称;更改名称\n③:/切换预设+预设名称;将预设文件放在data/YTclaude下,TXT文件\n④:/Reset;重置对话\n⑤/slack创建;创建claude"
e.reply(answer)
}
async chat(e){
if(botid == "U057DD1UCLF"){
await this.help(e)
}else if(botid == "U05MCG81Z9A"){
await this.webgpt(e)
}
}
async webgpt(e){
let msg = e.msg.replace(botname,"").trim()
console.log(msg)
if (fs.existsSync(dirpath + "/" + "data.json")){
let data = JSON.parse(fs.readFileSync(dirpath+"/"+"data.json"))
let channel = data.claude.channel
if(channel == "114514"){e.reply("请先发送:\n/slack创建→以创建slack频道");return false}
d = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json")).claude.d
token = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json")).claude.token
let body =  `------WebKitFormBoundaryAFymXOzqBWzA5q5R\r\nContent-Disposition: form-data; name=\"content\"\r\n\r\nnull\r\n------WebKitFormBoundaryAFymXOzqBWzA5q5R\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${token}\r\n------WebKitFormBoundaryAFymXOzqBWzA5q5R--\r\n`
  const blocks = [{
"type":"rich_text",
"elements":
[{"type":"rich_text_section",
"elements":
[{"type":"user",
"user_id": botid
},
{"type":"text","text": msg
}]}]}]
if(history[e.user_id] == undefined||history[e.user_id] == "114514"){
time[e.user_id] = ""
}
  const payload = { blocks: blocks, channel: channel, "thread_ts": time[e.user_id]};
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
if(history[e.user_id] == undefined||history[e.user_id] == "114514"){
history[e.user_id] = ts
time[e.user_id] = ts
}
let answer
//console.log(history[e.user_id])
do{
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
if(answer.messages[1]&&!answer.messages[1].text.includes("_Typing…_")){
let daan = [segment.at(e.user_id),answer.messages[1].text]
e.reply(daan)
}
}while(answer.messages[1]||answer.messages[1].text.includes("_Typing…_"))
}}
async changemodel(e){
let msg = e.msg.replace(/\/slack切换/g,"")
if(msg == "claude"){botid = "U057DD1UCLF"}
else if(msg == "webgpt"){botid = "U05MCG81Z9A"}
e.reply("切换成功")
}
async change(e){
let msg = e.msg.replace(/\/切换预设/g,"")
if (!fs.existsSync(dirpath + "/" + `${msg}.txt`)){
e.reply("当前预设不存在,无法切换!",true)
return false
}
if (fs.existsSync(dirpath + "/" + `${msg}.txt`)){
e.reply("正在切换中，请稍后",true)
if (fs.existsSync(dirpath + "/" + "data.json")){
let data = JSON.parse(fs.readFileSync(dirpath+"/"+"data.json"))
let channel = data.claude.channel
if(channel == "114514"){e.reply("请先发送:\n/slack创建→以创建slack频道");return false}
d = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json")).claude.d
token = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json")).claude.token
let ys = fs.readFileSync(dirpath + "/" + `${msg}.txt`,"utf-8")
//console.log(ys)
let body =  `------WebKitFormBoundaryAFymXOzqBWzA5q5R\r\nContent-Disposition: form-data; name=\"content\"\r\n\r\nnull\r\n------WebKitFormBoundaryAFymXOzqBWzA5q5R\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${token}\r\n------WebKitFormBoundaryAFymXOzqBWzA5q5R--\r\n`
  const blocks = [{
"type":"rich_text",
"elements":
[{"type":"rich_text_section",
"elements":
[{"type":"user",
"user_id":"U057DD1UCLF"
},
{"type":"text","text": ys
}]}]}]
const payload = { blocks: blocks, channel: channel};
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

if(c.error){e.reply("当前预设过长",true);return false}
let ts = await c.message.ts
if(history[e.user_id] == undefined||history[e.user_id] == "114514"){
history[e.user_id] = ts
time[e.user_id] = ts
}
let answer;
let ifclose = "open";
async function executeRequest() {
  let answer = await fetch(`https://slack.com/api/conversations.replies?channel=${channel}&ts=${ts}`, {
    "headers": {
      "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryTotJQ9kaNkT7dchz",
      "cookie": `d=${d}`
    },
    "body": `------WebKitFormBoundaryTotJQ9kaNkT7dchz\r\nContent-Disposition: form-data; name=\"content\"\r\n\r\nnull\r\n------WebKitFormBoundaryTotJQ9kaNkT7dchz\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${token}\r\n------WebKitFormBoundaryTotJQ9kaNkT7dchz--\r\n`,
    "method": "POST"
  });
  const result = await answer.json();
  console.log(result);
  if (result.messages[1] && !result.messages[1].text.includes("_Typing…_")) {
    let daan = [segment.at(e.user_id), result.messages[1].text];
    e.reply(daan);
    ifclose = "close";
  }

  // 检查是否达到要求，如果达到则清除定时器
  if (ifclose === "close") {
    clearInterval(intervalId);
  }
}

// 每隔五秒钟执行一次请求
const intervalId = setInterval(executeRequest, 5000);
}}}
async endchat(e){
time[e.user_id] = ""
history[e.user_id] = "114514"
e.reply(`用户:${e.sender.nickname}成功重置对话了`,true)
}
async changename(e){
try{
let msg = e.msg.replace(/\/slack触发/g,"").trim()
if (fs.existsSync(dirpath + "/" + "data.json")){
let data = JSON.parse(fs.readFileSync(dirpath+"/"+"data.json"))
data.claude.botname = msg
fs.writeFileSync(dirpath + "/" + "data.json",JSON.stringify(data),"utf-8")
e.reply(`slack频道claude成功改名为[${msg}]`,true)
}}catch{e.reply("改名失败了",true)}
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
if(content.error){e.reply("创建失败了!");return false}
e.reply("正在将claude应用添加到slack频道中")
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
  "method": "POST",
  "headers": {
    "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryTotJQ9kaNkT7dchz",
    "cookie": `d=${d}`
  },
  "body": `------WebKitFormBoundaryTotJQ9kaNkT7dchz\r\nContent-Disposition: form-data; name=\"content\"\r\n\r\nnull\r\n------WebKitFormBoundaryTotJQ9kaNkT7dchz\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${token}\r\n------WebKitFormBoundaryTotJQ9kaNkT7dchz--\r\n`,
});
b= await b.json()
console.log(b)
}
async help(e){
let msg = e.msg.replace(botname,"").trim()
console.log(msg)
if (fs.existsSync(dirpath + "/" + "data.json")){
let data = JSON.parse(fs.readFileSync(dirpath+"/"+"data.json"))
let channel = data.claude.channel
if(channel == "114514"){e.reply("请先发送:\n/slack创建→以创建slack频道");return false}
d = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json")).claude.d
token = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json")).claude.token
let body =  `------WebKitFormBoundaryAFymXOzqBWzA5q5R\r\nContent-Disposition: form-data; name=\"content\"\r\n\r\nnull\r\n------WebKitFormBoundaryAFymXOzqBWzA5q5R\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${token}\r\n------WebKitFormBoundaryAFymXOzqBWzA5q5R--\r\n`
  const blocks = [{
"type":"rich_text",
"elements":
[{"type":"rich_text_section",
"elements":
[{"type":"user",
"user_id": botid
},
{"type":"text","text": msg
}]}]}]
if(history[e.user_id] == undefined||history[e.user_id] == "114514"){
time[e.user_id] = ""
}
  const payload = { blocks: blocks, channel: channel, "thread_ts": time[e.user_id]};
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
if(history[e.user_id] == undefined||history[e.user_id] == "114514"){
history[e.user_id] = ts
time[e.user_id] = ts
}
let answer
//console.log(history[e.user_id])
let count = 0;
let ifclose = "open"
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
  console.log(result);
  if (result.messages[1] && !result.messages[1].text.includes("_Typing…_")) {
    let daan = [segment.at(e.user_id), result.messages[1].text];
    e.reply(daan);
    ifclose = "close";
  }

  // 检查是否达到要求，如果达到则清除定时器
  if (ifclose === "close") {
    clearInterval(intervalId);
  }
}

// 每隔五秒钟执行一次请求
const intervalId = setInterval(executeRequest, 5000);
}}}


















