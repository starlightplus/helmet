<template>
  <div class="admin-layout">
    <!-- ── 顶部导航 ── -->
    <nav class="admin-nav">
      <div class="admin-nav__left">
        <div class="nav-logo__frame"><span class="nav-logo__omega">Ω</span></div>
        <div class="admin-nav__brand">
          <span class="brand-main">ADMIN TERMINAL</span>
          <span class="brand-sub">智能头盔管理控制台</span>
        </div>
        <div class="admin-nav__badge">ADMIN</div>
      </div>
      <div class="admin-nav__right">
        <span class="admin-nav__user">{{ userStore.username }}</span>
        <button class="admin-nav__btn" @click="onLogout">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          EXIT
        </button>
      </div>
    </nav>

    <!-- ── 主体 ── -->
    <div class="admin-body">

      <!-- 左侧：用户列表 -->
      <aside class="admin-sidebar">
        <div class="sidebar-header">
          <span class="sidebar-title">用户列表</span>
          <span class="sidebar-count">{{ users.length }} 人</span>
        </div>
        <div class="sidebar-search">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="searchQuery" placeholder="搜索用户名..." class="sidebar-search__input" />
        </div>
        <div class="sidebar-list">
          <div v-if="loading" class="sidebar-loading">加载中...</div>
          <div
            v-for="u in filteredUsers" :key="u.id"
            class="sidebar-item"
            :class="{ 'sidebar-item--active': selectedUser?.id === u.id, 'sidebar-item--admin': u.role === 'admin' }"
            @click="selectUser(u)"
          >
            <div class="sidebar-item__avatar">{{ (u.username || '?')[0].toUpperCase() }}</div>
            <div class="sidebar-item__info">
              <div class="sidebar-item__name">{{ u.username }}</div>
              <div class="sidebar-item__meta">
                <span class="role-badge" :class="'role-badge--' + u.role">{{ u.role }}</span>
                <span v-if="u.deviceId" class="device-tag">{{ u.deviceId }}</span>
              </div>
            </div>
          </div>
          <div v-if="!loading && filteredUsers.length === 0" class="sidebar-empty">无匹配用户</div>
        </div>
      </aside>

      <!-- 右侧：用户详情 -->
      <main class="admin-main">
        <!-- 未选中状态 -->
        <div v-if="!selectedUser" class="main-empty">
          <div class="main-empty__icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <p class="main-empty__text">从左侧选择一个用户查看详情</p>
        </div>

        <!-- 用户详情面板 -->
        <div v-else class="user-panel">
          <!-- 面板头部 -->
          <div class="user-panel__header">
            <div class="user-panel__avatar">{{ (detail.username || '?')[0].toUpperCase() }}</div>
            <div class="user-panel__title">
              <h2 class="user-panel__name">{{ detail.nickname || detail.username }}</h2>
              <div class="user-panel__sub">
                <span class="role-badge" :class="'role-badge--' + detail.role">{{ detail.role }}</span>
                <span class="user-panel__id">ID: {{ detail.id }}</span>
                <span class="user-panel__since">注册于 {{ formatDate(detail.createdAt) }}</span>
              </div>
            </div>
            <div class="user-panel__actions">
              <button v-if="!editing" class="action-btn action-btn--primary" @click="startEdit">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                编辑
              </button>
              <template v-else>
                <button class="action-btn action-btn--success" :disabled="saving" @click="saveEdit">
                  {{ saving ? '保存中...' : '保存' }}
                </button>
                <button class="action-btn action-btn--ghost" @click="cancelEdit">取消</button>
              </template>
              <button class="action-btn action-btn--warn" @click="showResetPwd = true">重置密码</button>
              <button v-if="detail.role !== 'admin'" class="action-btn action-btn--danger" @click="confirmDelete">删除用户</button>
            </div>
          </div>

          <!-- 信息区 -->
          <div class="user-panel__body">

            <!-- 账号信息 -->
            <section class="info-section">
              <div class="info-section__title">账号信息</div>
              <div class="info-grid">
                <div class="info-item">
                  <label>用户名</label>
                  <span>{{ detail.username }}</span>
                </div>
                <div class="info-item">
                  <label>角色</label>
                  <select v-if="editing" v-model="form.role" class="info-input info-input--select">
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                  <span v-else class="role-badge" :class="'role-badge--' + detail.role">{{ detail.role }}</span>
                </div>
                <div class="info-item">
                  <label>设备 ID</label>
                  <input v-if="editing" v-model="form.deviceId" class="info-input" placeholder="未绑定" />
                  <span v-else>{{ detail.deviceId || '—' }}</span>
                </div>
                <div class="info-item">
                  <label>GitHub</label>
                  <span>{{ detail.githubId || '未绑定' }}</span>
                </div>
              </div>
            </section>

            <!-- 个人资料 -->
            <section class="info-section">
              <div class="info-section__title">个人资料</div>
              <div class="info-grid">
                <div class="info-item">
                  <label>昵称</label>
                  <input v-if="editing" v-model="form.nickname" class="info-input" placeholder="未设置" />
                  <span v-else>{{ detail.nickname || '—' }}</span>
                </div>
                <div class="info-item">
                  <label>性别</label>
                  <select v-if="editing" v-model="form.gender" class="info-input info-input--select">
                    <option value="">未设置</option>
                    <option value="男">男</option>
                    <option value="女">女</option>
                    <option value="其他">其他</option>
                    <option value="选择保密">选择保密</option>
                  </select>
                  <span v-else>{{ detail.gender || '—' }}</span>
                </div>
                <div class="info-item">
                  <label>年龄</label>
                  <input v-if="editing" v-model.number="form.age" type="number" class="info-input" placeholder="—" />
                  <span v-else>{{ detail.age != null ? detail.age + ' 岁' : '—' }}</span>
                </div>
                <div class="info-item">
                  <label>身高</label>
                  <input v-if="editing" v-model.number="form.height" type="number" class="info-input" placeholder="—" />
                  <span v-else>{{ detail.height != null ? detail.height + ' cm' : '—' }}</span>
                </div>
                <div class="info-item">
                  <label>体重</label>
                  <input v-if="editing" v-model.number="form.weight" type="number" step="0.1" class="info-input" placeholder="—" />
                  <span v-else>{{ detail.weight != null ? detail.weight + ' ' + (detail.weightUnit || 'kg') : '—' }}</span>
                </div>
                <div class="info-item">
                  <label>血型</label>
                  <select v-if="editing" v-model="form.bloodType" class="info-input info-input--select">
                    <option value="">未设置</option>
                    <option v-for="bt in bloodTypes" :key="bt" :value="bt">{{ bt }}</option>
                  </select>
                  <span v-else>{{ detail.bloodType || '—' }}</span>
                </div>
                <div class="info-item info-item--full">
                  <label>个人简介</label>
                  <textarea v-if="editing" v-model="form.bio" class="info-input info-input--textarea" placeholder="—" rows="2"></textarea>
                  <span v-else>{{ detail.bio || '—' }}</span>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>

    <!-- ── 重置密码弹窗 ── -->
    <div v-if="showResetPwd" class="modal-overlay" @click.self="showResetPwd = false">
      <div class="modal">
        <div class="modal__title">重置密码</div>
        <p class="modal__desc">为用户 <strong>{{ detail?.username }}</strong> 设置新密码</p>
        <input v-model="newPassword" type="password" class="modal__input" placeholder="新密码（至少6位）" />
        <div class="modal__actions">
          <button class="action-btn action-btn--success" :disabled="saving" @click="doResetPassword">
            {{ saving ? '处理中...' : '确认重置' }}
          </button>
          <button class="action-btn action-btn--ghost" @click="showResetPwd = false">取消</button>
        </div>
        <p v-if="pwdError" class="modal__error">{{ pwdError }}</p>
      </div>
    </div>

    <!-- ── 删除确认弹窗 ── -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
      <div class="modal modal--danger">
        <div class="modal__title">确认删除</div>
        <p class="modal__desc">即将删除用户 <strong>{{ detail?.username }}</strong>，此操作不可撤销。</p>
        <div class="modal__actions">
          <button class="action-btn action-btn--danger" :disabled="saving" @click="doDelete">
            {{ saving ? '删除中...' : '确认删除' }}
          </button>
          <button class="action-btn action-btn--ghost" @click="showDeleteConfirm = false">取消</button>
        </div>
      </div>
    </div>

    <!-- ── Toast ── -->
    <div v-if="toast" class="toast" :class="'toast--' + toast.type">{{ toast.msg }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import request from '@/utils/request'

const router    = useRouter()
const userStore = useUserStore()

const users        = ref([])
const loading      = ref(false)
const searchQuery  = ref('')
const selectedUser = ref(null)
const detail       = ref({})
const editing      = ref(false)
const saving       = ref(false)
const form         = ref({})
const showResetPwd      = ref(false)
const showDeleteConfirm = ref(false)
const newPassword  = ref('')
const pwdError     = ref('')
const toast        = ref(null)

const bloodTypes = ['A', 'B', 'AB', 'O', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const filteredUsers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return users.value
  return users.value.filter(u => u.username.toLowerCase().includes(q))
})

