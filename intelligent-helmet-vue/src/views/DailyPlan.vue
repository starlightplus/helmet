<template>
  <div class="daily-plan">

    <!-- ═══════════════════════════════════════════════════════════
         海报轮播区
    ═══════════════════════════════════════════════════════════ -->
    <section class="carousel-section">
      <div class="carousel-track" :style="{ transform: `translateX(-${carouselIndex * 100}%)` }">

        <!-- 海报 0：骑行 -->
        <div class="carousel-slide" @click="openArticle(0)">
          <div class="poster poster--fitness">
            <img src="/picture/骑行.jpg" class="poster-bg-img" alt="骑行" />
            <div class="poster__overlay"></div>
            <div class="poster__kw">CYCLING</div>
            <div class="poster__title">骑行</div>
            <div class="poster__sub">挑战自我 · 驰骋天地</div>
          </div>
        </div>

        <!-- 海报 1：健身 -->
        <div class="carousel-slide" @click="openArticle(1)">
          <div class="poster poster--diet">
            <img src="/picture/健身.jpg" class="poster-bg-img" alt="健身" />
            <div class="poster__overlay"></div>
            <div class="poster__kw">FITNESS</div>
            <div class="poster__title">健身</div>
            <div class="poster__sub">强健体魄 · 活力生活</div>
          </div>
        </div>

        <!-- 海报 2：合理安排 -->
        <div class="carousel-slide" @click="openArticle(2)">
          <div class="poster poster--food">
            <img src="/picture/合理安排.jpg" class="poster-bg-img" alt="合理安排" />
            <div class="poster__overlay"></div>
            <div class="poster__kw">PLANNING</div>
            <div class="poster__title">合理安排</div>
            <div class="poster__sub">均衡营养 · 科学规划</div>
          </div>
        </div>

      </div>

      <button class="carousel-btn carousel-btn--left" @click.stop="prevSlide" aria-label="上一张">&#8249;</button>
      <button class="carousel-btn carousel-btn--right" @click.stop="nextSlide" aria-label="下一张">&#8250;</button>

      <div class="carousel-dots">
        <span
          v-for="(_, i) in posters"
          :key="i"
          class="dot"
          :class="{ active: carouselIndex === i }"
          @click.stop="goSlide(i)"
        ></span>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         AI 伴骑
    ═══════════════════════════════════════════════════════════ -->
    <section class="card ai-ride-card">
      <h2 class="card-title"><span class="title-bar title-bar--cyan"></span>AI伴骑</h2>

      <!-- 功能介绍（始终显示） -->
      <div class="ai-ride-features">
        <div class="ai-feature-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 6v6l4 2"/></svg>
          <span>您可以自主选择心仪运动方式，灵盔系统会结合个人体重与目标，科学制定分阶段每日运动时长、热量消耗计划。</span>
        </div>
        <div class="ai-feature-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          <span>实时追踪每日运动完成进度，联动食谱打卡数据，实现健康管理全流程闭环</span>
        </div>
        <div class="ai-feature-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
          <span>支持减脂、均衡、增肌三大模式，智能匹配专属每日食谱，每周自动轮换更新</span>
        </div>
      </div>

      <!-- 未规划 -->
      <div v-if="!ridePlanStore.hasPlan" class="ai-ride-empty">
        <p class="ai-ride-empty__tip">制定骑行规划后即可开启以上所有功能</p>
        <button class="btn-primary btn-primary--sm" @click="$emit('go-plan')">立即制定骑行规划 →</button>
      </div>

      <!-- 已规划 -->
      <div v-else class="ai-ride-planned">
        <div class="ai-ride-pills">
          <span class="ai-pill">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 6v6l4 2"/></svg>
            每日骑行 <strong>{{ ridePlanStore.plan.planDailyRideMin }}</strong> 分钟
          </span>
          <span class="ai-pill">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
            每日摄入 <strong>{{ ridePlanStore.plan.planDailyIntake }}</strong> 千卡
          </span>
          <span v-if="ridePlanStore.plan.planTargetWeight" class="ai-pill">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
            目标体重 <strong>{{ ridePlanStore.plan.planTargetWeight }}</strong> kg
          </span>
          <span v-if="ridePlanStore.plan.planWeeks" class="ai-pill">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            周期 <strong>{{ ridePlanStore.plan.planWeeks }}</strong> 周
          </span>
        </div>
        <button class="btn-replan" @click="$emit('go-plan')">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
          查看详细规划
        </button>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         下方上下布局
    ═══════════════════════════════════════════════════════════ -->
    <div class="bottom-stack">

      <!-- ── 每日运动达标区 ── -->
      <section class="card exercise-card">
        <h2 class="card-title"><span class="title-bar"></span>每日运动达标</h2>

        <div v-if="!ridePlanStore.hasPlan" class="empty-state">
          <div class="empty-icon">🚴</div>
          <p class="empty-text">还没有设定骑行规划</p>
          <button class="btn-primary" @click="$emit('go-plan')">去定制您的骑行规划</button>
        </div>

        <div v-else class="exercise-content">
          <div class="target-row">
            <div class="target-item">
              <span class="target-label">今日目标</span>
              <span class="target-val">{{ ridePlanStore.plan.planDailyRideMin }}<em>分钟</em></span>
            </div>
            <div class="target-item">
              <span class="target-label">热量目标</span>
              <span class="target-val">{{ ridePlanStore.plan.planDailyIntake }}<em>千卡</em></span>
            </div>
          </div>

          <div class="rings-row">
            <!-- 时长进度环 -->
            <div class="ring-wrap">
              <svg class="ring-svg" viewBox="0 0 80 80">
                <circle class="ring-bg" cx="40" cy="40" r="36" />
                <circle
                  class="ring-fg ring-time"
                  cx="40" cy="40" r="36"
                  :stroke-dasharray="`${Math.min(timeRatio,1) * 226.2} 226.2`"
                />
              </svg>
              <div class="ring-label">
                <span class="ring-pct">{{ Math.round(Math.min(timeRatio,1) * 100) }}%</span>
                <span class="ring-sub">时长</span>
              </div>
            </div>

            <!-- 热量进度环 -->
            <div class="ring-wrap">
              <svg class="ring-svg" viewBox="0 0 80 80">
                <circle class="ring-bg" cx="40" cy="40" r="36" />
                <circle
                  class="ring-fg ring-kcal"
                  cx="40" cy="40" r="36"
                  :stroke-dasharray="`${Math.min(kcalRatio,1) * 226.2} 226.2`"
                />
              </svg>
              <div class="ring-label">
                <span class="ring-pct">{{ Math.round(Math.min(kcalRatio,1) * 100) }}%</span>
                <span class="ring-sub">热量</span>
              </div>
            </div>

            <!-- 今日完成数据 -->
            <div class="today-stats">
              <div class="stat-row">
                <span class="stat-k">距离</span>
                <span class="stat-v">{{ todayStats.distanceKm.toFixed(2) }}<em> km</em></span>
              </div>
              <div class="stat-row">
                <span class="stat-k">时长</span>
                <span class="stat-v">{{ todayStats.durationMin.toFixed(0) }}<em> min</em></span>
              </div>
              <div class="stat-row">
                <span class="stat-k">热量</span>
                <span class="stat-v">{{ todayStats.kcal.toFixed(0) }}<em> kcal</em></span>
              </div>
            </div>
          </div>

          <p class="exercise-comment" :class="{ achieved: timeRatio >= 1 && kcalRatio >= 1 }">
            <template v-if="timeRatio >= 1 && kcalRatio >= 1">
              今日目标已达成！🎉
            </template>
            <template v-else>
              今日已完成 {{ todayStats.durationMin.toFixed(0) }} 分钟骑行，目标 {{ ridePlanStore.plan.planDailyRideMin }} 分钟，加油！
            </template>
          </p>
        </div>
      </section>

      <!-- ── 今日食谱区 ── -->
      <section class="card recipe-card">
        <h2 class="card-title"><span class="title-bar"></span>今日食谱</h2>

        <div v-if="!ridePlanStore.hasPlan" class="empty-state">
          <div class="empty-icon">🥗</div>
          <p class="empty-text">设定规划后自动生成今日食谱</p>
        </div>

        <div v-else class="recipe-content">
          <div class="recipe-type-badge">{{ recipeTypeName }}</div>

          <div class="meals-list">
            <div v-for="meal in ['breakfast','lunch','dinner']" :key="meal" class="meal-section">
              <!-- 餐次标题行 -->
              <div class="meal-header">
                <span class="meal-header__name">{{ mealLabel[meal] }}</span>
                <span class="meal-header__checkcnt">
                  {{ checkedCount(meal) }}/{{ currentMeals[meal].length }} 已打卡
                </span>
                <button class="swap-btn" @click="swapMeal(meal)" title="换一组搭配">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M1 4v6h6M23 20v-6h-6"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                  </svg>
                  换搭配
                </button>
              </div>
              <!-- 横向菜品行 -->
              <div class="dish-row">
                <div
                  v-for="dish in currentMeals[meal]"
                  :key="dish.name"
                  class="dish-card"
                  :class="{ 'dish-card--checked': isChecked(meal, dish.name) }"
                  @click="toggleCheck(meal, dish.name)"
                >
                  <div class="dish-img-wrap">
                    <img
                      v-if="dish.img"
                      :src="dish.img"
                      :alt="dish.name"
                      class="dish-img"
                      @error="e => e.target.style.display='none'"
                    />
                    <div class="dish-img-placeholder" :data-name="dish.name.slice(0,1)">
                      {{ dish.name.slice(0, 1) }}
                    </div>
                  </div>
                  <span class="dish-name">{{ dish.name }}</span>
                  <span class="dish-kcal">{{ dish.kcal }} kcal</span>
                </div>
              </div>
            </div>
          </div>

          <div class="recipe-total" :class="{ 'recipe-total--done': allDone }">
            今日总热量：<strong>{{ currentTotalKcal }}</strong> kcal
            <span class="recipe-target">/ 目标 {{ ridePlanStore.plan?.planDailyIntake }} kcal</span>
            <span v-if="allDone" class="recipe-alldone-tag">✓ 今日全勤</span>
          </div>

          <!-- 打卡统计可视化 -->
          <div class="checkin-stats">
            <div class="checkin-stats__header">
              <span class="checkin-stats__title">打卡统计</span>
              <span class="checkin-stats__total">
                累计 <strong>{{ totalCheckinDays }}</strong> 天全勤
              </span>
            </div>
            <!-- 最近30天热力图 -->
            <div class="checkin-heatmap">
              <div
                v-for="d in heatmapDays"
                :key="d.label"
                class="heatmap-cell"
                :class="{
                  'heatmap-cell--full': d.level === 3,
                  'heatmap-cell--partial': d.level === 2,
                  'heatmap-cell--low': d.level === 1,
                  'heatmap-cell--today': d.isToday
                }"
                :title="d.label + (d.level===3?' 全勤':d.level===2?' 部分打卡':d.level===1?' 少量打卡':' 未打卡')"
              ></div>
            </div>
            <div class="checkin-legend">
              <span class="legend-item"><span class="legend-dot legend-dot--empty"></span>未打卡</span>
              <span class="legend-item"><span class="legend-dot legend-dot--low"></span>少量</span>
              <span class="legend-item"><span class="legend-dot legend-dot--partial"></span>部分</span>
              <span class="legend-item"><span class="legend-dot legend-dot--full"></span>全勤</span>
            </div>
          </div>
        </div>
      </section>
    </div><!-- /bottom-stack -->

    <!-- ═══════════════════════════════════════════════════════════
         文章弹窗
    ═══════════════════════════════════════════════════════════ -->
    <Transition name="modal-fade">
      <div v-if="articleModal.visible" class="modal-overlay" @click.self="closeArticle">
        <div class="modal-box" role="dialog" aria-modal="true">
          <button class="modal-close" @click="closeArticle" aria-label="关闭">✕</button>
          <h3 class="modal-title">{{ articleModal.title }}</h3>
          <div class="modal-body">{{ articleModal.content }}</div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRidePlanStore } from '@/stores/rideplan.js'
