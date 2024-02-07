import { dependencies } from "../YTdependence/dependencies.js";
const { fetch, common, _path, fs, YAML, puppeteer } = dependencies
let uid
let id
let body
let requestid
let loraID = []
let lora = ""
let keylora = ""
let weightlora = 0.8
let negPrompt = "(worst quality, low quality:1.4), bad anatomy, watermarks, text, signature, blur,messy, low quality, sketch by bad-artist, (semi-realistic,  sketch, cartoon, drawing, anime:1.4), cropped, out of frame, worst quality, low quality, jpeg artifacts"
let models = "62a46462-fa74-441c-b141-640a16248a71"
let steps = 20
let dirpath = _path + '/data/YTdrawing'
 if (!fs.existsSync(dirpath)){
fs.mkdirSync(dirpath)    
}
 if (!fs.existsSync(dirpath + "/" + "drawing.yaml")) {
  fs.writeFileSync(dirpath+ "/" + "drawing.yaml",'cookie: "satoken=xxxx"',"utf-8")
}

export class example extends plugin {
  constructor () {
    super({
      name: '阴天[FreeDrawing]',
      dsc: '',
      event: 'message',
      priority: 2000,
      rule: [
        {
          reg: "^/画图(.*)",
          fnc: 'optimize'
        },
        {
          reg: "^/图模型大全$|^/切换图模型(.*?)$",
          fnc: 'models'
        },
        {      
          reg: "^/切换步数(.*?)$",
          fnc: 'optimizeSteps'
        },
        {      
          reg: "^/(图|头)生图(.*?)$",
          fnc: 'images'
        },
        {      
          reg: "^/搜索lora(.*?)$",
          fnc: 'searchlora'
        },
        {      
          reg: "^/切换lora(.*?)$",
          fnc: 'changelora'
        },
        {      
          reg: "^/清空lora$",
          fnc: 'endlora'
        },
        {      
          reg: "^/lora权重(.*?)$",
          fnc: 'loraweight'
        },
        {      
          reg: "^/清晰度提升$",
          fnc: 'improve'
        }
      ]
    })
  }

async improve(e) {
 if (e.message.find(val => val.type === 'image')) {
  const rawImageUrl = e.img[0]
  try {
    const imgUrls = 'https://www.vegaai.net/apis/text2image/getImage';
    const req = await IncreaseImage(rawImageUrl) 
    if (!req.success) {
      const replyMessage = req.message 
        ? '上一个图片任务正在进行中，请稍候!' 
        : '验证错误,  请确保填写正确的参数!';
      await e.reply(replyMessage);
      return;
    }
    const { timeWait, dealTime, requestId } = req;
    await e.reply(`我在画了，请稍等哦，大概需要 ${dealTime}~${timeWait}s`);
    const result = await fetchImage(imgUrls, requestId);
    const image = JSON.parse(result.data.image);
    const output = await AnalysisUrl(image);
    await e.reply(output);
  } catch (error) {
    await e.reply('处理图片过程中出现错误，请稍后再试！');
  }
 }
}

async loraweight(e){
  const str = e.msg
  const match = str.match(/\d+/);
  if (match) {
   const number = parseInt(match[0]);
   if (number > 0 && number <= 100) {
    weightlora = number/100
    e.reply(`lora权重已改为${keylora}`)
    console.log(number);
  }
 }
}

async endlora(e){
  lora = ""
  keylora = ""
  negPrompt = "(worst quality, low quality:1.4), bad anatomy, watermarks, text, signature, blur,messy, low quality, sketch by bad-artist, (semi-realistic,  sketch, cartoon, drawing, anime:1.4), cropped, out of frame, worst quality, low quality, jpeg artifacts"
  e.reply("lora已成功清空")
}

async changelora(e) {
  //console.log(loraID)
  let msgIndex = parseInt(e.msg.replace(/\/切换lora/g, "").trim()) - 1;
  if (Array.isArray(loraID) && !isNaN(msgIndex) && loraID[msgIndex]) {
    lora = loraID[msgIndex].loraCode;
    keylora = loraID[msgIndex].loraKeyword;
    negPrompt = loraID[msgIndex].negPrompt;
    e.reply("切换成功", true);
  } else {
    if (!Array.isArray(loraID) || !loraID.length) {
      e.reply("你还没搜索呢，我切换个毛!", true);
    } else if (isNaN(msgIndex) || !(msgIndex in loraID)) {
      e.reply("错误的参数，请重新输入", true);
    }
  }
}

async searchlora(e) {
    const msg = e.msg.replace(/\/搜索lora/g, '').trim();
    const response = await fetch(`https://www.vegaai.net/apis/lora/getLoraModels/v1?auth=public&pageNo=0&pageSize=60&orderType=collection&keyword=${msg}`, {
        method: "GET",
        headers: {
            "cookie": await getcookie(),
            "Referer": "https://rightbrain.art/text2Image"
        }
    });
    const search = await response.json();
    const data = await search.data.list;
    const forwardMsg = [`lora【${msg}】搜索结果: ${data.length}个结果`];
    const loraCodes = data.map((item, i) => {
        const { loraCode, loraKeyword, loraName, loraBaseName, createUser, remark } = item;
        loraID.push({ loraCode, loraKeyword, negPrompt })
        return [
            `序号: ${i+1}\n`,
            `lora名称: ${loraName}\n`,
            `基于模型名称: ${loraBaseName}\n`,
            `lora关键词: ${loraKeyword}\n`,
            `创建者名称: ${createUser}\n`,
            `模型ID: ${loraCode}\n`,
            `画图示例:\n(${remark})`
        ];
    });
    forwardMsg.push(...loraCodes);
    console.log(forwardMsg);
    const resultMsg = await common.makeForwardMsg(e, forwardMsg, 'lora搜索结果');
    await e.reply(resultMsg);
    e.reply("请发送/切换lora+id", true); 
}

async images(e) {
let img;
let message = e.msg.replace(/\/(图|头)生图/g,"").trim()
const apiUrl = "https://www.vegaai.net/apis/text2image/getImage";
if (e.message.find(val => val.type === 'image')) {
 img = e.img[0]
}
if (e.msg.startsWith("/头生图")) {
 const qq = e.message.filter(item => item.type == 'at')?.map(item => item?.qq)
if (qq.length == 0) {
 e.reply("请艾特一个对象",true)
 return false
}
 img = `http://q.qlogo.cn/headimg_dl?dst_uin=${qq}&spec=640&img_type=jpg`
}
 try {
    const imgUrls = 'https://www.vegaai.net/apis/text2image/getImage';
    const req = await sendMessage2(message, img, models, steps, negPrompt, lora, keylora);
    if (!req.success) {
      const replyMessage = req.message 
        ? '上一个图片任务正在进行中，请稍候!' 
        : '验证错误,  请确保填写正确的参数!';
      await e.reply(replyMessage);
      return;
    }
    const { timeWait, dealTime, requestId } = req;
    await e.reply(`我在画了，请稍等哦，大概需要 ${dealTime}~${timeWait}s`);
    const result = await fetchImage(imgUrls, requestId);
    const image = JSON.parse(result.data.image);
    const output = await AnalysisUrl(image);
    await e.reply(output);
  } catch (error) {
    await e.reply('处理图片过程中出现错误，请稍后再试！');
  }
 }

async optimizeSteps(e) {
  try {
    let msg = e.msg.split("/切换步数").join("").trim();
    let parsedMsg = parseInt(msg, 10);
    if (isNaN(parsedMsg)) {
      e.reply("参数需要为数字");
    }
    if (parsedMsg > 15 && parsedMsg <= 30) {
      steps = parsedMsg;
      e.reply(`切换成功，现在绘图步数为${steps}`, true);
    } else {
      e.reply("错误的参数,画图步数范围为15-30");
    }
  } catch (error) {
    await e.reply(`${error.message}`, true);
  }
}

async models(e) { 
  const data = await getModelsData();  
  if(e.msg.includes("/图模型大全")){
    const messages = data.map((model, index) => {
      let name = `序号:${index + 1}\n模型名称:${model.name}`;
      let np = `\n负面效果:${model.negPrompt}\n`;
      let remarks = `画图示例:${model.remark}`;
      return [name, np, remarks];
    });   
    const resultMsg = await common.makeForwardMsg(e, messages, '图模型大全');
    e.reply(resultMsg); 
  } else if(e.msg.includes("/切换图模型")){ 
    let modelIndex = Number(e.msg.replace(/\/切换图模型/g,"").trim()) - 1;
    models = data[modelIndex].code;
    console.log(models);
    e.reply("切换成功",true)
  }
}

async optimize(e) {
  try {
    const message = e.msg.replace(/\/画图/g, '').trim();
    const imgUrls = 'https://www.vegaai.net/apis/text2image/getImage';
    const req = await sendMessage(message, models, steps, negPrompt, lora, keylora);
    if (!req.success) {
      const replyMessage = req.message 
        ? '上一个图片任务正在进行中，请稍候!' 
        : '验证错误,  请确保填写正确的参数!';
      await e.reply(replyMessage);
      return;
    }
    const { timeWait, dealTime, requestId } = req;
    await e.reply(`我在画了，请稍等哦，大概需要 ${dealTime}~${timeWait}s`);
    const result = await fetchImage(imgUrls, requestId);
    const image = JSON.parse(result.data.image);
    const output = await AnalysisUrl(image);
    await e.reply(output);
  } catch (error) {
    await e.reply('处理图片过程中出现错误，请稍后再试！');
  }
 }
}

