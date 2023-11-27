import cfg from '../../../lib/config/config.js'
import fs from 'fs'
const _path = process.cwd();
let blacklist = []
let dirpath = _path +'/resources/gm';
if (!fs.existsSync(dirpath)) {
  fs.mkdirSync(dirpath);}
  if (!fs.existsSync(dirpath+"/"+'gm.json')) {
    fs.appendFileSync(dirpath + "/" + 'gm.json', JSON.stringify({"gm":[`${cfg.masterQQ[0]}`]}))}



export class example extends plugin {
    constructor() {
      super({
        name: '阴天[针对]',
        dsc: 'test',
        event: 'message',
        priority: 1,
        rule: [{
          reg: '^#针对(.*)',
          fnc: 'zhendui'
        },{
          reg: '.*',
          fnc: 'jianting',
          log: false
        },
        {
          reg: '^#取消针对(.*)',
          fnc: 'quxiao'
        }, {
          reg: '^#加超管(.*)',
          fnc: 'gm'
        }]
      });
  
     
    }
    async  gm(e) {let msg = e.toString().replace("#加超管").trim()
    let pattern = /{at:[^}]+}/
     let data = fs.readFileSync(dirpath + "/" + 'gm.json', 'utf-8');
    let obj = JSON.parse(data)
    if(!obj.gm.includes(`${e.user_id}`)){e.reply("仅主人或超管可操作");return false}else{
      if(pattern.test(msg)) {
        let targetQQ = `${e.at}`;
        if(obj.gm.includes(targetQQ)){e.reply(`他已经是超管了，不用重复添加！`);return false}else{
      obj.gm.push(`${targetQQ}`)
      fs.writeFileSync(dirpath + "/" + 'gm.json', JSON.stringify(obj))
      e.reply(`恭喜用户：${targetQQ}成为尊贵的超管！`)}
      }else{e.reply("请艾特群员添加");return false}

    }
  }
    
    async  zhendui(e) {
      let msg = e.toString().replace("#针对").trim()
    let pattern = /{at:[^}]+}/
       let data = fs.readFileSync(dirpath + "/" + 'gm.json', 'utf-8');
      let obj = JSON.parse(data)
    if(obj.gm.includes(`${e.user_id}`)){
      if(pattern.test(msg)) {
        let targetQQ = `${e.at}`;
        if(blacklist.includes(targetQQ)){e.reply(`他已经被针对了，换个人针对吧`);return false}else{
        blacklist.push(targetQQ)
        e.reply('已经开始针对他了！')}
        
    }else{e.reply("请艾特一个群员");return false}
   }else{e.reply("你不是主人哦");return false}}
   async  quxiao(e) {
    let msg = e.toString().replace("#取消针对").trim()
    let pattern = /{at:[^}]+}/
     let data = fs.readFileSync(dirpath + "/" + 'gm.json', 'utf-8');
    let obj = JSON.parse(data)
    if(obj.gm.includes(`${e.user_id}`)){
    if(pattern.test(msg)) {
      let targetQQ = `${e.at}`;
   if(!blacklist.includes(targetQQ)){e.reply("他没有被针对哦")}else{
blacklist.splice(blacklist.indexOf(targetQQ),1)
e.reply("成功取消针对啦")
   } 


    }else{e.reply("请艾特一个被针对的群员");return false}


   }else{e.reply("你不是主人哦");return false}
}

   async  jianting(e) { let m
      
        let data = fs.readFileSync(dirpath + "/" + 'gm.json', 'utf-8');
      let obj = JSON.parse(data)
        let msg = e.toString().trim()
    
    if(!obj.gm.includes(`${e.user_id}`)){}else if(msg.includes("#取消针对")){
       {return false}}
      
if(blacklist.includes(`${e.user_id}`)){
  m = (await e.group.getChatHistory(e.seq, 1)).pop()



  Bot.pickGroup(e.group_id).recallMsg(m)
}else{return false}


   }
    
    }