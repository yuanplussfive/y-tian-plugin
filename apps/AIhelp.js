import puppeteer from '../../../lib/puppeteer/puppeteer.js'
const _path = process.cwd()

export class example extends plugin {
  constructor() {
    super({
      name: '阴天[模型帮助]',
      dsc: '',

      event: 'message',
      priority: 4000,
      rule: [
        {
          reg: "^#阴天模型帮助",
          fnc: 'leave'
        }
      ]
    })
  }
  async leave(e) {
    let src = _path + '/plugins/y-tian-plugin/resources/css/jty.OTF'
    let data = {
      tplFile: _path + '/plugins/y-tian-plugin/resources/html/AI.html',
      src: src,

    }
    let img = await puppeteer.screenshot('777', {
      ...data,
    })
    e.reply(img)
  }
}