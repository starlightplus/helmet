<template>
  <div class="profile-card">
    <div class="profile-card__tabs">
      <button :class="['tab-btn', activeTab === 'profile' && 'tab-btn--active']" @click="activeTab = 'profile'">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        个人资料
      </button>
      <button :class="['tab-btn', activeTab === 'contacts' && 'tab-btn--active']" @click="activeTab = 'contacts'">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        紧急联系人
      </button>
    </div>

    <!-- Profile Tab -->
    <div v-if="activeTab === 'profile'" class="profile-card__body">
      <div class="profile-card__field">
        <label class="profile-card__label">名称</label>
        <div class="profile-card__input-wrap profile-card__input-wrap--text">
          <input type="text" class="profile-card__input profile-card__input--text"
            :value="profileStore.nickname" @change="onNicknameChange"
            placeholder="未设置" maxlength="20" />
        </div>
      </div>
      <div class="profile-card__field">
        <label class="profile-card__label">年龄</label>
        <div class="profile-card__field-right">
          <div :class="['profile-card__input-wrap', errors.age && 'profile-card__input-wrap--error']">
            <input type="number" class="profile-card__input"
              :value="profileStore.age" @change="onAgeChange"
              placeholder="--" min="1" max="120" step="1" />
            <span class="profile-card__unit">岁</span>
          </div>
          <span v-if="errors.age" class="profile-card__error">{{ errors.age }}</span>
        </div>
      </div>
      <div class="profile-card__field">
        <label class="profile-card__label">身高</label>
        <div class="profile-card__field-right">
          <div :class="['profile-card__input-wrap', errors.height && 'profile-card__input-wrap--error']">
            <input type="number" class="profile-card__input"
              :value="profileStore.height" @change="onHeightChange"
              placeholder="--" min="50" max="250" step="1" />
            <span class="profile-card__unit">cm</span>
          </div>
          <span v-if="errors.height" class="profile-card__error">{{ errors.height }}</span>
        </div>
      </div>
      <div class="profile-card__field">
        <label class="profile-card__label">体重</label>
        <div class="profile-card__field-right">
          <div :class="['profile-card__input-wrap', errors.weight && 'profile-card__input-wrap--error']">
            <input type="number" class="profile-card__input"
              :value="profileStore.weight" @change="onWeightChange"
              placeholder="--" min="20" max="300" step="0.1" />
            <span class="profile-card__unit">kg</span>
          </div>
          <span v-if="errors.weight" class="profile-card__error">{{ errors.weight }}</span>
        </div>
      </div>
    </div>

    <!-- Contacts Tab -->
    <div v-if="activeTab === 'contacts'" class="profile-card__body">
      <form class="contacts-form" @submit.prevent="addContact">
        <input v-model="contactForm.name" type="text" class="contacts-input" placeholder="姓名" maxlength="20" required />
        <input v-model="contactForm.phone" type="tel" class="contacts-input" placeholder="电话" maxlength="20" required />
        <input v-model="contactForm.email" type="email" class="contacts-input" placeholder="邮箱（摔倒告警用）" />
        <select v-model="contactForm.relation" class="contacts-input" required>
          <option value="" disabled>关系</option>
          <option value="父母">父母</option>
          <option value="配偶">配偶</option>
          <option value="子女">子女</option>
          <option value="朋友">朋友</option>
          <option value="同事">同事</option>
          <option value="其他">其他</option>
        </select>
        <label class="contacts-priority">
          <input type="checkbox" v-model="contactForm.priority" />
          <span>设为优先呼叫</span>
        </label>
        <button type="submit" class="contacts-add-btn" :disabled="contactSubmitting">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {{ contactSubmitting ? '添加中...' : '添加' }}
        </button>
      </form>
      <div v-if="contactsLoading" class="contacts-empty">加载中...</div>
      <div v-else-if="contacts.length === 0" class="contacts-empty">暂无紧急联系人</div>
      <div v-else class="contacts-list">
        <div v-for="c in contacts" :key="c.id" class="contact-item" :class="{ 'contact-item--priority': c.priority }">
          <div class="contact-item__info">
            <span class="contact-item__name">
              {{ c.name }}
              <span v-if="c.priority" class="contact-item__badge">优先</span>
            </span>
            <span class="contact-item__meta">{{ c.relation }} · {{ c.phone }}</span>
            <span v-if="c.email" class="contact-item__email">{{ c.email }}</span>
            <span v-else class="contact-item__email contact-item__email--warn">未填写邮箱</span>
          </div>
          <button class="contact-item__del" @click="removeContact(c)" title="删除">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserProfileStore } from '@/stores/userProfile'
import request from '@/utils/request'

const profileStore = useUserProfileStore()
const activeTab = ref('profile')
const errors = reactive({ age: '', height: '', weight: '' })

function onNicknameChange(e) {
  profileStore.setNickname(e.target.value)
}

function onAgeChange(e) {
  const val = e.target.value.trim()
  if (val === '') { errors.age = ''; return }
  const num = parseInt(val, 10)
  if (!Number.isInteger(num) || num < 1 || num > 120) {
    errors.age = '请输入 1-120 之间的整数'
  } else {
    errors.age = ''
    profileStore.setAge(num)
  }
}

