import React, { useState, useEffect, useRef } from 'react';
import { RoutePoint } from '../types';
import { Play, Pause, RotateCcw, AlertTriangle, ChevronRight, Compass } from 'lucide-react';

interface RouteMapProps {
  points: RoutePoint[];
  title: string;
}

export default function RouteMap({ points, title }: RouteMapProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // ms delay multiplier
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean-up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Manage simulation playback
  useEffect(() => {
    if (isPlaying) {
      const intervalDelay = Math.max(200, 1000 - (playbackSpeed * 250));
      timerRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          if (prevIndex >= points.length - 1) {
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return prevIndex;
          }
          return prevIndex + 1;
        });
      }, intervalDelay);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, points.length, playbackSpeed]);

  const handlePlayPause = () => {
    if (currentIndex >= points.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaying(false);
    setCurrentIndex(parseInt(e.target.value, 10));
  };

  // Convert points to SVG path format
  const getSvgPath = () => {
    if (points.length === 0) return '';
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x}% ${p.y}%`).join(' ');
  };

  const activePoint = points[currentIndex] || points[0];

  return (
    <div className="flex flex-col gap-4 bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-inner">
      {/* Map Header with Real-time Telemetry */}
      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-400 animate-spin-slow" />
          <span className="text-xs font-mono font-medium tracking-wide text-slate-400 uppercase">
            骑行路线观测系统 / {title}
          </span>
        </div>
        <div className="flex gap-2 items-center">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-mono text-slate-500">模拟雷达就绪</span>
        </div>
      </div>

      {/* SVG Canvas Map Screen */}
      <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800/80 group">
        {/* Digital Grid Backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:5%_8%] opacity-35"></div>
        
        {/* Soft Radial Center Map Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-radial from-emerald-500/5 to-transparent blur-3xl pointer-events-none"></div>

        {/* SVG Path Render */}
        <svg className="absolute inset-0 w-full h-full p-6 select-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#34d399" floodOpacity="0.6"/>
            </filter>
            <filter id="dangerGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#ef4444" floodOpacity="0.8"/>
            </filter>
          </defs>

          {/* Underlay shadow path */}
          <path
            d={getSvgPath()}
            fill="none"
            stroke="#020617"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-60"
          />

          {/* Main glowing route path */}
          <path
            d={getSvgPath()}
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
          />

          {/* Static Route Coordinates Indicators */}
          {points.map((pt, idx) => {
            const isStart = idx === 0;
            const isEnd = idx === points.length - 1;
            const isMarker = pt.label;

            if (isStart) {
              return (
                <g key={`start-dot-${idx}`}>
                  <circle cx={pt.x} cy={pt.y} r="4" fill="#10b981" />
                  <circle cx={pt.x} cy={pt.y} r="7" fill="none" stroke="#10b981" strokeWidth="1" className="animate-ping" style={{ transformOrigin: `${pt.x}% ${pt.y}%` }} />
                </g>
              );
            }

            if (isEnd) {
              return (
                <g key={`end-dot-${idx}`}>
                  <circle cx={pt.x} cy={pt.y} r="4.5" fill="#ef4444" />
                  <rect x={pt.x - 3} y={pt.y - 3} width="6" height="6" fill="#f8fafc" stroke="#ef4444" strokeWidth="1.5" />
                </g>
              );
            }

            // Highlighting speeding nodes with distinct alert indicators
            if (pt.isOverspeed) {
              return (
                <g key={`speed-dot-${idx}`} className="cursor-help">
                  <circle cx={pt.x} cy={pt.y} r="3" fill="#ef4444" filter="url(#dangerGlow)" />
                  <circle cx={pt.x} cy={pt.y} r="6" fill="none" stroke="#ef4444" strokeWidth="0.8" className="animate-pulse" style={{ transformOrigin: `${pt.x}% ${pt.y}%` }} />
                </g>
              );
            }

            // Designated Checkpoint Text
            if (isMarker) {
              return (
                <circle key={`marker-dot-${idx}`} cx={pt.x} cy={pt.y} r="2.5" fill="#06b6d4" />
              );
            }

            return null;
          })}

          {/* Animated Rider Avatar */}
          {activePoint && (
            <g style={{ transition: 'all 0.15s ease-out' }}>
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="6"
                fill="#34d399"
                filter="url(#glow)"
                className="stroke-white stroke-2"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="11"
                fill="none"
                stroke="#34d399"
                strokeWidth="1.5"
                className="animate-ping"
                style={{ transformOrigin: `${activePoint.x}% ${activePoint.y}%` }}
              />
            </g>
          )}
        </svg>

        {/* Dynamic Telemetry Display Overly */}
        <div className="absolute top-3 left-3 bg-slate-900/95 border border-slate-800/80 p-3 rounded-lg flex flex-col gap-1.5 min-w-[150px] shadow-lg backdrop-blur-md">
          <div className="text-[10px] uppercase font-mono text-slate-500">Live Telemetry</div>
          <div>
            <span className="text-slate-400 text-[10px] font-mono block">实时配速 (Speed)</span>
            <span className="text-xl font-bold font-mono text-emerald-400">
              {activePoint.speed.toFixed(1)}
              <span className="text-xs font-normal text-slate-500 ml-1">km/h</span>
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-mono block">实时海拔 (Elevation)</span>
            <span className="text-xl font-bold font-mono text-cyan-400">
              {activePoint.elevation}
              <span className="text-xs font-normal text-slate-500 ml-1">m</span>
            </span>
          </div>
        </div>

        {/* Current Landmark Alert Bubble */}
        {activePoint.label && (
          <div className="absolute bottom-3 left-3 bg-emerald-500/90 text-slate-950 font-sans font-medium text-xs px-2.5 py-1 rounded-full shadow-md animate-fade-in flex items-center gap-1 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 bg-slate-950 rounded-full animate-bounce"></span>
            {activePoint.label}
          </div>
        )}

        {/* Speedy Warning Indicator */}
        {activePoint.isOverspeed && (
          <div className="absolute top-3 right-3 bg-red-950/90 border border-red-800/80 text-red-400 font-mono text-[10px] px-2.5 py-1.5 rounded-lg shadow-md animate-pulse flex items-center gap-1.5 backdrop-blur-sm">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span>超速段! 限制 30km/h </span>
          </div>
        )}
      </div>

      {/* Playback Controls Panel */}
      <div className="flex flex-col gap-3 py-1 px-1 bg-slate-900/60 rounded-xl border border-slate-800/60 p-3">
        <div className="flex items-center justify-between gap-4">
          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayPause}
              className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                isPlaying 
                  ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' 
                  : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
              }`}
              title={isPlaying ? '暂停' : '启动模拟'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-amber-400" /> : <Play className="w-4 h-4 fill-emerald-400" />}
            </button>
            
            <button
              onClick={handleReset}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center justify-center"
              title="复位"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="h-6 w-[1px] bg-slate-800 mx-1"></div>

            {/* Micro Speeder Selector */}
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              className="bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-mono rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              title="模拟速率"
            >
              <option value="1">1x 航速</option>
              <option value="2">2x 极速</option>
              <option value="3">3x 音速</option>
            </select>
          </div>

          {/* Readout tracker */}
          <div className="text-[11px] font-mono text-slate-500">
            进度点: <span className="text-slate-300">{currentIndex + 1}</span> / {points.length}
          </div>
        </div>

        {/* Timeline Slider with visual markers */}
        <div className="relative flex items-center w-full">
          <input
            type="range"
            min="0"
            max={points.length - 1}
            value={currentIndex}
            onChange={handleSliderChange}
            className="w-full h-1.5 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
          />
        </div>

        {/* Spark Altitude Elevation Profile */}
        <div className="flex flex-col gap-1 mt-1">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
            <span>海拔走势 (Elevation Profile)</span>
            <span className="text-slate-400">{activePoint.elevation}m</span>
          </div>
          <div className="flex justify-between items-end gap-[2px] h-8 bg-slate-950/60 rounded px-1.5 py-1 border border-slate-800/40">
            {points.map((pt, idx) => {
              // Find max elevation in points to scale correctly
              const maxElev = Math.max(...points.map(p => p.elevation), 20);
              const minElev = Math.min(...points.map(p => p.elevation), 0);
              const range = maxElev - minElev || 1;
              const heightPct = Math.max(10, ((pt.elevation - minElev) / range) * 100);
              const isActive = idx === currentIndex;

              return (
                <div
                  key={`elev-bar-${idx}`}
                  style={{ height: `${heightPct}%` }}
                  className={`w-full rounded-t-sm transition-all duration-150 ${
                    isActive 
                      ? 'bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.5)]' 
                      : pt.isOverspeed ? 'bg-red-500/40' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentIndex(idx);
                  }}
                  title={`海拔: ${pt.elevation}m | 速度: ${pt.speed}km/h`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
