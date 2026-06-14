<template>
  <div class="twin-wrap">
    <!-- Header -->
    <div class="twin-header">
      <div class="twin-header__title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        数字孪生 · 实时状态
      </div>
      <div class="twin-header__right">
        <button class="track-btn track-btn--status" @click="goDeviceStatus" title="设备状态">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          设备状态
        </button>
        <button class="track-btn track-btn--nav" @click="sheetState === 'mini' ? openFullSheet() : (sheetState = 'mini')" title="骑行导航">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
          导航
        </button>
        <span class="badge" :class="connected ? 'badge--on' : 'badge--off'">
          <i></i>{{ connected ? '数据同步中' : '等待连接' }}
        </span>
      </div>
    </div>

    <!-- 主体：全屏地图 + 悬浮仪表盘 -->
    <div class="twin-body">
      <!-- 高德 3D 地图容器（全屏） -->
      <div ref="mapContainerRef" class="map-fullscreen"></div>

      <!-- iOS 风格三态导航面板 -->
      <div v-if="!navActive" class="sheet-backdrop" :class="{ 'sheet-backdrop--visible': sheetState === 'full' }" @click="sheetState = 'mini'"></div>
      <div
        v-if="!navActive"
        class="nav-sheet-v2"
        :class="'nav-sheet-v2--' + sheetState"
        @touchstart="onSheetTouchStart"
        @touchmove="onSheetTouchMove"
        @touchend="onSheetTouchEnd"
      >
        <!-- 拖拽手柄 -->
        <div class="sheet-handle"><div class="sheet-handle__bar"></div></div>

        <!-- Mini 态：搜索胶囊 -->
        <div v-if="sheetState === 'mini'" class="sheet-mini" @click="openFullSheet">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span class="sheet-mini__text">搜索目的地 或 AI 推荐骑行路线</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
        </div>

        <!-- Full 态：完整搜索 + AI 推荐 -->
        <div v-if="sheetState === 'full'" class="sheet-full">
          <div class="sheet-full__input-row">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              ref="sheetInputRef"
              v-model="navInput"
              class="sheet-full__input"
              placeholder="输入目的地..."
              @keyup.enter="handleSheetSearch"
            />
            <button v-if="navInput.trim()" class="sheet-full__search-btn" @click="handleSheetSearch">搜索</button>
            <button class="sheet-full__cancel" @click="sheetState = 'mini'">取消</button>
          </div>

          <div class="sheet-full__divider">AI 智能推荐</div>
          <div class="sheet-full__levels">
            <button class="sheet-level-btn" :class="{ active: navSelectedLevel === 'short' }" @click="fetchRecommend('short')" :disabled="navLoading">
              <span class="sheet-level-icon">🚴</span><span>短途</span><small>5-10km</small>
            </button>
            <button class="sheet-level-btn" :class="{ active: navSelectedLevel === 'medium' }" @click="fetchRecommend('medium')" :disabled="navLoading">
              <span class="sheet-level-icon">🚵</span><span>中途</span><small>15-25km</small>
            </button>
            <button class="sheet-level-btn" :class="{ active: navSelectedLevel === 'long' }" @click="fetchRecommend('long')" :disabled="navLoading">
              <span class="sheet-level-icon">🏔️</span><span>长途</span><small>35-50km</small>
            </button>
          </div>

          <div v-if="navLoading" class="sheet-loading">
            <div class="sheet-loading__spinner"></div> AI 推荐中...
          </div>

          <div v-if="navRecommends.length > 0" class="sheet-recommend-list">
            <div
              v-for="(item, idx) in navRecommends"
              :key="idx"
              class="sheet-recommend-card"
              :class="{ 'sheet-recommend-card--selected': navSelected === item }"
              @click="item.name !== '推荐失败' && previewLocation(item)"
            >
              <div class="sheet-recommend-card__idx">{{ idx + 1 }}</div>
              <div class="sheet-recommend-card__body">
                <div class="sheet-recommend-card__name">{{ item.name }}</div>
                <div class="sheet-recommend-card__reason">{{ item.reason }}</div>
                <div class="sheet-recommend-card__meta">
                  <span v-if="item.distanceKm">📍 {{ item.distanceKm }} km</span>
                  <span v-if="item.durationMin">⏱ {{ item.durationMin }} min</span>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        </div>

        <!-- Preview 态：地点信息 + 导航按钮 -->
        <div v-if="sheetState === 'preview' && previewInfo" class="sheet-preview">
          <div class="sheet-preview__header">
            <div class="sheet-preview__icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
            </div>
            <div class="sheet-preview__info">
              <div class="sheet-preview__name">{{ previewInfo.name }}</div>
              <div class="sheet-preview__dist">约 {{ previewInfo.distanceKm }} km · 骑行约 {{ Math.round((previewInfo.distanceKm || 0) / 0.25) }} 分钟</div>
            </div>
          </div>
          <button class="sheet-preview__nav-btn" @click="startNavFromPreview">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            开始导航
          </button>
          <button class="sheet-preview__back" @click="clearPreview(); sheetState = 'full'">
            ← 返回搜索
          </button>
        </div>
      </div>

      <!-- 导航 HUD 卡片（重新设计：双层布局） -->
      <transition name="hud-drop">
        <div v-if="navActive" class="nav-hud">
          <!-- 上层：方向 + 指令 -->
          <div class="nav-hud__main">
            <div class="nav-hud__direction">
              <svg v-if="navDirectionIcon === '↰'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4L3 10l6 6"/><path d="M3 10h12a4 4 0 0 1 4 4v6"/></svg>
              <svg v-else-if="navDirectionIcon === '↱'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4l6 6-6 6"/><path d="M21 10H9a4 4 0 0 0-4 4v6"/></svg>
              <svg v-else-if="navDirectionIcon === '⚑'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
              <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>
            </div>
            <div class="nav-hud__info">
              <div class="nav-hud__dist">{{ navRemainDist > 1000 ? (navRemainDist / 1000).toFixed(1) + ' km' : Math.round(navRemainDist) + ' m' }}</div>
              <div class="nav-hud__action" :key="navInstruction">{{ navInstruction }}</div>
            </div>
            <div class="nav-hud__actions">
              <button class="nav-hud-btn nav-hud-btn--change" @click="clearNavigation(); sheetState = 'full'" title="更改目的地">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="nav-hud-btn nav-hud-btn--stop" @click="clearNavigation" title="结束导航">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
              </button>
            </div>
          </div>
          <!-- 下层：目的地 + 剩余总距 + ETA -->
          <div class="nav-hud__meta">
            <span class="nav-hud__dest">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
              {{ navDestName }}
            </span>
            <span class="nav-hud__sep">|</span>
            <span class="nav-hud__total-dist">{{ navTotalRemainText }}</span>
            <span class="nav-hud__sep">|</span>
            <span class="nav-hud__eta">{{ navEtaText }}</span>
          </div>
        </div>
      </transition>

      <!-- 底部导航摘要栏 -->
      <transition name="bar-slide-up">
        <div v-if="navActive" class="nav-bottom-bar">
          <div class="nav-bottom-item">
            <div class="nav-bottom-val">{{ navTotalRemainText }}</div>
            <div class="nav-bottom-label">剩余距离</div>
          </div>
          <div class="nav-bottom-divider"></div>
          <div class="nav-bottom-item">
            <div class="nav-bottom-val">{{ navEtaText }}</div>
            <div class="nav-bottom-label">预计到达</div>
          </div>
          <div class="nav-bottom-divider"></div>
          <div class="nav-bottom-item">
            <div class="nav-bottom-val">{{ currentSpeedText }}</div>
            <div class="nav-bottom-label">当前速度</div>
          </div>
        </div>
      </transition>

      <!-- 跌倒警告（叠在地图上） -->
      <transition name="alert-fade">
        <div v-if="fallAlert" class="twin-alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          跌倒警告！
        </div>
      </transition>

      <!-- 左上角：3D头盔 + 状态面板（导航时折叠为迷你圆球） -->
      <transition name="panel-collapse">
        <div v-if="!navActive || sidePanelExpanded" class="side-panel" :class="{ 'side-panel--nav': navActive }">
          <!-- 3D 头盔姿态视图 -->
          <div class="helmet3d-panel">
            <canvas ref="helmetCanvasRef" class="helmet3d-canvas"></canvas>
            <div class="helmet3d-label">头盔姿态 · 实时</div>
          </div>

          <!-- 直观状态卡片 -->
          <div class="status-panel">
            <div class="status-item">
              <span class="status-icon">↔</span>
              <div class="status-text">
                <div class="status-name">左右倾斜</div>
                <div class="status-val" :style="{ color: rollStatusColor }">{{ rollStatusText }}</div>
              </div>
            </div>
            <div class="status-item">
              <span class="status-icon">↕</span>
              <div class="status-text">
                <div class="status-name">前后俯仰</div>
                <div class="status-val" :style="{ color: pitchStatusColor }">{{ pitchStatusText }}</div>
              </div>
            </div>
            <div class="status-item">
              <span class="status-icon">⚡</span>
              <div class="status-text">
                <div class="status-name">运动强度</div>
                <div class="status-val" :style="{ color: avmStatusColor }">{{ avmStatusText }}</div>
              </div>
            </div>
            <div class="status-item">
              <span class="status-icon">⬡</span>
              <div class="status-text">
                <div class="status-name">整体稳定</div>
                <div class="status-val" :style="{ color: gvmStatusColor }">{{ gvmStatusText }}</div>
              </div>
            </div>
          </div>
          <!-- 导航模式下显示收起按钮 -->
          <button v-if="navActive" class="side-panel__collapse-btn" @click="sidePanelExpanded = false">收起 ▲</button>
        </div>
      </transition>

      <!-- 导航时的迷你状态球 -->
      <transition name="orb-pop">
        <div v-if="navActive && !sidePanelExpanded" class="nav-mini-orb" @click="sidePanelExpanded = true" title="展开状态面板">
          <div class="nav-mini-orb__ring" :style="{ borderColor: overallStatusColor }"></div>
          <div class="nav-mini-orb__icon">⬡</div>
        </div>
      </transition>

      <!-- 轨迹点数量提示（右下角） -->
      <div class="track-info" v-if="trackPoints.length > 0">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        轨迹 {{ trackPoints.length }} 点
      </div>

      <!-- 无实时数据提示（右下角，轨迹点为0时显示） -->
      <div class="no-data-hint" v-if="!connected && trackPoints.length === 0">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        显示最后已知数据
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import request from '@/utils/request'
import { useRouter } from 'vue-router'

