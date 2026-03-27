<template>
  <SportBackground />
  <div class="app-layout">
    <!-- Top Navigation Bar -->
    <nav class="app-nav">
      <div class="app-nav__left">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 2v10l6.5-3"/></svg>
        <span class="app-nav__brand">灵盔佑驰终端</span>
        <div class="app-nav__status">
          <div :class="indicatorClass"></div>
          <span class="app-nav__status-text">{{ wsStatus }}</span>
        </div>
      </div>
      <div class="app-nav__right">
        <button class="app-nav__btn app-nav__btn--primary" @click="onToggleAuto">
          <svg v-if="!isAutoRefresh" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          {{ isAutoRefresh ? '停止刷新' : '自动刷新' }}
        </button>
        <button class="app-nav__btn app-nav__btn--secondary" @click="goToProfile">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          个人资料
        </button>
        <button class="app-nav__btn app-nav__btn--secondary" @click="goToRideHistory">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
          骑行记录
        </button>
        <button class="app-nav__btn app-nav__btn--secondary" @click="handleClearAllData">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          清除数据
        </button>
        <button class="app-nav__btn app-nav__btn--secondary" @click="onLogout">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          退出
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="app-body">
      <!-- 左侧导航栏 -->
      <aside class="side-nav">
        <button
          class="side-nav__item"
          :class="{ 'side-nav__item--active': activePage === 'terminal' }"
          @click="activePage = 'terminal'"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
          <span>终端</span>
        </button>
        <button
          class="side-nav__item"
          :class="{ 'side-nav__item--active': activePage === 'twin' }"
          @click="activePage = 'twin'"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          <span>数字孪生</span>
        </button>
        <button
          class="side-nav__item"
          :class="{ 'side-nav__item--active': activePage === 'dataviz' }"
          @click="activePage = 'dataviz'"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
          <span>数据可视化</span>
        </button>
      </aside>

      <!-- 右侧内容区 -->
      <div class="app-content">
        <!-- 终端页面 -->
        <div v-show="activePage === 'terminal'" class="page-wrapper page-wrapper--terminal">
          <div class="terminal-layout">
            <div class="app-main">
              <!-- Environment Dashboard -->
              <div class="env-dashboard" data-aos="fade-up">
          <!-- Comfort Gauge Card -->
          <div class="comfort-card" :style="{ '--c-color': comfortLevel.color, '--c-glow': comfortLevel.color + '40' }">
            <div class="comfort-card__glow"></div>
            <div class="comfort-card__header">
              <div class="comfort-card__label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>
                环境舒适度
              </div>
              <div class="comfort-card__badge" :style="{ background: comfortLevel.color + '20', color: comfortLevel.color, borderColor: comfortLevel.color + '40' }">
                {{ comfortLevel.label }}
              </div>
            </div>
            <div class="comfort-card__gauge">
              <svg viewBox="0 0 200 130" class="gauge-svg">
                <defs>
                  <linearGradient :id="'gaugeGrad'" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#00D9FF" />
                    <stop offset="25%" stop-color="#00F0FF" />
                    <stop offset="50%" stop-color="#A855F7" />
                    <stop offset="75%" stop-color="#C026D3" />
                    <stop offset="100%" stop-color="#E879F9" />
                  </linearGradient>
                </defs>
                <!-- Track -->
                <path d="M 30 110 A 70 70 0 0 1 170 110" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="10" stroke-linecap="round" />
                <!-- Value arc -->
                <path d="M 30 110 A 70 70 0 0 1 170 110" fill="none" :stroke="'url(#gaugeGrad)'" stroke-width="10" stroke-linecap="round" :stroke-dasharray="gaugeCircumference" :stroke-dashoffset="gaugeOffset" class="gauge-arc" />
                <!-- Needle dot -->
                <circle :cx="needleX" :cy="needleY" r="6" :fill="comfortLevel.color" class="gauge-needle">
                  <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle :cx="needleX" :cy="needleY" r="10" :fill="comfortLevel.color" opacity="0.2">
                  <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
                </circle>
                <!-- Center value -->
                <text x="100" y="90" text-anchor="middle" :fill="comfortLevel.color" font-size="28" font-weight="800" font-family="'Segoe UI', monospace" class="gauge-text">{{ comfortTHI != null ? comfortTHI.toFixed(1) : '--' }}</text>
                <text x="100" y="108" text-anchor="middle" fill="#8892A0" font-size="11" font-family="'Segoe UI'">THI 指数</text>
                <!-- Scale labels -->
                <text x="22" y="122" fill="#556" font-size="9" font-family="monospace">0</text>
                <text x="172" y="122" fill="#556" font-size="9" font-family="monospace">40</text>
              </svg>
            </div>
            <!-- THI Legend -->
            <div class="thi-legend">
              <div class="thi-legend__item" v-for="item in thiLevels" :key="item.label">
                <span class="thi-legend__dot" :style="{ background: item.color }"></span>
                <span class="thi-legend__range">{{ item.range }}</span>
                <span class="thi-legend__label">{{ item.label }}</span>
              </div>
            </div>
            <div class="comfort-card__metrics">
              <div class="metric-item">
                <div class="metric-item__head">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>
                  <span class="metric-item__label">温度</span>
                  <span class="metric-item__val">{{ latestTemp != null ? latestTemp.toFixed(1) + '°C' : '--' }}</span>
                </div>
                <div class="metric-item__bar">
                  <div class="metric-item__fill metric-item__fill--temp" :style="{ width: tempPercent + '%' }"></div>
                </div>
              </div>
              <div class="metric-item">
                <div class="metric-item__head">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A855F7" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                  <span class="metric-item__label">湿度</span>
                  <span class="metric-item__val">{{ latestHumidity != null ? latestHumidity.toFixed(1) + '%' : '--' }}</span>
                </div>
                <div class="metric-item__bar">
                  <div class="metric-item__fill metric-item__fill--humi" :style="{ width: humiPercent + '%' }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Device Count Card -->
          <div class="device-card">
            <div class="device-card__header">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 3h-8l-2 4h12z"/></svg>
              <span>在线设备</span>
            </div>
            <div class="device-card__body">
              <div class="device-card__number">{{ deviceCount }}</div>
              <div class="device-card__ring">
                <svg viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(0, 217, 255, 0.1)" stroke-width="6" />
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#00D9FF" stroke-width="6" stroke-linecap="round" stroke-dasharray="201" :stroke-dashoffset="deviceCount > 0 ? 201 * 0.25 : 201" class="device-ring-arc" />
                  <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(0, 217, 255, 0.15)" stroke-width="6" stroke-dasharray="4 8" class="device-ring-dashed">
                    <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="30s" repeatCount="indefinite" />
                  </circle>
                </svg>
              </div>
            </div>
            <div class="device-card__status">
              <div class="device-card__dot" :class="{ 'device-card__dot--active': deviceCount > 0 && deviceOnline, 'device-card__dot--offline': deviceCount > 0 && !deviceOnline }"></div>
              <span>{{ deviceCount > 0 ? (deviceOnline ? '数据传输中' : '暂无数据') : '等待连接' }}</span>
            </div>
          </div>
        </div>

        <!-- Ride Stats Panel -->
        <RideStatsPanel
          :isRiding="rideTracking.isRiding.value"
          :currentSpeed="rideTracking.currentSpeed.value"
          :rideDistance="rideTracking.rideDistance.value"
          :rideDuration="rideTracking.rideDuration.value"
          :maxSpeed="rideTracking.maxSpeed.value"
          :avgSpeed="rideTracking.avgSpeed.value"
          :speedWarning="rideTracking.speedWarning.value"
          :calories="rideTracking.calories.value"
          :pace="rideTracking.pace.value"
        />

        <!-- Map Section -->
        <GaodeMap ref="gaodeMap" class="app-map" />

        <!-- Event Panel -->
        <EventPanel ref="eventPanel" />
            </div>

            <!-- Weather Sidebar -->
            <aside class="app-sidebar">
              <WeatherPanel
                :city="weather.city.value"
                :current="weather.current.value"
                :hourly="weather.hourly.value"
                :forecast="weather.forecast.value"
                :warning="weather.warning.value"
                :indices="weather.indices.value"
                :minutely="weather.minutely.value"
                :loading="weather.loading.value"
                :error="weather.error.value"
              />
            </aside>
          </div>
        </div>

        <!-- 数字孪生页面 -->
        <div v-show="activePage === 'twin'" class="page-wrapper">
          <div class="twin-page">
            <HelmetTwin ref="helmetTwin" :sensorData="latestSensorData" :connected="isConnected" :weatherData="weather.current.value" />
          </div>
        </div>

        <!-- 数据可视化页面 -->
        <div v-show="activePage === 'dataviz'" class="page-wrapper page-wrapper--dataviz">
          <DataVisualization />
        </div>
      </div>
    </div>
  </div>

  <!-- AI 对话浮动组件 -->
  <AiChat :deviceId="latestSensorData.deviceId || ''" />
