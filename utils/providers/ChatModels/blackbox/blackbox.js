import fetch from 'node-fetch';
import { cleanArray } from '../../../../utils/requests/cleanArray.js';
import { mergeConsecutiveUserMessages } from '../../../../utils/requests/mergeConsecutiveUserMessages.js';
import { blackboxapi } from './blackboxapi.js';
import crypto from 'crypto';
import puppeteer from 'puppeteer';

/**
 * @class BlackboxAI
 * @classdesc 封装了与 Blackbox AI 交互的逻辑，包括会话管理、请求构建和响应处理。
 */
class BlackboxAI {
    /**
     * @constructor
     * @property {string} defaultValidatedToken - 默认的 validated token，用于在获取失败时使用。
     * @property {object} validatedTokenStorage - 用于存储和管理 validated token 的对象。
     * @property {object} cachedSessionData - 缓存的会话数据，包含 sessionId, validated, otherCookies, userAgent, secChUa 等。
     * @property {number} sessionIdExpiry - sessionId 的过期时间戳。
     * @property {number} validatedExpiry - validated 的过期时间戳。
     * @property {number} otherCookiesExpiry - otherCookies 的过期时间戳。
     */
    constructor() {
        this.defaultValidatedToken = Buffer.from("MDBmMzdiMzQtYTE2Ni00ZWZiLWJjZTUtMTMxMmQ4N2YyZjk0", "base64").toString("utf-8");
        this.validatedTokenStorage = {
            _validatedToken: this.defaultValidatedToken,
            read: async () => this._validatedToken,
            write: async (token) => { this._validatedToken = token; }
        };
        this.cachedSessionData = {
            sessionId: null,
            validated: null,
            otherCookies: null,
            userAgent: null,
            secChUa: null,
            secChUaMobile: null,
            secChUaPlatform: null
        };
        this.sessionIdExpiry = null;
        this.validatedExpiry = null;
        this.otherCookiesExpiry = null;
    }

