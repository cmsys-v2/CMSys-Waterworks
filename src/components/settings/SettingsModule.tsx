import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { UserRole, WaterLocation, BowserRegistryEntry } from '../../types/waterDistribution';
import {
  Settings,
  Users,
  Database,
  Truck,
  UploadCloud,
  Shield,
  ShieldCheck,
  Eye,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle,
  AlertTriangle,
  FileText,
  Save,
  X,
  Key
} from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const { user, isMasterAdmin, usersList, createUser, updateUserRole, deleteUser } = useAuth();
  const {
    allLocations,
    updateLocation,
    deleteLocation,
    bowserRegistry,
    updateBowserRegistryEntry,
    addBowserRegistryEntry,
    deleteBowser,
    bulkImportLocations,
    bulkImportBowsers
  } = useData();

  const [activeTab, setActiveTab] = useState<'users' | 'locations' | 'bowsers' | 'bulk'>('users');

  // USER CREATION FORM STATE
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Admin');
  const [newPassword, setNewPassword] = useState('pass123');
  const [newBadge, setNewBadge] = useState('NAV-ADM-99');

  // LOCATION EDIT MODAL STATE
  const [editingLoc, setEditingLoc] = useState<WaterLocation | null>(null);

  // BOWSER EDIT MODAL STATE
  const [editingBowser, setEditingBowser] = useState<BowserRegistryEntry | null>(null);

  // ADD BOWSER FORM STATE
  const [isAddBowserOpen, setIsAddBowserOpen] = useState(false);
  const [addSrNo, setAddSrNo] = useState('SR-31');
  const [addVehicleNo, setAddVehicleNo] = useState('NAHA-31');
  const [addPin, setAddPin] = useState('1031');
  const [addCapacity, setAddCapacity] = useState(12000);
  const [addTaName, setAddTaName] = useState('AB Perera');
  const [addMeName, setAddMeName] = useState('PO Fernando');

  // BULK UPLOAD STATE
  const [bulkType, setBulkType] = useState<'locations' | 'bowsers'>('locations');
  const [rawJsonText, setRawJsonText] = useState('');
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState<string | null>(null);

  // SEARCH STATES
  const [locSearch, setLocSearch] = useState('');
  const [bowserSearch, setBowserSearch] = useState('');

  if (!isMasterAdmin) {
    return (
      <div className="glass-panel p-8 rounded-2xl border border-rose-800/80 bg-rose-950/20 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto animate-bounce" />
        <h2 className="text-xl font-black text-white">Master Admin Authorization Required</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          The Master Settings & Database Control Panel is visible and accessible exclusively to Chief Water Engineer (SCE WW).
        </p>
      </div>
    );
  }

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = createUser({
      username: newUsername,
      name: newName,
      role: newRole,
      password: newPassword,
      badgeNumber: newBadge
    });

    if (success) {
      alert(`User "${newUsername}" created with role "${newRole}" successfully!`);
      setNewUsername('');
      setNewName('');
    } else {
      alert(`Username "${newUsername}" already exists! Please use a unique username.`);
    }
  };

  const handleAddBowserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBowserRegistryEntry({
      srNo: addSrNo,
      vehicleNo: addVehicleNo,
      pin: addPin,
      capacity: addCapacity,
      defaultTaName: addTaName,
      defaultMeName: addMeName
    });
    setIsAddBowserOpen(false);
    alert(`New Bowser ${addVehicleNo} registered successfully!`);
  };

  const handleSaveLocEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLoc) {
      updateLocation(editingLoc);
      setEditingLoc(null);
      alert(`Location "${editingLoc.name}" updated successfully!`);
    }
  };

  const handleSaveBowserEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBowser) {
      updateBowserRegistryEntry(editingBowser);
      setEditingBowser(null);
      alert(`Bowser "${editingBowser.vehicleNo}" details updated successfully!`);
    }
  };

  const handleBulkImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBulkSuccessMsg(null);
    try {
      const parsed = JSON.parse(rawJsonText);
      if (!Array.isArray(parsed)) {
        alert('Invalid JSON format! Must be an array of records [ {...}, {...} ].');
        return;
      }

      if (bulkType === 'locations') {
        bulkImportLocations(parsed);
        setBulkSuccessMsg(`Successfully bulk imported ${parsed.length} Water Location records!`);
      } else {
        bulkImportBowsers(parsed);
        setBulkSuccessMsg(`Successfully bulk imported ${parsed.length} Bowser Fleet records!`);
      }
      setRawJsonText('');
    } catch (err) {
      alert('Failed to parse JSON text. Please check JSON syntax formatting.');
    }
  };

  const filteredLocations = allLocations.filter(
    l => l.name.toLowerCase().includes(locSearch.toLowerCase()) || l.base.toLowerCase().includes(locSearch.toLowerCase())
  );

  const filteredBowsers = bowserRegistry.filter(
    b =>
      b.vehicleNo.toLowerCase().includes(bowserSearch.toLowerCase()) ||
      b.srNo.toLowerCase().includes(bowserSearch.toLowerCase()) ||
      b.defaultTaName.toLowerCase().includes(bowserSearch.toLowerCase()) ||
      b.defaultMeName.toLowerCase().includes(bowserSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="bg-amber-500/20 text-amber-300 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Master Admin Only
            </span>
            <span className="text-xs text-slate-400">CCED (E) System Control</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Master Settings & Database Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage System Users (Admins & Viewers), edit or delete locations and bowser fleets, and perform bulk uploads.
          </p>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl text-right">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Logged Master Admin</div>
          <div className="text-xs font-black text-cyan-300">{user?.name} ({user?.username})</div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
            activeTab === 'users'
              ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-950/50'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>User Management</span>
        </button>

        <button
          onClick={() => setActiveTab('locations')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
            activeTab === 'locations'
              ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-950/50'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Database className="h-4 w-4" />
          <span>Locations Master Data</span>
        </button>

        <button
          onClick={() => setActiveTab('bowsers')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
            activeTab === 'bowsers'
              ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-950/50'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Truck className="h-4 w-4" />
          <span>Bowsers & Officers (TA / ME)</span>
        </button>

        <button
          onClick={() => setActiveTab('bulk')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
            activeTab === 'bulk'
              ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-950/50'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <UploadCloud className="h-4 w-4" />
          <span>Bulk Upload</span>
        </button>
      </div>

      {/* TAB 1: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create User Form */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-cyan-400" />
              Create New System User
            </h3>
            <p className="text-xs text-slate-400">
              Create Admin accounts for full access or Viewers for read-only access.
            </p>

            <form onSubmit={handleCreateUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  placeholder="e.g. Officer_Gemunu"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Name & Rank</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Lt Cdr K Perera"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Select User Role</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                >
                  <option value="Admin">Admin (Full Operational Logging Access)</option>
                  <option value="Viewer">Viewer (Read-Only Mode - No Edits)</option>
                  <option value="Master Admin">Master Admin (Full Settings Access)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Official Badge Number</label>
                <input
                  type="text"
                  required
                  value={newBadge}
                  onChange={e => setNewBadge(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-2.5 rounded-xl shadow-lg shadow-cyan-950/40 transition-all mt-2"
              >
                Create User Credentials
              </button>
            </form>
          </div>

          {/* User List Table */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-cyan-400" />
                Active System Users Registry ({usersList.length})
              </h3>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Username & Name</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Badge No</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {usersList.map(u => (
                    <tr key={u.username} className="hover:bg-slate-900/60">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white text-xs">{u.username}</div>
                        <div className="text-[11px] text-slate-400">{u.name}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                            u.role === 'Master Admin'
                              ? 'bg-amber-950 text-amber-300 border-amber-700'
                              : u.role === 'Admin'
                              ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">{u.badgeNumber}</td>
                      <td className="py-3 px-3 text-right">
                        {u.username !== 'SCE WW' ? (
                          <div className="flex items-center justify-end space-x-2">
                            <select
                              value={u.role}
                              onChange={e => updateUserRole(u.username, e.target.value as UserRole)}
                              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-200"
                            >
                              <option value="Admin">Admin</option>
                              <option value="Viewer">Viewer</option>
                              <option value="Master Admin">Master Admin</option>
                            </select>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete user "${u.username}"?`)) {
                                  deleteUser(u.username);
                                }
                              }}
                              className="p-1 rounded bg-rose-950/80 text-rose-300 hover:bg-rose-900 border border-rose-800"
                              title="Delete User"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-bold">Protected Master</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOCATIONS MASTER DATA */}
      {activeTab === 'locations' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Database className="h-5 w-5 text-cyan-400" />
                Master Locations Database Control ({allLocations.length} Locations)
              </h3>
              <p className="text-xs text-slate-400">Edit or permanently remove water locations from the system.</p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={locSearch}
                onChange={e => setLocSearch(e.target.value)}
                placeholder="Search locations..."
                className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Location Name</th>
                  <th className="py-2.5 px-3">Base / Area</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Tank Capacity</th>
                  <th className="py-2.5 px-3">Monthly Avg</th>
                  <th className="py-2.5 px-3">POC Contact</th>
                  <th className="py-2.5 px-3 text-right">Master Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredLocations.map(loc => (
                  <tr key={loc.id} className="hover:bg-slate-900/60">
                    <td className="py-3 px-3 font-bold text-white">{loc.name}</td>
                    <td className="py-3 px-3 text-slate-300">{loc.base}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {loc.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">{loc.tankCapacity.toLocaleString()} L</td>
                    <td className="py-3 px-3 font-mono font-bold text-amber-300">{loc.monthlyAvgConsumption.toLocaleString()} L/mo</td>
                    <td className="py-3 px-3 text-slate-300">{loc.pointOfContact.name} ({loc.pointOfContact.phone})</td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setEditingLoc(loc)}
                          className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 font-bold text-[11px] flex items-center space-x-1"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove location "${loc.name}" permanently from the database?`)) {
                              deleteLocation(loc.id);
                            }
                          }}
                          className="px-2 py-1 rounded bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800 font-bold text-[11px] flex items-center space-x-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BOWSERS & OFFICERS (TA / ME) CONTROL */}
      {activeTab === 'bowsers' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Truck className="h-5 w-5 text-cyan-400" />
                Bowser Fleet & Officer (TA / ME) Master Control ({bowserRegistry.length} Bowsers)
              </h3>
              <p className="text-xs text-slate-400">Edit or remove bowser entries, TA (*Transport Assistant*), and ME (*Engineering Mechanic*).</p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={bowserSearch}
                  onChange={e => setBowserSearch(e.target.value)}
                  placeholder="Search bowser, TA, ME..."
                  className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                onClick={() => setIsAddBowserOpen(true)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>Add Bowser</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">SR No</th>
                  <th className="py-2.5 px-3">Vehicle Naha No</th>
                  <th className="py-2.5 px-3">PIN Code</th>
                  <th className="py-2.5 px-3">Capacity (L)</th>
                  <th className="py-2.5 px-3 font-sans">Transport Asst (TA)</th>
                  <th className="py-2.5 px-3 font-sans">Eng Mechanic (ME)</th>
                  <th className="py-2.5 px-3 text-right font-sans">Master Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredBowsers.map(b => (
                  <tr key={b.vehicleNo} className="hover:bg-slate-900/60">
                    <td className="py-3 px-3 font-bold text-cyan-400">{b.srNo}</td>
                    <td className="py-3 px-3 font-bold text-white">{b.vehicleNo}</td>
                    <td className="py-3 px-3 font-bold text-amber-400">{b.pin}</td>
                    <td className="py-3 px-3 font-bold text-emerald-400">{b.capacity.toLocaleString()} L</td>
                    <td className="py-3 px-3 text-slate-300 font-sans">{b.defaultTaName}</td>
                    <td className="py-3 px-3 text-slate-400 font-sans">{b.defaultMeName}</td>
                    <td className="py-3 px-3 text-right font-sans">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setEditingBowser(b)}
                          className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 font-bold text-[11px] flex items-center space-x-1"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove Bowser "${b.vehicleNo}" permanently from registry?`)) {
                              deleteBowser(b.vehicleNo);
                            }
                          }}
                          className="px-2 py-1 rounded bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800 font-bold text-[11px] flex items-center space-x-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: BULK DATA UPLOAD */}
      {activeTab === 'bulk' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 max-w-3xl">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-cyan-400" />
            Bulk Dataset Upload (JSON / CSV)
          </h3>
          <p className="text-xs text-slate-400">
            Paste raw JSON array text or upload a JSON dataset file to bulk import multiple locations or bowsers into the system in one click.
          </p>

          {bulkSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>{bulkSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleBulkImportSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Select Target Dataset</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 text-slate-200 font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="bulkType"
                    checked={bulkType === 'locations'}
                    onChange={() => setBulkType('locations')}
                    className="accent-cyan-500"
                  />
                  <span>Water Location Records</span>
                </label>
                <label className="flex items-center space-x-2 text-slate-200 font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="bulkType"
                    checked={bulkType === 'bowsers'}
                    onChange={() => setBulkType('bowsers')}
                    className="accent-cyan-500"
                  />
                  <span>Bowser Fleet & Officer Records</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Paste Raw JSON Array Code</label>
              <textarea
                rows={10}
                required
                value={rawJsonText}
                onChange={e => setRawJsonText(e.target.value)}
                placeholder={`[\n  {\n    "name": "New Dockyard Station",\n    "base": "SLNS Gemunu",\n    "category": "RO",\n    "tankCapacity": 25000,\n    "monthlyAvgConsumption": 120000,\n    "consumingPeopleCount": 450,\n    "benefactors": ["Sailors Mess"],\n    "pointOfContact": { "name": "Lt Cdr Silva", "rank": "Lt Cdr", "phone": "0779998877", "department": "Ops" }\n  }\n]`}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-3 rounded-xl shadow-lg shadow-cyan-950/40 transition-all text-xs flex items-center justify-center space-x-2"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Process & Bulk Import Dataset</span>
            </button>
          </form>
        </div>
      )}

      {/* EDIT LOCATION MODAL */}
      {editingLoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="font-extrabold text-white text-sm">Edit Master Location: {editingLoc.name}</h4>
              <button onClick={() => setEditingLoc(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveLocEdits} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={editingLoc.name}
                  onChange={e => setEditingLoc({ ...editingLoc, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Base Location</label>
                <input
                  type="text"
                  required
                  value={editingLoc.base}
                  onChange={e => setEditingLoc({ ...editingLoc, base: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Capacity (L)</label>
                  <input
                    type="number"
                    required
                    value={editingLoc.tankCapacity}
                    onChange={e => setEditingLoc({ ...editingLoc, tankCapacity: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Monthly Avg (L)</label>
                  <input
                    type="number"
                    required
                    value={editingLoc.monthlyAvgConsumption}
                    onChange={e => setEditingLoc({ ...editingLoc, monthlyAvgConsumption: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingLoc(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-black">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BOWSER MODAL */}
      {editingBowser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="font-extrabold text-white text-sm">Edit Bowser Details: {editingBowser.vehicleNo}</h4>
              <button onClick={() => setEditingBowser(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveBowserEdits} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Vehicle Naha No</label>
                  <input
                    type="text"
                    required
                    value={editingBowser.vehicleNo}
                    onChange={e => setEditingBowser({ ...editingBowser, vehicleNo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">PIN Code</label>
                  <input
                    type="text"
                    required
                    value={editingBowser.pin}
                    onChange={e => setEditingBowser({ ...editingBowser, pin: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Capacity (Liters)</label>
                <input
                  type="number"
                  required
                  value={editingBowser.capacity}
                  onChange={e => setEditingBowser({ ...editingBowser, capacity: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Transport Asst (TA) Name</label>
                  <input
                    type="text"
                    required
                    value={editingBowser.defaultTaName}
                    onChange={e => setEditingBowser({ ...editingBowser, defaultTaName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Eng Mechanic (ME) Name</label>
                  <input
                    type="text"
                    required
                    value={editingBowser.defaultMeName}
                    onChange={e => setEditingBowser({ ...editingBowser, defaultMeName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBowser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-black">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD BOWSER MODAL */}
      {isAddBowserOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="font-extrabold text-white text-sm">Add New Bowser Vehicle Entry</h4>
              <button onClick={() => setIsAddBowserOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddBowserSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">SR Serial No</label>
                  <input
                    type="text"
                    required
                    value={addSrNo}
                    onChange={e => setAddSrNo(e.target.value)}
                    placeholder="SR-31"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Vehicle Naha No</label>
                  <input
                    type="text"
                    required
                    value={addVehicleNo}
                    onChange={e => setAddVehicleNo(e.target.value)}
                    placeholder="NAHA-31"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Security PIN Code</label>
                  <input
                    type="text"
                    required
                    value={addPin}
                    onChange={e => setAddPin(e.target.value)}
                    placeholder="1031"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Capacity (Liters)</label>
                  <input
                    type="number"
                    required
                    value={addCapacity}
                    onChange={e => setAddCapacity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Transport Asst (TA) Name</label>
                  <input
                    type="text"
                    required
                    value={addTaName}
                    onChange={e => setAddTaName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Eng Mechanic (ME) Name</label>
                  <input
                    type="text"
                    required
                    value={addMeName}
                    onChange={e => setAddMeName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBowserOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-black">
                  Register Bowser
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
