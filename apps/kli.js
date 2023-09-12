//滚动式查看网页，方法:看网页xxxxx
//因为是爬虫，所以第一次会有点慢,termux用户请勿使用(看网页)
//食物卡路里,例如:卡路里香蕉
import plugin from '../../../lib/plugins/plugin.js'
import puppeteer from 'puppeteer'
import fetch from 'node-fetch'
export class example extends plugin {
  constructor() {
    super({
      name: '阴天[看网页]',
      dsc: 'xiao',
      event: 'message',
      priority: 50,
      rule: [
        {
          reg: '^#?看网页(.*)$',
          fnc: 'ks'
        }, {
          reg: '^#?卡路里(.*)$',
          fnc: 'kll'
        }
      ]
    })
  }
  async kll(e) {
    let gs = e.msg.replace(/#?卡路里/g, "").trim();
    let url = `http://apis.liaomengyun.top/API/calorie.php?food=${gs}&page=1`
    let res = await fetch(url)
    res = await res.json()
    let food2 = await res.data[2].food
    let calories2 = await res.data[2].calories
    let food = await res.data[1].food
    let calories = await res.data[1].calories
    let food3 = await res.data[3].food
    let calories3 = await res.data[3].calories
    let food0 = await res.data[0].food
    let calories0 = await res.data[0].calories
    let msg = ['品种1:' + food + "\n" + '卡路里:' + calories + "\n" + '品种2:' + food0 + "\n" + '卡路里:' + calories0 + "\n" + '品种3:' + food2 + "\n" + '卡路里:' + calories2 + "\n" + '品种4:' + food3 + "\n" + '卡路里:' + calories3]
    e.reply(msg)
  }
  async ks(e) {
    let gs = e.msg.replace(/#?看网页/g, "").trim();
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto(`${gs}`);
    await page.setViewport({
      width: 1200,
      height: 800
    });
    await page.screenshot({
      path: 'resources/1.png',
      fullPage: true
    });

    await browser.close();
    await e.reply([segment.image('resources/1.png')])

  }
}