import { useRideHistoryStore } from '@/stores/rideHistory.js'

// ── Emits ──────────────────────────────────────────────────────────────────
const emit = defineEmits(['go-plan'])

// ── Stores ─────────────────────────────────────────────────────────────────
const ridePlanStore = useRidePlanStore()
const rideHistoryStore = useRideHistoryStore()

// ══════════════════════════════════════════════════════════════════════════
// 海报 & 文章数据
// ══════════════════════════════════════════════════════════════════════════
const posters = [
  { title: '骑行' },
  { title: '健身' },
  { title: '合理安排' }
]

const articles = [
  {
    title: '骑行的健康收益',
    content: `骑行是一项全身性的低冲击有氧运动，对膝关节和腰椎的压力远小于跑步，适合各年龄段人群长期坚持。每周骑行150分钟以上，可将心脏病风险降低约50%，同时显著改善肺活量和心肺耐力。\n\n骑行还能促进大脑分泌多巴胺和血清素，有效缓解焦虑与抑郁情绪。户外骑行让人亲近自然，减少屏幕暴露，对精神健康大有裨益。长期骑行者平均寿命比同龄人长4–6年。无论是清晨的公园还是傍晚的滨江大道，骑行都是最简单、最高效的投资健康方式之一。`
  },
  {
    title: '健身的重要性',
    content: `规律健身不仅能塑造体型，更是预防慢性疾病的最有效手段之一。研究表明，每周进行150分钟中等强度运动，可将2型糖尿病风险降低30%，心血管疾病风险降低35%，同时显著改善骨密度和肌肉质量。\n\n健身还能提升基础代谢率，让身体在休息时也能持续燃烧热量。力量训练与有氧运动相结合，是最科学的健身方式。从每天20分钟开始，循序渐进地增加强度，配合充足的蛋白质摄入和充分的睡眠恢复，你会在21天内感受到明显的体能提升。`
  },
  {
    title: '合理安排运动与饮食',
    content: `科学的运动计划离不开合理的饮食配合。运动前1–2小时摄入适量碳水化合物，为肌肉提供充足糖原；运动后30分钟内补充蛋白质，促进肌肉修复与合成。\n\n每日三餐应保持规律，早餐提供全天30%的热量，午餐40%，晚餐30%。避免运动后立即大量进食，也不要空腹进行高强度训练。充足的水分补充同样关键——骑行每小时至少补水500ml。\n\n将运动时间固定在每天同一时段，配合智能头盔的数据记录，让每一次骑行都有据可查，让健康管理变得简单而高效。`
  }
]

