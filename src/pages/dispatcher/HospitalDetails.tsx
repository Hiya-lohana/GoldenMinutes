import React, { useState } from 'react';
import { useEMS } from '../../context/EMSContext';
import { FreshnessBadge, HospitalStatusBadge } from '../../components/common/StatusBadge';

export const HospitalDetails: React.FC<{ id?: string }> = ({ id = 'mercy-general' }) => {
  const { hospitals, emergencies, navigate } = useEMS();
  const hospital = hospitals.find((h) => h.id === id) || hospitals[0];

  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'reliability' | 'activity'>('overview');

  const incomingForHospital = emergencies.filter(
    (e) => e.assignedHospitalId === hospital.id && e.status !== 'Handoff Complete'
  );

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white px-6 py-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dispatcher/hospitals')}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            title="Back to Hospital Capacity"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{hospital.name}</h1>
              <HospitalStatusBadge status={hospital.status} message={hospital.statusMessage} />
              <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                {hospital.tier}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{hospital.address}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="bg-slate-50 border border-slate-200/70 p-2.5 rounded-xl flex items-center gap-3">
            <div>
              <span className="text-slate-400 text-[10px] block">ETA FROM CIVIC CORE</span>
              <span className="font-bold text-blue-700 text-sm">{hospital.currentEtaMinutes} mins</span>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div>
              <span className="text-slate-400 text-[10px] block">DATA CADENCE</span>
              <FreshnessBadge secondsAgo={hospital.lastUpdatedSecondsAgo} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Controller */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'resources'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Resources
        </button>
        <button
          onClick={() => setActiveTab('reliability')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'reliability'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Reliability
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'activity'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Activity
        </button>
      </div>

      {/* TAB CONTENT 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Facility Capabilities */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">domain</span>
              <span>Facility Capabilities & Coverage</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {hospital.specialties.map((spec, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/60"
                >
                  {spec}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[10px]">ON-CALL CARDIOLOGIST</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{hospital.onCallCardiologist}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[10px]">ON-CALL TRAUMA SURGEON</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{hospital.onCallTraumaSurgeon}</span>
              </div>
            </div>
          </div>

          {/* Current Incoming Requests */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">inbox</span>
                <span>Current Inbound Queue</span>
              </h3>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                {incomingForHospital.length} Inbound
              </span>
            </div>

            {incomingForHospital.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No active inbound transports at this time.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {incomingForHospital.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => navigate(`/dispatcher/requests/${req.id}`)}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/70 flex items-center justify-between cursor-pointer transition-colors text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-700">#{req.id}</span>
                        <span className="font-bold text-slate-800">{req.assignedAmbulanceId}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 mt-0.5 block line-clamp-1">{req.condition}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-blue-700">{req.etaMinutes} mins</span>
                      <span className="text-[10px] text-slate-400 block">ETA</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: RESOURCES */}
      {activeTab === 'resources' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hospital Resource Capacity Breakdown</h3>
              <p className="text-xs text-slate-500 mt-0.5">Live inventory of critical resuscitation and care assets</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hospital.resources.map((res) => (
              <div key={res.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{res.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    {res.available} Open
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">RESERVED</span>
                    <span className="font-bold text-amber-700 tabular-nums">{res.reserved}</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">OCCUPIED</span>
                    <span className="font-bold text-slate-800 tabular-nums">{res.occupied}</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">MAINT</span>
                    <span className="font-bold text-slate-500 tabular-nums">{res.maintenance}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: RELIABILITY */}
      {activeTab === 'reliability' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
            <span className="text-xs text-slate-500 font-medium">Acceptance Rate</span>
            <span className="text-3xl font-extrabold text-emerald-600 mt-1">
              {hospital.reliability.acceptanceRate}%
            </span>
            <p className="text-xs text-slate-500 mt-2">Historical 90-day intake compliance</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
            <span className="text-xs text-slate-500 font-medium">Staff Response Latency</span>
            <span className="text-3xl font-extrabold text-slate-900 mt-1">
              {hospital.reliability.avgResponseSeconds}s
            </span>
            <p className="text-xs text-slate-500 mt-2">Time to accept or divert inbound request</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
            <span className="text-xs text-slate-500 font-medium">Telemetry Accuracy</span>
            <span className="text-3xl font-extrabold text-blue-700 mt-1">
              {hospital.reliability.availabilityAccuracy}%
            </span>
            <p className="text-xs text-slate-500 mt-2">Correlation between reported vs physical beds</p>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: ACTIVITY */}
      {activeTab === 'activity' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-3">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
            Recent Facility Operational Events
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-start justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Cath Lab Standby Acknowledged</span>
                <span className="text-slate-500 text-[11px]">Interventional staff confirmed ready for Medic 04</span>
              </div>
              <span className="text-slate-400 font-mono">12:40 PM</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-start justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Bed Capacity Heartbeat Sync</span>
                <span className="text-slate-500 text-[11px]">Automated telemetry reported 8 ICU beds open</span>
              </div>
              <span className="text-slate-400 font-mono">12:35 PM</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-start justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Patient Handoff Finalized #GM-2046</span>
                <span className="text-slate-500 text-[11px]">Transferred to Resuscitation Bay 1</span>
              </div>
              <span className="text-slate-400 font-mono">11:58 AM</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
