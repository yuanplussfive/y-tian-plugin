import fetch from 'node-fetch'
import fs from 'fs'
import puppeteer from 'puppeteer'
const _path = process.cwd();
let tu = 
[{name:"言灵",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E8%A8%80%E7%81%B5"},
{name:"天逆每",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%A4%A9%E9%80%86%E6%AF%8F"},
{name:"修罗鬼童丸",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E4%BF%AE%E7%BD%97%E9%AC%BC%E7%AB%A5%E4%B8%B8"},
{name:"流光追月神",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E6%B5%81%E5%85%89%E8%BF%BD%E6%9C%88%E7%A5%9E"},
{name:"月读",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E6%9C%88%E8%AF%BB"},
{name:"禅心云外境",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E7%A6%85%E5%BF%83%E4%BA%91%E5%A4%96%E9%95%9C"},
{name:"季",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%AD%A3"},
{name:"寻香行",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%AF%BB%E9%A6%99%E8%A1%8C"},
{name:"神启荒",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E7%A5%9E%E5%90%AF%E8%8D%92"},
{name:"须佐之男",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%A1%BB%E4%BD%90%E4%B9%8B%E7%94%B7"},
{name:"心狩鬼女红叶",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%BF%83%E7%8B%A9%E9%AC%BC%E5%A5%B3%E7%BA%A2%E5%8F%B6"},
{name:"大夜摩天阎魔",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%A4%A7%E5%A4%9C%E6%91%A9%E5%A4%A9%E9%98%8E%E9%AD%94"},
{name:"粉婆婆",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E7%B2%89%E5%A9%86%E5%A9%86"},
{name:"神堕八岐大蛇",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E7%A5%9E%E5%A0%95%E5%85%AB%E5%B2%90%E5%A4%A7%E8%9B%87"},
{name:"灵海蝶",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E7%81%B5%E6%B5%B7%E8%9D%B6"},
{name:"影鳄",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%BD%B1%E9%B3%84"},
{name:"不见岳",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E4%B8%8D%E8%A7%81%E5%B2%B3"},
{name:"迦楼罗",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E8%BF%A6%E6%A5%BC%E7%BD%97"},
{name:"梦寻山兔",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E6%A2%A6%E5%AF%BB%E5%B1%B1%E5%85%94"},
{name:"铃彦姬",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%93%83%E5%BD%A6%E5%A7%AC"},
{name:"夜刀神",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%A4%9C%E5%88%80%E7%A5%9E"},
{name:"因幡辉夜姬",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%9B%A0%E5%B9%A1%E8%BE%89%E5%A4%9C%E5%A7%AC"},
{name:"饭笥",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%A5%AD%E7%AC%A5"},
{name:"食灵",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%A3%9F%E7%81%B5"},
{name:"饴细工",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%A5%B4%E7%BB%86%E5%B7%A5"},
{name:"绘世花鸟卷",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E7%BB%98%E4%B8%96%E8%8A%B1%E9%B8%9F%E5%8D%B7"},
{name:"空相面灵气",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E7%A9%BA%E7%9B%B8%E9%9D%A2%E7%81%B5%E6%B0%94"},
{name:"入内雀",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%85%A5%E5%86%85%E9%9B%80"},
{name:"阿修罗",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%98%BF%E4%BF%AE%E7%BD%97"},
{name:"帝释天",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%B8%9D%E9%87%8A%E5%A4%A9"},
{name:"蝉冰雪女",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E8%9D%89%E5%86%B0%E9%9B%AA%E5%A5%B3"},
{name:"垢尝",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%9E%A2%E5%B0%9D"},
{name:"灶门祢豆子",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E7%81%B6%E9%97%A8%E7%A5%A2%E8%B1%86%E5%AD%90"},
{name:"灶门炭治郎",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E7%81%B6%E9%97%A8%E7%82%AD%E6%B2%BB%E9%83%8E"},
{name:"夜溟彼岸花",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%A4%9C%E6%BA%9F%E5%BD%BC%E5%B2%B8%E8%8A%B1"},
{name:"初翎山风",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%88%9D%E7%BF%8E%E5%B1%B1%E9%A3%8E"},
{name:"千姬",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%8D%83%E5%A7%AC"},
{name:"麓铭大岳丸",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%BA%93%E9%93%AD%E5%A4%A7%E5%B2%B3%E4%B8%B8"},
{name:"待宵姑获鸟",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%BE%85%E5%AE%B5%E5%A7%91%E8%8E%B7%E9%B8%9F"},
{name:"紧那罗",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E7%B4%A7%E9%82%A3%E7%BD%97"},
{name:"缚骨清姬",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E7%BC%9A%E9%AA%A8%E6%B8%85%E5%A7%AC"},
{name:"蝎女",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E8%9D%8E%E5%A5%B3"},
{name:"古笼火",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%8F%A4%E7%AC%BC%E7%81%AB"},
{name:"觉",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E8%A7%89"},
{name:"铃鹿御前",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%93%83%E9%B9%BF%E5%BE%A1%E5%89%8D"},
{name:"风狸",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%A3%8E%E7%8B%B8"},
{name:"浮世青行灯",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E6%B5%AE%E4%B8%96%E9%9D%92%E8%A1%8C%E7%81%AF"},
{name:"缘结神",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E7%BC%98%E7%BB%93%E7%A5%9E"},
{name:"聆海金鱼姬",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E8%81%86%E6%B5%B7%E9%87%91%E9%B1%BC%E5%A7%AC"},
{name:"鬼童丸",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%AC%BC%E7%AB%A5%E4%B8%B8"},
{name:"云外镜",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E4%BA%91%E5%A4%96%E9%95%9C"},
{name:"天剑韧心鬼切",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%A4%A9%E5%89%91%E9%9F%A7%E5%BF%83%E9%AC%BC%E5%88%87"},
{name:"鬼王酒吞童子",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%AC%BC%E7%8E%8B%E9%85%92%E5%90%9E%E7%AB%A5%E5%AD%90"},
{name:"星熊童子",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E6%98%9F%E7%86%8A%E7%AB%A5%E5%AD%90"},
{name:"纸舞",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E7%BA%B8%E8%88%9E"},
{name:"泷夜叉姬",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E6%B3%B7%E5%A4%9C%E5%8F%89%E5%A7%AC"},
{name:"烬天玉藻前",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E7%83%AC%E5%A4%A9%E7%8E%89%E8%97%BB%E5%89%8D"},
{name:"黑崎一护",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%BB%91%E5%B4%8E%E4%B8%80%E6%8A%A4"},
{name:"朽木露琪亚",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E6%9C%BD%E6%9C%A8%E9%9C%B2%E7%90%AA%E4%BA%9A"},
{name:"蟹姬",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E8%9F%B9%E5%A7%AC"},
{name:"骁浪荒川之主",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%AA%81%E6%B5%AA%E8%8D%92%E5%B7%9D%E4%B9%8B%E4%B8%BB"},
{name:"大岳丸",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%A4%A7%E5%B2%B3%E4%B8%B8"},
{name:"久次良",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E4%B9%85%E6%AC%A1%E8%89%AF"},
{name:"天井下",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%A4%A9%E4%BA%95%E4%B8%8B"},
{name:"御怨般若",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%BE%A1%E6%80%A8%E8%88%AC%E8%8B%A5"},
{name:"不知火",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E4%B8%8D%E7%9F%A5%E7%81%AB"},
{name:"海忍",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E6%B5%B7%E5%BF%8D"},
{name:"赤影妖刀姬",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E8%B5%A4%E5%BD%B1%E5%A6%96%E5%88%80%E5%A7%AC"},
{name:"化鲸",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%8C%96%E9%B2%B8"},
{name:"苍风一目连",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E8%8B%8D%E9%A3%8E%E4%B8%80%E7%9B%AE%E8%BF%9E"},
{name:"八岐大蛇",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%85%AB%E5%B2%90%E5%A4%A7%E8%9B%87"},
{name:"入殓师",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%85%A5%E6%AE%93%E5%B8%88"},
{name:"一目反绵",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E4%B8%80%E5%8F%8D%E6%9C%A8%E7%BB%B5"},
{name:"炼狱茨木童子",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E7%82%BC%E7%8B%B1%E8%8C%A8%E6%9C%A8%E7%AB%A5%E5%AD%90"},
{name:"桔梗",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E6%A1%94%E6%A2%97"},
{name:"於菊虫",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E6%96%BC%E8%8F%8A%E8%99%AB"},
{name:"人面树",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E4%BA%BA%E9%9D%A2%E6%A0%91"},
{name:"白藏主",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E7%99%BD%E8%97%8F%E4%B8%BB"},
{name:"少羽大天狗",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%B0%91%E7%BE%BD%E5%A4%A7%E5%A4%A9%E7%8B%97"},
{name:"鬼切",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%AC%BC%E5%88%87"},
{name:"杀生丸",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E6%9D%80%E7%94%9F%E4%B8%B8"},
{name:"犬夜叉",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E7%8A%AC%E5%A4%9C%E5%8F%89"},
{name:"面灵气",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%9D%A2%E7%81%B5%E6%B0%94"},
{name:"猫掌柜",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E7%8C%AB%E6%8E%8C%E6%9F%9C"},
{name:"鬼灯",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%AC%BC%E7%81%AF"},
{name:"蜜桃芥子",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E8%9C%9C%E6%A1%83%26%E8%8A%A5%E5%AD%90"},
{name:"阿香",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%98%BF%E9%A6%99"},
{name:"卖药郎",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%8D%96%E8%8D%AF%E9%83%8E"},
{name:"山风",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%B1%B1%E9%A3%8E"},
{name:"薰",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E8%96%B0"},
{name:"虫师",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E8%99%AB%E5%B8%88"},
{name:"小袖之手",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%B0%8F%E8%A2%96%E4%B9%8B%E6%89%8B"},
{name:"弈",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%BC%88"},
{name:"御馔津",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%BE%A1%E9%A6%94%E6%B4%A5"},
{name:"日和坊",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E6%97%A5%E5%92%8C%E5%9D%8A"},
{name:"奴良陆生",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%A5%B4%E8%89%AF%E9%99%86%E7%94%9F"},
{name:"追月神",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E8%BF%BD%E6%9C%88%E7%A5%9E"},
{name:"数珠",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E6%95%B0%E7%8F%A0"},
{name:"玉藻前",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E7%8E%89%E8%97%BB%E5%89%8D"},
{name:"雪童子",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%9B%AA%E7%AB%A5%E5%AD%90"},
{name:"百目鬼",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E7%99%BE%E7%9B%AE%E9%AC%BC"},
{name:"兔丸",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%85%94%E4%B8%B8"},
{name:"书翁",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E4%B9%A6%E7%BF%81"},
{name:"小松丸",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%B0%8F%E6%9D%BE%E4%B8%B8"},
{name:"彼岸花",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%BD%BC%E5%B2%B8%E8%8A%B1"},
{name:"匣中少女",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%8C%A3%E4%B8%AD%E5%B0%91%E5%A5%B3"},
{name:"鸠",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%B8%A9"},
{name:"以津真天",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E4%BB%A5%E6%B4%A5%E7%9C%9F%E5%A4%A9"},
{name:"金鱼姬",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%87%91%E9%B1%BC%E5%A7%AC"},
{name:"万年竹",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E4%B8%87%E5%B9%B4%E7%AB%B9"},
{name:"荒",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E8%8D%92"},
{name:"辉夜姬",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E8%BE%89%E5%A4%9C%E5%A7%AC"},
{name:"大天狗",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%A4%A7%E5%A4%A9%E7%8B%97"},
{name:"荒川之主",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E8%8D%92%E5%B7%9D%E4%B9%8B%E4%B8%BB"},
{name:"两面佛",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E4%B8%A4%E9%9D%A2%E4%BD%9B"},
{name:"茨木童子",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E8%8C%A8%E6%9C%A8%E7%AB%A5%E5%AD%90"},
{name:"妖刀姬",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%A6%96%E5%88%80%E5%A7%AC"},
{name:"酒吞童子",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%85%92%E5%90%9E%E7%AB%A5%E5%AD%90"},
{name:"阎魔",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%98%8E%E9%AD%94"},
{name:"小鹿男",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%B0%8F%E9%B9%BF%E7%94%B7"},
{name:"青行灯",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%9D%92%E8%A1%8C%E7%81%AF"},
{name:"花鸟卷",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E8%8A%B1%E9%B8%9F%E5%8D%B7"},
{name:"一目连",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E4%B8%80%E7%9B%AE%E8%BF%9E"},
{name:"烟烟罗",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E7%83%9F%E7%83%9F%E7%BD%97"},
{name:"桃花妖",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E6%A1%83%E8%8A%B1%E5%A6%96"},
{name:"鬼使白",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%AC%BC%E4%BD%BF%E7%99%BD"},
{name:"孟婆",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%AD%9F%E5%A9%86"},
{name:"骨女",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%AA%A8%E5%A5%B3"},
{name:"跳跳哥哥",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E8%B7%B3%E8%B7%B3%E5%93%A5%E5%93%A5"},
{name:"海坊主",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E6%B5%B7%E5%9D%8A%E4%B8%BB"},
{name:"雪女",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%9B%AA%E5%A5%B3"},
{name:"鬼使黑",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%AC%BC%E4%BD%BF%E9%BB%91"},
{name:"犬神",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E7%8A%AC%E7%A5%9E"},
{name:"鬼女红叶",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%AC%BC%E5%A5%B3%E7%BA%A2%E5%8F%B6"},
{name:"傀儡师",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%82%80%E5%84%A1%E5%B8%88"},
{name:"判官",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%88%A4%E5%AE%98"},
{name:"凤凰火",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%87%A4%E5%87%B0%E7%81%AB"},
{name:"妖狐",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%A6%96%E7%8B%90"},
{name:"食梦貘",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%A3%9F%E6%A2%A6%E8%B2%98"},
{name:"镰鼬",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%95%B0%E9%BC%AC"},
{name:"二口女",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E4%BA%8C%E5%8F%A3%E5%A5%B3"},
{name:"清姬",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E6%B8%85%E5%A7%AC"},
{name:"妖琴师",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%A6%96%E7%90%B4%E5%B8%88"},
{name:"樱花妖",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E6%A8%B1%E8%8A%B1%E5%A6%96"},
{name:"桃花妖",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E6%A1%83%E8%8A%B1%E5%A6%96"},
{name:"姑获鸟",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%A7%91%E8%8E%B7%E9%B8%9F"},
{name:"白狼",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E7%99%BD%E7%8B%BC"},
{name:"惠比寿",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E6%83%A0%E6%AF%94%E5%AF%BF"},
{name:"黑童子",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%BB%91%E7%AB%A5%E5%AD%90"},
{name:"白童子",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E7%99%BD%E7%AB%A5%E5%AD%90"},
{name:"夜叉",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%A4%9C%E5%8F%89"},
{name:"青坊主",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%9D%92%E5%9D%8A%E4%B8%BB"},
{name:"络新妇",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E7%BB%9C%E6%96%B0%E5%A6%87"},
{name:"般若",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E8%88%AC%E8%8B%A5"},
{name:"三尾狐",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E4%B8%89%E5%B0%BE%E7%8B%90"},
{name:"狸鱼精",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%B2%A4%E9%B1%BC%E7%B2%BE"},
{name:"狸猫",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E7%8B%B8%E7%8C%AB"},
{name:"蝴蝶精",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E8%9D%B4%E8%9D%B6%E7%B2%BE"},
{name:"首无",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%A6%96%E6%97%A0"},
{name:"青蛙瓷器",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%9D%92%E8%9B%99%E7%93%B7%E5%99%A8"},
{name:"山童",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%B1%B1%E7%AB%A5"},
{name:"丑时之女",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E4%B8%91%E6%97%B6%E4%B9%8B%E5%A5%B3"},
{name:"铁鼠",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%93%81%E9%BC%A0"},
{name:"管狐",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E7%AE%A1%E7%8B%90"},
{name:"萤草",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E8%90%A4%E8%8D%89"},
{name:"椒图",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E6%A4%92%E5%9B%BE"},
{name:"山兔",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%B1%B1%E5%85%94"},
{name:"雨女",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%9B%A8%E5%A5%B3"},
{name:"跳跳妹妹",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E8%B7%B3%E8%B7%B3%E5%A6%B9%E5%A6%B9"},
{name:"武士之灵",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E6%AD%A6%E5%A3%AB%E4%B9%8B%E7%81%B5"},
{name:"跳跳弟弟",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E8%B7%B3%E8%B7%B3%E5%BC%9F%E5%BC%9F"},
{name:"兵俑",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%85%B5%E4%BF%91"},
{name:"独眼小僧",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E7%8B%AC%E7%9C%BC%E5%B0%8F%E5%83%A7"},
{name:"河童",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E6%B2%B3%E7%AB%A5"},
{name:"童女",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E7%AB%A5%E5%A5%B3"},
{name:"巫蛊师",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%B7%AB%E8%9B%8A%E5%B8%88"},
{name:"食发鬼",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%A3%9F%E5%8F%91%E9%AC%BC"},
{name:"饿鬼",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%A5%BF%E9%AC%BC"},
{name:"鸦天狗",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E9%B8%A6%E5%A4%A9%E7%8B%97"},
{name:"座敷童子",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E5%BA%A7%E6%95%B7%E7%AB%A5%E5%AD%90"},
{name:"九命猫",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E4%B9%9D%E5%91%BD%E7%8C%AB"},
{name:"童男",url:"https://act.ds.163.com/41bab2a03a354547/item-detail?id=%E7%AB%A5%E7%94%B7"}
]
export class example extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: '阴天[yys攻略]',
      /** 功能描述 */
      dsc: '简单开发示例',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 5800,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '/yys(.*)',
          /** 执行方法 */
          fnc: 'swdt'
        }
      ]
    })
  }

async swdt(e){
let m = e.msg.replace("/yys","").trim()
let now = tu.findIndex(item => item.name == m) 
if(now == -1){
e.reply("未查找到当前角色的图鉴,可能还未录入")
return false
}
if (!fs.existsSync(`${_path}/plugins/y-tian-plugin/background/image/yys/${m}.jpg`)){
let msg = tu[now].url
const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto(`${msg}`);
await page.waitForTimeout(8000)
    await page.setViewport({
        width: 700,
        height: 800
    });
    await page.screenshot({
        path: `${_path}/plugins/y-tian-plugin/background/image/yys/${m}.jpg`,
        fullPage: true,
 });    
await e.reply([segment.image(`${_path}/plugins/y-tian-plugin/background/image/yys/${m}.jpg`)])
await browser.close();
}else if (fs.existsSync(`${_path}/plugins/y-tian-plugin/background/image/yys/${m}.jpg`)){
e.reply([segment.image(`${_path}/plugins/y-tian-plugin/background/image/yys/${m}.jpg`)])
}
}
}





















