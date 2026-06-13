<template>
  <div class="dsv">
    <!-- 顶部栏 -->
    <div class="dsv__header">
      <button class="dsv__back" @click="goBack">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        返回
      </button>
      <div class="dsv__title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        设备状态 · 神经中枢
        <span class="dsv__substat">
          <span class="dsv__substat-item">运行 <b>{{ formatUptime(liveUptime) }}</b></span>
          <span class="dsv__substat-sep"></span>
          <span class="dsv__substat-item"><b :style="{ color: readyCount > 0 ? '#4ade80' : '#5A6B7C' }">{{ readyCount }}/{{ nodes.length }}</b> 在线</span>
        </span>
      </div>
      <div class="dsv__conn" :class="connStateClass">
        <i></i>{{ connStateText }}
        <span v-if="lastUpdateAt" class="dsv__conn-age">· {{ ageText(staleSeconds) }}</span>
      </div>
    </div>

    <!-- 可视化主舞台 -->
    <div class="dsv__stage" ref="stageRef">
      <!-- 粒子/连线 Canvas（铺满，置于节点下层） -->
      <canvas ref="fxCanvasRef" class="dsv__fx"></canvas>

      <!-- 中央 3D 头盔（不再有束缚的圆圈蒙版，头盔可跃出雷达波纹） -->
      <div class="dsv__core" :style="coreStyle">
        <div class="dsv__core-glow"></div>
        <canvas ref="helmetCanvasRef" class="dsv__helmet"></canvas>
        <div class="dsv__core-base"></div>
      </div>

      <!-- 传感器节点（环形排布，绝对定位由 JS 计算） -->
      <div
        v-for="(node, i) in nodes"
        :key="node.key"
        class="dsv__node"
        :class="[`dsv__node--${node.level}`, { 'dsv__node--flash': justUpdated }]"
        :style="nodeStyle(i)"
      >
        <div class="dsv__node-corner"></div>
        <!-- 上：图标 + 名称 -->
        <div class="dsv__node-head">
          <div class="dsv__node-icon" v-html="node.icon"></div>
          <span class="dsv__node-label">{{ node.label }}</span>
        </div>
        <!-- 分割线 -->
        <div class="dsv__node-divider"></div>
        <!-- 下：状态 + 微图表 -->
        <div class="dsv__node-foot">
          <span class="dsv__node-status" :style="{ color: node.color }">
            <i class="dsv__node-dot" :class="{ 'dsv__node-dot--breath': node.level === 'ready' }" :style="{ background: node.color }"></i>{{ node.text }}
          </span>
          <div class="dsv__node-chart">
            <!-- 电源：分格电池 -->
            <div v-if="node.key === 'power' && battery != null" class="dsv__battery" :class="batteryClass">
              <span v-for="seg in 5" :key="seg" class="dsv__battery-seg" :class="{ on: seg <= Math.ceil(battery / 20) }"></span>
            </div>
            <!-- MAX 心率血氧：伪 ECG 折线 -->
            <svg v-else-if="node.key === 'max'" class="dsv__ecg" viewBox="0 0 80 18" preserveAspectRatio="none">
              <polyline :stroke="node.color" points="0,9 12,9 16,3 20,15 24,9 40,9 44,5 48,13 52,9 80,9"/>
            </svg>
            <!-- MPU 姿态：XYZ 微坐标 -->
            <svg v-else-if="node.key === 'mpu'" class="dsv__axes" viewBox="0 0 40 18">
              <line x1="6" y1="14" x2="6" y2="3" :stroke="node.color"/><text x="2" y="3" :fill="node.color">Y</text>
              <line x1="6" y1="14" x2="20" y2="14" :stroke="node.color"/><text x="22" y="16" :fill="node.color">X</text>
              <line x1="6" y1="14" x2="15" y2="7" :stroke="node.color"/><text x="16" y="6" :fill="node.color">Z</text>
            </svg>
            <!-- WiFi：信号格 -->
            <div v-else-if="node.key === 'wifi'" class="dsv__bars">
              <span v-for="b in 4" :key="b" :style="{ height: (b * 3 + 2) + 'px', background: node.level === 'ready' ? node.color : 'rgba(255,255,255,0.15)' }"></span>
            </div>
            <!-- 默认：细进度条 -->
            <div v-else class="dsv__minibar"><i :style="{ background: node.color, width: node.level === 'ready' ? '100%' : node.level === 'init' ? '45%' : '15%' }"></i></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图例 -->
    <div class="dsv__legend">
      <span v-for="lg in legend" :key="lg.text" class="dsv__legend-item">
        <i :style="{ background: lg.color }"></i>{{ lg.text }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import request from '@/utils/request'
import { useWebSocket } from '@/composables/useWebSocket.js'

const router = useRouter()
function goBack() { router.back() }

// ── 状态数据 ───────────────────────────────────────────────
const status = ref(null)          // DeviceStatus payload
const battery = ref(null)         // 来自 SensorData
const connected = ref(false)

// 运行时间本地自增：记录基准 uptime 与收到时的时间戳
const baseUptime = ref(null)      // 最近一次上报的 uptime（秒）
const baseAt = ref(0)             // 收到该 uptime 时的本地时间戳
const nowTick = ref(Date.now())   // 每秒驱动的当前时间，供 uptime/陈旧度计算
const lastUpdateAt = ref(0)       // 最后一次收到 Status 的本地时间戳

const STALE_MS = 30000            // 超过 30s 未更新视为数据陈旧

// 当前显示的运行时间 = 基准 + 经过的秒数
const liveUptime = computed(() => {
  if (baseUptime.value == null) return null
  return baseUptime.value + Math.floor((nowTick.value - baseAt.value) / 1000)
})

// 距上次更新的秒数；从未更新返回 null
const staleSeconds = computed(() => {
  if (!lastUpdateAt.value) return null
  return Math.floor((nowTick.value - lastUpdateAt.value) / 1000)
})
const isStale = computed(() => staleSeconds.value != null && staleSeconds.value * 1000 > STALE_MS)

// 顶部连接指示：未连接 / 数据陈旧 / 实时同步
const connStateClass = computed(() => {
  if (!connected.value) return 'dsv__conn--off'
  if (isStale.value) return 'dsv__conn--warn'
  return 'dsv__conn--on'
})
const connStateText = computed(() => {
  if (!connected.value) return '等待连接'
  if (isStale.value) return '数据可能过期'
  return '实时同步'
})

function ageText(sec) {
  if (sec == null) return '从未'
  if (sec < 60) return sec + ' 秒前'
  if (sec < 3600) return Math.floor(sec / 60) + ' 分前'
  return Math.floor(sec / 3600) + ' 时前'
}

// 收到新 Status 时刷新基准
function markStatusUpdate(payload) {
  status.value = payload
  lastUpdateAt.value = Date.now()
  if (payload && payload.uptime != null) {
    baseUptime.value = Number(payload.uptime)
    baseAt.value = Date.now()
  }
}

const STATUS_MAP = {
  0: { text: '未初始化', color: '#7c93a8', level: 'idle' },
  1: { text: '初始化中', color: '#facc15', level: 'init' },
  2: { text: '就绪',     color: '#4ade80', level: 'ready' },
  3: { text: '错误',     color: '#f87171', level: 'error' },
  4: { text: '超时',     color: '#fb923c', level: 'error' },
  5: { text: '断开连接', color: '#f87171', level: 'error' }
}
function info(code) {
  if (code == null) return { text: '无数据', color: '#7c93a8', level: 'idle' }
  return STATUS_MAP[code] || { text: '未知', color: '#7c93a8', level: 'idle' }
}

const legend = [
  { text: '就绪', color: '#4ade80' },
  { text: '初始化中', color: '#facc15' },
  { text: '错误/超时', color: '#f87171' },
  { text: '未初始化', color: '#9ca3af' }
]

const ICONS = {
  mpu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><rect x="7" y="7" width="10" height="10" rx="2"/><circle cx="12" cy="12" r="2"/></svg>',
  wifi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12.55a11 11 0 0 1 14 0M8.5 16.11a6 6 0 0 1 7 0M2 8.82a15 15 0 0 1 20 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>',
  gps: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  dht: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>',
  max: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
  power: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="10" x2="23" y2="14"/></svg>'
}

// 6 个节点：电源用 battery 推导状态（有电量=就绪，无数据=未初始化）
const nodes = computed(() => {
  const s = status.value || {}
  const mk = (key, label, icon, code) => {
    const it = info(code)
    return { key, label, icon, ...it }
  }
  const powerCode = battery.value != null ? 2 : 0
  const powerNode = mk('power', '电源电量', ICONS.power, powerCode)
  if (battery.value != null) powerNode.text = battery.value + '%'
  return [
    mk('mpu',  'MPU6050 姿态',  ICONS.mpu,  s.mpu6050Status),
    mk('wifi', 'WiFi 网络',     ICONS.wifi, s.wifiStatus),
    mk('gps',  'GPS 定位',      ICONS.gps,  s.gpsStatus),
    mk('dht',  'DHT11 温湿度',  ICONS.dht,  s.dhtStatus),
    mk('max',  'MAX 心率血氧',  ICONS.max,  s.maxStatus),
    powerNode
  ]
})

const readyCount = computed(() => nodes.value.filter(n => n.level === 'ready').length)

// 电池配色：低电变橙/红
const batteryClass = computed(() => {
  const b = battery.value
  if (b == null) return ''
  if (b <= 20) return 'dsv__battery--low'
  if (b <= 50) return 'dsv__battery--mid'
  return ''
})

function formatUptime(sec) {
  if (sec == null) return '-- 运行时间'
  let s = Number(sec)
  if (!isFinite(s) || s < 0) return '-- 运行时间'
  const d = Math.floor(s / 86400); s -= d * 86400
  const h = Math.floor(s / 3600);  s -= h * 3600
  const m = Math.floor(s / 60);    s -= m * 60
  const parts = []
  if (d) parts.push(d + '天')
  if (h || d) parts.push(h + '时')
  parts.push(m + '分')
  return parts.join('')
}

// ── 节点环形布局 ───────────────────────────────────────────
const stageRef = ref(null)
const layout = ref({ w: 0, h: 0, cx: 0, cy: 0, radius: 0 })
const uiScale = ref(1)            // 随舞台尺寸缩放头盔与卡片

function recomputeLayout() {
  const el = stageRef.value
  if (!el) return
  const w = el.clientWidth, h = el.clientHeight
  const minDim = Math.min(w, h)
  // 以 760px 为基准，小屏等比缩小，范围 0.62~1.1
  uiScale.value = Math.max(0.62, Math.min(1.1, minDim / 760))
  layout.value = {
    w, h,
    cx: w / 2,
    cy: h / 2,
    radius: minDim * 0.42
  }
}

// 第 i 个节点的角度（从正上方开始顺时针均分）
function nodeAngle(i) {
  const n = nodes.value.length
  return -Math.PI / 2 + (i / n) * Math.PI * 2
}
function nodePos(i) {
  const { cx, cy, radius } = layout.value
  const a = nodeAngle(i)
  return { x: cx + Math.cos(a) * radius, y: cy + Math.sin(a) * radius }
}
function nodeStyle(i) {
  const p = nodePos(i)
  return { left: p.x + 'px', top: p.y + 'px', transform: `translate(-50%, -50%) scale(${uiScale.value})` }
}

// 头盔光环亮度随就绪数变化 + 随舞台缩放
const coreStyle = computed(() => {
  const ratio = nodes.value.length ? readyCount.value / nodes.value.length : 0
  return {
    '--glow': (0.3 + ratio * 0.7).toFixed(2),
    transform: `translate(-50%, -50%) scale(${uiScale.value})`
  }
})

// ── Three.js 3D 头盔 ───────────────────────────────────────
const helmetCanvasRef = ref(null)
let renderer = null, scene = null, camera = null, helmet = null, animId = null
let wireframe = null          // 线框叠加层

function initHelmet3D() {
  const canvas = helmetCanvasRef.value
  if (!canvas) return
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio || 1)
  renderer.setSize(300, 300, false)
  renderer.setClearColor(0x000000, 0)

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
  camera.position.set(0, 0, 3)
  camera.lookAt(0, 0, 0)

  scene.add(new THREE.AmbientLight(0xffffff, 0.7))
  const dir = new THREE.DirectionalLight(0x9fe8ff, 1.5)
  dir.position.set(2, 4, 3)
  scene.add(dir)
  const fill = new THREE.DirectionalLight(0xffffff, 0.5)
  fill.position.set(-2, -1, -2)
  scene.add(fill)
  // 边缘光（Rim Light）：从背后/上方打青白光，勾勒顶部和两侧轮廓
  const rim = new THREE.DirectionalLight(0x66f0ff, 2.4)
  rim.position.set(0, 2, -4)
  scene.add(rim)
  const rimL = new THREE.DirectionalLight(0x4fd8ff, 1.4)
  rimL.position.set(-4, 1, -1)
  scene.add(rimL)
  const rimR = new THREE.DirectionalLight(0x4fd8ff, 1.4)
  rimR.position.set(4, 1, -1)
  scene.add(rimR)

  new GLTFLoader().load('/models/envoy.glb', (gltf) => {
    const model = gltf.scene
    const box = new THREE.Box3().setFromObject(model)
    const center = new THREE.Vector3(); box.getCenter(center)
    const size = new THREE.Vector3(); box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 1.3 / maxDim
    model.scale.setScalar(scale)
    model.position.set(-center.x * scale, -center.y * scale, -center.z * scale)

    // 实体材质加一点青色自发光，提升质感
    model.traverse((o) => {
      if (o.isMesh && o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material]
        mats.forEach((m) => {
          if (m.emissive) { m.emissive.setHex(0x123a44); m.emissiveIntensity = 0.8 }
          if ('metalness' in m) m.metalness = 0.6
          if ('roughness' in m) m.roughness = 0.4
        })
      }
    })

    // 半透明青色线框叠加层（全息感）
    const wireGroup = new THREE.Group()
    model.traverse((o) => {
      if (o.isMesh && o.geometry) {
        const wf = new THREE.Mesh(
          o.geometry,
          new THREE.MeshBasicMaterial({ color: 0x4fe9ff, wireframe: true, transparent: true, opacity: 0.12 })
        )
        wf.position.copy(o.position); wf.rotation.copy(o.rotation); wf.scale.copy(o.scale)
        o.getWorldQuaternion(wf.quaternion)
        wireGroup.add(wf)
      }
    })
    model.add(wireGroup)
    wireframe = wireGroup

    const camDist = (1.3 / 2) / Math.tan(THREE.MathUtils.degToRad(45) / 2) * 1.3
    camera.position.set(0, 0, camDist)
    camera.lookAt(0, 0, 0)
    scene.add(model)
    helmet = model
  }, undefined, (e) => console.warn('[DeviceStatus] 模型加载失败', e))

  renderLoop()
}

