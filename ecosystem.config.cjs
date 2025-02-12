const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), 'plugins/y-tian-plugin/.env') });

module.exports = {
  apps: [{
    name: 'api-server',
    script: './server/g4f.js',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    node_args: '--experimental-modules --es-module-specifier-resolution=node',
    env: {
      NODE_ENV: 'development',
      PORT: process.env.PORT || 7799
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 7799 
    }
  }]
}