import fetch from 'node-fetch'
import fs from 'fs'
import common from'../../../lib/common/common.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
const _path = process.cwd();
import moment from "moment";
let CD = {};
let GetCD = true; //是否开启锻炼CD,默认开启
let CDTime = 300000;//CD单位毫秒
let files = ""
let you = ""
let isbj = false
let h = []
let k = []
var arr3 = []
let m = ""
let m6 = ""
let a1 = ""
let b1 = ""
let c1 = ""
let d1 = ""
let a2 = ""
let b2 = ""
let c2 = ""
let d2 = ""
let a3 = ""
let b3 = ""
let c3 = ""
let d3 = ""
let a4 = ""
let b4 = ""
let c4 = ""
let d4 = ""
let a5 = ""
let b5 = ""
let c5 = ""
let d5 = ""
let a6 = ""
let b6 = ""
let c6 = ""
let d6 = ""
let a7 = ""
let b7 = ""
let c7 = ""
let d7 = ""
let a8 = ""
let b8 = ""
let c8 = ""
let d8 = ""
let a9 = ""
let b9 = ""
let c9 = ""
let d9 = ""
let a10 = ""
let b10 = ""
let c10 = ""
let d10 = ""
let dirpath = _path + "/resources/tou"
if (!fs.existsSync(dirpath)) {
			fs.mkdirSync(dirpath);
		  }
let dirpath3 = _path + "/resources/energy"
if (!fs.existsSync(dirpath3)) {
			fs.mkdirSync(dirpath3);
		  }
