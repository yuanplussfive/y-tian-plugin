//算是个半成品吧，因为四星武器没有写进去，我太懒了
//发送 #抽卡插件帮助 即可获得使用方法
//四星的出货率是自己调的，当时写错了懒得改了
//五星出货率严格按照游戏的抽卡设定数据，概率是一模一样的
//因为没有设定四星武器所以武器池抽出的四星全是角色，别骂我
//可自定义添加角色和武器，在下方five = [....] 这个数组中按格式添加即可，其中four是四星角色，changzhu是常驻角色，wuqi是up五星武器，three是三星武器，ysj是御三家，czwuqi是常驻五星武器
//若想自行添加四星武器进卡池在four按格式添加即可
//没有写武器池的欧非分析，因为武器池计算欧非有点复杂懒得写（）
//插件仍在测试，若出现bug联系qq：928368902


import plugin from '../../../lib/plugins/plugin.js'
import {getSegment} from "../model/segment.js"
    const segment = await getSegment()
const _path = process.cwd();
import fs from "node:fs";
import path from 'path';


let 结果 = ''
let wqgailv = 0.007
let jsgailv = 0.006
let five = ['雷电将军','八重神子','神里绫华','申鹤','魈','宵宫','温迪','阿贝多','可莉','优菈','胡桃','甘雨','钟离','夜阑','达达利亚','神里绫人','枫原万叶','荒泷一斗','艾尔海森','纳西妲','流浪者','妮露','赛诺','珊瑚宫心海']
let changzhu = ['迪希娅','迪卢克','七七','刻晴','提纳里','琴','莫娜']
let czwuqi = ['天空之傲','天空之卷','天空之翼','天空之脊','风鹰剑','天空之刃','狼的末路','阿莫斯之弓','和璞鸢','四风原典']
let four = ['卡维','米卡','瑶瑶','珐露珊','莱伊拉','坎蒂丝','多莉','柯莱','鹿野院平藏','久歧忍','云堇','早柚','五郎','托马','九条裟罗','烟绯','罗莎莉亚','辛焱','迪奥娜','香菱','行秋','雷泽','凝光','菲谢尔','砂糖','诺艾尔','班尼特','芭芭拉','北斗','重云']
let wuqi = ['拨乱月白经津','斫峰之刃','雾切之回光','苍古自由之誓','裁叶萃光','圣显之钥','磐岩结绿','赤角石溃杵','松籁响起之时','无工之剑','苇海信标','飞雷之弦振','若水','冬极白星','猎人之径','终末嗟叹之诗','尘世之锁','千夜浮梦','图莱杜拉的回忆','神乐之真意','不灭月华','护摩之杖','赤沙之杖','贯虹之槊','息灾','薙草之稻光']
let ysj = ['凯亚','安柏','丽莎']
let three = ['以理服人','暗铁剑','旅行剑','冷刃','飞天御剑','吃虎鱼刀','沐浴龙血的剑','黎明神剑','白铁大剑','铁影阔剑','飞天大御剑','以理服人','鸦羽弓','信使','魔导绪论','讨龙英杰谭','白缨枪','黑缨枪','甲级宝珏','翡玉法球','弹弓']
var dirpath = _path + '/resources/choukadata';
var filename = '';//文件名
if (!fs.existsSync(dirpath)) {
  fs.mkdirSync(dirpath);}

