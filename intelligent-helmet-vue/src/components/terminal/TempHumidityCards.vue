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
        <div class="card-header-divider"></div>
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
          <canvas ref="humCanvasRef" class="lottie-canvas lottie-canvas--hum"></canvas>
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
          <div class="bat-pct" :style="{ color: batColor }">{{ fakeBattery != null ? fakeBattery + '%' : '--' }}</div>
        </div>
        <div class="bat-info">
          <div class="bat-big" :style="{ color: batColor }">
            {{ fakeBattery != null ? fakeBattery : '--' }}<span class="bat-unit">%</span>
          </div>
          <div class="bat-bar-wrap">
            <div class="bat-bar-track">
              <div class="bat-bar-fill" :style="{ width: (fakeBattery ?? 0) + '%', background: batColor, boxShadow: `0 0 8px ${batColor}` }"></div>
            </div>
            <span class="bat-bar-label">{{ batStatusText }}</span>
          </div>
          <div class="bat-meta">
            <div class="bat-meta-item">
              <span class="bat-meta-key">预计续航</span>
              <span class="bat-meta-val" :style="{ color: batColor }">{{ batRemainHours }}h</span>
            </div>
            <div class="bat-meta-item">
              <span class="bat-meta-key">电压</span>
              <span class="bat-meta-val" :style="{ color: voltageAbnormal ? '#EF4444' : '#4ade80' }">
                {{ voltage != null ? voltage.toFixed(2) + 'V' : '--' }}
              </span>
            </div>
          </div>
          <div v-if="voltageAbnormal" class="bat-voltage-warn">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            电压异常 {{ voltage.toFixed(2) }}V（正常 3.0~5.13V）
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
  humidity:    { type: Number, default: null },
  battery:     { type: Number, default: null },
  voltage:     { type: Number, default: null },
})

const fakeBattery = computed(() => props.battery != null ? Math.max(0, Math.min(100, props.battery)) : null)

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
  if (fakeBattery.value == null) return 'rgba(255,255,255,0.35)'
  if (fakeBattery.value > 50) return '#4ade80'
  if (fakeBattery.value > 20) return '#FFAA00'
  return '#EF4444'
})
const batStatusText = computed(() => {
  if (fakeBattery.value == null) return '等待数据'
  if (fakeBattery.value > 80) return '电量充足'
  if (fakeBattery.value > 50) return '电量良好'
  if (fakeBattery.value > 20) return '电量偏低'
  return '电量不足'
})
const batRemainHours = computed(() => fakeBattery.value != null ? Math.round(fakeBattery.value * 0.12) : '--')
const batBarHeight = computed(() => Math.round((fakeBattery.value ?? 0) / 100 * 52))

// 电压异常：正常工作范围 3.0~5.13V
const voltageNormal = computed(() => props.voltage != null && props.voltage >= 3.0 && props.voltage <= 5.13)
const voltageAbnormal = computed(() => props.voltage != null && !voltageNormal.value)
</script>

<style scoped>
/* ── Shared card token ── */
.sensor-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  height: 100%;
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
.sensor-card--env {
  flex: 1;
  min-height: 0;
}
.sensor-card--bat {
  flex: 0 0 auto;
  min-height: 240px;
  margin-top: 8px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.55), 0 0 20px -6px rgba(74,222,128,0.10);
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
  font-size: 12px;
  letter-spacing: 0.15em;
  color: #38bdf8;
  text-transform: uppercase;
}
.card-title {
  font-family: var(--font-mono, monospace);
  font-size: 0.8rem;
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
  flex: 1;
  justify-content: space-evenly;
}
/* divider between header title and first section */
.card-header-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(56,189,248,0.25), transparent);
  flex-shrink: 0;
  margin-bottom: 2px;
}
.env-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 8px 0;
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
  align-self: center;
}
/* humidity icon slightly smaller to match temp visual weight */
.lottie-canvas--hum {
  width: 42px;
  height: 42px;
  margin-left: 7px;
}
.card-value-block {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
}
.value-row {
  display: flex;
  align-items: baseline;
  gap: 5px;
  line-height: 1;
}
.value-num {
  font-family: var(--font-mono, 'JetBrains Mono', 'Roboto Mono', monospace);
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}
.value-num--temp { color: #38bdf8; text-shadow: 0 0 12px rgba(56,189,248,0.55); }
.value-num--hum  { color: #a78bfa; text-shadow: 0 0 14px rgba(167,139,250,0.7); filter: brightness(1.3); }
.value-unit {
  font-family: var(--font-mono, monospace);
  font-size: 14px;
  font-weight: 600;
  color: rgba(255,255,255,0.45);
  /* baseline alignment is default in flex align-items: baseline */
}
.status-badge {
  display: inline-flex;
  align-items: center;
  align-self: center;
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
  font-size: 0.7rem;
  color: #A0AAB2;
  letter-spacing: 0.06em;
}
.bat-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-top: 1px solid rgba(255,255,255,0.06);
  padding-top: 8px;
}
.bat-meta-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.bat-meta-key {
  font-family: var(--font-mono, monospace);
  font-size: 0.8rem;
  color: #38bdf8;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.bat-meta-val {
  font-family: var(--font-mono, monospace);
  font-size: 1.0rem;
  font-weight: 700;
}
.bat-warning-note {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
.bat-warning-note__line {
  font-family: var(--font-mono, monospace);
  font-size: 0.52rem;
  letter-spacing: 0.04em;
  line-height: 1.4;
}
.bat-warning-note__line--amber {
  color: #FFAA00;
  text-shadow: 0 0 6px rgba(255,170,0,0.5);
}
.bat-warning-note__line--red {
  color: #EF4444;
  text-shadow: 0 0 6px rgba(239,68,68,0.5);
  font-weight: 700;
}
.bat-warning-note__line--dim {
  color: rgba(255,255,255,0.4);
}

.bat-voltage-warn {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 6px;
  padding: 5px 8px;
  border: 1px solid rgba(239,68,68,0.35);
  background: rgba(239,68,68,0.08);
  border-radius: 4px;
  font-family: var(--font-mono, monospace);
  font-size: 0.58rem;
  color: #EF4444;
  letter-spacing: 0.04em;
  animation: warn-blink 1.5s ease infinite;
}
@keyframes warn-blink {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.5; }
}
</style>
