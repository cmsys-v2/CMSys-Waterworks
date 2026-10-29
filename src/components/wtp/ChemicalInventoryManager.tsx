import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { ChemicalInventoryItem } from '../../types/waterDistribution';
import {
  PackageCheck,
  AlertOctagon,
  Plus,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Layers,
  TrendingDown,
  X
} from 'lucide-react';

export const ChemicalInventoryManager: React.FC = () => {
  const { chemicalInventory, updateChemicalStock } = useData();

  const [selectedRestockItem, setSelectedRestockItem] = useState<ChemicalInventoryItem | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(500);

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestockItem || restockAmount <= 0) return;

    const newStock = selectedRestockItem.currentStock + restockAmount;
    updateChemicalStock(selectedRestockItem.id, newStock);
    setSelectedRestockItem(null);
    setRestockAmount(500);
  };

  const criticalItems = chemicalInventory.filter(i => i.reorderStatus === 'CRITICAL');
  const reorderItems = chemicalInventory.filter(i => i.reorderStatus === 'REORDER_NOW');

  return (
    <div className="space-y-6">
      {/* Top Banner & Alert Notices */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-cyan-950 border border-cyan-800/60 text-cyan-400">
              <PackageCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                  Chemical Logistics & Runways
                </span>
                <span className="text-xs text-slate-400">Anandamkulam WTP Depot</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-1">
                WTP Chemical Inventory & Depletion Runway Monitoring
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {criticalItems.length > 0 ? (
              <span className="px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-300 font-bold text-xs flex items-center gap-1.5 animate-pulse">
                <AlertOctagon className="h-4 w-4 text-rose-400" />
                <span>{criticalItems.length} Chemical at Critical Level!</span>
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Chemical Runways Adequate</span>
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Real-time tracking of Poly Aluminium Chloride (PAC), compressed chlorine gas drums, hydrated lime, and flocculant polymers with consumption runout projections.
        </p>
      </div>

      {/* Critical Stock Banners if any */}
      {criticalItems.map(item => (
        <div
          key={item.id}
          className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-rose-900/50 text-rose-300">
              <AlertOctagon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">CRITICAL STOCK DEPLETION: {item.name}</h4>
              <p className="text-xs text-rose-200">
                Current stock ({item.currentStock}{' '}
                {item.physicalForm === 'LIQUID_LITERS' ? 'L' : item.physicalForm === 'CYLINDERS' ? 'Cylinders' : 'kg'}) is below minimum threshold ({item.minimumThreshold}). Runway is only {item.runwayDays} days!
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedRestockItem(item)}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors self-start sm:self-auto shrink-0"
          >
            Log Emergency Delivery
          </button>
        </div>
      ))}

      {/* Chemical Stock Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {chemicalInventory.map(item => {
          const isCritical = item.reorderStatus === 'CRITICAL';
          const isReorder = item.reorderStatus === 'REORDER_NOW';
          const unit =
            item.physicalForm === 'LIQUID_LITERS'
              ? 'L'
              : item.physicalForm === 'CYLINDERS'
              ? 'Cylinders'
              : 'kg';

          const runwayColor = isCritical
            ? 'text-rose-400'
            : isReorder
            ? 'text-amber-400'
            : 'text-emerald-400';

          return (
            <div
              key={item.id}
              className={`bg-slate-900/80 border rounded-2xl p-5 shadow-xl flex flex-col justify-between transition-all duration-200 ${
                isCritical
                  ? 'border-rose-600/70 shadow-rose-950/20'
                  : isReorder
                  ? 'border-amber-600/70 shadow-amber-950/20'
                  : 'border-slate-800 hover:border-cyan-500/40'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
                    {item.id.toUpperCase()}
                  </span>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isCritical
                        ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
                        : isReorder
                        ? 'bg-amber-950 text-amber-300 border-amber-700'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                    }`}
                  >
                    {item.reorderStatus.replace('_', ' ')}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white">{item.name}</h4>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mt-0.5">
                  Form: {item.physicalForm.replace('_', ' ')}
                </span>

                {/* Stock & Runway Metrics */}
                <div className="my-4 grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">In Stock</span>
                    <div className="text-lg font-black text-white font-mono mt-0.5">
                      {item.currentStock.toLocaleString()}{' '}
                      <span className="text-xs text-slate-400 font-normal">{unit}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Runway Days</span>
                    <div className={`text-lg font-black font-mono mt-0.5 ${runwayColor}`}>
                      {item.runwayDays}{' '}
                      <span className="text-xs text-slate-400 font-normal">days</span>
                    </div>
                  </div>
                </div>

                {/* Threshold & Consumption Details */}
                <div className="space-y-1 text-[11px] text-slate-300 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Min Threshold:</span>
                    <span>{item.minimumThreshold.toLocaleString()} {unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Daily Average Burn:</span>
                    <span>{item.dailyAverageConsumption} {unit}/day</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setSelectedRestockItem(item)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Log Stock Replenishment</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Restock Modal */}
      {selectedRestockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md w-full space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white">Log Consignment Delivery</h4>
                <p className="text-xs text-slate-400">{selectedRestockItem.name}</p>
              </div>
              <button
                onClick={() => setSelectedRestockItem(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Quantity Received ({selectedRestockItem.physicalForm.replace('_', ' ')})
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={restockAmount}
                  onChange={e => setRestockAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
                  required
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Current Stock:</span>
                  <span className="font-mono text-white">{selectedRestockItem.currentStock}</span>
                </div>
                <div className="flex justify-between text-cyan-300 font-bold">
                  <span>New Projected Stock:</span>
                  <span className="font-mono">
                    {selectedRestockItem.currentStock + restockAmount}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRestockItem(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs text-white font-bold shadow"
                >
                  Commit Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
