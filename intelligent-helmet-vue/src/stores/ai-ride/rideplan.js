import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useRidePlanStore = defineStore('ridePlan', () => {
  const plan = ref(null)   // null = 未加载或无规划
  const loaded = ref(false)
  const dietRestrictions = ref([])  // 饮食限制列表

  const hasPlan = computed(() => !!(plan.value?.planSportText))

  function getToken() { return sessionStorage.getItem('token') || '' }

  async function fetchPlan() {
    const token = getToken()
    if (!token) return
    try {
      const res = await fetch('/api/user/profile', {
        headers: { Authorization: 'Bearer ' + token }
      })
      if (!res.ok) return
      const d = await res.json()
      plan.value = d.planSportText ? d : null
      // 恢复饮食限制
      if (d.planDietRestrictions) {
        dietRestrictions.value = d.planDietRestrictions.split(',').filter(Boolean)
      }
    } catch {}
    loaded.value = true
  }

  function setDietRestrictions(list) {
    dietRestrictions.value = list || []
  }

  function clear() {
    plan.value = null
    dietRestrictions.value = []
  }

  return { plan, loaded, hasPlan, dietRestrictions, fetchPlan, setDietRestrictions, clear }
})
