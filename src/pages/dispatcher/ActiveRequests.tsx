import React, { useState } from 'react';
import { useEMS } from '../../context/EMSContext';
import { PriorityBadge, EmergencyStatusBadge } from '../../components/common/StatusBadge';
import { PriorityLevel, EmergencyStatus } from '../../types';

export const ActiveRequests: React.FC = () => {
  const { emergencies, hospitals, navigate, setSelectedEmergencyId } = useEMS();
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredEmergencies = emergencies.filter((em) => {
    const matchesSearch =
      em.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      em.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      em.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      em.requiredResource.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority = priorityFilter === 'all' || em.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || em.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-8 flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Active Emergency Requests</h1>
            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
              {filteredEmergencies.length} Listed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking of active dispatch cases, hospital matches, and patient transportation.
          </p>
        </div>

        <button
          onClick={() => navigate('/dispatcher/new-request')}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>New Emergency Request</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by ID, condition, location, or resource..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="urgent">Urgent</option>
              <option value="stable">Stable</option>
            </select>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Searching">Searching</option>
              <option value="Resource Held">Resource Held</option>
              <option value="Confirmed">Confirmed</option>
              <option value="En Route">En Route</option>
              <option value="Arrived">Arrived</option>
              <option value="Handoff Complete">Handoff Complete</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs overflow-hidden">
        {filteredEmergencies.length === 0 ? (
          <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-[36px] text-slate-300 mb-2">folder_off</span>
            <p className="font-bold text-slate-700">No emergency requests match your filters</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting your search query or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3">Request ID</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Primary Condition</th>
                  <th className="py-3 px-3">Required Resource</th>
                  <th className="py-3 px-3">Incident Location</th>
                  <th className="py-3 px-3">Ambulance</th>
                  <th className="py-3 px-3">Hospital</th>
                  <th className="py-3 px-3 text-center">ETA</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmergencies.map((em) => (
                  <tr
                    key={em.id}
                    onClick={() => {
                      setSelectedEmergencyId(em.id);
                      navigate(`/dispatcher/requests/${em.id}`);
                    }}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-3 font-mono font-bold text-blue-700">{em.id}</td>
                    <td className="py-3.5 px-3">
                      <PriorityBadge priority={em.priority} size="sm" />
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-900 max-w-xs truncate">
                      {em.condition}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 font-medium">{em.requiredResource}</td>
                    <td className="py-3.5 px-3 text-slate-500">{em.location}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-700">
                      {em.assignedAmbulanceId || '—'}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700">
                      {em.assignedHospitalId ? (
                        <span className="font-semibold text-slate-900">
                          {hospitals.find((h) => h.id === em.assignedHospitalId)?.name || 'Assigned'}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-blue-700 tabular-nums">
                      {em.etaMinutes > 0 ? `${em.etaMinutes} min` : 'Searching'}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <EmergencyStatusBadge status={em.status} />
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all text-[18px]">
                        chevron_right
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
};
