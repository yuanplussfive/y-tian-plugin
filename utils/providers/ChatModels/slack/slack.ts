import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);
const formDataPath = join(__dirname, '../../../../node_modules/form-data');
const FormData = require(formDataPath);
import fs from 'fs';
import fetch from 'node-fetch';

const DATA_FILE = join(__dirname, 'slack.json');

interface SlackConfig {
    bot_token: string;
    cookie_d: string;
    bot_id: string;
    channel_id: string;
}

interface Message {
    content: string;
}

interface SlackResponse {
    ok: boolean;
    ts?: string;
    message?: {
        ts: string;
    };
    error?: string;
    messages?: {
        text: string;
    }[];
}

class SlackClient {
    private time: string = "";          // 用于记录Slack对话的时间戳，用于线程回复
    private slackhistory: string = "114514"; // 初始化的历史记录时间戳
    // private prompt: string = "";        // (已移除预设功能，此变量不再使用)

    // 与Slack进行对话的主要函数
    async chat(messages: Message[]): Promise<string | null> {
        const { bot_token, cookie_d, bot_id, channel_id } = await this.getCookie();

        let message: string = "";         // 要发送的消息内容
        let useHistory: boolean = false;   // 是否使用历史对话

        // 检查消息格式是否正确
        if (messages && Array.isArray(messages) && messages.length > 0) {
            if (messages.length === 1) {
                message = messages[0].content; // 新的对话，使用第一条消息的内容
                this.time = ""; // 重置时间戳，开始新的对话
                this.slackhistory = "114514"; // 重置历史记录
            } else {
                // 多个消息，只发送最后一个
                message = messages[messages.length - 1].content;
                useHistory = true; // 标记为使用历史对话
            }
        } else {
            throw new Error("Invalid message format.  Expected an array of messages."); // 抛出错误，消息格式不正确
        }

        // 构建Slack API请求的blocks
        const blocks = [{
            "type": "rich_text",
            "elements": [{
                "type": "rich_text_section",
                "elements": [{
                    "type": "user",
                    "user_id": bot_id // 标记消息的发送者为Bot
                },
                {
                    "type": "text",
                    "text": message  // 消息内容
                }]
            }]
        }];

        // 构建Slack API请求的payload
        const payload = {
            blocks: blocks,
            channel: channel_id,
            "thread_ts": this.time // 如果是延续对话，则带上时间戳
        };

        // 构建Slack API请求的headers
        const headers = {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": `Bearer ${bot_token}`, // 使用Bot Token进行身份验证
            "cookie": `d=${cookie_d}`             // 带上Cookie
        };

        try {
            // 调用Slack API发送消息
            const response = await fetch('https://slack.com/api/chat.postMessage', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });

            const responseJson = await response.json() as SlackResponse; // 解析返回的JSON, 并进行类型断言

            // 检查是否身份验证失败
            if (responseJson.error === 'invalid_auth' || responseJson.error === 'not_authed') {
                throw new Error("Slack身份验证失败,请检查配置!");
            }

            if (!responseJson.message?.ts) {
                throw new Error(`Slack API call failed: ${JSON.stringify(responseJson)}`);
            }

            const ts = responseJson.message.ts; // 获取返回的消息的时间戳
            if (this.slackhistory === "114514") {
                this.slackhistory = ts; // 记录历史记录时间戳
                this.time = ts;         // 记录当前消息的时间戳，用于后续回复
            }

            // 处理Slack的回复
            const reply = await this.processReplies(ts, bot_token, channel_id, headers);
            return reply; // 返回Slack的回复

        } catch (error: any) {
            console.error("Error during Slack API call:", error);
            throw new Error(`与Slack通信时发生错误：${error.message}`); // 抛出错误
        }
    }

    // 处理Slack回复的函数
    private async processReplies(ts: string, bot_token: string, channel_id: string, headers: any): Promise<string | null> {
        let count: number = 0;           // 记录重试次数
        let retries: number = 0;         // 记录连续相同回复的次数
        let typingCount: number = 0;     // 记录正在输入的次数
        let hasReplied: boolean = false;  // 是否已经回复
        let lastReplies: string = '';    // 上一次的回复内容

        // 执行请求的内部函数
        const executeRequest = async (): Promise<string | boolean> => {
            const formData = new FormData();
            formData.append('content', 'null');
            formData.append('token', bot_token);

            try {
                // 调用Slack API获取回复
                const answer = await fetch(`https://slack.com/api/conversations.replies?channel=${channel_id}&ts=${this.slackhistory}&pretty=1&oldest=${ts}`, {
                    method: 'POST',
                    body: formData,
                    headers: headers
                });

                const result = await answer.json() as SlackResponse; // 解析返回的JSON, 并进行类型断言

                // 检查是否身份验证失败
                if (result.error === 'invalid_auth' || result.error === 'not_authed') {
                    throw new Error("Slack身份验证失败,请检查配置!");
                } else if (result.error) {
                    // 如果有其他错误，则重试
                    count++;
                    console.log(`Slack通信速率被限制,正在尝试绕过! 次数:${count}`);
                    await new Promise(r => setTimeout(r, 4000)); // 等待4秒
                    return false; // 继续循环
                }

                // 检查是否有消息
                if (result.messages && result.messages[1]) {
                    const currentReplies = result.messages[1].text; // 获取回复内容
                    const output = await this.isNonEmptyString(currentReplies); // 检查回复内容是否为空

                    if (!hasReplied && output) {
                        // 如果还没有回复，并且回复内容不为空
                        if (lastReplies === currentReplies) {
                            retries++; // 如果和上次回复相同，则重试次数加1
                        }

                        lastReplies = currentReplies; // 记录本次回复
                        if (retries >= 3) {
                            // 如果连续4次回复相同，则认为已经回复完毕
                            const finalReply = await this.decodeHtmlEntities(currentReplies); // 解码HTML实体
                            hasReplied = true; // 标记为已经回复
                            return finalReply.trim(); // 返回回复内容
                        }
                    } else {
                        typingCount++; // 否则，标记为正在输入
                    }
                }

                if (typingCount >= 8) {
                    throw new Error("Slack通讯失败，请重置对话!"); // 如果正在输入次数过多，则认为通讯失败
                }

                return false; // 继续循环

            } catch (error: any) {
                console.error("Error fetching replies:", error);
                throw new Error(`获取回复时发生错误: ${error.message}`); // 抛出错误
            }
        };

        // 循环获取回复，直到获取到回复或者超时
        while (!hasReplied) {
            const reply = await executeRequest(); // 执行请求
            if (typeof reply === 'string') {
                return reply; // 如果获取到回复，则返回
            }
            await new Promise(r => setTimeout(r, 2800)); // 等待2.8秒
        }

        return null; // 如果循环结束还没有回复，返回null
    }

    // 从数据文件中获取Cookie
    private async getCookie(): Promise<SlackConfig> {
        try {
            const dataString = fs.readFileSync(DATA_FILE, 'utf-8'); // 读取数据文件, 并指定编码为 utf-8
            const data = JSON.parse(dataString) as { slack: SlackConfig }; // 解析 JSON, 并进行类型断言
            return data.slack; // 返回Cookie
        } catch (error: any) {
            console.error("Error reading or parsing data file:", error);
            throw new Error(`读取或解析数据文件时发生错误: ${error.message}`); // 抛出错误
        }
    }

    // 解码HTML实体
    private async decodeHtmlEntities(text: string): Promise<string> {
        const entities: { [key: string]: string } = {
            '&lt;': '<',
            '&gt;': '>',
            '&amp;': '&',
            '&quot;': '"',
            '&apos;': "'"
        };
        return Object.keys(entities).reduce((acc, key) => acc.replace(new RegExp(key, 'g'), entities[key]), text);
    }

    // 检查字符串是否为空
    private async isNonEmptyString(str: string): Promise<boolean> {
        return typeof str === 'string' && str.trim().length > 0;
    }
}

const slack = new SlackClient();

export async function SlackAi(messages: Message[]): Promise<string | null> {

    try {
        const response = await slack.chat(messages);
        //console.log('Slack 回复:', response); // 打印 Slack 的回复
        return response?.trim() || null;

    } catch (error: any) {
        console.error('主程序发生错误:', error.message); // 捕获主程序中的错误
        return null;
    }
}