</template>

<script>
export default { name: 'AppMain' }
</script>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import SportBackground from '@/components/SportBackground.vue'
import GaodeMap from '@/components/GaodeMap.vue'
import EventPanel from '@/components/EventPanel.vue'
import WeatherPanel from '@/components/WeatherPanel.vue'
import RideStatsPanel from '@/components/RideStatsPanel.vue'
import HelmetTwin from '@/components/HelmetTwin.vue'
import AiChat from '@/components/AiChat.vue'
import DataVisualization from '@/views/DataVisualization.vue'
import { useWebSocket } from '@/composables/useWebSocket.js'
import { useWeather } from '@/composables/useWeather.js'
import { useRideTracking } from '@/composables/useRideTracking.js'
import { useRideHistoryStore } from '@/stores/rideHistory.js'
import { useUserProfileStore } from '@/stores/userProfile.js'
import { calculateTHI, getComfortLevel } from '@/utils/comfortIndex.js'

const router = useRouter()
const userStore = useUserStore()

const activePage = ref('terminal')
const latestSensorData = ref({})
const helmetTwin = ref(null)

watch(activePage, (val) => {
  if (val === 'twin') {
    // v-show 切换后 DOM 需要一帧才真正可见，再等渲染完成后触发 resize
    nextTick(() => {
      setTimeout(() => { helmetTwin.value?.onResize() }, 100)
    })
  }
})

