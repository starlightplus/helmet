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
      </div>
      <div class="dsv__conn" :class="connected ? 'dsv__conn--on' : 'dsv__conn--off'">
        <i></i>{{ connected ? '实时同步' : '等待连接' }}
      </div>
    </div>

    <!-- 可视化主舞台 -->
    <div class="dsv__stage" ref="stageRef">
      <!-- 粒子/连线 Canvas（铺满，置于节点下层） -->
      <canvas ref="fxCanvasRef" class="dsv__fx"></canvas>

      <!-- 中央 3D 头盔 -->
      <div class="dsv__core" :style="coreStyle">
        <div class="dsv__core-ring" :style="ringStyle"></div>
        <div class="dsv__core-ring dsv__core-ring--2" :style="ringStyle"></div>
        <canvas ref="helmetCanvasRef" class="dsv__helmet"></canvas>
        <div class="dsv__core-label">
          <span class="dsv__core-uptime">{{ formatUptime(status?.uptime) }}</span>
          <span class="dsv__core-health">{{ readyCount }}/{{ nodes.length }} 在线</span>
        </div>
      </div>

      <!-- 传感器节点（环形排布，绝对定位由 JS 计算） -->
      <div
        v-for="(node, i) in nodes"
        :key="node.key"
        class="dsv__node"
        :class="`dsv__node--${node.level}`"
        :style="nodeStyle(i)"
      >
        <div class="dsv__node-icon" v-html="node.icon"></div>
        <div class="dsv__node-info">
          <span class="dsv__node-label">{{ node.label }}</span>
          <span class="dsv__node-status" :style="{ color: node.color }">
            <i class="dsv__node-dot" :style="{ background: node.color }"></i>{{ node.text }}
          </span>
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

