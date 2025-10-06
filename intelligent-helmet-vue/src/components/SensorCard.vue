<template>
  <div class="card" :data-aos="'fade-up'" :data-aos-delay="delay">
    <div class="card-header">
      <div class="card-title">环境数据监控</div>
      <div class="device-id">ID: {{ data.deviceId || '未知' }}</div>
    </div>

    <div class="data-grid">
      <div
        class="data-item"
        v-for="(item, idx) in items"
        :key="item.key"
        :data-aos="'fade-right'"
        :data-aos-delay="delay + (idx + 1) * 100"
      >
        <div class="data-label">{{ item.label }}</div>
        <div class="data-value">
          <template v-if="hasValue(data[item.key])">
            {{ formatValue(data[item.key]) }} <span class="data-unit">{{ item.unit }}</span>
          </template>
          <span v-else class="no-data">无数据</span>
        </div>
      </div>
    </div>

    <div class="timestamp">
      接收时间: {{ formatDateTime(data.receiveTime) }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatDateTime } from '@/utils/formatDate.js'

const props = defineProps({
  data: { type: Object, required: true },
  delay: { type: Number, default: 0 }
})

function hasValue(v) {
  return v !== null && v !== undefined && v !== ''
}

function formatValue(v) {
  if (typeof v === 'number') {
    // 保持一位小数显示温湿度
    return Number.isInteger(v) ? v : v.toFixed(1)
  }
  return v
}

const items = [
  { key: 'temperature', label: '温度', unit: '°C' },
  { key: 'humidity', label: '湿度', unit: '%' },
  { key: 'longitude', label: '经度', unit: '°' },
  { key: 'latitude', label: '纬度', unit: '°' }
]
</script>

<style scoped>
/* 保留你之前的样式（略）——可以直接复用你已有的 SensorCard 样式 */
.card {
  background: rgba(10, 15, 44, 0.4);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 247, 255, 0.3);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 247, 255, 0.4);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 247, 255, 0.2);
}

.card-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #00f7ff;
  text-shadow: 0 0 10px rgba(0, 247, 255, 0.5);
}

.device-id {
  font-size: 0.9rem;
  color: rgba(224, 224, 224, 0.8);
  background: rgba(0, 247, 255, 0.12);
  padding: 4px 12px;
  border-radius: 12px;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.data-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: rgba(0, 247, 255, 0.05);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.data-item:hover {
  background: rgba(0, 247, 255, 0.1);
  transform: scale(1.03);
}

.data-label {
  font-size: 0.9rem;
  color: rgba(224, 224, 224, 0.8);
  margin-bottom: 8px;
}

.data-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #00f7ff;
  text-shadow: 0 0 8px rgba(0, 247, 255, 0.4);
}

.data-unit {
  font-size: 1rem;
  margin-left: 4px;
}

.timestamp {
  text-align: right;
  font-size: 0.85rem;
  color: rgba(224, 224, 224, 0.7);
  padding-top: 12px;
  border-top: 1px solid rgba(0, 247, 255, 0.1);
}

.no-data {
  color: #888;
}
</style>