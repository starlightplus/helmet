<template>
  <div class="glass-effect">
    <slot></slot>
  </div>
</template>

<script setup>
// 毛玻璃效果组件，提供统一的玻璃态样式
</script>

<style scoped>
.glass-effect {
  background: rgba(10, 15, 44, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 247, 255, 0.3);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.glass-effect:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
  border-color: rgba(0, 247, 255, 0.6);
}
</style>