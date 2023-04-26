import plugin from '../../../lib/plugins/plugin.js'
import fetch from "node-fetch"
import {getSegment} from "../model/segment.js"
    const segment = await getSegment()
    const _path = process.cwd();
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import axios from'../../../node_modules/.pnpm/axios@0.27.2/node_modules/axios/lib/axios.js'
import fs from "fs";
let o
let a = 'zhuan.html'
let dirpath = _path + '/plugins/y-tian-plugin/resources/';//路径
let m
let html
export class example extends plugin {
    constructor () {
      super({
        /** 功能名称 */
        name: '阴天',
        /** 功能描述 */
        dsc: '图片旋转',
  
        event: 'message',
        /** 优先级，数字越小等级越高 */
        priority: 1,
        rule: [
          
  
  
   {
            /** 命令正则匹配 */
            reg: '^.*$',
            /** 执行方法 */
            fnc: 'test'
          }, 
          {
            /** 命令正则匹配 */
            reg: '^#转(.*)$',
            /** 执行方法 */
            fnc: 'test1'
          }, 
          {
            /** 命令正则匹配 */
            reg: '^.*$',
            /** 执行方法 */
            fnc: 'test2'
          }, 
        ]})}

        async test1 (e){m = await e.msg.replace('#转','').trim()
        m=Number(m)
        if(!Number.isInteger(m)|m==''){e.reply('请输入旋转的角度，如：#转90'); return false}else{
          m = await e.msg.replace('#转','').trim()
          m=Number(m)
           this.reply('请发送图片',true)
               html = fs.readFileSync(dirpath+'/'+a,'utf-8');
               
           html = html.replace('F', m);
           fs.writeFileSync(dirpath+'/'+a, html);
           o=1


        }
        }
    async test (e){
        if (!e.img) {
            return false;}
            else if(o!==1){ return false}
                      else if(o==1&e.img!==-1){
                        if (e.isGroup) {
                        let reply = (await e.group.getChatHistory(e.img.seq, 1))
                              .pop()?.message;
                     
                      if (reply) {
                        for (let val of reply) {
                            if (val.type == "image") {
                              e.img = [val.url];
                                break;
                            
                            }}
                        
                }console.log(e.img[0])
                let img = await puppeteer.screenshot("123", {
                    tplFile: _path +'/plugins/y-tian-plugin/resources/zhuan.html',
               imgtype:'png',
               a:e.img[0]
              
           });
           e.reply(img)
                  
               html = fs.readFileSync(dirpath+'/'+a,'utf-8')
       html = html.replace(m,'F');
      fs.writeFileSync(dirpath+'/'+a, html)
      o=0
              }else if(!e.isGroup){


                            let reply = (await e.friend.getChatHistory(e.img.seq, 1))
                            .pop()?.message;
                   
                    if (reply) {
                      for (let val of reply) {
                          if (val.type == "image") {
                              e.img = [val.url];
                              break;
                          
                          }}
                      
              }console.log(e.img[0])
              let img = await puppeteer.screenshot("123", {
                  tplFile: _path +'/plugins/y-tian-plugin/resources/zhuan.html',
             imgtype:'png',
             a:e.img[0],
             
         });
         e.reply(img)

html = fs.readFileSync(dirpath+'/'+a,'utf-8')
html = html.replace(m,'F');
fs.writeFileSync(dirpath+'/'+a, html)
o=0
                        }

            
            }



    }
  
    async test2 (e){
      if (!/\d/.test(e.msg)&&o==1&&!e.img) {let url = `https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.at}`
      let img = await puppeteer.screenshot("123", {
        tplFile: _path +'/plugins/y-tian-plugin/resources/zhuan.html',
   imgtype:'png',
   a:url,
   
});
e.reply(img)

html = fs.readFileSync(dirpath+'/'+a,'utf-8')
html = html.replace(m,'F');
fs.writeFileSync(dirpath+'/'+a, html)
o=0
}else{return false
        


      }


    }
  
  
  
  
  }