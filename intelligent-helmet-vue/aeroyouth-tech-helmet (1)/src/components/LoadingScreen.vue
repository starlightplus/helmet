<template>
  <div class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 overflow-hidden">
    <!-- 背景网格 -->
    <div class="absolute inset-0 opacity-20" style="background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px); background-size: 50px 50px;"></div>

    <div class="relative z-10 flex flex-col items-center w-full max-w-md px-8">
      <div class="text-cyan-500 font-mono text-sm tracking-[0.3em] mb-8 animate-pulse">
        INITIALIZING AEROYOUTH OS
      </div>

      <!-- 进度条容器 -->
      <div class="w-full h-[2px] bg-slate-800 relative overflow-hidden mb-4">
        <div
          class="absolute top-0 left-0 h-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all duration-75 ease-linear"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>

      <div class="w-full flex justify-between text-xs font-mono text-slate-500">
        <span>SYS.BOOT</span>
        <span class="text-cyan-400">{{ Math.round(progress) }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const emit = defineEmits(['complete']);
const progress = ref(0);

onMounted(() => {
  const duration = 2500; // 2.5秒加载时间
  const interval = 30;
  const steps = duration / interval;
  let currentStep = 0;

  const timer = setInterval(() => {
    currentStep++;
    // 缓动函数，让进度条先快后慢
    const easeOutQuart = 1 - Math.pow(1 - currentStep / steps, 4);
    progress.value = Math.min(easeOutQuart * 100, 100);

    if (currentStep >= steps) {
      clearInterval(timer);
      setTimeout(() => {
        emit('complete');
      }, 200);
    }
  }, interval);
});
</script>