// ══════════════════════════════════════════════════════════════════════════
// 轮播逻辑
// ══════════════════════════════════════════════════════════════════════════
const carouselIndex = ref(0)
let carouselTimer = null

function prevSlide() {
  carouselIndex.value = (carouselIndex.value - 1 + posters.length) % posters.length
  resetTimer()
}
function nextSlide() {
  carouselIndex.value = (carouselIndex.value + 1) % posters.length
  resetTimer()
}
function goSlide(i) {
  carouselIndex.value = i
  resetTimer()
}
function resetTimer() {
  clearInterval(carouselTimer)
  carouselTimer = setInterval(nextSlide, 4000)
}

// ══════════════════════════════════════════════════════════════════════════
// 文章弹窗
// ══════════════════════════════════════════════════════════════════════════
const articleModal = reactive({ visible: false, title: '', content: '' })

function openArticle(i) {
  articleModal.title = articles[i].title
  articleModal.content = articles[i].content
  articleModal.visible = true
}
function closeArticle() {
  articleModal.visible = false
}

// ══════════════════════════════════════════════════════════════════════════
// 今日骑行汇总
// ══════════════════════════════════════════════════════════════════════════
const todayStats = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTs = today.getTime()

  let distanceKm = 0
  let durationMin = 0
  let kcal = 0

  for (const ride of rideHistoryStore.rides) {
    const rideDate = new Date(ride.startTime)
    rideDate.setHours(0, 0, 0, 0)
    if (rideDate.getTime() !== todayTs) continue
    distanceKm  += Number(ride.distanceKm  || 0)
    durationMin += Number(ride.durationMin || ride.durationSec / 60 || 0)
    kcal        += Number(ride.kcal        || ride.calories || 0)
  }
  return { distanceKm, durationMin, kcal }
})

const timeRatio = computed(() => {
  if (!ridePlanStore.hasPlan) return 0
  const goal = Number(ridePlanStore.plan.planDailyRideMin) || 1
  return todayStats.value.durationMin / goal
})

const kcalRatio = computed(() => {
  if (!ridePlanStore.hasPlan) return 0
  const goal = Number(ridePlanStore.plan.planDailyIntake) || 1
  return todayStats.value.kcal / goal
})

// ══════════════════════════════════════════════════════════════════════════
// 食谱数据（7套预设）
// ══════════════════════════════════════════════════════════════════════════

