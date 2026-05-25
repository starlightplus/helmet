<template>
  <div class="daily-plan">

    <!-- ═══════════════════════════════════════════════════════════
         海报轮播区
    ═══════════════════════════════════════════════════════════ -->
    <section class="carousel-section">
      <div class="carousel-track" :style="{ transform: `translateX(-${carouselIndex * 100}%)` }">

        <!-- 海报 0：健身 -->
        <div class="carousel-slide" @click="openArticle(0)">
          <div class="poster poster--fitness">
            <div class="poster__bg-shapes">
              <div class="poster__circle poster__circle--1"></div>
              <div class="poster__circle poster__circle--2"></div>
              <div class="poster__line poster__line--1"></div>
              <div class="poster__line poster__line--2"></div>
            </div>
            <div class="poster__icon">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M6.5 6.5h11M6.5 17.5h11M4 12h16M12 4v16"/>
                <circle cx="12" cy="12" r="9" stroke-dasharray="4 2"/>
              </svg>
            </div>
            <div class="poster__kw">FITNESS</div>
            <div class="poster__title">健身</div>
            <div class="poster__sub">强健体魄 · 活力生活</div>
            <div class="poster__tag">点击阅读 →</div>
          </div>
        </div>

        <!-- 海报 1：减肥 -->
        <div class="carousel-slide" @click="openArticle(1)">
          <div class="poster poster--diet">
            <div class="poster__bg-shapes">
              <div class="poster__circle poster__circle--1"></div>
              <div class="poster__circle poster__circle--2"></div>
              <div class="poster__bar" v-for="n in 5" :key="n" :style="{ height: (30 + n*12) + 'px', left: (8 + n*16) + '%' }"></div>
            </div>
            <div class="poster__icon">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/>
                <path d="M12 6v6l4 2"/>
                <path d="M8 14s1 2 4 2 4-2 4-2"/>
              </svg>
            </div>
            <div class="poster__kw">WEIGHT LOSS</div>
            <div class="poster__title">减肥</div>
            <div class="poster__sub">科学减重 · 健康瘦身</div>
            <div class="poster__tag">点击阅读 →</div>
          </div>
        </div>

        <!-- 海报 2：吃 -->
        <div class="carousel-slide" @click="openArticle(2)">
          <div class="poster poster--food">
            <div class="poster__bg-shapes">
              <div class="poster__circle poster__circle--1"></div>
              <div class="poster__circle poster__circle--2"></div>
              <div class="poster__dot" v-for="n in 8" :key="n"></div>
            </div>
            <div class="poster__icon">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                <line x1="6" y1="1" x2="6" y2="4"/>
                <line x1="10" y1="1" x2="10" y2="4"/>
                <line x1="14" y1="1" x2="14" y2="4"/>
              </svg>
            </div>
            <div class="poster__kw">NUTRITION</div>
            <div class="poster__title">吃</div>
            <div class="poster__sub">均衡营养 · 食补养生</div>
            <div class="poster__tag">点击阅读 →</div>
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
         下方两列
    ═══════════════════════════════════════════════════════════ -->
    <div class="bottom-grid">

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

          <div class="meals-grid">
            <div v-for="meal in ['breakfast','lunch','dinner']" :key="meal" class="meal-col">
              <div class="meal-header">{{ mealLabel[meal] }}</div>
              <div v-for="dish in todayRecipe[meal]" :key="dish.name" class="dish-item">
                <div class="dish-img-placeholder" aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="1.5">
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M8 12h8M12 8v8"/>
                  </svg>
                </div>
                <span class="dish-name">{{ dish.name }}</span>
                <span class="dish-kcal">{{ dish.kcal }} kcal</span>
              </div>
            </div>
          </div>

          <div class="recipe-total">
            今日总热量：<strong>{{ todayRecipe.totalKcal }}</strong> kcal
            <span class="recipe-target">/ 目标 {{ ridePlanStore.plan.planDailyIntake }} kcal</span>
          </div>
        </div>
      </section>
    </div>

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
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
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
  { img: '/picture/1.jpg', title: '减肥的重要性' },
  { img: '/picture/2.jpg', title: '骑行的健康收益' },
  { img: '/picture/3.jpg', title: '21天养成运动习惯' }
]

