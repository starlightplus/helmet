<template>
  <section class="relative w-full h-[800px] border-b border-white/5 overflow-hidden" style="background: #000000;">
    <!-- 顶部标题信息 -->
    <div class="absolute top-12 right-12 z-10 text-right pointer-events-none">
      <div class="flex items-center justify-end gap-4 mb-2">
        <span class="text-[30px] font-mono text-cyan-400 tracking-widest uppercase">TACTICAL BOARD</span>
        <div class="w-2 h-2 bg-cyan-500" style="clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"></div>
      </div>
      <h2 class="text-5xl font-black text-white uppercase tracking-tighter">
        开发板 <span class="text-cyan-500">3D建模展示</span>
      </h2>
      <p class="text-slate-400 text-[20px] font-mono mt-2 max-w-xs ml-auto uppercase tracking-widest leading-relaxed">
        鼠标光标移动可查看开发板全貌<br />[STATUS: SYSTEM_READY]
      </p>
    </div>

    <!-- TresJS 画布 -->
    <div class="canvas-wrapper">
      <TresCanvas
        :alpha="true"
        :renderer-options="{
          alpha: true,
          antialias: false,
          powerPreference: 'high-performance'
        }"
      >
        <TresPerspectiveCamera :position="[0, 2, 10]" :fov="35" />

        <!-- 基础控制器 -->
        <OrbitControls
          :enable-zoom="false"
          :auto-rotate="true"
          :auto-rotate-speed="0.5"
          :max-polar-angle="Math.PI / 1.8"
          :min-polar-angle="Math.PI / 4"
        />

        <!-- 最小化光源 -->
        <TresAmbientLight :intensity="1.5" />

        <!-- 模型组 -->
        <TresGroup ref="modelGroup">
          <primitive v-if="model" :object="model" />
        </TresGroup>
      </TresCanvas>
    </div>

    <!-- 底部参数信息 -->
    <div class="absolute bottom-12 left-12 z-10 pointer-events-none">
      <div class="flex flex-col gap-4">
        <div v-for="(spec, i) in specs" :key="i" class="flex items-center gap-3">
          <div class="w-8 h-[4px] bg-cyan-500/50"></div>
          <span class="text-[14px] font-mono text-slate-400 tracking-widest uppercase">{{ spec }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { shallowRef, onMounted, onUnmounted } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls, ContactShadows } from '@tresjs/cientos'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const modelGroup = shallowRef()
const model = shallowRef(null)
const specs = [
  "ARM Cortex-M7 Core // 800MHz",
  "Dual-Band RF Module // 2.4/5.8GHz",
  "Neural Accel. V2 // 4.2 TOPS"
]

// 使用原生 GLTFLoader 加载模型
const loader = new GLTFLoader()
loader.load(
  '/models/board.glb',
  (gltf) => {
    const loadedModel = gltf.scene
    const box = new THREE.Box3().setFromObject(loadedModel)
    const center = new THREE.Vector3()
    const size = new THREE.Vector3()
    box.getCenter(center)
    box.getSize(size)

    // 自动缩放到合适大小（目标尺寸 4 单位）
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 4 / maxDim
    loadedModel.scale.set(scale, scale, scale)

    // 将模型几何中心移到原点（考虑缩放）
    loadedModel.position.sub(center.multiplyScalar(scale))

    // 开启阴影
    loadedModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    model.value = loadedModel
  },
  undefined,
  (error) => {
    console.error('[BoardShowcase] 模型加载失败:', error)
  }
)

// 手动实现漂浮动画 (使用 requestAnimationFrame)
let animationId = null
let startTime = performance.now()

const animate = (currentTime) => {
  const elapsed = (currentTime - startTime) / 1000 // 转换为秒

  if (modelGroup.value) {
    // Y 轴上下漂浮
    modelGroup.value.position.y = Math.sin(elapsed * 1.5) * 0.2
    // 轻微旋转
    modelGroup.value.rotation.z = Math.sin(elapsed * 0.5) * 0.05
    modelGroup.value.rotation.x = Math.cos(elapsed * 0.5) * 0.05
  }

  animationId = requestAnimationFrame(animate)
}

onMounted(() => {
  startTime = performance.now()
  animationId = requestAnimationFrame(animate)

  // 尝试访问 TresJS 的渲染器并设置透明背景
  setTimeout(() => {
    const canvas = document.querySelector('[data-tres]')
    if (canvas) {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      if (gl) {
        console.log('[BoardShowcase] WebGL context found, alpha:', gl.getContextAttributes()?.alpha)
      }
    }
  }, 100)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
/* Canvas Wrapper */
.canvas-wrapper {
  position: absolute;
  inset: 0;
  z-index: 5;
}

/* 强制 TresCanvas 的 canvas 元素透明并正确定位 */
.canvas-wrapper :deep(canvas) {
  background: transparent !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
}

/* High-Tech Animated Background */
.tech-background {
  position: absolute !important;
  inset: 0 !important;
  pointer-events: none !important;
  z-index: 1 !important;
  overflow: hidden !important;
  background: #030712 !important;
}

.dynamic-grid {
  position: absolute;
  inset: 0;
  opacity: 0.3;
  background-image: linear-gradient(rgba(6, 182, 212, 0.2) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(6, 182, 212, 0.2) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(circle at 50% 50%, black 30%, transparent 80%);
  -webkit-mask-image: radial-gradient(circle at 50% 50%, black 30%, transparent 80%);
}

.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  animation: pulse 4s ease-in-out infinite;
}

.glow-orb-1 {
  top: -20%;
  left: -10%;
  width: 50%;
  height: 50%;
  background: rgba(6, 182, 212, 0.4);
  animation-duration: 4s;
}

.glow-orb-2 {
  bottom: -20%;
  right: -10%;
  width: 50%;
  height: 50%;
  background: rgba(59, 130, 246, 0.3);
  animation-duration: 5s;
  animation-delay: 1s;
}

.scanner-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: rgba(6, 182, 212, 0.3);
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.5);
  animation: scan 4s linear infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

@keyframes scan {
  0% { top: 0; opacity: 0; }
  50% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
</style>