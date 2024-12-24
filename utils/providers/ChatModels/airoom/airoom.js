let fetch = (await import('node-fetch')).default;

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
    }

    // 生成指定长度的随机字符串
    generateRandomString(length) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // 获取指定模型的消息缓存
    getCachedMessages(modelType) {
        return this.messageCache.get(modelType) || [];
    }

    // 更新消息缓存
    updateMessageCache(modelType, messages) {
        this.messageCache.set(modelType, messages);
    }

    // 获取或创建会话UUID
    async getOrCreateSession(modelType, roomId) {
        // 获取缓存的sessionUuid
        let sessionUuid = this.sessionCache.get(modelType);
        // 只有在以下情况才需要重新获取sessionUuid:
        // 1. 没有缓存的sessionUuid
        // 2. 强制刷新
        // 3. 切换了模型
        if (!sessionUuid || this.lastModelType !== modelType) {
            try {
                sessionUuid = await this.getSessionUuid(roomId);
                if (sessionUuid) {
                    this.sessionCache.set(modelType, sessionUuid);
                    console.log(`${modelType}: ${sessionUuid}`);
                }
            } catch (error) {
                console.error(`${error.message}`);
                // 如果获取失败，清除该模型的缓存
                this.sessionCache.delete(modelType);
                throw error;
            }
        } else {
            console.log(`${modelType}: ${sessionUuid}`);
        }

        return sessionUuid;
    }

    // 初始化客户端
    async init(modelType = 'claude-3.5-sonnet', forceNew = false) {
        // 检查是否可以使用缓存的认证信息
        if (!forceNew && this.lastSuccessfulAuth) {
            this.token = this.lastSuccessfulAuth.token;
            this.email = this.lastSuccessfulAuth.email;
            this.password = this.lastSuccessfulAuth.password;
            return this.ROOM_IDS[modelType];
        }

        try {
            // 生成随机邮箱和密码
            this.email = `${this.generateRandomString(12)}@yandex.com`;
            this.password = this.generateRandomString(12);

            // 注册并登录
            await this.signup();
            await this.login();

            // 缓存成功的认证信息
            this.lastSuccessfulAuth = {
                token: this.token,
                email: this.email,
                password: this.password
            };

            // 验证并返回房间ID
            const roomId = this.ROOM_IDS[modelType];
            if (!roomId) {
                throw new Error(`无效的room_id: ${modelType}`);
            }
            return roomId;

        } catch (error) {
            this.destroy();
            throw new Error(`凭证校验失败: ${error.message}`);
        }
    }

    // 注册新用户
    async signup() {
        try {
            const response = await fetch(`${this.baseURL}/api/airoom/signup`, {
                method: 'POST',
                headers: {
                    ...this.headers,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: this.email,
                    password: this.password
                })
            });

            const data = await response.json();
            if (data.message !== 'success') {
                throw new Error('模拟登录失败');
            }

        } catch (error) {
            throw new Error(`注册失败: ${error.message}`);
        }
    }

    // 用户登录
    async login() {
        try {
            const response = await fetch(`${this.baseURL}/api/airoom/login`, {
                method: 'POST',
                headers: {
                    ...this.headers,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: this.email,
                    password: this.password
                }),
                signal: AbortSignal.timeout(10000)
            });

            const data = await response.json();
            if (data.message !== 'ok' || !data.token) {
                throw new Error('登录失败');
            }

            this.token = data.token;

        } catch (error) {
            throw new Error(`登录失败: ${error.message}`);
        }
    }

    // 获取会话UUID
    async getSessionUuid(roomId) {
        try {
            const response = await fetch(`${this.baseURL}/api/airoom/room/${roomId}?tid=`, {
                method: 'GET',
                headers: {
                    ...this.headers,
                    'authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                throw new Error(`提取 session UUID 失败: ${response.status}`);
            }

            const data = await response.json();
            return data.session_uuid;

        } catch (error) {
            throw new Error(`提取 session UUID 失败: ${error.message}`);
        }
    }

    // 发送消息
    async sendMessage(messages, modelType = 'claude-3.5-sonnet', forceNew = false) {
        try {
            // 参数验证
            if (!Array.isArray(messages) || messages.length === 0) {
                throw new Error('无效的参数类型');
            }

            // 判断是否需要重新初始化
            const needsInit = forceNew ||
                !this.token ||
                messages.length === 1 ||
                modelType !== this.lastModelType;

            // 如果是强制刷新或切换模型，先清除旧的session缓存
            if (needsInit) {
                this.sessionCache.delete(modelType);
            }

            // 初始化并获取必要信息
            const roomId = await this.init(modelType, needsInit);
            const sessionUuid = await this.getOrCreateSession(modelType, roomId);

            // 构建消息历史
            let messageHistory = needsInit ?
                messages :
                [...this.getCachedMessages(modelType), ...messages];

            // 获取最后一条用户消息
            const lastUserMessage = [...messageHistory].reverse()
                .find(msg => msg.role === 'user')?.content;

            if (!lastUserMessage) {
                throw new Error('找不到用户消息');
            }

            console.log(sessionUuid);
            // 发送请求
            const response = await fetch(`${this.baseURL}/api/airoom/message`, {
                method: 'POST',
                headers: {
                    ...this.headers,
                    'authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    session_uuid: sessionUuid,
                    prompt: lastUserMessage,
                    rid: roomId,
                    bid: 'default',
                    ieltspart23: '',
                    tid: '',
                    timestamp: Math.round(new Date().getTime() / 1000)
                })
            });

            // 处理认证失败的情况
            if (!response.ok) {
                if ((response.status === 401 || response.status === 403) && !forceNew) {
                    this.sessionCache.delete(modelType);
                    return this.sendMessage(messages, modelType, true);
                }
                throw new Error(`请求失败: ${response.status}`);
            }

            // 更新缓存
            this.lastModelType = modelType;
            this.updateMessageCache(modelType, messageHistory);

            return await response.text();

        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                this.destroy();
            }
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
        messages = messages.length === 2 &&
            messages.some(m => m.role === 'system') &&
            messages.some(m => m.role === 'user')
            ? [{
                role: 'user',
                content: messages.map(m => m.content).join('\n')
            }]
            : messages.map(item => {
                if (item.role === 'system') {
                    item.role = 'user';
                }
                return item;
            });
        const response = await client.sendMessage(messages, model);
        return response;

    } catch (error) {
        console.error(error.message);
        return null;
    }
}