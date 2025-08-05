import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { ChargingStation, UserLocation, UserProgress } from '../types/ChargingStation';

// Treasure System Types
export type TreasureRarity = 'common' | 'rare' | 'super_rare' | 'epic' | 'mythic' | 'legendary';

export interface Treasure {
  id: string;
  stationId: string;
  rarity: TreasureRarity;
  treasureType: string;
  value: number;
  description: string;
  spawnedAt: Date;
  collectedAt?: Date;
  isCollected: boolean;
  weekId: string; // Format: YYYY-WW (e.g., "2024-12")
}

export interface TreasureSpawnConfig {
  rarity: TreasureRarity;
  probability: number; // Out of 1000 for precision
  xpBonus: number;
  treasureTypes: {
    type: string;
    value: number;
    description: string;
  }[];
}

import { locationService } from '../services/locationService';
import { nobilApi } from '../services/nobilApi';
import { stationSyncService } from '../services/stationSyncService';
import { swedishStationSyncService } from '../services/swedishStationSync';
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

// Treasure System Constants - Brawl Stars Rarity Distribution
const TREASURE_SPAWN_CONFIG: TreasureSpawnConfig[] = [
  {
    rarity: 'common',
    probability: 450, // 45%
    xpBonus: 25,
    treasureTypes: [
      { type: 'coffee_voucher', value: 25, description: 'Espresso House - Free coffee' },
      { type: 'snack_voucher', value: 15, description: '7-Eleven - Pastry or sandwich' },
      { type: 'charging_credit', value: 10, description: 'EV Charging - 10 SEK bonus' },
      { type: 'digital_magazine', value: 0, description: 'Digital Magazine - 1-month trial' },
      { type: 'spotify_trial', value: 0, description: 'Spotify Premium - 7-day trial' }
    ]
  },
  {
    rarity: 'rare',
    probability: 280, // 28%
    xpBonus: 50,
    treasureTypes: [
      { type: 'juice_combo', value: 45, description: 'Joe & The Juice - Fresh juice + sandwich' },
      { type: 'foodora_discount', value: 30, description: 'Foodora - 20% off next delivery' },
      { type: 'premium_charging', value: 50, description: 'Premium Charging - 50 SEK credit' },
      { type: 'cinema_discount', value: 40, description: 'SF Cinema - Student ticket price' },
      { type: 'transport_credit', value: 50, description: 'SL Travel - 50 SEK credit' }
    ]
  },
  {
    rarity: 'super_rare',
    probability: 150, // 15%
    xpBonus: 100,
    treasureTypes: [
      { type: 'restaurant_voucher', value: 100, description: 'Local Restaurant - 100 SEK voucher' },
      { type: 'nk_shopping', value: 75, description: 'NK Department Store - 75 SEK credit' },
      { type: 'car2go_credit', value: 60, description: 'Car2Go - Free 30-min car sharing' },
      { type: 'gym_pass', value: 80, description: 'SATS Gym - Day pass' },
      { type: 'grona_lund', value: 90, description: 'Gröna Lund - Discounted entry' }
    ]
  },
  {
    rarity: 'epic',
    probability: 80, // 8%
    xpBonus: 200,
    treasureTypes: [
      { type: 'brewery_tour', value: 200, description: 'Stockholms Brygghus - Brewery tour + tasting' },
      { type: 'hotel_discount', value: 300, description: 'Nordic Hotels - Weekend night discount' },
      { type: 'theatre_tickets', value: 250, description: 'Dramaten Theatre - Premium show tickets' },
      { type: 'helicopter_tour', value: 500, description: 'Stockholm Helicopter - City tour discount' },
      { type: 'fotografiska', value: 150, description: 'Fotografiska - Premium exhibition + workshop' }
    ]
  },
  {
    rarity: 'mythic',
    probability: 30, // 3%
    xpBonus: 500,
    treasureTypes: [
      { type: 'michelin_dinner', value: 800, description: 'Michelin Restaurant - Tasting menu for 2' },
      { type: 'archipelago_tour', value: 1200, description: 'Archipelago - Private boat experience' },
      { type: 'royal_palace', value: 400, description: 'Royal Palace - Private guided tour' },
      { type: 'are_ski_weekend', value: 1000, description: 'Åre Ski Resort - Weekend getaway package' },
      { type: 'tesla_experience', value: 600, description: 'Tesla Test Drive - Model S experience day' }
    ]
  },
  {
    rarity: 'legendary',
    probability: 10, // 1%
    xpBonus: 1000,
    treasureTypes: [
      { type: 'grand_hotel', value: 2000, description: 'Grand Hôtel Stockholm - Luxury weekend stay' },
      { type: 'sas_premium', value: 1500, description: 'SAS Premium - Upgrade voucher for European flights' },
      { type: 'abba_vip', value: 800, description: 'ABBA Experience - VIP museum tour + dinner' },
      { type: 'yacht_club', value: 1200, description: 'Royal Yacht Club - Exclusive sailing experience' },
      { type: 'nobel_private', value: 1000, description: 'Nobel Museum - Private after-hours tour + champagne' }
    ]
  }
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

// Treasure System Helper Functions
const getCurrentWeekId = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const weekNumber = Math.ceil(((now.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7);
  return `${year}-${weekNumber.toString().padStart(2, '0')}`;
};

const generateTreasureId = (stationId: string, weekId: string): string => {
  return `treasure_${stationId}_${weekId}`;
};

const selectRandomRarity = (userLevel: number = 1, isDiscoveryBonus: boolean = false): TreasureRarity => {
  // Apply level bonus: +5% Epic+ chance per level above 1
  const levelBonus = (userLevel - 1) * 50; // 50 points = 5%
  
  // Apply discovery bonus: +15% Epic+ chance for first-time discovery
  const discoveryBonus = isDiscoveryBonus ? 150 : 0; // 150 points = 15%
  
  // Generate random number (0-999)
  let random = Math.floor(Math.random() * 1000);
  
  // Apply bonuses by shifting epic+ probabilities
  const totalBonus = levelBonus + discoveryBonus;
  if (totalBonus > 0) {
    // If we're in the epic+ range (top 11%), apply bonus
    if (random >= 880) { // Epic+ range (12%)
      random = Math.max(0, random - totalBonus);
    }
  }
  
  // Find matching rarity based on probability
  let cumulativeProbability = 0;
  for (const config of TREASURE_SPAWN_CONFIG) {
    cumulativeProbability += config.probability;
    if (random < cumulativeProbability) {
      return config.rarity;
    }
  }
  
  // Fallback to common
  return 'common';
};

const selectRandomTreasureType = (rarity: TreasureRarity): { type: string; value: number; description: string } => {
  const config = TREASURE_SPAWN_CONFIG.find(c => c.rarity === rarity);
  if (!config || !config.treasureTypes.length) {
    return { type: 'unknown', value: 0, description: 'Unknown treasure' };
  }
  
  const randomIndex = Math.floor(Math.random() * config.treasureTypes.length);
  return config.treasureTypes[randomIndex];
};

const spawnTreasureForStation = (
  stationId: string, 
  userLevel: number = 1, 
  isDiscoveryBonus: boolean = false
): Treasure => {
  const weekId = getCurrentWeekId();
  const rarity = selectRandomRarity(userLevel, isDiscoveryBonus);
  const treasureType = selectRandomTreasureType(rarity);
  
  return {
    id: generateTreasureId(stationId, weekId),
    stationId,
    rarity,
    treasureType: treasureType.type,
    value: treasureType.value,
    description: treasureType.description,
    spawnedAt: new Date(),
    isCollected: false,
    weekId
  };
};

const getTreasureXPBonus = (rarity: TreasureRarity): number => {
  const config = TREASURE_SPAWN_CONFIG.find(c => c.rarity === rarity);
  return config?.xpBonus || 0;
};

const getRarityColor = (rarity: TreasureRarity): string => {
  const colors = {
    common: '#CCCCCC',      // Gray
    rare: '#00FF00',        // Green  
    super_rare: '#0099FF',  // Blue
    epic: '#9933FF',        // Purple
    mythic: '#FF3399',      // Pink
    legendary: '#FFCC00'    // Gold
  };
  return colors[rarity] || colors.common;
};

const getRarityDisplayName = (rarity: TreasureRarity): string => {
  const names = {
    common: 'Common',
    rare: 'Rare',
    super_rare: 'Super Rare',
    epic: 'Epic',
    mythic: 'Mythic',
    legendary: 'Legendary'
  };
  return names[rarity] || 'Unknown';
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
  
  // If we have user location, prioritize centering around user with stations visible
  if (userLocation && typeof userLocation.latitude === 'number' && typeof userLocation.longitude === 'number') {
    console.log('🎯 Calculating bounds centered on user location');
    
    // Find the farthest station from user to determine appropriate zoom level
    const distances = validStations.map(s => {
      const latDiff = Math.abs(s.latitude - userLocation.latitude);
      const lngDiff = Math.abs(s.longitude - userLocation.longitude);
      return Math.max(latDiff, lngDiff); // Use max to ensure all stations are visible
    });
    
    const maxDistance = Math.max(...distances);
    console.log('🗺️ Max distance from user to any station:', maxDistance);
    
    // Add 50% padding to ensure all stations are comfortably visible
    const padding = maxDistance * 0.5;
    
    const bounds = {
      northeast: { 
        latitude: userLocation.latitude + maxDistance + padding, 
        longitude: userLocation.longitude + maxDistance + padding 
      },
      southwest: { 
        latitude: userLocation.latitude - maxDistance - padding, 
        longitude: userLocation.longitude - maxDistance - padding 
      }
    };
    
    console.log('🗺️ User-centered bounds:', bounds);
    return bounds;
  }
  
  // Fallback: calculate bounds from all coordinates
  const allCoords = validStations.map(s => ({ latitude: s.latitude, longitude: s.longitude }));
  
  const latitudes = allCoords.map(c => c.latitude);
  const longitudes = allCoords.map(c => c.longitude);
  
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  
  // Add padding (roughly 20% on each side for better visibility)
  const latPadding = (maxLat - minLat) * 0.2;
  const lngPadding = (maxLng - minLng) * 0.2;
  
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
  
  console.log('🗺️ Station-based bounds:', bounds);
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
  
  // Treasure System
  treasures: Treasure[];
  currentWeekId: string;
  lastTreasureRefresh: Date | null;
  treasureStats: {
    totalCollected: number;
    commonCollected: number;
    rareCollected: number;
    superRareCollected: number;
    epicCollected: number;
    mythicCollected: number;
    legendaryCollected: number;
  };
  
  // Tool System State
  equippedTools: {
    slot1: string | null; // Energy Radar
    slot2: string | null; // Treasure Preview  
    slot3: string | null; // Explorer's Eye
  };
  
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
  loadChargingStations: (forceReload?: boolean) => Promise<void>;
  syncAllStations: () => Promise<{ synced: number; totalStations: number; errors: string[] }>;
  getSyncStatus: () => Promise<any>;
  searchStations: (searchTerm: string) => Promise<any[]>;
  syncAllSwedishStations: () => Promise<any>;
  getSwedishStationStats: () => Promise<any>;
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
  
  // Treasure System Actions
  spawnTreasuresForDiscoveredStations: () => void;
  spawnTreasureForStation: (stationId: string, isDiscoveryBonus?: boolean) => Treasure | null;
  collectTreasure: (treasureId: string) => boolean;
  getTreasureForStation: (stationId: string) => Treasure | null;
  checkForWeeklyReset: () => boolean;
  performWeeklyTreasureReset: () => void;
  
  // Tool System Actions
  equipTool: (toolName: string, slotNumber: 1 | 2 | 3) => void;
  unequipTool: (slotNumber: 1 | 2 | 3) => void;
  isToolUnlocked: (toolName: string) => boolean;
  getEquippedTool: (slotNumber: 1 | 2 | 3) => string | null;
  
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
      
      // Treasure System Initial State
      treasures: [],
      currentWeekId: getCurrentWeekId(),
      lastTreasureRefresh: null,
      treasureStats: {
        totalCollected: 0,
        commonCollected: 0,
        rareCollected: 0,
        superRareCollected: 0,
        epicCollected: 0,
        mythicCollected: 0,
        legendaryCollected: 0,
      },
      
      // Tool System Initial State
      equippedTools: {
        slot1: null,
        slot2: null,
        slot3: null,
      },
      
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
          
          // Initialize treasure system
          const { checkForWeeklyReset, performWeeklyTreasureReset, spawnTreasuresForDiscoveredStations } = get();
          
          if (checkForWeeklyReset()) {
            console.log('🗓️ New week detected - performing treasure reset');
            performWeeklyTreasureReset();
          } else {
            console.log('🎁 Same week - spawning missing treasures for discovered stations');
            spawnTreasuresForDiscoveredStations();
          }
          
        } catch (error) {
          set({ error: 'Failed to initialize location services' });
        } finally {
          set({ isLoading: false });
        }
      },

      loadChargingStations: async (forceReload: boolean = false) => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('🔌 Loading Stockholm charging stations...', forceReload ? '(FORCE RELOAD)' : '');
          
          // Pass current user location for location-based filtering
          const { currentLocation } = get();
          console.log('📍 Current location from store:', currentLocation);
          
          const userLocation = currentLocation ? {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude
          } : undefined;
          
          console.log('📍 Processed user location:', userLocation);
          
          if (!userLocation) {
            console.log('⚠️ No user location available - will return first 10 stations without distance filtering');
          } else {
            console.log('✅ User location available - will filter by distance');
            // Clear cache to ensure fresh location-based filtering
            if (forceReload) {
              nobilApi.clearCache();
              console.log('🗑️ Cache cleared for location-based reload');
            }
          }
          
          // Show the 10 CLOSEST Recharge stations to user
          const includeOperators = ['Recharge']; // Filter to Recharge, then get 10 closest
          // const includeOperators: string[] = []; // Use this to show all operators
          
          console.log('📊 Using Supabase database for comprehensive station data...');
          // Get ALL Recharge stations in Sweden (show all on map)
          const stations = await stationSyncService.getStations(userLocation, 9999, includeOperators);
          console.log(`🇸🇪 Loaded ${stations.length} total Recharge stations in Sweden`);
          
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
          console.log('🗺️ Station IDs received:', stations.map(s => s.id));
          console.log('🗺️ First few stations with coordinates:', stations.slice(0, 3).map(s => ({
            id: s.id,
            title: s.title,
            lat: s.latitude,
            lng: s.longitude
          })));
          
          // Calculate map bounds using ONLY the 10 closest stations for smart zoom level
          // (but we'll show ALL stations on the map)
          const closestStationsForZoom = stations.slice(0, 10);
          console.log(`🎯 Using ${closestStationsForZoom.length} closest stations for zoom calculation (out of ${stations.length} total)`);
          const bounds = calculateMapBounds(closestStationsForZoom, userLocation);
          
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

      syncAllStations: async () => {
        console.log('🔄 Starting comprehensive station sync...');
        set({ isLoading: true, error: null });
        
        try {
          const result = await stationSyncService.syncAllStations();
          console.log(`✅ Sync completed: ${result.synced} stations synced, ${result.errors.length} errors`);
          
          if (result.errors.length > 0) {
            console.warn('⚠️ Sync had errors:', result.errors);
            set({ error: `Sync completed with ${result.errors.length} errors` });
          }
          
          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
          console.error('❌ Station sync failed:', errorMessage);
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      getSyncStatus: async () => {
        try {
          const status = await stationSyncService.getSyncStatus();
          console.log('📊 Sync status:', status);
          return status;
        } catch (error) {
          console.error('❌ Failed to get sync status:', error);
          throw error;
        }
      },

      searchStations: async (searchTerm: string) => {
        try {
          const stations = await stationSyncService.searchStationsByName(searchTerm);
          console.log(`🔍 Search results for "${searchTerm}":`, stations);
          return stations;
        } catch (error) {
          console.error('❌ Failed to search stations:', error);
          throw error;
        }
      },

      // Swedish Stations Comprehensive Sync via Edge Function
      syncAllSwedishStations: async () => {
        try {
          console.log('🇸🇪 Starting comprehensive Swedish stations sync via Edge Function...');
          const result = await swedishStationSyncService.syncAllSwedishStations();
          console.log('✅ Swedish sync completed:', result);
          return result;
        } catch (error) {
          console.error('❌ Swedish sync failed:', error);
          throw error;
        }
      },

      // Get Swedish station statistics
      getSwedishStationStats: async () => {
        try {
          console.log('📊 Getting Swedish station stats...');
          const stats = await swedishStationSyncService.getSwedishStationStats();
          console.log('📊 Swedish stats:', stats);
          return stats;
        } catch (error) {
          console.error('❌ Failed to get Swedish stats:', error);
          throw error;
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
        const { chargingStations, currentLocation: previousLocation } = get();
        const isFirstLocation = !previousLocation;
        
        set({ currentLocation: location, error: null });
        
        // If this is the first time we get location and we have stations already loaded,
        // reload them with location-based filtering  
        if (isFirstLocation && chargingStations.length > 0) {
          console.log('🔄 First location update - reloading stations with location filtering');
          setTimeout(() => {
            get().loadChargingStations(true);
          }, 1000); // Small delay to ensure location is fully set
        }
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
        
        // Spawn discovery treasure with bonus chance
        get().spawnTreasureForStation(stationId, true);
        
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
        const { 
          currentUser, 
          totalXP, 
          currentLevel, 
          discoveredStations, 
          chargingStations,
          treasureStats,
          equippedTools,
          currentWeekId,
          lastTreasureRefresh
        } = get();
        
        if (!currentUser) {
          console.log('No user logged in, skipping cloud sync');
          return;
        }
        
        set({ syncStatus: 'syncing' as const });
        
        try {
          // Sync user progress (existing functionality)
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
          
          // Sync treasure state (new functionality)
          await supabaseService.syncUserTreasureState(currentUser.id, {
            treasureStats,
            equippedTools,
            currentWeekId,
            lastTreasureRefresh
          });
          
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
          console.log('✅ Cloud sync completed successfully (including treasure state)');
          
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
          // Load user progress (existing functionality)
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
            });
          }
          
          // Load treasure state (new functionality)
          const treasureState = await supabaseService.getUserTreasureState(currentUser.id);
          
          if (treasureState) {
            set({
              treasureStats: {
                totalCollected: treasureState.total_collected,
                commonCollected: treasureState.common_collected,
                rareCollected: treasureState.rare_collected,
                superRareCollected: treasureState.super_rare_collected,
                epicCollected: treasureState.epic_collected,
                mythicCollected: treasureState.mythic_collected,
                legendaryCollected: treasureState.legendary_collected,
              },
              equippedTools: {
                slot1: treasureState.equipped_slot1,
                slot2: treasureState.equipped_slot2,
                slot3: treasureState.equipped_slot3,
              },
              currentWeekId: treasureState.current_week_id,
              lastTreasureRefresh: treasureState.last_treasure_refresh ? new Date(treasureState.last_treasure_refresh) : null,
            });
            
            console.log('✅ Cloud treasure state loaded successfully');
          } else {
            console.log('📦 No cloud treasure state found - using local data');
          }
          
          set({ syncStatus: 'success' as const });
          console.log('✅ Cloud data loaded successfully (including treasure state)');
          
        } catch (error) {
          console.error('❌ Cloud load failed:', error);
          set({ syncStatus: 'error' as const });
        }
      },

      migrateLocalData: async () => {
        const { 
          currentUser, 
          totalXP, 
          currentLevel, 
          discoveredStations,
          treasureStats,
          equippedTools,
          currentWeekId,
          lastTreasureRefresh
        } = get();
        
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
          
          // Create treasure state with current local data
          await supabaseService.createUserTreasureState(currentUser.id, {
            total_collected: treasureStats.totalCollected,
            common_collected: treasureStats.commonCollected,
            rare_collected: treasureStats.rareCollected,
            super_rare_collected: treasureStats.superRareCollected,
            epic_collected: treasureStats.epicCollected,
            mythic_collected: treasureStats.mythicCollected,
            legendary_collected: treasureStats.legendaryCollected,
            equipped_slot1: equippedTools.slot1,
            equipped_slot2: equippedTools.slot2,
            equipped_slot3: equippedTools.slot3,
            current_week_id: currentWeekId,
            last_treasure_refresh: lastTreasureRefresh?.toISOString() || null,
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
          
          console.log('✅ Local data migrated to cloud successfully (including treasure state)');
          
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
      
      // Treasure System Action Implementations
      spawnTreasuresForDiscoveredStations: () => {
        const { discoveredStations, currentLevel, treasures } = get();
        const currentWeek = getCurrentWeekId();
        
        console.log(`🎁 Spawning treasures for ${discoveredStations.length} discovered stations (Week ${currentWeek})`);
        
        const newTreasures: Treasure[] = [];
        
        for (const stationId of discoveredStations) {
          // Check if treasure already exists for this station this week
          const existingTreasure = treasures.find(t => 
            t.stationId === stationId && t.weekId === currentWeek
          );
          
          if (!existingTreasure) {
            const treasure = spawnTreasureForStation(stationId, currentLevel, false);
            newTreasures.push(treasure);
          }
        }
        
        if (newTreasures.length > 0) {
          set({ 
            treasures: [...treasures, ...newTreasures],
            lastTreasureRefresh: new Date()
          });
          console.log(`✨ Spawned ${newTreasures.length} new treasures`);
        }
      },

      spawnTreasureForStation: (stationId: string, isDiscoveryBonus: boolean = false) => {
        const { currentLevel, treasures } = get();
        const currentWeek = getCurrentWeekId();
        
        // Check if treasure already exists for this station this week
        const existingTreasure = treasures.find(t => 
          t.stationId === stationId && t.weekId === currentWeek
        );
        
        if (existingTreasure) {
          console.log(`⚠️ Treasure already exists for station ${stationId} this week`);
          return null;
        }
        
        const treasure = spawnTreasureForStation(stationId, currentLevel, isDiscoveryBonus);
        
        set({ 
          treasures: [...treasures, treasure]
        });
        
        console.log(`🎁 Spawned ${getRarityDisplayName(treasure.rarity)} treasure for station ${stationId}${isDiscoveryBonus ? ' (Discovery Bonus!)' : ''}`);
        return treasure;
      },

      collectTreasure: (treasureId: string) => {
        const { treasures, treasureStats, awardXP } = get();
        
        const treasure = treasures.find(t => t.id === treasureId);
        if (!treasure || treasure.isCollected) {
          console.log(`⚠️ Treasure ${treasureId} not found or already collected`);
          return false;
        }
        
        // Mark treasure as collected
        const updatedTreasures = treasures.map(t => 
          t.id === treasureId 
            ? { ...t, isCollected: true, collectedAt: new Date() }
            : t
        );
        
        // Update treasure statistics
        const newStats = { ...treasureStats };
        newStats.totalCollected++;
        
        switch (treasure.rarity) {
          case 'common': newStats.commonCollected++; break;
          case 'rare': newStats.rareCollected++; break;
          case 'super_rare': newStats.superRareCollected++; break;
          case 'epic': newStats.epicCollected++; break;
          case 'mythic': newStats.mythicCollected++; break;
          case 'legendary': newStats.legendaryCollected++; break;
        }
        
        // Award XP bonus based on rarity
        const xpBonus = getTreasureXPBonus(treasure.rarity);
        
        // Celebration haptics for rare+ treasures
        if (['epic', 'mythic', 'legendary'].includes(treasure.rarity)) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else if (['rare', 'super_rare'].includes(treasure.rarity)) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        
        set({ 
          treasures: updatedTreasures,
          treasureStats: newStats
        });
        
        // Award XP bonus
        if (xpBonus > 0) {
          awardXP(xpBonus, `Collected ${getRarityDisplayName(treasure.rarity)} treasure: ${treasure.description}`);
        }
        
        console.log(`🎉 Collected ${getRarityDisplayName(treasure.rarity)} treasure: ${treasure.description} (+${xpBonus} XP)`);
        
        // Sync to cloud if user is authenticated
        const { isAuthenticated } = get();
        if (isAuthenticated) {
          // Sync in background without blocking UI
          get().syncToCloud().catch(error => {
            console.error('Background treasure sync failed:', error);
          });
        }
        
        return true;
      },

      getTreasureForStation: (stationId: string) => {
        const { treasures } = get();
        const currentWeek = getCurrentWeekId();
        
        return treasures.find(t => 
          t.stationId === stationId && 
          t.weekId === currentWeek && 
          !t.isCollected
        ) || null;
      },

      checkForWeeklyReset: () => {
        const { currentWeekId } = get();
        const actualCurrentWeek = getCurrentWeekId();
        
        return currentWeekId !== actualCurrentWeek;
      },

      performWeeklyTreasureReset: () => {
        const { discoveredStations, currentLevel } = get();
        const newWeekId = getCurrentWeekId();
        
        console.log(`🔄 Performing weekly treasure reset for Week ${newWeekId}`);
        
        // Spawn new treasures for all discovered stations
        const newTreasures: Treasure[] = [];
        for (const stationId of discoveredStations) {
          const treasure = spawnTreasureForStation(stationId, currentLevel, false);
          newTreasures.push(treasure);
        }
        
        set({ 
          treasures: newTreasures, // Replace all treasures
          currentWeekId: newWeekId,
          lastTreasureRefresh: new Date()
        });
        
        console.log(`✨ Weekly reset complete: ${newTreasures.length} new treasures spawned`);
      },

      // Tool System Action Implementations
      equipTool: (toolName: string, slotNumber: 1 | 2 | 3) => {
        const { equippedTools, isToolUnlocked } = get();
        
        if (!isToolUnlocked(toolName)) {
          console.log(`⚠️ Tool ${toolName} is not unlocked yet`);
          return;
        }
        
        const newEquippedTools = { ...equippedTools };
        const slotKey = `slot${slotNumber}` as keyof typeof equippedTools;
        
        // Unequip any existing tool in other slots with the same name
        Object.keys(newEquippedTools).forEach(key => {
          if (newEquippedTools[key as keyof typeof newEquippedTools] === toolName) {
            newEquippedTools[key as keyof typeof newEquippedTools] = null;
          }
        });
        
        // Equip the tool in the specified slot
        newEquippedTools[slotKey] = toolName;
        
        set({ equippedTools: newEquippedTools });
        
        // Haptic feedback for tool equip
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        console.log(`🔧 Equipped ${toolName} in slot ${slotNumber}`);
        
        // Sync to cloud if user is authenticated
        const { isAuthenticated } = get();
        if (isAuthenticated) {
          // Sync in background without blocking UI
          get().syncToCloud().catch(error => {
            console.error('Background tool sync failed:', error);
          });
        }
      },

      unequipTool: (slotNumber: 1 | 2 | 3) => {
        const { equippedTools } = get();
        const slotKey = `slot${slotNumber}` as keyof typeof equippedTools;
        
        const toolName = equippedTools[slotKey];
        if (!toolName) {
          console.log(`⚠️ No tool equipped in slot ${slotNumber}`);
          return;
        }
        
        const newEquippedTools = { ...equippedTools };
        newEquippedTools[slotKey] = null;
        
        set({ equippedTools: newEquippedTools });
        
        console.log(`🔧 Unequipped ${toolName} from slot ${slotNumber}`);
      },

      isToolUnlocked: (toolName: string) => {
        const { currentLevel } = get();
        
        const toolRequirements = {
          'energy_radar': 2,
          'treasure_preview': 3,
          'explorer_eye': 4,
          'master_tracker': 5
        };
        
        const requiredLevel = toolRequirements[toolName as keyof typeof toolRequirements];
        return requiredLevel ? currentLevel >= requiredLevel : false;
      },

      getEquippedTool: (slotNumber: 1 | 2 | 3) => {
        const { equippedTools } = get();
        const slotKey = `slot${slotNumber}` as keyof typeof equippedTools;
        return equippedTools[slotKey];
      },
    }),
    {
      name: 'chargequest-game-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist user progress, treasures, tools, and settings, not location/permission state
      partialize: (state) => ({
        discoveredStations: state.discoveredStations,
        totalDiscovered: state.totalDiscovered,
        chargingStations: state.chargingStations,
        hapticFeedbackEnabled: state.hapticFeedbackEnabled,
        // Treasure System Persistence
        treasures: state.treasures,
        currentWeekId: state.currentWeekId,
        lastTreasureRefresh: state.lastTreasureRefresh,
        treasureStats: state.treasureStats,
        // Tool System Persistence
        equippedTools: state.equippedTools,
        // XP System Persistence
        totalXP: state.totalXP,
        currentLevel: state.currentLevel,
        levelTitle: state.levelTitle,
        levelDescription: state.levelDescription,
        xpToNextLevel: state.xpToNextLevel,
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

// Export helper functions for use in components
export { 
  getRarityColor, 
  getRarityDisplayName, 
  getTreasureXPBonus,
  getCurrentWeekId,
  type TreasureRarity,
  type Treasure 
}; 