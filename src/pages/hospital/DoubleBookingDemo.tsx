import React from 'react';
import { useEMS } from '../../context/EMSContext';

export const DoubleBookingDemo: React.FC = () => {
  const { doubleBookingState, triggerDoubleBookingDemo, resetDoubleBookingDemo } = useEMS();

  return (
    <main className="max-w-5xl mx-auto p-6 md:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white px-6 py-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Double-Booking Prevention Protocol</h1>
            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
              Concurrency Test Suite
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Demonstrating millisecond-level atomic resource locking to prevent two ambulances from reserving the same hospital bed.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!doubleBookingState.active ? (
            <button
              onClick={triggerDoubleBookingDemo}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              <span>Run Concurrency Simulation</span>
            </button>
          ) : (
            <button
              onClick={resetDoubleBookingDemo}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Reset Simulation
            </button>
          )}
        </div>
      </div>

      {/* Target Resource Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[26px]">hotel</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">TARGET CONTENTION ASSET</span>
            <h2 className="text-base font-bold text-slate-900">Mercy General • ICU Bed #14 (Sole Available ICU Slot)</h2>
            <span className="text-xs text-slate-500">Atomic Lock Mechanism: Redis / Distributed CAD Mutex</span>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border ${
            doubleBookingState.step === 'ambA_reserved' || doubleBookingState.step === 'ambB_conflict'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          {doubleBookingState.step === 'ambA_reserved' || doubleBookingState.step === 'ambB_conflict'
            ? 'LOCKED (1/1 HELD)'
            : 'AVAILABLE (1 OPEN)'}
        </span>
      </div>

      {/* Dual Ambulances Split Demonstration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AMBULANCE A (Medic 04) */}
        <div
          className={`bg-white rounded-2xl p-6 border-2 transition-all flex flex-col gap-4 shadow-sm ${
            doubleBookingState.step === 'ambA_reserved' || doubleBookingState.step === 'ambB_conflict'
              ? 'border-emerald-500 bg-emerald-50/20'
              : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                A
              </span>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Ambulance A (Medic 04)</h3>
                <span className="text-[11px] text-slate-500">Acute STEMI • Priority 1</span>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-blue-700">T-minus 0.00s</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
            <span className="text-slate-400 block text-[10px]">REQUESTING RESOURCE:</span>
            <span className="font-bold text-slate-800">ICU Bed #14 (Mercy General)</span>
          </div>

          <div className="min-h-[90px] flex items-center justify-center">
            {doubleBookingState.step === 'idle' && (
              <span className="text-xs text-slate-400 italic">Ready to request</span>
            )}
            {doubleBookingState.step === 'ambA_requested' && (
              <div className="flex items-center gap-2 text-blue-600 text-xs font-bold">
                <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                <span>Transmitting lock packet...</span>
              </div>
            )}
            {(doubleBookingState.step === 'ambA_reserved' ||
              doubleBookingState.step === 'ambB_attempting' ||
              doubleBookingState.step === 'ambB_conflict') && (
              <div className="w-full p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col items-center text-center">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-sm">
                  <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
                  <span>RESOURCE RESERVED ✓</span>
                </div>
                <p className="text-[11px] text-emerald-700 mt-1">
                  ICU Bed #14 held exclusively for Medic 04. Hold expires in 60s.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* AMBULANCE B (Medic 12) */}
        <div
          className={`bg-white rounded-2xl p-6 border-2 transition-all flex flex-col gap-4 shadow-sm ${
            doubleBookingState.step === 'ambB_conflict'
              ? 'border-rose-400 bg-rose-50/30'
              : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                B
              </span>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Ambulance B (Medic 12)</h3>
                <span className="text-[11px] text-slate-500">MVA Trauma • Priority 2</span>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-amber-700">+0.42s Delay</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
            <span className="text-slate-400 block text-[10px]">REQUESTING RESOURCE:</span>
            <span className="font-bold text-slate-800">ICU Bed #14 (Mercy General)</span>
          </div>

          <div className="min-h-[90px] flex items-center justify-center">
            {doubleBookingState.step === 'idle' && (
              <span className="text-xs text-slate-400 italic">Standby behind Ambulance A</span>
            )}
            {doubleBookingState.step === 'ambA_requested' && (
              <span className="text-xs text-slate-400">Queueing lock verification...</span>
            )}
            {doubleBookingState.step === 'ambA_reserved' && (
              <span className="text-xs text-amber-700 font-semibold animate-pulse">
                Initiating reservation request for same bed...
              </span>
            )}
            {doubleBookingState.step === 'ambB_attempting' && (
              <div className="flex items-center gap-2 text-amber-600 text-xs font-bold">
                <span className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></span>
                <span>Checking bed lock mutex...</span>
              </div>
            )}
            {(doubleBookingState.step === 'ambB_conflict' || doubleBookingState.step === 'ambB_rerouted') && (
              <div className="w-full p-4 rounded-xl bg-rose-50 border border-rose-200 flex flex-col items-center text-center">
                <div className="flex items-center gap-1.5 text-rose-800 font-bold text-sm">
                  <span className="material-symbols-outlined text-[20px] text-rose-600">block</span>
                  <span>RESOURCE LOCK PREVENTED COLLISION</span>
                </div>
                <p className="text-[11px] text-rose-700 mt-1 font-medium leading-relaxed">
                  "Resource already reserved by another emergency (GM-2048 / Medic 04)."
                </p>
                <div className={`mt-2 pt-2 border-t w-full text-[11px] font-bold flex items-center justify-center gap-1.5 ${
                  doubleBookingState.step === 'ambB_rerouted'
                    ? 'border-emerald-200 text-emerald-800 bg-emerald-100/60 p-2 rounded-lg'
                    : 'border-rose-200/80 text-blue-700'
                }`}>
                  <span className="material-symbols-outlined text-[16px]">alt_route</span>
                  <span>{doubleBookingState.step === 'ambB_rerouted' ? '✓ Auto-Rerouted to St. Jude Bed #02 (ETA 6m, 100% capacity match)' : 'Auto-Redirecting to St. Jude Trauma Bay 02...'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Engineering Architecture Callout */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-xs text-slate-600 leading-relaxed flex flex-col gap-2">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600 text-[18px]">verified</span>
          <span>Zero-Collision Guarantees</span>
        </h4>
        <p>
          Traditional dispatch methods rely on verbal radio confirmations, frequently resulting in two paramedics arriving with critical patients at the same occupied bed. GoldenMinutes establishes distributed optimistic locks with automated lease expiry (60 seconds). Once Ambulance A requests the bed, the resource is immediately locked in memory. When Ambulance B attempts to acquire the lease 420ms later, the atomic check fails and GoldenMinutes instantly calculates the next best facility.
        </p>
      </div>
    </main>
  );
};
