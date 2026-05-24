<template>
    <!-- ── Tab Bar ───────────────────────────────────────────── -->
    <nav class="dv-tabs">
      <button v-for="tab in tabs" :key="tab.id"
        class="dv-tab" :class="{ 'dv-tab--active': activeTab === tab.id }"
        @click="activeTab = tab.id">
        <span class="dv-tab__icon" v-html="tab.icon"></span>
        {{ tab.label }}
      </button>
    </nav>

    <!-- ── Content ───────────────────────────────────────────── -->
    <main class="dv-content">

      <!-- ══ 总览 ══════════════════════════════════════════════ -->
      <div v-if="activeTab === 'overview'" class="dv-overview">

        <!-- Hero -->
        <div class="dv-hero">
          <div class="dv-hero__bg-text">HELMET</div>
          <div class="dv-hero__left">
            <div class="dv-hero__tag">
              <span class="dv-hero__tag-dot"></span>传感器数据实时同步中
            </div>
            <h1 class="dv-hero__title">
              累计骑行 <span class="dv-hero__title-num">{{ totalDistance.toFixed(1) }}</span> 公里
            </h1>
            <p class="dv-hero__desc">智能头盔多维传感器数据可视化分析中心，集成温湿度监测、骑行能耗统计、安全事件追踪、电量监控与心率数据分析。</p>
          </div>
          <button class="dv-hero__back-btn" @click="goBack">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            返回终端
          </button>
        </div>

        <!-- 5 入口卡片 -->
        <div class="dv-cards-grid">

          <div class="dv-entry-card dv-entry-card--cyan" @click="activeTab = 'temp'">
            <div class="dv-entry-card__top">
              <div class="dv-entry-card__icon dv-entry-card__icon--cyan">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>
              </div>
            </div>
            <div class="dv-entry-card__body">
              <div class="dv-entry-card__val">温湿度趋势</div>
              <div class="dv-entry-card__meta">
              <span>{{ tempChartData.length }} 条采样</span>
              </div>
            </div>
            <div class="dv-entry-card__footer">
              <span class="dv-entry-card__link">进入温湿度分析</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
            </div>
          </div>

          <div class="dv-entry-card dv-entry-card--emerald" @click="activeTab = 'ride'">
            <div class="dv-entry-card__top">
              <div class="dv-entry-card__icon dv-entry-card__icon--emerald">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
              </div>
            </div>
            <div class="dv-entry-card__body">
              <div class="dv-entry-card__val">骑行记录分析</div>
              <div class="dv-entry-card__meta">
                <span>{{ rideCount }} 次骑行记录</span>
              </div>
            </div>
            <div class="dv-entry-card__footer">
              <span class="dv-entry-card__link">进入骑行分析</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
            </div>
          </div>

          <div class="dv-entry-card dv-entry-card--green" @click="activeTab = 'battery'">
            <div class="dv-entry-card__top">
              <div class="dv-entry-card__icon dv-entry-card__icon--green">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2"/></svg>
              </div>
            </div>
            <div class="dv-entry-card__body">
              <div class="dv-entry-card__val">电量监控</div>
              <div class="dv-entry-card__meta">
                <span>{{ batteryRecords.length }} 条记录</span>
              </div>
            </div>
            <div class="dv-entry-card__footer">
              <span class="dv-entry-card__link">进入电量分析</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
            </div>
          </div>

          <div class="dv-entry-card dv-entry-card--rose" @click="activeTab = 'heartrate'">
            <div class="dv-entry-card__top">
              <div class="dv-entry-card__icon dv-entry-card__icon--rose">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </div>
            </div>
            <div class="dv-entry-card__body">
              <div class="dv-entry-card__val">心率监测</div>
              <div class="dv-entry-card__meta">
                <span>峰值 {{ hrMax }} BPM</span>
              </div>
            </div>
            <div class="dv-entry-card__footer">
              <span class="dv-entry-card__link">进入心率分析</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
            </div>
          </div>

        </div>

        <!-- 说明区 -->
        <div class="dv-guide">
          <div class="dv-guide__title">
            <span class="dv-guide__dot-wrap"><span class="dv-guide__dot-ping"></span><span class="dv-guide__dot"></span></span>
            数据分析模块说明
          </div>
          <div class="dv-guide__grid">
            <div class="dv-guide__item">
              <div class="dv-guide__item-title">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>
                温湿度趋势分析
              </div>
              <p>支持分钟级实时推送、小时级均值、天级别历史三种粒度切换。双折线图展示温度与湿度协同变化，支持 CSV 导出。</p>
            </div>
            <div class="dv-guide__item">
              <div class="dv-guide__item-title">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
                骑行里程与能耗
              </div>
              <p>基于本地骑行记录，可视化每次骑行的距离与卡路里消耗趋势，辅助制定骑行规划目标。</p>
            </div>
            <div class="dv-guide__item">
              <div class="dv-guide__item-title">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2"/></svg>
                电量时序监控
              </div>
              <p>手动记录设备电量、温度、电压，折线图追踪电量曲线变化，支持快速充放电模拟与历史清除。</p>
            </div>
            <div class="dv-guide__item">
              <div class="dv-guide__item-title">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fb7185" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                整点心率监测
              </div>
              <p>按24小时整点记录心率与骑行速度，自动划分 ACSM 五区间（静息/热身/燃脂/有氧/峰值），支持多日对比。</p>
            </div>
          </div>
        </div>

      </div>

      <!-- ══ 温湿度 ════════════════════════════════════════════ -->
      <div v-else-if="activeTab === 'temp'" class="dv-tab-panel">
        <div class="dv-panel-header">
          <div class="dv-panel-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>
            温湿度趋势分析
          </div>
          <div class="dv-range-switch">
            <button :class="['dv-range-btn', timeRange === 'minute' && 'active']" @click="switchRange('minute')">分钟级</button>
            <button :class="['dv-range-btn', timeRange === 'hour'   && 'active']" @click="switchRange('hour')">小时级</button>
            <button :class="['dv-range-btn', timeRange === 'day'    && 'active']" @click="switchRange('day')">天级别</button>
          </div>
        </div>
        <AtmosphericTrendChart :chart-data="tempChartData" :time-range="timeRange" />
      </div>

      <!-- ══ 骑行能耗 ══════════════════════════════════════════ -->
      <div v-else-if="activeTab === 'ride'" class="dv-tab-panel">
        <div class="dv-panel-header">
          <div class="dv-panel-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
            骑行里程与能耗
          </div>
          <div class="dv-stat-pills">
            <span class="dv-stat-pill dv-stat-pill--emerald">累计 {{ totalDistance.toFixed(1) }} km</span>
            <span class="dv-stat-pill dv-stat-pill--amber">{{ totalCalories }} kcal</span>
            <span class="dv-stat-pill dv-stat-pill--blue">{{ rideCount }} 次</span>
          </div>
        </div>
        <div v-if="rideCount === 0" class="dv-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(52,211,153,0.2)" stroke-width="1.2"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
          <p>暂无骑行记录</p>
        </div>
        <div v-else class="dv-ride-layout">
          <div class="dv-chart-wrap dv-chart-wrap--ride">
            <v-chart class="dv-echart" :option="rideChartOption" autoresize />
          </div>
          <div class="dv-ride-list">
            <div class="dv-ride-list__title">最近骑行记录</div>
            <div v-for="ride in recentRides" :key="ride.id" class="dv-ride-row">
              <div class="dv-ride-row__left">
                <div class="dv-ride-row__date">{{ formatRideDate(ride.startTime) }}</div>
                <div class="dv-ride-row__dist">{{ ride.distance.toFixed(1) }} km</div>
              </div>
              <div class="dv-ride-row__right">
                <span class="dv-ride-row__cal">{{ ride.calories || 0 }} kcal</span>
                <span class="dv-ride-row__speed">{{ ride.avgSpeed.toFixed(1) }} km/h</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ 电量监控 ══════════════════════════════════════════ -->
      <div v-else-if="activeTab === 'battery'" class="dv-tab-panel">
        <div class="dv-panel-header">
          <div class="dv-panel-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2"/></svg>
            电量时序监控
          </div>
          <div class="dv-stat-pills">
            <span class="dv-stat-pill" :class="latestBattery.percentage > 50 ? 'dv-stat-pill--emerald' : latestBattery.percentage > 20 ? 'dv-stat-pill--amber' : 'dv-stat-pill--red'">
              {{ latestBattery.percentage }}%
            </span>
            <span class="dv-stat-pill dv-stat-pill--blue">{{ batteryRecords.length }} 条采样</span>
            <button class="dv-pill-btn dv-pill-btn--danger" @click="clearBattery">清空</button>
          </div>
        </div>

        <div class="dv-battery-layout">
          <!-- 左：图表 + 状态卡 -->
          <div class="dv-battery-left">
            <!-- 当前状态卡 -->
            <div class="dv-bat-status">
              <div class="dv-bat-status__pct" :class="batPctClass">{{ latestBattery.percentage }}%</div>
              <div class="dv-bat-bar-wrap">
                <div class="dv-bat-bar" :class="batBarClass" :style="{ width: latestBattery.percentage + '%' }"></div>
              </div>
              <div class="dv-bat-status__meta">
                <span>{{ latestBattery.status === 'charging' ? '⚡ 充电中' : '🔋 放电' }}</span>
                <span>{{ latestBattery.voltage?.toFixed(2) ?? '--' }} V</span>
                <span>{{ latestBattery.temperature ?? '--' }} °C</span>
              </div>
            </div>
            <!-- 折线图 -->
            <div class="dv-chart-wrap dv-chart-wrap--battery">
              <v-chart class="dv-echart" :option="batteryChartOption" autoresize />
            </div>
          </div>
          <!-- 右：录入表单 + 历史 -->
          <div class="dv-battery-right">
            <div class="dv-form-title">记录采样</div>
            <div class="dv-form-row">
              <label class="dv-form-label">电量 %</label>
              <input v-model.number="batInput.percentage" type="range" min="0" max="100" class="dv-slider" />
              <span class="dv-form-num">{{ batInput.percentage }}</span>
            </div>
            <div class="dv-form-row">
              <label class="dv-form-label">温度 °C</label>
              <input v-model.number="batInput.temperature" type="range" min="0" max="60" class="dv-slider" />
              <span class="dv-form-num">{{ batInput.temperature }}</span>
            </div>
            <div class="dv-form-row">
              <label class="dv-form-label">电压 V</label>
              <input v-model.number="batInput.voltage" type="range" min="3.0" max="4.2" step="0.01" class="dv-slider" />
              <span class="dv-form-num">{{ batInput.voltage.toFixed(2) }}</span>
            </div>
            <div class="dv-form-row">
              <label class="dv-form-label">状态</label>
              <div class="dv-form-toggle">
                <button :class="['dv-toggle-btn', batInput.status === 'charging' && 'active']" @click="batInput.status = 'charging'">充电</button>
                <button :class="['dv-toggle-btn', batInput.status === 'discharging' && 'active']" @click="batInput.status = 'discharging'">放电</button>
              </div>
            </div>
            <div class="dv-form-actions">
              <button class="dv-form-btn dv-form-btn--primary" @click="addBatteryRecord">记录当前</button>
              <button class="dv-form-btn dv-form-btn--green" @click="simulateCharge">+10% 充电</button>
              <button class="dv-form-btn dv-form-btn--amber" @click="simulateDrain">-12% 放电</button>
            </div>
            <div class="dv-mini-list">
              <div class="dv-mini-list__title">最近采样</div>
              <div v-for="r in batteryRecords.slice(-8).reverse()" :key="r.id" class="dv-mini-row">
                <span class="dv-mini-row__time">{{ r.timestamp?.slice(11,16) }}</span>
                <span class="dv-mini-row__val" :class="r.percentage > 50 ? 'clr-green' : r.percentage > 20 ? 'clr-amber' : 'clr-red'">{{ r.percentage }}%</span>
                <span class="dv-mini-row__sub">{{ r.voltage?.toFixed(2) }}V · {{ r.temperature }}°C</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ 心率监测 ══════════════════════════════════════════ -->
      <div v-else-if="activeTab === 'heartrate'" class="dv-tab-panel">
        <div class="dv-panel-header">
          <div class="dv-panel-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fb7185" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            整点心率监测
          </div>
          <div class="dv-stat-pills">
            <span class="dv-stat-pill dv-stat-pill--rose">均值 {{ hrAvg }} BPM</span>
            <span class="dv-stat-pill dv-stat-pill--red">峰值 {{ hrMax }} BPM</span>
            <div class="dv-hr-day-switch">
              <button v-for="d in hrDays" :key="d.date"
                :class="['dv-range-btn', hrSelectedDate === d.date && 'active']"
                @click="hrSelectedDate = d.date">{{ d.label }}</button>
            </div>
          </div>
        </div>
        <div class="dv-hr-layout">
          <!-- 左：面积图 + 区间柱 -->
          <div class="dv-hr-charts">
            <div class="dv-chart-wrap dv-chart-wrap--hr">
              <v-chart class="dv-echart" :option="hrAreaOption" autoresize />
            </div>
            <div class="dv-hr-zones">
              <div v-for="z in hrZoneSummary" :key="z.name" class="dv-zone-row">
                <span class="dv-zone-dot" :style="{ background: z.color }"></span>
                <span class="dv-zone-name">{{ z.name }}</span>
                <div class="dv-zone-bar-wrap">
                  <div class="dv-zone-bar" :style="{ width: z.pct + '%', background: z.color }"></div>
                </div>
                <span class="dv-zone-pct">{{ z.count }}h · {{ z.pct }}%</span>
              </div>
            </div>
          </div>
          <!-- 右：录入面板 -->
          <div class="dv-hr-form">
            <div class="dv-form-title">整点心率调整</div>
            <div class="dv-form-row">
              <label class="dv-form-label">选择时段</label>
              <select v-model.number="hrInput.hour" class="dv-select">
                <option v-for="h in 24" :key="h-1" :value="h-1">{{ String(h-1).padStart(2,'0') }}:00</option>
              </select>
            </div>
            <div class="dv-form-row">
              <label class="dv-form-label">心率 BPM</label>
              <input v-model.number="hrInput.bpm" type="range" min="40" max="200" class="dv-slider" />
              <span class="dv-form-num" :style="{ color: hrZoneColor(hrInput.bpm) }">{{ hrInput.bpm }}</span>
            </div>
            <div class="dv-form-row">
              <label class="dv-form-label">骑行速度</label>
              <input v-model.number="hrInput.speed" type="range" min="0" max="40" class="dv-slider" />
              <span class="dv-form-num">{{ hrInput.speed }} km/h</span>
            </div>
            <div class="dv-zone-tag" :style="{ background: hrZoneColor(hrInput.bpm) + '20', color: hrZoneColor(hrInput.bpm), borderColor: hrZoneColor(hrInput.bpm) + '50' }">
              {{ hrZoneName(hrInput.bpm) }}
            </div>
            <div class="dv-form-actions">
              <button class="dv-form-btn dv-form-btn--primary" @click="updateHrPoint">更新此时段</button>
            </div>
            <div class="dv-preset-btns">
              <div class="dv-form-title" style="margin-top:12px">预设场景</div>
              <button class="dv-form-btn dv-form-btn--red" @click="applyHrPreset('hiit')">HIIT 高强度</button>
              <button class="dv-form-btn dv-form-btn--amber" @click="applyHrPreset('endurance')">有氧耐力</button>
              <button class="dv-form-btn dv-form-btn--blue" @click="applyHrPreset('recovery')">恢复骑行</button>
            </div>
            <!-- 区间说明 -->
            <div class="dv-zone-legend">
              <div class="dv-form-title" style="margin-top:12px">ACSM 心率区间</div>
              <div v-for="z in HR_ZONES" :key="z.name" class="dv-zone-legend-row">
                <span class="dv-zone-dot" :style="{ background: z.color }"></span>
                <span>{{ z.name }}：{{ z.range }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </main>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
  GridComponent, TooltipComponent, LegendComponent,
  TitleComponent, DataZoomComponent, MarkLineComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import AtmosphericTrendChart from '@/components/AtmosphericTrendChart.vue'
import { useRideHistoryStore } from '@/stores/rideHistory'

use([CanvasRenderer, LineChart, BarChart, PieChart,
  GridComponent, TooltipComponent, LegendComponent,
  TitleComponent, DataZoomComponent, MarkLineComponent])

const props = defineProps({
  sensorData: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['back'])
const goBack = () => emit('back')

// ── Tabs ──────────────────────────────────────────────────────────
const tabs = [
  { id: 'overview',   label: '总览',   icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>' },
  { id: 'temp',       label: '温湿度', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>' },
  { id: 'ride',       label: '骑行能耗', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>' },
  { id: 'battery',    label: '电量监控', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2"/></svg>' },
  { id: 'heartrate',  label: '心率监测', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' },
]
const activeTab = ref('overview')

// ── Sensor data from prop ──────────────────────────────────────────
const latestTemp = computed(() => props.sensorData?.temperature ?? null)
const latestHum  = computed(() => props.sensorData?.humidity  ?? null)

// ── Temp chart data (from WebSocket history) ───────────────────────
const tempHistory = ref([])
const timeRange   = ref('minute')

function switchRange(r) { timeRange.value = r }

const tempChartData = computed(() => {
  if (timeRange.value === 'minute') return tempHistory.value.slice(-60)
  if (timeRange.value === 'hour') {
    const buckets = {}
    tempHistory.value.forEach(d => {
      const key = d.time?.slice(0, 13) || ''
      if (!buckets[key]) buckets[key] = { temps: [], hums: [], time: key + ':00' }
      buckets[key].temps.push(d.temp)
      buckets[key].hums.push(d.hum)
    })
    return Object.values(buckets).map(b => ({
      time: b.time,
      temp: +(b.temps.reduce((a, v) => a + v, 0) / b.temps.length).toFixed(1),
      hum:  +(b.hums.reduce((a, v) => a + v, 0) / b.hums.length).toFixed(1),
    }))
  }
  const buckets = {}
  tempHistory.value.forEach(d => {
    const key = d.time?.slice(0, 10) || ''
    if (!buckets[key]) buckets[key] = { temps: [], hums: [], time: key }
    buckets[key].temps.push(d.temp)
    buckets[key].hums.push(d.hum)
  })
  return Object.values(buckets).map(b => ({
    time: b.time,
    temp: +(b.temps.reduce((a, v) => a + v, 0) / b.temps.length).toFixed(1),
    hum:  +(b.hums.reduce((a, v) => a + v, 0) / b.hums.length).toFixed(1),
  }))
})

watch(() => props.sensorData, (v) => {
  if (!v || v.temperature == null || v.humidity == null) return
  tempHistory.value.push({
    time: new Date().toISOString().replace('T', ' ').slice(0, 19),
    temp: v.temperature,
    hum:  v.humidity,
  })
  if (tempHistory.value.length > 1440) tempHistory.value.shift()
})

async function loadTempHistory() {
  try {
    const token = sessionStorage.getItem('token')
    const headers = token ? { Authorization: 'Bearer ' + token } : {}
    const res = await fetch('/api/sensor/history?limit=200', { headers })
    if (!res.ok) return
    const list = await res.json()
    // list is array of SensorData, newest first — reverse to chronological
    const points = [...list].reverse()
      .filter(d => d.temperature != null && d.humidity != null)
      .map(d => ({
        time: (d.receiveTime || '').replace('T', ' ').slice(0, 19),
        temp: d.temperature,
        hum:  d.humidity,
      }))
    if (points.length) tempHistory.value = points
  } catch {}
}

// ── Ride history ───────────────────────────────────────────────────
const rideStore = useRideHistoryStore()
const rides = computed(() => rideStore.rides || [])
const totalDistance = computed(() => rides.value.reduce((s, r) => s + (r.distance || 0), 0))
const totalCalories = computed(() => rides.value.reduce((s, r) => s + (r.calories || 0), 0))
const rideCount     = computed(() => rides.value.length)
const recentRides   = computed(() => [...rides.value].sort((a, b) => b.startTime - a.startTime).slice(0, 10))

function formatRideDate(ts) {
  if (!ts) return '--'
  const d = new Date(ts)
  return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

const rideChartOption = computed(() => {
  const data = [...rides.value].sort((a, b) => a.startTime - b.startTime).slice(-20)
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: '#0f172a', borderColor: '#334155', textStyle: { color: '#e2e8f0' } },
    legend: { data: ['距离(km)', '卡路里(kcal)'], textStyle: { color: '#94a3b8' }, top: 4 },
    grid: { left: 48, right: 48, top: 36, bottom: 40 },
    xAxis: { type: 'category', data: data.map(r => formatRideDate(r.startTime)), axisLabel: { color: '#64748b', fontSize: 10 }, axisLine: { lineStyle: { color: '#1e293b' } } },
    yAxis: [
      { type: 'value', name: 'km',   nameTextStyle: { color: '#64748b' }, axisLabel: { color: '#64748b' }, splitLine: { lineStyle: { color: '#1e293b' } } },
      { type: 'value', name: 'kcal', nameTextStyle: { color: '#64748b' }, axisLabel: { color: '#64748b' }, splitLine: { show: false } },
    ],
    series: [
      { name: '距离(km)',   type: 'bar', data: data.map(r => r.distance?.toFixed(1)), itemStyle: { color: '#34d399' }, barMaxWidth: 24 },
      { name: '卡路里(kcal)', type: 'line', yAxisIndex: 1, data: data.map(r => r.calories || 0), lineStyle: { color: '#f59e0b' }, itemStyle: { color: '#f59e0b' }, smooth: true },
    ],
  }
})

// ── Battery ────────────────────────────────────────────────────────
const BAT_KEY = 'helmet_battery_records'
const batteryRecords = ref([])

function loadBattery() {
  try { batteryRecords.value = JSON.parse(localStorage.getItem(BAT_KEY) || '[]') } catch { batteryRecords.value = [] }
}
function saveBattery() {
  localStorage.setItem(BAT_KEY, JSON.stringify(batteryRecords.value))
}

const batInput = ref({ percentage: 80, temperature: 25, voltage: 3.85, status: 'discharging' })

const latestBattery = computed(() => {
  if (!batteryRecords.value.length) return { percentage: 0, status: 'discharging', voltage: 0, temperature: 0 }
  return batteryRecords.value[batteryRecords.value.length - 1]
})

const batPctClass = computed(() => {
  const p = latestBattery.value.percentage
  return p > 50 ? 'clr-green' : p > 20 ? 'clr-amber' : 'clr-red'
})
const batBarClass = computed(() => {
  const p = latestBattery.value.percentage
  return p > 50 ? 'dv-bat-bar--green' : p > 20 ? 'dv-bat-bar--amber' : 'dv-bat-bar--red'
})

function addBatteryRecord() {
  batteryRecords.value.push({
    id: Date.now(),
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    percentage: batInput.value.percentage,
    temperature: batInput.value.temperature,
    voltage: batInput.value.voltage,
    status: batInput.value.status,
  })
  saveBattery()
}

function simulateCharge() {
  const last = latestBattery.value
  batInput.value = { percentage: Math.min(100, last.percentage + 10), temperature: last.temperature, voltage: Math.min(4.2, (last.voltage || 3.7) + 0.08), status: 'charging' }
  addBatteryRecord()
}

function simulateDrain() {
  const last = latestBattery.value
  batInput.value = { percentage: Math.max(0, last.percentage - 12), temperature: last.temperature, voltage: Math.max(3.0, (last.voltage || 3.7) - 0.1), status: 'discharging' }
  addBatteryRecord()
}

function clearBattery() {
  batteryRecords.value = []
  saveBattery()
}

const batteryChartOption = computed(() => {
  const data = batteryRecords.value.slice(-50)
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: '#0f172a', borderColor: '#334155', textStyle: { color: '#e2e8f0' } },
    legend: { data: ['电量%', '电压V'], textStyle: { color: '#94a3b8' }, top: 4 },
    grid: { left: 44, right: 44, top: 36, bottom: 40 },
    xAxis: { type: 'category', data: data.map(r => r.timestamp?.slice(11, 16) || ''), axisLabel: { color: '#64748b', fontSize: 10 }, axisLine: { lineStyle: { color: '#1e293b' } } },
    yAxis: [
      { type: 'value', min: 0, max: 100, name: '%', nameTextStyle: { color: '#64748b' }, axisLabel: { color: '#64748b' }, splitLine: { lineStyle: { color: '#1e293b' } } },
      { type: 'value', min: 2.8, max: 4.4, name: 'V', nameTextStyle: { color: '#64748b' }, axisLabel: { color: '#64748b', formatter: v => v.toFixed(1) }, splitLine: { show: false } },
    ],
    series: [
      { name: '电量%', type: 'line', data: data.map(r => r.percentage), lineStyle: { color: '#4ade80' }, itemStyle: { color: '#4ade80' }, areaStyle: { color: 'rgba(74,222,128,0.08)' }, smooth: true },
      { name: '电压V', type: 'line', yAxisIndex: 1, data: data.map(r => r.voltage?.toFixed(2)), lineStyle: { color: '#60a5fa' }, itemStyle: { color: '#60a5fa' }, smooth: true },
    ],
  }
})

// ── Heart Rate ─────────────────────────────────────────────────────
const HR_ZONES = [
  { name: '静息',  range: '< 60 BPM',    color: '#64748b', min: 0,   max: 59  },
  { name: '热身',  range: '60–99 BPM',   color: '#22d3ee', min: 60,  max: 99  },
  { name: '燃脂',  range: '100–139 BPM', color: '#4ade80', min: 100, max: 139 },
  { name: '有氧',  range: '140–169 BPM', color: '#f59e0b', min: 140, max: 169 },
  { name: '峰值',  range: '≥ 170 BPM',   color: '#ef4444', min: 170, max: 999 },
]

const HR_KEY = 'helmet_hr_days'

function makeDefaultHrDays() {
  const days = []
  for (let i = 2; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const label = i === 0 ? '今天' : i === 1 ? '昨天' : `${d.getMonth()+1}/${d.getDate()}`
    const points = Array.from({ length: 24 }, (_, h) => {
      const base = h >= 6 && h <= 22 ? 75 : 58
      return { hour: h, bpm: base + Math.floor(Math.random() * 20), speed: h >= 7 && h <= 9 ? 15 + Math.floor(Math.random() * 10) : 0 }
    })
    days.push({ date: dateStr, label, points })
  }
  return days
}

function loadHrDays() {
  try {
    const saved = JSON.parse(localStorage.getItem(HR_KEY) || 'null')
    if (saved && Array.isArray(saved) && saved.length) return saved
  } catch {}
  return makeDefaultHrDays()
}

const hrDays = ref(loadHrDays())
const hrSelectedDate = ref(hrDays.value[hrDays.value.length - 1]?.date || '')

const selectedDayData = computed(() => hrDays.value.find(d => d.date === hrSelectedDate.value) || hrDays.value[0])

const hrAvg = computed(() => {
  const pts = selectedDayData.value?.points || []
  if (!pts.length) return 0
  return Math.round(pts.reduce((s, p) => s + p.bpm, 0) / pts.length)
})
const hrMax = computed(() => {
  const pts = selectedDayData.value?.points || []
  return pts.length ? Math.max(...pts.map(p => p.bpm)) : 0
})

function hrZoneColor(bpm) {
  return (HR_ZONES.find(z => bpm >= z.min && bpm <= z.max) || HR_ZONES[0]).color
}
function hrZoneName(bpm) {
  return (HR_ZONES.find(z => bpm >= z.min && bpm <= z.max) || HR_ZONES[0]).name
}

const hrZoneSummary = computed(() => {
  const pts = selectedDayData.value?.points || []
  return HR_ZONES.map(z => {
    const count = pts.filter(p => p.bpm >= z.min && p.bpm <= z.max).length
    return { ...z, count, pct: pts.length ? Math.round(count / pts.length * 100) : 0 }
  })
})

const hrInput = ref({ hour: new Date().getHours(), bpm: 75, speed: 0 })

function updateHrPoint() {
  const day = hrDays.value.find(d => d.date === hrSelectedDate.value)
  if (!day) return
  const pt = day.points.find(p => p.hour === hrInput.value.hour)
  if (pt) { pt.bpm = hrInput.value.bpm; pt.speed = hrInput.value.speed }
  else day.points.push({ hour: hrInput.value.hour, bpm: hrInput.value.bpm, speed: hrInput.value.speed })
  day.points.sort((a, b) => a.hour - b.hour)
  localStorage.setItem(HR_KEY, JSON.stringify(hrDays.value))
}

function applyHrPreset(type) {
  const day = hrDays.value.find(d => d.date === hrSelectedDate.value)
  if (!day) return
  const patterns = {
    hiit:      [58,58,58,58,58,58,62,180,175,170,65,65,65,65,65,65,65,175,180,170,65,65,62,58],
    endurance: [58,58,58,58,58,58,62,140,145,148,65,65,65,65,65,65,65,142,145,140,65,65,62,58],
    recovery:  [58,58,58,58,58,58,62,90,95,92,65,65,65,65,65,65,65,88,90,88,65,65,62,58],
  }
  const p = patterns[type]
  if (!p) return
  day.points = p.map((bpm, h) => ({ hour: h, bpm, speed: bpm > 130 ? 20 : bpm > 100 ? 12 : 0 }))
  localStorage.setItem(HR_KEY, JSON.stringify(hrDays.value))
}

const hrAreaOption = computed(() => {
  const pts = (selectedDayData.value?.points || []).sort((a, b) => a.hour - b.hour)
  const hours = pts.map(p => String(p.hour).padStart(2, '0') + ':00')
  const bpms  = pts.map(p => p.bpm)
  const speeds = pts.map(p => p.speed)
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: '#0f172a', borderColor: '#334155', textStyle: { color: '#e2e8f0' } },
    legend: { data: ['心率 BPM', '速度 km/h'], textStyle: { color: '#94a3b8' }, top: 4 },
    grid: { left: 44, right: 44, top: 36, bottom: 40 },
    xAxis: { type: 'category', data: hours, axisLabel: { color: '#64748b', fontSize: 10 }, axisLine: { lineStyle: { color: '#1e293b' } } },
    yAxis: [
      { type: 'value', name: 'BPM', nameTextStyle: { color: '#64748b' }, axisLabel: { color: '#64748b' }, splitLine: { lineStyle: { color: '#1e293b' } } },
      { type: 'value', name: 'km/h', nameTextStyle: { color: '#64748b' }, axisLabel: { color: '#64748b' }, splitLine: { show: false } },
    ],
    series: [
      {
        name: '心率 BPM', type: 'line', data: bpms,
        lineStyle: { color: '#fb7185', width: 2 }, itemStyle: { color: '#fb7185' },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(251,113,133,0.3)' }, { offset: 1, color: 'rgba(251,113,133,0.02)' }] } },
        smooth: true,
        markLine: {
          silent: true, lineStyle: { color: '#f59e0b', type: 'dashed', opacity: 0.5 },
          data: [{ yAxis: 140, name: '有氧阈值' }],
          label: { color: '#f59e0b', fontSize: 10 },
        },
      },
      { name: '速度 km/h', type: 'bar', yAxisIndex: 1, data: speeds, itemStyle: { color: 'rgba(96,165,250,0.5)' }, barMaxWidth: 12 },
    ],
  }
})

// ── Lifecycle ──────────────────────────────────────────────────────
onMounted(() => {
  loadBattery()
  loadTempHistory()
})
</script>

<style scoped>
/* ── Root ─────────────────────────────────────────────────────── */
.dv-root {
  min-height: 100vh;
  background: #020817;
  color: #e2e8f0;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  display: flex;
  flex-direction: column;
}

/* ── Header ───────────────────────────────────────────────────── */
.dv-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  border-bottom: 1px solid #1e293b;
  background: rgba(2,8,23,0.95);
  backdrop-filter: blur(8px);
  position: sticky;
  top: 0;
  z-index: 10;
}
.dv-header__brand { display: flex; align-items: center; gap: 12px; }
.dv-brand-icon {
  width: 36px; height: 36px;
  background: linear-gradient(135deg, #0ea5e9, #6366f1);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: white;
}
.dv-brand-title { font-size: 14px; font-weight: 700; color: #f1f5f9; display: flex; align-items: center; gap: 8px; }
.dv-brand-badge { font-size: 9px; background: rgba(14,165,233,0.15); color: #38bdf8; border: 1px solid rgba(14,165,233,0.3); border-radius: 4px; padding: 1px 6px; }
.dv-brand-desc { font-size: 9px; color: #475569; margin-top: 2px; letter-spacing: 0.05em; }

/* ── Tabs ─────────────────────────────────────────────────────── */
.dv-tabs {
  display: flex;
  gap: 2px;
  padding: 8px 24px 0;
  border-bottom: 1px solid #1e293b;
  background: #020817;
}
.dv-tab {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px;
  font-size: 12px; font-family: inherit;
  color: #64748b;
  background: transparent;
  border: none; border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}
.dv-tab:hover { color: #94a3b8; }
.dv-tab--active { color: #38bdf8; border-bottom-color: #38bdf8; }
.dv-tab__icon { display: flex; align-items: center; }

/* ── Content ──────────────────────────────────────────────────── */
.dv-content { flex: 1; padding: 24px; overflow-y: auto; }

/* ── Hero ─────────────────────────────────────────────────────── */
.dv-hero {
  position: relative;
  background: linear-gradient(135deg, rgba(14,165,233,0.08) 0%, rgba(99,102,241,0.08) 100%);
  border: 1px solid rgba(14,165,233,0.15);
  border-radius: 12px;
  padding: 28px 32px;
  margin-bottom: 20px;
  overflow: hidden;
}
.dv-hero__bg-text {
  position: absolute; right: 24px; top: 50%; transform: translateY(-50%);
  font-size: 80px; font-weight: 900; color: rgba(14,165,233,0.04);
  letter-spacing: 0.1em; pointer-events: none; user-select: none;
}
.dv-hero__tag { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #38bdf8; margin-bottom: 10px; }
.dv-hero__tag-dot { width: 6px; height: 6px; border-radius: 50%; background: #38bdf8; animation: pulse 2s infinite; }
.dv-hero__title { font-size: 26px; font-weight: 800; color: #f1f5f9; margin: 0 0 8px; }
.dv-hero__title-num { color: #38bdf8; }
.dv-hero__desc { font-size: 12px; color: #64748b; max-width: 560px; line-height: 1.6; margin: 0; }
.dv-hero__back-btn {
  position: absolute; top: 20px; right: 20px;
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px; font-size: 12px; font-family: inherit;
  background: rgba(14,165,233,0.1); color: #38bdf8;
  border: 1px solid rgba(14,165,233,0.3); border-radius: 6px;
  cursor: pointer; transition: all 0.2s;
}
.dv-hero__back-btn:hover { background: rgba(14,165,233,0.2); }

/* ── Entry cards ──────────────────────────────────────────────── */
.dv-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}
.dv-entry-card {
  background: rgba(15,23,42,0.8);
  border: 1px solid #1e293b;
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex; flex-direction: column; gap: 10px;
}
.dv-entry-card:hover { transform: translateY(-2px); border-color: rgba(56,189,248,0.3); }
.dv-entry-card--cyan:hover  { border-color: rgba(34,211,238,0.4); }
.dv-entry-card--emerald:hover { border-color: rgba(52,211,153,0.4); }
.dv-entry-card--amber:hover { border-color: rgba(245,158,11,0.4); }
.dv-entry-card--green:hover { border-color: rgba(74,222,128,0.4); }
.dv-entry-card--rose:hover  { border-color: rgba(251,113,133,0.4); }
.dv-entry-card__top { display: flex; align-items: center; justify-content: space-between; }
.dv-entry-card__icon {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
}
.dv-entry-card__icon--cyan    { background: rgba(34,211,238,0.15); color: #22d3ee; }
.dv-entry-card__icon--emerald { background: rgba(52,211,153,0.15); color: #34d399; }
.dv-entry-card__icon--amber   { background: rgba(245,158,11,0.15); color: #f59e0b; }
.dv-entry-card__icon--green   { background: rgba(74,222,128,0.15); color: #4ade80; }
.dv-entry-card__icon--rose    { background: rgba(251,113,133,0.15); color: #fb7185; }
.dv-entry-card__sub { font-size: 9px; color: #475569; letter-spacing: 0.05em; }
.dv-entry-card__label { font-size: 11px; color: #94a3b8; margin-bottom: 4px; }
.dv-entry-card__val { font-size: 24px; font-weight: 700; color: #f1f5f9; }
.dv-entry-card__val-unit { font-size: 13px; color: #64748b; }
.dv-entry-card__meta { display: flex; gap: 6px; font-size: 10px; color: #475569; }
.dv-entry-card__footer { display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #38bdf8; margin-top: auto; }
.dv-entry-card__link { }

/* ── Guide ────────────────────────────────────────────────────── */
.dv-guide { background: rgba(15,23,42,0.6); border: 1px solid #1e293b; border-radius: 10px; padding: 20px; }
.dv-guide__title { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #94a3b8; margin-bottom: 16px; }
.dv-guide__dot-wrap { position: relative; width: 10px; height: 10px; }
.dv-guide__dot { position: absolute; inset: 0; width: 8px; height: 8px; border-radius: 50%; background: #38bdf8; margin: auto; }
.dv-guide__dot-ping { position: absolute; inset: 0; width: 10px; height: 10px; border-radius: 50%; background: rgba(56,189,248,0.4); animation: pulse 2s infinite; }
.dv-guide__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; }
.dv-guide__item { }
.dv-guide__item-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #cbd5e1; margin-bottom: 6px; }
.dv-guide__item p { font-size: 11px; color: #475569; line-height: 1.6; margin: 0; }

/* ── Panel ────────────────────────────────────────────────────── */
.dv-tab-panel { display: flex; flex-direction: column; gap: 16px; }
.dv-panel-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
.dv-panel-title { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #f1f5f9; }
.dv-range-switch { display: flex; gap: 4px; }
.dv-range-btn {
  padding: 4px 12px; font-size: 11px; font-family: inherit;
  background: rgba(30,41,59,0.8); color: #64748b;
  border: 1px solid #1e293b; border-radius: 4px; cursor: pointer; transition: all 0.2s;
}
.dv-range-btn.active, .dv-range-btn:hover { background: rgba(14,165,233,0.15); color: #38bdf8; border-color: rgba(14,165,233,0.3); }
.dv-stat-pills { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.dv-stat-pill {
  padding: 3px 10px; font-size: 11px; border-radius: 20px;
  background: rgba(30,41,59,0.8); color: #94a3b8; border: 1px solid #1e293b;
}
.dv-stat-pill--emerald { background: rgba(52,211,153,0.1); color: #34d399; border-color: rgba(52,211,153,0.2); }
.dv-stat-pill--amber   { background: rgba(245,158,11,0.1); color: #f59e0b; border-color: rgba(245,158,11,0.2); }
.dv-stat-pill--blue    { background: rgba(96,165,250,0.1); color: #60a5fa; border-color: rgba(96,165,250,0.2); }
.dv-stat-pill--red     { background: rgba(239,68,68,0.1);  color: #ef4444; border-color: rgba(239,68,68,0.2); }
.dv-stat-pill--orange  { background: rgba(249,115,22,0.1); color: #f97316; border-color: rgba(249,115,22,0.2); }
.dv-stat-pill--rose    { background: rgba(251,113,133,0.1); color: #fb7185; border-color: rgba(251,113,133,0.2); }
.dv-pill-btn {
  padding: 3px 10px; font-size: 11px; font-family: inherit; border-radius: 20px;
  cursor: pointer; border: 1px solid; transition: all 0.2s;
}
.dv-pill-btn--danger { background: rgba(239,68,68,0.1); color: #ef4444; border-color: rgba(239,68,68,0.2); }
.dv-pill-btn--danger:hover { background: rgba(239,68,68,0.2); }

/* ── Chart wrap ───────────────────────────────────────────────── */
.dv-chart-wrap {
  background: rgba(15,23,42,0.6); border: 1px solid #1e293b; border-radius: 10px;
  padding: 12px; height: 300px;
}
.dv-chart-wrap--ride    { height: 280px; }
.dv-chart-wrap--battery { height: 240px; }
.dv-chart-wrap--hr      { height: 260px; }
.dv-echart { width: 100%; height: 100%; }

/* ── Empty ────────────────────────────────────────────────────── */
.dv-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 60px; color: #475569; font-size: 13px; }

/* ── Ride layout ──────────────────────────────────────────────── */
.dv-ride-layout { display: grid; grid-template-columns: 1fr 320px; gap: 16px; }
.dv-ride-list { background: rgba(15,23,42,0.6); border: 1px solid #1e293b; border-radius: 10px; padding: 16px; overflow-y: auto; max-height: 320px; }
.dv-ride-list__title { font-size: 12px; color: #64748b; margin-bottom: 10px; }
.dv-ride-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #0f172a; }
.dv-ride-row:last-child { border-bottom: none; }
.dv-ride-row__date { font-size: 11px; color: #64748b; }
.dv-ride-row__dist { font-size: 14px; font-weight: 600; color: #34d399; }
.dv-ride-row__right { display: flex; gap: 8px; }
.dv-ride-row__cal   { font-size: 11px; color: #f59e0b; }
.dv-ride-row__speed { font-size: 11px; color: #60a5fa; }

/* ── Battery layout ───────────────────────────────────────────── */
.dv-battery-layout { display: grid; grid-template-columns: 1fr 300px; gap: 16px; }
.dv-battery-left { display: flex; flex-direction: column; gap: 14px; }
.dv-battery-right { background: rgba(15,23,42,0.6); border: 1px solid #1e293b; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.dv-bat-status { background: rgba(15,23,42,0.8); border: 1px solid #1e293b; border-radius: 10px; padding: 16px; }
.dv-bat-status__pct { font-size: 36px; font-weight: 800; margin-bottom: 8px; }
.dv-bat-bar-wrap { height: 6px; background: #1e293b; border-radius: 3px; overflow: hidden; margin-bottom: 8px; }
.dv-bat-bar { height: 100%; border-radius: 3px; transition: width 0.5s; }
.dv-bat-bar--green { background: linear-gradient(90deg, #22c55e, #4ade80); }
.dv-bat-bar--amber { background: linear-gradient(90deg, #d97706, #f59e0b); }
.dv-bat-bar--red   { background: linear-gradient(90deg, #dc2626, #ef4444); }
.dv-bat-status__meta { display: flex; gap: 12px; font-size: 11px; color: #64748b; }

/* ── HR layout ────────────────────────────────────────────────── */
.dv-hr-layout { display: grid; grid-template-columns: 1fr 280px; gap: 16px; }
.dv-hr-charts { display: flex; flex-direction: column; gap: 14px; }
.dv-hr-form { background: rgba(15,23,42,0.6); border: 1px solid #1e293b; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; max-height: 600px; }
.dv-hr-zones { background: rgba(15,23,42,0.6); border: 1px solid #1e293b; border-radius: 10px; padding: 14px; }
.dv-zone-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.dv-zone-row:last-child { margin-bottom: 0; }
.dv-zone-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dv-zone-name { font-size: 11px; color: #94a3b8; width: 36px; flex-shrink: 0; }
.dv-zone-bar-wrap { flex: 1; height: 6px; background: #1e293b; border-radius: 3px; overflow: hidden; }
.dv-zone-bar { height: 100%; border-radius: 3px; transition: width 0.4s; }
.dv-zone-pct { font-size: 10px; color: #64748b; width: 60px; text-align: right; flex-shrink: 0; }
.dv-hr-day-switch { display: flex; gap: 4px; }
.dv-zone-tag { display: inline-block; padding: 4px 12px; font-size: 11px; border-radius: 20px; border: 1px solid; font-weight: 600; }
.dv-zone-legend { }
.dv-zone-legend-row { display: flex; align-items: center; gap: 8px; font-size: 11px; color: #64748b; margin-bottom: 5px; }

/* ── Form ─────────────────────────────────────────────────────── */
.dv-form-title { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
.dv-form-row { display: flex; align-items: center; gap: 8px; }
.dv-form-label { font-size: 11px; color: #64748b; width: 60px; flex-shrink: 0; }
.dv-form-num { font-size: 12px; font-weight: 600; color: #f1f5f9; width: 44px; text-align: right; flex-shrink: 0; }
.dv-slider { flex: 1; accent-color: #38bdf8; cursor: pointer; }
.dv-select {
  flex: 1; background: #0f172a; color: #e2e8f0; border: 1px solid #1e293b;
  border-radius: 6px; padding: 4px 8px; font-size: 11px; font-family: inherit; cursor: pointer;
}
.dv-form-toggle { display: flex; gap: 4px; }
.dv-toggle-btn {
  padding: 4px 12px; font-size: 11px; font-family: inherit;
  background: rgba(30,41,59,0.8); color: #64748b;
  border: 1px solid #1e293b; border-radius: 4px; cursor: pointer; transition: all 0.2s;
}
.dv-toggle-btn.active { background: rgba(14,165,233,0.15); color: #38bdf8; border-color: rgba(14,165,233,0.3); }
.dv-form-actions { display: flex; gap: 6px; flex-wrap: wrap; }
.dv-form-btn {
  padding: 6px 12px; font-size: 11px; font-family: inherit;
  border-radius: 6px; border: 1px solid; cursor: pointer; transition: all 0.2s;
}
.dv-form-btn--primary { background: rgba(14,165,233,0.15); color: #38bdf8; border-color: rgba(14,165,233,0.3); }
.dv-form-btn--primary:hover { background: rgba(14,165,233,0.25); }
.dv-form-btn--green   { background: rgba(74,222,128,0.1);  color: #4ade80; border-color: rgba(74,222,128,0.2); }
.dv-form-btn--green:hover { background: rgba(74,222,128,0.2); }
.dv-form-btn--amber   { background: rgba(245,158,11,0.1);  color: #f59e0b; border-color: rgba(245,158,11,0.2); }
.dv-form-btn--amber:hover { background: rgba(245,158,11,0.2); }
.dv-form-btn--red     { background: rgba(239,68,68,0.1);   color: #ef4444; border-color: rgba(239,68,68,0.2); }
.dv-form-btn--red:hover { background: rgba(239,68,68,0.2); }
.dv-form-btn--blue    { background: rgba(96,165,250,0.1);  color: #60a5fa; border-color: rgba(96,165,250,0.2); }
.dv-form-btn--blue:hover { background: rgba(96,165,250,0.2); }
.dv-preset-btns { display: flex; flex-direction: column; gap: 6px; }

/* ── Mini list ────────────────────────────────────────────────── */
.dv-mini-list { margin-top: 4px; }
.dv-mini-list__title { font-size: 11px; color: #64748b; margin-bottom: 6px; }
.dv-mini-row { display: flex; align-items: center; gap: 8px; padding: 5px 0; border-bottom: 1px solid #0f172a; font-size: 11px; }
.dv-mini-row:last-child { border-bottom: none; }
.dv-mini-row__time { color: #475569; width: 36px; flex-shrink: 0; }
.dv-mini-row__val  { font-weight: 600; width: 36px; flex-shrink: 0; }
.dv-mini-row__sub  { color: #475569; }

/* ── Colors ───────────────────────────────────────────────────── */
.clr-green { color: #4ade80; }
.clr-amber { color: #f59e0b; }
.clr-red   { color: #ef4444; }

/* ── Animations ───────────────────────────────────────────────── */
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(1.4); }
}

/* ── Responsive ───────────────────────────────────────────────── */
@media (max-width: 900px) {
  .dv-ride-layout, .dv-safety-layout, .dv-battery-layout, .dv-hr-layout {
    grid-template-columns: 1fr;
  }
  .dv-cards-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .dv-content { padding: 12px; }
  .dv-cards-grid { grid-template-columns: 1fr; }
  .dv-hero { padding: 20px; }
  .dv-hero__title { font-size: 20px; }
}
</style>
