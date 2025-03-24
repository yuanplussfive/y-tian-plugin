import { JinyanTool } from '../YTOpen-Ai/functions_tools/JinyanTool.js';
import { DalleTool } from '../YTOpen-Ai/functions_tools/DalleTool.js';
import { JimengTool } from '../YTOpen-Ai/functions_tools/jimengTool.js';
import { FreeSearchTool } from '../YTOpen-Ai/functions_tools/SearchInformationTool.js';
import { SearchVideoTool } from '../YTOpen-Ai/functions_tools/SearchVideoTool.js';
import { SearchMusicTool } from '../YTOpen-Ai/functions_tools/SearchMusicTool.js';
import { AiALLTool } from '../YTOpen-Ai/functions_tools/AiALLTool.js';
import { EmojiSearchTool } from '../YTOpen-Ai/functions_tools/EmojiSearchTool.js';
import { loadData, saveData } from '../utils/redisClient.js';
import { BingImageSearchTool } from '../YTOpen-Ai/functions_tools/BingImageSearchTool.js';
import { OpenAiImageAnalysisTool } from '../YTOpen-Ai/functions_tools/OpenAiImageAnalysisTool.js';
import { GoogleImageAnalysisTool } from '../YTOpen-Ai/functions_tools/GoogleAnalysisTool.js';
import { ChatHistoryTool } from '../YTOpen-Ai/functions_tools/ChatHistoryTool.js';
import { PokeTool } from '../YTOpen-Ai/functions_tools/PokeTool.js';
import { LikeTool } from '../YTOpen-Ai/functions_tools/LikeTool.js';
import { AiMindMapTool } from '../YTOpen-Ai/functions_tools/AiMindMapTool.js';
import { AiPPTTool } from '../YTOpen-Ai/functions_tools/AiPPTTool.js';
import { FluxTool } from '../YTOpen-Ai/functions_tools/FluxTool.js';
import { RecraftTool } from '../YTOpen-Ai/functions_tools/RecraftTool.js';
import { IdeogramTool } from '../YTOpen-Ai/functions_tools/IdeogramTool.js';
import { NoobaiTool } from '../YTOpen-Ai/functions_tools/NoobaiTool.js';
import { WebParserTool } from '../YTOpen-Ai/functions_tools/webParserTool.js';
import { TakeImages, get_address } from '../utils/fileUtils.js';
import { YTapi } from '../utils/apiClient.js';
import { MessageManager } from '../utils/MessageManager.js';
import { dependencies } from '../YTdependence/dependencies.js';
import { ThinkingProcessor } from '../utils/providers/ThinkingProcessor.js';
import { TotalTokens } from '../YTOpen-Ai/tools/CalculateToken.js';
const { fs, YAML, path } = dependencies;
import { randomUUID } from 'crypto';

/**
 * 示例插件类
 */
export class ExamplePlugin extends plugin {
  constructor() {
    super({
      name: '全局方案-test',
      dsc: '全局方案测试版',
      event: 'message',
      priority: -111111111,
      rule: [
        {
          reg: "^#tool\\s*(.*)",
          fnc: 'handleTool'
        },
        {
          reg: "^#clear_history\\s*(\\d+)?",
          fnc: 'clearHistory'
        },
        {
          reg: "^#reset_history\\s*(\\d+)?",
          fnc: 'resetHistory'
        },
        {
          reg: "[\\s\\S]*",
          fnc: 'handleRandomReply',
          log: false  // 不记录日志避免刷屏
        }
      ]
    });

    this.initConfig();
    this.sessionMap = new Map(); // 会话状态存储
    this.messageManager = new MessageManager();
    // 初始化各个工具实例
    this.jinyanTool = new JinyanTool();
    this.dalleTool = new DalleTool();
    this.freeSearchTool = new FreeSearchTool();
    this.searchVideoTool = new SearchVideoTool(); // 新增 SearchVideo 工具
    this.searchMusicTool = new SearchMusicTool(); // 新增 SearchMusic 工具
    this.aiALLTool = new AiALLTool(); // 新增 AiALL 工具
    this.emojiSearchTool = new EmojiSearchTool(); // 新增 EmojiSearch 工具
    this.bingImageSearchTool = new BingImageSearchTool(); // 新增 BingImageSearch 工具
    this.OpenAiimageAnalysisTool = new OpenAiImageAnalysisTool();
    this.googleImageAnalysisTool = new GoogleImageAnalysisTool();
    this.pokeTool = new PokeTool();
    this.likeTool = new LikeTool();
    this.chatHistoryTool = new ChatHistoryTool();
    this.jimengTool = new JimengTool();
    this.aiMindMapTool = new AiMindMapTool();
    this.aiPPTTool = new AiPPTTool();
    this.webParserTool = new WebParserTool();
    this.fluxTool = new FluxTool();
    this.ideogramTool = new IdeogramTool();
    this.recraftTool = new RecraftTool();
    this.noobaiTool = new NoobaiTool();
    // 工具定义部分
    this.functions = [
      {
        name: this.noobaiTool.name,
        description: this.noobaiTool.description,
        parameters: this.noobaiTool.parameters
      },
      {
        name: this.recraftTool.name,
        description: this.recraftTool.description,
        parameters: this.recraftTool.parameters
      },
      {
        name: this.ideogramTool.name,
        description: this.ideogramTool.description,
        parameters: this.ideogramTool.parameters
      },
      {
        name: this.fluxTool.name,
        description: this.fluxTool.description,
        parameters: this.fluxTool.parameters
      },
      {
        name: this.webParserTool.name,
        description: this.webParserTool.description,
        parameters: this.webParserTool.parameters
      },
      {
        name: this.aiPPTTool.name,
        description: this.aiPPTTool.description,
        parameters: this.aiPPTTool.parameters
      },
      {
        name: this.aiMindMapTool.name,
        description: this.aiMindMapTool.description,
        parameters: this.aiMindMapTool.parameters
      },
      {
        name: this.jimengTool.name,
        description: this.jimengTool.description,
        parameters: this.jimengTool.parameters
      },
      {
        name: this.jinyanTool.name,
        description: this.jinyanTool.description,
        parameters: this.jinyanTool.parameters
      },
      {
        name: this.dalleTool.name,
        description: this.dalleTool.description,
        parameters: this.dalleTool.parameters
      },
      {
        name: this.freeSearchTool.name,
        description: this.freeSearchTool.description,
        parameters: this.freeSearchTool.parameters
      },
      {
        name: this.searchVideoTool.name,
        description: this.searchVideoTool.description,
        parameters: this.searchVideoTool.parameters
      },
      {
        name: this.searchMusicTool.name,
        description: this.searchMusicTool.description,
        parameters: this.searchMusicTool.parameters
      },
      {
        name: this.aiALLTool.name,
        description: this.aiALLTool.description,
        parameters: this.aiALLTool.parameters
      },
      {
        name: this.emojiSearchTool.name,
        description: this.emojiSearchTool.description,
        parameters: this.emojiSearchTool.parameters
      },
      {
        name: this.bingImageSearchTool.name,
        description: this.bingImageSearchTool.description,
        parameters: this.bingImageSearchTool.parameters
      },
      {
        name: this.OpenAiimageAnalysisTool.name,
        description: this.OpenAiimageAnalysisTool.description,
        parameters: this.OpenAiimageAnalysisTool.parameters
      },
      {
        name: this.googleImageAnalysisTool.name,
        description: this.googleImageAnalysisTool.description,
        parameters: this.googleImageAnalysisTool.parameters
      },
      {
        name: this.pokeTool.name,
        description: this.pokeTool.description,
        parameters: this.pokeTool.parameters
      },
      {
        name: this.likeTool.name,
        description: this.likeTool.description,
        parameters: this.likeTool.parameters
      }
    ];

    this.functionMap = new Map(this.functions.map(func => [func.name, func]));


    // 根据名称选择要使用的函数，并转换为 OpenAI tools 格式
    this.getToolsByName = function (toolNames) {
      const selectedTools = toolNames.map(toolName => {
        const func = this.functionMap.get(toolName);
        if (!func) {
          console.warn(`Tool with name "${toolName}" not found.`);
          return null;
        }
        return {
          type: 'function',
          function: {
            name: func.name,
            description: func.description,
            parameters: {
              type: 'object',
              properties: func.parameters.properties,
              required: func.parameters.required || []
            }
          }
        };
      }).filter(Boolean);
      return selectedTools;
    };

    const provider = this.config.providers.toLowerCase();
    const toolConfig = {
      gemini: this.config.gemini_tools,
      openai: this.config.openai_tools,
      oneapi: this.config.oneapi_tools,
    };

    this.tools = this.getToolsByName(toolConfig[provider] || this.config.openai_tools);

    // 初始化消息历史管理，使用 Redis 和本地文件
    this.messageHistoriesRedisKey = 'group_user_message_history'; // Redis 中存储消息历史的键前缀，包含群组和用户
    this.messageHistoriesDir = path.join(process.cwd(), 'data/YTtools/user_history'); // 本地文件存储路径
    this.MAX_HISTORY = 20; // 限制每个用户的消息历史长度

    // 确保历史记录目录存在
    if (!fs.existsSync(this.messageHistoriesDir)) {
      fs.mkdirSync(this.messageHistoriesDir, { recursive: true });
    }
  }

