import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { PumpTelemetryMonitor } from './PumpTelemetryMonitor';
import { WellWaterTestReports } from './WellWaterTestReports';
import { InternalDockyardBilling } from './InternalDockyardBilling';
import {
  Droplet,
  Zap,
  FileText,
  Building2,
  Activity,
  AlertTriangle,
  ShieldCheck,
  ArrowUpRight,
  Gauge
} from 'lucide-react';

export const WellWaterPlantDashboard: React.FC = () => {
  const { pumpsTelemetry, wellTreatmentLogs, internalBillingRecords } = useData();
  const [activeTab, setActiveTab] = useState<'pumps' | 'lab' | 'internalBilling'>('pumps');

  const latestLog = wellTreatmentLogs[0];
  const rawPumped = latestLog ? latestLog.rawWaterPumpedLiters : 1850000;
  const treatedYield = latestLog ? latestLog.treatedWaterYieldLiters : 1775000;
  const yieldEfficiency = parseFloat(((treatedYield / (rawPumped || 1)) * 100).toFixed(1));

  const runningPumps = pumpsTelemetry.filter(p => p.status === 'RUNNING').length;
  const trippedPumps = pumpsTelemetry.filter(p => p.status === 'TRIPPED').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/70 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-950/90 px-2.5 py-0.5 rounded-full border border-cyan-800/60">
                Ground Water Extraction & Distribution
              </span>
              <span className="text-xs text-slate-400 font-medium">Naval Civil Engineering Department</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              Well Water Purification Plant & Pump Monitoring Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              Electromechanical condition telemetry for deep submersible and centrifugal booster pumps, daily filtration chemical logs, and internal naval premises consumption apportionment.
            </p>
          </div>

          {/* Quick Status Pill */}
          <div className="bg-slate-950/90 border border-cyan-800/50 rounded-2xl p-4 min-w-[260px] shadow-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Treated Ground Yield</span>
              <div className="text-2xl font-black text-white font-mono">
                {(treatedYield / 1000).toLocaleString()}{' '}
                <span className="text-xs font-semibold text-cyan-400">m³ / 24h</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Raw Extraction: {(rawPumped / 1000).toLocaleString()} m³ ({yieldEfficiency}% Net Yield)
              </span>
            </div>

            <div className="h-14 w-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex flex-col items-center justify-center text-cyan-300">
              <Droplet className="h-5 w-5 animate-pulse" />
              <span className="text-[10px] font-black">{yieldEfficiency}%</span>
            </div>
          </div>
        </div>

        {/* Real-time KPI Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
              <Zap className="h-3 w-3 text-cyan-400" />
              Active Running Motors
            </span>
            <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
              {runningPumps} / {pumpsTelemetry.length} Online
            </div>
            <span className="text-[10px] text-slate-400">Submersible & booster pumps</span>
          </div>

          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-amber-400" />
              Tripped / Overload Faults
            </span>
            <div className={`text-base font-bold font-mono mt-0.5 ${trippedPumps > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
              {trippedPumps} Units
            </div>
            <span className="text-[10px] text-slate-400">{trippedPumps > 0 ? 'Relay trip active' : 'Zero electrical trips'}</span>
          </div>

          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
              <Gauge className="h-3 w-3 text-blue-400" />
              Filtered Turbidity
            </span>
            <div className="text-base font-bold text-white font-mono mt-0.5">
              {latestLog ? latestLog.waterQuality.turbidityNtu : 0.72} NTU
            </div>
            <span className="text-[10px] text-slate-400">SLS 614 standard &lt; 2.0 NTU</span>
          </div>

          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              Bacteriological Safety
            </span>
            <div className="text-xs font-bold text-emerald-400 mt-1 uppercase font-sans">
              {latestLog ? latestLog.waterQuality.ecoliColiform.replace('_', ' ') : 'PASS NIL'}
            </div>
            <span className="text-[10px] text-slate-400">Membrane incubation clear</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-3 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => setActiveTab('pumps')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-bold text-xs transition-all shrink-0 ${
            activeTab === 'pumps'
              ? 'border-cyan-400 text-white bg-slate-900/60 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="h-4 w-4 text-cyan-400" />
          <span>Pump Telemetry & Condition Monitor</span>
          <span className="bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded-full text-[10px] border border-cyan-800/40">
            {pumpsTelemetry.length} Pumps
          </span>
        </button>

        <button
          onClick={() => setActiveTab('lab')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-bold text-xs transition-all shrink-0 ${
            activeTab === 'lab'
              ? 'border-cyan-400 text-white bg-slate-900/60 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="h-4 w-4 text-cyan-400" />
          <span>Chemical & Lab Quality Assays</span>
          <span className="bg-blue-950 text-blue-300 px-2 py-0.5 rounded-full text-[10px] border border-blue-800/40">
            {wellTreatmentLogs.length} Logs
          </span>
        </button>

        <button
          onClick={() => setActiveTab('internalBilling')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-bold text-xs transition-all shrink-0 ${
            activeTab === 'internalBilling'
              ? 'border-cyan-400 text-white bg-slate-900/60 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="h-4 w-4 text-cyan-400" />
          <span>In-Dockyard Internal Supply Billing</span>
          <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] border border-emerald-800/40">
            {internalBillingRecords.length} Premises
          </span>
        </button>
      </div>

      {/* Render Selected View */}
      <div>
        {activeTab === 'pumps' && <PumpTelemetryMonitor />}
        {activeTab === 'lab' && <WellWaterTestReports />}
        {activeTab === 'internalBilling' && <InternalDockyardBilling />}
      </div>
    </div>
  );
};
