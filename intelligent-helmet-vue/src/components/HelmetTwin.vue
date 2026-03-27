<template>
  <div class="twin-wrap">
    <div class="twin-header">
      <div class="twin-header__title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        数字孪生 · 实时状态
      </div>
      <div class="twin-header__right">
        <!-- 视图模式切换按钮 -->
        <button class="track-btn track-btn--view" @click="toggleViewMode" :disabled="trackPoints.length < 2" title="切换视图模式">
          <svg v-if="viewMode === 'follow'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
          <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>
          {{ viewMode === 'follow' ? '跟随' : '全局' }}
        </button>
        <!-- 回放速度控制 -->
        <button class="track-btn track-btn--speed" @click="cycleReplaySpeed" title="调整回放速度">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {{ replaySpeed }}x
        </button>
        <!-- 轨迹控制按钮 -->
        <button class="track-btn track-btn--clear" @click="clearTrack" title="清除轨迹">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
          清除
        </button>
        <button class="track-btn track-btn--replay" @click="replayTrack" :disabled="trackPoints.length < 2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          {{ isReplaying ? '回放中...' : '回放' }}
        </button>
        <span class="badge" :class="connected ? 'badge--on' : 'badge--off'">
          <i></i>{{ connected ? '数据同步中' : '等待连接' }}
        </span>
      </div>
    </div>

    <div class="twin-body">
      <!-- 高德地图容器（上方 2/3） -->
      <div ref="mapContainerRef" class="map-main-container"></div>

      <!-- 下方左右分屏（下方 1/3） -->
      <div class="twin-bottom-split">
        <!-- 左侧：3D 头盔场景（占 2/3） -->
        <div class="twin-split-panel twin-split-panel--left">
          <div class="twin-card__title">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            3D 数字孪生
          </div>
          <div class="helmet-view-wrap">
            <!-- 使用 HelmetView 组件，传递姿态数据，禁用自动旋转 -->
            <HelmetView :roll="roll" :pitch="pitch" :autoRotate="false" />
          </div>
        </div>

        <!-- 右侧：姿态可视化（占 1/3） -->
        <div class="twin-split-panel twin-split-panel--right">
          <div class="twin-card__title">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
            姿态可视化
          </div>
          <!-- 四个半圆仪表盘 -->
          <div class="dashboard-gauges">
            <!-- Roll：横滚角 - 左右倾斜角度 -->
            <div class="gauge-item">
              <canvas ref="rollGaugeRef" class="gauge-canvas"></canvas>
              <div class="gauge-label">Roll · 横滚角</div>
              <div class="gauge-desc">左右倾斜</div>
              <div class="gauge-value" style="color:#FF6B6B">{{ roll.toFixed(1) }}°</div>
            </div>
            <!-- Pitch：俯仰角 - 前后倾斜角度 -->
            <div class="gauge-item">
              <canvas ref="pitchGaugeRef" class="gauge-canvas"></canvas>
              <div class="gauge-label">Pitch · 俯仰角</div>
              <div class="gauge-desc">前后倾斜</div>
              <div class="gauge-value" style="color:#00D9FF">{{ pitch.toFixed(1) }}°</div>
            </div>
            <!-- AVM：角速度合量 - 旋转速率 -->
            <div class="gauge-item">
              <canvas ref="avmGaugeRef" class="gauge-canvas"></canvas>
              <div class="gauge-label">AVM · 角速度</div>
              <div class="gauge-desc">旋转速率</div>
              <div class="gauge-value" style="color:#FFD93D">{{ avm.toFixed(1) }}°/s</div>
            </div>
            <!-- GVM：倾斜合量 - 综合偏转程度 -->
            <div class="gauge-item">
              <canvas ref="gvmGaugeRef" class="gauge-canvas"></canvas>
              <div class="gauge-label">GVM · 倾斜合量</div>
              <div class="gauge-desc">综合偏转</div>
              <div class="gauge-value" style="color:#A855F7">{{ gvm.toFixed(1) }}°</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import HelmetView from './ModelShowcase.vue'

