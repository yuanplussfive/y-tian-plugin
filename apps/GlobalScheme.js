import fs from 'fs';
import YAML from 'yaml';

// 配置项映射表
const CONFIG_MAPPINGS = {
  '并发限制': 'pluginSettings.ConcurrentLimit',
  '全局方案': 'pluginSettings.enabled',
  '群聊记录': 'pluginSettings.groupHistory',
  '工具使用': 'pluginSettings.UseTools',
  '回复概率': 'pluginSettings.replyChance',
  '触发前缀': 'pluginSettings.triggerPrefixes',
  '过滤消息': 'pluginSettings.excludeMessageTypes',
  '白名单群组': 'pluginSettings.allowedGroups',
  '白名单拒绝提示': 'pluginSettings.whitelistRejectMsg',
  'API提供商': 'pluginSettings.providers',
  'Gemini密钥': 'pluginSettings.geminiApikey',
  '系统设定': 'pluginSettings.systemContent',
  '绘图模式': 'pluginSettings.ForcedDrawingMode',
  'Gemini模型': 'pluginSettings.geminiModel',
  'Gemini工具选择': 'pluginSettings.gemini_tool_choice',
  'OpenAI工具选择': 'pluginSettings.openai_tool_choice',
  'OneAPI工具选择': 'pluginSettings.oneapi_tool_choice',
  'Gemini工具列表': 'pluginSettings.gemini_tools',
  'OpenAI工具列表': 'pluginSettings.openai_tools',
  'OneAPI工具列表': 'pluginSettings.oneapi_tools',
  'B站Session': 'pluginSettings.bilibiliSessData',
  '即梦SessionID': 'pluginSettings.jimengsessionid',
  'OneAPI代理': 'pluginSettings.OneApiUrl',
  'OneAPI密钥': 'pluginSettings.OneApiKey',
  'GrokUrl': 'pluginSettings.GrokUrl',
  'GrokSSO': 'pluginSettings.GrokSso',
  'Cursor代理': 'pluginSettings.CursorUrl',
  'CursorToken': 'pluginSettings.WorkosCursorSessionToken',
  'OpenAI代理': 'pluginSettings.OpenAiProxy',
  'OpenAI令牌': 'pluginSettings.OpenAiAuthToken',
  'Gemini代理列表': 'pluginSettings.GeminiProxyList',
  'Vega令牌': 'pluginSettings.VegaStoken',
  '代理服务器': 'pluginSettings.ClashProxy'
}

// 数组类型配置项
const ARRAY_CONFIGS = {
  '白名单群组': 'allowedGroups',
  'Gemini密钥': 'geminiApikey',
  '触发前缀': 'triggerPrefixes',
  '过滤消息': 'excludeMessageTypes',
  'Gemini工具列表': 'gemini_tools',
  'OpenAI工具列表': 'openai_tools',
  'OneAPI工具列表': 'oneapi_tools',
  'OneAPI密钥': 'OneApiKey',
  'GrokSSO': 'GrokSso',
  'WorkosCursorToken': 'WorkosCursorSessionToken',
  'Gemini代理列表': 'GeminiProxyList'
}

const VALUE_MAPPINGS = {
  '开启': true,
  '关闭': false,
  '是': true,
  '否': false,
  '启用': true,
  '禁用': false
}

