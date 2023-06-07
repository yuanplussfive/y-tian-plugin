import plugin from '../../../lib/plugins/plugin.js'
import cfg from '../../../lib/config/config.js'
import {createRequire} from "module";
const require = createRequire(import.meta.url);
import fetch from 'node-fetch'
import fs from "fs"
const _path = process.cwd();
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
let apikey;
let model;
let type;
let CD = {};
let htnum
let history = []
let botname = "#gptx"
let GetCD = true; //是否开启回答CD,默认开启
let CDTime = 120000;//CD,单位毫秒
let dirpath = _path + '/resources/gpt key'
let dirpath2 = _path + '/resources/gpt name'
if(!fs.existsSync(dirpath)){
fs.mkdirSync(dirpath)    
}
if(!fs.existsSync(dirpath2)){
fs.mkdirSync(dirpath2)    
}
if(fs.existsSync(dirpath2 +"/"+"data.json")){
let js = JSON.parse(fs.readFileSync(dirpath2 +"/"+"data.json"))
botname = js.gptx.botname
}
let res=await fetch('\x68\x74\x74\x70\x73\x3a\x2f\x2f\x73\x68\x6f\x75\x71\x75\x61\x6e\x2d\x31\x33\x31\x35\x35\x34\x34\x35\x36\x32\x2e\x63\x6f\x73\x2e\x61\x70\x2d\x6e\x61\x6e\x6a\x69\x6e\x67\x2e\x6d\x79\x71\x63\x6c\x6f\x75\x64\x2e\x63\x6f\x6d\x2f\x73\x71\x71\x71\x2e\x6a\x73\x6f\x6e')res=await res['\x6a\x73\x6f\x6e']()if(JSON['\x73\x74\x72\x69\x6e\x67\x69\x66\x79'](res['\x71\x71'])['\x69\x6e\x64\x65\x78\x4f\x66'](JSON['\x73\x74\x72\x69\x6e\x67\x69\x66\x79'](cfg['\x6d\x61\x73\x74\x65\x72\x51\x51'][0]))==-1){apikey="\x31\x31\x34\x35\x31\x34"}else{let kkk=await res['\x67\x70\x74\x78'] apikey=kkk[window["\x4d\x61\x74\x68"]['\x66\x6c\x6f\x6f\x72']((window["\x4d\x61\x74\x68"]['\x72\x61\x6e\x64\x6f\x6d']()*kkk['\x6c\x65\x6e\x67\x74\x68']))]}
export class example extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: 'poe-ai等',
      /** 功能描述 */
      dsc: 'gptxx',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 1500,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#(gpt模型|模型)?(大全|总览)$',
          /** 执行方法 */
          fnc: 'modelhp'
         },{
          /** 命令正则匹配 */
          reg: '^#gpt切换模型(.*)$',
          /** 执行方法 */
          fnc: 'changemodel'
         },{
          /** 命令正则匹配 */
          reg: '^#填写gptkey$',
          /** 执行方法 */
          fnc: 'gptkey'
         },{
          /** 命令正则匹配 */
          reg: '^#gpt对话方式(.*)$',
          /** 执行方法 */
          fnc: 'gptfs'
         },{
          /** 命令正则匹配 */
          reg: '^#gpt对话结束$|^#gpt结束全部对话$',
          /** 执行方法 */
          fnc: 'jsdh'
         },{
          /** 命令正则匹配 */
          reg: '^#生成剧本(.*)$',
          /** 执行方法 */
          fnc: 'jbsc'
         },{
          /** 命令正则匹配 */
          reg: '^#更改剧本种类(.*)$|#剧本种类$',
          /** 执行方法 */
          fnc: 'jblx'
         },{
          /** 命令正则匹配 */
          reg: '^#藏头诗五言(.*)$|^#藏头诗七言(.*)$|^#藏尾诗五言(.*?)$|^#藏尾诗七言(.*?)$',
          /** 执行方法 */
          fnc: 'cts'
         },{
          /** 命令正则匹配 */
          reg: '^#gpt切换预设(.*)$|^#gpt预设大全(.*)$|^#gpt查看预设(.*)$|^#gpt删除预设(.*)$',
          /** 执行方法 */
          fnc: 'gptys'
         },{
          /** 命令正则匹配 */
          reg: `^${botname}([\s\S]*)|#gpt新增预设([\s\S]*)$`,
          /** 执行方法 */
          fnc: 'gptx'
         },{
          /** 命令正则匹配 */
          reg: '^#gpt改名(.*?)$',
          /** 执行方法 */
          fnc: 'gptgm'
         },{
          /** 命令正则匹配 */
          reg: '^#gpt绘图(.*?)$',
          /** 执行方法 */
          fnc: 'gptht'
        },{
          /** 命令正则匹配 */
          reg: '^#gpt设置绘图张数(.*?)$',
          /** 执行方法 */
          fnc: 'gpthtzs'
        },{
          /** 命令正则匹配 */
          reg: '^#gpt?(打印|查看)?(记录|历史)$',
          /** 执行方法 */
          fnc: 'gptjl'
        },{
          /** 命令正则匹配 */
          reg: '^#设置用户框颜色(.*)$|^#设置回复框颜色(.*)$',
          /** 执行方法 */
          fnc: 'dhk'
        }
      ]
    })
  }
