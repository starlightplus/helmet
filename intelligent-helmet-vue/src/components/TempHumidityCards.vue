<template>
  <div class="sensor-cards">
    <!-- Merged Temp + Humidity Card -->
    <div class="sensor-card sensor-card--env">
      <div class="card-accent card-accent--env"></div>
      <div class="card-header">
        <div class="card-label-group">
          <span class="card-tag">传感器</span>
          <span class="card-title">环境监测</span>
        </div>
      </div>
      <div class="card-body card-body--split">
        <!-- Temperature -->
        <div class="env-section">
          <canvas ref="tempCanvasRef" class="lottie-canvas"></canvas>
          <div class="card-value-block">
            <div class="env-label">温度</div>
            <div class="value-row">
              <span class="value-num value-num--temp">{{ temperature != null ? temperature.toFixed(1) : '--' }}</span>
              <span class="value-unit">°C</span>
            </div>
            <div class="status-badge" :style="{ color: tempStatusColor, borderColor: tempStatusColor + '40', background: tempStatusColor + '12' }">
              {{ tempStatus }}
            </div>
          </div>
        </div>
        <div class="env-divider"></div>
        <!-- Humidity -->
        <div class="env-section">
          <canvas ref="humCanvasRef" class="lottie-canvas"></canvas>
          <div class="card-value-block">
            <div class="env-label">湿度</div>
            <div class="value-row">
              <span class="value-num value-num--hum">{{ humidity != null ? humidity.toFixed(1) : '--' }}</span>
              <span class="value-unit">%</span>
            </div>
            <div class="status-badge" :style="{ color: humStatusColor, borderColor: humStatusColor + '40', background: humStatusColor + '12' }">
              {{ humStatus }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Battery Card -->
    <div class="sensor-card sensor-card--bat">
      <div class="card-accent card-accent--bat"></div>
      <div class="card-header">
        <div class="card-label-group">
          <span class="card-tag">电源</span>
          <span class="card-title">头盔电量</span>
        </div>
      </div>
      <div class="card-body card-body--bat">
        <div class="bat-icon-wrap">
          <svg class="bat-svg" viewBox="0 0 48 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="14" y="0" width="20" height="6" rx="3" :fill="batColor" opacity="0.7"/>
            <rect x="2" y="8" width="44" height="68" rx="6" stroke="rgba(255,255,255,0.25)" stroke-width="2" fill="none"/>
            <rect x="5" y="11" width="38" :height="batBarHeight" rx="4" :fill="batColor" :style="{ filter: `drop-shadow(0 0 6px ${batColor})` }"/>
          </svg>
          <div class="bat-pct" :style="{ color: batColor }">{{ fakeBattery }}%</div>
        </div>
        <div class="bat-info">
          <div class="bat-big" :style="{ color: batColor }">
            {{ fakeBattery }}<span class="bat-unit">%</span>
          </div>
          <div class="bat-bar-wrap">
            <div class="bat-bar-track">
              <div class="bat-bar-fill" :style="{ width: fakeBattery + '%', background: batColor, boxShadow: `0 0 8px ${batColor}` }"></div>
            </div>
            <span class="bat-bar-label">{{ batStatusText }}</span>
          </div>
          <div class="bat-meta">
            <div class="bat-meta-item">
              <span class="bat-meta-key">预计续航</span>
              <span class="bat-meta-val" :style="{ color: batColor }">{{ batRemainHours }}h</span>
            </div>
            <div class="bat-meta-item">
              <span class="bat-meta-key">充电状态</span>
              <span class="bat-meta-val" style="color: #4ade80">未充电</span>
            </div>
          </div>
          <div class="status-badge" :style="{ color: batColor, borderColor: batColor + '40', background: batColor + '12' }">
            {{ batStatusText }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { DotLottie } from '@lottiefiles/dotlottie-web'

const props = defineProps({
  temperature: { type: Number, default: null },
  humidity:    { type: Number, default: null }
})

// Fake battery: 78%
const fakeBattery = ref(78)

const tempCanvasRef = ref(null)
const humCanvasRef  = ref(null)
let tempLottie = null
let humLottie  = null

onMounted(() => {
  if (tempCanvasRef.value) {
    tempLottie = new DotLottie({ canvas: tempCanvasRef.value, src: '/animations/temp.lottie', loop: true, autoplay: true })
  }
  if (humCanvasRef.value) {
    humLottie = new DotLottie({ canvas: humCanvasRef.value, src: '/animations/humid.lottie', loop: true, autoplay: true })
  }
})

onUnmounted(() => {
  tempLottie?.destroy()
  humLottie?.destroy()
})

const tempStatus = computed(() => {
  if (props.temperature == null) return '等待数据'
  if (props.temperature < 0)  return '极冷'
  if (props.temperature < 10) return '寒冷'
  if (props.temperature < 20) return '凉爽'
  if (props.temperature < 26) return '舒适'
  if (props.temperature < 35) return '偏热'
  return '高温'
})
const tempStatusColor = computed(() => {
  if (props.temperature == null) return 'rgba(255,255,255,0.3)'
  if (props.temperature < 10) return '#38bdf8'
  if (props.temperature < 26) return '#00ff88'
  if (props.temperature < 35) return '#ffaa00'
  return '#ff4444'
})
const humStatus = computed(() => {
  if (props.humidity == null) return '等待数据'
  if (props.humidity < 20) return '干燥'
  if (props.humidity < 40) return '偏干'
  if (props.humidity < 70) return '适宜'
  if (props.humidity < 85) return '偏湿'
  return '潮湿'
})
const humStatusColor = computed(() => {
  if (props.humidity == null) return 'rgba(255,255,255,0.3)'
  if (props.humidity < 20) return '#ffaa00'
  if (props.humidity < 40) return '#38bdf8'
  if (props.humidity < 70) return '#00ff88'
  if (props.humidity < 85) return '#ff8800'
  return '#ff0055'
})

const batColor = computed(() => {
  if (fakeBattery.value > 50) return '#4ade80'
  if (fakeBattery.value > 20) return '#FFAA00'
  return '#EF4444'
})
const batStatusText = computed(() => {
  if (fakeBattery.value > 80) return '电量充足'
  if (fakeBattery.value > 50) return '电量良好'
  if (fakeBattery.value > 20) return '电量偏低'
  return '电量不足'
})
const batRemainHours = computed(() => Math.round(fakeBattery.value * 0.12))
// Battery bar height: max fill area is 52px tall
const batBarHeight = computed(() => Math.round(fakeBattery.value / 100 * 52))
</script>

<style scoped>
/* ── Shared card token ── */
.sensor-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.sensor-card {
  position: relative;
  background: rgba(5, 8, 18, 0.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(56,189,248,0.18);
  border-radius: 10px;
  padding: 18px 18px 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.sensor-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #38bdf8, transparent);
  opacity: 0.5;
}
.sensor-card--env {
  box-shadow: 0 4px 32px rgba(0,0,0,0.55), 0 0 20px -6px rgba(56,189,248,0.12);
}
.sensor-card--bat {
  box-shadow: 0 4px 32px rgba(0,0,0,0.55), 0 0 20px -6px rgba(74,222,128,0.10);
}

.card-accent {
  position: absolute;
  top: 14px; left: 0;
  width: 2px;
  height: calc(100% - 28px);
}
.card-accent--env { background: linear-gradient(180deg, #38bdf8, rgba(56,189,248,0.05)); }
.card-accent--bat { background: linear-gradient(180deg, #4ade80, rgba(74,222,128,0.05)); }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.card-label-group {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.card-tag {
  font-family: var(--font-mono, monospace);
  font-size: 8px;
  letter-spacing: 0.15em;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
}
.card-title {
  font-family: var(--font-mono, monospace);
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255,255,255,0.85);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* ── Env (merged) card — stacked top/bottom ── */
.card-body--split {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.env-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
}
.env-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(56,189,248,0.25), transparent);
  flex-shrink: 0;
}
.env-label {
  font-family: var(--font-mono, monospace);
  font-size: 0.58rem;
  color: #A0AAB2;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.lottie-canvas {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
}
.card-value-block {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.value-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
  line-height: 1;
}
.value-num {
  font-family: var(--font-mono, monospace);
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.03em;
}
.value-num--temp { color: #38bdf8; text-shadow: 0 0 12px rgba(56,189,248,0.55); }
.value-num--hum  { color: #a78bfa; text-shadow: 0 0 12px rgba(167,139,250,0.55); }
.value-unit {
  font-family: var(--font-mono, monospace);
  font-size: 12px;
  color: rgba(255,255,255,0.4);
}
.status-badge {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  padding: 3px 8px;
  border: 1px solid;
  border-radius: 4px;
  font-family: var(--font-mono, monospace);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  transition: color 0.4s, border-color 0.4s, background 0.4s;
}

/* ── Battery card ── */
.card-body--bat {
  display: flex;
  align-items: center;
  gap: 16px;
}
.bat-icon-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.bat-svg {
  width: 32px;
  height: 54px;
}
.bat-pct {
  font-family: var(--font-mono, monospace);
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.06em;
}
.bat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.bat-big {
  font-family: var(--font-mono, monospace);
  font-size: 32px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.02em;
}
.bat-unit {
  font-size: 14px;
  font-weight: 400;
  opacity: 0.6;
}
.bat-bar-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.bat-bar-track {
  height: 4px;
  background: rgba(255,255,255,0.08);
  border-radius: 2px;
  overflow: hidden;
}
.bat-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;
}
.bat-bar-label {
  font-family: var(--font-mono, monospace);
  font-size: 0.58rem;
  color: rgba(255,255,255,0.35);
  letter-spacing: 0.06em;
}
.bat-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 0;
  border-top: 1px solid rgba(255,255,255,0.06);
  padding-top: 8px;
}
.bat-meta-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.bat-meta-item:nth-child(2) {
  padding-left: 12px;
  border-left: 1px solid rgba(255,255,255,0.06);
}
.bat-meta-key {
  font-family: var(--font-mono, monospace);
  font-size: 0.55rem;
  color: #A0AAB2;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.bat-meta-val {
  font-family: var(--font-mono, monospace);
  font-size: 0.78rem;
  font-weight: 700;
}
</style>
