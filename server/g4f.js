import * as dotenv from 'dotenv';
dotenv.config()
import os from 'os';
import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import crypto from 'crypto';
import cors from '@koa/cors';
import { PassThrough } from 'stream';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { TotalTokens } from '../YTOpen-Ai/tools/CalculateToken.js';
import {
    NXModelResponse,
    getAllModelsWithProviders
} from "../utils/providers/ChooseModels.js";
import {
    NXDrawingModelResponse,
    getAllDrawingModelsWithProviders
} from "../utils/providers/DrawingModels.js";
import serve from 'koa-static';
import WebSocket from 'ws';
import { publicIpv4 } from 'public-ip';
import jwt from 'jsonwebtoken';

const app = new Koa();
const router = new Router();

// 获取当前文件所在目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 静态文件服务 (确保在所有路由之前)
app.use(serve(path.join(__dirname, 'public')));

// 配置中间件
app.use(bodyParser());
app.use(cors({
    origin: (ctx) => {
        // 允许所有来源
        return ctx.request.header.origin || '*';
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
    maxAge: 5,
    credentials: true,
    keepHeadersOnError: true
}));

// OpenAI API 配置
const DEFAULT_API_KEY = process.env.DEFAULT_API_KEY || 'sk-123456';
const OPENAI_API_BASE = process.env.OPENAI_API_BASE;
const ACCESS_KEY = process.env.ACCESS_KEY; // 从 .env 文件中读取访问密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Secret key for JWT

// 用户身份信息存储 (示例，实际应用中可以使用数据库)
//const userSessions = new Map(); // Remove the in-memory session store

// API 密钥验证中间件
async function validateApiKey(ctx, next) {
    const apiKey = ctx.get('authorization')?.replace('Bearer ', '') || DEFAULT_API_KEY;
    if (!apiKey.startsWith('sk-')) {
        ctx.status = 401;
        ctx.body = {
            error: '无效的API密钥',
            message: '请确保API密钥格式正确且以sk-开头'
        };
        return;
    }
    ctx.state.apiKey = apiKey;
    await next();
}

// 访问密钥验证中间件 (仅用于配置页面)
async function validateAccessKeyForConfigPage(ctx, next) {
    const token = ctx.cookies.get('access_token');

    if (!token) {
        console.log('No token found in cookies.');
        ctx.redirect('/login');
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        ctx.state.user = decoded; // Store user data in ctx.state
        await next();
    } catch (err) {
        console.error('JWT verification error:', err.message);
        // Clear the invalid token from the cookie
        ctx.cookies.set('access_token', null, { expires: new Date(0) });
        ctx.redirect('/login');
    }
}

// 读取配置文件的辅助函数
async function readConfigFile(filename) {
    const filePath = path.join(__dirname, '../../../data/', filename);

    try {
        const data = await fsPromises.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`读取配置文件 ${filename} 失败:`, error);
        return {}; // 如果读取失败，返回一个空对象
    }
}

// 保存配置文件的辅助函数
async function writeConfigFile(filename, data) {
    const filePath = path.join(__dirname, '../../../data/', filename);

    try {
        let existingData = {};
        if (fs.existsSync(filePath)) {
            // 读取文件内容
            const fileContent = await fsPromises.readFile(filePath, 'utf8');
            try {
                existingData = JSON.parse(fileContent);
            } catch (parseError) {
                console.warn(`解析配置文件 ${filename} 失败，可能文件为空或格式不正确，将覆盖:`, parseError);
                existingData = {}; // 覆盖文件
            }
        }

        // 合并数据
        const mergedData = { ...existingData, ...data };

        // 写入文件
        await fsPromises.writeFile(filePath, JSON.stringify(mergedData, null, 2), 'utf8');
    } catch (error) {
        console.error(`写入配置文件 ${filename} 失败:`, error);
        throw error; // 抛出错误，让路由处理函数捕获
    }
}

/**
 * 异步地获取所有可用模型列表（对话和绘图），并按类型分类、排序。
 *
 * @param {Object} ctx - Koa 的上下文对象。
 */
