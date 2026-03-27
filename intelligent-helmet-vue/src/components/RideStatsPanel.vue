<template>
  <div class="ride-panel" :class="{ 'ride-panel--active': isRiding }">
    <div class="ride-panel__strip" :class="{ 'ride-panel__strip--riding': isRiding, 'ride-panel__strip--warning': speedWarning }"></div>

    <!-- 非骑行状态 -->
    <div v-if="!isRiding" class="ride-panel__idle">
      <div class="ride-panel__idle-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4a5568" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="18.5" cy="17.5" r="3.5"/>
          <circle cx="5.5" cy="17.5" r="3.5"/>
          <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="#4a5568"/>
          <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
        </svg>
      </div>
      <div class="ride-panel__idle-text">
        <span class="ride-panel__idle-title">等待骑行</span>
        <span class="ride-panel__idle-sub">设备上线后自动开始记录</span>
      </div>
    </div>

    <!-- 骑行中 -->
    <div v-else class="ride-panel__content">
      <!-- 顶部状态栏 -->
      <div class="ride-panel__header">
        <div class="ride-panel__badge">
          <div class="ride-panel__badge-dot"></div>
          骑行中
        </div>
        <div class="ride-panel__timer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {{ formattedDuration }}
        </div>
      </div>

      <!-- 中央速度显示 -->
      <div class="ride-panel__speed-section">
        <div class="ride-panel__speed" :class="{ 'ride-panel__speed--warning': speedWarning }">
          <span class="ride-panel__speed-value">{{ currentSpeed.toFixed(1) }}</span>
          <span class="ride-panel__speed-unit">km/h</span>
        </div>
        <div v-if="speedWarning" class="ride-panel__speed-alert">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          注意减速
        </div>
      </div>

      <!-- 底部统计网格 -->
      <div class="ride-panel__stats">
        <div class="ride-panel__stat">
          <span class="ride-panel__stat-value">{{ formattedDistance }}</span>
          <span class="ride-panel__stat-label">距离(km)</span>
        </div>
        <div class="ride-panel__stat">
          <span class="ride-panel__stat-value">{{ avgSpeed.toFixed(1) }}</span>
          <span class="ride-panel__stat-label">均速(km/h)</span>
        </div>
        <div class="ride-panel__stat">
          <span class="ride-panel__stat-value">{{ maxSpeed.toFixed(1) }}</span>
          <span class="ride-panel__stat-label">最高(km/h)</span>
        </div>
        <div class="ride-panel__stat">
          <span class="ride-panel__stat-value">{{ formattedPace }}</span>
          <span class="ride-panel__stat-label">配速(min/km)</span>
        </div>
        <div class="ride-panel__stat">
          <span class="ride-panel__stat-value ride-panel__stat-value--cal">{{ Math.round(calories) }}</span>
          <span class="ride-panel__stat-label">卡路里(kcal)</span>
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
.ride-panel {
  position: relative;
  background: linear-gradient(145deg, #0f1624 0%, #151d2b 100%);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 4px 24px -8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.04);
  transition: border-color 0.4s ease, box-shadow 0.4s ease;
}

.ride-panel--active {
  border-color: rgba(0, 196, 154, 0.2);
  box-shadow: 0 4px 30px -8px rgba(0, 196, 154, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

/* Top strip */
.ride-panel__strip {
  height: 3px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
  transition: background 0.4s ease;
}

.ride-panel__strip--riding {
  background: linear-gradient(90deg, transparent, #00F0FF, #A855F7, #00F0FF, transparent);
  animation: ride-strip-glow 3s ease infinite;
}

.ride-panel__strip--warning {
  background: linear-gradient(90deg, transparent, #A855F7, #00D9FF, #A855F7, transparent) !important;
}

@keyframes ride-strip-glow {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* Idle state */
.ride-panel__idle {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 24px;
}

.ride-panel__idle-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.ride-panel__idle-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ride-panel__idle-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #8892A0;
}

.ride-panel__idle-sub {
  font-size: 0.72rem;
  color: #4a5568;
}

/* Riding content */
.ride-panel__content {
  padding: 20px 24px;
}

.ride-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.ride-panel__badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 14px;
  background: rgba(0, 196, 154, 0.1);
  border: 1px solid rgba(0, 196, 154, 0.2);
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #00F0FF;
  letter-spacing: 0.5px;
}

.ride-panel__badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00F0FF;
  box-shadow: 0 0 8px rgba(0, 196, 154, 0.6);
  animation: badge-pulse 1.5s ease infinite;
}

@keyframes badge-pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 4px rgba(0, 196, 154, 0.4); }
  50% { opacity: 0.6; box-shadow: 0 0 12px rgba(0, 196, 154, 0.8); }
}

.ride-panel__timer {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #E0F2FE;
  font-family: 'Segoe UI', monospace;
}

/* Speed display */
.ride-panel__speed-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
}

.ride-panel__speed {
  display: flex;
  align-items: baseline;
  gap: 6px;
  transition: color 0.3s ease;
}

.ride-panel__speed-value {
  font-size: 3rem;
  font-weight: 800;
  color: #E0F2FE;
  font-family: 'Segoe UI', monospace;
  line-height: 1;
  text-shadow: 0 0 30px rgba(0, 196, 154, 0.2);
  transition: color 0.3s ease, text-shadow 0.3s ease;
}

.ride-panel__speed--warning .ride-panel__speed-value {
  color: #A855F7;
  text-shadow: 0 0 30px rgba(255, 71, 87, 0.3);
}

.ride-panel__speed-unit {
  font-size: 0.85rem;
  font-weight: 600;
  color: #8892A0;
}

.ride-panel__speed-alert {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #A855F7;
  padding: 3px 10px;
  background: rgba(255, 71, 87, 0.1);
  border-radius: 12px;
  animation: alert-blink 1s ease infinite;
}

@keyframes alert-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Stats grid */
.ride-panel__stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.ride-panel__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.ride-panel__stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #E0F2FE;
  font-family: 'Segoe UI', monospace;
}

.ride-panel__stat-label {
  font-size: 0.68rem;
  color: #8892A0;
  font-weight: 500;
}

.ride-panel__stat-value--cal {
  color: #00D9FF;
}

/* Responsive */
@media (max-width: 768px) {
  .ride-panel__speed-value {
    font-size: 2.4rem;
  }

  .ride-panel__stats {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .ride-panel__stat-value {
    font-size: 0.95rem;
  }
}
</style>
