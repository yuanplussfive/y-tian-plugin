const _path = process.cwd();
import fs from "fs";

var dirpath = _path +'/resources/wg';//路径
var filename = '';//文件名
let time = 300
function removePairs(arr) {
    for (let i = 0; i < arr.length; i++) {
      const card1 = arr[i];
      for (let j = i + 1; j < arr.length; j++) {
        const card2 = arr[j];
        if (card1[1] === card2[1]) { // 判断是否为对子
          arr.splice(j, 1); // 删除第二张牌
          arr.splice(i, 1); // 删除第一张牌
          i--; // 下标回退，重新判断牌组中的牌
          break;
        }
      }
    }
  }

if (!fs.existsSync(dirpath)) {
  fs.mkdirSync(dirpath);}
// 定义扑克牌数组
let poker = [
    '♠A', '♠2', '♠3', '♠4', '♠5', '♠6', '♠7', '♠8', '♠9', '♠10', '♠J', '♠Q', '♠K',
    '♥A', '♥2', '♥3', '♥4', '♥5', '♥6', '♥7', '♥8', '♥9', '♥10', '♥J', '♥Q', '♥K',
    '♣A', '♣2', '♣3', '♣4', '♣5', '♣6', '♣7', '♣8', '♣9', '♣10', '♣J', '♣Q', '♣K',
    '♦A', '♦2', '♦3', '♦4', '♦5', '♦6', '♦7', '♦8', '♦9', '♦10', '♦J', '♦Q', '♦K',
    '大王', '小王'
  ];

let 乌龟
let p1
let p2
let p1p = []
let p2p = []
let chou = '玩家1'