  /**
  * 获取或创建会话
  * @param {string} sessionId - 会话 ID
  * @returns {Object} 会话对象
  */
  getOrCreateSession(sessionId, tools) {
    if (!this.sessionMap.has(sessionId)) {
      this.sessionMap.set(sessionId, {
        tools: tools,
        groupUserMessages: [],
      });
    }
    return this.sessionMap.get(sessionId);
  }

  /**
   * 清理会话
   * @param {string} sessionId - 会话 ID
   */
  clearSession(sessionId) {
    this.sessionMap.delete(sessionId);
  }

  initConfig() {
    // 默认配置
    const defaultConfig = {
      pluginSettings: {
        enabled: false,
        groupHistory: true,
        UseTools: true,
        replyChance: 0.015,
        triggerPrefixes: ['芙宁娜', '芙芙'],
        excludeMessageTypes: ['file', 'video'],
        allowedGroups: [782312429],
        enableGroupWhitelist: true,
        whitelistRejectMsg: '本群未开启此功能哦~',
        providers: 'OpenAi',
        geminiApikey: ['AIzaxxxxxxx'],
        systemContent: `你是QQ群里一个叫"${Bot.nickname}"的普通群友。在群里要表现得自然随意，像真实的群友一样积极参与讨论和互动。要认真阅读群友的发言和聊天记录，理解当前话题和氛围，给出符合语境的回应。说话要简短自然，用中文交流，不要太正式或机械化。当话题涉及图片、视频、音乐等媒体内容时，必须通过调用对应工具来实现，不能用文字敷衍。如果一时不知道说什么，可以跟随群友的话题，但要避免简单复读他们的原话。记住你就是群里的普通成员，不要解释自己是AI或机器人，也不要过分活跃或表现得太特别。要像人类一样自然地融入群聊氛围，既不过分热情也不过分冷淡，保持适度的参与感。遇到不懂或不确定的话题，可以委婉表示不了解，或者转换话题，不要强行回应。注意避免重复已说过的内容，也不要使用过于夸张或做作的语气。`,
        ForcedDrawingMode: true,
        bilibiliSessData: 'a16804xxxxxx',
        jimengsessionid: '12345xxxxxx',
        geminiModel: 'gemini-2.0-flash-exp',
        gemini_tool_choice: 'auto',
        OneApiUrl: 'https://chutes-deepseek-ai-deepseek-r1.chutes.ai',
        OneApiModel: 'deepseek-ai/DeepSeek-R1',
        OneApiKey: ['cpk_8f29ba06571f4a3a9f8543f8e2eafa9b.cf973b9dc97952c0bb0b8f6ee6f9340d.e5YL7A2Sw20BBPdEg2ntoWdsQXNCBSWm'],
        openai_tool_choice: 'auto',
        gemini_tools: ['OpenAiimageAnalysisTool', 'googleImageAnalysisTool', 'bingImageSearchTool', 'emojiSearchTool', 'searchMusicTool', 'searchVideoTool', 'jimengTool', 'webParserTool', 'dalleTool', 'fluxTool', 'ideogramTool', 'recraftTool', 'freeSearchTool'],
        openai_tools: ['likeTool', 'pokeTool', 'googleImageAnalysisTool', 'OpenAiimageAnalysisTool', 'bingImageSearchTool', 'emojiSearchTool', 'aiALLTool', 'searchMusicTool', 'searchVideoTool', 'jimengTool', 'aiMindMapTool', 'aiPPTTool', 'jinyanTool', 'webParserTool', 'dalleTool', 'fluxTool', 'ideogramTool', 'recraftTool', 'freeSearchTool'],
        oneapi_tools: ['likeTool', 'pokeTool', 'googleImageAnalysisTool', 'OpenAiimageAnalysisTool', 'bingImageSearchTool', 'emojiSearchTool', 'aiALLTool', 'searchMusicTool', 'searchVideoTool', 'jimengTool', 'aiMindMapTool', 'aiPPTTool', 'jinyanTool', 'webParserTool', 'dalleTool', 'fluxTool', 'ideogramTool', 'recraftTool', 'freeSearchTool'],
        GrokUrl: 'https://grok33.deno.dev/v1/chat/completions',
        GrokSso: ['123456xxx'],
        CursorUrl: 'https://yuanplus.chat:2443/v1/chat/completions',
        WorkosCursorSessionToken: ['user_xxxx'],
        OpenAiProxy: 'https://openai.yuanplus.chat/v1/chat/completions',
        OpenAiAuthToken: 'sk-y-tian-plugin',
        GeminiProxyList: [
          'https://api-proxy.me/gemini',
          'https://gemini-proxy-1.deno.dev',
          'https://gemini-proxy-2.deno.dev',
          'https://gemini-proxy-3.deno.dev',
        ],
        VegaStoken: 'uuid',
        ClashProxy: 'http://127.0.0.1:7890'
      }
    }

    const configPath = path.join(process.cwd(), 'plugins/y-tian-plugin/config/message.yaml')

    try {
      let config;
      if (fs.existsSync(configPath)) {
        const file = fs.readFileSync(configPath, 'utf8')
        config = YAML.parse(file)

        // 递归合并配置
        const mergedConfig = this.mergeConfig(defaultConfig, config)

        // 如果发生了配置合并，将完整配置写回文件
        if (JSON.stringify(config) !== JSON.stringify(mergedConfig)) {
          fs.writeFileSync(configPath, YAML.stringify(mergedConfig))
        }

        this.config = mergedConfig.pluginSettings
      } else {
        // 创建默认配置文件
        const configDir = path.dirname(configPath)
        if (!fs.existsSync(configDir)) {
          fs.mkdirSync(configDir, { recursive: true })
        }
        config = defaultConfig
        fs.writeFileSync(configPath, YAML.stringify(config))
      }

      // 应用配置
      this.config = config.pluginSettings

    } catch (err) {
      logger.error(`[群管工具] 加载配置文件失败: ${err}`)
      // 使用默认配置
      this.config = defaultConfig.pluginSettings
    }
  }

  // 新增递归合并配置的方法
  mergeConfig(defaultConfig, userConfig) {
    const merged = { ...defaultConfig }

    for (const key in defaultConfig) {
      if (typeof defaultConfig[key] === 'object' && !Array.isArray(defaultConfig[key])) {
        // 如果是对象，递归合并
        merged[key] = this.mergeConfig(
          defaultConfig[key],
          userConfig?.[key] || {}
        )
      } else {
        // 如果不是对象，优先使用用户配置，否则使用默认值
        merged[key] = userConfig?.[key] ?? defaultConfig[key]
      }
    }

    return merged
  }

