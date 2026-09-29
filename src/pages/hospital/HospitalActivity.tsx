import React from 'react';
import { useEMS } from '../../context/EMSContext';

export const HospitalActivity: React.FC = () => {
  const { activities } = useEMS();
  const hospitalActivities = activities.filter((a) => a.role === 'all' || a.role === 'hospital');

  return (
    <main className="max-w-4xl mx-auto p-6 md:p-8 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Facility Activity Log</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail of bed allocations, triage confirmations, and incoming paramedic clearances.
          </p>
        </div>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Station Feed Active
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col gap-4">
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {hospitalActivities.map((act) => (
            <div key={act.id} className="relative flex items-start gap-4 text-xs group">
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold shadow-xs">
                ✓
              </div>

              <div className="flex-1 bg-slate-50 group-hover:bg-slate-100/70 p-3.5 rounded-xl border border-slate-200/60 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-slate-900 text-xs">{act.title}</span>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                    <span>{act.timestamp}</span>
                    <span>({act.timeAgo})</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{act.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};
