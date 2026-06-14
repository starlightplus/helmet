import { createRouter, createWebHistory } from 'vue-router'
import App from '@/views/App.vue'
import Auth from '@/views/auth/Auth.vue'
import { setupRouterGuards } from './guards'

const routes = [
  {
    path: '/',
    redirect: '/auth'
  },
  {
    path: '/app',
    name: 'App',
    component: App
  },
  {
    path: '/data-viz',
    name: 'DataVisualization',
    component: () => import('@/views/data-viz/DataVisualization.vue')
  },
  {
    path: '/device-status',
    name: 'DeviceStatus',
    component: () => import('@/views/terminal/DeviceStatusPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/auth',
    name: 'Auth',
    component: Auth
  },
  {
    path: '/emergency-contacts',
    name: 'EmergencyContacts',
    component: () => import('@/views/user/EmergencyContacts.vue')
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: () => import('@/views/user/UserProfilePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ride-history',
    name: 'RideHistory',
    component: () => import('@/views/ai-ride/RideHistory.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ride-plan',
    name: 'RidePlan',
    component: () => import('@/views/ai-ride/RidePlan.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/oauth/callback',
    name: 'OAuthCallback',
    component: () => import('@/views/auth/OAuthCallback.vue')
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('@/views/admin/AdminDashboard.vue'),
    meta: { requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

setupRouterGuards(router)

export default router