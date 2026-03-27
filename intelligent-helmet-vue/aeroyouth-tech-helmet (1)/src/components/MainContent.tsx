import { motion } from 'motion/react';
import ModelShowcase from './ModelShowcase';

export default function MainContent() {
  // Animation variants for staggered children (Hero)
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.4,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] } },
  };

  // Animation variants for scroll sections
  const scrollSectionVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        ease: [0.25, 1, 0.5, 1],
        staggerChildren: 0.1,
        delayChildren: 0.1
      } 
    }
  };

  const scrollItemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] } }
  };

  return (
    <motion.div
      className="relative min-h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden"
      initial={{ scale: 1.05, opacity: 0, filter: 'blur(8px)' }}
      animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.1 }}
    >
      {/* Tech Background Grid & Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] fixed" 
           style={{ backgroundImage: 'linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* Crosshairs (Fixed) */}
      <div className="fixed top-32 left-8 w-4 h-4 border-t border-l border-slate-400 opacity-50 pointer-events-none z-0" />
      <div className="fixed top-32 right-8 w-4 h-4 border-t border-r border-slate-400 opacity-50 pointer-events-none z-0" />
      <div className="fixed bottom-8 left-8 w-4 h-4 border-b border-l border-slate-400 opacity-50 pointer-events-none z-0" />
      <div className="fixed bottom-8 right-8 w-4 h-4 border-b border-r border-slate-400 opacity-50 pointer-events-none z-0" />

      {/* Navigation Bar */}
      <header className="fixed top-0 left-0 w-full h-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-md z-40 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-12">
          {/* Logo */}
          <div className="text-2xl font-black tracking-tighter text-slate-900 flex items-center gap-2 cursor-pointer">
            <div className="w-6 h-6 bg-cyan-500" style={{ clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)' }} />
            AERO<span className="text-cyan-500">YOUTH</span>
          </div>
          
          {/* Nav Links */}
          <nav className="hidden lg:flex gap-8 text-xs font-bold tracking-[0.15em] uppercase text-slate-500">
            <a href="#" className="text-slate-900 relative after:content-[''] after:absolute after:-bottom-7 after:left-0 after:w-full after:h-1 after:bg-cyan-500">Overview</a>
            <a href="#architecture" className="hover:text-cyan-600 transition-colors">Architecture</a>
            <a href="#" className="hover:text-cyan-600 transition-colors">Safety</a>
            <a href="#" className="hover:text-cyan-600 transition-colors">Specs</a>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end text-[9px] font-mono text-slate-400 uppercase tracking-widest">
            <span>Status: Online</span>
            <span className="text-cyan-500">Ver 2.0.4</span>
          </div>
          <button className="relative px-8 py-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-cyan-500 transition-colors group" 
                  style={{ clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)' }}>
            <span className="relative z-10">Pre-order</span>
            {/* Hover Glitch Effect */}
            <div className="absolute inset-0 bg-cyan-400 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out" style={{ clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)' }} />
            <span className="relative z-10 group-hover:text-slate-900 transition-colors duration-300 delay-75">Pre-order</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 px-6 md:px-12 max-w-[1600px] mx-auto min-h-screen flex flex-col lg:flex-row items-center justify-between gap-12 z-10">
        
        {/* Left Content */}
        <motion.div 
          className="flex-1 w-full"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-4 mb-6">
            <div className="inline-block px-3 py-1 border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 text-[10px] font-mono font-bold uppercase tracking-widest">
              SYS.01 // Next Gen
            </div>
            <div className="h-[1px] w-12 bg-slate-300" />
            <span className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">Youth Cycling Series</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-6xl md:text-7xl lg:text-[5.5rem] font-black tracking-tighter leading-[0.85] mb-8 text-slate-900 uppercase">
            Absolute <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 relative inline-block mt-2">
              Protection
              {/* Decorative cut on text */}
              <div className="absolute -right-4 top-0 w-2 h-full bg-cyan-500" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-base md:text-lg text-slate-500 max-w-xl font-medium leading-relaxed mb-10">
            Engineered for the next generation of riders. The AeroYouth combines aerospace-grade lightweight materials with a high-density EPS core. Extreme safety meets geek-chic aesthetics.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-6">
            <button className="px-8 py-4 bg-cyan-500 text-slate-900 text-sm font-bold uppercase tracking-widest hover:bg-cyan-400 transition-colors flex items-center gap-3"
                    style={{ clipPath: 'polygon(16px 0, 100% 0, calc(100% - 16px) 100%, 0 100%)' }}>
              Explore Features
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            
            <div className="flex flex-col text-[10px] font-mono text-slate-400 uppercase tracking-widest border-l-2 border-slate-200 pl-4">
              <span className="text-slate-900 font-bold text-lg">240g</span>
              <span>Ultra-lightweight</span>
            </div>
            <div className="flex flex-col text-[10px] font-mono text-slate-400 uppercase tracking-widest border-l-2 border-slate-200 pl-4">
              <span className="text-slate-900 font-bold text-lg">CPSC</span>
              <span>Certified Safe</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Content - Product Showcase Placeholder */}
        <motion.div 
          className="flex-1 relative w-full h-[500px] lg:h-[700px] flex items-center justify-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.25, 1, 0.5, 1] }}
        >
          {/* Tech Rings Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full border border-slate-200/60 absolute animate-[spin_60s_linear_infinite]" />
            <div className="w-[400px] h-[400px] md:w-[650px] md:h-[650px] rounded-full border border-dashed border-slate-200/80 absolute animate-[spin_90s_linear_infinite_reverse]" />
            {/* Cyan accent ring */}
            <div className="w-[250px] h-[250px] md:w-[400px] md:h-[400px] rounded-full border-t border-r border-cyan-400/30 absolute animate-[spin_20s_linear_infinite]" />
          </div>

          {/* Product Image Placeholder */}
          <div className="relative z-10 w-full max-w-md aspect-square">
            <img 
              src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1000&bg=f8fafc" 
              alt="AeroYouth Helmet Placeholder" 
              className="w-full h-full object-contain drop-shadow-2xl mix-blend-darken"
              referrerPolicy="no-referrer"
            />
            
            {/* Floating Tech Labels */}
            <motion.div 
              className="absolute top-1/4 -right-8 md:-right-16 bg-white/90 backdrop-blur-sm border border-slate-200 p-3 shadow-xl"
              style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <div className="text-[9px] font-mono text-cyan-600 uppercase tracking-widest mb-1">Material</div>
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">Polycarbonate Shell</div>
            </motion.div>

            <motion.div 
              className="absolute bottom-1/4 -left-8 md:-left-16 bg-white/90 backdrop-blur-sm border border-slate-200 p-3 shadow-xl"
              style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
            >
              <div className="text-[9px] font-mono text-cyan-600 uppercase tracking-widest mb-1">Ventilation</div>
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">14 Airflow Vents</div>
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* 3D Model Showcase */}
      <ModelShowcase />

      {/* Step C: Scroll Features Section (Bento Grid) */}
      <section id="architecture" className="relative py-32 px-6 md:px-12 max-w-[1600px] mx-auto z-10">
        <motion.div 
          className="mb-16"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={scrollSectionVariants}
        >
          <motion.div variants={scrollItemVariants} className="flex items-center gap-4 mb-4">
            <div className="w-2 h-2 bg-cyan-500" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
            <span className="text-[10px] font-mono text-cyan-600 tracking-widest uppercase">Sys.02 // Architecture</span>
          </motion.div>
          <motion.h2 variants={scrollItemVariants} className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-900 uppercase">
            Core <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">Modules</span>
          </motion.h2>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-12 gap-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={scrollSectionVariants}
        >
          {/* Feature 1: Aerodynamics (Large Card) */}
          <motion.div variants={scrollItemVariants} className="md:col-span-8 bg-white border border-slate-200 p-8 md:p-12 relative group overflow-hidden" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%)' }}>
            {/* Hover Tech Corners */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-12">
                <div className="text-5xl font-black text-slate-100">01</div>
                <div className="px-2 py-1 bg-slate-900 text-cyan-400 text-[9px] font-mono uppercase tracking-widest">Active</div>
              </div>
              <div>
                <h3 className="text-2xl font-bold uppercase tracking-tight mb-3 text-slate-900">Aero-Flow Dynamics</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-md">
                  14 precisely engineered vents channel air through the helmet, reducing drag by 18% while maintaining optimal thermal regulation during intense rides.
                </p>
              </div>
            </div>
            {/* Decorative background shape */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-slate-50 rounded-full border border-slate-100 group-hover:scale-110 transition-transform duration-700 ease-out" />
          </motion.div>

          {/* Feature 2: Magnetic Buckle (Small Card, Dark) */}
          <motion.div variants={scrollItemVariants} className="md:col-span-4 bg-slate-900 text-white p-8 md:p-12 relative group overflow-hidden" style={{ clipPath: 'polygon(24px 0, 100% 0, 100% 100%, 0 100%, 0 24px)' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="text-5xl font-black text-slate-800 mb-12">02</div>
              <div>
                <h3 className="text-xl font-bold uppercase tracking-tight mb-3 text-white">Fidlock® Snap</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  One-handed magnetic fastening system. Secure lock in milliseconds, effortless release.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Feature 3: Reflective (Small Card) */}
          <motion.div variants={scrollItemVariants} className="md:col-span-4 bg-white border border-slate-200 p-8 md:p-12 relative group overflow-hidden">
            <div className="absolute top-4 right-4 w-2 h-2 bg-cyan-500 animate-pulse" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="text-5xl font-black text-slate-100 mb-12">03</div>
              <div>
                <h3 className="text-xl font-bold uppercase tracking-tight mb-3 text-slate-900">360° Visibility</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Integrated micro-prismatic reflective decals ensure maximum visibility in low-light urban environments.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Feature 4: EPS Core (Large Card) */}
          <motion.div variants={scrollItemVariants} className="md:col-span-8 bg-slate-100 border border-slate-200 p-8 md:p-12 relative group overflow-hidden" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 24px 100%, 0 calc(100% - 24px))' }}>
            {/* Blueprint grid background */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-12">
                <div className="text-5xl font-black text-white drop-shadow-sm">04</div>
                <div className="px-2 py-1 border border-cyan-500 text-cyan-600 text-[9px] font-mono uppercase tracking-widest bg-white/50 backdrop-blur-sm">Core</div>
              </div>
              <div className="flex flex-col md:flex-row gap-8 items-end justify-between">
                <div className="max-w-md">
                  <h3 className="text-2xl font-bold uppercase tracking-tight mb-3 text-slate-900">High-Density EPS Matrix</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Multi-density impact absorption foam engineered to disperse kinetic energy across the entire shell structure upon impact.
                  </p>
                </div>
                {/* Tech graphic placeholder */}
                <div className="w-32 h-32 border-2 border-cyan-500/30 rounded-full flex items-center justify-center relative group-hover:border-cyan-500 transition-colors duration-500">
                  <div className="w-24 h-24 border border-dashed border-cyan-500/50 rounded-full animate-[spin_10s_linear_infinite]" />
                  <div className="absolute text-[10px] font-mono text-cyan-600 font-bold">IMPACT</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </motion.div>
  );
}

