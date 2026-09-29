import React, { useState } from 'react';
import { SurgeAlertCard } from '../../components/hospital/SurgeAlertCard';
import { calculateSurgePredictions } from '../../utils/mlSurgePrediction';
import { useEMS } from '../../context/EMSContext';
import { SurgeScenarioPreset } from '../../types';

export const Predictions: React.FC = () => {
  const { emergencies, addToast } = useEMS();
  const [scenario, setScenario] = useState<SurgeScenarioPreset>('baseline');
  const [isPreStaged, setIsPreStaged] = useState<boolean>(false);

  const activeCadCalls = emergencies.filter((e) => e.status !== 'Handoff Complete').length;
  const surgeData = calculateSurgePredictions(scenario, activeCadCalls, isPreStaged);

  const handlePreStageBeds = () => {
    setIsPreStaged(true);
    addToast('Pre-staged 4 acute beds and alerted Trauma Team Bravo for imminent surge window', 'success');
  };

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white px-6 py-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-xs">
            <span className="material-symbols-outlined text-[28px]">insights</span>
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                ML-Powered Surge Alert & Predictive Inflow Engine
              </h1>
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                LightGBM + Poisson SARIMAX
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              4-Hour Horizon Forecasting with 90% Confidence Bounds • Calibrated on 48,200 Historical Intake Admissions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handlePreStageBeds}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isPreStaged
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isPreStaged ? 'check_circle' : 'bolt'}
            </span>
            <span>{isPreStaged ? 'Staff Pre-Staged' : 'Pre-Stage Capacity'}</span>
          </button>
        </div>
      </div>

      {/* Embedded High-Fidelity Surge Alert Card */}
      <SurgeAlertCard />

      {/* ML Model Performance & Feature Weights Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Model Accuracy Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Model Goodness-of-Fit
              </span>
              <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">0.942</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                R² Score
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Mean Absolute Error (MAE): <strong className="text-slate-800">1.28 patients/hour</strong> across cross-validated test splits.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
            TRAINING N: 48,200 ENCOUNTERS (52 WEEKS)
          </div>
        </div>

        {/* Feature Importance Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Feature Weights Breakdown
              </span>
              <span className="material-symbols-outlined text-[18px] text-blue-600">tune</span>
            </div>
            <div className="space-y-2 mt-2">
              <div>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-slate-600 font-medium">Diurnal Circadian Rhythm</span>
                  <span className="font-bold text-slate-900">38%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '38%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-slate-600 font-medium">Live CAD Catchment Telemetry</span>
                  <span className="font-bold text-slate-900">26%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '26%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-slate-600 font-medium">Day-of-Week Pattern Index</span>
                  <span className="font-bold text-slate-900">18%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '18%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-slate-600 font-medium">Precipitation & Road Hazard</span>
                  <span className="font-bold text-slate-900">11%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '11%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
            NORMALIZED SHAP COEFFICIENTS
          </div>
        </div>

        {/* Step-down Discharge Headroom Balancing Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Discharge Headroom Balance
              </span>
              <span className="material-symbols-outlined text-[18px] text-emerald-600">published_with_changes</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-600 tabular-nums">+6</span>
              <span className="text-xs font-semibold text-slate-600">Discharges Next 90m</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Step-down velocity offsets projected ESI 2/3 arrivals: 2 ICU beds in Neuro PACU + 4 acute obs beds scheduled for discharge.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600">Net Headroom:</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Buffer Positive (+3.2 Beds)
            </span>
          </div>
        </div>
      </div>

      {/* Comprehensive 4-Hour Inflow Matrix Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Detailed 4-Hour Acuity and Bed Headroom Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Hourly arrival estimates cross-referenced with required critical care staff and equipment
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            AUTO-RECALIBRATING EVERY 60S
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Forecast Window</th>
                <th className="pb-3 text-center">Predicted Inflow</th>
                <th className="pb-3 text-center">90% Conf. Bounds</th>
                <th className="pb-3 text-center">Hist. Baseline</th>
                <th className="pb-3 text-center">ESI 1 (Resus)</th>
                <th className="pb-3 text-center">ESI 2 (Emergent)</th>
                <th className="pb-3 text-center">ESI 3 (Urgent)</th>
                <th className="pb-3 text-center">ICU Bays Needed</th>
                <th className="pb-3 text-right">Surge Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {surgeData.predictions.map((p) => (
                <tr key={p.hourOffset} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      <span>+{p.hourOffset}h ({p.timeLabel})</span>
                    </div>
                  </td>
                  <td className="py-3.5 text-center font-extrabold text-sm text-slate-900">
                    {p.predictedCount} pts
                  </td>
                  <td className="py-3.5 text-center font-mono text-slate-500">
                    [{p.confidenceInterval.min} – {p.confidenceInterval.max}]
                  </td>
                  <td className="py-3.5 text-center font-mono text-slate-600 font-semibold">
                    {p.historicalBaseline} pts
                  </td>
                  <td className="py-3.5 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                      {p.acuityBreakdown.esi1Critical}
                    </span>
                  </td>
                  <td className="py-3.5 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200">
                      {p.acuityBreakdown.esi2Emergent}
                    </span>
                  </td>
                  <td className="py-3.5 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                      {p.acuityBreakdown.esi3Urgent}
                    </span>
                  </td>
                  <td className="py-3.5 text-center font-bold text-slate-800">
                    {p.resourceDemand.icuBeds} Bays
                  </td>
                  <td className="py-3.5 text-right">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        p.riskLevel === 'CRITICAL'
                          ? 'bg-rose-600 text-white'
                          : p.riskLevel === 'WARNING'
                          ? 'bg-amber-500 text-white'
                          : p.riskLevel === 'ELEVATED'
                          ? 'bg-blue-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {p.riskLevel}
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