async function getcookie() {
  const file = _path + "/data/YTdrawing/drawing.yaml"
  const data = YAML.parse(fs.readFileSync(file, 'utf8'))
  const { cookie } = data
  return cookie
}

async function fetchImage(imgUrls, requestid, maxTryTimes = 30, intervalTime = 4000) {
  console.log(requestid);
  let tryTimes = 0;
  return new Promise((resolve, reject) => {
    const timer = setInterval(async () => {
      if (tryTimes >= maxTryTimes) {
        clearInterval(timer);
        console.log('反馈结果失败!');
        resolve(undefined);
        return;
      }
      tryTimes++;
      try {
        const response = await fetch(`${imgUrls}?requestId=${requestid}`, {
          headers: {
            accept: "application/json, text/plain, */*",
            cookie: await getcookie(),
            Referer: "https://www.vegaai.net/",
          },
          method: "GET"
        });       
        const res = await response.json();
        const data = res.data;
        //console.log(res);
        if (data === null || data.list.length === 0) {
          console.log(`异步请求数: ${tryTimes}...`);
        } else {
          clearInterval(timer);
          resolve(data);
        }
      } catch (error) {
        reject(error);
      }
    }, intervalTime);
  });
}

async function sendMessage(msg, models, steps, negPrompt, lora, keylora) {
    const data = await createPayload(msg, models, steps, negPrompt, lora, keylora);   
    console.log(data)
    const res = await fetch("https://www.vegaai.net/apis/text2image/create", {
        headers: {
          "accept": "application/json, text/plain, */*",
          "cookie": await getcookie(),
          "Referer": "https://www.vegaai.net/text2Image",
          "content-type": "application/json",
          "User-Agent":
"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0"
        },
        body: JSON.stringify(data),
        method: "POST"
    });
    const response = await res.json();
    console.log(response);
    if (response.code === '00000') {
        //console.log('当前有图片任务在执行中');
        return {
            success: false,
            message: '当前有图片任务在执行中'
        }
    } 
    const requestId = response.data.requestId;
    const dealTime = response.data.dealTime;
    const timeWait = response.data.timeWait;
    return {
        success: true,
        requestId,
        dealTime,
        timeWait
    };
}

