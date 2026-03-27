<template>
  <SportBackground />
  <div class="ride-history">
    <!-- Top nav bar -->
    <nav class="rh-nav">
      <button class="rh-nav__back" @click="goBack">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        返回
      </button>
      <span class="rh-nav__title">骑行记录</span>
      <button v-if="rideHistoryStore.rides.length > 0" class="rh-nav__clear" @click="confirmClearAll">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        清空
      </button>
      <span v-else></span>
    </nav>

    <!-- Content -->
    <div class="rh-content">
      <!-- Empty state -->
      <div v-if="rideHistoryStore.rides.length === 0" class="rh-empty">
        <div class="rh-empty__icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3d4a5c" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18.5" cy="17.5" r="3.5"/>
            <circle cx="5.5" cy="17.5" r="3.5"/>
            <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="#3d4a5c"/>
            <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
          </svg>
        </div>
        <span class="rh-empty__text">暂无骑行记录</span>
        <span class="rh-empty__sub">设备上线骑行后将自动记录</span>
      </div>

      <!-- Grouped ride list -->
      <div v-else>
        <div v-for="group in rideHistoryStore.ridesGroupedByDate" :key="group.label" class="rh-group">
          <div class="rh-group__header">
            <div class="rh-group__line"></div>
            <span class="rh-group__label">{{ group.label }}</span>
            <div class="rh-group__line"></div>
          </div>

          <div
            v-for="ride in group.rides"
            :key="ride.id"
            class="rh-card"
            :class="{ 'rh-card--expanded': expandedId === ride.id }"
          >
            <div class="rh-card__main" @click="toggleExpand(ride.id)">
              <div class="rh-card__left">
                <div class="rh-card__time">
                  {{ formatTime(ride.startTime) }} - {{ formatTime(ride.endTime) }}
                </div>
                <div class="rh-card__meta">
                  <span class="rh-card__duration">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {{ formatDuration(ride.duration) }}
                  </span>
                  <span class="rh-card__distance">{{ ride.distance.toFixed(2) }} km</span>
                </div>
              </div>
              <div class="rh-card__stats">
                <div class="rh-card__stat">
                  <span class="rh-card__stat-val">{{ ride.avgSpeed.toFixed(1) }}</span>
                  <span class="rh-card__stat-lbl">均速</span>
                </div>
                <div class="rh-card__stat">
                  <span class="rh-card__stat-val">{{ ride.maxSpeed.toFixed(1) }}</span>
                  <span class="rh-card__stat-lbl">最高</span>
                </div>
                <div class="rh-card__stat">
                  <span class="rh-card__stat-val rh-card__stat-val--cal">{{ ride.calories || 0 }}</span>
                  <span class="rh-card__stat-lbl">千卡</span>
                </div>
              </div>
              <div class="rh-card__actions">
                <button class="rh-card__delete" @click.stop="confirmDelete(ride.id)" title="删除">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
                <svg class="rh-card__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8892A0" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>

            <!-- Expanded: detail + map -->
            <div v-if="expandedId === ride.id" class="rh-card__expand">
              <div class="rh-card__detail-grid">
                <div class="rh-card__detail">
                  <span class="rh-card__detail-label">配速</span>
                  <span class="rh-card__detail-val">{{ formatPace(ride.pace) }}</span>
                </div>
                <div class="rh-card__detail">
                  <span class="rh-card__detail-label">卡路里</span>
                  <span class="rh-card__detail-val rh-card__detail-val--cal">{{ ride.calories || 0 }} kcal</span>
                </div>
                <div class="rh-card__detail" v-if="ride.avgTemp != null">
                  <span class="rh-card__detail-label">平均温度</span>
                  <span class="rh-card__detail-val">{{ ride.avgTemp }}°C</span>
                </div>
                <div class="rh-card__detail" v-if="ride.avgHumidity != null">
                  <span class="rh-card__detail-label">平均湿度</span>
                  <span class="rh-card__detail-val">{{ ride.avgHumidity }}%</span>
                </div>
                <div class="rh-card__detail">
                  <span class="rh-card__detail-label">超速次数</span>
                  <span class="rh-card__detail-val" :class="{ 'rh-card__detail-val--warn': ride.speedOverCount > 0 }">{{ ride.speedOverCount || 0 }}</span>
                </div>
                <div class="rh-card__detail">
                  <span class="rh-card__detail-label">安全评分</span>
                  <span class="rh-card__detail-val" :class="safetyClass(ride.safetyScore)">{{ ride.safetyScore != null ? ride.safetyScore : '--' }}</span>
                </div>
              </div>
              <div :id="'ride-map-' + ride.id" class="rh-card__map"></div>
            </div>
          </div>
        </div>
      </div>
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
import { ref, nextTick } from 'vue'
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

