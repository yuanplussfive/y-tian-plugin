import { dependencies } from "../YTdependence/dependencies.js";
import { fs_other } from "../YTdependence/fs_other_makes.js";
import { chunk, TakeImages, handleImages, getBase64File, get_address, downloadAndSaveFile, removeDuplicates } from "../utils/fileUtils.js";
import { getFileInfo } from '../utils/fileUtils.js';
import { processUploadedFile } from '../YTOpen-Ai/tools/processUploadedFile.js';
import { SearchMessages } from '../YTOpen-Ai/other_tools/search.js';
import { OpenAiChatCmpletions } from "../YTOpen-Ai/OpenAiChatCmpletions.js";
import { callGeminiAPI, handleGeminiResult, processGeminiResult } from "../YTOpen-Ai/GeminiAPI.js";
import { generateAndSendSong } from "../utils/providers/AudioModels/suno/suno.js";
import { jimengClient } from "../utils/providers/ChatModels/jimeng/jimengClient.js";
const {
  fs,
  fetch,
  path,
  _path,
  common,
  mimeTypes,
  handleTTS,
  OtherModels,
  isPluginCommand,
  replyBasedOnStyle,
  processArray,
  extractAndRender
}
  = dependencies;
const cooldowns = {};
import _ from "lodash"
let Bot_Name;
let dirpath = `${_path}/data/YTotherai`;
async function setName() {
  if (fs.existsSync(_path + '/data/YTAi_Setting/data.json')) {
    Bot_Name = JSON.parse(fs.readFileSync(_path + '/data/YTAi_Setting/data.json')).chatgpt.ai_name_others
  }
}
await setName();
await fs_other(fs, _path);
const models = OtherModels;
let lastExecutionTime = {};

export class OtherAi extends plugin {
  constructor() {
    super({
      name: '阴天[other_ai]',
      dsc: '',
      event: 'message',
      priority: 1,
      rule: [
        {
          reg: "^#查看附加预设$|^#切换附加(群|全局)?预设(.*?)$",
          fnc: 'other_system'
        },
        {
          reg: "^#填写附加(密钥|sk)(.*)",
          fnc: 'other_addsk',
          permission: 'master'
        },
        {
          reg: "^#查询附加额度$",
          fnc: 'other_quota',
        },
        {
          reg: "^#切换附加模型(.*?)",
          fnc: 'other_change',
          permission: 'master'
        },
        {
          reg: "^#结束(全部)?附加(群)?对话$",
          fnc: 'other_endchat'
        },
        {
          reg: "^#清空(全部)?附加(群|全局)?预设$",
          fnc: 'other_endsystem'
        },
        {
          reg: "^#附加(开启|关闭)分区间$",
          fnc: 'other_workshop',
          permission: 'master'
        },
        {
          reg: "^[\s\S]*",
          fnc: 'other_chat',
          log: false
        }
      ]
    })
  }

