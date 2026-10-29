import React from 'react';
import {
  LayoutDashboard,
  Truck,
  ClipboardList,
  Filter,
  Layers,
  AlertOctagon,
  Settings,
  ChevronRight,
  X,
  ShieldCheck,
  Waves,
  Database,
  FlaskConical,
  Wrench,
  DollarSign
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) => {
  const {
    priorityLocations,
    roLocations,
    standardLocations,
    storageTanks,
    reservoirProfile,
    commercialBills,
    pumpsTelemetry
  } = useData();
  const { isMasterAdmin, user } = useAuth();

  const unpaidBillsCount = commercialBills.filter(
    b => b.paymentStatus === 'UNPAID' || b.paymentStatus === 'OVERDUE'
  ).length;

  const trippedPumpsCount = pumpsTelemetry.filter(
    p => p.status === 'TRIPPED'
  ).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Main Dashboard & Insight',
      icon: LayoutDashboard,
      badge: null,
      badgeColor: undefined,
      description: 'Location log, receiving stats & consumption analytics'
    },
    {
      id: 'reservoir',
      label: 'Reservoir & Hydrology',
      icon: Waves,
      badge: `${(reservoirProfile.currentStorageLiters / 1000000).toFixed(0)}ML`,
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800/60',
      description: 'Raw basin depth, inflow well sluice gates & rainfall'
    },
    {
      id: 'tanks',
      label: 'Storage Tanks Matrix',
      icon: Database,
      badge: storageTanks.length,
      badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800/60',
      description: 'Pump house, towers, vital chalets & Sintec dimensions'
    },
    {
      id: 'wtp',
      label: 'Anandamkulam WTP Hub',
      icon: FlaskConical,
      badge: 'WTP',
      badgeColor: 'bg-blue-950 text-blue-300 border-blue-800/60',
      description: 'Purification KPIs, jar test, chemical stocks & AI advisor'
    },
    {
      id: 'wellplant',
      label: 'Well Water & Treatment',
      icon: Wrench,
      badge: trippedPumpsCount > 0 ? `${trippedPumpsCount} Trip` : `${pumpsTelemetry.length} Pumps`,
      badgeColor: trippedPumpsCount > 0 ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse' : 'bg-emerald-950 text-emerald-300 border-emerald-800/60',
      description: 'Hub A: Pump telemetry, water quality & internal billing'
    },
    {
      id: 'commercial',
      label: 'Commercial Billing Hub',
      icon: DollarSign,
      badge: unpaidBillsCount > 0 ? `${unpaidBillsCount} Due` : 'NWSDB',
      badgeColor: unpaidBillsCount > 0 ? 'bg-amber-950 text-amber-300 border-amber-700' : 'bg-cyan-950 text-cyan-300 border-cyan-800/60',
      description: 'Hub B: 2023 Gazette tariff, meter billing & client ledger'
    },
    {
      id: 'bowser',
      label: 'Bowser Duty Management',
      icon: Truck,
      badge: null,
      badgeColor: undefined,
      description: 'Capacity, Naha No, TA, ME & Schedule pop-up creator'
    },
    {
      id: 'loading',
      label: 'Real-Time Loading Log',
      icon: ClipboardList,
      badge: null,
      badgeColor: undefined,
      description: 'Loading interface with timer, pump & PIN lock'
    },
    {
      id: 'ro-points',
      label: 'RO Water Point Locations',
      icon: Filter,
      badge: roLocations.length,
      badgeColor: 'bg-cyan-900/80 text-cyan-300 border-cyan-700/50',
      description: 'Pure RO station tracking, tank logs & infographics'
    },
    {
      id: 'standard-points',
      label: 'Standard Water Locations',
      icon: Layers,
      badge: standardLocations.length,
      badgeColor: 'bg-blue-900/80 text-blue-300 border-blue-700/50',
      description: 'Standard water supply points & bulk storage logs'
    },
    {
      id: 'requests',
      label: 'Request & Priority System',
      icon: AlertOctagon,
      badge: priorityLocations.length,
      badgeColor: 'bg-rose-900/90 text-rose-200 border-rose-700/60 animate-pulse',
      description: 'Elevate priority locations & manage dispatch orders'
    }
  ];

  if (isMasterAdmin) {
    navItems.push({
      id: 'settings',
      label: 'Settings & Master Control',
      icon: Settings,
      badge: null,
      badgeColor: undefined,
      description: 'User management, database deletion & bulk upload'
    });
  }

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <aside
      className={`w-full lg:w-72 bg-slate-900/95 lg:bg-slate-900/60 border-b lg:border-b-0 lg:border-r border-slate-800/80 p-4 flex-col justify-between shrink-0 transition-all duration-300 ${
        isMobileMenuOpen ? 'flex' : 'hidden lg:flex'
      }`}
    >
      <div className="space-y-4">
        {/* Section Header */}
        <div className="px-3 py-2 flex items-center justify-between">
          <div>
            <h2 className="text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">
              Core Administrative Modules
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Dockyard Water Operations</p>
          </div>

          {setIsMobileMenuOpen && (
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* User Role Status Pill */}
        <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Role:</span>
          <span
            className={`font-black text-[11px] px-2 py-0.5 rounded ${
              user?.role === 'Master Admin'
                ? 'bg-amber-950 text-amber-300 border border-amber-700'
                : user?.role === 'Admin'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            {user?.role}
          </span>
        </div>

        {/* Module Navigation Buttons */}
        <nav className="space-y-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-200 group flex items-start justify-between border ${
                  isActive
                    ? 'bg-slate-800/90 text-white border-cyan-500/50 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/20'
                    : 'text-slate-400 border-transparent hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`p-2 rounded-lg mt-0.5 transition-colors ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30'
                        : 'bg-slate-800/80 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        {item.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-normal">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 pl-2">
                  {item.badge !== null && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${
                      isActive ? 'text-cyan-400 translate-x-0.5' : 'text-slate-600 opacity-0 group-hover:opacity-100'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="mt-6 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400">
            System Specs
          </span>
          <span className="text-[10px] text-slate-400">Ver. 2026.8</span>
        </div>
        <p className="text-[11px] text-slate-300">
          Navy Dockyard Premises Water Distribution & Bowser Dispatch Management.
        </p>
      </div>
    </aside>
  );
};
