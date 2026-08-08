import React, { useState } from 'react';
import { WaterLocation } from '../../types/waterDistribution';
import { useData } from '../../context/DataContext';
import {
  X,
  MapPin,
  Users,
  Phone,
  Droplet,
  Calendar,
  Truck,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  PlusCircle,
  ExternalLink,
  Edit3,
  Save
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface LocationDetailModalProps {
  location: WaterLocation;
  onClose: () => void;
}

export const LocationDetailModal: React.FC<LocationDetailModalProps> = ({ location, onClose }) => {
  const { togglePriorityLocation, quickFillLocation, updateLocation } = useData();

  const coords = location.coordinates || { lat: 8.5725, lng: 81.2385 };

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(location.name);
  const [editBase, setEditBase] = useState(location.base);
  const [editCapacity, setEditCapacity] = useState(location.tankCapacity);
  const [editMonthlyAvg, setEditMonthlyAvg] = useState(location.monthlyAvgConsumption);
  const [editPeopleCount, setEditPeopleCount] = useState(location.consumingPeopleCount);
  const [editBenefactors, setEditBenefactors] = useState(location.benefactors.join(', '));
  const [editPocName, setEditPocName] = useState(location.pointOfContact.name);
  const [editPocRank, setEditPocRank] = useState(location.pointOfContact.rank);
  const [editPocPhone, setEditPocPhone] = useState(location.pointOfContact.phone);
  const [editPocDept, setEditPocDept] = useState(location.pointOfContact.department);

  // Quick Fill State
  const [fillVolume, setFillVolume] = useState<number>(5000);
  const [bowserNo, setBowserNo] = useState<string>('NAHA-04');
  const [showQuickFill, setShowQuickFill] = useState(false);

  const fillPercentage = Math.round((location.currentLevel / location.tankCapacity) * 100);

  const chartData = [
    { day: 'Day -6', level: Math.max(20, fillPercentage - 25), intake: 0, consumption: 2500 },
    { day: 'Day -5', level: Math.max(15, fillPercentage - 40), intake: 8000, consumption: 2800 },
    { day: 'Day -4', level: Math.max(10, fillPercentage - 15), intake: 0, consumption: 2600 },
    { day: 'Day -3', level: Math.max(30, fillPercentage + 20), intake: 10000, consumption: 3100 },
    { day: 'Day -2', level: Math.max(25, fillPercentage + 10), intake: 0, consumption: 2900 },
    { day: 'Day -1', level: Math.max(20, fillPercentage - 5), intake: 5000, consumption: 3200 },
    { day: 'Today', level: fillPercentage, intake: location.lastLoadedAmount, consumption: 3000 },
  ];

  const handleSaveEdits = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: WaterLocation = {
      ...location,
      name: editName,
      base: editBase,
      tankCapacity: Number(editCapacity),
      monthlyAvgConsumption: Number(editMonthlyAvg),
      consumingPeopleCount: Number(editPeopleCount),
      benefactors: editBenefactors.split(',').map(b => b.trim()).filter(Boolean),
      pointOfContact: {
        name: editPocName,
        rank: editPocRank,
        phone: editPocPhone,
        department: editPocDept
      }
    };

    updateLocation(updated);
    setIsEditing(false);
    alert(`Location details for ${editName} updated successfully!`);
  };

  const handleQuickFillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    quickFillLocation(location.id, fillVolume, bowserNo, location.category === 'RO' ? 'RO Water' : 'Normal Water');
    setShowQuickFill(false);
    alert(`Tank quick-filled with ${fillVolume}L by Bowser ${bowserNo}!`);
  };

  const handleElevatePriority = () => {
    togglePriorityLocation(location.id, 'Elevated directly from Location Detail Modal');
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6 my-auto max-h-[92vh] flex flex-col animate-in fade-in">
        {/* Header Bar */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                  location.category === 'RO'
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                    : 'bg-blue-950 text-blue-300 border-blue-700'
                }`}
              >
                {location.category} Water Point
              </span>

              <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded">
                Base: {location.base}
              </span>

              {location.locationType && (
                <span className="text-xs font-bold text-cyan-300 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800">
                  {location.locationType}
                </span>
              )}

              {location.isPriority && (
                <span className="bg-rose-950 text-rose-300 font-extrabold text-xs px-2.5 py-1 rounded border border-rose-700 animate-pulse flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-400" /> Priority Location
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{location.name}</h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1 border transition-all ${
                isEditing
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border-cyan-500/30'
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Location Specs'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {/* Edit Form */}
          {isEditing ? (
            <form onSubmit={handleSaveEdits} className="bg-amber-950/20 border border-amber-800/60 p-5 rounded-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-amber-800/60 pb-2">
                <span className="font-extrabold text-amber-400 uppercase text-xs flex items-center gap-1.5">
                  <Edit3 className="h-4 w-4" /> Edit Location Specifications & Contact Details
                </span>
                <span className="text-[10px] text-slate-400">Admin Editing Mode</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Location Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Base Location</label>
                  <input
                    type="text"
                    required
                    value={editBase}
                    onChange={e => setEditBase(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tank Capacity (Liters)</label>
                  <input
                    type="number"
                    required
                    value={editCapacity}
                    onChange={e => setEditCapacity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Monthly Avg Consumption (L/mo)</label>
                  <input
                    type="number"
                    required
                    value={editMonthlyAvg}
                    onChange={e => setEditMonthlyAvg(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Consuming People Count</label>
                  <input
                    type="number"
                    required
                    value={editPeopleCount}
                    onChange={e => setEditPeopleCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Benefactors List (Comma Separated)</label>
                <input
                  type="text"
                  required
                  value={editBenefactors}
                  onChange={e => setEditBenefactors(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-slate-400 mb-1">POC Name</label>
                  <input
                    type="text"
                    required
                    value={editPocName}
                    onChange={e => setEditPocName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">POC Rank</label>
                  <input
                    type="text"
                    required
                    value={editPocRank}
                    onChange={e => setEditPocRank(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">POC Phone</label>
                  <input
                    type="text"
                    required
                    value={editPocPhone}
                    onChange={e => setEditPocPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">POC Department</label>
                  <input
                    type="text"
                    required
                    value={editPocDept}
                    onChange={e => setEditPocDept(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center space-x-1.5"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Location Edits</span>
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Tank Capacity & Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-slate-300 uppercase tracking-wider">
                      Current Tank Storage Status
                    </span>
                    <span className="font-mono font-bold text-cyan-400">
                      {location.currentLevel.toLocaleString()} / {location.tankCapacity.toLocaleString()} Liters
                    </span>
                  </div>

                  <div className="w-full bg-slate-900 h-4 rounded-full border border-slate-800 overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        fillPercentage < 30
                          ? 'bg-rose-500'
                          : fillPercentage < 60
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
                    <div>
                      <strong>Last Loaded:</strong> {location.lastLoadedDate} ({location.lastLoadedAmount.toLocaleString()}L)
                    </div>
                    <div>
                      <strong>Monthly Avg:</strong> {location.monthlyAvgConsumption.toLocaleString()} L/mo
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2">
                  <button
                    onClick={handleElevatePriority}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                      location.isPriority
                        ? 'bg-rose-950 text-rose-300 border border-rose-700 hover:bg-rose-900'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span>{location.isPriority ? 'Demote Priority' : 'Elevate to Priority'}</span>
                  </button>

                  <button
                    onClick={() => setShowQuickFill(!showQuickFill)}
                    className="w-full py-2.5 px-3 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-500/30 font-bold text-xs flex items-center justify-center space-x-2 transition-all"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Quick Log Fill</span>
                  </button>
                </div>
              </div>

              {showQuickFill && (
                <form onSubmit={handleQuickFillSubmit} className="bg-cyan-950/30 border border-cyan-800/60 p-4 rounded-xl space-y-3 text-xs animate-in fade-in">
                  <div className="font-extrabold text-cyan-400 uppercase">Log Immediate Bowser Fill to Tank</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1">Volume Delivered (Liters)</label>
                      <input
                        type="number"
                        required
                        value={fillVolume}
                        onChange={e => setFillVolume(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-cyan-700 rounded-lg px-3 py-1.5 text-white font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">Bowser Vehicle No</label>
                      <input
                        type="text"
                        required
                        value={bowserNo}
                        onChange={e => setBowserNo(e.target.value)}
                        className="w-full bg-slate-950 border border-cyan-700 rounded-lg px-3 py-1.5 text-white font-mono"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-cyan-500 text-slate-950 font-black px-4 py-2 rounded-lg hover:bg-cyan-400"
                  >
                    Confirm Tank Log Fill
                  </button>
                </form>
              )}

              {/* Infographics */}
              <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-cyan-400" />
                  Consumption Pattern & Infographics Trend (Liters / Stock %)
                </h3>

                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                      />
                      <Line type="monotone" dataKey="level" name="Tank Stock Level %" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="consumption" name="Est. Consumption (L)" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Benefactors & Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="h-4 w-4" /> Benefactors ({location.benefactors.length} Units/Groups)
                  </h4>
                  <div className="space-y-1.5">
                    {location.benefactors.map((ben, idx) => (
                      <div key={idx} className="bg-slate-900 px-3 py-1.5 rounded border border-slate-800 text-slate-200 font-semibold flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-cyan-400" />
                        {ben}
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">
                    Total Consuming People: <strong>{location.consumingPeopleCount} Officers & Sailors</strong>
                  </p>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="h-4 w-4" /> Point of Contact (POC)
                  </h4>
                  <div className="space-y-1 text-slate-300">
                    <div><strong className="text-white">{location.pointOfContact.name}</strong></div>
                    <div className="text-slate-400">{location.pointOfContact.rank}</div>
                    <div className="text-cyan-300 font-mono font-bold flex items-center gap-1 mt-1">
                      <Phone className="h-3 w-3" /> {location.pointOfContact.phone}
                    </div>
                    <div className="text-slate-400 text-[10px] mt-1">{location.pointOfContact.department}</div>
                  </div>
                </div>
              </div>

              {/* Map & Future Schedules */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" /> Dockyard Location Map
                    </h4>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px] font-bold"
                    >
                      Open Google Maps <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <div className="h-40 bg-slate-900 rounded-lg border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/30 via-slate-950 to-slate-950 opacity-80" />
                    <MapPin className="h-10 w-10 text-rose-500 animate-bounce relative z-10" />
                    <div className="relative z-10 text-center mt-1">
                      <span className="font-bold text-white text-xs">{location.name}</span>
                      <p className="text-[10px] text-slate-400 font-mono">{coords.lat}° N, {coords.lng}° E</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" /> Future Loading Schedule Dates
                  </h4>

                  <div className="space-y-2">
                    {location.futureSchedules.length === 0 ? (
                      <div className="text-slate-500 text-center py-4">No future bowser deliveries scheduled.</div>
                    ) : (
                      location.futureSchedules.map(sch => (
                        <div key={sch.id} className="bg-slate-900 p-2.5 rounded border border-slate-800 flex justify-between items-center">
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              <Truck className="h-3.5 w-3.5 text-cyan-400" />
                              {sch.bowserVehicleNo} ({sch.waterType})
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Scheduled: {sch.scheduledDate} at {sch.approxTime}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-emerald-400 font-mono">{sch.expectedVolume.toLocaleString()} L</div>
                            <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                              {sch.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-800 shrink-0">
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Location ID: <code className="text-cyan-400">{location.id}</code>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs"
          >
            Close Details Window
          </button>
        </div>
      </div>
    </div>
  );
};
