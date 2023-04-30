import fs from 'fs'
import Cfg from '../components/Cfg.js'
import lodash from 'lodash'
const { exec, execSync } = require("child_process");
const _path = process.cwd()

export class update extends plugin {
  constructor() {
    super({
      name: "[阴天插件]更新",
      event: "message",
      priority: 1145,
      rule: [
        {
          reg: "^#*阴天(插件)?(强制)?更新$",
          fnc: "update",
        },
      ],
    });
  }

  /**
   * rule - 更新阴天插件
   * @returns
   */
  async update() {
    if (!e.isMaster) {
    e.reply('只有主人才能更新哦~')
    return true
  }
  let isForce = e.msg.includes('强制')
  let command = 'git  pull'
  if (isForce) {
    command = 'git  checkout . && git  pull'
    e.reply('正在执行强制更新操作，请稍等')
  } else {
    e.reply('正在执行更新操作，请稍等')
  }
  exec(command, { cwd: `${_path}/plugins/y-tian-plugin/` }, function (error, stdout, stderr) {
    if (/(Already up[ -]to[ -]date|已经是最新的)/.test(stdout)) {
      e.reply('目前已经是最新版榴莲了~')
      return true
    }
    if (error) {
      e.reply('阴天插件更新失败！\nError code: ' + error.code + '\n' + error.stack + '\n 请稍后重试。')
      return true
    }
    e.reply('阴天插件更新成功，正在尝试重新启动Yunzai以应用更新...')
    timer && clearTimeout(timer)
    redis.set('Y-Tian:restart-msg', JSON.stringify({
      msg: '重启成功，新版阴天插件已经生效',
      qq: e.user_id
    }), { EX: 30 })
    timer = setTimeout(function () {
      let command = 'npm run start'
      if (process.argv[1].includes('pm2')) {
        command = 'npm run restart'
      }
      exec(command, function (error, stdout, stderr) {
        if (error) {
          e.reply('自动重启失败，请手动重启以应用新版阴天插件。\nError code: ' + error.code + '\n' + error.stack + '\n')
          Bot.logger.error(`重启失败\n${error.stack}`)
          return true
        } else if (stdout) {
          Bot.logger.mark('重启成功，运行已转为后台，查看日志请用命令：npm run log')
          Bot.logger.mark('停止后台运行命令：npm stop')
          process.exit()
        }
      })
    }, 1000)
  })
  return true
}
}