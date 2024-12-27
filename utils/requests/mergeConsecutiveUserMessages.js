/**
 * 合并连续的用户消息
 * @param {Array} messages 消息数组
 * @returns {Array} 处理后的消息数组
 */
export const mergeConsecutiveUserMessages = async (messages) => {
  // 如果messages为空数组则直接返回
  if (!messages.length) return [];

  return messages.reduce((acc, curr, index) => {
    // 创建当前消息的深拷贝
    const currentMsg = JSON.parse(JSON.stringify(curr));

    // 如果当前消息的content是数组,直接添加并跳过处理
    if (Array.isArray(currentMsg.content)) {
      acc.push(currentMsg);
      return acc;
    }

    const prevItem = acc[acc.length - 1]; // 获取累加数组的最后一项

    // 处理system角色转换为user
    if (currentMsg.role === 'system') {
      currentMsg.role = 'user';
    }

    // 如果前一项存在且两项都是user角色且content都不是数组,则合并content
    if (
      prevItem && 
      prevItem.role === 'user' && 
      currentMsg.role === 'user' &&
      !Array.isArray(prevItem.content) &&
      !Array.isArray(currentMsg.content)
    ) {
      // 创建新对象来存储合并后的内容
      prevItem.content = prevItem.content + '\n' + currentMsg.content;
    } else {
      // 不需要合并则直接添加当前项
      acc.push(currentMsg);
    }

    return acc;
  }, []);
}