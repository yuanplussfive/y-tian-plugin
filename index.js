import fs from 'node:fs'
import chalk from 'chalk'

if (!global.segment) {
  global.segment = (await import("oicq")).segment
}

const files = fs.readdirSync('./plugins/y-tian-plugin/apps').filter(file => file.endsWith('.js'))

let ret = []
let apps = {} // 将 apps 声明移到 try 块外部

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
logger.info(greenText('Y-Tian-plugin加载完毕'))
logger.info(greenText('作者-鸢 & 天球生物'))
logger.info(greenText('-----------💬 推荐加入我们的群聊：📱 QQ 群号: 912701273----------'))

try {
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

} catch (error) {
  logger.error('加载插件时发生错误:', error)
}
  
export { apps }