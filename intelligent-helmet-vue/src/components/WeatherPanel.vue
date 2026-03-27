<template>
  <div class="weather-panel">
    <div class="weather-panel__strip"></div>

    <!-- Header -->
    <div class="wp-header">
      <div class="wp-header__title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A855F7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/><circle cx="12" cy="12" r="4"/></svg>
        <span>天气预报</span>
      </div>
      <div class="wp-header__city" v-if="city">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        {{ city }}
      </div>
    </div>

    <!-- Warning Banner -->
    <div v-if="warning && warning.length" class="wp-warnings">
      <div v-for="w in warning" :key="w.id" class="wp-warning" :style="{ '--warn-color': w.severityColor || '#00D9FF' }">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <span>{{ w.typeName }}{{ w.level ? ' ' + w.level + '预警' : '预警' }}</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading && !current" class="wp-loading">
      <div class="wp-loading__spinner"></div>
      <span>定位获取中...</span>
    </div>

    <!-- Error -->
    <div v-else-if="error && !current" class="wp-empty">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#556" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>等待 GPS 定位</span>
    </div>

    <!-- Current Weather -->
    <template v-else-if="current">
      <div class="wp-current">
        <div class="wp-current__icon">{{ getWeatherEmoji(current.text) }}</div>
        <div class="wp-current__info">
          <div class="wp-current__temp">{{ current.temp }}<span class="wp-current__unit">°C</span></div>
          <div class="wp-current__desc">{{ current.text }}</div>
        </div>
        <div class="wp-current__feels">体感 {{ current.feelsLike }}°</div>
      </div>

      <div class="wp-current-details">
        <div class="wp-detail">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
          <span>{{ current.humidity }}%</span>
        </div>
        <div class="wp-detail">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>
          <span>{{ current.windDir }} {{ current.windScale }}级</span>
        </div>
        <div class="wp-detail" v-if="current.vis">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          <span>{{ current.vis }}km</span>
        </div>
      </div>

      <!-- Minutely Precipitation -->
      <div v-if="minutely" class="wp-minutely">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A855F7" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
        <span>{{ minutely }}</span>
      </div>

      <div class="wp-divider"></div>

      <!-- Hourly Forecast -->
      <div class="wp-section-title">逐小时预报</div>
      <div class="wp-hourly">
        <div class="wp-hourly__scroll">
          <div v-for="(h, i) in displayHourly" :key="i" class="wp-hour" :class="{ 'wp-hour--now': i === 0 }">
            <div class="wp-hour__time">{{ i === 0 ? '现在' : formatHourTime(h.fxTime) }}</div>
            <div class="wp-hour__icon">{{ getWeatherEmoji(h.text) }}</div>
            <div class="wp-hour__temp">{{ h.temp }}°</div>
            <div v-if="h.pop && Number(h.pop) > 0" class="wp-hour__pop">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="#A855F7"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
              {{ h.pop }}%
            </div>
          </div>
        </div>
      </div>

      <div class="wp-divider"></div>

      <!-- 3-Day Forecast -->
      <div class="wp-section-title">未来预报</div>
      <div class="wp-forecast">
        <div v-for="(day, i) in forecast" :key="i" class="wp-day" :class="{ 'wp-day--today': i === 0 }">
          <div class="wp-day__label">{{ getDayLabel(day.fxDate, i) }}</div>
          <div class="wp-day__icon">{{ getWeatherEmoji(day.textDay) }}</div>
          <div class="wp-day__weather">{{ day.textDay }}</div>
          <div class="wp-day__temp">
            <span class="wp-day__high">{{ day.tempMax }}°</span>
            <span class="wp-day__sep">/</span>
            <span class="wp-day__low">{{ day.tempMin }}°</span>
          </div>
          <div class="wp-day__wind">{{ day.windDirDay }}</div>
        </div>
      </div>

      <!-- Life Indices -->
      <template v-if="indices && indices.length">
        <div class="wp-divider"></div>
        <div class="wp-section-title">生活指数</div>
        <div class="wp-indices">
          <div v-for="idx in indices" :key="idx.type" class="wp-index">
            <div class="wp-index__icon">{{ getIndexIcon(idx.type) }}</div>
            <div class="wp-index__info">
              <div class="wp-index__name">{{ idx.name }}</div>
              <div class="wp-index__category">{{ idx.category }}</div>
            </div>
          </div>
        </div>
      </template>

      <!-- Update time -->
      <div class="wp-update" v-if="current.obsTime">
        更新于 {{ formatUpdateTime(current.obsTime) }}
      </div>
    </template>

    <!-- No data yet -->
    <div v-else class="wp-empty">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#556" stroke-width="1.5"><path d="M12 2v2"/><circle cx="12" cy="12" r="4"/><path d="M2 12h2"/><path d="M20 12h2"/></svg>
      <span>等待 GPS 定位</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  city: { type: String, default: '' },
  current: { type: Object, default: null },
  hourly: { type: Array, default: () => [] },
  forecast: { type: Array, default: () => [] },
  warning: { type: Array, default: () => [] },
  indices: { type: Array, default: () => [] },
  minutely: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' }
})

