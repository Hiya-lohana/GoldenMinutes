import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import {
  UserRole,
  EmergencyRequest,
  Hospital,
  Ambulance,
  Reservation,
  ActivityEvent,
  HistoricalEmergency,
  PriorityLevel,
  HandoverSummary,
} from '../types';
import {
  INITIAL_HOSPITALS,
  INITIAL_AMBULANCES,
  INITIAL_EMERGENCIES,
  INITIAL_RESERVATIONS,
  INITIAL_ACTIVITIES,
  INITIAL_HISTORY,
} from '../data/mockData';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { useAuth } from './AuthContext';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}

export interface HospitalRankResult {
  hospital: Hospital;
  score: number;
  breakdown: {
    resourceMatch: number;
    travelTime: number;
    dataFreshness: number;
    reliability: number;
  };
  isStale: boolean;
  stalenessWarning?: string;
  notes: string;
}

export interface EMSContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentPath: string;
  navigate: (path: string) => void;

  // Entities
  emergencies: EmergencyRequest[];
  hospitals: Hospital[];
  ambulances: Ambulance[];
  reservations: Reservation[];
  activities: ActivityEvent[];
  history: HistoricalEmergency[];

  // Selected contexts
  selectedEmergencyId: string;
  setSelectedEmergencyId: (id: string) => void;
  selectedHospitalId: string;
  setSelectedHospitalId: (id: string) => void;
  selectedAmbulanceId: string;
  setSelectedAmbulanceId: (id: string) => void;

  // Roadblock simulation
  isRoadblockActive: boolean;
  roadblockState: 'normal' | 'detecting' | 'rerouting' | 'updated';
  simulateRoadblock: () => void;
  resetRoadblock: () => void;

  // Stale Data Simulation
  isStaleScenarioActive: boolean;
  toggleStaleScenario: () => void;

  // Live Ambulance Tracking Simulation
  isLiveTrackingActive: boolean;
  toggleLiveTracking: () => void;

  // Double booking simulation
  doubleBookingState: {
    active: boolean;
    step: 'idle' | 'ambA_requested' | 'ambA_reserved' | 'ambB_attempting' | 'ambB_conflict' | 'ambB_rerouted';
    ambABookedBed: string;
    ambBMessage: string;
    failoverHospital?: string;
  };
  triggerDoubleBookingDemo: () => void;
  resetDoubleBookingDemo: () => void;

  // Ranking calculation
  getRankedHospitalsForEmergency: (emergencyId: string) => HospitalRankResult[];

  // Operations
  createEmergency: (data: {
    condition: string;
    priority: PriorityLevel;
    requiredResource: string;
    location: string;
    coordinates?: { lat: number; lng: number };
    specialRequirements?: string[];
  }) => Promise<string>;

  reserveResource: (emergencyId: string, hospitalId: string, resourceName: string, bedName: string) => Promise<void>;
  confirmHospitalRequest: (emergencyId: string) => Promise<void>;
  rejectHospitalRequest: (emergencyId: string, reason?: string) => Promise<void>;
  completeHandoff: (emergencyId: string) => Promise<void>;
  saveHandoverSummary: (emergencyId: string, handover: HandoverSummary) => Promise<void>;
  updateAmbulanceStatus: (ambulanceId: string, status: Ambulance['status']) => Promise<void>;
  updateResourceQuantity: (hospitalId: string, resourceId: string, field: 'available' | 'occupied' | 'maintenance', delta: number) => Promise<void>;

  // Global Audio / Triage Klaxon
  audioTriageLive: boolean;
  toggleAudioTriage: () => void;

  // Firestore Sync Status
  isFirestoreSyncing: boolean;
  hasFirestoreData: boolean;

  // Toasts
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const EMSContext = createContext<EMSContextType | undefined>(undefined);

