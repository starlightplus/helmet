<template>
  <view class="container">

    <!-- 跌倒警告（浮层） -->
    <view v-if="fallFlag" class="alert-float blink">
      <text class="alert-icon">⚠️</text>
      <view>
        <text class="alert-title">跌倒警告</text>
        <text class="alert-desc">检测到异常跌倒，请立即确认安全！</text>
      </view>
    </view>

    <!-- 地图全屏背景 -->
    <view class="map-bg">
      <map
        :longitude="longitude"
        :latitude="latitude"
        :markers="markers"
        :polyline="polyline"
        :show-location="true"
        style="width: 100%; height: 100%;"
      />
    </view>

    <!-- 顶部状态条（悬浮） -->
    <view class="top-bar">
      <view class="conn-pill" :class="{ online: isConnected }">
        <view class="conn-dot"></view>
        <view class="pulse-ring" v-if="isConnected"></view>
        <text class="conn-text">{{ isConnected ? '已连接' : '未连接' }}</text>
      </view>
      <view class="top-right">
        <text class="device-label">{{ deviceId || 'HELMET-001' }}</text>
        <text class="gps-pts">{{ gpsHistory.length }} pts</text>
      </view>
    </view>

    <!-- 底部内容面板 -->
    <view class="bottom-sheet">

      <!-- 骑行卡 -->
      <view class="ride-card" :class="{ riding: isRiding }">
        <!-- 顶部彩条 -->
        <view class="ride-strip" :class="{ active: isRiding }"></view>

        <!-- 非骑行状态 -->
        <view v-if="!isRiding" class="idle-state">
          <text class="idle-icon">🚴</text>
          <view>
            <text class="idle-title">等待骑行</text>
            <text class="idle-sub">设备上线后自动开始记录</text>
          </view>
        </view>

        <!-- 骑行中 -->
        <view v-else class="riding-state">
          <view class="ride-header">
            <view class="riding-badge">
              <view class="riding-dot"></view>
              <text class="riding-label">骑行中</text>
            </view>
            <text class="ride-timer">⏱ {{ formattedDuration }}</text>
          </view>

          <!-- 大速度 -->
          <view class="speed-section">
            <text class="speed-value" :class="{ warning: speedWarning }">{{ currentSpeed.toFixed(1) }}</text>
            <text class="speed-unit">km/h</text>
          </view>
          <text v-if="speedWarning" class="speed-warn">⚠ 注意减速</text>

          <!-- 统计网格 -->
          <view class="stats-grid">
            <view class="stat-item">
              <text class="stat-val">{{ rideDistance.toFixed(2) }}</text>
              <text class="stat-lbl">距离 km</text>
            </view>
            <view class="stat-item">
              <text class="stat-val">{{ avgSpeed.toFixed(1) }}</text>
              <text class="stat-lbl">均速 km/h</text>
            </view>
            <view class="stat-item">
              <text class="stat-val">{{ maxSpeed.toFixed(1) }}</text>
              <text class="stat-lbl">最高 km/h</text>
            </view>
            <view class="stat-item">
              <text class="stat-val cal">{{ Math.round(calories) }}</text>
              <text class="stat-lbl">卡路里</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 温湿度行 -->
      <view class="env-row">
        <view class="env-card">
          <text class="env-icon">🌡️</text>
          <text class="env-val temp">{{ temperature }}°C</text>
          <view class="env-bar-bg">
            <view class="env-bar temp-bar" :style="{ width: tempPercent + '%' }"></view>
          </view>
          <text class="env-lbl">温度</text>
        </view>
        <view class="env-card">
          <text class="env-icon">💧</text>
          <text class="env-val hum">{{ humidity }}%</text>
          <view class="env-bar-bg">
            <view class="env-bar hum-bar" :style="{ width: humidity + '%' }"></view>
          </view>
          <text class="env-lbl">湿度</text>
        </view>
        <view class="env-card">
          <text class="env-icon">📍</text>
          <text class="env-val gps">{{ latitude.toFixed(4) }}</text>
          <text class="env-val gps small">{{ longitude.toFixed(4) }}</text>
          <text class="env-lbl">GPS</text>
        </view>
      </view>

    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'

const WS_URL = 'ws://localhost:8082/ws/sensor-data'
const { isConnected, sensorData, connect } = useWebSocket(WS_URL)

const temperature = ref(0)
const humidity = ref(0)
const longitude = ref(116.404)
const latitude = ref(39.915)
const fallFlag = ref(false)
const deviceId = ref('')
const gpsHistory = ref([])
const markers = ref([])
const polyline = ref([])