async function createPayload(msg, models, steps, negPrompt, lora, keylora) {
    msg = msg.replace(/\/画图/g,"").trim();
    return {
        "model": models,
        "relation":true,
        "imageRatio":"1:1",
        "width": 516,
        "height": 516,
        "useHd":1,
        "imageNum":2,
        "stepNum": steps,
        "cfgScale":7,
        "sampler":"DPM++ SDE Karras",
        "seed":-1,
        "negPrompt": negPrompt,
        "loraId":lora,
        "loraWeight":weightlora,
        "loraKeyword":keylora,
        "prompt": msg
    };
}

async function createImageLoad(msg, img, models, steps, negPrompt, lora, keylora) {
    msg = msg.replace(/\/画图/g,"").trim();
    return {
       "model": models,
       "relation": true,
       "useHd": 1,
       "imageNum": 2,
       "width": 512,
       "height": 512,
       "stepNum": steps,
       "cfgScale": 7,
       "denoisingStrength": 0.45,
       "sampler": "DPM++ SDE Karras",
       "seed": -1,
       "negPrompt": negPrompt,
       "loraId": lora,
       "loraWeight": weightlora,
       "loraKeyword": keylora,
       "prompt": msg,
       "initImages": [img],
       "maskImg": "None"
    };
}

async function IncreaseImage(rawImageUrl) {
    const data = { 
         height: 4096,
         rawImageUrl: rawImageUrl,
         resolution: "2k",
         width: 4096
     }
    const res = await fetch("https://www.vegaai.net/apis/hdRepair/create", {
        headers: {
            "accept": "application/json, text/plain, */*",
            "cookie": await getcookie(),
            "Referer": "https://www.vegaai.net/",
            "content-type": "application/json",
            "User-Agent":
"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0"
        },
        body: JSON.stringify(data),
        method: "POST"
    });
    const response = await res.json();
    console.log(response);
    if (response.code === '00000') {
        //console.log('当前有图片任务在执行中');
        return {
            success: false,
            message: '当前有图片任务在执行中'
        }
    } 
    const requestId = response.data.requestId;
    const dealTime = response.data.dealTime;
    const timeWait = response.data.timeWait;
    return {
        success: true,
        requestId,
        dealTime,
        timeWait
    };
}

