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

      <!-- ── 历史运动月历（仅有规划时显示） ── -->
      <div v-if="ridePlanStore.hasPlan" class="cal-section">
        <!-- 月份导航 -->
        <div class="cal-header">
          <button class="cal-nav-btn" @click="prevCalMonth">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span class="cal-month-label">{{ calMonthLabel }}</span>
          <button class="cal-nav-btn" @click="nextCalMonth" :disabled="calMonthOffset >= 0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <span v-if="calLoading" class="cal-loading">加载中…</span>
        </div>
        <!-- 星期标题 -->
        <div class="cal-weekdays">
          <span v-for="w in ['日','一','二','三','四','五','六']" :key="w">{{ w }}</span>
        </div>
        <!-- 日期格子 -->
        <div class="cal-grid">
          <div
            v-for="(cell, i) in calDays"
            :key="i"
            class="cal-cell"
            :class="{
              'cal-cell--empty':      !cell,
              'cal-cell--future':     cell && cell.isFuture,
              'cal-cell--today':      cell && cell.isToday,
              'cal-cell--selected':   cell && calSelectedDate === cell.key,
              'cal-cell--lv1':        cell && cell.level === 1,
              'cal-cell--lv2':        cell && cell.level === 2,
              'cal-cell--lv3':        cell && cell.level === 3,
              'cal-cell--clickable':  cell && !cell.isFuture && cell.hasAny,
              'cal-cell--past-empty': cell && !cell.isFuture && !cell.hasAny && !cell.isToday,
            }"
            @click="onCalDayClick(cell)"
          >
            <span v-if="cell" class="cal-day-num">{{ cell.day }}</span>
          </div>
        </div>
        <!-- 图例 -->
        <div class="cal-legend">
          <span class="cal-legend-item"><span class="cal-legend-dot cal-legend-dot--0"></span>无记录</span>
          <span class="cal-legend-item"><span class="cal-legend-dot cal-legend-dot--1"></span>少量</span>
          <span class="cal-legend-item"><span class="cal-legend-dot cal-legend-dot--2"></span>中等</span>
          <span class="cal-legend-item"><span class="cal-legend-dot cal-legend-dot--3"></span>高强度</span>
        </div>

        <!-- 展开面板 -->
        <Transition name="cal-panel-slide">
          <div v-if="calDetailData" class="cal-detail-panel">
            <div class="cal-detail-header">
              <span class="cal-detail-date">{{ calDetailData.date }}</span>
              <button class="cal-detail-close" @click="calSelectedDate = ''">✕</button>
            </div>

            <!-- 净消耗热量（顶部大数字） -->
            <div class="cal-detail-net-kcal">
              <div class="cal-detail-net-kcal__main">
                <span class="cal-detail-net-kcal__val" :class="{ 'cal-detail-net-kcal__val--neg': calDetailData.netKcal < 0 }">
                  {{ calDetailData.netKcal >= 0 ? '+' : '' }}{{ calDetailData.netKcal.toFixed(0) }}
                </span>
                <span class="cal-detail-net-kcal__unit">kcal 净消耗</span>
              </div>
              <div class="cal-detail-net-kcal__breakdown">
                <span>消耗 {{ calDetailData.totalKcal.toFixed(0) }}</span>
                <span class="cal-detail-net-kcal__minus">−</span>
                <span>摄入 {{ calDetailData.intakeKcal.toFixed(0) }}</span>
              </div>
            </div>

            <!-- 无运动记录提示 -->
            <div v-if="calDetailData.isEmpty" class="cal-detail-empty">
              当日无运动记录
            </div>

            <template v-else>
              <!-- 运动打卡（骑行 + 其他运动统一展示） -->
              <div class="cal-detail-block">
                <div class="cal-detail-block-title">运动打卡</div>
                <div class="cal-detail-sport-list">
                  <div v-for="item in calDetailData.sportItems" :key="item.key" class="cal-detail-sport-item">
                    <span class="cal-detail-sport-icon">{{ item.icon }}</span>
                    <span class="cal-detail-sport-label">{{ item.label }}</span>
                    <span class="cal-detail-sport-val">{{ item.doneText }}</span>
                    <span class="cal-detail-sport-kcal">{{ item.kcal.toFixed(0) }} kcal</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- 当日食谱（始终显示） -->
            <div v-if="calDetailData.meals" class="cal-detail-block">
              <div class="cal-detail-block-title">🍽 当日食谱</div>
              <div class="cal-detail-meals">
                <div v-for="meal in ['breakfast','lunch','dinner']" :key="meal" class="cal-detail-meal-row">
                  <span class="cal-detail-meal-label">{{ { breakfast:'早餐', lunch:'午餐', dinner:'晚餐' }[meal] }}</span>
                  <div class="cal-detail-meal-dishes">
                    <span
                      v-for="dish in calDetailData.meals[meal]"
                      :key="dish.name"
                      class="cal-detail-dish"
                      :class="{ 'cal-detail-dish--checked': calDetailData.checkedDishes[meal]?.includes(dish.name) }"
                    >{{ dish.name }}</span>
                  </div>
                  <span class="cal-detail-meal-kcal">{{ calDetailData.meals[meal].reduce((s,d)=>s+d.kcal,0) }} kcal</span>
                </div>
              </div>
            </div>
          </div>
        </Transition>
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
          <p class="empty-text">还没有设定运动规划</p>
          <button class="btn-primary" @click="$emit('go-plan')">去定制您的运动规划</button>
        </div>

        <div v-else class="exercise-content">

          <!-- 总热量进度 -->
          <div class="kcal-summary">
            <div class="kcal-summary__info">
              <span class="kcal-summary__label">今日总消耗</span>
              <span class="kcal-summary__val">
                {{ totalKcalToday.toFixed(0) }}<em> / {{ ridePlanStore.plan.planDailyIntake }} kcal</em>
                <span v-if="totalKcalRatio > 1" class="kcal-over-tag">+{{ (totalKcalToday - ridePlanStore.plan.planDailyIntake).toFixed(0) }}</span>
              </span>
            </div>
            <div class="kcal-bar-track">
              <div class="kcal-bar-fill"
                :style="{ width: Math.min(totalKcalRatio * 100, 100) + '%' }"
                :class="{ 'kcal-bar-fill--done': totalKcalRatio >= 1, 'kcal-bar-fill--over': totalKcalRatio > 1.1 }"
              ></div>
            </div>
          </div>

          <!-- 各运动项目卡片 -->
          <div class="sport-items">
            <div
              v-for="item in sportGoalItems"
              :key="item.key"
              class="sport-item"
              :class="{ 'sport-item--done': item.ratio >= 1 }"
            >
              <!-- 左：图标 + 名称 -->
              <div class="sport-item__left">
                <span class="sport-item__icon">{{ item.icon }}</span>
                <div class="sport-item__info">
                  <span class="sport-item__name">{{ item.label }}</span>
                  <span class="sport-item__goal">目标 {{ item.goalText }}</span>
                </div>
              </div>

              <!-- 中：进度条 -->
              <div class="sport-item__progress">
                <div class="sport-item__bar-track">
                  <div
                    class="sport-item__bar-fill"
                    :style="{ width: Math.min(item.ratio * 100, 100) + '%' }"
                  ></div>
                </div>
                <span class="sport-item__pct">{{ Math.round(Math.min(item.ratio, 1) * 100) }}%</span>
              </div>

              <!-- 右：完成值 + 热量小计 / 打卡按钮 -->
              <div class="sport-item__right">
                <div class="sport-item__done-info">
                  <span class="sport-item__done-val">{{ item.doneText }}</span>
                  <span v-if="item.kcalDone > 0" class="sport-item__kcal-hint">{{ item.kcalDone.toFixed(0) }} kcal</span>
                </div>
                <!-- 骑行：点击弹出今日统计 -->
                <button
                  v-if="item.key === 'cycling'"
                  class="sport-checkin-btn sport-checkin-btn--auto"
                  @click="openCyclingDetail"
                >详情</button>
                <!-- 其他运动：未达标=打卡，已达标=修改记录 -->
                <button
                  v-else
                  class="sport-checkin-btn"
                  :class="{ 'sport-checkin-btn--done': item.ratio >= 1 }"
                  @click="openCheckinModal(item)"
                >
                  {{ item.ratio >= 1 ? '修改记录' : '打卡' }}
                </button>
              </div>
            </div>
          </div>

          <!-- 全部达标提示 -->
          <p class="exercise-comment" :class="{ achieved: allSportsDone }">
            <template v-if="allSportsDone">今日所有运动目标已达成！🎉</template>
            <template v-else>已完成 {{ sportGoalItems.filter(i => i.ratio >= 1).length }} / {{ sportGoalItems.length }} 项运动目标，继续加油！</template>
          </p>
        </div>
      </section>

      <!-- ── 运动打卡弹窗 ── -->
      <Transition name="modal-fade">
        <div v-if="checkinModal.visible" class="modal-overlay" @click.self="closeCheckinModal">
          <div class="modal-box checkin-modal-box" role="dialog">
            <button class="modal-close" @click="closeCheckinModal">✕</button>
            <h3 class="modal-title">{{ checkinModal.icon }} {{ checkinModal.label }} 打卡</h3>
            <p class="checkin-modal-goal">今日目标：{{ checkinModal.goalText }}</p>

            <!-- 已有记录时显示累加/替换切换 -->
            <div v-if="checkinModal.prevVal > 0" class="checkin-mode-row">
              <span class="checkin-prev-val">已记录：{{ checkinModal.prevVal }}</span>
              <div class="checkin-mode-toggle">
                <button
                  class="checkin-mode-btn"
                  :class="{ active: checkinModal.addMode }"
                  @click="checkinModal.addMode = true"
                >累加</button>
                <button
                  class="checkin-mode-btn"
                  :class="{ active: !checkinModal.addMode }"
                  @click="checkinModal.addMode = false"
                >替换</button>
              </div>
            </div>

            <div class="checkin-modal-form">
              <template v-if="checkinModal.inputType === 'duration'">
                <label class="checkin-form-label">{{ checkinModal.addMode && checkinModal.prevVal > 0 ? '本次时长（分钟）' : '完成时长（分钟）' }}</label>
                <input ref="checkinInputRef" class="checkin-form-input" type="number" min="0" v-model.number="checkinModal.inputVal" placeholder="输入分钟数" @keyup.enter="confirmCheckin" />
              </template>
              <template v-else-if="checkinModal.inputType === 'distance'">
                <label class="checkin-form-label">{{ checkinModal.addMode && checkinModal.prevVal > 0 ? '本次距离（km）' : '完成距离（km）' }}</label>
                <input ref="checkinInputRef" class="checkin-form-input" type="number" min="0" step="0.01" v-model.number="checkinModal.inputVal" placeholder="输入公里数" @keyup.enter="confirmCheckin" />
              </template>
              <template v-else-if="checkinModal.inputType === 'steps'">
                <label class="checkin-form-label">{{ checkinModal.addMode && checkinModal.prevVal > 0 ? '本次步数' : '完成步数' }}</label>
                <input ref="checkinInputRef" class="checkin-form-input" type="number" min="0" v-model.number="checkinModal.inputVal" placeholder="输入步数" @keyup.enter="confirmCheckin" />
              </template>
              <template v-else-if="checkinModal.inputType === 'jumprope'">
                <label class="checkin-form-label">{{ checkinModal.addMode && checkinModal.prevVal > 0 ? '本次个数' : '完成个数' }}</label>
                <input ref="checkinInputRef" class="checkin-form-input" type="number" min="0" v-model.number="checkinModal.inputVal" placeholder="输入跳绳个数" @keyup.enter="confirmCheckin" />
              </template>
              <!-- 累加模式下显示合计预览 -->
              <p v-if="checkinModal.addMode && checkinModal.prevVal > 0 && checkinModal.inputVal > 0" class="checkin-sum-preview">
                合计：{{ checkinModal.prevVal }} + {{ checkinModal.inputVal }} = {{ checkinModal.prevVal + checkinModal.inputVal }}
              </p>
            </div>

            <div class="checkin-modal-actions">
              <button class="checkin-modal-cancel" @click="closeCheckinModal">取消</button>
              <button class="checkin-modal-confirm" @click="confirmCheckin">确认打卡</button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- ── 骑行今日详情弹窗 ── -->
      <Transition name="modal-fade">
        <div v-if="cyclingDetailVisible" class="modal-overlay" @click.self="cyclingDetailVisible = false">
          <div class="modal-box cycling-detail-box" role="dialog">
            <button class="modal-close" @click="cyclingDetailVisible = false">✕</button>
            <h3 class="modal-title">🚴 今日骑行统计</h3>
            <div class="cycling-detail-grid">
              <div class="cycling-detail-item">
                <span class="cycling-detail-label">骑行时长</span>
                <span class="cycling-detail-val">{{ todayStats.durationMin.toFixed(0) }} <em>min</em></span>
              </div>
              <div class="cycling-detail-item">
                <span class="cycling-detail-label">骑行距离</span>
                <span class="cycling-detail-val">{{ todayStats.distanceKm.toFixed(2) }} <em>km</em></span>
              </div>
              <div class="cycling-detail-item">
                <span class="cycling-detail-label">消耗热量</span>
                <span class="cycling-detail-val">{{ todayStats.kcal.toFixed(0) }} <em>kcal</em></span>
              </div>
              <div class="cycling-detail-item">
                <span class="cycling-detail-label">今日骑行次数</span>
                <span class="cycling-detail-val">{{ todayRideCount }} <em>次</em></span>
              </div>
            </div>
            <p class="cycling-detail-tip">骑行数据由骑行记录自动同步，无需手动打卡</p>
          </div>
        </div>
      </Transition>

      <!-- ── 今日食谱区 ── -->
      <section class="card recipe-card">
        <h2 class="card-title"><span class="title-bar"></span>今日食谱</h2>

        <div v-if="!ridePlanStore.hasPlan" class="empty-state">
          <div class="empty-icon">🥗</div>
          <p class="empty-text">设定规划后自动生成今日食谱</p>
        </div>

        <div v-else class="recipe-content">
          <div class="recipe-header-row">
            <div class="recipe-type-badge">{{ recipeTypeName }}</div>
            <div v-if="ridePlanStore.dietRestrictions?.length" class="recipe-diet-tags">
              <span v-for="tag in ridePlanStore.dietRestrictions" :key="tag" class="recipe-diet-tag">
                🚫 {{ tag }}
              </span>
            </div>
          </div>

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
              <div class="heatmap-month-nav">
                <button class="heatmap-nav-btn" @click="prevHeatmapMonth" title="上个月">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <span class="heatmap-month-label">{{ heatmapMonthLabel }}</span>
                <button class="heatmap-nav-btn" @click="nextHeatmapMonth" :disabled="heatmapMonthOffset >= 0" title="下个月">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
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
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
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
// 运动配置（与 RidePlan.vue 保持一致）
// ══════════════════════════════════════════════════════════════════════════
const SPORT_OPTIONS = [
  { key: 'cycling',    label: '骑行',    icon: '🚴', inputType: 'duration', kcalPerMin: 8 },
  { key: 'running',    label: '跑步',    icon: '🏃', inputType: 'distance', kcalPerKm: 60 },
  { key: 'walking',    label: '走路',    icon: '🚶', inputType: 'steps',    kcalPer1k: 40 },
  { key: 'jumprope',   label: '跳绳',    icon: '🪢', inputType: 'jumprope', kcalPerRep: 0.1 },
  { key: 'basketball', label: '打篮球',  icon: '🏀', inputType: 'duration', kcalPerMin: 7 },
  { key: 'strength',   label: '力量训练', icon: '🏋️', inputType: 'duration', kcalPerMin: 5 },
]

