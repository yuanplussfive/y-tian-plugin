import fetch from 'node-fetch'
import fs from 'fs'

import puppeteer from '../../lib/puppeteer/puppeteer.js'
const _path = process.cwd();
let a = _path + "/plugins/y-tian-plugin/resources/css/y-t-help.css"
let html;
let tu2 = _path + "/plugins/y-tian-plugin/background/image/tu2.png"
let cj = _path + "/plugins/y-tian-plugin/background/image/tu1.jpg"
export class example extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: '阴天[help]',
      /** 功能描述 */
      dsc: '简单开发示例',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 40,
      rule: [
        {
          reg: "^#?阴天?(帮助|help)$",
          fnc: 'help'
},{
          /** 命令正则匹配 */
          reg: '^#?旧?(阴天帮助|阴天help)$',
          /** 执行方法 */
          fnc: 'hi'
        }
      ]
    })
  }
async help(e){
let src = _path + "/plugins/y-tian-plugin/resources/css/jty.OTF"
let src2 = _path + "/plugins/y-tian-plugin/resources/css/NZBZ.ttf"
let data2 = {
          tplFile: _path + "/plugins/example/help2.html",
          src2:src2,
          src:src
        };
        let img = await puppeteer.screenshot("777", {
          ...data2,
        });
        e.reply(img);
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




















