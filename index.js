
import fs from 'node:fs';
import chalk from 'chalk';
import path from 'path';

// 检查并创建env文件
function checkAndCreateEnvFile() {
  const envPath = './plugins/y-tian-plugin/.env';
  if (!fs.existsSync(envPath)) {
    const envContent = `PORT=7900
DEFAULT_API_KEY=sk-123456
OPENAI_API_BASE=https://api.openai.com
DATABASE_URL=mongodb://user:password@host:port/database
ACCESS_KEY=114514`;

    try {
      fs.writeFileSync(envPath, envContent, 'utf8');
      logger.info(chalk.green('已创建默认.env文件'));
    } catch (error) {
      logger.error(chalk.red('创建.env文件失败：'), error);
    }
  }
}

if (!global.segment) {
  global.segment = (await import("oicq")).segment;
}

const greenText = chalk.green.bold;
logger.info(greenText('Y-Tian-plugin加载中...'));
logger.info(greenText(`
  ██╗   ██╗████████╗██╗ █████╗ ███╗   ██╗
  ██║   ██║╚══██╔══╝██║██╔══██╗████╗  ██║
  ██║   ██║   ██║   ██║███████║██╔██╗ ██║
  ██║   ██║   ██║   ██║██╔══██║██║╚██╗██║
  ╚██████╔╝   ██║   ██║██║  ██║██║ ╚████║
   ╚═════╝    ╚═╝   ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝
`));

const apps = {};
try {
  checkAndCreateEnvFile();
  
  const files = fs.readdirSync('./plugins/y-tian-plugin/apps').filter(file => file.endsWith('.js'));
  const results = await Promise.allSettled(
    files.map(file => import(`./apps/${file}`))
  );

  for (let i = 0; i < files.length; i++) {
    const name = path.basename(files[i], '.js');
    if (results[i].status !== 'fulfilled') {
      logger.error(`载入插件错误：${chalk.red(name)}`);
      logger.error(results[i].reason);
      continue;
    }
    apps[name] = results[i].value[Object.keys(results[i].value)[0]];
  }

  logger.info(greenText('Y-Tian-plugin加载完毕'));
  logger.info(greenText('作者-鸢 & 天球生物'));
} catch (error) {
  logger.error(chalk.red('加载插件时发生错误:'), error);
  process.exit(1);
}

export { apps };