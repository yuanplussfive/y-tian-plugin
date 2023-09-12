import fetch from "node-fetch"
import common from "../../../lib/common/common.js";
import fs from "fs"
import YAML from "yaml"
import path from 'path';
const _path = process.cwd();
let dirPath = _path + "/data/email";
let 邮箱 = "";
let file = _path + "/plugins/y-tian-plugin/config/gptx.yaml"
let data = YAML.parse(fs.readFileSync(file, 'utf8'))
let rapidkey = data.rapidkey
let botname = data.botname
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
}
let filePath = path.join(dirPath, 'email.json');
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify({ "1": "" }, null, 2));
  console.log("你尚未有创建邮箱账号")
}
else {
  let jsonContent;
  try {
    let fileData = fs.readFileSync(filePath, 'utf-8');
    jsonContent = JSON.parse(fileData);
    if (JSON.stringify(jsonContent) === '{"1":""}') {
      console.log("你尚未有创建邮箱账号")
    }
    else {
      let keys = Object.keys(jsonContent);
      let lastKey = keys[keys.length - 1];
      邮箱 = jsonContent[lastKey];
      console.log(`当前邮箱账号：${邮箱}`)
    }
  } catch (error) {
    console.error('Error reading JSON file:', error);
  }
}
let url = "https://bjbdsdwatviaxduylrdq.supabase.co/auth/v1/token?grant_type=password";

let 密码 = "114514198qQ";


