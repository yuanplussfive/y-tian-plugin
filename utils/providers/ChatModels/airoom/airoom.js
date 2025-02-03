import axios from '../../../../node_modules/axios/index.js'

class PackdirClient {
    constructor(options = {}) {
        // 基础配置
        this.baseURL = 'https://packdir.com';
        this.token = null;
        this.email = null;
        this.password = null;

        // 定义各个模型对应的房间ID
        this.ROOM_IDS = {
            'deepseek': 'gaDKU1Pejfb2',
            'claude-3.5-haiku': 'AteV2A8EEGUp',
            'gpt-4o-mini': 'UvgvuIiAUx4N',
            'gpt-4o': 'oTenSrPwRUMy',
            'gpt-3.5': 'YDffwdBphde0',
            'claude-3.5-sonnet': 'YpA25jhCrFFO'
        };

        // 默认请求头
        this.headers = {
            'accept': '*/*',
            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
            'content-type': 'application/json',
            'sec-ch-ua': '"Microsoft Edge";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            'Referer': 'https://airoom.chat/',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            ...options.headers
        };

        // 缓存相关的属性
        this.lastSuccessfulAuth = null;  // 上次成功的认证信息
        this.messageCache = new Map();   // 消息历史缓存
        this.sessionCache = new Map();   // 会话UUID缓存
        this.lastModelType = null;       // 上次使用的模型类型

        // 日志级别设置
        this.logLevel = options.logLevel || 'info'; // debug, info, warn, error
    }

    // 日志输出函数
    log(level, message, error = null) {
        const levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };

