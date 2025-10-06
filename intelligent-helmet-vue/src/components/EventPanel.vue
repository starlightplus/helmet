<template>
  <div class="event-panel" data-aos="fade-up" data-aos-delay="500">
    <div class="event-panel-header">
      <div class="event-panel-title">设备事件监控</div>
      <div class="event-counter">事件总数: {{ eventHistory.length }}</div>
    </div>
    <div class="event-list" ref="eventList">
      <div v-if="eventHistory.length === 0" class="event-empty">暂无事件记录</div>
      <EventItem
        v-for="(event, index) in eventHistory"
        :key="event.id || index"
        :event="event"
        :delay="500 + (index * 50)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import EventItem from './EventItem.vue'
import { eventDefinitions } from '@/utils/eventConfig.js'

const eventHistory = ref([])
const lastEventState = ref({}) // deviceId => { fallFlag:..., slowFlag:..., ... }
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
      // triggered event
      const newEvent = {
        id: `${deviceId}_${def.type}_${now.getTime()}`,
        deviceId,
        type: def.type,
        name: def.name,
        timestamp: now
      }
      // simple de-dup: if the latest event equals same type/device within 5s, skip
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

  // update lastEventState
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
  // flash the first item
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

defineExpose({ processDeviceEvents, clearAllEvents })
</script>

<style scoped>
/* 复用你已有样式（略），保留 fall-alert 动画 */
.event-panel {
  background: rgba(10, 15, 44, 0.4);
  border-radius: 20px;
  padding: 24px;
  margin-top: 30px;
  border: 1px solid rgba(0, 247, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  width: 100%;
  box-sizing: border-box;
}

.event-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 247, 255, 0.2);
}

.event-panel-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #00f7ff;
  text-shadow: 0 0 10px rgba(0, 247, 255, 0.5);
}

.event-counter {
  font-size: 0.9rem;
  color: rgba(224, 224, 224, 0.8);
  background: rgba(0, 247, 255, 0.12);
  padding: 6px 12px;
  border-radius: 12px;
}

.event-list {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 10px;
}

.event-list::-webkit-scrollbar {
  width: 6px;
}

.event-list::-webkit-scrollbar-thumb {
  background: rgba(0, 247, 255, 0.3);
  border-radius: 3px;
}

.event-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.event-empty {
  text-align: center;
  padding: 40px;
  color: rgba(224, 224, 224, 0.7);
  font-size: 1.1rem;
}
</style>