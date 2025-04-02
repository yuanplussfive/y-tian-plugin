import OpenAI from 'openai';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
const { fetch } = globalThis;

/**
 * 创建 OpenAI 客户端实例
 * @param {string} baseUrl - 第三方 API 服务的地址
 * @param {string} apiKey - API 密钥
 * @param {object} defaultHeaders - 默认请求头
 * @returns {OpenAI} OpenAI客户端实例
 */
function createOpenAIClient(baseUrl, apiKey, defaultHeaders = { 'Content-Type': 'application/json' }) {
  const TIMEOUT = 900000; // 15分钟

  return new OpenAI({
    apiKey: apiKey,
    baseURL: baseUrl,
    defaultHeaders: defaultHeaders,
    timeout: TIMEOUT,
    maxRetries: 1,
    httpAgent: new HttpAgent({
      keepAlive: false,
      maxSockets: Infinity
    }),
    httpsAgent: new HttpsAgent({
      keepAlive: false,
      maxSockets: Infinity
    }),
    fetch: (url, init) => {
      console.log(`[${new Date().toISOString()}] 开始请求: ${url}`);
      return fetch(url, {
        ...init,
        signal: AbortSignal.timeout(TIMEOUT),
      }).then(response => {
        console.log(`[${new Date().toISOString()}] 收到响应状态: ${response.status}`);
        return response;
      });
    }
  });
}

/**
 * 处理聊天完成请求
 * @param {OpenAI} openaiClient - OpenAI客户端实例 
 * @param {string} model - 模型名称
 * @param {array} messages - 消息数组
 * @returns {object} 返回结果或错误信息
 */
async function getChatCompletion(openaiClient, model, messages) {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] 开始聊天补全请求,模型: ${model}`);

  try {
    // 调用OpenAI Chat API
    const chatCompletion = await openaiClient.chat.completions.create({
      model: model,
      messages: messages,
    });

    const endTime = Date.now();
    console.log(`[${new Date().toISOString()}] 聊天补全完成,耗时: ${(endTime - startTime) / 1000}秒`);
    return chatCompletion;

  } catch (error) {
    const endTime = Date.now();
    console.error(`[${new Date().toISOString()}] 错误发生,耗时: ${(endTime - startTime) / 1000}秒`, {
      name: error.name,
      message: error.message,
      code: error.code,
      type: error.type,
      stack: error.stack
    });

    let errorMessage = "发生了意外错误";
    if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
      errorMessage = '请求超时';
    } else if (error.response) {
      errorMessage = `API错误: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
    } else {
      errorMessage = `${error.name}: ${error.message}`;
    }
    return { error: errorMessage };
  }
}

/**
 * 主函数: OpenAI聊天补全API的封装
 * @param {string} baseUrl - API服务地址
 * @param {string} apiKey - API密钥
 * @param {string} model - 模型名称
 * @param {array} messages - 消息数组
 * @param {object} defaultHeaders - 默认请求头
 * @returns {object} 返回处理结果
 */
export async function OpenAiChatCmpletions(baseUrl, apiKey, model, messages, defaultHeaders) {
  console.log(`[${new Date().toISOString()}] 开始OpenAI聊天补全流程`);
  try {
    // 创建客户端实例
    const openaiClient = createOpenAIClient(baseUrl, apiKey, defaultHeaders);
    // 执行聊天补全
    const chatCompletion = await getChatCompletion(openaiClient, model, messages);

    if (chatCompletion.error) {
      console.log(`[${new Date().toISOString()}] 请求失败:`, chatCompletion.error);
      return chatCompletion;
    }

    console.log(`[${new Date().toISOString()}] 请求成功完成`);
    return chatCompletion;

  } catch (error) {
    // 捕获意外错误
    console.error(`[${new Date().toISOString()}] 发生意外错误:`, error);
    return {
      error: {
        message: "遇到了错误: " + error.message
      }
    };
  }
}