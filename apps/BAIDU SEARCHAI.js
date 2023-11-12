
import fetch from "node-fetch"
export class baidu extends plugin {
  constructor () {
    super({
      name: '阴天[百度搜索伙伴]',
      dsc: '',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      priority: 5000,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#百度(.*)',
          /** 执行方法 */
          fnc: 'baidu'
        }
      ]
    })
  }
async baidu (e) {
let msg = e.msg.replace(/#百度/g,"").trim()

let body = {
  "message": {
    "inputMethod": "keyboard",
    "isRebuild": false,
    "lastMsgId": "",
    "lastMsgIndex": 0,
    "content": {
      "query": msg,
      "qtype": 0,
      "customes": [],
      "botQuery": {},
      "autoQuery": false,
      "pluginQuery": {},
      "pageInfo": {},
      "containerInfo": {
        "containerType": 0,
        "isDegrade": 0
      }
    },
    "sessionId": "",
    "aisearchId": "9382455116598226887",
    "pvId": "11610348848254210203",
    "newTopic": true
  }}

const url = "https://chat-ws.baidu.com/aichat/api/conversation";
const headers = {
  "accept": "text/event-stream",
  "content-type": "application/json",
  "cookie": `BIDUPSID=7804339BCBFBBAE43D756F544E3710F1; BAIDUID=08D591E27010F395C9C2024F7BCAEE20:FG=1; PSTM=1693536860; BAIDUID_BFESS=08D591E27010F395C9C2024F7BCAEE20:FG=1; H_WISE_SIDS_BFESS=216850_213361_214807_110085_244718_261712_236312_256419_256151_265881_266361_267371_265615_268570_268029_265986_259642_269730_269780_268237_269328_269905_267066_256739_270460_270548_271019_271171_271177_271078_257179_267659_271322_271350_265034_271480_266028_270102_271562_271877_271812_269563_234295_234208_269297_272097_272224_272284_267596_272054_272461_272507_253022_272823_272838_271777_260335_272987_273060_267560_273092_272375_273164_273120_273179_273146_273237_273301_273399_273385_271158_270055_273520_272641_273200_271147_273671_273704_272765_264170_270185_263619_273924_273931_274139_274176_269610_273918_273789_273044_272688_256223_272805_274356_272682_274411_272561_274424_274430_271226_272318_197096_274766_274762_274838_274853_274857_274846_270158_274784_275069_272801; ZFY=3v:AQbw0:BUeFCW2O1SoQcicIJzo0QIYNkN8CBCGzhEus:C; BDUSS=hqVVl3UENPYUZ0bC1vc051Unc4R2xJMTl3VVNJRlgzbFBKOHVHSlZaN3hseUpsRUFBQUFBJCQAAAAAAQAAAAEAAAA~-2hVNTU116YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPEK-2TxCvtkdk; BDUSS_BFESS=hqVVl3UENPYUZ0bC1vc051Unc4R2xJMTl3VVNJRlgzbFBKOHVHSlZaN3hseUpsRUFBQUFBJCQAAAAAAQAAAAEAAAA~-2hVNTU116YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPEK-2TxCvtkdk; BDRCVFR[kSyA9a8U-kc]=mk3SLVN4HKm; delPer=0; BA_HECTOR=2l0h242lal0k0g8g85agahad1ifohvk1o; BDORZ=B490B5EBF6F3CD402E515D22BCDA1598; H_WISE_SIDS=216850_213361_214807_110085_244718_261712_236312_256419_256151_265881_266361_267371_265615_268029_265986_259642_269780_268237_269328_269905_267066_256739_270460_270548_271171_271322_265034_271480_266028_270102_271562_271812_234295_234208_269297_272224_272284_267596_272461_253022_272838_271777_260335_272987_273060_267560_272375_273164_273120_273179_273146_273237_273301_273399_273385_270055_273520_272641_273200_271147_273671_273704_272765_264170_270185_263619_273931_274139_274176_269610_273918_273789_273044_272688_256223_272682_274411_272561_274424_272318_197096_274766_274762_274838_274853_274857_274846_270158_275069_272801_275095_267807_267548_273923_275146_272331_275167_274333_275197_275147_274897_274785_269286_271157_275771_270366; ET_WHITELIST=etwhitelistintwodays; BDRCVFR[Gm3feW4UKgs]=I67x6TjHwwYf0; H_PS_PSSID=; PSINO=2`
}
let apifetch = await fetch(url,{
method: "post",
headers: headers,
body: JSON.stringify(body)
})
let res = await apifetch.text()
res = res.replace(/event:ping/g,"").replace(/event:message/g,"").replace(/data:/g,"").replace(/\}\s+\{/g,"},{")
res = "["+res+"]"
let total = JSON.parse(res)
let history = []
let text = ""
let suggestion = "建议问题:\n"
let url2
for(var i = 0;i < total.length;i++){
let message = total[i].data.message.content
if(message){
if(message.generator){
console.log(message.generator)
text += message.generator.text
}
if(message.alaCards){
console.log(message.alaCards)
url2 = "参考网址:"+message.alaCards.url
}
if(message.suggestion){
for(var t = 0;t < message.suggestion.suglist.length;t++){
let suggest = message.suggestion.suglist[t].word
suggestion += `${t+1}:`+message.suggestion.suglist[t].word+"\n"
}
}}
history.push({message})
}
//console.log(history);
e.reply(text)
}}




















