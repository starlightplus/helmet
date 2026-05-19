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
      <div class="viz-time">{{ currentTime }}</div>
    </div>

    <!-- 主内容区域 - 只显示 Atmospheric Trend Analysis -->
    <div class="viz-body-full">
      <div class="viz-chart-full">
        <AtmosphericTrendChart :chart-data="chartData" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'
import AtmosphericTrendChart from '@/components/AtmosphericTrendChart.vue'

// WebSocket
const ws = useWebSocket()

// 时间显示
const currentTime = ref('')
let timeInterval = null

// 图表数据 - 固定 20 个点的滑动窗口
const chartData = ref([])
const MAX_DATA_POINTS = 20

// 更新时间
function updateTime() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  const second = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

// 处理传感器数据 - 实现滑动窗口
function handleSensorData(data) {
  if (!data || !data.deviceId) return

  console.log('[DataViz] 收到传感器数据:', data)

  // 创建新数据点
  const now = new Date()
  const timeLabel = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

  const newPoint = {
    time: timeLabel,
    temp: data.temperature !== undefined ? Number(data.temperature) : 0,
    hum: data.humidity !== undefined ? Number(data.humidity) : 0
  }

  // 关键：滑动窗口更新，触发 ECharts 内部平滑过渡
  chartData.value = [
    ...chartData.value.slice(-19),
    newPoint
  ]
}

// 生命周期
onMounted(() => {
  // 更新时间
  updateTime()
  timeInterval = setInterval(updateTime, 1000)

  // 初始化图表数据 - 创建 20 个初始点，避免空白
  chartData.value = Array.from({ length: 20 }, (_, i) => ({
    time: `${String(Math.floor(i / 6)).padStart(2, '0')}:${String((i % 6) * 10).padStart(2, '0')}`,
    temp: 22 + Math.random() * 3,
    hum: 40 + Math.random() * 10
  }))

  // 连接 WebSocket
  ws.setOnSensorData(handleSensorData)
  ws.connect('ws://localhost:8082/ws/sensor-data')

  console.log('[DataViz] 页面初始化完成')
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

/* 顶部标题栏 */
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

.viz-time {
  font-size: 16px;
  font-weight: 600;
  color: #a0c4d8;
  font-family: 'Courier New', monospace;
}

/* 主内容区域 - 全屏显示 */
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
