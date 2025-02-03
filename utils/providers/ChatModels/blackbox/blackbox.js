import fetch from 'node-fetch';
import { cleanArray } from '../../../../utils/requests/cleanArray.js';
import { mergeConsecutiveUserMessages } from '../../../../utils/requests/mergeConsecutiveUserMessages.js';
import crypto from 'crypto';
import puppeteer from 'puppeteer';

// 缓存 sessionId 及其过期时间
let cachedSessionId = null;
let sessionIdExpiry = null;

// 缓存 validated 及其过期时间
let cachedValidated = null;
let validatedExpiry = null;

// 缓存其他 Cookie
let cachedOtherCookies = null;
let otherCookiesExpiry = null;

// 缓存 UserAgent 相关信息
let cachedUserAgent = null;
let cachedSecChUa = null;
let cachedSecChUaMobile = null;
let cachedSecChUaPlatform = null;

// 默认 validatedToken
const defaultValidatedToken = Buffer.from("MDBmMzdiMzQtYTE2Ni00ZWZiLWJjZTUtMTMxMmQ4N2YyZjk0", "base64").toString("utf-8");

// 用于存储 validatedToken
const validatedTokenStorage = {
    _validatedToken: defaultValidatedToken,
    async read() {
        return this._validatedToken;
    },
    async write(token) {
        this._validatedToken = token;
    }
};

/**
 * 使用 Puppeteer 获取新的 sessionId 和 validated 值，失败时使用默认值
 * @returns {Promise<{ sessionId: string, validated: string }>} sessionId 和 validated 值
 */
