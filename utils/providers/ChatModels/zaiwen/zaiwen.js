import fetch from 'node-fetch';
import { ThinkingProcessor } from '../../ThinkingProcessor.js';

/**
 * 调用在Zaiwen平台的模型接口
 * @param {string} model - 模型名称
 * @param {Array} history - 对话历史
 * @param {string} version - 接口版本
 * @returns {string|undefined} - 模型回复或undefined
 */
export async function zaiwen(messages, model) {
    try {
        const response = await fetch('https://aliyun.zaiwen.top/admin/chatbot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'referer': 'https://www.zaiwen.org.cn/'
            },
            body: JSON.stringify({
                message: messages,
                mode: model,
                prompt_id: "",
                key: ''
            })
        });

        const responseData = await response.text();
        console.log(responseData);
        const BanMessages = {
            "您的内容中有不良信息": "您的预设/对话内容中有不良信息，请结束对话/预设后重新提问",
            "Message too long": "上下文过长，已超过模型限制，请结束对话后重新提问",
            "我们聊的太多了": "请求频率过快，已超过限制，请等待一会后重新提问",
            "zaiwen": null,
            "Server Error": null
        };
        for (const [key, value] of Object.entries(BanMessages)) {
            const regex = new RegExp(key, 'i');
            if (regex.test(responseData)) {
                return value;
            }
        }
        return ThinkingProcessor.processThinking(responseData.trim(), {
            format: 'tag',
            maxLength: 300
        });
    } catch (error) {
        console.log(error.message);
        return null;
    }
}