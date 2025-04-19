import { Yuanbao } from './Yuanbao.js';
import path from 'path';
import fs from 'fs';
import YAML from 'yaml';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 将消息数组处理为格式化的对话历史记录和当前消息的字符串
 * @param {Array} messages - 消息数组
 * @returns {String} - 格式化后的最终字符串
 */
function processMessages(messages) {
    if (!Array.isArray(messages) || messages.length === 0) {
        return "无消息记录";
    }
    const historyMessages = messages.slice(0, -1);
    const currentMessage = messages[messages.length - 1];
    const historyPart = historyMessages.length > 0
        ? historyMessages
            .map((msg, index) => {
                const roleDisplay = msg.role === 'user' ? '用户' : '助手';
                return `[历史对话 ${index + 1}] ${roleDisplay}: ${msg.content.trim()}`;
            })
            .join('\n\n')
        : "无历史对话记录";
    const roleDisplay = currentMessage.role === 'user' ? '用户' : '助手';
    const currentPart = `[当前消息] ${roleDisplay}: ${currentMessage.content.trim()}`;
    return `${historyPart}\n\n${'-'.repeat(30)}\n\n${currentPart}`;
}


export async function YuanbaoCompletion(messages, model) {
    try {
        const configPath = path.join(__dirname, '../../../../config/message.yaml');
        console.log(configPath)
        let config = {};

        if (fs.existsSync(configPath)) {
            const file = fs.readFileSync(configPath, 'utf8');
            const configs = YAML.parse(file);
            config = configs.pluginSettings;
        }

        const cookielist = config?.YuanbaoCK || [];
        const cookie = cookielist[Math.floor(Math.random() * cookielist.length)];
        const YuanbaoModel = config?.YuanbaoModel || 'deep_seek';
        const YuanbaoSearch = config?.YuanbaoDeepSearch || true;
        const client = new Yuanbao({
            prompt: processMessages(messages),
            model: model || YuanbaoModel,
            search: YuanbaoSearch,
            ck: cookie
        });
        const result = await client.makeRequest();
        console.log('回答:', result);
        return result?.output;
    } catch (error) {
        console.error('错误:', error.message);
        return null;
    }
}