import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { NonNavalConsumer, CommercialWaterBill } from '../../types/commercialBilling';
import { computeCommercialBill, ComputedBillResult } from '../../services/tariffEngine';
import {
  FileText,
  Calculator,
  Calendar,
  Layers,
  DollarSign,
  AlertCircle,
  X,
  CheckCircle2,
  Printer
} from 'lucide-react';

interface MeterReadingEntryModalProps {
  onClose: () => void;
  preselectedConsumer?: NonNavalConsumer | null;
  onBillGenerated?: (bill: CommercialWaterBill) => void;
}

export const MeterReadingEntryModal: React.FC<MeterReadingEntryModalProps> = ({
  onClose,
  preselectedConsumer,
  onBillGenerated
}) => {
  const { nonNavalConsumers, commercialBills, createCommercialBill } = useData();

  const [selectedAccountNumber, setSelectedAccountNumber] = useState<string>(
    preselectedConsumer?.accountNumber || nonNavalConsumers[0]?.accountNumber || ''
  );

  const selectedConsumer = nonNavalConsumers.find(
    c => c.accountNumber === selectedAccountNumber
  );

  // Default billing month: current month YYYY-MM
  const currentYearMonth = new Date().toISOString().slice(0, 7);
  const [billingPeriod, setBillingPeriod] = useState<string>(currentYearMonth);
  const [billDate, setBillDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  // Due date: default 21 days from bill date
  const defaultDueDate = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const [dueDate, setDueDate] = useState<string>(defaultDueDate);

  // Meter readings
  const [previousReading, setPreviousReading] = useState<number>(
    selectedConsumer?.initialReadingUnits || 0
  );
  const [currentReading, setCurrentReading] = useState<number>(
    (selectedConsumer?.initialReadingUnits || 0) + 45
  );

  useEffect(() => {
    if (selectedConsumer) {
      setPreviousReading(selectedConsumer.initialReadingUnits);
      setCurrentReading(selectedConsumer.initialReadingUnits + 45);
    }
  }, [selectedAccountNumber]);

  const unitsConsumed = Math.max(0, currentReading - previousReading);
  const arrears = selectedConsumer?.currentArrearsLkr || 0;

  // Compute bill via NWSDB 2023 Gazette Tariff Engine
  const computation: ComputedBillResult = computeCommercialBill(
    unitsConsumed,
    selectedConsumer?.category || 'COMMERCIAL_PRIVATE',
    arrears
  );

  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsumer) return;

    if (currentReading < previousReading) {
      alert('Current meter reading cannot be lower than the previous reading.');
      return;
    }

    const billNumber = `INV-${billingPeriod.replace('-', '')}-${String(
      commercialBills.length + 1
    ).padStart(3, '0')}`;

    const newBill: CommercialWaterBill = {
      billNumber,
      accountNumber: selectedConsumer.accountNumber,
      billingPeriod,
      billDate,
      dueDate,
      previousMeterReading: previousReading,
      currentMeterReading: currentReading,
      totalUnitsConsumed: unitsConsumed,
      volumetricChargeLkr: computation.volumetric,
      fixedServiceChargeLkr: computation.fixedCharge,
      vatOrSurchargeLkr: computation.vatOrSurcharge,
      broughtForwardArrearsLkr: arrears,
      totalPayableLkr: computation.total,
      paymentStatus: 'UNPAID',
      amountPaidLkr: 0
    };

    createCommercialBill(newBill);
    if (onBillGenerated) {
      onBillGenerated(newBill);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-2xl w-full space-y-5 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-cyan-950 border border-cyan-800/60 text-cyan-400">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                1-Click Commercial Bill & Invoice Generator
              </h3>
              <p className="text-xs text-slate-400">
                Calculated via NWSDB August 2023 Gazette Tariff Structure
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleGenerateInvoice} className="space-y-4">
          {/* Consumer Selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Select Commercial Consumer Account
            </label>
            <select
              value={selectedAccountNumber}
              onChange={e => setSelectedAccountNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 font-mono"
            >
              {nonNavalConsumers.map(c => (
                <option key={c.accountNumber} value={c.accountNumber}>
                  [{c.accountNumber}] {c.consumerName} ({c.category.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>

          {/* Account Overview Box */}
          {selectedConsumer && (
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block">Meter Serial:</span>
                <span className="text-white font-bold">{selectedConsumer.meterSerial}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Location:</span>
                <span className="text-slate-200 line-clamp-1">{selectedConsumer.connectionLocation}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Brought Forward Arrears:</span>
                <span className={arrears > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  LKR {arrears.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Billing Cycle & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Billing Period (YYYY-MM)
              </label>
              <input
                type="month"
                value={billingPeriod}
                onChange={e => setBillingPeriod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-cyan-500"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Bill Issue Date
              </label>
              <input
                type="date"
                value={billDate}
                onChange={e => setBillDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-cyan-500"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Payment Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-cyan-500"
                required
              />
            </div>
          </div>

          {/* Meter Readings */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
              Meter Readings (1 Unit = 1 m³ = 1,000 Liters)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  Previous Reading (m³)
                </label>
                <input
                  type="number"
                  min="0"
                  value={previousReading}
                  onChange={e => setPreviousReading(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  Current Reading (m³)
                </label>
                <input
                  type="number"
                  min="0"
                  value={currentReading}
                  onChange={e => setCurrentReading(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  Consumed Units (m³)
                </label>
                <div className="w-full bg-slate-900 border border-cyan-800/60 rounded-xl px-3 py-2 text-xs font-bold font-mono text-cyan-300">
                  {unitsConsumed} Units ({ (unitsConsumed * 1000).toLocaleString() } L)
                </div>
              </div>
            </div>
          </div>

          {/* Live Gazette Calculation Breakdown */}
          <div className="bg-gradient-to-br from-cyan-950/60 via-slate-950 to-blue-950/60 border border-cyan-800/60 rounded-2xl p-4.5 space-y-3 shadow-xl">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-300 block">
              Itemized Gazette Tariff Breakdown
            </span>

            <div className="space-y-1.5 text-xs font-mono">
              {computation.slabBreakdown.map((item, idx) => (
                <div key={idx} className="flex justify-between text-slate-300">
                  <span>{item.slabDescription} ({item.unitsInSlab} units @ LKR {item.ratePerUnit}):</span>
                  <span>LKR {item.amountLkr.toLocaleString()}</span>
                </div>
              ))}

              <div className="flex justify-between text-slate-300 border-t border-slate-800/80 pt-1.5">
                <span>Fixed Monthly Service Charge:</span>
                <span>LKR {computation.fixedCharge.toLocaleString()}</span>
              </div>

              {arrears > 0 && (
                <div className="flex justify-between text-rose-300">
                  <span>Brought-Forward Arrears:</span>
                  <span>LKR {arrears.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-black text-emerald-400 border-t-2 border-slate-700 pt-2">
                <span className="font-sans uppercase">Total Amount Payable:</span>
                <span>LKR {computation.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/40"
            >
              <FileText className="h-4 w-4" />
              <span>Generate Official Naval Invoice</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
