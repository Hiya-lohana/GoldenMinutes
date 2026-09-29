import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { EMSProvider, useEMS } from './context/EMSContext';
import { AppShell } from './components/layout/AppShell';
import { Login } from './pages/auth/Login';

// Dispatcher pages
import { CommandCenter } from './pages/dispatcher/CommandCenter';
import { NewRequest } from './pages/dispatcher/NewRequest';
import { ActiveRequests } from './pages/dispatcher/ActiveRequests';
import { EmergencyDetails } from './pages/dispatcher/EmergencyDetails';
import { RankedHospitals } from './pages/dispatcher/RankedHospitals';
import { HospitalCapacity } from './pages/dispatcher/HospitalCapacity';
import { HospitalDetails } from './pages/dispatcher/HospitalDetails';
import { FleetAmbulances } from './pages/dispatcher/FleetAmbulances';
import { AmbulanceDetails } from './pages/dispatcher/AmbulanceDetails';
import { DispatchMap } from './pages/dispatcher/DispatchMap';
import { DispatcherActivity } from './pages/dispatcher/DispatcherActivity';
import { DispatcherHistory } from './pages/dispatcher/DispatcherHistory';

// Hospital pages
import { HospitalOverview } from './pages/hospital/HospitalOverview';
import { IncomingRequests } from './pages/hospital/IncomingRequests';
import { RequestDetails } from './pages/hospital/RequestDetails';
import { DoubleBookingDemo } from './pages/hospital/DoubleBookingDemo';
import { ResourceManager } from './pages/hospital/ResourceManager';
import { Reservations } from './pages/hospital/Reservations';
import { Predictions } from './pages/hospital/Predictions';
import { HospitalActivity } from './pages/hospital/HospitalActivity';
import { HospitalHistory } from './pages/hospital/HospitalHistory';

const RouterView: React.FC = () => {
  const { currentPath, selectedEmergencyId, selectedHospitalId, selectedAmbulanceId } = useEMS();

  // Authentication screen
  if (currentPath === '/login') {
    return <Login />;
  }

  // Helper route matching
  const renderPage = () => {
    // Dispatcher Routes
    if (currentPath === '/dispatcher/command-center') {
      return <CommandCenter />;
    }
    if (currentPath === '/dispatcher/new-request') {
      return <NewRequest />;
    }
    if (currentPath.startsWith('/dispatcher/requests/')) {
      const id = currentPath.replace('/dispatcher/requests/', '') || selectedEmergencyId;
      return <EmergencyDetails id={id} />;
    }
    if (currentPath === '/dispatcher/requests') {
      return <ActiveRequests />;
    }
    if (currentPath.startsWith('/dispatcher/ranked-hospitals')) {
      const parts = currentPath.split('/');
      const reqId = parts[3] || selectedEmergencyId;
      return <RankedHospitals requestId={reqId} />;
    }
    if (currentPath.startsWith('/dispatcher/hospitals/')) {
      const id = currentPath.replace('/dispatcher/hospitals/', '') || selectedHospitalId;
      return <HospitalDetails id={id} />;
    }
    if (currentPath === '/dispatcher/hospitals') {
      return <HospitalCapacity />;
    }
    if (currentPath.startsWith('/dispatcher/ambulances/')) {
      const id = currentPath.replace('/dispatcher/ambulances/', '') || selectedAmbulanceId;
      return <AmbulanceDetails id={id} />;
    }
    if (currentPath === '/dispatcher/ambulances') {
      return <FleetAmbulances />;
    }
    if (currentPath === '/dispatcher/map') {
      return <DispatchMap />;
    }
    if (currentPath === '/dispatcher/activity') {
      return <DispatcherActivity />;
    }
    if (currentPath === '/dispatcher/history') {
      return <DispatcherHistory />;
    }

    // Hospital Routes
    if (currentPath === '/hospital/overview') {
      return <HospitalOverview />;
    }
    if (currentPath.startsWith('/hospital/requests/')) {
      const id = currentPath.replace('/hospital/requests/', '') || selectedEmergencyId;
      return <RequestDetails id={id} />;
    }
    if (currentPath === '/hospital/requests') {
      return <IncomingRequests />;
    }
    if (currentPath === '/hospital/double-booking') {
      return <DoubleBookingDemo />;
    }
    if (currentPath === '/hospital/resources') {
      return <ResourceManager />;
    }
    if (currentPath === '/hospital/reservations') {
      return <Reservations />;
    }
    if (currentPath === '/hospital/predictions') {
      return <Predictions />;
    }
    if (currentPath === '/hospital/activity') {
      return <HospitalActivity />;
    }
    if (currentPath === '/hospital/history') {
      return <HospitalHistory />;
    }

    // Fallback to Dispatcher Command Center
    return <CommandCenter />;
  };

  return <AppShell>{renderPage()}</AppShell>;
};

export default function App() {
  return (
    <AuthProvider>
      <EMSProvider>
        <RouterView />
      </EMSProvider>
    </AuthProvider>
  );
}
