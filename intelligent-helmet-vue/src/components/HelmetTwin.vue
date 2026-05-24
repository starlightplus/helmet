<template>
  <div class="twin-wrap">
    <!-- Header -->
    <div class="twin-header">
      <div class="twin-header__title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        数字孪生 · 实时状态
      </div>
      <div class="twin-header__right">
        <button class="track-btn track-btn--view" @click="toggleViewMode" :disabled="trackPoints.length < 2" title="切换视图模式">
          <svg v-if="viewMode === 'follow'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
          <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>
          {{ viewMode === 'follow' ? '跟随' : '全局' }}
        </button>
        <button class="track-btn track-btn--speed" @click="cycleReplaySpeed" title="调整回放速度">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {{ replaySpeed }}x
        </button>
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

    <!-- 主体：全屏地图 + 悬浮仪表盘 -->
    <div class="twin-body">
      <!-- 高德 3D 地图容器（全屏） -->
      <div ref="mapContainerRef" class="map-fullscreen"></div>

      <!-- 跌倒警告（叠在地图上） -->
      <transition name="alert-fade">
        <div v-if="fallAlert" class="twin-alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          跌倒警告！
        </div>
      </transition>

      <!-- 左上角：3D头盔 + 状态面板 -->
      <div class="side-panel">
        <!-- 3D 头盔姿态视图 -->
        <div class="helmet3d-panel">
          <canvas ref="helmetCanvasRef" class="helmet3d-canvas"></canvas>
          <div class="helmet3d-label">头盔姿态 · 实时</div>
        </div>

        <!-- 直观状态卡片 -->
        <div class="status-panel">
          <div class="status-item">
            <span class="status-icon">↔</span>
            <div class="status-text">
              <div class="status-name">左右倾斜</div>
              <div class="status-val" :style="{ color: rollStatusColor }">{{ rollStatusText }}</div>
            </div>
          </div>
          <div class="status-item">
            <span class="status-icon">↕</span>
            <div class="status-text">
              <div class="status-name">前后俯仰</div>
              <div class="status-val" :style="{ color: pitchStatusColor }">{{ pitchStatusText }}</div>
            </div>
          </div>
          <div class="status-item">
            <span class="status-icon">⚡</span>
            <div class="status-text">
              <div class="status-name">运动强度</div>
              <div class="status-val" :style="{ color: avmStatusColor }">{{ avmStatusText }}</div>
            </div>
          </div>
          <div class="status-item">
            <span class="status-icon">⬡</span>
            <div class="status-text">
              <div class="status-name">整体稳定</div>
              <div class="status-val" :style="{ color: gvmStatusColor }">{{ gvmStatusText }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 轨迹点数量提示（右下角） -->
      <div class="track-info" v-if="trackPoints.length > 0">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        轨迹 {{ trackPoints.length }} 点
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import request from '@/utils/request'

const props = defineProps({
  sensorData: { type: Object, default: () => ({}) },
  connected: { type: Boolean, default: false },
  weatherData: { type: Object, default: null }
})

// DOM refs
const mapContainerRef = ref(null)
const helmetCanvasRef = ref(null)

// Three.js
let threeRenderer = null
let threeScene = null
let threeCamera = null
let helmetModel = null
let threeAnimId = null

// State
const fallAlert = ref(false)
const isReplaying = ref(false)
const viewMode = ref('follow')
const replaySpeed = ref(1)

// Sensor values
const roll = ref(0)
const pitch = ref(0)
const yaw = ref(0)
const avm = ref(0)
const gvm = ref(0)

// ── 直观状态描述 ──────────────────────────────────────────────────────────────
const rollStatusText = computed(() => {
  const v = roll.value
  if (Math.abs(v) < 5) return '水平'
  if (v > 0) return v > 20 ? `右倾 ${v.toFixed(0)}° ⚠` : `右倾 ${v.toFixed(0)}°`
  return Math.abs(v) > 20 ? `左倾 ${Math.abs(v).toFixed(0)}° ⚠` : `左倾 ${Math.abs(v).toFixed(0)}°`
})
const rollStatusColor = computed(() => {
  const v = Math.abs(roll.value)
  return v > 20 ? '#FF6B6B' : v > 10 ? '#FFD93D' : '#4ade80'
})

const pitchStatusText = computed(() => {
  const v = pitch.value
  if (Math.abs(v) < 5) return '平视'
  if (v > 0) return v > 20 ? `低头 ${v.toFixed(0)}° ⚠` : `低头 ${v.toFixed(0)}°`
  return Math.abs(v) > 20 ? `抬头 ${Math.abs(v).toFixed(0)}° ⚠` : `抬头 ${Math.abs(v).toFixed(0)}°`
})
const pitchStatusColor = computed(() => {
  const v = Math.abs(pitch.value)
  return v > 20 ? '#FF6B6B' : v > 10 ? '#FFD93D' : '#4ade80'
})

const avmStatusText = computed(() => {
  const v = avm.value
  if (v < 10) return '静止'
  if (v < 30) return '轻微晃动'
  if (v < 60) return '中等运动'
  return '剧烈运动 ⚠'
})
const avmStatusColor = computed(() => {
  const v = avm.value
  return v > 60 ? '#FF6B6B' : v > 30 ? '#FFD93D' : '#4ade80'
})

const gvmStatusText = computed(() => {
  const v = gvm.value
  if (v < 5) return '非常稳定'
  if (v < 15) return '基本稳定'
  if (v < 30) return '轻微倾斜'
  return '大幅倾斜 ⚠'
})
const gvmStatusColor = computed(() => {
  const v = gvm.value
  return v > 30 ? '#FF6B6B' : v > 15 ? '#FFD93D' : '#4ade80'
})

// Track
const trackPoints = ref([]) // [{ lat, lng, yaw }]

// AMap instances
let amap = null
let helmetMarker = null
let polylineGlow = null   // 发光底层（宽、半透明）
let polylineMain = null   // 主线（亮色）
let polylineDir = null    // 方向箭头层
let replayTimer = null

// ── 头盔 SVG Marker HTML ──────────────────────────────────────────────────────
function buildHelmetMarkerHTML(yawDeg) {
  return `
    <div style="
      width:44px; height:44px;
      transform: rotate(${yawDeg}deg);
      transform-origin: center center;
      position: relative;
      filter: drop-shadow(0 0 6px #00D9FF);
    ">
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- 头盔俯视轮廓 -->
        <ellipse cx="22" cy="24" rx="14" ry="12" fill="#1a3a5c" stroke="#00D9FF" stroke-width="1.5"/>
        <!-- 头盔顶部圆弧 -->
        <path d="M10 22 Q22 6 34 22" fill="#0d2a45" stroke="#00D9FF" stroke-width="1.5"/>
        <!-- 护目镜 -->
        <path d="M14 22 Q22 18 30 22" fill="none" stroke="#00f2ff" stroke-width="1.2" opacity="0.8"/>
        <!-- 方向指示箭头（朝上=前方） -->
        <polygon points="22,4 18,12 22,10 26,12" fill="#00D9FF" opacity="0.95"/>
        <!-- 中心点 -->
        <circle cx="22" cy="24" r="2.5" fill="#00D9FF" opacity="0.9"/>
        <!-- 脉冲环 -->
        <circle cx="22" cy="24" r="6" fill="none" stroke="#00D9FF" stroke-width="1" opacity="0.4"/>
      </svg>
    </div>
  `
}

// ── Three.js 3D 头盔姿态视图 ──────────────────────────────────────────────────
function initHelmet3D() {
  const canvas = helmetCanvasRef.value
  if (!canvas) return

  threeRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  threeRenderer.setPixelRatio(1)
  threeRenderer.setSize(220, 220, false)
  threeRenderer.setClearColor(0x000000, 0)

  threeScene = new THREE.Scene()

  threeCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
  threeCamera.position.set(0, 0, 3)
  threeCamera.lookAt(0, 0, 0)

  // 环境光
  threeScene.add(new THREE.AmbientLight(0xffffff, 0.6))
  // 主方向光（青色调）
  const dirLight = new THREE.DirectionalLight(0x00D9FF, 1.2)
  dirLight.position.set(2, 4, 3)
  threeScene.add(dirLight)
  // 补光
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.4)
  fillLight.position.set(-2, -1, -2)
  threeScene.add(fillLight)

  const loader = new GLTFLoader()
  loader.load(
    '/models/envoy.glb',
    (gltf) => {
      const model = gltf.scene
      // 以高度为基准归一化，让头盔垂直方向充满视口
      const box = new THREE.Box3().setFromObject(model)
      const center = new THREE.Vector3()
      box.getCenter(center)
      const size = new THREE.Vector3()
      box.getSize(size)

      // 先缩放，再居中（顺序不能反）
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = 1.2 / maxDim
      model.scale.setScalar(scale)

      // 世界中心 = position + scale × localCenter，要让它为 0：position = -scale × center
      model.position.set(-center.x * scale, -center.y * scale, -center.z * scale)

      // 相机距离：视野高度覆盖缩放后最大尺寸，留 20% 边距
      const fovRad = THREE.MathUtils.degToRad(45)
      const camDist = (1.2 / 2) / Math.tan(fovRad / 2) * 1.2
      threeCamera.position.set(0, 0, camDist)
      threeCamera.lookAt(0, 0, 0)

      console.log('[HelmetTwin] 模型原始尺寸:', size.x.toFixed(2), 'x', size.y.toFixed(2), 'x', size.z.toFixed(2), '缩放:', scale.toFixed(4), '相机距离:', camDist.toFixed(2))

      threeScene.add(model)
      helmetModel = model
      console.log('[HelmetTwin] 3D 头盔模型加载完成')
    },
    undefined,
    (err) => {
      console.warn('[HelmetTwin] 3D 模型加载失败:', err)
    }
  )

  renderHelmet3D()
}

