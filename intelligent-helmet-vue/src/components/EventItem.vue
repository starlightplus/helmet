<template>
  <div class="event-item" :data-aos="'fade-left'" :data-aos-delay="delay">
    <div class="event-info">
      <div class="event-icon" :class="iconClass">{{ iconSymbol }}</div>
      <div class="event-details">
        <div class="event-type">{{ event.name }}</div>
        <div class="event-device">设备 ID: {{ event.deviceId }}</div>
      </div>
    </div>
    <div class="event-time">{{ formattedTime }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { eventMapByType } from '@/utils/eventConfig.js'
import { formatDateTime } from '@/utils/formatDate.js'

const props = defineProps({
  event: { type: Object, required: true },
  delay: { type: Number, default: 0 }
})

const iconSymbol = computed(() => {
  return eventMapByType[props.event.type]?.symbol || '•'
})
const iconClass = computed(() => {
  return eventMapByType[props.event.type]?.css || ''
})
const formattedTime = computed(() => formatDateTime(props.event.timestamp))
</script>

<style scoped>
/* 复用你已设计的样式（略） */
.event-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  margin-bottom: 12px;
  background: rgba(10, 15, 44, 0.4);
  border-radius: 16px;
  border: 1px solid rgba(0, 247, 255, 0.3);
  transition: all 0.3s ease;
  width: 100%; /* 确保宽度一致 */
  box-sizing: border-box; /* 包含padding和border在宽度内 */
}

.event-item:hover {
  background: rgba(0, 247, 255, 0.1);
  transform: translateX(5px);
}

.event-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.event-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 247, 255, 0.1);
}

.event-icon.fall {
  color: #ff4d4f;
  text-shadow: 0 0 8px rgba(255, 77, 79, 0.6);
  animation: pulse 2s infinite;
}

.event-icon.slow {
  color: #ffd700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
}

.event-icon.turn-left {
  color: #00f7ff;
  text-shadow: 0 0 8px rgba(0, 247, 255, 0.6);
}

.event-icon.turn-right {
  color: #00f7ff;
  text-shadow: 0 0 8px rgba(0, 247, 255, 0.6);
}

.event-details {
  display: flex;
  flex-direction: column;
}

.event-type {
  font-weight: 600;
  color: #00f7ff;
  margin-bottom: 4px;
}

.event-device {
  font-size: 0.85rem;
  color: rgba(224, 224, 224, 0.8);
}

.event-time {
  font-size: 0.9rem;
  color: rgba(224, 224, 224, 0.7);
  white-space: nowrap; /* 防止时间换行 */
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 77, 79, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 77, 79, 0);
  }
}

.fall-alert {
  animation: flash 0.5s ease 3;
}

@keyframes flash {
  0% { background: rgba(255, 77, 79, 0.3); }
  50% { background: rgba(255, 77, 79, 0.6); }
  100% { background: rgba(255, 77, 79, 0.3); }
}
</style>