function renderLoop() {
  animId = requestAnimationFrame(renderLoop)
  if (paused) return
  // 头盔固定朝前，不旋转
  if (helmet) helmet.rotation.set(0, 0, 0)
  if (renderer && scene && camera) renderer.render(scene, camera)
}

// ── 粒子 / 连线引擎 ────────────────────────────────────────
const fxCanvasRef = ref(null)
let fxCtx = null, fxAnimId = null, dpr = 1
let particles = []     // {nodeIndex, t, speed} 数据流光点
let bgDots = []        // 背景悬浮粒子
let frame = 0          // 全局帧计数，用于雷达波纹相位
let paused = false     // 页面切到后台时暂停动画
let tickTimer = null   // 每秒计时器
let glowSprite = null  // 预渲染的光点 sprite（性能优化）

// 切后台暂停动画，回前台恢复，避免无谓的 CPU/GPU 占用
function onVisibility() {
  paused = document.hidden
}

// 预渲染一张白色径向渐变光点，绘制时按颜色叠加，避免每帧 createRadialGradient
function buildGlowSprite() {
  const size = 32
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.beginPath(); g.arc(size/2, size/2, size/2, 0, Math.PI*2); g.fill()
  glowSprite = c
}

function initFx() {
  const canvas = fxCanvasRef.value
  if (!canvas) return
  dpr = window.devicePixelRatio || 1
  fxCtx = canvas.getContext('2d')
  buildGlowSprite()
  resizeFx()
  spawnParticles()
  spawnBgDots()
  fxLoop()
}

