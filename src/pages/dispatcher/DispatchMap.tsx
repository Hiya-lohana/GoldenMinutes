import React, { useState } from 'react';
import { useEMS } from '../../context/EMSContext';
import { MapCanvas } from '../../components/common/MapCanvas';
import { VoiceHandoverModal } from '../../components/common/VoiceHandoverModal';

export const DispatchMap: React.FC = () => {
  const { isRoadblockActive, roadblockState, simulateRoadblock, resetRoadblock, emergencies, ambulances, hospitals } = useEMS();
  const [activeTab, setActiveTab] = useState<'map' | 'instructions' | 'telemetry'>('map');
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);

  const emergency = emergencies.find((e) => e.id === 'GM-2048') || emergencies[0];
  const ambulance = ambulances.find((a) => a.id === 'MEDIC-04') || ambulances[0];
  const destination = hospitals.find((h) => h.id === (emergency.assignedHospitalId || 'st-jude')) || hospitals[0];

  return (
    <main className="max-w-[1440px] mx-auto p-4 md:p-8 flex flex-col gap-6 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Google Maps Navigation & Live Tracking</h1>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live GPS Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time ambulance turn-by-turn guidance, Opticom traffic pre-emption, and hospital bay coordination.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsHandoverModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
            title="Dictate verbal handover for hospital reception using voice-to-text & Gemini AI"
          >
            <span className="material-symbols-outlined text-[18px] text-amber-300">mic</span>
            <span>Dictate Handover (Gemini)</span>
          </button>

          {!isRoadblockActive ? (
            <button
              onClick={simulateRoadblock}
              className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px] text-rose-600">alt_route</span>
              <span>Simulate Road Obstruction</span>
            </button>
          ) : (
            <button
              onClick={resetRoadblock}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm shadow-emerald-500/20"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              <span>Restore Primary Corridor</span>
            </button>
          )}
        </div>
      </div>

      {/* Roadblock Status Banner */}
      {isRoadblockActive && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
            <div>
              <p className="font-bold text-sm text-rose-900">
                {roadblockState === 'detecting'
                  ? 'DETOUR DETECTED: Dadar TT Flyover Traffic Blockage'
                  : 'REROUTED VIA EASTERN FREEWAY (P. D’Mello Corridor Bypass)'}
              </p>
              <p className="text-xs text-rose-700 mt-0.5">
                Navigation updated driver instructions. Mumbai Traffic Police Opticom signal clearance shifted to Eastern Freeway.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-rose-800 bg-rose-100 px-3 py-1 rounded-full self-start sm:self-auto border border-rose-200">
            Reroute Active • ETA 8 min
          </span>
        </div>
      )}

      {/* Main Google Maps Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Large Google Maps Viewport (8 or 12 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <MapCanvas heightClass="h-[620px]" showControls={true} initialMode="driver" />
        </div>

        {/* Right Rail: Google Maps Turn-by-Turn Instruction Card (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Driver Turn-by-Turn Step Sheet (Classic Google Maps Directions Sheet) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[22px]">navigation</span>
                <h3 className="font-bold text-sm text-slate-900">Driver Turn-by-Turn Steps</h3>
              </div>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Medic 04 Active
              </span>
            </div>

            {/* Turn-by-Turn Step List */}
            <div className="flex flex-col gap-3 text-xs">
              {/* Step 1 */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold">
                  <span className="material-symbols-outlined text-[18px]">turn_right</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950">In 250 m</span>
                    <span className="text-[10px] text-emerald-700 font-bold uppercase">Current Step</span>
                  </div>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {isRoadblockActive ? 'Turn right onto Eastern Freeway (Wadala Bypass)' : 'Turn right onto Dr. Ambedkar Road (Central Arterial)'}
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-1">
                    Use right 2 lanes • Mumbai Traffic Police Opticom green corridor locked
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 font-bold">
                  <span className="material-symbols-outlined text-[18px]">straight</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">In 1.4 km</span>
                    <span className="text-[10px] text-slate-400">Step 2</span>
                  </div>
                  <p className="text-slate-700 font-medium mt-0.5">
                    Continue straight through Dadar TT & Hindmata Green Corridors
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Target speed: 55 km/h • 3 junctions locked green</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 font-bold">
                  <span className="material-symbols-outlined text-[18px]">turn_left</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">In 400 m</span>
                    <span className="text-[10px] text-slate-400">Step 3</span>
                  </div>
                  <p className="text-slate-700 font-medium mt-0.5">
                    Turn left onto Acharya Donde Marg toward KEM Emergency Resus Bay 2
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Pre-cleared direct ambulance roll-in</p>
                </div>
              </div>

              {/* Step 4: Arrival */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/60 border border-blue-200">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold">
                  <span className="material-symbols-outlined text-[18px]">local_hospital</span>
                </div>
                <div className="flex-1">
                  <span className="font-bold text-blue-900 block">Arrival Destination</span>
                  <p className="text-slate-800 font-semibold mt-0.5">{destination.name}</p>
                  <span className="text-[11px] text-blue-700 font-bold">
                    Cath Lab Bay 02 Reserved • Interventional Team On-Call
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Telemetry & Emergency Dashboard Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Ambulance Telemetry</h3>
              <span className="font-mono text-emerald-600 font-bold">{ambulance.callSign}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">VEHICLE SPEED</span>
                <span className="text-lg font-extrabold text-slate-900 tabular-nums">
                  {Math.round(ambulance.speedMph * 1.6)} km/h
                </span>
                <span className="text-[10px] text-rose-600 font-bold block mt-0.5">Code Red (Priority 1)</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">REMAINING DISTANCE</span>
                <span className="text-lg font-extrabold text-blue-600 tabular-nums">
                  {(ambulance.distanceMiles * 1.6).toFixed(1)} km
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                  ETA {ambulance.etaMinutes} mins
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">CREW IN TRANSIT</span>
                <span className="text-xs font-bold text-slate-800 block mt-0.5 truncate">{ambulance.leadParamedic || 'Dr. Rakesh Patil, MBBS'}</span>
                <span className="text-[10px] text-slate-500">EMS Lead Physician</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">OPTICOM SYSTEM</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  CORRIDOR LOCKED
                </span>
                <span className="text-[10px] text-slate-500">Signal Priority Engaged</span>
              </div>
            </div>

            {/* Inbound Voice Dictation Quick Button */}
            <button
              type="button"
              onClick={() => setIsHandoverModalOpen(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">mic</span>
              <span>Dictate In-Transit Patient Handover</span>
            </button>
          </div>
        </div>
      </div>

      <VoiceHandoverModal
        isOpen={isHandoverModalOpen}
        onClose={() => setIsHandoverModalOpen(false)}
        emergencyId={emergency.id}
      />
    </main>
  );
};
