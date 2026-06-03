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

      <!-- 中间选项卡 -->
      <div class="top-nav__tabs">
        <button class="top-tab" :class="{ 'top-tab--active': activePage === 'terminal' }" @click="activePage = 'terminal'">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
          终端
        </button>
        <button class="top-tab" :class="{ 'top-tab--active': activePage === 'twin' }" @click="activePage = 'twin'">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          数字孪生
        </button>
        <button class="top-tab" :class="{ 'top-tab--active': activePage === 'dataviz' }" @click="activePage = 'dataviz'">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
          数据可视化
        </button>
        <button class="top-tab" :class="{ 'top-tab--active': activePage === 'rideplan' }" @click="activePage = 'rideplan'">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6l9-3 9 3M3 18l9 3 9-3"/></svg>
          AI伴骑
        </button>
      </div>

      <div class="top-nav__right">
        <div class="nav-metric">
          <span class="nav-metric__dot nav-metric__dot--green"></span>
          <span class="nav-metric__label">SYNC</span>
          <span class="nav-metric__val nav-metric__val--green">STABLE</span>
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

      <!-- 中间内容区 -->
      <main class="app-content">
        <!-- 终端页面 -->
        <div v-show="activePage === 'terminal'" class="page-wrapper page-wrapper--terminal">
          <div class="terminal-layout">
            <div class="terminal-left">
              <TempHumidityCards
                :temperature="latestTemp"
                :humidity="latestHumidity"
                :battery="latestSensorData.battery != null ? Number(latestSensorData.battery) : null"
                :voltage="latestSensorData.voltage != null ? Number(latestSensorData.voltage) : null"
              />
            </div>
            <div class="terminal-right">
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
            <div class="terminal-bottom">
              <EventPanel ref="eventPanel" />
            </div>
          </div>
        </div>

        <!-- 数字孪生页面 -->
        <div v-show="activePage === 'twin'" class="page-wrapper page-wrapper--twin">
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
            <div class="ai-landing-glow"></div>
            <!-- 用户指引（中部） -->
            <div class="ai-guide">
              <div class="ai-guide__tip" @click="toggleAiChat">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                点击模型开启 AI 对话
              </div>
              <div class="ai-guide__divider"></div>
              <div class="ai-guide__list">
                <div class="ai-guide__item"><span class="ai-guide__dot"></span><span>实时分析头盔传感器数据</span></div>
                <div class="ai-guide__item"><span class="ai-guide__dot"></span><span>骑行安全预警与建议</span></div>
                <div class="ai-guide__item"><span class="ai-guide__dot"></span><span>导航 · 天气 · 路线规划</span></div>
                <div class="ai-guide__item"><span class="ai-guide__dot"></span><span>摔倒检测自动触发报警</span></div>
              </div>
            </div>

            <!-- 底部固定：紧急联系人 + 血氧心率 -->
            <div class="ai-zone__bottom">
              <div class="ai-emergency">
                <div class="ai-emergency__header">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.77 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.68 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.64a16 16 0 0 0 5.66 5.66l1.01-1.01a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.33 15l.01 1.92z"/></svg>
                  <span>紧急联系人</span>
                </div>
                <template v-if="primaryContact">
                  <div class="ai-emergency__contact">
                    <span class="ai-emergency__name">{{ primaryContact.name }}</span>
                    <span class="ai-emergency__phone">{{ primaryContact.phone }}</span>
                  </div>
                  <div class="ai-emergency__note">用户摔倒时，系统会第一时间呼叫紧急联系人</div>
                </template>
                <template v-else>
                  <router-link to="/emergency-contacts" class="ai-emergency__setup">去设置紧急联系人 →</router-link>
                </template>
              </div>

              <div class="ai-vitals">
                <div class="ai-vitals__header">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fb7185" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  <span>实时生命体征</span>
                  <span class="ai-vitals__badge">上一分钟</span>
                </div>
                <div class="ai-vitals__metrics">
                  <div class="ai-vitals__metric">
                    <span class="ai-vitals__val ai-vitals__val--hr">{{ currentHR }}</span>
                    <div class="ai-vitals__meta">
                      <span class="ai-vitals__unit">BPM</span>
                      <span class="ai-vitals__name">心率</span>
                    </div>
                  </div>
                  <div class="ai-vitals__sep"></div>
                  <div class="ai-vitals__metric">
                    <span class="ai-vitals__val ai-vitals__val--spo2">{{ currentSpo2 != null ? currentSpo2 + '%' : '--' }}</span>
                    <div class="ai-vitals__meta">
                      <span class="ai-vitals__unit">SpO2</span>
                      <span class="ai-vitals__name">血氧</span>
                    </div>
                  </div>
                </div>
                <div class="ai-vitals__spark" v-if="sparkData.length">
                  <div v-for="(v, i) in sparkData" :key="i" class="ai-vitals__spark-bar"
                    :style="{ height: v.h + '%', background: v.color }" :title="v.bpm + ' BPM'"></div>
                </div>
                <div class="ai-vitals__spark ai-vitals__spark--empty" v-else><span>等待数据...</span></div>
              </div>
            </div>
          </div>
        </Transition>

        <!-- 模式二：AI 对话框全屏占满右侧（打开对话后） -->
        <Transition name="chat-expand">
          <div v-if="showAiChat" class="ai-fullscreen-chat">
            <AiChat :deviceId="latestSensorData.deviceId || ''" :sensor-data="latestSensorData" :show-close="true" @close="toggleAiChat" />
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

