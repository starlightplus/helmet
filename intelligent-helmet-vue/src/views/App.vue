<template>
  <SportBackground />
  <div class="app-layout">
    <!-- 全屏星光层（绝对定位，不影响布局） -->
    <canvas ref="starsLeftRef"  class="stars-side stars-side--left"  aria-hidden="true"></canvas>
    <canvas ref="starsRightRef" class="stars-side stars-side--right" aria-hidden="true"></canvas>

    <!-- Top Navigation HUD -->
    <nav class="app-nav cyber-corner-box">
      <div class="app-nav__left">
        <!-- 旋转切角图标 + 闪烁质点 -->
        <div class="nav-logo">
          <div class="nav-logo__frame">
            <span class="nav-logo__omega">Ω</span>
          </div>
        </div>
        <div class="app-nav__brand">
          <span class="brand-main">{{ userProfileStore.nickname || 'X-TERN PROTOCOL' }}</span>
        </div>
        <!-- 连接状态 -->
        <div class="app-nav__status">
          <div :class="indicatorClass"></div>
          <span class="app-nav__status-text">{{ wsStatus }}</span>
        </div>
      </div>

      <!-- 中间：选项卡 -->
      <div class="nav-tabs">
        <button class="nav-tab" :class="{ 'nav-tab--active': activePage === 'terminal' }" @click="activePage = 'terminal'">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
          终端
        </button>
        <button class="nav-tab" :class="{ 'nav-tab--active': activePage === 'twin' }" @click="activePage = 'twin'">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          数字孪生
        </button>
        <button class="nav-tab" :class="{ 'nav-tab--active': activePage === 'dataviz' }" @click="activePage = 'dataviz'">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
          数据可视化
        </button>
      </div>

      <!-- 右侧：实时状态指标 -->
      <div class="app-nav__right">
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
        <div class="nav-metric nav-metric--battery">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2"/><rect x="4" y="9" :width="batteryBarWidth" height="6" rx="1" :fill="batteryColor" stroke="none"/></svg>
          <span class="nav-metric__label">BAT</span>
          <span class="nav-metric__val" :style="{ color: batteryColor }">{{ batteryDisplay }}</span>
        </div>
        <button class="app-nav__btn" @click="goToProfile">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          个人资料
        </button>
        <button class="app-nav__btn app-nav__btn--exit" @click="onLogout">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          EXIT
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="app-body">
      <!-- 内容区 -->
      <div class="app-content">
        <!-- 终端页面 -->
        <div v-show="activePage === 'terminal'" class="page-wrapper page-wrapper--terminal">
          <div class="terminal-layout">
            <!-- 上半部分：左侧环境+骑行 / 右侧AI聊天 等高 -->
            <div class="terminal-top">
              <div class="terminal-top__left">
                <div class="env-dashboard">
                  <TempHumidityCards
                    :temperature="latestTemp"
                    :humidity="latestHumidity"
                  />
                </div>
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
              <div class="terminal-top__right">
                <AiChat :deviceId="latestSensorData.deviceId || ''" />
              </div>
            </div>

            <!-- 下半部分：事件面板全宽 -->
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
      </div>
    </div>
  </div>

  <!-- AI 助手 3D 模型 - 固定在右下角，可拖拽 -->
  <AiAssistant
    :sensor-data="latestSensorData"
    :position="{ x: 24, y: 24 }"
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

// 设备电量（从传感器数据读取，字段名 battery，0-100）
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

// UTC 时钟
const utcClock = ref('')
let clockTimer = null
function updateClock() {
  const now = new Date()
  utcClock.value = now.toUTCString().slice(17, 25) + '.' + String(now.getMilliseconds()).padStart(3,'0')
}
updateClock()

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
  // 按用户加载各自的骑行历史
  rideHistoryStore.loadFromStorage()
  clockTimer = setInterval(updateClock, 100)
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
  // 初始化两侧星光
  await nextTick()
  if (starsLeftRef.value)  initStars(starsLeftRef.value)
  if (starsRightRef.value) initStars(starsRightRef.value)
})

onUnmounted(()=>{
  if (clockTimer) clearInterval(clockTimer)
  disconnect()
  rideTracking.destroy()
  if (deviceOfflineTimer) clearTimeout(deviceOfflineTimer)
  starsAnimId && cancelAnimationFrame(starsAnimId)
})

// ── 两侧星光动画 ──────────────────────────────────────────────────
const starsLeftRef  = ref(null)
const starsRightRef = ref(null)
let starsAnimId = null

