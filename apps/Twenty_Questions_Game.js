let k;
let mm = {}
let gg = {}
let aa = {}
export class RpgGame extends plugin {
  constructor() {
    super({
      name: '阴天[20qGame]',
      dsc: 'A text based 20q game',
      event: 'message',
      priority: 7000,
      rule: [{
        reg: "^#20q$",
        fnc: "handle"
      }, {
        reg: "^#q(.*)$",
        fnc: "choose"
      }
      ]
    })
  }
  async choose(e) {
    let msg = e.msg.replace(/#q/g, "").trim()
    console.log(aa[e.user_id][msg - 1])
    //console.log(k[msg-1])
    let url = `${aa[e.user_id][msg - 1]}`
    url = url.replace(/"/g, "")
    let c = await fetch(`http://y.20q.net/${url}`, {
      "headers": {
        "content-type": "application/x-www-form-urlencoded",
        "upgrade-insecure-requests": "1",
        "Referer": mm[e.user_id],
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      "method": "get"
    });
    c = await c.text()
    //console.log(c)
    let u = c.match(/<big><b>(.*?)<br><nobr>/g)
    u = `${u}`
    u = u.replace(/<big><b>/g, "").replace(/<br><nobr>/g, "").replace("&nbsp;", "")
    let yy = c.match(/<big><b>(.*?)<br>/g)
    yy = `${yy}`
    yy = yy.replace(/<big><b>/g, "").replace(/<br>/g, "").replace("&nbsp;", "").replace(/<i>/g, "").replace(/<\/i>/g, "")
    if (u == "null") {
      u = yy
    }

    let h = c.match(/<a href="\/(.*)">(.*)<\/a>/g)
    mm[e.user_id] = h[1].replace(/<a href="\//g, "").replace(/>(.*?)<\/a>/g, "").replace(/"/g, "")
    h = `${h[0]}`
    h = h.match(/<a href="\/(.*?)">(.*?)<\/a>/g)
    //console.log(h)
    let y = []
    let op = `${h}`
    op = op.match(/<a href="\/(.*?)"/g)
    let w = []
    for (var i = 0; i < h.length; i++) {
      let gh = `${op[i]}`
      gh = gh.replace('<a href="/', "")
      w.push(gh)
    }
    aa[e.user_id] = w
    //console.log(w)
    for (var i = 0; i < h.length; i++) {
      let jj = `${h[i]}`
      jj = jj.replace(/<a href="\/(.*?)"/g, "").replace(/target="mainFrame">/g, "").replace(/<\/a>/g, "").replace(/&nbsp;/g, "").replace(/>/g, "").replace(/<br>/g, "")
      jj = i + 1 + ":" + jj + "\n"
      y.push(jj)
    }
    //console.log(y)
    y = `${y}`
    y = y.replace(/,/g, "")
    u = u.replace(/<\/b>/g, "").replace(/<\/big>/g, "").replace("类似目标", "").replace(/<\/b>/g, "").replace(/<\/big>/g, "")
    let ms = [u, "\n", `${y}`]
    k = w
    if (y.includes("重新再玩游戏")) {
      ms = [u, "\n", `${y}`, "\n", "请重新发送#20q以开始游戏"]
    }
    e.reply(ms, true)
  }
  async handle(e) {
    let a = await fetch("http://y.20q.net/gsq-zhgb", {
      "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
        "upgrade-insecure-requests": "1",
        "Referer": "http://www.20q.net/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      "body": null,
      "method": "GET"
    });
    a = await a.text()
    //console.log(a)
    let b = a.match(/<\/p><form method=post action="\/(.*)">/g)
    b = `${b}`
    b = b.replace('</p><form method=post action="/', "").replace(/"/g, "").replace(">", "")
    console.log(b)
    mm[e.user_id] = `http://y.20q.net/${b}`
    let c = await fetch(mm[e.user_id], {
      "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
        "cache-control": "max-age=0",
        "content-type": "application/x-www-form-urlencoded",
        "upgrade-insecure-requests": "1",
        "Referer": "http://y.20q.net/gsq-zhgb",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      "body": "sex=77&age=44&ccode=20035&cctkr=CN%2CJP%2CAU&submit=++%E5%BC%80%E5%A7%8B%E6%B8%B8%E6%88%8F++",
      "method": "POST"
    });
    c = await c.text()
    let h = c.match(/<a href="\/(.*)" target="mainFrame">(.*)<\/a>/g)
    console.log(h)
    h = `${h}`
    let g = h.match(/target="mainFrame">(.*?)<\/a>/g)
    let y = []
    for (var i = 0; i < g.length - 1; i++) {
      let jj = `${g[i]}`
      jj = jj.replace(/<\/a>/g, "").replace(/target="mainFrame">/g, "")
      jj = i + 1 + ":" + jj
      y.push(jj + "\n")
    }
    console.log(y)
    k = []
    let j = h.match(/<a href="\/(.*?)" target="mainFrame">/g)
    for (var i = 0; i < j.length; i++) {
      let jj = `${j[i]}`
      jj = jj.replace('<a href="/', "").replace(/"/, "").replace(/target="mainFrame">/g).replace(/undefined/g, "")
      k.push(jj)
    }
    console.log(k)
    aa[e.user_id] = k
    console.log(aa)
    y = `${y}`
    y = y.replace(/,/g, "")
    let ms = ["请你认真思考,你所想象的是:", "\n", `${y}`]
    e.reply(ms, true)
  }
}