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
        <!-- 左侧：3D 头盔场景 -->
        <div class="twin-split-panel">
          <div class="twin-card__title">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            3D 数字孪生
          </div>
          <div class="helmet-view-wrap">
            <canvas ref="canvasRef" class="twin-canvas"></canvas>
            <div v-if="loading" class="twin-loading">
              <div class="twin-loading__spinner"></div>
              <span>加载模型中...</span>
            </div>
            <!-- 跌倒警报 -->
            <div v-if="fallAlert" class="twin-alert">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF4757" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              检测到摔倒！
            </div>
            <!-- 风险评分 -->
            <div class="risk-badge" :class="riskClass">
              <span class="risk-badge__label">风险评分</span>
              <span class="risk-badge__val">{{ riskScore }}</span>
              <span class="risk-badge__desc">{{ riskLabel }}</span>
            </div>
          </div>
        </div>

        <!-- 右侧：姿态可视化 -->
        <div class="twin-split-panel">
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
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const props = defineProps({
  sensorData: { type: Object, default: () => ({}) },
  connected: { type: Boolean, default: false },
  weatherData: { type: Object, default: null }
})

// DOM refs
const canvasRef = ref(null)
const mapContainerRef = ref(null)
const rollGaugeRef = ref(null)
const pitchGaugeRef = ref(null)
const avmGaugeRef = ref(null)
const gvmGaugeRef = ref(null)

// State
const loading = ref(true)
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

// ── Three.js main scene ──────────────────────────────────────────────────────
let scene, camera, renderer, controls, helmetMesh, rimLight
let animFrameId, autoRotateTimer
let axesHelper = null // 坐标系辅助器

// ── Environment awareness ────────────────────────────────────────────────────
let particleSystem = null
let sunLight = null

// ── Coordinate system ────────────────────────────────────────────────────────
let coordinatePlane = null

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

// ── Sun Position Calculation ─────────────────────────────────────────────────
// 根据当前时间计算太阳位置
function getSunPosition() {
  const hour = new Date().getHours()

  // 夜晚时段（18点-6点）无太阳
  if (hour < 6 || hour >= 18) {
    return null
  }

  // 方位角（0-360度，0=北，90=东，180=南，270=西）
  let azimuth
  // 高度角（0-90度，0=地平线，90=天顶）
  let altitude

  if (hour >= 6 && hour < 12) {
    // 早晨到中午：太阳从东方升起到南方
    const progress = (hour - 6) / 6  // 0 -> 1
    azimuth = 90 + progress * 90     // 90度(东) -> 180度(南)
    altitude = progress * 70         // 0度 -> 70度
  } else {
    // 中午到傍晚：太阳从南方到西方落下
    const progress = (hour - 12) / 6  // 0 -> 1
    azimuth = 180 + progress * 90     // 180度(南) -> 270度(西)
    altitude = 70 - progress * 70     // 70度 -> 0度
  }

  return { azimuth, altitude, hour }
}

// 根据时间获取太阳光颜色
function getSunColor(hour) {
  if (hour >= 6 && hour < 8) {
    // 早晨：暖橙色
    return 0xFFB366
  } else if (hour >= 8 && hour < 10) {
    // 上午：浅黄色
    return 0xFFD700
  } else if (hour >= 10 && hour < 15) {
    // 中午：明亮白光
    return 0xFFFFDD
  } else if (hour >= 15 && hour < 17) {
    // 下午：金黄色
    return 0xFFD700
  } else {
    // 傍晚：橙红色
    return 0xFF8C42
  }
}

