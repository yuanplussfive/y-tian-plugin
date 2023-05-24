import cfg from '../../lib/config/config.js'
let blacklist = []
export class example extends plugin {
    constructor() {
      super({
        name: '阴天example',
        dsc: 'test',
        event: 'message',
        priority: 1,
        rule: [{
          reg: '^#针对(.*)',
          fnc: 'zhendui'
        },{
          reg: '.*',
          fnc: 'jianting'
        },
        {
          reg: '^#取消针对(.*)',
          fnc: 'quxiao'
        },]
      });
  
     
    }
  
    async  zhendui(e) {
    if(e.user_id==cfg.masterQQ[0]){
      if(!/\d/.test(e.msg)) {
        let targetQQ = e.at;
        blacklist.push(targetQQ)
        e.reply('已经开始针对他了！')
        
    }else{e.reply("请艾特一个群员");return false}
   }else{e.reply("你不是主人哦");return false}}
   async  quxiao(e) {if(e.user_id==cfg.masterQQ[0]){
    if(!/\d/.test(e.msg)) {
      let targetQQ = e.at;
   if(!blacklist.includes(targetQQ)){e.reply("他没有被针对哦")}else{
blacklist.splice(blacklist.indexOf(targetQQ),1)
e.reply("成功取消针对啦")
   } 


    }else{e.reply("请艾特一个被针对的群员");return false}


   }else{e.reply("你不是主人哦");return false}
}

   async  jianting(e) {
if(blacklist.includes(e.user_id)){
  try{m = (await e.group.getChatHistory(e.msg.seq, 1))
    .pop()}catch(err){
m = (await e.group.getChatHistory(e.seq, 1)).pop()}


  Bot.pickGroup(e.group_id).recallMsg(m)
}else{return false}


   }
    
    }