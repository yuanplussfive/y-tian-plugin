import fetch from 'node-fetch';

class JmuzClient {
    constructor() {
        this.apiBase = "https://jmuz.me/gpt/api/v2";
        this.apiKey = "prod";

        this.modelAliases = {
            "QWQ-32b-preview": "qwq-32b-preview",
            "gemini-1.5-flash": "gemini-flash",
            "gemini-1.5-pro": "gemini-pro",
            "gemini-2.0-flash-thinking": "gemini-thinking",
            "deepseek-v3": "deepseek-v3"
        };
    }

    checkFilteredContent(text) {
        return text.includes("https://discord.gg/") || text.includes("for free");
    }

    async sendMessage(model = "gpt-4o", messages) {
        try {
            const response = await fetch(`${this.apiBase}/chat/completions`, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                    "accept": "*/*",
                    "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"
                },
                body: JSON.stringify({
                    model: this.modelAliases[model] || model,
                    messages,
                    stream: false
                })
            });

            const result = await response.json();
            const content = result.choices[0].message.content;
            return this.checkFilteredContent(content) ? null : content;
        } catch (error) {
            console.error("请求失败:", error);
            return null;
        }
    }
}

export async function jmuz(messages, model) {
    const client = new JmuzClient();
    return await client.sendMessage(model, messages);
}