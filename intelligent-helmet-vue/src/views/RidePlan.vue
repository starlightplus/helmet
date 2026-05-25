<template>
  <SportBackground />
  <div class="ride-plan">
    <div class="rp-ambient"></div>
    <div class="rp-container">

      <!-- ── Header ──────────────────────────────────────────────── -->
      <header class="rp-header">
        <div class="rp-header__brand">
          <button class="rp-back-btn" @click="goBack">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="rp-brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </div>
          <div>
            <div class="rp-brand-title">骑行规划 <span class="rp-brand-badge">AI · PLAN</span></div>
            <div class="rp-brand-desc">BASED ON RIDE HISTORY · POWERED BY DEEPSEEK AI</div>
          </div>
        </div>
      </header>

      <!-- ── 主体：左右分栏 ──────────────────────────────────────── -->
      <div class="rp-body">

        <!-- 左栏：目标设定 -->
        <aside class="rp-aside">

          <!-- 当前数据摘要 -->
          <div class="rp-section">
            <div class="rp-section-title">当前状态</div>
            <div class="rp-info-grid">
              <div class="rp-info-item">
                <span class="rp-info-label">体重</span>
                <span class="rp-info-val">{{ profile.weight ? profile.weight + ' kg' : '--' }}</span>
              </div>
              <div class="rp-info-item">
                <span class="rp-info-label">身高</span>
                <span class="rp-info-val">{{ profile.height ? profile.height + ' cm' : '--' }}</span>
              </div>
            </div>
          </div>

          <!-- 历史骑行均值 -->
          <div class="rp-section">
            <div class="rp-section-title">骑行历史均值
              <span class="rp-section-badge">近 {{ historyCount }} 次</span>
            </div>
            <div v-if="historyCount === 0" class="rp-empty-hint">暂无骑行记录，规划将使用默认估算值</div>
            <div v-else class="rp-info-grid">
              <div class="rp-info-item">
                <span class="rp-info-label">平均时长</span>
                <span class="rp-info-val">{{ avgDurationMin }} 分钟</span>
              </div>
              <div class="rp-info-item">
                <span class="rp-info-label">平均消耗</span>
                <span class="rp-info-val rp-info-val--amber">{{ avgCalories }} kcal</span>
              </div>
              <div class="rp-info-item">
                <span class="rp-info-label">平均距离</span>
                <span class="rp-info-val">{{ avgDistance }} km</span>
              </div>
              <div class="rp-info-item">
                <span class="rp-info-label">效率</span>
                <span class="rp-info-val">{{ calPerMin }} kcal/min</span>
              </div>
            </div>
          </div>

          <!-- 目标输入 -->
          <div class="rp-section">
            <div class="rp-section-title">减重目标</div>
            <div class="rp-input-group">
              <label class="rp-label">目标体重（kg）</label>
              <input
                v-model.number="targetWeight"
                type="number"
                min="30" max="200" step="0.5"
                class="rp-input"
                placeholder="输入目标体重"
              />
            </div>
            <div v-if="targetWeight && profile.weight" class="rp-diff-hint"
              :class="weightDiff > 0 ? 'rp-diff-hint--warn' : 'rp-diff-hint--ok'">
              {{ weightDiff > 0
                  ? `需减重 ${weightDiff.toFixed(1)} kg`
                  : weightDiff < 0
                    ? `目标体重高于当前体重 ${Math.abs(weightDiff).toFixed(1)} kg`
                    : '已达到目标体重' }}
            </div>
          </div>

          <button
            class="rp-generate-btn"
            :disabled="!canGenerate || generating"
            @click="generatePlan"
          >
            <svg v-if="!generating" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            <span v-if="generating" class="rp-spinner"></span>
            {{ generating ? 'AI 规划生成中...' : '生成骑行规划' }}
          </button>
        </aside>

        <!-- 右栏：规划结果 -->
        <main class="rp-main">

          <!-- 未生成时的占位 -->
          <div v-if="!plan && !generating" class="rp-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,0.25)" stroke-width="1.2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            <p>填写目标体重后<br>点击「生成骑行规划」</p>
          </div>

          <!-- 生成中骨架屏 -->
          <div v-else-if="generating" class="rp-skeleton">
            <div class="rp-skeleton__bar rp-skeleton__bar--short"></div>
            <div class="rp-skeleton__grid">
              <div class="rp-skeleton__card" v-for="i in 4" :key="i"></div>
            </div>
            <div class="rp-skeleton__bar"></div>
            <div class="rp-skeleton__bar rp-skeleton__bar--long"></div>
            <div class="rp-skeleton__bar"></div>
            <div class="rp-skeleton__bar rp-skeleton__bar--mid"></div>
          </div>

          <!-- 规划结果 -->
          <template v-else-if="plan">
            <!-- 数字摘要卡片 -->
            <div class="rp-summary-grid">
              <div class="rp-sum-card rp-sum-card--purple">
                <div class="rp-sum-card__label">需减重</div>
                <div class="rp-sum-card__val">{{ plan.weightToLose }}</div>
                <div class="rp-sum-card__unit">kg</div>
              </div>
              <div class="rp-sum-card rp-sum-card--cyan">
                <div class="rp-sum-card__label">推荐周期</div>
                <div class="rp-sum-card__val">{{ plan.weeks }}</div>
                <div class="rp-sum-card__unit">周</div>
              </div>
              <div class="rp-sum-card rp-sum-card--amber">
                <div class="rp-sum-card__label">每日骑行</div>
                <div class="rp-sum-card__val">{{ plan.dailyRideMin }}</div>
                <div class="rp-sum-card__unit">分钟</div>
              </div>
              <div class="rp-sum-card rp-sum-card--green">
                <div class="rp-sum-card__label">每日摄入上限</div>
                <div class="rp-sum-card__val">{{ plan.dailyIntake }}</div>
                <div class="rp-sum-card__unit">kcal</div>
              </div>
            </div>

            <!-- 选项卡 + 滚动内容区 -->
            <div class="rp-tab-wrap">
              <!-- 选项卡头 -->
              <div class="rp-tabs">
                <button class="rp-tab" :class="{ 'rp-tab--active': activeTab === 'sport' }" @click="activeTab = 'sport'">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
                  运动计划
                </button>
                <button class="rp-tab" :class="{ 'rp-tab--active': activeTab === 'diet' }" @click="activeTab = 'diet'">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
                  饮食食谱
                </button>
              </div>
              <!-- 滚动内容 -->
              <div class="rp-tab-body">
                <div class="rp-ai-text" v-html="activeTab === 'sport' ? formattedSport : formattedDiet"></div>
              </div>
            </div>

            <!-- 底部操作按钮 -->
            <div class="rp-actions">
              <!-- 采纳成功提示 -->
              <div v-if="acceptMsg" class="rp-accept-msg">{{ acceptMsg }}</div>

              <template v-if="!accepted">
                <button class="rp-action-btn rp-action-btn--accept" :disabled="saving" @click="acceptPlan">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                  {{ saving ? '保存中...' : '采纳规划' }}
                </button>
                <button class="rp-action-btn rp-action-btn--regen" @click="generatePlan">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.1"/></svg>
                  重新生成
                </button>
              </template>

              <template v-else>
                <button class="rp-action-btn rp-action-btn--delete" @click="deletePlan">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  删除规划
                </button>
                <button class="rp-action-btn rp-action-btn--regen" @click="generatePlan">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.1"/></svg>
                  重新生成
                </button>
              </template>
            </div>
          </template>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserProfileStore } from '@/stores/userProfile.js'
