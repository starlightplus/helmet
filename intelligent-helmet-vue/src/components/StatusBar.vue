<template>
  <div class="status-bar" data-aos="fade-up" data-aos-delay="100">
    <div class="status-bar__item">
      <div :class="indicatorClass"></div>
      <span>{{ connectionStatus }}</span>
    </div>
    <div class="status-bar__item">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8892A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 3h-8l-2 4h12z"/></svg>
      <span>设备: {{ deviceCount }}</span>
    </div>
    <div class="status-bar__item">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8892A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <span>{{ formattedLastUpdate }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatDateTime } from '@/utils/formatDate.js'

const props = defineProps({
  connectionStatus: { type: String, default: '正在连接...' },
  deviceCount: { type: Number, default: 0 },
  lastUpdateTime: { type: [Date, String], default: () => new Date() }
})

const formattedLastUpdate = computed(()=> formatDateTime(props.lastUpdateTime))

const indicatorClass = computed(()=> {
  if (/断开|失败|error/i.test(props.connectionStatus)) return 'status-bar__dot status-bar__dot--error'
  if (/连接中|connecting/i.test(props.connectionStatus)) return 'status-bar__dot status-bar__dot--warning'
  return 'status-bar__dot status-bar__dot--ok'
})
</script>

<style scoped>
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-radius: 12px;
  background: #1a2332;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #E8ECF1;
  font-size: 0.85rem;
}

.status-bar__item {
  display: flex;
  gap: 8px;
  align-items: center;
  color: #8892A0;
}

.status-bar__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-bar__dot--ok {
  background: #00C49A;
  box-shadow: 0 0 6px rgba(0, 196, 154, 0.5);
}

.status-bar__dot--warning {
  background: #FFD93D;
  box-shadow: 0 0 6px rgba(255, 217, 61, 0.5);
}

.status-bar__dot--error {
  background: #FF4757;
  box-shadow: 0 0 6px rgba(255, 71, 87, 0.5);
}

@media (max-width: 768px) {
  .status-bar {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}
</style>
