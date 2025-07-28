export interface ChargingStation {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  operator?: string;
  isDiscovered: boolean;
  discoveredAt?: Date;
  isDiscoverable: boolean; // Within range, can be unlocked
  isUnlocking: boolean; // Currently unlocking
  unlockProgress: number; // 0-100 unlock progress
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface UserProgress {
  discoveredStations: string[];
  totalDiscovered: number;
  lastUpdated: Date;
}

export interface ProximityEvent {
  stationId: string;
  distance: number;
  isInRange: boolean;
} 