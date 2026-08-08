import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { BowserDuty, ScheduleItem, WaterType } from '../../types/waterDistribution';
import { PUBLISHED_BOWSER_REGISTRY } from '../../services/bowserPinRegistry';
import {
  Truck,
  Plus,
  User,
  FileText,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  X,
  Printer,
  ChevronRight,
  ClipboardList,
  Search,
  ShieldCheck,
  Droplet,
  Info
} from 'lucide-react';

export const BowserDutyManagement: React.FC = () => {
  const { bowserDuties, addBowserDuty, allLocations, loadingLogs } = useData();

  // Active Tab inside Bowser Module: Fleet Dashboard vs Duty Form Creator
  const [activeSubTab, setActiveSubTab] = useState<'fleet' | 'form'>('fleet');

  // Selected Bowser in Fleet Dashboard
  const [selectedBowserNo, setSelectedBowserNo] = useState<string>('NAHA-04');
  const [fleetSearchQuery, setFleetSearchQuery] = useState('');

  // Duty Form State
  const [vehicleNo, setVehicleNo] = useState('NAHA-05');
  const [capacity, setCapacity] = useState<number>(12000);
  const [taName, setTaName] = useState('PO Ranasinghe H.K.');
  const [taNumber, setTaNumber] = useState('TA-44910');
  const [taContract, setTaContract] = useState('Transport Squadron - Contract #TS-2026/14');

  const [dutyMeName, setDutyMeName] = useState('CPO Gunawardena M.');
  const [dutyMeNumber, setDutyMeNumber] = useState('ME-3091');
  const [dutyMeContract, setDutyMeContract] = useState('Mechanical Engineering Division - Contract #MED-881');

  const [dutyDate, setDutyDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Pop-up Modal State for Creating Schedule Items
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);

  // Schedule Form Inputs inside pop-up
  const [pipelinePlace, setPipelinePlace] = useState('Main Jetty Booster Station Alpha');
  const [selectedWaterType, setSelectedWaterType] = useState<WaterType>('RO Water');
  const [quantity, setQuantity] = useState<number>(8000);
  const [selectedLocationName, setSelectedLocationName] = useState(allLocations[0]?.name || 'Submarine Base RO Plant & Tank');
  const [approxTime, setApproxTime] = useState('10:30');

  // Selected Duty for Printable Slip Preview
  const [activeDutySlip, setActiveDutySlip] = useState<BowserDuty | null>(null);

  // Compute logs for selected bowser in Fleet Dashboard
  const selectedBowserRegistry = PUBLISHED_BOWSER_REGISTRY.find(b => b.vehicleNo === selectedBowserNo) || PUBLISHED_BOWSER_REGISTRY[0];
  const selectedBowserDuties = bowserDuties.filter(d => d.vehicleNo === selectedBowserNo);
  const selectedBowserLogs = loadingLogs.filter(l => l.bowserVehicleNo === selectedBowserNo);

  const handleAddScheduleItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: ScheduleItem = {
      id: `sch-${Date.now()}`,
      pipelinePlace,
      waterType: selectedWaterType,
      quantity,
      locationName: selectedLocationName,
      approxTime,
      status: 'Scheduled'
    };
    setScheduleItems(prev => [...prev, newItem]);
    setIsScheduleModalOpen(false);
  };

  const handleRemoveScheduleItem = (id: string) => {
    setScheduleItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmitDuty = (e: React.FormEvent) => {
    e.preventDefault();
    if (scheduleItems.length === 0) {
      alert('Please add at least one schedule item to the Bowser Duty schedule list.');
      return;
    }

    addBowserDuty({
      capacity,
      vehicleNo,
      taName,
      taNumber,
      taContract,
      dutyMeName,
      dutyMeNumber,
      dutyMeContract,
      dutyDate,
      status: 'Active',
      schedule: scheduleItems
    });

    setScheduleItems([]);
    alert(`Bowser Duty for Vehicle ${vehicleNo} created successfully!`);
    setActiveSubTab('fleet');
  };

  const filteredFleet = PUBLISHED_BOWSER_REGISTRY.filter(b =>
    b.vehicleNo.toLowerCase().includes(fleetSearchQuery.toLowerCase()) ||
    b.srNo.toLowerCase().includes(fleetSearchQuery.toLowerCase()) ||
    b.defaultTaName.toLowerCase().includes(fleetSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner & Subtab Switcher */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="bg-cyan-500/20 text-cyan-400 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full border border-cyan-400/30">
              Bowser Fleet Management
            </span>
            <span className="text-xs text-slate-400">CCED (E) Dockyard Operations</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Bowser Duty & Fleet Supply Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Feeding all bowsers, inspecting individual bowser insights, Transport Assistant (TA), Engineering Mechanic (ME), and water supply logs.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('fleet')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'fleet'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bowser Fleet Dashboard
          </button>
          <button
            onClick={() => setActiveSubTab('form')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'form'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            + Create Bowser Duty Form
          </button>
        </div>
      </div>

      {/* SUBTAB 1: BOWSER FLEET DASHBOARD & INDIVIDUAL BOWSER INSIGHTS */}
      {activeSubTab === 'fleet' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: List of All Registered Bowsers */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Truck className="h-5 w-5 text-cyan-400" />
                Bowser Fleet Directory
              </h3>
              <span className="text-xs bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded">
                30 Registered
              </span>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={fleetSearchQuery}
                onChange={e => setFleetSearchQuery(e.target.value)}
                placeholder="Search SR No or Vehicle Naha No..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
              {filteredFleet.map(b => {
                const isSelected = b.vehicleNo === selectedBowserNo;
                return (
                  <div
                    key={b.srNo}
                    onClick={() => setSelectedBowserNo(b.vehicleNo)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-950/30'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400 font-mono font-bold text-xs">
                        {b.srNo}
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-white flex items-center gap-2">
                          {b.vehicleNo}
                          <span className="text-[10px] font-semibold text-slate-400">({b.capacity.toLocaleString()}L)</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          TA: {b.defaultTaName}
                        </div>
                      </div>
                    </div>

                    <ChevronRight className={`h-4 w-4 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Columns: Selected Bowser Insights & Supply Logs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bowser Specs & Officer Details Card */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider">
                      Bowser Profile Insights
                    </span>
                    <h3 className="text-xl font-black text-white">
                      Vehicle Naha No: {selectedBowserRegistry.vehicleNo} ({selectedBowserRegistry.srNo})
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 font-bold">Tank Capacity</span>
                  <div className="text-lg font-black text-cyan-400 font-mono">
                    {selectedBowserRegistry.capacity.toLocaleString()} Liters
                  </div>
                </div>
              </div>

              {/* TA & ME Details Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* TA: Transport Assistant */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> TA: Transport Assistant Details
                  </div>
                  <div className="font-extrabold text-white text-sm">
                    {selectedBowserRegistry.defaultTaName}
                  </div>
                  <div className="text-slate-400">Official Registration: Transport Assistant Branch</div>
                  <div className="text-slate-500 text-[10px]">Assigned to Bowser {selectedBowserRegistry.vehicleNo}</div>
                </div>

                {/* ME: Engineering Mechanic */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> ME: Engineering Mechanic (Supporting Bowser)
                  </div>
                  <div className="font-extrabold text-white text-sm">
                    {selectedBowserRegistry.defaultMeName}
                  </div>
                  <div className="text-slate-400">Engineering Branch Mechanic</div>
                  <div className="text-slate-500 text-[10px]">Mechanical Support for Bowser Engine & Pump</div>
                </div>
              </div>
            </div>

            {/* Water Supply Log by Bowser: Where, When, Amount Supplied */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-cyan-400" />
                    Water Supply Log for Bowser {selectedBowserRegistry.vehicleNo}
                  </h3>
                  <p className="text-xs text-slate-400">Log of where, when, and exact amount supplied by this bowser</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Where Supplied (Location)</th>
                      <th className="py-2.5 px-3">When Supplied (Date & Time)</th>
                      <th className="py-2.5 px-3">Water Type</th>
                      <th className="py-2.5 px-3 text-right">Amount Supplied</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {selectedBowserLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-500">
                          No recent supply logs recorded for Bowser {selectedBowserRegistry.vehicleNo}. Use Real-Time Loading Log to record deliveries.
                        </td>
                      </tr>
                    ) : (
                      selectedBowserLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                              {log.locationName}
                            </div>
                            {log.remarks && <div className="text-[10px] text-slate-400 mt-0.5">{log.remarks}</div>}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-300">
                            {log.timestamp}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                              {log.waterType}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-black text-emerald-400 text-sm">
                            {log.volumeLoaded.toLocaleString()} Liters
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: BOWSER DUTY CREATOR FORM */}
      {activeSubTab === 'form' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmitDuty} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Truck className="h-5 w-5 text-cyan-400" />
                Bowser Operation & Officer Details
              </h3>

              {/* Vehicle Number & Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Vehicle Number (Naha No)
                  </label>
                  <input
                    type="text"
                    required
                    value={vehicleNo}
                    onChange={e => setVehicleNo(e.target.value)}
                    placeholder="e.g. NAHA-04, NB-4521"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Bowser Capacity (Liters)
                  </label>
                  <input
                    type="number"
                    required
                    value={capacity}
                    onChange={e => setCapacity(Number(e.target.value))}
                    placeholder="12000"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Duty Date
                  </label>
                  <input
                    type="date"
                    required
                    value={dutyDate}
                    onChange={e => setDutyDate(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* TA Details */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="h-4 w-4" /> Transport Assistant (TA) Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">TA Name</label>
                    <input
                      type="text"
                      required
                      value={taName}
                      onChange={e => setTaName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">TA Number</label>
                    <input
                      type="text"
                      required
                      value={taNumber}
                      onChange={e => setTaNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">TA Contract Details</label>
                    <input
                      type="text"
                      required
                      value={taContract}
                      onChange={e => setTaContract(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* ME Details */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="h-4 w-4" /> Engineering Mechanic (ME - Supporting Bowser) Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">ME Name</label>
                    <input
                      type="text"
                      required
                      value={dutyMeName}
                      onChange={e => setDutyMeName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">ME Number</label>
                    <input
                      type="text"
                      required
                      value={dutyMeNumber}
                      onChange={e => setDutyMeNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">ME Contract Details</label>
                    <input
                      type="text"
                      required
                      value={dutyMeContract}
                      onChange={e => setDutyMeContract(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Schedule List */}
              <div className="space-y-3 border-t border-slate-800 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <ClipboardList className="h-4 w-4 text-cyan-400" />
                      Delivery Schedule List ({scheduleItems.length} Stops)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Pipeline places, water type (RO/Normal/Well), volume & approximate time
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsScheduleModalOpen(true)}
                    className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold px-3 py-2 rounded-xl border border-cyan-400/30 flex items-center space-x-1.5 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Pop-Up Schedule Item</span>
                  </button>
                </div>

                {scheduleItems.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs">
                    No schedule items added yet. Click <strong>"Add Pop-Up Schedule Item"</strong> above to construct the delivery route.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {scheduleItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-7 w-7 rounded-lg bg-cyan-950 text-cyan-400 font-bold flex items-center justify-center border border-cyan-800">
                            #{idx + 1}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              {item.pipelinePlace}
                              <span className="text-[10px] font-semibold bg-slate-800 text-cyan-300 px-2 py-0.5 rounded">
                                {item.waterType}
                              </span>
                            </div>
                            <div className="text-slate-400 text-[11px] flex items-center gap-3 mt-0.5">
                              <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-slate-500" /> {item.locationName}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-slate-500" /> {item.approxTime}</span>
                              <span>•</span>
                              <span className="text-emerald-400 font-bold">{item.quantity.toLocaleString()} L</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveScheduleItem(item.id)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm py-3 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2 border border-cyan-300/30"
              >
                <CheckCircle className="h-5 w-5" />
                <span>Save & Dispatch Bowser Duty</span>
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-base font-extrabold text-white flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-cyan-400" />
                  Active Bowser Duties
                </span>
                <span className="text-xs bg-cyan-950 text-cyan-300 px-2.5 py-1 rounded-lg font-bold border border-cyan-800">
                  {bowserDuties.length} Registered
                </span>
              </h3>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {bowserDuties.map(duty => (
                  <div
                    key={duty.id}
                    onClick={() => setActiveDutySlip(duty)}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/40 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm text-cyan-400 font-mono">{duty.vehicleNo}</span>
                        <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                          {duty.capacity.toLocaleString()} L
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                        {duty.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1">
                      <div><strong>TA (Transport Asst):</strong> {duty.taName}</div>
                      <div><strong>ME (Eng Mechanic):</strong> {duty.dutyMeName}</div>
                      <div className="text-slate-400 text-[11px] pt-1 border-t border-slate-800/60 mt-2 flex justify-between">
                        <span>{duty.schedule.length} Schedule Stops</span>
                        <span className="text-cyan-400 flex items-center gap-1 font-bold">View Slip <ChevronRight className="h-3 w-3" /></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POP-UP MODAL: Interactive Schedule Creator */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-cyan-400" />
                Add Pop-Up Schedule Location & Pipeline
              </h3>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddScheduleItem} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Pipeline Place / Delivery Point</label>
                <input
                  type="text"
                  required
                  value={pipelinePlace}
                  onChange={e => setPipelinePlace(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Select Water Type</label>
                <select
                  value={selectedWaterType}
                  onChange={e => setSelectedWaterType(e.target.value as WaterType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white"
                >
                  <option value="RO Water">RO Water (Pure Desalinated)</option>
                  <option value="Normal Water">Normal Water (Standard Supply)</option>
                  <option value="Well Water">Well Water (Industrial/Washing)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Quantity (Liters)</label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Approximate Time</label>
                  <input
                    type="time"
                    required
                    value={approxTime}
                    onChange={e => setApproxTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Location / Target Tank Name</label>
                <select
                  value={selectedLocationName}
                  onChange={e => setSelectedLocationName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white"
                >
                  {allLocations.map(loc => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name} ({loc.base} - {loc.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-black hover:bg-cyan-400"
                >
                  Add to Schedule List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POP-UP MODAL: Duty Slip */}
      {activeDutySlip && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-cyan-400 tracking-wider">
                  Official SLN CCED (E) Bowser Duty Slip
                </span>
                <h3 className="text-lg font-black text-white">
                  Dispatch Slip: {activeDutySlip.vehicleNo}
                </h3>
              </div>
              <button
                onClick={() => setActiveDutySlip(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-xs space-y-4 font-mono">
              <div className="grid grid-cols-2 gap-4 border-b border-slate-800 pb-3">
                <div>
                  <p className="text-slate-500">Vehicle Naha No:</p>
                  <p className="text-sm font-bold text-cyan-400">{activeDutySlip.vehicleNo}</p>
                  <p className="text-slate-500 mt-2">Tank Capacity:</p>
                  <p className="font-bold text-white">{activeDutySlip.capacity.toLocaleString()} Liters</p>
                </div>
                <div>
                  <p className="text-slate-500">Duty Date:</p>
                  <p className="font-bold text-white">{activeDutySlip.dutyDate}</p>
                  <p className="text-slate-500 mt-2">Status:</p>
                  <p className="font-bold text-emerald-400">{activeDutySlip.status}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-slate-800 pb-3">
                <div>
                  <p className="text-slate-500">TA (Transport Assistant):</p>
                  <p className="font-bold text-slate-200">{activeDutySlip.taName}</p>
                  <p className="text-slate-400">No: {activeDutySlip.taNumber}</p>
                  <p className="text-slate-500 text-[10px]">{activeDutySlip.taContract}</p>
                </div>
                <div>
                  <p className="text-slate-500">ME (Engineering Mechanic):</p>
                  <p className="font-bold text-slate-200">{activeDutySlip.dutyMeName}</p>
                  <p className="text-slate-400">No: {activeDutySlip.dutyMeNumber}</p>
                  <p className="text-slate-500 text-[10px]">{activeDutySlip.dutyMeContract}</p>
                </div>
              </div>

              <div>
                <p className="text-slate-400 font-bold mb-2">Schedule Stops:</p>
                <div className="space-y-2">
                  {activeDutySlip.schedule.map((item, idx) => (
                    <div key={item.id} className="bg-slate-900 p-2.5 rounded border border-slate-800 flex justify-between">
                      <div>
                        <span className="text-cyan-400 font-bold">#{idx + 1} {item.pipelinePlace}</span>
                        <div className="text-[11px] text-slate-400">{item.locationName} ({item.waterType})</div>
                      </div>
                      <div className="text-right">
                        <div className="text-emerald-400 font-bold">{item.quantity.toLocaleString()} L</div>
                        <div className="text-slate-400 text-[10px]">{item.approxTime}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center space-x-2 text-xs"
              >
                <Printer className="h-4 w-4" />
                <span>Print Official Slip</span>
              </button>
              <button
                onClick={() => setActiveDutySlip(null)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs"
              >
                Close Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
