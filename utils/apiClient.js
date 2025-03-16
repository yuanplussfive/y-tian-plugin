import { dependencies } from "../YTdependence/dependencies.js";
const { _path, fetch, fs, path } = dependencies;

/**
 * 发送请求到 OpenAI API 并处理响应
 * @param {Object} requestData - 请求体数据
 * @param {Object} config - 配置对象
 * @returns {Object|null} - 返回 OpenAI 的响应数据
 */
/**
 * 发送请求到 OpenAI API 或 OneAPI API 并处理响应
 * @param {Object} requestData - 请求体数据
 * @param {Object} config - 配置对象
 * @returns {Object|null} - 返回 API 的响应数据
 */
export async function YTapi(requestData, config) {
    const dirpath = `${_path}/data/YTotherai`;
    const dataPath = dirpath + "/data.json";

    let data;
    try {
        const dataString = await fs.promises.readFile(dataPath, "utf-8");
        data = JSON.parse(dataString);
    } catch (readError) {
        console.error("读取 data.json 失败:", readError);
        return { error: `读取配置文件失败: ${readError.message}` };
    }

    const provider = config.providers?.toLowerCase();

    try {
        let url, headers, finalRequestData;

        if (provider === 'gemini') {
            // Gemini API 请求逻辑
            const urls = config.GeminiProxyList;
            const currentUrl = urls?.[Math.floor(Math.random() * urls.length)]
            url = `${currentUrl}/v1beta/chat/completions`;            
            if (!config.geminiApikey || config.geminiApikey.length === 0) {
                return { error: "未配置 Gemini API Key" };
            }
            const randomIndex = Math.floor(Math.random() * config.geminiApikey.length);
            const apiKey = config.geminiApikey[randomIndex];
            headers = {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            };
            finalRequestData = {
                ...requestData
            };
        } else if (provider === 'oneapi') {
            // OneAPI 请求逻辑
            if (config.UseTools) {
                // UseTools 开启，先使用 OpenAI 请求
                const openaiUrl = 'https://yuanpluss.online:3000/api/v1/4o/fc';
                if (!data.chatgpt?.stoken) {
                    return { error: "未配置 OpenAI stoken" };
                }
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
                        try {
                            const errorText = await openaiResponse.text(); // 尝试获取服务器返回的错误信息
                            const errorMessage = `OpenAI API请求失败: ${openaiResponse.status} ${openaiResponse.statusText} - ${errorText}`;
                            return { error: errorMessage };
                        } catch (textError) {
                            return { error: `OpenAI API请求失败: ${openaiResponse.status} ${openaiResponse.statusText}，无法读取错误文本` };
                        }
                    }
                } catch (openaiFetchError) {
                    console.error("OpenAI API 请求失败:", openaiFetchError);
                    return { error: `OpenAI API 请求失败: ${openaiFetchError.message}` };
                }

                let openaiData;
                try {
                    openaiData = await openaiResponse.json();
                } catch (openaiJsonError) {
                    console.error("解析 OpenAI 响应 JSON 失败:", openaiJsonError);
                    return { error: `解析 OpenAI 响应 JSON 失败: ${openaiJsonError.message}` };
                }

                console.log(openaiData);
                // 检查 finish_reason
                if (openaiData?.choices?.[0]?.finish_reason === 'stop') {
                    // 如果是 'stop'，使用 OneAPI 进行请求
                    if (!config.OneApiUrl || !config.OneApiModel || !config.OneApiKey || config.OneApiKey.length === 0) {
                        return { error: "未配置 OneAPI URL, Model 或 API Key" };
                    }
                    url = `${config.OneApiUrl}/v1/chat/completions`;
                    const randomIndex = Math.floor(Math.random() * config.OneApiKey.length);
                    const oneApiKey = config.OneApiKey[randomIndex];
                    headers = {
                        'Authorization': `Bearer ${oneApiKey}`,
                        'Content-Type': 'application/json'
                    };

                    // 处理messages中的工具调用消息
                    const processedMessages = requestData.messages.map(msg => {
                        if (msg.role === 'assistant' && msg.tool_calls) {
                            // 跳过 assistant 且包含 tool_calls 的消息
                            return null;
                        } else if (msg.role === 'tool') {
                            // 将 tool 消息转换为 assistant 消息，并添加前缀
                            const analysisContent = msg.content;
                            const prefix = "我正在使用工具处理反馈的结果，以下是分析结果：\n";
                            const suffix = "\n我会使用中文进行回复。";
                            return {
                                role: 'assistant',
                                content: prefix + analysisContent + suffix
                            };
                        }
                        return msg;
                    }).filter(Boolean);

                    console.log(processedMessages)
                    finalRequestData = {
                        model: config.OneApiModel,
                        messages: processedMessages,
                        stream: false
                    };
                } else if (openaiData?.choices?.[0]?.finish_reason === 'tool_calls') {
                    // 如果是 'tool_calls'，替换 model 并返回
                    openaiData.model = config.OneApiModel;
                    return processResponse(openaiData);
                } else {
                    // 将整个 OpenAI 响应传递给 processResponse 进行处理
                    return processResponse(openaiData);
                }
            } else {
                // UseTools 关闭，直接使用 OneAPI 请求
                if (!config.OneApiUrl || !config.OneApiModel || !config.OneApiKey || config.OneApiKey.length === 0) {
                    return { error: "未配置 OneAPI URL, Model 或 API Key" };
                }
                url = `${config.OneApiUrl}/v1/chat/completions`;
                const randomIndex = Math.floor(Math.random() * config.OneApiKey.length);
                const oneApiKey = config.OneApiKey[randomIndex];
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
        } else {
            // 默认 OpenAI 请求逻辑 (保持不变)
            url = 'https://yuanpluss.online:3000/api/v1/4o/fc';
            if (!data.chatgpt?.stoken) {
                return { error: "未配置 OpenAI stoken" };
            }
            headers = {
                'Authorization': `Bearer ${data.chatgpt.stoken}`,
                'Content-Type': 'application/json'
            };
            finalRequestData = requestData;
        }

        // 只有在需要发送新请求时才执行
        if (url && headers && finalRequestData) {
            let response;
            try {
                response = await fetch(url, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(finalRequestData)
                });

                if (!response.ok) {
                    try {
                        const errorText = await response.text(); // 尝试获取服务器返回的错误信息
                        const errorMessage = `API请求失败: ${response.status} ${response.statusText} - ${errorText}`;
                        return { error: errorMessage };
                    } catch (textError) {
                        return { error: `API请求失败: ${response.status} ${response.statusText}，无法读取错误文本` };
                    }
                }
            } catch (fetchError) {
                console.error(`${provider || 'OpenAI'} API 请求失败:`, fetchError);
                return { error: `${provider || 'OpenAI'} API 请求失败: ${fetchError.message}` };
            }

            let responseData;
            try {
                responseData = await response.json();
            } catch (jsonError) {
                console.error(`解析 ${provider || 'OpenAI'} 响应 JSON 失败:`, jsonError);
                return { error: `解析 ${provider || 'OpenAI'} 响应 JSON 失败: ${jsonError.message}` };
            }

            console.log(`${provider || 'OpenAI'} 响应:`, responseData);
            return processResponse(responseData);
        } else {
            return { error: "未满足发送请求的条件（URL, Headers 或 RequestData 缺失）" };
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
        if (responseData?.detail) {
            return { error: responseData.detail };
        } else if (responseData?.error && Object.keys(responseData.error).length > 0) {
            // 如果 responseData.error 存在且为空对象，直接返回 responseData
            return responseData;
        } else {
            return responseData?.detail || responseData;
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
        if (responseData?.error && Object.keys(responseData.error).length > 0) {
            return responseData.error;
        }
        console.log(responseData);
        return responseData?.choices[0]?.message?.content;
    } catch (error) {
        console.log(error);
        return null;
    }
}