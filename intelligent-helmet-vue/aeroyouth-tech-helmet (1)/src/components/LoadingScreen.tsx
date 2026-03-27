import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export default function LoadingScreen({ onComplete }: { onComplete: () => void; key?: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 2500; // 2.5 seconds loading
    const interval = 30;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      // Easing function for progress (fast start, slow end)
      const t = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - t, 4);
      const newProgress = Math.min(Math.floor(easeOutQuart * 100), 100);
      
      setProgress(newProgress);

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(onComplete, 500); // Wait a bit at 100% before exiting
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white overflow-hidden"
      initial={{ y: 0 }}
      exit={{ 
        y: '-100%', 
        transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
      }}
    >
      {/* Background Tech Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent" />
        <div className="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent" />
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-8">
        {/* Number */}
        <div className="text-7xl md:text-8xl font-mono font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 mb-6 tracking-tighter flex items-baseline">
          {progress.toString().padStart(3, '0')}
          <span className="text-cyan-400 text-4xl md:text-5xl ml-1">%</span>
        </div>

        {/* Progress Bar Container - Slanted */}
        <div 
          className="w-full h-3 bg-slate-800 relative overflow-hidden" 
          style={{ clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)' }}
        >
          {/* Progress Fill */}
          <motion.div 
            className="absolute top-0 left-0 h-full bg-cyan-400"
            style={{ width: `${progress}%` }}
            layout
          />
        </div>
        
        {/* Tech decorative text */}
        <div className="w-full flex justify-between mt-4 text-[10px] md:text-xs font-mono text-slate-500 uppercase tracking-[0.2em]">
          <span>Sys.Init_V2.0</span>
          <span className="text-cyan-500/80 animate-pulse">Loading_Assets...</span>
        </div>
      </div>
    </motion.div>
  );
}
