import { AbstractTool } from './AbstractTool.js';

/**
 * 禁言工具类，用于对群聊中的用户进行禁言操作
 */
export class JinyanTool extends AbstractTool {
  constructor() {
    super();
    this.name = 'jinyanTool';
    this.description = '对群聊中的用户进行禁言/解禁操作';
    this.parameters = {
      type: "object",
      properties: {
        target: {
          type: 'array',
          items: {
            type: 'string'
          },
          description: '目标用户的QQ号、群名片或昵称数组，支持单个或多个用户'
        },
        time: {
          type: 'number',
          description: '禁言时长(秒)。0表示解除禁言，默认300秒',
          default: 300
        },
        random: {
          type: 'boolean',
          description: '是否随机选择群成员操作',
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
      required: ['senderRole']
    };
  }

  /**
   * 查找群成员
   * @param {string} target - 目标用户的QQ号或名称
   * @param {Map} members - 群成员Map
   * @returns {Object|null} - 找到的成员信息或null
   */
  findMember(target, members) {
    // 首先尝试作为QQ号查找
    if (/^\d+$/.test(target)) {
      const member = members.get(Number(target));
      if (member) return { qq: Number(target), info: member };
    }

    // 按群名片或昵称查找
    for (const [qq, info] of members.entries()) {
      const card = info.card?.toLowerCase();
      const nickname = info.nickname?.toLowerCase();
      const searchTarget = target.toLowerCase();
      
      if (card === searchTarget || nickname === searchTarget ||
          card?.includes(searchTarget) || nickname?.includes(searchTarget)) {
        return { qq, info };
      }
    }
    return null;
  }

  /**
   * 获取被禁言的成员列表
   * @param {Map} members - 群成员Map
   * @returns {Array} - 被禁言成员数组
   */
  getMutedMembers(members) {
    return Array.from(members.entries())
      .filter(([_, member]) => member.shutup_time > 0)
      .map(([qq, info]) => ({
        qq,
        info,
        muteTimeLeft: info.shutup_time
      }));
  }

  /**
   * 执行禁言操作
   * @param {Object} opts - 参数选项
   * @param {Object} e - 事件对象
   * @returns {Promise<Object|string>} - 操作结果或错误信息
   */
  async func(opts, e) {
    console.log('禁言操作参数:', opts);
    const {
      target,
      time = 300,
      random = false,
      senderRole,
      confirm = false
    } = opts;

    // 统一处理时间，任何0或负数都视为解禁
    const muteTime = time <= 0 ? 0 : Math.min(time, 86400 * 30);
    const isUnmute = muteTime === 0;
    const operationType = isUnmute ? '解禁' : '禁言';

    const groupId = e.group_id;

    // 权限检查
    if (!['owner', 'admin'].includes(senderRole)) {
      return '只有群主或管理员才能执行禁言操作';
    }

    // 获取群对象
    let group;
    try {
      group = e.group || await Bot.pickGroup(groupId);
    } catch (error) {
      console.error('获取群信息失败:', error);
      return `未找到群 ${groupId}`;
    }

    try {
      const members = await group.getMemberMap();
      
      // 检查机器人权限
      const botMember = members.get(Bot.uin);
      if (botMember?.role === 'member') {
        return `失败了，我在这个群聊 ${groupId} 没有权限${operationType}别人`;
      }

      // 处理全体禁言
      if (target === 'all') {
        if (!confirm && !isUnmute) {
          return '执行全体禁言需要额外确认，请添加 confirm 参数';
        }
        await group.muteAll(muteTime);
        return {
          action: isUnmute ? 'unmuteAll' : 'muteAll',
          time: muteTime,
          groupName: group.name || groupId,
          message: `已${isUnmute ? '解除' : '开启'}全体禁言`
        };
      }

      // 处理随机操作
      if (!target || random) {
        return await this.handleRandomOperation(e, group, members, muteTime);
      }

      // 处理指定目标操作
      const targets = Array.isArray(target) ? target : [target];
      const results = await this.handleBatchOperation(targets, group, members, muteTime);

      // 统计成功和失败数量
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      return {
        action: isUnmute ? 'unmute' : 'mute',
        results,
        groupName: group.name || groupId,
        time: muteTime,
        summary: {
          total: targets.length,
          success: successCount,
          fail: failCount
        },
        message: `${operationType}操作完成，成功${successCount}个，失败${failCount}个`
      };

    } catch (error) {
      console.error(`${operationType}操作失败:`, error);
      return `${operationType}操作失败: ${error.message}`;
    }
  }

  /**
   * 处理随机操作（禁言或解禁）
   * @param {Object} e - 事件对象
   * @param {Object} group - 群对象
   * @param {Map} members - 群成员Map
   * @param {number} muteTime - 禁言时长
   * @returns {Promise<Object>} - 操作结果
   */
  async handleRandomOperation(e, group, members, muteTime) {
    const isUnmute = muteTime === 0;
    let availableMembers;

    if (isUnmute) {
      // 解禁模式：获取当前被禁言的成员
      const mutedMembers = this.getMutedMembers(members);
      if (mutedMembers.length === 0) {
        return '群内没有被禁言的成员';
      }
      availableMembers = mutedMembers.map(({ qq, info }) => [qq, info]);
    } else {
      // 禁言模式：获取可以被禁言的普通成员
      availableMembers = Array.from(members.entries())
        .filter(([id, member]) =>
          id !== Bot.uin &&
          member.role === 'member' &&
          id !== e.sender.user_id
        );
      
      if (availableMembers.length === 0) {
        return '群内没有可禁言的普通成员';
      }
    }

    // 随机选择一个成员
    const randomIndex = Math.floor(Math.random() * availableMembers.length);
    const [targetQQ, targetMember] = availableMembers[randomIndex];

    try {
      await group.muteMember(targetQQ, muteTime);
      return {
        action: isUnmute ? 'unmute' : 'mute',
        targetQQ,
        targetName: targetMember.card || targetMember.nickname,
        groupName: group.name || group.group_id,
        time: muteTime,
        isRandom: true,
        success: true,
        message: `已随机${isUnmute ? '解禁' : '禁言'}成员：${targetMember.card || targetMember.nickname}`,
        muteTimeLeft: isUnmute ? 0 : muteTime
      };
    } catch (error) {
      return {
        action: isUnmute ? 'unmute' : 'mute',
        targetQQ,
        targetName: targetMember.card || targetMember.nickname,
        isRandom: true,
        success: false,
        reason: error.message
      };
    }
  }

  /**
   * 处理批量操作（禁言或解禁）
   * @param {string[]} targets - 目标用户数组
   * @param {Object} group - 群对象
   * @param {Map} members - 群成员Map
   * @param {number} muteTime - 禁言时长
   * @returns {Promise<Array>} - 操作结果数组
   */
  async handleBatchOperation(targets, group, members, muteTime) {
    const isUnmute = muteTime === 0;
    const results = [];

    for (const target of targets) {
      const foundMember = this.findMember(target, members);
      
      if (!foundMember) {
        results.push({
          target,
          success: false,
          reason: '未找到该用户'
        });
        continue;
      }

      const { qq: targetQQ, info: targetMember } = foundMember;

      // 检查目标成员状态
      if (isUnmute) {
        // 解禁时检查是否处于禁言状态
        if (targetMember.shutup_time === 0) {
          results.push({
            target,
            targetQQ,
            targetName: targetMember.card || targetMember.nickname,
            success: false,
            reason: '该用户未被禁言'
          });
          continue;
        }
      } else {
        // 禁言时检查权限
        if (['owner', 'admin'].includes(targetMember.role)) {
          results.push({
            target,
            targetQQ,
            targetName: targetMember.card || targetMember.nickname,
            success: false,
            reason: '无法禁言群主或管理员'
          });
          continue;
        }
      }

      try {
        await group.muteMember(targetQQ, muteTime);
        results.push({
          target,
          targetQQ,
          targetName: targetMember.card || targetMember.nickname,
          success: true,
          message: `已${isUnmute ? '解禁' : '禁言'}`,
          muteTimeLeft: isUnmute ? 0 : muteTime
        });
      } catch (error) {
        results.push({
          target,
          targetQQ,
          targetName: targetMember.card || targetMember.nickname,
          success: false,
          reason: error.message
        });
      }
    }

    return results;
  }
}