import plugin from '../../../lib/plugins/plugin.js'
import fetch from "node-fetch";
let bqb = []
export class example extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: '阴天[表情包]',
            /** 功能描述 */
            dsc: 'bing',
            /** https://oicqjs.github.io/oicq/#events */
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 1800,
            rule: [
                {
                 
                    /** 命令正则匹配 */
                    reg: '^/bq(.*)$', //匹配消息正则,命令正则
                    /** 执行方法 */
                    fnc: 'searchemoji'
                }
            ]
        })
    }
async searchemoji(e){
let msg = e.msg.replace("/bq","").trim()
let a = await fetch(`https://www.dbbqb.com/api/search/json?start=0&w=${msg}`, {
  "headers": {
    "accept": "application/json",
    "web-agent": "web",
    "cookie": "Hm_lvt_7d2469592a25c577fe82de8e71a5ae60=1684086537; Hm_lpvt_7d2469592a25c577fe82de8e71a5ae60=1684086569",
    "Referer": "https://www.dbbqb.com/s?w=%E4%BD%A0%E5%A5%BD",
  }
});
a = await a.json()
console.log(a)
let length = a.length
for(var i = 0;i<=length-1;i++){
let path = a[i].path
let tu = `https://image.dbbqb.com/${path}`
let yu = segment.image(tu)
bqb.push(yu)
}
let data_msg = []
data_msg.push({
message: bqb,
          nickname: "iii",
          user_id: 2166683295
})
let brief = ""
let title = "历史记录"
let summary = ``
let ForwardMsg;
try{
      let nickname = Bot.nickname
    if (this.e.isGroup) {
      let info = await Bot.getGroupMemberInfo(this.e.group_id, Bot.uin)
      nickname = info.card ?? info.nickname
    }
    let userInfo = {
      user_id: Bot.uin,
      nickname
    }
    let forwardMsg = [
      {
        ...userInfo,
        message: bqb
      }
    ]
forwardMsg = await e.group.makeForwardMsg(forwardMsg)
e.reply(forwardMsg)
}catch(err){
e.reply("搜索失败了")
} 
bqb.length = 0
}

}




















