import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  Users,
  Clock,
  ShieldCheck,
  UserCheck,
  Edit2,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export interface WatchShift {
  shift: 'MORNING_WATCH' | 'EVENING_WATCH' | 'NIGHT_WATCH';
  shiftEngineerRating: string;
  pumpOperator: string;
  labAnalyst: string;
}

const SHIFT_METADATA = {
  MORNING_WATCH: {
    label: 'Morning Watch',
    hours: '0600 - 1400 hrs',
    tag: 'Peak Pumping & Clarification',
    badge: 'bg-amber-950/80 text-amber-300 border-amber-700/60'
  },
  EVENING_WATCH: {
    label: 'Evening Watch',
    hours: '1400 - 2200 hrs',
    tag: 'Distribution & Elevated Tower Balancing',
    badge: 'bg-blue-950/80 text-blue-300 border-blue-700/60'
  },
  NIGHT_WATCH: {
    label: 'Night Watch',
    hours: '2200 - 0600 hrs',
    tag: 'Sand Filter Backwash & Basin Recharging',
    badge: 'bg-purple-950/80 text-purple-300 border-purple-700/60'
  }
};

export const WTPDutyRoster: React.FC = () => {
  const { wtpReports } = useData();

  const latestRoster = wtpReports[0]?.dutyRoster || [
    {
      shift: 'MORNING_WATCH',
      shiftEngineerRating: 'CPO (E) K.G. Somapala',
      pumpOperator: 'LS (ME) P. Kumara',
      labAnalyst: 'PO (Lab) S. Ranasinghe'
    },
    {
      shift: 'EVENING_WATCH',
      shiftEngineerRating: 'PO (E) N. Jayakody',
      pumpOperator: 'AB (ME) T. Wickrama',
      labAnalyst: 'LS (Lab) M. Perera'
    },
    {
      shift: 'NIGHT_WATCH',
      shiftEngineerRating: 'LS (E) C. Bandara',
      pumpOperator: 'AB (ME) G. Alwis',
      labAnalyst: 'LS (Lab) M. Perera'
    }
  ];

  const [roster, setRoster] = useState<WatchShift[]>(latestRoster);
  const [editingShift, setEditingShift] = useState<WatchShift | null>(null);

  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShift) return;

    setRoster(prev =>
      prev.map(s => (s.shift === editingShift.shift ? editingShift : s))
    );
    setEditingShift(null);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-cyan-950 border border-cyan-800/60 text-cyan-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                24/7 Naval Operations Watch
              </span>
              <span className="text-xs text-slate-400">Anandamkulam WTP</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mt-1">
              Duty Watchkeeper & Technical Rating Roster
            </h3>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-2xl text-xs flex items-center gap-2">
          <Clock className="h-4 w-4 text-cyan-400" />
          <span className="text-slate-300 font-semibold">Active Roster Cycle: 3 Shift Rotation</span>
        </div>
      </div>

      {/* Roster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {roster.map(shift => {
          const meta = SHIFT_METADATA[shift.shift];

          return (
            <div
              key={shift.shift}
              className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-3xl p-5 shadow-xl flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-sm font-black text-white block">{meta.label}</span>
                    <span className="text-xs font-mono font-semibold text-cyan-400 flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {meta.hours}
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.badge}`}>
                    ACTIVE WATCH
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 mb-4">{meta.tag}</p>

                {/* Personnel assignments */}
                <div className="space-y-3 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Shift Engineer Rating (OIC)
                    </span>
                    <div className="text-xs font-bold text-slate-200 mt-0.5 flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                      {shift.shiftEngineerRating}
                    </div>
                  </div>

                  <div className="border-t border-slate-800/60 pt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Pump House & Valve Operator
                    </span>
                    <div className="text-xs font-bold text-slate-200 mt-0.5 flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-blue-400" />
                      {shift.pumpOperator}
                    </div>
                  </div>

                  <div className="border-t border-slate-800/60 pt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Water Quality Lab Analyst
                    </span>
                    <div className="text-xs font-bold text-slate-200 mt-0.5 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-emerald-400" />
                      {shift.labAnalyst}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setEditingShift(shift)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Update Ratings</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Shift Modal */}
      {editingShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md w-full space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white">
                Reassign Watch: {SHIFT_METADATA[editingShift.shift].label}
              </h4>
              <button
                onClick={() => setEditingShift(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveShift} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Shift Engineer Rating (Rank & Name)
                </label>
                <input
                  type="text"
                  value={editingShift.shiftEngineerRating}
                  onChange={e =>
                    setEditingShift({
                      ...editingShift,
                      shiftEngineerRating: e.target.value
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Pump House Operator
                </label>
                <input
                  type="text"
                  value={editingShift.pumpOperator}
                  onChange={e =>
                    setEditingShift({
                      ...editingShift,
                      pumpOperator: e.target.value
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Lab Water Analyst
                </label>
                <input
                  type="text"
                  value={editingShift.labAnalyst}
                  onChange={e =>
                    setEditingShift({
                      ...editingShift,
                      labAnalyst: e.target.value
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingShift(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs text-white font-bold shadow"
                >
                  Save Watch Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
