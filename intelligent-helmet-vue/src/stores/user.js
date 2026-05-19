import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const isLoggedIn = ref(!!sessionStorage.getItem('token'))
  const username = ref(sessionStorage.getItem('username') || '')
  const role = ref(sessionStorage.getItem('role') || 'user')
  const deviceId = ref(sessionStorage.getItem('deviceId') || '')

  function login(userData) {
    isLoggedIn.value = true
    username.value = userData.username
    role.value = userData.role || 'user'
    deviceId.value = userData.deviceId || ''
    sessionStorage.setItem('token', userData.token)
    sessionStorage.setItem('username', userData.username)
    sessionStorage.setItem('role', userData.role || 'user')
    sessionStorage.setItem('deviceId', userData.deviceId || '')
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