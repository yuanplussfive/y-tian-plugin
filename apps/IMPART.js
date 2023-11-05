
import fetch from 'node-fetch'
import fs from 'fs'
import common from '../../../lib/common/common.js'

const _path = process.cwd()
import cfg from '../../../lib/config/config.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'

let CD = {}
let GetCD = true //CD,默认开启
let CDTime = 120000
let dirpath = _path + '/data/YTtou'
if (!fs.existsSync(dirpath)) {
  fs.mkdirSync(dirpath)
}

class Character {
  constructor (name, hp, speed, skills) {
    this.name = name
    this.hp = hp
    this.speed = speed
    this.skills = skills
    this.buff = 1.0
  }

  getRandomSkill () {
    const randomIndex = Math.floor(Math.random() * this.skills.length)
    return this.skills[randomIndex]
  }

  reset () {
    this.buff = 0
  }
}

class Skill {
  constructor (name, damage, dodge, critical, effect = null) {
    this.name = name
    this.damage = damage
    this.dodge = dodge
    this.critical = critical
    this.effect = effect
  }

  applyEffect (character) {
    if (this.effect) {
      return this.effect(character)
    }
    return ''
  }
}

function buff (character) {
  character.buff *= 1.1
  return `触发增益`
}

function debuff (character) {
  character.buff *= 0.9
  return `触发减益`
}

function playRound (attacker, defender) {
  let skill = attacker.getRandomSkill()
  let effectMessage = skill.applyEffect(attacker)
  let message = `${attacker.name} 使用${skill.name},` + effectMessage

  // 判断闪避
  if (Math.random() < skill.dodge) {
    message += `但 ${defender.name} 避开了。`
  } else {
    // 判断暴击
    let finalDamage = skill.damage * attacker.buff
    if (Math.random() < skill.critical) {
      finalDamage *= 2
      message += `触发暴击！`
    }

    finalDamage = parseFloat(finalDamage.toFixed(1))

    defender.hp -= finalDamage
    message += `成功插入 ${defender.name} ,使其体力下降 ${finalDamage} 点。`
  }

  return message
}

let weapons = [
  {
    'name': 'viagra',
    'attributes': '精力 +10',
    'money': 80
  },
  {
    'name': 'durex',
    'attributes': '体力 + 50',
    'money': 85
  },
  {
    'name': 'succubus',
    'attributes': '精力 +4, 体力 +30',
    'money': 100
  },
  {
    'name': 'Infinite tissue',
    'attributes': '精力 -8, 体力 +200 ',
    'money': 120
  }]

export class YTtou extends plugin {
  constructor () {
    super({
      name: '阴天[tou]',
      dsc: 'test',
      event: 'message',
      priority: 6000,
      rule: [{
        reg: '^/impart帮助$',
        fnc: 'help'
      }, {
        reg: '^/注入榜$',
        fnc: 'toulist'
      }, {
        reg: '^/通缉$',
        fnc: 'list'
      }, {
        reg: '^/遗忘$',
        fnc: 'run'
      }, {
        reg: '^/被透榜$',
        fnc: 'toulist2'
      }, {
        reg: '^/所透历史(.*?)$',
        fnc: 'touhistory'
      }, {
        reg: '^/点天赋(.*?)$|^/天赋大全$',
        fnc: 'gift'
      }, {
        reg: '^/道具商店$|^/购买道具(.*?)$',
        fnc: 'weapon'
      }, {
        reg: '^/查属性(.*?)$',
        fnc: 'tecent'
      }, {
        reg: '^/牛牛认证$|^/代创建(.*?)$',
        fnc: 'infor'
      }, {
        reg: '^/透(.*?)$',
        fnc: 'test'
      }, {
        reg: '^/开启透游戏$|^/结束透游戏$',
        fnc: 'startgame'
      }]
    })
  }

  async help (e) {
    let src = _path + '/plugins/y-tian-plugin/resources/css/jty.OTF'
    let data = {
      tplFile: _path + '/plugins/y-tian-plugin/YTgame/html/touhelp.html',
      src: src,

    }
    let img = await puppeteer.screenshot('777', {
      ...data,
    })
    e.reply(img)
  }

  async run (e) {
    if (!e.group) {
      e.reply('此功能无法私聊使用')
      return false
    }
    if (!fs.existsSync(dirpath + '/' + `${e.group_id}/${e.user_id}.json`)) {
      e.reply('你连角色都木有，怎么跑路嘞？', true)
      return false
    } else if (fs.existsSync(dirpath + '/' + `${e.group_id}/${e.user_id}.json`)) {
      fs.unlinkSync(dirpath + '/' + `${e.group_id}/${e.user_id}.json`)
      e.reply('恭喜你在当前群聊已成功跑路', true)
    }
  }