function initStars(canvas) {
  const rect = canvas.getBoundingClientRect()
  const W = rect.width  || 180
  const H = rect.height || window.innerHeight
  canvas.width  = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // 生成粒子：普通星点 + 少量流星
  const STAR_COUNT   = Math.floor(W * H / 800)
  const METEOR_COUNT = 3

  const stars = Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.2 + 0.2,
    alpha: Math.random(),
    dAlpha: (Math.random() * 0.008 + 0.002) * (Math.random() < 0.5 ? 1 : -1),
    // 颜色：青色 / 白色 / 紫色
    hue: [180, 200, 270, 0][Math.floor(Math.random() * 4)],
  }))

  const meteors = Array.from({ length: METEOR_COUNT }, () => newMeteor(W, H))

  function newMeteor(w, h) {
    const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.4
    return {
      x: Math.random() * w,
      y: Math.random() * h * 0.5,
      len: 60 + Math.random() * 80,
      speed: 2 + Math.random() * 3,
      angle,
      dx: Math.cos(angle),
      dy: Math.sin(angle),
      alpha: 0,
      phase: 'in', // in → hold → out → dead
      life: 0,
      maxLife: 40 + Math.random() * 40,
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H)

    // 星点
    for (const s of stars) {
      s.alpha += s.dAlpha
      if (s.alpha > 1)  { s.alpha = 1;  s.dAlpha = -Math.abs(s.dAlpha) }
      if (s.alpha < 0)  { s.alpha = 0;  s.dAlpha =  Math.abs(s.dAlpha) }
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fillStyle = s.hue === 0
        ? `rgba(255,255,255,${s.alpha * 0.85})`
        : `hsla(${s.hue},100%,80%,${s.alpha * 0.7})`
      ctx.fill()
    }

    // 流星
    for (let i = 0; i < meteors.length; i++) {
      const m = meteors[i]
      m.life++
      if (m.phase === 'in')   { m.alpha = Math.min(1, m.alpha + 0.06) ; if (m.alpha >= 1) m.phase = 'hold' }
      if (m.phase === 'hold') { if (m.life > m.maxLife) m.phase = 'out' }
      if (m.phase === 'out')  { m.alpha = Math.max(0, m.alpha - 0.04) ; if (m.alpha <= 0) m.phase = 'dead' }
      if (m.phase === 'dead') { meteors[i] = newMeteor(W, H); continue }

      m.x += m.dx * m.speed
      m.y += m.dy * m.speed

      const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.dx * m.len, m.y - m.dy * m.len)
      grad.addColorStop(0, `rgba(0,242,255,${m.alpha * 0.9})`)
      grad.addColorStop(0.4, `rgba(180,100,255,${m.alpha * 0.4})`)
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath()
      ctx.moveTo(m.x, m.y)
      ctx.lineTo(m.x - m.dx * m.len, m.y - m.dy * m.len)
      ctx.strokeStyle = grad
      ctx.lineWidth = 1.5
      ctx.stroke()

      // 流星头部光晕
      const glow = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 4)
      glow.addColorStop(0, `rgba(0,242,255,${m.alpha * 0.8})`)
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath()
      ctx.arc(m.x, m.y, 4, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()

      // 超出边界重置
      if (m.x > W + 100 || m.y > H + 100) meteors[i] = newMeteor(W, H)
    }

    starsAnimId = requestAnimationFrame(draw)
  }

  draw()
}
</script>

<style scoped>
/* ── 布局骨架 ──────────────────────────────────────────────────── */
.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}
.app-body {
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
}

/* ── 两侧星光柱 ──────────────────────────────────────────────────── */
.stars-side {
  position: absolute;
  top: 0;
  height: 100%;
  width: 180px;
  display: block;
  pointer-events: none;
  z-index: 0;
}
.stars-side--left {
  left: 0;
  -webkit-mask-image: linear-gradient(to right, black 55%, transparent 100%);
  mask-image: linear-gradient(to right, black 55%, transparent 100%);
}
.stars-side--right {
  right: 0;
  -webkit-mask-image: linear-gradient(to left, black 55%, transparent 100%);
  mask-image: linear-gradient(to left, black 55%, transparent 100%);
}

/* ── 顶部导航 HUD ────────────────────────────────────────────────── */
.app-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 56px;
  flex-shrink: 0;
  z-index: 300;
  background: rgba(2, 8, 23, 0.92);
  border-bottom: 1px solid rgba(56, 189, 248, 0.18);
  backdrop-filter: blur(12px);
  /* 切角效果 */
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%);
  position: relative;
}
/* cyber-corner-box 左上角定位锚点 */
.cyber-corner-box::before {
  content: "";
  position: absolute;
  top: -1px; left: -1px;
  width: 12px; height: 12px;
  border-top: 2px solid #38bdf8;
  border-left: 2px solid #38bdf8;
  pointer-events: none;
  z-index: 10;
}

/* 左侧 Logo + 品牌 */
.app-nav__left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-logo__frame {
  width: 32px; height: 32px;
  border: 1.5px solid #38bdf8;
  transform: rotate(45deg);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 8px rgba(56,189,248,0.35), inset 0 0 6px rgba(56,189,248,0.1);
  flex-shrink: 0;
}
.nav-logo__omega {
  display: block;
  transform: rotate(-45deg);
  font-size: 14px; font-weight: 700;
  color: #38bdf8;
  text-shadow: 0 0 8px rgba(56,189,248,0.8);
  animation: omega-blink 2.4s ease infinite;
}
@keyframes omega-blink {
  0%,100% { opacity: 1; }
  48%     { opacity: 1; }
  50%     { opacity: 0.2; }
  52%     { opacity: 1; }
}

