import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { PumpTelemetry } from '../../types/wellWaterTreatment';
import {
  Activity,
  AlertTriangle,
  Zap,
  Thermometer,
  Gauge,
  Clock,
  Wrench,
  Power,
  RotateCcw,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

export const PumpTelemetryMonitor: React.FC = () => {
  const { pumpsTelemetry, updatePumpStatus } = useData();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredPumps = pumpsTelemetry.filter(
    p => filterStatus === 'ALL' || p.status === filterStatus
  );

  const runningCount = pumpsTelemetry.filter(p => p.status === 'RUNNING').length;
  const trippedCount = pumpsTelemetry.filter(p => p.status === 'TRIPPED').length;
  const maintenanceCount = pumpsTelemetry.filter(p => p.status === 'MAINTENANCE').length;

  const handleStatusChange = (pumpId: string, status: PumpTelemetry['status']) => {
    updatePumpStatus(pumpId, status);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Telemetry Statistics */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-cyan-950 border border-cyan-800/60 text-cyan-400">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                  Electromechanical Condition Telemetry
                </span>
                <span className="text-xs text-slate-400">CCED (E) Engineering Plant</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-1">
                Submersible Wells & High-Lift Transfer Pumps
              </h3>
            </div>
          </div>

          {/* Quick Status Pills */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{runningCount} Running</span>
            </span>

            {trippedCount > 0 && (
              <span className="px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-700/60 text-rose-300 font-bold text-xs flex items-center gap-1.5 animate-pulse">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                <span>{trippedCount} Tripped!</span>
              </span>
            )}
          </div>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-800">
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Installed Units</span>
            <div className="text-xl font-black text-white mt-0.5">{pumpsTelemetry.length} Pumps</div>
            <span className="text-[11px] text-slate-400">Combined extraction & delivery</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Rated Flow</span>
            <div className="text-xl font-black text-cyan-400 mt-0.5 font-mono">
              {(pumpsTelemetry.reduce((sum, p) => sum + p.ratedCapacityLph, 0) / 1000).toLocaleString()}{' '}
              <span className="text-xs font-semibold text-slate-400">m³/hr</span>
            </div>
            <span className="text-[11px] text-slate-400">Cumulative continuous pumping</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Motor Load</span>
            <div className="text-xl font-black text-emerald-400 mt-0.5 font-mono">
              {pumpsTelemetry
                .filter(p => p.status === 'RUNNING')
                .reduce((sum, p) => sum + p.motorRatingKw, 0)}{' '}
              <span className="text-xs font-semibold text-slate-400">kW</span>
            </div>
            <span className="text-[11px] text-slate-400">{runningCount} motors online</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Condition Status</span>
            <div className={`text-xl font-black mt-0.5 ${trippedCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {trippedCount > 0 ? 'Attention Needed' : 'Nominal Health'}
            </div>
            <span className="text-[11px] text-slate-400">
              {trippedCount > 0 ? `${trippedCount} unit(s) flagged with overcurrent` : 'Vibration & temps in spec'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {['ALL', 'RUNNING', 'STANDBY', 'TRIPPED', 'MAINTENANCE'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === status
                ? 'bg-cyan-600 text-white shadow'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {status} ({status === 'ALL' ? pumpsTelemetry.length : pumpsTelemetry.filter(p => p.status === status).length})
          </button>
        ))}
      </div>

      {/* Pumps Telemetry Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPumps.map(pump => {
          const isOvercurrent = pump.currentAmps > pump.ratedAmps * 1.15;
          const isHighVibration = pump.bearingVibrationMmS > 4.5;
          const isHighTemp = pump.windingTempCelsius > 75.0;
          const isServiceDue = pump.nextServiceDueHours <= 50;
          const hasConditionWarning = isOvercurrent || isHighVibration || isHighTemp || pump.status === 'TRIPPED';

          const statusBadge =
            pump.status === 'RUNNING'
              ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
              : pump.status === 'STANDBY'
              ? 'bg-blue-950 text-blue-300 border-blue-700/60'
              : pump.status === 'TRIPPED'
              ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
              : 'bg-amber-950 text-amber-300 border-amber-700/60';

          return (
            <div
              key={pump.pumpId}
              className={`bg-slate-900/80 border rounded-3xl p-5 shadow-xl flex flex-col justify-between transition-all duration-200 ${
                hasConditionWarning
                  ? 'border-rose-600/70 shadow-rose-950/20'
                  : 'border-slate-800 hover:border-cyan-500/40'
              }`}
            >
              <div>
                {/* Header: ID, Location & Status */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-xs font-mono font-black text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
                      {pump.pumpId}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">{pump.name}</h4>
                    <span className="text-[11px] text-slate-400 block">{pump.location}</span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge}`}>
                    {pump.status}
                  </span>
                </div>

                {/* Condition Warning Alert Banner if tripped or high load */}
                {hasConditionWarning && (
                  <div className="mb-3 p-2.5 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-200 text-xs space-y-1">
                    <div className="flex items-center gap-1 font-bold text-rose-300">
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                      <span>ELECTROMECHANICAL WARNING</span>
                    </div>
                    {isOvercurrent && (
                      <p className="text-[11px]">
                        Overcurrent draw: {pump.currentAmps}A exceeds rated {pump.ratedAmps}A by &gt;15%!
                      </p>
                    )}
                    {isHighVibration && (
                      <p className="text-[11px]">
                        Bearing vibration high: {pump.bearingVibrationMmS} mm/s (Limit: 4.5 mm/s)
                      </p>
                    )}
                    {isHighTemp && (
                      <p className="text-[11px]">
                        Stator winding overheated: {pump.windingTempCelsius}°C (Limit: 75°C)
                      </p>
                    )}
                    {pump.status === 'TRIPPED' && (
                      <p className="text-[11px] font-bold text-rose-300">
                        Thermal overload relay tripped. Reset required before starting.
                      </p>
                    )}
                  </div>
                )}

                {/* Electromechanical Telemetry Grid */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 text-xs mb-3">
                  {/* Current Amps */}
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block flex items-center gap-1">
                      <Zap className="h-3 w-3 text-cyan-400" />
                      Current Draw
                    </span>
                    <div className="text-sm font-black font-mono mt-0.5 text-white">
                      <span className={isOvercurrent ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                        {pump.currentAmps.toFixed(1)} A
                      </span>{' '}
                      <span className="text-[10px] text-slate-500 font-normal">/ {pump.ratedAmps}A</span>
                    </div>
                  </div>

                  {/* Motor Rating */}
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Motor Rating
                    </span>
                    <div className="text-sm font-black font-mono mt-0.5 text-slate-200">
                      {pump.motorRatingKw} kW
                    </div>
                  </div>

                  {/* Bearing Vibration */}
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block flex items-center gap-1">
                      <Activity className="h-3 w-3 text-blue-400" />
                      Vibration
                    </span>
                    <div className="text-sm font-black font-mono mt-0.5">
                      <span className={isHighVibration ? 'text-rose-400' : 'text-slate-200'}>
                        {pump.bearingVibrationMmS.toFixed(1)} mm/s
                      </span>
                    </div>
                  </div>

                  {/* Winding Temp */}
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block flex items-center gap-1">
                      <Thermometer className="h-3 w-3 text-amber-400" />
                      Winding Temp
                    </span>
                    <div className="text-sm font-black font-mono mt-0.5">
                      <span className={isHighTemp ? 'text-rose-400' : 'text-slate-200'}>
                        {pump.windingTempCelsius.toFixed(1)}°C
                      </span>
                    </div>
                  </div>
                </div>

                {/* Run Hours & Service Schedule */}
                <div className="space-y-1 text-[11px] text-slate-300 font-mono bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60 mb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rated Capacity:</span>
                    <span className="font-bold text-white">{(pump.ratedCapacityLph / 1000).toLocaleString()} m³/hr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Run Hours Today:</span>
                    <span className="text-cyan-300 font-bold">{pump.runHoursToday.toFixed(1)} hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Run Hours:</span>
                    <span>{pump.totalRunHours.toLocaleString()} hrs</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800/60 pt-1">
                    <span className="text-slate-400">Next Service In:</span>
                    <span className={isServiceDue ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                      {pump.nextServiceDueHours} hrs {isServiceDue && '(Service Overdue!)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons to control pump status */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-1.5">
                <button
                  type="button"
                  onClick={() => handleStatusChange(pump.pumpId, 'RUNNING')}
                  className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all ${
                    pump.status === 'RUNNING'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-emerald-950'
                  }`}
                >
                  Start
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(pump.pumpId, 'STANDBY')}
                  className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all ${
                    pump.status === 'STANDBY'
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-blue-950'
                  }`}
                >
                  Standby
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(pump.pumpId, 'MAINTENANCE')}
                  className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all ${
                    pump.status === 'MAINTENANCE'
                      ? 'bg-amber-600 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-amber-950'
                  }`}
                >
                  Service
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(pump.pumpId, 'TRIPPED')}
                  title="Simulate / Trigger Trip"
                  className={`py-1 px-2 rounded-lg text-[11px] font-bold transition-all ${
                    pump.status === 'TRIPPED'
                      ? 'bg-rose-600 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-rose-400'
                  }`}
                >
                  Trip
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
