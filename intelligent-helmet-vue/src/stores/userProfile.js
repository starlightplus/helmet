import { ref } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'helmet_user_profile'

export const useUserProfileStore = defineStore('userProfile', () => {
  const nickname = ref('')
  const age = ref(null)
  const height = ref(null)
  const weight = ref(50)

  // 初始化时从 localStorage 读取
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      if (data.nickname != null) nickname.value = data.nickname
      if (data.age != null) age.value = data.age
      if (data.height != null) height.value = data.height
      if (data.weight != null) weight.value = data.weight
    }
  } catch (e) {
    console.warn('[UserProfile] localStorage 读取失败:', e)
  }

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        nickname: nickname.value,
        age: age.value,
        height: height.value,
        weight: weight.value
      }))
    } catch (e) {
      console.warn('[UserProfile] localStorage 写入失败:', e)
    }
  }

  function setNickname(val) {
    nickname.value = String(val || '').slice(0, 20)
    saveToStorage()
  }

  function setAge(val) {
    const num = Number(val)
    if (Number.isInteger(num) && num >= 1 && num <= 120) {
      age.value = num
      saveToStorage()
    }
  }

  function setHeight(val) {
    const num = Number(val)
    if (Number.isInteger(num) && num >= 50 && num <= 250) {
      height.value = num
      saveToStorage()
    }
  }

  function setWeight(val) {
    const num = Number(val)
    if (!isNaN(num) && num >= 20 && num <= 300) {
      weight.value = num
      saveToStorage()
    }
  }

  return {
    nickname,
    age,
    height,
    weight,
    setNickname,
    setAge,
    setHeight,
    setWeight
  }
})