async dhk(e){
if(apikey == "114514"){
this.reply('此功能为发电用户专享。');
return false
}
if(e.msg.includes("#设置用户框颜色")){
let msg = e.msg.replace(/#设置用户框颜色/g,"").trim()
let js = fs.readFileSync(`${_path}/plugins/y-tian-plugin/resources/css/gptx.css`,"utf-8")
let gh = js.match(/background-color:(.*?);/g)
console.log(gh[1])
js = js.replace(gh[1],`background-color:${msg};`)
fs.writeFileSync(`${_path}/plugins/y-tian-plugin/resources/css/gptx.css`,js,"utf-8")
e.reply("用户框颜色成功修改!")
//console.log(js)
}if(e.msg.includes("#设置回复框颜色")){
let msg = e.msg.replace(/#设置回复框颜色/g,"").trim()
let js = fs.readFileSync(`${_path}/plugins/y-tian-plugin/resources/css/gptx.css`,"utf-8")
let gh = js.match(/background-color:(.*?);/g)
console.log(gh[2])
js = js.replace(gh[2],`background-color:${msg};`)
//console.log(js)
fs.writeFileSync(`${_path}/plugins/y-tian-plugin/resources/css/gptx.css`,js,"utf-8")
e.reply("回复框颜色成功修改!")
}
}
async gptjl(e){
//console.log(Bot)
if (fs.existsSync(dirpath2 + "/" + `${e.user_id}.json`)){
let js = JSON.parse(fs.readFileSync(dirpath2 + "/" + `${e.user_id}.json`))
console.log(js)
let nickname
let title = `用户:${e.sender.nickname}的对话记录`
let forwardMsg = []
for(var i = 0;i<js.length;i++){
let userInfo
let g
if(js[i].role == "user"){
nickname = e.sender.nickname
userInfo = {
user_id: e.user_id,
nickname
}
g = js[i].content
}else{
nickname = Bot.nickname
userInfo = {
user_id: Bot.uin,
nickname
}
g = js[i].content
}
let img = {
        ...userInfo,
        message: g
      }
forwardMsg.push(img)
}
if (e.isGroup) {
let info = await Bot.getGroupMemberInfo(this.e.group_id, Bot.uin)
nickname = info.card ?? info.nickname
}
if (this.e.isGroup) {
forwardMsg = await this.e.group.makeForwardMsg(forwardMsg)
}else{
forwardMsg = await this.e.friend.makeForwardMsg(forwardMsg)
}
forwardMsg.data = forwardMsg.data
      .replace(/\n/g, '')
      .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
      .replace(/___+/, `<title color="#777777" size="26">${title}</title>`)
e.reply(forwardMsg)
}else{
let bn = "当前你没有任何聊天记录"
e.reply(bn,true)
}
}
async gptfs(e){
if(apikey == "114514"){
this.reply('此功能为发电用户专享。');
return false
}
let msg = e.msg.replace(/#?gpt对话方式/g,"").trim()
console.log(msg)
if(!msg == "转发"|"图片"|"文字"){
e.reply("你输入的不对,支持3种方式:转发;图片;文字;")
return false
}else{
if(!fs.existsSync(dirpath2 +"/"+"data.json")){
fs.writeFileSync(dirpath2+ "/" + "data.json",JSON.stringify({
    "gptx":{
        "botname":"#gptx",
        "fs":msg
    }
}))
e.reply("对话方式成功更改!")
return false
}
if(fs.existsSync(dirpath2 +"/"+"data.json")){
let js = JSON.parse(fs.readFileSync(dirpath2 +"/"+"data.json"))
let name = js.gptx.botname
fs.writeFileSync(dirpath2+ "/" + "data.json",JSON.stringify({
    "gptx":{
        "botname":name,
        "fs":msg
    }
}))
e.reply("对话方式成功更改!")
return false
}
}
}

async gpthtzs(e){
if(apikey == "114514"){
this.reply('此功能为发电用户专享。');
return false
}
let msg = e.msg.replace(/#gpt设置绘图张数/g,"").trim()
htnum = Number(msg.match(/\d+/g))
if(htnum.length == -1){
e.reply("输入的数字格式不对")
return false
}
e.reply(`gpt绘图张数已设置为:${htnum}`)
}
async gptgm(e){
let msg = e.msg.replace(/#?gpt改名/g,"").trim()
if(!fs.existsSync(dirpath2 +"/"+"data.json")){
fs.writeFileSync(dirpath2+ "/" + "data.json",JSON.stringify({
    "gptx":{
        "botname":msg,
        "fs":"图片"
    } 
}))
}if(fs.existsSync(dirpath2 +"/"+"data.json")){
let js = JSON.parse(fs.readFileSync(dirpath2 +"/"+"data.json"))
let gg = js.gptx.fs
fs.writeFileSync(dirpath2+ "/" + "data.json",JSON.stringify({
    "gptx":{
        "botname":msg,
        "fs":gg
    }
}))
}
e.reply("gpt改名成功")
}
async gptht(e){
if(typeof(htnum)=="undefined"){
htnum = 1
}
let msg = e.msg.replace(/#?gpt绘图/g,"").trim()
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
if (fs.existsSync(dirpath + "/" + "data.json")){
let key = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json"))
apikey = key.gptkey.apikey
}
let a = await fetch("https://chimeragpt.adventblocks.cc/v1/images/generations",{
method:"post",
headers:{
"content-type":"application/json",
"Authorization": "Bearer "+ apikey
},
body:JSON.stringify({
  "prompt": by,
  "n": htnum,
})
})
a = await a.json()
console.log(a)
if(eval(htnum) > 1){
let nickname = e.sender.nickname
let title = "作品"
let forwardMsg = []
let userInfo = {
user_id: e.user_id,
nickname
}
for(var i = 0;i<htnum;i++){
let data = await a.data[i].url
data = segment.image(data)
let img = {
        ...userInfo,
        message: data
      }
forwardMsg.push(img)
}
if (e.isGroup) {
let info = await Bot.getGroupMemberInfo(this.e.group_id, Bot.uin)
nickname = info.card ?? info.nickname
}
if (this.e.isGroup) {
forwardMsg = await this.e.group.makeForwardMsg(forwardMsg)
}else{
forwardMsg = await this.e.friend.makeForwardMsg(forwardMsg)
}
forwardMsg.data = forwardMsg.data
      .replace(/\n/g, '')
      .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
      .replace(/___+/, `<title color="#777777" size="26">${title}</title>`)
e.reply(forwardMsg)
//console.log(a)
}else{
let data = await a.data[0].url
e.reply([segment.image(data)])
}
}
async gptys(e){
if(apikey == "114514"){
this.reply('此功能为发电用户专享。');
return false
}
let res = await fetch('https://shouquan-1315544562.cos.ap-nanjing.myqcloud.com/sqqq.json')
res = await res.json()
res = await res.qq
console.log(res)
if(e.msg.includes("#gpt切换预设")){
if(fs.existsSync(dirpath2 +"/"+`${e.user_id}.json`)){
fs.unlinkSync(dirpath2 +"/"+`${e.user_id}.json`)
}
let msg = e.msg.replace(/#?gpt切换预设/g,"").trim()
if (fs.existsSync(dirpath + "/" + `${msg}.txt`)){
let sg = fs.readFileSync(dirpath + "/" + `${msg}.txt`,"utf-8")
//console.log(sg)
e.reply("好的，稍等哦🏀请等待回复，若回复成功，则切换成功")
history = []
if (fs.existsSync(dirpath + "/" + "data.json")){
let key = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json"))
apikey = key.gptkey.apikey
}
history.push({"role": "user", "content": sg})
if(typeof(model) == "undefined"){
model = "gpt-4-poe"
}
let tokens = await fetch("https://chimeragpt.adventblocks.cc/v1/chat/tokenizer",{
method:"post",
headers:{
"Content-Type":"application/json",
"Authorization": "Bearer " + apikey
},
body:JSON.stringify({
"model": model,
"messages": history
})
})
tokens = await tokens.json()
console.log(tokens.chimera.count)
if(model == "gpt-4"&&eval(tokens.chimera.count)>=8000){
e.reply("您的字数太多，token超过限制")
return false
}
if(model == "gpt-4-poe"&&eval(tokens.chimera.count)>=2300){
e.reply("您的字数太多，token超过限制")
return true
}
if(model == "ada"&&eval(tokens.chimera.count)>=2049){
e.reply("您的字数太多，token超过限制")
return false
}
if(model == "babbage"&&eval(tokens.chimera.count)>=2049){
e.reply("您的字数太多，token超过限制")
return false
}
if(model == "claude+"&&eval(tokens.chimera.count)>=11000){
e.reply("您的字数太多，token超过限制")
return false
}
if(model == "claude-instant"&&eval(tokens.chimera.count)>=11000){
e.reply("您的字数太多，token超过限制")
return false
}
if(model == "claude-instant-100k"&&eval(tokens.chimera.count)>=100000){
e.reply("您的字数太多，token超过限制")
return false
}
if(model == "dragonfly"&&eval(tokens.chimera.count)>=2400){
e.reply("您的字数太多，token超过限制")
return false
}
if(model == "sage"&&eval(tokens.chimera.count)>=5200){
e.reply("您的字数太多，token超过限制")
return false
}
if(model == "text-embedding-ada-002"&&eval(tokens.chimera.count)>=8191){
e.reply("您的字数太多，token超过限制")
return false
}
if(model == "gpt-3.5-turbo-poe"&&eval(tokens.chimera.count)>=3000){
e.reply("您的字数太多，token超过限制")
return false
}
if(model == "gpt-3.5-turbo"&&eval(tokens.chimera.count)>=3000){
e.reply("您的字数太多，token超过限制")
return false
}
if(model == "text-devinci-003"&&eval(tokens.chimera.count)>=4097){
e.reply("您的字数太多，token超过限制")
return false
}
let response = await fetch("https://chimeragpt.adventblocks.cc/v1/chat/completions",{
method:"post",
headers:{
accept: "application/json",
"Content-Type":"application/json",
"Authorization": "Bearer " + apikey
},
body:JSON.stringify({
model:model, 
messages:history
})
})
response = await response.json()
//console.log(response)
let obj1 = response.choices[0].message
let obj2 = {"role":"assistant"}
let obj = { ...obj1, ...obj2 }
history.push(obj)
fs.writeFileSync(dirpath2+ "/" + `${e.user_id}.json`,JSON.stringify(history))
let answer = response.choices[0].message.content
if(!fs.existsSync(dirpath2 +"/"+"data.json")){
e.reply(answer,true)
return false
}
if(fs.existsSync(dirpath2 +"/"+"data.json")){
let js = JSON.parse(fs.readFileSync(dirpath2 +"/"+"data.json"))
let n = js.gptx.fs
if(n == "文字"){
e.reply(answer,true)
return false
}
if(n == "图片"){
let r1 = e.sender.nickname
let r2 = Bot.nickname
let content = answer.replace(/\n/g,"<br>")
let js = fs.readFileSync(`${_path}/plugins/y-tian-plugin/resources/html/gptx.html`,"utf-8")
js = js.replace("Content",content)
fs.writeFileSync(`${_path}/plugins/y-tian-plugin/resources/html/gptx.html`,js,"utf-8")
let data2 = {
						tplFile: `${_path}/plugins/y-tian-plugin/resources/html/gptx.html`,
						dz: `${_path}/plugins/y-tian-plugin/resources/css/gptx.css`,				
   msg:msg,
id2:Bot.uin,
id1:e.user_id,
name:r1,
name1:r2
					}
					let img = await puppeteer.screenshot("777", {
						...data2,
					});
e.reply(img)
js = js.replace(content,"Content")
fs.writeFileSync(`${_path}/plugins/y-tian-plugin/resources/html/gptx.html`,js,"utf-8")
return true
  }
if(n == "转发"){
let nickname = model
let title = "gptx回答"
let forwardMsg = []
let userInfo = {
user_id: Bot.uin,
nickname
}
forwardMsg = [
{
        ...userInfo,
        message: answer
      }]
if (e.isGroup) {
let info = await Bot.getGroupMemberInfo(this.e.group_id, Bot.uin)
nickname = info.card ?? info.nickname
}
if (this.e.isGroup) {
forwardMsg = await this.e.group.makeForwardMsg(forwardMsg)
}else{
forwardMsg = await this.e.friend.makeForwardMsg(forwardMsg)
}
forwardMsg.data = forwardMsg.data
      .replace(/\n/g, '')
      .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
      .replace(/___+/, `<title color="#777777" size="26">${title}</title>`)
e.reply(forwardMsg)
}
}
}else if (!fs.existsSync(dirpath + "/" + `${msg}.txt`)){
e.reply("当前预设不存在，不能乱输入哦。")
}
}else if(e.msg.includes("#gpt预设大全")){
let dir = fs.readdirSync(dirpath)
let targetObj = "data.json"
let index = dir.indexOf(targetObj)
dir.splice(index, 1)
let length = dir.length
console.log(dir)
dir = JSON.stringify(dir).replace(/.txt/g, ";").replace("[", "").replace("]", "").replace(/,"/g, "").replace(/"/g, "")
let gh = dir.split(";")
let c = []
let separator = "––––––––––––––––"
let endSeparator = "================="
for (var b = 0; b < length; b++) {
let v = `\n${separator}\n${b + 1}:${gh[b]}`
c.push(v)
}
c = `${c}`
let hd = [`当前共有${length}个设定:`, c, `\n${endSeparator}\n可用#gpt查看设定\n${endSeparator}\n例:#gpt查看设定魅魔\n${endSeparator}`]
e.reply(hd.join("\n"))
}else if(e.msg.includes("#gpt查看预设")){
let msg = e.msg.replace(/#?gpt查看预设/g,"").trim()
if (fs.existsSync(dirpath + "/" + `${msg}.txt`)){
let sg = fs.readFileSync(dirpath + "/" + `${msg}.txt`,"utf-8")
let nickname = "gpt预设大全"
let title = "gpt预设大全"
if (e.isGroup) {
let info = await Bot.getGroupMemberInfo(this.e.group_id, Bot.uin)
nickname = info.card ?? info.nickname
}
let userInfo = {
user_id: Bot.uin,
nickname
}
let forwardMsg = [
{
        ...userInfo,
        message: sg
      }]
if (this.e.isGroup) {
forwardMsg = await this.e.group.makeForwardMsg(forwardMsg)
}else{
forwardMsg = await this.e.friend.makeForwardMsg(forwardMsg)
}
forwardMsg.data = forwardMsg.data
      .replace(/\n/g, '')
      .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
      .replace(/___+/, `<title color="#777777" size="26">${title}</title>`)
    e.reply(forwardMsg)
//console.log(sg)
}if (!fs.existsSync(dirpath + "/" + `${msg}.txt`)){
e.reply("当前预设不存在")
}
}else if(e.msg.includes("#gpt删除预设")){
let msg = e.msg.replace(/#?gpt删除预设/g,"").trim()
if (!fs.existsSync(dirpath + "/" + `${msg}.txt`)){
e.reply("没有这个预设,你输错了吧？")
return false
}
if (fs.existsSync(dirpath + "/" + `${msg}.txt`)){
fs.unlinkSync(dirpath + "/" + `${msg}.txt`)
e.reply(`当前预设:${msg}已成功删除!`)
}
}
}
async jblx(e){
if(e.msg.includes("#更改剧本种类")){
type = e.msg.replace(/#更改剧本种类/g,"").trim()
let msg = `当前剧本类型已切换为:${type}`
e.reply(msg)
return true;
}else if(e.msg.includes("#剧本种类")){
e.reply("当前剧本有:爱情,古装,奇幻,犯罪,战争,惊悚,历史,家庭.\n请发送#更改剧本类型+内容修改,例如:#更改剧本类型喜剧")
}
}
async cts(e){
let num;
let lx;
let words = e.msg.replace(/#藏头诗五言/g,"").replace(/#藏头诗七言/g,"").replace(/#藏尾诗五言/g,"").replace(/#藏尾诗七言/g,"").trim()
if(e.msg.includes("头")){
lx = "start"
}else{
lx = "end"
}
if(e.msg.includes("五言")){
num = 5
}else{
num = 7
}
let a = await 
fetch("https://cts.chazhi.net/", {
"method": "POST",
"headers": {
"accept": "*/*",
"accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6","content-type": "application/x-www-form-urlencoded; charset=UTF-8",
"sec-ch-ua": "\"Microsoft Edge\";v=\"113\", \"Chromium\";v=\"113\", \"Not-A.Brand\";v=\"24\"",
"sec-ch-ua-mobile": "?0",
"sec-ch-ua-platform": "\"Windows\"", "sec-fetch-dest": "empty",
"sec-fetch-mode": "cors",
"sec-fetch-site": "same-origin",
"x-requested-with": "XMLHttpRequest",
"Referer": "https://cts.chazhi.net/",
"Referrer-Policy": "strict-origin-when-cross-origin",
"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.46"
},
"body": `words=${words}&num=${num}&type=${lx}`
});
a = await a.json()
let da = await a.success
da = `${da}`
da = da.replace(/<font color="(.*?)">/g,"").replace(/<\/font>/g,"").replace(/<br\/>/g,"\n").replace(/,/g,"")
//console.log(a)
e.reply(da,true)
}
async jbsc(e){
if(typeof(type) == "undefined"){
type = "喜剧"
}
let name = e.msg.replace(/#?生成剧本/g,"").trim()
let data = {
"roles":[name],
"scenario":type+"故事"
}
let a = await 
fetch("https://datamuse.guokr.com/api/never/common/muse/tv-cosmos/v1/dramas", {
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "Referer": "https://datamuse.guokr.com/ltd",
    "Referrer-Policy": "strict-origin-when-cross-origin",
"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.46"
  },
  "body": JSON.stringify(data)
});
a = await a.json()
let drama = await a.drama
drama = drama.replace(/<strong>/g,"").replace(/<\/strong>/g,"")
//console.log(a)
e.reply(drama,true)
}
async changemodel(e){
if(apikey == "114514"){
this.reply('此功能为发电用户专享。');
return false
}
let msg = e.msg.replace(/#?gpt切换模型/g,"").trim()
if(fs.existsSync(dirpath2 +"/"+`${e.user_id}.json`)){
fs.unlinkSync(dirpath2 +"/"+`${e.user_id}.json`)
}
if(msg == 1){
model = "text-embedding-ada-002"
}if(msg == 2){
model = "ada"
}if(msg == 3){
model = "babbage"
}if(msg == 4){
model = "claude+"
}if(msg == 5){
model = "claude-instant"
}if(msg == 6){
model = "claude-instant-100k"
}if(msg == 7){
model = "dragonfly"
}if(msg == 8){
model = "sage"
}if(msg == 9){
model = "gpt-4"
}if(msg == 10){
model = "gpt-4-poe"
}if(msg == 11){
model = "gpt-3.5-turbo"
}if(msg == 12){
model = "gpt-3.5-turbo-poe"
}if(msg == 13){
model = "text-devinci-003"
}
let ms = `gpt模型成功切换,现在为${model}`
history = []
e.reply(ms)
}
async jsdh(e) {
if(e.msg.includes("#gpt对话结束")){
if(fs.existsSync(dirpath2 +"/"+`${e.user_id}.json`)){
fs.unlinkSync(dirpath2 +"/"+`${e.user_id}.json`)
let mg = `用户【${e.sender.nickname}】已经重置对话了`
e.reply(mg,true)  
}else{
e.reply("您还未有任何聊天记录")
}
}
if(e.msg.includes("#gpt结束全部对话")){
if(!e.isMaster){
e.reply("你那权限不够")
return false
}
let js = fs.readdirSync(dirpath2)
//console.log(js)
let targetObj = "data.json"
let index = js.indexOf(targetObj)
js.splice(index, 1)
for(var m = 0;m < js.length;m++){
fs.unlinkSync(dirpath2 +"/"+`${js[m]}`)
}
e.reply(`全部对话已重置,已结束${js.length}个用户的对话`)
}
}
async gptkey(e){
  this.setContext('SaveKey')
  await this.reply('请发送Key', true)
  return false
}
async SaveKey (e) {
  if (!this.e.msg) return
  let token = this.e.msg
  let headers = {
    'Authorization': 'Bearer ' + token
  }
  try {
    await fetch('https://chimeragpt.adventblocks.cc/v1/info', { headers: headers });
  } catch (error) {
    await this.reply('密钥验证失败，请检查密钥是否正确', true)
    this.finish('SaveKey')
    return
  }
  fs.writeFileSync(dirpath + "/" + "data.json",JSON.stringify({
  "gptkey":{
  "apikey":token}}))
  await this.reply('gptkey设置成功', true)
  this.finish('SaveKey')
 }
async modelhp(e){
await this.makeForwardMsg(e)
}
async makeForwardMsg(e) {
let msg = "限制次数:40/min"
let msg1 = 
"1,text-embedding-ada-002\n来源:openai\n类型:embedding\ntokens:8191"
let msg2 =
"2,ada\n来源:openai\n类型:completion\ntokens:2049"
let title = "gptmodel大全"
let msg3 =
"3,babbage\n来源:openai\n类型:completion\ntokens:2049"
let msg4 =
"4,claude+\n来源:poe\n类型:chat\ntokens:11000"
let msg5 =
"5,claude-instant\n来源:poe\n类型:chat\ntokens:11000"
let msg6 =
"6,claude-instant-100k\n来源:poe\n类型:chat\ntokens:100000"
let msg7 =
"7,dragonfly\n来源:poe\n类型:chat\ntokens:2400"
let msg8 =
"8,sage\n来源:poe\n类型:chat\ntokens:5200"
let msg9 =
"9,gpt-4\n来源:openai\n类型:chat\ntokens:2300"
let msg10 =
"10,gpt-4-poe\n来源:poe\n类型:chat\ntokens:2300"
let msg11 =
"11,gpt-3.5-turbo\n来源:openai\n类型:chat\ntokens:3000"
let msg12 =
"12,gpt-3.5-turbo-poe\n来源:poe\n类型:completion\ntokens:3000"
let msg13 =
"13,text-devinci-003\n来源:openai\n类型:completion\ntokens:4097"
let msg14 = "命令:#gpt切换模型+序号;例:#gpt切换模型1"
let nickname = Bot.nickname
if (this.e.isGroup) {
let info = await Bot.getGroupMemberInfo(this.e.group_id, Bot.uin)
nickname = info.card ?? info.nickname
}
let userInfo = {
user_id: Bot.uin,
nickname
}
let forwardMsg = [
{
        ...userInfo,
        message: msg
      },
      {
        ...userInfo,
        message: msg1
      },
{
        ...userInfo,
        message: msg2
      },
{
        ...userInfo,
        message: msg3
      },
{
        ...userInfo,
        message: msg4
      },
{
        ...userInfo,
        message: msg5
      },
{
        ...userInfo,
        message: msg6
      },
{
        ...userInfo,
        message: msg7
      },
{
        ...userInfo,
        message: msg8
      },
{
        ...userInfo,
        message: msg9
      },
{
        ...userInfo,
        message: msg10
      },
{
        ...userInfo,
        message: msg11
      },
{
        ...userInfo,
        message: msg12
      },
{
        ...userInfo,
        message: msg13
      },
{
        ...userInfo,
        message: msg14
      }
    ]
if (this.e.isGroup) {
forwardMsg = await this.e.group.makeForwardMsg(forwardMsg)
}else{
forwardMsg = await this.e.friend.makeForwardMsg(forwardMsg)
}
forwardMsg.data = forwardMsg.data
      .replace(/\n/g, '')
      .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
      .replace(/___+/, `<title color="#777777" size="26">${title}</title>`)
    e.reply(forwardMsg)
  }
async gptx (e) {
if(apikey == "114514"){
this.reply('此功能为发电用户专享。');
return false
}
if(e.message){
if(fs.existsSync(dirpath2 +"/"+"data.json")){
let js = JSON.parse(fs.readFileSync(dirpath2 +"/"+"data.json"))
botname = js.gptx.botname
}
if(e.msg.includes("#gpt新增预设")){
let m = e.msg.replace(/#gpt新增预设/g,"").trim()
let ms = m.split("/")
let txt = ms[1]
console.log(ms[0])
ms = `${ms[0]}`
txt = `${txt}`
fs.appendFileSync(dirpath+"/"+`${ms}.txt`,txt)
e.reply(`Gpt新增预设:\n[${ms}]`)
return false
}else if(e.msg.includes(botname)){
if (CD[e.user_id]&&GetCD === true&&!e.isMaster){
e.reply("除了主人之外,其他人每2分钟最多一次问答");
return false
}
    CD[e.user_id] = true;
    CD[e.user_id] = setTimeout(() => {
        if (CD[e.user_id]) {
            delete CD[e.user_id];
        }
    }, CDTime);
if (fs.existsSync(dirpath + "/" + "data.json")){
let key = JSON.parse(fs.readFileSync(dirpath + "/" + "data.json"))
apikey = key.gptkey.apikey
}
let msg = e.msg.replace(botname,"").trim()
if(e.message.find(val => val.type === 'image')){
}
if(fs.existsSync(dirpath2 +"/"+`${e.user_id}.json`)){
history = fs.readFileSync(dirpath2 +"/"+`${e.user_id}.json`,"utf-8")
history = JSON.parse(history)
}else{
history = []
}
history.push({"role": "user", "content": msg})
//console.log(history)
if(typeof(model) == "undefined"){
model = "gpt-4-poe"
}
let response = await fetch("https://chimeragpt.adventblocks.cc/v1/chat/completions",{
method:"post",
headers:{
accept: "application/json",
"Content-Type":"application/json",
"Authorization": "Bearer " + apikey
},
body:JSON.stringify({
model:model, 
messages:history
})
})
response = await response.json()
console.log(response.choices[0].message)
let obj1 = response.choices[0].message
let obj2 = {"role":"assistant"}
let obj = { ...obj1, ...obj2 }
history.push(obj)
fs.writeFileSync(dirpath2+ "/" + `${e.user_id}.json`,JSON.stringify(history))
let answer = response.choices[0].message.content
console.log(response.choices[0].message)
if(!fs.existsSync(dirpath2 +"/"+"data.json")){
e.reply(answer,true)
return false
}
if(fs.existsSync(dirpath2 +"/"+"data.json")){
let js = JSON.parse(fs.readFileSync(dirpath2 +"/"+"data.json"))
let n = js.gptx.fs
if(n == "文字"){
e.reply(answer,true)
return false
}
if(n == "图片"){
let r1 = e.sender.nickname
let r2 = Bot.nickname
let content = answer.replace(/\n/g,"<br>")
let js = fs.readFileSync(`${_path}/plugins/y-tian-plugin/resources/html/gptx.html`,"utf-8")
js = js.replace("Content",content)
fs.writeFileSync(`${_path}/plugins/y-tian-plugin/resources/html/gptx.html`,js,"utf-8")
let data2 = {
						tplFile: `${_path}/plugins/y-tian-plugin/resources/html/gptx.html`,
						dz: `${_path}/plugins/y-tian-plugin/resources/css/gptx.css`,				
   msg:msg,
id2:Bot.uin,
id1:e.user_id,
name:r1,
name1:r2
					}
					let img = await puppeteer.screenshot("777", {
						...data2,
					});
e.reply(img)
js = js.replace(content,"Content")
fs.writeFileSync(`${_path}/plugins/y-tian-plugin/resources/html/gptx.html`,js,"utf-8")
return true
  }
if(n == "转发"){
let nickname = model
let title = "gptx回答"
let forwardMsg = []
let userInfo = {
user_id: Bot.uin,
nickname
}
forwardMsg = [
{
        ...userInfo,
        message: answer
      }]
if (e.isGroup) {
let info = await Bot.getGroupMemberInfo(this.e.group_id, Bot.uin)
nickname = info.card ?? info.nickname
}
if (this.e.isGroup) {
forwardMsg = await this.e.group.makeForwardMsg(forwardMsg)
}else{
forwardMsg = await this.e.friend.makeForwardMsg(forwardMsg)
}
forwardMsg.data = forwardMsg.data
      .replace(/\n/g, '')
      .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
      .replace(/___+/, `<title color="#777777" size="26">${title}</title>`)
e.reply(forwardMsg)
}
if(n == "视频"){
let url = `https://dds.dui.ai/runtime/v1/synthesize?voiceId=qianranf&text=${answer}&speed=0.6&volume=150&audioType=mp3`
let response = await fetch(url)
let buff = await response.arrayBuffer();
fs.writeFileSync("mao.mp3", Buffer.from(buff), "binary", );
var ex = require('child_process').exec;
let o = _path +`/resources/${e.user_id}/1.mp3`
let image = segment.image(`http://q.qlogo.cn/headimg_dl?dst_uin=${Bot.uin}&spec=640&img_type=jpg`)
  var ls = ex(`ffmpeg -r 15 -t 15 -f image2 -loop 1 -i  mao.png -i mao.mp3 mao.mp4 -y`, function (error, stdout, stderr){
    if (error) {
      e.reply("失败了！");
    }else{
var i = ex("ffmpeg -i mao.mp4 -i mao.jpg -map 1 -map 0 -c copy -disposition:0 attached_pic out.mp4 -y", function (error, stdout, stderr){
    if (error) {
      e.reply("失败了！");
    }else{
let path = _path + "/out.mp4"
e.reply([segment.video(path)])
    }
  })
    }
  })
}
}
}
return false
}

}
}
















