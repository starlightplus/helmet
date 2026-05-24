import { ref } from 'vue'
import { defineStore } from 'pinia'
import request from '@/utils/request'

export const useUserProfileStore = defineStore('userProfile', () => {
  const nickname   = ref('')
  const age        = ref(null)
  const height     = ref(null)
  const weight     = ref(50)
  const gender     = ref('')
  const avatarData = ref('')
  const bio        = ref('')
  const weightUnit = ref('kg')
  const bloodType  = ref('')
  const loaded     = ref(false)

  // key 带用户名，不同用户互不干扰
  function _storageKey() {
    const username = sessionStorage.getItem('username') || 'anonymous'
    return `helmet_user_profile_${username}`
  }

  // ── 重置所有字段为默认值（切换用户时调用）──────────────────────
  function $reset() {
    nickname.value   = ''
    age.value        = null
    height.value     = null
    weight.value     = 50
    gender.value     = ''
    avatarData.value = ''
    bio.value        = ''
    weightUnit.value = 'kg'
    bloodType.value  = ''
    loaded.value     = false
  }

  // ── 从后端加载 ──────────────────────────────────────────────────
  async function loadFromServer() {
    try {
      const res = await request.get('/api/user/profile')
      const d = res.data
      if (d.nickname   != null) nickname.value   = d.nickname
      if (d.age        != null) age.value        = d.age
      if (d.height     != null) height.value     = d.height
      if (d.weight     != null) weight.value     = d.weight
      if (d.gender     != null) gender.value     = d.gender
      if (d.avatarData != null) avatarData.value = d.avatarData
      if (d.bio        != null) bio.value        = d.bio
      if (d.weightUnit != null) weightUnit.value = d.weightUnit
      if (d.bloodType  != null) bloodType.value  = d.bloodType
      loaded.value = true
      _saveToStorage() // 用服务器数据更新本地缓存
    } catch (e) {
      console.warn('[UserProfile] 从服务器加载失败，使用本地缓存:', e)
      _loadFromStorage()
    }
  }

  // ── 保存到后端 ──────────────────────────────────────────────────
  async function saveToServer() {
    await request.put('/api/user/profile', {
      nickname:   nickname.value,
      age:        age.value,
      height:     height.value,
      weight:     weight.value,
      gender:     gender.value,
      avatarData: avatarData.value,
      bio:        bio.value,
      weightUnit: weightUnit.value,
      bloodType:  bloodType.value
    })
    _saveToStorage()
  }

  // ── localStorage 兜底（key 带用户名）───────────────────────────
  function _loadFromStorage() {
    try {
      const raw = localStorage.getItem(_storageKey())
      if (raw) {
        const d = JSON.parse(raw)
        if (d.nickname   != null) nickname.value   = d.nickname
        if (d.age        != null) age.value        = d.age
        if (d.height     != null) height.value     = d.height
        if (d.weight     != null) weight.value     = d.weight
        if (d.gender     != null) gender.value     = d.gender
        if (d.avatarData != null) avatarData.value = d.avatarData
        if (d.bio        != null) bio.value        = d.bio
        if (d.weightUnit != null) weightUnit.value = d.weightUnit
        if (d.bloodType  != null) bloodType.value  = d.bloodType
      }
    } catch (e) {}
  }

  function _saveToStorage() {
    try {
      localStorage.setItem(_storageKey(), JSON.stringify({
        nickname: nickname.value, age: age.value, height: height.value,
        weight: weight.value, gender: gender.value, avatarData: avatarData.value,
        bio: bio.value, weightUnit: weightUnit.value,
        bloodType: bloodType.value
      }))
    } catch (e) {}
  }

  // 初始化时不再预加载 localStorage，等 loadFromServer() 调用后再决定
  // （避免登录前就把旧用户数据填入）

  // ── Setters ──────────────────────────────────────────────────
  function setNickname(val) { nickname.value = String(val || '').slice(0, 20); saveToServer() }
  function setAge(val) {
    const n = Number(val)
    if (Number.isInteger(n) && n >= 1 && n <= 150) { age.value = n; saveToServer() }
  }
  function setHeight(val) {
    const n = Number(val)
    if (Number.isInteger(n) && n >= 50 && n <= 250) { height.value = n; saveToServer() }
  }
  function setWeight(val) {
    const n = Number(val)
    if (!isNaN(n) && n >= 1 && n <= 400) { weight.value = n; saveToServer() }
  }
  function setGender(val)     { gender.value = val || '';     saveToServer() }
  function setAvatarData(val) { avatarData.value = val || ''; saveToServer() }
  function setBio(val)        { bio.value = String(val || '').slice(0, 200); saveToServer() }
  function setWeightUnit(val) { weightUnit.value = val || 'kg'; saveToServer() }
  function setBloodType(val)  { bloodType.value = val || ''; saveToServer() }

  return {
    nickname, age, height, weight, gender, avatarData, bio, weightUnit, bloodType, loaded,
    loadFromServer, saveToServer, $reset,
    setNickname, setAge, setHeight, setWeight, setGender, setAvatarData, setBio, setWeightUnit, setBloodType
  }
})
