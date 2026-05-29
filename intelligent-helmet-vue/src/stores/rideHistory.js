import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const MAX_RIDES = 200
const MAX_TRACK_POINTS = 500

function getToken() {
  return sessionStorage.getItem('token') || ''
}

function authHeaders() {
  const token = getToken()
  return token
    ? { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
    : { 'Content-Type': 'application/json' }
}

function serializeTrackPoints(points) {
  if (!points || points.length === 0) return null
  try { return JSON.stringify(points.slice(0, MAX_TRACK_POINTS)) } catch { return null }
}

function deserializeTrackPoints(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  try { return JSON.parse(raw) } catch { return [] }
}

function backendToRide(s) {
  return {
    id:             s.id,
    startTime:      s.startTime,
    endTime:        s.endTime,
    duration:       s.duration,
    durationMin:    s.duration != null ? s.duration / 60 : 0,
    distance:       s.distance,
    distanceKm:     s.distance,
    avgSpeed:       s.avgSpeed,
    maxSpeed:       s.maxSpeed,
    calories:       s.calories,
    kcal:           s.calories,
    pace:           s.pace,
    safetyScore:    s.safetyScore,
    avgTemp:        s.avgTemp,
    avgHumidity:    s.avgHumidity,
    speedOverCount: s.speedOverCount,
    trackPoints:    deserializeTrackPoints(s.trackPoints)
  }
}

export const useRideHistoryStore = defineStore('rideHistory', () => {
  const rides = ref([])
  const loaded = ref(false)

  function $reset() {
    rides.value = []
    loaded.value = false
  }

  function addRide(rideData) {
    const record = {
      ...rideData,
      trackPoints: (rideData.trackPoints || []).slice(0, MAX_TRACK_POINTS)
    }
    rides.value.unshift(record)
    if (rides.value.length > MAX_RIDES) rides.value = rides.value.slice(0, MAX_RIDES)

    if (getToken()) {
      fetch('/api/user/rides', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ ...record, trackPoints: serializeTrackPoints(record.trackPoints) })
      }).catch(e => console.warn('[RideHistory] 后端同步失败:', e))
    }
  }

  function removeRide(id) {
    rides.value = rides.value.filter(r => r.id !== id)
    if (getToken()) {
      fetch(`/api/user/rides/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: authHeaders()
      }).catch(e => console.warn('[RideHistory] 后端删除失败:', e))
    }
  }

  function clearAll() {
    rides.value = []
  }

  /** 从后端加载历史（主数据源，不再依赖 localStorage） */
  async function syncFromBackend() {
    if (!getToken()) return
    try {
      const res = await fetch('/api/user/rides?limit=200', { headers: authHeaders() })
      if (!res.ok) return
      rides.value = (await res.json()).map(backendToRide)
      loaded.value = true
    } catch (e) {
      console.warn('[RideHistory] 后端同步失败:', e)
    }
  }

  // 兼容旧调用
  async function loadFromStorage() {
    await syncFromBackend()
  }

  /**
   * 按日期范围从后端获取骑行汇总（月历用）
   * 返回 { "YYYY-MM-DD": { durationMin, distanceKm, calories, count } }
   */
  async function fetchByDateRange(from, to) {
    if (!getToken()) return {}
    try {
      const res = await fetch(`/api/user/rides/range?from=${from}&to=${to}`, { headers: authHeaders() })
      if (!res.ok) return {}
      return await res.json()
    } catch {
      return {}
    }
  }

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
      if (rideDate.getTime() === today.getTime()) label = '今天'
      else if (rideDate.getTime() === yesterday.getTime()) label = '昨天'
      else label = `${rideDate.getMonth() + 1}月${rideDate.getDate()}日`

      if (!groups[label]) groups[label] = { label, date: rideDate.getTime(), rides: [] }
      groups[label].rides.push(ride)
    }
    return Object.values(groups).sort((a, b) => b.date - a.date)
  })

  return {
    rides,
    loaded,
    loadFromStorage,
    syncFromBackend,
    fetchByDateRange,
    addRide,
    removeRide,
    clearAll,
    $reset,
    ridesGroupedByDate
  }
})
