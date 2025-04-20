import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import common from '../../../lib/common/common.js'
import { reverse_models } from '../YTOpen-Ai/reverse-models.js'
import { god_models } from '../YTOpen-Ai/god-models.js'
import { other_models } from '../YTOpen-Ai/other-models.js'
import { chat_models } from '../YTOpen-Ai/chat-models.js'
const _path = process.cwd()
import fs from 'fs'
let src = _path + "/plugins/y-tian-plugin/resources/css/jty.OTF"
let dirpath = _path + '/data/阴天预设'
if (!fs.existsSync(dirpath)) {
  fs.mkdirSync(dirpath)
}

export class example extends plugin {
  constructor() {
    super({
      name: '阴天[分类帮助]',
      dsc: '',
      event: 'message',
      priority: 1,
      rule: [
        {
          reg: "^(/|#)?阴天(帮助|help)$",
          fnc: 'help'
        },
        {
          reg: "^(/|#)?娱乐帮助$",
          fnc: 'joy'
        },
        {
          reg: "^(/|#)?游戏帮助$",
          fnc: 'game'
        },
        {
          reg: "^(/|#)?群管帮助$",
          fnc: 'group'
        },
        {
          reg: "^(/|#)?(AI|Ai|ai)免费外站帮助$",
          fnc: 'freeai'
        },
        {
          reg: "^(/|#)?(阴天|免费)(绘图|画图)帮助$",
          fnc: 'drawing'
        },
        {
          reg: "^(/|#)?slack帮助$",
          fnc: 'slack'
        },
        {
          reg: "^(/|#)?(ai|AI|Ai)专业版帮助$",
          fnc: 'chatgpt'
        },
        {
          reg: "^(/|#)?(ai|AI|Ai)积分版帮助$",
          fnc: 'godgpt'
        },
        {
          reg: "^(/|#)附加模型大全$",
          fnc: "others"
        },
        {
          reg: "^(/|#)chat模型大全$",
          fnc: "chat"
        },
        {
          reg: "^(/|#)逆向模型大全$",
          fnc: "reverse"
        },
        {
          reg: "^(/|#)god模型大全$",
          fnc: "god"
        },
        {
          reg: "^(/|#)(AI|Ai|ai)附加版帮助$",
          fnc: "otherhelp"
        },
        {
          reg: "^(/|#)(AI|Ai|ai)逆向版帮助$",
          fnc: "reversehelp"
        },
        {
          reg: "^(/|#)图视帮助$",
          fnc: "vision"
        },
        {
          reg: "^(/|#)(AI|Ai|ai)免费国产帮助$",
          fnc: "ChineseAI"
        },
        {
          reg: "^(/|#)(AI|Ai|ai)交互帮助$",
          fnc: "workai"
        },
        {
          reg: "^/sess帮助$",
          fnc: "sessai"
        },
        {
          reg: "^(/|#)(AI|Ai|ai)总帮助$",
          fnc: "totalai"
        }
      ]
    })
  }

  async help(e) {
    const src2 = _path + "/plugins/y-tian-plugin/resources/css/NZBZ.ttf"
    const data2 = {
      tplFile: _path + "/plugins/y-tian-plugin/resources/html/help2.html",
      src2: src2,
      help_css: _path + "/plugins/y-tian-plugin/resources/css/help.css",
      all_min_css: _path + "/plugins/y-tian-plugin/resources/css/fontawesome-free-6.6.0-web/css/all.min.css",
      src: src
    };
    const img = await puppeteer.screenshot("777", {
      ...data2,
    });
    e.reply(img);
  }

  async totalai(e) {
    const img = await screen(19, puppeteer)
    e.reply(img)
  }

  async sessai(e) {
    const img = await screen(18, puppeteer)
    e.reply(img)
  }

  async workai(e) {
    const img = await screen(17, puppeteer)
    e.reply(img)
  }

  async reversehelp(e) {
    const img = await screen('reverse', puppeteer)
    e.reply(img)
  }