function renderHelmet3D() {
  threeAnimId = requestAnimationFrame(renderHelmet3D)
  if (helmetModel) {
    helmetModel.rotation.set(
      THREE.MathUtils.degToRad(pitch.value),
      THREE.MathUtils.degToRad(-yaw.value),
      THREE.MathUtils.degToRad(roll.value),
      'YXZ'
    )
  }
  if (threeRenderer && threeScene && threeCamera) {
    threeRenderer.render(threeScene, threeCamera)
  }
}

// ── AMap 初始化 ───────────────────────────────────────────────────────────────
function initAMap() {
  if (!mapContainerRef.value) return

  const tryInit = () => {
    if (typeof AMap === 'undefined') {
      setTimeout(tryInit, 100)
      return
    }

    // 确保容器有实际尺寸再初始化
    const container = mapContainerRef.value
    if (!container || container.clientWidth === 0 || container.clientHeight === 0) {
      setTimeout(tryInit, 50)
      return
    }

    AMap.plugin(['AMap.Scale', 'AMap.ControlBar', 'AMap.Buildings'], () => {
      amap = new AMap.Map(container, {
        zoom: 18,
        center: [116.404, 39.915],
        viewMode: '3D',
        pitch: 62,
        rotation: 0,
        buildingAnimation: true,
        mapStyle: 'amap://styles/dark'
      })

      amap.setFeatures(['bg', 'road', 'building', 'point'])

      // 3D 建筑图层（插件加载后才能用）
      const buildings = new AMap.Buildings({ zooms: [14, 20], zIndex: 10, heightFactor: 1 })
      amap.add(buildings)

      amap.addControl(new AMap.Scale())
      amap.addControl(new AMap.ControlBar({ position: { right: '10px', top: '10px' } }))

      // 加载完成后定位到数据库最新位置
      loadInitialPosition()

      console.log('[HelmetTwin] 高德 3D 地图初始化完成')
    })
  }

  tryInit()
}