// ══════════════════════════════════════════════════════════════════════════
// 今日骑行汇总（自动）
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

const todayRideCount = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTs = today.getTime()
  return rideHistoryStore.rides.filter(ride => {
    const d = new Date(ride.startTime)
    d.setHours(0, 0, 0, 0)
    return d.getTime() === todayTs
  }).length
})

// ══════════════════════════════════════════════════════════════════════════
// 运动打卡数据（纯后端，非骑行运动手动打卡）
// ══════════════════════════════════════════════════════════════════════════
// 结构：{ 'YYYY-MM-DD': { sportKey: value } }
const sportCheckinData = ref({})

function getToken() { return sessionStorage.getItem('token') || '' }

// 从后端拉取今日打卡数据
async function fetchTodaySportCheckin() {
  const token = getToken()
  if (!token) return
  try {
    const res = await fetch(`/api/user/sport-checkin?date=${todayKey()}`, {
      headers: { Authorization: 'Bearer ' + token }
    })
    if (!res.ok) return
    const serverData = await res.json() // { running: 3.2, jumprope: 200, ... }
    const data = { ...sportCheckinData.value }
    data[todayKey()] = serverData
    sportCheckinData.value = data
  } catch {}
}

// 获取今日某运动的打卡累计值
function getTodayCheckinVal(key) {
  return Number(sportCheckinData.value[todayKey()]?.[key] || 0)
}

