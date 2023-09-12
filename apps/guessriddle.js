import fetch from "node-fetch";
import common from '../../../lib/common/common.js'
const _path = process.cwd();
let time = 0
let daan = ""
let riddle = ""
let gs = ""
let dati = ""
let type = ""
let description = ""
export class cdm extends plugin {
  constructor() {
    super({
      name: '阴天[猜灯谜]',
      dsc: '猜灯谜',
      event: 'message.group',
      priority: 140,
      rule: [
        {
          reg: "^#开始猜灯谜$|^是(.*)",
          fnc: 'cdm'
        },
        {
          reg: '^#下一题$',
          fnc: 'xyt'
        },
        {
          reg: '^#结束猜灯谜$',
          fnc: 'jsyx'
        }
      ]
    })
  }
  async jsyx(e) {
    if (e.msg == '#结束猜灯谜') {
      e.reply('猜灯谜已结束')
      time = 0
    }
  }

  async xyt(e) {
    let url = `https://api.qqsuu.cn/api/dm-caizimi`;
    let res = await fetch(url)
    res = await res.json()
    if (time == 1 & e.msg == '#下一题') {

      let res = await fetch(url)
      res = await res.json()
      daan = res.data.answer
      riddle = res.data.riddle
      type = res.data.type
      e.reply('猜灯谜开始了哦～')
      await common.sleep(3000)
      let msg = [`谜题：${riddle}`, "\n",
      `类型：${type}`,
      ]
      e.reply(msg)
      console.log(daan)
      dati = setTimeout(() => {

        daan = res.data.answer
        riddle = res.data.riddle
        type = res.data.type
        description = res.data.description
        e.reply(['很可惜50秒内无人答对，那么我就公布正确答案了。', "\n",
          `→正确答案是${daan}`
        ])
        let msg = [`解释：${description}`]
        e.reply(msg)
        console.log(daan)
        console.log(description)
      }
        , 50000);

    }
  }
  async cdm(e) {
    if (e.msg.includes('是') && time == 0) {
      console.log('不在游戏范围')
      return false
    }
    if (e.msg.includes('是') && time == 1) {
      gs = e.msg.replace(/是/g, "").trim();
      if (gs == daan) {
        clearTimeout(dati)
        let msg = [segment.at(e.user_id), "\n",
          `恭喜你回答正确`]
        e.reply(msg)
        daan = res.data.answer
        type = res.data.type
        riddle = res.data.riddle


        console.log(daan)
      } else {


      }
      return
    }
    if (time == 0 && e.msg == '#开始猜灯谜') {
      let url = `https://api.qqsuu.cn/api/dm-caizimi`;
      let res = await fetch(url)
      res = await res.json()
      daan = res.data.answer
      type = res.data.type
      riddle = res.data.riddle
      e.reply('猜灯谜开始了哦，答对有奖励哦！')
      await common.sleep(3000)
      let msg = [`谜题：${riddle}`, "\n",
      `类型：${type}`,
      ]
      e.reply(msg)
      console.log(daan)
      dati = setTimeout(() => {

        daan = res.data.answer
        riddle = res.data.riddle
        type = res.data.type
        e.reply(['很可惜50秒内无人答对，那么我就公布正确答案了。', "\n",
          `→正确答案是${daan}`
        ])
        let msg = [`解释：${description}`]
        e.reply(msg)
        console.log(daan)
        console.log()
      }
        , 50000);
      time = 1
    } else if (time == 1 & e.msg == '#开始猜灯谜') {
      e.reply('猜灯谜正在进行中')

    }
  }
}