// ── 紧急联系人 ──────────────────────────────────────────────────
const contacts = ref([])
const primaryContact = computed(() => contacts.value[0] || null)
function loadContacts() {
  try { contacts.value = JSON.parse(localStorage.getItem('emergency_contacts')) || [] } catch { contacts.value = [] }
}

// ── 血氧心率（滑动窗口，保留上一分钟数据）──────────────────────
const vitalWindow = ref([]) // { ts: Date, bpm, spo2 }
const currentHR = computed(() => {
  const recent = lastMinuteVitals.value
  if (!recent.length) return '--'
  return Math.round(recent.reduce((s, v) => s + v.bpm, 0) / recent.length)
})
const currentSpo2 = computed(() => {
  const recent = lastMinuteVitals.value.filter(v => v.spo2 != null)
  if (!recent.length) return null
  return Math.round(recent.reduce((s, v) => s + v.spo2, 0) / recent.length)
})
const lastMinuteVitals = computed(() => {
  const cutoff = Date.now() - 60000
  return vitalWindow.value.filter(v => v.ts > cutoff)
})
// sparkline: 最近60秒按5秒一格分12段
const sparkData = computed(() => {
  const now = Date.now()
  const segments = 12
  const segMs = 5000
  const result = []
  for (let i = segments - 1; i >= 0; i--) {
    const start = now - (i + 1) * segMs
    const end   = now - i * segMs
    const pts = vitalWindow.value.filter(v => v.ts >= start && v.ts < end)
    if (!pts.length) { result.push(null); continue }
    const avg = Math.round(pts.reduce((s, v) => s + v.bpm, 0) / pts.length)
    result.push(avg)
  }
  const valid = result.filter(v => v != null)
  const min = valid.length ? Math.min(...valid) : 60
  const max = valid.length ? Math.max(...valid) : 180
  const range = Math.max(max - min, 20)
  return result.map(v => {
    if (v == null) return { h: 10, color: 'rgba(255,255,255,0.08)', bpm: '--' }
    const h = 20 + Math.round((v - min) / range * 75)
    const color = v >= 170 ? '#ef4444' : v >= 140 ? '#f59e0b' : v >= 100 ? '#4ade80' : v >= 60 ? '#22d3ee' : 'rgba(255,255,255,0.4)'
    return { h, color, bpm: v }
  })
})

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
  // 收集心率血氧到滑动窗口
  if (payload.heartRate != null) {
    const now = Date.now()
    vitalWindow.value.push({ ts: now, bpm: Number(payload.heartRate), spo2: payload.spo2 != null ? Number(payload.spo2) : null })
    // 只保留最近2分钟
    const cutoff = now - 120000
    vitalWindow.value = vitalWindow.value.filter(v => v.ts > cutoff)
  }
}

