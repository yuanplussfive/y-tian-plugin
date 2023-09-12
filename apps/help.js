import puppeteer from '../../../lib/puppeteer/puppeteer.js'
const _path = process.cwd();
let a = _path + "/plugins/y-tian-plugin/resources/css/y-t-help.css"
let html;
let tu2 = _path + "/plugins/y-tian-plugin/background/image/tu2.png"
let cj = _path + "/plugins/y-tian-plugin/background/image/tu1.jpg"
export class example extends plugin {
  constructor() {
    super({
      name: '阴天[help]',
      dsc: '简单开发示例',
      event: 'message',
      priority: 40,
      rule: [
        {
          reg: "^#?阴天?(帮助|help)$",
          fnc: 'help'
        }, {
          reg: '^#?旧?(阴天帮助|阴天help)$',
          fnc: 'hi'
        }
      ]
    })
  }
  async help(e) {
    let src = _path + "/plugins/y-tian-plugin/resources/css/jty.OTF"
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
  async hi(e) {
    let img = await puppeteer.screenshot("66", {
      tplFile: `${_path}/plugins/y-tian-plugin/resources/html/help.html`,
      imgtype: 'png',
      a: a,
      tu: tu2
    });
    await this.reply(img)
  }
}