<template>
  <div
    class="ai-assistant"
    :class="{ 'is-dragging': isDragging }"
    :style="{ left: pos.x + 'px', top: pos.y + 'px' }"
    @mousedown="onMouseDown"
  >
    <!-- 3D 角色容器 -->
    <div ref="containerRef" class="assistant-canvas" @click="onCanvasClick"></div>

    <!-- 对话气泡 -->
    <Transition name="bubble">
      <div v-if="showBubble" class="speech-bubble" :class="{ 'speech-bubble--below': bubbleBelow }">
        <p class="bubble-text">{{ currentMessage }}</p>
      </div>
    </Transition>

    <!-- 状态指示器 -->
    <div class="status-indicator" :class="statusClass">
      <div class="pulse-ring"></div>
      <div class="pulse-dot"></div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const props = defineProps({
  sensorData: { type: Object, default: null },
})

const emit = defineEmits(['click-model'])

const containerRef = ref(null)
const showBubble = ref(false)
const currentMessage = ref('')
const statusClass = ref('normal')

// 面板内拖拽位置（相对于右侧面板）
const pos = ref({ x: 50, y: 60 })
const isDragging = ref(false)
let dragOffsetX = 0, dragOffsetY = 0
let didDrag = false
let mouseDownX = 0, mouseDownY = 0
const DRAG_THRESHOLD = 5 // px，小于此值视为点击

// 当模型在面板上半部时，气泡显示在下方，避免超出顶部
const bubbleBelow = computed(() => {
  const panel = document.querySelector('.starfield-panel')
  if (!panel) return false
  return pos.value.y < panel.clientHeight / 2
})

function onMouseDown(e) {
  if (e.target.closest('.speech-bubble')) return
  isDragging.value = true
  didDrag = false
  mouseDownX = e.clientX
  mouseDownY = e.clientY
  const rect = e.currentTarget.getBoundingClientRect()
  dragOffsetX = e.clientX - rect.left
  dragOffsetY = e.clientY - rect.top
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(e) {
  if (!isDragging.value) return
  const dx = e.clientX - mouseDownX
  const dy = e.clientY - mouseDownY
  if (!didDrag && Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) return
  didDrag = true
  const panel = document.querySelector('.starfield-panel')
  if (!panel) return
  const panelRect = panel.getBoundingClientRect()
  const x = e.clientX - panelRect.left - dragOffsetX
  const y = e.clientY - panelRect.top - dragOffsetY
  pos.value = {
    x: Math.max(0, Math.min(x, panelRect.width - 200)),
    y: Math.max(0, Math.min(y, panelRect.height - 200)),
  }
}

function onMouseUp() {
  isDragging.value = false
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}

function onCanvasClick() {
  if (didDrag) { didDrag = false; return }
  emit('click-model')
}

let scene, camera, renderer, model, mixer, clock
let idleAction, waveAction, alertAction

function initScene() {
  if (!containerRef.value) return
  scene = new THREE.Scene()
  scene.background = null

  camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000)
  camera.position.set(0, 1, 4.2)
  camera.lookAt(0, 0.8, 0)

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
  renderer.setSize(200, 200)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))  // 限制最高1.5x，减少GPU压力
  renderer.setClearColor(0x000000, 0)
  containerRef.value.appendChild(renderer.domElement)

  const ambientLight = new THREE.AmbientLight(0xffffff, 3.0)
  scene.add(ambientLight)
  const dir1 = new THREE.DirectionalLight(0xffffff, 2.5)
  dir1.position.set(2, 3, 2); scene.add(dir1)
  const dir2 = new THREE.DirectionalLight(0xffffff, 1.5)
  dir2.position.set(-2, 2, -2); scene.add(dir2)
  const dir3 = new THREE.DirectionalLight(0xffffff, 1.0)
  dir3.position.set(0, -2, 3); scene.add(dir3)

  clock = new THREE.Clock()
  loadModel()
  animate()
}

