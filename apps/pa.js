import plugin from '../../../lib/plugins/plugin.js'
import _ from 'lodash'
import fetch from "node-fetch";
    const _path = process.cwd();
import puppeteer from 'puppeteer'



export class a extends plugin {
    constructor () {
      super({
        /** 功能名称 */
        name: '阴天',
        /** 功能描述 */
        dsc: '简单爬图',
        /** https://oicqjs.github.io/oicq/#events */
        event: 'message',
        /** 优先级，数字越小等级越高 */
        priority: 1,
        rule: [
         {
            /** 命令正则匹配 */
            reg: "^#爬取(.*)$", //匹配消息正则,命令正则
            /** 执行方法 */
            fnc: 'ttttt'
                  }
        ]
      })
    }
     async ttttt(e) {
        let u = e.msg.replace('#爬取','').trim()
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(`${u}`);
            let a = await page.evaluate(() => {
              let images = document.querySelectorAll('img');
              return Array.from(images).map(img => img.src);
            });
        
            
                        console.log(a);
                       
            await browser.close();
           
           for(let i = 0;i<a.length;i++)
          {e.reply(segment.image(a[i]))}
        


     }}