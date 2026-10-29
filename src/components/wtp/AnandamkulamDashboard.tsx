import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { AIWaterQualityAdvisor } from './AIWaterQualityAdvisor';
import { JarTestCalculator } from './JarTestCalculator';
import { ChemicalInventoryManager } from './ChemicalInventoryManager';
import { DailyWTPTestReportForm } from './DailyWTPTestReportForm';
import { WTPDutyRoster } from './WTPDutyRoster';
import {
  Activity,
  Droplet,
  FlaskConical,
  PackageCheck,
  FileText,
  Users,
  Sparkles,
  ArrowUpRight,
  TrendingDown,
  Layers,
  Gauge,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const AnandamkulamDashboard: React.FC = () => {
  const { wtpReports, storageTanks, chemicalInventory } = useData();
  const [activeTab, setActiveTab] = useState<'advisor' | 'jartest' | 'inventory' | 'reports' | 'roster'>('advisor');

  const latestReport = wtpReports[0];

  const rawInflow = latestReport ? latestReport.rawWaterInflowLiters : 1850000;
  const treatedOutflow = latestReport ? latestReport.treatedWaterOutflowLiters : 1780000;
  const sludgeDischarge = latestReport ? latestReport.sludgeDischargeLiters : 70000;
  const purificationEfficiency = parseFloat(((treatedOutflow / (rawInflow || 1)) * 100).toFixed(1));

  // Plant overhead tanks & treated sumps from storage matrix
  const plantTanks = storageTanks.filter(
    t =>
      t.classification === 'OVERHEAD_TOWER' ||
      t.classification === 'MAIN_PUMP_HOUSE' ||
      t.locationArea.toLowerCase().includes('anandamkulam')
  );

  const wq = latestReport?.waterQuality || {
    rawTurbidityNtu: 18.5,
    treatedTurbidityNtu: 0.72,
    rawPh: 7.35,
    treatedPh: 7.15,
    residualChlorinePpm: 0.65,
    totalDissolvedSolidsPpm: 185.0,
    coliformBacteriologicalResult: 'SAFE_ZERO' as const
  };

  const criticalChemicalCount = chemicalInventory.filter(c => c.reorderStatus === 'CRITICAL').length;

  return (
    <div className="space-y-6">
      {/* Central Plant Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-950/90 px-2.5 py-0.5 rounded-full border border-cyan-800/60">
                Primary Naval Purification Facility
              </span>
              <span className="text-xs text-slate-400 font-medium">Naval Dockyard Eastern Command</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              ND Anandamkulam Water Treatment Plant (WTP)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              Centralized coagulation, clarification, dual-media filtration, and chlorination complex supplying dockyard mains, overhead storage towers, and pure RO stations.
            </p>
          </div>

          {/* Plant Efficiency Pill */}
          <div className="bg-slate-950/90 border border-cyan-800/50 rounded-2xl p-4 min-w-[260px] shadow-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Purification Throughput</span>
              <div className="text-2xl font-black text-white font-mono">
                {(treatedOutflow / 1000).toLocaleString()}{' '}
                <span className="text-xs font-semibold text-cyan-400">kL / 24h</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Inflow: {(rawInflow / 1000).toLocaleString()} kL ({purificationEfficiency}% Net Yield)
              </span>
            </div>

            <div className="h-14 w-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex flex-col items-center justify-center text-cyan-300">
              <Droplet className="h-5 w-5 animate-pulse" />
              <span className="text-[10px] font-black">{purificationEfficiency}%</span>
            </div>
          </div>
        </div>

        {/* Real-Time Water Quality Gauges Strip */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
              <Gauge className="h-3 w-3 text-cyan-400" />
              Treated Turbidity
            </span>
            <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
              {wq.treatedTurbidityNtu.toFixed(2)} NTU
            </div>
            <span className="text-[10px] text-slate-400">Raw: {wq.rawTurbidityNtu} NTU</span>
          </div>

          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
              <Activity className="h-3 w-3 text-blue-400" />
              Treated pH Index
            </span>
            <div className="text-base font-bold text-slate-200 font-mono mt-0.5">
              {wq.treatedPh.toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-400">SLS 614 Target: 6.8 - 8.5</span>
          </div>

          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-cyan-400" />
              Residual Free Cl₂
            </span>
            <div className="text-base font-bold text-cyan-300 font-mono mt-0.5">
              {wq.residualChlorinePpm.toFixed(2)} ppm
            </div>
            <span className="text-[10px] text-slate-400">Disinfection buffer</span>
          </div>

          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              Bacteriological Status
            </span>
            <div className="text-xs font-bold text-emerald-300 mt-1 uppercase">
              {wq.coliformBacteriologicalResult.replace('_', ' ')}
            </div>
            <span className="text-[10px] text-slate-400">Zero coliform detected</span>
          </div>
        </div>
      </div>

      {/* Sub-Module Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => setActiveTab('advisor')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-bold text-xs transition-all shrink-0 ${
            activeTab === 'advisor'
              ? 'border-cyan-400 text-white bg-slate-900/60 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <span>AI Water Quality Advisor</span>
          <span className="bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded-full text-[10px] border border-cyan-800/40">
            SLS 614
          </span>
        </button>

        <button
          onClick={() => setActiveTab('jartest')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-bold text-xs transition-all shrink-0 ${
            activeTab === 'jartest'
              ? 'border-cyan-400 text-white bg-slate-900/60 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FlaskConical className="h-4 w-4 text-cyan-400" />
          <span>Jar Test Dosing Assistant</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-bold text-xs transition-all shrink-0 ${
            activeTab === 'inventory'
              ? 'border-cyan-400 text-white bg-slate-900/60 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <PackageCheck className="h-4 w-4 text-cyan-400" />
          <span>Chemical Inventory & Runways</span>
          {criticalChemicalCount > 0 && (
            <span className="bg-rose-950 text-rose-300 px-2 py-0.5 rounded-full text-[10px] border border-rose-800/40 animate-pulse">
              {criticalChemicalCount} Critical
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-bold text-xs transition-all shrink-0 ${
            activeTab === 'reports'
              ? 'border-cyan-400 text-white bg-slate-900/60 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="h-4 w-4 text-cyan-400" />
          <span>Daily Lab Test Reports</span>
          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[10px]">
            {wtpReports.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-bold text-xs transition-all shrink-0 ${
            activeTab === 'roster'
              ? 'border-cyan-400 text-white bg-slate-900/60 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="h-4 w-4 text-cyan-400" />
          <span>Duty Watch Roster</span>
        </button>
      </div>

      {/* Render Active Sub-Module */}
      <div>
        {activeTab === 'advisor' && <AIWaterQualityAdvisor />}
        {activeTab === 'jartest' && <JarTestCalculator />}
        {activeTab === 'inventory' && <ChemicalInventoryManager />}
        {activeTab === 'reports' && <DailyWTPTestReportForm />}
        {activeTab === 'roster' && <WTPDutyRoster />}
      </div>
    </div>
  );
};
