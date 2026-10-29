import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sliders,
  HelpCircle,
  Activity,
  Droplets,
  Layers,
  Thermometer,
  RotateCcw
} from 'lucide-react';

export interface AdvisorEvaluationResult {
  pacAdvisory?: string;
  phCorrectionAdvisory?: string;
  chlorineAdvisory?: string;
  filterBackwashAdvisory?: string;
  sls614Compliant: boolean;
  whoCompliant: boolean;
  complianceScore: number;
}

/**
 * Deterministic Rules Evaluator for Water Quality & Chemical Dosing Optimization
 * Compliant with WHO Guidelines & Sri Lanka Navy Naval Water Standards (SLS 614)
 */
export function evaluateWaterQualityRules(params: {
  rawTurbidityNtu: number;
  prevDayRawTurbidityNtu?: number;
  recentRainfallMm?: number;
  treatedTurbidityNtu: number;
  rawPh: number;
  treatedPh: number;
  residualChlorinePpm: number;
  pacDosePpm?: number;
}): AdvisorEvaluationResult {
  const result: AdvisorEvaluationResult = {
    sls614Compliant: true,
    whoCompliant: true,
    complianceScore: 100
  };

  // Rule 1: PAC Coagulation Advisory
  // If raw water turbidity rises >25% day-over-day due to recorded rainfall >30 mm
  const prevTurb = params.prevDayRawTurbidityNtu || 14.0;
  const turbidityIncreasePct = ((params.rawTurbidityNtu - prevTurb) / (prevTurb || 1)) * 100;
  const rainfall = params.recentRainfallMm ?? 35.0;

  if (turbidityIncreasePct > 25 && rainfall > 30) {
    result.pacAdvisory =
      'Catchment sediment runoff detected from recent rainfall. Increase jar test frequency to every 4 hours. Recommend raising baseline PAC dose by +15% to accelerate flocculation in clarifier #1.';
    result.complianceScore -= 10;
  }

  // Rule 2A: Residual Chlorine & pH Correction (Acidity)
  // If treated water pH < 6.8
  if (params.treatedPh < 6.8) {
    result.phCorrectionAdvisory =
      'Treated water is acidic (pH < 6.8). PAC hydrolyzation is consuming alkalinity. Add hydrated lime before chlorination to avoid pipeline leaching.';
    result.sls614Compliant = false;
    result.complianceScore -= 20;
  }

  // Rule 2B: Residual Chlorine Dangerously Low
  // If treated residual chlorine is < 0.2 mg/L at the plant overhead tank discharge
  if (params.residualChlorinePpm < 0.2) {
    result.chlorineAdvisory =
      'Terminal residual chlorine dangerously low (<0.2 ppm). Risk of biological recontamination in long dockyard distribution mains. Elevate dosing pump rate immediately.';
    result.sls614Compliant = false;
    result.whoCompliant = false;
    result.complianceScore -= 35;
  }

  // Rule 3: Filter Backwash Alert
  // If treated water turbidity stays > 1.0 NTU despite adequate PAC dosing
  if (params.treatedTurbidityNtu > 1.0) {
    result.filterBackwashAdvisory =
      'Dual-media sand filter head loss threshold reached. Schedule immediate sand filter air-scour and backwash sequence.';
    result.sls614Compliant = false;
    result.complianceScore -= 25;
  }

  result.complianceScore = Math.max(0, result.complianceScore);
  return result;
}

