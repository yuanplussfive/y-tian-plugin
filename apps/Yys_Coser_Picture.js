import { dependencies } from "../YTdependence/dependencies.js";
const { fs, fetch } = dependencies
let magic;

export class example extends plugin {
  constructor () {
    super({
      name: '阴天[阴阳师cos]',
      dsc: '简单开发示例',
      event: 'message',
      priority: 2000,
      rule: [
        {
          reg: '^#yys(cos|同人)$',
          fnc: 'yyscos'
        },
        {
          reg: '^#yys(sp|视频)$',
          fnc: 'yyssp'
        }
      ]
    })
  }

async yyssp(e) {
  function getRandomNumber() {
    return Math.floor(Math.random() * 320) + 1;
  }
  const time = new Date().getTime();
  const url = `https://g37community.tongren.163.com/article/apps/web/game/g37/?sort=-new&span=1&tags=视频&start=${getRandomNumber()}&random=${time}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'user-agent': 'Your User Agent String'
      }
    });
    const jsonData = await response.json();
    const { title, author: { nickname, avatar }, body } = jsonData.data.articles[0];
    const videoUrl = body[0].fp_data.url;
    //console.log(videoUrl);
    const authorInfo = `作者: ${nickname}\n作者头像:\n${segment.image(avatar)}`;
    await e.reply(authorInfo);
    const fileResponse = await fetch(videoUrl);
    const buffer = await fileResponse.buffer();
    const filePath = "./resources/yyssp.avi";
    await fs.writeFile(filePath, buffer);
    const stats = await fs.stat(filePath);
    const fileSizeInMB = Math.round(stats.size / 1048576);
    if (fileSizeInMB >= 100) {
      await e.reply(`解析文件大小为 ${fileSizeInMB} MB，太大了发不出来，诶嘿,给你无水印地址:${videoUrl}`);
    } else {
      await e.reply([segment.video(filePath)]);
    }
  } catch (err) {
    await e.reply('请求失败了!');
  }
}

async yyscos(e) {
  const tagMappings = {
    "#yyscos": "Cosplay",
    "#yys同人": "同人绘"
  };
  let magic = null;
  for (const tag in tagMappings) {
    if (event.msg.includes(tag)) {
      magic = tagMappings[tag];
      break;
    }
  }
  if (!magic) {
    e.reply("抓取图片失败了")
    return;
  }
  const generateRandomNumber = () => Math.floor(Math.random() * 2000) + 1;
  try {
    const time = new Date().getTime();
    const response = await fetch(`https://g37community.tongren.163.com/article/apps/web/game/g37/?sort=-new&span=1&tags=${magic}&start=${generateRandomNumber()}&random=${time}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    const data = await response.json();
    if (!data || !data.data || !data.data.articles || data.data.articles.length === 0) {
      return;
    }
    const article = data.data.articles[0];
    const title = article.title;
    const articleLength = article.body.length;
    const randomIndex = Math.floor(Math.random() * articleLength);
    const imageUrl = article.body[randomIndex].fp_data.url;
    const updateTime = article.update_time;
    const authorNickname = article.author_nickname;
    let message = [
      `标题: ${title}\n`,
      `分类: [${authorNickname}]\n`,
      `更新时间: ${updateTime}\n`,
      segment.image(imageUrl)
    ];
    e.reply(message);
  } catch (error) {
    console.error(error);
  }
 }
}