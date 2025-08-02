import { ChargingStation } from '../types/ChargingStation';

// Configuration
const NOBIL_CONFIG = {
  BASE_URL: 'https://nobil.no/api/server/search.php',
  COUNTRY: 'SE',
  MUNICIPALITY: 'Stockholm',
  FORMAT: 'json',
  API_KEY: process.env.EXPO_PUBLIC_NOBIL_API_KEY || null, // Will be set when we get the key
  USE_MOCK_DATA: false, // API key is ready! Switch to live data
  REQUEST_TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

// Types matching Nobil API v3 response structure (from documentation)
interface NobilStation {
  csmd: {
    id: number;
    name: string;
    Position: string; // Format: "(59.87447,10.49982)"
    Street?: string;
    House_number?: string;
    City?: string;
    Municipality?: string;
    County?: string;
    Description_of_location?: string;
    Owned_by?: string;
    Number_charging_points?: number;
    Available_charging_points?: number;
    Created?: string;
    Updated?: string;
    Station_status?: number;
    Land_code?: string;
    International_id?: string;
  };
  attr?: any; // Complex attribute structure from docs
}

interface NobilApiResponse {
  chargerstations: NobilStation[];
  total?: number;
  status?: string;
}

// Cache for API responses
let cachedData: ChargingStation[] | null = null;
let cacheTimestamp: number = 0;

// Mock Stockholm charging stations in Nobil v3 format (realistic Stockholm locations)
const MOCK_NOBIL_STATIONS: NobilStation[] = [
  // Original Töjnan area (keeping our test locations for development)
  { csmd: { id: 22, name: 'Hjortvägen/Fjällvägen', Position: '(59.4245940,17.9357635)', Street: 'Hjortvägen', City: 'Sollentuna', Owned_by: 'Recharge' } },
  { csmd: { id: 23, name: 'Villavägen Station', Position: '(59.4260085,17.9312432)', Street: 'Villavägen', City: 'Sollentuna', Owned_by: 'Recharge' } },
  { csmd: { id: 24, name: 'Töjnaskolan Park', Position: '(59.4249233,17.9292865)', Street: 'Töjnaskolan', City: 'Sollentuna', Owned_by: 'Recharge' } },
  { csmd: { id: 25, name: 'Sveavägen Bus', Position: '(59.4215182,17.9334567)', Street: 'Sveavägen', City: 'Sollentuna', Owned_by: 'Recharge' } },
  { csmd: { id: 26, name: 'St1 Gas Station', Position: '(59.4185613,17.9386471)', Street: 'St1 Station', City: 'Sollentuna', Owned_by: 'Recharge' } },
];

// Transform Nobil station to our ChargingStation format
const transformNobilStation = (nobilStation: NobilStation, index: number): ChargingStation | null => {
  console.log(`🔄 Transforming station ${index}:`, nobilStation);
  
  if (!nobilStation || !nobilStation.csmd) {
    console.log(`⚠️ Invalid station structure at index ${index}:`, nobilStation);
    return null;
  }
  
  if (!nobilStation.csmd.Position) {
    console.log(`⚠️ Missing position for station at index ${index}:`, nobilStation.csmd);
    return null;
  }
  
  // Parse position string "(59.87447,10.49982)" to lat/lng
  const positionMatch = nobilStation.csmd.Position.match(/\(([^,]+),([^)]+)\)/);
  const latitude = positionMatch ? parseFloat(positionMatch[1]) : 0;
  const longitude = positionMatch ? parseFloat(positionMatch[2]) : 0;
  
  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
    console.log(`⚠️ Invalid coordinates for station at index ${index}: lat=${latitude}, lng=${longitude}`);
    return null;
  }
  
  const station = {
    id: `SE_${nobilStation.csmd.id}`, // Prefix with country code
    latitude,
    longitude,
    title: nobilStation.csmd.name || `Station ${nobilStation.csmd.id}`,
    description: nobilStation.csmd.Description_of_location || 
                `${nobilStation.csmd.Street || ''} ${nobilStation.csmd.House_number || ''}, ${nobilStation.csmd.City || 'Stockholm'}`.trim(),
    operator: nobilStation.csmd.Owned_by || 'Unknown',
    isDiscovered: false,
    isDiscoverable: false,
    isUnlocking: false,
    unlockProgress: 0,
  };
  
  console.log(`✅ Transformed station ${index}:`, station);
  return station;
};

