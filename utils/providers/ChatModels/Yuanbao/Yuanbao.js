import { Readable } from 'stream';
import { TextDecoder } from 'util';
import { randomUUID } from 'crypto';

export class Yuanbao {
    constructor({ uuid, prompt, model, ck, search }) {
        if (!ck) throw new Error('Cookie (ck) is required');
        this.uuid = uuid || randomUUID();
        this.prompt = prompt;
        this.model = model || 'gpt_175B_0404';
        this.cookie = ck;
        this.search = search;
        this.url = `https://yuanbao.tencent.com/api/chat/${this.uuid}`;
        this.defaultHeaders = this.#getDefaultHeaders();
    }

    // Default headers
    #getDefaultHeaders() {
        return {
            'accept': '*/*',
            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'content-type': 'text/plain;charset=UTF-8',
            'x-language': 'zh-CN',
            'x-platform': 'win',
            'x-source': 'web',
            'x-instance-id': '5',
            'x-requested-with': 'XMLHttpRequest',
            'x-os_version': 'Windows(10)-Blink',
            'Referer': 'https://yuanbao.tencent.com/chat/naQivTmsDa?yb_channel=3009&yb_dl=js&msclkid=037cd4159bf21f409423bc156588c544',
            'cookie': this.cookie
        };
    }

    // Default request body
    #getRequestBody() {
        return {
            model: "gpt_175B_0404",
            prompt: this.prompt,
            plugin: 'Adaptive',
            displayPrompt: this.prompt,
            displayPromptType: 1,
            options: {
                imageIntention: {
                    needIntentionModel: true,
                    backendUpdateFlag: 2,
                    intentionStatus: true
                }
            },
            multimedia: [],
            agentId: 'naQivTmsDa',
            supportHint: 1,
            version: 'v2',
            chatModelId: this.model,
            ...(this.search && { supportFunctions: ["supportInternetSearch"] })
        };
    }

// Process SSE stream and generate markdown for images
async #processSSEStream(response) {
    const thinkContent = [];
    const textContent = [];
    let imageMarkdown = '';  // Initialize markdown for images
    let buffer = '';
    const stream = Readable.from(response.body);
    const decoder = new TextDecoder('utf-8');

    for await (const chunk of stream) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
            if (line.startsWith('data:')) {
                const data = line.slice(5).trim();
                if (data === '[DONE]') {
                    return { thinkContent, textContent, imageMarkdown };
                }
                if (data.startsWith('[')) continue;

                try {
                    const json = JSON.parse(data);
                    if (json.type === 'think' && json.content) {
                        thinkContent.push(json.content);
                    } else if (json.type === 'text' && json.msg) {
                        textContent.push(json.msg);
                    } else if (json.type === 'image' && json.imageUrlHigh) {
                        // Extract image URL and append to markdown with an index
                        const imageIndex = thinkContent.length + textContent.length;
                        imageMarkdown += `![Image ${imageIndex}](${json.imageUrlHigh})\n`;
                    }
                } catch (e) {
                    console.warn(`Skipping invalid JSON: ${data}`);
                }
            }
        }
    }

    if (buffer.startsWith('data:')) {
        const data = buffer.slice(5).trim();
        if (data !== '[DONE]') {
            try {
                const json = JSON.parse(data);
                if (json.type === 'think' && json.content) {
                    thinkContent.push(json.content);
                } else if (json.type === 'text' && json.msg) {
                    textContent.push(json.msg);
                } else if (json.type === 'image' && json.imageUrlHigh) {
                    // Extract image URL and append to markdown with an index
                    const imageIndex = thinkContent.length + textContent.length;
                    imageMarkdown += `![Image ${imageIndex}](${json.imageUrlHigh})\n`;
                }
            } catch (e) {
                console.warn(`Skipping invalid JSON in final buffer: ${data}`);
            }
        }
    }

    return { thinkContent, textContent, imageMarkdown };
}

    // Make API request
    async makeRequest() {
        try {
            console.log('Request URL:', this.url);
            console.log('Request Headers:', this.defaultHeaders);
            console.log('Request Body:', JSON.stringify(this.#getRequestBody()));

            const response = await fetch(this.url, {
                method: 'POST',
                headers: this.defaultHeaders,
                body: JSON.stringify(this.#getRequestBody())
            });

            console.log('Response Status:', response.status);
            console.log('Response Headers:', Object.fromEntries(response.headers));

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
            }

            const { thinkContent, textContent, imageMarkdown } = await this.#processSSEStream(response);
            const thinking = `<think>\n${thinkContent.join('')}\n</think>\n\n`;
            const text = textContent.join('');
            const images = imageMarkdown ? imageMarkdown : '';
            console.log(imageMarkdown)
            console.log(images)
            return {
                output: thinking + text + images,
                ck: this.cookie,
                convId: this.uuid
            };
        } catch (error) {
            console.error('Request failed:', error.message);
            throw error;
        }
    }
}