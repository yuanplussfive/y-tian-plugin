import { randomBytes } from 'node:crypto';
import fetch from 'node-fetch';

/**
 * Websim 类：异步生成器提供者，支持聊天和图片生成请求
 */
class Websim {
    #url = 'https://websim.ai';
    #chatApiEndpoint = `${this.#url}/api/v1/inference/run_chat_completion`;
    #imageApiEndpoint = `${this.#url}/api/v1/inference/run_image_generation`;

    // 静态属性
    static working = true;
    static needsAuth = false;
    static supportsStream = false;
    static supportsSystemMessage = true;
    static supportsMessageHistory = true;

    static defaultModel = 'gemini-1.5-pro';
    static defaultImageModel = 'flux';
    static imageModels = new Set([this.defaultImageModel]);
    static models = Object.freeze([this.defaultModel, 'gemini-1.5-flash', ...this.imageModels]);

    // 配置常量
    #maxRetries = 3;
    #baseRetryDelay = 1000;

    /**
     * 生成项目 ID
     * @param {boolean} forImage - 是否为图片请求
     * @returns {string} 项目 ID
     */
    static generateProjectId(forImage = false) {
        const randomStr = randomBytes(16).toString('hex');
        return forImage ? `kx${randomStr.slice(0, 6)}_${randomStr.slice(6, 18)}` : `ke${randomStr.slice(0, 2)}_${randomStr.slice(2)}`;
    }

    /**
     * 处理请求并返回最终结果
     * @param {string} model - 模型名称
     * @param {Messages} messages - 消息数组
     * @param {Object} options - 可选配置
     * @param {string} [options.prompt] - 提示词
     * @param {string} [options.proxy] - 代理地址
     * @param {string} [options.aspectRatio] - 图片宽高比
     * @param {string} [options.projectId] - 项目 ID
     * @returns {Promise<string>} 最终结果（聊天为文本，图片为 Markdown）
     */
    async request(model, messages, { prompt, proxy, aspectRatio = '1:1', projectId } = {}) {
        const isImageRequest = Websim.imageModels.has(model);
        projectId ??= Websim.generateProjectId(isImageRequest);

        const headers = {
            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9',
            'content-type': 'application/json',
            'origin': this.#url,
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
            'websim-flags': '',
            'referer': isImageRequest
                ? `${this.#url}/@ISWEARIAMNOTADDICTEDTOPILLOW/ai-image-prompt-generator`
                : `${this.#url}/@ISWEARIAMNOTADDICTEDTOPILLOW/zelos-ai-assistant`,
        };

        const result = isImageRequest
            ? await this.#handleImageRequest(projectId, messages, { prompt, aspectRatio, headers, proxy })
            : await this.#handleChatRequest(projectId, messages, { headers, proxy });

        return result;
    }

    /**
     * 处理图片生成请求，返回 Markdown 字符串
     * @param {string} projectId - 项目 ID
     * @param {Messages} messages - 消息数组
     * @param {Object} options - 配置对象
     * @returns {Promise<string>} Markdown 格式结果
     */
    async #handleImageRequest(projectId, messages, { prompt, aspectRatio, headers, proxy }) {
        const usedPrompt = this.#formatImagePrompt(messages, prompt);
        const data = { project_id: projectId, prompt: usedPrompt, aspect_ratio: aspectRatio };

        const response = await this.#fetchWithRetry(this.#imageApiEndpoint, data, headers, proxy);
        const { url } = await response.json();

        return url ? `![${usedPrompt}](${url})` : '';
    }

    /**
     * 处理聊天请求，返回文本结果
     * @param {string} projectId - 项目 ID
     * @param {Messages} messages - 消息数组
     * @param {Object} options - 配置对象
     * @returns {Promise<string>} 聊天内容
     */
    async #handleChatRequest(projectId, messages, { headers, proxy }) {
        const data = { project_id: projectId, messages };
        const response = await this.#fetchWithRetry(this.#chatApiEndpoint, data, headers, proxy);
        const { content = '' } = await response.json();

        return content.trim();
    }

    /**
     * 带重试机制的 fetch 请求
     * @param {string} url - 请求地址
     * @param {Object} data - 请求数据
     * @param {Object} headers - 请求头
     * @param {string} [proxy] - 代理地址
     * @returns {Promise<Response>} 响应对象
     */
    async #fetchWithRetry(url, data, headers, proxy) {
        let lastError;
        for (let retry = 0; retry < this.#maxRetries; retry++) {
            try {
                const fetchOptions = {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(data),
                    ...(proxy && { agent: new (await import('https-proxy-agent')).default(proxy) }),
                };

                const response = await fetch(url, fetchOptions);
                if (response.status === 429) {
                    const delay = this.#baseRetryDelay * 2 ** retry;
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    continue;
                }

                await this.#raiseForStatus(response);
                return response;
            } catch (error) {
                lastError = error;
                if (retry === this.#maxRetries - 1) throw lastError;
            }
        }
    }

    /**
     * 检查响应状态
     * @param {Response} response - fetch 响应
     * @throws {Error} 状态码异常
     */
    async #raiseForStatus(response) {
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Response ${response.status}: ${text}`);
        }
    }

    /**
     * 格式化图片提示词
     * @param {Messages} messages - 消息数组
     * @param {string} [prompt] - 提示词
     * @returns {string} 格式化结果
     */
    #formatImagePrompt(messages, prompt) {
        return prompt ?? messages.at(-1)?.content ?? '';
    }
}

export async function websim(messages, model) {
    try {
        const websim = new Websim();
        const Result = await websim.request(model, messages);
        return Result;
    } catch {
        return null;
    }
}