onMounted(() => loadUsers())

async function loadUsers() {
  loading.value = true
  try {
    const res = await request.get('/api/auth/admin/users')
    users.value = res.data
  } catch {
    showToast('加载用户列表失败', 'error')
  } finally {
    loading.value = false
  }
}

async function selectUser(u) {
  selectedUser.value = u
  editing.value = false
  try {
    const res = await request.get(`/api/auth/admin/users/${u.id}/profile`)
    detail.value = res.data
  } catch {
    detail.value = { ...u }
    showToast('加载用户详情失败', 'error')
  }
}

function startEdit() {
  form.value = {
    role:      detail.value.role      || 'user',
    deviceId:  detail.value.deviceId  || '',
    nickname:  detail.value.nickname  || '',
    gender:    detail.value.gender    || '',
    age:       detail.value.age       ?? null,
    height:    detail.value.height    ?? null,
    weight:    detail.value.weight    ?? null,
    bloodType: detail.value.bloodType || '',
    bio:       detail.value.bio       || '',
    weightUnit:detail.value.weightUnit|| 'kg',
  }
  editing.value = true
}

function cancelEdit() { editing.value = false }

async function saveEdit() {
  saving.value = true
  try {
    await request.put(`/api/auth/admin/users/${selectedUser.value.id}/profile`, form.value)
    const res = await request.get(`/api/auth/admin/users/${selectedUser.value.id}/profile`)
    detail.value = res.data
    const idx = users.value.findIndex(u => u.id === selectedUser.value.id)
    if (idx !== -1) {
      users.value[idx].role     = detail.value.role
      users.value[idx].deviceId = detail.value.deviceId
    }
    editing.value = false
    showToast('保存成功', 'success')
  } catch {
    showToast('保存失败', 'error')
  } finally {
    saving.value = false
  }
}

