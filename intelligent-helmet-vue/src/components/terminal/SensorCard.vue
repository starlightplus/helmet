<template>
  <div class="sensor-card" :data-aos="'fade-up'" :data-aos-delay="delay">
    <div class="sensor-card__header">
      <div class="sensor-card__title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 2v10l6.5-3"/></svg>
        <span>环境数据监控</span>
      </div>
      <div class="sensor-card__device-id">{{ data.deviceId || '未知' }}</div>
    </div>

    <div class="sensor-card__grid">
      <div
        class="sensor-card__item"
        v-for="(item, idx) in items"
        :key="item.key"
        :data-aos="'fade-up'"
        :data-aos-delay="delay + (idx + 1) * 80"
      >
        <div class="sensor-card__item-icon" :class="'icon-' + item.key">
          <svg v-if="item.key === 'temperature'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>
          <svg v-else-if="item.key === 'humidity'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
          <svg v-else-if="item.key === 'longitude'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          <svg v-else-if="item.key === 'latitude'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <div class="sensor-card__item-label">{{ item.label }}</div>
        <div class="sensor-card__item-value">
          <template v-if="hasValue(data[item.key])">
            {{ formatValue(data[item.key]) }}<span class="sensor-card__item-unit">{{ item.unit }}</span>
          </template>
          <span v-else class="sensor-card__no-data">--</span>
        </div>
      </div>
    </div>

    <div class="sensor-card__footer">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8892A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <span>{{ formatDateTime(data.receiveTime) }}</span>
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
.sensor-card {
  background: #1a2332;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.sensor-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.sensor-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.sensor-card__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #E8ECF1;
}

.sensor-card__device-id {
  font-size: 0.8rem;
  color: #8892A0;
  background: rgba(255, 107, 53, 0.12);
  color: #FF6B35;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 500;
}

.sensor-card__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.sensor-card__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 10px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  transition: background 0.2s ease;
}

.sensor-card__item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.sensor-card__item-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.sensor-card__item-icon.icon-temperature {
  background: rgba(255, 107, 53, 0.15);
  color: #FF6B35;
}

.sensor-card__item-icon.icon-humidity {
  background: rgba(0, 196, 154, 0.15);
  color: #00C49A;
}

.sensor-card__item-icon.icon-longitude {
  background: rgba(255, 107, 53, 0.15);
  color: #FF6B35;
}

.sensor-card__item-icon.icon-latitude {
  background: rgba(0, 196, 154, 0.15);
  color: #00C49A;
}

.sensor-card__item-label {
  font-size: 0.75rem;
  color: #8892A0;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sensor-card__item-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #E8ECF1;
}

.sensor-card__item-unit {
  font-size: 0.85rem;
  color: #8892A0;
  margin-left: 2px;
  font-weight: 400;
}

.sensor-card__no-data {
  color: #8892A0;
}

.sensor-card__footer {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #8892A0;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

@media (max-width: 480px) {
  .sensor-card__grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  .sensor-card__item-value {
    font-size: 1.2rem;
  }
}
</style>
