import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import L from 'leaflet';
import { useEMS } from '../../context/EMSContext';
import { Hospital, Ambulance, EmergencyRequest } from '../../types';

// Fix Leaflet's default icon URL references for bundlers
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface GoogleMapsNavigationProps {
  heightClass?: string;
  selectedEntityId?: string;
  onSelectEntity?: (entityType: 'hospital' | 'ambulance' | 'emergency', id: string) => void;
  showControls?: boolean;
  initialMode?: 'driver' | 'overview';
}

interface NavigationStep {
  distanceText: string;
  streetName: string;
  icon: string;
  secondaryText: string;
  lanes: ('straight' | 'right' | 'left' | 'active-right' | 'active-left' | 'active-straight')[];
}

// Real road coordinates along Mumbai arterial corridor from Sion Flyover to KEM Hospital Parel
const PRIMARY_MUMBAI_ROUTE: [number, number][] = [
  [19.0435, 72.8615], // Sion Flyover / Eastern Express Highway Junction
  [19.0392, 72.8598], // Sion Circle
  [19.0335, 72.8576], // Maheshwari Udyan / King's Circle
  [19.0272, 72.8545], // Dr. Babasaheb Ambedkar Road (Ruia College cut)
  [19.0210, 72.8520], // Dadar TT Circle
  [19.0145, 72.8488], // Hindmata Flyover Junction
  [19.0080, 72.8455], // Parel TT Junction
  [19.0042, 72.8436], // Acharya Donde Marg turn
  [19.0026, 72.8427], // KEM Hospital Emergency Resus Bay 2
];

// Detour route via Wadala & Eastern Freeway when Dadar TT is blocked
const DETOUR_MUMBAI_ROUTE: [number, number][] = [
  [19.0435, 72.8615], // Sion Flyover
  [19.0380, 72.8680], // Wadala Flyover approach
  [19.0295, 72.8710], // Eastern Freeway Wadala Ramp
  [19.0200, 72.8690], // Sewri arterial bridge
  [19.0110, 72.8590], // Jerbai Wadia Road bypass
  [19.0050, 72.8470], // Parel East entrance
  [19.0026, 72.8427], // KEM Hospital Emergency Bay
];

// Secondary Route polyline for Lilavati Hospital Bandra
const LILAVATI_ROUTE: [number, number][] = [
  [19.0400, 72.8185], // Bandra-Worli Sea Link Toll Approach
  [19.0450, 72.8220], // Bandra Reclamation arterial
  [19.0485, 72.8250], // KC College / Reclamation flyover
  [19.0519, 72.8290], // Lilavati Hospital & Research Centre
];

