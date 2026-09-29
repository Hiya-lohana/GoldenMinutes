import { Hospital, Ambulance, EmergencyRequest, Reservation, ActivityEvent, HistoricalEmergency } from '../types';

export const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: 'st-jude',
    name: 'KEM Hospital & Seth GS Medical College',
    tier: 'Level 1 Apex Municipal Trauma & Cardiac Center',
    address: 'Acharya Donde Marg, Parel, Mumbai, Maharashtra 400012',
    distanceMiles: 1.5, // 2.4 km
    baseEtaMinutes: 6,
    currentEtaMinutes: 6,
    status: 'Online',
    cadScore: 98,
    lastUpdatedSecondsAgo: 12,
    specialties: ['Cath Lab 24/7 (Bays 1-3)', 'Apex Level 1 Trauma', 'Comprehensive Stroke Center', 'Neuro-Intervention'],
    openCathBays: 2,
    traumaBaysAvailable: 3,
    onCallCardiologist: 'In-Hospital (Dr. Rajesh Sharma, MD, DM)',
    onCallTraumaSurgeon: 'Dr. Ananya Deshmukh, MS (On-Site Lead)',
    activeRequestsCount: 2,
    reliability: {
      overall: 'High',
      acceptanceRate: 98.6,
      avgResponseSeconds: 16,
      availabilityAccuracy: 99.2,
      monthlyTrend: '+3.4% volume clearance'
    },
    resources: [
      { id: 'kem-icu', name: 'ICU Beds (Cardiac & Trauma)', category: 'ICU Beds', available: 6, reserved: 1, occupied: 22, maintenance: 0 },
      { id: 'kem-ed', name: 'Emergency Resus Beds', category: 'Emergency Beds', available: 14, reserved: 2, occupied: 34, maintenance: 1 },
      { id: 'kem-vent', name: 'Advanced Ventilators', category: 'Ventilators', available: 7, reserved: 1, occupied: 18, maintenance: 0 },
      { id: 'kem-cath', name: 'Cath Labs (Active 24/7)', category: 'Cath Labs', available: 2, reserved: 1, occupied: 1, maintenance: 0 },
      { id: 'kem-trauma', name: 'Trauma Bays (Level 1 Resus)', category: 'Trauma Bays', available: 3, reserved: 0, occupied: 2, maintenance: 0 }
    ]
  },
  {
    id: 'mercy-general',
    name: 'Lilavati Hospital & Research Centre',
    tier: 'Level 1 Comprehensive Cardiac & Stroke Hub',
    address: 'A-791, Bandra Reclamation, Bandra West, Mumbai 400050',
    distanceMiles: 2.6, // 4.2 km
    baseEtaMinutes: 11,
    currentEtaMinutes: 11,
    status: 'Online',
    cadScore: 91,
    lastUpdatedSecondsAgo: 24,
    specialties: ['Level 1 Cardiac Triage', 'Comprehensive Stroke', 'Dedicated Burn Resus', 'ECMO Hub'],
    openCathBays: 1,
    traumaBaysAvailable: 2,
    onCallCardiologist: 'On-Call (Standby 8 min - Dr. Vikram Mehta)',
    onCallTraumaSurgeon: 'Dr. Sneha Kulkarni (Trauma Lead)',
    activeRequestsCount: 3,
    reliability: {
      overall: 'High',
      acceptanceRate: 95.8,
      avgResponseSeconds: 21,
      availabilityAccuracy: 97.4,
      monthlyTrend: '+2.8% clearance'
    },
    resources: [
      { id: 'lil-icu', name: 'ICU Beds', category: 'ICU Beds', available: 8, reserved: 2, occupied: 14, maintenance: 0 },
      { id: 'lil-ed', name: 'Emergency Beds', category: 'Emergency Beds', available: 16, reserved: 3, occupied: 28, maintenance: 1 },
      { id: 'lil-vent', name: 'Ventilators', category: 'Ventilators', available: 5, reserved: 1, occupied: 10, maintenance: 0 },
      { id: 'lil-cath', name: 'Cath Labs', category: 'Cath Labs', available: 1, reserved: 0, occupied: 1, maintenance: 0 },
      { id: 'lil-trauma', name: 'Trauma Bays', category: 'Trauma Bays', available: 2, reserved: 1, occupied: 2, maintenance: 0 }
    ]
  },
  {
    id: 'city-memorial',
    name: 'P. D. Hinduja National Hospital & MRC',
    tier: 'Super-Specialty Tertiary Care Center',
    address: 'Veer Savarkar Marg, Mahim West, Mumbai 400016',
    distanceMiles: 1.8, // 2.9 km
    baseEtaMinutes: 8,
    currentEtaMinutes: 8,
    status: 'Diversion Active',
    statusMessage: 'Cath Lab Emergency Diversion Active. Both interventional catheterization suites occupied in acute angioplasties.',
    cadScore: 64,
    lastUpdatedSecondsAgo: 85, // STALE! > 60s
    specialties: ['Level 2 Trauma', 'General & Vascular Surgery', 'Ortho Acute Care'],
    openCathBays: 0,
    traumaBaysAvailable: 1,
    onCallCardiologist: 'Committed (OT Suite 3 - Dr. K. N. Rao)',
    onCallTraumaSurgeon: 'Dr. Arvind Joshi (On-Site)',
    activeRequestsCount: 1,
    reliability: {
      overall: 'Medium',
      acceptanceRate: 79.2,
      avgResponseSeconds: 58,
      availabilityAccuracy: 88.5,
      monthlyTrend: 'Pending diversion clearance'
    },
    resources: [
      { id: 'hin-icu', name: 'ICU Beds', category: 'ICU Beds', available: 0, reserved: 1, occupied: 16, maintenance: 1 },
      { id: 'hin-ed', name: 'Emergency Beds', category: 'Emergency Beds', available: 5, reserved: 0, occupied: 22, maintenance: 0 },
      { id: 'hin-vent', name: 'Ventilators', category: 'Ventilators', available: 2, reserved: 0, occupied: 9, maintenance: 0 },
      { id: 'hin-cath', name: 'Cath Labs', category: 'Cath Labs', available: 0, reserved: 0, occupied: 2, maintenance: 0 }
    ]
  },
  {
    id: 'univ-sciences',
    name: 'Fortis Hospital Mulund & Research Centre',
    tier: 'Academic Multi-Organ Transplant & Trauma Hub',
    address: 'Mulund Goregaon Link Road, Mulund West, Mumbai 400078',
    distanceMiles: 4.8, // 7.7 km
    baseEtaMinutes: 18,
    currentEtaMinutes: 18,
    status: 'Online',
    cadScore: 86,
    lastUpdatedSecondsAgo: 18,
    specialties: ['Apex Level 1 Trauma', 'Heart & Lung Transplant', 'Pediatric ICU', 'ECMO Hub'],
    openCathBays: 2,
    traumaBaysAvailable: 4,
    onCallCardiologist: 'Attending Faculty Present (24/7 - Dr. Amit Verma)',
    onCallTraumaSurgeon: 'Trauma Team Alpha Active (Dr. Pooja Rao)',
    activeRequestsCount: 4,
    reliability: {
      overall: 'High',
      acceptanceRate: 96.5,
      avgResponseSeconds: 28,
      availabilityAccuracy: 96.0,
      monthlyTrend: 'Nominal'
    },
    resources: [
      { id: 'for-icu', name: 'ICU Beds', category: 'ICU Beds', available: 9, reserved: 2, occupied: 32, maintenance: 1 },
      { id: 'for-ed', name: 'Emergency Beds', category: 'Emergency Beds', available: 20, reserved: 4, occupied: 45, maintenance: 2 },
      { id: 'for-vent', name: 'Ventilators', category: 'Ventilators', available: 8, reserved: 1, occupied: 18, maintenance: 0 },
      { id: 'for-cath', name: 'Cath Labs', category: 'Cath Labs', available: 2, reserved: 1, occupied: 2, maintenance: 0 }
    ]
  }
];