  async list (e) {
    if (!e.group) {
      e.reply('此功能无法私聊使用')
      return false
    }
    let name = e.message.filter(item => item.type == 'at')?.map(item => item?.text)
    name = `${name}`
    name = name.replace(/@/g, '')
    let user = e.sender.nickname
    let group = e.group_id
    let at = e.message.filter(item => item.type == 'at')?.map(item => item?.qq)
    if (!fs.existsSync(dirpath + '/' + `${e.group_id}/${e.user_id}.json`)) {
      e.reply('你未在本群创建角色,无法通缉对方', true)
      return false
    }
    if (!fs.existsSync(dirpath + '/' + `${e.group_id}/${at}.json`)) {
      e.reply('对方在本群未创建角色,无法通缉', true)
      return false
    }
    let data4 = JSON.parse(fs.readFileSync(dirpath + '/' + `${e.group_id}/${e.user_id}.json`))
    if (data4.tou.money < Number(50)) {
      e.reply('您当前的资金不足50，无法支付该次悬赏')
      return false
    }
    data4.tou.money = data4.tou.money - Number(50)
    fs.writeFileSync(dirpath + '/' + `${e.group_id}/${e.user_id}.json`, JSON.stringify(data4), 'utf-8')
    let src = _path + '/plugins/y-tian-plugin/resources/css/jty.OTF'
    let src2 = _path + '/plugins/y-tian-plugin/resources/css/NZBZ.ttf'
    let image = `http://q.qlogo.cn/headimg_dl?dst_uin=${at}&spec=640&img_type=jpg`
    let data = {
      tplFile: _path + '/plugins/y-tian-plugin/YTgame/html/tj.html',
      src2: src2,
      at: at,
      image: image,
      src: src,
      name: name,
      user: user,
      group: `[群聊${group}]`
    }
    let img = await puppeteer.screenshot('777', {
      ...data,
    })
    e.reply(img)
    e.reply('本群成员将有2分钟的时间完成讨伐,被通缉者暴击/闪避归零,各项属性下降', true)
    let data2 = JSON.parse(fs.readFileSync(dirpath + '/' + `${e.group_id}/${at}.json`))
    data2.tou.iflist = 'open'
    fs.writeFileSync(dirpath + '/' + `${e.group_id}/${at}.json`, JSON.stringify(data2), 'utf-8')
    setTimeout(() => {
      let data3 = JSON.parse(fs.readFileSync(dirpath + '/' + `${e.group_id}/${at}.json`))
      data3.tou.iflist = 'false'
      fs.writeFileSync(dirpath + '/' + `${e.group_id}/${at}.json`, JSON.stringify(data3), 'utf-8')
    }, 120000)
  }

  async touhelp (e) {
    let src = _path + '/plugins/y-tian-plugin/resources/css/jty.OTF'
    let src2 = _path + '/plugins/y-tian-plugin/resources/css/NZBZ.ttf'
    let data2 = {
      tplFile: _path + '/plugins/y-tian-plugin/YTgame/html/help2.html',
      src2: src2,
      src: src
    }
    let img = await puppeteer.screenshot('777', {
      ...data2,
    })
    e.reply(img)
  }

  async toulist (e) {
    if (!e.group) {
      e.reply('此功能无法私聊使用')
      return false
    }
    let dir = fs.readdirSync(dirpath + '/' + `${e.group_id}`)
    dir = `${dir}`
    let dirname = dir.match(/(.*?).json/g)
    let hg = []
    for (var i = 0; i < dirname.length; i++) {
      let keys = dirname[i]
      keys = keys.replace(/^,/g, '')
      hg.push(keys)
    }
    let data = []
    for (var i = 0; i < hg.length; i++) {
      let key = JSON.parse(fs.readFileSync(dirpath + '/' + `${e.group_id}/${hg[i]}`))
      let num = key.tou.num
      let qq = `${hg[i]}`
      qq = qq.replace(/.json/g, '')
      data.push({
        bonus: num,
        quantity: qq,
        image: `http://q.qlogo.cn/headimg_dl?dst_uin=${qq}&spec=640&img_type=jpg`
      })
    }
    let index = data.findIndex(item => item.quantity === 'data')
    if (index !== -1) {
      data.splice(index, 1)
    }
    let htmlString = fs.readFileSync(`${_path}/plugins/y-tian-plugin/YTgame/html/toulist.html`, 'utf-8')
    htmlString = htmlString.replace('{{data}}', JSON.stringify(data))
    fs.writeFileSync(`${_path}/resources/toulist.html`, htmlString, 'utf-8')
    await common.sleep(1000)
    let src = _path + '/plugins/y-tian-plugin/resources/css/jty.OTF'
    let data2 = {
      tplFile: _path + '/resources/toulist.html',
      group: e.group_id,
      src: src
    }
    let img = await puppeteer.screenshot('777', {
      ...data2,
    })
    e.reply(img)
  }

