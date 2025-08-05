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
    // Real Nobil API status data
    stationStatus: nobilStation.csmd.Station_status,
    totalChargingPoints: nobilStation.csmd.Number_charging_points,
    availableChargingPoints: nobilStation.csmd.Available_charging_points,
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

// Real API call with pagination support
const fetchRealStations = async (
  userLocation?: { latitude: number; longitude: number },
  offset: number = 0,
  limit: number = 500
): Promise<NobilApiResponse> => {
  if (!NOBIL_CONFIG.API_KEY) {
    throw new Error('Nobil API key not configured');
  }

  // Create bounding box based on user location if available, otherwise use Stockholm default
  let northeast: string;
  let southwest: string;
  
  if (userLocation) {
    // Create ~50km radius around user location for COMPREHENSIVE coverage
    const radius = 0.45; // ~45-50km in degrees (much larger for multi-center approach)
    const lat = userLocation.latitude;
    const lng = userLocation.longitude;
    
    northeast = `(${(lat + radius).toFixed(6)}, ${(lng + radius).toFixed(6)})`;
    southwest = `(${(lat - radius).toFixed(6)}, ${(lng - radius).toFixed(6)})`;
    
    console.log(`📍 Using LARGE dynamic bounding box around location:`, {
      userLat: lat,
      userLng: lng,
      northeast,
      southwest,
      radiusKm: '~50km (EXPANDED for better coverage)'
    });
  } else {
    // Fallback to Stockholm area  
    northeast = '(59.5500, 18.3000)'; // Expanded Stockholm area
    southwest = '(59.2000, 17.7000)'; // Expanded Stockholm area
    console.log('📍 Using expanded Stockholm fallback bounding box');
  }

  const params = new URLSearchParams({
    apiversion: '3',
    action: 'search', 
    type: 'rectangle',
    northeast,
    southwest,
    format: NOBIL_CONFIG.FORMAT,
    apikey: NOBIL_CONFIG.API_KEY,
    limit: limit.toString(),
    offset: offset.toString() // Add pagination support
  });

  console.log(`📡 Nobil API request: offset=${offset}, limit=${limit}`);
  console.log(`📦 Bounding box being used: NE=${northeast}, SW=${southwest}`);

  const url = `${NOBIL_CONFIG.BASE_URL}?${params.toString()}`;
  console.log('📡 FULL Nobil API URL:', url);
  
  // Extract just the key parts for easier reading
  console.log('📍 API LOCATION PARAMS:', {
    northeast,
    southwest,
    limit,
    offset,
    userLocation: userLocation ? `${userLocation.latitude}, ${userLocation.longitude}` : 'none'
  });
  
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
    
    // DEBUG: Detailed API response analysis
    console.log(`📊 DETAILED API RESPONSE:`, {
      totalStations: jsonResponse.chargerstations?.length || 0,
      hasChargerstations: !!jsonResponse.chargerstations,
      responseKeys: Object.keys(jsonResponse),
      requestedLocation: userLocation ? `${userLocation.latitude}, ${userLocation.longitude}` : 'none'
    });
    
    // DEBUG: Show station distribution by ID ranges to detect if we're getting same data
    if (jsonResponse.chargerstations && jsonResponse.chargerstations.length > 0) {
      const stationIds = jsonResponse.chargerstations.map((station: any) => parseInt(station.csmd?.id)).filter((id: number) => !isNaN(id));
      const minId = Math.min(...stationIds);
      const maxId = Math.max(...stationIds);
      
      console.log(`📈 Station ID range: ${minId} to ${maxId} (${stationIds.length} stations)`);
      
      // Show first and last few for fingerprinting this response
      const firstFew = jsonResponse.chargerstations.slice(0, 3).map((station: any) => ({
        id: station.csmd?.id,
        name: station.csmd?.name?.substring(0, 20) + '...',
        pos: station.csmd?.Position?.substring(0, 20) + '...'
      }));
      console.log(`📋 First 3 stations:`, firstFew);
      
      const lastFew = jsonResponse.chargerstations.slice(-3).map((station: any) => ({
        id: station.csmd?.id,
        name: station.csmd?.name?.substring(0, 20) + '...',
        pos: station.csmd?.Position?.substring(0, 20) + '...'
      }));
      console.log(`📋 Last 3 stations:`, lastFew);
    }
    
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
  limit: number = 10,
  includeOperators?: string[]
): ChargingStation[] => {
  console.log('📍 filterAndSortByLocation called with:', { 
    stationsCount: stations.length, 
    userLocation, 
    limit 
  });
  
  console.log('📍 Sample stations for debugging:', stations.slice(0, 2).map(s => ({
    id: s.id, 
    title: s.title, 
    lat: s.latitude, 
    lng: s.longitude
  })));
  
  if (!userLocation) {
    console.log('📍 No user location provided, returning first', limit, 'stations');
    return stations.slice(0, limit);
  }

  console.log('📍 Filtering stations by distance from user location:', userLocation);
  
  // Validate stations before processing
  let validStations = stations.filter(station => 
    station && 
    typeof station.latitude === 'number' && 
    typeof station.longitude === 'number' &&
    !isNaN(station.latitude) && 
    !isNaN(station.longitude)
  );
  
  // Filter to only include specific operators if specified
  if (includeOperators && includeOperators.length > 0) {
    const beforeCount = validStations.length;
    validStations = validStations.filter(station => 
      includeOperators.some(includedOp => 
        station.operator.toLowerCase().includes(includedOp.toLowerCase())
      )
    );
    console.log(`✅ Filtered to show only ${validStations.length} stations from operators:`, includeOperators);
    console.log(`📊 Excluded ${beforeCount - validStations.length} stations from other operators`);
  }
  
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
  
  // Debug: Show which stations were selected
  console.log('🎯 Selected nearest stations:', nearestStations.map(s => ({
    id: s.id,
    title: s.title,
    distance: s.distance?.toFixed(2) + 'km'
  })));
  
  return nearestStations;
};

