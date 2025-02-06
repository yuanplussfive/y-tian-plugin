import fetch from 'node-fetch';
import { Response } from 'node-fetch';

interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface ApiResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

interface ModelAliases {
    [key: string]: string;
}

class JmuzClient {
    private readonly apiBase: string;
    private readonly apiKey: string;
    private readonly modelAliases: ModelAliases;
    private readonly userAgent: string;

    constructor() {
        this.apiBase = "https://jmuz.me/gpt/api/v2";
        this.apiKey = "prod";
        this.userAgent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36";
        
        this.modelAliases = {
            "qwq-32b": "qwq-32b-preview",
            "gemini-1.5-flash": "gemini-flash",
            "gemini-1.5-pro": "gemini-pro",
            "gemini-2.0-flash-thinking": "gemini-thinking",
            "deepseek-chat": "deepseek-v3"
        };
    }

    private checkFilteredContent(text: string): boolean {
        const filteredPhrases: string[] = [
            "https://discord.gg/",
            "for free"
        ];
        return filteredPhrases.some(phrase => text.includes(phrase));
    }

    private getModelName(model: string): string {
        return this.modelAliases[model] || model;
    }

    private async handleApiResponse(response: Response): Promise<string | null> {
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const result = await response.json() as ApiResponse;
        const content = result.choices[0]?.message?.content;

        if (!content) {
            throw new Error('Invalid API response format');
        }

        return this.checkFilteredContent(content) ? null : content;
    }

    public async sendMessage(model: string = "gpt-4o", messages: Message[]): Promise<string | null> {
        try {
            const response = await fetch(`${this.apiBase}/chat/completions`, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                    "accept": "*/*",
                    "user-agent": this.userAgent
                },
                body: JSON.stringify({
                    model: this.getModelName(model),
                    messages,
                    stream: false
                })
            });

            return await this.handleApiResponse(response);
        } catch (error) {
            console.error("Request failed:", error instanceof Error ? error.message : 'Unknown error');
            return null;
        }
    }
}

export async function jmuz(messages: Message[], model: string = "gpt-4o"): Promise<string | null> {
    const client = new JmuzClient();
    return await client.sendMessage(model, messages);
}