const router = useRouter()
function goDeviceStatus() { router.push('/device-status') }

const props = defineProps({
  sensorData: { type: Object, default: () => ({}) },
  connected: { type: Boolean, default: false },
  weatherData: { type: Object, default: null },
  deviceStatus: { type: Object, default: null }
})

// DOM refs
const mapContainerRef = ref(null)
const helmetCanvasRef = ref(null)

// Three.js
let threeRenderer = null
let threeScene = null
let threeCamera = null
let helmetModel = null
let threeAnimId = null

// State
const fallAlert = ref(false)
const isReplaying = ref(false)
const viewMode = ref('follow')
const replaySpeed = ref(1)
const sidePanelExpanded = ref(false)  // 导航模式下侧面板是否展开

// Navigation state
const sheetState = ref('mini')   // 'mini' | 'full' | 'preview'
const sheetInputRef = ref(null)
const navPanelOpen = ref(false)  // legacy compat
const navInput = ref('')
const navRecommends = ref([])   // array of 3
const navSelected = ref(null)   // currently selected recommend item
const navLoading = ref(false)
const navSelectedLevel = ref('')
const navPolylines = ref([])
const navSteps = ref([])
const navStepIndex = ref(0)
const navActive = ref(false)
const navInstruction = ref('')
const navDestName = ref('')

// 地点预览（AI推荐点击后飞到地图上）
const previewInfo = ref(null)  // { name, distanceKm, coord: {lng, lat} }
let previewMarker = null

const navRemainDist = ref(0)
let navRemainingPath = []   // 导航剩余路径点（实时裁剪用）
let navPolylineRemain = null // 剩余路径 Polyline 实例
let navPolylineGlow = null   // 导航路线发光底层
let navPolylineDirLayer = null // 导航路线方向层
let navPolylinePassed = null // 已走过路段（灰色）
let navFullPath = []         // 完整路径（用于已走段计算）
const navTotalDist = ref(0)  // 导航总距离（米）
const navCurrentSpeed = ref(0) // 当前速度 km/h

const navDirectionIcon = computed(() => {
  const text = navInstruction.value
  if (text.includes('左转')) return '↰'
  if (text.includes('右转')) return '↱'
  if (text.includes('到达')) return '⚑'
  return '↑'
})

// 导航摘要 computed
const navTotalRemainText = computed(() => {
  // 用剩余路径点估算总剩余距离
  if (navRemainingPath.length < 2) {
    return navRemainDist.value > 1000
      ? (navRemainDist.value / 1000).toFixed(1) + ' km'
      : Math.round(navRemainDist.value) + ' m'
  }
  let total = 0
  for (let i = 1; i < navRemainingPath.length; i++) {
    const [lng1, lat1] = navRemainingPath[i - 1]
    const [lng2, lat2] = navRemainingPath[i]
    total += calcDistance(lat1, lng1, lat2, lng2)
  }
  return total > 1000 ? (total / 1000).toFixed(1) + ' km' : Math.round(total) + ' m'
})

