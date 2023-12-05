import puppeteer from '../../../lib/puppeteer/puppeteer.js'
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
          reg: "^(/|#)?(AI|Ai|ai)免费版帮助$",
          fnc: 'freeai'
       },{
          reg: "^(/|#)?(阴天|免费)(绘图|画图)帮助$",
          fnc: 'drawing'
       },{
          reg: "^(/|#)?slack帮助$",
          fnc: 'slack'
       },{
          reg: "^(/|#)?(ai|AI|Ai)专业版帮助$",
          fnc: 'chatgpt'
       },{
          reg: "^#chat模型大全$",
          fnc: "professor"
       },{
          reg: "^(/|#)god模型大全$",
          fnc: "godgpt"
       },{
          reg: "^(/|#)附加模型大全$",
          fnc: "others"
       },{
          reg: "^(/|#)(AI|Ai|ai)附加版帮助$",
          fnc: "otherhelp"
       },{
          reg: "^(/|#)图视帮助$",
          fnc: "vision"
       },{
          reg: "^(/|#)(AI|Ai|ai)国产版帮助$",
          fnc: "ChineseAI"
      },{
          reg: "^(/|#)(AI|Ai|ai)交互帮助$",
          fnc: "workai"
      },{
          reg: "^/sess帮助$",
          fnc: "sessai"
      },{
          reg: "^(/|#)(AI|Ai|ai)总帮助$",
          fnc: "totalai"
       }
      ]
    })
  }
async totalai(e){
let data = {
      tplFile: _path + '/plugins/y-tian-plugin/YTfreeai/config/html/help19.html',
      src:src
    }
    let img = await puppeteer.screenshot('777', {
      ...data,
    })
    e.reply(img)
}
async sessai(e){
let data = {
      tplFile: _path + '/plugins/y-tian-plugin/YTfreeai/config/html/help18.html',
      src:src
    }
    let img = await puppeteer.screenshot('777', {
      ...data,
    })
    e.reply(img)
}
async workai(e){
let data = {
      tplFile: _path + '/plugins/y-tian-plugin/YTfreeai/config/html/help17.html',
      src:src
    }
    let img = await puppeteer.screenshot('777', {
      ...data,
    })
    e.reply(img)
}
async otherhelp(e){
let data = {
      tplFile: _path + '/plugins/y-tian-plugin/YTfreeai/config/html/help16.html',
      src:src
    }
    let img = await puppeteer.screenshot('777', {
      ...data,
    })
    e.reply(img)
}
async others(e){
let data = {
      tplFile: _path + '/plugins/y-tian-plugin/YTfreeai/config/html/help14.html',
      src:src
    }
    let img = await puppeteer.screenshot('777', {
      ...data,
    })
    e.reply(img)
}
async ChineseAI(e){
let data = {
      tplFile: _path + '/plugins/y-tian-plugin/YTfreeai/config/html/help11.html',
      src:src
    }
    let img = await puppeteer.screenshot('777', {
      ...data,
    })
    e.reply(img)
}
async vision(e){
let data = {
      tplFile: _path + '/plugins/y-tian-plugin/YTfreeai/config/html/help10.html',
      src:src
    }
    let img = await puppeteer.screenshot('777', {
      ...data,
    })
    e.reply(img)
}
async godgpt(e){
let data = {
      tplFile: _path + '/plugins/y-tian-plugin/YTfreeai/config/html/help9.html',
      src:src
    }
    let img = await puppeteer.screenshot('777', {
      ...data,
    })
    e.reply(img)
}
async professor(e){
let data = {
      tplFile: _path +  '/plugins/y-tian-plugin/YTfreeai/config/html/help8.html',
      src:src
    }
    let img = await puppeteer.screenshot('777', {
      ...data,
    })
    e.reply(img)
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



















