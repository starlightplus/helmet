import { ref, computed } from 'vue'

/**
 * Haversine 公式计算两个 GPS 坐标之间的距离（单位：km）
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371 // 地球半径 km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * 格式化骑行时长（秒 → mm:ss 或 hh:mm:ss）
 */
export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * 根据速度获取 MET 值（代谢当量）
 */
function getMET(speedKmh) {
  if (speedKmh < 16) return 4.0
  if (speedKmh < 19) return 6.8
  if (speedKmh < 22) return 8.0
  if (speedKmh < 25) return 10.0
  return 12.0
}

/**
 * 计算卡路里：MET × 体重(kg) × 时间(h)
 */
export function calculateCalories(avgSpeedKmh, weightKg, durationSec) {
  const met = getMET(avgSpeedKmh)
  return met * weightKg * (durationSec / 3600)
}

/**
 * 计算安全评分（0-100）
 */
export function calculateSafetyScore(speedOverCount, eventCount, maxSpeed) {
  let score = 100
  // 每次超速扣 5 分
  score -= speedOverCount * 5
  // 每次事件扣 15 分
  score -= eventCount * 15
  // 最高速度超过 30 额外扣分
  if (maxSpeed > 30) score -= (maxSpeed - 30) * 2
  return Math.max(0, Math.min(100, Math.round(score)))
}

const GPS_TIMEOUT = 2 * 60 * 1000       // 2 分钟无 GPS → 结束骑行
const GPS_GAP_TOLERANCE = 60 * 1000     // 1 分钟内的 GPS 中断不切断骑行
const MAX_SPEED_FILTER = 100            // > 100km/h 视为 GPS 漂移
const SPEED_WARNING_THRESHOLD = 25      // > 25km/h 超速警告
const ZERO_SPEED_TIMEOUT = 60 * 1000    // 1 分钟速度为 0 → 停止计时

