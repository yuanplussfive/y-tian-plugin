import { createRequire } from 'module'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);
const WebSocketPath = join(__dirname, '../../../../node_modules/ws');
const WebSocket = require(WebSocketPath);
import { randomBytes } from 'crypto';

class AnthropicAi {
    constructor(modelId) {
        this.modelId = modelId;
    }

    // 处理消息内容
    processMessageContent(content) {
        if (typeof content === 'string') return content;
        if (Array.isArray(content)) {
            return content
                .filter(item => item.type === 'text')
                .map(item => item.text)
                .join('\n');
        }
        return typeof content === 'object' ? content.text || null : null;
    }

    // 转换消息格式
    async transformMessages(messages) {
        let systemMessageList = [];
        let systemMergeMode = false;
        let closedSystemMergeMode = false;

        const contextMessages = await messages.reduce(async (accPromise, current) => {
            const acc = await accPromise;
            const currentContent = this.processMessageContent(current.content);

            if (currentContent === null) return acc;

            const currentMessageRole = current.role === "system" || current.role === "user" ? "HUMAN" : "ASSISTANT";

            // 系统消息处理逻辑
            if (current.role === "system") {
                if (!closedSystemMergeMode) {
                    systemMergeMode = true;
                    const lastSystemMessage = systemMessageList[systemMessageList.length - 1];

                    if (!lastSystemMessage) {
                        systemMessageList.push(currentContent);
                    } else {
                        systemMessageList[systemMessageList.length - 1] = `${lastSystemMessage}\n${currentContent}`;
                    }
                    return acc;
                }
            }

            // 关闭系统消息合并模式
            if (current.role !== "system" && systemMergeMode) {
                systemMergeMode = false;
                closedSystemMergeMode = true;
            }

            // 消息合并逻辑
            const previousMessage = acc[acc.length - 1];
            const newMessage = `${currentMessageRole}: ${currentContent}`;

            if (!previousMessage || previousMessage.startsWith(currentMessageRole)) {
                return previousMessage
                    ? [...acc.slice(0, -1), `${previousMessage}\n${currentContent}`]
                    : [...acc, newMessage];
            }

            return [...acc, newMessage];
        }, Promise.resolve([]));

        return {
            contextMessages: contextMessages.join('\n'),
            systemMessage: systemMessageList.join('\n')
        };
    }
}

// WebSocket工具类
class WebSocketUtils {
    static activeConnections = new Set(); // 跟踪活跃连接
    static TIMEOUT = 5 * 60 * 1000; // 5分钟超时时间
    static MAX_CONNECTIONS = 10; // 最大并发连接数
    static API_BASE_URL = "wss://api.inkeep.com/graphql";
    static DEFAULT_HEADERS = {
        'Host': 'api.inkeep.com',
        'Connection': 'Upgrade',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        'Upgrade': 'websocket',
        'Origin': 'https://docs.anthropic.com',
        'Sec-WebSocket-Version': '13',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Sec-WebSocket-Extensions': 'permessage-deflate; client_max_window_bits',
        'Sec-WebSocket-Protocol': 'graphql-transport-ws'
    };

    // 生成WebSocket密钥
    static generateWebSocketKey() {
        return randomBytes(16).toString('base64');
    }

    // 生成UUID (使用 crypto)
    static generateUUID() {
        return randomBytes(16).toString('hex').replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
    }