// 图片路径辅助（有图用图，无图用空字符串）
const F = (name) => {
  const map = {
    '燕麦粥': '/food/燕麦粥.jpg', '牛奶': '/food/牛奶.jpg', '水煮蛋': '/food/水煮蛋.jpg',
    '鸡胸肉沙拉': '/food/鸡胸肉沙拉.jpg', '糙米饭': '/food/糙米饭.jpg',
    '清蒸鱼': '/food/清蒸鱼.jpg', '炒西兰花': '/food/炒西兰花.jpg', '紫菜汤': '/food/紫菜汤.jpg',
    '豆浆': '/food/豆浆.jpg', '全麦吐司': '/food/全麦吐司.jpg',
    '虾仁豆腐': '/food/虾仁豆腐.jpg', '杂粮饭': '/food/杂粮饭.jpg',
    '番茄蛋花汤': '/food/番茄蛋花汤.jpg', '蒸红薯': '/food/蒸红薯.png', '凉拌黄瓜': '/food/凉拌黄瓜.jpeg',
    '蒸蛋羹': '/food/蒸蛋羹.jpeg', '苹果': '/food/苹果.jpg',
    '牛肉时蔬锅': '/food/牛肉时蔬锅.jpg', '荞麦面': '/food/荞麦面.jpg',
    '清炒菠菜': '/food/清炒菠菜.jpg', '清蒸鸡腿': '/food/清蒸鸡腿.jpg', '冬瓜汤': '/food/冬瓜汤.jpg',
    '紫薯粥': '/food/紫薯粥.jpg', '卤蛋': '/food/卤蛋.jpg',
    '三文鱼饭': '/food/三文鱼饭.jpg', '拌木耳': '/food/拌木耳.jpg',
    '豆腐白菜汤': '/food/豆腐白菜汤.jpg', '蒸南瓜': '/food/蒸南瓜.jpg', '清炒时蔬': '/food/清炒时蔬.jpg',
    '全麦面包': '/food/全麦面包.jpg',
    '芦笋鸡胸套餐': '/food/芦笋鸡胸套餐.jpg', '鲜蘑菇汤': '/food/鲜蘑菇汤.jpg', '清蒸虾': '/food/清蒸虾.jpg',
    '杂粮粥': '/food/杂粮粥.jpg', '茶叶蛋': '/food/茶叶蛋.jpg',
    '清蒸大黄鱼': '/food/清蒸大黄鱼.jpg', '炒菜心': '/food/炒菜心.jpg',
    '番茄炒鸡蛋': '/food/番茄炒鸡蛋.jpg',
    '土豆炖牛肉': '/food/土豆炖牛肉.jpg',
    '皮蛋瘦肉粥': '/food/皮蛋瘦肉粥.jpg',
    '红烧牛腩': '/food/红烧牛腩.jpg', '猪里脊': '/food/猪里脊.jpg',
    '卤牛肉': '/food/卤牛肉.jpg', '炒时蔬': '/food/炒时蔬.jpg',
    '豆腐': '/food/豆腐.jpg',
  }
  return map[name] || ''
}
const D = (name, kcal) => ({ name, kcal, img: F(name) })

// 减脂型（< 1600 kcal）— 5天轮换，第6天复用第1天
const DIET_FATBURN = [
  // 第1天
  {
    breakfast: [D('燕麦粥', 150), D('牛奶', 110), D('水煮蛋', 80)],
    lunch:     [D('鸡胸肉沙拉', 280), D('糙米饭', 180)],
    dinner:    [D('清蒸鱼', 200), D('炒西兰花', 80), D('紫菜汤', 30)],
    totalKcal: 1110
  },
  // 第2天
  {
    breakfast: [D('豆浆', 80), D('全麦吐司', 140), D('水煮蛋', 80)],
    lunch:     [D('虾仁豆腐', 260), D('杂粮饭', 180)],
    dinner:    [D('番茄蛋花汤', 120), D('蒸红薯', 130), D('凉拌黄瓜', 40)],
    totalKcal: 1030
  },
  // 第3天
  {
    breakfast: [D('牛奶', 110), D('蒸蛋羹', 120), D('苹果', 80)],
    lunch:     [D('牛肉时蔬锅', 320), D('荞麦面', 170)],
    dinner:    [D('清炒菠菜', 70), D('清蒸鸡腿', 200), D('冬瓜汤', 40)],
    totalKcal: 1110
  },
  // 第4天
  {
    breakfast: [D('豆浆', 80), D('紫薯粥', 130), D('卤蛋', 80)],
    lunch:     [D('三文鱼饭', 380), D('拌木耳', 60)],
    dinner:    [D('豆腐白菜汤', 130), D('蒸南瓜', 90), D('清炒时蔬', 80)],
    totalKcal: 1030
  },
  // 第5天
  {
    breakfast: [D('牛奶', 110), D('全麦面包', 130), D('水煮蛋', 80)],
    lunch:     [D('芦笋鸡胸套餐', 300), D('糙米饭', 180)],
    dinner:    [D('鲜蘑菇汤', 60), D('清蒸虾', 150), D('炒西兰花', 80)],
    totalKcal: 1090
  }
]

// 均衡型（1600–2200 kcal）— 5天轮换，第6天复用第1天
const DIET_BALANCE = [
  // 第1天
  {
    breakfast: [D('牛奶', 110), D('全麦吐司', 140), D('水煮蛋', 80)],
    lunch:     [D('糙米饭', 220), D('清蒸鸡腿', 320), D('炒西兰花', 90)],
    dinner:    [D('番茄炒鸡蛋', 200), D('杂粮饭', 180), D('紫菜汤', 40)],
    totalKcal: 1380
  },
  // 第2天
  {
    breakfast: [D('豆浆', 80), D('杂粮粥', 160), D('茶叶蛋', 80)],
    lunch:     [D('糙米饭', 220), D('清蒸大黄鱼', 300), D('炒菜心', 80)],
    dinner:    [D('番茄蛋花汤', 120), D('蒸红薯', 130), D('清炒菠菜', 70)],
    totalKcal: 1240
  },
  // 第3天
  {
    breakfast: [D('牛奶', 110), D('燕麦粥', 150), D('水煮蛋', 80)],
    lunch:     [D('糙米饭', 220), D('土豆炖牛肉', 380), D('炒西兰花', 80)],
    dinner:    [D('清蒸鱼', 220), D('蒸红薯', 130), D('凉拌黄瓜', 40)],
    totalKcal: 1410
  },
  // 第4天
  {
    breakfast: [D('豆浆', 80), D('全麦面包', 130), D('卤蛋', 80)],
    lunch:     [D('糙米饭', 220), D('虾仁豆腐', 260), D('炒菜心', 80)],
    dinner:    [D('皮蛋瘦肉粥', 260), D('凉拌黄瓜', 40), D('清炒菠菜', 70)],
    totalKcal: 1220
  },
  // 第5天
  {
    breakfast: [D('牛奶', 110), D('蒸蛋羹', 120), D('苹果', 80)],
    lunch:     [D('糙米饭', 220), D('清蒸鸡腿', 320), D('拌木耳', 60)],
    dinner:    [D('豆腐白菜汤', 130), D('清蒸虾', 150), D('蒸南瓜', 90)],
    totalKcal: 1280
  }
]

