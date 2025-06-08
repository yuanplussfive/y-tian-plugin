import { dependencies } from '../YTdependence/dependencies.js';
const { axios, moment } = dependencies;
import schedule from 'node-schedule';

export class MessageManager {
  /**
   * 初始化消息管理器
   * @param {Object} options 配置选项
   * @param {number} [options.privateMaxMessages=20] 私聊消息上限
   * @param {number} [options.groupMaxMessages=35] 群聊消息上限 
   * @param {number} [options.messageMaxLength=200] 单条消息最大长度
   * @param {number} [options.cacheExpireDays=7] 缓存过期时间(天)
   */
  constructor(options = {}) {
    // 可配置参数
    this.PRIVATE_MAX_MESSAGES = options.privateMaxMessages || 20;  // 私聊消息上限
    this.GROUP_MAX_MESSAGES = options.groupMaxMessages || 35;      // 群聊消息上限(可由用户配置)
    this.MESSAGE_MAX_LENGTH = options.messageMaxLength || 200;     // 单条消息最大长度（不计图片/文件链接）
    this.CACHE_EXPIRE_DAYS = options.cacheExpireDays || 7;         // 缓存过期时间（天）
    
    // 固定参数
    this.REDIS_KEY_PREFIX = 'ytbot:messages:';                     // Redis key前缀
    
    // 初始化定时任务
    this.initScheduledTasks();
  }

  /**
   * 初始化定时任务
   */
  initScheduledTasks() {
    // 设置每天晚上0点执行的定时任务
    schedule.scheduleJob('0 0 * * *', async () => {
      try {
        logger.info('开始执行消息历史记录清理定时任务');
        await this.clearAllMessages();
        logger.info('消息历史记录清理完成');
      } catch (error) {
        logger.error(`定时清理消息历史记录失败: ${error}`);
      }
    });
    logger.info('消息管理器定时任务已初始化');
  }

  /**
   * 清除所有消息历史记录
   * @returns {Promise<void>}
   */
  async clearAllMessages() {
    try {
      // 获取所有以消息前缀开头的键
      const keys = await redis.keys(`${this.REDIS_KEY_PREFIX}*`);
      if (keys && keys.length > 0) {
        // 批量删除所有消息记录
        await redis.del(...keys);
        logger.info(`已清除${keys.length}条消息历史记录`);
      } else {
        logger.info('没有需要清除的消息历史记录');
      }
    } catch (error) {
      logger.error(`清除所有消息历史失败: ${error}`);
      throw error;
    }
  }

  /**
   * 获取图片URL
   * @param {Array} message 消息数组
   * @returns {Promise<string|null>} 处理后的图片URL
   */
  async getImageUrl(message) {
    const processUrl = async (url, fid) => {
      if (url.includes('rkey=') && !url.includes('fileid=') && !url.includes(fid)) {
        const rkey = await this.getRKey(url);
        const host = await this.extractDomain(url);
        let appid = 1407;
        let attempts = 0;
        while (attempts < 5) {
          const customUrl = `${host}/download?appid=${appid}&fileid=${fid}&spec=0&rkey=${rkey}`;
          if (await this.isUrlAvailable(customUrl)) {
            return customUrl;
          }
          appid--;
          attempts++;
        }
      }
      return url;
    };

    for (const { type, url, fid } of message) {
      if ((type === "image" || type === "file") && url) {
        return await processUrl(url, fid);
      }
    }
    return null;
  }

  /**
   * 检查URL是否可用
   * @param {string} url 需要检查的URL
   * @returns {Promise<boolean>} URL是否可用
   */
  async isUrlAvailable(url) {
    try {
      const response = await axios.get(url);
      const contentType = response.headers['content-type'];
      return !contentType || !contentType.includes('application/json');
    } catch (error) {
      return false;
    }
  }

  /**
   * 从URL中提取rkey参数
   * @param {string} url 包含rkey的URL
   * @returns {string|null} 提取的rkey值
   */
  getRKey(url) {
    const rkeyParam = 'rkey=';
    const rkeyStartIndex = url.indexOf(rkeyParam);
    if (rkeyStartIndex === -1) return null;
    const actualStartIndex = rkeyStartIndex + rkeyParam.length;
    const rkeyEndIndex = url.indexOf('&', actualStartIndex);
    return rkeyEndIndex === -1
      ? url.substring(actualStartIndex)
      : url.substring(actualStartIndex, rkeyEndIndex);
  }

  /**
   * 从URL中提取域名部分
   * @param {string} url 完整URL
   * @returns {string} 提取的域名部分
   */
  extractDomain(url) {
    const ampIndex = url.indexOf('&');
    return ampIndex !== -1 ? url.slice(0, ampIndex) : url;
  }

