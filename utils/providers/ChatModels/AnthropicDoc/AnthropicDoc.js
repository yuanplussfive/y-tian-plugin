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
    constructor(config) {
        this.config = config;
        this.ws = null;
        this.handshakePromise = null;
        this.subscribeId = null;
        this.organizationId = null;
        this.integrationId = null;
        this.isWsConnected = false;
    }

    /**
     * @method ensureConnection
     * @description 确保 WebSocket 连接已建立并完成握手。
     * @returns {Promise<void>}
     */
    async ensureConnection() {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            this.ws = new WebSocket(this.config.WS_URI, ["graphql-transport-ws"]);

            this.handshakePromise = new Promise((resolve, reject) => {
                this.ws.onopen = async () => {
                    try {
                        await this.performHandshake(this.ws);
                        this.isWsConnected = true;
                        resolve();
                    } catch (error) {
                        this.isWsConnected = false;
                        reject(error);
                    }
                };

                this.ws.onerror = (error) => {
                    this.isWsConnected = false;
                    reject(error);
                };

                this.ws.onclose = () => {
                    this.isWsConnected = false;
                    this.ws = null;
                    this.handshakePromise = null;
                };
            });

            return this.handshakePromise;
        } else if (!this.isWsConnected) {
            return this.handshakePromise;
        }
    }

    /**
     * @method performHandshake
     * @description 执行 WebSocket 握手的函数。
     * @param {WebSocket} ws - WebSocket 实例。
     * @returns {Promise<void>}
     */
    async performHandshake(ws) {
        return new Promise((resolve, reject) => {
            const initMsg = {
                type: "connection_init",
                payload: { headers: { Authorization: this.config.AUTH_TOKEN } },
            };
            ws.send(JSON.stringify(initMsg));

            ws.on('message', (data) => {
                const resp = JSON.parse(data);
                if (resp.type === "connection_ack") {
                    resolve();
                }
            });

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
         * @param {boolean} shouldReset - 是否重置会话ID
         * @returns {Promise<string>}
         */
    async subscribe(ws, messageInput, shouldReset = false) {
        return new Promise((resolve, reject) => {
            // Only generate new IDs if shouldReset is true OR the IDs are not yet initialized.
            if (shouldReset || !this.subscribeId) {
                this.subscribeId = randomUUID();
                this.organizationId = `org_${randomUUID().replace(/-/g, '').substring(0, 16)}`;
                this.integrationId = randomUUID().replace(/-/g, '').substring(0, 32);
            }

            const subscribeMsg = {
                id: this.subscribeId,
                type: "subscribe",
                payload: {
                    variables: {
                        messageInput: messageInput,
                        messageContext: null,
                        organizationId: this.organizationId,
                        integrationId: this.integrationId,
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

            console.log(subscribeMsg)
            ws.send(JSON.stringify(subscribeMsg));

            ws.on('message', (data) => {
                const message = JSON.parse(data);

                if (message.type === "next") {
                    const content = message.payload.data.newSessionChatResult.message.content;

                    if (message.payload.data.newSessionChatResult.isEnd) {
                        resolve(content);
                    }
                } else if (message.type === "error") {
                    reject(message);
                }
            });

            ws.on('error', (error) => {
                reject(error);
            });
        });
    }

    async openaiCompatibleComplete(modelName, messageInput, shouldReset = false) {
        await this.ensureConnection();

        return new Promise(async (resolve, reject) => {
            try {
                const content = await this.subscribe(this.ws, messageInput, shouldReset);
                resolve(content);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * @method chatCompletions
     * @description 模拟聊天完成请求的函数。
     * @param {object} req - 请求对象，包含模型名称和消息列表。
     * @param {boolean} shouldReset - 是否重置会话ID
     * @returns {Promise<string|object>}
     */
    async chatCompletions(req, shouldReset = false) {
        if (req.model !== this.config.MODEL) {
            return { error: "不支持的模型。" };
        }

        const messages = req.messages || [];
        if (messages.length === 0) {
            return { error: "消息列表不能为空。" };
        }

        const messageInput = messages[messages.length - 1].content;

        try {
            const result = await this.openaiCompatibleComplete(this.config.MODEL, messageInput, shouldReset);
            return result;
        } catch (error) {
            console.error("聊天完成请求出错:", error);
            return { error: "处理过程中发生错误。" };
        }
    }

    /**
     * @method closeConnection
     * @description 关闭 WebSocket 连接并重置状态。
     */
    closeConnection() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.close();
        }
        this.ws = null;
        this.handshakePromise = null;
        this.subscribeId = null;
        this.organizationId = null;
        this.integrationId = null;
        this.isWsConnected = false;
    }
}

const CONFIG = {
    WS_URI: "wss://api.inkeep.com/graphql",
    AUTH_TOKEN: "Bearer ee5b7c15ed3553cd6abc407340aad09ac7cb3b9f76d8613a",
    MODEL: "claude-3-5-sonnet-20241022",
};

let inKeepClient = null; // 单例模式，保持client

/**
* @function AnthropicDoc
* @description 处理Anthropic文档请求的主函数。
* @param {Array} messages - 消息数组。
* @param {boolean} shouldReset - 是否重置会话（默认为false）。
* @returns {Promise<string|null>} - 返回处理结果或null（如果出错）。
*/
export async function AnthropicDoc(messages) {
    if (!inKeepClient) {
        inKeepClient = new InKeepClient(CONFIG);
    }

    // Reset the client if the messages array has only one element
    const shouldResetForMessageCount = messages.length === 1;
    const resetFlag = shouldResetForMessageCount;

    console.log(resetFlag)
    const req = {
        model: CONFIG.MODEL,
        messages
    };

    try {
        const result = await inKeepClient.chatCompletions(req, resetFlag);
        return result?.trim();
    } catch (error) {
        console.error("调用 chatCompletions 出错:", error);
        return null;
    } finally {
        if (resetFlag) {
            inKeepClient.closeConnection();
            inKeepClient = null; // 重置单例
        }
    }
}
