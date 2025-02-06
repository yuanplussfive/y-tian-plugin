import fetch from 'node-fetch';

// 定义 GizAI 类
class GizAI {
    constructor() {
        this.url = "https://app.giz.ai/assistant";
        this.apiEndpoint = "https://app.giz.ai/api/data/users/inferenceServer.infer";
        this.working = true;
        this.supportsStream = false;
        this.supportsSystemMessage = true;
        this.supportsMessageHistory = true;
        this.defaultModel = 'chat-gemini-flash';
        this.models = [this.defaultModel];
        this.modelAliases = { "gemini-1.5-flash": "chat-gemini-flash" };
    }

    /**
     * 获取模型名称。如果模型在别名中存在，则使用别名。
     * @param {string} model - 模型名称
     * @returns {string} - 实际使用的模型名称
     */
    getModel(model) {
        if (this.models.includes(model)) {
            return model;
        } else if (this.modelAliases[model]) {
            return this.modelAliases[model];
        } else {
            return this.defaultModel;
        }
    }

    /**
     * 格式化消息，将消息列表转换为字符串。
     * @param {Array<object>} messages - 消息列表
     * @returns {string} - 格式化后的消息字符串
     */
    formatPrompt(messages) {
        return messages.map(msg => msg.content).join('\n');
    }

    /**
     * 异步生成器函数，用于调用 GizAI 接口。
     * @param {string} model - 模型名称
     * @param {Array<object>} messages - 消息列表
     * @param {string | null} proxy - 代理服务器地址，默认为 null
     * @param {object} kwargs - 其他参数，默认为空对象
     * @returns {Promise<string>} - 返回 Promise，resolve 包含模型输出的字符串
     * @throws {Error} - 如果 API 请求失败，则抛出错误
     */
    async createAsyncGenerator(model, messages, proxy = null, kwargs = {}) {
        model = this.getModel(model);

        // 定义请求头
        const headers = {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Content-Type': 'application/json',
            'DNT': '1',
            'Origin': 'https://app.giz.ai',
            'Pragma': 'no-cache',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
            'sec-ch-ua': '"Not?A_Brand";v="99", "Chromium";v="130"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Linux"'
        };

        const prompt = this.formatPrompt(messages);

        const data = {
            "model": model,
            "input": {
                "messages": [{ "type": "human", "content": prompt }],
                "mode": "plan"
            },
            "noStream": true
        };

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data),
                proxy: proxy, // 如果有代理，则使用代理
            });

            // 检查响应状态
            if (response.status === 201) {
                const result = await response.json();
                return result['output'].trim();
            } else {
                throw new Error(`status: ${response.status}`);
            }
        } catch (error) {
            console.error("g:", error);
            throw error;
        }
    }
}

export async function gizai(messages, model) {
    const gizAI = new GizAI();
    try {
        const result = await gizAI.createAsyncGenerator(model, messages);
        return result;
    } catch (error) {
        console.error("调用 GizAI 出错:", error);
        return null;
    }
}