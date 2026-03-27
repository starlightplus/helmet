<template>
  <view class="twin-container">

    <!-- 头盔状态卡片 -->
    <view class="helmet-card">
      <view class="helmet-icon-wrap">
        <text class="helmet-icon">⛑️</text>
        <view class="helmet-glow" :class="{ active: isConnected }"></view>
      </view>
      <view class="helmet-info">
        <text class="helmet-title">智能头盔</text>
        <text class="helmet-id">{{ deviceId || 'HELMET-001' }}</text>
      </view>
      <view class="conn-badge" :class="{ online: isConnected }">
        <view class="conn-dot"></view>
        <text class="conn-text">{{ isConnected ? '在线' : '离线' }}</text>
      </view>
    </view>

    <!-- 舒适度指数 -->
    <view class="comfort-card">
      <view class="comfort-left">
        <text class="comfort-label">舒适度指数</text>
        <text class="comfort-value" :style="{ color: comfortColor }">{{ comfortScore }}</text>
        <text class="comfort-desc" :style="{ color: comfortColor }">{{ comfortText }}</text>
      </view>
      <view class="comfort-ring-wrap">
        <view class="comfort-ring" :style="{ borderColor: comfortColor, boxShadow: `0 0 20rpx ${comfortColor}55` }">
          <text class="comfort-pct" :style="{ color: comfortColor }">{{ comfortScore }}%</text>
        </view>
      </view>
    </view>

    <!-- 温湿度行 -->
    <view class="env-row">
      <!-- 温度 -->
      <view class="env-card">
        <view class="env-top">
          <text class="env-icon">🌡️</text>
          <text class="env-label">温度</text>
        </view>
        <text class="env-big temp-color">{{ temperature }}°</text>
        <view class="thermo-wrap">
          <view class="thermo-track">
            <view class="thermo-fill temp-fill" :style="{ height: tempPercent + '%' }"></view>
          </view>
          <view class="thermo-scale">
            <text class="scale-text">50</text>
            <text class="scale-text">25</text>
            <text class="scale-text">0</text>
          </view>
        </view>
        <view class="env-bar-wrap">
          <view class="env-bar temp-bar" :style="{ width: tempPercent + '%' }"></view>
        </view>
      </view>

      <!-- 湿度 -->
      <view class="env-card">
        <view class="env-top">
          <text class="env-icon">💧</text>
          <text class="env-label">湿度</text>
        </view>
        <text class="env-big hum-color">{{ humidity }}%</text>
        <view class="hum-circles">
          <view
            v-for="i in 10" :key="i"
            class="hum-circle"
            :class="{ filled: i <= Math.round(humidity / 10) }"
          ></view>
        </view>
        <view class="env-bar-wrap">
          <view class="env-bar hum-bar" :style="{ width: humidity + '%' }"></view>
        </view>
      </view>
    </view>

    <!-- 姿态角卡片 -->
    <view class="attitude-card">
      <view class="card-header">
        <text class="card-title">姿态角度</text>
        <text class="card-sub">IMU 传感器</text>
      </view>
      <view class="att-list">
        <view class="att-row" v-for="item in attitudeItems" :key="item.key">
          <view class="att-meta">
            <text class="att-name">{{ item.label }}</text>
            <text class="att-val" :style="{ color: item.color }">{{ item.value }}°</text>
          </view>
          <view class="att-track">
            <view class="att-fill" :style="{ width: item.percent + '%', background: item.color }"></view>
            <view class="att-mid"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- GPS 地图 -->
    <view class="map-card">
      <view class="card-header">
        <text class="card-title">实时位置</text>
        <text class="card-sub">{{ longitude.toFixed(4) }}, {{ latitude.toFixed(4) }}</text>
      </view>
      <map
        :longitude="longitude"
        :latitude="latitude"
        :markers="markers"
        :polyline="polyline"
        :show-location="true"
        style="width: 100%; height: 420rpx; border-radius: 14rpx;"
      />
    </view>

  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'

const WS_URL = 'ws://localhost:8082/ws/sensor-data'
const { isConnected, sensorData, connect } = useWebSocket(WS_URL)