  /**
 * 检查群聊权限
 * @param {Object} e - 事件对象
 * @returns {boolean}
 */
  checkGroupPermission(e) {
    // 如果未启用白名单，则都允许
    if (!this.config.enableGroupWhitelist) {
      return true;
    }

    // 检查是否在允许的群聊列表中
    return this.config.allowedGroups.includes(Number(e.group_id));
  }
  /**
   * 获取群组中指定用户的消息历史
   * @param {number|string} groupId - 群组ID
   * @param {number|string} userId - 用户ID
   * @returns {Promise<Array>} - 消息历史数组
   */
  async getGroupUserMessages(groupId, userId) {
    const redisKey = `${this.messageHistoriesRedisKey}:${groupId}:${userId}`;
    const filePath = path.join(this.messageHistoriesDir, `${groupId}_${userId}.json`);
    try {
      const [redisData, fileData] = await Promise.all([
        loadData(redisKey, null), // 仅加载 Redis 数据
        fs.promises.readFile(filePath, 'utf-8').catch(() => null) // 尝试读取文件，如果失败返回 null
      ]);

      if (redisData) {
        return redisData;
      } else if (fileData) {
        const parsedData = JSON.parse(fileData);
        // 同步 Redis 和文件数据
        await saveData(redisKey, filePath, parsedData);
        return parsedData;
      } else {
        return [];
      }
    } catch (error) {
      console.error(`获取群组 ${groupId} 中用户 ${userId} 的消息历史失败:`, error);
      return [];
    }
  }

  /**
   * 保存群组中指定用户的消息历史
   * @param {number|string} groupId - 群组ID
   * @param {number|string} userId - 用户ID
   * @param {Array} messages - 消息历史数组
   * @returns {Promise<void>}
   */
  async saveGroupUserMessages(groupId, userId, messages) {
    const redisKey = `${this.messageHistoriesRedisKey}:${groupId}:${userId}`;
    const filePath = path.join(this.messageHistoriesDir, `${groupId}_${userId}.json`);
    try {
      await Promise.all([
        saveData(redisKey, filePath, messages),
        fs.promises.writeFile(filePath, JSON.stringify(messages, null, 2), 'utf-8')
      ]);
    } catch (error) {
      console.error(`保存群组 ${groupId} 中用户 ${userId} 的消息历史失败:`, error);
    }
  }

  /**
   * 清除群组中指定用户的消息历史
   * @param {number|string} groupId - 群组ID
   * @param {number|string} userId - 用户ID
   * @returns {Promise<void>}
   */
  async clearGroupUserMessages(groupId, userId) {
    const redisKey = `${this.messageHistoriesRedisKey}:${groupId}:${userId}`;
    const filePath = path.join(this.messageHistoriesDir, `${groupId}_${userId}.json`);
    try {
      await Promise.all([
        redis.del(redisKey),
        fs.promises.unlink(filePath).catch(() => { /* 文件不存在时忽略错误 */ })
      ]);
      console.log(`已清除群组 ${groupId} 中用户 ${userId} 的消息历史。`);
    } catch (error) {
      console.error(`清除群组 ${groupId} 中用户 ${userId} 的消息历史失败:`, error);
    }
  }

  /**
   * 重置群组中指定用户的消息历史
   * @param {number|string} groupId - 群组ID
   * @param {number|string} userId - 用户ID
   * @returns {Promise<void>}
   */
  async resetGroupUserMessages(groupId, userId) {
    await this.clearGroupUserMessages(groupId, userId);
    await this.saveGroupUserMessages(groupId, userId, []);
    console.log(`已重置群组 ${groupId} 中用户 ${userId} 的消息历史。`);
  }

  /**
   * 获取群组的聊天记录
   * @param {Object} e - 事件对象
   * @param {number} num - 获取的消息数量
   * @returns {Promise<Array>} - 聊天记录数组
   */
  async getChatHistoryGroup(e, num) {
    try {
      const latestChats = await e.group.getChatHistory(0, 1);
      if (latestChats.length === 0) return [];

      let latestChat = latestChats[0];
      let seq = latestChat.seq || latestChat.message_id;
      let chats = [];

      while (chats.length < num) {
        const chatHistory = await e.group.getChatHistory(seq, 20);
        if (!chatHistory || chatHistory.length === 0) break;

        chats.push(...chatHistory);
        if (seq === (chatHistory[0].seq || chatHistory[0].message_id)) break;

        seq = chatHistory[0].seq || chatHistory[0].message_id;
      }

      chats = chats.slice(0, num);

      const mm = await e.bot.gml;
      await Promise.all(chats.map(async (chat) => {
        if (e.adapter === 'shamrock') {
          if (chat.sender?.user_id === 0) return;
          const sender = await pickMemberAsync(e, chat.sender.user_id);
          if (sender) chat.sender = sender;
        } else {
          const sender = mm.get(chat.sender.user_id);
          if (sender) chat.sender = sender;
        }
      }));

      return chats;
    } catch (error) {
      console.error(`获取群组 ${e.group_id} 的聊天记录失败:`, error);
      return [];
    }
  }

  // 添加新的辅助方法
  checkTriggers(e) {
    try {
      // 检查 e.msg 是否存在且为字符串
      const hasMessageTrigger = e.msg && typeof e.msg === 'string' &&
        this.config.triggerPrefixes.some(prefix =>
          prefix && e.msg.toLowerCase().includes(prefix.toLowerCase())
        );

      // 检查 at 触发
      const hasAtTrigger = Array.isArray(e.message) &&
        e.message.some(msg =>
          msg?.type === 'at' && msg?.qq === Bot.uin
        );

      return hasAtTrigger || hasMessageTrigger;
    } catch (err) {
      logger.error(`[群管工具][checkTriggers] 检查触发条件时出错: ${err}`);
      return false;
    }
  }

  isCommand(e) {
    try {
      return e.msg && typeof e.msg === 'string' && e.msg.startsWith('#');
    } catch (err) {
      logger.error(`[群管工具][isCommand] 检查命令时出错: ${err}`);
      return false;
    }
  }

  /**
 * 处理随机回复
 * @param {Object} e - 事件对象
 * @returns {Promise<boolean>}
 */
  async handleRandomReply(e) {
    //console.log(e)
    if (!this.config.enabled) return false;
    if (!this.checkGroupPermission(e)) {
      return false;
    }

    // 安全地检查命令消息
    if (this.isCommand(e)) {
      return false;
    }

    // 检查是否是群消息
    if (!e.group_id) {
      return false;
    }

    // 更安全的消息类型检查
    const messageTypes = e.message?.map(msg => msg.type) || [];
    if (this.config.excludeMessageTypes.some(type => messageTypes.includes(type))) {
      return false;
    }

    // 更安全的触发前缀检查
    const hasTriggerPrefix = this.checkTriggers(e);


    // 如果没有触发前缀，则使用随机概率
    if (!hasTriggerPrefix) {
      if (Math.random() > this.config.replyChance) {
        return false;
      }
    }

    return await this.handleTool(e);
  }