// ── Environment: Particle System ─────────────────────────────────────────────
function createParticleSystem(weatherType) {
  if (!scene) return

  // Remove existing particles
  if (particleSystem) {
    scene.remove(particleSystem)
    particleSystem.geometry.dispose()
    particleSystem.material.dispose()
    particleSystem = null
  }

  if (!weatherType) return

  let particleCount, positions, velocities, geometry, material

  if (weatherType === 'clear') {
    // 晴天：根据太阳位置创建光线效果
    const sunPos = getSunPosition()

    // 如果是夜晚，不创建光线
    if (!sunPos) {
      console.log('[HelmetTwin] 夜晚时段，不创建阳光')
      return
    }

    const { azimuth, altitude, hour } = sunPos
    const sunColor = getSunColor(hour)

    console.log(`[HelmetTwin] 太阳位置 - 方位角:${azimuth.toFixed(1)}° 高度角:${altitude.toFixed(1)}° 颜色:0x${sunColor.toString(16)}`)

    // 将方位角和高度角转换为3D坐标
    // 方位角：0°=北(+Z), 90°=东(+X), 180°=南(-Z), 270°=西(-X)
    // 高度角：0°=地平线, 90°=天顶
    const azimuthRad = (azimuth - 90) * Math.PI / 180 // 转换为数学角度（0°=+X轴）
    const altitudeRad = altitude * Math.PI / 180

    // 太阳光源距离
    const sunDistance = 15
    const sunX = Math.cos(altitudeRad) * Math.cos(azimuthRad) * sunDistance
    const sunY = Math.sin(altitudeRad) * sunDistance
    const sunZ = Math.cos(altitudeRad) * Math.sin(azimuthRad) * sunDistance

    const rayCount = 8 // 光线数量
    const rayGroup = new THREE.Group()

    for (let i = 0; i < rayCount; i++) {
      // 在太阳位置周围创建一圈光线
      const spreadAngle = (i / rayCount) * Math.PI * 2
      const spreadRadius = 2

      const rayX = sunX + Math.cos(spreadAngle) * spreadRadius
      const rayY = sunY
      const rayZ = sunZ + Math.sin(spreadAngle) * spreadRadius

      // 创建圆锥形光束
      const geometry = new THREE.ConeGeometry(0.15, 10, 8, 1, true)
      const material = new THREE.MeshBasicMaterial({
        color: sunColor,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      })

      const ray = new THREE.Mesh(geometry, material)
      ray.position.set(rayX, rayY, rayZ)

      // 让光束指向头盔中心
      const helmetY = 3.5
      ray.lookAt(0, helmetY, 0)
      ray.rotateX(Math.PI / 2) // 调整方向使圆锥正确朝向

      rayGroup.add(ray)
    }

    particleSystem = rayGroup
    particleSystem.userData.weatherType = 'clear'
    particleSystem.userData.sunPosition = sunPos
    scene.add(particleSystem)
  } else {
    // 雨雪效果
    particleCount = weatherType === 'snow' ? 1000 : 1500
    positions = new Float32Array(particleCount * 3)
    velocities = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30
      positions[i * 3 + 1] = Math.random() * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30
      velocities[i] = weatherType === 'snow' ? 0.02 + Math.random() * 0.03 : 0.1 + Math.random() * 0.15
    }

    geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1))

    material = new THREE.PointsMaterial({
      color: weatherType === 'snow' ? 0xffffff : 0x88ccff,
      size: weatherType === 'snow' ? 0.15 : 0.08,
      transparent: true,
      opacity: weatherType === 'snow' ? 0.8 : 0.6,
      blending: THREE.AdditiveBlending
    })

    particleSystem = new THREE.Points(geometry, material)
    particleSystem.userData.weatherType = weatherType
    scene.add(particleSystem)
  }
}

function updateParticles() {
  if (!particleSystem) return

  const weatherType = particleSystem.userData.weatherType

  if (weatherType === 'clear') {
    // 晴天：光线缓慢旋转
    particleSystem.rotation.y += 0.001
  } else {
    // 雨雪效果
    const positions = particleSystem.geometry.attributes.position.array
    const velocities = particleSystem.geometry.attributes.velocity.array

    for (let i = 0; i < positions.length / 3; i++) {
      positions[i * 3 + 1] -= velocities[i]

      // Reset particle when it falls below ground
      if (positions[i * 3 + 1] < 0) {
        positions[i * 3 + 1] = 20
        positions[i * 3] = (Math.random() - 0.5) * 30
        positions[i * 3 + 2] = (Math.random() - 0.5) * 30
      }
    }

    particleSystem.geometry.attributes.position.needsUpdate = true
  }
}

