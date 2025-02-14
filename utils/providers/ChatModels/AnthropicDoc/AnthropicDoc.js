import { createRequire } from 'module'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);
const WebSocketPath = join(__dirname, '../../../../node_modules/ws');
const WebSocket = require(WebSocketPath);
import { randomUUID } from 'crypto';

/**
* @class InKeepClient
* @description 封装与 InKeep API 交互的 WebSocket 客户端。
*/
class InKeepClient {
    /**
     * @constructor
     * @param {object} config - 配置对象，包含 WebSocket 连接所需的各种参数。
     */
    constructor(config) {
        this.config = config;
        this.enableContext = false; // 是否启用上下文
    }

    /**
     * @method processMessages
     * @description 处理消息上下文的函数
     * @param {Array<object>} messages - 消息数组
     * @returns {string} - 处理后的消息字符串
     */
    processMessages(messages) {
        if (!messages || messages.length === 0) {
            console.warn("processMessages: 消息数组为空，返回默认消息。");
            return this.config.DEFAULT_MESSAGE;
        }

        try {
            const contextString = messages.map(message => `${message.role}: ${message.content}`).join("\n");
            return contextString;
        } catch (error) {
            console.error("processMessages: 处理消息上下文时出错:", error);
            return this.config.DEFAULT_MESSAGE;
        }
    }

    /**
     * @method performHandshake
     * @description 执行 WebSocket 握手的函数。
     * @param {WebSocket} ws - WebSocket 实例。
     * @returns {Promise<void>} - Promise，在握手成功时解决。
     */
    async performHandshake(ws) {
        return new Promise((resolve, reject) => {
            // 初始化消息，包含鉴权信息
            const initMsg = {
                type: "connection_init",
                payload: { headers: { Authorization: this.config.AUTH_TOKEN } },
            };
            // 发送初始化消息
            ws.send(JSON.stringify(initMsg));

            // 监听 WebSocket 消息
            ws.on('message', (data) => {
                const resp = JSON.parse(data);
                // 如果收到连接确认消息，则解决 Promise
                if (resp.type === "connection_ack") {
                    resolve();
                }
            });

            // 监听 WebSocket 错误
            ws.on('error', (error) => {
                reject(error);
            });
        });
    }

    /**
     * @method subscribe
     * @description 执行订阅操作的函数。
     * @param {WebSocket} ws - WebSocket 实例。
     * @param {string} messageInput - 用户输入的消息。
     * @returns {Promise<string>} - Promise，在接收到最终内容时解决。
     */
    async subscribe(ws, messageInput) {
        return new Promise((resolve, reject) => {
            // 生成唯一的订阅 ID
            const subscribeId = randomUUID(); // 使用 crypto.randomUUID()
            // 订阅消息，包含查询参数
            const subscribeMsg = {
                id: subscribeId,
                type: "subscribe",
                payload: {
                    variables: {
                        messageInput: messageInput,
                        messageContext: null,
                        organizationId: this.config.ORG_ID,
                        integrationId: this.config.INTEGRATION_ID,
                        chatMode: "AUTO",
                        messageAttributes: {},
                        includeAIAnnotations: false,
                        environment: "production",
                    },
                    extensions: {},
                    operationName: "OnNewSessionChatResult",
                    query: `
                       subscription OnNewSessionChatResult($messageInput: String!, $messageContext: String, $organizationId: ID!, 
                       $integrationId: ID, $chatMode: ChatMode, $filters: ChatFiltersInput, $messageAttributes: JSON, $tags: [String!], 
                       $workflowId: String, $context: String, $guidance: String, $includeAIAnnotations: Boolean!, $environment: String) {
                         newSessionChatResult(input: {messageInput: $messageInput, messageContext: $messageContext, organizationId: $organizationId, 
                       integrationId: $integrationId, chatMode: $chatMode, messageAttributes: $messageAttributes, environment: $environment}) {
                           isEnd sessionId message { id content __typename }
                         }
                       }
                   `,
                },
            };

            // 发送订阅消息
            ws.send(JSON.stringify(subscribeMsg));

            // 监听 WebSocket 消息
            ws.on('message', (data) => {
                const message = JSON.parse(data);

                // 如果收到 "next" 消息
                if (message.type === "next") {
                    // Extract the content
                    const content = message.payload.data.newSessionChatResult.message.content;

                    // 如果收到 "isEnd" 标志，则解决 Promise with the *current* content
                    if (message.payload.data.newSessionChatResult.isEnd) {
                        resolve(content); // Resolve with the *last* content received.
                    }
                } else if (message.type === "error") {
                    // 如果收到错误消息，则拒绝 Promise
                    reject(message);
                }
            });

            // 监听 WebSocket 错误
            ws.on('error', (error) => {
                reject(error);
            });
        });
    }

