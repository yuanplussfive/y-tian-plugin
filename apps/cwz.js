import plugin from '../../../lib/plugins/plugin.js'
import fetch from "node-fetch";
let game = 0
let ren = []
let score = {}
let time = 0
export class example extends plugin {
  constructor() {
    super({
      name: '阴天[猜游戏]',
      dsc: 'yall',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: "^#?开始猜英雄$|^#?我答(.*?)",
          fnc: 'kyx'
        }, {
          reg: "^#?加入猜英雄$",
          fnc: 'jyx'
        }, {
          reg: "^#?结束猜英雄$",
          fnc: 'jsyx'
        }
      ]
    })
  }

  async jsyx(e) {
    if (game == 0 || ren.length == 0) {
      e.reply("猜英雄游戏未发起")
      return false
    } else {
      ren.length = 0
      game = 0
      console.log(score)
      let t = JSON.stringify(score)
      t = t.replace(/,/g, "\n").replace(/{/g, "").replace(/}/g, "")
      let v = ["游戏已结束，以下为最终得分:", "\n", t]
      e.reply(v)
    }
  }
  async jyx(e) {
    let id = e.user_id
    let name = e.sender.nickname
    ren.push(id)
    let length = ren.length
    let msg = [`${name}成功加入猜英雄游戏,现在游戏人数为${length}`]
    e.reply(msg)
  }
  async kyx(e) {
    let t = new Date().getTime()
    let id = e.group_id
    if (typeof (id) === "undefined") {
      id = e.user_id
    }
    console.log(id)
    if (e.msg.includes("开始猜英雄") && game == 0) {
      console.log(ren.length)
      if (ren.length < 2) {
        e.reply("起码有两个人才能开始游戏")
        return false
      }
      let y = segment.at(ren[0])
      let url = await fetch(`https://xiaoapi.cn/API/game_cyx.php?id=${id}&msg=开始游戏`)
      let res = await url.text()
      game = 1
      e.reply(res)
      return false
    }
    if (e.msg.includes("我答") && game == 1) {
      if (!ren.includes(e.user_id)) {
        e.reply("您未加入游戏,无法作答")
        return false
      }
      let da = e.msg.replace(/#?我答/g, "").trim()
      let url = await fetch(`https://xiaoapi.cn/API/game_cyx.php?id=${id}&msg=我答${da}`)
      let answer = await url.text()
      console.log(answer)
      if (answer.includes("答案不对哦")) {
        e.reply("你的答案不对,给你个提示:")
        let url2 = await fetch(`https://xiaoapi.cn/API/game_cyx.php?id=${id}&msg=提示`)
        let ti = await url2.text()
        e.reply(ti)
      } else if (!answer.includes("答案不对哦")) {
        let ms = "恭喜你，回答正确"
        let at = segment.at(e.user_id)
        let you = [at, ms]
        e.reply(you)
        score[e.sender.nickname] = time + 1
        answer = answer.replace("恭喜你，回答正确。", "")
        e.reply(answer)
      }
    }
  }
}