function onHeightChange(e) {
  const val = e.target.value.trim()
  if (val === '') { errors.height = ''; return }
  const num = parseInt(val, 10)
  if (!Number.isInteger(num) || num < 50 || num > 250) {
    errors.height = '请输入 50-250 cm'
  } else {
    errors.height = ''
    profileStore.setHeight(num)
  }
}

function onWeightChange(e) {
  const val = e.target.value.trim()
  if (val === '') { errors.weight = ''; return }
  const num = parseFloat(val)
  if (isNaN(num) || num < 20 || num > 300) {
    errors.weight = '请输入 20-300 kg'
  } else {
    errors.weight = ''
    profileStore.setWeight(Math.round(num * 10) / 10)
  }
}

// Emergency contacts
const contacts = ref([])
const contactsLoading = ref(false)
const contactSubmitting = ref(false)
const contactForm = ref({ name: '', phone: '', email: '', relation: '', priority: false })

function getToken() {
  return sessionStorage.getItem('token')
}

async function fetchContacts() {
  contactsLoading.value = true
  try {
    const res = await request.get('/user/contacts', { headers: { Authorization: `Bearer ${getToken()}` } })
    contacts.value = res.data
  } catch (e) {
    console.error('加载联系人失败', e)
  } finally {
    contactsLoading.value = false
  }
}

async function addContact() {
  const { name, phone, relation } = contactForm.value
  if (!name.trim() || !phone.trim() || !relation) return
  contactSubmitting.value = true
  try {
    const res = await request.post('/user/contacts', contactForm.value, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    contacts.value.push(res.data)
    contactForm.value = { name: '', phone: '', email: '', relation: '', priority: false }
  } catch (e) {
    console.error('添加联系人失败', e)
  } finally {
    contactSubmitting.value = false
  }
}

async function removeContact(c) {
  try {
    await request.delete(`/user/contacts/${c.id}`, { headers: { Authorization: `Bearer ${getToken()}` } })
    contacts.value = contacts.value.filter(x => x.id !== c.id)
  } catch (e) {
    console.error('删除联系人失败', e)
  }
}

onMounted(fetchContacts)
</script>

<style scoped>
.profile-card {
  background: #1a2332;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  margin-top: 16px;
}

.profile-card__tabs {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 10px 8px;
  background: transparent;
  border: none;
  color: #8892A0;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn--active {
  color: #FF6B35;
  background: rgba(255, 107, 53, 0.06);
  border-bottom: 2px solid #FF6B35;
}

.tab-btn:hover:not(.tab-btn--active) {
  color: #E8ECF1;
  background: rgba(255, 255, 255, 0.04);
}

.profile-card__body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.profile-card__field {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.profile-card__label {
  font-size: 0.78rem;
  color: #8892A0;
  min-width: 36px;
  padding-top: 8px;
}

.profile-card__field-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.profile-card__input-wrap {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.profile-card__input-wrap--text {
  flex: 1;
}

.profile-card__input-wrap--error {
  border-color: #FF4757;
}

.profile-card__input-wrap:focus-within {
  border-color: #FF6B35;
}

.profile-card__input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #E8ECF1;
  font-size: 0.85rem;
  padding: 7px 10px;
  width: 100%;
}

.profile-card__input--text {
  width: 100%;
}

.profile-card__input::-webkit-inner-spin-button,
.profile-card__input::-webkit-outer-spin-button {
  opacity: 0.4;
}

.profile-card__unit {
  font-size: 0.75rem;
  color: #8892A0;
  padding-right: 10px;
  white-space: nowrap;
}

.profile-card__error {
  font-size: 0.7rem;
  color: #FF4757;
}

/* Contacts Tab */
.contacts-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contacts-input {
  width: 100%;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #E8ECF1;
  font-size: 0.82rem;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.contacts-input:focus {
  border-color: #FF6B35;
}

.contacts-input option {
  background: #1a2332;
  color: #E8ECF1;
}

.contacts-add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #FF6B35, #FF4757);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.contacts-add-btn:hover {
  box-shadow: 0 2px 10px rgba(255, 107, 53, 0.4);
}

.contacts-empty {
  text-align: center;
  color: #8892A0;
  font-size: 0.8rem;
  padding: 16px 0;
}

.contacts-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.contact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.contact-item__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.contact-item__name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #E8ECF1;
}

.contact-item__meta {
  font-size: 0.75rem;
  color: #8892A0;
}

.contact-item__email {
  font-size: 0.72rem;
  color: #6ee7b7;
  word-break: break-all;
}

.contact-item__email--warn {
  color: rgba(255, 107, 53, 0.6);
}

.contact-item--priority {
  border-color: rgba(255, 107, 53, 0.3);
  background: rgba(255, 107, 53, 0.04);
}

.contact-item__badge {
  font-size: 0.62rem;
  padding: 1px 6px;
  border-radius: 8px;
  background: rgba(255, 107, 53, 0.2);
  color: #FF6B35;
  border: 1px solid rgba(255, 107, 53, 0.35);
  vertical-align: middle;
}

.contacts-priority {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: #8892A0;
  cursor: pointer;
  user-select: none;
}

.contacts-priority input[type="checkbox"] {
  accent-color: #FF6B35;
  width: 14px;
  height: 14px;
  cursor: pointer;
}

.contact-item__del {
  background: rgba(255, 71, 87, 0.1);
  border: none;
  color: #FF4757;
  width: 28px;
  height: 28px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}

.contact-item__del:hover {
  background: rgba(255, 71, 87, 0.25);
}
</style>
