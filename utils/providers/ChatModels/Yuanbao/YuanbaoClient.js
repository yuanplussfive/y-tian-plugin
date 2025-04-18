import { Yuanbao } from './Yuanbao.js';
import path from 'path';
import fs from 'fs';
import YAML from 'yaml';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function YuanbaoCompletion(messages, ck, refConvId) {
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
        const cookie = ck || cookielist[Math.floor(Math.random() * cookielist.length)];
        const YuanbaoModel = config?.YuanbaoModel || 'deep_seek';
        const YuanbaoSearch = config?.YuanbaoDeepSearch || true;
        const client = new Yuanbao({
            ...(refConvId && { uuid: refConvId }),
            prompt: messages[messages.length - 1].content,
            model: YuanbaoModel,
            search: YuanbaoSearch,
            ck: cookie
        });
        const result = await client.makeRequest();
        console.log('回答:', result);
        return result;
    } catch (error) {
        console.error('错误:', error.message);
        return {
            output: null,
            ck: null,
            convId: null
        };
    }
}