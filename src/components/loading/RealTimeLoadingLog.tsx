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
  Activity,
  Navigation,
  Check,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export const RealTimeLoadingLog: React.FC = () => {
  const { loadingLogs, addLoadingLog, allLocations } = useData();

  // Bowser & Security PIN Selection (View PINs text link removed!)
  const [selectedBowserNo, setSelectedBowserNo] = useState<string>('NAHA-04');
  const [pinInput, setPinInput] = useState<string>('1004'); // Pre-fill valid PIN for NAHA-04 for turnkey demo
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

  // ACTIVE FEEDING OPERATIONAL WORKFLOW SEQUENCE STATE
  // Steps: 1. Idle -> 2. Arrived Pump House -> 3. Filling -> 4. Filled -> 5. Arrived Dockyard -> 6. Unloading -> 7. Tank Empty
  const [workflowStatus, setWorkflowStatus] = useState<
    'IDLE' | 'PUMP_HOUSE_ARRIVED' | 'FILLING' | 'FILLED' | 'DOCKYARD_ARRIVED' | 'UNLOADING' | 'TANK_EMPTY'
  >('IDLE');

  const [filledVolumeInput, setFilledVolumeInput] = useState<number>(12000);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [activeActionName, setActiveActionName] = useState<string>('Standby');

  // Multi-location discharge tracker
  const [fillDurationSeconds, setFillDurationSeconds] = useState<number>(600); // Default 10 mins
  const [unloadDurationSeconds, setUnloadDurationSeconds] = useState<number>(0);

  // Live Timer Tick Interval
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

  // Operational Sequence Action Handlers
  const handleArrivedPumpHouse = () => {
    setWorkflowStatus('PUMP_HOUSE_ARRIVED');
    setActiveActionName('Arrived at Andamkulam / Pump House');
  };

  const handleStartFilling = () => {
    setWorkflowStatus('FILLING');
    setActiveActionName('Filling Bowser Tank at Pump House');
    setElapsedSeconds(0);
    setIsTimerRunning(true);
  };

  const handleStopFilling = () => {
    setIsTimerRunning(false);
    setWorkflowStatus('FILLED');
    const duration = elapsedSeconds > 0 ? elapsedSeconds : 600;
    setFillDurationSeconds(duration);
    setActiveActionName(`Tank Filled (${filledVolumeInput}L) in ${formatTime(duration)}`);
  };

  const handleArrivedDockyard = () => {
    setWorkflowStatus('DOCKYARD_ARRIVED');
    setActiveActionName('Arrived at SLN Dockyard Premises');
  };

  const handleStartUnloading = () => {
    setWorkflowStatus('UNLOADING');
    setActiveActionName(`Unloading Water to ${selectedLocationName}`);
    setElapsedSeconds(0);
    setIsTimerRunning(true);
  };

  const handleStopUnloading = () => {
    setIsTimerRunning(false);
    setWorkflowStatus('FILLED');
    const uDuration = elapsedSeconds > 0 ? elapsedSeconds : 300;
    setUnloadDurationSeconds(prev => prev + uDuration);
    
    // Estimate volume poured to this specific location
    const estPoured = Math.round((uDuration / 600) * filledVolumeInput);
    const volumeToLog = Math.min(filledVolumeInput, estPoured > 0 ? estPoured : 3000);

    setActiveActionName(`Unloaded ${volumeToLog}L to ${selectedLocationName}`);
  };

  const handleTankEmpty = () => {
    setIsTimerRunning(false);
    setWorkflowStatus('TANK_EMPTY');
    setActiveActionName('Bowser Tank Completely Empty');
    alert(`Tank Empty! All filled volume (${filledVolumeInput}L) successfully discharged.`);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Timestamp (Date & Time)
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

  // CUMULATIVE TOTAL & INFOGRAPHICS DATE RANGE PICKER STATE
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  // Compute Cumulative Total & Infographics Chart Data for Date Range
  const rangeFilteredLogs = loadingLogs.filter(log => {
    const logDate = log.timestamp.slice(0, 10);
    return logDate >= startDate && logDate <= endDate;
  });

  const cumulativeTotalWater = rangeFilteredLogs.reduce((acc, log) => acc + log.volumeLoaded, 0);
  const cumulativeRoWater = rangeFilteredLogs.filter(l => l.waterType === 'RO Water').reduce((acc, l) => acc + l.volumeLoaded, 0);
  const cumulativeStdWater = rangeFilteredLogs.filter(l => l.waterType !== 'RO Water').reduce((acc, l) => acc + l.volumeLoaded, 0);

  // Group cumulative totals by location for chart
  const locationCumulativeMap: { [name: string]: number } = {};
  rangeFilteredLogs.forEach(log => {
    const key = log.locationName.split(' ')[0] + ' ' + (log.locationName.split(' ')[1] || '');
    locationCumulativeMap[key] = (locationCumulativeMap[key] || 0) + log.volumeLoaded;
  });

  const cumulativeChartData = Object.keys(locationCumulativeMap).map(locName => ({
    name: locName,
    volume: locationCumulativeMap[locName]
  }));

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
      pumpMode: 'Loading',
      remarks: `Operational Log: ${activeActionName} • Status: ${workflowStatus}`
    });

    alert(`Loading Log for Bowser ${selectedBowserNo} verified & saved successfully! Volume: ${filledVolumeInput}L`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="bg-cyan-500/20 text-cyan-400 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full border border-cyan-400/30">
              Active Feeding Operations Hub
            </span>
            <span className="text-xs text-slate-400">CCED (E) Dockyard Water Command</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Real-Time Bowser Feeding, Loading & Discharge Sequence
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Full operational sequence tracking from Pump House filling to Dockyard location discharge and cumulative total analytics.
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

      {/* PIC 1 CORRECTION: ENLARGED MAIN ACTIVE FEEDING PANEL WINDOW (Full width 2-col or wide grid) */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase text-cyan-400 tracking-wider">
                Main Operational Interface
              </span>
              <h3 className="text-lg font-black text-white">
                Active Bowser Feeding & Operational Sequence Panel
              </h3>
            </div>
          </div>

          {/* Active Status Badge */}
          <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Active Sequence Status</div>
            <div className="text-xs font-black text-cyan-300 flex items-center gap-1.5 justify-end">
              <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
              {activeActionName}
            </div>
          </div>
        </div>

        {pinError && (
          <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{pinError}</span>
          </div>
        )}

        <form onSubmit={handleSubmitLog} className="space-y-6">
          {/* STEP 1: BOWSER SELECTION & PIN (PIC 1: VIEW PINS TEXT REMOVED!) */}
          <div className="bg-amber-950/20 p-5 rounded-2xl border border-amber-800/60 space-y-4">
            <label className="font-extrabold text-amber-400 uppercase text-xs flex items-center gap-1.5">
              <Key className="h-4 w-4" />
              1. Select Bowser Vehicle & Enter Security PIN
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Bowser Vehicle No (Naha No)</label>
                <select
                  value={selectedBowserNo}
                  onChange={e => {
                    setSelectedBowserNo(e.target.value);
                    const reg = PUBLISHED_BOWSER_REGISTRY.find(b => b.vehicleNo === e.target.value);
                    if (reg) {
                      setPinInput(reg.pin);
                      setFilledVolumeInput(reg.capacity);
                    }
                  }}
                  className="w-full bg-slate-950 border border-amber-700/80 rounded-xl px-3.5 py-2.5 text-white font-mono font-extrabold text-sm focus:outline-none"
                >
                  {PUBLISHED_BOWSER_REGISTRY.map(b => (
                    <option key={b.srNo} value={b.vehicleNo}>
                      {b.vehicleNo} ({b.srNo} - {b.capacity.toLocaleString()}L)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Enter Bowser PIN</label>
                <input
                  type="password"
                  required
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value)}
                  placeholder="PIN Code"
                  className="w-full bg-slate-950 border border-amber-700/80 rounded-xl px-3.5 py-2 text-amber-300 font-mono font-black text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Bowser Tank Capacity (L)</label>
                <input
                  type="number"
                  required
                  value={filledVolumeInput}
                  onChange={e => setFilledVolumeInput(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-emerald-400 font-mono font-black text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: WATER TYPE & TARGET DISCHARGE LOCATION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-cyan-950/30 p-4 rounded-xl border border-cyan-800/60 space-y-2">
              <label className="block font-extrabold text-cyan-400 uppercase text-xs flex items-center gap-1.5">
                <Droplet className="h-4 w-4" />
                2. Select Water Type
              </label>
              <select
                value={waterType}
                onChange={e => setWaterType(e.target.value as WaterType)}
                className="w-full bg-slate-950 border border-cyan-700/80 rounded-xl px-3.5 py-2 text-white font-extrabold"
              >
                <option value="RO Water">RO Water (Desalinated Pure Water)</option>
                <option value="Normal Water">Normal Water (Standard Supply)</option>
                <option value="Well Water">Well Water (Industrial Washing)</option>
              </select>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <label className="block font-extrabold text-slate-300 uppercase text-xs flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-cyan-400" />
                3. Target Discharge Location ({waterType})
              </label>
              <select
                value={selectedLocationName}
                onChange={e => setSelectedLocationName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-white font-bold"
              >
                {matchingLocations.map(loc => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name} ({loc.base})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PIC 1 CORRECTION: FULL OPERATIONAL SEQUENCE BUTTONS WORKFLOW */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-white uppercase text-xs tracking-wider flex items-center gap-2">
                <Navigation className="h-4 w-4 text-cyan-400" />
                Bowser Operational Sequence & Pump Time Logger
              </span>
              <div className="font-mono text-cyan-400 font-black text-sm bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                Pump Timer: {formatTime(elapsedSeconds)}
              </div>
            </div>

            {/* Sequence Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Button 1: Arrived Pump House */}
              <button
                type="button"
                onClick={handleArrivedPumpHouse}
                className={`py-3 px-3 rounded-xl font-extrabold text-xs flex flex-col items-center justify-center text-center gap-1 border transition-all ${
                  workflowStatus === 'PUMP_HOUSE_ARRIVED'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-900/40'
                    : 'bg-slate-900 hover:bg-slate-800 text-blue-300 border-slate-800'
                }`}
              >
                <Navigation className="h-4 w-4" />
                <span>Arrived Pump House</span>
              </button>

              {/* Button 2: Start Filling */}
              <button
                type="button"
                onClick={handleStartFilling}
                className={`py-3 px-3 rounded-xl font-extrabold text-xs flex flex-col items-center justify-center text-center gap-1 border transition-all ${
                  workflowStatus === 'FILLING'
                    ? 'bg-emerald-600 text-white border-emerald-400 animate-pulse shadow-lg'
                    : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-800'
                }`}
              >
                <Play className="h-4 w-4" />
                <span>Start Filling</span>
              </button>

              {/* Button 3: Stop Filling */}
              <button
                type="button"
                onClick={handleStopFilling}
                className="py-3 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 border border-slate-800 font-extrabold text-xs flex flex-col items-center justify-center text-center gap-1"
              >
                <Square className="h-4 w-4" />
                <span>Stop Filling (Log Time)</span>
              </button>

              {/* Button 4: Arrived Dockyard */}
              <button
                type="button"
                onClick={handleArrivedDockyard}
                className={`py-3 px-3 rounded-xl font-extrabold text-xs flex flex-col items-center justify-center text-center gap-1 border transition-all ${
                  workflowStatus === 'DOCKYARD_ARRIVED'
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-lg shadow-cyan-900/40'
                    : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border-slate-800'
                }`}
              >
                <Navigation className="h-4 w-4" />
                <span>Arrived SLN Dockyard</span>
              </button>

              {/* Button 5: Start / Stop Unloading */}
              <button
                type="button"
                onClick={isTimerRunning ? handleStopUnloading : handleStartUnloading}
                className={`py-3 px-3 rounded-xl font-extrabold text-xs flex flex-col items-center justify-center text-center gap-1 border transition-all ${
                  workflowStatus === 'UNLOADING'
                    ? 'bg-amber-600 text-white border-amber-400 animate-pulse shadow-lg'
                    : 'bg-amber-950/80 hover:bg-amber-900 text-amber-300 border-amber-800'
                }`}
              >
                {isTimerRunning ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span>{isTimerRunning ? 'Stop Unload' : 'Start Unloading'}</span>
              </button>

              {/* Button 6: Tank Empty */}
              <button
                type="button"
                onClick={handleTankEmpty}
                className={`py-3 px-3 rounded-xl font-extrabold text-xs flex flex-col items-center justify-center text-center gap-1 border transition-all ${
                  workflowStatus === 'TANK_EMPTY'
                    ? 'bg-rose-600 text-white border-rose-400'
                    : 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border-rose-800'
                }`}
              >
                <Flame className="h-4 w-4" />
                <span>Tank Empty</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm py-3.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2 border border-cyan-300/30"
          >
            <ShieldCheck className="h-5 w-5" />
            <span>Verify PIN & Save Operational Loading Log</span>
          </button>
        </form>
      </div>

      {/* PIC 1 CORRECTION: CUMULATIVE TOTAL & DYNAMIC INFOGRAPHICS FOR GIVEN TIME RANGE */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-cyan-400 tracking-wider">
              Cumulative Water Delivery Analytics
            </span>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-cyan-400" />
              Cumulative Water Total & Infographics for Time Range
            </h3>
          </div>

          {/* Date & Time Range Selector */}
          <div className="flex items-center space-x-2 text-xs bg-slate-950 p-2 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-bold">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="bg-slate-900 text-white border border-slate-700 rounded px-2 py-1 font-mono"
            />
            <span className="text-slate-400 font-bold">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="bg-slate-900 text-white border border-slate-700 rounded px-2 py-1 font-mono"
            />
          </div>
        </div>

        {/* Cumulative Total Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 font-bold uppercase">Cumulative Total Delivered</div>
            <div className="text-2xl font-black text-white mt-1 font-mono">
              {cumulativeTotalWater.toLocaleString()} <span className="text-xs text-slate-400">Liters</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Selectable time window total</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-cyan-400 font-bold uppercase">Cumulative RO Water</div>
            <div className="text-2xl font-black text-cyan-400 mt-1 font-mono">
              {cumulativeRoWater.toLocaleString()} <span className="text-xs text-slate-400">Liters</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Pure Desalinated RO Intake</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-blue-400 font-bold uppercase">Cumulative Standard Water</div>
            <div className="text-2xl font-black text-blue-400 mt-1 font-mono">
              {cumulativeStdWater.toLocaleString()} <span className="text-xs text-slate-400">Liters</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Standard & Well Water Supply</p>
          </div>
        </div>

        {/* Cumulative Infographics Bar Chart */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
          <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart2 className="h-4 w-4 text-cyan-400" />
            Cumulative Delivered Volume by Target Location (Liters)
          </h4>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cumulativeChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                />
                <Bar dataKey="volume" name="Cumulative Liters" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* PIC 1 CORRECTION: RECENT LOADING LOG TABLE (COMPACT SPACE) */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-400" />
              Recent Verified Loading Logs Feed
            </h3>
            <p className="text-[11px] text-slate-400">Compact recent log entries</p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search location..."
                className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <select
              value={filterWaterType}
              onChange={e => setFilterWaterType(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 font-semibold focus:outline-none"
            >
              <option value="ALL">All Water Types</option>
              <option value="RO Water">RO Water</option>
              <option value="Normal Water">Normal Water</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-60 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 sticky top-0">
              <tr>
                <th className="py-2 px-3">Location Name</th>
                <th className="py-2 px-3">Volume Loaded</th>
                <th className="py-2 px-3">Water Type</th>
                <th className="py-2 px-3">Date & Time</th>
                <th className="py-2 px-3">Bowser No</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500 text-xs">
                    No loading logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-3">
                      <div className="font-bold text-white text-xs">{log.locationName}</div>
                      {log.remarks && <div className="text-[10px] text-slate-400 line-clamp-1">{log.remarks}</div>}
                    </td>
                    <td className="py-2 px-3 font-mono font-extrabold text-cyan-400 text-xs">
                      {log.volumeLoaded.toLocaleString()} L
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {log.waterType}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-300 text-[11px]">
                      {log.timestamp}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-200 font-bold text-xs">
                      {log.bowserVehicleNo}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
