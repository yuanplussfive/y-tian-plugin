import plugin from '../../../lib/plugins/plugin.js'
import fetch from "node-fetch"
const _path = process.cwd();
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import fs from "fs";
let img1 = ""
let a = 'zhuan.html'
let dirpath = _path + '/plugins/y-tian-plugin/resources/';//路径
let m
let html
export class example extends plugin {
  constructor() {
    super({
      name: '阴天',
      dsc: '图片旋转',
      event: 'message',
      priority: 1,
      rule: [
        {
          reg: '^#转(.*)$',
          fnc: 'test1'
        },

      ]
    })
  }

  async test1(e) {
    m = await e.msg.replace('#转', '').trim()
    m = Number(m)
    if (!Number.isInteger(m) | m == '') { e.reply('请输入旋转的角度，如：#转90'); return false }
    if (e.source) {
      html = fs.readFileSync(dirpath + '/' + a, 'utf-8');
      html = html.replace('F', m);
      fs.writeFileSync(dirpath + '/' + a, html);
      try {
        let reply = (await e.group.getChatHistory(e.source.seq, 1))
          .pop()?.message;
        if (reply) {
          for (let val of reply) {
            if (val.type == "image") {
              img1 = [val.url];
              break;
            }
          }
        }
      } catch (err) {
        let reply = (await e.friend.getChatHistory(e.source.time, 1))
          .pop().message;
        if (reply) {
          for (let val of reply) {
            if (val.type == "image") {
              img1 = [val.url];
              break;
            }
          }
        }
      }

      if (img1 == "") { e.reply("请确保回复的是图片或者艾特一个人"); return false }
      let img = await puppeteer.screenshot("123", {
        tplFile: _path + '/plugins/y-tian-plugin/resources/zhuan.html',
        imgtype: 'png',
        a: img1[0]

      });
      img1 = ""
      e.reply(img)

      html = fs.readFileSync(dirpath + '/' + a, 'utf-8')
      html = html.replace(m, 'F');
      fs.writeFileSync(dirpath + '/' + a, html)
      return true
    }
    if (e.toString().includes("{at:")) {
      html = fs.readFileSync(dirpath + '/' + a, 'utf-8');
      html = html.replace('F', m);
      fs.writeFileSync(dirpath + '/' + a, html);
      let url = `https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.at}`
      let img = await puppeteer.screenshot("123", {
        tplFile: _path + '/plugins/y-tian-plugin/resources/zhuan.html',
        imgtype: 'png',
        a: url,
        fullPage: true,

      });
      e.reply(img)

      html = fs.readFileSync(dirpath + '/' + a, 'utf-8')
      html = html.replace(m, 'F');
      fs.writeFileSync(dirpath + '/' + a, html)
    } else { e.reply("请回复图片发送或者艾特一个人") }
  }
}