const articles = [
  {
    title: '减肥的重要性',
    content: `肥胖不仅影响外貌，更是多种慢性疾病的根源。研究表明，超重会显著增加2型糖尿病、心血管疾病、高血压及部分癌症的患病风险。体重每减少5%–10%，血糖、血压和血脂指标均可得到明显改善，关节负担也随之减轻，睡眠质量得以提升。\n\n减肥的核心在于制造热量缺口：摄入少于消耗。骑行作为有氧运动，每小时可消耗300–600千卡，同时提升基础代谢率，让身体在休息时也能燃烧更多热量。坚持规律骑行配合均衡饮食，不仅能帮助安全、稳健地减重，更能塑造肌肉线条、增强心肺功能，让你从内到外焕发活力。`
  },
  {
    title: '骑行的健康收益',
    content: `骑行是一项全身性的低冲击有氧运动，对膝关节和腰椎的压力远小于跑步，适合各年龄段人群长期坚持。每周骑行150分钟以上，可将心脏病风险降低约50%，同时显著改善肺活量和心肺耐力。\n\n骑行还能促进大脑分泌多巴胺和血清素，有效缓解焦虑与抑郁情绪。户外骑行让人亲近自然，减少屏幕暴露，对精神健康大有裨益。长期骑行者平均寿命比同龄人长4–6年。无论是清晨的公园还是傍晚的滨江大道，骑行都是最简单、最高效的投资健康方式之一。`
  },
  {
    title: '21天养成运动习惯',
    content: `心理学研究表明，一个新行为至少需要21天的持续重复才能在大脑中形成稳固的神经通路，从而转化为自动化习惯。运动习惯的养成同样如此——前7天最为关键，意志力消耗最大，需要借助外部提醒和固定时间来支撑。\n\n第8至14天，身体开始适应运动节律，疲劳感减轻，甚至会产生"缺少运动就不舒服"的感觉。第15至21天，习惯逐步稳固，运动变得像刷牙一样自然。建议从每天20–30分钟的低强度骑行起步，设定固定时间，记录每日完成情况，给自己小奖励。智能头盔的骑行记录功能正是你21天打卡最好的伙伴。`
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

// 减脂型（< 1600 kcal）— 5天轮换，第6天复用第1天
const DIET_FATBURN = [
  // 第1天
  {
    breakfast: [{ name: '燕麦粥', kcal: 150 }, { name: '牛奶', kcal: 110 }, { name: '水煮蛋', kcal: 80 }],
    lunch:     [{ name: '鸡胸肉沙拉', kcal: 280 }, { name: '糙米饭', kcal: 180 }],
    dinner:    [{ name: '清蒸鱼', kcal: 200 }, { name: '炒西兰花', kcal: 80 }, { name: '紫菜汤', kcal: 30 }],
    totalKcal: 1110
  },
  // 第2天
  {
    breakfast: [{ name: '豆浆', kcal: 80 }, { name: '全麦吐司', kcal: 140 }, { name: '水煮蛋', kcal: 80 }],
    lunch:     [{ name: '虾仁豆腐', kcal: 260 }, { name: '杂粮饭', kcal: 180 }],
    dinner:    [{ name: '番茄蛋花汤', kcal: 120 }, { name: '蒸红薯', kcal: 130 }, { name: '凉拌黄瓜', kcal: 40 }],
    totalKcal: 1030
  },
  // 第3天
  {
    breakfast: [{ name: '牛奶', kcal: 110 }, { name: '蒸蛋羹', kcal: 120 }, { name: '苹果', kcal: 80 }],
    lunch:     [{ name: '牛肉时蔬锅', kcal: 320 }, { name: '荞麦面', kcal: 170 }],
    dinner:    [{ name: '清炒菠菜', kcal: 70 }, { name: '清蒸鸡腿', kcal: 200 }, { name: '冬瓜汤', kcal: 40 }],
    totalKcal: 1110
  },
  // 第4天
  {
    breakfast: [{ name: '豆浆', kcal: 80 }, { name: '紫薯粥', kcal: 130 }, { name: '卤蛋', kcal: 80 }],
    lunch:     [{ name: '三文鱼饭', kcal: 380 }, { name: '拌木耳', kcal: 60 }],
    dinner:    [{ name: '豆腐白菜汤', kcal: 130 }, { name: '蒸南瓜', kcal: 90 }, { name: '清炒时蔬', kcal: 80 }],
    totalKcal: 1030
  },
  // 第5天
  {
    breakfast: [{ name: '牛奶', kcal: 110 }, { name: '全麦面包', kcal: 130 }, { name: '水煮蛋', kcal: 80 }],
    lunch:     [{ name: '芦笋鸡胸套餐', kcal: 300 }, { name: '糙米饭', kcal: 180 }],
    dinner:    [{ name: '鲜蘑菇汤', kcal: 60 }, { name: '清蒸虾', kcal: 150 }, { name: '炒西兰花', kcal: 80 }],
    totalKcal: 1090
  }
]

// 均衡型（1600–2200 kcal）— 5天轮换，第6天复用第1天
const DIET_BALANCE = [
  // 第1天
  {
    breakfast: [{ name: '牛奶', kcal: 110 }, { name: '全麦吐司', kcal: 140 }, { name: '水煮蛋', kcal: 80 }],
    lunch:     [{ name: '糙米饭', kcal: 220 }, { name: '清蒸鸡腿', kcal: 320 }, { name: '炒青菜', kcal: 90 }],
    dinner:    [{ name: '番茄鸡蛋面', kcal: 320 }, { name: '凉拌海带', kcal: 80 }],
    totalKcal: 1360
  },
  // 第2天
  {
    breakfast: [{ name: '豆浆', kcal: 80 }, { name: '杂粮粥', kcal: 160 }, { name: '茶叶蛋', kcal: 80 }],
    lunch:     [{ name: '米饭', kcal: 220 }, { name: '清蒸大黄鱼', kcal: 300 }, { name: '炒菜心', kcal: 80 }],
    dinner:    [{ name: '番茄炒鸡蛋', kcal: 200 }, { name: '杂粮饭', kcal: 180 }, { name: '紫菜汤', kcal: 40 }],
    totalKcal: 1340
  },
  // 第3天
  {
    breakfast: [{ name: '牛奶', kcal: 110 }, { name: '燕麦粥', kcal: 150 }, { name: '水煮蛋', kcal: 80 }],
    lunch:     [{ name: '糙米饭', kcal: 220 }, { name: '土豆炖牛肉', kcal: 380 }, { name: '炒西兰花', kcal: 80 }],
    dinner:    [{ name: '清蒸鱼', kcal: 220 }, { name: '蒸红薯', kcal: 130 }, { name: '凉拌黄瓜', kcal: 40 }],
    totalKcal: 1410
  },
  // 第4天
  {
    breakfast: [{ name: '豆浆', kcal: 80 }, { name: '全麦面包', kcal: 130 }, { name: '卤蛋', kcal: 80 }],
    lunch:     [{ name: '米饭', kcal: 220 }, { name: '虾仁豆腐', kcal: 260 }, { name: '炒青菜', kcal: 80 }],
    dinner:    [{ name: '皮蛋瘦肉粥', kcal: 260 }, { name: '凉拌黄瓜', kcal: 40 }, { name: '清炒菠菜', kcal: 70 }],
    totalKcal: 1220
  },
  // 第5天
  {
    breakfast: [{ name: '牛奶', kcal: 110 }, { name: '蒸蛋羹', kcal: 120 }, { name: '苹果', kcal: 80 }],
    lunch:     [{ name: '糙米饭', kcal: 220 }, { name: '鸡丝荞麦面', kcal: 350 }, { name: '拌木耳', kcal: 60 }],
    dinner:    [{ name: '豆腐白菜汤', kcal: 130 }, { name: '清蒸虾', kcal: 150 }, { name: '蒸南瓜', kcal: 90 }],
    totalKcal: 1310
  }
]

// 增肌型（> 2200 kcal）— 5天轮换，第6天复用第1天
const DIET_MUSCLE = [
  // 第1天
  {
    breakfast: [{ name: '牛奶', kcal: 220 }, { name: '燕麦粥', kcal: 200 }, { name: '水煮蛋', kcal: 160 }],
    lunch:     [{ name: '糙米饭', kcal: 400 }, { name: '红烧牛腩', kcal: 480 }, { name: '炒西兰花', kcal: 80 }],
    dinner:    [{ name: '清蒸鸡腿', kcal: 320 }, { name: '杂粮饭', kcal: 220 }, { name: '番茄蛋花汤', kcal: 120 }],
    totalKcal: 2200
  },
  // 第2天
  {
    breakfast: [{ name: '豆浆', kcal: 160 }, { name: '全麦吐司', kcal: 280 }, { name: '水煮蛋', kcal: 160 }],
    lunch:     [{ name: '米饭', kcal: 400 }, { name: '清蒸大黄鱼', kcal: 360 }, { name: '炒菜心', kcal: 80 }],
    dinner:    [{ name: '牛肉时蔬锅', kcal: 380 }, { name: '糙米饭', kcal: 300 }, { name: '紫菜汤', kcal: 40 }],
    totalKcal: 2160
  },
  // 第3天
  {
    breakfast: [{ name: '牛奶', kcal: 220 }, { name: '杂粮粥', kcal: 200 }, { name: '卤蛋', kcal: 160 }],
    lunch:     [{ name: '糙米饭', kcal: 400 }, { name: '猪里脊', kcal: 420 }, { name: '炒青菜', kcal: 80 }],
    dinner:    [{ name: '三文鱼饭', kcal: 420 }, { name: '蒸蛋羹', kcal: 120 }, { name: '炒西兰花', kcal: 80 }],
    totalKcal: 2100
  },
  // 第4天
  {
    breakfast: [{ name: '豆浆', kcal: 160 }, { name: '全麦面包', kcal: 260 }, { name: '水煮蛋', kcal: 160 }],
    lunch:     [{ name: '米饭', kcal: 400 }, { name: '卤牛肉', kcal: 460 }, { name: '炒时蔬', kcal: 80 }],
    dinner:    [{ name: '清蒸鸡腿', kcal: 320 }, { name: '糙米饭', kcal: 300 }, { name: '冬瓜汤', kcal: 60 }],
    totalKcal: 2200
  },
  // 第5天
  {
    breakfast: [{ name: '牛奶', kcal: 220 }, { name: '燕麦粥', kcal: 200 }, { name: '茶叶蛋', kcal: 160 }],
    lunch:     [{ name: '糙米饭', kcal: 400 }, { name: '清蒸大黄鱼', kcal: 360 }, { name: '豆腐', kcal: 120 }],
    dinner:    [{ name: '牛肉时蔬锅', kcal: 380 }, { name: '杂粮饭', kcal: 220 }, { name: '番茄炒鸡蛋', kcal: 180 }],
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
  height: 200px;
  overflow: hidden;
  background: #0a0f1a;
  border-bottom: 1px solid #1e3a4a;
  flex-shrink: 0;
}

.carousel-track {
  display: flex;
  width: 300%;
  height: 100%;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.carousel-slide {
  flex: 0 0 33.333%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  user-select: none;
  position: relative;
  overflow: hidden;
}

.poster-img {
  width: 100%;
  height: 155px;
  object-fit: cover;
  display: block;
  filter: brightness(0.85) saturate(1.2);
  transition: filter 0.3s;
}
.carousel-slide:hover .poster-img {
  filter: brightness(1) saturate(1.4);
}

.poster-title {
  width: 100%;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #38bdf8;
  background: linear-gradient(90deg, #051018 0%, #0a1a2a 50%, #051018 100%);
  text-shadow: 0 0 12px rgba(56, 189, 248, 0.6);
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
   下方两列
══════════════════════════════════════════════════════════════════ */
.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 20px 24px 0;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .bottom-grid {
    grid-template-columns: 1fr;
  }
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
  color: #94a3b8;
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

.meal-col { display: flex; flex-direction: column; gap: 8px; }

.meal-header {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding-bottom: 4px;
  border-bottom: 1px solid #1e3a4a;
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

.dish-img-placeholder {
  width: 64px;
  height: 64px;
  background: #0d1f30;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #1e3a4a;
}

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
  background: rgba(245, 158, 11, 0.05);
  border-left: 2px solid #f59e0b;
  border-radius: 0 4px 4px 0;
}
.recipe-total strong { color: #f59e0b; }
.recipe-target { color: #64748b; margin-left: 6px; }

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