function resetDeviceOfflineTimer() {
  if (deviceOfflineTimer) clearTimeout(deviceOfflineTimer)
  deviceOfflineTimer = setTimeout(() => { deviceOnline.value = false }, DEVICE_OFFLINE_TIMEOUT)
}

setOnSensorData(handleSensorDataFromWS)

function onLogout() { userStore.logout(); router.push('/auth') }
function goToProfile() { router.push('/profile') }

onMounted(async () => {
  loadContacts()
  rideHistoryStore.loadFromStorage()
  rideHistoryStore.syncFromBackend()
  connect('ws://localhost:8082/ws/sensor-data')
  try {
    const res = await request.get('/api/sensor/history', { params: { limit: 1 } })
    if (res.data?.length > 0) {
      const d = res.data[0]
      if (d.temperature != null) latestTemp.value = Number(d.temperature)
      if (d.humidity != null) latestHumidity.value = Number(d.humidity)
      // 用数据库最近一条记录初始化 latestSensorData，使电量/心率/血氧在终端页面立即显示
      latestSensorData.value = { ...latestSensorData.value, ...d }
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
  background: transparent;
}

/* ── 顶部横向导航 ── */
.top-nav {
  height: 48px;
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 20px;
  background: transparent;
  border-bottom: 1px solid rgba(56,189,248,0.15);
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
  justify-content: flex-end;
}

/* ── 顶部中间选项卡 ── */
.top-nav__tabs {
  display: flex;
  align-items: center;
  gap: 2px;
  justify-content: center;
}
.top-tab {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 14px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: rgba(255,255,255,0.5);
  font-family: var(--font-mono, monospace);
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.18s, border-color 0.18s;
  height: 48px;
  white-space: nowrap;
}
.top-tab:hover {
  color: rgba(56,189,248,0.8);
}
.top-tab--active {
  color: #38bdf8;
  border-bottom-color: #38bdf8;
  text-shadow: 0 0 8px rgba(56,189,248,0.5);
}
.top-tab--active svg { stroke: #38bdf8; filter: drop-shadow(0 0 3px rgba(56,189,248,0.6)); }
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
  overflow-y: auto;
  overflow-x: hidden;
}

/* ── 中间内容区 ── */
.app-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: visible;
  position: relative;
}
.app-content > * {
  position: relative;
  z-index: 1;
}

.page-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: visible;
}
.page-wrapper--terminal {
  overflow: hidden;
  height: calc(100vh - 48px);
}
.page-wrapper--dataviz {
  overflow: hidden;
  padding: 0;
  height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
}
.page-wrapper--rideplan {
  overflow: visible;
}
.twin-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  height: 100vh;
}
.page-wrapper--twin {
  height: calc(100vh - 48px);
  overflow: hidden;
  flex-shrink: 0;
}

/* 终端布局：左栏传感器 + 右栏骑行/事件 */
.terminal-layout {
  width: 100%;
  height: calc(100vh - 48px);
  padding: 20px 24px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 320px 1fr;
  grid-template-rows: 1fr auto;
  gap: 16px;
  overflow: hidden;
}
.terminal-left {
  grid-column: 1;
  grid-row: 1 / 3;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
  height: 100%;
}
.terminal-right {
  grid-column: 2;
  grid-row: 1;
  min-height: 0;
}
.terminal-bottom {
  grid-column: 2;
  grid-row: 2;
}

