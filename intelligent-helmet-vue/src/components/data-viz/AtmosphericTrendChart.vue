<template>
  <!-- 外层容器：半透明背景 + 毛玻璃 + 霓虹边框 -->
  <div class="bg-[#0a1628] border border-white/10 rounded-xl p-8 flex flex-col h-full relative overflow-hidden">

    <!-- 头部：标题与自定义图例 -->
    <div class="flex justify-between items-center mb-8">
      <div class="space-y-1">
        <div class="h-[1px] w-12 bg-[#00f2ff]/50"></div>
      </div>

      <div class="flex gap-6">
        <div class="flex items-center gap-2">
          <div class="w-1.5 h-1.5 rounded-full bg-[#00f2ff] animate-pulse-glow" />
          <span class="text-[10px] font-mono text-white/40 tracking-tighter">温度</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-1.5 h-1.5 rounded-full bg-[#ff0055] animate-pulse-glow" />
          <span class="text-[10px] font-mono text-white/40 tracking-tighter">湿度</span>
        </div>
      </div>
    </div>

    <!-- 图表主区域 -->
    <div style="height: 350px; width: 100%;">
      <v-chart
        class="chart-container"
        :option="chartOption"
        autoresize
        :loading="!chartData.length"
        :loadingOptions="{ color: '#00f2ff', maskColor: 'transparent' }"
      />
    </div>

    <!-- 底部：统计摘要与操作 -->
    <div class="mt-8 pt-6 border-t border-white/5 flex flex-wrap justify-between items-center gap-6">
      <div class="flex gap-10">
        <div class="group">
          <p class="text-[9px] text-[#00f2ff] uppercase font-mono tracking-widest">最低温度</p>
          <p class="text-sm font-mono text-white/70 mt-1">{{ stats.minTemp }}°C</p>
        </div>
        <div class="group">
          <p class="text-[9px] text-[#00f2ff] uppercase font-mono tracking-widest">最高温度</p>
          <p class="text-sm font-mono text-white/70 mt-1">{{ stats.maxTemp }}°C</p>
        </div>
        <div class="group">
          <p class="text-[9px] text-[#ff0055] uppercase font-mono tracking-widest">平均湿度</p>
          <p class="text-sm font-mono text-white/70 mt-1">{{ stats.avgHum }}%</p>
        </div>
      </div>

      <!-- 高科技按钮 -->
      <button
        @click="handleExport"
        class="group relative px-6 py-2 overflow-hidden border border-[#00f2ff]/30 hover:border-[#00f2ff] transition-all"
      >
        <div class="absolute inset-0 bg-[#00f2ff]/5 translate-y-full group-hover:translate-y-0 transition-transform"></div>
        <span class="relative text-[#00f2ff] text-[10px] font-mono uppercase tracking-[0.2em]">
          保存数据到本地
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  VisualMapComponent,
  DatasetComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

// 注册 ECharts 模块
use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  VisualMapComponent,
  DatasetComponent
])

const props = defineProps({
  chartData: {
    type: Array,
    default: () => []
  },
  timeRange: {
    type: String,
    default: 'minute' // 'minute' | 'hour' | 'day'
  }
})

// 计算统计数据
const stats = computed(() => {
  if (!props.chartData.length) return { minTemp: '--', maxTemp: '--', avgHum: '--' }
  const temps = props.chartData.map(d => d.temp)
  const hums = props.chartData.map(d => d.hum)
  return {
    minTemp: Math.min(...temps).toFixed(1),
    maxTemp: Math.max(...temps).toFixed(1),
    avgHum: (hums.reduce((a, b) => a + b, 0) / hums.length).toFixed(1)
  }
})

