<template>
  <div class="auth-root">
    <!-- Video background: video 隐藏用于解码，canvas 渲染，避免浏览器媒体控件 -->
    <video ref="loginVideoRef" class="auth-video-hidden" autoplay loop muted playsinline
      disablePictureInPicture @loadeddata="startLoginDraw">
      <source src="/background.mp4" type="video/mp4">
    </video>
    <canvas ref="loginCanvasRef" class="auth-video"></canvas>

    <!-- Main content -->
    <div class="auth-content">

      <!-- ── Verifying state ── -->
      <div v-if="isVerifying" class="auth-card verify-card">
        <div class="verify-body">
          <div class="verify-spinner-wrap">
            <div class="verify-spinner"></div>
            <div class="verify-spinner-icon">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
              </svg>
            </div>
          </div>
          <h3 class="verify-title">安全通道自动登录</h3>
          <p class="verify-sub">安全会话建立序列</p>
          <div class="verify-log">
            <div
              v-for="(log, i) in verificationLogs.slice(0, verificationStep + 1)"
              :key="i"
              class="verify-log-line"
              :class="{ active: i === verificationStep }"
            >
              <span class="log-arrow">&gt;</span>
              {{ log }}
            </div>
          </div>
        </div>
        <div class="verify-footer">安全通道保护</div>
      </div>

      <!-- ── Success state ── -->
      <div v-else-if="loggedInUser" class="auth-card success-card">
        <div class="success-body">
          <div class="success-icon-wrap">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <span class="success-badge">连接已建立</span>
          <h2 class="success-title">权限已通过</h2>
          <p class="success-sub">
            欢迎进入系统,
            <span class="success-name">{{ loggedInUser.username }}</span>
          </p>
          <div class="success-board">
            <div class="board-row">
              <span class="board-key">已认证身份码</span>
              <span class="board-val">{{ loggedInUser.username }}</span>
            </div>
            <div class="board-grid">
              <div class="board-cell">
                <div class="cell-label cyan">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                  <span>安全级别</span>
                </div>
                <div class="cell-val">JWT 认证</div>
              </div>
              <div class="board-cell">
                <div class="cell-label violet">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                  <span>权限等级</span>
                </div>
                <div class="cell-val">{{ loggedInUser.role || 'USER' }}</div>
              </div>
            </div>
            <div class="board-session">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="session-icon"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
              <span>会话已加载 — 正在重定向到仪表板...</span>
            </div>
          </div>
          <button class="logout-btn" @click="handleLogout">终止会话</button>
        </div>
      </div>

      <!-- ── Main auth card ── -->
      <div v-else class="auth-card main-card">
        <!-- Top accent line -->
        <div class="card-accent"></div>

        <!-- Header -->
        <div class="card-header">
          <div class="header-icon">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <h2 class="header-title">用户登录</h2>
          <p class="header-sub">
            <template v-if="mode === 'signin'">访问安全可视化计算界面</template>
            <template v-else-if="mode === 'signup'">部署您的凭据以创建配置文件</template>
            <template v-else>下发安全指令至凭证终端</template>
          </p>
        </div>

        <!-- Tab switcher (signin / signup) -->
        <div v-if="mode !== 'forgot'" class="tab-bar">
          <button
            class="tab-btn"
            :class="{ active: mode === 'signin' }"
            @click="setMode('signin')"
          >登录</button>
          <button
            class="tab-btn"
            :class="{ active: mode === 'signup' }"
            @click="setMode('signup')"
          >注册</button>
        </div>

        <!-- Error block -->
        <div v-if="errorMessage" class="error-block">
          <div class="error-dot"></div>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="auth-form">

          <!-- Full name (signup only) -->
          <div v-if="mode === 'signup'" class="field-group">
            <label class="field-label">用户名</label>
            <div class="field-box" :class="{ 'field-error': usernameError }">
              <svg class="field-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
              <input
                type="text"
                v-model="form.username"
                placeholder="your_username"
                class="field-input"
                autocomplete="username"
              />
              <span v-if="checkingUsername" class="field-checking">···</span>
            </div>
            <p v-if="usernameError" class="field-hint-error">{{ usernameError }}</p>
          </div>

          <!-- Username / email (signin) -->
          <div v-if="mode === 'signin' || mode === 'forgot'" class="field-group">
            <label class="field-label">用户名</label>
            <div class="field-box">
              <svg class="field-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
              <input
                type="text"
                v-model="form.username"
                placeholder="your_username"
                class="field-input"
                autocomplete="username"
              />
            </div>
          </div>

          <!-- Password -->
          <div v-if="mode !== 'forgot'" class="field-group">
            <div class="field-label-row">
              <label class="field-label">密码</label>
              <button
                v-if="mode === 'signin'"
                type="button"
                class="forgot-link"
                @click="setMode('forgot')"
              >忘记密码?</button>
            </div>
            <div class="field-box">
              <svg class="field-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="form.password"
                placeholder="••••••••"
                class="field-input"
                autocomplete="current-password"
              />
              <button type="button" class="eye-btn" @click="showPassword = !showPassword">
                <svg v-if="showPassword" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                <svg v-else width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
            </div>

            <!-- Password strength meter (signup only) -->
            <div v-if="mode === 'signup' && form.password.length > 0" class="strength-meter">
              <div class="strength-header">
                <span class="strength-key">报文完整性校验：</span>
                <span class="strength-val" :class="strengthTextClass">{{ strengthLabel }}</span>
              </div>
              <div class="strength-bars">
                <div
                  v-for="n in 4"
                  :key="n"
                  class="strength-bar"
                  :class="n <= passwordStrength ? strengthBarClass : 'bar-empty'"
                ></div>
              </div>
              <div class="strength-reqs">
                <div class="req-item" :class="{ 'req-met': form.password.length >= 8 }">
                  <div class="req-dot"></div><span>字符长度：8位及以上</span>
                </div>
                <div class="req-item" :class="{ 'req-met': /[A-Z]/.test(form.password) }">
                  <div class="req-dot"></div><span>包含大写字母</span>
                </div>
                <div class="req-item" :class="{ 'req-met': /[0-9]/.test(form.password) }">
                  <div class="req-dot"></div><span>包含数字</span>
                </div>
                <div class="req-item" :class="{ 'req-met': /[^A-Za-z0-9]/.test(form.password) }">
                  <div class="req-dot"></div><span>特殊符号</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Confirm password (signup only) -->
          <div v-if="mode === 'signup'" class="field-group">
            <label class="field-label">再次输入密码</label>
            <div class="field-box" :class="{ 'field-error': passwordMismatch }">
              <svg class="field-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="form.confirmPassword"
                placeholder="••••••••"
                class="field-input"
                autocomplete="new-password"
              />
            </div>
            <p v-if="passwordMismatch" class="field-hint-error">密码不匹配</p>
          </div>

          <!-- Forgot mode: transmit button + back -->
          <template v-if="mode === 'forgot'">
            <button type="submit" class="submit-btn gradient-btn">
              <span>Transmit Instructions</span>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </button>
            <button type="button" class="back-link" @click="setMode('signin')">
              BACK TO SECURE SIGN IN
            </button>
          </template>

          <!-- Normal submit -->
          <button v-else type="submit" :disabled="loading" class="submit-btn gradient-btn">
            <span v-if="!loading">{{ mode === 'signin' ? 'Verify Identity' : 'Establish Profile' }}</span>
            <span v-else class="btn-dots">
              <span></span><span></span><span></span>
            </span>
            <svg v-if="!loading" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          </button>
        </form>

        <!-- Social divider -->
        <div v-if="mode !== 'forgot'" class="social-section">
          <div class="divider">
            <div class="divider-line"></div>
            <span class="divider-text">安全鉴权握手</span>
            <div class="divider-line"></div>
          </div>
          <div class="social-btns">
            <button class="social-btn" @click="handleSocialClick('Google')" title="Google">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              <span>Google</span>
            </button>
            <button class="social-btn" @click="handleSocialClick('GitHub')" title="GitHub">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
              <span>GitHub</span>
            </button>
            <button class="social-btn" @click="handleSocialClick('Apple')" title="Apple">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              <span>Apple</span>
            </button>
          </div>
          <div class="demo-wrap">
            <button type="button" class="demo-btn" @click="handleDemoLogin">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" /></svg>
              <span>临时用户快速登录</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="page-footer">&copy; {{ new Date().getFullYear() }} 智能头盔系统，所有握手连接已安全建立</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// ── 登录页视频背景（canvas 渲染）──
