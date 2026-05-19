import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const isLoggedIn = ref(!!localStorage.getItem('token'))
  const username = ref(localStorage.getItem('username') || '')
  const role = ref(localStorage.getItem('role') || 'user')
  const deviceId = ref(localStorage.getItem('deviceId') || '')

  function login(userData) {
    isLoggedIn.value = true
    username.value = userData.username
    role.value = userData.role || 'user'
    deviceId.value = userData.deviceId || ''
    localStorage.setItem('token', userData.token)
    localStorage.setItem('username', userData.username)
    localStorage.setItem('role', userData.role || 'user')
    localStorage.setItem('deviceId', userData.deviceId || '')
  }

  function logout() {
    isLoggedIn.value = false
    username.value = ''
    role.value = 'user'
    deviceId.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    localStorage.removeItem('deviceId')
  }

  function checkLoginStatus() {
    return !!localStorage.getItem('token')
  }

  function getToken() {
    return localStorage.getItem('token')
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