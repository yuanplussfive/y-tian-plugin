import { AbstractTool } from './AbstractTool.js';

/**
 * 禁言工具类，用于对群聊中的用户进行禁言操作
 */
export class JinyanTool extends AbstractTool {
  constructor() {
    super();
    this.name = 'jinyanTool';
    this.description = '对群聊中的用户进行禁言操作';
    this.parameters = {
      type: "object",
      properties: {
        qq: {
          type: 'string',
          description: '目标用户QQ号。使用 "all" 表示全员禁言，留空则随机选择'
        },
        time: {
          type: 'number',
          description: '禁言时长(秒)。0表示解除禁言，默认300秒',
          default: 300
        },
        random: {
          type: 'boolean',
          description: '是否随机选择群成员禁言',
          default: false
        },
        senderRole: {
          type: 'string',
          description: '发送者角色(owner/admin/member)'
        },
        confirm: {
          type: 'boolean',
          description: '是否确认执行全体禁言',
          default: false
        }
      },
      required: ['senderRole']  // 只需要角色是必须的
    };
  }

  /**
   * 执行禁言操作
   * @param {Object} opts - 参数选项
   * @param {Object} e - 事件对象
   * @returns {Promise<Object|string>} - 操作结果或错误信息
   */
  async func(opts, e) {
    const {
      qq,
      time = 300,
      random = false,
      senderRole,
      confirm = false
    } = opts;

    const groupId = e.group_id;

    // 权限检查
    if (!['owner', 'admin'].includes(senderRole)) {
      return '只有群主或管理员才能执行禁言操作';
    }

    // 获取群对象
    let group;
    try {
      group = await e.bot.pickGroup(groupId);
    } catch {
      return `未找到群 ${groupId}`;
    }

    // 处理禁言时长 (最少1分钟，最多30天)
    const muteTime = Math.min(Math.max(time === 0 ? 0 : time, 60), 86400 * 30);

    try {
      // 全体禁言需要特殊确认
      if (qq === 'all') {
        if (!confirm) {
          return '执行全体禁言需要额外确认，请添加 confirm 参数';
        }
        await group.muteAll(muteTime);
        return {
          action: muteTime === 0 ? 'unmuteAll' : 'muteAll',
          time: muteTime,
          groupName: group.name || groupId // 添加群名称
        };
      }

      const members = await group.getMemberMap();

      let targetQQ;
      let targetMember;
      if (!qq || random) {
        const availableMembers = Array.from(members.entries())
          .filter(([id, member]) =>
            id !== e.bot.uin &&
            member.role === 'member' &&
            id !== e.sender.user_id
          );

        if (availableMembers.length === 0) {
          return '群内没有可禁言的普通成员';
        }

        [targetQQ, targetMember] = availableMembers[
          Math.floor(Math.random() * availableMembers.length)
        ];
      } else {
        targetQQ = Number(qq);
        targetMember = members.get(targetQQ);
      }

      if (!targetMember) {
        return `用户 ${targetQQ} 不在群中`;
      }

      // 权限检查
      if (['owner', 'admin'].includes(targetMember.role)) {
        return `无法禁言群主或管理员`;
      }

      // 执行禁言
      await group.muteMember(targetQQ, muteTime);
      return {
        action: muteTime === 0 ? 'unmute' : 'mute',
        targetQQ,
        targetName: targetMember.card || targetMember.nickname, // 添加目标用户昵称
        groupName: group.name || groupId, // 添加群名称
        time: muteTime,
        isRandom: !qq || random
      };

    } catch (error) {
      console.error('禁言操作失败:', error);
      return `禁言操作失败: ${error.message}`;
    }
  }
}