function loadModel() {
  const loader = new GLTFLoader()
  loader.load(
    '/models/ai_assistant.glb',
    (gltf) => {
      model = gltf.scene
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())
      const scale = 2.0 / Math.max(size.x, size.y, size.z)
      model.scale.set(scale, scale, scale)
      model.position.x = -center.x * scale
      model.position.y = -center.y * scale + size.y * scale / 2 + 0.2
      model.position.z = -center.z * scale
      scene.add(model)

      if (gltf.animations?.length > 0) {
        mixer = new THREE.AnimationMixer(model)
        idleAction = mixer.clipAction(gltf.animations[0])
        if (gltf.animations.length > 1) waveAction = mixer.clipAction(gltf.animations[1])
        if (gltf.animations.length > 2) alertAction = mixer.clipAction(gltf.animations[2])
        idleAction.play()
      } else {
        startIdleAnimation()
      }

      model.traverse((child) => {
        if (child.isMesh && child.material?.transparent) {
          child.material.opacity = Math.max(child.material.opacity, 0.5)
          child.material.needsUpdate = true
        }
      })
    },
    null,
    () => createPlaceholderModel()
  )
}

function createPlaceholderModel() {
  const group = new THREE.Group()
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x00f2ff, emissive: 0x00f2ff, emissiveIntensity: 0.2 })
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.4), bodyMat)
  body.position.y = 1; group.add(body)
  const headMat = new THREE.MeshStandardMaterial({ color: 0x00f2ff, emissive: 0x00f2ff, emissiveIntensity: 0.3 })
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 32), headMat)
  head.position.y = 1.7; group.add(head)
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
  const eyeGeo = new THREE.SphereGeometry(0.05, 16, 16)
  const lEye = new THREE.Mesh(eyeGeo, eyeMat); lEye.position.set(-0.1, 1.75, 0.25); group.add(lEye)
  const rEye = new THREE.Mesh(eyeGeo, eyeMat); rEye.position.set(0.1, 1.75, 0.25); group.add(rEye)
  model = group; scene.add(model)
  startIdleAnimation()
}

function startIdleAnimation() {
  if (!model) return
  model.userData.breathe = () => {
    const t = Date.now() * 0.001
    model.position.y = Math.sin(t * 2) * 0.05 + 1
    model.rotation.y = Math.sin(t * 0.5) * 0.1
  }
}

const animations = {
  nod:     (m, p) => { m.rotation.x = Math.sin(p * Math.PI * 4) * 0.3 },
  shake:   (m, p) => { m.rotation.y = Math.sin(p * Math.PI * 6) * 0.5 },
  jump:    (m, p) => { m.position.y = 1 + Math.sin(p * Math.PI) * 0.5 },
  spin:    (m, p) => { m.rotation.y = p * Math.PI * 2 },
  vibrate: (m, p) => { m.position.x = Math.sin(p * Math.PI * 20) * 0.1; m.rotation.z = Math.sin(p * Math.PI * 20) * 0.1 },
  bounce:  (m, p) => { const s = 1 + Math.sin(p * Math.PI * 4) * 0.1; m.scale.set(s, s, s) },
}

function playProgrammaticAnimation(type, duration = 2000) {
  if (!model || !animations[type]) return
  const startTime = Date.now()
  const origPos = { ...model.position }
  const origRot = { ...model.rotation }
  const origScale = { ...model.scale }
  if (model.userData.breathe) delete model.userData.breathe
  const tick = () => {
    const progress = Math.min((Date.now() - startTime) / duration, 1)
    animations[type](model, progress)
    if (progress < 1) requestAnimationFrame(tick)
    else {
      model.position.copy(origPos)
      model.rotation.copy(origRot)
      model.scale.copy(origScale)
      startIdleAnimation()
    }
  }
  tick()
}

// 限制 30fps，避免 60fps 全速渲染浪费 GPU
let lastFrameTime = 0
const TARGET_FPS = 30
const FRAME_INTERVAL = 1000 / TARGET_FPS
let animFrameId = null
let isDestroyed = false

