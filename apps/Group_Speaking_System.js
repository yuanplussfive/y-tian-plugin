
import { dependencies } from "../YTdependence/dependencies.js";
const { puppeteer, _path, fetch, fs } = dependencies
let ms

export class example extends plugin {
  constructor() {
    super({
      name: '阴天[统计发言]',
      dsc: '',
      event: 'message',
      priority: 0,
      rule: [
        {
          reg: "#群发言(.*)",
          fnc: 'spec'
       }
     ]
   })
 }

async spec(e){
    console.log('Processing request...');
    const start = Date.now();
    const group_id = e.group_id;
    const sr = +e.msg.replace(/#?统计/g, "").trim();
    const { seq: upperSeq } = await e.group.getChatHistory(0, 1)[0];
    const ranklistData = { 
        [group_id]: { lastseq: 0, acount: 0, list: {} } 
    };
    await e.reply("正在为您分析中，请稍等~");
    let arr = [], p = upperSeq, lowerSeq = upperSeq - sr;
    while (p > lowerSeq) {
        const chats = await Promise.all([...Array(p - lowerSeq).keys()].map(i => e.group.getChatHistory(lowerSeq + i, 1)));
        chats.flatMap(chat => chat.filter(c => !!c).map(char => {
            arr.push(char.sender.user_id);
            return {
                name: char.sender.title, 
                card: char.sender.card, 
                uid: char.sender.user_id, 
                content: char.raw_message
            };
        }));
        p -= sr;
    }
    const timeTaken = (Date.now() - start) / 1000;
    console.log(`Processing complete in ${timeTaken}s`);
    const frequencyMap = arr.reduce((acc, uid) => {
        acc[uid] ? acc[uid]++ : acc[uid] = 1;
        return acc;
    }, {});
    const transformedData = Object.entries(frequencyMap).map(([k, v]) => ({
        'qq': k, 'cs': v, 'url': `http://q.qlogo.cn/headimg_dl?dst_uin=${k}&spec=640&img_type=jpg`
    })).sort((a, b) => b.cs - a.cs);
    const htmlString = fs.readFileSync(`${_path}/plugins/y-tian-plugin/resources/html/ph.html`, 'utf-8');
    const processedHtml = htmlString.replace('__SHUJU__', JSON.stringify(transformedData));
    fs.writeFileSync(`${_path}/plugins/y-tian-plugin/resources/html/ph2.html`, processedHtml, 'utf-8');
    e.reply(await puppeteer.screenshot("66", {
        tplFile: `${_path}/plugins/y-tian-plugin/resources/html/ph2.html`,
        imgtype:'png',
        src: `${_path}/plugins/y-tian-plugin/resources/ttf/jty.OTF`
    }));
  }
}