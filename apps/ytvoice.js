import plugin from '../../../lib/plugins/plugin.js'
let segment = ""
try{
    segment =(await import("oicq")).segment
    }catch(err){
    segment =(await import("icqq")).segment
    }
    const _path = process.cwd();

 let qq2
export class example extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: 'DJ表情插件',
      /** 功能描述 */
      dsc: '表情制作',

      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 1000,
      rule: [
        
        {
          /** 命令正则匹配 */
          reg: '^#阴天语音(.*)$',
          /** 执行方法 */
          fnc: 'yy'
        }, 
        {
          /** 命令正则匹配 */
          reg: '^#阴天语音帮助',
          /** 执行方法 */
          fnc: 'yylb'
        }, 
        {
          /** 命令正则匹配 */
          reg: '^#原神KFC语音',
          /** 执行方法 */
          fnc: 'kfc'
        },  
        {
          /** 命令正则匹配 */
          reg: '^#绿茶语音',
          /** 执行方法 */
          fnc: 'lc'
        }, 
        
      ]
    })
  }



            async yy (e){
if(e.msg=='#阴天语音帮助'){return false}else{
              qq2 = e.msg.replace('#阴天语音','').trim()
                 let url ='http://xiaobapi.top/api/xb/api/voice_packet.php?msg='+qq2
                 console.log(url)
                 let URL =encodeURI(url)
                 console.log(URL)
                 await e.reply(segment.record(URL))
}
          
          
       }
       async yylb (e){

           await e.reply('发送：#阴天语音+人物 \n人物语音列表：阿嫲，杰哥，彬彬，阿伟，淑慧阿姨，电棍，炫神，山泥若，卢本伟，呆妹，孙笑川，药水哥，旭旭宝宝，大司马，周淑怡，茄子，PDD，包桑，王思聪，小猪佩奇，楚云飞，李云龙，哲学，JOJO，王司徒，波澜哥，蔡徐坤，刘海柱，乔碧萝，郭老师，金坷垃，寒王，冬泳怪鸽，章金莱，老八，阿福，giao，切格瓦拉。\n其他语音请回复： #原神KFC语音   和  #绿茶语音  获取。')
      }
      async kfc (e){
        let url ='http://api.caonm.net/api/kfc/kfc.php'
        console.log(url)
        let URL =encodeURI(url)
        console.log(URL)
        await e.reply(segment.record(URL))
        
   }

async lc (e){
  let url ='http://xiaobapi.top/api/xb/api/lvcha.php'
  console.log(url)
  let URL =encodeURI(url)
  console.log(URL)
  await e.reply(segment.record(URL))
    
    }}