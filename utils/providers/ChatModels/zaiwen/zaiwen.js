import fetch from 'node-fetch';
import { Readable } from 'stream';
import { randomUUID } from 'crypto';
import { random_safe } from '../../../../utils/requests/safeurl.js';

/**
 * 调用Zaiwen平台的模型接口，使用流式处理响应
 * @param {string} model - 模型名称
 * @param {Array} messages - 对话历史
 * @returns {Promise<string|null>} - 模型回复或null
 */
export async function zaiwen(messages, model) {
    const MAX_ATTEMPTS = 1;
    const banMessages = [
        /您的内容中有不良信息/i,
        /Message too long/i,
        /我们聊的太多了/i,
        /zaiwen/i,
        /Server Error/i,
        /此模型暂时无法处理你的请求/i,
        /高级模型已达到24小时内的免费使用次数限制/i,
        /{"detail":"模型返回出错，可能是文档类型不支持、网络波动、输入文字过长"}/i
    ];

    /**
     * 发起API请求并处理流式响应
     * @param {string} domain - API域名
     * @returns {Promise<string|null>} - 响应内容或null
     */
    async function fetchResponse(domain) {
        try {
            const apiUrl = `${domain}/admin/chatbot`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Referer': random_safe("aHR0cHM6Ly93d3cuemFpd2VuLm9yZy5jbi8="),
                    'Token': randomUUID(),
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Connection': 'keep-alive',
                    'Origin': random_safe("aHR0cHM6Ly93d3cuemFpd2VuLm9yZy5jbi8="),
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-origin',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua': '"Chromium";v="110", "Not A(Brand";v="24", "Google Chrome";v="110"'
                },
                body: JSON.stringify({
                    message: messages,
                    mode: model,
                    prompt_id: '',
                    key: ''
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const stream = Readable.from(response.body);
            let responseData = '';

            for await (const chunk of stream) {
                responseData += chunk.toString();
            }

            if (banMessages.some(regex => regex.test(responseData))) {
                return null;
            }

            return responseData.trim();
        } catch (error) {
            console.error(`请求 ${domain} 失败: ${error.message}`);
            return null;
        }
    }

    let attempts = 0;
    let usedDomains = new Set();

    while (attempts < MAX_ATTEMPTS) {
        attempts++;
        const currentDomain = random_safe("aHR0cHM6Ly9hbGl5dW4uemFpd2VuLnRvcA==");

        usedDomains.add(currentDomain);

        const result = await fetchResponse(currentDomain);
        if (result !== null) {
            return result;
        }

        if (availableDomains.length === 0) {
            break;
        }
    }

    if (!usedDomains.has(random_safe("aHR0cHM6Ly9hbGl5dW4uemFpd2VuLnRvcA=="))) {
        return await fetchResponse(random_safe("aHR0cHM6Ly9hbGl5dW4uemFpd2VuLnRvcA=="));
    }

    return null;
}