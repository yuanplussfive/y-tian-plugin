import Vue from 'vue'
import app from './App.vue'
import router from './router' // 导入路由实例

new Vue({
  router, // 注册路由实例
  render: h => h(app)
}).$mount('#app')