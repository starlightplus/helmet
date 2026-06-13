<template>
  <SportBackground />
  <div class="ec-layout">
    <nav class="ec-nav">
      <div class="ec-nav__left">
        <button class="ec-nav__back" @click="goBack">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          返回终端
        </button>
      </div>
      <span class="ec-nav__title">紧急联系人管理</span>
      <div class="ec-nav__right"></div>
    </nav>

    <div class="ec-content">
      <!-- Add Form -->
      <div class="ec-card" data-aos="fade-up">
        <h3 class="ec-card__title">添加联系人</h3>
        <form class="ec-form" @submit.prevent="addContact">
          <div class="ec-form__row">
            <div class="ec-form__field">
              <label class="ec-form__label">姓名</label>
              <input v-model="form.name" type="text" class="ec-form__input" placeholder="请输入姓名" required />
            </div>
            <div class="ec-form__field">
              <label class="ec-form__label">电话</label>
              <input v-model="form.phone" type="tel" class="ec-form__input" placeholder="请输入电话号码" required />
            </div>
            <div class="ec-form__field">
              <label class="ec-form__label">关系</label>
              <select v-model="form.relation" class="ec-form__input" required>
                <option value="" disabled>请选择关系</option>
                <option value="父母">父母</option>
                <option value="配偶">配偶</option>
                <option value="子女">子女</option>
                <option value="朋友">朋友</option>
                <option value="同事">同事</option>
                <option value="其他">其他</option>
              </select>
            </div>
          </div>
          <div class="ec-form__row">
            <div class="ec-form__field ec-form__field--wide">
              <label class="ec-form__label">邮箱（摔倒告警将发送至此）</label>
              <input v-model="form.email" type="email" class="ec-form__input" placeholder="请输入邮箱地址" />
            </div>
            <div class="ec-form__field ec-form__field--center">
              <label class="ec-form__label">优先呼叫</label>
              <button type="button" class="ec-toggle" :class="{ 'ec-toggle--on': form.priority }" @click="form.priority = !form.priority">
                <span class="ec-toggle__knob"></span>
              </button>
            </div>
          </div>
          <button type="submit" class="ec-form__submit" :disabled="submitting">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {{ submitting ? '添加中...' : '添加联系人' }}
          </button>
        </form>
      </div>

      <!-- Contact List -->
      <div class="ec-card" data-aos="fade-up" data-aos-delay="100">
        <h3 class="ec-card__title">联系人列表 ({{ contacts.length }})</h3>
        <div v-if="loading" class="ec-empty">
          <span>加载中...</span>
        </div>
        <div v-else-if="contacts.length === 0" class="ec-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8892A0" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span>暂无紧急联系人</span>
        </div>
        <div v-else class="ec-list">
          <div v-for="contact in contacts" :key="contact.id" class="ec-contact" :class="{ 'ec-contact--priority': contact.priority }">
            <div class="ec-contact__info">
              <div class="ec-contact__name">
                {{ contact.name }}
                <span v-if="contact.priority" class="ec-badge">优先呼叫</span>
              </div>
              <div class="ec-contact__meta">{{ contact.relation }} · {{ contact.phone }}</div>
              <div v-if="contact.email" class="ec-contact__email">{{ contact.email }}</div>
              <div v-else class="ec-contact__email ec-contact__email--warn">未填写邮箱，无法发送告警</div>
            </div>
            <div class="ec-contact__actions">
              <button class="ec-contact__toggle" :class="{ 'ec-contact__toggle--on': contact.priority }"
                @click="togglePriority(contact)" title="设为优先呼叫">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              </button>
              <button class="ec-contact__delete" @click="removeContact(contact)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 告警说明 -->
      <div class="ec-tip" data-aos="fade-up" data-aos-delay="200">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        当头盔检测到摔倒时，系统将自动发送告警邮件至所有标记为「优先呼叫」的联系人邮箱。
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SportBackground from '@/components/shared/SportBackground.vue'
import request from '@/utils/request'

const router = useRouter()
const contacts = ref([])
const loading = ref(true)
const submitting = ref(false)
const form = ref({ name: '', phone: '', relation: '', email: '', priority: false })

onMounted(fetchContacts)

async function fetchContacts() {
  loading.value = true
  try {
    const token = sessionStorage.getItem('token')
    const res = await request.get('/api/user/contacts', { headers: { Authorization: `Bearer ${token}` } })
    contacts.value = res.data
  } catch (e) {
    console.error('加载联系人失败', e)
  } finally {
    loading.value = false
  }
}

