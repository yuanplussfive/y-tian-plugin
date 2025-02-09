import { dependencies } from "../YTdependence/dependencies.js";
const { _path, fetch, fs, path } = dependencies;

/**
 * 发送请求到 OpenAI API 并处理响应
 * @param {Object} requestData - 请求体数据
 * @returns {Object|null} - 返回 OpenAI 的响应数据
 */
export async function YTapi(requestData, config) {
  const dirpath = `${_path}/data/YTotherai`;
  const dataPath = dirpath + "/data.json";
  const data = JSON.parse(await fs.promises.readFile(dataPath, "utf-8"));

  const provider = config.providers?.toLowerCase();

  try {
    let url, headers, finalRequestData;

    if (provider === 'gemini') {
      url = 'https://api-proxy.me/gemini/v1beta/chat/completions';
      const randomIndex = Math.floor(Math.random() * config.geminiApikey.length);
      headers = {
        'Authorization': `Bearer ${config.geminiApikey[randomIndex]}`,
        'Content-Type': 'application/json'
      };
      finalRequestData = {
        ...requestData
      };
    } else if (provider === 'oneapi') {
      // 首先使用 OpenAI 请求
      const openaiUrl = 'https://yuanpluss.online:3000/api/v1/4o/fc';
      const openaiHeaders = {
        'Authorization': `Bearer ${data.chatgpt.stoken}`,
        'Content-Type': 'application/json'
      };

      const openaiResponse = await fetch(openaiUrl, {
        method: 'POST',
        headers: openaiHeaders,
        body: JSON.stringify(requestData)
      });

      const openaiData = await openaiResponse.json();

      // 检查 finish_reason
      if (openaiData.choices?.[0]?.finish_reason === 'stop') {
        // 如果是 'stop'，使用 OneAPI 进行请求
        url = `${config.OneApiUrl}/v1/chat/completions`;
        const randomIndex = Math.floor(Math.random() * config.OneApiKey.length);
        headers = {
          'Authorization': `Bearer ${config.OneApiKey[randomIndex]}`,
          'Content-Type': 'application/json'
        };

        // 处理messages中的工具调用消息
        const processedMessages = requestData.messages.map(msg => {
          if (msg.role === 'assistant' && msg.tool_calls) {
            // 直接使用tool_calls中的arguments作为content
            return {
              role: 'assistant',
              content: msg.tool_calls[0].function.arguments
            };
          }
          return msg.role === 'tool' ? null : msg;
        }).filter(Boolean);

        finalRequestData = {
          model: config.OneApiModel,
          messages: processedMessages,
          stream: false
        };
      } else if (openaiData.choices?.[0]?.finish_reason === 'tool_calls') {
        // 如果是 'tool_calls'，替换 model 并返回
        openaiData.model = config.OneApiModel;
        return processResponse(openaiData);
      }
    } else {
      url = 'https://yuanpluss.online:3000/api/v1/4o/fc';
      headers = {
        'Authorization': `Bearer ${data.chatgpt.stoken}`,
        'Content-Type': 'application/json'
      };
      finalRequestData = requestData;
    }

    // 只有在需要发送新请求时才执行
    if (url && headers && finalRequestData) {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(finalRequestData)
      });

      const responseData = await response.json();
      console.log(`${provider || 'OpenAI'} 响应:`, responseData);
      return processResponse(responseData);
    }

  } catch (error) {
    console.error('YTapi 错误:', error);
    return { error: error?.message };
  }
}

function processResponse(responseData) {
  if (Array.isArray(responseData) && responseData.length > 0) {
    return responseData[0];
  } else if (typeof responseData === 'object') {
    if (responseData.detail) {
      return { error: responseData.detail };
    } else if (responseData.error) {
      return responseData;
    } else {
      return responseData.detail || responseData;
    }
  } else {
    return responseData;
  }
}

/**
 * 第二个API调用函数
 * @param {Array} messages - 消息数组
 * @param {string} model - 模型名称
 * @returns {Promise<string|null>} - 返回响应内容或null
 */
export async function YTapi2(messages, model) {
  let dirpath = `${_path}/data/YTotherai`;
  const dataPath = path.join(dirpath, "data.json");
  const data = JSON.parse(await fs.promises.readFile(dataPath, "utf-8"));
  const token = data.chatgpt.stoken;
  try {
    const url = 'https://yuanpluss.online:3000/api/v1/chat/completions';
    const data = {
      model,
      messages
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    const responseData = await response.json();
    if (responseData.error) {
      return responseData.error;
    }
    console.log(responseData);
    return responseData?.choices[0]?.message?.content;
  } catch (error) {
    console.log(error);
    return null;
  }
}