<template>
  <div class="auth-root">
    <!-- 背景：网格 + 扫描线 -->
    <canvas ref="canvasRef" class="auth-canvas"></canvas>

    <!-- 扫描线覆盖层 -->
    <div class="scanline-overlay"></div>

    <!-- 主卡片 -->
    <div class="auth-card">

      <!-- 顶部状态栏 -->
      <div class="card-topbar">
        <span class="topbar-tag">SYS</span>
        <span class="topbar-title">HELMET MONITOR v2.0</span>
        <span class="topbar-status">
          <span class="status-dot"></span>
          ONLINE
        </span>
      </div>

      <!-- Logo 区 -->
      <div class="logo-wrap">
        <div class="logo-hex">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        <div class="logo-lines">
          <div class="logo-line-1"></div>
          <div class="logo-line-2"></div>
        </div>
      </div>

      <!-- 标题 -->
      <div class="auth-title">
        <h2>{{ isLogin ? 'ACCESS CONTROL' : 'NEW OPERATOR' }}</h2>
        <p>{{ isLogin ? 'Enter credentials to authenticate' : 'Register a new operator account' }}</p>
      </div>

      <!-- 错误提示 -->
      <div v-if="errorMessage" class="error-bar">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        {{ errorMessage }}
      </div>

      <!-- 表单 -->
      <form @submit.prevent="handleSubmit" class="auth-form">

        <!-- 用户名 -->
        <div class="field-wrap">
          <label class="field-label">USERNAME</label>
          <div class="field-box" :class="{ 'field-error': !isLogin && usernameError }">
            <span class="field-prefix">ID</span>
            <input type="text" v-model="form.username" required autocomplete="username"
              class="field-input" placeholder="Enter username" />
            <span v-if="!isLogin && checkingUsername" class="field-checking">···</span>
          </div>
          <p v-if="!isLogin && usernameError" class="field-hint error">{{ usernameError }}</p>
        </div>

        <!-- 密码 -->
        <div class="field-wrap">
          <label class="field-label">PASSWORD</label>
          <div class="field-box">
            <span class="field-prefix">PW</span>
            <input type="password" v-model="form.password" required autocomplete="current-password"
              class="field-input" placeholder="Enter password" />
          </div>
        </div>

        <!-- 确认密码（注册模式） -->
        <div v-if="!isLogin" class="field-wrap">
          <label class="field-label">CONFIRM PASSWORD</label>
          <div class="field-box" :class="{ 'field-error': passwordError }">
            <span class="field-prefix">CF</span>
            <input type="password" v-model="form.confirmPassword" required autocomplete="new-password"
              class="field-input" placeholder="Repeat password" />
          </div>
          <p v-if="passwordError" class="field-hint error">{{ passwordError }}</p>
        </div>

        <!-- 提交按钮 -->
        <button type="submit" :disabled="loading || (!isLogin && !isFormValid)" class="submit-btn">
          <span v-if="!loading" class="btn-text">
            {{ isLogin ? 'AUTHENTICATE' : 'REGISTER' }}
          </span>
          <span v-else class="btn-loading">
            <span></span><span></span><span></span>
          </span>
          <div class="btn-scan"></div>
        </button>
      </form>

      <!-- 切换模式 -->
      <div class="mode-switch">
        <span>{{ isLogin ? 'No account?' : 'Have an account?' }}</span>
        <button @click="toggleMode" class="switch-btn">
          {{ isLogin ? 'REGISTER' : 'SIGN IN' }}
        </button>
      </div>

      <!-- 底部装饰线 -->
      <div class="card-footer">
        <span>INTELLIGENT HELMET SYSTEM</span>
        <span>BUILD 2025.03</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const canvasRef = ref(null)

const isLogin = ref(true)
const loading = ref(false)
const errorMessage = ref('')
const usernameError = ref('')
const passwordError = ref('')
const checkingUsername = ref(false)

const form = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const isFormValid = computed(() => {
  return form.username.length >= 3 &&
    form.password.length >= 6 &&
    form.password === form.confirmPassword &&
    !usernameError.value
})