async function addContact() {
  if (!form.value.name || !form.value.phone || !form.value.relation) return
  submitting.value = true
  try {
    const token = sessionStorage.getItem('token')
    const res = await request.post('/api/user/contacts', form.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    contacts.value.push(res.data)
    form.value = { name: '', phone: '', relation: '', email: '', priority: false }
  } catch (e) {
    console.error('添加联系人失败', e)
  } finally {
    submitting.value = false
  }
}

async function removeContact(contact) {
  try {
    const token = sessionStorage.getItem('token')
    await request.delete(`/api/user/contacts/${contact.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    contacts.value = contacts.value.filter(c => c.id !== contact.id)
  } catch (e) {
    console.error('删除联系人失败', e)
  }
}

async function togglePriority(contact) {
  const newVal = !contact.priority
  try {
    const token = sessionStorage.getItem('token')
    await request.put(`/api/user/contacts/${contact.id}`, { priority: newVal }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    contact.priority = newVal
  } catch (e) {
    console.error('更新优先状态失败', e)
  }
}

function goBack() {
  router.push('/app')
}
</script>

<style scoped>
.ec-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.ec-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 24px;
  background: rgba(15, 25, 35, 0.95);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.ec-nav__back {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.06);
  color: #E8ECF1;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: background 0.2s ease;
}

.ec-nav__back:hover { background: rgba(255, 255, 255, 0.1); }

.ec-nav__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #E8ECF1;
}

.ec-nav__right { width: 100px; }

.ec-content {
  flex: 1;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 24px;
  box-sizing: border-box;
}

.ec-card {
  background: #1a2332;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.ec-card__title {
  font-size: 1rem;
  font-weight: 600;
  color: #E8ECF1;
  margin: 0 0 16px;
}

.ec-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.ec-form__row:nth-child(2) {
  grid-template-columns: 1fr auto;
  align-items: end;
}

.ec-form__field--wide { grid-column: 1; }

.ec-form__field--center {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.ec-form__label {
  display: block;
  font-size: 0.8rem;
  color: #8892A0;
  margin-bottom: 6px;
}

.ec-form__input {
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #E8ECF1;
  font-size: 0.9rem;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}

.ec-form__input:focus { border-color: #FF6B35; }

.ec-form__input option { background: #1a2332; color: #E8ECF1; }

/* Toggle switch */
.ec-toggle {
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
  padding: 0;
}

.ec-toggle--on { background: #FF6B35; }

.ec-toggle__knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s ease;
}

.ec-toggle--on .ec-toggle__knob { transform: translateX(20px); }

.ec-form__submit {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #FF6B35, #FF4757);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ec-form__submit:hover { box-shadow: 0 4px 16px rgba(255, 107, 53, 0.4); transform: translateY(-1px); }
.ec-form__submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.ec-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px;
  color: #8892A0;
  font-size: 0.95rem;
}

.ec-list { display: flex; flex-direction: column; gap: 8px; }

.ec-contact {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: background 0.2s ease;
}

.ec-contact--priority { border-color: rgba(255, 107, 53, 0.3); background: rgba(255, 107, 53, 0.04); }
.ec-contact:hover { background: rgba(255, 255, 255, 0.06); }

.ec-contact__name {
  font-weight: 600;
  color: #E8ECF1;
  font-size: 0.95rem;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ec-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(255, 107, 53, 0.2);
  color: #FF6B35;
  border: 1px solid rgba(255, 107, 53, 0.4);
}

.ec-contact__meta { font-size: 0.8rem; color: #8892A0; margin-bottom: 2px; }

.ec-contact__email { font-size: 0.78rem; color: #6B8099; }
.ec-contact__email--warn { color: #FF6B35; opacity: 0.7; }

.ec-contact__actions { display: flex; gap: 8px; align-items: center; }

.ec-contact__toggle {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #8892A0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ec-contact__toggle--on {
  background: rgba(255, 107, 53, 0.15);
  border-color: rgba(255, 107, 53, 0.4);
  color: #FF6B35;
}

.ec-contact__toggle:hover { background: rgba(255, 107, 53, 0.2); color: #FF6B35; }

.ec-contact__delete {
  background: rgba(255, 71, 87, 0.1);
  border: none;
  color: #FF4757;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ec-contact__delete:hover { background: rgba(255, 71, 87, 0.25); }

.ec-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 107, 53, 0.06);
  border: 1px solid rgba(255, 107, 53, 0.15);
  border-radius: 10px;
  font-size: 0.82rem;
  color: #8892A0;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .ec-nav { padding: 10px 16px; }
  .ec-content { padding: 16px; }
  .ec-form__row { grid-template-columns: 1fr; }
  .ec-form__row:nth-child(2) { grid-template-columns: 1fr; }
  .ec-nav__right { display: none; }
}
</style>
