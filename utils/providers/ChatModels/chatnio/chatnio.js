import puppeteer from 'puppeteer';
import { dependencies } from "../../../../YTdependence/dependencies.js";
const { WebSocket, FormData: NodeFormData, mimeTypes, fetch } = dependencies;

// 获取Node.js主版本号
function getNodeMajorVersion() {
    const version = process.version.match(/^v(\d+)/);
    return version ? parseInt(version[1]) : 0;
}

// 获取MIME类型
function getMimeType(filename) {
    const mimeType = mimeTypes.lookup(filename) || 'application/octet-stream';
    return mimeType;
}

// 文件上传类
class FileUploader {
    constructor(token) {
        this.token = token;
        this.uploadUrl = 'https://blob.pro.liujiarong.top/upload';
    }

    async uploadFile(fileUrl, model = 'glm-4v-flash') {
        try {
            const response = await fetch(fileUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                }
            });
            if (!response.ok) {
                throw Error('可能图片链接已过期！')
            }

            const filename = '1.png';
            let formData = new NodeFormData();
            let headers = {
                'accept': 'application/json, text/plain, */*',
                'authorization': this.token,
                'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132", "Microsoft Edge";v="132"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'Referer': 'https://chatnio.liujiarong.top/',
                'Referrer-Policy': 'strict-origin-when-cross-origin'
            };

            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();
            const fileBuffer = Buffer.from(arrayBuffer);
            
            formData.append('file', fileBuffer, {
                filename,
                contentType: getMimeType(filename)
            });

            headers = { ...headers, ...formData.getHeaders() };

            formData.append('model', model);

            const uploadResponse = await fetch(this.uploadUrl, {
                method: 'POST',
                headers: headers,
                body: formData
            });
            console.log(headers)
            if (!uploadResponse.ok) {
                console.log(`上传失败: ${uploadResponse.statusText}`);
                return null;
            }

            return await uploadResponse.json();

        } catch (error) {
            console.error('上传失败了:', error);
            return null;
        }
    }
}

class ChatNIO {
    constructor(token, options = {}) {
        // 初始化配置参数
        this.token = token;
        this.wsUrl = options.wsUrl || 'wss://chatnio.liujiarong.top/api/chat';
        this.timeout = options.timeout || 10 * 60 * 1000; // 10分钟超时
        this.onMessage = options.onMessage || null;
        this.onError = options.onError || null;
        this.onClose = options.onClose || null;
        this.onOpen = options.onOpen || null;

        // WebSocket相关变量
        this.socket = null;
        this.reconnectTimer = null;
        this.inactivityTimer = null;
        this.fullResponse = '';

        // 默认消息配置
        this.defaultMessageConfig = {
            type: "chat",
            web: false,
            model: "gpt-4o-mini",
            context: 8,
            ignore_context: false,
            max_tokens: 2000,
            temperature: 0.6,
            top_p: 1,
            top_k: 5,
            presence_penalty: 0,
            frequency_penalty: 0,
            repetition_penalty: 1
        };

        // 建立连接
        this.connect();
    }

    // 等待WebSocket连接建立
    async waitForConnection() {
        return new Promise((resolve, reject) => {
            if (this.socket.readyState === WebSocket.OPEN) {
                resolve();
            } else {
                // 添加连接成功的回调
                const originalOnOpen = this.onOpen;
                this.onOpen = () => {
                    if (originalOnOpen) originalOnOpen();
                    resolve();
                };

                // 添加错误处理的回调
                const originalOnError = this.onError;
                this.onError = (error) => {
                    if (originalOnError) originalOnError(error);
                    reject(error);
                };

                // 设置连接超时
                setTimeout(() => {
                    reject(new Error('WebSocket连接超时'));
                }, 10000); // 10秒超时
            }
        });
    }

