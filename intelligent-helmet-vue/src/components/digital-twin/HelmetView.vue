<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const webglContainer = ref<HTMLElement | null>(null);
const loading = ref(true);
const scanState = ref(0);
const statusHTML = ref('目前展示状态：<span style="color:var(--holo-color)">全息数据蓝图</span>。<br><br>点击下方指令，启动高转速离心解析仪，重组高精度物理装甲。');
const btnText = ref('DECODE // 离心实体解析');
const btnDisabled = ref(false);

// 模拟经纬度和轨迹
const locationData = ref({
  lat: '31.2304° N',
  lng: '121.4737° E',
  alt: '42.5m',
  speed: '24.5 km/h',
  status: 'ACTIVE',
  signal: 'STRONG'
});

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let modelGroup: THREE.Group;
let scannerPlaneMesh: THREE.Mesh;
let solidPlane: THREE.Plane;
let holoPlane: THREE.Plane;
let animationId: number;

const scanMax = 2.8;
const scanMin = -2.8;
let scanY = 2.8;
let scanSpeed = 0;
let currentSpinSpeed = 0.005;
let targetSpinSpeed = 0.005;
const accelFactor = 0.03;
const clock = new THREE.Clock();

function createSciFiScannerUI() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);
  const center = 256;

  const grad = ctx.createRadialGradient(center, center, 100, center, center, 250);
  grad.addColorStop(0, 'rgba(247, 210, 56, 0.0)');
  grad.addColorStop(0.8, 'rgba(247, 210, 56, 0.6)');
  grad.addColorStop(1, 'rgba(247, 210, 56, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = '#f7d238';
  ctx.lineWidth = 2;
  
  ctx.beginPath(); ctx.arc(center, center, 240, 0, Math.PI * 2); ctx.stroke();
  
  ctx.setLineDash([8, 12]);
  ctx.beginPath(); ctx.arc(center, center, 200, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
  
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(center, 0); ctx.lineTo(center, 40); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(center, 472); ctx.lineTo(center, 512); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, center); ctx.lineTo(40, center); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(472, center); ctx.lineTo(512, center); ctx.stroke();

  return new THREE.CanvasTexture(canvas);
}

const initThreeJS = () => {
  if (!webglContainer.value) return;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 9);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.localClippingEnabled = true;
  webglContainer.value.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate = false;
  controls.enablePan = false;
  controls.minDistance = 4;
  controls.maxDistance = 12;

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const mainLight = new THREE.DirectionalLight(0xffffff, 2);
  mainLight.position.set(5, 10, 7);
  scene.add(mainLight);
  const backLight = new THREE.DirectionalLight(0xf7d238, 3);
  backLight.position.set(-5, -2, -5);
  scene.add(backLight);

  modelGroup = new THREE.Group();
  scene.add(modelGroup);

  solidPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -3);
  holoPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 3);

  const scannerGeo = new THREE.PlaneGeometry(8, 8);
  const scannerMat = new THREE.MeshBasicMaterial({ 
      map: createSciFiScannerUI(), 
      color: 0xffffff,
      transparent: true, 
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
  });
  
  scannerPlaneMesh = new THREE.Mesh(scannerGeo, scannerMat);
  scannerPlaneMesh.rotation.x = -Math.PI / 2;
  scannerPlaneMesh.visible = false;
  scene.add(scannerPlaneMesh);

  // 使用 GLTFLoader 加载真实的头盔模型
  const loader = new GLTFLoader();
  loader.load(
    '/models/envoy.glb',
    (gltf) => {
      const originalModel = gltf.scene;
      const box = new THREE.Box3().setFromObject(originalModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const scale = 5 / Math.max(size.x, size.y, size.z);
      originalModel.scale.set(scale, scale, scale);
      originalModel.position.sub(center.multiplyScalar(scale));

      const solidModel = originalModel;
      const holoModel = originalModel.clone();

      solidModel.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.material = (mesh.material as THREE.Material).clone();
          mesh.material.clippingPlanes = [solidPlane];
        }
      });

      holoModel.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.material = new THREE.MeshBasicMaterial({
            color: 0x00e5ff, wireframe: true, transparent: true, opacity: 0.25, clippingPlanes:[holoPlane]
          });
        }
      });

      modelGroup.add(solidModel);
      modelGroup.add(holoModel);

      setTimeout(() => {
        loading.value = false;
      }, 800);
    },
    undefined,
    (error) => {
      console.error('模型加载失败:', error);
      loading.value = false;
    }
  );

  animate();
};

