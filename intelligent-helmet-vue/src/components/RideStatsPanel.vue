<template>
  <div class="ride-card" :class="{ 'ride-card--active': isRiding, 'ride-card--warning': speedWarning }">
    <!-- 顶部彩条 -->
    <div class="ride-card__bar"></div>

    <!-- 始终展开的主体 -->
    <div class="ride-card__body">
      <!-- 左：Lottie动画 + 速度 -->
      <div class="ride-card__speed-col">
        <!-- 骑行动画：仅骑行中显示 -->
        <canvas v-if="isRiding" ref="lottieCanvas" class="ride-lottie"></canvas>
        <!-- 未骑行时占位图标 -->
        <div v-else class="ride-lottie ride-lottie--idle">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.25">
            <circle cx="18.5" cy="17.5" r="3.5"/>
            <circle cx="5.5" cy="17.5" r="3.5"/>
            <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor"/>
            <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
          </svg>
        </div>

        <div class="ride-card__label-row">
          <div class="ride-card__badge" :class="{ 'ride-card__badge--idle': !isRiding }">
            <span class="ride-card__dot"></span>
            {{ isRiding ? '骑行中' : '待机' }}
          </div>
          <div class="ride-card__timer">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {{ isRiding ? formattedDuration : '--:--' }}
          </div>
        </div>
        <div class="ride-card__speed" :class="{ 'ride-card__speed--warn': speedWarning }">
          <span class="ride-card__speed-num">{{ isRiding ? currentSpeed.toFixed(1) : '--' }}</span>
          <span class="ride-card__speed-unit">km/h</span>
        </div>
        <div v-if="isRiding && speedWarning" class="ride-card__alert">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          注意减速
        </div>
        <div v-else class="ride-card__speed-hint">{{ isRiding ? '当前速度' : '等待 GPS 信号' }}</div>
      </div>

      <!-- 分隔线 -->
      <div class="ride-card__divider"></div>

      <!-- 右：统计数据 2×2 + 1 -->
      <div class="ride-card__stats">
        <div class="ride-card__stat">
          <span class="ride-card__stat-val">{{ isRiding ? formattedDistance : '--' }}</span>
          <span class="ride-card__stat-key">距离 km</span>
        </div>
        <div class="ride-card__stat">
          <span class="ride-card__stat-val">{{ isRiding ? avgSpeed.toFixed(1) : '--' }}</span>
          <span class="ride-card__stat-key">均速 km/h</span>
        </div>
        <div class="ride-card__stat">
          <span class="ride-card__stat-val">{{ isRiding ? maxSpeed.toFixed(1) : '--' }}</span>
          <span class="ride-card__stat-key">最高 km/h</span>
        </div>
        <div class="ride-card__stat">
          <span class="ride-card__stat-val">{{ isRiding ? formattedPace : '--' }}</span>
          <span class="ride-card__stat-key">配速 /km</span>
        </div>
        <div class="ride-card__stat ride-card__stat--cal">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 6v6l4 2"/></svg>
          <span class="ride-card__stat-val ride-card__stat-val--cal">{{ isRiding ? Math.round(calories) : '--' }}</span>
          <span class="ride-card__stat-key">卡路里 kcal</span>
          <button class="ride-history-btn" @click="goToRideHistory">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
            骑行记录
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { formatDuration } from '@/composables/useRideTracking.js'
import { DotLottie } from '@lottiefiles/dotlottie-web'

const props = defineProps({
  isRiding: { type: Boolean, default: false },
  currentSpeed: { type: Number, default: 0 },
  rideDistance: { type: Number, default: 0 },
  rideDuration: { type: Number, default: 0 },
  maxSpeed: { type: Number, default: 0 },
  avgSpeed: { type: Number, default: 0 },
  speedWarning: { type: Boolean, default: false },
  calories: { type: Number, default: 0 },
  pace: { type: Number, default: 0 }
})

const router = useRouter()
function goToRideHistory() { router.push('/ride-history') }

const formattedDuration = computed(() => formatDuration(props.rideDuration))
const formattedDistance = computed(() => props.rideDistance.toFixed(2))
const formattedPace = computed(() => {
  if (props.pace <= 0 || !isFinite(props.pace)) return '--'
  const mins = Math.floor(props.pace)
  const secs = Math.round((props.pace - mins) * 60)
  return `${mins}'${String(secs).padStart(2, '0')}"`
})

