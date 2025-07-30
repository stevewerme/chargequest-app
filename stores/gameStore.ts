import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { ChargingStation, UserLocation, UserProgress } from '../types/ChargingStation';
import { locationService } from '../services/locationService';
import { nobilApi } from '../services/nobilApi';

// XP Progression System Constants
const XP_REWARDS = {
  NEW_STATION: 100,
  AREA_BONUS: 200,    // First discovery in new neighborhood
  WEEKEND_BONUS: 50,  // Weekend discoveries
  CHARGING_SESSION: 500  // Future: actual charging detected
};

const LEVEL_CONFIG = [
  { level: 1, xpRequirement: 0, title: "Energy Seeker", description: "Starting your exploration journey" },
  { level: 2, xpRequirement: 300, title: "Grid Explorer", description: "Unlocks Energy Radar" },
  { level: 3, xpRequirement: 800, title: "Charge Hunter", description: "Unlocks Treasure Preview" },
  { level: 4, xpRequirement: 1500, title: "Power Tracker", description: "Unlocks Explorer's Eye" },
  { level: 5, xpRequirement: 2500, title: "Energy Master", description: "Unlocks Master Tracker" }
];

// Helper functions for XP system
const calculateLevelFromXP = (xp: number): number => {
  for (let i = LEVEL_CONFIG.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_CONFIG[i].xpRequirement) {
      return LEVEL_CONFIG[i].level;
    }
  }
  return 1; // Default to level 1
};

const getLevelInfo = (level: number) => {
  return LEVEL_CONFIG.find(config => config.level === level) || LEVEL_CONFIG[0];
};

const getNextLevelXP = (currentLevel: number): number | null => {
  const nextLevelConfig = LEVEL_CONFIG.find(config => config.level === currentLevel + 1);
  return nextLevelConfig ? nextLevelConfig.xpRequirement : null;
};

const calculateXPReward = (stationId: string, discoveredStations: string[]): number => {
  let reward = XP_REWARDS.NEW_STATION;
  
  // Weekend bonus (Saturday = 6, Sunday = 0)
  const now = new Date();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  if (isWeekend) {
    reward += XP_REWARDS.WEEKEND_BONUS;
  }
  
  // Area bonus - simplified: every 5th discovery gets area bonus
  // In future, this could be based on actual geographic distance
  if (discoveredStations.length > 0 && (discoveredStations.length + 1) % 5 === 0) {
    reward += XP_REWARDS.AREA_BONUS;
  }
  
  return reward;
};

