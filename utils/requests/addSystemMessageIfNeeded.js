/**
 * 系统消息处理器，确保消息中包含系统信息
 */
export function addSystemMessageIfNeeded(messages, model) {
  let lastSystemMessage = null;

  return async (messages, model) => {
    if (!messages.some(({ role }) => role === 'system')) {
      const now = Date.now();
      const currentTime = new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
      }).format(new Date());

      lastSystemMessage = {
        role: 'system',
        content: `You are ChatGPT, a large language model trained by OpenAI.
知识截止日期: 2023-10
当前模型: ${model}
当前时间: ${currentTime}
LaTeX 行内: $x^2$
LaTeX 块: $$e=mc^2$$`
      };
      messages.unshift(lastSystemMessage);
    }
    return messages;
  };
})();