export class example extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: '阴天[impart]',
      /** 功能描述 */
      dsc: 'impart',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 1,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#?被透榜$',
          /** 执行方法 */
          fnc: 'rankinglist'
        },{
        /** 命令正则匹配 */
          reg: '^#?透(.*)$',
          /** 执行方法 */
          fnc: 'fake'
        },{
        /** 命令正则匹配 */
          reg: '^#?(锻炼|晨练|运动)$',
          /** 执行方法 */
          fnc: 'dio'
        },{
        /** 命令正则匹配 */
          reg: '^#?impart帮助$',
          /** 执行方法 */
          fnc: 'help'
        },{
          /** 命令正则匹配 */
            reg: '^#?通缉(.*)$',
            /** 执行方法 */
            fnc: 'tj'
          },{
            /** 命令正则匹配 */
              reg: '^#?追透(.*)$',
              /** 执行方法 */
              fnc: 'zt'
            }
      ]
    })
  }
  async zt(e) {
    function random(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
      }
      if (!e.isGroup) {return false}
      let dirpath2 = dirpath + "/" + e.group_id;
      let dirtj = dirpath2+"/"+"tongji.json"
      if (!fs.existsSync(dirpath2)) {
        fs.mkdirSync(dirpath2);
      }
      if(!fs.existsSync(dirtj)){
        fs.writeFileSync(dirtj, JSON.stringify({
          "tongji":[]		
          }));
          e.reply("当前群没有通缉目标")
          return
      }
    let tjlist = JSON.parse(fs.readFileSync(dirtj),"utf8")
    if(tjlist.tongji.length == 0){ e.reply("当前群没有通缉目标");return false}
    let msg = Number(e.msg.replace("#","").replace("追透",""))
    if (isNaN(msg) || msg > tjlist.tongji.length||msg==""||msg-1 == undefined||msg-1<0) {
      e.reply("无效的追透目标。");
      return false;
    }
    let number = random(15,75);
    let id = `${e.group_id}`;
    let nickname
    let qq
    for(let key in tjlist.tongji[msg-1]){
    nickname = key
    qq = tjlist.tongji[msg-1][key]
    }
  
    if (!fs.existsSync(dirpath2 + "/" + `${qq}.json`)) {
        fs.writeFileSync(dirpath2 + "/" + `${qq}.json`, JSON.stringify({
          "tou":			  
          {	
            "group_id":id,
            "mumber": qq,	
            "name":nickname,
            "number":number,
            "ci":	1,	  
          },			
        }));
        
        let tu = segment.image(`http://q.qlogo.cn/headimg_dl?dst_uin=${qq}&spec=640&img_type=jpg`);
        let msg = [`你抓住通缉目标${nickname}就是一顿疯狂乱透，成功粗暴注入三倍的量：${number}ml将他灌满了!`, tu];
        e.reply(msg)
        return;
      }
      else
      {
        let data = fs.readFileSync(dirpath2 + "/" + `${qq}.json`)
        let obj = JSON.parse(data)
        obj.tou.number = Number(number)+Number(obj.tou.number)
        obj.tou.ci+=1
        let tu = segment.image(`http://q.qlogo.cn/headimg_dl?dst_uin=${qq}&spec=640&img_type=jpg`);
        let msg = [`你抓住通缉目标${nickname}就是一顿疯狂乱透，成功粗暴注入三倍的量：${number}ml将他灌满了!`, tu];
        fs.writeFileSync(dirpath2 + "/" + `${qq}.json`, JSON.stringify(obj))
        e.reply(msg)
        return
      }
     
  }
  async tj(e) {
    if (!fs.existsSync(dirpath3 + "/" + `${e.user_id}.json`)) {
      e.reply('当前无精力值，请先发送锻炼等以建立个人信息');
      return;
    }
    if (fs.existsSync(dirpath3 + "/" + `${e.user_id}.json`)) {
      let js = JSON.parse(fs.readFileSync(dirpath3+"/"+`${e.user_id}.json`,"utf8"));
      let jl = js.energy.jl;
      if (Number(jl) < 50) {
        e.reply('你的精力值低于50，无法发布通缉令，先去锻炼吧');
        return;
      }
    }
    if (!e.isGroup) {return false}
    let dirpath2 = dirpath + "/" + e.group_id;
    let dirtj = dirpath2+"/"+"tongji.json"
    if (!fs.existsSync(dirpath2)) {
      fs.mkdirSync(dirpath2);
    }
    if(!fs.existsSync(dirtj)){
      fs.writeFileSync(dirtj, JSON.stringify({
        "tongji":[]		
        }));
    }
    let tjlist = JSON.parse(fs.readFileSync(dirtj),"utf8")
    let at = e.message.filter(item => item.type == 'at')?.map(item => item?.qq);
    if(at.length == 0){return false}
    let nickname;
if (!e.message[1].text.includes("@")) {
  nickname = e.message[0].text.replace("@", "");
} else {
  nickname = e.message[1].text.replace("@", "");
}
    let qq = {[nickname]:at[0]};
    if(tjlist.tongji.includes(qq)){e.reply(`${nickname}早已经在通缉列表中了，快点去透他吧！`);return false}
      let js2 = JSON.parse(fs.readFileSync(dirpath3+"/"+`${e.user_id}.json`,"utf8"));
      let member = js2.energy.mumber;
      let name = js2.energy.name;
      let jl = js2.energy.jl;
      let gg = Number(jl)-50;
      
      fs.writeFileSync(dirpath3 + "/" + `${e.user_id}.json`, JSON.stringify({
        "energy":			  
        {	
          "mumber": member,	
          "name":name,
          "jl":gg,
        },			
      }));
    tjlist.tongji.push(qq)
    let tu = segment.image(`http://q.qlogo.cn/headimg_dl?dst_uin=${qq[nickname]}&spec=640&img_type=jpg`);
    let arr = []
    for(let i = 0;i<tjlist.tongji.length;i++)
    {
      for(let key in tjlist.tongji[i])
      {
        arr.push(key)
      }
    }
    let join = arr.map((item, index) => `${index + 1}、${item}`).join("，");
    let msg1 = [`用户：${e.sender.nickname} 花费50精力值发布了通缉令，${nickname}已经被全网通缉，人人得而透之！\n当前群被通缉目标：${join}\n通缉期间透被通缉目标将不消耗精力值且三倍注入量！限时60s，发送追透+序号 去爆透他们吧！`, tu];
    fs.writeFileSync(dirtj,JSON.stringify(tjlist))
    e.reply(msg1)
  await common.sleep(60000)
  tjlist.tongji = tjlist.tongji.filter(item => item !== qq);
  fs.writeFileSync(dirtj,JSON.stringify(tjlist))
  e.reply(`对${nickname}的通缉已结束！`)
  }
