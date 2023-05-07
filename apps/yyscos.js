import fetch from 'node-fetch'
import fs from "fs"

let magic;
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
      priority: 2500,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#yyscos$|^#yys同人$',
          /** 执行方法 */
          fnc: 'yyscos'
        },{
          /** 命令正则匹配 */
          reg: '^(#yyssp|#yys视频)$',
          /** 执行方法 */
          fnc: 'yyssp'
        }
      ]
    })
  }
async yyssp(e){
function gailv() {
  let num = Math.floor(Math.random() * 320) + 1
  let nums = new Set()
  while (nums.has(num)) {
    num = Math.floor(Math.random() * 320) + 1
  }
  nums.add(num)
  if (nums.size === 320) nums.clear()
  return num
}
let time = new Date().getTime()
let url = `https://g37community.tongren.163.com/article/apps/web/game/g37/?sort=-new&span=1&tags=视频&start=${gailv()}&random=${time}`
let a = await fetch(url,{
method:"get",
headers:{
"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.64"
}
})
a = await a.json()
console.log(a.data.articles[0].body[0].fp_data.url)
let title = await a.data.articles[0].title
let name = await a.data.articles[0].author_nickname
let imgurl = await a.data.articles[0].author.avatar
let body = await a.data.articles[0].body[0].fp_data.url
let msg = ["作者:"+ name,"\n","作者头像:","\n",segment.image(imgurl)]
await this.reply(msg)
let response = await fetch(body);
let buff = await response.arrayBuffer()
fs.writeFileSync("./resources/yyssp.avi", Buffer.from(buff), "binary", );
if (fs.existsSync("./resources/yyssp.avi")) {
fs.stat("./resources/yyssp.avi",(err, stats) => {
if (err) throw err;
let dx = Math.round(stats.size/1048576)
if(dx >= 100){
e.reply(`解析文件大小为 ${dx} MB，太大了发不出来，诶嘿,给你无水印地址:${body}`)
return false
}else{
e.reply([segment.video("./resources/yyssp.avi")])
}
})
}
}
async yyscos(e){
if(e.msg.includes("#yyscos")){
magic = "Cosplay"
}
if(e.msg.includes("#yys同人")){
magic = "同人绘"
}
function gailv() {
  let num = Math.floor(Math.random() * 2000) + 1
  let nums = new Set()
  while (nums.has(num)) {
    num = Math.floor(Math.random() * 2000) + 1
  }
  nums.add(num)
  if (nums.size === 2000) nums.clear()
  return num
}
let time = new Date().getTime()
console.log(time)
let b = await fetch(`https://g37community.tongren.163.com/article/apps/web/game/g37/?sort=-new&span=1&tags=${magic}&start=${gailv()}&random=${time}`,{
method:"get",
headers:{
"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.64"
}})
b = await b.json()
//console.log(b.data)
let title = await b.data.articles[0].title
let length = (await b.data.articles[0].body).length
let num2 = Math.ceil(Math.random()*length-1);
//console.log(title)
//console.log(b.data.articles[0].body)
let data = await b.data.articles[0].body[num2].fp_data.url
//console.log(data)
let update_time = await b.data.articles[0].update_time
let author_nickname = await b.data.articles[0].author_nickname
let msg = ["标题:"+title,"\n","分类:"+"["+author_nickname+"]","\n","更新时间:"+ update_time,"\n",segment.image(data)]
e.reply(msg)
}
}




















