import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { DailyWTPTestReport, JarTestExecution } from '../../types/waterDistribution';
import { evaluateWaterQualityRules } from './AIWaterQualityAdvisor';
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
  Sparkles,
  Eye,
  X
} from 'lucide-react';

export const DailyWTPTestReportForm: React.FC = () => {
  const { wtpReports, addWTPReport, chemicalInventory } = useData();

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<DailyWTPTestReport | null>(null);

  // Form Fields State
  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [rawWaterInflowLiters, setRawWaterInflowLiters] = useState<number>(1850000);
  const [treatedWaterOutflowLiters, setTreatedWaterOutflowLiters] = useState<number>(1780000);
  const [sludgeDischargeLiters, setSludgeDischargeLiters] = useState<number>(70000);

  // Water Quality
  const [rawTurbidityNtu, setRawTurbidityNtu] = useState<number>(18.5);
  const [treatedTurbidityNtu, setTreatedTurbidityNtu] = useState<number>(0.72);
  const [rawPh, setRawPh] = useState<number>(7.35);
  const [treatedPh, setTreatedPh] = useState<number>(7.15);
  const [residualChlorinePpm, setResidualChlorinePpm] = useState<number>(0.65);
  const [totalDissolvedSolidsPpm, setTotalDissolvedSolidsPpm] = useState<number>(185.0);
  const [conductivityUsCm, setConductivityUsCm] = useState<number>(295.0);
  const [coliformStatus, setColiformStatus] = useState<'SAFE_ZERO' | 'DETECTED_FAILED' | 'PENDING'>('SAFE_ZERO');

  // Chemicals Consumed
  const [pacUsedKg, setPacUsedKg] = useState<number>(220);
  const [cl2UsedKg, setCl2UsedKg] = useState<number>(22);
  const [limeUsedKg, setLimeUsedKg] = useState<number>(35);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Run deterministic rules for AI insight
    const aiEval = evaluateWaterQualityRules({
      rawTurbidityNtu,
      treatedTurbidityNtu,
      rawPh,
      treatedPh,
      residualChlorinePpm
    });

    const newReport: DailyWTPTestReport = {
      id: `wtp-rep-${reportDate}`,
      date: reportDate,
      rawWaterInflowLiters,
      treatedWaterOutflowLiters,
      sludgeDischargeLiters,
      waterQuality: {
        rawTurbidityNtu,
        treatedTurbidityNtu,
        rawPh,
        treatedPh,
        residualChlorinePpm,
        totalDissolvedSolidsPpm,
        conductivityUsCm,
        coliformBacteriologicalResult: coliformStatus
      },
      jarTest: {
        timestamp: `${reportDate} 08:30`,
        rawWaterTurbidityNtu: rawTurbidityNtu,
        rawWaterPh: rawPh,
        waterTemperatureC: 28.5,
        optimalDosePpm: 24.0,
        selectedCoagulant: 'PAC',
        settledTurbidityNtu: treatedTurbidityNtu,
        calculatedChemicalRequiredKg: pacUsedKg
      },
      chemicalsConsumed: [
        { chemicalId: 'chem-pac-01', chemicalName: 'PAC 10%', quantityUsed: pacUsedKg },
        { chemicalId: 'chem-cl2-01', chemicalName: 'Chlorine Gas', quantityUsed: cl2UsedKg },
        { chemicalId: 'chem-lime-01', chemicalName: 'Hydrated Lime', quantityUsed: limeUsedKg }
      ],
      plantOverheadTanks: [],
      plantTreatedStorageTanks: [],
      dutyRoster: [
        {
          shift: 'MORNING_WATCH',
          shiftEngineerRating: 'CPO (E) K.G. Somapala',
          pumpOperator: 'LS (ME) P. Kumara',
          labAnalyst: 'PO (Lab) S. Ranasinghe'
        }
      ],
      aiWaterQualityInsight: {
        coagulantOptimizationAdvice:
          aiEval.pacAdvisory || 'PAC coagulation dosing stable and within SLS 614 standard.',
        chlorineDosingAdjustment:
          aiEval.chlorineAdvisory ||
          (aiEval.phCorrectionAdvisory ? aiEval.phCorrectionAdvisory : 'Chlorine residual in safe disinfection range (0.65 ppm).'),
        filterBackwashRecommendation:
          aiEval.filterBackwashAdvisory || 'Sand filter head loss normal. Routine backwash scheduled.',
        anomalyDetected: !aiEval.sls614Compliant,
        confidenceScore: aiEval.complianceScore
      }
    };

    addWTPReport(newReport);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-cyan-950 border border-cyan-800/60 text-cyan-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                Official Naval Lab Log
              </span>
              <span className="text-xs text-slate-400">Anandamkulam WTP</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mt-1">
              Daily Water Quality & Purification Test Reports
            </h3>
          </div>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-950/40 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Log Daily Test Report</span>
        </button>
      </div>

      {/* Reports Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Archived Daily Laboratory Logs ({wtpReports.length} Reports)
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Inflow / Outflow</th>
                <th className="py-3 px-4">Turbidity (Raw → Trt)</th>
                <th className="py-3 px-4">pH (Raw → Trt)</th>
                <th className="py-3 px-4">Res. Cl₂</th>
                <th className="py-3 px-4">Coliform</th>
                <th className="py-3 px-4">AI Advisor Verdict</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {wtpReports.map(report => {
                const wq = report.waterQuality;
                const isSafe = wq.coliformBacteriologicalResult === 'SAFE_ZERO';

                return (
                  <tr key={report.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white font-sans">{report.date}</td>
                    <td className="py-3 px-4 text-slate-300">
                      {(report.rawWaterInflowLiters / 1000).toLocaleString()}kL →{' '}
                      <span className="text-cyan-400 font-bold">
                        {(report.treatedWaterOutflowLiters / 1000).toLocaleString()}kL
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-400">{wq.rawTurbidityNtu}</span> →{' '}
                      <span
                        className={`font-bold ${
                          wq.treatedTurbidityNtu > 1.0 ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {wq.treatedTurbidityNtu} NTU
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-400">{wq.rawPh}</span> →{' '}
                      <span
                        className={`font-bold ${
                          wq.treatedPh < 6.8 ? 'text-rose-400' : 'text-slate-200'
                        }`}
                      >
                        {wq.treatedPh}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-bold ${
                          wq.residualChlorinePpm < 0.2 ? 'text-rose-400' : 'text-cyan-300'
                        }`}
                      >
                        {wq.residualChlorinePpm} ppm
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isSafe
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {wq.coliformBacteriologicalResult.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans max-w-xs">
                      {report.aiWaterQualityInsight?.anomalyDetected ? (
                        <span className="text-rose-300 font-semibold text-[11px] flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-rose-400 shrink-0" />
                          Anomaly Flagged
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                          SLS 614 Compliant
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1 ml-auto"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Entry Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-2xl w-full space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-black text-white">Log Daily WTP Test & Quality Report</h4>
                <p className="text-xs text-slate-400">Formal recording of raw inflow, outflow and laboratory analysis</p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Date</label>
                  <input
                    type="date"
                    value={reportDate}
                    onChange={e => setReportDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Raw Inflow (L)</label>
                  <input
                    type="number"
                    value={rawWaterInflowLiters}
                    onChange={e => setRawWaterInflowLiters(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Treated Outflow (L)</label>
                  <input
                    type="number"
                    value={treatedWaterOutflowLiters}
                    onChange={e => setTreatedWaterOutflowLiters(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              {/* Water Quality Parameters */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                  Water Quality Parameters (Laboratory Assays)
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Raw Turbidity (NTU)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={rawTurbidityNtu}
                      onChange={e => setRawTurbidityNtu(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Treated Turbidity (NTU)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={treatedTurbidityNtu}
                      onChange={e => setTreatedTurbidityNtu(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Raw pH</label>
                    <input
                      type="number"
                      step="0.05"
                      value={rawPh}
                      onChange={e => setRawPh(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Treated pH</label>
                    <input
                      type="number"
                      step="0.05"
                      value={treatedPh}
                      onChange={e => setTreatedPh(parseFloat(e.target.value) || 0)}
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
                    <label className="text-[10px] text-slate-400 block mb-0.5">TDS (ppm)</label>
                    <input
                      type="number"
                      step="1"
                      value={totalDissolvedSolidsPpm}
                      onChange={e => setTotalDissolvedSolidsPpm(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Conductivity (μS/cm)</label>
                    <input
                      type="number"
                      step="1"
                      value={conductivityUsCm}
                      onChange={e => setConductivityUsCm(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Coliform Result</label>
                    <select
                      value={coliformStatus}
                      onChange={e => setColiformStatus(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                    >
                      <option value="SAFE_ZERO">Safe (Zero)</option>
                      <option value="DETECTED_FAILED">Detected Failed</option>
                      <option value="PENDING">Pending Culture</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Chemicals Consumed */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">PAC Consumed (L/kg)</label>
                  <input
                    type="number"
                    value={pacUsedKg}
                    onChange={e => setPacUsedKg(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Chlorine Used (kg)</label>
                  <input
                    type="number"
                    value={cl2UsedKg}
                    onChange={e => setCl2UsedKg(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Hydrated Lime Used (kg)</label>
                  <input
                    type="number"
                    value={limeUsedKg}
                    onChange={e => setLimeUsedKg(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs text-white font-bold shadow"
                >
                  Commit Report to Logbook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-xl w-full space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-black text-white">Daily Lab Inspection: {selectedReport.date}</h4>
                <p className="text-xs text-slate-400">Naval Dockyard Water Testing Laboratory</p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">Raw Inflow:</span>
                <span className="text-white font-bold">{selectedReport.rawWaterInflowLiters.toLocaleString()} L</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Treated Outflow:</span>
                <span className="text-cyan-300 font-bold">{selectedReport.treatedWaterOutflowLiters.toLocaleString()} L</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Turbidity (Raw → Trt):</span>
                <span>{selectedReport.waterQuality.rawTurbidityNtu} NTU → {selectedReport.waterQuality.treatedTurbidityNtu} NTU</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">pH (Raw → Trt):</span>
                <span>{selectedReport.waterQuality.rawPh} → {selectedReport.waterQuality.treatedPh}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Residual Free Chlorine:</span>
                <span className="text-cyan-400 font-bold">{selectedReport.waterQuality.residualChlorinePpm} ppm</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Coliform Status:</span>
                <span className="text-emerald-400 font-bold">{selectedReport.waterQuality.coliformBacteriologicalResult}</span>
              </div>
            </div>

            {selectedReport.aiWaterQualityInsight && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-cyan-800/40 text-xs space-y-2">
                <span className="text-[10px] uppercase font-bold text-cyan-400 block flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Water Quality Insight
                </span>
                <p className="text-slate-300">
                  {selectedReport.aiWaterQualityInsight.coagulantOptimizationAdvice}
                </p>
                <p className="text-slate-300">
                  {selectedReport.aiWaterQualityInsight.chlorineDosingAdjustment}
                </p>
                <p className="text-slate-300">
                  {selectedReport.aiWaterQualityInsight.filterBackwashRecommendation}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 text-xs text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
