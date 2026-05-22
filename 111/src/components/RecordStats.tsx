import React from 'react';
import { CyclingRecord } from '../types';
import { Award, Zap, Compass, AlertTriangle, TrendingUp, Sparkles } from 'lucide-react';

interface RecordStatsProps {
  records: CyclingRecord[];
}

export default function RecordStats({ records }: RecordStatsProps) {
  // Aggregate Stats
  const totalRides = records.length;
  const totalDistance = records.reduce((sum, r) => sum + r.distanceKm, 0);
  const totalCalories = records.reduce((sum, r) => sum + r.caloriesBurnt, 0);
  const totalSeconds = records.reduce((sum, r) => sum + r.durationSeconds, 0);
  const totalElevation = records.reduce((sum, r) => sum + r.elevationGainM, 0);
  
  const avgSafetyScore = totalRides > 0 
    ? Math.round(records.reduce((sum, r) => sum + r.safetyScore, 0) / totalRides) 
    : 100;

  const totalOverspeeds = records.reduce((sum, r) => sum + r.overspeedCount, 0);

  // Convert duration to friendly text
  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}小时${minutes}分` : `${minutes}分`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {/* Total Distance Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800/80 shadow-md hover:border-emerald-500/30 transition-all group">
        <div className="flex justify-between items-start">
          <span className="text-[11px] font-medium text-slate-400 font-sans">累计距离</span>
          <div className="bg-emerald-500/10 p-1.5 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
            <Compass className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white mb-0.5">
            {totalDistance.toFixed(1)}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">KILOMETERS (KM)</div>
        </div>
      </div>

      {/* Aggregate Rides Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800/80 shadow-md hover:border-emerald-500/30 transition-all group">
        <div className="flex justify-between items-start">
          <span className="text-[11px] font-medium text-slate-400 font-sans">骑行频次</span>
          <div className="bg-cyan-500/10 p-1.5 rounded-lg text-cyan-400 group-hover:scale-110 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white mb-0.5">
            {totalRides}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">TOTAL RIDES</div>
        </div>
      </div>

      {/* Calories Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800/80 shadow-md hover:border-emerald-500/30 transition-all group">
        <div className="flex justify-between items-start">
          <span className="text-[11px] font-medium text-slate-400 font-sans">累计卡路里</span>
          <div className="bg-amber-500/10 p-1.5 rounded-lg text-amber-500 group-hover:scale-110 transition-transform">
            <Zap className="w-4 h-4 fill-amber-500/20" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white mb-0.5">
            {totalCalories}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">CALORIES (KCAL)</div>
        </div>
      </div>

      {/* Duration Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800/80 shadow-md hover:border-emerald-500/30 transition-all group">
        <div className="flex justify-between items-start">
          <span className="text-[11px] font-medium text-slate-400 font-sans">累计时间</span>
          <div className="bg-blue-500/10 p-1.5 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-lg sm:text-xl font-extrabold font-mono tracking-tight text-white mb-2 leading-none">
            {formatTotalTime(totalSeconds)}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">TOTAL DURATION</div>
        </div>
      </div>

      {/* Elevation Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800/80 shadow-md hover:border-emerald-500/30 transition-all group">
        <div className="flex justify-between items-start">
          <span className="text-[11px] font-medium text-slate-400 font-sans">累计爬升</span>
          <div className="bg-purple-500/10 p-1.5 rounded-lg text-purple-400 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white mb-0.5">
            {totalElevation}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">ALTITUDE GAIN M</div>
        </div>
      </div>

      {/* Safety Index Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800/80 shadow-md hover:border-emerald-500/30 transition-all group col-span-2 sm:col-span-1">
        <div className="flex justify-between items-start">
          <span className="text-[11px] font-medium text-slate-400 font-sans">综合安全评分</span>
          <div className={`p-1.5 rounded-lg group-hover:scale-110 transition-transform ${
            avgSafetyScore >= 90 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          }`}>
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
              avgSafetyScore >= 90 ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {avgSafetyScore}
            </span>
            <span className="text-[10px] font-sans text-slate-500">
              ({totalOverspeeds > 0 ? `超速 ${totalOverspeeds}次` : '完美驾驶'})
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">SAFETY RATING INDEX</div>
        </div>
      </div>
    </div>
  );
}
