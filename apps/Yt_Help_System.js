import puppeteer from '../../lib/puppeteer/puppeteer.js'
import fetch from "node-fetch"
const _path = process.cwd()
import fs from 'fs'
let src = _path + "/plugins/y-tian-plugin/resources/css/jty.OTF"
let dirpath = _path + '/data/阴天预设'
if(!fs.existsSync(dirpath)){
fs.mkdirSync(dirpath)    
}

export class example extends plugin {
  constructor() {
    super({
      name: '阴天[分类帮助]',
      dsc: '',
      event: 'message',
      priority: 1,
      rule: [
        {
          reg: "^(/|#)?(阴天)?(帮助|help)$",
          fnc: 'help'
        },
        {
          reg: "^(/|#)?娱乐帮助$",
          fnc: 'joy'
        },
        {
          reg: "^(/|#)?游戏帮助$",
          fnc: 'game'
        },
        {
          reg: "^(/|#)?群管帮助$",
          fnc: 'group'
        },
        {
          reg: "^(/|#)?(AI|Ai|ai)免费外站帮助$",
          fnc: 'freeai'
        },
        {
          reg: "^(/|#)?(阴天|免费)(绘图|画图)帮助$",
          fnc: 'drawing'
        },
        {
          reg: "^(/|#)?slack帮助$",
          fnc: 'slack'
        },
        {
          reg: "^(/|#)?(ai|AI|Ai)专业版帮助$",
          fnc: 'chatgpt'
        },
        {
          reg: "^#chat模型大全$",
          fnc: "professor"
        },
        {
          reg: "^(/|#)god模型大全$",
          fnc: "godgpt"
        },
        {
          reg: "^(/|#)附加模型大全$",
          fnc: "others"
        },
        {
          reg: "^(/|#)(AI|Ai|ai)附加版帮助$",
          fnc: "otherhelp"
        },
        {
          reg: "^(/|#)图视帮助$",
          fnc: "vision"
        },
        {
          reg: "^(/|#)(AI|Ai|ai)免费国产帮助$",
          fnc: "ChineseAI"
       },
       {
          reg: "^(/|#)(AI|Ai|ai)交互帮助$",
          fnc: "workai"
       },
       {
          reg: "^/sess帮助$",
          fnc: "sessai"
       },
       {
          reg: "^(/|#)(AI|Ai|ai)总帮助$",
          fnc: "totalai"
       }
      ]
    })
  }

async help(e) {
    const src2 = _path + "/plugins/y-tian-plugin/resources/css/NZBZ.ttf"
    const data2 = {
      tplFile: _path + "/plugins/y-tian-plugin/resources/html/help2.html",
      src2: src2,
      src: src
    };
    const img = await puppeteer.screenshot("777", {
      ...data2,
    });
    e.reply(img);
  }

async totalai(e){
    const img = await screen(19, puppeteer)
    e.reply(img)
}

async sessai(e){
    const img = await screen(18, puppeteer)
    e.reply(img)
}

async workai(e){
    const img = await screen(17, puppeteer)
    e.reply(img)
}

async otherhelp(e){
    const img = await screen(16, puppeteer)
    e.reply(img)
}

async others(e){
    const img = await screen(14, puppeteer)
    e.reply(img)
}

async ChineseAI(e){
    const img = await screen(11, puppeteer)
    e.reply(img)
}

async vision(e){
    const img = await screen(10, puppeteer)
    e.reply(img)
}

async godgpt(e){
    const img = await screen(9, puppeteer)
    e.reply(img)
}

async professor(e){
    const img = await screen(8, puppeteer)
    e.reply(img)
}

async chatgpt(e) {
    const img = await screen(7, puppeteer)
    e.reply(img)
  }

async slack(e) {
    const img = await screen(6, puppeteer)
    e.reply(img)
  }

async drawing(e) {
   const img = await screen(5, puppeteer)
    e.reply(img)
  }

async freeai(e) {
    const img = await screen(4, puppeteer)
    e.reply(img)
  }

async group(e) {
   const img = await screen(3, puppeteer)
    e.reply(img)
  }

async joy(e) {
    const img = await screen(1, puppeteer)
    e.reply(img)
  }

async game(e) {
    const img = await screen(2, puppeteer)
    e.reply(img)
  }
}

async function screen(num, puppeteer){
  const data = {
       tplFile: _path + `/plugins/y-tian-plugin/YTfreeai/config/html/help${num}.html`,
       src:src
      }
      const img = await puppeteer.screenshot('777', {
       ...data,
     })
  return img
}