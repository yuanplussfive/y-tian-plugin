module.exports = {
  apps: [{
    name: 'api-server',
    script: 'server/g4f.js',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    node_args: '--experimental-modules --es-module-specifier-resolution=node',
    env: {
      NODE_ENV: 'development',
      PORT: 7799
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 7799
    }
  }]
}