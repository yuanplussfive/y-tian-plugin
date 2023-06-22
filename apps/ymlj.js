import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import common from'../../../lib/common/common.js'
import fs from 'fs'

export class example extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: '阴天[域名查看]',
      /** 功能描述 */
      dsc: '攻略',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 4000,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#?域名(.*)$',
          /** 执行方法 */
          fnc: 'gl'
}
      ]
    })
}
async gl(e){
let mg = e.msg.replace(/#?域名/g, "").trim();
let url = `https://xiaoapi.cn/API/zs_lj.php?url=${mg}`
let res = await fetch(url)
res = await res.json()
let code = res.code
let qq = res.qq_msg
let vx = res.vx_msg
let icp_name = res.icp_name
let icp = res.icp
let msg = [`查询的url:${mg}`,"\n",`QQ内状态:${qq}`,"\n",`微信内状态:${vx}`,"\n",`备案单位:${icp_name}`,"\n",`备案号:${icp}`,]
if(code == '200'){
e.reply(msg)
}else if(code == '201')
e.reply('当前域名无法查询')
}
}



























