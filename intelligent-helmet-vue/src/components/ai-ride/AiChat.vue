<template>
  <!-- 嵌入式 AI 聊天面板 -->
  <div class="ai-panel">
    <div class="ai-panel__header">
      <div class="ai-panel__title">
        <div class="ai-panel__dot"></div>
        <span class="ai-panel__sub">灵盔AI助手</span>
      </div>
      <div class="ai-panel__actions">
        <!-- 退出对话（由父组件控制显示） -->
        <button v-if="showClose" class="ai-panel__exit" @click="$emit('close')" title="退出对话">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          <span>退出对话</span>
        </button>
        <button class="ai-panel__clear" @click="clearChat" title="清空对话">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="ai-panel__messages" ref="messagesEl">
      <!-- 欢迎消息 -->
      <div v-if="messages.length === 0" class="ai-welcome">
        <div class="ai-welcome__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="1.5">
            <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 2v10l6.5-3"/>
          </svg>
        </div>
        <p>你好！我是灵盔 AI 助手。</p>
        <p>我可以帮你分析传感器数据、提供骑行安全建议。</p>
        <div class="ai-welcome__hints">
          <button v-for="hint in hints" :key="hint" class="ai-hint" @click="sendHint(hint)">{{ hint }}</button>
        </div>
      </div>

      <!-- 按日期分组的消息列表 -->
      <template v-for="group in groupedMessages" :key="group.date">
        <!-- 日期分隔线 -->
        <div class="ai-date-divider">
          <span class="ai-date-divider__line"></span>
          <span class="ai-date-divider__label">{{ group.dateLabel }}</span>
          <span class="ai-date-divider__line"></span>
        </div>

        <div v-for="(msg, i) in group.messages" :key="group.date + i" class="ai-msg" :class="'ai-msg--' + msg.role">
          <div class="ai-msg__bubble">
            <span v-if="msg.role === 'assistant'" class="ai-msg__name">灵盔 AI</span>
            <div class="ai-msg__text" v-html="formatText(msg.content)"></div>
            <span class="ai-msg__time">{{ msg.timeStr }}</span>
          </div>
        </div>
      </template>

      <!-- 加载中 -->
      <div v-if="loading" class="ai-msg ai-msg--assistant">
        <div class="ai-msg__bubble">
          <span class="ai-msg__name">灵盔 AI</span>
          <div class="ai-typing">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </div>

    <div class="ai-panel__input">
      <textarea
        v-model="inputText"
        class="ai-input"
        placeholder="ASK_AI: 输入问题，如：当前温度正常吗？"
        rows="1"
        @keydown.enter.exact.prevent="sendMessage"
        @input="autoResize"
        ref="inputEl"
      ></textarea>
      <button class="ai-send" @click="sendMessage" :disabled="loading || !inputText.trim()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'

const props = defineProps({
  deviceId:   { type: String, default: '' },
  showClose:  { type: Boolean, default: false },
  sensorData: { type: Object, default: null }
})

const emit = defineEmits(['close'])

const messages = ref([])
const inputText = ref('')
const loading = ref(false)
const messagesEl = ref(null)
const inputEl = ref(null)

const hints = ['骑行规划是什么', '骑行安全建议', '当前位置在哪里？']

function getToken() {
  return sessionStorage.getItem('token') || ''
}

