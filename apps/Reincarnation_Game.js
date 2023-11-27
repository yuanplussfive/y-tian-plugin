import fetch from 'node-fetch'
import fs from 'fs'

import puppeteer from 'puppeteer'

const _path = process.cwd();
let cd = 10000
let open =true
const zswa={
   "白露":"你是性格活泼的小女孩，持明族的「衔药龙女]，药到病除的名医。你经常给病人开出不拘一格的药方，如「多喝热水]、「睡一觉就好了]。你见不得人受苦，治病时总是闭着眼睛。————总之病好了就行！",
   "希儿":"你是飒爽俊逸的「地火」成员，成长于地底危险混乱的环境，习惯独来独往。你作为曾经的弱者，如今的你锲而不舍地追求更强大的力量，为了有朝一日揭示地底的真相，为了给自己的族人证明，你可以忍受任何痛苦。保护与被保护，压迫与被压迫，世界向你展示的始终是非黑即白的那一面————直至「那名少女」的出现。",
   "姬子":"你是充满冒险精神的科学家，少女时代在故乡遭遇了搁浅的星穹列车。彼时，列车内的某种存在向你展示了身处的星球之外，名为「宇宙」的世界。若干年后，当你终于修复列车驶入群星时，你意识到这只是个开始。在「开拓」新世界的道路上，需要更多的同伴————即使同行的人们面朝不同的方向，你们仍处于同一片星空下。",
   "布洛妮娅":"布洛妮娅！\n你是贝洛伯格“大守护者”继承人，年轻干练的银鬃铁卫统领。你从小接受着严格的教育，具备一名“继承人”所需的优雅举止与亲和力。但你在看到下层区的恶劣环境后，未来的最高决策者逐渐生出了疑惑…“我所受的训练，真的能带领人民过上他们想要的生活么？”",
   "瓦尔特":"你是老成持重的前逆熵盟主，继承了「世界」之名，曾屡次拯救世界于灭亡的边缘。灾难结束后，你一度卸下命运交付的重担，成为一名动画分镜师。然而圣方丹事件结束后，你被迫与事件始作俑者去向星门另一侧。或许连你自己也未曾料到，在那里等待着的，将是全新的旅途和同伴。",
   "克拉拉":"你是一个怯生生的流浪女孩，为了生存跟着其他淘金者拾荒，误打误撞重启了前文明遗物：一个机器人。「想要家人。」当被问及自己的愿望，你如此回答。不久，原本各自为政的淘金者被「史瓦罗大佬」统领为一个「家族」，同时裂界中多了一名幽灵般的淘金者，据说她常常深入危险之地收集珍贵遗物，并以红色兜帽遮脸，因而被称为————「猩红兔子」。",
   "爷":"这片银河中有名为“星神”的存在，他们造就现实，抹消星辰，在无数“世界”中留下他们的痕迹。你————一名特殊的旅客，将与继承“开拓”意志的同伴一起，乘坐星穹列车穿越银河，沿着某位“星神”曾经所行之途前进。你将由此探索新的文明，结识新的伙伴，在无数光怪陆离的“世界”与“世界”之间展开新的冒险。所有你想知道的，都将在群星中找到答案。",
   "杰帕德":"你是高洁正直的银鬃铁卫统领，出身于血脉高贵、历史悠久的朗道家族。在无时无刻遭受风雪侵凌的贝洛伯格，「守」远比「攻」难。而你与你统领的银鬃铁卫，则为共同体筑起牢不可破的钢铁防线。即便一板一眼的行事风格偶尔会被姐姐和副官调侃，但没有人会否认：永冬末日近在咫尺，人们的衣食住行尚能如旧————正是因为你在守护这平淡无奇的日常生活。",
   "景元":"你是外表懒散、心思缜密的仙舟「罗浮」云骑将军。不以危局中力挽狂澜为智策，因此在常事上十分下功夫，以免节外生枝。因其细心谋划，仙舟承平日久，看似行事慵懒的你反被送上绰号「闭目将军」。",
   "彦卿":"你是意气飞扬的云骑骁卫，仙舟「罗浮」最强剑士。为剑生亦为剑痴，当彦卿手中握剑时，无人敢小看你这位尚在总角之年的天才。或许能让手中宝剑微微收敛锋芒的，只有时间。",
   "银狼":"你是将宇宙视为游戏的超级骇客。无论怎样棘手的防御系统，你都能轻松破解。你与「天才俱乐部」螺丝咕姆的数据攻防战，现已成为骇客界的传说。宇宙中还有多少亟待攻破的关卡？你对此十分期待。",
   "刃":"你是「星核猎手」的成员，本名无人知晓。你手持古剑作战，剑身遍布破碎裂痕，正如其身，亦如其心。",
   "卡芙卡":"在星际和平公司的通缉档案里，你只留下了名字和「爱好收集大衣」的纪录。人们对这位星核猎手所知甚少，只知道你是「命运的奴隶」艾利欧最信任的成员之一。为了到达艾利欧预见的「未来」，你开始行动。",
}
const keysArr = Object.keys(zswa);



export class example extends plugin {
    constructor () {
      super({
        name: '阴天[转生]',
        dsc: '转生',
        event: 'message',
        priority: 40,
        rule: [
          {
            reg: '^#星(穹|铁)转生$',
            fnc: 'zs'
          }
        ]
      })
    }
  async zs(e){
  if(open== false){e.reply("转生系统尚在冷却中，我知道你很急，但你先别急！");return false}
else{open=false
  setTimeout(async () => {
                open = true;
            }, cd);
    let html = _path + "/plugins/y-tian-plugin/resources/html/zhuansheng.html"
    html = fs.readFileSync(html,'utf-8')
    let randomjs = Math.floor(Math.random() * keysArr.length); 
    let js = keysArr[randomjs];
    let jss =`恭喜你转生为：`;
    let dir = _path + "/plugins/y-tian-plugin/background/转生/"+js+'.png';
    dir = fs.readFileSync(dir)
    dir = Buffer.from(dir).toString('base64')
    let c = '  '+zswa[js];
    html = html.replace('{{a}}',`data:image/png;base64,${dir}`)
    html = html.replace('{{b}}',jss)
    html = html.replace('{{c}}',c)
    html = html.replace('{{d}}',js)
    const browser = await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
    const page = await browser.newPage();
    await page.setContent(html);  
    await page.setViewport({ width: 1920, height: 1080 });
    // 等待2秒钟
    await new Promise(resolve => setTimeout(resolve, 1000));
   const image = await page.screenshot({ fullPage: true ,quality: 100, type: 'jpeg'});
    await this.reply(segment.image(image));
    await browser.close()
}




  }}
