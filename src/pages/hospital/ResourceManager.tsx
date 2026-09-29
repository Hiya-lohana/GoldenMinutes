import React from 'react';
import { useEMS } from '../../context/EMSContext';

export const ResourceManager: React.FC = () => {
  const { hospitals, updateResourceQuantity } = useEMS();
  const hospital = hospitals.find((h) => h.id === 'mercy-general') || hospitals[0];

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white px-6 py-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Facility Resource Manager</h1>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Live Station Inventory
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time control over critical beds, negative pressure rooms, and resuscitation equipment.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Station MG-TR-01 • Mercy General</span>
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hospital.resources.map((res) => (
          <div
            key={res.id}
            className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between gap-5 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="font-extrabold text-base text-slate-900">{res.name}</span>
                <span className="text-[11px] text-slate-400 block">{res.category}</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                {res.available} Available
              </span>
            </div>

            {/* Counts Matrix */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <span className="text-emerald-700 block text-[10px] font-bold">OPEN</span>
                <span className="text-xl font-extrabold text-emerald-800 tabular-nums">{res.available}</span>
              </div>
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                <span className="text-amber-700 block text-[10px] font-bold">HELD</span>
                <span className="text-xl font-extrabold text-amber-800 tabular-nums">{res.reserved}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] font-bold">OCCUPIED</span>
                <span className="text-xl font-extrabold text-slate-800 tabular-nums">{res.occupied}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-bold">MAINT</span>
                <span className="text-xl font-extrabold text-slate-600 tabular-nums">{res.maintenance}</span>
              </div>
            </div>

            {/* Live Utilization Meter */}
            {(() => {
              const total = res.available + res.reserved + res.occupied + res.maintenance;
              const utilRate = total > 0 ? Math.round(((res.occupied + res.reserved) / total) * 100) : 0;
              return (
                <div className="flex flex-col gap-1.5 py-1">
                  <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                    <span>Active Commitment Rate</span>
                    <span className={utilRate > 85 ? 'text-rose-600 font-bold' : utilRate > 65 ? 'text-amber-600 font-bold' : 'text-slate-700 font-bold'}>
                      {utilRate}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${utilRate > 85 ? 'bg-rose-500' : utilRate > 65 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${utilRate}%` }}
                    ></div>
                  </div>
                </div>
              );
            })()}

            {/* Operational Modifiers */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <span className="font-bold text-slate-700 text-[11px]">Adjust Available:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateResourceQuantity(hospital.id, res.id, 'available', -1)}
                  disabled={res.available <= 0}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                  title="Decrease available count"
                >
                  <span className="material-symbols-outlined text-[16px]">remove</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateResourceQuantity(hospital.id, res.id, 'available', 1)}
                  className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold flex items-center justify-center cursor-pointer"
                  title="Increase available count"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (res.available > 0) {
                      updateResourceQuantity(hospital.id, res.id, 'available', -1);
                      updateResourceQuantity(hospital.id, res.id, 'maintenance', 1);
                    }
                  }}
                  disabled={res.available <= 0}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  Mark Maintenance
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};
