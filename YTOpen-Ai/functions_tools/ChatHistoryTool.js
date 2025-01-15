import { AbstractTool } from './AbstractTool.js';

/**
 * ChatHistoryTool 工具类，用于基于群聊历史记录进行对话
 */
export class ChatHistoryTool extends AbstractTool {
  constructor() {
    super();
    this.name = 'chatHistoryTool';
    this.description = '基于历史对话回答问题';
    this.triggers = ['群友们在讨论什么', '最近在聊什么', '刚才在说什么'];
    this.parameters = {
      type: "object",
      properties: {
        question: {
          type: 'string',
          description: '用户的问题'
        }
      },
      required: ['question']
    };
  }

  /**
   * 解析历史记录文本
   * @param {string} historyText - 原始历史记录文本
   * @returns {Array} - 解析后的消息数组
   */
  parseHistory(historyText) {
    const messages = [];
    const lines = historyText.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('[')) {
        const match = line.match(/\[(.*?)\] (.*?): (.*)$/);
        if (match) {
          messages.push({
            time: match[1],
            sender: match[2],
            content: match[3]
          });
        }
      }
    }
    return messages.reverse(); // 按时间正序排列
  }

  /**
   * 从消息中提取有效文本内容
   * @param {string} content - 消息内容
   * @returns {string} - 处理后的文本
   */
  extractTextContent(content) {
    // 处理图片消息
    if (content.includes('发送了一张图片')) {
      return '[图片]';
    }
    // 处理群消息
    if (content.startsWith('在群里说:')) {
      return content.replace('在群里说:', '').trim();
    }
    return content;
  }

  /**
   * 生成对话摘要
   * @param {Array} messages - 消息数组
   * @returns {string} - 对话摘要
   */
  generateSummary(messages) {
    let summary = '';
    for (const msg of messages) {
      const content = this.extractTextContent(msg.content);
      summary += `${msg.sender}: ${content}\n`;
    }
    return summary.trim();
  }

  /**
   * 执行对话功能
   * @param {Object} opts - 参数选项
   * @param {Object} e - 事件对象
   * @returns {Promise<string>} - 回复内容
   */
  async func(opts, e) {
    try {
      // 获取历史记录
      const history = e.msg?.historyData || e.message?.historyData;
      if (!history) {
        return '无法获取历史记录';
      }

      // 解析历史记录
      const messages = this.parseHistory(history);
      const summary = this.generateSummary(messages);

      // 根据问题和历史记录生成回复
      const response = `根据群聊记录，最近的对话内容是：\n${summary}`;
      
      return response;

    } catch (err) {
      console.error('处理历史记录时发生错误:', err);
      return `处理失败: ${err.message}`;
    }
  }
}