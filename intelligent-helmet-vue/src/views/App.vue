<template>
  <SportBackground />
  <div class="app-layout">

    <!-- ── 顶部横向导航（品牌 + 状态 + 操作按钮） ── -->
    <nav class="top-nav">
      <div class="top-nav__left">
        <div class="nav-logo__frame">
          <span class="nav-logo__omega">Ω</span>
        </div>
        <span class="brand-main">{{ userProfileStore.nickname || 'X-TERN PROTOCOL' }}</span>
        <div class="top-nav__status">
          <div :class="indicatorClass"></div>
          <span class="top-nav__status-text">{{ wsStatus }}</span>
        </div>
      </div>

      <div class="top-nav__right">
        <div class="nav-metric">
          <span class="nav-metric__dot nav-metric__dot--green"></span>
          <span class="nav-metric__label">LATENCY</span>
          <span class="nav-metric__val">14MS</span>
        </div>
        <div class="nav-metric">
          <span class="nav-metric__dot nav-metric__dot--green"></span>
          <span class="nav-metric__label">SYNC</span>
          <span class="nav-metric__val nav-metric__val--green">STABLE</span>
        </div>
        <div class="nav-metric">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2"/><rect x="4" y="9" :width="batteryBarWidth" height="6" rx="1" :fill="batteryColor" stroke="none"/></svg>
          <span class="nav-metric__label">BAT</span>
          <span class="nav-metric__val" :style="{ color: batteryColor }">{{ batteryDisplay }}</span>
        </div>
        <button class="top-nav__btn" @click="goToProfile">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          个人资料
        </button>
        <button class="top-nav__btn top-nav__btn--exit" @click="onLogout">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          EXIT
        </button>
      </div>
    </nav>

    <!-- ── 主体：左侧选项卡 + 中间内容 + 右侧星空 ── -->
    <div class="app-body">

      <!-- 左侧竖排选项卡（仅三个页面切换） -->
      <aside class="side-nav">
        <button class="side-tab" :class="{ 'side-tab--active': activePage === 'terminal' }" @click="activePage = 'terminal'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
          <span>终端</span>
        </button>
        <button class="side-tab" :class="{ 'side-tab--active': activePage === 'twin' }" @click="activePage = 'twin'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          <span>数字孪生</span>
        </button>
        <button class="side-tab" :class="{ 'side-tab--active': activePage === 'dataviz' }" @click="activePage = 'dataviz'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
          <span>数据可视化</span>
        </button>
        <button class="side-tab" :class="{ 'side-tab--active': activePage === 'rideplan' }" @click="activePage = 'rideplan'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6l9-3 9 3M3 18l9 3 9-3"/></svg>
          <span>AI伴骑</span>
        </button>
      </aside>

      <!-- 中间内容区 -->
      <main class="app-content">
        <!-- 终端页面 -->
        <div v-show="activePage === 'terminal'" class="page-wrapper page-wrapper--terminal">
          <div class="terminal-layout">
            <div class="terminal-top">
              <TempHumidityCards :temperature="latestTemp" :humidity="latestHumidity" />
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
            </div>
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
          <DataVisualization :sensor-data="latestSensorData" @back="activePage = 'twin'" />
        </div>

        <!-- 骑行规划页面（每日计划入口） -->
        <div v-show="activePage === 'rideplan'" class="page-wrapper page-wrapper--rideplan">
          <DailyPlan @go-plan="activePage = 'rideplan-edit'" />
        </div>

        <!-- 骑行规划编辑页 -->
        <div v-show="activePage === 'rideplan-edit'" class="page-wrapper page-wrapper--rideplan">
          <RidePlan @back="activePage = 'rideplan'" />
        </div>
      </main>

      <!-- 右侧星空面板 -->
      <aside class="starfield-panel">
        <!-- 星空背景图（始终显示） -->
        <div class="starfield-bg"></div>

        <!-- 模式一：3D 模型悬浮（未打开对话时） -->
        <Transition name="model-fade">
          <div v-if="!showAiChat" class="ai-zone">
            <AiAssistant :sensor-data="latestSensorData" :inline="true" @click-model="toggleAiChat" />
          </div>
        </Transition>

        <!-- 模式二：AI 对话框全屏占满右侧（打开对话后） -->
        <Transition name="chat-expand">
          <div v-if="showAiChat" class="ai-fullscreen-chat">
            <AiChat :deviceId="latestSensorData.deviceId || ''" :show-close="true" @close="toggleAiChat" />
          </div>
        </Transition>
      </aside>

    </div>
  </div>
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
import RidePlan from '@/views/RidePlan.vue'
import DailyPlan from '@/views/DailyPlan.vue'
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
const showAiChat = ref(false)

