import plugin from '../../../lib/plugins/plugin.js'
import _ from 'lodash'
import fetch from "node-fetch";
import BingAIClient from './resources/BingAIClient.js'
let duihua
let response
let bingAIClient = new BingAIClient({
    
    host: 'https://cn.bing.com',
  
    userToken: '',

    proxy: '',
   
    debug: false,
});
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
}while(!response.details.text)
}
async bing(e) {
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
}catch{}
}  
}














