import React, { useState, useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  Bike, 
  Flame, 
  Clock, 
  TrendingUp, 
  Plus, 
  RotateCcw, 
  Trash2, 
  Calendar,
  Trophy,
  Activity,
  Milestone
} from 'lucide-react';
import { RidingRecord } from '../types';

interface RidingDashboardProps {
  ridingData: RidingRecord[];
  onAddRecord: (record: RidingRecord) => void;
  onClearRecords: () => void;
  onResetDefault: () => void;
}

export default function RidingDashboard({
  ridingData,
  onAddRecord,
  onClearRecords,
  onResetDefault
}: RidingDashboardProps) {
  // Input fields
  const [newDate, setNewDate] = useState<string>('05-24');
  const [newDistance, setNewDistance] = useState<string>('15.5');
  const [newCalories, setNewCalories] = useState<string>('420');
  const [newDuration, setNewDuration] = useState<string>('45');
  const [newSpeed, setNewSpeed] = useState<string>('20.5');
  const [newElevation, setNewElevation] = useState<string>('150');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Daily goals
  const DAILY_DIST_GOAL = 15; // 15 km
  const DAILY_CAL_GOAL = 400; // 400 kcal

  // Compute overall summary stats
  const summaries = useMemo(() => {
    let totals = { distance: 0, calories: 0, duration: 0, elevation: 0, ridesCount: 0 };
    let maxDistance = 0;
    
    ridingData.forEach((r) => {
      totals.distance += r.distance;
      totals.calories += r.calories;
      totals.duration += r.duration;
      totals.elevation += r.elevationGain;
      if (r.distance > 0) {
        totals.ridesCount++;
        if (r.distance > maxDistance) {
          maxDistance = r.distance;
        }
      }
    });

    const avgSpeed = totals.duration > 0 ? (totals.distance / (totals.duration / 60)) : 0;
    
    // Calculate current riding streak (consecutive non-zero days checking backwards)
    let streak = 0;
    for (let i = ridingData.length - 1; i >= 0; i--) {
      if (ridingData[i].distance > 0) {
        streak++;
      } else {
        // Only count streak if it's contiguous. If it's 0, streak breaks
        break;
      }
    }

    return {
      totalDistance: parseFloat(totals.distance.toFixed(1)),
      totalCalories: Math.round(totals.calories),
      totalDurationHours: parseFloat((totals.duration / 60).toFixed(1)),
      totalElevation: totals.elevation,
      avgSpeed: parseFloat(avgSpeed.toFixed(1)) || 20.2, // fallback
      ridesCount: totals.ridesCount,
      maxDistance,
      streak
    };
  }, [ridingData]);

  // Handle submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const parsedDist = parseFloat(newDistance);
    const parsedCal = parseInt(newCalories, 10);
    const parsedDur = parseInt(newDuration, 10);
    const parsedSpeed = parseFloat(newSpeed);
    const parsedElev = parseInt(newElevation, 10);

    if (!newDate.trim()) {
      setErrorMsg('日期栏不能为空');
      return;
    }
    if (isNaN(parsedDist) || parsedDist < 0) {
      setErrorMsg('距离必须为合法的正数');
      return;
    }
    if (isNaN(parsedCal) || parsedCal < 0) {
      setErrorMsg('卡路里必须为合法的正整数');
      return;
    }
    if (isNaN(parsedDur) || parsedDur < 0) {
      setErrorMsg('骑行时长必须为合法的正整数');
      return;
    }

    const record: RidingRecord = {
      id: `r_user_${Date.now()}`,
      date: newDate,
      distance: parsedDist,
      calories: parsedCal,
      duration: parsedDur,
      avgSpeed: parsedSpeed || 20,
      elevationGain: parsedElev || 0
    };

    onAddRecord(record);

    // Auto-update date guess
    const [month, day] = newDate.split('-');
    if (month && day) {
      let d = parseInt(day, 10);
      let m = parseInt(month, 10);
      d = d + 1;
      if (d > 31) {
        d = 1;
        m = m === 12 ? 1 : m + 1;
      }
      setNewDate(`${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`);
    }
    
    // Reset other defaults briefly
    setNewDistance('18.0');
    setNewCalories('480');
    setNewDuration('50');
  };

  // Quick preset logger
  const addPreset = (type: 'commute' | 'long' | 'sprint') => {
    const todayStr = newDate;
    let dist = 10;
    let cal = 260;
    let dur = 30;
    let speed = 20.0;
    let elev = 60;

    if (type === 'commute') {
      dist = 11.8;
      cal = 320;
      dur = 35;
      speed = 20.2;
      elev = 80;
    } else if (type === 'long') {
      dist = 42.5;
      cal = 1200;
      dur = 125;
      speed = 20.4;
      elev = 480;
    } else if (type === 'sprint') {
      dist = 20.2;
      cal = 580;
      dur = 48;
      speed = 25.2;
      elev = 180;
    }

    onAddRecord({
      id: `r_preset_${Date.now()}`,
      date: todayStr,
      distance: dist,
      calories: cal,
      duration: dur,
      avgSpeed: speed,
      elevationGain: elev
    });

    // Auto update date guess
    const [month, day] = todayStr.split('-');
    if (month && day) {
      let d = parseInt(day, 10);
      let m = parseInt(month, 10);
      d = d + 1;
      if (d > 31) {
        d = 1;
        m = m === 12 ? 1 : m + 1;
      }
      setNewDate(`${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Target Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Cumulative Distance Card */}
        <div id="stats-distance-card" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">总计骑行里程</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-bold text-slate-800">{summaries.totalDistance}</span>
              <span className="text-xs font-semibold text-slate-500">公里</span>
            </div>
            <p className="text-xs text-indigo-600 font-medium flex items-center">
              <Trophy className="w-3.5 h-3.5 mr-1" />
              最大单天: {summaries.maxDistance} km
            </p>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-500">
            <Bike className="w-8 h-8" />
          </div>
        </div>

        {/* Cumulative Calories Card */}
        <div id="stats-calories-card" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">累计消耗卡路里</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-bold text-slate-800">{summaries.totalCalories}</span>
              <span className="text-xs font-semibold text-slate-500">千卡 (kcal)</span>
            </div>
            <p className="text-xs text-orange-600 font-medium">约等于消耗燃脂 14.5 碗米饭 🍚</p>
          </div>
          <div className="p-3 bg-orange-50 border border-orange-100 rounded-2xl text-orange-500">
            <Flame className="w-8 h-8" />
          </div>
        </div>

        {/* Cycling Duration Card */}
        <div id="stats-duration-card" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">累计运动时长</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-bold text-slate-800">{summaries.totalDurationHours}</span>
              <span className="text-xs font-semibold text-slate-500">小时</span>
            </div>
            <p className="text-xs text-slate-400">总骑行频次: {summaries.ridesCount} 次</p>
          </div>
          <div className="p-3 bg-purple-50 border border-purple-100 rounded-2xl text-purple-500">
            <Clock className="w-8 h-8" />
          </div>
        </div>

        {/* Streak Active Days */}
        <div id="stats-streak-card" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">连续运动天数</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-bold text-slate-800">{summaries.streak}</span>
              <span className="text-xs font-semibold text-slate-500">天</span>
            </div>
            <p className="text-xs text-emerald-600 font-medium">持之以恒，加油骑行！</p>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-500 animate-pulse">
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Main Multi-Metric Visual Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Composed Recharts Chart */}
        <div id="composed-riding-chart-box" className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-800">每日骑行距离与燃脂能耗对照</h2>
              <p className="text-xs text-slate-500">柱状图代表骑行距离 (km)，折线图代表消耗的卡路里 (kcal)</p>
            </div>
            {/* Quick target score bar */}
            <div className="flex items-center space-x-4 bg-slate-50 p-2 rounded-xl border border-slate-100 text-xxs text-slate-500">
              <div>
                每日里程目标: <span className="font-bold text-slate-800">{DAILY_DIST_GOAL}km</span>
              </div>
              <div>
                每日卡路里目标: <span className="font-bold text-slate-800">{DAILY_CAL_GOAL}kcal</span>
              </div>
            </div>
          </div>
          
          <div className="h-80 w-full">
            {ridingData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">暂无骑行记录</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={ridingData} margin={{ top: 10, right: -5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} stroke="#cbd5e1" />
                  
                  {/* Distance Axis */}
                  <YAxis 
                    yAxisId="left" 
                    orientation="left" 
                    stroke="#3b82f6" 
                    unit="km"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                  />
                  
                  {/* Calories Axis */}
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="#f97316" 
                    unit="kcal"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                  />
                  
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelFormatter={(label) => `骑行日期: ${label}`}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  
                  {/* Distance as bar */}
                  <Bar 
                    yAxisId="left" 
                    dataKey="distance" 
                    name="骑行距离 (公里)" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={30}
                  />
                  
                  {/* Calories as line */}
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="calories" 
                    name="消耗热量 (千卡)" 
                    stroke="#f97316" 
                    strokeWidth={3} 
                    dot={{ stroke: '#f97316', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right 1 col: Performance Elevation Chart */}
        <div id="speed-elevation-chart-box" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">爬升与速度对比曲线</h2>
            <p className="text-xs text-slate-500">骑行平均速度 (km/h) 对应累计爬升高度 (m)</p>
          </div>
          <div className="h-80 w-full">
            {ridingData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">暂无累计爬升数据</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ridingData.filter(d => d.distance > 0)} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorElevation" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} stroke="#cbd5e1" />
                  <YAxis yAxisId="elev" tick={{ fill: '#64748b', fontSize: 10 }} stroke="#8b5cf6" unit="m" />
                  <YAxis yAxisId="speed" orientation="right" tick={{ fill: '#64748b', fontSize: 10 }} stroke="#10b981" unit="k/h" domain={[10, 35]} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                  <Area
                    yAxisId="elev"
                    type="monotone"
                    dataKey="elevationGain"
                    name="海拔爬升 (米)"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#colorElevation)"
                  />
                  <Line
                    yAxisId="speed"
                    type="monotone"
                    dataKey="avgSpeed"
                    name="均速 (km/h)"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Inputs form & presets & records list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Manual Riding Input Form */}
        <div id="riding-form-card" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center space-x-1">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <span>录入新骑行记录</span>
            </h3>
            <p className="text-xs text-slate-500">手动记录今日、或是往日的骑行里程数据</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {errorMsg && (
              <div className="p-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-100">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">统计日期</label>
                <input
                  type="text"
                  placeholder="字样如 MM-DD"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">骑行距离 (km)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="例如 15.2"
                  value={newDistance}
                  onChange={(e) => setNewDistance(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">卡路里消耗 (kcal)</label>
                <input
                  type="number"
                  placeholder="例如 450"
                  value={newCalories}
                  onChange={(e) => setNewCalories(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">用时时长 (分钟)</label>
                <input
                  type="number"
                  placeholder="例如 50"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">单天累计爬高 (m)</label>
                <input
                  type="number"
                  placeholder="120"
                  value={newElevation}
                  onChange={(e) => setNewElevation(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">骑行均速 (km/h)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="20.5"
                  value={newSpeed}
                  onChange={(e) => setNewSpeed(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono text-slate-800"
                />
              </div>
            </div>

            <button
              id="btn-add-ride-reading"
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-750 active:bg-indigo-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-sm flex items-center justify-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>保存骑行条目</span>
            </button>
          </form>

          {/* Quick presets helper */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-xs text-slate-400 mb-2">快速录入骑行预设：</div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                id="btn-preset-commute"
                onClick={() => addPreset('commute')}
                className="py-1 px-1 text-center bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-xxs font-medium text-slate-600 cursor-pointer"
              >
                🚴 城市通勤
              </button>
              <button
                id="btn-preset-sprint"
                onClick={() => addPreset('sprint')}
                className="py-1 px-1 text-center bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-xxs font-medium text-slate-600 cursor-pointer"
              >
                ⚡ 间歇冲刺
              </button>
              <button
                id="btn-preset-long"
                onClick={() => addPreset('long')}
                className="py-1 px-1 text-center bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-xxs font-medium text-slate-600 cursor-pointer"
              >
                🏆 百公里挑战
              </button>
            </div>
          </div>
        </div>

        {/* History records table */}
        <div id="riding-history-box" className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">历史骑行与卡路里能耗明细</h3>
                <p className="text-xs text-slate-500">时序总览列表，包含距离、卡路里消耗和爬坡表现。</p>
              </div>
              <div className="flex space-x-2">
                <button
                  id="btn-reset-riding-defaults"
                  onClick={onResetDefault}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-xs cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>恢复预设</span>
                </button>
                <button
                  id="btn-clear-riding-history"
                  onClick={onClearRecords}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 rounded-lg text-xs cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>清空全部</span>
                </button>
              </div>
            </div>

            <div className="border border-slate-100 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
              {ridingData.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">暂无历史条目，可使用预设或手动添加</div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                      <th className="py-2.5 px-3">日期</th>
                      <th className="py-2.5 px-3">里程</th>
                      <th className="py-2.5 px-3">能耗</th>
                      <th className="py-2.5 px-3">用时</th>
                      <th className="py-2.5 px-3">均速</th>
                      <th className="py-2.5 px-3">爬升</th>
                      <th className="py-2.5 px-3">目标达成</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-mono">
                    {[...ridingData].reverse().map((r) => {
                      const completePct = r.distance > 0 ? (r.distance / DAILY_DIST_GOAL) * 100 : 0;
                      return (
                        <tr key={r.id} className="hover:bg-slate-25/50 text-slate-600 transition-colors">
                          <td className="py-2 px-3 font-semibold text-slate-700">{r.date}</td>
                          <td className="py-2 px-3 font-bold text-slate-800">{r.distance > 0 ? `${r.distance} km` : '休息天'}</td>
                          <td className="py-2 px-3 text-orange-600 font-medium">{r.calories > 0 ? `${r.calories} kcal` : '--'}</td>
                          <td className="py-2 px-3">{r.duration > 0 ? `${r.duration} min` : '--'}</td>
                          <td className="py-2 px-3">{r.avgSpeed > 0 ? `${r.avgSpeed} km/h` : '--'}</td>
                          <td className="py-2 px-3 text-purple-600">{r.elevationGain > 0 ? `${r.elevationGain} m` : '--'}</td>
                          <td className="py-2 px-3">
                            {r.distance === 0 ? (
                              <span className="text-slate-400 font-sans text-xxs">休息日</span>
                            ) : completePct >= 100 ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xxs font-sans font-semibold border border-emerald-100">
                                达标 ✨
                              </span>
                            ) : (
                              <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, completePct)}%` }}></div>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 text-xxs text-slate-400 flex items-center justify-between">
            <span>数据源：Garmin / STRAVA 同步链路</span>
            <span>骑行周报生成状态：准备就绪</span>
          </div>
        </div>
      </div>
    </div>
  );
}
