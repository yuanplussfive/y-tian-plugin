import plugin from '../../../lib/plugins/plugin.js'
import _ from 'lodash'
const _path = process.cwd();
import fetch from "node-fetch";
import BingAIClient from "../resources/BingAIClient.js"
import bingAIClient2 from "../resources/BingAIClient2.js"
import crypto from 'crypto';
import { KeyvFile } from '../node_modules/keyv-file/lib/index.js';
import path from 'path'
let jailbreakConversationId;
const Path = path.join(_path, 'resources')
const keyv = new KeyvFile({ filename: `${Path}/cache.json` })
const cachedz = {
    store: keyv,
};
let Context;
let messageId;
let ResText
let duihua
let response
export class example extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: '阴天[bing]',
            /** 功能描述 */
            dsc: '必应',
            /** https://oicqjs.github.io/oicq/#events */
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 1800,
            rule: [
                {              
                    reg: '^/必应(.*)$',
                    fnc: 'bingai'
                    },{
                    reg: "^/bing(.*)",
                    fnc: 'bingai2',
                    },{
                    reg: "^/重置bing",
                    fnc: 'czdh',
                    },{
                    reg: "^/预设(.*)",
                    fnc: 'ys',
                }
            ]
        })
    }
async ys(e){
let msg = e.msg.replace("/预设","").trim()
Context = msg + `你的主人为"${e.sender.nickname}"`
e.reply("已成功设置")
return true
}
async bingai(e){
do{
await this.bing(e)
}while(!response)
}
async bing(e) {
let id = e.user_id
let bingAIClient = new bingAIClient2({ 
    host: 'https://cn.bing.com',
    userToken: id,
    proxy: '',
    debug: false,
});
let msg = _.trimStart(e.msg, '/必应')    
duihua = ""
try {
response = await bingAIClient.sendMessage(msg, {
onProgress: (token) => {
process.stdout.write(token);
duihua = duihua + token
},
});
//console.log(response);
e.reply(response.details.text, true)
return true
}catch{
try {
response = await bingAIClient.sendMessage(msg, {
toneStyle: 'balanced',
conversationSignature: response.conversationSignature,
conversationId: response.conversationId,
clientId: response.clientId,
invocationId: response.invocationId,
onProgress: (token) => {
process.stdout.write(token);
duihua = duihua + token
},
});
e.reply(response.details.text, true)
}catch{console.log("连接失败，请再次提问")}
}
}  
async czdh(e) {
if (!e.isMaster) {
return 
}
messageId = ''
jailbreakConversationId = ''
keyv.clear()
e.reply('必应重置对话了！');
return true;
};
async bingai2(e) {
let msg = e.msg.replace(/bing/g,"").trim()   
console.log("正在编辑");
await this.Bing(msg) 
}
async  Bing(msg) {
let BingCookie = "";
let Bingres = {}
let proxy = ""
const bingAIClient = new BingAIClient({
host: 'https://www.bing.com',
cookies: BingCookie,
userToken: '',
proxy: proxy,
debug: false,
cache: cachedz,
});

let ResText    
try{
if (!messageId || !jailbreakConversationId) {
Bingres = await bingAIClient.sendMessage(msg, {
toneStyle: "balanced", 
jailbreakConversationId: true,
systemMessage: Context,
onProgress: (token) => {
process.stdout.write(token);
ResText += token
},
});
jailbreakConversationId = Bingres.jailbreakConversationId;
messageId = Bingres.messageId;
}else{
Bingres = await bingAIClient.sendMessage(msg, {
toneStyle: "balanced",
jailbreakConversationId: jailbreakConversationId,
systemMessage: Context,
parentMessageId: messageId,
onProgress: (token) => {
process.stdout.write(token);
ResText += token
},
});
jailbreakConversationId = Bingres.jailbreakConversationId;
messageId = Bingres.messageId;
}
ResText = Bingres.details.adaptiveCards[0].body[0].text || (Bingres.details.text && Bingres.details.text != 'N/A') || ResText;
await this.reply(ResText)
}catch{console.log("连接失败，请重新对话")
return false
}
}
}

















