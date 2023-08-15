import fetch from 'node-fetch'
import fs from 'fs'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import common from'../../../lib/common/common.js'
import YAML from "yaml"
let uid
let id
let body
let requestid
let isFinished = false
let ifFinished = false
let loraCode = []
let lora = ""
let keylora = ""
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
},{      
          reg: "^/图生图(.*?)$",
          fnc: 'images'
},{      
          reg: "^/头生图(.*?)$",
          fnc: 'comic'
},{      
          reg: "^/搜索lora(.*?)$",
          fnc: 'searchlora'
},{      
          reg: "^/切换lora(.*?)$",
          fnc: 'changelora'
},{      
          reg: "^/阴天画图帮助$",
          fnc: 'drawinghelp'
        }
      ]
    })
  }
async drawinghelp(e){
if (!fs.existsSync(_path + "/data/YTdrawing.html")){
let html = 
`<!DOCTYPE html>
<html>
<head>
  <title>画图功能菜单</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f2f2f2;
    }

    .container {
      margin: 20px auto;
      width: 500px;
      background-color: #fff;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }

    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 20px;
    }

    .branch {
      border: 1px solid #ccc;
      border-radius: 5px;
      padding: 10px;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>阴天免费画图</h1>
    <div class="branch">
      <h2>/画图+内容</h2>
      <p>开始画图了</p>
    </div>
    <div class="branch">
      <h2>/图模型大全</h2>
      <p>查看所有的画图主模型</p>
    </div>
    <div class="branch">
      <h2>/切换图模型+序号</h2>
      <p>切换当前画图的模型</p>
    </div>
    <div class="branch">
      <h2>/搜索lora+内容</h2>
      <p>搜索相关的画图lora</p>
    </div>
    <div class="branch">
      <h2>/切换lora+序号</h2>
      <p>切换相关的画图lora</p>
 </div>
  <div class="branch">
      <h2>/图生图(带上一张图片)+关键词</h2>
      <p>根据你的关键词和图片进行画图</p>
    </div>
<div class="branch">
      <h2>/头生图(艾特一个群友)+关键词</h2>
      <p>根据你的关键词和群友头像进行画图</p>
    </div>
<div class="branch">
      <h2>PS:免费画图需要配置tk,sk,教程请在群里查看</h2>
    </div>
    </div>
  </div>
</body>
</html>`
fs.writeFileSync(_path + "/data/YTdrawing.html",html,"utf-8")
let data = {
              tplFile: _path + "/data/YTdrawing.html",	          
}
let img = await puppeteer.screenshot("777", {
              ...data,
            });
e.reply(img)
}else{
let data = {
              tplFile: _path + "/data/YTdrawing.html",	          
}
let img = await puppeteer.screenshot("777", {
              ...data,
            });
e.reply(img)
}}
async changelora(e){
let msg = e.msg.replace(/\/切换lora/g,"").trim()
if(!loraCode.length == 0){
if(loraCode[msg-1]){
lora = loraCode[msg-1].loracode
keylora = loraCode[msg-1].lorakey
e.reply("切换成功",true)
}else{e.reply("错误的参数，请重新输入",true);return false}
}else{e.reply("你还没搜索呢，我切换个毛!",true)}
}
async searchlora(e){
let msg = e.msg.replace(/\/搜索lora/g,"").trim()
let search = await fetch(`https://rightbrain.art/apis/lora/getLoraModels/v1?auth=public&pageNo=0&pageSize=60&orderType=collection&keyword=${msg}`, {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
    "sec-ch-ua": "\"Not/A)Brand\";v=\"99\", \"Microsoft Edge\";v=\"115\", \"Chromium\";v=\"115\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "cookie": await getcookie(),
    "Referer": "https://rightbrain.art/text2Image",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "body": null,
  "method": "GET"
});
search = await search.json()
let data = await search.data.list
//console.log(data)
let nickname = Bot.nickname
let userInfo = {
user_id: Bot.uin,
nickname
}
let forwardMsg = [{
...userInfo,
message: `lora【${msg}】搜索结果:`
}]
loraCode = []
for(var i = 0; i<data.length;i++){
let loraid = `序号:${i+1}`+"\n"
let loracode = data[i].loraCode
let lorakey = data[i].loraKeyword
loraCode.push({"loracode":loracode,"lorakey":lorakey})
let loraName = "lora名称:"+data[i].loraName+"\n"
let loraBaseName = "基于模型名称:"+data[i].loraBaseName+"\n"
let loraKeyword = "lora关键词:"+data[i].loraKeyword+"\n"
let createUser = "创建者名称:"+data[i].createUser+"\n"
let remark = "画图示例:"+"\n"+"("+data[i].remark+")"
let allin = [loraid,loraName,loraBaseName,loraKeyword,createUser,remark]
let content = {
...userInfo,
message: allin
}
forwardMsg.push(content)
}
if (this.e.isGroup) {
forwardMsg = await this.e.group.makeForwardMsg(forwardMsg)
}else{
forwardMsg = await this.e.friend.makeForwardMsg(forwardMsg)
}
e.reply(forwardMsg)
e.reply("请发送/切换lora+id",true)
}
async comic(e){
let at = e.message.filter(item => item.type == 'at')?.map(item => item?.qq)
if(at.length == 0){
e.reply("请艾特一个对象",true)
return false
}
let img = `http://q.qlogo.cn/headimg_dl?dst_uin=${at}&spec=640&img_type=jpg`
let msg = e.msg.replace(/\/头生图/g,"").trim()
const apiUrl = "https://rightbrain.art/apis/image2Image/create";
const data = {
  model: models,
  relation: true,
  useHd: 1,
  imageNum: 2,
  width: 696,
  height: 696,
  stepNum: steps,
  cfgScale: 7,
  denoisingStrength: 0.45,
  sampler: "DPM++ SDE Karras",
  seed: -1,
  negPrompt: negPrompt,
  loraId: lora,
  loraWeight: 0.8,
  loraKeyword: keylora,
  prompt: msg,
  initImages: [img],
  maskImg: "None"
};
let response = await fetch(apiUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Cookie": await getcookie()
  },
  body: JSON.stringify(data)
})
response = await response.json()
if(response.code == '00000'){
e.reply('当前有图片任务在执行中',true)
return false
}
requestid = await response.data.requestid
e.reply("我正在头生图了，请稍等片刻")
do{
await wait(e)
}while(body == null)
console.log(body)
uid = body.id
do {
await getimages(e);
console.log(uid)
console.log(id)
}while (!uid == id);
}
async images(e){
let img = e.img[0]
let msg = e.msg.replace(/\/图生图/g,"").trim()
const apiUrl = "https://rightbrain.art/apis/image2Image/create";
const data = {
  model: models,
  relation: true,
  useHd: 1,
  imageNum: 2,
  width: 696,
  height: 696,
  stepNum: 20,
  cfgScale: 7,
  denoisingStrength: 0.45,
  sampler: "DPM++ SDE Karras",
  seed: -1,
  negPrompt: negPrompt,
  loraId: "",
  loraWeight: "",
  loraKeyword: "",
  prompt: msg,
  initImages: [img],
  maskImg: "None"
};
let response = await fetch(apiUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "Referer": "https://rightbrain.art/imageToImage",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Cookie": await getcookie(),
    "Sec-Ch-Ua": "\"Not/A)Brand\";v=\"99\", \"Microsoft Edge\";v=\"115\", \"Chromium\";v=\"115\"",
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": "\"Windows\""
  },
  body: JSON.stringify(data)
})
response = await response.json()
if(response.message == '当前有文生图任务在执行中'){
e.reply('当前有文生图任务在执行中',true)
return false
}
requestid = await response.data.requestid
e.reply("我正在图生图了，请稍等片刻")
do{
await wait(e)
}while(body == null)
console.log(body)
uid = body.id
do {
await getimages(e);
console.log(uid)
console.log(id)
}while (!uid == id);
}
async step(e){
let msg = e.msg.replace(/\/切换步数/g,"").trim()
if(msg<=30&&msg>15){
steps = msg
e.reply(`切换成功，现在绘图步数为${steps}`,true)
}else{
e.reply("错误的参数,画图步数范围为15-30",true)
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
"loraId":lora,
"loraWeight":"0.8",
"loraKeyword":keylora,
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
if(a.code == '00000'){
e.reply('当前有图片任务在执行中',true)
return false
}
requestid = await a.data.requestid
let time = await a.data.dealTime
let timewait = await a.data.timeWait
e.reply(`我正在画了,请稍等片刻,大概需要${time}s ~ ${timewait}s`,true)
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
async function getimages(e) {
let history = await fetch("https://rightbrain.art/apis/user/getHistoryImages?type=image2Image,textSuperResolution,textUpResolution&pageNo=0&pageSize=1", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "cookie": await getcookie(),
    "Referer": "https://rightbrain.art/image2Image",
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














