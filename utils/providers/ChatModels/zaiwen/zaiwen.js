import fetch from 'node-fetch';

/**
* 调用在Zaiwen平台的模型接口
* @param {string} model - 模型名称
* @param {Array} history - 对话历史
* @returns {string|undefined} - 模型回复或undefined
*/
export async function zaiwen(messages, model) {
    const generateApiUrls = (count) =>
        Array.from({ length: count }, (_, i) =>
            `https://sunoproxy${i ? i : ''}.deno.dev`
        );

    const API_DOMAINS = generateApiUrls(31);
    const DEFAULT_API_DOMAIN = 'https://aliyun.zaiwen.top';
    let attempts = 0; // 尝试次数
    let currentDomain = null; // 当前使用的域名

    while (attempts < 3) {
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

            const apiUrl = `${currentDomain}/admin/chatbot`; // 构建API URL

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'referer': 'https://www.zaiwen.org.cn/'
                },
                body: JSON.stringify({
                    message: messages,
                    mode: model,
                    prompt_id: "",
                    key: ''
                })
            });

            const responseData = await response.text();

            const BanMessages = {
                "您的内容中有不良信息": null,
                "Message too long": null,
                "我们聊的太多了": null,
                "zaiwen": null,
                "Server Error": null,
                "此模型暂时无法处理你的请求": null,
                '{"detail":"模型返回出错，可能是文档类型不支持、网络波动、输入文字过长"}': null
            };

            for (const [key, value] of Object.entries(BanMessages)) {
                const regex = new RegExp(key, 'i');
                if (regex.test(responseData)) {
                    return value;
                }
            }

            return responseData.trim();

        } catch (error) {
            lastError = error;
            console.error(`第 ${attempts} 次尝试使用域名 ${currentDomain} 失败:`, error.message);
        }
    }

    try {
        const response = await fetch(`${DEFAULT_API_DOMAIN}/admin/chatbot`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'referer': 'https://www.zaiwen.org.cn/'
            },
            body: JSON.stringify({
                message: messages,
                mode: model,
                prompt_id: "",
                key: ''
            })
        });

        const responseData = await response.text();

        const BanMessages = {
            "您的内容中有不良信息": null,
            "Message too long": null,
            "我们聊的太多了": null,
            "zaiwen": null,
            "Server Error": null,
            "暂时无法处理你的请求": null,
            '{"detail":"模型返回出错，可能是文档类型不支持、网络波动、输入文字过长"}': null
        };

        for (const [key, value] of Object.entries(BanMessages)) {
            const regex = new RegExp(key, 'i');
            if (regex.test(responseData)) {
                return value;
            }
        }

        return responseData.trim();

    } catch (error) {
        console.error(`使用默认域名 ${DEFAULT_API_DOMAIN} 失败:`, error.message);
        return null; // 所有尝试都失败了，返回 null
    }
} 