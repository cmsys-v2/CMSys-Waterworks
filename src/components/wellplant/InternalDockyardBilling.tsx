import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { InternalPremisesBilling } from '../../types/wellWaterTreatment';
import {
  Building2,
  Plus,
  Calendar,
  Layers,
  Calculator,
  Droplets,
  DollarSign,
  Printer,
  X
} from 'lucide-react';

export const InternalDockyardBilling: React.FC = () => {
  const { internalBillingRecords, addInternalBillingRecord } = useData();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form State
  const [premisesCode, setPremisesCode] = useState<string>('NEW-PREMISES');
  const [premisesName, setPremisesName] = useState<string>('');
  const [meterNumber, setMeterNumber] = useState<string>('INT-MTR-');
  const [billingMonth, setBillingMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [previousReadingUnits, setPreviousReadingUnits] = useState<number>(1000);
  const [currentReadingUnits, setCurrentReadingUnits] = useState<number>(1120);
  const [internalAccountingRate, setInternalAccountingRate] = useState<number>(65.0);

  const consumedUnits = Math.max(0, currentReadingUnits - previousReadingUnits);
  const totalCost = consumedUnits * internalAccountingRate;

  const totalConsumedAll = internalBillingRecords.reduce(
    (sum, r) => sum + r.consumedUnits,
    0
  );
  const totalCostAll = internalBillingRecords.reduce(
    (sum, r) => sum + r.totalComputedCostLkr,
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!premisesName.trim() || currentReadingUnits < previousReadingUnits) {
      alert('Please check premises name and meter readings.');
      return;
    }

    const record: InternalPremisesBilling = {
      id: `INB-${Date.now()}`,
      premisesCode: premisesCode.trim().toUpperCase(),
      premisesName: premisesName.trim(),
      meterNumber: meterNumber.trim(),
      billingMonth,
      previousReadingUnits,
      currentReadingUnits,
      consumedUnits,
      internalAccountingRatePerUnit: internalAccountingRate,
      totalComputedCostLkr: totalCost
    };

    addInternalBillingRecord(record);
    setIsModalOpen(false);
    setPremisesName('');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-cyan-950 border border-cyan-800/60 text-cyan-400">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                Departmental Cost Apportionment
              </span>
              <span className="text-xs text-slate-400">Internal Premises Ledger</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mt-1">
              In-Dockyard Internal Supply Metering & Consumption Billing
            </h3>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-950/40 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Log Internal Meter Reading</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Internal Meters</span>
            <div className="text-xl font-black text-white mt-0.5">{internalBillingRecords.length} Meter Points</div>
            <span className="text-xs text-slate-400">Messes, workshops & hospital</span>
          </div>
          <div className="p-3 bg-cyan-950/60 rounded-xl text-cyan-400 border border-cyan-800/40">
            <Layers className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Consumed Volume</span>
            <div className="text-xl font-black text-cyan-400 mt-0.5 font-mono">
              {totalConsumedAll.toLocaleString()}{' '}
              <span className="text-xs text-slate-400 font-normal">m³ ({(totalConsumedAll * 1000).toLocaleString()} L)</span>
            </div>
            <span className="text-xs text-slate-400">Current accounting cycle</span>
          </div>
          <div className="p-3 bg-blue-950/60 rounded-xl text-blue-400 border border-blue-800/40">
            <Droplets className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Internal Cost Apportioned</span>
            <div className="text-xl font-black text-emerald-400 mt-0.5 font-mono">
              LKR {totalCostAll.toLocaleString()}
            </div>
            <span className="text-xs text-slate-400">Subsidized naval transfer tariff</span>
          </div>
          <div className="p-3 bg-emerald-950/60 rounded-xl text-emerald-400 border border-emerald-800/40">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Internal Billing Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Internal Departmental Apportionment Log ({internalBillingRecords.length} Premises)
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Premises / Facility</th>
                <th className="py-3 px-4">Meter Serial</th>
                <th className="py-3 px-4">Cycle</th>
                <th className="py-3 px-4">Prev Reading</th>
                <th className="py-3 px-4">Curr Reading</th>
                <th className="py-3 px-4">Consumed (m³)</th>
                <th className="py-3 px-4">Rate (LKR/m³)</th>
                <th className="py-3 px-4 text-right">Computed Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {internalBillingRecords.map(rec => (
                <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-sans">
                    <div className="font-bold text-white">{rec.premisesName}</div>
                    <span className="text-[10px] text-cyan-400 uppercase font-mono">{rec.premisesCode}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{rec.meterNumber}</td>
                  <td className="py-3 px-4 text-slate-400 font-sans">{rec.billingMonth}</td>
                  <td className="py-3 px-4 text-slate-400">{rec.previousReadingUnits.toLocaleString()}</td>
                  <td className="py-3 px-4 text-slate-200">{rec.currentReadingUnits.toLocaleString()}</td>
                  <td className="py-3 px-4 text-cyan-300 font-bold">
                    {rec.consumedUnits.toLocaleString()}{' '}
                    <span className="text-[10px] text-slate-500 font-normal">m³</span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{rec.internalAccountingRatePerUnit.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-black text-emerald-400">
                    LKR {rec.totalComputedCostLkr.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal to log internal reading */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-lg w-full space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-black text-white">Log Departmental Water Reading</h4>
                <p className="text-xs text-slate-400">Internal Dockyard Premises Consumption</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Premises Code</label>
                  <input
                    type="text"
                    placeholder="e.g. DOCKYARD-CANTEEN"
                    value={premisesCode}
                    onChange={e => setPremisesCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono uppercase focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Meter Serial</label>
                  <input
                    type="text"
                    value={meterNumber}
                    onChange={e => setMeterNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Premises / Facility Name</label>
                <input
                  type="text"
                  placeholder="e.g. Diver Training School & Tank"
                  value={premisesName}
                  onChange={e => setPremisesName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Billing Month</label>
                  <input
                    type="month"
                    value={billingMonth}
                    onChange={e => setBillingMonth(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Prev Reading (m³)</label>
                  <input
                    type="number"
                    value={previousReadingUnits}
                    onChange={e => setPreviousReadingUnits(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Curr Reading (m³)</label>
                  <input
                    type="number"
                    value={currentReadingUnits}
                    onChange={e => setCurrentReadingUnits(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Internal Transfer Rate (LKR / m³)
                </label>
                <input
                  type="number"
                  step="5"
                  value={internalAccountingRate}
                  onChange={e => setInternalAccountingRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500"
                  required
                />
              </div>

              {/* Live Preview */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs flex items-center justify-between font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">Consumed Units:</span>
                  <span className="text-sm font-bold text-cyan-300">{consumedUnits} m³</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Computed Internal Cost:</span>
                  <span className="text-base font-black text-emerald-400">LKR {totalCost.toLocaleString()}</span>
                </div>
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
                  Save Internal Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
