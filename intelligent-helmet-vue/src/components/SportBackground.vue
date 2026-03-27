<template>
  <div class="tech-bg">
    <div class="tech-bg__grid"></div>
    <div class="tech-bg__glow tech-bg__glow--1"></div>
    <div class="tech-bg__glow tech-bg__glow--2"></div>
    <div class="tech-bg__glow tech-bg__glow--3"></div>
  </div>
</template>

<style scoped>
.tech-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
  background: #0a0e1a;
}

/* 网格背景 */
.tech-bg__grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(0, 217, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 217, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
  animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

/* 霓虹发光效果 */
.tech-bg__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  animation: float 8s ease-in-out infinite;
}

.tech-bg__glow--1 {
  top: 10%;
  right: 15%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(0, 217, 255, 0.15) 0%, transparent 70%);
  animation-delay: 0s;
}

.tech-bg__glow--2 {
  bottom: 20%;
  left: 10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%);
  animation-delay: 2s;
}

.tech-bg__glow--3 {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, transparent 70%);
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  33% { transform: translate(30px, -30px); }
  66% { transform: translate(-30px, 30px); }
}
</style>
