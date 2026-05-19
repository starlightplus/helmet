<template>
  <div class="temp-humid-cards">
    <!-- Ambient Temperature Card -->
    <div
      class="data-card data-card--temp"
      :class="cn(
        'relative p-6 bg-black/40 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md',
        'before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-[#00f2ff]',
        'glow-border-cyan'
      )"
    >
      <!-- Scanline Effect -->
      <div class="scanline"></div>

      <!-- Header -->
      <div class="flex justify-between items-start mb-4">
        <div>
          <p class="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono">Ambient Temperature</p>
          <h3 class="text-xs font-semibold text-white/80 mt-1 font-mono">SENSOR_NODE_01</h3>
        </div>

        <!-- Custom Tech Icon -->
        <div class="text-[#00f2ff]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 4V20M8 8H16M8 12H16M8 16H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            <circle cx="12" cy="4" r="1.5" fill="currentColor" />
            <circle cx="12" cy="20" r="1.5" fill="currentColor" />
          </svg>
        </div>
      </div>

      <!-- Value -->
      <div class="flex items-baseline gap-2">
        <span
          class="text-5xl font-mono font-bold tracking-tighter transition-all duration-500 text-[#00f2ff] glow-cyan"
        >
          {{ temperature != null ? temperature.toFixed(1) : '--' }}
        </span>
        <span class="text-lg font-mono text-white/30">°C</span>
      </div>

      <!-- Dot Matrix Progress Bar -->
      <div class="mt-6 flex gap-1 h-1">
        <div
          v-for="i in 20"
          :key="i"
          :class="cn(
            'flex-1 rounded-full transition-all duration-700',
            i <= (tempPercent / 5) ? 'bg-[#00f2ff] shadow-[0_0_4px_rgba(0,242,255,0.6)]' : 'bg-white/5'
          )"
        ></div>
      </div>
    </div>

    <!-- Relative Humidity Card -->
    <div
      class="data-card data-card--humid"
      :class="cn(
        'relative p-6 bg-black/40 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md',
        'before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-[#ff0055]',
        'glow-border-magenta'
      )"
    >
      <!-- Scanline Effect -->
      <div class="scanline"></div>

      <!-- Header -->
      <div class="flex justify-between items-start mb-4">
        <div>
          <p class="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono">Relative Humidity</p>
          <h3 class="text-xs font-semibold text-white/80 mt-1 font-mono">SENSOR_NODE_01</h3>
        </div>

        <!-- Custom Tech Icon -->
        <div class="text-[#ff0055]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 4C12 4 4 11 4 16C4 20.4183 7.58172 24 12 24C16.4183 24 20 20.4183 20 16C20 11 12 4 12 4Z" stroke="currentColor" stroke-width="1" />
            <circle cx="12" cy="16" r="3" stroke="currentColor" stroke-width="0.5" />
          </svg>
        </div>
      </div>

      <!-- Value -->
      <div class="flex items-baseline gap-2">
        <span
          class="text-5xl font-mono font-bold tracking-tighter transition-all duration-500 text-[#ff0055] glow-magenta"
        >
          {{ humidity != null ? humidity.toFixed(1) : '--' }}
        </span>
        <span class="text-lg font-mono text-white/30">%</span>
      </div>

      <!-- Dot Matrix Progress Bar -->
      <div class="mt-6 flex gap-1 h-1">
        <div
          v-for="i in 20"
          :key="i"
          :class="cn(
            'flex-1 rounded-full transition-all duration-700',
            i <= (humidPercent / 5) ? 'bg-[#ff0055] shadow-[0_0_4px_rgba(255,0,85,0.6)]' : 'bg-white/5'
          )"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const props = defineProps({
  temperature: { type: Number, default: null },
  humidity: { type: Number, default: null }
})

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Temperature calculations (0-50°C range)
const tempPercent = computed(() => {
  if (props.temperature == null) return 0
  return Math.min(Math.max((props.temperature / 50) * 100, 0), 100)
})

// Humidity calculations (0-100% range)
const humidPercent = computed(() => {
  if (props.humidity == null) return 0
  return Math.min(Math.max(props.humidity, 0), 100)
})
</script>

<style scoped>
.temp-humid-cards {
  display: flex;
  gap: 16px;
  width: 100%;
}

.data-card {
  flex: 1;
  position: relative;
}

.glow-border-magenta {
  box-shadow: 0 0 15px rgba(255, 0, 85, 0.1), inset 0 0 10px rgba(255, 0, 85, 0.05);
}
</style>
