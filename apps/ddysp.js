if(!global.segment){
global.segment = (await import('oicq')).segment
}
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
const _path = process.cwd();
import fs from "fs"
import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import _ from 'lodash'
let g = []
let k = []
let name
let time = 0
import common from'../../../lib/common/common.js'
export class example extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: '阴天[抖音]',
      /** 功能描述 */
      dsc: 'mm',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 1,
      rule: [
        {
          /** 命令正则匹配 */
          reg: "^#?dy(.*)|^/观看(.*)",
          /** 执行方法 */
          fnc: 'dy'
}
      ]
    })
}
async dy(e){
if(e.msg.includes("/观看")){
if(k.length==0||g.length==0||name == ""){
e.reply("你还没有搜索关键词呢")
return false
}
}
if(e.msg.includes("dy")){
g.length=0
k.length = 0
let title = e.msg.replace(/#?dy/g,"").trim()
let url = "https://www.douyin.com/aweme/v1/web/general/search/single/?msToken=04AGy_E-9VNO4jIHqR0QtiGrGWXnBq7HNCd8D48uFM4m0UBmP3_LLs-1T_A9G-p-N5EscypW2UGV1rGyUlmwsE-Oz2OoPIKhKcCzG5BjWCs4FKe-8uUn&X-Bogus=DFSzswVLZI0ANCA1tC8V3Oppgiuhdevice_platform=webapp&aid=6383&channel=channel_pc_web&search_channel=aweme_general&sort_type=0&publish_time=0&keyword="+`${title}`+"&search_source=normal_search&query_correct_type=1&is_filter_search=0&from_group_id=&offset=0&count=15&pc_client_type=1&version_code=190600&version_name=19.6.0&cookie_enabled=true&screen_width=1536&screen_height=1864&browser_language=zh-CN&browser_platform=Win32&browser_name=Edge&browser_version=112.0.1722.64&browser_online=true&engine_name=Blink&engine_version=112.0.0.0&os_name=Windows&os_version=10&cpu_core_num=8&device_memory=8&platform=PC&downlink=1.55&effective_type=3g&round_trip_time=600&webid=7230522786644624955"
let a = await fetch(url, {  
"headers": {    
"cookie": "ttwid=1%7Cv6uiMMlTyemDFKmbsx0oKYRvv5vRyZN2NUaAUxcGsMw%7C1683487286%7C5810129a0f99da318b745a80df31f11629127c8c48a0f61c56a510e7ff3b0fcd; douyin.com; strategyABtestKey=%221683487294.045%22; passport_csrf_token=adbb9214fca7a3ebc4987930726b7a1f; passport_csrf_token_default=adbb9214fca7a3ebc4987930726b7a1f; s_v_web_id=verify_lhdsvg1e_xm79Fx8U_X5mQ_4e0T_BOTF_Sls2hrgxRMus; ttcid=b8131590c360483bbccadbf2880a532c28; csrf_session_id=ab48e7167f0240e4ed5b56bc948e7668; pwa2=%221%7C0%22; passport_assist_user=CkHgfmnFCEOI14XOIrXDZ0g9M-cD2Q8xk56NwTju_wfIr1LX0ZKZS8lOLqCNUPfRLM5rs54mdSmqFPQHLF8XWKA-gRpICjx4TUy1uRTHyhPiBs8z6uhUWuHhKGj0HkBHo-T2LNU9T_y6q422iWKbW0sJzckT_L9eitJcsnGnLhIZI3UQi8KwDRiJr9ZUIgEDF4PS4A%3D%3D; n_mh=Ne9S9LLywAm58bsPdnjqz6P_yHeulG7xxNy9ZjECdOE; sso_uid_tt=02fed9d2b252eebcee7bef470096fa5c; sso_uid_tt_ss=02fed9d2b252eebcee7bef470096fa5c; toutiao_sso_user=7eecfd395cdf8596294260493b669e5a; toutiao_sso_user_ss=7eecfd395cdf8596294260493b669e5a; sid_ucp_sso_v1=1.0.0-KGUxYmJmOGUwZmVmNTNiY2VmOGEwYmQxOTI0OGY5MGIwNWJmOGZiMzgKHwjtgqHwyozuARD69d-iBhjvMSAMMLjDq4oGOAZA9AcaAmhsIiA3ZWVjZmQzOTVjZGY4NTk2Mjk0MjYwNDkzYjY2OWU1YQ; ssid_ucp_sso_v1=1.0.0-KGUxYmJmOGUwZmVmNTNiY2VmOGEwYmQxOTI0OGY5MGIwNWJmOGZiMzgKHwjtgqHwyozuARD69d-iBhjvMSAMMLjDq4oGOAZA9AcaAmhsIiA3ZWVjZmQzOTVjZGY4NTk2Mjk0MjYwNDkzYjY2OWU1YQ; odin_tt=be32cfbc870a5e8d0bb201378968386dc7f93172a3e2be2970c94375c85e68938058378c4e02696f29866f191f1b13e19076f6ca649d8b5f47b82397495ac068; passport_auth_status=29b41c394314092638eed93f38ce0fd6%2C; passport_auth_status_ss=29b41c394314092638eed93f38ce0fd6%2C; uid_tt=55a66fee9a5bfd6144ec960d253dea02; uid_tt_ss=55a66fee9a5bfd6144ec960d253dea02; sid_tt=6c622497908703c2d9beee84cee29433; sessionid=6c622497908703c2d9beee84cee29433; sessionid_ss=6c622497908703c2d9beee84cee29433; __ac_nonce=06457fafc00637a7140ad; publish_badge_show_info=%220%2C0%2C0%2C1683487508885%22; VIDEO_FILTER_MEMO_SELECT=%7B%22expireTime%22%3A1684092308905%2C%22type%22%3A1%7D; LOGIN_STATUS=1; store-region=us; store-region-src=uid; passport_fe_beating_status=true; sid_guard=6c622497908703c2d9beee84cee29433%7C1683487516%7C5183969%7CThu%2C+06-Jul-2023+19%3A24%3A45+GMT; sid_ucp_v1=1.0.0-KGM3ZjY0Y2VkMWVlMmFlOGQ1MzVkYTM3ZmY3ZmYyYTNkYmZlMTc2NTIKGwjtgqHwyozuARCc9t-iBhjvMSAMOAZA9AdIBBoCbHEiIDZjNjIyNDk3OTA4NzAzYzJkOWJlZWU4NGNlZTI5NDMz; ssid_ucp_v1=1.0.0-KGM3ZjY0Y2VkMWVlMmFlOGQ1MzVkYTM3ZmY3ZmYyYTNkYmZlMTc2NTIKGwjtgqHwyozuARCc9t-iBhjvMSAMOAZA9AdIBBoCbHEiIDZjNjIyNDk3OTA4NzAzYzJkOWJlZWU4NGNlZTI5NDMz; bd_ticket_guard_client_data=eyJiZC10aWNrZXQtZ3VhcmQtdmVyc2lvbiI6MiwiYmQtdGlja2V0LWd1YXJkLWl0ZXJhdGlvbi12ZXJzaW9uIjoxLCJiZC10aWNrZXQtZ3VhcmQtY2xpZW50LWNlcnQiOiItLS0tLUJFR0lOIENFUlRJRklDQVRFLS0tLS1cbk1JSUNGRENDQWJxZ0F3SUJBZ0lVTk10cVA2NGFFNi81YXllR0Yxenk4cE83RmZ3d0NnWUlLb1pJemowRUF3SXdcbk1URUxNQWtHQTFVRUJoTUNRMDR4SWpBZ0JnTlZCQU1NR1hScFkydGxkRjluZFdGeVpGOWpZVjlsWTJSellWOHlcbk5UWXdIaGNOTWpNd05UQTNNVGt5TkRRMFdoY05Nek13TlRBNE1ETXlORFEwV2pBbk1Rc3dDUVlEVlFRR0V3SkRcblRqRVlNQllHQTFVRUF3d1BZbVJmZEdsamEyVjBYMmQxWVhKa01Ga3dFd1lIS29aSXpqMENBUVlJS29aSXpqMERcbkFRY0RRZ0FFMkZuWjUvcDNxSEQxYU1XVzNvQ3orbUttZW5kbCtBOHRUdC9XbktJaUpEMHVTN3NCNmM4VU5yRlZcbldOK1BnOFoxV3FlV0RrYjFWTXhVc0ZpLzJnRS9aNk9CdVRDQnRqQU9CZ05WSFE4QkFmOEVCQU1DQmFBd01RWURcblZSMGxCQ293S0FZSUt3WUJCUVVIQXdFR0NDc0dBUVVGQndNQ0JnZ3JCZ0VGQlFjREF3WUlLd1lCQlFVSEF3UXdcbktRWURWUjBPQkNJRUlIV1YwakNaVHc5Tkt5OW1QMU44MUFyVGNQc0ZYNE1IWWxzR2FhdlJWem9OTUNzR0ExVWRcbkl3UWtNQ0tBSURLbForcU9aRWdTamN4T1RVQjdjeFNiUjIxVGVxVFJnTmQ1bEpkN0lrZURNQmtHQTFVZEVRUVNcbk1CQ0NEbmQzZHk1a2IzVjVhVzR1WTI5dE1Bb0dDQ3FHU000OUJBTUNBMGdBTUVVQ0lBOWV0dzZJNUxpY3krSllcbkVZMmlOY0dRVUt0S0djWThHNFpTK3psSnFLcDJBaUVBaERST3VPY0Fia2JxU1lnSklCNzVtMHNMSGt0bHNQclNcbm1KV2hqOWtuTHM4PVxuLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLVxuIn0=; bd_ticket_guard_server_data=; SEARCH_RESULT_LIST_TYPE=%22single%22; msToken=6rw1UuOS9AeYYhX8X54G1kDtpKTh9UND6bXrIBJb8pIrtNOlWQ38v9njkG3ackIMa5ERwWUBkypEXfEu8xR3ml3nXcLPdIDm_1_waizNhuEPHhBIWtZg; home_can_add_dy_2_desktop=%221%22; tt_scid=bkYWEi5GdMiB8mmKZQoZWLXkIV-rbA9p2zOlf242c.ZrSNYD48Hrde8G4bIvxrRn5149; download_guide=%223%2F20230508%22; msToken=04AGy_E-9VNO4jIHqR0QtiGrGWXnBq7HNCd8D48uFM4m0UBmP3_LLs-1T_A9G-p-N5EscypW2UGV1rGyUlmwsE-Oz2OoPIKhKcCzG5BjWCs4FKe-8uUn",    
"Referer": "https://www.douyin.com/search/%E6%B3%A1%E6%B2%AB?aid=9ed9a295-60d1-406a-9cf5-18ddcd2382c7&publish_time=0&sort_type=0&source=normal_search&type=general",    
"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.64"
}
});
a = await a.json()
//console.log(a.data)
let length = a.data.length
for(let l = 1;l<length;l++){
//console.log(typeof(a.data[l].aweme_info))
if(typeof(a.data[l].aweme_info)==="object"){
let data = await a.data[l].aweme_info.aweme_id
let desc = await a.data[l].aweme_info.desc
if(typeof(a.data[l].aweme_info.video.cover) !== "undefined"){
let uri =  await a.data[l].aweme_info.video.cover.url_list[0]
k.push({title:desc,uri:uri})
}
g.push(data)
}
}
//console.log(k)

let op = k
for (let i = 0; i < op.length; i++) {
op[i].title= op[i].title.replace(/<em class="keyword">/g, "").trim()
            op[i].title = op[i].title.replace(/<\/em>/g, "").trim()

}
let data = {
						tplFile: `{_path}/plugins/y-tian-plugin/resources/html/dy.html`,
						dz: _path,
						nr2:op,
          
					}
					let img = await puppeteer.screenshot("777", {
						...data,
					});
e.reply(img)
}
if(e.msg.includes("/观看")&&g.length!==0&&k.length!==0){
let ag = e.msg.replace("/观看","").trim()
let ghb = "https://www.douyin.com/video/"+g[ag-1]
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
if(hh == "undefined"){
e.reply("解析失败了.....换个观看吧！")
return false
}
console.log("解析成功,地址为:"+hh)
let response = await fetch(hh);
let buff = await response.arrayBuffer();
var filename = "./resources/dy.mp4";
fs.writeFileSync(`${filename}`, Buffer.from(buff), "binary", );
if (fs.existsSync(filename)) {
fs.stat(`${filename}`, (err, stats) => {
if (err) throw err;
let dx = Math.round(stats.size/1048576)
if(dx >= 100){
e.reply(`解析文件大小为 ${dx} MB，太大了发不出来，诶嘿,给你无水印地址:${hh}`)
g.length=0
k.length = 0
return false
}else{
e.reply([segment.video(filename)])
g.length=0
k.length = 0
}
});
}
}
}
}


