  async touhistory (e) {
    if (!e.group) {
      e.reply('此功能无法私聊使用')
      return false
    }
    let at = e.message.filter(item => item.type == 'at')?.map(item => item?.qq)
    let user = e.user_id
    if (at == '') {
      user = e.user_id
    } else {
      user = at
    }
    if (!fs.existsSync(dirpath + '/' + `${user}.json`)) {
      e.reply('不存在当前用户的记录', true)
      return false
    }
    if (fs.existsSync(dirpath + '/' + `${user}.json`)) {
      let key = JSON.parse(fs.readFileSync(dirpath + '/' + `${user}.json`))
      key = key.reverse()
      let forwardMsg = []
      let nickname = Bot.nickname
      let title = `用户:*${user}*  ∩透∩历史记录`
      if (this.e.isGroup) {
        let info = await Bot.getGroupMemberInfo(this.e.group_id, Bot.uin)
        nickname = info.card ?? info.nickname
      }
      let userInfo = {
        user_id: Bot.uin,
        nickname
      }
      let nums = 0
      for (var i = 0; i < key.length; i++) {
        let history = '群聊:' + key[i].group + '\n' + '时间:' + key[i].time + '\n' + '结果:' + key[i].who + '\n' + '注入量:' + key[i].num + 'ml'
        let num = key[i].num
        let d = {
          ...userInfo,
          message: history
        }
        nums = num + nums
        forwardMsg.push(d)
      }
      if (this.e.isGroup) {
        forwardMsg = await this.e.group.makeForwardMsg(forwardMsg)
      } else {
        forwardMsg = await this.e.friend.makeForwardMsg(forwardMsg)
      }
      e.reply(forwardMsg)
      e.reply(`总注入量:${nums}ml`, true)
    }
  }

  async toulist2 (e) {
    if (!e.group) {
      e.reply('此功能无法私聊使用')
      return false
    }
    let dir = fs.readdirSync(dirpath + '/' + `${e.group_id}`)
    dir = `${dir}`
    let dirname = dir.match(/(.*?).json/g)
    let hg = []
    for (var i = 0; i < dirname.length; i++) {
      let keys = dirname[i]
      keys = keys.replace(/^,/g, '')
      hg.push(keys)
    }
    let data = []
    for (var i = 0; i < hg.length; i++) {
      let key = JSON.parse(fs.readFileSync(dirpath + '/' + `${e.group_id}/${hg[i]}`))
      let nums = key.tou.nums
      let qq = `${hg[i]}`
      qq = qq.replace(/.json/g, '')
      data.push({
        bonus: nums,
        quantity: qq,
        image: `http://q.qlogo.cn/headimg_dl?dst_uin=${qq}&spec=640&img_type=jpg`
      })
    }
    let index = data.findIndex(item => item.quantity === 'data')
    if (index !== -1) {
      data.splice(index, 1)
    }
    let htmlString = fs.readFileSync(`${_path}/plugins/y-tian-plugin/YTgame/html/toulist2.html`, 'utf-8')
    htmlString = htmlString.replace('{{data}}', JSON.stringify(data))
    fs.writeFileSync(`${_path}/resources/toulist2.html`, htmlString, 'utf-8')
    await common.sleep(1000)
    let src = _path + '/plugins/y-tian-plugin/resources/css/jty.OTF'
    let data2 = {
      tplFile: _path + '/resources/toulist2.html',
      group: e.group_id,
      src: src
    }
    let img = await puppeteer.screenshot('777', {
      ...data2,
    })
    e.reply(img)
  }

