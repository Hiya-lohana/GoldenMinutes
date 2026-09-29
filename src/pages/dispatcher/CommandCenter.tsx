import React from 'react';
import { useEMS } from '../../context/EMSContext';
import { MapCanvas } from '../../components/common/MapCanvas';
import { PriorityBadge, EmergencyStatusBadge } from '../../components/common/StatusBadge';
import { EmergencyRequest } from '../../types';

export const CommandCenter: React.FC = () => {
  const { emergencies, ambulances, hospitals, navigate, setSelectedEmergencyId } = useEMS();

  const activeEmergencies = emergencies.filter((e) => e.status !== 'Handoff Complete');
  const [filterAcuity, setFilterAcuity] = React.useState<'all' | 'critical'>('all');
  const displayedEmergencies = filterAcuity === 'critical' 
    ? activeEmergencies.filter(e => e.priority === 'critical') 
    : activeEmergencies;
  const criticalCount = activeEmergencies.filter((e) => e.priority === 'critical').length;
  const enRouteAmbulances = ambulances.filter((a) => a.status === 'En Route').length;
  const onlineHospitals = hospitals.filter((h) => h.status === 'Online').length;
  const pendingRequests = emergencies.filter((e) => e.status === 'Searching' || e.status === 'Awaiting Hospital').length;

  const handleRowClick = (emergency: EmergencyRequest) => {
    setSelectedEmergencyId(emergency.id);
    navigate(`/dispatcher/requests/${emergency.id}`);
  };

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-8 flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Command Center</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
              Live Operations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Regional emergency intake, active fleet positioning, and instant hospital triage matching.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dispatcher/new-request')}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>New Emergency Request</span>
          </button>
        </div>
      </div>

      {/* Operational Summary Bento Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Emergencies
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {activeEmergencies.length}
              </span>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                {criticalCount} Critical
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Protocol clearance active</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">vital_signs</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Ambulances
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {enRouteAmbulances} <span className="text-xs text-slate-400 font-normal">/ {ambulances.length}</span>
              </span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Telemetry Synced
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Green corridors engaged</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">ambulance</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Hospitals Online
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-emerald-700 tabular-nums">
                {onlineHospitals} <span className="text-xs text-slate-400 font-normal">/ {hospitals.length}</span>
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                1 Diverting
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">KEM & Lilavati Accepting</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">local_hospital</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Pending Matches
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {pendingRequests}
              </span>
              <span className="text-xs font-semibold text-slate-500">Requires triage review</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">&lt; 1.4s matching score</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">timer</span>
          </div>
        </div>
      </div>

      {/* LARGE LIVE MAP */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[18px]">explore</span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Regional Tactical Overview
            </h2>
          </div>
          <span className="text-xs text-slate-400">Click any hospital, ambulance, or incident to inspect</span>
        </div>
        <MapCanvas heightClass="h-[460px]" />
      </div>

      {/* ACTIVE EMERGENCIES LIST / TABLE */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-blue-600 text-[20px]">list_alt</span>
            <h3 className="text-base font-bold text-slate-900">Active Emergencies</h3>
            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full border border-blue-200">
              {activeEmergencies.length} Under Management
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setFilterAcuity('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${filterAcuity === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                All ({activeEmergencies.length})
              </button>
              <button
                onClick={() => setFilterAcuity('critical')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${filterAcuity === 'critical' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-600 hover:bg-rose-50'}`}
              >
                Code Red ({criticalCount})
              </button>
            </div>
            <button
              onClick={() => navigate('/dispatcher/requests')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Active Requests</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Clean Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-3">Emergency ID</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Primary Condition</th>
                <th className="py-2.5 px-3">Resource Needed</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Ambulance</th>
                <th className="py-2.5 px-3 text-center">ETA</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedEmergencies.map((em) => (
                <tr
                  key={em.id}
                  onClick={() => handleRowClick(em)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-3 font-mono font-bold text-blue-700">{em.id}</td>
                  <td className="py-3 px-3">
                    <PriorityBadge priority={em.priority} size="sm" />
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900 max-w-xs truncate">
                    {em.condition}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-600">{em.requiredResource}</td>
                  <td className="py-3 px-3 text-slate-500">{em.location}</td>
                  <td className="py-3 px-3 font-semibold text-slate-700">
                    {em.assignedAmbulanceId || 'Awaiting assignment'}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-blue-700 tabular-nums">
                    {em.etaMinutes > 0 ? `${em.etaMinutes} min` : 'Searching'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <EmergencyStatusBadge status={em.status} />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all text-[18px]">
                      chevron_right
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};