function toggleAiChat() {
  showAiChat.value = !showAiChat.value
}

const batteryLevel = computed(() => {
  const v = latestSensorData.value?.battery
  return (v != null && !isNaN(v)) ? Math.max(0, Math.min(100, Number(v))) : null
})
const batteryDisplay = computed(() => batteryLevel.value != null ? batteryLevel.value + '%' : '--')
const batteryColor = computed(() => {
  if (batteryLevel.value == null) return 'rgba(255,255,255,0.35)'
  if (batteryLevel.value > 50) return '#00F3FF'
  if (batteryLevel.value > 20) return '#FFAA00'
  return '#EF4444'
})
const batteryBarWidth = computed(() => {
  if (batteryLevel.value == null) return 0
  return Math.round(batteryLevel.value / 100 * 12)
})

watch(activePage, (val) => {
  if (val === 'twin') {
    nextTick(() => { setTimeout(() => { helmetTwin.value?.onResize() }, 100) })
  }
})

const eventPanel = ref(null)

const { isConnected, connectionStatus, connect, disconnect, setOnSensorData } = useWebSocket()
const wsStatus = connectionStatus
const deviceSet = new Set()
const deviceCount = ref(0)
const deviceOnline = ref(false)
const lastUpdate = ref(null)
let deviceOfflineTimer = null
const DEVICE_OFFLINE_TIMEOUT = 5000

const rideTracking = useRideTracking()
const rideHistoryStore = useRideHistoryStore()
const userProfileStore = useUserProfileStore()

rideTracking.setWeight(userProfileStore.weight)
rideTracking.setOnRideEnd((summary) => { rideHistoryStore.addRide(summary) })
watch(() => userProfileStore.weight, (w) => { rideTracking.setWeight(w) })

const latestTemp = ref(null)
const latestHumidity = ref(null)

const indicatorClass = computed(() => {
  if (/断开|失败|error/i.test(wsStatus.value)) return 'app-nav__dot app-nav__dot--error'
  if (/连接中|connecting/i.test(wsStatus.value)) return 'app-nav__dot app-nav__dot--warning'
  return 'app-nav__dot app-nav__dot--ok'
})

function handleSensorDataFromWS(payload) {
  latestSensorData.value = { ...payload }
  if (eventPanel.value?.processDeviceEvents) eventPanel.value.processDeviceEvents(payload)
  if (payload.deviceId) { deviceSet.add(payload.deviceId); deviceCount.value = deviceSet.size }
  deviceOnline.value = true
  resetDeviceOfflineTimer()
  if (payload.temperature != null) latestTemp.value = Number(payload.temperature)
  if (payload.humidity != null) latestHumidity.value = Number(payload.humidity)
  lastUpdate.value = new Date()
  if (payload.longitude && payload.latitude) rideTracking.processGpsData(payload)
  rideTracking.processEventData(payload)
  rideTracking.processSensorData(payload)
}

function resetDeviceOfflineTimer() {
  if (deviceOfflineTimer) clearTimeout(deviceOfflineTimer)
  deviceOfflineTimer = setTimeout(() => { deviceOnline.value = false }, DEVICE_OFFLINE_TIMEOUT)
}

setOnSensorData(handleSensorDataFromWS)

function onLogout() { userStore.logout(); router.push('/auth') }
function goToProfile() { router.push('/profile') }

