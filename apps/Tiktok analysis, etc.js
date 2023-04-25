import fs from "fs"
import fetch from 'node-fetch'
import common from'../../lib/common/common.js'
const _path = process.cwd();
import request from 'request'
let dirpath = _path + "/resources/douyingjx"
let segment = ""
let nmn = ""
let xx = ""
var reg = /(https?|http|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/g;
try{
segment =(await import("oicq")).segment
}catch(err){
segment =(await import("icqq")).segment
}
import {createRequire} from "module";
let di = ""
const require = createRequire(import.meta.url);
if (!fs.existsSync(dirpath)) {
			fs.mkdirSync(dirpath);
		  }

export class example extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: 'dy',
      /** 功能描述 */
      dsc: '抖音解析等',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 50,
      rule: [
          {
           /** 命令正则匹配 */
          reg: '^#查ip$',
          /** 执行方法 */
          fnc: 'ip'
          },{
           /** 命令正则匹配 */
          reg: '^#查ping(.*)$',
          /** 执行方法 */
          fnc: 'ping'
          },{
           /** 命令正则匹配 */
          reg: 'https://v.douyin.com(.*)',
          /** 执行方法 */
          fnc: 'jx3'
          },{
         /** 命令正则匹配 */
          reg: "^#?小王(.*)$",
          /** 执行方法 */
          fnc: 'o'
          },{
          /** 命令正则匹配 */
          reg: "^#?转emoji(.*)",
          /** 执行方法 */
          fnc: 'emoji'
          },{
          /** 命令正则匹配 */
          reg: "^#估价(.*)",
          /** 执行方法 */
          fnc: 'gj'
       }
      ]
    })
  }
