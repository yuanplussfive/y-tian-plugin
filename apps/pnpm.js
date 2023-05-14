import fs from 'fs';
import { exec } from 'child_process';
import path from 'path';
import cfg from '../../../lib/config/config.js'
const _path = process.cwd()

let dirpath = _path + '/plugins/y-tian-plugin/node_modules/request'
let dirpath2 = _path + '/plugins/y-tian-plugin'

fs.promises.access(dirpath)
  .then(() => {
  return
  })
  .catch(() => { 
    const cmd = 'pnpm install';
    const options = {
      cwd: dirpath2,
    };
    
    exec(cmd, options, (error, stdout, stderr) => {
      setTimeout(() => Bot.pickFriend(cfg.masterQQ[0]).sendMsg('检测到您的阴天依赖不完整，已自动为您安装依赖，请重启云崽以生效。'), 5000)
    
    });
  });
 