// Mock charging stations focused around Töjnan area in Sollentuna
// Using exact user-provided coordinates for accurate placement
const MOCK_STATIONS: ChargingStation[] = [
  {
    id: '1',
    latitude: 59.4245940,
    longitude: 17.9357635,
    title: "Hjortvägen/Fjällvägen",
    description: "Street intersection energy cell",
    operator: "Recharge",
    isDiscovered: false,
    isDiscoverable: false,
    isUnlocking: false,
    unlockProgress: 0,
  },
  {
    id: '2',
    latitude: 59.4260085,
    longitude: 17.9312432,
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
    latitude: 59.4249233,
    longitude: 17.9292865,
    title: "Töjnaskolan Park",
    description: "School park energy cell",
    operator: "Recharge",
    isDiscovered: false,
    isDiscoverable: false,
    isUnlocking: false,
    unlockProgress: 0,
  },
  {
    id: '4',
    latitude: 59.4215182,
    longitude: 17.9334567,
    title: "Sveavägen Bus Stop",
    description: "Transit hub charger",
    operator: "Recharge",
    isDiscovered: false,
    isDiscoverable: false,
    isUnlocking: false,
    unlockProgress: 0,
  },
  {
    id: '5',
    latitude: 59.4185613,
    longitude: 17.9386471,
    title: "St1 Gas Station",
    description: "Fuel station energy point",
    operator: "Recharge",
    isDiscovered: false,
    isDiscoverable: false,
    isUnlocking: false,
    unlockProgress: 0,
  },
  {
    id: '6',
    latitude: 59.4195248,
    longitude: 17.9400039,
    title: "Kanalvägen Hub",
    description: "Canal road charging point",
    operator: "Recharge",
    isDiscovered: false,
    isDiscoverable: false,
    isUnlocking: false,
    unlockProgress: 0,
  },
  {
    id: '7',
    latitude: 59.4297178,
    longitude: 17.9225934,
    title: "Töjnan Running Trail",
    description: "Nature trail energy cell",
    operator: "Recharge",
    isDiscovered: false,
    isDiscoverable: false,
    isUnlocking: false,
    unlockProgress: 0,
  },
  {
    id: '8',
    latitude: 59.4231384,
    longitude: 17.9427535,
    title: "Polhemsvägen Slope",
    description: "Hillside charging station",
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
  
  // XP Progression System
  totalXP: number;
  currentLevel: number;
  levelTitle: string;
  levelDescription: string;
  xpToNextLevel: number | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initializePermissions: () => Promise<void>;
  loadChargingStations: () => Promise<void>;
  startLocationTracking: () => Promise<void>;
  stopLocationTracking: () => Promise<void>;
  updateLocation: (location: UserLocation) => void;
  discoverStation: (stationId: string) => void;
  checkProximityAndDiscover: () => void;
  completeUnlock: (stationId: string) => void;
  awardXP: (amount: number, reason?: string) => void;
  resetProgress: () => Promise<void>;
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
      
      // XP Progression Initial State
      totalXP: 0,
      currentLevel: 1,
      levelTitle: "Energy Seeker",
      levelDescription: "Starting your exploration journey",
      xpToNextLevel: 300, // XP needed for level 2
      
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
          
          // Load charging stations regardless of location permission
          // This allows users to see the map even without location access
          await get().loadChargingStations();
          
        } catch (error) {
          set({ error: 'Failed to initialize location services' });
        } finally {
          set({ isLoading: false });
        }
      },

      loadChargingStations: async () => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('🔌 Loading Stockholm charging stations...');
          const stations = await nobilApi.getStockholmStations();
          
          // Preserve discovered states from existing stations
          const { discoveredStations } = get();
          const updatedStations = stations.map(station => {
            const wasDiscovered = discoveredStations.includes(station.id);
            return {
              ...station,
              isDiscovered: wasDiscovered,
              discoveredAt: wasDiscovered ? new Date() : undefined
            };
          });
          
          set({ 
            chargingStations: updatedStations,
            error: null 
          });
          
          const apiStatus = nobilApi.getStatus();
          console.log(`✅ Loaded ${stations.length} stations (Mock: ${apiStatus.usingMockData})`);
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load charging stations';
          console.error('❌ Station loading failed:', errorMessage);
          set({ error: errorMessage });
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
          25 // 25-meter radius for normal gameplay
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



      completeUnlock: (stationId: string) => {
        const { chargingStations, discoveredStations, awardXP } = get();
        
        // Prevent duplicate discoveries
        if (discoveredStations.includes(stationId)) {
          return;
        }

        // Find the station being unlocked
        const station = chargingStations.find(s => s.id === stationId);
        if (!station) return;

        // Calculate XP reward
        const xpReward = calculateXPReward(stationId, discoveredStations);
        const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
        const isAreaBonus = discoveredStations.length > 0 && (discoveredStations.length + 1) % 5 === 0;
        
        // Build XP reason message
        let xpReason = `Discovered ${station.title}`;
        if (isWeekend) xpReason += ' (Weekend Bonus!)';
        if (isAreaBonus) xpReason += ' (Area Explorer Bonus!)';

        // Update discovered stations list
        const newDiscoveredStations = [...discoveredStations, stationId];
        
        // Complete the unlock and mark as discovered in one atomic update
        const updatedStations = chargingStations.map(s => 
          s.id === stationId
            ? { 
                ...s, 
                isDiscovered: true,
                discoveredAt: new Date(),
                isUnlocking: false, 
                unlockProgress: 0,
                isDiscoverable: false 
              }
            : s
        );

        // Satisfying haptic feedback for successful discovery
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Single atomic state update
        set({ 
          chargingStations: updatedStations,
          discoveredStations: newDiscoveredStations,
          totalDiscovered: newDiscoveredStations.length,
        });

        // Award XP after state update
        awardXP(xpReward, xpReason);
      },

      resetProgress: async () => {
        // Reset XP and discovery progress
        set({
          discoveredStations: [],
          totalDiscovered: 0,
          // Reset XP progression
          totalXP: 0,
          currentLevel: 1,
          levelTitle: "Energy Seeker",
          levelDescription: "Starting your exploration journey",
          xpToNextLevel: 300,
        });
        
        // Reload fresh station data
        await get().loadChargingStations();
      },

      awardXP: (amount: number, reason?: string) => {
        const { totalXP: currentXP, currentLevel, discoveredStations } = get();
        const newTotalXP = currentXP + amount;
        const newLevel = calculateLevelFromXP(newTotalXP);
        const levelInfo = getLevelInfo(newLevel);
        const nextLevelXP = getNextLevelXP(newLevel);
        
        // Check for level up
        const leveledUp = newLevel > currentLevel;
        
        // Update state
        set({
          totalXP: newTotalXP,
          currentLevel: newLevel,
          levelTitle: levelInfo.title,
          levelDescription: levelInfo.description,
          xpToNextLevel: nextLevelXP,
        });
        
        // Level up celebration with feature unlock notifications
        if (leveledUp) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          console.log(`🎉 Level Up! You are now ${levelInfo.title}!`);
          
          // Feature unlock notifications
          const unlockMessages: { [key: number]: string } = {
            2: '🎉 ENERGY RADAR UNLOCKED!\nTrack nearest undiscovered stations',
            3: '🎉 TREASURE PREVIEW UNLOCKED!\nSee rewards at discovered stations',
            4: '🎉 EXPLORER\'S EYE UNLOCKED!\nHighlight stations not visited recently',
            5: '🎉 MASTER TRACKER UNLOCKED!\nPersonal discovery statistics available'
          };
          
          if (unlockMessages[newLevel]) {
            // Store level up message for UI display
            setTimeout(() => {
              console.log(unlockMessages[newLevel]);
            }, 500);
          }
        }
        
        // Log XP gain for debugging
        if (reason) {
          console.log(`+${amount} XP: ${reason} (Total: ${newTotalXP} XP, Level ${newLevel})`);
        }
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