import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Droplet, ShieldCheck, Lock, User, AlertCircle, Anchor, KeyRound, Eye } from 'lucide-react';

export const LoginPortal: React.FC = () => {
  const { login, usersList } = useAuth();
  const [username, setUsername] = useState('SCE WW');
  const [password, setPassword] = useState('SCE Waterworks');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const success = login(username, password);
    if (!success) {
      setErrorMessage('Invalid username or password. Please verify your credentials.');
    }
  };

  const handleQuickCredentialSelect = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/40 relative z-10 backdrop-blur-md space-y-6">
        {/* Hub Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 shadow-xl shadow-cyan-500/20 border border-cyan-400/30">
            <Droplet className="h-8 w-8 text-white animate-bounce" />
          </div>
          <div>
            <div className="flex items-center justify-center space-x-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                CCED (E)
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Anchor className="h-3 w-3 text-slate-400" /> Naval Dockyard
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Water Distribution Hub
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Command Authentication Portal & Access Control
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2 animate-in fade-in">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-cyan-400" /> Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. SCE WW"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white font-extrabold text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-cyan-400" /> Security Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-cyan-300 font-mono font-bold text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm py-3 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2 border border-cyan-300/30"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Authorize & Access System</span>
          </button>
        </form>

        {/* Preset Role Shortcut Selection */}
        <div className="border-t border-slate-800/80 pt-4 space-y-2">
          <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
            Quick Auth Role Selector:
          </div>
          <div className="space-y-1.5">
            <button
              onClick={() => handleQuickCredentialSelect('SCE WW', 'SCE Waterworks')}
              className="w-full p-2.5 rounded-xl bg-amber-950/30 hover:bg-amber-950/50 border border-amber-800/50 text-left flex items-center justify-between transition-colors"
            >
              <div>
                <div className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-400" /> SCE WW (Master Admin)
                </div>
                <div className="text-[10px] text-slate-400">Full Master Settings & Database Deletion</div>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Auto-fill</span>
            </button>

            <button
              onClick={() => handleQuickCredentialSelect('Admin Officer', 'admin123')}
              className="w-full p-2.5 rounded-xl bg-cyan-950/30 hover:bg-cyan-950/50 border border-cyan-800/50 text-left flex items-center justify-between transition-colors"
            >
              <div>
                <div className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-cyan-400" /> Admin Officer (Operational)
                </div>
                <div className="text-[10px] text-slate-400">Full Operational Logging & Loading</div>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Auto-fill</span>
            </button>

            <button
              onClick={() => handleQuickCredentialSelect('Dockyard Viewer', 'viewer123')}
              className="w-full p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/60 border border-slate-800 text-left flex items-center justify-between transition-colors"
            >
              <div>
                <div className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-slate-400" /> Dockyard Viewer (Read-Only)
                </div>
                <div className="text-[10px] text-slate-400">Inspect Dashboards & Maps Without Edits</div>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Auto-fill</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
