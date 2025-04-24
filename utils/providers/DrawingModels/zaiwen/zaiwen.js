import fetch from 'node-fetch';
import { random_safe } from '../../../requests/safeurl.js';

/**
 * 异步地发送图像生成任务，具有域名重试机制。
 *
 * @param {string} model - 要使用的图像生成模型的名称。
 * @param {string} prompt - 图像生成的文本提示。
 * @param {string} ratio - 生成图像的宽高比。
 * @returns {Promise<{taskId: string, domain: string} | null>} - 一个 Promise，如果任务成功，则解析为一个包含任务ID和域名的对象，
 *                                   如果任务提交失败或未完成，则解析为 null。
 */
async function sendImageTask(model, prompt, ratio) {
    const API_DOMAINS = [
        random_safe('aHR0cHM6Ly9hbGl5dW4uemFpd2VuLnRvcA==')
    ];
    const MAX_ATTEMPTS = 3;
    let attempts = 0;
    let currentDomain = null;
    let lastError = null;

    while (attempts < MAX_ATTEMPTS) {
        attempts++;
        if (!currentDomain || attempts > 1) {
            const availableDomains = API_DOMAINS.filter(domain => domain !== currentDomain);
            if (availableDomains.length > 0) {
                currentDomain = availableDomains[Math.floor(Math.random() * availableDomains.length)];
            } else if (API_DOMAINS.length > 0) {
                currentDomain = API_DOMAINS[0];
            } else {
                console.error('未配置任何API域名。');
                return null;
            }
        }


        const url = `${currentDomain}/draw/mj/imagine`;
        const options = {
            method: 'POST',
            headers: {
                'accept': 'application/json, text/plain, */*',
                'content-type': 'application/json',
                'Referer': random_safe('aHR0cHM6Ly96YWl3ZW4ueHVlYmFuLm9yZy5jbi8='),
            },
            body: JSON.stringify({
                model_name: model,
                prompt: prompt,
                ratio: ratio,
                seed: Math.floor(Math.random() * 10000000000) // 生成一个随机种子
            })
        };

        console.log(`尝试 ${attempts}/${MAX_ATTEMPTS} 向 ${currentDomain} 发送图像生成任务...`);

        try {
            const response = await fetch(url, options);
            const result = await response.json();

            console.log(`任务提交API返回 (尝试 ${attempts}):`, JSON.stringify(result, null, 2));

            // 根据你提供的示例，成功的状态码在 status.code 中
            if (result?.status?.code === 0) {
                // 提交任务成功，返回任务ID和使用的域名
                if (result?.info?.task_id) {
                    console.log(`任务提交成功，任务ID: ${result.info.task_id}`);
                    return { taskId: result.info.task_id, domain: currentDomain };
                } else {
                    console.error(`任务提交成功但未返回任务ID (尝试 ${attempts}/${MAX_ATTEMPTS}):`, result?.status?.msg || '未知错误');
                    lastError = new Error('任务提交成功但未返回任务ID');
                    // 继续重试，尝试其他域名
                    continue;
                }
            } else {
                console.error(`添加任务失败 (尝试 ${attempts}/${MAX_ATTEMPTS})，API返回状态码 ${result?.status?.code}:`, result?.status?.msg || '未知错误');
                lastError = new Error(result?.status?.msg || '未知错误');
                // 继续重试，尝试其他域名
                continue;
            }
        } catch (error) {
            lastError = error;
            console.error(`发送图像任务时请求出错 (尝试 ${attempts}/${MAX_ATTEMPTS}) 向 ${currentDomain}:`, error);
            // 继续重试，尝试其他域名
            continue;
        }
    }

    console.error(`已达到最大尝试次数 (${MAX_ATTEMPTS})，任务提交失败。最后一次错误:`, lastError?.message || '未知错误');
    return null; // 所有尝试都失败
}

/**
 * 异步地检查图像生成任务的状态，使用固定的域名。
 *
 * @param {string} taskId - 要检查的图像生成任务的 ID。
 * @param {string} domain - 用于检查任务状态的 API 域名。
 * @param {number} [maxAttempts=60] - 检查任务状态的最大尝试次数 (约 5分钟 @ 5s interval)。
 * @param {number} [interval=5000] - 每次状态检查之间的间隔（毫秒）。
 * @returns {Promise<string|null>} - 一个 Promise，如果任务成功，则解析为图像 URL，
 *                                   如果任务未在最大尝试次数内完成或遇到错误，则解析为 null。
 */
