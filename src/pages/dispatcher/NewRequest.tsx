import React, { useState } from 'react';
import { useEMS } from '../../context/EMSContext';
import { PriorityLevel } from '../../types';

export const NewRequest: React.FC = () => {
  const { createEmergency, navigate } = useEMS();

  const [condition, setCondition] = useState<string>(
    'Acute STEMI anterior wall, severe pulmonary congestion, BP 82/50'
  );
  const [severity, setSeverity] = useState<PriorityLevel>('critical');
  const [requiredResource, setRequiredResource] = useState<string>(
    'Cath Lab (24/7) - Active Team Standby (2 Regional Bays Open)'
  );
  const [locationName, setLocationName] = useState<string>('Eastern Express Highway, Sion Junction, Mumbai');
  const [lat, setLat] = useState<string>('19.0435');
  const [lng, setLng] = useState<string>('72.8615');
  const [assignedAmbulance, setAssignedAmbulance] = useState<string>('MEDIC-04');
  const [directBay, setDirectBay] = useState<boolean>(true);
  const [radioLink, setRadioLink] = useState<boolean>(true);
  const [isolation, setIsolation] = useState<boolean>(false);
  const [bariatric, setBariatric] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Quick chips
  const quickChips = [
    { label: 'STEMI Protocol', val: 'Acute STEMI anterior wall, severe pulmonary congestion, BP 82/50', sev: 'critical' as PriorityLevel },
    { label: 'Trauma MVA', val: 'Multi-vehicle collision on Sea Link, trapped passenger, GCS 7', sev: 'critical' as PriorityLevel },
    { label: 'Stroke Window', val: 'Acute focal neurologic deficit, aphasia, right-sided hemiplegia, onset < 30 min', sev: 'critical' as PriorityLevel },
    { label: 'Status Epilepticus', val: 'Status epilepticus, active generalized seizure > 15m, airway compromised', sev: 'urgent' as PriorityLevel }
  ];

  const handleQuickSelect = (chip: typeof quickChips[0]) => {
    setCondition(chip.val);
    setSeverity(chip.sev);
  };

  const handleGpsRefresh = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(5));
          setLng(pos.coords.longitude.toFixed(5));
          setLocationName('Live GPS Coordinates Acquired (Mumbai)');
        },
        () => {
          const fakeLat = (19.0435 + (Math.random() - 0.5) * 0.01).toFixed(5);
          const fakeLng = (72.8615 + (Math.random() - 0.5) * 0.01).toFixed(5);
          setLat(fakeLat);
          setLng(fakeLng);
          setLocationName('GPS Calibrated • Mumbai Central Corridor');
        }
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const specialReqs: string[] = [];
    if (directBay) specialReqs.push('Direct Bay Entry');
    if (radioLink) specialReqs.push('MD Radio Link');
    if (isolation) specialReqs.push('Isolation Room');
    if (bariatric) specialReqs.push('Bariatric Unit');

    const newId = createEmergency({
      condition,
      priority: severity,
      requiredResource,
      location: locationName,
      coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) },
      specialRequirements: specialReqs
    });

    setTimeout(() => {
      setIsSubmitting(false);
      navigate(`/dispatcher/ranked-hospitals/${newId}`);
    }, 500);
  };

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-8">
      {/* Top Action Strip / Breadcrumb */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-white px-6 py-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-blue-600 font-semibold text-sm">
            <span className="material-symbols-outlined text-[20px]">medical_services</span>
            <span>Emergency Intake</span>
          </div>
          <span className="text-slate-300">/</span>
          <span className="font-mono text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
            INC-2024-8841
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
            Live Intake
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>Intake Stopwatch:</span>
            <span className="font-mono font-bold text-slate-800 text-sm">00:00:27</span>
          </div>
          <div className="h-4 w-px bg-slate-200"></div>
          <button
            type="button"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">history</span>
            Drafts (2)
          </button>
        </div>
      </div>

      {/* Main Layout Grid: Left Form (8 Cols) & Right Rail (4 Cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Primary Intake Form */}
        <form onSubmit={handleSubmit} className="xl:col-span-8 flex flex-col gap-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-7">
            {/* Header Title */}
            <div className="flex flex-col gap-1 pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Protocol 10-A Priority Dispatch
                </span>
                <span className="text-xs font-medium text-slate-400">Step 1 of 2: Medical Assessment</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">New Patient Intake & Hospital Match</h1>
              <p className="text-sm text-slate-500">
                Enter triage indicators to compute optimal golden-hour hospital matching and nearest ambulance clearance.
              </p>
            </div>

            {/* Field 1: Patient Condition & Quick Select Chips */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-900 flex items-center gap-2" htmlFor="patient-condition">
                  <span className="material-symbols-outlined text-blue-600 text-[20px]">monitor_heart</span>
                  Primary Patient Condition
                </label>
                <span className="text-xs font-semibold text-rose-500">Required</span>
              </div>
              <div className="relative">
                <input
                  id="patient-condition"
                  type="text"
                  required
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  placeholder="e.g. Acute myocardial infarction, trauma, unresponsive, severe respiratory distress"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400 shadow-inner"
                />
              </div>

              {/* Quick fill chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-semibold text-slate-400">Quick Select:</span>
                {quickChips.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handleQuickSelect(chip)}
                    className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200/80 text-xs font-medium text-slate-600 transition-all cursor-pointer"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 2: Triage Severity Assessment (3 Distinct Cards) */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[20px]">emergency</span>
                  Triage Severity Assessment
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                    severity === 'critical'
                      ? 'text-rose-600 bg-rose-50 border-rose-200'
                      : severity === 'urgent'
                      ? 'text-amber-600 bg-amber-50 border-amber-200'
                      : 'text-emerald-600 bg-emerald-50 border-emerald-200'
                  }`}
                >
                  {severity === 'critical'
                    ? 'CRITICAL PRIORITY'
                    : severity === 'urgent'
                    ? 'URGENT PRIORITY'
                    : 'STABLE PRIORITY'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Critical Card */}
                <label
                  onClick={() => setSeverity('critical')}
                  className={`relative flex flex-col p-4 rounded-xl border-2 transition-all cursor-pointer shadow-xs ${
                    severity === 'critical'
                      ? 'border-rose-500 bg-rose-50/50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="severity"
                    value="critical"
                    checked={severity === 'critical'}
                    onChange={() => setSeverity('critical')}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                      CRITICAL
                    </span>
                    <span className="material-symbols-outlined text-rose-500 text-[20px]">warning</span>
                  </div>
                  <span className="font-bold text-slate-900 text-sm">Tier 1 • Immediate</span>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Threat to life or limb. Continuous resuscitation or direct cath/trauma intervention.
                  </p>
                </label>

                {/* Urgent Card */}
                <label
                  onClick={() => setSeverity('urgent')}
                  className={`relative flex flex-col p-4 rounded-xl border-2 transition-all cursor-pointer shadow-xs ${
                    severity === 'urgent'
                      ? 'border-amber-500 bg-amber-50/50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="severity"
                    value="urgent"
                    checked={severity === 'urgent'}
                    onChange={() => setSeverity('urgent')}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
                      URGENT
                    </span>
                    <span className="material-symbols-outlined text-amber-500 text-[20px]">notifications_active</span>
                  </div>
                  <span className="font-bold text-slate-900 text-sm">Tier 2 • Emergent</span>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Severe presentation with potential deterioration within 15–30 minutes.
                  </p>
                </label>

                {/* Stable Card */}
                <label
                  onClick={() => setSeverity('stable')}
                  className={`relative flex flex-col p-4 rounded-xl border-2 transition-all cursor-pointer shadow-xs ${
                    severity === 'stable'
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="severity"
                    value="stable"
                    checked={severity === 'stable'}
                    onChange={() => setSeverity('stable')}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white">
                      STABLE
                    </span>
                    <span className="material-symbols-outlined text-emerald-500 text-[20px]">check_circle</span>
                  </div>
                  <span className="font-bold text-slate-900 text-sm">Tier 3 • Routine</span>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Baselines stable. Standard secondary emergency department reception.
                  </p>
                </label>
              </div>
            </div>

            {/* Field 3: Mandated Hospital Resource */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-900 flex items-center gap-2" htmlFor="required-resource">
                  <span className="material-symbols-outlined text-blue-600 text-[20px]">domain</span>
                  Mandated Hospital Resource / Specialty
                </label>
                <span className="text-xs text-slate-400 font-medium">Real-time facility tracking</span>
              </div>
              <div className="relative">
                <select
                  id="required-resource"
                  value={requiredResource}
                  onChange={(e) => setRequiredResource(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-inner cursor-pointer"
                >
                  <option value="Cath Lab (24/7) - Active Team Standby (2 Regional Bays Open)">
                    Cath Lab (24/7) - Active Team Standby (2 Regional Bays Open)
                  </option>
                  <option value="Trauma Bay - Level 1 Resuscitation Center">
                    Trauma Bay - Level 1 Resuscitation Center
                  </option>
                  <option value="ICU Ventilator Bed - Negative Pressure">
                    ICU Ventilator Bed - Negative Pressure
                  </option>
                  <option value="CT / Neuro Angio Biplane Interventional Suite">
                    CT / Neuro Angio Biplane Interventional Suite
                  </option>
                  <option value="Pediatric Intensive Care Unit (PICU)">
                    Pediatric Intensive Care Unit (PICU)
                  </option>
                  <option value="Burn Unit Dedicated Critical Care Bay">
                    Burn Unit Dedicated Critical Care Bay
                  </option>
                </select>
                <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[20px]">
                  expand_more
                </span>
              </div>

              {/* Capability check pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={directBay}
                    onChange={(e) => setDirectBay(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span>Direct Bay Entry</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={radioLink}
                    onChange={(e) => setRadioLink(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span>MD Radio Link</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={isolation}
                    onChange={(e) => setIsolation(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span>Isolation Room</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={bariatric}
                    onChange={(e) => setBariatric(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span>Bariatric Unit</span>
                </label>
              </div>
            </div>

            {/* Field 4: Incident Location & Available Ambulances */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Location / GPS Coordinates */}
              <div className="flex flex-col gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-blue-600 text-[18px]">pin_drop</span>
                    Incident Location
                  </span>
                  <button
                    type="button"
                    onClick={handleGpsRefresh}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md border border-blue-200 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">my_location</span>
                    GPS Refresh
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 uppercase">Latitude</label>
                    <input
                      type="number"
                      step="0.00001"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 uppercase">Longitude</label>
                    <input
                      type="number"
                      step="0.00001"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center gap-2 text-xs text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-medium text-slate-800">{locationName}</span>
                  <span className="text-slate-400 ml-auto">±3m precision</span>
                </div>
              </div>

              {/* Available Ambulances */}
              <div className="flex flex-col gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-blue-600 text-[18px]">ambulance</span>
                    Available Ambulances
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    3 In Range
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    onClick={() => setAssignedAmbulance('MEDIC-04')}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                      assignedAmbulance === 'MEDIC-04'
                        ? 'border-blue-300 bg-blue-50/70'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="assigned_unit"
                        value="MEDIC-04"
                        checked={assignedAmbulance === 'MEDIC-04'}
                        onChange={() => setAssignedAmbulance('MEDIC-04')}
                        className="text-blue-600 focus:ring-blue-600 h-4 w-4"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900">Medic 04 • Paramedic Alpha</span>
                        <span className="text-[11px] text-slate-500">ALS Certified • 2 Crew</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold text-[11px]">0.4 mi</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[11px]">
                        ETA 2m
                      </span>
                    </div>
                  </label>

                  <label
                    onClick={() => setAssignedAmbulance('MEDIC-08')}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                      assignedAmbulance === 'MEDIC-08'
                        ? 'border-blue-300 bg-blue-50/70'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="assigned_unit"
                        value="MEDIC-08"
                        checked={assignedAmbulance === 'MEDIC-08'}
                        onChange={() => setAssignedAmbulance('MEDIC-08')}
                        className="text-blue-600 focus:ring-blue-600 h-4 w-4"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900">Medic 08 • Trauma Squad</span>
                        <span className="text-[11px] text-slate-500">Critical Care Paramedic</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        1.2 mi
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        ETA 5m
                      </span>
                    </div>
                  </label>

                  <label
                    onClick={() => setAssignedAmbulance('MEDIC-12')}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                      assignedAmbulance === 'MEDIC-12'
                        ? 'border-blue-300 bg-blue-50/70'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="assigned_unit"
                        value="MEDIC-12"
                        checked={assignedAmbulance === 'MEDIC-12'}
                        onChange={() => setAssignedAmbulance('MEDIC-12')}
                        className="text-blue-600 focus:ring-blue-600 h-4 w-4"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900">Medic 12 • BLS Support</span>
                        <span className="text-[11px] text-slate-500">Dual EMT • Secondary</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        2.1 mi
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        ETA 8m
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Action Strip */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">verified</span>
                <span>Optimized routing uses real-time traffic and ER saturation index</span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setCondition('');
                    setSeverity('urgent');
                  }}
                  className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-sm font-semibold transition-all cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-tight transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 group cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Matching Regional Hospitals...</span>
                    </>
                  ) : (
                    <>
                      <span>Find & Rank Matching Hospitals</span>
                      <span className="material-symbols-outlined text-[19px] transition-transform group-hover:translate-x-1">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Right Rail / Network Health & Guidelines */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* Dispatch Health & Network Readiness Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">hub</span>
                <h3 className="text-sm font-bold text-slate-900">Regional Network Health</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Standby
              </span>
            </div>

            {/* Friendly Stat Bento */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col">
                <span className="text-xs text-slate-500 font-medium">Available Fleet</span>
                <span className="text-xl font-extrabold text-slate-900 mt-1">
                  8 <span className="text-xs text-slate-400 font-normal">/ 14 units</span>
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1">Ready for dispatch</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col">
                <span className="text-xs text-slate-500 font-medium">Match Calculation</span>
                <span className="text-xl font-extrabold text-slate-900 mt-1">
                  1.4 <span className="text-xs text-slate-400 font-normal">sec</span>
                </span>
                <span className="text-[11px] text-blue-600 font-semibold mt-1">Instant scoring</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col">
                <span className="text-xs text-slate-500 font-medium">Open Cath Labs</span>
                <span className="text-xl font-extrabold text-slate-900 mt-1">
                  2 <span className="text-xs text-slate-400 font-normal">bays</span>
                </span>
                <span className="text-[11px] text-slate-500 font-medium mt-1">Mercy & St. Jude</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col">
                <span className="text-xs text-slate-500 font-medium">Hospital Diverts</span>
                <span className="text-xl font-extrabold text-emerald-600 mt-1">
                  0 <span className="text-xs text-slate-400 font-normal">nodes</span>
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1">100% acceptance</span>
              </div>
            </div>

            {/* Bed Saturation Bar */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-600">Regional Bed Capacity</span>
                <span className="font-bold text-slate-900">68% Utilized</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
                <div className="bg-blue-600 h-full w-[45%]" title="Emergency Beds"></div>
                <div className="bg-amber-400 h-full w-[23%]" title="ICU Beds"></div>
                <div className="bg-emerald-400 h-full w-[32%]" title="Available Beds"></div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span> ED (45%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span> ICU (23%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span> Available (32%)
                </span>
              </div>
            </div>
          </div>

          {/* 3-Point Protocol Checklist */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[20px]">fact_check</span>
              <h3 className="text-sm font-bold text-slate-900">Intake Protocol Checklist</h3>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="material-symbols-outlined text-emerald-600 text-[19px] mt-0.5 shrink-0">
                  check_circle
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">Golden Hour Target</span>
                  <span className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    STEMI and trauma interventions require definitive admission under 60 min.
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="material-symbols-outlined text-emerald-600 text-[19px] mt-0.5 shrink-0">
                  check_circle
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">Direct Diversion Override</span>
                  <span className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Unstable airways automatically bypass divert declarations per medical director.
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="material-symbols-outlined text-emerald-600 text-[19px] mt-0.5 shrink-0">
                  check_circle
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">ECG Telemetry Sync</span>
                  <span className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Real-time 12-lead transmission will auto-stream to the selected Cath coordinator.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Paramedic Lead Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
                <span className="material-symbols-outlined text-[24px]">support_agent</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900">Lt. Sarah Morales, NRP</span>
                <span className="text-[11px] text-slate-500">Lead Paramedic • Unit 04</span>
                <span className="text-[11px] font-semibold text-emerald-600">Radios & Telemetry Synced</span>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
        </div>
      </div>
    </main>
  );
};
