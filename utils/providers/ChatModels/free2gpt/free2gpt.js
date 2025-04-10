import fetch from 'node-fetch';
import CryptoJS from 'crypto-js';
import { random_safe } from '../../../../utils/requests/safeurl.js';

const URL_CONFIG = {
    gemini: random_safe("aHR0cHM6Ly9jbGF1ZGUzLmZyZWUyZ3B0Lnh5eg=="),
    deepseek: random_safe("aHR0cHM6Ly9kZWVwc2Vlay5mcmVlMmdwdC5jb20=")
};

const generateSignature = async ({ timestamp, message, secretKey = "" }) => {
    const data = `${timestamp}:${message}:${secretKey}`;
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
};

export const free2gpt = async (messages, model = 'deepseek', timestamp = Date.now()) => {
    try {
        const baseUrl = URL_CONFIG[model.toLowerCase()];
        const messageContent = Array.isArray(messages) && messages.length > 0
            ? messages[0].content
            : '';
        const sign = await generateSignature({
            timestamp,
            message: messageContent
        });
        const body = JSON.stringify({
            messages,
            model,
            time: timestamp,
            pass: null,
            sign
        });
        const response = await fetch(`${baseUrl}/api/generate`, {
            method: "POST",
            headers: {
                "accept": "*/*",
                "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
                "content-type": "application/json;charset=UTF-8",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Chromium\";v=\"134\", \"Not:A-Brand\";v=\"24\", \"Microsoft Edge\";v=\"134\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "Referer": baseUrl,
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            body
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.text();
    } catch (error) {
        console.error('请求失败:', error.message);
        return null;
    }
};