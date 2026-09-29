import React, { useState } from 'react';
import { useEMS } from '../../context/EMSContext';
import { FreshnessBadge, HospitalStatusBadge } from '../../components/common/StatusBadge';

export const HospitalCapacity: React.FC = () => {
  const { hospitals, navigate, setSelectedHospitalId } = useEMS();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');

  const filteredHospitals = hospitals.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.tier.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || h.status === statusFilter;

    let matchesResource = true;
    if (resourceFilter === 'icu') {
      const icu = h.resources.find((r) => r.category === 'ICU Beds');
      matchesResource = (icu?.available || 0) > 0;
    } else if (resourceFilter === 'ed') {
      const ed = h.resources.find((r) => r.category === 'Emergency Beds');
      matchesResource = (ed?.available || 0) > 0;
    } else if (resourceFilter === 'vent') {
      const vent = h.resources.find((r) => r.category === 'Ventilators');
      matchesResource = (vent?.available || 0) > 0;
    }

    return matchesSearch && matchesStatus && matchesResource;
  });

  const handleRowClick = (id: string) => {
    setSelectedHospitalId(id);
    navigate(`/dispatcher/hospitals/${id}`);
  };

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Regional Hospital Capacity</h1>
            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
              {filteredHospitals.length} Centers Online
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time bed availability, data telemetry freshness, and regional diversion declarations.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search hospitals by name, specialty, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Online">Online</option>
              <option value="Busy">Near Capacity</option>
              <option value="Diversion Active">Diversion Active</option>
            </select>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Must Have:</span>
            <select
              value={resourceFilter}
              onChange={(e) => setResourceFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Any Resource</option>
              <option value="icu">Available ICU Bed</option>
              <option value="ed">Available ED Bed</option>
              <option value="vent">Available Ventilator</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">Hospital Center</th>
                <th className="py-3 px-3 text-center">Transit ETA</th>
                <th className="py-3 px-3 text-center">Distance</th>
                <th className="py-3 px-3 text-center">ICU Beds</th>
                <th className="py-3 px-3 text-center">ED Beds</th>
                <th className="py-3 px-3 text-center">Ventilators</th>
                <th className="py-3 px-3">Data Freshness</th>
                <th className="py-3 px-3">Reliability</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHospitals.map((h) => {
                const icu = h.resources.find((r) => r.category === 'ICU Beds');
                const ed = h.resources.find((r) => r.category === 'Emergency Beds');
                const vent = h.resources.find((r) => r.category === 'Ventilators');

                return (
                  <tr
                    key={h.id}
                    onClick={() => handleRowClick(h.id)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-3">
                      <div>
                        <span className="font-bold text-slate-900 block">{h.name}</span>
                        <span className="text-[11px] text-slate-500">{h.tier}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-blue-700 tabular-nums">
                      {h.currentEtaMinutes} mins
                    </td>
                    <td className="py-3.5 px-3 text-center font-medium text-slate-700">
                      {h.distanceMiles} mi
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`font-bold tabular-nums ${
                          (icu?.available || 0) > 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {icu?.available || 0} Open
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-bold text-slate-900 tabular-nums">
                        {ed?.available || 0} Open
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-bold text-slate-900 tabular-nums">
                        {vent?.available || 0} Open
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <FreshnessBadge secondsAgo={h.lastUpdatedSecondsAgo} />
                    </td>
                    <td className="py-3.5 px-3">
                      <div>
                        <span className="font-semibold text-slate-900 block">
                          {h.reliability.overall} ({h.reliability.acceptanceRate}%)
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {h.reliability.avgResponseSeconds}s avg response
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <HospitalStatusBadge status={h.status} message={h.statusMessage} />
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all text-[18px]">
                        chevron_right
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};
