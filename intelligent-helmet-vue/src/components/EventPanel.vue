<template>
  <div class="event-panel" :class="{ 'event-panel--active': eventHistory.length > 0 }" data-aos="fade-up" data-aos-delay="500">
    <!-- Top severity strip -->
    <div class="event-panel__strip" :class="{ 'event-panel__strip--danger': eventHistory.length > 0 }"></div>

    <div class="event-panel__header">
      <div class="event-panel__title-group">
        <div class="event-panel__icon-wrap">
          <!-- Radar rings -->
          <div class="radar">
            <div class="radar__ring radar__ring--1"></div>
            <div class="radar__ring radar__ring--2"></div>
            <div class="radar__core" :class="{ 'radar__core--alert': eventHistory.length > 0 }"></div>
          </div>
        </div>
        <div>
          <div class="event-panel__title">紧急事件预览</div>
          <div class="event-panel__subtitle">EMERGENCY EVENT MONITOR</div>
        </div>
      </div>
      <div class="event-panel__header-right">
        <div class="event-panel__status">
          <div class="event-panel__live-dot" :class="{ 'event-panel__live-dot--active': eventHistory.length > 0 }"></div>
          <span>{{ eventHistory.length > 0 ? 'ALERT' : 'MONITORING' }}</span>
        </div>
        <div class="event-panel__counter">{{ eventHistory.length }}</div>
      </div>
    </div>

    <div class="event-panel__list" ref="eventList">
      <div v-if="eventHistory.length === 0" class="event-panel__empty">
        <div class="empty-shield">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3d4a5c" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <div class="empty-shield__pulse"></div>
        </div>
        <span class="empty-text">系统监控中 · 暂无紧急事件</span>
        <span class="empty-sub">Fall detection active</span>
      </div>
      <EventItem
        v-for="(event, index) in eventHistory"
        :key="event.id || index"
        :event="event"
        :delay="500 + (index * 50)"
        :isFirst="index === 0"
        :isLast="index === eventHistory.length - 1"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import EventItem from './EventItem.vue'
import { eventDefinitions } from '@/utils/eventConfig.js'

const eventHistory = ref([])
const lastEventState = ref({})
const eventList = ref(null)

let voiceReady = false
let cachedVoices = []

function initVoices() {
  function setVoices() {
    cachedVoices = speechSynthesis.getVoices() || []
    voiceReady = cachedVoices.length > 0
  }
  setVoices()
  window.speechSynthesis && window.speechSynthesis.addEventListener &&
    window.speechSynthesis.addEventListener('voiceschanged', setVoices)
}

initVoices()

function processDeviceEvents(data) {
  const deviceId = data.deviceId || 'unknown'
  const previous = lastEventState.value[deviceId] || {}
  const now = new Date()
  for (const def of eventDefinitions) {
    const flagNow = !!data[def.key]
    const flagPrev = !!previous[def.key]
    if (flagNow && !flagPrev) {
      const newEvent = {
        id: `${deviceId}_${def.type}_${now.getTime()}`,
        deviceId,
        type: def.type,
        name: def.name,
        timestamp: now,
        longitude: data.longitude || null,
        latitude: data.latitude || null
      }
      const latest = eventHistory.value[0]
      if (latest && latest.deviceId === newEvent.deviceId && latest.type === newEvent.type) {
        const diff = now.getTime() - new Date(latest.timestamp).getTime()
        if (diff < 5000) {
          // skip duplicate
        } else {
          addEvent(newEvent)
        }
      } else {
        addEvent(newEvent)
      }

      if (def.type === 'fall') {
        speakText('注意，检测到用户摔倒，请及时处理！')
        setTimeout(scrollToLatest, 120)
      }
    }
  }

  lastEventState.value[deviceId] = {}
  for (const def of eventDefinitions) {
    lastEventState.value[deviceId][def.key] = !!data[def.key]
  }
}

function addEvent(ev) {
  eventHistory.value.unshift(ev)
  if (eventHistory.value.length > 200) eventHistory.value.length = 200
}

function speakText(text) {
  if (!('speechSynthesis' in window)) return
  const utter = new SpeechSynthesisUtterance(text)
  utter.rate = 1
  utter.pitch = 1
  if (voiceReady && cachedVoices.length) {
    const zh = cachedVoices.find(v => v.lang && v.lang.includes('zh')) || cachedVoices[0]
    if (zh) utter.voice = zh
  }
  speechSynthesis.speak(utter)
}

