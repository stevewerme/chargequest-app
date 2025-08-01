import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { ChargingStation, UserLocation, UserProgress } from '../types/ChargingStation';
import { locationService } from '../services/locationService';
import { nobilApi } from '../services/nobilApi';
import { supabase, supabaseService, UserProgress as SupabaseUserProgress } from '../services/supabaseClient';
import { appleAuthService } from '../services/appleAuth';

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

// Utility function to calculate map bounds from stations and user location
const calculateMapBounds = (
  stations: ChargingStation[], 
  userLocation?: { latitude: number; longitude: number }
) => {
  console.log('🗺️ calculateMapBounds called with:', { stationsCount: stations.length, userLocation });
  
  if (!stations.length) {
    console.log('⚠️ No stations provided for bounds calculation');
    return null;
  }
  
  // Filter out any invalid stations and get coordinates
  const validStations = stations.filter(s => 
    s && typeof s.latitude === 'number' && typeof s.longitude === 'number' && 
    !isNaN(s.latitude) && !isNaN(s.longitude)
  );
  
  console.log('🗺️ Valid stations for bounds:', validStations.length);
  
  if (!validStations.length) {
    console.log('⚠️ No valid stations found for bounds calculation');
    return null;
  }
  
  // Get all coordinates (stations + user location)
  const allCoords = [...validStations.map(s => ({ latitude: s.latitude, longitude: s.longitude }))];
  if (userLocation && typeof userLocation.latitude === 'number' && typeof userLocation.longitude === 'number') {
    allCoords.push(userLocation);
  }
  
  // Find bounds
  const latitudes = allCoords.map(c => c.latitude);
  const longitudes = allCoords.map(c => c.longitude);
  
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  
  // Add padding (roughly 10% on each side)
  const latPadding = (maxLat - minLat) * 0.1;
  const lngPadding = (maxLng - minLng) * 0.1;
  
  const bounds = {
    northeast: { 
      latitude: maxLat + latPadding, 
      longitude: maxLng + lngPadding 
    },
    southwest: { 
      latitude: minLat - latPadding, 
      longitude: minLng - lngPadding 
    }
  };
  
  console.log('🗺️ Calculated map bounds:', bounds);
  return bounds;
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
  mapBounds: { northeast: { latitude: number; longitude: number }; southwest: { latitude: number; longitude: number } } | null;
  
  // User Progress
  discoveredStations: string[];
  totalDiscovered: number;
  
  // XP Progression System
  totalXP: number;
  currentLevel: number;
  levelTitle: string;
  levelDescription: string;
  xpToNextLevel: number | null;
  
  // Supabase Integration
  isCloudSyncEnabled: boolean;
  currentUser: any | null;
  isAuthenticated: boolean;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Settings
  hapticFeedbackEnabled: boolean;
  
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
  setHapticFeedback: (enabled: boolean) => void;
  
  // Supabase Actions
  initializeSupabase: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signInWithApple: () => Promise<boolean>;
  signOut: () => Promise<void>;
  syncToCloud: () => Promise<void>;
  loadFromCloud: () => Promise<void>;
  migrateLocalData: () => Promise<void>;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial State
      locationPermissionGranted: false,
      currentLocation: null,
      isLocationTracking: false,
      chargingStations: MOCK_STATIONS,
      mapBounds: null,
      discoveredStations: [],
      totalDiscovered: 0,
      
      // XP Progression Initial State
      totalXP: 0,
      currentLevel: 1,
      levelTitle: "Energy Seeker",
      levelDescription: "Starting your exploration journey",
      xpToNextLevel: 300, // XP needed for level 2
      
      // Supabase Integration Initial State
      isCloudSyncEnabled: false,
      currentUser: null,
      isAuthenticated: false,
      syncStatus: 'idle' as const,
      
      isLoading: false,
      error: null,
      
      // Settings
      hapticFeedbackEnabled: true, // Default to enabled

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
          
          // Pass current user location for location-based filtering
          const { currentLocation } = get();
          console.log('📍 Current location from store:', currentLocation);
          
          const userLocation = currentLocation?.coords ? {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude
          } : undefined;
          
          console.log('📍 Processed user location:', userLocation);
          
          const stations = await nobilApi.getStockholmStations(userLocation, 10);
          
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
          
          console.log('🗺️ About to calculate map bounds with stations:', stations.length);
          
          // Calculate map bounds for auto-zoom
          const bounds = calculateMapBounds(stations, userLocation);
          
          console.log('🗺️ Calculated bounds result:', bounds);
          
          set({ 
            chargingStations: updatedStations,
            mapBounds: bounds,
            error: null 
          });
          
          const apiStatus = nobilApi.getStatus();
          console.log(`✅ Loaded ${stations.length} stations | Mode: ${apiStatus.usingMockData ? '🧪 MOCK DATA' : '🌐 LIVE API'} | Key: ${apiStatus.hasApiKey ? '✅' : '❌'}`);
          
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
            const wasDiscoverable = station.isDiscoverable;
            const isNowDiscoverable = proximityEvent.isInRange;
            
            // Trigger haptic feedback when crystal turns purple (becomes discoverable)
            if (!wasDiscoverable && isNowDiscoverable) {
              const { hapticFeedbackEnabled } = get();
              if (hapticFeedbackEnabled) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }
            
            return { 
              ...station, 
              isDiscoverable: isNowDiscoverable 
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
        const { hapticFeedbackEnabled } = get();
        if (hapticFeedbackEnabled) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        // Single atomic state update
        set({ 
          chargingStations: updatedStations,
          discoveredStations: newDiscoveredStations,
          totalDiscovered: newDiscoveredStations.length,
        });

        // Award XP after state update
        awardXP(xpReward, xpReason);
        
        // Sync to cloud if user is authenticated
        const { isAuthenticated } = get();
        if (isAuthenticated) {
          // Sync in background without blocking UI
          get().syncToCloud().catch(error => {
            console.error('Background cloud sync failed:', error);
          });
        }
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

      // Supabase Integration Functions
      initializeSupabase: async () => {
        try {
          // Check for existing session
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            set({ 
              currentUser: session.user,
              isAuthenticated: true,
              isCloudSyncEnabled: true 
            });
            // Load cloud data
            await get().loadFromCloud();
          }
        } catch (error) {
          console.error('Failed to initialize Supabase:', error);
        }
      },

      signIn: async (email: string, password: string): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) throw error;
          
          if (data.user) {
            set({ 
              currentUser: data.user,
              isAuthenticated: true,
              isCloudSyncEnabled: true,
              error: null 
            });
            
            // Load cloud data after successful sign in
            await get().loadFromCloud();
            return true;
          }
          
          return false;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
          set({ error: errorMessage });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      signUp: async (email: string, password: string): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });
          
          if (error) throw error;
          
          if (data.user) {
            set({ 
              currentUser: data.user,
              isAuthenticated: true,
              isCloudSyncEnabled: true,
              error: null 
            });
            
            // Create initial cloud profile with local data
            await get().migrateLocalData();
            return true;
          }
          
          return false;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
          set({ error: errorMessage });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      signInWithApple: async (): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await appleAuthService.signInWithApple();
          
          if (result.success && result.data) {
            set({ 
              currentUser: result.data.user,
              isAuthenticated: true,
              isCloudSyncEnabled: true,
              error: null 
            });
            
            // Load cloud data after successful sign in
            await get().loadFromCloud();
            return true;
          } else {
            set({ error: result.error || 'Apple Sign-In failed' });
            return false;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Apple Sign-In failed';
          set({ error: errorMessage });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      signOut: async () => {
        try {
          await supabase.auth.signOut();
          set({ 
            currentUser: null,
            isAuthenticated: false,
            isCloudSyncEnabled: false,
            syncStatus: 'idle' as const
          });
        } catch (error) {
          console.error('Sign out failed:', error);
        }
      },

      syncToCloud: async () => {
        const { currentUser, totalXP, currentLevel, discoveredStations, chargingStations } = get();
        
        if (!currentUser) {
          console.log('No user logged in, skipping cloud sync');
          return;
        }
        
        set({ syncStatus: 'syncing' as const });
        
        try {
          // Get or create user progress
          let userProgress = await supabaseService.getUserProgress(currentUser.id);
          
          if (!userProgress) {
            // Create new user progress
            userProgress = await supabaseService.createUserProgress(currentUser.id, {
              total_xp: totalXP,
              current_level: currentLevel,
              discovered_stations: discoveredStations,
            });
          } else {
            // Update existing user progress
            userProgress = await supabaseService.updateUserProgress(currentUser.id, {
              total_xp: totalXP,
              current_level: currentLevel,
              discovered_stations: discoveredStations,
            });
          }
          
          // Add station discoveries for new discoveries
          const existingDiscoveries = await supabaseService.getUserDiscoveries(currentUser.id);
          const existingStationIds = new Set(existingDiscoveries.map(d => d.station_id));
          
          for (const stationId of discoveredStations) {
            if (!existingStationIds.has(stationId)) {
              const station = chargingStations.find(s => s.id === stationId);
              if (station) {
                await supabaseService.addStationDiscovery({
                  user_id: currentUser.id,
                  station_id: stationId,
                  latitude: station.latitude,
                  longitude: station.longitude,
                  xp_awarded: 100, // Default XP for discovery
                  bonus_type: undefined,
                });
              }
            }
          }
          
          set({ syncStatus: 'success' as const });
          console.log('✅ Cloud sync completed successfully');
          
        } catch (error) {
          console.error('❌ Cloud sync failed:', error);
          set({ syncStatus: 'error' as const });
        }
      },

      loadFromCloud: async () => {
        const { currentUser } = get();
        
        if (!currentUser) {
          console.log('No user logged in, skipping cloud load');
          return;
        }
        
        set({ syncStatus: 'syncing' as const });
        
        try {
          const userProgress = await supabaseService.getUserProgress(currentUser.id);
          
          if (userProgress) {
            // Update local state with cloud data
            const levelInfo = getLevelInfo(userProgress.current_level);
            const nextLevelXP = getNextLevelXP(userProgress.current_level);
            
            set({
              totalXP: userProgress.total_xp,
              currentLevel: userProgress.current_level,
              levelTitle: levelInfo.title,
              levelDescription: levelInfo.description,
              xpToNextLevel: nextLevelXP,
              discoveredStations: userProgress.discovered_stations,
              totalDiscovered: userProgress.discovered_stations.length,
              syncStatus: 'success' as const,
            });
            
            console.log('✅ Cloud data loaded successfully');
          }
          
        } catch (error) {
          console.error('❌ Cloud load failed:', error);
          set({ syncStatus: 'error' as const });
        }
      },

      migrateLocalData: async () => {
        const { currentUser, totalXP, currentLevel, discoveredStations } = get();
        
        if (!currentUser) {
          console.log('No user logged in, skipping migration');
          return;
        }
        
        try {
          // Create user progress with current local data
          await supabaseService.createUserProgress(currentUser.id, {
            total_xp: totalXP,
            current_level: currentLevel,
            discovered_stations: discoveredStations,
          });
          
          // Add existing discoveries
          const { chargingStations } = get();
          for (const stationId of discoveredStations) {
            const station = chargingStations.find(s => s.id === stationId);
            if (station) {
              await supabaseService.addStationDiscovery({
                user_id: currentUser.id,
                station_id: stationId,
                latitude: station.latitude,
                longitude: station.longitude,
                xp_awarded: 100,
                bonus_type: undefined,
              });
            }
          }
          
          console.log('✅ Local data migrated to cloud successfully');
          
        } catch (error) {
          console.error('❌ Migration failed:', error);
          throw error;
        }
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setHapticFeedback: (enabled: boolean) => {
        set({ hapticFeedbackEnabled: enabled });
      },
    }),
    {
      name: 'chargequest-game-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist user progress and settings, not location/permission state
      partialize: (state) => ({
        discoveredStations: state.discoveredStations,
        totalDiscovered: state.totalDiscovered,
        chargingStations: state.chargingStations,
        hapticFeedbackEnabled: state.hapticFeedbackEnabled,
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