function resizeFx() {
  const canvas = fxCanvasRef.value
  if (!canvas || !stageRef.value) return
  const w = stageRef.value.clientWidth, h = stageRef.value.clientHeight
  canvas.width = w * dpr
  canvas.height = h * dpr
  canvas.style.width = w + 'px'
  canvas.style.height = h + 'px'
  fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
  spawnBgDots()
}

// 背景悬浮粒子（缓慢上升的微光点）
function spawnBgDots() {
  const { w, h } = layout.value
  if (!w || !h) return
  const n = Math.round((w * h) / 26000)
  bgDots = Array.from({ length: n }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: 0.5 + Math.random() * 1.3,
    vy: 0.08 + Math.random() * 0.22,
    a: 0.1 + Math.random() * 0.35
  }))
}

// 每个就绪/初始化节点维持若干流光点；错误/未初始化不产
function spawnParticles() {
  particles = []
  nodes.value.forEach((node, i) => {
    let count = 0, speedBase = 0
    if (node.level === 'ready')      { count = 10; speedBase = 0.011 }
    else if (node.level === 'init')  { count = 4;  speedBase = 0.005 }
    for (let k = 0; k < count; k++) {
      particles.push({ nodeIndex: i, t: k / count, speed: speedBase * (0.7 + Math.random() * 0.6) })
    }
  })
}

