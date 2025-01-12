import { AbstractTool } from './AbstractTool.js';

/**
 * 戳一戳工具类，用于对群聊中的用户进行戳一戳操作
 */
export class PokeTool extends AbstractTool {
  constructor() {
    super();
    this.name = 'pokeTool';
    this.description = '对群聊中的用户进行戳一戳操作';
    this.parameters = {
      type: "object",
      properties: {
        qq: {
          type: 'string',
          description: '目标用户QQ号。留空则随机选择'
        },
        times: {
          type: 'number',
          description: '戳一戳次数。默认1次，最多10次',
          default: 1
        },
        random: {
          type: 'boolean',
          description: '是否随机选择群成员戳一戳',
          default: false
        }
      }
    };
  }

  /**
   * 执行戳一戳操作
   * @param {Object} opts - 参数选项
   * @param {Object} e - 事件对象
   * @returns {Promise<Object|string>} - 操作结果或错误信息
   */
  async func(opts, e) {
    const { 
      qq,
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
      const members = await group.getMemberMap();

      // 确定目标用户
      let targetQQ;
      // 当 qq 未指定或 random 为 true 时，执行随机选择
      if (!qq || random) {
        // 获取所有可被戳的成员
        const availableMembers = Array.from(members.keys())
          .filter(id => {
            return id !== Bot.uin && 
                   id !== e.sender.user_id; // 不包括机器人自己和发送者
          });
        
        if (availableMembers.length === 0) {
          return '群内没有可戳的成员';
        }
        
        // 从可用成员中随机选择
        targetQQ = availableMembers[Math.floor(Math.random() * availableMembers.length)];
      } else {
        targetQQ = qq;
      }
      
      const targetMember = members.get(Number(targetQQ));
      if (!targetMember) {
        return `用户 ${targetQQ} 不在群中`;
      }

      // 限制戳一戳次数
      const pokeCount = Math.min(Math.max(1, times), 10);

      // 执行戳一戳
      for (let i = 0; i < pokeCount; i++) {
        await group.pokeMember(targetQQ).catch(err => {
          return { error: err };
      });
        // 多次戳一戳时添加延迟
        if (i < pokeCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      console.log(targetQQ, times)
      return {
        action: 'poke',
        targetQQ,
        times: pokeCount,
        isRandom: !qq || random
      };

    } catch (error) {
      console.error('戳一戳操作失败:', error);
      return `戳一戳操作失败: ${error.message}`;
    }
  }
}