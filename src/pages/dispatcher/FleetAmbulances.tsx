import React from 'react';
import { useEMS } from '../../context/EMSContext';

export const FleetAmbulances: React.FC = () => {
  const { ambulances, navigate, setSelectedAmbulanceId } = useEMS();

  const handleRowClick = (id: string) => {
    setSelectedAmbulanceId(id);
    navigate(`/dispatcher/ambulances/${id}`);
  };

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fleet Ambulances</h1>
            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
              {ambulances.length} Units Online
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time ambulance fleet status, crew certifications, and tactical dispatch telemetry.
          </p>
        </div>
      </div>

      {/* Fleet Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">Ambulance ID</th>
                <th className="py-3 px-3">Callsign & Type</th>
                <th className="py-3 px-3">Lead Paramedic</th>
                <th className="py-3 px-3">Current Location</th>
                <th className="py-3 px-3">Speed</th>
                <th className="py-3 px-3">Assigned Patient</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">ETA</th>
                <th className="py-3 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ambulances.map((amb) => (
                <tr
                  key={amb.id}
                  onClick={() => handleRowClick(amb.id)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-3 font-mono font-bold text-blue-700">{amb.id}</td>
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-slate-900 block">{amb.name} ({amb.callSign})</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold">
                      {amb.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-medium text-slate-700">{amb.leadParamedic}</td>
                  <td className="py-3.5 px-3 text-slate-500 max-w-xs truncate">{amb.location}</td>
                  <td className="py-3.5 px-3 font-mono text-slate-700 font-semibold">{amb.speedMph} mph</td>
                  <td className="py-3.5 px-3">
                    {amb.assignedEmergencyId ? (
                      <span className="font-mono font-bold text-slate-800">#{amb.assignedEmergencyId}</span>
                    ) : (
                      <span className="text-slate-400 italic">None</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        amb.status === 'Available'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : amb.status === 'En Route'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          amb.status === 'Available' ? 'bg-emerald-500' : 'bg-blue-600 animate-ping'
                        }`}
                      ></span>
                      {amb.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-blue-700 tabular-nums">
                    {amb.etaMinutes > 0 ? `${amb.etaMinutes} min` : '—'}
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
      </div>
    </main>
  );
};
