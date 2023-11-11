import fetch from 'node-fetch'
let cookie = "BIDUPSID=7804339BCBFBBAE43D756F544E3710F1; PSTM=1693536860; ZFY=Cn:BBI8vMEuBPPqbOjRG:AIdry:AhIIwr7J6zgU:BRac5lk:C; BDUSS=1sQWZiNmhyVXJiVE4xQlVyfmxaQVhGMzJ4bWREeURwMWpQdmd3YTg2TkcybUJsSUFBQUFBJCQAAAAAAQAAAAEAAAA~-2hVNTU116YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEZNOWVGTTllbG; BDUSS_BFESS=1sQWZiNmhyVXJiVE4xQlVyfmxaQVhGMzJ4bWREeURwMWpQdmd3YTg2TkcybUJsSUFBQUFBJCQAAAAAAQAAAAEAAAA~-2hVNTU116YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEZNOWVGTTllbG; BAIDUID=08D591E27010F395C9C2024F7BCAEE20:SL=0:NR=10:FG=1; BAIDUID_BFESS=08D591E27010F395C9C2024F7BCAEE20:SL=0:NR=10:FG=1; BDRCVFR[7bv7tGGopA3]=mk3SLVN4HKm; delPer=0; PSINO=7; H_WISE_SIDS=39668_39672_39663_39682_39695_39676; H_PS_PSSID=39668_39672_39663_39682_39695_39676; H_WISE_SIDS_BFESS=39668_39672_39663_39682_39695_39676; BA_HECTOR=0k802k208k0h00808k0l018j1iksnlc1r; BDORZ=FFFB88E999055A3F8A630C64834BD6D0"
export class example extends plugin {
  constructor() {
    super({
      name: '阴天[免费AI]',
      dsc: '',
      event: 'message',
      priority: 3000,
      rule: [
        {
          reg: "^#小红书生成(.*)$|知乎(.*)$",
          fnc: 'freeai'
        }
      ]
    })
  }
async freeai(e) {
let pvid = "11386922003590717160"
let appid = "a5d33f89c95f46429dd1103a16cf6ad8"
if(!e.msg.includes("#小红书生成")){
pvid = "10018612110682051079"
appid = "570f2782aa964cd4b30de5662e380424"
}
let msg = e.msg
.replace(/#小红书生成/g, "")
.replace(/#知乎/g, "")
.trim()
let body =  {
  "inputMethod": "keyboard",
  "rebuildInfo": {
    "isRebuild": false,
    "lastMsgId": "as-zd8g0h60tm",
    "lastMsgIndex": 0
  },
  "content": {
    "query": {
      "type": "text",
      "data": {
        "text": msg
      },
      "showText": msg
    }
  },
  "sessionId": "",
  "logExt": {
    "aisearchId": "",
    "pvId": pvid,
    "source": "input"
  }
}
let response = await fetch(`https://chat-ws.baidu.com/bot/conversation?pd=1&appId=${appid}&retryTimes=0`, {
  "headers": {
    "accept": "text/event-stream",
    "content-type": "application/json",
    "cookie": cookie,
    "Referer": "https://chat.baidu.com/"
  },
  "body": JSON.stringify(body),
  "method": "POST"
});
let res = await response.text()
//console.log(res)
let content = res
.replace(/event:message/g,"")
.replace(/event:ping/g,"")
.replace(/data:/g,"")
.replace(/\}\s+\{/g, '},{')
let json = JSON.parse("["+content+"]")
let answer = ""
for(var a = 0;a < json.length;a++){
answer += json[a].data.message.content[0].data.text
}
e.reply(answer)
}}
















