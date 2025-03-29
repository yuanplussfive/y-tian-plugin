import GlmAPI from './chatglm.js';
import path from 'path';
import fs from 'fs';
import YAML from 'yaml';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function GlmCompletion(messages, refreshToken, refConvId) {
    try {
        const configPath = path.join(__dirname, '../../../../config/message.yaml');
        //console.log(configPath)
        let config = {};

        if (fs.existsSync(configPath)) {
            const file = fs.readFileSync(configPath, 'utf8');
            const configs = YAML.parse(file);
            config = configs.pluginSettings;
        }

        const refreshTokens = config?.GlmRefreshTokens || [];
        const RefreshToken = refreshToken || refreshTokens[Math.floor(Math.random() * refreshTokens.length)];
        const GlmModel = config?.GlmModel || 'glm-4-plus';
        if (!refConvId) {
            const result = await GlmAPI.createCompletion([
                { role: "user", content: "你好" },
            ], RefreshToken, GlmModel);
            refConvId = result?.id || null;
        }
        const response = await GlmAPI.createCompletion(
            messages,
            RefreshToken,
            GlmModel,
            refConvId
        );
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