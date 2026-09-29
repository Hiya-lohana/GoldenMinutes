import React from 'react';
import { useEMS } from '../../context/EMSContext';
import { MapCanvas } from '../../components/common/MapCanvas';
import { AmbulanceStatus } from '../../types';

export const AmbulanceDetails: React.FC<{ id?: string }> = ({ id = 'MEDIC-04' }) => {
  const { ambulances, updateAmbulanceStatus, navigate } = useEMS();
  const ambulance = ambulances.find((a) => a.id === id) || ambulances[0];

  const statusOptions: AmbulanceStatus[] = ['Available', 'Dispatched', 'En Route', 'At Hospital', 'Offline'];

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white px-6 py-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dispatcher/ambulances')}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            title="Back to Fleet"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md border border-blue-200">
                {ambulance.id}
              </span>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                {ambulance.type}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              {ambulance.name} • {ambulance.callSign}
            </h1>
          </div>
        </div>

        {/* Simulated State Change Dropdown */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 p-2 rounded-xl text-xs">
          <span className="text-slate-500 font-semibold">Simulated State:</span>
          <select
            value={ambulance.status}
            onChange={(e) => updateAmbulanceStatus(ambulance.id, e.target.value as AmbulanceStatus)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-blue-700 focus:outline-none cursor-pointer"
          >
            {statusOptions.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid: Details & Map Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Telemetry & Crew (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              Live Vehicle Telemetry
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[10px]">CURRENT SPEED</span>
                <span className="text-lg font-bold text-slate-900 tabular-nums">{ambulance.speedMph} mph</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[10px]">HEADING</span>
                <span className="text-lg font-bold text-slate-900 tabular-nums">{ambulance.heading}° NE</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[10px]">ESTIMATED TRANSIT</span>
                <span className="text-lg font-bold text-blue-700 tabular-nums">{ambulance.etaMinutes} mins</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[10px]">RADIO LINK</span>
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Encrypted TLS
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-slate-400 block text-[10px]">LAST GPS LOCATION</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">{ambulance.location}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              Assigned Crew Members
            </h3>
            <div className="space-y-2">
              {ambulance.crew.map((member, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl">
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">badge</span>
                  <span className="font-bold text-slate-800">{member}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Tactical Route Preview (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Unit Navigation Corridor
            </h3>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Opticom Signals Cleared
            </span>
          </div>
          <MapCanvas heightClass="h-[420px]" />
        </div>
      </div>
    </main>
  );
};