        if (levels[level] >= levels[this.logLevel]) {
            const timestamp = new Date().toISOString();
            const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

            if (error) {
                console[level](logMessage, '\n错误详情:', error);
            } else {
                console[level](logMessage);
            }
        }
    }

    // 生成指定长度的随机字符串
    generateRandomString(length) {
        try {
            const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        } catch (error) {
            this.log('error', '生成随机字符串失败', error);
            throw new Error('生成随机字符串失败');
        }
    }

    // 获取指定模型的消息缓存
    getCachedMessages(modelType) {
        try {
            const messages = this.messageCache.get(modelType) || [];
            this.log('debug', `获取模型 ${modelType} 的缓存消息: ${messages.length} 条`);
            return messages;
        } catch (error) {
            this.log('error', '获取消息缓存失败', error);
            return [];
        }
    }

    // 更新消息缓存
    updateMessageCache(modelType, messages) {
        try {
            this.messageCache.set(modelType, messages);
            this.log('debug', `更新模型 ${modelType} 的消息缓存: ${messages.length} 条`);
        } catch (error) {
            this.log('error', '更新消息缓存失败', error);
        }
    }

    // 获取或创建会话UUID
    async getOrCreateSession(modelType, roomId, forceNew = false) {
        try {
            let sessionUuid = this.sessionCache.get(modelType);

            // 添加 forceNew 判断
            if (!sessionUuid || this.lastModelType !== modelType || forceNew) {
                this.log('info', `需要为模型 ${modelType} 创建新的会话`);

                sessionUuid = await this.getSessionUuid(roomId);
                if (sessionUuid) {
                    this.sessionCache.set(modelType, sessionUuid);
                    this.log('info', `成功创建新会话: ${modelType} -> ${sessionUuid}`);
                }
            } else {
                this.log('debug', `使用现有会话: ${modelType} -> ${sessionUuid}`);
            }

            return sessionUuid;
        } catch (error) {
            this.log('error', `获取/创建会话失败: ${modelType}`, error);
            this.sessionCache.delete(modelType);
            throw error;
        }
    }

    // 初始化客户端
    async init(modelType = 'claude-3.5-sonnet', forceNew = false) {
        try {
            this.log('info', `初始化客户端: ${modelType}, 强制刷新: ${forceNew}`);

            if (!forceNew && this.lastSuccessfulAuth) {
                this.log('debug', '使用缓存的认证信息');
                this.token = this.lastSuccessfulAuth.token;
                this.email = this.lastSuccessfulAuth.email;
                this.password = this.lastSuccessfulAuth.password;
                return this.ROOM_IDS[modelType];
            }

            this.email = `${this.generateRandomString(12)}@yandex.com`;
            this.password = this.generateRandomString(12);

            this.log('info', '开始注册新用户');
            await this.signup();

            this.log('info', '开始登录');
            await this.login();

            this.lastSuccessfulAuth = {
                token: this.token,
                email: this.email,
                password: this.password
            };

            const roomId = this.ROOM_IDS[modelType];
            if (!roomId) {
                throw new Error(`无效的模型类型: ${modelType}`);
            }

            this.log('info', '客户端初始化成功');
            return roomId;

        } catch (error) {
            this.log('error', '客户端初始化失败', error);
            this.destroy();
            throw error;
        }
    }

    // ... existing code ...

    // 提取 axios 错误信息的辅助函数
    getErrorMessage(error) {
        if (error.response) {
            // 服务器响应错误
            return `服务器响应错误 ${error.response.status}: ${error.response.data?.message || '未知错误'}`;
        } else if (error.request) {
            // 请求发送失败
            return '网络请求失败，请检查网络连接';
        } else {
            // 其他错误
            return error.message || '未知错误';
        }
    }

    async signup() {
        try {
            const response = await axios.post(`${this.baseURL}/api/airoom/signup`, {
                email: this.email,
                password: this.password
            }, {
                headers: this.headers
            });

            this.log('debug', '注册响应:', response.data);
            if (response.data.message !== 'success') {
                throw new Error('注册失败');
            }

        } catch (error) {
            const errorMsg = this.getErrorMessage(error);
            this.log('error', '注册失败', errorMsg);
            throw new Error(`注册失败: ${errorMsg}`);
        }
    }

    async login() {
        try {
            const response = await axios.post(`${this.baseURL}/api/airoom/login`, {
                email: this.email,
                password: this.password
            }, {
                headers: this.headers,
                timeout: 10000
            });

            if (response.data.message !== 'ok' || !response.data.token) {
                throw new Error('登录验证失败');
            }

            this.token = response.data.token;
            this.log('debug', '登录成功，获取到token');

        } catch (error) {
            const errorMsg = this.getErrorMessage(error);
            this.log('error', '登录失败', errorMsg);
            throw new Error(`登录失败: ${errorMsg}`);
        }
    }

    async getSessionUuid(roomId) {
        try {
            const response = await axios.get(`${this.baseURL}/api/airoom/room/${roomId}?tid=`, {
                headers: {
                    ...this.headers,
                    'authorization': `Bearer ${this.token}`
                }
            });

            this.log('debug', '获取session UUID成功');
            return response.data.session_uuid;

        } catch (error) {
            const errorMsg = this.getErrorMessage(error);
            this.log('error', '获取session UUID失败', errorMsg);
            throw new Error(`获取会话ID失败: ${errorMsg}`);
        }
    }

    async sendMessage(messages, modelType = 'claude-3.5-sonnet', forceNew = false) {
        try {
            // 参数验证
            if (!Array.isArray(messages) || messages.length === 0) {
                throw new Error('无效的参数类型');
            }

            // 初始化判断逻辑保持不变
            const needsInit = forceNew ||
                !this.token ||
                messages.length === 1 ||
                modelType !== this.lastModelType;

            let messageHistory = needsInit ?
                messages :
                [...this.getCachedMessages(modelType), ...messages];

            const lastUserMessage = [...messageHistory].reverse()
                .find(msg => msg.role === 'user')?.content;

            if (!lastUserMessage) {
                throw new Error('找不到用户消息');
            }

            const roomId = await this.init(modelType, needsInit);
            const sessionUuid = await this.getOrCreateSession(modelType, roomId, needsInit);

            //console.log(sessionUuid);
            try {
                const response = await axios.post(
                    `${this.baseURL}/api/airoom/message`,
                    {
                        session_uuid: sessionUuid,
                        prompt: lastUserMessage,
                        rid: roomId,
                        bid: 'default',
                        ieltspart23: '',
                        tid: '',
                        timestamp: Math.round(new Date().getTime() / 1000)
                    },
                    {
                        headers: {
                            ...this.headers,
                            'authorization': `Bearer ${this.token}`
                        },
                        responseType: 'text',
                        transformResponse: [(data) => data], // 保持原始响应文本
                        validateStatus: null // 允许所有状态码
                    }
                );

                // 处理认证错误
                if ((response.status === 401 || response.status === 403) && !forceNew) {
                    this.sessionCache.delete(modelType);
                    return this.sendMessage(messages, modelType, true);
                }

                // 更新缓存
                this.lastModelType = modelType;
                this.updateMessageCache(modelType, messageHistory);

                return response.data;

            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const status = error.response?.status;
                    if (status === 401 || status === 403) {
                        this.destroy();
                    }
                    throw error;
                }
                throw error;
            }

        } catch (error) {
            this.log('error', '发送消息失败', error.message);
            return null;
        }
    }

    // 清除所有缓存数据
    destroy() {
        this.token = null;
        this.email = null;
        this.password = null;
        this.lastSuccessfulAuth = null;
        this.messageCache.clear();
        this.sessionCache.clear();
        this.lastModelType = null;
    }

    // 获取可用的模型列表
    getAvailableModels() {
        return Object.keys(this.ROOM_IDS).map(key => ({
            id: key,
            name: key.split('-').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '),
            roomId: this.ROOM_IDS[key]
        }));
    }
}

const client = new PackdirClient();

// 导出的主函数
export const airoom = async (messages, model) => {
    try {
        // 处理消息数组
        const processedMessages = messages.length === 2 &&
            messages.some(m => m.role === 'system') &&
            messages.some(m => m.role === 'user')
            ? [{
                role: 'user',
                content: messages.map(m => m.content).join('\n')
            }]
            : messages.map(item => ({
                ...item,
                role: item.role === 'system' ? 'user' : item.role
            }));

        const response = await client.sendMessage(processedMessages, model);
        return response;

    } catch (error) {
        console.error(error.message);
        return null;
    }
}