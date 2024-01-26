import fs from 'node:fs'
import chalk from 'chalk'
const _path = process.cwd()

if (!global.segment) {
  global.segment = (await import("oicq")).segment
}

const files = fs.readdirSync('./plugins/y-tian-plugin/apps').filter(file => file.endsWith('.js'))

let ret = []
logger.info(chalk.rgb(50, 240, 108)(`---~~·☁️☁️☁️·~~---`))
logger.info(chalk.rgb(50, 240, 108)(`Y-Tian-plugin加载完毕`))
logger.info(chalk.rgb(50, 240, 108)(`作者-鸢 & 天球生物`))
logger.info(chalk.rgb(50, 240, 108)(`---------------------`));
 
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