let m = []
let model = "gpt-4"
let json =
{
  1: `gpt-4`,
  2: `gpt-3.5-turbo`,
  3: `gpt-3.5-0314`,
  4: `gpt-3.5-16k`,
  5: `gpt-4-0314`,
  6: `bard`,
  7: `bing`,
  8: `claude-2`,
  9: `mindtastik:gpt4`,
}
export class ytai extends plugin {
  constructor() {
    super({
      name: '阴天[AI]',
      dsc: 'AI',
      event: 'message',
      priority: 1,
      rule: [{
        reg: `^${botname}(.*)$`,
        fnc: 'help'
      }, {
        reg: `^/模型(.*)启动$`,
        fnc: 'mod'
      }, {
        reg: `^/模型大全$`,
        fnc: 'modd'
      }, {
        reg: `^/aireset$`,
        fnc: 'moddd'
      }, {
        reg: `^/create$`,
        fnc: 'create'
      },
      {
        reg: `^/切换账号$`,
        fnc: 'qh'
      },
      {
        reg: `^/添加预设/(.*)/(.*)$`,
        fnc: 'ys'
      },
      {
        reg: `^/新预设大全$`,
        fnc: 'ysdq'
      },
      {
        reg: `^/换预设(.*)$`,
        fnc: 'hys'
      },
      {
        reg: `^/删预设(.*)$`,
        fnc: 'sys'
      }, {
        reg: `^/检查对话记录$`,
        fnc: 'syss'
      }
      ]
    });
  }
  async syss(e) {
    let result = ""
    for (let i = 0; i < m.length; i++) {
      result += JSON.stringify(m[i]) + "\n";
    }
    if (result == "") { e.reply("暂无对话记录") } else {
      e.reply(result)
    }

  }
  async sys(e) {
    let msg = e.msg.replace("/删预设", "").trim();
    let filePath4 = path.join(dirPath, `${msg}.txt`);

    fs.access(filePath4, fs.constants.F_OK, (err) => {
      if (!err) {
        fs.unlink(filePath4, (err) => {
          if (!err) {
            e.reply(`成功删除名为 ${msg} 的预设。`);
          } else {
            console.error(err);
          }
        });
      } else {
        e.reply(`找不到名为 ${msg} 的预设。`);
      }
    });

  }
  async hys(e) {
    let ys;
    let msg = e.msg.replace("/换预设", "").trim();

    fs.readdir(dirPath, (err, files) => {
      if (err) {
        console.error('读取目录失败:', err);
        return;
      }

      let found = false;

      files.some((file) => {
        let filePath3 = path.join(dirPath, file);

        if (fs.statSync(filePath3).isFile() && path.extname(file) === '.txt') {
          if (file === msg + '.txt') {
            ys = fs.readFileSync(filePath3, 'utf8');
            ys = JSON.parse(ys);
            found = true;
            return true;
          }
        }
      });

      if (!found) {
        e.reply("不要乱换");
        return;
      }

      let jsonString;

      if (m.length !== 0) {
        jsonString = JSON.stringify(m[0]);
      } else {
        jsonString = "114514";
      }

      if (jsonString.includes("system")) {
        m.shift();
      }

      m.unshift(ys);
      e.reply("切换成功");
    });
  }
  async ysdq(e) {
    let fileNames = '';

    fs.readdir(dirPath, (err, files) => {
      if (err) {
        console.error('读取目录失败:', err);
        return;
      }
      let count = 1;
      files.forEach((file) => {
        let filePath2 = path.join(dirPath, file);
        if (fs.statSync(filePath2).isFile() && path.extname(file) === '.txt') {
          fileNames += `${count}.${path.basename(file, '.txt')}\n`;
          count++;
        }
      });
      if (fileNames == "") { e.reply("暂无预设") } else {
        e.reply(fileNames + "请输入/换预设+预设名 以切换预设");
      }
    });
  }
  async ys(e) {
    let msg = e.msg.replace("/添加预设/", "").trim()
    let result = msg.split("/");
    let ys = { "role": "system", "content": result[1] }
    let jsonString
    if (m.length !== 0) { jsonString = JSON.stringify(m[0]) } else { jsonString = "114514" }
    if (jsonString.includes("system")) {
      m.shift();
    }
    m.unshift(ys)
    let filePath1 = dirPath + `/${result[0]}.txt`;
    fs.writeFileSync(filePath1, JSON.stringify(ys), 'utf-8');
    e.reply("已为您添加预设至本地，请发送 /新预设大全 查看。当前预设已生效")
  }
  async qh(e) {
    let data = fs.readFileSync(filePath, 'utf-8');
    let obj = JSON.parse(data);
    let searchValue = 邮箱;
    let searchKey;
    for (let key in obj) {
      if (obj[key] === searchValue) {
        searchKey = key;
        break;
      }
    }
    if (!searchKey) { e.reply("你没有任何账号，请发送：/create 进行创建。"); return false }
    let keys = Object.keys(obj);
    let nextIndex = parseInt(searchKey) + 1
    if (!keys.includes(nextIndex.toString())) {
      nextIndex = "1"
    } else {
      nextIndex = nextIndex.toString()
    }
    let nextKey = keys[nextIndex - 1];
    let eee = obj[nextKey]
    邮箱 = eee
    e.reply(`已切换至账号：${邮箱}`)
  }
  async moddd(e) {
    m = []
    e.reply("清除成功")
  }
  async modd(e) {
    let str = '';
    for (let key in json) {
      str += key + ': ' + json[key] + '\n';


    } e.reply(str + "例：/模型1启动 ")
  }
  async mod(e) {
    let number = parseInt(e.msg.replace("/模型", "").replace("启动", "").trim());
    if (number < 1 || number > 9) {
      e.reply("再乱输把你阉了！")
      return false
    }
    model = json[number]
    e.reply(`${model},启动！`)
  }
  async create(e) {
    const options = {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': rapidkey,
        'X-RapidAPI-Host': 'temp-mail44.p.rapidapi.com'
      },
      body: JSON.stringify({
        key1: 'value',
        key2: 'value'
      })
    };