const gaodeMap = ref(null)
const eventPanel = ref(null)

const {
  isConnected, connectionStatus, deviceCount: wsDeviceCount, lastUpdateTime, connect, disconnect, setOnSensorData
} = useWebSocket()

const wsStatus = connectionStatus
const deviceSet = new Set()
const deviceCount = ref(0)
const deviceOnline = ref(false)
const lastUpdate = ref(null)
const isAutoRefresh = ref(false)
let autoTimer = null
let deviceOfflineTimer = null
const DEVICE_OFFLINE_TIMEOUT = 5000 // 5秒无数据判定设备离线

// Weather
const weather = useWeather()

// Ride tracking
const rideTracking = useRideTracking()
const rideHistoryStore = useRideHistoryStore()
const userProfileStore = useUserProfileStore()

// 将用户体重同步到骑行追踪
rideTracking.setWeight(userProfileStore.weight)

rideTracking.setOnRideEnd((summary) => {
  rideHistoryStore.addRide(summary)
})

// 体重变化时同步到骑行追踪
watch(() => userProfileStore.weight, (newWeight) => {
  rideTracking.setWeight(newWeight)
})

// Stats tracking
const latestTemp = ref(null)
const latestHumidity = ref(null)

const comfortTHI = computed(() => calculateTHI(latestTemp.value, latestHumidity.value))
const comfortLevel = computed(() => getComfortLevel(comfortTHI.value))

// Gauge arc math (semicircle arc from 30,110 to 170,110, radius=70)
const gaugeCircumference = Math.PI * 70 // ~219.9
const gaugeOffset = computed(() => {
  if (comfortTHI.value == null) return gaugeCircumference
  const ratio = Math.min(Math.max(comfortTHI.value / 40, 0), 1)
  return gaugeCircumference * (1 - ratio)
})
const needleAngle = computed(() => {
  if (comfortTHI.value == null) return Math.PI
  const ratio = Math.min(Math.max(comfortTHI.value / 40, 0), 1)
  return Math.PI * (1 - ratio)
})
const needleX = computed(() => 100 + 70 * Math.cos(needleAngle.value))
const needleY = computed(() => 110 - 70 * Math.sin(needleAngle.value))

const tempPercent = computed(() => latestTemp.value != null ? Math.min(Math.max((latestTemp.value + 10) / 60 * 100, 0), 100) : 0)
const humiPercent = computed(() => latestHumidity.value != null ? Math.min(Math.max(latestHumidity.value, 0), 100) : 0)

const thiLevels = [
  { range: '<15', label: '寒冷', color: '#00D9FF' },
  { range: '15-20', label: '凉爽', color: '#00F0FF' },
  { range: '20-26', label: '舒适', color: '#A855F7' },
  { range: '26-30', label: '偏热', color: '#C026D3' },
  { range: '≥30', label: '闷热', color: '#E879F9' }
]

