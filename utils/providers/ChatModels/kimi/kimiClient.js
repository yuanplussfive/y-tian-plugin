import kimiAPI from './kimi.js';
import path from 'path';
import fs from 'fs';
import YAML from 'yaml';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function KimiCompletion(messages, model) {
    try {
        const configPath = path.join(__dirname, '../../../../config/message.yaml');
        console.log(configPath)
        let config = {};

        if (fs.existsSync(configPath)) {
            const file = fs.readFileSync(configPath, 'utf8');
            const configs = YAML.parse(file);
            config = configs.pluginSettings;
        }

        const refreshTokens = config?.KimtRefreshTokens || [];
        const KimiModel = config?.KimiModel || 'kimi';
        const refreshToken = refreshTokens[Math.floor(Math.random() * refreshTokens.length)];
        const response = await kimiAPI.createCompletion({
            model: KimiModel,
            messages,
            refreshToken,
            skipPreN2s: true
        });
        console.log('回答:', response.choices[0].message.content);
        return response.choices[0].message.content;
    } catch (error) {
        console.error('错误:', error.message);
        return null;
    }
}