async dio(e) {
if (CD[e.user_id] && GetCD === true) {
        e.reply("每五分钟最多一次锻炼哦~");
        return true;
    }
    CD[e.user_id] = true;
    CD[e.user_id] = setTimeout(() => {
        if (CD[e.user_id]) {
            delete CD[e.user_id];
        }
    }, CDTime);
function random(min, max) {
return Math.floor(Math.random() * (max - min)) + min;
}
let qq = e.user_id
let nickname = e.sender.nickname
let ok = random(5,10)
if (!fs.existsSync(dirpath3 + "/" + `${e.user_id}.json`)) {
fs.writeFileSync(dirpath3 + "/" + `${e.user_id}.json`, JSON.stringify({
"energy":			  
{	
"mumber": qq,	
"name":nickname,
"jl":100,
},			
}));
e.reply('成功建立个人信息,当前精力100')
return
}
if (fs.existsSync(dirpath3 + "/" + `${e.user_id}.json`)) {
let js = JSON.parse(fs.readFileSync(dirpath3+"/"+`${e.user_id}.json`,"utf8"))
let jl = js.energy.jl
let number = Number(jl)+Number(ok)
fs.writeFileSync(dirpath3 + "/" + `${e.user_id}.json`, JSON.stringify({
"energy":			  
{	
"mumber": qq,	
"name":nickname,
"jl":	number,	  
},			
}));
let msg = [segment.at(e.user_id),`锻炼完毕,您的精力增加${ok}`]
e.reply(msg)
return
}
}
async help(e) {
let lj= _path + "/plugins/y-tian-plugin/resources/yuan.css"
   let img= await puppeteer.screenshot("66", {                    
tplFile: `${_path}/plugins/y-tian-plugin/resources/tou.html`,               
imgtype:'png',
a: lj        
});
await this.reply(img)
}
 