const animate = () => {
  animationId = requestAnimationFrame(animate);
  const time = clock.getElapsedTime();

  if (modelGroup) {
      modelGroup.position.y = Math.sin(time * 1.5) * 0.1;
      currentSpinSpeed += (targetSpinSpeed - currentSpinSpeed) * accelFactor;
      modelGroup.rotation.y += currentSpinSpeed;
  }

  const currentWorldY = scanY + (modelGroup ? modelGroup.position.y : 0);
  if (solidPlane && holoPlane && scannerPlaneMesh) {
    solidPlane.constant = -currentWorldY;
    holoPlane.constant = currentWorldY;
    scannerPlaneMesh.position.y = currentWorldY; 

    if (scannerPlaneMesh.visible) {
        scannerPlaneMesh.rotation.z -= 0.02;
    }
  }

  if (scanState.value === 1) { 
      scanY -= scanSpeed;
      if (scanY <= scanMin) {
          scanY = scanMin;
          scanState.value = 2; 
          scannerPlaneMesh.visible = false;
          targetSpinSpeed = 0.002; 
          btnText.value = "ENCODE // 逆向全息剥离"; 
          btnDisabled.value = false;
          statusHTML.value = '目前展示状态：<span style="color:var(--theme-color)">高精度物理实体</span>。<br><br>解析完成，装配就绪。';
      }
  } else if (scanState.value === 3) { 
      scanY += scanSpeed;
      if (scanY >= scanMax) {
          scanY = scanMax;
          scanState.value = 0; 
          scannerPlaneMesh.visible = false;
          targetSpinSpeed = 0.005; 
          btnText.value = "DECODE // 离心实体解析";
          btnDisabled.value = false;
          statusHTML.value = '目前展示状态：<span style="color:var(--holo-color)">全息数据蓝图</span>。<br><br>点击下方指令，启动高转速离心解析仪，重组高精度物理装甲。';
      }
  }

  if (scanState.value === 0 && modelGroup && modelGroup.children[1]) {
      modelGroup.children[1].traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              (mesh.material as THREE.Material).opacity = 0.15 + Math.abs(Math.sin(time * 3)) * 0.15;
          }
      });
  }

  if (controls) controls.update();
  if (renderer && scene && camera) renderer.render(scene, camera);
};

const handleAction = () => {
  if (scanState.value === 0) {
      scanState.value = 1;
      if (scannerPlaneMesh) scannerPlaneMesh.visible = true;
      targetSpinSpeed = 0.6; 
      scanSpeed = 0.06; 
      btnText.value = "WARNING // 高速离心解析中";
      btnDisabled.value = true;
  } else if (scanState.value === 2) {
      scanState.value = 3;
      if (scannerPlaneMesh) scannerPlaneMesh.visible = true;
      targetSpinSpeed = -0.5; 
      scanSpeed = 0.06;
      btnText.value = "WARNING // 数据逆向剥离中";
      btnDisabled.value = true;
  }
};

const handleResize = () => {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
};

onMounted(() => {
  initThreeJS();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (animationId) cancelAnimationFrame(animationId);
  if (renderer) {
    renderer.dispose();
    webglContainer.value?.removeChild(renderer.domElement);
  }
});
</script>

