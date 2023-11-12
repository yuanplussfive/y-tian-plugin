import fetch from 'node-fetch'
import fs from 'fs'
const _path = process.cwd()
import YAML from "yaml"
let dirpath = _path + '/data/YTwenxing'
let history = []
if(!fs.existsSync(dirpath)){
fs.mkdirSync(dirpath)    
}
if(!fs.existsSync(dirpath+"/"+"wenxing.yaml")){
fs.writeFileSync(dirpath+"/"+"wenxing.yaml",'apiKey: "xxxxx"\napiSecret: "xxxxx"',"utf-8")
}
export class example extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: '阴天[文心千帆]',
      /** 功能描述 */
      dsc: '',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: -4,
      rule: [
        {
          reg: "^#文心(.*)",
          fnc: 'help'
      },
      {
          reg: "^#结束文心对话$",
          fnc: 'end'
        }
      ]
    })
  }
async end(e){
history[e.user_id] = []
e.reply(`文心千帆:用户${e.sender.nickname}已经重置对话了`)
}
async help(e){
let msg = e.msg.replace(/#文心/g,"").trim()
console.log(msg)
console.log(history[e.user_id])
  if (!history[e.user_id]) {
    history[e.user_id] = [];
  }
history[e.user_id].push({
        role: 'user',
        content: msg
      })
async function getcookie(){
let file = _path + "/data/YTwenxing/wenxing.yaml"
let data = YAML.parse(fs.readFileSync(file, 'utf8'))
let apikey = data.apiKey
let apiSecret = data.apiSecret
return [apikey,apiSecret];
}
async function getAccessToken() {
 const [apikey, apiSecret] = await getcookie();
  const apiKey = await apikey
  const secretKey = await apiSecret
  const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`;

  let headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  let response = await fetch(url, {
    method: 'POST',
    headers: headers
  });

  let data = await response.json();
  return data.access_token;
}

async function main() {
  let accessToken = await getAccessToken();

  let url = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions?access_token=${accessToken}`;

  let payload = JSON.stringify({
    messages: history[e.user_id]
  });

  let headers = {
    'Content-Type': 'application/json'
  };

  let response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: payload
  });

  let data = await response.json();
  console.log(data)
if(data.error_code){
if(data.error_code == '110'){
e.reply("未填写相关CK或填写的有误",true)
history[e.user_id] = []
return false
}else if(data.error_code == '336003'){
e.reply("你问太快了,已经自动重置,请重新提问",true)
history[e.user_id] = []
return false
}else if(data.error_code == '17'){
e.reply("你还没有开通模型付费服务,请参考群教程进行配置",true)
history[e.user_id] = []
return false
}
else{
e.reply("文本长度超过限制,自动重置",true)
history[e.user_id] = []
return false
}
}
  e.reply(data.result,true);
  history[e.user_id].push({
        role: 'assistant',
        content: data.result
      })
}

main();
    }
}



