  /**
   * 处理工具命令
   * @param {Object} e - 事件对象
   * @returns {Promise<boolean>}
   */
  async handleTool(e) {
    if (!this.config.enabled) return false;
    if (!e.group_id) {
      await e.reply('该命令只能在群聊中使用。');
      return false;
    }

    const groupId = e.group_id;
    const userId = e.user_id;
    const sessionId = randomUUID(); // 使用 crypto.randomUUID() 生成唯一会话 ID
    e.sessionId = sessionId; // 将 sessionId 附加到事件对象

    const session = this.getOrCreateSession(sessionId, this.tools);

    try {
      // 构建发送者信息对象
      const { sender, group_id, msg } = e;
      const args = msg ? msg.replace(/^#tool\s*/, '').trim() : '';
      const roleMap = {
        owner: 'owner',
        admin: 'admin',
        member: 'member'
      };

      // 获取群组中指定用户的消息历史（基于会话隔离）
      let groupUserMessages = session.groupUserMessages;

      let memberInfo = {};
      try {
        memberInfo = group_id ? await e.bot.pickGroup(group_id).pickMember(sender.user_id).info : {};
      } catch (error) {
        console.error(`获取成员信息失败: ${error}`);
      }
      const { role: senderRole } = memberInfo || {};

      let userContent = '';
      const atQq = e.message
        .filter(item => item.type === 'at' && item.qq !== Bot.uin)
        .map(item => item.qq);
      const images = await TakeImages(e);
      console.log(images);

      // 格式化时间的辅助函数
      const formatMessageTime = () => {
        const now = new Date();
        const pad = (num) => String(num).padStart(2, '0');
        return `[${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}]`;
      };

      // 构建消息内容
      const buildMessageContent = async (sender, msg, images, atQq = [], group) => {
        const timeStr = formatMessageTime();
        const senderRole = roleMap[sender.role] || 'member';
        const senderInfo = `${sender.card || sender.nickname}(qq号: ${sender.user_id})[群身份: ${senderRole}]`;

        let atContent = '';
        if (atQq.length > 0) {
          const memberMap = await group.getMemberMap();
          const atUsers = atQq.map(qq => {
            const memberInfo = memberMap.get(Number(qq));
            if (!memberInfo) return `未知用户(qq号: ${qq})`;
            const role = roleMap[memberInfo.role] || 'member';
            return `${memberInfo.card || memberInfo.nickname}(qq号: ${qq})[群身份: ${role}]`;
          });
          atContent = `艾特了 ${atUsers.join('、')}，`;
        }

        let content = [];
        if (msg) {
          content.push(`在群里说: ${msg}`);
        }
        if (images && images.length > 0) {
          const imageText = images.length === 1 ? '发送了一张图片' : `发送了 ${images.length} 张图片`;
          const imageLinks = images.map(img => `\n![图片](${img})`).join('');
          content.push(`${imageText}${imageLinks}`);
        }

        return `${timeStr} ${senderInfo}: ${atContent}${content.join('，')}`;
      };

      if (e.group_id) {
        userContent = await buildMessageContent(sender, args, images, atQq, e.group);
      }
      //console.log(userContent);

      let targetRole = 'member';
      if (atQq.length > 0) {
        const targetUserId = atQq[0];
        try {
          const memberMap = await e.bot.pickGroup(groupId).getMemberMap();
          const memberInfo = memberMap.get(Number(targetUserId));
          targetRole = roleMap[memberInfo.role] || 'member';
        } catch (error) {
          console.error(`获取目标成员信息失败: ${error}`);
        }
      }

      const getHighLevelMembers = async (group) => {
        const memberMap = await group.getMemberMap();
        return Array.from(memberMap.values())
          .filter(member => ['admin', 'owner'].includes(member.role))
          .map(member => `${member.nickname}(QQ号: ${member.user_id})[群身份: ${roleMap[member.role]}]`)
          .join('\n');
      };

      const systemContent = `${this.config.systemContent}\n\n群管理概括一览:\n${await getHighLevelMembers(e.group)}\n\n注意: 从现在起，你的回复严格遵循 '[MM-DD HH:MM:SS] 昵称(QQ号: xxx)[群身份: xxx]: 在群里说: 你好'`;
      //console.log(systemContent);

      const getHistory = async () => {
        const chatHistory = await this.messageManager.getMessages(
          e.message_type,
          e.message_type === 'group' ? e.group_id : e.user_id
        );

        if (!chatHistory || chatHistory.length === 0) {
          return [];
        }

        const memberMap = await e.bot.pickGroup(groupId).getMemberMap();
        const formattedHistory = await Promise.all(chatHistory.reverse().map(async msg => {
          const isSenderBot = msg.sender.user_id === e.bot.uin;
          const senderRole = isSenderBot
            ? (roleMap[memberMap.get(e.bot.uin)?.role] ?? roleMap[msg.sender.role] ?? 'member')
            : (roleMap[msg.sender.role] ?? 'member');
          const senderInfo = `${msg.sender.nickname}(QQ号:${msg.sender.user_id})[群身份: ${senderRole}]`;
          return {
            role: msg.sender.user_id === Bot.uin ? 'assistant' : 'user',
            content: `[${msg.time}] ${senderInfo}: ${msg.content}`
          };
        }));

        let botRole = 'member';
        try {
          const botMemberInfo = memberMap.get(Bot.uin);
          botRole = roleMap[botMemberInfo?.role] || 'member';
        } catch (error) {
          console.error(`获取bot群角色失败: ${error}`);
        }

        const lastMessage = await buildMessageContent(
          { nickname: Bot.nickname, user_id: Bot.uin, role: botRole },
          `我已经读取了上述群聊的聊天记录, 我会优先关注你的最新消息, 我的回复格式会严格按照上述群聊历史记录的格式, 严格遵循 '[MM-DD HH:MM:SS] 昵称(QQ号: xxx)[群身份: xxx]: 在群里说: xxx'的格式`,
          [],
          [],
          e.group
        );

        return [
          ...formattedHistory,
          { role: 'assistant', content: lastMessage }
        ];
      };

      if (this.config.groupHistory) {
        groupUserMessages = await getHistory();
      }

      groupUserMessages = groupUserMessages.filter(msg => msg.role !== 'system');
      groupUserMessages.unshift({ role: 'system', content: systemContent });
      groupUserMessages.push({ role: 'user', content: userContent });

      groupUserMessages = this.trimMessageHistory(groupUserMessages);
      session.groupUserMessages = groupUserMessages;
      await this.saveGroupUserMessages(groupId, userId, groupUserMessages);

      const imageCount = images?.length;
      let tool_choice = "auto";
      if (imageCount >= 1) {
        let fixedToolName = null;
        session.tools = this.getToolsByName(['googleImageAnalysisTool']);
        if (session.tools && session.tools.length > 0) {
          fixedToolName = 'googleImageAnalysisTool';
        } else {
          session.tools = this.getToolsByName(['OpenAiImageAnalysisTool']);
          if (session.tools && session.tools.length > 0) {
            fixedToolName = 'OpenAiImageAnalysisTool';
          }
        }
        tool_choice = fixedToolName ? { type: 'function', function: { name: fixedToolName } } : "auto";
      }

      if(this.config.ForcedDrawingMode) {
      const toolConfigs = [
        { name: 'noobaiTool', keyword: 'noob' },
        { name: 'recraftTool', keyword: 'recraft' },
        { name: 'ideogramTool', keyword: 'ideogram' },
        { name: 'fluxTool', keyword: 'flux' },
        { name: 'jimengTool', keyword: 'jimeng' }
      ];

      const drawingRegex = /绘(?:[图制作]|.*个)|画(?:[图个张幅]|.*个)|制图|生成[图片图像]|创建图[表形]|做(?:[个一张]图|.*个)|作(?:[个一张]图|.*个)/i;
      const isDrawingRequest = drawingRegex.test(msg);
      console.log(4, isDrawingRequest)
      if (isDrawingRequest) {
        toolConfigs.some(config => {
          if (msg.includes(config.keyword)) {
            session.tools = this.getToolsByName([config.name]);
            console.log(`工具 ${config.name} 的 session.tools: `, session.tools);
            if (session.tools && session.tools.length > 0) {
              tool_choice = { type: 'function', function: { name: config.name } };
              return true;
            }
          }
          return false;
        });
      }
    }

      console.log(tool_choice);
      const requestData = {
        model: 'gpt-4o-fc',
        messages: groupUserMessages,
        temperature: 1,
        top_p: 0.1,
        frequency_penalty: 0.8,
        presence_penalty: 0.2,
        ...(this.config.UseTools && { tools: session.tools, tool_choice }),
      };

      //console.log(requestData);
      if (this.config?.providers?.toLowerCase() === 'gemini') {
        if (this.config.geminiModel) {
          requestData.model = this.config.geminiModel;
        }
        delete requestData.frequency_penalty;
        delete requestData.presence_penalty;
      }

      let retries = 1;
      let response = null;
      while (retries >= 0) {
        try {
          response = await YTapi(requestData, this.config);
          if (response) break;
        } catch (error) {
          console.error(`API请求失败(${retries}): ${error}`);
        }
        retries--;
      }

      //console.log('tools', response);
      if (!response || (response.error && Object.keys(response.error).length > 0)) {
        await e.reply(response?.error ? response.error : '抱歉,请求失败,请稍后重试');
        await this.resetGroupUserMessages(groupId, userId);
        this.clearSession(sessionId);
        return true;
      }

      const choice = response.choices[0];
      const message = choice.message;
      let hasHandledFunctionCall = false;

      const executeTool = async (tool, params, e, isRetry = false) => {
        try {
          return await tool.execute(params, e);
        } catch (error) {
          console.error(`工具执行错误 (${isRetry ? '重试' : '首次尝试'})：`, error);
          if (!isRetry) {
            console.log(`正在重试工具：${tool.name}`);
            return await executeTool(tool, params, e, true);
          }
          throw error;
        }
      };

      if (message.tool_calls) {
        //console.log(message.tool_calls);
        if (!message || (message.choices?.[0]?.finish_reason === 'content_filter' && message.choices[0]?.message === null)) {
          this.clearSession(sessionId);
          return false;
        }

        const toolResults = [];
        const executedTools = new Map();
        let aicallback = false;

        for (const toolCall of message.tool_calls) {
          const { id, type, function: functionData } = toolCall;
          const { name: functionName, arguments: argsString } = functionData;

          if (type !== 'function') {
            console.log(`暂不支持的工具类型: ${type}`);
            continue;
          }

          const toolKey = `${functionName}-${argsString}`;
          const isValidTool = session.tools.some(tool => tool.function.name === functionName);
          if (!isValidTool) {
            console.log(`跳过未授权的工具调用: ${functionName}`);
            continue;
          }

          executedTools.set(toolKey, true);

          let currentMessages = [...groupUserMessages];
          const requestBody = {
            role: 'assistant',
            content: null,
            tool_calls: [{
              id,
              type,
              function: { name: functionData.name, arguments: functionData.arguments }
            }]
          };

          if (this.config?.providers?.toLowerCase() === 'gemini') {
            delete requestBody.content;
          }

          currentMessages.push(requestBody);

          let params;
          try {
            params = JSON.parse(argsString);
          } catch (parseError) {
            console.error('参数解析错误：', parseError);
            continue;
          }

          let result;
          try {
            switch (functionName) {
              case this.jinyanTool.name:
                result = await executeTool(this.jinyanTool, {
                  ...params,
                  ...(senderRole ? { senderRole } : {}),
                  ...(targetRole ? { targetRole } : {}),
                  ...(atQq.length > 0 ? { target: atQq.length === 1 ? String(atQq[0]) : atQq.map(qq => String(qq)) } : {})
                }, e);
                break;
              case this.dalleTool.name:
                result = await executeTool(this.dalleTool, params, e);
                result = { prompt: result.prompt, imageUrl: result.imageUrl };
                break;
              case this.freeSearchTool.name:
                result = await executeTool(this.freeSearchTool, params, e);
                break;
              case this.searchVideoTool.name:
                result = await executeTool(this.searchVideoTool, params, e);
                break;
              case this.searchMusicTool.name:
                result = await executeTool(this.searchMusicTool, params, e);
                break;
              case this.aiALLTool.name:
                result = await executeTool(this.aiALLTool, params, e);
                break;
              case this.jimengTool.name:
                result = await executeTool(this.jimengTool, params, e);
                break;
              case this.aiMindMapTool.name:
                result = await executeTool(this.aiMindMapTool, params, e);
                break;
              case this.aiPPTTool.name:
                result = await executeTool(this.aiPPTTool, params, e);
                break;
              case this.webParserTool.name:
                result = await executeTool(this.webParserTool, params, e);
                break;
              case this.fluxTool.name:
                result = await executeTool(this.fluxTool, params, e);
                break;
              case this.ideogramTool.name:
                result = await executeTool(this.ideogramTool, params, e);
                break;
              case this.recraftTool.name:
                result = await executeTool(this.recraftTool, params, e);
                break;
              case this.noobaiTool.name:
                result = await executeTool(this.noobaiTool, params, e);
                break;
              case this.emojiSearchTool.name:
                result = await executeTool(this.emojiSearchTool, params, e);
                break;
              case this.bingImageSearchTool.name:
                result = await executeTool(this.bingImageSearchTool, params, e);
                break;
              case this.OpenAiimageAnalysisTool.name:
                result = await executeTool(this.OpenAiimageAnalysisTool, params, e);
                break;
              case this.googleImageAnalysisTool.name:
                result = await executeTool(this.googleImageAnalysisTool, params, e);
                break;
              case this.pokeTool.name:
                result = await executeTool(this.pokeTool, {
                  ...params,
                  ...(atQq.length > 0 ? { target: atQq.length === 1 ? String(atQq[0]) : atQq.map(qq => String(qq)) } : {})
                }, e);
                break;
              case this.likeTool.name:
                result = await executeTool(this.likeTool, params, e);
                break;
              default:
                throw new Error(`未知的工具调用: ${functionName}`);
            }

            if (result) {
              toolResults.push(result);
              currentMessages.push({
                role: 'tool',
                tool_call_id: id,
                name: functionName,
                content: JSON.stringify(result)
              });

              //console.log(currentMessages);
              const toolRequest = {
                model: 'gpt-4o-fc',
                messages: currentMessages,
                temperature: 0.1,
                top_p: 0.9,
                frequency_penalty: 0.1,
                presence_penalty: 0.1
              };

              if (this.config?.providers?.toLowerCase() === 'gemini') {
                if (this.config.geminiModel) {
                  toolRequest.model = this.config.geminiModel;
                }
                delete toolRequest.frequency_penalty;
                delete toolRequest.presence_penalty;
              }

              let retryCount = 1;
              let toolResponse = null;
              while (retryCount >= 0) {
                try {
                  toolResponse = await YTapi(toolRequest, this.config);
                  if (toolResponse) break;
                } catch (error) {
                  console.error(`API请求失败(${retryCount}): ${error}`);
                }
                retryCount--;
              }

              if (toolResponse?.choices?.[0]?.message?.content) {
                aicallback = true;
                const toolReply = toolResponse.choices[0].message.content;
                const output = await this.processToolSpecificMessage(toolReply, functionName);
                await this.sendSegmentedMessage(e, output);

                try {
                  const messageObj = {
                    message_type: e.message_type,
                    group_id: e.group_id,
                    time: Math.floor(Date.now() / 1000),
                    message: [{ type: 'text', text: toolReply }],
                    source: 'send',
                    self_id: Bot.uin,
                    sender: {
                      user_id: Bot.uin,
                      nickname: Bot.nickname,
                      card: Bot.nickname,
                      role: 'member'
                    }
                  };
                  await this.messageManager.recordMessage(messageObj);
                } catch (error) {
                  logger.error('[MessageRecord] 记录Bot工具响应消息失败：', error);
                }

                groupUserMessages = currentMessages;
                groupUserMessages.push({ role: 'assistant', content: toolReply });
              }
            }
          } catch (error) {
            console.error(`工具执行失败: ${functionName}`, error);
            executedTools.set(toolKey, false);
            continue;
          }
        }

        const FinalRequest = {
          model: 'gpt-4o-fc',
          ...(this.config.UseTools && { tools: session.tools, tool_choice: "auto" }),
          messages: [...groupUserMessages, {
            role: 'system',
            content: `请检查用户的原始请求是否已全部完成。只有在以下情况才需要调用工具：
            1. 之前的工具调用失败需要重试
            2. 确实有未完成的必要任务
            3. 用户明确要求的功能尚未实现
            请不要调用与用户需求无关的工具。已执行过的工具调用：${Array.from(executedTools.keys()).join(', ')}`
          }],
          temperature: 0.1,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1
        };

        if (this.config?.providers?.toLowerCase() === 'gemini') {
          if (this.config.geminiModel) {
            FinalRequest.model = this.config.geminiModel;
          }
          delete FinalRequest.frequency_penalty;
          delete FinalRequest.presence_penalty;
        }

        if (this.config.UseTools && this.config.providers !== 'oneapi') {
          try {
            const finalCheckResponse = await YTapi(FinalRequest, this.config);
            if (!finalCheckResponse || finalCheckResponse.error) {
              await e.reply(finalCheckResponse?.error ? JSON.stringify(finalCheckResponse.error, null, 2) : '抱歉,请求失败,请稍后重试');
            }

            if (finalCheckResponse?.choices?.[0]?.message?.tool_calls) {
              const newToolCalls = finalCheckResponse.choices[0].message.tool_calls.filter(toolCall => {
                const toolKey = `${toolCall.function.name}-${toolCall.function.arguments}`;
                return !executedTools.has(toolKey) || executedTools.get(toolKey) === false;
              });

              if (newToolCalls.length > 0 || !aicallback) {
                const newMessage = {
                  ...finalCheckResponse.choices[0].message,
                  tool_calls: newToolCalls
                };
                await this.handleToolCalls(newMessage, e, groupUserMessages, atQq, senderRole, targetRole);
              }
            }
          } catch (error) {
            console.error('最终检查失败：', error);
          }
        }

        session.groupUserMessages = groupUserMessages;
        await this.saveGroupUserMessages(groupId, userId, groupUserMessages);
        this.clearSession(sessionId);
        return true;
      } else if (message.content) {
        if (!hasHandledFunctionCall) {
          const output = await this.processToolSpecificMessage(message.content);
          await this.sendSegmentedMessage(e, output);

          try {
            const messageObj = {
              message_type: e.message_type,
              group_id: e.group_id,
              time: Math.floor(Date.now() / 1000),
              message: [{ type: 'text', text: message.content }],
              source: 'send',
              self_id: Bot.uin,
              sender: {
                user_id: Bot.uin,
                nickname: Bot.nickname,
                card: Bot.nickname,
                role: 'member'
              }
            };
            await this.messageManager.recordMessage(messageObj);
          } catch (error) {
            logger.error('[MessageRecord] 记录Bot消息失败：', error);
          }

          groupUserMessages.push({ role: 'assistant', content: message.content });
          groupUserMessages = this.trimMessageHistory(groupUserMessages);
          session.groupUserMessages = groupUserMessages;
          await this.saveGroupUserMessages(groupId, userId, groupUserMessages);
        }

        await this.resetGroupUserMessages(groupId, userId);
        this.clearSession(sessionId);
        return true;
      } else {
        await this.resetGroupUserMessages(groupId, userId);
        this.clearSession(sessionId);
        return true;
      }
    } catch (error) {
      console.error(`[工具插件] 会话 ${sessionId} 执行异常：`, error);
      const errorMessage = `执行工具调用操作时发生错误：${error.message}`;
      groupUserMessages.push({ role: 'assistant', content: errorMessage });
      groupUserMessages = this.trimMessageHistory(groupUserMessages);
      session.groupUserMessages = groupUserMessages;
      await this.saveGroupUserMessages(groupId, userId, groupUserMessages);

      const errorRequestData = {
        model: 'gpt-4o-fc',
        messages: groupUserMessages,
        temperature: 0.8,
        top_p: 0.9,
        frequency_penalty: 0.6,
        presence_penalty: 0.6
      };

      if (this.config?.providers?.toLowerCase() === 'gemini') {
        if (this.config.geminiModel) {
          errorRequestData.model = this.config.geminiModel;
        }
        delete errorRequestData.frequency_penalty;
        delete errorRequestData.presence_penalty;
      }

      const errorResponse = await YTapi(errorRequestData, this.config);
      if (errorResponse?.choices?.[0]?.message?.content) {
        const finalErrorReply = errorResponse.choices[0].message.content;
        const output = await this.processToolSpecificMessage(finalErrorReply);
        await this.sendSegmentedMessage(e, output);
      } else {
        await e.reply(errorMessage);
      }

      await this.resetGroupUserMessages(groupId, userId);
      this.clearSession(sessionId);
      return true;
    }
  }

  /**
   * 清除群组中指定用户的消息历史记录
   * @param {Object} e - 事件对象
   * @returns {Promise<boolean>}
   */
  async clearHistory(e) {
    if (!e.group_id) {
      await e.reply('该命令只能在群聊中使用。');
      return false;
    }

    const match = e.msg.match(/^#clear_history\s*(\d+)?\s*(\d+)?/);
    let targetGroupId = e.group_id;
    let targetUserId = e.user_id;
    if (match && match[1]) {
      targetGroupId = match[1];
      if (match[2]) {
        targetUserId = match[2];
      }
    }

    try {
      await this.clearGroupUserMessages(targetGroupId, targetUserId);
      await e.reply(`已清除群组 ${targetGroupId} 中用户 ${targetUserId} 的消息历史。`);
      return true;
    } catch (error) {
      console.error(`清除群组 ${targetGroupId} 中用户 ${targetUserId} 历史失败:`, error);
      await e.reply(`清除群组 ${targetGroupId} 中用户 ${targetUserId} 历史失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 重置群组中指定用户的消息历史记录
   * @param {Object} e - 事件对象
   * @returns {Promise<boolean>}
   */
  async resetHistory(e) {
    if (!e.group_id) {
      await e.reply('该命令只能在群聊中使用。');
      return false;
    }

    const match = e.msg.match(/^#reset_history\s*(\d+)?\s*(\d+)?/);
    let targetGroupId = e.group_id;
    let targetUserId = e.user_id;
    if (match && match[1]) {
      targetGroupId = match[1];
      if (match[2]) {
        targetUserId = match[2];
      }
    }

    try {
      await this.resetGroupUserMessages(targetGroupId, targetUserId);
      await e.reply(`已重置群组 ${targetGroupId} 中用户 ${targetUserId} 的消息历史。`);
      return true;
    } catch (error) {
      console.error(`重置群组 ${targetGroupId} 中用户 ${targetUserId} 历史失败:`, error);
      await e.reply(`重置群组 ${targetGroupId} 中用户 ${targetUserId} 历史失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 限制消息历史长度，确保不超过最大值
   * @param {Array} messages - 消息历史数组
   * @returns {Array} - 修剪后的消息历史数组
   */
  trimMessageHistory(messages) {
    const nonSystemMessages = messages.filter(msg => msg.role !== 'system');
    if (nonSystemMessages.length > this.MAX_HISTORY) {
      const systemMessages = messages.filter(msg => msg.role === 'system');
      const latestMessages = nonSystemMessages.slice(-this.MAX_HISTORY);
      return [...systemMessages, ...latestMessages];
    }
    return messages;
  }

  /**
 * 处理工具调用的辅助函数
 * @param {Object} message - 包含工具调用信息的消息对象
 * @param {Object} e - 事件对象
 * @param {Array} groupUserMessages - 群组用户消息历史
 * @param {Array} atQq - @的用户QQ号数组
 * @param {string} senderRole - 发送者角色
 * @param {string} targetRole - 目标角色
 */
  async handleToolCalls(message, e, groupUserMessages, atQq = [], senderRole = null, targetRole = null) {
    if (!message ||
      (message.choices &&
        message.choices[0]?.finish_reason === 'content_filter' &&
        message.choices[0]?.message === null)) {
      return false;
    }
    const executeTool = async (tool, params, e, isRetry = false) => {
      try {
        return await tool.execute(params, e);
      } catch (error) {
        console.error(`工具执行错误 (${isRetry ? '重试' : '首次尝试'})：`, error);
        if (!isRetry) {
          console.log(`正在重试工具：${tool.name}`);
          return await executeTool(tool, params, e, true);
        }
        throw error;
      }
    };
    const toolResults = []; // 存储所有工具执行结果
    let lastMessages = (() => {
      const lastUserIndex = groupUserMessages.map(msg => msg.role).lastIndexOf('user');
      return lastUserIndex !== -1
        ? groupUserMessages.slice(lastUserIndex)
        : [...groupUserMessages];
    })();

    // 执行当前所有的工具调用
    for (const toolCall of message.tool_calls) {
      const { id, type, function: functionData } = toolCall;
      const { name: functionName, arguments: argsString } = functionData;

      if (type !== 'function') {
        console.log(`暂不支持的工具类型: ${type}`);
        continue;
      }

      const isValidTool = this.tools.some(tool => tool.function.name === functionName);
      if (!isValidTool) {
        console.log(`跳过未授权的工具调用: ${functionName}`);
        continue;
      }

      // 创建当前工具的消息上下文
      let currentMessages = [...lastMessages];
      const requestBody = {
        role: 'assistant',
        content: null,
        tool_calls: [{
          id,
          type,
          function: {
            name: functionData.name,
            arguments: functionData.arguments
          }
        }]
      }

      if (this.config && this.config.providers && typeof this.config.providers === 'string' && this.config.providers.toLowerCase() === 'gemini') {
        delete requestBody.content;
      }

      currentMessages.push(requestBody);

      let params;
      try {
        params = JSON.parse(argsString);
      } catch (parseError) {
        console.error('参数解析错误：', parseError);
        continue;
      }

      // 执行工具
      let result;
      try {
        // 根据工具名称执行相应的工具
        switch (functionName) {
          case this.jinyanTool.name:
            result = await executeTool(this.jinyanTool, {
              ...params,
              ...(senderRole ? { senderRole } : {}),
              ...(targetRole ? { targetRole } : {}),
              ...(atQq.length > 0 ? {
                target: atQq.length === 1 ? String(atQq[0]) : atQq.map(qq => String(qq))
              } : {})
            }, e);
            break;

          case this.dalleTool.name:
            result = await executeTool(this.dalleTool, params, e);
            result = {
              prompt: result.prompt,
              imageUrl: result.imageUrl
            };
            break;

          case this.freeSearchTool.name:
            result = await executeTool(this.freeSearchTool, params, e);
            break;

          case this.searchVideoTool.name:
            result = await executeTool(this.searchVideoTool, params, e);
            break;

          case this.searchMusicTool.name:
            result = await executeTool(this.searchMusicTool, params, e);
            break;

          case this.aiALLTool.name:
            result = await executeTool(this.aiALLTool, params, e);
            break;

          case this.jimengTool.name:
            result = await executeTool(this.jimengTool, params, e);
            break;

          case this.aiMindMapTool.name:
            result = await executeTool(this.aiMindMapTool, params, e);
            break;

          case this.aiPPTTool.name:
            result = await executeTool(this.aiPPTTool, params, e);
            break;

          case this.webParserTool.name:
            result = await executeTool(this.webParserTool, params, e);
            break;

          case this.fluxTool.name:
            result = await executeTool(this.fluxTool, params, e);
            break;

          case this.ideogramTool.name:
            result = await executeTool(this.ideogramTool, params, e);
            break;

          case this.recraftTool.name:
            result = await executeTool(this.recraftTool, params, e);
            break;

          case this.noobaiTool.name:
            result = await executeTool(this.noobaiTool, params, e);
            break;

          case this.emojiSearchTool.name:
            result = await executeTool(this.emojiSearchTool, params, e);
            break;

          case this.bingImageSearchTool.name:
            result = await executeTool(this.bingImageSearchTool, params, e);
            break;

          case this.OpenAiimageAnalysisTool.name:
            result = await executeTool(this.OpenAiimageAnalysisTool, params, e);
            break;

          case this.googleImageAnalysisTool.name:
            result = await executeTool(this.googleImageAnalysisTool, params, e);
            break;

          case this.pokeTool.name:
            result = await executeTool(this.pokeTool, {
              ...params,
              ...(atQq.length > 0 ? {
                target: atQq.length === 1 ? String(atQq[0]) : atQq.map(qq => String(qq))
              } : {})
            }, e);
            break;

          case this.likeTool.name:
            result = await executeTool(this.likeTool, params, e);
            break;

          default:
            throw new Error(`未知的工具调用: ${functionName}`);
        }

        if (result) {
          toolResults.push(result);

          // 添加工具执行结果到当前上下文
          currentMessages.push({
            role: 'tool',
            tool_call_id: id,
            name: functionName,
            content: JSON.stringify(result)
          });

          // 构建工具的请求体
          const toolRequest = {
            model: 'gpt-4o-fc',
            messages: currentMessages,
            temperature: 0.1,
            top_p: 0.9,
            frequency_penalty: 0.1,
            presence_penalty: 0.1
          }

          // 检查 providers 是否为 gemini (不区分大小写)
          if (this.config && this.config.providers && this.config.providers.toLowerCase() === 'gemini') {
            // 修改模型
            if (this.config.geminiModel) {
              toolRequest.model = this.config.geminiModel;
            }


            // 删除 frequency_penalty 和 presence_penalty 属性
            delete toolRequest.frequency_penalty;
            delete toolRequest.presence_penalty;
          }

          // 获取当前工具的响应
          const toolResponse = await YTapi(toolRequest, this.config);

          if (toolResponse?.choices?.[0]?.message?.content) {
            const toolReply = toolResponse.choices[0].message.content;

            const output = await this.processToolSpecificMessage(toolReply, functionName)
            await this.sendSegmentedMessage(e, output)

            // 记录工具调用的回复消息
            try {
              const messageObj = {
                message_type: e.message_type,
                group_id: e.group_id,
                time: Math.floor(Date.now() / 1000),
                message: [{ type: 'text', text: toolReply }],
                source: 'send',
                self_id: Bot.uin,
                sender: {
                  user_id: Bot.uin,
                  nickname: Bot.nickname,
                  card: Bot.nickname,
                  role: 'member'
                }
              };

              await this.messageManager.recordMessage(messageObj);
            } catch (error) {
              logger.error('[MessageRecord] 记录Bot工具响应消息失败：', error);
            }

            // 更新消息历史
            lastMessages = currentMessages;
            lastMessages.push({
              role: 'assistant',
              content: toolReply
            });
          }
        }
      } catch (error) {
        console.error(`工具执行失败: ${functionName}`, error);
        continue;
      }
    }

    return true;
  }

  async sendSegmentedMessage(e, output) {
    try {
      // 处理文本中的@用户名为真实的at
      if (e.group) {
        const outputs = await this.convertAtInString(output, e.group);
        const { result, hasAt, atQQList } = outputs;
        //console.log(result)
        output = result || output;
        if (hasAt) {
          let replyMsg = [];
          atQQList.forEach(qq => {
            replyMsg.push(segment.at(qq));
          });
          await e.reply(replyMsg);
        }
      }

      // 计算输出文本的总 token 数，用于判断是否需要分段发送
      const { total_tokens } = await TotalTokens(output);

      // 如果文本较短（token 数小于等于 20），则直接发送
      if (total_tokens <= 20) {
        return await e.reply(output);
      }

      // 定义用于分割句子的标点符号列表
      const punctuations = ['。', '！', '？', '；', '!', '?', ';', '\n'];
      // 定义句子结尾可能出现的标点符号列表，用于确保每个分段都有结尾标点
      const endingPunctuations = ['。', '！', '？', '；', '!', '?', ';', '...', '…'];

      // 预处理文本，防止分割时破坏特殊字符

      let processedOutput = output;

      // 保护 CQ码，避免被分割
      const cqCodePattern = /\[CQ:[^\]]+\]/g;
      const cqCodes = []; // 存储提取出的CQ码
      let cqCodeIndex = 0; // CQ码的索引

      processedOutput = processedOutput.replace(cqCodePattern, (match) => {
        cqCodes.push(match); // 将匹配到的CQ码存入数组
        return `{{CQCODE${cqCodeIndex++}}}`; // 用占位符替换
      });

      // 保护 emojis 和 emoticons，用占位符替换，避免被分割
      const emojiPattern = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[（(][^（)）]*[）)]|[:;][)D]|[:<]3/gu;
      const emojis = []; // 存储提取出的 emojis
      let emojiIndex = 0; // emojis 的索引

      processedOutput = processedOutput.replace(emojiPattern, (match) => {
        emojis.push(match); // 将匹配到的 emoji 存入数组
        return `{{EMOJI${emojiIndex++}}}`; // 用占位符替换
      });

      // 保护省略号，避免被分割
      processedOutput = processedOutput.replace(/\.{3,}|。{3,}|…+/g, '{{ELLIPSIS}}');

      // 计算理想的分段长度
      const maxSegments = 5; // 最大分段数
      const textLength = processedOutput.length; // 文本长度
      const idealSegmentCount = Math.min(Math.ceil(textLength / 300), maxSegments); // 理想的分段数，每段大约300个字符，但不超过最大分段数
      const idealLength = Math.ceil(textLength / idealSegmentCount); // 理想的每段长度

      // 寻找分割点
      const splitPoints = []; // 存储分割点的数组
      let lastSplitPoint = 0; // 上一个分割点的位置

      // 遍历文本，寻找合适的分割点
      for (let i = 0; i < processedOutput.length; i++) {
        // 如果当前字符是标点符号
        if (punctuations.includes(processedOutput[i])) {
          const segmentLength = i - lastSplitPoint + 1; // 计算当前段的长度
          // 如果当前段的长度大于等于理想长度的 70%，则认为是一个合适的分割点
          if (segmentLength >= idealLength * 0.7) {
            splitPoints.push(i + 1); // 将分割点添加到数组
            lastSplitPoint = i + 1; // 更新上一个分割点的位置
          }
        }
      }

      // 调整分割点，以维持最大分段数
      while (splitPoints.length >= maxSegments) {
        // 寻找最短的段，并移除其分割点
        let minLength = Infinity; // 最小长度，初始值为无穷大
        let removeIndex = -1; // 要移除的分割点的索引，初始值为 -1

        // 遍历分割点，寻找最短的段
        for (let i = 0; i < splitPoints.length - 1; i++) {
          const segmentLength = splitPoints[i + 1] - splitPoints[i]; // 计算当前段的长度
          // 如果当前段的长度小于最小长度，则更新最小长度和要移除的分割点的索引
          if (segmentLength < minLength) {
            minLength = segmentLength;
            removeIndex = i;
          }
        }

        // 如果找到了要移除的分割点，则移除它
        if (removeIndex !== -1) {
          splitPoints.splice(removeIndex, 1);
        } else {
          // 如果没有找到要移除的分割点，则跳出循环（理论上不应该发生）
          break;
        }
      }

      // 创建分段
      let segments = []; // 存储分段的数组
      let start = 0; // 分段的起始位置

      // 根据分割点分割文本
      for (const point of splitPoints) {
        // 如果分割点大于起始位置，则创建一个分段
        if (point > start) {
          segments.push(processedOutput.slice(start, point)); // 将分段添加到数组
          start = point; // 更新起始位置
        }
      }

      // 如果起始位置小于文本长度，则将剩余的文本作为一个分段
      if (start < processedOutput.length) {
        segments.push(processedOutput.slice(start));
      }

      // 恢复特殊字符并处理分段
      segments = segments.map((segment, index) => {
        // 恢复省略号、emojis和CQ码
        let processed = segment
          .replace(/{{ELLIPSIS}}/g, '...') // 恢复省略号
          .replace(/{{EMOJI(\d+)}}/g, (_, index) => emojis[parseInt(index)]) // 恢复 emojis
          .replace(/{{CQCODE(\d+)}}/g, (_, index) => cqCodes[parseInt(index)]) // 恢复 CQ码
          .trim(); // 移除首尾空格

        // 添加适当的结尾标点
        if (processed && !endingPunctuations.some(p => processed.endsWith(p))) {
          processed += ''; // 如果分段没有以结尾标点结尾，则添加句号
        }

        return processed; // 返回处理后的分段
      });

      // 发送消息，模拟人类发送的自然延迟
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i]; // 获取当前分段
        // 如果分段不为空
        if (segment?.trim()) {
          await e.reply(segment.trim()); // 发送分段

          // 如果不是最后一个分段，则添加延迟
          if (i < segments.length - 1) {
            // 动态延迟，基于分段长度
            const baseDelay = 1000; // 基础延迟 1 秒
            const charDelay = segment.length * 5; // 每字符延迟 5 毫秒
            const randomDelay = Math.random() * 500; // 随机延迟 0-500 毫秒
            const delay = Math.min(baseDelay + charDelay + randomDelay, 3000); // 总延迟，但不超过 3 秒
            await new Promise(resolve => setTimeout(resolve, delay)); // 延迟
          }
        }
      }
    } catch (error) {
      // 如果发生错误，则打印错误信息，并直接发送原始文本
      console.error('分段发送错误:', error);
      await e.reply(output); // 直接发送原始文本
    }
  }