    /**
     * @method openaiCompatibleComplete
     * @description 模拟 OpenAI 兼容的完成请求的函数。
     * @param {string} modelName - 模型名称。
     * @param {string} messageInput - 用户输入的消息。
     * @returns {Promise<string>} - Promise，在接收到最终内容时解决。
     */
    async openaiCompatibleComplete(modelName, messageInput) {
        // 创建 WebSocket 连接
        const ws = new WebSocket(this.config.WS_URI, ["graphql-transport-ws"]);

        return new Promise((resolve, reject) => {
            // 当 WebSocket 连接打开时
            ws.onopen = async () => {
                try {
                    // 执行握手
                    await this.performHandshake(ws);
                    // 执行订阅并获取内容
                    const content = await this.subscribe(ws, messageInput);
                    // 关闭 WebSocket 连接
                    ws.close();
                    // 解决 Promise
                    resolve(content);
                } catch (error) {
                    // 如果发生错误，关闭 WebSocket 连接并拒绝 Promise
                    ws.close();
                    reject(error);
                }
            };

            // 当 WebSocket 发生错误时
            ws.onerror = (error) => {
                reject(error);
            };
        });
    }

    /**
     * @method chatCompletions
     * @description 模拟聊天完成请求的函数。
     * @param {object} req - 请求对象，包含模型名称和消息列表。
     * @returns {Promise<string|object>} - Promise，在接收到最终内容时解决，或在发生错误时返回错误对象。
     */
    async chatCompletions(req) {
        if (req.model !== this.config.MODEL) {
            return { error: "不支持的模型。" };
        }

        const messages = req.messages || [];
        let messageInput;

        // 根据是否启用上下文选择消息输入
        if (this.enableContext) {
            const processed = this.processMessages(messages);
            messageInput = processed ? processed[processed.length - 1] : this.config.DEFAULT_MESSAGE;
        } else {
            messageInput = messages.length > 0 ? messages[messages.length - 1].content : this.config.DEFAULT_MESSAGE;
        }


        try {
            const result = await this.openaiCompatibleComplete(this.config.MODEL, messageInput);
            return result;
        } catch (error) {
            console.error("聊天完成请求出错:", error);
            return { error: "处理过程中发生错误。" };
        }
    }
}

const CONFIG = {
    WS_URI: "wss://api.inkeep.com/graphql",
    AUTH_TOKEN: "Bearer ee5b7c15ed3553cd6abc407340aad09ac7cb3b9f76d8613a",
    ORG_ID: "org_xxxxxxxxxxxxxxx",
    INTEGRATION_ID: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    DEFAULT_MESSAGE: "你好。",
    MODEL: "claude-3-5-sonnet-20241022",
};

export async function AnthropicDoc(messages) {
    const inKeepClient = new InKeepClient(CONFIG);

    const req = {
        model: CONFIG.MODEL,
        messages
    };

    try {
        const result = await inKeepClient.chatCompletions(req);
        return result?.trim();
    } catch (error) {
        console.error("调用 chatCompletions 出错:", error);
        return null;
    }
}