import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Check,
  Cpu,
  MapPin,
  Laptop,
  Terminal,
  Sparkles
} from 'lucide-react';
import { AuthMode } from '../types';
import SocialButton from './SocialButton';

interface AuthCardProps {
  id: string;
}

export default function AuthCard({ id }: AuthCardProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States for verification simulation
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState(0);
  const [loggedInUser, setLoggedInUser] = useState<{ name: string; email: string } | null>(null);

  // Password Requirements and Strengths
  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  const strengthLabel = useMemo(() => {
    switch (passwordStrength) {
      case 0: return { label: 'Empty', color: 'bg-zinc-800', textColor: 'text-zinc-500' };
      case 1: return { label: 'Weak', color: 'bg-red-500', textColor: 'text-red-400' };
      case 2: return { label: 'Fair', color: 'bg-orange-500', textColor: 'text-orange-400' };
      case 3: return { label: 'Good', color: 'bg-yellow-500', textColor: 'text-yellow-400' };
      case 4: return { label: 'Ultra Secure', color: 'bg-emerald-500', textColor: 'text-emerald-400' };
      default: return { label: 'Weak', color: 'bg-red-500', textColor: 'text-red-400' };
    }
  }, [passwordStrength]);

  const validateForm = () => {
    setError(null);
    if (!email || !email.includes('@')) {
      setError('Please enter a valid developer email identifier');
      return false;
    }
    if (password.length < 6) {
      setError('Password security parameter must exceed 5 characters');
      return false;
    }
    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please present your full administrative name');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Security matching failure: confirmation passwords must correlate');
        return false;
      }
    }
    return true;
  };

  const executeSimulation = (targetName: string, targetEmail: string) => {
    setIsVerifying(true);
    setVerificationStep(0);
    setError(null);

    const timeouts = [
      setTimeout(() => setVerificationStep(1), 600),
      setTimeout(() => setVerificationStep(2), 1200),
      setTimeout(() => setVerificationStep(3), 1800),
      setTimeout(() => {
        setIsVerifying(false);
        setLoggedInUser({ name: targetName, email: targetEmail });
      }, 2500)
    ];

    return () => timeouts.forEach(clearTimeout);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const userDisplayName = mode === 'signup' ? name : email.split('@')[0];
    executeSimulation(userDisplayName, email);
  };

  const handleDemoLogin = () => {
    setEmail('developer@deepmind.ai');
    setPassword('Cyberpass123!');
    setName('Neo Developer');
    setMode('signin');
    setError(null);
    executeSimulation('Neo Developer', 'developer@deepmind.ai');
  };

  const handleSocialClick = (provider: string) => {
    const defaultName = `${provider.toUpperCase()} Recipient`;
    const defaultEmail = `${provider.toLowerCase()}@auth.cyber.io`;
    setEmail(defaultEmail);
    setPassword('MFA_OAUTH_TOKEN_ACTIVE');
    executeSimulation(defaultName, defaultEmail);
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setMode('signin');
  };

  const verificationLogs = [
    'Deploying secure quantum encapsulation layers...',
    'Authenticating handshake protocol sequence with primary keys...',
    'Finalizing validation tokens and allocating session cookies...',
    'Authorized! Handshake finished.'
  ];

  if (isVerifying) {
    return (
      <div id="auth_verifying_card" className="w-full max-w-[460px] p-8 rounded-2xl border border-violet-500/20 bg-black/40 backdrop-blur-xl box-glow min-h-[420px] flex flex-col justify-between overflow-hidden">
        <div className="flex flex-col items-center justify-center flex-grow py-8 text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-cyan-500 animate-spin-slow" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Cpu className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          
          <h3 className="text-lg font-bold tracking-wider text-cyan-400 mb-1 uppercase text-glow-cyan">
            Secure Channel Autologin
          </h3>
          <p className="text-xs text-zinc-500 font-mono mb-6">
            SESSION_ESTABLISHMENT_SEQUENCE
          </p>

          <div className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg p-4 font-mono text-left space-y-2 text-[11px] leading-relaxed min-h-[140px]">
            {verificationLogs.slice(0, verificationStep + 1).map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={index === verificationStep ? 'text-cyan-400' : 'text-zinc-500'}
              >
                <span className="text-violet-400 mr-2">&gt;</span>
                {log}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-[10px] font-mono text-zinc-600 text-center uppercase tracking-widest">
          Secured with SHA-512 End-to-End Enclosure
        </div>
      </div>
    );
  }

  if (loggedInUser) {
    return (
      <motion.div
        id="auth_success_card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[480px] p-8 rounded-2xl border border-emerald-500/25 bg-black/45 backdrop-blur-2xl box-glow"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-5 shadow-inner shadow-emerald-500/20">
            <Check className="w-8 h-8 text-emerald-400" />
          </div>

          <p className="text-[11px] font-mono text-emerald-400 tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mb-3">
            CONNECTION_STABLE
          </p>

          <h2 className="text-2xl font-bold text-white tracking-tight mb-1">
            Access Granted
          </h2>
          <p className="text-sm text-zinc-400 mb-6">
            Welcome to the quantum workspace, <span className="text-cyan-400 font-medium">{loggedInUser.name}</span>
          </p>

          {/* Secure telemetry board */}
          <div className="w-full bg-white/[0.02] border border-white/5 rounded-xl p-5 mb-6 text-left space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <span className="text-xs text-zinc-500 font-mono">AUTHORIZED IDENTIFIER</span>
              <span className="text-xs text-zinc-300 font-medium truncate max-w-[200px]" title={loggedInUser.email}>
                {loggedInUser.email}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="bg-zinc-950/40 border border-zinc-900 rounded-lg p-3">
                <div className="flex items-center text-cyan-400 gap-1.5 mb-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-mono tracking-wider">SEC_LEVEL</span>
                </div>
                <div className="text-sm font-semibold text-white">Quantum TLS</div>
              </div>

              <div className="bg-zinc-950/40 border border-zinc-900 rounded-lg p-3">
                <div className="flex items-center text-violet-400 gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-mono tracking-wider">LOC_PRESET</span>
                </div>
                <div className="text-sm font-semibold text-white">Grid Zone-7</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-zinc-950/20 border border-white/5 rounded-lg p-3 text-[11px] text-zinc-400 font-mono">
              <Laptop className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Session loaded with 0 latency over Local Run framework</span>
            </div>
          </div>

          <motion.button
            id="btn_auth_logout"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 text-xs font-semibold text-red-200 hover:from-red-500/30 hover:to-orange-500/30 transition-all duration-200 cursor-pointer uppercase tracking-wider"
          >
            Terminate Session
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative w-full max-w-[460px] p-8 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl box-glow"
    >
      {/* Decorative Top Accent Light */}
      <span className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-cyan-500 via-purple-500 to-violet-500 blur-sm opacity-60" />

      {/* Header section */}
      <div className="flex flex-col items-center mb-8">
        <motion.div
          whileHover={{ rotate: 15 }}
          className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-violet-500/10 to-transparent border border-cyan-500/30 flex items-center justify-center mb-4 cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-cyan-400" />
        </motion.div>
        
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Workspace Hub
        </h2>
        
        <p className="text-xs text-zinc-400 text-center mt-1">
          {mode === 'signin' && 'Access the secure visual computing interface'}
          {mode === 'signup' && 'Deploy your credentials below to establish a profile'}
          {mode === 'forgot' && 'Send security instructions to your credential terminal'}
        </p>
      </div>

      {mode !== 'forgot' && (
        <div className="flex p-1 bg-zinc-950/60 rounded-xl border border-white/5 mb-6">
          <button
            id="tab_auth_signin"
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`relative flex-1 py-2 text-xs font-semibold rounded-lg transition-colors duration-200 cursor-pointer ${
              mode === 'signin' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {mode === 'signin' && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-white/[0.06] rounded-lg border border-white/10 z-0"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">Sign In</span>
          </button>

          <button
            id="tab_auth_signup"
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`relative flex-1 py-2 text-xs font-semibold rounded-lg transition-colors duration-200 cursor-pointer ${
              mode === 'signup' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {mode === 'signup' && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-white/[0.06] rounded-lg border border-white/10 z-0"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">Sign Up</span>
          </button>
        </div>
      )}

      {/* Main interactive form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Block */}
        <AnimatePresence>
          {error && (
            <motion.div
              id="auth_form_error"
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-300 font-mono tracking-tight flex items-start gap-2.5"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {mode === 'signup' && (
          <div className="relative group">
            <label className="block text-[11px] font-mono text-zinc-500 group-focus-within:text-cyan-400 transition-colors duration-200 mb-1.5">
              FULL NAME
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="h-4 w-4 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input
                id="input_auth_name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tony Stark"
                className="block w-full pl-10 pr-3 py-2.5 bg-zinc-950/40 border border-white/5 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/35 transition-colors font-sans"
              />
            </div>
          </div>
        )}

        <div className="relative group">
          <label className="block text-[11px] font-mono text-zinc-500 group-focus-within:text-cyan-400 transition-colors duration-200 mb-1.5">
            EMAIL IDENTIFIER
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="h-4 w-4 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" />
            </div>
            <input
              id="input_auth_email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@deepmind.ai"
              className="block w-full pl-10 pr-3 py-2.5 bg-zinc-950/40 border border-white/5 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/35 transition-colors font-sans"
            />
          </div>
        </div>

        {mode !== 'forgot' && (
          <div className="relative group">
            <div className="flex justify-between mb-1.5">
              <label className="block text-[11px] font-mono text-zinc-500 group-focus-within:text-cyan-400 transition-colors duration-200">
                SECURITY PHRASE
              </label>
              {mode === 'signin' && (
                <button
                  id="link_auth_forgot"
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setError(null);
                  }}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono transition-colors cursor-pointer"
                >
                  FORGOT KEY?
                </button>
              )}
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-4 w-4 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input
                id="input_auth_password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-10 pr-10 py-2.5 bg-zinc-950/40 border border-white/5 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/35 transition-colors font-sans"
              />
              <button
                id="btn_toggle_password_visible"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Dynamic Interactive Gauge */}
            {mode === 'signup' && password.length > 0 && (
              <div className="mt-2.5 p-3 rounded-lg bg-zinc-950/60 border border-white/5 font-mono space-y-2">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-zinc-500 uppercase">Phrase integrity:</span>
                  <span className={`font-semibold uppercase tracking-wider ${strengthLabel.textColor}`}>
                    {strengthLabel.label}
                  </span>
                </div>
                {/* Visual meter blocks */}
                <div className="grid grid-cols-4 gap-1.5 h-1">
                  {[1, 2, 3, 4].map((block) => (
                    <div
                      key={block}
                      className={`h-full rounded-sm transition-all duration-300 ${
                        block <= passwordStrength ? strengthLabel.color : 'bg-zinc-800'
                      }`}
                    />
                  ))}
                </div>
                {/* Requirements list */}
                <div className="grid grid-cols-2 gap-1 text-[9px] text-zinc-500 pt-1">
                  <div className={`flex items-center gap-1 ${password.length >= 8 ? 'text-cyan-400' : ''}`}>
                    <div className={`w-1 h-1 rounded-full ${password.length >= 8 ? 'bg-cyan-400' : 'bg-transparent border border-zinc-500'}`} />
                    <span>8+ characters</span>
                  </div>
                  <div className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-cyan-400' : ''}`}>
                    <div className={`w-1 h-1 rounded-full ${/[A-Z]/.test(password) ? 'bg-cyan-400' : 'bg-transparent border border-zinc-500'}`} />
                    <span>uppercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-cyan-400' : ''}`}>
                    <div className={`w-1 h-1 rounded-full ${/[0-9]/.test(password) ? 'bg-cyan-400' : 'bg-transparent border border-zinc-500'}`} />
                    <span>numerical token</span>
                  </div>
                  <div className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(password) ? 'text-cyan-400' : ''}`}>
                    <div className={`w-1 h-1 rounded-full ${/[^A-Za-z0-9]/.test(password) ? 'bg-cyan-400' : 'bg-transparent border border-zinc-500'}`} />
                    <span>special symbol</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {mode === 'signup' && (
          <div className="relative group">
            <label className="block text-[11px] font-mono text-zinc-500 group-focus-within:text-cyan-400 transition-colors duration-200 mb-1.5">
              CONFIRM PHRASE
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-4 w-4 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input
                id="input_auth_confirm_password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-10 pr-3 py-2.5 bg-zinc-950/40 border border-white/5 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/35 transition-colors font-sans"
              />
            </div>
          </div>
        )}

        {mode === 'forgot' ? (
          <div className="space-y-4 pt-1">
            <motion.button
              id="btn_auth_reset"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-xs font-semibold text-white transition-all shadow-lg hover:shadow-cyan-500/10 cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <span>Transmit Instructions</span>
              <ArrowRight className="h-4 w-4" />
            </motion.button>
            <button
              id="link_auth_back"
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300 font-mono transition-colors cursor-pointer"
            >
              BACK TO SECURE SIGN IN
            </button>
          </div>
        ) : (
          <div className="pt-2">
            <motion.button
              id="btn_auth_submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[linear-gradient(135deg,#06b6d4,#8b5cf6)] hover:brightness-110 text-xs font-bold text-white transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              <span>{mode === 'signin' ? 'Verify Identity' : 'Establish Profile'}</span>
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        )}
      </form>

      {/* Social login divider & options */}
      {mode !== 'forgot' && (
        <div className="mt-8 space-y-6">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <span className="relative px-3 bg-[#030712] text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              Secure Auth Handshakes
            </span>
          </div>

          <div className="flex gap-3">
            <SocialButton
              id="btn_social_google"
              provider="google"
              onClick={() => handleSocialClick('google')}
            />
            <SocialButton
              id="btn_social_github"
              provider="github"
              onClick={() => handleSocialClick('github')}
            />
            <SocialButton
              id="btn_social_apple"
              provider="apple"
              onClick={() => handleSocialClick('apple')}
            />
          </div>

          {/* Quick Demo Access Switch */}
          <div className="text-center pt-2">
            <button
              id="btn_auth_demo"
              type="button"
              onClick={handleDemoLogin}
              className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 hover:text-cyan-400 transition-colors cursor-pointer uppercase bg-zinc-950/40 px-3.5 py-1.5 rounded-full border border-white/5 hover:border-cyan-500/20"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Instant Demo Portal</span>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
