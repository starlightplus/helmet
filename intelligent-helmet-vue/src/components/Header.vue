<template>
  <div class="header" data-aos="fade-down">
    <h1>{{ title }}</h1>
  </div>
</template>

<script setup>
const props = defineProps({ title: { type: String, default: '灵盔佑驰终端' } })
</script>

<style scoped>
.header h1 {
  font-size: clamp(1.8rem, 5vw, 3.5rem);
  color: #00f7ff;
  text-shadow: 0 0 15px rgba(0, 247, 255, 0.6);
  margin: 0;
  text-align: center;
  padding: 20px 0;
}
</style>