function scrollToLatest() {
  if (!eventList.value) return
  eventList.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const first = eventList.value.querySelector('.event-item')
  if (first) {
    first.classList.add('fall-alert')
    setTimeout(() => first.classList.remove('fall-alert'), 4000)
  }
}

function clearAllEvents() {
  eventHistory.value = []
  lastEventState.value = {}
}

defineExpose({ processDeviceEvents, clearAllEvents, addEvent })
</script>

<style scoped>
.event-panel {
  position: relative;
  background: linear-gradient(145deg, #0f1624 0%, #151d2b 100%);
  border-radius: 20px;
  padding: 0;
  margin-top: 24px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  box-shadow: 0 4px 24px -8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.04);
  transition: border-color 0.4s ease, box-shadow 0.4s ease;
}

.event-panel--active {
  border-color: rgba(255, 71, 87, 0.15);
  box-shadow: 0 4px 30px -8px rgba(255, 71, 87, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

/* Top severity strip */
.event-panel__strip {
  height: 3px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
  transition: background 0.4s ease;
}

.event-panel__strip--danger {
  background: linear-gradient(90deg, transparent, #A855F7, #00D9FF, #A855F7, transparent);
  animation: strip-glow 3s ease infinite;
}

@keyframes strip-glow {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* Header */
.event-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.event-panel__title-group {
  display: flex;
  align-items: center;
  gap: 14px;
}

.event-panel__icon-wrap {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Radar animation */
.radar {
  position: relative;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radar__ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 71, 87, 0.15);
  animation: radar-expand 3s ease-out infinite;
}

.radar__ring--1 {
  width: 20px;
  height: 20px;
  animation-delay: 0s;
}

.radar__ring--2 {
  width: 20px;
  height: 20px;
  animation-delay: 1.5s;
}

@keyframes radar-expand {
  0% { width: 16px; height: 16px; opacity: 0.6; border-color: rgba(255, 71, 87, 0.4); }
  100% { width: 42px; height: 42px; opacity: 0; border-color: rgba(255, 71, 87, 0); }
}

.radar__core {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 71, 87, 0.15);
  border: 2px solid rgba(255, 71, 87, 0.3);
  z-index: 1;
  transition: all 0.3s ease;
}

.radar__core--alert {
  background: #A855F7;
  border-color: #A855F7;
  box-shadow: 0 0 12px rgba(255, 71, 87, 0.6);
}

.event-panel__title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #E0F2FE;
  line-height: 1.2;
}

.event-panel__subtitle {
  font-size: 0.65rem;
  color: #4a5568;
  font-weight: 500;
  letter-spacing: 1.5px;
  margin-top: 2px;
}

.event-panel__header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.event-panel__status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #8892A0;
  letter-spacing: 1px;
}

.event-panel__live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4a5568;
  transition: all 0.3s ease;
}

.event-panel__live-dot--active {
  background: #A855F7;
  box-shadow: 0 0 8px rgba(255, 71, 87, 0.6);
  animation: blink-dot 1s ease infinite;
}

@keyframes blink-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.event-panel__counter {
  font-size: 0.85rem;
  font-weight: 700;
  color: #00D9FF;
  background: rgba(255, 107, 53, 0.1);
  padding: 5px 14px;
  border-radius: 20px;
  min-width: 24px;
  text-align: center;
  border: 1px solid rgba(255, 107, 53, 0.15);
  font-family: 'Segoe UI', monospace;
}

/* List */
.event-panel__list {
  max-height: 420px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px 20px 20px 20px;
}

.event-panel__list::-webkit-scrollbar {
  width: 3px;
}

.event-panel__list::-webkit-scrollbar-thumb {
  background: rgba(255, 71, 87, 0.25);
  border-radius: 2px;
}

.event-panel__list::-webkit-scrollbar-track {
  background: transparent;
}

/* Empty state */
.event-panel__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
  padding: 48px 40px;
}

.empty-shield {
  position: relative;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-shield__pulse {
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 1px solid rgba(61, 74, 92, 0.2);
  animation: shield-pulse 3s ease infinite;
}

@keyframes shield-pulse {
  0% { transform: scale(0.8); opacity: 0.5; }
  50% { transform: scale(1.3); opacity: 0; }
  100% { transform: scale(0.8); opacity: 0.5; }
}

.empty-text {
  color: #8892A0;
  font-size: 0.9rem;
  font-weight: 500;
}

.empty-sub {
  color: #3d4a5c;
  font-size: 0.7rem;
  letter-spacing: 1px;
  text-transform: uppercase;
}
</style>
