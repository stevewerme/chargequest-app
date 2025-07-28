import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { ChargingStation, UserLocation, UserProgress } from '../types/ChargingStation';
import { locationService } from '../services/locationService';

// Mock charging stations focused around Töjnan area in Sollentuna
const MOCK_STATIONS: ChargingStation[] = [
  {
    id: '1',
    latitude: 59.4285,
    longitude: 17.9520,
    title: "Töjnaskolan",
    description: "School area charging station",
    operator: "Recharge",
    isDiscovered: false,
    isDiscoverable: false,
    isUnlocking: false,
    unlockProgress: 0,
  },
  {
    id: '2',
    latitude: 59.4275,
    longitude: 17.9510,
    title: "Villavägen Station",
    description: "Residential street charger",
    operator: "Recharge",
    isDiscovered: false,
    isDiscoverable: false,
    isUnlocking: false,
    unlockProgress: 0,
  },
  {
    id: '3',
    latitude: 59.4290,
    longitude: 17.9530,
    title: "Fjällvägen Hub",
    description: "Mountain road charging point",
    operator: "Recharge",
    isDiscovered: false,
    isDiscoverable: false,
    isUnlocking: false,
    unlockProgress: 0,
  },
  {
    id: '4',
    latitude: 59.4270,
    longitude: 17.9500,
    title: "Töjnan Park",
    description: "Green space energy cell",
    operator: "Recharge",
    isDiscovered: false,
    isDiscoverable: false,
    isUnlocking: false,
    unlockProgress: 0,
  },
  {
    id: '5',
    latitude: 59.4295,
    longitude: 17.9515,
    title: "Töjnan Center",
    description: "Neighborhood hub charger",
    operator: "Recharge",
    isDiscovered: false,
    isDiscoverable: false,
    isUnlocking: false,
    unlockProgress: 0,
  },
  {
    id: '6',
    latitude: 59.4280,
    longitude: 17.9525,
    title: "Björkvägen Station",
    description: "Birch road energy point",
    operator: "Recharge",
    isDiscovered: false,
    isDiscoverable: false,
    isUnlocking: false,
    unlockProgress: 0,
  },
  {
    id: '7',
    latitude: 59.4265,
    longitude: 17.9490,
    title: "Töjnan Sports Field",
    description: "Athletic facility charger",
    operator: "Recharge",
    isDiscovered: false,
    isDiscoverable: false,
    isUnlocking: false,
    unlockProgress: 0,
  },
  {
    id: '8',
    latitude: 59.4300,
    longitude: 17.9540,
    title: "Granvägen Crossing",
    description: "Spruce street junction",
    operator: "Recharge",
    isDiscovered: false,
    isDiscoverable: false,
    isUnlocking: false,
    unlockProgress: 0,
  },
];

interface GameState {
  // Location & Permission State
  locationPermissionGranted: boolean;
  currentLocation: UserLocation | null;
  isLocationTracking: boolean;
  
  // Charging Stations
  chargingStations: ChargingStation[];
  
  // User Progress
  discoveredStations: string[];
  totalDiscovered: number;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initializePermissions: () => Promise<void>;
  startLocationTracking: () => Promise<void>;
  stopLocationTracking: () => Promise<void>;
  updateLocation: (location: UserLocation) => void;
  discoverStation: (stationId: string) => void;
  checkProximityAndDiscover: () => void;
  startUnlock: (stationId: string) => void;
  completeUnlock: (stationId: string) => void;
  resetProgress: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial State
      locationPermissionGranted: false,
      currentLocation: null,
      isLocationTracking: false,
      chargingStations: MOCK_STATIONS,
      discoveredStations: [],
      totalDiscovered: 0,
      isLoading: false,
      error: null,

      // Actions
      initializePermissions: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const granted = await locationService.requestPermissions();
          set({ locationPermissionGranted: granted });
          