const props = defineProps({
  sensorData: { type: Object, default: () => ({}) },
  connected: { type: Boolean, default: false },
  weatherData: { type: Object, default: null }
})

// DOM refs
const mapContainerRef = ref(null)
const rollGaugeRef = ref(null)
const pitchGaugeRef = ref(null)
const avmGaugeRef = ref(null)
const gvmGaugeRef = ref(null)

// State
const fallAlert = ref(false)
const isReplaying = ref(false)
const viewMode = ref('follow') // 'follow' 或 'global'
const replaySpeed = ref(1) // 回放速度倍率：0.5, 1, 2, 4

// Sensor values
const roll = ref(0)
const pitch = ref(0)
const avm = ref(0)
const gvm = ref(0)

// Track
const trackPoints = ref([])

// Risk score
const riskScore = computed(() => {
  let s = 0
  s += Math.min(avm.value / 2, 40)
  s += Math.min(gvm.value / 1.5, 40)
  if (props.sensorData?.fallFlag) s += 20
  return Math.round(Math.min(s, 100))
})
const riskClass = computed(() => {
  const s = riskScore.value
  if (s >= 70) return 'risk-badge--high'
  if (s >= 40) return 'risk-badge--mid'
  return 'risk-badge--low'
})
const riskLabel = computed(() => {
  const s = riskScore.value
  if (s >= 70) return '高风险'
  if (s >= 40) return '中风险'
  return '低风险'
})

// ── GPS / track ──────────────────────────────────────────────────────────────
let baiduMap3D = null // 百度3D地图实例
let mapPolyline = null // 地图上的轨迹线

function clearTrack() {
  trackPoints.value = []

  // 清除百度3D地图上的轨迹
  if (baiduMap3D && mapPolyline) {
    baiduMap3D.removeOverlay(mapPolyline)
    mapPolyline = null
  }
}

function replayTrack() {
  if (trackPoints.value.length < 2 || isReplaying.value) return
  isReplaying.value = true

  // 如果是全局视图模式，调整地图以显示整个轨迹
  if (viewMode.value === 'global') {
    fitCameraToTrack()
  }

  let i = 0
  const pts = [...trackPoints.value]
  // 根据速度倍率计算间隔时间（基础速度 100ms）
  const interval = 100 / replaySpeed.value

  const iv = setInterval(() => {
    if (i >= pts.length) { clearInterval(iv); isReplaying.value = false; return }

    // 只更新地图中心，头盔不移动
    updateMapCenter(pts[i].lat, pts[i].lng)

    i++
  }, interval)
}

// 切换回放速度
function cycleReplaySpeed() {
  const speeds = [0.5, 1, 2, 4]
  const currentIndex = speeds.indexOf(replaySpeed.value)
  const nextIndex = (currentIndex + 1) % speeds.length
  replaySpeed.value = speeds[nextIndex]
  console.log('[HelmetTwin] 回放速度:', replaySpeed.value + 'x')
}

// 调整地图以显示整个轨迹
function fitCameraToTrack() {
  if (trackPoints.value.length < 2 || !baiduMap3D) return

  // 使用百度地图的 setViewport 来显示所有轨迹点
  const points = trackPoints.value.map(p => new BMapGL.Point(p.lng, p.lat))
  baiduMap3D.setViewport(points)

  console.log('[HelmetTwin] 全局视图 - 显示所有轨迹点:', trackPoints.value.length)
}

// 切换视图模式
function toggleViewMode() {
  viewMode.value = viewMode.value === 'follow' ? 'global' : 'follow'

  if (viewMode.value === 'global') {
    fitCameraToTrack()
  } else {
    // 恢复跟随模式 - 地图缩放回 15 级
    if (baiduMap3D && trackPoints.value.length > 0) {
      const lastPoint = trackPoints.value[trackPoints.value.length - 1]
      baiduMap3D.centerAndZoom(new BMapGL.Point(lastPoint.lng, lastPoint.lat), 15)
    }
  }

  console.log('[HelmetTwin] 切换视图模式:', viewMode.value)
}

