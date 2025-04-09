const _path = process.cwd();
import common from "../../../lib/common/common.js";
import mimeTypes from "mime-types";
import _ from "lodash";
import path from "path";
import fs from "fs";
import fetch from "node-fetch";
import { fs_reverse } from "../YTdependence/fs_reverse_makes.js";
import { handleImages, loadData, sendLongMessage, saveUserHistory, TakeImages, saveData, loadUserHistory, getBase64File, get_address, downloadAndSaveFile, removeDuplicates } from "../utils/fileUtils.js";
import { getFileInfo } from '../utils/fileUtils.js';
import { processUploadedFile } from '../YTOpen-Ai/tools/processUploadedFile.js';
import { generateAndSendSong } from "../utils/providers/AudioModels/suno/suno.js";
import { jimengClient } from "../utils/providers/ChatModels/jimeng/jimengClient.js";
import { reverse_models } from "../YTOpen-Ai/reverse-models.js";
import { NXModelResponse } from "../utils/providers/ChooseModels.js";
import { extractAndRender } from '../YTOpen-Ai/tools/preview.js';
import { processArray } from '../YTOpen-Ai/tools/messageGenerator.js';
import { isPluginCommand } from "../YTOpen-Ai/ask-ban.js";
import { replyBasedOnStyle } from "../YTOpen-Ai/answer-styles.js";
import { handleTTS } from "../model/Anime_tts.js";
import { Anime_tts_roles } from "../model/Anime_tts_roles.js";
let Bot_Name;
let dirpath = `${_path}/data/YTreverseai`;
await setName();
await fs_reverse();

export class reverseAi extends plugin {
  constructor() {
    super({
      name: '阴天[reverse_ai]',
      dsc: '',
      event: 'message',
      priority: 1,
      rule: [
        {
          reg: "^#查看逆向预设$|^#切换逆向(群|全局)?预设(.*?)$",
          fnc: 'reverse_system'
        },
        {
          reg: "^#切换逆向模型(.*?)",
          fnc: 'reverse_change',
          permission: 'master'
        },
        {
          reg: "^#结束(全部)?逆向(群)?对话$",
          fnc: 'reverse_endchat'
        },
        {
          reg: "^#清空(全部)?逆向(群|全局)?预设$",
          fnc: 'reverse_endsystem'
        },
        {
          reg: "^#逆向(开启|关闭)分区间$",
          fnc: 'reverse_workshop',
          permission: 'master'
        },
        {
          reg: "^[\s\S]*",
          fnc: 'reverse_chat',
          log: false
        }
      ]
    })
  }

  async reverse_workshop(e) {
    try {
      let dataPath = `${dirpath}/data.json`;
      let data = JSON.parse(await fs.promises.readFile(dataPath, "utf-8"));
      if (e.msg.includes("#逆向开启分区间")) {
        data.chatgpt.workshop = false;
        e.reply(`逆向模型开启分区间,所有对话独立`);
      } else {
        data.chatgpt.workshop = true;
        e.reply(`逆向模型已关闭分区间,对话共享`, true);
      }
      await fs.promises.writeFile(dataPath, JSON.stringify(data), "utf-8");
      return true;
    } catch (error) {
      console.error("Error in workshop function: ", error);
      e.reply("更改失败了");
    }
  }