function authHeaders() {
  const token = getToken()
  return token ? { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
               : { 'Content-Type': 'application/json' }
}

// 给时间戳生成显示字符串
function nowTimeStr() {
  const d = new Date()
  return d.toTimeString().slice(0, 5)  // "HH:MM"
}
function nowDateKey() {
  const d = new Date()
  return d.toISOString().slice(0, 10)  // "YYYY-MM-DD"
}
function isoToTimeStr(iso) {
  // "2026-05-23T14:30:00" → "14:30"
  return iso ? iso.slice(11, 16) : nowTimeStr()
}
function isoToDateKey(iso) {
  return iso ? iso.slice(0, 10) : nowDateKey()
}
function formatDateLabel(dateKey) {
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  if (dateKey === today) return '今天'
  if (dateKey === yesterday) return '昨天'
  return dateKey.replace(/-/g, ' / ')
}

// 按日期分组
const groupedMessages = computed(() => {
  const groups = []
  let lastDate = null
  for (const msg of messages.value) {
    if (msg.dateKey !== lastDate) {
      groups.push({ date: msg.dateKey, dateLabel: formatDateLabel(msg.dateKey), messages: [] })
      lastDate = msg.dateKey
    }
    groups[groups.length - 1].messages.push(msg)
  }
  return groups
})

// 加载历史消息
async function loadHistory() {
  if (!getToken()) return
  try {
    const res = await fetch('/api/chat/history?limit=200', { headers: authHeaders() })
    if (!res.ok) return
    const data = await res.json()
    messages.value = data.map(m => ({
      role:    m.role,
      content: m.content,
      timeStr: isoToTimeStr(m.createdAt),
      dateKey: isoToDateKey(m.createdAt)
    }))
    await nextTick()
    scrollToBottom()
  } catch (e) {
    // 加载失败不影响正常使用
  }
}

async function clearChat() {
  if (getToken()) {
    try {
      await fetch('/api/chat/history', { method: 'DELETE', headers: authHeaders() })
    } catch (e) {}
  }
  messages.value = []
}

function sendHint(hint) {
  inputText.value = hint
  sendMessage()
}

// 构建实时传感器上下文，注入到每次对话的 system 消息
function buildSensorContext() {
  const d = props.sensorData
  if (!d || Object.keys(d).length === 0) return ''
  const parts = []
  if (d.temperature != null) parts.push(`温度 ${Number(d.temperature).toFixed(1)}°C`)
  if (d.humidity    != null) parts.push(`湿度 ${Number(d.humidity).toFixed(1)}%`)
  if (d.longitude && d.latitude) parts.push(`位置 (${Number(d.latitude).toFixed(5)}, ${Number(d.longitude).toFixed(5)})`)
  if (d.fallFlag)  parts.push('⚠️ 检测到跌倒')
  if (d.slowFlag)  parts.push('⚠️ 速度过慢')
  if (parts.length === 0) return ''
  return `[当前头盔传感器数据：${parts.join('，')}]`
}

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || loading.value) return

  messages.value.push({ role: 'user', content: text, timeStr: nowTimeStr(), dateKey: nowDateKey() })
  inputText.value = ''
  loading.value = true
  scrollToBottom()

  const ctx = buildSensorContext()
  const msgList = messages.value.map(m => ({ role: m.role, content: m.content }))
  // 在最后一条用户消息前插入传感器上下文（不显示在界面上）
  if (ctx) {
    const lastUserIdx = [...msgList].reverse().findIndex(m => m.role === 'user')
    if (lastUserIdx !== -1) {
      const idx = msgList.length - 1 - lastUserIdx
      msgList[idx] = { role: 'user', content: ctx + '\n' + msgList[idx].content }
    }
  }

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ messages: msgList, deviceId: props.deviceId || '' })
    })
    const data = await res.json()
    if (data.error) {
      messages.value.push({ role: 'assistant', content: '⚠️ ' + data.error, timeStr: nowTimeStr(), dateKey: nowDateKey(), failed: false })
    } else {
      messages.value.push({ role: 'assistant', content: data.content, timeStr: nowTimeStr(), dateKey: nowDateKey() })
    }
  } catch (e) {
    messages.value.push({ role: 'assistant', content: '⚠️ 网络错误，请检查后端服务是否运行。', timeStr: nowTimeStr(), dateKey: nowDateKey(), failed: true, retryText: text })
  } finally {
    loading.value = false
    await nextTick()
    scrollToBottom()
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight
    }
  })
}

