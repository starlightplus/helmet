<template>
  <div id="terminal-background">
    <div class="data-stream"></div>
    <div class="glow-orb orb-1"></div>
    <div class="glow-orb orb-2"></div>
    <div class="glow-orb orb-3"></div>
    <div class="data-node node-1"></div>
    <div class="data-node node-2"></div>
    <div class="data-node node-3"></div>
    <div class="data-node node-4"></div>
    <div class="data-connection connection-1"></div>
    <div class="data-connection connection-2"></div>
    <div class="data-connection connection-3"></div>
  </div>
</template>

<script setup>
// 不需要 JS，背景用纯 CSS 搞定
</script>

<style scoped>
#terminal-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  
  /* 深空背景 */
  background: 
    radial-gradient(circle at 15% 20%, rgba(10, 30, 80, 0.4) 0%, transparent 40%),
    radial-gradient(circle at 85% 80%, rgba(80, 10, 100, 0.4) 0%, transparent 40%),
    linear-gradient(135deg, #050515 0%, #0a0a2a 50%, #050515 100%);
  overflow: hidden;
}

/* 全息数据流效果 */
.data-stream {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 50px,
      rgba(0, 229, 255, 0.03) 50px,
      rgba(0, 229, 255, 0.03) 51px
    );
  animation: stream-flicker 8s infinite alternate;
}

/* 动态光晕效果 */
.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.4;
  animation: orb-float 20s infinite linear;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: rgba(0, 100, 255, 0.6);
  top: 10%;
  left: 10%;
  animation-duration: 25s;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: rgba(150, 0, 255, 0.5);
  top: 60%;
  left: 80%;
  animation-duration: 30s;
  animation-direction: reverse;
}

.orb-3 {
  width: 200px;
  height: 200px;
  background: rgba(0, 200, 255, 0.4);
  top: 80%;
  left: 20%;
  animation-duration: 35s;
}

/* 数据节点 */
.data-node {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00e5ff;
  box-shadow: 0 0 10px 2px rgba(0, 229, 255, 0.7);
  opacity: 0;
  animation: node-pulse 4s infinite;
}

.node-1 {
  top: 30%;
  left: 20%;
  animation-delay: 0s;
}

.node-2 {
  top: 60%;
  left: 70%;
  animation-delay: 1s;
}

.node-3 {
  top: 40%;
  left: 50%;
  animation-delay: 2s;
}

.node-4 {
  top: 70%;
  left: 40%;
  animation-delay: 3s;
}

/* 数据连接线 */
.data-connection {
  position: absolute;
  height: 1px;
  background: linear-gradient(90deg, transparent, #00e5ff, transparent);
  box-shadow: 0 0 5px rgba(0, 229, 255, 0.5);
  opacity: 0;
  animation: connection-flicker 6s infinite;
}

.connection-1 {
  top: 30%;
  left: 20%;
  width: 200px;
  transform: rotate(30deg);
}

.connection-2 {
  top: 60%;
  left: 50%;
  width: 150px;
  transform: rotate(-20deg);
  animation-delay: 2s;
}

.connection-3 {
  top: 40%;
  left: 60%;
  width: 250px;
  transform: rotate(10deg);
  animation-delay: 4s;
}

/* 动画定义 */
@keyframes stream-flicker {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
}

@keyframes orb-float {
  0% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(50px, 50px) rotate(90deg); }
  50% { transform: translate(0, 100px) rotate(180deg); }
  75% { transform: translate(-50px, 50px) rotate(270deg); }
  100% { transform: translate(0, 0) rotate(360deg); }
}

@keyframes node-pulse {
  0%, 100% { 
    opacity: 0; 
    transform: scale(0.5);
  }
  50% { 
    opacity: 1; 
    transform: scale(1.2);
  }
}

@keyframes connection-flicker {
  0%, 100% { opacity: 0; }
  25%, 75% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .glow-orb {
    filter: blur(40px);
  }
  
  .orb-1 {
    width: 200px;
    height: 200px;
  }
  
  .orb-2 {
    width: 150px;
    height: 150px;
  }
  
  .orb-3 {
    width: 100px;
    height: 100px;
  }
}
</style>