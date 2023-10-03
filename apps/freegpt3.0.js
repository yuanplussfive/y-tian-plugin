import fetch from "node-fetch"
import common from "../../../lib/common/common.js"
import fs from "fs"
const _path = process.cwd()
let modelId = "anything-v4"
let loraModel = "full-body"
let model = ""
let dirpath = _path + '/data/YTchatgpt-free'
if(!fs.existsSync(dirpath)){
fs.mkdirSync(dirpath)    
}
if (!fs.existsSync(dirpath + "/" + "data.json")){
fs.writeFileSync(dirpath+ "/" + "data.json",JSON.stringify({
"freegpt":{
"token": [],
}}))
}
export class example extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: '阴天[模型]',
      /** 功能描述 */
      dsc: '',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: -10,
      rule: [
        {
          reg: "^#freegpt(.*)",
          fnc: 'chatgpt'
       },{
          reg: "^#查询余额",
          fnc: 'vet'
       },{
          reg: "^#查看lora|^#切换lora(.*?)",
          fnc: 'changelora'
       },{
          reg: "^#查看画图模型|^#切换画图模型(.*?)",
          fnc: 'drawing'
       },{
          reg: "^#gpt绘图(.*)",
          fnc: 'painting'
       },{
          reg: "^#填写freeToken(.*)",
          fnc: 'addtoken'
       },{
          reg: "^#切换免费模型(.*)",
          fnc: 'changemodel'
       },{
          reg: "^#查看免费模型",
          fnc: 'freemodel'
        }
      ]
    })
  }
async freemodel(e){
let models = "1:gpt-3.5-turbo\n2:gpt-3.5-turbo-16k\n3:qwen\n4:qwen-plus\n5:xinghuo-plus\n#请输入切换免费模型+序号"
e.reply(models)
}
async changemodel(e){
if(!e.isMaster){return false}
let msg = e.msg.replace(/#切换免费模型/g,"").trim()
let node =
{
  "1": "gpt-3.5-turbo",
  "2": "gpt-3.5-turbo-16k",
  "3": "qwen",
  "4": "qwen-plus",
  "5": "xinghuo-plus"
}
if(node[msg] == undefined){
e.reply("输入的序号有误")
return false
}
model = node[msg]
e.reply(`成功切换当前模型为${model}`)
}
async addtoken(e){
if(!e.isMaster){return false}
let msg = e.msg.replace(/#填写freeToken/g,"").trim()
let data = JSON.parse(fs.readFileSync(dirpath+"/"+"data.json","utf-8"))
try{
let content = await fetch("https://wellmaxwang.com/chat", {
  "headers": {
    "accept": "text/event-stream",
    "content-type": "application/json",
    "jwt": msg,
    "Referer": "https://wellmaxwang.com/"
  },
  "body": JSON.stringify({
"message": "hello",
"contexts":[],
"temperature":1,
"topP":1,
"model":"",
"requestId":"8986daaf-304d-41c8-a3da-e2a7f84c5947"
}),
  "method": "POST"
});
let response = await content.text()
console.log(response)
if(response == ""){
e.reply("验证失败，请检验token真实性!")
return false
}
data.freegpt.token.push(msg)
fs.writeFileSync(dirpath+"/"+"data.json",JSON.stringify(data),"utf-8")
e.reply("检验成功!")
}catch{e.reply("与服务器通讯失败,请重试!")}
}
async painting(e){
let data = JSON.parse(fs.readFileSync(dirpath+"/"+"data.json","utf-8")).freegpt.token[0]
console.log(data)
if(data == undefined){
e.reply("你还没有任何token")
return false
}
let prompt = e.msg.replace(/#gpt绘图/g,"").trim()
let body = 
{
  prompt: ` <lora:${loraModel}:1> ${prompt}`,
  negativePrompt: "",
  modelId: modelId,
  samples: 1,
  width: 1024,
  height: 1024,
  seed: 25869,
  numInferenceSteps: 50,
  guidanceScale: 15,
  loraModel: loraModel,
  scheduler: "KDPM2AncestralDiscreteScheduler",
  multiLingual: "no",
  initImage: "",
  safetyChecker: "no"
}
let painting = await fetch("https://wellmaxwang.com/draw/sdDreamboothv4", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
    "content-type": "application/json",
    "jwt": data,
    "sec-ch-ua": "\"Microsoft Edge\";v=\"117\", \"Not;A=Brand\";v=\"8\", \"Chromium\";v=\"117\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "Referer": "https://wellmaxwang.com/",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "body": JSON.stringify(body),
  "method": "POST"
});
let response = await painting.json()
console.log(response)
if(response.code !== 200){
e.reply(response.msg)
return false
}
let output = await response.data.output[0]
e.reply(segment.image(output))
}
async drawing(e){
let data = JSON.parse(fs.readFileSync(dirpath+"/"+"data.json","utf-8")).freegpt.token[0]
console.log(data)
if(data == undefined){
e.reply("你还没有任何token")
return false
}
let model = await fetch("https://wellmaxwang.com/draw/sd/model/list?number=1&size=1000&modelId=&name=&modelType=Stable+Diffusion", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "jwt": data,
    "Referer": "https://wellmaxwang.com/"
  },
  "method": "POST"
});
let response = await model.json()
console.log(response)
response = response.data.data
if(e.msg.includes("#查看画图模型")){
let nickname = Bot.nickname
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
message: "基础绘图模型大全"
}]

