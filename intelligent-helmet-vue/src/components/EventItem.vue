<template>
  <div class="event-item" :data-aos="'fade-left'" :data-aos-delay="delay">
    <!-- Timeline connector -->
    <div class="event-item__timeline">
      <div class="timeline__line timeline__line--top" v-if="!isFirst"></div>
      <div class="timeline__dot">
        <div class="timeline__dot-core"></div>
        <div class="timeline__dot-ring" v-if="isFirst"></div>
      </div>
      <div class="timeline__line timeline__line--bottom" v-if="!isLast"></div>
    </div>

    <!-- Content card -->
    <div class="event-item__card">
      <!-- Left severity strip -->
      <div class="event-item__severity"></div>

      <div class="event-item__body">
        <div class="event-item__row-top">
          <div class="event-item__icon">
            <img src="/icon/falldown.svg" width="16" height="16" />
          </div>
          <div class="event-item__info">
            <span class="event-item__type">{{ event.name }}</span>
            <span class="event-item__badge">CRITICAL</span>
          </div>
          <div class="event-item__time">{{ formattedTime }}</div>
        </div>

        <div class="event-item__row-bottom">
          <div class="event-item__meta">
            <span class="event-item__device">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 3h-8l-2 4h12z"/></svg>
              {{ event.deviceId }}
            </span>
            <span v-if="event.longitude && event.latitude" class="event-item__coords">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {{ Number(event.longitude).toFixed(4) }}° , {{ Number(event.latitude).toFixed(4) }}°
            </span>
            <span v-if="event.impact" class="event-item__impact" :style="{ color: impactColor, borderColor: impactColor, background: impactBg }">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9z"/></svg>
              {{ event.impact }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { eventMapByType } from '@/utils/eventConfig.js'
import { formatDateTime } from '@/utils/formatDate.js'

const props = defineProps({
  event: { type: Object, required: true },
  delay: { type: Number, default: 0 },
  isFirst: { type: Boolean, default: false },
  isLast: { type: Boolean, default: false }
})

const formattedTime = computed(() => formatDateTime(props.event.timestamp))

// 撞击程度配色：越严重越红
const impactColor = computed(() => {
  switch (props.event.impact) {
    case '极严重撞击':
    case '严重撞击': return '#EF4444'
    case '中等撞击': return '#FFAA00'
    case '轻微撞击': return '#4ade80'
    default: return 'rgba(255,255,255,0.5)'
  }
})
const impactBg = computed(() => {
  switch (props.event.impact) {
    case '极严重撞击':
    case '严重撞击': return 'rgba(239,68,68,0.08)'
    case '中等撞击': return 'rgba(255,170,0,0.08)'
    case '轻微撞击': return 'rgba(74,222,128,0.08)'
    default: return 'rgba(255,255,255,0.04)'
  }
})
</script>

<style scoped>
.event-item {
  display: flex;
  gap: 0;
  width: 100%;
  box-sizing: border-box;
}

/* ===== Timeline ===== */
.event-item__timeline {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 28px;
  flex-shrink: 0;
  padding: 0 4px;
}
.timeline__line {
  width: 1px;
  flex: 1;
  min-height: 8px;
}
.timeline__line--top    { background: linear-gradient(to bottom, rgba(239,68,68,0.04), rgba(239,68,68,0.18)); }
.timeline__line--bottom { background: linear-gradient(to bottom, rgba(239,68,68,0.18), rgba(239,68,68,0.04)); }

.timeline__dot {
  position: relative;
  width: 10px; height: 10px;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.timeline__dot-core {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #EF4444;
  box-shadow: 0 0 6px rgba(239, 68, 68, 0.5);
  z-index: 1;
}
.timeline__dot-ring {
  position: absolute;
  width: 6px; height: 6px;
  border-radius: 50%;
  border: 1px solid rgba(239, 68, 68, 0.4);
  animation: dot-pulse 2s ease infinite;
}
@keyframes dot-pulse {
  0%   { width: 6px;  height: 6px;  opacity: 0.7; }
  100% { width: 22px; height: 22px; opacity: 0; }
}

/* ===== Card ===== */
.event-item__card {
  flex: 1;
  display: flex;
  background: rgba(239, 68, 68, 0.04);
  border: 1px solid rgba(239, 68, 68, 0.12);
  margin-bottom: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);
}
.event-item__card:hover {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.25);
  transform: translateX(3px);
}

/* Left severity strip */
.event-item__severity {
  width: 3px;
  flex-shrink: 0;
  background: linear-gradient(to bottom, #EF4444, #FFAA00);
}

/* Body */
.event-item__body {
  flex: 1;
  padding: 12px 14px;
  min-width: 0;
}
.event-item__row-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.event-item__icon {
  width: 26px; height: 26px;
  background: rgba(239, 68, 68, 0.10);
  color: #EF4444;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  clip-path: polygon(4px 0%,100% 0%,100% calc(100% - 4px),calc(100% - 4px) 100%,0% 100%,0% 4px);
}
.event-item__info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.event-item__type {
  font-family: var(--font-mono, monospace);
  font-weight: 700;
  color: #fff;
  font-size: 0.78rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.event-item__badge {
  font-family: var(--font-mono, monospace);
  font-size: 0.58rem;
  font-weight: 700;
  color: #EF4444;
  background: rgba(239, 68, 68, 0.10);
  border: 1px solid rgba(239, 68, 68, 0.25);
  padding: 1px 6px;
  letter-spacing: 0.08em;
  clip-path: polygon(3px 0%,100% 0%,100% calc(100% - 3px),calc(100% - 3px) 100%,0% 100%,0% 3px);
}
.event-item__time {
  font-family: var(--font-mono, monospace);
  font-size: 0.62rem;
  color: rgba(255, 255, 255, 0.25);
  white-space: nowrap;
  flex-shrink: 0;
}

/* Bottom roll */
.event-item__row-bottom { padding-left: 34px; }
.event-item__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.event-item__device {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-mono, monospace);
  font-size: 0.65rem;
  color: rgba(0, 243, 255, 0.5);
}
.event-item__coords {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-mono, monospace);
  font-size: 0.62rem;
  color: rgba(0, 243, 255, 0.6);
  background: rgba(0, 243, 255, 0.04);
  padding: 1px 6px;
  border: 1px solid rgba(0, 243, 255, 0.08);
}
.event-item__impact {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-mono, monospace);
  font-size: 0.62rem;
  font-weight: 700;
  padding: 1px 6px;
  border: 1px solid;
  clip-path: polygon(3px 0%,100% 0%,100% calc(100% - 3px),calc(100% - 3px) 100%,0% 100%,0% 3px);
}

/* Alert flash */
.fall-alert { animation: flash-danger 0.5s ease 3; }
@keyframes flash-danger {
  0%   { background: rgba(239, 68, 68, 0.06); }
  50%  { background: rgba(239, 68, 68, 0.22); }
  100% { background: rgba(239, 68, 68, 0.06); }
}

@media (max-width: 768px) {
  .event-item__timeline { width: 22px; }
  .event-item__body { padding: 8px 10px; }
  .event-item__row-bottom { padding-left: 0; }
  .event-item__meta { gap: 6px; }
}
</style>