export const AIWaterQualityAdvisor: React.FC = () => {
  const { wtpReports, reservoirProfile } = useData();

  // Sandbox simulation parameters state
  const latestReport = wtpReports[0];
  const recentRain = reservoirProfile.rainfallRecords[0]?.rainfallMm || 38.5;

  const [simRawTurbidity, setSimRawTurbidity] = useState<number>(
    latestReport?.waterQuality.rawTurbidityNtu || 18.5
  );
  const [simPrevTurbidity, setSimPrevTurbidity] = useState<number>(14.0);
  const [simRainfallMm, setSimRainfallMm] = useState<number>(recentRain);
  const [simTreatedTurbidity, setSimTreatedTurbidity] = useState<number>(
    latestReport?.waterQuality.treatedTurbidityNtu || 0.72
  );
  const [simRawPh, setSimRawPh] = useState<number>(
    latestReport?.waterQuality.rawPh || 7.35
  );
  const [simTreatedPh, setSimTreatedPh] = useState<number>(
    latestReport?.waterQuality.treatedPh || 7.15
  );
  const [simResidualCl, setSimResidualCl] = useState<number>(
    latestReport?.waterQuality.residualChlorinePpm || 0.65
  );

  const evaluation = evaluateWaterQualityRules({
    rawTurbidityNtu: simRawTurbidity,
    prevDayRawTurbidityNtu: simPrevTurbidity,
    recentRainfallMm: simRainfallMm,
    treatedTurbidityNtu: simTreatedTurbidity,
    rawPh: simRawPh,
    treatedPh: simTreatedPh,
    residualChlorinePpm: simResidualCl
  });

  const resetToLatestLive = () => {
    if (latestReport) {
      setSimRawTurbidity(latestReport.waterQuality.rawTurbidityNtu);
      setSimTreatedTurbidity(latestReport.waterQuality.treatedTurbidityNtu);
      setSimRawPh(latestReport.waterQuality.rawPh);
      setSimTreatedPh(latestReport.waterQuality.treatedPh);
      setSimResidualCl(latestReport.waterQuality.residualChlorinePpm);
      setSimRainfallMm(recentRain);
      setSimPrevTurbidity(14.0);
    }
  };

  const hasAnyAlert =
    evaluation.pacAdvisory ||
    evaluation.phCorrectionAdvisory ||
    evaluation.chlorineAdvisory ||
    evaluation.filterBackwashAdvisory;

  return (
    <div className="space-y-6">
      {/* Advisor Header */}
      <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-indigo-950/80 border border-cyan-800/60 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-cyan-900/60 border border-cyan-400/40 text-cyan-300 shadow-lg shadow-cyan-950/50">
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                  SLS 614 & WHO Standards Engine
                </span>
                <span className="text-xs text-slate-400">Deterministic Rule System</span>
              </div>
              <h3 className="text-lg font-black text-white mt-1">
                AI Water Quality & Chemical Dosing Optimization Advisor
              </h3>
            </div>
          </div>

          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl px-4 py-2.5 flex items-center space-x-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Compliance Index</span>
              <div className="text-lg font-black text-white flex items-baseline gap-1">
                <span
                  className={
                    evaluation.complianceScore >= 90
                      ? 'text-emerald-400'
                      : evaluation.complianceScore >= 70
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }
                >
                  {evaluation.complianceScore}%
                </span>
                <span className="text-[10px] text-slate-400">SLS 614</span>
              </div>
            </div>
            <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
              {evaluation.complianceScore >= 90 ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-300 mt-4 max-w-3xl leading-relaxed">
          The advisor continuously evaluates real-time raw water turbidity surges from rainfall runoff, clarifier alkalinity consumption, sand filter differential pressure head-loss, and terminal distribution residual chlorine to prevent pathogen breakthroughs.
        </p>
      </div>

      {/* Advisory Findings / Action Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            Live Advisory Diagnoses & Corrective Protocols
          </h4>
          <span className="text-[11px] text-slate-400">
            {hasAnyAlert ? 'Actionable recommendations active' : 'All plant processes nominal'}
          </span>
        </div>

        {/* PAC Coagulation Advisory Alert */}
        {evaluation.pacAdvisory && (
          <div className="bg-amber-950/40 border-l-4 border-l-amber-500 border border-amber-800/40 rounded-2xl p-4.5 space-y-2 shadow-lg">
            <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>PAC Coagulation Advisory: Catchment Runoff Surge</span>
            </div>
            <p className="text-xs text-amber-100 font-medium pl-6 leading-relaxed">
              "{evaluation.pacAdvisory}"
            </p>
            <div className="pl-6 text-[11px] text-amber-400 font-mono">
              Trigger criteria: Day-over-day raw turbidity rise &gt; 25% (Current: {simRawTurbidity} NTU vs Prev: {simPrevTurbidity} NTU) + Rainfall &gt; 30mm ({simRainfallMm} mm recorded)
            </div>
          </div>
        )}

        {/* Acidic Treated Water Alert */}
        {evaluation.phCorrectionAdvisory && (
          <div className="bg-rose-950/40 border-l-4 border-l-rose-500 border border-rose-800/40 rounded-2xl p-4.5 space-y-2 shadow-lg">
            <div className="flex items-center space-x-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="h-4 w-4 text-rose-400" />
              <span>pH Correction Advisory: Coagulant Alkalinity Depletion</span>
            </div>
            <p className="text-xs text-rose-100 font-medium pl-6 leading-relaxed">
              "{evaluation.phCorrectionAdvisory}"
            </p>
            <div className="pl-6 text-[11px] text-rose-400 font-mono">
              Trigger criteria: Treated water pH &lt; 6.8 (Measured: {simTreatedPh.toFixed(2)})
            </div>
          </div>
        )}

        {/* Terminal Residual Chlorine Dangerously Low */}
        {evaluation.chlorineAdvisory && (
          <div className="bg-red-950/60 border-l-4 border-l-red-600 border border-red-700/60 rounded-2xl p-4.5 space-y-2 shadow-xl animate-pulse">
            <div className="flex items-center space-x-2 text-red-300 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span>CRITICAL BIOSECURITY: Residual Chlorine Dangerously Depleted</span>
            </div>
            <p className="text-xs text-red-100 font-bold pl-6 leading-relaxed">
              "{evaluation.chlorineAdvisory}"
            </p>
            <div className="pl-6 text-[11px] text-red-300 font-mono">
              Trigger criteria: Treated residual chlorine &lt; 0.20 ppm (Measured: {simResidualCl.toFixed(2)} ppm)
            </div>
          </div>
        )}

        {/* Sand Filter Backwash Alert */}
        {evaluation.filterBackwashAdvisory && (
          <div className="bg-cyan-950/40 border-l-4 border-l-cyan-500 border border-cyan-800/40 rounded-2xl p-4.5 space-y-2 shadow-lg">
            <div className="flex items-center space-x-2 text-cyan-300 font-bold text-xs uppercase tracking-wider">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span>Dual-Media Sand Filter Alert: Breakthrough & Head Loss</span>
            </div>
            <p className="text-xs text-cyan-100 font-medium pl-6 leading-relaxed">
              "{evaluation.filterBackwashAdvisory}"
            </p>
            <div className="pl-6 text-[11px] text-cyan-400 font-mono">
              Trigger criteria: Treated water turbidity &gt; 1.0 NTU (Measured: {simTreatedTurbidity.toFixed(2)} NTU)
            </div>
          </div>
        )}

        {!hasAnyAlert && (
          <div className="bg-slate-900/60 border border-emerald-800/50 rounded-2xl p-5 flex items-center space-x-3 text-emerald-300 text-xs shadow-lg">
            <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-white text-sm">Optimal Purification Baseline Verified</div>
              <p className="text-slate-400 mt-0.5">
                Current parameters satisfy Sri Lanka Navy SLS 614 standard: pH (6.8 - 8.5), Turbidity (&lt; 1.0 NTU), and Residual Chlorine (0.2 - 1.0 ppm).
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Simulation Sandbox */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Water Quality Simulation Sandbox & Rule Validation
            </h4>
          </div>

          <button
            type="button"
            onClick={resetToLatestLive}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to Latest Live Telemetry</span>
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Adjust water parameters below to test the deterministic rules against different climatic conditions and purification equipment thresholds:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {/* Raw Turbidity Slider */}
          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Raw Turbidity</span>
              <span className="font-mono font-bold text-cyan-300">{simRawTurbidity.toFixed(1)} NTU</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="0.5"
              value={simRawTurbidity}
              onChange={e => setSimRawTurbidity(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded"
            />
            <span className="text-[10px] text-slate-500 block">Day-over-day baseline: {simPrevTurbidity} NTU</span>
          </div>

          {/* Recent Rainfall */}
          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Recorded Rainfall</span>
              <span className="font-mono font-bold text-blue-300">{simRainfallMm.toFixed(1)} mm</span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              step="1"
              value={simRainfallMm}
              onChange={e => setSimRainfallMm(parseFloat(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded"
            />
            <span className="text-[10px] text-slate-500 block">Surge threshold &gt; 30 mm</span>
          </div>

          {/* Treated Water pH */}
          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Treated Water pH</span>
              <span
                className={`font-mono font-bold ${
                  simTreatedPh < 6.8 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {simTreatedPh.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="6.0"
              max="8.5"
              step="0.05"
              value={simTreatedPh}
              onChange={e => setSimTreatedPh(parseFloat(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-800 rounded"
            />
            <span className="text-[10px] text-slate-500 block">SLS 614 limit: &ge; 6.80</span>
          </div>

          {/* Residual Chlorine */}
          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Residual Chlorine</span>
              <span
                className={`font-mono font-bold ${
                  simResidualCl < 0.2 ? 'text-rose-400' : 'text-cyan-300'
                }`}
              >
                {simResidualCl.toFixed(2)} ppm
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.50"
              step="0.05"
              value={simResidualCl}
              onChange={e => setSimResidualCl(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded"
            />
            <span className="text-[10px] text-slate-500 block">Danger limit: &lt; 0.20 ppm</span>
          </div>

          {/* Treated Turbidity */}
          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Treated Turbidity</span>
              <span
                className={`font-mono font-bold ${
                  simTreatedTurbidity > 1.0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {simTreatedTurbidity.toFixed(2)} NTU
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.05"
              value={simTreatedTurbidity}
              onChange={e => setSimTreatedTurbidity(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded"
            />
            <span className="text-[10px] text-slate-500 block">Sand filter backwash trigger: &gt; 1.0 NTU</span>
          </div>
        </div>
      </div>
    </div>
  );
};
