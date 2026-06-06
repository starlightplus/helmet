<template>
  <div class="twin-wrap">
    <!-- Header -->
    <div class="twin-header">
      <div class="twin-header__title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        数字孪生 · 实时状态
      </div>
      <div class="twin-header__right">
        <button class="track-btn track-btn--status" @click="goDeviceStatus" title="设备状态">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          设备状态
        </button>
        <button class="track-btn track-btn--nav" @click="navPanelOpen = !navPanelOpen" title="骑行导航">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
          导航
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

      <!-- 导航抽屉面板 -->
      <transition name="nav-slide">
        <div v-if="navPanelOpen" class="nav-drawer">
          <div class="nav-drawer__header">
            <span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
              骑行导航
            </span>
            <button class="nav-close-btn" @click="navPanelOpen = false">✕</button>
          </div>

          <!-- 手动输入 -->
          <div class="nav-section">
            <div class="nav-input-row">
              <input
                v-model="navInput"
                class="nav-input"
                placeholder="输入目的地名称..."
                @keyup.enter="startNavigation(navInput)"
              />
              <button class="nav-search-btn" @click="startNavigation(navInput)" :disabled="!navInput.trim()">搜索</button>
            </div>
          </div>

          <!-- AI 推荐 -->
          <div class="nav-divider">或 AI 推荐</div>
          <div class="nav-level-row">
            <button class="nav-level-btn" :class="{ active: navSelectedLevel === 'short' }" @click="fetchRecommend('short')" :disabled="navLoading">
              短途<br/><small>5-10km</small>
            </button>
            <button class="nav-level-btn" :class="{ active: navSelectedLevel === 'medium' }" @click="fetchRecommend('medium')" :disabled="navLoading">
              中途<br/><small>15-25km</small>
            </button>
            <button class="nav-level-btn" :class="{ active: navSelectedLevel === 'long' }" @click="fetchRecommend('long')" :disabled="navLoading">
              长途<br/><small>35-50km</small>
            </button>
          </div>

          <!-- 加载中 -->
          <div v-if="navLoading" class="nav-loading">AI 推荐中...</div>

          <!-- 推荐结果卡片列表 -->
          <div v-if="navRecommends.length > 0" class="nav-recommend-list">
            <div
              v-for="(item, idx) in navRecommends"
              :key="idx"
              class="nav-recommend-card"
              :class="{ 'nav-recommend-card--selected': navSelected === item, 'nav-recommend-card--error': item.name === '推荐失败' }"
              @click="item.name !== '推荐失败' && (navSelected = item)"
            >
              <div class="nav-recommend-card__index">{{ idx + 1 }}</div>
              <div class="nav-recommend-card__body">
                <div class="nav-recommend-name">{{ item.name }}</div>
                <div class="nav-recommend-reason">{{ item.reason }}</div>
                <div v-if="item.distanceKm || item.durationMin" class="nav-recommend-meta">
                  <span v-if="item.distanceKm">📍 约 {{ item.distanceKm }} km</span>
                  <span v-if="item.durationMin">⏱ 约 {{ item.durationMin }} 分钟</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 确认导航 -->
          <button
            class="nav-confirm-btn"
            :disabled="!navInput.trim() && !navSelected"
            @click="startNavigation(navSelected ? navSelected.name : navInput)"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            开始导航
          </button>

          <!-- 结束导航 -->
          <button v-if="navActive" class="nav-stop-btn" @click="clearNavigation">结束导航</button>
        </div>
      </transition>

      <!-- 导航指引条 -->
      <transition name="alert-fade">
        <div v-if="navActive" class="nav-instruction-bar">
          <div class="nav-inst-dest" ref="destLabelRef">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            <div class="nav-inst-dest__ticker">
              <span class="nav-inst-dest__text" ref="destTextRef">{{ navDestName }}&nbsp;&nbsp;{{ navDestName }}</span>
            </div>
          </div>
          <div class="nav-inst-divider"></div>
          <span class="nav-inst-icon">{{ navDirectionIcon }}</span>
          <span class="nav-inst-text">{{ navInstruction }}</span>
          <span class="nav-inst-dist">{{ navRemainDist > 1000 ? (navRemainDist / 1000).toFixed(1) + 'km' : Math.round(navRemainDist) + 'm' }}</span>
          <div class="nav-inst-actions">
            <button class="nav-inst-btn nav-inst-btn--change" @click="navPanelOpen = true; navActive && clearNavigation()">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              更改目的地
            </button>
            <button class="nav-inst-btn nav-inst-btn--stop" @click="clearNavigation">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
              结束骑行
            </button>
          </div>
        </div>
      </transition>

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

      <!-- 无实时数据提示（右下角，轨迹点为0时显示） -->
      <div class="no-data-hint" v-if="!connected && trackPoints.length === 0">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        显示最后已知数据
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import request from '@/utils/request'
import { useRouter } from 'vue-router'

