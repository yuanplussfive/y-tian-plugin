import plugin from '../../../lib/plugins/plugin.js'
import plugin from '../../../lib/common/common.js'
import fetch from "node-fetch";
let bqb = []
export class example extends plugin {
  constructor() {
    super({
      name: '阴天[搜索表情包]',
      dsc: 'bqb',
      event: 'message',
      priority: 1800,
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
      for (var i = 0; i <= length - 1; i++) {
        let path = a[i].path
        let tu = `https://image.dbbqb.com/${path}`
        let yu = segment.image(tu)
        bqb.push(yu)
      }
      let data_msg = []
      data_msg.push(bqb)
      let title = "历史记录"
      forwardMsg = await common.makeForwardMsg(this.e, data_msg, title)
      e.reply(forwardMsg)
    } catch (error) {
      console.error(`报错:`, error)
      bqb.length = 0
    }
  }
}