<template>
  <div class="endfield-app">
    <div v-if="loading" id="loading-screen">
        <div class="loading-text">CONNECTING PROTOCOL...</div>
        <div class="progress-box"><div id="progress-bar"></div></div>
    </div>

    <div class="bg-grid"></div>
    <div ref="webglContainer" id="webgl-container"></div>

    <div id="ui-layer">
        <!-- Left Panel: Model Control -->
        <div class="info-panel left-panel">
            <div class="sys-tag">CLASSIFIED // LEVEL 4</div>
            <h1>ENVOY SYSTEM</h1>
            <p v-html="statusHTML"></p>
            <button 
              class="scan-btn" 
              :class="{ 'is-scanning': btnDisabled }"
              @click="handleAction"
              :disabled="btnDisabled"
            >
              {{ btnText }}
            </button>
        </div>

        <!-- Right Panel: Telemetry & Location -->
        <div class="info-panel right-panel">
            <div class="sys-tag">TELEMETRY // LIVE DATA</div>
            <h1>LOCATOR</h1>
            
            <div class="data-grid">
              <div class="data-item">
                <div class="data-label">LATITUDE</div>
                <div class="data-value">{{ locationData.lat }}</div>
              </div>
              <div class="data-item">
                <div class="data-label">LONGITUDE</div>
                <div class="data-value">{{ locationData.lng }}</div>
              </div>
              <div class="data-item">
                <div class="data-label">ALTITUDE</div>
                <div class="data-value">{{ locationData.alt }}</div>
              </div>
              <div class="data-item">
                <div class="data-label">SPEED</div>
                <div class="data-value">{{ locationData.speed }}</div>
              </div>
            </div>

            <div class="map-container">
              <div class="map-grid"></div>
              <div class="map-path">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M10,90 L30,70 L40,80 L70,30 L90,40" fill="none" stroke="var(--theme-color)" stroke-width="2" />
                  <circle cx="90" cy="40" r="3" fill="var(--theme-color)" />
                  <circle cx="90" cy="40" r="6" fill="none" stroke="var(--theme-color)" class="pulse-circle" />
                </svg>
              </div>
              <div class="map-overlay-text">TRACKING ACTIVE</div>
            </div>

            <div class="status-row">
              <div class="status-indicator">
                <span class="dot"></span> {{ locationData.status }}
              </div>
              <div class="signal-strength">
                SIGNAL: <span style="color: var(--theme-color)">{{ locationData.signal }}</span>
              </div>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Space+Grotesk:wght@400;700&display=swap');

.endfield-app {
  width: 100vw;
  height: 100vh;
  position: relative;
  background-color: #0f0f11;
  font-family: 'Space Grotesk', sans-serif;
  overflow: hidden;
  color: #e2e2e2;
  --theme-color: #f7d238; 
  --holo-color: #00e5ff;
  --bg-dark: #0f0f11;
  --panel-bg: rgba(20, 20, 23, 0.85);
  --font-mono: 'JetBrains Mono', monospace;
}

.bg-grid { 
  position: absolute; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%; 
  background-image: linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px); 
  background-size: 40px 40px; 
  z-index: 0; 
}

#webgl-container { 
  position: absolute; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%; 
  z-index: 1; 
}

#ui-layer { 
  position: absolute; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%; 
  z-index: 10; 
  pointer-events: none; 
  display: flex; 
  justify-content: space-between; 
  padding: 50px; 
  box-sizing: border-box; 
}

.info-panel { 
  width: 380px; 
  background: var(--panel-bg); 
  backdrop-filter: blur(12px); 
  border-left: 4px solid var(--theme-color); 
  padding: 35px; 
  pointer-events: auto; 
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%); 
  align-self: flex-start; 
  box-shadow: 15px 15px 40px rgba(0,0,0,0.6); 
  opacity: 0; 
}

.left-panel {
  transform: translateX(-50px); 
  animation: slideInLeft 0.8s cubic-bezier(0.1, 0.9, 0.2, 1) 0.5s forwards; 
}

.right-panel {
  transform: translateX(50px); 
  animation: slideInRight 0.8s cubic-bezier(0.1, 0.9, 0.2, 1) 0.7s forwards; 
}

.sys-tag { 
  color: var(--theme-color); 
  font-size: 13px; 
  letter-spacing: 3px; 
  margin-bottom: 12px; 
  font-weight: bold; 
  font-family: var(--font-mono);
}

h1 { 
  margin: 0 0 15px 0; 
  font-size: 36px; 
  text-transform: uppercase; 
  border-bottom: 1px solid rgba(255,255,255,0.1); 
  padding-bottom: 15px; 
  letter-spacing: 2px;
}

