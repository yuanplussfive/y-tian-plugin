import fs from 'node:fs'
import chalk from 'chalk'

if (!global.segment) {
  global.segment = (await import("oicq")).segment
}

const files = fs.readdirSync('./plugins/y-tian-plugin/apps').filter(file => file.endsWith('.js'))

let ret = []

const greenColor = chalk.hex('#32F06C')

logger.info(greenColor.bold('Y-Tian-plugin加载中. . .'))
logger.info(greenColor.bold(`
  
  ██╗   ██╗████████╗██╗ █████╗ ███╗   ██╗
  ██║   ██║╚══██╔══╝██║██╔══██╗████╗  ██║
  ██║   ██║   ██║   ██║███████║██╔██╗ ██║
  ██║   ██║   ██║   ██║██╔══██║██║╚██╗██║
  ╚██████╔╝   ██║   ██║██║  ██║██║ ╚████║
   ╚═════╝    ╚═╝   ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝
`))
logger.info(greenColor.bold('Y-Tian-plugin加载完毕'))
logger.info(greenColor.bold('作者-鸢 & 天球生物'))
logger.info(greenColor.bold('-----------💬 推荐加入我们的群聊：📱 QQ 群号: 912701273----------'))

try {
  ret = await Promise.allSettled(
    files.map(file => import(`./apps/${file}`))
  )

  const apps = {}
  for (let i in files) {
    const name = files[i].replace('.js', '')

    if (ret[i].status !== 'fulfilled') {
      logger.error(`载入插件错误：${chalk.red(name)}`)
      logger.error(ret[i].reason)
      continue
    }
    apps[name] = ret[i].value[Object.keys(ret[i].value)[0]]
  }
  
  export { apps }
} catch (error) {
  logger.error('加载插件时发生错误:', error)
}