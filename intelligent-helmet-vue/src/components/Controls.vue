<template>
  <div class="controls" data-aos="fade-up" data-aos-delay="200">
    <button type="button" class="btn glass-button" @click="onToggleAuto" :data-key="'auto'">
      {{ isAuto ? '关闭自动刷新' : '开启自动刷新' }}
    </button>
    <button type="button" class="btn glass-button" @click="onClearAll" :data-key="'clear-all'">
      清除所有数据
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const emit = defineEmits(['toggle-auto-refresh', 'clear-all-data'])
const isAuto = ref(false)

function createRipple(e) {
  const button = e.currentTarget
  const circle = document.createElement('span')
  circle.className = 'ripple'
  const rect = button.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  circle.style.width = circle.style.height = size + 'px'
  circle.style.left = (e.clientX - rect.left - size/2) + 'px'
  circle.style.top = (e.clientY - rect.top - size/2) + 'px'
  button.appendChild(circle)
  setTimeout(() => circle.remove(), 600)
}

function onToggleAuto(e) {
  createRipple(e)
  isAuto.value = !isAuto.value
  emit('toggle-auto-refresh', isAuto.value)
}

function onClearAll(e) {
  createRipple(e)
  emit('clear-all-data')
}
</script>

<style scoped>
.controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.glass-button {
  position: relative;
  overflow: hidden;
  padding: 12px 24px;
  border-radius: 24px;
  border: 1px solid rgba(0, 247, 255, 0.3);
  background: rgba(10, 15, 44, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #00f7ff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.glass-button:hover {
  background: rgba(0, 247, 255, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
  border-color: rgba(0, 247, 255, 0.6);
}

.ripple {
  position: absolute;
  border-radius: 50%;
  transform: scale(0);
  background: rgba(255, 255, 255, 0.2);
  animation: rip 0.6s linear;
  pointer-events: none;
}

@keyframes rip {
  to {
    transform: scale(2.5);
    opacity: 0;
  }
}
</style>