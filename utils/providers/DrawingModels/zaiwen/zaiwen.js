import fetch from 'node-fetch'; // 确保你已经安装了 node-fetch

/**
 * 异步地向 Zaiwen API 发送图像生成任务，具有域名重试机制。
 *
 * @param {string} model - 要使用的图像生成模型的名称。
 * @param {string} prompt - 图像生成的文本提示。
 * @param {string} ratio - 生成图像的宽高比。
 * @returns {Promise<{taskId: string, domain: string} | null>} - 一个 Promise，如果任务成功，则解析为一个包含任务ID和域名的对象，
 *                                   如果任务提交失败或未完成，则解析为 null。
 */
async function sendImageTask(model, prompt, ratio) {
    const API_DOMAINS = [
        'https://aliyun.zaiwen.top',
        // 添加更多域名
    ];
    const DEFAULT_API_DOMAIN = 'https://aliyun.zaiwen.top';
    const MAX_ATTEMPTS = 3;
    let attempts = 0;
    let currentDomain = null;
    let lastError = null;

    while (attempts < MAX_ATTEMPTS) {
        attempts++;
        try {
            if (!currentDomain) {
                currentDomain = API_DOMAINS[Math.floor(Math.random() * API_DOMAINS.length)];
            } else {
                const availableDomains = API_DOMAINS.filter(domain => domain !== currentDomain);
                if (availableDomains.length === 0) {
                    currentDomain = DEFAULT_API_DOMAIN;
                    break;
                } else {
                    currentDomain = availableDomains[Math.floor(Math.random() * availableDomains.length)];
                }
            }

            const url = `${currentDomain}/draw/mj/imagine`;
            const options = {
                method: 'POST',
                headers: {
                    'accept': 'application/json, text/plain, */*',
                    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
                    'access-control-allow-origin': '*',
                    'content-type': 'application/json',
                    'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Microsoft Edge";v="128"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-site',
                    'Referer': 'https://zaiwen.xueban.org.cn/',
                    'Referrer-Policy': 'strict-origin-when-cross-origin'
                },
                body: JSON.stringify({
                    model_name: model,
                    prompt: prompt,
                    ratio: ratio,
                    seed: Math.floor(Math.random() * 10000000000) // 生成一个随机种子
                })
            };

            const response = await fetch(url, options);
            const result = await response.json();

            console.log(result);
            console.log(JSON.stringify(result, null, 2));

            if (result?.status?.code === 0) {
                return { taskId: result?.info?.task_id, domain: currentDomain }; // 返回任务ID和域名
            } else {
                console.error(`添加任务失败 (尝试 ${attempts}/${MAX_ATTEMPTS}):`, result?.status?.msg || '未知错误');
                lastError = new Error(result?.status?.msg || '未知错误');
            }
        } catch (error) {
            lastError = error;
            console.error(`发送图像任务时出错 (尝试 ${attempts}/${MAX_ATTEMPTS}):`, error);
        }
    }

    console.error('已达到最大尝试次数，任务提交失败。');
    return null; // 所有尝试都失败
}

/**
 * 异步地检查图像生成任务的状态，使用固定的域名。
 *
 * @param {string} taskId - 要检查的图像生成任务的 ID。
 * @param {string} domain - 用于检查任务状态的 API 域名。
 * @param {number} [maxAttempts=40] - 检查任务状态的最大尝试次数。
 * @param {number} [interval=5000] - 每次状态检查之间的间隔（毫秒）。
 * @returns {Promise<string|null>} - 一个 Promise，如果任务成功，则解析为图像 URL，
 *                                   如果任务未在最大尝试次数内完成或遇到错误，则解析为 null。
 */
async function checkTaskStatus(taskId, domain, maxAttempts = 40, interval = 5000) {
    const url = `${domain}/draw/mj/fetch`; // 使用固定的域名
    let attempt = 0;
    let lastError = null;

    while (attempt < maxAttempts) {
        attempt++;
        console.log(`尝试 ${attempt}: 正在检查任务 ID ${taskId} 的任务状态...`);

        const options = {
            method: 'POST',
            headers: {
                'accept': 'application/json, text/plain, */*',
                'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
                'access-control-allow-origin': '*',
                'content-type': 'application/json',
                'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Microsoft Edge";v="128"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
                'Referer': 'https://zaiwen.xueban.org.cn/',
                'Referrer-Policy': 'strict-origin-when-cross-origin'
            },
            body: JSON.stringify({ task_id: taskId })
        };

        try {
            const response = await fetch(url, options);
            const result = await response.json();

            if (result?.status?.code === 0) {
                const taskStatus = result?.info?.status;

                switch (taskStatus) {
                    case 'SUCCESS':
                        const imageUrl = result?.info?.imageUrl?.[0];
                        if (imageUrl && !imageUrl.startsWith('https://zaiwen.superatmas.com/images/refer_images/banedMessage.jpg')) {
                            console.log('任务已成功完成!');
                            console.log('图像 URL:', imageUrl);
                            return imageUrl;
                        } else {
                            console.warn('任务已完成，但返回了被禁止的图像。');
                            return null;
                        }
                    case 'PENDING':
                        console.log('任务仍在进行中。正在重试...');
                        break;
                    default:
                        console.error('意外的任务状态:', taskStatus);
                        return null;
                }
            } else {
                console.error('获取任务状态时出错:', result?.status?.msg || '未知错误');
                lastError = new Error(result?.status?.msg || '未知错误');
                return null; // 直接返回 null，不再重试
            }
        } catch (error) {
            lastError = error;
            console.error('请求失败:', error);
            return null; // 直接返回 null，不再重试
        }

        await new Promise(resolve => setTimeout(resolve, interval));
    }

    console.error('已达到最大尝试次数。任务未成功完成。');
    return null;
}

/**
 * 异步地使用 Zaiwen API 生成图像。
 *
 * @param {string} model - 要使用的图像生成模型的名称。
 * @param {string} prompt - 图像生成的文本提示。
 * @param {string} ratio - 生成图像的宽高比。
 * @returns {Promise<string|null>} - 一个 Promise，如果任务成功，则解析为图像 URL，
 *                                   如果任务提交失败或未完成，则解析为 null。
 */
async function zaiwen_drawing(model, prompt, ratio) {
    try {
        const taskInfo = await sendImageTask(model, prompt, ratio);

        if (!taskInfo) {
            console.log('任务提交失败。');
            return null;
        }

        const imageUrl = await checkTaskStatus(taskInfo.taskId, taskInfo.domain);

        if (imageUrl) {
            console.log('图像已成功生成:', imageUrl);
            return imageUrl;
        } else {
            console.log('任务失败或未在最大尝试次数内完成。');
            return null;
        }
    } catch (error) {
        console.error('图像生成过程中出错:', error);
        return null;
    }
}

/**
 * 异步地使用 Zaiwen API 生成图像。
 *
 * @param {string} model - 要使用的图像生成模型的名称。
 * @param {string} prompt - 图像生成的文本提示。
 * @param {string} ratio - 生成图像的宽高比。
 * @returns {Promise<string|null>} - 一个 Promise，如果任务成功，则解析为图像 URL，
 *                                   如果任务提交失败或未完成，则解析为 null。
 */
export async function ZaiwenDrawing(model, prompt, ratio) {
    try {
        const imageUrl = await zaiwen_drawing(model, prompt, ratio);

        if (imageUrl) {
            return imageUrl;
        } else {
            console.log('图像生成失败。');
            return null;
        }
    } catch (error) {
        console.error('示例用法中出错:', error);
        return null;
    }
}