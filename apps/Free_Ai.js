import { dependencies } from "../YTdependence/dependencies.js";
const { fs, _path, common, replyBasedOnStyle, puppeteer, NXModelResponse } = dependencies;
import { getFileInfo } from '../utils/fileUtils.js';
import { TakeImages } from '../utils/fileUtils.js';
import { Chatru_gemini } from '../utils/providers/VisionModels/chatru/gemini.js';
import { processUploadedFile } from '../YTOpen-Ai/tools/processUploadedFile.js'
const aiSettingsPath = _path + '/data/YTAi_Setting/data.json';
const aiSettings = JSON.parse(await fs.promises.readFile(aiSettingsPath, "utf-8"));
const styles = aiSettings.chatgpt.ai_chat_style;

const modellist = {
  "海螺": "minimax-nx",
  "minimax": "minimax-nx",
  "豆包": "doubao-nx",
  "mini": "gpt-4o-mini-nx",
  "gpt4": "gpt-4o-nx",
  "gemini": "gemini-2.0-flash-exp-nx",
  "文心": "ERNIE-Speed-128k-nx",
  "wx": "ERNIE-Speed-128k-nx",
  "deepr1": "deepseek-reasoner-nx",
  "深度求索": "deepseek-v3-nx",
  "claude": "claude-3.5-sonnet-poe-nx",
  "grok": "grok-v2-nx",
  "qwq": "qwen-qwq-32b-preview-nx",
  "zp": "glm-4-flash-nx",
  "glm4": "glm-4-flash-nx",
  "智谱": "glm-4-flash-nx",
  "星火": "spark-max-nx",
  "xh": "spark-max-nx",
  "yi": "yi-lightning-nx",
  "llama": "llama-3.3-70b-nx",
  "羊驼": "llama-3.3-70b-nx",
  "deepseek": "deepseek-v3-nx",
  "qwen": "qwen-2.5-72b-instruct-nx",
  "千问": "qwen-2.5-72b-instruct-nx",
  "kimi": "kimi-pro-nx",
  "mita": "mita-nx",
  "秘塔": "mita-nx",
  "米塔": "mita-nx"
};

export class YTFreeAi extends plugin {
  constructor() {
    const rules = Object.keys(modellist).flatMap(model => [
      {
        reg: new RegExp(`^#${model}(.*)`, 'i'),
        fnc: 'handleChat'
      },
      {
        reg: new RegExp(`^#结束${model}对话$`, 'i'),
        fnc: 'endConversation'
      }
    ]);

    super({
      name: '阴天[FreeAi]',
      dsc: '',
      event: 'message',
      priority: -Infinity,
      rule: rules
    });
  }

  // 获取Redis中的历史记录
  async getHistory(userId, model) {
    const key = `YTfreeai:chat:history:${userId}:${model}`;
    const history = await redis.get(key);
    return history ? JSON.parse(history) : [];
  }

  // 保存历史记录到Redis
  async saveHistory(userId, model, history) {
    const key = `YTfreeai:chat:history:${userId}:${model}`;
    await redis.set(key, JSON.stringify(history), { EX: 3600 * 24 }); // 设置24小时过期
  }

  async endConversation(e) {
    const model = e.msg.match(/^#结束([\w\u4e00-\u9fa5]+)对话$/i)?.[1]?.toLowerCase();
    if (model && modellist.hasOwnProperty(model)) {
      const userId = e.user_id;
      const key = `YTfreeai:chat:history:${userId}:${model}`;
      await redis.del(key);
      e.reply(`模型: ${model} 对话已重置`);
    } else {
      e.reply("未找到对应的对话历史记录");
    }
  }

  async handleChat(e) {
    const triggers = Object.keys(modellist).join('|');
    const regex = new RegExp(`^#(${triggers})`, 'i');
    const model = e.msg.match(regex)?.[1]?.toLowerCase();
    console.log(`使用模型：${model}`);
    if (!model || !modellist.hasOwnProperty(model)) {
      e.reply("不支持的模型类型");
      return;
    }

    //console.log(fileUrl, fileName);
    const userId = e.user_id;
    let userMsg = e.msg.replace(new RegExp(`^#${model}\\s*`, 'i'), '').trim();
    const images = await TakeImages(e);
    if (images && images.length > 0) {
      const answer = await Chatru_gemini([{ role: 'user', content: userMsg }], images);
      if (answer) {
        await replyBasedOnStyle(styles, answer, e, modellist[model] || model, puppeteer, fs, _path, userMsg, common);
      } else {
        e.reply("未能获取到有效的图片回复，请稍后再试");
      }
      return;
    }
    let { fileUrl, fileName } = await getFileInfo(e);
    let userFinalMsg = await processUploadedFile(fileUrl, fileName, userMsg);
    const history = await this.getHistory(userId, model);
    history.push({ role: "user", content: userFinalMsg });

    const answer = await this.getModelResponse(model, history);
    if (answer) {
      await replyBasedOnStyle(styles, answer, e, modellist[model] || model, puppeteer, fs, _path, userMsg, common);
      history.push({ role: "assistant", content: answer });
      await this.saveHistory(userId, model, history);
    } else {
      e.reply("未能获取到回复，请稍后再试");
    }
  }

  async getModelResponse(model, history) {
    const modelName = modellist[model];
    if (modelName) {
      return await NXModelResponse(history, modelName);
    }
    return null;
  }
}