const loginVideoRef = ref(null)
const loginCanvasRef = ref(null)
let loginRafId = null

function startLoginDraw() {
  const video = loginVideoRef.value
  const canvas = loginCanvasRef.value
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
    loginRafId = requestAnimationFrame(draw)
  }
  draw()
}

// ── State ──
const mode = ref('signin') // 'signin' | 'signup' | 'forgot'
const loading = ref(false)
const errorMessage = ref('')
const usernameError = ref('')
const checkingUsername = ref(false)
const showPassword = ref(false)
const isVerifying = ref(false)
const verificationStep = ref(0)
const loggedInUser = ref(null)

const form = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

// ── Helpers ──
function setMode(m) {
  mode.value = m
  errorMessage.value = ''
  usernameError.value = ''
  form.username = ''
  form.password = ''
  form.confirmPassword = ''
  showPassword.value = false
}

const passwordMismatch = computed(() =>
  mode.value === 'signup' && form.confirmPassword.length > 0 && form.password !== form.confirmPassword
)

// Password strength
const passwordStrength = computed(() => {
  const p = form.password
  if (!p) return 0
  let s = 0
  if (p.length >= 8) s++
  if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
})

const strengthLabel = computed(() => {
  switch (passwordStrength.value) {
    case 1: return 'Weak'
    case 2: return 'Fair'
    case 3: return 'Good'
    case 4: return 'Ultra Secure'
    default: return 'Empty'
  }
})