// 初始化百度3D地图
function initBaiduMap3D() {
  if (!mapContainerRef.value) {
    console.error('[HelmetTwin] 地图容器未找到')
    return
  }

  // 等待百度3D地图 API 加载完成
  const checkBMapGL = () => {
    if (typeof BMapGL !== 'undefined') {
      // 创建3D地图实例
      baiduMap3D = new BMapGL.Map(mapContainerRef.value, {
        style: { styleId: 'e33c8118e114f5a9b4e8e8c9b6e8e8e8' } // 清新蓝风格
      })
      const center = new BMapGL.Point(116.404, 39.915) // 默认中心点：北京
      baiduMap3D.centerAndZoom(center, 16)

      // 启用滚轮缩放
      baiduMap3D.enableScrollWheelZoom(true)

      // 开启3D视图 - 更明显的3D效果
      baiduMap3D.setHeading(45)  // 旋转角度
      baiduMap3D.setTilt(60)     // 倾斜角度（0-80度，越大越倾斜）

      // 启用3D建筑
      baiduMap3D.setDisplayOptions({
        building: true  // 显示3D建筑
      })

      // 添加控件
      baiduMap3D.addControl(new BMapGL.NavigationControl3D())
      baiduMap3D.addControl(new BMapGL.ScaleControl())

      console.log('[HelmetTwin] 百度3D地图初始化完成')
    } else {
      console.log('[HelmetTwin] 等待百度3D地图 API 加载...')
      setTimeout(checkBMapGL, 100)
    }
  }

  checkBMapGL()
}

// 更新百度3D地图中心位置
function updateMapCenter(lat, lng) {
  if (!baiduMap3D) return

  const point = new BMapGL.Point(lng, lat)
  baiduMap3D.panTo(point)
  console.log('[HelmetTwin] 地图中心更新:', lat, lng)
}

// 在百度3D地图上绘制轨迹
function updateMapTrack() {
  if (!baiduMap3D || trackPoints.value.length < 2) return

  // 移除旧轨迹
  if (mapPolyline) {
    baiduMap3D.removeOverlay(mapPolyline)
  }

  // 创建新轨迹
  const points = trackPoints.value.map(p => new BMapGL.Point(p.lng, p.lat))
  mapPolyline = new BMapGL.Polyline(points, {
    strokeColor: '#00D9FF',
    strokeWeight: 3,
    strokeOpacity: 0.9
  })
  baiduMap3D.addOverlay(mapPolyline)

  console.log('[HelmetTwin] 地图轨迹更新，点数:', trackPoints.value.length)
}


// ── Gauge drawing functions ──────────────────────────────────────────────────
// 初始化所有仪表盘
function initGauges() {
  drawGauge(rollGaugeRef.value, roll.value, -45, 45, '#FF6B6B')    // Roll: 横滚角，范围 -45° ~ 45°
  drawGauge(pitchGaugeRef.value, pitch.value, -45, 45, '#00D9FF')  // Pitch: 俯仰角，范围 -45° ~ 45°
  drawGauge(avmGaugeRef.value, avm.value, 0, 100, '#FFD93D')       // AVM: 角速度合量，范围 0 ~ 100°/s
  drawGauge(gvmGaugeRef.value, gvm.value, 0, 45, '#A855F7')        // GVM: 倾斜合量，范围 0 ~ 45°
}

