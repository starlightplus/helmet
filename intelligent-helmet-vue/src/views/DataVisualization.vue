<template>
  <div class="data-viz">
    <!-- 顶部标题栏 -->
    <div class="viz-header">
      <div class="viz-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2">
          <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
        </svg>
        智能头盔 · 数据可视化大屏
      </div>
      <div class="viz-controls">
        <!-- 粒度切换 -->
        <div class="range-switch">
          <button
            :class="['range-btn', timeRange === 'minute' && 'active']"
            @click="switchRange('minute')"
          >分钟级</button>
          <button
            :class="['range-btn', timeRange === 'hour' && 'active']"
            @click="switchRange('hour')"
          >小时级</button>
          <button
            :class="['range-btn', timeRange === 'day' && 'active']"
            @click="switchRange('day')"
          >天级别</button>
        </div>
        <div class="viz-time">{{ currentTime }}</div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="viz-body-full">
      <div class="viz-chart-full">
        <AtmosphericTrendChart :chart-data="chartData" :time-range="timeRange" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'
import AtmosphericTrendChart from '@/components/AtmosphericTrendChart.vue'
import request from '@/utils/request'

const ws = useWebSocket()
const currentTime = ref('')
let timeInterval = null

const chartData = ref([])
const timeRange = ref('minute') // 'minute' | 'day'

function updateTime() {
  const now = new Date()
  currentTime.value = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`
}

// 加载分钟级历史（最近20条）
async function loadMinuteHistory() {
  try {
    const res = await request.get('/api/sensor/history', { params: { limit: 20 } })
    const history = res.data
    if (history && history.length > 0) {
      chartData.value = history.reverse().map(d => {
        const t = new Date(d.receiveTime.replace(' ', 'T'))
        return {
          time: `${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}:${String(t.getSeconds()).padStart(2,'0')}`,
          temp: d.temperature ?? 0,
          hum: d.humidity ?? 0
        }
      })
    } else {
      chartData.value = []
    }
  } catch {
    chartData.value = []
  }
}

// 加载小时级历史（最近24小时每小时均值）
async function loadHourlyHistory() {
  try {
    const res = await request.get('/api/sensor/history/hourly', { params: { hours: 24 } })
    const history = res.data
    if (history && history.length > 0) {
      chartData.value = history.map(d => ({
        time: d.label,                           // "HH:00"
        temp: parseFloat(d.temp.toFixed(1)),
        hum: parseFloat(d.hum.toFixed(1))
      }))
    } else {
      chartData.value = []
    }
  } catch {
    chartData.value = []
  }
}

// 加载天级别历史（最近30天每天均值）
async function loadDailyHistory() {
  try {
    const res = await request.get('/api/sensor/history/daily', { params: { days: 30 } })
    const history = res.data
    if (history && history.length > 0) {
      chartData.value = history.map(d => ({
        time: d.day,                             // "2025-03-15"
        temp: parseFloat(d.temp.toFixed(1)),
        hum: parseFloat(d.hum.toFixed(1))
      }))
    } else {
      chartData.value = []
    }
  } catch {
    chartData.value = []
  }
}

async function switchRange(range) {
  timeRange.value = range
  chartData.value = []
  if (range === 'minute') {
    await loadMinuteHistory()
    // 切回分钟级时恢复 WebSocket 实时更新
    ws.setOnSensorData(handleSensorData)
  } else {
    // 小时级和天级别不需要实时更新，关掉回调
    ws.setOnSensorData(null)
    if (range === 'hour') {
      await loadHourlyHistory()
    } else {
      await loadDailyHistory()
    }
  }
}

// 实时数据处理（仅分钟级模式下生效）
function handleSensorData(data) {
  if (!data || !data.deviceId) return
  let timeLabel
  if (data.receiveTime) {
    const t = new Date(data.receiveTime.replace(' ', 'T'))
    timeLabel = `${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}:${String(t.getSeconds()).padStart(2,'0')}`
  } else {
    const now = new Date()
    timeLabel = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`
  }
  chartData.value = [
    ...chartData.value.slice(-19),
    {
      time: timeLabel,
      temp: data.temperature !== undefined ? Number(data.temperature) : 0,
      hum: data.humidity !== undefined ? Number(data.humidity) : 0
    }
  ]
}

onMounted(async () => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  await loadMinuteHistory()
  ws.setOnSensorData(handleSensorData)
  ws.connect('ws://localhost:8082/ws/sensor-data')
})

onUnmounted(() => {
  clearInterval(timeInterval)
  ws.disconnect()
})
</script>

<style scoped>
.data-viz {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.viz-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 2px solid rgba(0, 217, 255, 0.3);
  flex-shrink: 0;
}

.viz-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 700;
  color: #00D9FF;
  letter-spacing: 1px;
}

.viz-controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.range-switch {
  display: flex;
  border: 1px solid rgba(0, 217, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.range-btn {
  padding: 6px 16px;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.05em;
  color: rgba(0, 217, 255, 0.5);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.range-btn + .range-btn {
  border-left: 1px solid rgba(0, 217, 255, 0.2);
}

.range-btn:hover {
  color: #00D9FF;
  background: rgba(0, 217, 255, 0.08);
}

.range-btn.active {
  color: #0a0e1a;
  background: #00D9FF;
}

.viz-time {
  font-size: 16px;
  font-weight: 600;
  color: #a0c4d8;
  font-family: 'Courier New', monospace;
}

.viz-body-full {
  flex: 1;
  display: flex;
  padding: 24px;
  overflow: hidden;
  min-height: 0;
}

.viz-chart-full {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