function autoResize(e) {
  const el = e.target
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

function formatText(text) {
  const escaped = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return escaped.length < 5000
    ? escaped.replace(/\n/g, '<br>').replace(/\*\*([^*]{1,100})\*\*/g, '<strong>$1</strong>')
    : escaped.replace(/\n/g, '<br>')
}

onMounted(() => {
  loadHistory()
})
</script>

<style scoped>
/* ── 嵌入式面板容器 ──────────────────────────────────────────────── */
.ai-panel {
  display: flex;
  flex-direction: column;
  background: rgba(2, 8, 23, 0.35);
  border: 1px solid rgba(56, 189, 248, 0.2);
  backdrop-filter: blur(6px);
  overflow: hidden;
  flex: 1;
  min-height: 0;
  position: relative;
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%);
}
/* cyber anchor top-left */
.ai-panel::before {
  content: "";
  position: absolute;
  top: -1px; left: -1px;
  width: 12px; height: 12px;
  border-top: 2px solid #38bdf8;
  border-left: 2px solid #38bdf8;
  pointer-events: none;
  z-index: 10;
}

/* Header */
.ai-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(56, 189, 248, 0.12);
  background: rgba(0, 0, 0, 0.25);
  flex-shrink: 0;
}
.ai-panel__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono, monospace);
  font-size: 0.72rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.10em;
  text-transform: uppercase;
}
.ai-panel__sub {
  font-size: 0.70rem;
  color: rgba(56, 189, 248, 0.45);
  font-weight: 400;
  letter-spacing: 0.06em;
}
.ai-panel__dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.8);
  animation: pulse-dot 2s infinite;
  flex-shrink: 0;
}
@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.6); }
  50%       { box-shadow: 0 0 0 4px rgba(56, 189, 248, 0); }
}
.ai-panel__actions { display: flex; align-items: center; gap: 4px; }
.ai-panel__exit {
  display: flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: 1px solid rgba(239,68,68,0.25);
  color: rgba(239,68,68,0.7);
  font-family: var(--font-mono, monospace);
  font-size: 0.58rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  padding: 3px 8px;
  cursor: pointer;
  transition: all 0.15s;
}
.ai-panel__exit:hover {
  background: rgba(239,68,68,0.12);
  color: #EF4444;
  border-color: rgba(239,68,68,0.5);
}
.ai-panel__clear {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.20);
  cursor: pointer;
  padding: 4px;
  display: flex; align-items: center;
  transition: color 0.2s;
}
.ai-panel__clear:hover { color: #EF4444; }

/* Messages */
.ai-panel__messages {
  flex: 1;
  overflow-y: scroll;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scrollbar-width: thin;
  scrollbar-color: rgba(56, 189, 248, 0.35) rgba(56, 189, 248, 0.05);
}
.ai-panel__messages::-webkit-scrollbar {
  width: 5px;
}
.ai-panel__messages::-webkit-scrollbar-track {
  background: rgba(56, 189, 248, 0.04);
  border-left: 1px solid rgba(56, 189, 248, 0.08);
}
.ai-panel__messages::-webkit-scrollbar-thumb {
  background: rgba(56, 189, 248, 0.35);
  border-radius: 2px;
}
.ai-panel__messages::-webkit-scrollbar-thumb:hover {
  background: rgba(56, 189, 248, 0.6);
}

/* 日期分隔线 */
.ai-date-divider {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 6px 0 2px;
  flex-shrink: 0;
}
.ai-date-divider__line {
  flex: 1;
  height: 1px;
  background: rgba(56, 189, 248, 0.08);
}
.ai-date-divider__label {
  font-family: var(--font-mono, monospace);
  font-size: 0.60rem;
  color: rgba(56, 189, 248, 0.30);
  letter-spacing: 0.10em;
  white-space: nowrap;
  padding: 0 4px;
}

/* 消息时间戳 */
.ai-msg__time {
  font-family: var(--font-mono, monospace);
  font-size: 0.58rem;
  color: rgba(255, 255, 255, 0.18);
  letter-spacing: 0.04em;
  margin-top: 2px;
  align-self: flex-end;
}
.ai-msg--user .ai-msg__time {
  align-self: flex-end;
}

/* Welcome */
.ai-welcome {
  text-align: center;
  color: rgba(255, 255, 255, 0.35);
  font-family: var(--font-mono, monospace);
  font-size: 0.75rem;
  line-height: 1.6;
  padding: 16px 8px;
}
.ai-welcome__icon { margin-bottom: 10px; opacity: 0.7; }
.ai-welcome p { margin: 3px 0; }
.ai-welcome__hints {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  justify-content: center;
  margin-top: 12px;
}
.ai-hint {
  padding: 3px 10px;
  border: 1px solid rgba(56, 189, 248, 0.20);
  background: rgba(56, 189, 248, 0.04);
  color: rgba(56, 189, 248, 0.7);
  font-family: var(--font-mono, monospace);
  font-size: 0.65rem;
  cursor: pointer;
  transition: all 0.2s;
  clip-path: polygon(4px 0%,100% 0%,100% calc(100% - 4px),calc(100% - 4px) 100%,0% 100%,0% 4px);
}
.ai-hint:hover {
  background: rgba(56, 189, 248, 0.10);
  border-color: rgba(56, 189, 248, 0.45);
  color: #38bdf8;
}

/* Messages */
.ai-msg { display: flex; }
.ai-msg--user      { justify-content: flex-end; }
.ai-msg--assistant { justify-content: flex-start; }
.ai-msg__bubble {
  max-width: 84%;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.ai-msg--user .ai-msg__bubble { align-items: flex-end; }
.ai-msg__name {
  font-family: var(--font-mono, monospace);
  font-size: 0.60rem;
  color: rgba(56, 189, 248, 0.35);
  padding-left: 2px;
  letter-spacing: 0.06em;
}
.ai-msg__text {
  padding: 8px 12px;
  font-size: 0.80rem;
  line-height: 1.55;
  word-break: break-word;
}
.ai-msg--user .ai-msg__text {
  background: rgba(56, 189, 248, 0.08);
  border: 1px solid rgba(56, 189, 248, 0.20);
  color: #E0F2FE;
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%);
}
.ai-msg--assistant .ai-msg__text {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-left: 2px solid rgba(56, 189, 248, 0.4);
  color: #C8D6E5;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 6px 100%, 0 calc(100% - 6px));
}

/* Typing */
.ai-typing {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-left: 2px solid rgba(56, 189, 248, 0.4);
}
.ai-typing span {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: #38bdf8;
  animation: typing-bounce 1.2s infinite;
}
.ai-typing span:nth-child(2) { animation-delay: 0.2s; }
.ai-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
  30%            { transform: translateY(-5px); opacity: 1; }
}

