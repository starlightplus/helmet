<template>
  <SportBackground />
  <div class="ride-plan">
    <div class="rp-ambient"></div>
    <div class="rp-container">

      <!-- ── Header ── -->
      <header class="rp-header">
        <div class="rp-header__brand">
          <button class="rp-back-btn" @click="goBack">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="rp-brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </div>
          <div>
            <div class="rp-brand-title">运动规划 <span class="rp-brand-badge">AI · PLAN</span></div>
            <div class="rp-brand-desc">MULTI-SPORT · PERSONALIZED · POWERED BY DEEPSEEK AI</div>
          </div>
        </div>
      </header>

      <!-- ── 主体：上下布局 ── -->
      <div class="rp-body">

        <!-- 上区：AI 规划结果 -->
        <section class="rp-main">

          <!-- 未生成时的占位 -->
          <div v-if="!plan && !generating" class="rp-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,0.25)" stroke-width="1.2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            <p>在下方选择运动项目和饮食限制<br>填写目标体重后点击「生成运动规划」</p>
          </div>

          <!-- 生成中骨架屏 -->
          <div v-else-if="generating" class="rp-skeleton">
            <div class="rp-skeleton__hint">
              <span class="rp-spinner"></span>
              正在为您量身定制运动规划，请稍等...
            </div>
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
                <div class="rp-sum-card__label">每日运动消耗</div>
                <div class="rp-sum-card__val">{{ plan.dailyBurnKcal }}</div>
                <div class="rp-sum-card__unit">kcal</div>
              </div>
              <div class="rp-sum-card rp-sum-card--green">
                <div class="rp-sum-card__label">每日摄入上限</div>
                <div class="rp-sum-card__val">{{ plan.dailyIntake }}</div>
                <div class="rp-sum-card__unit">kcal</div>
              </div>
            </div>

            <!-- 已选运动标签 -->
            <div class="rp-sport-pills">
              <span v-for="s in activeSportSummary" :key="s.key" class="rp-sport-pill">
                {{ s.icon }} {{ s.label }}
                <span class="rp-sport-pill__detail">{{ s.detail }}</span>
              </span>
              <span v-if="allDietRestrictions.length" class="rp-sport-pill rp-sport-pill--diet">
                🚫 {{ allDietRestrictions.join(' · ') }}
              </span>
            </div>

            <!-- 选项卡 + 内容区 -->
            <div class="rp-tab-wrap">
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
              <div class="rp-tab-body">
                <div class="rp-ai-text" v-html="activeTab === 'sport' ? formattedSport : formattedDiet"></div>
              </div>
            </div>

            <!-- 底部操作按钮 -->
            <div class="rp-actions">
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
                <button class="rp-action-btn rp-action-btn--history" @click="openHistoryDrawer">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  历史版本
                </button>
                <button class="rp-action-btn rp-action-btn--regen" @click="generatePlan">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.1"/></svg>
                  重新生成
                </button>
              </template>
            </div>
          </template>
        </section>

        <!-- 下区：问卷配置 -->
        <div class="rp-form-area">

          <!-- 问卷四列网格 -->
          <div class="rp-form-grid">

            <!-- 当前状态 + 历史均值 -->
            <div class="rp-form-col">
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
              <div class="rp-section rp-section--fill" style="margin-top:10px">
                <div class="rp-section-title">历史均值
                  <span class="rp-section-badge">近 {{ historyCount }} 次</span>
                </div>
                <div class="rp-scroll-body">
                  <div v-if="historyCount === 0" class="rp-empty-hint">暂无骑行记录</div>
                  <div v-else class="rp-info-grid">
                    <div class="rp-info-item">
                      <span class="rp-info-label">平均时长</span>
                      <span class="rp-info-val">{{ avgDurationMin }} 分钟</span>
                    </div>
                    <div class="rp-info-item">
                      <span class="rp-info-label">平均消耗</span>
                      <span class="rp-info-val rp-info-val--amber">{{ avgCalories }} kcal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 1：运动选择 -->
            <div class="rp-form-col">
              <div class="rp-section rp-section--fill">
                <div class="rp-section-title">
                  <span class="rp-step-num">01</span>每日运动计划
                </div>
                <!-- 已添加的运动列表 -->
                <div class="rp-added-list rp-scroll-body">
                  <div v-if="activeSportSummary.length === 0" class="rp-empty-hint">尚未添加运动项目</div>
                  <div v-for="s in activeSportSummary" :key="s.key" class="rp-added-item">
                    <span class="rp-added-item__icon">{{ s.icon }}</span>
                    <span class="rp-added-item__name">{{ s.label }}</span>
                    <span class="rp-added-item__detail">{{ s.detail }}</span>
                    <button class="rp-added-item__del" @click="removeSport(s.key)">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                </div>
                <!-- 添加按钮 -->
                <button class="rp-add-sport-btn" @click="openSportPicker">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  添加运动
                </button>
              </div>
            </div>

            <!-- 运动选择弹窗（teleport 到 body 避免裁剪） -->
            <Teleport to="body">
              <Transition name="sp-fade">
                <div v-if="showSportPicker" class="sp-overlay" @click.self="closeSportPicker">
                  <div class="sp-panel">
                    <div class="sp-panel__header">
                      <span class="sp-panel__title">添加运动项目</span>
                      <button class="sp-panel__close" @click="closeSportPicker">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                    <div class="sp-panel__body">
                      <!-- 左：运动选项 -->
                      <div class="sp-sport-grid">
                        <button
                          v-for="s in sportOptions"
                          :key="s.key"
                          class="sp-sport-btn"
                          :class="{ 'sp-sport-btn--active': pickerKey === s.key }"
                          @click="selectPickerSport(s.key)"
                        >
                          <span class="sp-sport-btn__icon">{{ s.icon }}</span>
                          <span class="sp-sport-btn__name">{{ s.label }}</span>
                          <span v-if="selectedSports[s.key]?.enabled" class="sp-sport-btn__added">已添加</span>
                        </button>
                      </div>
                      <!-- 右：参数配置 -->
                      <div class="sp-config">
                        <template v-if="pickerKey">
                          <div class="sp-config__title">
                            {{ sportOptions.find(s=>s.key===pickerKey)?.icon }}
                            {{ sportOptions.find(s=>s.key===pickerKey)?.label }}
                          </div>
                          <template v-if="sportOptions.find(s=>s.key===pickerKey)?.inputType === 'duration'">
                            <label class="sp-config__label">时长（分钟）</label>
                            <input v-model.number="pickerVal.duration" type="number" min="5" max="300" step="5" class="sp-config__input" placeholder="30" />
                          </template>
                          <template v-else-if="sportOptions.find(s=>s.key===pickerKey)?.inputType === 'distance'">
                            <label class="sp-config__label">距离（km）</label>
                            <input v-model.number="pickerVal.distance" type="number" min="0.5" max="100" step="0.5" class="sp-config__input" placeholder="5" />
                          </template>
                          <template v-else-if="sportOptions.find(s=>s.key===pickerKey)?.inputType === 'steps'">
                            <label class="sp-config__label">目标步数</label>
                            <input v-model.number="pickerVal.steps" type="number" min="1000" max="50000" step="500" class="sp-config__input" placeholder="8000" />
                          </template>
                          <template v-else-if="sportOptions.find(s=>s.key===pickerKey)?.inputType === 'jumprope'">
                            <label class="sp-config__label">组数</label>
                            <input v-model.number="pickerVal.sets" type="number" min="1" max="20" class="sp-config__input" placeholder="3" />
                            <label class="sp-config__label" style="margin-top:8px">每组个数</label>
                            <input v-model.number="pickerVal.reps" type="number" min="50" max="1000" step="50" class="sp-config__input" placeholder="200" />
                          </template>
                          <button class="sp-config__confirm" @click="confirmSportPicker">
                            {{ selectedSports[pickerKey]?.enabled ? '更新' : '添加' }}
                          </button>
                        </template>
                        <div v-else class="sp-config__hint">← 选择左侧运动项目</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            </Teleport>

            <!-- Step 2：饮食限制 -->
            <div class="rp-form-col">
              <div class="rp-section rp-section--fill">
                <div class="rp-section-title">
                  <span class="rp-step-num">02</span>饮食限制
                </div>
                <div class="rp-diet-grid">
                  <span
                    v-for="tag in dietTagOptions"
                    :key="tag"
                    class="rp-diet-tag"
                    :class="{ 'rp-diet-tag--active': dietRestrictions.includes(tag) }"
                    @click="toggleDietTag(tag)"
                  >{{ tag }}</span>
                </div>
                <div class="rp-diet-bottom">
                  <div class="rp-custom-diet">
                    <input
                      v-model="customDiet"
                      class="rp-input"
                      placeholder="其他（如：不吃香菜）"
                      @keydown.enter="addCustomDiet"
                    />
                    <button class="rp-add-btn" @click="addCustomDiet" :disabled="!customDiet.trim()">+</button>
                  </div>
                  <div v-if="customDietList.length" class="rp-custom-tags">
                    <span v-for="(t, i) in customDietList" :key="i" class="rp-custom-tag">
                      {{ t }}
                      <button class="rp-custom-tag__del" @click="removeCustomDiet(i)">×</button>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 3：目标体重 + 生成按钮 -->
            <div class="rp-form-col">
              <div class="rp-section">
                <div class="rp-section-title">
                  <span class="rp-step-num">03</span>减重目标
                </div>
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
                        ? `目标高于当前 ${Math.abs(weightDiff).toFixed(1)} kg`
                        : '已达到目标体重' }}
                </div>
              </div>
              <button
                class="rp-generate-btn"
                style="margin-top:10px"
                :disabled="!canGenerate || generating"
                @click="generatePlan"
              >
                <svg v-if="!generating" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                <span v-if="generating" class="rp-spinner"></span>
                {{ generating ? 'AI 规划生成中...' : '生成运动规划' }}
              </button>
            </div>

          </div><!-- /rp-form-grid -->
        </div><!-- /rp-form-area -->


      </div><!-- /rp-body -->
    </div>
  </div>

  <!-- ── 历史版本抽屉 ── -->
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div v-if="showHistoryDrawer" class="ph-overlay" @click.self="closeHistoryDrawer">
        <div class="ph-drawer">
          <div class="ph-drawer__header">
            <span class="ph-drawer__title">历史规划版本</span>
            <button class="ph-drawer__close" @click="closeHistoryDrawer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="ph-drawer__body">
            <div v-if="planHistoryStore.versions.length === 0" class="ph-empty">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,0.3)" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <p>暂无历史版本</p>
              <p class="ph-empty__sub">重新生成并采纳规划后，旧版本将自动保存</p>
            </div>
            <div v-else class="ph-list">
              <div v-for="(v, i) in planHistoryStore.versions" :key="i" class="ph-item">
                <div class="ph-item__header" @click="viewHistoryVersion(i)">
                  <div class="ph-item__meta">
                    <span class="ph-item__num">V{{ planHistoryStore.versions.length - i }}</span>
                    <span class="ph-item__date">{{ formatHistoryDate(v.savedAt) }}</span>
                    <span v-if="v.planTargetWeight" class="ph-item__tag">目标 {{ v.planTargetWeight }}kg</span>
                    <span v-if="v.planWeeks" class="ph-item__tag">{{ v.planWeeks }}周</span>
                    <span v-for="s in parseSports(v.planSports).slice(0,3)" :key="s.key" class="ph-item__sport">{{ s.icon }}</span>
                  </div>
                  <div class="ph-item__actions">
                    <button class="ph-item__del" @click.stop="deleteHistoryVersion(i)" title="删除此版本">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                    <svg class="ph-item__chevron" :class="{ 'ph-item__chevron--open': historyViewIdx === i }"
                      width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>
                <Transition name="ph-expand">
                  <div v-if="historyViewIdx === i" class="ph-item__content">
                    <div class="ph-tabs">
                      <span class="ph-tab ph-tab--active">运动计划</span>
                    </div>
                    <div class="ph-text" v-html="formatMd(v.planSportText)"></div>
                    <div v-if="v.planDietText" class="ph-diet-hint">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>
                      该版本含饮食食谱（重新生成后可在饮食标签查看）
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useUserProfileStore } from '@/stores/userProfile.js'
import { useRideHistoryStore } from '@/stores/ai-ride/rideHistory.js'
import { useRidePlanStore } from '@/stores/ai-ride/rideplan.js'
import { usePlanHistoryStore } from '@/stores/ai-ride/planHistory.js'
import SportBackground from '@/components/shared/SportBackground.vue'