  async otherhelp(e) {
    const img = await screen('others', puppeteer)
    e.reply(img)
  }

  async reverse(e) {
    await getModelScreen(reverse_models, 'reverse', e)
  }

  async god(e) {
    await getModelScreen(god_models, 'god', e)
  }

  async chat(e) {
    await getModelScreen(chat_models, 'chat', e)
  }

  async others(e) {
    await getModelScreen(other_models, 'others', e)
  }

  async ChineseAI(e) {
    const img = await screen(11, puppeteer)
    e.reply(img)
  }

  async vision(e) {
    const img = await screen(10, puppeteer)
    e.reply(img)
  }

  async professor(e) {
    const img = await screen(8, puppeteer)
    e.reply(img)
  }

  async chatgpt(e) {
    const img = await screen('chat', puppeteer)
    e.reply(img)
  }

  async godgpt(e) {
    const img = await screen('god', puppeteer)
    e.reply(img)
  }

  async slack(e) {
    const img = await screen(6, puppeteer)
    e.reply(img)
  }

  async drawing(e) {
    const img = await screen(5, puppeteer)
    e.reply(img)
  }

  async freeai(e) {
    const img1 = await screen(4, puppeteer)
    const img2 = await screen(29, puppeteer)
    const img3 = await screen(30, puppeteer)
    const forwardMsg = [img1, img2, img3];
    const JsonPart = await common.makeForwardMsg(e, forwardMsg, '免费模型大全');
    e.reply(JsonPart)
  }

  async group(e) {
    const img = await screen(3, puppeteer)
    e.reply(img)
  }

  async joy(e) {
    const img = await screen(1, puppeteer)
    e.reply(img)
  }

  async game(e) {
    const img = await screen(2, puppeteer)
    e.reply(img)
  }
}

async function screen(num, puppeteer) {
  const data = {
    quality: 100,
    imgType: 'jpeg',
    tplFile: _path + `/plugins/y-tian-plugin/YTfreeai/config/html/help${num}.html`,
    all_min_css: _path + "/plugins/y-tian-plugin/resources/css/fontawesome-free-6.6.0-web/css/all.min.css",
    all_css_src: _path + "/plugins/y-tian-plugin/resources/css/all_help.css",
    chat_css_src: _path + "/plugins/y-tian-plugin/resources/css/chat_help.css",
    other_css_src: _path + "/plugins/y-tian-plugin/resources/css/other_help.css",
    god_css_src: _path + "/plugins/y-tian-plugin/resources/css/god_help.css",
    src: _path + "/plugins/y-tian-plugin/resources/css/jty.OTF",
    ClaudeLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/claude.jpeg",
    ChatGlmLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/chatglm.png",
    QianFanLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/qianfan.png",
    GrokLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/grok.jpg",
    GeminiLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/gemini.jpg",
    QwenLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/qwen.png",
    LingLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/01.jpg",
    SparkLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/spark.png",
    DeepSeekLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/deepseek.jpeg",
    ChatGptLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/chatgpt.jpg",
    LlamaLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/llama.jpg",
    DoubaoLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/doubao.png",
    HunyuanLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/hunyuan.png",
    KimiLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/kimi.jpeg",
    MinimaxLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/hailuo.png",
    StepLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/step.png",
    MitaLogo: _path + "/plugins/y-tian-plugin/YTfreeai/config/logos/mita.jpg",
  }
  const img = await puppeteer.screenshot('777', {
    ...data,
  })
  return img
}