    // 重置不活动计时器
    resetInactivityTimer() {
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
        }
        this.inactivityTimer = setTimeout(() => {
            console.log('连接超时,关闭连接');
            this.close();
        }, this.timeout);
    }

    // 建立WebSocket连接
    connect() {
        this.socket = new WebSocket(this.wsUrl);

        this.socket.onopen = () => {
            console.log('WebSocket连接已建立');
            this.resetInactivityTimer();

            // 发送认证信息
            const auth = {
                token: this.token,
                id: -1
            };
            this.socket.send(JSON.stringify(auth));

            if (this.onOpen) this.onOpen();
        };

        this.socket.onmessage = (event) => {
            this.resetInactivityTimer();
            const response = JSON.parse(event.data);
            this.fullResponse += response.message;

            if (response.end) {
                if (this.onMessage) {
                    this.onMessage(this.fullResponse);
                } else {
                    console.log("完整回复:", this.fullResponse);
                }
                this.fullResponse = '';
            }
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket错误:', error);
            if (this.onError) this.onError(error);
            this.close();
        };

        this.socket.onclose = () => {
            console.log('WebSocket连接已关闭');
            if (this.inactivityTimer) {
                clearTimeout(this.inactivityTimer);
            }
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
            }
            if (this.onClose) this.onClose();
        };
    }

    // 发送消息
    async sendMessage(text, config = {}) {
        // 等待连接建立
        await this.waitForConnection();

        this.resetInactivityTimer();

        const message = {
            ...this.defaultMessageConfig,
            ...config,
            message: text
        };

        this.socket.send(JSON.stringify(message));

        // 返回Promise等待消息响应
        return new Promise((resolve, reject) => {
            let response = '';

            const originalOnMessage = this.onMessage;
            this.onMessage = (msg) => {
                response = msg;
                if (originalOnMessage) originalOnMessage(msg);
                resolve(response);
            };

            const originalOnError = this.onError;
            this.onError = (error) => {
                if (originalOnError) originalOnError(error);
                reject(error);
            };
        });
    }

    async uploadFile(fileUrl, model = 'glm-4v-flash') {
        const uploader = new FileUploader(this.token);
        return await uploader.uploadFile(fileUrl, model);
    }

    // 关闭连接
    close() {
        if (this.socket) {
            this.socket.close();
        }
    }
}

// 生成随机中文标题
function generateRandomChineseTitle() {
    const words = [
        '智能', '对话', '助手', '聊天', '机器人',
        '智慧', '未来', '创新', '学习', '交流',
        '思考', '探索', '互动', '分享', '成长'
    ];

    const length = Math.random() > 0.5 ? 2 : 3;
    const title = Array(length).fill(0)
        .map(() => words[Math.floor(Math.random() * words.length)])
        .join('');

    return encodeURIComponent(title);
}

// 使用Puppeteer模拟浏览器行为
async function simulateWithPuppeteer() {
    const browser = await puppeteer.launch({
        headless: "new"
    });

    try {
        const page = await browser.newPage();

        await page.setViewport({
            width: 1536,
            height: 864
        });

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0');

        await page.goto('https://chatnio.liujiarong.top/');

        // 等待脚本加载并获取website ID
        let websiteId = await page.evaluate(() => {
            const umamiScript = document.querySelector('script[data-website-id]');
            return umamiScript ? umamiScript.getAttribute('data-website-id') : null;
        });

        if (!websiteId) {
            console.log('抓取 Website ID 失败, 使用固定值');
            websiteId = '2bfbc2b3-1e1f-48e0-ac6b-665117069b8d';
        }

        console.log(websiteId);
        const randomTitle = generateRandomChineseTitle();

        const result = await page.evaluate(async ({ randomTitle, websiteId }) => {
            const response = await fetch("https://umami.liujiarong.top/api/send", {
                headers: {
                    "content-type": "application/json",
                    "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132", "Microsoft Edge";v="132"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": '"Windows"'
                },
                body: JSON.stringify({
                    type: "event",
                    payload: {
                        website: websiteId,
                        hostname: "chatnio.liujiarong.top",
                        screen: "1536x864",
                        language: "zh-CN",
                        title: randomTitle,
                        url: "/"
                    }
                }),
                method: "POST"
            });
            return await response.text();
        }, { randomTitle, websiteId });

        return result;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// 缓存变量
let cachedToken = null;
let cachedChat = null;

// 主要导出函数
export async function Chatnio(model, messages, fileUrl = null) {
    try {
        if (messages.length === 1 || !cachedToken || !cachedChat) {
            cachedToken = await simulateWithPuppeteer();
            cachedChat = new ChatNIO(cachedToken, {
                onMessage: (response) => {
                    console.log('收到回复:', response);
                },
                onError: (error) => {
                    console.error('发生错误:', error);
                }
            });
            await cachedChat.waitForConnection();
        }

        let UserInput = messages[messages.length - 1]?.content;
        // 如果有文件需要上传
        if (fileUrl) {
            const uploadResult = await cachedChat.uploadFile(fileUrl, model);
            console.log('文件上传结果:', uploadResult);
            UserInput = `\`\`\`file \n[[1.jpeg]]\n${uploadResult.content}\n\`\`\`\n\n${UserInput}`;
        }
        if (!UserInput) {
            throw new Error('无效的消息格式');
        }

        const output = await cachedChat.sendMessage(UserInput, {
            model,
            temperature: 0.8
        });
        return output;

    } catch (error) {
        console.error('请求失败:', error);
        cachedToken = null;
        cachedChat = null;
        return null;
    }
}