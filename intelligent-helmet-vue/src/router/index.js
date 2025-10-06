import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import App from '@/views/App.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/app',
    name: 'App',
    component: App
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router