async function getModelScreen(models, type, e) {
  const chunkSize = 35;
  const forwardMsg = [];
  const BASE_LOGO_PATH = `${_path}/plugins/y-tian-plugin/YTfreeai/config/logos`;
  const logoRules = [
    { prefix: ['command'], file: 'command.jpg' },
    { prefix: ['claude'], file: 'claude.jpeg' },
    { prefix: ['suno'], file: 'suno.png' },
    { prefix: ['luma'], file: 'luma.png' },
    { prefix: ['llava'], file: 'llava.png' },
    { prefix: ['mj', 'midjourney', 'nijidjourney'], file: 'mj.png' },
    { prefix: ['glm-'], file: 'chatglm.png' },
    { prefix: ['ernie', 'qianfan'], file: 'qianfan.png' },
    { prefix: ['grok'], file: 'grok.jpg' },
    { prefix: ['gemini', 'gemma', 'learnlm', 'google'], file: 'gemini.jpg' },
    { prefix: ['deepseek-'], file: 'deepseek.jpeg' },
    { prefix: ['qwen', 'qwq-', 'internlm-', 'dbrx-'], file: 'qwen.png' },
    { prefix: ['yi-'], file: '01.jpg' },
    { prefix: ['spark-'], file: 'spark.png' },
    { prefix: ['dalle','dall-e','gpt', 'o1', 'o3', 'o4', 'sora-', 'advanced-voice', 'generate-pptx'], file: 'chatgpt.jpg' },
    { prefix: ['llama'], file: 'llama.jpg' },
    { prefix: ['doubao'], file: 'doubao.png' },
    { prefix: ['hunyuan'], file: 'hunyuan.png' },
    { prefix: ['kimi', 'moonshot', 'moonlight'], file: 'kimi.jpeg' },
    { prefix: ['minimax'], file: 'hailuo.png' },
    { prefix: ['step'], file: 'step.png' },
    { prefix: ['mistral-', 'mixtral-', 'ministral-', 'pixtral-', 'codestral-'], file: 'mixtral.png' },
    { prefix: ['noobai', 'wai-', 'anishadow-'], file: 'Noob.png' },
    { prefix: ['sd-', 'sd3', 'stable-diffusion', 'sdxl'], file: 'sd.png' },
    { prefix: ['ideogram'], file: 'ideogram.png' },
    { prefix: ['flux'], file: 'flux.jpg' },
    { prefix: ['runway'], file: 'runway.jpg' },
    { prefix: ['playground'], file: 'playground.jpg' },
    { prefix: ['mita'], file: 'mita.jpg' },
    { prefix: ['jimeng'], file: 'jimeng.png' },
    { prefix: ['recraft-'], file: 'recraft.png' },
    { prefix: ['ltx-'], file: 'ltx.png' },
    { prefix: ['sana'], file: 'sana.png' },
  ];

  // 默认 logo 路径
  const DEFAULT_LOGO = `${BASE_LOGO_PATH}/default.jpg`;

  // 动态生成 logoMap
  const createLogoMap = () => {
    const map = {};
    logoRules.forEach(({ prefix, file }) => {
      prefix.forEach(key => {
        map[key] = `${BASE_LOGO_PATH}/${file}`;
      });
    });
    return map;
  };

  const logoMap = createLogoMap();

  const baseData = {
    quality: 100,
    imgType: 'jpeg',
    tplFile: `${_path}/plugins/y-tian-plugin/YTfreeai/config/html/${type}.html`,
    all_min_css: `${_path}/plugins/y-tian-plugin/resources/css/fontawesome-free-6.6.0-web/css/all.min.css`,
    all_css_src: `${_path}/plugins/y-tian-plugin/resources/css/all_help.css`,
  };

  for (let i = 0; i < models.length; i += chunkSize) {
    const currentChunk = Math.floor(i / chunkSize) + 1;
    const chunk = models.slice(i, i + chunkSize).map(model => {
      const modelNameLower = (model.model || model.name).toLowerCase();
      const logoPath = Object.keys(logoMap).find(key => modelNameLower.includes(key))
        ? logoMap[Object.keys(logoMap).find(key => modelNameLower.includes(key))]
        : DEFAULT_LOGO;
      return {
        ...model,
        logo_path: logoPath,
      };
    });

    const data = {
      ...baseData,
      models: chunk,
      currentChunk,
    };

    const img = await puppeteer.screenshot('777', data);
    forwardMsg.push(img);
  }

  const JsonPart = await common.makeForwardMsg(e, forwardMsg, `${type}模型大全`);
  e.reply(JsonPart);
}