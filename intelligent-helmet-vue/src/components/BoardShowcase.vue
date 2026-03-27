<template>
  <section class="relative w-full h-[800px] bg-[#030712] border-b border-white/5 overflow-hidden">
    <!-- 顶部标题信息 -->
    <div class="absolute top-12 right-12 z-10 text-right pointer-events-none">
      <div class="flex items-center justify-end gap-4 mb-2">
        <span class="text-[10px] font-mono text-cyan-400 tracking-widest uppercase">Hardware Core // 02</span>
        <div class="w-2 h-2 bg-cyan-500" style="clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"></div>
      </div>
      <h2 class="text-4xl font-black text-white uppercase tracking-tighter">
        Tactical <span class="text-cyan-500">Board</span>
      </h2>
      <p class="text-slate-500 text-[10px] font-mono mt-2 max-w-xs ml-auto uppercase tracking-widest leading-relaxed">
        Integrated processing unit for real-time tactical data analysis.<br />[STATUS: SYSTEM_READY]
      </p>
    </div>

    <!-- TresJS 画布 -->
    <TresCanvas shadows alpha>
      <TresPerspectiveCamera :position="[0, 2, 10]" :fov="35" />
      
      <!-- 基础控制器 -->
      <OrbitControls
        :enable-zoom="false"
        :auto-rotate="true"
        :auto-rotate-speed="0.5"
        :max-polar-angle="Math.PI / 1.8"
        :min-polar-angle="Math.PI / 4"
      />

      <!-- 灯光系统 -->
      <TresAmbientLight :intensity="0.8" />
      <TresDirectionalLight :position="[5, 8, 5]" :intensity="1.5" cast-shadow />
      <TresDirectionalLight :position="[-5, 5, -5]" :intensity="0.5" color="#06b6d4" />

      <!-- 模型组 -->
      <TresGroup ref="modelGroup">
        <primitive v-if="model" :object="model" />
      </TresGroup>

      <!-- 底部阴影 -->
      <ContactShadows 
        :opacity="0.4" 
        :blur="2.5" 
        :scale="15" 
        :far="10" 
        :position="[0, -2, 0]"
      />
    </TresCanvas>

    <!-- 底部参数信息 -->
    <div class="absolute bottom-12 left-12 z-10 pointer-events-none">
      <div class="flex flex-col gap-4">
        <div v-for="(spec, i) in specs" :key="i" class="flex items-center gap-3">
          <div class="w-8 h-[1px] bg-cyan-500/50"></div>
          <span class="text-[9px] font-mono text-slate-400 tracking-widest uppercase">{{ spec }}</span>
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

// 3. 手动实现漂浮动画 (使用 requestAnimationFrame)
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
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>