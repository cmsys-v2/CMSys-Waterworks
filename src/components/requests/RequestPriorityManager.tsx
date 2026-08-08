import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { WaterRequest, WaterType } from '../../types/waterDistribution';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Droplet,
  Plus,
  ShieldAlert,
  SlidersHorizontal,
  Truck,
  MapPin
} from 'lucide-react';

export const RequestPriorityManager: React.FC = () => {
  const {
    allLocations,
    priorityLocations,
    requests,
    togglePriorityLocation,
    addRequest,
    updateRequestStatus,
    setSelectedLocation
  } = useData();

  const [selectedLocationId, setSelectedLocationId] = useState(allLocations[0]?.id || '');
  const [requiredVolume, setRequiredVolume] = useState<number>(10000);
  const [waterType, setWaterType] = useState<WaterType>('RO Water');
  const [urgency, setUrgency] = useState<'Standard' | 'Urgent' | 'Emergency'>('Emergency');
  const [requestedBy, setRequestedBy] = useState('LCdr Perera (Operations Officer)');
  const [contactPhone, setContactPhone] = useState('+94 77 123 4567');
  const [remarks, setRemarks] = useState('Urgent vessel supply request for Dockyard intake');
  const [isPriorityRequest, setIsPriorityRequest] = useState(true);

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const locObj = allLocations.find(l => l.id === selectedLocationId);
    if (!locObj) return;

    addRequest({
      locationId: locObj.id,
      locationName: locObj.name,
      base: locObj.base,
      category: locObj.category,
      waterType,
      requiredVolume,
      urgency,
      isPriority: isPriorityRequest,
      status: isPriorityRequest || urgency === 'Emergency' ? 'Priority' : 'Pending',
      requestedBy,
      contactPhone,
      remarks
    });

    alert(`Water Request created and submitted to priority queue!`);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="bg-rose-500/20 text-rose-400 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full border border-rose-400/30">
              Dual-Pane Priority UI
            </span>
            <span className="text-xs text-slate-400">CCED (E) Priority Control</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Request and Priority Order System
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dual-pane grouped view featuring a dedicated Priority List alongside all Dockyard locations. Allows Admin (SCE WW) to elevate any location to priority status.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-rose-950/80 border border-rose-800 p-3 rounded-xl text-right">
            <div className="text-[10px] font-bold text-rose-300 uppercase">Priority Elevated Count</div>
            <div className="text-lg font-black text-rose-400 flex items-center justify-end gap-1">
              <AlertTriangle className="h-4 w-4 animate-pulse" />
              {priorityLocations.length} Priority Locations
            </div>
          </div>
        </div>
      </div>

      {/* DUAL-PANE UI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PANE 1: DEDICATED PRIORITY LIST */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-400 animate-pulse" />
                Priority Elevated Locations & Emergency Queue
              </h3>
              <p className="text-xs text-slate-400">High priority dispatch locations requiring immediate bowser supply</p>
            </div>
            <span className="bg-rose-950 text-rose-200 text-xs font-bold px-2.5 py-1 rounded-full border border-rose-800">
              {priorityLocations.length} Elevated
            </span>
          </div>

          <div className="space-y-3">
            {priorityLocations.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs">
                No locations elevated to priority at this moment. You can elevate any location using Pane 2 on the right.
              </div>
            ) : (
              priorityLocations.map(loc => {
                const fillPercentage = Math.round((loc.currentLevel / loc.tankCapacity) * 100);

                return (
                  <div
                    key={loc.id}
                    className="bg-rose-950/20 border border-rose-800/60 p-4 rounded-xl space-y-3 relative overflow-hidden group hover:border-rose-500/80 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800">
                            {loc.base}
                          </span>
                          <span className="text-[10px] font-bold bg-slate-800 text-cyan-300 px-2 py-0.5 rounded">
                            {loc.category} Water
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-white mt-1">{loc.name}</h4>
                        <p className="text-[11px] text-rose-300/80 font-medium mt-0.5">
                          {loc.priorityReason || 'Elevated to Priority Status by Admin'}
                        </p>
                      </div>

                      <button
                        onClick={() => togglePriorityLocation(loc.id)}
                        className="bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-rose-700 transition-colors"
                      >
                        Demote Priority
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
                      <div>
                        <span className="text-slate-400">Current Stock:</span>
                        <div className="font-mono font-bold text-white">
                          {loc.currentLevel.toLocaleString()} / {loc.tankCapacity.toLocaleString()} L ({fillPercentage}%)
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">People Served:</span>
                        <div className="font-bold text-emerald-400">{loc.consumingPeopleCount} Officers</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-400">POC: {loc.pointOfContact.name} ({loc.pointOfContact.phone})</span>
                      <button
                        onClick={() => setSelectedLocation(loc)}
                        className="text-cyan-400 hover:underline font-bold"
                      >
                        Open Details & Schedule →
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Emergency Dispatch Requests</span>
              <span className="text-[10px] text-slate-400">{requests.length} Total Requests</span>
            </h4>

            <div className="space-y-2">
              {requests.map(req => (
                <div key={req.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      {req.locationName}
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        req.urgency === 'Emergency' ? 'bg-rose-950 text-rose-300 border border-rose-800 font-bold' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {req.urgency}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Req: {req.requiredVolume.toLocaleString()}L ({req.waterType}) • {req.requestedBy}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <select
                      value={req.status}
                      onChange={e => updateRequestStatus(req.id, e.target.value as WaterRequest['status'])}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] font-bold text-cyan-300 focus:outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Priority">Priority</option>
                      <option value="Assigned">Bowser Assigned</option>
                      <option value="In-Transit">In-Transit</option>
                      <option value="Fulfilled">Fulfilled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PANE 2: ALL DOCKYARD LOCATIONS LIST & ADMIN ELEVATE CONTROLS */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-cyan-400" />
                All Dockyard Locations List & Priority Elevate Controls
              </h3>
              <p className="text-xs text-slate-400">Admin functionality allowing selection and elevation of any location</p>
            </div>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {allLocations.map(loc => (
              <div
                key={loc.id}
                className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                  loc.isPriority
                    ? 'bg-rose-950/20 border-rose-800/80 shadow-md shadow-rose-950/20'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-sm text-white">{loc.name}</span>
                    <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      {loc.base}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        loc.category === 'RO' ? 'bg-cyan-950 text-cyan-300' : 'bg-blue-950 text-blue-300'
                      }`}
                    >
                      {loc.category}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-3">
                    <span>Capacity: <strong>{loc.tankCapacity.toLocaleString()}L</strong></span>
                    <span>•</span>
                    <span>Current: <strong>{loc.currentLevel.toLocaleString()}L</strong></span>
                    <span>•</span>
                    <span>People: <strong>{loc.consumingPeopleCount}</strong></span>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => togglePriorityLocation(loc.id, 'Elevated to Priority Location by SCE WW Admin')}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all ${
                      loc.isPriority
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>{loc.isPriority ? 'Elevated (Priority)' : 'Elevate to Priority'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-cyan-400" /> Create & Submit Water Request
            </h4>

            <form onSubmit={handleCreateRequest} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Select Target Location</label>
                <select
                  value={selectedLocationId}
                  onChange={e => setSelectedLocationId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none"
                >
                  {allLocations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.base} - {loc.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Required Volume (L)</label>
                  <input
                    type="number"
                    required
                    value={requiredVolume}
                    onChange={e => setRequiredVolume(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Urgency Level</label>
                  <select
                    value={urgency}
                    onChange={e => setUrgency(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Emergency">Emergency (Immediate)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="priCheck"
                  checked={isPriorityRequest}
                  onChange={e => setIsPriorityRequest(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 bg-slate-950 border-slate-700"
                />
                <label htmlFor="priCheck" className="text-slate-300 font-bold text-xs cursor-pointer">
                  Auto-elevate target location to Priority Status upon creation
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold py-2.5 rounded-xl shadow-lg shadow-rose-950/40 text-xs"
              >
                Submit Priority Request Order
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