export function useRideTracking() {
  // 对外暴露的响应式状态
  const isRiding = ref(false)
  const currentSpeed = ref(0)
  const rideDistance = ref(0)
  const rideDuration = ref(0)
  const rideStartTime = ref(null)
  const maxSpeed = ref(0)
  const avgSpeed = ref(0)
  const speedWarning = ref(false)
  const trackPoints = ref([])
  const calories = ref(0)
  const pace = ref(0) // min/km
  const speedOverCount = ref(0)

  // 内部变量
  let lastGpsPoint = null
  let gpsTimeoutTimer = null
  let durationTimer = null
  let zeroSpeedTimer = null
  let eventCount = 0
  let onRideEnd = null
  let userWeight = 50 // 默认体重
  let wasOverSpeed = false // 用于统计超速次数（边沿检测）
  let isPaused = false // 是否暂停计时

  // 环境温湿度累计
  let tempSum = 0
  let tempCount = 0
  let humiSum = 0
  let humiCount = 0

  function setOnRideEnd(cb) {
    onRideEnd = cb
  }

  function setWeight(w) {
    userWeight = w || 50
  }

  function startRide(firstPoint) {
    isRiding.value = true
    currentSpeed.value = 0
    rideDistance.value = 0
    rideDuration.value = 0
    maxSpeed.value = 0
    avgSpeed.value = 0
    speedWarning.value = false
    trackPoints.value = []
    calories.value = 0
    pace.value = 0
    speedOverCount.value = 0
    eventCount = 0
    wasOverSpeed = false
    tempSum = 0; tempCount = 0
    humiSum = 0; humiCount = 0
    rideStartTime.value = new Date()
    lastGpsPoint = { ...firstPoint, time: Date.now() }

    trackPoints.value.push({
      lng: firstPoint.lng,
      lat: firstPoint.lat,
      time: Date.now(),
      speed: 0
    })

    if (durationTimer) clearInterval(durationTimer)
    durationTimer = setInterval(() => {
      if (!isPaused) {
        rideDuration.value++
        // 每秒更新卡路里和配速（仅当有速度时）
        if (rideDistance.value > 0 && rideDuration.value > 0 && currentSpeed.value > 0) {
          calories.value = calculateCalories(avgSpeed.value, userWeight, rideDuration.value)
          pace.value = (rideDuration.value / 60) / rideDistance.value // min/km
        }
      }
    }, 1000)
  }

  function endRide() {
    if (!isRiding.value) return null

    if (gpsTimeoutTimer) { clearTimeout(gpsTimeoutTimer); gpsTimeoutTimer = null }
    if (durationTimer) { clearInterval(durationTimer); durationTimer = null }
    if (zeroSpeedTimer) { clearTimeout(zeroSpeedTimer); zeroSpeedTimer = null }

    const finalCalories = calculateCalories(avgSpeed.value, userWeight, rideDuration.value)
    const finalPace = rideDistance.value > 0 ? (rideDuration.value / 60) / rideDistance.value : 0

    const summary = {
      id: `ride_${Date.now()}`,
      startTime: rideStartTime.value ? rideStartTime.value.toISOString() : null,
      endTime: new Date().toISOString(),
      duration: rideDuration.value,
      distance: Math.round(rideDistance.value * 100) / 100,
      avgSpeed: Math.round(avgSpeed.value * 10) / 10,
      maxSpeed: Math.round(maxSpeed.value * 10) / 10,
      eventCount,
      calories: Math.round(finalCalories),
      pace: Math.round(finalPace * 10) / 10,
      speedOverCount: speedOverCount.value,
      avgTemp: tempCount > 0 ? Math.round((tempSum / tempCount) * 10) / 10 : null,
      avgHumidity: humiCount > 0 ? Math.round((humiSum / humiCount) * 10) / 10 : null,
      safetyScore: calculateSafetyScore(speedOverCount.value, eventCount, maxSpeed.value),
      trackPoints: trackPoints.value.slice(0, 500)
    }

    // 重置状态
    isRiding.value = false
    currentSpeed.value = 0
    rideDistance.value = 0
    rideDuration.value = 0
    rideStartTime.value = null
    maxSpeed.value = 0
    avgSpeed.value = 0
    speedWarning.value = false
    trackPoints.value = []
    calories.value = 0
    pace.value = 0
    speedOverCount.value = 0
    lastGpsPoint = null
    eventCount = 0
    wasOverSpeed = false
    isPaused = false
    tempSum = 0; tempCount = 0
    humiSum = 0; humiCount = 0

    if (onRideEnd && summary.duration > 10 && summary.distance > 0.01) {
      onRideEnd(summary)
    }

    return summary
  }

  function resetGpsTimeout() {
    if (gpsTimeoutTimer) clearTimeout(gpsTimeoutTimer)
    gpsTimeoutTimer = setTimeout(() => {
      if (isRiding.value) {
        endRide()
      }
    }, GPS_TIMEOUT)
  }

  function processGpsData(payload) {
    const lng = Number(payload.longitude)
    const lat = Number(payload.latitude)
    if (!lng || !lat || isNaN(lng) || isNaN(lat)) return

    const now = Date.now()

    resetGpsTimeout()

    if (!isRiding.value) {
      startRide({ lng, lat })
      return
    }

    if (lastGpsPoint) {
      const timeDiff = (now - lastGpsPoint.time) / 1000
      if (timeDiff <= 0) return

      if (timeDiff * 1000 > GPS_GAP_TOLERANCE) {
        lastGpsPoint = { lng, lat, time: now }
        trackPoints.value.push({ lng, lat, time: now, speed: 0 })
        return
      }

      const dist = haversineDistance(lastGpsPoint.lat, lastGpsPoint.lng, lat, lng)
      const speed = (dist / timeDiff) * 3600

      if (speed > MAX_SPEED_FILTER) {
        return
      }

      currentSpeed.value = Math.round(speed * 10) / 10
      rideDistance.value += dist

      // 速度为 0 时暂停计时，1 分钟后停止
      if (speed === 0 || currentSpeed.value === 0) {
        if (!isPaused) {
          isPaused = true
          if (zeroSpeedTimer) clearTimeout(zeroSpeedTimer)
          zeroSpeedTimer = setTimeout(() => {
            if (isRiding.value && isPaused) {
              endRide()
            }
          }, ZERO_SPEED_TIMEOUT)
        }
      } else {
        // 有速度时恢复计时
        if (isPaused) {
          isPaused = false
          if (zeroSpeedTimer) { clearTimeout(zeroSpeedTimer); zeroSpeedTimer = null }
        }
      }

      // 超速检测（边沿触发：从不超速→超速 才计数一次）
      const isOver = speed > SPEED_WARNING_THRESHOLD
      speedWarning.value = isOver
      if (isOver && !wasOverSpeed) {
        speedOverCount.value++
      }
      wasOverSpeed = isOver

      if (speed > maxSpeed.value) {
        maxSpeed.value = speed
      }

      if (rideDuration.value > 0) {
        avgSpeed.value = (rideDistance.value / rideDuration.value) * 3600
      }

      trackPoints.value.push({
        lng,
        lat,
        time: now,
        speed: Math.round(speed * 10) / 10
      })
    }

    lastGpsPoint = { lng, lat, time: now }
  }

  /**
   * 处理传感器数据（温湿度累计）
   */
  function processSensorData(payload) {
    if (!isRiding.value) return
    if (payload.temperature != null) {
      tempSum += Number(payload.temperature)
      tempCount++
    }
    if (payload.humidity != null) {
      humiSum += Number(payload.humidity)
      humiCount++
    }
  }

  /**
   * 处理事件数据（摔倒/急刹等）
   */
  function processEventData(payload) {
    if (!isRiding.value) return
    if (payload.fallFlag || payload.brakeFlag) {
      eventCount++
    }
  }

  function destroy() {
    if (gpsTimeoutTimer) { clearTimeout(gpsTimeoutTimer); gpsTimeoutTimer = null }
    if (durationTimer) { clearInterval(durationTimer); durationTimer = null }
    if (zeroSpeedTimer) { clearTimeout(zeroSpeedTimer); zeroSpeedTimer = null }
  }

  return {
    isRiding,
    currentSpeed,
    rideDistance,
    rideDuration,
    rideStartTime,
    maxSpeed,
    avgSpeed,
    speedWarning,
    trackPoints,
    calories,
    pace,
    speedOverCount,
    processGpsData,
    processSensorData,
    processEventData,
    endRide,
    destroy,
    setOnRideEnd,
    setWeight
  }
}
