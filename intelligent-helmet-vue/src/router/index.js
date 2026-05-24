import { createRouter, createWebHistory } from 'vue-router'
import App from '@/views/App.vue'
import Auth from '@/views/Auth.vue'
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
    component: () => import('@/views/DataVisualization.vue')
  },
  {
    path: '/auth',
    name: 'Auth',
    component: Auth
  },
  {
    path: '/emergency-contacts',
    name: 'EmergencyContacts',
    component: () => import('@/views/EmergencyContacts.vue')
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: () => import('@/views/UserProfilePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ride-history',
    name: 'RideHistory',
    component: () => import('@/views/RideHistory.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ride-plan',
    name: 'RidePlan',
    component: () => import('@/views/RidePlan.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/oauth/callback',
    name: 'OAuthCallback',
    component: () => import('@/views/OAuthCallback.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

setupRouterGuards(router)

export default router