  async gift (e) {
    if (!e.group) {
      e.reply('此功能无法私聊使用')
      return false
    }
    if (e.msg.includes('/天赋大全')) {
      let gifts = '体力:10/次\n精力:2/次\n暴击率:2/次\n闪避率:1/次\n\n请选择你要加点的天赋:\n/点天赋+天赋名称'
      e.reply(gifts)
    } else if (e.msg.includes('/点天赋')) {
      if (!fs.existsSync(dirpath + '/' + `${e.group_id}/${e.user_id}.json`)) {
        e.reply('你连角色都木有，怎么点天赋嘞？', true)
        return false
      }
      let addgift = e.msg.replace('/点天赋', '').trim()
      let data = JSON.parse(fs.readFileSync(dirpath + '/' + `${e.group_id}/${e.user_id}.json`))
      let level = data.tou.level
      let gift = data.tou.gift
      if (gift >= level) {
        e.reply('你没有足够的天赋点', true)
        return false
      }
      if (addgift == '体力') {
        let energy = data.tou.energy
        let gift = data.tou.gift
        data.tou.gift = gift + Number(1)
        data.tou.energy = energy + Number(10)
        e.reply('属性:体力成功增加10!', true)
        fs.writeFileSync(dirpath + '/' + `${e.group_id}/${e.user_id}.json`, JSON.stringify(data), 'utf-8')
        return false
      } else if (addgift == '精力') {
        let atk = data.tou.atk
        data.tou.atk = atk + Number(10)
        let gift = data.tou.gift
        data.tou.gift = gift + Number(1)
        e.reply('属性:精力成功增加2!', true)
        fs.writeFileSync(dirpath + '/' + `${e.group_id}/${e.user_id}.json`, JSON.stringify(data), 'utf-8')
        return false
      } else if (addgift == '暴击率') {
        let cth = data.tou.cth
        data.tou.cth = cth + Number(2)
        let gift = data.tou.gift
        data.tou.gift = gift + Number(1)
        e.reply('属性:暴击率成功增加2!', true)
        fs.writeFileSync(dirpath + '/' + `${e.group_id}/${e.user_id}.json`, JSON.stringify(data), 'utf-8')
        return false
      } else if (addgift == '闪避率') {
        let miss = data.tou.miss
        data.tou.miss = miss + Number(1)
        let gift = data.tou.gift
        data.tou.gift = gift + Number(1)
        e.reply('属性:闪避率成功增加1!', true)
        fs.writeFileSync(dirpath + '/' + `${e.group_id}/${e.user_id}.json`, JSON.stringify(data), 'utf-8')
        return false
      } else {
        e.reply('你输入的天赋名称不对', true)
      }
    }
  }

  async weapon (e) {
    if (!e.group) {
      e.reply('此功能无法私聊使用')
      return false
    }
    if (e.msg.includes('/道具商店')) {
      let answer = '￥【简易道具商店】￥' + '\n' + '\n'
      for (var i = 0; i < weapons.length; i++) {
        let key = '道具名称:' + weapons[i].name + '\n' + '属性:' + weapons[i].attributes + '\n' + '价格:' + weapons[i].money + '\n' + '\n'
        answer = answer + key
      }
      answer = answer + '/购买道具+名称选购'
      e.reply(answer)
    } else if (e.msg.includes('/购买道具')) {
      if (!fs.existsSync(dirpath + '/' + `${e.group_id}/${e.user_id}.json`)) {
        e.reply('你连角色都木有，怎么买道具嘞？', true)
        return false
      }
      let name = e.msg.replace('/购买道具', '').trim()
      let now = weapons.findIndex(item => item.name == name)
      if (now == -1) {
        e.reply('错误的道具名称,无法购买!', true)
        return false
      }
      let needmoney = weapons[now].money
      let data = JSON.parse(fs.readFileSync(dirpath + '/' + `${e.group_id}/${e.user_id}.json`))
      let money = data.tou.money
      if (money < needmoney) {
        e.reply('你的剩余金额不足以支付该道具哦', true)
        return false
      } else {
        data.tou.money = money - needmoney
        data.tou.weapon = name
        if (name == 'viagra') {
          let weapon = data.tou.weapon
          let atk = data.tou.atk
          data.tou.weapon = name
          data.tou.atk = atk + Number(10)
          fs.writeFileSync(dirpath + '/' + `${e.group_id}/${e.user_id}.json`, JSON.stringify(data), 'utf-8')
          e.reply(`成功购买${name}`, true)
          return true
        } else if (name == 'succubus') {
          let weapon = data.tou.weapon
          let energy = data.tou.energy
          let atk = data.tou.atk
          data.tou.weapon = name
          data.tou.energy = energy + Number(30)
          data.tou.atk = atk + Number(4)
          fs.writeFileSync(dirpath + '/' + `${e.group_id}/${e.user_id}.json`, JSON.stringify(data), 'utf-8')
          e.reply(`成功购买${name}`, true)
          return true
        } else if (name == 'durex') {
          let weapon = data.tou.weapon
          let energy = data.tou.energy
          data.tou.weapon = name
          data.tou.energy = energy + Number(50)
          fs.writeFileSync(dirpath + '/' + `${e.group_id}/${e.user_id}.json`, JSON.stringify(data), 'utf-8')
          e.reply(`成功购买${name}`, true)
          return true
        } else if (name == 'Infinite tissue') {
          let weapon = data.tou.weapon
          let energy = data.tou.energy
          let atk = data.tou.atk
          data.tou.weapon = name
          data.tou.energy = energy + Number(200)
          data.tou.atk = atk - Number(8)
          fs.writeFileSync(dirpath + '/' + `${e.group_id}/${e.user_id}.json`, JSON.stringify(data), 'utf-8')
          e.reply(`成功购买${name}`, true)
          return true
        }
      }
    }
  }