export const EMSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const getInitialPath = (): string => {
    const hash = window.location.hash.replace('#', '');
    if (hash.startsWith('/')) return hash;
    const path = window.location.pathname;
    if (path && path !== '/') return path;
    return '/dispatcher/command-center';
  };

  const [currentPath, setCurrentPath] = useState<string>(getInitialPath);
  const [role, setRoleState] = useState<UserRole>(() => {
    return currentPath.startsWith('/hospital') ? 'hospital' : 'dispatcher';
  });

  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>(INITIAL_EMERGENCIES);
  const [hospitals, setHospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [ambulances, setAmbulances] = useState<Ambulance[]>(INITIAL_AMBULANCES);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [activities, setActivities] = useState<ActivityEvent[]>(INITIAL_ACTIVITIES);
  const [history, setHistory] = useState<HistoricalEmergency[]>(INITIAL_HISTORY);

  const [selectedEmergencyId, setSelectedEmergencyId] = useState<string>('GM-2048');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('mercy-general');
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState<string>('MEDIC-04');

  const [audioTriageLive, setAudioTriageLive] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Roadblock state
  const [isRoadblockActive, setIsRoadblockActive] = useState<boolean>(false);
  const [roadblockState, setRoadblockState] = useState<'normal' | 'detecting' | 'rerouting' | 'updated'>('normal');

  // Stale Telemetry Scenario state
  const [isStaleScenarioActive, setIsStaleScenarioActive] = useState<boolean>(false);

  // Live GPS Tracking state
  const [isLiveTrackingActive, setIsLiveTrackingActive] = useState<boolean>(true);

  // Firestore sync indicator
  const [isFirestoreSyncing, setIsFirestoreSyncing] = useState<boolean>(false);
  const [hasFirestoreData, setHasFirestoreData] = useState<boolean>(false);

  // Double booking demo state
  const [doubleBookingState, setDoubleBookingState] = useState<{
    active: boolean;
    step: 'idle' | 'ambA_requested' | 'ambA_reserved' | 'ambB_attempting' | 'ambB_conflict' | 'ambB_rerouted';
    ambABookedBed: string;
    ambBMessage: string;
    failoverHospital?: string;
  }>({
    active: false,
    step: 'idle',
    ambABookedBed: 'ICU Bed #14',
    ambBMessage: '',
  });

  const addToast = useCallback((_message: string, _type: ToastMessage['type'] = 'info') => {
    // Silenced per user request: remove all annoying notifications on the side
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Synchronize browser history / URL hash
  const navigate = useCallback((path: string) => {
    setCurrentPath(path);
    window.location.hash = path;
    if (path.startsWith('/dispatcher')) {
      setRoleState('dispatcher');
    } else if (path.startsWith('/hospital')) {
      setRoleState('hospital');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole);
    if (newRole === 'dispatcher' && !currentPath.startsWith('/dispatcher')) {
      navigate('/dispatcher/command-center');
    } else if (newRole === 'hospital' && !currentPath.startsWith('/hospital')) {
      navigate('/hospital/overview');
    }
  }, [currentPath, navigate]);

  // Listen to popstate / hashchange
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('/') && hash !== currentPath) {
        setCurrentPath(hash);
        if (hash.startsWith('/dispatcher')) setRoleState('dispatcher');
        else if (hash.startsWith('/hospital')) setRoleState('hospital');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentPath]);

  // -------------------------------------------------------------
  // FIRESTORE LIVE SYNC: Only attach onSnapshot when auth is active
  // -------------------------------------------------------------
  useEffect(() => {
    if (!user) return;

    let unsubEmergencies: () => void = () => {};
    let unsubHospitals: () => void = () => {};
    let unsubReservations: () => void = () => {};
    let unsubAmbulances: () => void = () => {};
    let unsubActivities: () => void = () => {};

    const initFirestoreSync = async () => {
      setIsFirestoreSyncing(true);
      try {
        // Check if emergencies collection has data or contains old US mock data
        const emSnap = await getDocs(collection(db, 'emergencies'));
        const hospSnap = await getDocs(collection(db, 'hospitals'));
        
        let needsIndianDataMigration = emSnap.empty || hospSnap.empty;
        if (!hospSnap.empty) {
          const firstHosp = hospSnap.docs[0].data();
          if (firstHosp?.name?.includes('St. Jude') || firstHosp?.address?.includes('Mercy Ridge')) {
            needsIndianDataMigration = true;
          }
        }

        if (needsIndianDataMigration) {
          // Seed / migrate with authentic Indian EMS dataset
          for (const item of INITIAL_EMERGENCIES) {
            await setDoc(doc(db, 'emergencies', item.id), item);
          }
          for (const item of INITIAL_HOSPITALS) {
            await setDoc(doc(db, 'hospitals', item.id), item);
          }
          for (const item of INITIAL_AMBULANCES) {
            await setDoc(doc(db, 'ambulances', item.id), item);
          }
          for (const item of INITIAL_RESERVATIONS) {
            await setDoc(doc(db, 'reservations', item.id), item);
          }
          for (const item of INITIAL_ACTIVITIES) {
            await setDoc(doc(db, 'activities', item.id), item);
          }
          setHasFirestoreData(true);
        } else {
          setHasFirestoreData(true);
        }

        // Attach listeners
        unsubEmergencies = onSnapshot(
          collection(db, 'emergencies'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list: EmergencyRequest[] = [];
              snapshot.forEach((d) => list.push(d.data() as EmergencyRequest));
              setEmergencies(list);
            }
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'emergencies')
        );

        unsubHospitals = onSnapshot(
          collection(db, 'hospitals'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list: Hospital[] = [];
              snapshot.forEach((d) => list.push(d.data() as Hospital));
              setHospitals(list);
            }
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'hospitals')
        );

        unsubReservations = onSnapshot(
          collection(db, 'reservations'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list: Reservation[] = [];
              snapshot.forEach((d) => list.push(d.data() as Reservation));
              setReservations(list);
            }
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'reservations')
        );

        unsubAmbulances = onSnapshot(
          collection(db, 'ambulances'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list: Ambulance[] = [];
              snapshot.forEach((d) => list.push(d.data() as Ambulance));
              setAmbulances(list);
            }
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'ambulances')
        );

        unsubActivities = onSnapshot(
          collection(db, 'activities'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list: ActivityEvent[] = [];
              snapshot.forEach((d) => list.push(d.data() as ActivityEvent));
              setActivities(list);
            }
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'activities')
        );
      } catch (error) {
        console.warn('Firestore initial sync encountered notice (falling back to live local state):', error);
      } finally {
        setIsFirestoreSyncing(false);
      }
    };

    initFirestoreSync();

    return () => {
      unsubEmergencies();
      unsubHospitals();
      unsubReservations();
      unsubAmbulances();
      unsubActivities();
    };
  }, [user]);

  // -------------------------------------------------------------
  // REAL-TIME SIMULATION TICKER
  // 1. Decrements reservation countdowns (60s hold)
  // 2. Increments hospital telemetry age
  // 3. Simulates live GPS coordinate movement for Medic 04 & Medic 08
  // -------------------------------------------------------------
  useEffect(() => {
    let tickCount = 0;
    const interval = setInterval(() => {
      tickCount++;

      // 1. Decrement reservation countdowns
      setReservations((prevRes) =>
        prevRes.map((res) => {
          if (res.status === 'HELD' && res.expiresInSeconds > 0) {
            const nextSec = res.expiresInSeconds - 1;
            if (nextSec === 0) {
              addToast(`Reservation ${res.id} for ${res.resourceBed} expired and released back to pool`, 'warning');
              const actId = 'act-' + Date.now();
              const newAct: ActivityEvent = {
                id: actId,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                timeAgo: 'Just now',
                type: 'reservation',
                title: `Hold Expired: ${res.resourceBed}`,
                description: `${res.resourceName} returned to available pool after 60s hold window elapsed.`,
                role: 'hospital',
                priority: 'stable',
              };
              setActivities((act) => [newAct, ...act]);
              return { ...res, expiresInSeconds: 0, status: 'EXPIRED' };
            }
            return { ...res, expiresInSeconds: nextSec };
          }
          return res;
        })
      );

      // 2. Telemetry age increment
      setHospitals((prevHosp) =>
        prevHosp.map((h) => {
          if (isStaleScenarioActive && h.id === 'st-jude') {
            // In Stale Scenario, St. Jude's telemetry is frozen/stale (> 320 seconds)
            return { ...h, lastUpdatedSecondsAgo: Math.min(480, h.lastUpdatedSecondsAgo + 2), isStale: true, staleReason: 'Telemetric uplink silent > 5 min. Manual phone confirmation required.' };
          }
          // Normal cycling
          const nextSec = h.lastUpdatedSecondsAgo >= 90 ? 12 : h.lastUpdatedSecondsAgo + 1;
          const isStale = nextSec > 60 || h.id === 'city-memorial';
          return {
            ...h,
            lastUpdatedSecondsAgo: nextSec,
            isStale,
            staleReason: isStale ? 'Data age exceeds 60s freshness threshold' : undefined,
          };
        })
      );

      // 3. Increment emergency elapsed time
      setEmergencies((prevEm) =>
        prevEm.map((em) => {
          if (em.status !== 'Handoff Complete') {
            return { ...em, timeElapsedSeconds: em.timeElapsedSeconds + 1 };
          }
          return em;
        })
      );

      // 4. Live ambulance telemetry tracking
      if (isLiveTrackingActive && tickCount % 2 === 0) {
        setAmbulances((prevAmbs) =>
          prevAmbs.map((amb) => {
            if (amb.status === 'En Route' || amb.status === 'Dispatched') {
              // Smoothly progress coordinates towards destination
              const targetLat = 37.7850;
              const targetLng = -122.4080;
              const deltaLat = (targetLat - amb.coordinates.lat) * 0.04;
              const deltaLng = (targetLng - amb.coordinates.lng) * 0.04;
              const jitterLat = (Math.random() - 0.5) * 0.0003;
              const jitterLng = (Math.random() - 0.5) * 0.0003;
              const nextLat = Number((amb.coordinates.lat + deltaLat + jitterLat).toFixed(5));
              const nextLng = Number((amb.coordinates.lng + deltaLng + jitterLng).toFixed(5));
              const speedFluctuation = Math.floor(40 + Math.random() * 12);
              const remainingDist = Math.max(0.2, Number((amb.distanceMiles - 0.04).toFixed(1)));
              const remainingEta = Math.max(1, Math.round(remainingDist * 2.2));

              return {
                ...amb,
                coordinates: { lat: nextLat, lng: nextLng },
                speedMph: speedFluctuation,
                distanceMiles: remainingDist,
                etaMinutes: remainingEta,
              };
            }
            return amb;
          })
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isStaleScenarioActive, isLiveTrackingActive, addToast]);

  // -------------------------------------------------------------
  // MULTI-CRITERIA DESTINATION RANKING ALGORITHM
  // Ranks suitable destinations by:
  // 1. Resource & Specialty Match (40% weight)
  // 2. Travel Time & Real-time ETA (30% weight)
  // 3. Data Freshness (15% weight - penalizes stale telemetry)
  // 4. Hospital Acceptance & Reliability (15% weight)
  // -------------------------------------------------------------
  const getRankedHospitalsForEmergency = useCallback(
    (emergencyId: string): HospitalRankResult[] => {
      const emergency = emergencies.find((e) => e.id === emergencyId) || emergencies[0];
      if (!emergency) return [];

      const required = (emergency.requiredResource || '').toLowerCase();

      return hospitals.map((hospital) => {
        // 1. Resource Match Score (0 - 40)
        let resourceScore = 0;
        const matchingRes = hospital.resources.find(
          (r) => r.name.toLowerCase().includes(required) || r.category.toLowerCase().includes(required)
        );

        if (matchingRes) {
          if (matchingRes.available >= 2) resourceScore = 40;
          else if (matchingRes.available === 1) resourceScore = 32;
          else if (matchingRes.reserved > 0) resourceScore = 15;
          else resourceScore = 5;
        } else {
          // Partial specialty check
          const hasSpecialty = hospital.specialties.some((s) => s.toLowerCase().includes('trauma') || s.toLowerCase().includes('cath'));
          resourceScore = hasSpecialty ? 20 : 8;
        }

        // Diversion override
        if (hospital.status === 'Diversion Active') {
          resourceScore = Math.min(resourceScore, 10);
        }

        // 2. Travel Time Score (0 - 30)
        // Faster ETA gives higher points
        const eta = hospital.currentEtaMinutes;
        let travelScore = 30;
        if (eta <= 5) travelScore = 30;
        else if (eta <= 8) travelScore = 26;
        else if (eta <= 12) travelScore = 20;
        else if (eta <= 18) travelScore = 12;
        else travelScore = 5;

        // 3. Data Freshness Score (0 - 15)
        // Fresh (<30s) = 15, moderate (31-60s) = 10, stale (>60s or marked isStale) = 0
        let freshnessScore = 15;
        let stalenessNotice: string | undefined;

        if (hospital.isStale || hospital.lastUpdatedSecondsAgo > 60) {
          freshnessScore = 0; // PENALIZED HEAVILY FOR STALE DATA
          stalenessNotice = `Telemetry ${hospital.lastUpdatedSecondsAgo}s old (Stale). CAD verified confirmation required before rolling.`;
        } else if (hospital.lastUpdatedSecondsAgo > 30) {
          freshnessScore = 9;
        }

        // 4. Reliability Score (0 - 15)
        const acceptance = hospital.reliability?.acceptanceRate || 85;
        const reliabilityScore = Math.min(15, Math.round((acceptance / 100) * 15));

        const totalScore = resourceScore + travelScore + freshnessScore + reliabilityScore;

        let notes = 'Optimal resource and transit fit.';
        if (hospital.status === 'Diversion Active') {
          notes = 'Diversion active: STEMI/Trauma teams saturated.';
        } else if (hospital.isStale || freshnessScore === 0) {
          notes = 'Caution: Capacity data stale. Phone confirmation advised.';
        } else if (matchingRes && matchingRes.available === 1) {
          notes = 'Only 1 bed remaining. Recommend immediate reservation lock.';
        }

        return {
          hospital,
          score: totalScore,
          breakdown: {
            resourceMatch: resourceScore,
            travelTime: travelScore,
            dataFreshness: freshnessScore,
            reliability: reliabilityScore,
          },
          isStale: hospital.isStale || hospital.lastUpdatedSecondsAgo > 60,
          stalenessWarning: stalenessNotice,
          notes,
        };
      }).sort((a, b) => b.score - a.score);
    },
    [emergencies, hospitals]
  );

  // -------------------------------------------------------------
  // SCENARIO TOGGLES
  // -------------------------------------------------------------
  const toggleStaleScenario = useCallback(() => {
    setIsStaleScenarioActive((prev) => {
      const next = !prev;
      if (next) {
        addToast('STALE DATA TEST: St. Jude telemetry frozen (>320s). Watch destination rankings adapt!', 'warning');
      } else {
        addToast('STALE DATA TEST: Restored real-time telemetry stream. All nodes fresh.', 'info');
      }
      return next;
    });
  }, [addToast]);

  const toggleLiveTracking = useCallback(() => {
    setIsLiveTrackingActive((prev) => {
      const next = !prev;
      addToast(next ? 'Live Ambulance GPS Tracking: Active' : 'Live Tracking: Paused', 'info');
      return next;
    });
  }, [addToast]);

  // -------------------------------------------------------------
  // DOUBLE-BOOKING CONFLICT SIMULATION
  // -------------------------------------------------------------
  const triggerDoubleBookingDemo = useCallback(() => {
    setDoubleBookingState({
      active: true,
      step: 'ambA_requested',
      ambABookedBed: 'ICU Bed #14',
      ambBMessage: '',
      failoverHospital: 'St. Jude Emergency Center',
    });

    addToast('Double-Booking Test: Medic 04 requesting last ICU Bed #14 at Mercy General...', 'info');

    // Step 2: Medic 04 gets reservation
    setTimeout(() => {
      setDoubleBookingState((prev) => ({
        ...prev,
        step: 'ambA_reserved',
      }));
      addToast('MEDIC 04: ICU Bed #14 Reserved Successfully (60s Lock Active) ✓', 'success');

      // Step 3: Medic 08 attempts to book the SAME bed simultaneously
      setTimeout(() => {
        setDoubleBookingState((prev) => ({
          ...prev,
          step: 'ambB_attempting',
        }));
        addToast('Medic 08 transmitting incoming request for the same ICU Bed #14...', 'warning');

        // Step 4: Atomic lock rejects Medic 08 and auto-reroutes
        setTimeout(() => {
          setDoubleBookingState((prev) => ({
            ...prev,
            step: 'ambB_conflict',
            ambBMessage: 'CONFLICT INTERCEPTED: ICU Bed #14 is currently held by Medic 04 (GM-2048). System prevented double-booking collision.',
          }));
          addToast('COLLISION INTERCEPTED: Resource locked. Auto-routing Medic 08 to St. Jude Bed #02.', 'error');

          setTimeout(() => {
            setDoubleBookingState((prev) => ({
              ...prev,
              step: 'ambB_rerouted',
              ambBMessage: 'FAILOVER COMPLETE: Medic 08 automatically re-routed to St. Jude ICU Bed #02 with verified arrival green corridor.',
            }));
            addToast('FAILOVER SUCCESS: Medic 08 routed to St. Jude (ETA 6m, 100% capacity match).', 'success');
          }, 1800);
        }, 1400);
      }, 1500);
    }, 1200);
  }, [addToast]);

  const resetDoubleBookingDemo = useCallback(() => {
    setDoubleBookingState({
      active: false,
      step: 'idle',
      ambABookedBed: 'ICU Bed #14',
      ambBMessage: '',
    });
    addToast('Double-booking test scenario reset.', 'info');
  }, [addToast]);

  // Roadblock scenario
  const simulateRoadblock = useCallback(() => {
    setIsRoadblockActive(true);
    setRoadblockState('detecting');
    addToast('ROADBLOCK DETECTED: Arterial blockage on Central Ave.', 'warning');

    setTimeout(() => {
      setRoadblockState('rerouting');
      addToast('Calculating green corridor bypass via Bay Shore Expressway...', 'info');

      setTimeout(() => {
        setRoadblockState('updated');
        setIsRoadblockActive(true);

        setEmergencies((prev) =>
          prev.map((em) => (em.id === 'GM-2048' ? { ...em, etaMinutes: 9 } : em))
        );
        setAmbulances((prev) =>
          prev.map((a) => (a.id === 'MEDIC-04' ? { ...a, etaMinutes: 9, distanceMiles: 3.1 } : a))
        );

        setHospitals((prev) =>
          prev.map((h) => {
            if (h.id === 'st-jude') return { ...h, currentEtaMinutes: 9, cadScore: 94 };
            if (h.id === 'mercy-general') return { ...h, currentEtaMinutes: 8, cadScore: 96 };
            return h;
          })
        );

        const nowSeconds = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const act: ActivityEvent = {
          id: 'act-' + Date.now(),
          timestamp: nowSeconds,
          timeAgo: 'Just now',
          type: 'route',
          title: 'Dynamic Reroute: Central Ave Obstructed',
          description: 'Ambulance 04 diverted via Bay Shore Expressway. Travel time recalculated: 12m → 9m.',
          role: 'dispatcher',
          priority: 'urgent',
        };
        setActivities((prev) => [act, ...prev]);

        addToast('ROUTE UPDATED: Alternate corridor active. ETA updated 12m → 9m.', 'success');
      }, 1200);
    }, 1000);
  }, [addToast]);

  const resetRoadblock = useCallback(() => {
    setIsRoadblockActive(false);
    setRoadblockState('normal');
    setEmergencies((prev) =>
      prev.map((em) => (em.id === 'GM-2048' ? { ...em, etaMinutes: 6 } : em))
    );
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id === 'st-jude') return { ...h, currentEtaMinutes: 6, cadScore: 98 };
        if (h.id === 'mercy-general') return { ...h, currentEtaMinutes: 10, cadScore: 89 };
        return h;
      })
    );
    addToast('Roadblock cleared: Restored direct route via Central Ave.', 'info');
  }, [addToast]);

  // -------------------------------------------------------------
  // CORE OPERATIONS WITH FIRESTORE PERSISTENCE
  // -------------------------------------------------------------
  const createEmergency = useCallback(
    async (data: {
      condition: string;
      priority: PriorityLevel;
      requiredResource: string;
      location: string;
      coordinates?: { lat: number; lng: number };
      specialRequirements?: string[];
    }): Promise<string> => {
      const nextNum = Math.floor(2051 + Math.random() * 50);
      const newId = `GM-${nextNum}`;
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const nowSeconds = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const newEmergency: EmergencyRequest = {
        id: newId,
        condition: data.condition,
        priority: data.priority,
        requiredResource: data.requiredResource,
        location: data.location,
        coordinates: data.coordinates || { lat: 37.7749, lng: -122.4194 },
        patientCount: 1,
        status: 'Searching',
        createdAt: nowStr,
        timeElapsedSeconds: 0,
        etaMinutes: 7,
        vitals: {
          hr: data.priority === 'critical' ? 122 : 94,
          bp: data.priority === 'critical' ? '86/52' : '124/78',
          spo2: data.priority === 'critical' ? 92 : 98,
          notes: 'Field telemetry linked. CAD intake protocol completed.',
        },
        specialRequirements: data.specialRequirements || ['Direct Bay Entry', 'MD Radio Link'],
        protocolStep: 'Protocol 10-A Priority Dispatch',
        timeline: [
          { stage: 'Emergency Created', completed: true, timestamp: nowSeconds, description: 'CAD intake flagged priority dispatch' },
          { stage: 'Hospital Search', completed: true, timestamp: nowSeconds, description: 'Matching regional hospitals based on real-time capacity' },
          { stage: 'Hospital Selected', completed: false, description: 'Awaiting dispatcher confirmation' },
          { stage: 'Resource Requested', completed: false, description: 'Pending selection' },
          { stage: 'Resource Held', completed: false, description: 'Pending' },
          { stage: 'Hospital Confirmed', completed: false, description: 'Pending' },
          { stage: 'Ambulance En Route', completed: false, description: 'Pending dispatch' },
          { stage: 'Hospital Arrival', completed: false, description: 'Pending' },
          { stage: 'Patient Handoff', completed: false, description: 'Pending' },
        ],
      };

      setEmergencies((prev) => [newEmergency, ...prev]);
      setSelectedEmergencyId(newId);

      const act: ActivityEvent = {
        id: 'act-' + Date.now(),
        timestamp: nowSeconds,
        timeAgo: 'Just now',
        type: 'emergency',
        title: `Emergency #${newId} Registered`,
        description: `${data.condition} (${data.priority.toUpperCase()}) at ${data.location}. Dispatch evaluating ranked facilities.`,
        role: 'dispatcher',
        priority: data.priority,
      };
      setActivities((prev) => [act, ...prev]);

      // Persist to Firestore if user authenticated
      if (user) {
        try {
          await setDoc(doc(db, 'emergencies', newId), newEmergency);
          await setDoc(doc(db, 'activities', act.id), act);
        } catch (e) {
          handleFirestoreError(e, OperationType.CREATE, `emergencies/${newId}`);
        }
      }

      addToast(`Emergency #${newId} logged. Ranking suitable hospital destinations...`, 'success');
      return newId;
    },
    [user, addToast]
  );

  const reserveResource = useCallback(
    async (emergencyId: string, hospitalId: string, resourceName: string, bedName: string) => {
      const resId = `RES-${Math.floor(9050 + Math.random() * 50)}`;
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const nowSeconds = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const targetHosp = hospitals.find((h) => h.id === hospitalId);
      const hospitalName = targetHosp?.name || 'Regional Hospital';

      const newReservation: Reservation = {
        id: resId,
        emergencyId,
        hospitalId,
        hospitalName,
        resourceName,
        resourceBed: bedName,
        createdAt: nowStr,
        expiresInSeconds: 60,
        status: 'HELD',
        assignedToAmbulance: 'Medic 04',
      };

      setReservations((prev) => [newReservation, ...prev]);

      // Update emergency
      let updatedEmergency: EmergencyRequest | undefined;
      setEmergencies((prev) =>
        prev.map((em) => {
          if (em.id === emergencyId) {
            const updatedTimeline = em.timeline.map((step) => {
              if (step.stage === 'Hospital Selected' || step.stage === 'Resource Requested' || step.stage === 'Resource Held') {
                return { ...step, completed: true, timestamp: nowSeconds };
              }
              return step;
            });
            const updated: EmergencyRequest = {
              ...em,
              status: 'Resource Held',
              assignedHospitalId: hospitalId,
              assignedBedId: bedName,
              timeline: updatedTimeline,
            };
            updatedEmergency = updated;
            return updated;
          }
          return em;
        })
      );

      // Decrement hospital available resource
      setHospitals((prev) =>
        prev.map((h) => {
          if (h.id === hospitalId) {
            return {
              ...h,
              resources: h.resources.map((r) => {
                if (r.name.toLowerCase().includes(resourceName.toLowerCase()) && r.available > 0) {
                  return { ...r, available: r.available - 1, reserved: r.reserved + 1 };
                }
                return r;
              }),
            };
          }
          return h;
        })
      );

      const act: ActivityEvent = {
        id: 'act-' + Date.now(),
        timestamp: nowSeconds,
        timeAgo: 'Just now',
        type: 'reservation',
        title: `Resource Held: ${bedName}`,
        description: `Held at ${hospitalName} for Emergency #${emergencyId} (60s hold window active).`,
        role: 'all',
        priority: 'urgent',
      };
      setActivities((prev) => [act, ...prev]);

      // Sync to Firestore
      if (user) {
        try {
          await setDoc(doc(db, 'reservations', resId), newReservation);
          if (updatedEmergency) {
            await setDoc(doc(db, 'emergencies', emergencyId), updatedEmergency);
          }
          await setDoc(doc(db, 'activities', act.id), act);
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, `reservations/${resId}`);
        }
      }

      addToast(`Resource ${bedName} held at ${hospitalName} (60s operational hold window active)`, 'success');
    },
    [hospitals, user, addToast]
  );

  const confirmHospitalRequest = useCallback(
    async (emergencyId: string) => {
      const nowSeconds = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      let updatedEmergency: EmergencyRequest | undefined;

      setEmergencies((prev) =>
        prev.map((em) => {
          if (em.id === emergencyId) {
            const updatedTimeline = em.timeline.map((step) => {
              if (
                step.stage === 'Hospital Selected' ||
                step.stage === 'Resource Requested' ||
                step.stage === 'Resource Held' ||
                step.stage === 'Hospital Confirmed' ||
                step.stage === 'Ambulance En Route'
              ) {
                return { ...step, completed: true, timestamp: nowSeconds };
              }
              return step;
            });
            const updated: EmergencyRequest = {
              ...em,
              status: 'En Route',
              timeline: updatedTimeline,
            };
            updatedEmergency = updated;
            return updated;
          }
          return em;
        })
      );

      // Confirm reservation
      setReservations((prev) =>
        prev.map((r) => {
          if (r.emergencyId === emergencyId && r.status === 'HELD') {
            return { ...r, status: 'CONFIRMED', expiresInSeconds: 0 };
          }
          return r;
        })
      );

      const act: ActivityEvent = {
        id: 'act-' + Date.now(),
        timestamp: nowSeconds,
        timeAgo: 'Just now',
        type: 'hospital',
        title: `Hospital Intake Confirmed #${emergencyId}`,
        description: `Staff confirmed bed reservation & pre-cleared resuscitation bay. Ambulance is en route.`,
        role: 'all',
        priority: 'critical',
      };
      setActivities((prev) => [act, ...prev]);

      if (user) {
        try {
          if (updatedEmergency) {
            await setDoc(doc(db, 'emergencies', emergencyId), updatedEmergency);
          }
          await setDoc(doc(db, 'activities', act.id), act);
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, `emergencies/${emergencyId}`);
        }
      }

      addToast(`Intake Confirmed for #${emergencyId}. Ambulance rolling with green corridor.`, 'success');
    },
    [user, addToast]
  );

  const rejectHospitalRequest = useCallback(
    async (emergencyId: string, reason = 'Facility saturation reached') => {
      const nowSeconds = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setEmergencies((prev) =>
        prev.map((em) => {
          if (em.id === emergencyId) {
            return { ...em, status: 'Searching', assignedHospitalId: undefined, assignedBedId: undefined };
          }
          return em;
        })
      );

      setReservations((prev) =>
        prev.map((r) => {
          if (r.emergencyId === emergencyId && r.status === 'HELD') {
            return { ...r, status: 'REJECTED', expiresInSeconds: 0 };
          }
          return r;
        })
      );

      const act: ActivityEvent = {
        id: 'act-' + Date.now(),
        timestamp: nowSeconds,
        timeAgo: 'Just now',
        type: 'hospital',
        title: `Request Declined for #${emergencyId}`,
        description: `Hospital declined: ${reason}. CAD rerouting to secondary facility.`,
        role: 'all',
        priority: 'urgent',
      };
      setActivities((prev) => [act, ...prev]);

      if (user) {
        try {
          await updateDoc(doc(db, 'emergencies', emergencyId), {
            status: 'Searching',
            assignedHospitalId: null,
            assignedBedId: null,
          });
          await setDoc(doc(db, 'activities', act.id), act);
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, `emergencies/${emergencyId}`);
        }
      }

      addToast(`Request #${emergencyId} declined (${reason}). Re-routing...`, 'warning');
    },
    [user, addToast]
  );

  const completeHandoff = useCallback(
    async (emergencyId: string) => {
      const nowSeconds = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      let completedEmergency: EmergencyRequest | undefined;

      setEmergencies((prev) =>
        prev.map((em) => {
          if (em.id === emergencyId) {
            completedEmergency = em;
            const updatedTimeline = em.timeline.map((step) => ({
              ...step,
              completed: true,
              timestamp: step.timestamp || nowSeconds,
            }));
            return {
              ...em,
              status: 'Handoff Complete',
              timeline: updatedTimeline,
            };
          }
          return em;
        })
      );

      if (completedEmergency) {
        const hist: HistoricalEmergency = {
          id: completedEmergency.id,
          patientCondition: completedEmergency.condition,
          hospitalName:
            hospitals.find((h) => h.id === completedEmergency?.assignedHospitalId)?.name || 'Mercy General Trauma Center',
          ambulanceId: completedEmergency.assignedAmbulanceId || 'Medic 04',
          priority: completedEmergency.priority,
          durationMinutes: Math.round(completedEmergency.timeElapsedSeconds / 60) || 24,
          outcome: 'Handoff Complete',
          date: 'Just now',
          totalDistance: '2.8 mi',
          doorToNeedleMinutes: 16,
        };
        setHistory((prev) => [hist, ...prev]);
      }

      const act: ActivityEvent = {
        id: 'act-' + Date.now(),
        timestamp: nowSeconds,
        timeAgo: 'Just now',
        type: 'handoff',
        title: `Patient Handoff Complete #${emergencyId}`,
        description: `Definitive clinical transfer completed. Hospital team signed off. Unit clear for next call.`,
        role: 'all',
        priority: 'stable',
      };
      setActivities((prev) => [act, ...prev]);

      if (user) {
        try {
          await updateDoc(doc(db, 'emergencies', emergencyId), { status: 'Handoff Complete' });
          await setDoc(doc(db, 'activities', act.id), act);
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, `emergencies/${emergencyId}`);
        }
      }

      addToast(`Handoff Complete for #${emergencyId}. Transferred to hospital medical team.`, 'success');
    },
    [hospitals, user, addToast]
  );

  const saveHandoverSummary = useCallback(
    async (emergencyId: string, handover: HandoverSummary) => {
      setEmergencies((prev) =>
        prev.map((em) => {
          if (em.id === emergencyId) {
            return {
              ...em,
              handover,
            };
          }
          return em;
        })
      );

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const act: ActivityEvent = {
        id: 'act-' + Date.now(),
        timestamp: nowTime,
        timeAgo: 'Just now',
        type: 'emergency',
        title: `Gemini AI Handover Briefing Generated #${emergencyId}`,
        description: `Paramedic handover dictated by ${handover.medicName} (${handover.ambulanceCallSign}) transmitted to hospital triage.`,
        role: 'all',
        priority: 'critical',
      };
      setActivities((prev) => [act, ...prev]);

      if (user) {
        try {
          await updateDoc(doc(db, 'emergencies', emergencyId), {
            handover,
          });
          await setDoc(doc(db, 'activities', act.id), act);
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, `emergencies/${emergencyId}`);
        }
      }

      addToast(`AI Handover briefing for #${emergencyId} transmitted to hospital triage.`, 'success');
    },
    [user, addToast]
  );

  const updateAmbulanceStatus = useCallback(
    async (ambulanceId: string, status: Ambulance['status']) => {
      setAmbulances((prev) =>
        prev.map((a) => (a.id === ambulanceId ? { ...a, status } : a))
      );
      if (user) {
        try {
          await updateDoc(doc(db, 'ambulances', ambulanceId), { status });
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, `ambulances/${ambulanceId}`);
        }
      }
      addToast(`Unit ${ambulanceId} status: ${status}`, 'info');
    },
    [user, addToast]
  );

  const updateResourceQuantity = useCallback(
    async (hospitalId: string, resourceId: string, field: 'available' | 'occupied' | 'maintenance', delta: number) => {
      setHospitals((prev) =>
        prev.map((h) => {
          if (h.id === hospitalId) {
            return {
              ...h,
              resources: h.resources.map((r) => {
                if (r.id === resourceId) {
                  const newVal = Math.max(0, r[field] + delta);
                  return { ...r, [field]: newVal };
                }
                return r;
              }),
            };
          }
          return h;
        })
      );
      addToast(`Hospital resource balance updated`, 'info');
    },
    [addToast]
  );

  const toggleAudioTriage = useCallback(() => {
    setAudioTriageLive((prev) => {
      const next = !prev;
      addToast(next ? 'Audio Triage: Live Stream Active' : 'Audio Triage: Muted', 'info');
      return next;
    });
  }, [addToast]);

  return (
    <EMSContext.Provider
      value={{
        role,
        setRole,
        currentPath,
        navigate,
        emergencies,
        hospitals,
        ambulances,
        reservations,
        activities,
        history,
        selectedEmergencyId,
        setSelectedEmergencyId,
        selectedHospitalId,
        setSelectedHospitalId,
        selectedAmbulanceId,
        setSelectedAmbulanceId,
        isRoadblockActive,
        roadblockState,
        simulateRoadblock,
        resetRoadblock,
        isStaleScenarioActive,
        toggleStaleScenario,
        isLiveTrackingActive,
        toggleLiveTracking,
        doubleBookingState,
        triggerDoubleBookingDemo,
        resetDoubleBookingDemo,
        getRankedHospitalsForEmergency,
        createEmergency,
        reserveResource,
        confirmHospitalRequest,
        rejectHospitalRequest,
        completeHandoff,
        saveHandoverSummary,
        updateAmbulanceStatus,
        updateResourceQuantity,
        audioTriageLive,
        toggleAudioTriage,
        isFirestoreSyncing,
        hasFirestoreData,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </EMSContext.Provider>
  );
};

export const useEMS = () => {
  const context = useContext(EMSContext);
  if (!context) {
    throw new Error('useEMS must be used within an EMSProvider');
  }
  return context;
};
