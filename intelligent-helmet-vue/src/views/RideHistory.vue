<template>
  <SportBackground />
  <div class="ride-history">

    <!-- Ambient glow header -->
    <div class="rh-ambient"></div>

    <!-- Primary container -->
    <div class="rh-container">

      <!-- ── Header Brand Bar ─────────────────────────────────────── -->
      <header class="rh-header">
        <div class="rh-header__brand">
          <button class="rh-back-btn" @click="goBack">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="rh-brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
          </div>
          <div>
            <div class="rh-brand-title">
              SPARK <span class="rh-brand-sub">骑行轨迹综合记测仪</span>
              <span class="rh-brand-badge">v2.5</span>
            </div>
            <div class="rh-brand-desc">POWERED BY HIGH-PRECISION GPS TRAJECTORY COMPASS &amp; SAFETY TELEMETRY</div>
          </div>
        </div>
        <div class="rh-header__actions">
          <button v-if="rideHistoryStore.rides.length > 0" class="rh-clear-btn" @click="confirmClearAll">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            清空记录
          </button>
        </div>
      </header>

      <!-- ── Stats Overview Bar ──────────────────────────────────── -->
      <section class="rh-stats-grid">
        <div class="rh-stat-card rh-stat-card--emerald">
          <div class="rh-stat-card__top">
            <span class="rh-stat-card__label">累计距离</span>
            <div class="rh-stat-card__icon rh-stat-card__icon--emerald">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v10l6.5-3"/></svg>
            </div>
          </div>
          <div class="rh-stat-card__val">{{ totalDistance.toFixed(1) }}</div>
          <div class="rh-stat-card__unit">KILOMETERS (KM)</div>
        </div>

        <div class="rh-stat-card rh-stat-card--amber">
          <div class="rh-stat-card__top">
            <span class="rh-stat-card__label">累计卡路里</span>
            <div class="rh-stat-card__icon rh-stat-card__icon--amber">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
          </div>
          <div class="rh-stat-card__val">{{ totalCalories }}</div>
          <div class="rh-stat-card__unit">CALORIES (KCAL)</div>
        </div>

        <div class="rh-stat-card rh-stat-card--blue">
          <div class="rh-stat-card__top">
            <span class="rh-stat-card__label">累计时间</span>
            <div class="rh-stat-card__icon rh-stat-card__icon--blue">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
          </div>
          <div class="rh-stat-card__val rh-stat-card__val--sm">{{ formatTotalTime(totalSeconds) }}</div>
          <div class="rh-stat-card__unit">TOTAL DURATION</div>
        </div>

        <div class="rh-stat-card" :class="avgSafetyScore >= 80 ? 'rh-stat-card--emerald' : 'rh-stat-card--red'">
          <div class="rh-stat-card__top">
            <span class="rh-stat-card__label">综合安全评分</span>
            <div class="rh-stat-card__icon" :class="avgSafetyScore >= 80 ? 'rh-stat-card__icon--emerald' : 'rh-stat-card__icon--red'">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
          </div>
          <div class="rh-stat-card__val" :class="avgSafetyScore >= 80 ? 'rh-stat-card__val--emerald' : 'rh-stat-card__val--amber'">
            {{ totalRides > 0 ? avgSafetyScore : '--' }}
          </div>
          <div class="rh-stat-card__unit">SAFETY RATING INDEX</div>
        </div>
      </section>

      <!-- ── Filter Bar ──────────────────────────────────────────── -->
      <div class="rh-filter-bar">
        <div class="rh-search-wrap">
          <svg class="rh-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            v-model="searchQuery"
            class="rh-search-input"
            type="text"
            placeholder="搜索骑行记录名称或日期..."
          />
        </div>
        <div class="rh-filter-pills">
          <span class="rh-filter-label">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            难度:
          </span>
          <div class="rh-pills">
            <button
              v-for="d in difficulties"
              :key="d.val"
              class="rh-pill"
              :class="{ 'rh-pill--active': selectedDifficulty === d.val }"
              @click="selectedDifficulty = d.val"
            >{{ d.label }}</button>
          </div>
        </div>
      </div>

      <!-- ── Record List ──────────────────────────────────────────── -->
      <main class="rh-list">

        <!-- Empty state -->
        <div v-if="rideHistoryStore.rides.length === 0" class="rh-empty">
          <span class="rh-empty__emoji">🚴‍♀️</span>
          <h5 class="rh-empty__title">暂无骑行记录</h5>
          <p class="rh-empty__sub">设备上线骑行后将自动记录</p>
        </div>

        <!-- No search results -->
        <div v-else-if="filteredRides.length === 0" class="rh-empty rh-empty--search">
          <span class="rh-empty__emoji">🔍</span>
          <h5 class="rh-empty__title">未能匹配到骑行档案</h5>
          <p class="rh-empty__sub">建议更新筛选条件，或重置搜索</p>
          <button class="rh-reset-btn" @click="searchQuery = ''; selectedDifficulty = 'All'">重置筛选条件</button>
        </div>

        <!-- Cards -->
        <div v-else class="rh-cards">
          <div
            v-for="ride in filteredRides"
            :key="ride.id"
            class="rh-card"
            :class="{ 'rh-card--expanded': expandedId === ride.id }"
          >
            <!-- Collapsed header -->
            <div class="rh-card__header" @click="toggleExpand(ride.id)">
              <div class="rh-card__header-left">
                <div class="rh-card__avatar">🚴</div>
                <div class="rh-card__info">
                  <div class="rh-card__title-row">
                    <span class="rh-card__title">{{ ride.title || formatDateTitle(ride.startTime) }}</span>
                    <span v-if="ride.difficulty" class="rh-card__diff-badge" :class="diffClass(ride.difficulty)">
                      {{ diffLabel(ride.difficulty) }}
                    </span>
                  </div>
                  <div class="rh-card__meta">
                    <span class="rh-card__meta-item">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {{ formatDate(ride.startTime) }}
                    </span>
                    <span class="rh-card__meta-sep">•</span>
                    <span class="rh-card__dist">{{ ride.distance.toFixed(1) }} km</span>
                  </div>
                </div>
              </div>
              <div class="rh-card__header-right">
                <div class="rh-card__avg-speed">
                  <span class="rh-card__avg-speed-label">Avg Speed</span>
                  <span class="rh-card__avg-speed-val">{{ ride.avgSpeed.toFixed(1) }} <span class="rh-card__avg-speed-unit">km/h</span></span>
                </div>
                <div class="rh-card__chevron-wrap">
                  <svg class="rh-card__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
            </div>

            <!-- Expanded detail -->
            <div v-if="expandedId === ride.id" class="rh-card__expand">

              <!-- Bento stats grid -->
              <div class="rh-bento">

                <!-- 1. Time -->
                <div class="rh-bento-cell rh-bento-cell--emerald">
                  <div class="rh-bento-cell__icon rh-bento-cell__icon--emerald">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div class="rh-bento-cell__body">
                    <span class="rh-bento-cell__label">骑行时间段</span>
                    <span class="rh-bento-cell__val">{{ formatTime(ride.startTime) }} ~ {{ formatTime(ride.endTime) }}</span>
                    <span class="rh-bento-cell__sub">耗时: {{ formatDuration(ride.duration) }}</span>
                  </div>
                </div>

                <!-- 2. Pace -->
                <div class="rh-bento-cell rh-bento-cell--cyan">
                  <div class="rh-bento-cell__icon rh-bento-cell__icon--cyan">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                  </div>
                  <div class="rh-bento-cell__body">
                    <span class="rh-bento-cell__label">骑行配速 (Pace)</span>
                    <span class="rh-bento-cell__val">{{ formatPace(ride.pace) }}</span>
                    <span class="rh-bento-cell__sub">平均速度: <strong class="rh-bento-cell__sub--cyan">{{ ride.avgSpeed.toFixed(1) }}</strong> km/h</span>
                  </div>
                </div>

                <!-- 3. Calories -->
                <div class="rh-bento-cell rh-bento-cell--amber">
                  <div class="rh-bento-cell__icon rh-bento-cell__icon--amber">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  </div>
                  <div class="rh-bento-cell__body">
                    <span class="rh-bento-cell__label">消耗卡路里</span>
                    <span class="rh-bento-cell__val rh-bento-cell__val--lg">{{ ride.calories || 0 }} <span class="rh-bento-cell__val-unit">kcal</span></span>
                    <span class="rh-bento-cell__sub">最高速度: <strong class="rh-bento-cell__sub--amber">{{ ride.maxSpeed.toFixed(1) }}</strong> km/h</span>
                  </div>
                </div>

                <!-- 4. Weather -->
                <div class="rh-bento-cell rh-bento-cell--weather">
                  <span class="rh-bento-cell__label">环境气象数据</span>
                  <span class="rh-bento-cell__sensor-tag">传感器</span>
                  <div class="rh-bento-cell__weather-grid">
                    <div class="rh-bento-cell__weather-item">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>
                      <div>
                        <span class="rh-bento-cell__weather-lbl">均温</span>
                        <span class="rh-bento-cell__weather-val">{{ ride.avgTemp != null ? ride.avgTemp + '°C' : '--' }}</span>
                      </div>
                    </div>
                    <div class="rh-bento-cell__weather-item">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                      <div>
                        <span class="rh-bento-cell__weather-lbl">均湿</span>
                        <span class="rh-bento-cell__weather-val">{{ ride.avgHumidity != null ? ride.avgHumidity + '%' : '--' }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 5. Overspeed -->
                <div class="rh-bento-cell" :class="(ride.speedOverCount || 0) > 0 ? 'rh-bento-cell--red' : 'rh-bento-cell--emerald'">
                  <div class="rh-bento-cell__icon" :class="(ride.speedOverCount || 0) > 0 ? 'rh-bento-cell__icon--red' : 'rh-bento-cell__icon--emerald'">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  </div>
                  <div class="rh-bento-cell__body">
                    <span class="rh-bento-cell__label">超速段次数</span>
                    <span class="rh-bento-cell__val" :class="(ride.speedOverCount || 0) > 0 ? 'rh-bento-cell__val--red' : ''">
                      {{ ride.speedOverCount || 0 }} <span class="rh-bento-cell__val-unit">次</span>
                    </span>
                    <span class="rh-bento-cell__sub">限速阈值: 30km/h</span>
                  </div>
                </div>

                <!-- 6. Safety score -->
                <div class="rh-bento-cell rh-bento-cell--safety">
                  <div class="rh-bento-cell__safety-top">
                    <div class="rh-bento-cell__safety-title">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      骑行安全评分 (Safety Rating)
                    </div>
                    <span class="rh-bento-cell__safety-score" :class="safetyScoreClass(ride.safetyScore)">
                      {{ ride.safetyScore != null ? ride.safetyScore + ' 分' : '-- 分' }}
                    </span>
                  </div>
                  <div class="rh-bento-cell__safety-body">
                    <div v-if="!ride.safetyScore || ride.safetyScore >= 90" class="rh-bento-cell__safety-ok">
                      ✨ 完美行车，未检测到急刹、逆行、超速等扣分隐患。
                    </div>
                    <div v-else class="rh-bento-cell__safety-warn">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
                      安全评分偏低，请注意骑行规范
                    </div>
                  </div>
                </div>

              </div>

              <!-- Baidu map track -->
              <div :id="'ride-map-' + ride.id" class="rh-card__map"></div>

              <!-- Delete action -->
              <div class="rh-card__delete-row">
                <button class="rh-delete-btn" @click.stop="confirmDelete(ride.id)">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  删除此条骑行档案
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>

      <!-- ── Footer ──────────────────────────────────────────────── -->
      <footer class="rh-footer">
        <div class="rh-footer__left">
          <span class="rh-footer__dot"></span>
          骑行记测仪终端正常在线中 · {{ todayStr }}
        </div>
        <div class="rh-footer__right">PRO STYLE VECTOR COMPASS DASHBOARD</div>
      </footer>

    </div>

    <!-- Confirm dialog -->
    <Teleport to="body">
      <div v-if="showConfirm" class="rh-confirm-overlay" @click.self="showConfirm = false">
        <div class="rh-confirm">
          <div class="rh-confirm__title">{{ confirmTitle }}</div>
          <div class="rh-confirm__msg">{{ confirmMsg }}</div>
          <div class="rh-confirm__actions">
            <button class="rh-confirm__btn rh-confirm__btn--cancel" @click="showConfirm = false">取消</button>
            <button class="rh-confirm__btn rh-confirm__btn--ok" @click="confirmAction">确定</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import SportBackground from '@/components/SportBackground.vue'
import { useRideHistoryStore } from '@/stores/rideHistory.js'
import { formatDuration } from '@/composables/useRideTracking.js'

const router = useRouter()
const rideHistoryStore = useRideHistoryStore()

const expandedId = ref(null)
const showConfirm = ref(false)
const confirmTitle = ref('')
const confirmMsg = ref('')
let pendingConfirmAction = null

const searchQuery = ref('')
const selectedDifficulty = ref('All')

const difficulties = [
  { val: 'All', label: '全部' },
  { val: 'Easy', label: '轻松' },
  { val: 'Medium', label: '中效' },
  { val: 'Hard', label: '极限' },
]

const mapInstances = {}

const todayStr = new Date().toISOString().slice(0, 10)

// ── Aggregate stats ──────────────────────────────────────────────
const totalRides    = computed(() => rideHistoryStore.rides.length)
const totalDistance = computed(() => rideHistoryStore.rides.reduce((s, r) => s + (r.distance || 0), 0))
const totalCalories = computed(() => rideHistoryStore.rides.reduce((s, r) => s + (r.calories || 0), 0))
const totalSeconds  = computed(() => rideHistoryStore.rides.reduce((s, r) => s + (r.duration || 0), 0))
const avgSafetyScore = computed(() => {
  const rides = rideHistoryStore.rides.filter(r => r.safetyScore != null)
  if (!rides.length) return 100
  return Math.round(rides.reduce((s, r) => s + r.safetyScore, 0) / rides.length)
})

// ── Filtered list ────────────────────────────────────────────────
const filteredRides = computed(() => {
  return rideHistoryStore.rides.filter(ride => {
    const title = ride.title || formatDateTitle(ride.startTime)
    const matchSearch = !searchQuery.value ||
      title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (ride.startTime || '').includes(searchQuery.value)
    const matchDiff = selectedDifficulty.value === 'All' || ride.difficulty === selectedDifficulty.value
    return matchSearch && matchDiff
  })
})

// ── Formatters ───────────────────────────────────────────────────
function formatTotalTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}小时${m}分` : `${m}分`
}

function formatDateTitle(isoStr) {
  if (!isoStr) return '骑行记录'
  const d = new Date(isoStr)
  return `${d.getMonth() + 1}月${d.getDate()}日 骑行`
}

function formatDate(isoStr) {
  if (!isoStr) return '--'
  const d = new Date(isoStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatTime(isoStr) {
  if (!isoStr) return '--'
  const d = new Date(isoStr)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function formatPace(pace) {
  if (!pace || pace <= 0 || !isFinite(pace)) return "--'--\""
  const mins = Math.floor(pace)
  const secs = Math.round((pace - mins) * 60)
  return `${mins}分${String(secs).padStart(2, '0')}秒 / 公里`
}

function diffClass(diff) {
  if (diff === 'Easy')   return 'rh-card__diff-badge--easy'
  if (diff === 'Medium') return 'rh-card__diff-badge--medium'
  if (diff === 'Hard')   return 'rh-card__diff-badge--hard'
  return ''
}

function diffLabel(diff) {
  if (diff === 'Easy')   return '游刃有余'
  if (diff === 'Medium') return '中效有氧'
  if (diff === 'Hard')   return '硬核拉练'
  return diff
}

function safetyScoreClass(score) {
  if (score == null) return ''
  if (score >= 90) return 'rh-bento-cell__safety-score--good'
  if (score >= 70) return 'rh-bento-cell__safety-score--warn'
  return 'rh-bento-cell__safety-score--bad'
}

// ── Expand / map ─────────────────────────────────────────────────
function toggleExpand(id) {
  if (expandedId.value === id) {
    expandedId.value = null
    return
  }
  expandedId.value = id
  nextTick(() => renderTrackMap(id))
}

function renderTrackMap(rideId) {
  const ride = rideHistoryStore.rides.find(r => r.id === rideId)
  if (!ride || !ride.trackPoints || ride.trackPoints.length === 0) return

  const containerId = 'ride-map-' + rideId
  const container = document.getElementById(containerId)
  if (!container) return

  if (mapInstances[rideId]) {
    mapInstances[rideId].destroy()
    delete mapInstances[rideId]
  }

  if (typeof BMapGL === 'undefined') return

  const map = new BMapGL.Map(containerId)
  mapInstances[rideId] = map

  const points = ride.trackPoints.map(p => new BMapGL.Point(p.lng, p.lat))
  if (points.length === 0) return

  const viewport = map.getViewport(points)
  map.centerAndZoom(viewport.center, viewport.zoom)
  map.enableScrollWheelZoom()

  const polyline = new BMapGL.Polyline(points, {
    strokeColor: '#00C49A',
    strokeWeight: 4,
    strokeOpacity: 0.85
  })
  map.addOverlay(polyline)

  const startLabel = new BMapGL.Label('起点', { position: points[0], offset: new BMapGL.Size(-16, -40) })
  startLabel.setStyle({ background: '#00C49A', color: '#fff', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontWeight: '600' })
  map.addOverlay(startLabel)

  const endLabel = new BMapGL.Label('终点', { position: points[points.length - 1], offset: new BMapGL.Size(-16, -40) })
  endLabel.setStyle({ background: '#FF6B35', color: '#fff', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontWeight: '600' })
  map.addOverlay(endLabel)
}

// ── Confirm ──────────────────────────────────────────────────────
function goBack() { router.push('/app') }

function confirmDelete(id) {
  confirmTitle.value = '删除记录'
  confirmMsg.value = '确定要删除这条骑行记录吗？'
  pendingConfirmAction = () => {
    rideHistoryStore.removeRide(id)
    if (expandedId.value === id) expandedId.value = null
    if (mapInstances[id]) { mapInstances[id].destroy(); delete mapInstances[id] }
  }
  showConfirm.value = true
}

function confirmClearAll() {
  confirmTitle.value = '清空记录'
  confirmMsg.value = '确定要清空所有骑行记录吗？此操作不可撤销。'
  pendingConfirmAction = () => {
    rideHistoryStore.clearAll()
    expandedId.value = null
    Object.keys(mapInstances).forEach(id => { mapInstances[id].destroy(); delete mapInstances[id] })
  }
  showConfirm.value = true
}

function confirmAction() {
  if (pendingConfirmAction) pendingConfirmAction()
  showConfirm.value = false
  pendingConfirmAction = null
}
</script>

<style scoped>
/* ── Base ──────────────────────────────────────────────────────── */
.ride-history {
  min-height: 100vh;
  background: #020817;
  color: #f1f5f9;
  font-family: 'Segoe UI', system-ui, sans-serif;
  position: relative;
}

.rh-ambient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 384px;
  background: linear-gradient(to bottom, rgba(16,185,129,0.10), rgba(6,182,212,0.05), transparent);
  filter: blur(48px);
  pointer-events: none;
  z-index: 0;
}

.rh-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 20px 40px;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ── Header ────────────────────────────────────────────────────── */
.rh-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  flex-wrap: wrap;
  gap: 12px;
}

.rh-header__brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rh-back-btn {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  color: #94a3b8;
  cursor: pointer;
  padding: 7px 10px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}
.rh-back-btn:hover { background: rgba(255,255,255,0.09); color: #fff; }

.rh-brand-icon {
  background: linear-gradient(135deg, #34d399, #22d3ee);
  color: #020817;
  padding: 9px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(52,211,153,0.25);
  flex-shrink: 0;
}

.rh-brand-title {
  font-size: 1.15rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.rh-brand-sub {
  color: #34d399;
  font-weight: 400;
}

.rh-brand-badge {
  background: rgba(52,211,153,0.10);
  color: #34d399;
  font-size: 10px;
  font-family: monospace;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid rgba(52,211,153,0.20);
  font-weight: 600;
}

.rh-brand-desc {
  font-size: 10px;
  color: #475569;
  font-family: monospace;
  margin-top: 2px;
  letter-spacing: 0.03em;
}

.rh-header__actions { display: flex; align-items: center; gap: 8px; }

.rh-clear-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.15);
  color: #f87171;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 7px 14px;
  border-radius: 10px;
  transition: all 0.2s;
}
.rh-clear-btn:hover { background: rgba(239,68,68,0.15); }

/* ── Stats Grid ────────────────────────────────────────────────── */
.rh-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (min-width: 640px) { .rh-stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 900px) { .rh-stats-grid { grid-template-columns: repeat(4, 1fr); } }

.rh-stat-card {
  background: linear-gradient(135deg, #0f172a, #020817);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  padding: 16px;
  transition: border-color 0.2s;
  cursor: default;
}
.rh-stat-card:hover { border-color: rgba(52,211,153,0.25); }

.rh-stat-card__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.rh-stat-card__label {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
}

.rh-stat-card__icon {
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.rh-stat-card__icon--emerald { background: rgba(52,211,153,0.10); color: #34d399; }
.rh-stat-card__icon--cyan    { background: rgba(34,211,238,0.10);  color: #22d3ee; }
.rh-stat-card__icon--amber   { background: rgba(245,158,11,0.10);  color: #f59e0b; }
.rh-stat-card__icon--blue    { background: rgba(96,165,250,0.10);  color: #60a5fa; }
.rh-stat-card__icon--purple  { background: rgba(167,139,250,0.10); color: #a78bfa; }
.rh-stat-card__icon--red     { background: rgba(248,113,113,0.10); color: #f87171; }

.rh-stat-card__val {
  font-size: 1.75rem;
  font-weight: 900;
  font-family: monospace;
  color: #fff;
  line-height: 1;
  margin-bottom: 4px;
}
.rh-stat-card__val--sm { font-size: 1.1rem; margin-bottom: 8px; }
.rh-stat-card__val--emerald { color: #34d399; }
.rh-stat-card__val--amber   { color: #f59e0b; }

.rh-stat-card__unit {
  font-size: 9px;
  color: #475569;
  font-family: monospace;
  letter-spacing: 0.05em;
}

/* ── Filter Bar ────────────────────────────────────────────────── */
.rh-filter-bar {
  background: rgba(15,23,42,0.5);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.rh-search-wrap {
  position: relative;
  width: 100%;
  max-width: 320px;
}

.rh-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #475569;
  pointer-events: none;
}

.rh-search-input {
  width: 100%;
  background: #020817;
  border: 1px solid rgba(255,255,255,0.08);
  color: #e2e8f0;
  border-radius: 10px;
  padding: 8px 14px 8px 36px;
  font-size: 12px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}
.rh-search-input:focus { border-color: rgba(52,211,153,0.4); }
.rh-search-input::placeholder { color: #334155; }

.rh-filter-pills {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.rh-filter-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #475569;
  font-weight: 500;
  white-space: nowrap;
}

.rh-pills {
  display: flex;
  gap: 2px;
  background: #020817;
  padding: 4px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.07);
}

.rh-pill {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 7px;
  border: 1px solid transparent;
  background: none;
  color: white;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.15s;
}
.rh-pill:hover { color: #fff; }
.rh-pill--active {
  background: rgba(52,211,153,0.10);
  color: #34d399;
  border-color: rgba(52,211,153,0.15);
  font-weight: 700;
}

/* ── Empty States ──────────────────────────────────────────────── */
.rh-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 64px 40px;
  text-align: center;
  border: 1px dashed rgba(255,255,255,0.07);
  border-radius: 16px;
  background: rgba(15,23,42,0.3);
}

.rh-empty__emoji { font-size: 2.5rem; filter: grayscale(1); }
.rh-empty__title { font-size: 0.9rem; font-weight: 700; color: #cbd5e1; }
.rh-empty__sub   { font-size: 0.75rem; color: #475569; }

.rh-reset-btn {
  margin-top: 8px;
  padding: 6px 14px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  color: white;
  border-radius: 10px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.rh-reset-btn:hover { color: #fff; border-color: rgba(255,255,255,0.15); }

/* ── Cards ─────────────────────────────────────────────────────── */
.rh-cards { display: flex; flex-direction: column; gap: 12px; }

.rh-card {
  background: rgba(15,23,42,0.55);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  overflow: hidden;
  transition: border-color 0.25s, box-shadow 0.25s;
}
.rh-card:hover { border-color: rgba(255,255,255,0.12); box-shadow: 0 4px 24px -8px rgba(0,0,0,0.4); }
.rh-card--expanded { border-color: rgba(52,211,153,0.15); }

/* Card header (collapsed) */
.rh-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s;
}
.rh-card__header:hover { background: rgba(255,255,255,0.02); }

.rh-card__header-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  flex: 1;
}

.rh-card__avatar {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.rh-card__info { min-width: 0; }

.rh-card__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.rh-card__title {
  font-size: 0.92rem;
  font-weight: 700;
  color: #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rh-card__diff-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid;
  font-weight: 600;
}
.rh-card__diff-badge--easy   { background: rgba(52,211,153,0.10); color: #34d399; border-color: rgba(52,211,153,0.20); }
.rh-card__diff-badge--medium { background: rgba(34,211,238,0.10);  color: #22d3ee; border-color: rgba(34,211,238,0.20); }
.rh-card__diff-badge--hard   { background: rgba(248,113,113,0.10); color: #f87171; border-color: rgba(248,113,113,0.20); }

.rh-card__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: white;
  font-family: monospace;
}

.rh-card__meta-item { display: flex; align-items: center; gap: 4px; }
.rh-card__meta-sep  { color: #1e293b; }
.rh-card__dist      { color: #34d399; font-weight: 700; }

.rh-card__header-right {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}

.rh-card__avg-speed {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.rh-card__avg-speed-label { font-size: 9px; color: #475569; font-family: monospace; text-transform: uppercase; letter-spacing: 0.05em; }
.rh-card__avg-speed-val   { font-size: 1rem; font-weight: 700; font-family: monospace; color: #e2e8f0; }
.rh-card__avg-speed-unit  { font-size: 11px; font-weight: 400; color: #475569; }

.rh-card__chevron-wrap {
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  padding: 5px;
  color: white;
  transition: color 0.2s;
}
.rh-card__header:hover .rh-card__chevron-wrap { color: #fff; }

.rh-card__chevron {
  display: block;
  transition: transform 0.3s ease;
}
.rh-card--expanded .rh-card__chevron { transform: rotate(180deg); }

/* ── Expanded section ──────────────────────────────────────────── */
.rh-card__expand {
  border-top: 1px solid rgba(255,255,255,0.06);
  background: rgba(2,8,23,0.5);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Bento grid */
.rh-bento {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
@media (min-width: 640px) { .rh-bento { grid-template-columns: repeat(4, 1fr); } }

.rh-bento-cell {
  background: rgba(15,23,42,0.9);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.rh-bento-cell--safety {
  grid-column: 1 / -1;
  flex-direction: column;
  gap: 10px;
}

.rh-bento-cell--weather {
  flex-direction: column;
  gap: 8px;
  position: relative;
}

.rh-bento-cell__icon {
  padding: 7px;
  border-radius: 8px;
  flex-shrink: 0;
  margin-top: 2px;
}
.rh-bento-cell__icon--emerald { background: rgba(52,211,153,0.10); color: #34d399; }
.rh-bento-cell__icon--cyan    { background: rgba(34,211,238,0.10);  color: #22d3ee; }
.rh-bento-cell__icon--amber   { background: rgba(245,158,11,0.10);  color: #f59e0b; }
.rh-bento-cell__icon--red     { background: rgba(248,113,113,0.10); color: #f87171; }

.rh-bento-cell__body { display: flex; flex-direction: column; gap: 3px; min-width: 0; }

.rh-bento-cell__label {
  font-size: 9px;
  color: #475569;
  font-family: monospace;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.rh-bento-cell__val {
  font-size: 0.82rem;
  font-weight: 700;
  color: #f1f5f9;
  font-family: monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rh-bento-cell__val--lg { font-size: 1.2rem; }
.rh-bento-cell__val--red { color: #f87171; }
.rh-bento-cell__val-unit { font-size: 11px; font-weight: 400; color: #475569; }

.rh-bento-cell__sub {
  font-size: 10px;
  color: white;
  font-family: monospace;
}
.rh-bento-cell__sub--cyan  strong { color: #22d3ee; }
.rh-bento-cell__sub--amber strong { color: #f59e0b; }

.rh-bento-cell__sensor-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 9px;
  background: rgba(255,255,255,0.06);
  color: #94a3b8;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.rh-bento-cell__weather-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.rh-bento-cell__weather-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rh-bento-cell__weather-lbl {
  display: block;
  font-size: 8px;
  color: #475569;
  line-height: 1;
}

.rh-bento-cell__weather-val {
  display: block;
  font-size: 12px;
  font-family: monospace;
  color: #cbd5e1;
  font-weight: 600;
}

/* Safety cell */
.rh-bento-cell__safety-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rh-bento-cell__safety-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: #475569;
  font-family: monospace;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.rh-bento-cell__safety-score {
  font-size: 0.9rem;
  font-weight: 800;
  font-family: monospace;
  padding: 2px 10px;
  border-radius: 6px;
}
.rh-bento-cell__safety-score--good { background: rgba(52,211,153,0.10); color: #34d399; }
.rh-bento-cell__safety-score--warn { background: rgba(245,158,11,0.10);  color: #f59e0b; }
.rh-bento-cell__safety-score--bad  { background: rgba(248,113,113,0.10); color: #f87171; }

.rh-bento-cell__safety-ok {
  font-size: 11px;
  color: rgba(52,211,153,0.9);
  background: rgba(52,211,153,0.05);
  border: 1px solid rgba(52,211,153,0.15);
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.rh-bento-cell__safety-warn {
  font-size: 11px;
  color: #fbbf24;
  background: rgba(251,191,36,0.05);
  border: 1px solid rgba(251,191,36,0.15);
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Map */
.rh-card__map {
  width: 100%;
  height: 280px;
  border-radius: 12px;
  overflow: hidden;
  background: #0d1520;
}

/* Delete row */
.rh-card__delete-row {
  display: flex;
  justify-content: flex-end;
  padding-top: 4px;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.rh-delete-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: rgba(127,29,29,0.2);
  border: 1px solid rgba(127,29,29,0.4);
  color: #f87171;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.rh-delete-btn:hover { background: rgba(127,29,29,0.35); border-color: rgba(239,68,68,0.5); }

/* ── Footer ────────────────────────────────────────────────────── */
.rh-footer {
  margin-top: 16px;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #475569;
  font-family: monospace;
  flex-wrap: wrap;
  gap: 8px;
}

.rh-footer__left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rh-footer__dot {
  width: 6px;
  height: 6px;
  background: #34d399;
  border-radius: 50%;
  animation: ping 1.5s ease infinite;
}

@keyframes ping {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.4; transform: scale(1.4); }
}

/* ── Confirm dialog ────────────────────────────────────────────── */
.rh-confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.rh-confirm {
  background: linear-gradient(145deg, #1e293b, #0f172a);
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.08);
  padding: 28px;
  min-width: 300px;
  max-width: 400px;
  box-shadow: 0 20px 60px -12px rgba(0,0,0,0.6);
}

.rh-confirm__title {
  font-size: 1rem;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 8px;
}

.rh-confirm__msg {
  font-size: 0.83rem;
  color: white;
  line-height: 1.5;
  margin-bottom: 24px;
}

.rh-confirm__actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.rh-confirm__btn {
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 600;
  transition: all 0.2s;
}

.rh-confirm__btn--cancel {
  background: rgba(255,255,255,0.05);
  color: white;
  border: 1px solid rgba(255,255,255,0.08);
}
.rh-confirm__btn--cancel:hover { background: rgba(255,255,255,0.09); }

.rh-confirm__btn--ok {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
}
.rh-confirm__btn--ok:hover { box-shadow: 0 2px 12px rgba(239,68,68,0.4); }
</style>