async fake(e) {
  function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  
  if (!fs.existsSync(dirpath3 + "/" + `${e.user_id}.json`)) {
    e.reply('当前无精力值，请先发送锻炼等以建立个人信息');
    return;
  }
  
  if (fs.existsSync(dirpath3 + "/" + `${e.user_id}.json`)) {
    let js = JSON.parse(fs.readFileSync(dirpath3+"/"+`${e.user_id}.json`,"utf8"));
    let jl = js.energy.jl;
    
    if (eval(jl) <= eval(30)) {
      e.reply('你的精力值小于30，无法再战斗，先去锻炼吧');
      return;
    }
  }
  
  let id = `${e.group_id}`;
  let dirpath2 = dirpath + "/" + e.group_id;
  
  if (!fs.existsSync(dirpath2)) {
    fs.mkdirSync(dirpath2);
  }
  
  let name = Bot.nickname;
  
  if (e.isGroup) {
    let number3 = random(5,25);
    let at = e.message.filter(item => item.type == 'at')?.map(item => item?.qq);
    if(at.length == 0){return false}
    let nickname;
    if (!e.message[1].text.includes("@")) {
      nickname = e.message[0].text.replace("@", "");
    } else {
      nickname = e.message[1].text.replace("@", "");
    }
    let qq = at[0];
    
    if (!fs.existsSync(dirpath2 + "/" + `${qq}.json`)) {

      fs.writeFileSync(dirpath2 + "/" + `${qq}.json`, JSON.stringify({
        "tou":			  
        {	
          "group_id":id,
          "mumber": qq,	
          "name":nickname,
          "number":number3,
          "ci":1,
        },			
      }));
  
      let js2 = JSON.parse(fs.readFileSync(dirpath3+"/"+`${e.user_id}.json`,"utf8"));
      let member = js2.energy.mumber;
      let name = js2.energy.name;
      let jl = js2.energy.jl;
      let gm = random(6,12);
      let gg = Number(jl)-Number(gm) * 2;
  
      if (random(1, 100) <= 30) {
         number3 = number3 * 2;
        fs.writeFileSync(dirpath2 + "/" + `${qq}.json`, JSON.stringify({
          "tou":			  
          {	
            "group_id":id,
            "mumber": qq,	
            "name":nickname,
            "number":number3,
            "ci":	1,	  
          },			
        }));
        
        let tu = segment.image(`http://q.qlogo.cn/headimg_dl?dst_uin=${qq}&spec=640&img_type=jpg`);
        let msg = [`你透他的时候产生了暴击，成功暴风注入${number3}ml将他灌满了，消耗精力${gm}千焦`, tu];
        
        fs.writeFileSync(dirpath3 + "/" + `${e.user_id}.json`, JSON.stringify({
          "energy":			  
          {	
            "mumber": member,	
            "name": name,
            "jl": gg,
          },			
        }));
  
        await e.reply(msg);
      } else {
        fs.writeFileSync(dirpath2 + "/" + `${qq}.json`, JSON.stringify({
          "tou":			  
          {	
            "group_id":id,
            "mumber": qq,	
            "name":nickname,
            "number":number3,
            "ci":	1,	  
          },			
        }));
       
    
        let tu = segment.image(`http://q.qlogo.cn/headimg_dl?dst_uin=${qq}&spec=640&img_type=jpg`);
        let msg = [`成功注入${number3}ml，消耗精力${gm}千焦`, tu];
        fs.writeFileSync(dirpath3 + "/" + `${e.user_id}.json`, JSON.stringify({
          "energy":			  
          {	
            "mumber": member,	
            "name": name,
            "jl": gg,
          },			
        }));
        await e.reply(msg);
      }
  
      return;
    }
    
    if (fs.existsSync(dirpath2 + "/" + `${qq}.json`)) {
      let js = JSON.parse(fs.readFileSync(dirpath2+"/"+`${qq}.json`,"utf8"));
      let number = js.tou.number;
      let ci = js.tou.ci + 1;
      
      if (random(1, 100) <= 30) {
        number3 = number3 * 2;
        isbj = true
      }
  
      let number2 = Number(number) + Number(number3);
      
      fs.writeFileSync(dirpath2 + "/" + `${at}.json`, JSON.stringify({
        "tou":			  
        {	
          "group_id":id,
          "mumber": qq,	
          "name":nickname,
          "number":number2,
          "ci":	ci,	  
        },			
      }));
  
      let js2 = JSON.parse(fs.readFileSync(dirpath3+"/"+`${e.user_id}.json`,"utf8"));
      let member = js2.energy.mumber;
      let name = js2.energy.name;
      let jl = js2.energy.jl;
      let gm = random(6,12);
      let gg = Number(jl)-Number(gm) * 2;
      
      fs.writeFileSync(dirpath3 + "/" + `${e.user_id}.json`, JSON.stringify({
        "energy":			  
        {	
          "mumber": member,	
          "name":name,
          "jl":gg,
        },			
      }));
      
      let tu = segment.image(`http://q.qlogo.cn/headimg_dl?dst_uin=${qq}&spec=640&img_type=jpg`);
      let msg
      if(!isbj){ msg = [`成功注入${number3}ml，消耗精力${gm}千焦`, tu];}
      else{msg = [`你透他的时候产生了暴击，成功暴风注入${number3}ml将他灌满了，消耗精力${gm}千焦`, tu];}
      isbj = false
      
      await e.reply(msg);
    }
  } else {
    e.reply(`要单独透？${name}会让你精尽人亡，给爷爬！去欺负天球去！`);
  }}
  async rankinglist (e) {
    let dirpath2 = dirpath + "/" + e.group_id
    if (!fs.existsSync(dirpath2)) {
    e.reply('当前群没有任何记录')
    return
    }
    const dir = _path + `/resources/tou/${e.group_id}`
    if (fs.existsSync(dirpath2)) {
    fs.readdir(dir, (err, files) => {
     if (err) {
          throw err;
        }
      files.forEach(file => {
        console.log(file);
        });
    })
    }
    
    let node2 = fs.readdirSync(dir, "utf-8").filter(file => !file.includes("tongji"));
    let o = `${node2}`
    let num = o.match(/json/g).length
    let p = o.split(",")
    console.log(p[3])
    if (fs.existsSync(dirpath2)) {
    for(var num3 = 0;num3 <= num-1;){
    let js = JSON.parse(fs.readFileSync(dirpath2+"/"+`${p[num3]}`,"utf8"))
    let number = js.tou.number
    let nickname = js.tou.name
    k.push(p[num3]+number)
    arr3.push(number)
    num3++
    }
    }
     function seach(arr) {
    let h = []
            for (var i = 0; i < arr3.length; i++) {
                for (var j = 0; j < arr3.length; j++) {
                    if (arr3[j] > arr3[j + 1]) {
                        var temp = arr3[j];
                        arr3[j] = arr3[j + 1];
                        arr3[j + 1] = temp;
                    }
                }
            }
    for(var num2 = 1;num2 <= num;){
    you = arr3[arr3.length - num2]
    h.push(you)
    console.log(h)
    num2++
        }
    return h
    }
    let x = `${seach(arr3)}`
    let w = x.split(",")
    let b = `${k}`
    let kk = b.split(",")
    console.log(w[3])
    let him = []
    for(var u = 0;u <= num-1;){
    for(var num4 = 0;num4 <= num-1;){
    let js = JSON.parse(fs.readFileSync(dirpath2+"/"+`${p[num4]}`,"utf8"))
    let number = js.tou.number
    if(number == `${w[u]}`){
    him.push(p[num4])
    u++
    break;
    }else{
    num4++
    }
    }
    }
    console.log(him)
    if (fs.existsSync(dirpath2 + "/" + `${him[0]}`)) {
    let js = JSON.parse(fs.readFileSync(dirpath2+"/"+`${him[0]}`,"utf8"))
     a1 = js.tou.mumber
     b1 = js.tou.name
     c1 = js.tou.number
     d1 = js.tou.ci
    }else{
    a1 = "虚席以待"
    b1 = "?"
    c1 = "?"
    d1 = "?"
    }
    if (fs.existsSync(dirpath2 + "/" + `${him[1]}`)) {
    let js = JSON.parse(fs.readFileSync(dirpath2+"/"+`${him[1]}`,"utf8"))
     a2 = js.tou.mumber
     b2 = js.tou.name
     c2 = js.tou.number
     d2 = js.tou.ci
    }else{
    a2 = "虚席以待"
    b2 = "?"
    c2 = "?"
    d2 = "?"
    }
    if (fs.existsSync(dirpath2 + "/" + `${him[2]}`)) {
    let js = JSON.parse(fs.readFileSync(dirpath2+"/"+`${him[2]}`,"utf8"))
     a3 = js.tou.mumber
     b3 = js.tou.name
     c3 = js.tou.number
     d3 = js.tou.ci
    }else{
    a3 = "虚席以待"
    b3 = "?"
    c3 = "?"
    d3 = "?"
    }
    if (fs.existsSync(dirpath2 + "/" + `${him[3]}`)) {
    let js = JSON.parse(fs.readFileSync(dirpath2+"/"+`${him[3]}`,"utf8"))
     a4 = js.tou.mumber
     b4 = js.tou.name
     c4 = js.tou.number
     d4 = js.tou.ci
    }else{
    a4 = "虚席以待"
    b4 = "?"
    c4 = "?"
    d4 = "?"
    }
    if (fs.existsSync(dirpath2 + "/" + `${him[4]}`)) {
    let js = JSON.parse(fs.readFileSync(dirpath2+"/"+`${him[4]}`,"utf8"))
     a5 = js.tou.mumber
     b5 = js.tou.name
     c5 = js.tou.number
     d5 = js.tou.ci
    }else{
    a5 = "虚席以待"
    b5 = "?"
    c5 = "?"
    d5 = "?"
    }
    if (fs.existsSync(dirpath2 + "/" + `${him[5]}`)) {
    let js = JSON.parse(fs.readFileSync(dirpath2+"/"+`${him[5]}`,"utf8"))
     a6 = js.tou.mumber
     b6 = js.tou.name
     c6 = js.tou.number
     d6 = js.tou.ci
    }else{
    a6 = "虚席以待"
    b6 = "?"
    c6 = "?"
    d6 = "?"
    }
    if (fs.existsSync(dirpath2 + "/" + `${him[6]}`)) {
    let js = JSON.parse(fs.readFileSync(dirpath2+"/"+`${him[6]}`,"utf8"))
     a7 = js.tou.mumber
     b7 = js.tou.name
     c7 = js.tou.number
     d7 = js.tou.ci
    }else{
    a7 = "虚席以待"
    b7 = "?"
    c7 = "?"
    d7 = "?"
    }
    if (fs.existsSync(dirpath2 + "/" + `${him[7]}`)) {
    let js = JSON.parse(fs.readFileSync(dirpath2+"/"+`${him[7]}`,"utf8"))
     a8 = js.tou.mumber
     b8 = js.tou.name
     c8 = js.tou.number
     d8 = js.tou.ci
    }else{
    a8 = "虚席以待"
    b8 = "?"
    c8 = "?"
    d8 = "?"
    }
    if (fs.existsSync(dirpath2 + "/" + `${him[8]}`)) {
    let js = JSON.parse(fs.readFileSync(dirpath2+"/"+`${him[8]}`,"utf8"))
     a9 = js.tou.mumber
     b9 = js.tou.name
     c9 = js.tou.number
     d9 = js.tou.ci
    }else{
    a9 = "虚席以待"
    b9 = "?"
    c9 = "?"
    d9 = "?"
    }
    if (fs.existsSync(dirpath2 + "/" + `${him[9]}`)) {
    let js = JSON.parse(fs.readFileSync(dirpath2+"/"+`${him[9]}`,"utf8"))
     a10 = js.tou.mumber
     b10 = js.tou.name
     c10 = js.tou.number
     d10 = js.tou.ci
    }else{
    a10 = "虚席以待"
    b10 = "?"
    c10 = "?"
    d10 = "?"
    }
    let py =  ""
    let group = e.group_id
    let zhu = `http://p.qlogo.cn/gh/${group}/${group}/100/`
    let lj= _path + "/plugins/y-tian-plugin/resources/yuan.html"
    let lj2= _path + "/plugins/y-tian-plugin/resources/yuan.css"
       let img= await puppeteer.screenshot("66", {                    
    tplFile: `${lj}`,               
    imgtype:'png',
    a: lj2,        
    group:group,
    zhu:zhu,
    a1:a1,
    b1:b1,
    c1:c1,
    d1:d1,
    a2:a2,
    b2:b2,
    c2:c2,
    d2:d2,
    a3:a3,
    b3:b3,
    c3:c3,
    d3:d3,
    a4:a4,
    b4:b4,
    c4:c4,
    d4:d4,
    a5:a5,
    b5:b5,
    c5:c5,
    d5:d5,
    a6:a6,
    b6:b6,
    c6:c6,
    d6:d6,
    a7:a7,
    b7:b7,
    c7:c7,
    d7:d7,
    a8:a8,
    b8:b8,
    c8:c8,
    d8:d8,
    a9:a9,
    b9:b9,
    c9:c9,
    d9:d9,
    a10:a10,
    b10:b10,
    c10:c10,
    d10:d10
    });
    console.log(a1)
    await this.reply(img)
    him.length=0
    arr3.length=0
    k.length=0
    h.length=0
    let yu = fs.readFileSync(`${lj}`,"utf-8")
    //console.log(yu)
      }
    }