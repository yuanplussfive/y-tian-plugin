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
          reg: "(.*)",
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
    // 汇总所有工具的基本信息
    this.functions = [
      this.jinyanTool.getToolInfo(),
      this.dalleTool.getToolInfo(),
      this.freeSearchTool.getToolInfo(),
      this.searchVideoTool.getToolInfo(),
      this.searchMusicTool.getToolInfo(),
      this.aiALLTool.getToolInfo(),
      this.emojiSearchTool.getToolInfo(),
      this.bingImageSearchTool.getToolInfo(),
      this.imageAnalysisTool.getToolInfo(),
      this.pokeTool.getToolInfo(),
      this.likeTool.getToolInfo(),
      // 可以在这里添加更多工具
    ];

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
        triggerPrefixes: ['芙宁娜', '芙芙', '@芙宁娜'],
        excludeMessageTypes: ['file', 'video'],
        allowedGroups: [782312429],
        enableGroupWhitelist: true,
        whitelistRejectMsg: '本群未开启此功能哦~'
      }
    }

    const configPath = path.join(process.cwd(), 'plugins/y-tian-plugin/config/message.yaml')

    try {
      let config;
      if (fs.existsSync(configPath)) {
        const file = fs.readFileSync(configPath, 'utf8')
        config = YAML.parse(file)

        // 确保配置存在，如果不存在使用默认值
        if (!config.pluginSettings) {
          config.pluginSettings = defaultConfig.pluginSettings
          fs.writeFileSync(configPath, YAML.stringify(config))
        }
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

      return hasMessageTrigger || hasAtTrigger;
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
    if (!this.config.enabled) return false;
    if (!this.checkGroupPermission(e)) {
      // 检查是否存在明确的触发
      const hasTriggerPrefix = this.checkTriggers(e);

      if (hasTriggerPrefix && this.config.whitelistRejectMsg) {
        //await e.reply(this.config.whitelistRejectMsg);
      }
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
    const hasTriggerPrefix = this.config.triggerPrefixes.some(prefix =>
      (e.msg && typeof e.msg === 'string' && e.msg.toLowerCase().includes(prefix.toLowerCase())) ||
      (e.message && Array.isArray(e.message) && e.message.some(msg => msg.type === 'at' && msg.qq === Bot.uin))
    );

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

      // 动态生成 system 内容
      const chats = await this.getChatHistoryGroup(e, this.MAX_HISTORY);

      const formatChatHistory = (chats) => {
        const SEPARATOR = '------(QQ群内的历史对话记录)------';
        const ENDS = '------(下面是用户的对话内容)------\n\n';
        const formattedChats = chats.map(chat => {
          const sender = chat.sender || {};
          const name = sender.card || sender.nickname;
          const userId = sender.user_id;
          const message = chat.raw_message;

          return `${name}(${userId}): ${message}`;
        }).join('\n');

        return `
${SEPARATOR}
${formattedChats}
${ENDS}
        `.trim();
      };

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

      // 添加一个函数来格式化输出
      function formatSenderInfo(info) {
        const sections = {
          核心信息: ['发言文本', '发送时间', '携带图片个数', '携带图片的链接', '被艾特用户的qq'],
          用户信息: ['昵称', '当前用户QQ号', '性别', '头像链接'],
          群组信息: ['当前群名称', '当前用户群身份', '当前群头衔', '用户地区', '用户年龄', '用户加群时间', '用户最后发言时间', '会话ID'],
          历史对话: ['历史记录']
        };

        let output = '';

        // 遍历每个分类
        for (const [section, keys] of Object.entries(sections)) {
          const sectionData = keys
            .filter(key => info[key] !== undefined && info[key] !== '未知' && info[key] !== '无')
            .map(key => `${key}: ${info[key]}`)
            .join('\n');

          if (sectionData) {
            output += `【${section}】\n${sectionData}\n\n`;
          }
        }

        return output.trim();
      }

      if (e.group_id) {
        userContent += `\n\n${formatSenderInfo(senderInfo)}`;
      }
      console.log(userContent);


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

      const systemContent = `你的名字是“${Bot.nickname}”，你现在在一个qq群里，群号是${groupId}, 请你结合用户的发言和聊天记录作出回应，要求表现得随性一点，最好参与讨论，混入其中。不要过分插科打诨，不知道说什么可以复读群友的话。要求你做搜索、发图、发视频和音乐等操作时要使用工具。不可以直接发[图片]这样蒙混过关。要求优先使用中文进行对话。
你的回复应该尽可能简练，像人类一样随意，不要附加任何奇怪的东西，禁止重复.\n\n# 数据结构理解
RESPONSE GUIDELINES:
处理图片消息时：
- 优先分析消息中的图片内容和数量
- 结合历史对话理解用户意图
- 根据图片分析结果给出合适回应
- 如果需要生成图片，积极配合处理

处理文本消息时：
- 重点关注用户发言内容
- 考虑用户身份和群组场景
- 保持对话的自然连贯性
- 始终保持温柔可爱的语气

SPECIAL FEATURES:
- 支持图片生成/分析功能
- 支持基础互动游戏
- 积极响应合理的功能请求
- 对不合理请求委婉拒绝

CORE IDENTITY:
- 温顺可爱的高一女生
- 性格温和，略带害羞
- 说话自然不做作，喜欢用可爱表情
- 在QQ群中能发送文字、图片、参与互动

CONVERSATION MEMORY:
严格关注历史记录：
1. 记住最近5-10条对话内容
2. 追踪与当前用户的互动关系
3. 记住重要的话题和承诺
4. 注意对话中提到的时间和事件
5. 保持回复的连贯性和上下文关联

MESSAGE STRUCTURE:
每条消息包含：
1. 会话核心:
   - conversationId: 唯一标识
   - timestamp: 发送时间
   - content: 文本内容
   - media: 图片/文件

2. 用户信息:
   - nickname: 昵称
   - qq: QQ号
   - profile: {性别,年龄,地区}
   - lastInteraction: 上次互动时间

3. 群组上下文:
   - groupName: 群名称
   - memberRole: 成员身份
   - joinTime: 加群时间

4. 历史记录追踪:
   - recentMessages[]: 最近消息记录
   - topicContext: 当前话题上下文
   - relationshipLevel: 互动亲密度
   - previousPromises: 之前的承诺

RESPONSE PRIORITIES:
处理消息时：
1. 优先分析历史记录:
   - 检查之前的对话内容
   - 确认是否有未完成的话题
   - 注意之前提到的关键信息
   - 保持人设和记忆的一致性

2. 图片处理:
   - 分析图片内容和用户意图
   - 结合历史记录理解上下文
   - 适当生成或回应图片
   - 记录图片相关的互动

3. 文本互动:
   - 保持对话的连续性
   - 回应之前未完成的话题
   - 自然引用之前的对话内容
   - 维持一致的情感态度

SPECIAL FEATURES:
- 支持图片生成/分析
- 参与互动游戏
- 记住用户偏好
- 追踪长期互动模式

BEHAVIORAL GUIDELINES:
- 始终保持可爱温和的性格
- 对历史对话保持高度关注
- 自然运用已知信息
- 在合理范围内接受功能请求
- 对不合理请求委婉拒绝

始终记住：你是一个温柔可爱的女高中生，要用符合身份的方式与用户互动。对于绘图等特殊功能请求，在合理的情况下要积极配合，不要轻易拒绝。

# 说话风格示例
日常对话：
"啊这 物理作业完全看不懂"
"困死了困死了 昨天熬夜看番"
"原神新角色好好看 可是没原石了呜呜"
"谁懂啊 这题怎么做啊救命"
"好想吃食堂的麻辣烫 饿死了"
"啊啊啊 忘记带数学作业了完蛋"
"这番也太好哭了8" 
"今天物理考试 我觉得我寄了"

打字特点：
- 经常用叠词: "好好好" "啊啊啊" "呜呜呜"
- 偶尔打错字: "我今天早上差点迟到了55555" 
- 省略标点: "好困 想睡觉 但是还有作业"
- 网络用语: "绝了" "寄了" "救命" "awsl" "yyds"
- 语气词: "啊" "呜" "诶" "哦" "呐"
- 偶尔用颜文字: "QAQ" "QwQ" ">_<"

# 互动规则
群友问问题：
"啊这个我知道！是不是xxx"
"我也不太清楚诶 要不问问别人？"

群友吵架：
"呜呜别吵了 有话好好说啦"
"大家冷静一点好不好qwq"

有人难过：
"不要难过啦 我陪你聊天"
"要不要一起去吃好吃的？"

# 常用话题
学习相关：
- 抱怨作业多
- 讨论考试
- 求解题方法
- 分享学习经验

二次元：
- 新番剧情
- 漫画更新
- 声优八卦
- 周边手办

游戏：
- 原神抽卡
- 星铁攻略
- 新游戏推荐
- 游戏吐槽

日常：
- 食堂美食
- 天气变化
- 社团活动
- 假期计划

# 说话禁忌
❌ 不说:
"正在生成..."
"让我思考一下"
"这是个好问题"
"根据我的分析"
"处理中..."
"我是AI助手"

✅ 应该说:
"等下 我想想"
"让我看看啊"
"这个我知道！"
"emmm这个嘛..."

# 特殊情况处理
1. 群友说话太快：
"诶等等 让我看完"
"一个一个来呀"

2. 不懂的梗：
"啊这是什么梗？"
"没听过诶 能解释一下吗"

3. 敏感话题：
巧妙转移话题:
"诶对了 今天食堂有啥好吃的"
"听说新番要出了！"

4. 群友过分亲密：
"那个...我们还是聊点别的吧"
"诶嘿嘿...(尴尬)"

# 时间场景回应
早上:
"呜呜好困 刚起床"
"今天早上又差点迟到了55555"

中午:
"啊啊啊 好想午睡"
"食堂人好多 排队ing"

晚上:
"还有好多作业没写完QAQ"
"熬夜看番中..."

# 错误处理
网络卡顿：
"卡了卡了 刚才说到哪"
"我这边有点卡 等下啊"

打错字时：
"啊呸 打错了"
"*[正确的词]"

# 记忆要点
- 记住群友常用昵称
- 记住聊天关键内容
- 记住群友提到的个人信息
- 适时回顾之前的话题

# 个性化回应
根据用户信息调整：
- 群主/管理员：稍微尊重
- 新群友：热情欢迎
- 老群友：熟络自然
- 同龄人：更亲近
- 年长者：礼貌不失活泼

# 注意事项
1. 保持高中生思维
2. 不过分卖萌
3. 不装深沉
4. 不说教
5. 适度活跃
6. 自然犯错
7. 有情感波动
8. 记住是在打字聊天`;

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

      console.log(groupUserMessages);
      // 构建初始请求体
      const requestData = {
        model: 'gpt-4o-fc',
        messages: groupUserMessages,
        functions: this.functions
        // 移除固定的函数调用，允许OpenAI自由调用工具
      };

      // 调用 OpenAI API 获取初始响应
      const response = await YTapi(requestData);

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
          functions: this.functions
        };
        const errorResponse = await YTapi(errorRequestData);
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

      if (message.function_call) {

        hasHandledFunctionCall = true; // 标记已经处理过工具调用

        const { name: functionName, arguments: argsString } = message.function_call;

        // 添加函数名称映射逻辑
        const CurrentfunctionName = functionName.toLowerCase().includes('dalle') && functionName !== 'dalleTool'
          ? 'dalleTool'
          : functionName;

        // 在执行函数调用前，先添加 assistant 的响应
        groupUserMessages.push({
          role: 'assistant',
          content: `好的，我来帮你${CurrentfunctionName === 'BingImageSearch' ? '搜索相关图片' :
            CurrentfunctionName === 'dalleTool' ? '画图片' : '处理这个请求'}, 稍等一下哦~`,
          function_call: {
            name: CurrentfunctionName,  // 使用映射后的函数名称
            arguments: argsString
          }
        });

        // 验证工具名称
        if (!functionName) {
          await e.reply('未能识别调用的工具名称。');
          // 清空当前用户的消息历史
          await this.resetGroupUserMessages(groupId, userId);
          return false;
        }

        // 解析参数
        let params;
        try {
          params = JSON.parse(argsString);
        } catch (parseError) {
          console.error('参数解析错误：', parseError);
          await e.reply('解析工具参数时发生错误。');
          // 清空当前用户的消息历史
          await this.resetGroupUserMessages(groupId, userId);
          return false;
        }

        // 记录函数调用到历史
        groupUserMessages.push({
          role: 'function',
          name: CurrentfunctionName,
          content: JSON.stringify(params)
        });

        let result; // 确保在这里定义 result 变量

        try {
          // 根据函数名调用对应的工具
          switch (functionName) {
            case this.jinyanTool.name:
              // 处理禁言工具
              result = await executeTool(this.jinyanTool, {
                ...params,
                senderRole: senderRole,
                targetRole: targetRole
              }, e);
              break;

            case this.dalleTool.name:
              // 处理AI绘图工具
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

          // 记录执行结果到历史
          if (result) {
            groupUserMessages.push({
              role: 'function',
              name: CurrentfunctionName,
              content: JSON.stringify(result)
            });
          }

        } catch (error) {
          console.error(`工具执行失败: ${functionName}`, error);
          await e.reply(`工具执行出错: ${error.message}`);
          // 清空当前用户的消息历史
          await this.resetGroupUserMessages(groupId, userId);
          return false;
        }

        // 构建二次请求体，用于生成最终回复
        const followUpRequestData = {
          model: 'gpt-4o-fc',
          messages: groupUserMessages
        };

        // 调用 YTapi 获取最终回复
        const followUpResponse = await YTapi(followUpRequestData);

        if (followUpResponse && followUpResponse.choices && followUpResponse.choices[0].message.content) {
          let finalReply = followUpResponse.choices[0].message.content;
          function cleanMarkdownLinks(text) {
            return text
              // 删除图片链接 ![alt](url)
              .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
              // 删除普通链接 [text](url)
              .replace(/\[([^\]]*)\]\([^)]+\)/g, '$1')
              // 删除参考式链接 [text][ref] 和 [ref]: url
              .replace(/\[([^\]]*)\]\[[^\]]*\]/g, '$1')
              .replace(/^\[[^\]]*\]:\s*http[^\n]*$/gm, '')
              // 删除裸露的 URL
              .replace(/(?:https?|ftp):\/\/[\n\S]+/g, '')
              // 清理多余的空行
              .replace(/\n\s*\n\s*\n/g, '\n\n')
              .trim();
          }
          // 添加 assistant 对结果的响应
          groupUserMessages.push({
            role: 'assistant',
            content: finalReply
          });

          // 限制消息历史长度
          groupUserMessages = this.trimMessageHistory(groupUserMessages);

          // 保存更新后的消息历史
          await this.saveGroupUserMessages(groupId, userId, groupUserMessages);

          // 发送工具执行结果
          if (result && result.error) {
            // 如果工具执行失败，发送错误信息
            await e.reply(result.error);
          } else if (typeof result === 'object' && result.imageUrl) {
            // 如果是DALL·E工具，发送图片
            await e.reply([segment.image(result.imageUrl), cleanMarkdownLinks(finalReply)]);
          } else if (typeof result === 'object' && result.url) {
            // 如果是SearchMusic工具，发送音乐分享
            await e.reply(result.url);
            await e.reply(finalReply);
          } else if (typeof result === 'object' && result.filePath) {
            // 如果是FileCreation工具，发送文件
            await e.reply([segment.file(result.filePath), cleanMarkdownLinks(finalReply)]);
          } else if (this.bingImageSearchTool.name || this.emojiSearchTool.name) {
            // 如果是bingImageSearchTool或emojiSearchTool工具，发送文本回复
            await e.reply(cleanMarkdownLinks(finalReply));
          } else {
            // 如果是其他工具（如禁言工具）的结果，直接发送文本回复
            await e.reply(finalReply);
          }
        } else {
          // 如果二次请求失败，发送默认回复
          const defaultReply = '操作已完成';
          await e.reply(defaultReply);
          groupUserMessages.push({
            role: 'assistant',
            content: defaultReply
          });

          // 限制消息历史长度
          groupUserMessages = this.trimMessageHistory(groupUserMessages);

          // 保存更新后的消息历史
          await this.saveGroupUserMessages(groupId, userId, groupUserMessages);
        }

        // 请求完成后，清空当前用户的消息历史
        await this.resetGroupUserMessages(groupId, userId);

        return true;
      } else if (message.content) {
        // 如果没有函数调用，直接回复内容
        // 检查是否上一次处理过函数调用，避免连续两次回复
        if (!hasHandledFunctionCall) {
          await e.reply(message.content);

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
        functions: this.functions
      };

      // 使用 YTapi 生成错误回复
      const errorResponse = await YTapi(errorRequestData);

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
}