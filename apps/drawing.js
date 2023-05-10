import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import fs from 'fs'
if(!global.segment) {  
global.segment = (await import('oicq')).segment
}
let style;
let cy
let apikey = "";
var dirpath = "./resources/ht"
if (!fs.existsSync(dirpath)) {
			fs.mkdirSync(dirpath);
}
export class example extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: '阴天[drawing]',
      /** 功能描述 */
      dsc: '画图',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 1,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#ht(.*)$',
          /** 执行方法 */
          fnc: 'ss'
       },{
          /** 命令正则匹配 */
          reg: '^#?更改style(.*)$|^#?style帮助$',
          /** 执行方法 */
          fnc: 'gg'
       },{
          /** 命令正则匹配 */
          reg: '^#?更改采样(.*)$|^#?采样帮助$',
          /** 执行方法 */
          fnc: 'cy'
       },{
          /** 命令正则匹配 */
          reg: '^#?填写apikey(.*)$',
          /** 执行方法 */
          fnc: 'txkey'
       }
      ]
    })
  }
async txkey(e){
let gs = e.msg.replace(/#?填写apikey/g, "").trim();
fs.writeFileSync(dirpath+ "/" + "data.json",JSON.stringify({
    "user":{
        "apikey":gs
    }
}))
e.reply("成功填写apikey")
}
async cy(e){
if(e.msg.includes("采样帮助")){
let msg = "支持的采样器有: ddim, lmsd, pndm,euler_d, euler_a_d, dpm.默认值: ddim,请发送更改采样+内容"
e.reply(msg)
}
if(e.msg.includes("更改采样")){
let gs = e.msg.replace(/#?更改采样/g, "").trim();
cy = gs
e.reply(`更改成功,现在采样为${cy}`)
}
}
async gg(e){
if(e.msg.includes("style帮助")){
let msg = "→生成图片的风格配置。        支持的风格有:[国画, 写实主义, 虚幻引擎, 黑白插画, 版绘, 低聚, 工业霓虹, 电影艺术, 史诗大片, 暗黑, 涂鸦, 漫画场景, 特写, 儿童画, 油画, 水彩画, 素描, 卡通画, 浮世绘, 赛博朋克, 吉卜力, 哑光, 现代中式, 相机, CG渲染, 动漫, 霓虹游戏, 蒸汽波, 宝可梦, 火影忍者, 圣诞老人, 个人特效, 通用漫画,Momoko, MJ风格, 剪纸, 齐白石, 张大千, 丰子恺, 毕加索, 梵高, 塞尚, 莫奈, 马克·夏加尔, 丢勒, 米开朗基罗, 高更, 爱德华·蒙克, 托马斯·科尔, 安迪·霍尔, 新海诚, 倪传婧, 村上隆, 黄光剑, 吴冠中, 林风眠, 木内达朗, 萨雷尔, 杜拉克, 比利宾, 布拉德利, 普罗旺森, 莫比乌斯, 格里斯利, 比普, 卡尔·西松, 玛丽·布莱尔, 埃里克·卡尔, 扎哈·哈迪德, 包豪斯, 英格尔斯, RHADS, 阿泰·盖兰, 俊西, 坎皮恩, 德尚鲍尔, 库沙特, 雷诺阿]"+"\n"+"→请发送更改style+名称"
e.reply(msg)
return true
}
if(e.msg.includes("更改style")){
let gs = e.msg.replace(/#?更改style/g, "").trim();
style = gs
e.reply(`更改成功,现在style为${style}`)
}
}
async ss(e) {
console.log(apikey)
if (fs.existsSync(dirpath + "/" + "data.json")){
let y = JSON.parse(fs.readFileSync(dirpath + "/" +"data.json"))
apikey = y.user.apikey
}
if(apikey == ""){
e.reply("你还没有填写apikey,用不了画图呢,请前往http://flagstudio.baai.ac.cn/注册登录获取apikey,然后私聊你机器人发#填写apikey+获取值,每天免费500张")
return false
}
let gs = e.msg.replace(/#ht/g, "").trim();
let url = `https://flagopen.baai.ac.cn/flagStudio/auth/getToken?apikey=${apikey}`
let a = await fetch(url,{
headers :{
"Accept": "application/json",
'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.64'
}
})
a = await a.json()
console.log(a)
console.log(style)
let token = await a.data.token
let url2 = "https://flagopen.baai.ac.cn/flagStudio/v1/text2img"
let b = await fetch(url2,{
method:"post",
body:JSON.stringify({
    "prompt": gs,
    "guidance_scale": 7.5,
    "height": 768,
    "sampler": "euler_a_d",
    "steps": 100,
    "style": style,
    "upsample": 1,
    "width": 768
}),
headers :{
    "Content-Type": "application/json",
    "Accept": "application/json",
    "token": token,
'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.64'
}
})
b = await b.json()
let img = await b.data
//console.log(img)
var Data = atob(img);
fs.writeFileSync("./resources/ht.jpg", Data,
"binary", );
e.reply(segment.image("./resources/ht.jpg"))
}

}





























