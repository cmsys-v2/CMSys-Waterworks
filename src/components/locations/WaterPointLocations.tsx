import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { WaterLocation, LocationType } from '../../types/waterDistribution';
import { LocationDetailModal } from './LocationDetailModal';
import {
  Filter,
  Layers,
  Search,
  MapPin,
  Users,
  Droplet,
  AlertTriangle,
  Calendar,
  ChevronRight,
  Plus,
  X,
  CheckCircle2,
  Building
} from 'lucide-react';

interface WaterPointLocationsProps {
  category: 'RO' | 'Standard';
}

export const WaterPointLocations: React.FC<WaterPointLocationsProps> = ({ category }) => {
  const { roLocations, standardLocations, selectedLocation, setSelectedLocation, addLocation } = useData();

  const locations = category === 'RO' ? roLocations : standardLocations;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBase, setSelectedBase] = useState('ALL');

  // PIC 2 CORRECTION: ADD LOCATION FORM STATE (LATITUDE & LONGITUDE REMOVED!)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBase, setNewBase] = useState('SLNS Gemunu');
  const [newLocationType, setNewLocationType] = useState<LocationType>('Accomodation - Officers');
  const [newCapacity, setNewCapacity] = useState<number>(20000);
  const [newPeopleCount, setNewPeopleCount] = useState<number>(350);
  const [newBenefactors, setNewBenefactors] = useState('Officers Mess Crew, Wardroom Staff');
  const [newPocName, setNewPocName] = useState('Lt Cdr Silva');
  const [newPocRank, setNewPocRank] = useState('Lieutenant Commander');
  const [newPocPhone, setNewPocPhone] = useState('+94 77 999 8877');
  const [newPocDept, setNewPocDept] = useState('Dockyard Operations');

  // Dynamic Monthly Average calculation based on capacity & people count (e.g. 150L/person/day * 30 days)
  const computedMonthlyAvg = Math.round(newPeopleCount * 150 * 30);

  const bases = Array.from(new Set(locations.map(l => l.base)));

  const filteredLocations = locations.filter(loc => {
    const matchesSearch =
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.base.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (loc.locationType && loc.locationType.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesBase = selectedBase === 'ALL' || loc.base === selectedBase;
    return matchesSearch && matchesBase;
  });

  const handleCreateLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLocation({
      name: newName,
      base: newBase,
      category,
      locationType: newLocationType,
      tankCapacity: newCapacity,
      monthlyAvgConsumption: computedMonthlyAvg,
      consumingPeopleCount: newPeopleCount,
      benefactors: newBenefactors.split(',').map(b => b.trim()).filter(Boolean),
      pointOfContact: {
        name: newPocName,
        rank: newPocRank,
        phone: newPocPhone,
        department: newPocDept
      },
      // Default coordinates (lat/long fields removed from form as requested!)
      coordinates: {
        lat: 8.5725,
        lng: 81.2385
      }
    });

    setIsAddModalOpen(false);
    setNewName('');
    alert(`New ${category} Water Location "${newName}" added successfully! Monthly Avg: ${computedMonthlyAvg.toLocaleString()}L/mo`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span
              className={`font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full border ${
                category === 'RO'
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400/30'
                  : 'bg-blue-500/20 text-blue-400 border-blue-400/30'
              }`}
            >
              {category === 'RO' ? 'RO Water Tracking' : 'Standard Water Tracking'}
            </span>
            <span className="text-xs text-slate-400">CCED (E) Dockyard Premises</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            {category === 'RO' ? 'RO Water Point Locations' : 'Standard Water Point Locations'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Rich tracking interface displaying Name, Base, Location Type, Tank Capacity, Last Loaded Date, and Monthly Average Consumption.
          </p>
        </div>

        {/* Filter Controls & Add Location Trigger */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search location or type..."
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={selectedBase}
            onChange={e => setSelectedBase(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-semibold focus:outline-none"
          >
            <option value="ALL">All Bases</option>
            {bases.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-lg shadow-cyan-950/40 flex items-center space-x-1.5 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Location</span>
          </button>
        </div>
      </div>

      {/* Main Location Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLocations.map(loc => {
          const fillPercentage = Math.round((loc.currentLevel / loc.tankCapacity) * 100);

          return (
            <div
              key={loc.id}
              onClick={() => setSelectedLocation(loc)}
              className="glass-panel glass-panel-hover p-6 rounded-2xl border border-slate-800 space-y-4 cursor-pointer relative group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        loc.category === 'RO'
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                          : 'bg-blue-950 text-blue-300 border-blue-800'
                      }`}
                    >
                      {loc.base}
                    </span>
                    {loc.locationType && (
                      <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                        {loc.locationType}
                      </span>
                    )}
                  </div>

                  {loc.isPriority && (
                    <span className="text-[10px] font-extrabold bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800 animate-pulse flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Priority
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-white group-hover:text-cyan-400 transition-colors">
                    {loc.name}
                  </h3>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold">Tank Storage</span>
                    <span className="font-mono font-bold text-white">
                      {loc.currentLevel.toLocaleString()} / {loc.tankCapacity.toLocaleString()} L
                    </span>
                  </div>

                  <div className="w-full bg-slate-900 h-2.5 rounded-full border border-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        fillPercentage < 30
                          ? 'bg-rose-500'
                          : fillPercentage < 60
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>

                  <div className="text-[11px] text-slate-400 flex justify-between pt-1">
                    <span>Stock Level: <strong className="text-cyan-400">{fillPercentage}%</strong></span>
                    <span>People Served: <strong className="text-emerald-400">{loc.consumingPeopleCount}</strong></span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs border-t border-slate-800/80 pt-3">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Last Loaded Date:</span>
                    <span className="font-mono font-bold text-cyan-300">{loc.lastLoadedDate}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Last Loaded Amount:</span>
                    <span className="font-mono font-bold text-emerald-400">{loc.lastLoadedAmount.toLocaleString()} L</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Monthly Avg Consumption:</span>
                    <span className="font-mono font-bold text-amber-300">{loc.monthlyAvgConsumption.toLocaleString()} L/mo</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
                <span>View Interactive Modal & Details</span>
                <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {selectedLocation && (
        <LocationDetailModal
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
        />
      )}

      {/* POP-UP MODAL: PIC 2 ADD NEW LOCATION (LATITUDE & LONGITUDE REMOVED!) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-cyan-400" />
                Add New {category} Water Point Location
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLocationSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Location Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. Officers Wardroom Complex"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Base / Area</label>
                  <input
                    type="text"
                    required
                    value={newBase}
                    onChange={e => setNewBase(e.target.value)}
                    placeholder="e.g. SLNS Gemunu"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              {/* PIC 2 CORRECTION: LOCATION TYPES SELECTION */}
              <div>
                <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                  <Building className="h-4 w-4 text-cyan-400" />
                  Select Location Type
                </label>
                <select
                  value={newLocationType}
                  onChange={e => setNewLocationType(e.target.value as LocationType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                >
                  <option value="Accomodation - Officers">Accomodation - Officers</option>
                  <option value="Accomodation - Sailors">Accomodation - Sailors</option>
                  <option value="Accomodation - Woman Sailors">Accomodation - Woman Sailors</option>
                  <option value="Accomodation - Civil Staff">Accomodation - Civil Staff</option>
                  <option value="Hotel / Holiday Bungalow">Hotel / Holiday Bungalow</option>
                  <option value="Industrial / Workshop">Industrial / Workshop</option>
                  <option value="Hospital / Medical">Hospital / Medical</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tank Capacity (L)</label>
                  <input
                    type="number"
                    required
                    value={newCapacity}
                    onChange={e => setNewCapacity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Consuming People</label>
                  <input
                    type="number"
                    required
                    value={newPeopleCount}
                    onChange={e => setNewPeopleCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Calculated Monthly Avg</label>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold text-xs">
                    {computedMonthlyAvg.toLocaleString()} L/mo
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Benefactors (Comma Separated)</label>
                <input
                  type="text"
                  required
                  value={newBenefactors}
                  onChange={e => setNewBenefactors(e.target.value)}
                  placeholder="Officers Mess Crew, Wardroom Staff"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-slate-400 mb-1">POC Name & Rank</label>
                  <input
                    type="text"
                    required
                    value={newPocName}
                    onChange={e => setNewPocName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">POC Phone</label>
                  <input
                    type="text"
                    required
                    value={newPocPhone}
                    onChange={e => setNewPocPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono"
                  />
                </div>
              </div>

              {/* PIC 2 CORRECTION: LATITUDE AND LONGITUDE FIELDS HAVE BEEN REMOVED! */}

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-black hover:bg-cyan-400"
                >
                  Save & Create Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