  /**
   * 将字符串中的 @用户名 转换为真实的艾特，并返回是否有at对象及其qq
   * @param {string} content - 包含@用户名的字符串
   * @param {object} group - 群对象，用于获取成员列表
   * @returns {object} - 包含处理后的字符串、是否有at和at的qq列表
   */
  async convertAtInString(content, group) {
    // 获取群成员Map
    const members = await group.getMemberMap();

    // 正则表达式匹配 @开头后跟非空白字符的部分
    const atRegex = /@([^\s]+)/g;

    // 存储处理后的字符串
    let result = content;
    // 存储at的qq列表
    const atQQList = [];

    // 查找所有匹配项
    let match;
    while ((match = atRegex.exec(content)) !== null) {
      const fullMatch = match[0]; // 完整匹配，如 @xx
      const username = match[1]; // 用户名部分，如 xx

      // 使用findMember查找用户
      const member = this.findMember(username, members);

      if (member) {
        // 直接替换字符串中的@部分为空字符串
        result = result.replace(fullMatch, '');

        // 添加到at的qq列表
        atQQList.push(member.qq);
      }
    }

    // 返回处理后的字符串、是否有at和at的qq列表
    return {
      result,
      hasAt: atQQList.length > 0,
      atQQList
    };
  }

  /**
   * 查找群成员
   * @param {string} target - 目标用户的QQ号或名称
   * @param {Map} members - 群成员Map
   * @returns {Object|null} - 找到的成员信息或null
   */
  findMember(target, members) {
    // 首先尝试作为QQ号查找
    if (/^\d+$/.test(target)) {
      const member = members.get(Number(target));
      if (member) return { qq: Number(target), info: member };
    }

    // 按群名片或昵称查找
    for (const [qq, info] of members.entries()) {
      const card = info.card?.toLowerCase();
      const nickname = info.nickname?.toLowerCase();
      const searchTarget = target.toLowerCase();

      if (card === searchTarget || nickname === searchTarget ||
        card?.includes(searchTarget) || nickname?.includes(searchTarget)) {
        return { qq, info };
      }
    }
    return null;
  }