// ECharts 配置核心：实现霓虹发光 + 丝滑动画
const chartOption = computed(() => ({
  backgroundColor: 'transparent',

  // 核心动画配置 - 实现丝滑滚动
  animation: true,
  animationDuration: 1000, // 动画持续时间 1 秒
  animationEasing: 'cubicOut', // 缓动效果，接近终点时变慢
  animationDurationUpdate: 1000, // 数据更新时的动画时长
  animationEasingUpdate: 'cubicOut', // 数据更新时的缓动函数

  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(5, 5, 5, 0.9)',
    borderColor: 'rgba(0, 242, 255, 0.2)',
    borderWidth: 1,
    textStyle: {
      color: '#fff',
      fontFamily: 'JetBrains Mono',
      fontSize: 11
    },
    padding: [10, 15],
    formatter: (params) => {
      const label = props.timeRange === 'day' ? `DATE: ${params[0].name}` : props.timeRange === 'hour' ? `HOUR: ${params[0].name}` : `TIMESTAMP: ${params[0].name}`
      let res = `<div style="margin-bottom: 5px; color: #666; font-size: 10px;">${label}</div>`
      params.forEach(item => {
        const color = item.seriesName === 'TEMP' ? '#00f2ff' : '#ff0055'
        res += `<div style="display: flex; justify-content: space-between; gap: 20px;">
                  <span style="color: ${color}">${item.seriesName}:</span>
                  <span style="font-weight: bold">${item.value.toFixed(1)}</span>
                </div>`
      })
      return res
    }
  },

  grid: {
    top: '10%',
    left: '2%',
    right: '2%',
    bottom: '5%',
    containLabel: true
  },

  xAxis: {
    type: 'category',
    data: props.chartData.map(d => d.time),
    boundaryGap: false,
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    axisTick: { show: false },
    axisLabel: {
      color: 'rgba(255,255,255,0.3)',
      fontFamily: 'JetBrains Mono',
      fontSize: 9,
      margin: 15,
      // 天级别只显示 MM-DD，小时级直接显示 HH:00，分钟级显示完整时间
      formatter: (val) => props.timeRange === 'day' ? val.slice(5) : val
    }
  },

  yAxis: {
    type: 'value',
    // 核心设置：让 Y 轴不从 0 开始，而是根据数据的最小值自动缩放
    scale: true,
    // 更精确地控制 Y 轴范围
    min: (value) => Math.floor(value.min - 1),
    max: (value) => Math.ceil(value.max + 1),
    splitLine: {
      lineStyle: {
        color: 'rgba(255,255,255,0.03)',
        type: 'dashed'
      }
    },
    axisLine: { show: false },
    axisLabel: {
      color: 'rgba(255,255,255,0.3)',
      fontFamily: 'JetBrains Mono',
      fontSize: 9
    }
  },

  series: [
    {
      name: 'TEMP',
      type: 'line',
      smooth: 0.4, // 三次样条插值平滑
      showSymbol: false, // 隐藏数据点，减少跳动感
      data: props.chartData.map(d => d.temp),
      lineStyle: {
        color: '#00f2ff',
        width: 2,
        shadowBlur: 15,
        shadowColor: 'rgba(0, 242, 255, 0.6)' // 核心：发光阴影
      },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(0, 242, 255, 0.15)' },
            { offset: 1, color: 'rgba(0, 242, 255, 0)' }
          ]
        }
      }
    },
    {
      name: 'HUM',
      type: 'line',
      smooth: 0.4, // 三次样条插值平滑
      showSymbol: false, // 隐藏数据点，减少跳动感
      data: props.chartData.map(d => d.hum),
      lineStyle: {
        color: '#ff0055',
        width: 2,
        shadowBlur: 15,
        shadowColor: 'rgba(255, 0, 85, 0.6)' // 核心：发光阴影
      },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(255, 0, 85, 0.15)' },
            { offset: 1, color: 'rgba(255, 0, 85, 0)' }
          ]
        }
      }
    }
  ]
}))

// 导出数据功能
function handleExport() {
  if (!props.chartData.length) {
    console.log('[Export] 没有数据可导出')
    return
  }

  const data = props.chartData.map(d => `${d.time},${d.temp},${d.hum}`).join('\n')
  const blob = new Blob([`Time,Temperature,Humidity\n${data}`], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `atmospheric_data_${new Date().getTime()}.csv`
  a.click()
  URL.revokeObjectURL(url)

  console.log('[Export] 数据已导出')
}
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
}

/* 霓虹闪烁动画 - 优化版 */
@keyframes pulse-glow {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 8px currentColor;
  }
  50% {
    opacity: 0.6;
    transform: scale(0.9);
    box-shadow: 0 0 4px currentColor;
  }
}

.animate-pulse-glow {
  animation: pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
