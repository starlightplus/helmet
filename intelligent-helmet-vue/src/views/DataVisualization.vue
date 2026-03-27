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

    <!-- 主内容区域 -->
    <div class="viz-body">
      <!-- 左侧列 -->
      <div class="viz-column viz-column--left">
        <div class="viz-chart-card">
          <div class="chart-card-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2">
              <path d="M3 3v18h18"/>
            </svg>
            温湿度趋势（最近30分钟）
          </div>
          <div ref="tempHumidChartRef" class="chart-container"></div>
        </div>

        <div class="viz-chart-card">
          <div class="chart-card-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2">
              <path d="M3 3v18h18"/>
            </svg>
            本周卡路里消耗
          </div>
          <div ref="caloriesChartRef" class="chart-container"></div>
        </div>
      </div>

      <!-- 中间列 -->
      <div class="viz-column viz-column--center">
        <div class="viz-chart-card">
          <div class="chart-card-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
            </svg>
            风险等级分布
          </div>
          <div ref="riskPieChartRef" class="chart-container"></div>
        </div>

        <div class="viz-chart-card">
          <div class="chart-card-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
            </svg>
            每周骑行统计
          </div>
          <div ref="weeklyChartRef" class="chart-container"></div>
        </div>
      </div>

      <!-- 右侧列 -->
      <div class="viz-column viz-column--right">
        <div class="viz-chart-card">
          <div class="chart-card-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2">
              <path d="M12 2v20M2 12h20"/>
            </svg>
            实时事件流
          </div>
          <div class="event-stream">
            <div v-for="(event, idx) in recentEvents" :key="idx" class="event-item" :class="`event-item--${event.type}`">
              <div class="event-time">{{ event.time }}</div>
              <div class="event-content">
                <span class="event-icon">{{ event.icon }}</span>
                <span class="event-text">{{ event.text }}</span>
              </div>
            </div>
            <div v-if="recentEvents.length === 0" class="event-empty">暂无事件</div>
          </div>
        </div>

        <div class="viz-chart-card">
          <div class="chart-card-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            </svg>
            风险热力分布
          </div>
          <div ref="heatmapChartRef" class="chart-container"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import * as echarts from 'echarts'
import { useWebSocket } from '@/composables/useWebSocket'
import { useRideHistoryStore } from '@/stores/rideHistory'

// WebSocket
const ws = useWebSocket()

// 骑行历史 Store
const rideHistoryStore = useRideHistoryStore()

// 时间显示
const currentTime = ref('')
let timeInterval = null

// 风险事件计数（用于事件流）
const riskEventCount = ref(0)

// 实时事件流
const recentEvents = ref([])

// 历史数据（用于图表）
const tempHistory = ref([])
const humidHistory = ref([])
const caloriesHistory = ref([]) // 本周每天的卡路里
const timeLabels = ref([])
const MAX_DATA_POINTS = 30

// 风险等级统计
const riskStats = ref({ low: 0, mid: 0, high: 0 })

// 每周统计（7天）
const weeklyStats = ref(Array(7).fill(0))
const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

// 本周卡路里累计
const weeklyCalories = ref(Array(7).fill(0))

// 计算属性：骑行次数和总里程
const rideCount = computed(() => rideHistoryStore.rides?.length || 0)
const totalDistance = computed(() => {
  return (rideHistoryStore.rides || []).reduce((sum, ride) => sum + (ride.distance || 0), 0)
})

// Chart 实例
let tempHumidChart = null
let caloriesChart = null
let riskPieChart = null
let weeklyChart = null
let heatmapChart = null

// Chart refs
const tempHumidChartRef = ref(null)
const caloriesChartRef = ref(null)
const riskPieChartRef = ref(null)
const weeklyChartRef = ref(null)
const heatmapChartRef = ref(null)

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

