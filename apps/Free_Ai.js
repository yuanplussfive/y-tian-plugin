import { dependencies } from "../YTdependence/dependencies.js";
const { replyBasedOnStyle, NXModelResponse, mimeTypes } = dependencies;
import { getFileInfo, TakeImages, getBase64File } from '../utils/fileUtils.js';
import { processUploadedFile } from '../YTOpen-Ai/tools/processUploadedFile.js';
import { KimiCompletion } from '../utils/providers/ChatModels/kimi/kimiClient.js';
import { free_models } from "../YTOpen-Ai/free-models.js";
import { callGeminiAPI, handleGeminiImage, processGeminiResult } from "../YTOpen-Ai/GeminiAPI.js";

const modellist = {
  "hunyuan": "hunyuan-lite",
  "混元": "hunyuan-lite",
  "step": "step-2",
  "跃问": "step-2",
  "g4f": "gpt-4o",
  "deepr1": "deepseek-r1",
  "o3mini": "o3-mini",
  "海螺": "minimax-pro",
  "minimax": "minimax-pro",
  "豆包": "doubao-pro",
  "mini": "gpt-4o-mini",
  "gpt4": "gpt-4o",
  "gemini": "gemini-2.0-flash-exp",
  "文心": "ERNIE-Speed-128k",
  "wx": "ERNIE-Speed-128k",
  "deepr1": "deepseek-reasoner",
  "深度求索": "deepseek-v3",
  "claude": "claude-3.5-sonnet-poe",
  "grok": "grok-v2",
  "qwq": "qwen-qwq-32b-preview",
  "zp": "glm-4-flash",
  "glm4": "glm-4-flash",
  "智谱": "glm-4-flash",
  "星火": "spark-max",
  "xh": "spark-max",
  "yi": "yi-lightning",
  "llama": "llama-3.3-70b",
  "羊驼": "llama-3.3-70b",
  "deepseek": "deepseek-v3",
  "qwen": "qwen-2.5-72b-instruct",
  "千问": "qwen-2.5-72b-instruct",
  "kimi": "kimi-pro",
  "mita": "mita-search",
  "秘塔": "mita-search",
  "米塔": "mita-search"
};

export class YTFreeAi extends plugin {
  constructor() {
    const rules = Object.keys(modellist).flatMap(model => [
      { reg: new RegExp(`^#${model}(.*)`, 'i'), fnc: 'handleChat' },
      { reg: new RegExp(`^#结束${model}对话$`, 'i'), fnc: 'endConversation' }
    ]);

    super({
      name: '阴天[FreeAi]',
      dsc: '',
      event: 'message',
      priority: -Infinity,
      rule: rules
    });

    this.logger = console;
  }

  // 获取用户缓存配置
  async getConfig(userId, model) {
    const key = `YTfreeai:chat:config:${userId}:${model}`;
    const config = await redis.get(key);
    return config ? JSON.parse(config) : {
      history: [],
      modelSpecific: {} // 模型特定配置
    };
  }

  // 保存用户缓存配置
  async saveConfig(userId, model, config) {
    const key = `YTfreeai:chat:config:${userId}:${model}`;
    await redis.set(key, JSON.stringify(config), { EX: 3600 * 24 });
  }

