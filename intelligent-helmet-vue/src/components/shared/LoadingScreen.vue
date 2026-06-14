<template>
  <div
    class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white overflow-hidden"
    :class="{ 'slide-out': exiting }"
  >
    <!-- Background Tech Elements -->
    <div class="absolute inset-0 opacity-20 pointer-events-none">
      <div class="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent"></div>
      <div class="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent"></div>
      <div class="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
    </div>

    <div class="relative z-10 flex flex-col items-center w-full max-w-md px-8">
      <!-- Big Number -->
      <div class="text-7xl md:text-8xl font-mono font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 mb-6 tracking-tighter flex items-baseline">
        {{ String(progress).padStart(3, '0') }}<span class="text-cyan-400 text-4xl md:text-5xl ml-1">%</span>
      </div>

      <!-- Progress Bar - Slanted -->
      <div
        class="w-full h-3 bg-slate-800 relative overflow-hidden"
        style="clip-path: polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)"
      >
        <div
          class="absolute top-0 left-0 h-full bg-cyan-400 transition-all duration-75 ease-linear"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>

      <!-- Tech decorative text -->
      <div class="w-full flex justify-between mt-4 text-[10px] md:text-xs font-mono text-slate-500 uppercase tracking-[0.2em]">
        <span>Sys.Init_V2.0</span>
        <span class="text-cyan-500/80 animate-pulse">Loading_Assets...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const emit = defineEmits(['complete']);
const progress = ref(0);
const exiting = ref(false);

onMounted(() => {
  const duration = 2500;
  const interval = 30;
  const steps = duration / interval;
  let currentStep = 0;

  const timer = setInterval(() => {
    currentStep++;
    const t = currentStep / steps;
    const easeOutQuart = 1 - Math.pow(1 - t, 4);
    progress.value = Math.min(Math.floor(easeOutQuart * 100), 100);

    if (currentStep >= steps) {
      progress.value = 100; // 修复：确保最后一步强制到达 100
      clearInterval(timer);
      setTimeout(() => {
        exiting.value = true;
        setTimeout(() => emit('complete'), 800);
      }, 500);
    }
  }, interval);
});
</script>

<style scoped>
.slide-out {
  animation: slideOut 0.8s cubic-bezier(0.76, 0, 0.24, 1) forwards;
}

@keyframes slideOut {
  from { transform: translateY(0); }
  to   { transform: translateY(-100%); }
}
</style>