  async reverse_endsystem(e) {
    try {
      const folderPath = path.join(dirpath, "user_cache");
      if (!fs.existsSync(folderPath)) {
        await fs.promises.mkdir(folderPath, { recursive: true });
      }

      const sanitizeConversation = async (filePath, redisKey) => {
        try {
          let conversations = [];
          try {
            conversations = await loadData(redisKey, filePath);
            console.log('Loaded conversations:', conversations);
          } catch (err) {
            console.log(`读取数据失败,使用空数组: ${err.message}`);
          }

          if (!Array.isArray(conversations)) {
            conversations = [];
          }

          const sanitizedConversations = conversations.filter(item =>
            item && typeof item === 'object' && item.role !== "system"
          );

          // 备份原始数据
          const backupPath = `${filePath}.backup`;
          if (fs.existsSync(filePath)) {
            try {
              await fs.promises.copyFile(filePath, backupPath);
            } catch (err) {
              console.log(`创建备份失败: ${err.message}`);
            }
          }

          // 保存清理后的数据
          try {
            await saveData(redisKey, filePath, sanitizedConversations);
          } catch (err) {
            console.error(`保存数据失败: ${err.message}`);
            return {
              success: false,
              error: `保存数据失败: ${err.message}`
            };
          }

          // 验证写入是否成功
          let verifyData = [];
          try {
            verifyData = await loadData(redisKey, filePath);
          } catch (err) {
            console.error(`验证数据失败: ${err.message}`);
            return {
              success: false,
              error: `验证数据失败: ${err.message}`
            };
          }

          if (JSON.stringify(verifyData) === JSON.stringify(sanitizedConversations)) {
            // 写入成功，删除备份
            if (fs.existsSync(backupPath)) {
              try {
                await fs.promises.unlink(backupPath);
              } catch (err) {
                console.log(`删除备份失败: ${err.message}`);
              }
            }
            return {
              success: true,
              count: conversations.length - sanitizedConversations.length
            };
          } else {
            // 写入验证失败，恢复备份
            if (fs.existsSync(backupPath)) {
              try {
                await fs.promises.copyFile(backupPath, filePath);
                await fs.promises.unlink(backupPath);
              } catch (err) {
                console.log(`恢复备份失败: ${err.message}`);
              }
            }
            return {
              success: false,
              error: '写入验证失败'
            };
          }
        } catch (err) {
          console.error(`清理对话文件失败 ${filePath}:`, err);
          return {
            success: false,
            error: err.message
          };
        }
      };

      // 处理不同的命令
      if (e.msg.includes("#清空全部逆向预设") && e.isMaster) {
        try {
          const files = await fs.promises.readdir(folderPath);
          const results = await Promise.all(
            files.map(async file => {
              const filePath = path.join(folderPath, file);
              const redisKey = `YTUSER_reverse:${file.replace('.json', '')}`;
              const result = await sanitizeConversation(filePath, redisKey);
              return { file, result };
            })
          );

          const successCount = results.filter(r => r.result.success).length;
          const failCount = results.length - successCount;
          const totalRemoved = results.reduce((sum, r) =>
            sum + (r.result.success ? r.result.count : 0), 0);

          e.reply(`逆向预设处理完成:\n成功: ${successCount}个\n失败: ${failCount}个\n共清除: ${totalRemoved}条预设${failCount > 0 ? '\n请检查日志了解详细错误信息' : ''
            }`);
        } catch (err) {
          console.error("处理全部预设时发生错误:", err);
          e.reply("处理全部文件时发生错误");
        }
      }
      // 清空指定用户的预设
      else if (e.msg.includes("#清空逆向预设")) {
        let QQ_at = e.message
          .filter(item => item.type === 'at' && item.qq)
          .map(item => item.qq);

        const current_user = e.user_id;
        const userFilePath = path.join(folderPath, `${current_user}.json`);
        const userRedisKey = `YTUSER_reverse:${current_user}`;

        if (QQ_at.length === 0) {
          QQ_at = [e.user_id];
        }

        if (e.isMaster || (QQ_at.includes(e.user_id) && QQ_at.length === 1)) {
          const results = await Promise.all(
            QQ_at.map(async qq => {
              const userPath = path.join(folderPath, `${qq}.json`);
              const userKey = `YTUSER_reverse:${qq}`;
              if (fs.existsSync(userPath)) {
                const result = await sanitizeConversation(userPath, userKey);
                if (result.success) {
                  e.reply(`用户 ${qq} 的预设已清空，移除了 ${result.count} 条预设消息`);
                } else {
                  e.reply(`清空用户 ${qq} 的预设失败: ${result.error}`, true);
                }
                return result.success;
              } else {
                e.reply(`用户 ${qq} 的预设不存在`, true);
                return false;
              }
            })
          );

          if (!results.some(success => success)) {
            e.reply("所有操作均失败，请检查权限和文件状态");
          }
        } else {
          if (fs.existsSync(userFilePath)) {
            const result = await sanitizeConversation(userFilePath, userRedisKey);
            if (result.success) {
              e.reply(`用户 ${current_user} 的预设已清空，移除了 ${result.count} 条预设消息`);
            } else {
              e.reply(`清空失败: ${result.error}`, true);
            }
          } else {
            e.reply("当前未存在预设", true);
          }
        }
      }
      // 清空群预设
      else if (e.msg.includes("#清空逆向群预设") && e.isMaster && e.group_id) {
        const groupFilePath = path.join(folderPath, `${e.group_id}.json`);
        const groupRedisKey = `YTUSER_reverse:${e.group_id}`;
        if (fs.existsSync(groupFilePath)) {
          const result = await sanitizeConversation(groupFilePath, groupRedisKey);
          if (result.success) {
            e.reply(`群聊 ${e.group_id} 的预设已清空，移除了 ${result.count} 条预设消息`);
          } else {
            e.reply(`清空群聊预设失败: ${result.error}`, true);
          }
        } else {
          e.reply("当前群未存在预设", true);
        }
      }
      // 清空全局预设
      else if (e.msg.includes("#清空逆向全局预设") && e.isMaster) {
        const globalFilePath = path.join(folderPath, 'all.json');
        const globalRedisKey = `YTAll_reverse:all`;
        if (fs.existsSync(globalFilePath)) {
          const result = await sanitizeConversation(globalFilePath, globalRedisKey);
          if (result.success) {
            e.reply(`全局预设已清空，移除了 ${result.count} 条预设消息`);
          } else {
            e.reply(`清空全局预设失败: ${result.error}`, true);
          }
        } else {
          e.reply("全局预设不存在", true);
        }
      }
    } catch (error) {
      console.error("其他结束系统处理时发生错误:", error);
      e.reply("处理过程中发生错误，请检查日志获取详细信息");
    }
  }

