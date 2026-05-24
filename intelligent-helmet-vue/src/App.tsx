import { motion } from 'motion/react';
import ParticleBackground from './components/ParticleBackground';
import AuthCard from './components/AuthCard';

export default function App() {
  return (
    <main
      className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto selection:bg-cyan-500/35 selection:text-white"
    >
      {/* Dynamic particles client-rendered backdrop */}
      <ParticleBackground />

      {/* Radial soft background ambient spheres */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-[120px] pointer-events-none z-0" />

      {/* Main Single-screen Content */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center my-auto py-8">
        {/* Animated Brand Identity */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-6"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400 font-mono text-glow-cyan">
            AETHER PLATFORM
          </span>
        </motion.div>

        {/* The Hub Glassmorphic Login Card */}
        <AuthCard id="login_form_card" />

        {/* Minimal Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-[11px] font-mono text-zinc-500 tracking-wider">
            &copy; {new Date().getFullYear()} Aether Workspace, Inc. All handshakes secured.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
