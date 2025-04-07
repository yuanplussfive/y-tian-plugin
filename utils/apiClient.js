import { dependencies } from "../YTdependence/dependencies.js";
const { _path, fetch, fs, path } = dependencies;

/**
 * 发送请求到 OpenAI API 或其他提供者并处理响应
 * @param {Object} requestData - 请求体数据
 * @param {Object} config - 配置对象
 * @returns {Object|null} - 返回处理后的响应数据或错误信息
 */
export async function YTapi(requestData, config) {
    console.log('Request Data:', requestData);
    const dirpath = `${_path}/data/YTotherai`;
    const dataPath = path.join(dirpath, "data.json");

    // 读取配置文件
    let data;
    try {
        const dataString = await fs.promises.readFile(dataPath, "utf-8");
        data = JSON.parse(dataString);
    } catch (readError) {
        console.error("Failed to read data.json:", readError);
        return { error: `Failed to read config file: ${readError.message}` };
    }

    const provider = config.providers?.toLowerCase();

    try {
        let url, headers, finalRequestData;

        if (provider === 'gemini') {
            // Gemini API 请求逻辑
            const urls = config.GeminiProxyList;
            if (!urls?.length) return { error: "Gemini proxy list is not configured" };
            const currentUrl = urls[Math.floor(Math.random() * urls.length)];
            url = `${currentUrl}/v1beta/chat/completions`;
            if (!config.geminiApikey?.length) return { error: "Gemini API Key is not configured" };

            const apiKey = config.geminiApikey[Math.floor(Math.random() * config.geminiApikey.length)];
            headers = {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            };
            finalRequestData = { ...requestData };
        } else if (provider === 'oneapi') {
            if (config.UseTools) {
                // UseTools 开启，先调用 OpenAI API
                const openaiUrl = 'https://yuanpluss.online:3000/api/v1/4o/fc';
                if (!data.chatgpt?.stoken) return { error: "OpenAI stoken is not configured" };

                const openaiHeaders = {
                    'Authorization': `Bearer ${data.chatgpt.stoken}`,
                    'Content-Type': 'application/json'
                };

                let openaiResponse;
                try {
                    openaiResponse = await fetch(openaiUrl, {
                        method: 'POST',
                        headers: openaiHeaders,
                        body: JSON.stringify(requestData)
                    });

                    if (!openaiResponse.ok) {
                        const errorText = await openaiResponse.text().catch(() => 'Unable to read error text');
                        return { error: `OpenAI API request failed: ${openaiResponse.status} ${openaiResponse.statusText} - ${errorText}` };
                    }
                } catch (openaiFetchError) {
                    console.error("OpenAI API request failed:", openaiFetchError);
                    return { error: `OpenAI API request failed: ${openaiFetchError.message}` };
                }

                let openaiData;
                try {
                    openaiData = await openaiResponse.json();
                    console.log('OpenAI Response:', JSON.stringify(openaiData, null, 2));
                } catch (openaiJsonError) {
                    console.error("Failed to parse OpenAI response JSON:", openaiJsonError);
                    return { error: `Failed to parse OpenAI response JSON: ${openaiJsonError.message}` };
                }

                // 检查是否包含 tool_calls，无论 finish_reason 是什么
                const hasToolCalls = openaiData?.choices?.[0]?.message?.tool_calls?.length > 0;
                if (hasToolCalls) {
                    // 直接返回 tool_calls 响应，替换 model
                    openaiData.model = config.OneApiModel;
                    return processResponse(openaiData);
                }

                // 检查 OneAPI 配置
                if (!config.OneApiUrl || !config.OneApiModel || !config.OneApiKey?.length) {
                    return { error: "OneAPI URL, Model, or API Key is not configured" };
                }
                url = `${config.OneApiUrl}/v1/chat/completions`;
                const oneApiKey = config.OneApiKey[Math.floor(Math.random() * config.OneApiKey.length)];
                headers = {
                    'Authorization': `Bearer ${oneApiKey}`,
                    'Content-Type': 'application/json'
                };

                // 处理消息，过滤并转换 tool_calls 相关内容
                const processedMessages = requestData.messages
                    .map(msg => {
                        if (msg.role === 'assistant' && msg.tool_calls) {
                            return null; // 跳过含 tool_calls 的 assistant 消息
                        } else if (msg.role === 'tool') {
                            const prefix = "调用工具成功, 这是使用工具处理反馈的结果：\n";
                            const suffix = "\n我会工具处理的结果继续反馈, 并且优先使用中文作答。";
                            return {
                                role: 'assistant',
                                content: prefix + msg.content + suffix
                            };
                        }
                        return msg;
                    })
                    .filter(Boolean);

                finalRequestData = {
                    model: config.OneApiModel,
                    messages: processedMessages,
                    stream: false
                };
            } else {
                // UseTools 关闭，直接使用 OneAPI
                if (!config.OneApiUrl || !config.OneApiModel || !config.OneApiKey?.length) {
                    return { error: "OneAPI URL, Model, or API Key is not configured" };
                }
                url = `${config.OneApiUrl}/v1/chat/completions`;
                const oneApiKey = config.OneApiKey[Math.floor(Math.random() * config.OneApiKey.length)];
                headers = {
                    'Authorization': `Bearer ${oneApiKey}`,
                    'Content-Type': 'application/json'
                };
                finalRequestData = {
                    model: config.OneApiModel,
                    messages: requestData.messages,
                    stream: false
                };
            }
        } else if (provider === 'openai') {
            url = config.OpenAiUrl;
            const openAiApiKey = url === 'https://yuanpluss.online:3000/api/v1/4o/fc'
                ? data.chatgpt.stoken
                : config.OpenAiApikey;
            if (!openAiApiKey) return { error: "OpenAI API Key is not configured" };

            headers = {
                'Authorization': `Bearer ${openAiApiKey}`,
                'Content-Type': 'application/json'
            };
            finalRequestData = requestData;
        } else {
            return { error: `Unsupported provider: ${provider}` };
        }

        // 发送 API 请求
        console.log('Final Request Data:', finalRequestData);
        if (!url || !headers || !finalRequestData) {
            return { error: "Missing required request parameters (URL, headers, or request data)" };
        }

        let response;
        try {
            response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(finalRequestData)
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Unable to read error text');
                return { error: `API request failed: ${response.status} ${response.statusText} - ${errorText}` };
            }
        } catch (fetchError) {
            console.error(`${provider || 'API'} request failed:`, fetchError);
            return { error: `${provider || 'API'} request failed: ${fetchError.message}` };
        }

        let responseData;
        try {
            responseData = await response.json();
            console.log(`${provider || 'API'} Response:`, JSON.stringify(responseData, null, 2));
        } catch (jsonError) {
            console.error(`Failed to parse ${provider || 'API'} response JSON:`, jsonError);
            return { error: `Failed to parse ${provider || 'API'} response JSON: ${jsonError.message}` };
        }

        return processResponse(responseData);

    } catch (error) {
        console.error('YTapi Error:', error);
        return { error: `Unexpected error: ${error.message}` };
    }
}

/**
 * 处理 API 响应数据
 * @param {Object|Array} responseData - API 响应数据
 * @returns {Object} - 处理后的响应数据
 */
function processResponse(responseData) {
    // 处理数组响应（兼容某些 API 返回数组的情况）
    if (Array.isArray(responseData) && responseData.length > 0) {
        return processResponse(responseData[0]);
    }

    // 处理对象响应
    if (typeof responseData === 'object' && responseData !== null) {
        // 错误响应
        if (responseData.detail) {
            return { error: responseData.detail };
        }
        if (responseData.error && Object.keys(responseData.error).length > 0) {
            return { error: responseData.error.message || JSON.stringify(responseData.error) };
        }
        // 正常响应
        return responseData;
    }

    // 其他类型直接返回
    return { error: `Invalid response format: ${JSON.stringify(responseData)}` };
}