  async reverse_system(e) {
    try {
      const presetDir = path.join(_path, "data", "阴天预设");
      const dirname = await fs.promises.readdir(presetDir, "utf-8");

      /**
       * 处理预设文件，分批发送消息
       */
      const processFiles = async () => {
        const batchSize = 50;
        for (let startIndex = 0; startIndex < dirname.length; startIndex += batchSize) {
          const currentBatch = dirname.slice(startIndex, startIndex + batchSize);
          const forwardMsg = await Promise.all(currentBatch.map(async (name, index) => {
            const cleanName = name.replace(/\.txt$/g, "");
            const weight = await fs.promises.readFile(path.join(presetDir, name), "utf-8").then(content => content.slice(0, 100));
            return `序号:${startIndex + index + 1}\n名称:${cleanName}\n内容简述:${weight}`;
          }));
          await e.reply(await common.makeForwardMsg(e, forwardMsg, '预设魔法大全'));
        }
      };

      /**
       * 切换预设，优先使用 Redis
       * @param {string} targetFile - 目标文件（用户ID、群ID或all）
       * @param {string} replyMessage - 回复消息
       */
      const switchPreset = async (targetFile, replyMessage) => {
        const msg = parseInt(e.msg.replace(/[^0-9]/ig, ""), 10);
        if (dirname[msg - 1]) {
          const prompt = await fs.promises.readFile(path.join(presetDir, dirname[msg - 1]), "utf-8");
          const filePath = path.join(dirpath, "user_cache", `${targetFile}.json`);
          const redisKey = targetFile === 'all' ? `YTAll_reverse:all` : `YTUSER_reverse:${targetFile}`;
          let data = await loadData(redisKey, filePath);
          // 过滤掉所有的 system 消息，并在开头添加新的 system 消息
          const lastSystemMessage = data.filter(item => item.role === 'system').pop();
          if (lastSystemMessage) {
            data = data.filter(item => item.role !== 'system');
            data.unshift({ role: "system", content: prompt });
          } else {
            data.unshift({ role: "system", content: prompt });
          }
          await saveData(redisKey, filePath, data);
          e.reply(`${replyMessage} 【${dirname[msg - 1].replace(/\.txt$/, "")}】`);
        } else {
          e.reply("输入序号错误!");
        }
      };

      // 处理不同的命令
      if (e.msg.includes("#查看逆向预设")) {
        await processFiles();
      } else if (e.msg.includes("#切换逆向预设")) {
        await switchPreset(e.user_id, "成功切换预设");
      } else if (e.msg.includes("#切换逆向群预设") && e.group_id && e.isMaster) {
        await switchPreset(e.group_id, "成功切换群预设");
      } else if (e.msg.includes("#切换逆向全局预设") && e.isMaster) {
        await switchPreset("all", "成功切换全局预设");
      }
    } catch (error) {
      console.error("其他系统处理时发生错误:", error);
      e.reply(error.message);
    }
  }

