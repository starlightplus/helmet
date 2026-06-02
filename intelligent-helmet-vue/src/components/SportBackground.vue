<template>
  <div class="cyber-bg">
    <img src="/sky.jpg" class="bg-img" alt="" />
    <div class="bg-overlay"></div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.cyber-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
}

.bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  pointer-events: none;
}
</style>

<style>
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