  /**
   * 获取文件URL
   * @param {Object} e 事件对象
   * @param {string} type 类型(group/friend)
   * @returns {Promise<string|null>} 文件URL
   */
  async getFileUrl(e, type) {
    if (e.message?.[0]?.type === 'file') {
      const { fid } = e.message[0];
      if (fid) {
        return type === 'group'
          ? await e.group?.getFileUrl(fid)
          : await e.friend?.getFileUrl(fid);
      }
    }
    return null;
  }

  /**
   * 获取发送者的身份标识
   * @param {Object} sender 发送者信息
   * @param {boolean} isGroup 是否群聊
   * @returns {string} 身份标识文本
   */
  getSenderTitle(sender, isGroup) {
    if (!isGroup) return '';

    const titles = [];
    if (sender.role === 'owner') {
      titles.push('群主');
    }
    else if (sender.role === 'admin') {
      titles.push('管理员');
    }
    if (sender.title) {
      titles.push(sender.title);
    }

    return titles.length ? `[${titles.join('/')}]` : '';
  }

  /**
   * 格式化消息内容
   * 图片/文件的链接长度不计入总长度
   * @param {Object} message 消息对象
   * @returns {Promise<string>} 格式化后的消息内容
   */
  async formatMessageContent(message) {
    const isGroup = message.message_type === 'group';
    let content = '';
    let totalLength = 0;

    if (Array.isArray(message.message)) {
      for (const msg of message.message) {
        let action = '';
        let urlPart = '';
        switch (msg.type) {
          case 'text':
            action = `在${isGroup ? '群里' : '私聊'}说: ${msg.text}`;
            break;
          case 'image': {
            const url = await this.getImageUrl([msg]);
            action = `发送了一张图片`;
            urlPart = url ? ` [${url}]` : '';
            break;
          }
          case 'file': {
            const url = await this.getFileUrl(message, isGroup ? 'group' : 'private');
            const fileSize = msg.size ? `(${(msg.size / 1024 / 1024).toFixed(2)}MB)` : '';
            action = `发送了文件: ${msg.name || '未知文件'}${fileSize}`;
            urlPart = url ? ` [${url}]` : '';
            break;
          }
          case 'face':
            action = `发送了表情 [${msg.text || msg.id}]`;
            break;
          case 'at':
            action = `艾特了 ${msg.text || msg.qq || '某人'}`;
            break;
          case 'video':
            action = '发送了一个视频';
            break;
          case 'record':
            action = '发送了一条语音';
            break;
          case 'share':
            action = `分享了链接: ${msg.title || msg.url}`;
            break;
          case 'reply':
            action = `回复了消息`;
            break;
          case 'forward':
            action = '转发了消息';
            break;
          case 'bface':
            action = '发送了qq表情包';
            break;
          case 'xml':
          case 'json':
            action = '发送了卡片消息';
            break;
          default:
            action = `发送了 ${msg.type} 类型消息`;
        }

        // 计算不包含URL的部分长度
        const actionLength = action.length;

        // 计算添加分隔符的长度
        const separatorLength = content.length > 0 ? 1 : 0; // '，' 的长度为1

        // 检查是否超出最大长度
        if (totalLength + separatorLength + actionLength > this.MESSAGE_MAX_LENGTH) {
          content += '...';
          break;
        }

        // 添加分隔符
        if (separatorLength) {
          content += '，';
        }

        // 添加动作描述
        content += action;
        totalLength += actionLength;

        // 添加URL部分，不计入总长度
        if (urlPart) {
          content += urlPart;
        }
      }
    } else {
      let action = `说: ${message.raw_message || '未知消息'}`;
      // 如果有URL，需要将其分离
      const urlMatch = action.match(/\[.*?\]/);
      let urlPart = '';
      if (urlMatch) {
        urlPart = urlMatch[0];
        action = action.replace(urlPart, '');
      }
      const actionLength = action.length;

      if (actionLength > this.MESSAGE_MAX_LENGTH) {
        content = action.substring(0, this.MESSAGE_MAX_LENGTH) + '...';
      } else {
        content = action;
      }

      if (urlPart) {
        content += urlPart;
      }
    }

    return content;
  }

  /**
   * 格式化单条消息记录
   * @param {Object} message 消息对象
   * @returns {Promise<Object>} 格式化后的消息对象
   */
  async formatMessage(message) {
    const isGroup = message.message_type === 'group';
    const isBot = message.sender.user_id === Bot.uin;

    return {
      time: moment(message.time * 1000).format('MM-DD HH:mm:ss'),
      sender: {
        user_id: message.sender.user_id,
        nickname: isBot ? Bot.nickname : (message.sender.card || message.sender.nickname),
        role: isBot ? 'bot' : message.sender.role,
        title: message.sender.title,
        level: message.sender.level,
        identity: isBot ? '[Bot]' : this.getSenderTitle(message.sender, isGroup)  // 为 bot 添加标识
      },
      content: await this.formatMessageContent(message),
      message_id: message.message_id,
      message_type: message.message_type,
      group_id: isGroup ? message.group_id : null,
      group_name: isGroup ? message.group_name : null,
      message: message.message, // 保存原始消息用于后续处理
      raw_message: message.raw_message
    };
  }

