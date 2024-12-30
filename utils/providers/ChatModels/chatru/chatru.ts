import fetch from 'node-fetch';
import { processStreamResponse } from '../../../requests/processStreamResponse';

// 定义类型接口
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RequestConfig {
  model: string;
  messages: ChatMessage[];
  stream: boolean;
}

/**
 * 发送聊天请求并获取AI回复内容
 * @param messages - 聊天消息数组
 * @param model - AI模型标识符
 * @returns AI回复文本，失败时返回null
 */
export const chatru = async (
  messages: ChatMessage[],
  model: string
): Promise<string | null> => {
  const API_URL = 'https://main.gpt-chatbotru-4-o1.ru/api/openai/v1/chat/completions';

  const requestConfig: RequestConfig = {
    model: model.includes('-vision') ? model.replace('-vision', '') : model,
    messages,
    stream: true
  };

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
    'Referer': 'https://main.gpt-chatbotru-4-o1.ru/',
    'User-Agent': [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'AppleWebKit/537.36 (KHTML, like Gecko)',
      'Chrome/131.0.0.0',
      'Safari/537.36',
      'Edg/131.0.0.0'
    ].join(' ')
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestConfig),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details available');
      console.error(`Request failed ${response.status}: ${errorText}`);
      return null;
    }

    return await processStreamResponse(response);
  } catch (error) {
    console.error('Request failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
};