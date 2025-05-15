import fetch from 'node-fetch';
import { randomUUID } from 'crypto';
import path from 'path';
import YAML from 'yaml';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { random_safe } from '../../../../utils/requests/safeurl.js';

const configPath = path.join(__dirname, '../../../../config/message.yaml');
console.log(configPath)
let config = {};
if (fs.existsSync(configPath)) {
    const file = fs.readFileSync(configPath, 'utf8');
    const configs = YAML.parse(file);
    config = configs.pluginSettings;
}
const agent = config?.KusaProxyUrl || '';

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
        const response = await fetch(`${agent}/api/prompt-enhancement`, {
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
 * 轮询任务结果
 * @param {string} taskId - 任务ID
 * @returns {Promise<string|null>} 生成的图像URL或null
 */
async function pollTaskResult(taskId) {
    const headers = {
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-anonymous-id": randomUUID(),
        "Referer": "https://kusa.pics/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
    };

    const maxAttempts = 36; // 最多轮询36次
    let attempts = 0;

    while (attempts < maxAttempts) {
        try {
            const response = await fetch(`${agent}/api/celery/result/${taskId}`, {
                method: "POST",
                headers: headers,
                body: null
            });

            if (!response.ok) {
                console.error(`轮询错误！状态码: ${response.status}`);
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 5000)); // 等待5秒
                continue;
            }

            const result = await response.json();

            if (result.status === "success") {
                if (result.presigned_urls && result.presigned_urls.length > 0) {
                    return result.presigned_urls[0];
                } else {
                    console.warn("任务成功但未找到图像URL", result);
                    return null;
                }
            } else if (result.status === "failed") {
                console.error("任务失败", result);
                return null;
            }

            // 如果任务仍在进行中，等待5秒后继续轮询
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (error) {
            console.error("轮询过程中发生错误:", error);
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    console.error("轮询次数达到上限，任务可能仍在处理中");
    return null;
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
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-anonymous-id": randomUUID(),
        "Referer": "https://kusa.pics/",
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
        style_id: randomInt(2, 7)
    };

    try {
        const response = await fetch(`${agent}/api/text/text-to-image`, {
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
        if (responseData?.task_id) {
            // 获取任务ID并开始轮询结果
            return await pollTaskResult(responseData.task_id);
        } else {
            console.warn("任务提交成功，但未返回task_id。", responseData);
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