export const INITIAL_AMBULANCES: Ambulance[] = [
  {
    id: 'MEDIC-04',
    name: 'Ambulance 108-04 (ALS-1)',
    callSign: 'MH 01 EA 1084',
    type: 'ALS-1',
    crew: ['Dr. Rakesh Patil, MBBS (EMS Lead)', 'Sunil Shinde, EMT-P'],
    leadParamedic: 'Dr. Rakesh Patil, MBBS',
    status: 'En Route',
    location: 'Dr. Ambedkar Road, approaching Dadar TT Circle',
    coordinates: { lat: 19.0305, lng: 72.8550 },
    speedMph: 36, // displayed as 58 km/h
    heading: 195,
    assignedEmergencyId: 'GM-2048',
    destinationHospitalId: 'st-jude',
    etaMinutes: 6,
    distanceMiles: 1.5 // 2.4 km
  },
  {
    id: 'MEDIC-08',
    name: 'Ambulance 108-08 (Critical Care)',
    callSign: 'MH 02 BG 1088',
    type: 'Critical Care',
    crew: ['Dr. Meera Iyer, Intensivist', 'Prakash Jadhav, RN-EMS'],
    leadParamedic: 'Dr. Meera Iyer',
    status: 'En Route',
    location: 'BKC G-Block Arterial Corridor, Bandra Kurla Complex',
    coordinates: { lat: 19.0657, lng: 72.8656 },
    speedMph: 28,
    heading: 140,
    assignedEmergencyId: 'GM-2049',
    destinationHospitalId: 'mercy-general',
    etaMinutes: 16,
    distanceMiles: 3.2
  },
  {
    id: 'MEDIC-12',
    name: 'Ambulance 108-12 (Trauma ALS-2)',
    callSign: 'MH 03 CL 1092',
    type: 'ALS-2',
    crew: ['Vijay Kamble, EMT-P', 'Tanvi Chawla, EMT'],
    leadParamedic: 'Vijay Kamble, EMT-P',
    status: 'En Route',
    location: 'Bandra-Worli Sea Link Toll Approach (Southbound)',
    coordinates: { lat: 19.0400, lng: 72.8185 },
    speedMph: 42,
    heading: 210,
    assignedEmergencyId: 'GM-2047',
    destinationHospitalId: 'mercy-general',
    etaMinutes: 12,
    distanceMiles: 2.8
  },
  {
    id: 'MEDIC-16',
    name: 'Ambulance 108-16 (BLS Quick Response)',
    callSign: 'MH 04 DK 1096',
    type: 'BLS',
    crew: ['Ajay Gaikwad, EMT', 'Snehal More, EMT'],
    leadParamedic: 'Ajay Gaikwad, EMT',
    status: 'Available',
    location: 'Worli Seaface Standby Station 12',
    coordinates: { lat: 19.0220, lng: 72.8180 },
    speedMph: 0,
    heading: 0,
    etaMinutes: 0,
    distanceMiles: 0
  }
];

