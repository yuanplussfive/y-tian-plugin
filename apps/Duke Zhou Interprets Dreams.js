import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'




export class example extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: '阴天[解梦]',
      /** 功能描述 */
      dsc: '[解梦]',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 8700,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#?解梦(.*)$',
          /** 执行方法 */
          fnc: 'jm'
}
      ]
    })
}
async jm(e){
let mg = e.msg.replace(/#?解梦/g, "").trim();
let url = `https://api.qqsuu.cn/api/dm-dream?num=10&word=${mg}`
let res = await fetch(url)
res = await res.json()
let code = res.code
if(code == '250'){
e.reply('这个关键词搜索不到呢，换一个试试吧！')
}
else
if(code == '200'){
let lx = res.data.list
let str = JSON.stringify(lx)
let y = str.slice(2,str.length)
let m = y.slice(0,y.length-2);
let id = m.replace(/"id":/g,'序号:'+"\n")
let type = id.replace(/,"type":/g,"\n"+'类型:'+"\n")
let title2 = type.replace(/,"title":/g,"\n"+'关键词:'+"\n")
let result = title2.replace(/,"result":/g,"\n"+'注解:'+"\n")
let result2 = result.replace(/"/g,"")
let result3 = result2.replace(/<br>/g,"")
let result4 = result3.replace(/},{/g,"\n")
let result5 = result4.replace(/序号:/g,"\n"+"\n"+'序号:')
var data_msg = []
data_msg.push({
          message: result5,
          nickname: '地球',
          user_id: 1142407413
        });
let brief = ""
let title = "为你找到以下结果"
let summary = ""
let ForwardMsg;
      ForwardMsg = await e.group.makeForwardMsg(data_msg);
    let regExp = /<summary color=\"#808080\" size=\"26\">查看(\d+)条转发消息<\/summary>/g;
    let res2 = regExp.exec(ForwardMsg.data);
    let pcs = res2[1];
    ForwardMsg.data = ForwardMsg.data.replace(/<msg brief="\[聊天记录\]"/g, `<msg brief=\"[${brief ? brief : "聊天记录"}]\"`)
      .replace(/<title color=\"#000000\" size=\"34\">转发的聊天记录<\/title>/g, `<title color="#000000" size="34">${title ? title : "群聊的聊天记录"}</title>`)
      .replace(/<summary color=\"#808080\" size=\"26\">查看(\d+)条转发消息<\/summary>/g, `<summary color="#808080" size="26">${summary ? summary : `查看${pcs}条转发消息`}</summary>`);
e.reply(ForwardMsg)
}

}
}


