// 绘制单个半圆仪表盘
// @param canvas - canvas 元素
// @param value - 当前值
// @param min - 最小值
// @param max - 最大值
// @param color - 仪表盘颜色
function drawGauge(canvas, value, min, max, color) {
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const w = canvas.width = canvas.clientWidth * 2
  const h = canvas.height = canvas.clientHeight * 2
  const cx = w / 2
  const cy = h * 0.75
  const radius = Math.min(w, h) * 0.35

  ctx.clearRect(0, 0, w, h)

  // 背景弧（灰色半圆）
  ctx.beginPath()
  ctx.arc(cx, cy, radius, Math.PI, 2 * Math.PI)
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 8
  ctx.stroke()

  // 刻度线（10 个刻度）
  for (let i = 0; i <= 10; i++) {
    const angle = Math.PI + (i / 10) * Math.PI
    const x1 = cx + Math.cos(angle) * (radius - 5)
    const y1 = cy + Math.sin(angle) * (radius - 5)
    const x2 = cx + Math.cos(angle) * (radius - 15)
    const y2 = cy + Math.sin(angle) * (radius - 15)

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  // 值弧（彩色部分，表示当前值）
  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)))
  const valueAngle = Math.PI + normalized * Math.PI

  ctx.beginPath()
  ctx.arc(cx, cy, radius, Math.PI, valueAngle)
  ctx.strokeStyle = color
  ctx.lineWidth = 8
  ctx.stroke()

  // 指针（从中心指向当前值）
  const pointerLength = radius - 20
  const px = cx + Math.cos(valueAngle) * pointerLength
  const py = cy + Math.sin(valueAngle) * pointerLength

  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(px, py)
  ctx.strokeStyle = color
  ctx.lineWidth = 3
  ctx.stroke()

  // 中心点（指针的圆心）
  ctx.beginPath()
  ctx.arc(cx, cy, 5, 0, 2 * Math.PI)
  ctx.fillStyle = color
  ctx.fill()
}

// 更新所有仪表盘
function updateGauges() {
  drawGauge(rollGaugeRef.value, roll.value, -45, 45, '#FF6B6B')    // Roll: 横滚角
  drawGauge(pitchGaugeRef.value, pitch.value, -45, 45, '#00D9FF')  // Pitch: 俯仰角
  drawGauge(avmGaugeRef.value, avm.value, 0, 100, '#FFD93D')       // AVM: 角速度合量
  drawGauge(gvmGaugeRef.value, gvm.value, 0, 45, '#A855F7')        // GVM: 倾斜合量
}


// ── Watch sensor data ────────────────────────────────────────────────────────
watch(() => props.sensorData, (data) => {
  if (!data || !data.deviceId) {
    console.log('[HelmetTwin] watch: 无效数据', data)
    return
  }

  console.log('[HelmetTwin] watch 收到数据:', {
    deviceId: data.deviceId,
    roll: data.roll,
    pitch: data.pitch,
    avm: data.avm,
    gvm: data.gvm
  })

  const r = Number(data.roll) || 0
  const p = Number(data.pitch) || 0

  // 直接使用后端传来的 AVM 和 GVM
  avm.value = Number(data.avm) || 0
  gvm.value = Number(data.gvm) || 0

  roll.value = r
  pitch.value = p

  console.log('[HelmetTwin] 更新后的值 - roll:', roll.value, 'pitch:', pitch.value, 'avm:', avm.value, 'gvm:', gvm.value)

  // Fall alert
  if (data.fallFlag) {
    fallAlert.value = true
    setTimeout(() => { fallAlert.value = false }, 3000)
  }

  // GPS track
  if (data.latitude && data.longitude) {
    const lat = Number(data.latitude), lng = Number(data.longitude)
    if (lat && lng) {
      trackPoints.value.push({ lat, lng })

      // 更新百度地图中心位置
      updateMapCenter(lat, lng)

      // 更新地图上的轨迹线
      updateMapTrack()

      // 头盔保持固定位置，不移动
    }
  }

  // 粒子流场在动画循环中自动更新

  // 更新仪表盘
  updateGauges()
}, { deep: true })


// ── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  initBaiduMap3D() // 初始化百度3D地图

  // 初始化仪表盘
  setTimeout(() => {
    initGauges()
  }, 100)
})

