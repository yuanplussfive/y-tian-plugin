import { MessageManager } from '../utils/MessageManager.js'

export class MessageRecordPlugin extends plugin {
    constructor() {
        super({
            name: '消息记录',
            dsc: '记录群聊和私聊消息',
            event: 'message',
            priority: -Infinity,
            /** 添加必要的配置项 */
            task: {
                name: 'messageRecord',
                fnc: () => { },
                cron: ''
            },
            rule: [
                {
                    reg: '^#查看(群聊|私聊)记录\\s*(\\d+)?',
                    fnc: 'showHistory'
                },
                {
                    reg: '^#清除(群聊|私聊)记录',
                    fnc: 'clearHistory'
                },
                {
                    reg: '.*',
                    fnc: 'onMessage',
                    log: false
                }
            ]
        });

        this.messageManager = new MessageManager();
    }

    async onMessage(e) {
        await this.messageManager.recordMessage(e);
        return false;
    }

    async showHistory(e) {
        const type = e.msg.includes('群聊') ? 'group' : 'private';
        const match = e.msg.match(/(\d+)/);
        let id;

        if (match) {
            id = parseInt(match[1]);
        } else {
            id = type === 'group' ? e.group_id : e.user_id;
        }

        // 权限检查
        if (type === 'group' && !e.group) {
            e.reply('请在群聊中使用群聊记录查询功能');
            return;
        }

        try {
            const messages = await this.messageManager.getMessages(type, id, 20);

            if (!messages || messages.length === 0) {
                await e.reply('暂无消息记录');
                return;
            }

            const forwardMsgs = messages.map(msg => ({
                user_id: msg.sender.user_id,
                nickname: msg.sender.nickname,
                message: `${msg.content}\n${msg.time}`
            }));

            const Summary = type === 'group'
                ? await e.group.makeForwardMsg(forwardMsgs)
                : await e.friend.makeForwardMsg(forwardMsgs);

            await e.reply(Summary);

            await e.reply(Summary);
        } catch (error) {
            logger.error(`获取消息记录失败: ${error}`);
            await e.reply('获取消息记录失败，请查看控制台日志');
        }
    }


    /**
     * 清除消息历史记录
     * @param {Object} e 事件对象
     */
    async clearHistory(e) {
        const type = e.msg.includes('群聊') ? 'group' : 'private';

        if (!e.isMaster) {
            e.reply('只有主人才能清除消息记录哦~');
            return;
        }

        const id = type === 'group' ? e.group_id : e.user_id;

        try {
            await this.messageManager.clearMessages(type, id);
            e.reply(`已清除${type === 'group' ? '群聊' : '私聊'}消息记录`);
        } catch (error) {
            logger.error(`清除消息记录失败: ${error}`);
            e.reply('清除消息记录失败，请查看控制台日志');
        }
    }
}