import fs from 'node:fs'
import chalk from 'chalk'

if (!global.segment) {
  global.segment = (await import("oicq")).segment
}

const files = fs.readdirSync('./plugins/y-tian-plugin/apps').filter(file => file.endsWith('.js'))

let ret = []

logger.info(chalk.rgb(50, 240, 108).bold('Y-Tian-plugin加载中. . .'));
logger.info(chalk.rgb(50, 240, 108).bold(`
  
  ██╗   ██╗████████╗██╗ █████╗ ███╗   ██╗
  ██║   ██║╚══██╔══╝██║██╔══██╗████╗  ██║
  ██║   ██║   ██║   ██║███████║██╔██╗ ██║
  ██║   ██║   ██║   ██║██╔══██║██║╚██╗██║
  ╚██████╔╝   ██║   ██║██║  ██║██║ ╚████║
   ╚═════╝    ╚═╝   ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝
   `));
logger.info(chalk.rgb(50, 240, 108).bold('Y-Tian-plugin加载完毕'));
logger.info(chalk.rgb(50, 240, 108).bold('作者-鸢 & 天球生物'));
logger.info(chalk.rgb(50, 240, 108).bold(`---------------------`));
logger.info(chalk.rgb(50, 240, 108).bold(`💬 推荐加入我们的群聊：📱 QQ 群号: 756783127`));
 
files.forEach((file) => {
  ret.push(import(`./apps/${file}`))
})

ret = await Promise.allSettled(ret)

let apps = {}
for (let i in files) {
  let name = files[i].replace('.js', '')

  if (ret[i].status != 'fulfilled') {
    logger.error(`载入插件错误：${logger.red(name)}`)
    logger.error(ret[i].reason)
    continue
  }
  apps[name] = ret[i].value[Object.keys(ret[i].value)[0]]
}
export { apps }