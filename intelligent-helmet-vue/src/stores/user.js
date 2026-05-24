import { ref } from 'vue'
import { defineStore, getActivePinia } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const isLoggedIn = ref(!!sessionStorage.getItem('token'))
  const username = ref(sessionStorage.getItem('username') || '')
  const role = ref(sessionStorage.getItem('role') || 'user')
  const deviceId = ref(sessionStorage.getItem('deviceId') || '')

  function login(userData) {
    const prevUsername = sessionStorage.getItem('username')

    // 先写 sessionStorage，这样 userProfile 的 _storageKey() 能拿到新用户名
    sessionStorage.setItem('token', userData.token)
    sessionStorage.setItem('username', userData.username)
    sessionStorage.setItem('role', userData.role || 'user')
    sessionStorage.setItem('deviceId', userData.deviceId || '')

    isLoggedIn.value = true
    username.value = userData.username
    role.value = userData.role || 'user'
    deviceId.value = userData.deviceId || ''

    // 用户切换时重置 profile store，防止旧用户数据串到新用户
    if (prevUsername && prevUsername !== userData.username) {
      const pinia = getActivePinia()
      if (pinia) {
        const profileStore = pinia._s.get('userProfile')
        if (profileStore) profileStore.$reset()
      }
    }
  }

  function logout() {
    isLoggedIn.value = false
    username.value = ''
    role.value = 'user'
    deviceId.value = ''
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('username')
    sessionStorage.removeItem('role')
    sessionStorage.removeItem('deviceId')
  }

  function checkLoginStatus() {
    return !!sessionStorage.getItem('token')
  }

  function getToken() {
    return sessionStorage.getItem('token')
  }

  return {
    isLoggedIn,
    username,
    role,
    deviceId,
    login,
    logout,
    checkLoginStatus,
    getToken
  }
})