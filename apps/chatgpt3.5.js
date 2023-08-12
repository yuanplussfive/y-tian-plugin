import fetch from 'node-fetch'
import fs from 'fs'
import puppeteer from '../../lib/puppeteer/puppeteer.js'
let prompt = false
let history = []
const _path = process.cwd()
let dirpath = _path + '/data/YTfreegpt'
if(!fs.existsSync(dirpath)){
fs.mkdirSync(dirpath)    
}
let botname = "ai"
export class example extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: '阴天[免费chatgpt]',
      /** 功能描述 */
      dsc: '',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 2000,
      rule: [
        {
          reg: `^${botname}(.*)$`,
          fnc: 'gptx'
        },
        {
          reg: "^#gpt切换预设(.*?)$",
          fnc: 'gptys'
        },
        {
          reg: "^#gpt结束对话$",
          fnc: 'gptend'
        },
        {
          reg: "^#gpt新增预设(.*?)$",
          fnc: 'gptaddys'
        },
        {
          reg: "^#gpt预设大全$",
          fnc: 'gptall'
        }
      ]
    })
  }
async gptall(e){
let dir = fs.readdirSync(dirpath)
let dirpath2 = ""
if(dir.length == 0){e.reply("当前没有任何预设");return false}
for(var i = 0;i < dir.length;i++){
let dirname = `${dir[i]}`
dirname = dirname.replace(/.txt/g,"")
dirpath2 += "序号:" + `${i+1}` + "  " + "\n" + dirname+"\n"+"---------------------------"+"\n"
}
let content = [dirpath2,"\n",`当前共有${dir.length}个预设,切换预设请用指令#gpt切换预设+序号`,"\n","---------------------------"]
e.reply(content)
}
async gptaddys(e){
let yscontent = e.msg.replace(/#gpt新增预设/g,"").trim()
let name = yscontent.substring(0,20)
name = name.replace(/#gpt新增预设/g,"").trim()
name = name + "..."
if (fs.existsSync(dirpath + "/" + `${name}.txt`)){
e.reply("当前预设名称已经存在了,正在帮您覆盖",true)
fs.writeFileSync(dirpath + "/" + `${name}.txt`,yscontent,"utf-8")
e.reply("覆盖完毕!")
}else if (!fs.existsSync(dirpath + "/" + `${name}.txt`)){
fs.writeFileSync(dirpath + "/" + `${name}.txt`,yscontent,"utf-8")
e.reply(`成功添加预设!名称为:${name}`,true)
}}
async gptend(e){
prompt = false
history = []
e.reply("对话已重置,请开始新对话")
}
async gptys(e){
if(!e.isMaster){e.reply("你不是主人，无法切换");return false}
let msg = e.msg.replace(/#gpt切换预设/g,"").trim()
msg = msg.replace(/[^\d]/g,'')
let dir = fs.readdirSync(dirpath)
if(dir.length == 0){e.reply("当前没有任何预设");return false}
msg = dir[msg-1]
console.log(msg)
if (!fs.existsSync(dirpath + "/" + `${msg}`)){
e.reply("当前预设不存在,无法切换!",true)
return false
}
if (fs.existsSync(dirpath + "/" + `${msg}`)){
prompt = fs.readFileSync(dirpath + "/" + `${msg}`,"utf-8")
e.reply("切换成功",true)
}}
async gptx(e){
let msg = e.msg.replace(botname,"").trim()
//console.log(prompt)
if(!prompt == false){
//console.log("切换成功")
history.push({ role: 'system', content: prompt })
}
history.push({ role: 'user', content: msg })
let body = {
  messages: history,
  stream: true,
  model: 'gpt-3.5-turbo-16k',
  temperature: 0.7,
  presence_penalty: 0
}

let a = await fetch("https://postapi.lbbai.cc/v1/chat/completions", {
  "headers": {
    "accept": "text/event-stream",
    "content-type": "application/json",
    "x-requested-with": "XMLHttpRequest",
    "Referer": "https://124389964761.ai701.live/",
  },
  "body": JSON.stringify(body),
  "method": "POST"
});
a = await a.text()
a = a.replace(/data:/g,"").replace(/\[DONE\]/g,"").replace(/\s+/g,",")
let inputString = `${a}`
let arrayString = `[${inputString}]`;         
arrayString = arrayString.replace(',', '')
let lastCommaIndex = arrayString.lastIndexOf(',');                                                                                    if (lastCommaIndex !== -1) {
arrayString = arrayString.substring(0, lastCommaIndex) + arrayString.substring(lastCommaIndex + 1);
}
let json = JSON.parse(arrayString)
let content = ""
for(var i = 0;i<json.length;i++){
if(json[i].choices[0].delta.content){
let data = json[i].choices[0].delta.content
content += data
}
}
content = content.replace(/,/g,' ')
e.reply(content,true)
history.push({ role: 'assistant', content: content })
}

}




















