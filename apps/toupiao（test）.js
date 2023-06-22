//发起投票格式举例：#投票 A B C D，参与投票举例：#投票1


import plugin from '../../../lib/plugins/plugin.js'
import common from '../../../lib/common/common.js'

    const _path = process.cwd();
import lodash from 'lodash'
import fs from "fs";
import path from 'path';


let time = 60000 //投票持续时间，单位：毫秒 
let item = []
let qid 
let uu = []
var dirpath = _path + '/resources/toupiao';
var filename = '';//文件名

if (!fs.existsSync(dirpath)) {
  fs.mkdirSync(dirpath);}

export class tt extends plugin{
constructor(){
super({ 
    name:'阴天[投票]' ,
    event: 'message', 
       priority: 5000, //优先级，越小优先度越高
        describe: "", 
       rule: [
      {reg: "^#发起投票(.*)$",
       fnc: 'toupiao'
            },
            {reg: "^#投票(.*)$",
            fnc: 'toupiao1'
                 }
                     
                    ]
                  })


}
async toupiao(e){
    
    if(!e.isGroup){e.reply('该功能仅群聊可用');return true}else{ filename=e.group_id+'.json'
   
    
let msg = e.msg.replace('#发起投票','').split(' ')
msg = msg.filter(item => item !== '');

console.log(msg);
item = msg
if(item.length<2){e.reply('请输入两个以上的投票项目');return false }
else{
    let a = ''
    let b = ''
    let J = {}
    item.forEach((item,index) => {
        a = `${index+1}`+`.`+String(item)
        b += String(a)+'\n'
        J[item] = 0;
    });
   
    
    if (!fs.existsSync(dirpath+"/"+filename)) {
        fs.appendFileSync(dirpath + "/" + filename, JSON.stringify(J))
     
      }else{e.reply('投票正在进行中，请完成本群当前投票后再试')}
 
   e.reply(`投票开始，投票项目：\n${b}回复：#投票+序号 即可参与投票，投票即将在${time/1000}秒后截止。`)

setTimeout(() => {
    fs.readFile(dirpath+"/"+filename,(err,data)=>{if(err){console.log(err.message)}
    let json = JSON.parse(data)
    let str = '';
    for (let key in json) {
    str += `${key}得票:${json[key]}!`;
}

e.reply(str); 
    })



    fs.unlink(dirpath + "/" + filename, (err) => {
        if (err) throw err;
        console.log('File deleted!');
        e.reply(`投票结束，现在停止投票。`)
    });
    uu = []
    
}, time);



}}


}
 
async toupiao1(e){filename=e.group_id+'.json'
qid = e.user_id

if(!fs.existsSync(dirpath+"/"+filename)){e.reply('还未发起投票噢。请使用#发起投票+投票项目 发起投票吧！')
return false}
else if(uu.includes(qid)){e.reply('每人只能投一次票噢！')}
else{
    let m = parseInt(e.msg.replace('#投票','').trim())-1
    let i = item[m]
    fs.readFile(dirpath+"/"+filename,(err,data)=>{if(err){console.log(err.message)}
let json = JSON.parse(data)
json[i] += 1
fs.writeFile(dirpath+"/"+filename, JSON.stringify(json), (err) => {
    if (err) throw err;
});
})
e.reply('投票成功')
uu.push(qid)

    



}

}
} 