// ── Environment: Wind Arrow ──────────────────────────────────────────────────

// ── Environment: Dynamic Lighting ────────────────────────────────────────────
function updateDynamicLighting(weatherText) {
  if (!scene || !rimLight) return

  const hour = new Date().getHours()

  // Time-based lighting
  let intensity = 0.8
  let color = 0xffffff

  if (hour >= 6 && hour < 8) {
    // Dawn
    intensity = 0.5
    color = 0xffaa88
  } else if (hour >= 8 && hour < 17) {
    // Day
    intensity = 0.8
    color = 0xffffff
  } else if (hour >= 17 && hour < 19) {
    // Dusk
    intensity = 0.6
    color = 0xff8844
  } else {
    // Night
    intensity = 0.3
    color = 0x6688cc
  }

  // Weather-based adjustment
  if (weatherText) {
    if (/晴/.test(weatherText)) {
      // 晴天：增强光照，更明亮
      intensity *= 1.3
      rimLight.intensity = 2.0
      rimLight.color.setHex(0xffd700)
    } else if (/阴|多云/.test(weatherText)) {
      intensity *= 0.7
      rimLight.intensity = 1.2
    } else if (/雨|雪/.test(weatherText)) {
      intensity *= 0.5
      color = 0x8899aa
      rimLight.intensity = 0.8
      rimLight.color.setHex(0x88ccff)
    } else if (/雾|霾/.test(weatherText)) {
      intensity *= 0.4
      color = 0xaaaaaa
      rimLight.intensity = 0.6
    }
  }

  // Update directional light
  const dirLight = scene.children.find(c => c.type === 'DirectionalLight')
  if (dirLight) {
    dirLight.intensity = intensity
    dirLight.color.setHex(color)
  }

  // Update ambient light
  const ambLight = scene.children.find(c => c.type === 'AmbientLight')
  if (ambLight) {
    ambLight.intensity = intensity * 0.5
  }
}

