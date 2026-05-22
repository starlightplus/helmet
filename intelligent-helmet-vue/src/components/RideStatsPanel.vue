<template>
  <div class="ride-card" :class="{ 'ride-card--active': isRiding, 'ride-card--warning': speedWarning }">
    <!-- 顶部彩条 -->
    <div class="ride-card__bar"></div>

    <!-- 非骑行状态 -->
    <div v-if="!isRiding" class="ride-card__idle">
      <div class="ride-card__idle-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="18.5" cy="17.5" r="3.5"/>
          <circle cx="5.5" cy="17.5" r="3.5"/>
          <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor"/>
          <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
        </svg>
      </div>
      <div>
        <div class="ride-card__idle-title">等待骑行</div>
        <div class="ride-card__idle-sub">设备上线后自动开始记录</div>
      </div>
    </div>

    <!-- 骑行中 -->
    <div v-else class="ride-card__body">
      <!-- 左：速度 -->
      <div class="ride-card__speed-col">
        <div class="ride-card__label-row">
          <div class="ride-card__badge">
            <span class="ride-card__dot"></span>骑行中
          </div>
          <div class="ride-card__timer">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {{ formattedDuration }}
          </div>
        </div>
        <div class="ride-card__speed" :class="{ 'ride-card__speed--warn': speedWarning }">
          <span class="ride-card__speed-num">{{ currentSpeed.toFixed(1) }}</span>
          <span class="ride-card__speed-unit">km/h</span>
        </div>
        <div v-if="speedWarning" class="ride-card__alert">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          注意减速
        </div>
        <div v-else class="ride-card__speed-hint">当前速度</div>
      </div>

      <!-- 分隔线 -->
      <div class="ride-card__divider"></div>

      <!-- 右：统计数据 2×2 + 1 -->
      <div class="ride-card__stats">
        <div class="ride-card__stat">
          <span class="ride-card__stat-val">{{ formattedDistance }}</span>
          <span class="ride-card__stat-key">距离 km</span>
        </div>
        <div class="ride-card__stat">
          <span class="ride-card__stat-val">{{ avgSpeed.toFixed(1) }}</span>
          <span class="ride-card__stat-key">均速 km/h</span>
        </div>
        <div class="ride-card__stat">
          <span class="ride-card__stat-val">{{ maxSpeed.toFixed(1) }}</span>
          <span class="ride-card__stat-key">最高 km/h</span>
        </div>
        <div class="ride-card__stat">
          <span class="ride-card__stat-val">{{ formattedPace }}</span>
          <span class="ride-card__stat-key">配速 /km</span>
        </div>
        <div class="ride-card__stat ride-card__stat--cal">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 6v6l4 2"/></svg>
          <span class="ride-card__stat-val ride-card__stat-val--cal">{{ Math.round(calories) }}</span>
          <span class="ride-card__stat-key">卡路里 kcal</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatDuration } from '@/composables/useRideTracking.js'

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

const formattedDuration = computed(() => formatDuration(props.rideDuration))
const formattedDistance = computed(() => props.rideDistance.toFixed(2))
const formattedPace = computed(() => {
  if (props.pace <= 0 || !isFinite(props.pace)) return '--'
  const mins = Math.floor(props.pace)
  const secs = Math.round((props.pace - mins) * 60)
  return `${mins}'${String(secs).padStart(2, '0')}"`
})
</script>

<style scoped>
.ride-card {
  position: relative;
  background: rgba(15, 22, 36, 0.72);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.ride-card--active {
  border-color: rgba(0, 240, 255, 0.18);
  box-shadow: 0 0 24px -6px rgba(0, 240, 255, 0.1);
}

.ride-card--warning {
  border-color: rgba(168, 85, 247, 0.3);
  box-shadow: 0 0 24px -6px rgba(168, 85, 247, 0.15);
}

/* 顶部彩条 */
.ride-card__bar {
  height: 2px;
  background: rgba(255,255,255,0.05);
  transition: background 0.4s;
}
.ride-card--active .ride-card__bar {
  background: linear-gradient(90deg, transparent, #00F0FF 40%, #A855F7 60%, transparent);
  animation: bar-flow 3s ease infinite;
}
.ride-card--warning .ride-card__bar {
  background: linear-gradient(90deg, transparent, #A855F7 40%, #f97316 60%, transparent) !important;
}
@keyframes bar-flow {
  0%,100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* 非骑行 */
.ride-card__idle {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  color: #4a5568;
}
.ride-card__idle-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 10px;
  flex-shrink: 0;
}
.ride-card__idle-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 2px;
}
.ride-card__idle-sub {
  font-size: 0.7rem;
  color: #374151;
}

/* 骑行中主体：左右分栏 */
.ride-card__body {
  display: flex;
  align-items: stretch;
  padding: 16px 20px;
  gap: 0;
}

/* 左栏：速度 */
.ride-card__speed-col {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 130px;
  padding-right: 20px;
}

.ride-card__label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  gap: 8px;
}

.ride-card__badge {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.68rem;
  font-weight: 700;
  color: #00F0FF;
  letter-spacing: 0.5px;
  background: rgba(0,240,255,0.08);
  border: 1px solid rgba(0,240,255,0.15);
  border-radius: 20px;
  padding: 2px 8px;
}
.ride-card__dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #00F0FF;
  animation: dot-pulse 1.5s ease infinite;
}
@keyframes dot-pulse {
  0%,100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.ride-card__timer {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #9ca3af;
  font-variant-numeric: tabular-nums;
}

.ride-card__speed {
  display: flex;
  align-items: baseline;
  gap: 4px;
  line-height: 1;
}
.ride-card__speed-num {
  font-size: 2.8rem;
  font-weight: 800;
  color: #e0f2fe;
  font-variant-numeric: tabular-nums;
  transition: color 0.3s;
}
.ride-card__speed--warn .ride-card__speed-num {
  color: #c084fc;
}
.ride-card__speed-unit {
  font-size: 0.78rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 4px;
}

.ride-card__speed-hint {
  font-size: 0.65rem;
  color: #374151;
  margin-top: 4px;
}

.ride-card__alert {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.68rem;
  font-weight: 600;
  color: #c084fc;
  background: rgba(168,85,247,0.1);
  border-radius: 8px;
  padding: 3px 8px;
  margin-top: 4px;
  animation: alert-blink 1s ease infinite;
}
@keyframes alert-blink {
  0%,100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* 分隔线 */
.ride-card__divider {
  width: 1px;
  background: rgba(255,255,255,0.06);
  margin: 0 20px;
  flex-shrink: 0;
}

/* 右栏：数据格 */
.ride-card__stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px 16px;
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
  padding-top: 8px;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.ride-card__stat-val {
  font-size: 1.05rem;
  font-weight: 700;
  color: #e0f2fe;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}
.ride-card__stat-val--cal {
  color: #fb923c;
}

.ride-card__stat-key {
  font-size: 0.62rem;
  color: #4b5563;
  font-weight: 500;
}

.ride-card__stat--cal .ride-card__stat-key {
  color: #6b7280;
}

@media (max-width: 640px) {
  .ride-card__speed-num { font-size: 2.2rem; }
  .ride-card__stats { gap: 8px 12px; }
}
</style>