.app-nav__brand {
  display: flex;
  flex-direction: column;
  gap: 1px;
  line-height: 1;
}
.brand-main {
  font-family: var(--font-mono, monospace);
  font-size: 0.78rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.brand-ver {
  font-family: var(--font-mono, monospace);
  font-size: 0.6rem;
  color: rgba(56,189,248,0.5);
  letter-spacing: 0.08em;
}

.app-nav__status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border: 1px solid rgba(56,189,248,0.12);
  background: rgba(56,189,248,0.04);
  clip-path: polygon(6px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 6px);
}
.app-nav__dot {
  width: 6px; height: 6px;
  border-radius: 50%;
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
.app-nav__status-text {
  font-family: var(--font-mono, monospace);
  font-size: 0.65rem;
  color: rgba(56,189,248,0.7);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* 中间选项卡 */
.nav-tabs {
  display: flex;
  align-items: stretch;
  gap: 2px;
  height: 100%;
}
.nav-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 20px;
  height: 100%;
  background: transparent;
  border: none;
  border-top: 2px solid transparent;
  border-bottom: 2px solid transparent;
  color: rgba(255,255,255,0.35);
  font-family: var(--font-mono, monospace);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}
.nav-tab:hover {
  color: rgba(56,189,248,0.7);
  background: rgba(56,189,248,0.04);
}
.nav-tab--active {
  border-top-color: #38bdf8;
  color: #38bdf8;
  background: rgba(56,189,248,0.06);
  text-shadow: 0 0 8px rgba(56,189,248,0.5);
}
.nav-tab--active svg { stroke: #38bdf8; filter: drop-shadow(0 0 3px rgba(56,189,248,0.6)); }

/* 右侧状态指标 */
.app-nav__right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.nav-metric {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
  clip-path: polygon(4px 0%,100% 0%,100% 100%,0% 100%,0% 4px);
}
.nav-metric__dot {
  width: 5px; height: 5px;
  border-radius: 50%;
}
.nav-metric__dot--green {
  background: #4ade80;
  box-shadow: 0 0 5px rgba(74,222,128,0.8);
  animation: pulse-ok 1.8s infinite;
}
.nav-metric__label {
  font-family: var(--font-mono, monospace);
  font-size: 0.58rem;
  color: rgba(255,255,255,0.25);
  letter-spacing: 0.08em;
}
.nav-metric__val {
  font-family: var(--font-mono, monospace);
  font-size: 0.68rem;
  font-weight: 700;
  color: rgba(255,255,255,0.7);
}
.nav-metric__val--green { color: #4ade80; text-shadow: 0 0 6px rgba(74,222,128,0.5); }
.nav-metric__val--mono  { color: #38bdf8; letter-spacing: 0.04em; }

.app-nav__btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border: 1px solid rgba(56,189,248,0.15);
  background: rgba(56,189,248,0.04);
  color: rgba(56,189,248,0.7);
  font-family: var(--font-mono, monospace);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  cursor: pointer;
  clip-path: polygon(6px 0%,100% 0%,100% calc(100% - 6px),calc(100% - 6px) 100%,0% 100%,0% 6px);
  transition: all 0.15s;
}
.app-nav__btn:hover {
  background: rgba(56,189,248,0.1);
  color: #38bdf8;
  box-shadow: 0 0 10px rgba(56,189,248,0.2);
}
.app-nav__btn--exit {
  border-color: rgba(239,68,68,0.2);
  color: rgba(239,68,68,0.7);
  background: rgba(239,68,68,0.04);
}
.app-nav__btn--exit:hover {
  background: rgba(239,68,68,0.1);
  color: #EF4444;
  box-shadow: 0 0 10px rgba(239,68,68,0.2);
}

/* ── 内容区 ──────────────────────────────────────────────────────── */
.app-content {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  padding: 0 160px;
  box-sizing: border-box;
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
.twin-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

/* ── 终端布局 ─────────────────────────────────────────────────────── */
.terminal-layout {
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
/* 上半：左右两列等高 */
.terminal-top {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
  align-items: stretch;
  min-height: 450px;
}
.terminal-top__left {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.terminal-top__right {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 450px;
}
.env-dashboard {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
/* RideStatsPanel 撑满左列剩余高度，底部与 AI 面板对齐 */
.terminal-top__left > *:last-child {
  flex: 1;
}

@media (max-width: 1024px) {
  .terminal-top {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 1200px) {
  .app-content { padding: 0 80px; }
  .stars-side { width: 100px; }
}
@media (max-width: 768px) {
  .app-nav { padding: 0 14px; }
  .nav-metric { display: none; }
  .terminal-layout { padding: 14px; gap: 14px; }
  .app-content { padding: 0; }
  .stars-side { display: none; }
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
