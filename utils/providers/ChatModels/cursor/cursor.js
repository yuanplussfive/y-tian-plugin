import fetch from 'node-fetch';
import YAML from 'yaml';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
* 调用 Cursor API，支持轮询密钥，并在请求失败时尝试使用其他密钥。
* @param {Array} messages - 消息数组，传递给 Cursor API。
* @param {string} model - 模型名称，传递给 Cursor API。
* @returns {Promise<string|null>} - 如果成功，返回 API 的输出字符串；否则，返回 null。
*/
export const cursor = async (messages, model) => {
    const configPath = path.join(__dirname, '../../../../config/message.yaml');
    console.log(configPath)
    let config = {}; // 初始化配置对象

    // 检查配置文件是否存在，如果存在则读取并解析
    if (fs.existsSync(configPath)) {
        const file = fs.readFileSync(configPath, 'utf8'); // 读取配置文件内容
        const configs = YAML.parse(file); // 解析 YAML 文件
        config = configs.pluginSettings; // 获取插件设置
    }

    const url = config?.CursorUrl; // 从配置中获取 Cursor API 的 URL
    const keys = config?.WorkosCursorSessionToken || []; // 从配置中获取 Cursor API 的密钥数组，如果不存在则使用空数组
    const data = { model, messages, stream: false }; // 构造请求体

    console.log(keys, url)
    // 检查 URL 和密钥是否存在，如果不存在则记录警告并返回 null
    if (!url || keys.length === 0) {
        console.warn("Cursor URL 或密钥未在配置中找到。");
        return null; // 缺少关键配置，无法继续
    }

    // 循环遍历密钥数组，尝试使用每个密钥发起请求
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]; // 获取当前密钥
        try {
            // 发起 HTTP POST 请求
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // 设置 Content-Type 为 application/json
                    'Authorization': 'Bearer ' + key // 设置 Authorization 头部，使用当前密钥
                },
                body: JSON.stringify(data), // 将请求体转换为 JSON 字符串
            });

            // 检查请求是否成功
            if (response.ok) {
                const res = await response.json(); // 解析 JSON 响应
                const output = res.choices[0]?.message?.content; // 安全地访问响应内容
                if (output) {
                    return output.trim(); // 返回去除空格后的输出
                } else {
                    console.warn(`密钥索引 ${i} 的响应中未找到内容。`);
                    // 可选：继续尝试下一个密钥或直接返回 null。
                }
            } else {
                // 处理非 200 状态码的响应
                console.warn(`密钥索引 ${i} 的请求失败，状态码为 ${response.status}。`);

                // 如果状态码在 400 到 500 之间，则认为是密钥相关错误，尝试下一个密钥
                if (response.status >= 400 && response.status < 500) {
                    console.log(`尝试下一个密钥（索引 ${i + 1}）。`);
                    continue; // 尝试下一个密钥
                } else {
                    console.error(`密钥索引 ${i} 遇到不可重试的错误（状态码 ${response.status}）。`);
                    return null; // 如果不是密钥相关错误，则不重试，直接返回 null
                }
            }
        } catch (error) {
            // 捕获请求过程中发生的错误
            console.error(`密钥索引 ${i} 的请求期间发生错误：`, error);

            // 如果是网络连接错误（ECONNREFUSED 或 ETIMEDOUT），则认为是临时性错误，尝试下一个密钥
            if (error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT')) {
                console.log(`网络错误，尝试下一个密钥（索引 ${i + 1}）。`);
                continue; // 尝试下一个密钥
            } else {
                // 如果不是网络错误，则不重试，直接返回 null
                return null;
            }
        }
    }

    console.error("所有密钥均失败。");
    return null; // 所有密钥都尝试失败
};