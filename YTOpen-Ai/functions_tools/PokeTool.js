import { AbstractTool } from './AbstractTool.js';

/**
 * 戳一戳工具类，用于对群聊中的用户进行戳一戳操作
 * 适配napcat-onebotv11版本
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
   * 调用OneBotv11 API
   * @param {string} action - API动作名称
   * @param {Object} params - 参数对象
   * @returns {Promise<Object>} - API响应结果
   */
  async callApi(action, params = {}) {
    try {
      // 假设有全局的bot实例，根据实际情况调整
      if (typeof Bot !== 'undefined' && Bot.sendApi) {
        return await Bot.sendApi(action, params);
      } else if (typeof global.bot !== 'undefined' && global.bot.sendApi) {
        return await global.bot.sendApi(action, params);
      } else {
        throw new Error('找不到OneBotv11 API调用接口');
      }
    } catch (error) {
      console.error(`调用API ${action} 失败:`, error);
      throw error;
    }
  }

  /**
   * 获取群成员列表
   * @param {number} groupId - 群号
   * @returns {Promise<Array>} - 群成员列表
   */
  async getGroupMemberList(groupId) {
    try {
      const response = await this.callApi('get_group_member_list', {
        group_id: groupId
      });
      
      if (response.status === 'ok' && response.data) {
        return response.data;
      } else {
        throw new Error('获取群成员列表失败');
      }
    } catch (error) {
      console.error('获取群成员列表失败:', error);
      throw error;
    }
  }

  /**
   * 发送戳一戳
   * @param {number} groupId - 群号
   * @param {number} userId - 用户QQ号
   * @returns {Promise<boolean>} - 是否成功
   */
  async sendGroupPoke(groupId, userId) {
    try {
      // 尝试使用标准的戳一戳API
      let response;
      try {
        response = await this.callApi('send_group_poke', {
          group_id: groupId,
          user_id: userId
        });
      } catch (e) {
        // 如果标准API不支持，尝试其他可能的API名称
        try {
          response = await this.callApi('group_poke', {
            group_id: groupId,
            user_id: userId
          });
        } catch (e2) {
          // 如果都不支持，使用发送特殊消息的方式
          response = await this.callApi('send_group_msg', {
            group_id: groupId,
            message: [
              {
                type: 'poke',
                data: {
                  qq: userId
                }
              }
            ]
          });
        }
      }
      
      return response.status === 'ok';
    } catch (error) {
      console.error('发送戳一戳失败:', error);
      return false;
    }
  }

  /**
   * 查找群成员
   * @param {string} target - 目标用户的QQ号或名称
   * @param {Array} members - 群成员数组
   * @returns {Object|null} - 找到的成员信息或null
   */
  findMember(target, members) {
    // 首先尝试作为QQ号查找
    if (/^\d+$/.test(target)) {
      const member = members.find(m => m.user_id === Number(target));
      if (member) return member;
    }

    // 按群名片或昵称查找
    const searchTarget = target.toLowerCase();
    return members.find(member => {
      const card = member.card?.toLowerCase() || '';
      const nickname = member.nickname?.toLowerCase() || '';
      
      return card === searchTarget || nickname === searchTarget ||
             card.includes(searchTarget) || nickname.includes(searchTarget);
    });
  }

  /**
   * 对单个用户执行戳一戳操作
   * @param {number} groupId - 群号
   * @param {string} target - 目标用户标识（QQ号或名称）
   * @param {Array} members - 群成员数组
   * @param {number} pokeCount - 戳一戳次数
   * @returns {Promise<Object>} - 操作结果
   */
  async pokeSingleUser(groupId, target, members, pokeCount) {
    const foundMember = this.findMember(target, members);
    
    if (!foundMember) {
      return { 
        target,
        error: `未找到用户 ${target}` 
      };
    }

    const targetQQ = foundMember.user_id;
    const targetName = foundMember.card || foundMember.nickname;
    
    try {
      let successCount = 0;
      
      // 执行指定次数的戳一戳
      for (let i = 0; i < pokeCount; i++) {
        const success = await this.sendGroupPoke(groupId, targetQQ);
        if (success) {
          successCount++;
        }
        
        // 多次戳一戳时添加延迟
        if (i < pokeCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      return {
        target,
        targetQQ,
        targetName,
        times: successCount,
        requestedTimes: pokeCount,
        success: successCount > 0
      };
    } catch (error) {
      return {
        target,
        targetQQ,
        targetName,
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
    
    if (!groupId) {
      return '此功能仅支持群聊使用';
    }

    try {
      // 获取群成员列表
      const members = await this.getGroupMemberList(groupId);
      
      if (!members || members.length === 0) {
        return '获取群成员列表失败';
      }
      
      // 限制戳一戳次数在1-10次之间
      const pokeCount = Math.min(Math.max(1, times), 10);
      let targets = [];

      // 处理目标用户列表
      if (!target || random) {
        // 随机选择模式：过滤掉机器人自己和发送者
        const selfId = e.self_id || Bot?.uin;
        const availableMembers = members.filter(member => 
          member.user_id !== selfId && member.user_id !== e.user_id
        );
        
        if (availableMembers.length === 0) {
          return '群内没有可戳的成员';
        }
        
        // 随机选择一个目标
        const randomMember = availableMembers[
          Math.floor(Math.random() * availableMembers.length)
        ];
        targets = [String(randomMember.user_id)];
      } else {
        // 将输入转换为数组形式
        targets = Array.isArray(target) ? target : [target];
      }

      // 并行执行所有戳一戳操作
      const results = await Promise.all(
        targets.map(async target => {
          return await this.pokeSingleUser(groupId, target, members, pokeCount);
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
            times: r.times,
            requestedTimes: r.requestedTimes
          }))
        },
        errors: errorResults.map(r => ({
          target: r.target,
          reason: r.error
        })),
        groupId: groupId,
        isRandom: !target || random
      };

    } catch (error) {
      console.error('戳一戳操作失败:', error);
      return `戳一戳操作失败: ${error.message}`;
    }
  }
}