  /**
   * 获取Redis键名
   * @param {string} type 消息类型 (private/group)
   * @param {number} id 用户ID或群ID
   * @returns {string} Redis键名
   */
  getRedisKey(type, id) {
    return `${this.REDIS_KEY_PREFIX}${type}:${id}`;
  }

  /**
   * 记录新消息
   * @param {Object} e 事件对象
   * @param {Object} options 可选参数
   * @param {number} [options.groupMaxMessages] 自定义群聊消息上限
   * @returns {Promise<void>}
   */
  async recordMessage(e, options = {}) {
    try {
      if (!e.sender) {
        e.sender = {
          user_id: Bot.uin,
          nickname: Bot.nickname,
          role: 'bot'
        };
      }
      const isGroup = e.message_type === 'group';
      const id = isGroup ? e.group_id : e.sender.user_id;
      const type = isGroup ? 'group' : 'private';
      const redisKey = this.getRedisKey(type, id);

      let messages = await this.getMessages(type, id);
      messages.unshift(await this.formatMessage(e)); // 在数组开头添加新消息

      // 使用自定义群聊消息上限或默认值
      const maxMessages = isGroup 
        ? (options.groupMaxMessages || this.GROUP_MAX_MESSAGES) 
        : this.PRIVATE_MAX_MESSAGES;
        
      if (messages.length > maxMessages) {
        messages = messages.slice(0, maxMessages); // 保留最新的消息
      }

      await redis.set(redisKey, JSON.stringify(messages), {
        EX: this.CACHE_EXPIRE_DAYS * 24 * 60 * 60
      });

    } catch (error) {
      logger.error(`记录消息失败: ${error}`);
    }
  }

  /**
   * 获取消息历史
   * @param {string} type 消息类型 (private/group)
   * @param {number} id 用户ID或群ID
   * @returns {Promise<Array>} 消息历史数组
   */
  async getMessages(type, id) {
    try {
      const redisKey = this.getRedisKey(type, id);
      const data = await redis.get(redisKey);
      const messages = data ? JSON.parse(data) : [];
      // 按时间戳倒序排序
      return messages.sort((a, b) => {
        const timeA = moment(a.time, 'MM-DD HH:mm:ss');
        const timeB = moment(b.time, 'MM-DD HH:mm:ss');
        return timeB - timeA; // 倒序排列
      });
    } catch (error) {
      logger.error(`获取消息历史失败: ${error}`);
      return [];
    }
  }

  /**
   * 清除指定对象的消息历史
   * @param {string} type 消息类型 (private/group)
   * @param {number} id 用户ID或群ID
   * @returns {Promise<void>}
   */
  async clearMessages(type, id) {
    try {
      const redisKey = this.getRedisKey(type, id);
      await redis.del(redisKey);
      logger.info(`已清除${type}:${id}的消息历史记录`);
    } catch (error) {
      logger.error(`清除消息历史失败: ${error}`);
    }
  }

  /**
   * 格式化消息历史为可读字符串
   * @param {string} type 消息类型 (private/group)
   * @param {number} id 用户ID或群ID
   * @param {number} limit 限制返回的消息数量
   * @returns {Promise<string>} 格式化后的消息历史文本
   */
  async formatMessageHistory(type, id, limit = null) {
    try {
      let messages = await this.getMessages(type, id);

      if (messages.length === 0) {
        return '暂无消息记录';
      }

      // 如果指定了限制，直接取最新的几条
      if (limit) {
        messages = messages.slice(0, limit); // 因为已经倒序，所以直接从头开始取
      }

      const title = type === 'group'
        ? `群${messages[0].group_name}(${id})的聊天记录`
        : `与${messages[0].sender.nickname}(${id})的私聊记录`;

      let output = `=== ${title} ===\n`;
      output += '最新消息在上方\n';
      output += '==================\n\n';

      // 直接遍历即可，因为已经排序
      messages.forEach(msg => {
        const identity = msg.sender.identity ? `${msg.sender.identity} ` : '';
        output += `[${msg.time}] ${identity}${msg.sender.nickname}(${msg.sender.user_id}) ${msg.content}\n`;
      });

      return output;
    } catch (error) {
      logger.error(`格式化消息历史失败: ${error}`);
      return '获取消息记录失败';
    }
  }
}