import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import common from '../../../lib/common/common.js'

export class example extends plugin {
  constructor() {
    super({
      name: '阴天[解梦]',
      dsc: '[解梦]',
      event: 'message',
      priority: 8700,
      rule: [
        {
          reg: '^#?解梦(.*)$',
          fnc: 'jm'
        }
      ]
    })
  }
  async jm(e) {
    let mg = e.msg.replace(/#?解梦/g, "").trim();
    let url = `https://api.qqsuu.cn/api/dm-dream?num=10&word=${mg}`
    let res = await fetch(url)
    res = await res.json()
    let code = res.code
    if (code == '250') {
      e.reply('这个关键词搜索不到呢，换一个试试吧！')
    }
    else
      if (code == '200') {
        let lx = res.data.list
        let str = JSON.stringify(lx)
        let y = str.slice(2, str.length)
        let m = y.slice(0, y.length - 2);
        let id = m.replace(/"id":/g, '序号:' + "\n")
        let type = id.replace(/,"type":/g, "\n" + '类型:' + "\n")
        let title2 = type.replace(/,"title":/g, "\n" + '关键词:' + "\n")
        let result = title2.replace(/,"result":/g, "\n" + '注解:' + "\n")
        let result2 = result.replace(/"/g, "")
        let result3 = result2.replace(/<br>/g, "")
        let result4 = result3.replace(/},{/g, "\n")
        let result5 = result4.replace(/序号:/g, "\n" + "\n" + '序号:')
        let data_msg = []
        data_msg.push(result5)
        let title = "为你找到以下结果"
        let ForwardMsg = await common.makeForwardMsg(this.e, data_msg, title)
        this.e.reply(ForwardMsg)
      }
  }
}