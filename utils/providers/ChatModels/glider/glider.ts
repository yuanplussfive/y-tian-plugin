import fetch from 'node-fetch';

interface Message {
    role: string;
    content: string;
    id?: string;
    chatId?: string;
    createdOn?: string;
    model?: string | null;
}

interface ChatResponse {
    finish: boolean;
    reason: string;
    response?: string;
    error?: Error;
}

interface Choice {
    delta: {
        content?: string;
    };
}

interface StreamResponse {
    choices: Choice[];
}

class Glider {
    private readonly label: string;
    private readonly url: string;
    private readonly apiEndpoint: string;
    private readonly defaultModel: string;
    private readonly models: string[];
    private readonly modelAliases: Record<string, string>;

    constructor() {
        // 基础配置
        this.label = "Glider";
        this.url = "https://glider.so";
        this.apiEndpoint = "https://glider.so/api/chat";

        // 模型配置
        this.defaultModel = 'chat-llama-3-1-70b';
        this.models = [
            'chat-llama-3-1-70b',
            'chat-llama-3-1-8b',
            'chat-llama-3-2-3b',
            'deepseek-ai/DeepSeek-R1'
        ];

        // 模型别名映射
        this.modelAliases = {
            "llama-3.1-70b": "chat-llama-3-1-70b",
            "llama-3.1-8b": "chat-llama-3-1-8b",
            "llama-3.2-3b": "chat-llama-3-2-3b",
            "deepseek-r1": "deepseek-ai/DeepSeek-R1",
        };
    }

    private getModel(model: string): string {
        return this.modelAliases[model] || model;
    }

    private formatMessages(messages: Message[]): Message[] {
        return messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            id: "",
            chatId: "",
            createdOn: "",
            model: null
        }));
    }

    public async chat(
        messages: Message[],
        model: string = this.defaultModel,
        proxy: any = null
    ): Promise<ChatResponse> {
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

            if (!response.body) {
                throw new Error('Response body is null');
            }

            for await (const chunk of response.body) {
                const text = chunk.toString();
                const lines = text.split('\n');

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    if (line.includes('[DONE]')) {
                        return {
                            finish: true,
                            reason: 'stop',
                            response: fullResponse
                        };
                    }

                    try {
                        const jsonData: StreamResponse = JSON.parse(line.slice(6));
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
            if (error instanceof Error) {
                return {
                    finish: true,
                    reason: 'error',
                    error
                };
            }
            return {
                finish: true,
                reason: 'error',
                error: new Error('Unknown error occurred')
            };
        }
    }
}

export default Glider;