

import puppeteer from 'puppeteer'
import common from'../../../lib/common/common.js'
import fetch from "node-fetch";
let segment = ""
try{
segment =(await import("oicq")).segment
}catch(err){
segment =(await import("icqq")).segment
}
export class example extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: 'st',
      /** 功能描述 */
      dsc: 'st',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 1,
      rule: [
       {
          /** 命令正则匹配 */
          reg: "^#?(st|ht|涩图|涩图)$", //匹配消息正则,命令正则
          /** 执行方法 */
          fnc: 'st'
        },{
          /** 命令正则匹配 */
          reg: "^#?(抱枕|来个抱枕|老婆抱枕)$", //匹配消息正则,命令正则
          /** 执行方法 */
          fnc: 'bz'
           },{
          /** 命令正则匹配 */
          reg: "^#?(cos图|cos|来张cos)$", //匹配消息正则,命令正则
          /** 执行方法 */
          fnc: 'cos'
           },{
          /** 命令正则匹配 */
          reg: "^#?(写真|xz)$", //匹配消息正则,命令正则
          /** 执行方法 */
          fnc: 'xz'
        }
      ]
    })
}
async st(e) {
let url = "https://api.lolicon.app/setu/"
let res = await fetch(url)
res = await res.text()
let response = await fetch(url)
response = await response.json()
let y = `${res}`
let img = y.match(/https(.*?)"/g)
let title2 = y.match(/"title":(.*?),/g)
let author = y.match(/"author":(.*?),/g)
let tu = `${img}`
tu = tu.replace(/"/g,"")
tu = segment.image(tu)
console.log(response)
let msg = [title2,"\n",author,"\n",tu]
e.reply(msg)
}
async bz(e) {
let url = encodeURI("https://api.isoyu.com/bao_images.php")
e.reply([segment.image(url)])
}

async cos(e) {
function random(min, max) {
return Math.floor(Math.random() * (max - min)) + min;
}
function index() {
      let random2 = random(1, 41)
      if (random === 1) {
        return ''
      }
      return `list_1_${random2}.html`
    }
const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.goto(`http://www.cos5.com/cosmeitu/${index()}`);
let a = await page.evaluate(() => {
let videos = document.querySelectorAll(
'a');
return Array.from(videos).map(video => video.href);
});
let b = `${a}`
//console.log(a);
let co = Number(b.match(/http/g).length)
console.log(co)
let c = random(13,co-15)
await page.goto(a[c]);
await page.setViewport({
      width: 2160,
      height: 1080
    })
//await page.click('.page-link')[random(1, 5)]
let d = await page.evaluate(() => {
let videos = document.querySelectorAll(
'img');
return Array.from(videos).map(video => video.src);
});
let tu = segment.image(d[2])
console.log(d)
await browser.close();        
await e.reply(tu)
}
async xz(e) {
function random(min, max) {
return Math.floor(Math.random() * (max - min)) + min;
}
function index() {
      let random2 = random(1, 5)
      if (random === 1) {
        return ''
      }
      return `list_2_${random2}.html`
    }
const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.goto(`http://www.cos5.com/sifang/${index()}`);
let a = await page.evaluate(() => {
let videos = document.querySelectorAll(
'a');
return Array.from(videos).map(video => video.href);
});
let b = `${a}`
//console.log(a);
let co = Number(b.match(/http/g).length)
console.log(co)
let c = random(13,co-15)
await page.goto(a[c]);
await page.setViewport({
      width: 2160,
      height: 1080
    })
//await page.click('.page-link')[random(1, 5)]
let d = await page.evaluate(() => {
let videos = document.querySelectorAll(
'img');
return Array.from(videos).map(video => video.src);
});
let tu = segment.image(d[2])
console.log(d)
await browser.close();        
await e.reply(tu)
}

}





















