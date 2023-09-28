import fetch from "node-fetch"
import crypto from 'crypto'
import querystring from 'querystring'
import puppeteer from "puppeteer"
export class example extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: '测试',
      /** 功能描述 */
      dsc: '',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 2000,
      rule: [
        {
          reg: "^/ask(.*)",
          fnc: 'help'
        }
      ]
    })
  }
async help(e){
const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
let msg = e.msg.replace(/\/ask/g,"").trim()
await page.goto("https://chatai.mixerbox.com/chat");
await page.waitForSelector('.MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeMedium.MuiButton-containedSizeMedium.css-1quk0lx'); // 等待输入框加载完成

// 检查元素是否可见和可点击
await page.waitForFunction(() => {
  const element = document.querySelector('.MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeMedium.MuiButton-containedSizeMedium.css-1quk0lx');
  return element && element.offsetParent !== null;
});

await page.click('.MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeMedium.MuiButton-containedSizeMedium.css-1quk0lx');

await page.waitForSelector('.MuiFormControl-root.MuiFormControl-fullWidth.MuiTextField-root.css-3e2bbw'); // 等待输入框加载完成
await page.click('.MuiFormControl-root.MuiFormControl-fullWidth.MuiTextField-root.css-3e2bbw');
await page.type('.MuiFormControl-root.MuiFormControl-fullWidth.MuiTextField-root.css-3e2bbw', msg);
await page.waitForSelector('.MuiButtonBase-root.MuiIconButton-root.MuiIconButton-sizeMedium.css-xuhxv4'); // 等待输入框加载完成

// 检查元素是否可见和可点击
await page.waitForFunction(() => {
  const element = document.querySelector('.MuiButtonBase-root.MuiIconButton-root.MuiIconButton-sizeMedium.css-xuhxv4');
  return element && element.offsetParent !== null;
});

await page.click('.MuiButtonBase-root.MuiIconButton-root.MuiIconButton-sizeMedium.css-xuhxv4');

// 设置页面超时时间为60秒
await page.waitForTimeout(60000);

let divContent = await page.$eval('.MuiBox-root.css-a4b0zq', div => div.textContent);
console.log(divContent);
await browser.close()
let m = `${divContent}`;
let fg = 
await fetch("https://chat.aivvm.com/api/chat", {
  "method": "POST",
  "headers": {
    "content-type": "application/json",
    "Referer": "https://chat.aivvm.com/zh"
  },
  "body": JSON.stringify({
"model":{
"id":"gpt-4-32k-0613",
"name":"GPT-4-32K-0613"
},
"messages": [{ role: "user", content: m}],
"key": "",
"prompt":"You are a translation model, and you will directly translate all the content into Simplified Chinese without any additional text.Traditional Chinese characters should also be converted into simplified Chinese characters",
"temperature":0.9
})

});
let res = await fg.text()
console.log(res)
e.reply(res)
}}






















