import fs from "fs"
import cfg from '../../../lib/config/config.js';
let k;
import crypto from 'crypto'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import common from "../../../lib/common/common.js"
let mm = {}
let gg = {}
let aa = {}
let history = []
import request from "../node_modules/request/index.js"
const _path = process.cwd()
let dirpath = _path + '/resources/20q'
if(!fs.existsSync(dirpath)){
fs.mkdirSync(dirpath)    
}
export class RpgGame extends plugin{
constructor() {
super({
      name: '阴天[小功能]', 
      dsc: 'game',
      event: 'message', 
      priority: 7000,
rule: [{
reg:"^/coser$",
fnc:"handle"
},{
reg:"^#?kys$",
fnc:"ks"
},{
reg:"^#?ktx$",
fnc:"tx"
},{
reg:"^#?kmn$",
fnc:"mn"
},{
reg:"^khl$",
fnc:"hl"
},{
reg:"^#(作曲|zq)(.*)$",
fnc:"zq"
}
]
})
  } 
async zq(e){
let msg = e.msg.replace(/#作曲/g,"").replace(/#zq/g,"").trim()
let data = {
"prompt":msg,
"genre":"Hip hop"
}
let a = await fetch("https://riffit-song-server-qb66e4cj5q-uc.a.run.app/createLyrics", {
  "headers": {
    "content-type": "application/json",
    "Referer": "https://app.songr.ai/"
  },
  "body": JSON.stringify(data),
  "method": "POST"
});
a = await a.json()
let b = await a.lyrics
let c = await fetch("https://translate-api-fykz.xiangtatech.com/translation/webs/index", {
  "method": "POST",
  "headers": {
    "accept": "*/*",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
    "content-type": "application/x-www-form-urlencoded",
  },
  "body": `appid=105&sgid=auto&sbid=auto&egid=en&ebid=en&content=${b}&type=2`
});
c = await c.json()
b = await c.by
function processHtml(htmlString, data) {
data = data.replace(/\n/g,"<br>")
  return htmlString.replace('{{song}}', data);
}
const htmlString = fs.readFileSync(`${_path}/plugins/y-tian-plugin/resources/html/song.html`, 'utf-8');
const processedHtml = processHtml(htmlString, b);
fs.writeFileSync(`${_path}/resources/song2.html`,processedHtml,'utf-8');
await common.sleep(1590)
let user = e.sender.nickname
let src = _path + "/plugins/y-tian-plugin/resources/css/jty.OTF"
  let img = await puppeteer.screenshot("66", {
    tplFile: `${_path}/resources/song2.html`,
    imgtype: 'png',
    name:msg,
    song:b,
src:src,
user:user
  });
await e.reply(img)
}
async hl(e){
let url = "https://t.mwm.moe/xhl"
let res = segment.image(url)
e.reply(res,true)
}
async mn(e){
let url = "https://api.vvhan.com/api/girl"
let res = segment.image(url)
e.reply(res,true)
}
async tx(e){
let url = "https://t.mwm.moe/tx"
let res = segment.image(url)
e.reply(res,true)
}
async ks(e){
let url = "https://t.mwm.moe/ys"
let res = segment.image(url)
e.reply(res,true)
}
async gg(e){
let history = []
let msg = e.msg.replace(/gg/g,"").trim()
history.push({"role":"user","content":msg})
console.log(history)
let data = {
"messages":history,
"model":"gpt-4-0613",
"stream":true
}
let a = await 
fetch("https://api.cattto.repl.co/v1/chat/completions", {
  "headers": {
    "authorization": "Bearer catto_key_211DB1z1kVD5sgdblBxFhvRC",
    "content-type": "application/json",
  },
  "body": JSON.stringify(data),
  "method": "POST"
});
a = await a.text()
e.reply(a)
let b = a.replace(/data:/g,"")
let lastb = b.split('}').pop();
b = b.replace(lastb,"")
b = b.match(/{"content":"(.*?)"}/g)
let content = []
for(var i = 0;i<b.length;i++){
let answer = JSON.parse(b[i]).content
content.push(answer)
}
e.reply(content,true)
content = `${content}`
content = content.replace(/,/g,"")
history.push({"role":"assistant","content":content})
}
async choose(e){

const input = 'https://gchat.qpic.cn/gchatpic_new/2166683295/529331890-2841777974-28E9E413CE98AFB19367CD8C94AE4EE0/0?term=3&is_origin=0';
const md5 = crypto.createHash('md5').update(input).digest('hex');
e.reply(md5);
let time = new Date().getTime()
console.log(time)
let url = await fetch(`https://a19-v3-bigdata.gameyw.netease.com/a19-bigdata/ky59/v1/g37_charts/topuids?server=all&page=10&uid=64303c2da4e349ecb9a56759bcd46ffd&timestamp=${time}&token=80ACBA9BA1115C1B8C1A51602F7053B2`)
let res = await url.json()
console.log(res)
let b = await fetch("https://god.gameyw.netease.com/v1/app/topic/getFeedsByTime",{
method:"post",
headers:{
"Content-Type":"application/json;charset=UTF-8"
},
body:JSON.stringify({
"count":10,
"topicName":"阴阳师战绩"
})
})
b = await b.json()
//console.log(b.result.feeds)
let c = await fetch("https://god.gameyw.netease.com/v1/app/gameRole/getBindList",{
method:"post",
headers:{
"Content-Type":"application/json;charset=UTF-8"
},
body:JSON.stringify({
"uid":"64303c2da4e349ecb9a56759bcd46ffd"
})
})
c = await c.json()
console.log(c)
let d = await fetch(`https://god.gameyw.netease.com/v1/app/gameRole/getAppChannelInfo?ts=${time}`,{
method:"post",
headers:{
"Content-Type":"application/json",
},
body:JSON.stringify({
  "roleId": "5b2a41755f046c1ef10d605c",
  "server": "10023",
  "appKey": "g37"
})
})
d = await d.json()
console.log(d)
let g = await fetch(`https://a19-v3-bigdata.gameyw.netease.com/a19-bigdata/ky59/v1/g37_hot_lineup/list?type=high_win&uid=64303c2da4e349ecb9a56759bcd46ffd&timestamp=${time}`)
g = await g.json()
//console.log(g)
}
  async handle(e){
let gl = await gailv(458)
let a = await fetch(`http://ciyuandao.com/photo/list/0-0-${gl}`, {
method:"get",
"headers": {
"upgrade-insecure-requests": "1",
"User-Agent":
"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.43"
  }
});
a = await a.text()
let b = a.match(/<a href="\/photo\/show\/(.*?)" class="tits grey">/g)
console.log(b)
let p = []
for(var t = 0;t<b.length;t++){
let ok = `${b[t]}`
ok = ok.replace(/<a href="/g,"").replace(/class="tits grey">/g,"").replace(/"/g,"")
p.push(ok)
}
console.log(p)
let length = p.length
let c = await gailv(length)
let imgurl = "http://ciyuandao.com" + p[c-1]
let d = await fetch(imgurl)
d = await d.text()
let m = d.match(/<a href="javascript:;"><img src="(.*?)">/g)
let y = []
for(var t = 0;t<m.length;t++){
let ok = `${m[t]}`
ok = ok.replace(/<a href="javascript:;"><img src="/g,"").replace(/>/g,"").replace(/"/g,"")
y.push(ok)
}
let nickname = Bot.nickname
let title = "随机coser"
if (this.e.isGroup) {
let info = await Bot.getGroupMemberInfo(this.e.group_id, Bot.uin)
nickname = info.card ?? info.nickname
}
let userInfo = {
user_id: Bot.uin,
nickname
}
let forwardMsg = []
let bt = d.match(/<title>(.*?)<\/title>/g)
bt = `${bt}`
bt = bt.replace(/title/g,"【标题】").replace(/\/title/g,"").replace("/","")
forwardMsg.push({
...userInfo,
message:bt
})
for(var t = 0;t<y.length;t++){
let k = segment.image(y[t])
let nr = {
...userInfo,
message:k
}
forwardMsg.push(nr)
}
//console.log(forwardMsg)
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
async function gailv(length) {
  let num = Math.floor(Math.random() * length) + 1
  let nums = new Set()
  while (nums.has(num)) {
    num = Math.floor(Math.random() * length) + 1
  }
  nums.add(num)
  if (nums.size === length) nums.clear()
  return num
}






















