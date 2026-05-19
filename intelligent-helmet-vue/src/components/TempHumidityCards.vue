<template>
  <div class="sensor-cards">
    <!-- Temperature Card -->
    <div class="sensor-card sensor-card--temp">
      <div class="card-accent card-accent--temp"></div>

      <!-- Top row: label + icon -->
      <div class="card-header">
        <div class="card-label-group">
          <span class="card-tag">SENSOR_NODE_01</span>
          <span class="card-title">环境温度</span>
        </div>
        <div class="card-icon card-icon--temp">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
          </svg>
        </div>
      </div>

      <!-- Gauge ring + value -->
      <div class="card-gauge-row">
        <div class="gauge-ring-wrap">
          <svg class="gauge-svg" viewBox="0 0 100 100">
            <!-- Track -->
            <circle class="gauge-track" cx="50" cy="50" r="38"
              fill="none" stroke="rgba(0,242,255,0.08)" stroke-width="6"
              stroke-dasharray="200 40" stroke-dashoffset="-10"
              stroke-linecap="round" transform="rotate(126 50 50)" />
            <!-- Fill -->
            <circle class="gauge-fill gauge-fill--temp" cx="50" cy="50" r="38"
              fill="none" stroke="#00f2ff" stroke-width="6"
              stroke-dasharray="200 40" stroke-linecap="round"
              transform="rotate(126 50 50)"
              :stroke-dashoffset="tempGaugeOffset" />
            <!-- Center dot -->
            <circle cx="50" cy="50" r="3" fill="#00f2ff" opacity="0.6" />
          </svg>
          <div class="gauge-value-wrap">
            <span class="gauge-value gauge-value--temp">{{ temperature != null ? temperature.toFixed(1) : '--' }}</span>
            <span class="gauge-unit">°C</span>
          </div>
        </div>

        <!-- Side stats -->
        <div class="card-stats">
          <div class="stat-row">
            <span class="stat-label">状态</span>
            <span class="stat-value" :style="{ color: tempStatusColor }">{{ tempStatus }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">范围</span>
            <span class="stat-value">-10 ~ 50°C</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">精度</span>
            <span class="stat-value">±0.1°C</span>
          </div>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="card-bar-wrap">
        <div class="card-bar-track">
          <div class="card-bar-fill card-bar-fill--temp" :style="{ width: tempPercent + '%' }"></div>
        </div>
        <div class="card-bar-labels">
          <span>-10°C</span>
          <span>50°C</span>
        </div>
      </div>
    </div>

    <!-- Humidity Card -->
    <div class="sensor-card sensor-card--hum">
      <div class="card-accent card-accent--hum"></div>

      <!-- Top row: label + icon -->
      <div class="card-header">
        <div class="card-label-group">
          <span class="card-tag">SENSOR_NODE_02</span>
          <span class="card-title">相对湿度</span>
        </div>
        <div class="card-icon card-icon--hum">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
          </svg>
        </div>
      </div>

      <!-- Gauge ring + value -->
      <div class="card-gauge-row">
        <div class="gauge-ring-wrap">
          <svg class="gauge-svg" viewBox="0 0 100 100">
            <circle class="gauge-track" cx="50" cy="50" r="38"
              fill="none" stroke="rgba(255,0,85,0.08)" stroke-width="6"
              stroke-dasharray="200 40" stroke-dashoffset="-10"
              stroke-linecap="round" transform="rotate(126 50 50)" />
            <circle class="gauge-fill gauge-fill--hum" cx="50" cy="50" r="38"
              fill="none" stroke="#ff0055" stroke-width="6"
              stroke-dasharray="200 40" stroke-linecap="round"
              transform="rotate(126 50 50)"
              :stroke-dashoffset="humGaugeOffset" />
            <circle cx="50" cy="50" r="3" fill="#ff0055" opacity="0.6" />
          </svg>
          <div class="gauge-value-wrap">
            <span class="gauge-value gauge-value--hum">{{ humidity != null ? humidity.toFixed(1) : '--' }}</span>
            <span class="gauge-unit">%</span>
          </div>
        </div>

        <!-- Side stats -->
        <div class="card-stats">
          <div class="stat-row">
            <span class="stat-label">状态</span>
            <span class="stat-value" :style="{ color: humStatusColor }">{{ humStatus }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">范围</span>
            <span class="stat-value">0 ~ 100%</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">精度</span>
            <span class="stat-value">±0.5%</span>
          </div>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="card-bar-wrap">
        <div class="card-bar-track">
          <div class="card-bar-fill card-bar-fill--hum" :style="{ width: humPercent + '%' }"></div>
        </div>
        <div class="card-bar-labels">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  temperature: { type: Number, default: null },
  humidity: { type: Number, default: null }
})