// ══════════════════════════════════════════════════════════════════════════
// 各运动目标 + 进度计算
// ══════════════════════════════════════════════════════════════════════════
const sportGoalItems = computed(() => {
  if (!ridePlanStore.hasPlan) return []

  let planSportsCfg = []
  try {
    planSportsCfg = JSON.parse(ridePlanStore.plan.planSportsCfg || '[]')
  } catch {
    try { planSportsCfg = JSON.parse(ridePlanStore.plan.planSports || '[]') } catch {}
  }

  return planSportsCfg.map(cfg => {
    const opt = SPORT_OPTIONS.find(o => o.key === cfg.key)
    if (!opt) return null

    let goalVal = 0
    let goalText = ''
    let doneVal = 0
    let doneText = ''
    let ratio = 0

    if (cfg.key === 'cycling') {
      // 骑行：自动从 rideHistory 读取
      goalVal = Number(cfg.duration || ridePlanStore.plan.planDailyRideMin || 30)
      goalText = `${goalVal} 分钟`
      doneVal = todayStats.value.durationMin
      doneText = `${doneVal.toFixed(0)} min`
      ratio = goalVal > 0 ? doneVal / goalVal : 0
    } else if (opt.inputType === 'duration') {
      goalVal = Number(cfg.duration || 30)
      goalText = `${goalVal} 分钟`
      doneVal = getTodayCheckinVal(cfg.key)
      doneText = `${doneVal} min`
      ratio = goalVal > 0 ? doneVal / goalVal : 0
    } else if (opt.inputType === 'distance') {
      goalVal = Number(cfg.distance || 3)
      goalText = `${goalVal} km`
      doneVal = getTodayCheckinVal(cfg.key)
      doneText = `${doneVal.toFixed ? doneVal.toFixed(2) : doneVal} km`
      ratio = goalVal > 0 ? doneVal / goalVal : 0
    } else if (opt.inputType === 'steps') {
      goalVal = Number(cfg.steps || 8000)
      goalText = `${goalVal} 步`
      doneVal = getTodayCheckinVal(cfg.key)
      doneText = `${doneVal} 步`
      ratio = goalVal > 0 ? doneVal / goalVal : 0
    } else if (opt.inputType === 'jumprope') {
      const sets = Number(cfg.sets || 3)
      const reps = Number(cfg.reps || 100)
      goalVal = sets * reps
      goalText = `${sets}组×${reps}个`
      doneVal = getTodayCheckinVal(cfg.key)
      doneText = `${doneVal} 个`
      ratio = goalVal > 0 ? doneVal / goalVal : 0
    }

    // 计算该项运动已消耗热量
    let kcalDone = 0
    if (cfg.key === 'cycling') {
      kcalDone = todayStats.value.kcal
    } else if (opt.inputType === 'duration') {
      kcalDone = doneVal * (opt.kcalPerMin || 6)
    } else if (opt.inputType === 'distance') {
      kcalDone = doneVal * (opt.kcalPerKm || 60)
    } else if (opt.inputType === 'steps') {
      kcalDone = (doneVal / 1000) * (opt.kcalPer1k || 40)
    } else if (opt.inputType === 'jumprope') {
      kcalDone = doneVal * (opt.kcalPerRep || 0.1)
    }

    return {
      key: cfg.key,
      label: opt.label,
      icon: opt.icon,
      inputType: opt.inputType,
      goalVal,
      goalText,
      doneVal,
      doneText,
      kcalDone,
      ratio,
      cfg,
    }
  }).filter(Boolean)
})

