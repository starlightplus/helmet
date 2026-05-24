import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const MAX_RIDES = 50
const MAX_TRACK_POINTS = 500

function storageKey() {
  const username = sessionStorage.getItem('username') || 'anonymous'
  return `helmet_ride_history_${username}`
}

export const useRideHistoryStore = defineStore('rideHistory', () => {
  const rides = ref([])

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(storageKey())
      if (raw) rides.value = JSON.parse(raw)
      else rides.value = []
    } catch (e) {
      console.warn('[RideHistory] localStorage 读取失败:', e)
      rides.value = []
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(rides.value))
    } catch (e) {
      console.warn('[RideHistory] localStorage 写入失败:', e)
    }
  }

  function $reset() {
    rides.value = []
  }

  function addRide(rideData) {
    const record = {
      ...rideData,
      trackPoints: (rideData.trackPoints || []).slice(0, MAX_TRACK_POINTS)
    }
    rides.value.unshift(record)
    if (rides.value.length > MAX_RIDES) {
      rides.value = rides.value.slice(0, MAX_RIDES)
    }
    saveToStorage()
  }

  function removeRide(id) {
    rides.value = rides.value.filter(r => r.id !== id)
    saveToStorage()
  }

  function clearAll() {
    rides.value = []
    saveToStorage()
  }

  // 按日期分组
  const ridesGroupedByDate = computed(() => {
    const groups = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    for (const ride of rides.value) {
      const rideDate = new Date(ride.startTime)
      rideDate.setHours(0, 0, 0, 0)

      let label
      if (rideDate.getTime() === today.getTime()) {
        label = '今天'
      } else if (rideDate.getTime() === yesterday.getTime()) {
        label = '昨天'
      } else {
        label = `${rideDate.getMonth() + 1}月${rideDate.getDate()}日`
      }

      if (!groups[label]) {
        groups[label] = { label, date: rideDate.getTime(), rides: [] }
      }
      groups[label].rides.push(ride)
    }

    return Object.values(groups).sort((a, b) => b.date - a.date)
  })

  // 初始化时不立即读取，等 login 后调用 loadFromStorage()
  return {
    rides,
    loadFromStorage,
    addRide,
    removeRide,
    clearAll,
    $reset,
    ridesGroupedByDate
  }
})
