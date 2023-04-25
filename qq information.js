//简单命令:查询,查自己QQ号;查询123456789,查询别人QQ号
import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
let segment = ""
try{
segment =(await import("oicq")).segment
}catch(err){
segment =(await import("icqq")).segment
}

import common from'../../../lib/common/common.js'

export class example extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: 'qq全资料查询',
      /** 功能描述 */
      dsc: 'qq查询',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 5775,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#?查询(.*)$',
          /** 执行方法 */
          fnc: 'cx'
        }
      ]
    })
}

  async cx(e) {
let qq = e.msg.replace(/#?查询/g, "").trim();
if(e.msg == '查询'){
let url = `https://api.kit9.cn/api/qq_material/api.php?qq=${e.user_id}`
let url2 = `https://api.kit9.cn/api/qq_member/api.php?qq=${e.user_id}`
let res = await fetch(url)
res = await res.json()
let res2 = await fetch(url2)
res2 = await res2.json()
let code = res.code
let name = res.data.name
let sign = res.data.sign
let age = res.data.age
let imgurl = res.data.imgurl
let qzoneimgurl = res.data.qzoneimgurl
let tu2 = segment.image(qzoneimgurl)
let tu = segment.image(imgurl)
let country = res.data.country
let level = res.data.level
let clike = res.data.clike
let email = res.data.email
let city = res.data.city
let province = res.data.province
let active_days = res2.data.active_days
let growth_rate = res2.data.growth_rate
let upgrade_days = res2.data.upgrade_days
let isvip_isvip = res2.data.isvip_isvip
let isvip_growth_speed = res2.data.isvip_growth_speed
if(isvip_isvip == '1'){
isvip_isvip = '是会员'
}
if(isvip_isvip == '0'){
isvip_isvip = '非会员'
}
let msg =['昵称:'+name+"\n"+'签名:'+sign+"\n"+'年龄:'+age+"\n"+'QQ等级:'+level+"\n"+"名片赞:"+clike+"\n"+'QQ邮箱:'+"\n"+email+"\n"+'成长速度:'+growth_rate+"\n"+'活跃天数:'+active_days+'天'+"\n"+'下次升级天数:'+upgrade_days+'天'+"\n"+'vip状况:'+isvip_isvip+"\n"+'会员每日成长值:'+isvip_growth_speed+"\n"+'来自国家:'+country+"\n"+'来自省份:'+province+"\n"+'来自城市:'+city+"\n"+'头像:'+"\n",tu,'空间头像:'+"\n",tu2]
e.reply(msg)
}else if(e.msg == `查询${qq}`){
let url = `https://api.kit9.cn/api/qq_material/api.php?qq=${qq}`
let url2 = `https://api.kit9.cn/api/qq_member/api.php?qq=${qq}`
let res = await fetch(url)
res = await res.json()
let res2 = await fetch(url2)
res2 = await res2.json()
let code = res.code
let name = res.data.name
let sign = res.data.sign
let age = res.data.age
let imgurl = res.data.imgurl
let qzoneimgurl = res.data.qzoneimgurl
let tu2 = segment.image(qzoneimgurl)
let tu = segment.image(imgurl)
let country = res.data.country
let level = res.data.level
let clike = res.data.clike
let email = res.data.email
let city = res.data.city
let province = res.data.province
let active_days = res2.data.active_days
let growth_rate = res2.data.growth_rate
let upgrade_days = res2.data.upgrade_days
let isvip_isvip = res2.data.isvip_isvip
let isvip_growth_speed = res2.data.isvip_growth_speed
if(isvip_isvip == '1'){
isvip_isvip = '是会员'
}
if(isvip_isvip == '0'){
isvip_isvip = '非会员'
}
let msg =['昵称:'+name+"\n"+'签名:'+sign+"\n"+'年龄:'+age+"\n"+'QQ等级:'+level+"\n"+"名片赞:"+clike+"\n"+'QQ邮箱:'+"\n"+email+"\n"+'成长速度:'+growth_rate+"\n"+'活跃天数:'+active_days+'天'+"\n"+'下次升级天数:'+upgrade_days+'天'+"\n"+'vip状况:'+isvip_isvip+"\n"+'会员每日成长值:'+isvip_growth_speed+"\n"+'来自国家:'+country+"\n"+'来自省份:'+province+"\n"+'来自城市:'+city+"\n"+'头像:'+"\n",tu,'空间头像:'+"\n",tu2]
e.reply(msg)
}
}
}





