p { 
  font-size: 14px; 
  line-height: 1.7; 
  color: #bbb; 
  margin-bottom: 30px; 
}

.scan-btn { 
  background-color: transparent; 
  color: var(--theme-color); 
  border: 1px solid var(--theme-color); 
  padding: 12px 24px; 
  font-size: 14px; 
  letter-spacing: 2px; 
  font-weight: bold; 
  cursor: pointer; 
  width: 100%; 
  text-align: left; 
  position: relative; 
  overflow: hidden; 
  transition: all 0.3s ease; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  font-family: var(--font-mono);
}

.scan-btn::before { 
  content: ''; 
  position: absolute; 
  top: 0; 
  left: -100%; 
  width: 100%; 
  height: 100%; 
  background-color: var(--theme-color); 
  transition: all 0.4s ease; 
  z-index: -1; 
}

.scan-btn:not(:disabled):hover { 
  color: #000; 
  box-shadow: 0 0 15px var(--theme-color); 
}

.scan-btn:not(:disabled):hover::before { 
  left: 0; 
}

.scan-btn::after { 
  content: '>'; 
  font-family: monospace; 
}

.scan-btn.is-scanning {
  color: #ff3333 !important;
  border-color: #ff3333 !important;
  cursor: not-allowed;
}
.scan-btn.is-scanning::before {
  background-color: rgba(255, 51, 51, 0.1);
  left: 0;
  animation: pulseBg 1s infinite;
}

/* Telemetry Data Styles */
.data-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 25px;
}

.data-item {
  background: rgba(255, 255, 255, 0.03);
  padding: 10px;
  border-left: 2px solid rgba(255, 255, 255, 0.2);
}

.data-label {
  font-size: 10px;
  color: #888;
  letter-spacing: 1px;
  margin-bottom: 5px;
  font-family: var(--font-mono);
}

.data-value {
  font-size: 16px;
  color: #fff;
  font-family: var(--font-mono);
  font-weight: bold;
}

.map-container {
  height: 150px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  margin-bottom: 20px;
  overflow: hidden;
}

.map-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(rgba(0, 229, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

.map-path {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.map-path svg {
  width: 100%;
  height: 100%;
}

.pulse-circle {
  animation: pulseCircle 2s infinite;
  transform-origin: 90px 40px;
}

.map-overlay-text {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--theme-color);
  letter-spacing: 1px;
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-mono);
  font-size: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 15px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
}

.dot {
  width: 8px;
  height: 8px;
  background-color: #00ff00;
  border-radius: 50%;
  box-shadow: 0 0 8px #00ff00;
  animation: blink 1s infinite alternate;
}

#loading-screen { 
  position: absolute; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%; 
  background-color: var(--bg-dark); 
  z-index: 999; 
  display: flex; 
  flex-direction: column; 
  justify-content: center; 
  align-items: center; 
  color: var(--theme-color); 
  font-family: var(--font-mono); 
  transition: opacity 0.5s ease; 
}

.loading-text { 
  font-size: 20px; 
  letter-spacing: 4px; 
  margin-bottom: 20px; 
  animation: blink 1s infinite alternate; 
}

.progress-box { 
  width: 300px; 
  height: 1px; 
  background: rgba(255,255,255,0.2); 
  position: relative; 
}

#progress-bar { 
  position: absolute; 
  top: 0; 
  left: 0; 
  height: 100%; 
  width: 100%; 
  background: var(--theme-color); 
  box-shadow: 0 0 10px var(--theme-color); 
  animation: loadProgress 0.8s ease-out forwards;
}

@keyframes blink { 
  0% { opacity: 0.4; } 
  100% { opacity: 1; } 
}

@keyframes slideInLeft { 
  to { transform: translateX(0); opacity: 1; } 
}

@keyframes slideInRight { 
  to { transform: translateX(0); opacity: 1; } 
}

@keyframes loadProgress {
  0% { width: 0%; }
  100% { width: 100%; }
}

@keyframes pulseBg {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}

@keyframes pulseCircle {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(3); opacity: 0; }
}
</style>