// 增肌型（> 2200 kcal）— 5天轮换，第6天复用第1天
const DIET_MUSCLE = [
  // 第1天
  {
    breakfast: [D('牛奶', 220), D('燕麦粥', 200), D('水煮蛋', 160)],
    lunch:     [D('糙米饭', 400), D('红烧牛腩', 480), D('炒西兰花', 80)],
    dinner:    [D('清蒸鸡腿', 320), D('杂粮饭', 220), D('番茄蛋花汤', 120)],
    totalKcal: 2200
  },
  // 第2天
  {
    breakfast: [D('豆浆', 160), D('全麦吐司', 280), D('水煮蛋', 160)],
    lunch:     [D('糙米饭', 400), D('清蒸大黄鱼', 360), D('炒菜心', 80)],
    dinner:    [D('牛肉时蔬锅', 380), D('杂粮饭', 300), D('紫菜汤', 40)],
    totalKcal: 2160
  },
  // 第3天
  {
    breakfast: [D('牛奶', 220), D('杂粮粥', 200), D('卤蛋', 160)],
    lunch:     [D('糙米饭', 400), D('猪里脊', 420), D('炒西兰花', 80)],
    dinner:    [D('三文鱼饭', 420), D('蒸蛋羹', 120), D('清炒时蔬', 80)],
    totalKcal: 2100
  },
  // 第4天
  {
    breakfast: [D('豆浆', 160), D('全麦面包', 260), D('水煮蛋', 160)],
    lunch:     [D('糙米饭', 400), D('卤牛肉', 460), D('炒时蔬', 80)],
    dinner:    [D('清蒸鸡腿', 320), D('杂粮饭', 300), D('冬瓜汤', 60)],
    totalKcal: 2200
  },
  // 第5天
  {
    breakfast: [D('牛奶', 220), D('燕麦粥', 200), D('茶叶蛋', 160)],
    lunch:     [D('糙米饭', 400), D('清蒸大黄鱼', 360), D('豆腐', 120)],
    dinner:    [D('牛肉时蔬锅', 380), D('杂粮饭', 220), D('番茄炒鸡蛋', 180)],
    totalKcal: 2240
  }
]

// ── 食谱匹配逻辑 ──────────────────────────────────────────────────────────
const mealLabel = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' }

function getRecipeSet() {
  if (!ridePlanStore.hasPlan) return DIET_BALANCE
  const intake = Number(ridePlanStore.plan.planDailyIntake) || 1800
  if (intake < 1600) return DIET_FATBURN
  if (intake <= 2200) return DIET_BALANCE
  return DIET_MUSCLE
}

const recipeTypeName = computed(() => {
  if (!ridePlanStore.hasPlan) return ''
  const intake = Number(ridePlanStore.plan.planDailyIntake) || 1800
  if (intake < 1600) return '减脂型食谱'
  if (intake <= 2200) return '均衡型食谱'
  return '增肌型食谱'
})

// 按周轮换：5天一循环（第6天复用第1天，即 idx % 5）
function getWeeklyRecipeIndex() {
  const key = 'helmet_recipe_week_index'
  const now = new Date()
  // ISO 周数
  const jan4 = new Date(now.getFullYear(), 0, 4)
  const weekNum = Math.ceil((((now - jan4) / 86400000) + jan4.getDay() + 1) / 7)
  const stored = JSON.parse(localStorage.getItem(key) || 'null')
  if (stored && stored.weekNum === weekNum) return stored.idx % 5
  // 新的一周，切换下一套
  const prevIdx = stored ? stored.idx : 0
  const newIdx = (prevIdx + 1) % 5
  localStorage.setItem(key, JSON.stringify({ weekNum, idx: newIdx }))
  return newIdx
}

const todayRecipe = computed(() => {
  const set = getRecipeSet()
  const idx = getWeeklyRecipeIndex()
  return set[idx]
})

// ── 换搭配：每餐独立维护当前替换套（在同食谱类型的5套里循环） ──────────────
const mealSwapIdx = reactive({ breakfast: 0, lunch: 0, dinner: 0 })

// 初始化各餐用 todayRecipe 的菜单，换搭配时从其他4套里轮换
const currentMeals = computed(() => {
  const set = getRecipeSet()
  const baseIdx = getWeeklyRecipeIndex()
  const result = {}
  for (const meal of ['breakfast', 'lunch', 'dinner']) {
    const offset = mealSwapIdx[meal]
    const idx = (baseIdx + offset) % set.length
    result[meal] = set[idx][meal]
  }
  return result
})

const currentTotalKcal = computed(() => {
  return ['breakfast', 'lunch', 'dinner'].reduce((sum, meal) => {
    return sum + currentMeals.value[meal].reduce((s, d) => s + d.kcal, 0)
  }, 0)
})

function swapMeal(meal) {
  mealSwapIdx[meal] = (mealSwapIdx[meal] + 1) % 5
}

// 食谱类型切换时重置换搭配索引
watch(recipeTypeName, () => {
  mealSwapIdx.breakfast = 0
  mealSwapIdx.lunch = 0
  mealSwapIdx.dinner = 0
})

// ══════════════════════════════════════════════════════════════════════════
// 打卡系统
// ══════════════════════════════════════════════════════════════════════════
const CHECKIN_KEY = 'helmet_meal_checkin'

// 存储结构：{ 'YYYY-MM-DD': { breakfast: ['菜名',...], lunch: [...], dinner: [...] } }
function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function loadCheckin() {
  try { return JSON.parse(localStorage.getItem(CHECKIN_KEY) || '{}') } catch { return {} }
}
function saveCheckin(data) {
  localStorage.setItem(CHECKIN_KEY, JSON.stringify(data))
}

const checkinData = ref(loadCheckin())

function isChecked(meal, dishName) {
  return (checkinData.value[todayKey()]?.[meal] || []).includes(dishName)
}

