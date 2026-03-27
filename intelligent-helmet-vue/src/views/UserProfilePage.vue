<template>
  <SportBackground />
  <div class="up-layout">
    <nav class="up-nav">
      <div class="up-nav__left">
        <button class="up-nav__back" @click="goBack">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          返回终端
        </button>
      </div>
      <span class="up-nav__title">个人资料</span>
      <div class="up-nav__right"></div>
    </nav>

    <div class="up-content">
      <!-- Profile Section -->
      <div class="up-card">
        <h3 class="up-section-title">个人资料</h3>
        <div class="up-field">
          <label class="up-label">名称</label>
          <input type="text" class="up-input" :value="profileStore.nickname"
            @change="onNicknameChange" placeholder="未设置" maxlength="20" />
        </div>
        <div class="up-field">
          <label class="up-label">年龄</label>
          <div class="up-field-right">
            <div :class="['up-input-wrap', errors.age && 'up-input-wrap--error']">
              <input type="number" class="up-input up-input--num"
                :value="profileStore.age" @change="onAgeChange"
                placeholder="--" min="1" max="120" step="1" />
              <span class="up-unit">岁</span>
            </div>
            <span v-if="errors.age" class="up-error">{{ errors.age }}</span>
          </div>
        </div>
        <div class="up-field">
          <label class="up-label">身高</label>
          <div class="up-field-right">
            <div :class="['up-input-wrap', errors.height && 'up-input-wrap--error']">
              <input type="number" class="up-input up-input--num"
                :value="profileStore.height" @change="onHeightChange"
                placeholder="--" min="50" max="250" step="1" />
              <span class="up-unit">cm</span>
            </div>
            <span v-if="errors.height" class="up-error">{{ errors.height }}</span>
          </div>
        </div>
        <div class="up-field">
          <label class="up-label">体重</label>
          <div class="up-field-right">
            <div :class="['up-input-wrap', errors.weight && 'up-input-wrap--error']">
              <input type="number" class="up-input up-input--num"
                :value="profileStore.weight" @change="onWeightChange"
                placeholder="--" min="20" max="300" step="0.1" />
              <span class="up-unit">kg</span>
            </div>
            <span v-if="errors.weight" class="up-error">{{ errors.weight }}</span>
          </div>
        </div>
      </div>

      <!-- Contacts Section -->
      <div class="up-card">
        <h3 class="up-section-title">紧急联系人</h3>
        <form class="up-form" @submit.prevent="addContact">
          <div class="up-form__row">
            <div class="up-form__field">
              <label class="up-label">姓名</label>
              <input v-model="contactForm.name" type="text" class="up-input" placeholder="请输入姓名" required />
            </div>
            <div class="up-form__field">
              <label class="up-label">电话</label>
              <input v-model="contactForm.phone" type="tel" class="up-input" placeholder="请输入电话号码" required />
            </div>
            <div class="up-form__field">
              <label class="up-label">关系</label>
              <select v-model="contactForm.relation" class="up-input" required>
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
          <button type="submit" class="up-submit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            添加联系人
          </button>
        </form>
        <div class="up-contacts-header">联系人列表 ({{ contacts.length }})</div>
        <div v-if="contacts.length === 0" class="up-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8892A0" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span>暂无紧急联系人</span>
        </div>
        <div v-else class="up-list">
          <div v-for="(c, i) in contacts" :key="c.id" class="up-contact">
            <div class="up-contact__info">
              <div class="up-contact__name">{{ c.name }}</div>
              <div class="up-contact__meta">{{ c.relation }} · {{ c.phone }}</div>
            </div>
            <button class="up-contact__del" @click="removeContact(i)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import SportBackground from '@/components/SportBackground.vue'
import { useUserProfileStore } from '@/stores/userProfile'

const router = useRouter()
const profileStore = useUserProfileStore()
const errors = reactive({ age: '', height: '', weight: '' })

function goBack() { router.push('/app') }

function onNicknameChange(e) { profileStore.setNickname(e.target.value) }

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

const CONTACTS_KEY = 'emergency_contacts'
const contacts = ref(loadContacts())
const contactForm = ref({ name: '', phone: '', relation: '' })

