//如何获取密钥?
//登录网址:https://login.bce.baidu.com
//申请通用文字识别的服务,标准和高精可以(里面有个新人专属，直接领就行),每月全部加起来可白嫖3500。
//申请完之后创建应用，勾选列表里面请勾选通用文字识别，其他不勾，然后就能从应用列表看到你的sk和ak
//方法:图识文＋图片
let reply;
let varUrl = ""
import request from "../node_modules/request/index.js"

let AK = "URmqLVxKCG5hm27btAgdTpeu"//你的Api-Key
let SK = "54405zOTdDWsnkvyupTCDBpHXogGu19p"//你的secret-key
export class example extends plugin {
  constructor() {
    super({
      name: '阴天[图识文]',
      dsc: '阴天[图识文]',
      event: 'message',
      priority: 50,
      rule: [
        {
          reg: '^#?图识文$',
          fnc: 'ss'
        }
      ]
    })
  }
  async ss(e) {
    if (e.message.find(val => val.type === 'image')) {
      varUrl = e.img[0]
    }
    if (!e.message.find(val => val.type === 'image')) {
      e.reply('请带上图片')
      return
    }

    var options = {
      'method': 'POST',
      'url': 'https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=' + await gettk(),
      'headers': {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      form: {
        'url': varUrl
      }
    };
    request(options, function (error, response) {
      if (error) return;
      console.log(response.body);
      let img = response.body.match(/"words":"(.*?)"/g)
      img = `${img}`
      let words = img.replace(/"words":/g, "\n")
      let num = response.body.match(/"words_result_num":(.*?),/g)
      num = `${num}`
      let nums = num.replace(/"words_result_num":/g, "找到结果").replace(/,/g, "个")
      let msg = ["识别出以下结果:", words, "\n", "\n", nums]
      if (words == "null") {
        e.reply('无返回结果,可能免费额度已用完,或者图片存在问题')
        return
      }
      e.reply(msg)
    });
    function gettk() {
      let options = {
        'method': 'POST',
        'url': 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=' + AK + '&client_secret=' + SK,
      }
      return new Promise((resolve, reject) => {
        request(options, (error, response) => {
          if (error) {
            console.log("失败了")
          }
          else {
            resolve(JSON.parse(response.body).access_token)
          }
        })
      })
    }
  }
}