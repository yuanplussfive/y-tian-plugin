import fs from 'node:fs'
import chalk from 'chalk'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// 检查并创建env文件
function checkAndCreateEnvFile() {
  const envPath = './plugins/y-tian-plugin/.env'
  if (!fs.existsSync(envPath)) {
    const envContent = `PORT=7900
DEFAULT_API_KEY=sk-123456
OPENAI_API_BASE=https://api.openai.com
DATABASE_URL=mongodb://user:password@host:port/database
ACCESS_KEY=114514`

    try {
      fs.writeFileSync(envPath, envContent, 'utf8')
      logger.info(chalk.green('已创建默认.env文件'))
    } catch (error) {
      logger.error(chalk.red('创建.env文件失败：'), error)
    }
  }
}

// 检查包管理器是否可用
async function checkPackageManager(cmd) {
  try {
    await execAsync(`${cmd} --version`)
    return true
  } catch (e) {
    return false
  }
}

// 比较版本号
function compareVersions(v1, v2) {
  const v1parts = v1.split('.').map(Number)
  const v2parts = v2.split('.').map(Number)
  
  for (let i = 0; i < 3; i++) {
    if (v1parts[i] > v2parts[i]) return 1
    if (v1parts[i] < v2parts[i]) return -1
  }
  return 0
}

async function installDependencies() {
  const nodeModules = './plugins/y-tian-plugin/node_modules'
  const packageJson = './plugins/y-tian-plugin/package.json'

  // 检查package.json是否存在
  if (!fs.existsSync(packageJson)) {
    logger.error(chalk.red('未找到package.json文件'))
    return false
  }

  // 读取package.json
  const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'))
  const dependencies = pkg.dependencies || {}

  // 检查是否需要安装/更新依赖
  let needInstall = false

  // 如果node_modules不存在,需要安装
  if (!fs.existsSync(nodeModules)) {
    needInstall = true
  } else {
    // 检查已安装的依赖版本是否符合package.json要求
    for (const dep in dependencies) {
      const depPath = `${nodeModules}/${dep}/package.json`
      if (!fs.existsSync(depPath)) {
        needInstall = true
        break
      }
      
      const installedPkg = JSON.parse(fs.readFileSync(depPath, 'utf8'))
      const installedVersion = installedPkg.version
      // 移除版本号中的 ^、~ 等符号，只比较纯版本号
      const requiredVersion = dependencies[dep].replace(/[\^~]/g, '')
      
      // 版本号完全相同则跳过
      if(installedVersion === requiredVersion) {
        continue
      }
      
      // 如果是^版本,只要主版本号相同且已安装版本不低于要求版本即可
      if(dependencies[dep].startsWith('^')) {
        const installedMajor = installedVersion.split('.')[0]
        const requiredMajor = requiredVersion.split('.')[0]
        if(installedMajor === requiredMajor && compareVersions(installedVersion, requiredVersion) >= 0) {
          continue
        }
      }
      
      // 如果是~版本,主版本号和次版本号都要相同,且已安装版本不低于要求版本
      if(dependencies[dep].startsWith('~')) {
        const [installedMajor, installedMinor] = installedVersion.split('.')
        const [requiredMajor, requiredMinor] = requiredVersion.split('.')
        if(installedMajor === requiredMajor && installedMinor === requiredMinor && 
           compareVersions(installedVersion, requiredVersion) >= 0) {
          continue
        }
      }
      
      logger.debug(`依赖 ${dep} 版本不匹配: 已安装 ${installedVersion}, 需要 ${dependencies[dep]}`)
      needInstall = true
      break
    }
  }

  if (!needInstall) {
    logger.info(chalk.blue('依赖已存在且版本正确，无需重新安装'))
    return true
  }

  logger.info(chalk.yellow('开始安装依赖...'))

  let installCmd = 'npm install --no-audit'

  if (await checkPackageManager('pnpm')) {
    installCmd = 'pnpm install'
  } else if (await checkPackageManager('cnpm')) {
    installCmd = 'cnpm install'
  }

  try {
    await execAsync(`cd ./plugins/y-tian-plugin && ${installCmd}`)
    logger.info(chalk.green('依赖安装完成！请重启bot即可'))
    return true
  } catch (error) {
    logger.error(chalk.red('依赖安装失败：'), error)
    return false
  }
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
  // 检查并创建.env文件
  checkAndCreateEnvFile()

  // 检查并安装依赖
  const dependenciesInstalled = await installDependencies()
  if (!dependenciesInstalled) {
    logger.error(chalk.red('依赖安装失败，插件无法正常工作，请检查网络或手动安装依赖'))
    process.exit(1) // 依赖安装失败直接退出
  }

  // 依赖安装成功后再加载插件
  logger.info(chalk.blue('开始加载插件...'))
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
  process.exit(1) // 发生错误时也直接退出
}

export { apps }