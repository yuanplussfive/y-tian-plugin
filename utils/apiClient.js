import { dependencies } from "../YTdependence/dependencies.js";
const { _path, fetch, fs, path } = dependencies;

/**
 * 发送请求到 OpenAI API 并处理响应
 * @param {Object} requestData - 请求体数据
 * @returns {Object|null} - 返回 OpenAI 的响应数据
 */
export async function YTapi(requestData) {
  const dirpath = `${_path}/data/YTotherai`;
  const dataPath = dirpath + "/data.json";
  const data = JSON.parse(await fs.promises.readFile(dataPath, "utf-8"));
  const token = data.chatgpt.stoken;

  try {
    const url = 'https://yuanpluss.online:3000/api/v1/4o/fc';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP错误! 状态: ${response.status}, 信息: ${errorData}`);
    }

    const responseData = await response.json();


    console.log('OpenAI 响应:', responseData); 
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