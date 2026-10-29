import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { WellIntakeGauges } from './WellIntakeGauges';
import { RainfallRecordsTable } from './RainfallRecordsTable';
import {
  Waves,
  Gauge,
  CloudRain,
  ArrowUpRight,
  TrendingDown,
  ShieldAlert,
  Info,
  Droplets,
  Layers
} from 'lucide-react';

export const ReservoirHydrologyView: React.FC = () => {
  const { reservoirProfile } = useData();
  const [activeSubTab, setActiveSubTab] = useState<'wells' | 'rainfall'>('wells');

  const {
    reservoirName,
    grossCapacityLiters,
    deadStorageLiters,
    currentWaterLevelMeters,
    currentStorageLiters,
    freeboardMeters,
    intakeLossRatePercentage
  } = reservoirProfile;

  const storagePercentage = parseFloat(
    ((currentStorageLiters / grossCapacityLiters) * 100).toFixed(1)
  );
  const activeWellsCount = reservoirProfile.wells.filter(w => w.operationalStatus === 'ACTIVE').length;
  const totalWellDischarge = reservoirProfile.wells
    .filter(w => w.operationalStatus === 'ACTIVE')
    .reduce((sum, w) => sum + w.dischargeRateLps, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner: Basin Metrics Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/70 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-950/90 px-2.5 py-0.5 rounded-full border border-cyan-800/60">
                Strategic Raw Reservoir
              </span>
              <span className="text-xs text-slate-400 font-medium">Naval Dockyard Eastern Catchment</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              {reservoirName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              Primary impoundment receiving deep inflow wells, radial collectors, and catchment surface runoff feeding the Anandamkulam Water Treatment Plant (WTP).
            </p>
          </div>

          {/* Quick Storage Meter Pill */}
          <div className="bg-slate-950/90 border border-cyan-800/50 rounded-2xl p-4 min-w-[260px] shadow-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Current Storage</span>
              <div className="text-2xl font-black text-white">
                {(currentStorageLiters / 1000000).toFixed(1)}{' '}
                <span className="text-xs font-semibold text-cyan-400">Million Liters</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Gross Cap: {(grossCapacityLiters / 1000000).toFixed(1)} ML ({storagePercentage}% Full)
              </span>
            </div>

            <div className="h-14 w-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex flex-col items-center justify-center text-cyan-300">
              <Droplets className="h-5 w-5 animate-bounce" />
              <span className="text-[10px] font-black">{storagePercentage}%</span>
            </div>
          </div>
        </div>

        {/* Level Progression Visual Line */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
              <Gauge className="h-3 w-3 text-cyan-400" />
              Water Level (Head)
            </span>
            <div className="text-base font-bold text-white font-mono mt-0.5">
              {currentWaterLevelMeters.toFixed(2)} m
            </div>
            <span className="text-[10px] text-slate-400">Max Full Supply: 8.20 m</span>
          </div>

          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
              <Layers className="h-3 w-3 text-blue-400" />
              Freeboard Margin
            </span>
            <div className="text-base font-bold text-blue-300 font-mono mt-0.5">
              {freeboardMeters.toFixed(2)} m
            </div>
            <span className="text-[10px] text-slate-400">Crest safety buffer</span>
          </div>

          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-emerald-400" />
              Inflow Rate (Wells)
            </span>
            <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
              {totalWellDischarge.toFixed(1)} L/s
            </div>
            <span className="text-[10px] text-slate-400">{activeWellsCount} Active Sluice Gates</span>
          </div>

          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-amber-400" />
              Intake Seepage/Loss
            </span>
            <div className="text-base font-bold text-amber-300 font-mono mt-0.5">
              {intakeLossRatePercentage.toFixed(1)}%
            </div>
            <span className="text-[10px] text-slate-400">
              Dead Storage: {(deadStorageLiters / 1000000).toFixed(1)} ML
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-3">
        <button
          onClick={() => setActiveSubTab('wells')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-bold text-xs transition-all ${
            activeSubTab === 'wells'
              ? 'border-cyan-400 text-white bg-slate-900/60 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Waves className="h-4 w-4 text-cyan-400" />
          <span>Well Sluice Gate Apertures & Inflow Gauges</span>
          <span className="bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded-full text-[10px] border border-cyan-800/40">
            {reservoirProfile.wells.length} Wells
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('rainfall')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-bold text-xs transition-all ${
            activeSubTab === 'rainfall'
              ? 'border-cyan-400 text-white bg-slate-900/60 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CloudRain className="h-4 w-4 text-blue-400" />
          <span>Rainfall Records & Catchment Runoff</span>
          <span className="bg-blue-950 text-blue-300 px-2 py-0.5 rounded-full text-[10px] border border-blue-800/40">
            {reservoirProfile.rainfallRecords.length} Logs
          </span>
        </button>
      </div>

      {/* Sub-tab view rendering */}
      {activeSubTab === 'wells' && <WellIntakeGauges />}
      {activeSubTab === 'rainfall' && <RainfallRecordsTable />}
    </div>
  );
};
