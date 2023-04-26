import fetch from 'node-fetch'
import fs from 'fs'
import {getSegment} from '../model/segment.js'
const segment = await getSegment()
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
const _path = process.cwd();
let a = _path + "/plugins/y-tian-plugin/resources/css/y-t-help.css"
let html;
let tu2 = _path + "/plugins/y-tian-plugin/background/image/tu2.jpg"
let cj = _path + "/plugins/y-tian-plugin/background/image/tu1.jpg"
export class example extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: 'help',
      /** 功能描述 */
      dsc: '简单开发示例',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 40,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#?(阴天帮助|阴天help)$',
          /** 执行方法 */
          fnc: 'hi'
        }
      ]
    })
  }
async hi(e){
let img= await puppeteer.screenshot("66", {                    
tplFile: `${_path}/plugins/y-tian-plugin/resources/html/help.html`,               
imgtype:'png',     
a:a,
tu:tu2
});
await this.reply(img)
}
}




















