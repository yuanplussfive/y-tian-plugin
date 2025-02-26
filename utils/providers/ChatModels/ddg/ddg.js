let fetch = (await import('node-fetch')).default;

/**
 * 调用 DDG API 进行对话，支持URL轮询和负载均衡。
 *
 * @param {Array<object>} messages 对话消息数组，例如：[{ role: 'user', content: '你好' }]。
 * @param {string} model 使用的模型名称。
 * @param {string[]} 
 * @returns {Promise<string | null>}  返回对话的回复内容，如果失败则返回null。
 */
export const ddg = async (
    messages,
    model,
    urls = [
        'https://ddg2api.deno.dev/v1/chat/completions',
        'https://ddgapi.deno.dev/v1/chat/completions'
    ]
) => {
    const data = { model, messages, stream: false };
    const maxAttempts = urls.length * 2; // 最大尝试次数：每个URL尝试两次。
    let attemptCount = 0;

    for (let i = 0; attemptCount < maxAttempts; i = (i + 1) % urls.length) {
        const url = urls[i];

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const text = await response.text();
                console.warn(`请求 ${url} 失败, 状态码: ${response.status}, ${text}`);
                if (response.status === 429 || response.status === 403) {
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                }
                attemptCount++;
                continue; // 尝试下一个URL
            }

            const res = await response.json();
            const content = res?.choices?.[0]?.message?.content?.trim();

            return content ?? null; // 如果内容为空，返回 null
        } catch (error) {
            console.error(`从 ${url} 获取数据时发生错误:`, error);
            attemptCount++;
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    console.error('所有尝试都失败了。');
    return null;
};