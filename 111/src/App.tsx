import React, { useState, useEffect } from 'react';
import { CyclingRecord } from './types';
import { MOCK_RECORDS } from './data/mockRecords';
import RecordStats from './components/RecordStats';
import RecordItem from './components/RecordItem';
import AddRecordModal from './components/AddRecordModal';
import { Plus, Search, RotateCcw, Activity, Github, Filter, Compass } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'cycling_records_data_v1';

export default function App() {
  const [records, setRecords] = useState<CyclingRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>('rec-1'); // Expanded first item as default preview
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  // Synchronize storage persistence
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading records from local storage', e);
        setRecords(MOCK_RECORDS);
      }
    } else {
      setRecords(MOCK_RECORDS);
    }
  }, []);

  const saveToStorage = (newRecords: CyclingRecord[]) => {
    setRecords(newRecords);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newRecords));
  };

  const handleAddRecord = (record: CyclingRecord) => {
    const updated = [record, ...records];
    saveToStorage(updated);
    // Auto-expand the newly created record for smooth feedback
    setExpandedId(record.id);
  };

  const handleDeleteRecord = (id: string) => {
    const updated = records.filter(r => r.id !== id);
    saveToStorage(updated);
    if (expandedId === id) {
      setExpandedId(null);
    }
  };

  const handleResetToPresets = () => {
    if (window.confirm('警告: 确定要重置当前数据，恢复为官方初始示范数据吗？这将丢失您自主添加的记录。')) {
      saveToStorage(MOCK_RECORDS);
      setExpandedId('rec-1');
      setSearchQuery('');
      setSelectedDifficulty('All');
    }
  };

  // Filtering records based on user search query and selected difficulty
  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          record.date.includes(searchQuery);
    const matchesDifficulty = selectedDifficulty === 'All' || record.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Decorative Sporty Top Grid Ambient Glow Header */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-emerald-500/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none z-0"></div>

      {/* Primary Dashboard Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6 sm:gap-8 relative z-10">
        
        {/* Navigation / Header Brand Bar */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-400 to-cyan-500 p-2.5 rounded-2xl shadow-lg shadow-emerald-500/20 text-slate-950 font-bold shrink-0">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5 font-sans">
                  SPARK <span className="text-emerald-400 font-normal">骑行轨迹综合记测仪</span>
                </h1>
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border border-emerald-500/20">
                  v2.5 Full
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                POWERED BY HIGH-PRECISION GPS TRAJECTORY COMPASS & SAFETY TELEMETRY
              </p>
            </div>
          </div>

          {/* Quick Database Controller Operations */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleResetToPresets}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-medium transition-colors"
              title="复位默认示范记录"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置示范数据</span>
            </button>
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4.5 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-400/15 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>新建骑行行程</span>
            </button>
          </div>
        </header>

        {/* Dynamic Bento Stats Overview Bar */}
        <section className="animate-fade-in">
          <RecordStats records={records} />
        </section>

        {/* Main Interface Split Area */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Controls Box Overlay & Record Lists Accordions */}
          <div className="lg:col-span-12 flex flex-col gap-4">
            
            {/* Live Filter control segment */}
            <div className="bg-slate-900/40 border border-slate-800/80 p-3 sm:p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Left Search input filter */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="搜索骑行活动名称或日期 (e.g. 崇明、2026)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-600"
                />
              </div>

              {/* Right Filter categories pill box */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end shrink-0">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Filter className="w-3.5 h-3.5" />
                  <span>拉练难度:</span>
                </div>
                <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {['All', 'Easy', 'Medium', 'Hard'].map((diff) => {
                    const label = diff === 'All' ? '全部' : diff === 'Easy' ? '轻松' : diff === 'Medium' ? '中效' : '极限';
                    const isActive = selectedDifficulty === diff;
                    return (
                      <button
                        key={diff}
                        onClick={() => setSelectedDifficulty(diff)}
                        className={`text-xs px-2.5 py-1 rounded-lg transition-all font-medium ${
                          isActive 
                            ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/15' 
                            : 'text-slate-400 hover:text-white border border-transparent'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Expansible List Section */}
            <div className="flex flex-col gap-3.5">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <RecordItem
                    key={record.id}
                    record={record}
                    isExpanded={expandedId === record.id}
                    onToggle={() => setExpandedId(expandedId === record.id ? null : record.id)}
                    onDelete={handleDeleteRecord}
                  />
                ))
              ) : (
                <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center bg-slate-900/10">
                  <span className="text-4xl filter grayscale mb-3 animate-bounce">🚴‍♀️</span>
                  <h5 className="font-bold text-slate-300 text-sm">未能匹配到骑行档案</h5>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    当前查询下无匹配的条目。建议您更新筛选条件，或者点击右上角自主添加一条崭新的行程进行轨迹模拟。
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDifficulty('All');
                    }}
                    className="mt-4 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white rounded-xl text-xs text-slate-400 transition-colors"
                  >
                    重置筛选条件
                  </button>
                </div>
              )}
            </div>

          </div>

        </main>

        {/* Persistent Micro Status Footer */}
        <footer className="mt-8 border-t border-slate-900 pt-6 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            <span>骑行记测仪终端正常在线中 · UTC: 2026-05-22</span>
          </div>
          <div>
            <span>PRO STYLE VECTOR COMPASS DASHBOARD</span>
          </div>
        </footer>

      </div>

      {/* Manual Input Record Dialog Modal */}
      {isModalOpen && (
        <AddRecordModal
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddRecord}
        />
      )}

    </div>
  );
}