    let email = await fetch('https://temp-mail44.p.rapidapi.com/api/v3/email/new', options)
    email = await email.json()
    let sendemail = await email.email
    let data = {
      "email": sendemail,
      "password": "114514198qQ",
      "data": {},
      "gotrue_meta_security": {
        "captcha_token": ""
      },
      "code_challenge": "NnzCJXZZARwf_0Ls_-uWjcgXDwUGJ7V5RSfvhaLfk00",
      "code_challenge_method": "s256"
    }
    let apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqYmRzZHdhdHZpYXhkdXlscmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODQ0MTgwOTAsImV4cCI6MTk5OTk5NDA5MH0.kmZD6NmvcF522MgYH0KWf6VQcoXdAGfLMFpQS7pW2HE"
    let created = await fetch("https://bjbdsdwatviaxduylrdq.supabase.co/auth/v1/signup?redirect_to=https%3A%2F%2Fcf1.easychat.work%2Fapi%2Fauth%2Fcallback", {
      "headers": {
        "apikey": apikey,
        "authorization": "Bearer" + apikey,
        "content-type": "application/json;charset=UTF-8",
        "x-client-info": "@supabase/auth-helpers-nextjs@0.7.2",
      },
      "body": JSON.stringify(data),
      "method": "POST"
    });
    created = await created.json()
    console.log(created)
    const options2 = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidkey,
        'X-RapidAPI-Host': 'temp-mail44.p.rapidapi.com'
      }
    };
    e.reply("请等待10秒。。")
    await common.sleep(10000)
    let reserve = "";
    reserve = await fetch(`https://temp-mail44.p.rapidapi.com/api/v3/email/${sendemail}/messages`, options2);
    reserve = await reserve.json();
    if (reserve[0]) {
      if (reserve[0].body_text) {
        reserve = await reserve[0].body_text;
      }
    }
    var num = reserve.replace(/[^0-9]/ig, "");
    console.log(num)
    let data2 = {
      "email": sendemail,
      "type": "signup",
      "token": num,
      "options": {
        "captchaToken": ""
      },
      "gotrue_meta_security": {
        "captcha_token": ""
      }
    }
    let infor = await fetch("https://bjbdsdwatviaxduylrdq.supabase.co/auth/v1/verify", {
      "headers": {
        "apikey": apikey,
        "authorization": "Bearer" + apikey,
        "content-type": "application/json;charset=UTF-8",
        "x-client-info": "@supabase/auth-helpers-nextjs@0.7.2",
      },
      "body": JSON.stringify(data2),
      "method": "POST"
    });
    let fileDatas = fs.readFileSync(filePath, 'utf-8');
    let jsonContents = JSON.parse(fileDatas);
    if (JSON.stringify(jsonContents) === '{"1":""}') {
      jsonContents["1"] = sendemail
    } else {
      let keyss = Object.keys(jsonContents);
      let lastKeys = keyss[keyss.length - 1];
      lastKeys = `${Number(lastKeys) + 1}`
      jsonContents[lastKeys] = `${sendemail}`
    }
    fs.writeFileSync(filePath, JSON.stringify(jsonContents, null, 2));
    邮箱 = `${sendemail}`
    e.reply(`注册成功\n账号为:${sendemail}\n密码为:114514198qQ,已自动为您切换至新账号。`, true)
  }
  async help(e) {
    let msg = e.msg.replace(botname, "").trim()
    msg = {
      "role": "user",
      "content": msg
    }
    m.push(msg)
    let tk = await denglu(url, 邮箱, 密码)
    let result = await duihua(m, tk[0], tk[1], model)
    let regex = /"content":"(.*?)"/g;
    let match;
    let results = [];
    while ((match = regex.exec(result)) !== null) {
      results.push(match[1]);
    }
    result = results.join("");
    let rep = { "role": "assistant", "content": result }
    m.push(rep)
    result = result.replace(/\\n/g, "\n")
    e.reply(result, true)
  }
}
async function denglu(url, 邮箱, 密码) {
  let apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqYmRzZHdhdHZpYXhkdXlscmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODQ0MTgwOTAsImV4cCI6MTk5OTk5NDA5MH0.kmZD6NmvcF522MgYH0KWf6VQcoXdAGfLMFpQS7pW2HE";
  let header = { "Apikey": apikey };
  let body = { "email": `${邮箱}`, "password": `${密码}`, "gotrue_meta_security": { "captcha_token": "" } };

  return new Promise((resolve, reject) => {
    fetch(url, {
      method: 'POST',
      headers: header,
      body: JSON.stringify(body)
    })
      .then(response => response.json())
      .then(data => {
        const token = data.access_token;
        const re = data.refresh_token
        resolve([token, re]);
      })
      .catch(error => {
        reject(error);
      });
  });
}

async function duihua(m, tk, re, model) {

  let url = "https://beta.easychat.work/api/openai/v1/chat/completions"
  let headers = {
    "path": "/api/openai/v1/chat/completions",
    "Cookie": `Hm_lvt_563fb31e93813a8a7094966df6671d3f=1691323109; Hm_lpvt_563fb31e93813a8a7094966df6671d3f=1691325423; sb-bjbdsdwatviaxduylrdq-auth-token-code-verifier=%22f8e7522547c1cc7a4ed1c79ddce3877ead679c028da004a50045293da13cd1db3753b90ad97df1d08c7ce396e2311dc693a7754731896c4c%22; sb-bjbdsdwatviaxduylrdq-auth-token=%5B%22${tk}%22%2C%22${re}%22%2Cnull%2Cnull%2Cnull%5D`,
  }
  let body = {
    "messages": m,
    "stream": true,
    "model": model,
    "temperature": 0.5,
    "presence_penalty": 0,
    "frequency_penalty": 0,
    "top_p": 1
  }
  return new Promise((resolve, reject) => {
    fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    })
      .then(response => response.text())
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