export const INITIAL_EMERGENCIES: EmergencyRequest[] = [
  {
    id: 'GM-2048',
    condition: 'Acute STEMI Anterior Wall • ST Elevation V1-V4, BP 88/54, pulmonary congestion',
    priority: 'critical',
    requiredResource: 'Cath Lab (24/7 Priority Bay)',
    location: 'Eastern Express Highway, near Sion Flyover Junction, Mumbai',
    coordinates: { lat: 19.0435, lng: 72.8615 },
    patientCount: 1,
    assignedAmbulanceId: 'MEDIC-04',
    assignedHospitalId: 'st-jude',
    assignedBedId: 'Cath Lab 02',
    status: 'En Route',
    createdAt: '12:38 PM',
    timeElapsedSeconds: 380,
    etaMinutes: 6,
    vitals: {
      hr: 118,
      bp: '88/54',
      spo2: 93,
      respiratoryRate: 26,
      notes: 'Patient: Rahul Verma (54M). 12-lead ECG transmitted. Aspirin 325mg & Heparin IV administered in transit. Door-to-Balloon clock active under Mumbai Police Green Corridor.'
    },
    specialRequirements: ['Direct Bay Entry', 'MD Radio Link', 'Pre-cleared Interventional Cath Team'],
    protocolStep: 'Protocol 10-A Priority Cardiac (Golden Hour STEMI)',
    handover: {
      transcript: 'This is Ambulance 108-04 lead Dr. Rakesh Patil dictating en route to KEM Hospital. We have Rahul Verma, 54-year-old male with acute onset crushing chest pain radiating to left jaw, began 45 minutes ago. 12-lead ECG confirms anterior STEMI with 4mm ST elevations V1 through V4. Patient is diaphoretic and hypotensive with BP 88 over 54, heart rate 118, O2 sat 93% on room air. We administered 325 milligrams chewable aspirin, 5000 units IV heparin bolus, and started supplemental oxygen at 4 liters per minute via nasal cannula. Pain currently 8 out of 10. ETA to KEM Bay 2 is 5 minutes under active Mumbai Police Green Corridor. Please have interventional cardiology standby and cath table prepped.',
      summary: 'Ambulance 108-04 inbound with 54-year-old male experiencing acute anterior STEMI with cardiogenic hypotension, pre-treated with Aspirin and Heparin.',
      situation: 'Acute STEMI anterior wall with hemodynamic compromise (BP 88/54). Door-to-Balloon golden hour protocol active with 5 min ETA.',
      background: '54M, symptom onset 45 min prior. Severe retrosternal crushing pain radiating to jaw and left arm. Known hypertensive.',
      assessment: '12-lead shows 4mm ST elevation V1-V4. Hypotensive (BP 88/54, HR 118 bpm, SpO2 93%). Diaphoretic and pale.',
      recommendations: [
        'Direct bypass of general ED triage to Cath Lab Bay 02 immediately upon arrival',
        'Pre-alert interventional cardiology team (Dr. Rajesh Sharma, MD, DM) on standby in catheterization suite',
        'Prepare central venous access & vasopressor infusion (noradrenaline) on standby for cardiogenic hypotension',
        'Immediate femoral / radial arterial sheath prep upon stretcher transfer'
      ],
      interventions: [
        'Aspirin 325 mg PO chewable administered at 12:40 PM',
        'Heparin 5,000 units IV bolus administered at 12:42 PM',
        'Supplemental Oxygen 4 L/min via nasal cannula',
        '18G Peripheral IV established in left antecubital fossa with 0.9% Normal Saline KVO'
      ],
      acuityLevel: 'Critical (Code Red)',
      medicName: 'Dr. Rakesh Patil, MBBS',
      ambulanceCallSign: 'MH 01 EA 1084 (Medic 04)',
      timestamp: '12:43 PM',
      modelUsed: 'gemini-3.1-flash-lite'
    },
    timeline: [
      { stage: 'Emergency Created', completed: true, timestamp: '12:38:12', description: 'Mumbai 108 CAD intake flagged Priority-1 STEMI dispatch' },
      { stage: 'Hospital Search', completed: true, timestamp: '12:38:26', description: 'FastTrack algorithm ranked 4 Mumbai metropolitan centers' },
      { stage: 'Hospital Selected', completed: true, timestamp: '12:38:52', description: 'KEM Hospital Parel selected (Fastest 6m transit, open Cath Bay #02)' },
      { stage: 'Resource Requested', completed: true, timestamp: '12:39:10', description: 'Cath Lab #02 requested for Ambulance 108-04' },
      { stage: 'Resource Held', completed: true, timestamp: '12:39:24', description: 'Hold confirmed by KEM Emergency Telemetry Desk' },
      { stage: 'Hospital Confirmed', completed: true, timestamp: '12:39:55', description: 'Dr. Rajesh Sharma & Cath team placed on active standby' },
      { stage: 'Ambulance En Route', completed: true, timestamp: '12:40:10', description: 'Ambulance 108-04 rolling with Opticom green corridor' },
      { stage: 'Hospital Arrival', completed: false, description: 'Estimated in 6 minutes at Parel Trauma Bay #2' },
      { stage: 'Patient Handoff', completed: false, description: 'Direct transfer to cardiac catheterization table' }
    ]
  },
  {
    id: 'GM-2047',
    condition: 'Multi-Vehicle Highway Collision • Blunt Abdominal Trauma & Pelvic Instability',
    priority: 'urgent',
    requiredResource: 'Trauma Bay (Level 1 Resus)',
    location: 'Bandra-Worli Sea Link Toll Approach, Mumbai',
    coordinates: { lat: 19.0400, lng: 72.8185 },
    patientCount: 1,
    assignedAmbulanceId: 'MEDIC-12',
    assignedHospitalId: 'mercy-general',
    assignedBedId: 'Trauma Bay 01',
    status: 'Confirmed',
    createdAt: '12:30 PM',
    timeElapsedSeconds: 840,
    etaMinutes: 12,
    vitals: {
      hr: 112,
      bp: '102/68',
      spo2: 96,
      respiratoryRate: 22,
      notes: 'Patient: Arjun Mehta (32M). Driver extricated in 15 min. GCS 13. FAST exam positive in RUQ. Pelvic binder and rigid cervical collar applied.'
    },
    specialRequirements: ['Direct Bay Entry', 'Trauma Resuscitation Team'],
    protocolStep: 'Protocol 4-B Major Trauma Resuscitation',
    timeline: [
      { stage: 'Emergency Created', completed: true, timestamp: '12:30:05', description: 'Sea Link collision with trapped passenger' },
      { stage: 'Hospital Search', completed: true, timestamp: '12:30:40', description: 'Level 1 Trauma center match initiated' },
      { stage: 'Hospital Selected', completed: true, timestamp: '12:31:12', description: 'Lilavati Hospital Bandra selected' },
      { stage: 'Resource Requested', completed: true, timestamp: '12:31:30', description: 'Trauma Bay 01 requested' },
      { stage: 'Resource Held', completed: true, timestamp: '12:32:00', description: 'Held for Ambulance 108-12' },
      { stage: 'Hospital Confirmed', completed: true, timestamp: '12:33:15', description: 'Dr. Sneha Kulkarni confirmed resus bay readiness' },
      { stage: 'Ambulance En Route', completed: true, timestamp: '12:35:00', description: 'Inbound on Bandra Reclamation express road' },
      { stage: 'Hospital Arrival', completed: false, description: 'Expected at 12:47 PM' },
      { stage: 'Patient Handoff', completed: false, description: 'Pending arrival' }
    ]
  },
  {
    id: 'GM-2049',
    condition: 'Elderly Domestic Fall • Suspected Left Femur / Hip Fracture, Stable Vitals',
    priority: 'stable',
    requiredResource: 'Emergency Bed (Ortho Obs)',
    location: 'Diamond Garden, Chembur, Mumbai',
    coordinates: { lat: 19.0520, lng: 72.8990 },
    patientCount: 1,
    assignedAmbulanceId: 'MEDIC-08',
    assignedHospitalId: 'mercy-general',
    assignedBedId: 'Obs Bed #14',
    status: 'Confirmed',
    createdAt: '12:22 PM',
    timeElapsedSeconds: 1320,
    etaMinutes: 16,
    vitals: {
      hr: 82,
      bp: '136/82',
      spo2: 98,
      notes: 'Patient: Smt. Sharda Kulkarni (78F). Unwitnessed slip on floor. Limb immobilized and traction applied. Alert & oriented.'
    },
    specialRequirements: ['General Ortho Obs'],
    protocolStep: 'Protocol 8-C Routine Ortho Management',
    timeline: [
      { stage: 'Emergency Created', completed: true, timestamp: '12:22:15', description: '108 Chembur dispatch intake' },
      { stage: 'Hospital Search', completed: true, timestamp: '12:22:45', description: 'Regional ED bed search' },
      { stage: 'Hospital Selected', completed: true, timestamp: '12:23:10', description: 'Lilavati Hospital' },
      { stage: 'Resource Requested', completed: true, timestamp: '12:23:30', description: 'Ortho Bed #14 requested' },
      { stage: 'Resource Held', completed: true, timestamp: '12:24:00', description: 'Held' },
      { stage: 'Hospital Confirmed', completed: true, timestamp: '12:24:45', description: 'Confirmed by Triage Desk' },
      { stage: 'Ambulance En Route', completed: true, timestamp: '12:26:00', description: 'Ambulance 108-08 en route via BKC' },
      { stage: 'Hospital Arrival', completed: false, description: 'ETA 16 min' },
      { stage: 'Patient Handoff', completed: false, description: 'Pending arrival' }
    ]
  },
  {
    id: 'GM-2050',
    condition: 'Acute Focal Neurologic Deficit • Aphasia & Right Hemiparesis (Onset < 30 min)',
    priority: 'critical',
    requiredResource: 'CT / Neuro Angio Interventional Suite',
    location: 'BKC G-Block, Bandra Kurla Complex, Mumbai',
    coordinates: { lat: 19.0650, lng: 72.8650 },
    patientCount: 1,
    status: 'Searching',
    createdAt: '12:44 PM',
    timeElapsedSeconds: 45,
    etaMinutes: 8,
    vitals: {
      hr: 94,
      bp: '164/98',
      spo2: 97,
      notes: 'Patient: Amit Saxena (49M). LAMS Score 4. Direct CT candidate. Tissue plasminogen activator (tPA) window active.'
    },
    specialRequirements: ['Direct CT Table Entry', 'Neuro On-Call'],
    protocolStep: 'Protocol 12-A Code Stroke (Golden Window)',
    timeline: [
      { stage: 'Emergency Created', completed: true, timestamp: '12:44:10', description: 'Acute stroke alert triggered in BKC' },
      { stage: 'Hospital Search', completed: false, description: 'Searching neuro biplane interventional suites...' },
      { stage: 'Hospital Selected', completed: false, description: 'Pending ranking' },
      { stage: 'Resource Requested', completed: false, description: 'Pending' },
      { stage: 'Resource Held', completed: false, description: 'Pending' },
      { stage: 'Hospital Confirmed', completed: false, description: 'Pending' },
      { stage: 'Ambulance En Route', completed: false, description: 'Ambulance 108-16 staged' },
      { stage: 'Hospital Arrival', completed: false, description: 'Pending' },
      { stage: 'Patient Handoff', completed: false, description: 'Pending' }
    ]
  }
];

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'RES-9041',
    emergencyId: 'GM-2048',
    hospitalId: 'st-jude',
    hospitalName: 'KEM Hospital & Seth GS Medical College',
    resourceName: 'Cath Lab',
    resourceBed: 'Cath Lab 02',
    createdAt: '12:39 PM',
    expiresInSeconds: 47,
    status: 'HELD',
    assignedToAmbulance: 'Ambulance 108-04 (MH 01 EA 1084)'
  },
  {
    id: 'RES-9038',
    emergencyId: 'GM-2047',
    hospitalId: 'mercy-general',
    hospitalName: 'Lilavati Hospital & Research Centre',
    resourceName: 'Trauma Bay',
    resourceBed: 'Trauma Bay 01',
    createdAt: '12:33 PM',
    expiresInSeconds: 0,
    status: 'CONFIRMED',
    assignedToAmbulance: 'Ambulance 108-12 (MH 03 CL 1092)'
  },
  {
    id: 'RES-9035',
    emergencyId: 'GM-2049',
    hospitalId: 'mercy-general',
    hospitalName: 'Lilavati Hospital & Research Centre',
    resourceName: 'Ortho Obs Bed',
    resourceBed: 'Obs Bed #14',
    createdAt: '12:24 PM',
    expiresInSeconds: 0,
    status: 'CONFIRMED',
    assignedToAmbulance: 'Ambulance 108-08 (MH 02 BG 1088)'
  }
];

