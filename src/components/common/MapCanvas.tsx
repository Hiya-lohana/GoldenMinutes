import React from 'react';
import { GoogleMapsNavigation } from './GoogleMapsNavigation';

interface MapCanvasProps {
  heightClass?: string;
  selectedEntityId?: string;
  onSelectEntity?: (entityType: 'hospital' | 'ambulance' | 'emergency', id: string) => void;
  showControls?: boolean;
  initialMode?: 'driver' | 'overview';
}

export const MapCanvas: React.FC<MapCanvasProps> = (props) => {
  return <GoogleMapsNavigation {...props} />;
};

export default MapCanvas;