function checkedCount(meal) {
  return (checkinData.value[todayKey()]?.[meal] || []).length
}

function toggleCheck(meal, dishName) {
  const key = todayKey()
  const data = { ...checkinData.value }
  if (!data[key]) data[key] = { breakfast: [], lunch: [], dinner: [] }
  const list = [...(data[key][meal] || [])]
  const idx = list.indexOf(dishName)
  if (idx >= 0) {
    list.splice(idx, 1)
  } else {
    list.push(dishName)
  }
  data[key][meal] = list
  checkinData.value = data
  saveCheckin(data)
}

// 全天全打卡 computed（供模板和热力图使用）
const allDone = computed(() => {
  const key = todayKey()
  const today = checkinData.value[key]
  if (!today) return false
  return ['breakfast','lunch','dinner'].every(m => {
    return (today[m] || []).length >= currentMeals.value[m].length
  })
})

// 最近30天热力图数据
const heatmapDays = computed(() => {
  const data = checkinData.value
  const days = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    const entry = data[key]
    let checked = 0
    let total = 0
    if (entry) {
      for (const m of ['breakfast','lunch','dinner']) {
        checked += (entry[m] || []).length
        // 用当天食谱总菜数估算（简化：固定每餐3道）
        total += 3
      }
    } else {
      total = 9
    }
    const ratio = total > 0 ? checked / total : 0
    days.push({
      label: key,
      level: ratio === 0 ? 0 : ratio < 0.4 ? 1 : ratio < 1 ? 2 : 3,
      isToday: i === 0
    })
  }
  return days
})

// 累计全勤天数（三餐都有打卡记录的天）
const totalCheckinDays = computed(() => {
  const data = checkinData.value
  return Object.values(data).filter(day =>
    ['breakfast','lunch','dinner'].every(m => (day[m] || []).length > 0)
  ).length
})

// ══════════════════════════════════════════════════════════════════════════
// 生命周期
// ══════════════════════════════════════════════════════════════════════════
onMounted(() => {
  ridePlanStore.fetchPlan()
  rideHistoryStore.loadFromStorage()
  resetTimer()
})

onUnmounted(() => {
  clearInterval(carouselTimer)
})
</script>

<style scoped>
/* ══════════════════════════════════════════════════════════════════
   基础布局
══════════════════════════════════════════════════════════════════ */
.daily-plan {
  min-height: 100vh;
  background: #050505;
  color: #e2e8f0;
  font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
  padding: 0 0 40px;
  box-sizing: border-box;
}

/* ══════════════════════════════════════════════════════════════════
   轮播区
══════════════════════════════════════════════════════════════════ */
.carousel-section {
  position: relative;
  width: 100%;
  height: 320px;
  overflow: hidden;
  background: #0a0f1a;
  border-bottom: 1px solid #1e3a4a;
  flex-shrink: 0;
}

.carousel-track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.carousel-slide {
  flex: 0 0 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  user-select: none;
  position: relative;
  overflow: hidden;
}

/* ── CSS 海报 ── */
.poster {
  width: 100%; height: 100%;
  position: relative;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  overflow: hidden;
}

.poster-bg-img {
  position: absolute;
  inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  object-position: center;
  filter: brightness(0.55) saturate(1.1);
  transition: filter 0.3s;
}
.carousel-slide:hover .poster-bg-img {
  filter: brightness(0.7) saturate(1.3);
}

.poster__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 60%, transparent 100%);
}

.poster__kw {
  position: relative; z-index: 1;
  font-size: 9px; font-weight: 700; letter-spacing: 0.22em; opacity: 0.75;
  color: #fff;
}

.poster__title {
  position: relative; z-index: 1;
  font-size: 38px; font-weight: 900; line-height: 1; margin: 4px 0 6px;
  color: #fff;
  text-shadow: 0 2px 12px rgba(0,0,0,0.6);
}

.poster__sub {
  position: relative; z-index: 1;
  font-size: 12px; color: rgba(255,255,255,0.7); letter-spacing: 0.06em;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  background: rgba(10, 20, 35, 0.75);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #38bdf8;
  font-size: 26px;
  line-height: 1;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, border-color 0.2s;
  z-index: 10;
  padding: 0;
}
.carousel-btn:hover {
  background: rgba(56, 189, 248, 0.18);
  border-color: #38bdf8;
}
.carousel-btn--left  { left: 12px; }
.carousel-btn--right { right: 12px; }

.carousel-dots {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(56, 189, 248, 0.3);
  cursor: pointer;
  transition: background 0.25s, transform 0.25s;
}
.dot.active {
  background: #38bdf8;
  transform: scale(1.3);
  box-shadow: 0 0 6px rgba(56, 189, 248, 0.7);
}

/* ══════════════════════════════════════════════════════════════════
   AI 伴骑卡片
══════════════════════════════════════════════════════════════════ */
.ai-ride-card {
  margin: 20px 24px 20px;
}

/* 功能介绍列表 */
.ai-ride-features {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(56,189,248,0.1);
}
.ai-feature-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  color: white;
  line-height: 1.5;
}
.ai-feature-item svg { flex-shrink: 0; margin-top: 1px; }

/* 未规划底部 */
.ai-ride-empty {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}
.ai-ride-empty__tip {
  font-size: 12px;
  color: white;
  margin: 0;
}

/* 已规划底部 */
.ai-ride-planned {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.ai-ride-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}
.ai-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: rgba(56,189,248,0.06);
  border: 1px solid rgba(56,189,248,0.18);
  border-radius: 20px;
  font-size: 11px;
  color: rgba(56,189,248,0.8);
}
.ai-pill strong { color: #38bdf8; }
.ai-pill svg { stroke: rgba(56,189,248,0.6); flex-shrink: 0; }

.btn-replan {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 14px;
  background: transparent;
  border: 1px solid rgba(56,189,248,0.25);
  color: rgba(56,189,248,0.7);
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.btn-replan:hover {
  background: rgba(56,189,248,0.08);
  color: #38bdf8;
  border-color: #38bdf8;
}

.btn-primary--sm {
  padding: 5px 14px;
  font-size: 11px;
}

/* ══════════════════════════════════════════════════════════════════
   下方上下布局
══════════════════════════════════════════════════════════════════ */
.bottom-stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 24px 20px;
  box-sizing: border-box;
}

/* ══════════════════════════════════════════════════════════════════
   卡片通用
══════════════════════════════════════════════════════════════════ */
.card {
  background: #0a0f1a;
  border: 1px solid #1e3a4a;
  border-radius: 10px;
  padding: 18px 20px 20px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}
.card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #38bdf8, transparent);
  opacity: 0.5;
}

