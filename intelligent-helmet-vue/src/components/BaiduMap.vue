<template>
  <div class="map-card" data-aos="zoom-in-up" data-aos-delay="400">
    <div class="map-card__header">
      <div class="map-card__title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00F0FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span>设备位置地图</span>
      </div>
      <div class="map-card__info">{{ trackInfo }}</div>
    </div>
    <div id="baiduMap" class="map-card__map" :style="{ height: mapHeight + 'px' }"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  apiKey: { type: String, default: '' },
  maxTrackPoints: { type: Number, default: 200 },
  mapHeight: { type: Number, default: 500 }
})

let map = null
const trackInfo = ref('当前位置: 福建省福州市 | 轨迹点数: 0')

// deviceId => { points, glowLine, mainLine, pulseMarker }
const deviceTracks = {}

// 注入脉冲动画 CSS（全局只注入一次）
let styleInjected = false
function injectPulseStyle() {
  if (styleInjected) return
  styleInjected = true
  const style = document.createElement('style')
  style.textContent = `
    @keyframes bmap-pulse {
      0% { transform: translate(-50%,-50%) scale(0.5); opacity: 0.7; }
      100% { transform: translate(-50%,-50%) scale(1.5); opacity: 0; }
    }
  `
  document.head.appendChild(style)
}

// 生成方向箭头纹理（BMapGL 不支持 BMap.Symbol/IconSequence，改用 strokeTexture）
function createArrowTexture(pathColor) {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 16
  const ctx = canvas.getContext('2d')

  // 底色：路径颜色
  ctx.fillStyle = pathColor
  ctx.fillRect(0, 0, 128, 16)

  // 深色箭头（白底地图上清晰可见）
  ctx.fillStyle = 'rgba(80, 30, 0, 0.6)'
  ctx.beginPath()
  ctx.moveTo(100, 8)
  ctx.lineTo(85, 2)
  ctx.lineTo(89, 8)
  ctx.lineTo(85, 14)
  ctx.closePath()
  ctx.fill()

  const img = new Image()
  img.src = canvas.toDataURL()
  return img
}

// 自定义脉冲标记覆盖物
function createPulseOverlayClass() {
  function PulseOverlay(point, color) {
    this._point = point
    this._color = color
  }
  PulseOverlay.prototype = new BMapGL.Overlay()
  PulseOverlay.prototype.initialize = function (map) {
    this._map = map
    const div = document.createElement('div')
    div.style.position = 'absolute'
    div.style.zIndex = '999'
    div.style.pointerEvents = 'none'
    div.innerHTML = `
      <div style="position:relative;width:28px;height:28px;">
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
          width:12px;height:12px;background:${this._color};border-radius:50%;
          box-shadow:0 0 8px ${this._color},0 0 18px ${this._color};z-index:2;"></div>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
          width:28px;height:28px;border-radius:50%;border:2px solid ${this._color};
          opacity:0.7;animation:bmap-pulse 1.5s ease-out infinite;z-index:1;"></div>
      </div>`
    map.getPanes().markerPane.appendChild(div)
    this._div = div
    return div
  }
  PulseOverlay.prototype.draw = function () {
    const pixel = this._map.pointToOverlayPixel(this._point)
    this._div.style.left = (pixel.x - 14) + 'px'
    this._div.style.top = (pixel.y - 14) + 'px'
  }
  PulseOverlay.prototype.setPosition = function (point) {
    this._point = point
    this.draw()
  }
  return PulseOverlay
}

let PulseOverlay = null

function initMap() {
  if (typeof BMapGL === 'undefined') {
    setTimeout(initMap, 500)
    return
  }

  injectPulseStyle()
  PulseOverlay = createPulseOverlayClass()

  map = new BMapGL.Map('baiduMap')
  const fuzhou = new BMapGL.Point(119.296494, 26.074507)
  map.centerAndZoom(fuzhou, 13)
  map.enableScrollWheelZoom(true)
  map.addControl(new BMapGL.NavigationControl3D())
  map.addControl(new BMapGL.ScaleControl())
}

function safeCreatePoint(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') return null
  return new BMapGL.Point(lng, lat)
}

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
    deviceTracks[deviceId] = { points: [], glowLine: null, mainLine: null, pulseMarker: null }
  }
  const track = deviceTracks[deviceId]

  track.points.push({ point: newPoint, timestamp: ts })
  if (track.points.length > props.maxTrackPoints) track.points.shift()

  const color = pickColorForDevice(deviceId)

  // 脉冲标记点
  if (track.pulseMarker) {
    track.pulseMarker.setPosition(newPoint)
  } else {
    track.pulseMarker = new PulseOverlay(newPoint, color)
    map.addOverlay(track.pulseMarker)
  }

  // 移除旧路径
  if (track.glowLine) { map.removeOverlay(track.glowLine); track.glowLine = null }
  if (track.mainLine) { map.removeOverlay(track.mainLine); track.mainLine = null }

  const points = track.points.map(p => p.point)

  // 底层发光线（宽 + 半透明同色，白底上稍强 0.25）
  track.glowLine = new BMapGL.Polyline(points, {
    strokeColor: color,
    strokeWeight: 14,
    strokeOpacity: 0.25,
    strokeStyle: 'solid'
  })

  // 主路径线（带方向箭头纹理）
  track.mainLine = new BMapGL.Polyline(points, {
    strokeColor: color,
    strokeWeight: 5,
    strokeOpacity: 0.9,
    strokeStyle: 'solid',
    strokeTexture: createArrowTexture(color)
  })

  map.addOverlay(track.glowLine)
  map.addOverlay(track.mainLine)

  map.panTo(newPoint)
  updateTrackInfo()
}

function pickColorForDevice(deviceId) {
  const palette = [
    '#00D9FF',
    '#FF8C42',
    '#FF5722',
    '#FF9800'
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
  if (track.glowLine) map.removeOverlay(track.glowLine)
  if (track.mainLine) map.removeOverlay(track.mainLine)
  if (track.pulseMarker) map.removeOverlay(track.pulseMarker)
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
.map-card {
  background: #0f1624;
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
  color: #E0F2FE;
}

.map-card__info {
  font-size: 0.8rem;
  color: #8892A0;
  background: rgba(0, 196, 154, 0.1);
  color: #00F0FF;
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
