import { dependencies } from "../YTdependence/dependencies.js";
const { fetch, common } = dependencies
const BDUSS_BFESS = 'FTZC14MEx2VlpDdFVPMnk0MVJWU3p0MEdzYVhaUX5xa2hBMGVadDhyUEVkOFJsSUFBQUFBJCQAAAAAAQAAAAEAAAA~-2hVNTU116YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMTqnGXE6pxlem'
const BA_HECTOR = '2g858l8184840l0481ah2kahv8a2su1irrnee1t'
const headers = {
  "Accept": "text/event-stream",
  "Content-Type": "application/json",
  "Referer": "https://chat.baidu.com/",
  "Cookie": `BDUSS_BFESS=${BDUSS_BFESS};BA_HECTOR=${BA_HECTOR}`,
  "User-Agent":
"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0"
};
let appId = "1d010ecb7b8944aabe1128d7a0497322"

export class example extends plugin {
  constructor() {
    super({
      name: '阴天[百度工具箱]',
      dsc: '',
      event: 'message',
      priority: 2000,
      rule: [
        {
          reg: "^#小工(.*)",
          fnc: 'chat'
        },
        {
          reg: "^#工具箱大全$|^#切换工具(.*?)$",
          fnc: 'tools'    
        }
      ]
    })
  }

async tools(e) {
  const api = "https://chat.baidu.com/lg/api/list?pagesize=100";
  const response = await fetch(api, {
    headers: headers,
    method: "GET"
  });
  const res = await response.json();
  const lists = res.data.list;
  if (e.msg.includes("切换")) {
   const msg = e.msg.replace(/#切换工具/g, "")
   if (lists[msg-1]) {
   appId = lists[msg-1].app_id
   e.reply(`当前工具成功切换为: ${lists[msg-1].name}`)
   } else {
    e.reply("无效的工具序号!")
    return false
   }
  } else {
  const forwardMsg = lists.map((originalData, i) => {
    const reducedData = {
      bg_image: originalData.bg_image,
      app_id: originalData.app_id,
      name: originalData.name,
      description: originalData.description,
      use_count: originalData.use_count
    };
    return [
      segment.image(reducedData.bg_image),
      `序号: ${i + 1}\n`,
      `名称: ${reducedData.name}\n`,
      `介绍: ${reducedData.description}\n`,
      `使用人数: ${reducedData.use_count}`
    ];
  });
  const answer = await common.makeForwardMsg(e, forwardMsg, '应用工具大全');
  e.reply(answer);
 }
}

async chat(e) {
 const body = {
  inputMethod: "keyboard",
  rebuildInfo: {
    isRebuild: false,
    lastMsgId: "",
    lastMsgIndex: 0
  },
  content: {
    query: {
      type: "text",
      data: {
        text: e.msg.replace(/#小工/g, "").trim()
      },
      showText: e.msg.replace(/#小工/g, "").trim()
    }
  },
  sessionId: "",
  logExt: {
    aisearchId: "",
    pvId: "",
    source: "container"
  }
};

let url = `https://chat-ws.baidu.com/bot/conversation?pd=1&appId=${appId}&retryTimes=0`

const response = await fetch(url, {
  headers: headers,
  body: JSON.stringify(body),
  method: "POST"
})
const rawData = await response.text()
const events = rawData.split('event:').slice(1);
let concatenatedText = '';
events.forEach(event => {
  if (event.startsWith('message')) {
    const eventDataStartIndex = event.indexOf('{');
    const eventData = JSON.parse(event.substring(eventDataStartIndex));
    eventData.data.message.content.forEach(content => {
      if (content.data && content.data.text) {
         concatenatedText += content.data.text;
        }
      });
     }
   });
   const extractAndRemoveImgSrc = (htmlString) => {
  const imgRegex = /<img\s+[^>]*?src\s*=\s*['"]([^'"]*?)['"][^>]*?>/g;
  let imgSrcs = [];
  htmlString.replace(imgRegex, (match, src) => {
    imgSrcs.push(src);
    return '';
  });
  htmlString = htmlString.replace(imgRegex, '');
  if (htmlString.startsWith("<br>")) {
  htmlString = htmlString.replace("<br>", '');
  }
  return {
    newHtmlString: htmlString,
    imgSrcs: imgSrcs
  };
};
  const result = extractAndRemoveImgSrc(concatenatedText);
  //console.log(result)
  e.reply(result.newHtmlString);
  if (result.imgSrcs.length !== 0) {
   e.reply(segment.image(result.imgSrcs[0]))
  }
 }
}