<template>
  <!-- 浮动按钮 -->
  <button class="ai-fab" @click="togglePanel" :class="{ 'ai-fab--open': isOpen }">
    <svg v-if="!isOpen" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
    <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
    <span class="ai-fab__label">灵盔 AI</span>
  </button>

  <!-- 聊天面板 -->
  <Transition name="chat-slide">
    <div v-if="isOpen" class="ai-panel">
      <div class="ai-panel__header">
        <div class="ai-panel__title">
          <div class="ai-panel__dot"></div>
          <span>灵盔 AI 助手</span>
        </div>
        <div class="ai-panel__actions">
          <button class="ai-panel__clear" @click="clearChat" title="清空对话">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
          <button class="ai-panel__close" @click="isOpen = false" title="关闭">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="ai-panel__messages" ref="messagesEl">
        <!-- 欢迎消息 -->
        <div v-if="messages.length === 0" class="ai-welcome">
          <div class="ai-welcome__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="1.5">
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
          placeholder="输入问题，如：当前温度正常吗？"
          rows="1"
          @keydown.enter.exact.prevent="sendMessage"
          @input="autoResize"
          ref="inputEl"
        ></textarea>
        <button class="ai-send" @click="sendMessage" :disabled="loading || !inputText.trim()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const props = defineProps({
  deviceId: { type: String, default: '' }
})

const isOpen = ref(false)
const messages = ref([])
const inputText = ref('')
const loading = ref(false)
const messagesEl = ref(null)
const inputEl = ref(null)

const hints = ['当前温度正常吗？', '骑行安全建议', '当前位置在哪里？', '设备状态如何？']

function togglePanel() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => inputEl.value?.focus())
  }
}

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
/* 浮动按钮 */
.ai-fab {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 1000;
  display: none;
}

.ai-fab:hover {
  background: linear-gradient(135deg, rgba(0, 217, 255, 0.25), rgba(168, 85, 247, 0.25));
  box-shadow: 0 6px 32px rgba(0, 217, 255, 0.4);
  transform: translateY(-2px);
}

.ai-fab--open {
  background: rgba(255, 71, 87, 0.15);
  border-color: rgba(255, 71, 87, 0.4);
  color: #FF4757;
  box-shadow: 0 4px 24px rgba(255, 71, 87, 0.2);
}

.ai-fab__label {
  letter-spacing: 0.3px;
}

/* 聊天面板 */
.ai-panel {
  position: fixed;
  bottom: 90px;
  right: 28px;
  z-index: 999;
  width: 360px;
  height: 520px;
  display: flex;
  flex-direction: column;
  background: rgba(10, 14, 26, 0.97);
  border: 1px solid rgba(0, 217, 255, 0.25);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0, 217, 255, 0.1);
  backdrop-filter: blur(20px);
  overflow: hidden;
}

/* 面板头部 */
.ai-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(0, 217, 255, 0.12);
  background: rgba(0, 217, 255, 0.05);
  flex-shrink: 0;
}

.ai-panel__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  color: #E0F2FE;
}

.ai-panel__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00D9FF;
  box-shadow: 0 0 8px rgba(0, 217, 255, 0.8);
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0, 217, 255, 0.6); }
  50% { box-shadow: 0 0 0 5px rgba(0, 217, 255, 0); }
}

.ai-panel__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.ai-panel__clear {
  background: transparent;
  border: none;
  color: #556;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: color 0.2s;
}

.ai-panel__clear:hover { color: #FF4757; }

.ai-panel__close {
  background: transparent;
  border: none;
  color: #556;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: color 0.2s;
  display: flex;
  align-items: center;
}

.ai-panel__close:hover { color: #E0F2FE; }

/* 消息区域 */
.ai-panel__messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 217, 255, 0.2) transparent;
}

/* 欢迎区 */
.ai-welcome {
  text-align: center;
  color: #8892A0;
  font-size: 0.85rem;
  line-height: 1.6;
  padding: 20px 8px;
}

.ai-welcome__icon {
  margin-bottom: 12px;
  opacity: 0.8;
}

.ai-welcome p { margin: 4px 0; }

.ai-welcome__hints {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  margin-top: 14px;
}

.ai-hint {
  padding: 5px 12px;
  border-radius: 20px;
  border: 1px solid rgba(0, 217, 255, 0.25);
  background: rgba(0, 217, 255, 0.06);
  color: #00D9FF;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.ai-hint:hover {
  background: rgba(0, 217, 255, 0.15);
  border-color: rgba(0, 217, 255, 0.5);
}

/* 消息气泡 */
.ai-msg {
  display: flex;
}

.ai-msg--user { justify-content: flex-end; }
.ai-msg--assistant { justify-content: flex-start; }

.ai-msg__bubble {
  max-width: 82%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ai-msg--user .ai-msg__bubble {
  align-items: flex-end;
}

.ai-msg__name {
  font-size: 0.7rem;
  color: #556;
  padding-left: 2px;
}

.ai-msg__text {
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 0.85rem;
  line-height: 1.55;
  word-break: break-word;
}

.ai-msg--user .ai-msg__text {
  background: linear-gradient(135deg, rgba(0, 217, 255, 0.2), rgba(168, 85, 247, 0.2));
  border: 1px solid rgba(0, 217, 255, 0.3);
  color: #E0F2FE;
  border-bottom-right-radius: 4px;
}

.ai-msg--assistant .ai-msg__text {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #C8D6E5;
  border-bottom-left-radius: 4px;
}

/* 打字动画 */
.ai-typing {
  display: flex;
  gap: 4px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  border-bottom-left-radius: 4px;
}

.ai-typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00D9FF;
  animation: typing-bounce 1.2s infinite;
}

.ai-typing span:nth-child(2) { animation-delay: 0.2s; }
.ai-typing span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}

/* 输入区 */
.ai-panel__input {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 14px;
  border-top: 1px solid rgba(0, 217, 255, 0.12);
  background: rgba(0, 217, 255, 0.03);
  flex-shrink: 0;
}

.ai-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 217, 255, 0.2);
  border-radius: 12px;
  padding: 9px 13px;
  color: #E0F2FE;
  font-size: 0.85rem;
  resize: none;
  outline: none;
  line-height: 1.5;
  min-height: 38px;
  max-height: 120px;
  transition: border-color 0.2s;
  font-family: inherit;
}

.ai-input:focus {
  border-color: rgba(0, 217, 255, 0.5);
  box-shadow: 0 0 0 3px rgba(0, 217, 255, 0.08);
}

.ai-input::placeholder { color: #445; }

.ai-send {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #00D9FF, #A855F7);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
  box-shadow: 0 2px 12px rgba(0, 217, 255, 0.3);
}

.ai-send:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 217, 255, 0.5);
}

.ai-send:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 动画 */
.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.chat-slide-enter-from,
.chat-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>