async function checkTaskStatus(taskId, domain, maxAttempts = 60, interval = 5000) {
    const url = `${domain}/draw/mj/fetch`; // 使用提交任务时成功的域名
    let attempt = 0;

    while (attempt < maxAttempts) {
        attempt++;
        console.log(`尝试 ${attempt}/${maxAttempts}: 正在检查任务 ID ${taskId} 的任务状态...`);

        const options = {
            method: 'POST',
            headers: {
                'accept': 'application/json, text/plain, */*',
                'content-type': 'application/json',
                'Referer': random_safe('aHR0cHM6Ly96YWl3ZW4ueHVlYmFuLm9yZy5jbi8='),
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
                        if (imageUrl && typeof imageUrl === 'string' && !imageUrl.startsWith(random_safe('aHR0cHM6Ly96YWl3ZW4uc3VwZXJhdG1hcy5jb20vaW1hZ2VzL3JlZmVyX2ltYWdlcy9iYW5lZE1lc3NhZ2UuanBn'))) {
                            console.log('任务已成功完成!');
                            console.log('图像 URL:', imageUrl);
                            return imageUrl;
                        } else {
                            console.warn('任务已完成，但返回了被禁止的图像或没有有效的图像URL。');
                            return null;
                        }
                    case 'PENDING':
                        console.log('任务仍在进行中。');
                        break;
                    case undefined:
                        console.warn('API返回状态码0，但info.status字段缺失。正在重试...');
                        break;
                    default:
                        console.error(`任务状态为意外值: ${taskStatus}. 认为任务失败。`);
                        return null;
                }
            } else {
                console.error(`获取任务状态时API返回非零状态码 ${result?.status?.code}: ${result?.status?.msg || '未知错误'}. 正在重试...`);
            }

        } catch (error) {
            console.error(`请求检查任务状态时出错 (尝试 ${attempt}/${maxAttempts}):`, error);
        }

        if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, interval));
        }
    }

    // 循环结束，达到最大尝试次数仍未成功
    console.error(`已达到最大尝试次数 (${maxAttempts})。任务 ${taskId} 未成功完成。`);
    return null;
}

/**
 * 异步地生成图像。
 *
 * @param {string} model - 要使用的图像生成模型的名称。
 * @param {string} prompt - 图像生成的文本提示。
 * @param {string} ratio - 生成图像的宽高比。
 * @returns {Promise<string|null>} - 一个 Promise，如果任务成功，则解析为图像 URL，
 *                                   如果任务提交失败或未完成，则解析为 null。
 */
async function zaiwen_drawing(model, prompt, ratio) {
    try {
        console.log(`开始提交图像生成任务: 模型=${model}, 提示=${prompt}, 比例=${ratio}`);
        const taskInfo = await sendImageTask(model, prompt, ratio);

        if (!taskInfo) {
            console.error('任务提交失败，无法检查状态。');
            return null;
        }

        console.log(`任务已提交，任务ID: ${taskInfo.taskId}，使用域名: ${taskInfo.domain}。开始检查任务状态...`);
        const imageUrl = await checkTaskStatus(taskInfo.taskId, taskInfo.domain);

        if (imageUrl) {
            console.log('图像已成功生成并获取 URL。');
            return imageUrl;
        } else {
            console.error('任务未在规定时间内完成或获取图像URL失败。');
            return null;
        }
    } catch (error) {
        console.error('图像生成流程中发生未捕获的错误:', error);
        return null;
    }
}

/**
 * 异步地生成图像 (导出函数)。
 *
 * @param {string} prompt - 图像生成的文本提示。
 * @param {string} model - 要使用的图像生成模型的名称。
 * @param {string} [ratio='1:1'] - 生成图像的宽高比。
 * @returns {Promise<string|null>} - 一个 Promise，如果任务成功，则解析为图像 URL，
 *                                   如果任务提交失败或未完成，则解析为 null。
 */
export async function ZaiwenDrawing(prompt, model, ratio = '1:1') {
    if (!prompt || !model) {
        console.error('prompt 和 model 参数不能为空。');
        return null;
    }

    console.log('调用 ZaiwenDrawing 函数...');
    try {
        const imageUrl = await zaiwen_drawing(model, prompt, ratio);

        if (imageUrl) {
            console.log('ZaiwenDrawing 成功，返回图像 URL。');
            return imageUrl;
        } else {
            console.error('ZaiwenDrawing 失败，返回 null。');
            return null;
        }
    } catch (error) {
        console.error('ZaiwenDrawing 函数执行过程中出错:', error);
        return null;
    }
}