const STATUS_MAP = {
  0: { text: '未初始化', color: '#9ca3af', level: 'idle' },
  1: { text: '初始化中', color: '#facc15', level: 'init' },
  2: { text: '就绪',     color: '#4ade80', level: 'ready' },
  3: { text: '错误',     color: '#f87171', level: 'error' },
  4: { text: '超时',     color: '#fb923c', level: 'error' },
  5: { text: '断开连接', color: '#f87171', level: 'error' }
}
function info(code) {
  if (code == null) return { text: '无数据', color: '#6b7280', level: 'idle' }
  return STATUS_MAP[code] || { text: '未知', color: '#6b7280', level: 'idle' }
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

function recomputeLayout() {
  const el = stageRef.value
  if (!el) return
  const w = el.clientWidth, h = el.clientHeight
  layout.value = {
    w, h,
    cx: w / 2,
    cy: h / 2,
    radius: Math.min(w, h) * 0.36
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
  return { left: p.x + 'px', top: p.y + 'px' }
}

// 头盔光环亮度随就绪数变化
const coreStyle = computed(() => {
  const ratio = nodes.value.length ? readyCount.value / nodes.value.length : 0
  return { '--glow': (0.3 + ratio * 0.7).toFixed(2) }
})
const ringStyle = computed(() => {
  const ratio = nodes.value.length ? readyCount.value / nodes.value.length : 0
  const dur = (8 - ratio * 4).toFixed(1) + 's'
  return { animationDuration: dur, opacity: 0.25 + ratio * 0.5 }
})

// ── Three.js 3D 头盔 ───────────────────────────────────────
const helmetCanvasRef = ref(null)
let renderer = null, scene = null, camera = null, helmet = null, animId = null
let spinY = 0

function initHelmet3D() {
  const canvas = helmetCanvasRef.value
  if (!canvas) return
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio || 1)
  renderer.setSize(260, 260, false)
  renderer.setClearColor(0x000000, 0)

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
  camera.position.set(0, 0, 3)
  camera.lookAt(0, 0, 0)

  scene.add(new THREE.AmbientLight(0xffffff, 0.6))
  const dir = new THREE.DirectionalLight(0x00D9FF, 1.3)
  dir.position.set(2, 4, 3)
  scene.add(dir)
  const fill = new THREE.DirectionalLight(0xffffff, 0.4)
  fill.position.set(-2, -1, -2)
  scene.add(fill)

  new GLTFLoader().load('/models/envoy.glb', (gltf) => {
    const model = gltf.scene
    const box = new THREE.Box3().setFromObject(model)
    const center = new THREE.Vector3(); box.getCenter(center)
    const size = new THREE.Vector3(); box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 1.3 / maxDim
    model.scale.setScalar(scale)
    model.position.set(-center.x * scale, -center.y * scale, -center.z * scale)
    const camDist = (1.3 / 2) / Math.tan(THREE.MathUtils.degToRad(45) / 2) * 1.25
    camera.position.set(0, 0, camDist)
    camera.lookAt(0, 0, 0)
    scene.add(model)
    helmet = model
  }, undefined, (e) => console.warn('[DeviceStatus] 模型加载失败', e))

  renderLoop()
}

function renderLoop() {
  animId = requestAnimationFrame(renderLoop)
  spinY += 0.005
  if (helmet) helmet.rotation.set(0.15, spinY, 0)
  if (renderer && scene && camera) renderer.render(scene, camera)
}

// ── 粒子 / 连线引擎 ────────────────────────────────────────
const fxCanvasRef = ref(null)
let fxCtx = null, fxAnimId = null, dpr = 1
let particles = []  // {nodeIndex, t, speed}

function initFx() {
  const canvas = fxCanvasRef.value
  if (!canvas) return
  dpr = window.devicePixelRatio || 1
  fxCtx = canvas.getContext('2d')
  resizeFx()
  spawnParticles()
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
}

// 每个就绪/初始化节点维持若干粒子；错误/未初始化不产粒子
function spawnParticles() {
  particles = []
  nodes.value.forEach((node, i) => {
    let count = 0, speedBase = 0
    if (node.level === 'ready')      { count = 14; speedBase = 0.010 }
    else if (node.level === 'init')  { count = 5;  speedBase = 0.004 }
    for (let k = 0; k < count; k++) {
      particles.push({ nodeIndex: i, t: k / count, speed: speedBase * (0.7 + Math.random() * 0.6) })
    }
  })
}

function fxLoop() {
  fxAnimId = requestAnimationFrame(fxLoop)
  const ctx = fxCtx
  if (!ctx) return
  const { cx, cy } = layout.value
  ctx.clearRect(0, 0, layout.value.w, layout.value.h)

  // 1) 先画连线
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
      ctx.strokeStyle = node.level === 'ready' ? 'rgba(74,222,128,0.22)' : 'rgba(250,204,21,0.20)'
      ctx.lineWidth = 1.2
    }
    ctx.stroke()
    ctx.setLineDash([])
  })

  // 2) 再画流动粒子（从节点流向头盔中心）
  particles.forEach(pt => {
    const node = nodes.value[pt.nodeIndex]
    if (!node || (node.level !== 'ready' && node.level !== 'init')) return
    pt.t += pt.speed
    if (pt.t > 1) pt.t -= 1
    const p = nodePos(pt.nodeIndex)
    // 缓动让粒子靠近中心时加速
    const e = pt.t * pt.t
    const x = p.x + (cx - p.x) * e
    const y = p.y + (cy - p.y) * e
    const r = node.level === 'ready' ? 2.4 : 1.8
    const color = node.level === 'ready' ? '74,222,128' : '250,204,21'
    const alpha = (1 - pt.t) * 0.9 + 0.1
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 3)
    grad.addColorStop(0, `rgba(${color},${alpha})`)
    grad.addColorStop(1, `rgba(${color},0)`)
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(x, y, r * 3, 0, Math.PI * 2)
    ctx.fill()
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
    if (res.data && res.data.deviceId) { status.value = res.data; spawnParticles() }
  } catch {}
  try {
    const res = await request.get('/api/sensor/latest-db')
    if (res.data && res.data.battery != null) battery.value = Number(res.data.battery)
  } catch {}

  // 实时
  setOnDeviceStatus((payload) => { status.value = payload; spawnParticles() })
  setOnSensorData((payload) => {
    if (payload && payload.battery != null) battery.value = Number(payload.battery)
  })
  connect('ws://localhost:8082/ws/sensor-data')
})