// 初始化温湿度图表
function initTempHumidChart() {
  if (!tempHumidChartRef.value) return
  tempHumidChart = echarts.init(tempHumidChartRef.value)
  
  const option = {
    backgroundColor: 'transparent',
    grid: { left: '10%', right: '10%', top: '15%', bottom: '15%' },
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#00D9FF' },
    legend: {
      data: ['温度', '湿度'],
      textStyle: { color: '#a0c4d8' },
      top: '5%'
    },
    xAxis: {
      type: 'category',
      data: timeLabels.value,
      axisLine: { lineStyle: { color: '#2a4a6a' } },
      axisLabel: { color: '#6b8a9f' }
    },
    yAxis: [
      {
        type: 'value',
        name: '温度(°C)',
        nameTextStyle: { color: '#FF6B6B' },
        axisLine: { lineStyle: { color: '#2a4a6a' } },
        axisLabel: { color: '#6b8a9f' },
        splitLine: { lineStyle: { color: '#1a2a3a' } }
      },
      {
        type: 'value',
        name: '湿度(%)',
        nameTextStyle: { color: '#00D9FF' },
        axisLine: { lineStyle: { color: '#2a4a6a' } },
        axisLabel: { color: '#6b8a9f' },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '温度',
        type: 'line',
        data: tempHistory.value,
        smooth: true,
        yAxisIndex: 0,
        itemStyle: { color: '#FF6B6B' },
        areaStyle: { color: 'rgba(255,107,107,0.1)' }
      },
      {
        name: '湿度',
        type: 'line',
        data: humidHistory.value,
        smooth: true,
        yAxisIndex: 1,
        itemStyle: { color: '#00D9FF' },
        areaStyle: { color: 'rgba(0,217,255,0.1)' }
      }
    ]
  }
  
  tempHumidChart.setOption(option)
}

// 初始化卡路里图表
function initCaloriesChart() {
  if (!caloriesChartRef.value) return
  caloriesChart = echarts.init(caloriesChartRef.value)

  const option = {
    backgroundColor: 'transparent',
    grid: { left: '10%', right: '10%', top: '15%', bottom: '15%' },
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#00D9FF' },
    legend: {
      data: ['卡路里'],
      textStyle: { color: '#a0c4d8' },
      top: '5%'
    },
    xAxis: {
      type: 'category',
      data: weekDays,
      axisLine: { lineStyle: { color: '#2a4a6a' } },
      axisLabel: { color: '#6b8a9f' }
    },
    yAxis: {
      type: 'value',
      name: '卡路里(kcal)',
      nameTextStyle: { color: '#FF6B6B' },
      axisLine: { lineStyle: { color: '#2a4a6a' } },
      axisLabel: { color: '#6b8a9f' },
      splitLine: { lineStyle: { color: '#1a2a3a' } }
    },
    series: [
      {
        name: '卡路里',
        type: 'bar',
        data: weeklyCalories.value,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#FF6B6B' },
            { offset: 1, color: '#FF4757' }
          ])
        },
        barWidth: '50%',
        label: {
          show: true,
          position: 'top',
          color: '#FF6B6B',
          formatter: '{c}'
        }
      }
    ]
  }

  caloriesChart.setOption(option)
}

// 初始化风险饼图
function initRiskPieChart() {
  if (!riskPieChartRef.value) return
  riskPieChart = echarts.init(riskPieChartRef.value)
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#00D9FF' },
    legend: {
      orient: 'vertical',
      right: '10%',
      top: 'center',
      textStyle: { color: '#a0c4d8' }
    },
    series: [
      {
        name: '风险等级',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#0a0e1a',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c}次',
          color: '#a0c4d8'
        },
        emphasis: {
          label: { show: true, fontSize: 16, fontWeight: 'bold' }
        },
        data: [
          { value: riskStats.value.low, name: '低风险', itemStyle: { color: '#00D9FF' } },
          { value: riskStats.value.mid, name: '中风险', itemStyle: { color: '#FFD93D' } },
          { value: riskStats.value.high, name: '高风险', itemStyle: { color: '#FF4757' } }
        ]
      }
    ]
  }
  
  riskPieChart.setOption(option)
}

// 初始化每周统计柱状图
function initWeeklyChart() {
  if (!weeklyChartRef.value) return
  weeklyChart = echarts.init(weeklyChartRef.value)

  const option = {
    backgroundColor: 'transparent',
    grid: { left: '10%', right: '10%', top: '15%', bottom: '15%' },
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#00D9FF' },
    xAxis: {
      type: 'category',
      data: weekDays,
      axisLine: { lineStyle: { color: '#2a4a6a' } },
      axisLabel: { color: '#6b8a9f' }
    },
    yAxis: {
      type: 'value',
      name: '次数',
      nameTextStyle: { color: '#a0c4d8' },
      axisLine: { lineStyle: { color: '#2a4a6a' } },
      axisLabel: { color: '#6b8a9f' },
      splitLine: { lineStyle: { color: '#1a2a3a' } }
    },
    series: [
      {
        name: '骑行次数',
        type: 'bar',
        data: weeklyStats.value,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#00D9FF' },
            { offset: 1, color: '#0066AA' }
          ])
        },
        barWidth: '60%'
      }
    ]
  }

  weeklyChart.setOption(option)
}

