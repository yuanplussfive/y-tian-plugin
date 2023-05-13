import fetch from "node-fetch";
let f = []
import plugin from '../../../lib/plugins/plugin.js'
export class example extends plugin {
    constructor() {
      super({
        /** 功能名称 */
        name: '阴天[搜索]',
        /** 功能描述 */
        dsc: 'yall',
        /** https://oicqjs.github.io/oicq/#events */
        event: 'message',
        /** 优先级，数字越小等级越高 */
        priority: 5000,
        rule: [
          {
            /** 命令正则匹配 */
            reg: "^#?search(.*)$",
            /** 执行方法 */
            fnc: 'kl'
          },
        ]
      })
    }
  
    //执行方法
async kl(e){
let sou = e.msg.replace(/#?search/g,"").trim()
let a = await fetch(`https://www.similarsites.com/api/site/${sou}`, {
  "headers": {
    "accept": "*/*",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
    "sec-ch-ua": "\"Microsoft Edge\";v=\"113\", \"Chromium\";v=\"113\", \"Not-A.Brand\";v=\"24\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "cookie": "ln_or=eyIzNjUwNCI6ImQifQ%3D%3D; _gat=1",
    "Referer": "https://www.similarsites.com/site/bilibili.com",
    "Referrer-Policy": "strict-origin-when-cross-origin",
"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/111.0.1661.51"
  },
  "body": null,
  "method": "GET"
});
a = await a.json()
//console.log(a)
let g = JSON.stringify(a)
//console.log(g)
var index=g.lastIndexOf("RelatedApps");
let obj=g.substring(index+1,a.length);
obj = obj.replace("elatedApps","").replace(/"/,"").replace(/:/,"")
let str = g.slice(0, g.indexOf('Tags'))

console.log(str)
let answer = JSON.parse(obj.slice(0,obj.length-1))
let length = answer.length
for(var i = 1;i <= length;i++){
let Title = answer[i-1].Title
let Type = answer[i-1].Type
let icon = segment.image(answer[i-1].Icon)
let url = answer[i-1].Url
let msg = [`${i}:`,`标题:${Title}`,"\n",`类型:${Type}`,"\n","\n",`下载链接:${url}`,"\n","\n"]
f.push(msg)
}
await e.reply("正在搜索，请耐心等待~")
e.reply(f)
f.length = 0
}
}
