const strengthTextClass = computed(() => {
  switch (passwordStrength.value) {
    case 1: return 'text-red'
    case 2: return 'text-orange'
    case 3: return 'text-yellow'
    case 4: return 'text-emerald'
    default: return 'text-muted'
  }
})

const strengthBarClass = computed(() => {
  switch (passwordStrength.value) {
    case 1: return 'bar-red'
    case 2: return 'bar-orange'
    case 3: return 'bar-yellow'
    case 4: return 'bar-emerald'
    default: return 'bar-empty'
  }
})

// ── Username availability check ──
let usernameCheckTimer = null
watch(() => form.username, (val) => {
  if (mode.value !== 'signup') return
  usernameError.value = ''
  clearTimeout(usernameCheckTimer)
  if (val.length < 3) return
  if (val.length > 20) { usernameError.value = 'Username must be 3-20 characters'; return }
  checkingUsername.value = true
  usernameCheckTimer = setTimeout(async () => {
    try {
      const res = await fetch(`/api/auth/check-username/${val}`)
      const data = await res.json()
      if (data.exists) usernameError.value = 'Username already taken'
    } catch {
      // silently ignore network errors during check
    } finally {
      checkingUsername.value = false
    }
  }, 500)
})

// ── Verification animation ──
const verificationLogs = [
  'Deploying secure quantum encapsulation layers...',
  'Authenticating handshake protocol sequence with primary keys...',
  'Finalizing validation tokens and allocating session cookies...',
  'Authorized! Handshake finished.'
]

let verifyTimers = []
function runVerification(onComplete) {
  isVerifying.value = true
  verificationStep.value = 0
  verifyTimers.forEach(clearTimeout)
  verifyTimers = [
    setTimeout(() => { verificationStep.value = 1 }, 600),
    setTimeout(() => { verificationStep.value = 2 }, 1200),
    setTimeout(() => { verificationStep.value = 3 }, 1800),
    setTimeout(() => {
      isVerifying.value = false
      onComplete()
    }, 2500)
  ]
}

// ── Submit ──
async function handleSubmit() {
  errorMessage.value = ''

  if (mode.value === 'forgot') {
    // UI-only: show a brief message
    errorMessage.value = 'Password reset is not supported in this build.'
    return
  }

  if (mode.value === 'signin') {
    if (!form.username || !form.password) {
      errorMessage.value = 'Please enter username and password'
      return
    }
    loading.value = true
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, password: form.password })
      })
      const data = await res.json()
      if (data.success) {
        userStore.login({ username: data.username, token: data.token, role: data.role, deviceId: data.deviceId })
        runVerification(() => {
          loggedInUser.value = { username: data.username, role: data.role }
          const target = data.role === 'admin' ? '/admin' : '/app'
          setTimeout(() => router.push(target), 1200)
        })
      } else {
        errorMessage.value = data.message || 'Invalid username or password'
      }
    } catch {
      errorMessage.value = 'Network error, please try again'
    } finally {
      loading.value = false
    }
  } else {
    // signup
    if (form.username.length < 3) { errorMessage.value = 'Username must be at least 3 characters'; return }
    if (form.password.length < 6) { errorMessage.value = 'Password must be at least 6 characters'; return }
    if (form.password !== form.confirmPassword) { errorMessage.value = 'Passwords do not match'; return }
    if (usernameError.value) { errorMessage.value = usernameError.value; return }
    loading.value = true
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, password: form.password })
      })
      const data = await res.json()
      if (res.ok) {
        setMode('signin')
        errorMessage.value = ''
        // Show a brief success hint via the error block (reuse styling)
        setTimeout(() => { errorMessage.value = '' }, 100)
      } else {
        errorMessage.value = data.error || data.message || 'Registration failed'
      }
    } catch {
      errorMessage.value = 'Network error, please try again'
    } finally {
      loading.value = false
    }
  }
}