// 今日总消耗热量（骑行自动 + 其他打卡估算）
const totalKcalToday = computed(() => {
  let total = todayStats.value.kcal  // 骑行热量
  for (const item of sportGoalItems.value) {
    if (item.key === 'cycling') continue
    const opt = SPORT_OPTIONS.find(o => o.key === item.key)
    if (!opt) continue
    const done = item.doneVal
    if (opt.inputType === 'duration')   total += done * (opt.kcalPerMin || 6)
    else if (opt.inputType === 'distance') total += done * (opt.kcalPerKm || 60)
    else if (opt.inputType === 'steps')    total += (done / 1000) * (opt.kcalPer1k || 40)
    else if (opt.inputType === 'jumprope') total += done * (opt.kcalPerRep || 0.1)
  }
  return total
})

const totalKcalRatio = computed(() => {
  const goal = Number(ridePlanStore.plan?.planDailyIntake) || 1
  return totalKcalToday.value / goal
})

const allSportsDone = computed(() => sportGoalItems.value.length > 0 && sportGoalItems.value.every(i => i.ratio >= 1))

// ══════════════════════════════════════════════════════════════════════════
// 打卡弹窗
// ══════════════════════════════════════════════════════════════════════════
const checkinModal = reactive({
  visible: false,
  key: '',
  label: '',
  icon: '',
  inputType: '',
  goalText: '',
  inputVal: 0,
  prevVal: 0,   // 今日已记录的旧值
  addMode: true, // true=累加，false=替换
})

// ── 打卡弹窗 input ref（自动聚焦）──────────────────────────────────────────
const checkinInputRef = ref(null)

function openCheckinModal(item) {
  checkinModal.visible = true
  checkinModal.key = item.key
  checkinModal.label = item.label
  checkinModal.icon = item.icon
  checkinModal.inputType = item.inputType
  checkinModal.goalText = item.goalText
  checkinModal.prevVal = item.doneVal || 0
  checkinModal.inputVal = 0
  checkinModal.addMode = item.doneVal > 0
  nextTick(() => checkinInputRef.value?.focus())
}

function closeCheckinModal() {
  checkinModal.visible = false
}

// ── 骑行今日详情弹窗 ────────────────────────────────────────────────────────
const cyclingDetailVisible = ref(false)

function openCyclingDetail() {
  cyclingDetailVisible.value = true
}

async function confirmCheckin() {
  const inputVal = Number(checkinModal.inputVal) || 0
  if (inputVal < 0) return

  const val = checkinModal.addMode
    ? checkinModal.prevVal + inputVal
    : inputVal

  // 乐观更新本地 ref（立即反映到 UI）
  const key = todayKey()
  const data = { ...sportCheckinData.value }
  if (!data[key]) data[key] = {}
  data[key] = { ...data[key], [checkinModal.key]: val }
  sportCheckinData.value = data

  // 写入后端
  const token = getToken()
  if (token) {
    fetch('/api/user/sport-checkin', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ date: key, sportKey: checkinModal.key, value: val })
    }).catch(() => {})
  }

  closeCheckinModal()
}

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

// 饮食限制标签映射：菜名 → 触发的限制标签（与 dietTagOptions 对应）
const DISH_RESTRICT_MAP = {
  // 猪肉类
  '猪里脊': ['不吃猪肉'], '红烧肉': ['不吃猪肉'], '皮蛋瘦肉粥': ['不吃猪肉'],
  // 牛羊肉类
  '牛肉时蔬锅': ['不吃牛羊肉'], '土豆炖牛肉': ['不吃牛羊肉'],
  '红烧牛腩': ['不吃牛羊肉'], '卤牛肉': ['不吃牛羊肉'],
  // 海鲜类
  '清蒸鱼': ['不吃海鲜'], '清蒸大黄鱼': ['不吃海鲜'], '清蒸虾': ['不吃海鲜'],
  '虾仁豆腐': ['不吃海鲜'], '三文鱼饭': ['不吃海鲜'], '紫菜汤': ['不吃海鲜'],
  // 牛奶类
  '牛奶': ['不喝牛奶'], '酸奶': ['不喝牛奶'],
  // 素食（含肉/蛋/奶的都排除）
  '水煮蛋': ['素食'], '茶叶蛋': ['素食'], '卤蛋': ['素食'],
  '鸡胸肉沙拉': ['素食'], '清蒸鸡腿': ['素食'], '芦笋鸡胸套餐': ['素食'],
  '牛肉时蔬锅': ['素食', '不吃牛羊肉'], '土豆炖牛肉': ['素食', '不吃牛羊肉'],
  '红烧牛腩': ['素食', '不吃牛羊肉'], '卤牛肉': ['素食', '不吃牛羊肉'],
  '猪里脊': ['素食', '不吃猪肉'], '皮蛋瘦肉粥': ['素食', '不吃猪肉'],
  '清蒸鱼': ['素食', '不吃海鲜'], '清蒸大黄鱼': ['素食', '不吃海鲜'],
  '清蒸虾': ['素食', '不吃海鲜'], '虾仁豆腐': ['素食', '不吃海鲜'],
  '三文鱼饭': ['素食', '不吃海鲜'],
  '牛奶': ['素食', '不喝牛奶'],
  // 高碳水（低碳水限制）
  '糙米饭': ['低碳水'], '杂粮饭': ['低碳水'], '荞麦面': ['低碳水'],
  '全麦吐司': ['低碳水'], '全麦面包': ['低碳水'], '蒸红薯': ['低碳水'],
  '蒸南瓜': ['低碳水'], '紫薯粥': ['低碳水'], '燕麦粥': ['低碳水'],
  '杂粮粥': ['低碳水'],
}

// 安全替换菜（不含任何限制成分）
const SAFE_DISHES = [
  D('炒西兰花', 80), D('凉拌黄瓜', 40), D('清炒菠菜', 70),
  D('炒菜心', 80), D('拌木耳', 60), D('清炒时蔬', 80),
  D('豆腐', 120), D('冬瓜汤', 40), D('番茄蛋花汤', 120),
]

// 判断一道菜是否与当前饮食限制冲突
function isDishAllowed(dishName, restrictions) {
  if (!restrictions || restrictions.length === 0) return true
  const tags = DISH_RESTRICT_MAP[dishName] || []
  return !tags.some(t => restrictions.includes(t))
}