export const INITIAL_ACTIVITIES: ActivityEvent[] = [
  {
    id: 'act-1',
    timestamp: '12:44:10',
    timeAgo: '1 min ago',
    type: 'emergency',
    title: 'New Emergency Created #GM-2050',
    description: 'Acute focal neurologic deficit (Code Stroke) reported in BKC G-Block, Mumbai.',
    role: 'dispatcher',
    priority: 'critical'
  },
  {
    id: 'act-2',
    timestamp: '12:42:15',
    timeAgo: '3 mins ago',
    type: 'hospital',
    title: 'Hospital Confirmed #GM-2048',
    description: 'KEM Hospital Parel confirmed Cath Lab 02 standby for Ambulance 108-04.',
    role: 'all',
    priority: 'critical'
  },
  {
    id: 'act-3',
    timestamp: '12:40:02',
    timeAgo: '5 mins ago',
    type: 'reservation',
    title: 'Resource Held: Cath Lab 02',
    description: 'Reservation RES-9041 created with 60-second hold window at KEM Hospital.',
    role: 'hospital',
    priority: 'urgent'
  },
  {
    id: 'act-4',
    timestamp: '12:38:12',
    timeAgo: '7 mins ago',
    type: 'emergency',
    title: 'Incident Dispatched #GM-2048',
    description: 'Ambulance 108-04 assigned to Acute STEMI anterior wall on Eastern Express Highway.',
    role: 'dispatcher',
    priority: 'critical'
  },
  {
    id: 'act-5',
    timestamp: '12:35:40',
    timeAgo: '10 mins ago',
    type: 'route',
    title: 'Mumbai Police Green Corridor Active',
    description: '5 traffic junctions pre-empted along Dr. Ambedkar Road for Ambulance 108-04.',
    role: 'dispatcher'
  },
  {
    id: 'act-6',
    timestamp: '12:33:15',
    timeAgo: '12 mins ago',
    type: 'hospital',
    title: 'Trauma Bay 01 Reserved for Ambulance 108-12',
    description: 'Lilavati Hospital accepted Sea Link Toll collision trauma patient.',
    role: 'hospital',
    priority: 'urgent'
  },
  {
    id: 'act-7',
    timestamp: '12:28:00',
    timeAgo: '17 mins ago',
    type: 'hospital',
    title: 'Hinduja Hospital STEMI Diversion Declared',
    description: 'Both interventional cath teams occupied in acute angioplasties.',
    role: 'all',
    priority: 'critical'
  }
];

