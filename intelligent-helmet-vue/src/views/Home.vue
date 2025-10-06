<template>
  <ParticlesBackground />
  <div class="home-container">
    <!-- 导航栏 -->
    <div class="navbar" data-aos="fade-down">
      <div class="logo">灵盔佑驰</div>
      <div class="nav-buttons">
        <GlassEffect class="nav-button-wrapper">
          <button class="login-btn" @click="goToApp">登录</button>
        </GlassEffect>
        <GlassEffect class="nav-button-wrapper">
          <button class="register-btn" @click="goToApp">注册</button>
        </GlassEffect>
      </div>
    </div>

    <!-- 顶部与内容之间的分隔线 -->
    <div class="content-divider"></div>

    <!-- 系统介绍模块 -->
    <GlassEffect class="intro-container" data-aos="fade-up" data-aos-delay="100">
      <div class="intro-header">
        <h2>灵盔佑驰 项目介绍</h2>
      </div>
      <div class="intro-content-wrapper">
        <div class="intro-content">
          <p>灵盔佑驰是一套专为外卖骑手量身打造的智能头盔系统</p>
          <p>它深度融合先进的物联网与人工智能技术，集成了高精度GPS定位、温湿度环境感知、MPU6050运动姿态检测以及智能语音交互模块，旨在为骑手的每一次出行构建全方位的智能守护</p>
          <p>系统能实时追踪骑手位置，精准识别左转、右转、减速等骑行意图，并能在发生意外摔倒时，第一时间触发紧急警报。</p>
          <p>灵盔佑驰不仅是保障骑手人身安全的坚实盾牌，更是提升配送效率、优化工作体验的智能终端。通过管理后台，运营方能实时掌握骑手状态与周边环境，实现更高效的调度与更及时的应急响应，为整个配送服务体系注入科技动能。</p>
        </div>
      </div>
    </GlassEffect>

    <!-- 传感器数据模块 -->
    <GlassEffect class="sensor-container" data-aos="fade-up" data-aos-delay="200">
      <div class="sensor-header">
        <h2>实时传感器数据</h2>
        <div class="divider"></div>
        <p>智能头盔内置多种传感器，实时监测环境与位置信息</p>
      </div>
      <div class="sensor-dashboard-wrapper">
        <SimpleSensorDashboard ref="sensorDashboard" />
      </div>
    </GlassEffect>

    <!-- 实时路径追踪模块 -->
    <GlassEffect class="sensor-container" data-aos="fade-up" data-aos-delay="700">
      <div class="sensor-header">
        <h2>实时路径追踪</h2>
        <div class="divider"></div>
        <p>智能头盔的GPS数据实时上传至管理终端</p>
        <p>管理员可随时查看佩戴者的实时位置与历史轨迹</p>
      </div>
      <BaiduMap ref="baiduMap" :mapHeight="400" />
    </GlassEffect>

    <!-- 设备事件监控模块 -->
    <GlassEffect class="sensor-container" data-aos="fade-up" data-aos-delay="800">
      <div class="sensor-header">
        <h2>设备事件监控</h2>
        <div class="divider"></div>
        <p>实时监控头盔检测到的骑行行为事件</p>
      </div>
      <EventPanel ref="eventPanel" />
    </GlassEffect>

    <footer class="page-footer">
      <h2>灵盔佑驰终端系统</h2>
      <p>© 2025 灵盔佑驰系统项目组 版权所有</p>
      <p>联系方式：2668379109@qq.com</p>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import ParticlesBackground from '@/components/ParticlesBackground.vue'
import GlassEffect from '@/components/GlassEffect.vue'
import SimpleSensorDashboard from '@/components/SimpleSensorDashboard.vue'
import BaiduMap from '@/components/BaiduMap.vue'
import EventPanel from '@/components/EventPanel.vue'

// 获取路由实例
const router = useRouter()
const sensorDashboard = ref(null)
const baiduMap = ref(null)
const eventPanel = ref(null)

// 页面跳转函数
function goToApp() {
  // 使用Vue Router跳转到App页面（数据采集界面）
  router.push('/app')
}

// 页面加载完成后初始化传感器数据和事件监控
onMounted(() => {
  startSensorDataCollection()
  startEventMonitoring() // 启动设备事件监控
  // 初始化路径点数据
  initPathPoints()
})

// 设备事件监控数据
let eventCounts = {
  slow: 0,
  leftTurn: 0,
  rightTurn: 0
}

// 路径点数据
const pathPoints = [
  { longitude: 119.290, latitude: 26.070 }, // 起点
  { longitude: 119.295, latitude: 26.072 },
  { longitude: 119.300, latitude: 26.070 }, // 折返点
  { longitude: 119.305, latitude: 26.074 },
  { longitude: 119.310, latitude: 26.072 }  // 终点
]

// 初始化路径点数据
function initPathPoints() {
  // 每2秒更新一次位置信息，循环显示5个路径点
  let currentIndex = 0
  setInterval(() => {
    if (baiduMap.value) {
      const point = pathPoints[currentIndex]
      const sensorData = {
        deviceId: 'DEV001',
        longitude: point.longitude,
        latitude: point.latitude,
        receiveTime: new Date().toISOString()
      }
      baiduMap.value.updateMapLocation(sensorData)
    }
    currentIndex = (currentIndex + 1) % pathPoints.length
  }, 2000)
}

// 开始传感器数据采集循环
function startSensorDataCollection() {
  updateSensorData()
  setInterval(updateSensorData, 2000)
}