const emit = defineEmits(['back'])
const profileStore = useUserProfileStore()
const historyStore = useRideHistoryStore()
const planHistoryStore = usePlanHistoryStore()

// ── 历史版本抽屉 ──────────────────────────────────────────────────
const showHistoryDrawer = ref(false)
const historyViewIdx = ref(null)  // 当前预览的版本索引

function openHistoryDrawer() {
  planHistoryStore.load()
  historyViewIdx.value = null
  showHistoryDrawer.value = true
}
function closeHistoryDrawer() {
  showHistoryDrawer.value = false
  historyViewIdx.value = null
}
function viewHistoryVersion(idx) {
  historyViewIdx.value = historyViewIdx.value === idx ? null : idx
}
function deleteHistoryVersion(idx) {
  planHistoryStore.remove(idx)
  if (historyViewIdx.value === idx) historyViewIdx.value = null
}
function formatHistoryDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}
function parseSports(planSports) {
  if (!planSports) return []
  try { return JSON.parse(planSports) } catch { return [] }
}
const ridePlanStore = useRidePlanStore()

function goBack() { emit('back') }

// ── 运动选项配置 ──────────────────────────────────────────────────
const sportOptions = [
  { key: 'cycling',    label: '骑行',   icon: '🚴', inputType: 'duration', kcalPerMin: 8 },
  { key: 'running',    label: '跑步',   icon: '🏃', inputType: 'distance', kcalPerKm: 60 },
  { key: 'walking',    label: '走路',   icon: '🚶', inputType: 'steps',    kcalPer1k: 40 },
  { key: 'jumprope',   label: '跳绳',   icon: '🪢', inputType: 'jumprope', kcalPerRep: 0.1 },
  { key: 'basketball', label: '打篮球', icon: '🏀', inputType: 'duration', kcalPerMin: 7 },
  { key: 'strength',   label: '力量训练', icon: '🏋️', inputType: 'duration', kcalPerMin: 5 },
]

