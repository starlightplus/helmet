import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default function ModelShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [scanState, setScanState] = useState(0);
  const [btnText, setBtnText] = useState('DECODE // 离心实体解析');
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [statusHTML, setStatusHTML] = useState(
    '目前展示状态：<span class="text-cyan-400 font-bold">全息数据蓝图</span>。<br><br>点击下方指令，启动高转速离心解析仪，重组高精度物理装甲。'
  );

  const locationData = { lat: '31.2304° N', lng: '121.4737° E', alt: '42.5m', speed: '24.5 km/h', status: 'ACTIVE', signal: 'STRONG' };

  const threeState = useRef({ scanY: 2.8, scanSpeed: 0, currentSpinSpeed: 0.005, targetSpinSpeed: 0.005, scanStateVal: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    let animationId: number;
    const clock = new THREE.Clock();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.localClippingEnabled = true;
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = false;

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const mainLight = new THREE.DirectionalLight(0xffffff, 2);
    mainLight.position.set(5, 10, 7);
    scene.add(mainLight);
    const backLight = new THREE.DirectionalLight(0x06b6d4, 3);
    backLight.position.set(-5, -2, -5);
    scene.add(backLight);

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    const solidPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -3);
    const holoPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 3);

    const createScannerUI = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512; canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);
      const center = 256;
      const grad = ctx.createRadialGradient(center, center, 100, center, center, 250);
      grad.addColorStop(0, 'rgba(6, 182, 212, 0.0)');
      grad.addColorStop(0.8, 'rgba(6, 182, 212, 0.6)');
      grad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(center, center, 240, 0, Math.PI * 2); ctx.stroke();
      return new THREE.CanvasTexture(canvas);
    };

    const scannerMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.MeshBasicMaterial({ map: createScannerUI(), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false })
    );
    scannerMesh.rotation.x = -Math.PI / 2;
    scannerMesh.visible = false;
    scene.add(scannerMesh);

    const createFallbackModel = () => {
      const group = new THREE.Group();
      const dome = new THREE.Mesh(new THREE.SphereGeometry(2.2, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.8), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.1 }));
      const visor = new THREE.Mesh(new THREE.CylinderGeometry(2.25, 2.25, 1.2, 32, 1, false, -Math.PI/2.5, Math.PI/1.25), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 }));
      visor.rotation.x = Math.PI / 12; visor.position.set(0, -0.4, 0.1);
      group.add(dome, visor);
      return group;
    };

    const processModel = (originalModel: THREE.Object3D) => {
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
          mesh.material = new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true, transparent: true, opacity: 0.25, clippingPlanes:[holoPlane] });
        }
      });

      modelGroup.add(solidModel, holoModel);
      setTimeout(() => setLoading(false), 800);
    };

    new GLTFLoader().load('/models/envoy.glb', (gltf) => processModel(gltf.scene), undefined, () => processModel(createFallbackModel()));

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const state = threeState.current;

      if (modelGroup) {
          modelGroup.position.y = Math.sin(time * 1.5) * 0.1;
          state.currentSpinSpeed += (state.targetSpinSpeed - state.currentSpinSpeed) * 0.03;
          modelGroup.rotation.y += state.currentSpinSpeed;
      }

      const currentWorldY = state.scanY + (modelGroup ? modelGroup.position.y : 0);
      solidPlane.constant = -currentWorldY; holoPlane.constant = currentWorldY;
      scannerMesh.position.y = currentWorldY;
      if (scannerMesh.visible) scannerMesh.rotation.z -= 0.02;

      if (state.scanStateVal === 1) { 
          state.scanY -= state.scanSpeed;
          if (state.scanY <= -2.8) {
              state.scanY = -2.8; state.scanStateVal = 2; setScanState(2); scannerMesh.visible = false; state.targetSpinSpeed = 0.002; 
              setBtnText("ENCODE // 逆向全息剥离"); setBtnDisabled(false);
              setStatusHTML('目前展示状态：<span class="text-slate-100 font-bold">高精度物理实体</span>。<br><br>解析完成，装配就绪。');
          }
      } else if (state.scanStateVal === 3) { 
          state.scanY += state.scanSpeed;
          if (state.scanY >= 2.8) {
              state.scanY = 2.8; state.scanStateVal = 0; setScanState(0); scannerMesh.visible = false; state.targetSpinSpeed = 0.005; 
              setBtnText("DECODE // 离心实体解析"); setBtnDisabled(false);
              setStatusHTML('目前展示状态：<span class="text-cyan-400 font-bold">全息数据蓝图</span>。<br><br>点击下方指令，启动高转速离心解析仪，重组高精度物理装甲。');
          }
      }

      if (state.scanStateVal === 0 && modelGroup.children[1]) {
          modelGroup.children[1].traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                  const mesh = child as THREE.Mesh;
                  if (!Array.isArray(mesh.material)) {
                      mesh.material.opacity = 0.15 + Math.abs(Math.sin(time * 3)) * 0.15;
                  }
              }
          });
      }

      controls.update(); renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); cancelAnimationFrame(animationId); renderer.dispose(); };
  }, []);

  const handleAction = () => {
    const state = threeState.current;
    if (state.scanStateVal === 0) {
        state.scanStateVal = 1; setScanState(1); state.targetSpinSpeed = 0.6; state.scanSpeed = 0.06; 
        setBtnText("WARNING // 高速离心解析中"); setBtnDisabled(true);
    } else if (state.scanStateVal === 2) {
        state.scanStateVal = 3; setScanState(3); state.targetSpinSpeed = -0.5; state.scanSpeed = 0.06;
        setBtnText("WARNING // 数据逆向剥离中"); setBtnDisabled(true);
    }
  };

  return (
    <section id="3d-showcase" className="relative w-full h-[800px] bg-slate-900 text-slate-200 font-sans overflow-hidden border-y border-slate-800">
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 transition-opacity duration-500">
          <div className="text-cyan-400 font-mono text-xl tracking-[0.2em] mb-4 animate-pulse">CONNECTING PROTOCOL...</div>
          <div className="w-64 h-[1px] bg-slate-700 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-cyan-400 w-full animate-[loadProgress_0.8s_ease-out_forwards]" />
          </div>
        </div>
      )}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div ref={containerRef} className="absolute inset-0 z-10 cursor-move" />
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col md:flex-row justify-between p-6 md:p-12">
        <div className="w-full md:w-[380px] bg-slate-900/80 backdrop-blur-md border-l-4 border-cyan-500 p-8 pointer-events-auto self-start shadow-2xl animate-[slideInLeft_0.8s_cubic-bezier(0.1,0.9,0.2,1)_0.5s_forwards] opacity-0 translate-x-[-50px]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%)' }}>
          <div className="text-cyan-500 text-xs tracking-[0.2em] font-bold font-mono mb-3">CLASSIFIED // LEVEL 4</div>
          <h2 className="text-3xl font-black uppercase tracking-wider border-b border-slate-700 pb-4 mb-6 text-white">ENVOY SYSTEM</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-8" dangerouslySetInnerHTML={{ __html: statusHTML }}></p>
          <button className={`w-full relative overflow-hidden border border-cyan-500 px-6 py-3 text-sm font-bold tracking-widest font-mono text-left transition-all duration-300 flex justify-between items-center group ${btnDisabled ? 'text-red-500 border-red-500 cursor-not-allowed' : 'text-cyan-400 hover:text-slate-900 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)]'}`} onClick={handleAction} disabled={btnDisabled}>
            <span className="relative z-10">{btnText}</span><span className="relative z-10 font-mono">&gt;</span>
            {!btnDisabled && <div className="absolute inset-0 bg-cyan-500 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out z-0" />}
            {btnDisabled && <div className="absolute inset-0 bg-red-500/10 animate-pulse z-0" />}
          </button>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-[380px] bg-slate-900/80 backdrop-blur-md border-r-4 border-cyan-500 p-8 pointer-events-auto self-end md:self-start shadow-2xl animate-[slideInRight_0.8s_cubic-bezier(0.1,0.9,0.2,1)_0.7s_forwards] opacity-0 translate-x-[50px] mt-6 md:mt-0" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 30px 100%, 0 calc(100% - 30px))' }}>
          <div className="text-cyan-500 text-xs tracking-[0.2em] font-bold font-mono mb-3 text-right">TELEMETRY // LIVE DATA</div>
          <h2 className="text-3xl font-black uppercase tracking-wider border-b border-slate-700 pb-4 mb-6 text-white text-right">LOCATOR</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 p-3 border-l-2 border-white/20">
              <div className="text-[10px] text-slate-500 tracking-wider font-mono mb-1">LATITUDE</div>
              <div className="text-sm text-white font-bold font-mono">{locationData.lat}</div>
            </div>
            <div className="bg-white/5 p-3 border-l-2 border-white/20">
              <div className="text-[10px] text-slate-500 tracking-wider font-mono mb-1">LONGITUDE</div>
              <div className="text-sm text-white font-bold font-mono">{locationData.lng}</div>
            </div>
            <div className="bg-white/5 p-3 border-l-2 border-white/20">
              <div className="text-[10px] text-slate-500 tracking-wider font-mono mb-1">ALTITUDE</div>
              <div className="text-sm text-white font-bold font-mono">{locationData.alt}</div>
            </div>
            <div className="bg-white/5 p-3 border-l-2 border-white/20">
              <div className="text-[10px] text-slate-500 tracking-wider font-mono mb-1">SPEED</div>
              <div className="text-sm text-white font-bold font-mono">{locationData.speed}</div>
            </div>
          </div>

          <div className="h-32 bg-black/50 border border-white/10 relative overflow-hidden mb-5">
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(6,182,212,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.2) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
              <path d="M10,90 L30,70 L40,80 L70,30 L90,40" fill="none" stroke="#06b6d4" strokeWidth="2" />
              <circle cx="90" cy="40" r="3" fill="#06b6d4" />
              <circle cx="90" cy="40" r="6" fill="none" stroke="#06b6d4" className="animate-[pulseCircle_2s_infinite] origin-[90px_40px]" />
            </svg>
            <div className="absolute bottom-2 right-2 font-mono text-[9px] text-cyan-500 tracking-widest">TRACKING ACTIVE</div>
          </div>

          <div className="flex justify-between items-center font-mono text-xs border-t border-white/10 pt-4">
            <div className="flex items-center gap-2 text-white">
              <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e] animate-pulse" /> {locationData.status}
            </div>
            <div className="text-slate-400">
              SIGNAL: <span className="text-cyan-400">{locationData.signal}</span>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slideInLeft { to { transform: translateX(0); opacity: 1; } }
        @keyframes slideInRight { to { transform: translateX(0); opacity: 1; } }
        @keyframes loadProgress { 0% { width: 0%; } 100% { width: 100%; } }
        @keyframes pulseCircle { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(3); opacity: 0; } }
      `}</style>
    </section>
  );
}
