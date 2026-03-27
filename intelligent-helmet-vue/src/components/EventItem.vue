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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
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
  width: 32px;
  flex-shrink: 0;
  padding: 0 4px;
}

.timeline__line {
  width: 2px;
  flex: 1;
  min-height: 8px;
}

.timeline__line--top {
  background: linear-gradient(to bottom, rgba(255, 71, 87, 0.05), rgba(255, 71, 87, 0.2));
}

.timeline__line--bottom {
  background: linear-gradient(to bottom, rgba(255, 71, 87, 0.2), rgba(255, 71, 87, 0.05));
}

.timeline__dot {
  position: relative;
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timeline__dot-core {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #A855F7;
  box-shadow: 0 0 6px rgba(255, 71, 87, 0.4);
  z-index: 1;
}

.timeline__dot-ring {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid rgba(255, 71, 87, 0.3);
  animation: dot-pulse 2s ease infinite;
}

@keyframes dot-pulse {
  0% { width: 8px; height: 8px; opacity: 0.6; }
  100% { width: 24px; height: 24px; opacity: 0; }
}

/* ===== Card ===== */
.event-item__card {
  flex: 1;
  display: flex;
  background: rgba(255, 71, 87, 0.04);
  border: 1px solid rgba(255, 71, 87, 0.1);
  border-radius: 14px;
  margin-bottom: 10px;
  overflow: hidden;
  transition: all 0.25s ease;
}

.event-item__card:hover {
  background: rgba(255, 71, 87, 0.07);
  border-color: rgba(255, 71, 87, 0.2);
  transform: translateX(4px);
  box-shadow: 0 4px 20px -6px rgba(255, 71, 87, 0.15);
}

/* Left severity strip */
.event-item__severity {
  width: 4px;
  flex-shrink: 0;
  background: linear-gradient(to bottom, #A855F7, #00D9FF);
  border-radius: 4px 0 0 4px;
}

/* Body */
.event-item__body {
  flex: 1;
  padding: 14px 16px;
  min-width: 0;
}

.event-item__row-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.event-item__icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: rgba(255, 71, 87, 0.12);
  color: #A855F7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.event-item__info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.event-item__type {
  font-weight: 700;
  color: #E0F2FE;
  font-size: 0.9rem;
}

.event-item__badge {
  font-size: 0.6rem;
  font-weight: 700;
  color: #A855F7;
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.2);
  padding: 2px 8px;
  border-radius: 4px;
  letter-spacing: 0.8px;
  line-height: 1.4;
}

.event-item__time {
  font-size: 0.75rem;
  color: #556;
  white-space: nowrap;
  font-family: 'Segoe UI', monospace;
  flex-shrink: 0;
}

/* Bottom roll */
.event-item__row-bottom {
  padding-left: 40px;
}

.event-item__meta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.event-item__device {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #8892A0;
}

.event-item__coords {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  color: #A855F7;
  font-family: 'Courier New', monospace;
  background: rgba(6, 182, 212, 0.06);
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid rgba(6, 182, 212, 0.1);
}

/* Alert flash (triggered by JS) */
.fall-alert {
  animation: flash-danger 0.5s ease 3;
}

@keyframes flash-danger {
  0% { background: rgba(255, 71, 87, 0.08); }
  50% { background: rgba(255, 71, 87, 0.25); }
  100% { background: rgba(255, 71, 87, 0.08); }
}

@media (max-width: 768px) {
  .event-item__timeline {
    width: 24px;
  }

  .event-item__card {
    border-radius: 10px;
  }

  .event-item__body {
    padding: 10px 12px;
  }

  .event-item__row-bottom {
    padding-left: 0;
  }

  .event-item__meta {
    gap: 8px;
  }
}
</style>
