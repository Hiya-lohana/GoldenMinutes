import React, { useState } from 'react';
import { useEMS } from '../../context/EMSContext';
import { useAuth } from '../../context/AuthContext';

export const TopHeader: React.FC = () => {
  const {
    role,
    setRole,
    navigate,
    isStaleScenarioActive,
    toggleStaleScenario,
    isRoadblockActive,
    simulateRoadblock,
    resetRoadblock,
    triggerDoubleBookingDemo,
    isLiveTrackingActive,
    toggleLiveTracking,
    isFirestoreSyncing,
  } = useEMS();

  const { user, userProfile, signOutUser, signInWithGoogle } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [scenariosOpen, setScenariosOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full h-16 z-50 bg-white border-b border-slate-200/80 px-3 md:px-6 flex items-center justify-between shadow-xs select-none">
      {/* Left: Logo & Facility Tag */}
      <div className="flex items-center gap-3 md:gap-5">
        <button
          onClick={() => navigate(role === 'dispatcher' ? '/dispatcher/command-center' : '/hospital/overview')}
          className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
        >
          <img
            alt="GoldenMinutes Logo"
            className="h-8 md:h-9 w-auto object-contain transition-transform group-hover:scale-105"
            src="https://lh3.googleusercontent.com/aida/AEtjO1V-Xh8FAWmJqN525WJhu2ywz6v-5WXTGXlncv0vvcWZI2wPqooMdekWKPz9fqXAI7ZpPMtb0JY_q5qSSYsxnKhvUThAxXNzBq-XFt4fkwwwAqq7p07j5JYzmFlmxwSAlPPyYpmoqS7GsIBJlXSwskha6v8rJC-2m4WsBCv0YQwMt4771qvf43usgmHsECJxvnK1sj7BU6uMxvXwxnDCkWkS_G58eguZNGqrAq_7F16R3hF5nA8wKiEvqJs"
          />
        </button>

        <div className="h-5 w-px bg-slate-200 hidden md:block"></div>

        {/* Facility Node Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-xs font-medium text-slate-700">
          <span className="material-symbols-outlined text-blue-600 text-[18px]">local_hospital</span>
          <span className="font-semibold text-slate-900">KEM Hospital & Trauma Center</span>
          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full font-bold">Level 1 Apex</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" title="Direct Telemetry Stream"></span>
        </div>
      </div>

      {/* Center: Live Scenario Test Toolbar */}
      <div className="hidden xl:flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-xl px-2.5 py-1">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px] text-amber-500">science</span>
          Scenarios:
        </span>

        {/* 1. Stale Data Toggle */}
        <button
          type="button"
          onClick={toggleStaleScenario}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
            isStaleScenarioActive
              ? 'bg-amber-500 text-white border-amber-600 shadow-xs animate-pulse'
              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
          title="Simulates telemetry loss for Hinduja Hospital (>320s stale). Test destination ranking re-weighting!"
        >
          <span className="material-symbols-outlined text-[14px]">
            {isStaleScenarioActive ? 'warning' : 'history'}
          </span>
          <span>{isStaleScenarioActive ? 'Stale Data (Active)' : 'Test Stale Data'}</span>
        </button>

        {/* 2. Double Booking Conflict Demo */}
        <button
          type="button"
          onClick={triggerDoubleBookingDemo}
          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
          title="Simulate simultaneous ambulance requests for the last ICU bed #14"
        >
          <span className="material-symbols-outlined text-[14px] text-rose-600">sync_problem</span>
          <span>Test Double-Booking</span>
        </button>

        {/* 3. Live GPS Tracking Toggle */}
        <button
          type="button"
          onClick={toggleLiveTracking}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
            isLiveTrackingActive
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}
          title="Toggles animated real-time ambulance GPS telemetry on the map"
        >
          <span className="material-symbols-outlined text-[14px] text-blue-600">navigation</span>
          <span>{isLiveTrackingActive ? 'Live GPS: On' : 'Live GPS: Off'}</span>
        </button>

        {/* 4. Roadblock Reroute Toggle */}
        <button
          type="button"
          onClick={isRoadblockActive ? resetRoadblock : simulateRoadblock}
          className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
            isRoadblockActive
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
          }`}
          title="Simulate road blockage on primary arterial"
        >
          <span className="material-symbols-outlined text-[14px] text-rose-600">alt_route</span>
          <span>{isRoadblockActive ? 'Clear Block' : 'Roadblock'}</span>
        </button>

        {/* 5. ML Surge Alert Shortcut */}
        <button
          type="button"
          onClick={() => {
            if (role !== 'hospital') {
              setRole('hospital');
            }
            navigate('/hospital/overview');
          }}
          className="px-2 py-1 rounded-lg text-xs font-bold bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 transition-all flex items-center gap-1 cursor-pointer"
          title="View ML-predicted patient inflow for next 4 hours"
        >
          <span className="material-symbols-outlined text-[14px] text-blue-600">crisis_alert</span>
          <span>Surge Alert</span>
        </button>
      </div>

      {/* Right: Switcher, System Status & Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mobile Scenarios Drawer Trigger */}
        <div className="relative xl:hidden">
          <button
            type="button"
            onClick={() => setScenariosOpen(!scenariosOpen)}
            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 cursor-pointer"
            title="Operational Test Scenarios"
          >
            <span className="material-symbols-outlined text-[18px] text-amber-500">science</span>
            <span className="hidden sm:inline">Tests</span>
          </button>

          {scenariosOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 text-xs flex flex-col gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Operational Scenarios
              </span>
              <button
                type="button"
                onClick={() => {
                  toggleStaleScenario();
                  setScenariosOpen(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-50 font-bold text-slate-800 flex items-center justify-between"
              >
                <span>Stale Telemetry Test</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isStaleScenarioActive ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                  {isStaleScenarioActive ? 'ACTIVE' : 'TEST'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerDoubleBookingDemo();
                  setScenariosOpen(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-50 font-bold text-slate-800 flex items-center justify-between"
              >
                <span>Double-Booking Conflict</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">RUN</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  toggleLiveTracking();
                  setScenariosOpen(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-50 font-bold text-slate-800 flex items-center justify-between"
              >
                <span>Ambulance Live Tracking</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                  {isLiveTrackingActive ? 'ACTIVE' : 'PAUSED'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  isRoadblockActive ? resetRoadblock() : simulateRoadblock();
                  setScenariosOpen(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-50 font-bold text-slate-800 flex items-center justify-between"
              >
                <span>Roadblock Alternate Route</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-bold">
                  {isRoadblockActive ? 'RESET' : 'TEST'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Role Switcher Pill */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setRole('dispatcher')}
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              role === 'dispatcher'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dispatcher
          </button>
          <button
            type="button"
            onClick={() => setRole('hospital')}
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              role === 'hospital'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hospital Staff
          </button>
        </div>

        {/* Firestore Cloud Sync Indicator */}
        <div
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold"
          title="Google Firebase Auth & Firestore live data persistence"
        >
          <span className={`w-2 h-2 rounded-full bg-emerald-500 ${isFirestoreSyncing ? 'animate-spin' : 'animate-pulse'}`}></span>
          <span className="hidden lg:inline">FIRESTORE SYNC</span>
        </div>

        {/* User Profile Avatar with Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200 shadow-xs cursor-pointer hover:bg-blue-200 transition-colors overflow-hidden"
            title="User Profile & Google Auth"
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-[20px]">person</span>
            )}
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 text-xs">
              <div className="px-4 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-slate-900 truncate">
                    {user?.displayName || (role === 'dispatcher' ? 'Cpt. S. Vance' : 'Dr. H. Vance, MD')}
                  </p>
                  {user && (
                    <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded">
                      Google
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-[11px] font-mono truncate">
                  {user?.email || (role === 'dispatcher' ? 'vance.dispatcher@goldenminutes.ems' : 'h.vance.md@mercygeneral.org')}
                </p>
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-1">
                  Role: {role === 'dispatcher' ? 'Lead CAD Dispatcher' : 'Emergency Intake Lead'}
                </p>
              </div>

              {!user && (
                <div className="px-4 py-2 border-b border-slate-100">
                  <button
                    type="button"
                    onClick={async () => {
                      setProfileOpen(false);
                      try {
                        await signInWithGoogle();
                      } catch {
                        // Handled in AuthContext
                      }
                    }}
                    className="w-full py-1.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">login</span>
                    Sign in with Google
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate('/login');
                }}
                className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-slate-500">switch_account</span>
                Switch Station / Gateway
              </button>

              {user && (
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    signOutUser();
                  }}
                  className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  Sign Out from Google
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