onMounted(async () => {
  rideHistoryStore.loadFromStorage()
  connect('ws://localhost:8082/ws/sensor-data')
  try {
    const res = await request.get('/api/sensor/history', { params: { limit: 1 } })
    if (res.data?.length > 0) {
      const d = res.data[0]
      if (d.temperature != null) latestTemp.value = Number(d.temperature)
      if (d.humidity != null) latestHumidity.value = Number(d.humidity)
    }
  } catch {}
})

onUnmounted(() => {
  disconnect()
  rideTracking.destroy()
  if (deviceOfflineTimer) clearTimeout(deviceOfflineTimer)
})
</script>

<style scoped>
/* ── 整体布局 ── */
.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── 顶部横向导航 ── */
.top-nav {
  height: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: rgba(0, 0, 0, 0.92);
  border-bottom: 1px solid rgba(56,189,248,0.15);
  backdrop-filter: blur(12px);
  z-index: 300;
}

.top-nav__left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-logo__frame {
  width: 30px; height: 30px;
  border: 1.5px solid #38bdf8;
  transform: rotate(45deg);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 8px rgba(56,189,248,0.35);
  flex-shrink: 0;
}
.nav-logo__omega {
  display: block;
  transform: rotate(-45deg);
  font-size: 13px; font-weight: 700;
  color: #38bdf8;
  text-shadow: 0 0 8px rgba(56,189,248,0.8);
  animation: omega-blink 2.4s ease infinite;
}
@keyframes omega-blink {
  0%,100% { opacity: 1; } 48% { opacity: 1; } 50% { opacity: 0.2; } 52% { opacity: 1; }
}

