import React, { useState } from 'react';
import { JarTestExecution } from '../../types/waterDistribution';
import { calculateCoagulantMassKg } from '../../utils/tankCalculations';
import {
  FlaskConical,
  Calculator,
  Save,
  CheckCircle2,
  TrendingDown,
  Info,
  Sliders,
  Sparkles,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';

interface JarTestCalculatorProps {
  onSaveExecution?: (execution: JarTestExecution) => void;
  defaultInflowLiters?: number;
}

export const JarTestCalculator: React.FC<JarTestCalculatorProps> = ({
  onSaveExecution,
  defaultInflowLiters = 1850000
}) => {
  const [selectedCoagulant, setSelectedCoagulant] = useState<'PAC' | 'ALUM'>('PAC');
  const [rawTurbidityNtu, setRawTurbidityNtu] = useState<number>(18.5);
  const [rawPh, setRawPh] = useState<number>(7.35);
  const [waterTemperatureC, setWaterTemperatureC] = useState<number>(28.5);
  const [intakeFlowLiters, setIntakeFlowLiters] = useState<number>(defaultInflowLiters);
  const [optimalDosePpm, setOptimalDosePpm] = useState<number>(24.0);
  const [settledTurbidityNtu, setSettledTurbidityNtu] = useState<number>(0.95);
  const [isSavedSuccess, setIsSavedSuccess] = useState<boolean>(false);

  // Exact Chemical mass required in kg
  const calculatedChemicalRequiredKg = calculateCoagulantMassKg(intakeFlowLiters, optimalDosePpm);
  const hourlyChemicalKg = parseFloat((calculatedChemicalRequiredKg / 24).toFixed(2));

  // Auto recommend dosing based on Raw Turbidity & Coagulant
  const handleAutoRecommend = () => {
    let recDose = 15;
    if (selectedCoagulant === 'PAC') {
      // PAC typically requires ~ 1.2 to 1.5 ppm per NTU for moderate waters
      recDose = Math.round(Math.max(10, Math.min(60, rawTurbidityNtu * 1.3)));
    } else {
      // Alum typically requires ~ 1.8 to 2.2 ppm per NTU
      recDose = Math.round(Math.max(15, Math.min(80, rawTurbidityNtu * 1.9)));
    }
    setOptimalDosePpm(recDose);
    setSettledTurbidityNtu(parseFloat((Math.max(0.6, 1.2 - (recDose / 80))).toFixed(2)));
  };

  // Generate simulated 6-Jar Flocculation Profile for chart
  const jarCurveData = [
    { jar: 'Jar 1', dose: Math.max(5, optimalDosePpm - 15), turbidity: 4.8 },
    { jar: 'Jar 2', dose: Math.max(10, optimalDosePpm - 8), turbidity: 2.4 },
    { jar: 'Jar 3 (Opt)', dose: optimalDosePpm, turbidity: settledTurbidityNtu },
    { jar: 'Jar 4', dose: optimalDosePpm + 8, turbidity: Math.max(0.7, settledTurbidityNtu + 0.3) },
    { jar: 'Jar 5', dose: optimalDosePpm + 15, turbidity: Math.max(1.0, settledTurbidityNtu + 0.9) },
    { jar: 'Jar 6 (Overdose)', dose: optimalDosePpm + 25, turbidity: Math.max(1.8, settledTurbidityNtu + 1.8) }
  ];

  const handleCommitExecution = () => {
    const execution: JarTestExecution = {
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      rawWaterTurbidityNtu: rawTurbidityNtu,
      rawWaterPh: rawPh,
      waterTemperatureC: waterTemperatureC,
      optimalDosePpm: optimalDosePpm,
      selectedCoagulant: selectedCoagulant,
      settledTurbidityNtu: settledTurbidityNtu,
      calculatedChemicalRequiredKg: calculatedChemicalRequiredKg
    };

    if (onSaveExecution) {
      onSaveExecution(execution);
    }
    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-cyan-950 border border-cyan-800/60 text-cyan-400">
            <FlaskConical className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                Coagulation & Flocculation
              </span>
              <span className="text-xs text-slate-400">Jar Test Dosing Engine</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mt-1">
              Coagulant Dosing Assistant (PAC / Alum Mass Calculator)
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAutoRecommend}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-950 border border-cyan-600/50 hover:bg-cyan-900/60 text-cyan-300 font-bold text-xs shadow transition-all self-start sm:self-auto"
        >
          <Sparkles className="h-4 w-4" />
          <span>Heuristic Dosage Assistant</span>
        </button>
      </div>

      {/* Main Grid: Inputs vs Calculation Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Parameters (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            1. Lab Raw Water Parameters & Intake Flow
          </span>

          {/* Coagulant Toggle */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-2">Select Coagulant Agent</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedCoagulant('PAC')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  selectedCoagulant === 'PAC'
                    ? 'bg-cyan-950 border-cyan-500 text-white shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-xs font-black text-white">Poly Aluminium Chloride (PAC)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">High efficiency, low sludge volume, wide pH buffer</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCoagulant('ALUM')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  selectedCoagulant === 'ALUM'
                    ? 'bg-cyan-950 border-cyan-500 text-white shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-xs font-black text-white">Aluminium Sulphate (Alum)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Standard coagulation, consumes alkalinity</div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Raw Water Turbidity (NTU)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={rawTurbidityNtu}
                onChange={e => setRawTurbidityNtu(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Raw Water pH
              </label>
              <input
                type="number"
                step="0.05"
                min="4"
                max="10"
                value={rawPh}
                onChange={e => setRawPh(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Water Temperature (°C)
              </label>
              <input
                type="number"
                step="0.5"
                min="10"
                max="45"
                value={waterTemperatureC}
                onChange={e => setWaterTemperatureC(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Raw Intake Flow (Liters / 24h)
              </label>
              <input
                type="number"
                step="10000"
                min="10000"
                value={intakeFlowLiters}
                onChange={e => setIntakeFlowLiters(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
                required
              />
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Approx. {(intakeFlowLiters / 1000).toLocaleString()} m³/day
              </span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Jar Test Optimal Dose (mg/L or ppm)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="150"
                value={optimalDosePpm}
                onChange={e => setOptimalDosePpm(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-cyan-700 rounded-xl px-3 py-2 text-xs text-cyan-300 font-bold font-mono focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Settled Turbidity Result (NTU)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                value={settledTurbidityNtu}
                onChange={e => setSettledTurbidityNtu(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold font-mono focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            {isSavedSuccess && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-pulse">
                <CheckCircle2 className="h-4 w-4" />
                Jar test logged successfully!
              </span>
            )}
            <button
              type="button"
              onClick={handleCommitExecution}
              className="ml-auto flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/40"
            >
              <Save className="h-4 w-4" />
              <span>Record Jar Test Results</span>
            </button>
          </div>
        </div>

        {/* Right Output: Exact Chemical Mass Calculation & Curve (5 cols) */}
        <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
          {/* Main Calculation Card */}
          <div className="bg-gradient-to-br from-cyan-950 via-slate-950 to-blue-950 border border-cyan-800/80 rounded-3xl p-6 shadow-2xl space-y-4">
            <span className="text-[10px] uppercase font-black tracking-widest text-cyan-400 block">
              Calculated Chemical Requirement
            </span>

            <div>
              <span className="text-xs text-slate-400">Total 24h Chemical Mass</span>
              <div className="text-3xl font-black text-white font-mono flex items-baseline gap-2 mt-0.5">
                <span>{calculatedChemicalRequiredKg.toFixed(2)}</span>
                <span className="text-sm font-semibold text-cyan-300">kg of {selectedCoagulant}</span>
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                Continuous dosing rate: <strong className="text-cyan-200">{hourlyChemicalKg} kg / hour</strong>
              </span>
            </div>

            <div className="pt-3 border-t border-cyan-900/60 grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-cyan-800/40">
                <span className="text-[10px] uppercase text-slate-400 block font-semibold">Formula Used</span>
                <span className="text-xs font-mono text-slate-200 font-bold mt-0.5 block">
                  (Q × Dose) ÷ 10⁶
                </span>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-cyan-800/40">
                <span className="text-[10px] uppercase text-slate-400 block font-semibold">Expected Removal</span>
                <span className="text-xs font-mono text-emerald-300 font-bold mt-0.5 block">
                  {(((rawTurbidityNtu - settledTurbidityNtu) / rawTurbidityNtu) * 100).toFixed(1)}% Turbidity Cut
                </span>
              </div>
            </div>
          </div>

          {/* 6-Jar Flocculation Curve Visualizer */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <TrendingDown className="h-4 w-4 text-cyan-400" />
                Jar Test Turbidity vs. Dosage Response
              </span>
              <span className="text-[10px] text-slate-400">Optimal jar: Jar 3</span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={jarCurveData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="jar" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px' }}
                  />
                  <ReferenceLine y={1.0} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'SLS Limit 1.0 NTU', fill: '#f43f5e', fontSize: 10 }} />
                  <Line type="monotone" dataKey="turbidity" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 4, fill: '#0284c7' }} name="Settled NTU" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