const indicatorClass = computed(() => {
  if (/断开|失败|error/i.test(wsStatus.value)) return 'app-nav__dot app-nav__dot--error'
  if (/连接中|connecting/i.test(wsStatus.value)) return 'app-nav__dot app-nav__dot--warning'
  return 'app-nav__dot app-nav__dot--ok'
})

function handleSensorDataFromWS(payload) {
  console.log('[App] handleSensorDataFromWS 被调用:', payload.deviceId, '温度:', payload.temperature, '湿度:', payload.humidity, '摔倒:', payload.fallFlag)
  console.log('[App] 姿态数据 - roll:', payload.roll, 'pitch:', payload.pitch, 'avm:', payload.avm, 'gvm:', payload.gvm)
  // 同步到数字孪生
  latestSensorData.value = { ...payload }
  console.log('[App] latestSensorData 已更新:', latestSensorData.value)
  // 1) update map
  if (gaodeMap.value && gaodeMap.value.updateMapLocation) {
    gaodeMap.value.updateMapLocation(payload)
  }
  // 2) events
  if (eventPanel.value && eventPanel.value.processDeviceEvents) {
    eventPanel.value.processDeviceEvents(payload)
  }
  // update deviceSet & lastUpdate
  if (payload.deviceId) {
    deviceSet.add(payload.deviceId)
    deviceCount.value = deviceSet.size
  }
  // 设备上线：标记在线 + 重置离线计时器
  deviceOnline.value = true
  resetDeviceOfflineTimer()

  // update stats
  if (payload.temperature != null) latestTemp.value = Number(payload.temperature)
  if (payload.humidity != null) latestHumidity.value = Number(payload.humidity)
  lastUpdate.value = new Date()
  // 3) weather: update by GPS location
  if (payload.longitude && payload.latitude) {
    weather.updateByLocation(payload.longitude, payload.latitude)
  }
  // 4) ride tracking: process GPS data
  if (payload.longitude && payload.latitude) {
    rideTracking.processGpsData(payload)
  }
  // 5) ride tracking: process event data
  rideTracking.processEventData(payload)
  // 6) ride tracking: accumulate temp/humidity
  rideTracking.processSensorData(payload)
}

// 设备离线检测：5秒无数据 → 设备离线
function resetDeviceOfflineTimer() {
  if (deviceOfflineTimer) clearTimeout(deviceOfflineTimer)
  deviceOfflineTimer = setTimeout(() => {
    deviceOnline.value = false
  }, DEVICE_OFFLINE_TIMEOUT)
}

setOnSensorData(handleSensorDataFromWS)

function onToggleAuto() {
  isAutoRefresh.value = !isAutoRefresh.value
  if (autoTimer) { clearInterval(autoTimer); autoTimer = null }
}

function handleClearAllData() {
  if (eventPanel.value && eventPanel.value.clearAllEvents) eventPanel.value.clearAllEvents()
  if (gaodeMap.value && gaodeMap.value.clearAllTracks) gaodeMap.value.clearAllTracks()
  deviceSet.clear(); deviceCount.value = 0; lastUpdate.value = new Date()
  latestTemp.value = null
  latestHumidity.value = null
}

function onLogout() {
  userStore.logout()
  router.push('/login')
}

function goToProfile() {
  router.push('/profile')
}

function goToRideHistory() {
  router.push('/ride-history')
}

onMounted(()=>{
  connect('ws://localhost:8082/ws/sensor-data')
})

onUnmounted(()=>{
  disconnect()
  weather.stopAutoRefresh()
  rideTracking.destroy()
  if (autoTimer) clearInterval(autoTimer)
  if (deviceOfflineTimer) clearTimeout(deviceOfflineTimer)
})
</script>

<style scoped>
.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  --nav-h: 48px;
}

/* 导航栏下方整体布局 */
.app-body {
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
}

/* 左侧导航栏 */
.side-nav {
  width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  gap: 8px;
  background: rgba(10, 14, 26, 0.95);
  border-right: 1px solid rgba(0, 217, 255, 0.15);
  flex-shrink: 0;
}

.side-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  width: 64px;
  padding: 10px 6px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: #8892A0;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.65rem;
  font-weight: 500;
}

