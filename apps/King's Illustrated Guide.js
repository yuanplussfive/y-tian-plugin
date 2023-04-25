import fetch from 'node-fetch'
let segment = ""
try{
segment =(await import("oicq")).segment
}catch(err){
segment =(await import("icqq")).segment
}
import common from'../../lib/common/common.js'

export class example extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: '王者',
      /** 功能描述 */
      dsc: '王者',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 885,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#?王者(.*)$',
          /** 执行方法 */
          fnc: 'op'
        }
      ]
    })
}
 
  async op(e) {
let gs = e.msg.replace(/#?王者/g, "").trim();
    let url = `https://xiaobapi.top/api/xb/api/wzrw.php?msg=${gs}`
    let res = await fetch(url)
    res = await res.text()
let reg = /=(.*?)±/g
let list = res.match(reg)
let str = `${list}`
let list2 = str.replace(/±/g,"")  
let list3 = list2.replace(/=/g,"") 
let tu = segment.image(list3)
let list4 = res.replace(/±(.*?)±/g,"")
if(res == ""){
e.reply("未查询到该英雄")
}else{  
e.reply(list4)
await common.sleep(1000)
e.reply(tu)
  }
}
}














