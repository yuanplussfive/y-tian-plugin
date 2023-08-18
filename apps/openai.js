import fetch from 'node-fetch'
import fs from 'fs'
let mx = "gpt-3.5-turbo-16k"
let history = []
let apikey = `_h8_w1BPBb8STJbPvOCa7DZ0jfpjRv_SrsW_jnIaFrw`
export class example extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: '',
      /** 功能描述 */
      dsc: '',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 6500,
      rule: [
        {
          reg: "^/nx(.*)",
          fnc: 'help',
          
},{
          reg: "^/逆向gpt模型$|^/切换逆向模型(.*?)$",
          fnc: 'models',
          
},{
          reg: "^/逆向画图(.*)",
          fnc: 'gptht',
          
},{
          reg: "^/逆向gpt结束",
          fnc: 'gpttts',
        }
      ]
    })
  }
async status(e){
let status = await fetch("https://chimeragpt.adventblocks.cc/api/v1/status")
status = await status.json()
let content = await status.endpoints
}
async gpttts(e){
history = []
e.reply("逆向gpt模型已结束对话")
return false
}
async gptht(e){
let msg = e.msg.replace(/\/逆向画图/g,"").trim()
let b = await fetch("https://translate-api-fykz.xiangtatech.com/translation/webs/index", {
  "method": "POST",
  "headers": {
    "accept": "*/*",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
    "content-type": "application/x-www-form-urlencoded",
  },
  "body": `appid=105&sgid=auto&sbid=auto&egid=en&ebid=en&content=${msg}&type=2`
});
b = await b.json()
console.log(b)
let by = await b.by
let a = await fetch("https://chimeragpt.adventblocks.cc/api/v1/images/generations",{
method:"post",
headers:{
"content-type":"application/json",
"Authorization": "Bearer "+ apikey
},
body:JSON.stringify({
  "prompt": by,
  "n": 1,
})
})
a = await a.json()
console.log(a)
let data = await a.data[0].url
data = segment.image(data)
e.reply(data)
}
async models(e){
let model = await fetch("https://chimeragpt.adventblocks.cc/api/v1/models")
model = await model.json()
let data = await model.data
let nickname = Bot.nickname
let userInfo = {
user_id: Bot.uin,
nickname
}
let forwardMsg = [{
...userInfo,
message: "chimeragpt逆向站点模型:"
}]
let list = []
for(var i = 0;i < data.length;i++){
if(data[i].endpoints == '/api/v1/chat/completions'){
let date = "模型名称:"+data[i].id+"\n"
let name = data[i].id
list.push(name)
let limits = "硬性限制:"+data[i].limits+"\n"
let ifopen = data[i].public
if(ifopen == true){
ifopen = "是否可用:可用"
}else{
ifopen = "是否可用:不可用"
}
let ch = [date,limits,ifopen]
let content = {
...userInfo,
message: ch
}
forwardMsg.push(content)
}
}
if(e.msg.includes("/逆向gpt模型")){
console.log(forwardMsg)
if (this.e.isGroup) {
forwardMsg = await this.e.group.makeForwardMsg(forwardMsg)
}else{
forwardMsg = await this.e.friend.makeForwardMsg(forwardMsg)
}
e.reply(forwardMsg)
}else{
let msg = e.msg.replace(/\/切换逆向模型/g,"").trim()
mx = list[msg-1]
console.log(mx)
e.reply(`逆向模型切换成功,现在模型为${mx}`)
}
}
async help(e){
console.log(mx)
let msg = e.msg.replace(/\/nx/g,"").trim()
try{
history.push({"role":"user","content":msg})
let response = await fetch("https://chimeragpt.adventblocks.cc/api/v1/chat/completions",{
method:"post",
headers:{
accept: "application/json",
"Content-Type":"application/json",
"Authorization": "Bearer " + apikey
},
body:JSON.stringify({
model:mx, 
messages:history
})
})
response = await response.json()
console.log(response)
if(response.detail){
if(response.detail.includes('Forbidden:')){
e.reply("涉及性敏感话题,被监管")
return false
}
else if(response.detail.includes('Unhandled Exception:')){
e.reply("逆向站点未反应,请重试或切换模型",true)
return false
}else{e.reply(`访问被限制,请稍后重试\n${response.detail}`,true);return false}}
e.reply(response.choices[0].message.content)
history.push({"role":"user","content":response.choices[0].message.content})
let a = await fetch("https://chimeragpt.adventblocks.cc/api/v1/audio/tts/generation",{
method:"post",
headers:{
"content-type":"application/json",
"Authorization": "Bearer "+ apikey
},
body:JSON.stringify({
"text":response.choices[0].message.content,
"model":"large",
"speaking_rate":"0.8"
})
})
a = await a.json()
e.reply(segment.record(a.url))
}catch{e.reply("与服务器通信失败,502")}
}}






























