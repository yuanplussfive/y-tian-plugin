import fetch from 'node-fetch';
import { randomUUID } from 'crypto';
import { random_safe } from '../../../../utils/requests/safeurl.js';

function containsChinese(str) {
    return /\p{Script=Han}/u.test(str);
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function enhancement(prompt) {
    const headers = {
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
        "content-type": "application/json",
        "x-anonymous-id": randomUUID(),
        "Referer": random_safe('aHR0cHM6Ly9rdXNhLnBpY3Mv'),
        "Referrer-Policy": "strict-origin-when-cross-origin"
    };

    try {
        const response = await fetch(random_safe('aHR0cHM6Ly9rdXNhLnBpY3MvYXBpL3Byb21wdC1lbmhhbmNlbWVudA=='), {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                prompt: prompt
            })
        });

        if (!response.ok) {
            console.error(`HTTP 错误！状态码: ${response.status}`);
            try {
                const errorBodyText = await response.text();
                console.error("错误响应体:", errorBodyText);
            } catch (e) {
                console.error("无法读取错误响应体:", e);
            }
            return prompt;
        }

        const responseData = await response.json();
        if (responseData?.enhanced_prompt) {
            return responseData.enhanced_prompt;
        } else {
            return prompt;
        }

    } catch (error) {
        return prompt;
    }
}

/**
 * 根据文本生成图像。
 * 接口发送 POST 请求，
 * 图像的预签名 URL。
 *
 * @param {string} prompt - 用于生成图像的文本提示词。
 * @returns {Promise<string|null>} 一个 Promise，成功时解析为生成的第一个图像的预签名 URL 字符串，失败时解析为 null。
 */
async function generateImageFromPrompt(prompt) {
    const headers = {
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
        "content-type": "application/json",
        "x-anonymous-id": randomUUID(),
        "Referer": random_safe('aHR0cHM6Ly9rdXNhLnBpY3Mv'),
        "Referrer-Policy": "strict-origin-when-cross-origin"
    };

    if (containsChinese(prompt)) {
        prompt = await enhancement(prompt);
    }
    console.log("优化提示词: ", prompt);
    const requestBody = {
        prompt: prompt,
        negative_prompt: "worst quality,low quality,logo,text,watermark,signature,bad anatomy,bad proportions,bad_hands,bad_feet", // 负面提示词，排除不需要的内容
        width: 768,
        height: 1344,
        amount: 1,
        style_id: randomInt(2, 4)
    };

    try {
        const response = await fetch(random_safe('aHR0cHM6Ly9rdXNhLnBpY3MvYXBpL3RleHQvdGV4dC10by1pbWFnZQ=='), {
            method: "POST",
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            console.error(`HTTP 错误！状态码: ${response.status}`);
            try {
                const errorBodyText = await response.text();
                console.error("错误响应体:", errorBodyText);
            } catch (e) {
                console.error("无法读取错误响应体:", e);
            }
            return null;
        }

        const responseData = await response.json();
        if (responseData?.presigned_urls?.length > 0) {
            return responseData.presigned_urls[0];
        } else {
            console.warn("图像生成成功，但响应中未找到 presigned_urls 或其为空。", responseData);
            return null;
        }

    } catch (error) {
        console.error("图像生成请求过程中发生错误:", error);
        return null;
    }
}

export async function kusa(prompt, model) {
    try {
        const generatedImageUrl = await generateImageFromPrompt(prompt);
        if (generatedImageUrl) {
            return generatedImageUrl;
        } else {
            return null;
        }
    } catch (e) {
        console.log(e);
        return null;
    }
}