function animate(timestamp = 0) {
  if (isDestroyed) return
  animFrameId = requestAnimationFrame(animate)
  const delta = timestamp - lastFrameTime
  if (delta < FRAME_INTERVAL) return
  lastFrameTime = timestamp - (delta % FRAME_INTERVAL)
  if (mixer) mixer.update(clock.getDelta())
  if (model?.userData.breathe) model.userData.breathe()
  renderer.render(scene, camera)
}

function showMessage(message) {
  currentMessage.value = message
  showBubble.value = true
  setTimeout(() => { showBubble.value = false }, 3500)
}

function playAnimation(type) {
  if (type === 'wave') {
    showMessage('你好！我是灵盔AI助手 👋')
    playProgrammaticAnimation('spin', 1500)
  } else if (type === 'alert') {
    showMessage('⚠️ 检测到异常数据！请注意安全')
    statusClass.value = 'alert'
    playProgrammaticAnimation('vibrate', 1000)
    setTimeout(() => { statusClass.value = 'normal' }, 3000)
  } else if (type === 'happy') {
    showMessage('数据正常，一切运行良好！✨')
    statusClass.value = 'happy'
    playProgrammaticAnimation('bounce', 2000)
    setTimeout(() => { statusClass.value = 'normal' }, 3000)
  } else if (type === 'nod') {
    showMessage('收到！正在监控中...')
    playProgrammaticAnimation('nod', 1500)
  } else if (type === 'jump') {
    showMessage('太棒了！数据表现优秀 🎉')
    statusClass.value = 'happy'
    playProgrammaticAnimation('jump', 1500)
    setTimeout(() => { statusClass.value = 'normal' }, 3000)
  }
}

function handleTemperature(temp) {
  if (temp > 40) { playAnimation('alert'); showMessage('🔥 温度过高！请注意散热') }
  else if (temp > 35) { showMessage('⚠️ 温度偏高，建议降温'); playProgrammaticAnimation('shake', 1500) }
  else if (temp < 0) { showMessage('❄️ 温度过低，请注意保暖'); playProgrammaticAnimation('vibrate', 1000) }
  else if (temp >= 20 && temp <= 25 && Math.random() < 0.05) playAnimation('jump')
}

function handleHumidity(humidity) {
  if (humidity > 80) { showMessage('💧 湿度过高，注意防潮'); playProgrammaticAnimation('shake', 1500) }
  else if (humidity < 20) { showMessage('🏜️ 湿度过低，空气干燥'); playProgrammaticAnimation('nod', 1500) }
}

function handleFall() {
  playAnimation('alert')
  showMessage('🚨 检测到跌倒！请立即检查安全状况')
  setTimeout(() => { playProgrammaticAnimation('vibrate', 500) }, 1500)
}

let lastAlertTime = 0
const ALERT_COOLDOWN = 10000

watch(() => props.sensorData, (newData) => {
  if (!newData) return
  const now = Date.now()
  if (newData.fallFlag) { handleFall(); lastAlertTime = now; return }
  if (now - lastAlertTime < ALERT_COOLDOWN) return
  if (newData.temperature !== undefined) handleTemperature(Number(newData.temperature))
  if (newData.humidity !== undefined) handleHumidity(Number(newData.humidity))
  if (Math.random() < 0.05) {
    const g = [
      { type: 'wave', msg: '嗨！一切正常 👋' },
      { type: 'nod',  msg: '我在这里守护着你 🛡️' },
      { type: 'happy',msg: '今天也要加油哦！💪' },
    ][Math.floor(Math.random() * 3)]
    playAnimation(g.type); showMessage(g.msg)
  }
}, { deep: true })