.card-title {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: white;
  text-transform: uppercase;
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.title-bar {
  display: inline-block;
  width: 3px;
  height: 14px;
  background: #38bdf8;
  border-radius: 2px;
  box-shadow: 0 0 6px rgba(56, 189, 248, 0.7);
}

/* ══════════════════════════════════════════════════════════════════
   空状态
══════════════════════════════════════════════════════════════════ */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 0;
}
.empty-icon { font-size: 40px; }
.empty-text {
  font-size: 13px;
  color: #64748b;
  margin: 0;
  letter-spacing: 0.04em;
}
.btn-primary {
  margin-top: 4px;
  padding: 8px 20px;
  background: transparent;
  border: 1px solid #38bdf8;
  color: #38bdf8;
  font-family: inherit;
  font-size: 13px;
  letter-spacing: 0.06em;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
}
.btn-primary:hover {
  background: rgba(56, 189, 248, 0.12);
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
}

/* ══════════════════════════════════════════════════════════════════
   运动卡片内容
══════════════════════════════════════════════════════════════════ */
.exercise-content { display: flex; flex-direction: column; gap: 14px; }

.target-row {
  display: flex;
  gap: 24px;
}
.target-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.target-label {
  font-size: 11px;
  color: #64748b;
  letter-spacing: 0.06em;
}
.target-val {
  font-size: 20px;
  font-weight: 700;
  color: #38bdf8;
  line-height: 1.2;
}
.target-val em {
  font-size: 11px;
  font-style: normal;
  color: #94a3b8;
  margin-left: 3px;
}

.rings-row {
  display: flex;
  align-items: center;
  gap: 18px;
}

