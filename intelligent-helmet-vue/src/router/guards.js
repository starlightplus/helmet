import { useUserStore } from '@/stores/user'

export function setupRouterGuards(router) {
  router.beforeEach((to, from, next) => {
    const userStore = useUserStore()

    // 未登录访问受保护页面 → 登录
    const protectedPaths = ['/app', '/controls', '/emergency-contacts', '/ride-history', '/admin']
    if (protectedPaths.includes(to.path) && !userStore.isLoggedIn) {
      next('/auth')
      return
    }

    // 非管理员访问 /admin → 回 /app
    if (to.path === '/admin' && userStore.role !== 'admin') {
      next('/app')
      return
    }

    // 已登录访问登录页 → 按角色跳转
    if (to.path === '/auth' && to.path !== from.path && userStore.isLoggedIn) {
      next(userStore.role === 'admin' ? '/admin' : '/app')
      return
    }

    next()
  })
}