import fetch from 'node-fetch'
let cookie = "BDUSS=FFUfkdFMm8yd01IYk4wb1ZyWGJYNnQtWElPOTdPbkdYcndnOWZaazEtZU00QXRsSUFBQUFBJCQAAAAAAQAAAAEAAAA~-2hVNTU116YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIxT5GSMU-RkO"
export class example extends plugin {
  constructor() {
    super({
      name: '阴天[AI集成]',
      dsc: '',
      event: 'message',
      priority: 4000,
      rule: [
        {
          reg: "^小红书生成(.*)",
          fnc: 'help'
        }, {
          reg: "^知乎(.*)",
          fnc: 'zhihu'
        }
      ]
    })
  }
  async zhihu(e) {
    let msg = e.msg.replace(/知乎/g, "").trim()
    let content = await fetch(`https://chat-ws.baidu.com/lg/api/use_stream?body={"app_id":"c02b3d0d10ea4425b1f154eadd490fad","input":"${msg}","input_type":"text"}`, {
      "headers": {
        "accept": "text/event-stream",
        "cookie": cookie,
        "Referer": "https://inspiration.baidu.com/",
      }
    });
    content = await content.text()
    let regex = /"result":"(.*?)"/g;
    regex = content.match(regex)
    regex = `${regex}`
    let result = regex.replace(/\\n/g, "\n").replace(/"result":/g, "").replace(/"/g, "").replace(/,/g, "")
    e.reply(result, true)
  }
  async help(e) {
    let msg = e.msg.replace(/小红书生成/g, "").trim()
    let a = await fetch(`https://chat-ws.baidu.com/lg/api/use_stream?body={"app_id":"a5d33f89c95f46429dd1103a16cf6ad8","input":"${msg}","input_type":"text"}`, {
      "headers": {
        "accept": "text/event-stream",
        "cookie": cookie,
        "Referer": "https://inspiration.baidu.com/"
      }
    });
    a = await a.text()
    console.log(a)
    let regex = /"result":"(.*?)"/g;
    regex = a.match(regex)
    regex = `${regex}`
    let result = regex.replace(/\\n/g, "\n").replace(/"result":/g, "").replace(/"/g, "").replace(/,/g, "")
    e.reply(result)
  }
}