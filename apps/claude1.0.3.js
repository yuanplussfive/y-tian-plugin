//方法，机器人名+问题,名字自己在下面改;
//更详细教程加群了解：756783127
import plugin from '../../../lib/plugins/plugin.js'
import {getSegment} from "../model/segment.js"
    const segment = await getSegment()
import fetch from 'node-fetch'
import _ from 'lodash'
const _path = process.cwd()
let dirpath = _path + '/plugins/y-tian-plugin/resources/claude token/claude.js'
let js = JSON.parse(fs.readFileSync(dirpath,'utf8'))
let botname = js.claude.botname;//你机器人的名字
let token = ""//token
let d = ""//cookie中的d值
let channel = ""//频道
let chong = ""//url
let num = ""
let num2 = ""
let a;
let text;
let text2;
import common from'../../../lib/common/common.js'
export class example extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: 'mm',
      /** 功能描述 */
      dsc: 'mm',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 1,
      rule: [
        {
          /** 命令正则匹配 */
          reg: botname,
          /** 执行方法 */
          fnc: 'help3'
},{
   /** 命令正则匹配 */
          reg: "^/reset",
          /** 执行方法 */
          fnc: 'round'
},{
          reg:"^#设置bot名(.*)",
          fnc:'name'
}
      ]
    })
}
async name(e){
let ming = e.msg.replace(/#设置bot名/g,'').trim();
fs.writeFileSync(dirpath,JSON.stringify({
    "claude":{
        "botname":ming,
    }
}))
e.reply("claude修改触发名称成功")
}
async round(e){
let  a = await fetch(`https://${chong}.slack.com/api/chat.command`, {
  "method": "POST",
  "headers": {
    "accept": "*/*",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
    "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryoqS6NObk6G6mEjgW",
    "sec-ch-ua": "\"Chromium\";v=\"112\", \"Microsoft Edge\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    "cookie": `d=${d}`
  },
  "referrerPolicy": "no-referrer",
  "body": `------WebKitFormBoundaryoqS6NObk6G6mEjgW\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${token}\r\n------WebKitFormBoundaryoqS6NObk6G6mEjgW\r\nContent-Disposition: form-data; name=\"command\"\r\n\r\n/reset\r\n------WebKitFormBoundaryoqS6NObk6G6mEjgW\r\nContent-Disposition: form-data; name=\"disp\"\r\n\r\n/reset\r\n------WebKitFormBoundaryoqS6NObk6G6mEjgW\r\nContent-Disposition: form-data; name=\"channel\"\r\n\r\n${channel}\r\n------WebKitFormBoundaryoqS6NObk6G6mEjgW\r\nContent-Disposition: form-data;  name=\"_x_reason\"\r\n\r\nexecuteCommand\r\n------WebKitFormBoundaryoqS6NObk6G6mEjgW\r\nContent-Disposition: form-data; name=\"_x_mode\"\r\n\r\nonline\r\n------WebKitFormBoundaryoqS6NObk6G6mEjgW\r\nContent-Disposition: form-data; name=\"_x_sonic\"\r\n\r\ntrue\r\n------WebKitFormBoundaryoqS6NObk6G6mEjgW--\r\n`
});
a = await a.json()
console.log(a)
let ok = await a.ok
ok = JSON.stringify(ok)
//console.log(ok)
if(ok == "true"){
e.reply("成功重置对话了！")
}else{
e.reply("重置失败了！")
}
}
 async help3(e){

await this.help(e)
await common.sleep(2500)
do{

await this.help2(e)
}while(num2||num)
}
async help(e) {
let msg = e.msg.replace(botname,"")
let b = await fetch(`https://slack.com/api/chat.postMessage?channel=${channel}&text=${msg}&pretty=1`, {
  "method": "POST",
  "headers": {
    "accept": "*/*",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
    "content-type": "multipart/form-data; boundary=----WebKitFormBoundary0AkihCXpgdizq4Bd",
    "sec-ch-ua": "\"Chromium\";v=\"112\", \"Microsoft Edge\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site", 
cookie:`d=${d}`,
"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.46"
  },
  "referrerPolicy": "no-referrer",
  "body": `------WebKitFormBoundary0AkihCXpgdizq4Bd\r\nContent-Disposition: form-data; name=\"content\"\r\n\r\nnull\r\n------WebKitFormBoundary0AkihCXpgdizq4Bd\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${token}\r\n------WebKitFormBoundary0AkihCXpgdizq4Bd--\r\n`
});
b= await b.json()
console.log(b)
}
async help2(e){
if(text == e.msg){
e.reply("uuu")
return
}
a = await fetch(`https://slack.com/api/conversations.history?channel=${channel}&limit=2&pretty=1`, {
  "method": "POST",
  "referrerPolicy": "no-referrer",
  "headers": {
    "accept": "*/*",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
    "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryAFymXOzqBWzA5q5R",
    "sec-ch-ua": "\"Chromium\";v=\"112\", \"Microsoft Edge\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    cookie: `d=${d}`,
"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.46"
  },
  body: `------WebKitFormBoundaryAFymXOzqBWzA5q5R\r\nContent-Disposition: form-data; name=\"content\"\r\n\r\nnull\r\n------WebKitFormBoundaryAFymXOzqBWzA5q5R\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${token}\r\n------WebKitFormBoundaryAFymXOzqBWzA5q5R--\r\n`

})
a = await a.json()
text = a.messages[1].text
text2 = a.messages[0].text
//console.log()
if(text == e.msg){
e.reply("请稍候")
return
}
var reg = RegExp(/_Typing…_/);
num = text.match(reg)
num2 = text2.match(reg)
if(!num){
//console.log(num2)
if(!num2){
if((text2).includes("This request may violate our Acceptable")){
e.reply(text,true)
console.log("text2")
return
}else if(!(text2).includes("This request may violate our Acceptable")){
e.reply(text2,true)
return
}
}
}
//console.log(text.match(reg))
}
}


















