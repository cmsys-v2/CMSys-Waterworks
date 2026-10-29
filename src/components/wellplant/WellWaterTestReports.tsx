import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { WellTreatmentLog } from '../../types/wellWaterTreatment';
import {
  FileText,
  Plus,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Droplets,
  Layers,
  Thermometer,
  ShieldCheck,
  User,
  X
} from 'lucide-react';

export const WellWaterTestReports: React.FC = () => {
  const { wellTreatmentLogs, addWellTreatmentLog } = useData();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form Fields State
  const [timestamp, setTimestamp] = useState<string>(
    new Date().toISOString().slice(0, 16).replace('T', ' ')
  );
  const [rawWaterPumpedLiters, setRawWaterPumpedLiters] = useState<number>(1850000);
  const [treatedWaterYieldLiters, setTreatedWaterYieldLiters] = useState<number>(1775000);
  const [backwashLossLiters, setBackwashLossLiters] = useState<number>(75000);
  const [alumOrPacKg, setAlumOrPacKg] = useState<number>(44.0);
  const [limeKg, setLimeKg] = useState<number>(35.0);
  const [chlorineKg, setChlorineKg] = useState<number>(22.0);

  // Water Quality Fields
  const [turbidityNtu, setTurbidityNtu] = useState<number>(0.72);
  const [ph, setPh] = useState<number>(7.15);
  const [ironMgL, setIronMgL] = useState<number>(0.08);
  const [totalHardnessMgL, setTotalHardnessMgL] = useState<number>(145.0);
  const [residualChlorinePpm, setResidualChlorinePpm] = useState<number>(0.65);
  const [ecoliColiform, setEcoliColiform] = useState<'PASS_NIL' | 'FAIL_DETECTED'>('PASS_NIL');
  const [analystBadge, setAnalystBadge] = useState<string>('PO (Lab) S. Ranasinghe');
  const [remarks, setRemarks] = useState<string>(
    'Well extraction clear; iron and hardness well within SLS 614 standard.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newLog: WellTreatmentLog = {
      id: `WTL-${Date.now()}`,
      timestamp,
      rawWaterPumpedLiters,
      treatedWaterYieldLiters,
      backwashLossLiters,
      treatmentChemicals: {
        alumOrPacKg,
        limeKg,
        chlorineKg
      },
      waterQuality: {
        turbidityNtu,
        ph,
        ironMgL,
        totalHardnessMgL,
        residualChlorinePpm,
        ecoliColiform
      },
      analystBadge: analystBadge.trim() || 'Naval Lab Watchkeeper',
      remarks: remarks.trim()
    };

    addWellTreatmentLog(newLog);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-cyan-950 border border-cyan-800/60 text-cyan-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                Ground Water Assays
              </span>
              <span className="text-xs text-slate-400">SLS 614 Naval Quality Audit</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mt-1">
              Well Water Treatment & Chemical Quality Reports
            </h3>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-950/40 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Log Treatment & Lab Report</span>
        </button>
      </div>

      {/* SLS 614 Standards Reference Strip */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Turbidity (NTU)</span>
          <span className="font-mono font-bold text-cyan-300">&lt; 2.0 NTU</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">pH Value</span>
          <span className="font-mono font-bold text-slate-200">6.50 – 8.50</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Iron Content (Fe)</span>
          <span className="font-mono font-bold text-cyan-300">&lt; 0.30 mg/L</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Hardness</span>
          <span className="font-mono font-bold text-slate-200">&lt; 250 mg/L</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Residual Free Cl₂</span>
          <span className="font-mono font-bold text-cyan-300">0.2 – 0.5 ppm</span>
        </div>
      </div>

      {/* Historical Test Logs Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Treatment Records Archive ({wellTreatmentLogs.length} Reports)
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">Raw Pumped → Yield</th>
                <th className="py-3 px-4">Turbidity</th>
                <th className="py-3 px-4">pH</th>
                <th className="py-3 px-4">Iron (mg/L)</th>
                <th className="py-3 px-4">Hardness</th>
                <th className="py-3 px-4">Residual Cl₂</th>
                <th className="py-3 px-4">E.coli</th>
                <th className="py-3 px-4">Analyst</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {wellTreatmentLogs.map(log => {
                const wq = log.waterQuality;
                const isEcoliPass = wq.ecoliColiform === 'PASS_NIL';
                const isIronPass = wq.ironMgL <= 0.3;
                const isTurbPass = wq.turbidityNtu <= 2.0;

                return (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white font-sans">{log.timestamp}</td>
                    <td className="py-3 px-4 text-slate-300">
                      {(log.rawWaterPumpedLiters / 1000).toLocaleString()}kL →{' '}
                      <span className="text-cyan-400 font-bold">
                        {(log.treatedWaterYieldLiters / 1000).toLocaleString()}kL
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={isTurbPass ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {wq.turbidityNtu} NTU
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-200">{wq.ph}</td>
                    <td className="py-3 px-4">
                      <span className={isIronPass ? 'text-slate-200' : 'text-rose-400 font-bold'}>
                        {wq.ironMgL} mg/L
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{wq.totalHardnessMgL} mg/L</td>
                    <td className="py-3 px-4 text-cyan-300 font-bold">{wq.residualChlorinePpm} ppm</td>
                    <td className="py-3 px-4 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isEcoliPass
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {wq.ecoliColiform.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-sans flex items-center gap-1">
                      <User className="h-3 w-3 text-slate-500" />
                      {log.analystBadge}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-2xl w-full space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-black text-white">Log Well Water Purification & Quality Assays</h4>
                <p className="text-xs text-slate-400">Ground extraction volumes, chemical dosing, and laboratory compliance</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Timestamp</label>
                  <input
                    type="text"
                    value={timestamp}
                    onChange={e => setTimestamp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Raw Well Pumped (L)</label>
                  <input
                    type="number"
                    value={rawWaterPumpedLiters}
                    onChange={e => setRawWaterPumpedLiters(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Treated Yield (L)</label>
                  <input
                    type="number"
                    value={treatedWaterYieldLiters}
                    onChange={e => setTreatedWaterYieldLiters(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              {/* Chemical Inputs */}
              <div className="grid grid-cols-3 gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Alum / PAC (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={alumOrPacKg}
                    onChange={e => setAlumOrPacKg(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Hydrated Lime (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={limeKg}
                    onChange={e => setLimeKg(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Chlorine Dosed (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={chlorineKg}
                    onChange={e => setChlorineKg(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Laboratory Quality Assays */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                  Ground Water Quality Assays (SLS 614 Standard)
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Turbidity (NTU)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={turbidityNtu}
                      onChange={e => setTurbidityNtu(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">pH Value</label>
                    <input
                      type="number"
                      step="0.05"
                      value={ph}
                      onChange={e => setPh(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Iron Content (mg/L)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={ironMgL}
                      onChange={e => setIronMgL(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Total Hardness (mg/L)</label>
                    <input
                      type="number"
                      step="1"
                      value={totalHardnessMgL}
                      onChange={e => setTotalHardnessMgL(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Residual Cl₂ (ppm)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={residualChlorinePpm}
                      onChange={e => setResidualChlorinePpm(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">E.coli / Coliform</label>
                    <select
                      value={ecoliColiform}
                      onChange={e => setEcoliColiform(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                    >
                      <option value="PASS_NIL">Pass (Nil)</option>
                      <option value="FAIL_DETECTED">Fail (Detected)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Water Quality Analyst Badge / Rating
                </label>
                <input
                  type="text"
                  value={analystBadge}
                  onChange={e => setAnalystBadge(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Remarks / Clarifier Observations
                </label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs text-white font-bold shadow"
                >
                  Save Treatment Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