.ring-wrap {
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}
.ring-svg {
  width: 80px;
  height: 80px;
  transform: rotate(-90deg);
}
.ring-bg {
  fill: none;
  stroke: #1e3a4a;
  stroke-width: 5;
}
.ring-fg {
  fill: none;
  stroke-width: 5;
  stroke-linecap: round;
  transition: stroke-dasharray 0.6s ease;
}
.ring-time { stroke: #38bdf8; filter: drop-shadow(0 0 4px rgba(56,189,248,0.5)); }
.ring-kcal { stroke: #f59e0b; filter: drop-shadow(0 0 4px rgba(245,158,11,0.5)); }

.ring-label {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.ring-pct {
  font-size: 14px;
  font-weight: 700;
  color: #e2e8f0;
  line-height: 1;
}
.ring-sub {
  font-size: 10px;
  color: #64748b;
  margin-top: 2px;
}

.today-stats {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}
.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 12px;
}
.stat-k { color: #64748b; }
.stat-v { color: #e2e8f0; font-weight: 600; }
.stat-v em { font-style: normal; color: #64748b; font-size: 10px; }

.exercise-comment {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
  padding: 8px 12px;
  background: rgba(56, 189, 248, 0.05);
  border-left: 2px solid #38bdf8;
  border-radius: 0 4px 4px 0;
  line-height: 1.6;
}
.exercise-comment.achieved {
  border-left-color: #22c55e;
  background: rgba(34, 197, 94, 0.06);
  color: #22c55e;
}

/* ══════════════════════════════════════════════════════════════════
   食谱卡片内容
══════════════════════════════════════════════════════════════════ */
.recipe-content { display: flex; flex-direction: column; gap: 14px; }

.recipe-type-badge {
  display: inline-block;
  padding: 3px 10px;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 20px;
  font-size: 11px;
  color: #38bdf8;
  letter-spacing: 0.08em;
  align-self: flex-start;
}

.meals-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
}

/* 三餐纵向列表 */
.meals-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.meal-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meal-col { display: flex; flex-direction: column; gap: 8px; }

.meal-header {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding-bottom: 6px;
  border-bottom: 1px solid #1e3a4a;
  display: flex;
  align-items: center;
  gap: 8px;
}

.swap-btn {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px;
  background: transparent;
  border: 1px solid rgba(56,189,248,0.25);
  color: rgba(56,189,248,0.6);
  font-family: inherit;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.06em;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
  line-height: 1;
  text-transform: none;
}
.swap-btn:hover {
  background: rgba(56,189,248,0.1);
  color: #38bdf8;
  border-color: #38bdf8;
}

.dish-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  background: #050d18;
  border: 1px solid #162030;
  border-radius: 6px;
}

.dish-img-wrap {
  width: 64px;
  height: 64px;
  background: #0d1f30;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #1e3a4a;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
}
.dish-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
  position: relative;
  z-index: 1;
}

/* 食物占位卡：图片不存在或加载失败时显示 */
.dish-img-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  font-weight: 700;
  color: rgba(56,189,248,0.7);
  background: linear-gradient(135deg, #0d1f30 0%, #0f2a3f 100%);
  border-radius: 6px;
  letter-spacing: 0;
  user-select: none;
  z-index: 0;
}
/* 当图片加载成功时，占位层藏在图片后面（z-index 控制） */
.dish-name {
  font-size: 11px;
  color: #cbd5e1;
  text-align: center;
  line-height: 1.4;
  word-break: break-all;
}
.dish-kcal {
  font-size: 10px;
  color: #f59e0b;
  letter-spacing: 0.04em;
}

.recipe-total {
  font-size: 12px;
  color: #94a3b8;
  padding: 8px 12px;
  background: rgba(245,158,11,0.05);
  border-left: 2px solid #f59e0b;
  border-radius: 0 4px 4px 0;
  margin-top: 4px;
  transition: background 0.4s, border-color 0.4s;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.recipe-total strong { color: #f59e0b; transition: color 0.4s; }
.recipe-target { color: #64748b; }

.recipe-total--done {
  background: rgba(34,197,94,0.08);
  border-left-color: #22c55e;
}
.recipe-total--done strong { color: #22c55e; }

.recipe-alldone-tag {
  font-size: 10px;
  font-weight: 700;
  color: #22c55e;
  background: rgba(34,197,94,0.12);
  border: 1px solid rgba(34,197,94,0.35);
  border-radius: 10px;
  padding: 1px 8px;
  letter-spacing: 0.04em;
}

/* 横向菜品行 — grid 自动填满，不留空档 */
.dish-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
  gap: 10px;
}

.dish-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 6px;
  background: #050d18;
  border: 1px solid #162030;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
  min-width: 80px;
  user-select: none;
}
.dish-card:hover {
  border-color: rgba(56,189,248,0.3);
  transform: translateY(-2px);
}
.dish-card--checked .dish-name { color: #22c55e; }

.meal-header__name { flex: 1; }
.meal-header__checkcnt {
  font-size: 9px;
  color: rgba(34,197,94,0.7);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: none;
}

/* 打卡统计 */
.checkin-stats {
  margin-top: 16px;
  padding: 14px;
  background: rgba(56,189,248,0.03);
  border: 1px solid rgba(56,189,248,0.1);
  border-radius: 8px;
}
.checkin-stats__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.checkin-stats__title {
  font-size: 11px;
  font-weight: 700;
  color: #38bdf8;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.checkin-stats__total {
  font-size: 11px;
  color: #64748b;
}
.checkin-stats__total strong { color: #22c55e; }

.checkin-heatmap {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.heatmap-cell {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  background: rgba(255,255,255,0.06);
  transition: transform 0.15s;
  cursor: default;
}
.heatmap-cell:hover { transform: scale(1.3); }
.heatmap-cell--low     { background: rgba(34,197,94,0.2); }
.heatmap-cell--partial { background: rgba(34,197,94,0.5); }
.heatmap-cell--full    { background: #22c55e; box-shadow: 0 0 5px rgba(34,197,94,0.5); }
.heatmap-cell--today   { outline: 1.5px solid #38bdf8; outline-offset: 1px; }

.checkin-legend {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  align-items: center;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 9px;
  color: #64748b;
}
.legend-dot {
  width: 10px; height: 10px; border-radius: 2px;
}
.legend-dot--empty   { background: rgba(255,255,255,0.06); }
.legend-dot--low     { background: rgba(34,197,94,0.2); }
.legend-dot--partial { background: rgba(34,197,94,0.5); }
.legend-dot--full    { background: #22c55e; }

/* 全天全勤庆祝弹窗 */
.alldone-box {
  background: linear-gradient(135deg, #0a1628, #001a10);
  border: 1px solid rgba(34,197,94,0.4);
  border-radius: 16px;
  padding: 36px 32px;
  text-align: center;
  box-shadow: 0 0 40px rgba(34,197,94,0.2);
  max-width: 320px;
  width: 90%;
  animation: alldone-appear 0.4s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes alldone-appear {
  from { transform: scale(0.7); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}
.alldone-firework {
  font-size: 52px;
  margin-bottom: 12px;
  animation: bounce-firework 0.6s ease infinite alternate;
}
@keyframes bounce-firework {
  from { transform: translateY(0); }
  to   { transform: translateY(-8px); }
}
.alldone-title {
  font-size: 22px;
  font-weight: 900;
  color: #22c55e;
  text-shadow: 0 0 16px rgba(34,197,94,0.6);
  margin-bottom: 8px;
}
.alldone-sub {
  font-size: 13px;
  color: rgba(226,232,240,0.6);
  line-height: 1.6;
  margin-bottom: 20px;
}
.alldone-btn {
  padding: 8px 28px;
  background: rgba(34,197,94,0.15);
  border: 1px solid rgba(34,197,94,0.5);
  color: #22c55e;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}
.alldone-btn:hover {
  background: rgba(34,197,94,0.3);
  box-shadow: 0 0 14px rgba(34,197,94,0.3);
}

/* ══════════════════════════════════════════════════════════════════
   文章弹窗
══════════════════════════════════════════════════════════════════ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  box-sizing: border-box;
  backdrop-filter: blur(3px);
}

.modal-box {
  background: #0a0f1a;
  border: 1px solid #1e3a4a;
  border-radius: 12px;
  width: 100%;
  max-width: 560px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 0 40px rgba(56, 189, 248, 0.15);
  position: relative;
}
.modal-box::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #38bdf8, transparent);
}

.modal-close {
  position: absolute;
  top: 14px;
  right: 16px;
  background: none;
  border: none;
  color: #64748b;
  font-size: 18px;
  cursor: pointer;
  line-height: 1;
  padding: 4px;
  transition: color 0.2s;
  z-index: 1;
}
.modal-close:hover { color: #38bdf8; }

.modal-title {
  font-size: 17px;
  font-weight: 700;
  color: #38bdf8;
  margin: 0;
  padding: 20px 48px 16px 24px;
  letter-spacing: 0.06em;
  border-bottom: 1px solid #1e3a4a;
  text-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
}

.modal-body {
  padding: 20px 24px;
  font-size: 14px;
  line-height: 1.85;
  color: #cbd5e1;
  overflow-y: auto;
  white-space: pre-wrap;
  scrollbar-width: thin;
  scrollbar-color: #1e3a4a transparent;
}
.modal-body::-webkit-scrollbar { width: 4px; }
.modal-body::-webkit-scrollbar-track { background: transparent; }
.modal-body::-webkit-scrollbar-thumb { background: #1e3a4a; border-radius: 2px; }

/* ══════════════════════════════════════════════════════════════════
   弹窗过渡动画
══════════════════════════════════════════════════════════════════ */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-active .modal-box,
.modal-fade-leave-active .modal-box {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from .modal-box,
.modal-fade-leave-to .modal-box {
  transform: translateY(20px) scale(0.97);
  opacity: 0;
}
</style>

