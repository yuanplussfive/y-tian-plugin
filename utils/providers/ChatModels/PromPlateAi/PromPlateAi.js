import fetch from 'node-fetch';

class PromPlateService {
    constructor() {
        this.baseUrl = 'https://promplate-api.free-chat.asia';
    }

    async sendMessage(messages, model) {
        const url = `${this.baseUrl}/please-do-not-hack-this/single/chat_messages`;
        const headers = {
            "accept": "*/*",
            "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
            "content-type": "application/json",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Microsoft Edge\";v=\"133\", \"Chromium\";v=\"133\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "Referer": "https://e11.free-chat.asia/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        };

        const body = JSON.stringify({
            "messages": messages,
            "model": model
        });

        const options = {
            method: 'PUT', // 使用 PUT 方法
            headers: headers,
            body: body
        };

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.text();
            return data;
        } catch (error) {
            console.error("请求出错:", error);
            return null;
        }
    }
}

export async function PromPlateAi(messages, model) {
    const chatService = new PromPlateService();
    try {
        const result = await chatService.sendMessage(messages, model);
        return result?.trim();
    } catch (error) {
        console.error("发生错误:", error);
        return null;
    }
}