// ── 加载数据库最新位置作为地图初始中心 ──────────────────────────────────────
async function loadInitialPosition() {
  try {
    const res = await request.get('/api/sensor/latest')
    // 接口返回 List<SensorData>，直接是数组
    const list = res.data
    if (!Array.isArray(list) || list.length === 0) {
      console.log('[HelmetTwin] 无历史数据，保持默认中心')
      return
    }

    // 找第一条有有效 GPS 的记录
    const record = list.find(d => d.latitude && d.longitude)
    if (!record) {
      console.log('[HelmetTwin] 历史数据无有效 GPS，保持默认中心')
      return
    }

    const lat = Number(record.latitude)
    const lng = Number(record.longitude)
    if (!isNaN(lat) && !isNaN(lng)) {
      amap.setCenter([lng, lat])
      console.log('[HelmetTwin] 初始位置已定位到最新记录:', lng, lat)
    }
  } catch (e) {
    console.warn('[HelmetTwin] 加载初始位置失败:', e.message)
  }
}

// ── Marker 更新 ───────────────────────────────────────────────────────────────
function updateHelmetMarker(lngLat, yawDeg) {
  if (!amap) return

  const html = buildHelmetMarkerHTML(yawDeg)

  if (!helmetMarker) {
    helmetMarker = new AMap.Marker({
      position: lngLat,
      content: html,
      offset: new AMap.Pixel(-22, -22), // 图标中心对准坐标点
      zIndex: 200,
      anchor: 'center'
    })
    amap.add(helmetMarker)
  } else {
    helmetMarker.setPosition(lngLat)
    helmetMarker.setContent(html)
  }
}

