import React, { useState } from 'react';
import { DetailedStorageTank } from '../../types/waterDistribution';
import { useData } from '../../context/DataContext';
import { calculateTankMetrics } from '../../utils/tankCalculations';
import { AlertTriangle, Droplets, Gauge, Layers, ShieldCheck, X } from 'lucide-react';

interface TankVisualCrossSectionProps {
  tank: DetailedStorageTank;
  onClose?: () => void;
  allowLevelAdjustment?: boolean;
}

export const TankVisualCrossSection: React.FC<TankVisualCrossSectionProps> = ({
  tank,
  onClose,
  allowLevelAdjustment = true
}) => {
  const { setTankCurrentLevel } = useData();
  const [simulatedLevel, setSimulatedLevel] = useState<number>(tank.currentLevelMeters);

  const { dimensions, lowAlarmPercentage, criticalAlarmPercentage } = tank;
  const formFactor = dimensions.formFactor;
  const totalH = Math.max(0.1, dimensions.totalHeightMeters);
  const usableH = Math.max(0, dimensions.usableHeightMeters);

  const metrics = calculateTankMetrics(dimensions, simulatedLevel);

  const handleLevelChange = (val: number) => {
    const clamped = Math.max(0, Math.min(totalH, val));
    setSimulatedLevel(parseFloat(clamped.toFixed(2)));
  };

  const handleCommitLevel = () => {
    setTankCurrentLevel(tank.id, simulatedLevel);
  };

  // Percentages for SVG rendering
  const fillPct = Math.min(100, Math.max(0, (simulatedLevel / totalH) * 100));
  const usablePct = Math.min(100, Math.max(0, (usableH / totalH) * 100));
  const deadStorageH = usableH < totalH && dimensions.deadStorageLiters > 0
    ? (dimensions.deadStorageLiters / (metrics.crossSectionAreaM2 * 1000 || 1))
    : 0;
  const deadStoragePct = Math.min(100, (deadStorageH / totalH) * 100);

  const isCritical = metrics.fillPercentage <= criticalAlarmPercentage;
  const isLow = !isCritical && metrics.fillPercentage <= lowAlarmPercentage;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 max-w-2xl w-full mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800/50">
              {tank.code}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                tank.waterType === 'RO'
                  ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-700/50'
                  : 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
              }`}
            >
              {tank.waterType === 'RO' ? 'RO Water' : tank.waterType === 'STANDARD' ? 'Standard Water' : 'Raw Water'}
            </span>
          </div>
          <h3 className="text-base font-extrabold text-white mt-1">{tank.name}</h3>
          <p className="text-xs text-slate-400">{tank.locationArea}</p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Main Visual Cross-Section Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* SVG Container */}
        <div className="relative bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[300px]">
          <span className="text-[10px] uppercase font-bold text-slate-400 mb-2">
            Geometric Cross-Section ({formFactor.replace('_', ' ')})
          </span>

          <div className="relative w-48 h-64 border-2 border-slate-600 rounded-b-xl overflow-hidden bg-slate-900 flex flex-col justify-end">
            {/* Top Overflow/Freeboard Line */}
            <div className="absolute top-2 left-0 right-0 border-b border-dashed border-slate-500 flex justify-between px-1 text-[9px] text-slate-400">
              <span>Crest ({totalH}m)</span>
              <span>Overflow</span>
            </div>

            {/* Usable Max Line */}
            <div
              className="absolute left-0 right-0 border-b border-cyan-500/60 z-10 flex justify-end px-1 text-[9px] text-cyan-400 font-mono"
              style={{ bottom: `${usablePct}%` }}
            >
              <span>Max Usable: {usableH}m</span>
            </div>

            {/* Low Alarm Line */}
            <div
              className="absolute left-0 right-0 border-b border-dashed border-amber-500/70 z-10 flex justify-start px-1 text-[9px] text-amber-400 font-mono"
              style={{ bottom: `${lowAlarmPercentage}%` }}
            >
              <span>Low Alarm ({lowAlarmPercentage}%)</span>
            </div>

            {/* Dead Storage Zone */}
            {deadStoragePct > 0 && (
              <div
                className="absolute left-0 right-0 bottom-0 bg-slate-800/80 border-t border-slate-600 z-10 flex items-center justify-center text-[9px] text-slate-400 font-mono"
                style={{ height: `${deadStoragePct}%` }}
              >
                <span>Dead Storage</span>
              </div>
            )}

            {/* Dynamic Water Volume */}
            <div
              className={`w-full transition-all duration-300 relative ${
                isCritical
                  ? 'bg-gradient-to-t from-rose-900/90 to-rose-600/80'
                  : isLow
                  ? 'bg-gradient-to-t from-amber-900/90 to-amber-500/80'
                  : 'bg-gradient-to-t from-blue-900/90 via-cyan-800/80 to-cyan-500/80'
              }`}
              style={{ height: `${fillPct}%` }}
            >
              {/* Water Surface Wave Simulation */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/40 animate-pulse" />
            </div>

            {/* Central Fill Percent Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
              <span className="text-2xl font-black text-white drop-shadow-md">
                {metrics.fillPercentage}%
              </span>
              <span className="text-[11px] font-mono text-cyan-200 drop-shadow">
                {simulatedLevel.toFixed(2)}m / {totalH}m
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Metrics & Controls */}
        <div className="space-y-4">
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Current Volume</span>
              <span className="text-base font-black text-white font-mono">
                {metrics.currentVolumeLiters.toLocaleString()}{' '}
                <span className="text-xs text-cyan-400">L</span>
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800/60 pt-2">
              <span className="text-xs text-slate-400">Rated Net Capacity</span>
              <span className="text-xs font-bold text-slate-200 font-mono">
                {metrics.netCapacityLiters.toLocaleString()} L
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800/60 pt-2">
              <span className="text-xs text-slate-400">Dead Storage Deducted</span>
              <span className="text-xs font-bold text-amber-300 font-mono">
                {metrics.deadStorageLiters.toLocaleString()} L
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800/60 pt-2">
              <span className="text-xs text-slate-400">Cross-Sectional Area</span>
              <span className="text-xs font-bold text-slate-300 font-mono">
                {metrics.crossSectionAreaM2} m²
              </span>
            </div>
          </div>

          {/* Alarm Status Pills */}
          <div className="flex items-center gap-2">
            {isCritical ? (
              <div className="w-full p-2.5 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 animate-pulse" />
                <span>CRITICAL ALARM: Tank depleted below {criticalAlarmPercentage}%!</span>
              </div>
            ) : isLow ? (
              <div className="w-full p-2.5 rounded-xl bg-amber-950/80 border border-amber-700 text-amber-300 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                <span>LOW WATER ADVISORY: Level below {lowAlarmPercentage}%</span>
              </div>
            ) : (
              <div className="w-full p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Water Storage Adequate ({metrics.fillPercentage}%)</span>
              </div>
            )}
          </div>

          {/* Interactive Level Slider / Adjuster */}
          {allowLevelAdjustment && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Gauge className="h-3.5 w-3.5 text-cyan-400" />
                  Liquid Depth Adjuster
                </span>
                <span className="font-mono font-bold text-cyan-400">
                  {simulatedLevel.toFixed(2)} m
                </span>
              </div>

              <input
                type="range"
                min="0"
                max={totalH}
                step="0.05"
                value={simulatedLevel}
                onChange={e => handleLevelChange(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => handleLevelChange(usableH)}
                  className="text-[11px] text-cyan-400 hover:underline"
                >
                  Set to 100% Usable
                </button>
                <button
                  type="button"
                  onClick={handleCommitLevel}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow"
                >
                  Save Level to Matrix
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