  async tecent (e) {
    if (!e.group) {
      e.reply('此功能无法私聊使用')
      return false
    }
    let at = e.message.filter(item => item.type == 'at')?.map(item => item?.qq)
    let user = e.user_id
    if (at == '') {
      user = e.user_id
    } else {
      user = at
    }
    if (!fs.existsSync(dirpath + '/' + `${e.group_id}/${user}.json`)) {
      e.reply('当前群聊不存在你的档案,请先发送/牛牛认证→以建立个人信息', true)
      return false
    }
    if (fs.existsSync(dirpath + '/' + `${e.group_id}/${user}.json`)) {
      let key = JSON.parse(fs.readFileSync(dirpath + '/' + `${e.group_id}/${user}.json`))
      let level = key.tou.level
      let experience = key.tou.experience
      let energy = key.tou.energy
      let atk = key.tou.atk
      let cth = key.tou.cth
      let miss = key.tou.miss
      let data = {
        tplFile: _path + '/plugins/y-tian-plugin/YTgame/html/choose.html',
        'level': level,
        'energy': energy,
        'atk': atk,
        'cth': cth,
        'miss': miss,
        'qq': `${user}`,
        'group': e.group.name,
        'experience': experience
      }
      let img = await puppeteer.screenshot('777', {
        ...data,
      })
      e.reply(img)
    }
  }

  async infor (e) {
    if (!e.group) {
      e.reply('此功能无法私聊使用')
      return false
    }
    if (!fs.existsSync(dirpath + '/' + `${e.group_id}`)) {
      e.reply('当前群聊暂未开启∩透∩游戏,请联系机器人主人或当前群聊管理员发送:\n/开启透游戏')
      return false
    }
    if (fs.existsSync(dirpath + '/' + `${e.group_id}/data.json`)) {
      let ifopen = JSON.parse(fs.readFileSync(dirpath + '/' + `${e.group_id}/data.json`))
      ifopen = ifopen.tou.ifopen
      if (ifopen == 'close') {
        e.reply('当前群聊∩透∩游戏处于关闭状态,请联系机器人主人或当前群聊管理员发送:\n/开启透游戏')
        return false
      }
    }
    if (e.msg.includes('/牛牛认证')) {
      if (fs.existsSync(dirpath + '/' + `${e.group_id}/data.json`) && !fs.existsSync(dirpath + '/' + `${e.group_id}/${e.user_id}.json`)) {
        let energy = Number(100) + await random(1, 20)
        let miss = await random(1, 3)
        let atk = Number(20) + await random(1, 5)
        let cth = await random(1, 3) + Number(3)
        let money = await random(5, 10) + Number(10)
        fs.writeFileSync(dirpath + '/' + `${e.group_id}/${e.user_id}.json`, JSON.stringify({
          'tou': {
            'energy': energy,
            'level': 1,
            'experience': 0,
            'atk': atk,
            'cth': cth,
            'miss': miss,
            'money': money,
            'weapon': '',
            'gift': 0,
            'num': 0,
            'nums': 0,
            'iflist': 'false'
          }
        }))
        let data2 = {
          tplFile: _path + '/plugins/y-tian-plugin/YTgame/html',
          'level': 1,
          'energy': energy,
          'atk': atk,
          'cth': cth,
          'miss': miss,
          'qq': e.user_id,
          'group': e.group.name,
          'experience': 0,
          'money': money
        }
        let img = await puppeteer.screenshot('777', {
          ...data2,
        })
        e.reply(img)
        return false
      } else {
        e.reply('你已经建立过个人档案了', true)
        return
      }
    } else if (e.msg.includes('/代创建')) {
      let at = e.message.filter(item => item.type == 'at')?.map(item => item?.qq)
      if (fs.existsSync(dirpath + '/' + `${e.group_id}/data.json`) && !fs.existsSync(dirpath + '/' + `${e.group_id}/${at}.json`)) {
        let energy = Number(100) + await random(1, 20)
        let miss = await random(1, 3)
        let atk = Number(20) + await random(1, 5)
        let cth = await random(1, 3) + Number(3)
        let money = await random(5, 10) + Number(10)
        fs.writeFileSync(dirpath + '/' + `${e.group_id}/${at}.json`, JSON.stringify({
          'tou': {
            'energy': energy,
            'level': 1,
            'experience': 0,
            'atk': atk,
            'cth': cth,
            'miss': miss,
            'money': money,
            'weapon': '',
            'gift': 0,
            'num': 0,
            'nums': 0,
            'iflist': 'false'
          }
        }))
        let data2 = {
          tplFile: _path + '/plugins/y-tian-plugin/YTgame/html/choose.html',
          'level': 1,
          'energy': energy,
          'atk': atk,
          'cth': cth,
          'miss': miss,
          'qq': `${at}`,
          'group': e.group.name,
          'experience': 0,
          'money': money
        }
        let img = await puppeteer.screenshot('777', {
          ...data2,
        })
        e.reply(img)
        return false
      } else {
        e.reply('他/她已经建立过个人档案了', true)
        return
      }
    }
  }

