import plugin from '../../../lib/plugins/plugin.js'
import fetch from "node-fetch"
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
export class manhua extends plugin {
    constructor() {
      super({
        name: '阴天[小功能]',
        dsc: 'test',
        event: 'message',
        priority: 1,
        rule: [{
          reg: "^#?云语录$",
          fnc: 'test',
},{
          reg: "^#?动漫预设$",
          fnc: 'randomwife'
},{
          reg: "^#上联(.*?)$",
          fnc: 'ddl'
        }]
      });
  
     
    }
async ddl(e){
let msg = e.msg.replace(/#上联/g,"").trim()
let url = await fetch(`https://seq2seq-couplet-model.rssbrain.com/v0.2/couplet/${msg}`)
url = await url.json()
let p = "下联:"+"\n"
for(var i = 0;i<url.output.length;i++){
p = p + `${i+1}:` + url.output[i] + "\n"
}
e.reply(p)
}
async test(e) {
try{
let url = "https://www.yduanzi.com/"
let res = await fetch(url)
res = await res.text()
let yun = res.match(/<span id='duanzi-text'>(.*?)<\/span>/g)
yun = `${yun}`
let answer = yun.replace(/<span id='duanzi-text'>/g,"").replace(/<br>/g,"\n").replace(/<\/span>/g,"")
e.reply(answer)
}catch{}
}
async randomwife(e){
let getRandomInt = Math.floor(Math.random() * 80000) + 1;
let image = segment.image(`https://www.thiswaifudoesnotexist.net/example-${getRandomInt}.jpg`)
let txt = await fetch(`https://www.thiswaifudoesnotexist.net/snippet-${getRandomInt}.txt`)
txt = await txt.text()
txt = txt.replace(/\n/g,".")
txt = "Starting from below, we will enter a role-playing state. You need to randomly play one of the characters. Below is the overall setting of the scene, and you need to enter the animation settings,All of the following are the specific settings for the scene:" + "\n" + txt
let nickname = Bot.nickname
let title = "随机动漫世界预设"
let forwardMsg = []
if (this.e.isGroup) {
let info = await Bot.getGroupMemberInfo(this.e.group_id, Bot.uin)
nickname = info.card ?? info.nickname
}
let userInfo = {
user_id: Bot.uin,
nickname
}
let c = {
...userInfo,
message:image
}
forwardMsg.push(c) 
let h = {
...userInfo,
message:"你的随机动漫预设如下:"
}
forwardMsg.push(h) 
let d = {
...userInfo,
message:txt
}
forwardMsg.push(d)
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