router.get('/v1/models', validateApiKey, async (ctx) => {
    try {
        // 1. 获取原始模型数据
        // 假设这两个函数返回 { "modelName": ["provider1", "provider2"], ... }
        const chatModelsObject = getAllModelsWithProviders();
        const drawingModelsObject = getAllDrawingModelsWithProviders();

        // 2. 转换并排序对话模型列表
        const chatModelList = Object.entries(chatModelsObject)
            .map(([modelName, providers]) => ({
                modelName,
                providers: providers.sort() // 对提供商列表也进行排序
            }))
            .sort((a, b) => a.modelName.localeCompare(b.modelName)); // 按模型名称字母排序

        // 3. 转换并排序绘图模型列表
        const drawingModelList = Object.entries(drawingModelsObject)
            .map(([modelName, providers]) => ({
                modelName,
                providers: providers.sort() // 对提供商列表也进行排序
            }))
            .sort((a, b) => a.modelName.localeCompare(b.modelName)); // 按模型名称字母排序

        // 4. 计算统计数据
        const totalChatModels = chatModelList.length;
        const totalDrawingModels = drawingModelList.length;
        const totalModels = totalChatModels + totalDrawingModels;

        // 收集所有唯一的提供商并排序
        const allProvidersSet = new Set();
        // 遍历对话模型和绘图模型的提供商
        [...Object.values(chatModelsObject), ...Object.values(drawingModelsObject)].forEach(providersArray => {
            providersArray.forEach(provider => allProvidersSet.add(provider));
        });
        const providerList = Array.from(allProvidersSet).sort(); // 转换为数组并按字母排序
        const totalProviders = providerList.length;

        // 5. 构建结构化的响应对象
        const response = {
            chatModels: chatModelList,
            drawingModels: drawingModelList,
            statistics: {
                totalChatModels,
                totalDrawingModels,
                totalModels,
                totalProviders,
                providerList // 包含所有唯一提供商的排序列表
            }
        };

        // 6. 设置响应体
        ctx.body = response;

    } catch (error) {
        console.error("Koa 路由: 获取模型列表失败:", error);
        ctx.status = 500; // 设置 HTTP 状态码为 500 Internal Server Error
        ctx.body = {
            error: "获取模型列表失败",
            details: error.message,
            stack: error.stack
        };
    }
});

/**
 * 从包含文本和链接的字符串中提取所有 URL，并格式化为 { url: "..." } 对象的数组。
 *
 * @param {string} textString - 包含潜在 URL 的字符串。
 * @returns {{data: Array<{url: string}>}} - 包含提取的 URL 对象的数组，包裹在 data 属性中。
 */
function extractLinks(textString) {
    const links = [];
    // 匹配 http 或 https 开头的 URL
    // 稍微改进正则表达式以更好地处理括号等字符
    const regex = /https?:\/\/[^\s()<>\[\]{}]+(?:\([^)]*\)|[^[:punct:]\s<>\[\]{}])/g;
    let match;
    while ((match = regex.exec(textString)) !== null) {
        links.push(match[0]); // match[0] 是整个匹配到的字符串
    }
    const formattedData = links.map(url => {
        return { "url": url };
    });
    return { "data": formattedData };
}

// 处理绘图请求
router.post('/v1/images/generations', validateApiKey, async (ctx) => {
    try {
        const { prompt, model, n = 1, size } = ctx.request.body;
        
        // 输入验证
        if (typeof prompt !== 'string') {
            ctx.throw(400, 'prompt必须是字符串');
        }
        if (typeof model !== 'string') {
            ctx.throw(400, 'model必须是字符串');
        }
        if (typeof size !== 'string') {
            ctx.throw(400, 'size必须是字符串');
        }
        if (typeof n !== 'number' || n < 1) {
            ctx.throw(400, 'n必须是大于0的数字');
        }

        // 提取链接的函数
        function extractLinks(textString) {
            const links = [];
            const regex = /(https?:\/\/[^\s()]+)/g;
            let match;
            while ((match = regex.exec(textString)) !== null) {
                links.push(match[1]);
            }
            return links.map(url => ({ "url": url }));
        }
        
        // 执行n次绘图请求并收集结果
        const allLinks = [];
        let lastCreatedTime = 0;
        
        for (let i = 0; i < n; i++) {
            const response = await NXDrawingModelResponse(prompt, model);
            const links = extractLinks(response);
            allLinks.push(...links);
            lastCreatedTime = Math.floor(Date.now() / 1000);
        }

        // 返回结果
        ctx.body = {
            created: lastCreatedTime,
            data: allLinks,
            model: model,
            prompt: prompt,
            n: n,
        };
    } catch (error) {
        console.error('请求处理失败:', error);
        ctx.status = error.status || 500;
        ctx.body = {
            error: {
                message: error.message,
                code: error.code || 'internal_error'
            }
        };
    }
});

