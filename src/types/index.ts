export type UserRole = 'dispatcher' | 'hospital';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  assignedFacility?: string;
  badgeId?: string;
  createdAt: string;
  updatedAt: string;
}

export type PriorityLevel = 'critical' | 'urgent' | 'stable';

export type EmergencyStatus =
  | 'Searching'
  | 'Awaiting Hospital'
  | 'Resource Held'
  | 'Confirmed'
  | 'En Route'
  | 'Arrived'
  | 'Handoff Complete';

export type ReservationStatus = 'AVAILABLE' | 'REQUESTED' | 'HELD' | 'CONFIRMED' | 'REJECTED' | 'EXPIRED';

export type AmbulanceStatus = 'Available' | 'Dispatched' | 'En Route' | 'At Hospital' | 'Offline';

export type HospitalStatus = 'Online' | 'Busy' | 'Diversion Active';

export interface Vitals {
  hr: number;
  bp: string;
  spo2: number;
  respiratoryRate?: number;
  temp?: string;
  notes?: string;
}

export interface HandoverSummary {
  transcript: string;
  summary: string;
  situation: string;
  background: string;
  assessment: string;
  recommendations: string[];
  interventions: string[];
  acuityLevel: 'Critical (Code Red)' | 'Urgent (Code Yellow)' | 'Stable (Code Green)';
  medicName: string;
  ambulanceCallSign: string;
  timestamp: string;
  modelUsed?: string;
}

export interface EmergencyRequest {
  id: string; // e.g. "GM-2048" or "INC-2024-8841"
  condition: string;
  priority: PriorityLevel;
  requiredResource: string;
  location: string;
  coordinates: { lat: number; lng: number };
  patientCount: number;
  assignedAmbulanceId?: string;
  assignedHospitalId?: string;
  assignedBedId?: string;
  status: EmergencyStatus;
  createdAt: string;
  timeElapsedSeconds: number;
  etaMinutes: number;
  vitals: Vitals;
  specialRequirements: string[];
  protocolStep: string;
  handover?: HandoverSummary;
  timeline: {
    stage: string;
    completed: boolean;
    timestamp?: string;
    description: string;
  }[];
}

export interface HospitalResource {
  id: string;
  name: string;
  category: 'ICU Beds' | 'Emergency Beds' | 'Ventilators' | 'Operating Rooms' | 'Cath Labs' | 'Trauma Bays';
  available: number;
  reserved: number;
  occupied: number;
  maintenance: number;
}

export interface Hospital {
  id: string;
  name: string;
  tier: string;
  address: string;
  distanceMiles: number;
  baseEtaMinutes: number;
  currentEtaMinutes: number;
  status: HospitalStatus;
  statusMessage?: string;
  cadScore: number;
  lastUpdatedSecondsAgo: number;
  isStale?: boolean;
  staleReason?: string;
  specialties: string[];
  resources: HospitalResource[];
  reliability: {
    overall: 'High' | 'Medium' | 'Low';
    acceptanceRate: number; // e.g. 94.2
    avgResponseSeconds: number; // e.g. 24
    availabilityAccuracy: number; // e.g. 97
    monthlyTrend: string;
  };
  openCathBays: number;
  traumaBaysAvailable: number;
  onCallCardiologist: string;
  onCallTraumaSurgeon: string;
  activeRequestsCount: number;
}

export interface Ambulance {
  id: string; // e.g. "MEDIC-04"
  name: string; // "Ambulance 04"
  callSign: string; // "Medic 4"
  type: 'ALS-1' | 'ALS-2' | 'BLS' | 'Critical Care';
  crew: string[];
  leadParamedic: string;
  status: AmbulanceStatus;
  location: string;
  coordinates: { lat: number; lng: number };
  speedMph: number;
  heading: number;
  assignedEmergencyId?: string;
  destinationHospitalId?: string;
  etaMinutes: number;
  distanceMiles: number;
}

export interface Reservation {
  id: string;
  emergencyId: string;
  hospitalId: string;
  hospitalName: string;
  resourceName: string;
  resourceBed: string;
  createdAt: string;
  expiresInSeconds: number;
  status: ReservationStatus;
  assignedToAmbulance: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  timeAgo: string;
  type: 'emergency' | 'reservation' | 'hospital' | 'route' | 'ambulance' | 'handoff';
  title: string;
  description: string;
  role: 'all' | 'dispatcher' | 'hospital';
  priority?: PriorityLevel;
}

export interface HistoricalEmergency {
  id: string;
  patientCondition: string;
  hospitalName: string;
  ambulanceId: string;
  priority: PriorityLevel;
  durationMinutes: number;
  outcome: 'Handoff Complete' | 'Admitted ICU' | 'Cath Lab Direct' | 'Trauma Resus' | 'Transferred';
  date: string;
  totalDistance: string;
  doorToNeedleMinutes: number;
}

export type SurgeAlertLevel = 'NORMAL' | 'ELEVATED' | 'WARNING' | 'CRITICAL';

export type SurgeScenarioPreset = 'baseline' | 'highway_incident' | 'severe_weather' | 'regional_divert';

export interface HourlyInflowPrediction {
  hourOffset: number; // 1, 2, 3, 4
  timeLabel: string; // e.g. "13:00 - 14:00"
  predictedCount: number;
  confidenceInterval: { min: number; max: number };
  historicalBaseline: number;
  riskLevel: SurgeAlertLevel;
  acuityBreakdown: {
    esi1Critical: number;
    esi2Emergent: number;
    esi3Urgent: number;
    esi45NonUrgent: number;
  };
  resourceDemand: {
    traumaBays: number;
    icuBeds: number;
    acuteBeds: number;
    respiratoryVentilators: number;
  };
}

export interface MLModelInsights {
  algorithm: string;
  r2Score: number;
  mae: number;
  sampleSizeWeeks: number;
  trainingRecordsCount: number;
  featureWeights: {
    diurnalCycle: number;
    activeCadDispatch: number;
    dayOfWeekPattern: number;
    weatherRoadCondition: number;
    regionalDivertSpillover: number;
  };
  primaryContributors: string[];
}

export interface SurgeAlertState {
  currentLevel: SurgeAlertLevel;
  activeScenario: SurgeScenarioPreset;
  predictedPeakInflow: number;
  peakHourLabel: string;
  capacityCeilingPerHour: number;
  totalPredicted4Hours: number;
  recommendations: string[];
  predictions: HourlyInflowPrediction[];
  modelInsights: MLModelInsights;
  lastCalculated: string;
  isPreStaged: boolean;
}