  async startgame (e) {
    if (!e.group) {
      e.reply('此功能无法私聊使用')
      return false
    }
    if (e.sender.role == 'admin' || e.sender.role == 'owner' || e.isMaster) {
      if (e.msg.includes('/开启透游戏')) {
        if (!fs.existsSync(dirpath + '/' + `${e.group_id}`)) {
          fs.mkdirSync(dirpath + '/' + `${e.group_id}`)
          fs.writeFileSync(dirpath + '/' + `${e.group_id}/data.json`, JSON.stringify({
            'tou': { 'ifopen': 'open' }
          }))
          e.reply(`当前群聊[${e.group_id}]游戏已开启`, true)
          return false
        } else if (fs.existsSync(dirpath + '/' + `${e.group_id}`)) {
          let ifopen = JSON.parse(fs.readFileSync(dirpath + '/' + `${e.group_id}/data.json`, 'utf8'))
          ifopen = ifopen.tou.ifopen
          if (ifopen == 'open') {
            e.reply('当前群聊已经开启过了', true)
            return false
          } else if (ifopen == 'close') {
            let data = JSON.parse(fs.readFileSync(dirpath + '/' + `${e.group_id}/data.json`))
            data.tou.ifopen = 'open'
            fs.writeFileSync(dirpath + '/' + `${e.group_id}/data.json`, JSON.stringify(data), 'utf-8')
            e.reply(`当前群聊[${e.group_id}]游戏已由关闭转为开启`, true)
          }
        }
      } else if (e.msg.includes('/结束透游戏')) {
        if (!fs.existsSync(dirpath + '/' + `${e.group_id}`)) {
          e.reply('本群尚未开始游戏，无法结束', true)
          return false
        } else if (fs.existsSync(dirpath + '/' + `${e.group_id}`)) {
          let ifopen = JSON.parse(fs.readFileSync(dirpath + '/' + `${e.group_id}/data.json`, 'utf8'))
          ifopen = ifopen.tou.ifopen
          if (ifopen == 'close') {
            e.reply('当前群聊已经是关闭状态', true)
            return false
          } else if (ifopen == 'open') {
            let data = JSON.parse(fs.readFileSync(dirpath + '/' + `${e.group_id}/data.json`))
            data.tou.ifopen = 'close'
            fs.writeFileSync(dirpath + '/' + `${e.group_id}/data.json`, JSON.stringify(data), 'utf-8')
            e.reply(`当前群聊[${e.group_id}]游戏已由开启转为关闭`, true)
          }
        }
      }
    } else {
      e.reply('你无权完成此游戏操作', true)
    }
  }