// Fetch ALL stations using pagination - with infinite loop protection
const fetchAllStationsWithPagination = async (
  userLocation?: { latitude: number; longitude: number }
): Promise<NobilApiResponse> => {
  console.log('🔄 Starting paginated fetch to get ALL stations...');
  
  const allStations: any[] = [];
  const seenStationIds = new Set<string>(); // Track duplicate stations to detect API issues
  let offset = 0;
  const limit = 500; // Max per request
  let hasMorePages = true;
  let pageCount = 0;
  let consecutiveEmptyPages = 0;
  
  // SAFETY: Much lower limit for initial testing
  const maxPages = 5; // Reduced from 20 to prevent infinite loops during testing
  
  while (hasMorePages && pageCount < maxPages) {
    pageCount++;
    console.log(`📖 Fetching page ${pageCount}/${maxPages} (offset: ${offset}, limit: ${limit})`);
    
    try {
      const response = await withRetry(() => fetchRealStations(userLocation, offset, limit));
      
      if (!response.chargerstations || response.chargerstations.length === 0) {
        consecutiveEmptyPages++;
        console.log(`📄 Page ${pageCount}: No stations found (empty page ${consecutiveEmptyPages})`);
        
        if (consecutiveEmptyPages >= 2) {
          console.log(`📄 Multiple empty pages detected, ending pagination`);
          hasMorePages = false;
          break;
        }
        offset += limit; // Still increment offset in case API has gaps
        continue;
      }
      
      consecutiveEmptyPages = 0; // Reset empty page counter
      console.log(`📄 Page ${pageCount}: Found ${response.chargerstations.length} stations`);
      
      // LOOP DETECTION: Check for duplicate stations (indicates API not paginating properly)
      let newStationsCount = 0;
      let duplicateStationsCount = 0;
      
      for (const station of response.chargerstations) {
        const stationId = station.csmd?.id?.toString();
        if (stationId) {
          if (seenStationIds.has(stationId)) {
            duplicateStationsCount++;
          } else {
            seenStationIds.add(stationId);
            newStationsCount++;
          }
        }
      }
      
      console.log(`📊 Page ${pageCount}: ${newStationsCount} new stations, ${duplicateStationsCount} duplicates`);
      
      // INFINITE LOOP PROTECTION: If we're getting mostly duplicates, API isn't paginating properly
      if (duplicateStationsCount > response.chargerstations.length * 0.8) {
        console.log(`🛑 STOPPING: Page ${pageCount} has ${duplicateStationsCount}/${response.chargerstations.length} duplicates - API likely not supporting pagination properly`);
        hasMorePages = false;
        break;
      }
      
      // Check for Häggvik on this page
      const pageHaggvik = response.chargerstations.filter((station: any) => 
        station.csmd?.name?.toLowerCase().includes('häggvik') || 
        station.csmd?.name?.toLowerCase().includes('haggvik')
      );
      
      if (pageHaggvik.length > 0) {
        console.log(`🎯 FOUND HÄGGVIK on page ${pageCount}:`, pageHaggvik.map((s: any) => ({
          id: s.csmd?.id,
          name: s.csmd?.name,
          operator: s.csmd?.Owned_by
        })));
      }
      
      // Add only NEW stations to our collection
      const newStations = response.chargerstations.filter((station: any) => {
        const stationId = station.csmd?.id?.toString();
        return stationId && !allStations.some(existing => existing.csmd?.id?.toString() === stationId);
      });
      
      allStations.push(...newStations);
      console.log(`📊 Total unique stations so far: ${allStations.length}`);
      
      // Check if we should continue
      if (response.chargerstations.length < limit) {
        console.log(`📄 Page ${pageCount}: Received ${response.chargerstations.length} < ${limit}, this was the last page`);
        hasMorePages = false;
      } else if (newStationsCount === 0) {
        console.log(`📄 Page ${pageCount}: No new stations found, likely reached end or API issue`);
        hasMorePages = false;
      } else {
        offset += limit;
      }
      
    } catch (error) {
      console.error(`❌ Error fetching page ${pageCount}:`, error);
      hasMorePages = false;
    }
  }
  
  if (pageCount >= maxPages) {
    console.log(`🛑 Reached maximum page limit (${maxPages}) to prevent infinite loops`);
  }
  
  console.log(`✅ Pagination complete: ${pageCount} pages, ${allStations.length} total stations`);
  
  // Final Häggvik check across all pages
  const allHaggvik = allStations.filter((station: any) => 
    station.csmd?.name?.toLowerCase().includes('häggvik') || 
    station.csmd?.name?.toLowerCase().includes('haggvik')
  );
  
  if (allHaggvik.length > 0) {
    console.log(`🎉 FINAL HÄGGVIK RESULT: Found ${allHaggvik.length} Häggvik stations across all pages!`, 
      allHaggvik.map((s: any) => ({
        page: 'combined',
        id: s.csmd?.id,
        name: s.csmd?.name,
        operator: s.csmd?.Owned_by,
        position: s.csmd?.Position
      }))
    );
  } else {
    console.log('❌ FINAL HÄGGVIK RESULT: No Häggvik stations found across all pages');
  }
  
  return {
    chargerstations: allStations,
    total: allStations.length,
    status: 'success'
  };
};

