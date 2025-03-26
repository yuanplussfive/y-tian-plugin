import OpenAI from 'openai';

/**
 * 创建 OpenAI 客户端实例
 * @param {string} baseUrl - 第三方 API 服务的地址
 * @param {string} apiKey - 你的 API 密钥
 * @param {object} [defaultHeaders={'Content-Type': 'application/json'}] - 默认请求头，可选
 * @returns {OpenAI} - OpenAI 客户端实例
 */
function createOpenAIClient(baseUrl, apiKey, defaultHeaders = { 'Content-Type': 'application/json' }) {
  return new OpenAI({
    apiKey: apiKey,
    baseURL: baseUrl,
    defaultHeaders: defaultHeaders
  });
}

/**
 * 调用 Chat Completions API，并处理超时和错误
 * @param {OpenAI} openaiClient - OpenAI 客户端实例
 * @param {string} model - 模型名称
 * @param {array} messages - 消息数组
 * @returns {object} - 包含结果或错误信息的 JSON 对象
 */
async function getChatCompletion(openaiClient, model, messages) {
  // 定义不同模型的超时时间（毫秒）
  const timeoutSettings = {
    'claude': 300000,
    'gemini': 180000,
    'all': 600000,
    'mj': 300000,
    'ideogram': 300000,
    'r1': 900000,
    'o1': 900000,
    'o3': 900000,
    'default': 600000
  };

  // 根据模型名称选择合适的超时时间
  const timeoutDuration = Object.entries(timeoutSettings).find(([key, _]) =>
    model.toLowerCase().includes(key) // 检查模型名称是否包含任何一个 timeoutSettings 的键
  )?.[1] || timeoutSettings.default; // 如果没有找到匹配的模型，则使用默认超时时间

  try {
    // 如果模型需要自定义超时，则使用 Promise.race 实现超时控制
    if (Object.keys(timeoutSettings).some(key => model.toLowerCase().includes(key))) {
      // 使用 Promise.race 包装 API 调用和超时 Promise
      const chatCompletion = await Promise.race([
        openaiClient.chat.completions.create({ // 调用 OpenAI API
          model: model,
          messages: messages,
        }),
        new Promise((_, reject) => // 创建一个超时 Promise
          setTimeout(() => reject(new Error('Timeout')), timeoutDuration) // 在指定时间后拒绝 Promise
        ),
      ]);
      return chatCompletion; // 返回 API 调用的结果
    } else {
      // 否则，直接调用 OpenAI API，使用 SDK 默认的超时设置
      const chatCompletion = await openaiClient.chat.completions.create({
        model: model,
        messages: messages,
      });
      return chatCompletion; // 返回 API 调用的结果
    }
  } catch (error) {
    // 捕获 API 调用过程中发生的任何错误
    console.error("Error in getChatCompletion:", error);
    let errorMessage = "发生了一个意外错误。"; // 默认错误消息
    if (error.message === 'Timeout') {
      errorMessage = '请求超时。'; // 超时错误消息
    } else if (error.response) {
      errorMessage = `API 错误: ${error.response.status} - ${JSON.stringify(error.response.data)}`; // API 错误消息
    } else {
      errorMessage = error.message; // 其他错误消息
    }
    return { error: errorMessage }; // 返回包含错误信息的 JSON 对象
  }
}

/**
 * 主函数，用于调用 OpenAI API 并处理结果
 * @param {string} baseUrl - 第三方 API 服务的地址
 * @param {string} apiKey - 你的 API 密钥
 * @param {string} model - 模型名称
 * @param {array} messages - 消息数组
 * @param {object} [defaultHeaders] - 默认请求头，可选
 * @returns {object} - 包含结果或错误信息的 JSON 对象
 */
export async function OpenAiChatCmpletions(baseUrl, apiKey, model, messages, defaultHeaders) {
  try {
    const openaiClient = createOpenAIClient(baseUrl, apiKey, defaultHeaders);
    const chatCompletion = await getChatCompletion(openaiClient, model, messages);
    if (chatCompletion.error) {
      return chatCompletion;
    }

    return chatCompletion;

  } catch (error) {
    console.error("error:", error);
    return {
      error: {
        message: "遇到了一个错误: " + error.message
      }
    };
  }
}