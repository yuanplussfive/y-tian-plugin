import readline from 'readline';

export const processStreamResponse = async (response) => {

    const rl = readline.createInterface({
        input: response.body,
        crlfDelay: Infinity
    });

    let result = '';

    try {
        for await (const line of rl) {
            if (line.startsWith('data: ')) {
                const dataStr = line.replace('data: ', '').trim();
                if (dataStr === '[DONE]') break;

                try {
                    const json = JSON.parse(dataStr);
                    const content = json.choices?.[0].delta?.content;
                    if (content) {
                        result += content;
                    }
                } catch (err) {
                    // 忽略 JSON 解析错误
                }
            }
        }

        return result;
    } catch (error) {
        console.error('处理流响应失败:', error);
        return `处理流响应失败: ${error.message}`;
    } finally {
        rl.close();
    }
}

// 使用示例:
// const response = await fetch(url, options);
// const result = await processStreamResponse(response);
