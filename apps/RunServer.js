import { dependencies } from "../YTdependence/dependencies.js";
const { path, axios, common } = dependencies;
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs/promises';  // 使用 promise 版本的 fs
import dotenv from 'dotenv';
import { spawn } from 'child_process';  // 使用 spawn 替代 exec
import os from 'os'; // 引入 os 模块用于获取系统信息

/**
 * 服务运行环境类型枚举
 */
const RuntimeEnv = {
  DOCKER: 'docker',
  LOCAL: 'local',
  PM2: 'pm2'
};

/**
 * 服务状态枚举
 */
const ServiceStatus = {
  RUNNING: 'running',
  STOPPED: 'stopped',
  ERROR: 'error'
};

function getLocalIPs() {
  const networkInterfaces = os.networkInterfaces();
  const addresses = [];

  for (const interfaceName in networkInterfaces) {
    for (const networkInterface of networkInterfaces[interfaceName]) {
      // 跳过内部环回地址和非IPv4地址
      if (networkInterface.family === 'IPv4' && !networkInterface.internal) {
        addresses.push(networkInterface.address);
      }
    }
  }
  return addresses;
}

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
    });

    this.init();
  }

  /**
   * 初始化服务配置
   */
  async init() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    this.pluginPath = path.join(__dirname, '../');

    dotenv.config({ path: path.join(this.pluginPath, '.env') });

    this.config = {
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost',
      port: process.env.PORT || 7799,
      runtimeEnv: this.detectRuntimeEnv(),
      dockerImage: process.env.DOCKER_IMAGE || 'api-server:latest',
      dockerContainer: process.env.DOCKER_CONTAINER || 'api-server'
    };

    this.serviceStatus = {
      status: ServiceStatus.STOPPED,
      process: null,
      container: null,
      startTime: null,
      processInfo: null
    };
  }

  /**
   * 检测运行环境
   * @returns {string} 运行环境类型
   */
  detectRuntimeEnv() {
    if (process.env.DOCKER_CONTAINER) {
      return RuntimeEnv.DOCKER;
    }
    if (process.env.PM2_HOME) {
      return RuntimeEnv.PM2;
    }
    return RuntimeEnv.LOCAL;
  }

  /**
   * 格式化进程信息 (普通字符串换行形式)
   * @param {object} info 进程信息
   * @returns {string} 格式化后的信息
   */
  formatProcessInfo(info) {
    return `
ID:     ${info.id}
Name:   ${info.name}
Mode:   ${info.mode}
PID:    ${info.pid}
Status: ${info.status}
CPU:    ${info.cpu}
Mem:    ${info.mem}
Uptime: ${info.uptime}
`;
  }


  /**
   * 启动服务
   * @param {object} e 事件对象
   */
  async RunServer(e) {
    if (!this.validateCommand(e)) return false;

    try {
      await e.reply('正在启动服务端...', true, { recallMsg: 5 });

      switch (this.config.runtimeEnv) {
        case RuntimeEnv.DOCKER:
          await this.startDockerService();
          break;
        case RuntimeEnv.PM2:
          await this.startPM2Service();
          break;
        default:
          await this.startLocalService();
      }

      this.serviceStatus.startTime = new Date();

      // 使用健康检查等待服务器启动
      const serverInfo = await this.waitForServerReady(60000, 3000); // 等待最多 60 秒，每 3 秒检查一次

      await this.sendDetailedServerInfo(e, serverInfo);

      return true;
    } catch (error) {
      logger.error(`[阴天插件] 启动失败: ${error.message}`);
      await e.reply(`启动失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 健康检查，等待服务器启动
   * @param {number} timeout 最大等待时间（毫秒）
   * @param {number} interval 检查间隔（毫秒）
   * @returns {Promise<object>} 服务器信息
   */
  async waitForServerReady(timeout, interval) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const serverInfo = await this.getServerInfo();
        if (serverInfo && serverInfo.hasOwnProperty('publicIp')) {
          return serverInfo;
        }
        logger.info('[阴天插件] 服务正在启动中，等待...');
        await common.sleep(interval);
      } catch (error) {
        logger.warn(`[阴天插件] 健康检查失败: ${error.message}`);
        await common.sleep(interval);
      }
    }

    throw new Error('等待服务器启动超时');
  }

  /**
   * 启动Docker服务
   */
  async startDockerService() {
    const dockerRun = spawn('docker', [
      'run',
      '-d',
      '--name', this.config.dockerContainer,
      '-p', `${this.config.port}:${this.config.port}`,
      this.config.dockerImage
    ]);

    return new Promise((resolve, reject) => {
      dockerRun.on('close', (code) => {
        if (code === 0) {
          this.serviceStatus.status = ServiceStatus.RUNNING;
          this.serviceStatus.container = this.config.dockerContainer;
          resolve();
        } else {
          reject(new Error(`Docker启动失败，退出码: ${code}`));
        }
      });
    });
  }

  /**
   * 启动本地服务
   */
  async startLocalService() {
    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const npmStart = spawn(npm, ['run', 'dev'], {
      cwd: this.pluginPath,
      env: { ...process.env, PORT: this.config.port }
    });

    this.serviceStatus.process = npmStart;
    this.serviceStatus.status = ServiceStatus.RUNNING;

    // 记录进程信息
    this.serviceStatus.processInfo = {
      id: '0',
      name: 'api-server',
      mode: 'fork',
      pid: npmStart.pid,
      status: 'online',
      cpu: '0%',
      mem: '0MB',
      uptime: '0s'
    };

    npmStart.stdout.on('data', (data) => {
      logger.info(`[阴天插件] ${data}`);
    });

    npmStart.stderr.on('data', (data) => {
      logger.warn(`[阴天插件] ${data}`);
    });

    // 更新进程信息
    this.updateProcessInfo();
  }

  /**
   * 启动PM2服务
   */
  async startPM2Service() {
    const pm2 = spawn('pm2', [
      'start',
      path.join(this.pluginPath, 'ecosystem.config.cjs'),
      '--name', 'api-server',
      '--watch'
    ]);

    return new Promise((resolve, reject) => {
      pm2.on('close', (code) => {
        if (code === 0) {
          this.serviceStatus.status = ServiceStatus.RUNNING;
          this.updatePM2Info();
          resolve();
        } else {
          reject(new Error(`PM2启动失败，退出码: ${code}`));
        }
      });
    });
  }

  /**
   * 更新进程信息
   */
  async updateProcessInfo() {
    if (!this.serviceStatus.process) return;

    const usage = process.cpuUsage();
    const memUsage = process.memoryUsage();
    const uptime = Math.floor((new Date() - this.serviceStatus.startTime) / 1000);

    this.serviceStatus.processInfo = {
      id: '0',
      name: 'api-server',
      mode: 'fork',
      pid: this.serviceStatus.process.pid,
      status: 'online',
      cpu: `${((usage.user + usage.system) / 1000000).toFixed(1)}%`,
      mem: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      uptime: `${uptime}s`
    };
  }

  /**
   * 更新PM2进程信息
   */
  async updatePM2Info() {
    const pm2List = spawn('pm2', ['jlist']);
    let output = '';

    return new Promise((resolve) => {
      pm2List.stdout.on('data', (data) => {
        output += data;
      });

      pm2List.on('close', () => {
        try {
          const processes = JSON.parse(output);
          const serverProcess = processes.find(p => p.name === 'api-server');

          if (serverProcess) {
            this.serviceStatus.processInfo = {
              id: serverProcess.pm_id.toString(),
              name: serverProcess.name,
              mode: serverProcess.exec_mode,
              pid: serverProcess.pid,
              status: serverProcess.pm2_env.status,
              cpu: `${serverProcess.monit.cpu}%`,
              mem: `${Math.round(serverProcess.monit.memory / 1024 / 1024)}MB`,
              uptime: `${Math.floor(serverProcess.pm2_env.pm_uptime / 1000)}s`
            };
          }
        } catch (error) {
          logger.error(`[阴天插件] 更新PM2信息失败: ${error.message}`);
        }
        resolve();
      });
    });
  }

  /**
   * 停止服务
   * @param {object} e 事件对象
   */
  async StopServer(e) {
    if (!this.validateCommand(e)) return false;

    try {
      switch (this.config.runtimeEnv) {
        case RuntimeEnv.DOCKER:
          await this.stopDockerService();
          break;
        case RuntimeEnv.PM2:
          await this.stopPM2Service();
          break;
        default:
          await this.stopLocalService();
      }

      const forwardMsg = [
        '服务端已停止运行',
        `运行环境: ${this.config.runtimeEnv}`,
        `停止时间: ${new Date().toLocaleString()}`
      ];

      await e.reply(await common.makeForwardMsg(e, forwardMsg, '阴天服务端停止通知'));
      return true;
    } catch (error) {
      logger.error(`[阴天插件] 停止失败: ${error.message}`);
      await e.reply(`停止失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 停止Docker服务
   */
  async stopDockerService() {
    if (this.serviceStatus.container) {
      const dockerStop = spawn('docker', ['stop', this.serviceStatus.container]);
      await new Promise((resolve, reject) => {
        dockerStop.on('close', (code) => {
          if (code === 0) {
            this.serviceStatus.status = ServiceStatus.STOPPED;
            this.serviceStatus.container = null;
            this.serviceStatus.processInfo = null;
            resolve();
          } else {
            reject(new Error(`Docker停止失败，退出码: ${code}`));
          }
        });
      });
    }
  }

  /**
   * 停止本地服务
   */
  async stopLocalService() {
    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

    // 1. 使用 pm2 stop api-server (如果启动服务时使用了 pm2)
    try {
      const npmStop = spawn(npm, ['run', 'stop'], {  // 使用 package.json 中的 stop 脚本
        cwd: this.pluginPath,
      });

      npmStop.stdout.on('data', (data) => {
        logger.info(`[阴天插件] ${data}`);
      });

      npmStop.stderr.on('data', (data) => {
        logger.warn(`[阴天插件] ${data}`);
      });

      await new Promise((resolve, reject) => {
        npmStop.on('close', (code) => {
          if (code === 0) {
            logger.info('[阴天插件] 本地服务已停止 (通过 pm2)');
            this.serviceStatus.status = ServiceStatus.STOPPED;
            this.serviceStatus.process = null;
            this.serviceStatus.processInfo = null; // 清空进程信息
            resolve();
          } else {
            logger.error(`[阴天插件] 停止本地服务失败 (通过 pm2)，退出码: ${code}`);
            reject(new Error(`停止本地服务失败 (通过 pm2)，退出码: ${code}`));
          }
        });

        npmStop.on('error', (err) => {
          logger.error(`[阴天插件] 停止本地服务时发生错误 (通过 pm2): ${err}`);
          reject(err);
        });
      });


    } catch (error) {
      logger.error(`[阴天插件] 尝试通过 pm2 停止服务时发生错误: ${error}`);
      // 如果 pm2 停止失败，可以尝试其他方法作为备选方案
      //  可以考虑使用方法 2 或 3 作为降级方案。
      this.killProcess(); // 尝试强制杀死进程
    }
  }

  //  一个辅助函数，用于强制停止进程
  async killProcess() {
    if (this.serviceStatus.process && this.serviceStatus.process.pid) {
      try {
        process.kill(this.serviceStatus.process.pid);
        logger.info(`[阴天插件] 强制停止进程 ${this.serviceStatus.process.pid}`);
        this.serviceStatus.status = ServiceStatus.STOPPED;
        this.serviceStatus.process = null;
        this.serviceStatus.processInfo = null;
      } catch (err) {
        logger.warn(`[阴天插件] 无法强制停止进程 ${this.serviceStatus.process.pid}: ${err}`);
      }
    } else {
      logger.warn("[阴天插件] 没有进程可以停止");
    }
  }

  /**
   * 停止PM2服务
   */
  async stopPM2Service() {
    const pm2Stop = spawn('pm2', ['stop', 'api-server']);
    await new Promise((resolve, reject) => {
      pm2Stop.on('close', (code) => {
        if (code === 0) {
          this.serviceStatus.status = ServiceStatus.STOPPED;
          this.serviceStatus.processInfo = null;
          resolve();
        } else {
          reject(new Error(`PM2停止失败，退出码: ${code}`));
        }
      });
    });
  }

  /**
   * 获取服务器详细信息
   */
  async getServerInfo() {
    try {
      const response = await axios.get(
        `${this.config.apiBaseUrl}:${this.config.port}/api/server-info`,
        { timeout: 30000 }
      );
      //console.log(response.data);
      return {
        ...response.data,
        localIPs: getLocalIPs()
      };
    } catch (error) {
      //console.log(error)
      return {
        port: this.config.port,
        status: this.serviceStatus.status,
        runtime: this.config.runtimeEnv,
        localIPs: getLocalIPs()
      };
    }
  }

  /**
   * 发送详细的服务器信息
   * @param {object} e 事件对象
   * @param {object} info 服务器信息
   */
  async sendDetailedServerInfo(e, info) {
    const forwardMsg = [
      '==== 基本信息 ====',
      `运行环境: ${this.config.runtimeEnv}`,
      `服务状态: ${this.serviceStatus.status}`,
      `启动时间: ${this.serviceStatus.startTime?.toLocaleString() || '未知'}`,
      '',
      '==== 网络信息 ====',
      `内网地址: ${info.internalIp}`,
      `公网地址: ${info.publicIp}`,
      `API端点: ${this.config.apiBaseUrl}:${info.port}/v1/chat/completions`,
      `模型端点: ${this.config.apiBaseUrl}:${info.port}/v1/models`,
      ''
    ];

    // 添加进程信息
    if (this.serviceStatus.processInfo) {
      forwardMsg.push(
        '==== 进程信息 ====',
        this.formatProcessInfo(this.serviceStatus.processInfo)
      );
    }

    await e.reply(await common.makeForwardMsg(e, forwardMsg, '阴天服务端详细信息'));
  }

  /**
   * 验证命令权限
   * @param {object} e 事件对象
   * @returns {boolean} 验证结果
   */
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

  /**
   * 检查服务状态
   * @param {object} e 事件对象
   */
  async CheckStatus(e) {
    if (!this.validateCommand(e)) return false;

    try {
      const serverInfo = await this.getServerInfo();
      await this.sendDetailedServerInfo(e, serverInfo);
      return true;
    } catch (error) {
      logger.error(`[阴天插件] 获取状态失败: ${error.message}`);
      await e.reply(`获取状态失败: ${error.message}`);
      return false;
    }
  }
}