// 展开的地图实例缓存
const mapInstances = {}

function goBack() {
  router.push('/app')
}

function formatTime(isoStr) {
  if (!isoStr) return '--'
  const d = new Date(isoStr)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function formatPace(pace) {
  if (!pace || pace <= 0 || !isFinite(pace)) return '--'
  const mins = Math.floor(pace)
  const secs = Math.round((pace - mins) * 60)
  return `${mins}'${String(secs).padStart(2, '0')}"/km`
}

function safetyClass(score) {
  if (score == null) return ''
  if (score >= 80) return 'rh-card__detail-val--safe'
  if (score >= 60) return 'rh-card__detail-val--warn'
  return 'rh-card__detail-val--danger'
}

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

  // 清理旧实例
  if (mapInstances[rideId]) {
    mapInstances[rideId].destroy()
    delete mapInstances[rideId]
  }

  if (typeof BMapGL === 'undefined') return

  const map = new BMapGL.Map(containerId)
  mapInstances[rideId] = map

  // 计算中心点和边界
  const points = ride.trackPoints.map(p => new BMapGL.Point(p.lng, p.lat))
  if (points.length === 0) return

  // 设置视图
  const viewport = map.getViewport(points)
  map.centerAndZoom(viewport.center, viewport.zoom)
  map.enableScrollWheelZoom()

  // 绘制轨迹线
  const polyline = new BMapGL.Polyline(points, {
    strokeColor: '#00C49A',
    strokeWeight: 4,
    strokeOpacity: 0.8
  })
  map.addOverlay(polyline)

  // 起点标记
  const startPoint = points[0]
  const startLabel = new BMapGL.Label('起点', {
    position: startPoint,
    offset: new BMapGL.Size(-16, -40)
  })
  startLabel.setStyle({
    background: '#00C49A',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '2px 8px',
    fontSize: '11px',
    fontWeight: '600'
  })
  map.addOverlay(startLabel)

  // 终点标记
  const endPoint = points[points.length - 1]
  const endLabel = new BMapGL.Label('终点', {
    position: endPoint,
    offset: new BMapGL.Size(-16, -40)
  })
  endLabel.setStyle({
    background: '#FF6B35',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '2px 8px',
    fontSize: '11px',
    fontWeight: '600'
  })
  map.addOverlay(endLabel)
}

function confirmDelete(id) {
  confirmTitle.value = '删除记录'
  confirmMsg.value = '确定要删除这条骑行记录吗？'
  pendingConfirmAction = () => {
    rideHistoryStore.removeRide(id)
    if (expandedId.value === id) expandedId.value = null
    if (mapInstances[id]) {
      mapInstances[id].destroy()
      delete mapInstances[id]
    }
  }
  showConfirm.value = true
}

function confirmClearAll() {
  confirmTitle.value = '清空记录'
  confirmMsg.value = '确定要清空所有骑行记录吗？此操作不可撤销。'
  pendingConfirmAction = () => {
    rideHistoryStore.clearAll()
    expandedId.value = null
    Object.keys(mapInstances).forEach(id => {
      mapInstances[id].destroy()
      delete mapInstances[id]
    })
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
.ride-history {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Nav */
.rh-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: rgba(15, 25, 35, 0.95);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
}

.rh-nav__back {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #E8ECF1;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 6px 10px;
  border-radius: 8px;
  transition: background 0.2s;
}

.rh-nav__back:hover {
  background: rgba(255, 255, 255, 0.06);
}

.rh-nav__title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #E8ECF1;
}

.rh-nav__clear {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.15);
  color: #FF4757;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 8px;
  transition: background 0.2s;
}

.rh-nav__clear:hover {
  background: rgba(255, 71, 87, 0.2);
}

/* Content */
.rh-content {
  flex: 1;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 24px;
  box-sizing: border-box;
}