.side-nav__item:hover {
  background: rgba(0, 217, 255, 0.08);
  color: #E0F2FE;
}

.side-nav__item--active {
  background: rgba(0, 217, 255, 0.15);
  color: #00D9FF;
  box-shadow: 0 0 15px rgba(0, 217, 255, 0.2);
  border: 1px solid rgba(0, 217, 255, 0.3);
}

/* 右侧内容区 */
.app-content {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

/* Navigation Bar */
.app-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 24px;
  background: rgba(10, 14, 26, 0.95);
  border-bottom: 1px solid rgba(0, 217, 255, 0.2);
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 20px rgba(0, 217, 255, 0.1);
}

.app-nav__left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-nav__brand {
  font-size: 1.1rem;
  font-weight: 700;
  color: #E0F2FE;
  text-shadow: 0 0 10px rgba(0, 217, 255, 0.5);
}

.app-nav__status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: rgba(0, 217, 255, 0.08);
  border-radius: 20px;
  margin-left: 8px;
  border: 1px solid rgba(0, 217, 255, 0.2);
}

.app-nav__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.app-nav__dot--ok {
  background: #00D9FF;
  box-shadow: 0 0 8px rgba(0, 217, 255, 0.8);
  animation: pulse-cyan 2s infinite;
}

@keyframes pulse-cyan {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0, 217, 255, 0.6); }
  50% { box-shadow: 0 0 0 6px rgba(0, 217, 255, 0); }
}

.app-nav__dot--warning {
  background: #FFD93D;
  box-shadow: 0 0 6px rgba(255, 217, 61, 0.5);
}

.app-nav__dot--error {
  background: #FF4757;
  box-shadow: 0 0 6px rgba(255, 71, 87, 0.5);
}

.app-nav__status-text {
  font-size: 0.75rem;
  color: #8892A0;
}

.app-nav__right {
  display: flex;
  gap: 8px;
}

.app-nav__btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.app-nav__btn--primary {
  background: linear-gradient(135deg, #00D9FF, #A855F7);
  color: #fff;
  box-shadow: 0 0 20px rgba(0, 217, 255, 0.3);
}

.app-nav__btn--primary:hover {
  box-shadow: 0 2px 20px rgba(0, 217, 255, 0.6), 0 0 30px rgba(168, 85, 247, 0.4);
  transform: translateY(-1px);
}

.app-nav__btn--secondary {
  background: rgba(0, 217, 255, 0.08);
  color: #E0F2FE;
  border: 1px solid rgba(0, 217, 255, 0.2);
}

.app-nav__btn--secondary:hover {
  background: rgba(0, 217, 255, 0.15);
  box-shadow: 0 0 15px rgba(0, 217, 255, 0.2);
}

/* Main Content */
.terminal-layout {
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  padding: 24px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  align-items: start;
}

/* 页面包装器 - 默认不滚动（数字孪生） */
.page-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

/* 终端页面允许滚动 */
.page-wrapper--terminal {
  overflow-y: auto;
  overflow-x: hidden;
}

/* 数据可视化页面占满整个区域 */
.page-wrapper--dataviz {
  overflow: hidden;
  padding: 0;
}

.twin-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.app-main {
  min-width: 0;
}

.app-sidebar {
  position: sticky;
  top: 80px;
}

/* ===== Environment Dashboard ===== */
.env-dashboard {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
  margin-bottom: 24px;
}

/* --- Comfort Gauge Card --- */
.comfort-card {
  position: relative;
  background: linear-gradient(145deg, #0f1624 0%, #0a0e1a 100%);
  border-radius: 20px;
  padding: 24px 28px 20px;
  border: 1px solid rgba(0, 217, 255, 0.2);
  overflow: hidden;
  transition: border-color 0.6s ease, box-shadow 0.6s ease;
  border-color: var(--c-glow, rgba(0, 217, 255, 0.2));
  box-shadow: 0 0 30px -10px var(--c-glow, rgba(0, 217, 255, 0.2)), inset 0 1px 0 rgba(0, 217, 255, 0.1);
}

.comfort-card__glow {
  position: absolute;
  top: -60%;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  height: 200px;
  background: radial-gradient(ellipse, var(--c-glow, transparent) 0%, transparent 70%);
  opacity: 0.3;
  pointer-events: none;
  transition: background 0.6s ease;
}

.comfort-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.comfort-card__label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #8892A0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.comfort-card__badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 20px;
  border: 1px solid;
  letter-spacing: 0.5px;
  transition: all 0.4s ease;
}

.comfort-card__gauge {
  display: flex;
  justify-content: center;
  margin: -4px 0 0;
}

.gauge-svg {
  width: 260px;
  height: 170px;
}

.gauge-arc {
  transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 0 6px var(--c-glow, transparent));
}