// Simulate network delay for realistic testing
const simulateNetworkDelay = (ms: number = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Mock API call that matches real Nobil API structure
const fetchMockStations = async (): Promise<NobilApiResponse> => {
  await simulateNetworkDelay(800); // Realistic API delay
  
  // Simulate occasional API failures for testing error handling
  if (Math.random() < 0.05) { // 5% failure rate
    throw new Error('Network timeout - please check your connection');
  }
  
  console.log('🧪 Returning mock Nobil stations:', MOCK_NOBIL_STATIONS.length);
  
  return {
    chargerstations: MOCK_NOBIL_STATIONS,
    total: MOCK_NOBIL_STATIONS.length,
    status: 'success'
  };
};

// Real API call following Nobil API v3 documentation
const fetchRealStations = async (): Promise<NobilApiResponse> => {
  if (!NOBIL_CONFIG.API_KEY) {
    throw new Error('Nobil API key not configured');
  }

  // Stockholm bounding box coordinates (rectangle search as per Nobil docs)
  const params = new URLSearchParams({
    apiversion: '3',
    action: 'search', 
    type: 'rectangle',
    northeast: '(59.4500, 18.2000)', // North-East corner of Stockholm area
    southwest: '(59.2500, 17.8000)', // South-West corner of Stockholm area
    format: NOBIL_CONFIG.FORMAT,
    apikey: NOBIL_CONFIG.API_KEY,
    limit: '50' // Get up to 50 stations
  });

  const url = `${NOBIL_CONFIG.BASE_URL}?${params.toString()}`;
  console.log('📡 Nobil API URL:', url);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), NOBIL_CONFIG.REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ChargeQuest/1.0 (EV Charging Discovery Game)',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🚨 Nobil API Response Error:', {
        status: response.status,
        statusText: response.statusText,
        url: url,
        responseBody: errorText
      });
      throw new Error(`Nobil API error: ${response.status} ${response.statusText}`);
    }

    const jsonResponse = await response.json();
    console.log('🎯 Nobil API Success Response:', jsonResponse);
    return jsonResponse;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Retry wrapper for network resilience
const withRetry = async <T>(operation: () => Promise<T>, attempts: number = NOBIL_CONFIG.RETRY_ATTEMPTS): Promise<T> => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await operation();
    } catch (error) {
      console.log(`Attempt ${i + 1} failed:`, error);
      
      if (i === attempts - 1) {
        throw error; // Last attempt failed
      }
      
      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, i), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('All retry attempts failed');
};

// Check if cached data is still valid
const isCacheValid = (): boolean => {
  return cachedData !== null && (Date.now() - cacheTimestamp) < NOBIL_CONFIG.CACHE_DURATION;
};

// Main API service
// Distance calculation utility
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};

