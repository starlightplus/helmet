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
import { ref, computed, onMounted } from 'vue'
import EventItem from './EventItem.vue'
import { eventDefinitions } from '@/utils/eventConfig.js'
import request from '@/utils/request'

const eventHistory = ref([])
const lastEventState = ref({})
const eventList = ref(null)
const contacts = ref([])

onMounted(() => {
  try { contacts.value = JSON.parse(localStorage.getItem('emergency_contacts')) || [] } catch { contacts.value = [] }
})

const primaryContact = computed(() => contacts.value[0] || null)

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
  // persist to server (best-effort, no await to avoid blocking UI)
  request.post('/api/user/events', {
    eventType: ev.type,
    eventName: ev.name,
    deviceId:  ev.deviceId || '',
    longitude: ev.longitude ?? null,
    latitude:  ev.latitude  ?? null
  }).catch(() => { /* silent fallback */ })
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
/* ── Panel Container ───────────────────────────────────────────── */
.event-panel {
  position: relative;
  background:
    radial-gradient(circle, rgba(56,189,248,0.035) 1px, transparent 1px),
    rgba(5, 8, 18, 0.82);
  background-size: 24px 24px, auto;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(56,189,248,0.18);
  border-radius: 10px;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  transition: border-color 0.4s ease, box-shadow 0.4s ease;
  box-shadow: 0 4px 32px rgba(0,0,0,0.55);
}
/* top gradient line */
.event-panel::before {
  display: none;
}

.event-panel--active {
  border-color: rgba(239, 68, 68, 0.20);
  box-shadow: 0 0 24px -6px rgba(239, 68, 68, 0.12);
}

/* Top severity strip */
.event-panel__strip {
  height: 2px;
  background: rgba(56,189,248,0.06);
  transition: background 0.4s ease;
}
.event-panel__strip--danger {
  background: linear-gradient(90deg, transparent, #EF4444, #FFAA00, #EF4444, transparent);
  animation: strip-glow 3s ease infinite;
}
@keyframes strip-glow {
  0%, 100% { opacity: 0.5; }
  50%       { opacity: 1; }
}

/* Header */
.event-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px 16px;
  border-bottom: 1px solid rgba(56, 189, 248, 0.08);
}

.event-panel__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.event-panel__icon-wrap {
  width: 38px; height: 38px;
  display: flex; align-items: center; justify-content: center;
}

/* Radar rings */
.radar {
  position: relative;
  width: 38px; height: 38px;
  display: flex; align-items: center; justify-content: center;
}
.radar__ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(239, 68, 68, 0.15);
  animation: radar-expand 3s ease-out infinite;
}
.radar__ring--1 { width: 20px; height: 20px; animation-delay: 0s; }
.radar__ring--2 { width: 20px; height: 20px; animation-delay: 1.5s; }
@keyframes radar-expand {
  0%   { width: 14px; height: 14px; opacity: 0.7; border-color: rgba(239,68,68,0.5); }
  100% { width: 38px; height: 38px; opacity: 0;   border-color: rgba(239,68,68,0); }
}
.radar__core {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.12);
  border: 2px solid rgba(239, 68, 68, 0.25);
  z-index: 1;
  transition: all 0.3s ease;
}
.radar__core--alert {
  background: #EF4444;
  border-color: #EF4444;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.7);
}

.event-panel__title {
  font-family: var(--font-mono, monospace);
  font-size: 0.78rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  line-height: 1.2;
}
.event-panel__subtitle {
  font-family: var(--font-mono, monospace);
  font-size: 0.6rem;
  color: white;
  letter-spacing: 0.15em;
  margin-top: 2px;
}

.event-panel__header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.event-panel__status {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border: 1px solid rgba(56, 189, 248, 0.10);
  background: rgba(56, 189, 248, 0.03);
  clip-path: polygon(5px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 5px);
  font-family: var(--font-mono, monospace);
  font-size: 0.62rem;
  font-weight: 600;
  color: rgba(56, 189, 248, 0.6);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.event-panel__live-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: rgba(56, 189, 248, 0.25);
  transition: all 0.3s ease;
}
.event-panel__live-dot--active {
  background: #EF4444;
  box-shadow: 0 0 6px rgba(239, 68, 68, 0.7);
  animation: blink-dot 1s ease infinite;
}
@keyframes blink-dot {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.2; }
}

.event-panel__counter {
  font-family: var(--font-mono, monospace);
  font-size: 0.78rem;
  font-weight: 700;
  color: #EF4444;
  background: rgba(239, 68, 68, 0.08);
  padding: 4px 12px;
  min-width: 20px;
  text-align: center;
  border: 1px solid rgba(239, 68, 68, 0.20);
  clip-path: polygon(5px 0%,100% 0%,100% calc(100% - 5px),calc(100% - 5px) 100%,0% 100%,0% 5px);
}

/* List */
.event-panel__list {
  max-height: 420px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 14px 18px 18px;
}
.event-panel__list::-webkit-scrollbar { width: 2px; }
.event-panel__list::-webkit-scrollbar-thumb {
  background: rgba(239, 68, 68, 0.3);
  border-radius: 1px;
}
.event-panel__list::-webkit-scrollbar-track { background: transparent; }

/* Empty state */
.event-panel__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  padding: 40px 32px;
  position: relative;
  overflow: hidden;
}
/* scan-line sweep */
.event-panel__empty::before {
  content: '';
  position: absolute;
  left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(56,189,248,0.35), transparent);
  animation: scan-sweep 4s linear infinite;
  top: 0;
}
@keyframes scan-sweep {
  0%   { top: 0%;   opacity: 0; }
  5%   { opacity: 1; }
  95%  { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
.empty-shield {
  position: relative;
  width: 64px; height: 64px;
  display: flex; align-items: center; justify-content: center;
}
/* glow halo behind shield */
.empty-shield::before {
  content: '';
  position: absolute;
  inset: -12px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(56,189,248,0.14) 0%, transparent 70%);
  animation: shield-glow 4s ease-in-out infinite;
}
@keyframes shield-glow {
  0%,100% { opacity: 0.3; transform: scale(0.85); }
  50%      { opacity: 0.9; transform: scale(1.2); }
}
.empty-shield__pulse {
  position: absolute;
  width: 44px; height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(56, 189, 248, 0.18);
  animation: shield-pulse 3s ease infinite;
}
@keyframes shield-pulse {
  0%   { transform: scale(0.8); opacity: 0.6; }
  50%  { transform: scale(1.4); opacity: 0; }
  100% { transform: scale(0.8); opacity: 0.6; }
}
.empty-text {
  font-family: var(--font-mono, monospace);
  color: #A0AAB2;
  font-size: 0.75rem;
  letter-spacing: 0.06em;
}
.empty-sub {
  font-family: var(--font-mono, monospace);
  color: rgba(56,189,248,0.4);
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
/* Contact */
.event-panel__contact {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  text-align: right;
  margin-right: 12px;
}
.event-panel__contact-name {
  font-size: 0.8rem;
  font-weight: 700;
  color: #38bdf8;
  white-space: nowrap;
}
.event-panel__contact-note {
  font-size: 0.65rem;
  color: white;
  white-space: nowrap;
}
.event-panel__contact-setup {
  font-size: 0.72rem;
  font-weight: 600;
  color: #38bdf8;
  text-decoration: underline;
  cursor: pointer;
  white-space: nowrap;
}
.event-panel__contact-setup:hover { color: #7dd3fc; }
</style>