// 过滤一餐的菜单，冲突的菜用安全菜替换
function filterMeal(dishes, restrictions) {
  if (!restrictions || restrictions.length === 0) return dishes
  const usedNames = new Set(dishes.map(d => d.name))
  return dishes.map(dish => {
    if (isDishAllowed(dish.name, restrictions)) return dish
    // 找一个安全替换菜（不在当前餐已用菜名里）
    const replacement = SAFE_DISHES.find(s =>
      !usedNames.has(s.name) && isDishAllowed(s.name, restrictions)
    )
    if (replacement) {
      usedNames.delete(dish.name)
      usedNames.add(replacement.name)
      return replacement
    }
    return dish  // 找不到就保留原菜
  })
}

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
// 注意：此函数只在 onMounted 里调用一次，不在 computed 里调用，避免副作用
function initWeeklyRecipeIndex() {
  const key = 'helmet_recipe_week_index'
  const now = new Date()
  const jan4 = new Date(now.getFullYear(), 0, 4)
  const weekNum = Math.ceil((((now - jan4) / 86400000) + jan4.getDay() + 1) / 7)
  const stored = JSON.parse(localStorage.getItem(key) || 'null')
  if (stored && stored.weekNum === weekNum) return stored.idx % 5
  const prevIdx = stored ? stored.idx : 0
  const newIdx = (prevIdx + 1) % 5
  localStorage.setItem(key, JSON.stringify({ weekNum, idx: newIdx }))
  return newIdx
}

const weeklyRecipeIndex = ref(0)

const todayRecipe = computed(() => {
  const set = getRecipeSet()
  return set[weeklyRecipeIndex.value]
})

// ── 换搭配：每餐独立维护当前替换套（在同食谱类型的5套里循环） ──────────────
const mealSwapIdx = reactive({ breakfast: 0, lunch: 0, dinner: 0 })

// 初始化各餐用 todayRecipe 的菜单，换搭配时从其他4套里轮换
const currentMeals = computed(() => {
  const set = getRecipeSet()
  const baseIdx = weeklyRecipeIndex.value
  const restrictions = ridePlanStore.dietRestrictions || []
  const result = {}
  for (const meal of ['breakfast', 'lunch', 'dinner']) {
    const offset = mealSwapIdx[meal]
    const idx = (baseIdx + offset) % set.length
    result[meal] = filterMeal(set[idx][meal], restrictions)
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

// 最近30天热力图数据 — 支持月份切换
const heatmapMonthOffset = ref(0)  // 0=本月, -1=上月, ...

const heatmapMonthLabel = computed(() => {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() + heatmapMonthOffset.value)
  return `${d.getFullYear()}年${d.getMonth()+1}月`
})

function prevHeatmapMonth() { heatmapMonthOffset.value-- }
function nextHeatmapMonth() { if (heatmapMonthOffset.value < 0) heatmapMonthOffset.value++ }

const heatmapDays = computed(() => {
  const data = checkinData.value
  const days = []
  const now = new Date()
  const base = new Date(now.getFullYear(), now.getMonth() + heatmapMonthOffset.value, 1)
  const year = base.getFullYear()
  const month = base.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
  // 每餐标准菜数（用当前食谱的实际菜数作为参考）
  const mealsRef = currentMeals.value
  const mealSizes = {
    breakfast: mealsRef.breakfast.length,
    lunch:     mealsRef.lunch.length,
    dinner:    mealsRef.dinner.length,
  }
  const totalDishes = mealSizes.breakfast + mealSizes.lunch + mealSizes.dinner

  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    const entry = data[key]
    let checked = 0
    if (entry) {
      for (const m of ['breakfast','lunch','dinner']) {
        checked += (entry[m] || []).length
      }
    }
    const ratio = totalDishes > 0 ? checked / totalDishes : 0
    days.push({
      label: key,
      level: ratio === 0 ? 0 : ratio < 0.4 ? 1 : ratio < 1 ? 2 : 3,
      isToday: key === todayStr
    })
  }
  return days
})

// 累计全勤天数（三餐都有打卡记录，且总打卡菜数 >= 当天总菜数）
const totalCheckinDays = computed(() => {
  const data = checkinData.value
  const mealsRef = currentMeals.value
  const mealSizes = {
    breakfast: mealsRef.breakfast.length,
    lunch:     mealsRef.lunch.length,
    dinner:    mealsRef.dinner.length,
  }
  const totalDishes = mealSizes.breakfast + mealSizes.lunch + mealSizes.dinner
  return Object.values(data).filter(day => {
    const checked = ['breakfast','lunch','dinner'].reduce((s, m) => s + (day[m] || []).length, 0)
    return checked >= totalDishes
  }).length
})

// ══════════════════════════════════════════════════════════════════════════
// 月历统计
// ══════════════════════════════════════════════════════════════════════════
const calMonthOffset = ref(0)   // 0=本月, -1=上月
const calSelectedDate = ref('') // 当前展开的日期 'YYYY-MM-DD'，空=收起
// 缓存：{ 'YYYY-MM': { checkin: {...}, rides: {...} } }
const monthDataCache = ref({})
const calLoading = ref(false)

const calMonthLabel = computed(() => {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() + calMonthOffset.value)
  return `${d.getFullYear()}年${d.getMonth() + 1}月`
})

// 当前月历所有日期格子
const calDays = computed(() => {
  const now = new Date()
  const base = new Date(now.getFullYear(), now.getMonth() + calMonthOffset.value, 1)
  const year = base.getFullYear()
  const month = base.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstWeekday = base.getDay() // 0=周日
  const todayStr = fmtDate(now)
  const cacheKey = `${year}-${String(month + 1).padStart(2, '0')}`
  const cache = monthDataCache.value[cacheKey] || {}
  const checkinMap = cache.checkin || {}
  const ridesMap   = cache.rides   || {}

  const cells = []
  // 补齐月初空格
  for (let i = 0; i < firstWeekday; i++) cells.push(null)

  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const isFuture = key > todayStr
    const checkin = checkinMap[key] || {}
    const ride    = ridesMap[key]   || null
    // 计算完成率（有任何数据就算有记录）
    const hasCheckin = Object.keys(checkin).length > 0
    const hasRide    = ride && (ride.durationMin > 0 || ride.distanceKm > 0)
    const hasAny     = hasCheckin || hasRide
    // 热量估算（用于色阶）
    let kcal = ride ? (ride.calories || 0) : 0
    for (const [k, v] of Object.entries(checkin)) {
      const opt = SPORT_OPTIONS.find(o => o.key === k)
      if (!opt) continue
      if (opt.inputType === 'duration')   kcal += v * (opt.kcalPerMin || 6)
      else if (opt.inputType === 'distance') kcal += v * (opt.kcalPerKm || 60)
      else if (opt.inputType === 'steps')    kcal += (v / 1000) * (opt.kcalPer1k || 40)
      else if (opt.inputType === 'jumprope') kcal += v * (opt.kcalPerRep || 0.1)
    }
    // 色阶 0-3
    const level = isFuture || !hasAny ? 0 : kcal < 150 ? 1 : kcal < 400 ? 2 : 3
    cells.push({ key, day, isFuture, isToday: key === todayStr, hasAny, level })
  }
  return cells
})