// ── 轨迹线更新（三层叠加） ────────────────────────────────────────────────────
function updatePolyline() {
  if (!amap || trackPoints.value.length < 2) return

  const path = trackPoints.value.map(p => [p.lng, p.lat])

  if (!polylineGlow) {
    // 第一层：宽发光底层（青色，模糊感）
    polylineGlow = new AMap.Polyline({
      path,
      strokeColor: '#00D9FF',
      strokeWeight: 14,
      strokeOpacity: 0.15,
      lineJoin: 'round',
      lineCap: 'round',
      zIndex: 10
    })
    // 第二层：主线（亮白青色，清晰）
    polylineMain = new AMap.Polyline({
      path,
      strokeColor: '#7FEFFF',
      strokeWeight: 4,
      strokeOpacity: 0.95,
      lineJoin: 'round',
      lineCap: 'round',
      zIndex: 11
    })
    // 第三层：方向箭头（每隔一定距离显示行进方向）
    polylineDir = new AMap.Polyline({
      path,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      strokeOpacity: 0.6,
      strokeDasharray: [6, 14],  // 虚线模拟箭头间距
      showDir: true,
      lineJoin: 'round',
      zIndex: 12
    })
    amap.add([polylineGlow, polylineMain, polylineDir])
  } else {
    polylineGlow.setPath(path)
    polylineMain.setPath(path)
    polylineDir.setPath(path)
  }

  // 在最新位置画一个扩散光圈，表示"当前到达点"
  updateArrivalDot(path[path.length - 1])
}

// 当前到达点光圈（用 CircleMarker 实现）
let arrivalDot = null
function updateArrivalDot(lngLat) {
  if (!amap) return
  if (!arrivalDot) {
    arrivalDot = new AMap.CircleMarker({
      center: lngLat,
      radius: 7,
      strokeColor: '#00D9FF',
      strokeWeight: 2,
      strokeOpacity: 0.9,
      fillColor: '#00D9FF',
      fillOpacity: 0.3,
      zIndex: 50
    })
    amap.add(arrivalDot)
  } else {
    arrivalDot.setCenter(lngLat)
  }
}

// ── 视图控制 ──────────────────────────────────────────────────────────────────
function fitCameraToTrack() {
  if (!amap || trackPoints.value.length < 2 || !polylineMain) return
  amap.setFitView([polylineMain], false, [40, 40, 40, 40])
  amap.setPitch(45)
  console.log('[HelmetTwin] 全局视图 - 显示所有轨迹点:', trackPoints.value.length)
}

