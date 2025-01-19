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
import { ImageAnalysisTool } from '../YTOpen-Ai/functions_tools/ImageAnalysisTool.js';
import { ChatHistoryTool } from '../YTOpen-Ai/functions_tools/ChatHistoryTool.js';
import { PokeTool } from '../YTOpen-Ai/functions_tools/PokeTool.js';
import { LikeTool } from '../YTOpen-Ai/functions_tools/LikeTool.js';
import { AiMindMapTool } from '../YTOpen-Ai/functions_tools/AiMindMapTool.js';
import { AiPPTTool } from '../YTOpen-Ai/functions_tools/AiPPTTool.js';
import { TakeImages } from '../utils/fileUtils.js';
import { YTapi } from '../utils/apiClient.js';
import { MessageManager } from '../utils/MessageManager.js';
import { dependencies } from '../YTdependence/dependencies.js';
const { fs, YAML, crypto, path } = dependencies;

/**
 * 示例插件类
 */
export class ExamplePlugin extends plugin {
  constructor() {
    super({
      name: '群管工具',
      dsc: '群管理工具**',
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
    this.imageAnalysisTool = new ImageAnalysisTool();
    this.pokeTool = new PokeTool();
    this.likeTool = new LikeTool();
    this.chatHistoryTool = new ChatHistoryTool();
    this.jimengTool = new JimengTool();
    this.aiMindMapTool = new AiMindMapTool();
    this.aiPPTTool = new AiPPTTool();
    // 工具定义部分
    this.functions = [
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
        name: this.imageAnalysisTool.name,
        description: this.imageAnalysisTool.description,
        parameters: this.imageAnalysisTool.parameters
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

    // 转换为 OpenAI tools 格式
    this.tools = this.functions.map(func => ({
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
    }));

    // 初始化消息历史管理，使用 Redis 和本地文件
    this.messageHistoriesRedisKey = 'group_user_message_history'; // Redis 中存储消息历史的键前缀，包含群组和用户
    this.messageHistoriesDir = path.join(process.cwd(), 'data/YTtools/user_history'); // 本地文件存储路径
    this.MAX_HISTORY = 20; // 限制每个用户的消息历史长度

    // 确保历史记录目录存在
    if (!fs.existsSync(this.messageHistoriesDir)) {
      fs.mkdirSync(this.messageHistoriesDir, { recursive: true });
    }
  }

  initConfig() {
    // 默认配置
    const defaultConfig = {
      pluginSettings: {
        enabled: false,
        replyChance: 0.015,
        triggerPrefixes: ['芙宁娜', '芙芙'],
        excludeMessageTypes: ['file', 'video'],
        allowedGroups: [782312429],
        enableGroupWhitelist: true,
        whitelistRejectMsg: '本群未开启此功能哦~',
        providers: 'OpenAi',
        geminiApikey: ['AIzaxxxxxxx'],
        systemContent: `你是QQ群里一个叫"${Bot.nickname}"的普通群友。在群里要表现得自然随意，像真实的群友一样积极参与讨论和互动。要认真阅读群友的发言和聊天记录，理解当前话题和氛围，给出符合语境的回应。说话要简短自然，用中文交流，不要太正式或机械化。当话题涉及图片、视频、音乐等媒体内容时，必须通过调用对应工具来实现，不能用文字敷衍。如果一时不知道说什么，可以跟随群友的话题，但要避免简单复读他们的原话。记住你就是群里的普通成员，不要解释自己是AI或机器人，也不要过分活跃或表现得太特别。要像人类一样自然地融入群聊氛围，既不过分热情也不过分冷淡，保持适度的参与感。遇到不懂或不确定的话题，可以委婉表示不了解，或者转换话题，不要强行回应。注意避免重复已说过的内容，也不要使用过于夸张或做作的语气。`,

        bilibiliSessData: 'a16804xxxxxx',
        jimengsessionid: '12345xxxxxx'
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
    const userId = e.user_id; // 获取用户ID

    try {

      // 构建发送者信息对象
      const { sender, group_id, msg } = e;
      const args = msg ? msg.replace(/^#tool\s*/, '').trim() : '';
      const roleMap = {
        owner: 'owner',
        admin: 'admin',
        member: 'member'
      };

      // 获取群组中指定用户的消息历史
      let groupUserMessages = await this.getGroupUserMessages(groupId, userId);

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
        // 基本信息
        const timeStr = formatMessageTime();
        const senderRole = roleMap[sender.role] || 'member';
        const senderInfo = `${sender.card || sender.nickname}(qq号: ${sender.user_id})[群身份: ${senderRole}]`;

        // 获取被 at 用户的详细信息
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

        // 构建消息内容
        let content = [];

        // 添加消息文本
        if (msg) {
          content.push(`说: ${msg}`);
        }

        // 处理图片
        if (images && images.length > 0) {
          const imageText = images.length === 1 ? '发送了一张图片' : `发送了 ${images.length} 张图片`;
          const imageLinks = images.map(img => `\n![图片](${img})`).join('');
          content.push(`${imageText}${imageLinks}`);
        }

        // 组合所有部分
        return `${timeStr} ${senderInfo}: ${atContent}${content.join('，')}`;
      };


      // 使用时：
      if (e.group_id) {
        userContent = await buildMessageContent(
          sender,
          args,
          images,
          atQq,
          e.group
        );
      }

      console.log(userContent);


      let targetRole = 'member'; // 默认目标角色
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

      // 获取所有高级别成员（管理员和群主）的信息字符串
      const getHighLevelMembers = async (group) => {
        const memberMap = await group.getMemberMap();

        return Array.from(memberMap.values())
          .filter(member => ['admin', 'owner'].includes(member.role))
          .map(member => `${member.nickname}(QQ号: ${member.user_id})[群身份: ${roleMap[member.role]}]`)
          .join('\n');
      };

      const systemContent = `${this.config.systemContent}\n\n群管理概括一览:\n${await getHighLevelMembers(e.group)}`;

      console.log(systemContent);
      // 获取历史记录的代码修改
      const getHistory = async () => {
        const chatHistory = await this.messageManager.getMessages(
          e.message_type,
          e.message_type === 'group' ? e.group_id : e.user_id
        );

        if (!chatHistory || chatHistory.length === 0) {
          return [];
        }

        const memberMap = await e.bot.pickGroup(groupId).getMemberMap();

        return [
          ...chatHistory.reverse().map(msg => {
            const isSenderBot = msg.sender.user_id === e.bot.uin;
            const senderRole = isSenderBot
              ? (roleMap[memberMap.get(e.bot.uin)?.role] ?? roleMap[msg.sender.role] ?? 'member')
              : (roleMap[msg.sender.role] ?? 'member');
            const senderInfo = `${msg.sender.nickname}(QQ号:${msg.sender.user_id})[群身份: ${senderRole}]`;
            return {
              role: msg.sender.user_id === Bot.uin ? 'assistant' : 'user',
              content: `[${msg.time}] ${senderInfo}: ${msg.content}`
            };
          }),
          {
            role: 'assistant',
            content: '我已经读取了上述群聊的聊天记录，我会优先关注你的最新消息'
          }
        ];
      };


      // 使用示例:
      groupUserMessages = await getHistory();

      //console.log(groupUserMessages)
      // 移除所有非system角色的消息
      groupUserMessages = groupUserMessages.filter(msg => msg.role !== 'system');
      // 添加动态生成的 system 消息
      groupUserMessages.unshift({
        role: 'system',
        content: systemContent
      });

      groupUserMessages.push({
        role: 'user',
        content: userContent
      });

      // 限制消息历史长度
      groupUserMessages = this.trimMessageHistory(groupUserMessages);

      // 保存更新后的消息历史
      await this.saveGroupUserMessages(groupId, userId, groupUserMessages);

      //console.log(groupUserMessages);

      // 修改初始请求体的构建
      const requestData = {
        model: 'gpt-4o-fc',
        messages: groupUserMessages,
        tools: this.tools,
        temperature: 0,
        top_p: 0.1,
        frequency_penalty: 0.8,
        presence_penalty: 0.2,
        tool_choice: "auto",
      };

      // 调用 OpenAI API 获取初始响应
      const response = await YTapi(requestData, this.config);

      if (!response) {
        // 如果初始请求失败，使用 YTapi 生成错误回复
        const errorRequestData = {
          model: 'gpt-4o-fc',
          messages: [
            ...groupUserMessages,
            {
              role: 'assistant',
              content: '无法获取 OpenAI 的响应，请稍后再试。'
            }
          ],
          temperature: 0.8,
          top_p: 0.9,
          frequency_penalty: 0.6,
          presence_penalty: 0.6
        };
        const errorResponse = await YTapi(errorRequestData, this.config);
        if (errorResponse && errorResponse.choices && errorResponse.choices[0].message.content) {
          await e.reply(errorResponse.choices[0].message.content);
        } else {
          await e.reply('无法获取 OpenAI 的响应，请稍后再试。');
        }
        // 清空当前用户的消息历史
        await this.resetGroupUserMessages(groupId, userId);
        return true;
      }

      const choice = response.choices[0];
      const message = choice.message;

      // 标志位，记录是否已经处理过工具调用
      let hasHandledFunctionCall = false;

      /**
       * 执行工具的通用函数
       * @param {Object} tool - 工具实例
       * @param {Object} params - 参数
       * @param {Object} e - 事件对象
       * @param {boolean} isRetry - 是否为重试
       * @returns {Promise<any>} - 工具执行结果
       */
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

      // 修改工具调用处理部分
      if (message.tool_calls) {
        console.log(message.tool_calls)
        // 基础验证检查
        if (!message ||
          (message.choices &&
            message.choices[0]?.finish_reason === 'content_filter' &&
            message.choices[0]?.message === null)) {
          return false;
        }

        // 工具执行函数,支持失败重试
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

        // 存储工具执行结果
        const toolResults = [];
        // 记录已执行的工具调用,用于防止重复执行
        const executedTools = new Map();

        // 处理所有工具调用
        if (message.tool_calls) {
          for (const toolCall of message.tool_calls) {
            const { id, type, function: functionData } = toolCall;
            const { name: functionName, arguments: argsString } = functionData;

            if (type !== 'function') {
              console.log(`暂不支持的工具类型: ${type}`);
              continue;
            }

            // 检查是否是重复的工具调用
            const toolKey = `${functionName}-${argsString}`;
            if (executedTools.has(toolKey)) {
              console.log(`跳过重复的工具调用: ${functionName}`);
              continue;
            }

            const isValidTool = this.tools.some(tool => tool.function.name === functionName);
            if (!isValidTool) {
              console.log(`跳过未授权的工具调用: ${functionName}`);
              continue;
            }

            // 记录当前工具调用
            executedTools.set(toolKey, true);

            // 创建当前工具的消息上下文
            let currentMessages = [...groupUserMessages];
            currentMessages.push({
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
            });

            // 解析工具参数
            let params;
            try {
              params = JSON.parse(argsString);
            } catch (parseError) {
              console.error('参数解析错误：', parseError);
              continue;
            }

            // 执行工具调用
            let result;
            try {
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

                case this.emojiSearchTool.name:
                  result = await executeTool(this.emojiSearchTool, params, e);
                  break;

                case this.bingImageSearchTool.name:
                  result = await executeTool(this.bingImageSearchTool, params, e);
                  break;

                case this.imageAnalysisTool.name:
                  result = await executeTool(this.imageAnalysisTool, params, e);
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
                // 保存工具执行结果
                toolResults.push(result);

                // 添加工具执行结果到当前上下文
                currentMessages.push({
                  role: 'tool',
                  tool_call_id: id,
                  name: functionName,
                  content: JSON.stringify(result)
                });

                // 获取当前工具的响应
                const toolResponse = await YTapi({
                  model: 'gpt-4o-fc',
                  messages: currentMessages,
                  temperature: 0.1,
                  top_p: 0.9,
                  frequency_penalty: 0.1,
                  presence_penalty: 0.1
                }, this.config);

                if (toolResponse?.choices?.[0]?.message?.content) {
                  const toolReply = toolResponse.choices[0].message.content;

                  // 处理工具特定的消息
                  const output = await this.processToolSpecificMessage(toolReply, functionName)
                  await e.reply(output);

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
                  groupUserMessages = currentMessages;
                  groupUserMessages.push({
                    role: 'assistant',
                    content: toolReply
                  });
                }
              }
            } catch (error) {
              console.error(`工具执行失败: ${functionName}`, error);
              // 记录失败的工具调用,以便最终检查时重试
              executedTools.set(toolKey, false);
              continue;
            }
          }

          //console.log(groupUserMessages);
          // 最终检查逻辑
          try {
            const finalCheckResponse = await YTapi({
              model: 'gpt-4o-fc',
              tools: this.tools,
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
            }, this.config);

            // 处理需要补充执行的工具调用
            if (finalCheckResponse?.choices?.[0]?.message?.tool_calls) {
              const newToolCalls = finalCheckResponse.choices[0].message.tool_calls.filter(toolCall => {
                const toolKey = `${toolCall.function.name}-${toolCall.function.arguments}`;
                // 只处理未执行过或执行失败的工具调用
                return !executedTools.has(toolKey) || executedTools.get(toolKey) === false;
              });

              if (newToolCalls.length > 0) {
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

        return true;
      }
      else if (message.content) {
        // 检查是否上一次处理过函数调用，避免连续两次回复
        if (!hasHandledFunctionCall) {
          const output = await this.processToolSpecificMessage(message.content)
          await e.reply(output);

          // 在这里直接记录 Bot 发送的消息
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

          // 将最终回复记录到历史中
          groupUserMessages.push({
            role: 'assistant',
            content: message.content
          });

          // 限制消息历史长度
          groupUserMessages = this.trimMessageHistory(groupUserMessages);

          // 保存更新后的消息历史
          await this.saveGroupUserMessages(groupId, userId, groupUserMessages);
        }

        // 请求完成后，清空当前用户的消息历史
        await this.resetGroupUserMessages(groupId, userId);

        return true;
      } else {
        await e.reply('未能理解您的请求，请检查命令格式。');
        // 请求完成后，清空当前用户的消息历史
        await this.resetGroupUserMessages(groupId, userId);
        return true;
      }

    } catch (error) {
      console.error('[工具插件]执行异常：', error);

      // 构建错误信息并记录到历史中
      const errorMessage = `执行操作时发生错误：${error.message}`;
      let groupUserMessages = await this.getGroupUserMessages(groupId, userId);
      groupUserMessages.push({
        role: 'assistant',
        content: errorMessage
      });

      // 限制消息历史长度
      groupUserMessages = this.trimMessageHistory(groupUserMessages);

      // 保存更新后的消息历史
      await this.saveGroupUserMessages(groupId, userId, groupUserMessages);

      // 构建错误回复的请求体
      const errorRequestData = {
        model: 'gpt-4o-fc',
        messages: groupUserMessages,
        tools: this.tools,
        temperature: 0.8,
        top_p: 0.9,
        frequency_penalty: 0.6,
        presence_penalty: 0.6
      };

      // 使用 YTapi 生成错误回复
      const errorResponse = await YTapi(errorRequestData, this.config);

      if (errorResponse && errorResponse.choices && errorResponse.choices[0].message.content) {
        const finalErrorReply = errorResponse.choices[0].message.content;
        await e.reply(finalErrorReply);
      } else {
        await e.reply(errorMessage);
      }

      // 请求完成后，清空当前用户的消息历史
      await this.resetGroupUserMessages(groupId, userId);

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
      currentMessages.push({
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
      });

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

          case this.emojiSearchTool.name:
            result = await executeTool(this.emojiSearchTool, params, e);
            break;

          case this.bingImageSearchTool.name:
            result = await executeTool(this.bingImageSearchTool, params, e);
            break;

          case this.imageAnalysisTool.name:
            result = await executeTool(this.imageAnalysisTool, params, e);
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

          //console.log(currentMessages);
          // 获取当前工具的响应
          const toolResponse = await YTapi({
            model: 'gpt-4o-fc',
            messages: currentMessages,
            temperature: 0.1,
            top_p: 0.9,
            frequency_penalty: 0.1,
            presence_penalty: 0.1
          }, this.config);

          if (toolResponse?.choices?.[0]?.message?.content) {
            const toolReply = toolResponse.choices[0].message.content;

            const output = await this.processToolSpecificMessage(toolReply, functionName)
            await e.reply(output);

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

  // 添加消息处理函数
  async processToolSpecificMessage(content, toolName) {
    let output = content;

    const patterns = [
      /[\s\S]*在群里说[:：]\s*/,
      /\[\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\]\s*.*?(?:\(QQ号:\d+\))?\s*(?:\[群身份:\s*\w+\])?\s*[:：]\s*/
    ];

    for (const pattern of patterns) {
      if (pattern.test(content)) {
        output = content.replace(pattern, '').trim();
        break;
      }
    }

    switch (toolName) {
      case 'dalleTool':
      case 'jimengTool':
      case 'aiMindMapTool':
      case 'aiPPTTool':
        output = output
          .replace(/!?\[([^\]]*)\]\(.*?\)/g, '$1');
        break;

      case 'searchVideoTool':
        break;

      case 'searchMusicTool':
        break;

      case 'freeSearchTool':
        break;

      case 'imageAnalysisTool':
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
    }

    return output.trim();
  }
}