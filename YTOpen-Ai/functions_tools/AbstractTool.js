/**
 * 抽象工具类，所有具体工具需继承此类并实现func方法
 */
export class AbstractTool {
  constructor() {
    this.name = '';
    this.parameters = {
      type: 'object',
      properties: {},
      required: []
    };
    this.description = '';
  }

  /**
   * 验证参数是否符合工具的要求
   * @param {Object} params - 参数对象
   * @returns {boolean|string} - 如果参数有效则返回true，否则返回错误信息
   */
  validateParameters(params) {
    if (!params || typeof params !== 'object') {
      return '参数必须是一个对象';
    }
  
    if (this.parameters.required) {
      for (const required of this.parameters.required) {
        if (!(required in params)) {
          return `缺少必填参数: ${required}`;
        }
      }
    }
  
    const { properties } = this.parameters;
    for (const [key, value] of Object.entries(params)) {
      const schema = properties[key];
      if (!schema) continue;
  
      // 处理数组类型
      if (schema.type === 'array') {
        // 如果输入是字符串，自动转换为单元素数组
        if (typeof value === 'string') {
          params[key] = [value];
          continue;
        }
        
        // 验证是否为数组
        if (!Array.isArray(value)) {
          return `参数 ${key} 类型错误，应为 array`;
        }
  
        // 如果定义了数组元素类型，验证每个元素
        if (schema.items && schema.items.type) {
          const invalidItem = value.find(item => typeof item !== schema.items.type);
          if (invalidItem !== undefined) {
            return `参数 ${key} 的数组元素类型错误，应为 ${schema.items.type}`;
          }
        }
        continue;
      }
  
      // 处理其他类型
      if (schema.type && typeof value !== schema.type) {
        return `参数 ${key} 类型错误，应为 ${schema.type}`;
      }
  
      if (schema.pattern && !new RegExp(schema.pattern).test(String(value))) {
        return `参数 ${key} 格式不正确`;
      }
  
      if (['number', 'integer'].includes(schema.type)) {
        if (schema.minimum !== undefined && value < schema.minimum) {
          return `参数 ${key} 不能小于 ${schema.minimum}`;
        }
        if (schema.maximum !== undefined && value > schema.maximum) {
          return `参数 ${key} 不能大于 ${schema.maximum}`;
        }
      }
    }
  
    return true;
  }

  /**
   * 获取工具的基本信息
   * @returns {Object} - 工具的名称、描述和参数
   */
  getToolInfo() {
    if (!this.name) {
      throw new Error('工具名称是必需的');
    }

    if (!this.description) {
      throw new Error('工具描述是必需的');
    }

    return {
      name: this.name,
      description: this.description,
      parameters: this.parameters
    };
  }

  /**
   * 执行工具的主要方法
   * @param {Object} params - 工具的参数
   * @param {Object} event - 事件对象
   * @returns {Promise<any>} - 工具执行的结果或错误信息
   */
  async execute(params, event) {
    const validation = this.validateParameters(params);
    if (validation !== true) {
      // 返回错误信息而不是抛出错误
      return `error: ${validation}`;
    }
    try {
      return await this.func(params, event);
    } catch (error) {
      // 返回错误信息而不是抛出错误
      return `error: 工具 ${this.name} 执行失败: ${error.message}`;
    }
  }

  /**
   * 工具函数，具体工具需实现
   * @param {Object} opts - 参数选项
   * @param {Object} e - 事件对象
   */
  async func(opts, e) {
    throw new Error('工具函数必须实现');
  }
}