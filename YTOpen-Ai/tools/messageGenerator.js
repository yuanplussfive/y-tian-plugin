import { Transform } from 'stream';
import { pipeline } from 'stream/promises';
import { TotalTokens } from './CalculateToken.js';

/**
 * 异步生成器函数，用于逐条生成消息
 * @param {Array} messages - 消息数组
 */
async function* messageGenerator(messages) {
  for (const message of messages) {
    yield message;
  }
}

/**
 * MessageProcessor 类继承自 Transform，用于处理消息流
 */
class MessageProcessor extends Transform {
  /**
   * 构造函数
   * @param {Object} options - 配置选项
   */
  constructor(options) {
    super({ objectMode: true }); // 使用对象模式
    this.numbers = options.numbers; // 最大的 user 消息数
    this.newArr = []; // 存储保留的消息
    this.totalContentLength = 0; // 总内容长度
    this.userCount = 0; // 当前 user 消息计数
    this.systemObj = null; // system 消息
    this.contentLengthLimit = options.contentLengthLimit || 10000; // 内容长度限制
  }

  /**
   * 处理每一条消息
   * @param {Object} message - 消息对象
   * @param {string} encoding - 编码格式
   * @param {Function} callback - 回调函数
   */
  async _transform(message, encoding, callback) {
    try {
      // 处理 system 消息
      if (message.role === 'system' && !this.systemObj) {
        this.systemObj = message;
        this.newArr.push(this.systemObj);
        callback();
        return;
      }

      // 处理 user 消息
      if (message.role === 'user') {
        this.userCount++;
      }

      // 将消息添加到 newArr
      this.newArr.push(message);

      // 计算消息的内容长度
      let messageContentLength = 0;
      if (!Array.isArray(message.content)) {
        messageContentLength = await countTextInString(message.content);
      }
      this.totalContentLength += messageContentLength;

      // 如果是 user 消息，检查是否超过数量限制
      if (message.role === 'user') {
        while (this.userCount > this.numbers && this.newArr.length > 1) {
          const removedObj = await this._removeOldestUserMessage();
          if (removedObj) {
            this.totalContentLength -= removedObj.contentLength;
            this.userCount--;
          } else {
            break; // 无法再移除，跳出循环
          }
        }
      }

      // 检查内容长度是否超过限制
      while (this.totalContentLength > this.contentLengthLimit && this.newArr.length > 1) {
        const removedObj = await this._removeOldestMessage(1); // 保留至少一个消息
        if (removedObj) {
          this.totalContentLength -= removedObj.contentLength + removedObj.assistantContentLength;
          if (removedObj.role === 'user') {
            this.userCount--;
          }
        } else {
          break; // 无法再移除，跳出循环
        }
      }

      callback();
    } catch (error) {
      callback(error);
    }
  }

  /**
   * 在流结束时，将保留的消息推送出去
   * @param {Function} callback - 回调函数
   */
  _flush(callback) {
    if (this.newArr.length === 0 && this.lastMessage) {
      // 如果 newArr 为空，但存在最后一条消息，则保留最后一条消息
      this.newArr.push(this.lastMessage);
    }

    for (const message of this.newArr) {
      this.push(message);
    }
    callback();
  }

  /**
   * 移除最旧的 user 消息及其紧随的 assistant 消息
   * @returns {Object|null} 被移除的 user 消息对象
   */
  async _removeOldestUserMessage() {
    for (let i = 0; i < this.newArr.length; i++) {
      if (this.newArr[i].role === 'user') {
        const removedUser = this.newArr.splice(i, 1)[0];
        let removedAssistant = null;
        // 检查下一个消息是否是 assistant，如果是，则一并移除
        if (i < this.newArr.length && this.newArr[i].role === 'assistant') {
          removedAssistant = this.newArr.splice(i, 1)[0];
        }
        // 返回被移除的 user 消息和可能的 assistant 消息的总长度
        return {
          role: 'user',
          contentLength: removedUser.content
            ? await countTextInString(removedUser.content)
            : 0,
          assistantContentLength: removedAssistant && removedAssistant.content
            ? await countTextInString(removedAssistant.content)
            : 0
        };
      }
    }
    return null;
  }

  /**
   * 移除最旧的消息，如果是 user 消息，则尝试移除其紧随的 assistant 消息
   * @param {number} minRetainCount - 最少保留的消息数
   * @returns {Object|null} 被移除的消息对象
   */
  async _removeOldestMessage(minRetainCount = 1) {
    if (this.newArr.length <= minRetainCount) return null; // 确保至少保留 minRetainCount 条消息

    const removedObj = this.newArr.shift();
    let removedAssistant = null;

    if (removedObj.role === 'user') {
      if (this.newArr.length > minRetainCount && this.newArr[0].role === 'assistant') {
        removedAssistant = this.newArr.shift();
      }
    }

    return {
      role: removedObj.role,
      contentLength: removedObj.content
        ? await countTextInString(removedObj.content)
        : 0,
      assistantContentLength: removedAssistant && removedAssistant.content
        ? await countTextInString(removedAssistant.content)
        : 0
    };
  }
}

/**
 * 异步计算文本长度，用于添加消息时的长度统计
 * @param {string|Array} text - 文本内容
 * @returns {Promise<number>} 文本长度
 */
async function countTextInString(text) {
  const { total_tokens } = await TotalTokens(text);
  return total_tokens;
}

/**
 * 处理消息数组，确保结果数组至少保留传递的最后一个对象
 * @param {Array} messages - 消息数组
 * @param {number} numbers - 最大的 user 消息数
 * @param {number} [contentLengthLimit=10000] - 内容长度限制
 * @returns {Promise<Array>} 处理后的消息数组
 */
async function processArray(messages, numbers, contentLengthLimit = 10000) {
  const processor = new MessageProcessor({ numbers, contentLengthLimit });
  const result = [];

  await pipeline(
    messageGenerator(messages),
    processor,
    new Transform({
      objectMode: true,
      transform(chunk, encoding, callback) {
        result.push(chunk);
        callback();
      }
    })
  );

  // 确保结果数组至少保留传递的最后一个对象
  if (result.length === 0 && messages.length > 0) {
    result.push(messages[messages.length - 1]);
  }

  return result;
}

// 导出函数
export { processArray, countTextInString };