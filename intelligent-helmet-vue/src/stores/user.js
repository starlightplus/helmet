import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const isLoggedIn = ref(false)
  const username = ref('')
  
  function login(userData) {
    isLoggedIn.value = true
    username.value = userData.username
  }
  
  function logout() {
    isLoggedIn.value = false
    username.value = ''
  }
  
  function checkLoginStatus() {
    // 简单的检查，实际项目中可能需要验证token
    return isLoggedIn.value
  }
  
  return {
    isLoggedIn,
    username,
    login,
    logout,
    checkLoginStatus
  }
})