// 当前展开日期的详情数据
const calDetailData = computed(() => {
  if (!calSelectedDate.value) return null
  const d = calSelectedDate.value
  const [y, m] = d.split('-')
  const cacheKey = `${y}-${m}`
  const cache = monthDataCache.value[cacheKey] || {}
  const checkin = (cache.checkin || {})[d] || {}
  const ride    = (cache.rides   || {})[d] || null

  const sportItems = []

  // 骑行作为第一项并入运动打卡列表
  const hasRide = ride && (ride.durationMin > 0 || ride.distanceKm > 0)
  if (hasRide) {
    const parts = []
    if (ride.durationMin > 0) parts.push(`${Math.round(ride.durationMin)} 分钟`)
    if (ride.distanceKm > 0) parts.push(`${Number(ride.distanceKm).toFixed(2)} km`)
    sportItems.push({ key: 'cycling', label: '骑行', icon: '🚴', doneText: parts.join(' / '), kcal: ride.calories || 0 })
  }

  for (const [k, v] of Object.entries(checkin)) {
    if (!v) continue
    const opt = SPORT_OPTIONS.find(o => o.key === k)
    if (!opt) continue
    let doneText = ''
    let kcal = 0
    if (opt.inputType === 'duration')      { doneText = `${v} 分钟`;              kcal = v * (opt.kcalPerMin || 6) }
    else if (opt.inputType === 'distance') { doneText = `${Number(v).toFixed(2)} km`; kcal = v * (opt.kcalPerKm || 60) }
    else if (opt.inputType === 'steps')    { doneText = `${v} 步`;                kcal = (v / 1000) * (opt.kcalPer1k || 40) }
    else if (opt.inputType === 'jumprope') { doneText = `${v} 个`;                kcal = v * (opt.kcalPerRep || 0.1) }
    sportItems.push({ key: k, label: opt.label, icon: opt.icon, doneText, kcal })
  }

  let totalKcal = 0
  sportItems.forEach(i => { totalKcal += i.kcal })

  // ── 推算该日食谱 ──────────────────────────────────────────────────────
  // 根据日期计算周次，推算当天使用的食谱套餐索引（与 initWeeklyRecipeIndex 逻辑一致）
  function getRecipeForDate(dateStr) {
    const date = new Date(dateStr)
    const jan4 = new Date(date.getFullYear(), 0, 4)
    const weekNum = Math.ceil((((date - jan4) / 86400000) + jan4.getDay() + 1) / 7)
    const recipeIdx = ((weekNum - 1) % 5 + 5) % 5
    const set = getRecipeSet()
    const restrictions = ridePlanStore.dietRestrictions || []
    const recipe = set[recipeIdx % set.length]
    const meals = {}
    for (const meal of ['breakfast', 'lunch', 'dinner']) {
      meals[meal] = filterMeal(recipe[meal], restrictions)
    }
    return meals
  }

  const meals = getRecipeForDate(d)

  // 摄入热量 = 该日食谱各餐热量之和（不管是否打卡，代表计划摄入）
  let intakeKcal = 0
  for (const meal of ['breakfast', 'lunch', 'dinner']) {
    intakeKcal += (meals[meal] || []).reduce((s, dish) => s + (dish.kcal || 0), 0)
  }

  // 该日已打卡的菜品（从 localStorage checkinData 读取）
  const dayCheckin = checkinData.value[d] || {}
  const checkedDishes = {
    breakfast: dayCheckin.breakfast || [],
    lunch:     dayCheckin.lunch     || [],
    dinner:    dayCheckin.dinner    || [],
  }

  const isEmpty = sportItems.length === 0

  const netKcal = totalKcal - intakeKcal

  return { date: d, sportItems, totalKcal, intakeKcal, netKcal, meals, checkedDishes, isEmpty }
})

function fmtDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function calMonthKey(offset) {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

async function loadMonthData(offset) {
  const mk = calMonthKey(offset)
  if (monthDataCache.value[mk]) return  // 已缓存
  const token = getToken()
  if (!token) return
  calLoading.value = true
  const [year, month] = mk.split('-').map(Number)
  const from = `${mk}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${mk}-${String(lastDay).padStart(2, '0')}`
  try {
    const [checkinRes, ridesRes] = await Promise.all([
      fetch(`/api/user/sport-checkin/range?from=${from}&to=${to}`, { headers: { Authorization: 'Bearer ' + token } }),
      fetch(`/api/user/rides/range?from=${from}&to=${to}`,         { headers: { Authorization: 'Bearer ' + token } })
    ])
    const checkin = checkinRes.ok ? await checkinRes.json() : {}
    const rides   = ridesRes.ok  ? await ridesRes.json()   : {}
    monthDataCache.value = { ...monthDataCache.value, [mk]: { checkin, rides } }
  } catch {}
  calLoading.value = false
}

function prevCalMonth() {
  calSelectedDate.value = ''
  calMonthOffset.value--
  loadMonthData(calMonthOffset.value)
}
function nextCalMonth() {
  if (calMonthOffset.value >= 0) return
  calSelectedDate.value = ''
  calMonthOffset.value++
  loadMonthData(calMonthOffset.value)
}

function onCalDayClick(cell) {
  if (!cell || cell.isFuture) return
  calSelectedDate.value = calSelectedDate.value === cell.key ? '' : cell.key
}

// ══════════════════════════════════════════════════════════════════════════
// 生命周期
// ══════════════════════════════════════════════════════════════════════════
onMounted(() => {
  weeklyRecipeIndex.value = initWeeklyRecipeIndex()
  ridePlanStore.fetchPlan()
  rideHistoryStore.loadFromStorage()
  fetchTodaySportCheckin()
  loadMonthData(0)  // 预加载本月数据
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
  background: transparent;
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
  background: transparent;
  border-bottom: 1px solid #1e3a4a;
  flex-shrink: 0;
  border-radius: 16px;
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
  background: rgba(10, 15, 26, 1);
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
  color: white;
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

/* 总热量进度条 */
.kcal-summary {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.kcal-summary__info {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 12px;
}
.kcal-summary__label { color: rgba(255,255,255,0.6); }
.kcal-summary__val { color: #e2e8f0; font-weight: 600; }
.kcal-summary__val em { font-style: normal; color: rgba(255,255,255,0.45); font-size: 11px; }
.kcal-bar-track {
  height: 6px;
  background: rgba(255,255,255,0.08);
  border-radius: 3px;
  overflow: hidden;
}
.kcal-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #38bdf8, #818cf8);
  border-radius: 3px;
  transition: width 0.5s ease;
}
.kcal-bar-fill--done { background: linear-gradient(90deg, #22c55e, #4ade80); }
.kcal-bar-fill--over { background: linear-gradient(90deg, #f59e0b, #ef4444); }
.kcal-over-tag {
  margin-left: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #f59e0b;
  background: rgba(245,158,11,0.12);
  border: 1px solid rgba(245,158,11,0.3);
  border-radius: 4px;
  padding: 0 5px;
}

/* 运动项目列表 */
.sport-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sport-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 8px;
  transition: border-color 0.2s;
}
.sport-item--done {
  border-color: rgba(34,197,94,0.25);
  background: rgba(34,197,94,0.04);
}

.sport-item__left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 90px;
  flex-shrink: 0;
}
.sport-item__icon { font-size: 20px; line-height: 1; }
.sport-item__info { display: flex; flex-direction: column; gap: 2px; }
.sport-item__name { font-size: 12px; font-weight: 600; color: #e2e8f0; }
.sport-item__goal { font-size: 10px; color: rgba(255,255,255,0.4); }

.sport-item__progress {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.sport-item__bar-track {
  flex: 1;
  height: 5px;
  background: rgba(255,255,255,0.08);
  border-radius: 3px;
  overflow: hidden;
}
.sport-item__bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #38bdf8, #818cf8);
  border-radius: 3px;
  transition: width 0.5s ease;
}
.sport-item--done .sport-item__bar-fill { background: linear-gradient(90deg, #22c55e, #4ade80); }
.sport-item__pct { font-size: 11px; color: rgba(255,255,255,0.5); min-width: 32px; text-align: right; }

.sport-item__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
  min-width: 80px;
}
.sport-item__done-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
}
.sport-item__done-val { font-size: 11px; color: #e2e8f0; font-weight: 600; }
.sport-item__kcal-hint { font-size: 10px; color: rgba(255,255,255,0.35); }
.sport-item__auto-tag {
  font-size: 9px;
  color: rgba(56,189,248,0.5);
  border: 1px solid rgba(56,189,248,0.2);
  padding: 1px 5px;
  border-radius: 3px;
}

.sport-checkin-btn {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 4px;
  border: 1px solid rgba(56,189,248,0.35);
  background: rgba(56,189,248,0.08);
  color: #38bdf8;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}
.sport-checkin-btn:hover { background: rgba(56,189,248,0.15); }
.sport-checkin-btn--done {
  border-color: rgba(34,197,94,0.35);
  background: rgba(34,197,94,0.06);
  color: rgba(34,197,94,0.8);
  font-size: 10px;
}
.sport-checkin-btn--done:hover {
  background: rgba(34,197,94,0.12);
  color: #22c55e;
}
.sport-checkin-btn--auto {
  border-color: rgba(56,189,248,0.2);
  background: transparent;
  color: rgba(56,189,248,0.6);
  font-size: 10px;
}
.sport-checkin-btn--auto:hover {
  background: rgba(56,189,248,0.08);
  color: #38bdf8;
}

/* 骑行详情弹窗 */
.cycling-detail-box { max-width: 320px; }
.cycling-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 16px 0;
}
.cycling-detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 8px;
}
.cycling-detail-label { font-size: 11px; color: rgba(255,255,255,0.4); }
.cycling-detail-val { font-size: 20px; font-weight: 700; color: #38bdf8; }
.cycling-detail-val em { font-size: 11px; font-style: normal; color: rgba(255,255,255,0.4); margin-left: 2px; }
.cycling-detail-tip {
  font-size: 11px;
  color: rgba(255,255,255,0.3);
  text-align: center;
  margin: 0;
}

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
   月历统计
══════════════════════════════════════════════════════════════════ */
.cal-section {
  margin-top: 20px;
  margin-bottom: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255,255,255,0.06);
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.cal-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.cal-month-label {
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
  flex: 1;
  text-align: center;
}
.cal-nav-btn {
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 4px;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}
.cal-nav-btn:hover:not(:disabled) { background: rgba(56,189,248,0.12); color: #38bdf8; }
.cal-nav-btn:disabled { opacity: 0.3; cursor: default; }
.cal-loading { font-size: 11px; color: rgba(255,255,255,0.35); }

.cal-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 3px;
}
.cal-weekdays span {
  text-align: center;
  font-size: 9px;
  color: rgba(255,255,255,0.3);
  padding: 1px 0;
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}
.cal-cell {
  height: 28px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: rgba(255,255,255,0.03);
  border: 1px solid transparent;
  transition: all 0.15s;
}
.cal-cell--empty { background: transparent; border-color: transparent; }
.cal-cell--future { opacity: 0.25; }
.cal-cell--clickable { cursor: pointer; }
.cal-cell--past-empty { cursor: pointer; }
.cal-cell--past-empty:hover { border-color: rgba(255,255,255,0.15); }
.cal-cell--clickable:hover { border-color: rgba(56,189,248,0.3); }
.cal-cell--today { border-color: rgba(56,189,248,0.6) !important; }
.cal-cell--selected { border-color: #38bdf8 !important; background: rgba(56,189,248,0.12) !important; }

/* 色阶 */
.cal-cell--lv1 { background: rgba(56,189,248,0.12); }
.cal-cell--lv2 { background: rgba(56,189,248,0.28); }
.cal-cell--lv3 { background: rgba(56,189,248,0.50); }

.cal-day-num {
  font-size: 10px;
  color: rgba(255,255,255,0.7);
  line-height: 1;
}
.cal-cell--lv2 .cal-day-num,
.cal-cell--lv3 .cal-day-num { color: #fff; }
.cal-cell--today .cal-day-num { color: #38bdf8; font-weight: 700; }

.cal-legend {
  display: flex;
  gap: 10px;
  margin-top: 6px;
  justify-content: flex-end;
}
.cal-legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: rgba(255,255,255,0.35);
}
.cal-legend-dot {
  width: 8px; height: 8px;
  border-radius: 2px;
}
.cal-legend-dot--0 { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); }
.cal-legend-dot--1 { background: rgba(56,189,248,0.12); }
.cal-legend-dot--2 { background: rgba(56,189,248,0.28); }
.cal-legend-dot--3 { background: rgba(56,189,248,0.50); }

/* 展开面板 */
.cal-panel-slide-enter-active,
.cal-panel-slide-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.cal-panel-slide-enter-from,
.cal-panel-slide-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-6px);
}
.cal-panel-slide-enter-to,
.cal-panel-slide-leave-from {
  max-height: 400px;
  opacity: 1;
  transform: translateY(0);
}

.cal-detail-panel {
  margin-top: 10px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(56,189,248,0.2);
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.cal-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.cal-detail-date {
  font-size: 13px;
  font-weight: 600;
  color: #38bdf8;
}
.cal-detail-close {
  background: none;
  border: none;
  color: rgba(255,255,255,0.35);
  cursor: pointer;
  font-size: 13px;
  padding: 0;
  line-height: 1;
}
.cal-detail-close:hover { color: rgba(255,255,255,0.7); }

.cal-detail-block { display: flex; flex-direction: column; gap: 6px; }
.cal-detail-block-title {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
  font-weight: 600;
  letter-spacing: 0.05em;
}
.cal-detail-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.cal-detail-stat {
  display: flex;
  align-items: baseline;
  gap: 3px;
}
.cal-detail-stat-val {
  font-size: 18px;
  font-weight: 700;
  color: #e2e8f0;
}
.cal-detail-stat-unit {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
}

.cal-detail-sport-list { display: flex; flex-direction: column; gap: 5px; }
.cal-detail-sport-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  background: rgba(255,255,255,0.03);
  border-radius: 5px;
}
.cal-detail-sport-icon { font-size: 14px; }
.cal-detail-sport-label { font-size: 12px; color: rgba(255,255,255,0.6); flex: 1; }
.cal-detail-sport-val { font-size: 12px; font-weight: 600; color: #e2e8f0; }
.cal-detail-sport-kcal { font-size: 11px; color: rgba(255,255,255,0.35); min-width: 52px; text-align: right; }

.cal-detail-total {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  text-align: right;
  padding-top: 6px;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.cal-detail-total strong { color: #38bdf8; font-size: 14px; }
.cal-detail-empty {
  font-size: 12px;
  color: rgba(255,255,255,0.3);
  text-align: center;
  padding: 8px 0 4px;
}

/* 净消耗热量大数字 */
.cal-detail-net-kcal {
  background: rgba(56,189,248,0.06);
  border: 1px solid rgba(56,189,248,0.15);
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 10px;
  text-align: center;
}
.cal-detail-net-kcal__main {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}
.cal-detail-net-kcal__val {
  font-size: 22px;
  font-weight: 700;
  color: #38bdf8;
  letter-spacing: -0.5px;
}
.cal-detail-net-kcal__val--neg { color: #f87171; }
.cal-detail-net-kcal__unit {
  font-size: 11px;
  color: rgba(255,255,255,0.45);
}
.cal-detail-net-kcal__breakdown {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 4px;
  font-size: 11px;
  color: rgba(255,255,255,0.4);
}
.cal-detail-net-kcal__minus { color: rgba(255,255,255,0.25); }

/* 当日食谱 */
.cal-detail-meals { display: flex; flex-direction: column; gap: 6px; }
.cal-detail-meal-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}
.cal-detail-meal-label {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
  min-width: 28px;
  padding-top: 2px;
  flex-shrink: 0;
}
.cal-detail-meal-dishes {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
}
.cal-detail-dish {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.4);
  border: 1px solid rgba(255,255,255,0.08);
}
.cal-detail-dish--checked {
  background: rgba(56,189,248,0.12);
  color: #7dd3fc;
  border-color: rgba(56,189,248,0.25);
}
.cal-detail-meal-kcal {
  font-size: 10px;
  color: rgba(255,255,255,0.25);
  white-space: nowrap;
  padding-top: 3px;
  flex-shrink: 0;
}


/* 打卡弹窗 */
.checkin-modal-box { max-width: 340px; }
.checkin-modal-goal {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  margin: -8px 0 16px;
}
.checkin-modal-form { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
.checkin-form-label { font-size: 12px; color: rgba(255,255,255,0.6); }
.checkin-form-input {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 6px;
  padding: 8px 12px;
  color: #e2e8f0;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}
.checkin-form-input:focus { border-color: rgba(56,189,248,0.5); }
.checkin-modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
.checkin-modal-cancel {
  padding: 7px 16px;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.1);
  background: transparent;
  color: rgba(255,255,255,0.5);
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
}
.checkin-modal-confirm {
  padding: 7px 16px;
  border-radius: 6px;
  border: none;
  background: linear-gradient(135deg, #38bdf8, #818cf8);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: filter 0.15s;
}
.checkin-modal-confirm:hover { filter: brightness(1.1); }

/* 累加/替换模式切换 */
.checkin-mode-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 6px 10px;
  background: rgba(255,255,255,0.04);
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.07);
}
.checkin-prev-val {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
}
.checkin-mode-toggle {
  display: flex;
  gap: 4px;
}
.checkin-mode-btn {
  padding: 3px 10px;
  border-radius: 4px;
  border: 1px solid rgba(255,255,255,0.15);
  background: transparent;
  color: rgba(255,255,255,0.4);
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.checkin-mode-btn.active {
  background: rgba(56,189,248,0.2);
  border-color: rgba(56,189,248,0.5);
  color: #38bdf8;
}
.checkin-sum-preview {
  margin: 6px 0 0;
  font-size: 12px;
  color: rgba(56,189,248,0.8);
  text-align: right;
}

/* ══════════════════════════════════════════════════════════════════
   食谱卡片内容
══════════════════════════════════════════════════════════════════ */
.recipe-content { display: flex; flex-direction: column; gap: 14px; }

.recipe-header-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.recipe-diet-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.recipe-diet-tag {
  font-size: 10px;
  color: rgba(239,68,68,0.75);
  border: 1px solid rgba(239,68,68,0.2);
  background: rgba(239,68,68,0.05);
  padding: 2px 7px;
  border-radius: 10px;
  letter-spacing: 0.04em;
}

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
  color: white;
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
.recipe-target { color: white; }

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
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}
.heatmap-month-nav {
  display: flex;
  align-items: center;
  gap: 6px;
}
.heatmap-nav-btn {
  background: transparent;
  border: 1px solid rgba(56,189,248,0.15);
  color: rgba(56,189,248,0.6);
  cursor: pointer;
  padding: 2px 5px;
  display: flex;
  align-items: center;
  transition: all 0.15s;
  border-radius: 2px;
}
.heatmap-nav-btn:hover:not(:disabled) {
  background: rgba(56,189,248,0.08);
  color: #38bdf8;
}
.heatmap-nav-btn:disabled { opacity: 0.25; cursor: not-allowed; }
.heatmap-month-label {
  font-family: var(--font-mono, monospace);
  font-size: 10px;
  color: rgba(56,189,248,0.7);
  letter-spacing: 0.06em;
  min-width: 60px;
  text-align: center;
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
  color: white;
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
  color: white;
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
  color: white;
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

