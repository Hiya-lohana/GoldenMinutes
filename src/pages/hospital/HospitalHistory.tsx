import React, { useState } from 'react';
import { useEMS } from '../../context/EMSContext';
import { PriorityBadge } from '../../components/common/StatusBadge';

export const HospitalHistory: React.FC = () => {
  const { history } = useEMS();
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patientCondition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ambulanceId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Completed Admissions Archive</h1>
            <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {filteredHistory.length} Handoffs Logged
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical emergency handoffs, resuscitation bed turnover, and door-to-treatment metrics.
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
            placeholder="Search admissions archive by ID, condition, or unit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
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
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">Emergency ID</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Patient Presentation</th>
                <th className="py-3 px-3">Ambulance Call Sign</th>
                <th className="py-3 px-3 text-center">Door-to-Needle</th>
                <th className="py-3 px-3 text-right">Final Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-blue-700">{item.id}</td>
                  <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">{item.date}</td>
                  <td className="py-3.5 px-3">
                    <PriorityBadge priority={item.priority} size="sm" />
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-900 max-w-xs truncate">
                    {item.patientCondition}
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-700">{item.ambulanceId}</td>
                  <td className="py-3.5 px-3 text-center font-bold text-emerald-700 tabular-nums">
                    {item.doorToNeedleMinutes} min
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {item.outcome}
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
