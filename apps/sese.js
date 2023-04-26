//方法:/动漫图，/动漫图组，/gif，可在下方开关r18
import plugin from '../../../lib/plugins/plugin.js'
import _ from 'lodash'
import fetch from "node-fetch";
import cfg from '../../../lib/config/config.js';
import {getSegment} from "../model/segment.js"
    const segment = await getSegment()
let key = "false";//是否开启r18,false否，true是
export class a extends plugin {
    constructor () {
      super({
        /** 功能名称 */
        name: 'dm',
        /** 功能描述 */
        dsc: 'dm',
        /** https://oicqjs.github.io/oicq/#events */
        event: 'message',
        /** 优先级，数字越小等级越高 */
        priority: 1,
        rule: [
         {
            /** 命令正则匹配 */
            reg: "^/动漫图组$", //匹配消息正则,命令正则
            /** 执行方法 */
            fnc: 'tt'
},{
 /** 命令正则匹配 */
            reg: "^/动漫图$", //匹配消息正则,命令正则
            /** 执行方法 */
            fnc: 'ttt'
},{
    /** 命令正则匹配 */
            reg: "^/gif$", //匹配消息正则,命令正则
            /** 执行方法 */
            fnc: 'gg'       
                  }
        ]
      })
    }
async ttt(e){
let url = `https://api.waifu.im/search/?is_nsfw=${key}`
let res = await fetch(url)
res = await res.json()
let url2 = await res.images[0].url
console.log(url2)
e.reply([segment.image(url2)])
}
async gg(e){
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
method:"get",
headers:{
'Accept-Version':'v5',
"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/111.0.1661.54",
cookie:"ageverif=True"
},
})
a = await a.text()
let b = a.match(/cdn.waifu.im(.*?)"/g)
let num = b.length
b = `${b}`
let c = b.replace(/"/g,"").replace(/cdn.waifu.im/g,"https://cdn.waifu.im")
c = `${c}`
let g = c.split(",")
for(let t = 0;t<=num-1;t++){
y.push(segment.image(g[t]))
}
let data_msg = []
data_msg.push({
message: y,
          nickname: 'r18',
          user_id: cfg.masterQQ[0]
})
let brief = ""
let title = "历史记录"
let summary = ``
let ForwardMsg;
try{
      ForwardMsg = await e.group.makeForwardMsg(data_msg);}catch (err){e.reply('该隐藏功能只支持群聊');return}
    let regExp = /<summary color=\"#808080\" size=\"26\">查看(\d+)条转发消息<\/summary>/g;
    let res2 = regExp.exec(ForwardMsg.data);
    let pcs = res2[1];
    ForwardMsg.data = ForwardMsg.data.replace(/<msg brief="\[聊天记录\]"/g, `<msg brief=\"[${brief ? brief : "聊天记录"}]\"`)
      .replace(/<title color=\"#000000\" size=\"34\">转发的聊天记录<\/title>/g, `<title color="#000000" size="34">${title ? title : "群聊的聊天记录"}</title>`)
      .replace(/<summary color=\"#808080\" size=\"26\">查看(\d+)条转发消息<\/summary>/g, `<summary color="#808080" size="26">${summary ? summary : `查看${pcs}条转发消息`}</summary>`);
e.reply(ForwardMsg)
}
async accept () {
let old_reply = this.e.reply;
this.e.reply = async function(msgs, quote, data){
if(!Array.isArray(msgs)) msgs = [msgs];
for(let msg of msgs){
if(msg && msg?.type == 'xml' && msg?.data){
msg.data = msg.data.replace(/^<\?xml.*version=.*?>/g,'<?xml version="1.0" encoding="utf-8" ?>');
}
}
let result = await old_reply(msgs,quote,data);
if(!result || !result.message_id){
let MsgList = [{
					message: msgs,
					nickname: Bot.nickname,
					user_id: Bot.uin
				}];
let forwardMsg = await Bot.makeForwardMsg(MsgList);			
				forwardMsg.data = forwardMsg.data
				.replace('<?xml version="1.0" encoding="utf-8"?>','<?xml version="1.0" encoding="utf-8" ?>')
				.replace(/\n/g, '')
				.replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
				.replace(/___+/, '<title color="#777777" size="26">请点击查看内容</title>');
				msgs = forwardMsg;
				result = await old_reply(msgs,quote,data);
			}
			return result;
		}
	}
}



























