import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'helmet_ride_history'
const MAX_RIDES = 50
const MAX_TRACK_POINTS = 500

export const useRideHistoryStore = defineStore('rideHistory', () => {
  const rides = ref(loadFromStorage())

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch (e) {
      console.warn('[RideHistory] localStorage 读取失败:', e)
    }
    return []
  }

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rides.value))
    } catch (e) {
      console.warn('[RideHistory] localStorage 写入失败:', e)
    }
  }

  function addRide(rideData) {
    // 限制 trackPoints 数量
    const record = {
      ...rideData,
      trackPoints: (rideData.trackPoints || []).slice(0, MAX_TRACK_POINTS)
    }
    rides.value.unshift(record)
    // 限制总记录数
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

    // 按日期倒序返回
    return Object.values(groups).sort((a, b) => b.date - a.date)
  })

  return {
    rides,
    addRide,
    removeRide,
    clearAll,
    ridesGroupedByDate
  }
})
