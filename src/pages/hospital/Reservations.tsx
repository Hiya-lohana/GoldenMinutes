import React from 'react';
import { useEMS } from '../../context/EMSContext';
import { ReservationStatusBadge } from '../../components/common/StatusBadge';

export const Reservations: React.FC = () => {
  const { reservations } = useEMS();

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Active & Historical Reservations</h1>
            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
              {reservations.length} Active Leases
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational holds automatically expire in 60 seconds if unconfirmed, returning assets to the open regional pool.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">Reservation ID</th>
                <th className="py-3 px-3">Emergency Request</th>
                <th className="py-3 px-3">Hospital Facility</th>
                <th className="py-3 px-3">Resource / Bed</th>
                <th className="py-3 px-3">Assigned Unit</th>
                <th className="py-3 px-3">Created</th>
                <th className="py-3 px-3 text-center">Expires In</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reservations.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-blue-700">{res.id}</td>
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-900">#{res.emergencyId}</td>
                  <td className="py-3.5 px-3 font-medium text-slate-800">{res.hospitalName}</td>
                  <td className="py-3.5 px-3 font-semibold text-slate-900">{res.resourceBed}</td>
                  <td className="py-3.5 px-3 text-slate-600">{res.assignedToAmbulance}</td>
                  <td className="py-3.5 px-3 text-slate-400 font-mono">{res.createdAt}</td>
                  <td className="py-3.5 px-3 text-center">
                    {res.status === 'HELD' ? (
                      <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 tabular-nums">
                        00:{res.expiresInSeconds < 10 ? '0' : ''}{res.expiresInSeconds}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <ReservationStatusBadge status={res.status} />
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