const displayHourly = computed(() => props.hourly.slice(0, 12))

function getWeatherEmoji(text) {
  if (!text) return '\u{1F324}'
  if (/晴/.test(text)) return '\u{2600}\u{FE0F}'
  if (/多云/.test(text)) return '\u{26C5}'
  if (/阴/.test(text)) return '\u{2601}\u{FE0F}'
  if (/雷/.test(text)) return '\u{26C8}\u{FE0F}'
  if (/暴雨|大雨/.test(text)) return '\u{1F327}\u{FE0F}'
  if (/中雨/.test(text)) return '\u{1F326}\u{FE0F}'
  if (/小雨|阵雨|毛毛雨/.test(text)) return '\u{1F326}\u{FE0F}'
  if (/雨夹雪|冻雨/.test(text)) return '\u{1F328}\u{FE0F}'
  if (/雪/.test(text)) return '\u{2744}\u{FE0F}'
  if (/雾|霾/.test(text)) return '\u{1F32B}\u{FE0F}'
  if (/沙|尘/.test(text)) return '\u{1F32A}\u{FE0F}'
  return '\u{1F324}'
}

function getIndexIcon(type) {
  const map = { '1': '\u{1F3C3}', '3': '\u{1F454}', '5': '\u{2600}\u{FE0F}', '8': '\u{1F60A}' }
  return map[String(type)] || '\u{1F4CB}'
}

function formatHourTime(fxTime) {
  if (!fxTime) return ''
  // 和风格式: "2024-01-01T12:00+08:00"
  const match = fxTime.match(/T(\d{2}):(\d{2})/)
  if (match) return match[1] + ':' + match[2]
  return fxTime
}

function formatUpdateTime(obsTime) {
  if (!obsTime) return ''
  const match = obsTime.match(/T(\d{2}:\d{2})/)
  return match ? match[1] : obsTime
}

function getDayLabel(dateStr, index) {
  if (index === 0) return '今天'
  if (index === 1) return '明天'
  if (index === 2) return '后天'
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return days[d.getDay()] || ''
}
</script>

<style scoped>
.weather-panel {
  background: linear-gradient(145deg, #0f1624 0%, #151d2b 100%);
  border-radius: 20px;
  border: 1px solid rgba(6, 182, 212, 0.1);
  overflow: hidden;
  box-shadow: 0 4px 24px -8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04);
  height: fit-content;
  position: sticky;
  top: 80px;
}

.weather-panel__strip {
  height: 3px;
  background: linear-gradient(90deg, transparent, #A855F7, #00D9FF, #A855F7, transparent);
  opacity: 0.6;
}

/* Header */
.wp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px 0;
}

.wp-header__title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #8892A0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.wp-header__city {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #A855F7;
  background: rgba(6, 182, 212, 0.08);
  padding: 3px 10px;
  border-radius: 12px;
  border: 1px solid rgba(6, 182, 212, 0.12);
}

