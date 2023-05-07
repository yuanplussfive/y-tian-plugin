
import plugin from '../../../lib/plugins/plugin.js'
import fetch from "node-fetch";
import common from'../../../lib/common/common.js'
const _path = process.cwd();
import fs from "fs"
let  dirpath = _path + "/plugins/y-tian-plugin/background/星穹铁道/角色"
let CD = {};
let GetCD = true; //是否开启CD,默认开启
let CDTime = 30;//CD单位分钟
export class ktccy extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: '看图猜成语',
      /** 功能描述 */
      dsc: '看图猜成语',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message.group',
      /** 优先级，数字越小等级越高 */
      priority: 1,
      rule: [
        {
           reg: "^/今日跃迁$",//匹配消息正则，命令正则
    fnc: 'yq'
      }
      ]
    })
  }
async yq(e) {
if (CD[e.user_id] && GetCD === true) {
        e.reply("每30分钟最多抽一次哦~");
        return true;
    }
CD[e.user_id] = true;
CD[e.user_id] = setTimeout(() => {
if (CD[e.user_id]) {
delete CD[e.user_id];
}
}, CDTime*60000);
let num = fs.readdirSync(dirpath)
console.log(num)
let random = Math.floor(Math.random() *num.length); 
let ming = num[random];
let me = ming.replace(".jpg","")
e.reply(`恭喜你抽到了${me}`)
e.reply([segment.image(dirpath + "/" +ming)])


    }
}    

















