import fs from 'fs';
import puppeteer from'puppeteer';
import _ from 'lodash'
const _path = process.cwd()
let dirpath = _path + '/resources/'
let images = [];
export class online extends plugin {
    constructor() {
        super({
            name: '阴天互联',
            dsc: '图片',
            event: 'message',
            priority: 1145,
            rule: [
               {
                    reg: "^#阴天互联",
                    fnc: 'int',
                    }
                    
            ]
        })
    }
async int(e){
    let u1 = "http://121.36.62.10:3000/"
    let res = await fetch(u1)
    res = await res.text()
    res = JSON.parse(res)
    for(let key1 in res){
        images.push(`https://q.qlogo.cn/headimg_dl?dst_uin=${res[key1].data}&spec=100`)
     }
     let html = await generateHTML(images);
  await captureScreenshot(html,e);
  images = [];
}
}
async function generateHTML(images) {
    let html = '<html><head><style>body {margin: 0; padding: 0;} .image {position: fixed; border-radius: 50%; border: 1px solid black;} .footer {position: fixed; bottom: 0; width: 100%; height: 50px; background-color: black; color: white; display: flex; align-items: center; justify-content: center;}</style></head><body>';
    for (let i = 0; i < images.length; i++) {
      let imageSrc = images[i];
      let size = Math.floor(Math.random() * 100) + 100;
      let left = Math.floor(Math.random() * 80);
      let top = Math.floor(Math.random() * 80);
      html += `<img src="${imageSrc}" class="image" style="width: ${size}px; height: ${size}px; left: ${left}%; top: ${top}%; border: 1px solid black;" />`;
    }
    html += '<div class="footer">W e l c o m e&nbsp; &nbsp;T o&nbsp; &nbsp;O u r&nbsp; &nbsp;Y - T i a n - I n t e r n e t</div>';
    html += '</body></html>';
    return html;
  }

async function captureScreenshot(html,e) {
    let browser = await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
    let page = await browser.newPage();
  let tempFilePath = dirpath+'/temp.html';
  fs.writeFileSync(tempFilePath, html);
  await page.goto(`file://${tempFilePath}`);
  let image = await page.screenshot({ fullPage: true ,quality: 100, type: 'jpeg'});

  await browser.close();
e.reply(segment.image(image))
  fs.unlinkSync(tempFilePath);
}