import { useRideHistoryStore } from '@/stores/rideHistory.js'
import { useRidePlanStore } from '@/stores/rideplan.js'
import SportBackground from '@/components/SportBackground.vue'

const emit = defineEmits(['back'])

const profileStore = useUserProfileStore()
const historyStore = useRideHistoryStore()
const ridePlanStore = useRidePlanStore()

function goBack() { emit('back') }

// 确保个人资料已从服务器加载（性别等字段依赖服务端数据）
onMounted(async () => {
  if (!profileStore.loaded) await profileStore.loadFromServer()
  // 加载已采纳的规划
  const d = await fetchSavedPlan()
  if (d && d.planSportText) {
    sportText.value    = d.planSportText
    dietText.value     = d.planDietText || ''
    targetWeight.value = d.planTargetWeight || null
    plan.value = {
      weightToLose: d.planTargetWeight && profileStore.weight
        ? (Number(profileStore.weight) - Number(d.planTargetWeight)).toFixed(1) : '--',
      weeks:        d.planWeeks        || '--',
      dailyRideMin: d.planDailyRideMin || '--',
      dailyIntake:  d.planDailyIntake  || '--',
    }
    accepted.value = true
  }
})

// ── 个人资料（直接用 store ref，模板/computed 自动解包）──────────
const profile = computed(() => ({
  weight: profileStore.weight || null,
  height: profileStore.height || null,
  age:    profileStore.age    || null,
  gender: profileStore.gender || null,   // 直接取 ref.value，不再包一层
}))

