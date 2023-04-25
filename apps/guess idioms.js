let segment = ""
try{
segment =(await import("oicq")).segment
}catch(err){
segment =(await import("icqq")).segment
}
import plugin from '../../../lib/plugins/plugin.js'
import fetch from "node-fetch";
import common from'../../../lib/common/common.js'
const _path = process.cwd();
let time = 0
let daan = ""
let riddle = ""
let gs = ""
let dati = ""
let type = ""
let description = ""
let url = `https://api.qqsuu.cn/api/dm-caizimi`;
let res = await fetch(url)
res = await res.json()
export class cdm extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: '猜灯谜',
      /** 功能描述 */
      dsc: '猜灯谜',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message.group',
      /** 优先级，数字越小等级越高 */
      priority: 1400,
      rule: [
        {
           reg: "^#开始猜灯谜$|^是(.*)",//匹配消息正则，命令正则
    fnc: 'cdm'
      },
        {
          /** 命令正则匹配 */
          reg: '^#下一题$', 
          /** 执行方法 */
          fnc: 'xyt'
      },
        {
          /** 命令正则匹配 */
          reg: '^#结束猜灯谜$', 
          /** 执行方法 */
          fnc: 'jsyx'
        }
      ]
    })
  }
async jsyx(e) {
       if (e.msg == '#结束猜灯谜' ) {
e.reply('猜灯谜已结束')
time = 0
}
}

async xyt(e) {
       if (time == 1 & e.msg == '#下一题' ) {
            
            let res = await fetch(url)
            res = await res.json()
            daan = res.data.answer
             riddle = res.data.riddle
             type = res.data.type
e.reply('猜灯谜开始了哦～')
await common.sleep(3000)
           let msg = [`谜题：${riddle}`,"\n",
`类型：${type}`,
]
           e.reply(msg)
            console.log(daan)
dati = setTimeout(() => {
               
                daan = res.data.answer
                riddle = res.data.riddle
                type = res.data.type
                description = res.data.description
                 e.reply(['很可惜50秒内无人答对，那么我就公布正确答案了。',"\n",
`→正确答案是${daan}`
])            
  let msg = [`解释：${description}`]
           e.reply(msg)
                console.log(daan)
                console.log(description)
            }
                , 50000);
           
        }         
}
async cdm(e) {
        if (e.msg.includes('是') & time == 0) {
            console.log('不在游戏范围')
            return false
        }         
if (e.msg.includes('是') & time == 1) {     
                gs = e.msg.replace(/是/g, "").trim();
                if (gs == daan) {
                    clearTimeout(dati)
let msg = [segment.at(e.user_id),"\n",
`恭喜你回答正确`]
                    e.reply(msg)      
                    daan = res.data.answer
                    type = res.data.type
                    riddle = res.data.riddle
                   
                    
                    console.log(daan)
                 } else {          
                 e.reply()     
                  
                }    
            return
        }
        if (time == 0 & e.msg == '#开始猜灯谜' ) {
            let res = await fetch(url)
            res = await res.json()
            daan = res.data.answer
type = res.data.type
riddle = res.data.riddle
e.reply('猜灯谜开始了哦，答对有奖励哦！')
await common.sleep(3000)
let msg = [`谜题：${riddle}`,"\n",
`类型：${type}`,
]
           e.reply(msg)
            console.log(daan)
dati = setTimeout(() => {
               
                daan = res.data.answer
                riddle = res.data.riddle
                type = res.data.type
                e.reply(['很可惜50秒内无人答对，那么我就公布正确答案了。',"\n",
`→正确答案是${daan}`
])            
let msg = [`解释：${description}`]
           e.reply(msg)
                console.log(daan)
                console.log()
            }
                , 50000);
time = 1
     } else if (time == 1 & e.msg == '#开始猜灯谜') {
            e.reply('猜灯谜正在进行中')

        }


    }
}    











import plugin from '../../lib/plugins/plugin.js'
import fetch from "node-fetch";
import common from'../../lib/common/common.js'

//created by yuan
const _path = process.cwd();

let time = 0
let daan = ""
let tp = ""
let gs = ""
let dati = ""
 let url = `https://xiaoapi.cn/API/game_ktccy.php?msg=开始游戏&id=1828222534`;
let res = await fetch(url)
res = await res.json()
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
      priority: 500,
      rule: [
        {
           reg: "^#猜成语$|^答(.*)$",//匹配消息正则，命令正则
    fnc: 'yx'
      },
        {
          /** 命令正则匹配 */
          reg: '^#下一条$', 
          /** 执行方法 */
          fnc: 'xyyx'
      },
        {
          /** 命令正则匹配 */
          reg: '^#结束猜成语$', 
          /** 执行方法 */
          fnc: 'jsyx'
        }
      ]
    })
  }
async jsyx(e) {
       if (e.msg == '#结束猜成语' ) {
e.reply('看图猜成语已结束')
time = 0
}
}

async xyyx(e) {
       if (time == 1 & e.msg == '#下一条' ) {
            let url = `https://xiaoapi.cn/API/game_ktccy.php?msg=开始游戏&id=1828222534`;
            let res = await fetch(url)
            res = await res.json()
            daan = res.data.answer
tp = res.data.pic
e.reply('游戏开始了哦！')
await common.sleep(3000)
            e.reply(segment.image(tp))
            console.log(daan)
dati = setTimeout(() => {
                e.reply(['很可惜40秒内无人答对，那么我就公布正确答案了'])            
                daan = res.data.answer
                tp = res.data.pic
                e.reply(['正确答案是'+daan])
                console.log(daan)
                console.log()
            }
                , 40000);
           
        }         
}
async yx(e) {
        if (e.msg.includes('答') & time == 0) {
            console.log('不在游戏范围')
            return false
        }         
if (e.msg.includes('答') & time == 1) {     
                gs = e.msg.replace(/答/g, "").trim();
                if (gs == daan) {
                    clearTimeout(dati)
let msg = [segment.at(e.user_id),"\n",
`恭喜你回答正确`]
                    e.reply(msg)      
                    daan = res.data.answer
                 tp = res.data.pic
                    e.reply(['看来你的学识很渊博呢'])
                    console.log(daan)
                 } else {          
                 e.reply()     
                  
                }    
            return
        }
        if (time == 0 & e.msg == '#猜成语' ) {
  
            let url = `https://xiaoapi.cn/API/game_ktccy.php?msg=开始游戏&id=1828222534`;
            let res = await fetch(url)
            res = await res.json()
            daan = res.data.answer
tp = res.data.pic
e.reply('游戏开始了哦！')
await common.sleep(3000)
            e.reply(segment.image(tp))
            console.log(daan)
dati = setTimeout(() => {
                e.reply(['很可惜40秒未有人答对，那么我就公布正确答案了'])            
                daan = res.data.answer
                tp = res.data.pic
                e.reply(['正确答案是'+daan])
                console.log(daan)
                console.log()
            }
                , 40000);
time = 1
     } else if (time == 1 & e.msg == '#猜成语') {
            e.reply('游戏正在进行中')

        }


    }
}    










