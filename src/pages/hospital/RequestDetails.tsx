import React, { useState } from 'react';
import { useEMS } from '../../context/EMSContext';
import { PriorityBadge, EmergencyStatusBadge, ReservationStatusBadge } from '../../components/common/StatusBadge';
import { VoiceHandoverModal } from '../../components/common/VoiceHandoverModal';

export const RequestDetails: React.FC<{ id?: string }> = ({ id = 'GM-2048' }) => {
  const {
    emergencies,
    hospitals,
    reservations,
    reserveResource,
    confirmHospitalRequest,
    rejectHospitalRequest,
    completeHandoff,
    navigate,
  } = useEMS();

  const emergency = emergencies.find((e) => e.id === id) || emergencies[0];
  const hospital = hospitals.find((h) => h.id === (emergency.assignedHospitalId || 'st-jude')) || hospitals[0];
  const reservation = reservations.find((r) => r.emergencyId === emergency.id);

  const [isHolding, setIsHolding] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [showRawTranscript, setShowRawTranscript] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleHold = () => {
    setIsHolding(true);
    reserveResource(emergency.id, hospital.id, emergency.requiredResource, 'Cath Lab 02');
    setTimeout(() => setIsHolding(false), 400);
  };

  const handleConfirm = () => {
    confirmHospitalRequest(emergency.id);
  };

  const handleReject = () => {
    rejectHospitalRequest(emergency.id, 'Resuscitation Bay capacity saturated');
  };

  // Text-to-Speech audio read-aloud of clinical summary
  const handleReadAloud = (textToRead: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 1.0;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <main className="max-w-5xl mx-auto p-6 md:p-8 flex flex-col gap-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white px-6 py-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/hospital/requests')}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            title="Back to Incoming Queue"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md border border-blue-200">
                #{emergency.id}
              </span>
              <PriorityBadge priority={emergency.priority} size="sm" />
              <EmergencyStatusBadge status={emergency.status} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              Inbound Evaluation & Resource Clearance
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsVoiceModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Dictate or update clinical handover via voice"
          >
            <span className="material-symbols-outlined text-[18px]">mic</span>
            <span>{emergency.handover ? 'Update Voice Handover' : 'Dictate Handover'}</span>
          </button>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <span className="text-xs text-slate-500 font-medium">ETA to Bay:</span>
            <span className="text-base font-extrabold text-blue-600 tabular-nums">
              {emergency.etaMinutes} mins
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* GEMINI AI CLINICAL HANDOVER BRIEFING CARD */}
      {/* ------------------------------------------------------------- */}
      {emergency.handover ? (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-blue-50/40 to-slate-50 border-2 border-indigo-200/90 shadow-sm flex flex-col gap-5 text-xs">
          {/* Handover Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[22px] text-amber-300">auto_awesome</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-black text-indigo-950 tracking-tight">
                    AI Patient Handover Summary
                  </h2>
                  <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-300">
                    Gemini SBAR Structured
                  </span>
                  <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-300">
                    {emergency.handover.acuityLevel || 'Critical (Code Red)'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Dictated by <strong>{emergency.handover.medicName}</strong> ({emergency.handover.ambulanceCallSign}) at {emergency.handover.timestamp} • Model: {emergency.handover.modelUsed || 'gemini-3.1-flash-lite'}
                </p>
              </div>
            </div>

            {/* Read Aloud TTS & Actions */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() =>
                  handleReadAloud(
                    `${emergency.handover?.summary}. Situation: ${emergency.handover?.situation}. Assessment: ${emergency.handover?.assessment}. Recommendations: ${emergency.handover?.recommendations.join(
                      '. '
                    )}`
                  )
                }
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border ${
                  isPlayingAudio
                    ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
                title="Hands-free audio readout of clinical briefing"
              >
                <span className="material-symbols-outlined text-[16px] text-indigo-600">
                  {isPlayingAudio ? 'stop' : 'volume_up'}
                </span>
                <span>{isPlayingAudio ? 'Stop Reading' : 'Read Aloud'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsVoiceModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                title="Re-dictate or adjust summary"
              >
                <span className="material-symbols-outlined text-[16px] text-blue-600">edit</span>
                <span>Re-dictate</span>
              </button>
            </div>
          </div>

          {/* Executive Summary Callout */}
          <div className="p-3.5 rounded-2xl bg-white border border-indigo-200/80 shadow-2xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 block mb-1">
              Executive Briefing for Receiving Physician:
            </span>
            <p className="text-sm font-bold text-slate-900 leading-snug">
              {emergency.handover.summary}
            </p>
          </div>

          {/* SBAR 4-Quadrant Clinical Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Situation */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-rose-600 font-extrabold text-[11px] uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>Situation (S)</span>
              </div>
              <p className="font-bold text-slate-900 leading-snug">{emergency.handover.situation}</p>
            </div>

            {/* Background */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-blue-600 font-extrabold text-[11px] uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span>Background (B)</span>
              </div>
              <p className="text-slate-800 font-medium leading-snug">{emergency.handover.background}</p>
            </div>

            {/* Assessment */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-amber-600 font-extrabold text-[11px] uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Assessment (A)</span>
              </div>
              <p className="text-slate-800 font-medium leading-snug">{emergency.handover.assessment}</p>
            </div>

            {/* Medications Given In-Transit */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-emerald-600 font-extrabold text-[11px] uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Medications & Field Interventions</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                {emergency.handover.interventions.map((med, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]"
                  >
                    <span className="material-symbols-outlined text-[14px] text-emerald-600">medication</span>
                    {med}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations (R) */}
          <div className="p-4 rounded-2xl bg-white border border-purple-200 shadow-2xs">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-700 flex items-center gap-1.5 mb-2">
              <span className="material-symbols-outlined text-[16px] text-purple-600">assignment_turned_in</span>
              <span>Recommendation (R) • Immediate Hospital Preparation Checklist:</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {emergency.handover.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 bg-purple-50/60 p-2.5 rounded-xl border border-purple-100 text-purple-950">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="font-semibold text-xs leading-snug">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Accordion: View Verbatim Paramedic Voice Dictation */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowRawTranscript(!showRawTranscript)}
              className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                {showRawTranscript ? 'expand_less' : 'expand_more'}
              </span>
              <span>{showRawTranscript ? 'Hide Paramedic Raw Audio Dictation' : 'View Verbatim Paramedic Voice Dictation Transcript'}</span>
            </button>

            {showRawTranscript && (
              <div className="mt-2.5 p-3.5 rounded-2xl bg-white border border-slate-200 font-mono text-[11px] text-slate-700 leading-relaxed shadow-inner">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 font-sans">
                  Raw Voice-to-Text Transcription:
                </span>
                "{emergency.handover.transcript}"
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty State / Call to Action to dictate handover */
        <div className="p-6 rounded-3xl bg-blue-50/60 border border-blue-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">record_voice_over</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Awaiting Inbound Voice Handover Summary</h3>
              <p className="text-slate-500 mt-0.5">
                The ambulance crew can dictate a short verbal handover in transit. Gemini will structure it into an SBAR briefing here.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsVoiceModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[16px]">mic</span>
            <span>Dictate Handover Now</span>
          </button>
        </div>
      )}

      {/* Patient & Incident Info */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-5 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">Patient Presentation & Telemetry</h2>
          <span className="text-slate-400 font-mono">CAD Sync: Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">CHIEF COMPLAINT</span>
            <p className="font-bold text-slate-900 text-sm leading-snug">{emergency.condition}</p>
            <p className="text-slate-600 mt-1">{emergency.vitals.notes}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">TRANSMITTED FIELD VITALS</span>
            <div className="grid grid-cols-3 gap-2 text-center my-2">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 text-[10px] block">HEART RATE</span>
                <span className="font-extrabold text-slate-900 text-sm">{emergency.vitals.hr} BPM</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 text-[10px] block">NIBP</span>
                <span className="font-extrabold text-slate-900 text-sm">{emergency.vitals.bp}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 text-[10px] block">SpO2</span>
                <span className="font-extrabold text-blue-700 text-sm">{emergency.vitals.spo2}%</span>
              </div>
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              12-Lead ECG Synchronized with Hospital PACS
            </span>
          </div>
        </div>

        {/* RESOURCE CHECK SECTION */}
        <div className="pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Facility Resource Verification
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5">
              <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
              <div>
                <span className="font-bold text-emerald-900 block">Cath Lab Available</span>
                <span className="text-[11px] text-emerald-700">Bay 02 pre-cleared</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5">
              <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
              <div>
                <span className="font-bold text-emerald-900 block">Ventilator Bed Ready</span>
                <span className="text-[11px] text-emerald-700">3 units in respiratory pool</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5">
              <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
              <div>
                <span className="font-bold text-emerald-900 block">Emergency Resus Staff</span>
                <span className="text-[11px] text-emerald-700">Team Alpha on standby</span>
              </div>
            </div>
          </div>
        </div>

        {/* RESOURCE RESERVATION BOX */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col gap-4 mt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[20px]">meeting_room</span>
              <span className="font-bold text-slate-900 text-sm">Resuscitation Slot: Cath Lab 02</span>
            </div>
            {reservation ? (
              <ReservationStatusBadge status={reservation.status} />
            ) : (
              <ReservationStatusBadge status="AVAILABLE" />
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-200/60">
            {(!reservation || reservation.status === 'AVAILABLE') && (
              <>
                <p className="text-slate-600">
                  Resource is currently uncommitted. Place a 60-second operational hold while conferring with the attending physician.
                </p>
                <button
                  onClick={handleHold}
                  disabled={isHolding}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer whitespace-nowrap"
                >
                  Hold Resource (60s)
                </button>
              </>
            )}

            {reservation && reservation.status === 'HELD' && (
              <>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                  <span className="font-bold text-amber-900">
                    HOLD ACTIVE • Expires in 00:{reservation.expiresInSeconds < 10 ? '0' : ''}{reservation.expiresInSeconds}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleConfirm}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm shadow-emerald-500/20 cursor-pointer"
                  >
                    Confirm & Accept
                  </button>
                  <button
                    onClick={handleReject}
                    className="px-4 py-2.5 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Decline / Divert
                  </button>
                </div>
              </>
            )}

            {reservation && reservation.status === 'CONFIRMED' && (
              <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  CONFIRMED • Reserved for Emergency #{emergency.id} ({emergency.assignedAmbulanceId})
                </span>
                <div className="flex items-center gap-2">
                  {emergency.status !== 'Handoff Complete' ? (
                    <button
                      type="button"
                      onClick={() => {
                        completeHandoff(emergency.id);
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                      <span>Accept Patient Handoff</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                      ✓ Handoff Complete
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Voice Handover Modal */}
      <VoiceHandoverModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        emergencyId={emergency.id}
      />
    </main>
  );
};

export default RequestDetails;