  // 结束对话并清理缓存
  async endConversation(e) {
    const model = e.msg.match(/^#结束([\w\u4e00-\u9fa5]+)对话$/i)?.[1]?.toLowerCase();
    if (model && modellist.hasOwnProperty(model)) {
      const userId = e.user_id;
      const key = `YTfreeai:chat:config:${userId}:${model}`;
      await redis.del(key);
      e.reply(`模型: ${model} 对话已重置`);
    } else {
      e.reply("未找到对应的对话历史记录");
    }
  }

  // 处理聊天请求
  async handleChat(e) {
    const triggers = Object.keys(modellist).join('|');
    const regex = new RegExp(`^#(${triggers})`, 'i');
    const model = e.msg.match(regex)?.[1]?.toLowerCase();

    if (!model || !modellist.hasOwnProperty(model)) {
      e.reply("不支持的模型类型");
      return;
    }

    const userId = e.user_id;
    let userMsg = e.msg.replace(new RegExp(`^#${model}\\s*`, 'i'), '').trim();
    const config = await this.getConfig(userId, model);
    const history = config.history;

    // 处理文件或图片
    const { fileUrl, fileName: filenames } = await getFileInfo(e);
    const fileUrls = fileUrl ? [fileUrl] : await TakeImages(e);

    if (fileUrls?.length > 0) {
      const isValidModel = fileUrl || free_models.find(m => m.model === model)?.features?.includes('image_recognition');
      if (!isValidModel) {
        e.reply("此模型不支持图像分析！");
        return;
      }

      let imgurls = [{ type: "text", text: userMsg }];
      for (const url of fileUrls) {
        try {
          const modelSupportsFile = free_models.find(m => m.model === model)?.features?.includes('file');
          const filename = filenames || '1.png';
          const type = filenames ? 'file' : 'img';

          if (!modelSupportsFile && filenames) {
            imgurls = await processUploadedFile(url, filename, userMsg);
          } else {
            const file_urls = await getBase64File(url, filename, type);
            const errorMessages = {
              "该文件链接已过期，请重新获取": "该图片下载链接已过期，请重新上传",
              "无效的图片格式": "无效的图片格式，请重新上传",
              "无效的图片下载链接": "无效的图片下载链接，请确保适配器支持且图片未过期，可重新上传尝试",
              "无效的文件下载链接": "无效的文件下载链接，请确保适配器支持且文件未过期，可重新上传尝试",
            };

            if (errorMessages[file_urls]) {
              return e.reply(errorMessages[file_urls]);
            }

            const mimeType = mimeTypes.lookup(filename) || 'application/octet-stream';
            const isImage = mimeType.startsWith('image/');
            imgurls.push(isImage ?
              { type: "image_url", image_url: { url: file_urls } } :
              { type: "file", file_url: { url: file_urls } }
            );
          }
        } catch (error) {
          this.logger.error(`文件处理失败: ${error.message}`);
          e.reply("文件处理失败，请重试");
          return;
        }
      }
      history.push({ role: "user", content: imgurls });
    } else if (userMsg) {
      const processedMsg = await processUploadedFile(fileUrl, filenames, userMsg);
      history.push({ role: "user", content: processedMsg });
    }

    const answer = await this.getModelResponse(model, config, e);
    if (!answer) {
      e.reply("未能获取到回复，请稍后再试");
      return;
    }

    // 处理回复样式并保存配置
    try {
      await replyBasedOnStyle(answer, e, modellist[model] || model, userMsg);
      history.push({ role: "assistant", content: answer });
      config.history = history;
      await this.saveConfig(userId, model, config);
    } catch (error) {
      this.logger.error(`回复处理失败: ${error.message}`);
      e.reply("回复处理失败，请稍后再试");
    }
  }

  // 获取模型响应
  async getModelResponse(model, config, e) {
    const modelName = modellist[model];
    if (!modelName) return null;
    const isKimi = model.toLowerCase().includes('kimi');
    const isGemini = model.toLowerCase().includes('gemini');
    if (isGemini) {
      const openAIFormat = {
        messages: config.history
      };
      const LastInput = openAIFormat.messages[openAIFormat.messages.length - 1]
      if (Array.isArray(LastInput.content)) {
        const result = await callGeminiAPI(openAIFormat, [], {
          model: "gemini-2.0-flash-exp-image-generation",
          responseModalities: ['TEXT', 'IMAGE'],
          config: {
            temperature: 0.8
          }
        });
        const output = await handleGeminiImage(result, e);
        const { textContent } = output;
        return ['生成内容失败', '', null].includes(textContent) ? '请求完成' : textContent;
      }
      const searchRegex = /搜索|查找|查一下|查询/i;
      const drawingRegex = /绘.*[图制作个]|画.*[图个张幅]|制图|生成.*[图片图像]|创建.*图[表形]|做.*[个一张图]|作.*[个一张图]/i;

      const lastContent = openAIFormat.messages?.at(-1)?.content;
      const isDrawing = drawingRegex.test(lastContent);
      const isSearch = searchRegex.test(lastContent) && !isDrawing;

      const options = {
        model: isDrawing ? "gemini-2.0-flash-exp-image-generation" : "gemini-2.0-flash",
        responseModalities: isDrawing ? ["TEXT", "IMAGE"] : ["TEXT"],
        ...(isSearch ? { useTools: true, tools: [{ googleSearch: {} }] } : {}),
        returnRawResponse: isDrawing || isSearch
      };
      const input = isDrawing
        ? lastContent
        : openAIFormat;
      const result = await callGeminiAPI(input, [], options);
      console.log(result);
      await handleGeminiImage(result, e);
      const output = await processGeminiResult(result);
      console.log(output);
      return output;
    }
    if (isKimi) {
      try {
        const kimiConfig = config.modelSpecific.kimi || {};
        const kimiParams = {
          messages: config.history.slice(-1),
          refreshToken: kimiConfig.refreshToken,
          refConvId: kimiConfig.convId,
          skipPreN2s: true
        };

        console.log(kimiParams)
        const kimiResponse = await KimiCompletion(kimiParams.messages, kimiParams.refreshToken, kimiParams.refConvId);
        if (kimiResponse) {
          // 更新 Kimi 特定配置
          config.modelSpecific.kimi = {
            refreshToken: kimiResponse.refreshToken || kimiParams.refreshToken,
            convId: kimiResponse.convId || kimiParams.refConvId
          };
          return kimiResponse.output;
        }
        this.logger.warn(`KimiCompletion 失败，切换到备用服务: ${modelName}`);
      } catch (error) {
        this.logger.error(`KimiCompletion 错误: ${error.message}`);
        return `KimiCompletion 错误: ${error.message}`;
      }
    }

    return await NXModelResponse(config.history, modelName);
  }
}