async function fetchNewSessionIdAndValidated() {
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
                //console.warn('解析 JS 文件时出错:', error.message);
            }
        });

        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0");
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto('https://www.blackbox.ai/', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
    
        await page.waitForTimeout(10000); // 等待 10 秒
        

        // 获取 User-Agent 和 sec-ch-ua
        userAgent = await page.evaluate(() => navigator.userAgent);
        secChUa = await page.evaluate(() => navigator.userAgentData.brands.map(brand => `"${brand.brand}";v="${brand.version}"`).join(', '));
        secChUaMobile = await page.evaluate(() => navigator.userAgentData.mobile ? '?1' : '?0');
        secChUaPlatform = await page.evaluate(() => `"${navigator.userAgentData.platform}"`);


        // 等待一段时间，确保所有 Cookie 都被设置
        await page.waitForTimeout(5000);

        const cookies = await page.cookies();
        //console.log("All Cookies:", cookies); // 打印所有 cookies

        const sessionIdCookie = cookies.find(cookie => cookie.name.toLowerCase() === 'sessionid');

        if (sessionIdCookie && sessionIdCookie.value) {
            sessionId = sessionIdCookie.value;
            const expires = sessionIdCookie.expires;
            const expiryTime = expires === -1 ? Date.now() + ONE_HOUR : expires * 1000;
            sessionIdExpiry = expiryTime;
        } else {
            // sessionId 获取失败，设置半小时过期时间
            sessionIdExpiry = Date.now() + HALF_HOUR;
            sessionId = defaultValidatedToken;
        }

        await page.waitForTimeout(5000);

        if (validated) {
            validatedExpiry = Date.now() + ONE_HOUR;
        } else {
            // validated 获取失败，设置半小时过期时间
            validatedExpiry = Date.now() + HALF_HOUR;
            validated = defaultValidatedToken;
        }

        // 获取其他 Cookie
        const otherCookieNames = ['render_session_affinity', '__Host-authjs.csrf-token', '__Secure-authjs.callback-url'];
        otherCookies = cookies.filter(cookie => otherCookieNames.includes(cookie.name) || cookie.name.startsWith('intercom-')).reduce((acc, cookie) => {
            acc[cookie.name] = cookie.value;
            return acc;
        }, {});
        otherCookiesExpiry = Date.now() + ONE_HOUR;

        cachedValidated = validated;
        cachedSessionId = sessionId;
        cachedOtherCookies = otherCookies;
        cachedUserAgent = userAgent;
        cachedSecChUa = secChUa;
        cachedSecChUaMobile = secChUaMobile;
        cachedSecChUaPlatform = secChUaPlatform;

        return {
            sessionId: sessionId,
            validated: validated,
            otherCookies: otherCookies,
            userAgent: userAgent,
            secChUa: secChUa,
            secChUaMobile: secChUaMobile,
            secChUaPlatform: secChUaPlatform
        };

    } catch (error) {
        //console.error('获取 sessionId 和 validated 失败:', error.message);
        // 完全失败的情况下，都设置半小时过期时间
        sessionIdExpiry = Date.now() + HALF_HOUR;
        validatedExpiry = Date.now() + HALF_HOUR;
        otherCookiesExpiry = Date.now() + HALF_HOUR;
        validated = defaultValidatedToken;
        sessionId = defaultValidatedToken;
        cachedValidated = validated;
        cachedSessionId = sessionId;
        cachedOtherCookies = {};
        cachedUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0";
        cachedSecChUa = '"Not A(Brand";v="8", "Chromium";v="132", "Microsoft Edge";v="132"';
        cachedSecChUaMobile = '?0';
        cachedSecChUaPlatform = '"Windows"';


        return {
            sessionId: sessionId,
            validated: validated,
            otherCookies: {},
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0",
            secChUa: '"Not A(Brand";v="8", "Chromium";v="132", "Microsoft Edge";v="132"',
            secChUaMobile: '?0',
            secChUaPlatform: '"Windows"'
        };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

/**
 * 获取当前有效的 sessionId 和 validated 值
 * @returns {Promise<{ sessionId: string, validated: string }>} 有效的 sessionId 和 validated 值
 */
async function getSessionIdAndValidated() {
    const now = Date.now();
    if (
        cachedSessionId && sessionIdExpiry && now < sessionIdExpiry &&
        cachedValidated && validatedExpiry && now < validatedExpiry &&
        cachedOtherCookies && otherCookiesExpiry && now < otherCookiesExpiry
    ) {
        return { sessionId: cachedSessionId, validated: cachedValidated, otherCookies: cachedOtherCookies, userAgent: cachedUserAgent, secChUa: cachedSecChUa, secChUaMobile: cachedSecChUaMobile, secChUaPlatform: cachedSecChUaPlatform };
    }

    const sessionData = await fetchNewSessionIdAndValidated();
        cachedUserAgent = sessionData.userAgent;
        cachedSecChUa = sessionData.secChUa;
        cachedSecChUaMobile = sessionData.secChUaMobile;
        cachedSecChUaPlatform = sessionData.secChUaPlatform;
    return sessionData;
}

// 生成 UUID
function generateUUID() {
    return crypto.randomUUID();
}

// 校验 validatedToken
const selfCorrectValidatedToken = async (token) => {
    const ok = (() => {
        if (Math.abs(token.length - defaultValidatedToken.length) > 5) {
            return false;
        }
        // count hyphens
        if (Math.abs(token.split("-").length - defaultValidatedToken.split("-").length) > 1) {
            return false;
        }
        // there should be only alphanumeric characters and hyphens
        if (!/^[a-zA-Z0-9-]+$/.test(token)) {
            return false;
        }
        return true;
    })();

    if (!ok) {
        return defaultValidatedToken;
    }
    return token;
};

/**
 * 增强版黑盒AI聊天函数
 * @param {Array} messages - 消息数组
 * @param {string} model - AI模型类型
 * @returns {Promise<string|null>} 返回AI响应或null
 */
export const blackboxAi = async (messages, model) => {
    let sessionData;
    try {
        sessionData = await getSessionIdAndValidated();
        //console.log('获取到的 sessionId 值:', sessionData.sessionId);
        //console.log('获取到的 validated 值:', sessionData.validated);
        //console.log('获取到的其他 Cookie 值:', sessionData.otherCookies);
    } catch (error) {
        //console.error('获取 sessionId 或 validated 值失败:', error.message);
        return null;
    }

    // 获取 validatedToken，并进行校验
    let validatedToken = await validatedTokenStorage.read();
    validatedToken = await selfCorrectValidatedToken(validatedToken);

    const intercomId = generateUUID();
    const intercomDeviceId = generateUUID();

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

    //console.log(headers)
    const modelConfigs = {
        "gpt-4o": {
            maxTokens: 4096,
            model: "gpt-4o",
            temperature: 0.7
        },
        "claude-3.5-sonnet": {
            maxTokens: 8192,
            model: "claude-sonnet-3.5",
            temperature: 0.8
        },
        "gemini-pro": {
            maxTokens: 8192,
            model: "gemini-pro",
            temperature: 0.9
        },
        "llama-3.1-405b": {
            mode: true,
            id: "llama-3.1-405b",
            maxTokens: 12000
        },
        "llama-3.1-70b": {
            mode: true,
            id: "llama-3.1-70b",
            maxTokens: 10000
        },
        "gemini-1.5-flash": {
            mode: true,
            id: "Gemini",
            maxTokens: 16000
        }
    };

    if (!modelConfigs[model]) {
        throw new Error(`不支持的模型类型: ${model}`);
    }

    /**
     * 处理消息数组，添加随机 ID 和创建时间
     * @param {Array} messages - 消息数组
     * @returns {Array} 处理后的消息数组，不修改原数组
     */
    const processMessages = (messages) => {
        return messages.map(msg => ({
            ...JSON.parse(JSON.stringify(msg)),
            id: crypto.randomBytes(4).toString("hex").slice(0, 7),
            ...(msg.role === 'assistant' && { createdAt: new Date().toISOString() })
        }));
    };

    const results = await cleanArray(messages);
    const finalresults = await mergeConsecutiveUserMessages(results);
    const processedMessages = processMessages(finalresults);

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
            name: modelConfigs[model]?.id
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
            //console.error(`请求失败，状态码: ${response.status}`);
            return null;
        }

        const text = await response.text();
        return text;

    } catch (error) {
        if (error.name === 'AbortError') {
            //console.error('请求超时');
        } else {
            //console.error('请求失败:', error.message);
        }
        return null;
    }
}