export const INITIAL_HISTORY: HistoricalEmergency[] = [
  {
    id: 'GM-2046',
    patientCondition: 'Anaphylactic severe shock, Epinephrine IV administered',
    hospitalName: 'Lilavati Hospital & Research Centre',
    ambulanceId: 'Ambulance 108-02',
    priority: 'critical',
    durationMinutes: 24,
    outcome: 'Admitted ICU',
    date: 'Today, 11:45 AM',
    totalDistance: '3.4 km',
    doorToNeedleMinutes: 8
  },
  {
    id: 'GM-2045',
    patientCondition: 'Acute STEMI Inferior wall with high-grade AV block',
    hospitalName: 'KEM Hospital & Seth GS Medical College',
    ambulanceId: 'Ambulance 108-04',
    priority: 'critical',
    durationMinutes: 29,
    outcome: 'Cath Lab Direct',
    date: 'Today, 10:12 AM',
    totalDistance: '5.8 km',
    doorToNeedleMinutes: 18
  },
  {
    id: 'GM-2044',
    patientCondition: 'Pediatric Respiratory Distress, SpO2 88%',
    hospitalName: 'Fortis Hospital Mulund',
    ambulanceId: 'Ambulance 108-08',
    priority: 'urgent',
    durationMinutes: 38,
    outcome: 'Handoff Complete',
    date: 'Today, 08:30 AM',
    totalDistance: '8.4 km',
    doorToNeedleMinutes: 14
  },
  {
    id: 'GM-2043',
    patientCondition: 'Industrial crush injury, bilateral lower extremity',
    hospitalName: 'KEM Hospital & Seth GS Medical College',
    ambulanceId: 'Ambulance 108-12',
    priority: 'critical',
    durationMinutes: 45,
    outcome: 'Trauma Resus',
    date: 'Yesterday, 22:15 PM',
    totalDistance: '7.2 km',
    doorToNeedleMinutes: 12
  },
  {
    id: 'GM-2042',
    patientCondition: 'Transient Ischemic Attack (Resolved on scene)',
    hospitalName: 'P. D. Hinduja National Hospital',
    ambulanceId: 'Ambulance 108-16',
    priority: 'stable',
    durationMinutes: 32,
    outcome: 'Handoff Complete',
    date: 'Yesterday, 19:40 PM',
    totalDistance: '2.8 km',
    doorToNeedleMinutes: 19
  },
  {
    id: 'GM-2041',
    patientCondition: 'Subdural hematoma, altered mental status, GCS 9',
    hospitalName: 'KEM Hospital & Seth GS Medical College',
    ambulanceId: 'Ambulance 108-04',
    priority: 'critical',
    durationMinutes: 42,
    outcome: 'Transferred',
    date: 'Yesterday, 16:05 PM',
    totalDistance: '6.1 km',
    doorToNeedleMinutes: 22
  }
];