// 初始化热力图
function initHeatmapChart() {
  if (!heatmapChartRef.value) return
  heatmapChart = echarts.init(heatmapChartRef.value)
  
  // 模拟热力数据
  const hours = ['0', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20', '22']
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const data = []
  
  for (let i = 0; i < days.length; i++) {
    for (let j = 0; j < hours.length; j++) {
      data.push([j, i, Math.floor(Math.random() * 10)])
    }
  }
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      position: 'top',
      backgroundColor: 'rgba(0,0,0,0.8)',
      borderColor: '#00D9FF'
    },
    grid: { left: '15%', right: '10%', top: '10%', bottom: '15%' },
    xAxis: {
      type: 'category',
      data: hours,
      splitArea: { show: true },
      axisLine: { lineStyle: { color: '#2a4a6a' } },
      axisLabel: { color: '#6b8a9f' }
    },
    yAxis: {
      type: 'category',
      data: days,
      splitArea: { show: true },
      axisLine: { lineStyle: { color: '#2a4a6a' } },
      axisLabel: { color: '#6b8a9f' }
    },
    visualMap: {
      min: 0,
      max: 10,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      textStyle: { color: '#a0c4d8' },
      inRange: {
        color: ['#0a0e1a', '#00D9FF', '#FFD93D', '#FF4757']
      }
    },
    series: [
      {
        name: '风险值',
        type: 'heatmap',
        data: data,
        label: { show: false },
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' }
        }
      }
    ]
  }
  
  heatmapChart.setOption(option)
}

// 处理传感器数据
function handleSensorData(data) {
  if (!data || !data.deviceId) return

  console.log('[DataViz] 收到传感器数据:', data)

  // 更新时间标签
  const now = new Date()
  const timeLabel = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

  timeLabels.value.push(timeLabel)
  if (timeLabels.value.length > MAX_DATA_POINTS) {
    timeLabels.value.shift()
  }

  // 更新温湿度数据
  if (data.temperature !== undefined) {
    tempHistory.value.push(Number(data.temperature))
    if (tempHistory.value.length > MAX_DATA_POINTS) {
      tempHistory.value.shift()
    }
  }

  if (data.humidity !== undefined) {
    humidHistory.value.push(Number(data.humidity))
    if (humidHistory.value.length > MAX_DATA_POINTS) {
      humidHistory.value.shift()
    }
  }

  // 更新图表
  updateCharts()

  // 计算风险等级
  const avm = Number(data.avm) || 0
  const gvm = Number(data.gvm) || 0
  let riskScore = 0
  riskScore += Math.min(avm / 2, 40)
  riskScore += Math.min(gvm / 1.5, 40)
  if (data.fallFlag) riskScore += 20
  riskScore = Math.round(Math.min(riskScore, 100))

  // 更新风险统计
  if (riskScore >= 70) {
    riskStats.value.high++
  } else if (riskScore >= 40) {
    riskStats.value.mid++
  } else {
    riskStats.value.low++
  }

  // 添加事件
  if (data.fallFlag) {
    riskEventCount.value++
    addEvent('danger', '⚠️', '检测到跌倒事件！')
  } else if (riskScore >= 70) {
    riskEventCount.value++
    addEvent('warning', '⚡', `高风险警告 (评分: ${riskScore})`)
  } else if (riskScore >= 40) {
    addEvent('info', 'ℹ️', `中风险提示 (评分: ${riskScore})`)
  } else {
    addEvent('success', '✓', '状态正常')
  }

  // 更新饼图
  if (riskPieChart) {
    riskPieChart.setOption({
      series: [{
        data: [
          { value: riskStats.value.low, name: '低风险', itemStyle: { color: '#00D9FF' } },
          { value: riskStats.value.mid, name: '中风险', itemStyle: { color: '#FFD93D' } },
          { value: riskStats.value.high, name: '高风险', itemStyle: { color: '#FF4757' } }
        ]
      }]
    })
  }
}

// 从骑行历史加载统计数据
function loadRideHistory() {
  const rides = rideHistoryStore.rides || []

  console.log('[DataViz] 加载骑行历史:', rides.length, '条记录')

  // 重置统计
  weeklyStats.value = Array(7).fill(0)
  weeklyCalories.value = Array(7).fill(0)

  // 获取本周的日期范围
  const now = new Date()
  const dayOfWeek = now.getDay() // 0=周日, 1=周一, ...
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // 计算到周一的偏移
  const monday = new Date(now)
  monday.setDate(now.getDate() + mondayOffset)
  monday.setHours(0, 0, 0, 0)

  // 统计本周数据
  rides.forEach(ride => {
    const rideDate = new Date(ride.startTime)

    // 判断是否在本周
    if (rideDate >= monday) {
      const dayIndex = rideDate.getDay()
      const weekIndex = dayIndex === 0 ? 6 : dayIndex - 1 // 转换为周一=0的索引

      // 统计每天的骑行次数
      weeklyStats.value[weekIndex]++

      // 统计每天的卡路里
      weeklyCalories.value[weekIndex] += ride.calories || 0
    }
  })

  console.log('[DataViz] 统计完成 - 骑行次数:', rideCount.value, '总里程:', totalDistance.value.toFixed(2))
  console.log('[DataViz] 每周统计:', weeklyStats.value)
  console.log('[DataViz] 每周卡路里:', weeklyCalories.value)

  // 更新图表
  if (weeklyChart) {
    weeklyChart.setOption({
      series: [{ data: weeklyStats.value }]
    })
  }

  if (caloriesChart) {
    caloriesChart.setOption({
      series: [{ data: weeklyCalories.value }]
    })
  }
}