function fxLoop() {
  fxAnimId = requestAnimationFrame(fxLoop)
  const ctx = fxCtx
  if (!ctx || paused) return
  frame++
  const { cx, cy, w, h } = layout.value
  ctx.clearRect(0, 0, w, h)

  // 0) 背景悬浮粒子
  bgDots.forEach(d => {
    d.y -= d.vy
    if (d.y < -4) { d.y = h + 4; d.x = Math.random() * w }
    ctx.fillStyle = `rgba(120,200,255,${d.a})`
    ctx.beginPath()
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
    ctx.fill()
  })

  // 1) 雷达波纹：从中心缓慢向外扩散的同心圆（由内向外渐淡）
  const maxR = Math.min(w, h) * 0.46
  const waveCount = 3
  for (let i = 0; i < waveCount; i++) {
    const phase = ((frame * 0.0016) + i / waveCount) % 1
    const rr = phase * maxR
    const alpha = (1 - phase) * 0.22 * (0.4 + readyCount.value / Math.max(1, nodes.value.length) * 0.6)
    ctx.beginPath()
    ctx.arc(cx, cy, rr, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(0,217,255,${alpha})`
    ctx.lineWidth = 1
    ctx.stroke()
  }
  // 静态参考圈：内圈实线、外圈虚线且缓慢旋转
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, maxR * 0.42, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(0,217,255,0.16)'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.translate(cx, cy)
  ctx.rotate(frame * 0.003)
  ctx.beginPath()
  ctx.arc(0, 0, maxR * 0.74, 0, Math.PI * 2)
  ctx.setLineDash([4, 14])
  ctx.strokeStyle = 'rgba(0,217,255,0.18)'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.setLineDash([])
  ctx.restore()

  // 2) 连线 + 节点端锚点
  nodes.value.forEach((node, i) => {
    const p = nodePos(i)
    if (node.level === 'idle') return // 未初始化无连线
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    ctx.lineTo(cx, cy)
    if (node.level === 'error') {
      ctx.setLineDash([5, 8])
      ctx.strokeStyle = 'rgba(248,113,113,0.45)'
      ctx.lineWidth = 1
    } else {
      ctx.setLineDash([])
      ctx.strokeStyle = node.level === 'ready' ? 'rgba(74,222,128,0.20)' : 'rgba(250,204,21,0.18)'
      ctx.lineWidth = 1.2
    }
    ctx.stroke()
    ctx.setLineDash([])
    // 锚点：连线靠节点一端画一个空心圆 + 小十字，增加精密仪器感
    const col = node.level === 'error' ? '248,113,113' : node.level === 'ready' ? '74,222,128' : '250,204,21'
    // 锚点位置略微朝中心偏移，避免被卡片盖住
    const ax = p.x + (cx - p.x) * 0.085
    const ay = p.y + (cy - p.y) * 0.085
    ctx.strokeStyle = `rgba(${col},0.7)`
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.arc(ax, ay, 3.2, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(ax - 5.5, ay); ctx.lineTo(ax - 3.2, ay)
    ctx.moveTo(ax + 3.2, ay); ctx.lineTo(ax + 5.5, ay)
    ctx.moveTo(ax, ay - 5.5); ctx.lineTo(ax, ay - 3.2)
    ctx.moveTo(ax, ay + 3.2); ctx.lineTo(ax, ay + 5.5)
    ctx.stroke()
  })

  // 3) 数据流光束：带高亮头部的光点从节点流向头盔中心
  particles.forEach(pt => {
    const node = nodes.value[pt.nodeIndex]
    if (!node || (node.level !== 'ready' && node.level !== 'init')) return
    pt.t += pt.speed
    if (pt.t > 1) pt.t -= 1
    const p = nodePos(pt.nodeIndex)
    const e = pt.t * pt.t           // 靠近中心加速
    const x = p.x + (cx - p.x) * e
    const y = p.y + (cy - p.y) * e
    // 拖尾：朝节点方向回退一小段
    const tailT = Math.max(0, e - 0.06)
    const tx = p.x + (cx - p.x) * tailT
    const ty = p.y + (cy - p.y) * tailT
    const color = node.level === 'ready' ? '120,255,170' : '255,224,90'
    const alpha = (1 - pt.t) * 0.85 + 0.15
    // 光束拖尾
    const lg = ctx.createLinearGradient(tx, ty, x, y)
    lg.addColorStop(0, `rgba(${color},0)`)
    lg.addColorStop(1, `rgba(${color},${alpha})`)
    ctx.strokeStyle = lg
    ctx.lineWidth = node.level === 'ready' ? 2 : 1.4
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke()
    // 高亮头部光点：白色光晕 sprite（缓存，避免每帧 createRadialGradient）+ 中心实色点
    const r = node.level === 'ready' ? 2.6 : 1.9
    const d = r * 6
    if (glowSprite) {
      ctx.globalAlpha = alpha
      ctx.drawImage(glowSprite, x - d / 2, y - d / 2, d, d)
      ctx.globalAlpha = 1
    }
    ctx.fillStyle = `rgba(${color},${alpha})`
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
  })
}

// ── 数据接入 ───────────────────────────────────────────────
const { isConnected, connect, disconnect, setOnSensorData, setOnDeviceStatus } = useWebSocket()

function onResize() {
  recomputeLayout()
  resizeFx()
}

onMounted(async () => {
  await nextTick()
  recomputeLayout()
  initHelmet3D()
  initFx()
  window.addEventListener('resize', onResize)

  // 初始拉取
  try {
    const res = await request.get('/api/device/status')
    if (res.data && res.data.deviceId) { markStatusUpdate(res.data); spawnParticles() }
  } catch {}
  try {
    const res = await request.get('/api/sensor/latest-db')
    if (res.data && res.data.battery != null) battery.value = Number(res.data.battery)
  } catch {}

  // 实时
  setOnDeviceStatus((payload) => { markStatusUpdate(payload); spawnParticles(); pulseUpdate() })
  setOnSensorData((payload) => {
    if (payload && payload.battery != null) battery.value = Number(payload.battery)
  })
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  connect(`${wsProtocol}//${window.location.host}/ws/sensor-data`)

  // 每秒驱动 uptime 自增 + 陈旧度计算
  tickTimer = setInterval(() => { nowTick.value = Date.now() }, 1000)
  document.addEventListener('visibilitychange', onVisibility)
})

// 数据更新时让节点边缘闪一下
const justUpdated = ref(false)
let updateTimer = null
function pulseUpdate() {
  justUpdated.value = true
  if (updateTimer) clearTimeout(updateTimer)
  updateTimer = setTimeout(() => { justUpdated.value = false }, 700)
}

// 同步 WS 连接状态到本地 connected
watch(() => isConnected.value, (v) => { connected.value = v }, { immediate: true })

onUnmounted(() => {
  disconnect()
  window.removeEventListener('resize', onResize)
  document.removeEventListener('visibilitychange', onVisibility)
  if (updateTimer) clearTimeout(updateTimer)
  if (tickTimer) clearInterval(tickTimer)
  if (animId) cancelAnimationFrame(animId)
  if (fxAnimId) cancelAnimationFrame(fxAnimId)
  if (renderer) renderer.dispose()
  renderer = null; scene = null; camera = null; helmet = null; wireframe = null
})

</script>

<style scoped>
.dsv {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(ellipse 60% 50% at 50% 44%, rgba(0,150,200,0.16), transparent 70%),
    radial-gradient(circle at 50% 120%, rgba(0,60,90,0.25), transparent 60%),
    radial-gradient(circle, rgba(56,189,248,0.035) 1px, transparent 1px),
    #03060d;
  background-size: auto, auto, 28px 28px, auto;
  color: #fff;
  overflow: hidden;
  font-family: 'Share Tech Mono', 'Rajdhani', 'Consolas', ui-monospace, monospace;
}
/* 四角压黑，制造聚光灯/深空感（位于粒子层之上、节点之下） */
.dsv__stage::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse 80% 70% at 50% 50%, transparent 58%, rgba(0,0,0,0.5) 100%);
  z-index: 2;
}