function toggleViewMode() {
  viewMode.value = viewMode.value === 'follow' ? 'global' : 'follow'

  if (viewMode.value === 'global') {
    fitCameraToTrack()
  } else {
    if (amap && trackPoints.value.length > 0) {
      const last = trackPoints.value[trackPoints.value.length - 1]
      amap.setCenter([last.lng, last.lat])
      amap.setZoom(18)
      amap.setPitch(62)
    }
  }
  console.log('[HelmetTwin] 切换视图模式:', viewMode.value)
}

// ── 轨迹清除 ──────────────────────────────────────────────────────────────────
function clearTrack() {
  trackPoints.value = []
  if (amap) {
    const toRemove = [polylineGlow, polylineMain, polylineDir, arrivalDot].filter(Boolean)
    if (toRemove.length) amap.remove(toRemove)
  }
  polylineGlow = null
  polylineMain = null
  polylineDir = null
  arrivalDot = null
}

// ── 回放 ──────────────────────────────────────────────────────────────────────
function cycleReplaySpeed() {
  const speeds = [0.5, 1, 2, 4]
  const idx = speeds.indexOf(replaySpeed.value)
  replaySpeed.value = speeds[(idx + 1) % speeds.length]
}

function replayTrack() {
  if (trackPoints.value.length < 2 || isReplaying.value) return
  isReplaying.value = true

  if (viewMode.value === 'global') fitCameraToTrack()

  let i = 0
  const pts = [...trackPoints.value]
  const interval = 100 / replaySpeed.value

  const step = () => {
    if (i >= pts.length) {
      isReplaying.value = false
      return
    }
    const pt = pts[i]
    const lngLat = [pt.lng, pt.lat]
    const yaw = pt.yaw ?? 0

    updateHelmetMarker(lngLat, yaw)

    if (viewMode.value === 'follow' && amap) {
      amap.setCenter(lngLat)
      amap.setRotation(-yaw)
      amap.setPitch(62)
    }

    i++
    replayTimer = setTimeout(step, interval)
  }

  step()
}

// ── Gauge 绘制 ────────────────────────────────────────────────────────────────
// (已移除 canvas gauge，改用直观文字状态卡片)

// ── Watch sensor data ─────────────────────────────────────────────────────────
watch(() => props.sensorData, (data) => {
  if (!data || !data.deviceId) return

  roll.value = Number(data.roll) || 0
  pitch.value = Number(data.pitch) || 0
  yaw.value = Number(data.yaw) || 0
  avm.value = Number(data.avm) || 0
  gvm.value = Number(data.gvm) || 0

  if (data.fallFlag) {
    fallAlert.value = true
    setTimeout(() => { fallAlert.value = false }, 3000)
  }

  if (data.latitude && data.longitude) {
    const lat = Number(data.latitude)
    const lng = Number(data.longitude)
    const yaw = Number(data.yaw) || 0

    if (lat && lng) {
      trackPoints.value.push({ lat, lng, yaw })

      const lngLat = [lng, lat]
      updateHelmetMarker(lngLat, yaw)
      updatePolyline()

      if (viewMode.value === 'follow' && amap) {
        amap.setCenter(lngLat)
        amap.setRotation(-yaw)   // 地图旋转，让前进方向始终朝上
        amap.setPitch(62)        // 保持 3D 倾斜视角
      }
    }
  }
}, { deep: true })

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  await nextTick()   // 等 DOM 渲染，确保容器有尺寸
  initAMap()
  initHelmet3D()
})

onUnmounted(() => {
  if (replayTimer) clearTimeout(replayTimer)
  if (threeAnimId) cancelAnimationFrame(threeAnimId)
  if (threeRenderer) threeRenderer.dispose()
  threeRenderer = null
  threeScene = null
  threeCamera = null
  helmetModel = null
  threeAnimId = null
  if (amap) {
    amap.destroy()
    amap = null
  }
  polylineGlow = null
  polylineMain = null
  polylineDir = null
  arrivalDot = null
  helmetMarker = null
})

