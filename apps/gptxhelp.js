
const _path = process.cwd();
import plugin from '../../../lib/plugins/plugin.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
export class example extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: '阴天[gpthelp]',
      /** 功能描述 */
      dsc: 'mm',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 5551,
      rule: [
        {
          /** 命令正则匹配 */
          reg: "^#?gpt?(help|帮助)",
          /** 执行方法 */
          fnc: 'help'
        }
      ]
    })
}

async help(e){
let data = {
					      	tplFile: `${_path}/plugins/y-tian-plugin/resources/html/gpthelp.html`,
							dz:_path + "/plugins/y-tian-plugin/resources/css/NZBZ.ttf",
                            dz2:_path + "/plugins/y-tian-plugin/resources/css/jty.OTF"
					}
					let img = await puppeteer.screenshot("777", {
						...data,
					});
e.reply(img)
}
}


















