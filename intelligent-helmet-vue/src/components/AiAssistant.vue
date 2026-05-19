<template>
  <div
    class="ai-assistant"
    :class="{ 'is-dragging': isDragging }"
    :style="{ right: currentPosition.x + 'px', bottom: currentPosition.y + 'px' }"
    @mousedown="handleMouseDown"
    @click="handleClick"
  >
    <!-- 3D 角色容器 -->
    <div ref="containerRef" class="assistant-canvas"></div>

    <!-- 对话气泡 -->
    <Transition name="bubble">
      <div v-if="showBubble" class="speech-bubble" @click.stop>
        <p class="bubble-text">{{ currentMessage }}</p>
      </div>
    </Transition>

    <!-- 状态指示器 -->
    <div class="status-indicator" :class="statusClass">
      <div class="pulse-ring"></div>
      <div class="pulse-dot"></div>
    </div>

    <!-- 拖拽提示 -->
    <div v-if="isDragging" class="drag-hint">拖动中...</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const props = defineProps({
  sensorData: { type: Object, default: null },
  position: { type: Object, default: () => ({ x: 20, y: 20 }) }
})

const emit = defineEmits(['openChat'])

const containerRef = ref(null)
const showBubble = ref(false)
const currentMessage = ref('')
const statusClass = ref('normal')

// 拖拽相关状态
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const currentPosition = ref({ ...props.position })

let scene, camera, renderer, model, mixer, clock
let idleAction, waveAction, alertAction

// 拖拽开始
function handleMouseDown(e) {
  // 如果点击的是对话气泡，不触发拖拽
  if (e.target.closest('.speech-bubble')) {
    return
  }

  isDragging.value = true
  dragStartX.value = e.clientX
  dragStartY.value = e.clientY

  // 添加全局事件监听
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)

  // 阻止默认行为
  e.preventDefault()
}

// 拖拽中
function handleMouseMove(e) {
  if (!isDragging.value) return

  const deltaX = dragStartX.value - e.clientX
  const deltaY = dragStartY.value - e.clientY

  currentPosition.value = {
    x: Math.max(0, currentPosition.value.x + deltaX),
    y: Math.max(0, currentPosition.value.y + deltaY)
  }

  dragStartX.value = e.clientX
  dragStartY.value = e.clientY
}

// 拖拽结束
function handleMouseUp() {
  if (isDragging.value) {
    isDragging.value = false

    // 保存位置到 localStorage
    localStorage.setItem('aiAssistantPosition', JSON.stringify(currentPosition.value))

    // 移除全局事件监听
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
}

// 点击事件处理（只在非拖拽时触发）
function handleClick(e) {
  // 如果刚刚在拖拽，不触发点击
  if (isDragging.value) return

  console.log('[AiAssistant] 点击了 AI 助手')

  // 播放点击动画
  playAnimation('wave')
  showMessage('让我们聊聊吧！💬')

  // 触发打开 AiChat 面板
  setTimeout(() => {
    const aiFab = document.querySelector('.ai-fab')
    if (aiFab) {
      aiFab.click()
    }
  }, 500)
}

// 初始化 Three.js 场景
function initScene() {
  if (!containerRef.value) return

  console.log('[AiAssistant] 初始化场景')

  // 场景
  scene = new THREE.Scene()
  scene.background = null // 透明背景

  // 相机
  camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000)
  camera.position.set(0, 1, 4.2)
  camera.lookAt(0, 0.8, 0)

  // 渲染器
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  })
  renderer.setSize(200, 200)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0) // 透明背景
  containerRef.value.appendChild(renderer.domElement)

  console.log('[AiAssistant] 渲染器创建完成，canvas 尺寸:', renderer.domElement.width, 'x', renderer.domElement.height)

  // 光照 - 增强光照
  const ambientLight = new THREE.AmbientLight(0xffffff, 3.0)
  scene.add(ambientLight)

  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 2.5)
  directionalLight1.position.set(2, 3, 2)
  scene.add(directionalLight1)

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.5)
  directionalLight2.position.set(-2, 2, -2)
  scene.add(directionalLight2)

  const directionalLight3 = new THREE.DirectionalLight(0xffffff, 1.0)
  directionalLight3.position.set(0, -2, 3)
  scene.add(directionalLight3)

  // 添加辅助网格（调试用）
  // const gridHelper = new THREE.GridHelper(10, 10, 0x00f2ff, 0x444444)
  // scene.add(gridHelper)

  // 时钟（用于动画）
  clock = new THREE.Clock()

  // 加载模型
  loadModel()

  // 开始渲染循环
  animate()
}

