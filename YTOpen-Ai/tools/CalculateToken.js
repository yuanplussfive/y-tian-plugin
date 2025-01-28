import { getEncoding } from 'js-tiktoken';

async function encode(input) {
  const tokenizerCache = await getEncoding('cl100k_base');
  if (typeof input !== 'string') {
    throw new Error('输入必须是一个字符串');
  }
  const encodedTokens = tokenizerCache.encode(input);
  return new Uint32Array(encodedTokens);
}

/**
 * 计算内容的 token 数量
 * @param {string|Array} content - 内容
 * @returns {number} - token 总数
 */
const countContentTokens = async (content) => {
  if (Array.isArray(content)) {
    content = content
      .filter(item => item.type === 'text' && typeof item.text === 'string')
      .map(item => item.text)
      .join(' ');
  }
  if (typeof content !== 'string' || !content.trim()) {
    return 0;
  }
  const totalCount = await encode(content); // 这里使用 await
  return totalCount.length;
};

export const TotalTokens = async (content, messages = []) => {
  const contentCount = await countContentTokens(content); // 使用 await 等待异步操作完成
  const messageCount = !messages.length ? 0 : await messages.reduce(async (accPromise, msg) => {
    const acc = await accPromise;
    const msgTokens = await countContentTokens(msg.content);
    return acc + msgTokens;
  }, Promise.resolve(0));
  if (!content || (typeof content === 'string' && !content.trim())) {
    content = '无效的返回内容';
  }
  return {
    prompt_tokens: messageCount,
    completion_tokens: contentCount,
    get total_tokens() { return this.prompt_tokens + this.completion_tokens; }
  };
};