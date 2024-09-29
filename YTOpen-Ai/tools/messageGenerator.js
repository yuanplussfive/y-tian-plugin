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
    this.numbers = options.numbers;
    this.newArr = [];
    this.totalContentLength = 0;
    this.userCount = 0;
    this.systemObj = null;
    this.contentLengthLimit = options.contentLengthLimit || 10000; // 自定义内容长度限制
  }

  async _transform(message, encoding, callback) {
    if (message.role === 'system' && !this.systemObj) {
      this.systemObj = message;
    } else if (message.role === 'user') {
      this.userCount++;
    }

    if (this.userCount < this.numbers) {
      this.push(await this._processMessage(message));
    } else {
      if (this.systemObj && this.newArr.length === 0) {
        this.newArr.push(this.systemObj);
      }

      if (['user', 'assistant'].includes(message.role) && this.newArr.length < this.numbers * 2) {
        if (message.role === 'user' && this.newArr[this.newArr.length - 1]?.role === 'assistant') {
          this.newArr.push(await this._processMessage(message));
        } else {
          this.newArr.push(await this._processMessage(message));
        }
      } else if (!['user', 'assistant'].includes(message.role)) {
        this.newArr.push(message);
      }

      if (!Array.isArray(message.content)) {
        const contentLength = await countTextInString(message.content);
        this.totalContentLength += contentLength;

        // 使用自定义内容长度限制
        while (this.totalContentLength > this.contentLengthLimit && this.newArr.length > 0) {
          const removedObj = this.newArr.shift();
          if (removedObj && removedObj.content) {
            this.totalContentLength -= await countTextInString(removedObj.content);
          }
        }
      }

      while (this.newArr.length > this.numbers * 2) {
        this.push(this.newArr.shift());
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

  async _processMessage(message, isLastUserMessage) {
    if (Array.isArray(message.content)) {
      const processedContent = message.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join(' ');
      if (!isLastUserMessage) {
        message.content = processedContent;
      }
    }
    return message;
  }  
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

async function countTextInString(text) {
  if (Array.isArray(text)) {
      text = text
          .filter(item => item.type === 'text')
          .map(item => item.text)
          .join(' ');
  }
  const englishWordRegex = /[a-zA-Z]+/g;
  const chineseCharRegex = /[\u4e00-\u9fa5]/g;
  const englishWords = text.match(englishWordRegex) || [];
  const chineseChars = text.match(chineseCharRegex) || [];
  return Math.floor(englishWords.length * 2 + chineseChars.length * 1.5);
}

export { processArray, countTextInString };