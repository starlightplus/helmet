import { useState, useEffect, useMemo } from 'react';
import { 
  initialBatteryData, 
  initialRidingData, 
  initialHeartRateDays, 
  BatteryRecord, 
  RidingRecord, 
  DayHeartRate, 
  HeartRateRecord 
} from './types';
import BatteryDashboard from './components/BatteryDashboard';
import RidingDashboard from './components/RidingDashboard';
import HeartRateDashboard from './components/HeartRateDashboard';
import { 
  LayoutDashboard, 
  Battery, 
  Bike, 
  Heart, 
  Zap, 
  Flame, 
  Trophy, 
  ArrowUpRight, 
  Activity, 
  Gauge, 
  RefreshCw,
  Clock,
  Compass,
  CornerDownRight
} from 'lucide-react';

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'battery' | 'riding' | 'heartrate'>('overview');

  // Telemetry data states with local storage sync or default fallback
  const [batteryRecords, setBatteryRecords] = useState<BatteryRecord[]>([]);
  const [ridingRecords, setRidingRecords] = useState<RidingRecord[]>([]);
  const [heartRateDays, setHeartRateDays] = useState<DayHeartRate[]>([]);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  // Hydrate data from localStorage or initial statics on mount
  useEffect(() => {
    const savedBattery = localStorage.getItem('velo_battery');
    const savedRiding = localStorage.getItem('velo_riding');
    const savedHr = localStorage.getItem('velo_heartrate');

    if (savedBattery) {
      setBatteryRecords(JSON.parse(savedBattery));
    } else {
      setBatteryRecords(initialBatteryData);
    }

    if (savedRiding) {
      setRidingRecords(JSON.parse(savedRiding));
    } else {
      setRidingRecords(initialRidingData);
    }

    if (savedHr) {
      setHeartRateDays(JSON.parse(savedHr));
    } else {
      setHeartRateDays(initialHeartRateDays);
    }

    // Set interactive real-time clock
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save states helper functions
  const saveBattery = (data: BatteryRecord[]) => {
    setBatteryRecords(data);
    localStorage.setItem('velo_battery', JSON.stringify(data));
  };

  const saveRiding = (data: RidingRecord[]) => {
    setRidingRecords(data);
    localStorage.setItem('velo_riding', JSON.stringify(data));
  };

  const saveHr = (data: DayHeartRate[]) => {
    setHeartRateDays(data);
    localStorage.setItem('velo_heartrate', JSON.stringify(data));
  };

  // State modifiers
  const handleAddBatteryRecord = (record: BatteryRecord) => {
    const sorted = [...batteryRecords, record].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    saveBattery(sorted);
  };

  const handleClearBattery = () => {
    saveBattery([]);
  };

  const handleResetBattery = () => {
    saveBattery(initialBatteryData);
  };

  const handleAddRidingRecord = (record: RidingRecord) => {
    const sorted = [...ridingRecords, record].sort((a, b) => a.date.localeCompare(b.date));
    saveRiding(sorted);
  };

  const handleClearRiding = () => {
    saveRiding([]);
  };

  const handleResetRiding = () => {
    saveRiding(initialRidingData);
  };

  const handleUpdateHrDayData = (date: string, updatedData: HeartRateRecord[]) => {
    const updated = heartRateDays.map((day) => {
      if (day.date === date) {
        return { ...day, data: updatedData };
      }
      return day;
    });
    saveHr(updated);
  };

  const handleResetHr = () => {
    saveHr(initialHeartRateDays);
  };

  // Global reset for everything
  const handleGlobalReset = () => {
    saveBattery(initialBatteryData);
    saveRiding(initialRidingData);
    saveHr(initialHeartRateDays);
  };

  // Derived summaries for home overview cards
  const latestBattery = useMemo(() => {
    if (batteryRecords.length === 0) return { percentage: 0, status: 'discharging' };
    return batteryRecords[batteryRecords.length - 1];
  }, [batteryRecords]);

  const ridingTotals = useMemo(() => {
    let distSum = 0;
    let calSum = 0;
    let activeDays = 0;
    let todayDistance = 0;
    let todayCalories = 0;

    ridingRecords.forEach((r) => {
      distSum += r.distance;
      calSum += r.calories;
      if (r.distance > 0) activeDays++;
    });

    // Get latest active ride for overview display
    const latestRide = ridingRecords[ridingRecords.length - 1];
    if (latestRide) {
      todayDistance = latestRide.distance;
      todayCalories = latestRide.calories;
    }

    return {
      totalDistance: parseFloat(distSum.toFixed(1)),
      totalCalories: calSum,
      activeDays,
      todayDistance,
      todayCalories
    };
  }, [ridingRecords]);

  const latestHeartRate = useMemo(() => {
    // Pick the most recent day in state
    const todayHrDay = heartRateDays[0];
    if (!todayHrDay || todayHrDay.data.length === 0) return { avg: 72, max: 72 };
    
    const countArr = todayHrDay.data.map(d => d.bpm);
    const sum = countArr.reduce((a, b) => a + b, 0);
    const avg = Math.round(sum / countArr.length);
    const max = Math.max(...countArr);
    return { avg, max };
  }, [heartRateDays]);

  return (
    <div id="root-container" className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased pb-12">
      
      {/* Premium Top Status Banner */}
      <header id="app-header" className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand Brand Section */}
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-md shadow-indigo-200">
              <Bike className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 bg-gradient-to-r from-slate-950 via-indigo-950 to-indigo-950 bg-clip-text text-transparent">
                  VELO Telemetry
                </span>
                <span className="px-2 py-0.5 text-xxs font-bold uppercase tracking-wider bg-indigo-50 border border-indigo-100/80 rounded-full text-indigo-600">
                  v3.5 Studio
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">智能行车遥测数据可视化决策分析中心</p>
            </div>
          </div>

          {/* Real-time stats HUD inside the navbar header */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-50/50 border border-slate-100 p-1.5 rounded-2xl text-xs font-semibold text-slate-500 font-mono">
            {/* Battery Indicator badge */}
            <div 
              onClick={() => setActiveTab('battery')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl cursor-pointer transition-all hover:bg-white`}>
              <span className={`w-2 h-2 rounded-full ${latestBattery.percentage > 20 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-ping'}`} />
              <span className="font-sans text-slate-400">电量:</span>
              <span className="text-slate-800 font-bold">{latestBattery.percentage}%</span>
            </div>

            {/* Riding sum helper badge */}
            <div 
              onClick={() => setActiveTab('riding')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl cursor-pointer transition-all hover:bg-white border-l border-slate-200">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="font-sans text-slate-400">里程:</span>
              <span className="text-slate-800 font-bold">{ridingTotals.totalDistance} km</span>
            </div>

            {/* HR sensor status badge */}
            <div 
              onClick={() => setActiveTab('heartrate')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl cursor-pointer transition-all hover:bg-white border-l border-slate-200">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="font-sans text-slate-400">心率:</span>
              <span className="text-slate-800 font-bold">{latestHeartRate.avg} BPM</span>
            </div>

            <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 border-l border-slate-200 font-sans text-slate-400 font-medium select-none">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-mono text-slate-600">{currentTimeStr || '16:26'}</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Navigation Tabs Bar */}
        <div id="navigation-tabs" className="grid grid-cols-4 sm:flex sm:items-center sm:space-x-2 gap-1 bg-slate-200/50 p-1 rounded-2xl border border-slate-200/30 mb-6 shadow-2xs">
          <button
            id="tab-overview"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center justify-center space-x-1 sm:space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-600" />
            <span className="truncate">总览视图</span>
          </button>

          <button
            id="tab-battery"
            onClick={() => setActiveTab('battery')}
            className={`flex items-center justify-center space-x-1 sm:space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              activeTab === 'battery'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <Battery className="w-4 h-4 text-emerald-500" />
            <span className="truncate">电量监控</span>
          </button>

          <button
            id="tab-riding"
            onClick={() => setActiveTab('riding')}
            className={`flex items-center justify-center space-x-1 sm:space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              activeTab === 'riding'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <Bike className="w-4 h-4 text-blue-500" />
            <span className="truncate">骑行能耗</span>
          </button>

          <button
            id="tab-heartrate"
            onClick={() => setActiveTab('heartrate')}
            className={`flex items-center justify-center space-x-1 sm:space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              activeTab === 'heartrate'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span className="truncate">整点心率</span>
          </button>
        </div>

        {/* Dynamic Pages Area Rendering */}
        <div id="dynamic-viewport" className="transition-opacity duration-300">
          
          {/* TAB 1: OVERVIEW HUD HUB */}
          {activeTab === 'overview' && (
            <div id="view-overview" className="space-y-6">
              
              {/* Primary Dashboard Welcome Hero banner grid */}
              <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-6 sm:p-8 rounded-3xl border border-indigo-950/80 shadow-md text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6 overflow-hidden relative">
                <div className="absolute right-0 -bottom-10 opacity-10 uppercase font-extrabold tracking-wider leading-none text-9xl pointer-events-none font-mono">
                  VELO
                </div>
                <div className="space-y-2.5 relative">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/10 border border-white/15 rounded-xl text-xxs font-semibold uppercase text-indigo-200">
                    <Compass className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    <span>行车卫仪在线同步中</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    今天已经骑行了 <span className="text-indigo-400 underline decoration-indigo-300/60 font-mono">{ridingTotals.todayDistance}</span> 公里 !
                  </h1>
                  <p className="text-xs text-indigo-200 leading-relaxed max-w-xl">
                    仪表统计您手头的智能单车，集成高保真传感器。全天电磁功耗曲线平滑度正常；心脏血灌能动比正常；已达成今日周期的骑行能量指标。
                  </p>
                </div>
                <div className="flex space-x-2 relative shrink-0">
                  <button
                    id="btn-quick-reset"
                    onClick={handleGlobalReset}
                    className="flex items-center space-x-1.5 py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    title="重置全部数据到初始预设状态"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>一键重组预设</span>
                  </button>
                </div>
              </div>

              {/* Three detailed sub-panels card-grid linking deep to tabs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Visual block 1: Battery Summary */}
                <div 
                  id="overview-link-battery"
                  className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-500 group-hover:bg-emerald-100 transition-colors">
                        <Battery className="w-5 h-5" />
                      </div>
                      <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest">SUBPAGE 1</span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-slate-400">电量指示监控</h4>
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-3xl font-extrabold text-slate-800 font-mono">{latestBattery.percentage}%</span>
                        <span className="text-xs font-bold text-slate-500 uppercase">{latestBattery.status === 'charging' ? '充电中' : '放电正常'}</span>
                      </div>
                    </div>

                    {/* Progress slider bar to visualize quickly */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            latestBattery.percentage > 50 ? 'bg-emerald-500' : latestBattery.percentage > 20 ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'
                          }`}
                          style={{ width: `${latestBattery.percentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xxs text-slate-400 font-mono">
                        <span>0%</span>
                        <span>锂芯物理电压: {latestBattery.voltage?.toFixed(2)}V</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 mt-4 flex items-center justify-between">
                    <button 
                      id="btn-goto-battery"
                      onClick={() => setActiveTab('battery')}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-0.5 cursor-pointer"
                    >
                      <span>进入电量分析</span>
                      <ArrowUpRight className="w-3.5 h-3.5 object-contain" />
                    </button>
                    <span className="text-xxs text-slate-400">21 条采样时段</span>
                  </div>
                </div>

                {/* Visual block 2: Workouts Summary */}
                <div 
                  id="overview-link-riding"
                  className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 bg-blue-50 rounded-2xl border border-blue-100 text-blue-500 group-hover:bg-blue-100 transition-colors">
                        <Bike className="w-5 h-5" />
                      </div>
                      <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest">SUBPAGE 2</span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-slate-400">骑行里程与能耗</h4>
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-3xl font-extrabold text-slate-800 font-mono">{ridingTotals.totalDistance}</span>
                        <span className="text-xs font-bold text-slate-500">公里 / 累计大盘</span>
                      </div>
                    </div>

                    {/* Quick values grid list */}
                    <div className="grid grid-cols-2 gap-2 text-xxs text-slate-500 bg-slate-50 p-2 rounded-xl">
                      <div className="flex items-center space-x-1">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        <span>卡里耗能: <strong>{ridingTotals.totalCalories} kcal</strong></span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                        <span>运动频次: <strong>{ridingTotals.activeDays} 天</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 mt-4 flex items-center justify-between">
                    <button 
                      id="btn-goto-riding"
                      onClick={() => setActiveTab('riding')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-0.5 cursor-pointer"
                    >
                      <span>进入骑行分析</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xxs text-slate-400">14 天运动采样</span>
                  </div>
                </div>

                {/* Visual block 3: Heart Rate Summary */}
                <div 
                  id="overview-link-heartrate"
                  className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 bg-rose-50 rounded-2xl border border-rose-100 text-rose-500 group-hover:bg-rose-100 transition-colors">
                        <Heart className="w-5 h-5 fill-rose-500/10" />
                      </div>
                      <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest">SUBPAGE 3</span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-slate-400">整点心率波动</h4>
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-3xl font-extrabold text-slate-800 font-mono">{latestHeartRate.avg}</span>
                        <span className="text-xs font-bold text-slate-500">BPM / 均值心胸比</span>
                      </div>
                    </div>

                    {/* Simple bar zones indicator */}
                    <div className="flex items-center space-x-2 text-xxs bg-rose-25 rounded-xl border border-rose-100/40 p-2 text-rose-700">
                      <Activity className="w-4 h-4 text-rose-500 shrink-0 select-none animate-pulse" />
                      <span>今日最大峰值：<strong>{latestHeartRate.max} BPM</strong>，有氧带占比约 21%</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 mt-4 flex items-center justify-between">
                    <button 
                      id="btn-goto-heartrate"
                      onClick={() => setActiveTab('heartrate')}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center space-x-0.5 cursor-pointer"
                    >
                      <span>进入心率分析</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xxs text-slate-400">3 日生理时段段</span>
                  </div>
                </div>

              </div>

              {/* Dynamic Action Tips and Guidelines block */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                  </span>
                  <span>仪表盘交互引导说明 & 技术特性</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 flex items-center space-x-1 text-xs">
                      <CornerDownRight className="w-3.5 h-3.5 text-emerald-500" />
                      <span>1. 电池时序监控逻辑：</span>
                    </h4>
                    <p className="leading-relaxed pl-4">
                      不仅有电量折线演化，还搭载高频充放电负载模拟。点击快速充电或骑行放电，就能模拟实时能耗反馈。也可以手动记录温度、电压极性。
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 flex items-center space-x-1 text-xs">
                      <CornerDownRight className="w-3.5 h-3.5 text-blue-500" />
                      <span>2. 卡路里与距离能动比：</span>
                    </h4>
                    <p className="leading-relaxed pl-4">
                      运动公里数与卡路里有高度的双极对等关系。通过双Y轴的 Recharts 复合大图来展现配比。内置有城市通勤、有氧挑战、百公里运动预设注入，支持 localStorage 持久化。
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 flex items-center space-x-1 text-xs">
                      <CornerDownRight className="w-3.5 h-3.5 text-rose-500" />
                      <span>3. 精心策划心率负荷阶梯：</span>
                    </h4>
                    <p className="leading-relaxed pl-4">
                      针对高训练日的整点生理指标，自动划分ACSM医学燃脂、有氧、无氧极限区间。支持将24小时内任意一整点的心率由滑扭进行精细校正，图形实时响应！
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: BATTERY MONITORING PANEL */}
          {activeTab === 'battery' && (
            <div id="view-battery">
              <BatteryDashboard
                batteryData={batteryRecords}
                onAddRecord={handleAddBatteryRecord}
                onClearRecords={handleClearBattery}
                onResetDefault={handleResetBattery}
              />
            </div>
          )}

          {/* TAB 3: RIDING DISTANCE & CALORIE BURN */}
          {activeTab === 'riding' && (
            <div id="view-riding">
              <RidingDashboard
                ridingData={ridingRecords}
                onAddRecord={handleAddRidingRecord}
                onClearRecords={handleClearRiding}
                onResetDefault={handleResetRiding}
              />
            </div>
          )}

          {/* TAB 4: HOURLY HEART RATE FREQUENCY */}
          {activeTab === 'heartrate' && (
            <div id="view-heartrate">
              <HeartRateDashboard
                heartRateDays={heartRateDays}
                onUpdateDayData={handleUpdateHrDayData}
                onResetDefault={handleResetHr}
              />
            </div>
          )}

        </div>
      </main>

      {/* Global Dashboard Footer Credits */}
      <footer id="app-footer" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-200 text-center text-slate-400 text-xxs flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div>
          <span>微电及心脏多参数遥测软件系统 · 基于 React 19 & Tailwind v4</span>
        </div>
        <div>
          <span>© 1.0 版（已激活离线运行高速同步）</span>
        </div>
      </footer>

    </div>
  );
}
