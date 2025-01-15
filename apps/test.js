import { JinyanTool } from '../YTOpen-Ai/functions_tools/JinyanTool.js';
import { DalleTool } from '../YTOpen-Ai/functions_tools/DalleTool.js';
import { FreeSearchTool } from '../YTOpen-Ai/functions_tools/SearchInformationTool.js';
import { SearchVideoTool } from '../YTOpen-Ai/functions_tools/SearchVideoTool.js';
import { SearchMusicTool } from '../YTOpen-Ai/functions_tools/SearchMusicTool.js';
import { AiALLTool } from '../YTOpen-Ai/functions_tools/AiALLTool.js';
import { EmojiSearchTool } from '../YTOpen-Ai/functions_tools/EmojiSearchTool.js';
import { loadData, saveData } from '../utils/redisClient.js';
import { BingImageSearchTool } from '../YTOpen-Ai/functions_tools/BingImageSearchTool.js';
import { ImageAnalysisTool } from '../YTOpen-Ai/functions_tools/ImageAnalysisTool.js';
import { PokeTool } from '../YTOpen-Ai/functions_tools/PokeTool.js';
import { LikeTool } from '../YTOpen-Ai/functions_tools/LikeTool.js';
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
    // 工具定义部分
    this.functions = [
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
        
        bilibiliSessData: 'a16804xxxxxx'
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

    // 复用现有的 handleTool 逻辑，但移除 #tool 前缀
    const modifiedEvent = {
      ...e,
      msg: e.msg || ''  // 确保 msg 始终有值
    };

    return await this.handleTool(modifiedEvent);
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
      const args = e.msg.replace(/^#tool\s*/, '').trim();

      // 检查是否为清除或重置历史记录的命令
      if (args.startsWith('clear_history')) {
        const parts = args.split(' ');
        let targetGroupId = groupId;
        let targetUserId = userId;
        if (parts.length > 1 && /^\d+$/.test(parts[1])) {
          targetGroupId = parts[1];
          if (parts.length > 2 && /^\d+$/.test(parts[2])) {
            targetUserId = parts[2];
          }
        }
        await this.clearGroupUserMessages(targetGroupId, targetUserId);
        await e.reply(`已清除群组 ${targetGroupId} 中用户 ${targetUserId} 的消息历史。`);
        return true;
      }

      if (args.startsWith('reset_history')) {
        const parts = args.split(' ');
        let targetGroupId = groupId;
        let targetUserId = userId;
        if (parts.length > 1 && /^\d+$/.test(parts[1])) {
          targetGroupId = parts[1];
          if (parts.length > 2 && /^\d+$/.test(parts[2])) {
            targetUserId = parts[2];
          }
        }
        await this.resetGroupUserMessages(targetGroupId, targetUserId);
        await e.reply(`已重置群组 ${targetGroupId} 中用户 ${targetUserId} 的消息历史。`);
        return true;
      }

      // 构建发送者信息对象
      const { sender, group_id, msg } = e;
      const roleMap = {
        owner: 'owner',
        admin: 'admin',
        member: 'member'
      };

      const sexMap = {
        male: '男',
        female: '女',
        unknown: '未知'
      };

      const uuid = crypto.randomUUID();

      // 获取群组中指定用户的消息历史
      let groupUserMessages = await this.getGroupUserMessages(groupId, userId);

      let memberInfo = {};
      try {
        memberInfo = group_id ? await e.bot.pickGroup(group_id).pickMember(sender.user_id).info : {};
      } catch (error) {
        console.error(`获取成员信息失败: ${error}`);
      }
      const { join_time, last_sent_time, role: senderRole } = memberInfo || {};

      let userContent = '';
      const atQq = e.message.filter(item => item.type === 'at').map(item => item.qq);
      if (atQq.length > 0) {
        userContent += `@用户: ${atQq.join(', ')}`;
      }

      if (args.includes('随机禁言')) {
        userContent += ' 随机禁言一名用户';
      }

      const images = await TakeImages(e);
      console.log(images);

      const formatTime = (timestamp) => {
        if (!timestamp) return undefined;
        const date = new Date(timestamp * 1000);
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
      };

      const getCurrentTime = () => new Date().toLocaleString('zh-CN');

      const senderInfo = {
        // 核心信息优先
        发言文本: msg || '无',
        发送时间: getCurrentTime(),
        携带图片个数: images?.length || 0,
        携带图片的链接: images || undefined,
        被艾特用户的qq: atQq[0] || undefined,

        // 用户基本信息次之
        昵称: sender.card || sender.nickname || '未知',
        当前用户QQ号: sender.user_id?.toString() || '未知',
        性别: sexMap[sender.sex] || '未知',
        头像链接: `http://q.qlogo.cn/headimg_dl?dst_uin=${sender.user_id}&spec=640&img_type=jpg`,

        // 群相关信息最后
        当前群名称: e.group_name || '未知',
        当前用户群身份: roleMap[sender.role] || 'member',
        当前群头衔: sender.title || '无',
        用户地区: sender.area || '未知',
        用户年龄: sender.age || '未知',
        用户加群时间: formatTime(join_time),
        用户最后发言时间: formatTime(last_sent_time),
        会话ID: uuid,
        // 添加历史记录信息
        历史记录: await (async () => {
          const chatHistory = await this.messageManager.getMessages(
            e.message_type,
            e.message_type === 'group' ? e.group_id : e.user_id
          );

          if (!chatHistory || chatHistory.length === 0) {
            return '暂无历史记录';
          }

          // 只取最近的5条记录
          const recentHistory = chatHistory;
          return recentHistory.map(msg =>
            `[${msg.time}] ${msg.sender.nickname}: ${msg.content}`
          ).join('\n');
        })()
      };

      function formatSenderInfo(info) {
        // 定义格式化时间的辅助函数
        const formatDateTime = (timeStr) => {
          if (!timeStr) return '';
          return timeStr.replace(/(\d{4})\/(\d{2})\/(\d{2})\s/, '$1年$2月$3日 ');
        };

        // 构建更清晰的消息结构
        const sections = [
          {
            title: '💬 对话信息',
            content: [
              ['命令内容', info.发言文本],
              ['发送时间', formatDateTime(info.发送时间)],
              info.携带图片个数 > 0 ? ['图片数量', `${info.携带图片个数}张`] : null,
              info.携带图片的链接 ? ['图片链接', info.携带图片的链接] : null,
              info.被艾特用户的qq ? ['目标用户', `@${info.被艾特用户的qq}`] : null
            ]
          },
          {
            title: '👤 发送者信息',
            content: [
              ['昵称', info.昵称],
              ['QQ号', info.当前用户QQ号],
              ['头像', info.头像链接]
            ]
          },
          {
            title: '👥 群组信息',
            content: [
              ['群名称', info.当前群名称],
              ['用户身份', info.当前用户群身份],
              ['加群时间', formatDateTime(info.用户加群时间)],
              ['最后发言', formatDateTime(info.用户最后发言时间)],
              ['会话标识', info.会话ID]
            ]
          }
        ];

        // 构建格式化输出
        let output = sections
          .map(section => {
            const sectionContent = section.content
              .filter(item => item && item[1]) // 过滤掉空值
              .map(([key, value]) => `${key}：${value}`)
              .join('\n');

            return `${section.title}\n${sectionContent}`;
          })
          .join('\n\n');

        // 添加分隔线使结构更清晰
        return `――――――――――――――――――\n${output}\n――――――――――――――――――`;
      }


      // 使用时：
      if (e.group_id) {
        userContent = formatSenderInfo(senderInfo);
      }

      //console.log(userContent);


      // 获取被提及用户的角色信息
      let targetRole = 'member'; // 默认目标角色
      if (atQq.length > 0) {
        // 假设只处理第一个被提及的用户
        const targetUserId = atQq[0];
        try {
          const targetMemberInfo = await e.bot.pickGroup(e.group_id).pickMember(targetUserId).info;
          targetRole = roleMap[targetMemberInfo.role] || 'member';
        } catch (error) {
          console.error(`获取目标成员信息失败: ${error}`);
        }
      }

      const systemContent = this.config.systemContent;

      // 获取历史记录的代码修改
      const getHistory = async () => {
        const chatHistory = await this.messageManager.getMessages(
          e.message_type,
          e.message_type === 'group' ? e.group_id : e.user_id
        );

        if (!chatHistory || chatHistory.length === 0) {
          return [];
        }

        return [
          // 使用 reverse() 确保最新消息在下面
          ...chatHistory.reverse().map(msg => ({
            role: msg.sender.user_id === Bot.uin ? 'assistant' : 'user',
            content: `[${msg.time}] ${msg.sender.nickname}(${msg.sender.user_id}): ${msg.content}`
          })),
          {
            role: 'assistant',
            content: '我已经读取了上述群聊的聊天记录，我会优先关注你的最新消息'
          }
        ];
      };


      // 使用示例:
      groupUserMessages = await getHistory();

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
        tools: this.tools
      };

      console.log(requestData.tools);

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
          ]
        };
        const errorResponse = await YTapi(errorRequestData, this.config);
        if (errorResponse && errorResponse.choices && errorResponse.choices[0].message.content) {
          await e.reply(errorResponse.choices[0].message.content);
        } else {
          await e.reply('无法获取 OpenAI 的响应，请稍后再试。');
        }
        // 清空当前用户的消息历史
        await this.resetGroupUserMessages(groupId, userId);
        return false;
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
        if (!message || 
          (message.choices && 
           message.choices[0]?.finish_reason === 'content_filter' && 
           message.choices[0]?.message === null)) {
        return false;
      }
        hasHandledFunctionCall = true;
        const toolResults = []; // 存储所有工具执行结果

        // 为每个工具调用创建独立的消息历史
        for (const toolCall of message.tool_calls) {
          const { id, type, function: functionData } = toolCall;

          if (type !== 'function') {
            console.log(`暂不支持的工具类型: ${type}`);
            continue;
          }

          // 创建当前工具的消息上下文
          let currentMessages = [...groupUserMessages];
          console.log(id,type)
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

          const { name: functionName, arguments: argsString } = functionData;
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
            switch (functionName) {
              case this.jinyanTool.name:
                result = await executeTool(this.jinyanTool, {
                  ...params,
                  senderRole: senderRole,
                  targetRole: targetRole
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
                result = await executeTool(this.pokeTool, params, e);
                break;

              case this.likeTool.name:
                result = await executeTool(this.likeTool, params, e);
                break;

              default:
                throw new Error(`未知的工具调用: ${functionName}`);
            }

            if (result) {
              toolResults.push(result); // 保存工具执行结果

              // 添加工具执行结果到当前上下文
              currentMessages.push({
                role: 'tool',
                tool_call_id: id,
                name: functionName,
                content: JSON.stringify(result)
              });

              console.log(currentMessages)
              // 获取当前工具的响应
              const toolResponse = await YTapi({
                model: 'gpt-4o-fc',
                messages: currentMessages
              }, this.config);

              if (toolResponse?.choices?.[0]?.message?.content) {
                const toolReply = toolResponse.choices[0].message.content;

                const output = this.processToolSpecificMessage(toolReply, functionName)
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

                // 更新主消息历史
                groupUserMessages = currentMessages;
                groupUserMessages.push({
                  role: 'assistant',
                  content: toolReply
                });
              }
            }
          } catch (error) {
            console.error(`工具执行失败: ${functionName}`, error);
            await e.reply(`工具执行出错: ${error.message}`);
            continue;
          }
        }

        // 清理消息历史
        await this.resetGroupUserMessages(groupId, userId);
        return false;
      }
      else if (message.content) {
        // 如果没有函数调用，直接回复内容
        // 检查是否上一次处理过函数调用，避免连续两次回复
        if (!hasHandledFunctionCall) {
          const output = this.processToolSpecificMessage(message.content)
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
        return false;
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
        tools: this.tools
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

      return false;
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

  // 添加消息处理函数
async processToolSpecificMessage(content, toolName) {
  // 移除通用的时间戳和发送者信息
  let output = content
    .replace(/^\[[\d-\s:]+\]\s+.*?[:：]\s*/, '')
    .replace(/在群里说[:：]\s*/, '')
    .trim();

  switch (toolName) {
    case 'dalleTool':
      // 对绘图相关的回复进行处理
      output = output
        .replace(/!?\[([^\]]*)\]\(.*?\)/g, '$1');
      break;
      
    case 'searchVideoTool':
      // 视频搜索相关回复处理
      output = output
        .replace(/让我找找|我找找|帮你找|给你找/, '正在搜索')
        .replace(/稍等一下|稍等片刻|等一下|等一会/, '');
      break;
      
    case 'searchMusicTool':
      // 音乐搜索相关回复处理
      output = output
        .replace(/让我找找|我找找|帮你找|给你找/, '正在搜索')
        .replace(/稍等一下|稍等片刻|等一下|等一会/, '')
        .replace(/这首歌|这个歌/, '歌曲');
      break;
      
    case 'freeSearchTool':
      // 自由搜索相关回复处理
      output = output
        .replace(/让我搜索|我来搜索|帮你搜索|给你搜索/, '正在搜索')
        .replace(/稍等一下|稍等片刻|等一下|等一会/, '');
      break;
      
    case 'imageAnalysisTool':
      // 图片分析相关回复处理
      output = output
        .replace(/让我看看|我来看看|帮你看看|给你看看/, '正在分析')
        .replace(/稍等一下|稍等片刻|等一下|等一会/, '');
      break;
      
    case 'jinyanTool':
      // 禁言相关回复处理
      output = output
        .replace(/让我来|我来|帮你|给你/, '')
        .replace(/稍等一下|稍等片刻|等一下|等一会/, '');
      break;
      
    case 'emojiSearchTool':
      // 表情搜索相关回复处理
      output = output
        .replace(/让我找找|我找找|帮你找|给你找/, '正在搜索')
        .replace(/稍等一下|稍等片刻|等一下|等一会/, '');
      break;
      
    case 'bingImageSearchTool':
      // 必应图片搜索相关回复处理
      output = output
        .replace(/让我搜索|我来搜索|帮你搜索|给你搜索/, '正在搜索')
        .replace(/稍等一下|稍等片刻|等一下|等一会/, '');
      break;
      
    case 'pokeTool':
      // 戳一戳相关回复处理
      output = output
        .replace(/让我戳|我来戳|帮你戳|给你戳/, '正在戳')
        .replace(/稍等一下|稍等片刻|等一下|等一会/, '');
      break;
      
    case 'likeTool':
      // 点赞相关回复处理
      output = output
        .replace(/让我给|我来给|帮你给|给你/, '')
        .replace(/稍等一下|稍等片刻|等一下|等一会/, '');
      break;
      
    default:
      // 默认处理
      output = output.replace(/稍等一下|稍等片刻|等一下|等一会/, '');
  }
  
  return output.trim();
}
}