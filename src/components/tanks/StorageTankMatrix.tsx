import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { DetailedStorageTank, TankClassification } from '../../types/waterDistribution';
import { TankDimensionCalculator } from './TankDimensionCalculator';
import { TankVisualCrossSection } from './TankVisualCrossSection';
import {
  Database,
  Plus,
  Search,
  Filter,
  Maximize2,
  Edit3,
  Trash2,
  AlertTriangle,
  Droplets,
  Layers,
  Phone,
  User,
  CheckCircle2,
  Clock
} from 'lucide-react';

const CLASSIFICATION_LABELS: Record<TankClassification, string> = {
  MAIN_PUMP_HOUSE: 'Main Pump House',
  OVERHEAD_TOWER: 'Overhead Tower',
  VITAL_COMMAND_CHALET: 'Vital Command Chalet',
  VITAL_WARDROOM: 'Vital Wardroom',
  VITAL_BASE_HOSPITAL: 'Vital Base Hospital',
  PLASTIC_SHELL_SINTEC: 'Plastic Shell Sintec',
  PLASTIC_SHELL_POLY: 'Plastic Shell Poly'
};

export const StorageTankMatrix: React.FC = () => {
  const { storageTanks, deleteStorageTank } = useData();

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedWaterType, setSelectedWaterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [editingTank, setEditingTank] = useState<DetailedStorageTank | null>(null);
  const [crossSectionTank, setCrossSectionTank] = useState<DetailedStorageTank | null>(null);

  // Filter logic
  const filteredTanks = storageTanks.filter(tank => {
    const matchesCategory =
      activeCategory === 'ALL' || tank.classification === activeCategory;
    const matchesWaterType =
      selectedWaterType === 'ALL' || tank.waterType === selectedWaterType;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      tank.name.toLowerCase().includes(q) ||
      tank.code.toLowerCase().includes(q) ||
      tank.locationArea.toLowerCase().includes(q);

    return matchesCategory && matchesWaterType && matchesSearch;
  });

  // Aggregate Metrics
  const totalCapacityLiters = storageTanks.reduce(
    (sum, t) => sum + (t.dimensions.calculatedCapacityLiters || 0),
    0
  );
  const totalCurrentVolumeLiters = storageTanks.reduce(
    (sum, t) => sum + (t.currentVolumeLiters || 0),
    0
  );
  const overallFillPct =
    totalCapacityLiters > 0
      ? parseFloat(((totalCurrentVolumeLiters / totalCapacityLiters) * 100).toFixed(1))
      : 0;

  const lowOrCriticalTanks = storageTanks.filter(
    t => t.fillPercentage <= t.lowAlarmPercentage
  );

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove storage tank "${name}" from the matrix?`)) {
      deleteStorageTank(id);
    }
  };

  const handleEdit = (tank: DetailedStorageTank) => {
    setEditingTank(tank);
    setIsCalculatorOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Matrix KPIs */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-cyan-950 border border-cyan-800/60 text-cyan-400">
                <Database className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Naval Dockyard Storage Tanks Matrix
                </h2>
                <p className="text-xs text-slate-400">
                  Comprehensive bulk geometric directory: Main Pump House, Overhead Towers, Vital Quarters, and Plastic Shells
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingTank(null);
              setIsCalculatorOpen(true);
            }}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-950/40 transition-all self-start md:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add Tank / Dimension Calculator</span>
          </button>
        </div>

        {/* Aggregate KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-800">
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Tanks Monitored</span>
            <div className="text-xl font-black text-white mt-0.5">{storageTanks.length} Units</div>
            <span className="text-[11px] text-slate-400">Active distribution matrix</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Stored Volume</span>
            <div className="text-xl font-black text-cyan-400 mt-0.5">
              {(totalCurrentVolumeLiters / 1000).toLocaleString()}{' '}
              <span className="text-xs font-semibold text-slate-400">kL</span>
            </div>
            <span className="text-[11px] text-slate-400">{totalCurrentVolumeLiters.toLocaleString()} Liters</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Matrix Gross Capacity</span>
            <div className="text-xl font-black text-slate-200 mt-0.5">
              {(totalCapacityLiters / 1000).toLocaleString()}{' '}
              <span className="text-xs font-semibold text-slate-400">kL</span>
            </div>
            <span className="text-[11px] text-cyan-300 font-bold">Overall {overallFillPct}% Full</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Depletion Alerts</span>
            <div className={`text-xl font-black mt-0.5 ${lowOrCriticalTanks.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {lowOrCriticalTanks.length} Tanks
            </div>
            <span className="text-[11px] text-slate-400">
              {lowOrCriticalTanks.length > 0 ? 'Require immediate replenishment' : 'All levels nominal'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
        {/* Classification Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
              activeCategory === 'ALL'
                ? 'bg-cyan-600 text-white shadow'
                : 'bg-slate-800/70 text-slate-400 hover:text-white'
            }`}
          >
            All Classifications ({storageTanks.length})
          </button>
          {Object.entries(CLASSIFICATION_LABELS).map(([key, label]) => {
            const count = storageTanks.filter(t => t.classification === key).length;
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  activeCategory === key
                    ? 'bg-cyan-600 text-white shadow'
                    : 'bg-slate-800/70 text-slate-400 hover:text-white'
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        {/* Search & Water Type Secondary Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-800/60">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search tanks by code (e.g. MPH-TK-01), name, or area..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" />
              Water Type:
            </span>
            <select
              value={selectedWaterType}
              onChange={e => setSelectedWaterType(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:border-cyan-500"
            >
              <option value="ALL">All Types</option>
              <option value="STANDARD">Standard Water</option>
              <option value="RO">RO Water</option>
              <option value="RAW_SURFACE">Raw Surface Water</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tanks Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTanks.map(tank => {
          const isCritical = tank.fillPercentage <= tank.criticalAlarmPercentage;
          const isLow = !isCritical && tank.fillPercentage <= tank.lowAlarmPercentage;
          const dims = tank.dimensions;

          return (
            <div
              key={tank.id}
              className={`bg-slate-900/80 border rounded-2xl p-5 shadow-xl flex flex-col justify-between transition-all duration-200 group ${
                isCritical
                  ? 'border-rose-600/70 shadow-rose-950/20'
                  : isLow
                  ? 'border-amber-600/70 shadow-amber-950/20'
                  : 'border-slate-800 hover:border-cyan-500/40'
              }`}
            >
              <div>
                {/* Card Top: Code, Water Type & Classification */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-mono font-black text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
                        {tank.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          tank.waterType === 'RO'
                            ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-700/50'
                            : 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                        }`}
                      >
                        {tank.waterType === 'RO' ? 'RO Pure' : 'Standard'}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {CLASSIFICATION_LABELS[tank.classification]}
                    </span>
                  </div>

                  {/* Visual Fill Status Pill */}
                  <div className="text-right">
                    <span
                      className={`text-sm font-black px-2 py-0.5 rounded-lg border font-mono ${
                        isCritical
                          ? 'bg-rose-950/80 text-rose-300 border-rose-700 animate-pulse'
                          : isLow
                          ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                          : 'bg-slate-950 text-cyan-400 border-slate-800'
                      }`}
                    >
                      {tank.fillPercentage}%
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {tank.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{tank.locationArea}</p>

                {/* Level Progress Bar */}
                <div className="my-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Droplets className="h-3 w-3 text-cyan-400" />
                      {tank.currentVolumeLiters.toLocaleString()} L
                    </span>
                    <span className="text-[11px] font-mono text-slate-300 font-semibold">
                      Cap: {dims.calculatedCapacityLiters.toLocaleString()} L
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCritical
                          ? 'bg-rose-600'
                          : isLow
                          ? 'bg-amber-500'
                          : 'bg-gradient-to-r from-cyan-600 to-blue-500'
                      }`}
                      style={{ width: `${tank.fillPercentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Depth: {tank.currentLevelMeters.toFixed(2)}m / {dims.totalHeightMeters}m</span>
                    <span>Dead Stg: {dims.deadStorageLiters}L</span>
                  </div>
                </div>

                {/* Geometry Specs Pill */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 text-[11px] space-y-1 text-slate-300 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Form:</span>
                    <span>{dims.formFactor.replace('_', ' ')}</span>
                  </div>
                  {dims.formFactor === 'RECTANGULAR_SUMP' ? (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">L × W × H:</span>
                      <span>
                        {dims.lengthMeters}m × {dims.widthMeters}m × {dims.totalHeightMeters}m
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Dia × H:</span>
                      <span>
                        Ø{dims.diameterMeters}m × {dims.totalHeightMeters}m
                      </span>
                    </div>
                  )}
                </div>

                {/* POC Contact Info if present */}
                {tank.pocName && (
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60 pt-2">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3 text-slate-500" />
                      {tank.pocName}
                    </span>
                    {tank.pocPhone && (
                      <span className="flex items-center gap-1 font-mono text-cyan-400">
                        <Phone className="h-3 w-3" />
                        {tank.pocPhone}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setCrossSectionTank(tank)}
                  className="flex-1 flex items-center justify-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold transition-colors"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>Cross-Section</span>
                </button>

                <button
                  onClick={() => handleEdit(tank)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Edit Tank Dimensions & Specs"
                >
                  <Edit3 className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handleDelete(tank.id, tank.name)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Remove Tank"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTanks.length === 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs">
          No tanks matched your selected classification or search criteria.
        </div>
      )}

      {/* Modal: Cross Section Visual Viewer */}
      {crossSectionTank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <TankVisualCrossSection
            tank={crossSectionTank}
            onClose={() => setCrossSectionTank(null)}
          />
        </div>
      )}

      {/* Modal: Dimension Calculator & Editor */}
      {isCalculatorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <TankDimensionCalculator
            initialTank={editingTank}
            onClose={() => {
              setIsCalculatorOpen(false);
              setEditingTank(null);
            }}
          />
        </div>
      )}
    </div>
  );
};