const selectedSports = reactive({})
sportOptions.forEach(s => {
  selectedSports[s.key] = {
    enabled: false,
    duration: s.inputType === 'duration' ? 30 : undefined,
    distance: s.inputType === 'distance' ? 5 : undefined,
    steps:    s.inputType === 'steps'    ? 8000 : undefined,
    sets:     s.inputType === 'jumprope' ? 3 : undefined,
    reps:     s.inputType === 'jumprope' ? 200 : undefined,
  }
})

function toggleSport(key) {
  selectedSports[key].enabled = !selectedSports[key].enabled
}

// ── 运动选择弹窗 ──────────────────────────────────────────────────
const showSportPicker = ref(false)
const pickerKey = ref(null)
const pickerVal = reactive({ duration: 30, distance: 5, steps: 8000, sets: 3, reps: 200 })

function openSportPicker() {
  pickerKey.value = null
  showSportPicker.value = true
}
function closeSportPicker() {
  showSportPicker.value = false
}
function selectPickerSport(key) {
  pickerKey.value = key
  // 预填已有值
  const cfg = selectedSports[key]
  if (cfg.duration != null) pickerVal.duration = cfg.duration
  if (cfg.distance != null) pickerVal.distance = cfg.distance
  if (cfg.steps    != null) pickerVal.steps    = cfg.steps
  if (cfg.sets     != null) pickerVal.sets     = cfg.sets
  if (cfg.reps     != null) pickerVal.reps     = cfg.reps
}
function confirmSportPicker() {
  if (!pickerKey.value) return
  const cfg = selectedSports[pickerKey.value]
  cfg.enabled  = true
  cfg.duration = pickerVal.duration
  cfg.distance = pickerVal.distance
  cfg.steps    = pickerVal.steps
  cfg.sets     = pickerVal.sets
  cfg.reps     = pickerVal.reps
  closeSportPicker()
}
function removeSport(key) {
  selectedSports[key].enabled = false
}

const activeSportSummary = computed(() => {
  return sportOptions
    .filter(s => selectedSports[s.key]?.enabled)
    .map(s => {
      const cfg = selectedSports[s.key]
      let detail = ''
      if (s.inputType === 'duration')  detail = (cfg.duration || 30) + ' 分钟'
      if (s.inputType === 'distance')  detail = (cfg.distance || 5) + ' km'
      if (s.inputType === 'steps')     detail = (cfg.steps || 8000) + ' 步'
      if (s.inputType === 'jumprope')  detail = `${cfg.sets || 3}组×${cfg.reps || 200}个`
      return { key: s.key, icon: s.icon, label: s.label, detail }
    })
})

// ── 饮食限制 ──────────────────────────────────────────────────────
const dietTagOptions = ['不吃猪肉', '不吃牛羊肉', '不吃海鲜', '素食', '不喝牛奶', '不吃辛辣', '低碳水', '无麸质']
const dietRestrictions = ref([])
const customDiet = ref('')
const customDietList = ref([])

function toggleDietTag(tag) {
  const idx = dietRestrictions.value.indexOf(tag)
  if (idx === -1) dietRestrictions.value.push(tag)
  else dietRestrictions.value.splice(idx, 1)
}
function addCustomDiet() {
  const v = customDiet.value.trim()
  if (v && !customDietList.value.includes(v)) customDietList.value.push(v)
  customDiet.value = ''
}
function removeCustomDiet(i) { customDietList.value.splice(i, 1) }
const allDietRestrictions = computed(() => [...dietRestrictions.value, ...customDietList.value])

// ── 个人资料 ──────────────────────────────────────────────────────
const profile = computed(() => ({
  weight: profileStore.weight || null,
  height: profileStore.height || null,
  age:    profileStore.age    || null,
  gender: profileStore.gender || null,
}))

// ── 历史骑行均值 ──────────────────────────────────────────────────
const historyCount = computed(() => historyStore.rides.length)
const avgCalories = computed(() => {
  if (historyCount.value === 0) return 200
  return Math.round(historyStore.rides.reduce((s, r) => s + (r.calories || 0), 0) / historyCount.value)
})
const avgDurationMin = computed(() => {
  if (historyCount.value === 0) return 30
  return Math.round(historyStore.rides.reduce((s, r) => s + (r.duration || 0), 0) / historyCount.value / 60)
})

// ── 目标体重 ──────────────────────────────────────────────────────
const targetWeight = ref(null)
const weightDiff = computed(() => {
  if (!targetWeight.value || !profile.value.weight) return null
  return Number(profile.value.weight) - Number(targetWeight.value)
})
const canGenerate = computed(() =>
  targetWeight.value > 0 &&
  profile.value.weight > 0 &&
  weightDiff.value > 0 &&
  activeSportSummary.value.length > 0
)

// ── 估算每日运动消耗 ──────────────────────────────────────────────
function estimateDailyBurn() {
  let total = 0
  const w = Number(profile.value.weight) || 70
  sportOptions.forEach(s => {
    const cfg = selectedSports[s.key]
    if (!cfg?.enabled) return
    if (s.inputType === 'duration')  total += (cfg.duration || 30) * s.kcalPerMin
    if (s.inputType === 'distance')  total += (cfg.distance || 5) * s.kcalPerKm
    if (s.inputType === 'steps')     total += Math.round((cfg.steps || 8000) / 1000 * s.kcalPer1k)
    if (s.inputType === 'jumprope')  total += Math.round((cfg.sets || 3) * (cfg.reps || 200) * s.kcalPerRep)
  })
  return Math.round(total * (w / 70))
}
// 本地计算每日运动消耗
function calcPlan() {
  const w      = Number(profile.value.weight)
  const h      = Number(profile.value.height) || 170
  const age    = Number(profile.value.age)    || 25
  const gender = profile.value.gender
  const diff   = weightDiff.value
  const weeks  = Math.ceil(diff / 0.75)
  const days   = weeks * 7
  const totalDeficit = diff * 7700
  const dailyDeficit = Math.round(totalDeficit / days)
  const bmr = gender === 'female'
    ? 10 * w + 6.25 * h - 5 * age - 161
    : 10 * w + 6.25 * h - 5 * age + 5
  const tdee = Math.round(bmr * 1.375)
  const dailyBurnKcal = estimateDailyBurn()
  const dailyIntake = Math.max(1200, tdee - dailyDeficit)
  return {
    weightToLose: diff.toFixed(1),
    weeks,
    dailyBurnKcal,
    dailyIntake: Math.round(dailyIntake),
    dailyDeficit,
    tdee,
    bmr: Math.round(bmr),
  }
}

// ── AI 生成 ───────────────────────────────────────────────────────
const generating = ref(false)
const plan       = ref(null)
const sportText  = ref('')
const dietText   = ref('')
const activeTab  = ref('sport')

