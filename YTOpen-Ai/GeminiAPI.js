import fs from "fs";
import YAML from "yaml";
import path from "path";
import fetch from "node-fetch";
import { getBase64File } from "../utils/fileUtils.js";

/**
 * 统一的Gemini API调用函数
 * @param {Object|String} input - OpenAI格式的请求对象或普通文本
 * @param {Array} imageUrls - 图片URL数组 (可选)
 * @param {Object} options - 配置选项
 * @param {String} options.model - 模型名称 (默认: gemini-1.5-pro)
 * @param {Boolean} options.useTools - 是否使用工具 (默认: false)
 * @param {Array} options.tools - 要使用的工具列表
 * @param {Object} options.config - 生成配置
 * @param {Array} options.responseModalities - 响应模态 (默认: ['TEXT'])
 * @param {Boolean} options.returnRawResponse - 是否返回原始响应 (默认: false)
 * @returns {Promise<Object>} 返回处理结果
 */
export async function callGeminiAPI(input, imageUrls = [], options = {}) {
  // 配置路径
  const configPath = path.join(process.cwd(), 'plugins/y-tian-plugin/config/message.yaml');
  const configFile = fs.readFileSync(configPath, 'utf8');
  const config = YAML.parse(configFile);

  // 获取API密钥
  const apiKeys = config.pluginSettings.geminiApikey || [];
  if (!apiKeys.length) {
    return { error: '未配置Gemini API密钥，请在配置文件中添加' };
  }

  // 获取API代理URL
  const apiUrls = config.pluginSettings.GeminiProxyList;

  // 设置默认选项
  const defaultOptions = {
    model: 'gemini-2.0-flash',
    useTools: false,
    tools: [],
    responseModalities: ['TEXT'],
    returnRawResponse: false,
    config: {
      temperature: 0.7,
      maxOutputTokens: 2048,
      topP: 0.95,
      topK: 40,
    },
    retryAttempts: 1
  };

  // 合并选项
  const finalOptions = { ...defaultOptions, ...options };
  const MODEL_NAME = finalOptions.model;

  // 特殊模型支持映射
  const supportedModalities = {
    'gemini-2.0-flash-exp-image-generation': ['TEXT', 'IMAGE'],
    'gemini-1.5-flash': ['TEXT'],
    'gemini-1.5-pro': ['TEXT'],
    'gemini-1.0-pro': ['TEXT'],
    'gemini-1.0-pro-vision': ['TEXT'],
  };

  let retryAttempt = 0;
  let lastApiKeyIndex = -1;
  let lastApiUrlIndex = -1;

  /**
   * 将OpenAI格式转换为Gemini格式
   */
  function convertOpenAIToGemini(openAIMessages) {
    // 如果传入的是单个消息对象，将其包装为数组
    const messages = Array.isArray(openAIMessages) ? openAIMessages : [openAIMessages];

    return messages.map(message => {
      // 将OpenAI的assistant角色映射为Gemini的model角色
      const role = message.role === "assistant" ? "model" : (message.role === "system" ? "user" : message.role);
      const parts = [];

      // 处理content是字符串的情况
      if (typeof message.content === "string") {
        parts.push({ text: message.content });
      }
      // 处理content是数组的情况（多模态）
      else if (Array.isArray(message.content)) {
        message.content.forEach(item => {
          if (item.type === "text") {
            parts.push({ text: item.text });
          } else if (item.type === "image_url") {
            // 提取base64数据，删除前缀
            let imageData = item.image_url.url;
            if (imageData.startsWith('data:image/')) {
              imageData = imageData.split(',')[1];
            }

            // 确定正确的MIME类型
            let mimeType = 'image/jpeg';
            if (item.image_url.url.includes('image/png')) mimeType = 'image/png';
            if (item.image_url.url.includes('image/webp')) mimeType = 'image/webp';

            parts.push({
              inline_data: {
                mime_type: mimeType,
                data: imageData
              }
            });
          }
        });
      }

      // 返回转换后的Gemini格式消息
      return { role, parts };
    });
  }

  /**
   * 提取base64数据
   */
  const extractValidBase64 = (base64String) => {
    if (typeof base64String !== 'string') return base64String;
    const dataPrefix = /^data:image\/[a-zA-Z]+;base64,/;
    return base64String.replace(dataPrefix, '');
  };

  /**
   * 主函数：处理并发送请求到Gemini API
   */
  const processRequest = async () => {
    let apiKeyIndex;
    let apiUrlIndex;

    // 确保每次重试都使用不同的 API Key
    do {
      apiKeyIndex = Math.floor(Math.random() * apiKeys.length);
    } while (apiKeyIndex === lastApiKeyIndex && apiKeys.length > 1);
    const apiKey = apiKeys[apiKeyIndex];
    lastApiKeyIndex = apiKeyIndex;

    // 确保每次重试都使用不同的 API URL
    do {
      apiUrlIndex = Math.floor(Math.random() * apiUrls.length);
    } while (apiUrlIndex === lastApiUrlIndex && apiUrls.length > 1);
    const apiUrl = apiUrls[apiUrlIndex];
    lastApiUrlIndex = apiUrlIndex;

    try {
      // 处理输入内容
      let contents;

      // 检查输入是否为OpenAI格式
      if (typeof input === 'object' && input.messages) {
        // 转换OpenAI格式为Gemini格式
        contents = convertOpenAIToGemini(input.messages);
      } else {
        // 如果是普通文本，转为Gemini格式
        const parts = [{ text: input.toString() }];

        // 处理图片
        if (imageUrls && imageUrls.length > 0) {
          for (let i = 0; i < imageUrls.length; i++) {
            const fileName = `${i + 1}.png`;
            let imageData;

            // 处理不同类型的图片URLs
            if (imageUrls[i].startsWith('data:')) {
              // 已经是base64格式
              imageData = extractValidBase64(imageUrls[i]);
            } else {
              // 需要下载图片并转换为base64
              imageData = await getBase64File(imageUrls[i], fileName, 'img');
              imageData = extractValidBase64(imageData);
            }

            parts.push({
              inline_data: {
                mime_type: 'image/webp', // 默认mime类型
                data: imageData,
              },
            });
          }
        }

        contents = [{
          role: "user",
          parts: parts
        }];
      }

      // 准备请求体
      const requestBody = {
        contents: contents,
        generation_config: {
          ...finalOptions.config,
        }
      };

      //console.log(JSON.stringify(requestBody, null, 2))
      // 设置响应模态
      if (finalOptions.responseModalities && finalOptions.responseModalities.length > 0) {
        requestBody.generation_config.response_modalities = finalOptions.responseModalities;
      } else if (supportedModalities[MODEL_NAME]) {
        // 如果未指定，使用默认模型支持的模态
        requestBody.generation_config.response_modalities = supportedModalities[MODEL_NAME];
      }

      // 如果需要使用工具，添加tools参数
      if (finalOptions.useTools && finalOptions.tools && finalOptions.tools.length > 0) {
        requestBody.tools = finalOptions.tools;
      }

      console.log(`Using API URL: ${apiUrl}`);

      // 发送请求
      const response = await fetch(
        `${apiUrl}/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'GEMINI_API_KEY': apiKey,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorStatus = response.status;
        const errorBody = await response.text();
        console.error(`HTTP错误! 状态码: ${errorStatus}`, '错误详情:', errorBody);
        return { error: `API请求失败 (${errorStatus})` };
      }

      const data = await response.json();

      console.log(data)
      // 如果设置了返回原始响应，直接返回
      if (finalOptions.returnRawResponse) {
        return data;
      }

      const candidates = data.candidates || [];
      if (candidates.length === 0) {
        return { error: "响应中未找到候选结果" };
      }

      const firstCandidate = candidates[0];
      if (firstCandidate.finishReason === 'IMAGE_SAFETY') {
        if (retryAttempt < finalOptions.retryAttempts) {
          retryAttempt++;
          console.log(`图像安全规则错误，第 ${retryAttempt} 次重试...`);
          return await processRequest();
        } else {
          return { error: '失败了，可能图像违反了Google的安全规则或文字描述违规' };
        }
      }

      const parts = firstCandidate.content?.parts || [];
      const toolResults = firstCandidate.content?.toolResults || [];

      // 提取搜索结果或grounding元数据（如果有）
      const groundingMetadata = firstCandidate.groundingMetadata || {};

      return {
        parts: parts,
        toolResults: toolResults,
        groundingMetadata: groundingMetadata,
        raw: data
      };

    } catch (error) {
      console.error('请求过程中发生错误:', error);

      // 检查是否是网络错误，如果是，则进行重试
      if ((error.message.includes('socket hang up') || error.message.includes('Failed to fetch') || error.message.includes('request to')) && retryAttempt < finalOptions.retryAttempts) {
        retryAttempt++;
        console.log(`网络错误，第 ${retryAttempt} 次重试...`);
        return await processRequest();
      } else {
        return {
          error: error.message,
          isNetworkError: error.message.includes('socket hang up') || error.message.includes('Failed to fetch') || error.message.includes('request to')
        };
      }
    }
  };

  // 执行请求
  return await processRequest();
}

/**
 * 处理Gemini返回的结果
 * @param {Object} result - Gemini API返回的结果
 * @param {Object} e - 消息事件对象，用于回复
 * @param {Object} options - 处理选项
 * @param {Boolean} options.includeRawOutput - 是否包含原始输出信息
 * @returns {Object} 包含处理结果的对象 { hasImages: boolean, textContent: string | null }
 */
export async function handleGeminiImage(result, e, options = { includeRawOutput: false }) {
  // 错误处理
  if (result.error) {
    //e.reply(result.isNetworkError ? '网络出现问题，请稍后再试' : `处理请求时发生错误: ${result.error}`);
    return { hasImages: false, textContent: null };
  }

  // 确保存储目录存在
  const resourceDir = './resources';
  if (!fs.existsSync(resourceDir)) {
    fs.mkdirSync(resourceDir, { recursive: true });
  }

  const timestamp = Date.now();
  const textParts = [];
  const imageParts = [];
  let hasContent = false;

  // 处理函数：处理单个响应部分
  const processPart = (part, index, isRaw = false) => {
    if (part.text !== undefined && part.text.trim()) {
      textParts.push(part.text.trim());
      hasContent = true;
    } else if (part.inlineData?.data) {
      const outputPath = `${resourceDir}/Gemini_${timestamp}_${isRaw ? 'raw_' : ''}${index}.png`;
      try {
        fs.writeFileSync(outputPath, Buffer.from(part.inlineData.data, 'base64'));
        imageParts.push(segment.image(outputPath));
        hasContent = true;
      } catch (error) {
        console.error('处理图像时出错:', error);
        textParts.push('[图像处理失败]');
      }
    }
  };

  // 处理API响应
  if (result.candidates && Array.isArray(result.candidates)) {
    const candidate = result.candidates[0];
    if (candidate?.content?.parts) {
      candidate.content.parts.forEach((part, index) => processPart(part, index));
    }

    // 处理grounding和token信息
    if (options.includeRawOutput) {
      if (candidate.groundingMetadata) {
        const metadata = candidate.groundingMetadata;
        if (metadata.webSearchQueries?.length) {
          textParts.push(`\n搜索查询: ${metadata.webSearchQueries.join(', ')}`);
        }
        if (metadata.groundingChunks?.length) {
          textParts.push("\n参考来源:");
          metadata.groundingChunks.forEach((chunk, index) => {
            if (chunk.web?.title && chunk.web?.uri) {
              textParts.push(`${index + 1}. ${chunk.web.title} (${chunk.web.uri})`);
            }
          });
        }
      }
      if (result.usageMetadata) {
        textParts.push(`\n总计使用: ${result.usageMetadata.totalTokenCount || 0} tokens`);
      }
    }
  } else if (result.parts?.length > 0) {
    // 处理标准响应
    result.parts.forEach((part, index) => processPart(part, index));
  } else if (result.raw?.candidates?.[0]?.content?.parts) {
    // 处理原始响应
    result.raw.candidates[0].content.parts.forEach((part, index) => processPart(part, index, true));
  }

  // 处理工具结果
  if (result.toolResults?.length) {
    textParts.push("工具调用结果:");
    result.toolResults.forEach(toolResult => {
      if (toolResult.name) {
        textParts.push(`工具: ${toolResult.name}`);
      }
      if (toolResult.result) {
        textParts.push(JSON.stringify(toolResult.result, null, 2));
      }
    });
  }

  // 处理grounding信息
  if (options.includeRawOutput && result.groundingMetadata) {
    const metadata = result.groundingMetadata;
    if (metadata.webSearchQueries?.length) {
      textParts.push(`\n搜索查询: ${metadata.webSearchQueries.join(', ')}`);
    }
    if (metadata.groundingChunks?.length) {
      textParts.push("\n参考来源:");
      metadata.groundingChunks.forEach((chunk, index) => {
        if (chunk.web?.title && chunk.web?.uri) {
          textParts.push(`${index + 1}. ${chunk.web.title} (${chunk.web.uri})`);
        }
      });
    }
  }

  if (hasContent) {
    const textContent = textParts.length > 0 ? textParts.join('\n') : null;

    // 如果有图片，单独发送图片
    if (imageParts.length > 0) {
      e.reply(imageParts);
    }

    return {
      hasImages: imageParts.length > 0,
      textContent
    };
  }

  // 处理失败情况
  console.error('无有效响应内容，原始数据:', JSON.stringify(result, null, 2));
  //e.reply('生成内容失败，没有有效的响应内容');
  return { hasImages: false, textContent: null };
}


/**
 * 处理Gemini返回的结果
 * @param {Object} result - Gemini API返回的结果
 * @param {Object} e - 消息事件对象，用于回复
 * @param {Object} options - 处理选项
 * @param {Boolean} options.includeRawOutput - 是否包含原始输出信息
 * @returns {Boolean} 处理是否成功
 */
export async function handleGeminiResult(result, e, options = { includeRawOutput: false }) {
  if (result.error) {
    if (result.isNetworkError) {
      e.reply('网络出现问题，请稍后再试');
    } else {
      e.reply(`处理请求时发生错误: ${result.error}`);
    }
    return false;
  }

  // 确保存储目录存在
  const resourceDir = './resources';
  if (!fs.existsSync(resourceDir)) {
    fs.mkdirSync(resourceDir, { recursive: true });
  }

  const timestamp = Date.now();
  const responseMessages = [];
  let hasContent = false;

  // 检查是否为原始API响应格式
  if (result.candidates && Array.isArray(result.candidates)) {
    // 这是原始API响应
    const candidate = result.candidates[0];
    if (candidate && candidate.content && candidate.content.parts) {
      // 严格按照返回的顺序处理每个部分
      for (let i = 0; i < candidate.content.parts.length; i++) {
        const part = candidate.content.parts[i];

        // 处理文本部分
        if (part.text !== undefined) {
          if (part.text.trim()) {
            responseMessages.push(part.text);
            hasContent = true;
          }
        }

        // 处理图像部分
        else if (part.inlineData?.data) {
          const outputPath = `${resourceDir}/Gemini_${timestamp}_${i}.png`;
          try {
            fs.writeFileSync(outputPath, Buffer.from(part.inlineData.data, 'base64'));
            responseMessages.push(segment.image(outputPath));
            hasContent = true;
          } catch (error) {
            console.error('处理图像时出错:', error);
            responseMessages.push('[图像处理失败]');
          }
        }
      }
    }

    // 处理grounding信息
    if (candidate.groundingMetadata && options.includeRawOutput) {
      const metadata = candidate.groundingMetadata;
      if (metadata.webSearchQueries && metadata.webSearchQueries.length > 0) {
        responseMessages.push(`\n搜索查询: ${metadata.webSearchQueries.join(', ')}`);
      }

      if (metadata.groundingChunks && metadata.groundingChunks.length > 0) {
        responseMessages.push("\n参考来源:");
        metadata.groundingChunks.forEach((chunk, index) => {
          if (chunk.web?.title && chunk.web?.uri) {
            responseMessages.push(`${index + 1}. ${chunk.web.title} (${chunk.web.uri})`);
          }
        });
      }
    }

    // 包含使用的token信息
    if (result.usageMetadata && options.includeRawOutput) {
      responseMessages.push(`\n总计使用: ${result.usageMetadata.totalTokenCount || 0} tokens`);
    }

  } else {
    // 这是标准处理后的响应

    // 按照原始顺序处理parts数组
    if (result.parts && result.parts.length > 0) {
      for (let i = 0; i < result.parts.length; i++) {
        const part = result.parts[i];

        // 处理文本部分
        if (part.text !== undefined) {
          if (part.text.trim()) {
            responseMessages.push(part.text);
            hasContent = true;
          }
        }

        // 处理图像部分
        else if (part.inlineData?.data) {
          const outputPath = `${resourceDir}/Gemini_${timestamp}_${i}.png`;
          try {
            fs.writeFileSync(outputPath, Buffer.from(part.inlineData.data, 'base64'));
            responseMessages.push(segment.image(outputPath));
            hasContent = true;
          } catch (error) {
            console.error('处理图像时出错:', error);
            responseMessages.push('[图像处理失败]');
          }
        }
      }
    }

    // 如果标准处理没有产生内容，尝试从原始响应中提取
    if (!hasContent && result.raw && result.raw.candidates &&
      result.raw.candidates.length > 0 && result.raw.candidates[0].content) {

      const rawParts = result.raw.candidates[0].content.parts || [];
      // 严格按照返回的顺序处理原始响应中的每个部分
      for (let i = 0; i < rawParts.length; i++) {
        const part = rawParts[i];

        // 处理文本部分
        if (part.text !== undefined) {
          if (part.text.trim()) {
            responseMessages.push(part.text);
            hasContent = true;
          }
        }

        // 处理图像部分
        else if (part.inlineData?.data) {
          const outputPath = `${resourceDir}/Gemini_${timestamp}_raw_${i}.png`;
          try {
            fs.writeFileSync(outputPath, Buffer.from(part.inlineData.data, 'base64'));
            responseMessages.push(segment.image(outputPath));
            hasContent = true;
          } catch (error) {
            console.error('处理原始图像数据时出错:', error);
            responseMessages.push('[图像处理失败]');
          }
        }
      }
    }

    // 处理工具结果
    if (result.toolResults && result.toolResults.length > 0) {
      responseMessages.push("工具调用结果:");
      for (const toolResult of result.toolResults) {
        if (toolResult.name) {
          responseMessages.push(`工具: ${toolResult.name}`);
        }
        if (toolResult.result) {
          responseMessages.push(JSON.stringify(toolResult.result, null, 2));
        }
      }
    }

    // 处理grounding信息
    if (result.groundingMetadata && options.includeRawOutput) {
      const metadata = result.groundingMetadata;
      if (metadata.webSearchQueries && metadata.webSearchQueries.length > 0) {
        responseMessages.push(`\n搜索查询: ${metadata.webSearchQueries.join(', ')}`);
      }

      if (metadata.groundingChunks && metadata.groundingChunks.length > 0) {
        responseMessages.push("\n参考来源:");
        metadata.groundingChunks.forEach((chunk, index) => {
          if (chunk.web?.title && chunk.web?.uri) {
            responseMessages.push(`${index + 1}. ${chunk.web.title} (${chunk.web.uri})`);
          }
        });
      }
    }
  }

  // 发送响应
  if (hasContent && responseMessages.length > 0) {
    e.reply(responseMessages);
    return true;
  } else {
    // 记录详细错误信息以便调试
    console.error('无有效响应内容，原始数据:', JSON.stringify(result, null, 2));
    e.reply('生成内容失败，没有有效的响应内容');
    return false;
  }
}

/**
 * 处理Gemini返回的结果并返回处理后的数据对象，不发送消息
 * @param {Object} result - Gemini API返回的结果
 * @param {Object} options - 处理选项
 * @param {Boolean} options.includeRawOutput - 是否包含原始输出信息
 * @param {Boolean} options.saveImages - 是否保存图像到本地 (默认: true)
 * @param {String} options.resourceDir - 资源保存目录 (默认: './resources')
 * @returns {Object} 包含处理后文本、图像路径和元数据的对象
 */
export async function GeminiResult(result, options = {}) {
  // 设置默认选项
  const defaultOptions = {
    includeRawOutput: false,
    saveImages: true,
    resourceDir: './resources'
  };

  const finalOptions = { ...defaultOptions, ...options };

  // 初始化返回结果对象
  const processedResult = {
    success: false,
    textContent: [],
    imagePaths: [],
    imageBase64: [],
    metadata: {},
    error: null,
    raw: finalOptions.includeRawOutput ? result : undefined
  };

  // 检查结果是否包含错误
  if (result.error) {
    processedResult.error = result.error;
    processedResult.isNetworkError = result.isNetworkError || false;
    return processedResult;
  }

  // 确保存储目录存在
  if (finalOptions.saveImages) {
    if (!fs.existsSync(finalOptions.resourceDir)) {
      fs.mkdirSync(finalOptions.resourceDir, { recursive: true });
    }
  }

  const timestamp = Date.now();
  let hasContent = false;

  // 检查是否为原始API响应格式
  if (result.candidates && Array.isArray(result.candidates)) {
    // 处理原始API响应
    const candidate = result.candidates[0];
    if (candidate && candidate.content && candidate.content.parts) {
      // 按顺序处理每个部分
      for (let i = 0; i < candidate.content.parts.length; i++) {
        const part = candidate.content.parts[i];

        // 处理文本部分
        if (part.text !== undefined) {
          if (part.text.trim()) {
            processedResult.textContent.push(part.text);
            hasContent = true;
          }
        }

        // 处理图像部分
        else if (part.inlineData?.data) {
          const imageBase64 = part.inlineData.data;
          processedResult.imageBase64.push(imageBase64);

          if (finalOptions.saveImages) {
            const outputPath = `${finalOptions.resourceDir}/Gemini_${timestamp}_${i}.png`;
            try {
              fs.writeFileSync(outputPath, Buffer.from(imageBase64, 'base64'));
              processedResult.imagePaths.push(outputPath);
              hasContent = true;
            } catch (error) {
              console.error('处理图像时出错:', error);
              processedResult.error = `图像处理失败: ${error.message}`;
            }
          } else {
            hasContent = true;
          }
        }
      }
    }

    // 处理元数据信息
    if (candidate) {
      // Grounding信息
      if (candidate.groundingMetadata) {
        processedResult.metadata.grounding = candidate.groundingMetadata;
      }

      // Finish reason信息
      if (candidate.finishReason) {
        processedResult.metadata.finishReason = candidate.finishReason;
      }

      // 安全评级信息
      if (candidate.safetyRatings) {
        processedResult.metadata.safetyRatings = candidate.safetyRatings;
      }
    }

    // 使用的token信息
    if (result.usageMetadata) {
      processedResult.metadata.usage = result.usageMetadata;
    }

  } else {
    // 处理标准处理后的响应

    // 按照顺序处理parts数组
    if (result.parts && result.parts.length > 0) {
      for (let i = 0; i < result.parts.length; i++) {
        const part = result.parts[i];

        // 处理文本部分
        if (part.text !== undefined) {
          if (part.text.trim()) {
            processedResult.textContent.push(part.text);
            hasContent = true;
          }
        }

        // 处理图像部分
        else if (part.inlineData?.data) {
          const imageBase64 = part.inlineData.data;
          processedResult.imageBase64.push(imageBase64);

          if (finalOptions.saveImages) {
            const outputPath = `${finalOptions.resourceDir}/Gemini_${timestamp}_${i}.png`;
            try {
              fs.writeFileSync(outputPath, Buffer.from(imageBase64, 'base64'));
              processedResult.imagePaths.push(outputPath);
              hasContent = true;
            } catch (error) {
              console.error('处理图像时出错:', error);
              processedResult.error = `图像处理失败: ${error.message}`;
            }
          } else {
            hasContent = true;
          }
        }
      }
    }

    // 如果标准处理没有产生内容，尝试从原始响应中提取
    if (!hasContent && result.raw && result.raw.candidates &&
      result.raw.candidates.length > 0 && result.raw.candidates[0].content) {

      const rawParts = result.raw.candidates[0].content.parts || [];
      // 按照返回的顺序处理原始响应中的每个部分
      for (let i = 0; i < rawParts.length; i++) {
        const part = rawParts[i];

        // 处理文本部分
        if (part.text !== undefined) {
          if (part.text.trim()) {
            processedResult.textContent.push(part.text);
            hasContent = true;
          }
        }

        // 处理图像部分
        else if (part.inlineData?.data) {
          const imageBase64 = part.inlineData.data;
          processedResult.imageBase64.push(imageBase64);

          if (finalOptions.saveImages) {
            const outputPath = `${finalOptions.resourceDir}/Gemini_${timestamp}_raw_${i}.png`;
            try {
              fs.writeFileSync(outputPath, Buffer.from(imageBase64, 'base64'));
              processedResult.imagePaths.push(outputPath);
              hasContent = true;
            } catch (error) {
              console.error('处理原始图像数据时出错:', error);
              processedResult.error = `图像处理失败: ${error.message}`;
            }
          } else {
            hasContent = true;
          }
        }
      }
    }

    // 处理工具结果
    if (result.toolResults && result.toolResults.length > 0) {
      processedResult.metadata.toolResults = result.toolResults;
    }

    // 处理grounding信息
    if (result.groundingMetadata) {
      processedResult.metadata.grounding = result.groundingMetadata;
    }
  }

  // 设置处理结果状态
  processedResult.success = hasContent;

  // 如果没有有效内容，添加错误信息
  if (!hasContent) {
    processedResult.error = '生成内容失败，没有有效的响应内容';
    console.error('无有效响应内容，原始数据:', JSON.stringify(result, null, 2));
  }

  return processedResult;
}

/**
 * 处理Gemini返回的结果并合并文本内容及搜索结果
 * @param {Object} result - Gemini API返回的结果
 * @param {Object} options - 处理选项
 * @returns {String} 合并后的文本内容和搜索结果
 */
export async function processGeminiResult(result, options = {}) {
  // 设置默认选项
  const defaultOptions = {
    includeRawOutput: false,
    saveImages: false, // 不保存图像
    resourceDir: './resources'
  };

  const finalOptions = { ...defaultOptions, ...options };

  // 初始化返回结果字符串
  let resultString = "";

  // 检查结果是否包含错误
  if (result.error) {
    console.error('错误:', result.error);
    return `错误: ${result.error}`;
  }

  let hasContent = false;

  // 检查是否为原始API响应格式
  if (result.candidates && Array.isArray(result.candidates)) {
    const candidate = result.candidates[0];
    if (candidate && candidate.content && candidate.content.parts) {
      // 处理文本部分
      for (const part of candidate.content.parts) {
        if (part.text) {
          resultString += `${part.text}\n`;
          hasContent = true;
        }
      }

      // 处理Grounding信息中的搜索查询和结果
      if (candidate.groundingMetadata) {
        const metadata = candidate.groundingMetadata;

        // 提取搜索结果
        if (metadata.groundingChunks && metadata.groundingChunks.length > 0) {
          metadata.groundingChunks.forEach(chunk => {
            if (chunk.web?.title && chunk.web?.uri) {
              //resultString += `[${chunk.web.title}](${chunk.web.uri})\n`;
            }
          });
        }
      }
    }
  } else {
    if (result.parts && result.parts.length > 0) {
      for (const part of result.parts) {
        if (part.text) {
          resultString += `${part.text}\n`;
          hasContent = true;
        }
      }
    }
  }

  if (!hasContent) {
    console.error('无有效响应内容，原始数据:', JSON.stringify(result, null, 2));
    return '生成内容失败，没有有效的响应内容';
  }

  return resultString.trim();
}

/**
 * 使用示例:
 */

// 示例1: 普通文本查询
async function exampleTextQuery(e) {
  const result = await callGeminiAPI("写一首关于春天的诗");
  return await handleGeminiResult(result, e);
}

// 示例2: 带图片的查询
async function exampleImageQuery(e) {
  const imageUrls = ["https://example.com/image.jpg"];
  const result = await callGeminiAPI("这张图片是什么?", imageUrls);
  return await handleGeminiResult(result, e);
}

// 示例3: 使用OpenAI格式的查询
async function exampleOpenAIFormatQuery(e) {
  const openAIFormat = {
    messages: [
      { role: "system", content: "你是一个专业的写作助手。" },
      { role: "user", content: "帮我写一篇关于环保的短文。" }
    ]
  };
  const result = await callGeminiAPI(openAIFormat);
  return await handleGeminiResult(result, e);
}

// 示例4: 使用特定模型和响应模态
async function exampleImageGenerationQuery(e) {
  const result = await callGeminiAPI("绘制一个海边的风景", [], {
    model: "gemini-2.0-flash-exp-image-generation",
    responseModalities: ['TEXT', 'IMAGE'],
    config: {
      temperature: 1.0,
      maxOutputTokens: 4096
    }
  });
  return await handleGeminiResult(result, e);
}

// 示例5: 使用Google搜索工具并获取原始响应
async function exampleSearchToolQuery(e) {
  const result = await callGeminiAPI("北京明天天气", [], {
    model: "gemini-2.0-flash",
    useTools: true,
    tools: [
      {
        googleSearch: {}
      }
    ],
    returnRawResponse: true  // 返回原始响应
  });
  return await handleGeminiResult(result, e, { includeRawOutput: true });
}

// 示例6: 自定义响应模态
async function exampleCustomModalitiesQuery(e) {
  const result = await callGeminiAPI("设计一个简单的网站logo", [], {
    model: "gemini-1.5-pro",
    responseModalities: ['TEXT', 'IMAGE'],  // 请求同时返回文本和图像
    config: {
      temperature: 0.8
    }
  });
  return await handleGeminiResult(result, e);
}