// 骑行统计
const isRiding = ref(false)
const currentSpeed = ref(0)
const rideDistance = ref(0)
const maxSpeed = ref(0)
const avgSpeed = ref(0)
const calories = ref(0)
const rideDuration = ref(0)
const speedWarning = ref(false)
let rideTimer = null
let lastPos = null
let speedSamples = []

const tempPercent = computed(() => Math.min(100, Math.max(0, (temperature.value / 50) * 100)))

const formattedDuration = computed(() => {
  const s = rideDuration.value
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
})

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

watch(sensorData, (data) => {
  if (!data) return
  temperature.value = data.temperature ?? 0
  humidity.value = data.humidity ?? 0
  longitude.value = data.longitude || longitude.value
  latitude.value = data.latitude || latitude.value
  fallFlag.value = data.fallFlag || false
  deviceId.value = data.deviceId || ''

  if (data.fallFlag) uni.vibrateLong()

  if (data.longitude && data.latitude) {
    const pos = { longitude: data.longitude, latitude: data.latitude }
    gpsHistory.value.push(pos)

    // 计算速度和距离
    if (lastPos) {
      const dist = haversine(lastPos.latitude, lastPos.longitude, pos.latitude, pos.longitude)
      rideDistance.value += dist
      // 假设每次数据推送间隔约1秒，速度 = dist * 3600
      const spd = dist * 3600
      currentSpeed.value = parseFloat(spd.toFixed(1))
      speedWarning.value = spd > 30
      if (spd > maxSpeed.value) maxSpeed.value = spd
      speedSamples.push(spd)
      avgSpeed.value = speedSamples.reduce((a,b) => a+b, 0) / speedSamples.length
      calories.value = rideDistance.value * 40 // 约40kcal/km
    }
    lastPos = pos

    if (!isRiding.value && isConnected.value) {
      isRiding.value = true
      rideTimer = setInterval(() => { rideDuration.value++ }, 1000)
    }

    markers.value = [{ id: 1, longitude: data.longitude, latitude: data.latitude, width: 32, height: 32 }]
    if (gpsHistory.value.length > 1) {
      polyline.value = [{ points: gpsHistory.value, color: '#00F0FF', width: 4 }]
    }
  }
})

watch(isConnected, (val) => {
  if (!val && isRiding.value) {
    isRiding.value = false
    clearInterval(rideTimer)
  }
})

onMounted(() => { connect() })
</script>

<style scoped>
.container {
  height: 100vh;
  background: #0a0a1a;
  position: relative;
  overflow: hidden;
}

/* 地图全屏 */
.map-bg {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 65vh;
}

