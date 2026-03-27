<template>
  <router-view v-slot="{ Component }">
    <keep-alive include="AppMain">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>

<script setup>
// 根应用组件
</script>

<style>
/* 全局样式 - 科技霓虹风 */
body {
  font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #E0F2FE;
  background-color: #0a0e1a;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
}

* {
  box-sizing: border-box;
}

a {
  color: #00D9FF;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
  text-shadow: 0 0 8px rgba(0, 217, 255, 0.6);
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 217, 255, 0.05);
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 217, 255, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 217, 255, 0.5);
  box-shadow: 0 0 8px rgba(0, 217, 255, 0.4);
}
</style>
