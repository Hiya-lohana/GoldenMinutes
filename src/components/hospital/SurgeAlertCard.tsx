import React, { useState } from 'react';
import { SurgeAlertLevel, SurgeScenarioPreset } from '../../types';
import { calculateSurgePredictions } from '../../utils/mlSurgePrediction';
import { useEMS } from '../../context/EMSContext';

interface SurgeAlertCardProps {
  compact?: boolean;
}

export const SurgeAlertCard: React.FC<SurgeAlertCardProps> = ({ compact = false }) => {
  const { emergencies, navigate, addToast } = useEMS();
  const [scenario, setScenario] = useState<SurgeScenarioPreset>('baseline');
  const [selectedHourOffset, setSelectedHourOffset] = useState<number>(2); // Default to peak hour
  const [isPreStaged, setIsPreStaged] = useState<boolean>(false);

  const activeCadCalls = emergencies.filter((e) => e.status !== 'Handoff Complete').length;
  const surgeState = calculateSurgePredictions(scenario, activeCadCalls, isPreStaged);

  const selectedHour =
    surgeState.predictions.find((p) => p.hourOffset === selectedHourOffset) || surgeState.predictions[0];

  const handlePreStage = () => {
    setIsPreStaged(true);
    addToast(
      `Pre-staged 4 acute beds and pre-notified Trauma Team Bravo for +2h peak (${surgeState.predictedPeakInflow} pts/hr)`,
      'success'
    );
  };

  const getAlertBadge = (level: SurgeAlertLevel) => {
    switch (level) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-50 border-rose-300 text-rose-800',
          badge: 'bg-rose-600 text-white',
          pulse: 'bg-rose-500',
          icon: 'crisis_alert',
          label: 'CRITICAL SURGE IMMINENT',
          subtext: 'Inflow exceeds facility maximum processing ceiling (18 pts/hr)',
        };
      case 'WARNING':
        return {
          bg: 'bg-amber-50 border-amber-300 text-amber-900',
          badge: 'bg-amber-600 text-white',
          pulse: 'bg-amber-500',
          icon: 'warning',
          label: 'HIGH SURGE WARNING',
          subtext: 'Inflow approaching 92% resuscitation bay turnover buffer',
        };
      case 'ELEVATED':
        return {
          bg: 'bg-blue-50 border-blue-200 text-blue-900',
          badge: 'bg-blue-600 text-white',
          pulse: 'bg-blue-500',
          icon: 'trending_up',
          label: 'ELEVATED INFLOW PROJECTED',
          subtext: 'Inflow exceeds seasonal diurnal average by +34%',
        };
      case 'NORMAL':
      default:
        return {
          bg: 'bg-emerald-50/80 border-emerald-200 text-emerald-900',
          badge: 'bg-emerald-600 text-white',
          pulse: 'bg-emerald-500',
          icon: 'verified',
          label: 'NORMAL TEMPO',
          subtext: 'Projected inflow within standard operational headroom',
        };
    }
  };

  const badgeConfig = getAlertBadge(surgeState.currentLevel);

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all ${compact ? 'p-5' : 'p-6 md:p-7'}`}>
      {/* Top Banner Alert Strip */}
      <div className={`rounded-2xl p-4 md:p-5 border flex flex-col md:flex-row md:items-center justify-between gap-4 ${badgeConfig.bg}`}>
        <div className="flex items-start md:items-center gap-3.5">
          <div className="relative flex-shrink-0 mt-0.5 md:mt-0">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-xs ${badgeConfig.badge}`}>
              <span className="material-symbols-outlined text-[24px]">{badgeConfig.icon}</span>
            </div>
            <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full animate-ping ${badgeConfig.pulse}`}></span>
            <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${badgeConfig.pulse}`}></span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wider uppercase ${badgeConfig.badge}`}>
                {badgeConfig.label}
              </span>
              <span className="text-xs font-bold text-slate-700">
                Peak: <span className="text-slate-900 underline font-extrabold">{surgeState.predictedPeakInflow} Patients/Hour</span> at {surgeState.peakHourLabel}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-600 font-mono font-bold">
                ML CONF: 94.2% (R²=0.942)
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">{badgeConfig.subtext}</p>
          </div>
        </div>

        {/* Action Controls & Simulator */}
        <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
          {!isPreStaged ? (
            <button
              type="button"
              onClick={handlePreStage}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">local_hospital</span>
              <span>Pre-Stage Staff & Bays</span>
            </button>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-emerald-700">check_circle</span>
              <span>Staff & Beds Pre-Staged</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => navigate('/hospital/predictions')}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="View comprehensive statistical breakdown"
          >
            <span>Forecast Deep-Dive</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Main Machine Learning Forecast Visualization Section */}
      <div className="mt-6 flex flex-col gap-6">
        {/* Header with 4-Hour Timeframe & Scenario Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Predicted Patient Inflow • Next 4 Hours
              </h2>
              <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                Poisson + Gradient Boost
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Trained on 52 weeks historical intake (N=48,200) • Cross-referenced with real-time CAD dispatch trajectory
            </p>
          </div>

          {/* Scenario Selector Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200/80">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 hidden lg:inline">
              ML Preset:
            </span>
            <button
              type="button"
              onClick={() => setScenario('baseline')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                scenario === 'baseline'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Baseline
            </button>
            <button
              type="button"
              onClick={() => setScenario('highway_incident')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                scenario === 'highway_incident'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-rose-700'
              }`}
              title="Multi-vehicle arterial collision with acute trauma inflow"
            >
              Highway Pileup
            </button>
            <button
              type="button"
              onClick={() => setScenario('severe_weather')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                scenario === 'severe_weather'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
              title="Storm and fog conditions with +38% road accidents"
            >
              Storm Weather
            </button>
            <button
              type="button"
              onClick={() => setScenario('regional_divert')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                scenario === 'regional_divert'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
              title="St. Jude and Valley Trauma on diversion"
            >
              Neighbor Divert
            </button>
          </div>
        </div>

        {/* 4-Hour Inflow Chart & Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: 4-Hour Interactive Timeline Visualization (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">INFLOW RATE (PATIENTS / HOUR)</span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded bg-blue-600"></span> Predicted
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2.5 h-0.5 bg-slate-400 border border-dashed"></span> Historical Baseline
                </span>
                <span className="flex items-center gap-1 text-rose-600 font-bold">
                  <span className="w-2.5 h-0.5 bg-rose-500"></span> Capacity Ceiling (18)
                </span>
              </div>
            </div>

            {/* Custom Interactive SVG Chart */}
            <div className="w-full bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 relative">
              <svg className="w-full h-48 select-none" viewBox="0 0 600 170" fill="none">
                {/* Horizontal Grid lines */}
                <line x1="35" y1="20" x2="580" y2="20" stroke="#e2e8f0" strokeDasharray="3 3" />
                <text x="25" y="24" fontSize="10" fill="#94a3b8" textAnchor="end">25</text>

                {/* Capacity Threshold Line at 18 patients */}
                {/* 25 max -> y = 20, 0 min -> y = 140. 18 -> y = 20 + (25-18)/25 * 120 = 20 + 33.6 = 54 */}
                <line x1="35" y1="54" x2="580" y2="54" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 4" />
                <text x="585" y="58" fontSize="9" fill="#e11d48" fontWeight="bold">CAPACITY (18)</text>

                <line x1="35" y1="80" x2="580" y2="80" stroke="#e2e8f0" strokeDasharray="3 3" />
                <text x="25" y="84" fontSize="10" fill="#94a3b8" textAnchor="end">12</text>

                <line x1="35" y1="140" x2="580" y2="140" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="25" y="144" fontSize="10" fill="#94a3b8" textAnchor="end">0</text>

                {/* Shaded 90% Confidence Interval Band */}
                {(() => {
                  const xPositions = [100, 230, 360, 490];
                  const pointsTop = surgeState.predictions.map((p, i) => {
                    const y = 140 - Math.min(p.confidenceInterval.max / 25, 1) * 120;
                    return `${xPositions[i]},${y}`;
                  });
                  const pointsBottom = surgeState.predictions.slice().reverse().map((p, i) => {
                    const originalIdx = 3 - i;
                    const y = 140 - Math.min(p.confidenceInterval.min / 25, 1) * 120;
                    return `${xPositions[originalIdx]},${y}`;
                  });
                  const polygonPoints = `${pointsTop.join(' ')} ${pointsBottom.join(' ')}`;
                  return (
                    <polygon
                      points={polygonPoints}
                      fill="#bfdbfe"
                      fillOpacity="0.35"
                    />
                  );
                })()}

                {/* Historical Baseline Line */}
                {(() => {
                  const xPositions = [100, 230, 360, 490];
                  const pathD = surgeState.predictions.map((p, i) => {
                    const y = 140 - Math.min(p.historicalBaseline / 25, 1) * 120;
                    return `${i === 0 ? 'M' : 'L'} ${xPositions[i]} ${y}`;
                  }).join(' ');
                  return (
                    <path
                      d={pathD}
                      stroke="#94a3b8"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      fill="none"
                    />
                  );
                })()}

                {/* Machine Learning Predicted Inflow Curve */}
                {(() => {
                  const xPositions = [100, 230, 360, 490];
                  const pathD = surgeState.predictions.map((p, i) => {
                    const y = 140 - Math.min(p.predictedCount / 25, 1) * 120;
                    return `${i === 0 ? 'M' : 'L'} ${xPositions[i]} ${y}`;
                  }).join(' ');
                  return (
                    <path
                      d={pathD}
                      stroke="#2563eb"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  );
                })()}

                {/* Data Points and Column Highlights */}
                {surgeState.predictions.map((p, i) => {
                  const xPositions = [100, 230, 360, 490];
                  const x = xPositions[i];
                  const y = 140 - Math.min(p.predictedCount / 25, 1) * 120;
                  const isSelected = selectedHourOffset === p.hourOffset;
                  const isSurge = p.predictedCount >= 18;

                  return (
                    <g
                      key={p.hourOffset}
                      className="cursor-pointer group"
                      onClick={() => setSelectedHourOffset(p.hourOffset)}
                    >
                      {/* Vertical clickable hover band */}
                      <rect
                        x={x - 45}
                        y="15"
                        width="90"
                        height="130"
                        fill={isSelected ? '#3b82f6' : '#64748b'}
                        fillOpacity={isSelected ? '0.08' : '0'}
                        className="group-hover:fill-opacity-5 transition-all"
                        rx="8"
                      />

                      {/* Drop Line */}
                      <line
                        x1={x}
                        y1={y}
                        x2={x}
                        y2="140"
                        stroke={isSelected ? '#3b82f6' : '#cbd5e1'}
                        strokeWidth={isSelected ? '2' : '1'}
                        strokeDasharray={isSelected ? undefined : '2 2'}
                      />

                      {/* Node Circle */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? '7' : '5'}
                        fill={isSurge ? '#ef4444' : '#2563eb'}
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        className="transition-all"
                      />

                      {/* Value Bubble above node */}
                      <rect
                        x={x - 18}
                        y={y - 25}
                        width="36"
                        height="18"
                        rx="4"
                        fill={isSurge ? '#dc2626' : '#1e40af'}
                        className="shadow-xs"
                      />
                      <text
                        x={x}
                        y={y - 13}
                        fontSize="10"
                        fontWeight="bold"
                        fill="#ffffff"
                        textAnchor="middle"
                      >
                        {p.predictedCount}
                      </text>

                      {/* Time Label on bottom axis */}
                      <text
                        x={x}
                        y="160"
                        fontSize="10"
                        fontWeight={isSelected ? 'bold' : 'normal'}
                        fill={isSelected ? '#1e293b' : '#64748b'}
                        textAnchor="middle"
                      >
                        {p.timeLabel}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* 4 Hourly Interactive Selector Cards */}
            <div className="grid grid-cols-4 gap-2">
              {surgeState.predictions.map((p) => {
                const isSelected = selectedHourOffset === p.hourOffset;
                const isSurge = p.predictedCount >= 18;
                const diffVsBase = p.predictedCount - p.historicalBaseline;
                const sign = diffVsBase > 0 ? '+' : '';

                return (
                  <button
                    key={p.hourOffset}
                    type="button"
                    onClick={() => setSelectedHourOffset(p.hourOffset)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? isSurge
                          ? 'border-rose-400 bg-rose-50/70 shadow-xs'
                          : 'border-blue-500 bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        +{p.hourOffset}h Forecast
                      </span>
                      {isSurge && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-xl font-extrabold tabular-nums ${isSurge ? 'text-rose-600' : 'text-slate-900'}`}>
                        {p.predictedCount}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">pts</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                      Base: {p.historicalBaseline} ({sign}{Math.round(diffVsBase)})
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Hour Breakdown & Tactical Action (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50/90 rounded-2xl border border-slate-200/90 p-4 md:p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-blue-600">access_time</span>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Window: {selectedHour.timeLabel}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Detailed Acuity & Capacity Impact Breakdown
                </p>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                  selectedHour.riskLevel === 'CRITICAL'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : selectedHour.riskLevel === 'WARNING'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : selectedHour.riskLevel === 'ELEVATED'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {selectedHour.riskLevel}
              </span>
            </div>

            {/* Acuity Triage Distribution */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Predicted Inflow by Triage Acuity (ESI)
              </span>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-rose-700">
                    <span className="w-2.5 h-2.5 rounded bg-rose-600"></span>
                    ESI 1 (Resus / Code Red)
                  </span>
                  <span className="font-bold text-slate-800">
                    {selectedHour.acuityBreakdown.esi1Critical} patients ({Math.round((selectedHour.acuityBreakdown.esi1Critical / selectedHour.predictedCount) * 100)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-amber-700">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
                    ESI 2 (Emergent / STEMI / Stroke)
                  </span>
                  <span className="font-bold text-slate-800">
                    {selectedHour.acuityBreakdown.esi2Emergent} patients ({Math.round((selectedHour.acuityBreakdown.esi2Emergent / selectedHour.predictedCount) * 100)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-blue-700">
                    <span className="w-2.5 h-2.5 rounded bg-blue-500"></span>
                    ESI 3 (Urgent Trauma & Fractures)
                  </span>
                  <span className="font-bold text-slate-800">
                    {selectedHour.acuityBreakdown.esi3Urgent} patients ({Math.round((selectedHour.acuityBreakdown.esi3Urgent / selectedHour.predictedCount) * 100)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-slate-600">
                    <span className="w-2.5 h-2.5 rounded bg-slate-400"></span>
                    ESI 4/5 (Standard / Ambulatory)
                  </span>
                  <span className="font-bold text-slate-800">
                    {selectedHour.acuityBreakdown.esi45NonUrgent} patients
                  </span>
                </div>
              </div>

              {/* Stacked Percentage Bar */}
              <div className="w-full h-2 rounded-full overflow-hidden flex mt-2 bg-slate-200">
                <div
                  className="bg-rose-600 h-full"
                  style={{ width: `${(selectedHour.acuityBreakdown.esi1Critical / selectedHour.predictedCount) * 100}%` }}
                ></div>
                <div
                  className="bg-amber-500 h-full"
                  style={{ width: `${(selectedHour.acuityBreakdown.esi2Emergent / selectedHour.predictedCount) * 100}%` }}
                ></div>
                <div
                  className="bg-blue-500 h-full"
                  style={{ width: `${(selectedHour.acuityBreakdown.esi3Urgent / selectedHour.predictedCount) * 100}%` }}
                ></div>
                <div
                  className="bg-slate-400 h-full"
                  style={{ width: `${(selectedHour.acuityBreakdown.esi45NonUrgent / selectedHour.predictedCount) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Projected Resource Headroom Required */}
            <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Required Resource Headroom (+{selectedHour.hourOffset}h)
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-600">Trauma Bays:</span>
                  <strong className="text-rose-700">{selectedHour.resourceDemand.traumaBays} required</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-600">ICU Beds:</span>
                  <strong className="text-blue-700">{selectedHour.resourceDemand.icuBeds} required</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-600">Acute Beds:</span>
                  <strong className="text-slate-800">{selectedHour.resourceDemand.acuteBeds} required</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-600">Ventilators:</span>
                  <strong className="text-slate-800">{selectedHour.resourceDemand.respiratoryVentilators} required</strong>
                </div>
              </div>
            </div>

            {/* Tactical AI / ML Recommendations Checklist */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Tactical Pre-Emptive Protocol
              </span>
              {surgeState.recommendations.slice(0, 3).map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-tight">
                  <span className="material-symbols-outlined text-[16px] text-blue-600 flex-shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
