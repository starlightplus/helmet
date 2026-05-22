<template>
  <div class="cyber-bg scanline-overlay">
    <div class="cyber-grid"></div>
    <div class="cyber-grid-fine"></div>
    <div class="cyber-glow cyber-glow--1"></div>
    <div class="cyber-glow cyber-glow--2"></div>
  </div>
</template>

<style scoped>
.cyber-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  background: #050505;
  overflow: hidden;
}

.cyber-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right,  rgba(0,243,255,0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0,243,255,0.04) 1px, transparent 1px);
  background-size: 40px 40px;
}

.cyber-grid-fine {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right,  rgba(0,243,255,0.02) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0,243,255,0.02) 1px, transparent 1px);
  background-size: 10px 10px;
}

.cyber-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  pointer-events: none;
  animation: float 12s ease-in-out infinite;
}

.cyber-glow--1 {
  top: 0; right: 10%;
  width: 500px; height: 400px;
  background: radial-gradient(circle, rgba(0,243,255,0.07) 0%, transparent 70%);
}

.cyber-glow--2 {
  bottom: 5%; left: 5%;
  width: 400px; height: 350px;
  background: radial-gradient(circle, rgba(0,255,102,0.05) 0%, transparent 70%);
  animation-delay: 5s;
}

@keyframes float {
  0%,100% { transform: translate(0,0); }
  50%      { transform: translate(15px,-20px); }
}
</style>

<style>
/* CRT 扫描线 — 全局覆盖层 */
.scanline-overlay::before {
  content: " ";
  display: block;
  position: fixed;
  inset: 0;
  background:
    linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.22) 50%),
    linear-gradient(90deg, rgba(255,0,0,0.025), rgba(0,255,0,0.008), rgba(0,0,255,0.025));
  background-size: 100% 2px, 3px 100%;
  z-index: 9998;
  pointer-events: none;
}

/* 全局 cyber 变量 */
:root {
  --cyber-cyan:  #00F3FF;
  --cyber-green: #00FF66;
  --cyber-amber: #FFAA00;
  --cyber-red:   #EF4444;
  --cyber-black: #050505;
  --cyber-dark:  #0a0a0a;
  --cyber-gray:  #1a1a1a;
  --font-mono: "JetBrains Mono", "Fira Code", "Courier New", monospace;
}

body {
  font-family: "Inter", system-ui, sans-serif;
  background: #050505;
  color: #e2e8f0;
  margin: 0; padding: 0;
  overflow-x: hidden;
}
</style>
