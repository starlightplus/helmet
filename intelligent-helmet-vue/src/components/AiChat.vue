<template>
  <!-- 嵌入式 AI 聊天面板 -->
  <div class="ai-panel">
    <div class="ai-panel__header">
      <div class="ai-panel__title">
        <div class="ai-panel__dot"></div>
        <span class="ai-panel__sub">灵盔AI助手</span>
      </div>
      <div class="ai-panel__actions">
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00F3FF" stroke-width="1.5">
            <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 2v10l6.5-3"/>
          </svg>
        </div>
        <p>你好！我是灵盔 AI 助手。</p>
        <p>我可以帮你分析传感器数据、提供骑行安全建议。</p>
        <div class="ai-welcome__hints">
          <button v-for="hint in hints" :key="hint" class="ai-hint" @click="sendHint(hint)">{{ hint }}</button>
        </div>
      </div>

      <!-- 消息列表 -->
      <div v-for="(msg, i) in messages" :key="i" class="ai-msg" :class="'ai-msg--' + msg.role">
        <div class="ai-msg__bubble">
          <span v-if="msg.role === 'assistant'" class="ai-msg__name">灵盔 AI</span>
          <div class="ai-msg__text" v-html="formatText(msg.content)"></div>
        </div>
      </div>

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
import { ref, nextTick } from 'vue'

const props = defineProps({
  deviceId: { type: String, default: '' }
})

const messages = ref([])
const inputText = ref('')
const loading = ref(false)
const messagesEl = ref(null)
const inputEl = ref(null)

const hints = ['当前温度正常吗？', '骑行安全建议', '当前位置在哪里？', '设备状态如何？']

function clearChat() {
  messages.value = []
}

function sendHint(hint) {
  inputText.value = hint
  sendMessage()
}

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || loading.value) return

  messages.value.push({ role: 'user', content: text })
  inputText.value = ''
  loading.value = true
  scrollToBottom()

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages.value.map(m => ({ role: m.role, content: m.content })),
        deviceId: props.deviceId || ''
      })
    })
    const data = await res.json()
    if (data.error) {
      messages.value.push({ role: 'assistant', content: '⚠️ ' + data.error })
    } else {
      messages.value.push({ role: 'assistant', content: data.content })
    }
  } catch (e) {
    messages.value.push({ role: 'assistant', content: '⚠️ 网络错误，请检查后端服务是否运行。' })
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
  // 安全转义，避免正则回溯卡死
  const escaped = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  // 换行转 <br>，**粗体** 转 <strong>（限制长度防卡）
  return escaped.length < 5000
    ? escaped.replace(/\n/g, '<br>').replace(/\*\*([^*]{1,100})\*\*/g, '<strong>$1</strong>')
    : escaped.replace(/\n/g, '<br>')
}
</script>

<style scoped>
/* ── 嵌入式面板容器 ──────────────────────────────────────────────── */
.ai-panel {
  display: flex;
  flex-direction: column;
  background: rgba(7, 7, 7, 0.90);
  border: 1px solid rgba(0, 243, 255, 0.15);
  backdrop-filter: blur(12px);
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
  border-top: 2px solid #00F3FF;
  border-left: 2px solid #00F3FF;
  pointer-events: none;
  z-index: 10;
}

/* Header */
.ai-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(0, 243, 255, 0.08);
  background: rgba(0, 243, 255, 0.03);
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
  color: rgba(0, 243, 255, 0.45);
  font-weight: 400;
  letter-spacing: 0.06em;
}
.ai-panel__dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #00F3FF;
  box-shadow: 0 0 8px rgba(0, 243, 255, 0.8);
  animation: pulse-dot 2s infinite;
  flex-shrink: 0;
}
@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0, 243, 255, 0.6); }
  50%       { box-shadow: 0 0 0 4px rgba(0, 243, 255, 0); }
}
.ai-panel__actions { display: flex; align-items: center; gap: 4px; }
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
  overflow-y: auto;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 243, 255, 0.15) transparent;
}
.ai-panel__messages::-webkit-scrollbar { width: 2px; }
.ai-panel__messages::-webkit-scrollbar-thumb {
  background: rgba(0, 243, 255, 0.2);
  border-radius: 1px;
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
  border: 1px solid rgba(0, 243, 255, 0.20);
  background: rgba(0, 243, 255, 0.04);
  color: rgba(0, 243, 255, 0.7);
  font-family: var(--font-mono, monospace);
  font-size: 0.65rem;
  cursor: pointer;
  transition: all 0.2s;
  clip-path: polygon(4px 0%,100% 0%,100% calc(100% - 4px),calc(100% - 4px) 100%,0% 100%,0% 4px);
}
.ai-hint:hover {
  background: rgba(0, 243, 255, 0.10);
  border-color: rgba(0, 243, 255, 0.45);
  color: #00F3FF;
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
  color: rgba(0, 243, 255, 0.35);
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
  background: rgba(0, 243, 255, 0.08);
  border: 1px solid rgba(0, 243, 255, 0.20);
  color: #E0F2FE;
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%);
}
.ai-msg--assistant .ai-msg__text {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-left: 2px solid rgba(0, 243, 255, 0.4);
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
  border-left: 2px solid rgba(0, 243, 255, 0.4);
}
.ai-typing span {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: #00F3FF;
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
  border-top: 1px solid rgba(0, 243, 255, 0.08);
  background: rgba(0, 243, 255, 0.02);
  flex-shrink: 0;
}
.ai-input {
  flex: 1;
  background: rgba(0, 243, 255, 0.04);
  border: 1px solid rgba(0, 243, 255, 0.15);
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
  border-color: rgba(0, 243, 255, 0.40);
  box-shadow: 0 0 0 2px rgba(0, 243, 255, 0.06);
}
.ai-input::placeholder {
  color: rgba(0, 243, 255, 0.20);
  font-size: 0.68rem;
}
.ai-send {
  width: 34px; height: 34px;
  border: 1px solid rgba(0, 243, 255, 0.25);
  background: rgba(0, 243, 255, 0.08);
  color: #00F3FF;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
  clip-path: polygon(6px 0%,100% 0%,100% calc(100% - 6px),calc(100% - 6px) 100%,0% 100%,0% 6px);
}
.ai-send:hover:not(:disabled) {
  background: rgba(0, 243, 255, 0.16);
  box-shadow: 0 0 10px rgba(0, 243, 255, 0.25);
}
.ai-send:disabled { opacity: 0.3; cursor: not-allowed; }
</style>