let interactionTimer
onMounted(() => {
  initScene()
  setTimeout(() => { playAnimation('wave'); showMessage('你好！我是灵盔AI助手，点击我开始对话 👋') }, 2000)
  interactionTimer = setInterval(() => {
    if (Math.random() < 0.3) {
      const hour = new Date().getHours()
      const pool = hour < 9
        ? [{ type: 'wave', msg: '早上好！新的一天开始了 🌅' }]
        : hour < 12
        ? [{ type: 'nod',  msg: '上午好！工作顺利吗？' }]
        : hour < 14
        ? [{ type: 'wave', msg: '午餐时间到了，记得休息哦 🍱' }]
        : hour < 18
        ? [{ type: 'happy',msg: '下午好！继续加油 💪' }]
        : hour < 22
        ? [{ type: 'wave', msg: '晚上好！辛苦了一天 🌙' }]
        : [{ type: 'nod',  msg: '夜深了，注意休息 😴' }]
      const item = pool[0]
      playAnimation(item.type); showMessage(item.msg)
    }
  }, 30000)
})

onUnmounted(() => {
  isDestroyed = true
  if (animFrameId) cancelAnimationFrame(animFrameId)
  clearInterval(interactionTimer)
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
  renderer?.dispose()
})
</script>

<style scoped>
.ai-assistant {
  position: absolute;
  cursor: grab;
  user-select: none;
  transition: filter 0.2s;
}
.ai-assistant:hover {
  filter: drop-shadow(0 0 10px rgba(56,189,248,0.5));
}
.ai-assistant.is-dragging {
  cursor: grabbing;
  opacity: 0.9;
}

.assistant-canvas {
  width: 200px;
  height: 200px;
  cursor: pointer;
}

/* 对话气泡 — 默认显示在上方 */
.speech-bubble {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(2, 20, 48, 0.96);
  border: 1px solid rgba(56,189,248,0.6);
  border-radius: 10px;
  padding: 10px 14px;
  min-width: 160px;
  max-width: 240px;
  backdrop-filter: blur(12px);
  pointer-events: none;
  white-space: pre-wrap;
  box-shadow: 0 0 18px rgba(56,189,248,0.25), 0 4px 20px rgba(0,0,0,0.7);
}
.speech-bubble::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 7px solid transparent;
  border-top-color: rgba(56,189,248,0.35);
}
/* 气泡显示在下方（模型在面板上半部时） */
.speech-bubble--below {
  bottom: auto;
  top: calc(65% + 8px);
}
.speech-bubble--below::after {
  top: auto;
  bottom: 100%;
  border-top-color: transparent;
  border-bottom-color: rgba(56,189,248,0.35);
}
.bubble-text {
  color: #e0f2fe;
  font-size: 0.75rem;
  font-family: var(--font-mono, monospace);
  margin: 0;
  line-height: 1.5;
}

/* 气泡动画 */
.bubble-enter-active, .bubble-leave-active { transition: all 0.3s ease; }
.bubble-enter-from { opacity: 0; transform: translateX(-50%) translateY(6px); }
.bubble-leave-to   { opacity: 0; transform: translateX(-50%) translateY(-6px); }

/* 状态指示器 */
.status-indicator {
  position: absolute;
  top: 8px; right: 8px;
  width: 12px; height: 12px;
  pointer-events: none;
}
.pulse-dot {
  width: 12px; height: 12px;
  border-radius: 50%;
  background: #00f2ff;
  position: absolute;
}
.pulse-ring {
  width: 12px; height: 12px;
  border-radius: 50%;
  border: 2px solid #00f2ff;
  position: absolute;
  animation: pulse-ring 2s ease-out infinite;
}
@keyframes pulse-ring {
  0%   { transform: scale(1); opacity: 1; }
  100% { transform: scale(2.2); opacity: 0; }
}
.status-indicator.alert .pulse-dot  { background: #ff0055; }
.status-indicator.alert .pulse-ring { border-color: #ff0055; }
.status-indicator.happy .pulse-dot  { background: #70ff00; }
.status-indicator.happy .pulse-ring { border-color: #70ff00; }
</style>
