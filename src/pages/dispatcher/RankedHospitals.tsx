import React, { useState, useEffect } from 'react';
import { useEMS } from '../../context/EMSContext';

export const RankedHospitals: React.FC<{ requestId?: string }> = ({ requestId = 'GM-2048' }) => {
  const {
    emergencies,
    navigate,
    reserveResource,
    confirmHospitalRequest,
    addToast,
    getRankedHospitalsForEmergency,
    isStaleScenarioActive,
    toggleStaleScenario,
  } = useEMS();

  const emergency = emergencies.find((e) => e.id === requestId) || emergencies[0];
  const [countdown, setCountdown] = useState<number>(38);
  const totalSeconds = 60;
  const [dispatchSending, setDispatchSending] = useState<string | null>(null);

  // Door-to-Balloon circular countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const circumference = 2 * Math.PI * 18; // ~113.09
  const offset = circumference - (countdown / totalSeconds) * circumference;

  const rankedHospitals = getRankedHospitalsForEmergency(emergency.id);

  const handleSendDispatch = async (hospitalId: string, hospitalName: string, bed: string) => {
    setDispatchSending(hospitalId);
    addToast(`Dispatching ${emergency.assignedAmbulanceId || 'Medic 04'} to ${hospitalName}...`, 'info');

    try {
      await reserveResource(emergency.id, hospitalId, emergency.requiredResource, bed);
      await confirmHospitalRequest(emergency.id);
      setDispatchSending(null);
      navigate(`/dispatcher/requests/${emergency.id}`);
    } catch (err) {
      console.error(err);
      setDispatchSending(null);
    }
  };

  return (
    <main className="max-w-[1440px] mx-auto p-4 md:p-8 flex flex-col gap-6 select-none">
      {/* CLEAN INCIDENT SUMMARY & COUNTDOWN BANNER */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        {/* Left: Incident Details */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[26px]">vital_signs</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg tracking-wide uppercase">
                REQ #{emergency.id}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
                Level 1 Critical
              </span>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                Unit: <strong className="text-slate-700 font-semibold">{emergency.assignedAmbulanceId || 'Medic 04 (ALS-1)'}</strong>
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              {emergency.condition}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-slate-400 text-[16px]">location_on</span>
                {emergency.location}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-slate-400 text-[16px]">schedule</span>
                Elapsed: {Math.floor(emergency.timeElapsedSeconds / 60)}m {emergency.timeElapsedSeconds % 60}s
              </span>
            </div>
          </div>
        </div>

        {/* Right: Vitals Pills & Door-to-Balloon Countdown */}
        <div className="flex flex-wrap items-center gap-4 xl:justify-end">
          {/* Key Vitals Pill */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Required Resource</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                {emergency.requiredResource}
              </span>
            </div>
            <div className="h-7 w-px bg-slate-200"></div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Patient Vitals</span>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <span>
                  HR <strong className="text-slate-900 font-extrabold">{emergency.vitals.hr}</strong>
                </span>
                <span className="text-slate-300">|</span>
                <span>
                  BP <strong className="text-slate-900 font-extrabold">{emergency.vitals.bp}</strong>
                </span>
                <span className="text-slate-300">|</span>
                <span>
                  SpO2 <strong className="text-slate-900 font-extrabold">{emergency.vitals.spo2}%</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Clean Protocol Window Countdown */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl px-4 py-2.5 flex items-center gap-3.5 shadow-xs">
            <div className="relative w-11 h-11 flex items-center justify-center">
              <svg className="w-11 h-11 -rotate-90" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="18" fill="transparent" stroke="#bfdbfe" strokeWidth="3.5" />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  fill="transparent"
                  stroke={countdown <= 15 ? '#ef4444' : '#2563eb'}
                  strokeWidth="3.5"
                  strokeDasharray="113"
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <span
                className={`absolute text-xs font-extrabold ${
                  countdown <= 15 ? 'text-rose-600 animate-pulse' : 'text-blue-700'
                }`}
              >
                {countdown}s
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
                Protocol Window
              </span>
              <span className="text-xs font-semibold text-slate-700">Door-to-Balloon Target</span>
            </div>
          </div>
        </div>
      </div>

      {/* STALE TELEMETRY TEST BANNER */}
      {isStaleScenarioActive && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-600 text-[24px]">warning</span>
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                Active Scenario: Stale Data Penalty Demonstration
              </h4>
              <p className="text-xs text-amber-800">
                St. Jude telemetry has not reported for over 300s. Destination ranking engine automatically penalized St. Jude’s data freshness score, dynamically promoting verified facilities with confirmed live feeds.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleStaleScenario}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer whitespace-nowrap"
          >
            Restore Live Telemetry
          </button>
        </div>
      )}

      {/* MAIN 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: DYNAMIC HOSPITAL RANKING CARDS (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Sub-header bar */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">verified</span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                FastTrack Decision Feed
              </span>
              <span className="text-xs font-medium text-slate-400">
                (Ranked by Resource Match • Travel Time • Data Freshness • Reliability)
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-500">{rankedHospitals.length} Facilities Evaluated</span>
          </div>

          {/* DYNAMIC RANKED HOSPITAL CARDS */}
          {rankedHospitals.map((item, idx) => {
            const h = item.hospital;
            const isFirst = idx === 0;
            const isDiversion = h.status === 'Diversion Active';
            const availableCath = h.openCathBays;
            const icuRes = h.resources.find((r) => r.category === 'ICU Beds');
            const availableICU = icuRes ? icuRes.available : 0;

            return (
              <div
                key={h.id}
                className={`bg-white rounded-2xl p-6 shadow-xs relative overflow-hidden transition-all ${
                  isDiversion
                    ? 'border border-rose-200'
                    : isFirst
                    ? 'border-2 border-blue-500/50 shadow-sm'
                    : 'border border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {isFirst && !isDiversion && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-emerald-500"></div>
                )}

                <div className="flex flex-col gap-4">
                  {/* Top Header */}
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-8 h-8 rounded-xl font-extrabold text-sm flex items-center justify-center ${
                          isDiversion
                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                            : isFirst
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        #{idx + 1}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
                            {h.name}
                          </h2>
                          {isFirst && !isDiversion && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold tracking-wide">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>
                              Best Match
                            </span>
                          )}
                          {isDiversion && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                              <span className="material-symbols-outlined text-[14px]">block</span>
                              Diversion Active
                            </span>
                          )}
                          {item.isStale && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold">
                              <span className="material-symbols-outlined text-[13px]">warning</span>
                              Data Stale ({h.lastUpdatedSecondsAgo}s)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                          {h.tier} • {h.address}
                        </p>
                      </div>
                    </div>

                    {/* Score Box */}
                    <div
                      className={`flex items-center gap-3 px-3.5 py-1.5 rounded-xl border ${
                        isDiversion
                          ? 'bg-rose-50 border-rose-100 text-rose-700'
                          : isFirst
                          ? 'bg-blue-50/80 border-blue-100 text-blue-700'
                          : 'bg-slate-50 border-slate-200/60 text-slate-800'
                      }`}
                    >
                      <div className="text-right">
                        <span className="block text-[10px] uppercase font-bold tracking-wider opacity-75">
                          Match Score
                        </span>
                        <span className="text-lg font-extrabold leading-none">{item.score}%</span>
                      </div>
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px]">bolt</span>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Criteria Score Breakdown Strip */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Factors:</span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold">
                      Resource: {item.breakdown.resourceMatch}/40 pts
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-semibold">
                      Transit: {item.breakdown.travelTime}/30 pts
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${item.isStale ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-emerald-50 text-emerald-700'}`}>
                      Freshness: {item.breakdown.dataFreshness}/15 pts {item.isStale ? '(Penalized)' : ''}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                      Reliability: {item.breakdown.reliability}/15 pts
                    </span>
                  </div>

                  {/* Metrics Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/70 border border-slate-200/60 p-3.5 rounded-xl text-xs">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Distance</span>
                      <span className="text-sm font-bold text-slate-900">{h.distanceMiles} mi</span>
                      <span className="text-[11px] text-slate-500">Fastest arterial</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-blue-600">Transit ETA</span>
                      <span className="text-base font-extrabold text-blue-600">{h.currentEtaMinutes} mins</span>
                      <span className="text-[11px] text-emerald-600 font-semibold">Active Traffic Sync</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Target Resource</span>
                      <span className="text-sm font-bold text-emerald-600">
                        {availableCath > 0 ? `${availableCath} Cath Ready` : `${availableICU} ICU Available`}
                      </span>
                      <span className="text-[11px] text-slate-500">{h.onCallCardiologist}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Telemetry Status</span>
                      <span className={`text-sm font-bold ${item.isStale ? 'text-amber-700' : 'text-slate-800'}`}>
                        {item.isStale ? 'Stale Signal' : 'Live Sync'}
                      </span>
                      <span className="text-[11px] text-slate-500">{h.lastUpdatedSecondsAgo}s ago</span>
                    </div>
                  </div>

                  {/* Plain-English Clinical Rationale */}
                  <div
                    className={`rounded-xl p-3.5 flex items-start gap-2.5 text-xs ${
                      isDiversion
                        ? 'bg-rose-50 border border-rose-100 text-rose-800'
                        : item.isStale
                        ? 'bg-amber-50 border border-amber-200 text-amber-900'
                        : 'bg-blue-50/50 border border-blue-100 text-slate-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] mt-0.5 flex-shrink-0">
                      {isDiversion ? 'block' : item.isStale ? 'warning' : 'auto_awesome'}
                    </span>
                    <div>
                      <strong className="font-semibold">Clinical Matching Insight: </strong>
                      <span>{item.notes} </span>
                      {item.stalenessWarning && <span className="font-bold underline">{item.stalenessWarning}</span>}
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <span className={`w-2 h-2 rounded-full ${item.isStale ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                      {item.isStale ? 'Telemetry delayed' : 'Verified Direct CAD link'}
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => navigate(`/dispatcher/hospitals/${h.id}`)}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Facility Details
                      </button>

                      {!isDiversion ? (
                        <button
                          onClick={() => handleSendDispatch(h.id, h.name, availableCath > 0 ? 'Cath Lab 01' : 'ICU Bed #08')}
                          disabled={dispatchSending === h.id}
                          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                        >
                          {dispatchSending === h.id ? (
                            <span>Reserving...</span>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[18px]">send</span>
                              <span>Reserve & Dispatch</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => addToast('Clinical override requires Medical Director CAD authorization.', 'warning')}
                          className="px-4 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Request Override
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* WHY THIS RANKING? TRANSPARENT SCORING WEIGHT */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[20px]">tune</span>
              <h3 className="text-sm font-bold text-slate-900">Multi-Criteria Destination Ranking Weights</h3>
            </div>
            <p className="text-xs text-slate-500">
              GoldenMinutes ranks destinations dynamically based on clinical necessity, confirmed operational capacity, travel ETA, and data freshness.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>Resource Match</span>
                  <span className="text-blue-700">40%</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Confirmed available cath bay or ICU resuscitation space</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>Travel Time / ETA</span>
                  <span className="text-blue-700">30%</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Real-time green corridor routing & traffic delays</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>Data Freshness</span>
                  <span className="text-blue-700">15%</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Penalizes stale data (&gt;60s) to prevent diverted arrivals</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>Facility Reliability</span>
                  <span className="text-blue-700">15%</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Historical acceptance rate and staff turnaround</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT RAIL: ROUTE PREVIEW & BENCHMARKS (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Spatial Route Trace */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">explore</span>
                <h3 className="text-sm font-bold text-slate-900">Spatial Route Trace</h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Live GPS</span>
            </div>

            {/* Bright map view thumbnail */}
            <div className="relative w-full h-52 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCrdD06e93cuo77hepK-yV2S7K34llsPnE250ai7MOyIKI_8TM1HtBtTJ_x64Y9HdXZsgFJShYu99wPQcADZqJAEr19S5yccFK_QTIocuWoiVeC8cOiaWCqJ9aC9dXgLEodpyqYRkVAPc3OBTszmWeytZExJNCe0Z0M62Zjmd3_UIC8KRwWGvRKKIJDFeeMEvQTGd5QAkpTZqASg9qm7ngBJvN029Mzm2H2SAO5yy4Qto_ivtA_j8wQ')",
                  filter: 'saturate(1.1) brightness(1.05)',
                }}
              ></div>
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-slate-200/80 shadow-xs flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                <div>
                  <span className="font-bold text-slate-800">Medic 04</span>
                  <span className="text-slate-500 text-[10px] ml-1">42 mph</span>
                </div>
              </div>
              <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-blue-200 shadow-xs flex items-center gap-2 text-xs">
                <span className="material-symbols-outlined text-blue-600 text-[16px]">local_hospital</span>
                <div>
                  <span className="font-bold text-blue-700">Top Candidate</span>
                  <span className="text-slate-500 text-[10px] ml-1">{rankedHospitals[0]?.hospital.name.slice(0, 14)}...</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
              <span className="flex items-center gap-1 text-slate-600 font-medium">
                <span className="material-symbols-outlined text-blue-600 text-[16px]">traffic</span>
                Green Corridor Priority Active
              </span>
              <span className="text-[11px]">Direct Transit</span>
            </div>
          </div>

          {/* Door-to-Balloon Benchmark Matrix */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Door-to-Balloon Benchmark</h3>
              <span className="text-[11px] font-bold text-slate-500">Target &lt; 90 min</span>
            </div>

            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">St. Jude Emergency</span>
                  <span className="font-extrabold text-blue-600">28 min (Optimal)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '32%' }}></div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">Mercy General</span>
                  <span className="font-semibold text-slate-600">42 min</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-slate-400 h-full rounded-full" style={{ width: '48%' }}></div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">Univ Sciences</span>
                  <span className="font-semibold text-slate-500">54 min</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-slate-300 h-full rounded-full" style={{ width: '62%' }}></div>
                </div>
              </div>
            </div>

            {/* Specialist coverage status */}
            <div className="mt-1 bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex flex-col gap-2 text-xs">
              <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wide">
                On-Call Cardiologist Status
              </span>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Interventionalist:</span>
                <span className="font-bold text-emerald-600">In-Hospital (St. Jude)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Cath Surgical Backup:</span>
                <span className="font-semibold text-slate-800">Confirmed Ready</span>
              </div>
            </div>

            {/* Test Trigger Button */}
            <button
              type="button"
              onClick={toggleStaleScenario}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-amber-600">science</span>
              <span>{isStaleScenarioActive ? 'Disable Stale Data Test' : 'Test Stale Data Scenario'}</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};
