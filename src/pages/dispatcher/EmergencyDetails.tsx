import React, { useState } from 'react';
import { useEMS } from '../../context/EMSContext';
import { PriorityBadge, EmergencyStatusBadge, ReservationStatusBadge } from '../../components/common/StatusBadge';

export const EmergencyDetails: React.FC<{ id?: string }> = ({ id = 'GM-2048' }) => {
  const {
    emergencies,
    hospitals,
    reservations,
    reserveResource,
    confirmHospitalRequest,
    completeHandoff,
    navigate,
    addToast
  } = useEMS();

  const emergency = emergencies.find((e) => e.id === id) || emergencies[0];
  const hospital = hospitals.find((h) => h.id === emergency.assignedHospitalId) || hospitals[0];
  const reservation = reservations.find((r) => r.emergencyId === emergency.id);

  const [handoffNotes, setHandoffNotes] = useState('');
  const [isHoldingResource, setIsHoldingResource] = useState(false);

  const handleRequestResource = () => {
    setIsHoldingResource(true);
    reserveResource(emergency.id, hospital.id, emergency.requiredResource, 'Cath Lab 02');
    setTimeout(() => {
      setIsHoldingResource(false);
    }, 400);
  };

  const handleConfirmIntake = () => {
    confirmHospitalRequest(emergency.id);
  };

  const handleCompleteHandoff = () => {
    completeHandoff(emergency.id);
  };

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-8 flex flex-col gap-6">
      {/* Top Header / Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dispatcher/requests')}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            title="Back to Active Requests"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md border border-blue-200">
                #{emergency.id}
              </span>
              <PriorityBadge priority={emergency.priority} size="sm" />
              <EmergencyStatusBadge status={emergency.status} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">{emergency.condition}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {emergency.status !== 'Handoff Complete' && (
            <button
              onClick={() => navigate(`/dispatcher/ranked-hospitals/${emergency.id}`)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">leaderboard</span>
              <span>Re-rank Hospitals</span>
            </button>
          )}
          {emergency.status === 'En Route' && (
            <button
              onClick={handleCompleteHandoff}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Complete Handoff</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Key Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs text-xs">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400">Incident Location</span>
          <span className="font-bold text-slate-900 mt-0.5">{emergency.location}</span>
          <span className="text-slate-400 text-[11px]">Lat: {emergency.coordinates.lat.toFixed(4)}, Lng: {emergency.coordinates.lng.toFixed(4)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Unit</span>
          <span className="font-bold text-blue-700 mt-0.5">{emergency.assignedAmbulanceId || 'Medic 04'}</span>
          <span className="text-slate-500 text-[11px]">Paramedic Alpha • ALS-1</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400">Destination Hospital</span>
          <span className="font-bold text-slate-900 mt-0.5">{hospital.name}</span>
          <span className="text-emerald-700 text-[11px] font-semibold">{hospital.tier}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400">Transit ETA</span>
          <span className="font-extrabold text-blue-600 text-base mt-0.5 tabular-nums">
            {emergency.etaMinutes} mins
          </span>
          <span className="text-emerald-600 text-[11px] font-semibold">Green Wave Corridor Active</span>
        </div>
      </div>

      {/* 2-Column Workflow Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Timeline & Resource Reservation (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Emergency Timeline Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">timeline</span>
                <h2 className="text-sm font-bold text-slate-900">Emergency Coordination Timeline</h2>
              </div>
              <span className="text-[11px] text-slate-400">Automated Audit Trail</span>
            </div>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {emergency.timeline.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-3 text-xs">
                  <div
                    className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[11px] font-bold ${
                      step.completed ? 'bg-emerald-500' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {step.completed ? '✓' : idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${step.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step.stage}
                      </span>
                      {step.timestamp && (
                        <span className="text-[11px] font-mono text-slate-400">{step.timestamp}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resource Reservation Management */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">bed</span>
                <h2 className="text-sm font-bold text-slate-900">Resource Reservation & Lock</h2>
              </div>
              {reservation ? (
                <ReservationStatusBadge status={reservation.status} />
              ) : (
                <ReservationStatusBadge status="AVAILABLE" />
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[22px]">radiology</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-xs block">
                    {emergency.assignedBedId || 'Cath Lab 02 (Interventional Suite)'}
                  </span>
                  <span className="text-slate-500 text-[11px] block">
                    Facility: {hospital.name}
                  </span>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-3">
                {(!reservation || reservation.status === 'AVAILABLE') && (
                  <button
                    onClick={handleRequestResource}
                    disabled={isHoldingResource}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    Request Resource
                  </button>
                )}

                {reservation && reservation.status === 'HELD' && (
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                      <span>Expires in: 00:{reservation.expiresInSeconds < 10 ? '0' : ''}{reservation.expiresInSeconds}</span>
                    </div>
                    <button
                      onClick={handleConfirmIntake}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Confirm Lock
                    </button>
                  </div>
                )}

                {reservation && reservation.status === 'CONFIRMED' && (
                  <div className="px-3.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                    <span>CONFIRMED FOR #{emergency.id}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recommended Hospital & Why This Hospital? (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Hospital Match Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">local_hospital</span>
                <h3 className="text-sm font-bold text-slate-900">Recommended Hospital Match</h3>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Score {hospital.cadScore}%
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <h4 className="font-bold text-sm text-slate-900">{hospital.name}</h4>
                <p className="text-xs text-slate-500">{hospital.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">DISTANCE</span>
                  <span className="font-bold text-slate-900">{hospital.distanceMiles} mi</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ETA</span>
                  <span className="font-bold text-blue-700">{hospital.currentEtaMinutes} mins</span>
                </div>
                <div className="mt-1">
                  <span className="text-slate-400 block text-[10px]">DATA CADENCE</span>
                  <span className="font-bold text-emerald-700">Updated {hospital.lastUpdatedSecondsAgo}s ago</span>
                </div>
                <div className="mt-1">
                  <span className="text-slate-400 block text-[10px]">ACCEPTANCE RATE</span>
                  <span className="font-bold text-slate-900">{hospital.reliability.acceptanceRate}%</span>
                </div>
              </div>
            </div>

            {/* WHY THIS HOSPITAL? List */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex flex-col gap-2.5 text-xs">
              <span className="font-bold text-blue-900 uppercase tracking-wider text-[10px]">
                Why This Hospital?
              </span>
              <ul className="space-y-1.5 text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                  <span>Required Cath Lab and ICU resources available</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                  <span>Shortest travel time ({hospital.currentEtaMinutes} min via Central corridor)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                  <span>Fresh real-time telemetry ({hospital.lastUpdatedSecondsAgo}s latency)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                  <span>Strong reliability & active surgical backup team</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Handoff Workflow Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">how_to_reg</span>
                <h3 className="text-sm font-bold text-slate-900">Hospital Arrival & Handoff</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">Step 4 of 4</span>
            </div>

            {emergency.status === 'Handoff Complete' ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center flex flex-col items-center">
                <span className="material-symbols-outlined text-emerald-600 text-[32px] mb-1">check_circle</span>
                <span className="font-bold text-sm text-emerald-900">HANDOFF COMPLETE</span>
                <p className="text-xs text-emerald-700 mt-1">
                  Patient definitively received by {hospital.name} emergency clinical team.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 text-xs">
                <p className="text-slate-600">
                  When unit arrives at facility bay, verify clinical transfer and click complete handoff.
                </p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex flex-col gap-1 text-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Attending Physician:</span>
                  <span className="font-semibold text-slate-900">Dr. H. Vance, MD (Attending ED)</span>
                </div>
                <button
                  onClick={handleCompleteHandoff}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Complete Patient Handoff</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
