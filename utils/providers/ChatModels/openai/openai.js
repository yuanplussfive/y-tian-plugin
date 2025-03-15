import fetch from 'node-fetch';
import YAML from 'yaml';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const openai = async (messages, model) => {
    const configPath = path.join(__dirname, '../../../../config/message.yaml');
    console.log(configPath)
    let config = {}; // 初始化配置对象

    // 检查配置文件是否存在，如果存在则读取并解析
    if (fs.existsSync(configPath)) {
        const file = fs.readFileSync(configPath, 'utf8');
        const configs = YAML.parse(file);
        config = configs.pluginSettings;
    }

    const url = config?.OpenAiProxy;
    const Authorization = config?.OpenAiAuthToken;
    const data = { model, messages, stream: false };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + Authorization
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const res = await response.text();
            console.log(res);
            return null;
        }

        const res = await response.json(); // 解析 JSON 响应
        const output = res.choices[0]?.message?.content; // 安全地访问响应内容
        return output?.trim(); // 返回去除空格后的输出

    } catch (error) {
        console.log(error);
        return null;
    }
};