/* 顶部栏 */
.dsv__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(0,217,255,0.12);
  z-index: 10;
}
.dsv__back {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(0,217,255,0.10);
  color: #00D9FF;
  border: 1px solid rgba(0,217,255,0.25);
  border-radius: 6px;
  padding: 7px 14px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}
.dsv__back:hover { background: rgba(0,217,255,0.22); }
.dsv__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #fff;
}
.dsv__substat {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 14px;
  padding-left: 14px;
  border-left: 1px solid rgba(120,200,255,0.2);
  font-size: 12px;
  color: #7c93a8;
  letter-spacing: 0.04em;
}
.dsv__substat b {
  font-family: 'Share Tech Mono', monospace;
  color: #4fe9ff;
  font-weight: 700;
  text-shadow: 0 0 6px rgba(0,217,255,0.4);
}
.dsv__substat-sep { width: 1px; height: 12px; background: rgba(120,200,255,0.2); }
.dsv__conn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 20px;
}
.dsv__conn i { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
.dsv__conn--on  { background: rgba(74,222,128,0.12); color: #4ade80; }
.dsv__conn--on i  { background: #4ade80; box-shadow: 0 0 6px #4ade80; animation: pulse 1.5s infinite; }
.dsv__conn--warn { background: rgba(251,146,60,0.14); color: #fb923c; }
.dsv__conn--warn i { background: #fb923c; box-shadow: 0 0 6px #fb923c; animation: pulse 1s infinite; }
.dsv__conn--off { background: rgba(248,113,113,0.12); color: #f87171; }
.dsv__conn--off i { background: #f87171; }
.dsv__conn-age { color: rgba(255,255,255,0.4); font-weight: 500; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

/* 舞台 */
.dsv__stage {
  position: relative;
  flex: 1;
  overflow: hidden;
}
.dsv__fx {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

/* 中央头盔 */
.dsv__core {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
/* 头盔背后的柔光，让它从深背景里"浮"出来 */
.dsv__core-glow {
  position: absolute;
  left: 50%; top: 46%;
  width: 360px; height: 360px;
  margin: -180px 0 0 -180px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0,200,255,calc(0.26 * var(--glow,0.5))), transparent 62%);
  filter: blur(8px);
  z-index: 1;
}
.dsv__helmet {
  position: relative;
  width: 300px;
  height: 300px;
  z-index: 2;
  pointer-events: auto;
  filter: drop-shadow(0 0 14px rgba(0,200,255,0.28));
}
/* 头盔底部发光底座 + 倒影 */
.dsv__core-base {
  position: absolute;
  left: 50%;
  bottom: 30px;
  transform: translateX(-50%);
  width: 170px;
  height: 26px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(0,217,255,calc(0.55 * var(--glow,0.5))), transparent 70%);
  filter: blur(4px);
  z-index: 1;
}

/* 传感器节点 */
.dsv__node {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 4;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 13px 16px;
  width: 178px;
  background: linear-gradient(135deg, rgba(12,22,38,0.74), rgba(8,14,26,0.62));
  border: 1px solid rgba(120,200,255,0.18);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  /* HUD 斜切角 */
  clip-path: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px);
  transition: border-color 0.4s, box-shadow 0.4s;
}
/* 右上角 HUD 缺口装饰 */
.dsv__node-corner {
  position: absolute;
  top: 0; right: 0;
  width: 12px; height: 12px;
  border-top: 1px solid rgba(120,200,255,0.5);
  border-right: 1px solid rgba(120,200,255,0.5);
}
/* 上：图标 + 名称 */
.dsv__node-head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.dsv__node-icon {
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 7px;
  flex-shrink: 0;
}
.dsv__node-icon :deep(svg) { width: 20px; height: 20px; }
.dsv__node-label { font-size: 13px; font-weight: 600; letter-spacing: 0.03em; color: #b8cfe0; white-space: nowrap; }
/* 分割线 */
.dsv__node-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(120,200,255,0.28), transparent);
}
/* 下：状态 + 微图表 */
.dsv__node-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.dsv__node-status { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 700; letter-spacing: 0.03em; white-space: nowrap; }
.dsv__node-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
.dsv__node-dot--breath { animation: breath 1.6s ease-in-out infinite; }
@keyframes breath {
  0%,100% { opacity: 1; box-shadow: 0 0 5px currentColor; }
  50% { opacity: 0.4; box-shadow: 0 0 1px currentColor; }
}

/* 微图表 */
.dsv__node-chart { height: 18px; display: flex; align-items: center; flex-shrink: 0; }
.dsv__node-chart svg { filter: drop-shadow(0 0 3px rgba(79,216,255,0.4)); }
.dsv__battery { display: flex; gap: 2px; }
.dsv__battery-seg {
  width: 7px; height: 11px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 1px;
  background: transparent;
  transition: background 0.3s;
}
.dsv__battery-seg.on { background: #4ade80; border-color: #4ade80; }
.dsv__battery--mid .dsv__battery-seg.on { background: #facc15; border-color: #facc15; }
.dsv__battery--low .dsv__battery-seg.on { background: #f87171; border-color: #f87171; }
.dsv__ecg { width: 80px; height: 18px; }
.dsv__ecg polyline { fill: none; stroke-width: 1.4; opacity: 0.8; }
.dsv__axes { width: 40px; height: 18px; }
.dsv__axes line { stroke-width: 1.2; opacity: 0.8; }
.dsv__axes text { font-size: 5px; font-family: monospace; }
.dsv__bars { display: flex; align-items: flex-end; gap: 2px; height: 14px; }
.dsv__bars span { width: 4px; border-radius: 1px; display: inline-block; }
.dsv__minibar { width: 80px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; }
.dsv__minibar i { display: block; height: 100%; border-radius: 2px; transition: width 0.5s; }

/* 节点状态配色 */
.dsv__node--ready { border-color: rgba(74,222,128,0.45); box-shadow: 0 0 18px -4px rgba(74,222,128,0.45); }
.dsv__node--ready .dsv__node-icon { background: rgba(74,222,128,0.14); color: #4ade80; }
.dsv__node--init  { border-color: rgba(250,204,21,0.4); }
.dsv__node--init  .dsv__node-icon { background: rgba(250,204,21,0.14); color: #facc15; }
.dsv__node--init  .dsv__node-dot { animation: pulse 0.9s infinite; }
.dsv__node--error { border-color: rgba(248,113,113,0.45); animation: shake 0.4s ease; }
.dsv__node--error .dsv__node-icon { background: rgba(248,113,113,0.14); color: #f87171; }
.dsv__node--idle  { opacity: 0.72; }
.dsv__node--idle  .dsv__node-icon { background: rgba(124,147,168,0.14); color: #8ba3b8; }
@keyframes shake {
  0%,100% { transform: translate(-50%, -50%); }
  25% { transform: translate(calc(-50% - 2px), -50%); }
  75% { transform: translate(calc(-50% + 2px), -50%); }
}
/* 数据更新闪烁高亮 */
.dsv__node--flash { animation: nodeFlash 0.7s ease; }
@keyframes nodeFlash {
  0% { box-shadow: 0 0 0 0 rgba(0,217,255,0); }
  30% { box-shadow: 0 0 22px 2px rgba(0,217,255,0.55); border-color: rgba(0,217,255,0.7); }
  100% { box-shadow: 0 0 0 0 rgba(0,217,255,0); }
}

/* 图例 */
.dsv__legend {
  display: flex;
  justify-content: center;
  gap: 22px;
  padding: 12px;
  border-top: 1px solid rgba(0,217,255,0.1);
  z-index: 10;
}
.dsv__legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255,255,255,0.6);
}
.dsv__legend-item i { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }

/* 响应式：窄屏时顶栏换行、运行信息独占一行、图例缩小 */
@media (max-width: 680px) {
  .dsv__header { flex-wrap: wrap; gap: 8px; padding: 12px 14px; }
  .dsv__title { font-size: 13px; order: 1; flex: 1 1 auto; }
  .dsv__substat {
    margin-left: 0; padding-left: 0; border-left: none;
    order: 3; flex-basis: 100%; gap: 8px;
  }
  .dsv__back { order: 0; }
  .dsv__conn { order: 2; }
  .dsv__legend { gap: 12px; flex-wrap: wrap; padding: 8px; }
  .dsv__legend-item { font-size: 11px; }
}
</style>
