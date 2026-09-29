import React from 'react';
import { useEMS } from '../../context/EMSContext';
import { SurgeAlertCard } from '../../components/hospital/SurgeAlertCard';

export const HospitalOverview: React.FC = () => {
  const {
    emergencies,
    navigate,
    audioTriageLive,
    toggleAudioTriage,
    setSelectedEmergencyId
  } = useEMS();

  const handleInspect = (id: string) => {
    setSelectedEmergencyId(id);
    navigate(`/hospital/requests/${id}`);
  };

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-8 flex flex-col gap-6">
      {/* Hospital Header Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
            <span className="material-symbols-outlined text-[30px]">local_hospital</span>
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">KEM Hospital & Seth GS Medical College</h1>
              <span className="bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Level 1 Apex Trauma
              </span>
              <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                Cardiac & Stroke Hub (Parel)
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <span className="font-medium">STATION ID: KEM-MUM-01</span>
              <span>•</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> MUMBAI POLICE GREEN CORRIDOR SYNCED
              </span>
            </div>
          </div>
        </div>

        {/* Controls: ED Occupancy & Audio Triage */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* ED Resus Occupancy Progress Bar */}
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/70 px-4 py-2.5 rounded-xl">
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-3 text-xs mb-1">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  ED Resus Occupancy
                </span>
                <span className="font-bold text-slate-900">
                  84% <span className="text-slate-400 font-normal">(42/50 Beds)</span>
                </span>
              </div>
              <div className="w-36 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: '84%' }}></div>
              </div>
            </div>
          </div>

          {/* Audio Triage Button */}
          <button
            type="button"
            onClick={toggleAudioTriage}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-xs transition-colors cursor-pointer ${
              audioTriageLive
                ? 'bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100'
                : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {audioTriageLive ? 'volume_up' : 'volume_off'}
            </span>
            <span>{audioTriageLive ? 'Audio Triage: Live' : 'Audio Triage: Muted'}</span>
          </button>
        </div>
      </div>

      {/* 3 Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Inbound Transit Today</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">12</span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">+3 last hour</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Normal operating tempo</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <span className="material-symbols-outlined text-[24px]">ambulance</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Trauma Acceptance Rate</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-emerald-600 tabular-nums">94.2%</span>
              <span className="text-xs font-medium text-slate-500">Benchmark 90%</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">+2.4% over monthly target</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <span className="material-symbols-outlined text-[24px]">check_circle</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Staff Response Latency</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">24s</span>
              <span className="text-xs font-medium text-slate-500">Target &lt;45s</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Acceptance latency within golden window</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700">
            <span className="material-symbols-outlined text-[24px]">timer</span>
          </div>
        </div>
      </div>

      {/* Machine Learning Surge Alert & 4-Hour Inflow Visualization */}
      <SurgeAlertCard />

      {/* Priority Inbound Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Active Inbound Transit Queue</h2>
          <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">3 Vehicles</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="font-medium">SORT: SEVERITY DESCENDING</span>
          <span>•</span>
          <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            TELEMETRY STREAMING
          </span>
        </div>
      </div>

      {/* Compact Overview Inbound Items */}
      <div className="flex flex-col gap-4">
        {/* Item 1 */}
        <div className="bg-white rounded-2xl border-l-4 border-l-rose-500 border border-slate-200/80 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                CRITICAL • CODE RED
              </span>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                ETA 6 MINS (0.8 MI)
              </span>
              <span className="text-xs font-semibold text-slate-500">Medic 4 (ALS-1)</span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              Acute STEMI • 58M Crushing Chest Pain, ST Elevation V1-V4
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Required: Cath Lab 24/7 Priority • Cath Lab 02 Ready</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleInspect('GM-2048')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Review & Accept
            </button>
            <button
              onClick={() => navigate('/hospital/requests')}
              className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Full Queue
            </button>
          </div>
        </div>

        {/* Item 2 */}
        <div className="bg-white rounded-2xl border-l-4 border-l-amber-500 border border-slate-200/80 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                URGENT • TRAUMA LEVEL 2
              </span>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                ETA 14 MINS
              </span>
              <span className="text-xs font-semibold text-slate-500">Medic 12 (Ambulance 12)</span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              Multi-Vehicle Collision • Blunt Abdominal Injury & Pelvic Pain
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Required: Trauma Bay 01 (Level 1 Resus) • Ready</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleInspect('GM-2047')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Review & Accept
            </button>
          </div>
        </div>
      </div>

      {/* Approaching Inbound Corridors Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[19px]">near_me</span>
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Approaching Vehicle Inbound Corridors
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              GEO-RADIUS: 5.0 MILES
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                  M4
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">Medic 4 (Ambulance 04)</span>
                    <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Corridor B (Express)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">Approaching via Capitol Ave • 0.8 mi out • No Traffic Delays</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-rose-600 tabular-nums">6 min</span>
                <p className="text-[10px] text-slate-400 font-medium">ESTIMATED</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                  M12
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">Medic 12 (Ambulance 12)</span>
                    <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Corridor North
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">I-80 W approaching exit 48 • 3.2 mi out • Moderate congestion</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-amber-600 tabular-nums">14 min</span>
                <p className="text-[10px] text-slate-400 font-medium">ESTIMATED</p>
              </div>
            </div>
          </div>
        </div>

        {/* Queue Operations Standby */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between text-xs">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Queue Operations</span>
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/60 flex flex-col items-center text-center my-3">
              <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2.5">
                <span className="material-symbols-outlined text-[22px]">verified</span>
              </div>
              <span className="font-bold text-slate-800">Automated Triage Routing Active</span>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                When all inbound handoffs are finalized, the terminal falls back to passive CAD monitoring mode automatically.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-slate-500">
              <span>SYSTEM CAD LINK:</span>
              <span className="text-emerald-600 font-bold">SYNCHRONIZED (0.04s)</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>ON-CALL TRAUMA SURGEON:</span>
              <span className="text-slate-800 font-bold">DR. K. ARIS (PAGER ON)</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
