import { dependencies } from "../YTdependence/dependencies.js";
import { fs_god } from "../YTdependence/fs_god_makes.js";
const  { axios, common, fetch } = dependencies

export class example extends plugin {
  constructor () {
    super({
      name: '阴天[useless]',
      dsc: '',
      event: 'message',
      priority: -1000,
      rule: [
        {
          reg: "^#(mt|jj|ys|cp|dm)(.*)",
          fnc: 'chat' 
        }
      ]
    })
  }

async chat(e) {
    let url, title
    const numRegex = /[\d]+/g; 
    const extractedNums = e.msg.match(numRegex);
    const dataMap = {
  "jj": { url: "https://api.lolimi.cn/API/meinv/api.php?type=text", title: '小姐姐' },
  "mt": { url: "https://api.lolimi.cn/API/meizi/api.php", title: '美腿来罗' },
  "ys": { url: "https://api.lolimi.cn/API/yuan/?type=text", title: '原神启动' },
  "cp": { url: "https://imgapi.cn/cos2.php?return=json", title: 'cosplay' },
  "dm": { url: "https://imgapi.cn/api.php?fl=dongman&gs=json", title: '动漫图' }
}
  for (let key in dataMap) {
   if (e.msg.includes(key)){
    url = dataMap[key].url
    title = dataMap[key].title
   }
  }
  if (!extractedNums || extractedNums.length === 0) { 
   e.reply("数字不符合要求");
  }
    try {
     if (extractedNums[0] <= 0 || extractedNums[0] >= 50) {
        e.reply("数字需要大于0且小于50");
        return false   
    }
      const results = await fetchData(url, Number(extractedNums[0]));
      const forwardMsg = common.makeForwardMsg(e, results, title);
      e.reply(forwardMsg);
    } catch (error) {
      console.error(`出现错误：${error}`);
    }
  }
}

async function fetchData(url, times) {
    const fetchUrl = async (url) => {
        const response = await axios.get(url);
        let imageUrl;
        if (response.status !== 200) throw new Error("请求失败！");
        switch (url) {
            case "https://api.lolimi.cn/API/meizi/api.php":
                imageUrl = segment.image(response.data.text);
                break;
            case "https://imgapi.cn/cos2.php?return=json": 
            case "https://imgapi.cn/api.php?fl=dongman&gs=json":
                imageUrl = segment.image(response.data.imgurl);
                break;
            default:
                imageUrl = segment.image(response.data);
        }
        return imageUrl;
    }
   const promises = Array.from({ length: times }, () => fetchUrl(url));
    return await Promise.all(promises);
}