// 处理聊天请求
router.post('/v1/chat/completions', validateApiKey, async (ctx) => {
    try {
        const { messages, model = 'gpt-4o-mini', stream = false } = ctx.request.body;

        if (!Array.isArray(messages) || messages.length === 0) {
            ctx.throw(400, 'messages必须是非空数组');
        }

        if (stream) {
            // 流式响应设置
            ctx.set({
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no'
            });
            ctx.status = 200;

            const stream = new PassThrough();
            ctx.body = stream;

            try {
                const responseId = `chatcmpl-${crypto.randomBytes(12).toString('hex')}`;
                const created = Math.floor(Date.now() / 1000);

                // 发送初始数据
                const sendEvent = (data) => {
                    const payload = `data: ${JSON.stringify(data)}\n\n`;
                    return new Promise((resolve) => {
                        if (!stream.write(payload)) {
                            stream.once('drain', resolve);
                        } else {
                            resolve();
                        }
                    });
                };

                // 获取流式响应
                const responseStream = await getStreamingModelResponse(model, messages);

                let index = 0;
                for await (const chunk of responseStream) {
                    await sendEvent({
                        id: responseId,
                        object: 'chat.completion.chunk',
                        created,
                        model,
                        choices: [{
                            index,
                            delta: { content: chunk },
                            finish_reason: null
                        }]
                    });
                    index++;
                }

                // 发送结束标记
                await sendEvent({
                    id: responseId,
                    object: 'chat.completion.chunk',
                    created,
                    model,
                    choices: [{
                        index: 0,
                        delta: {},
                        finish_reason: 'stop'
                    }]
                });

                // 发送标准结束标记
                stream.write('data: [DONE]\n\n');
            } catch (error) {
                console.error('流式响应错误:', error);
                const errorPayload = JSON.stringify({
                    error: {
                        message: error.message,
                        code: error.code || 'internal_error'
                    }
                });
                stream.write(`data: ${errorPayload}\n\n`);
            } finally {
                stream.end();
            }
        } else {
            // 非流式响应保持不变
            const response = await NXModelResponse(messages, model);
            const usage = await TotalTokens(response, messages);

            ctx.body = {
                id: `chatcmpl-${crypto.randomBytes(12).toString('hex')}`,
                object: 'chat.completion',
                created: Math.floor(Date.now() / 1000),
                model,
                choices: [{
                    message: {
                        role: 'assistant',
                        content: response
                    },
                    finish_reason: 'stop'
                }],
                usage
            };
        }
    } catch (error) {
        console.error('请求处理失败:', error);
        ctx.status = error.status || 500;
        ctx.body = {
            error: {
                message: error.message,
                code: error.code || 'internal_error'
            }
        };
    }
});

// 优化的流式响应生成器
async function* getStreamingModelResponse(model, messages) {
    const response = await NXModelResponse(messages, model);

    if (!response || typeof response !== 'string') {
        throw new Error('无效的模型响应');
    }

    // 更合理的分块逻辑（按字符流式输出）
    const chunkSize = 20;
    let position = 0;

    while (position < response.length) {
        const chunk = response.slice(position, position + chunkSize);
        position += chunkSize;

        if (chunk.trim()) {
            yield chunk;
            await delay(30); // 更自然的输出间隔
        }
    }
}

// 辅助函数
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 获取配置
router.get('/v1/config', validateApiKey, async (ctx) => {
    try {
        // 读取多个配置文件
        const Aisettings = await readConfigFile('YTAi_Setting/data.json');
        const otheraiConfig = await readConfigFile('YTotherai/data.json');
        const otheraiProxy = await readConfigFile('YTotherai/proxy.json');
        const otheraiWorkshop = await readConfigFile('YTotherai/workshop.json');
        const openaiConfig = await readConfigFile('YTopenai/data.json');
        const openaiProxy = await readConfigFile('YTopenai/proxy.json');
        const openaiGPTS = await readConfigFile('YTopenai/gpts.json');
        const openaiWorkshop = await readConfigFile('YTopenai/workshop.json');
        // 合并配置
        const config = {
            Aisettings,
            otheraiConfig,
            openaiConfig,
            openaiProxy,
            openaiGPTS,
            openaiWorkshop,
            otheraiProxy,
            otheraiWorkshop
        };

        ctx.body = { config };
    } catch (error) {
        console.error('读取配置失败:', error);
        ctx.status = 500;
        ctx.body = { error: '读取配置失败', message: error.message };
    }
});

// 保存配置
router.post('/v1/config', validateApiKey, async (ctx) => {
    try {
        const { config } = ctx.request.body;

        // 分别保存到不同的配置文件中
        await writeConfigFile('YTAi_Setting/data.json', config.Aisettings);
        await writeConfigFile('YTotherai/data.json', config.otheraiConfig);
        await writeConfigFile('YTotherai/proxy.json', config.otheraiProxy);
        await writeConfigFile('YTotherai/workshop.json', config.otheraiWorkshop);
        await writeConfigFile('YTopenai/data.json', config.openaiConfig);
        await writeConfigFile('YTopenai/proxy.json', config.openaiProxy);
        await writeConfigFile('YTopenai/gpts.json', config.openaiGPTS);
        await writeConfigFile('YTopenai/workshop.json', config.openaiWorkshop);
        ctx.body = { message: '配置更新成功' };
    } catch (error) {
        console.error('保存配置失败:', error);
        ctx.status = 500;
        ctx.body = { error: '更新配置文件失败', message: error.message };
    }
});