for(var i = 0; i < 66; i++){
const id = response[i].id;
const name = response[i].name;
const img = response[i].img;
const modelId = response[i].modelId;
const modelType = response[i].modelType;
const generateImagesCount = response[i].generateImagesCount;
const prompt = response[i].prompt;
const score = response[i].score;
const introduce = response[i].introduce;
const sort = response[i].sort;
let summary = [`ID：${id}\n名称：${name}\n`+`图片示例：${img}`,`\n模型ID：${modelId}\n模型类型：${modelType}\n生成图片数量：${generateImagesCount}\n提示：${prompt}\n评分：${score}\n介绍：${introduce}`]
let shu = {
...userInfo,
message: summary
}
forwardMsg.push(shu)
}
if (this.e.isGroup) {
forwardMsg = await this.e.group.makeForwardMsg(forwardMsg)
}else{
forwardMsg = await this.e.friend.makeForwardMsg(forwardMsg)
}
e.reply(forwardMsg)
}else if(e.msg.includes("#切换画图模型")){
let msg = e.msg.replace(/#切换画图模型/g,"")
modelId = response[msg-1].name
e.reply("画图模型已切换为"+modelId)
}
}
async changelora(e){
let data = JSON.parse(fs.readFileSync(dirpath+"/"+"data.json","utf-8")).freegpt.token[0]
console.log(data)
if(data == undefined){
e.reply("你还没有任何token")
return false
}
let model = await fetch("https://wellmaxwang.com/draw/sd/model/list?number=1&size=1000&modelId=&name=&modelType=Lora", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "jwt": data,
    "Referer": "https://wellmaxwang.com/"
  },
  "method": "POST"
});
let response = await model.json()
console.log(response)
response = response.data.data
if(e.msg.includes("#查看lora")){
let nickname = Bot.nickname
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
message: "lora大全"
}]

for(var i = 0; i < response.length; i++){
const id = response[i].id;
const name = response[i].name;
const img = response[i].img;
const modelId = response[i].modelId;
const modelType = response[i].modelType;
const generateImagesCount = response[i].generateImagesCount;
const prompt = response[i].prompt;
const score = response[i].score;
const introduce = response[i].introduce;
const sort = response[i].sort;
let summary = [`ID：${id}\n名称：${name}\n`+"图片示例：",segment.image(img),`\n模型ID：${modelId}\n模型类型：${modelType}\n生成图片数量：${generateImagesCount}\n提示：${prompt}\n评分：${score}\n介绍：${introduce}`]
let shu = {
...userInfo,
message: summary
}
forwardMsg.push(shu)
}
if (this.e.isGroup) {
forwardMsg = await this.e.group.makeForwardMsg(forwardMsg)
}else{
forwardMsg = await this.e.friend.makeForwardMsg(forwardMsg)
}
e.reply(forwardMsg)
}else if(e.msg.includes("#切换lora")){
let msg = e.msg.replace(/#切换lora/g,"")
loraModel = response[msg-1].name
e.reply("画图模型已切换为"+loraModel)
}
}
async vet(e){
if(!e.isMaster){
e.reply("只有主人可以查询")
return false
}
let data = JSON.parse(fs.readFileSync(dirpath+"/"+"data.json","utf-8")).freegpt.token[0]
console.log(data)
if(data == undefined){
e.reply("你还没有任何token")
return false
}
let check = await fetch("https://wellmaxwang.com/user/getUserDetail", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "jwt": data,
    "Referer": "https://wellmaxwang.com/"
  },
  "method": "GET"
});
let response = await check.json()
const id = response.data.id;
const email = response.data.email;
const createTime = response.data.createTime;
const totalDrawFreeToken = response.data.totalDrawFreeToken;
const totalOrderToken = response.data.totalOrderToken;
const drawFreeToken = response.data.drawFreeToken;
const totalFreeToken = response.data.totalFreeToken;
const freeToken = response.data.freeToken;
const orderToken = response.data.orderToken;
const tokenUses = response.data.tokenUses;
const summary = `用户ID：${id}\n邮箱地址：${email}\n创建时间：${createTime}\n总共可提取的免费代币数量：${totalDrawFreeToken}\n总共的订单代币数量：${totalOrderToken}\n当前可提取的免费代币数量：${drawFreeToken}\n总共的免费代币数量：${totalFreeToken}\n当前的免费代币数量：${freeToken}`;
e.reply(summary)
}

async chatgpt(e){
let msg = e.msg.replace(/#freegpt/g,"").trim()
let data = JSON.parse(fs.readFileSync(dirpath+"/"+"data.json","utf-8")).freegpt.token[0]
console.log(data)
if(data == undefined){
e.reply("你还没有任何token")
return false
}
let content = await fetch("https://wellmaxwang.com/chat", {
  "headers": {
    "accept": "text/event-stream",
    "content-type": "application/json",
    "jwt": data,
    "Referer": "https://wellmaxwang.com/"
  },
  "body": JSON.stringify({
"message": msg,
"contexts":[],
"temperature":1,
"topP":1,
"model":"",
"requestId":"8986daaf-304d-41c8-a3da-e2a7f84c5947"
}),
  "method": "POST"
});
let response = await content.text()
console.log(response)
let answer = response.match(/data:{(.*?)}/g)
const jsonData = answer.map(item => JSON.parse(item.replace('data:', '')));
console.log(jsonData);
let hd = ""
for(var i = 0;i < jsonData.length;i++){
if(jsonData[i].content){
hd += jsonData[i].content
}
}
e.reply(hd)
}
}



















