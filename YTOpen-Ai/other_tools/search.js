import { FreeSearchTool } from '../functions_tools/SearchInformationTool.js';
import { WebParserTool } from '../functions_tools/webParserTool.js';
import { PuppeteerToText } from '../functions_tools/puppeteer/WebContentExtractor.js';
import path from 'path';
import fs from 'fs';

const processLastContentAsync = async (arr, customString) => {
  if (!arr || arr.length === 0) return arr;

  return arr.map((item, index) =>
    index === arr.length - 1 ? { ...item, content: "我的问题是: " + String(item.content) + "\n下面是提供的相关搜索结果:\n" + customString + "\n\n请结合搜索结果回答我的问题" } : item
  );
};
/**
 * 搜索工具函数：封装了 WebParserTool 和 FreeSearchTool，并根据需要将其转换为 OpenAI 兼容的格式。
 * @param {Array<object>} messages - 消息数组，包含用户输入等信息。
 * @returns {Promise<any>} - 异步返回搜索结果，如果出错则返回 false。
 */
async function SearchTools(messages) {
  const webParserTool = new WebParserTool();
  const freeSearchTool = new FreeSearchTool();

  // 工具定义：描述了可用的工具及其参数，供 OpenAI 模型选择使用。
  const functions = [
    {
      name: webParserTool.name,
      description: webParserTool.description,
      parameters: webParserTool.parameters
    },
    {
      name: freeSearchTool.name,
      description: freeSearchTool.description,
      parameters: freeSearchTool.parameters
    }
  ];

  // 使用 Map 优化工具查找：将工具名称与工具对象关联，提升查找效率。
  const functionMap = new Map(functions.map(func => [func.name, func]));

  /**
   * 根据工具名称列表获取对应的工具，并转换为 OpenAI tools 格式。
   * @param {Array<string>} toolNames - 工具名称数组。
   * @returns {Array<object>} - OpenAI 兼容的工具列表。
   */
  const getToolsByName = (toolNames) => {
    return toolNames.map(toolName => {
      const func = functionMap.get(toolName);
      if (!func) {
        console.warn(`未找到名为 "${toolName}" 的工具.`);
        return null; // 返回 null 而不是跳过，以便在后续过滤掉
      }
      return {
        type: 'function',
        function: {
          name: func.name,
          description: func.description,
          parameters: {
            type: 'object',
            properties: func.parameters.properties,
            required: func.parameters.required || [] // 确保 required 存在
          }
        }
      };
    }).filter(Boolean); // 使用 filter(Boolean) 清除 null 值
  };

  // 获取指定工具并转换为 OpenAI 格式。
  const tools = getToolsByName(['freeSearchTool', 'webParserTool']);

  // 调用 YTapi 接口，并打印返回数据。
  const data = await YTapi(messages, tools);
  console.log(data);
  return data;
}

/**
 * YTapi 函数：与远Pluss在线API交互，进行工具调用。
 * @param {Array<object>} messages - 消息数组，包含用户输入等信息。
 * @param {Array<object>} tools - OpenAI 兼容的工具列表。
 * @returns {Promise<any>} - 异步返回 API 响应数据，如果出错则返回 false。
 */
async function YTapi(messages, tools) {
  // 使用更简洁的路径拼接方式
  const dataPath = path.join(process.cwd(), 'data', 'YTotherai', "data.json");

  try {
    // 使用 fs.promises.readFile 读取文件内容，避免回调地狱
    const data = JSON.parse(await fs.promises.readFile(dataPath, "utf-8"));
    const token = data.chatgpt.stoken;

    const url = 'https://yuanpluss.online:3000/api/v1/4o/fc';
    const requestData = {
      messages: [{
        role: "system",
        content: "你是一个Ai搜索助手，需要判断用户的问题是否需要进行搜索。不要使用你自己的知识，如果不需要搜索相关，直接反馈'<No need to search>'"
      },
      {
        role: "user",
        content: "你是谁"
      },
      {
        role: "assistant",
        content: "<No need to search>"
      },
      messages[messages.length - 1]
      ],
      tools
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    const responseData = await response.json();

    if (responseData.error) {
      console.error("YTapi error:", responseData.error); // 更详细的错误信息
      return false; // 返回 false 标志错误
    }
    console.log("YTapi response:", responseData);

    // 提取工具调用参数，添加空值判断
    const toolCalls = responseData?.choices?.[0]?.message?.tool_calls;
    if (!toolCalls || toolCalls.length === 0) {
      console.warn("No tool calls found in the response.");
      return false; // 如果没有工具调用，返回 false
    }

    const argumentsString = toolCalls[0]?.function?.arguments;

    if (!argumentsString) {
      console.warn("No arguments found in tool call.");
      return false; // 如果没有参数，返回 false
    }

    // 优化 JSON 解析方式，避免重复解析，并处理解析失败情况
    try {
      const parsedArguments = JSON.parse(argumentsString);
      console.log("Parsed arguments:", parsedArguments);

      return parsedArguments;
    } catch (parseError) {
      console.error("Error parsing JSON arguments:", parseError);
      return false; // JSON 解析失败返回 false
    }
  } catch (error) {
    console.error("YTapi request failed:", error);
    return false; // 请求失败返回 false
  }
}

/**
 * Search 函数：在线搜索API交互。
 * @param {string} q - 搜索查询字符串。
 * @returns {Promise<any>} - 异步返回 API 响应数据，如果出错则返回 false。
 */
export async function SearchMessages(messages) {
  try {
    const keywords = ['查', '搜', '找', '看'];
    const content = messages[messages.length - 1].content;
    const key = keywords.some(keyword => content.includes(keyword));
    if (!key) { 
      return messages; 
    }
    const url = 'https://yuanpluss.online:3000/v1/search';
    const q = await SearchTools(messages);
    console.log(key)
    if (!q.query || !q.url) { 
      return messages; 
    }

    if (q.query) {
      const data = {
        q: q.query
      };
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'sk-114514',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();

      if (responseData.error) {
        console.error("error:", responseData.error);
        return messages;
      }

      return await processLastContentAsync(messages, JSON.stringify(responseData, null, 2));
    } else if (q.url) {
      const details = await PuppeteerToText(q.url);
      return await processLastContentAsync(messages, JSON.stringify(details, null, 2));
    }
  } catch (error) {
    console.error("Search API request failed:", error);
    return messages;
  }
}