    /**
     * @async
     * @method fetchNewSessionData
     * @description 使用 Puppeteer 获取新的 sessionId 和 validated 值，如果失败则使用默认值。
     * @returns {Promise<object>} 包含 sessionId, validated, otherCookies, userAgent, secChUa 等会话数据的对象。
     */
    async fetchNewSessionData() {
        const HALF_HOUR = 30 * 60 * 1000; // 半小时的毫秒数
        const ONE_HOUR = 60 * 60 * 1000;  // 一小时的毫秒数
        let browser;
        let validated = null;
        let sessionId = null;
        let otherCookies = {};
        let userAgent = '';
        let secChUa = '';
        let secChUaMobile = '';
        let secChUaPlatform = '';

        try {
            browser = await puppeteer.launch({
                headless: "new",
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
            const page = await browser.newPage();

            page.on('response', async (response) => {
                try {
                    const url = response.url();
                    if (url.includes('/_next/static/chunks/') && url.endsWith('.js')) {
                        const text = await response.text();
                        const match = text.match(/w\s*=\s*"([a-f0-9\-]{36})"/i);
                        if (match && match[1]) {
                            validated = match[1];
                        }
                    }
                } catch (error) {
                    console.warn('解析 JS 文件时出错:', error.message);
                }
            });

            await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0");
            await page.setViewport({ width: 1280, height: 800 });
            await page.goto('https://www.blackbox.ai/', {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            // 获取 User-Agent 和 sec-ch-ua
            userAgent = await page.evaluate(() => navigator.userAgent);
            secChUa = await page.evaluate(() => navigator.userAgentData.brands.map(brand => `"${brand.brand}";v="${brand.version}"`).join(', '));
            secChUaMobile = await page.evaluate(() => navigator.userAgentData.mobile ? '?1' : '?0');
            secChUaPlatform = await page.evaluate(() => `"${navigator.userAgentData.platform}"`);

            // 等待页面完全加载，确保所有 Cookie 都被设置
            await page.waitForTimeout(10000); // 等待 10 秒

            const cookies = await page.cookies();
            console.log("All Cookies:", cookies); // 打印所有 cookies

            const sessionIdCookie = cookies.find(cookie => cookie.name.toLowerCase() === 'sessionid');

            if (sessionIdCookie && sessionIdCookie.value) {
                sessionId = sessionIdCookie.value;
                const expires = sessionIdCookie.expires;
                const expiryTime = expires === -1 ? Date.now() + ONE_HOUR : expires * 1000;
                this.sessionIdExpiry = expiryTime;
            } else {
                // sessionId 获取失败，设置半小时过期时间
                this.sessionIdExpiry = Date.now() + HALF_HOUR;
                sessionId = this.defaultValidatedToken;
            }

            if (validated) {
                this.validatedExpiry = Date.now() + ONE_HOUR;
            } else {
                // validated 获取失败，设置半小时过期时间
                this.validatedExpiry = Date.now() + HALF_HOUR;
                validated = this.defaultValidatedToken;
            }

            // 获取其他 Cookie
            const otherCookieNames = ['render_session_affinity', '__Host-authjs.csrf-token', '__Secure-authjs.callback-url'];
            otherCookies = cookies.filter(cookie => otherCookieNames.includes(cookie.name) || cookie.name.startsWith('intercom-')).reduce((acc, cookie) => {
                acc[cookie.name] = cookie.value;
                return acc;
            }, {});
            this.otherCookiesExpiry = Date.now() + ONE_HOUR;

            this.cachedSessionData = {
                sessionId: sessionId,
                validated: validated,
                otherCookies: otherCookies,
                userAgent: userAgent,
                secChUa: secChUa,
                secChUaMobile: secChUaMobile,
                secChUaPlatform: secChUaPlatform
            };

            return this.cachedSessionData;

        } catch (error) {
            console.error('获取 sessionId 和 validated 失败:', error.message);
            // 完全失败的情况下，都设置半小时过期时间
            this.sessionIdExpiry = Date.now() + HALF_HOUR;
            this.validatedExpiry = Date.now() + HALF_HOUR;
            this.otherCookiesExpiry = Date.now() + HALF_HOUR;
            validated = this.defaultValidatedToken;
            sessionId = this.defaultValidatedToken;
            this.cachedSessionData = {
                sessionId: sessionId,
                validated: validated,
                otherCookies: {},
                userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0",
                secChUa: '"Not A(Brand";v="8", "Chromium";v="132", "Microsoft Edge";v="132"',
                secChUaMobile: '?0',
                secChUaPlatform: '"Windows"'
            };

            return this.cachedSessionData;
        } finally {
            if (browser) {
                try {
                    await browser.close();
                } catch (err) {
                    console.error("关闭浏览器失败:", err.message);
                }
            }
        }
    }

    /**
     * @async
     * @method getSessionData
     * @description 获取当前有效的会话数据，如果缓存的会话数据已过期，则获取新的会话数据。
     * @returns {Promise<object>} 包含 sessionId, validated, otherCookies, userAgent, secChUa 等会话数据的对象。
     */
    async getSessionData() {
        const now = Date.now();
        if (
            this.cachedSessionData.sessionId && this.sessionIdExpiry && now < this.sessionIdExpiry &&
            this.cachedSessionData.validated && this.validatedExpiry && now < this.validatedExpiry &&
            this.cachedSessionData.otherCookies && this.otherCookiesExpiry && now < this.otherCookiesExpiry
        ) {
            return this.cachedSessionData;
        }

        return await this.fetchNewSessionData();
    }

    /**
     * @method generateUUID
     * @description 生成 UUID。
     * @returns {string} 生成的 UUID。
     */
    generateUUID() {
        return crypto.randomUUID();
    }

    /**
     * @async
     * @method selfCorrectValidatedToken
     * @description 校验 validatedToken，如果不符合规则则返回默认的 validatedToken。
     * @param {string} token - 要校验的 validatedToken。
     * @returns {Promise<string>} 校验后的 validatedToken。
     */
    async selfCorrectValidatedToken(token) {
        if (!token) {
            return this.defaultValidatedToken;
        }

        const ok = (() => {
            if (Math.abs(token.length - this.defaultValidatedToken.length) > 5) {
                return false;
            }
            if (Math.abs(token.split("-").length - this.defaultValidatedToken.split("-").length) > 1) {
                return false;
            }
            if (!/^[a-zA-Z0-9-]+$/.test(token)) {
                return false;
            }
            return true;
        })();

        if (!ok) {
            return this.defaultValidatedToken;
        }
        return token;
    }

    /**
     * @async
     * @method chat
     * @description 与 Blackbox AI 聊天，发送消息并获取 AI 响应。
     * @param {Array<object>} messages - 消息数组，每个消息包含 role 和 content 属性。
     * @param {string} model - AI 模型类型。
     * @returns {Promise<string|null>} AI 响应或 null。
     */
    async chat(messages, model) {
        let sessionData;
        try {
            sessionData = await this.getSessionData();
            console.log('获取到的 sessionId 值:', sessionData.sessionId);
            console.log('获取到的 validated 值:', sessionData.validated);
            console.log('获取到的其他 Cookie 值:', sessionData.otherCookies);
        } catch (error) {
            console.error('获取 sessionId 或 validated 值失败:', error.message);
            return null;
        }

        // 获取 validatedToken，并进行校验
        let validatedToken = await this.validatedTokenStorage.read();
        // 在调用 selfCorrectValidatedToken 之前检查 validatedToken 是否存在
        validatedToken = validatedToken ? await this.selfCorrectValidatedToken(validatedToken) : this.defaultValidatedToken;

        const intercomId = this.generateUUID();
        const intercomDeviceId = this.generateUUID();

        const headers = {
            "User-Agent": sessionData.userAgent,
            "Accept": "*/*",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "Referer": "https://www.blackbox.ai/",
            "Content-Type": "application/json",
            "Origin": "https://www.blackbox.ai",
            "Connection": "keep-alive",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "Pragma": "no-cache",
            "Cache-Control": "no-cache",
            "sec-ch-ua": sessionData.secChUa,
            "sec-ch-ua-mobile": sessionData.secChUaMobile,
            "sec-ch-ua-platform": sessionData.secChUaPlatform,
            'cookie': `sessionId=${sessionData.sessionId}; ${Object.entries(sessionData.otherCookies).map(([key, value]) => `${key}=${value}`).join('; ')};`
        };

        console.log(headers)
        const modelConfigs = {
            "gpt-4o": {
                maxTokens: 4096,
                model: "gpt-4o",
                temperature: 0.7,
                name: "GPT-4o" // 添加模型名称
            },
            "claude-3.5-sonnet": {
                maxTokens: 8192,
                model: "claude-sonnet-3.5",
                temperature: 0.8,
                name: "Claude-Sonnet-3.5" // 添加模型名称
            },
            "gemini-pro": {
                maxTokens: 8192,
                model: "gemini-pro",
                temperature: 0.9,
                name: "Gemini-Pro" // 添加模型名称
            },
            "llama-3.1-405b": {
                mode: true,
                id: "llama-3.1-405b",
                maxTokens: 12000,
                name: "Llama-3.1-405b" // 添加模型名称
            },
            "llama-3.1-70b": {
                mode: true,
                id: "llama-3.1-70b",
                maxTokens: 10000,
                name: "Llama-3.1-70b" // 添加模型名称
            },
            "gemini-1.5-flash": {
                mode: true,
                id: "Gemini",
                maxTokens: 16000,
                name: "Gemini-1.5-Flash" // 添加模型名称
            },
            "llama-3.3-70B": {
                mode: true,
                id: "Gemini",
                maxTokens: 16000,
                name: "Meta-Llama-3.3-70B-Instruct-Turbo" // 添加模型名称
            },
            "mistral-7b": {
                mode: true,
                id: "Gemini",
                maxTokens: 16000,
                name: "Mistral-(7B)-Instruct-v0.2" // 添加模型名称
            }
        };

        if (!modelConfigs[model]) {
            throw new Error(`不支持的模型类型: ${model}`);
        }

        /**
         * 处理消息数组，添加随机 ID 和创建时间，并在 user 消息中添加 @模型名称
         * @param {Array} messages - 消息数组
         * @param {string} modelName - 模型名称
         * @returns {Array} 处理后的消息数组，不修改原数组
         */
        const processMessages = (messages, modelName) => {
            return messages.map(msg => {
                const processedMsg = {
                    ...JSON.parse(JSON.stringify(msg)),
                    id: crypto.randomBytes(4).toString("hex").slice(0, 7),
                    ...(msg.role === 'assistant' && { createdAt: new Date().toISOString() })
                };

                if (msg.role === 'user') {
                    processedMsg.content = `@${modelName} ${msg.content}`;
                }

                return processedMsg;
            });
        };

        const results = await cleanArray(messages);
        const finalresults = await mergeConsecutiveUserMessages(results);
        const processedMessages = processMessages(finalresults, modelConfigs[model].name);

        const requestData = {
            messages: processedMessages.map(msg => ({
                ...msg,
                id: crypto.randomBytes(4).toString("hex").slice(0, 7)
            })),
            id: crypto.randomBytes(4).toString("hex").slice(0, 7),
            userId: null,
            codeModelMode: true,
            agentMode: modelConfigs[model]?.mode ? {
                mode: true,
                id: modelConfigs[model]?.id,
                name: modelConfigs[model]?.name // 修改这里，使用 modelConfigs[model].name
            } : {},
            trendingAgentMode: {},
            userSelectedModel: modelConfigs[model]?.model,
            webSearchMode: false,
            maxTokens: modelConfigs[model]?.maxTokens || 1024,
            playgroundTemperature: null,
            playgroundTopP: null,
            validated: validatedToken,
            previewToken: null,
            isMicMode: false,
            userSystemPrompt: null,
            isChromeExt: false,
            githubToken: null,
            clickedAnswer2: false,
            clickedAnswer3: false,
            clickedForceWebSearch: false,
            visitFromDelta: false,
            mobileClient: false,
            isMemoryEnabled: false,
            vscodeClient: false,
            customProfile: {
                name: "",
                occupation: "",
                traits: [],
                additionalInfo: "",
                enableNewChats: false
            }
        };

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 90000); // 90秒超时
            const response = await fetch("https://api.blackbox.ai/api/chat", {
                method: "POST",
                headers,
                body: JSON.stringify(requestData),
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!response.ok) {
                console.error(`请求失败，状态码: ${response.status}`);
                return null;
            }

            const text = await response.text();
            return text;

        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('请求超时');
            } else {
                console.error('请求失败:', error.message);
            }
            return null;
        }
    }
}

export async function blackbox(messages, model) {
    try {
        const modelMap = {
            'deepseek-v3': 'deepseek-ai/DeepSeek-V3',
            'deepseek-r1': 'deepseek-ai/DeepSeek-R1',
            'QwQ-32B-Preview': 'Qwen/QwQ-32B-Preview',
            'mixtral-8x7b': 'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO'
        };

        const mappedModel = modelMap[model];
        if (mappedModel) {
            return await blackboxapi(messages, model);
        }
        const blackboxAiInstance = new BlackboxAI();
        const response = await blackboxAiInstance.chat(messages, model);
        return response?.trim();
    } catch (error) {
        console.error('发生错误:', error);
    }
}