/* 跌倒警告浮层 */
.alert-float {
  position: fixed;
  top: 120rpx;
  left: 24rpx; right: 24rpx;
  z-index: 999;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx 28rpx;
  background: rgba(20, 0, 0, 0.92);
  border: 2rpx solid #ff4444;
  border-radius: 20rpx;
  backdrop-filter: blur(10px);
}
.alert-float.blink {
  animation: blink 0.6s ease-in-out infinite alternate;
}
@keyframes blink {
  from { border-color: rgba(255,68,68,0.3); box-shadow: none; }
  to { border-color: #ff4444; box-shadow: 0 0 30rpx rgba(255,68,68,0.5); }
}
.alert-icon { font-size: 48rpx; }
.alert-title { color: #ff6666; font-size: 28rpx; font-weight: bold; display: block; }
.alert-desc { color: #ff9999; font-size: 22rpx; display: block; margin-top: 4rpx; }

/* 顶部悬浮状态条 */
.top-bar {
  position: absolute;
  top: 0; left: 0; right: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 100rpx 28rpx 20rpx;
  background: linear-gradient(to bottom, rgba(10,10,26,0.85) 0%, transparent 100%);
}
.conn-pill {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 10rpx 22rpx;
  border-radius: 40rpx;
  background: rgba(255,68,68,0.2);
  border: 1rpx solid rgba(255,68,68,0.5);
  position: relative;
}
.conn-pill.online {
  background: rgba(0,240,255,0.12);
  border-color: rgba(0,240,255,0.4);
}
.conn-dot {
  width: 14rpx; height: 14rpx;
  border-radius: 50%;
  background: #ff4444;
}
.conn-pill.online .conn-dot { background: #00F0FF; }
.pulse-ring {
  position: absolute;
  left: 16rpx;
  width: 26rpx; height: 26rpx;
  border-radius: 50%;
  border: 2rpx solid #00F0FF;
  animation: pulse 1.5s ease-out infinite;
}
@keyframes pulse {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(2.2); opacity: 0; }
}
.conn-text { color: #fff; font-size: 24rpx; }
.top-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4rpx; }
.device-label { color: rgba(255,255,255,0.7); font-size: 22rpx; font-family: monospace; }
.gps-pts { color: rgba(0,240,255,0.6); font-size: 20rpx; }

/* 底部面板 */
.bottom-sheet {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: linear-gradient(to top, #0a0a1a 80%, transparent 100%);
  padding: 40rpx 24rpx 130rpx;
}

/* 骑行卡 */
.ride-card {
  background: rgba(15,18,36,0.95);
  border-radius: 24rpx;
  border: 1rpx solid rgba(255,255,255,0.06);
  overflow: hidden;
  margin-bottom: 20rpx;
  backdrop-filter: blur(20px);
}
.ride-card.riding {
  border-color: rgba(0,240,255,0.2);
  box-shadow: 0 4rpx 40rpx rgba(0,240,255,0.08);
}
.ride-strip {
  height: 4rpx;
  background: rgba(255,255,255,0.05);
}
.ride-strip.active {
  background: linear-gradient(90deg, transparent, #00F0FF, #A855F7, #00F0FF, transparent);
  animation: strip 3s ease infinite;
}
@keyframes strip {
  0%,100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* 非骑行 */
.idle-state {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 32rpx 28rpx;
}
.idle-icon { font-size: 52rpx; }
.idle-title { color: #8892A0; font-size: 28rpx; font-weight: 600; display: block; }
.idle-sub { color: #4a5568; font-size: 22rpx; display: block; margin-top: 4rpx; }

/* 骑行中 */
.riding-state { padding: 24rpx 28rpx; }
.ride-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}
.riding-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 6rpx 18rpx;
  background: rgba(0,196,154,0.1);
  border: 1rpx solid rgba(0,196,154,0.25);
  border-radius: 30rpx;
}
.riding-dot {
  width: 10rpx; height: 10rpx;
  border-radius: 50%;
  background: #00F0FF;
  box-shadow: 0 0 8rpx rgba(0,240,255,0.8);
  animation: dot-pulse 1.5s ease infinite;
}
@keyframes dot-pulse {
  0%,100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.riding-label { color: #00F0FF; font-size: 22rpx; font-weight: 700; }
.ride-timer { color: #E0F2FE; font-size: 28rpx; font-weight: 700; font-family: monospace; }

.speed-section {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
  justify-content: center;
  margin-bottom: 8rpx;
}
.speed-value {
  font-size: 96rpx;
  font-weight: 800;
  color: #E0F2FE;
  font-family: monospace;
  line-height: 1;
  transition: color 0.3s;
}
.speed-value.warning { color: #A855F7; }
.speed-unit { font-size: 28rpx; color: #8892A0; font-weight: 600; }
.speed-warn {
  text-align: center;
  color: #A855F7;
  font-size: 22rpx;
  margin-bottom: 16rpx;
  animation: warn-blink 1s ease infinite;
}
@keyframes warn-blink {
  0%,100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid rgba(255,255,255,0.05);
}
.stat-item { display: flex; flex-direction: column; align-items: center; gap: 4rpx; }
.stat-val { font-size: 32rpx; font-weight: 700; color: #E0F2FE; font-family: monospace; }
.stat-val.cal { color: #00D9FF; }
.stat-lbl { font-size: 20rpx; color: #8892A0; }

/* 温湿度行 */
.env-row {
  display: flex;
  gap: 16rpx;
}
.env-card {
  flex: 1;
  background: rgba(15,18,36,0.9);
  border: 1rpx solid rgba(255,255,255,0.06);
  border-radius: 20rpx;
  padding: 20rpx 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  backdrop-filter: blur(10px);
}
.env-icon { font-size: 32rpx; }
.env-val { font-size: 30rpx; font-weight: 700; font-family: monospace; }
.env-val.temp { color: #FF6B35; }
.env-val.hum { color: #00D9FF; }
.env-val.gps { color: #00FF88; font-size: 22rpx; }
.env-val.small { font-size: 20rpx; }
.env-bar-bg {
  width: 100%;
  height: 6rpx;
  background: rgba(255,255,255,0.08);
  border-radius: 3rpx;
  overflow: hidden;
}
.env-bar { height: 100%; border-radius: 3rpx; transition: width 0.4s ease; }
.temp-bar { background: linear-gradient(90deg, #FF6B35, #FF3366); }
.hum-bar { background: linear-gradient(90deg, #00D9FF, #7B61FF); }
.env-lbl { color: #555; font-size: 20rpx; }
</style>
