import { AbstractTool } from './AbstractTool.js';

/**
 * 戳一戳工具类，用于对群聊中的用户进行戳一戳操作
 */
export class PokeTool extends AbstractTool {
  constructor() {
    super();
    this.name = 'pokeTool';
    this.description = '对群聊中的用户进行戳一戳操作，支持指定用户或随机选择';
    this.parameters = {
      type: 'object',
      properties: {
        target: {
          type: 'array',
          items: {
            type: 'string'
          },
          description: '目标用户的QQ号（如 "1245934"）或群名片/昵称（如 "叶杨"）数组，支持单个或多个用户。每个元素只能是QQ号或名称，不能混合格式（如 "叶杨(QQ号:1245934)" 无效）。'
        },        
        times: {
          type: 'number',
          description: '每个目标的戳一戳次数，默认 1 次，最大 10 次',
          default: 1,
          maximum: 10
        },
        random: {
          type: 'boolean',
          description: '是否随机选择群成员进行戳一戳，默认为 false。启用时忽略 target 参数',
          default: false
        }
      }
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
   * 对单个用户执行戳一戳操作
   * @param {Object} group - 群对象
   * @param {string} target - 目标用户标识（QQ号或名称）
   * @param {Map} members - 群成员Map
   * @param {number} pokeCount - 戳一戳次数
   * @returns {Promise<Object>} - 操作结果
   */
  async pokeSingleUser(group, target, members, pokeCount) {
    const foundMember = this.findMember(target, members);
    
    if (!foundMember) {
      return { 
        target,
        error: `未找到用户 ${target}` 
      };
    }

    const { qq: targetQQ, info: targetMember } = foundMember;
    
    try {
      // 执行指定次数的戳一戳
      for (let i = 0; i < pokeCount; i++) {
        await group.pokeMember(targetQQ);
        // 多次戳一戳时添加延迟
        if (i < pokeCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      return {
        target,
        targetQQ,
        targetName: targetMember.card || targetMember.nickname,
        times: pokeCount,
        success: true
      };
    } catch (error) {
      return {
        target,
        targetQQ,
        targetName: targetMember.card || targetMember.nickname,
        error: error.message
      };
    }
  }

  /**
   * 执行戳一戳操作
   * @param {Object} opts - 参数选项
   * @param {Object} e - 事件对象
   * @returns {Promise<Object|string>} - 操作结果或错误信息
   */
  async func(opts, e) {
    // 解构参数
    const { 
      target,
      times = 1,
      random = false
    } = opts;
    
    const groupId = e.group_id;

    // 获取群对象
    let group;
    try {
      group = await Bot.pickGroup(groupId);
    } catch {
      return `未找到群 ${groupId}`;
    }

    try {
      // 获取群成员列表
      const members = await group.getMemberMap();
      
      // 限制戳一戳次数在1-10次之间
      const pokeCount = Math.min(Math.max(1, times), 10);
      let targets = [];

      // 处理目标用户列表
      if (!target || random) {
        // 随机选择模式：过滤掉机器人自己和发送者
        const availableMembers = Array.from(members.entries())
          .filter(([id, _]) => id !== Bot.uin && id !== e.sender.user_id);
        
        if (availableMembers.length === 0) {
          return '群内没有可戳的成员';
        }
        
        // 随机选择一个目标
        const [randomQQ, randomMember] = availableMembers[
          Math.floor(Math.random() * availableMembers.length)
        ];
        targets = [String(randomQQ)];
      } else {
        // 将输入转换为数组形式
        targets = Array.isArray(target) ? target : [target];
      }

      // 并行执行所有戳一戳操作
      const results = await Promise.all(
        targets.map(async target => {
          return await this.pokeSingleUser(group, target, members, pokeCount);
        })
      );

      // 处理操作结果
      const successResults = results.filter(r => r.success);
      const errorResults = results.filter(r => r.error);

      // 返回操作结果
      return {
        action: 'poke',
        success: {
          count: successResults.length,
          targets: successResults.map(r => ({
            target: r.target,
            qq: r.targetQQ,
            name: r.targetName,
            times: r.times
          }))
        },
        errors: errorResults.map(r => ({
          target: r.target,
          reason: r.error
        })),
        groupName: group.name || groupId,
        isRandom: !target || random
      };

    } catch (error) {
      console.error('戳一戳操作失败:', error);
      return `戳一戳操作失败: ${error.message}`;
    }
  }
}