    // 创建WebSocket客户端
    static async createWebSocketClient(requestPayload) {
        // 检查当前连接数是否达到上限
        if (this.activeConnections.size >= this.MAX_CONNECTIONS) {
            throw new Error(`当前连接数已达到上限 (${this.MAX_CONNECTIONS})，请稍后重试`);
        }

        let timeoutId;
        let ws;

        try {
            return await new Promise((resolve, reject) => {
                const websocketKey = this.generateWebSocketKey();
                ws = new WebSocket(this.API_BASE_URL, 'graphql-transport-ws', {
                    headers: {
                        ...this.DEFAULT_HEADERS,
                        'Sec-WebSocket-Key': websocketKey,
                    }
                });

                // 添加到活跃连接**
                this.activeConnections.add(ws);
                console.log(`当前活跃连接数: ${this.activeConnections.size}/${this.MAX_CONNECTIONS}`);

                // 设置超时处理
                timeoutId = setTimeout(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.close();
                    }
                    this.activeConnections.delete(ws);
                    console.log(`连接超时，当前活跃连接数: ${this.activeConnections.size}/${this.MAX_CONNECTIONS}`);
                    reject(new Error('WebSocket连接超时（5分钟）'));
                }, this.TIMEOUT);

                let responseContent = '';
                let isComplete = false;

                ws.on('open', () => {
                    console.log('WebSocket连接已建立');
                    const connectionInitMessage = {
                        type: 'connection_init',
                        payload: {
                            headers: {
                                Authorization: 'Bearer ee5b7c15ed3553cd6abc407340aad09ac7cb3b9f76d8613a'
                            }
                        }
                    };
                    ws.send(JSON.stringify(connectionInitMessage));
                });

                ws.on('message', async (data) => {
                    const message = data.toString();
                    const parsedMessage = JSON.parse(message);

                    switch (parsedMessage.type) {
                        case 'connection_ack':
                            console.log('WebSocket连接请求中');
                            this.sendChatSubscription(ws, requestPayload);
                            break;
                        case 'next':
                            const chatResponse = await this.handleChatResponse(parsedMessage);
                            if (chatResponse) {
                                responseContent = chatResponse;
                                // 获取到响应后立即关闭连接
                                isComplete = true;
                                ws.close();
                                resolve(responseContent);
                            }
                            break;
                        case 'complete':
                            isComplete = true;
                            ws.close();
                            resolve(responseContent);
                            break;
                        case 'error':
                            console.error('WebSocket错误:', parsedMessage.payload[0].message);
                            ws.close();
                            reject(new Error(`WebSocket错误: ${parsedMessage.payload[0].message}`));
                            break;
                    }
                });

                ws.on('error', (err) => {
                    console.error('WebSocket错误:', err);
                    clearTimeout(timeoutId);
                    this.activeConnections.delete(ws);
                    console.log(`连接错误，当前活跃连接数: ${this.activeConnections.size}/${this.MAX_CONNECTIONS}`);
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.close();
                    }
                    reject(err);
                });

                ws.on('close', (code, reason) => {
                    console.log('请求完毕，关闭连接');
                    clearTimeout(timeoutId);
                    this.activeConnections.delete(ws);
                    console.log(`连接关闭，当前活跃连接数: ${this.activeConnections.size}/${this.MAX_CONNECTIONS}`);
                    if (!isComplete) {
                        reject(new Error('WebSocket closed unexpectedly'));
                    }
                });
            });
        } catch (error) {
            clearTimeout(timeoutId);
            if (ws) {
                this.activeConnections.delete(ws);
                console.log(`发生错误，当前活跃连接数: ${this.activeConnections.size}/${this.MAX_CONNECTIONS}`);
                if (ws.readyState === WebSocket.OPEN) {
                    ws.close();
                }
            }
            throw error;
        }
    }

    // 发送聊天订阅
    static sendChatSubscription(ws, requestPayload) {
        const subscribeMessage = {
            id: this.generateUUID(), // 使用 crypto 生成 UUID
            type: 'subscribe',
            payload: {
                variables: {
                    messageInput: requestPayload.contextMessages,
                    messageContext: null,
                    organizationId: 'org_JfjtEvzbwOikUEUn',
                    integrationId: 'clwtqz9sq001izszu8ms5g4om',
                    chatMode: 'AUTO',
                    context: requestPayload.systemMessage,
                    messageAttributes: {},
                    includeAIAnnotations: false,
                    environment: 'production'
                },
                extensions: {},
                operationName: 'OnNewSessionChatResult',
                query: `subscription OnNewSessionChatResult($messageInput: String!, $messageContext: String, $organizationId: ID!, $integrationId: ID, $chatMode: ChatMode, $filters: ChatFiltersInput, $messageAttributes: JSON, $tags: [String!], $workflowId: String, $context: String, $guidance: String, $includeAIAnnotations: Boolean!, $environment: String) {
                   newSessionChatResult(
                       input: {messageInput: $messageInput, messageContext: $messageContext, organizationId: $organizationId, integrationId: $integrationId, chatMode: $chatMode, filters: $filters, messageAttributes: $messageAttributes, tags: $tags, workflowId: $workflowId, context: $context, guidance: $guidance, environment: $environment}
                   ) {
                       isEnd
                       sessionId
                       message {
                           id
                           content
                       }
                       __typename
                   }
               }`
            }
        };

        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(subscribeMessage));
        }
    }

    // 处理聊天响应
    static async handleChatResponse(message) {
        if (message.payload && message.payload.data) {
            const chatResult = message.payload.data.newSessionChatResult;
            if (chatResult && chatResult.isEnd == true && chatResult.message) {
                return chatResult.message.content;
            }
        }
        return null;
    }

    // 获取当前活跃连接数
    static getActiveConnectionsCount() {
        return this.activeConnections.size;
    }
}

async function getChatCompletion(messages, model) {
    try {
        const apiClient = new AnthropicAi(model);
        const requestPayload = await apiClient.transformMessages(messages);
        const responseContent = await WebSocketUtils.createWebSocketClient(requestPayload);
        return responseContent;
    } catch (error) {
        console.error('处理请求时发生错误:', error);
        throw error;
    }
}

export async function AnthropicDoc(messages) {
    const model = 'claude-3-5-sonnet-20241022';
    try {
        const completion = await getChatCompletion(messages, model);
        return completion?.trim();
    } catch (error) {
        console.error('Failed to get completion:', error);
        return null;
    }
}