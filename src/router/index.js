const routes = [
  // 其他路由...
  {
    path: '/api/chat',
    name: 'chat',
    component: () => import(/* webpackChunkName: "chat" */ '../views/ChatView.vue')
  }
]