// 加载 3D 模型
function loadModel() {
  const loader = new GLTFLoader()

  loader.load(
    '/models/ai_assistant.glb',
    (gltf) => {
      model = gltf.scene

      // 计算模型的边界框
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())

      console.log('[AiAssistant] 模型原始尺寸:', size.x.toFixed(2), 'x', size.y.toFixed(2), 'x', size.z.toFixed(2))
      console.log('[AiAssistant] 模型原始中心:', center.x.toFixed(2), center.y.toFixed(2), center.z.toFixed(2))

      // 自动调整模型大小 - 让模型高度约为 1.8 单位（适中大小）
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = 2.0 / maxDim
      model.scale.set(scale, scale, scale)

      console.log('[AiAssistant] 缩放比例:', scale.toFixed(4))

      // 居中模型并调整位置 - 让模型底部在 y=0，这样整个模型都在可视范围内
      model.position.x = -center.x * scale
      model.position.y = -center.y * scale + size.y * scale / 2 + 0.2 // 底部稍微抬高一点
      model.position.z = -center.z * scale

      console.log('[AiAssistant] 模型最终位置:', model.position.x.toFixed(2), model.position.y.toFixed(2), model.position.z.toFixed(2))

      scene.add(model)

      console.log('[AiAssistant] 模型加载成功')
      console.log('[AiAssistant] 可用动画数量:', gltf.animations.length)

      // 设置动画
      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model)

        // 打印所有可用动画名称
        gltf.animations.forEach((clip, index) => {
          console.log(`[AiAssistant] 动画 ${index}: ${clip.name}`)
        })

        // 根据动画数量设置动作
        idleAction = mixer.clipAction(gltf.animations[0]) // 第一个动画作为空闲
        if (gltf.animations.length > 1) {
          waveAction = mixer.clipAction(gltf.animations[1])
        }
        if (gltf.animations.length > 2) {
          alertAction = mixer.clipAction(gltf.animations[2])
        }

        // 播放空闲动画
        idleAction.play()
      } else {
        console.log('[AiAssistant] 模型没有动画，使用程序化动画')
        startIdleAnimation()
      }

      // 遍历模型的所有材质，确保它们可见
      model.traverse((child) => {
        if (child.isMesh) {
          console.log('[AiAssistant] 网格:', child.name, '材质:', child.material?.type)
          if (child.material) {
            child.material.needsUpdate = true
            // 确保材质可见
            if (child.material.transparent) {
              child.material.opacity = Math.max(child.material.opacity, 0.5)
            }
          }
        }
      })
    },
    (progress) => {
      const percent = (progress.loaded / progress.total * 100).toFixed(2)
      console.log(`[AiAssistant] 加载中: ${percent}%`)
    },
    (error) => {
      console.error('[AiAssistant] 模型加载失败:', error)
      console.log('[AiAssistant] 使用占位符模型')
      createPlaceholderModel()
    }
  )
}