.brand-main {
  font-family: var(--font-mono, monospace);
  font-size: 0.72rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.top-nav__status {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border: 1px solid rgba(56,189,248,0.12);
  background: rgba(56,189,248,0.04);
}
.app-nav__dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.app-nav__dot--ok {
  background: #4ade80;
  box-shadow: 0 0 6px rgba(74,222,128,0.8);
  animation: pulse-ok 2s infinite;
}
@keyframes pulse-ok {
  0%,100% { box-shadow: 0 0 0 0 rgba(74,222,128,0.5); }
  50%      { box-shadow: 0 0 0 4px rgba(74,222,128,0); }
}
.app-nav__dot--warning { background: #FFAA00; box-shadow: 0 0 6px rgba(255,170,0,0.7); }
.app-nav__dot--error   { background: #EF4444; box-shadow: 0 0 6px rgba(239,68,68,0.7); }
.top-nav__status-text {
  font-family: var(--font-mono, monospace);
  font-size: 0.6rem;
  color: rgba(56,189,248,0.7);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.top-nav__right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.nav-metric {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
}
.nav-metric__dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
.nav-metric__dot--green {
  background: #4ade80;
  box-shadow: 0 0 5px rgba(74,222,128,0.8);
  animation: pulse-ok 1.8s infinite;
}
.nav-metric__label {
  font-family: var(--font-mono, monospace);
  font-size: 0.55rem;
  color: rgba(255,255,255,0.25);
  letter-spacing: 0.06em;
}
.nav-metric__val {
  font-family: var(--font-mono, monospace);
  font-size: 0.65rem;
  font-weight: 700;
  color: rgba(255,255,255,0.7);
}
.nav-metric__val--green { color: #4ade80; text-shadow: 0 0 6px rgba(74,222,128,0.5); }

.top-nav__btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border: 1px solid rgba(56,189,248,0.15);
  background: rgba(56,189,248,0.04);
  color: rgba(56,189,248,0.7);
  font-family: var(--font-mono, monospace);
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: all 0.15s;
}
.top-nav__btn:hover {
  background: rgba(56,189,248,0.1);
  color: #38bdf8;
  box-shadow: 0 0 10px rgba(56,189,248,0.2);
}
.top-nav__btn--exit {
  border-color: rgba(239,68,68,0.2);
  color: rgba(239,68,68,0.7);
  background: rgba(239,68,68,0.04);
}
.top-nav__btn--exit:hover {
  background: rgba(239,68,68,0.1);
  color: #EF4444;
  box-shadow: 0 0 10px rgba(239,68,68,0.2);
}

/* ── 主体三栏 ── */
.app-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: row;
  overflow: hidden;
}

/* ── 左侧选项卡 ── */
.side-nav {
  width: 130px;
  flex-shrink: 0;
  background: none;
  position: relative;
  border-right: 1px solid rgba(56,189,248,0.12);
  display: flex;
  flex-direction: column;
  padding: 16px 8px;
  gap: 4px;
  z-index: 200;
}
.side-nav::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/sky.jpg');
  background-size: cover;
  background-position: center;
  filter: brightness(0.6) saturate(1.2);
  z-index: 0;
}
.side-nav > * {
  position: relative;
  z-index: 1;
}

.side-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 12px;
  background: transparent;
  border: none;
  border-left: 2px solid transparent;
  color: rgba(255,255,255,0.35);
  font-family: var(--font-mono, monospace);
  font-size: 0.63rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
  text-align: left;
  width: 100%;
  border-radius: 0 4px 4px 0;
}

.side-tab:hover {
  color: rgba(56,189,248,0.7);
  background: rgba(56,189,248,0.05);
}
.side-tab--active {
  border-left-color: #38bdf8;
  color: #38bdf8;
  background: rgba(56,189,248,0.08);
  text-shadow: 0 0 8px rgba(56,189,248,0.5);
}
.side-tab--active svg { stroke: #38bdf8; filter: drop-shadow(0 0 3px rgba(56,189,248,0.6)); }
.side-tab span { white-space: nowrap; }

/* ── 中间内容区 ── */
.app-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
.page-wrapper--terminal {
  overflow-y: auto;
  overflow-x: hidden;
}
.page-wrapper--dataviz {
  overflow: hidden;
  padding: 0;
}
.page-wrapper--rideplan {
  overflow-y: auto;
  overflow-x: hidden;
}
.twin-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

/* 终端布局：去掉右侧 AiChat，改为单列 */
.terminal-layout {
  max-width: 960px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.terminal-top {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── 右侧星空面板 ── */
.starfield-panel {
  width: 300px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  border-left: 1px solid rgba(56,189,248,0.1);
  display: flex;
  flex-direction: column;
}

.starfield-bg {
  position: absolute;
  inset: 0;
  background-image: url('sky.jpg');
  background-size: cover;
  background-position: center;
  filter: brightness(0.6) saturate(1.2);
  z-index: 0;
}

/* 3D 模型悬浮区域 */
.ai-zone {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 全屏对话框（覆盖整个右侧面板） */
.ai-fullscreen-chat {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  padding: 0;
}

/* 模型淡出动画 */
.model-fade-enter-active,
.model-fade-leave-active { transition: opacity 0.25s ease; }
.model-fade-enter-from,
.model-fade-leave-to     { opacity: 0; }

/* 对话框展开动画 */
.chat-expand-enter-active,
.chat-expand-leave-active { transition: all 0.3s ease; }
.chat-expand-enter-from   { opacity: 0; transform: scale(0.97); }
.chat-expand-leave-to     { opacity: 0; transform: scale(0.97); }

/* 响应式 */
@media (max-width: 1200px) {
  .starfield-panel { width: 240px; }
}
@media (max-width: 900px) {
  .starfield-panel { display: none; }
  .side-nav { width: 52px; }
  .side-tab span { display: none; }
  .side-tab { justify-content: center; padding: 10px; }
}
@media (max-width: 768px) {
  .terminal-layout { padding: 14px; gap: 14px; }
  .top-nav .nav-metric { display: none; }
}
</style>

<style>
body {
  font-family: "Inter", system-ui, sans-serif;
  background: #020817;
  color: #e2e8f0;
  margin: 0; padding: 0;
  overflow-x: hidden;
}
</style>
