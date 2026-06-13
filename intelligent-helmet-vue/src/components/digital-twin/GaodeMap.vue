<template>
  <div class="map-card" data-aos="zoom-in-up" data-aos-delay="400">
    <div class="map-card__header">
      <div class="map-card__title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00C49A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span>设备位置地图</span>
      </div>
      <div class="map-card__info">{{ trackInfo }}</div>
    </div>
    <div id="amapContainer" class="map-card__map" :style="{ height: mapHeight + 'px' }"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  maxTrackPoints: { type: Number, default: 200 },
  mapHeight: { type: Number, default: 500 }
})

let map = null
const trackInfo = ref('当前位置: 福建省福州市 | 轨迹点数: 0')

const deviceTracks = {}

function initMap() {
  if (typeof AMap === 'undefined') {
    setTimeout(initMap, 500)
    return
  }

  map = new AMap.Map('amapContainer', {
    zoom: 13,
    center: [119.296494, 26.074507],
    // 使用标准样式（默认白色主题）
    viewMode: '2D',
    resizeEnable: true
  })

  // 高德地图 2.0 版本使用插件方式加载控件
  AMap.plugin(['AMap.Scale', 'AMap.ToolBar'], () => {
    map.addControl(new AMap.Scale())
    map.addControl(new AMap.ToolBar({ position: 'RT' }))
  })
}

function updateMapLocation(data) {
  if (!data || !map) return
  const deviceId = data.deviceId || 'unknown'
  const lat = Number(data.latitude)
  const lng = Number(data.longitude)
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) return
  const ts = data.receiveTime || new Date().toISOString()
  const newPos = [lng, lat]

  if (!deviceTracks[deviceId]) {
    deviceTracks[deviceId] = {
      points: [],
      glowLine: null,
      mainLine: null,
      marker: null
    }
  }
  const track = deviceTracks[deviceId]

  track.points.push({ pos: newPos, timestamp: ts })
  if (track.points.length > props.maxTrackPoints) track.points.shift()

  // 脉冲动画标记点
  if (track.marker) {
    track.marker.setPosition(newPos)
  } else {
    const color = pickColorForDevice(deviceId)
    track.marker = new AMap.Marker({
      position: newPos,
      content: buildPulseMarkerHTML(color),
      offset: new AMap.Pixel(-12, -12),
      zIndex: 120
    })
    map.add(track.marker)
  }

  // 移除旧路径
  if (track.glowLine) { map.remove(track.glowLine); track.glowLine = null }
  if (track.mainLine) { map.remove(track.mainLine); track.mainLine = null }

  const path = track.points.map(p => p.pos)
  const color = pickColorForDevice(deviceId)

  // 底层发光线
  track.glowLine = new AMap.Polyline({
    path: path,
    strokeColor: color,
    strokeOpacity: 0.2,
    strokeWeight: 14,
    lineJoin: 'round',
    lineCap: 'round',
    zIndex: 48
  })

  // 主路径线（带方向箭头 + 描边）
  track.mainLine = new AMap.Polyline({
    path: path,
    isOutline: true,
    outlineColor: 'rgba(0, 0, 0, 0.4)',
    borderWeight: 2,
    strokeColor: color,
    strokeOpacity: 0.9,
    strokeWeight: 5,
    lineJoin: 'round',
    lineCap: 'round',
    showDir: true,
    zIndex: 50
  })

  map.add(track.glowLine)
  map.add(track.mainLine)

  map.panTo(newPos)
  updateTrackInfo()
}

function buildPulseMarkerHTML(color) {
  return `<div style="position:relative;width:24px;height:24px;">
    <div style="
      position:absolute;top:50%;left:50%;
      transform:translate(-50%,-50%);
      width:10px;height:10px;
      background:${color};
      border-radius:50%;
      box-shadow:0 0 8px ${color}, 0 0 16px ${color};
      z-index:2;
    "></div>
    <div style="
      position:absolute;top:50%;left:50%;
      transform:translate(-50%,-50%);
      width:24px;height:24px;
      border-radius:50%;
      border:2px solid ${color};
      opacity:0.6;
      animation:gaode-pulse 1.5s ease-out infinite;
      z-index:1;
    "></div>
  </div>`
}

function pickColorForDevice(deviceId) {
  const palette = [
    '#FF6B35', // 运动橙
    '#FF8C42', // 浅橙
    '#FF5722', // 深橙
    '#FF9800'  // 琥珀橙
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
    last = `设备 ${lastDevice} (${lp.pos[1].toFixed(4)}, ${lp.pos[0].toFixed(4)})`
  }
  trackInfo.value = `当前位置: ${last} | 轨迹点数: ${totalPoints}`
}

function clearTrackForDevice(deviceId) {
  const track = deviceTracks[deviceId]
  if (!track) return
  if (track.glowLine) map.remove(track.glowLine)
  if (track.mainLine) map.remove(track.mainLine)
  if (track.marker) map.remove(track.marker)
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
    if (map) {
      map.clearMap()
      map.destroy()
    }
    map = null
  } catch (e) { console.error(e) }
})
</script>

<style scoped>
.map-card {
  background: #1a2332;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: box-shadow 0.2s ease;
}

.map-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.map-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.map-card__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #E8ECF1;
}

.map-card__info {
  font-size: 0.8rem;
  background: rgba(0, 196, 154, 0.1);
  color: #00C49A;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 500;
}

.map-card__map {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

@media (max-width: 768px) {
  .map-card__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>

<style>
@keyframes gaode-pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0.6;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.4);
    opacity: 0;
  }
}

.amap-logo,
.amap-copyright {
  display: none !important;
}
</style>