          if (granted) {
            // Get initial location
            const location = await locationService.getCurrentLocation();
            if (location) {
              set({ currentLocation: location });
            }
          } else {
            set({ error: 'Location permission is required to discover charging stations' });
          }
        } catch (error) {
          set({ error: 'Failed to initialize location services' });
        } finally {
          set({ isLoading: false });
        }
      },

      startLocationTracking: async () => {
        const { locationPermissionGranted } = get();
        
        if (!locationPermissionGranted) {
          set({ error: 'Location permission not granted' });
          return;
        }

        try {
          const success = await locationService.startLocationTracking(
            (location) => {
              get().updateLocation(location);
              get().checkProximityAndDiscover();
            },
            (error) => {
              set({ error, isLocationTracking: false });
            }
          );

          set({ isLocationTracking: success });
        } catch (error) {
          set({ error: 'Failed to start location tracking', isLocationTracking: false });
        }
      },

      stopLocationTracking: async () => {
        await locationService.stopLocationTracking();
        set({ isLocationTracking: false });
      },

      updateLocation: (location: UserLocation) => {
        set({ currentLocation: location, error: null });
      },

      discoverStation: (stationId: string) => {
        const { discoveredStations, chargingStations } = get();
        
        // Prevent duplicate discoveries
        if (discoveredStations.includes(stationId)) {
          return;
        }

        // Update discovered stations list
        const newDiscoveredStations = [...discoveredStations, stationId];
        
        // Update charging stations to mark as discovered
        const updatedStations = chargingStations.map(station => 
          station.id === stationId 
            ? { ...station, isDiscovered: true, discoveredAt: new Date() }
            : station
        );

        // Haptic feedback for discovery
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        set({
          discoveredStations: newDiscoveredStations,
          totalDiscovered: newDiscoveredStations.length,
          chargingStations: updatedStations,
        });

        console.log(`🎉 Discovered charging station: ${stationId}`);
      },

      checkProximityAndDiscover: () => {
        const { currentLocation, chargingStations, discoveredStations } = get();
        
        if (!currentLocation) return;

        // Only check undiscovered stations
        const undiscoveredStations = chargingStations.filter(
          station => !discoveredStations.includes(station.id)
        );

        const proximityEvents = locationService.checkProximity(
          currentLocation,
          undiscoveredStations,
          25 // 25-meter radius
        );

        // Mark stations as discoverable when in range (not auto-discover)
        const updatedStations = chargingStations.map(station => {
          const proximityEvent = proximityEvents.find(event => event.stationId === station.id);
          
          if (proximityEvent && !station.isDiscovered) {
            return { 
              ...station, 
              isDiscoverable: proximityEvent.isInRange 
            };
          }
          
          return station;
        });

        set({ chargingStations: updatedStations });
      },

      startUnlock: (stationId: string) => {
        const { chargingStations } = get();
        
        const updatedStations = chargingStations.map(station => 
          station.id === stationId && station.isDiscoverable
            ? { ...station, isUnlocking: true, unlockProgress: 0 }
            : station
        );

        set({ chargingStations: updatedStations });

        // Start timed unlock (3 seconds)
        const unlockDuration = 3000;
        const updateInterval = 50;
        const progressStep = (100 * updateInterval) / unlockDuration;
        
        const unlockTimer = setInterval(() => {
          const currentState = get();
          const station = currentState.chargingStations.find(s => s.id === stationId);
          
          if (!station || !station.isUnlocking) {
            clearInterval(unlockTimer);
            return;
          }

          const newProgress = Math.min(station.unlockProgress + progressStep, 100);
          
          if (newProgress >= 100) {
            clearInterval(unlockTimer);
            get().completeUnlock(stationId);
          } else {
            const updatedStations = currentState.chargingStations.map(s => 
              s.id === stationId 
                ? { ...s, unlockProgress: newProgress }
                : s
            );
            set({ chargingStations: updatedStations });
          }
        }, updateInterval);
      },

      completeUnlock: (stationId: string) => {
        // Complete the unlock and discover the station
        get().discoverStation(stationId);
        
        // Reset unlock states
        const { chargingStations } = get();
        const updatedStations = chargingStations.map(station => 
          station.id === stationId
            ? { 
                ...station, 
                isUnlocking: false, 
                unlockProgress: 0,
                isDiscoverable: false 
              }
            : station
        );

        set({ chargingStations: updatedStations });
      },

      resetProgress: () => {
        const resetStations = MOCK_STATIONS.map(station => ({ 
          ...station, 
          isDiscovered: false,
          discoveredAt: undefined 
        }));
        
        set({
          discoveredStations: [],
          totalDiscovered: 0,
          chargingStations: resetStations,
        });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'chargequest-game-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist user progress, not location/permission state
      partialize: (state) => ({
        discoveredStations: state.discoveredStations,
        totalDiscovered: state.totalDiscovered,
        chargingStations: state.chargingStations,
      }),
      // Ensure data integrity when rehydrating from storage
      onRehydrateStorage: () => (state) => {
        if (state && (!state.chargingStations || !Array.isArray(state.chargingStations))) {
          state.chargingStations = MOCK_STATIONS;
        }
      },
    }
  )
); 