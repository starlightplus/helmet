import { ref } from 'vue'
import { defineStore } from 'pinia'

const MAX_VERSIONS = 10

function storageKey() {
  const username = sessionStorage.getItem('username') || 'anonymous'
  return `helmet_plan_history_${username}`
}

export const usePlanHistoryStore = defineStore('planHistory', () => {
  const versions = ref([])

  function load() {
    try {
      const raw = localStorage.getItem(storageKey())
      versions.value = raw ? JSON.parse(raw) : []
    } catch {
      versions.value = []
    }
  }

  function save() {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(versions.value))
    } catch {}
  }

  /** 在采纳新规划前，将当前规划快照存入历史 */
  function snapshot(planData) {
    if (!planData || !planData.planSportText) return
    const entry = {
      savedAt: new Date().toISOString(),
      planSportText:    planData.planSportText,
      planDietText:     planData.planDietText     || '',
      planTargetWeight: planData.planTargetWeight || null,
      planWeeks:        planData.planWeeks        || null,
      planDailyIntake:  planData.planDailyIntake  || null,
      planSports:       planData.planSports       || null,
      planSportsCfg:    planData.planSportsCfg    || null,
      planAcceptedAt:   planData.planAcceptedAt   || null,
    }
    versions.value.unshift(entry)
    if (versions.value.length > MAX_VERSIONS) {
      versions.value = versions.value.slice(0, MAX_VERSIONS)
    }
    save()
  }

  function remove(index) {
    versions.value.splice(index, 1)
    save()
  }

  function clearAll() {
    versions.value = []
    save()
  }

  function $reset() {
    versions.value = []
  }

  return { versions, load, snapshot, remove, clearAll, $reset }
})
