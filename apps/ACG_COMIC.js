import fetch from 'node-fetch'
const _path = process.cwd()
import puppeteer from "../../../lib/puppeteer/puppeteer.js"
import fs from "fs"
let src = _path + "/plugins/y-tian-plugin/resources/css/jty.OTF"
let body = []
var ageArray = [];
export class example extends plugin {
  constructor() {
    super({
      name: '阴天[acg_comic]',
      dsc: '',
      event: 'message',
      priority: 3000,
      rule: [
        {
          reg: "^#搜动漫(.*)$",
          fnc: 'chat'
     },
     {
          reg: "^#看动漫(.*)$",
          fnc: 'watch'
        }
      ]
    })
  }
async watch(e){
let msg = e.msg.replace(/#看动漫/g,"").trim()
if(body[e.user_id] && body[e.user_id][msg-1] !== undefined){
let id = body[e.user_id][msg-1].id
let url = "https://api.agedm.org/v2/detail/"+id
let response = await fetch(url, {
  "headers": {
    "Referer": "https://m.agedm.org/"
  },
  "method": "GET"
});
let res = await response.json()
let data = res.video.playlists
if(ageArray[e.user_id] == undefined){
ageArray[e.user_id] = []
}
for (const [key, value] of Object.entries(data)) {
  // 遍历属性值中的数组
  for (const [name, link] of value) {
    const processedLink = { name, link };
    ageArray[e.user_id].push(processedLink);
  }
}
}
console.log(ageArray[e.user_id])
let nickname = Bot.nickname
let userInfo = {
user_id: Bot.uin,
nickname
}

let forwardMsg = []
for(var i = 0;i < ageArray[e.user_id].length;i++){
let name = ageArray[e.user_id][i].name
let link = "https://43.240.74.134:8443/vip/?url="+ageArray[e.user_id][i].link
let content = {
...userInfo,
message: `${name}:\n${link}`
}
forwardMsg.push(content)
}
if (this.e.isGroup) {
forwardMsg = await this.e.group.makeForwardMsg(forwardMsg)
}else{
forwardMsg = await this.e.friend.makeForwardMsg(forwardMsg)
}
e.reply(forwardMsg)
}
async chat(e){
let msg = e.msg.replace(/#搜动漫/g,"").trim()
let search = await fetch(`https://api.agedm.org/v2/search?query=${msg}&page=1`, {
  "headers": {
    "Referer": "https://m.agedm.org/"
  },
  "method": "GET"
});
let result = await search.json()
console.log(result)
if(result.code && result.code !== 200){
e.reply(result.message)
return false
}
let videos = await result.data.videos
body[e.user_id] = videos
let html = fs.readFileSync(_path + '/plugins/example/help13.html',"utf-8")
html = html.replace("{{JSON}}",JSON.stringify(videos))
fs.writeFileSync(_path + '/resources/ACG.html',html,"utf-8")
let data = {
      tplFile: _path + '/resources/ACG.html',   
      src:src
    }
    let img = await puppeteer.screenshot('777', {
      ...data,
    })
    e.reply(img)
console.log(result)
}
}
async function processVideos(videos) {
    videos.forEach(video => {
        console.log(`视频ID: ${video.id}`);
        console.log(`名称: ${video.name}`);
        console.log(`状态: ${video.status}`);
        console.log(`类型: ${video.type}`);
        console.log(`原名: ${video.name_original}`);
        console.log(`其他名称: ${video.name_other}`);
        console.log(`首映日期: ${video.premiere}`);
        console.log(`编剧: ${video.writer}`);
        console.log(`标签: ${video.tags}`);
        console.log(`制作公司: ${video.company}`);
        console.log(`简介: ${video.intro}`);
        console.log(`标签数组: ${video.tagsArr.join(", ")}`);
        console.log(`封面图片: ${video.cover}`);
        console.log('-------------------------------------');
    });
}























import fetch from 'node-fetch'
const _path = process.cwd()
import puppeteer from "../../lib/puppeteer/puppeteer.js"
import fs from "fs"
let src = _path + "/plugins/y-tian-plugin/resources/css/jty.OTF"
let body = []
var ageArray = [];
export class example extends plugin {
  constructor() {
    super({
      name: '阴天[acg_comic]',
      dsc: '',
      event: 'message',
      priority: 3000,
      rule: [
        {
          reg: "^#搜动漫(.*)$",
          fnc: 'chat'
     },
     {
          reg: "^#看动漫(.*)$",
          fnc: 'watch'
        }
      ]
    })
  }
async watch(e){
let msg = e.msg.replace(/#看动漫/g,"").trim()
if(body[e.user_id] && body[e.user_id][msg-1] !== undefined){
let id = body[e.user_id][msg-1].id
let url = "https://api.agedm.org/v2/detail/"+id
let response = await fetch(url, {
  "headers": {
    "Referer": "https://m.agedm.org/"
  },
  "method": "GET"
});
let res = await response.json()
let data = res.video.playlists
if(ageArray[e.user_id] == undefined){
ageArray[e.user_id] = []
}
for (const [key, value] of Object.entries(data)) {
  // 遍历属性值中的数组
  for (const [name, link] of value) {
    const processedLink = { name, link };
    ageArray[e.user_id].push(processedLink);
  }
}
}
console.log(ageArray[e.user_id])
let nickname = Bot.nickname
let userInfo = {
user_id: Bot.uin,
nickname
}

let forwardMsg = []
for(var i = 0;i < ageArray[e.user_id].length;i++){
let name = ageArray[e.user_id][i].name
let link = "https://43.240.74.134:8443/vip/?url="+ageArray[e.user_id][i].link
let content = {
...userInfo,
message: `${name}:\n${link}`
}
forwardMsg.push(content)
}
if (this.e.isGroup) {
forwardMsg = await this.e.group.makeForwardMsg(forwardMsg)
}else{
forwardMsg = await this.e.friend.makeForwardMsg(forwardMsg)
}
e.reply(forwardMsg)
}
async chat(e){
let msg = e.msg.replace(/#搜动漫/g,"").trim()
let search = await fetch(`https://api.agedm.org/v2/search?query=${msg}&page=1`, {
  "headers": {
    "Referer": "https://m.agedm.org/"
  },
  "method": "GET"
});
let result = await search.json()
console.log(result)
if(result.code && result.code !== 200){
e.reply(result.message)
return false
}
let videos = await result.data.videos
body[e.user_id] = videos
let html = fs.readFileSync(_path + '/plugins/example/help13.html',"utf-8")
html = html.replace("{{JSON}}",JSON.stringify(videos))
fs.writeFileSync(_path + '/resources/ACG.html',html,"utf-8")
let data = {
      tplFile: _path + '/resources/ACG.html',   
      src:src
    }
    let img = await puppeteer.screenshot('777', {
      ...data,
    })
    e.reply(img)
console.log(result)
}
}
async function processVideos(videos) {
    videos.forEach(video => {
        console.log(`视频ID: ${video.id}`);
        console.log(`名称: ${video.name}`);
        console.log(`状态: ${video.status}`);
        console.log(`类型: ${video.type}`);
        console.log(`原名: ${video.name_original}`);
        console.log(`其他名称: ${video.name_other}`);
        console.log(`首映日期: ${video.premiere}`);
        console.log(`编剧: ${video.writer}`);
        console.log(`标签: ${video.tags}`);
        console.log(`制作公司: ${video.company}`);
        console.log(`简介: ${video.intro}`);
        console.log(`标签数组: ${video.tagsArr.join(", ")}`);
        console.log(`封面图片: ${video.cover}`);
        console.log('-------------------------------------');
    });
}























