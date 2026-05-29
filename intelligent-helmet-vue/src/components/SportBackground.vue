<template>
  <div class="cyber-bg">
    <!-- 隐藏的 video 用于解码，canvas 负责渲染，浏览器不会对 canvas 显示媒体控件 -->
    <video ref="videoRef" class="bg-video-hidden" autoplay loop muted playsinline
      disablePictureInPicture
      @loadeddata="startDraw">
      <source src="/background.mp4" type="video/mp4">
    </video>
    <canvas ref="canvasRef" class="bg-canvas"></canvas>
    <!-- 统一遮光层 -->
    <div class="bg-overlay"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const videoRef = ref(null)
const canvasRef = ref(null)
let rafId = null

function startDraw() {
  const video = videoRef.value
  const canvas = canvasRef.value
  if (!video || !canvas) return

  const ctx = canvas.getContext('2d')

  function resize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)

  function draw() {
    if (video.readyState >= 2) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    }
    rafId = requestAnimationFrame(draw)
  }
  draw()

  onBeforeUnmount(() => {
    cancelAnimationFrame(rafId)
    window.removeEventListener('resize', resize)
  })
}
</script>

<style scoped>
.cyber-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
}

/* video 完全隐藏，只用于解码 */
.bg-video-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.bg-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  pointer-events: none;
}
</style>

<style>
:root {
  --cyber-cyan:  #00F3FF;
  --cyber-green: #00FF66;
  --cyber-amber: #FFAA00;
  --cyber-red:   #EF4444;
  --cyber-black: #050505;
  --cyber-dark:  #0a0a0a;
  --cyber-gray:  #1a1a1a;
  --font-mono: "JetBrains Mono", "Fira Code", "Courier New", monospace;
}

body {
  font-family: "Inter", system-ui, sans-serif;
  background: #050505;
  color: #e2e8f0;
  margin: 0; padding: 0;
  overflow-x: hidden;
}
</style>