// 创建占位符模型（简单的机器人形状）
function createPlaceholderModel() {
  const group = new THREE.Group()

  // 身体
  const bodyGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.4)
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x00f2ff,
    emissive: 0x00f2ff,
    emissiveIntensity: 0.2
  })
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
  body.position.y = 1
  group.add(body)

  // 头部
  const headGeometry = new THREE.SphereGeometry(0.3, 32, 32)
  const headMaterial = new THREE.MeshStandardMaterial({
    color: 0x00f2ff,
    emissive: 0x00f2ff,
    emissiveIntensity: 0.3
  })
  const head = new THREE.Mesh(headGeometry, headMaterial)
  head.position.y = 1.7
  group.add(head)

  // 眼睛
  const eyeGeometry = new THREE.SphereGeometry(0.05, 16, 16)
  const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })

  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
  leftEye.position.set(-0.1, 1.75, 0.25)
  group.add(leftEye)

  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
  rightEye.position.set(0.1, 1.75, 0.25)
  group.add(rightEye)

  model = group
  scene.add(model)

  // 添加简单的呼吸动画
  startIdleAnimation()
}

// 空闲动画（呼吸效果）
function startIdleAnimation() {
  if (!model) return

  const breathe = () => {
    const time = Date.now() * 0.001
    // 呼吸效果 - 上下浮动
    model.position.y = Math.sin(time * 2) * 0.05 + 1
    // 轻微旋转
    model.rotation.y = Math.sin(time * 0.5) * 0.1
  }

  model.userData.breathe = breathe
}

// 程序化动画库
const animations = {
  // 点头动画
  nod: (model, progress) => {
    model.rotation.x = Math.sin(progress * Math.PI * 4) * 0.3
  },

  // 摇头动画
  shake: (model, progress) => {
    model.rotation.y = Math.sin(progress * Math.PI * 6) * 0.5
  },

  // 跳跃动画
  jump: (model, progress) => {
    const jumpHeight = Math.sin(progress * Math.PI) * 0.5
    model.position.y = 1 + jumpHeight
  },

  // 旋转动画
  spin: (model, progress) => {
    model.rotation.y = progress * Math.PI * 2
  },

  // 抖动动画（警告）
  vibrate: (model, progress) => {
    model.position.x = Math.sin(progress * Math.PI * 20) * 0.1
    model.rotation.z = Math.sin(progress * Math.PI * 20) * 0.1
  },

  // 缩放动画（开心）
  bounce: (model, progress) => {
    const scale = 1 + Math.sin(progress * Math.PI * 4) * 0.1
    model.scale.set(scale, scale, scale)
  }
}

// 播放程序化动画
function playProgrammaticAnimation(animationType, duration = 2000) {
  if (!model || !animations[animationType]) return

  const startTime = Date.now()
  const originalPosition = { ...model.position }
  const originalRotation = { ...model.rotation }
  const originalScale = { ...model.scale }

  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)

    // 执行动画
    animations[animationType](model, progress)

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      // 恢复原始状态
      model.position.copy(originalPosition)
      model.rotation.copy(originalRotation)
      model.scale.copy(originalScale)
      // 恢复呼吸动画
      startIdleAnimation()
    }
  }

  // 停止呼吸动画
  if (model.userData.breathe) {
    delete model.userData.breathe
  }

  animate()
}

// 渲染循环
function animate() {
  requestAnimationFrame(animate)

  // 更新动画混合器
  if (mixer) {
    const delta = clock.getDelta()
    mixer.update(delta)
  }

  // 执行空闲动画
  if (model && model.userData.breathe) {
    model.userData.breathe()
  }

  renderer.render(scene, camera)
}

// 播放特定动画
function playAnimation(type) {
  if (type === 'wave') {
    showMessage('你好！我是灵盔AI助手 👋')
    playProgrammaticAnimation('spin', 1500)
  } else if (type === 'alert') {
    showMessage('⚠️ 检测到异常数据！请注意安全')
    statusClass.value = 'alert'
    playProgrammaticAnimation('vibrate', 1000)
    setTimeout(() => {
      statusClass.value = 'normal'
    }, 3000)
  } else if (type === 'happy') {
    showMessage('数据正常，一切运行良好！✨')
    statusClass.value = 'happy'
    playProgrammaticAnimation('bounce', 2000)
    setTimeout(() => {
      statusClass.value = 'normal'
    }, 3000)
  } else if (type === 'nod') {
    showMessage('收到！正在监控中...')
    playProgrammaticAnimation('nod', 1500)
  } else if (type === 'jump') {
    showMessage('太棒了！数据表现优秀 🎉')
    statusClass.value = 'happy'
    playProgrammaticAnimation('jump', 1500)
    setTimeout(() => {
      statusClass.value = 'normal'
    }, 3000)
  }
}

