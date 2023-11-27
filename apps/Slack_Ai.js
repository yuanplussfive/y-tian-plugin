let slackhistory = {}
let time = {}
let prompt = {}
let user_channel = {}
let user_botid = {}
let user_d = {}
let user_token = {}
const _path = process.cwd()
import common from "../../../lib/common/common.js"
import fs from "fs"
import fetch from "node-fetch"
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
export class slack extends plugin {
  constructor() {
    super({
      name: '阴天[slack-ai]',
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
          reg: "^(/|#)创建slack频道$",
          fnc: 'slackform'
       },{
          reg: "^(/|#)填写slack密钥(.*)",
          fnc: 'slackkey'
       },{
          reg: "^(/|#)查看slack负载",
          fnc: 'slackround'
       }
      ]
    })
  }
async slackround(e){
let context =  JSON.parse(fs.readFileSync(dirpath+"/"+"data.json"))
let workspace = context.slack.key
console.log(workspace)
let num = 0
for(var a = 0;a < workspace.length;a++){
let channel = workspace[a].channel.length
num += channel
}
e.reply(`当前共有${workspace.length}个工作区,${num}个频道`)
}
async slackkey(e){
let str = e.msg.replace(/\/填写slack密钥/g,"")
.replace(/#填写slack密钥/g,"")
.trim()
const tokenRegex = /token:(\S+)/;
const botIdRegex = /bot_id:(\S+)/;
const dRegex = /d:(\S+)/;
const tokenMatch = str.match(tokenRegex);
const botIdMatch = str.match(botIdRegex);
const dMatch = str.match(dRegex);
const token = tokenMatch ? tokenMatch[1] : null;
const botid = botIdMatch ? botIdMatch[1] : null;
const d = dMatch ? dMatch[1] : null;
let data = JSON.parse(fs.readFileSync(dirpath+"/"+"data.json")).slack.key
let hasValue = data.some(obj => obj.token === token);
if (hasValue) {
e.reply("已存在当前工作区")
return false
}
console.log({ token, botid, d });
if (token === null || botid === null || d === null) {
e.reply('当前输入值存在错误,无法填写!');
} else {
let context =  JSON.parse(fs.readFileSync(dirpath+"/"+"data.json"))
console.log(context)
let channel = []
context.slack.key.push({ token, botid, d,channel })
fs.writeFileSync(dirpath+"/data.json",JSON.stringify(context),"utf-8")
}
}

async slackform(e){
let data = JSON.parse(fs.readFileSync(dirpath+"/"+"data.json")).slack.key
const randomObject = await getRandomObjectFromArray(data);
console.log(randomObject);
let token = randomObject.token
let d = randomObject.d
let botid = randomObject.botid
var randomNumber = Math.floor(Math.random() * 90000) + 10000;
let channel = await createchannel(randomNumber,token,d,botid,e)
if(channel !== undefined){
let information = JSON.parse(fs.readFileSync(dirpath+"/"+"data.json"))
information.slack.key[0].channel.push(channel)
fs.writeFileSync(dirpath+"/data.json",JSON.stringify(information),"utf-8")
e.reply("已成功创建一个slack频道")
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
console.log(cookie)
if(cookie[0] == undefined || cookie[1] == undefined || cookie[3] == undefined){
e.reply("请先填写slack密钥")
return false
}
if(cookie[2] == undefined){
e.reply("请先创建slack频道")
return false
}
let botid = await cookie[3]
let channel = await cookie[2]
console.log(channel)
channel = channel[Math.round(Math.random()*channel.length-1)]  
console.log(channel)
let d = await cookie[1]
let token = await cookie[0]
console.log(channel)
await claude(msg,botid,channel,d,token,e)
}}
async function claude(msg,botid,channel,d,token,e){
let body =  `------WebKitFormBoundaryAFymXOzqBWzA5q5R\r\nContent-Disposition: form-data; name=\"content\"\r\n\r\nnull\r\n------WebKitFormBoundaryAFymXOzqBWzA5q5R\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${token}\r\n------WebKitFormBoundaryAFymXOzqBWzA5q5R--\r\n`
if(slackhistory[e.user_id] == undefined){
time[e.user_id] = ""
}
if(user_channel[e.user_id] == undefined){
user_channel[e.user_id] = channel
}
if(user_d[e.user_id] == undefined){
user_d[e.user_id] = d
}
if(user_botid[e.user_id] == undefined){
user_botid[e.user_id] = botid
}
if(user_token[e.user_id] == undefined){
user_token[e.user_id] = token
}
const blocks = [{
"type":"rich_text",
"elements":[{
"type":"rich_text_section",
"elements":[{
"type":"user",
"user_id": user_botid[e.user_id]
},{
"type":"text",
"text": msg
}]}]}]
const payload = { 
blocks: blocks, 
channel: user_channel[e.user_id], 
"thread_ts": time[e.user_id]
};
const data = JSON.stringify(payload);
const url = 'https://slack.com/api/chat.postMessage';
const header = {
"Content-Type": "application/json; charset=utf-8",
"Authorization": "Bearer " + user_token[e.user_id],
"cookie": `d=${user_d[e.user_id]}`
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
  let answer = await fetch(`https://slack.com/api/conversations.replies?channel=${user_channel[e.user_id]}&ts=${slackhistory[e.user_id]}&pretty=1&oldest=${ts}`,{
"headers": {
"content-type": "multipart/form-data; boundary=----WebKitFormBoundaryTotJQ9kaNkT7dchz",
"cookie": `d=${user_d[e.user_id]}`
},
"body": `------WebKitFormBoundaryTotJQ9kaNkT7dchz\r\nContent-Disposition: form-data; name=\"content\"\r\n\r\nnull\r\n------WebKitFormBoundaryTotJQ9kaNkT7dchz\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${user_token[e.user_id]}\r\n------WebKitFormBoundaryTotJQ9kaNkT7dchz--\r\n`,
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
      let hd = result.messages[1].text
      hd = hd.replace(/&lt;/g, '<');
      hd = hd.replace(/&gt;/g, '>');
      hd = hd.replace(/&amp;/g, '&');
      hd = hd.replace(/&quot;/g, '"');
      hd = hd.replace(/&apos;/g, "'");
      e.reply(hd);
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
let data = JSON.parse(fs.readFileSync(dirpath+"/"+"data.json")).slack.key
const randomItem = data.filter(item => item.channel.length > 0)[Math.floor(Math.random() * data.filter(item => item.channel.length > 0).length)];
console.log(randomItem);
let token = randomItem.token
let d = randomItem.d
let botid = randomItem.botid
let channel = randomItem.channel
return [token,d,channel,botid]
}
async function getRandomObjectFromArray(array) {
  if (!Array.isArray(array) || array.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}
async function createchannel(randomNumber,token,d,botid,e){
let channel
e.reply("正在将claude应用添加到slack频道中")
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
if(infor.error){
channel = undefined
}
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
if(content.error){
channel = undefined
}
if(infor.channel){
channel = await infor.channel.id
}
return channel
}



