export class example extends plugin {
    constructor () {
      super({
        name: '阴天[乌龟牌]',
        dsc: '乌龟王八蛋',
        event: 'message',
        priority: 1,
        rule: [
         {
            reg: "#抽乌龟", 
            fnc: 'ks'
                  },
         {
              reg: "#抽一张", 
              fnc: 'cyz'
                  }, 
        {
              reg: "#清除抽乌龟数据", 
              fnc: 'qcsj'
                 },
        ]
      })
    }
    async qcsj(e) {if(e.isGroup){filename = e.group_id + '.json';try{ 
        fs.unlink(dirpath + "/" + filename, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(filename+'已被删除！');
    });e.reply("删除成功")}catch(err){console.log(err)}}else{return false}}
    async ks(e) {
        if (!e.isGroup) {
          e.reply('仅支持群聊');
          return false;
        } else {
          filename = e.group_id + '.json';
          if (!fs.existsSync(dirpath + "/" + filename)) {
            p1 = e.user_id;
            fs.appendFileSync(dirpath + "/" + filename, JSON.stringify({ "start": false, "user": [p1] }))
            e.reply('游戏已发起，请等待另一名玩家发送 #抽乌龟 进入游戏')
          } else {
            try {
              let data = fs.readFileSync(dirpath + "/" + filename)
              let obj = JSON.parse(data)
              if (obj.user.length == 1) {
                if (obj.user[0] == e.user_id) {
                  e.reply('请勿重复加入游戏')
                } else {
                  p2 = e.user_id;
                  obj.user.push(p2);
                  obj.start = true;
                  if(chou == '玩家1'){
                  e.reply(`您已加入游戏，游戏开始!请二位留意私信。现在请玩家:${obj.user[0]}发送：#抽一张 以抽对方一张牌。`);}
                  else if(chou == '玩家2'){e.reply(`您已加入游戏，游戏开始!请二位留意私信。现在请玩家:${obj.user[1]}发送：#抽一张 以抽对方一张牌。`);}
                  await new Promise((resolve, reject) => {
                    this.ck(resolve); // 将 resolve 函数作为参数传入 ck 函数中
                  });
                  await Promise.all([
                    Bot.pickMember(e.group_id, obj.user[0]).sendMsg(p1p),
                    Bot.pickMember(e.group_id, obj.user[1]).sendMsg(p2p),
                    e.reply(`乌龟牌为： ${乌龟}`)
                  ]);
                }
              } else if (obj.user.length == 2) {
                e.reply('游戏已经开始了，请耐心等待游戏结束或发送 #清除抽乌龟数据')
              }
              fs.writeFileSync(dirpath + "/" + filename, JSON.stringify(obj))
            } catch (err) { console.log(err) }
      
          }
        }
      }
      async cyz(e){console.log(chou)
        if (!e.isGroup) {
          e.reply('仅支持群聊');
          return false;
        } else {
          filename = e.group_id + '.json';
          if (!fs.existsSync(dirpath + "/" + filename)) {e.reply('尚未发起游戏')}else{

        try {
          let data = fs.readFileSync(dirpath + "/" + filename)
          let obj = JSON.parse(data)
if(obj.start==false){e.reply('游戏还未开始')}else{
if(chou == '玩家1'){if(obj.user[0] !==e.user_id){e.reply('你不能抽！什么都抽只会害了你！')}else{
  let a
  a = p2p[Math.floor(Math.random() * p2p.length)];
  p2p.splice(p2p.indexOf(a),1)
  p1p.push(a)
  removePairs(p1p)
  removePairs(p2p)
  if(p2p.length==0){
    e.reply(`游戏结束，玩家：${obj.user[0]} 抽走了玩家：${obj.user[1]}的最后一张牌${a},并与手上的一张牌组成对子并弃掉，此时他手上最后一张牌与乌龟牌相同，输了本场游戏，他就是乌龟王八蛋，奖励他一个禁言套餐！`) 
    e.group.muteMember(obj.user[0],time)
    fs.unlink(dirpath + "/" + filename, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(filename+'已被删除！');
    });
    乌龟 = ''
    chou = '玩家1'
  }
  else if(p1p.length==0){
    e.reply(`游戏结束，玩家：${obj.user[0]} 抽走了玩家：${obj.user[1]}的牌${a},并与手上的最后一张牌组成对子并弃掉，此时他手上没有牌，获得了本场游戏胜利，玩家：${obj.user[1]} 最后一张牌与乌龟${乌龟}牌相同，他就是乌龟王八蛋，奖励他一个禁言套餐！`) 
    e.group.muteMember(obj.user[1],time)
    fs.unlink(dirpath + "/" + filename, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(filename+'已被删除！');
    });
    乌龟 = ''
    chou = '玩家1'
  }
  else
  {
    e.reply(`玩家：${obj.user[0]}抽了玩家：${obj.user[1]}手上的一张牌，双方请留意私信。接下来请玩家：${obj.user[1]}发送 #抽一张 抽对方一张牌。`)
    Bot.pickMember(e.group_id, obj.user[0]).sendMsg(`你抽到了一张${a},重新去除对子后，你现在手上有：${p1p}`),
    Bot.pickMember(e.group_id, obj.user[1]).sendMsg(`你被抽走了一张${a},重新去除对子后，你现在手上有：${p2p}`)
    chou = '玩家2'
}
}}
else if(chou == '玩家2'){if(obj.user[1] !==e.user_id){e.reply('你不能抽！什么都抽只会害了你！')}else{
  let a
  a = p1p[Math.floor(Math.random() * p1p.length)];
  p1p.splice(p1p.indexOf(a),1)
  p2p.push(a)
  removePairs(p1p)
  removePairs(p2p)
  if(p2p.length==0){
    e.reply(`游戏结束，玩家：${obj.user[1]} 抽走了玩家：${obj.user[0]}的牌${a},并与手上的最后一张牌组成对子并弃掉，此时他手上没有牌，赢了本场游戏，玩家：${obj.user[0]}手上最后一张牌与乌龟牌相同，他就是乌龟王八蛋，奖励一个禁言套餐！`) 
    e.group.muteMember(obj.user[1],time)
    fs.unlink(dirpath + "/" + filename, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(filename+'已被删除！');
    });
    乌龟 = ''
    chou = '玩家1'
  }
  else if(p1p.length==0){
    e.reply(`游戏结束，玩家：${obj.user[1]} 抽走了玩家：${obj.user[0]}的最后一张牌${a},并与手上的一张牌组成对子并弃掉，此时他手上最后一张牌与乌龟牌相同，输了本场游戏，玩家：${obj.user[1]}就是乌龟王八蛋，奖励他一个禁言套餐！`) 
    e.group.muteMember(obj.user[1],time)
    fs.unlink(dirpath + "/" + filename, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(filename+'已被删除！');
    });
    乌龟 = ''
    chou = '玩家1'
  }
  else
  {
    e.reply(`玩家：${obj.user[1]}抽了玩家：${obj.user[0]}手上的一张牌，双方请留意私信。接下来请玩家：${obj.user[0]}发送 #抽一张 抽对方一张牌。`)
    Bot.pickMember(e.group_id, obj.user[1]).sendMsg(`你抽到了一张${a},重新去除对子后，你现在手上有：${p2p}`),
    Bot.pickMember(e.group_id, obj.user[0]).sendMsg(`你被抽走了一张${a},重新去除对子后，你现在手上有：${p1p}`)
    chou = '玩家1'
    fs.writeFileSync(dirpath + "/" + filename, JSON.stringify(obj))
}




}}}



}catch(err){console.log()}






        }}}

     async ck(resolve) {

   乌龟 = poker[Math.floor(Math.random() * poker.length)];
   poker.splice(poker.indexOf(乌龟),1)
   console.log(poker)
// 从扑克牌数组随机分两组

while (poker.length > 0) {
  let randomIndex = Math.floor(Math.random() * poker.length);
  if (p1p.length < 27) {
    p1p.push(poker[randomIndex]);
  } else {
    p2p.push(poker[randomIndex]);
  }
  poker.splice(poker.indexOf(poker[randomIndex]), 1);
  // 如果 p1p 数组长度已经是 27，就将其余的牌全部分给 p2p 数组
  if (p1p.length == 27) {
    p2p = [...p2p, ...poker];
    break;
  }
}
removePairs(p1p);
removePairs(p2p);
poker = [
    '♠A', '♠2', '♠3', '♠4', '♠5', '♠6', '♠7', '♠8', '♠9', '♠10', '♠J', '♠Q', '♠K',
    '♥A', '♥2', '♥3', '♥4', '♥5', '♥6', '♥7', '♥8', '♥9', '♥10', '♥J', '♥Q', '♥K',
    '♣A', '♣2', '♣3', '♣4', '♣5', '♣6', '♣7', '♣8', '♣9', '♣10', '♣J', '♣Q', '♣K',
    '♦A', '♦2', '♦3', '♦4', '♦5', '♦6', '♦7', '♦8', '♦9', '♦10', '♦J', '♦Q', '♦K',
    'Joker', 'Joker'
  ]

 

  resolve()
     }
    

    
    }







