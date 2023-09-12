import fetch from 'node-fetch'
import fs from 'fs'
const _path = process.cwd()
import YAML from "yaml"
let dirpath = _path + '/data/YTqianwen'
let history = []
if (!fs.existsSync(dirpath)) {
  fs.mkdirSync(dirpath)
}
if (!fs.existsSync(dirpath + "/" + "qianwen.yaml")) {
  fs.writeFileSync(dirpath + "/" + "qianwen.yaml", 'apiKey: "xxxxx"', "utf-8")
}
export class example extends plugin {
  constructor() {
    super({
      name: '阴天[通义千问]',
      dsc: '',
      event: 'message',
      priority: 4000,
      rule: [
        {
          reg: "^千问(.*)",
          fnc: 'help'
        }, {
          reg: "^结束千问对话$",
          fnc: 'end'
        }
      ]
    })
  }
  async end(e) {
    history = []
    e.reply("千问模型对话已重置", true)
  }
  async help(e) {
    //console.log(history)
    let msg = e.msg.replace(/千问/g, "").trim()
    let url = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
    const apiKey = await getcookie()

    let headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };

    let data = {
      model: 'qwen-7b-chat-v1',
      input: {
        prompt: msg,
        history: history,
      },
      parameters: {},
    };

    fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        if (result.code) {
          if (result.code == 'InvalidApiKey') {
            e.reply("你没有填写千问模型sk,无法使用", true)
            return false
          }
        }
        let obj = {
          "user": msg,
        }
        history.push(obj)
        e.reply(result.output.text, true)
        let obj2 = { "bot": result.output.text }
        let newobj = { ...obj, ...obj2 }
        history.pop()
        history.push(newobj)
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
}
async function getcookie() {
  let file = _path + "/data/YTqianwen/qianwen.yaml"
  let data = YAML.parse(fs.readFileSync(file, 'utf8'))
  let apiKey = data.apiKey
  return apiKey;
}