  async test (e) {
    if (!e.group) {
      e.reply('此功能无法私聊使用')
      return false
    }
    if (!fs.existsSync(dirpath + '/' + `${e.group_id}`)) {
      e.reply('当前群聊暂未开启∩透∩游戏,请联系机器人主人或当前群聊管理员发送:\n/开启透游戏')
      return false
    }
    if (fs.existsSync(dirpath + '/' + `${e.group_id}/data.json`)) {
      let ifopen = JSON.parse(fs.readFileSync(dirpath + '/' + `${e.group_id}/data.json`))
      ifopen = ifopen.tou.ifopen
      if (ifopen == 'close') {
        e.reply('当前群聊∩透∩游戏处于关闭状态,请联系机器人主人或当前群聊管理员发送:\n/开启透游戏')
        return false
      }
    }
    if (!fs.existsSync(dirpath + '/' + `${e.group_id}/${e.user_id}.json`)) {
      e.reply('当前群聊无你的个人精力值,请先发送/牛牛认证→以建立个人信息')
      return false
    } else if (fs.existsSync(dirpath + '/' + `${e.group_id}/${e.user_id}.json`)) {
      let at = e.message.filter(item => item.type == 'at')?.map(item => item?.qq)
      if (at == '') {
        e.reply('请艾特一个群友', true)
        return false
      }
      if (!fs.existsSync(dirpath + '/' + `${e.group_id}/${at}.json`)) {
        e.reply('不存在对方的个人档案,可以用:\n/代创建@xxx,帮对方建立个人档案', true)
        return false
      }
      if (CD[e.user_id] && GetCD === true) {
        e.reply('每2分钟最多透一次哦~')
        return true
      }
      CD[e.user_id] = true
      CD[e.user_id] = setTimeout(() => {
        if (CD[e.user_id]) {
          delete CD[e.user_id]
        }
      }, CDTime)
      let p = []
      let forwardMsg = []
      let name1 = e.sender.nickname
      let name2 = e.message.filter(item => item.type == 'at')?.map(item => item?.text)
      name2 = `${name2}`
      name2 = name2.replace(/@/g, '')
      let harm = JSON.parse(fs.readFileSync(dirpath + '/' + `${e.group_id}/${e.user_id}.json`))
      let harm2 = JSON.parse(fs.readFileSync(dirpath + '/' + `${e.group_id}/${at}.json`))
      let atk = harm.tou.atk
      let miss1 = (harm.tou.miss) / 100
      let cth = (harm.tou.cth) / 100
      let atk2 = harm2.tou.atk
      let miss2 = (harm2.tou.miss) / 100
      let cth2 = (harm2.tou.cth) / 100
      let hp1 = harm.tou.energy
      let hp2 = harm2.tou.energy
      let speed = await random(10000, 200000)
      let speed2 = await random(1, 250000)
      if (harm2.tou.iflist == 'open') {
        hp2 = hp2 - Number(100)
        miss2 = 0
        cth2 = 0
        speed2 = 0
        atk2 = atk2 - Number(10)
      }
      let character1 = new Character(name1, hp1, speed, [
        new Skill('<透>', atk, miss2, cth, null),
        new Skill('<强上>', atk * 1.5, miss2, cth, null),
        new Skill('<强制注入>', atk * 2, miss2, cth, null),
      ])

      let character2 = new Character(name2, hp2, speed2, [
        new Skill('<反击>', atk2, miss1, cth2, null),
        new Skill('<强入>', atk2 * 1.5, miss1, cth2, null),
        new Skill('<反制>', atk2 * 2, miss1, cth2, null),
      ])
      let gameInProgress = true
      let gameResult = ''

      let attacker = character1.speed > character2.speed ? character1 : character2
      let defender = attacker === character1 ? character2 : character1
      while (gameInProgress) {
        gameResult = playRound(attacker, defender)
        let percent1 = character1.hp / hp1 * 100
        let percent2 = character2.hp / hp2 * 100
        if (Number(percent1) <= 0) {
          percent1 = 0
        }
        if (Number(percent2) <= 0) {
          percent2 = 0
        }
        let data = {
          tplFile: _path + '/plugins/y-tian-plugin/YTgame/html/game.html',
          p1hp: character1.hp,
          p2hp: character2.hp,
          percent1: percent1,
          percent2: percent2,
          qq1: e.user_id,
          qq2: `${at}`
        }
        let a = 1
        let img = await puppeteer.screenshot(a, {
          ...data,
        })
        let nickname = Bot.nickname
        let title = '∩透∩战斗记录'
        if (this.e.isGroup) {
          let info = await Bot.getGroupMemberInfo(this.e.group_id, Bot.uin)
          nickname = info.card ?? info.nickname
        }
        let userInfo = {
          user_id: Bot.uin,
          nickname
        }
        let c = {
          ...userInfo,
          message: img
        }
        forwardMsg.push(c)
        let d = {
          ...userInfo,
          message: gameResult
        }
        forwardMsg.push(d)
        p.push(gameResult + '\n')
        if (character1.hp <= 0 || character2.hp <= 0) {
          gameInProgress = false
          const winner = character1.hp > 0 ? character1.name : character2.name
          if (winner == e.sender.nickname) {
            let experience2 = await random(5, 15)
            let money2 = await random(5, 10)
            let tou = await random(5, 12)
            e.reply(`${winner}成功透倒了对方！\n注入${tou}ml,\n获得经验${experience2},获得金钱${money2}`)
            let key = JSON.parse(fs.readFileSync(dirpath + '/' + `${e.group_id}/${e.user_id}.json`))
            let key2 = JSON.parse(fs.readFileSync(dirpath + '/' + `${e.group_id}/${at}.json`))
            let nums = key2.tou.nums
            key2.tou.nums = nums + tou
            let num = key.tou.num
            key.tou.num = num + tou
            let experience = key.tou.experience
            experience = experience + experience2
            let money = key.tou.money
            key.tou.experience = experience
            key.tou.level = Math.floor(experience / 100) + 1
            key.tou.money = money + money2
            fs.writeFileSync(dirpath + '/' + `${e.group_id}/${e.user_id}.json`, JSON.stringify(key), 'utf-8')
            fs.writeFileSync(dirpath + '/' + `${e.group_id}/${at}.json`, JSON.stringify(key2), 'utf-8')
            let t = new Date().getTime()
            var time = new Date(t).toLocaleString()
            if (!fs.existsSync(dirpath + '/' + `${e.user_id}.json`)) {
              let history = [{
                'num': tou,
                'time': time,
                'group': e.group_id,
                'who': `${name1}成功透了${name2}`
              }]
              fs.writeFileSync(dirpath + '/' + `${e.user_id}.json`, JSON.stringify(history), 'utf-8')
            } else if (fs.existsSync(dirpath + '/' + `${e.user_id}.json`)) {
              let history = JSON.parse(fs.readFileSync(dirpath + '/' + `${e.user_id}.json`))
              history.push({
                'num': tou,
                'time': time,
                'group': e.group_id,
                'who': `${name1}成功透了${name2}`
              })
              fs.writeFileSync(dirpath + '/' + `${e.user_id}.json`, JSON.stringify(history), 'utf-8')
            }
          } else {
            let experience2 = await random(7, 18)
            let money2 = await random(5, 10)
            let tou = await random(5, 12)
            e.reply(`很遗憾,你透对方失败了,被反透一顿,皮燕子都受不了了,\n被对方注入${tou}ml,\n对方获得经验${experience2},获得金钱${money2}`, true)
            let key = JSON.parse(fs.readFileSync(dirpath + '/' + `${e.group_id}/${at}.json`))
            let key2 = JSON.parse(fs.readFileSync(dirpath + '/' + `${e.group_id}/${e.user_id}.json`))
            let nums = key2.tou.nums
            key2.tou.nums = nums + tou
            let num = key.tou.num
            key.tou.num = num + tou
            let experience = key.tou.experience
            experience = experience + experience2
            let money = key.tou.money
            key.tou.experience = experience
            key.tou.money = money + money2
            key.tou.level = Math.floor(experience / 100) + 1
            fs.writeFileSync(dirpath + '/' + `${e.group_id}/${at}.json`, JSON.stringify(key), 'utf-8')
            fs.writeFileSync(dirpath + '/' + `${e.group_id}/${e.user_id}.json`, JSON.stringify(key2), 'utf-8')
            let t = new Date().getTime()
            var time = new Date(t).toLocaleString()
            if (!fs.existsSync(dirpath + '/' + `${at}.json`)) {
              let history = [{
                'num': tou,
                'time': time,
                'group': e.group_id,
                'who': `${name2}成功反透了${name1}`
              }]
              fs.writeFileSync(dirpath + '/' + `${at}.json`, JSON.stringify(history), 'utf-8')
            } else if (fs.existsSync(dirpath + '/' + `${at}.json`)) {
              let history = JSON.parse(fs.readFileSync(dirpath + '/' + `${at}.json`))
              history.push({
                'num': tou,
                'time': time,
                'group': e.group_id,
                'who': `${name2}成功透了${name1}`
              })
              fs.writeFileSync(dirpath + '/' + `${at}.json`, JSON.stringify(history), 'utf-8')
            }
          }
          p = `${p}`
          p = p.replace(/,/g, '<br>')
          if (this.e.isGroup) {
            forwardMsg = await this.e.group.makeForwardMsg(forwardMsg)
          } else {
            forwardMsg = await this.e.friend.makeForwardMsg(forwardMsg)
          }
          e.reply(forwardMsg)
          p = []
          forwardMsg = []
          character1.reset()
          character2.reset()
        } else {
          [attacker, defender] = [defender, attacker]
        }

      }
    }
  }
}

async function random (min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}





















