import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Droplet, ShieldCheck, Lock, User, Key, Anchor, Sparkles } from 'lucide-react';

export const LoginPortal: React.FC = () => {
  const { login, authError } = useAuth();
  const [username, setUsername] = useState('SCE WW');
  const [password, setPassword] = useState('SCE Waterworks');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await login(username, password);
    setIsLoading(false);
  };

  const fillDefaultCredentials = () => {
    setUsername('SCE WW');
    setPassword('SCE Waterworks');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorative Gradients & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-cyan-950/50">
        {/* Header Badge & Crest */}
        <div className="flex flex-col items-center text-center space-y-3 mb-8">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 border border-cyan-300/40">
            <Droplet className="h-9 w-9 text-white animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-cyan-950/80 border border-cyan-800/60 px-3 py-1 rounded-full mb-2">
              <Anchor className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-xs font-bold text-cyan-300 tracking-wider uppercase">
                CCED (E) Dockyard
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Water Distribution Hub
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Exclusive Senior Chief Engineer Admin Portal
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {authError && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs flex items-start space-x-2">
            <Lock className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Username / Official Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. SCE WW"
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Access Password
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>
          </div>

          {/* Quick Pre-fill Assistant Button */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-slate-400">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <span>Initial Admin Credentials</span>
            </div>
            <button
              type="button"
              onClick={fillDefaultCredentials}
              className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center space-x-1 hover:underline"
            >
              <Sparkles className="h-3 w-3" />
              <span>Auto-Fill</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm py-3 rounded-xl shadow-lg shadow-cyan-500/25 transition-all duration-200 flex items-center justify-center space-x-2 border border-cyan-300/30 active:scale-[0.98]"
          >
            <ShieldCheck className="h-5 w-5" />
            <span>{isLoading ? 'Authenticating Admin...' : 'Authenticate & Enter Hub'}</span>
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-800 pt-4">
          <p className="text-[11px] text-slate-500">
            CCED (E) Naval Dockyard Premises • High Security Water Management System
          </p>
        </div>
      </div>
    </div>
  );
};