const genderLabel = computed(() => {
  const g = profileStore.gender  // Pinia setup store 导出的 ref，这里自动解包为字符串
  return g === 'male' ? '男' : g === 'female' ? '女' : '--'
})

// ── 历史骑行均值 ───────────────────────────────────────────────────
const historyCount = computed(() => historyStore.rides.length)

const avgCalories = computed(() => {
  if (historyCount.value === 0) return 200
  const total = historyStore.rides.reduce((s, r) => s + (r.calories || 0), 0)
  return Math.round(total / historyCount.value)
})

const avgDurationMin = computed(() => {
  if (historyCount.value === 0) return 30
  const total = historyStore.rides.reduce((s, r) => s + (r.duration || 0), 0)
  return Math.round(total / historyCount.value / 60)
})

const avgDistance = computed(() => {
  if (historyCount.value === 0) return '--'
  const total = historyStore.rides.reduce((s, r) => s + (r.distance || 0), 0)
  return (total / historyCount.value).toFixed(1)
})

const calPerMin = computed(() => {
  if (avgDurationMin.value <= 0) return '--'
  return (avgCalories.value / avgDurationMin.value).toFixed(1)
})

// ── 目标体重 ───────────────────────────────────────────────────────
const targetWeight = ref(null)

const weightDiff = computed(() => {
  if (!targetWeight.value || !profile.value.weight) return null
  return Number(profile.value.weight) - Number(targetWeight.value)
})

const canGenerate = computed(() =>
  targetWeight.value > 0 &&
  profile.value.weight > 0 &&
  weightDiff.value > 0
)

// ── 本地计算 ───────────────────────────────────────────────────────
function calcPlan() {
  const w      = Number(profile.value.weight)
  const h      = Number(profile.value.height) || 170
  const age    = Number(profile.value.age)    || 25
  const gender = profile.value.gender
  const diff   = weightDiff.value

  const weeks = Math.ceil(diff / 0.75)
  const days  = weeks * 7
  const totalDeficit = diff * 7700
  const dailyDeficit = Math.round(totalDeficit / days)

  const bmr = gender === 'female'
    ? 10 * w + 6.25 * h - 5 * age - 161
    : 10 * w + 6.25 * h - 5 * age + 5

  const tdee = Math.round(bmr * 1.375)
  const dailyIntake = Math.max(1200, tdee - dailyDeficit)

  const effPerMin = avgCalories.value / Math.max(avgDurationMin.value, 1)
  const dailyRideMin = Math.round(dailyDeficit * 0.6 / effPerMin)

  return {
    weightToLose: diff.toFixed(1),
    weeks,
    dailyRideMin: Math.min(dailyRideMin, 120),
    dailyIntake:  Math.round(dailyIntake),
    dailyDeficit,
    tdee,
    bmr: Math.round(bmr),
  }
}

// ── AI 生成 ────────────────────────────────────────────────────────
const generating = ref(false)
const plan       = ref(null)
const sportText  = ref('')
const dietText   = ref('')
const activeTab  = ref('sport')

