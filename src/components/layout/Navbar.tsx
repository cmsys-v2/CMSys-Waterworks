import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Droplet, AlertTriangle, ShieldCheck, LogOut, Clock, Activity, Anchor, Menu, X } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { user, logout } = useAuth();
  const { priorityLocations, requests } = useData();
  const [time, setTime] = useState<string>('');

  const pendingPriorityCount = priorityLocations.length + requests.filter(r => r.isPriority || r.urgency === 'Emergency').length;

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu Toggle & Logo */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30 shrink-0">
                <Droplet className="h-6 w-6 text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
                    CCED (E)
                  </span>
                  <span className="text-xs text-slate-400 font-semibold hidden sm:flex items-center gap-1">
                    <Anchor className="h-3 w-3 text-slate-400" /> Naval Dockyard
                  </span>
                </div>
                <h1 className="text-xs sm:text-base font-extrabold text-white tracking-tight">
                  Water Distribution Hub
                </h1>
              </div>
            </div>
          </div>

          {/* Center Info: Live Clock & Status */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2 bg-slate-950/70 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
              <Clock className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-300">{time} IST</span>
            </div>

            <div className="flex items-center space-x-2 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1.5 rounded-lg">
              <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400">Gantry & Telemetry Active</span>
            </div>
          </div>

          {/* Right Controls: Priority Alert Badge & Admin Profile */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => setActiveTab('requests')}
              className={`relative flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                pendingPriorityCount > 0
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-600/60 hover:bg-rose-900/80 animate-pulse shadow-lg shadow-rose-900/30'
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
              }`}
            >
              <AlertTriangle className={`h-4 w-4 ${pendingPriorityCount > 0 ? 'text-rose-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Priority Alerts</span>
              {pendingPriorityCount > 0 && (
                <span className="bg-rose-600 text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                  {pendingPriorityCount}
                </span>
              )}
            </button>

            {user && (
              <div className="flex items-center space-x-2 sm:space-x-3 border-l border-slate-800 pl-3 sm:pl-4">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-200">{user.username}</div>
                  <div className="text-[10px] font-semibold text-cyan-400 flex items-center justify-end gap-1">
                    <ShieldCheck className="h-3 w-3 text-cyan-400" />
                    {user.role}
                  </div>
                </div>

                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold text-xs sm:text-sm shrink-0">
                  SCE
                </div>

                <button
                  onClick={logout}
                  title="Sign Out Admin"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
