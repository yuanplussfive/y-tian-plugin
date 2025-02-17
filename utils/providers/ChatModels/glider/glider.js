import fetch from 'node-fetch';

class Glider {
    constructor() {
        this.label = "Glider";
        this.url = "https://glider.so";
        this.apiEndpoint = "https://glider.so/api/chat";
        this.defaultModel = 'chat-llama-3-1-70b';
        this.models = [
            'chat-llama-3-1-70b',
            'chat-llama-3-1-8b',
            'chat-llama-3-2-3b',
            'deepseek-ai/DeepSeek-R1'
        ];

        this.modelAliases = {
            "llama-3.1-70b": "chat-llama-3-1-70b",
            "llama-3.1-8b": "chat-llama-3-1-8b",
            "llama-3.2-3b": "chat-llama-3-2-3b",
            "deepseek-r1": "deepseek-ai/DeepSeek-R1",
        };
    }

    getModel(model) {
        return this.modelAliases[model] || model;
    }

    formatMessages(messages) {
        return messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            id: "",
            chatId: "",
            createdOn: "",
            model: null
        }));
    }

    async chat(messages, model = this.defaultModel, proxy = null) {
        const headers = {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/json",
            "origin": this.url,
            "referer": `${this.url}/`,
            "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
        };

        const requestData = {
            messages: this.formatMessages(messages),
            model: this.getModel(model)
        };

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestData),
                agent: proxy
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            let fullResponse = '';

            for await (const chunk of response.body) {
                const text = chunk.toString();
                const lines = text.split('\n');

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    if (line.includes('[DONE]')) {
                        return {
                            finish: true,
                            reason: 'stop',
                            response: fullResponse // 返回完整响应
                        };
                    }

                    try {
                        const jsonData = JSON.parse(line.slice(6));
                        const content = jsonData.choices[0]?.delta?.content;

                        if (content) {
                            fullResponse += content;
                        }
                    } catch (error) {
                        continue;
                    }
                }
            }

            return {
                finish: true,
                reason: 'stop',
                response: fullResponse
            };
        } catch (error) {
            return { finish: true, reason: 'error', error };
        }
    }
}

export async function glider(messages, model) {
    const glider = new Glider();

    try {
        const result = await glider.chat(messages, model);
        if (result.response) {
            return result.response;
        }
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}