  async other_addsk(e) {
    const dataPath = `${dirpath}/data.json`;
    const data = JSON.parse(await fs.promises.readFile(dataPath, "utf-8"));
    //const token = data.stoken || 'null';
    const token = e.msg.replace(/#填写附加(密钥|sk)/g, '');
    await e.reply("正在验证密钥正确性，请稍等...");
    try {
      const informs = await UserAuth(token);
      if (informs.error) {
        e.reply(informs.error?.message);
      } else if (informs?.choices[0]?.message?.content) {
        data.chatgpt.stoken = token;
        await fs.promises.writeFile(dataPath, JSON.stringify(data, null, 2), "utf-8");
        e.reply("验证成功，可即刻使用");
      }
    } catch (error) {
      console.error(error);
      e.reply("验证失败" + error.message);
    }
  }

  async other_quota(e) {
    e.reply("为保证安全性，请自行于网站查询对应密钥额度");
  }

  async other_workshop(e) {
    try {
      let dataPath = `${dirpath}/workshop.json`;
      let data = JSON.parse(await fs.promises.readFile(dataPath, "utf-8"));
      if (e.msg.includes("#附加开启分区间")) {
        data.workshop.limit = false;
        e.reply(`附加模型开启分区间,所有对话独立`);
      } else {
        data.workshop.limit = true;
        e.reply(`附加模型已关闭分区间,对话共享`, true);
      }
      await fs.promises.writeFile(dataPath, JSON.stringify(data), "utf-8");
      return true;
    } catch (error) {
      console.error("Error in workshop function: ", error);
      e.reply("更改失败了");
    }
  }

  async other_endsystem(e) {
    try {
      const folderPath = path.join(dirpath, "user_cache");

      // 确保目录存在
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
      if (e.msg.includes("#清空全部附加预设") && e.isMaster) {
        try {
          const files = await fs.promises.readdir(folderPath);
          const results = await Promise.all(
            files.map(async file => {
              const filePath = path.join(folderPath, file);
              const redisKey = `YTUSER_OTHER:${file.replace('.json', '')}`;
              const result = await sanitizeConversation(filePath, redisKey);
              return { file, result };
            })
          );

          const successCount = results.filter(r => r.result.success).length;
          const failCount = results.length - successCount;
          const totalRemoved = results.reduce((sum, r) =>
            sum + (r.result.success ? r.result.count : 0), 0);

          e.reply(`附加预设处理完成:\n成功: ${successCount}个\n失败: ${failCount}个\n共清除: ${totalRemoved}条预设${failCount > 0 ? '\n请检查日志了解详细错误信息' : ''
            }`);
        } catch (err) {
          console.error("处理全部预设时发生错误:", err);
          e.reply("处理全部文件时发生错误");
        }
      }
      // 清空指定用户的预设
      else if (e.msg.includes("#清空附加预设")) {
        let QQ_at = e.message
          .filter(item => item.type === 'at' && item.qq)
          .map(item => item.qq);

        const current_user = e.user_id;
        const userFilePath = path.join(folderPath, `${current_user}.json`);
        const userRedisKey = `YTUSER_OTHER:${current_user}`;

        if (QQ_at.length === 0) {
          QQ_at = [e.user_id];
        }

        if (e.isMaster || (QQ_at.includes(e.user_id) && QQ_at.length === 1)) {
          const results = await Promise.all(
            QQ_at.map(async qq => {
              const userPath = path.join(folderPath, `${qq}.json`);
              const userKey = `YTUSER_OTHER:${qq}`;
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
      else if (e.msg.includes("#清空附加群预设") && e.isMaster && e.group_id) {
        const groupFilePath = path.join(folderPath, `${e.group_id}.json`);
        const groupRedisKey = `YTUSER_OTHER:${e.group_id}`;
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
      else if (e.msg.includes("#清空附加全局预设") && e.isMaster) {
        const globalFilePath = path.join(folderPath, 'all.json');
        const globalRedisKey = `YTAll_OTHER:all`;
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

  async other_system(e) {
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
          const redisKey = targetFile === 'all' ? `YTAll_OTHER:all` : `YTUSER_OTHER:${targetFile}`;
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
      if (e.msg.includes("#查看附加预设")) {
        await processFiles();
      } else if (e.msg.includes("#切换附加预设")) {
        await switchPreset(e.user_id, "成功切换预设");
      } else if (e.msg.includes("#切换附加群预设") && e.group_id && e.isMaster) {
        await switchPreset(e.group_id, "成功切换群预设");
      } else if (e.msg.includes("#切换附加全局预设") && e.isMaster) {
        await switchPreset("all", "成功切换全局预设");
      }
    } catch (error) {
      console.error("其他系统处理时发生错误:", error);
      e.reply(error.message);
    }
  }

  async other_endchat(e) {
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

      // 结束全部附加对话
      if (e.msg.includes("#结束全部附加对话") && e.isMaster) {
        try {
          const files = await fs.promises.readdir(folderPath);
          const results = await Promise.all(
            files.map(async file => {
              const filePath = path.join(folderPath, file);
              const redisKey = `YTUSER_OTHER:${file.replace('.json', '')}`;
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

          e.reply(`附加对话处理完成:\n成功: ${successCount}个\n失败: ${failCount}个${failCount > 0 ? '\n请检查日志了解详细错误信息' : ''
            }\n总共清空 ${totalCount} 个消息`);
        } catch (err) {
          console.error("处理全部对话时发生错误:", err);
          e.reply("处理全部文件时发生错误");
        }
      }
      // 结束指定用户的附加对话
      else if (e.msg.includes("#结束附加对话")) {
        let QQ_at = e.message
          .filter(item => item.type === 'at' && item.qq)
          .map(item => item.qq);

        const current_user = e.user_id;
        const userFilePath = path.join(folderPath, `${current_user}.json`);
        const userRedisKey = `YTUSER_OTHER:${current_user}`;

        if (QQ_at.length === 0) {
          QQ_at = [e.user_id];
        }

        if (e.isMaster || (QQ_at.includes(e.user_id) && QQ_at.length === 1)) {
          const results = await Promise.all(
            QQ_at.map(async qq => {
              const userPath = path.join(folderPath, `${qq}.json`);
              const userKey = `YTUSER_OTHER:${qq}`;
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
      else if (e.msg.includes("#结束附加群对话") && e.isMaster && e.group_id) {
        const groupFilePath = path.join(folderPath, `${e.group_id}.json`);
        const groupRedisKey = `YTUSER_OTHER:${e.group_id}`;
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

  async other_change(e) {
    if (!e.isMaster) {
      e.reply("权限不够");
      return;
    }
    try {
      let msg = e.msg.replace(/[^\d]/g, '');
      if (models[msg - 1]) {
        let modelName = models[msg - 1].model;
        let dataPath = dirpath + "/data.json";
        let data = JSON.parse(await fs.promises.readFile(dataPath, "utf-8"));
        data.chatgpt.model = modelName;
        await fs.promises.writeFile(dataPath, JSON.stringify(data), "utf-8");
        e.reply(`附加模型成功切换为${modelName}`, true);
      } else {
        e.reply("指定的模型不存在，请检查序号。");
      }
    } catch (error) {
      console.error("Error in opmodels function: ", error);
      e.reply("处理请求时出错。");
    }
  }

  async other_chat(e) {
    await setName();
    const chatgptConfigs = JSON.parse(await fs.promises.readFile(`${dirpath}/data.json`, "utf-8")).chatgpt;
    let group = JSON.parse(await fs.promises.readFile(dirpath + "/workshop.json", "utf-8")).workshop.limit;
    let { model } = chatgptConfigs;
    let userid = group ? (e.group_id ?? e.user_id) : e.user_id;
    //console.log(e)
    let history = await loadUserHistory(path, userid, dirpath);
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
    //console.log(source)
    //console.log(filenames)
    let { ai_chat_at, ai_chat, ai_ban_plans, ai_ban_number, ai_ban_group, ai_private_plan, ai_private_open, other_netsearch } = aiSettings.chatgpt;

    let invalidWords = JSON.parse(fs.readFileSync(_path + '/data/YTAi_Setting/data.json')).chatgpt.add_words;
    if (!invalidWords) {
      invalidWords = []
    }
    //console.log(invalidWords)
    const isPrivate = e?.isPrivate && ai_private_plan === "others" && ai_private_open === true;
    const isAtSelf = e?.at === e?.self_id && ai_chat_at && ai_chat === "others";
    const isAtBot = e?.atBot && ai_chat_at && ai_chat === "others";
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
      let msg = e?.msg?.replace(/#bot/g, "")?.replace(new RegExp(Bot_Name, "g"), "")?.trim() || '...';
      //console.log(msg);
      let message = msg;
      const modelInfo = models.find(m => m.model === model);
      console.log(modelInfo)
      const MaxToken = modelInfo && modelInfo.token
        ? (typeof modelInfo.token === 'string' && modelInfo.token.endsWith('k'))
          ? parseInt(modelInfo.token) * 1000
          : parseInt(modelInfo.token)
        : 8000;

      let aiSettingsPath = _path + '/data/YTAi_Setting/data.json';
      let aiSettings = JSON.parse(await fs.promises.readFile(aiSettingsPath, "utf-8"));
      let { prompts_answers, prompts_answer_open, others_moment_numbers, others_moment_open } = aiSettings.chatgpt;
      if (prompts_answers && prompts_answer_open) {
        const tips = prompts_answers
        await e.reply(tips, true, { recallMsg: 6 });
      }
      if (others_moment_open) {
        history = await processArray(history, others_moment_numbers || 10, MaxToken);
      }
      //console.log(e.img)
      let imgurl = fileUrl ? [fileUrl] : await TakeImages(e);
      console.log(imgurl, filenames);
      if (imgurl && imgurl.length > 0) {
        const isValidModel = fileUrl ? true : models.find(m => m.model === model)?.features?.includes('image_recognition') || false;

        console.log(isValidModel)
        if (isValidModel) {
          if (model == 'gemini-2.0-flash-exp-image-generation') {
            const result = await callGeminiAPI(msg, imgurl, {
              model,
              responseModalities: ['TEXT', 'IMAGE'],
              config: {
                temperature: 0.8
              }
            });
            console.log(result);
            return await handleGeminiResult(result, e);
          }
          try {
            let imgurls = [{
              "type": "text",
              "text": message
            }]
            for (let url of imgurl) {
              // 检查当前模型是否支持文件处理
              const modelSupportsFile = models.find(m => m.model === model)?.features?.includes('file') || false;

              if (!modelSupportsFile && filenames) {
                // 如果模型不支持文件处理，直接使用 processUploadedFile
                imgurls = await processUploadedFile(url, filenames, message);
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
            if (model == 'cogvideox') {
              e.reply("排队中，请稍后");
              const videoArray = await YTapi([{ role: 'user', content: imgurls }], model);
              console.log(videoArray);
              if (!videoArray || videoArray.length == 0 || videoArray.includes("错误")) {
                e.reply('生成失败了，上传的图片不支持或当前处于高并发状态，请稍后尝试');
                return false;
              } else {
                e.reply(segment.video(videoArray));
              }
              return false;
            }
            history.push({ role: "user", content: imgurls })

            if (model == 'midjourney-all' || model == 'nijidjourney-create' || model == 'midjourney-create') {
              const cooldownMessage = await checkCooldown(e.user_id);
              if (cooldownMessage) {
                e.reply(cooldownMessage);
                return false;
              }
              e.reply("我开始绘图了，大概需要50s-7min");
              const links = await YTapi([{ role: 'user', content: imgurls }], 'midjourney-all');
              console.log(links);
              const regex = /\(https?:\/\/[^\s)]+\)/g;
              const imageArray = [];
              let match;

              while ((match = regex.exec(links)) !== null) {
                imageArray.push(match[0].slice(1, -1));
              }
              if (imageArray && imageArray.length !== 0) {
                let images = []
                imageArray.forEach(imgurl => {
                  images.push(segment.image(imgurl.trim()));
                })
                e.reply(images);
              } else {
                e.reply('生成失败了，可能负载过高，请稍后再试！');
              }
              return false;
            }

            if (model == 'gemini-2.0-flash-net') {
              const openAIFormat = {
                messages: history
              };
              const result = await callGeminiAPI(openAIFormat, imgurl, {
                model: "gemini-2.0-flash",
                useTools: true,
                tools: [
                  {
                    googleSearch: {}
                  }
                ],
                returnRawResponse: true
              });
              const processedData = await processGeminiResult(result, {
                includeRawOutput: true,
                saveImages: true
              });
              let styles = aiSettings.chatgpt.ai_chat_style;
              await replyBasedOnStyle(processedData, e, model, msg);
              const urls = await get_address(processedData);
              let forwardMsg = []; // 初始化 forwardMsg 数组
              let pictureProcessed = false; // 标记是否处理了 picture

              if (styles == "picture") {
                try {
                  const results = await extractAndRender(processedData, {
                    outputDir: './resources'
                  });
                  results.forEach(result => {
                    forwardMsg.push(segment.image(result.outputPath));
                  });
                  pictureProcessed = true; // 标记为已处理
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

              // 只发送一次消息
              if (pictureProcessed || urls.length >= 1) {
                await sendLongMessage(e, processedData, forwardMsg);
              }
              history.push({ role: "assistant", content: processedData });
              await saveUserHistory(path, userid, dirpath, history);
              return false;
            }

            let result = await YTapi(history, model);

            let links = await get_address(result);
            if (result && links?.length > 0) {
              console.log(links)
              try {
                links = await removeDuplicates(links);
              } catch (error) {
                e.reply(error);
              }
              links.forEach(async (url) => {
                await downloadAndSaveFile(url, filenames, e);
              });
            } else if (!result) {
              e.reply("无有效回复，请稍后再试!");
              return false;
            }
            let styles = aiSettings.chatgpt.ai_chat_style;
            await replyBasedOnStyle(result, e, model, msg);
            const urls = await get_address(result);
            let forwardMsg = []; // 初始化 forwardMsg 数组
            let pictureProcessed = false; // 标记是否处理了 picture

            if (styles == "picture") {
              try {
                const results = await extractAndRender(result, {
                  outputDir: './resources'
                });
                results.forEach(result => {
                  forwardMsg.push(segment.image(result.outputPath));
                });
                pictureProcessed = true; // 标记为已处理
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

            // 只发送一次消息
            if (pictureProcessed || urls.length >= 1) {
              await sendLongMessage(e, result, forwardMsg);
            }
            history.push({ role: "assistant", content: result });
            await saveUserHistory(path, userid, dirpath, history);
            return false;
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
      if (model == 'luma-dream-machine-v2' || model == 'ltx-video') {
        e.reply("排队中，请稍后");
        const videoArray = await YTapi([{ role: 'user', content: msg }], model);
        console.log(videoArray);
        if (!videoArray || videoArray.length == 0) {
          e.reply('生成失败了, 请稍后尝试, 可能存在违禁词');
          return false;
        } else {
          const videoUrls = await get_address(videoArray);
          e.reply(segment.video(videoUrls[0]));
        }
        return false;
      }
      if (model == 'cogvideox') {
        e.reply("排队中，请稍后");
        const videoArray = await YTapi([{ role: 'user', content: msg }], model);
        console.log(videoArray);
        if (!videoArray || videoArray.length == 0) {
          e.reply('生成失败了，可能提示词违规或当前模型高并发，请稍后尝试');
          return false;
        } else {
          e.reply(segment.video(videoArray));
        }
        return false;
      }
      if (model.includes("jimeng")) {
        e.reply("我开始制作了，稍等哦...");
        try {
          const feature = model.toLowerCase().includes("video") ? "video" : "image";
          const jimengArray = await jimengClient([{ role: 'user', content: msg }], model, feature);
          const urls = await get_address(jimengArray);

          if (urls && urls.length !== 0) {
            let media = [];

            urls.forEach(url => {
              url = url.trim();
              if (feature === "video") {
                media.push(segment.video(url));
              } else {
                media.push(segment.image(url));
              }
            });

            e.reply(media);
          } else {
            e.reply('生成失败了，可能提示词违规，请稍后再试！');
          }
        } catch {
          e.reply('生成失败了，可能提示词违规，请稍后再试！');
        }
        return false;
      }
      if (model == 'midjourney-all' || model == 'nijidjourney-create' || model == 'midjourney-create') {
        const cooldownMessage = await checkCooldown(e.user_id);
        if (cooldownMessage) {
          e.reply(cooldownMessage);
          return false;
        }
        e.reply("我开始绘图了，大概需要50s-7min");
        const links = await YTapi([{ role: 'user', content: msg }], 'midjourney-all');
        console.log(links);
        const regex = /\(https?:\/\/[^\s)]+\)/g;
        const imageArray = [];
        let match;

        while ((match = regex.exec(links)) !== null) {
          imageArray.push(match[0].slice(1, -1));
        }
        if (imageArray && imageArray.length !== 0) {
          let images = []
          imageArray.forEach(imgurl => {
            images.push(segment.image(imgurl.trim()));
          })
          e.reply(images);
        } else {
          e.reply('生成失败了，可能负载过高，请稍后再试！');
        }
        return false;
      }
      if (model == 'suno-v4-vip') {
        const now = Date.now();
        const cooldownTime = 300000;

        if (cooldowns.sunoVip && now < cooldowns.sunoVip) {
          const remaining = Math.ceil((cooldowns.sunoVip - now) / 1000);
          await e.reply(`Suno作曲命令正在冷却中，请等待 ${remaining} 秒后再试`);
          return false;
        }
        cooldowns.sunoVip = now + cooldownTime;
        await generateAndSendSong(e, msg);
        return false;
      }
      history.push({ role: "user", content: message });
      if (!modelInfo?.features?.some(feature => ['internet'].includes(feature))) {
        if (other_netsearch) {
          history = await SearchMessages(history);
        }
      }

      if (model == 'gemini-2.0-flash-exp-image-generation') {
        const result = await callGeminiAPI(msg, [], {
          model,
          responseModalities: ['TEXT', 'IMAGE'],
          config: {
            temperature: 0.8
          }
        });
        return await handleGeminiResult(result, e);
      }

      if (model == 'gemini-2.0-flash-net') {
        const openAIFormat = {
          messages: history
        };
        const result = await callGeminiAPI(openAIFormat, [], {
          model: "gemini-2.0-flash",
          useTools: true,
          tools: [
            {
              googleSearch: {}
            }
          ],
          returnRawResponse: true
        });
        const processedData = await processGeminiResult(result, {
          includeRawOutput: true,
          saveImages: true
        });
        let styles = aiSettings.chatgpt.ai_chat_style;
        await replyBasedOnStyle(processedData, e, model, msg);
        const urls = await get_address(processedData);
        let forwardMsg = []; // 初始化 forwardMsg 数组
        let pictureProcessed = false; // 标记是否处理了 picture

        if (styles == "picture") {
          try {
            const results = await extractAndRender(processedData, {
              outputDir: './resources'
            });
            results.forEach(result => {
              forwardMsg.push(segment.image(result.outputPath));
            });
            pictureProcessed = true; // 标记为已处理
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

        // 只发送一次消息
        if (pictureProcessed || urls.length >= 1) {
          await sendLongMessage(e, processedData, forwardMsg);
        }
        history.push({ role: "assistant", content: processedData });
        await saveUserHistory(path, userid, dirpath, history);
        return false;
      }

      //console.log('history', history)
      if (modelInfo?.features?.some(feature => ['drawing', 'image_recognition', 'file'].includes(feature))) {
        let result = await getModelResponse(model, history);

        if (!result) {
          e.reply('无有效回复，请稍后再试!');
          return false;
        }
        try {
          const links = await Promise.resolve(result)
            .then(get_address)
            .then(links => links?.length ? removeDuplicates(links) : [])
            .catch(error => {
              console.error('地址处理错误:', error);
              return [];
            });
          if (links.length) {
            console.log('处理后的链接:', links);
            const CONCURRENT_LIMIT = 3;
            const chunkedLinks = chunk(links, CONCURRENT_LIMIT);
            for (const linkGroup of chunkedLinks) {
              await Promise.allSettled(
                linkGroup.map(url =>
                  Promise.all([
                    downloadAndSaveFile(url, filenames, e).catch(error => {
                      console.error(`文件保存失败 ${url}:`, error);
                      e.reply(`保存失败: ${url}`);
                    })
                  ])
                )
              );
            }
          }
          console.log('所有下载完成');
        } catch (error) {
          console.error('处理过程发生错误:', error);
          e.reply(`处理下载过程发生错误: ${error.message}`);
        }
        await replyBasedOnStyle(result, e, model, msg);
        const urls = await get_address(result);
        let forwardMsg = []; // 初始化 forwardMsg 数组
        let pictureProcessed = false; // 标记是否处理了 picture

        let styles = aiSettings.chatgpt.ai_chat_style;
        if (styles == "picture") {
          try {
            const results = await extractAndRender(result, {
              outputDir: './resources'
            });
            results.forEach(result => {
              forwardMsg.push(segment.image(result.outputPath));
            });
            pictureProcessed = true; // 标记为已处理
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

        // 只发送一次消息
        if (pictureProcessed || urls.length >= 1) {
          await sendLongMessage(e, result, forwardMsg);
        }
        history.push({ role: "assistant", content: result });
        await saveUserHistory(path, userid, dirpath, history);
        if (aiSettings.chatgpt.ai_tts_open) {
          await handleTTS(e, result);
        }
        return false
      }
      //console.log(history)
      let result = await getModelResponse(model, history);
      if (!result) {
        e.reply("无有效回复，请稍后再试!");
        history.pop();
        return false;
      }
      result = result.replace(/Content is blocked/gi, '');
      await replyBasedOnStyle(result, e, model, msg);
      const urls = await get_address(result);
      let forwardMsg = []; // 初始化 forwardMsg 数组
      let pictureProcessed = false; // 标记是否处理了 picture

      let styles = aiSettings.chatgpt.ai_chat_style;
      if (styles == "picture") {
        try {
          const results = await extractAndRender(result, {
            outputDir: './resources'
          });
          results.forEach(result => {
            forwardMsg.push(segment.image(result.outputPath));
          });
          pictureProcessed = true; // 标记为已处理
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

      // 只发送一次消息
      if (pictureProcessed || urls.length >= 1) {
        await sendLongMessage(e, result, forwardMsg);
      }
      history.push({ role: "assistant", content: result });
      await saveUserHistory(path, userid, dirpath, history);
      if (aiSettings.chatgpt.ai_tts_open) {
        await handleTTS(e, result);
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
  if (planBan.includes("others") && !e.isMaster) {
    e.reply("此方案暂时被bot主人禁用,去找bot主人解封!", true);
    return false;
  }
  if (numberBan.includes(e.user_id) && !e.isMaster) {
    e.reply("你小子暂时被bot主人禁用ai功能,去找bot主人解封!", true);
    return false;
  }
}

async function getModelResponse(model, history) {
  return await YTapi(history, model);
}

/**
 * 保存数据到 Redis，并同步保存到本地文件
 * @param {string} redisKey - Redis 的键
 * @param {string} filePath - 本地文件路径
 * @param {Array} data - 要保存的数据
 * @returns {Object} 保存结果
 */
async function saveData(redisKey, filePath, data) {
  const dataJson = JSON.stringify(data, null, 2);
  try {
    // 尝试保存到 Redis
    await redis.set(redisKey, dataJson);
    console.log(`数据已保存到 Redis: ${redisKey}`);
  } catch (redisErr) {
    console.error(`保存数据到 Redis 失败: ${redisErr}`);
  }

  try {
    // 同步保存到本地文件
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    await fs.promises.writeFile(filePath, dataJson, 'utf-8');
    console.log(`数据已保存到本地文件: ${filePath}`);
  } catch (fileErr) {
    console.error(`保存数据到本地文件失败: ${fileErr}`);
  }

  return { success: true };
}

/**
 * 从 Redis 加载数据，如果失败则从本地文件读取
 * @param {string} redisKey - Redis 的键
 * @param {string} filePath - 本地文件路径
 * @returns {Array} 加载的数据
 */
async function loadData(redisKey, filePath) {
  try {
    const data = await redis.get(redisKey);
    if (data) {
      console.log(`从 Redis 加载数据成功: ${redisKey}`);
      return JSON.parse(data);
    } else {
      console.log(`Redis 中没有数据，尝试从本地文件加载: ${filePath}`);
      if (fs.existsSync(filePath)) {
        const fileData = await fs.promises.readFile(filePath, 'utf-8');
        const parsedData = JSON.parse(fileData);
        try {
          // 将本地数据缓存到 Redis
          await redis.set(redisKey, JSON.stringify(parsedData));
          console.log(`将本地数据缓存到 Redis 成功: ${redisKey}`);
        } catch (err) {
          console.error(`将本地数据缓存到 Redis 失败: ${err}`);
        }
        return parsedData;
      } else {
        console.log(`本地文件不存在: ${filePath}`);
        return [];
      }
    }
  } catch (err) {
    console.error(`从 Redis 加载数据失败: ${err}，尝试从本地文件加载`);
    try {
      if (fs.existsSync(filePath)) {
        const fileData = await fs.promises.readFile(filePath, 'utf-8');
        return JSON.parse(fileData);
      } else {
        console.log(`本地文件不存在: ${filePath}`);
        return [];
      }
    } catch (fileErr) {
      console.error(`从本地文件加载数据失败: ${fileErr}`);
      return [];
    }
  }
}

async function checkCooldown(userid) {
  const currentTime = Date.now();
  const cooldownPeriod = 6 * 60 * 1000; // 6分钟，转换为毫秒
  if (!lastExecutionTime[userid]) {
    lastExecutionTime[userid] = 0;
  }
  if (currentTime - lastExecutionTime[userid] < cooldownPeriod) {
    const remainingTime = Math.ceil((cooldownPeriod - (currentTime - lastExecutionTime[userid])) / 1000);
    return `Niji-v6.1 绘图成本过高，用户【${userid}】请等待 ${remainingTime} 秒后再试。`;
  }
  lastExecutionTime[userid] = currentTime;
  return null;
}

/**
 * 加载用户历史记录
 * 优先从 Redis 获取，如果失败则从本地 JSON 文件读取
 * @param {string} userId - 用户 ID
 * @param {string} dirpath - 本地存储目录路径
 * @returns {Array} 用户历史记录数组
 */
async function loadUserHistory(path, userId, dirpath) {
  const redisKey = `YTUSER_OTHER:${userId}`;
  const historyPath = path.join(dirpath, 'user_cache', `${userId}.json`);
  try {
    const data = await redis.get(redisKey);
    if (data) {
      console.log(`从 Redis 加载用户历史成功: ${userId}`);
      return JSON.parse(data);
    } else {
      console.log(`Redis 中没有数据，尝试从本地文件加载: ${historyPath}`);
      if (fs.existsSync(historyPath)) {
        const fileData = fs.readFileSync(historyPath, 'utf-8');
        const parsedData = JSON.parse(fileData);
        try {
          await redis.set(redisKey, JSON.stringify(parsedData));
          console.log(`将本地数据缓存到 Redis 成功: ${userId}`);
        } catch (err) {
          console.error(`将本地数据缓存到 Redis 失败: ${err}`);
        }
        return parsedData;
      } else {
        console.log(`本地文件不存在: ${historyPath}`);
        return [];
      }
    }
  } catch (err) {
    console.error(`从 Redis 加载用户历史失败: ${err}，尝试从本地文件加载`);
    try {
      if (fs.existsSync(historyPath)) {
        const fileData = fs.readFileSync(historyPath, 'utf-8');
        return JSON.parse(fileData);
      } else {
        console.log(`本地文件不存在: ${historyPath}`);
        return [];
      }
    } catch (fileErr) {
      console.error(`从本地文件加载用户历史失败: ${fileErr}`);
      return [];
    }
  }
}

/**
 * 保存用户历史记录
 * 优先保存到 Redis，然后同步保存到本地 JSON 文件
 * 即使 Redis 保存成功，也会同步保存到本地
 * 如果 Redis 保存失败，仍然会保存到本地文件
 * @param {string} userId - 用户 ID
 * @param {string} dirpath - 本地存储目录路径
 * @param {Array} history - 用户历史记录数组
 */
async function saveUserHistory(path, userId, dirpath, history) {
  const redisKey = `YTUSER_OTHER:${userId}`;
  const historyPath = path.join(dirpath, 'user_cache', `${userId}.json`);
  try {
    const lastSystemMessage = history.filter(item => item.role === 'system').pop();
    if (lastSystemMessage) {
      history = history.filter(item => item.role !== 'system');
      history.unshift(lastSystemMessage);
    }
    const historyJson = JSON.stringify(history, null, 2);
    try {
      await redis.set(redisKey, historyJson);
      console.log(`用户历史已保存到 Redis: ${userId}`);
    } catch (redisErr) {
      console.error(`保存用户历史到 Redis 失败: ${redisErr}`);
    }
    const dir = path.dirname(historyPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(historyPath, historyJson, { encoding: 'utf-8' });
    console.log(`用户历史已保存到本地文件: ${historyPath}`);
  } catch (err) {
    console.error(`保存用户历史失败: ${err}`);
  }
}

async function YTapi(messages, model) {
  const dataPath = dirpath + "/data.json";
  const data = JSON.parse(await fs.promises.readFile(dataPath, "utf-8"));
  const token = data.chatgpt.stoken;
  try {
    const url = 'https://yuanplus.cloud/v1/';
    const responseData = await OpenAiChatCmpletions(url, token, model, messages);
    if (responseData.error) {
      return responseData.error;
    }
    console.log(responseData);
    if (responseData?.error) {
      return JSON.stringify(responseData?.error);
    }
    return responseData?.choices[0]?.message?.content;
  } catch (error) {
    console.log(error);
    return error.message;
  }
}

async function UserAuth(token) {
  try {
    const url = 'https://yuanplus.cloud/v1/chat/completions';
    const data = {
      "model": "test-1",
      "stream": false,
      "messages": [
        {
          "role": "user",
          "content": "say 1"
        }
      ]
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    const responseData = await response.json();
    console.log(responseData);
    return responseData;
  } catch (error) {
    console.log(error);
    return null;
  }
}

/**
* 将长文本消息分段添加到转发消息数组
* @param {Object} e 事件对象
* @param {String|Array} messages 要发送的消息
* @param {Number} maxLength 单段最大长度，默认1000字符
*/
async function sendLongMessage(e, messages, forwardMsg, maxLength = 1000) {
  // 如果是字符串，转换为数组处理
  const msgArray = typeof messages === 'string' ? [messages] : messages;

  try {
    // 先尝试直接将所有消息添加到转发消息中
    const directForwardMsg = [...forwardMsg];
    msgArray.forEach(msg => directForwardMsg.push(msg));

    // 尝试一次性发送所有消息
    const jsonPart = await common.makeForwardMsg(e, directForwardMsg, 'Preview');
    await e.reply(jsonPart);
    logger.info('消息已成功一次性发送');

  } catch (error) {
    logger.warn(`一次性发送失败，将尝试分段发送: ${error.message}`);

    try {
      // 创建新的转发消息数组
      const segmentedForwardMsg = [...forwardMsg];

      // 对每条消息进行处理
      for (let msg of msgArray) {
        if (typeof msg === 'string' && msg.length > maxLength) {
          // 计算需要分成几段
          const segmentCount = Math.ceil(msg.length / maxLength);
          logger.info(`消息长度为${msg.length}，将分为${segmentCount}段发送`);

          // 分段处理文本
          for (let i = 0; i < segmentCount; i++) {
            const start = i * maxLength;
            const end = Math.min(start + maxLength, msg.length);
            const segment = msg.substring(start, end);

            if (segment.trim()) {
              segmentedForwardMsg.push(segment);
            }
          }
        } else {
          segmentedForwardMsg.push(msg);
        }
      }

      // 生成转发消息并发送
      const jsonPart = await common.makeForwardMsg(e, segmentedForwardMsg, 'Preview');
      await e.reply(jsonPart);
      logger.info('消息已成功分段发送');

    } catch (secondError) {
      logger.error(`分段发送也失败了: ${secondError.message}`);
      await e.reply('消息发送失败，请稍后重试');
    }
  }
}