/* Warning */
.wp-warnings {
  padding: 10px 20px 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.wp-warning {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(255, 107, 53, 0.08);
  border: 1px solid rgba(255, 107, 53, 0.2);
  border-color: var(--warn-color, #00D9FF);
  color: var(--warn-color, #00D9FF);
  font-size: 0.75rem;
  font-weight: 600;
  animation: warn-pulse 2s ease-in-out infinite;
}

@keyframes warn-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Loading */
.wp-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 40px 20px;
  color: #8892A0;
  font-size: 0.8rem;
}

.wp-loading__spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(6, 182, 212, 0.15);
  border-top-color: #A855F7;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty */
.wp-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 40px 20px;
  color: #556;
  font-size: 0.8rem;
}

/* Current */
.wp-current {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px 4px;
  position: relative;
}

.wp-current__icon {
  font-size: 2.6rem;
  line-height: 1;
}

.wp-current__info {
  flex: 1;
}

.wp-current__temp {
  font-size: 2.4rem;
  font-weight: 800;
  color: #E0F2FE;
  font-family: 'Segoe UI', monospace;
  line-height: 1;
}

.wp-current__unit {
  font-size: 1rem;
  font-weight: 400;
  color: #8892A0;
}

.wp-current__desc {
  font-size: 0.85rem;
  color: #8892A0;
  margin-top: 2px;
}

.wp-current__feels {
  font-size: 0.7rem;
  color: #556;
  background: rgba(255,255,255,0.04);
  padding: 3px 10px;
  border-radius: 10px;
  white-space: nowrap;
}

.wp-current-details {
  display: flex;
  gap: 14px;
  padding: 8px 20px 14px;
  flex-wrap: wrap;
}

.wp-detail {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #8892A0;
}

/* Minutely */
.wp-minutely {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 20px 12px;
  padding: 6px 12px;
  background: rgba(6, 182, 212, 0.06);
  border: 1px solid rgba(6, 182, 212, 0.1);
  border-radius: 8px;
  font-size: 0.73rem;
  color: #A855F7;
}

/* Divider */
.wp-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.05);
  margin: 0 20px;
}

/* Section title */
.wp-section-title {
  font-size: 0.7rem;
  font-weight: 600;
  color: #556;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 14px 20px 8px;
}

/* Hourly */
.wp-hourly {
  padding: 0 20px 14px;
  overflow: hidden;
}

.wp-hourly__scroll {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;
}

.wp-hourly__scroll::-webkit-scrollbar {
  height: 3px;
}

.wp-hourly__scroll::-webkit-scrollbar-track {
  background: rgba(255,255,255,0.03);
  border-radius: 2px;
}

.wp-hourly__scroll::-webkit-scrollbar-thumb {
  background: rgba(6, 182, 212, 0.2);
  border-radius: 2px;
}

.wp-hour {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 8px;
  border-radius: 10px;
  min-width: 48px;
  scroll-snap-align: start;
  transition: background 0.2s;
}

.wp-hour:hover {
  background: rgba(255,255,255,0.03);
}

.wp-hour--now {
  background: rgba(6, 182, 212, 0.08);
  border: 1px solid rgba(6, 182, 212, 0.12);
}

.wp-hour__time {
  font-size: 0.65rem;
  color: #8892A0;
  font-weight: 500;
  white-space: nowrap;
}

.wp-hour__icon {
  font-size: 1rem;
}

.wp-hour__temp {
  font-size: 0.78rem;
  font-weight: 700;
  color: #E0F2FE;
  font-family: 'Segoe UI', monospace;
}

.wp-hour__pop {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 0.6rem;
  color: #A855F7;
  font-weight: 500;
}

/* Forecast */
.wp-forecast {
  padding: 0 20px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.wp-day {
  display: grid;
  grid-template-columns: 44px 28px 1fr auto auto;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  transition: background 0.2s ease;
}

.wp-day:hover {
  background: rgba(255, 255, 255, 0.03);
}

.wp-day--today {
  background: rgba(6, 182, 212, 0.05);
  border: 1px solid rgba(6, 182, 212, 0.08);
}

.wp-day__label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #E0F2FE;
}

.wp-day__icon {
  font-size: 1.1rem;
  text-align: center;
}

.wp-day__weather {
  font-size: 0.78rem;
  color: #8892A0;
}

.wp-day__temp {
  font-size: 0.8rem;
  font-family: 'Segoe UI', monospace;
  text-align: right;
}

.wp-day__high {
  color: #E0F2FE;
  font-weight: 700;
}

.wp-day__sep {
  color: #556;
  margin: 0 2px;
}

.wp-day__low {
  color: #556;
}

.wp-day__wind {
  font-size: 0.7rem;
  color: #556;
  text-align: right;
  min-width: 44px;
}

/* Life Indices */
.wp-indices {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  padding: 0 20px 14px;
}

.wp-index {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(255,255,255,0.02);
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.04);
  transition: background 0.2s;
}

.wp-index:hover {
  background: rgba(255,255,255,0.04);
}

.wp-index__icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.wp-index__info {
  min-width: 0;
}

.wp-index__name {
  font-size: 0.68rem;
  color: #8892A0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wp-index__category {
  font-size: 0.75rem;
  font-weight: 700;
  color: #E0F2FE;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Update */
.wp-update {
  text-align: center;
  font-size: 0.65rem;
  color: #3d4a5c;
  padding: 0 20px 14px;
  letter-spacing: 0.3px;
}
</style>
