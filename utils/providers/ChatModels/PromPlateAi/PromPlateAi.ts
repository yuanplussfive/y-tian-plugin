import fetch, { HeadersInit, RequestInit, Response } from 'node-fetch';

class PromPlateService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = 'https://promplate-api.free-chat.asia';
    }

    // 异步发送聊天消息并获取响应
    async sendMessage(messages: { role: string; content: string }[], model: string): Promise<string> {
        const url = `${this.baseUrl}/please-do-not-hack-this/single/chat_messages`;
        const headers: HeadersInit = {
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

        const options: RequestInit = {
            method: 'PUT',
            headers: headers,
            body: body
        };

        try {
            const response: Response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: string = await response.text();
            return data;
        } catch (error: any) {
            console.error("请求出错:", error); // 打印错误信息
            throw error;
        }
    }
}

export async function PromPlateAi(messages: { role: string; content: string }[], model: string): Promise<string | null> {
    const chatService = new PromPlateService();
    try {
        const result: string = await chatService.sendMessage(messages, model);
        return result?.trim();
    } catch (error: any) {
        console.error("发生错误:", error);
        return null;
    }
}