async function generatePlan() {
  if (!canGenerate.value || generating.value) return
  generating.value = true
  plan.value  = null
  sportText.value = ''
  dietText.value  = ''
  accepted.value  = false

  const nums = calcPlan()
  const prompt = `
我是一名骑行爱好者，请根据以下数据为我制定个性化减重计划：

【个人信息】
- 当前体重：${profile.value.weight} kg，身高：${profile.value.height || '未知'} cm，年龄：${profile.value.age || '未知'} 岁，性别：${profile.value.gender === 'female' ? '女' : '男'}
- 目标体重：${targetWeight.value} kg（需减重 ${nums.weightToLose} kg）

【系统计算结果】
- 基础代谢率（BMR）：${nums.bmr} kcal/天
- 总热量消耗（TDEE）：${nums.tdee} kcal/天
- 推荐周期：${nums.weeks} 周
- 每日热量缺口：${nums.dailyDeficit} kcal
- 每日骑行建议：${nums.dailyRideMin} 分钟
- 每日饮食摄入上限：${nums.dailyIntake} kcal

【历史骑行数据】
- 近 ${historyCount.value} 次骑行平均消耗：${avgCalories.value} kcal/次，平均时长：${avgDurationMin.value} 分钟/次

请严格按以下格式输出，两部分之间用 ===DIET=== 分隔：

第一部分（运动计划）：
按阶段给出骑行强度递进方案（第1-2周/第3-4周/第5周以上），包括每次骑行时长、强度、频率建议，以及3条骑行减重注意事项。

===DIET===

第二部分（饮食食谱）：
分早/午/晚三餐，各给2个具体食谱例子，注明大致热量，最后给出3条饮食注意事项。

回答使用中文，结构清晰，语言简洁。`

  try {
    const token = getToken()
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      },
      body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], deviceId: '', saveHistory: false })
    })
    const data = await res.json()
    const raw = data.content || data.error || 'AI 生成失败，请重试'
    const sep = raw.indexOf('===DIET===')
    if (sep !== -1) {
      sportText.value = raw.slice(0, sep).trim()
      dietText.value  = raw.slice(sep + 10).trim()
    } else {
      sportText.value = raw
      dietText.value  = '（饮食内容未能正确分割，请查看运动计划标签页）'
    }
  } catch {
    sportText.value = '⚠️ 网络错误，请检查后端服务'
    dietText.value  = ''
  }

  plan.value = calcPlan()
  activeTab.value = 'sport'
  generating.value = false
}

// ── 采纳规划 → 保存到数据库 ───────────────────────────────────────
const accepted    = ref(false)
const acceptMsg   = ref('')
const saving      = ref(false)

function getToken() { return sessionStorage.getItem('token') || '' }

async function fetchSavedPlan() {
  const token = getToken()
  if (!token) return null
  try {
    const res = await fetch('/api/user/profile', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
    return res.ok ? await res.json() : null
  } catch { return null }
}

async function acceptPlan() {
  if (!plan.value || saving.value) return
  saving.value = true
  const token = getToken()
  try {
    await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({
        planDailyRideMin: plan.value.dailyRideMin,
        planDailyIntake:  plan.value.dailyIntake,
        planTargetWeight: Number(targetWeight.value),
        planWeeks:        plan.value.weeks,
        planSportText:    sportText.value,
        planDietText:     dietText.value,
      })
    })
    accepted.value = true
    acceptMsg.value = '✓ 已设为每日目标'
    await ridePlanStore.fetchPlan()
    setTimeout(() => { acceptMsg.value = '' }, 3000)
  } catch {
    acceptMsg.value = '保存失败，请重试'
  }
  saving.value = false
}

async function deletePlan() {
  const token = getToken()
  try {
    await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ clearPlan: true })
    })
  } catch {}
  plan.value     = null
  sportText.value = ''
  dietText.value  = ''
  accepted.value  = false
  targetWeight.value = null
}