// 根据温度触发动画
function handleTemperature(temp) {
  if (temp > 40) {
    playAnimation('alert')
    showMessage('🔥 温度过高！请注意散热')
  } else if (temp > 35) {
    showMessage('⚠️ 温度偏高，建议降温')
    playProgrammaticAnimation('shake', 1500)
  } else if (temp < 0) {
    showMessage('❄️ 温度过低，请注意保暖')
    playProgrammaticAnimation('vibrate', 1000)
  } else if (temp >= 20 && temp <= 25) {
    // 温度舒适，偶尔表扬
    if (Math.random() < 0.05) {
      playAnimation('jump')
    }
  }
}

// 根据湿度触发动画
function handleHumidity(humidity) {
  if (humidity > 80) {
    showMessage('💧 湿度过高，注意防潮')
    playProgrammaticAnimation('shake', 1500)
  } else if (humidity < 20) {
    showMessage('🏜️ 湿度过低，空气干燥')
    playProgrammaticAnimation('nod', 1500)
  }
}

// 根据跌倒检测触发动画
function handleFall() {
  playAnimation('alert')
  showMessage('🚨 检测到跌倒！请立即检查安全状况')
  // 连续抖动
  setTimeout(() => {
    playProgrammaticAnimation('vibrate', 500)
  }, 1500)
}

// 显示对话气泡
function showMessage(message) {
  currentMessage.value = message
  showBubble.value = true
  setTimeout(() => {
    showBubble.value = false
  }, 3000)
}

// 监听传感器数据变化
let lastAlertTime = 0
const ALERT_COOLDOWN = 10000 // 10秒冷却时间，避免频繁触发

watch(() => props.sensorData, (newData) => {
  if (!newData) return

  const now = Date.now()

  // 跌倒检测（最高优先级）
  if (newData.fallFlag) {
    handleFall()
    lastAlertTime = now
    return
  }

  // 避免频繁触发警告
  if (now - lastAlertTime < ALERT_COOLDOWN) {
    return
  }

  // 温度检测
  if (newData.temperature !== undefined) {
    handleTemperature(Number(newData.temperature))
  }

  // 湿度检测
  if (newData.humidity !== undefined) {
    handleHumidity(Number(newData.humidity))
  }

  // 随机友好互动（5% 概率）
  if (Math.random() < 0.05) {
    const greetings = [
      { type: 'wave', message: '嗨！一切正常 👋' },
      { type: 'nod', message: '我在这里守护着你 🛡️' },
      { type: 'happy', message: '今天也要加油哦！💪' }
    ]
    const greeting = greetings[Math.floor(Math.random() * greetings.length)]
    playAnimation(greeting.type)
    showMessage(greeting.message)
  }
}, { deep: true })

