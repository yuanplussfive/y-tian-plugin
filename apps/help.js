import fetch from 'node-fetch'
import fs from 'fs'
import {getSegment} from '../model/segment.js'
const segment = await getSegment()
import puppeteer from '../../lib/puppeteer/puppeteer.js'
const _path = process.cwd();
let dirpath = "resources"
let a = _path + "/plugins/example/y-t-help.css"
let jk = _path + "/resources"
let html
let tu = _path + "/plugins/example/66.jpg"
let cj = _path + "/plugins/example/image.jpg"
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

  /**
   * #今日运势
   * @param e oicq传递的事件参数e
   */
 
async hi(e){
let img= await puppeteer.screenshot("66", {                    
tplFile: `${_path}/plugins/example/help.html`,               
imgtype:'png',     
a:a,
tu:tu
});
await this.reply(img)
}
}




















