let slackhistory = {}
let time = {}
let prompt = {}
const _path = process.cwd()
import common from "../../../lib/common/common.js"
import fs from "fs"
import fetch from "node-fetch"
let dirpath = _path + '/data/YTclaude1.3'
if (!fs.existsSync(dirpath)) {
fs.mkdirSync(dirpath)
}
if (!fs.existsSync(dirpath + "/" + "data.json")) {
fs.writeFileSync(dirpath + "/" + "data.json", JSON.stringify({
    "claude": {
      "token": "xoxc-xxxxx",
      "d": "xoxd-xxxxx",
      "channel": "",
      "botid": ""
    }
  }))
}
export class example extends plugin {
  constructor() {
    super({
      name: '阴天[claude1.3]',
      dsc: '',
      event: 'message',
      priority: 1000,
      rule: [
        {
          reg: "^/slack(.*)",
          fnc: 'chat'
       },{
          reg: "^(/|#)?结束slack对话$",
          fnc: 'ends'
       },{
          reg: "^/查看slack预设|^/切换slack预设(.*?)$",
          fnc: 'slackprompts'
       },{
          reg: "^(/|#)?创建slack频道$",
          fnc: 'slackform'
       }
      ]
    })
  }
async slackform(e){
if(!e.isMaster){e.reply("你无权创建",true);return false}
if (fs.existsSync(dirpath + "/" + "data.json")){
let data = JSON.parse(fs.readFileSync(dirpath+"/"+"data.json"))
let token = data.claude.token
let d = data.claude.d
let botid = data.claude.botid
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
if(infor.error){e.reply("你已经创建过频道了.",true);return false}
data.claude.channel = await infor.channel.id
fs.writeFileSync(dirpath + "/" + "data.json",JSON.stringify(data),"utf-8")
let content = await fetch(`https://slack.com/api/conversations.invite?channel=${infor.channel.id}&users=${botid}&pretty=1`, {
  "headers": {
    "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryfEj5VJT61Hk62UNo",
   "cookie": `d=${d}`
  },
  "body": `------WebKitFormBoundaryfEj5VJT61Hk62UNo\r\nContent-Disposition: form-data; name=\"content\"\r\n\r\nnull\r\n------WebKitFormBoundaryfEj5VJT61Hk62UNo\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${token}\r\n------WebKitFormBoundaryfEj5VJT61Hk62UNo--\r\n`,
  "method": "POST"
});
content = await content.json()
console.log(content)
if(content.error){e.reply(`创建失败了,请检查${dirpath}/data.json是否填写完整参数!`);return false}
e.reply("正在将claude应用添加到slack频道中")
await common.sleep(1400)
e.reply("创建成功!")
}
}
async slackprompts(e){
let dirname = fs.readdirSync(`${_path}/data/阴天预设`,"utf-8")
if(e.msg.includes("/查看slack预设")){
let nickname = Bot.nickname
let userInfo = {
user_id: Bot.uin,
nickname
}
let forwardMsg = [{
...userInfo,
message:"godgpt预设大全:"
}]
for(var a = 0;a < dirname.length;a++){
let name = `${dirname[a]}`
name = name.replace(/.txt/g,"")
let fileSize;
let weight = fs.readFileSync(`${_path}/data/阴天预设/${dirname[a]}`,"utf-8")
weight = weight.slice(0,100)
let sg = `序号:${a+1}\n名称:${name}\n内容简述:${weight}...`
let c = {
...userInfo,
message: sg
}
forwardMsg.push(c)
}
if (this.e.isGroup) {
forwardMsg = await this.e.group.makeForwardMsg(forwardMsg)
}else{
forwardMsg = await this.e.friend.makeForwardMsg(forwardMsg)
}
e.reply(forwardMsg)
}else if(e.msg.includes("/切换slack预设")){
let msg = e.msg.replace(/[^0-9]/g,"");
//console.log(dirname[1])
if(dirname[msg-1]){
let prompts = fs.readFileSync(`${_path}/data/阴天预设/${dirname[msg-1]}`,"utf-8")
if(prompt[e.user_id] == undefined){
prompt[e.user_id] = prompts
}
e.reply("成功切换slack预设")
}else{e.reply("输入序号错误!");return false}
}
}
async ends(e){
time[e.user_id] = ""
slackhistory[e.user_id] = undefined
prompt[e.user_id] = undefined
e.reply(`用户:${e.sender.nickname}成功重置slack对话`,true)
}
async chat(e){
let cookie = await getcookie()
//console.log(cookie)
let msg = e.msg.replace(/\/slack/g,"")
.replace(/#slack/g,"")
.trim()
if(prompt[e.user_id] !== undefined){
msg = prompt[e.user_id] + "\n" + msg
prompt[e.user_id] == undefined
}
console.log(msg)
let botid = await cookie[3]
let channel = await cookie[2]
let d = await cookie[1]
let token = await cookie[0]
await claude(msg,botid,channel,d,token,e)
}}
async function claude(msg,botid,channel,d,token,e){
let body =  `------WebKitFormBoundaryAFymXOzqBWzA5q5R\r\nContent-Disposition: form-data; name=\"content\"\r\n\r\nnull\r\n------WebKitFormBoundaryAFymXOzqBWzA5q5R\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${token}\r\n------WebKitFormBoundaryAFymXOzqBWzA5q5R--\r\n`
const blocks = [{
"type":"rich_text",
"elements":[{
"type":"rich_text_section",
"elements":[{
"type":"user",
"user_id": botid
},{
"type":"text",
"text": msg
}]}]}]
if(slackhistory[e.user_id] == undefined){
time[e.user_id] = ""
}
const payload = { 
blocks: blocks, 
channel: channel, 
"thread_ts": time[e.user_id]
};
const data = JSON.stringify(payload);
const url = 'https://slack.com/api/chat.postMessage';
const header = {
"Content-Type": "application/json; charset=utf-8",
"Authorization": "Bearer " + token,
"cookie": `d=${d}`
};
let c = await fetch(url, {
method: 'POST',
headers: header,
body: data
})
c = await c.json()
console.log(c)
if(c.error == 'invalid_auth'){
e.reply("slack身份验证失败,请确认相关值填写的正确性!")
return false
}
let ts = await c.message.ts
if(slackhistory[e.user_id] == undefined||slackhistory[e.user_id] == "114514"){
slackhistory[e.user_id] = ts
time[e.user_id] = ts
}
let answer
let count = 0;
let ifclose = "open"
let typingCount = 0; // 计数器，记录"Typing..."的次数
let hasReplied = false;
async function executeRequest() {
  let answer = await fetch(`https://slack.com/api/conversations.replies?channel=${channel}&ts=${slackhistory[e.user_id]}&pretty=1&oldest=${ts}`,{
"headers": {
"content-type": "multipart/form-data; boundary=----WebKitFormBoundaryTotJQ9kaNkT7dchz",
"cookie": `d=${d}`
},
"body": `------WebKitFormBoundaryTotJQ9kaNkT7dchz\r\nContent-Disposition: form-data; name=\"content\"\r\n\r\nnull\r\n------WebKitFormBoundaryTotJQ9kaNkT7dchz\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${token}\r\n------WebKitFormBoundaryTotJQ9kaNkT7dchz--\r\n`,
"method": "POST"
});
const result = await answer.json();
console.log(result);
if(result.error == 'invalid_auth'){
e.reply("身份验证失败,请确认相关值填写的正确性!")
return false
}
if (count === 15) {
e.reply("slack通讯失败,请尝试重新对话!")
clearInterval(intervalId)
return true
}
if (result.error) {
    count ++
    console.log(`slack通信速率被限制,正在尝试绕过! 次数:${count}`, true);
    await common.sleep(4000);
    return; // 如果出现错误，则等待一段时间后直接返回，不执行下面的逻辑(就是你的这个工作区被限制频率了)
  }
  if (result.messages[1]) {
    if (!hasReplied&&result.messages[1].text === "_Typing…_") {
      typingCount++;
    } else if (!hasReplied&&!result.messages[1].text.includes("_Typing…_")) {
      let hd = "\n" + result.messages[1].text
      hd = hd.replace(/Sidekick/g,"gpt-4")
      hd = hd.replace(/&lt;/g, '<');
      hd = hd.replace(/&gt;/g, '>');
      hd = hd.replace(/&amp;/g, '&');
      hd = hd.replace(/&quot;/g, '"');
      hd = hd.replace(/&apos;/g, "'");
      e.reply(hd,true);
      clearInterval(intervalId); // 有回复消息，停止定时请求
      hasReplied = true;
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
async function getcookie(){
let dir = JSON.parse(fs.readFileSync(dirpath+"/"+"data.json"))
let token = dir.claude.token
let d = dir.claude.d
let botid = dir.claude.botid
let channel = dir.claude.channel
return [token,d,channel,botid]
}

































