<template>
  <div class="relative min-h-screen bg-[#030712] flex items-center justify-center overflow-hidden font-sans">
    <!-- 动态粒子背景 Canvas -->
    <canvas ref="canvasRef" class="absolute inset-0 z-0"></canvas>

    <!-- 高端毛玻璃质感卡片 -->
    <div class="relative z-10 w-full max-w-md p-10 m-4 rounded-[2rem] bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(6,182,212,0.1)]">

      <!-- 顶部发光 Logo -->
      <div class="flex justify-center mb-10">
        <div class="relative w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)]">
          <div class="absolute inset-0 rounded-full bg-white/20 animate-ping" style="animation-duration: 3s;"></div>
          <svg class="w-8 h-8 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
          </svg>
        </div>
      </div>

      <!-- 标题区 -->
      <div class="text-center mb-10">
        <h2 class="text-3xl font-light text-white tracking-wide mb-2">
          {{ isLogin ? 'Welcome Back' : 'Create Account' }}
        </h2>
        <p class="text-sm text-slate-400 font-light">
          {{ isLogin ? 'Authenticate to access the neural network' : 'Join the next generation of riders' }}
        </p>
      </div>

      <!-- 错误提示 -->
      <div v-if="errorMessage" class="mb-6 flex items-center gap-2 text-red-400 text-sm px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
        <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {{ errorMessage }}
      </div>

      <!-- 表单区 (浮动标签设计) -->
      <form @submit.prevent="handleSubmit" class="space-y-6">

        <!-- 用户名 -->
        <div class="relative group">
          <input type="text" v-model="form.username" required id="username"
            class="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors peer placeholder-transparent"
            placeholder="Username" />
          <label for="username" class="absolute left-0 -top-3.5 text-xs text-cyan-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-cyan-400 cursor-text">Username</label>
          <p v-if="!isLogin && usernameError" class="mt-1 text-xs text-red-400">{{ usernameError }}</p>
          <p v-if="!isLogin && checkingUsername" class="mt-1 text-xs text-cyan-400">Checking...</p>
        </div>

        <!-- 密码 -->
        <div class="relative group">
          <input type="password" v-model="form.password" required id="password"
            class="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors peer placeholder-transparent"
            placeholder="Password" />
          <label for="password" class="absolute left-0 -top-3.5 text-xs text-cyan-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-cyan-400 cursor-text">Password</label>
        </div>

        <!-- 确认密码 (仅注册模式) -->
        <div v-if="!isLogin" class="relative group">
          <input type="password" v-model="form.confirmPassword" required id="confirmPassword"
            class="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors peer placeholder-transparent"
            placeholder="Confirm Password" />
          <label for="confirmPassword" class="absolute left-0 -top-3.5 text-xs text-cyan-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-cyan-400 cursor-text">Confirm Password</label>
          <p v-if="passwordError" class="mt-1 text-xs text-red-400">{{ passwordError }}</p>
        </div>

        <!-- 提交按钮 -->
        <button type="submit" :disabled="loading || (!isLogin && !isFormValid)"
          class="w-full py-4 mt-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium tracking-wide hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
          <span v-if="!loading">{{ isLogin ? 'Sign In' : 'Sign Up' }}</span>
          <span v-else>{{ isLogin ? 'Signing in...' : 'Signing up...' }}</span>
        </button>
      </form>

      <!-- 切换模式 -->
      <div class="mt-8 text-center">
        <p class="text-sm text-slate-400">
          {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
          <button @click="toggleMode" class="text-cyan-400 hover:text-cyan-300 font-medium transition-colors ml-1">
            {{ isLogin ? 'Create one' : 'Sign in' }}
          </button>
        </p>
      </div>
    </div>

    <!-- 返回主页按钮 -->
    <router-link to="/" class="absolute top-8 left-8 z-20 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group">
      <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
      Back to Home
    </router-link>
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

// 注册模式下检查用户名是否已存在
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

// 注册模式下校验两次密码
watch([() => form.password, () => form.confirmPassword], () => {
  if (isLogin.value) return
  passwordError.value = form.password !== form.confirmPassword ? 'Passwords do not match' : ''
})

const handleSubmit = async () => {
  errorMessage.value = ''
  loading.value = true

  if (isLogin.value) {
    // 登录
    try {
      const res = await fetch('http://localhost:8082/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, password: form.password })
      })
      const data = await res.json()
      if (data.success) {
        userStore.login({ username: data.username })
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
    // 注册
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
        errorMessage.value = ''
        // 用 cyan 色临时提示注册成功
        setTimeout(() => { errorMessage.value = '' }, 3000)
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

// ==========================================
// 高端科技粒子背景 (Canvas Particle System)
// ==========================================
let animationFrameId

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  let width = window.innerWidth
  let height = window.innerHeight
  canvas.width = width
  canvas.height = height

  const particles = []
  const particleCount = Math.min(Math.floor(window.innerWidth / 12), 120)

  let mouse = { x: null, y: null }

  const handleMouseMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY }
  const handleMouseLeave = () => { mouse.x = null; mouse.y = null }

  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseleave', handleMouseLeave)

  class Particle {
    constructor() {
      this.x = Math.random() * width
      this.y = Math.random() * height
      this.vx = (Math.random() - 0.5) * 0.6
      this.vy = (Math.random() - 0.5) * 0.6
      this.radius = Math.random() * 1.5 + 0.5
    }
    update() {
      this.x += this.vx
      this.y += this.vy
      if (this.x < 0 || this.x > width) this.vx = -this.vx
      if (this.y < 0 || this.y > height) this.vy = -this.vy
    }
    draw() {
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(6, 182, 212, 0.6)'
      ctx.fill()
    }
  }

  for (let i = 0; i < particleCount; i++) particles.push(new Particle())

  const animate = () => {
    ctx.fillStyle = 'rgba(3, 7, 18, 0.2)'
    ctx.fillRect(0, 0, width, height)

    for (let i = 0; i < particles.length; i++) {
      particles[i].update()
      particles[i].draw()

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120) {
          ctx.beginPath()
          ctx.strokeStyle = `rgba(6, 182, 212, ${0.15 - dist / 120 * 0.15})`
          ctx.lineWidth = 0.6
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.stroke()
        }
      }

      if (mouse.x != null && mouse.y != null) {
        const dx = particles[i].x - mouse.x
        const dy = particles[i].y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 150) {
          ctx.beginPath()
          ctx.strokeStyle = `rgba(6, 182, 212, ${0.3 - dist / 150 * 0.3})`
          ctx.lineWidth = 1
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.stroke()
        }
      }
    }
    animationFrameId = requestAnimationFrame(animate)
  }

  animate()

  const handleResize = () => {
    width = window.innerWidth
    height = window.innerHeight
    canvas.width = width
    canvas.height = height
  }
  window.addEventListener('resize', handleResize)

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseleave', handleMouseLeave)
    cancelAnimationFrame(animationFrameId)
  })
})
</script>