function handleDemoLogin() {
  form.username = 'demo'
  form.password = 'Demo123!'
  mode.value = 'signin'
  errorMessage.value = ''
  // Trigger login directly
  handleSubmit()
}

function handleSocialClick(provider) {
  if (provider === 'GitHub') {
    window.location.href = '/api/auth/oauth/github/authorize'
    return
  }
  errorMessage.value = `${provider} 登录暂未开放`
}

function handleLogout() {
  loggedInUser.value = null
  userStore.logout?.()
  setMode('signin')
}

onBeforeUnmount(() => {
  verifyTimers.forEach(clearTimeout)
  cancelAnimationFrame(loginRafId)
  window.removeEventListener('resize', () => {})
})
</script>

<style scoped>
/* ── Root ── */
.auth-root {
  position: relative;
  min-height: 100vh;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-family: 'Inter', 'Segoe UI', sans-serif;
}

.auth-video-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.auth-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  pointer-events: none;
}

/* ── Content wrapper ── */
.auth-content {
  position: relative;
  z-index: 10;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px;
}

.brand-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.25em;
  color: #22d3ee;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  margin-bottom: 24px;
  text-shadow: 0 0 12px rgba(34, 211, 238, 0.5);
}

/* ── Card base ── */
.auth-card {
  width: 100%;
  max-width: 460px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 0 0 1px rgba(255,255,255,0.04), 0 25px 50px rgba(0,0,0,0.5);
  overflow: hidden;
}

