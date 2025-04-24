import fetch from 'node-fetch';

class ImageLabs {
    #url = 'https://editor.imagelabs.net';
    #apiEndpoint = `${this.#url}/txt2img`;
    #progressEndpoint = `${this.#url}/progress`;

    static working = true;
    static supportsStream = false;
    static supportsSystemMessage = false;
    static supportsMessageHistory = false;

    static defaultModel = 'sdxl-turbo';
    static defaultImageModel = this.defaultModel;
    static imageModels = Object.freeze([this.defaultImageModel]);
    static models = this.imageModels;

    /**
     * 处理图片生成请求并返回 Markdown 结果
     * @param {string} model - 模型名称
     * @param {prompt} prompt - 提示词
     * @param {Object} options - 可选配置
     * @param {string} [options.prompt] - 提示词
     * @param {string} [options.proxy] - 代理地址
     * @param {string} [options.negativePrompt] - 否定提示词
     * @param {number} [options.width] - 图片宽度
     * @param {number} [options.height] - 图片高度
     * @returns {Promise<string>} Markdown 格式的图片结果
     */
    async request(model, prompt, {
        proxy,
        negativePrompt = '',
        width = 1152,
        height = 896,
    } = {}) {
        const headers = {
            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9',
            'cache-control': 'no-cache',
            'content-type': 'application/json',
            'origin': this.#url,
            'referer': `${this.#url}/`,
            'x-requested-with': 'XMLHttpRequest',
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        };

        // 生成图片请求
        const payload = {
            prompt,
            seed: Math.floor(Date.now() / 1000).toString(),
            subseed: Date.now().toString(),
            attention: 0,
            width,
            height,
            tiling: false,
            negative_prompt: negativePrompt,
            reference_image: '',
            reference_image_type: null,
            reference_strength: 30,
        };

        const generateResponse = await this.#fetch(this.#apiEndpoint, payload, headers, proxy);
        const { task_id } = await generateResponse.json();

        // 轮询获取进度
        return await this.#pollProgress(task_id, prompt, headers, proxy);
    }

    /**
     * 发送 fetch 请求
     * @param {string} url - 请求地址
     * @param {Object} data - 请求数据
     * @param {Object} headers - 请求头
     * @param {string} [proxy] - 代理地址
     * @returns {Promise<Response>} 响应对象
     */
    async #fetch(url, data, headers, proxy) {
        const fetchOptions = {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
            ...(proxy && { agent: new (await import('https-proxy-agent')).default(proxy) }),
        };

        const response = await fetch(url, fetchOptions);
        await this.#raiseForStatus(response);
        return response;
    }

    /**
     * 轮询进度直到完成
     * @param {string} taskId - 任务 ID
     * @param {string} prompt - 提示词
     * @param {Object} headers - 请求头
     * @param {string} [proxy] - 代理地址
     * @returns {Promise<string>} Markdown 格式结果
     */
    async #pollProgress(taskId, prompt, headers, proxy) {
        while (true) {
            const progressResponse = await this.#fetch(this.#progressEndpoint, { task_id: taskId }, headers, proxy);
            const progressData = await progressResponse.json();

            if (progressData.status === 'Done' || progressData.final_image_url) {
                const imageUrl = progressData.final_image_url;
                return imageUrl ? `![${prompt}](${imageUrl})` : '';
            }

            if (progressData.status?.toLowerCase().includes('error')) {
                throw new Error(`Image generation error: ${JSON.stringify(progressData)}`);
            }

            await new Promise((resolve) => setTimeout(resolve, 1000)); // 等待 1 秒
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
}

export async function imagelabs(prompt, model) {
    const imageLabs = new ImageLabs();
    try {
        const result = await imageLabs.request(model, prompt, {
            negativePrompt: '模糊，低质量',
            width: 1152,
            height: 896,
        });
        console.log('图片结果：', result);
        return result;
    } catch (error) {
        console.error('错误：', error.message);
        return null;
    }
}