
import { randomUUID } from 'crypto';
import { random_safe } from '../../../../utils/requests/safeurl.js';

/**
 * Hg Qwen-3 API 交互类
 */
class QwenQwen3 {
    static label = "Qwen Qwen-3";
    static url = random_safe("aHR0cHM6Ly9xd2VuLXF3ZW4zLWRlbW8uaGYuc3BhY2U=");
    static apiEndpoint = `${QwenQwen3.url}/gradio_api/queue/join?__theme=system`;
    static dataEndpoint = `${QwenQwen3.url}/gradio_api/queue/data`;

    static defaultModel = "qwen3-235b-a22b";
    static models = [
        QwenQwen3.defaultModel,
        "qwen3-32b",
        "qwen3-30b-a3b",
        "qwen3-14b",
        "qwen3-8b",
        "qwen3-4b",
        "qwen3-1.7b",
        "qwen3-0.6b"
    ];

    static #commonHeaders = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Referer': `${QwenQwen3.url}/?__theme=system`,
        'Origin': QwenQwen3.url,
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
    };

    /**
     * 生成无连字符的 UUID
     * @returns {string} UUID 字符串
     */
    static #generateSessionHash() {
        return randomUUID().replace(/-/g, '');
    }

    /**
     * 将消息数组拼接为格式化字符串
     * @param {Array<{role: string, content: string}>} messages
     * @returns {string} 格式化后的消息字符串
     */
    static #formatMessages(messages) {
        let formatted = '';
        const systemMessages = messages.filter(msg => msg.role === 'system');
        const otherMessages = messages.filter(msg => msg.role !== 'system');

        // 添加系统提示（如果存在）
        if (systemMessages.length > 0) {
            formatted += '系统提示:\n';
            systemMessages.forEach(msg => {
                formatted += `${msg.content}\n`;
            });
            formatted += '\n';
        }

        // 添加用户和 AI 对话上下文
        if (otherMessages.length > 0) {
            formatted += '对话上下文:\n';
            otherMessages.forEach(msg => {
                const role = msg.role === 'user' ? '用户' : '助手';
                formatted += `${role}: ${msg.content}\n`;
            });
        }

        return formatted.trim();
    }

    /**
     * 验证并返回模型
     * @param {string} model
     * @returns {string} 有效的模型名称
     */
    static getModel(model) {
        return QwenQwen3.models.includes(model) ? model : QwenQwen3.defaultModel;
    }

    /**
     * 获取 API 响应，整合为完整字符串
     * @param {Object} options
     * @param {string} options.model
     * @param {Array<{role: string, content: string}>} options.messages
     * @param {string} [options.proxy]
     * @param {Object} [options.conversation]
     * @param {number} [options.thinkingBudget=38]
     * @returns {Promise<string>} 完整的响应字符串
     */
    static async getResponse({
        model,
        messages,
        proxy = null,
        conversation = null,
        thinkingBudget = 38
    }) {
        const sessionHash = conversation?.sessionHash || QwenQwen3.#generateSessionHash();
        let fullResponse = ''; // 存储正文内容
        let thinkContent = ''; // 存储 think 标签内的内容
        let isThinking = false;

        const joinHeaders = {
            ...QwenQwen3.#commonHeaders,
            'Content-Type': 'application/json'
        };

        const payload = {
            data: [
                QwenQwen3.#formatMessages(messages), // 传递格式化后的消息字符串
                {
                    thinking_budget: thinkingBudget,
                    model: QwenQwen3.getModel(model),
                    sys_prompt: '' // 不再单独传递系统提示
                },
                null,
                null
            ],
            event_data: null,
            fn_index: 13,
            trigger_id: 31,
            session_hash: sessionHash
        };

        // 发送加入请求
        const joinResponse = await fetch(proxy || QwenQwen3.apiEndpoint, {
            method: 'POST',
            headers: joinHeaders,
            body: JSON.stringify(payload)
        });

        if (!joinResponse.ok) {
            throw new Error(`加入请求失败: ${joinResponse.status}`);
        }

        await joinResponse.json(); // 获取 event_id

        // 准备流式请求
        const dataHeaders = {
            ...QwenQwen3.#commonHeaders,
            'Accept': 'text/event-stream'
        };

        const url = new URL(proxy || QwenQwen3.dataEndpoint);
        url.searchParams.append('session_hash', sessionHash);

        const response = await fetch(url, {
            headers: dataHeaders
        });

        if (!response.ok) {
            throw new Error(`流式请求失败: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }

            const lines = decoder.decode(value).split('\n');

            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;

                try {
                    const jsonData = JSON.parse(line.slice(6));

                    // 处理生成阶段
                    if (jsonData.msg === 'process_generating' &&
                        jsonData.output?.data?.length > 5) {
                        const updates = jsonData.output.data[5];

                        // 检查 updates 是否可迭代
                        if (!Array.isArray(updates)) {
                            console.debug('updates 不是数组:', updates);
                            continue;
                        }

                        for (const update of updates) {
                            if (Array.isArray(update) && update[2]) {
                                if (typeof update[2] === 'object') {
                                    if (update[2].type === 'tool') {
                                        isThinking = true;
                                        // 工具类型内容不处理
                                    } else if (update[2].type === 'text') {
                                        isThinking = false;
                                        // 文本类型追加到正文
                                        fullResponse += update[2].content;
                                    }
                                } else if (Array.isArray(update[1]) && update[1][4]) {
                                    if (update[1][4] === 'content') {
                                        if (isThinking) {
                                            // reasoning 类型，添加到 think 内容
                                            thinkContent += update[2];
                                        } else {
                                            // 普通内容追加到正文
                                            fullResponse += update[2];
                                        }
                                    } else if (update[1][4] === 'options' && update[2] !== 'done') {
                                        isThinking = false;
                                        // status 类型，添加到 think 内容
                                        thinkContent += update[2];
                                    }
                                }
                            }
                        }
                    }

                    // 检查完成
                    if (jsonData.msg === 'process_completed') {
                        // 如果有 think 内容，包裹在单一 think 标签中
                        if (thinkContent) {
                            fullResponse = `<think>${thinkContent}</think>\n\n${fullResponse}`;
                        }
                        return fullResponse;
                    }
                } catch (error) {
                    console.debug('无法解析 JSON:', line, error);
                    throw error;
                }
            }
        }

        // 如果未正常完成，返回当前结果
        return thinkContent ? `<think>${thinkContent}</think>\n\n${fullResponse}` : fullResponse;
    }
}

/**
 * @returns {Promise<string>} API 响应字符串
 */
export async function qwen3(messages, model) {
    try {
        return await QwenQwen3.getResponse({
            model: model,
            messages
        });
    } catch (error) {
        console.error('错误:', error);
        throw error;
    }
}