defineExpose({
  onResize: () => {
    if (amap) amap.resize()
  }
})
</script>

<style scoped>
.twin-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: #020817;
}

/* Header */
.twin-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 14px; border-bottom: 1px solid rgba(56,189,248,0.15);
  flex-shrink: 0; z-index: 10; position: relative;
}
.twin-header__title {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 600; color: #e2e8f0; letter-spacing: 0.5px;
}
.twin-header__right { display: flex; align-items: center; gap: 8px; }

/* Buttons */
.track-btn {
  display: flex; align-items: center; gap: 4px;
  padding: 4px 10px; border-radius: 4px; border: none;
  font-size: 11px; cursor: pointer; transition: all 0.2s;
}
.track-btn--view { background: rgba(168,85,247,0.15); color: #A855F7; border: 1px solid rgba(168,85,247,0.3); }
.track-btn--view:hover:not(:disabled) { background: rgba(168,85,247,0.3); }
.track-btn--speed { background: rgba(255,217,61,0.15); color: #FFD93D; border: 1px solid rgba(255,217,61,0.3); }
.track-btn--speed:hover { background: rgba(255,217,61,0.3); }
.track-btn--clear { background: rgba(255,71,87,0.15); color: #FF4757; border: 1px solid rgba(255,71,87,0.3); }
.track-btn--clear:hover { background: rgba(255,71,87,0.3); }
.track-btn--replay { background: rgba(56,189,248,0.15); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3); }
.track-btn--replay:hover:not(:disabled) { background: rgba(56,189,248,0.3); }
.track-btn--replay:disabled, .track-btn--view:disabled { opacity: 0.4; cursor: not-allowed; }

/* Badge */
.badge {
  display: flex; align-items: center; gap: 5px;
  padding: 3px 10px; border-radius: 20px; font-size: 11px;
}
.badge i { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
.badge--on { background: rgba(56,189,248,0.1); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3); }
.badge--on i { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; animation: pulse 1.5s infinite; }
.badge--off { background: rgba(100,100,100,0.1); color: #888; border: 1px solid rgba(100,100,100,0.2); }
.badge--off i { background: #666; }
@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }

/* Body */
.twin-body {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* 全屏地图 */
.map-fullscreen {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* 跌倒警告 */
.twin-alert {
  position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,71,87,0.9); color: #fff; padding: 8px 16px;
  border-radius: 6px; font-size: 13px; font-weight: 600;
  z-index: 200; pointer-events: none;
}
.alert-fade-enter-active, .alert-fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.alert-fade-enter-from, .alert-fade-leave-to { opacity: 0; transform: translateX(-50%) translateY(-8px); }

/* 左上角侧边面板容器 */
.side-panel {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

/* 3D 头盔姿态面板 */
.helmet3d-panel {
  background: rgba(15,23,42,0.6);
  border: 1px solid rgba(56,189,248,0.2);
  border-radius: 10px;
  padding: 8px 8px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  backdrop-filter: blur(6px);
}
.helmet3d-canvas {
  width: 220px;
  height: 220px;
  display: block;
}
.helmet3d-label {
  font-size: 10px;
  color: rgba(56,189,248,0.55);
  margin-top: 2px;
  letter-spacing: 0.5px;
}

/* 直观状态卡片 */
.status-panel {
  background: rgba(15,23,42,0.6);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  backdrop-filter: blur(6px);
  width: 236px;
  box-sizing: border-box;
}
.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.status-icon {
  font-size: 14px;
  width: 20px;
  text-align: center;
  color: rgba(255,255,255,0.4);
  flex-shrink: 0;
}
.status-text {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex: 1;
}
.status-name {
  font-size: 11px;
  color: rgba(255,255,255,0.45);
  white-space: nowrap;
  min-width: 56px;
}
.status-val {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

/* 轨迹信息（右下角） */
.track-info {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(15,23,42,0.6);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 11px;
  color: rgba(56,189,248,0.8);
  pointer-events: none;
}
</style>