/* Input */
.ai-panel__input {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  padding: 10px 12px;
  border-top: 1px solid rgba(56, 189, 248, 0.12);
  background: rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}
.ai-input {
  flex: 1;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(56, 189, 248, 0.2);
  padding: 7px 11px;
  color: #E0F2FE;
  font-family: var(--font-mono, monospace);
  font-size: 0.75rem;
  resize: none;
  outline: none;
  line-height: 1.5;
  min-height: 34px;
  max-height: 100px;
  transition: border-color 0.2s;
  clip-path: polygon(4px 0%,100% 0%,100% calc(100% - 4px),calc(100% - 4px) 100%,0% 100%,0% 4px);
}
.ai-input:focus {
  border-color: rgba(56, 189, 248, 0.40);
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.06);
}
.ai-input::placeholder {
  color: rgba(56, 189, 248, 0.20);
  font-size: 0.68rem;
}
.ai-send {
  width: 34px; height: 34px;
  border: 1px solid rgba(56, 189, 248, 0.25);
  background: rgba(56, 189, 248, 0.08);
  color: #38bdf8;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
  clip-path: polygon(6px 0%,100% 0%,100% calc(100% - 6px),calc(100% - 6px) 100%,0% 100%,0% 6px);
}
.ai-send:hover:not(:disabled) {
  background: rgba(56, 189, 248, 0.16);
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.25);
}
.ai-send:disabled { opacity: 0.3; cursor: not-allowed; }
</style>