// ── Init main Three.js scene ─────────────────────────────────────────────────
function initScene() {
  const canvas = canvasRef.value
  const parent = canvas.parentElement
  // 从父容器读取尺寸
  const w = parent?.clientWidth || 600
  const h = parent?.clientHeight || 400
  console.log('[HelmetTwin] initScene - canvas尺寸:', w, 'x', h)

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0f1624) // 和姿态卡片背景协调的深蓝色

  camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 200)
  camera.position.set(0, 4, 8)
  console.log('[HelmetTwin] 相机位置:', camera.position.x, camera.position.y, camera.position.z)

  // 普通渲染器（不需要透明）
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true

  controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 3.5, 0)
  controls.minDistance = 3
  controls.maxDistance = 20
  controls.enableDamping = true
  controls.autoRotate = false

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.4))
  const dir = new THREE.DirectionalLight(0xffffff, 0.8)
  dir.position.set(5, 10, 5)
  dir.castShadow = true
  scene.add(dir)
  rimLight = new THREE.PointLight(0x00D9FF, 1.5, 15)
  rimLight.position.set(-3, 5, -3)
  scene.add(rimLight)

  // 添加坐标平面（浅色平面作为坐标系背景）
  const planeGeometry = new THREE.PlaneGeometry(6, 6)
  const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a2a3a,
    roughness: 0.8,
    metalness: 0.2
  })
  coordinatePlane = new THREE.Mesh(planeGeometry, planeMaterial)
  coordinatePlane.rotation.x = -Math.PI / 2
  coordinatePlane.position.y = 0.5
  coordinatePlane.receiveShadow = true
  scene.add(coordinatePlane)

  // 添加坐标系辅助器（显示XYZ轴）- 放大尺寸
  axesHelper = new THREE.AxesHelper(4) // 轴长度为4，超过头盔
  axesHelper.position.set(0, 0.5, 0) // 放在坐标平面上
  scene.add(axesHelper)

  // Load helmet model
  new GLTFLoader().load('/models/black_helmet.glb', (gltf) => {
    helmetMesh = gltf.scene
    helmetMesh.position.set(0, 3.5, 0)
    helmetMesh.scale.setScalar(1.8)
    console.log('[HelmetTwin] 头盔加载 - 位置:', helmetMesh.position.x, helmetMesh.position.y, helmetMesh.position.z, '缩放:', 1.8)
    helmetMesh.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true } })
    scene.add(helmetMesh)

    // 添加头盔正面聚光灯
    const frontLight = new THREE.SpotLight(0xffffff, 2)
    frontLight.position.set(0, 3.5, 5) // 在头盔正前方
    frontLight.target = helmetMesh
    frontLight.angle = Math.PI / 6
    frontLight.penumbra = 0.3
    frontLight.decay = 2
    frontLight.distance = 10
    scene.add(frontLight)

    loading.value = false
  }, undefined, () => { loading.value = false })

  console.log('[HelmetTwin] 相机初始化', camera.position, w, h)

  function animate() {
    animFrameId = requestAnimationFrame(animate)
    controls.update()
    updateParticles()

    // 头盔保持固定位置，不移动

    renderer.render(scene, camera)
  }
  animate()
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

  // Apply rotation to helmet (只使用 roll 和 pitch)
  if (helmetMesh) {
    helmetMesh.rotation.z = -r * Math.PI / 180
    helmetMesh.rotation.x = p * Math.PI / 180
  }

  // Risk-based rim light color
  if (rimLight) {
    const rs = riskScore.value
    rimLight.color.set(rs >= 70 ? 0xFF4757 : rs >= 40 ? 0xFFD93D : 0x00D9FF)
  }

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

// ── Watch weather data ───────────────────────────────────────────────────────
watch(() => props.weatherData, (data) => {
  if (!data || !scene) return

  console.log('[HelmetTwin] 天气数据更新:', data)

  // Update dynamic lighting
  updateDynamicLighting(data.text)

  // Create particle system based on weather
  let weatherType = null
  if (/雪/.test(data.text)) {
    weatherType = 'snow'
  } else if (/雨/.test(data.text)) {
    weatherType = 'rain'
  } else if (/晴/.test(data.text)) {
    weatherType = 'clear'
  }

  if (weatherType) {
    createParticleSystem(weatherType)
  }
}, { deep: true })

// ── Resize ───────────────────────────────────────────────────────────────────
function onResize() {
  if (!renderer || !canvasRef.value) return
  const canvas = canvasRef.value
  const parent = canvas.parentElement
  console.log('[HelmetTwin] 父容器尺寸', parent?.clientWidth, parent?.clientHeight)

  // 从父容器读取尺寸，而不是从 canvas
  const w = parent?.clientWidth || canvas.clientWidth || 600
  const h = parent?.clientHeight || canvas.clientHeight || 400

  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
  console.log('[HelmetTwin] Canvas resize', w, h)
}

// ── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  initScene()
  initBaiduMap3D() // 初始化百度3D地图

  // 初始化仪表盘
  setTimeout(() => {
    initGauges()
  }, 100)

  window.addEventListener('resize', onResize)

  // Initialize dynamic lighting
  setTimeout(() => {
    updateDynamicLighting(props.weatherData?.text)
  }, 500)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  cancelAnimationFrame(animFrameId)
  renderer?.dispose()
})

defineExpose({ onResize })
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

/* 左右两个面板各占一半 */
.twin-split-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(26, 42, 58, 0.3);
  border: 1px solid rgba(0, 217, 255, 0.2);
  border-radius: 8px;
  overflow: hidden;
  min-width: 0;
}

/* 头盔视图包装器 */
.helmet-view-wrap {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 0;
}

.helmet-view-wrap .twin-canvas {
  width: 100%;
  height: 100%;
  display: block;
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