async function doResetPassword() {
  pwdError.value = ''
  if (!newPassword.value || newPassword.value.length < 6) { pwdError.value = '密码至少6位'; return }
  saving.value = true
  try {
    await request.put(`/api/auth/admin/users/${selectedUser.value.id}/password`, { password: newPassword.value })
    showResetPwd.value = false
    newPassword.value  = ''
    showToast('密码重置成功', 'success')
  } catch {
    pwdError.value = '重置失败，请重试'
  } finally {
    saving.value = false
  }
}

function confirmDelete() { showDeleteConfirm.value = true }

async function doDelete() {
  saving.value = true
  try {
    await request.delete(`/api/auth/admin/users/${selectedUser.value.id}`)
    users.value = users.value.filter(u => u.id !== selectedUser.value.id)
    selectedUser.value = null
    detail.value = {}
    showDeleteConfirm.value = false
    showToast('用户已删除', 'success')
  } catch (e) {
    showToast(e?.response?.data || '删除失败', 'error')
    showDeleteConfirm.value = false
  } finally {
    saving.value = false
  }
}

function formatDate(dt) { return dt ? String(dt).slice(0, 10) : '—' }

function showToast(msg, type = 'success') {
  toast.value = { msg, type }
  setTimeout(() => { toast.value = null }, 2500)
}

