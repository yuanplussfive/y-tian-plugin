import fetch from 'node-fetch'
import fs from 'fs'
import crypto from 'crypto'
import querystring from 'querystring'
import WebSocket from '../node_modules/ws/index.js'
let history = []
const _path = process.cwd()
let dirpath = _path + '/data/YTxinghuo'
if(!fs.existsSync(dirpath)){
fs.mkdirSync(dirpath)    
}
if(!fs.existsSync(dirpath+"/"+"data.json")){
fs.writeFileSync(dirpath+"/"+"data.json",JSON.stringify({
apiKey:"Your-apiKey",
apiSecret:"Your-apiSecret",
appId:"Your-appId"
}),"utf-8")
}
export class example extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: '阴天[星火模型]',
      /** 功能描述 */
      dsc: '',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 4000,
      rule: [
        {
          reg: "^#星火(.*)$",
          fnc: 'help'
},{      
          reg: "^#结束星火对话$",
          fnc: 'end'
},{      
          reg: "^#填写apiKey(.*?)$|#填写apiSecret(.*?)$|#填写appId(.*?)$",
          fnc: 'apikey'
        }
      ]
    })
  }
async apikey(e){
if(!e.isMaster){return false}
let msg = e.msg.replace(/#填写appId/g,"").replace(/#填写apiSecret/g,"").replace(/#填写apiKey/g,"").trim()
let data = JSON.parse(fs.readFileSync(dirpath+"/"+"data.json"))
if(e.msg.includes("#填写appId")){
data.appId = msg
fs.writeFileSync(dirpath+"/"+"data.json",JSON.stringify(data),"utf-8")
e.reply("成功填写appId",true)
}else if(e.msg.includes("#填写apiSecret")){
data.apiSecret = msg
fs.writeFileSync(dirpath+"/"+"data.json",JSON.stringify(data),"utf-8")
e.reply("成功填写apiSecret",true)
}else if(e.msg.includes("#填写apiKey")){
data.apiKey = msg
fs.writeFileSync(dirpath+"/"+"data.json",JSON.stringify(data),"utf-8")
e.reply("成功填写apiKey",true)
}}
async end(e){
history = []
e.reply("星火模型对话已结束")
}
async help(e){
let msg = e.msg.replace(/#星火/g,"").trim()
history.push(  {"role": "user", "content": msg})
let apiKey = JSON.parse(fs.readFileSync(dirpath+"/"+"data.json")).apiKey
let apiSecret = JSON.parse(fs.readFileSync(dirpath+"/"+"data.json")).apiSecret
let appId = JSON.parse(fs.readFileSync(dirpath+"/"+"data.json")).appId
if(apiKey=="Your-apiKey"||apiSecret=="Your-apiSecret"||appId=="Your-appId"){
e.reply("你还没有填写星火模型相关值,无法使用星火模型,请参考帮助进行填写",true)
return false
}
let curTime = new Date();
let date = curTime.toGMTString();
let tmp = `host: spark-api.xf-yun.com\ndate: ${date}\nGET /v1.1/chat HTTP/1.1`;
let tmp_sha = crypto.createHmac('sha256', apiSecret).update(tmp, 'utf-8').digest();
let signature = Buffer.from(tmp_sha).toString('base64');

const authorization_origin = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
const authorization = Buffer.from(authorization_origin).toString('base64');

const v = {
  "authorization": authorization,
  "date": date,
  "host": "spark-api.xf-yun.com"
};

const url = "wss://spark-api.xf-yun.com/v1.1/chat?" + querystring.stringify(v);

console.log(url)
const ws = new WebSocket(url)
let body = {
        "header": {
            "app_id": appId,
            "uid": "yuan"
        },
        "parameter": {
            "chat": {
                "domain": "general",
                "temperature": 0.5,
                "max_tokens": 1024
            }
        },
        "payload": {
            "message": {
                "text": history
        }
    }}
let content = "";

const connectWebSocket = async () => {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);

    ws.on('open', () => {
      console.log('开始建立连接');
      ws.send(JSON.stringify(body));
    });

    ws.on('message', (data) => {
      console.log('传递数据:', data);
      let shu = JSON.parse(data.toString("utf-8"))
      if(!shu.payload){e.reply("通讯失败!");content="请求被阻止";return false}
      shu = shu.payload.choices.text[0].content
      //console.log(shu)
      content += shu;
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed.');
      resolve(content);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      reject(error);
    });
  });
};

// 在异步函数中等待结果
const main = async () => {
  try {
    content = await connectWebSocket();
    console.log(content); // 输出最终结果
    e.reply(content,true); // 返回 content
    history.push(  {"role": "assistant", "content": content})
  } catch (error) {
    console.error(error);
  }
};

main();
    }
}




















