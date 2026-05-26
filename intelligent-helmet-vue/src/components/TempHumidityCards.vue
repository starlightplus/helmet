<template>
  <div class="sensor-cards">
    <!-- Temperature Card -->
    <div class="sensor-card sensor-card--temp">
      <div class="card-accent card-accent--temp"></div>
      <div class="card-cyber-corner"></div>

      <!-- Header -->
      <div class="card-header">
        <div class="card-label-group">
          <span class="card-tag">传感器1</span>
          <span class="card-title">环境温度</span>
        </div>
      </div>

      <!-- Body: animation left, value+status right -->
      <div class="card-body">
        <canvas ref="tempCanvasRef" class="lottie-canvas"></canvas>
        <div class="card-value-block">
          <div class="value-row">
            <span class="value-num value-num--temp">{{ temperature != null ? temperature.toFixed(1) : '--' }}</span>
            <span class="value-unit">°C</span>
          </div>
          <div class="status-badge" :style="{ color: tempStatusColor, borderColor: tempStatusColor + '40', background: tempStatusColor + '12' }">
            {{ tempStatus }}
          </div>
        </div>
      </div>
    </div>

    <!-- Humidity Card -->
    <div class="sensor-card sensor-card--hum">
      <div class="card-accent card-accent--hum"></div>
      <div class="card-cyber-corner card-cyber-corner--hum"></div>

      <!-- Header -->
      <div class="card-header">
        <div class="card-label-group">
          <span class="card-tag">传感器2</span>
          <span class="card-title">相对湿度</span>
        </div>
      </div>

      <!-- Body: animation left, value+status right -->
      <div class="card-body">
        <canvas ref="humCanvasRef" class="lottie-canvas"></canvas>
        <div class="card-value-block">
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
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { DotLottie } from '@lottiefiles/dotlottie-web'

const props = defineProps({
  temperature: { type: Number, default: null },
  humidity:    { type: Number, default: null }
})

const tempCanvasRef = ref(null)
const humCanvasRef  = ref(null)
let tempLottie = null
let humLottie  = null

onMounted(() => {
  if (tempCanvasRef.value) {
    tempLottie = new DotLottie({
      canvas: tempCanvasRef.value,
      src: '/animations/temp.lottie',
      loop: true,
      autoplay: true,
    })
  }
  if (humCanvasRef.value) {
    humLottie = new DotLottie({
      canvas: humCanvasRef.value,
      src: '/animations/humid.lottie',
      loop: true,
      autoplay: true,
    })
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
  background: rgba(10, 15, 26, 0.55);
  border: 1px solid #1e3a4a;
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
.sensor-card--temp {
  box-shadow: 0 0 24px -6px rgba(56, 189, 248, 0.08), inset 0 1px 0 rgba(56, 189, 248, 0.06);
}
.sensor-card--hum {
  box-shadow: 0 0 24px -6px rgba(255, 0, 85, 0.08), inset 0 1px 0 rgba(255, 0, 85, 0.06);
}

/* Cyber corner — removed (using border-radius now) */
.card-cyber-corner { display: none; }
.card-cyber-corner--hum { display: none; }

/* Left accent bar */
.card-accent {
  position: absolute;
  top: 14px; left: 0;
  width: 2px;
  height: calc(100% - 28px);
}
.card-accent--temp { background: linear-gradient(180deg, #38bdf8, rgba(56,189,248,0.05)); }
.card-accent--hum  { background: linear-gradient(180deg, #ff0055, rgba(255,0,85,0.05)); }

/* Header */
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
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 8px;
  letter-spacing: 0.15em;
  color: white;
  text-transform: uppercase;
}
.card-title {
  font-family: var(--font-mono, monospace);
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.75);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.card-icon {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  clip-path: polygon(4px 0%,100% 0%,100% calc(100% - 4px),calc(100% - 4px) 100%,0% 100%,0% 4px);
}
.card-icon--temp { background: rgba(56, 189, 248, 0.08); color: #38bdf8; }
.card-icon--hum  { background: rgba(255, 0, 85, 0.08);  color: #ff0055; }

/* Body: lottie left + value right */
.card-body {
  display: flex;
  align-items: center;
  gap: 14px;
}

.lottie-canvas {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

/* Value block */
.card-value-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.value-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
  line-height: 1;
}

.value-num {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.03em;
}
.value-num--temp { color: #38bdf8; text-shadow: 0 0 14px rgba(56, 189, 248, 0.55); }
.value-num--hum  { color: #ff0055; text-shadow: 0 0 14px rgba(255, 0, 85, 0.55); }

.value-unit {
  font-family: var(--font-mono, monospace);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.30);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  padding: 3px 10px;
  border: 1px solid;
  border-radius: 4px;
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  transition: color 0.4s, border-color 0.4s, background 0.4s;
}
</style>
