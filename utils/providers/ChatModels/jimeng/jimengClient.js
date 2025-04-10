import { createCompletion } from './jimeng.js';
import path from 'path';
import YAML from 'yaml';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function jimengClient(messages, model, type = 'image') {
    const configPath = path.join(__dirname, '../../../../config/message.yaml');
    console.log(configPath)
    let config = {};
    if (fs.existsSync(configPath)) {
        const file = fs.readFileSync(configPath, 'utf8');
        const configs = YAML.parse(file);
        config = configs.pluginSettings;
    }
    const sessionId = config?.jimengsessionid || '';
    const width = config?.jimengSize_width || 1024;
    const height = config?.jimengSize_height || 1024;
    try {
        const result = await createCompletion(messages, sessionId, model, type, {
            width: width,
            height: height
        });
        console.log(result);
        return result;
    } catch (err) {
        console.error(err);
        return "生成失败，请确保填写了正确的即梦sessionId, 并且未过期或超出当日配额";
    }
}