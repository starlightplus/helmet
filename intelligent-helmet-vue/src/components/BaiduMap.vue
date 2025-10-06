<template>
  <div class="map-container" data-aos="zoom-in-up" data-aos-delay="400">
    <div class="map-header">
      <div class="map-title">设备位置地图</div>
      <div class="map-info">{{ trackInfo }}</div>
    </div>
    <div id="baiduMap" :style="{ height: mapHeight + 'px' }"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  apiKey: { type: String, default: '' },
  maxTrackPoints: { type: Number, default: 200 },
  mapHeight: { type: Number, default: 500 }
})

// state
let map = null
const trackInfo = ref('当前位置: 福建省福州市 | 轨迹点数: 0')

// Track structures per device
const deviceTracks = {} // deviceId => { points: [ {point, timestamp} ], polyline, shadow, marker }

function initMap() {
  if (typeof BMap === 'undefined') {
    // 如果BMap未加载，尝试重试（短轮询）
    setTimeout(initMap, 500)
    return
  }
  map = new BMap.Map('baiduMap')
  const fuzhou = new BMap.Point(119.296494, 26.074507)
  map.centerAndZoom(fuzhou, 13)
  map.enableScrollWheelZoom(true)
  map.addControl(new BMap.NavigationControl())
  map.addControl(new BMap.ScaleControl())
  map.addControl(new BMap.OverviewMapControl())
}

function safeCreatePoint(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') return null
  return new BMap.Point(lng, lat)
}

// add a new point for a device, update marker & polyline
function updateMapLocation(data) {
  if (!data || !map) return
  const deviceId = data.deviceId || 'unknown'
  const lat = Number(data.latitude)
  const lng = Number(data.longitude)
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) return
  const ts = data.receiveTime || new Date().toISOString()
  const newPoint = safeCreatePoint(lat, lng)
  if (!newPoint) return

  if (!deviceTracks[deviceId]) {
    deviceTracks[deviceId] = { points: [], polyline: null, shadow: null, marker: null }
  }
  const track = deviceTracks[deviceId]
  // push new point
  track.points.push({ point: newPoint, timestamp: ts })
  if (track.points.length > props.maxTrackPoints) track.points.shift()

  // update or create marker
  if (track.marker) {
    track.marker.setPosition(newPoint)
  } else {
    track.marker = new BMap.Marker(newPoint)
    map.addOverlay(track.marker)
  }

  // draw polyline: remove old overlays and redraw (for simplicity)
  if (track.shadow) { map.removeOverlay(track.shadow); track.shadow = null }
  if (track.polyline) { map.removeOverlay(track.polyline); track.polyline = null }

  const points = track.points.map(p => p.point)
  // shadow (thicker, faint)
  track.shadow = new BMap.Polyline(points, {
    strokeColor: '#000000',
    strokeWeight: 6,
    strokeOpacity: 0.15
  })
  track.polyline = new BMap.Polyline(points, {
    strokeColor: pickColorForDevice(deviceId),
    strokeWeight: 4,
    strokeOpacity: 0.9
  })
  map.addOverlay(track.shadow)
  map.addOverlay(track.polyline)

  // pan/center optionally to the latest point (do not change zoom)
  map.panTo(newPoint)

  updateTrackInfo()
}

function pickColorForDevice(deviceId) {
  // 改为青色系调色板
  const palette = [
    '#00f7ff', // 青色
    '#00ccff', // 亮蓝色
    '#00b3ff', // 天蓝色
    '#0099ff', // 浅蓝色
  ]
  let h = 0
  for (let i = 0; i < deviceId.length; i++) h += deviceId.charCodeAt(i)
  return palette[h % palette.length]
}

function updateTrackInfo() {
  const totalPoints = Object.values(deviceTracks).reduce((acc, t) => acc + (t.points.length || 0), 0)
  let last = '福建省福州市'
  const lastDevice = Object.keys(deviceTracks).find(k => deviceTracks[k].points.length > 0)
  if (lastDevice) {
    const lp = deviceTracks[lastDevice].points.slice(-1)[0]
    last = `设备 ${lastDevice} (${lp.point.lat.toFixed(4)}, ${lp.point.lng.toFixed(4)})`
  }
  trackInfo.value = `当前位置: ${last} | 轨迹点数: ${totalPoints}`
}

function clearTrackForDevice(deviceId) {
  const track = deviceTracks[deviceId]
  if (!track) return
  if (track.polyline) map.removeOverlay(track.polyline)
  if (track.shadow) map.removeOverlay(track.shadow)
  if (track.marker) map.removeOverlay(track.marker)
  delete deviceTracks[deviceId]
  updateTrackInfo()
}

function clearAllTracks() {
  Object.keys(deviceTracks).forEach(deviceId => clearTrackForDevice(deviceId))
}

defineExpose({ updateMapLocation, clearTrackForDevice, clearAllTracks })

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  try {
    clearAllTracks()
    if (map) map.clearOverlays()
    map = null
  } catch (e) { console.error(e) }
})
</script>

<style scoped>
/* 保留你的 map 样式 */
#baiduMap {
  width: 100%;
  border-radius: 20px;
  border: 1px solid rgba(0, 247, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.map-container {
  padding: 24px;
  background: rgba(10, 15, 44, 0.4);
  border-radius: 20px; /* 与SensorCard一致 */
  margin-bottom: 20px; /* 与SensorCard一致 */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); /* 与SensorCard一致 */
  border: 1px solid rgba(0, 247, 255, 0.3); /* 与SensorCard一致 */
  backdrop-filter: blur(10px); /* 与SensorCard一致 */
  transition: transform 0.3s ease, box-shadow 0.3s ease; /* 与SensorCard一致 */
}

.map-container:hover {
  transform: translateY(-5px); /* 与SensorCard一致 */
  box-shadow: 0 12px 40px rgba(0, 247, 255, 0.4); /* 与SensorCard一致 */
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 247, 255, 0.2); /* 与SensorCard.header一致 */
}

.map-title {
  color: #00f7ff; /* 青色字体 */
  font-size: 1.4rem;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(0, 247, 255, 0.5);
}

.map-info {
  font-size: 0.9em;
  color: rgba(224, 224, 224, 0.8);
  background: rgba(0, 247, 255, 0.12);
  padding: 6px 12px;
  border-radius: 12px;
}
</style>