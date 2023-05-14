import plugin from '../../../lib/plugins/plugin.js'
import _ from 'lodash'
const _path = process.cwd();
import fetch from "node-fetch";
import BingAIClient from "../resources/BingAIClient.js"
let duihua
let response
export class example extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: '阴天[bing]',
            /** 功能描述 */
            dsc: 'bing',
            /** https://oicqjs.github.io/oicq/#events */
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 1800,
            rule: [
                {
                 
                    /** 命令正则匹配 */
                    reg: '^/必应(.*)$', //匹配消息正则,命令正则
                    /** 执行方法 */
                    fnc: 'bingai'
                }

            ]
        })
    }
async bingai(e){
do{
await this.bing(e)
}while(!response)
}
async bing(e) {
let id = e.user_id
let bingAIClient = new BingAIClient({ 
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
}














