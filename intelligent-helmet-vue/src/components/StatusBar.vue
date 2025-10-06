<template>
  <div class="status-bar" data-aos="fade-up" data-aos-delay="100">
    <div class="status-item">
      <div :class="indicatorClass"></div>
      <span>{{ connectionStatus }}</span>
    </div>
    <div class="status-item">
      <span>设备数量: {{ deviceCount }}</span>
    </div>
    <div class="status-item">
      <span>最后更新: {{ formattedLastUpdate }}</span>
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
  if (/断开|失败|error/i.test(props.connectionStatus)) return 'status-indicator error'
  if (/连接中|connecting/i.test(props.connectionStatus)) return 'status-indicator warning'
  return 'status-indicator ok'
})
</script>

<style scoped>
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px;
  border-radius: 20px;
  background: rgba(10, 15, 44, 0.4);
  margin-bottom: 40px;
  border: 1px solid rgba(0, 247, 255, 0.3);
  color: white; /* 将字体颜色改为白色 */
  
}

.status-item {
  display: flex;
  gap: 10px;
  align-items: center;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(0, 247, 255, 0.4);
}

.status-indicator.ok {
  background: #00f7ff;
}

.status-indicator.warning {
  background: #ffcc00;
  box-shadow: 0 0 8px #ffcc00;
}

.status-indicator.error {
  background: #ff4444;
  box-shadow: 0 0 8px #ff4444;
}
</style>