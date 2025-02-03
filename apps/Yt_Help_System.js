import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import common from '../../../lib/common/common.js'
const _path = process.cwd()
import fs from 'fs'
let src = _path + "/plugins/y-tian-plugin/resources/css/jty.OTF"
let dirpath = _path + '/data/阴天预设'
if (!fs.existsSync(dirpath)) {
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
      help_css: _path + "/plugins/y-tian-plugin/resources/css/help.css",
      all_min_css: _path + "/plugins/y-tian-plugin/resources/css/fontawesome-free-6.6.0-web/css/all.min.css",
      src: src
    };
    const img = await puppeteer.screenshot("777", {
      ...data2,
    });
    e.reply(img);
  }

  async totalai(e) {
    const img = await screen(19, puppeteer)
    e.reply(img)
  }

  async sessai(e) {
    const img = await screen(18, puppeteer)
    e.reply(img)
  }

  async workai(e) {
    const img = await screen(17, puppeteer)
    e.reply(img)
  }

  async otherhelp(e) {
    const img = await screen(16, puppeteer)
    e.reply(img)
  }

  async others(e) {
    const img_1 = await screen(14, puppeteer)
    const img_2 = await screen(20, puppeteer)
    const img_3 = await screen(21, puppeteer)
    const img_4 = await screen(25, puppeteer)
    const img_5 = await screen(28, puppeteer)
    const img_6 = await screen(31, puppeteer)
    const forwardMsg = [img_1, img_2, img_3, img_4, img_5, img_6]
    const JsonPart = await common.makeForwardMsg(e, forwardMsg, '附加模型大全');
    e.reply(JsonPart)
  }

  async ChineseAI(e) {
    const img = await screen(11, puppeteer)
    e.reply(img)
  }

  async vision(e) {
    const img = await screen(10, puppeteer)
    e.reply(img)
  }

  async professor(e) {
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
    const img1 = await screen(4, puppeteer)
    const img2 = await screen(29, puppeteer)
    const img3 = await screen(30, puppeteer)
    const forwardMsg = [img1, img2, img3];
    const JsonPart = await common.makeForwardMsg(e, forwardMsg, '免费模型大全');
    e.reply(JsonPart)
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

async function screen(num, puppeteer) {
  const data = {
    quality: 100,
    imgType: 'jpeg',
    tplFile: _path + `/plugins/y-tian-plugin/YTfreeai/config/html/help${num}.html`,
    all_min_css: _path + "/plugins/y-tian-plugin/resources/css/fontawesome-free-6.6.0-web/css/all.min.css",
    all_css_src: _path + "/plugins/y-tian-plugin/resources/css/all_help.css",
    chat_css_src: _path + "/plugins/y-tian-plugin/resources/css/chat_help.css",
    other_css_src: _path + "/plugins/y-tian-plugin/resources/css/other_help.css",
    god_css_src: _path + "/plugins/y-tian-plugin/resources/css/god_help.css",
    src: _path + "/plugins/y-tian-plugin/resources/css/jty.OTF",
    ClaudeLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/claude.jpeg",
    ChatGlmLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/chatglm.png",
    QianFanLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/qianfan.png",
    GrokLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/grok.jpg",
    GeminiLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/gemini.jpg",
    QwenLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/qwen.png",
    LingLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/01.jpg",
    SparkLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/spark.png",
    DeepSeekLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/deepseek.jpeg",
    ChatGptLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/chatgpt.jpg",
    LlamaLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/llama.jpg",
    DoubaoLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/doubao.png",
    HunyuanLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/hunyuan.png",
    KimiLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/kimi.jpeg",
    MinimaxLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/hailuo.png",
    StepLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/hailuo.png",
    MitaLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/mita.jpg",
  }
  const img = await puppeteer.screenshot('777', {
    ...data,
  })
  return img
}