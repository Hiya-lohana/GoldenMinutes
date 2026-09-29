import React from 'react';
import { useEMS } from '../../context/EMSContext';

export const Sidebar: React.FC = () => {
  const { role, currentPath, navigate, emergencies, reservations } = useEMS();

  const activeCount = emergencies.filter((e) => e.status !== 'Handoff Complete').length;
  const heldReservationsCount = reservations.filter((r) => r.status === 'HELD').length;

  const isCurrent = (pathPrefix: string) => {
    if (pathPrefix === '/dispatcher/requests' && currentPath.startsWith('/dispatcher/requests/')) {
      return true;
    }
    if (pathPrefix === '/dispatcher/ranked-hospitals' && currentPath.startsWith('/dispatcher/ranked-hospitals')) {
      return true;
    }
    if (pathPrefix === '/dispatcher/hospitals' && currentPath.startsWith('/dispatcher/hospitals/')) {
      return true;
    }
    if (pathPrefix === '/dispatcher/ambulances' && currentPath.startsWith('/dispatcher/ambulances/')) {
      return true;
    }
    if (pathPrefix === '/hospital/requests' && currentPath.startsWith('/hospital/requests/')) {
      return true;
    }
    return currentPath === pathPrefix;
  };

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200/80 z-40 flex flex-col justify-between py-5 px-3 md:px-4 overflow-y-auto select-none shadow-xs">
      <div className="flex flex-col gap-5">
        {/* Role Indicator Card */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">
                {role === 'dispatcher' ? 'emergency' : 'domain'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                {role === 'dispatcher' ? 'CAD Dispatch' : 'Hospital Operations'}
              </span>
              <span className="text-[11px] text-slate-500">
                {role === 'dispatcher' ? 'Live Active Console' : 'Mercy General Node'}
              </span>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        </div>

        {/* Dispatcher Navigation */}
        {role === 'dispatcher' ? (
          <div className="flex flex-col gap-4">
            {/* Command Center */}
            <div className="flex flex-col gap-1">
              <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Command Center
              </span>
              <button
                type="button"
                onClick={() => navigate('/dispatcher/command-center')}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isCurrent('/dispatcher/command-center')
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isCurrent('/dispatcher/command-center') ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  dashboard
                </span>
                <span>Command Center</span>
              </button>
            </div>

            {/* Operations */}
            <div className="flex flex-col gap-1">
              <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Operations
              </span>
              <button
                type="button"
                onClick={() => navigate('/dispatcher/new-request')}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isCurrent('/dispatcher/new-request')
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isCurrent('/dispatcher/new-request') ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  add_circle
                </span>
                <span>New Request</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/dispatcher/requests')}
                className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isCurrent('/dispatcher/requests')
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isCurrent('/dispatcher/requests') ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  >
                    pending_actions
                  </span>
                  <span>Active Requests</span>
                </div>
                <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full font-bold">
                  {activeCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/dispatcher/ranked-hospitals/GM-2048')}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isCurrent('/dispatcher/ranked-hospitals')
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isCurrent('/dispatcher/ranked-hospitals') ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  leaderboard
                </span>
                <span>Ranked Hospitals</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/dispatcher/map')}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isCurrent('/dispatcher/map')
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isCurrent('/dispatcher/map') ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  map
                </span>
                <span>Dispatch Map</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/dispatcher/ambulances')}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isCurrent('/dispatcher/ambulances')
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isCurrent('/dispatcher/ambulances') ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  ambulance
                </span>
                <span>Fleet Ambulances</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/dispatcher/hospitals')}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isCurrent('/dispatcher/hospitals')
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isCurrent('/dispatcher/hospitals') ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  domain
                </span>
                <span>Hospital Capacity</span>
              </button>
            </div>

            {/* Management */}
            <div className="flex flex-col gap-1 pt-2 border-t border-slate-100">
              <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Management
              </span>
              <button
                type="button"
                onClick={() => navigate('/dispatcher/activity')}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isCurrent('/dispatcher/activity')
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isCurrent('/dispatcher/activity') ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  history
                </span>
                <span>Activity Feed</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/dispatcher/history')}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isCurrent('/dispatcher/history')
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isCurrent('/dispatcher/history') ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  folder_open
                </span>
                <span>Incident History</span>
              </button>
            </div>
          </div>
        ) : (
          /* Hospital Staff Navigation */
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Hospital Staff Modules
              </span>
              <button
                type="button"
                onClick={() => navigate('/hospital/overview')}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isCurrent('/hospital/overview')
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isCurrent('/hospital/overview') ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  local_hospital
                </span>
                <span>Overview</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/hospital/requests')}
                className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isCurrent('/hospital/requests')
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isCurrent('/hospital/requests') ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  >
                    inbox
                  </span>
                  <span>Incoming Queue</span>
                </div>
                <span className="bg-rose-50 text-rose-700 text-xs px-2 py-0.5 rounded-full font-bold border border-rose-200">
                  3 Inbound
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/hospital/double-booking')}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isCurrent('/hospital/double-booking')
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isCurrent('/hospital/double-booking') ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  verified_user
                </span>
                <span>Double-Booking Demo</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/hospital/resources')}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isCurrent('/hospital/resources')
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isCurrent('/hospital/resources') ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  domain_add
                </span>
                <span>Resource Manager</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/hospital/reservations')}
                className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isCurrent('/hospital/reservations')
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isCurrent('/hospital/reservations') ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  >
                    fact_check
                  </span>
                  <span>Reservations</span>
                </div>
                {heldReservationsCount > 0 && (
                  <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold">
                    {heldReservationsCount} Held
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/hospital/predictions')}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isCurrent('/hospital/predictions')
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isCurrent('/hospital/predictions') ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  insights
                </span>
                <span>Availability Forecast</span>
              </button>
            </div>

            <div className="flex flex-col gap-1 pt-2 border-t border-slate-100">
              <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Facility Logs
              </span>
              <button
                type="button"
                onClick={() => navigate('/hospital/activity')}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isCurrent('/hospital/activity')
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isCurrent('/hospital/activity') ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  history
                </span>
                <span>Facility Activity</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/hospital/history')}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isCurrent('/hospital/history')
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isCurrent('/hospital/history') ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  archive
                </span>
                <span>Handoff History</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Bottom CAD Sync Status */}
      <div className="mt-4 p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-slate-500 font-medium">CAD Sync Link</span>
        </div>
        <span className="font-bold text-slate-800">14ms latency</span>
      </div>
    </aside>
  );
};
