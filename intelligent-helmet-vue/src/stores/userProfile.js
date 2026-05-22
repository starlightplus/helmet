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
  const allergies  = ref('')
  const loaded     = ref(false)

  const STORAGE_KEY = 'helmet_user_profile'

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
      if (d.allergies  != null) allergies.value  = d.allergies
      loaded.value = true
    } catch (e) {
      console.warn('[UserProfile] 从服务器加载失败，使用本地缓存:', e)
      _loadFromStorage()
    }
  }

  // ── 保存到后端 ──────────────────────────────────────────────────
  async function saveToServer() {
    try {
      await request.put('/api/user/profile', {
        nickname:   nickname.value,
        age:        age.value,
        height:     height.value,
        weight:     weight.value,
        gender:     gender.value,
        avatarData: avatarData.value,
        bio:        bio.value,
        weightUnit: weightUnit.value,
        bloodType:  bloodType.value,
        allergies:  allergies.value
      })
      _saveToStorage()
    } catch (e) {
      console.warn('[UserProfile] 保存到服务器失败，仅保存本地:', e)
      _saveToStorage()
    }
  }

  // ── localStorage 兜底 ───────────────────────────────────────────
  function _loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
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
        if (d.allergies  != null) allergies.value  = d.allergies
      }
    } catch (e) {}
  }

  function _saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        nickname: nickname.value, age: age.value, height: height.value,
        weight: weight.value, gender: gender.value, avatarData: avatarData.value,
        bio: bio.value, weightUnit: weightUnit.value,
        bloodType: bloodType.value, allergies: allergies.value
      }))
    } catch (e) {}
  }

  _loadFromStorage()

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
  function setAllergies(val)  { allergies.value = String(val || '').slice(0, 200); saveToServer() }

  return {
    nickname, age, height, weight, gender, avatarData, bio, weightUnit, bloodType, allergies, loaded,
    loadFromServer, saveToServer,
    setNickname, setAge, setHeight, setWeight, setGender, setAvatarData, setBio, setWeightUnit, setBloodType, setAllergies
  }
})
