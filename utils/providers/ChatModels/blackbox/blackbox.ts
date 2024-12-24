import { cleanArray } from '../../../requests/cleanArray';
import { mergeConsecutiveUserMessages } from '../../../requests/mergeConsecutiveUserMessages';
import fetch from 'node-fetch';
import crypto from 'crypto';
import puppeteer, { Browser } from 'puppeteer';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    id?: string;
    createdAt?: string;
}

interface SessionData {
    sessionId: string;
    validated: string;
}

interface ModelConfig {
    maxTokens: number;
    model?: string;
    temperature?: number;
    mode?: boolean;
    id?: string;
}

interface RequestData {
    messages: Message[];
    id: string;
    userId: null;
    codeModelMode: boolean;
    agentMode: Record<string, never>;
    trendingAgentMode: Record<string, never>;
    userSelectedModel?: string;
    webSearchMode: boolean;
    maxTokens: number;
    playgroundTemperature: number;
    playgroundTopP: number;
    validated: string;
    stream: boolean;
    previewToken: null;
    isMicMode: boolean;
    userSystemPrompt: null;
    isChromeExt: boolean;
    githubToken: null;
    clickedAnswer2: boolean;
    clickedAnswer3: boolean;
    clickedForceWebSearch: boolean;
    visitFromDelta: boolean;
    mobileClient: boolean;
}

type SupportedModel = 'gpt-4o' | 'claude-3.5-sonnet' | 'gemini-pro' | 'llama-3.1-405b' | 'llama-3.1-70b' | 'gemini-1.5-flash';

let cachedSessionId: string | null = null;
let sessionIdExpiry: number | null = null;
let cachedValidated: string | null = null;
let validatedExpiry: number | null = null;

/**
 * 使用 Puppeteer 获取新的 sessionId 和 validated 值
 */
async function fetchNewSessionIdAndValidated(): Promise<SessionData> {
    const defaultValidatedToken = Buffer.from("MDBmMzdiMzQtYTE2Ni00ZWZiLWJjZTUtMTMxMmQ4N2YyZjk0", "base64").toString("utf-8");
    const HALF_HOUR = 30 * 60 * 1000;
    const ONE_HOUR = 60 * 60 * 1000;
    let browser: Browser | undefined;

    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        let validated: string | null = null;
        let sessionId: string | null = null;

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
                console.warn('解析 JS 文件时出错:', error);
            }
        });

        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0");
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto('https://www.blackbox.ai/', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        const cookies = await page.cookies();
        const sessionIdCookie = cookies.find(cookie => cookie.name.toLowerCase() === 'sessionid');

        if (sessionIdCookie && sessionIdCookie.value) {
            sessionId = sessionIdCookie.value;
            const expires = sessionIdCookie.expires;
            const expiryTime = expires === -1 ? Date.now() + ONE_HOUR : expires * 1000;
            sessionIdExpiry = expiryTime;
        } else {
            sessionIdExpiry = Date.now() + HALF_HOUR;
            sessionId = defaultValidatedToken;
        }

        await page.waitForTimeout(5000);

        if (validated) {
            validatedExpiry = Date.now() + ONE_HOUR;
        } else {
            validatedExpiry = Date.now() + HALF_HOUR;
            validated = defaultValidatedToken;
        }
        
        cachedValidated = validated;
        cachedSessionId = sessionId;

        return {
            sessionId: sessionId,
            validated: validated
        };

    } catch (error) {
        console.error('获取 sessionId 和 validated 失败:', error);
        sessionIdExpiry = Date.now() + HALF_HOUR;
        validatedExpiry = Date.now() + HALF_HOUR;
        const validated = defaultValidatedToken;
        const sessionId = defaultValidatedToken;
        cachedValidated = validated;
        cachedSessionId = sessionId;
        
        return {
            sessionId,
            validated
        };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

/**
 * 获取当前有效的 sessionId 和 validated 值
 */
async function getSessionIdAndValidated(): Promise<SessionData> {
    const now = Date.now();
    if (
        cachedSessionId && sessionIdExpiry && now < sessionIdExpiry &&
        cachedValidated && validatedExpiry && now < validatedExpiry
    ) {
        return { sessionId: cachedSessionId, validated: cachedValidated };
    }

    return await fetchNewSessionIdAndValidated();
}

/**
 * 增强版黑盒AI聊天函数
 */
export async function blackboxAiChat(messages: Message[], model: SupportedModel): Promise<string | null> {
    const modelConfigs: Record<SupportedModel, ModelConfig> = {
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

    const processMessages = (messages: Message[]): Message[] => {
        return messages.map(msg => ({
            ...msg,
            id: crypto.randomBytes(4).toString("hex").slice(0, 7),
            ...(msg.role === 'assistant' && { createdAt: new Date().toISOString() })
        }));
    };

    try {
        const sessionData = await getSessionIdAndValidated();
        console.log('获取到的 sessionId 值:', sessionData.sessionId);
        console.log('获取到的 validated 值:', sessionData.validated);

        const results = await cleanArray(messages);
        const finalResults = await mergeConsecutiveUserMessages(results);
        const processedMessages = processMessages(finalResults);

        const requestData: RequestData = {
            messages: processedMessages,
            id: crypto.randomBytes(4).toString("hex").slice(0, 7),
            userId: null,
            codeModelMode: true,
            agentMode: {},
            trendingAgentMode: {},
            userSelectedModel: modelConfigs[model]?.model,
            webSearchMode: false,
            maxTokens: modelConfigs[model]?.maxTokens || 1024,
            playgroundTemperature: 0.5,
            playgroundTopP: 0.9,
            validated: sessionData.validated,
            stream: true,
            previewToken: null,
            isMicMode: false,
            userSystemPrompt: null,
            isChromeExt: false,
            githubToken: null,
            clickedAnswer2: false,
            clickedAnswer3: false,
            clickedForceWebSearch: false,
            visitFromDelta: false,
            mobileClient: false
        };

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 90000);

        const response = await fetch("https://www.blackbox.ai/api/chat", {
            method: "POST",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0",
                "Accept": "text/event-stream",
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
                'cookie': `sessionId=${sessionData.sessionId};`
            },
            body: JSON.stringify(requestData),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.text();

    } catch (error) {
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                console.error('请求超时');
            } else {
                console.error('请求失败:', error.message);
            }
        }
        return null;
    }
}