// Temperature: -10 to 50°C → 0-100%
const tempPercent = computed(() => {
  if (props.temperature == null) return 0
  return Math.min(Math.max(((props.temperature + 10) / 60) * 100, 0), 100)
})

// Humidity: 0-100%
const humPercent = computed(() => {
  if (props.humidity == null) return 0
  return Math.min(Math.max(props.humidity, 0), 100)
})

// Gauge arc: 200 units total arc, offset shrinks as value increases
const tempGaugeOffset = computed(() => 200 - (tempPercent.value / 100) * 200)
const humGaugeOffset = computed(() => 200 - (humPercent.value / 100) * 200)

const tempStatus = computed(() => {
  if (props.temperature == null) return '等待数据'
  if (props.temperature < 0) return '极冷'
  if (props.temperature < 10) return '寒冷'
  if (props.temperature < 20) return '凉爽'
  if (props.temperature < 26) return '舒适'
  if (props.temperature < 35) return '偏热'
  return '高温'
})

const tempStatusColor = computed(() => {
  if (props.temperature == null) return 'rgba(255,255,255,0.3)'
  if (props.temperature < 10) return '#00f2ff'
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
  if (props.humidity < 40) return '#00f2ff'
  if (props.humidity < 70) return '#00ff88'
  if (props.humidity < 85) return '#ff8800'
  return '#ff0055'
})
</script>

<style scoped>
.sensor-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  width: 100%;
}

.sensor-card {
  position: relative;
  background: rgba(5, 10, 20, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  padding: 20px;
  overflow: hidden;
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sensor-card--temp {
  box-shadow: 0 0 30px rgba(0, 242, 255, 0.06), inset 0 1px 0 rgba(0, 242, 255, 0.08);
}

.sensor-card--hum {
  box-shadow: 0 0 30px rgba(255, 0, 85, 0.06), inset 0 1px 0 rgba(255, 0, 85, 0.08);
}

/* Left accent bar */
.card-accent {
  position: absolute;
  top: 16px;
  left: 0;
  width: 3px;
  height: calc(100% - 32px);
  border-radius: 0 2px 2px 0;
}
.card-accent--temp { background: linear-gradient(180deg, #00f2ff, rgba(0,242,255,0.1)); }
.card-accent--hum  { background: linear-gradient(180deg, #ff0055, rgba(255,0,85,0.1)); }

/* Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-label-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-tag {
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 9px;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.25);
  text-transform: uppercase;
}

.card-title {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.75);
  letter-spacing: 0.05em;
}

.card-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-icon--temp {
  background: rgba(0, 242, 255, 0.1);
  color: #00f2ff;
  box-shadow: 0 0 12px rgba(0, 242, 255, 0.2);
}
.card-icon--hum {
  background: rgba(255, 0, 85, 0.1);
  color: #ff0055;
  box-shadow: 0 0 12px rgba(255, 0, 85, 0.2);
}

/* Gauge row */
.card-gauge-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.gauge-ring-wrap {
  position: relative;
  width: 90px;
  height: 90px;
  flex-shrink: 0;
}

.gauge-svg {
  width: 100%;
  height: 100%;
}

.gauge-fill {
  transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.gauge-fill--temp {
  filter: drop-shadow(0 0 4px rgba(0, 242, 255, 0.7));
}

.gauge-fill--hum {
  filter: drop-shadow(0 0 4px rgba(255, 0, 85, 0.7));
}

.gauge-value-wrap {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.gauge-value {
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.03em;
}
.gauge-value--temp { color: #00f2ff; text-shadow: 0 0 10px rgba(0, 242, 255, 0.6); }
.gauge-value--hum  { color: #ff0055; text-shadow: 0 0 10px rgba(255, 0, 85, 0.6); }

.gauge-unit {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
  margin-top: 2px;
}

/* Side stats */
.card-stats {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.25);
  font-family: monospace;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: rgba(255, 255, 255, 0.6);
  transition: color 0.4s;
}

/* Progress bar */
.card-bar-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-bar-track {
  height: 3px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
  overflow: hidden;
}

.card-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-bar-fill--temp {
  background: linear-gradient(90deg, rgba(0,242,255,0.4), #00f2ff);
  box-shadow: 0 0 6px rgba(0, 242, 255, 0.5);
}

.card-bar-fill--hum {
  background: linear-gradient(90deg, rgba(255,0,85,0.4), #ff0055);
  box-shadow: 0 0 6px rgba(255, 0, 85, 0.5);
}

.card-bar-labels {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  font-family: monospace;
  color: rgba(255, 255, 255, 0.2);
}
</style>
