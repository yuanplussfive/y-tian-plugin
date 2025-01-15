import { MessageManager } from './MessageManager.js';

export function extend() {
    // 确保 MessageManager 实例存在
    if (!global.MessageManager) {
        global.MessageManager = new MessageManager();
    }

    // 扩展原始的 reply 方法
    const originalReply = Object.getPrototypeOf(Bot).reply;
    
    // 修改 Yunzai 的 Reply 处理
    if (Bot.emit) {
        const originalEmit = Bot.emit;
        Bot.emit = async function(event, e, ...args) {
            // 如果是 reply 事件
            if (event === 'reply') {
                try {
                    const content = args[0];
                    // 构造消息对象
                    const messageObj = {
                        message_type: e.message_type || 'private',
                        group_id: e.group_id,
                        time: Math.floor(Date.now() / 1000),
                        message: Array.isArray(content) ? content : [{ type: 'text', text: content }],
                        source: 'send',
                        self_id: Bot.uin,
                        sender: {
                            user_id: Bot.uin,
                            nickname: Bot.nickname,
                            card: Bot.nickname,
                            role: 'member'
                        }
                    };
                    
                    // 记录消息
                    await global.MessageManager.recordMessage(messageObj);
                } catch (error) {
                    logger.error('[MessageRecord] 记录Bot消息失败：', error);
                }
            }
            
            // 调用原始的 emit 方法
            return originalEmit.call(this, event, e, ...args);
        };
    }
}