export class PluginConfig extends plugin {
  constructor() {
    super({
      name: '插件配置管理',
      dsc: '管理插件配置文件',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^#全局方案(设置|修改|启用|禁用).*$',
          fnc: 'modifyConfig',
          permission: 'master'
        },
        {
          reg: '^#全局方案(查看|显示).*$',
          fnc: 'showConfig',
          permission: 'master'
        },
        {
          reg: '^#全局方案(添加|删除)(白名单群组|Gemini密钥|触发前缀|过滤消息|Gemini工具列表|OpenAI工具列表|OneAPI工具列表|OneAPI密钥|GrokSSO|WorkosCursorToken|Gemini代理列表).*$',
          fnc: 'modifyArrayConfig',
          permission: 'master'
        },
        {
          reg: '^#全局方案配置帮助$',
          fnc: 'showHelp',
          permission: 'master'
        }
      ]
    })
    this.configPath = './plugins/y-tian-plugin/config/message.yaml';
  }

  async readConfig() {
    try {
      const file = fs.readFileSync(this.configPath, 'utf8')
      return YAML.parse(file)
    } catch (error) {
      logger.error(`读取配置文件失败: ${error}`)
      return null
    }
  }

  async saveConfig(config) {
    try {
      const yamlStr = YAML.stringify(config)
      fs.writeFileSync(this.configPath, yamlStr, 'utf8')
      return true
    } catch (error) {
      logger.error(`保存配置文件失败: ${error}`)
      return false
    }
  }

  async modifyConfig(e) {
    if (!this.e.isMaster) return false
  
    const msg = e.msg.trim()
    let settingName, value
  
    // 区分“启用/禁用”和“设置/修改”
    if (msg.startsWith('#全局方案启用')) {
      settingName = '全局方案'
      value = '启用'
    } else if (msg.startsWith('#全局方案禁用')) {
      settingName = '全局方案'
      value = '禁用'
    } else {
      const cleanedMsg = msg.replace(/^#全局方案(设置|修改)/, '').trim()
      ;[settingName, value] = cleanedMsg.split(/\s+/)
    }
  
    console.log(settingName, value)
    const configPath = CONFIG_MAPPINGS[settingName]
    if (!configPath) {
      e.reply('未找到对应的配置项，请检查设置名称')
      return false
    }
  
    const config = await this.readConfig()
    if (!config) {
      e.reply('读取配置失败')
      return false
    }
  
    try {
      const keys = configPath.split('.')
      let current = config
  
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {}
        }
        current = current[keys[i]]
      }
  
      const lastKey = keys[keys.length - 1]
      let finalValue = VALUE_MAPPINGS[value] ?? value
  
      if (settingName === '并发限制') {
        const numValue = Number(value)
        if (isNaN(numValue) || numValue < 1) {
          e.reply('并发限制必须为大于等于1的数字')
          return false
        }
        finalValue = numValue
      } else if (!isNaN(value)) {
        finalValue = Number(value)
      }
  
      current[lastKey] = finalValue
  
      if (await this.saveConfig(config)) {
        e.reply(`已更新${settingName}的设置`)
      } else {
        e.reply('配置保存失败')
      }
    } catch (error) {
      logger.error(`修改配置失败: ${error}`)
      e.reply('修改配置失败')
    }
  }

  async modifyArrayConfig(e) {
    if (!this.e.isMaster) return false

    const msg = e.msg
    const isAdd = msg.includes('添加')
    const matches = msg.match(/^#全局方案(添加|删除)([\u4e00-\u9fa5a-zA-Z]+)\s*(.+)/)

    if (!matches) {
      e.reply('命令格式错误')
      return false
    }

    const [, action, type, valueStr] = matches
    const configKey = ARRAY_CONFIGS[type]

    if (!configKey) {
      e.reply('未知的配置类型')
      return false
    }

    const values = valueStr.split(/[,，]\s*/).filter(v => v.trim())

    if (values.length === 0) {
      e.reply('请提供要操作的值')
      return false
    }

    const config = await this.readConfig()
    if (!config) {
      e.reply('读取配置失败')
      return false
    }

    try {
      if (!Array.isArray(config.pluginSettings[configKey])) {
        config.pluginSettings[configKey] = []
      }

      if (isAdd) {
        values.forEach(value => {
          if (!config.pluginSettings[configKey].includes(value)) {
            config.pluginSettings[configKey].push(value)
          }
        })
      } else {
        config.pluginSettings[configKey] = config.pluginSettings[configKey].filter(
          item => !values.includes(item)
        )
      }

      if (await this.saveConfig(config)) {
        e.reply(`批量${isAdd ? '添加' : '删除'}成功`)
      } else {
        e.reply('保存配置失败')
      }
    } catch (error) {
      logger.error(`修改数组配置失败: ${error}`)
      e.reply('操作失败')
    }
  }

  async showConfig(e) {
    if (!this.e.isMaster) return false

    const msg = e.msg.replace(/^#全局方案(查看|显示)/, '').trim()
    const config = await this.readConfig()

    if (!config) {
      e.reply('读取配置失败')
      return false
    }

    let result
    if (msg) {
      const configPath = CONFIG_MAPPINGS[msg]
      if (!configPath) {
        e.reply('未找到对应的配置项')
        return false
      }

      result = configPath.split('.').reduce((obj, key) => obj && obj[key], config)
    } else {
      result = config
    }

    e.reply(`配置信息：\n${YAML.stringify(result)}`)
  }

  async showHelp(e) {
    const helpMessages = [
      {
        message: '全局方案配置管理器使用帮助\n' +
          '1️⃣ 全局方案基础设置\n' +
          '2️⃣ 全局方案触发与过滤\n' +
          '3️⃣ 全局方案API设置\n' +
          '4️⃣ 全局方案模型与工具\n' +
          '5️⃣ 全局方案代理设置\n' +
          '6️⃣ 全局方案白名单管理'
      },
      {
        message: '1️⃣ 全局方案基础设置\n' +
          '🔸 全局方案：控制插件总开关\n' +
          '#全局方案启用/禁用\n\n' +
          '🔸 群聊记录：是否记录群聊消息\n' +
          '#全局方案设置群聊记录 开启/关闭\n\n' +
          '🔸 工具使用：是否启用AI工具\n' +
          '#全局方案设置工具使用开启/关闭\n\n' +
          '🔸 回复概率：设置随机回复概率\n' +
          '#全局方案设置回复概率 0.01（范围0-1）\n\n'+
          '🔸 并发限制：设置最大并发数（最小1）\n' +
          '#全局方案设置并发限制 10'
      },
      {
        message: '2️⃣ 全局方案触发与过滤\n' +
          '🔸 触发前缀：设置触发AI的前缀\n' +
          '#全局方案添加触发前缀 芙芙\n' +
          '#全局方案删除触发前缀 芙芙\n\n' +
          '🔸 过滤消息：设置需要过滤的消息类型\n' +
          '#全局方案添加过滤消息 图片,视频\n' +
          '#全局方案删除过滤消息 图片'
      },
      {
        message: '3️⃣ 全局方案API设置\n' +
          '🔸 API提供商：设置使用的API类型\n' +
          '#全局方案设置API提供商gemini\n\n' +
          '🔸 Gemini密钥：管理API密钥\n' +
          '#全局方案添加Gemini密钥 xxxxx\n' +
          '#全局方案删除Gemini密钥 xxxxx\n\n' +
          '🔸 系统设定：设置AI人设\n' +
          '#全局方案设置系统设定 你是一个专业的AI助手'
      },
      {
        message: '4️⃣ 全局方案模型与工具\n' +
          '🔸 绘图模式：是否强制使用绘图\n' +
          '#全局方案设置 绘图模式 开启/关闭\n\n' +
          '🔸 Gemini模型：选择模型版本\n' +
          '#全局方案设置Gemini模型gemini-pro\n\n' +
          '🔸 工具选择与列表配置：\n' +
          '#全局方案设置Gemini工具选择 auto/none...\n' +
          '#全局方案添加Gemini工具列表 xxx,xxx\n' +
          '#全局方案添加OpenAI工具列表 xxx,xxx\n' +
          '#全局方案添加OneAPI工具列表 xxx,xxx'
      },
      {
        message: ` 以下是当前所有可用工具列表：

- googleImageEditTool  
- noobaiTool  
- recraftTool  
- ideogramTool  
- fluxTool  
- likeTool  
- pokeTool  
- googleImageAnalysisTool  
- bingImageSearchTool  
- emojiSearchTool  
- aiALLTool  
- searchMusicTool  
- searchVideoTool  
- jimengTool  
- aiMindMapTool  
- aiPPTTool  
- jinyanTool  
- webParserTool  
- dalleTool  
- freeSearchTool

`
      },
      {
        message: '5️⃣ 全局方案代理设置\n' +
          '🔸 各平台代理配置：\n' +
          '#全局方案设置OneAPI代理 http://your-proxy.com\n' +
          '#全局方案设置OpenAI代理 http://openai-proxy.com\n' +
          '#全局方案添加Gemini代理列表 http://proxy1.com,http://proxy2.com\n\n' +
          '🔸 全局代理：\n' +
          '#全局方案设置代理服务器 http://127.0.0.1:7890'
      },
      {
        message: '6️⃣ 全局方案白名单管理\n' +
          '🔸 白名单群组：管理允许使用的群\n' +
          '#全局方案添加白名单群组 123456,789012\n' +
          '#全局方案删除白名单群组 123456\n\n' +
          '🔸 白名单拒绝提示：设置拒绝消息\n' +
          '#全局方案设置白名单拒绝提示 该群未授权，请联系管理员'
      },
      {
        message: '📝 全局方案通用命令格式\n' +
          '1. 查看配置：\n' +
          '#全局方案查看xxx\n' +
          '#全局方案查看（显示所有配置）\n\n' +
          '2. 修改配置：\n' +
          '#全局方案设置/修改 配置项 值\n\n' +
          '3. 数组操作：\n' +
          '#全局方案添加/删除 类型 值1,值2...'
      }
    ]

    const forwardMsg = await this.makeForwardMsg(e, helpMessages)
    await this.reply(forwardMsg)
  }

  async makeForwardMsg(e, messages) {
    let userInfo = {
      user_id: this.e.bot.uin,
      nickname: this.e.bot.nickname
    }

    let forwardMsg = []
    for (let msg of messages) {
      forwardMsg.push({
        ...userInfo,
        message: msg.message
      })
    }

    if (e.isGroup) {
      forwardMsg = await e.group.makeForwardMsg(forwardMsg)
    } else {
      forwardMsg = await e.friend.makeForwardMsg(forwardMsg)
    }

    return forwardMsg
  }
}