// Filter and sort stations by distance from user location
const filterAndSortByLocation = (
  stations: ChargingStation[], 
  userLocation?: { latitude: number; longitude: number }, 
  limit: number = 10
): ChargingStation[] => {
  console.log('📍 filterAndSortByLocation called with:', { 
    stationsCount: stations.length, 
    userLocation, 
    limit 
  });
  
  if (!userLocation) {
    console.log('📍 No user location provided, returning first', limit, 'stations');
    return stations.slice(0, limit);
  }

  console.log('📍 Filtering stations by distance from user location:', userLocation);
  
  // Validate stations before processing
  const validStations = stations.filter(station => 
    station && 
    typeof station.latitude === 'number' && 
    typeof station.longitude === 'number' &&
    !isNaN(station.latitude) && 
    !isNaN(station.longitude)
  );
  
  console.log('📍 Valid stations for distance calculation:', validStations.length);
  
  if (!validStations.length) {
    console.log('⚠️ No valid stations found for distance calculation');
    return [];
  }
  
  // Calculate distances and sort by nearest
  const stationsWithDistance = validStations.map(station => ({
    ...station,
    distance: calculateDistance(userLocation.latitude, userLocation.longitude, station.latitude, station.longitude)
  })).sort((a, b) => a.distance - b.distance);

  const nearestStations = stationsWithDistance.slice(0, limit);
  
  console.log(`🎯 Found ${nearestStations.length} nearest stations (${nearestStations[0]?.distance.toFixed(2)}km - ${nearestStations[nearestStations.length-1]?.distance.toFixed(2)}km)`);
  
  return nearestStations;
};

export const nobilApi = {
  // Fetch charging stations near user location
  async getStockholmStations(userLocation?: { latitude: number; longitude: number }, limit: number = 10): Promise<ChargingStation[]> {
    console.log('🔌 Fetching Stockholm charging stations...');
    
    // Return cached data if valid (but filter by location if needed)
    if (isCacheValid() && cachedData) {
      console.log('✅ Using cached charging station data');
      return filterAndSortByLocation(cachedData, userLocation, limit);
    }

    try {
      let apiResponse: NobilApiResponse;
      
      if (NOBIL_CONFIG.USE_MOCK_DATA) {
        console.log('🧪 USING MOCK DATA - API key pending or disabled');
        apiResponse = await fetchMockStations();
      } else {
        console.log('🌐 FETCHING LIVE NOBIL DATA - API key configured');
        console.log('🔑 API Key present:', !!NOBIL_CONFIG.API_KEY);
        apiResponse = await withRetry(() => fetchRealStations());
      }

      // Transform to our format and filter out any invalid stations
      const transformedStations = apiResponse.chargerstations.map(transformNobilStation).filter((station): station is ChargingStation => station !== null);
      
      console.log(`🔄 Transformed ${apiResponse.chargerstations.length} raw stations into ${transformedStations.length} valid stations`);
      
      // Cache all results
      cachedData = transformedStations;
      cacheTimestamp = Date.now();
      
      // Filter and sort by location
      const nearestStations = filterAndSortByLocation(transformedStations, userLocation, limit);
      
      console.log(`✅ Successfully loaded ${transformedStations.length} stations, returning ${nearestStations.length} nearest`);
      return nearestStations;
      
    } catch (error) {
      console.error('❌ Failed to fetch charging stations:', error);
      
      // Return cached data as fallback if available
      if (cachedData) {
        console.log('⚠️ Using cached data as fallback');
        return filterAndSortByLocation(cachedData, userLocation, limit);
      }
      
      throw new Error(`Failed to load charging stations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Clear cache (useful for testing)
  clearCache(): void {
    cachedData = null;
    cacheTimestamp = 0;
    console.log('🗑️ Nobil API cache cleared');
  },

  // Get API status
  getStatus(): { 
    usingMockData: boolean; 
    hasApiKey: boolean; 
    cacheValid: boolean; 
    cachedStationCount: number;
  } {
    return {
      usingMockData: NOBIL_CONFIG.USE_MOCK_DATA,
      hasApiKey: !!NOBIL_CONFIG.API_KEY,
      cacheValid: isCacheValid(),
      cachedStationCount: cachedData?.length || 0,
    };
  },

  // Switch to live data when API key is ready
  enableLiveData(apiKey: string): void {
    NOBIL_CONFIG.API_KEY = apiKey;
    NOBIL_CONFIG.USE_MOCK_DATA = false;
    this.clearCache(); // Force refresh with real data
    console.log('🚀 Nobil API enabled with live data');
  },

  // Force clear cache for testing
  forceClearCache(): void {
    this.clearCache();
    console.log('🗑️ Cache forcefully cleared for fresh API call');
  },
}; 