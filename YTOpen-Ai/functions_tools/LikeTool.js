import { AbstractTool } from './AbstractTool.js';

// LikeTool.js
export class LikeTool extends AbstractTool {
  constructor() {
    super();
    this.name = 'likeTool';
    this.description = '点赞工具';
    this.keywords = ['点赞', '赞', '给赞'];
    this.intent = '用户请求点赞相关的操作，包括给他人点赞或请求他人给自己点赞';
    this.parameters = {
      type: "object",
      properties: {
        qq: {
          type: 'string',
          description: '目标用户QQ号。留空则使用at或发送者QQ'
        },
        count: {
          type: 'number',
          description: '点赞次数(最多10次)',
          default: 1,
          minimum: 1,
          maximum: 10
        },
        random: {
          type: 'boolean',
          description: '是否随机选择成员点赞',
          default: false
        }
      }
    };
    this.cooldown = new Map();
    this.COOLDOWN_TIME = 60000;
  }

  async func(opts, e) {
    const { qq, count = 1, random = false } = opts;
    const MAX_LIKES = 10;  // QQ每天最大点赞次数限制
    // 限制实际点赞次数
    const actualCount = Math.min(count, MAX_LIKES);
    if (count > MAX_LIKES) {
      return {
        status: 'rejected',
        message: `点赞次数超过限制，每次最多只能点${MAX_LIKES}个赞哦`
      };
    }
    try {
      // 确定目标用户
      let targetQQ;

      if (!qq || random) {
        // 如果有at，优先使用at的用户
        if (e.at) {
          targetQQ = e.at;
        } else if (random) {
          // 随机选择一个群成员
          const group = await e.bot.pickGroup(e.group_id);
          const members = await group.getMemberMap();
          const availableMembers = Array.from(members.keys())
            .filter(id => id !== e.bot.uin && id !== e.sender.user_id);

          if (availableMembers.length === 0) {
            return '没有可用的目标用户';
          }

          targetQQ = availableMembers[Math.floor(Math.random() * availableMembers.length)];
        } else {
          // 默认使用发送者QQ
          targetQQ = e.sender.user_id;
        }
      } else {
        targetQQ = qq;
      }

      // 检查冷却
      if (!await this.checkCooldown(targetQQ)) {
        return {
          status: 'CD',
          target: targetQQ
        };
      }

      // 执行点赞
      let successCount = 0;
      for (let i = 0; i < actualCount; i++) {
        let success = await Bot.sendLike(targetQQ, 1);
        if (success) successCount++;
      }

      // 如果请求的点赞数超过限制，在返回消息中说明
      const message = count > MAX_LIKES
        ? `已达到QQ每日点赞上限，最多只能点${MAX_LIKES}个赞哦`
        : undefined;

      return {
        status: 'success',
        target: targetQQ,
        count: successCount,
        isRandom: random,
        message
      };

    } catch (error) {
      logger.error(`[LikeTool] 点赞失败: ${error}`);
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  async checkCooldown(userId) {
    const lastUse = this.cooldown.get(userId);
    if (lastUse && Date.now() - lastUse < this.COOLDOWN_TIME) {
      return false;
    }
    this.cooldown.set(userId, Date.now());
    return true;
  }
}