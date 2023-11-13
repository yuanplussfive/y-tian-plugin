import fetch from "node-fetch"
import fs from "fs"
const _path = process.cwd()
import common from "../../../lib/common/common.js"
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
export class example extends plugin {
  constructor() {
    super({
      name: '阴天[图文视频]',
      dsc: '',
      event: 'message',
      priority: 2400,
      rule: [
        {
          reg: "^(#|/)(ws|微视|随机微视)$",
          fnc: 'short_video'  
       },
       {
          reg: '^#(yys|阴阳师)(cos|同人)$',
          /** 执行方法 */
          fnc: 'yys_cos'
        },
        {
          reg: '^#(yys|阴阳师)(sp|视频)$',
          fnc: 'yys_video'
        },
        {
          reg: '^#(xjj|小姐姐)$',
          fnc: 'beauty_video'
        },
        {     
          reg: "^#(story|随机故事)$",
          fnc: 'story'  
       }
      ]
    })
  }
async beauty_video(e){
var random = Math.random();
if(random >= 0 && random < 0.34){
let response = await fetch("https://api.lolimi.cn/API/meinv/api.php")
let image = await response.json()
image = image.data.image
e.reply(segment.image(image))
}else if(random >= 0.34 && random < 0.68){
let response = await fetch("https://api.lolimi.cn/API/meizi/api.php")
let res = await response.json()
e.reply(segment.image(res.text))
}else{
let url = "https://api.lolimi.cn/API/tup/xjj.php"
e.reply(segment.image(url))
}}
async yys_video(e){
let time = new Date().getTime()
let numbers = await gailv(320)
let url = `https://g37community.tongren.163.com/article/apps/web/game/g37/?sort=-new&span=1&tags=视频&start=${numbers}&random=${time}`
let response = await fetch(url,{
method:"get",
headers:{
"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.64"
}
})
let res = await response.json()
let title = await res.data.articles[0].title
let name = await res.data.articles[0].author_nickname
let imgurl = await res.data.articles[0].author.avatar
let body = await res.data.articles[0].body[0].fp_data.url
let msg = ["作者:"+ name,"\n","作者头像:","\n",segment.image(imgurl)]
await this.reply(msg)
let req = await fetch(body);
let buff = await req.arrayBuffer()
fs.writeFileSync("./resources/yyssp.avi", Buffer.from(buff), "binary", );
if (fs.existsSync("./resources/yyssp.avi")) {
fs.stat("./resources/yyssp.avi",(err, stats) => {
if (err) throw err;
let dx = Math.round(stats.size/1048576)
if(dx >= 100){
e.reply(`解析文件大小为 ${dx} MB，太大了发不出来，诶嘿,给你无水印地址:\n${body}`)
return false
}else{
e.reply(segment.video("./resources/yyssp.avi"))
}})}}
async yys_cos(e){
let magic = "Cosplay"
if(e.msg.includes("cos")){magic = "Cosplay"}else{magic = "同人绘"}
const numbers = await gailv(2000)
let time = new Date().getTime()
let response = await fetch(`https://g37community.tongren.163.com/article/apps/web/game/g37/?sort=-new&span=1&tags=${magic}&start=${numbers}&random=${time}`,{
method:"get",
headers:{
"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.64"
}})
let res = await response.json()
let title = await res.data.articles[0].title
let length = (await res.data.articles[0].body).length
let num2 = Math.ceil(Math.random()*length-1);
let data = await res.data.articles[0].body[num2].fp_data.url
let update_time = await res.data.articles[0].update_time
let author_nickname = await res.data.articles[0].author_nickname
let msg = ["标题:"+title,"\n","分类:"+"["+author_nickname+"]","\n","更新时间:"+ update_time,"\n",segment.image(data)]
e.reply(msg)
}
async short_video(e) {
let response = await fetch("https://v.api.aa1.cn/api/api-vs/index.php")
let res = await response.json()
console.log(res)
let answer = [`标题:${res.title}\nUP主:${res.up}\n封面:`,segment.image(res.tu)]
e.reply(answer)
await common.sleep(400)
e.reply(segment.video(res.url))
}
async story(e) {
let pageurl = await choose()
let randomIndex = Math.floor(Math.random() * pageurl.length);
let randomObject = pageurl[randomIndex];
console.log(randomObject);
let response = await fetch(randomObject, {
  "headers": {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Referer": "http://www.guiguaiwu.com/html/dpggs_1529.html"
  },
  "method": "GET"
});
let res = await response.text()
let msg = await res.match(/<p>(.*?)<\/p>/g)
let answer = ""
for(var a = 0;a < msg.length;a++){
let story = `${msg[a]}`
story = story.replace(/<p>/g,"")
.replace(/<\/p>/g,"\n")
.replace(/<img src=(.*?)>/g,"")
answer += story
}
//console.log(answer)
answer = answer.replace(/<a href(.*?)>/g,"")
.replace(/<\/a>/g,"")
.replace(/<br\/>.*/g,"\n")
.replace(/Tags：.*/g,"")
var cleanedStory = answer.replace(/上一篇：[\s\S]*/, '');
console.log(cleanedStory)
let src = _path + "/plugins/y-tian-plugin/resources/css/jty.OTF"
function processHtml(htmlString, data) {
data = data
.replace(/\s+/g,"<br>")
.replace(/\\n/g,"<br>")
return htmlString.replace('{{song}}', data);
}
const htmlString = fs.readFileSync(`${_path}/plugins/y-tian-plugin/resources/html/noval.html`, 'utf-8');
const processedHtml = processHtml(htmlString, cleanedStory);
fs.writeFileSync(`${_path}/resources/noval.html`,processedHtml,'utf-8');
await common.sleep(1590)
let user = e.sender.nickname
  let img = await puppeteer.screenshot("66", {
    tplFile: `${_path}/resources/noval.html`,
    imgtype: 'png',
    song:cleanedStory,
    src:src
 });
await e.reply(img)
}}
async function choose(){
let randomIndex = Math.floor(Math.random() * 140);
let url = `http://www.guiguaiwu.com/html/dpggs_1529_${randomIndex}.html`
let response = await fetch(url)
response = await response.text()
let res = response.match(/<a href="\/html\/dpggs_.*?_.*?.html"/g)
let aherf = []
for(var i = 0;i < res.length;i++){
let pageurl = `${res[i]}`
pageurl = pageurl.replace(/<a href=/g,"")
.replace(/"/g,"")
pageurl = "http://www.guiguaiwu.com"+pageurl
if(pageurl !== url){
aherf.push(pageurl)
}}
return [...new Set(aherf)];
}
async function gailv(number) {
  let num = Math.floor(Math.random() * number) + 1
  let nums = new Set()
  while (nums.has(num)) {
    num = Math.floor(Math.random() * number) + 1
  }
  nums.add(num)
  if (nums.size === number) nums.clear()
  return num
}





