// Lottie
const lottieCanvas = ref(null)
let dotLottie = null

// 骑行开始时初始化，结束时销毁
watch(() => props.isRiding, (riding) => {
  if (riding) {
    // 等 canvas 渲染到 DOM 后再初始化
    setTimeout(() => {
      if (!lottieCanvas.value) return
      dotLottie = new DotLottie({
        canvas: lottieCanvas.value,
        src: '/animations/ride.lottie',
        loop: true,
        autoplay: true,
        speed: 1
      })
    }, 50)
  } else {
    dotLottie?.destroy()
    dotLottie = null
  }
})

// 速度变化时同步动画速率（10km/h 对应 speed=1，最快 3x）
watch(() => props.currentSpeed, (speed) => {
  if (dotLottie && props.isRiding) {
    const s = Math.max(0.4, Math.min(speed / 10, 3))
    dotLottie.setSpeed(s)
  }
})

onUnmounted(() => {
  dotLottie?.destroy()
})
</script>

<style scoped>
/* Footer with ride history button */
.ride-history-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
  padding: 10px 10px;
  background: rgba(0, 243, 255, 0.05);
  border: 1px solid rgba(0, 243, 255, 0.18);
  color: rgba(0, 243, 255, 0.70);
  font-family: var(--font-mono, monospace);
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: all 0.18s;
  clip-path: polygon(5px 0%,100% 0%,100% calc(100% - 5px),calc(100% - 5px) 100%,0% 100%,0% 5px);
  flex-shrink: 0;
}
.ride-history-btn:hover {
  background: rgba(0, 243, 255, 0.12);
  border-color: rgba(0, 243, 255, 0.45);
  color: #00F3FF;
  box-shadow: 0 0 10px rgba(0, 243, 255, 0.18);
}

/* ── Card Container ─────────────────────────────────────────────── */
.ride-card {
  position: relative;
  background: rgba(7, 7, 7, 0.90);
  border: 1px solid rgba(0, 243, 255, 0.10);
  overflow: hidden;
  backdrop-filter: blur(12px);
  transition: border-color 0.3s, box-shadow 0.3s;
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%);
}
/* cyber anchor top-left */
.ride-card::before {
  content: "";
  position: absolute;
  top: -1px; left: -1px;
  width: 12px; height: 12px;
  border-top: 2px solid #00F3FF;
  border-left: 2px solid #00F3FF;
  pointer-events: none;
  z-index: 10;
}

.ride-card--active {
  border-color: rgba(0, 243, 255, 0.20);
  box-shadow: 0 0 24px -6px rgba(0, 243, 255, 0.10);
}
.ride-card--warning {
  border-color: rgba(255, 170, 0, 0.25);
  box-shadow: 0 0 24px -6px rgba(255, 170, 0, 0.12);
}

