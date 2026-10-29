import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { WellIntakeLevel } from '../../types/waterDistribution';
import { Sliders, Activity, AlertCircle, CheckCircle2, Waves, ArrowDownRight, RefreshCw } from 'lucide-react';

export const WellIntakeGauges: React.FC = () => {
  const { reservoirProfile, updateWellGate } = useData();
  const [editingWellId, setEditingWellId] = useState<string | null>(null);
  const [tempGateValue, setTempGateValue] = useState<number>(0);

  const wells = reservoirProfile.wells || [];

  const totalDischargeLps = wells
    .filter(w => w.operationalStatus === 'ACTIVE')
    .reduce((sum, w) => sum + (w.dischargeRateLps || 0), 0);

  const totalDischargeM3Hr = (totalDischargeLps * 3.6).toFixed(1);
  const totalDischargeLpd = Math.round(totalDischargeLps * 86400);

  const handleStartGateEdit = (well: WellIntakeLevel) => {
    setEditingWellId(well.wellId);
    setTempGateValue(well.sluiceGateOpenPercentage);
  };

  const handleSaveGate = (wellId: string) => {
    updateWellGate(wellId, tempGateValue);
    setEditingWellId(null);
  };

  const handleToggleStatus = (well: WellIntakeLevel) => {
    const nextStatus: WellIntakeLevel['operationalStatus'] =
      well.operationalStatus === 'ACTIVE'
        ? 'ISOLATED'
        : well.operationalStatus === 'ISOLATED'
        ? 'SILTED'
        : 'ACTIVE';

    updateWellGate(
      well.wellId,
      nextStatus === 'ACTIVE' ? (well.sluiceGateOpenPercentage === 0 ? 50 : well.sluiceGateOpenPercentage) : 0,
      nextStatus
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Total Flow Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-cyan-950 border border-cyan-800/60 text-cyan-400">
              <Waves className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-white">Anandamkulam Well Inlets & Sluice Gates</h3>
              <p className="text-xs text-slate-400">
                Radial collectors, deep inflows, and penstocks discharging into the raw basin
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Raw Intake Flow</span>
            <div className="text-lg font-black text-cyan-400 flex items-baseline gap-1">
              <span>{totalDischargeLps.toFixed(1)}</span>
              <span className="text-xs font-semibold text-slate-400">L/s</span>
              <span className="text-xs text-slate-500 mx-1">|</span>
              <span className="text-sm font-bold text-slate-200">{totalDischargeM3Hr}</span>
              <span className="text-xs font-semibold text-slate-400">m³/hr</span>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">24h Cumulative Projected</span>
            <div className="text-lg font-black text-emerald-400">
              {(totalDischargeLpd / 1000000).toFixed(2)}{' '}
              <span className="text-xs font-semibold text-slate-400">Million L</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wells Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {wells.map(well => {
          const isEditing = editingWellId === well.wellId;
          const statusBadge =
            well.operationalStatus === 'ACTIVE'
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
              : well.operationalStatus === 'ISOLATED'
              ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
              : 'bg-rose-950/80 text-rose-300 border-rose-700/60';

          return (
            <div
              key={well.wellId}
              className={`bg-slate-900/60 border rounded-2xl p-5 transition-all duration-200 ${
                well.operationalStatus === 'ACTIVE'
                  ? 'border-slate-800 hover:border-cyan-500/40 shadow-lg'
                  : 'border-slate-800/60 opacity-80'
              }`}
            >
              {/* Card Top */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                      {well.wellId.toUpperCase()}
                    </span>
                    <button
                      onClick={() => handleToggleStatus(well)}
                      title="Click to cycle status (ACTIVE -> ISOLATED -> SILTED)"
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-transform active:scale-95 flex items-center gap-1 ${statusBadge}`}
                    >
                      {well.operationalStatus === 'ACTIVE' && <CheckCircle2 className="h-3 w-3" />}
                      {well.operationalStatus === 'ISOLATED' && <AlertCircle className="h-3 w-3" />}
                      {well.operationalStatus === 'SILTED' && <Activity className="h-3 w-3" />}
                      {well.operationalStatus}
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1.5">{well.wellName}</h4>
                </div>

                <div className="text-right">
                  <div className="text-xl font-black text-white">
                    {well.operationalStatus === 'ACTIVE' ? well.dischargeRateLps.toFixed(1) : '0.0'}
                    <span className="text-xs font-normal text-slate-400 ml-1">L/s</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {well.operationalStatus === 'ACTIVE' ? `${(well.dischargeRateLps * 3.6).toFixed(1)} m³/h` : 'Flow Halted'}
                  </span>
                </div>
              </div>

              {/* Water Column & Invert Metrics */}
              <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Invert Level (Inflow Lip)</span>
                  <div className="text-xs font-bold text-slate-200 mt-0.5 font-mono">
                    {well.invertLevelMeters.toFixed(2)} m AMSL
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Water Column Head</span>
                  <div className="text-xs font-bold text-cyan-300 mt-0.5 font-mono flex items-center gap-1">
                    <ArrowDownRight className="h-3.5 w-3.5 text-cyan-400" />
                    {well.waterColumnMeters.toFixed(2)} m
                  </div>
                </div>
              </div>

              {/* Sluice Gate Control Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-cyan-400" />
                    Sluice Gate Aperture
                  </span>
                  <span className="font-mono font-bold text-cyan-400">
                    {isEditing ? `${tempGateValue}%` : `${well.sluiceGateOpenPercentage}%`}
                  </span>
                </div>

                {isEditing ? (
                  <div className="space-y-3 pt-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={tempGateValue}
                      onChange={e => setTempGateValue(Number(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                    />
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setEditingWellId(null)}
                        className="px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded bg-slate-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveGate(well.wellId)}
                        className="px-3 py-1 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded shadow"
                      >
                        Apply Aperture
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Visual Progress Bar */}
                    <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          well.operationalStatus === 'ACTIVE'
                            ? well.sluiceGateOpenPercentage > 80
                              ? 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                              : 'bg-gradient-to-r from-blue-600 to-cyan-500'
                            : 'bg-slate-700'
                        }`}
                        style={{ width: `${well.sluiceGateOpenPercentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/40 text-[11px]">
                      <span className="text-slate-400">Position: {well.sluiceGateOpenPercentage === 0 ? 'Closed' : well.sluiceGateOpenPercentage === 100 ? 'Full Throttle' : 'Partially Throttled'}</span>
                      <button
                        onClick={() => handleStartGateEdit(well)}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2"
                      >
                        Adjust Gate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
