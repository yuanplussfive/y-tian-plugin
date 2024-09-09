const { defineConfig } = require('@vue/cli-service')
const path = require('path')
const fs = require('fs')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    https: false, // 是否启用HTTPS
    port: 4395, // 默认端口
    host: '0.0.0.0' // 你的域名, 如果你有自己的SSL证书，可以配置：
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src/')
      },
      fallback: {
        path: require.resolve('path-browserify'),
        os: false,
        fs: false,
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        }
      ]
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
    }
  },
})