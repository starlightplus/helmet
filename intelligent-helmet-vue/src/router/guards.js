import { useUserStore } from '@/stores/user'

export function setupRouterGuards(router) {
  // 全局前置守卫
  router.beforeEach((to, from, next) => {
    // 如果访问的是app页面但未登录，则重定向到登录页面
    if (to.path === '/app' || to.path === '/controls' || to.path === '/emergency-contacts' || to.path === '/ride-history') {
      const userStore = useUserStore()
      if (!userStore.isLoggedIn) {
        next('/auth')
        return
      }
    }

    // 如果访问的是登录页面但已登录，则重定向到app页面
    if (to.path === '/auth' && to.path !== from.path) {
      const userStore = useUserStore()
      if (userStore.isLoggedIn) {
        next('/app')
        return
      }
    }

    next()
  })
}