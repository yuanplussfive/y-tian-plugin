import Vue from 'vue'
import Router from 'vue-router'
import HomePage from './views/Home.vue'
//import ChatPage from './views/Chat.vue'
import AboutPage from './views/About.vue'
import GalleryPage from './views/Gallery.vue'
import ProfilePage from './views/Profile.vue'
import NotificationsPage from './views/Notifications.vue'
import ReportsPage from './views/Reports.vue'

Vue.use(Router)

const routers = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/about',
      name: 'about',
      component: AboutPage
    },
    {
      path: '/gallery',
      name: 'gallery',
      component: GalleryPage
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfilePage
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: NotificationsPage
    },
    {
      path: '/reports',
      name: 'reports',
      component: ReportsPage
    }
   ]
})

export default routers