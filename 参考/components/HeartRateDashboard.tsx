import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { 
  Heart, 
  Activity, 
  Timer, 
  ShieldAlert, 
  Tv, 
  Plus, 
  Sliders, 
  RefreshCw,
  TrendingDown,
  Info
} from 'lucide-react';
import { DayHeartRate, HeartRateRecord, getHrZone } from '../types';

interface HeartRateDashboardProps {
  heartRateDays: DayHeartRate[];
  onUpdateDayData: (date: string, data: HeartRateRecord[]) => void;
  onResetDefault: () => void;
}

export default function HeartRateDashboard({
  heartRateDays,
  onUpdateDayData,
  onResetDefault
}: HeartRateDashboardProps) {
  // Current selected day date
  const [selectedDate, setSelectedDate] = useState<string>(heartRateDays[0]?.date || '2026-05-23');

  // Input states for hourly heart rate editing
  const [editHour, setEditHour] = useState<number>(17);
  const [editBpm, setEditBpm] = useState<number>(140);
  const [editSpeed, setEditSpeed] = useState<number>(20);

  // Active day data structure
  const activeDay = useMemo(() => {
    return heartRateDays.find((d) => d.date === selectedDate) || heartRateDays[0];
  }, [heartRateDays, selectedDate]);

  // Calculations on current day's telemetry
  const stats = useMemo(() => {
    if (!activeDay || activeDay.data.length === 0) {
      return { min: 0, max: 0, avg: 0, timeResting: 0, timeWarmup: 0, timeFatBurn: 0, timeCardio: 0, timePeak: 0 };
    }
    const bpmArray = activeDay.data.map((d) => d.bpm);
    const sum = bpmArray.reduce((acc, curr) => acc + curr, 0);
    const avg = Math.round(sum / activeDay.data.length);
    const min = Math.min(...bpmArray);
    const max = Math.max(...bpmArray);

    // Calculate count in each heart rate zone (representing hours/time)
    let zones = { Resting: 0, 'Warm-up': 0, 'Fat Burn': 0, Cardio: 0, Peak: 0 };
    activeDay.data.forEach((r) => {
      zones[r.zone] = (zones[r.zone] || 0) + 1;
    });

    return {
      min,
      max,
      avg,
      zones: [
        { name: '日常静息 (Resting)', count: zones.Resting, color: '#94a3b8', desc: '< 100 bpm' },
        { name: '热身区间 (Warm-up)', count: zones['Warm-up'], color: '#3b82f6', desc: '100 - 119 bpm' },
        { name: '燃脂能耗 (Fat Burn)', count: zones['Fat Burn'], color: '#10b981', desc: '120 - 139 bpm' },
        { name: '有氧耐力 (Cardio)', count: zones.Cardio, color: '#f59e0b', desc: '140 - 164 bpm' },
        { name: '无氧极限 (Peak)', count: zones.Peak, color: '#f43f5e', desc: '≥ 165 bpm' },
      ],
      rawZones: zones
    };
  }, [activeDay]);

  // Handle manual update of single hour
  const handleUpdateHour = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDay) return;

    const updatedData = activeDay.data.map((item) => {
      if (item.hour === editHour) {
        return {
          ...item,
          bpm: editBpm,
          speed: editSpeed,
          zone: getHrZone(editBpm)
        };
      }
      return item;
    });

    onUpdateDayData(selectedDate, updatedData);
  };

  // Generate preset session overlay for selected day
  const applyPresetSession = (type: 'hiit' | 'endurance' | 'recovery') => {
    if (!activeDay) return;

    let updatedData: HeartRateRecord[] = [];
    if (type === 'hiit') {
      // 2 hours interval training at hour 14 and 15
      updatedData = activeDay.data.map((item) => {
        if (item.hour === 14) return { hour: 14, bpm: 168, speed: 31, zone: 'Peak' };
        if (item.hour === 15) return { hour: 15, bpm: 175, speed: 34, zone: 'Peak' };
        if (item.hour === 16) return { hour: 16, bpm: 110, speed: 10, zone: 'Warm-up' };
        return item;
      });
    } else if (type === 'endurance') {
      // 4 hours constant moderate ride from hour 9 to 12
      updatedData = activeDay.data.map((item) => {
        if (item.hour >= 9 && item.hour <= 12) {
          return {
            hour: item.hour,
            bpm: 132,
            speed: 21.5,
            zone: 'Fat Burn'
          };
        }
        return item;
      });
    } else if (type === 'recovery') {
      // Low resting levels everywhere, zero speeds
      updatedData = activeDay.data.map((item) => ({
        hour: item.hour,
        bpm: item.hour >= 8 && item.hour <= 21 ? 68 + Math.floor(Math.random() * 8) : 55,
        speed: 0,
        zone: 'Resting'
      }));
    }

    onUpdateDayData(selectedDate, updatedData);
  };

  return (
    <div className="space-y-6">
      {/* Selector and Day Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">选择要分析的骑行日期</span>
          <div className="flex flex-wrap gap-2">
            {heartRateDays.map((d) => (
              <button
                id={`btn-select-date-${d.date}`}
                key={d.date}
                onClick={() => setSelectedDate(d.date)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  selectedDate === d.date
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <button
          id="btn-hrm-reset-defaults"
          onClick={onResetDefault}
          className="flex items-center justify-center space-x-1 px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-medium cursor-pointer transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>恢复所有心率预设</span>
        </button>
      </div>

      {/* Hourly Core Stats HUD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Average heart rate card */}
        <div id="stats-hr-avg-card" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">平均监测心率</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-bold text-slate-800">{stats.avg}</span>
              <span className="text-xs font-semibold text-slate-500">BPM</span>
            </div>
            <p className="text-xs text-slate-400">全天心血管负荷均值</p>
          </div>
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-rose-500">
            <Heart className="w-8 h-8 fill-rose-500/10" />
          </div>
        </div>

        {/* Max heart rate card */}
        <div id="stats-hr-max-card" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">峰值极限心率</span>
            <div className="flex items-baseline space-x-1">
              <span className={`text-3xl font-bold ${stats.max >= 165 ? 'text-rose-600 font-extrabold' : 'text-slate-800'}`}>
                {stats.max}
              </span>
              <span className="text-xs font-semibold text-slate-500">BPM</span>
            </div>
            {stats.max >= 165 ? (
              <p className="text-xs text-rose-600 font-medium flex items-center">
                <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                已达无氧高能警戒
              </p>
            ) : (
              <p className="text-xs text-emerald-600 font-medium">心肺表现安全温和</p>
            )}
          </div>
          <div className={`p-3 rounded-2xl border ${stats.max >= 165 ? 'bg-red-50 border-red-100 text-red-500' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
            <Activity className="w-8 h-8" />
          </div>
        </div>

        {/* Minimum / resting card */}
        <div id="stats-hr-min-card" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">凌晨静息心率</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-bold text-slate-800">{stats.min}</span>
              <span className="text-xs font-semibold text-slate-500">BPM</span>
            </div>
            <p className="text-xs text-emerald-600 font-medium">代表心肌恢复力较强</p>
          </div>
          <div className="p-3 bg-sky-50 border border-sky-100 rounded-2xl text-sky-500">
            <TrendingDown className="w-8 h-8" />
          </div>
        </div>

        {/* Live Simulation Quick Injector */}
        <div id="hr-sim-actions" className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-2">
          <div className="text-xs font-semibold text-slate-500 mb-1">覆盖性注入预设运动时段</div>
          <div className="grid grid-cols-3 gap-1">
            <button
              id="btn-preset-hiit"
              onClick={() => applyPresetSession('hiit')}
              className="py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xxs font-medium cursor-pointer transition-colors"
              title="下午进行短暂高强度冲刺(BPM达175)"
            >
              冲刺 HIIT
            </button>
            <button
              id="btn-preset-aerobic"
              onClick={() => applyPresetSession('endurance')}
              className="py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xxs font-medium cursor-pointer transition-colors"
              title="上午9点-12点维持中度带燃脂骑行"
            >
              多时有氧
            </button>
            <button
              id="btn-preset-inactive"
              onClick={() => applyPresetSession('recovery')}
              className="py-2 bg-slate-600 hover:bg-slate-700 active:bg-slate-800 text-white rounded-xl text-xxs font-medium cursor-pointer transition-colors"
              title="降为静息，模拟全天休息"
            >
              模拟静息
            </button>
          </div>
        </div>
      </div>

      {/* Main Graphs Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Hourly Recharts curve line + speed overlay */}
        <div id="hr-trend-chart-box" className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">24小时心率时序变化与骑行配速</h2>
            <p className="text-xs text-slate-500">红面区域为心率曲线 (bpm)，绿色线条代表骑行车速 (km/h)，两曲线高位重合期通常为运动进行时。</p>
          </div>
          
          <div className="h-80 w-full">
            {!activeDay || activeDay.data.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">暂无时序心率数据</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeDay.data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHrBpm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="hour" 
                    tickFormatter={(val) => `${val}:00`}
                    tick={{ fill: '#64748b', fontSize: 10 }} 
                    stroke="#cbd5e1" 
                  />
                  
                  {/* Heart Rate Axis */}
                  <YAxis 
                    yAxisId="hr" 
                    domain={[40, 190]} 
                    tick={{ fill: '#64748b', fontSize: 10 }} 
                    stroke="#ef4444" 
                    unit="bpm"
                  />
                  
                  {/* Speed Axis */}
                  <YAxis 
                    yAxisId="spd" 
                    orientation="right" 
                    domain={[0, 45]} 
                    tick={{ fill: '#64748b', fontSize: 10 }} 
                    stroke="#10b981" 
                    unit="k/h"
                  />
                  
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                    labelFormatter={(label) => `时段: ${label}:00`}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  
                  {/* HR Gradient Area */}
                  <Area
                    yAxisId="hr"
                    type="monotone"
                    dataKey="bpm"
                    name="实时心率 (BPM)"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorHrBpm)"
                  />
                  
                  {/* Speed Line Overlay */}
                  <Area
                    yAxisId="spd"
                    type="monotone"
                    dataKey="speed"
                    name="对应配均速 (km/h)"
                    stroke="#10b981"
                    strokeWidth={1.5}
                    fill="transparent"
                    strokeDasharray="4 4"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right 1 col: Cardiovascular Zone Percent Chart */}
        <div id="hr-zones-breakdown-box" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">生理心率区间分布析值</h2>
            <p className="text-xs text-slate-500">统计分析 24 小时各级负荷时段时长 (小时)</p>
          </div>

          <div className="h-44 w-full">
            {stats.zones.every(z => z.count === 0) ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">全天无有耗能记录</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.zones} layout="vertical" margin={{ top: 5, right: 10, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 9 }} stroke="#cbd5e1" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 500 }}
                  />
                  <Tooltip formatter={(value: any) => [`${value} 小时`, '累计占时']} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={15}>
                    {stats.zones.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Details list description of Zones */}
          <div className="space-y-1.5 pt-1 border-t border-slate-100">
            {stats.zones.map((zone, idx) => (
              <div key={idx} className="flex items-center justify-between text-xxs p-1 bg-slate-50 rounded-lg border border-slate-100/50">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: zone.color }} />
                  <span className="font-semibold text-slate-700">{zone.name.split(' (')[0]}</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-500">
                  <span>{zone.desc}</span>
                  <span className="font-bold font-mono text-slate-800">{zone.count} 小时</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive hourly calibration form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col: Tune single hour value */}
        <div id="hr-edit-form-box" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center space-x-1">
              <Sliders className="w-5 h-5 text-indigo-500" />
              <span>个别整点心率微调</span>
            </h3>
            <p className="text-xs text-slate-500">手动微调所选日期的某个特定整点遥测值</p>
          </div>

          <form onSubmit={handleUpdateHour} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">微调整点 (0-23)</label>
                <select
                  value={editHour}
                  onChange={(e) => {
                    const h = parseInt(e.target.value, 10);
                    setEditHour(h);
                    // Match values if possible from activeDay data
                    const matched = activeDay.data.find(d => d.hour === h);
                    if (matched) {
                      setEditBpm(matched.bpm);
                      setEditSpeed(Math.round(matched.speed));
                    }
                  }}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono text-slate-800"
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={i}>{i.toString().padStart(2, '0')}:00 时段</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">骑行配速度 (km/h)</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={editSpeed}
                  onChange={(e) => setEditSpeed(parseInt(e.target.value, 10) || 0)}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono text-slate-800"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>设定心率值</span>
                <span className="font-bold text-slate-800">{editBpm} BPM</span>
              </div>
              <input
                type="range"
                min="45"
                max="195"
                value={editBpm}
                onChange={(e) => setEditBpm(parseInt(e.target.value, 10))}
                className="w-full accent-rose-500 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <button
              id="btn-update-specific-hour"
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-750 active:bg-indigo-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-sm flex items-center justify-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>保存，更新该整点</span>
            </button>
          </form>
        </div>

        {/* Right 2 cols: Help information table regarding cardiovascular load during cycling */}
        <div id="hr-academy-box" className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center space-x-1">
                <Info className="w-5 h-5 text-teal-500" />
                <span>自行车骑行运动心率与能耗学术指南</span>
              </h3>
              <p className="text-xs text-slate-500">如何判定个人的心率情况？请参照以下各级训练水平指标</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xxs text-slate-600">
              <div className="space-y-2 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-800 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                  燃脂区间 (120 - 139 BPM)
                </h4>
                <p className="leading-relaxed">
                  中低负荷，主要利用身体脂肪供给能量。适宜进行大容量的基础有氧耐力骑行工作。该区间能够强化毛细血管网和线粒体活性，提高耐劳能力。
                </p>
              </div>

              <div className="space-y-2 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-800 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2" />
                  有氧耐力阶段 (140 - 164 BPM)
                </h4>
                <p className="leading-relaxed">
                  中高负荷，对提升心肌舒缩力量、血红蛋白含量及增强心脏每搏输出量（SV）具有最为显著的推动作用。是爬坡阶段的主要表现心率。
                </p>
              </div>

              <div className="space-y-2 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-800 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2" />
                  极限乳酸阈值阶段 (≥ 165 BPM)
                </h4>
                <p className="leading-relaxed">
                  机体进入无氧呼吸，乳酸迅速在肌肉内积累导致疲惫酸软。通常发生于极限陡坡攀登和冲刺突围瞬间，训练不宜超过单次骑行总长的10%。
                </p>
              </div>

              <div className="space-y-2 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-800 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2" />
                  心脏骤停预警 & Cooldown
                </h4>
                <p className="leading-relaxed">
                  若心率突破220减去你的真实年龄（如 &gt;190 BPM），应立即降低骑行配速与踏频，在开阔背风地段进行匀速滑行，进行深长呼吸缓解压迫。
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-55/60 text-xxs text-slate-400 justify-between flex items-center">
            <span>心脏传感器支持：蓝牙5.0 / ANT+ 双频广播模式已就绪</span>
            <span>生理检测标准依据：ACSM (美国运动医学学会) 训练划分法</span>
          </div>
        </div>
      </div>
    </div>
  );
}
