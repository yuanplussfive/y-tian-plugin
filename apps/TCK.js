
import puppeteer from 'puppeteer'


export class ChatPlugin extends plugin {
   constructor() {
     super({
       name: '阴天[蒸]',
       dsc: 'sgs',
       event: 'message',
       priority: 1,
       rule: [{
         reg: "^#武将查询(.*)$",
         fnc: 'wj'
       },{
         reg: "^#随机一蒸$",
         fnc: 'sp'
       }],
     });
 
    
   }
 
   async wj(e) {
       
       let heroName
let heroUrl
let browser = await puppeteer.launch({ headless: true , args:['--no-sandbox','--disable-setuid-sandbox']});
let page = await browser.newPage();
await page.goto('https://www.sanguosha.cn/pc/hero-list.html',{ waitUntil: 'networkidle2'});

let heroList = await page.evaluate(function () {
   let heroes = {}; 
let heroLinks = document.querySelectorAll('ul.general-list li a');
   heroLinks.forEach(function (link) {
       heroName = link.innerText;
       heroUrl = link.href;
       heroes[heroName] = heroUrl;
   });
   return { list: heroes };
});

await browser.close(); 
 let msg = e.msg.replace("#武将查询","").trim()
 if(msg in heroList.list){e.reply(heroList.list[msg])}else{
   e.reply(`未找到武将：${msg},请检查输入的名字是否正确后重新查询。`,true)
 }
}
async sp(e){
 let browser = await puppeteer.launch({ headless: true , args:['--no-sandbox','--disable-setuid-sandbox']});
 let page = await browser.newPage();
 
 await page.goto('https://space.bilibili.com/587050283/channel/seriesdetail?sid=268447', {
   waitUntil: 'networkidle2'
 });
 let pagerItems = await page.$$('.be-pager-item');
let idx = Math.floor(Math.random() * pagerItems.length);
 let item;
 do {
   item = pagerItems[idx];
   ++idx;
   if (idx >= pagerItems.length) idx = 0; 
 } while (item.title === '上一页' || item.title === '下一页');
   
 await item.click();
 await page.waitForTimeout(3000);

 let videoList = await page.$('.video-list');
 let videoItems = await videoList.$$('li');

 let randomIndex = Math.floor(Math.random() * videoItems.length);
 let randomItem = videoItems[randomIndex];
 
 let href = await randomItem.$eval('a', a => a.href);
 let h1Text = await randomItem.$eval('a.title',a => a.innerText);
 e.reply(h1Text+"\n"+`【${href}】`)
 await page.goto('https://www.yiuios.com/tool/bilibili', {
   waitUntil: 'networkidle2'
 });
let input = await page.$('input[type="text"]');
 await input.click();
 await page.keyboard.type(href);
 await page.click('.button-start', {
   waitUntil: 'networkidle2'
 });
 await page.waitForTimeout(3000);
 let i = await page.waitForSelector('.dyvideo.full.absolute.left.top')
   .then(() => page.$eval('.dyvideo.full.absolute.left.top', video => video.getAttribute('src')));


 await browser.close();
 e.reply(segment.video(i))
}



}