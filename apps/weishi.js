
const _path = process.cwd();
import fs from "fs";
import plugin from '../../../lib/plugins/plugin.js'
import _ from 'lodash'
import puppeteer from 'puppeteer'
import common from'../../../lib/common/common.js'
import fetch from "node-fetch";
import {getSegment} from "../model/segment.js"
const segment = await getSegment()
let dirpath = _path + '/resources/weishi'
if (!fs.existsSync(dirpath)) {
    fs.mkdirSync(dirpath);
}
export class example extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: 'xgn',
      /** 功能描述 */
      dsc: 'xgn',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 100,
      rule: [
       {
          /** 命令正则匹配 */
          reg: "^#?(随机微视|微视|短视频|微视频)$", //匹配消息正则,命令正则
          /** 执行方法 */
          fnc: 'xz'
           },{
          /** 命令正则匹配 */
          reg: "^#?(飞机杯|bz)$", //匹配消息正则,命令正则
          /** 执行方法 */
          fnc: 'fj'
        }
      ]
    })
  }
async fj(e) {
function random(min, max) {
return Math.floor(Math.random() * (max - min)) + min;
}
function index() {
      let random2 = random(1, 3)
      if (random === 1) {
        return ''
      }
      return `list_8_${random2}.html`
    }
const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.goto(`http://www.cos5.com/feijibei/${index()}`);
let a = await page.evaluate(() => {
let videos = document.querySelectorAll(
'img');
return Array.from(videos).map(video => video.src);
});
let b = `${a}`
//console.log(a);
let co = Number(b.match(/http/g).length)
console.log(co)
let c = random(3,co-2)
let tu = segment.image(a[c])
await browser.close();        
e.reply(tu)
}
async xz(e) {
let url = `https://v.api.aa1.cn/api/api-vs/index.php`
let res = await fetch(url)
res = await res.text()
let re = res.match(/'title':'(.*?),/g)
let re2 = res.match(/'up':(.*?),/g)
re2 = `${re2}`
let re3 = res.match(/'tu':(.*?),/g)
re3 = `${re3}`
let tu = re3.replace(/'tu':/g,"").replace(",","").replace(/'/g,"")
tu = segment.image(tu)
let re4 = res.match(/http:(.*?)'/g)
re4 = `${re4}`
let movie = re4.split(",")
movie = `${movie[1]}`
movie = movie.replace(/'/g,"") 
let movie2 = segment.video(movie)
let up = re2.replace("up","up主")
let str = `${re}`
let title = str.replace("title","标题")
if(title == 'null'){
title = "无标题"
}
let response = await fetch(movie)
let buff = await response.arrayBuffer();
var filename = "video.mp4"
console.log(res)
let msg = [title,"\n",up,tu]
e.reply(msg)
fs.appendFileSync(`${dirpath}/${filename}`, Buffer.from(buff), "binary", );
e.reply([segment.video(dirpath+"/"+filename)])
await common.sleep(3000)
if (fs.existsSync(dirpath + "/" + filename)) {
fs.unlinkSync(dirpath + "/" + filename)
}
}
}




















