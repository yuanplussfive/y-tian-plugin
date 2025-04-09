import fetch from 'node-fetch';

/**
 * 发送聊天请求并获取AI回复内容
 * @param {Array<{role: string, content: string}>} messages - 聊天消息数组
 * @param {string} model - AI模型标识符
 * @returns {Promise<string|null>} 返回AI回复文本，失败时返回null
 */
export const e11chat = async (messages, model) => {
    const API_URL = 'https://promplate-api.free-chat.asia/please-do-not-hack-this/single/chat_messages';
    const requestConfig = {
        model,
        messages
    };
    const headers = {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Referer': 'https://e11.free-chat.asia/',
        'User-Agent': [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'AppleWebKit/537.36 (KHTML, like Gecko)',
            'Chrome/131.0.0.0',
            'Safari/537.36',
            'Edg/131.0.0.0'
        ].join(' ')
    };

    try {
        const response = await fetch(API_URL, {
            method: 'PUT',
            headers,
            body: JSON.stringify(requestConfig),
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No error details available');
            console.log(`请求失败 ${response.status}: ${errorText}`);
            return null;
        }

        const output = await response.text();
        return output.trim();
    } catch (error) {
        //console.error('请求失败:', error.message);
        return null;
    }
};