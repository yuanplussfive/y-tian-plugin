import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
let segment = ""
try{
segment =(await import("oicq")).segment
}catch(err){
segment =(await import("icqq")).segment
}


//方法:    攻受@x@x   或者   攻受xx和xx   
export class example extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: '攻受',
      /** 功能描述 */
      dsc: '01',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 9000,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#?攻受(.*)$',
          /** 执行方法 */
          fnc: 'xx'
}
      ]
    })
}
async xx(e){
if(e.message[1]){
if (e.message[1].type=='at'){
let name =e.message[1].text.replace("@","")
let name1 =e.message[3].text.replace("@","")
let url = `https://xiaobapi.top/api/xb/api/cp.php?a=${name}&b=${name1}`
let res = await fetch(url)
res = await res.text()
e.reply(res)
  return true;
}
}else{
let mg = e.msg.replace(/#?攻受/g, "").trim();
let name2 = mg.split("和")
let op = name2[0]
let opp = name2[1]
let url = `https://xiaobapi.top/api/xb/api/cp.php?a=${op}&b=${opp}`
let res = await fetch(url)
res = await res.text()
e.reply(res)
return
}
}

}






