export class example extends plugin {
    constructor () {
      super({
        /** 功能名称 */
        name: 'game',
        /** 功能描述 */
        dsc: 'game',
        event: 'message',
        /** 优先级，数字越小等级越高 */
        priority: -1,
        rule: [
          {
            /** 命令正则匹配 */
            reg: '#设定我的up角色 (.*)$',
            /** 执行方法 */
            fnc: 'setjs'
          },
          {
            /** 命令正则匹配 */
            reg: '#设定我的up武器 (.*)$',
            /** 执行方法 */
            fnc: 'setwq'
          },
          {
            /** 命令正则匹配 */
            reg: '#一发武器池',
            /** 执行方法 */
            fnc: 'cwq'
          },
          {
            /** 命令正则匹配 */
            reg: '#十发武器池',
            /** 执行方法 */
            fnc: 'cwq'
          },
          {
            /** 命令正则匹配 */
            reg: '#十发角色池',
            /** 执行方法 */
            fnc: 'cjs'
          },
          {
            /** 命令正则匹配 */
            reg: '#一发角色池',
            /** 执行方法 */
            fnc: 'cjs'
          },
          {
            /** 命令正则匹配 */
            reg: '#自定义抽卡统计',
            /** 执行方法 */
            fnc: 'cktj'
          },
          {
            /** 命令正则匹配 */
            reg: '#抽卡插件帮助',
            /** 执行方法 */
            fnc: 'ckhelp'
          },

        ]
      })
    }
async setjs(e){
    //判断输入角色是否为预设up
    let up = e.msg.replace('#设定我的up角色','').trim()
    if (five.includes(up))
     {      
            filename = e.user_id+`.json`
            //判断是否存在用户数据并更改内容
            if (!fs.existsSync(dirpath+"/"+filename)) 
            {
            fs.appendFileSync(dirpath + "/" + filename, JSON.stringify({"up":up,"up武器":0,"up陪跑":0,"up抽数":0,"up武器抽数":0,"保底":0,"up武器保底":0,"累计角色抽卡次数":0,"累计角色池出up次数":0}))
            }
            else
            {
                fs.readFile(dirpath + "/" + filename, (err, data) => {
                    if (err) {
                        console.log(err);
                             }
                    else{
                        let obj = JSON.parse(data); // 将JSON字符串转为对象
                        obj.up = up; // 更改up角色
                        let jsonStr = JSON.stringify(obj); // 将对象转为JSON字符串
                        fs.writeFile(dirpath + "/" + filename, jsonStr, (err) => {
                            if (err) throw err;
                            console.log('JSON文件已更新');
                          });
                        }
                                                                     }) 
            }
            e.reply(`您的自定义up已经设定成功，为:${up},可以开始抽卡了。`)
     }   
     else
     {
                    e.reply('找不到up预设，请确保您输入的up角色是预设内角色并且是角色全名。')
     }
 



}
async setwq(e){
  //判断输入武器是否为预设up
  let up = e.msg.replace('#设定我的up武器','').trim()
  if (wuqi.includes(up)|czwuqi.includes(up))
   {      //随机选择陪跑武器
           let a
           function getRandomup(array) {
            return array[Math.floor(Math.random() * array.length)];
          }
          
            a = getRandomup(wuqi.concat(czwuqi)); 
          
          while (a === up) { // 如果up与陪跑相同则重新执行选择程序
            a = getRandomup(wuqi.concat(czwuqi));
          }

          filename = e.user_id+`.json`
          //判断是否存在用户数据并更改内容
          if (!fs.existsSync(dirpath+"/"+filename)) 
          {
          fs.appendFileSync(dirpath + "/" + filename, JSON.stringify({"up":0,"up武器":up,"up陪跑":a,"up抽数":0,"up武器抽数":0,"保底":0,"up武器保底":0,"累计角色抽卡次数":0,"累计角色池出up次数":0}))
          }
          else
          {
              fs.readFile(dirpath + "/" + filename, (err, data) => {
                  if (err) {
                      console.log(err);
                           }
                  else{
                      let obj = JSON.parse(data); // 将JSON字符串转为对象
                      obj.up武器 = up; // 更改up武器
                      obj.up陪跑 = a
                      let jsonStr = JSON.stringify(obj); // 将对象转为JSON字符串
                      fs.writeFile(dirpath + "/" + filename, jsonStr, (err) => {
                          if (err) throw err;
                          console.log('JSON文件已更新');
                        });
                      }
                                                                   }) 
          }
    
   e.reply(`您的自定义up武器已经设定成功，为:${up}，系统为您随机选择了一个陪跑武器：${a},可以开始抽卡了。`)
   }
   else
   {
                  e.reply('找不到up武器预设，请确保您输入的up武器是预设内武器并且是武器全名。')
   }

}

async cwq(e){filename = e.user_id+`.json`
    if (!fs.existsSync(dirpath + "/" + filename)) 
            {
            e.reply('您还未设定您的up武器池,具体操作请发送 #抽卡插件帮助 查看。')
            
            }
    else
    {
      try {
        let data = fs.readFileSync(dirpath + "/" + filename);
                let obj = JSON.parse(data); // 将JSON字符串转为对象
               
                if(obj.up武器 == 0){e.reply('您还未设定您的up武器池,具体操作请发送 #抽卡插件帮助 查看。')}
                
                else
                {
                     if(e.msg == "#一发武器池")
                        {
                            if(obj.up武器抽数>=0&obj.up武器抽数<=62)
                               {  let 品质
                                  let rand =Math.random()
                                  if(rand<wqgailv){品质='金'}
                                  else{品质='非金'}
                                  if(品质=='金')
                                    {obj.up武器抽数=0;
                                        if(obj.up武器保底==2){obj.up武器保底=0;e.reply(`恭喜你吃满定轨，获得up武器:${obj.up武器}，武器池累计抽数已清空。`)} 
                                        else if(obj.up武器保底<2){rand =Math.random();
                                                            if(rand>0.75){rand =Math.random();
                                                                          if(rand>0.5){obj.up武器保底=0;e.reply(`恭喜你欧皇，你获得up武器:${obj.up武器}，武器池累计抽数已清空。`)}else{obj.up武器保底+=1;e.reply(`哈哈非酋，你获得了陪跑武器${obj.up陪跑},武器池累计抽数已清空,命定值+1。`)}
                                                                         }
                                                            else{obj.up武器保底+=1;let 歪 = Math.floor(Math.random() * czwuqi.length);歪 = czwuqi[歪];e.reply(`你的运气太差了，歪出了一把${歪}，不愧是你。`)}
                                                           }
                                    }
                               else if(品质=='非金'){obj.up武器抽数+=1;if(obj.up武器抽数%10!==0&&obj.up武器抽数%10<8){rand=Math.random();if(rand>0.1){let 三星 = Math.floor(Math.random() * three.length);三星 = three[三星];e.reply(`三星武器，${三星}`)}else if(rand<0.001){let 御三家 = Math.floor(Math.random() * ysj.length);御三家 = ysj[御三家];e.reply(`出了一个${御三家}，欧皇降临！。`)}else{let 四星 = Math.floor(Math.random() * four.length);四星 = four[四星];e.reply(`出了一个${四星}，还行。`)}}
                                                              else if(obj.up武器抽数%10>=8){rand=Math.random();if(rand<0.4){let 四星 = Math.floor(Math.random() * four.length);四星 = four[四星];e.reply(`出了一个${四星}，还行。`)}else if(rand<0.001){let 御三家 = Math.floor(Math.random() * ysj.length);御三家 = ysj[御三家];e.reply(`出了一个${御三家}，欧皇降临！。`)}else{let 三星 = Math.floor(Math.random() * three.length);三星 = three[三星];e.reply(`三星武器，${三星}`)}}
                                                              else if(obj.up武器抽数%10==0){rand=Math.random();if(rand<0.001){let 御三家 = Math.floor(Math.random() * ysj.length);御三家 = ysj[御三家];e.reply(`出了一个${御三家}，欧皇降临！。`)}else{let 四星 = Math.floor(Math.random() * four.length);四星 = four[四星];e.reply(`出了一个${四星}，还行。`)}}
                                                }
                               }
                            else if(obj.up武器抽数>=63&obj.up武器抽数<=73)
                               {
                                let 概率 = (obj.up武器抽数-62)*0.07+wqgailv
                                console.log(`当前概率：${概率}`)
                                let 品质
                                  let rand =Math.random()
                                  if(rand<概率){品质='金'}
                                  else{品质='非金'}
                                  if(品质=='金')
                                    {obj.up武器抽数=0;
                                        if(obj.up武器保底==2){obj.up武器保底=0;e.reply(`恭喜你吃满定轨，获得up武器:${obj.up武器}，武器池累计抽数已清空。`)} 
                                        else if(obj.up武器保底<2){rand =Math.random();
                                                            if(rand>0.75){rand =Math.random();
                                                                          if(rand>0.5){obj.up武器保底=0;e.reply(`恭喜你欧皇，你获得up武器:${obj.up武器}，武器池累计抽数已清空。`)}else{obj.up武器保底+=1;e.reply(`哈哈非酋，你获得了陪跑武器${obj.up陪跑},武器池累计抽数已清空,命定值+1。`)}
                                                                         }
                                                            else{obj.up武器保底+=1;let 歪 = Math.floor(Math.random() * czwuqi.length);歪 = czwuqi[歪];e.reply(`你的运气太差了，歪出了一把${歪}，不愧是你。`)}
                                                           }
                                    }
                               else if(品质=='非金'){obj.up武器抽数+=1;if(obj.up武器抽数%10!==0&&obj.up武器抽数%10<8){rand=Math.random();if(rand>0.1){let 三星 = Math.floor(Math.random() * three.length);三星 = three[三星];e.reply(`三星武器，${三星}`)}else if(rand<0.001){let 御三家 = Math.floor(Math.random() * ysj.length);御三家 = ysj[御三家];e.reply(`出了一个${御三家}，欧皇降临！。`)}else{let 四星 = Math.floor(Math.random() * four.length);四星 = four[四星];e.reply(`出了一个${四星}，还行。`)}}
                                                              else if(obj.up武器抽数%10>=8){rand=Math.random();if(rand<0.4){let 四星 = Math.floor(Math.random() * four.length);四星 = four[四星];e.reply(`出了一个${四星}，还行。`)}else if(rand<0.001){let 御三家 = Math.floor(Math.random() * ysj.length);御三家 = ysj[御三家];e.reply(`出了一个${御三家}，欧皇降临！。`)}else{let 三星 = Math.floor(Math.random() * three.length);三星 = three[三星];e.reply(`三星武器，${三星}`)}}
                                                              else if(obj.up武器抽数%10==0){rand=Math.random();if(rand<0.001){let 御三家 = Math.floor(Math.random() * ysj.length);御三家 = ysj[御三家];e.reply(`出了一个${御三家}，欧皇降临！。`)}else{let 四星 = Math.floor(Math.random() * four.length);四星 = four[四星];e.reply(`出了一个${四星}，还行。`)}}
                                                }
                               }
                            else if(obj.up武器抽数>=74&obj.up武器抽数<80)
                               {
                                let 概率 = (obj.up武器抽数-73)*0.35+0.707
                                console.log(`当前概率：${概率}`)
                                let 品质
                                let rand =Math.random()
                                if(rand<概率){品质='金'}
                                else{品质='非金'}
                                if(品质=='金')
                                  {obj.up武器抽数=0;
                                      if(obj.up武器保底==2){obj.up武器保底=0;e.reply(`恭喜你吃满定轨，获得up武器:${obj.up武器}，武器池累计抽数已清空。`)} 
                                      else if(obj.up武器保底<2){rand =Math.random();
                                                          if(rand>0.75){rand =Math.random();
                                                                        if(rand>0.5){obj.up武器保底=0;e.reply(`恭喜你欧皇，你获得up武器:${obj.up武器}，武器池累计抽数已清空。`)}else{obj.up武器保底+=1;e.reply(`哈哈非酋，你获得了陪跑武器${obj.up陪跑},武器池累计抽数已清空,命定值+1。`)}
                                                                       }
                                                          else{obj.up武器保底+=1;let 歪 = Math.floor(Math.random() * czwuqi.length);歪 = czwuqi[歪];e.reply(`你的运气太差了，歪出了一把${歪}，不愧是你。`)}
                                                         }
                                  }
                          else if(品质=='非金'){obj.up武器抽数+=1;if(obj.up武器抽数%10!==0&&obj.up武器抽数%10<8){rand=Math.random();if(rand>0.1){let 三星 = Math.floor(Math.random() * three.length);三星 = three[三星];e.reply(`三星武器，${三星}`)}else if(rand<0.001){let 御三家 = Math.floor(Math.random() * ysj.length);御三家 = ysj[御三家];e.reply(`出了一个${御三家}，欧皇降临！。`)}else{let 四星 = Math.floor(Math.random() * four.length);四星 = four[四星];e.reply(`出了一个${四星}，还行。`)}}
                                                              else if(obj.up武器抽数%10>=8){rand=Math.random();if(rand<0.4){let 四星 = Math.floor(Math.random() * four.length);四星 = four[四星];e.reply(`出了一个${四星}，还行。`)}else if(rand<0.001){let 御三家 = Math.floor(Math.random() * ysj.length);御三家 = ysj[御三家];e.reply(`出了一个${御三家}，欧皇降临！。`)}else{let 三星 = Math.floor(Math.random() * three.length);三星 = three[三星];e.reply(`三星武器，${三星}`)}}
                                                              else if(obj.up武器抽数%10==0){rand=Math.random();if(rand<0.001){let 御三家 = Math.floor(Math.random() * ysj.length);御三家 = ysj[御三家];e.reply(`出了一个${御三家}，欧皇降临！。`)}else{let 四星 = Math.floor(Math.random() * four.length);四星 = four[四星];e.reply(`出了一个${四星}，还行。`)}}
                                                }
                               }
                            if(obj.up武器抽数==80)
                            {
                                obj.up武器抽数=0;
                                      if(obj.up武器保底==2){obj.up武器保底=0;e.reply(`吃满定轨吃满保底，获得up武器:${obj.up武器}，武器池累计抽数已清空，建议人生重开。`)} 
                                      else if(obj.up武器保底<2){rand =Math.random();
                                                          if(rand>0.75){rand =Math.random();
                                                                        if(rand>0.5){obj.up武器保底=0;e.reply(`另一种形式的欧皇，80抽获得up武器:${obj.up武器}，武器池累计抽数已清空。`)}else{obj.up武器保底+=1;e.reply(`哈哈非酋，你获得了陪跑武器${obj.up陪跑},武器池累计抽数已清空,命定值+1。`)}
                                                                       }
                                                          else{obj.up武器保底+=1;let 歪 = Math.floor(Math.random() * czwuqi.length);歪 = czwuqi[歪];e.reply(`6，80抽还歪了常驻，歪出了一把${歪}，不愧是你。`)}
                                                         }
                            }
                        }  
                        let jsonStr = JSON.stringify(obj); // 将对象转为JSON字符串
                        fs.writeFileSync(dirpath + "/" + filename, jsonStr);
                        console.log('JSON文件已更新');
            

                    if(e.msg == "#十发武器池"){
                let 十连 = []        
           for(let i = 0;i<10;i++)
{


    if(obj.up武器抽数>=0&&obj.up武器抽数<=62)
    {  let 品质
       let rand =Math.random()
       if(rand<wqgailv){品质='金'}
       else{品质='非金'}
       if(品质=='金')
         {obj.up武器抽数=0;
             if(obj.up武器保底==2){obj.up武器保底=0;十连.push(obj.up武器)} 
             else if(obj.up武器保底<2){rand =Math.random();
                                 if(rand>0.75){rand =Math.random();
                                               if(rand>0.5){obj.up武器保底=0;十连.push(obj.up武器)}else{obj.up武器保底+=1;十连.push(obj.up陪跑)}
                                              }
                                 else{obj.up武器保底+=1;let 歪 = Math.floor(Math.random() * czwuqi.length);歪 = czwuqi[歪];十连.push(歪)}
                                }
         }
    else if(品质=='非金'){obj.up武器抽数+=1;if(obj.up武器抽数%10!==0&&obj.up武器抽数%10<8){rand=Math.random();if(rand>0.1){let 三星 = Math.floor(Math.random() * three.length);三星 = three[三星];十连.push(三星)}else if(rand<0.001){let 御三家 = Math.floor(Math.random() * ysj.length);御三家 = ysj[御三家];十连.push(御三家)}else{let 四星 = Math.floor(Math.random() * four.length);四星 = four[四星];十连.push(四星)}}
                                   else if(obj.up武器抽数%10>=8){rand=Math.random();if(rand<0.4){let 四星 = Math.floor(Math.random() * four.length);四星 = four[四星];十连.push(四星)}else if(rand<0.001){let 御三家 = Math.floor(Math.random() * ysj.length);御三家 = ysj[御三家];十连.push(御三家)}else{let 三星 = Math.floor(Math.random() * three.length);三星 = three[三星];十连.push(三星)}}
                                   else if(obj.up武器抽数%10==0){rand=Math.random();if(rand<0.001){let 御三家 = Math.floor(Math.random() * ysj.length);御三家 = ysj[御三家];十连.push(御三家)}else{let 四星 = Math.floor(Math.random() * four.length);四星 = four[四星];十连.push(四星)}}
                     }
    }
    else if(obj.up武器抽数>=63&obj.up武器抽数<=73)
    {
     let 概率 = (obj.up武器抽数-62)*0.07+wqgailv
     console.log(`当前概率：${概率}`)
     let 品质
       let rand =Math.random()
       if(rand<概率){品质='金'}
       else{品质='非金'}
       if(品质=='金')
       {obj.up武器抽数=0;
        if(obj.up武器保底==2){obj.up武器保底=0;十连.push(obj.up武器)} 
        else if(obj.up武器保底<2){rand =Math.random();
                            if(rand>0.75){rand =Math.random();
                                          if(rand>0.5){obj.up武器保底=0;十连.push(obj.up武器)}else{obj.up武器保底+=1;十连.push(obj.up陪跑)}
                                         }
                            else{obj.up武器保底+=1;let 歪 = Math.floor(Math.random() * czwuqi.length);歪 = czwuqi[歪];十连.push(歪)}
                           }
    }
else if(品质=='非金'){obj.up武器抽数+=1;if(obj.up武器抽数%10!==0&&obj.up武器抽数%10<8){rand=Math.random();if(rand>0.1){let 三星 = Math.floor(Math.random() * three.length);三星 = three[三星];十连.push(三星)}else if(rand<0.001){let 御三家 = Math.floor(Math.random() * ysj.length);御三家 = ysj[御三家];十连.push(御三家)}else{let 四星 = Math.floor(Math.random() * four.length);四星 = four[四星];十连.push(四星)}}
                              else if(obj.up武器抽数%10>=8){rand=Math.random();if(rand<0.4){let 四星 = Math.floor(Math.random() * four.length);四星 = four[四星];十连.push(四星)}else if(rand<0.001){let 御三家 = Math.floor(Math.random() * ysj.length);御三家 = ysj[御三家];十连.push(御三家)}else{let 三星 = Math.floor(Math.random() * three.length);三星 = three[三星];十连.push(三星)}}
                              else if(obj.up武器抽数%10==0){rand=Math.random();if(rand<0.001){let 御三家 = Math.floor(Math.random() * ysj.length);御三家 = ysj[御三家];十连.push(御三家)}else{let 四星 = Math.floor(Math.random() * four.length);四星 = four[四星];十连.push(四星)}}
                }
}
else if(obj.up武器抽数>=74&obj.up武器抽数<80)
{
 let 概率 = (obj.up武器抽数-73)*0.35+0.707
 console.log(`当前概率：${概率}`)
 let 品质
 let rand =Math.random()
 if(rand<概率){品质='金'}
 else{品质='非金'}
 if(品质=='金')
 {obj.up武器抽数=0;
    if(obj.up武器保底==2){obj.up武器保底=0;十连.push(obj.up武器)} 
    else if(obj.up武器保底<2){rand =Math.random();
                        if(rand>0.75){rand =Math.random();
                                      if(rand>0.5){obj.up武器保底=0;十连.push(obj.up武器)}else{obj.up武器保底+=1;十连.push(obj.up陪跑)}
                                     }
                        else{obj.up武器保底+=1;let 歪 = Math.floor(Math.random() * czwuqi.length);歪 = czwuqi[歪];十连.push(歪)}
                       }
}
else if(品质=='非金'){obj.up武器抽数+=1;if(obj.up武器抽数%10!==0&&obj.up武器抽数%10<8){rand=Math.random();if(rand>0.1){let 三星 = Math.floor(Math.random() * three.length);三星 = three[三星];十连.push(三星)}else if(rand<0.001){let 御三家 = Math.floor(Math.random() * ysj.length);御三家 = ysj[御三家];十连.push(御三家)}else{let 四星 = Math.floor(Math.random() * four.length);四星 = four[四星];十连.push(四星)}}
                          else if(obj.up武器抽数%10>=8){rand=Math.random();if(rand<0.4){let 四星 = Math.floor(Math.random() * four.length);四星 = four[四星];十连.push(四星)}else if(rand<0.001){let 御三家 = Math.floor(Math.random() * ysj.length);御三家 = ysj[御三家];十连.push(御三家)}else{let 三星 = Math.floor(Math.random() * three.length);三星 = three[三星];十连.push(三星)}}
                          else if(obj.up武器抽数%10==0){rand=Math.random();if(rand<0.001){let 御三家 = Math.floor(Math.random() * ysj.length);御三家 = ysj[御三家];十连.push(御三家)}else{let 四星 = Math.floor(Math.random() * four.length);四星 = four[四星];十连.push(四星)}}
            }
}
if(obj.up武器抽数==80)
{
    obj.up武器抽数=0;
          if(obj.up武器保底==2){obj.up武器保底=0;十连.push(obj.up武器)} 
         else if(obj.up武器保底<2){rand =Math.random();
                              if(rand>0.75){rand =Math.random();
                                            if(rand>0.5){obj.up武器保底=0;十连.push(obj.up武器)}else{obj.up武器保底+=1;十连.push(obj.up陪跑)}
                                           }
                              else{obj.up武器保底+=1;let 歪 = Math.floor(Math.random() * czwuqi.length);歪 = czwuqi[歪];十连.push(歪)}
                             }
}


                         









    
}
console.log(obj)
let jsonStr = JSON.stringify(obj); // 将对象转为JSON字符串
console.log(jsonStr)
fs.writeFileSync(dirpath + "/" + filename, jsonStr);
console.log('JSON文件已更新');
console.log(十连) 
for(let g = 0;g<十连.length;g++){结果 = 结果 + 十连[g]+'\n'}
e.reply([
 `用户:`+e.user_id+`\n`+
 '十颗流星划过天际,恭喜您获得：\n'+
  结果
]
)
十连 = []
结果 = ''



                    }

                }
                }
                catch (err) {
                  console.log(err);
                }  
    }




}

async cjs(e){
  filename = e.user_id+`.json`
  if (!fs.existsSync(dirpath + "/" + filename)) 
          {
          e.reply('您还未设定您的up池,具体操作请发送 #抽卡插件帮助 查看。')
          
          }
  else
  {

try { 

  let data = fs.readFileSync(dirpath + "/" + filename);
  let obj = JSON.parse(data); // 将JSON字符串转为对象
 
  if(obj.up == 0){e.reply('您还未设定您的up池,具体操作请发送 #抽卡插件帮助 查看。')}
  
  else
  {

    if(e.msg == "#一发角色池")
    {obj.累计角色抽卡次数+=1
      if(obj.up抽数>=0&obj.up抽数<=73)
      {
                                  let 品质
                                  let rand =Math.random()
                                  if(rand<jsgailv){品质='金'}
                                  else{品质='非金'}
                                  if(品质=='金'){
                                    obj.up抽数=0
                                    if(obj.保底!==0){obj.保底 = 0;obj.累计角色池出up次数+=1;e.reply(`恭喜你，大保底获得up角色:${obj.up}，up池累计抽数已清空。`)}
                               else if(obj.保底 ==0){rand =Math.random();
                                           if(rand>0.5){obj.保底 += 1;
                                                let 歪 = Math.floor(Math.random() * changzhu.length);歪 = changzhu[歪];e.reply(`你的运气太差了，歪出了一个${歪}，不愧是你。`)}
                                           else{obj.累计角色池出up次数+=1;e.reply(`恭喜你,运气真好，小保底获得up角色:${obj.up}，up池累计抽数已清空。`)}                              
                                                    }
      }
                             else if(品质=='非金'){obj.up抽数+=1;if(obj.up抽数%10!==0&&obj.up抽数%10<8){rand=Math.random();if(rand>0.1){let 三星 = Math.floor(Math.random() * three.length);三星 = three[三星];e.reply(`三星武器，${三星}`)}else if(rand<0.001){let 御三家 = Math.floor(Math.random() * ysj.length);御三家 = ysj[御三家];e.reply(`出了一个${御三家}，欧皇降临！。`)}else{let 四星 = Math.floor(Math.random() * four.length);四星 = four[四星];e.reply(`出了一个${四星}，还行。`)}}
                                                                else if(obj.up抽数%10>=8){rand=Math.random();if(rand<0.4){let 四星 = Math.floor(Math.random() * four.length);四星 = four[四星];e.reply(`出了一个${四星}，还行。`)}else if(rand<0.001){let 御三家 = Math.floor(Math.random() * ysj.length);御三家 = ysj[御三家];e.reply(`出了一个${御三家}，欧皇降临！。`)}else{let 三星 = Math.floor(Math.random() * three.length);三星 = three[三星];e.reply(`三星武器，${三星}`)}}
                                                                else if(obj.up抽数%10==0){rand=Math.random();if(rand<0.001){let 御三家 = Math.floor(Math.random() * ysj.length);御三家 = ysj[御三家];e.reply(`出了一个${御三家}，欧皇降临！。`)}else{let 四星 = Math.floor(Math.random() * four.length);四星 = four[四星];e.reply(`出了一个${四星}，还行。`)}}
                                                  }    
    }
    if(obj.up抽数>=74&obj.up抽数<=89)
      {                           let 概率 = (obj.up抽数-73)*0.6+jsgailv
                                  console.log(`当前概率：${概率}`)
                                  let 品质
                                  let rand =Math.random()
                                  if(rand<概率){品质='金'}
                                  else{品质='非金'}
                                  if(品质=='金'){
                                    obj.up抽数=0
                                    if(obj.保底!==0){obj.保底 = 0;obj.累计角色池出up次数+=1;e.reply(`恭喜你，大保底获得up角色:${obj.up}，up池累计抽数已清空。`)}
                               else if(obj.保底 ==0){rand =Math.random();
                                           if(rand>0.5){obj.保底 += 1;
                                                let 歪 = Math.floor(Math.random() * changzhu.length);歪 = changzhu[歪];e.reply(`你的运气太差了，歪出了一个${歪}，不愧是你。`)}
                                           else{obj.累计角色池出up次数+=1;e.reply(`恭喜你,运气真好，小保底获得up角色:${obj.up}，up池累计抽数已清空。`)}                              
                                                    }
      }
                             else if(品质=='非金'){obj.up抽数+=1;if(obj.up抽数%10!==0&&obj.up抽数%10<8){rand=Math.random();if(rand>0.1){let 三星 = Math.floor(Math.random() * three.length);三星 = three[三星];e.reply(`三星武器，${三星}`)}else if(rand<0.001){let 御三家 = Math.floor(Math.random() * ysj.length);御三家 = ysj[御三家];e.reply(`出了一个${御三家}，欧皇降临！。`)}else{let 四星 = Math.floor(Math.random() * four.length);四星 = four[四星];e.reply(`出了一个${四星}，还行。`)}}
                                                                else if(obj.up抽数%10>=8){rand=Math.random();if(rand<0.4){let 四星 = Math.floor(Math.random() * four.length);四星 = four[四星];e.reply(`出了一个${四星}，还行。`)}else if(rand<0.001){let 御三家 = Math.floor(Math.random() * ysj.length);御三家 = ysj[御三家];e.reply(`出了一个${御三家}，欧皇降临！。`)}else{let 三星 = Math.floor(Math.random() * three.length);三星 = three[三星];e.reply(`三星武器，${三星}`)}}
                                                                else if(obj.up抽数%10==0){rand=Math.random();if(rand<0.001){let 御三家 = Math.floor(Math.random() * ysj.length);御三家 = ysj[御三家];e.reply(`出了一个${御三家}，欧皇降临！。`)}else{let 四星 = Math.floor(Math.random() * four.length);四星 = four[四星];e.reply(`出了一个${四星}，还行。`)}}
                                                  } 
      }
      if(obj.up抽数==90)
      {
        obj.up抽数=0
        if(obj.保底!==0){obj.保底 = 0;obj.累计角色池出up次数+=1;e.reply(`大保底90发吃满获得up角色:${obj.up}，up池累计抽数已清空。`)}
   else if(obj.保底 ==0){rand =Math.random();
               if(rand>0.5){obj.保底 += 1;
                    let 歪 = Math.floor(Math.random() * changzhu.length);歪 = changzhu[歪];e.reply(`你的运气太差了，90发小保底歪出了一个${歪}，不愧是你。`)}
               else{obj.累计角色池出up次数+=1;e.reply(`恭喜你,90发小保底拿下up角色:${obj.up}，up池累计抽数已清空。`)}                              
                        }
      }
}
let jsonStr = JSON.stringify(obj); // 将对象转为JSON字符串
fs.writeFileSync(dirpath + "/" + filename, jsonStr);
console.log('JSON文件已更新');
    if(e.msg == "#十发角色池")
    {obj.累计角色抽卡次数+=10
      let 十连 = []        
      for(let i = 0;i<10;i++)


      {

        if(obj.up抽数>=0&obj.up抽数<=73)
        {
                                    let 品质
                                    let rand =Math.random()
                                    if(rand<jsgailv){品质='金'}
                                    else{品质='非金'}
                                    if(品质=='金'){
                                      obj.up抽数=0
                                      if(obj.保底!==0){obj.累计角色池出up次数+=1;obj.保底 = 0;十连.push(obj.up)}
                                 else if(obj.保底 ==0){rand =Math.random();
                                             if(rand>0.5){obj.保底 += 1;
                                                  let 歪 = Math.floor(Math.random() * changzhu.length);歪 = changzhu[歪];十连.push(歪)}
                                             else{obj.累计角色池出up次数+=1;十连.push(obj.up)}                              
                                                      }
        }
                               else if(品质=='非金'){obj.up抽数+=1;if(obj.up抽数%10!==0&&obj.up抽数%10<8){rand=Math.random();if(rand>0.1){let 三星 = Math.floor(Math.random() * three.length);三星 = three[三星];十连.push(三星)}else if(rand<0.001){let 御三家 = Math.floor(Math.random() * ysj.length);御三家 = ysj[御三家];十连.push(御三家)}else{let 四星 = Math.floor(Math.random() * four.length);四星 = four[四星];十连.push(四星)}}
                                                                  else if(obj.up抽数%10>=8){rand=Math.random();if(rand<0.4){let 四星 = Math.floor(Math.random() * four.length);四星 = four[四星];十连.push(四星)}else if(rand<0.001){let 御三家 = Math.floor(Math.random() * ysj.length);御三家 = ysj[御三家];十连.push(御三家)}else{let 三星 = Math.floor(Math.random() * three.length);三星 = three[三星];十连.push(三星)}}
                                                                  else if(obj.up抽数%10==0){rand=Math.random();if(rand<0.001){let 御三家 = Math.floor(Math.random() * ysj.length);御三家 = ysj[御三家];十连.push(御三家)}else{let 四星 = Math.floor(Math.random() * four.length);四星 = four[四星];十连.push(四星)}}
                                                    }    
      }
      if(obj.up抽数>=74&obj.up抽数<=89)
        {                           let 概率 = (obj.up抽数-73)*0.6+jsgailv
                                    console.log(`当前概率：${概率}`)
                                    let 品质
                                    let rand =Math.random()
                                    if(rand<概率){品质='金'}
                                    else{品质='非金'}
                                    if(品质=='金'){
                                      obj.up抽数=0
                                      if(obj.保底!==0){obj.累计角色池出up次数+=1;obj.保底 = 0;十连.push(obj.up)}
                                 else if(obj.保底 ==0){rand =Math.random();
                                             if(rand>0.5){obj.保底 += 1;
                                                  let 歪 = Math.floor(Math.random() * changzhu.length);歪 = changzhu[歪];十连.push(歪)}
                                             else{obj.累计角色池出up次数+=1;十连.push(obj.up)}                              
                                                      }
        }
                               else if(品质=='非金'){obj.up抽数+=1;if(obj.up抽数%10!==0&&obj.up抽数%10<8){rand=Math.random();if(rand>0.1){let 三星 = Math.floor(Math.random() * three.length);三星 = three[三星];十连.push(三星)}else if(rand<0.001){let 御三家 = Math.floor(Math.random() * ysj.length);御三家 = ysj[御三家];十连.push(御三家)}else{let 四星 = Math.floor(Math.random() * four.length);四星 = four[四星];十连.push(四星)}}
                                                                  else if(obj.up抽数%10>=8){rand=Math.random();if(rand<0.4){let 四星 = Math.floor(Math.random() * four.length);四星 = four[四星];十连.push(四星)}else if(rand<0.001){let 御三家 = Math.floor(Math.random() * ysj.length);御三家 = ysj[御三家];十连.push(御三家)}else{let 三星 = Math.floor(Math.random() * three.length);三星 = three[三星];十连.push(三星)}}
                                                                  else if(obj.up抽数%10==0){rand=Math.random();if(rand<0.001){let 御三家 = Math.floor(Math.random() * ysj.length);御三家 = ysj[御三家];十连.push(御三家)}else{let 四星 = Math.floor(Math.random() * four.length);四星 = four[四星];十连.push(四星)}}
                                                    }  
        }
        if(obj.up抽数==90)
        {
          obj.up抽数=0
          if(obj.保底!==0){obj.累计角色池出up次数+=1;obj.保底 = 0;十连.push(obj.up)}
     else if(obj.保底 ==0){rand =Math.random();
                 if(rand>0.5){obj.保底 += 1;
                      let 歪 = Math.floor(Math.random() * changzhu.length);歪 = changzhu[歪];十连.push(歪)}
                 else{obj.累计角色池出up次数+=1;十连.push(obj.up)}                              
                          }
        }



      }
      console.log(obj)
      let jsonStr = JSON.stringify(obj); // 将对象转为JSON字符串
      console.log(jsonStr)
      fs.writeFileSync(dirpath + "/" + filename, jsonStr);
      console.log('JSON文件已更新');
      console.log(十连) 
      for(let g = 0;g<十连.length;g++){结果 = 结果 + 十连[g]+'\n'}
      e.reply([
       `用户:`+e.user_id+`\n`+
       '十颗流星划过天际,恭喜您获得：\n'+
        结果
      ]
      )
      十连 = []
      结果 = ''
    }





  }





   
    }
    catch (err) {
      console.log(err);
    }  



  }





}

async cktj(e){
  filename = e.user_id+`.json`
  if (!fs.existsSync(dirpath + "/" + filename)) 
          {
          e.reply('请先完成up角色与up武器的设定,具体操作请发送 #抽卡插件帮助 查看。')
          
          }
  else
  {
    try { 

      let data = fs.readFileSync(dirpath + "/" + filename);
      let obj = JSON.parse(data); // 将JSON字符串转为对象
     
      if(obj.up == 0&&obj.up武器==0){e.reply('请先完成up角色与up武器的设定,具体操作请发送 #抽卡插件帮助 查看。')}
      
      else
      { 
        let is保底
        let 欧非
        let of = obj.累计角色抽卡次数/obj.累计角色池出up次数
        console.log(of)
        if(of<=50){欧非 = '超级无敌大欧皇'}
        
        else if (of>50&&of<=70){欧非 = '大欧皇'}
        else if (of>70&&of<=90){欧非 = '小欧皇'}
        else if (of>90&&of<=120){欧非 = '时欧时非'}
        else if (of>120&&of<=140){欧非 = '小非酋'}
        else if (of>140&&of<=160){欧非 = '大非酋'}
        else if (of>160&&of<=180){欧非 = '终极无敌大非酋'}
        else if (obj.累计角色池出up次数 == 0&&obj.保底!==0){欧非 = '首金就歪'}
        else {欧非 = '欧非未知'}
        if(obj. 保底!==0){is保底 = '是'}else{is保底 = '否'}
        e.reply(`用户 :`+e.user_id+`\n`+
`当前up角色已抽:`+obj.up抽数+'\n'+
`当前up武器已抽:`+obj.up武器抽数+'\n'+
`角色池是否大保底：`+is保底+'\n'+
`武器池定轨命定数：`+obj.up武器保底+'\n'+
`角色池欧非成分：`+欧非)
        
        

      }
      }
      catch (err) {
        console.log(err);
      }  



  }


}
async ckhelp(e){
e.reply('口令：\n#设定我的up角色+五星up角色：自定义角色卡池\n#设定我的up武器+五星武器：自定义武器池\n#一发（十发）角色池（武器池：抽卡\n#自定义抽卡统计：查询你的成分（bushi）\n注意：使用的角色名与武器名皆为游戏中完整名字')

}
}