/* Empty */
.rh-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 40px;
  text-align: center;
}

.rh-empty__icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.rh-empty__text {
  font-size: 1rem;
  font-weight: 600;
  color: #8892A0;
}

.rh-empty__sub {
  font-size: 0.78rem;
  color: #4a5568;
}

/* Group */
.rh-group {
  margin-bottom: 24px;
}

.rh-group__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.rh-group__line {
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
}

.rh-group__label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #8892A0;
  white-space: nowrap;
}

/* Card */
.rh-card {
  background: linear-gradient(145deg, #1a2332 0%, #151d2b 100%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 10px;
  overflow: hidden;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.rh-card--expanded {
  border-color: rgba(0, 196, 154, 0.15);
  box-shadow: 0 4px 20px -6px rgba(0, 196, 154, 0.1);
}

.rh-card__main {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.rh-card__main:hover {
  background: rgba(255, 255, 255, 0.02);
}

.rh-card__left {
  flex: 1;
  min-width: 0;
}

.rh-card__time {
  font-size: 0.95rem;
  font-weight: 700;
  color: #E8ECF1;
  font-family: 'Segoe UI', monospace;
  margin-bottom: 4px;
}

.rh-card__meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rh-card__duration {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #8892A0;
}

.rh-card__distance {
  font-size: 0.75rem;
  color: #00C49A;
  font-weight: 600;
}

.rh-card__stats {
  display: flex;
  gap: 16px;
}

.rh-card__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.rh-card__stat-val {
  font-size: 0.9rem;
  font-weight: 700;
  color: #E8ECF1;
  font-family: 'Segoe UI', monospace;
}

.rh-card__stat-val--warn {
  color: #FF6B35;
}

.rh-card__stat-val--cal {
  color: #FF6B35;
}

/* Detail grid (expanded) */
.rh-card__detail-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}

.rh-card__detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 8px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.rh-card__detail-label {
  font-size: 0.65rem;
  color: #556;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.rh-card__detail-val {
  font-size: 0.88rem;
  font-weight: 700;
  color: #E8ECF1;
  font-family: 'Segoe UI', monospace;
}

.rh-card__detail-val--cal {
  color: #FF6B35;
}

.rh-card__detail-val--safe {
  color: #00C49A;
}

.rh-card__detail-val--warn {
  color: #FFD93D;
}

.rh-card__detail-val--danger {
  color: #FF4757;
}

.rh-card__stat-lbl {
  font-size: 0.62rem;
  color: #556;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.rh-card__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rh-card__delete {
  background: none;
  border: none;
  color: #556;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.rh-card__delete:hover {
  color: #FF4757;
  background: rgba(255, 71, 87, 0.1);
}

.rh-card__chevron {
  transition: transform 0.3s ease;
}

.rh-card--expanded .rh-card__chevron {
  transform: rotate(180deg);
}

/* Expanded map */
.rh-card__expand {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: 12px;
}

.rh-card__map {
  width: 100%;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  background: #0d1520;
}

/* Confirm dialog */
.rh-confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.rh-confirm {
  background: linear-gradient(145deg, #1e2d3d, #182430);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 28px;
  min-width: 300px;
  max-width: 400px;
  box-shadow: 0 20px 60px -12px rgba(0, 0, 0, 0.5);
}

.rh-confirm__title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #E8ECF1;
  margin-bottom: 8px;
}

.rh-confirm__msg {
  font-size: 0.85rem;
  color: #8892A0;
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
  background: rgba(255, 255, 255, 0.06);
  color: #8892A0;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.rh-confirm__btn--cancel:hover {
  background: rgba(255, 255, 255, 0.1);
}

.rh-confirm__btn--ok {
  background: linear-gradient(135deg, #FF6B35, #FF4757);
  color: #fff;
}

.rh-confirm__btn--ok:hover {
  box-shadow: 0 2px 12px rgba(255, 107, 53, 0.4);
}

/* Responsive */
@media (max-width: 640px) {
  .rh-content {
    padding: 16px;
  }

  .rh-card__main {
    flex-wrap: wrap;
    gap: 12px;
    padding: 14px 16px;
  }

  .rh-card__stats {
    gap: 12px;
  }

  .rh-card__map {
    height: 220px;
  }
}
</style>