// ── markdown 简单渲染 ──────────────────────────────────────────────
function formatMd(text) {
  if (!text) return ''

  // 1. 转义 HTML
  let t = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // 2. 逐行处理
  const lines = t.split('\n')
  const out = []
  let inList = false

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]

    // 空行：仅在 inList 时关闭列表，其余忽略（不输出 <br>）
    if (line.trim() === '') {
      if (inList) { out.push('</ul>'); inList = false }
      continue
    }

    // 标题行：# / ## / ###
    const headM = line.match(/^#{1,3} (.+)$/)
    if (headM) {
      if (inList) { out.push('</ul>'); inList = false }
      out.push(`<h4>${headM[1].replace(/\*\*([^*]{1,80})\*\*/g, '<strong>$1</strong>')}</h4>`)
      continue
    }

    // 注意事项行：以「注意」「⚠」「！」开头，或以「1.」「2.」… 开头且含「注意/禁止/避免/建议」
    const isTip = /^(⚠|！|注意[：:]|【注意)/.test(line.trim()) ||
                  /^\d+[.、]/.test(line.trim()) && /注意|禁止|避免|建议|切记/.test(line)

    // 无序列表行：- / *
    const listM = line.match(/^[-*] (.+)$/)
    if (listM) {
      const content = fmtInline(listM[1])
      if (isTip || /注意|禁止|避免|建议|切记/.test(listM[1])) {
        if (inList) { out.push('</ul>'); inList = false }
        out.push(`<div class="rp-tip">${content}</div>`)
      } else {
        if (!inList) { out.push('<ul>'); inList = true }
        out.push(`<li>${content}</li>`)
      }
      continue
    }

    // 有序列表 / 注意事项（1. 2. 3.）
    const ordM = line.match(/^(\d+)[.、] (.+)$/)
    if (ordM) {
      if (inList) { out.push('</ul>'); inList = false }
      const content = fmtInline(ordM[2])
      if (isTip) {
        out.push(`<div class="rp-tip"><span class="rp-tip__num">${ordM[1]}</span>${content}</div>`)
      } else {
        out.push(`<div class="rp-ordered"><span class="rp-ordered__num">${ordM[1]}.</span>${content}</div>`)
      }
      continue
    }

    // 普通文本行
    if (inList) { out.push('</ul>'); inList = false }
    out.push(`<p>${fmtInline(line)}</p>`)
  }

  if (inList) out.push('</ul>')
  return out.join('')
}

function fmtInline(s) {
  return s.replace(/\*\*([^*\n]{1,80})\*\*/g, '<strong>$1</strong>')
}

const formattedSport = computed(() => formatMd(sportText.value))
const formattedDiet  = computed(() => formatMd(dietText.value))
</script>

<style scoped>
/* ── 页面骨架 ─────────────────────────────────────────────────── */
.ride-plan {
  min-height: 100vh;
  background: #050505;
  color: #e2e8f0;
  font-family: "Inter", system-ui, sans-serif;
  position: relative;
  overflow-x: hidden;
}
.rp-ambient {
  position: fixed;
  top: -200px; left: 50%;
  transform: translateX(-50%);
  width: 700px; height: 400px;
  background: radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}
.rp-container {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 32px 48px;
  box-sizing: border-box;
}

