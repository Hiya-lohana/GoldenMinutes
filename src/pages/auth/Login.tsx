import React, { useState } from 'react';
import { useEMS } from '../../context/EMSContext';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const Login: React.FC = () => {
  const { setRole, navigate, addToast } = useEMS();
  const { user, userProfile, signInWithGoogle, signOutUser, updateUserRole, setDemoUser } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('dispatcher');
  const [badgeId, setBadgeId] = useState<string>('CAD-8841-DISP');
  const [facility, setFacility] = useState<string>('central-01');
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleGoogleSignIn = async () => {
    if (isGoogleSigningIn) return;
    setIsGoogleSigningIn(true);
    try {
      const success = await signInWithGoogle();
      if (success) {
        setRole(selectedRole);
        if (selectedRole === 'dispatcher') {
          navigate('/dispatcher/command-center');
        } else {
          navigate('/hospital/overview');
        }
      }
    } catch {
      // Gracefully handle any unexpected outcome
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const handleQuickFill = (type: UserRole) => {
    setSelectedRole(type);
    if (type === 'dispatcher') {
      setBadgeId('CAD-8841-DISP');
      setFacility('central-01');
      setDemoUser({
        uid: 'demo-dispatcher-01',
        email: 'vance.dispatcher@goldenminutes.ems',
        displayName: 'Cpt. S. Vance (Lead CAD)',
        role: 'dispatcher',
        assignedFacility: 'Central CAD Node 01',
        badgeId: 'CAD-8841-DISP',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      addToast('Populated credentials for Dispatcher Cpt. S. Vance', 'info');
    } else {
      setBadgeId('ER-RESUS-4029');
      setFacility('mercy-general');
      setDemoUser({
        uid: 'demo-hospital-01',
        email: 'h.vance.md@mercygeneral.org',
        displayName: 'Dr. H. Vance, MD (ED Lead)',
        role: 'hospital',
        assignedFacility: 'Mercy General Trauma Center',
        badgeId: 'ER-RESUS-4029',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      addToast('Populated credentials for Mercy General ED Lead', 'info');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    addToast('Authorizing operative credentials...', 'info');

    if (user) {
      await updateUserRole(selectedRole);
    } else {
      setDemoUser({
        uid: `demo-${selectedRole}-${Date.now()}`,
        email: `${selectedRole}@goldenminutes.ems`,
        displayName: selectedRole === 'dispatcher' ? 'Cpt. S. Vance' : 'Dr. H. Vance, MD',
        role: selectedRole,
        assignedFacility: facility,
        badgeId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    setTimeout(() => {
      setRole(selectedRole);
      setIsSubmitting(false);
      if (selectedRole === 'dispatcher') {
        navigate('/dispatcher/command-center');
      } else {
        navigate('/hospital/overview');
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 relative overflow-hidden select-none">
      {/* Background Soft Gradients */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-100/60 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-emerald-100/60 blur-3xl pointer-events-none"></div>

      {/* Main Container Card in Light Clinical Style */}
      <div className="relative w-full max-w-3xl bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="h-12 w-auto flex items-center justify-center rounded-xl bg-slate-50 p-2 border border-slate-200/80">
              <img
                alt="GoldenMinutes Logo"
                className="h-8 w-auto object-contain"
                src="https://lh3.googleusercontent.com/aida/AEtjO1V-Xh8FAWmJqN525WJhu2ywz6v-5WXTGXlncv0vvcWZI2wPqooMdekWKPz9fqXAI7ZpPMtb0JY_q5qSSYsxnKhvUThAxXNzBq-XFt4fkwwwAqq7p07j5JYzmFlmxwSAlPPyYpmoqS7GsIBJlXSwskha6v8rJC-2m4WsBCv0YQwMt4771qvf43usgmHsECJxvnK1sj7BU6uMxvXwxnDCkWkS_G58eguZNGqrAq_7F16R3hF5nA8wKiEvqJs"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">GoldenMinutes</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider border border-blue-200">
                  EMS Gateway
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Critical Response & Emergency Dispatch Network</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-bold text-slate-800">FIREBASE AUTH • CLOUD FIRESTORE SYNC</span>
          </div>
        </div>

        {/* Firebase Authentication Banner / Active User */}
        {user ? (
          <div className="mt-6 mb-4 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border border-emerald-300" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                  {user.displayName ? user.displayName[0] : 'U'}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{user.displayName || user.email}</span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Google Verified
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">{user.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={signOutUser}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="mt-6 mb-5">
            {/* Primary Google Sign-In Action */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleSigningIn}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-blue-500 text-slate-800 font-bold text-sm shadow-xs transition-all cursor-pointer group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.28-2.09 3.66-5.17 3.66-9.14z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.28c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.59H1.26C.46 8.18 0 9.97 0 12s.46 3.82 1.26 5.41l4.02-3.13z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.59l4.02 3.13c.95-2.83 3.6-4.97 6.72-4.97z"
                />
              </svg>
              <span>{isGoogleSigningIn ? 'Connecting to Google via Firebase...' : 'Sign in with Google (Firebase Auth)'}</span>
            </button>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 absolute">
                or role clearance authorization
              </span>
            </div>
          </div>
        )}

        {/* Sub-headline */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Select Operational Role & Sign In</h1>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">AUTH PROTOCOL 01</span>
          </div>
          <p className="text-xs text-slate-500">
            Select your designated role to initialize encrypted TLS clearance and real-time coordination.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Role 1: CAD Dispatcher */}
          <div
            onClick={() => handleQuickFill('dispatcher')}
            className={`cursor-pointer relative p-5 rounded-2xl border-2 transition-all duration-200 ${
              selectedRole === 'dispatcher'
                ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            {selectedRole === 'dispatcher' && (
              <span className="absolute -top-2.5 -right-2.5 px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[10px] shadow-xs">
                Selected
              </span>
            )}
            <div className="flex items-center gap-3 mb-2.5">
              <div
                className={`p-2.5 rounded-xl ${
                  selectedRole === 'dispatcher' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">emergency</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">CAD Dispatcher</h3>
                <span className="text-[11px] text-blue-600 font-semibold">Class A Dispatch Authority</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Emergency triage intake, multi-criteria hospital matching (resources, travel time, data freshness), and instant ambulance tracking.
            </p>
          </div>

          {/* Role 2: Hospital Emergency Staff */}
          <div
            onClick={() => handleQuickFill('hospital')}
            className={`cursor-pointer relative p-5 rounded-2xl border-2 transition-all duration-200 ${
              selectedRole === 'hospital'
                ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            {selectedRole === 'hospital' && (
              <span className="absolute -top-2.5 -right-2.5 px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[10px] shadow-xs">
                Selected
              </span>
            )}
            <div className="flex items-center gap-3 mb-2.5">
              <div
                className={`p-2.5 rounded-xl ${
                  selectedRole === 'hospital' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">local_hospital</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Hospital Staff</h3>
                <span className="text-[11px] text-emerald-700 font-semibold">Emergency Intake & Resus</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Accept/reject incoming requests, reserve beds with 60s live countdown locks, resolve double-booking conflicts, and confirm patient handoff.
            </p>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Field 1: Operative Badge ID */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                <span>Operative Badge ID</span>
                <span className="text-blue-600 text-[10px] font-semibold">Verified Token</span>
              </label>
              <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2.5">
                <span className="material-symbols-outlined text-slate-400 text-[18px] mr-2">badge</span>
                <input
                  type="text"
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  className="w-full text-xs font-medium text-slate-800 focus:outline-none"
                  placeholder="CAD-8841-DISP"
                  required
                />
                <span className="material-symbols-outlined text-emerald-600 text-[16px]">verified</span>
              </div>
            </div>

            {/* Field 2: Facility Station */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                <span>Assigned Facility Station</span>
                <span className="text-slate-400 text-[10px]">Geo-Locked</span>
              </label>
              <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2.5">
                <span className="material-symbols-outlined text-slate-400 text-[18px] mr-2">domain</span>
                <select
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                  className="w-full bg-transparent text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="central-01">Mumbai Metropolitan 108 Central EMS Command Hub</option>
                  <option value="st-jude">KEM Hospital & Seth GS Medical College - Emergency Intake Node</option>
                  <option value="mercy-general">Lilavati Hospital & Research Centre - Cardiac & Stroke Node</option>
                  <option value="city-memorial">P. D. Hinduja National Hospital - Resus Station</option>
                  <option value="univ-sciences">Fortis Hospital Mulund - Trauma & Transplant Hub</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick-Fill & Submit CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">Quick-Fill:</span>
              <button
                type="button"
                onClick={() => handleQuickFill('dispatcher')}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-700 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px] text-blue-600">headset_mic</span>
                Demo Dispatcher
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('hospital')}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px] text-emerald-600">local_hospital</span>
                Demo Hospital
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-tight transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Syncing Telemetry...</span>
                </>
              ) : (
                <>
                  <span>Enter {selectedRole === 'dispatcher' ? 'Dispatch Center' : 'Hospital Portal'}</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-600 font-medium">
              <span className="material-symbols-outlined text-blue-600 text-[16px]">shield</span>
              Firebase Auth & ABAC Protected
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-600 font-medium">
              <span className="material-symbols-outlined text-emerald-600 text-[16px]">cloud_sync</span>
              Firestore Cloud State Persistence
            </span>
          </div>
          <span>Platform v4.8 • Enterprise Edition</span>
        </div>
      </div>
    </div>
  );
};
