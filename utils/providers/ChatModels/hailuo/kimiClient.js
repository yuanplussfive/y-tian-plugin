import kimiAPI from './kimi.js';
import path from 'path';
import fs from 'fs';
import YAML from 'yaml';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function KimiCompletion(messages, refreshToken, refConvId) {
    try {
        const configPath = path.join(__dirname, '../../../../config/message.yaml');
        console.log(configPath)
        let config = {};

        if (fs.existsSync(configPath)) {
            const file = fs.readFileSync(configPath, 'utf8');
            const configs = YAML.parse(file);
            config = configs.pluginSettings;
        }

        const refreshTokens = config?.KimiRefreshTokens || [];
        const RefreshToken = refreshToken || refreshTokens[Math.floor(Math.random() * refreshTokens.length)];
        const KimiModel = config?.KimiModel || 'kimi';
        if (!refConvId) {
            const conversationName = "11451411";
            refConvId = await kimiAPI.createConversation(KimiModel, conversationName, RefreshToken);
        }
        const response = await kimiAPI.createCompletion({
            model: KimiModel,
            messages,
            refreshToken: RefreshToken,
            refConvId: refConvId,
            skipPreN2s: true
        });
        console.log('回答:', response.choices[0].message.content);
        return {
            output: response.choices[0].message.content,
            refreshToken: RefreshToken,
            convId: refConvId
        };
    } catch (error) {
        console.error('错误:', error.message);
        return {
            output: null,
            refreshToken: null,
            convId: null
        };
    }
}