function onLogout() {
  userStore.logout()
  router.push('/auth')
}
</script>

<style scoped>
/* ── 布局 ─────────────────────────────────────────────────────── */
.admin-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #020817;
  color: #e2e8f0;
  font-family: "Inter", system-ui, sans-serif;
  overflow: hidden;
}

/* ── 顶部导航 ──────────────────────────────────────────────────── */
.admin-nav {
  height: 56px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: rgba(2, 8, 23, 0.95);
  border-bottom: 1px solid rgba(56, 189, 248, 0.2);
  backdrop-filter: blur(12px);
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%);
}
.admin-nav__left { display: flex; align-items: center; gap: 12px; }
.nav-logo__frame {
  width: 32px; height: 32px;
  border: 1.5px solid #38bdf8;
  transform: rotate(45deg);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 8px rgba(56,189,248,0.4);
  flex-shrink: 0;
}
.nav-logo__omega {
  transform: rotate(-45deg);
  font-size: 14px; font-weight: 700;
  color: #38bdf8;
  text-shadow: 0 0 8px rgba(56,189,248,0.8);
}
.admin-nav__brand { display: flex; flex-direction: column; gap: 1px; }
.brand-main { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.12em; color: #fff; text-transform: uppercase; }
.brand-sub  { font-size: 0.6rem; color: rgba(56,189,248,0.5); letter-spacing: 0.06em; }
.admin-nav__badge {
  padding: 2px 8px;
  border: 1px solid rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  font-size: 0.6rem; font-weight: 700; letter-spacing: 0.12em;
  clip-path: polygon(4px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 4px);
}
.admin-nav__right { display: flex; align-items: center; gap: 12px; }
.admin-nav__user { font-size: 0.72rem; color: rgba(56,189,248,0.7); font-family: monospace; }
.admin-nav__btn {
  display: flex; align-items: center; gap: 5px;
  padding: 5px 12px;
  border: 1px solid rgba(239,68,68,0.2);
  background: rgba(239,68,68,0.04);
  color: rgba(239,68,68,0.7);
  font-size: 0.65rem; font-weight: 600; letter-spacing: 0.08em;
  cursor: pointer;
  clip-path: polygon(6px 0%,100% 0%,100% calc(100% - 6px),calc(100% - 6px) 100%,0% 100%,0% 6px);
  transition: all 0.15s;
}
.admin-nav__btn:hover { background: rgba(239,68,68,0.1); color: #ef4444; }

/* ── 主体布局 ──────────────────────────────────────────────────── */
.admin-body {
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
}

/* ── 左侧侧边栏 ────────────────────────────────────────────────── */
.admin-sidebar {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(56,189,248,0.1);
  background: rgba(2,8,23,0.6);
}
.sidebar-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px 10px;
  border-bottom: 1px solid rgba(56,189,248,0.08);
}
.sidebar-title { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; color: rgba(56,189,248,0.8); text-transform: uppercase; }
.sidebar-count { font-size: 0.65rem; color: rgba(255,255,255,0.3); font-family: monospace; }
.sidebar-search {
  display: flex; align-items: center; gap: 8px;
  margin: 8px 12px;
  padding: 6px 10px;
  border: 1px solid rgba(56,189,248,0.12);
  background: rgba(56,189,248,0.03);
  color: rgba(255,255,255,0.4);
}
.sidebar-search svg { flex-shrink: 0; opacity: 0.5; }
.sidebar-search__input {
  flex: 1; background: transparent; border: none; outline: none;
  color: #e2e8f0; font-size: 0.75rem;
}
.sidebar-search__input::placeholder { color: rgba(255,255,255,0.25); }
.sidebar-list { flex: 1; overflow-y: auto; padding: 4px 0; }
.sidebar-loading, .sidebar-empty {
  padding: 24px 16px; text-align: center;
  font-size: 0.72rem; color: rgba(255,255,255,0.25);
}
.sidebar-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  border-left: 2px solid transparent;
  transition: all 0.15s;
}
.sidebar-item:hover { background: rgba(56,189,248,0.04); }
.sidebar-item--active { background: rgba(56,189,248,0.07); border-left-color: #38bdf8; }
.sidebar-item--admin .sidebar-item__avatar { border-color: #ef4444; color: #ef4444; }
.sidebar-item__avatar {
  width: 32px; height: 32px; flex-shrink: 0;
  border: 1.5px solid rgba(56,189,248,0.3);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700;
  color: #38bdf8;
  background: rgba(56,189,248,0.05);
}
.sidebar-item__info { min-width: 0; }
.sidebar-item__name { font-size: 0.78rem; font-weight: 600; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sidebar-item__meta { display: flex; align-items: center; gap: 6px; margin-top: 2px; }

/* ── 角色/设备标签 ─────────────────────────────────────────────── */
.role-badge {
  display: inline-block;
  padding: 1px 6px;
  font-size: 0.58rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
  clip-path: polygon(3px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 3px);
}
.role-badge--user  { background: rgba(56,189,248,0.12); color: #38bdf8; border: 1px solid rgba(56,189,248,0.25); }
.role-badge--admin { background: rgba(239,68,68,0.12);  color: #ef4444; border: 1px solid rgba(239,68,68,0.3); }
.device-tag {
  font-size: 0.58rem; color: rgba(255,255,255,0.3);
  font-family: monospace;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80px;
}

/* ── 右侧主区域 ────────────────────────────────────────────────── */
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 24px 32px;
}
.main-empty {
  flex: 1;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 16px; opacity: 0.3;
}
.main-empty__icon { color: rgba(56,189,248,0.5); }
.main-empty__text { font-size: 0.85rem; color: rgba(255,255,255,0.4); }

/* ── 用户详情面板 ──────────────────────────────────────────────── */
.user-panel { display: flex; flex-direction: column; gap: 20px; max-width: 860px; }
.user-panel__header {
  display: flex; align-items: center; gap: 16px;
  padding: 16px 20px;
  background: rgba(56,189,248,0.03);
  border: 1px solid rgba(56,189,248,0.1);
}
.user-panel__avatar {
  width: 52px; height: 52px; flex-shrink: 0;
  border: 2px solid rgba(56,189,248,0.3);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; font-weight: 700; color: #38bdf8;
  background: rgba(56,189,248,0.06);
}
.user-panel__title { flex: 1; min-width: 0; }
.user-panel__name { margin: 0 0 4px; font-size: 1rem; font-weight: 700; color: #fff; }
.user-panel__sub { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.user-panel__id, .user-panel__since { font-size: 0.65rem; color: rgba(255,255,255,0.3); font-family: monospace; }
.user-panel__actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

/* ── 操作按钮 ──────────────────────────────────────────────────── */
.action-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 14px;
  border: 1px solid; font-size: 0.7rem; font-weight: 600; cursor: pointer;
  clip-path: polygon(5px 0%,100% 0%,100% calc(100% - 5px),calc(100% - 5px) 100%,0 100%,0 5px);
  transition: all 0.15s;
}
.action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.action-btn--primary { border-color: rgba(56,189,248,0.3); background: rgba(56,189,248,0.06); color: #38bdf8; }
.action-btn--primary:hover:not(:disabled) { background: rgba(56,189,248,0.14); }
.action-btn--success { border-color: rgba(74,222,128,0.3); background: rgba(74,222,128,0.06); color: #4ade80; }
.action-btn--success:hover:not(:disabled) { background: rgba(74,222,128,0.14); }
.action-btn--warn    { border-color: rgba(250,204,21,0.3);  background: rgba(250,204,21,0.06);  color: #facc15; }
.action-btn--warn:hover:not(:disabled) { background: rgba(250,204,21,0.14); }
.action-btn--danger  { border-color: rgba(239,68,68,0.3);   background: rgba(239,68,68,0.06);   color: #ef4444; }
.action-btn--danger:hover:not(:disabled) { background: rgba(239,68,68,0.14); }
.action-btn--ghost   { border-color: rgba(255,255,255,0.12); background: transparent; color: rgba(255,255,255,0.4); }
.action-btn--ghost:hover { color: rgba(255,255,255,0.7); }

/* ── 信息分区 ──────────────────────────────────────────────────── */
.user-panel__body { display: flex; flex-direction: column; gap: 16px; }
.info-section {
  border: 1px solid rgba(56,189,248,0.1);
  background: rgba(2,8,23,0.4);
}
.info-section__title {
  padding: 8px 16px;
  font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
  color: rgba(56,189,248,0.6);
  border-bottom: 1px solid rgba(56,189,248,0.08);
  background: rgba(56,189,248,0.02);
}
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0;
}
.info-item {
  padding: 12px 16px;
  border-right: 1px solid rgba(56,189,248,0.06);
  border-bottom: 1px solid rgba(56,189,248,0.06);
  display: flex; flex-direction: column; gap: 4px;
}
.info-item--full { grid-column: 1 / -1; }
.info-item label { font-size: 0.6rem; color: rgba(255,255,255,0.3); letter-spacing: 0.06em; text-transform: uppercase; }
.info-item span  { font-size: 0.8rem; color: #e2e8f0; }
.info-input {
  background: rgba(56,189,248,0.04);
  border: 1px solid rgba(56,189,248,0.2);
  color: #e2e8f0;
  font-size: 0.78rem;
  padding: 4px 8px;
  outline: none;
  width: 100%; box-sizing: border-box;
}
.info-input:focus { border-color: rgba(56,189,248,0.5); }
.info-input--select { cursor: pointer; }
.info-input--textarea { resize: vertical; min-height: 52px; font-family: inherit; }

/* ── 弹窗 ──────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.modal {
  background: #0d1a2d;
  border: 1px solid rgba(56,189,248,0.2);
  padding: 28px 32px;
  min-width: 340px;
  display: flex; flex-direction: column; gap: 14px;
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%);
}
.modal--danger { border-color: rgba(239,68,68,0.25); }
.modal__title { font-size: 0.9rem; font-weight: 700; color: #fff; }
.modal__desc  { font-size: 0.8rem; color: rgba(255,255,255,0.5); margin: 0; }
.modal__desc strong { color: #38bdf8; }
.modal--danger .modal__desc strong { color: #ef4444; }
.modal__input {
  background: rgba(56,189,248,0.04);
  border: 1px solid rgba(56,189,248,0.2);
  color: #e2e8f0; font-size: 0.82rem;
  padding: 8px 12px; outline: none;
}
.modal__input:focus { border-color: rgba(56,189,248,0.5); }
.modal__actions { display: flex; gap: 10px; }
.modal__error   { font-size: 0.72rem; color: #ef4444; margin: 0; }

/* ── Toast ─────────────────────────────────────────────────────── */
.toast {
  position: fixed; bottom: 28px; right: 28px;
  padding: 10px 20px;
  font-size: 0.78rem; font-weight: 600;
  clip-path: polygon(6px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 6px);
  z-index: 2000;
  animation: toast-in 0.2s ease;
}
.toast--success { background: rgba(74,222,128,0.15); border: 1px solid rgba(74,222,128,0.3); color: #4ade80; }
.toast--error   { background: rgba(239,68,68,0.15);  border: 1px solid rgba(239,68,68,0.3);  color: #ef4444; }
@keyframes toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

/* ── 滚动条 ─────────────────────────────────────────────────────── */
.sidebar-list::-webkit-scrollbar,
.admin-main::-webkit-scrollbar { width: 4px; }
.sidebar-list::-webkit-scrollbar-track,
.admin-main::-webkit-scrollbar-track { background: transparent; }
.sidebar-list::-webkit-scrollbar-thumb,
.admin-main::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.15); border-radius: 2px; }
</style>