const deviceId = ref('HELMET-001')
const temperature = ref(25)
const humidity = ref(60)
const roll = ref(0)
const pitch = ref(0)
const yaw = ref(0)
const longitude = ref(116.404)
const latitude = ref(39.915)
const gpsHistory = ref([])
const markers = ref([])
const polyline = ref([])

const tempPercent = computed(() => Math.min(Math.max((temperature.value / 50) * 100, 0), 100))

const attitudeItems = computed(() => [
  { key: 'roll',  label: 'Roll  横滚', value: roll.value,  percent: (roll.value  + 180) / 360 * 100, color: '#00D9FF' },
  { key: 'pitch', label: 'Pitch 俯仰', value: pitch.value, percent: (pitch.value + 180) / 360 * 100, color: '#7B61FF' },
  { key: 'yaw',   label: 'Yaw   偏航', value: yaw.value,   percent: (yaw.value   + 180) / 360 * 100, color: '#00FF88' }
])

// 舒适度指数：温度 18-26°C、湿度 40-70% 为最佳
const comfortScore = computed(() => {
  const t = temperature.value
  const h = humidity.value
  const tScore = t >= 18 && t <= 26 ? 100 : t < 18 ? Math.max(0, 100 - (18 - t) * 8) : Math.max(0, 100 - (t - 26) * 8)
  const hScore = h >= 40 && h <= 70 ? 100 : h < 40 ? Math.max(0, 100 - (40 - h) * 2) : Math.max(0, 100 - (h - 70) * 2)
  return Math.round((tScore + hScore) / 2)
})

const comfortColor = computed(() => {
  const s = comfortScore.value
  if (s >= 80) return '#00FF88'
  if (s >= 60) return '#FFD700'
  if (s >= 40) return '#FF8C00'
  return '#FF4444'
})

const comfortText = computed(() => {
  const s = comfortScore.value
  if (s >= 80) return '舒适'
  if (s >= 60) return '一般'
  if (s >= 40) return '较差'
  return '恶劣'
})

watch(sensorData, (data) => {
  if (!data) return
  deviceId.value = data.deviceId || deviceId.value
  temperature.value = data.temperature ?? 0
  humidity.value = data.humidity ?? 0
  roll.value = data.roll ?? 0
  pitch.value = data.pitch ?? 0
  yaw.value = data.yaw ?? 0
  longitude.value = data.longitude || longitude.value
  latitude.value = data.latitude || latitude.value

  if (data.longitude && data.latitude) {
    gpsHistory.value.push({ longitude: data.longitude, latitude: data.latitude })
    markers.value = [{ id: 1, longitude: data.longitude, latitude: data.latitude, width: 32, height: 32 }]
    if (gpsHistory.value.length > 1) {
      polyline.value = [{ points: gpsHistory.value, color: '#00D9FF', width: 4 }]
    }
  }
})

onMounted(() => { connect() })
</script>

<style scoped>
.twin-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #0a0a1a 0%, #0f0f2e 100%);
  padding: 24rpx 24rpx 120rpx;
}

/* 头盔状态卡片 */
.helmet-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx 28rpx;
  background: rgba(255,255,255,0.04);
  border: 1rpx solid rgba(0,217,255,0.15);
  border-radius: 20rpx;
  margin-bottom: 20rpx;
}
.helmet-icon-wrap {
  position: relative;
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.helmet-icon { font-size: 52rpx; }
.helmet-glow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0,217,255,0);
  transition: background 0.5s;
}
.helmet-glow.active {
  background: rgba(0,217,255,0.15);
  box-shadow: 0 0 20rpx rgba(0,217,255,0.4);
}
.helmet-info { flex: 1; }
.helmet-title {
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
  display: block;
}
.helmet-id {
  color: #555;
  font-size: 22rpx;
  font-family: monospace;
  display: block;
  margin-top: 4rpx;
}
.conn-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
  background: rgba(255,68,68,0.15);
  border: 1rpx solid rgba(255,68,68,0.4);
}
.conn-badge.online {
  background: rgba(0,255,136,0.12);
  border-color: rgba(0,255,136,0.4);
}
.conn-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #ff4444;
}
.conn-badge.online .conn-dot { background: #00ff88; }
.conn-text { color: #fff; font-size: 22rpx; }

/* 舒适度卡片 */
.comfort-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx;
  background: rgba(255,255,255,0.04);
  border: 1rpx solid rgba(0,217,255,0.15);
  border-radius: 20rpx;
  margin-bottom: 20rpx;
}
.comfort-label {
  color: #888;
  font-size: 24rpx;
  display: block;
  margin-bottom: 10rpx;
}
.comfort-value {
  font-size: 52rpx;
  font-weight: bold;
  display: block;
  line-height: 1;
}
.comfort-desc {
  font-size: 26rpx;
  display: block;
  margin-top: 8rpx;
}
.comfort-ring-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}
.comfort-ring {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 6rpx solid #00FF88;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.5s, box-shadow 0.5s;
}
.comfort-pct {
  font-size: 30rpx;
  font-weight: bold;
}

