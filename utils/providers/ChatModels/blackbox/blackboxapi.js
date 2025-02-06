import fetch from 'node-fetch';

const blackboxAiChat = async (messages, model) => {
    const url = 'https://api.blackbox.ai/api/chat';

    // 模型映射
    const modelMap = {
        'deepseek-v3': 'deepseek-ai/DeepSeek-V3',
        'deepseek-r1': 'deepseek-ai/DeepSeek-R1',
        'QwQ-32B-Preview': 'Qwen/QwQ-32B-Preview',
        'mixtral-8x7b': 'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO'
    };

    const mappedModel = modelMap[model];

    if (!mappedModel) {
        throw new Error(`不支持的模型: ${model}`);
    }

    const data = {
        messages: messages,
        model: mappedModel,
        max_tokens: 4096,
    };

    const config = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.text();
        return responseData;
    } catch (error) {
        console.error('Blackbox AI 请求失败:', error);
        throw error;
    }
};

function deleteBeforeThink(str) {
    const index = str.indexOf("</think>");

    if (index === -1) {
        return str;
    }

    return str.substring(index + "</think>".length);
}

export const blackboxapi = async (messages, model) => {
    try {
        const response = await blackboxAiChat(messages, model);
        return deleteBeforeThink(response);
    } catch (error) {
        console.error('出错:', error);
        return null;
    }
};