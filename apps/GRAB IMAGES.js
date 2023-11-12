import plugin from '../../../lib/plugins/plugin.js'
import _ from 'lodash'
const _path = process.cwd();
import puppeteer from 'puppeteer'

export class a extends plugin {
  constructor() {
    super({
      name: '阴天[简单爬图]',
      dsc: '简单爬图',
      event: 'message',
      priority: -1,
      rule: [
        {
          reg: "^#爬取(.*)$",
          fnc: 'ttttt'
        }
      ]
    })
  }
  async ttttt(e) {
    let u = e.msg.replace('#爬取', '').trim()
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto(`${u}`);
    let a = await page.evaluate(() => {
      let images = document.querySelectorAll('img');
      return Array.from(images).map(img => img.src);
    });


    console.log(a);

    await browser.close();
    let nickname = Bot.nickname
    let title = "爬取结果"
    let forwardMsg = []
    if (this.e.isGroup) {
      let info = await Bot.getGroupMemberInfo(this.e.group_id, Bot.uin)
      nickname = info.card ?? info.nickname
    }
    let userInfo = {
      user_id: Bot.uin,
      nickname
    }
    for (let i = 0; i < a.length; i++) {
      let headurl = {
        ...userInfo,
        message: segment.image(a[i])
      }
      forwardMsg.push(headurl)
    }
    if (this.e.isGroup) {
      forwardMsg = await this.e.group.makeForwardMsg(forwardMsg)
    } else {
      forwardMsg = await this.e.friend.makeForwardMsg(forwardMsg)
    }
    e.reply(forwardMsg)
  }
}