function buildSportDesc() {
  return activeSportSummary.value.map(s => {
    const opt = sportOptions.find(o => o.key === s.key)
    const cfg = selectedSports[s.key]
    if (opt.inputType === 'duration')  return `${s.label} ${cfg.duration || 30} 分钟`
    if (opt.inputType === 'distance')  return `${s.label} ${cfg.distance || 5} km`
    if (opt.inputType === 'steps')     return `${s.label} ${cfg.steps || 8000} 步`
    if (opt.inputType === 'jumprope')  return `${s.label} ${cfg.sets || 3} 组 × ${cfg.reps || 200} 个`
    return s.label
  }).join('、')
}

// AI生成运动规划和饮食规划
async function generatePlan() {
  if (!canGenerate.value || generating.value) return
  generating.value = true
  plan.value  = null
  sportText.value = ''
  dietText.value  = ''
  accepted.value  = false

  const nums = calcPlan()
  const sportDesc = buildSportDesc()
  const dietDesc = allDietRestrictions.value.length ? allDietRestrictions.value.join('、') : '无特殊限制'

  const prompt = `我需要制定个性化运动与饮食计划，请根据以下数据生成：

【个人信息】
- 当前体重：${profile.value.weight} kg，身高：${profile.value.height || '未知'} cm，年龄：${profile.value.age || '未知'} 岁，性别：${profile.value.gender === 'female' ? '女' : '男'}
- 目标体重：${targetWeight.value} kg（需减重 ${nums.weightToLose} kg）

【每日运动计划】
${sportDesc}
- 预计每日运动消耗：${nums.dailyBurnKcal} kcal

【饮食限制】
${dietDesc}

【系统计算结果】
- 基础代谢率（BMR）：${nums.bmr} kcal/天
- 总热量消耗（TDEE）：${nums.tdee} kcal/天
- 推荐减重周期：${nums.weeks} 周
- 每日热量缺口：${nums.dailyDeficit} kcal
- 每日饮食摄入上限：${nums.dailyIntake} kcal

请严格按以下格式输出，两部分之间用 ===DIET=== 分隔：

第一部分（运动计划）：
针对用户选择的每项运动，分别给出强度递进建议（第1-2周/第3-4周/第5周以上），包括频率、强度。最后用 ### 综合运动注意事项 作为标题，列出3条注意事项。

===DIET===

第二部分（饮食食谱）：
严格遵守饮食限制（${dietDesc}），分早/午/晚三餐，各给2个具体食谱例子，注明大致热量。最后用 ### 饮食注意事项 作为标题，列出3条注意事项。

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

// ── 采纳规划 ─────────────────────────────────────────────────────
const accepted  = ref(false)
const acceptMsg = ref('')
const saving    = ref(false)

function getToken() { return sessionStorage.getItem('token') || '' }

async function fetchSavedPlan() {
  const token = getToken()
  if (!token) return null
  try {
    const res = await fetch('/api/user/profile', { headers: { 'Authorization': 'Bearer ' + token } })
    return res.ok ? await res.json() : null
  } catch { return null }
}

async function acceptPlan() {
  if (!plan.value || saving.value) return
  saving.value = true
  const token = getToken()
  try {
    // 先快照当前已采纳的规划（如果有）
    if (accepted.value) {
      const current = await fetchSavedPlan()
      if (current && current.planSportText) {
        planHistoryStore.load()
        planHistoryStore.snapshot(current)
      }
    }
    await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({
        planDailyRideMin:     activeSportSummary.value.find(s => s.key === 'cycling')
                                ? (selectedSports.cycling.duration || 30) : 0,
        planDailyIntake:      plan.value.dailyIntake,
        planTargetWeight:     Number(targetWeight.value),
        planWeeks:            plan.value.weeks,
        planSportText:        sportText.value,
        planDietText:         dietText.value,
        planDietRestrictions: allDietRestrictions.value.join(','),
        planSports:           JSON.stringify(activeSportSummary.value),
        planSportsCfg:        JSON.stringify(
          sportOptions
            .filter(s => selectedSports[s.key]?.enabled)
            .map(s => ({ key: s.key, ...selectedSports[s.key] }))
        ),
      })
    })
    accepted.value = true
    acceptMsg.value = '✓ 已设为每日目标'
    await ridePlanStore.fetchPlan()
    ridePlanStore.setDietRestrictions(allDietRestrictions.value)
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
  plan.value = null
  sportText.value = ''
  dietText.value  = ''
  accepted.value  = false
  targetWeight.value = null
  // 同步清除 store，让 DailyPlan 立即响应
  ridePlanStore.clear()
}

// ── onMounted ─────────────────────────────────────────────────────
onMounted(async () => {
  if (!profileStore.loaded) await profileStore.loadFromServer()
  const d = await fetchSavedPlan()
  if (d && d.planSportText) {
    sportText.value    = d.planSportText
    dietText.value     = d.planDietText || ''
    targetWeight.value = d.planTargetWeight || null
    plan.value = {
      weightToLose: d.planTargetWeight && profileStore.weight
        ? (Number(profileStore.weight) - Number(d.planTargetWeight)).toFixed(1) : '--',
      weeks:         d.planWeeks       || '--',
      dailyBurnKcal: '--',
      dailyIntake:   d.planDailyIntake || '--',
    }
    accepted.value = true
    if (d.planDietRestrictions) {
      const saved = d.planDietRestrictions.split(',').filter(Boolean)
      saved.forEach(t => {
        if (dietTagOptions.includes(t)) dietRestrictions.value.push(t)
        else customDietList.value.push(t)
      })
      ridePlanStore.setDietRestrictions(saved)
    }
    if (d.planSportsCfg) {
      try {
        JSON.parse(d.planSportsCfg).forEach(s => {
          if (selectedSports[s.key]) Object.assign(selectedSports[s.key], s)
        })
      } catch {}
    } else if (d.planSports) {
      try {
        JSON.parse(d.planSports).forEach(s => {
          if (selectedSports[s.key]) selectedSports[s.key].enabled = true
        })
      } catch {}
    }
    // 用恢复的运动配置重算每日消耗
    plan.value.dailyBurnKcal = estimateDailyBurn()
  }
})

// ── markdown 渲染 ─────────────────────────────────────────────────
function formatMd(text) {
  if (!text) return ''
  let t = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const lines = t.split('\n')
  const out = []
  let inList = false
  let inTipSection = false  // 是否在「注意事项」标题下
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    if (line.trim() === '') {
      if (inList) { out.push('</ul>'); inList = false }
      continue
    }
    const headM = line.match(/^#{1,3} (.+)$/)
    if (headM) {
      if (inList) { out.push('</ul>'); inList = false }
      // 遇到标题时判断是否进入注意事项段
      inTipSection = /注意事项|注意要点/.test(headM[1])
      out.push(`<h4>${headM[1].replace(/\*\*([^*]{1,80})\*\*/g, '<strong>$1</strong>')}</h4>`)
      continue
    }
    const listM = line.match(/^[-*] (.+)$/)
    if (listM) {
      const content = fmtInline(listM[1])
      if (inTipSection) {
        if (inList) { out.push('</ul>'); inList = false }
        out.push(`<div class="rp-tip">${content}</div>`)
      } else {
        if (!inList) { out.push('<ul>'); inList = true }
        out.push(`<li>${content}</li>`)
      }
      continue
    }
    const ordM = line.match(/^(\d+)[.、] (.+)$/)
    if (ordM) {
      if (inList) { out.push('</ul>'); inList = false }
      const content = fmtInline(ordM[2])
      if (inTipSection) {
        out.push(`<div class="rp-tip"><span class="rp-tip__num">${ordM[1]}</span>${content}</div>`)
      } else {
        out.push(`<div class="rp-ordered"><span class="rp-ordered__num">${ordM[1]}.</span>${content}</div>`)
      }
      continue
    }
    if (inList) { out.push('</ul>'); inList = false }
    // 如果是「注意事项」段落标题（可能是加粗文本或普通文本，不一定是 ### 标题）
    if (/注意事项|注意要点/.test(line.replace(/\*\*/g, ''))) {
      inTipSection = true
    }
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
  color: #e2e8f0;
  font-family: "Inter", system-ui, sans-serif;
  position: relative;
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
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(139,92,246,0.15);
}
.rp-header__brand { display: flex; align-items: center; gap: 14px; }
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
  font-size: 0.95rem; font-weight: 700; color: #fff;
  letter-spacing: 0.06em;
  display: flex; align-items: center; gap: 8px;
}
.rp-brand-badge {
  font-size: 0.58rem; padding: 2px 7px;
  background: rgba(139,92,246,0.15);
  border: 1px solid rgba(139,92,246,0.30);
  color: #a78bfa; letter-spacing: 0.1em;
  clip-path: polygon(3px 0%,100% 0%,100% calc(100% - 3px),calc(100% - 3px) 100%,0% 100%,0% 3px);
}
.rp-brand-desc {
  font-family: var(--font-mono, monospace);
  font-size: 0.58rem; color: rgba(139,92,246,0.40);
  letter-spacing: 0.08em; margin-top: 3px;
}

/* ── 主体：上下布局 ───────────────────────────────────────────── */
.rp-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── 上区：AI 规划结果 ────────────────────────────────────────── */
.rp-main {
  background: rgba(17, 21, 24, 0.55);
  border: 1px solid rgba(139,92,246,0.12);
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%);
  padding: 20px 24px;
  display: flex; flex-direction: column; gap: 14px;
}
.rp-placeholder {
  min-height: 160px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 12px;
  color: rgba(255,255,255,0.18); font-size: 0.8rem;
  text-align: center; line-height: 1.7;
}

/* 骨架屏 */
.rp-skeleton { display: flex; flex-direction: column; gap: 14px; }
.rp-skeleton__hint {
  display: flex; align-items: center; gap: 10px;
  font-family: var(--font-mono, monospace);
  font-size: 0.75rem; color: rgba(167,139,250,0.75);
  letter-spacing: 0.04em;
  padding: 10px 14px;
  background: rgba(139,92,246,0.06);
  border: 1px solid rgba(139,92,246,0.15);
}
.rp-skeleton__bar {
  height: 14px;
  background: linear-gradient(90deg, rgba(139,92,246,0.06) 25%, rgba(139,92,246,0.12) 50%, rgba(139,92,246,0.06) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite; border-radius: 2px; width: 70%;
}
.rp-skeleton__bar--short { width: 35%; }
.rp-skeleton__bar--long  { width: 90%; }
.rp-skeleton__bar--mid   { width: 55%; }
.rp-skeleton__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.rp-skeleton__card {
  height: 80px;
  background: linear-gradient(90deg, rgba(139,92,246,0.06) 25%, rgba(139,92,246,0.12) 50%, rgba(139,92,246,0.06) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* 数字摘要卡片 */
.rp-summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.rp-sum-card {
  padding: 14px 12px; display: flex; flex-direction: column;
  align-items: center; gap: 4px;
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
}
.rp-sum-card--purple { background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.20); }
.rp-sum-card--cyan   { background: rgba(0,243,255,0.06);  border: 1px solid rgba(0,243,255,0.18); }
.rp-sum-card--amber  { background: rgba(255,170,0,0.06);  border: 1px solid rgba(255,170,0,0.18); }
.rp-sum-card--green  { background: rgba(0,255,136,0.06);  border: 1px solid rgba(0,255,136,0.18); }
.rp-sum-card__label {
  font-family: var(--font-mono, monospace);
  font-size: 0.58rem; color: rgba(255,255,255,0.35);
  letter-spacing: 0.06em; text-align: center;
}
.rp-sum-card__val {
  font-family: var(--font-mono, monospace);
  font-size: 1.8rem; font-weight: 800; line-height: 1;
}
.rp-sum-card--purple .rp-sum-card__val { color: #a78bfa; text-shadow: 0 0 12px rgba(139,92,246,0.4); }
.rp-sum-card--cyan   .rp-sum-card__val { color: #00F3FF; text-shadow: 0 0 12px rgba(0,243,255,0.4); }
.rp-sum-card--amber  .rp-sum-card__val { color: #FFAA00; text-shadow: 0 0 12px rgba(255,170,0,0.4); }
.rp-sum-card--green  .rp-sum-card__val { color: #00ff88; text-shadow: 0 0 12px rgba(0,255,136,0.4); }
.rp-sum-card__unit {
  font-family: var(--font-mono, monospace);
  font-size: 0.58rem; color: rgba(255,255,255,0.25); letter-spacing: 0.06em;
}

/* 运动 pills */
.rp-sport-pills { display: flex; flex-wrap: wrap; gap: 6px; }
.rp-sport-pill {
  display: flex; align-items: center; gap: 5px;
  font-family: var(--font-mono, monospace);
  font-size: 0.62rem; padding: 4px 10px;
  background: rgba(139,92,246,0.08);
  border: 1px solid rgba(139,92,246,0.22);
  color: rgba(167,139,250,0.80);
}
.rp-sport-pill--diet {
  background: rgba(255,170,0,0.06);
  border-color: rgba(255,170,0,0.20);
  color: rgba(255,220,100,0.75);
}
.rp-sport-pill__detail { color: rgba(255,255,255,0.35); font-size: 0.58rem; }

/* AI 文字区 — 不再固定高度，随内容自然撑开 */
.rp-tab-wrap {
  background: rgba(139,92,246,0.04);
  border: 1px solid rgba(139,92,246,0.10);
}
.rp-tabs { display: flex; border-bottom: 1px solid rgba(139,92,246,0.12); }
.rp-tab {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 18px;
  background: transparent; border: none;
  border-right: 1px solid rgba(139,92,246,0.10);
  color: rgba(255,255,255,0.35);
  font-family: var(--font-mono, monospace);
  font-size: 0.65rem; font-weight: 600; letter-spacing: 0.08em;
  cursor: pointer; transition: all 0.15s;
}
.rp-tab:hover { color: rgba(167,139,250,0.7); background: rgba(139,92,246,0.06); }
.rp-tab--active {
  color: #a78bfa; background: rgba(139,92,246,0.10);
  border-bottom: 2px solid #a78bfa; margin-bottom: -1px;
}
/* tab 内容区不再设固定高度，让外层 page-wrapper 统一滚动 */
.rp-tab-body { padding: 16px 20px; }

/* 采纳提示 */
.rp-accept-msg {
  font-family: var(--font-mono, monospace);
  font-size: 0.68rem; font-weight: 700; color: #00ff88;
  background: rgba(0,255,136,0.08); border: 1px solid rgba(0,255,136,0.20);
  padding: 6px 14px; letter-spacing: 0.06em;
  flex-shrink: 0; display: flex; align-items: center;
}

/* 操作按钮 */
.rp-actions { display: flex; align-items: center; gap: 10px; }
.rp-action-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 18px;
  font-family: var(--font-mono, monospace);
  font-size: 0.68rem; font-weight: 700; letter-spacing: 0.07em;
  cursor: pointer; transition: all 0.18s;
  clip-path: polygon(5px 0%,100% 0%,100% calc(100% - 5px),calc(100% - 5px) 100%,0% 100%,0% 5px);
}
.rp-action-btn--accept { background: rgba(0,255,136,0.08); border: 1px solid rgba(0,255,136,0.25); color: #00ff88; }
.rp-action-btn--accept:hover { background: rgba(0,255,136,0.16); border-color: rgba(0,255,136,0.50); box-shadow: 0 0 14px rgba(0,255,136,0.15); }
.rp-action-btn--delete { background: rgba(255,59,59,0.08); border: 1px solid rgba(255,59,59,0.25); color: #ff6b6b; }
.rp-action-btn--delete:hover { background: rgba(255,59,59,0.16); border-color: rgba(255,59,59,0.50); color: #ff4444; }
.rp-action-btn--regen { background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.25); color: rgba(167,139,250,0.8); }
.rp-action-btn--regen:hover { background: rgba(139,92,246,0.16); border-color: rgba(139,92,246,0.50); color: #a78bfa; }

/* AI 文字渲染 */
.rp-ai-text { font-size: 0.82rem; line-height: 1.75; color: rgba(255,255,255,0.75); }
.rp-ai-text :deep(h4) {
  font-family: var(--font-mono, monospace); font-size: 0.78rem; font-weight: 700;
  color: #a78bfa; letter-spacing: 0.06em;
  margin: 16px 0 4px; padding-bottom: 4px;
  border-bottom: 1px solid rgba(139,92,246,0.15);
}
.rp-ai-text :deep(h4:first-child) { margin-top: 0; }
.rp-ai-text :deep(strong) { color: #fff; font-weight: 700; }
.rp-ai-text :deep(ul) { padding-left: 16px; margin: 2px 0; }
.rp-ai-text :deep(li) { margin-bottom: 1px; }
.rp-ai-text :deep(p)  { margin: 2px 0; }
.rp-ai-text :deep(.rp-ordered) { display: flex; gap: 6px; margin: 1px 0; align-items: baseline; }
.rp-ai-text :deep(.rp-ordered__num) {
  font-family: var(--font-mono, monospace); font-size: 0.68rem; font-weight: 700;
  color: rgba(167,139,250,0.6); flex-shrink: 0; min-width: 16px;
}
.rp-ai-text :deep(.rp-tip) {
  display: flex; align-items: baseline; gap: 8px;
  margin: 5px 0 3px; padding: 6px 12px;
  background: rgba(255,170,0,0.06);
  border-left: 2px solid rgba(255,170,0,0.45);
  color: rgba(255,220,100,0.90); font-size: 0.78rem; font-weight: 600; line-height: 1.6;
}
.rp-ai-text :deep(.rp-tip__num) {
  font-family: var(--font-mono, monospace); font-size: 0.65rem; font-weight: 800;
  color: #FFAA00; flex-shrink: 0; min-width: 14px;
}

/* ── 下区：问卷配置 ───────────────────────────────────────────── */
.rp-form-area {
  background: rgba(17, 21, 24, 0.55);
  border: 1px solid rgba(139,92,246,0.12);
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%);
  padding: 20px 24px;
}
.rp-form-grid {
  display: grid;
  grid-template-columns: 200px 1fr 1fr 200px;
  gap: 16px;
  /* 固定网格高度，四列底部对齐 */
  height: 340px;
  align-items: stretch;
}
/* 每列撑满网格高度 */
.rp-form-col {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
/* section 撑满剩余空间（用于历史均值、运动选择、饮食限制） */
.rp-section--fill {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
/* 可滚动内容区 */
.rp-scroll-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(139,92,246,0.25) transparent;
}
.rp-scroll-body::-webkit-scrollbar { width: 3px; }
.rp-scroll-body::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.25); border-radius: 2px; }

/* ── 通用 section ─────────────────────────────────────────────── */
.rp-section {
  background: rgba(139,92,246,0.04);
  border: 1px solid rgba(139,92,246,0.12);
  padding: 12px 14px;
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
}
.rp-section-title {
  font-family: var(--font-mono, monospace);
  font-size: 0.63rem; font-weight: 700;
  color: rgba(167,139,250,0.7);
  letter-spacing: 0.1em; text-transform: uppercase;
  margin-bottom: 10px;
  display: flex; align-items: center; gap: 8px;
}
.rp-step-num {
  font-size: 0.55rem; padding: 1px 5px;
  background: rgba(139,92,246,0.15);
  border: 1px solid rgba(139,92,246,0.30);
  color: #a78bfa; letter-spacing: 0.06em;
}
.rp-section-badge {
  font-size: 0.58rem; padding: 1px 6px;
  background: rgba(139,92,246,0.10);
  border: 1px solid rgba(139,92,246,0.20);
  color: rgba(167,139,250,0.6); border-radius: 2px; font-weight: 400;
}
.rp-empty-hint { font-size: 0.7rem; color: rgba(255,255,255,0.25); font-style: italic; }
.rp-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.rp-info-item {
  display: flex; flex-direction: column; gap: 3px;
  padding: 7px 8px;
  background: rgba(139,92,246,0.04);
  border: 1px solid rgba(139,92,246,0.08);
}
.rp-info-label {
  font-family: var(--font-mono, monospace);
  font-size: 0.58rem; color: rgba(255,255,255,0.25); letter-spacing: 0.06em;
}
.rp-info-val {
  font-family: var(--font-mono, monospace);
  font-size: 0.82rem; font-weight: 700; color: rgba(255,255,255,0.80);
}
.rp-info-val--amber { color: #FFAA00; }

/* ── 已添加运动列表 ───────────────────────────────────────────── */
.rp-added-list { display: flex; flex-direction: column; gap: 5px; }
.rp-added-item {
  display: flex; align-items: center; gap: 7px;
  padding: 6px 10px;
  background: rgba(139,92,246,0.07);
  border: 1px solid rgba(139,92,246,0.20);
}
.rp-added-item__icon { font-size: 0.9rem; flex-shrink: 0; }
.rp-added-item__name {
  font-family: var(--font-mono, monospace);
  font-size: 0.68rem; font-weight: 600; color: #c4b5fd; flex-shrink: 0;
}
.rp-added-item__detail {
  font-family: var(--font-mono, monospace);
  font-size: 0.60rem; color: rgba(255,255,255,0.35); flex: 1;
}
.rp-added-item__del {
  width: 18px; height: 18px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.20);
  color: rgba(239,68,68,0.55); cursor: pointer;
  transition: all 0.15s;
}
.rp-added-item__del:hover { background: rgba(239,68,68,0.18); color: #f87171; }

/* 添加运动按钮 */
.rp-add-sport-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  margin-top: 8px; padding: 7px;
  background: rgba(139,92,246,0.06);
  border: 1px dashed rgba(139,92,246,0.30);
  color: rgba(167,139,250,0.65);
  font-family: var(--font-mono, monospace);
  font-size: 0.63rem; font-weight: 600; letter-spacing: 0.06em;
  cursor: pointer; transition: all 0.15s; width: 100%;
}
.rp-add-sport-btn:hover {
  background: rgba(139,92,246,0.12);
  border-color: rgba(139,92,246,0.55);
  color: #a78bfa;
}

/* ── 运动选择弹窗 ─────────────────────────────────────────────── */
.sp-overlay {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
}
.sp-panel {
  width: 480px;
  background: #0d1117;
  border: 1px solid rgba(139,92,246,0.30);
  clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%);
  box-shadow: 0 0 40px rgba(139,92,246,0.15);
  display: flex; flex-direction: column;
}
.sp-panel__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(139,92,246,0.12);
}
.sp-panel__title {
  font-family: var(--font-mono, monospace);
  font-size: 0.75rem; font-weight: 700; color: #a78bfa; letter-spacing: 0.1em;
}
.sp-panel__close {
  width: 26px; height: 26px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(139,92,246,0.06);
  border: 1px solid rgba(139,92,246,0.20);
  color: rgba(167,139,250,0.6); cursor: pointer; transition: all 0.15s;
}
.sp-panel__close:hover { background: rgba(139,92,246,0.16); color: #a78bfa; }
.sp-panel__body {
  display: flex; gap: 0;
  min-height: 280px;
}

/* 左侧运动选项网格 */
.sp-sport-grid {
  width: 200px; flex-shrink: 0;
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 6px; padding: 14px;
  border-right: 1px solid rgba(139,92,246,0.10);
  align-content: start;
}
.sp-sport-btn {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 10px 6px;
  background: rgba(139,92,246,0.04);
  border: 1px solid rgba(139,92,246,0.12);
  color: rgba(255,255,255,0.55);
  cursor: pointer; transition: all 0.15s;
  position: relative;
}
.sp-sport-btn:hover { border-color: rgba(139,92,246,0.35); background: rgba(139,92,246,0.09); color: rgba(255,255,255,0.80); }
.sp-sport-btn--active { border-color: rgba(139,92,246,0.55); background: rgba(139,92,246,0.14); color: #c4b5fd; }
.sp-sport-btn__icon { font-size: 1.2rem; }
.sp-sport-btn__name { font-family: var(--font-mono, monospace); font-size: 0.60rem; font-weight: 600; letter-spacing: 0.04em; }
.sp-sport-btn__added {
  position: absolute; top: 3px; right: 3px;
  font-size: 0.45rem; padding: 1px 3px;
  background: rgba(0,255,136,0.12); border: 1px solid rgba(0,255,136,0.25);
  color: #00ff88; letter-spacing: 0.04em;
}

/* 右侧参数配置 */
.sp-config {
  flex: 1; padding: 16px 18px;
  display: flex; flex-direction: column;
}
.sp-config__hint {
  flex: 1; display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono, monospace);
  font-size: 0.65rem; color: rgba(255,255,255,0.20);
}
.sp-config__title {
  font-family: var(--font-mono, monospace);
  font-size: 0.82rem; font-weight: 700; color: #a78bfa;
  margin-bottom: 14px;
}
.sp-config__label {
  font-family: var(--font-mono, monospace);
  font-size: 0.60rem; color: rgba(255,255,255,0.35);
  letter-spacing: 0.06em; margin-bottom: 5px; display: block;
}
.sp-config__input {
  background: rgba(139,92,246,0.07);
  border: 1px solid rgba(139,92,246,0.25);
  color: #fff;
  font-family: var(--font-mono, monospace);
  font-size: 1rem; font-weight: 700;
  padding: 8px 10px; outline: none; width: 100%; box-sizing: border-box;
  transition: border-color 0.15s;
}
.sp-config__input:focus { border-color: rgba(139,92,246,0.55); }
.sp-config__confirm {
  margin-top: auto; padding: 10px;
  background: rgba(139,92,246,0.14);
  border: 1px solid rgba(139,92,246,0.40);
  color: #c4b5fd;
  font-family: var(--font-mono, monospace);
  font-size: 0.70rem; font-weight: 700; letter-spacing: 0.08em;
  cursor: pointer; transition: all 0.18s;
  clip-path: polygon(5px 0%,100% 0%,100% calc(100% - 5px),calc(100% - 5px) 100%,0% 100%,0% 5px);
  width: 100%;
}
.sp-config__confirm:hover {
  background: rgba(139,92,246,0.26);
  border-color: rgba(139,92,246,0.65);
  color: #fff;
  box-shadow: 0 0 14px rgba(139,92,246,0.20);
}

/* 弹窗动画 */
.sp-fade-enter-active, .sp-fade-leave-active { transition: opacity 0.2s ease; }
.sp-fade-enter-from, .sp-fade-leave-to { opacity: 0; }
.sp-fade-enter-active .sp-panel, .sp-fade-leave-active .sp-panel { transition: transform 0.2s ease; }
.sp-fade-enter-from .sp-panel, .sp-fade-leave-to .sp-panel { transform: scale(0.96) translateY(8px); }

/* ── 饮食限制 ─────────────────────────────────────────────────── */
/* 2列网格，每个 tag 撑满格子，整齐填满空间 */
.rp-diet-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
}
.rp-diet-tag {
  font-family: var(--font-mono, monospace);
  font-size: 0.60rem; padding: 6px 8px;
  border: 1px solid rgba(139,92,246,0.18);
  background: rgba(139,92,246,0.04);
  color: rgba(255,255,255,0.45);
  cursor: pointer; transition: all 0.15s;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rp-diet-tag:hover { border-color: rgba(139,92,246,0.35); color: rgba(255,255,255,0.70); }
.rp-diet-tag--active {
  border-color: rgba(139,92,246,0.55);
  background: rgba(139,92,246,0.15);
  color: #c4b5fd;
}
/* 自定义输入贴底 */
.rp-diet-bottom { margin-top: auto; padding-top: 10px; }
.rp-custom-diet { display: flex; gap: 6px; }
.rp-add-btn {
  width: 30px; flex-shrink: 0;
  background: rgba(139,92,246,0.10);
  border: 1px solid rgba(139,92,246,0.25);
  color: #a78bfa; font-size: 1rem; cursor: pointer;
  transition: all 0.15s;
}
.rp-add-btn:hover:not(:disabled) { background: rgba(139,92,246,0.22); }
.rp-add-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.rp-custom-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
.rp-custom-tag {
  display: flex; align-items: center; gap: 4px;
  font-family: var(--font-mono, monospace);
  font-size: 0.58rem; padding: 2px 6px;
  background: rgba(255,170,0,0.08);
  border: 1px solid rgba(255,170,0,0.20);
  color: rgba(255,220,100,0.80);
}
.rp-custom-tag__del {
  background: none; border: none; color: rgba(255,170,0,0.50);
  cursor: pointer; font-size: 0.75rem; padding: 0; line-height: 1;
}
.rp-custom-tag__del:hover { color: #FFAA00; }

/* ── 目标体重 ─────────────────────────────────────────────────── */
.rp-input-group { display: flex; flex-direction: column; gap: 5px; }
.rp-label {
  font-family: var(--font-mono, monospace);
  font-size: 0.62rem; color: rgba(255,255,255,0.35); letter-spacing: 0.06em;
}
.rp-input {
  background: rgba(139,92,246,0.05);
  border: 1px solid rgba(139,92,246,0.20);
  color: #fff;
  font-family: var(--font-mono, monospace);
  font-size: 0.9rem; font-weight: 600;
  padding: 7px 10px; outline: none; width: 100%; box-sizing: border-box;
  transition: border-color 0.15s;
}
.rp-input:focus { border-color: rgba(139,92,246,0.55); }
.rp-input::placeholder { color: rgba(255,255,255,0.15); }
.rp-diff-hint {
  font-family: var(--font-mono, monospace);
  font-size: 0.65rem; font-weight: 600;
  padding: 4px 8px; margin-top: 4px;
}
.rp-diff-hint--ok   { color: #00ff88; background: rgba(0,255,136,0.06); border: 1px solid rgba(0,255,136,0.15); }
.rp-diff-hint--warn { color: #FFAA00; background: rgba(255,170,0,0.06); border: 1px solid rgba(255,170,0,0.15); }

/* ── 生成按钮 ─────────────────────────────────────────────────── */
.rp-generate-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 11px;
  background: rgba(139,92,246,0.12);
  border: 1px solid rgba(139,92,246,0.35);
  color: #a78bfa;
  font-family: var(--font-mono, monospace);
  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em;
  cursor: pointer;
  clip-path: polygon(6px 0%,100% 0%,100% calc(100% - 6px),calc(100% - 6px) 100%,0% 100%,0% 6px);
  transition: all 0.18s; width: 100%;
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
  animation: spin 0.7s linear infinite; flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 1000px) {
  .rp-form-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 640px) {
  .rp-form-grid { grid-template-columns: 1fr; }
  .rp-summary-grid { grid-template-columns: repeat(2, 1fr); }
  .rp-container { padding: 14px; }
}

/* ── 历史版本按钮 ─────────────────────────────────────────────── */
.rp-action-btn--history {
  background: rgba(139,92,246,0.06);
  border-color: rgba(139,92,246,0.25);
  color: rgba(167,139,250,0.8);
}
.rp-action-btn--history:hover {
  background: rgba(139,92,246,0.12);
  color: #a78bfa;
  box-shadow: 0 0 10px rgba(139,92,246,0.2);
}

/* ── 历史版本抽屉 ─────────────────────────────────────────────── */
.ph-overlay {
  position: fixed;
  inset: 0;
  z-index: 9000;
  background: rgba(0,0,0,0.55);
  display: flex;
  justify-content: flex-end;
}
.ph-drawer {
  width: 420px;
  max-width: 95vw;
  height: 100%;
  background: rgba(10,15,30,0.97);
  border-left: 1px solid rgba(139,92,246,0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.ph-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(139,92,246,0.12);
  flex-shrink: 0;
}
.ph-drawer__title {
  font-family: var(--font-mono, monospace);
  font-size: 0.75rem;
  font-weight: 700;
  color: #a78bfa;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.ph-drawer__close {
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.35);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.15s;
}
.ph-drawer__close:hover { color: #fff; }
.ph-drawer__body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  scrollbar-width: thin;
  scrollbar-color: rgba(139,92,246,0.3) transparent;
}
.ph-empty {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255,255,255,0.3);
  font-size: 0.78rem;
  line-height: 1.8;
}
.ph-empty__sub { font-size: 0.68rem; color: rgba(255,255,255,0.2); }
.ph-list { display: flex; flex-direction: column; gap: 8px; }
.ph-item {
  border: 1px solid rgba(139,92,246,0.15);
  background: rgba(139,92,246,0.04);
  overflow: hidden;
}
.ph-item__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.15s;
}
.ph-item__header:hover { background: rgba(139,92,246,0.08); }
.ph-item__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.ph-item__num {
  font-family: var(--font-mono, monospace);
  font-size: 0.65rem;
  font-weight: 700;
  color: #a78bfa;
  background: rgba(139,92,246,0.12);
  padding: 1px 6px;
}
.ph-item__date {
  font-family: var(--font-mono, monospace);
  font-size: 0.62rem;
  color: rgba(255,255,255,0.4);
}
.ph-item__tag {
  font-size: 0.60rem;
  color: rgba(139,92,246,0.7);
  border: 1px solid rgba(139,92,246,0.2);
  padding: 1px 5px;
}
.ph-item__sport { font-size: 0.85rem; }
.ph-item__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.ph-item__del {
  background: transparent;
  border: none;
  color: rgba(239,68,68,0.4);
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  transition: color 0.15s;
}
.ph-item__del:hover { color: #EF4444; }
.ph-item__chevron {
  stroke: rgba(255,255,255,0.3);
  transition: transform 0.2s;
}
.ph-item__chevron--open { transform: rotate(180deg); }
.ph-item__content {
  padding: 12px 14px;
  border-top: 1px solid rgba(139,92,246,0.1);
  background: rgba(0,0,0,0.2);
}
.ph-tabs { margin-bottom: 8px; }
.ph-tab {
  font-family: var(--font-mono, monospace);
  font-size: 0.60rem;
  color: #a78bfa;
  border-bottom: 1px solid rgba(139,92,246,0.4);
  padding-bottom: 2px;
  letter-spacing: 0.06em;
}
.ph-text {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.65);
  line-height: 1.6;
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
}
.ph-diet-hint {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  font-size: 0.62rem;
  color: rgba(255,255,255,0.25);
  font-style: italic;
}
/* 抽屉动画 */
.drawer-fade-enter-active,
.drawer-fade-leave-active { transition: opacity 0.25s ease; }
.drawer-fade-enter-from,
.drawer-fade-leave-to     { opacity: 0; }
.drawer-fade-enter-active .ph-drawer,
.drawer-fade-leave-active .ph-drawer { transition: transform 0.25s ease; }
.drawer-fade-enter-from .ph-drawer   { transform: translateX(100%); }
.drawer-fade-leave-to .ph-drawer     { transform: translateX(100%); }
/* 展开动画 */
.ph-expand-enter-active,
.ph-expand-leave-active { transition: all 0.2s ease; overflow: hidden; }
.ph-expand-enter-from,
.ph-expand-leave-to     { max-height: 0; opacity: 0; padding-top: 0; padding-bottom: 0; }
</style>