/* ── 右侧星空面板 ── */
.starfield-panel {
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: calc(100vh - 48px);
  align-self: flex-start;
  overflow: hidden;
  border-left: 1px solid rgba(56,189,248,0.08);
  display: flex;
  flex-direction: column;
  background: rgba(5, 8, 18, 0.55);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.starfield-bg {
  display: none;
}

/* 3D 模型悬浮区域 */
.ai-zone {
  position: absolute;
  inset: 0;
  z-index: 2;
}
/* title label */
.ai-zone::before {
  content: 'AI · ASSISTANT';
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-mono, monospace);
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: rgba(56,189,248,0.45);
  white-space: nowrap;
  pointer-events: none;
  z-index: 1;
}
.ai-zone::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(56,189,248,0.2), transparent);
  pointer-events: none;
}

/* 用户指引区 — 绝对定位，不遮挡模型事件区 */
.ai-guide {
  position: absolute;
  left: 0; right: 0;
  top: 230px;    /* 模型下方 */
  bottom: 220px; /* 底部卡片上方 */
  z-index: 1;
  padding: 0 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  pointer-events: none; /* 整体不拦截事件，只有子按钮恢复 */
  scrollbar-width: thin;
  scrollbar-color: rgba(56,189,248,0.2) transparent;
}
.ai-guide__tip,
.ai-guide__list,
.ai-guide__item,
.ai-guide__divider {
  pointer-events: auto;
}

/* 底部固定区 */
.ai-zone__bottom {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 14px 14px;
  pointer-events: auto;
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

/* 用户指引区 */
.ai-guide {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 0 14px 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(56,189,248,0.2) transparent;
}
.ai-guide__tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 12px;
  border: 1px solid rgba(56,189,248,0.2);
  background: rgba(56,189,248,0.05);
  border-radius: 6px;
  font-family: var(--font-mono, monospace);
  font-size: 0.62rem;
  color: rgba(56,189,248,0.75);
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: all 0.2s;
}
.ai-guide__tip:hover {
  background: rgba(56,189,248,0.1);
  color: #38bdf8;
  box-shadow: 0 0 10px rgba(56,189,248,0.15);
}
.ai-guide__tip svg { stroke: rgba(56,189,248,0.7); flex-shrink: 0; }
.ai-guide__divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(56,189,248,0.15), transparent);
}
.ai-guide__list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.ai-guide__item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono, monospace);
  font-size: 0.58rem;
  color: rgba(255,255,255,0.4);
  letter-spacing: 0.04em;
}
.ai-guide__dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(56,189,248,0.4);
  flex-shrink: 0;
}

