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
  
  // 转换 providers 为小写以进行比较
  const provider = config.providers?.toLowerCase();
  
  try {
    let url, headers, finalRequestData;
    
    if (provider === 'gemini') {
      url = 'https://api-proxy.me/gemini/v1beta/chat/completions';
      headers = {
        'Authorization': `Bearer ${config.geminiApikey[0]}`,
        'Content-Type': 'application/json'
      };
     // 为 Gemini 修改请求数据
     finalRequestData = {
      ...requestData,
      model: "gemini-2.0-flash-exp"
    };
  } else {
    url = 'https://yuanpluss.online:3000/api/v1/4o/fc';
    headers = {
      'Authorization': `Bearer ${data.chatgpt.stoken}`,
      'Content-Type': 'application/json'
    };
    finalRequestData = requestData;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(finalRequestData)
  });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP错误! 状态: ${response.status}, 信息: ${errorData}`);
    }

    const responseData = await response.json();
    console.log(`${provider || 'OpenAI'} 响应:`, responseData);
    return responseData;
    
  } catch (error) {
    console.error('YTapi 错误:', error);
    return null;
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