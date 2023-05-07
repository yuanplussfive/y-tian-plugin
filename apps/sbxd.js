import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import fs from 'fs'
const _path = process.cwd();
let tu = 0
let gs = ""
var dirpath = _path + "/resources/maw";
if (!fs.existsSync(dirpath)) {//如果文件夹不存在
			fs.mkdirSync(dirpath);//创建文件夹
		  }
export class example extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: '功能',
      /** 功能描述 */
      dsc: '功能整合',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 9000,
      rule: [
        {
          /** 命令正则匹配 */
          reg: "^#?点阵字(.*)$|^#?填充(.*)$",
          /** 执行方法 */
          fnc: 'xx'
},{
      /** 命令正则匹配 */
          reg: "^#?骂我$",
          /** 执行方法 */
          fnc: 'mw'
},{
   /** 命令正则匹配 */
          reg: "^#?手写(.*)$",
          /** 执行方法 */
          fnc: 'sx'
}
      ]
    })
}
async sx(e){
let msg = e.msg.replace(/#?手写/g, "").trim();
let url = encodeURI(`https://zj.v.api.aa1.cn/api/zuoye/?msg=${msg}`)
e.reply([segment.image(url)])
}
async mw(e){
let url = 'https://xiaobapi.top/api/xb/api/curse.php'
let response = await fetch(url);
 let buff = await response.arrayBuffer();
function random(min, max) { 
return Math.floor(Math.random() * (max - min)) + min;
 }
var filename = `${random(1,888)}.mp3`;
fs.appendFileSync(`./resources/maw/${filename}`, Buffer.from(buff), "binary", );
e.reply([segment.record(dirpath + "/" + filename)])

}
async xx(e){
if(e.msg.includes('点阵字')&tu==0){
tu = 1
 gs = e.msg.replace(/#?点阵字/g, "").trim();
e.reply('请输入作为填充的文字(英文也可)')
}
if(e.msg.includes('填充')&tu==1){
tu = 0
let t = e.msg.replace(/#?填充/g, "").trim();
let url = `https://xiaobapi.top/api/xb/api/dot_matrix_word_chen.php?msg=${gs}&fill=${t}`
let res = await fetch(url)
res = await res.json()
let data = res.data
e.reply(data)
}

}

}




















