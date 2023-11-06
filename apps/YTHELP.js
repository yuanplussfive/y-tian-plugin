import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import fetch from "node-fetch"
const _path = process.cwd()
let src = _path + "/plugins/y-tian-plugin/resources/css/jty.OTF"
export class example extends plugin {
  constructor() {
    super({
      name: '阴天[分类帮助]',
      dsc: '',
      event: 'message',
      priority: 1,
      rule: [
        {
          reg: "^(/|#)?阴天(帮助|help)$",
          fnc: 'help'
        },{
          reg: "^(/|#)?娱乐帮助$",
          fnc: 'joy'
        },{
          reg: "^(/|#)?游戏帮助$",
          fnc: 'game'
        },{
          reg: "^(/|#)?群管帮助$",
          fnc: 'group'
        },{
          reg: "^(/|#)?免费(AI|Ai|ai)帮助$",
          fnc: 'freeai'
       },{
          reg: "^(/|#)?(阴天|免费)(绘图|画图)帮助$",
          fnc: 'drawing'
       },{
          reg: "^(/|#)?slack帮助$",
          fnc: 'slack'
       },{
          reg: "^(/|#)?(ai|AI)专业版帮助$",
          fnc: 'chatgpt'
       }
      ]
    })
  }
async chatgpt(e) {
    let data = {
      tplFile: _path + '/plugins/y-tian-plugin/YTfreeai/config/html/help7.html',
      src:src
    }
    let img = await puppeteer.screenshot('777', {
      ...data,
    })
    e.reply(img)
  }
async slack(e) {
    let data = {
      tplFile: _path + '/plugins/y-tian-plugin/YTfreeai/config/html/help6.html',
      src:src
    }
    let img = await puppeteer.screenshot('777', {
      ...data,
    })
    e.reply(img)
  }
async drawing(e) {
    let data = {
      tplFile: _path + '/plugins/y-tian-plugin/YTfreeai/config/html/help5.html',
      src:src
    }
    let img = await puppeteer.screenshot('777', {
      ...data,
    })
    e.reply(img)
  }
async freeai(e) {
    let data = {
      tplFile: _path + '/plugins/y-tian-plugin/YTfreeai/config/html/help4.html',
      src:src
    }
    let img = await puppeteer.screenshot('777', {
      ...data,
    })
    e.reply(img)
  }
async help(e) {
    let src2 = _path + "/plugins/y-tian-plugin/resources/css/NZBZ.ttf"
    let data2 = {
      tplFile: _path + "/plugins/y-tian-plugin/resources/html/help2.html",
      src2: src2,
      src: src
    };
    let img = await puppeteer.screenshot("777", {
      ...data2,
    });
    e.reply(img);
  }
async group(e) {
    let data = {
      tplFile: _path + '/plugins/y-tian-plugin/YTfreeai/config/html/help3.html',
      src:src
    }
    let img = await puppeteer.screenshot('777', {
      ...data,
    })
    e.reply(img)
  }
async joy(e) {
    let data = {
      tplFile: _path + '/plugins/y-tian-plugin/YTfreeai/config/html/help1.html',
      src:src
    }
    let img = await puppeteer.screenshot('777', {
      ...data,
    })
    e.reply(img)
  }
async game(e) {
    let data = {
      tplFile: _path + '/plugins/y-tian-plugin/YTfreeai/config/html/help2.html',
      src:src
    }
    let img = await puppeteer.screenshot('777', {
      ...data,
    })
    e.reply(img)
  }
}




















