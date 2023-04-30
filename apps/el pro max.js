/**  欢迎大家叫上另外五个小伙伴测试该游戏，测试之前最好给机器人个管理
口令：    #开始俄轮
          #开枪
          #清除数据   清除所有群聊下的俄轮记录
支持多群共玩
联系qq：928368902


*/





import {getSegment} from "../model/segment.js"
    const segment = await getSegment()
    const _path = process.cwd();
import path from 'path';
import fetch from "node-fetch";
import fs from "fs";
import { url } from 'inspector';
import { get } from "http";
const folderPath = _path +'/resources/lunpandu';
var dirpath = _path +'/resources/lunpandu';//路径
var filename = '';//文件名
if (!fs.existsSync(dirpath)) {
  fs.mkdirSync(dirpath);}
  let id = []
let time = 300
/** 禁言时间，单位：秒*/
let t
let a 
let u1
let msg
let id1
function deleteFile(filePath) {
  fs.unlink(filePath, err => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(`${filePath} deleted，删除成功`);
  });
}
function getImg(url){
  return segment.image(url)
}

export class example extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: 'lpd',
      /** 功能描述 */
      dsc: 'lpd',
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 40,
      rule: [
        {
          /** 命令正则匹配 */
          reg: "#俄轮|#开始俄轮|#开始俄轮",
          /** 执行方法 */
          fnc: 'lpd'
        },
        {
          /** 命令正则匹配 */
          reg: "#开枪",
          /** 执行方法 */
          fnc: 'lpd2'
        },
        {
          /** 命令正则匹配 */
          reg: "#清除数据",
          /** 执行方法 */
          fnc: 'lpd3'
        },
  
      ]
    })
  }

  //执行方法


  async lpd(e) {if(!e.isGroup){e.reply('该功能仅群聊可用');return true}else{ filename=e.group_id+'.json'
    if (!fs.existsSync(dirpath+"/"+filename)) {
      fs.appendFileSync(dirpath + "/" + filename, JSON.stringify({"start": 1,"t":1}))
   
    e.reply('俄轮已开始，勇士们，拿起左轮手枪，弹匣一共七个孔，只有一个装有子弹，谁会成为那个幸运儿呢？发送 #开枪 感受心跳吧！')}else{e.reply('游戏早已经开始了哦，发送 #开枪 感受心跳吧！')}
    }
}
async lpd2(e) {let idd = e.user_id
    let url = `https://ovooa.caonm.net/API/yi/?QQ=${idd}`
    let img = getImg(url)
  filename=e.group_id+'.json'
u1 = e.user_id
id1=e.sender.nickname
  if (fs.existsSync(dirpath+"/"+filename)) {
  fs.readFile(dirpath + "/" + filename, (err, data) => {
    if (err) {
        console.log(err);
    } else {
        let jsonData = JSON.parse(data);
        if (jsonData.t) {
          t=jsonData.t
            jsonData.t = jsonData.t+1;
            jsonData[id1]= u1
console.log(t)
            fs.writeFile(dirpath + "/" + filename, JSON.stringify(jsonData), (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('成功改写数据\n'+jsonData.t );
               

  if(t==1){
   
   a = Math.random();
if (a <= 1/7) {  e.reply(e.sender.nickname+'若无其事地拿起左轮，把左轮手枪对准自己的太阳穴，一脸轻松地扣下扳机...');
setTimeout(function(){
  e.group.muteMember(u1,time)
  let msg = [img,
  '\n砰————（枪声响起，红色液体和白色粘稠液体飞溅）恭喜他，他gg了。第一枪他就中枪了，他的运气真不是一般的好呢！在下面买张彩票吧！']
   e.reply(msg);
   t=0
   deleteFile(dirpath + "/" + filename);
}, 2000); // 停顿2秒

   
   
} else {
   e.reply(e.sender.nickname+'若无其事地拿起左轮，一脸轻松地扣下扳机...');
   setTimeout(function(){
    e.reply('什么事情也没发生，'+e.sender.nickname+'轻蔑一笑，摇了摇头，把手枪交给了下一个人...')
}, 2000); // 停顿2秒
  
  
}return true
  }
  else if(t==2){
    a = Math.random();
    if (a <= 1/6) {
       e.reply(e.sender.nickname+'神色不是很自然，拿起左轮，把左轮手枪对准自己的太阳穴，犹豫了一会儿，扣下扳机...');
       
       setTimeout(function(){
        e.group.muteMember(u1,time)
        msg = [img,
          '\n砰————（枪声响起，红色液体和白色粘稠液体飞溅）恭喜他，他gg了。第二枪他就中枪了，他的运气看起来还行呢！']
           e.reply(msg);
        t=0
        fs.unlink(dirpath + "/" + filename, (err) => {
         if (err) {
           console.error(err);
           return;
         }
         console.log(filename+'已被删除！');
       });
    }, 2000); // 停顿2秒
    }else{
       e.reply(e.sender.nickname+'神色不是很自然，拿起左轮，犹豫了一会儿，扣下扳机...');
       setTimeout(function(){
        e.reply('什么事情也没发生，'+e.sender.nickname+'松了一口气，把手枪交给了下一个人...')
    }, 2000); // 停顿2秒
      
      
     }return true
  }
  else if(t==3){
    a = Math.random();
    if (a <= 1/5) { e.reply(e.sender.nickname+'颤抖着手，把左轮手枪对准自己的太阳穴，紧张地闭上眼睛，缓缓地扣下扳机...');
    setTimeout(function(){
      e.group.muteMember(u1,time)
      msg = [img,
        '\n砰————（枪声响起，红色液体和白色粘稠液体飞溅）恭喜他，他gg了。这是第三枪，他的运气还可以。']
         e.reply(msg);
      
      t=0
      deleteFile(dirpath + "/" + filename);
   
  }, 2000); // 停顿2秒
    }else{
       e.reply(e.sender.nickname+'颤抖着手，把左轮手枪对准自己的太阳穴，紧张地闭上眼睛，缓缓地扣下扳机...');
       setTimeout(function(){
        e.reply('什么事情也没发生，'+e.sender.nickname+'松了一口气，大口大口地喘着粗气，手枪交给了下一个人...')
    }, 2000); // 停顿2秒
      
      
     }return true
  }
  else if(t==4){
    
    a = Math.random();
    if (a <= 1/4) { e.reply(e.sender.nickname+'非常慌，他也没想到前面的人能够撑那么久没中枪，哆哆嗦嗦地把左轮手枪对准自己的太阳穴，紧张地闭上眼睛，缓缓地扣下扳机...');
    setTimeout(function(){
      e.group.muteMember(u1,time)
      msg = [img,
        '\n砰————（枪声响起，红色液体和白色粘稠液体飞溅）恭喜他，他gg了。这是第四枪，他的运气还可以。']
         e.reply(msg);
      t=0
      deleteFile(dirpath + "/" + filename);
  }, 2000); // 停顿2秒
    }else{
       e.reply(e.sender.nickname+'非常慌，他也没想到前面的人能够撑那么久没中枪，哆哆嗦嗦地把左轮手枪对准自己的太阳穴，紧张地闭上眼睛，缓缓地扣下扳机...');
       setTimeout(function(){
        e.reply('什么事情也没发生，'+e.sender.nickname+'鬓角泌出了冷汗，全身变得瘫软跌坐在地上，把手枪交给了下一个人...')
    }, 2000); // 停顿2秒
      
      
     }return true}
  else if(t==5){a = Math.random();
    if (a <= 1/3) { e.reply(e.sender.nickname+'非常慌，面色煞白，祈祷着，把左轮手枪对准自己的太阳穴，颤抖着扣下扳机...');
    setTimeout(function(){
      e.group.muteMember(u1,time)
      msg = [img,
        '\n砰————（枪声响起，红色液体和白色粘稠液体飞溅）恭喜他，他gg了。这是第五枪。真惨啊。。']
         e.reply(msg);
      t=0
      deleteFile(dirpath + "/" + filename);
  }, 2000); // 停顿2秒
   }else{
       e.reply(e.sender.nickname+'非常慌，面色煞白，祈祷着，把左轮手枪对准自己的太阳穴，颤抖着扣下扳机...');
       setTimeout(function(){
        e.reply('什么事情也没发生，'+e.sender.nickname+'欣喜若狂，如同疯子般大笑起来，把手枪交给了下一个人...')
    }, 2000); // 停顿2秒
      
      }return true}
  else if(t==6){a = Math.random();
    if (a <= 1/2) { e.reply(e.sender.nickname+'哭了，不愿意上前，却被其他人逼着拿起了枪，非常艰难地扣下扳机...');
    setTimeout(function(){
      e.group.muteMember(u1,time)
      msg = [img,
        '\n砰————（枪声响起，红色液体和白色粘稠液体飞溅）恭喜他，他gg了。这是第六枪。真惨啊，让我们为他默哀。。']
         e.reply(msg);

      t=0
      deleteFile(dirpath + "/" + filename);
  }, 2000); // 停顿2秒
    
     return true}else{
       e.reply(e.sender.nickname+'哭了，不愿意上前，却被其他人逼着拿起了枪，非常艰难地扣下扳机...');
       setTimeout(function(){
        e.reply('什么事情也没发生，但是'+e.sender.nickname+'已经被吓到虚脱了，险些昏倒...')
    }, 2000); // 停顿2秒
    
       t=7
   
       
       
    }}
  if(t==7){
    let jsonData = fs.readFileSync(dirpath + "/" + filename);
let data = JSON.parse(jsonData);

for (let key in data) {
    if (key !== 'start'&key !== 't') {
       
        id.push(key);
    }
}

    var randomIndex = Math.floor(Math.random() * id.length);
    var randomValue = id[randomIndex];
   
    var randomValue1 = data[randomValue]
    console.log(randomValue1)
    setTimeout(function(){
      e.group.muteMember(randomValue1,time)
      url = `https://ovooa.caonm.net/API/yi/?QQ=${randomValue1}`
      img = getImg(url)
      msg = [img,
        '\n因为只剩最后一枪了，那枪肯定有子弹，所以没有人愿意主动开枪了，所以随机挑一个人出来击毙！\n砰————（枪声响起，红色液体和白色粘稠液体飞溅）恭喜天选之子：'+randomValue+'中枪，他gg了。这是最后一枪，这真是太惨了，都给我哭！']
         e.reply(msg);
      t=0
      deleteFile(dirpath + "/" + filename);
  }, 2000); // 停顿2秒
   
    return true
  }else if(t!==1&t!==2&t!==3&t!==4&t!==5&t!==6&t!==7){return true}
  else{console.log('死神待命中')}
}
});
}
}
});
}else{e.reply('游戏还没开始,快发送#俄轮 开始游戏吧！')
  return true}





}
async lpd3(e){fs.readdir(folderPath, (err, files) => {
  if (err) {
    console.log(err);
    return;
  }

  
  files.forEach(file => {
    
    const filePath = path.join(folderPath, file);    
    const extname = path.extname(filePath);
    if (extname === '.json') {
      fs.unlink(filePath, err => {
        if (err) {
          console.log(err);
          return;
        }
        console.log(`${filePath} deleted，删除成功`);
        e.reply(`${filePath} deleted，删除成功`);
      });
    }
  });
});}
}
