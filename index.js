import fs from 'node:fs'
import chalk from 'chalk'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// 检查包管理器是否可用
async function checkPackageManager(cmd) {
  try {
    await execAsync(`${cmd} --version`)
    return true
  } catch (e) {
    return false
  }
}

async function installDependencies() {
  if (fs.existsSync('./plugins/y-tian-plugin/node_modules/.installed')) {
    logger.info(chalk.blue('依赖已存在，无需重新安装'))
    return true
  }
  if (!fs.existsSync('./plugins/y-tian-plugin/node_modules/.installed')) {
    logger.info(chalk.yellow('检测到首次安装，正在安装依赖...'))
    
    let installCmd = 'npm install --no-audit'
    
    if (await checkPackageManager('pnpm')) {
      installCmd = 'pnpm install'
    } else if (await checkPackageManager('cnpm')) {
      installCmd = 'cnpm install'
    }

    try {
      await execAsync(`cd ./plugins/y-tian-plugin && ${installCmd}`)
      fs.writeFileSync('./plugins/y-tian-plugin/node_modules/.installed', 'installed')
      logger.info(chalk.green('依赖安装完成！请重启bot即可'))
      return true
    } catch (error) {
      logger.error(chalk.red('依赖安装失败：'), error)
      return false
    }
  }
  return true
}

if (!global.segment) {
  global.segment = (await import("oicq")).segment
}

const files = fs.readdirSync('./plugins/y-tian-plugin/apps').filter(file => file.endsWith('.js'))
let ret = []
let apps = {}

const greenText = chalk.green.bold

logger.info(greenText('Y-Tian-plugin加载中. . .'))
logger.info(greenText(`
  
  ██╗   ██╗████████╗██╗ █████╗ ███╗   ██╗
  ██║   ██║╚══██╔══╝██║██╔══██╗████╗  ██║
  ██║   ██║   ██║   ██║███████║██╔██╗ ██║
  ██║   ██║   ██║   ██║██╔══██║██║╚██╗██║
  ╚██████╔╝   ██║   ██║██║  ██║██║ ╚████║
   ╚═════╝    ╚═╝   ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝
`))

try {
  // 先检查并安装依赖
  const dependenciesInstalled = await installDependencies()
  if (!dependenciesInstalled) {
    logger.error(chalk.red('依赖安装失败，插件可能无法正常工作'))
  }

  ret = await Promise.allSettled(
    files.map(file => import(`./apps/${file}`))
  )

  for (let i in files) {
    const name = files[i].replace('.js', '')

    if (ret[i].status !== 'fulfilled') {
      logger.error(`载入插件错误：${chalk.red(name)}`)
      logger.error(ret[i].reason)
      continue
    }
    apps[name] = ret[i].value[Object.keys(ret[i].value)[0]]
  }

  logger.info(greenText('Y-Tian-plugin加载完毕'))
  logger.info(greenText('作者-鸢 & 天球生物'))

} catch (error) {
  logger.error('加载插件时发生错误:', error)
}

export { apps }