export const nobilApi = {
  // Fetch charging stations near user location
  async getStockholmStations(
    userLocation?: { latitude: number; longitude: number }, 
    limit: number = 10,
    includeOperators?: string[]
  ): Promise<ChargingStation[]> {
    console.log('🔌 Fetching Stockholm charging stations...');
    
    // If we have user location, always fetch fresh data to get area-specific results
    // Otherwise, use cached data if valid
    if (!userLocation && isCacheValid() && cachedData) {
      console.log('✅ Using cached charging station data');
      return filterAndSortByLocation(cachedData, userLocation, limit, includeOperators);
    }
    
    if (userLocation) {
      console.log('📍 User location provided - fetching fresh data for location-based search');
    }

    try {
      let apiResponse: NobilApiResponse;
      
      if (NOBIL_CONFIG.USE_MOCK_DATA) {
        console.log('🧪 USING MOCK DATA - API key pending or disabled');
        apiResponse = await fetchMockStations();
      } else {
        console.log('🌐 FETCHING LIVE NOBIL DATA - API key configured');
        console.log('🔑 API Key present:', !!NOBIL_CONFIG.API_KEY);
        // TEMPORARY: Disable pagination to prevent infinite loops during testing
        console.log('🛡️ SAFETY MODE: Using single API call instead of pagination to prevent infinite loops');
        apiResponse = await withRetry(() => fetchRealStations(userLocation, 0, 500));
        
        // TODO: Re-enable pagination once we confirm API supports offset parameter
        // apiResponse = await fetchAllStationsWithPagination(userLocation);
      }

      // Transform to our format and filter out any invalid stations
      const transformedStations = apiResponse.chargerstations.map(transformNobilStation).filter((station): station is ChargingStation => station !== null);
      
      console.log(`🔄 Transformed ${apiResponse.chargerstations.length} raw stations into ${transformedStations.length} valid stations`);
      
      // Cache all results
      cachedData = transformedStations;
      cacheTimestamp = Date.now();
      
      // Filter and sort by location
      const nearestStations = filterAndSortByLocation(transformedStations, userLocation, limit, includeOperators);
      
      console.log(`✅ Successfully loaded ${transformedStations.length} stations, returning ${nearestStations.length} nearest`);
      return nearestStations;
      
    } catch (error) {
      console.error('❌ Failed to fetch charging stations:', error);
      
      // Return cached data as fallback if available
      if (cachedData) {
        console.log('⚠️ Using cached data as fallback');
        return filterAndSortByLocation(cachedData, userLocation, limit, includeOperators);
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