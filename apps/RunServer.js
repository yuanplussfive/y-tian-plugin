import { dependencies } from "../YTdependence/dependencies.js";
const { path, axios, common } = dependencies;
import { exec, execSync } from 'child_process';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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

    // 获取当前文件的目录路径
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    // 插件根目录路径
    this.pluginPath = path.join(__dirname, '../');

    // 加载环境变量
    dotenv.config({ path: path.join(this.pluginPath, '.env') });

    this.apiBaseUrl = 'http://localhost';
    this.defaultPort = process.env.PORT || 7799;
    this.npmPath = null;
    this.npmRetryCount = 0;
    this.maxRetries = 3;

    // 初始化npm环境
    this.initNpmEnvironment();
  }

  // 初始化npm环境
  async initNpmEnvironment() {
    try {
      // 首次尝试获取npm路径
      this.npmPath = await this.findNpmPath();
      if (!this.npmPath) {
        throw new Error('未找到npm路径');
      }
      //logger.info('[阴天插件] NPM环境初始化成功');
    } catch (error) {
      //logger.error(`[阴天插件] NPM环境初始化失败: ${error}`);
      // 启动重试机制
      this.retryNpmInit();
    }
  }

  // NPM初始化重试机制
  async retryNpmInit() {
    if (this.npmRetryCount < this.maxRetries) {
      this.npmRetryCount++;
      logger.info(`[阴天插件] 正在进行第${this.npmRetryCount}次重试...`);
      setTimeout(() => this.initNpmEnvironment(), 2000 * this.npmRetryCount);
    } else {
      logger.error('[阴天插件] NPM环境初始化最终失败，请检查系统环境');
    }
  }

  // 查找npm路径的改进方法
  async findNpmPath() {
    try {
      if (process.platform === 'win32') {
        // Windows系统下查找npm
        const npmCmd = 'where npm';
        const result = execSync(npmCmd, { encoding: 'utf8', shell: true });
        const paths = result.split('\n').map(p => p.trim()).filter(Boolean);
        return paths[0]; // 返回第一个找到的路径
      } else {
        // Linux/Mac系统下查找npm
        const npmPath = execSync('which npm', { encoding: 'utf8', shell: true }).trim();
        return npmPath;
      }
    } catch (error) {
      logger.error(`[阴天插件] 查找npm路径失败: ${error}`);
      return null;
    }
  }

  // 执行命令的封装方法
  executeCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      const defaultOptions = {
        cwd: this.pluginPath,
        shell: true,
        env: { ...process.env }
      };

      const finalOptions = { ...defaultOptions, ...options };

      exec(command, finalOptions, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        resolve({ stdout, stderr });
      });
    });
  }

  async RunServer(e) {
    if (!this.validateCommand(e)) return false;

    try {
      await this.validateNpmEnv();
      await e.reply('等待服务端启动...', true, { recallMsg: 5000 });

      const env = {
        ...process.env,
        NODE_ENV: 'development',
        PORT: this.defaultPort
      };

      const { stdout, stderr } = await this.executeCommand(`"${this.npmPath}" run dev`, { env });

      // 等待服务启动
      await new Promise(resolve => setTimeout(resolve, 2000));

      const { port, internalIp, publicIp } = await this.getServerPort();
      const forwardMsg = [
        `本机访问地址: \n${this.apiBaseUrl}:${port}`,
        `内网访问地址: \n${internalIp}`,
        `公网访问地址: \n${publicIp}`,
        `逆转api模型: \n${this.apiBaseUrl}:${port}/v1/models`,
        `逆转api端点: \n${this.apiBaseUrl}:${port}/v1/chat/completions`
      ];

      await e.reply('阴天服务端启动成功!');
      await e.reply(await common.makeForwardMsg(e, forwardMsg, '阴天服务端详情'));

      if (stderr) {
        logger.warn(`[阴天插件] 启动警告: ${stderr}`);
      }

      return true;
    } catch (error) {
      logger.error(`[阴天插件] 启动服务端错误: ${error}`);
      await e.reply(`启动失败: ${error.message}`);
      return false;
    }
  }

  async StopServer(e) {
    if (!this.validateCommand(e)) return false;

    try {
      await this.validateNpmEnv();
      const { port } = await this.getServerPort();
      const isRunning = await this.isServerRunning(port);

      if (!isRunning) {
        await e.reply('服务端当前未运行');
        return false;
      }

      const { stdout, stderr } = await this.executeCommand(`"${this.npmPath}" run stop`);
      await e.reply('阴天服务端已停止运行');

      if (stderr) {
        logger.warn(`[阴天插件] 停止警告: ${stderr}`);
      }

      return true;
    } catch (error) {
      logger.error(`[阴天插件] 停止服务端错误: ${error}`);
      await e.reply(`停止失败: ${error.message}`);
      return false;
    }
  }

  async CheckStatus(e) {
    if (!this.validateCommand(e)) return false;

    try {
      const { stdout } = await this.executeCommand('pm2 show api-server');
      const status = this.parseStatus(stdout);
      const { port } = await this.getServerPort();

      let statusMsg = `服务端状态:\n${status}`;
      statusMsg += `\n服务地址: ${this.apiBaseUrl}:${port}`;

      await e.reply(statusMsg);
      return true;
    } catch (error) {
      logger.error(`[阴天插件] 检查状态错误: ${error}`);
      await e.reply('获取状态失败,服务可能未运行');
      return false;
    }
  }

  // 其他方法保持不变...
  parseStatus(output) {
    const lines = output.split('\n');
    const status = {};

    for (const line of lines) {
      if (line.includes('status')) {
        status.status = line.split('│')[2]?.trim();
      }
      if (line.includes('memory')) {
        status.memory = line.split('│')[2]?.trim();
      }
      if (line.includes('cpu')) {
        status.cpu = line.split('│')[2]?.trim();
      }
      if (line.includes('uptime')) {
        status.uptime = line.split('│')[2]?.trim();
      }
    }

    return Object.entries(status)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
  }

  async getServerPort() {
    try {
      const response = await axios.get(`${this.apiBaseUrl}:${this.defaultPort}/api/server-info`, {
        timeout: 60000
      });
      return response.data;
    } catch (error) {
      logger.warn(`[阴天插件] 获取运行时端口失败，使用配置端口: ${this.defaultPort}`);
      return { port: this.defaultPort };
    }
  }

  async isServerRunning(port) {
    try {
      const response = await axios.get(`${this.apiBaseUrl}:${port}/api/port`, {
        timeout: 2000
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  validateCommand(e) {
    if (!e.isPrivate) {
      e.reply('该命令仅支持私聊使用');
      return false;
    }

    if (!e.isMaster) {
      e.reply('你没有权限操作服务端');
      return false;
    }

    return true;
  }

  async validateNpmEnv() {
    if (!this.npmPath) {
      throw new Error('未找到可用的npm环境，请先安装Node.js和npm');
    }

    if (!fs.existsSync(this.pluginPath)) {
      throw new Error(`插件目录不存在: ${this.pluginPath}`);
    }

    const pkgPath = path.join(this.pluginPath, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      throw new Error('未找到package.json文件');
    }
  }
}