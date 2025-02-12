import { dependencies } from "../YTdependence/dependencies.js";
const { path, axios, common } = dependencies;
import { exec, execSync } from 'child_process';
import dotenv from 'dotenv';
import fs from 'fs';

export class YTSystem extends plugin {
  constructor() {
    super({
      name: "阴天服务端",
      dsc: "管理阴天服务端",
      event: "message",
      priority: 1000,
      rule: [
        {
          reg: "^#*阴天(插件)?(启动|开启)服务端$",
          fnc: "RunServer",
          permission: "master",
          isPrivate: true
        },
        {
          reg: "^#*阴天(插件)?(关闭|停止)服务端$",
          fnc: "StopServer", 
          permission: "master",
          isPrivate: true
        },
        {
          reg: "^#*阴天服务端状态$",
          fnc: "CheckStatus",
          permission: "master",
          isPrivate: true
        }
      ]
    })

    // 加载环境变量
    dotenv.config({ path: path.join(process.cwd(), 'plugins/y-tian-plugin/.env') })
    this.pluginPath = path.join(process.cwd(), 'plugins/y-tian-plugin')
    this.apiBaseUrl = 'http://localhost'
    this.defaultPort = process.env.PORT || 7799
    
    // 初始化时获取npm路径
    this.npmPath = this.getNpmPath()
  }

  // 获取系统npm路径的方法
  getNpmPath() {
    try {
      let npmPath;
      if (process.platform === 'win32') {
        // Windows系统查找npm路径
        const possiblePaths = [
          path.join(process.env.APPDATA, 'npm', 'npm.cmd'),
          path.join(process.env.ProgramFiles, 'nodejs', 'npm.cmd'),
          path.join(process.env['ProgramFiles(x86)'], 'nodejs', 'npm.cmd')
        ]
        
        for (const p of possiblePaths) {
          if (fs.existsSync(p)) {
            npmPath = p
            break
          }
        }
      } else {
        // Linux/Mac系统使用which命令
        npmPath = execSync('which npm', { encoding: 'utf8' }).trim()
      }

      if (!npmPath) {
        throw new Error('未找到npm执行程序')
      }

      // 验证npm是否可用
      execSync(`"${npmPath}" -v`, { encoding: 'utf8' })
      logger.info(`找到npm路径: ${npmPath}`)
      return npmPath
    } catch (error) {
      logger.error(`获取npm路径失败: ${error}`)
      return null
    }
  }

  // 验证npm环境
  async validateNpmEnv() {
    if (!this.npmPath) {
      throw new Error('未找到可用的npm环境，请先安装Node.js和npm')
    }
    
    // 验证插件目录
    if (!fs.existsSync(this.pluginPath)) {
      throw new Error(`插件目录不存在: ${this.pluginPath}`)
    }

    // 验证package.json
    const pkgPath = path.join(this.pluginPath, 'package.json')
    if (!fs.existsSync(pkgPath)) {
      throw new Error('未找到package.json文件')
    }
  }

  async RunServer(e) {
    if (!this.validateCommand(e)) return false

    try {
      await this.validateNpmEnv()
      await e.reply(`等待服务端运行启动...`, true, { recallMsg: 5000 })

      // 设置环境变量
      const env = {
        ...process.env,
        NODE_ENV: 'development',
        PORT: this.defaultPort
      }

      // 使用完整npm路径执行命令
      exec(`"${this.npmPath}" run dev`, {
        cwd: this.pluginPath,
        env,
        shell: true
      }, async (error, stdout, stderr) => {
        if (error) {
          await e.reply(`启动失败: ${error.message}`)
          return
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const { port, internalIp, publicIp } = await this.getServerPort()
        const forwardMsg = []
        await e.reply(`阴天服务端启动成功!`)
        forwardMsg.push(`本机访问地址: \n${this.apiBaseUrl}:${port}`)
        forwardMsg.push(`内网访问地址: \n${internalIp}`)
        forwardMsg.push(`公网访问地址: \n${publicIp}`)
        forwardMsg.push(`逆转api模型: \n${this.apiBaseUrl}:${port}/v1/models`)
        forwardMsg.push(`逆转api端点: \n${this.apiBaseUrl}:${port}/v1/chat/completions`)
        await e.reply(await common.makeForwardMsg(e, forwardMsg, '阴天服务端详情'))

        if (stderr) {
          logger.warn(`启动警告: ${stderr}`)
        }
      })
    } catch(err) {
      logger.error(`启动服务端错误:${err}`)
      await e.reply(`启动出错:${err.message}`)
      return false
    }

    return true
  }

  async StopServer(e) {
    if (!this.validateCommand(e)) return false

    try {
      await this.validateNpmEnv()
      const { port } = await this.getServerPort()
      const isRunning = await this.isServerRunning(port)
      if (!isRunning) {
        await e.reply('服务端当前未运行')
        return false
      }

      exec(`"${this.npmPath}" run stop`, {
        cwd: this.pluginPath,
        shell: true
      }, async (error, stdout, stderr) => {
        if (error) {
          await e.reply(`停止失败: ${error.message}`)
          return
        }
        if (stderr) {
          logger.warn(`停止警告: ${stderr}`)
        }
        await e.reply('阴天服务端已停止运行')
      })
    } catch(err) {
      logger.error(`停止服务端错误:${err}`)
      await e.reply(`停止出错:${err.message}`)
      return false
    }

    return true
  }

  // 其他方法保持不变...
  async getServerPort() {
    try {
      const response = await axios.get(`${this.apiBaseUrl}:${this.defaultPort}/api/server-info`, {
        timeout: 60000
      })
      return response.data
    } catch (error) {
      logger.warn(`获取运行时端口失败，使用配置端口: ${this.defaultPort}`)
      return this.defaultPort
    }
  }

  async CheckStatus(e) {
    if(!this.validateCommand(e)) return false

    try {
      exec('pm2 show api-server', {
        cwd: this.pluginPath
      }, async (error, stdout, stderr) => {
        if (error) {
          await e.reply('获取状态失败,服务可能未运行')
          return
        }
        const status = this.parseStatus(stdout)
        const { port } = await this.getServerPort()
        let statusMsg = `服务端状态:\n${status}`
        statusMsg += `\n服务地址: ${this.apiBaseUrl}:${port}`
        await e.reply(statusMsg)
      })
    } catch(err) {
      logger.error(`检查状态错误:${err}`)
      await e.reply(`检查状态出错:${err.message}`)
      return false
    }

    return true
  }

  parseStatus(output) {
    const lines = output.split('\n')
    const status = {}
    
    for(const line of lines) {
      if(line.includes('status')) {
        status.status = line.split('│')[2]?.trim()
      }
      if(line.includes('memory')) {
        status.memory = line.split('│')[2]?.trim()
      }
      if(line.includes('cpu')) {
        status.cpu = line.split('│')[2]?.trim()
      }
      if(line.includes('uptime')) {
        status.uptime = line.split('│')[2]?.trim()
      }
    }

    return Object.entries(status)
      .map(([k,v]) => `${k}: ${v}`)
      .join('\n')
  }

  async isServerRunning(port) {
    try {
      const response = await axios.get(`${this.apiBaseUrl}:${port}/api/port`, {
        timeout: 2000
      })
      return response.status === 200
    } catch {
      return false
    }
  }

  validateCommand(e) {
    if(!e.isPrivate) {
      e.reply('该命令仅支持私聊使用')
      return false
    }

    if(!e.isMaster) {
      e.reply('你没有权限操作服务端')
      return false
    }

    return true
  }
}