<template>
  <div class="controls" data-aos="fade-up" data-aos-delay="200">
    <button type="button" class="controls__btn controls__btn--primary" @click="onToggleAuto">
      <svg v-if="!isAuto" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
      {{ isAuto ? '关闭自动刷新' : '开启自动刷新' }}
    </button>
    <button type="button" class="controls__btn controls__btn--secondary" @click="onClearAll">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      清除所有数据
    </button>
    <button type="button" class="controls__btn controls__btn--secondary" @click="onLogout">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      退出登录
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const emit = defineEmits(['toggle-auto-refresh', 'clear-all-data'])
const isAuto = ref(false)
const router = useRouter()
const userStore = useUserStore()

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

function onLogout(e) {
  createRipple(e)
  // 清除用户状态
  userStore.logout()
  // 跳转到登录页面
  router.push('/login')
}
</script>

<style scoped>
.controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.controls__btn {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 0.9rem;
}

.controls__btn--primary {
  background: linear-gradient(135deg, #FF6B35, #FF4757);
  color: #fff;
}

.controls__btn--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.4);
}

.controls__btn--secondary {
  background: rgba(255, 255, 255, 0.06);
  color: #E8ECF1;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.controls__btn--secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
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

@media (max-width: 768px) {
  .controls {
    gap: 8px;
  }

  .controls__btn {
    padding: 8px 16px;
    font-size: 0.85rem;
  }
}
</style>
