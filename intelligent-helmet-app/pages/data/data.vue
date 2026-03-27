<template>
  <view class="data-container">
    <view class="header">
      <text class="title">数据监控</text>
      <text class="subtitle">实时传感器数据流</text>
    </view>

    <!-- 数据列表 -->
    <scroll-view scroll-y class="data-list">
      <view v-for="(item, index) in dataHistory" :key="index" class="data-item">
        <view class="data-time">{{ item.time }}</view>
        <view class="data-content">
          <view class="data-row">
            <text class="data-label">温度:</text>
            <text class="data-value">{{ item.temperature }}°C</text>
          </view>
          <view class="data-row">
            <text class="data-label">湿度:</text>
            <text class="data-value">{{ item.humidity }}%</text>
          </view>
          <view class="data-row">
            <text class="data-label">位置:</text>
            <text class="data-value small">{{ item.gps }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 清空按钮 -->
    <view class="actions">
      <button class="clear-btn" @click="clearHistory">清空历史</button>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'

const WS_URL = 'ws://localhost:8082/ws/sensor-data'
const { isConnected, sensorData, connect } = useWebSocket(WS_URL)

const dataHistory = ref([])

const formatTime = () => {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
}

watch(sensorData, (data) => {
  if (!data) return

  dataHistory.value.unshift({
    time: formatTime(),
    temperature: data.temperature || 0,
    humidity: data.humidity || 0,
    gps: `${(data.longitude || 0).toFixed(4)}, ${(data.latitude || 0).toFixed(4)}`
  })

  // 只保留最近 50 条
  if (dataHistory.value.length > 50) {
    dataHistory.value.pop()
  }
})

const clearHistory = () => {
  uni.showModal({
    title: '确认',
    content: '确定要清空历史数据吗？',
    success: (res) => {
      if (res.confirm) {
        dataHistory.value = []
      }
    }
  })
}

onMounted(() => {
  connect()
})
</script>

<style scoped>
.data-container {
  min-height: 100vh;
  background-color: #0f0f1e;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 40rpx 30rpx;
  background: linear-gradient(135deg, #1a1a2e, #2a2a3e);
}

.title {
  color: #ffffff;
  font-size: 40rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 10rpx;
}

.subtitle {
  color: #a0a0a0;
  font-size: 24rpx;
  display: block;
}

.data-list {
  flex: 1;
  padding: 20rpx;
}

.data-item {
  background-color: #1a1a2e;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  border-left: 4rpx solid #00D9FF;
}

.data-time {
  color: #00D9FF;
  font-size: 24rpx;
  margin-bottom: 16rpx;
  font-family: monospace;
}

.data-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.data-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.data-label {
  color: #a0a0a0;
  font-size: 26rpx;
}

.data-value {
  color: #ffffff;
  font-size: 26rpx;
  font-weight: bold;
}

.data-value.small {
  font-size: 22rpx;
}

.actions {
  padding: 20rpx;
  background-color: #1a1a2e;
}

.clear-btn {
  width: 100%;
  background-color: #ff4444;
  color: #ffffff;
  border: none;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 28rpx;
}
</style>