export const GoogleMapsNavigation: React.FC<GoogleMapsNavigationProps> = ({
  heightClass = 'h-[580px]',
  onSelectEntity,
  showControls = true,
  initialMode = 'driver',
}) => {
  const {
    hospitals,
    ambulances,
    emergencies,
    isRoadblockActive,
    simulateRoadblock,
    resetRoadblock,
    isLiveTrackingActive,
  } = useEMS();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const ambMarkerRef = useRef<L.Marker | null>(null);

  const [mode, setMode] = useState<'driver' | 'overview'>(initialMode);
  const [mapType, setMapType] = useState<'voyager' | 'satellite' | 'osm' | 'dark'>('voyager');
  const [showTraffic, setShowTraffic] = useState<boolean>(true);
  const [showCorridorShields, setShowCorridorShields] = useState<boolean>(true);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [routeProgress, setRouteProgress] = useState<number>(0.28); // 0 to 1 along route
  const [activeSidePanel, setActiveSidePanel] = useState<{
    type: 'hospital' | 'ambulance' | 'emergency';
    data: Hospital | Ambulance | EmergencyRequest;
  } | null>(null);

  const activeEmergency = emergencies.find((e) => e.id === 'GM-2048') || emergencies[0];
  const medic04 = ambulances.find((a) => a.id === 'MEDIC-04') || ambulances[0];

  // Dynamic route selection
  const currentRoute = isRoadblockActive ? DETOUR_MUMBAI_ROUTE : PRIMARY_MUMBAI_ROUTE;

  // Total route distance in kilometers
  const totalRouteKm = useMemo(() => {
    let sumMeters = 0;
    for (let i = 0; i < currentRoute.length - 1; i++) {
      const p1 = currentRoute[i];
      const p2 = currentRoute[i + 1];
      sumMeters += L.latLng(p1[0], p1[1]).distanceTo(L.latLng(p2[0], p2[1]));
    }
    return sumMeters / 1000;
  }, [currentRoute]);

  // Current GPS coordinates of the moving ambulance
  const currentAmbulanceCoord = useMemo<[number, number]>(() => {
    const totalSegments = currentRoute.length - 1;
    const scaledProg = Math.max(0, Math.min(1, routeProgress)) * totalSegments;
    const segmentIndex = Math.min(Math.floor(scaledProg), totalSegments - 1);
    const segmentFraction = scaledProg - segmentIndex;

    const p1 = currentRoute[segmentIndex];
    const p2 = currentRoute[segmentIndex + 1];

    const lat = p1[0] + (p2[0] - p1[0]) * segmentFraction;
    const lng = p1[1] + (p2[1] - p1[1]) * segmentFraction;
    return [lat, lng];
  }, [currentRoute, routeProgress]);

  // Heading angle for the vehicle navigation puck icon
  const currentHeading = useMemo(() => {
    const totalSegments = currentRoute.length - 1;
    const scaledProg = Math.max(0, Math.min(1, routeProgress)) * totalSegments;
    const segmentIndex = Math.min(Math.floor(scaledProg), totalSegments - 1);
    const p1 = currentRoute[segmentIndex];
    const p2 = currentRoute[segmentIndex + 1];
    const dLat = p2[0] - p1[0];
    const dLng = p2[1] - p1[1];
    const angleDeg = (Math.atan2(dLng, dLat) * 180) / Math.PI;
    return (angleDeg + 360) % 360;
  }, [currentRoute, routeProgress]);

  // -------------------------------------------------------------
  // DYNAMIC ESTIMATED TIME OF ARRIVAL (ETA) ENGINE
  // -------------------------------------------------------------
  const dynamicEtaData = useMemo(() => {
    const totalSegments = currentRoute.length - 1;
    const scaledProg = Math.max(0, Math.min(1, routeProgress)) * totalSegments;
    const segmentIndex = Math.min(Math.floor(scaledProg), totalSegments - 1);

    // Distance from current position to next waypoint
    const nextWaypoint = currentRoute[segmentIndex + 1];
    let remainingMeters = L.latLng(currentAmbulanceCoord[0], currentAmbulanceCoord[1]).distanceTo(
      L.latLng(nextWaypoint[0], nextWaypoint[1])
    );

    // Add remaining route segments up to destination hospital
    for (let i = segmentIndex + 1; i < totalSegments; i++) {
      const p1 = currentRoute[i];
      const p2 = currentRoute[i + 1];
      remainingMeters += L.latLng(p1[0], p1[1]).distanceTo(L.latLng(p2[0], p2[1]));
    }

    const remainingKm = Math.max(0.08, remainingMeters / 1000);

    // Ambulance cruising speed (km/h) based on corridor clearance and detour
    const currentSpeedKmH = isRoadblockActive ? 42 : 56;

    // Remaining transit time in seconds
    const remainingSeconds = Math.max(20, Math.round((remainingKm / currentSpeedKmH) * 3600));
    const etaMinutes = Math.floor(remainingSeconds / 60);
    const etaSeconds = remainingSeconds % 60;

    // Projected arrival clock timestamp
    const now = new Date();
    now.setSeconds(now.getSeconds() + remainingSeconds);
    const arrivalTimeClock = now.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    });

    const progressPercent = Math.min(
      98,
      Math.max(2, Math.round(((totalRouteKm - remainingKm) / totalRouteKm) * 100))
    );

    return {
      remainingKm,
      remainingSeconds,
      etaMinutes,
      etaSeconds,
      arrivalTimeClock,
      progressPercent,
      currentSpeedKmH,
    };
  }, [currentRoute, routeProgress, currentAmbulanceCoord, totalRouteKm, isRoadblockActive]);

  // Turn-by-Turn Dynamic Navigation Step for Ambulance Driver HUD
  const currentStep: NavigationStep = useMemo(() => {
    if (isRoadblockActive) {
      return {
        distanceText: 'In 250 m',
        streetName: 'Turn right onto Eastern Freeway (Wadala Bypass Ramp)',
        icon: 'turn_right',
        secondaryText: 'Rerouted around Dadar TT congestion • Green Corridor active',
        lanes: ['straight', 'active-right', 'active-right'],
      };
    }

    if (routeProgress < 0.28) {
      return {
        distanceText: 'In 300 m',
        streetName: 'Proceed straight onto Dr. Babasaheb Ambedkar Road (NH 48)',
        icon: 'straight',
        secondaryText: 'Sion Circle signal pre-empted green • Maintain 55 km/h',
        lanes: ['active-straight', 'active-straight', 'right'],
      };
    } else if (routeProgress < 0.65) {
      return {
        distanceText: 'In 1.2 km',
        streetName: 'Continue straight through Dadar TT & Hindmata Junctions',
        icon: 'straight',
        secondaryText: 'Opticom Green Wave active: 3 signals locked green for MH 01 EA 1084',
        lanes: ['straight', 'active-straight', 'active-straight'],
      };
    } else if (routeProgress < 0.9) {
      return {
        distanceText: 'In 350 m',
        streetName: 'Turn left onto Acharya Donde Marg toward KEM Emergency Gate',
        icon: 'turn_left',
        secondaryText: 'Parel TT clearance active • Trauma Resus Bay 2 prepared',
        lanes: ['active-left', 'straight', 'straight'],
      };
    } else {
      return {
        distanceText: 'In 50 m',
        streetName: 'Arriving at KEM Hospital Emergency Resus Bay 2',
        icon: 'local_hospital',
        secondaryText: 'Trauma & Cath Lab teams on immediate standby',
        lanes: ['active-straight', 'straight'],
      };
    }
  }, [routeProgress, isRoadblockActive]);

  // Handle entity selection callback
  const handleSelect = useCallback(
    (type: 'hospital' | 'ambulance' | 'emergency', id: string) => {
      if (type === 'hospital') {
        const h = hospitals.find((item) => item.id === id);
        if (h) setActiveSidePanel({ type, data: h });
      } else if (type === 'ambulance') {
        const a = ambulances.find((item) => item.id === id);
        if (a) setActiveSidePanel({ type, data: a });
      } else {
        const e = emergencies.find((item) => item.id === id);
        if (e) setActiveSidePanel({ type, data: e });
      }
      onSelectEntity?.(type, id);
    },
    [hospitals, ambulances, emergencies, onSelectEntity]
  );

  // Simulated live telemetry movement along route
  useEffect(() => {
    if (!isLiveTrackingActive) return;

    const interval = setInterval(() => {
      setRouteProgress((prev) => {
        if (prev >= 0.96) return 0.08; // smooth restart
        return prev + 0.012;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isLiveTrackingActive]);

  // -------------------------------------------------------------
  // INITIALIZE LEAFLET MAP
  // -------------------------------------------------------------
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [19.028, 72.853],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      const routesGroup = L.layerGroup().addTo(map);
      const markersGroup = L.layerGroup().addTo(map);

      routesLayerRef.current = routesGroup;
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // -------------------------------------------------------------
  // UPDATE BASE TILE LAYER
  // -------------------------------------------------------------
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    let subdomains = 'abcd';
    let maxZoom = 19;

    if (mapType === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      subdomains = '';
      maxZoom = 18;
    } else if (mapType === 'osm') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      subdomains = 'abc';
      maxZoom = 19;
    } else if (mapType === 'dark') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      subdomains = 'abcd';
      maxZoom = 19;
    }

    const tileLayer = L.tileLayer(tileUrl, {
      subdomains,
      maxZoom,
    });
    tileLayer.addTo(map);

    if (mapType === 'satellite') {
      const labelLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 18 }
      );
      labelLayer.addTo(map);
    }
  }, [mapType]);

  // -------------------------------------------------------------
  // BUILD DYNAMIC AMBULANCE ETA POPUP HTML
  // -------------------------------------------------------------
  const generateAmbulancePopupHtml = useCallback(() => {
    const {
      remainingKm,
      etaMinutes,
      etaSeconds,
      arrivalTimeClock,
      progressPercent,
      currentSpeedKmH,
    } = dynamicEtaData;

    return `
      <div class="p-4 w-[310px] select-none font-sans text-slate-800">
        <!-- Top Header: Ambulance Node & Live Code 3 Status -->
        <div class="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <span class="material-symbols-outlined text-[18px]">ambulance</span>
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <h4 class="text-xs font-black text-slate-900 leading-tight">MH 01 EA 1084</h4>
                <span class="bg-blue-100 text-blue-700 text-[9px] px-1 rounded font-extrabold">108</span>
              </div>
              <span class="text-[10px] text-slate-500 font-semibold">Medic 04 • ALS-1 Advanced Unit</span>
            </div>
          </div>
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
            Code 3 Priority
          </span>
        </div>

        <!-- DYNAMIC ESTIMATED TIME OF ARRIVAL (HERO BLOCK) -->
        <div class="mt-3 p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-500/15 border border-emerald-300 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
              <span class="material-symbols-outlined text-[15px] text-emerald-600">timer</span>
              Dynamic ETA Countdown
            </span>
            <span class="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded-full">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              LIVE GPS
            </span>
          </div>

          <!-- Big Live ETA Counter -->
          <div class="flex items-baseline gap-2 mt-1.5">
            <span class="text-3xl font-black text-emerald-700 tracking-tight tabular-nums font-mono">
              ${etaMinutes}m ${etaSeconds < 10 ? '0' : ''}${etaSeconds}s
            </span>
            <span class="text-[11px] font-bold text-emerald-800/80">to hospital bay</span>
          </div>

          <!-- Live Sub-metrics: Arrival Clock & Remaining Distance -->
          <div class="grid grid-cols-2 gap-2 mt-2.5 pt-2.5 border-t border-emerald-200/80 text-[11px]">
            <div class="bg-white/70 p-1.5 rounded-lg border border-emerald-100">
              <span class="text-[9px] uppercase font-bold text-slate-500 block">Est. Arrival Time</span>
              <span class="font-extrabold text-slate-900 font-mono text-xs tabular-nums">${arrivalTimeClock}</span>
            </div>
            <div class="bg-white/70 p-1.5 rounded-lg border border-emerald-100">
              <span class="text-[9px] uppercase font-bold text-slate-500 block">Distance to Resus</span>
              <span class="font-extrabold text-blue-700 font-mono text-xs tabular-nums">${remainingKm.toFixed(2)} km</span>
            </div>
          </div>

          <!-- Transit Route Progress Bar -->
          <div class="mt-2.5">
            <div class="flex items-center justify-between text-[10px] font-bold text-emerald-900 mb-1">
              <span>Corridor Transit Completed</span>
              <span class="tabular-nums font-mono">${progressPercent}%</span>
            </div>
            <div class="w-full h-2 bg-emerald-200/70 rounded-full overflow-hidden p-0.5">
              <div class="h-full bg-emerald-600 rounded-full transition-all duration-700 ease-out shadow-xs" style="width: ${progressPercent}%;"></div>
            </div>
          </div>
        </div>

        <!-- Transit & Patient Details -->
        <div class="mt-3 flex flex-col gap-1.5 text-[11px] text-slate-600">
          <div class="flex items-center justify-between py-1 border-b border-slate-100">
            <span class="text-slate-400 font-medium">Destination:</span>
            <span class="font-bold text-slate-900 text-right truncate max-w-[170px]">KEM Hospital & GS Med (Parel)</span>
          </div>
          <div class="flex items-center justify-between py-1 border-b border-slate-100">
            <span class="text-slate-400 font-medium">Reserved Bay:</span>
            <span class="font-bold text-blue-700">Cath Lab Bay 02 (Standby)</span>
          </div>
          <div class="flex items-center justify-between py-1 border-b border-slate-100">
            <span class="text-slate-400 font-medium">Patient Acuity:</span>
            <span class="font-bold text-slate-800">Rahul Verma (54M) • Acute STEMI</span>
          </div>
          <div class="flex items-center justify-between py-1 border-b border-slate-100">
            <span class="text-slate-400 font-medium">EMS Crew Lead:</span>
            <span class="font-bold text-slate-800">Dr. Rakesh Patil, MBBS</span>
          </div>
          <div class="flex items-center justify-between py-1">
            <span class="text-slate-400 font-medium">Traffic Corridor:</span>
            <span class="font-bold text-emerald-700 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Locked Green (${currentSpeedKmH} km/h)
            </span>
          </div>
        </div>

        <!-- Quick Action Trigger Button inside Popup -->
        <div class="mt-3 pt-2 border-t border-slate-100 flex items-center gap-2">
          <button
            id="popup-inspect-btn"
            type="button"
            class="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span class="material-symbols-outlined text-[15px]">vital_signs</span>
            <span>Inspect Telemetry & Case</span>
          </button>
        </div>
      </div>
    `;
  }, [dynamicEtaData]);

  // -------------------------------------------------------------
  // UPDATE ROUTES, HOSPITALS & AMBULANCES
  // -------------------------------------------------------------
  useEffect(() => {
    const map = mapInstanceRef.current;
    const routesGroup = routesLayerRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !routesGroup || !markersGroup) return;

    routesGroup.clearLayers();
    markersGroup.clearLayers();

    // 1. Render Navigation Routes
    const routePolyCasing = L.polyline(currentRoute, {
      color: '#1e3a8a',
      weight: 10,
      opacity: 0.45,
      lineCap: 'round',
      lineJoin: 'round',
    });
    routesGroup.addLayer(routePolyCasing);

    const routePolyline = L.polyline(currentRoute, {
      color: isRoadblockActive ? '#ea580c' : '#2563eb',
      weight: 6,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    });
    routesGroup.addLayer(routePolyline);

    // Lilavati branch polyline
    const lilavatiPoly = L.polyline(LILAVATI_ROUTE, {
      color: '#64748b',
      weight: 5,
      opacity: 0.7,
      dashArray: '8, 8',
      lineCap: 'round',
    });
    routesGroup.addLayer(lilavatiPoly);

    // 2. Traffic Overlay
    if (showTraffic) {
      const greenSection = L.polyline(currentRoute.slice(1, 4), {
        color: '#10b981',
        weight: 3.5,
        opacity: 0.9,
      });
      routesGroup.addLayer(greenSection);

      const yellowSection = L.polyline(currentRoute.slice(4, 6), {
        color: '#f59e0b',
        weight: 3.5,
        opacity: 0.85,
      });
      routesGroup.addLayer(yellowSection);

      if (isRoadblockActive) {
        const redSection = L.circle([19.021, 72.852], {
          radius: 180,
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.35,
          weight: 2,
        });
        routesGroup.addLayer(redSection);
      }
    }

    // 3. Render Opticom Green Wave Junctions
    if (showCorridorShields) {
      const corridorJunctions: { name: string; coord: [number, number]; status: string }[] = [
        { name: 'Sion Circle', coord: [19.0392, 72.8598], status: 'LOCKED GREEN' },
        { name: 'King’s Circle', coord: [19.0335, 72.8576], status: 'LOCKED GREEN' },
        { name: 'Dadar TT Circle', coord: [19.021, 72.852], status: isRoadblockActive ? 'BLOCKED' : 'LOCKED GREEN' },
        { name: 'Hindmata Flyover', coord: [19.0145, 72.8488], status: 'LOCKED GREEN' },
        { name: 'Parel TT Junction', coord: [19.008, 72.8455], status: 'LOCKED GREEN' },
      ];

      corridorJunctions.forEach((j) => {
        const isBlocked = j.status === 'BLOCKED';
        const shieldIcon = L.divIcon({
          className: 'custom-leaflet-icon',
          html: `
            <div class="flex items-center gap-1 px-1.5 py-0.5 rounded-full ${
              isBlocked ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
            } shadow-md text-[9px] font-bold border border-white whitespace-nowrap cursor-pointer hover:scale-110 transition-transform">
              <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              <span>${j.name}</span>
            </div>
          `,
          iconSize: [80, 20],
          iconAnchor: [40, 10],
        });

        const jMarker = L.marker(j.coord, { icon: shieldIcon });
        jMarker.bindTooltip(`Traffic Signal Pre-emption: ${j.name} (${j.status})`, {
          direction: 'top',
          offset: [0, -10],
        });
        markersGroup.addLayer(jMarker);
      });
    }

    // 4. Render Hospital Pins
    hospitals.forEach((h) => {
      const isSelected = activeSidePanel?.data.id === h.id;
      const isDiversion = h.status === 'Diversion Active';
      const coord: [number, number] =
        h.id === 'st-jude'
          ? [19.0026, 72.8427] // KEM Hospital Parel
          : h.id === 'mercy-general'
          ? [19.0519, 72.829] // Lilavati Hospital Bandra
          : h.id === 'city-memorial'
          ? [19.033, 72.8397] // Hinduja Hospital Mahim
          : [19.167, 72.946]; // Fortis Mulund

      const hospitalIcon = L.divIcon({
        className: 'custom-leaflet-icon',
        html: `
          <div class="relative group cursor-pointer">
            <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl ${
              isDiversion
                ? 'bg-amber-600 text-white shadow-amber-900/30'
                : 'bg-white text-slate-900 border-2 border-emerald-600 shadow-emerald-900/20'
            } shadow-lg font-bold text-xs transition-all duration-200 transform group-hover:scale-105 ${
              isSelected ? 'ring-3 ring-blue-500 scale-105' : ''
            }">
              <div class="w-5 h-5 rounded-lg ${
                isDiversion ? 'bg-amber-700' : 'bg-emerald-100 text-emerald-700'
              } flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[14px]">local_hospital</span>
              </div>
              <div class="flex flex-col text-left leading-tight pr-1">
                <span class="text-[11px] font-extrabold tracking-tight truncate max-w-[130px]">${h.name.split(' ')[0]} ${h.name.split(' ')[1] || ''}</span>
                <span class="text-[9px] ${isDiversion ? 'text-amber-200 font-semibold' : 'text-emerald-700 font-bold'}">
                  ${isDiversion ? 'Cath Diversion' : `${h.openCathBays + h.traumaBaysAvailable} Bays Avail • ${h.currentEtaMinutes}m`}
                </span>
              </div>
            </div>
            <div class="w-2.5 h-2.5 ${
              isDiversion ? 'bg-amber-600' : 'bg-emerald-600'
            } rotate-45 mx-auto -mt-1 shadow-xs"></div>
          </div>
        `,
        iconSize: [160, 48],
        iconAnchor: [80, 48],
      });

      const hospMarker = L.marker(coord, { icon: hospitalIcon });
      hospMarker.on('click', () => handleSelect('hospital', h.id));
      markersGroup.addLayer(hospMarker);
    });

    // 5. Render Active Incident Beacon (Sion Flyover)
    const incidentCoord: [number, number] = [19.0435, 72.8615];
    const incidentIcon = L.divIcon({
      className: 'custom-leaflet-icon',
      html: `
        <div class="relative cursor-pointer group">
          <div class="absolute -inset-3 bg-rose-500/25 rounded-full animate-ping"></div>
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-600 text-white shadow-xl border border-rose-400 font-bold text-xs">
            <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <span>REQ #GM-2048</span>
          </div>
          <div class="w-2.5 h-2.5 bg-rose-600 rotate-45 mx-auto -mt-1"></div>
        </div>
      `,
      iconSize: [120, 40],
      iconAnchor: [60, 40],
    });

    const incMarker = L.marker(incidentCoord, { icon: incidentIcon });
    incMarker.on('click', () => handleSelect('emergency', 'GM-2048'));
    markersGroup.addLayer(incMarker);

    // 6. Render Secondary Ambulances in Fleet with their own ETA Popups
    // Medic 08 (BKC -> Lilavati Hospital)
    const medic08Coord: [number, number] = [19.0657, 72.8656];
    const medic08Icon = L.divIcon({
      className: 'custom-leaflet-icon',
      html: `
        <div class="relative cursor-pointer group">
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white text-slate-800 shadow-md border-2 border-blue-500 text-[10px] font-bold">
            <div class="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
              <span class="material-symbols-outlined text-[11px]">ambulance</span>
            </div>
            <span>MH 02 BG 1088</span>
            <span class="text-blue-600 font-black">16m</span>
          </div>
          <div class="w-2 h-2 bg-blue-500 rotate-45 mx-auto -mt-1"></div>
        </div>
      `,
      iconSize: [140, 36],
      iconAnchor: [70, 36],
    });
    const m08Marker = L.marker(medic08Coord, { icon: medic08Icon });
    m08Marker.bindPopup(`
      <div class="p-3 w-56 text-xs text-slate-800">
        <h5 class="font-bold text-slate-900">MH 02 BG 1088 (Medic 08)</h5>
        <p class="text-[10px] text-slate-500">Critical Care Unit • BKC Corridor</p>
        <div class="mt-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200">
          <span class="text-[9px] uppercase font-bold text-emerald-800 block">Dynamic ETA</span>
          <span class="text-lg font-black text-emerald-700 font-mono">16 min</span>
          <span class="text-[10px] text-emerald-900 block">Dest: Lilavati Hospital (3.2 km)</span>
        </div>
      </div>
    `);
    markersGroup.addLayer(m08Marker);

    // Medic 12 (Sea Link -> Lilavati)
    const medic12Coord: [number, number] = [19.0400, 72.8185];
    const medic12Icon = L.divIcon({
      className: 'custom-leaflet-icon',
      html: `
        <div class="relative cursor-pointer group">
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white text-slate-800 shadow-md border-2 border-emerald-500 text-[10px] font-bold">
            <div class="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
              <span class="material-symbols-outlined text-[11px]">ambulance</span>
            </div>
            <span>MH 03 CL 1092</span>
            <span class="text-emerald-600 font-black">12m</span>
          </div>
          <div class="w-2 h-2 bg-emerald-500 rotate-45 mx-auto -mt-1"></div>
        </div>
      `,
      iconSize: [140, 36],
      iconAnchor: [70, 36],
    });
    const m12Marker = L.marker(medic12Coord, { icon: medic12Icon });
    m12Marker.bindPopup(`
      <div class="p-3 w-56 text-xs text-slate-800">
        <h5 class="font-bold text-slate-900">MH 03 CL 1092 (Medic 12)</h5>
        <p class="text-[10px] text-slate-500">Trauma ALS-2 • Sea Link Inbound</p>
        <div class="mt-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200">
          <span class="text-[9px] uppercase font-bold text-emerald-800 block">Dynamic ETA</span>
          <span class="text-lg font-black text-emerald-700 font-mono">12 min</span>
          <span class="text-[10px] text-emerald-900 block">Dest: Lilavati Hospital (2.8 km)</span>
        </div>
      </div>
    `);
    markersGroup.addLayer(m12Marker);

    // 7. Render Moving Primary Ambulance (MH 01 EA 1084 • Medic 04)
    const ambulanceIcon = L.divIcon({
      className: 'custom-leaflet-icon',
      html: `
        <div class="relative cursor-pointer group">
          <!-- Animated Radar Waves -->
          <div class="absolute -inset-4 bg-blue-500/20 rounded-full animate-ping"></div>
          <div class="absolute -inset-2 bg-blue-500/30 rounded-full animate-pulse"></div>
          
          <!-- Google Maps Vehicle Navigation Puck -->
          <div class="relative flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-blue-600 text-white shadow-2xl border-2 border-white font-bold text-xs select-none">
            <div class="w-6 h-6 rounded-full bg-white text-blue-600 flex items-center justify-center font-extrabold shadow-inner" style="transform: rotate(${currentHeading}deg);">
              <span class="material-symbols-outlined text-[16px]">navigation</span>
            </div>
            <div class="flex flex-col text-left leading-tight">
              <div class="flex items-center gap-1">
                <span class="text-[11px] font-black tracking-wide">MH 01 EA 1084</span>
                <span class="bg-blue-800 text-[9px] px-1 rounded font-bold">108</span>
              </div>
              <span class="text-[10px] text-emerald-200 font-bold tabular-nums">
                ETA ${dynamicEtaData.etaMinutes}m ${dynamicEtaData.etaSeconds < 10 ? '0' : ''}${dynamicEtaData.etaSeconds}s • ${dynamicEtaData.remainingKm.toFixed(1)}km
              </span>
            </div>
          </div>
          <div class="w-3 h-3 bg-blue-600 rotate-45 mx-auto -mt-1 border-r border-b border-white"></div>
        </div>
      `,
      iconSize: [200, 56],
      iconAnchor: [100, 56],
    });

    const popupHtml = generateAmbulancePopupHtml();

    // Check if marker already exists to prevent popup recreation flickering
    if (ambMarkerRef.current && markersGroup.hasLayer(ambMarkerRef.current)) {
      ambMarkerRef.current.setLatLng(currentAmbulanceCoord);
      ambMarkerRef.current.setIcon(ambulanceIcon);
      ambMarkerRef.current.setPopupContent(popupHtml);
    } else {
      const ambMarker = L.marker(currentAmbulanceCoord, { icon: ambulanceIcon, zIndexOffset: 1000 });

      ambMarker.bindPopup(popupHtml, {
        maxWidth: 340,
        minWidth: 300,
        className: 'ambulance-eta-popup',
        offset: [0, -42],
        autoPan: false,
      });

      // Attach button click handler when popup opens or updates
      const attachPopupHandlers = () => {
        const btn = document.getElementById('popup-inspect-btn');
        if (btn) {
          btn.onclick = () => handleSelect('ambulance', 'MEDIC-04');
        }
      };

      ambMarker.on('popupopen', attachPopupHandlers);
      ambMarker.getPopup()?.on('contentupdate', attachPopupHandlers);

      markersGroup.addLayer(ambMarker);
      ambMarkerRef.current = ambMarker;
    }

    // Attach inspect button listener if popup is currently open
    setTimeout(() => {
      const btn = document.getElementById('popup-inspect-btn');
      if (btn) {
        btn.onclick = () => handleSelect('ambulance', 'MEDIC-04');
      }
    }, 50);

    // If in driver mode, smooth center on ambulance
    if (mode === 'driver') {
      map.panTo(currentAmbulanceCoord, { animate: true, duration: 0.8 });
    }
  }, [
    currentRoute,
    currentAmbulanceCoord,
    currentHeading,
    hospitals,
    activeSidePanel,
    isRoadblockActive,
    showTraffic,
    showCorridorShields,
    handleSelect,
    mode,
    dynamicEtaData,
    generateAmbulancePopupHtml,
  ]);

  // Center on Ambulance & Open ETA Popup
  const handleCenterAmbulance = () => {
    setMode('driver');
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(currentAmbulanceCoord, 14, { animate: true });
    }
    if (ambMarkerRef.current) {
      ambMarkerRef.current.openPopup();
    }
  };

  // Fit Regional Overview
  const handleFitRegional = () => {
    setMode('overview');
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([19.035, 72.85], 12, { animate: true });
    }
  };

  return (
    <div
      className={`relative w-full ${heightClass} rounded-3xl overflow-hidden border border-slate-300 shadow-md bg-[#e5e3df] select-none font-sans`}
    >
      {/* ------------------------------------------------------------- */}
      {/* REAL LEAFLET MAP CONTAINER */}
      {/* ------------------------------------------------------------- */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* ------------------------------------------------------------- */}
      {/* TOP GOOGLE MAPS NAVIGATION MANEUVER HUD (Driver Mode) */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute top-4 left-4 right-4 md:right-auto md:max-w-lg z-30 pointer-events-auto">
        <div className="bg-[#1b5e20] text-white rounded-2xl shadow-xl p-3.5 flex items-start gap-3.5 border border-emerald-700/60 backdrop-blur-md">
          {/* Turn Direction Icon */}
          <div className="w-12 h-12 rounded-xl bg-[#2e7d32] border border-emerald-500/50 flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[32px] text-white">
              {currentStep.icon}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-black text-emerald-200 tracking-wide">
                {currentStep.distanceText}
              </span>
              <span className="text-[10px] font-bold bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-600/40">
                108 Green Corridor
              </span>
            </div>
            <h2 className="text-sm md:text-base font-bold text-white leading-tight mt-0.5 truncate">
              {currentStep.streetName}
            </h2>
            <p className="text-[11px] text-emerald-100/90 mt-1 font-medium truncate">
              {currentStep.secondaryText}
            </p>

            {/* Lane Visualizer */}
            <div className="flex items-center gap-1.5 mt-2">
              {currentStep.lanes.map((lane, i) => (
                <div
                  key={i}
                  className={`w-6 h-5 rounded flex items-center justify-center text-[11px] font-bold ${
                    lane.startsWith('active')
                      ? 'bg-white text-emerald-900 shadow-sm'
                      : 'bg-emerald-900/60 text-emerald-400'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {lane.includes('right') ? 'turn_right' : lane.includes('left') ? 'turn_left' : 'straight'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TOP-RIGHT MAP CONTROLS & LAYER SWITCHER */}
      {/* ------------------------------------------------------------- */}
      {showControls && (
        <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 pointer-events-auto">
          {/* Layer Selector */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/90 p-1 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMapType('voyager')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mapType === 'voyager'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Standard Indian Street Map"
            >
              Default
            </button>
            <button
              type="button"
              onClick={() => setMapType('satellite')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mapType === 'satellite'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Real Satellite Aerial Imagery"
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => setMapType('dark')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mapType === 'dark'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Command Center Dark Theme"
            >
              Dark
            </button>
          </div>

          {/* Action Tools Toolbar */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/90 p-1.5 flex flex-col gap-1.5 items-center">
            {/* Center Ambulance & Open ETA Popup */}
            <button
              type="button"
              onClick={handleCenterAmbulance}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                mode === 'driver' ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Track Ambulance & Open Dynamic ETA Popup"
            >
              <span className="material-symbols-outlined text-[20px]">my_location</span>
            </button>

            {/* Regional Overview */}
            <button
              type="button"
              onClick={handleFitRegional}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                mode === 'overview' ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Regional Overview (All Hospitals)"
            >
              <span className="material-symbols-outlined text-[20px]">zoom_out_map</span>
            </button>

            {/* Traffic Toggle */}
            <button
              type="button"
              onClick={() => setShowTraffic(!showTraffic)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                showTraffic ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200' : 'text-slate-400 hover:bg-slate-100'
              }`}
              title="Toggle Mumbai Traffic Layer"
            >
              <span className="material-symbols-outlined text-[20px]">traffic</span>
            </button>

            {/* Corridor Shields Toggle */}
            <button
              type="button"
              onClick={() => setShowCorridorShields(!showCorridorShields)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                showCorridorShields ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200' : 'text-slate-400 hover:bg-slate-100'
              }`}
              title="Toggle Traffic Police Signal Pre-emption Points"
            >
              <span className="material-symbols-outlined text-[20px]">alt_route</span>
            </button>

            {/* Zoom In */}
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.zoomIn()}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer"
              title="Zoom In"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
            </button>

            {/* Zoom Out */}
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.zoomOut()}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer"
              title="Zoom Out"
            >
              <span className="material-symbols-outlined text-[20px]">remove</span>
            </button>

            {/* Audio Mute Toggle */}
            <button
              type="button"
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
              title={isAudioMuted ? 'Unmute Audio Voice Prompts' : 'Mute Voice'}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isAudioMuted ? 'volume_off' : 'volume_up'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM-LEFT: SPEEDOMETER & EMERGENCY CORRIDOR BADGE */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute bottom-5 left-4 z-30 pointer-events-auto flex items-end gap-3">
        {/* Speedometer Circle */}
        <div className="w-16 h-16 rounded-full bg-white shadow-xl border-2 border-slate-200 p-1 flex flex-col items-center justify-center text-center">
          <span className="text-lg font-black text-slate-900 leading-none tabular-nums">
            {dynamicEtaData.currentSpeedKmH}
          </span>
          <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">km/h</span>
          <span className="text-[8px] font-bold text-rose-600 leading-none">Code 108</span>
        </div>

        {/* Speed Limit Shield */}
        <div className="w-11 h-13 rounded-lg bg-white shadow-md border-2 border-slate-900 p-0.5 flex flex-col items-center justify-center text-center">
          <span className="text-[7px] font-extrabold text-slate-500 leading-tight">LIMIT</span>
          <span className="text-sm font-black text-slate-900 leading-none">50</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM GOOGLE MAPS TRIP SUMMARY CARD (ETA & DISTANCE) */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute bottom-4 left-36 right-4 md:left-auto md:right-4 md:max-w-md z-30 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 p-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600 font-mono tabular-nums">
                {dynamicEtaData.etaMinutes}m {dynamicEtaData.etaSeconds < 10 ? '0' : ''}{dynamicEtaData.etaSeconds}s
              </span>
              <span className="text-xs font-bold text-slate-600 tabular-nums">
                {dynamicEtaData.remainingKm.toFixed(2)} km
              </span>
              <span className="text-xs text-slate-400 font-medium font-mono">
                {dynamicEtaData.arrivalTimeClock}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => ambMarkerRef.current?.openPopup()}
                className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer flex items-center gap-1"
                title="Open Live ETA Popup on Marker"
              >
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                <span>ETA Popup</span>
              </button>

              <button
                type="button"
                onClick={isRoadblockActive ? resetRoadblock : simulateRoadblock}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  isRoadblockActive
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">alt_route</span>
                <span>{isRoadblockActive ? 'Detour Active' : 'Test Block'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold truncate">
              <span className="material-symbols-outlined text-blue-600 text-[16px]">local_hospital</span>
              <span className="truncate">Destination: KEM Hospital & Seth GS Medical College</span>
            </div>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
              Trauma Bay 02
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SIDE INSPECTION PANEL: When user clicks Hospital or Ambulance */}
      {/* ------------------------------------------------------------- */}
      {activeSidePanel && (
        <div className="absolute top-4 bottom-4 left-4 z-40 w-80 bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 p-5 flex flex-col gap-4 overflow-y-auto pointer-events-auto">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[20px]">
                {activeSidePanel.type === 'hospital'
                  ? 'local_hospital'
                  : activeSidePanel.type === 'ambulance'
                  ? 'ambulance'
                  : 'vital_signs'}
              </span>
              <span className="font-bold text-xs uppercase tracking-wider text-slate-400">
                {activeSidePanel.type} Inspector
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveSidePanel(null)}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>

          {activeSidePanel.type === 'hospital' && (
            <div className="flex flex-col gap-3 text-xs">
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {(activeSidePanel.data as Hospital).name}
              </h3>
              <p className="text-slate-500 font-medium">{(activeSidePanel.data as Hospital).address}</p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                  <span className="text-[10px] uppercase font-bold text-blue-600 block">CATH LABS</span>
                  <span className="text-base font-extrabold text-blue-950">
                    {(activeSidePanel.data as Hospital).openCathBays} Available
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 block">TRAUMA BAYS</span>
                  <span className="text-base font-extrabold text-emerald-950">
                    {(activeSidePanel.data as Hospital).traumaBaysAvailable} Available
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">ON-CALL CARDIOLOGIST</span>
                <span className="font-bold text-slate-800">
                  {(activeSidePanel.data as Hospital).onCallCardiologist}
                </span>
              </div>
            </div>
          )}

          {activeSidePanel.type === 'ambulance' && (
            <div className="flex flex-col gap-3 text-xs">
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {(activeSidePanel.data as Ambulance).name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold border border-blue-200">
                  {(activeSidePanel.data as Ambulance).callSign}
                </span>
                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">
                  {(activeSidePanel.data as Ambulance).status}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">LIVE DYNAMIC ETA</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-black text-emerald-700 font-mono">
                    {dynamicEtaData.etaMinutes}m {dynamicEtaData.etaSeconds < 10 ? '0' : ''}{dynamicEtaData.etaSeconds}s
                  </span>
                  <span className="text-slate-500 font-bold">({dynamicEtaData.remainingKm.toFixed(2)} km)</span>
                </div>
                <span className="text-[10px] text-emerald-900 mt-1 block">
                  Est. Bay Arrival: {dynamicEtaData.arrivalTimeClock}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">CREW MEMBERS</span>
                <p className="font-semibold text-slate-800">
                  {(activeSidePanel.data as Ambulance).crew.join(' • ')}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                <span className="text-[10px] uppercase font-bold text-blue-600 block">CURRENT LOCATION</span>
                <p className="font-semibold text-blue-950 mt-0.5">
                  {(activeSidePanel.data as Ambulance).location}
                </p>
              </div>
            </div>
          )}

          {activeSidePanel.type === 'emergency' && (
            <div className="flex flex-col gap-3 text-xs">
              <span className="font-mono bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded font-bold self-start border border-rose-200">
                #{(activeSidePanel.data as EmergencyRequest).id}
              </span>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                {(activeSidePanel.data as EmergencyRequest).condition}
              </h3>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">TRIAGE NOTES</span>
                <p className="text-slate-700 mt-1 font-medium">
                  {(activeSidePanel.data as EmergencyRequest).vitals?.notes || 'No triage notes'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GoogleMapsNavigation;
