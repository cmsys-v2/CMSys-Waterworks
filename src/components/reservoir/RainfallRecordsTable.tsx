import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { CloudRain, Plus, Calendar, User, TrendingUp, BarChart3, Database } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { calculateCatchmentRunoffLiters } from '../../utils/tankCalculations';

export const RainfallRecordsTable: React.FC = () => {
  const { reservoirProfile, addRainfallRecord } = useData();

  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [recordedDate, setRecordedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [rainfallMm, setRainfallMm] = useState<number>(15.0);
  const [customRunoff, setCustomRunoff] = useState<string>('');
  const [recordedBy, setRecordedBy] = useState<string>('PO (Met) D. Bandara');

  const records = reservoirProfile.rainfallRecords || [];

  // Sort chronological for chart display
  const chartData = [...records]
    .sort((a, b) => new Date(a.recordedDate).getTime() - new Date(b.recordedDate).getTime())
    .map(r => ({
      date: r.recordedDate.slice(5), // MM-DD
      fullDate: r.recordedDate,
      rainfallMm: r.rainfallMm,
      runoffMillions: parseFloat((r.catchmentRunoffEstLiters / 1000000).toFixed(2)),
      recordedBy: r.recordedBy
    }));

  const autoRunoffLiters = calculateCatchmentRunoffLiters(rainfallMm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordedDate || rainfallMm < 0) return;

    const estRunoff = customRunoff ? parseFloat(customRunoff) : autoRunoffLiters;
    addRainfallRecord({
      recordedDate,
      rainfallMm,
      catchmentRunoffEstLiters: estRunoff,
      recordedBy: recordedBy.trim() || 'Naval Met Watchkeeper'
    });

    setIsAdding(false);
    setRainfallMm(0);
    setCustomRunoff('');
  };

  const totalRecentRainfallMm = records.reduce((sum, r) => sum + r.rainfallMm, 0);
  const totalRecentRunoffL = records.reduce((sum, r) => sum + r.catchmentRunoffEstLiters, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Logged Periods</span>
            <div className="text-xl font-black text-white mt-0.5">{records.length} Days</div>
            <span className="text-xs text-slate-400">Continuous meteorological telemetry</span>
          </div>
          <div className="p-3 bg-cyan-950/60 rounded-xl text-cyan-400 border border-cyan-800/40">
            <Calendar className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Cumulative Precipitation</span>
            <div className="text-xl font-black text-blue-400 mt-0.5">{totalRecentRainfallMm.toFixed(1)} mm</div>
            <span className="text-xs text-slate-400">Anandamkulam Dockyard Catchment</span>
          </div>
          <div className="p-3 bg-blue-950/60 rounded-xl text-blue-400 border border-blue-800/40">
            <CloudRain className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Basin Infiltration Runoff</span>
            <div className="text-xl font-black text-emerald-400 mt-0.5">
              {(totalRecentRunoffL / 1000000).toFixed(2)} ML
            </div>
            <span className="text-xs text-slate-400">Approx. {(totalRecentRunoffL).toLocaleString()} Liters</span>
          </div>
          <div className="p-3 bg-emerald-950/60 rounded-xl text-emerald-400 border border-emerald-800/40">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Historical Telemetry Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-cyan-400" />
            <div>
              <h4 className="text-sm font-bold text-white">Daily Precipitation vs. Inflow Catchment Runoff</h4>
              <p className="text-xs text-slate-400">Precipitation depth (mm) mapped against estimated basin replenishment (Million Liters)</p>
            </div>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-900/30 transition-all self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Log Daily Rain</span>
          </button>
        </div>

        {/* Modal / Inline Add Form */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-6 bg-slate-950/90 border border-cyan-800/50 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <CloudRain className="h-4 w-4 text-cyan-400" />
                Add Daily Meteorological Precipitation Record
              </span>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Observation Date</label>
                <input
                  type="date"
                  value={recordedDate}
                  onChange={e => setRecordedDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Rainfall Depth (mm)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={rainfallMm}
                  onChange={e => setRainfallMm(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Est. Runoff (Liters) <span className="text-slate-400 font-normal">(Auto: ~120k L/mm)</span>
                </label>
                <input
                  type="number"
                  placeholder={autoRunoffLiters.toString()}
                  value={customRunoff}
                  onChange={e => setCustomRunoff(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Logged By (Watchkeeper)</label>
                <input
                  type="text"
                  value={recordedBy}
                  onChange={e => setRecordedBy(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-950/40"
              >
                Save Record to Basin Telemetry
              </button>
            </div>
          </form>
        )}

        <div className="h-64 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" stroke="#38bdf8" tick={{ fontSize: 11 }} label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', fill: '#38bdf8', fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#34d399" tick={{ fontSize: 11 }} label={{ value: 'Runoff (ML)', angle: 90, position: 'insideRight', fill: '#34d399', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  labelFormatter={(val, payload) => payload?.[0]?.payload?.fullDate || val}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="rainfallMm" fill="#0284c7" name="Rainfall (mm)" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="runoffMillions" stroke="#10b981" strokeWidth={2.5} name="Catchment Runoff (ML)" dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              No precipitation records logged yet.
            </div>
          )}
        </div>
      </div>

      {/* Historical Records Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Meteorological Telemetry Log Archive</h4>
          </div>
          <span className="text-[11px] text-slate-400">Total Records: {records.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Precipitation (mm)</th>
                <th className="py-3 px-4">Catchment Inflow Runoff</th>
                <th className="py-3 px-4">Hydrology Classification</th>
                <th className="py-3 px-4">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {records.map(record => {
                const isHeavy = record.rainfallMm >= 25;
                const isModerate = record.rainfallMm >= 10 && record.rainfallMm < 25;

                return (
                  <tr key={record.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-200">{record.recordedDate}</td>
                    <td className="py-3 px-4 text-cyan-300 font-bold">{record.rainfallMm.toFixed(1)} mm</td>
                    <td className="py-3 px-4 text-emerald-400">
                      {(record.catchmentRunoffEstLiters / 1000000).toFixed(2)} ML{' '}
                      <span className="text-slate-500 text-[10px]">({record.catchmentRunoffEstLiters.toLocaleString()} L)</span>
                    </td>
                    <td className="py-3 px-4">
                      {isHeavy ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/70 text-rose-300 border border-rose-800/50">
                          Heavy Downpour (Runoff Surge)
                        </span>
                      ) : isModerate ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950/70 text-blue-300 border border-blue-800/50">
                          Moderate Monsoon Rain
                        </span>
                      ) : record.rainfallMm > 0 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/70 text-cyan-300 border border-cyan-800/50">
                          Light Shower
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
                          Dry Weather / Nil
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-sans flex items-center gap-1.5">
                      <User className="h-3 w-3 text-slate-500" />
                      {record.recordedBy}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