// 更新传感器数据
function updateSensorData() {
  // 生成随机传感器数据
  const deviceId = 'DEV001'
  const timestamp = new Date().toISOString()
  
  const sensorData = {
    deviceId: deviceId,
    temperature: (20 + Math.random() * 15).toFixed(1), // 20-35°C
    humidity: (40 + Math.random() * 40).toFixed(1), // 40-80%
    longitude: (119.29 + Math.random() * 0.02).toFixed(6), // 119.29-119.31
    latitude: (26.07 + Math.random() * 0.02).toFixed(6), // 26.07-26.09
    receiveTime: timestamp
  }
  
  // 更新传感器仪表板
  if (sensorDashboard.value) {
    sensorDashboard.value.updateSensorData([sensorData])
  }
}

// 模拟设备事件数据
function simulateEventUpdates() {
  // 随机生成事件数据
  const deviceId = 'DEV001'
  const timestamp = new Date().toISOString()
  
  const eventData = {
    deviceId: deviceId,
    slowFlag: Math.random() > 0.5,   // 减速事件
    turnLeftFlag: Math.random() > 0.6,  // 左转事件
    turnRightFlag: Math.random() > 0.6  // 右转事件
  }
  
  // 更新事件面板
  if (eventPanel.value) {
    eventPanel.value.processDeviceEvents(eventData)
  }
}

// 启动设备事件监控
function startEventMonitoring() {
  simulateEventUpdates()
  setInterval(simulateEventUpdates, 3000)
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* 导航栏样式 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background-color: transparent;
  z-index: 1001;
  position: relative;
}

.logo {
  font-size: 2.5em;
  font-weight: bold;
  color: #00f7ff;
  text-shadow: 0 0 10px rgba(0, 247, 255, 0.6);
}

.nav-buttons {
  display: flex;
  gap: 15px;
}

.nav-button-wrapper {
  border-radius: 30px;
  padding: 0;
}

.nav-buttons button {
  margin: 0;
  padding: 15px 30px;
  font-size: 1.2em;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  border: none;
  background: transparent;
  color: #00f7ff;
  width: 100%;
  height: 100%;
  border-radius: 30px;
}

.nav-buttons button:hover {
  background: rgba(0, 247, 255, 0.1);
  transform: scale(1.05);
}

/* 顶部与内容之间的分隔线 */
.content-divider {
  width: 90%;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(0, 247, 255, 0.3), transparent);
  margin: 20px auto;
}

/* 分隔线样式 */
.divider {
  width: 100%;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(0, 247, 255, 0.6), transparent);
  margin: 20px 0;
}

/* 系统介绍模块样式 */
.intro-container {
  display: flex;
  flex-direction: column;
  margin: 40px auto;
  max-width: 1200px;
  width: 100%;
  border-radius: 20px;
  overflow: hidden;
  padding: 60px 40px;
  text-align: center;
  z-index: 1001;
  position: relative;
  color: #e0e0e0;
}

.intro-header h2 {
  font-size: 2.5em;
  font-weight: bold;
  margin-bottom: 20px;
  color: #00f7ff;
}

.intro-content-wrapper {
  border: 1px solid rgba(0, 247, 255, 0.3);
  border-radius: 15px;
  padding: 25px;
  background: rgba(10, 15, 44, 0.2);
  margin-top: 30px;
}

.intro-content {
  font-size: 1.2em;
  line-height: 1.8;
  max-width: 1000px;
  margin: 0 auto;
}

.intro-content p {
  margin-bottom: 15px;
}

/* 传感器数据模块样式 */
.sensor-container {
  display: flex;
  flex-direction: column;
  margin: 40px auto;
  max-width: 1200px;
  width: 100%;
  border-radius: 20px;
  overflow: hidden;
  z-index: 1001;
  position: relative;
  padding: 40px;
  text-align: center;
  color: #e0e0e0;
}

.sensor-header h2 {
  font-size: 2em;
  font-weight: bold;
  margin-bottom: 10px;
  color: #00f7ff;
}

.sensor-header p {
  color: rgba(224, 224, 224, 0.8);
  font-size: 1.2em;
  margin-bottom: 30px;
}

.sensor-dashboard-wrapper {
  width: 100%;
}

#map {
  width: 100%;
  height: 400px;
  border-radius: 10px;
  z-index: 1001;
  position: relative;
  background-color: rgba(20, 30, 60, 0.8);
  border: 1px solid rgba(0, 247, 255, 0.3);
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);
}

/* 页脚样式 */
.page-footer {
  color: #00f7ff;
  font-size: 14px;
  text-align: center;
  padding: 30px 20px;
  position: relative;
  margin-top: auto;
}

.page-footer h2 {
  font-size: 1.5em;
  margin-bottom: 15px;
  text-shadow: 0 0 10px rgba(0, 247, 255, 0.6);
}

.page-footer p {
  color: rgba(224, 224, 224, 0.8);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar {
    padding: 15px 20px;
  }
  
  .nav-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .nav-buttons button {
    padding: 12px 25px;
    font-size: 1.1em;
  }
  
  .intro-container,
  .sensor-container {
    margin: 20px auto;
    padding: 30px 20px;
  }
  
  .intro-header h2 {
    font-size: 1.8em;
  }
  
  .intro-content {
    font-size: 1em;
  }
  
  .sensor-header h2 {
    font-size: 1.5em;
  }
  
  .sensor-header p {
    font-size: 1em;
  }
  
  .sensor-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  #map {
    height: 300px;
  }
  
  .page-footer {
    font-size: 12px;
    padding: 20px 15px;
  }
  
  .page-footer h2 {
    font-size: 1.2em;
  }
}
</style>