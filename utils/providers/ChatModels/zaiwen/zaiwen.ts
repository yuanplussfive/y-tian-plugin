import fetch from 'node-fetch';

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface ZaiwenRequest {
    message: ChatMessage[];
    mode: string;
    prompt_id: string;
    key: null;
}

const BAN_MESSAGES: Record<string, string | null> = {
    "您的内容中有不良信息": "您的预设/对话内容中有不良信息，请结束对话/预设后重新提问",
    "Message too long": "上下文过长，已超过模型限制，请结束对话后重新提问",
    "我们聊的太多了": "请求频率过快，已超过限制，请等待一会后重新提问",
    "zaiwen": null
} as const;

/**
 * 调用在Zaiwen平台的模型接口
 * @param messages - 对话消息数组
 * @param model - 模型名称
 * @returns 模型回复或错误信息
 * @throws Error 当网络请求失败时
 */
export async function zaiwenProxy(
    messages: ChatMessage[],
    model: string
): Promise<string | null> {
    try {
        const requestBody: ZaiwenRequest = {
            message: messages,
            mode: model,
            prompt_id: "",
            key: null
        };

        const response = await fetch('https://aliyun.zaiwen.top/admin/chatbot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'referer': 'https://www.zaiwen.org.cn/'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            return null;
        }

        const responseData = await response.text();
        console.log('Response:', responseData);

        for (const [key, value] of Object.entries(BAN_MESSAGES)) {
            if (new RegExp(key, 'i').test(responseData)) {
                return value;
            }
        }

        return responseData.trim();
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}