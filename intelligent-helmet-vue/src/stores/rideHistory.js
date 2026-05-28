import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const MAX_RIDES = 50
const MAX_TRACK_POINTS = 500

function storageKey() {
  const username = sessionStorage.getItem('username') || 'anonymous'
  return `helmet_ride_history_${username}`
}

function getToken() {
  return sessionStorage.getItem('token') || ''
}

function authHeaders() {
  const token = getToken()
  return token
    ? { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
    : { 'Content-Type': 'application/json' }
}

// 将 trackPoints 数组序列化为 JSON 字符串（后端存 TEXT）
function serializeTrackPoints(points) {
  if (!points || points.length === 0) return null
  try { return JSON.stringify(points.slice(0, MAX_TRACK_POINTS)) } catch { return null }
}

// 将后端返回的 trackPoints 字符串反序列化
function deserializeTrackPoints(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  try { return JSON.parse(raw) } catch { return [] }
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

    // 异步同步到后端（不阻塞 UI）
    if (getToken()) {
      const payload = {
        ...record,
        trackPoints: serializeTrackPoints(record.trackPoints)
      }
      fetch('/api/user/rides', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload)
      }).catch(e => console.warn('[RideHistory] 后端同步失败:', e))
    }
  }

  function removeRide(id) {
    rides.value = rides.value.filter(r => r.id !== id)
    saveToStorage()

    // 同步删除到后端
    if (getToken()) {
      fetch(`/api/user/rides/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: authHeaders()
      }).catch(e => console.warn('[RideHistory] 后端删除失败:', e))
    }
  }

  function clearAll() {
    rides.value = []
    saveToStorage()
  }

  /** 从后端加载历史，合并到本地（后端为准，本地补充未同步的） */
  async function syncFromBackend() {
    if (!getToken()) return
    try {
      const res = await fetch('/api/user/rides?limit=50', { headers: authHeaders() })
      if (!res.ok) return
      const data = await res.json()

      // 将后端数据转换为前端格式
      const backendRides = data.map(s => ({
        id:             s.id,
        startTime:      s.startTime,
        endTime:        s.endTime,
        duration:       s.duration,
        distance:       s.distance,
        avgSpeed:       s.avgSpeed,
        maxSpeed:       s.maxSpeed,
        calories:       s.calories,
        pace:           s.pace,
        safetyScore:    s.safetyScore,
        avgTemp:        s.avgTemp,
        avgHumidity:    s.avgHumidity,
        speedOverCount: s.speedOverCount,
        trackPoints:    deserializeTrackPoints(s.trackPoints)
      }))

      // 合并：后端有的用后端，本地有但后端没有的（未同步）保留并上传
      const backendIds = new Set(backendRides.map(r => r.id))
      const localOnly = rides.value.filter(r => !backendIds.has(r.id))

      // 上传本地独有的记录
      for (const ride of localOnly) {
        fetch('/api/user/rides', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ ...ride, trackPoints: serializeTrackPoints(ride.trackPoints) })
        }).catch(() => {})
      }

      // 合并后按时间倒序
      const merged = [...backendRides, ...localOnly]
      merged.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      rides.value = merged.slice(0, MAX_RIDES)
      saveToStorage()
    } catch (e) {
      console.warn('[RideHistory] 后端同步失败:', e)
    }
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

  return {
    rides,
    loadFromStorage,
    syncFromBackend,
    addRide,
    removeRide,
    clearAll,
    $reset,
    ridesGroupedByDate
  }
})