onUnmounted(() => {
})

// 暴露 onResize 方法供 App.vue 调用
defineExpose({
  onResize: () => {
    // ModelShowcase 内部会自动处理 resize
    console.log('[HelmetTwin] onResize called')
  }
})
</script>

<style scoped>
.twin-wrap { display: flex; flex-direction: column; height: 100%; overflow: hidden; background: #0a0e1a; }

/* Header */
.twin-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 14px; border-bottom: 1px solid rgba(0,217,255,0.15);
  flex-shrink: 0;
}
.twin-header__title {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 600; color: #e0f4ff; letter-spacing: 0.5px;
}
.twin-header__right { display: flex; align-items: center; gap: 8px; }

/* Track buttons */
.track-btn {
  display: flex; align-items: center; gap: 4px;
  padding: 4px 10px; border-radius: 4px; border: none;
  font-size: 11px; cursor: pointer; transition: all 0.2s;
}
.track-btn--view {
  background: rgba(168,85,247,0.15); color: #A855F7; border: 1px solid rgba(168,85,247,0.3);
}
.track-btn--view:hover:not(:disabled) { background: rgba(168,85,247,0.3); }
.track-btn--speed {
  background: rgba(255,217,61,0.15); color: #FFD93D; border: 1px solid rgba(255,217,61,0.3);
}
.track-btn--speed:hover { background: rgba(255,217,61,0.3); }
.track-btn--clear {
  background: rgba(255,71,87,0.15); color: #FF4757; border: 1px solid rgba(255,71,87,0.3);
}
.track-btn--clear:hover { background: rgba(255,71,87,0.3); }
.track-btn--replay {
  background: rgba(0,217,255,0.15); color: #00D9FF; border: 1px solid rgba(0,217,255,0.3);
}
.track-btn--replay:hover:not(:disabled) { background: rgba(0,217,255,0.3); }
.track-btn--replay:disabled,
.track-btn--view:disabled { opacity: 0.4; cursor: not-allowed; }

