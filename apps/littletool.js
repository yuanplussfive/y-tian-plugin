import plugin from '../../../lib/plugins/plugin.js'
import fetch from "node-fetch"
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import fs from "fs"
const _path = process.cwd()
export class manhua extends plugin {
  constructor() {
    super({
      name: '阴天[小功能]',
      dsc: 'test',
      event: 'message',
      priority: 1,
      rule: [{
        reg: "^#?云语录$",
        fnc: 'test',
      }, {
        reg: "^#?动漫预设$",
        fnc: 'randomwife'
      }, {
        reg: "^#上联(.*?)$",
        fnc: 'ddl'
      }, {
        reg: "^#历史上的今天$",
        fnc: 'history'
      }, {
        reg: "^#微博热搜$",
        fnc: 'hot'
      }, {
        reg: "^#网易云热评$",
        fnc: 'hotchat'
      }, {
        reg: "^#百科介绍(.*?)$",
        fnc: 'infor'
      }, {
        reg: "^/小功能帮助$",
        fnc: 'help'
      }]
    });


  }
  async help(e) {
    if (!fs.existsSync(_path + "/data/littletool.html")) {
      let html = `<html>
<head>
<style>
h1 {
  text-align: center;
}

ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

li {
  margin-bottom: 15px;
  padding-left: 20px;
  position: relative;
}

li:before {
  content: "▶";
  position: absolute;
  left: 0;
}

</style>
</head>
<body>
<h1>阴天小功能列表</h1>
<ul>
  <li>
    <strong>百科介绍:</strong> 提供详细的百科知识和解释。方法:#百科介绍+关键词
  </li>
  <li>
    <strong>网易云热评:</strong> 查看网易云音乐中的热门评论和用户互动。方法:#网易云热评
  </li>
  <li>
    <strong>上联:</strong> 自动生成一个与输入下联相对应的上联诗句。方法:#上联+内容
  </li>
  <li>
    <strong>云语录:</strong> 随机生成一些有趣、励志或哲理的语录和格言。方法:#云语录
  </li>
  <li>
    <strong>历史上的今天:</strong> 展示当天发生的历史事件或者重要人物的信息。方法:#历史上的今天
  </li>
  <li>
    <strong>微博热搜:</strong> 提供最新的微博热门话题和相关讨论。方法:#微博热搜
  </li>
</ul>
</body>
</html>`
      fs.writeFileSync(_path + "/data/littlehelp.html", html, "utf-8")
      let data = {
        tplFile: _path + "/data/littlehelp.html",
      }
      let img = await puppeteer.screenshot("777", {
        ...data,
      });
      e.reply(img)
    } else {
      let data = {
        tplFile: _path + "/data/littlehelp.html",
      }
      let img = await puppeteer.screenshot("777", {
        ...data,
      });
      e.reply(img)
    }
  }
  async infor(e) {
    let msg = e.msg.replace(/#百科介绍/g, "").trim()
    let url = `https://xiaoapi.cn/API/bk.php?m=json&type=bd&msg=${msg}`
    let res = await fetch(url)
    res = await res.json()
    let information = await res.msg
    let pic = await res.pic
    let zhan = await res.more
    let answer = [segment.image(pic), `介绍:${information}\n`, `拓展链接:${zhan}`]
    e.reply(answer)
  }
  async hotchat(e) {
    let url = `https://xiaoapi.cn/API/wyrp.php?id=${e.user_id}`
    let res = await fetch(url)
    res = await res.text()
    let picture = res.match(/图片(.*)/g)
    picture = `${picture}`
    picture = picture.replace(/图片：/g, "")
    let image = segment.image(picture)
    res = await res.replace(picture, "")
    //console.log(picture)
    let answer = [image, res]
    e.reply(answer, true)
  }
  async hot(e) {
    let url = "https://xiaoapi.cn/API/resou.php?type=weibo"
    let res = await fetch(url)
    res = await res.text()
    e.reply(res)
  }
  async history(e) {
    let url = "https://xiaoapi.cn/API/lssdjt_pic.php"
    e.reply(segment.image(url))
  }
  async ddl(e) {
    let msg = e.msg.replace(/#上联/g, "").trim()
    let url = await fetch(`https://seq2seq-couplet-model.rssbrain.com/v0.2/couplet/${msg}`)
    url = await url.json()
    let p = "下联:" + "\n"
    for (var i = 0; i < url.output.length; i++) {
      p = p + `${i + 1}:` + url.output[i] + "\n"
    }
    e.reply(p)
  }
  async test(e) {
    try {
      let url = "https://www.yduanzi.com/"
      let res = await fetch(url)
      res = await res.text()
      let yun = res.match(/<span id='duanzi-text'>(.*?)<\/span>/g)
      yun = `${yun}`
      let answer = yun.replace(/<span id='duanzi-text'>/g, "").replace(/<br>/g, "\n").replace(/<\/span>/g, "")
      if (answer == "null") { e.reply("获取失败了"); return false }
      e.reply(answer)
    } catch { }
  }
  async randomwife(e) {
    let getRandomInt = Math.floor(Math.random() * 80000) + 1;
    let image = segment.image(`https://www.thiswaifudoesnotexist.net/example-${getRandomInt}.jpg`)
    let txt = await fetch(`https://www.thiswaifudoesnotexist.net/snippet-${getRandomInt}.txt`)
    txt = await txt.text()
    txt = txt.replace(/\n/g, ".")
    txt = "Starting from below, we will enter a role-playing state. You need to randomly play one of the characters. Below is the overall setting of the scene, and you need to enter the animation settings,All of the following are the specific settings for the scene:" + "\n" + txt
    let nickname = Bot.nickname
    let title = "随机动漫世界预设"
    let forwardMsg = []
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
      message: image
    }
    forwardMsg.push(c)
    let h = {
      ...userInfo,
      message: "你的随机动漫预设如下:"
    }
    forwardMsg.push(h)
    let d = {
      ...userInfo,
      message: txt
    }
    forwardMsg.push(d)
    if (this.e.isGroup) {
      forwardMsg = await this.e.group.makeForwardMsg(forwardMsg)
    } else {
      forwardMsg = await this.e.friend.makeForwardMsg(forwardMsg)
    }
    e.reply(forwardMsg)
  }
}