/* Top color bar */
.ride-card__bar {
  height: 2px;
  background: rgba(0, 243, 255, 0.05);
  transition: background 0.4s;
}
.ride-card--active .ride-card__bar {
  background: linear-gradient(90deg, transparent, #00F3FF 40%, #00FF66 60%, transparent);
  animation: bar-flow 3s ease infinite;
}
.ride-card--warning .ride-card__bar {
  background: linear-gradient(90deg, transparent, #FFAA00 40%, #EF4444 60%, transparent) !important;
}
@keyframes bar-flow {
  0%,100% { opacity: 0.5; }
  50%      { opacity: 1; }
}

/* Lottie 骑行动画 */
.ride-lottie {
  width: 120px;
  height: 80px;
  display: block;
  margin-bottom: 4px;
}
.ride-lottie--idle {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(0, 243, 255, 0.2);
}

/* 待机 badge */
.ride-card__badge--idle {
  color: rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}
.ride-card__badge--idle .ride-card__dot {
  background: rgba(255, 255, 255, 0.2);
  animation: none;
}

/* ── Idle state ─────────────────────────────────────────────────── */
.ride-card__idle {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
}
.ride-card__idle-icon {
  width: 38px; height: 38px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0, 243, 255, 0.04);
  border: 1px solid rgba(0, 243, 255, 0.08);
  color: rgba(0, 243, 255, 0.25);
  clip-path: polygon(4px 0%,100% 0%,100% calc(100% - 4px),calc(100% - 4px) 100%,0% 100%,0% 4px);
  flex-shrink: 0;
}
.ride-card__idle-title {
  font-family: var(--font-mono, monospace);
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(0, 243, 255, 0.35);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 2px;
}
.ride-card__idle-sub {
  font-family: var(--font-mono, monospace);
  font-size: 0.62rem;
  color: rgba(255, 255, 255, 0.15);
  letter-spacing: 0.05em;
}

/* ── Riding body ────────────────────────────────────────────────── */
.ride-card__body {
  display: flex;
  align-items: stretch;
  padding: 14px 18px;
  gap: 0;
}

/* Left: speed */
.ride-card__speed-col {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 130px;
  padding-right: 18px;
}
.ride-card__label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
  gap: 6px;
}
.ride-card__badge {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font-mono, monospace);
  font-size: 0.62rem;
  font-weight: 700;
  color: #00F3FF;
  letter-spacing: 0.08em;
  background: rgba(0, 243, 255, 0.06);
  border: 1px solid rgba(0, 243, 255, 0.15);
  padding: 2px 8px;
  clip-path: polygon(4px 0%,100% 0%,100% calc(100% - 4px),calc(100% - 4px) 100%,0% 100%,0% 4px);
}
.ride-card__dot {
  width: 4px; height: 4px;
  border-radius: 50%;
  background: #00F3FF;
  animation: dot-pulse 1.5s ease infinite;
}
@keyframes dot-pulse {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.2; }
}
.ride-card__timer {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-mono, monospace);
  font-size: 0.65rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.35);
  font-variant-numeric: tabular-nums;
}

.ride-card__speed {
  display: flex;
  align-items: baseline;
  gap: 4px;
  line-height: 1;
}
.ride-card__speed-num {
  font-family: var(--font-mono, monospace);
  font-size: 2.6rem;
  font-weight: 800;
  color: #00F3FF;
  text-shadow: 0 0 16px rgba(0, 243, 255, 0.4);
  font-variant-numeric: tabular-nums;
  transition: color 0.3s, text-shadow 0.3s;
}
.ride-card__speed--warn .ride-card__speed-num {
  color: #FFAA00;
  text-shadow: 0 0 16px rgba(255, 170, 0, 0.5);
}
.ride-card__speed-unit {
  font-family: var(--font-mono, monospace);
  font-size: 0.72rem;
  font-weight: 600;
  color: rgba(0, 243, 255, 0.4);
  margin-bottom: 4px;
}
.ride-card__speed-hint {
  font-family: var(--font-mono, monospace);
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.15);
  letter-spacing: 0.06em;
  margin-top: 4px;
}
.ride-card__alert {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-mono, monospace);
  font-size: 0.62rem;
  font-weight: 700;
  color: #FFAA00;
  background: rgba(255, 170, 0, 0.08);
  border: 1px solid rgba(255, 170, 0, 0.20);
  padding: 2px 8px;
  margin-top: 4px;
  clip-path: polygon(4px 0%,100% 0%,100% calc(100% - 4px),calc(100% - 4px) 100%,0% 100%,0% 4px);
  animation: alert-blink 1s ease infinite;
}
@keyframes alert-blink {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.3; }
}

/* Divider */
.ride-card__divider {
  width: 1px;
  background: rgba(0, 243, 255, 0.08);
  margin: 0 18px;
  flex-shrink: 0;
}

/* Right: stats grid */
.ride-card__stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 14px;
  flex: 1;
  align-content: center;
}
.ride-card__stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ride-card__stat--cal {
  grid-column: 1 / -1;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  padding-top: 7px;
  border-top: 1px solid rgba(0, 243, 255, 0.06);
}
.ride-card__stat-val {
  font-family: var(--font-mono, monospace);
  font-size: 1.0rem;
  font-weight: 700;
  color: #fff;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}
.ride-card__stat-val--cal { color: #FFAA00; text-shadow: 0 0 8px rgba(255,170,0,0.4); }
.ride-card__stat-key {
  font-family: var(--font-mono, monospace);
  font-size: 0.58rem;
  color: rgba(0, 243, 255, 0.30);
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.ride-card__stat--cal .ride-card__stat-key { color: rgba(255, 170, 0, 0.45); }

@media (max-width: 640px) {
  .ride-card__speed-num { font-size: 2.1rem; }
  .ride-card__stats { gap: 6px 10px; }
}
</style>
