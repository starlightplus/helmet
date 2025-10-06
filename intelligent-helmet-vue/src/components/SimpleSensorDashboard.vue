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
  })
}

defineExpose({ updateSensorData })
</script>

<style scoped>
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