  async processToolSpecificMessage(content, toolName) {
    let output = content;
    output = output.replace(/\\n/g, '\n');
    // 删除基础模式
    const basePatterns = [
      /\[图片\]/g,
      /[\s\S]*在群里说[:：]\s*/g,
      /\[\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\]\s*.*(?:\(QQ号:\d+\))?(?:\[群身份:\s*\w+\])?\s*[:：]\s*/g
    ];

    let prevText;
    do {
      prevText = output;
      for (const pattern of basePatterns) {
        output = output.replace(pattern, '').trim();
      }
    } while (prevText !== output);

    function extractMessage(inputString) {
      const regex = /\[群身份: .+?\][:：]\s*(.*)/i;
      let message = inputString; // 初始消息为原始字符串
      const match = regex.exec(inputString);

      if (match) {
        message = match[1]; // 如果匹配到群身份，则提取冒号后的内容
      }

      // 删除 "说:" 或 "说：" 开头的部分
      const sayRegex = /^[说說][:：]\s*/;
      message = message.replace(sayRegex, "");

      return message;
    }

    output = extractMessage(output);
    // 删除代码块
    output = output.replace(/```[\s\S]*?```/g, '');

    // 删除内容少于20个字符的方括号
    output = output.replace(/\[((?:https?:\/\/|[^[\]]*\.[^[\]]+|[^[\]]*\.(jpg|jpeg|png|gif|webp|mp4|mov)|!?\[.*?\]\(.*?\)|.*?\]\(.*?\))(?:(?!\]).){0,100})\]/g, '');

    // 移除末尾的 ```
    if (output.endsWith('```')) {
      output = output.slice(0, -3).trim();
    }

    output = ThinkingProcessor.removeThinking(output);

    function convertImageMd(text) {
      return text.replace(/!?\[(.*?)\]\((.*?)\)/g, (match, alt, url) => {
        return `${alt}\n- ${url}`;
      });
    }

    switch (toolName) {
      case 'dalleTool':
      case 'jimengTool':
      case 'aiMindMapTool':
      case 'aiPPTTool':
      case 'noobaiTool':
        // 先处理图片标记，因为它们通常包含 "!" 前缀
        // 处理 ![alt](url) 格式的图片
        output = output.replace(/!\[([^\]]*)\]\([^)]*\)/g, '');

        // 处理 <image url="xxx"/> 格式
        output = output.replace(/<image\s+url="[^"]*"\s*\/?>/g, '');

        // 处理 ![url] 格式的图片
        output = output.replace(/!\[[^\]]+\]/g, '');

        // 处理 !(url) 格式的图片
        output = output.replace(/!\([^)]+\)/g, '');

        // 然后处理普通链接
        // 处理 [text](url) 格式的链接，保留文本部分
        output = output.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

        // 处理 [url] 格式
        output = output.replace(/\[[^\]]+\]/g, '');

        // 处理 (url) 格式
        output = output.replace(/\([^)]+\)/g, '');

        // 移除可能出现的连续空格、制表符和换行符
        output = output.replace(/\s+/g, ' ').trim();
        break;

      case 'searchVideoTool':
        break;

      case 'searchMusicTool':
        break;

      case 'freeSearchTool':
        break;

      case 'OpenAiimageAnalysisTool':
        break;

      case 'jinyanTool':
        break;

      case 'emojiSearchTool':
        break;

      case 'bingImageSearchTool':
        break;

      case 'pokeTool':
        break;

      case 'likeTool':
        break;

      default:
        output = convertImageMd(output);
    }

    return output.trim();
  }
}