const router = useRouter()
function goDeviceStatus() { router.push('/device-status') }

const props = defineProps({
  sensorData: { type: Object, default: () => ({}) },
  connected: { type: Boolean, default: false },
  weatherData: { type: Object, default: null },
  deviceStatus: { type: Object, default: null }
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

// Navigation state
const navPanelOpen = ref(false)
const navInput = ref('')
const navRecommends = ref([])   // array of 3
const navSelected = ref(null)   // currently selected recommend item
const navLoading = ref(false)
const navSelectedLevel = ref('')
const navPolylines = ref([])
const navSteps = ref([])
const navStepIndex = ref(0)
const navActive = ref(false)
const navInstruction = ref('')
const navDestName = ref('')
const destLabelRef = ref(null)
const destTextRef = ref(null)

const navRemainDist = ref(0)
let navRemainingPath = []   // 导航剩余路径点（实时裁剪用）
let navPolylineRemain = null // 剩余路径 Polyline 实例

const navDirectionIcon = computed(() => {
  const text = navInstruction.value
  if (text.includes('左转')) return '↰'
  if (text.includes('右转')) return '↱'
  if (text.includes('到达')) return '⚑'
  return '↑'
})

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

// 数据库读到的最新位置，用于导航起点 fallback（避免硬编码北京）
const initialPosition = ref(null)  // { lat, lng }

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
    const res = await request.get('/api/sensor/latest-gps')
    const data = res.data
    if (!data || !data.latitude || !data.longitude) {
      console.log('[HelmetTwin] 数据库无 GPS 记录，保持默认中心')
      return
    }
    const lat = Number(data.latitude)
    const lng = Number(data.longitude)
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      amap.setCenter([lng, lat])
      initialPosition.value = { lat, lng }
      console.log('[HelmetTwin] 初始位置已定位到数据库最新 GPS:', lng, lat)

      // 用数据库最新记录填充姿态面板，让页面有内容显示
      roll.value  = Number(data.roll)  || 0
      pitch.value = Number(data.pitch) || 0
      yaw.value   = Number(data.yaw)   || 0
      avm.value   = Number(data.avm)   || 0
      gvm.value   = Number(data.gvm)   || 0

      // 在地图上放一个静态 marker 表示最后已知位置
      updateHelmetMarker([lng, lat], yaw.value)
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

// ── 导航功能 ──────────────────────────────────────────────────────────────────

// Haversine 公式，返回两点距离（米）
function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// 获取当前最佳起点坐标（实时GPS > 数据库初始位置 > null）
function getCurrentOrigin() {
  if (trackPoints.value.length > 0) {
    const last = trackPoints.value[trackPoints.value.length - 1]
    return { lat: last.lat, lng: last.lng }
  }
  if (initialPosition.value) {
    return { lat: initialPosition.value.lat, lng: initialPosition.value.lng }
  }
  return null
}

// 调后端 AI 推荐接口
async function fetchRecommend(level) {
  navSelectedLevel.value = level
  navLoading.value = true
  navRecommends.value = []
  navSelected.value = null
  try {
    const token = sessionStorage.getItem('token')
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const origin = getCurrentOrigin()
    const lat = origin ? origin.lat : 0
    const lng = origin ? origin.lng : 0

    const res = await fetch('/api/navigation/recommend', {
      method: 'POST',
      headers,
      body: JSON.stringify({ distanceLevel: level, lat, lng })
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error)
    navRecommends.value = data.recommendations || []
    if (navRecommends.value.length > 0) navSelected.value = navRecommends.value[0]
  } catch (e) {
    console.error('[Nav] 推荐失败:', e.message)
    navRecommends.value = [{ name: '推荐失败', reason: e.message, distanceKm: 0, durationMin: 0 }]
  } finally {
    navLoading.value = false
  }
}

// 用高德 REST API 地理编码（Web服务 key，走 /gaodemap 代理）
async function geocodeAddress(address) {
  const key = 'f693a401338ee91c2f19ee1dc4b10a0f'
  const url = `/gaodemap/v3/geocode/geo?key=${key}&address=${encodeURIComponent(address)}&output=JSON`
  const res = await fetch(url)
  const data = await res.json()
  if (data.status !== '1' || !data.geocodes?.length) {
    throw new Error(`地址解析失败：${address}（${data.info || data.infocode}）`)
  }
  const [lng, lat] = data.geocodes[0].location.split(',').map(Number)
  return { lng, lat }
}

// 用 AMap.Riding（JS API）规划骑行路线，Promise 包装，带超时 fallback
function planRidingRoute(originLng, originLat, destLng, destLat) {
  return new Promise((resolve, reject) => {
    // 10 秒超时：AMap.Riding 若未开通服务回调永远不触发
    const timer = setTimeout(() => {
      reject(new Error('路线规划超时，请确认高德 key 已开通骑行服务，或尝试其他目的地'))
    }, 10000)

    AMap.plugin('AMap.Riding', () => {
      const riding = new AMap.Riding()
      const origin = new AMap.LngLat(originLng, originLat)
      const dest   = new AMap.LngLat(destLng, destLat)
      riding.search(origin, dest, (status, result) => {
        clearTimeout(timer)
        if (status === 'complete' && result.routes && result.routes.length > 0) {
          resolve(result.routes[0])
        } else {
          reject(new Error(`骑行路线规划失败（${status}）`))
        }
      })
    })
  })
}

// 开始导航
async function startNavigation(destination) {
  if (!destination || !destination.trim() || !amap) return

  navDestName.value = destination.trim()
  navInstruction.value = '路线规划中...'
  navActive.value = true
  navPanelOpen.value = false

  try {
    // 1. 地理编码
    const destCoord = await geocodeAddress(destination.trim())

    // 2. 起点
    const origin = getCurrentOrigin()
    if (!origin) {
      navInstruction.value = '无法获取当前位置，请等待 GPS 数据'
      setTimeout(() => { navActive.value = false }, 3000)
      return
    }
    console.log('[Nav] 起点坐标:', origin)

    // 3. 骑行路线规划
    const route = await planRidingRouteRest(origin.lng, origin.lat, destCoord.lng, destCoord.lat)

    // 4. 提取步骤和路径
    const { steps, fullPath } = extractRouteData(route, destCoord)
    navSteps.value = steps
    navStepIndex.value = 0

    // 5. 绘制橙色路线（存入 navRemainingPath 供实时裁剪）
    clearNavPolylines()
    if (fullPath.length > 1) {
      navRemainingPath = [...fullPath]
      navPolylineRemain = new AMap.Polyline({
        path: navRemainingPath,
        strokeColor: '#f97316',
        strokeWeight: 5,
        strokeOpacity: 0.9,
        lineJoin: 'round',
        lineCap: 'round',
        zIndex: 20
      })
      amap.add(navPolylineRemain)
      navPolylines.value = [navPolylineRemain]
      try { amap.setFitView([navPolylineRemain], false, [60, 60, 60, 60]) } catch (_) {}
    }

    navInstruction.value = steps.length > 0 ? (steps[0].action || '沿路线骑行') : '沿路线骑行'

  } catch (e) {
    console.error('[Nav] 导航失败:', e.message)
    navInstruction.value = e.message
    setTimeout(() => { navActive.value = false }, 5000)
  }
}

// REST API 骑行路线规划（Web服务 key）
async function planRidingRouteRest(originLng, originLat, destLng, destLat) {
  const key = 'f693a401338ee91c2f19ee1dc4b10a0f'
  const url = `/gaodemap/v4/direction/bicycling?key=${key}&origin=${originLng},${originLat}&destination=${destLng},${destLat}`
  const res = await fetch(url)
  const data = await res.json()
  if (data.errcode !== 0) {
    throw new Error(`路线规划失败：${data.errmsg || data.errcode}`)
  }
  if (!data.data?.paths?.length) {
    throw new Error('未找到骑行路线')
  }
  return { _type: 'rest', ...data.data.paths[0] }
}

// 统一提取步骤和路径，兼容 JS API 和 REST API 两种数据格式
function extractRouteData(route, destCoord) {
  // REST API 格式：steps[].polyline 是 "lng,lat;lng,lat" 字符串
  if (route._type === 'rest') {
    const steps = (route.steps || []).map(step => {
      const pts = (step.polyline || '').split(';').map(s => {
        const [lng, lat] = s.split(',').map(Number)
        return [lng, lat]
      }).filter(([lng, lat]) => !isNaN(lng) && !isNaN(lat))
      const endPt = pts[pts.length - 1]
      return {
        action: step.instruction || '',
        endLat: endPt ? endPt[1] : destCoord.lat,
        endLng: endPt ? endPt[0] : destCoord.lng
      }
    })
    const fullPath = []
    for (const step of (route.steps || [])) {
      const pts = (step.polyline || '').split(';').map(s => {
        const [lng, lat] = s.split(',').map(Number)
        return [lng, lat]
      }).filter(([lng, lat]) => !isNaN(lng) && !isNaN(lat))
      fullPath.push(...pts)
    }
    return { steps, fullPath }
  }

  // JS API 格式：steps[].path 是 AMap.LngLat[]
  const steps = (route.steps || []).map(step => {
    const pts = step.path || []
    const endPt = pts[pts.length - 1]
    return {
      action: step.instruction || '',
      endLat: endPt ? endPt.getLat() : destCoord.lat,
      endLng: endPt ? endPt.getLng() : destCoord.lng
    }
  })
  const fullPath = []
  for (const step of (route.steps || [])) {
    if (step.path) fullPath.push(...step.path)
  }
  return { steps, fullPath }
}

// 清除导航路线和状态
function clearNavigation() {
  clearNavPolylines()
  navActive.value = false
  navSteps.value = []
  navStepIndex.value = 0
  navInstruction.value = ''
  navDestName.value = ''
  navRemainDist.value = 0
  navRecommends.value = []
  navSelected.value = null
  navInput.value = ''
  navSelectedLevel.value = ''
  navRemainingPath = []
  // 导航结束后恢复显示蓝色轨迹
  if (trackPoints.value.length >= 2) updatePolyline()
}

function clearNavPolylines() {
  if (amap) {
    // 直接移除 navPolylineRemain（主要路线对象）
    if (navPolylineRemain) {
      try { amap.remove(navPolylineRemain) } catch (_) {}
      navPolylineRemain = null
    }
    // 兜底：移除 navPolylines 数组里的所有对象
    if (navPolylines.value.length) {
      try { amap.remove(navPolylines.value) } catch (_) {}
    }
  }
  navPolylines.value = []
  navPolylineRemain = null
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

      // 蓝色轨迹线只在非导航时显示
      if (!navActive.value) {
        updatePolyline()
      }

      if (viewMode.value === 'follow' && amap) {
        amap.setCenter(lngLat)
        amap.setRotation(-yaw)
        amap.setPitch(62)
      }

      // 导航步骤推进 + 橙色路线实时裁剪
      if (navActive.value && navSteps.value.length > 0) {
        const step = navSteps.value[navStepIndex.value]
        const dist = calcDistance(lat, lng, step.endLat, step.endLng)
        navRemainDist.value = dist
        navInstruction.value = `前方 ${Math.round(dist)} 米 ${step.action}`
        if (dist < 30 && navStepIndex.value < navSteps.value.length - 1) {
          navStepIndex.value++
        }
        if (navStepIndex.value === navSteps.value.length - 1 && dist < 30) {
          navInstruction.value = '已到达目的地'
          clearNavigation()
          return
        }

        // 裁剪橙色路线：找到剩余路径中距当前位置最近的点，截掉之前的部分
        if (navRemainingPath.length > 2) {
          let closestIdx = 0
          let minDist = Infinity
          for (let i = 0; i < navRemainingPath.length; i++) {
            const [pLng, pLat] = navRemainingPath[i]
            const d = calcDistance(lat, lng, pLat, pLng)
            if (d < minDist) { minDist = d; closestIdx = i }
          }
          if (closestIdx > 0) {
            navRemainingPath = navRemainingPath.slice(closestIdx)
          }
          if (navPolylineRemain && navRemainingPath.length > 2) {
            navPolylineRemain.setPath(navRemainingPath)
          }
        }
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
  navPolylines.value = []
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

/* 无实时数据提示（右下角） */
.no-data-hint {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(15,23,42,0.6);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255,217,61,0.25);
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 11px;
  color: rgba(255,217,61,0.7);
  pointer-events: none;
}

/* 导航按钮 */
.track-btn--nav { background: rgba(249,115,22,0.15); color: #f97316; border: 1px solid rgba(249,115,22,0.3); }
.track-btn--nav:hover { background: rgba(249,115,22,0.3); }

.track-btn--status { background: rgba(0,217,255,0.15); color: #00D9FF; border: 1px solid rgba(0,217,255,0.3); }
.track-btn--status:hover { background: rgba(0,217,255,0.3); }

/* 设备状态抽屉 */
.status-drawer {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 280px;
  z-index: 150;
  background: rgba(10,22,40,0.97);
  border-right: 1px solid rgba(0,217,255,0.3);
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 14px;
  overflow-y: auto;
  backdrop-filter: blur(8px);
}
.status-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  color: #00D9FF;
  margin-bottom: 2px;
}
.status-drawer__header span {
  display: flex;
  align-items: center;
  gap: 6px;
}
.status-empty {
  color: rgba(255,255,255,0.45);
  font-size: 13px;
  text-align: center;
  padding: 30px 0;
}
.status-uptime {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  background: rgba(0,217,255,0.06);
  border: 1px solid rgba(0,217,255,0.18);
  border-radius: 8px;
}
.status-uptime__label {
  font-size: 11px;
  color: rgba(255,255,255,0.5);
  letter-spacing: 0.05em;
}
.status-uptime__val {
  font-size: 15px;
  font-weight: 700;
  color: #00D9FF;
  font-family: var(--font-mono, monospace);
}
.status-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px;
}
.status-row__label {
  font-size: 12.5px;
  color: rgba(255,255,255,0.8);
}
.status-row__badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  padding: 3px 10px;
  border: 1px solid;
  border-radius: 12px;
}
.status-row__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}
.status-update {
  font-size: 11px;
  color: rgba(255,255,255,0.35);
  text-align: center;
  margin-top: 2px;
}

/* 导航抽屉 */
.nav-drawer {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 280px;
  z-index: 150;
  background: rgba(10,22,40,0.97);
  border-right: 1px solid rgba(249,115,22,0.3);
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 12px;
  overflow-y: auto;
  backdrop-filter: blur(8px);
}
.nav-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  color: #f97316;
  margin-bottom: 2px;
}
.nav-drawer__header span {
  display: flex;
  align-items: center;
  gap: 6px;
}
.nav-close-btn {
  background: none;
  border: none;
  color: rgba(255,255,255,0.4);
  cursor: pointer;
  font-size: 13px;
  padding: 2px 6px;
  border-radius: 4px;
  transition: color 0.2s;
}
.nav-close-btn:hover { color: #fff; }

.nav-section { display: flex; flex-direction: column; gap: 6px; }
.nav-input-row { display: flex; gap: 6px; }
.nav-input {
  flex: 1;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(249,115,22,0.25);
  border-radius: 5px;
  color: #e2e8f0;
  font-size: 12px;
  padding: 6px 8px;
  outline: none;
  transition: border-color 0.2s;
}
.nav-input:focus { border-color: rgba(249,115,22,0.6); }
.nav-input::placeholder { color: rgba(255,255,255,0.25); }
.nav-search-btn {
  background: rgba(249,115,22,0.2);
  border: 1px solid rgba(249,115,22,0.4);
  color: #f97316;
  border-radius: 5px;
  font-size: 11px;
  padding: 6px 10px;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}
.nav-search-btn:hover:not(:disabled) { background: rgba(249,115,22,0.4); }
.nav-search-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.nav-divider {
  text-align: center;
  font-size: 11px;
  color: rgba(255,255,255,0.3);
  position: relative;
  margin: 2px 0;
}
.nav-divider::before, .nav-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 30%;
  height: 1px;
  background: rgba(255,255,255,0.1);
}
.nav-divider::before { left: 0; }
.nav-divider::after { right: 0; }

.nav-level-row { display: flex; gap: 6px; }
.nav-level-btn {
  flex: 1;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.6);
  border-radius: 6px;
  font-size: 11px;
  padding: 8px 4px;
  cursor: pointer;
  text-align: center;
  line-height: 1.4;
  transition: all 0.2s;
}
.nav-level-btn small { font-size: 10px; color: rgba(255,255,255,0.35); }
.nav-level-btn:hover:not(:disabled) { border-color: rgba(249,115,22,0.4); color: #f97316; }
.nav-level-btn.active { background: rgba(249,115,22,0.15); border-color: rgba(249,115,22,0.5); color: #f97316; }
.nav-level-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.nav-loading {
  text-align: center;
  font-size: 11px;
  color: rgba(249,115,22,0.7);
  padding: 6px 0;
  animation: pulse 1.2s infinite;
}

.nav-recommend-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.nav-recommend-card {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: rgba(249,115,22,0.06);
  border: 1px solid rgba(249,115,22,0.18);
  border-radius: 7px;
  padding: 9px 10px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.nav-recommend-card:hover {
  background: rgba(249,115,22,0.12);
  border-color: rgba(249,115,22,0.35);
}
.nav-recommend-card--selected {
  background: rgba(249,115,22,0.18);
  border-color: #f97316;
  box-shadow: 0 0 8px rgba(249,115,22,0.25);
}
.nav-recommend-card--error {
  cursor: default;
  background: rgba(255,71,87,0.08);
  border-color: rgba(255,71,87,0.2);
}
.nav-recommend-card__index {
  flex-shrink: 0;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: rgba(249,115,22,0.2);
  border: 1px solid rgba(249,115,22,0.4);
  color: #f97316;
  font-size: 10px;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  margin-top: 1px;
}
.nav-recommend-card__body { flex: 1; min-width: 0; }
.nav-recommend-name {
  font-size: 12px;
  font-weight: 600;
  color: #f97316;
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nav-recommend-reason {
  font-size: 10px;
  color: rgba(255,255,255,0.5);
  line-height: 1.4;
}
.nav-recommend-meta {
  display: flex;
  gap: 10px;
  margin-top: 5px;
  font-size: 10px;
  color: rgba(249,115,22,0.75);
  font-weight: 500;
}

.nav-confirm-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(249,115,22,0.2);
  border: 1px solid rgba(249,115,22,0.5);
  color: #f97316;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  padding: 9px;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 2px;
}
.nav-confirm-btn:hover:not(:disabled) { background: rgba(249,115,22,0.35); }
.nav-confirm-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.nav-stop-btn {
  background: rgba(255,71,87,0.1);
  border: 1px solid rgba(255,71,87,0.3);
  color: #FF4757;
  border-radius: 6px;
  font-size: 11px;
  padding: 7px;
  cursor: pointer;
  transition: background 0.2s;
}
.nav-stop-btn:hover { background: rgba(255,71,87,0.25); }

/* 导航指引条 */
.nav-instruction-bar {
  position: absolute;
  top: 10px;
  left: calc(50% + 80px);
  transform: translateX(-50%);
  z-index: 200;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(10,22,40,0.88);
  border: 1px solid rgba(249,115,22,0.4);
  border-radius: 8px;
  padding: 8px 12px;
  backdrop-filter: blur(8px);
  pointer-events: auto;
  white-space: nowrap;
}
.nav-inst-dest {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  color: #f97316;
  letter-spacing: 0.04em;
  width: 90px;
  flex-shrink: 0;
  overflow: hidden;
}
.nav-inst-dest svg {
  flex-shrink: 0;
}
.nav-inst-dest__ticker {
  overflow: hidden;
  flex: 1;
  min-width: 0;
}
.nav-inst-dest__text {
  display: inline-block;
  white-space: nowrap;
  padding-right: 32px; /* gap between repeat */
  animation: ticker-scroll 6s linear infinite;
}
@keyframes ticker-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.nav-inst-divider {
  width: 1px;
  height: 18px;
  background: rgba(255,255,255,0.12);
  flex-shrink: 0;
}
.nav-inst-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 6px;
  padding-left: 10px;
  border-left: 1px solid rgba(255,255,255,0.1);
}
.nav-inst-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
}
.nav-inst-btn--change {
  background: rgba(56,189,248,0.1);
  border: 1px solid rgba(56,189,248,0.3);
  color: #38bdf8;
}
.nav-inst-btn--change:hover { background: rgba(56,189,248,0.2); }
.nav-inst-btn--stop {
  background: rgba(255,71,87,0.1);
  border: 1px solid rgba(255,71,87,0.3);
  color: #FF4757;
}
.nav-inst-btn--stop:hover { background: rgba(255,71,87,0.22); }
.nav-inst-icon {
  font-size: 18px;
  color: #f97316;
  line-height: 1;
}
.nav-inst-text {
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nav-inst-dist {
  font-size: 12px;
  color: rgba(249,115,22,0.8);
  font-weight: 600;
  margin-left: 4px;
}

/* 抽屉滑入动画 */
.nav-slide-enter-active, .nav-slide-leave-active { transition: transform 0.25s ease, opacity 0.25s; }
.nav-slide-enter-from, .nav-slide-leave-to { transform: translateX(-100%); opacity: 0; }
</style>
