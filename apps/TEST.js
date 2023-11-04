import fs from "fs"
import cfg from '../../../lib/config/config.js';
let k;
import fetch from "node-fetch"
import crypto from 'crypto'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import common from "../../../lib/common/common.js"
let mm = {}
let gg = {}
let aa = {}
let history = []
import request from "../node_modules/request/index.js"
const _path = process.cwd()
export class RpgGame extends plugin{
       constructor() {
          super({
           name: '阴天[小功能]', 
           dsc: 'game',
           event: 'message', 
           priority: 700,
           rule: [{
           reg:"^/coser$",
           fnc:"handle"
           },
           {
            reg:"^#(作曲|zq)(.*)$",
            fnc:"zq"
           },
           {
            reg: '^#藏(头|尾|中)诗(五|七)言(.*?)$',
            fnc: 'poems'
            },
           {
            reg:"^/(.*)coser$",
            fnc:"coser"
           }
         ]
      })
    } 
async coser(e){
let msg = e.msg.replace(/\//g,"").replace(/coser/g,"").trim()
try{
let test = await fetch(`http://ciyuandao.com/photo?key=${msg}`, {
  "headers": {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Referer": "http://ciyuandao.com/photo?key=%E5%8E%9F"
  },
  "method": "GET"
});
let reform = await test.text();
let regex = /href="([^"]*)"/g;
let matches = reform.match(regex);
let hrefs = matches.map(function(match) {
  return match.replace('href="', '').replace('"', '');
});
//console.log(hrefs);
let filteredArray = hrefs.filter(item => /^\/photo\/list\/0-0-\d+\?key=/.test(item));
console.log(filteredArray)
let randomindex = Math.floor(Math.random() * filteredArray.length);
let selectedItem = filteredArray[randomindex];
console.log(selectedItem);
if(filteredArray.length == 0){
selectedItem = `/photo/list/0-0-1?key=${msg}`
}
let picurl = `http://ciyuandao.com${selectedItem}`
console.log(picurl)
let response = await fetch(picurl,{
  "headers": {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Referer": "http://ciyuandao.com/photo?key=%E5%8E%9F"
  },
  "method": "GET"
});
response = await response.text()
let result = await response.match(/<a href="\/photo\/show\/(.*?)"/g)
const uniqueArray = Array.from(new Set(result));
console.log(uniqueArray);
const randomIndex = Math.floor(Math.random() * uniqueArray.length);
const randomElement = uniqueArray[randomIndex];
let imgurl = randomElement.replace(/<a href="/g,"")
.replace(/"/g,"")
imgurl = "http://ciyuandao.com"+imgurl
let res = await fetch(imgurl, {
  "headers": {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Referer": "http://ciyuandao.com/photo?key=%E5%8E%9F"
  },
  "method": "GET"
});
res = await res.text()
let imgs = await res.match(/<a href="javascript:;"><img src="(.*?)"/g)
console.log(imgs);
let nickname = Bot.nickname
let userInfo = {
user_id: Bot.uin,
nickname
}
let forwardMsg = []
for(var a = 0;a < imgs.length;a++){
let picture = `${imgs[a]}`
picture = picture.replace(/<a href="javascript:;"><img src=/g,"")
.replace(/"/g,"")
let pictures = segment.image(picture)
let Msg = {
...userInfo,
message: pictures
}
forwardMsg.push(Msg)
}
if (this.e.isGroup) {
forwardMsg = await this.e.group.makeForwardMsg(forwardMsg)
}else{
forwardMsg = await this.e.friend.makeForwardMsg(forwardMsg)
}
e.reply(forwardMsg)
}catch{e.reply("没有搜索到相关coser内容.",true)}
}
async poems(e){
let msg = e.msg.replace(/#藏(头|尾|中)诗(五|七)言/g,"").trim()
let type = 1
let length = 5
if(msg.includes("尾")){
type = 3
}else if(msg.includes("中")){
type = 2
}
if(!msg.includes("五")){
length = 7
}
let body = `words=${msg}&length=${length}&type=${type}&mode=1`
let response = await fetch("https://www.html6game.com/ajax.php", {
  "headers": {
    "accept": "application/json, text/javascript, */*",
    "content-type": "application/x-www-form-urlencoded",
    "x-requested-with": "XMLHttpRequest",
    "Referer": "https://www.html6game.com/"
  },
  "body": body,
  "method": "POST"
});
response = await response.json()
let result = await response.lists
let str = `${result}`
console.log(str)
const replacedStr = str.replace(/<\/?b>/g, "")
.replace(/<br\/>/g,"\n")
.replace(/,/g,"")
e.reply(replacedStr)
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






