/* Badge */
.badge {
  display: flex; align-items: center; gap: 5px;
  padding: 3px 10px; border-radius: 20px; font-size: 11px;
}
.badge i { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
.badge--on { background: rgba(0,217,255,0.1); color: #00D9FF; border: 1px solid rgba(0,217,255,0.3); }
.badge--on i { background: #00D9FF; box-shadow: 0 0 6px #00D9FF; animation: pulse 1.5s infinite; }
.badge--off { background: rgba(100,100,100,0.1); color: #888; border: 1px solid rgba(100,100,100,0.2); }
.badge--off i { background: #666; }
@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }

/* Body */
.twin-body { display: flex; flex-direction: column; flex: 1; overflow: hidden; }

/* 3D canvas */
/* 地图主容器（上方 1/2） */
.map-main-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 0;
}

/* 下方左右分屏容器（下方 1/2） */
.twin-bottom-split {
  flex: 1;
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #0a0e1a;
  min-height: 0;
}

/* 左右两个面板 - 左侧占 2/3，右侧占 1/3 */
.twin-split-panel {
  display: flex;
  flex-direction: column;
  background: rgba(26, 42, 58, 0.3);
  border: 1px solid rgba(0, 217, 255, 0.2);
  border-radius: 8px;
  overflow: hidden;
  min-width: 0;
}

.twin-split-panel--left {
  flex: 2; /* 左侧占 2/3 */
}

.twin-split-panel--right {
  flex: 1; /* 右侧占 1/3 */
}

/* 头盔视图包装器 */
.helmet-view-wrap {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 0;
}

.helmet-view-wrap :deep(.endfield-app) {
  width: 100% !important;
  height: 100% !important;
  position: absolute;
  inset: 0;
}

.helmet-view-wrap :deep(#webgl-container) {
  width: 100%;
  height: 100%;
}

.helmet-view-wrap :deep(#ui-layer) {
  /* 显示 UI 层，但只显示左侧面板 */
  display: flex !important;
}

.helmet-view-wrap :deep(.right-panel) {
  /* 隐藏右侧遥测面板 */
  display: none !important;
}

.helmet-view-wrap :deep(.left-panel) {
  /* 调整左侧面板样式，使其更适合嵌入式布局 */
  width: 320px;
  font-size: 12px;
}

.helmet-view-wrap :deep(#loading-screen) {
  position: absolute;
  width: 100%;
  height: 100%;
}

/* Loading */
.twin-loading {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 10px;
  background: rgba(10,14,26,0.85); color: #00D9FF; font-size: 13px;
}
.twin-loading__spinner {
  width: 32px; height: 32px; border: 3px solid rgba(0,217,255,0.2);
  border-top-color: #00D9FF; border-radius: 50%; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg) } }

/* Fall alert */
.twin-alert {
  position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,71,87,0.9); color: #fff; padding: 8px 16px;
  border-radius: 6px; font-size: 13px; font-weight: 600;
  animation: alertIn 0.3s ease;
}
@keyframes alertIn { from { opacity:0; transform: translateX(-50%) translateY(-10px) } }

/* Risk badge */
.risk-badge {
  position: absolute; top: 12px; right: 12px;
  display: flex; flex-direction: column; align-items: center;
  padding: 8px 12px; border-radius: 8px; backdrop-filter: blur(8px);
  border: 1px solid; transition: all 0.5s;
}
.risk-badge--low  { background: rgba(0,217,255,0.1); border-color: rgba(0,217,255,0.4); color: #00D9FF; }
.risk-badge--mid  { background: rgba(255,217,61,0.1); border-color: rgba(255,217,61,0.4); color: #FFD93D; }
.risk-badge--high { background: rgba(255,71,87,0.15); border-color: rgba(255,71,87,0.5); color: #FF4757; }
.risk-badge__label { font-size: 10px; opacity: 0.7; }
.risk-badge__val   { font-size: 22px; font-weight: 700; line-height: 1.1; }
.risk-badge__desc  { font-size: 11px; font-weight: 600; }

/* Environment badge */
.env-badge {
  position: absolute; top: 12px; left: 12px;
  display: flex; flex-direction: column; gap: 6px;
}
.env-badge__item {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px; border-radius: 8px;
  background: rgba(0,217,255,0.1); backdrop-filter: blur(8px);
  border: 1px solid rgba(0,217,255,0.3);
  color: #00D9FF; font-size: 11px; font-weight: 600;
}

/* Hint */
.twin-hint {
  position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%);
  font-size: 10px; color: rgba(255,255,255,0.3); white-space: nowrap;
}

/* Cards roll */
.twin-cards {
  flex: 1; display: grid; grid-template-columns: 1fr 1fr;
  gap: 8px; padding: 8px; min-height: 0; overflow: hidden;
}
.twin-card {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(0,217,255,0.1);
  border-radius: 8px; display: flex; flex-direction: column; overflow: hidden;
}
.twin-card__title {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 10px; font-size: 11px; color: #a0c4d8; font-weight: 600;
  border-bottom: 1px solid rgba(0,217,255,0.08); flex-shrink: 0;
}

/* Attitude */
/* Gauge Dashboard - 四个仪表盘布局 */
.dashboard-gauges {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 12px;
  padding: 12px;
  flex: 1;
  overflow: hidden;
}
.gauge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.02);
  border-radius: 8px;
  padding: 8px;
}
.gauge-canvas {
  width: 100%;
  height: 80px;
}
.gauge-label {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255,255,255,0.7);
  margin-top: 4px;
}
.gauge-desc {
  font-size: 9px;
  color: rgba(255,255,255,0.4);
  margin-top: 2px;
}
.gauge-value {
  font-size: 16px;
  font-weight: 700;
  margin-top: 4px;
  font-variant-numeric: tabular-nums;
}
</style>