function loadContacts() {
  try { return JSON.parse(localStorage.getItem(CONTACTS_KEY)) || [] } catch { return [] }
}

function addContact() {
  const { name, phone, relation } = contactForm.value
  if (!name.trim() || !phone.trim() || !relation) return
  contacts.value.push({ id: Date.now(), name: name.trim(), phone: phone.trim(), relation })
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts.value))
  contactForm.value = { name: '', phone: '', relation: '' }
}

function removeContact(index) {
  contacts.value.splice(index, 1)
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts.value))
}
</script>

<style scoped>
.up-layout { min-height: 100vh; display: flex; flex-direction: column; }

.up-nav {
  position: sticky; top: 0; z-index: 100;
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 24px;
  background: rgba(15, 25, 35, 0.95);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.up-nav__back {
  display: flex; align-items: center; gap: 6px;
  background: rgba(255, 255, 255, 0.06); color: #E8ECF1;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 6px 14px; border-radius: 8px; cursor: pointer;
  font-size: 0.8rem; font-weight: 500; transition: background 0.2s;
}
.up-nav__back:hover { background: rgba(255, 255, 255, 0.1); }
.up-nav__title { font-size: 1.1rem; font-weight: 700; color: #E8ECF1; }
.up-nav__right { width: 100px; }

.up-content { flex: 1; max-width: 800px; width: 100%; margin: 0 auto; padding: 24px; box-sizing: border-box; display: flex; flex-direction: column; gap: 20px; }

.up-card {
  background: #1a2332; border-radius: 16px; padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.up-section-title { font-size: 1.1rem; font-weight: 700; color: #E8ECF1; margin: 0 0 20px; }
.up-contacts-header { font-size: 0.95rem; font-weight: 600; color: #E8ECF1; margin: 20px 0 12px; }

.up-field { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
.up-label { font-size: 0.82rem; color: #8892A0; min-width: 40px; padding-top: 10px; }
.up-field-right { flex: 1; display: flex; flex-direction: column; gap: 4px; }

.up-input-wrap {
  display: flex; align-items: center;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px; overflow: hidden; transition: border-color 0.2s;
}
.up-input-wrap:focus-within { border-color: #FF6B35; }
.up-input-wrap--error { border-color: #FF4757; }

.up-input {
  flex: 1; background: transparent; border: none; outline: none;
  color: #E8ECF1; font-size: 0.9rem; padding: 10px 12px; width: 100%;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px; box-sizing: border-box; transition: border-color 0.2s;
}
.up-input:focus { border-color: #FF6B35; outline: none; }
.up-input--num { border: none; background: transparent; padding: 10px 8px; }
.up-input--num:focus { border: none; }
.up-unit { font-size: 0.8rem; color: #8892A0; padding-right: 12px; white-space: nowrap; }
.up-error { font-size: 0.75rem; color: #FF4757; }

.up-input option { background: #1a2332; color: #E8ECF1; }

.up-form__row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 16px; }
.up-form__field { display: flex; flex-direction: column; gap: 6px; }

.up-submit {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 24px; border-radius: 8px; border: none;
  background: linear-gradient(135deg, #FF6B35, #FF4757);
  color: #fff; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.up-submit:hover { box-shadow: 0 4px 16px rgba(255,107,53,0.4); transform: translateY(-1px); }

.up-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px; color: #8892A0; font-size: 0.95rem; }
.up-list { display: flex; flex-direction: column; gap: 8px; }
.up-contact {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 16px; background: rgba(255,255,255,0.03);
  border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); transition: background 0.2s;
}
.up-contact:hover { background: rgba(255,255,255,0.06); }
.up-contact__name { font-weight: 600; color: #E8ECF1; font-size: 0.95rem; margin-bottom: 2px; }
.up-contact__meta { font-size: 0.8rem; color: #8892A0; }
.up-contact__del {
  background: rgba(255,71,87,0.1); border: none; color: #FF4757;
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;
}
.up-contact__del:hover { background: rgba(255,71,87,0.25); }

@media (max-width: 768px) {
  .up-nav { padding: 10px 16px; }
  .up-content { padding: 16px; }
  .up-form__row { grid-template-columns: 1fr; }
  .up-nav__right { display: none; }
}
</style>
