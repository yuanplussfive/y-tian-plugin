import fetch from 'node-fetch';

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
        'https://aliyun.zaiwen.top'
        // 如果有其他备用域名，可以在这里添加
    ];
    // const DEFAULT_API_DOMAIN = 'https://aliyun.zaiwen.top'; // 实际上在当前逻辑中未被使用
    const MAX_ATTEMPTS = 3;
    let attempts = 0;
    let currentDomain = null;
    let lastError = null; // 保留用于记录最后一次错误

    while (attempts < MAX_ATTEMPTS) {
        attempts++;
        // 域名选择逻辑：第一次随机选择，之后选择一个与上次不同的域名（如果存在）
        if (!currentDomain || attempts > 1) { // 第一次或重试时选择域名
            const availableDomains = API_DOMAINS.filter(domain => domain !== currentDomain);
            if (availableDomains.length > 0) {
                currentDomain = availableDomains[Math.floor(Math.random() * availableDomains.length)];
            } else if (API_DOMAINS.length > 0) {
                // 如果没有其他域名可选，就只能用回唯一的那个（如果只有一个域名）
                currentDomain = API_DOMAINS[0];
            } else {
                console.error('未配置任何API域名。');
                return null; // 没有域名可用
            }
        }


        const url = `${currentDomain}/draw/mj/imagine`;
        const options = {
            method: 'POST',
            headers: {
                'accept': 'application/json, text/plain, */*',
                'content-type': 'application/json',
                // 移除一些不必要的浏览器特有头
                'Referer': 'https://zaiwen.xueban.org.cn/', // 保留 Referer，API可能检查
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
                // 移除一些不必要的浏览器特有头
                'Referer': 'https://zaiwen.xueban.org.cn/', // 保留 Referer
            },
            body: JSON.stringify({ task_id: taskId })
        };

        try {
            const response = await fetch(url, options);
            const result = await response.json();

            // console.log(`任务状态API返回 (尝试 ${attempt}):`, JSON.stringify(result, null, 2)); // 检查状态时频繁打印可能很吵，按需开启

            // 根据你提供的示例，成功的状态码在 status.code 中
            if (result?.status?.code === 0) {
                const taskStatus = result?.info?.status;

                switch (taskStatus) {
                    case 'SUCCESS':
                        const imageUrl = result?.info?.imageUrl?.[0];
                        // 检查是否存在图片URL且不是被禁止的图片
                        if (imageUrl && typeof imageUrl === 'string' && !imageUrl.startsWith('https://zaiwen.superatmas.com/images/refer_images/banedMessage.jpg')) {
                            console.log('任务已成功完成!');
                            console.log('图像 URL:', imageUrl);
                            return imageUrl; // 任务成功，返回URL
                        } else {
                            console.warn('任务已完成，但返回了被禁止的图像或没有有效的图像URL。');
                            return null; // 任务完成但结果无效
                        }
                    case 'PENDING':
                        console.log('任务仍在进行中。');
                        // 任务进行中，继续循环等待
                        break; // 退出 switch，继续 while 循环
                    case undefined:
                        // API返回状态码0，但info.status字段缺失，可能是API临时问题，继续重试
                        console.warn('API返回状态码0，但info.status字段缺失。正在重试...');
                        break; // 退出 switch，继续 while 循环
                    // 可以添加其他可能的失败状态，例如 'FAILED', 'CANCELLED' 等
                    // case 'FAILED':
                    // case 'CANCELLED':
                    //     console.error(`任务状态为 ${taskStatus}，任务失败。`);
                    //     return null; // 明确的任务失败状态
                    default:
                        // 遇到其他未知状态，认为可能是失败，记录并退出
                        console.error(`任务状态为意外值: ${taskStatus}. 认为任务失败。`);
                        return null;
                }
            } else {
                // API返回非零状态码，记录错误并继续重试
                console.error(`获取任务状态时API返回非零状态码 ${result?.status?.code}: ${result?.status?.msg || '未知错误'}. 正在重试...`);
                // 继续循环等待
            }

        } catch (error) {
            // 请求检查状态时出错（网络问题等），记录错误并继续重试
            console.error(`请求检查任务状态时出错 (尝试 ${attempt}/${maxAttempts}):`, error);
            // 继续循环等待
        }

        // 如果不是最后一次尝试，等待指定间隔
        if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, interval));
        }
    }

    // 循环结束，达到最大尝试次数仍未成功
    console.error(`已达到最大尝试次数 (${maxAttempts})。任务 ${taskId} 未成功完成。`);
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
 * 异步地使用 Zaiwen API 生成图像 (导出函数)。
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