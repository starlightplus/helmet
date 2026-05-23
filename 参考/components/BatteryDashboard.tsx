import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  Battery, 
  BatteryCharging, 
  Zap, 
  Thermometer, 
  Gauge, 
  Plus, 
  Trash2, 
  RotateCcw,
  AlertTriangle 
} from 'lucide-react';
import { BatteryRecord } from '../types';

interface BatteryDashboardProps {
  batteryData: BatteryRecord[];
  onAddRecord: (record: BatteryRecord) => void;
  onClearRecords: () => void;
  onResetDefault: () => void;
}

export default function BatteryDashboard({
  batteryData,
  onAddRecord,
  onClearRecords,
  onResetDefault
}: BatteryDashboardProps) {
  // Input form state
  const [newPercent, setNewPercent] = useState<number>(85);
  const [newTemp, setNewTemp] = useState<number>(28);
  const [newVoltage, setNewVoltage] = useState<number>(4.1);
  const [newStatus, setNewStatus] = useState<BatteryRecord['status']>('discharging');
  const [newTime, setNewTime] = useState<string>('08:00');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Get current state from latest reading
  const currentReading = useMemo(() => {
    if (batteryData.length === 0) {
      return { percentage: 0, status: 'discharging' as const, temperature: 0, voltage: 0, timestamp: '--:--' };
    }
    return batteryData[batteryData.length - 1];
  }, [batteryData]);

  // Form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Quick validation
    if (!newTime.trim() || !/^\d{2}:\d{2}$/.test(newTime)) {
      setErrorMsg('时间格式必须为 HH:MM (如 18:30)');
      return;
    }

    const record: BatteryRecord = {
      id: `b_user_${Date.now()}`,
      timestamp: newTime,
      percentage: Math.max(0, Math.min(100, newPercent)),
      status: newStatus,
      temperature: Math.max(0, Math.min(80, newTemp)),
      voltage: Math.max(2.5, Math.min(5.0, newVoltage))
    };

    onAddRecord(record);
    
    // Auto increment default time for user convenience
    const [hStr, mStr] = newTime.split(':');
    let h = parseInt(hStr, 10);
    h = (h + 1) % 24;
    const nextTime = `${h.toString().padStart(2, '0')}:${mStr}`;
    setNewTime(nextTime);
  };

  // Quick action: fast simulate charging
  const handleSimulateCharge = () => {
    const lastP = currentReading.percentage;
    const targetP = Math.min(100, lastP + 10);
    const lastTimeStr = currentReading.timestamp !== '--:--' ? currentReading.timestamp : '12:00';
    const [hStr, mStr] = lastTimeStr.split(':');
    let h = parseInt(hStr, 10);
    let m = parseInt(mStr, 10);
    m = (m + 30) % 60;
    if (m === 0 || m === 30) h = (h + 1) % 24;
    const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

    onAddRecord({
      id: `b_sim_${Date.now()}`,
      timestamp: timeStr,
      percentage: targetP,
      status: targetP === 100 ? 'full' : 'charging',
      temperature: 35, // Charging elevates temp
      voltage: Math.min(4.25, currentReading.voltage + 0.15)
    });
  };

  // Quick action: simulate riding drain
  const handleSimulateDrain = () => {
    const lastP = currentReading.percentage;
    const targetP = Math.max(0, lastP - 12);
    const lastTimeStr = currentReading.timestamp !== '--:--' ? currentReading.timestamp : '12:00';
    const [hStr, mStr] = lastTimeStr.split(':');
    let h = parseInt(hStr, 10);
    let m = parseInt(mStr, 10);
    m = (m + 30) % 60;
    if (m === 0 || m === 30) h = (h + 1) % 24;
    const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

    onAddRecord({
      id: `b_sim_${Date.now()}`,
      timestamp: timeStr,
      percentage: targetP,
      status: 'discharging',
      temperature: 33, // Working elevates temp
      voltage: Math.max(3.2, currentReading.voltage - 0.12)
    });
  };

  // Determine battery level styling & icon
  const batteryColorClass = (pct: number) => {
    if (pct > 50) return 'text-emerald-500 bg-emerald-50 border-emerald-200';
    if (pct > 20) return 'text-amber-500 bg-amber-50 border-amber-200';
    return 'text-rose-500 bg-rose-50 border-rose-200 animate-pulse';
  };

  const getBatteryFillColor = (pct: number) => {
    if (pct > 50) return '#10b981'; // Emerald
    if (pct > 20) return '#f59e0b'; // Amber
    return '#f43f5e'; // Rose
  };

  return (
    <div className="space-y-6">
      {/* Overview stats HUD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Real-time battery meter */}
        <div id="battery-status-card" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">当前电量状态</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-bold font-sans text-slate-800">{currentReading.percentage}%</span>
              <span className="text-xs font-medium text-slate-500">
                {currentReading.status === 'charging' ? '充电中' : currentReading.status === 'full' ? '已充满' : '释电中'}
              </span>
            </div>
            <p className="text-xs text-slate-400">上次更新: {currentReading.timestamp}</p>
          </div>
          <div className={`p-3 rounded-2xl border ${batteryColorClass(currentReading.percentage)} flex flex-col items-center justify-center`}>
            {currentReading.status === 'charging' ? (
              <BatteryCharging className="w-8 h-8" />
            ) : (
              <Battery className="w-8 h-8" />
            )}
          </div>
        </div>

        {/* Battery Temperature */}
        <div id="battery-temp-card" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">电池温度</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-bold text-slate-800">{currentReading.temperature}°C</span>
            </div>
            <p className="text-xs text-emerald-600 font-medium">健康度: 优秀 (98%)</p>
          </div>
          <div className="p-3 bg-red-50 border border-red-100 rounded-2xl text-red-500">
            <Thermometer className="w-8 h-8" />
          </div>
        </div>

        {/* Battery Voltage */}
        <div id="battery-voltage-card" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">工作电压</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-bold text-slate-800">{currentReading.voltage.toFixed(2)}V</span>
            </div>
            <p className="text-xs text-slate-400">安全区间: 3.2V - 4.2V</p>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-blue-500">
            <Gauge className="w-8 h-8" />
          </div>
        </div>

        {/* Dynamic Battery Simulation Controls */}
        <div id="battery-sim-actions" className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-2">
          <div className="text-xs font-semibold text-slate-500 mb-1">快速模拟状态变化</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-simulate-charge"
              onClick={handleSimulateCharge}
              className="flex items-center justify-center space-x-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-medium cursor-pointer transition-colors shadow-sm"
              title="模拟增加10%电量"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>快速充电</span>
            </button>
            <button
              id="btn-simulate-drain"
              onClick={handleSimulateDrain}
              className="flex items-center justify-center space-x-1 py-2 px-3 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-xl text-xs font-medium cursor-pointer transition-colors shadow-sm"
              title="模拟减少12%电量"
            >
              <Battery className="w-3.5 h-3.5" />
              <span>骑行放电</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Recharts Battery Trend */}
        <div id="battery-trend-chart-box" className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">电量消耗与充电变化趋势</h2>
              <p className="text-xs text-slate-500">显示最近24小时周期内的电量升降波动</p>
            </div>
            {currentReading.percentage <= 20 && (
              <div className="flex items-center space-x-1 px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-semibold animate-pulse border border-red-100">
                <AlertTriangle className="w-3 h-3" />
                <span>电量偏低，请及时充电</span>
              </div>
            )}
          </div>
          <div className="h-72 w-full">
            {batteryData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Battery className="w-12 h-12 stroke-1 mb-2 animate-bounce" />
                <p className="text-sm">暂无电量数据，请在右侧录入或重置预设</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={batteryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPercentage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={getBatteryFillColor(currentReading.percentage)} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={getBatteryFillColor(currentReading.percentage)} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="timestamp" 
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    stroke="#cbd5e1"
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    stroke="#cbd5e1"
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`${value}%`, '电量百分比']}
                    labelFormatter={(label) => `记录时间: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="percentage"
                    stroke={getBatteryFillColor(currentReading.percentage)}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorPercentage)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right 1 col: Battery Temperature and Voltage */}
        <div id="battery-detail-chart-box" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">电池物理指标监控</h2>
            <p className="text-xs text-slate-500">监测行车/充电状态下的电压与温度变化</p>
          </div>
          <div className="h-72 w-full">
            {batteryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-450 text-sm">暂无物理指标数据</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={batteryData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="timestamp" tick={{ fill: '#64748b', fontSize: 10 }} stroke="#cbd5e1" />
                  <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 10 }} stroke="#ef4444" unit="°" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 10 }} stroke="#3b82f6" unit="V" domain={[2.5, 4.5]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0' }}
                    labelFormatter={(label) => `记录时间: ${label}`}
                  />
                  <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="temperature"
                    name="温度 (°C)"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="voltage"
                    name="电压 (V)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Manual Input Form & Records Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col: Log Single Data Reading */}
        <div id="battery-form-card" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center space-x-1">
              <Plus className="w-5 h-5 text-indigo-500" />
              <span>录入电量监测记录</span>
            </h3>
            <p className="text-xs text-slate-500">记录骑行过程中的离散电量变动数据</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-100 flex items-center space-x-1">
                <span>{errorMsg}</span>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">记录时间 (HH:MM)</label>
                <input
                  type="text"
                  placeholder="如 18:30"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 placeholder-slate-400 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">电池状态</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as BatteryRecord['status'])}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800"
                >
                  <option value="discharging">Discharging 放电中</option>
                  <option value="charging">Charging 充电中</option>
                  <option value="standby">Standby 待机</option>
                  <option value="full">Full 已充满</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>电量百分比</span>
                <span className="font-bold text-slate-800">{newPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={newPercent}
                onChange={(e) => setNewPercent(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>温度</span>
                  <span className="font-bold text-slate-800">{newTemp}°C</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="65"
                  value={newTemp}
                  onChange={(e) => setNewTemp(parseInt(e.target.value, 10))}
                  className="w-full accent-rose-500 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>工作电压</span>
                  <span className="font-bold text-slate-800">{newVoltage.toFixed(2)}V</span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="4.5"
                  step="0.05"
                  value={newVoltage}
                  onChange={(e) => setNewVoltage(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <button
              id="btn-add-battery-reading"
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-750 active:bg-indigo-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-sm flex items-center justify-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>录入此条数据</span>
            </button>
          </form>
        </div>

        {/* Right 2 cols: History Logs Table list & Management Controls */}
        <div id="battery-history-box" className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">电量基础遥测记录</h3>
                <p className="text-xs text-slate-500">最近监测数据的时序列表，可以用来核对放电节点</p>
              </div>
              <div className="flex space-x-2">
                <button
                  id="btn-reset-battery-defaults"
                  onClick={onResetDefault}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-xs cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>恢复预设</span>
                </button>
                <button
                  id="btn-clear-battery-history"
                  onClick={onClearRecords}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 rounded-lg text-xs cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>清空全部</span>
                </button>
              </div>
            </div>

            <div className="border border-slate-100 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
              {batteryData.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">空空如也，请录入一些数据</div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                      <th className="py-2.5 px-4">时间点</th>
                      <th className="py-2.5 px-4">电量</th>
                      <th className="py-2.5 px-4">状态</th>
                      <th className="py-2.5 px-4">温度</th>
                      <th className="py-2.5 px-4">电压</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-mono">
                    {batteryData.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-25/50 text-slate-600 transition-colors">
                        <td className="py-2 px-4 font-semibold text-slate-700">{b.timestamp}</td>
                        <td className="py-2 px-4 font-bold">
                          <span className={b.percentage <= 20 ? 'text-rose-500' : 'text-slate-700'}>
                            {b.percentage}%
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xxs font-sans font-medium uppercase tracking-wider ${
                            b.status === 'charging' 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                              : b.status === 'full'
                              ? 'bg-blue-50 text-blue-600 border border-blue-100'
                              : 'bg-slate-50 text-slate-500 border border-slate-100'
                          }`}>
                            {b.status === 'charging' ? '充电' : b.status === 'discharging' ? '耗电' : b.status === 'full' ? '饱满' : '待机'}
                          </span>
                        </td>
                        <td className="py-2 px-4">{b.temperature}°C</td>
                        <td className="py-2 px-4">{b.voltage.toFixed(2)}V</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-50 text-xxs text-slate-400 flex items-center justify-between">
            <span>锂电池自放电保护芯片：已激活</span>
            <span>更新频率：1.0 Hz (时序自校准)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