  async reverse_endchat(e) {
    try {
      const folderPath = path.join(dirpath, "user_cache");

      // 确保目录存在
      if (!fs.existsSync(folderPath)) {
        await fs.promises.mkdir(folderPath, { recursive: true });
      }

      /**
      * 优化文件读写操作，优先使用 Redis
      * @param {string} filePath - 文件路径 
      * @param {string} redisKey - Redis 键
      * @returns {Object} 操作结果
      */
      const sanitizeConversation = async (filePath, redisKey) => {
        try {
          // 从 Redis 或本地加载数据
          let conversations = [];
          try {
            conversations = await loadData(redisKey, filePath);
          } catch (err) {
            console.log(`读取数据失败,使用空数组: ${err.message}`);
          }

          // 确保 conversations 是数组
          if (!Array.isArray(conversations)) {
            conversations = [];
          }

          // 过滤预设对话，移除 role 为 "user" 和 "assistant" 的消息
          const sanitizedConversations = conversations.filter(item =>
            item && typeof item === 'object' && item.role !== "user" && item.role !== "assistant"
          );
          // 备份原始数据
          const backupPath = `${filePath}.backup`;
          if (fs.existsSync(filePath)) {
            try {
              await fs.promises.copyFile(filePath, backupPath);
            } catch (err) {
              console.log(`创建备份失败: ${err.message}`);
            }
          }

          // 保存清理后的数据
          try {
            await saveData(redisKey, filePath, sanitizedConversations);
          } catch (err) {
            console.error(`保存数据失败: ${err.message}`);
            return {
              success: false,
              error: `保存数据失败: ${err.message}`
            };
          }

          // 验证写入是否成功
          let verifyData = [];
          try {
            verifyData = await loadData(redisKey, filePath);
          } catch (err) {
            console.error(`验证数据失败: ${err.message}`);
            return {
              success: false,
              error: `验证数据失败: ${err.message}`
            };
          }

          if (JSON.stringify(verifyData) === JSON.stringify(sanitizedConversations)) {
            // 写入成功，删除备份
            if (fs.existsSync(backupPath)) {
              try {
                await fs.promises.unlink(backupPath);
              } catch (err) {
                console.log(`删除备份失败: ${err.message}`);
              }
            }
            return {
              success: true,
              count: conversations.length - sanitizedConversations.length
            };
          } else {
            // 写入验证失败，恢复备份
            if (fs.existsSync(backupPath)) {
              try {
                await fs.promises.copyFile(backupPath, filePath);
                await fs.promises.unlink(backupPath);
              } catch (err) {
                console.log(`恢复备份失败: ${err.message}`);
              }
            }
            return {
              success: false,
              error: '写入验证失败'
            };
          }
        } catch (err) {
          console.error(`清理对话文件失败 ${filePath}:`, err);
          return {
            success: false,
            error: err.message
          };
        }
      };

      // 结束全部逆向对话
      if (e.msg.includes("#结束全部逆向对话") && e.isMaster) {
        try {
          const files = await fs.promises.readdir(folderPath);
          const results = await Promise.all(
            files.map(async file => {
              const filePath = path.join(folderPath, file);
              const redisKey = `YTUSER_reverse:${file.replace('.json', '')}`;
              const result = await sanitizeConversation(filePath, redisKey);
              return { file, result };
            })
          );
          const totalCount = results.reduce((sum, item) => {
            if (item.result?.count !== undefined) {
              return sum + item.result.count;
            }
            return sum;
          }, 0);
          const successCount = results.filter(r => r.result.success).length;
          const failCount = results.length - successCount;

          e.reply(`逆向对话处理完成:\n成功: ${successCount}个\n失败: ${failCount}个${failCount > 0 ? '\n请检查日志了解详细错误信息' : ''
            }\n总共清空 ${totalCount} 个消息`);
        } catch (err) {
          console.error("处理全部对话时发生错误:", err);
          e.reply("处理全部文件时发生错误");
        }
      }
      // 结束指定用户的逆向对话
      else if (e.msg.includes("#结束逆向对话")) {
        let QQ_at = e.message
          .filter(item => item.type === 'at' && item.qq)
          .map(item => item.qq);

        const current_user = e.user_id;
        const userFilePath = path.join(folderPath, `${current_user}.json`);
        const userRedisKey = `YTUSER_reverse:${current_user}`;

        if (QQ_at.length === 0) {
          QQ_at = [e.user_id];
        }

        if (e.isMaster || (QQ_at.includes(e.user_id) && QQ_at.length === 1)) {
          const results = await Promise.all(
            QQ_at.map(async qq => {
              const userPath = path.join(folderPath, `${qq}.json`);
              const userKey = `YTUSER_reverse:${qq}`;
              if (fs.existsSync(userPath)) {
                const result = await sanitizeConversation(userPath, userKey);
                if (result.success) {
                  e.reply(`用户 ${qq} 的对话已重置，移除了最新 ${result.count} 条消息`);
                } else {
                  e.reply(`重置用户 ${qq} 的对话失败: ${result.error}`, true);
                }
                return result.success;
              } else {
                e.reply(`用户 ${qq} 的对话记录不存在`, true);
                return false;
              }
            })
          );

          if (!results.some(success => success)) {
            e.reply("所有操作均失败，请检查权限和文件状态");
          }
        } else {
          if (fs.existsSync(userFilePath)) {
            const result = await sanitizeConversation(userFilePath, userRedisKey);
            if (result.success) {
              e.reply(`用户 ${current_user} 的对话已重置，移除了最新 ${result.count} 条消息`);
            } else {
              e.reply(`重置失败: ${result.error}`, true);
            }
          } else {
            e.reply("当前未存在对话记录", true);
          }
        }
      }
      // 结束群对话
      else if (e.msg.includes("#结束逆向群对话") && e.isMaster && e.group_id) {
        const groupFilePath = path.join(folderPath, `${e.group_id}.json`);
        const groupRedisKey = `YTUSER_reverse:${e.group_id}`;
        if (fs.existsSync(groupFilePath)) {
          const result = await sanitizeConversation(groupFilePath, groupRedisKey);
          if (result.success) {
            e.reply(`群聊 ${e.group_id} 的对话已重置， 移除了最新 ${result.count} 条消息`);
          } else {
            e.reply(`重置群聊对话失败: ${result.error}`, true);
          }
        } else {
          e.reply("当前群未存在对话记录", true);
        }
      }
    } catch (error) {
      console.error("其他结束对话处理时发生错误:", error);
      e.reply("处理过程中发生错误，请检查日志获取详细信息");
    }
  }

