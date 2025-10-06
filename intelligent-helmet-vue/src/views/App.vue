<template>
  <ParticlesBackground />
  <div class="container">
    <Header title="灵盔佑驰终端" />
    <StatusBar :connection-status="wsStatus" :device-count="deviceCount" :last-update-time="lastUpdateTime" />
    <Controls
      @toggle-auto-refresh="handleToggleAutoRefresh"
      @clear-all-data="handleClearAllData"
    />
    <BaiduMap ref="baiduMap" class="map-section" />
    <SensorDashboard ref="sensorDashboard" @update-map-location="handleUpdateMapLocation" @process-device-events="handleProcessDeviceEvents" class="dashboard-section" />
    <EventPanel ref="eventPanel" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Header from '@/components/Header.vue'
import ParticlesBackground from '@/components/ParticlesBackground.vue'
import StatusBar from '@/components/StatusBar.vue'
import Controls from '@/components/Controls.vue'
import SensorDashboard from '@/components/SensorDashboard.vue'
import BaiduMap from '@/components/BaiduMap.vue'
import EventPanel from '@/components/EventPanel.vue'
import { useWebSocket } from '@/composables/useWebSocket.js'

const sensorDashboard = ref(null)
const baiduMap = ref(null)
const eventPanel = ref(null)

const {
  isConnected, connectionStatus, deviceCount: wsDeviceCount, lastUpdateTime, connect, disconnect, setOnSensorData
} = useWebSocket()

const wsStatus = connectionStatus
const deviceSet = new Set()
const deviceCount = ref(0)
const lastUpdate = ref(null)
let autoTimer = null

function handleSensorDataFromWS(payload) {
  // payload is sensor object
  // 1) update sensor dashboard
  if (sensorDashboard.value && sensorDashboard.value.updateSensorData) {
    sensorDashboard.value.updateSensorData([payload])
  }
  // 2) update map
  if (baiduMap.value && baiduMap.value.updateMapLocation) {
    baiduMap.value.updateMapLocation(payload)
  }
  // 3) events
  if (eventPanel.value && eventPanel.value.processDeviceEvents) {
    eventPanel.value.processDeviceEvents(payload)
  }
  // update deviceSet & lastUpdate
  if (payload.deviceId) {
    deviceSet.add(payload.deviceId)
    deviceCount.value = deviceSet.size
  }
  lastUpdate.value = new Date()
}

setOnSensorData(handleSensorDataFromWS)

function handleUpdateMapLocation(data) {
  if (baiduMap.value && baiduMap.value.updateMapLocation) baiduMap.value.updateMapLocation(data)
}

function handleProcessDeviceEvents(data) {
  if (eventPanel.value && eventPanel.value.processDeviceEvents) eventPanel.value.processDeviceEvents(data)
}

function handleRefreshData() {
  if (sensorDashboard.value && sensorDashboard.value.fetchLatestSensorData) sensorDashboard.value.fetchLatestSensorData()
}

function handleToggleAutoRefresh(isEnabled) {
  if (autoTimer) { clearInterval(autoTimer); autoTimer = null }
  if (isEnabled) {
    autoTimer = setInterval(() => {
      handleRefreshData()
    }, 3000)
  }
}

function handleClearAllData() {
  if (eventPanel.value && eventPanel.value.clearAllEvents) eventPanel.value.clearAllEvents()
  if (baiduMap.value && baiduMap.value.clearAllTracks) baiduMap.value.clearAllTracks()
  if (sensorDashboard.value && sensorDashboard.value.updateSensorData) sensorDashboard.value.updateSensorData([])
  deviceSet.clear(); deviceCount.value = 0; lastUpdate.value = new Date()
}

onMounted(()=>{
  connect('ws://localhost:8081/ws/sensor-data')
})

onUnmounted(()=>{
  disconnect()
  if (autoTimer) clearInterval(autoTimer)
})
</script>

<style scoped>
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 0;
  width: 100%; /* 确保容器宽度正确 */
  box-sizing: border-box; /* 包含padding和border在宽度内 */
}

.map-section {
  margin-bottom: 30px;
}

.dashboard-section {
  margin-top: 30px;
}
</style>

<style>
:global(body) {
  font-family: 'Segoe UI', 'Roboto', Arial;
  background: transparent;
  color: #e0e0e0;
  margin: 0;
  padding: 20px;
  overflow: hidden;
}
</style>