async gj(e){
let wz = e.msg.replace(/#估价/g, "")
let at = e.message.filter(item => item.type == 'at')?.map(item => item?.qq)
console.log(at)
if(wz == ""){
let url = `https://v.api.aa1.cn/api/qqgj-v2/?qq=${at}`
let res = await fetch(url)
res = await res.text()
let answer = res.replace(/"code":200,/g,"").replace("gl","规律").replace("ws","位数").replace("money","估值").replace("{","").replace("}","")
e.reply(answer)
return
}else{
let url = `https://v.api.aa1.cn/api/qqgj-v2/?qq=${wz}`
let res = await fetch(url)
res = await res.text()
let answer = res.replace(/"code":200,/g,"").replace("gl","规律").replace("ws","位数").replace("money","估值").replace("{","").replace("}","")
e.reply(answer)
return
}
}
async jx3(e){
let fg = e.msg.match(reg)
//console.log(fg)
let fg2 = String(fg)
//console.log(fg2)
var start = new Date().getTime()
let options = await fetch(fg2,{
headers:{
followRedirect: false,
"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/111.0.1661.51"
}})
console.log(options.url)
let str = options.url
var re = RegExp(/www.iesdouyin.com/);
if(str.match(re)){
await this.jx(e)
}else{
await this.jx2(e)
}
}
async ping(e) {
var re = /(https?|http|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/g;
let url2 = e.msg.match(re)
console.log(url2)
let url = `https://v.api.aa1.cn/api/api-ping/ping.php?url=${url2}`
let res = await fetch(url)
res = await res.json()
let host = await res.host
let ip = await res.ip
let pingmin = await res.ping_time_min
let pingmax = await res.ping_time_max
let location = await res.location
let node = await res.node
console.log(res)
let msg = ["网站:",host,"\n","ip:",ip,"\n","最小延迟:",pingmin,"\n","最大延迟:",pingmax,"\n","地址:",location,"\n","备案:",node]
e.reply(msg)
}
async ip(e) {
if(e.group){
e.reply("为了您的安全，查ip仅限私聊")
return
}
let url = "https://v.api.aa1.cn/api/myip/index.php?aa1=json"
let res = await fetch(url)
res = await res.json()
let myip = await res.myip
e.reply(myip)

  }
async emoji(e) {
let wz = e.msg.replace(/#?转emoji/g, "").trim();
let url = `https://xiaobai.klizi.cn/API/other/emoji_change.php?msg=${wz}`
let res = await fetch(url)
res = await res.json()
let msg = await res.msg
e.reply(msg)
}
async o(e) {
let wz = e.msg.replace(/#?小王/g, "").trim();
let url = `https://xiaobai.klizi.cn/API/other/wzyyb.php?msg=${wz}`
let res = await fetch(url);
res = await res.json()
console.log('请求成功')
let w = await fetch(url)
w = await w.text()
let gs = ((w.match(/http/g)).length)-2
let num = Math.round(Math.random()*gs)
let ying = await res.yy_4e[num].yywa1_f2
let Ying = await res.yy_4e[num].yyyp_9a
e.reply(ying)
e.reply([segment.record(Ying)])
console.log(num)
}

async jx4(e){
let fg = e.msg.match(reg)
console.log(fg)
let fg2 = String(fg)
console.log(fg2)
var start = new Date().getTime()
request({url: fg2, followRedirect: false}, function(error, response, body) {
console.log(response.statusCode);
if(response.statusCode >= 300 && response.statusCode < 400) {
//console.log(response.headers.location);
let op = response.headers.location
let o = op.match("video/(.*?)/")
o = `${o}`
let k = o.replace("video/(.*?)/")
let m = k.split(",")
nmn = m[1]
}
});
}
async jx(e){
await this.jx4(e)
await common.sleep(500)
await this.jx5(e)
}

async jx5(e){
e.reply("正在解析中，请稍等片刻~")
let ghb = "https://www.douyin.com/video/"+nmn
console.log(ghb)
let gh =await fetch(ghb,{
method:"GET",
headers:{
'cookie': 'douyin.com; __ac_referer=https://www.douyin.com/video/7200695840900468008?previous_page=app_code_link; ttwid=1|j0PqIlrsmT-PHeVL26MUtN9yWhDtKz30FgIuxpGtk80|1674043522|ae7ca62b2f5b11ae675d1dbaa91768445c433af4faf7c61f1f7c5f52eece4bf9; passport_csrf_token=aaa188ac0b7b481a1380949b67d3d703; passport_csrf_token_default=aaa188ac0b7b481a1380949b67d3d703; s_v_web_id=verify_lfl7886x_rxeSUCen_4cnm_48bF_9NrH_hxQbP70AdImW; download_guide="3/20230324"; _tea_utm_cache_2018=undefined; douyin.com; VIDEO_FILTER_MEMO_SELECT={"expireTime":1680431163129,"type":1}; strategyABtestKey="1679854423.401"; SEARCH_RESULT_LIST_TYPE="single"; bd_ticket_guard_client_data=eyJiZC10aWNrZXQtZ3VhcmQtdmVyc2lvbiI6MiwiYmQtdGlja2V0LWd1YXJkLWNsaWVudC1jc3IiOiItLS0tLUJFR0lOIENFUlRJRklDQVRFIFJFUVVFU1QtLS0tLVxyXG5NSUlCRFRDQnRRSUJBREFuTVFzd0NRWURWUVFHRXdKRFRqRVlNQllHQTFVRUF3d1BZbVJmZEdsamEyVjBYMmQxXHJcbllYSmtNRmt3RXdZSEtvWkl6ajBDQVFZSUtvWkl6ajBEQVFjRFFnQUV1ZVZvbHhpVERqR25HYzVWK2NSTnRmS2JcclxuNzZvRTFIczlCTmhFeGQ0QmVPR1Q1RWlQQzlEdWFGUm1ma2FTMENEcW5KUlpHa1pLcEsydklKV0Nwek1naHFBc1xyXG5NQ29HQ1NxR1NJYjNEUUVKRGpFZE1Cc3dHUVlEVlIwUkJCSXdFSUlPZDNkM0xtUnZkWGxwYmk1amIyMHdDZ1lJXHJcbktvWkl6ajBFQXdJRFJ3QXdSQUlnZitHRUdXeElNVFluV2dXMFh1VmxVUG1WZnVPcXRIQkJRZS93cFcyN1B3VUNcclxuSUFnRGE2ZmFKQUQxOXhjelBXaVNoMFk4d3Q0MXpNYVdhWVpNLytWRm05VWxcclxuLS0tLS1FTkQgQ0VSVElGSUNBVEUgUkVRVUVTVC0tLS0tXHJcbiJ9; home_can_add_dy_2_desktop="1"; tt_scid=qvEA8Gi93gEWYCi7W.93G0Ol7J-0IHK3Jxth6ueDiJFEyzUYR1NJ2QE-raZzeKOB10ea; msToken=Glj54AQpSCmhHYCkgIt17ZW7MMpZJFGU8xqlVAZ-kgMKKdGFtDQj1BCkfATvT0oUZGpMCXvevAQ0__0WbYO61zVGcyDVfLQAEDQS3qgr0D9Ra88XvBOgUqF0C1OZMAQ=; __ac_nonce=06420a6c9000781ffd1c5; __ac_signature=_02B4Z6wo00f01NwaGsgAAIDBKWXwVnVeJKjcKh5AAFMrbprNm0cHIYv-FNwvshbfXRPVsd6gDwAPXgX-KbFn4PJGV8edUNszVZjUiF15OfNwVcLvBrVSSMxd4ZVRj4ho8n3lTbugUwFptnl98c; __ac_referer=__ac_blank; msToken=cF1l5QZStCUviBVUb2ZJLvblsw3e4qnbOFy0WscazP6ZJ3FXyDgTYoI8sQIgT3dnYGjRoXsTvABkJhDpzf6JRwR6Uby7_nBp1wq6r1XN6VuntHZN1b1QGG6IMCub_VE=',
"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/111.0.1661.51"
}})
gh = await gh.text()
let vd = gh.match(/src%22%3A%22%2F%2Fv26(.*?)%22%7D%2C%7B%22/g)
vd = `${vd}`
let gg = vd.split(",")
let hh = decodeURIComponent(gg[1])
hh = hh.replace('src":"',"https:").replace('"},{"',"")
console.log("解析成功,地址为:"+hh)
let response = await fetch(hh);
let buff = await response.arrayBuffer();
var filename = `jx.mp4`;
fs.writeFileSync(`${dirpath}/${filename}`, Buffer.from(buff), "binary", );
if (fs.existsSync(dirpath + "/" + filename)) {
fs.stat(`${dirpath}/${filename}`, (err, stats) => {
if (err) throw err;
let dx = Math.round(stats.size/1048576)
if(dx >= 200){
e.reply(`解析文件大小为 ${dx} MB，太大了发不出来，诶嘿,给你无水印地址:${hh}`)
return false
}else{
e.reply([segment.video(dirpath + "/" + filename)])
}
});
}

}
async jx2(e){
await this.jx6(e)
await common.sleep(500)
await this.jx7(e)
}
async jx6(e){
let fg = e.msg.match(reg)
console.log(fg)
let fg2 = String(fg)
console.log(fg2)
request({url: fg2, followRedirect: false}, function(error, response, body) {
   // console.log(response);
    if (response.statusCode == 302) {
 console.log(response.headers.location);
di = response.headers.location
 }
});
}
async jx7(e){
e.reply("正在解析中，请稍等片刻~")
di = `${di}`
let d = di.indexOf("?")
let f = di.substring(0,d)
f = f.replace("https://www.iesdouyin.com/share/user/","https://www.douyin.com/user/")
console.log(f)
let res = await fetch(f,{
"headers":{
"referer":"www.douying.com",
"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.34",
cookie:'douyin.com; ttwid=1|j0PqIlrsmT-PHeVL26MUtN9yWhDtKz30FgIuxpGtk80|1674043522|ae7ca62b2f5b11ae675d1dbaa91768445c433af4faf7c61f1f7c5f52eece4bf9; passport_csrf_token=aaa188ac0b7b481a1380949b67d3d703; passport_csrf_token_default=aaa188ac0b7b481a1380949b67d3d703; s_v_web_id=verify_lfl7886x_rxeSUCen_4cnm_48bF_9NrH_hxQbP70AdImW; strategyABtestKey="1681021323.19"; bd_ticket_guard_client_data=eyJiZC10aWNrZXQtZ3VhcmQtdmVyc2lvbiI6MiwiYmQtdGlja2V0LWd1YXJkLWl0ZXJhdGlvbi12ZXJzaW9uIjoxLCJiZC10aWNrZXQtZ3VhcmQtY2xpZW50LWNzciI6Ii0tLS0tQkVHSU4gQ0VSVElGSUNBVEUgUkVRVUVTVC0tLS0tXHJcbk1JSUJEVENCdFFJQkFEQW5NUXN3Q1FZRFZRUUdFd0pEVGpFWU1CWUdBMVVFQXd3UFltUmZkR2xqYTJWMFgyZDFcclxuWVhKa01Ga3dFd1lIS29aSXpqMENBUVlJS29aSXpqMERBUWNEUWdBRXVlVm9seGlURGpHbkdjNVYrY1JOdGZLYlxyXG43Nm9FMUhzOUJOaEV4ZDRCZU9HVDVFaVBDOUR1YUZSbWZrYVMwQ0RxbkpSWkdrWktwSzJ2SUpXQ3B6TWdocUFzXHJcbk1Db0dDU3FHU0liM0RRRUpEakVkTUJzd0dRWURWUjBSQkJJd0VJSU9kM2QzTG1SdmRYbHBiaTVqYjIwd0NnWUlcclxuS29aSXpqMEVBd0lEUndBd1JBSWdmK0dFR1d4SU1UWW5XZ1cwWHVWbFVQbVZmdU9xdEhCQlFlL3dwVzI3UHdVQ1xyXG5JQWdEYTZmYUpBRDE5eGN6UFdpU2gwWTh3dDQxek1hV2FZWk0vK1ZGbTlVbFxyXG4tLS0tLUVORCBDRVJUSUZJQ0FURSBSRVFVRVNULS0tLS1cclxuIn0=; SEARCH_RESULT_LIST_TYPE="single"; pwa2="1|0"; csrf_session_id=b240df9451c4fea6b5730639345f7aa2; msToken=qixBYgryrS09NVYlIct1StsaKFrNf0xpaw5CWjpOwJv8GYra1KZnrUBHSMjFLQ5r-wA0N5d2ixAAaDuixoqwUC_nRGsuzET4N3xm-hbZLB4A5Ys3SXZRFA==; download_guide="3/20230409"; __ac_nonce=06432676d00314d6851a9; __ac_signature=_02B4Z6wo00f01D3HRxAAAIDByLitj5Ws6ug950OAAGtKTAmmzVV8JYDl1izRpD1k-4l1F4LaGi2qVYorfxypuiWFxcbNlytNzZzTDM6WXCNC1BUsDO4-JN.Xo-frFd6dqbHlqegsdEYdw4733a; home_can_add_dy_2_desktop="1"; msToken=1iS5gKlx_-hgrnTik_w4UpahPUXAM_y1iXtd5IjuOW-f5aoDL3jSloJhKT0Jetvfee5mu4LyoUD0z1DuMNeVcouMU1nn1YrNDqEvCetoOScHEuxhmTz_Cw==; tt_scid=y6nExLv3BXC4K.v8QtXs-z5SNK35Dum3kKOzuTcsmQ22onH6F.uOjgeZt8XlRpIB035b'
}
})
console.log(res.status)
if(res.status=="200"){
res = await res.text()
fs.writeFileSync("yy.json",`${res}`,"utf-8")
let content = res.match(/content="(.*?)"/g)
content = `${content}`
//console.log(res)
let index = content.indexOf("content",content.indexOf("content",content.indexOf("content")+1)+1)
let c = content.substring(0,index)
c = c.replace(/content=/g,"").replace(/"/g,"")
e.reply(c)
}

}

}
