// 添加事件到事件流
function addEvent(type, icon, text) {
  const now = new Date()
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  
  recentEvents.value.unshift({ type, icon, text, time })
  
  // 只保留最近 20 条
  if (recentEvents.value.length > 20) {
    recentEvents.value.pop()
  }
}

// 更新图表
function updateCharts() {
  if (tempHumidChart) {
    tempHumidChart.setOption({
      xAxis: { data: timeLabels.value },
      series: [
        { data: tempHistory.value },
        { data: humidHistory.value }
      ]
    }, { notMerge: false, lazyUpdate: false })
  }
}

// 监听数据变化，自动更新图表
watch([tempHistory, humidHistory, timeLabels], () => {
  updateCharts()
}, { deep: true })

// 窗口大小调整
function handleResize() {
  tempHumidChart?.resize()
  caloriesChart?.resize()
  riskPieChart?.resize()
  weeklyChart?.resize()
  heatmapChart?.resize()
}

// 生命周期
onMounted(async () => {
  // 更新时间
  updateTime()
  timeInterval = setInterval(updateTime, 1000)

  // 等待 DOM 渲染完成
  await nextTick()

  // 初始化图表
  initTempHumidChart()
  initCaloriesChart()
  initRiskPieChart()
  initWeeklyChart()
  initHeatmapChart()

  // 加载骑行历史数据
  loadRideHistory()

  // 连接 WebSocket
  ws.setOnSensorData(handleSensorData)
  ws.connect('ws://localhost:8082/ws/sensor-data')

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)

  console.log('[DataViz] 页面初始化完成')
})

onUnmounted(() => {
  clearInterval(timeInterval)
  ws.disconnect()
  window.removeEventListener('resize', handleResize)

  // 销毁图表
  tempHumidChart?.dispose()
  caloriesChart?.dispose()
  riskPieChart?.dispose()
  weeklyChart?.dispose()
  heatmapChart?.dispose()
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

/* 主内容区域 */
.viz-body {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 16px 24px 24px 24px;
  overflow: hidden;
  min-height: 0;
}

.viz-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.viz-column--left,
.viz-column--right {
  flex: 1;
}

.viz-column--center {
  flex: 1;
}

/* 图表卡片 */
.viz-chart-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(26, 42, 58, 0.3);
  border: 1px solid rgba(0, 217, 255, 0.2);
  border-radius: 12px;
  overflow: hidden;
  min-height: 0;
}

.chart-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #a0c4d8;
  border-bottom: 1px solid rgba(0, 217, 255, 0.1);
  flex-shrink: 0;
}

.chart-container {
  flex: 1;
  min-height: 0;
}

/* 事件流 */
.event-stream {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.event-stream::-webkit-scrollbar {
  width: 6px;
}

.event-stream::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

.event-stream::-webkit-scrollbar-thumb {
  background: rgba(0, 217, 255, 0.3);
  border-radius: 3px;
}

.event-item {
  padding: 10px 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  border-left: 3px solid;
  background: rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.event-item--success {
  border-left-color: #00D9FF;
  background: rgba(0, 217, 255, 0.05);
}

.event-item--info {
  border-left-color: #FFD93D;
  background: rgba(255, 217, 61, 0.05);
}

.event-item--warning {
  border-left-color: #FFA500;
  background: rgba(255, 165, 0, 0.05);
}

.event-item--danger {
  border-left-color: #FF4757;
  background: rgba(255, 71, 87, 0.05);
}

.event-time {
  font-size: 11px;
  color: #6b8a9f;
  margin-bottom: 4px;
  font-family: 'Courier New', monospace;
}

.event-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #a0c4d8;
}

.event-icon {
  font-size: 16px;
}

.event-empty {
  text-align: center;
  padding: 40px 20px;
  color: #6b8a9f;
  font-size: 13px;
}
</style>
