import React, { useState, useEffect } from 'react';
import { useEMS } from '../../context/EMSContext';

export const IncomingRequests: React.FC = () => {
  const { confirmHospitalRequest, rejectHospitalRequest, navigate, setSelectedEmergencyId, addToast } = useEMS();

  const [stemiCountdown, setStemiCountdown] = useState<number>(41);
  const [traumaCountdown, setTraumaCountdown] = useState<number>(51);

  useEffect(() => {
    const timer = setInterval(() => {
      setStemiCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      setTraumaCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAccept = (emergencyId: string) => {
    confirmHospitalRequest(emergencyId);
  };

  const handleDecline = (emergencyId: string) => {
    rejectHospitalRequest(emergencyId, 'Operating room and bay saturation reached');
  };

  const handleInspect = (emergencyId: string) => {
    setSelectedEmergencyId(emergencyId);
    navigate(`/hospital/requests/${emergencyId}`);
  };

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-8 flex flex-col gap-6">
      {/* Priority Inbound Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Active Inbound Transit Queue</h1>
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

      {/* Inbound Queue Cards Stack */}
      <div className="flex flex-col gap-4">
        {/* CARD 1: CRITICAL • CODE RED (Acute STEMI) */}
        <div className="bg-white rounded-2xl border-l-4 border-l-rose-500 border border-slate-200/80 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col xl:flex-row gap-6 xl:items-center justify-between">
            {/* Patient & Clinical Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap mb-3">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  <span>CRITICAL • CODE RED</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">
                  <span className="material-symbols-outlined text-[15px] text-blue-600">speed</span>
                  <span>ETA 6 MINS (0.8 MI)</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">directions_car</span>
                  <span className="text-slate-900 font-bold">AMBULANCE 04</span>
                  <span>(CALLSIGN: MEDIC 4)</span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Acute STEMI • 58M Crushing Chest Pain, ST Elevation V1-V4
              </h3>
              <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                Vitals: BP 90/60, HR 112, SpO2 91% on room air, 12-lead transmitted. Aspirin 324mg & Heparin administered in transit.
              </p>

              {/* Resource Requirement */}
              <div className="flex items-center gap-4 flex-wrap mt-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1.5 bg-blue-50/70 border border-blue-100 px-3 py-1 rounded-lg">
                  <span className="material-symbols-outlined text-blue-600 text-[17px]">radiology</span>
                  <span className="text-slate-500 uppercase font-semibold text-[11px]">Resource Needed:</span>
                  <span className="font-bold text-blue-700">Cath Lab (24/7 Priority)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-medium">Cath Lab 02: Ready (1 Unit Available)</span>
                </div>
              </div>
            </div>

            {/* Decision Box & Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
              <div className="flex flex-col items-center justify-center px-4 py-2 rounded-lg bg-rose-50 border border-rose-100 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Decision Window</span>
                <div className="flex items-center gap-1 text-rose-600 font-extrabold text-base mt-0.5 tabular-nums">
                  <span className="material-symbols-outlined text-[17px]">hourglass_top</span>
                  <span>00:{stemiCountdown < 10 ? '0' : ''}{stemiCountdown}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleAccept('GM-2048')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                  <span>Accept Patient</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDecline('GM-2048')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-700 hover:text-rose-600 font-semibold text-xs uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">turn_sharp_right</span>
                  <span>Decline / Divert</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInspect('GM-2048')}
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                  title="View 12-Lead EKG & Patient Telemetry"
                >
                  <span className="material-symbols-outlined text-[19px]">assignment</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: URGENT • TRAUMA LEVEL 2 (MVA) */}
        <div className="bg-white rounded-2xl border-l-4 border-l-amber-500 border border-slate-200/80 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col xl:flex-row gap-6 xl:items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap mb-3">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-xs uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>URGENT • TRAUMA LEVEL 2</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">
                  <span className="material-symbols-outlined text-[15px] text-amber-600">timer</span>
                  <span>ETA 14 MINS</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">airport_shuttle</span>
                  <span className="text-slate-900 font-bold">AMBULANCE 12</span>
                  <span>(CALLSIGN: MEDIC 12)</span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Multi-Vehicle Collision • Blunt Abdominal Injury & Pelvic Pain
              </h3>
              <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                Extrication required 20 minutes. GCS 13, airway patent. Suspected spleen involvement, FAST exam positive in RUQ.
              </p>

              <div className="flex items-center gap-4 flex-wrap mt-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1.5 bg-blue-50/70 border border-blue-100 px-3 py-1 rounded-lg">
                  <span className="material-symbols-outlined text-blue-600 text-[17px]">bed</span>
                  <span className="text-slate-500 uppercase font-semibold text-[11px]">Resource Needed:</span>
                  <span className="font-bold text-blue-700">Trauma Bay (Level 1 Resus)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-medium">Trauma Bay 01 & 03 Available</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
              <div className="flex flex-col items-center justify-center px-4 py-2 rounded-lg bg-amber-50 border border-amber-100 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Awaiting Decision</span>
                <div className="flex items-center gap-1 text-amber-700 font-extrabold text-base mt-0.5 tabular-nums">
                  <span className="material-symbols-outlined text-[17px]">timer</span>
                  <span>00:{traumaCountdown < 10 ? '0' : ''}{traumaCountdown}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleAccept('GM-2047')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Accept Patient</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDecline('GM-2047')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-700 hover:text-rose-600 font-semibold text-xs uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                  <span>Decline / Divert</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInspect('GM-2047')}
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                  title="View Patient Details"
                >
                  <span className="material-symbols-outlined text-[19px]">assignment</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: CONFIRMED • STABLE INBOUND (Elderly Fall) */}
        <div className="bg-white rounded-2xl border-l-4 border-l-emerald-500 border border-slate-200/80 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col xl:flex-row gap-6 xl:items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap mb-3">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>CONFIRMED • STABLE INBOUND</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">
                  <span className="material-symbols-outlined text-[15px] text-slate-500">schedule</span>
                  <span>ETA 18 MINS</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">directions_car</span>
                  <span className="text-slate-900 font-bold">AMBULANCE 08</span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Elderly Mechanical Fall • Suspected Left Hip Fracture, Stable Vitals
              </h3>
              <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                82F with unwitnessed fall from standing. Neuro intact, splinted in situ. Accepted by Dr. H. Vance (Attending ED).
              </p>

              <div className="flex items-center gap-4 flex-wrap mt-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1.5 bg-blue-50/70 border border-blue-100 px-3 py-1 rounded-lg">
                  <span className="material-symbols-outlined text-blue-600 text-[17px]">hotel</span>
                  <span className="text-slate-500 uppercase font-semibold text-[11px]">Assigned Location:</span>
                  <span className="font-bold text-blue-700">General Ortho Obs Bed #14</span>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  NURSE PRIMARY: <span className="font-bold text-slate-700">S. CHEN, RN</span>
                </div>
              </div>
            </div>

            {/* Visual Step Indicator: Accepted -> En Route -> Arrived -> Handed Off */}
            <div className="flex flex-col gap-2 shrink-0 bg-slate-50 p-4 rounded-xl border border-slate-200/70 min-w-[340px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Handoff Lifecycle
                </span>
                <span className="text-[11px] font-bold text-blue-600">Step 2 of 4</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                {/* Step 1: Accepted (Done) */}
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    <span className="material-symbols-outlined text-[15px]">check</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 mt-1.5">Accepted</span>
                </div>
                <div className="flex-1 h-0.5 bg-emerald-500 mx-2 -mt-4"></div>

                {/* Step 2: En Route (Active) */}
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold ring-4 ring-blue-100 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  </div>
                  <span className="text-[11px] font-bold text-blue-600 mt-1.5">En Route</span>
                </div>
                <div className="flex-1 h-0.5 bg-slate-200 mx-2 -mt-4"></div>

                {/* Step 3: Arrived */}
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-white border border-slate-300 text-slate-400 flex items-center justify-center text-xs font-medium">
                    3
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 mt-1.5">Arrived</span>
                </div>
                <div className="flex-1 h-0.5 bg-slate-200 mx-2 -mt-4"></div>

                {/* Step 4: Handed Off */}
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-white border border-slate-300 text-slate-400 flex items-center justify-center text-xs font-medium">
                    4
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 mt-1.5">Handoff</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
