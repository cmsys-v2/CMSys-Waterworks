import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { WaterType } from '../../types/waterDistribution';
import { PUBLISHED_BOWSER_REGISTRY, validateBowserPin } from '../../services/bowserPinRegistry';
import {
  ClipboardList,
  Clock,
  Droplet,
  CheckCircle2,
  Calendar,
  Truck,
  Plus,
  Play,
  Square,
  Flame,
  Key,
  ShieldCheck,
  Search,
  BookOpen,
  X,
  AlertTriangle,
  MapPin,
  Activity
} from 'lucide-react';

export const RealTimeLoadingLog: React.FC = () => {
  const { loadingLogs, addLoadingLog, allLocations } = useData();

  // PIC 1 CORRECTION 1: SELECT BOWSER & SECURITY PIN FIRST AT THE TOP!
  const [selectedBowserNo, setSelectedBowserNo] = useState<string>('NAHA-04');
  const [pinInput, setPinInput] = useState<string>('1004'); // Pre-fill valid PIN for NAHA-04 for fast turnkey demo
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string | null>(null);

  // Water Type Selection
  const [waterType, setWaterType] = useState<WaterType>('RO Water');

  // Filter locations by selected Water Type
  const matchingLocations = allLocations.filter(loc => {
    if (waterType === 'RO Water') return loc.category === 'RO';
    return loc.category === 'Standard';
  });

  const [selectedLocationName, setSelectedLocationName] = useState<string>('');

  useEffect(() => {
    if (matchingLocations.length > 0) {
      const currentStillValid = matchingLocations.some(l => l.name === selectedLocationName);
      if (!currentStillValid) {
        setSelectedLocationName(matchingLocations[0].name);
      }
    }
  }, [waterType]);

  // PIC 1 CORRECTION 2: PUMP TIMER & FLOW RATE CALCULATIONS
  // User enters actual Filled Volume, Timer measures Total Time Duration.
  // System calculates Pump Flow Rate = Filled Volume / Time Duration (L/min)
  const [filledVolumeInput, setFilledVolumeInput] = useState<number>(8000);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [pumpMode, setPumpMode] = useState<'Loading' | 'Unloading' | 'Tank Empty'>('Loading');

  // Calculated Flow Rate in Liters per minute
  const durationMinutes = elapsedSeconds > 0 ? elapsedSeconds / 60 : 1;
  const calculatedFlowRatePerMin = Math.round(filledVolumeInput / durationMinutes);

  // Timer Tick Interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleStartLoading = () => {
    setElapsedSeconds(0);
    setPumpMode('Loading');
    setIsTimerRunning(true);
  };

  const handleStopLoading = () => {
    setIsTimerRunning(false);
    if (elapsedSeconds === 0) {
      setElapsedSeconds(600); // Default 10 mins if stopped immediately
    }
  };

  const handleTankEmpty = () => {
    setIsTimerRunning(false);
    setPumpMode('Tank Empty');
    alert(`Tank Empty Triggered! Total Pump Run Duration logged: ${formatTime(elapsedSeconds)}.`);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Timestamp formatting (Date & Time)
  const [currentLiveDateTime, setCurrentLiveDateTime] = useState('');
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);
  const [manualDateString, setManualDateString] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const d = new Date();
      const formatted = d.toISOString().slice(0, 19).replace('T', ' ');
      setCurrentLiveDateTime(formatted);
      if (!isManualOverride) {
        setManualDateString(formatted);
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [isManualOverride]);

  // Log Table Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterWaterType, setFilterWaterType] = useState<string>('ALL');

  const filteredLogs = loadingLogs.filter(log => {
    const matchesSearch =
      log.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.bowserVehicleNo && log.bowserVehicleNo.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterWaterType === 'ALL' || log.waterType === filterWaterType;
    return matchesSearch && matchesType;
  });

  const handleSubmitLog = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);

    const isValidPin = validateBowserPin(selectedBowserNo, pinInput);
    if (!isValidPin) {
      setPinError(`Invalid PIN for Bowser ${selectedBowserNo}! Refer to Published Bowser PIN Registry.`);
      return;
    }

    const timestampToUse = isManualOverride ? manualDateString : currentLiveDateTime;

    addLoadingLog({
      locationName: selectedLocationName || 'Submarine Base RO Plant & Tank',
      volumeLoaded: filledVolumeInput,
      waterType,
      timestamp: timestampToUse,
      isManualOverride,
      bowserVehicleNo: selectedBowserNo,
      bowserPinVerified: true,
      durationSeconds: elapsedSeconds,
      pumpMode,
      remarks: `Duration: ${formatTime(elapsedSeconds)} • Calculated Flow Rate: ${calculatedFlowRatePerMin} L/min (${pumpMode})`
    });

    alert(`Loading Log for Bowser ${selectedBowserNo} saved successfully! Volume: ${filledVolumeInput}L | Duration: ${formatTime(elapsedSeconds)} | Flow Rate: ${calculatedFlowRatePerMin} L/min`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="bg-cyan-500/20 text-cyan-400 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full border border-cyan-400/30">
              Loading Interface & Pump Control
            </span>
            <span className="text-xs text-slate-400">CCED (E) Dockyard Water Station</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Real-Time Loading Log & Tank Filling Interface
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Bowser-first selection & PIN authentication, pump duration timer, and dynamic flow rate calculation.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-center space-x-3 shrink-0">
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Clock className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Date & Time</div>
              <div className="text-sm font-mono font-black text-cyan-300">{currentLiveDateTime}</div>
            </div>
          </div>

          <button
            onClick={() => setIsPinModalOpen(true)}
            className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs px-3.5 py-3 rounded-xl border border-amber-500/30 flex items-center space-x-1.5 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            <span>Published PIN Registry</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Loading Form */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <ClipboardList className="h-5 w-5 text-cyan-400" />
            Loading & Unloading Pump Log Form
          </h3>

          {pinError && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{pinError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitLog} className="space-y-4 text-xs">
            {/* PIC 1 CORRECTION 1: SELECT BOWSER & SECURITY PIN FIRST AT THE TOP! */}
            <div className="bg-amber-950/30 p-4 rounded-xl border border-amber-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-extrabold text-amber-400 uppercase text-xs flex items-center gap-1.5">
                  <Key className="h-4 w-4" />
                  1. Select Bowser First & Enter PIN
                </label>
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(true)}
                  className="text-cyan-400 hover:underline text-[10px] font-bold"
                >
                  View PINs
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 text-[10px] font-bold mb-1">Bowser Vehicle No</label>
                  <select
                    value={selectedBowserNo}
                    onChange={e => {
                      setSelectedBowserNo(e.target.value);
                      const reg = PUBLISHED_BOWSER_REGISTRY.find(b => b.vehicleNo === e.target.value);
                      if (reg) setPinInput(reg.pin);
                    }}
                    className="w-full bg-slate-950 border border-amber-700/80 rounded-xl px-2.5 py-2 text-white font-mono font-bold"
                  >
                    {PUBLISHED_BOWSER_REGISTRY.map(b => (
                      <option key={b.srNo} value={b.vehicleNo}>
                        {b.vehicleNo} ({b.srNo})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-[10px] font-bold mb-1">Enter Bowser PIN</label>
                  <input
                    type="password"
                    required
                    value={pinInput}
                    onChange={e => setPinInput(e.target.value)}
                    placeholder="PIN Code"
                    className="w-full bg-slate-950 border border-amber-700/80 rounded-xl px-2.5 py-2 text-amber-300 font-mono font-extrabold"
                  />
                </div>
              </div>
            </div>

            {/* 2. Select Water Type */}
            <div className="bg-cyan-950/30 p-4 rounded-xl border border-cyan-800/60 space-y-2">
              <label className="block font-extrabold text-cyan-400 uppercase text-xs flex items-center gap-1.5">
                <Droplet className="h-4 w-4" />
                2. Select Water Type
              </label>
              <select
                value={waterType}
                onChange={e => setWaterType(e.target.value as WaterType)}
                className="w-full bg-slate-950 border border-cyan-700/80 rounded-xl px-3.5 py-2.5 text-white font-extrabold focus:outline-none focus:border-cyan-400"
              >
                <option value="RO Water">RO Water (Desalinated Pure Water)</option>
                <option value="Normal Water">Normal Water (Standard Supply)</option>
                <option value="Well Water">Well Water (Industrial Washing)</option>
              </select>
            </div>

            {/* 3. Target Location */}
            <div>
              <label className="block font-bold text-slate-300 uppercase mb-1">
                3. Select Target Location ({waterType})
              </label>
              <select
                value={selectedLocationName}
                onChange={e => setSelectedLocationName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-cyan-500"
              >
                {matchingLocations.map(loc => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name} ({loc.base})
                  </option>
                ))}
              </select>
            </div>

            {/* PIC 1 CORRECTION 2: PUMP TIMER & FLOW RATE CALCULATIONS */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-300 uppercase text-xs flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-amber-400" />
                  Pump Duration Timer & Flow Rate Calculations
                </span>
                <span className="font-mono text-cyan-400 font-bold text-sm bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  Timer: {formatTime(elapsedSeconds)}
                </span>
              </div>

              {/* Start Load, Stop Load, Tank Empty Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleStartLoading}
                  className={`py-2 px-2 rounded-xl font-extrabold text-[11px] flex items-center justify-center space-x-1 border transition-all ${
                    isTimerRunning
                      ? 'bg-emerald-600 text-white border-emerald-400 animate-pulse'
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900'
                  }`}
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Start Load</span>
                </button>

                <button
                  type="button"
                  onClick={handleStopLoading}
                  className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-extrabold text-[11px] flex items-center justify-center space-x-1"
                >
                  <Square className="h-3.5 w-3.5 text-rose-400" />
                  <span>Stop Load</span>
                </button>

                <button
                  type="button"
                  onClick={handleTankEmpty}
                  className="py-2 px-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-700/60 font-extrabold text-[11px] flex items-center justify-center space-x-1"
                >
                  <Flame className="h-3.5 w-3.5" />
                  <span>Tank Empty</span>
                </button>
              </div>

              {/* User Inputs Filled Volume -> System Calculates Flow Rate (L/min) */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Filled Volume (L)</span>
                  <input
                    type="number"
                    required
                    value={filledVolumeInput}
                    onChange={e => setFilledVolumeInput(Number(e.target.value))}
                    className="w-full bg-transparent text-emerald-400 font-extrabold text-sm focus:outline-none"
                  />
                  <span className="text-[9px] text-slate-500 block mt-0.5">Input Volume Loaded</span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Calculated Flow Rate</span>
                  <span className="text-cyan-300 font-black text-sm block mt-0.5">
                    {calculatedFlowRatePerMin.toLocaleString()} L/min
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Based on {formatTime(elapsedSeconds)} duration</span>
                </div>
              </div>
            </div>

            {/* Date & Time Timestamp */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-400 text-[11px]">Date & Time Stamp</span>
                <button
                  type="button"
                  onClick={() => setIsManualOverride(!isManualOverride)}
                  className={`text-[9px] font-extrabold px-2 py-0.5 rounded border ${
                    isManualOverride ? 'bg-amber-950 text-amber-300 border-amber-700' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {isManualOverride ? 'Manual Date' : 'Auto Date'}
                </button>
              </div>

              <input
                type="text"
                value={manualDateString}
                readOnly={!isManualOverride}
                onChange={e => setManualDateString(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 text-xs text-cyan-300 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2 border border-cyan-300/30"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Verify PIN & Save Loading Log</span>
            </button>
          </form>
        </div>

        {/* Log History Feed Table */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-cyan-400" />
                Verified Loading Log History
              </h3>
              <p className="text-xs text-slate-400">PIN-verified entries with pump run times & calculated flow rates</p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search location..."
                  className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={filterWaterType}
                onChange={e => setFilterWaterType(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-semibold focus:outline-none"
              >
                <option value="ALL">All Water Types</option>
                <option value="RO Water">RO Water</option>
                <option value="Normal Water">Normal Water</option>
                <option value="Well Water">Well Water</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Location Name</th>
                  <th className="py-2.5 px-3">Volume Loaded</th>
                  <th className="py-2.5 px-3">Water Type</th>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Bowser No</th>
                  <th className="py-2.5 px-3">Security</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No loading logs found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{log.locationName}</div>
                        {log.remarks && <div className="text-[10px] text-slate-400 line-clamp-1">{log.remarks}</div>}
                      </td>
                      <td className="py-3 px-3 font-mono font-extrabold text-cyan-400">
                        {log.volumeLoaded.toLocaleString()} L
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.waterType === 'RO Water'
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                              : 'bg-blue-950 text-blue-300 border border-blue-800'
                          }`}
                        >
                          {log.waterType}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300 text-[11px]">
                        {log.timestamp}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-200 font-bold">
                        {log.bowserVehicleNo}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 flex items-center gap-1 w-max">
                          <ShieldCheck className="h-3 w-3 text-emerald-400" /> PIN Verified
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* POP-UP MODAL: Published Bowser PIN Registry */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider">
                  Official Published Document Reference
                </span>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-amber-400" />
                  Published Bowser Registry & Security PINs (30 Bowsers)
                </h3>
              </div>
              <button
                onClick={() => setIsPinModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Only authorized operators with respective Bowser PINs can edit or log entries for each bowser.
            </p>

            <div className="flex-1 overflow-y-auto border border-slate-800 rounded-xl bg-slate-950 p-4">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="py-2 px-3">SR Number</th>
                    <th className="py-2 px-3">Vehicle Naha No</th>
                    <th className="py-2 px-3">Published PIN Code</th>
                    <th className="py-2 px-3">Transport Asst (TA)</th>
                    <th className="py-2 px-3">Eng Mechanic (ME)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {PUBLISHED_BOWSER_REGISTRY.map(b => (
                    <tr key={b.srNo} className="hover:bg-slate-900/60">
                      <td className="py-2.5 px-3 font-bold text-cyan-400">{b.srNo}</td>
                      <td className="py-2.5 px-3 font-bold text-white">{b.vehicleNo}</td>
                      <td className="py-2.5 px-3 font-extrabold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                        {b.pin}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 font-sans">{b.defaultTaName}</td>
                      <td className="py-2.5 px-3 text-slate-400 font-sans">{b.defaultMeName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsPinModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs"
              >
                Close Registry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