const toggleMode = () => {
  isLogin.value = !isLogin.value
  errorMessage.value = ''
  usernameError.value = ''
  passwordError.value = ''
  form.username = ''
  form.password = ''
  form.confirmPassword = ''
}

watch(() => form.username, async (val) => {
  if (isLogin.value) return
  if (val.length < 3) { usernameError.value = ''; return }
  if (val.length > 20) { usernameError.value = 'Username must be 3-20 characters'; return }
  checkingUsername.value = true
  usernameError.value = ''
  try {
    const res = await fetch(`http://localhost:8082/api/auth/check-username/${val}`)
    const data = await res.json()
    if (data.exists) usernameError.value = 'Username already taken'
  } catch {
    usernameError.value = 'Network error'
  } finally {
    checkingUsername.value = false
  }
})

watch([() => form.password, () => form.confirmPassword], () => {
  if (isLogin.value) return
  passwordError.value = form.password !== form.confirmPassword ? 'Passwords do not match' : ''
})

const handleSubmit = async () => {
  errorMessage.value = ''
  loading.value = true

  if (isLogin.value) {
    try {
      const res = await fetch('http://localhost:8082/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, password: form.password })
      })
      const data = await res.json()
      if (data.success) {
        userStore.login({
          username: data.username,
          token: data.token,
          role: data.role,
          deviceId: data.deviceId
        })
        router.push('/app')
      } else {
        errorMessage.value = data.message || 'Invalid username or password'
      }
    } catch {
      errorMessage.value = 'Network error, please try again'
    } finally {
      loading.value = false
    }
  } else {
    if (!isFormValid.value) {
      errorMessage.value = 'Please check your input'
      loading.value = false
      return
    }
    try {
      const res = await fetch('http://localhost:8082/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, password: form.password })
      })
      const data = await res.json()
      if (res.ok) {
        toggleMode()
      } else {
        errorMessage.value = data.error || 'Registration failed, please try again'
      }
    } catch {
      errorMessage.value = 'Network error, please try again'
    } finally {
      loading.value = false
    }
  }
}

