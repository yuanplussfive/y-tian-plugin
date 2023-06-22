import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'

let url;
export class example extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: '阴天[颜值打分]',
      /** 功能描述 */
      dsc: '颜值打分',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 775,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#?颜值打分$',
          /** 执行方法 */
          fnc: 'away'
        }
      ]
    })
}
  async away(e) {
if (e.message.find(val => val.type === 'image')) {
url = e.img[0]
}
if (!e.message.find(val => val.type === 'image')) {
e.reply('请带上图片')
return
}
let url2 = encodeURI(`http://ovooa.caonm.net/API/yan/?url=${url}`)
let text = await fetch(url2)
text = await text.text()
text = text.match(/"code": (.*?),/g)
text = `${text}`
let txt = text.replace(/"code": /g,"").replace(/,/g,"")
console.log(txt)
if(txt !== "1"){
e.reply("仅支持三次元图片打分")
return
}else if(txt == "1"){
let res = await fetch(url2)
res = await res.json()
let key0 = await res.data.grade.key0
let key1 = await res.data.grade.key1
let key2 = await res.data.grade.key2
let score0 = await res.data.grade.score0
let score1 = await res.data.grade.score1
let score2 = await res.data.grade.score2
let img = await res.data.rep_image
let tu  = [segment.image(encodeURI(img))]
let msg = [`@${key0}打分:`,"\n",`${score0}`,"\n",`@${key1}打分:`,"\n",`${score1}`,"\n",`@${key2}打分:`,"\n",`${score2}`]
e.reply(msg)
e.reply(tu)
}
  }

}




