// 同步 WS 连接状态到本地 connected
watch(() => isConnected.value, (v) => { connected.value = v }, { immediate: true })

onUnmounted(() => {
  disconnect()
  window.removeEventListener('resize', onResize)
  if (animId) cancelAnimationFrame(animId)
  if (fxAnimId) cancelAnimationFrame(fxAnimId)
  if (renderer) renderer.dispose()
  renderer = null; scene = null; camera = null; helmet = null
})

</script>

<style scoped>
.dsv {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at 50% 45%, rgba(0,217,255,0.08), transparent 60%),
    radial-gradient(circle, rgba(56,189,248,0.04) 1px, transparent 1px),
    #05080f;
  background-size: auto, 26px 26px, auto;
  color: #fff;
  overflow: hidden;
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
.dsv__conn--off { background: rgba(248,113,113,0.12); color: #f87171; }
.dsv__conn--off i { background: #f87171; }
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
}
.dsv__core-ring {
  position: absolute;
  left: 50%; top: 50%;
  width: 300px; height: 300px;
  margin: -150px 0 0 -150px;
  border: 1px solid rgba(0,217,255,0.5);
  border-radius: 50%;
  border-top-color: transparent;
  border-bottom-color: transparent;
  animation: spin 8s linear infinite;
}
.dsv__core-ring--2 {
  width: 240px; height: 240px;
  margin: -120px 0 0 -120px;
  border-color: rgba(0,217,255,0.3);
  border-left-color: transparent;
  border-right-color: transparent;
  animation-direction: reverse;
}
@keyframes spin { to { transform: rotate(360deg); } }
.dsv__core::before {
  content: '';
  position: absolute;
  left: 50%; top: 50%;
  width: 200px; height: 200px;
  margin: -100px 0 0 -100px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0,217,255,calc(0.22 * var(--glow,0.5))), transparent 68%);
  filter: blur(4px);
}
.dsv__helmet {
  position: relative;
  width: 260px;
  height: 260px;
  z-index: 2;
}
.dsv__core-label {
  position: absolute;
  bottom: -42px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  white-space: nowrap;
}
.dsv__core-uptime {
  font-family: monospace;
  font-size: 14px;
  font-weight: 700;
  color: #00D9FF;
}
.dsv__core-health {
  font-size: 11px;
  color: rgba(255,255,255,0.5);
}

/* 传感器节点 */
.dsv__node {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 13px 9px 9px;
  background: rgba(10,18,32,0.9);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  backdrop-filter: blur(6px);
  transition: border-color 0.4s, box-shadow 0.4s;
}
.dsv__node-icon {
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px;
  flex-shrink: 0;
}
.dsv__node-icon :deep(svg) { width: 18px; height: 18px; }
.dsv__node-info { display: flex; flex-direction: column; gap: 2px; }
.dsv__node-label { font-size: 12px; color: rgba(255,255,255,0.85); white-space: nowrap; }
.dsv__node-status { display: flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 700; }
.dsv__node-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }

/* 节点状态配色 */
.dsv__node--ready { border-color: rgba(74,222,128,0.45); box-shadow: 0 0 16px -4px rgba(74,222,128,0.4); }
.dsv__node--ready .dsv__node-icon { background: rgba(74,222,128,0.14); color: #4ade80; }
.dsv__node--init  { border-color: rgba(250,204,21,0.4); }
.dsv__node--init  .dsv__node-icon { background: rgba(250,204,21,0.14); color: #facc15; }
.dsv__node--init  .dsv__node-dot { animation: pulse 0.9s infinite; }
.dsv__node--error { border-color: rgba(248,113,113,0.45); animation: shake 0.4s ease; }
.dsv__node--error .dsv__node-icon { background: rgba(248,113,113,0.14); color: #f87171; }
.dsv__node--idle  { opacity: 0.55; }
.dsv__node--idle  .dsv__node-icon { background: rgba(156,163,175,0.12); color: #9ca3af; }
@keyframes shake {
  0%,100% { transform: translate(-50%, -50%); }
  25% { transform: translate(calc(-50% - 2px), -50%); }
  75% { transform: translate(calc(-50% + 2px), -50%); }
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
</style>