// ── Canvas 背景：网格 + 流动节点 ──
let animFrameId

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  let W = canvas.width = window.innerWidth
  let H = canvas.height = window.innerHeight

  // 网格节点
  const nodes = []
  const cols = Math.ceil(W / 80)
  const rows = Math.ceil(H / 80)
  for (let i = 0; i <= cols; i++) {
    for (let j = 0; j <= rows; j++) {
      nodes.push({
        x: i * 80 + (Math.random() - 0.5) * 20,
        y: j * 80 + (Math.random() - 0.5) * 20,
        ox: i * 80,
        oy: j * 80,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.2 + 0.4,
        pulse: Math.random() * Math.PI * 2
      })
    }
  }

  // 流动数据粒子
  const streams = Array.from({ length: 8 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    speed: Math.random() * 1.5 + 0.5,
    len: Math.random() * 60 + 30,
    alpha: Math.random() * 0.4 + 0.1
  }))

  let t = 0

  const draw = () => {
    t += 0.008
    ctx.fillStyle = 'rgba(8, 10, 18, 0.18)'
    ctx.fillRect(0, 0, W, H)

    // 网格线
    ctx.strokeStyle = 'rgba(251, 146, 60, 0.04)'
    ctx.lineWidth = 1
    for (let i = 0; i <= cols; i++) {
      ctx.beginPath()
      ctx.moveTo(i * 80, 0)
      ctx.lineTo(i * 80, H)
      ctx.stroke()
    }
    for (let j = 0; j <= rows; j++) {
      ctx.beginPath()
      ctx.moveTo(0, j * 80)
      ctx.lineTo(W, j * 80)
      ctx.stroke()
    }

    // 节点
    nodes.forEach(n => {
      n.x += n.vx
      n.y += n.vy
      n.pulse += 0.02
      if (Math.abs(n.x - n.ox) > 15) n.vx *= -1
      if (Math.abs(n.y - n.oy) > 15) n.vy *= -1

      const alpha = 0.25 + Math.sin(n.pulse) * 0.15
      ctx.beginPath()
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(251, 146, 60, ${alpha})`
      ctx.fill()
    })

    // 节点连线
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x
        const dy = nodes[i].y - nodes[j].y
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < 100) {
          ctx.beginPath()
          ctx.strokeStyle = `rgba(251, 146, 60, ${0.08 * (1 - d / 100)})`
          ctx.lineWidth = 0.5
          ctx.moveTo(nodes[i].x, nodes[i].y)
          ctx.lineTo(nodes[j].x, nodes[j].y)
          ctx.stroke()
        }
      }
    }

    // 流动数据流
    streams.forEach(s => {
      s.y += s.speed
      if (s.y > H + s.len) { s.y = -s.len; s.x = Math.random() * W }
      const grad = ctx.createLinearGradient(s.x, s.y - s.len, s.x, s.y)
      grad.addColorStop(0, 'rgba(251,146,60,0)')
      grad.addColorStop(1, `rgba(251,146,60,${s.alpha})`)
      ctx.beginPath()
      ctx.strokeStyle = grad
      ctx.lineWidth = 1
      ctx.moveTo(s.x, s.y - s.len)
      ctx.lineTo(s.x, s.y)
      ctx.stroke()
    })

    animFrameId = requestAnimationFrame(draw)
  }

  draw()

  const onResize = () => {
    W = canvas.width = window.innerWidth
    H = canvas.height = window.innerHeight
  }
  window.addEventListener('resize', onResize)

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize)
    cancelAnimationFrame(animFrameId)
  })
})
</script>

<style scoped>
/* ── 根容器 ── */
.auth-root {
  position: relative;
  min-height: 100vh;
  background: #080a12;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-family: 'Courier New', 'Consolas', monospace;
}

.auth-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
}

/* 扫描线 */
.scanline-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.08) 2px,
    rgba(0, 0, 0, 0.08) 4px
  );
  pointer-events: none;
}

/* ── 主卡片 ── */
.auth-card {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 420px;
  margin: 16px;
  background: rgba(12, 15, 26, 0.92);
  border: 1px solid rgba(251, 146, 60, 0.25);
  box-shadow:
    0 0 0 1px rgba(251, 146, 60, 0.08),
    0 0 40px rgba(251, 146, 60, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px));
}

/* ── 顶部状态栏 ── */
.card-topbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  border-bottom: 1px solid rgba(251, 146, 60, 0.15);
  background: rgba(251, 146, 60, 0.04);
}
.topbar-tag {
  font-size: 9px;
  letter-spacing: 0.2em;
  color: #fb923c;
  background: rgba(251, 146, 60, 0.15);
  padding: 2px 6px;
  border: 1px solid rgba(251, 146, 60, 0.3);
}
.topbar-title {
  flex: 1;
  font-size: 10px;
  letter-spacing: 0.15em;
  color: #9ca3af;
}
.topbar-status {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 9px;
  letter-spacing: 0.15em;
  color: #4ade80;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 6px #4ade80;
  animation: blink 2s ease-in-out infinite;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* ── Logo ── */
.logo-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 0 16px;
  gap: 12px;
}
.logo-hex {
  width: 64px;
  height: 64px;
  background: rgba(251, 146, 60, 0.08);
  border: 1px solid rgba(251, 146, 60, 0.4);
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fb923c;
  box-shadow: 0 0 20px rgba(251, 146, 60, 0.2);
}
.logo-lines {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 40px;
}
.logo-line-1 {
  height: 1px;
  background: linear-gradient(90deg, transparent, #fb923c, transparent);
  animation: scan 2s ease-in-out infinite;
}
.logo-line-2 {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(251,146,60,0.4), transparent);
  animation: scan 2s ease-in-out infinite 0.3s;
}
@keyframes scan {
  0%, 100% { opacity: 0.3; transform: scaleX(0.5); }
  50% { opacity: 1; transform: scaleX(1); }
}

/* ── 标题 ── */
.auth-title {
  text-align: center;
  padding: 0 32px 24px;
}
.auth-title h2 {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: #f1f5f9;
  margin: 0 0 6px;
}
.auth-title p {
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #6b7280;
  margin: 0;
}

/* ── 错误提示 ── */
.error-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 24px 16px;
  padding: 10px 14px;
  font-size: 11px;
  letter-spacing: 0.05em;
  color: #f87171;
  background: rgba(248, 113, 113, 0.08);
  border: 1px solid rgba(248, 113, 113, 0.25);
  border-left: 3px solid #f87171;
}

/* ── 表单 ── */
.auth-form {
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field-label {
  font-size: 9px;
  letter-spacing: 0.2em;
  color: #fb923c;
  font-weight: 600;
}
.field-box {
  display: flex;
  align-items: center;
  border: 1px solid rgba(251, 146, 60, 0.2);
  border-left: 3px solid rgba(251, 146, 60, 0.5);
  background: rgba(251, 146, 60, 0.03);
  transition: border-color 0.2s, background 0.2s;
}
.field-box:focus-within {
  border-color: rgba(251, 146, 60, 0.6);
  border-left-color: #fb923c;
  background: rgba(251, 146, 60, 0.06);
  box-shadow: 0 0 12px rgba(251, 146, 60, 0.08);
}
.field-box.field-error {
  border-color: rgba(248, 113, 113, 0.4);
  border-left-color: #f87171;
}
.field-prefix {
  padding: 0 10px;
  font-size: 9px;
  letter-spacing: 0.1em;
  color: rgba(251, 146, 60, 0.5);
  border-right: 1px solid rgba(251, 146, 60, 0.15);
  user-select: none;
}
.field-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  padding: 11px 12px;
  font-size: 13px;
  font-family: inherit;
  color: #e2e8f0;
  letter-spacing: 0.05em;
}
.field-input::placeholder { color: #374151; }
.field-checking {
  padding: 0 10px;
  font-size: 14px;
  color: #fb923c;
  letter-spacing: 0.2em;
  animation: blink 0.8s ease-in-out infinite;
}
.field-hint {
  font-size: 10px;
  letter-spacing: 0.05em;
  margin: 0;
}
.field-hint.error { color: #f87171; }

/* ── 提交按钮 ── */
.submit-btn {
  position: relative;
  overflow: hidden;
  margin-top: 8px;
  padding: 14px;
  background: rgba(251, 146, 60, 0.1);
  border: 1px solid rgba(251, 146, 60, 0.4);
  color: #fb923c;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.25em;
  cursor: pointer;
  transition: all 0.2s;
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
}
.submit-btn:hover:not(:disabled) {
  background: rgba(251, 146, 60, 0.18);
  border-color: #fb923c;
  color: #fff;
  box-shadow: 0 0 20px rgba(251, 146, 60, 0.25);
}
.submit-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.btn-text { position: relative; z-index: 1; }
.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}
.btn-loading span {
  width: 5px;
  height: 5px;
  background: #fb923c;
  animation: dot-pulse 1s ease-in-out infinite;
}
.btn-loading span:nth-child(2) { animation-delay: 0.2s; }
.btn-loading span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dot-pulse {
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}
/* 扫描动画 */
.btn-scan {
  position: absolute;
  top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(251,146,60,0.12), transparent);
  animation: btn-scan 3s ease-in-out infinite;
}
@keyframes btn-scan {
  0% { left: -100%; }
  50%, 100% { left: 100%; }
}

/* ── 切换模式 ── */
.mode-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 24px 0;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #6b7280;
}
.switch-btn {
  background: none;
  border: none;
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: #fb923c;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.switch-btn:hover { color: #fdba74; }

/* ── 底部 ── */
.card-footer {
  display: flex;
  justify-content: space-between;
  padding: 16px 24px 20px;
  margin-top: 20px;
  border-top: 1px solid rgba(251, 146, 60, 0.1);
  font-size: 9px;
  letter-spacing: 0.12em;
  color: #374151;
}
</style>
