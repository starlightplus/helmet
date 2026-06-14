<template>
  <div class="header" data-aos="fade-down">
    <div class="header__logo">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 2v10l6.5-3"/></svg>
      <h1>{{ title }}</h1>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ title: { type: String, default: '灵盔佑驰终端' } })
</script>

<style scoped>
.header {
  padding: 16px 0;
  margin-bottom: 8px;
}

.header__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}

.header__logo h1 {
  font-size: clamp(1.4rem, 4vw, 2rem);
  color: #E8ECF1;
  margin: 0;
  font-weight: 700;
  letter-spacing: 1px;
}
</style>
