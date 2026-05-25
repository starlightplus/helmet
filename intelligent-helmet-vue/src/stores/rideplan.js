import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useRidePlanStore = defineStore('ridePlan', () => {
  const plan = ref(null)   // null = 未加载或无规划
  const loaded = ref(false)

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
    } catch {}
    loaded.value = true
  }

  function clear() {
    plan.value = null
  }

  return { plan, loaded, hasPlan, fetchPlan, clear }
})
