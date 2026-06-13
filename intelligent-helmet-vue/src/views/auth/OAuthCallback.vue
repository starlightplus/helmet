<template>
  <div class="callback-root">
    <canvas ref="canvasRef" class="callback-canvas"></canvas>
    <div class="callback-card">
      <template v-if="error">
        <div class="cb-icon error-icon">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <p class="cb-title error-title">{{ isBind ? '绑定失败' : '登录失败' }}</p>
        <p class="cb-sub">{{ error }}</p>
        <button class="cb-btn" @click="$router.replace(isBind ? '/profile' : '/auth')">{{ isBind ? '返回个人资料' : '返回登录页' }}</button>
      </template>
      <template v-else-if="bindSuccess">
        <div class="cb-icon success-icon">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <p class="cb-title">GitHub 绑定成功</p>
        <p class="cb-sub">正在返回个人资料...</p>
      </template>
      <template v-else>
        <div class="cb-spinner-wrap">
          <div class="cb-spinner"></div>
          <div class="cb-spinner-inner">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
        </div>
        <p class="cb-title">GitHub 授权成功</p>
        <p class="cb-sub">正在跳转到控制台...</p>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const canvasRef = ref(null)
const error = ref('')
const isBind = ref(false)
const bindSuccess = ref(false)

let animFrameId = null

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')
  const username = params.get('username')
  const role = params.get('role')
  const err = params.get('error')
  const action = params.get('action')
  const success = params.get('success')

  // ── 绑定模式回调 ──
  if (action === 'bind') {
    isBind.value = true
    if (success === 'true') {
      bindSuccess.value = true
      setTimeout(() => router.replace('/profile'), 1500)
      return
    }
    const errMap = {
      'github_already_bound': '该 GitHub 账号已绑定其他用户',
      'invalid_token': '登录已过期，请重新登录后再绑定',
      'user_not_found': '用户不存在',
    }
    error.value = errMap[err] || (err || '绑定失败，请重试')
    return
  }

  // ── 登录模式回调 ──
  if (err || !token) {
    error.value = err || '未收到授权 token，请重试'
    return
  }

  userStore.login({ username, token, role, deviceId: null })
  setTimeout(() => router.replace('/app'), 1500)

  // 粒子背景
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  let W = canvas.width = window.innerWidth
  let H = canvas.height = window.innerHeight

  const particles = Array.from({ length: 40 }, () => {
    const hue = Math.random() > 0.5 ? 190 + Math.random() * 20 : 260 + Math.random() * 20
    return {
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 1,
      color: `hsla(${hue}, 80%, 75%, ${Math.random() * 0.4 + 0.2})`
    }
  })

  function animate() {
    ctx.clearRect(0, 0, W, H)
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy
      if (p.x < 0 || p.x > W) p.vx *= -1
      if (p.y < 0 || p.y > H) p.vy *= -1
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.shadowBlur = 8; ctx.shadowColor = p.color
      ctx.fill(); ctx.shadowBlur = 0
    })
    animFrameId = requestAnimationFrame(animate)
  }
  animate()

  const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight }
  window.addEventListener('resize', onResize)
  onBeforeUnmount(() => {
    cancelAnimationFrame(animFrameId)
    window.removeEventListener('resize', onResize)
  })
})
</script>

<style scoped>
.callback-root {
  position: relative;
  min-height: 100vh;
  background: #030712;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
}
.callback-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.7;
}
.callback-card {
  position: relative;
  z-index: 10;
  width: 360px;
  padding: 40px 32px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(24px);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
}
.cb-spinner-wrap {
  position: relative;
  width: 64px; height: 64px;
  margin-bottom: 8px;
}
.cb-spinner {
  width: 64px; height: 64px;
  border-radius: 50%;
  border: 2px dashed #22d3ee;
  animation: spin 3s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.cb-spinner-inner {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  color: #22d3ee;
}
.cb-icon {
  width: 64px; height: 64px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 8px;
}
.error-icon {
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.3);
  color: #f87171;
}
.success-icon {
  background: rgba(16,185,129,0.1);
  border: 1px solid rgba(16,185,129,0.3);
  color: #34d399;
}
.cb-title {
  font-size: 18px; font-weight: 700; color: #fff;
  margin: 0;
}
.error-title { color: #f87171; }
.cb-sub {
  font-size: 13px; color: #71717a;
  margin: 0; font-family: monospace;
}
.cb-btn {
  margin-top: 8px;
  padding: 10px 24px;
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.3);
  border-radius: 8px;
  color: #fca5a5;
  font-size: 13px; cursor: pointer;
  transition: background 0.2s;
}
.cb-btn:hover { background: rgba(239,68,68,0.2); }
</style>