const navEtaText = computed(() => {
  const speed = navCurrentSpeed.value || 15 // 默认 15km/h 骑行速度
  let remainMeters = 0
  if (navRemainingPath.length >= 2) {
    for (let i = 1; i < navRemainingPath.length; i++) {
      const [lng1, lat1] = navRemainingPath[i - 1]
      const [lng2, lat2] = navRemainingPath[i]
      remainMeters += calcDistance(lat1, lng1, lat2, lng2)
    }
  } else {
    remainMeters = navRemainDist.value
  }
  const minutes = Math.round((remainMeters / 1000) / speed * 60)
  if (minutes < 1) return '即将到达'
  if (minutes < 60) return `${minutes} 分钟`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m}min`
})

const currentSpeedText = computed(() => {
  const s = navCurrentSpeed.value
  if (s < 1) return '0 km/h'
  return s.toFixed(1) + ' km/h'
})

// 整体状态颜色（用于迷你圆球）
const overallStatusColor = computed(() => {
  const maxAngle = Math.max(Math.abs(roll.value), Math.abs(pitch.value))
  if (maxAngle > 20 || gvm.value > 30) return '#FF6B6B'
  if (maxAngle > 10 || gvm.value > 15) return '#FFD93D'
  return '#4ade80'
})

// Sensor values
const roll = ref(0)
const pitch = ref(0)
const yaw = ref(0)
const avm = ref(0)
const gvm = ref(0)

// ── 直观状态描述 ──────────────────────────────────────────────────────────────
const rollStatusText = computed(() => {
  const v = roll.value
  if (Math.abs(v) < 5) return '水平'
  if (v > 0) return v > 20 ? `右倾 ${v.toFixed(0)}° ⚠` : `右倾 ${v.toFixed(0)}°`
  return Math.abs(v) > 20 ? `左倾 ${Math.abs(v).toFixed(0)}° ⚠` : `左倾 ${Math.abs(v).toFixed(0)}°`
})
const rollStatusColor = computed(() => {
  const v = Math.abs(roll.value)
  return v > 20 ? '#FF6B6B' : v > 10 ? '#FFD93D' : '#4ade80'
})

const pitchStatusText = computed(() => {
  const v = pitch.value
  if (Math.abs(v) < 5) return '平视'
  if (v > 0) return v > 20 ? `低头 ${v.toFixed(0)}° ⚠` : `低头 ${v.toFixed(0)}°`
  return Math.abs(v) > 20 ? `抬头 ${Math.abs(v).toFixed(0)}° ⚠` : `抬头 ${Math.abs(v).toFixed(0)}°`
})
const pitchStatusColor = computed(() => {
  const v = Math.abs(pitch.value)
  return v > 20 ? '#FF6B6B' : v > 10 ? '#FFD93D' : '#4ade80'
})

const avmStatusText = computed(() => {
  const v = avm.value
  if (v < 10) return '静止'
  if (v < 30) return '轻微晃动'
  if (v < 60) return '中等运动'
  return '剧烈运动 ⚠'
})
const avmStatusColor = computed(() => {
  const v = avm.value
  return v > 60 ? '#FF6B6B' : v > 30 ? '#FFD93D' : '#4ade80'
})

const gvmStatusText = computed(() => {
  const v = gvm.value
  if (v < 5) return '非常稳定'
  if (v < 15) return '基本稳定'
  if (v < 30) return '轻微倾斜'
  return '大幅倾斜 ⚠'
})
const gvmStatusColor = computed(() => {
  const v = gvm.value
  return v > 30 ? '#FF6B6B' : v > 15 ? '#FFD93D' : '#4ade80'
})

// Track
const trackPoints = ref([]) // [{ lat, lng, yaw }]

// AMap instances
let amap = null
let helmetMarker = null
let polylineGlow = null   // 发光底层（宽、半透明）
let polylineMain = null   // 主线（亮色）
let polylineDir = null    // 方向箭头层
let replayTimer = null

// 数据库读到的最新位置，用于导航起点 fallback（避免硬编码北京）
const initialPosition = ref(null)  // { lat, lng }

// ── 头盔 SVG Marker HTML ──────────────────────────────────────────────────────
function buildHelmetMarkerHTML(yawDeg) {
  return `
    <div style="
      width:44px; height:44px;
      transform: rotate(${yawDeg}deg);
      transform-origin: center center;
      position: relative;
      filter: drop-shadow(0 0 6px #00D9FF);
    ">
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- 头盔俯视轮廓 -->
        <ellipse cx="22" cy="24" rx="14" ry="12" fill="#1a3a5c" stroke="#00D9FF" stroke-width="1.5"/>
        <!-- 头盔顶部圆弧 -->
        <path d="M10 22 Q22 6 34 22" fill="#0d2a45" stroke="#00D9FF" stroke-width="1.5"/>
        <!-- 护目镜 -->
        <path d="M14 22 Q22 18 30 22" fill="none" stroke="#00f2ff" stroke-width="1.2" opacity="0.8"/>
        <!-- 方向指示箭头（朝上=前方） -->
        <polygon points="22,4 18,12 22,10 26,12" fill="#00D9FF" opacity="0.95"/>
        <!-- 中心点 -->
        <circle cx="22" cy="24" r="2.5" fill="#00D9FF" opacity="0.9"/>
        <!-- 脉冲环 -->
        <circle cx="22" cy="24" r="6" fill="none" stroke="#00D9FF" stroke-width="1" opacity="0.4"/>
      </svg>
    </div>
  `
}

// ── Three.js 3D 头盔姿态视图 ──────────────────────────────────────────────────
function initHelmet3D() {
  const canvas = helmetCanvasRef.value
  if (!canvas) return

  threeRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  threeRenderer.setPixelRatio(1)
  threeRenderer.setSize(220, 220, false)
  threeRenderer.setClearColor(0x000000, 0)

  threeScene = new THREE.Scene()

  threeCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
  threeCamera.position.set(0, 0, 3)
  threeCamera.lookAt(0, 0, 0)

  // 环境光
  threeScene.add(new THREE.AmbientLight(0xffffff, 0.6))
  // 主方向光（青色调）
  const dirLight = new THREE.DirectionalLight(0x00D9FF, 1.2)
  dirLight.position.set(2, 4, 3)
  threeScene.add(dirLight)
  // 补光
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.4)
  fillLight.position.set(-2, -1, -2)
  threeScene.add(fillLight)

  const loader = new GLTFLoader()
  loader.load(
    '/models/envoy.glb',
    (gltf) => {
      const model = gltf.scene
      // 以高度为基准归一化，让头盔垂直方向充满视口
      const box = new THREE.Box3().setFromObject(model)
      const center = new THREE.Vector3()
      box.getCenter(center)
      const size = new THREE.Vector3()
      box.getSize(size)

      // 先缩放，再居中（顺序不能反）
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = 1.2 / maxDim
      model.scale.setScalar(scale)

      // 世界中心 = position + scale × localCenter，要让它为 0：position = -scale × center
      model.position.set(-center.x * scale, -center.y * scale, -center.z * scale)

      // 相机距离：视野高度覆盖缩放后最大尺寸，留 20% 边距
      const fovRad = THREE.MathUtils.degToRad(45)
      const camDist = (1.2 / 2) / Math.tan(fovRad / 2) * 1.2
      threeCamera.position.set(0, 0, camDist)
      threeCamera.lookAt(0, 0, 0)

      console.log('[HelmetTwin] 模型原始尺寸:', size.x.toFixed(2), 'x', size.y.toFixed(2), 'x', size.z.toFixed(2), '缩放:', scale.toFixed(4), '相机距离:', camDist.toFixed(2))

      threeScene.add(model)
      helmetModel = model
      console.log('[HelmetTwin] 3D 头盔模型加载完成')
    },
    undefined,
    (err) => {
      console.warn('[HelmetTwin] 3D 模型加载失败:', err)
    }
  )

  renderHelmet3D()
}

function renderHelmet3D() {
  threeAnimId = requestAnimationFrame(renderHelmet3D)
  if (helmetModel) {
    helmetModel.rotation.set(
      THREE.MathUtils.degToRad(pitch.value),
      THREE.MathUtils.degToRad(-yaw.value),
      THREE.MathUtils.degToRad(roll.value),
      'YXZ'
    )
  }
  if (threeRenderer && threeScene && threeCamera) {
    threeRenderer.render(threeScene, threeCamera)
  }
}

// ── AMap 初始化 ───────────────────────────────────────────────────────────────
function initAMap() {
  if (!mapContainerRef.value) return

  const tryInit = () => {
    if (typeof AMap === 'undefined') {
      setTimeout(tryInit, 100)
      return
    }

    // 确保容器有实际尺寸再初始化
    const container = mapContainerRef.value
    if (!container || container.clientWidth === 0 || container.clientHeight === 0) {
      setTimeout(tryInit, 50)
      return
    }

    AMap.plugin(['AMap.Scale', 'AMap.ControlBar', 'AMap.Buildings'], () => {
      amap = new AMap.Map(container, {
        zoom: 18,
        center: [116.404, 39.915],
        viewMode: '3D',
        pitch: 62,
        rotation: 0,
        buildingAnimation: true,
        mapStyle: 'amap://styles/dark'
      })

      amap.setFeatures(['bg', 'road', 'building', 'point'])

      // 3D 建筑图层（插件加载后才能用）
      const buildings = new AMap.Buildings({ zooms: [14, 20], zIndex: 10, heightFactor: 1 })
      amap.add(buildings)

      amap.addControl(new AMap.Scale())
      amap.addControl(new AMap.ControlBar({ position: { right: '10px', top: '10px' } }))

      // 加载完成后定位到数据库最新位置
      loadInitialPosition()

      console.log('[HelmetTwin] 高德 3D 地图初始化完成')
    })
  }

  tryInit()
}

// ── 加载数据库最新位置作为地图初始中心 ──────────────────────────────────────
async function loadInitialPosition() {
  try {
    const res = await request.get('/sensor/latest-gps')
    const data = res.data
    if (!data || !data.latitude || !data.longitude) {
      console.log('[HelmetTwin] 数据库无 GPS 记录，保持默认中心')
      return
    }
    const lat = Number(data.latitude)
    const lng = Number(data.longitude)
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      amap.setCenter([lng, lat])
      initialPosition.value = { lat, lng }
      console.log('[HelmetTwin] 初始位置已定位到数据库最新 GPS:', lng, lat)

      // 用数据库最新记录填充姿态面板，让页面有内容显示
      roll.value  = Number(data.roll)  || 0
      pitch.value = Number(data.pitch) || 0
      yaw.value   = Number(data.yaw)   || 0
      avm.value   = Number(data.avm)   || 0
      gvm.value   = Number(data.gvm)   || 0

      // 在地图上放一个静态 marker 表示最后已知位置
      updateHelmetMarker([lng, lat], yaw.value)
    }
  } catch (e) {
    console.warn('[HelmetTwin] 加载初始位置失败:', e.message)
  }
}

// ── Marker 更新 ───────────────────────────────────────────────────────────────
function updateHelmetMarker(lngLat, yawDeg) {
  if (!amap) return
  if (!isFinite(lngLat[0]) || !isFinite(lngLat[1])) return

  const html = buildHelmetMarkerHTML(yawDeg)

  if (!helmetMarker) {
    helmetMarker = new AMap.Marker({
      position: lngLat,
      content: html,
      offset: new AMap.Pixel(-22, -22), // 图标中心对准坐标点
      zIndex: 200,
      anchor: 'center'
    })
    amap.add(helmetMarker)
  } else {
    helmetMarker.setPosition(lngLat)
    helmetMarker.setContent(html)
  }
}

// ── 轨迹线更新（三层叠加） ────────────────────────────────────────────────────
function updatePolyline() {
  if (!amap || trackPoints.value.length < 2) return

  const path = trackPoints.value
    .filter(p => isFinite(p.lng) && isFinite(p.lat) && !(p.lat === 0 && p.lng === 0))
    .map(p => [p.lng, p.lat])

  if (path.length < 2) return

  if (!polylineGlow) {
    // 第一层：宽发光底层（青色，模糊感）
    polylineGlow = new AMap.Polyline({
      path,
      strokeColor: '#00D9FF',
      strokeWeight: 14,
      strokeOpacity: 0.15,
      lineJoin: 'round',
      lineCap: 'round',
      zIndex: 10
    })
    // 第二层：主线（亮白青色，清晰）
    polylineMain = new AMap.Polyline({
      path,
      strokeColor: '#7FEFFF',
      strokeWeight: 4,
      strokeOpacity: 0.95,
      lineJoin: 'round',
      lineCap: 'round',
      zIndex: 11
    })
    // 第三层：方向箭头（每隔一定距离显示行进方向）
    polylineDir = new AMap.Polyline({
      path,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      strokeOpacity: 0.6,
      strokeDasharray: [6, 14],  // 虚线模拟箭头间距
      showDir: true,
      lineJoin: 'round',
      zIndex: 12
    })
    amap.add([polylineGlow, polylineMain, polylineDir])
  } else {
    polylineGlow.setPath(path)
    polylineMain.setPath(path)
    polylineDir.setPath(path)
  }

  // 在最新位置画一个扩散光圈，表示"当前到达点"
  updateArrivalDot(path[path.length - 1])
}

// 当前到达点光圈（用 CircleMarker 实现）
let arrivalDot = null
function updateArrivalDot(lngLat) {
  if (!amap) return
  if (!arrivalDot) {
    arrivalDot = new AMap.CircleMarker({
      center: lngLat,
      radius: 7,
      strokeColor: '#00D9FF',
      strokeWeight: 2,
      strokeOpacity: 0.9,
      fillColor: '#00D9FF',
      fillOpacity: 0.3,
      zIndex: 50
    })
    amap.add(arrivalDot)
  } else {
    arrivalDot.setCenter(lngLat)
  }
}

// ── 视图控制 ──────────────────────────────────────────────────────────────────
function fitCameraToTrack() {
  if (!amap || trackPoints.value.length < 2 || !polylineMain) return
  amap.setFitView([polylineMain], false, [40, 40, 40, 40])
  amap.setPitch(45)
  console.log('[HelmetTwin] 全局视图 - 显示所有轨迹点:', trackPoints.value.length)
}

function toggleViewMode() {
  viewMode.value = viewMode.value === 'follow' ? 'global' : 'follow'

  if (viewMode.value === 'global') {
    if (!amap || trackPoints.value.length < 2 || !polylineMain) return
    // 先平滑抬高视角再 fitView
    amap.setPitch(45, true, 600)
    setTimeout(() => {
      amap.setFitView([polylineMain], false, [40, 40, 40, 40], 18)
    }, 300)
  } else {
    if (amap && trackPoints.value.length > 0) {
      const last = trackPoints.value[trackPoints.value.length - 1]
      // 平滑过渡到跟随视角
      amap.setZoomAndCenter(18, [last.lng, last.lat], true, 800)
      setTimeout(() => { amap.setPitch(62, true, 600) }, 400)
    }
  }
  console.log('[HelmetTwin] 切换视图模式:', viewMode.value)
}

// ── 轨迹清除 ──────────────────────────────────────────────────────────────────
function clearTrack() {
  trackPoints.value = []
  if (amap) {
    const toRemove = [polylineGlow, polylineMain, polylineDir, arrivalDot].filter(Boolean)
    if (toRemove.length) amap.remove(toRemove)
  }
  polylineGlow = null
  polylineMain = null
  polylineDir = null
  arrivalDot = null
}

// ── 导航功能 ──────────────────────────────────────────────────────────────────

// Haversine 公式，返回两点距离（米）
function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// 获取当前最佳起点坐标（实时GPS > 数据库初始位置 > null）
function getCurrentOrigin() {
  if (trackPoints.value.length > 0) {
    const last = trackPoints.value[trackPoints.value.length - 1]
    return { lat: last.lat, lng: last.lng }
  }
  if (initialPosition.value) {
    return { lat: initialPosition.value.lat, lng: initialPosition.value.lng }
  }
  return null
}

// 调后端 AI 推荐接口
async function fetchRecommend(level) {
  navSelectedLevel.value = level
  navLoading.value = true
  navRecommends.value = []
  navSelected.value = null
  try {
    const token = sessionStorage.getItem('token')
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const origin = getCurrentOrigin()
    const lat = origin ? origin.lat : 0
    const lng = origin ? origin.lng : 0

    const res = await fetch('/api/navigation/recommend', {
      method: 'POST',
      headers,
      body: JSON.stringify({ distanceLevel: level, lat, lng })
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error)
    navRecommends.value = data.recommendations || []
    if (navRecommends.value.length > 0) navSelected.value = navRecommends.value[0]
  } catch (e) {
    console.error('[Nav] 推荐失败:', e.message)
    navRecommends.value = [{ name: '推荐失败', reason: e.message, distanceKm: 0, durationMin: 0 }]
  } finally {
    navLoading.value = false
  }
}

// ── 地点预览：点击 AI 推荐卡片后飞到地图 ─────────────────────────────────────
async function previewLocation(item) {
  navSelected.value = item
  try {
    const coord = await geocodeAddress(item.name)
    // 计算距离
    const origin = getCurrentOrigin()
    let distKm = item.distanceKm
    if (!distKm && origin) {
      distKm = (calcDistance(origin.lat, origin.lng, coord.lat, coord.lng) / 1000).toFixed(1)
    }

    // 清除旧预览
    clearPreviewMarker()

    // 放置目的地 Marker（带弹跳动画）
    const markerHtml = `<div class="preview-dest-marker"><div class="preview-dest-marker__pin"></div><div class="preview-dest-marker__pulse"></div></div>`
    previewMarker = new AMap.Marker({
      position: [coord.lng, coord.lat],
      content: markerHtml,
      offset: new AMap.Pixel(-16, -40),
      zIndex: 300
    })
    amap.add(previewMarker)

    // 地图平滑飞过去
    amap.setZoomAndCenter(16, [coord.lng, coord.lat], true, 1000)
    setTimeout(() => { amap.setPitch(50, true, 500) }, 500)

    // 显示信息卡 + 切到 preview 态
    previewInfo.value = { name: item.name, distanceKm: distKm, coord }
    sheetState.value = 'preview'
  } catch (e) {
    console.error('[Preview] 地址解析失败:', e.message)
  }
}

function clearPreviewMarker() {
  if (previewMarker && amap) {
    amap.remove(previewMarker)
    previewMarker = null
  }
}

function clearPreview() {
  clearPreviewMarker()
  previewInfo.value = null
}

function startNavFromPreview() {
  const name = previewInfo.value?.name
  clearPreview()
  sheetState.value = 'mini'
  if (name) startNavigation(name)
}

// ── Sheet 控制 ───────────────────────────────────────────────────────────────
function openFullSheet() {
  sheetState.value = 'full'
  nextTick(() => { sheetInputRef.value?.focus() })
}

function handleSheetSearch() {
  if (!navInput.value.trim()) return
  startNavigation(navInput.value)
  sheetState.value = 'mini'
}

// 拖拽手势
let sheetTouchStartY = 0
let sheetTouchDelta = 0

function onSheetTouchStart(e) {
  sheetTouchStartY = e.touches[0].clientY
  sheetTouchDelta = 0
}
function onSheetTouchMove(e) {
  sheetTouchDelta = e.touches[0].clientY - sheetTouchStartY
}
function onSheetTouchEnd() {
  if (sheetTouchDelta > 80) {
    // 下拉：收起
    if (sheetState.value === 'full') sheetState.value = 'mini'
    else if (sheetState.value === 'preview') sheetState.value = 'mini'
  } else if (sheetTouchDelta < -80) {
    // 上拉：展开
    if (sheetState.value === 'mini') openFullSheet()
  }
  sheetTouchDelta = 0
}

// 用高德 REST API 地理编码（Web服务 key，走 /gaodemap 代理）
async function geocodeAddress(address) {
  const key = 'f693a401338ee91c2f19ee1dc4b10a0f'
  const url = `/gaodemap/v3/geocode/geo?key=${key}&address=${encodeURIComponent(address)}&output=JSON`
  const res = await fetch(url)
  const data = await res.json()
  if (data.status !== '1' || !data.geocodes?.length) {
    throw new Error(`地址解析失败：${address}（${data.info || data.infocode}）`)
  }
  const [lng, lat] = data.geocodes[0].location.split(',').map(Number)
  return { lng, lat }
}

// 用 AMap.Riding（JS API）规划骑行路线，Promise 包装，带超时 fallback
function planRidingRoute(originLng, originLat, destLng, destLat) {
  return new Promise((resolve, reject) => {
    // 10 秒超时：AMap.Riding 若未开通服务回调永远不触发
    const timer = setTimeout(() => {
      reject(new Error('路线规划超时，请确认高德 key 已开通骑行服务，或尝试其他目的地'))
    }, 10000)

    AMap.plugin('AMap.Riding', () => {
      const riding = new AMap.Riding()
      const origin = new AMap.LngLat(originLng, originLat)
      const dest   = new AMap.LngLat(destLng, destLat)
      riding.search(origin, dest, (status, result) => {
        clearTimeout(timer)
        if (status === 'complete' && result.routes && result.routes.length > 0) {
          resolve(result.routes[0])
        } else {
          reject(new Error(`骑行路线规划失败（${status}）`))
        }
      })
    })
  })
}

// 开始导航
async function startNavigation(destination) {
  if (!destination || !destination.trim() || !amap) return

  clearPreview()
  navDestName.value = destination.trim()
  navInstruction.value = '路线规划中...'
  navActive.value = true
  navPanelOpen.value = false

  try {
    // 1. 地理编码
    const destCoord = await geocodeAddress(destination.trim())

    // 2. 起点
    const origin = getCurrentOrigin()
    if (!origin) {
      navInstruction.value = '无法获取当前位置，请等待 GPS 数据'
      setTimeout(() => { navActive.value = false }, 3000)
      return
    }
    console.log('[Nav] 起点坐标:', origin)

    // 3. 骑行路线规划
    const route = await planRidingRouteRest(origin.lng, origin.lat, destCoord.lng, destCoord.lat)

    // 4. 提取步骤和路径
    const { steps, fullPath } = extractRouteData(route, destCoord)
    navSteps.value = steps
    navStepIndex.value = 0

    // 5. 绘制导航路线（三层叠加 + 已走段灰化）
    clearNavPolylines()
    if (fullPath.length > 1) {
      navRemainingPath = [...fullPath]
      navFullPath = [...fullPath]

      // 底层：宽发光
      navPolylineGlow = new AMap.Polyline({
        path: navRemainingPath,
        strokeColor: '#f97316',
        strokeWeight: 12,
        strokeOpacity: 0.12,
        lineJoin: 'round',
        lineCap: 'round',
        zIndex: 18
      })
      // 主线
      navPolylineRemain = new AMap.Polyline({
        path: navRemainingPath,
        strokeColor: '#f97316',
        strokeWeight: 4,
        strokeOpacity: 0.9,
        lineJoin: 'round',
        lineCap: 'round',
        zIndex: 20
      })
      // 方向箭头层
      navPolylineDirLayer = new AMap.Polyline({
        path: navRemainingPath,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        strokeOpacity: 0.5,
        strokeDasharray: [6, 14],
        showDir: true,
        lineJoin: 'round',
        zIndex: 21
      })
      // 已走过段（初始为空）
      navPolylinePassed = new AMap.Polyline({
        path: [],
        strokeColor: '#6b7280',
        strokeWeight: 4,
        strokeOpacity: 0.4,
        lineJoin: 'round',
        lineCap: 'round',
        zIndex: 19
      })
      amap.add([navPolylineGlow, navPolylineRemain, navPolylineDirLayer, navPolylinePassed])
      navPolylines.value = [navPolylineGlow, navPolylineRemain, navPolylineDirLayer, navPolylinePassed]
      try { amap.setFitView([navPolylineRemain], false, [60, 60, 60, 60]) } catch (_) {}
    }

    navInstruction.value = steps.length > 0 ? (steps[0].action || '沿路线骑行') : '沿路线骑行'
    // 导航开始后平滑过渡到跟随视角
    setTimeout(() => {
      if (navActive.value && amap) {
        const target = trackPoints.value.length > 0
          ? [trackPoints.value[trackPoints.value.length - 1].lng, trackPoints.value[trackPoints.value.length - 1].lat]
          : [origin.lng, origin.lat]
        amap.setZoomAndCenter(18, target, true, 1200)
        setTimeout(() => {
          amap.setPitch(62, true, 600)
          amap.setRotation(-(trackPoints.value.length > 0 ? trackPoints.value[trackPoints.value.length - 1].yaw : 0), true, 600)
          viewMode.value = 'follow'
        }, 800)
      }
    }, 1500)

  } catch (e) {
    console.error('[Nav] 导航失败:', e.message)
    navInstruction.value = e.message
    setTimeout(() => { navActive.value = false }, 5000)
  }
}

// REST API 骑行路线规划（Web服务 key）
async function planRidingRouteRest(originLng, originLat, destLng, destLat) {
  const key = 'f693a401338ee91c2f19ee1dc4b10a0f'
  const url = `/gaodemap/v4/direction/bicycling?key=${key}&origin=${originLng},${originLat}&destination=${destLng},${destLat}`
  const res = await fetch(url)
  const data = await res.json()
  if (data.errcode !== 0) {
    throw new Error(`路线规划失败：${data.errmsg || data.errcode}`)
  }
  if (!data.data?.paths?.length) {
    throw new Error('未找到骑行路线')
  }
  return { _type: 'rest', ...data.data.paths[0] }
}

// 统一提取步骤和路径，兼容 JS API 和 REST API 两种数据格式
function extractRouteData(route, destCoord) {
  // REST API 格式：steps[].polyline 是 "lng,lat;lng,lat" 字符串
  if (route._type === 'rest') {
    const steps = (route.steps || []).map(step => {
      const pts = (step.polyline || '').split(';').map(s => {
        const [lng, lat] = s.split(',').map(Number)
        return [lng, lat]
      }).filter(([lng, lat]) => !isNaN(lng) && !isNaN(lat))
      const endPt = pts[pts.length - 1]
      return {
        action: step.instruction || '',
        endLat: endPt ? endPt[1] : destCoord.lat,
        endLng: endPt ? endPt[0] : destCoord.lng
      }
    })
    const fullPath = []
    for (const step of (route.steps || [])) {
      const pts = (step.polyline || '').split(';').map(s => {
        const [lng, lat] = s.split(',').map(Number)
        return [lng, lat]
      }).filter(([lng, lat]) => !isNaN(lng) && !isNaN(lat))
      fullPath.push(...pts)
    }
    return { steps, fullPath }
  }

  // JS API 格式：steps[].path 是 AMap.LngLat[]
  const steps = (route.steps || []).map(step => {
    const pts = step.path || []
    const endPt = pts[pts.length - 1]
    return {
      action: step.instruction || '',
      endLat: endPt ? endPt.getLat() : destCoord.lat,
      endLng: endPt ? endPt.getLng() : destCoord.lng
    }
  })
  const fullPath = []
  for (const step of (route.steps || [])) {
    if (step.path) fullPath.push(...step.path)
  }
  return { steps, fullPath }
}

// 清除导航路线和状态
function clearNavigation() {
  clearNavPolylines()
  navActive.value = false
  navSteps.value = []
  navStepIndex.value = 0
  navInstruction.value = ''
  navDestName.value = ''
  navRemainDist.value = 0
  navTotalDist.value = 0
  navCurrentSpeed.value = 0
  navRecommends.value = []
  navSelected.value = null
  navInput.value = ''
  navSelectedLevel.value = ''
  navRemainingPath = []
  navFullPath = []
  sidePanelExpanded.value = false
  // 导航结束后恢复显示蓝色轨迹 + 恢复 zoom
  if (amap) {
    amap.setZoom(18)
    amap.setPitch(62)
  }
  if (trackPoints.value.length >= 2) updatePolyline()
}

function clearNavPolylines() {
  if (amap) {
    // 移除所有导航路线图层
    const layers = [navPolylineRemain, navPolylineGlow, navPolylineDirLayer, navPolylinePassed].filter(Boolean)
    if (layers.length) {
      try { amap.remove(layers) } catch (_) {}
    }
    // 兜底：移除 navPolylines 数组里的所有对象
    if (navPolylines.value.length) {
      try { amap.remove(navPolylines.value) } catch (_) {}
    }
  }
  navPolylines.value = []
  navPolylineRemain = null
  navPolylineGlow = null
  navPolylineDirLayer = null
  navPolylinePassed = null
  navFullPath = []
}

// ── 回放 ──────────────────────────────────────────────────────────────────────
function cycleReplaySpeed() {
  const speeds = [0.5, 1, 2, 4]
  const idx = speeds.indexOf(replaySpeed.value)
  replaySpeed.value = speeds[(idx + 1) % speeds.length]
}

function replayTrack() {
  if (trackPoints.value.length < 2 || isReplaying.value) return
  isReplaying.value = true

  if (viewMode.value === 'global') fitCameraToTrack()

  let i = 0
  const pts = [...trackPoints.value]
  const interval = 100 / replaySpeed.value

  const step = () => {
    if (i >= pts.length) {
      isReplaying.value = false
      return
    }
    const pt = pts[i]
    const lngLat = [pt.lng, pt.lat]
    const yaw = pt.yaw ?? 0

    updateHelmetMarker(lngLat, yaw)

    if (viewMode.value === 'follow' && amap) {
      amap.setCenter(lngLat)
      amap.setRotation(-yaw)
      amap.setPitch(62)
    }

    i++
    replayTimer = setTimeout(step, interval)
  }

  step()
}

// ── Gauge 绘制 ────────────────────────────────────────────────────────────────
// (已移除 canvas gauge，改用直观文字状态卡片)

// ── Watch sensor data ─────────────────────────────────────────────────────────
watch(() => props.sensorData, (data) => {
  if (!data || !data.deviceId) return

  roll.value = Number(data.roll) || 0
  pitch.value = Number(data.pitch) || 0
  yaw.value = Number(data.yaw) || 0
  avm.value = Number(data.avm) || 0
  gvm.value = Number(data.gvm) || 0

  if (data.fallFlag) {
    fallAlert.value = true
    setTimeout(() => { fallAlert.value = false }, 3000)
  }

  if (data.latitude != null && data.longitude != null) {
    const lat = Number(data.latitude)
    const lng = Number(data.longitude)
    const yaw = Number(data.yaw) || 0

    if (isFinite(lat) && isFinite(lng) && !(lat === 0 && lng === 0)) {
      trackPoints.value.push({ lat, lng, yaw })

      const lngLat = [lng, lat]
      updateHelmetMarker(lngLat, yaw)

      // 蓝色轨迹线只在非导航时显示
      if (!navActive.value) {
        updatePolyline()
      }

      if (viewMode.value === 'follow' && amap) {
        amap.setCenter(lngLat)
        amap.setRotation(-yaw)
        amap.setPitch(62)
      }

      // 导航步骤推进 + 橙色路线实时裁剪
      if (navActive.value && navSteps.value.length > 0) {
        const step = navSteps.value[navStepIndex.value]
        const dist = calcDistance(lat, lng, step.endLat, step.endLng)
        navRemainDist.value = dist
        navInstruction.value = `前方 ${Math.round(dist)} 米 ${step.action}`
        if (dist < 30 && navStepIndex.value < navSteps.value.length - 1) {
          navStepIndex.value++
        }
        if (navStepIndex.value === navSteps.value.length - 1 && dist < 30) {
          navInstruction.value = '已到达目的地'
          clearNavigation()
          return
        }

        // 裁剪导航路线：找最近点，已走段灰化，剩余段更新
        if (navRemainingPath.length > 2) {
          let closestIdx = 0
          let minDist = Infinity
          for (let i = 0; i < navRemainingPath.length; i++) {
            const [pLng, pLat] = navRemainingPath[i]
            const d = calcDistance(lat, lng, pLat, pLng)
            if (d < minDist) { minDist = d; closestIdx = i }
          }
          if (closestIdx > 0) {
            navRemainingPath = navRemainingPath.slice(closestIdx)
          }
          // 更新三层剩余路线
          if (navRemainingPath.length > 2) {
            if (navPolylineRemain) navPolylineRemain.setPath(navRemainingPath)
            if (navPolylineGlow) navPolylineGlow.setPath(navRemainingPath)
            if (navPolylineDirLayer) navPolylineDirLayer.setPath(navRemainingPath)
          }
          // 已走段 = 全路径 - 剩余路径
          if (navPolylinePassed && navFullPath.length > 0) {
            const passedCount = navFullPath.length - navRemainingPath.length
            if (passedCount > 1) {
              navPolylinePassed.setPath(navFullPath.slice(0, passedCount + 1))
            }
          }
        }

        // 计算实时速度（从最近两个轨迹点）
        if (trackPoints.value.length >= 2) {
          const pts = trackPoints.value
          const p1 = pts[pts.length - 2]
          const p2 = pts[pts.length - 1]
          const d = calcDistance(p1.lat, p1.lng, p2.lat, p2.lng)
          // 假设数据间隔约 1-2 秒
          const timeDiff = 1.5 // 近似
          navCurrentSpeed.value = Math.round((d / 1000) / (timeDiff / 3600) * 10) / 10
        }

        // P3: 接近转弯自动 Zoom
        if (navRemainDist.value < 100 && navRemainDist.value > 5) {
          if (amap.getZoom() < 19.5) {
            amap.setZoom(20)
            amap.setPitch(70)
          }
        } else if (navRemainDist.value > 200) {
          if (amap.getZoom() > 18.5) {
            amap.setZoom(18)
            amap.setPitch(62)
          }
        }
      }
    }
  }
}, { deep: true })

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  await nextTick()   // 等 DOM 渲染，确保容器有尺寸
  initAMap()
  initHelmet3D()
})

onUnmounted(() => {
  if (replayTimer) clearTimeout(replayTimer)
  if (threeAnimId) cancelAnimationFrame(threeAnimId)
  if (threeRenderer) threeRenderer.dispose()
  threeRenderer = null
  threeScene = null
  threeCamera = null
  helmetModel = null
  threeAnimId = null
  if (amap) {
    amap.destroy()
    amap = null
  }
  polylineGlow = null
  polylineMain = null
  polylineDir = null
  arrivalDot = null
  helmetMarker = null
  navPolylines.value = []
  navPolylineRemain = null
  navPolylineGlow = null
  navPolylineDirLayer = null
  navPolylinePassed = null
  navFullPath = []
})

defineExpose({
  onResize: () => {
    if (amap) amap.resize()
  }
})
</script>

<style scoped>
.twin-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: #020817;
}

/* Header */
.twin-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 14px; border-bottom: 1px solid rgba(56,189,248,0.15);
  flex-shrink: 0; z-index: 10; position: relative;
}
.twin-header__title {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 600; color: #e2e8f0; letter-spacing: 0.5px;
}
.twin-header__right { display: flex; align-items: center; gap: 8px; }

/* Buttons */
.track-btn {
  display: flex; align-items: center; gap: 4px;
  padding: 4px 10px; border-radius: 4px; border: none;
  font-size: 11px; cursor: pointer; transition: all 0.2s;
}
.track-btn--view { background: rgba(168,85,247,0.15); color: #A855F7; border: 1px solid rgba(168,85,247,0.3); }
.track-btn--view:hover:not(:disabled) { background: rgba(168,85,247,0.3); }
.track-btn--speed { background: rgba(255,217,61,0.15); color: #FFD93D; border: 1px solid rgba(255,217,61,0.3); }
.track-btn--speed:hover { background: rgba(255,217,61,0.3); }
.track-btn--clear { background: rgba(255,71,87,0.15); color: #FF4757; border: 1px solid rgba(255,71,87,0.3); }
.track-btn--clear:hover { background: rgba(255,71,87,0.3); }
.track-btn--replay { background: rgba(56,189,248,0.15); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3); }
.track-btn--replay:hover:not(:disabled) { background: rgba(56,189,248,0.3); }
.track-btn--replay:disabled, .track-btn--view:disabled { opacity: 0.4; cursor: not-allowed; }

/* Badge */
.badge {
  display: flex; align-items: center; gap: 5px;
  padding: 3px 10px; border-radius: 20px; font-size: 11px;
}
.badge i { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
.badge--on { background: rgba(56,189,248,0.1); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3); }
.badge--on i { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; animation: pulse 1.5s infinite; }
.badge--off { background: rgba(100,100,100,0.1); color: #888; border: 1px solid rgba(100,100,100,0.2); }
.badge--off i { background: #666; }
@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }

/* Body */
.twin-body {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* 全屏地图 */
.map-fullscreen {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.map-fullscreen :deep(.amap-logo),
.map-fullscreen :deep(.amap-copyright) { display: none !important; }

/* 跌倒警告 */
.twin-alert {
  position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,71,87,0.9); color: #fff; padding: 8px 16px;
  border-radius: 6px; font-size: 13px; font-weight: 600;
  z-index: 200; pointer-events: none;
}
.alert-fade-enter-active, .alert-fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.alert-fade-enter-from, .alert-fade-leave-to { opacity: 0; transform: translateX(-50%) translateY(-8px); }

/* 左上角侧边面板容器 */
.side-panel {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}
.side-panel > * { pointer-events: auto; }

/* 3D 头盔姿态面板 */
.helmet3d-panel {
  background: rgba(15,23,42,0.6);
  border: 1px solid rgba(56,189,248,0.2);
  border-radius: 10px;
  padding: 8px 8px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  backdrop-filter: blur(6px);
}
.helmet3d-canvas {
  width: 220px;
  height: 220px;
  display: block;
}
.helmet3d-label {
  font-size: 10px;
  color: rgba(56,189,248,0.55);
  margin-top: 2px;
  letter-spacing: 0.5px;
}

/* 直观状态卡片 */
.status-panel {
  background: rgba(15,23,42,0.6);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  backdrop-filter: blur(6px);
  width: 236px;
  box-sizing: border-box;
}
.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.status-icon {
  font-size: 14px;
  width: 20px;
  text-align: center;
  color: rgba(255,255,255,0.4);
  flex-shrink: 0;
}
.status-text {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex: 1;
}
.status-name {
  font-size: 11px;
  color: rgba(255,255,255,0.45);
  white-space: nowrap;
  min-width: 56px;
}
.status-val {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

/* 轨迹信息（右下角） */
.track-info {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(15,23,42,0.6);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 11px;
  color: rgba(56,189,248,0.8);
  pointer-events: none;
}

/* 无实时数据提示（右下角） */
.no-data-hint {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(15,23,42,0.6);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255,217,61,0.25);
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 11px;
  color: rgba(255,217,61,0.7);
  pointer-events: none;
}

/* 导航按钮 */
.track-btn--nav { background: rgba(249,115,22,0.15); color: #f97316; border: 1px solid rgba(249,115,22,0.3); }
.track-btn--nav:hover { background: rgba(249,115,22,0.3); }

.track-btn--status { background: rgba(0,217,255,0.15); color: #00D9FF; border: 1px solid rgba(0,217,255,0.3); }
.track-btn--status:hover { background: rgba(0,217,255,0.3); }

/* 设备状态抽屉 */
.status-drawer {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 280px;
  z-index: 150;
  background: rgba(10,22,40,0.97);
  border-right: 1px solid rgba(0,217,255,0.3);
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 14px;
  overflow-y: auto;
  backdrop-filter: blur(8px);
}
.status-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  color: #00D9FF;
  margin-bottom: 2px;
}
.status-drawer__header span {
  display: flex;
  align-items: center;
  gap: 6px;
}
.status-empty {
  color: rgba(255,255,255,0.45);
  font-size: 13px;
  text-align: center;
  padding: 30px 0;
}
.status-uptime {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  background: rgba(0,217,255,0.06);
  border: 1px solid rgba(0,217,255,0.18);
  border-radius: 8px;
}
.status-uptime__label {
  font-size: 11px;
  color: rgba(255,255,255,0.5);
  letter-spacing: 0.05em;
}
.status-uptime__val {
  font-size: 15px;
  font-weight: 700;
  color: #00D9FF;
  font-family: var(--font-mono, monospace);
}
.status-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px;
}
.status-row__label {
  font-size: 12.5px;
  color: rgba(255,255,255,0.8);
}
.status-row__badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  padding: 3px 10px;
  border: 1px solid;
  border-radius: 12px;
}
.status-row__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}
.status-update {
  font-size: 11px;
  color: rgba(255,255,255,0.35);
  text-align: center;
  margin-top: 2px;
}

/* ═══ iOS 风格三态 Sheet ═══ */
.sheet-backdrop {
  position: absolute; inset: 0; z-index: 140;
  background: rgba(0,0,0,0); pointer-events: none;
  transition: background 0.4s;
}
.sheet-backdrop--visible { background: rgba(0,0,0,0.3); pointer-events: auto; }

.nav-sheet-v2 {
  position: absolute; bottom: 0; left: 0; right: 0;
  z-index: 150;
  background: rgba(15, 23, 42, 0.78);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  border-top: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px 16px 0 0;
  padding: 0 16px;
  transition: max-height 0.4s cubic-bezier(0.32, 0.72, 0, 1), padding 0.4s cubic-bezier(0.32, 0.72, 0, 1);
  overflow: hidden;
}
.nav-sheet-v2--mini { max-height: 64px; padding: 8px 16px; }
.nav-sheet-v2--full { max-height: 82vh; padding: 8px 16px 20px; overflow-y: auto; }
.nav-sheet-v2--preview { max-height: 200px; padding: 8px 16px 16px; }

.sheet-handle { display: flex; justify-content: center; padding: 6px 0 4px; }
.sheet-handle__bar { width: 36px; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.2); }

/* Mini 态 */
.sheet-mini {
  display: flex; align-items: center; gap: 10px;
  padding: 4px 0; cursor: pointer;
}
.sheet-mini__text { flex: 1; font-size: 13px; color: rgba(255,255,255,0.45); }

/* Full 态 */
.sheet-full { display: flex; flex-direction: column; gap: 14px; padding-top: 4px; }
.sheet-full__input-row { display: flex; align-items: center; gap: 8px; }
.sheet-full__input {
  flex: 1; background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12); border-radius: 10px;
  color: #f1f5f9; font-size: 14px; padding: 10px 12px; outline: none;
  transition: border-color 0.2s;
}
.sheet-full__input:focus { border-color: rgba(249,115,22,0.5); }
.sheet-full__input::placeholder { color: rgba(255,255,255,0.3); }
.sheet-full__search-btn {
  background: #f97316; border: none; border-radius: 8px;
  color: #fff; font-size: 12px; font-weight: 600; padding: 8px 14px; cursor: pointer;
}
.sheet-full__cancel {
  background: none; border: none; color: rgba(255,255,255,0.5); font-size: 13px; cursor: pointer;
}
.sheet-full__cancel:hover { color: #fff; }

.sheet-full__divider {
  font-size: 11px; color: rgba(255,255,255,0.35); font-weight: 600;
  letter-spacing: 0.05em; text-transform: uppercase;
}
.sheet-full__levels { display: flex; gap: 8px; }
.sheet-level-btn {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px; padding: 12px 6px; cursor: pointer;
  color: rgba(255,255,255,0.6); font-size: 12px; font-weight: 500;
  transition: all 0.2s;
}
.sheet-level-btn small { font-size: 10px; color: rgba(255,255,255,0.3); }
.sheet-level-btn .sheet-level-icon { font-size: 20px; }
.sheet-level-btn:hover:not(:disabled) { border-color: rgba(249,115,22,0.3); color: #f97316; }
.sheet-level-btn.active { background: rgba(249,115,22,0.12); border-color: rgba(249,115,22,0.5); color: #f97316; }
.sheet-level-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.sheet-loading {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 12px; color: rgba(249,115,22,0.8); padding: 10px 0;
}
.sheet-loading__spinner {
  width: 14px; height: 14px; border: 2px solid rgba(249,115,22,0.2);
  border-top-color: #f97316; border-radius: 50%; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.sheet-recommend-list { display: flex; flex-direction: column; gap: 6px; }
.sheet-recommend-card {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px; padding: 12px; cursor: pointer;
  transition: all 0.2s;
}
.sheet-recommend-card:hover { background: rgba(249,115,22,0.08); border-color: rgba(249,115,22,0.2); }
.sheet-recommend-card--selected { background: rgba(249,115,22,0.12); border-color: rgba(249,115,22,0.4); }
.sheet-recommend-card__idx {
  flex-shrink: 0; width: 24px; height: 24px; border-radius: 50%;
  background: rgba(249,115,22,0.15); color: #f97316;
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.sheet-recommend-card__body { flex: 1; min-width: 0; }
.sheet-recommend-card__name { font-size: 13px; font-weight: 600; color: #f1f5f9; margin-bottom: 2px; }
.sheet-recommend-card__reason { font-size: 11px; color: rgba(255,255,255,0.45); line-height: 1.4; }
.sheet-recommend-card__meta { display: flex; gap: 10px; margin-top: 4px; font-size: 10px; color: rgba(249,115,22,0.7); }

/* Preview 态 */
.sheet-preview { display: flex; flex-direction: column; gap: 12px; padding-top: 4px; }
.sheet-preview__header { display: flex; align-items: center; gap: 12px; }
.sheet-preview__icon {
  width: 44px; height: 44px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(249,115,22,0.1); border-radius: 12px;
}
.sheet-preview__info { flex: 1; }
.sheet-preview__name { font-size: 15px; font-weight: 600; color: #f1f5f9; }
.sheet-preview__dist { font-size: 12px; color: rgba(255,255,255,0.45); margin-top: 2px; }
.sheet-preview__nav-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  background: #f97316; border: none; border-radius: 12px;
  color: #fff; font-size: 15px; font-weight: 600; padding: 14px;
  cursor: pointer; transition: background 0.2s;
}
.sheet-preview__nav-btn:hover { background: #ea580c; }
.sheet-preview__back {
  background: none; border: none; color: rgba(255,255,255,0.4);
  font-size: 12px; cursor: pointer; text-align: center;
}
.sheet-preview__back:hover { color: #fff; }

/* ═══ 导航 HUD 卡片 ═══ */
.nav-hud {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  max-width: 420px;
  min-width: 300px;
  background: rgba(10,22,40,0.92);
  border: 1px solid rgba(249,115,22,0.4);
  border-radius: 12px;
  padding: 10px 14px;
  backdrop-filter: blur(10px);
  pointer-events: auto;
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
}
.nav-hud__main {
  display: flex;
  align-items: center;
  gap: 12px;
}
.nav-hud__direction {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(249,115,22,0.1);
  border: 1px solid rgba(249,115,22,0.3);
  border-radius: 10px;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.nav-hud__direction svg {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.nav-hud__info {
  flex: 1;
  min-width: 0;
}
.nav-hud__dist {
  font-size: 18px;
  font-weight: 700;
  color: #f97316;
  line-height: 1.2;
}
.nav-hud__action {
  font-size: 12px;
  color: #e2e8f0;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: opacity 0.3s, transform 0.3s;
  animation: action-slide-in 0.35s ease-out;
}
@keyframes action-slide-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.nav-hud__actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}
.nav-hud-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
  border: 1px solid;
}
.nav-hud-btn--change {
  background: rgba(56,189,248,0.1);
  border-color: rgba(56,189,248,0.3);
  color: #38bdf8;
}
.nav-hud-btn--change:hover { background: rgba(56,189,248,0.25); }
.nav-hud-btn--stop {
  background: rgba(255,71,87,0.1);
  border-color: rgba(255,71,87,0.3);
  color: #FF4757;
}
.nav-hud-btn--stop:hover { background: rgba(255,71,87,0.25); }

.nav-hud__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255,255,255,0.08);
  font-size: 11px;
  color: rgba(255,255,255,0.5);
}
.nav-hud__dest {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #f97316;
  font-weight: 600;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.nav-hud__sep { color: rgba(255,255,255,0.15); }
.nav-hud__total-dist { color: rgba(255,255,255,0.7); font-weight: 500; }
.nav-hud__eta { color: rgba(56,189,248,0.8); font-weight: 500; }

/* ═══ 底部导航摘要栏 ═══ */
.nav-bottom-bar {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 180;
  display: flex;
  align-items: center;
  gap: 0;
  background: rgba(10,22,40,0.92);
  border: 1px solid rgba(249,115,22,0.3);
  border-radius: 12px;
  padding: 10px 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.35);
}
.nav-bottom-item {
  text-align: center;
  padding: 0 16px;
}
.nav-bottom-val {
  font-size: 15px;
  font-weight: 700;
  color: #f97316;
  line-height: 1.3;
}
.nav-bottom-label {
  font-size: 10px;
  color: rgba(255,255,255,0.4);
  margin-top: 2px;
}
.nav-bottom-divider {
  width: 1px;
  height: 28px;
  background: rgba(255,255,255,0.1);
  flex-shrink: 0;
}

/* ═══ 迷你状态圆球 ═══ */
.nav-mini-orb {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 100;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(15,23,42,0.85);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  pointer-events: auto;
}
.nav-mini-orb:hover {
  transform: scale(1.1);
  box-shadow: 0 0 12px rgba(0,217,255,0.3);
}
.nav-mini-orb__ring {
  position: absolute;
  inset: 2px;
  border-radius: 50%;
  border: 2px solid #4ade80;
  transition: border-color 0.3s;
}
.nav-mini-orb__icon {
  font-size: 16px;
  color: rgba(255,255,255,0.7);
}

/* ═══ 侧面板折叠相关 ═══ */
.side-panel--nav {
  transform: scale(0.92);
  transform-origin: top left;
}
.side-panel__collapse-btn {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.5);
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  margin-top: 4px;
  transition: background 0.2s;
}
.side-panel__collapse-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }

/* ═══ 动画 ═══ */
/* HUD 卡片从上滑入 */
.hud-drop-enter-active { transition: opacity 0.4s ease, transform 0.4s ease; }
.hud-drop-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.hud-drop-enter-from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
.hud-drop-leave-to { opacity: 0; transform: translateX(-50%) translateY(-10px); }

/* 底部栏从下滑入 */
.bar-slide-up-enter-active { transition: opacity 0.4s ease, transform 0.4s ease; }
.bar-slide-up-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.bar-slide-up-enter-from { opacity: 0; transform: translateX(-50%) translateY(20px); }
.bar-slide-up-leave-to { opacity: 0; transform: translateX(-50%) translateY(10px); }

/* 底部 Sheet 面板从下滑入 (legacy - kept for other transitions) */

/* 侧面板折叠/展开 */
.panel-collapse-enter-active { transition: opacity 0.35s ease, transform 0.35s ease; }
.panel-collapse-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.panel-collapse-enter-from { opacity: 0; transform: translateX(-20px) scale(0.9); }
.panel-collapse-leave-to { opacity: 0; transform: translateX(-20px) scale(0.9); }

/* 迷你圆球弹出 */
.orb-pop-enter-active { transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.orb-pop-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.orb-pop-enter-from { opacity: 0; transform: scale(0.5); }
.orb-pop-leave-to { opacity: 0; transform: scale(0.5); }

/* 目的地预览 Marker 样式（全局，非 scoped） */
</style>

<style>
.preview-dest-marker {
  position: relative;
  width: 32px; height: 40px;
}
.preview-dest-marker__pin {
  width: 32px; height: 32px;
  background: #f97316;
  border: 3px solid #fff;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.5);
  animation: marker-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.preview-dest-marker__pulse {
  position: absolute;
  bottom: -4px; left: 50%;
  transform: translateX(-50%);
  width: 12px; height: 12px;
  background: rgba(249, 115, 22, 0.3);
  border-radius: 50%;
  animation: marker-pulse 1.5s infinite;
}
@keyframes marker-bounce {
  0% { transform: rotate(-45deg) translateY(-20px); opacity: 0; }
  60% { transform: rotate(-45deg) translateY(4px); }
  100% { transform: rotate(-45deg) translateY(0); opacity: 1; }
}
@keyframes marker-pulse {
  0% { transform: translateX(-50%) scale(1); opacity: 0.6; }
  100% { transform: translateX(-50%) scale(3); opacity: 0; }
}
</style>
