import React from 'react';
import { CyclingRecord } from '../types';
import RouteMap from './RouteMap';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, ChevronUp, Calendar, Clock, Gauge, Flame, 
  Thermometer, Droplets, ShieldAlert, Award, Trash2 
} from 'lucide-react';

interface RecordItemProps {
  record: CyclingRecord;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: (id: string) => void;
}

export default function RecordItem({ record, isExpanded, onToggle, onDelete }: RecordItemProps) {
  // Convert duration to hours/minutes
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) {
      return `${hrs}小时${mins}分钟`;
    }
    return `${mins}分钟`;
  };

  // Pace calculations: mins/km (e.g., 2.5 min/km = 2'30" / km)
  // Avg speed = Km/h.  Mins per Km = 60 / AvgSpeed
  const getPaceString = (avgSpeedKmh: number) => {
    if (!avgSpeedKmh || avgSpeedKmh === 0) return `--'--"`;
    const totalMinutes = 60 / avgSpeedKmh;
    const minutes = Math.floor(totalMinutes);
    const seconds = Math.floor((totalMinutes - minutes) * 60);
    return `${minutes}分${seconds.toString().padStart(2, '0')}秒 / 公里`;
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Medium': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'Hard': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case 'Easy': return '游刃有余';
      case 'Medium': return '中效有氧';
      case 'Hard': return '硬核拉练';
      default: return diff;
    }
  };

  return (
    <div className="bg-slate-900/45 border border-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:border-slate-700/80 transition-all">
      {/* Collapsed Header Option */}
      <div 
        onClick={onToggle}
        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none transition-colors hover:bg-slate-900/60"
      >
        <div className="flex items-center gap-3.5 min-w-0 pr-2">
          {/* Cycle Avatar graphic */}
          <div className="hidden sm:flex bg-slate-800/80 p-2 rounded-xl text-emerald-400 items-center justify-center border border-slate-700/40 shrink-0">
            <span className="text-xl">🚴</span>
          </div>

          <div className="min-w-0 flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-bold text-slate-100 text-sm sm:text-base tracking-normal truncate">
                {record.title}
              </h4>
              <span className={`text-[10px] px-2 py-0.5 border rounded-full font-medium ${getDifficultyColor(record.difficulty)}`}>
                {getDifficultyLabel(record.difficulty)}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> {record.date}
              </span>
              <span className="text-slate-700">•</span>
              <span className="text-emerald-400 font-bold">{record.distanceKm.toFixed(1)} km</span>
            </div>
          </div>
        </div>

        {/* Expand Trigger Icon & Right Stats Quickview */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden md:flex flex-col items-end text-right">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Avg Speed</span>
            <span className="font-mono text-base font-bold text-slate-200">
              {record.avgSpeedKmh.toFixed(1)} <span className="text-xs font-normal text-slate-500">km/h</span>
            </span>
          </div>
          
          <div className="p-1.5 bg-slate-800/60 rounded-lg text-slate-400 hover:text-white transition-colors">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Details Option */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
          >
            <div className="border-t border-slate-800 bg-slate-950/40 p-4 sm:p-6 flex flex-col gap-6">
              
              {/* Stats Bento Breakdown Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                
                {/* 1. Riding Time */}
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex items-start gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">骑行时间段</span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-200 font-mono block mt-0.5">
                      {record.startTime} ~ {record.endTime}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5 bg-slate-800/60 px-1.5 py-0.5 rounded w-max">
                      耗时: {formatDuration(record.durationSeconds)}
                    </span>
                  </div>
                </div>

                {/* 2. Pace */}
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex items-start gap-3">
                  <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg shrink-0 mt-0.5">
                    <Gauge className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">骑行配速 (Pace)</span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-100 font-mono block mt-0.5 truncate" title={getPaceString(record.avgSpeedKmh)}>
                      {getPaceString(record.avgSpeedKmh)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                      平均速度: <strong className="text-cyan-400">{record.avgSpeedKmh.toFixed(1)}</strong> km/h
                    </span>
                  </div>
                </div>

                {/* 3. Calories */}
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex items-start gap-3">
                  <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg shrink-0 mt-0.5">
                    <Flame className="w-4 h-4 fill-amber-500/10" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">消耗卡路里</span>
                    <span className="text-lg sm:text-xl font-black text-slate-100 font-mono block mt-0.5">
                      {record.caloriesBurnt}
                      <span className="text-xs font-normal text-slate-500 ml-1">kcal</span>
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      爬升高度: <strong className="font-mono text-amber-400">{record.elevationGainM}m</strong>
                    </span>
                  </div>
                </div>

                {/* 4. Weather & Air condition */}
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">环境气象数据</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 font-sans tracking-wide px-1.5 py-0.5 rounded">传感器</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-0.5">
                    <div className="flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <div className="font-mono text-xs text-slate-300">
                        <span className="block text-[8px] text-slate-500 leading-none">均温</span>
                        {record.avgTemperature}°C
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <div className="font-mono text-xs text-slate-300">
                        <span className="block text-[8px] text-slate-500 leading-none">均湿</span>
                        {record.avgHumidity}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Overspeed / Speeding alerts */}
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex items-start gap-3 col-span-2 sm:col-span-1">
                  <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    record.overspeedCount > 0 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">超速段次数</span>
                    <span className={`text-base sm:text-lg font-black font-mono block mt-0.5 ${
                      record.overspeedCount > 0 ? 'text-red-400' : 'text-slate-300'
                    }`}>
                      {record.overspeedCount} <span className="text-xs font-normal text-slate-500">次</span>
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">限速阈值: 30km/h</span>
                  </div>
                </div>

                {/* 6. Dynamic Safety score details with deductions reasons list */}
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col gap-2.5 col-span-2 sm:col-span-1 md:col-span-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                      <Award className="w-3.5 h-3.5 text-emerald-400" />
                      <span>骑行安全评分 (Safety Rating)</span>
                    </div>
                    <span className={`text-sm sm:text-base font-extrabold font-mono px-2 py-0.5 rounded-md ${
                      record.safetyScore >= 90 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {record.safetyScore} 分
                    </span>
                  </div>

                  {/* Deduction feedback log */}
                  <div className="flex-1 flex flex-col justify-center">
                    {record.safetyDeductions.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {record.safetyDeductions.map((d, i) => (
                          <div key={i} className="flex justify-between items-center text-[10px] text-slate-400 bg-slate-950 px-2 py-1.5 rounded border border-slate-800/40">
                            <span className="truncate pr-2">⚠️ {d.reason}</span>
                            <span className="text-red-400 font-mono font-medium shrink-0">{d.deduction}分</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] text-emerald-400/90 font-sans tracking-wide bg-emerald-550/5 border border-emerald-500/15 p-2 rounded flex items-center gap-1.5">
                        <span className="animate-pulse">✨</span> 完美行车，未检测到急刹、逆行、超速或转弯离心畸变等扣分隐患。
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Trajectory Map embed */}
              <div>
                <RouteMap points={record.routePoints} title={record.title} />
              </div>

              {/* Danger Zone Actions */}
              <div className="flex justify-end border-t border-slate-800/60 pt-4 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`确定要彻底删除骑行记录“${record.title}”吗？此操作无法恢复。`)) {
                      onDelete(record.id);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-red-950 bg-red-950/20 hover:bg-red-950/40 text-red-400 rounded-lg text-xs transition-colors font-sans hover:border-red-800"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>删除此条骑行档案</span>
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
