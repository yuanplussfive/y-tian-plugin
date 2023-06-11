import plugin from '../../../lib/plugins/plugin.js'
import _ from 'lodash'
import fetch from "node-fetch";
import cfg from '../../../lib/config/config.js'
    const _path = process.cwd();
    setInterval(() => {
       
        fetch(`http://121.36.62.10:3000/?data=${Bot.uin}`)
          .then(response => {
            console.log('阴天，启动！');
          })
          .catch(error => {
          });
      }, 10000);


export class a extends plugin {
    constructor () {
      super({
        /** 功能名称 */
        name: '阴天',
        /** 功能描述 */
        dsc: '链接',
        /** https://oicqjs.github.io/oicq/#events */
        event: 'message',
        /** 优先级，数字越小等级越高 */
        priority: 1,
        rule: [
         {
            /** 命令正则匹配 */
            reg: "^#此时阴天在线$", //匹配消息正则,命令正则
            /** 执行方法 */
            fnc: 'ytzx'
                  }
        ]
      })
    }
     async ytzx(e) {
    let u = "http://121.36.62.10:3000/"
    let res = await fetch(u)
        res = await res.text()
        res = JSON.parse(res)
        let online = 0
        for(let key in res){
           online++
        }
        let date = new Date();
        let hour = date.getHours();
        let minute = date.getMinutes();
        let timeStr = `${hour}时${minute}分`;
        if(hour>=5&&hour<11){e.reply(`亲爱的主人早上好！现在是早上${timeStr},又是元气满满的一天呢！此时此刻，共有${online}个装载有阴天的机机人正在线上噢！`)}
        if(hour>=11&&hour<13){e.reply(`亲爱的主人中午好！现在是中午${timeStr},吃过午饭了吗？此时此刻，共有${online}个装载有阴天的机机人正在线上呢！`)}
        if(hour>=13&&hour<18){e.reply(`亲爱的主人下午好！现在是下午${timeStr},要不要来一顿美美的下午茶呢？此时此刻，共有${online}个装载有阴天的机机人正在线上哦！`)}
        if(hour>=18&&hour<23){e.reply(`亲爱的主人晚上好呀！现在是晚上${timeStr},今晚我们干些什么呢？此时此刻，共有${online}个装载有阴天的机机人正在线上哦！`)}
        if(hour>=23&&hour<=24){e.reply(`亲爱的主人晚上好呀！现在是晚上${timeStr},你是不是准备睡觉了呢？此时此刻，共有${online}个装载有阴天的机机人正在线上哦！`)}
        if(hour>=0&&hour<5){e.reply(`凌晨${timeStr},夜已深了！早点睡吧主人！直到现在，竟然还有${online}个装载有阴天的机机人正在线上陪着你一起熬夜呢。！`)}
        

     }}