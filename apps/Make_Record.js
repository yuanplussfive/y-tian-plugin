import plugin from '../../../lib/plugins/plugin.js'
import _ from 'lodash'
import schedule from "node-schedule";
let kl = ""
import fs from 'fs';
let msg = ""
let ying = "zhilingfa"
import fetch from "node-fetch";
const _path = process.cwd();
let musical = 0

export class example extends plugin {
  constructor() {
    super({
      name: '阴天[语音合成]',
      dsc: '语音合成',
      event: 'message',
      priority: 1,
      rule: [
        {
          reg: "^#合成(.*)$",
          fnc: 'm'

        }, {
          reg: "^#切换音色(.*)$",
          fnc: 'qh'
        }, {
          reg: "^#?音色列表$",
          fnc: 'list'

        },
      ]
    })
  }

  async qh(e) {
    let p = e.msg.replace('#切换音色', '').trim()
    console.log(p)
    if (parseFloat(p).toString() == "NaN") {
      e.reply("无效的序号")
      return
    }
    if (p == 1) {
      musical = 0
      ying = "zhilingfa"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 2) {
      musical = 0
      ying = "gqlanf"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 3) {
      musical = 0
      ying = "lucyfa"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 4) {
      musical = 0
      ying = "lzyinfa"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 5) {
      musical = 0
      ying = "hyanifa"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 6) {
      musical = 0
      ying = "xjingf"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 7) {
      musical = 0
      ying = "kaolaf"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 8) {
      musical = 0
      ying = "smjief"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 9) {
      musical = 0
      ying = "feyinf"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 10) {
      musical = 0
      ying = "lili1f_shangwu"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 11) {
      musical = 0
      ying = "xizhef"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 12) {
      musical = 0
      ying = "cyangf"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 13) {
      musical = 0
      ying = "lili1f_yubo"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 14) {
      musical = 0
      ying = "aningf"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 15) {
      musical = 0
      ying = "jjingf"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 16) {
      musical = 0
      ying = "lanyuf"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 17) {
      musical = 0
      ying = "lili1f_diantai"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 18) {
      musical = 0
      ying = "xiyaof"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 19) {
      musical = 0
      ying = "xiyaof_qingixn"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 20) {
      musical = 0
      ying = "yaayif"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 21) {
      ying = "zzherf"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 22) {
      musical = 0
      ying = "juyinf_guigushi"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 23) {
      musical = 0
      ying = "xjingf_gushi"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 24) {
      musical = 0
      ying = "zzhuaf"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 25) {
      musical = 0
      ying = "linbaf_gaoleng"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 26) {
      musical = 0
      ying = "linbaf_qingxin"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 27) {
      musical = 0
      ying = "xiyaof_laoshi"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 28) {
      musical = 0
      ying = "luyaof"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 29) {
      musical = 0
      ying = "jjingf"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 30) {
      musical = 0
      ying = "zhilingf"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 31) {
      musical = 0
      ying = "hyanif"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 32) {
      musical = 0
      ying = "boy"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 33) {
      musical = 0
      ying = "qianranf"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 34) {
      musical = 0
      ying = "lzliaf"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
    if (p == 35) {
      musical = 0
      ying = "anonyg"
      e.reply(`切换成功,当前音色为${p}:${ying}`)
      return
    }
  }
  async list(e) {
    let msg = ["免费语音:", "\n", "1,甜美女神小玲	zhilingfa	女声，中英混", "\n", "2,自然	温柔女声小兰	gqlanf 	女声，自然	中英混", "\n", "3,标准女声小浩	lucyfa	女声，自然	中英混", "\n", "4,清脆女声小颖	lzyinfa	女声，自然	中英混", "\n", "5,小说女声小妮	hyanifa	女声，自然	中英混", "\n", "6,飘逸女声小静	xjingf	女声，自然	中英混", "\n", "7,清纯女声考拉	kaolaf	女声，自然	中英混", "\n", "8,清亮女声小洁	smjief	女声，自然	中英混", "\n",
      "9,女老师风吟	feyinf	女声，自然	中英混", "\n",
      "10,商务女声璃璃	lili1f_shangwu	女声，自然	中英混", "\n",
      "11,女老师行者	xizhef	女声，自然	中英混", "\n",
      "12,女学生初阳	cyangf	女声，自然	中英混", "\n",
      "13,娱报女声璃璃	lili1f_yubo	女声，自然	中英混", "\n", "14,标准女声安宁	aningf	女声，自然	中英混", "\n",
      "15,知性女声晶晶	jjingf	女声，自然	中英混", "\n",
      "16,标准女声蓝雨	lanyuf	女声，自然	中英混", "\n",
      "17,电台女声璃璃	lili1f_diantai	女声，自然	中英混", "\n",
      "18,标准女声小妖	xiyaof	女声，自然	中英混", "\n",
      "19,清新女声小妖xiyaof_qingixn	女声，自然	中英混", "\n", "20,女声杨阿姨	yaayif	女声，自然	中英混", "\n",
      "21,标准女声朱株儿	zzherf	女声，自然	中英混", "\n",
      "22,鬼故事绝音juyinf_guigushi	女声，自然	中英混", "\n",
      "23,故事女声小静	xjingf_gushi	女声，自然	中英混", "\n",
      "24,故事女声砖砖	zzhuaf	女声，自然	中英混", "\n",
      "25,高冷女声零八linbaf_gaoleng	女声，自然	中英混", "\n", "26,清新女声零八linbaf_qingxin	女声，自然	中英混", "\n",
      "27,女老师小妖	xiyaof_laoshi	女声，自然	中英混", "\n",
      "28,标准女声瑶瑶	luyaof	女声，自然	中英混", "\n",
      "29,标准女声晶晶	jjingf	女声，自然	中英混", "\n",
      "30,甜美女神小玲	zhilingf	女声，传统	中英混", "\n",
      "31,邻家女声小妮	hyanif	女声，传统", "\n", "32,标准男童堂堂	boy	童声，自然	中英混", "\n",
      "33,可爱女童然然	qianranf	童声，传统	中英混", "\n",
      "34,可爱男童连连	lzliaf	童声，传统	中英混", "\n",
      "35,标准女童佚佚	anonyg	童声，传统"]
    e.reply(msg)
  }
  async m(e) {
    let Msg = _.trimStart(e.msg, "#合成")
    console.log(musical)
    if (musical == 0) {
      console.log(ying)
      let url = `https://dds.dui.ai/runtime/v1/synthesize?voiceId=${ying}&text=${Msg}&speed=0.8&volume=150&audioType=mp3`
      e.reply([segment.record(url)])
      return true
    }
  }
}