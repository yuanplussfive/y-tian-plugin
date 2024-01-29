import { dependencies } from "../YTdependence/dependencies.js";
const { request, axios, _path, path, cheerio, common } = dependencies
import puppeteer from "puppeteer"
function isURL(str) {
  const pattern = new RegExp('^(https?:\\/\\/)?'+
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+
    '((\\d{1,3}\\.){3}\\d{1,3}))'+
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+
    '(\\?[;&a-z\\d%_.~+=-]*)?'+
    '(\\#[-a-z\\d_]*)?$','i');
  return !!pattern.test(str);
}

export class example extends plugin {
  constructor() {
    super({
      name: '阴天[爬图]',
      dsc: '',
      event: 'message',
      priority: 2000,
      rule: [
        {
          reg: "^#爬图(.*)",
          fnc: 'grab'
        },
        {
          reg: "^#爬取(.*)",
          fnc: 'grabs'
       }
      ]
    })
  }

async grab(e) {
   const url = e.msg.replace(/#爬图/g, "").trim()
   if (!isURL(url)) {
    e.reply("请输入完整有效的链接!")
    return false
   }
   const imgUrls = await downloadImages(url);
   if (imgUrls.length == 0) {
   e.reply("未爬取到任何有效图片!")
   }
   const forwardMsg = await common.makeForwardMsg(e, imgUrls, '诶嘿，图来喽~');
   await e.reply(forwardMsg);    
} 

async grabs(e) {
  const url = e.msg.replace(/#爬取/g, "").trim();
  if (!isURL(url)) {
    e.reply("请输入完整有效的链接!");
    return false;
  }
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url);
    const imgUrls = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.map(img => segment.image(img.src));
    });
    await browser.close();
    const forwardMsg = await common.makeForwardMsg(e, imgUrls, '诶嘿，图来喽~');
    await e.reply(forwardMsg);
  } catch (error) {
    console.error(error);
    e.reply("抓取过程中出现错误，请稍后再试！");
  }
 }
}

async function downloadImages(url) {
  const imageLinks = [];
  await axios.get(url).then(response => {
    const $ = cheerio.load(response.data);
    $('img').each((i, img) => {
      let imgUrl = $(img).attr('src');
      if (isURL(imgUrl)) {
      imageLinks.push(segment.image(imgUrl));
     }
    });
  }).catch(console.error);
  return imageLinks;
}