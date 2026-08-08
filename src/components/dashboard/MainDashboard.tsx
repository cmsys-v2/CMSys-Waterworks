import React from 'react';
import { useData } from '../../context/DataContext';
import {
  Droplet,
  Truck,
  Users,
  AlertTriangle,
  ArrowUpRight,
  TrendingDown,
  Clock,
  Layers,
  Filter,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const MainDashboard: React.FC = () => {
  const { allLocations, roLocations, standardLocations, bowserDuties, loadingLogs, priorityLocations, setSelectedLocation } = useData();

  // Aggregate Metrics
  const totalRoCapacity = roLocations.reduce((acc, loc) => acc + loc.tankCapacity, 0);
  const totalRoCurrent = roLocations.reduce((acc, loc) => acc + loc.currentLevel, 0);
  const totalStdCapacity = standardLocations.reduce((acc, loc) => acc + loc.tankCapacity, 0);
  const totalStdCurrent = standardLocations.reduce((acc, loc) => acc + loc.currentLevel, 0);

  const totalWaterReceivedToday = loadingLogs.reduce((acc, log) => acc + log.volumeLoaded, 0);
  const totalRoReceived = loadingLogs.filter(l => l.waterType === 'RO Water').reduce((acc, l) => acc + l.volumeLoaded, 0);
  const totalStdReceived = loadingLogs.filter(l => l.waterType === 'Normal Water' || l.waterType === 'Well Water').reduce((acc, l) => acc + l.volumeLoaded, 0);

  const totalPopulationServed = allLocations.reduce((acc, loc) => acc + loc.consumingPeopleCount, 0);
  const activeBowsersCount = bowserDuties.filter(d => d.status === 'Active').length;

  // Chart Data Preparation: Population Served by Location
  const populationData = allLocations.map(loc => ({
    name: loc.name.replace(' & Tank', '').replace(' Station', '').replace(' Supply', ''),
    people: loc.consumingPeopleCount,
    category: loc.category
  }));

  // Chart Data Preparation: Receiving & Capacity Comparison
  const locationComparisonData = allLocations.map(loc => {
    const fillPercentage = Math.round((loc.currentLevel / loc.tankCapacity) * 100);
    return {
      name: loc.name.split(' ')[0] + ' ' + (loc.name.split(' ')[1] || ''),
      fullName: loc.name,
      currentLevel: loc.currentLevel,
      tankCapacity: loc.tankCapacity,
      fillPercentage,
      category: loc.category,
      people: loc.consumingPeopleCount
    };
  });

  // Consumption Pattern Trends (Intake vs Projected Burn Rate over 7 Days)
  const consumptionTrends = [
    { day: 'Mon', roReceived: 18000, stdReceived: 32000, roBurn: 17500, stdBurn: 30000 },
    { day: 'Tue', roReceived: 22000, stdReceived: 28000, roBurn: 20000, stdBurn: 29000 },
    { day: 'Wed', roReceived: 15000, stdReceived: 35000, roBurn: 18000, stdBurn: 33000 },
    { day: 'Thu', roReceived: 25000, stdReceived: 40000, roBurn: 22000, stdBurn: 38000 },
    { day: 'Fri', roReceived: 20000, stdReceived: 30000, roBurn: 21000, stdBurn: 31000 },
    { day: 'Sat', roReceived: 28000, stdReceived: 45000, roBurn: 24000, stdBurn: 42000 },
    { day: 'Sun', roReceived: totalRoReceived || 20000, stdReceived: totalStdReceived || 35000, roBurn: 19000, stdBurn: 34000 },
  ];

  // Pie chart water distribution split
  const waterSplitData = [
    { name: 'RO Water (Pure)', value: totalRoCurrent, color: '#06b6d4' },
    { name: 'Standard Water', value: totalStdCurrent, color: '#3b82f6' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner & System Status */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="bg-cyan-500/20 text-cyan-400 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full border border-cyan-400/30">
                Main Dashboard & Analytics
              </span>
              <span className="text-xs text-slate-400">CCED (E) Water Command Hub</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Dockyard Water Distribution & Consumption Insight
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Real-time monitoring of RO and Standard water points, tank storage capacities, loading logs, and population consumption burn rates across Naval Dockyard premises.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Total Population Served</div>
              <div className="text-lg font-black text-cyan-400 flex items-center justify-end gap-1">
                <Users className="h-4 w-4 text-cyan-400" />
                {totalPopulationServed.toLocaleString()} Officers & Sailors
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Water Received Today */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Water Received Today</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Droplet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">
              {totalWaterReceivedToday.toLocaleString()} <span className="text-sm font-semibold text-slate-400">Liters</span>
            </div>
            <div className="flex items-center space-x-2 mt-1 text-xs">
              <span className="text-emerald-400 font-bold flex items-center">
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" /> RO: {totalRoReceived.toLocaleString()}L
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-blue-400 font-bold">Std: {totalStdReceived.toLocaleString()}L</span>
            </div>
          </div>
        </div>

        {/* Card 2: RO Water Total Stock */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">RO Water Stock</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Filter className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-cyan-400">
              {totalRoCurrent.toLocaleString()} <span className="text-sm font-semibold text-slate-400">/ {totalRoCapacity.toLocaleString()} L</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 mt-2 border border-slate-800 overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.round((totalRoCurrent / totalRoCapacity) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Standard Water Total Stock */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Standard Water Stock</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-blue-400">
              {totalStdCurrent.toLocaleString()} <span className="text-sm font-semibold text-slate-400">/ {totalStdCapacity.toLocaleString()} L</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 mt-2 border border-slate-800 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.round((totalStdCurrent / totalStdCapacity) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Active Bowsers & Priority Locations */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Bowsers & Alerts</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Truck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-black text-white">{activeBowsersCount}</div>
                <div className="text-xs text-slate-400 font-semibold">Active Bowser Duties</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-rose-400">{priorityLocations.length}</div>
                <div className="text-xs text-rose-400 font-bold">Priority Locations</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-cyan-400" />
                Consumption Pattern & Daily Water Intake (Liters)
              </h3>
              <p className="text-xs text-slate-400">
                Calculated intake volume vs burn rate across RO & Standard locations over time
              </p>
            </div>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-950/80 px-3 py-1 rounded-lg border border-cyan-800/60">
              Real-Time Telemetry
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={consumptionTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="roColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="stdColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                />
                <Legend />
                <Area type="monotone" dataKey="roReceived" name="RO Water Intake" stroke="#06b6d4" fillOpacity={1} fill="url(#roColor)" />
                <Area type="monotone" dataKey="stdReceived" name="Standard Water Intake" stroke="#3b82f6" fillOpacity={1} fill="url(#stdColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Droplet className="h-5 w-5 text-cyan-400" />
              Water Stock Distribution
            </h3>
            <p className="text-xs text-slate-400">Total available water by purity type</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={waterSplitData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {waterSplitData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">RO Stock Level</span>
              <span className="text-cyan-400 font-bold">{Math.round((totalRoCurrent / totalRoCapacity) * 100)}% Capacity</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">Standard Stock Level</span>
              <span className="text-blue-400 font-bold">{Math.round((totalStdCurrent / totalStdCapacity) * 100)}% Capacity</span>
            </div>
          </div>
        </div>
      </div>

      {/* Population Served & Location Tank Status Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-400" />
                Consuming Population by Location
              </h3>
              <p className="text-xs text-slate-400">Headcount breakdown of officers, sailors, and engineers</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={populationData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                />
                <Bar dataKey="people" name="Consuming People" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-cyan-400" />
                Location Log & Storage Insight
              </h3>
              <p className="text-xs text-slate-400">Click any location for full interactive pop-up modal</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Location & Base</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Stock Level</th>
                  <th className="py-2.5 px-3 text-right">Population</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {locationComparisonData.map(loc => {
                  const targetObj = allLocations.find(l => l.name === loc.fullName);
                  return (
                    <tr
                      key={loc.fullName}
                      onClick={() => targetObj && setSelectedLocation(targetObj)}
                      className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-3">
                        <div className="font-bold text-white line-clamp-1">{loc.fullName}</div>
                        <div className="text-[10px] text-slate-400">{loc.name}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            loc.category === 'RO'
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                              : 'bg-blue-950 text-blue-300 border border-blue-800/60'
                          }`}
                        >
                          {loc.category}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-slate-950 h-2 rounded-full border border-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                loc.fillPercentage < 30
                                  ? 'bg-rose-500'
                                  : loc.fillPercentage < 60
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${loc.fillPercentage}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-300">{loc.fillPercentage}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-200">
                        {loc.people}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
