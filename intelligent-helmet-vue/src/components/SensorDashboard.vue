<template>
  <div id="dashboard" class="dashboard">
    <div v-if="sensorDataList.length === 0" class="no-data">暂无传感器数据</div>
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
    const res = await fetch('http://localhost:8081/api/sensor/latest')
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
/* 复用你已有的 dashboard 样式 */
.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  padding: 20px;
}

.no-data {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: rgba(224, 224, 224, 0.7);
  font-size: 1.2rem;
  background: rgba(10, 15, 44, 0.4);
  border-radius: 20px;
  border: 1px solid rgba(0, 247, 255, 0.3);
}
</style>