/* 温湿度行 */
.env-row {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}
.env-card {
  flex: 1;
  background: rgba(255,255,255,0.04);
  border: 1rpx solid rgba(0,217,255,0.15);
  border-radius: 20rpx;
  padding: 24rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.env-top {
  display: flex;
  align-items: center;
  gap: 8rpx;
  align-self: flex-start;
  margin-bottom: 12rpx;
}
.env-icon { font-size: 28rpx; }
.env-label { color: #888; font-size: 24rpx; }
.env-big {
  font-size: 56rpx;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 16rpx;
}
.temp-color { color: #FF6B35; }
.hum-color { color: #00D9FF; }

.thermo-wrap {
  display: flex;
  gap: 8rpx;
  align-items: flex-end;
  margin-bottom: 16rpx;
}
.thermo-track {
  width: 28rpx;
  height: 160rpx;
  background: rgba(255,255,255,0.08);
  border-radius: 14rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.thermo-fill {
  width: 100%;
  border-radius: 14rpx;
  transition: height 0.4s ease;
}
.temp-fill { background: linear-gradient(to top, #FF3366, #FF6B35); }
.thermo-scale {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 160rpx;
}
.scale-text { color: #444; font-size: 18rpx; }

.hum-circles {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  justify-content: center;
  margin-bottom: 16rpx;
  width: 140rpx;
}
.hum-circle {
  width: 22rpx;
  height: 22rpx;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  border: 1rpx solid rgba(0,217,255,0.2);
  transition: background 0.3s;
}
.hum-circle.filled {
  background: #00D9FF;
  box-shadow: 0 0 6rpx rgba(0,217,255,0.6);
}

.env-bar-wrap {
  width: 100%;
  height: 6rpx;
  background: rgba(255,255,255,0.08);
  border-radius: 3rpx;
  overflow: hidden;
}
.env-bar {
  height: 100%;
  border-radius: 3rpx;
  transition: width 0.4s ease;
}
.temp-bar { background: linear-gradient(90deg, #FF6B35, #FF3366); }
.hum-bar { background: linear-gradient(90deg, #00D9FF, #7B61FF); }

/* 姿态角卡片 */
.attitude-card {
  background: rgba(255,255,255,0.04);
  border: 1rpx solid rgba(0,217,255,0.15);
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}
.card-title { color: #fff; font-size: 28rpx; font-weight: bold; }
.card-sub { color: #555; font-size: 22rpx; }
.att-list { display: flex; flex-direction: column; gap: 20rpx; }
.att-row {}
.att-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}
.att-name { color: #888; font-size: 24rpx; font-family: monospace; }
.att-val { font-size: 26rpx; font-weight: bold; }
.att-track {
  width: 100%;
  height: 10rpx;
  background: rgba(255,255,255,0.08);
  border-radius: 5rpx;
  overflow: hidden;
  position: relative;
}
.att-fill {
  height: 100%;
  border-radius: 5rpx;
  transition: width 0.3s ease;
  opacity: 0.85;
}
.att-mid {
  position: absolute;
  left: 50%;
  top: 0;
  width: 2rpx;
  height: 100%;
  background: rgba(255,255,255,0.2);
}

/* 地图卡片 */
.map-card {
  background: rgba(255,255,255,0.04);
  border: 1rpx solid rgba(0,217,255,0.15);
  border-radius: 20rpx;
  padding: 28rpx;
}
</style>
