<template>
  <div id="dashboard" class="dashboard">
    <div v-if="sensorDataList.length === 0" class="dashboard__empty">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8892A0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 3h-8l-2 4h12z"/></svg>
      <span>暂无传感器数据</span>
    </div>
    <SensorCard
      v-for="(data, index) in sensorDataList"
      :key="data.deviceId || index"
      :data="data"
      :delay="300 + (index * 100)"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SensorCard from './SensorCard.vue'

const sensorDataList = ref([])

const emit = defineEmits(['update-map-location', 'process-device-events'])

async function fetchLatestSensorData() {
  try {
    const res = await fetch('/api/sensor/latest')
    if (res.ok) {
      const data = await res.json()
      // 假设 data 是数组
      sensorDataList.value = Array.isArray(data) ? data : []
      // 通知父组件更新地图/事件
      sensorDataList.value.forEach(item => {
        emit('update-map-location', item)
        emit('process-device-events', item)
      })
    } else {
      console.error('获取传感器数据失败', res.status)
    }
  } catch (e) {
    console.error('fetchLatestSensorData error', e)
  }
}

function updateSensorData(newDataList) {
  // newDataList: array of sensor objects
  if (!Array.isArray(newDataList)) return

  // 如果传入空数组，则清空所有数据
  if (newDataList.length === 0) {
    sensorDataList.value = []
    return
  }

  newDataList.forEach(newData => {
    const idx = sensorDataList.value.findIndex(s => s.deviceId === newData.deviceId)
    if (idx >= 0) {
      sensorDataList.value.splice(idx, 1, newData)
    } else {
      sensorDataList.value.push(newData)
    }
    emit('update-map-location', newData)
    emit('process-device-events', newData)
  })
}

defineExpose({ fetchLatestSensorData, updateSensorData })

// onMounted: parent will call fetchLatestSensorData, so we keep minimal
</script>

<style scoped>
.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 20px;
  padding: 0;
}

.dashboard__empty {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  padding: 40px;
  color: #8892A0;
  font-size: 1rem;
  background: #1a2332;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
