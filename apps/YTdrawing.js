import fetch from 'node-fetch'
import fs from 'fs'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import common from '../../../lib/common/common.js'
import YAML from "yaml"
let uid
let id
let body
let requestid
let isFinished = false
let ifFinished = false
let negPrompt = "(worst quality, low quality:1.4), bad anatomy, watermarks, text, signature, blur,messy, low quality, sketch by bad-artist, (semi-realistic,  sketch, cartoon, drawing, anime:1.4), cropped, out of frame, worst quality, low quality, jpeg artifacts"
let models = "ad23ccaf-0f6b-4971-8034-cfabf0673024"
let steps = 20
const _path = process.cwd();
export class example extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: '阴天[免费画图]',
      /** 功能描述 */
      dsc: '简单开发示例',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 4400,
      rule: [
        {
          reg: "^/画图(.*?)$",
          fnc: 'help'
},{
          reg: "^/图模型大全$|^/切换图模型(.*?)$",
          fnc: 'models'
},{      
          reg: "^/切换步数(.*?)$",
          fnc: 'step'
        }
      ]
    })
  }
async step(e){
let msg = e.msg.replace(/\/切换步数/g,"").trim()
if(msg<=30&&msg>0){
steps = msg
e.reply(`切换成功，现在绘图步数为${steps}`,true)
}else{
e.reply("错误的参数",true)
}
}
async models(e){
let model = await fetch("https://rightbrain.art/apis/model/getBaseModels", {
 "method": "GET",
  "headers": {
    "accept": "application/json, text/plain, */*",
    "cookie": await getcookie(),
    "Referer": "https://rightbrain.art/text2Image"
  }
});
model = await model.json()
let data = await model.data
let nickname = Bot.nickname
if(e.msg.includes("/图模型大全")){
let userInfo = {
user_id: Bot.uin,
nickname
}
let forwardMsg = [{
...userInfo,
message:"画图模型大全:"
}]
for(var i = 0;i < data.length;i++){
let id = data[i].code
let name = "序号:" + `${i+1}` + "\n" + "模型名称:" + data[i].name
let np = "\n" + "负面效果:" + data[i].negPrompt + "\n"
let remarks = "画图示例:" + data[i].remark
let msg = [name,np,remarks,remarks]
let c = {
...userInfo,
message:msg
}
forwardMsg.push(c)
}
if (this.e.isGroup) {
forwardMsg = await this.e.group.makeForwardMsg(forwardMsg)
}else{
forwardMsg = await this.e.friend.makeForwardMsg(forwardMsg)
}
e.reply(forwardMsg)
}else if(e.msg.includes("/切换图模型")){
let msg = e.msg.replace(/\/切换图模型/g,"").trim()
models = data[msg-1].code
negPrompt = data[msg-1].negPrompt
console.log(models)
e.reply("切换成功",true)
}}
async help(e){
isFinished = false
ifFinished = false
console.log(models)
let msg = e.msg.replace(/\/画图/g,"").trim()
let data = {
"model": models,
"relation":true,
"imageRatio":"1:1",
"width": 516,
"height": 516,
"useHd":1,
"imageNum":2,
"stepNum": steps,
"cfgScale":7,
"sampler":"DPM++ SDE Karras",
"seed":-1,
"negPrompt": negPrompt,
"loraId":"",
"loraWeight":"",
"loraKeyword":"",
"prompt": msg
}
let a = await fetch("https://rightbrain.art/apis/text2image/create", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    
    "content-type": "application/json",
    "cookie": await getcookie(),
    "Referer": "https://rightbrain.art/text2Image",
  },
  "body": JSON.stringify(data),
  "method": "POST"
});
a = await a.json()
console.log(a)
if(a.message == '当前有文生图任务在执行中'){
e.reply('当前有文生图任务在执行中',true)
return false
}
e.reply("我正在画了，请稍等片刻")
requestid = await a.data.requestid
//console.log(requestid)
do{
await wait(e)
}while(body == null)
console.log(body)
uid = body.id
do {
await doSomething(e);
console.log(uid)
console.log(id)
} while (!uid == id);
}
}
async function doSomething(e) {
let history = await fetch("https://rightbrain.art/apis/user/getHistoryImages?type=text2Image,textSuperResolution,textUpResolution&pageNo=0&pageSize=1", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "cookie": await getcookie(),
    "Referer": "https://rightbrain.art/text2Image",
  },
  "method": "GET"
});
history = await history.json()
//console.log(history)
id = await history.data.list[0].id
if(uid == id){
let image = await history.data.list[0].image
let picture = image.match(/https:(.*?).png/g)
let pick = segment.image(picture[1])
let change = segment.image(picture[0])
let answer = [change,pick]
isFinished = true; // 设置任务完成标志为 true
await e.reply(answer,true)

}}
async function wait(e){
let b = await
fetch(`https://rightbrain.art/apis/text2image/getImage?requestid=${requestid}`, {
method:"get",
  "headers": {
    "accept": "application/json, text/plain, */*",
    "cookie": await getcookie(),
    "Referer": "https://rightbrain.art/text2Image",
}
})
b = await b.json()
body = await b.data.data
}
async function getcookie(){
let file = _path + "/plugins/y-tian-plugin/config/drawing.yaml"
let data = YAML.parse(fs.readFileSync(file, 'utf8'))
let cookie = data.cookie
return cookie;
}
