// 验证访问密钥
router.post('/verify', async (ctx) => {
    const { accessKey } = ctx.request.body;

    if (accessKey === ACCESS_KEY) {
        // 验证成功，生成 JWT
        const user = { id: 'admin' }; // You can store user information here
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '1d' }); // Token expires in 1 day

        // 设置 Cookie，包含 JWT
        ctx.cookies.set('access_token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 天
            overwrite: true,
            sameSite: 'Lax', // 添加 sameSite 属性
            //secure: true, // 如果使用 HTTPS，则启用
            path: '/',
            //domain: 'yourdomain.com' // 如果部署在特定域名下，需要设置为该域名
        });

        console.log('Cookie set:', ctx.cookies.get('access_token')); // 添加日志

        ctx.body = { success: true, token }; // 返回 JWT
    } else {
        ctx.body = { success: false };
    }
});

// 验证 JWT 的有效性
router.post('/verify-token', async (ctx) => {
    const { token } = ctx.request.body;

    if (!token) {
        ctx.body = { success: false, message: 'Token is required' };
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        ctx.body = { success: true, user: decoded };
    } catch (err) {
        ctx.body = { success: false, message: err.message };
    }
});


// Login route to serve the HTML content and trigger access key validation
router.get('/login', async (ctx) => {
    try {
        ctx.type = 'html';
        const htmlContent = await fsPromises.readFile(path.join(__dirname, 'public', 'config.html'), 'utf8');
        ctx.body = htmlContent;
    } catch (error) {
        console.error('读取HTML文件失败:', error);
        ctx.status = 500;
        ctx.body = '服务器错误';
    }
});

// 默认路由，加载配置页面, 需要验证
router.get('/', validateAccessKeyForConfigPage, async (ctx) => {
    try {
        ctx.type = 'html';
        const htmlContent = await fsPromises.readFile(path.join(__dirname, 'public', 'config.html'), 'utf8');
        ctx.body = htmlContent;
    } catch (error) {
        console.error('读取HTML文件失败:', error);
        ctx.status = 500;
        ctx.body = '服务器错误';
    }
});

// 注册路由
app.use(router.routes()).use(router.allowedMethods());

// API 端点，提供端口号
router.get('/api/port', async (ctx) => {
    ctx.body = { port: process.env.PORT || 7799 };
});

router.get('/api/server-info', async (ctx) => {
    const port = process.env.PORT || 7799;

    const [internalIp, publicIpAddress] = await Promise.all([
        getInternalIp(),
        getPublicIp()
    ]);

    ctx.body = {
        port: port,
        internalIp: internalIp ? `${internalIp}:${port}` : null,
        publicIp: publicIpAddress ? `${publicIpAddress}:${port}` : null
    };
});

async function getInternalIp() {
    const interfaces = os.networkInterfaces();
    let internalIp = null;

    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                internalIp = iface.address;
                break;
            }
        }
        if (internalIp) break;
    }
    return internalIp;
}

async function getPublicIp() {
    try {
        return await publicIpv4(); // 获取公网IP
    } catch (error) {
        console.warn("无法获取公网IP:", error);
        return null;
    }
}


// 创建 WebSocket 服务器
const wss = new WebSocket.Server({ noServer: true });

// WebSocket 连接处理
wss.on('connection', ws => {
    console.log('WebSocket客户端已连接, 逆转api可用');

    ws.on('close', () => {
        //console.log('客户端已断开');
    });
});

// 封装日志发送函数
function broadcastLog(type, message) {
    // 去除 ANSI 转义码
    const cleanMessage = message.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><~]/g, '');

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type, message: cleanMessage }));
        }
    });
}

// 覆盖 console.log 方法
const originalConsoleLog = console.log;
console.log = function (...args) {
    originalConsoleLog.apply(console, args);
    broadcastLog('log', args.join('')); // 将日志广播到所有连接的客户端
};

// 覆盖 console.warn 方法
const originalConsoleWarn = console.warn;
console.warn = function (...args) {
    originalConsoleWarn.apply(console, args);
    broadcastLog('warn', args.join(' ')); // 将日志广播到所有连接的客户端
};

// 覆盖 console.error 方法
const originalConsoleError = console.error;
console.error = function (...args) {
    originalConsoleError.apply(console, args);
    broadcastLog('error', args.join(' ')); // 将日志广播到所有连接的客户端
};

// 启动服务器
const PORT = process.env.PORT || 7799;
const server = app.listen(PORT, () => {
    console.log(`服务器已启动,监听端口 ${PORT}`);
});

server.on('upgrade', (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, ws => {
        wss.emit('connection', ws, req);
    });
});