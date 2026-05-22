import React, { useState } from 'react';
import { CyclingRecord, RoutePoint } from '../types';
import { X, Plus, Clock, Compass, Activity, ShieldCheck, Thermometer, MapPin } from 'lucide-react';

interface AddRecordModalProps {
  onClose: () => void;
  onAdd: (record: CyclingRecord) => void;
}

// Predefined route types that generate route points
const ROUTE_PRESETS = [
  { id: 'coastline', name: '临港滴水湖海风绿道' },
  { id: 'mountain', name: '佘山竹林蜿蜒爬坡线' },
  { id: 'urban', name: '黄浦江滨江极客慢车道' }
];

export default function AddRecordModal({ onClose, onAdd }: AddRecordModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:30');
  const [distanceKm, setDistanceKm] = useState('20');
  const [caloriesBurnt, setCaloriesBurnt] = useState('450');
  const [avgTemperature, setAvgTemperature] = useState('24');
  const [avgHumidity, setAvgHumidity] = useState('65');
  const [overspeedCount, setOverspeedCount] = useState('0');
  const [safetyScore, setSafetyScore] = useState('95');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [selectedPreset, setSelectedPreset] = useState('coastline');

  // Generator for route paths based on presets
  const generateRoutePoints = (presetId: string, isOverspeedIncidents: number): RoutePoint[] => {
    const points: RoutePoint[] = [];
    const overspeedLocations = Array.from({ length: isOverspeedIncidents }, () => Math.floor(Math.random() * 8) + 2);

    if (presetId === 'coastline') {
      // Circle shape like Dishui Lake
      const center = { x: 50, y: 50 };
      const radius = 35;
      const step = 10;
      for (let i = 0; i <= step; i++) {
        const angle = (i / step) * 2 * Math.PI;
        const currentSpeed = 22 + Math.random() * 6 + (overspeedLocations.includes(i) ? 12 : 0);
        points.push({
          x: Math.round(center.x + radius * Math.cos(angle)),
          y: Math.round(center.y + radius * Math.sin(angle)),
          speed: Math.round(currentSpeed * 10) / 10,
          elevation: Math.round(4 + Math.sin(angle * 2) * 2),
          isOverspeed: currentSpeed > 30,
          label: i === 0 ? '滴水湖环线起点' : i === 5 ? '海滩观景阁' : i === step ? '终点码头' : undefined
        });
      }
    } else if (presetId === 'mountain') {
      // Spiral winding line up and down
      const step = 9;
      for (let i = 0; i <= step; i++) {
        const x = 10 + (i * 8.5);
        const y = 80 - (Math.sin(i * 1.2) * 35) + (i % 2 === 0 ? 5 : -5);
        const elevation = i < 6 ? 100 + i * 110 : 760 - (i - 6) * 180;
        const currentSpeed = (i < 6) ? 12 + Math.random() * 4 : 42 + Math.random() * 10; // Slow climbing, fast descent
        points.push({
          x: Math.round(x),
          y: Math.round(y),
          speed: Math.round(currentSpeed * 10) / 10,
          elevation: Math.max(50, elevation),
          isOverspeed: currentSpeed > 30 && i >= 6, // speeding on downhill
          label: i === 0 ? '佘山大门' : i === 6 ? '九峰之巅峰观景台' : i === step ? '终点返还' : undefined
        });
      }
    } else {
      // Coasting along river banks (Huanpu River)
      const step = 9;
      for (let i = 0; i <= step; i++) {
        const x = 10 + (i * 8.5);
        const y = 40 + Math.sin(i * 0.8) * 15;
        const currentSpeed = 24 + Math.random() * 5 + (overspeedLocations.includes(i) ? 8 : 0);
        points.push({
          x: Math.round(x),
          y: Math.round(y),
          speed: Math.round(currentSpeed * 10) / 10,
          elevation: Math.round(8 + Math.cos(i) * 3),
          isOverspeed: currentSpeed > 30,
          label: i === 0 ? '杨浦滨江大桥' : i === 4 ? '陆家嘴游艇港湾' : i === step ? '徐汇滨江终点' : undefined
        });
      }
    }
    return points;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Compute duration from start and end times
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    let durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    if (durationMinutes <= 0) durationMinutes = 90; // Default fallback index

    const dist = parseFloat(distanceKm) || 20;
    const computedAvgSpeed = (dist / (durationMinutes / 60));

    const finalTitle = title.trim() || `${date} 心率有氧骑行 🌿`;
    const overspeeds = parseInt(overspeedCount, 10) || 0;
    const finalSafetyScore = Math.max(60, 100 - (overspeeds * 6) - (difficulty === 'Hard' ? 5 : 0));

    const deductions = [];
    if (overspeeds > 0) {
      deductions.push({
        reason: `雷达监测累计超速行驶 ${overspeeds} 次`,
        deduction: -(overspeeds * 6)
      });
    }

    const newRecord: CyclingRecord = {
      id: `rec-custom-${Date.now()}`,
      title: finalTitle,
      date,
      startTime,
      endTime,
      durationSeconds: durationMinutes * 60,
      distanceKm: dist,
      avgSpeedKmh: Math.round(computedAvgSpeed * 100) / 100,
      maxSpeedKmh: Math.round((computedAvgSpeed * 1.5) * 10) / 10,
      caloriesBurnt: parseInt(caloriesBurnt, 10) || 450,
      avgTemperature: parseFloat(avgTemperature) || 24,
      avgHumidity: parseFloat(avgHumidity) || 60,
      overspeedCount: overspeeds,
      safetyScore: finalSafetyScore,
      safetyDeductions: deductions,
      routePoints: generateRoutePoints(selectedPreset, overspeeds),
      elevationGainM: selectedPreset === 'mountain' ? 640 : selectedPreset === 'coastline' ? 12 : 25,
      difficulty
    };

    onAdd(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/60 sticky top-0 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-sans">录入全新骑行记录</h3>
              <p className="text-[10px] text-slate-500 font-mono">ADD MANUALLY OR GENERATE TRACKS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          
          {/* General Title */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">骑行活动标题</label>
            <input
              type="text"
              placeholder="e.g., 周末环崇明岛拉练、滨江夜骑有氧"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">骑行日期</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">能耗等级 / 难度</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Easy">轻松游骑 (Easy)</option>
                <option value="Medium">中等有氧 (Medium)</option>
                <option value="Hard">极限拉练 (Hard)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Start Time */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> 出发时间
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> 结束时间
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Distance */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-emerald-400" /> 骑行距离 (km)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>

            {/* Calories burnt */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-amber-500" /> 消耗卡路里 (kcal)
              </label>
              <input
                type="number"
                required
                value={caloriesBurnt}
                onChange={(e) => setCaloriesBurnt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {/* Avg Temp */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-orange-400" /> 温度 (°C)
              </label>
              <input
                type="number"
                required
                value={avgTemperature}
                onChange={(e) => setAvgTemperature(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>

            {/* Avg Humidity */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">湿度 (%)</label>
              <input
                type="number"
                required
                value={avgHumidity}
                onChange={(e) => setAvgHumidity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>

            {/* Overspeeding */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1 text-red-400">超速次数</label>
              <input
                type="number"
                required
                value={overspeedCount}
                onChange={(e) => setOverspeedCount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Preset Route selection */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <span className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" /> 选择轨迹模拟预案
            </span>
            <div className="flex flex-col gap-2">
              {ROUTE_PRESETS.map((p) => (
                <label
                  key={p.id}
                  className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                    selectedPreset === p.id
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                      : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/60 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="preset"
                      checked={selectedPreset === p.id}
                      onChange={() => setSelectedPreset(p.id)}
                      className="accent-emerald-400 hidden"
                    />
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedPreset === p.id ? 'border-emerald-400' : 'border-slate-600'}`}>
                      {selectedPreset === p.id && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
                    </div>
                    <span>{p.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {p.id === 'coastline' ? '环形平原线' : p.id === 'mountain' ? '高低起伏爬坡线' : '临江滨水线'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Description warning info */}
          <p className="text-[10px] text-slate-500 leading-relaxed">
            * 提交此记录后，系统将使用选择的预设，根据您的骑行超速次数以及能耗等级自动缩放配速热力图、安全分数点并加载完整的 SVG 高度计轨迹。
          </p>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 border-t border-slate-800 pt-3 mt-1.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs hover:bg-slate-800 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 transition-colors"
            >
              生成记录
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