// 定时随机互动
let interactionTimer
onMounted(() => {
  // 从 localStorage 恢复位置
  const savedPosition = localStorage.getItem('aiAssistantPosition')
  if (savedPosition) {
    try {
      currentPosition.value = JSON.parse(savedPosition)
    } catch (e) {
      console.error('[AiAssistant] 恢复位置失败:', e)
    }
  }

  initScene()

  // 初始欢迎消息
  setTimeout(() => {
    playAnimation('wave')
    showMessage('你好！我是灵盔AI助手，随时为你服务 👋')
  }, 2000)

  // 智能定时互动系统
  interactionTimer = setInterval(() => {
    // 根据时间段选择不同的互动
    const hour = new Date().getHours()
    const interactions = []

    if (hour >= 6 && hour < 9) {
      interactions.push(
        { type: 'wave', message: '早上好！新的一天开始了 🌅' },
        { type: 'jump', message: '今天也要元气满满哦！💪' }
      )
    } else if (hour >= 9 && hour < 12) {
      interactions.push(
        { type: 'nod', message: '上午好！工作顺利吗？' },
        { type: 'happy', message: '保持专注，你做得很棒！✨' }
      )
    } else if (hour >= 12 && hour < 14) {
      interactions.push(
        { type: 'wave', message: '午餐时间到了，记得休息哦 🍱' },
        { type: 'nod', message: '适当休息，下午更有精神！' }
      )
    } else if (hour >= 14 && hour < 18) {
      interactions.push(
        { type: 'happy', message: '下午好！继续加油 💪' },
        { type: 'nod', message: '数据监控中，一切正常 ✓' }
      )
    } else if (hour >= 18 && hour < 22) {
      interactions.push(
        { type: 'wave', message: '晚上好！辛苦了一天 🌙' },
        { type: 'happy', message: '今天的数据表现不错哦！' }
      )
    } else {
      interactions.push(
        { type: 'nod', message: '夜深了，注意休息 😴' },
        { type: 'wave', message: '我会继续守护着你 🛡️' }
      )
    }

    // 随机选择一个互动（30% 概率）
    if (Math.random() < 0.3 && interactions.length > 0) {
      const interaction = interactions[Math.floor(Math.random() * interactions.length)]
      playAnimation(interaction.type)
      showMessage(interaction.message)
    }
  }, 30000) // 每30秒检查一次
})

onUnmounted(() => {
  clearInterval(interactionTimer)
  if (renderer) {
    renderer.dispose()
  }
})
</script>

<style scoped>
.ai-assistant {
  position: fixed;
  z-index: 1000;
  cursor: grab;
  transition: transform 0.3s ease;
  user-select: none;
}

.ai-assistant:hover {
  transform: scale(1.05);
}

.ai-assistant.is-dragging {
  cursor: grabbing;
  transform: scale(1.05);
  opacity: 0.9;
  transition: none;
}

.assistant-canvas {
  width: 200px;
  height: 200px;
  pointer-events: none;
}

/* 拖拽提示 */
.drag-hint {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 242, 255, 0.2);
  border: 1px solid rgba(0, 242, 255, 0.5);
  border-radius: 12px;
  padding: 4px 12px;
  font-size: 11px;
  color: #00f2ff;
  font-family: 'JetBrains Mono', monospace;
  white-space: nowrap;
  pointer-events: none;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-50%) translateY(-5px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* 对话气泡 */
.speech-bubble {
  position: absolute;
  bottom: 220px;
  right: 0;
  background: rgba(0, 242, 255, 0.1);
  border: 1px solid rgba(0, 242, 255, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  min-width: 200px;
  max-width: 300px;
  backdrop-filter: blur(10px);
  pointer-events: auto;
  cursor: default;
}

.speech-bubble::after {
  content: '';
  position: absolute;
  bottom: -10px;
  right: 80px;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid rgba(0, 242, 255, 0.3);
}

.bubble-text {
  color: #fff;
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
  margin: 0;
  line-height: 1.5;
}

/* 气泡动画 */
.bubble-enter-active, .bubble-leave-active {
  transition: all 0.3s ease;
}

.bubble-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}

.bubble-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.9);
}

/* 状态指示器 */
.status-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 12px;
  height: 12px;
  pointer-events: none;
}

.pulse-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #00f2ff;
  position: absolute;
}

.pulse-ring {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #00f2ff;
  position: absolute;
  animation: pulse-ring 2s ease-out infinite;
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.status-indicator.alert .pulse-dot {
  background: #ff0055;
}

.status-indicator.alert .pulse-ring {
  border-color: #ff0055;
}

.status-indicator.happy .pulse-dot {
  background: #70ff00;
}

.status-indicator.happy .pulse-ring {
  border-color: #70ff00;
}
</style>