/* AI 着陆光晕底座 */
.ai-landing-glow {
  position: absolute;
  bottom: 18%;
  left: 50%;
  transform: translateX(-50%);
  width: 140px;
  height: 24px;
  background: radial-gradient(ellipse at center, rgba(56,189,248,0.38) 0%, rgba(56,189,248,0.08) 50%, transparent 75%);
  border-radius: 50%;
  filter: blur(10px);
  animation: landing-breathe 3s ease-in-out infinite;
  pointer-events: none;
  z-index: 1;
}
@keyframes landing-breathe {
  0%,100% { opacity: 0.45; transform: translateX(-50%) scaleX(0.85); }
  50%      { opacity: 0.9;  transform: translateX(-50%) scaleX(1.15); }
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

/* ── 紧急联系人区 ── */
.ai-emergency {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(239,68,68,0.18);
  background: rgba(239,68,68,0.04);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.ai-emergency__header {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font-mono, monospace);
  font-size: 0.58rem;
  color: rgba(239,68,68,0.7);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.ai-emergency__header svg { stroke: rgba(239,68,68,0.7); flex-shrink: 0; }
.ai-emergency__contact {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.ai-emergency__name {
  font-family: var(--font-mono, monospace);
  font-size: 0.72rem;
  font-weight: 700;
  color: #fff;
}
.ai-emergency__phone {
  font-family: var(--font-mono, monospace);
  font-size: 0.68rem;
  color: #38bdf8;
}
.ai-emergency__note {
  font-family: var(--font-mono, monospace);
  font-size: 0.58rem;
  color: rgba(255,255,255,0.4);
  line-height: 1.4;
}
.ai-emergency__setup {
  font-family: var(--font-mono, monospace);
  font-size: 0.62rem;
  color: #38bdf8;
  text-decoration: underline;
  cursor: pointer;
}
.ai-emergency__setup:hover { color: #7dd3fc; }

/* ── 血氧心率实时体征区 ── */
.ai-vitals {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(251,113,133,0.18);
  background: rgba(251,113,133,0.04);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ai-vitals__header {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font-mono, monospace);
  font-size: 0.58rem;
  color: rgba(251,113,133,0.7);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.ai-vitals__badge {
  margin-left: auto;
  font-size: 0.52rem;
  padding: 1px 6px;
  border: 1px solid rgba(251,113,133,0.25);
  background: rgba(251,113,133,0.08);
  color: rgba(251,113,133,0.6);
  border-radius: 10px;
}
.ai-vitals__metrics {
  display: flex;
  align-items: center;
  gap: 0;
}
.ai-vitals__metric {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}
.ai-vitals__sep {
  width: 1px;
  height: 32px;
  background: rgba(255,255,255,0.08);
  margin: 0 10px;
  flex-shrink: 0;
}
.ai-vitals__val {
  font-family: var(--font-mono, monospace);
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1;
}
.ai-vitals__val--hr   { color: #fb7185; text-shadow: 0 0 12px rgba(251,113,133,0.5); }
.ai-vitals__val--spo2 { color: #a78bfa; text-shadow: 0 0 12px rgba(167,139,250,0.5); }
.ai-vitals__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ai-vitals__unit {
  font-family: var(--font-mono, monospace);
  font-size: 0.6rem;
  color: rgba(255,255,255,0.4);
  letter-spacing: 0.06em;
}
.ai-vitals__name {
  font-family: var(--font-mono, monospace);
  font-size: 0.58rem;
  color: rgba(255,255,255,0.25);
}
/* sparkline */
.ai-vitals__spark {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 28px;
  padding: 2px 0;
}
.ai-vitals__spark-bar {
  flex: 1;
  border-radius: 2px 2px 0 0;
  min-height: 4px;
  transition: height 0.3s ease;
}
.ai-vitals__spark--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono, monospace);
  font-size: 0.56rem;
  color: rgba(255,255,255,0.2);
}

/* 响应式 */
@media (max-width: 1200px) {
  .starfield-panel { width: 240px; }
  .terminal-layout { grid-template-columns: 280px 1fr; }
}
@media (max-width: 900px) {
  .starfield-panel { display: none; }
  .terminal-layout { grid-template-columns: 1fr; grid-template-rows: auto auto auto; }
  .terminal-left  { grid-column: 1; grid-row: 1; }
  .terminal-right { grid-column: 1; grid-row: 2; }
  .terminal-bottom { grid-column: 1; grid-row: 3; }
}
@media (max-width: 768px) {
  .terminal-layout { padding: 12px; gap: 12px; }
  .top-nav .nav-metric { display: none; }
  .top-tab span { display: none; }
}

/* ── 全局滚动条（app-body 层） ── */
.app-body::-webkit-scrollbar {
  width: 4px;
}
.app-body::-webkit-scrollbar-track {
  background: transparent;
}
.app-body::-webkit-scrollbar-thumb {
  background: rgba(56,189,248,0.25);
  border-radius: 2px;
}
.app-body::-webkit-scrollbar-thumb:hover {
  background: rgba(56,189,248,0.5);
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
