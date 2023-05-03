import fetch from 'node-fetch'
import fs from 'fs'
import {getSegment} from "../model/segment.js"
const segment = await getSegment()
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
const _path = process.cwd();
let g = []
let html;
let ys = "black"
let tu = _path + "/plugins/y-tian-plugin/background/image/tu.jpeg"
export class example extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: '阴天',
      /** 功能描述 */
      dsc: '简单开发示例',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 17700,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '_思维导图(.*)',
          /** 执行方法 */
          fnc: 'swdt'
        }
      ]
    })
  }

async swdt(e){
let m = e.msg.replace(/_思维导图/g,"").trim()
let url = `https://api.ownthink.com/kg/knowledge?entity=${m}`
let res = await fetch(url)
res = await res.json()
console.log(res)
let avp = await res.data.avp
let leg = avp.length
for(var i = 1;i<=leg;i++){
let gd = i + ":" + avp[i-1] + "," + "<br>"
g.push(gd)
}
console.log(g)
let gg = `${g}`
let h = gg.replace(/,/g,"\n")
html = fs.readFileSync(_path+'/plugins/y-tian-plugin/resources/html/swpicture.html','utf-8');            
html = html.replace('wen', h).replace("COLOR",ys)
fs.writeFileSync(_path+'/plugins/y-tian-plugin/resources/html/swpicture.html', html);
g.length=0
let img= await puppeteer.screenshot("66", {                    
tplFile: `${_path}/plugins/y-tian-plugin/resources/html/swpicture.html`,               
imgtype:'jpg', 
h:h,
tu:tu
});
await e.reply(img)
let html2 = fs.readFileSync(_path+'/plugins/y-tian-plugin/resources/html/swpicture.html','utf-8');            
html2 = html2.replace(h,'wen').replace(ys,"COLOR")
fs.writeFileSync(_path+'/plugins/y-tian-plugin/resources/html/swpicture.html', html2);
}
}




