  async reverse_change(e) {
    if (!e.isMaster) {
      e.reply("权限不够");
      return;
    }
    try {
      let msg = e.msg.replace(/[^\d]/g, '');
      if (reverse_models[msg - 1]) {
        let modelName = reverse_models[msg - 1].model;
        let dataPath = dirpath + "/data.json";
        let data = JSON.parse(await fs.promises.readFile(dataPath, "utf-8"));
        data.chatgpt.model = modelName;
        await fs.promises.writeFile(dataPath, JSON.stringify(data), "utf-8");
        e.reply(`逆向模型成功切换为${modelName}`, true);
      } else {
        e.reply("指定的模型不存在，请检查序号。");
      }
    } catch (error) {
      console.error("Error in opmodels function: ", error);
      e.reply("处理请求时出错。");
    }
  }

  async reverse_chat(e) {
    await setName();
    const chatgptConfigs = JSON.parse(await fs.promises.readFile(`${dirpath}/data.json`, "utf-8")).chatgpt;
    let group = JSON.parse(await fs.promises.readFile(dirpath + "/data.json", "utf-8")).chatgpt.workshop;
    let { model } = chatgptConfigs;
    let userid = group ? (e.group_id ?? e.user_id) : e.user_id;
    let history = await loadUserHistory(userid, dirpath, 'reverse');
    let all_system = fs.existsSync(`${dirpath}/user_cache/all.json`)
      ? JSON.parse(await fs.promises.readFile(`${dirpath}/user_cache/all.json`, "utf-8"))
      : [];
    const hasSystemRole = all_system.some(item => item.role === "system");
    const HistoryhasSystemRole = history.some(item => item.role === "system");
    if (hasSystemRole && !HistoryhasSystemRole) {
      history = history.filter(item => item.role !== "system");
      history.unshift(...all_system);
    }
    let aiSettingsPath = _path + '/data/YTAi_Setting/data.json';
    let aiSettings = JSON.parse(await fs.promises.readFile(aiSettingsPath, "utf-8"));
    let { fileUrl, fileName: filenames } = await getFileInfo(e);
    let { ai_chat_at, ai_chat, ai_ban_plans, ai_ban_number, ai_ban_group, ai_private_plan, ai_private_open, reverse_netsearch } = aiSettings.chatgpt;

    let invalidWords = JSON.parse(fs.readFileSync(_path + '/data/YTAi_Setting/data.json')).chatgpt.add_words;
    if (!invalidWords) {
      invalidWords = []
    }
    //console.log(invalidWords)
    const isPrivate = e?.isPrivate && ai_private_plan === "reverse" && ai_private_open === true;
    const isAtSelf = e?.at === e?.self_id && ai_chat_at && ai_chat === "reverse";
    const isAtBot = e?.atBot && ai_chat_at && ai_chat === "reverse";
    const isBotMentioned = e?.msg?.startsWith(Bot_Name);
    const containsInvalidWords = !e?.file && e?.msg && invalidWords.some(word => e.msg.includes(word));
    if (((e?.file && isPrivate) || isAtSelf || isAtBot || isBotMentioned || isPrivate) && !containsInvalidWords) {
      let checkban = await checkBanStatus(e, ai_ban_group, ai_ban_plans, ai_ban_number)
      if (checkban == false) {
        return false;
      }
      if (e && e.msg) {
        let ban = await isPluginCommand(e.msg, Bot_Name);
        if (ban === false) {
          return false;
        }
      }
      let msg = e?.msg?.replace(/#nx/g, "")?.replace(new RegExp(Bot_Name, "g"), "")?.trim() || '...';
      let LastMeg = msg;
      const modelInfo = reverse_models.find(m => m.model === model);
      console.log(modelInfo)
      const MaxToken = modelInfo ? modelInfo.token : 8000;
      history = await processArray(history, 10, MaxToken);
      let aiSettingsPath = _path + '/data/YTAi_Setting/data.json';
      let aiSettings = JSON.parse(await fs.promises.readFile(aiSettingsPath, "utf-8"));
      let { prompts_answers, prompts_answer_open } = aiSettings.chatgpt;
      if (prompts_answers && prompts_answer_open) {
        const tips = prompts_answers
        await e.reply(tips, true, { recallMsg: 6 });
      }
      let imgurl = fileUrl ? [fileUrl] : await TakeImages(e);
      console.log(imgurl, filenames);
      if (imgurl && imgurl.length > 0) {
        const isValidModel = fileUrl ? true : reverse_models.find(m => m.model === model)?.features?.includes('image_recognition') || false;

        console.log(isValidModel)
        if (isValidModel) {
          try {
            let imgurls = [{
              "type": "text",
              "text": msg
            }]
            for (let url of imgurl) {
              // 检查当前模型是否支持文件处理
              const modelSupportsFile = reverse_models.find(m => m.model === model)?.features?.includes('file') || false;

              if (!modelSupportsFile && filenames) {
                // 如果模型不支持文件处理，直接使用 processUploadedFile
                imgurls = await processUploadedFile(url, filenames, msg);
              } else {
                // 原有的文件处理逻辑
                const filename = filenames ? filenames : '1.png';
                const type = filenames ? 'file' : 'img';
                const img_urls = await getBase64File(url, filename, type);

                const errorMessages = {
                  "该文件链接已过期，请重新获取": "该图片下载链接已过期，请重新上传",
                  "无效的图片格式": "无效的图片格式，请重新上传",
                  "无效的图片下载链接": "无效的图片下载链接，请确保适配器支持且图片未过期，可重新上传尝试",
                  "无效的文件下载链接": "无效的文件下载链接，请确保适配器支持且文件未过期，可重新上传尝试",
                };

                if (errorMessages[img_urls]) {
                  return e.reply(errorMessages[img_urls]);
                }

                const mimeType = mimeTypes.lookup(filename) || 'application/octet-stream';
                const isImage = mimeType.startsWith('image/');

                imgurls.push(
                  isImage ?
                    {
                      "type": "image_url",
                      "image_url": {
                        url: img_urls
                      }
                    } :
                    {
                      "type": "file",
                      "file_url": {
                        url: img_urls
                      }
                    }
                );
              }
            }
            console.log(imgurls)
            LastMeg = imgurls;
          } catch (error) {
            console.error("Error:", error);
            e.reply("发生错误，请稍后再试!");
            history.pop();
            return false;
          }
        } else {
          e.reply("该模型不支持文件分析，请更换模型!");
          history.pop();
          return false;
        }
      }
      history.push({ role: "user", content: LastMeg });
      console.log(history)
      let result = await getResponse(history, model, e);
      if (!result) {
        e.reply("无有效回复，请稍后再试!");
        history.pop();
        return false;
      }
      result = result.replace(/Content is blocked/gi, '');
      await replyBasedOnStyle(result, e, model, msg);
      const urls = await get_address(result);
      let forwardMsg = [];
      let pictureProcessed = false;

      let styles = aiSettings.chatgpt.ai_chat_style;
      if (styles == "picture") {
        try {
          const results = await extractAndRender(result, {
            outputDir: './resources'
          });
          results.forEach(result => {
            forwardMsg.push(segment.image(result.outputPath));
          });
          pictureProcessed = true;
        } catch (error) {
          console.error(error);
        }
      }

      if (urls.length >= 1) {
        const images = await handleImages(e, urls, _path);
        if (images.length > 0) {
          forwardMsg = [...images, ...forwardMsg];
        }
      }

      if (pictureProcessed || urls.length >= 1) {
        await sendLongMessage(e, result, forwardMsg);
      }
      history.push({ role: "assistant", content: result });
      await saveUserHistory(userid, dirpath, history, 'reverse');
      if (aiSettings.chatgpt.ai_tts_open) {
        const speakers = aiSettings.chatgpt.ai_tts_role;
        console.log(aiSettings.chatgpt.ai_tts_role);
        const roles = Anime_tts_roles(speakers);
        if (roles) {
          await handleTTS(e, roles, result, fetch, _path);
        }
      }
    }
    return false;
  }
}

async function checkBanStatus(e, groupBan, planBan, numberBan) {
  if (groupBan.includes(e.group_id) && !e.isMaster) {
    e.reply("此群AI暂时被bot主人禁用,去找bot主人解封!", true);
    return false;
  }
  if (planBan.includes("reverse") && !e.isMaster) {
    e.reply("此方案暂时被bot主人禁用,去找bot主人解封!", true);
    return false;
  }
  if (numberBan.includes(e.user_id) && !e.isMaster) {
    e.reply("你小子暂时被bot主人禁用ai功能,去找bot主人解封!", true);
    return false;
  }
}

async function setName() {
  if (fs.existsSync(_path + '/data/YTAi_Setting/data.json')) {
    Bot_Name = JSON.parse(fs.readFileSync(_path + '/data/YTAi_Setting/data.json')).chatgpt.ai_name_reverse || "#nx"
  }
}

async function getResponse(history, model, e) {
  const specialCases = new Map([
    [
      () => model.includes("jimeng"),
      async () => {
        e.reply("我开始制作了，稍等哦...");
        try {
          const feature = model.toLowerCase().includes("video") ? "video" : "image";
          const lastHistoryItem = [history[history.length - 1]];
          return await jimengClient(lastHistoryItem, model, feature);
        } catch {
          return '生成失败了，可能提示词违规，请稍后再试！';
        }
      }
    ],
    [
      () => model === 'suno-v4-vip',
      async () => {
        await generateAndSendSong(e, msg);
        return false;
      }
    ]
  ]);
  for (const [condition, handler] of specialCases) {
    if (condition()) return await handler();
  }
  return await NXModelResponse(history, model);
}