import { AbstractTool } from './AbstractTool.js';
import { callGeminiAPI, handleGeminiResult, handleGeminiImage } from "../../YTOpen-Ai/GeminiAPI.js";

/**
 * 头像处理工具类，用于对群聊中用户头像进行AI处理
 */
export class AvatarProcessTool extends AbstractTool {
  constructor() {
    super();
    this.name = 'avatarProcessTool';
    this.description = '对群聊用户头像进行处理和生成/编辑等等, 如果用户表示需要处理/提及头像, 就使用此工具, 比如: "把我的头像头发改成白色"';
    this.parameters = {
      type: 'object',
      required: ['prompt', 'targets', 'random'],
      properties: {
        targets: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              qq: {
                type: 'string',
                description: '目标用户的QQ号'
              },
              name: {
                type: 'string',
                description: '目标用户的群名片或昵称'
              }
            }
          },
          description: '目标用户列表。每个用户包含QQ号或群名片/昵称信息'
        },
        prompt: {
          type: 'string',
          description: '对头像进行处理的AI提示词，描述想要达到的效果',
          example: '转换成二次元风格, 添加赛博朋克效果'
        },
        random: {
          type: 'boolean',
          description: '是否随机选择群成员进行头像处理',
          default: false
        }
      }
    };
  }

  /**
   * 查找群成员
   * @param {Object} target - 目标用户信息对象
   * @param {Map} members - 群成员Map
   * @returns {Object|null} - 找到的成员信息或null
   */
  findMember(target, members) {
    // 如果提供了QQ号，优先使用QQ号查找
    if (target.qq && /^\d+$/.test(target.qq)) {
      const member = members.get(Number(target.qq));
      if (member) return { qq: Number(target.qq), info: member };
    }

    // 如果提供了名称，按群名片或昵称查找
    if (target.name) {
      const searchName = target.name.toLowerCase();
      for (const [qq, info] of members.entries()) {
        const card = info.card?.toLowerCase();
        const nickname = info.nickname?.toLowerCase();
        
        if (card === searchName || nickname === searchName ||
            card?.includes(searchName) || nickname?.includes(searchName)) {
          return { qq, info };
        }
      }
    }
    return null;
  }

  /**
   * 处理单个用户头像
   * @param {Object} group - 群对象
   * @param {Object} target - 目标用户信息
   * @param {Map} members - 群成员Map
   * @param {string} prompt - AI处理提示词
   * @returns {Promise<Object>} - 处理结果
   */
  async processAvatar(e, target, members, prompt) {
    const foundMember = this.findMember(target, members);
    
    if (!foundMember) {
      return { 
        target,
        error: `未找到用户 ${target.qq || target.name}` 
      };
    }

    const { qq: targetQQ, info: targetMember } = foundMember;
    
    try {
      // 获取用户头像URL
      const avatarUrl = `https://q1.qlogo.cn/g?b=qq&nk=${targetQQ}&s=640`;
      console.log(avatarUrl)
      const result = await callGeminiAPI(prompt, [avatarUrl], {
        model: "gemini-2.0-flash-exp-image-generation",
        responseModalities: ['TEXT', 'IMAGE'],
        config: {
          temperature: 0.8
        }
      });
      const output = await handleGeminiImage(result, e);
      console.log(output);


      return {
        target: target.qq || target.name,
        targetQQ,
        targetName: targetMember.card || targetMember.nickname,
        originalAvatar: avatarUrl,
        prompt,
        processedAvatar: avatarUrl,
        success: true
      };
    } catch (error) {
      return {
        target: target.qq || target.name,
        targetQQ,
        targetName: targetMember.card || targetMember.nickname,
        error: error.message
      };
    }
  }

  /**
   * 执行头像处理
   * @param {Object} opts - 参数选项
   * @param {Object} e - 事件对象
   * @returns {Promise<Object|string>} - 处理结果或错误信息
   */
  async func(opts, e) {
    // 解构参数
    const { 
      targets,
      prompt,
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
      let targetList = [];

      // 处理目标用户列表
      if (random) {
        // 随机选择模式：过滤掉机器人自己和发送者
        const availableMembers = Array.from(members.entries())
          .filter(([id, _]) => id !== Bot.uin && id !== e.sender.user_id);
        
        if (availableMembers.length === 0) {
          return '群内没有可处理头像的成员';
        }
        
        // 随机选择一个目标
        const [randomQQ, randomMember] = availableMembers[
          Math.floor(Math.random() * availableMembers.length)
        ];
        targetList = [{
          qq: String(randomQQ),
          name: randomMember.card || randomMember.nickname
        }];
      } else {
        targetList = targets;
      }

      // 并行处理所有目标用户的头像
      const results = await Promise.all(
        targetList.map(async target => {
          return await this.processAvatar(e, target, members, prompt);
        })
      );

      // 处理操作结果
      const successResults = results.filter(r => r.success);
      const errorResults = results.filter(r => r.error);

      // 返回处理结果
      return {
        action: 'avatarProcess',
        prompt,
        success: {
          count: successResults.length,
          targets: successResults.map(r => ({
            target: r.target,
            qq: r.targetQQ,
            name: r.targetName,
            originalAvatar: r.originalAvatar,
            processedAvatar: r.processedAvatar
          }))
        },
        errors: errorResults.map(r => ({
          target: r.target,
          reason: r.error
        })),
        groupName: group.name || groupId,
        isRandom: random
      };

    } catch (error) {
      console.error('头像处理操作失败:', error);
      return `头像处理操作失败: ${error.message}`;
    }
  }
}