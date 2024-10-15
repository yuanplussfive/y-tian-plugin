import { Transform } from 'stream';
import { pipeline } from 'stream/promises';

async function* messageGenerator(messages) {
  for (const message of messages) {
    yield message;
  }
}

class MessageProcessor extends Transform {
  constructor(options) {
    super({ objectMode: true });
    this.numbers = options.numbers; // 最大的 user 消息数
    this.newArr = []; // 存储保留的消息
    this.totalContentLength = 0; // 总内容长度
    this.userCount = 0; // 当前 user 消息计数
    this.systemObj = null; // system 消息
    this.contentLengthLimit = options.contentLengthLimit || 10000; // 内容长度限制
  }

  async _transform(message, encoding, callback) {
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
      while (this.userCount > this.numbers) {
        const removedObj = this._removeOldestUserMessage();
        if (removedObj) {
          this.totalContentLength -= removedObj.contentLength;
          this.userCount--;
        } else {
          break; 
        }
      }
    }

    // 检查内容长度是否超过限制
    while (this.totalContentLength > this.contentLengthLimit && this.newArr.length > 2) {
      const removedObj = this._removeOldestMessage(2);
      if (removedObj) {
        this.totalContentLength -= removedObj.contentLength + removedObj.assistantContentLength;
        if (removedObj.role === 'user') {
          this.userCount--;
        }
      } else {
        break;
      }
    }

    callback();
  }

  _flush(callback) {
    for (const message of this.newArr) {
      this.push(message);
    }
    callback();
  }

  /**
   * 移除最旧的 user 消息及其紧随的 assistant 消息
   * @returns {Object|null} 被移除的 user 消息对象
   */
  _removeOldestUserMessage() {
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
            ? countTextInStringSync(removedUser.content)
            : 0,
          assistantContentLength: removedAssistant && removedAssistant.content
            ? countTextInStringSync(removedAssistant.content)
            : 0
        };
      }
    }
    return null;
  }

  /**
   * 移除最旧的消息，如果是 user 消息，则尝试移除其紧随的 assistant 消息
   * @returns {Object|null} 被移除的消息对象
   */
  _removeOldestMessage(minRetainCount = 2) {
    if (this.newArr.length <= minRetainCount) return null;
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
        ? this.countTextInStringSync(removedObj.content)
        : 0,
      assistantContentLength: removedAssistant && removedAssistant.content
        ? this.countTextInStringSync(removedAssistant.content)
        : 0
    };
  }

  /**
   * 同步计算文本长度，用于移除操作
   * @param {string|Array} text
   * @returns {number}
   */
  countTextInStringSync(text) {
    if (Array.isArray(text)) {
      text = text
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join(' ');
    }
    if (typeof text !== 'string' || !text.trim()) {
      return 0;
    }
    const englishWordRegex = /[a-zA-Z]+/g;
    const chineseCharRegex = /[\u4e00-\u9fa5]/g;
    const englishWords = text.match(englishWordRegex) || [];
    const chineseChars = text.match(chineseCharRegex) || [];
    return Math.floor(englishWords.length * 2 + chineseChars.length * 1.5);
  }
}

/**
 * 异步计算文本长度，用于添加消息时的长度统计
 * @param {string|Array} text
 * @returns {Promise<number>}
 */
async function countTextInString(text) {
  if (Array.isArray(text)) {
    text = text
      .filter(item => item.type === 'text')
      .map(item => item.text)
      .join(' ');
  }
  if (typeof text !== 'string' || !text.trim()) {
    return 0;
  }
  const englishWordRegex = /[a-zA-Z]+/g;
  const chineseCharRegex = /[\u4e00-\u9fa5]/g;
  const englishWords = text.match(englishWordRegex) || [];
  const chineseChars = text.match(chineseCharRegex) || [];
  return Math.floor(englishWords.length * 1.5 + chineseChars.length * 1.4);
}

/**
 * 同步版本的 countTextInString，用于移除消息时的长度计算
 * @param {string|Array} text
 * @returns {number}
 */
function countTextInStringSync(text) {
  if (Array.isArray(text)) {
    text = text
      .filter(item => item.type === 'text')
      .map(item => item.text)
      .join(' ');
  }
  if (typeof text !== 'string' || !text.trim()) {
    return 0;
  }
  const englishWordRegex = /[a-zA-Z]+/g;
  const chineseCharRegex = /[\u4e00-\u9fa5]/g;
  const englishWords = text.match(englishWordRegex) || [];
  const chineseChars = text.match(chineseCharRegex) || [];
  return Math.floor(englishWords.length * 2 + chineseChars.length * 1.5);
}

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

  return result;
}

export { processArray, countTextInString };