/* ── Verifying card ── */
.verify-card { padding: 32px; min-height: 420px; display: flex; flex-direction: column; justify-content: space-between; }
.verify-body { display: flex; flex-direction: column; align-items: center; text-align: center; flex: 1; padding: 16px 0; }
.verify-spinner-wrap { position: relative; width: 64px; height: 64px; margin-bottom: 24px; }
.verify-spinner {
  width: 64px; height: 64px; border-radius: 50%;
  border: 2px dashed #22d3ee;
  animation: spin 3s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.verify-spinner-icon {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  color: #22d3ee;
}
.verify-title { font-size: 18px; font-weight: 700; letter-spacing: 0.1em; color: #22d3ee; text-transform: uppercase; margin-bottom: 4px; text-shadow: 0 0 12px rgba(34,211,238,0.4); }
.verify-sub { font-size: 11px; font-family: monospace; color: white; margin-bottom: 24px; }
.verify-log {
  width: 100%;
  background: rgba(9,9,11,0.6);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px;
  padding: 16px;
  font-family: monospace;
  font-size: 11px;
  text-align: left;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.verify-log-line { color: white; display: flex; gap: 8px; }
.verify-log-line.active { color: #22d3ee; }
.log-arrow { color: #8b5cf6; flex-shrink: 0; }
.verify-footer { font-size: 10px; font-family: monospace; color: #3f3f46; text-align: center; text-transform: uppercase; letter-spacing: 0.1em; }

/* ── Success card ── */
.success-card { padding: 32px; }
.success-body { display: flex; flex-direction: column; align-items: center; text-align: center; }
.success-icon-wrap {
  width: 64px; height: 64px; border-radius: 50%;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  display: flex; align-items: center; justify-content: center;
  color: #34d399; margin-bottom: 20px;
  box-shadow: inset 0 0 20px rgba(16,185,129,0.1);
}
.success-badge {
  font-size: 11px; font-family: monospace; color: #34d399;
  background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2);
  padding: 4px 12px; border-radius: 999px; letter-spacing: 0.1em; margin-bottom: 12px;
}
.success-title { font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 4px; }
.success-sub { font-size: 14px; color: #a1a1aa; margin-bottom: 24px; }
.success-name { color: #22d3ee; font-weight: 500; }
.success-board {
  width: 100%;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  text-align: left;
}
.board-row { display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 16px; }
.board-key { font-size: 11px; font-family: monospace; color: white; }
.board-val { font-size: 12px; color: #d4d4d8; font-weight: 500; }
.board-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
.board-cell { background: rgba(9,9,11,0.4); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 12px; }
.cell-label { display: flex; align-items: center; gap: 6px; font-size: 10px; font-family: monospace; letter-spacing: 0.1em; margin-bottom: 4px; }
.cell-label.cyan { color: #22d3ee; }
.cell-label.violet { color: #a78bfa; }
.cell-val { font-size: 14px; font-weight: 600; color: #fff; }
.board-session { display: flex; align-items: center; gap: 12px; background: rgba(9,9,11,0.2); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 12px; font-size: 11px; font-family: monospace; color: #71717a; }
.session-icon { color: #34d399; flex-shrink: 0; }
.logout-btn {
  width: 100%; padding: 12px;
  background: linear-gradient(135deg, rgba(239,68,68,0.2), rgba(249,115,22,0.2));
  border: 1px solid rgba(239,68,68,0.3);
  border-radius: 12px;
  color: #fca5a5; font-size: 12px; font-weight: 600;
  letter-spacing: 0.1em; text-transform: uppercase;
  cursor: pointer; transition: all 0.2s;
}
.logout-btn:hover { background: linear-gradient(135deg, rgba(239,68,68,0.3), rgba(249,115,22,0.3)); }

/* ── Main card ── */
.main-card { padding: 32px; position: relative; }
.card-accent {
  position: absolute; top: 0; left: 25%; right: 25%; height: 2px;
  background: linear-gradient(90deg, #06b6d4, #8b5cf6, #7c3aed);
  filter: blur(2px); opacity: 0.6;
}

/* Header */
.card-header { display: flex; flex-direction: column; align-items: center; margin-bottom: 28px; }
.header-icon {
  width: 48px; height: 48px; border-radius: 12px;
  background: linear-gradient(135deg, rgba(6,182,212,0.2), rgba(139,92,246,0.1));
  border: 1px solid rgba(6,182,212,0.3);
  display: flex; align-items: center; justify-content: center;
  color: #22d3ee; margin-bottom: 16px;
}
.header-title { font-size: 24px; font-weight: 700; color: #fff; letter-spacing: -0.02em; margin-bottom: 4px; }
.header-sub { font-size: 12px; color: #71717a; text-align: center; }

/* Tab bar */
.tab-bar {
  display: flex; padding: 4px;
  background: rgba(9,9,11,0.6);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  margin-bottom: 24px;
}
.tab-btn {
  flex: 1; padding: 8px;
  font-size: 12px; font-weight: 600;
  border: none; background: transparent;
  color: white; border-radius: 8px;
  cursor: pointer; transition: all 0.2s;
}
.tab-btn.active {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
}
.tab-btn:not(.active):hover { color: #d4d4d8; }

/* Error block */
.error-block {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 14px; border-radius: 12px;
  border: 1px solid rgba(239,68,68,0.2);
  background: rgba(239,68,68,0.05);
  font-size: 12px; font-family: monospace;
  color: #fca5a5; margin-bottom: 16px;
}
.error-dot { width: 8px; height: 8px; border-radius: 50%; background: #ef4444; flex-shrink: 0; margin-top: 2px; }

/* Form */
.auth-form { display: flex; flex-direction: column; gap: 16px; }
.field-group { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 11px; font-family: monospace; color: white; letter-spacing: 0.05em; }
.field-label-row { display: flex; justify-content: space-between; align-items: center; }
.forgot-link { font-size: 11px; font-family: monospace; color: #22d3ee; background: none; border: none; cursor: pointer; padding: 0; transition: color 0.2s; }
.forgot-link:hover { color: #67e8f9; }

.field-box {
  display: flex; align-items: center;
  background: rgba(9,9,11,0.4);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.field-box:focus-within {
  border-color: rgba(6,182,212,0.5);
  box-shadow: 0 0 0 3px rgba(6,182,212,0.1);
}
.field-box.field-error { border-color: rgba(239,68,68,0.4); }
.field-icon { color: white; margin-left: 12px; flex-shrink: 0; transition: color 0.2s; }
.field-box:focus-within .field-icon { color: #22d3ee; }
.field-input {
  flex: 1; background: transparent; border: none; outline: none;
  padding: 10px 12px; font-size: 14px; color: #fff;
  font-family: inherit;
}
.field-input::placeholder { color: #3f3f46; }
/* 修复浏览器自动填充白色背景 */
.field-input:-webkit-autofill,
.field-input:-webkit-autofill:hover,
.field-input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0 1000px rgba(9,9,11,0.4) inset;
  -webkit-text-fill-color: #fff;
  caret-color: #fff;
  transition: background-color 5000s ease-in-out 0s;
}
.field-checking { padding: 0 12px; font-size: 14px; color: #22d3ee; font-family: monospace; animation: blink 0.8s ease-in-out infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
.eye-btn { background: none; border: none; cursor: pointer; padding: 0 12px; color: white; display: flex; align-items: center; transition: color 0.2s; }
.eye-btn:hover { color: #d4d4d8; }
.field-hint-error { font-size: 10px; color: #f87171; font-family: monospace; }

/* Strength meter */
.strength-meter {
  margin-top: 8px; padding: 12px;
  background: rgba(9,9,11,0.6);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 8px;
  font-family: monospace;
}
.strength-header { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 8px; }
.strength-key { color: white; text-transform: uppercase; }
.strength-val { font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.text-red { color: #f87171; }
.text-orange { color: #fb923c; }
.text-yellow { color: #facc15; }
.text-emerald { color: #34d399; }
.text-muted { color: white; }
.strength-bars { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; height: 4px; margin-bottom: 8px; }
.strength-bar { border-radius: 2px; transition: background 0.3s; }
.bar-empty { background: #27272a; }
.bar-red { background: #ef4444; }
.bar-orange { background: #f97316; }
.bar-yellow { background: #eab308; }
.bar-emerald { background: #10b981; }
.strength-reqs { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
.req-item { display: flex; align-items: center; gap: 4px; font-size: 9px; color: white; }
.req-item.req-met { color: #22d3ee; }
.req-dot { width: 4px; height: 4px; border-radius: 50%; background: currentColor; flex-shrink: 0; }

/* Submit button */
.submit-btn {
  width: 100%; padding: 12px 16px;
  border: none; border-radius: 12px;
  font-size: 12px; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: filter 0.2s, transform 0.1s;
  margin-top: 8px;
}
.gradient-btn { background: linear-gradient(135deg, #06b6d4, #8b5cf6); }
.gradient-btn:hover:not(:disabled) { filter: brightness(1.1); }
.gradient-btn:active:not(:disabled) { transform: scale(0.99); }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-dots { display: flex; gap: 4px; align-items: center; }
.btn-dots span { width: 5px; height: 5px; background: #fff; border-radius: 50%; animation: dot-pulse 1s ease-in-out infinite; }
.btn-dots span:nth-child(2) { animation-delay: 0.2s; }
.btn-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dot-pulse { 0%,100%{opacity:0.2;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }

.back-link {
  width: 100%; text-align: center;
  background: none; border: none;
  font-size: 12px; font-family: monospace;
  color: white; cursor: pointer;
  padding: 8px; transition: color 0.2s;
}
.back-link:hover { color: #d4d4d8; }

/* Social section */
.social-section { margin-top: 28px; }
.divider { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.05); }
.divider-text { font-size: 10px; font-family: monospace; color: white; text-transform: uppercase; letter-spacing: 0.1em; white-space: nowrap; }
.social-btns { display: flex; gap: 12px; }
.social-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 10px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  color: #a1a1aa; font-size: 12px; font-weight: 500;
  cursor: pointer; transition: all 0.2s;
}
.social-btn:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.15); color: #fff; }
.demo-wrap { display: flex; justify-content: center; margin-top: 16px; }
.demo-btn {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 11px; font-family: monospace;
  color: white; background: rgba(9,9,11,0.4);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 999px; padding: 6px 14px;
  cursor: pointer; transition: all 0.2s;
  text-transform: uppercase; letter-spacing: 0.05em;
}
.demo-btn:hover { color: #22d3ee; border-color: rgba(6,182,212,0.2); }
.demo-btn svg { color: #22d3ee; }

/* Footer */
.page-footer {
  margin-top: 24px;
  font-size: 11px; font-family: monospace;
  color: #3f3f46; letter-spacing: 0.05em;
  text-align: center;
}
</style>