async function AnalysisUrl(array) {
  console.log(array)
  const new_arr = array.filter(item => item !== 'willBePreview' && item !== 'None').map(segment.image);
  return new_arr
}

async function getModelsData() {
  const response = await fetch("https://www.vegaai.net/apis/model/getBaseModels", {
    "method": "GET",
    "headers": {
      "accept": "application/json, text/plain, */*",
      "cookie": await getcookie(),
      "Referer": "https://rightbrain.art/text2Image"
    }
  });
  const modelJson = await response.json();
  console.log(modelJson)
  return modelJson.data;
}

async function sendMessage2(msg, img, models, steps, negPrompt, lora, keylora) {
    const data = await createImageLoad(msg, img, models, steps, negPrompt, lora, keylora);   
    console.log(data)
    const res = await fetch("https://www.vegaai.net/apis/image2Image/create", {
        headers: {
          "accept": "application/json, text/plain, */*",
          "cookie": await getcookie(),
          "Referer": "https://www.vegaai.net/text2Image",
          "content-type": "application/json",
          "User-Agent":
"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0"
        },
        body: JSON.stringify(data),
        method: "POST"
    });
    const response = await res.json();
    console.log(response);
    if (response.code === '00000') {
        console.log('当前有图片任务在执行中');
        return {
            success: false,
            message: '当前有图片任务在执行中'
        }
    } 
    const requestId = response.data.requestId;
    const dealTime = response.data.dealTime;
    const timeWait = response.data.timeWait;
    return {
        success: true,
        requestId,
        dealTime,
        timeWait
    };
}