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
            <!-- Environment Dashboard -->
            <div class="env-dashboard" data-aos="fade-up">
              <TempHumidityCards
                :temperature="latestTemp"
                :humidity="latestHumidity"
              />
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

            <!-- Event Panel -->
            <EventPanel ref="eventPanel" />
          </div>
        </div>

        <!-- 数字孪生页面 -->
        <div v-show="activePage === 'twin'" class="page-wrapper">
          <div class="twin-page">
            <HelmetTwin ref="helmetTwin" :sensorData="latestSensorData" :connected="isConnected" />
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

  <!-- AI 助手 3D 模型 - 紧贴在 AI 对话按钮左边 -->
  <AiAssistant
    :sensor-data="latestSensorData"
    :position="{ x: -10, y: -8 }"
  />
</template>

<script>
export default { name: 'AppMain' }
</script>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import request from '@/utils/request'
import SportBackground from '@/components/SportBackground.vue'
import EventPanel from '@/components/EventPanel.vue'
import RideStatsPanel from '@/components/RideStatsPanel.vue'
import HelmetTwin from '@/components/HelmetTwin.vue'
import AiChat from '@/components/AiChat.vue'
import DataVisualization from '@/views/DataVisualization.vue'
import TempHumidityCards from '@/components/TempHumidityCards.vue'
import AiAssistant from '@/components/AiAssistant.vue'
import { useWebSocket } from '@/composables/useWebSocket.js'
import { useRideTracking } from '@/composables/useRideTracking.js'
import { useRideHistoryStore } from '@/stores/rideHistory.js'
import { useUserProfileStore } from '@/stores/userProfile.js'

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

const eventPanel = ref(null)

const {
  isConnected, connectionStatus, deviceCount: wsDeviceCount, lastUpdateTime, connect, disconnect, setOnSensorData
} = useWebSocket()

const wsStatus = connectionStatus
const deviceSet = new Set()
const deviceCount = ref(0)
const deviceOnline = ref(false)
const lastUpdate = ref(null)
let deviceOfflineTimer = null
const DEVICE_OFFLINE_TIMEOUT = 5000 // 5秒无数据判定设备离线

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
  // 1) events
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

function handleClearAllData() {
  if (eventPanel.value && eventPanel.value.clearAllEvents) eventPanel.value.clearAllEvents()
  deviceSet.clear(); deviceCount.value = 0; lastUpdate.value = new Date()
  latestTemp.value = null
  latestHumidity.value = null
}

function onLogout() {
  userStore.logout()
  router.push('/auth')
}

function goToProfile() {
  router.push('/profile')
}

function goToRideHistory() {
  router.push('/ride-history')
}

onMounted(async () => {
  connect('ws://localhost:8082/ws/sensor-data')
  // 从数据库加载最新一条数据，初始化温湿度显示
  try {
    const res = await request.get('/api/sensor/history', { params: { limit: 1 } })
    if (res.data && res.data.length > 0) {
      const latest = res.data[0]
      if (latest.temperature != null) latestTemp.value = Number(latest.temperature)
      if (latest.humidity != null) latestHumidity.value = Number(latest.humidity)
    }
  } catch {
    // 无数据时保持 null 显示 '--'
  }
})

onUnmounted(()=>{
  disconnect()
  rideTracking.destroy()
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
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
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

/* ===== Environment Dashboard ===== */
.env-dashboard {
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 20px;
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
