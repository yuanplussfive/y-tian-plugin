import { MessageManager } from '../utils/MessageManager.js'

export class MessageRecordPlugin extends plugin {
    constructor() {
        super({
            name: '消息记录',
            dsc: '记录群聊和私聊消息',
            event: 'message',
            priority: -Infinity,
            task: {
                name: 'messageRecord',
                fnc: () => {},
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
}