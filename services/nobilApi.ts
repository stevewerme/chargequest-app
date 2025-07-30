import { ChargingStation } from '../types/ChargingStation';

// Configuration
const NOBIL_CONFIG = {
  BASE_URL: 'https://nobil.no/api/server/search.php',
  COUNTRY: 'SE',
  MUNICIPALITY: 'Stockholm',
  FORMAT: 'json',
  API_KEY: process.env.NOBIL_API_KEY || null, // Will be set when we get the key
  USE_MOCK_DATA: true, // Switch to false when API key is ready
  REQUEST_TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

// Types matching Nobil API response structure
interface NobilStation {
  id: string;
  name: string;
  Position: {
    lat: number;
    lng: number;
  };
  operator?: string;
  street?: string;
  city?: string;
  description?: string;
  available?: boolean;
  capacity?: number;
  created?: string;
  modified?: string;
}

interface NobilApiResponse {
  chargerstations: NobilStation[];
  total?: number;
  status?: string;
}

// Cache for API responses
let cachedData: ChargingStation[] | null = null;
let cacheTimestamp: number = 0;

// Mock Stockholm charging stations in Nobil format (realistic Stockholm locations)
const MOCK_NOBIL_STATIONS: NobilStation[] = [
  // Central Stockholm
  { id: 'SE_STOCKHOLM_001', name: 'T-Centralen Station', Position: { lat: 59.3293, lng: 18.0686 }, operator: 'Recharge', street: 'Vasagatan', city: 'Stockholm' },
  { id: 'SE_STOCKHOLM_002', name: 'Gamla Stan Charger', Position: { lat: 59.3251, lng: 18.0711 }, operator: 'Recharge', street: 'Stortorget', city: 'Stockholm' },
  { id: 'SE_STOCKHOLM_003', name: 'Södermalm Energy Hub', Position: { lat: 59.3165, lng: 18.0740 }, operator: 'Recharge', street: 'Götgatan', city: 'Stockholm' },
  
  // Östermalm  
  { id: 'SE_STOCKHOLM_004', name: 'Stureplan Premium', Position: { lat: 59.3346, lng: 18.0728 }, operator: 'Recharge', street: 'Birger Jarlsgatan', city: 'Stockholm' },
  { id: 'SE_STOCKHOLM_005', name: 'Östermalm Square', Position: { lat: 59.3378, lng: 18.0852 }, operator: 'Recharge', street: 'Östermalmstorg', city: 'Stockholm' },
  
  // Vasastan
  { id: 'SE_STOCKHOLM_006', name: 'Odenplan Station', Position: { lat: 59.3434, lng: 18.0495 }, operator: 'Recharge', street: 'Odenplan', city: 'Stockholm' },
  { id: 'SE_STOCKHOLM_007', name: 'Vasastan Residential', Position: { lat: 59.3398, lng: 18.0456 }, operator: 'Recharge', street: 'Upplandsgatan', city: 'Stockholm' },
  
  // Norrmalm
  { id: 'SE_STOCKHOLM_008', name: 'Sergels Torg Hub', Position: { lat: 59.3325, lng: 18.0632 }, operator: 'Recharge', street: 'Sergels Torg', city: 'Stockholm' },
  { id: 'SE_STOCKHOLM_009', name: 'Hötorget Market', Position: { lat: 59.3370, lng: 18.0604 }, operator: 'Recharge', street: 'Hötorget', city: 'Stockholm' },
  
  // Södermalm Extended
  { id: 'SE_STOCKHOLM_010', name: 'Medborgarplatsen', Position: { lat: 59.3144, lng: 18.0731 }, operator: 'Recharge', street: 'Medborgarplatsen', city: 'Stockholm' },
  { id: 'SE_STOCKHOLM_011', name: 'Mariatorget Park', Position: { lat: 59.3170, lng: 18.0648 }, operator: 'Recharge', street: 'Mariatorget', city: 'Stockholm' },
  
  // Kungsholmen
  { id: 'SE_STOCKHOLM_012', name: 'City Hall Charger', Position: { lat: 59.3275, lng: 18.0546 }, operator: 'Recharge', street: 'Hantverkargatan', city: 'Stockholm' },
  { id: 'SE_STOCKHOLM_013', name: 'Fridhemsplan Station', Position: { lat: 59.3338, lng: 18.0345 }, operator: 'Recharge', street: 'Fridhemsplan', city: 'Stockholm' },
  
  // Djurgården & Eastern Areas
  { id: 'SE_STOCKHOLM_014', name: 'Djurgården Museum District', Position: { lat: 59.3247, lng: 18.0995 }, operator: 'Recharge', street: 'Djurgårdsbron', city: 'Stockholm' },
  { id: 'SE_STOCKHOLM_015', name: 'Gröna Lund Area', Position: { lat: 59.3233, lng: 18.0965 }, operator: 'Recharge', street: 'Allmänna gränd', city: 'Stockholm' },
  
  // Northern Stockholm
  { id: 'SE_STOCKHOLM_016', name: 'Hagastaden Business', Position: { lat: 59.3521, lng: 18.0234 }, operator: 'Recharge', street: 'Solna väg', city: 'Stockholm' },
  { id: 'SE_STOCKHOLM_017', name: 'Karolinska Institute', Position: { lat: 59.3498, lng: 18.0278 }, operator: 'Recharge', street: 'Nobels väg', city: 'Stockholm' },
  
  // Söderort (Southern Suburbs)
  { id: 'SE_STOCKHOLM_018', name: 'Skanstull Bridge', Position: { lat: 59.3089, lng: 18.0745 }, operator: 'Recharge', street: 'Skanstullsbron', city: 'Stockholm' },
  { id: 'SE_STOCKHOLM_019', name: 'Gullmarsplan Hub', Position: { lat: 59.2986, lng: 18.0820 }, operator: 'Recharge', street: 'Gullmarsplan', city: 'Stockholm' },
  
  // Västerort (Western Suburbs)  
  { id: 'SE_STOCKHOLM_020', name: 'Vällingby Centrum', Position: { lat: 59.3619, lng: 17.8771 }, operator: 'Recharge', street: 'Vällingby Centrum', city: 'Stockholm' },
  { id: 'SE_STOCKHOLM_021', name: 'Bromma Airport', Position: { lat: 59.3544, lng: 17.9417 }, operator: 'Recharge', street: 'Bromma Flygplats', city: 'Stockholm' },
  
  // Original Töjnan area (keeping our test locations)
  { id: 'SE_STOCKHOLM_022', name: 'Hjortvägen/Fjällvägen', Position: { lat: 59.4245940, lng: 17.9357635 }, operator: 'Recharge', street: 'Hjortvägen', city: 'Sollentuna' },
  { id: 'SE_STOCKHOLM_023', name: 'Villavägen Station', Position: { lat: 59.4260085, lng: 17.9312432 }, operator: 'Recharge', street: 'Villavägen', city: 'Sollentuna' },
  { id: 'SE_STOCKHOLM_024', name: 'Töjnaskolan Park', Position: { lat: 59.4249233, lng: 17.9292865 }, operator: 'Recharge', street: 'Töjnaskolan', city: 'Sollentuna' },
  { id: 'SE_STOCKHOLM_025', name: 'Sveavägen Bus', Position: { lat: 59.4215182, lng: 17.9334567 }, operator: 'Recharge', street: 'Sveavägen', city: 'Sollentuna' },
  { id: 'SE_STOCKHOLM_026', name: 'St1 Gas Station', Position: { lat: 59.4185613, lng: 17.9386471 }, operator: 'Recharge', street: 'St1 Station', city: 'Sollentuna' },
  { id: 'SE_STOCKHOLM_027', name: 'Kanalvägen', Position: { lat: 59.4195248, lng: 17.9400039 }, operator: 'Recharge', street: 'Kanalvägen', city: 'Sollentuna' },
  { id: 'SE_STOCKHOLM_028', name: 'Töjnan Running Trail', Position: { lat: 59.4297178, lng: 17.9225934 }, operator: 'Recharge', street: 'Running Trail', city: 'Sollentuna' },
  { id: 'SE_STOCKHOLM_029', name: 'Polhemsvägen Slope', Position: { lat: 59.4231384, lng: 17.9427535 }, operator: 'Recharge', street: 'Polhemsvägen', city: 'Sollentuna' },
  { id: 'SE_STOCKHOLM_030', name: 'Circle K Gas Station', Position: { lat: 59.4227041, lng: 17.9449429 }, operator: 'Recharge', street: 'Circle K', city: 'Sollentuna' },
];

// Transform Nobil station to our ChargingStation format
const transformNobilStation = (nobilStation: NobilStation, index: number): ChargingStation => {
  return {
    id: nobilStation.id,
    latitude: nobilStation.Position.lat,
    longitude: nobilStation.Position.lng,
    title: nobilStation.name,
    description: nobilStation.description || `${nobilStation.street || ''}, ${nobilStation.city || 'Stockholm'}`.trim(),
    operator: nobilStation.operator || 'Recharge',
    isDiscovered: false,
    isDiscoverable: false,
    isUnlocking: false,
    unlockProgress: 0,
  };
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
  
  return {
    chargerstations: MOCK_NOBIL_STATIONS,
    total: MOCK_NOBIL_STATIONS.length,
    status: 'success'
  };
};

// Real API call (ready for when we get the API key)
const fetchRealStations = async (): Promise<NobilApiResponse> => {
  if (!NOBIL_CONFIG.API_KEY) {
    throw new Error('Nobil API key not configured');
  }

  const params = new URLSearchParams({
    country: NOBIL_CONFIG.COUNTRY,
    municipality: NOBIL_CONFIG.MUNICIPALITY,
    format: NOBIL_CONFIG.FORMAT,
    apikey: NOBIL_CONFIG.API_KEY,
  });

  const url = `${NOBIL_CONFIG.BASE_URL}?${params.toString()}`;
  
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
      throw new Error(`Nobil API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
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
export const nobilApi = {
  // Fetch all Stockholm charging stations
  async getStockholmStations(): Promise<ChargingStation[]> {
    console.log('🔌 Fetching Stockholm charging stations...');
    
    // Return cached data if valid
    if (isCacheValid()) {
      console.log('✅ Using cached charging station data');
      return cachedData!;
    }

    try {
      let apiResponse: NobilApiResponse;
      
      if (NOBIL_CONFIG.USE_MOCK_DATA) {
        console.log('🧪 Using mock Nobil data (API key pending)');
        apiResponse = await fetchMockStations();
      } else {
        console.log('🌐 Fetching live Nobil data');
        apiResponse = await withRetry(() => fetchRealStations());
      }

      // Transform to our format
      const stations = apiResponse.chargerstations.map(transformNobilStation);
      
      // Cache the results
      cachedData = stations;
      cacheTimestamp = Date.now();
      
      console.log(`✅ Successfully loaded ${stations.length} charging stations`);
      return stations;
      
    } catch (error) {
      console.error('❌ Failed to fetch charging stations:', error);
      
      // Return cached data as fallback if available
      if (cachedData) {
        console.log('⚠️ Using cached data as fallback');
        return cachedData;
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
}; 