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

// Phase 3: Station Expiry System Types
export interface ClaimedStation {
  id: string;
  userId: string;
  stationId: string;
  claimedAt: Date;
  lastVisited: Date;
  expiresAt: Date; // claimedAt + 90 days
  renewalCount: number; // How many times renewed
  loyaltyWeeks: number; // Weeks claimed (for bonus calculation)
  createdAt: Date;
  updatedAt: Date;
}

export interface StationExpiryStatus {
  stationId: string;
  isExpired: boolean;
  isExpiring: boolean; // Within 7 days of expiry
  daysUntilExpiry: number;
  canRenew: boolean;
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

// Treasure System Constants - Enhanced Rarity Distribution (Phase 1)
// Making rare treasures truly special: Epic 5%, Mythic 1.5%, Legendary 0.3%
const TREASURE_SPAWN_CONFIG: TreasureSpawnConfig[] = [
  {
    rarity: 'common',
    probability: 500, // 50% (↑ from 45%) - Expected baseline rewards
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
    probability: 290, // 29% (↑ from 28%) - Nice surprise rewards
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
    probability: 150, // 15% (same) - Exciting finds
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
    probability: 47, // 4.7% (↓ from 8%) - Rare thrill moments
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
    probability: 10, // 1.0% (↓ from 3%) - Genuine excitement
    xpBonus: 400, // Balanced XP for true rarity
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
    probability: 3, // 0.3% (↓ from 1%) - True legendary moments (~4 months per player)
    xpBonus: 750, // Massive XP for ultra-rare finds
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

const selectRandomRarity = (
  userLevel: number = 1, 
  isDiscoveryBonus: boolean = false,
  oddsMultiplier: number = 1.0
): TreasureRarity => {
  // Apply level bonus: +5% Epic+ chance per level above 1
  const levelBonus = (userLevel - 1) * 50; // 50 points = 5%
  
  // Apply discovery bonus: +15% Epic+ chance for first-time discovery
  const discoveryBonus = isDiscoveryBonus ? 150 : 0; // 150 points = 15%
  
  // Phase 2: Apply urban/rural odds multiplier by adjusting rare treasure probabilities
  // Higher multiplier = better chance at rare treasures by reducing common/rare thresholds
  const multiplierAdjustment = Math.floor((oddsMultiplier - 1.0) * 200); // Convert multiplier to probability points
  
  // Generate random number (0-999)
  let random = Math.floor(Math.random() * 1000);
  
  // Apply bonuses by shifting epic+ probabilities
  const totalBonus = levelBonus + discoveryBonus + multiplierAdjustment;
  if (totalBonus > 0) {
    // If we're in the epic+ range (top 11%), apply bonus
    if (random >= 880) { // Epic+ range (12%)
      random = Math.max(0, random - totalBonus);
    }
  }
  
  // Debug logging for Phase 2
  if (oddsMultiplier > 1.0) {
    console.log(`🎲 Rarity Roll (Enhanced): ${random}/1000 | Multiplier: ${oddsMultiplier.toFixed(2)}x | Bonus: ${totalBonus} pts`);
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

// Phase 2: Urban/Rural Balance Functions
const countStationsWithin5km = (centerStation: ChargingStation, allStations: ChargingStation[]): number => {
  return allStations.filter(station => 
    locationService.calculateDistance(
      centerStation.latitude, centerStation.longitude,
      station.latitude, station.longitude
    ) <= 5000 // 5km in meters
  ).length;
};

const calculateEnhancedTreasureOdds = (
  stationId: string,
  userLocation: UserLocation,
  allStations: ChargingStation[],
  weeksClaimed: number = 0
): number => {
  const station = allStations.find(s => s.id === stationId);
  if (!station) return 1.0;
  
  // 1. Loyalty multiplier (improves odds, doesn't guarantee)
  const loyaltyMultiplier = Math.min(1 + (weeksClaimed * 0.05), 1.5); // Max 1.5x after 10 weeks
  
  // 2. Distance effort bonus
  const distance = locationService.calculateDistance(
    userLocation.latitude, userLocation.longitude,
    station.latitude, station.longitude
  );
  const distanceBonus = distance > 2000 ? 1.5 : 1.0; // 2km+ = 50% bonus
  
  // 3. Station density balance
  const nearbyCount = countStationsWithin5km(station, allStations);
  const densityBonus = nearbyCount < 10 ? 1.5 : 1.0; // Low density = 50% bonus
  
  const totalMultiplier = loyaltyMultiplier * distanceBonus * densityBonus;
  
  // Enhanced logging for Phase 2 monitoring
  console.log(`🎯 Enhanced Treasure Odds for ${station.title}:`);
  console.log(`   🔄 Loyalty (${weeksClaimed} weeks): ${loyaltyMultiplier.toFixed(2)}x`);
  console.log(`   🚶 Distance (${(distance/1000).toFixed(1)}km): ${distanceBonus.toFixed(2)}x`);
  console.log(`   🏘️ Density (${nearbyCount} nearby): ${densityBonus.toFixed(2)}x`);
  console.log(`   ⚡ Total Multiplier: ${totalMultiplier.toFixed(2)}x`);
  
  if (totalMultiplier > 2.0) {
    console.log(`🌟 Rural Advantage! ${totalMultiplier.toFixed(2)}x better odds for your effort!`);
  }
  
  return totalMultiplier;
};

const spawnTreasureForStation = (
  stationId: string, 
  userLevel: number = 1,
  isDiscoveryBonus: boolean = false,
  userLocation?: UserLocation,
  allStations?: ChargingStation[],
  weeksClaimed: number = 0
): Treasure => {
  const weekId = getCurrentWeekId();
  
  // Phase 2: Calculate enhanced odds if location and stations are provided
  let oddsMultiplier = 1.0;
  if (userLocation && allStations) {
    oddsMultiplier = calculateEnhancedTreasureOdds(stationId, userLocation, allStations, weeksClaimed);
  }
  
  const rarity = selectRandomRarity(userLevel, isDiscoveryBonus, oddsMultiplier);
  const treasureType = selectRandomTreasureType(rarity);
  
  // Enhanced logging for Phase 1 monitoring
  const rarityPercentage = (TREASURE_SPAWN_CONFIG.find(c => c.rarity === rarity)?.probability || 0) / 10;
  const xpBonus = getTreasureXPBonus(rarity);
  const bonusText = isDiscoveryBonus ? ' (Discovery Bonus!)' : '';
  
  console.log(`🎁 Spawned ${rarity.charAt(0).toUpperCase() + rarity.slice(1)} treasure for station ${stationId}${bonusText}`);
  console.log(`   📊 Rarity: ${rarityPercentage}% chance | 💎 Value: ${treasureType.value} SEK | ⚡ XP: +${xpBonus}`);
  
  // Log special rare finds
  if (rarity === 'epic') {
    console.log(`🔥 EPIC FIND! ${treasureType.description}`);
  } else if (rarity === 'mythic') {
    console.log(`⭐ MYTHIC TREASURE! ${treasureType.description}`);
  } else if (rarity === 'legendary') {
    console.log(`🏆 🌟 LEGENDARY!!! 🌟 🏆 ${treasureType.description}`);
  }
  
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

// Validation function for enhanced rarity distribution (Phase 1 & 2)
const validateTreasureDistribution = (): void => {
  const totalProbability = TREASURE_SPAWN_CONFIG.reduce((sum, config) => sum + config.probability, 0);
  console.log('🎲 Enhanced Treasure Distribution Validation:');
  console.log(`📊 Total probability: ${totalProbability}/1000 (${(totalProbability/10)}%)`);
  
  TREASURE_SPAWN_CONFIG.forEach(config => {
    const percentage = (config.probability / 1000 * 100).toFixed(1);
    console.log(`  ${config.rarity.toUpperCase()}: ${config.probability}/1000 (${percentage}%) - +${config.xpBonus} XP`);
  });
  
  if (totalProbability !== 1000) {
    console.warn('⚠️ Distribution error: Total probability should equal 1000');
  } else {
    console.log('✅ Distribution validated: Legendary treasures are now truly legendary!');
  }
  
  // Phase 2: Validate urban/rural balance system
  console.log('🌍 Phase 2: Urban/Rural Balance System Validated');
  console.log('  🏙️ Urban areas: Standard odds (1.0x multiplier)');
  console.log('  🌾 Rural areas: Up to 2.25x better odds (1.5x distance + 1.5x density)');
  console.log('  🔄 Loyalty system: Up to 1.5x multiplier after 10 weeks');
  console.log('  ⚡ Maximum combined: 3.375x multiplier for loyal rural players!');
  
  // Phase 3: Validate station expiry system
  console.log('🏠 Phase 3: Station Expiry System Validated');
  console.log('  ⏰ Claim duration: 90 days from initial claim');
  console.log('  🔄 Renewal window: 7 days before expiry + 24 hours after');
  console.log('  📈 Loyalty tracking: Weeks claimed affects treasure odds');
  console.log('  🧹 Auto-cleanup: Expired stations removed after grace period');
  console.log('  🎯 Strategic choice: Players must choose which stations to maintain');
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
  stationsLastLoaded: Date | null;
  stationsLastLocation: { latitude: number; longitude: number } | null;
  
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
  
  // Phase 3: Station Expiry System State
  claimedStations: ClaimedStation[];
  lastExpiryCheck: Date | null;
  
  // Phase 4: Cloud Sync State
  claimedStationsSubscription: any | null;
  lastCloudSync: Date | null;
  
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
  
  // Phase 3: Station Expiry System Actions
  claimStationWithExpiry: (stationId: string) => Promise<ClaimedStation | null>;
  renewStationClaim: (stationId: string) => Promise<boolean>;
  getStationExpiryStatus: (stationId: string) => StationExpiryStatus | null;
  checkExpiredStations: () => ClaimedStation[];
  cleanupExpiredStations: () => Promise<void>;
  isStationClaimedByUser: (stationId: string) => boolean;
  getClaimedStationLoyaltyWeeks: (stationId: string) => number;
  
  // Phase 4: Supabase Cloud Sync Actions
  syncClaimedStationToCloud: (station: ClaimedStation) => Promise<boolean>;
  syncClaimedStationsFromCloud: () => Promise<ClaimedStation[]>;
  handleStationConflicts: (local: ClaimedStation[], cloud: ClaimedStation[]) => ClaimedStation[];
  migrateLocalStationsToCloud: () => Promise<boolean>;
  subscribeToClaimedStationsUpdates: () => Promise<void>;
  unsubscribeFromClaimedStationsUpdates: () => void;
  initializeCloudSync: () => Promise<void>;
  cleanupCloudSync: () => void;
  
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
  
  // Debug Actions
  createTojnanTestStations: () => void;
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
      stationsLastLoaded: null,
      stationsLastLocation: null,
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
      
      // Phase 3: Station Expiry System Initial State
      claimedStations: [],
      lastExpiryCheck: null,
      
      // Phase 4: Cloud Sync Initial State  
      claimedStationsSubscription: null,
      lastCloudSync: null,
      
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
        
        // Validate enhanced treasure distribution on startup
        validateTreasureDistribution();
        
        try {
          const granted = await locationService.requestPermissions();
          set({ locationPermissionGranted: granted });
          
          if (granted) {
            // Get initial location
            const location = await locationService.getCurrentLocation();
            if (location) {
              set({ currentLocation: location });
            }
            
            // Start continuous location tracking
            console.log('🎯 Starting continuous location tracking...');
            await get().startLocationTracking();
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
          
          // Phase 3: Initialize station expiry system
          console.log('🏠 Initializing station expiry system...');
          await get().cleanupExpiredStations();
          
          const expiredStations = get().checkExpiredStations();
          if (expiredStations.length > 0) {
            console.log(`⚠️ Found ${expiredStations.length} stations needing renewal attention`);
          }
          
          console.log(`🏠 Currently managing ${get().claimedStations.length} claimed stations`);
          
          // Phase 4: Initialize cloud sync if authenticated
          if (get().isAuthenticated) {
            console.log('☁️ Initializing cloud sync for claimed stations...');
            await get().initializeCloudSync();
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
          const { currentLocation, stationsLastLoaded, stationsLastLocation } = get();
          console.log('📍 Current location from store:', currentLocation);
          
          const userLocation = currentLocation ? {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude
          } : undefined;
          
          console.log('📍 Processed user location:', userLocation);
          
          // Smart caching logic
          const now = new Date();
          const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
          const LOCATION_CHANGE_THRESHOLD = 1000; // 1km in meters
          
          const isCacheValid = stationsLastLoaded && 
            stationsLastLoaded instanceof Date && 
            (now.getTime() - stationsLastLoaded.getTime()) < CACHE_DURATION_MS;
          
          const hasLocationChangedSignificantly = userLocation && stationsLastLocation ? 
            locationService.calculateDistance(
              stationsLastLocation.latitude,
              stationsLastLocation.longitude,
              userLocation.latitude,
              userLocation.longitude
            ) > LOCATION_CHANGE_THRESHOLD : false;
          
          // Skip reload if cache is valid and no significant location change
          if (!forceReload && isCacheValid && !hasLocationChangedSignificantly) {
            console.log('📋 Using cached station data - no reload needed');
            if (stationsLastLoaded instanceof Date) {
              console.log(`   ⏰ Cache age: ${((now.getTime() - stationsLastLoaded.getTime()) / 1000 / 60).toFixed(1)} minutes`);
            }
            if (userLocation && stationsLastLocation) {
              const distance = locationService.calculateDistance(
                stationsLastLocation.latitude,
                stationsLastLocation.longitude,
                userLocation.latitude,
                userLocation.longitude
              );
              console.log(`   📍 Location change: ${(distance/1000).toFixed(1)}km`);
            }
            set({ isLoading: false });
            return;
          }
          
          // Log cache miss reasons
          if (forceReload) {
            console.log('🔄 Cache bypass: Force reload requested');
          } else if (!isCacheValid) {
            console.log('⏰ Cache miss: Data expired');
          } else if (hasLocationChangedSignificantly) {
            console.log('📍 Cache miss: Significant location change detected');
          }
          
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
          
          // Update cache timestamps for smart caching
          set({ 
            chargingStations: updatedStations,
            mapBounds: bounds,
            stationsLastLoaded: now,
            stationsLastLocation: userLocation || null,
            error: null 
          });
          
          console.log('📋 Station cache updated:', {
            count: updatedStations.length,
            timestamp: now.toISOString(),
            location: userLocation ? `${userLocation.latitude.toFixed(3)}, ${userLocation.longitude.toFixed(3)}` : 'none'
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
        
        // Validate location data
        if (!location || !location.latitude || !location.longitude) {
          console.error('❌ Invalid location data received:', location);
          return;
        }
        
        console.log('📍 Location updated in game store:', {
          lat: location.latitude.toFixed(6),
          lng: location.longitude.toFixed(6),
          accuracy: location.accuracy,
          isFirst: isFirstLocation
        });
        
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
        
        // Spawn discovery treasure with enhanced Phase 2 bonus chance
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
      
      // Debug Actions Implementation
      createTojnanTestStations: () => {
        console.log('🧪 Creating Töjnan area test stations for local testing...');
        
        const testStations: ChargingStation[] = [
          {
            id: 'test-tojnan-1',
            latitude: 59.424101,
            longitude: 17.936394,
            title: "Test: Fjällvägen 9A (Your Location)",
            description: "Test station at your exact GPS coordinates",
            operator: "Recharge",
            isDiscovered: false,
            isDiscoverable: false,
            isUnlocking: false,
            unlockProgress: 0,
          },
          {
            id: 'test-tojnan-2',
            latitude: 59.4260085,
            longitude: 17.9312432,
            title: "Test: Villavägen Station",
            description: "Test station for claim testing",
            operator: "Recharge",
            isDiscovered: false,
            isDiscoverable: false,
            isUnlocking: false,
            unlockProgress: 0,
          },
          {
            id: 'test-tojnan-3',
            latitude: 59.4249233,
            longitude: 17.9292865,
            title: "Test: Töjnaskolan Park",
            description: "Test station for claim testing",
            operator: "Recharge",
            isDiscovered: false,
            isDiscoverable: false,
            isUnlocking: false,
            unlockProgress: 0,
          },
          {
            id: 'test-tojnan-4',
            latitude: 59.4215182,
            longitude: 17.9334567,
            title: "Test: Sveavägen Bus Stop",
            description: "Test station for claim testing",
            operator: "Recharge",
            isDiscovered: false,
            isDiscoverable: false,
            isUnlocking: false,
            unlockProgress: 0,
          },
          {
            id: 'test-tojnan-5',
            latitude: 59.4297178,
            longitude: 17.9225934,
            title: "Test: Töjnan Running Trail",
            description: "Test station for claim testing",
            operator: "Recharge",
            isDiscovered: false,
            isDiscoverable: false,
            isUnlocking: false,
            unlockProgress: 0,
          }
        ];
        
        const { chargingStations } = get();
        
        // Remove any existing test stations first
        const filteredStations = chargingStations.filter(s => !s.id.startsWith('test-tojnan-'));
        
        // Add new test stations
        const updatedStations = [...filteredStations, ...testStations];
        
        console.log(`🧪 Added ${testStations.length} Töjnan test stations`);
        console.log('📍 Test stations locations:', testStations.map(s => `${s.title}: ${s.latitude}, ${s.longitude}`));
        
        set({ chargingStations: updatedStations });
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
            // Phase 2 & 3: Use enhanced odds for weekly treasure spawning with loyalty weeks
            const { currentLocation, chargingStations, getClaimedStationLoyaltyWeeks } = get();
            const loyaltyWeeks = getClaimedStationLoyaltyWeeks(stationId);
            const treasure = spawnTreasureForStation(
              stationId, 
              currentLevel, 
              false,
              currentLocation || undefined,
              chargingStations,
              loyaltyWeeks
            );
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
        
        // Phase 2 & 3: Use enhanced odds with current location, stations data, and loyalty weeks
        const { currentLocation, chargingStations, getClaimedStationLoyaltyWeeks } = get();
        const loyaltyWeeks = getClaimedStationLoyaltyWeeks(stationId);
        const treasure = spawnTreasureForStation(
          stationId, 
          currentLevel, 
          isDiscoveryBonus,
          currentLocation || undefined,
          chargingStations,
          loyaltyWeeks
        );
        
        set({ 
          treasures: [...treasures, treasure]
        });
        
        console.log(`🎁 Spawned ${getRarityDisplayName(treasure.rarity)} treasure for station ${stationId}${isDiscoveryBonus ? ' (Discovery Bonus!)' : ''}`);
        try {
          // Dynamic import to avoid any potential cycles
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { trackEvent } = require('../services/analytics');
          trackEvent('treasure_spawned', {
            station_id: stationId,
            rarity: treasure.rarity,
            discovery_bonus: !!isDiscoveryBonus,
          });
        } catch {}
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
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { trackEvent } = require('../services/analytics');
          trackEvent('treasure_collected', {
            treasure_id: treasureId,
            station_id: treasure.stationId,
            rarity: treasure.rarity,
            xp: xpBonus,
          });
        } catch {}
        
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
        
        // Spawn new treasures for all discovered stations with Phase 2 & 3 enhanced odds and loyalty
        const newTreasures: Treasure[] = [];
        const { currentLocation, chargingStations, getClaimedStationLoyaltyWeeks } = get();
        
        for (const stationId of discoveredStations) {
          const loyaltyWeeks = getClaimedStationLoyaltyWeeks(stationId);
          const treasure = spawnTreasureForStation(
            stationId, 
            currentLevel, 
            false,
            currentLocation || undefined,
            chargingStations,
            loyaltyWeeks
          );
          newTreasures.push(treasure);
        }
        
        set({ 
          treasures: newTreasures, // Replace all treasures
          currentWeekId: newWeekId,
          lastTreasureRefresh: new Date()
        });
        
        console.log(`✨ Weekly reset complete: ${newTreasures.length} new treasures spawned`);
      },

      // Phase 3: Station Expiry System Action Implementations
      claimStationWithExpiry: async (stationId: string): Promise<ClaimedStation | null> => {
        const { currentLocation, currentUser } = get();
        if (!currentLocation || !currentUser) {
          console.error('❌ Cannot claim station - no location or user');
          return null;
        }

        // Check if station is already claimed by this user
        const existingClaim = get().claimedStations.find(
          cs => cs.stationId === stationId && cs.userId === currentUser.id
        );

        if (existingClaim && new Date() < existingClaim.expiresAt) {
          console.log(`⚠️ Station ${stationId} already claimed until ${existingClaim.expiresAt.toLocaleDateString()}`);
          return existingClaim;
        }

        const now = new Date();
        const claimedStation: ClaimedStation = {
          id: `claimed_${stationId}_${currentUser.id}_${now.getTime()}`,
          userId: currentUser.id,
          stationId,
          claimedAt: now,
          lastVisited: now,
          expiresAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days
          renewalCount: 0,
          loyaltyWeeks: 1,
          createdAt: now,
          updatedAt: now
        };

        // Add to local state
        const { claimedStations } = get();
        const updatedClaimedStations = claimedStations.filter(
          cs => !(cs.stationId === stationId && cs.userId === currentUser.id)
        );
        updatedClaimedStations.push(claimedStation);

        set({ claimedStations: updatedClaimedStations });

        console.log(`🏠 Station claimed with expiry: ${stationId} expires ${claimedStation.expiresAt.toLocaleDateString()}`);

        // Phase 4: Sync to Supabase cloud if authenticated
        if (get().isAuthenticated) {
          console.log('🔄 Syncing newly claimed station to cloud...');
          const { syncClaimedStationToCloud } = get();
          const syncSuccess = await syncClaimedStationToCloud(claimedStation);
          
          if (syncSuccess) {
            console.log('✅ Claimed station synced to cloud successfully');
          } else {
            console.warn('⚠️ Failed to sync claimed station to cloud (continuing with local)');
          }
        }

        return claimedStation;
      },

      renewStationClaim: async (stationId: string): Promise<boolean> => {
        const { claimedStations, currentUser, currentLocation } = get();
        if (!currentUser || !currentLocation) return false;

        const claimedStation = claimedStations.find(
          cs => cs.stationId === stationId && cs.userId === currentUser.id
        );

        if (!claimedStation) {
          console.log(`❌ Cannot renew - station ${stationId} not claimed by user`);
          return false;
        }

        const now = new Date();
        const sevenDaysFromExpiry = new Date(claimedStation.expiresAt.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneDayAfterExpiry = new Date(claimedStation.expiresAt.getTime() + 24 * 60 * 60 * 1000);

        // Check if within renewal window (7 days before to 1 day after expiry)
        if (now < sevenDaysFromExpiry || now > oneDayAfterExpiry) {
          console.log(`❌ Cannot renew - outside renewal window`);
          return false;
        }

        // Update claimed station with renewal
        const renewedStation: ClaimedStation = {
          ...claimedStation,
          lastVisited: now,
          expiresAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // New 90-day period
          renewalCount: claimedStation.renewalCount + 1,
          loyaltyWeeks: Math.floor((now.getTime() - claimedStation.claimedAt.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1,
          updatedAt: now
        };

        // Update in local state
        const updatedClaimedStations = claimedStations.map(cs =>
          cs.id === claimedStation.id ? renewedStation : cs
        );

        set({ claimedStations: updatedClaimedStations });

        console.log(`🔄 Station renewed: ${stationId} - new expiry ${renewedStation.expiresAt.toLocaleDateString()}`);
        console.log(`🏆 Loyalty bonus: ${renewedStation.loyaltyWeeks} weeks (${renewedStation.renewalCount + 1} renewals)`);

        // Phase 4: Sync renewal to cloud if authenticated
        if (get().isAuthenticated) {
          console.log('🔄 Syncing station renewal to cloud...');
          const { syncClaimedStationToCloud } = get();
          const syncSuccess = await syncClaimedStationToCloud(renewedStation);
          
          if (syncSuccess) {
            console.log('✅ Station renewal synced to cloud successfully');
          } else {
            console.warn('⚠️ Failed to sync station renewal to cloud (continuing with local)');
          }
        }

        return true;
      },

      getStationExpiryStatus: (stationId: string): StationExpiryStatus | null => {
        const { claimedStations, currentUser } = get();
        if (!currentUser) return null;

        const claimedStation = claimedStations.find(
          cs => cs.stationId === stationId && cs.userId === currentUser.id
        );

        if (!claimedStation) return null;

        const now = new Date();
        const timeUntilExpiry = claimedStation.expiresAt.getTime() - now.getTime();
        const daysUntilExpiry = Math.ceil(timeUntilExpiry / (24 * 60 * 60 * 1000));
        const isExpired = timeUntilExpiry <= 0;
        const isExpiring = daysUntilExpiry <= 7 && daysUntilExpiry > 0;
        
        // Can renew if within 7 days of expiry or up to 1 day after
        const canRenew = daysUntilExpiry <= 7 && daysUntilExpiry >= -1;

        return {
          stationId,
          isExpired,
          isExpiring,
          daysUntilExpiry: Math.max(0, daysUntilExpiry),
          canRenew
        };
      },

      checkExpiredStations: (): ClaimedStation[] => {
        const { claimedStations } = get();
        const now = new Date();

        return claimedStations.filter(cs => now > cs.expiresAt);
      },

      cleanupExpiredStations: async (): Promise<void> => {
        const { claimedStations } = get();
        const now = new Date();
        const gracePeriod = 24 * 60 * 60 * 1000; // 24 hours after expiry

        const activeStations = claimedStations.filter(cs => {
          const graceExpiry = new Date(cs.expiresAt.getTime() + gracePeriod);
          return now <= graceExpiry;
        });

        const expiredCount = claimedStations.length - activeStations.length;
        
        if (expiredCount > 0) {
          set({ 
            claimedStations: activeStations,
            lastExpiryCheck: now
          });
          console.log(`🧹 Cleaned up ${expiredCount} expired station claims`);
        }
      },

      isStationClaimedByUser: (stationId: string): boolean => {
        const { claimedStations, currentUser } = get();
        if (!currentUser) return false;

        const claimedStation = claimedStations.find(
          cs => cs.stationId === stationId && cs.userId === currentUser.id
        );

        return claimedStation ? new Date() <= claimedStation.expiresAt : false;
      },

      getClaimedStationLoyaltyWeeks: (stationId: string): number => {
        const { claimedStations, currentUser } = get();
        if (!currentUser) return 0;

        const claimedStation = claimedStations.find(
          cs => cs.stationId === stationId && cs.userId === currentUser.id
        );

        return claimedStation?.loyaltyWeeks || 0;
      },

      // Phase 4: Supabase Cloud Sync Action Implementations
      syncClaimedStationToCloud: async (station: ClaimedStation): Promise<boolean> => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) {
          console.log('⚠️ Cannot sync to cloud - user not authenticated');
          return false;
        }

        try {
          console.log(`🔄 Syncing station ${station.stationId} to cloud...`);
          
          const stationData = {
            user_id: station.userId,
            station_id: station.stationId,
            claimed_at: station.claimedAt.toISOString(),
            last_visited: station.lastVisited.toISOString(),
            expires_at: station.expiresAt.toISOString(),
            renewal_count: station.renewalCount,
            loyalty_weeks: station.loyaltyWeeks,
            updated_at: station.updatedAt.toISOString()
          };

          // Use upsert to handle both insert and update cases
          const { error } = await supabase
            .from('claimed_stations')
            .upsert(stationData, {
              onConflict: 'user_id,station_id'
            });

          if (error) {
            console.error('❌ Failed to sync station to cloud:', error);
            return false;
          }

          console.log(`✅ Station ${station.stationId} synced to cloud successfully`);
          return true;

        } catch (error) {
          console.error('❌ Cloud sync error:', error);
          return false;
        }
      },

      syncClaimedStationsFromCloud: async (): Promise<ClaimedStation[]> => {
        const { currentUser } = get();
        if (!currentUser) {
          console.log('⚠️ Cannot sync from cloud - no user');
          return [];
        }

        try {
          console.log('🔄 Syncing claimed stations from cloud...');
          
          const { data, error } = await supabase
            .from('claimed_stations')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('claimed_at', { ascending: false });

          if (error) {
            console.error('❌ Failed to fetch stations from cloud:', error);
            return [];
          }

          if (!data || data.length === 0) {
            console.log('📭 No claimed stations found in cloud');
            return [];
          }

          // Transform cloud data back to ClaimedStation objects
          const claimedStations: ClaimedStation[] = data.map(station => ({
            id: station.id,
            userId: station.user_id,
            stationId: station.station_id,
            claimedAt: new Date(station.claimed_at),
            lastVisited: new Date(station.last_visited),
            expiresAt: new Date(station.expires_at),
            renewalCount: station.renewal_count,
            loyaltyWeeks: station.loyalty_weeks,
            createdAt: new Date(station.created_at),
            updatedAt: new Date(station.updated_at)
          }));

          console.log(`✅ Fetched ${claimedStations.length} claimed stations from cloud`);
          return claimedStations;

        } catch (error) {
          console.error('❌ Cloud sync error:', error);
          return [];
        }
      },

      handleStationConflicts: (local: ClaimedStation[], cloud: ClaimedStation[]): ClaimedStation[] => {
        console.log('🔄 Resolving claimed station conflicts...');
        const resolvedStations: ClaimedStation[] = [];
        
        // Create maps for efficient lookup
        const localMap = new Map<string, ClaimedStation>();
        const cloudMap = new Map<string, ClaimedStation>();
        
        local.forEach(station => localMap.set(station.stationId, station));
        cloud.forEach(station => cloudMap.set(station.stationId, station));
        
        // Get all unique station IDs from both local and cloud
        const allStationIds = new Set([...localMap.keys(), ...cloudMap.keys()]);
        
        for (const stationId of allStationIds) {
          const localStation = localMap.get(stationId);
          const cloudStation = cloudMap.get(stationId);
          
          if (localStation && cloudStation) {
            // Conflict resolution logic
            const now = new Date();
            
            // Rule 1: Server wins for expired stations (cloud expiry is authoritative)
            if (now > cloudStation.expiresAt) {
              console.log(`⏰ Station ${stationId} expired in cloud - using cloud version`);
              resolvedStations.push(cloudStation);
            }
            // Rule 2: Latest timestamp wins for renewals and updates
            else if (cloudStation.updatedAt > localStation.updatedAt) {
              console.log(`🕒 Station ${stationId} newer in cloud - using cloud version`);
              resolvedStations.push(cloudStation);
            } else {
              console.log(`🕒 Station ${stationId} newer locally - using local version`);
              resolvedStations.push(localStation);
            }
          } else if (localStation) {
            // Only exists locally - keep local version
            console.log(`📱 Station ${stationId} only exists locally - keeping local`);
            resolvedStations.push(localStation);
          } else if (cloudStation) {
            // Only exists in cloud - use cloud version
            console.log(`☁️ Station ${stationId} only exists in cloud - using cloud`);
            resolvedStations.push(cloudStation);
          }
        }
        
        console.log(`✅ Resolved ${resolvedStations.length} claimed stations`);
        return resolvedStations;
      },

      migrateLocalStationsToCloud: async (): Promise<boolean> => {
        const { claimedStations, syncClaimedStationToCloud, isAuthenticated } = get();
        
        if (!isAuthenticated) {
          console.log('⚠️ Cannot migrate to cloud - user not authenticated');
          return false;
        }
        
        if (claimedStations.length === 0) {
          console.log('📭 No local claimed stations to migrate');
          return true;
        }

        console.log(`🔄 Starting migration of ${claimedStations.length} local stations to cloud...`);
        
        let successCount = 0;
        let failureCount = 0;
        
        for (const station of claimedStations) {
          const success = await syncClaimedStationToCloud(station);
          if (success) {
            successCount++;
          } else {
            failureCount++;
          }
          
          // Small delay to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        const migrationSuccess = failureCount === 0;
        
        if (migrationSuccess) {
          console.log(`✅ Migration completed successfully: ${successCount} stations uploaded`);
          set({ lastCloudSync: new Date() });
        } else {
          console.warn(`⚠️ Migration completed with errors: ${successCount} succeeded, ${failureCount} failed`);
        }
        
        return migrationSuccess;
      },

      subscribeToClaimedStationsUpdates: async (): Promise<void> => {
        const { currentUser } = get();
        if (!currentUser) {
          console.log('⚠️ Cannot subscribe to updates - no user');
          return;
        }

        // Unsubscribe from any existing subscription first
        get().unsubscribeFromClaimedStationsUpdates();

        console.log('🔔 Setting up real-time subscription for claimed stations...');
        
        try {
          const subscription = supabase
            .channel('claimed-stations-changes')
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'claimed_stations',
                filter: `user_id=eq.${currentUser.id}`
              },
              (payload) => {
                console.log('🔔 Real-time claimed station update received:', payload);
                
                // Handle the update based on event type
                switch (payload.eventType) {
                  case 'INSERT':
                  case 'UPDATE':
                    get().handleRealTimeStationUpdate(payload.new);
                    break;
                  case 'DELETE':
                    get().handleRealTimeStationDelete(payload.old.station_id);
                    break;
                }
              }
            )
            .subscribe();

          set({ claimedStationsSubscription: subscription });
          console.log('✅ Real-time subscription established');

        } catch (error) {
          console.error('❌ Failed to set up real-time subscription:', error);
        }
      },

      unsubscribeFromClaimedStationsUpdates: () => {
        const { claimedStationsSubscription } = get();
        
        if (claimedStationsSubscription) {
          console.log('🔔 Unsubscribing from claimed stations updates...');
          supabase.removeChannel(claimedStationsSubscription);
          set({ claimedStationsSubscription: null });
          console.log('✅ Unsubscribed from real-time updates');
        }
      },

      // Helper functions for real-time updates (not in interface but needed for subscription)
      handleRealTimeStationUpdate: (stationData: any) => {
        const { claimedStations } = get();
        
        const updatedStation: ClaimedStation = {
          id: stationData.id,
          userId: stationData.user_id,
          stationId: stationData.station_id,
          claimedAt: new Date(stationData.claimed_at),
          lastVisited: new Date(stationData.last_visited),
          expiresAt: new Date(stationData.expires_at),
          renewalCount: stationData.renewal_count,
          loyaltyWeeks: stationData.loyalty_weeks,
          createdAt: new Date(stationData.created_at),
          updatedAt: new Date(stationData.updated_at)
        };

        // Update or add the station in local state
        const updatedStations = claimedStations.filter(cs => cs.stationId !== updatedStation.stationId);
        updatedStations.push(updatedStation);
        
        set({ claimedStations: updatedStations });
        console.log(`🔔 Local state updated for station: ${updatedStation.stationId}`);
      },

      handleRealTimeStationDelete: (stationId: string) => {
        const { claimedStations } = get();
        
        const updatedStations = claimedStations.filter(cs => cs.stationId !== stationId);
        set({ claimedStations: updatedStations });
        console.log(`🔔 Station deleted from local state: ${stationId}`);
      },

      initializeCloudSync: async (): Promise<void> => {
        const { isAuthenticated, claimedStations } = get();
        
        if (!isAuthenticated) {
          console.log('⚠️ Cannot initialize cloud sync - user not authenticated');
          return;
        }

        try {
          console.log('☁️ Starting cloud sync initialization...');
          
          // Step 1: Fetch claimed stations from cloud
          const { syncClaimedStationsFromCloud } = get();
          const cloudStations = await syncClaimedStationsFromCloud();
          
          // Step 2: Resolve conflicts between local and cloud data
          const { handleStationConflicts } = get();
          const resolvedStations = handleStationConflicts(claimedStations, cloudStations);
          
          // Step 3: Update local state with resolved data
          set({ 
            claimedStations: resolvedStations,
            lastCloudSync: new Date()
          });
          
          // Step 4: Upload any local-only stations to cloud
          const localOnlyStations = resolvedStations.filter(station => 
            !cloudStations.some(cloudStation => cloudStation.stationId === station.stationId)
          );
          
          if (localOnlyStations.length > 0) {
            console.log(`🔄 Uploading ${localOnlyStations.length} local-only stations to cloud...`);
            const { syncClaimedStationToCloud } = get();
            
            for (const station of localOnlyStations) {
              await syncClaimedStationToCloud(station);
              // Small delay to avoid overwhelming the server
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
          
          // Step 5: Set up real-time subscription for future updates
          const { subscribeToClaimedStationsUpdates } = get();
          await subscribeToClaimedStationsUpdates();
          
          console.log('✅ Cloud sync initialization completed successfully');
          console.log(`🏠 Managing ${resolvedStations.length} claimed stations with cloud sync enabled`);
          
        } catch (error) {
          console.error('❌ Failed to initialize cloud sync:', error);
          // Don't fail completely - continue with local-only mode
          console.log('📱 Continuing in local-only mode');
        }
      },

      cleanupCloudSync: () => {
        console.log('🧹 Cleaning up cloud sync...');
        
        // Unsubscribe from real-time updates
        get().unsubscribeFromClaimedStationsUpdates();
        
        // Reset cloud sync state
        set({
          claimedStationsSubscription: null,
          lastCloudSync: null
        });
        
        console.log('✅ Cloud sync cleanup completed');
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
      // Only persist user progress, treasures, tools, settings, and station cache, not live location/permission state
      partialize: (state) => ({
        discoveredStations: state.discoveredStations,
        totalDiscovered: state.totalDiscovered,
        chargingStations: state.chargingStations,
        stationsLastLoaded: state.stationsLastLoaded,
        stationsLastLocation: state.stationsLastLocation,
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
        if (state) {
          // Fix station data integrity
          if (!state.chargingStations || !Array.isArray(state.chargingStations)) {
            state.chargingStations = MOCK_STATIONS;
          }
          
          // Convert date strings back to Date objects (JSON serialization converts dates to strings)
          if (state.stationsLastLoaded && typeof state.stationsLastLoaded === 'string') {
            state.stationsLastLoaded = new Date(state.stationsLastLoaded);
            console.log('📋 Restored station cache timestamp from storage');
          }
          
          // Handle other date fields that might be persisted
          if (state.lastTreasureRefresh && typeof state.lastTreasureRefresh === 'string') {
            state.lastTreasureRefresh = new Date(state.lastTreasureRefresh);
          }
          
          if (state.lastExpiryCheck && typeof state.lastExpiryCheck === 'string') {
            state.lastExpiryCheck = new Date(state.lastExpiryCheck);
          }
          
          if (state.lastCloudSync && typeof state.lastCloudSync === 'string') {
            state.lastCloudSync = new Date(state.lastCloudSync);
          }
          
          // Convert date strings in claimedStations back to Date objects
          if (state.claimedStations && Array.isArray(state.claimedStations)) {
            state.claimedStations = state.claimedStations.map((station: any) => ({
              ...station,
              claimedAt: station.claimedAt && typeof station.claimedAt === 'string' 
                ? new Date(station.claimedAt) : station.claimedAt,
              expiresAt: station.expiresAt && typeof station.expiresAt === 'string' 
                ? new Date(station.expiresAt) : station.expiresAt,
              updatedAt: station.updatedAt && typeof station.updatedAt === 'string' 
                ? new Date(station.updatedAt) : station.updatedAt,
            }));
          }
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