.gauge-needle {
  transition: cx 0.8s cubic-bezier(0.4, 0, 0.2, 1), cy 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 0 8px var(--c-color, #8892A0));
}

.gauge-text {
  transition: fill 0.4s ease;
}

/* THI Legend */
.thi-legend {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 4px 0 0;
  flex-wrap: wrap;
}

.thi-legend__item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.thi-legend__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.thi-legend__range {
  font-size: 0.8rem;
  font-family: 'Segoe UI', monospace;
  color: #8892A0;
}

.thi-legend__label {
  font-size: 0.8rem;
  color: #E8ECF1;
  font-weight: 600;
}

/* Sub-metrics */
.comfort-card__metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 4px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.metric-item__head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.metric-item__label {
  font-size: 0.75rem;
  color: #8892A0;
  flex: 1;
}

.metric-item__val {
  font-size: 0.85rem;
  font-weight: 700;
  color: #E8ECF1;
  font-family: 'Segoe UI', monospace;
}

.metric-item__bar {
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.metric-item__fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.metric-item__fill--temp {
  background: linear-gradient(90deg, #00D9FF, #A855F7, #E879F9);
  box-shadow: 0 0 10px rgba(0, 217, 255, 0.5);
}

.metric-item__fill--humi {
  background: linear-gradient(90deg, #A855F7, #00D9FF);
  box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
}

/* --- Device Card --- */
.device-card {
  background: linear-gradient(145deg, #0f1624 0%, #0a0e1a 100%);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(0, 217, 255, 0.2);
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 30px -10px rgba(0, 217, 255, 0.3), inset 0 1px 0 rgba(0, 217, 255, 0.1);
}

.device-card__header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #8892A0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
}

.device-card__body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.device-card__number {
  position: absolute;
  font-size: 2.8rem;
  font-weight: 800;
  color: #E0F2FE;
  z-index: 1;
  font-family: 'Segoe UI', monospace;
  text-shadow: 0 0 25px rgba(0, 217, 255, 0.6);
}

.device-card__ring {
  width: 120px;
  height: 120px;
}

.device-card__ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.device-ring-arc {
  transition: stroke-dashoffset 0.6s ease;
  filter: drop-shadow(0 0 6px rgba(0, 217, 255, 0.6));
}

.device-card__status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.75rem;
  color: #8892A0;
}

.device-card__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #556;
  transition: all 0.3s ease;
}

.device-card__dot--active {
  background: #00D9FF;
  box-shadow: 0 0 10px rgba(0, 217, 255, 0.8);
  animation: pulse-cyan 2s infinite;
}

@keyframes pulse-cyan {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0, 217, 255, 0.6); }
  50% { box-shadow: 0 0 0 6px rgba(0, 217, 255, 0); }
}

.device-card__dot--offline {
  background: #A855F7;
  box-shadow: 0 0 8px rgba(168, 85, 247, 0.6);
}

@keyframes pulse-cyan {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0, 217, 255, 0.6); }
  50% { box-shadow: 0 0 0 6px rgba(0, 217, 255, 0); }
}

/* Map Section */
.app-map {
  margin-bottom: 24px;
}

/* Responsive */
@media (max-width: 1280px) {
  .app-content {
    grid-template-columns: 1fr 360px;
    gap: 16px;
  }
}

@media (max-width: 1024px) {
  .app-content {
    grid-template-columns: 1fr;
  }

  .app-sidebar {
    position: static;
  }

  .env-dashboard {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .app-nav {
    flex-direction: column;
    gap: 10px;
    padding: 10px 16px;
  }

  .app-nav__right {
    flex-wrap: wrap;
    justify-content: center;
  }

  .app-content {
    padding: 16px;
  }

  .env-dashboard {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .comfort-card {
    padding: 20px;
  }

  .gauge-svg {
    width: 220px;
    height: 145px;
  }

  .comfort-card__metrics {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}
</style>

<style>
:global(body) {
  font-family: 'Segoe UI', 'Roboto', Arial;
  background: #0a0e1a;
  color: #E0F2FE;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}
</style>
