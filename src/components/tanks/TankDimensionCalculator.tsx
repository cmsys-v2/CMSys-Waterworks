import React, { useState, useEffect } from 'react';
import {
  TankDimensions,
  TankFormFactor,
  TankClassification,
  DetailedStorageTank
} from '../../types/waterDistribution';
import { calculateTankMetrics } from '../../utils/tankCalculations';
import { useData } from '../../context/DataContext';
import { Calculator, X, Save, CheckCircle2, Droplets, Info } from 'lucide-react';

interface TankDimensionCalculatorProps {
  onClose?: () => void;
  initialTank?: DetailedStorageTank | null;
  onSaved?: (tank: DetailedStorageTank) => void;
}

export const TankDimensionCalculator: React.FC<TankDimensionCalculatorProps> = ({
  onClose,
  initialTank,
  onSaved
}) => {
  const { addStorageTank, updateStorageTank } = useData();

  // Geometric Dimensions State
  const [formFactor, setFormFactor] = useState<TankFormFactor>(
    initialTank?.dimensions.formFactor || 'CYLINDRICAL_VERTICAL'
  );
  const [diameterMeters, setDiameterMeters] = useState<number>(
    initialTank?.dimensions.diameterMeters || 3.0
  );
  const [lengthMeters, setLengthMeters] = useState<number>(
    initialTank?.dimensions.lengthMeters || 10.0
  );
  const [widthMeters, setWidthMeters] = useState<number>(
    initialTank?.dimensions.widthMeters || 6.0
  );
  const [totalHeightMeters, setTotalHeightMeters] = useState<number>(
    initialTank?.dimensions.totalHeightMeters || 4.0
  );
  const [usableHeightMeters, setUsableHeightMeters] = useState<number>(
    initialTank?.dimensions.usableHeightMeters || 3.6
  );
  const [deadStorageLiters, setDeadStorageLiters] = useState<number>(
    initialTank?.dimensions.deadStorageLiters || 1000
  );

  // Administrative Attributes State
  const [name, setName] = useState<string>(initialTank?.name || '');
  const [code, setCode] = useState<string>(initialTank?.code || '');
  const [classification, setClassification] = useState<TankClassification>(
    initialTank?.classification || 'MAIN_PUMP_HOUSE'
  );
  const [waterType, setWaterType] = useState<'RO' | 'STANDARD' | 'RAW_SURFACE'>(
    initialTank?.waterType || 'STANDARD'
  );
  const [locationArea, setLocationArea] = useState<string>(
    initialTank?.locationArea || 'Naval Dockyard'
  );
  const [pocName, setPocName] = useState<string>(initialTank?.pocName || '');
  const [pocPhone, setPocPhone] = useState<string>(initialTank?.pocPhone || '');
  const [currentLevelMeters, setCurrentLevelMeters] = useState<number>(
    initialTank?.currentLevelMeters || 2.0
  );

  // Synchronize usable height limit if total height decreases
  useEffect(() => {
    if (usableHeightMeters > totalHeightMeters) {
      setUsableHeightMeters(totalHeightMeters);
    }
  }, [totalHeightMeters]);

  // Live Metric Engine Execution
  const metrics = calculateTankMetrics(
    {
      formFactor,
      diameterMeters: formFactor !== 'RECTANGULAR_SUMP' ? diameterMeters : undefined,
      lengthMeters: formFactor !== 'CYLINDRICAL_VERTICAL' ? lengthMeters : undefined,
      widthMeters: formFactor === 'RECTANGULAR_SUMP' ? widthMeters : undefined,
      totalHeightMeters,
      usableHeightMeters,
      deadStorageLiters
    },
    currentLevelMeters
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !code.trim()) {
      alert('Please provide a tank name and unique code.');
      return;
    }

    const tankData: DetailedStorageTank = {
      id: initialTank?.id || `tank-${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      classification,
      waterType,
      dimensions: {
        formFactor,
        diameterMeters: formFactor !== 'RECTANGULAR_SUMP' ? diameterMeters : undefined,
        lengthMeters: formFactor !== 'CYLINDRICAL_VERTICAL' ? lengthMeters : undefined,
        widthMeters: formFactor === 'RECTANGULAR_SUMP' ? widthMeters : undefined,
        totalHeightMeters,
        usableHeightMeters,
        deadStorageLiters,
        calculatedCapacityLiters: metrics.netCapacityLiters
      },
      currentLevelMeters: Math.min(totalHeightMeters, currentLevelMeters),
      currentVolumeLiters: metrics.currentVolumeLiters,
      fillPercentage: metrics.fillPercentage,
      lowAlarmPercentage: initialTank?.lowAlarmPercentage || 25,
      criticalAlarmPercentage: initialTank?.criticalAlarmPercentage || 15,
      locationArea: locationArea.trim(),
      pocName: pocName.trim() || undefined,
      pocPhone: pocPhone.trim() || undefined,
      lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    if (initialTank) {
      updateStorageTank(tankData);
    } else {
      addStorageTank(tankData);
    }

    if (onSaved) onSaved(tankData);
    if (onClose) onClose();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-4xl w-full mx-auto space-y-6">
      {/* Modal Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-cyan-950 border border-cyan-800/60 text-cyan-400">
            <Calculator className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">
              {initialTank ? `Edit Storage Tank Specifications: ${initialTank.code}` : 'Tank Dimension-to-Capacity Calculator'}
            </h3>
            <p className="text-xs text-slate-400">
              Calculate exact volume and net usable water capacity from physical structural dimensions
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Factor Select Buttons */}
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
            1. Select Structural Geometry Form Factor
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setFormFactor('CYLINDRICAL_VERTICAL')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                formFactor === 'CYLINDRICAL_VERTICAL'
                  ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-lg shadow-cyan-950/40'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-xs text-white">Cylindrical Vertical</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Overhead Towers & Sintec/Poly Shells</div>
            </button>

            <button
              type="button"
              onClick={() => setFormFactor('RECTANGULAR_SUMP')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                formFactor === 'RECTANGULAR_SUMP'
                  ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-lg shadow-cyan-950/40'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-xs text-white">Rectangular Sump</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Main Pump House Basins & Concrete Sump</div>
            </button>

            <button
              type="button"
              onClick={() => setFormFactor('CYLINDRICAL_HORIZONTAL')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                formFactor === 'CYLINDRICAL_HORIZONTAL'
                  ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-lg shadow-cyan-950/40'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-xs text-white">Cylindrical Horizontal</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Mobile Bowsers & Surface Tanks</div>
            </button>
          </div>
        </div>

        {/* Dynamic Dimensional Inputs */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
            2. Enter Structural Measurements (Meters)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {formFactor === 'RECTANGULAR_SUMP' ? (
              <>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Length (Meters)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    value={lengthMeters}
                    onChange={e => setLengthMeters(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Width (Meters)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    value={widthMeters}
                    onChange={e => setWidthMeters(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
                    required
                  />
                </div>
              </>
            ) : formFactor === 'CYLINDRICAL_HORIZONTAL' ? (
              <>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Diameter (Meters)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    value={diameterMeters}
                    onChange={e => {
                      const d = parseFloat(e.target.value) || 0;
                      setDiameterMeters(d);
                      setTotalHeightMeters(d);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Barrel Length (Meters)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    value={lengthMeters}
                    onChange={e => setLengthMeters(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
                    required
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Diameter (Meters)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  value={diameterMeters}
                  onChange={e => setDiameterMeters(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Total Physical Height (Meters)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                value={totalHeightMeters}
                onChange={e => setTotalHeightMeters(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Usable Water Column Height (m)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                max={totalHeightMeters}
                value={usableHeightMeters}
                onChange={e => setUsableHeightMeters(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Dead Storage Allowance (Liters)
              </label>
              <input
                type="number"
                step="50"
                min="0"
                value={deadStorageLiters}
                onChange={e => setDeadStorageLiters(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Current Water Level (m)
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                max={totalHeightMeters}
                value={currentLevelMeters}
                onChange={e => setCurrentLevelMeters(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Live Calculation Output Dashboard */}
        <div className="bg-gradient-to-r from-cyan-950/60 via-slate-950 to-blue-950/60 border border-cyan-800/60 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3 border-b border-cyan-900/40 pb-2">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Droplets className="h-4 w-4 text-cyan-400" />
              Automated Capacity Engine Results
            </span>
            <span className="text-[10px] text-slate-400">Formula: {formFactor} standard</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Cross Section</span>
              <div className="text-base font-black text-white font-mono mt-0.5">
                {metrics.crossSectionAreaM2} m²
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Gross Full Volume</span>
              <div className="text-base font-black text-slate-200 font-mono mt-0.5">
                {metrics.totalGrossVolumeLiters.toLocaleString()} L
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Net Usable Capacity</span>
              <div className="text-lg font-black text-cyan-300 font-mono mt-0.5">
                {metrics.netCapacityLiters.toLocaleString()} L
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Current Stored Volume</span>
              <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                {metrics.currentVolumeLiters.toLocaleString()} L ({metrics.fillPercentage}%)
              </div>
            </div>
          </div>
        </div>

        {/* Administrative Details (If saving to matrix) */}
        <div className="space-y-4 bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            3. Facility & Registry Specification
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Tank Name</label>
              <input
                type="text"
                placeholder="e.g. Wardroom Reserve Tank 01"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Unique Code</label>
              <input
                type="text"
                placeholder="e.g. MPH-TK-01, OHT-01"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Classification</label>
              <select
                value={classification}
                onChange={e => setClassification(e.target.value as TankClassification)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500"
              >
                <option value="MAIN_PUMP_HOUSE">Main Pump House</option>
                <option value="OVERHEAD_TOWER">Overhead Tower</option>
                <option value="VITAL_COMMAND_CHALET">Vital Command Chalet</option>
                <option value="VITAL_WARDROOM">Vital Wardroom</option>
                <option value="VITAL_BASE_HOSPITAL">Vital Base Hospital</option>
                <option value="PLASTIC_SHELL_SINTEC">Plastic Shell Sintec</option>
                <option value="PLASTIC_SHELL_POLY">Plastic Shell Poly</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Water Type</label>
              <select
                value={waterType}
                onChange={e => setWaterType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500"
              >
                <option value="STANDARD">Standard Water</option>
                <option value="RO">RO Water</option>
                <option value="RAW_SURFACE">Raw Surface Water</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Placement / Location Area</label>
              <input
                type="text"
                placeholder="e.g. Dockyard East Point"
                value={locationArea}
                onChange={e => setLocationArea(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">POC Name & Phone</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="POC Name"
                  value={pocName}
                  onChange={e => setPocName(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:border-cyan-500"
                />
                <input
                  type="text"
                  placeholder="+94 77..."
                  value={pocPhone}
                  onChange={e => setPocPhone(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl bg-slate-800"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-950/40"
          >
            <Save className="h-4 w-4" />
            <span>{initialTank ? 'Update Tank in Matrix' : 'Commit & Register Tank'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
