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
      priority: 4000,
      rule: [
        {
          reg: "^千帆(.*)$|^文心(.*)$",
          fnc: 'help'
},{
          reg: "^结束文心对话$",
          fnc: 'end'
}
      ]
    })
  }
async end(e){
history = []
e.reply("文心千帆已经重置对话了")
}
async help(e){
let msg = e.msg.replace(/千帆/g,"").replace(/文心/g,"").trim()
history.push({
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
    messages: history
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
  e.reply(data.result,true);
  history.push({
        role: 'assistant',
        content: data.result
      })
}

main();
    }
}




















