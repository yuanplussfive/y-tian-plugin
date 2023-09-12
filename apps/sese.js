//方法:/动漫图，/动漫图组，/gif，可在下方开关r18
import plugin from '../../../lib/plugins/plugin.js'
import common from '../../../lib/common/common.js'
import _ from 'lodash'
import fetch from "node-fetch";
import cfg from '../../../lib/config/config.js';
let key = "false";//是否开启r18,false否，true是
export class a extends plugin {
  constructor() {
    super({
      name: '阴天[sese]',
      dsc: 'dm',
      event: 'message',
      priority: 1,
      rule: [
        {
          reg: "^/动漫图组$",
          fnc: 'tt'
        }, {
          reg: "^/动漫图$",
          fnc: 'ttt'
        }, {
          reg: "^/gif$",
          fnc: 'gg'
        }
      ]
    })
  }
  async ttt(e) {
    let url = `https://api.waifu.im/search/?is_nsfw=${key}`
    let res = await fetch(url)
    res = await res.json()
    let url2 = await res.images[0].url
    console.log(url2)
    e.reply([segment.image(url2)])
  }
  async gg(e) {
    let url = `https://api.waifu.im/search/?is_nsfw=${key}&gif=true`
    let res = await fetch(url)
    res = await res.json()
    let url2 = await res.images[0].url
    console.log(url2)
    e.reply([segment.image(url2)])
  }
  async tt(e) {
    let y = []
    let url = `https://www.waifu.im/search?is_nsfw=${key}`
    let a = await fetch(url,
      {
        method: "get",
        headers: {
          'Accept-Version': 'v5',
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/111.0.1661.54",
          cookie: "ageverif=True"
        },
      })
    a = await a.text()
    let b = a.match(/cdn.waifu.im(.*?)"/g)
    let num = b.length
    b = `${b}`
    let c = b.replace(/"/g, "").replace(/cdn.waifu.im/g, "https://cdn.waifu.im")
    c = `${c}`
    let g = c.split(",")
    for (let t = 0; t <= num - 1; t++) {
      y.push(segment.image(g[t]))
    }
    let data_msg = []
    data_msg.push(y)
    let title = "历史记录"
    let ForwardMsg = await common.makeForwardMsg(this.e, data_msg, title);
    this.e.reply(ForwardMsg)
  }
  async accept() {
    let old_reply = this.e.reply;
    this.e.reply = async function (msgs, quote, data) {
      if (!Array.isArray(msgs)) msgs = [msgs];
      for (let msg of msgs) {
        if (msg && msg?.type == 'xml' && msg?.data) {
          msg.data = msg.data.replace(/^<\?xml.*version=.*?>/g, '<?xml version="1.0" encoding="utf-8" ?>');
        }
      }
      let result = await old_reply(msgs, quote, data);
      if (!result || !result.message_id) {
        let MsgList = []
        MsgList.push(msgs)
        let forwardMsg = await common.makeForwardMsg(this.e, MsgList, '喵?');
        msgs = forwardMsg;
        result = await old_reply(msgs, quote, data);
      }
      return result;
    }
  }
}



























