<template>
  <div
    class="relative min-h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden"
    :class="{ 'content-enter': !isLoading }"
  >
    <!-- Loading Screen -->
    <LoadingScreen v-if="isLoading" @complete="isLoading = false" />

    <!-- Main Content (shown after loading) -->
    <template v-if="!isLoading">
      <!-- Tech Background Grid -->
      <div
        class="absolute inset-0 pointer-events-none opacity-[0.03] fixed"
        style="background-image: linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px); background-size: 40px 40px;"
      ></div>

      <!-- Crosshairs (Fixed) -->
      <div class="fixed top-32 left-8 w-4 h-4 border-t border-l border-slate-400 opacity-50 pointer-events-none z-0"></div>
      <div class="fixed top-32 right-8 w-4 h-4 border-t border-r border-slate-400 opacity-50 pointer-events-none z-0"></div>
      <div class="fixed bottom-8 left-8 w-4 h-4 border-b border-l border-slate-400 opacity-50 pointer-events-none z-0"></div>
      <div class="fixed bottom-8 right-8 w-4 h-4 border-b border-r border-slate-400 opacity-50 pointer-events-none z-0"></div>

      <!-- 终末地战术风格 Navigation Bar -->
      <header
        class="fixed top-0 left-0 w-full h-20 z-50 flex items-center justify-between px-6 md:px-12 transition-all duration-300"
        :class="isScrolled ? 'bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-2xl' : 'bg-transparent'"
      >
        <!-- 左侧：战术标识区 (Identity) -->
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-4 cursor-pointer group">
            <!-- 带有斜切角的实心方块 Logo -->
            <div
              class="w-10 h-10 bg-cyan-500 flex items-center justify-center text-slate-950 font-black italic text-lg transition-transform duration-300 group-hover:scale-105"
              style="clip-path: polygon(20% 0%, 100% 0%, 80% 100%, 0% 100%)"
            >
              AY
            </div>
            <div class="flex flex-col justify-center">
              <span class="text-xl font-black tracking-tighter text-white uppercase leading-none" :class="isScrolled ? 'text-white' : 'text-slate-900'">
                Aero<span class="text-cyan-500">Youth</span>
              </span>
              <!-- 微型装饰文字 (Micro-copy) -->
              <span class="text-[9px] font-mono text-slate-500 tracking-[0.2em] mt-1">
                // TACTICAL GEAR SYS.
              </span>
            </div>
          </div>
        </div>

        <!-- 中间：导航枢纽 (Navigation) -->
        <nav class="hidden lg:flex items-center gap-10">
          <a href="#" class="group relative flex items-center text-xs font-mono font-bold tracking-[0.2em] uppercase text-slate-400 hover:text-cyan-400 transition-colors h-20">
            <!-- 悬浮时滑入的战术方块 -->
            <span class="absolute left-0 opacity-0 group-hover:opacity-100 group-hover:-translate-x-4 text-cyan-500 transition-all duration-300">■</span>
            Overview
            <!-- 悬浮时底部展开的能量条 -->
            <div class="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </a>

          <a href="#architecture" class="group relative flex items-center text-xs font-mono font-bold tracking-[0.2em] uppercase text-slate-400 hover:text-cyan-400 transition-colors h-20">
            <span class="absolute left-0 opacity-0 group-hover:opacity-100 group-hover:-translate-x-4 text-cyan-500 transition-all duration-300">■</span>
            Architecture
            <div class="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </a>

          <a href="#" class="group relative flex items-center text-xs font-mono font-bold tracking-[0.2em] uppercase text-slate-400 hover:text-cyan-400 transition-colors h-20">
            <span class="absolute left-0 opacity-0 group-hover:opacity-100 group-hover:-translate-x-4 text-cyan-500 transition-all duration-300">■</span>
            Safety
            <div class="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </a>

          <a href="#" class="group relative flex items-center text-xs font-mono font-bold tracking-[0.2em] uppercase text-slate-400 hover:text-cyan-400 transition-colors h-20">
            <span class="absolute left-0 opacity-0 group-hover:opacity-100 group-hover:-translate-x-4 text-cyan-500 transition-all duration-300">■</span>
            Specs
            <div class="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </a>
        </nav>

        <!-- 右侧：战术指令区 (Action) -->
        <div class="flex items-center gap-8">
          <!-- 状态指示器 -->
          <div class="hidden md:flex flex-col items-end">
            <div class="flex items-center gap-2 mb-1">
              <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]"></span>
              <span class="text-[9px] font-mono text-slate-400 tracking-widest">LINK: SECURE</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-3 h-[1px] bg-slate-600"></div>
              <div class="w-1 h-[1px] bg-slate-600"></div>
              <span class="text-[9px] font-mono text-cyan-500 tracking-widest">OP.01_ACTIVE</span>
            </div>
          </div>

          <!-- 战术主按钮 -->
          <button
            class="relative px-8 py-3 bg-slate-800 text-white text-xs font-mono font-bold uppercase tracking-[0.2em] group overflow-hidden border border-slate-700 hover:border-cyan-500 transition-colors"
            style="clip-path: polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)"
          >
            <span class="relative z-10 group-hover:text-slate-950 transition-colors duration-300 flex items-center gap-2">
              PRE-ORDER
              <svg class="w-3 h-3 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
            <!-- 悬浮时从左侧滑入的青色能量层 -->
            <div class="absolute inset-0 bg-cyan-500 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out z-0"></div>
          </button>
        </div>
      </header>

      <!-- Hero Section -->
      <main class="relative pt-32 pb-20 px-6 md:px-12 max-w-[1600px] mx-auto min-h-screen flex flex-col lg:flex-row items-center justify-between gap-12 z-10">

        <!-- Left Content -->
        <div class="flex-1 w-full animate-fade-up">
          <div class="flex items-center gap-4 mb-6">
            <div class="inline-block px-3 py-1 border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 text-[10px] font-mono font-bold uppercase tracking-widest">
              SYS.01 // Next Gen
            </div>
            <div class="h-[1px] w-12 bg-slate-300"></div>
            <span class="text-[10px] font-mono text-slate-400 tracking-widest uppercase">Youth Cycling Series</span>
          </div>

          <h1 class="text-6xl md:text-7xl lg:text-[5.5rem] font-black tracking-tighter leading-[0.85] mb-8 text-slate-900 uppercase">
            Absolute <br />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 relative inline-block mt-2">
              Protection
              <div class="absolute -right-4 top-0 w-2 h-full bg-cyan-500" style="clip-path: polygon(100% 0, 100% 100%, 0 100%)"></div>
            </span>
          </h1>

          <p class="text-base md:text-lg text-slate-500 max-w-xl font-medium leading-relaxed mb-10">
            Engineered for the next generation of riders. The AeroYouth combines aerospace-grade lightweight materials with a high-density EPS core. Extreme safety meets geek-chic aesthetics.
          </p>

          <div class="flex flex-wrap items-center gap-6">
            <button
              class="relative px-8 py-4 bg-cyan-500 text-slate-900 text-sm font-bold uppercase tracking-widest group overflow-hidden flex items-center gap-3"
              style="clip-path: polygon(16px 0, 100% 0, calc(100% - 16px) 100%, 0 100%)"
            >
              <!-- 文字和图标层 -->
              <span class="relative z-10 flex items-center gap-3 group-hover:text-cyan-600 transition-colors duration-300">
                Explore Features
                <!-- 图标在悬浮时向右移动一点点，增加动感 -->
                <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>

              <!-- 隐藏的动画背景层：白色背景从左侧滑入 -->
              <div class="absolute inset-0 bg-white translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out z-0"></div>
            </button>

            <div class="flex flex-col text-[10px] font-mono text-slate-400 uppercase tracking-widest border-l-2 border-slate-200 pl-4">
              <span class="text-slate-900 font-bold text-lg">240g</span>
              <span>Ultra-lightweight</span>
            </div>
            <div class="flex flex-col text-[10px] font-mono text-slate-400 uppercase tracking-widest border-l-2 border-slate-200 pl-4">
              <span class="text-slate-900 font-bold text-lg">CPSC</span>
              <span>Certified Safe</span>
            </div>
          </div>
        </div>

        <!-- Right Content -->
        <div class="flex-1 relative w-full h-[500px] lg:h-[700px] flex items-center justify-center animate-fade-in">
          <!-- Tech Rings Background -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full border border-slate-200/60 absolute animate-[spin_60s_linear_infinite]"></div>
            <div class="w-[400px] h-[400px] md:w-[650px] md:h-[650px] rounded-full border border-dashed border-slate-200/80 absolute animate-[spin_90s_linear_infinite_reverse]"></div>
            <div class="w-[250px] h-[250px] md:w-[400px] md:h-[400px] rounded-full border-t border-r border-cyan-400/30 absolute animate-[spin_20s_linear_infinite]"></div>
          </div>

          <!-- Product Image -->
          <div class="relative z-10 w-full max-w-md aspect-square">
            <img
              src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1000&bg=f8fafc"
              alt="AeroYouth Helmet"
              class="w-full h-full object-contain drop-shadow-2xl mix-blend-darken"
              referrerpolicy="no-referrer"
            />

            <!-- Floating Tech Label 1 -->
            <div
              class="absolute top-1/4 -right-8 md:-right-16 bg-white/90 backdrop-blur-sm border border-slate-200 p-3 shadow-xl"
              style="clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)"
            >
              <div class="text-[9px] font-mono text-cyan-600 uppercase tracking-widest mb-1">Material</div>
              <div class="text-xs font-bold text-slate-900 uppercase tracking-wider">Polycarbonate Shell</div>
            </div>

            <!-- Floating Tech Label 2 -->
            <div
              class="absolute bottom-1/4 -left-8 md:-left-16 bg-white/90 backdrop-blur-sm border border-slate-200 p-3 shadow-xl"
              style="clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)"
            >
              <div class="text-[9px] font-mono text-cyan-600 uppercase tracking-widest mb-1">Ventilation</div>
              <div class="text-xs font-bold text-slate-900 uppercase tracking-wider">14 Airflow Vents</div>
            </div>
          </div>
        </div>
      </main>

      <!-- 3D Model Showcase -->
      <ModelShowcase />

      <!-- Bento Grid Features Section -->
      <section id="architecture" class="relative py-32 px-6 md:px-12 max-w-[1600px] mx-auto z-10">
        <div class="mb-16">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-2 h-2 bg-cyan-500" style="clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"></div>
            <span class="text-[10px] font-mono text-cyan-600 tracking-widest uppercase">Sys.02 // Architecture</span>
          </div>
          <h2 class="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-900 uppercase">
            Core <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">Modules</span>
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
          <!-- Feature 1: Aerodynamics (Large Card) -->
          <div
            class="md:col-span-8 bg-white border border-slate-200 p-8 md:p-12 relative group overflow-hidden"
            style="clip-path: polygon(0 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%)"
          >
            <div class="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div class="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div class="relative z-10 flex flex-col h-full justify-between">
              <div class="flex justify-between items-start mb-12">
                <div class="text-5xl font-black text-slate-100">01</div>
                <div class="px-2 py-1 bg-slate-900 text-cyan-400 text-[9px] font-mono uppercase tracking-widest">Active</div>
              </div>
              <div>
                <h3 class="text-2xl font-bold uppercase tracking-tight mb-3 text-slate-900">Aero-Flow Dynamics</h3>
                <p class="text-slate-500 text-sm leading-relaxed max-w-md">
                  14 precisely engineered vents channel air through the helmet, reducing drag by 18% while maintaining optimal thermal regulation during intense rides.
                </p>
              </div>
            </div>
            <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-slate-50 rounded-full border border-slate-100 group-hover:scale-110 transition-transform duration-700 ease-out"></div>
          </div>

          <!-- Feature 2: Magnetic Buckle (Small Card, Dark) -->
          <div
            class="md:col-span-4 bg-slate-900 text-white p-8 md:p-12 relative group overflow-hidden"
            style="clip-path: polygon(24px 0, 100% 0, 100% 100%, 0 100%, 0 24px)"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative z-10 flex flex-col h-full justify-between">
              <div class="text-5xl font-black text-slate-800 mb-12">02</div>
              <div>
                <h3 class="text-xl font-bold uppercase tracking-tight mb-3 text-white">Fidlock® Snap</h3>
                <p class="text-slate-400 text-sm leading-relaxed">
                  One-handed magnetic fastening system. Secure lock in milliseconds, effortless release.
                </p>
              </div>
            </div>
          </div>

          <!-- Feature 3: Reflective (Small Card) -->
          <div class="md:col-span-4 bg-white border border-slate-200 p-8 md:p-12 relative group overflow-hidden">
            <div class="absolute top-4 right-4 w-2 h-2 bg-cyan-500 animate-pulse"></div>
            <div class="relative z-10 flex flex-col h-full justify-between">
              <div class="text-5xl font-black text-slate-100 mb-12">03</div>
              <div>
                <h3 class="text-xl font-bold uppercase tracking-tight mb-3 text-slate-900">360° Visibility</h3>
                <p class="text-slate-500 text-sm leading-relaxed">
                  Integrated micro-prismatic reflective decals ensure maximum visibility in low-light urban environments.
                </p>
              </div>
            </div>
          </div>

          <!-- Feature 4: EPS Core (Large Card) -->
          <div
            class="md:col-span-8 bg-slate-100 border border-slate-200 p-8 md:p-12 relative group overflow-hidden"
            style="clip-path: polygon(0 0, 100% 0, 100% 100%, 24px 100%, 0 calc(100% - 24px))"
          >
            <div class="absolute inset-0 opacity-20" style="background-image: linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px); background-size: 20px 20px;"></div>
            <div class="relative z-10 flex flex-col h-full justify-between">
              <div class="flex justify-between items-start mb-12">
                <div class="text-5xl font-black text-white drop-shadow-sm">04</div>
                <div class="px-2 py-1 border border-cyan-500 text-cyan-600 text-[9px] font-mono uppercase tracking-widest bg-white/50 backdrop-blur-sm">Core</div>
              </div>
              <div class="flex flex-col md:flex-row gap-8 items-end justify-between">
                <div class="max-w-md">
                  <h3 class="text-2xl font-bold uppercase tracking-tight mb-3 text-slate-900">High-Density EPS Matrix</h3>
                  <p class="text-slate-600 text-sm leading-relaxed">
                    Multi-density impact absorption foam engineered to disperse kinetic energy across the entire shell structure upon impact.
                  </p>
                </div>
                <div class="w-32 h-32 border-2 border-cyan-500/30 rounded-full flex items-center justify-center relative group-hover:border-cyan-500 transition-colors duration-500">
                  <div class="w-24 h-24 border border-dashed border-cyan-500/50 rounded-full animate-[spin_10s_linear_infinite]"></div>
                  <div class="absolute text-[10px] font-mono text-cyan-600 font-bold">IMPACT</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import LoadingScreen from '@/components/LoadingScreen.vue';
import ModelShowcase from '@/components/ModelShowcase.vue';

const isLoading = ref(true);
const isScrolled = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.content-enter {
  animation: contentEnter 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}

@keyframes contentEnter {
  from { transform: scale(1.05); opacity: 0; filter: blur(8px); }
  to   { transform: scale(1);    opacity: 1; filter: blur(0px); }
}

.animate-fade-up {
  animation: fadeUp 0.8s cubic-bezier(0.25, 1, 0.5, 1) 0.4s both;
}

.animate-fade-in {
  animation: fadeIn 1s cubic-bezier(0.25, 1, 0.5, 1) 0.6s both;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(50px); }
  to   { opacity: 1; transform: translateX(0); }
}
</style>