/* ── Header ──────────────────────────────────────────────────── */
.rp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(139,92,246,0.15);
}
.rp-header__brand {
  display: flex;
  align-items: center;
  gap: 14px;
}
.rp-back-btn {
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(139,92,246,0.06);
  border: 1px solid rgba(139,92,246,0.20);
  color: rgba(167,139,250,0.8);
  cursor: pointer;
  clip-path: polygon(4px 0%,100% 0%,100% calc(100% - 4px),calc(100% - 4px) 100%,0% 100%,0% 4px);
  transition: all 0.15s;
  flex-shrink: 0;
}
.rp-back-btn:hover { background: rgba(139,92,246,0.14); color: #a78bfa; }
.rp-brand-icon {
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(139,92,246,0.08);
  border: 1px solid rgba(139,92,246,0.25);
  color: #a78bfa;
  clip-path: polygon(6px 0%,100% 0%,100% calc(100% - 6px),calc(100% - 6px) 100%,0% 100%,0% 6px);
  flex-shrink: 0;
}
.rp-brand-title {
  font-family: var(--font-mono, monospace);
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.06em;
  display: flex;
  align-items: center;
  gap: 8px;
}
.rp-brand-badge {
  font-size: 0.58rem;
  padding: 2px 7px;
  background: rgba(139,92,246,0.15);
  border: 1px solid rgba(139,92,246,0.30);
  color: #a78bfa;
  letter-spacing: 0.1em;
  clip-path: polygon(3px 0%,100% 0%,100% calc(100% - 3px),calc(100% - 3px) 100%,0% 100%,0% 3px);
}
.rp-brand-desc {
  font-family: var(--font-mono, monospace);
  font-size: 0.58rem;
  color: rgba(139,92,246,0.40);
  letter-spacing: 0.08em;
  margin-top: 3px;
}

/* ── 主体分栏 ─────────────────────────────────────────────────── */
.rp-body {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  align-items: start;
}

/* ── 左栏 ─────────────────────────────────────────────────────── */
.rp-aside {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.rp-section {
  background: #111518;
  border: 1px solid rgba(139,92,246,0.12);
  padding: 16px;
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);
}
.rp-section-title {
  font-family: var(--font-mono, monospace);
  font-size: 0.65rem;
  font-weight: 700;
  color: rgba(167,139,250,0.7);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.rp-section-badge {
  font-size: 0.58rem;
  padding: 1px 6px;
  background: rgba(139,92,246,0.10);
  border: 1px solid rgba(139,92,246,0.20);
  color: rgba(167,139,250,0.6);
  border-radius: 2px;
  font-weight: 400;
}
.rp-empty-hint {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.25);
  font-style: italic;
}
.rp-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.rp-info-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px 10px;
  background: rgba(139,92,246,0.04);
  border: 1px solid rgba(139,92,246,0.08);
}
.rp-info-label {
  font-family: var(--font-mono, monospace);
  font-size: 0.58rem;
  color: rgba(255,255,255,0.25);
  letter-spacing: 0.06em;
}
.rp-info-val {
  font-family: var(--font-mono, monospace);
  font-size: 0.85rem;
  font-weight: 700;
  color: rgba(255,255,255,0.80);
}
.rp-info-val--amber { color: #FFAA00; }

.rp-input-group { display: flex; flex-direction: column; gap: 6px; }
.rp-label {
  font-family: var(--font-mono, monospace);
  font-size: 0.62rem;
  color: rgba(255,255,255,0.35);
  letter-spacing: 0.06em;
}
.rp-input {
  background: rgba(139,92,246,0.05);
  border: 1px solid rgba(139,92,246,0.20);
  color: #fff;
  font-family: var(--font-mono, monospace);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 8px 12px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.15s;
}
.rp-input:focus { border-color: rgba(139,92,246,0.55); }
.rp-input::placeholder { color: rgba(255,255,255,0.15); }
.rp-diff-hint {
  font-family: var(--font-mono, monospace);
  font-size: 0.68rem;
  font-weight: 600;
  padding: 5px 10px;
  margin-top: 4px;
}
.rp-diff-hint--ok   { color: #00ff88; background: rgba(0,255,136,0.06); border: 1px solid rgba(0,255,136,0.15); }
.rp-diff-hint--warn { color: #FFAA00; background: rgba(255,170,0,0.06); border: 1px solid rgba(255,170,0,0.15); }

.rp-generate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: rgba(139,92,246,0.12);
  border: 1px solid rgba(139,92,246,0.35);
  color: #a78bfa;
  font-family: var(--font-mono, monospace);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  cursor: pointer;
  clip-path: polygon(6px 0%,100% 0%,100% calc(100% - 6px),calc(100% - 6px) 100%,0% 100%,0% 6px);
  transition: all 0.18s;
  width: 100%;
}
.rp-generate-btn:hover:not(:disabled) {
  background: rgba(139,92,246,0.22);
  border-color: rgba(139,92,246,0.60);
  color: #c4b5fd;
  box-shadow: 0 0 16px rgba(139,92,246,0.20);
}
.rp-generate-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.rp-spinner {
  width: 12px; height: 12px;
  border: 2px solid rgba(167,139,250,0.3);
  border-top-color: #a78bfa;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── 右栏 ─────────────────────────────────────────────────────── */
.rp-main {
  background: #111518;
  border: 1px solid rgba(139,92,246,0.12);
  height: calc(100vh - 160px);
  min-height: 480px;
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
}

/* 占位 */
.rp-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: rgba(255,255,255,0.18);
  font-size: 0.8rem;
  text-align: center;
  line-height: 1.7;
}

/* 骨架屏 */
.rp-skeleton { display: flex; flex-direction: column; gap: 14px; }
.rp-skeleton__bar {
  height: 14px;
  background: linear-gradient(90deg, rgba(139,92,246,0.06) 25%, rgba(139,92,246,0.12) 50%, rgba(139,92,246,0.06) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 2px;
  width: 70%;
}
.rp-skeleton__bar--short { width: 35%; }
.rp-skeleton__bar--long  { width: 90%; }
.rp-skeleton__bar--mid   { width: 55%; }
.rp-skeleton__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.rp-skeleton__card {
  height: 80px;
  background: linear-gradient(90deg, rgba(139,92,246,0.06) 25%, rgba(139,92,246,0.12) 50%, rgba(139,92,246,0.06) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 数字摘要卡片 */
.rp-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.rp-sum-card {
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
}
.rp-sum-card--purple { background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.20); }
.rp-sum-card--cyan   { background: rgba(0,243,255,0.06);  border: 1px solid rgba(0,243,255,0.18); }
.rp-sum-card--amber  { background: rgba(255,170,0,0.06);  border: 1px solid rgba(255,170,0,0.18); }
.rp-sum-card--green  { background: rgba(0,255,136,0.06);  border: 1px solid rgba(0,255,136,0.18); }
.rp-sum-card__label {
  font-family: var(--font-mono, monospace);
  font-size: 0.58rem;
  color: rgba(255,255,255,0.35);
  letter-spacing: 0.06em;
  text-align: center;
}
.rp-sum-card__val {
  font-family: var(--font-mono, monospace);
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1;
}
.rp-sum-card--purple .rp-sum-card__val { color: #a78bfa; text-shadow: 0 0 12px rgba(139,92,246,0.4); }
.rp-sum-card--cyan   .rp-sum-card__val { color: #00F3FF; text-shadow: 0 0 12px rgba(0,243,255,0.4); }
.rp-sum-card--amber  .rp-sum-card__val { color: #FFAA00; text-shadow: 0 0 12px rgba(255,170,0,0.4); }
.rp-sum-card--green  .rp-sum-card__val { color: #00ff88; text-shadow: 0 0 12px rgba(0,255,136,0.4); }
.rp-sum-card__unit {
  font-family: var(--font-mono, monospace);
  font-size: 0.58rem;
  color: rgba(255,255,255,0.25);
  letter-spacing: 0.06em;
}

/* AI 文字区 */
.rp-tab-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: rgba(139,92,246,0.04);
  border: 1px solid rgba(139,92,246,0.10);
  overflow: hidden;
}
.rp-tabs {
  display: flex;
  border-bottom: 1px solid rgba(139,92,246,0.12);
  flex-shrink: 0;
}
.rp-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: transparent;
  border: none;
  border-right: 1px solid rgba(139,92,246,0.10);
  color: rgba(255,255,255,0.35);
  font-family: var(--font-mono, monospace);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: all 0.15s;
}
.rp-tab:hover { color: rgba(167,139,250,0.7); background: rgba(139,92,246,0.06); }
.rp-tab--active {
  color: #a78bfa;
  background: rgba(139,92,246,0.10);
  border-bottom: 2px solid #a78bfa;
  margin-bottom: -1px;
}
.rp-tab-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  scrollbar-width: thin;
  scrollbar-color: rgba(139,92,246,0.25) transparent;
}
.rp-tab-body::-webkit-scrollbar { width: 4px; }
.rp-tab-body::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.25); border-radius: 2px; }

/* 采纳成功提示 */
.rp-accept-msg {
  font-family: var(--font-mono, monospace);
  font-size: 0.68rem;
  font-weight: 700;
  color: #00ff88;
  background: rgba(0,255,136,0.08);
  border: 1px solid rgba(0,255,136,0.20);
  padding: 6px 14px;
  letter-spacing: 0.06em;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

/* 操作按钮 */
.rp-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.rp-action-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 18px;
  font-family: var(--font-mono, monospace);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  cursor: pointer;
  transition: all 0.18s;
  clip-path: polygon(5px 0%,100% 0%,100% calc(100% - 5px),calc(100% - 5px) 100%,0% 100%,0% 5px);
}
.rp-action-btn--accept {
  background: rgba(0,255,136,0.08);
  border: 1px solid rgba(0,255,136,0.25);
  color: #00ff88;
}
.rp-action-btn--accept:hover {
  background: rgba(0,255,136,0.16);
  border-color: rgba(0,255,136,0.50);
  box-shadow: 0 0 14px rgba(0,255,136,0.15);
}
.rp-action-btn--delete {
  background: rgba(255,59,59,0.08);
  border: 1px solid rgba(255,59,59,0.25);
  color: #ff6b6b;
}
.rp-action-btn--delete:hover {
  background: rgba(255,59,59,0.16);
  border-color: rgba(255,59,59,0.50);
  color: #ff4444;
  box-shadow: 0 0 14px rgba(255,59,59,0.15);
}
.rp-action-btn--regen {
  background: rgba(139,92,246,0.08);
  border: 1px solid rgba(139,92,246,0.25);
  color: rgba(167,139,250,0.8);
}
.rp-action-btn--regen:hover {
  background: rgba(139,92,246,0.16);
  border-color: rgba(139,92,246,0.50);
  color: #a78bfa;
}

.rp-ai-text {
  font-size: 0.82rem;
  line-height: 1.75;
  color: rgba(255,255,255,0.75);
}
.rp-ai-text :deep(h4) {
  font-family: var(--font-mono, monospace);
  font-size: 0.78rem;
  font-weight: 700;
  color: #a78bfa;
  letter-spacing: 0.06em;
  margin: 16px 0 4px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(139,92,246,0.15);
}
.rp-ai-text :deep(h4:first-child) { margin-top: 0; }
.rp-ai-text :deep(strong) { color: #fff; font-weight: 700; }
.rp-ai-text :deep(ul) { padding-left: 16px; margin: 2px 0; }
.rp-ai-text :deep(li) { margin-bottom: 1px; }
.rp-ai-text :deep(p)  { margin: 2px 0; }

/* 有序正文行（非注意事项） */
.rp-ai-text :deep(.rp-ordered) {
  display: flex;
  gap: 6px;
  margin: 1px 0;
  align-items: baseline;
}
.rp-ai-text :deep(.rp-ordered__num) {
  font-family: var(--font-mono, monospace);
  font-size: 0.68rem;
  font-weight: 700;
  color: rgba(167,139,250,0.6);
  flex-shrink: 0;
  min-width: 16px;
}

/* 注意事项行 */
.rp-ai-text :deep(.rp-tip) {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 5px 0 3px;
  padding: 6px 12px;
  background: rgba(255,170,0,0.06);
  border-left: 2px solid rgba(255,170,0,0.45);
  color: rgba(255,220,100,0.90);
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1.6;
}
.rp-ai-text :deep(.rp-tip__num) {
  font-family: var(--font-mono, monospace);
  font-size: 0.65rem;
  font-weight: 800;
  color: #FFAA00;
  flex-shrink: 0;
  min-width: 14px;
}

@media (max-width: 900px) {
  .rp-body { grid-template-columns: 1fr; }
  .rp-summary-grid { grid-template-columns: repeat(2, 1fr); }
  .rp-container { padding: 16px; }
}
</style>
