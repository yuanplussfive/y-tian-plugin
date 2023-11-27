import plugin from '../../../lib/plugins/plugin.js'
import common from '../../../lib/common/common.js'
import fetch from "node-fetch";
let bqb = []
export class example extends plugin {
  constructor() {
    super({
      name: '阴天[搜索表情包]',
      dsc: 'bqb',
      event: 'message',
      priority: 18,
      rule: [
        {
          reg: '^/bq(.*)$',
          fnc: 'searchemoji'
        }
      ]
    })
  }
  async searchemoji(e) {
    try {
      let msg = e.msg.replace("/bq", "").trim()
      e.reply("我正在搜索表情包，请稍等哦~",true,{ recallMsg: 8 })
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
      let forwardMsg = []
      let nickname = Bot.nickname
      let userInfo = {
      user_id: Bot.uin,
      nickname
      }
      for (var i = 0; i <= length - 1; i++) {
        let path = a[i].path
        let tu = `https://image.dbbqb.com/${path}`
        let yu = segment.image(tu)
        let content = {
        ...userInfo,
        message: yu
        }
        forwardMsg.push(content)
      }
      if (this.e.isGroup) {
     forwardMsg = await   this.e.group.makeForwardMsg(forwardMsg)
}else{
forwardMsg = await        this.e.friend.makeForwardMsg(forwardMsg)
      }
      e.reply(forwardMsg)
    } catch (error) {
      console.error(`报错:`, error)
      
    }
  }
}











