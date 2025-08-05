import { supabase } from './supabaseClient';
import { nobilApi } from './nobilApi';
import { ChargingStation } from '../types/ChargingStation';

// Types for database operations
interface DatabaseStation {
  id: string;
  external_id: number;
  title: string;
  description: string | null;
  operator: string;
  latitude: number;
  longitude: number;
  street: string | null;
  house_number: string | null;
  city: string | null;
  zipcode: string | null;
  country: string;
  available_charging_points: number;
  total_charging_points: number;
  station_status: number;
  last_synced: string;
}

// Convert our ChargingStation format to database format
const transformToDbFormat = (station: ChargingStation): Omit<DatabaseStation, 'last_synced'> => {
  // Debug: Check if this is a Häggvik station being transformed for database
  const isHaggvik = station.title.toLowerCase().includes('häggvik') || station.title.toLowerCase().includes('haggvik');
  
  // Extract external ID from our format (SE_12345 -> 12345)
  const externalId = parseInt(station.id.replace('SE_', ''));
  
  // Parse address components from description
  const addressParts = station.description.split(', ');
  const street = addressParts[0] || null;
  const city = addressParts[addressParts.length - 1] || 'Stockholm';
  
  const transformed = {
    id: station.id,
    external_id: externalId,
    title: station.title,
    description: station.description,
    operator: station.operator,
    latitude: station.latitude,
    longitude: station.longitude,
    street,
    house_number: null, // Could be parsed from street if needed
    city,
    zipcode: null, // Not available in our current format
    country: 'SE',
    available_charging_points: station.availableChargingPoints || 0,
    station_status: station.stationStatus || 1,
    total_charging_points: station.totalChargingPoints || 0,
  };
  
  if (isHaggvik) {
    console.log(`🎯 DB TRANSFORM - Häggvik station:`, {
      input: { id: station.id, title: station.title, operator: station.operator },
      output: { id: transformed.id, title: transformed.title, operator: transformed.operator, external_id: transformed.external_id }
    });
  }
  
  return transformed;
};

// Convert database format back to our ChargingStation format
const transformFromDbFormat = (dbStation: DatabaseStation): ChargingStation => {
  return {
    id: dbStation.id,
    latitude: dbStation.latitude,
    longitude: dbStation.longitude,
    title: dbStation.title,
    description: dbStation.description || `${dbStation.street || ''} ${dbStation.house_number || ''}, ${dbStation.city || 'Stockholm'}`.trim(),
    operator: dbStation.operator,
    isDiscovered: false,
    isDiscoverable: false,
    isUnlocking: false,
    unlockProgress: 0,
    // Real status data from database
    stationStatus: dbStation.station_status,
    totalChargingPoints: dbStation.total_charging_points,
    availableChargingPoints: dbStation.available_charging_points,
  };
};

export const stationSyncService = {
  // Sync all stations from Nobil API to Supabase
  async syncAllStations(): Promise<{ synced: number; errors: string[] }> {
    console.log('🔄 Starting comprehensive station sync...');
    
    const errors: string[] = [];
    let syncedCount = 0;
    
    try {
      console.log('🔄 MULTI-CENTER APPROACH: Multiple independent API calls (no pagination)');
      console.log('🛡️ This gets broad coverage without infinite loop risk');
      
      const allStations = new Map<string, ChargingStation>();
      
      // Define strategic center points to cover all of Greater Stockholm
      // Each call gets 500 stations, so we can get 3000+ total stations
      const searchCenters = [
        { name: 'Central Stockholm', lat: 59.3293, lng: 18.0686 },
        { name: 'North Stockholm (Sollentuna/Häggvik)', lat: 59.4280, lng: 17.9470 }, // Moved closer to Häggvik
        { name: 'Northeast Stockholm (Täby/Danderyd)', lat: 59.4430, lng: 18.1300 },
        { name: 'South Stockholm (Huddinge/Flemingsberg)', lat: 59.2370, lng: 17.9770 },
        { name: 'Southeast Stockholm (Nacka/Värmdö)', lat: 59.3100, lng: 18.2640 },
        { name: 'West Stockholm (Vällingby/Rinkeby)', lat: 59.3650, lng: 17.8770 },
        { name: 'Northwest Stockholm (Kista/Rinkeby)', lat: 59.4040, lng: 17.9440 }
      ];
      
      console.log(`🗺️ Will search from ${searchCenters.length} strategic center points...`);
      
      // Fetch stations from each center point independently - WITH COMPREHENSIVE DEBUG
      for (let i = 0; i < searchCenters.length; i++) {
        const center = searchCenters[i];
        try {
          console.log(`\n🔍 === LOCATION ${i + 1}/${searchCenters.length}: ${center.name} ===`);
          console.log(`📍 Center coordinates: ${center.lat}, ${center.lng}`);
          
          // Each call is independent - no pagination, just 500 stations from this center
          const centerStations = await nobilApi.getStockholmStations(
            { latitude: center.lat, longitude: center.lng },
            500, // Fixed limit per center point
            [] // No operator filtering
          );
          
          console.log(`📊 API returned ${centerStations.length} stations for ${center.name}`);
          
          // DEBUG: Show some example station IDs and names from this location
          const stationSample = centerStations.slice(0, 5).map(s => ({
            id: s.id,
            title: s.title.substring(0, 30) + (s.title.length > 30 ? '...' : ''),
            lat: s.latitude,
            lng: s.longitude
          }));
          console.log(`📋 Sample stations from ${center.name}:`, stationSample);
          
          // DEBUG: Check if we're getting the same stations as previous locations
          if (i > 0) {
            const existingStationIds = Array.from(allStations.keys());
            const currentStationIds = centerStations.map(s => s.id);
            const overlap = currentStationIds.filter(id => existingStationIds.includes(id));
            console.log(`🔄 OVERLAP CHECK: ${overlap.length}/${centerStations.length} stations already seen (${((overlap.length/centerStations.length)*100).toFixed(1)}% overlap)`);
            
            if (overlap.length > centerStations.length * 0.9) {
              console.log(`🚨 WARNING: ${center.name} has >90% overlap with previous locations - API might not be location-specific!`);
            }
          }
          
          // Debug: Look for Häggvik specifically in this area
          const haggvikStations = centerStations.filter(station => 
            station.title.toLowerCase().includes('häggvik') || 
            station.title.toLowerCase().includes('haggvik')
          );
          
          if (haggvikStations.length > 0) {
            console.log(`🎯 FOUND HÄGGVIK STATIONS around ${center.name}:`, haggvikStations.map(s => ({
              id: s.id,
              title: s.title,
              operator: s.operator,
              lat: s.latitude,
              lng: s.longitude
            })));
          } else {
            console.log(`❌ No Häggvik stations found around ${center.name}`);
          }
          
          // Add to our map (automatically deduplicates by station ID)
          let newStationsCount = 0;
          let duplicateCount = 0;
          centerStations.forEach(station => {
            if (!allStations.has(station.id)) {
              allStations.set(station.id, station);
              newStationsCount++;
            } else {
              duplicateCount++;
            }
          });
          
          console.log(`✅ Added ${newStationsCount} NEW stations from ${center.name}`);
          console.log(`🔄 Skipped ${duplicateCount} duplicate stations from ${center.name}`);
          console.log(`📊 Total unique stations so far: ${allStations.size}`);
          
        } catch (error) {
          const errorMsg = `Failed to fetch ${center.name}: ${error}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }
      
      console.log(`🗺️ Total unique stations found: ${allStations.size}`);
      
      // Final check: Are Häggvik stations in our complete set?
      const stationsArray = Array.from(allStations.values());
      const finalHaggvik = stationsArray.filter(station => 
        station.title.toLowerCase().includes('häggvik') || 
        station.title.toLowerCase().includes('haggvik')
      );
      
      console.log(`🔍 Final Häggvik check: Found ${finalHaggvik.length} Häggvik stations in complete set`);
      if (finalHaggvik.length > 0) {
        console.log('📋 Häggvik stations ready for database:', finalHaggvik.map(s => ({
          id: s.id,
          title: s.title,
          operator: s.operator
        })));
      }
      
      // Batch insert/update stations in Supabase
      const batchSize = 50; // Process in batches to avoid timeouts
      
      for (let i = 0; i < stationsArray.length; i += batchSize) {
        const batch = stationsArray.slice(i, i + batchSize);
        const dbStations = batch.map(transformToDbFormat);
        
        try {
          const { error } = await supabase
            .from('charging_stations')
            .upsert(dbStations, { 
              onConflict: 'id',
              ignoreDuplicates: false 
            });
          
          if (error) {
            const errorMsg = `Batch ${Math.floor(i/batchSize) + 1} failed: ${error.message}`;
            console.error(errorMsg);
            errors.push(errorMsg);
          } else {
            syncedCount += batch.length;
            console.log(`✅ Synced batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(stationsArray.length/batchSize)} (${batch.length} stations)`);
          }
        } catch (error) {
          const errorMsg = `Batch ${Math.floor(i/batchSize) + 1} error: ${error}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }
      
      console.log(`🎉 Sync complete! ${syncedCount} stations synced with ${errors.length} errors`);
      
      return { 
        synced: syncedCount, 
        totalStations: allStations.size, // Include total unique stations found
        errors 
      };
      
    } catch (error) {
      const errorMsg = `Sync failed: ${error}`;
      console.error(errorMsg);
      errors.push(errorMsg);
      return { 
        synced: syncedCount, 
        totalStations: allStations?.size || 0, // Include total even in error case
        errors 
      };
    }
  },
  
  // Get stations from Supabase with filtering and sorting
  async getStations(
    userLocation?: { latitude: number; longitude: number },
    limit: number = 10,
    includeOperators?: string[]
  ): Promise<ChargingStation[]> {
    console.log('📊 Fetching stations from Supabase database...');
    
    try {
      let query = supabase
        .from('charging_stations')
        .select('*');
      
      // Filter by operators if specified
      if (includeOperators && includeOperators.length > 0) {
        query = query.or(
          includeOperators.map(op => `operator.ilike.%${op}%`).join(',')
        );
        console.log(`🔍 Filtering to operators: ${includeOperators.join(', ')}`);
      }
      
      const { data: stations, error } = await query;
      
      if (error) {
        console.error('❌ Supabase query error:', error);
        throw error;
      }
      
      if (!stations) {
        console.log('⚠️ No stations found in database');
        return [];
      }
      
      console.log(`📊 Found ${stations.length} stations in database`);
      
      // Debug: Check if Häggvik stations are in database
      const dbHaggvik = stations.filter(station => 
        station.title.toLowerCase().includes('häggvik') || 
        station.title.toLowerCase().includes('haggvik')
      );
      
      if (dbHaggvik.length > 0) {
        console.log(`🎯 Found ${dbHaggvik.length} Häggvik stations in database:`, dbHaggvik.map(s => ({
          id: s.id,
          title: s.title,
          operator: s.operator,
          lat: s.latitude,
          lng: s.longitude
        })));
      } else {
        console.log('❌ No Häggvik stations found in database query');
      }
      
      // Convert to our format
      let transformedStations = stations.map(transformFromDbFormat);
      
      // Sort by distance if user location provided
      if (userLocation) {
        transformedStations = transformedStations
          .map(station => {
            const distance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              station.latitude,
              station.longitude
            );
            return { ...station, distance };
          })
          .sort((a, b) => (a as any).distance - (b as any).distance)
          .slice(0, limit)
          .map(({ distance, ...station }) => station); // Remove distance property
        
        console.log(`📍 Sorted by distance, returning ${transformedStations.length} nearest stations`);
      } else {
        transformedStations = transformedStations.slice(0, limit);
        console.log(`📊 No location provided, returning first ${transformedStations.length} stations`);
      }
      
      return transformedStations;
      
    } catch (error) {
      console.error('❌ Failed to fetch stations from database:', error);
      throw error;
    }
  },
  
  // Search for specific stations by name (debugging helper)
  async searchStationsByName(searchTerm: string) {
    try {
      console.log(`🔍 Searching for stations containing: "${searchTerm}"`);
      
      const { data: stations, error } = await supabase
        .from('charging_stations')
        .select('*')
        .ilike('title', `%${searchTerm}%`);
      
      if (error) {
        console.error('❌ Search error:', error);
        throw error;
      }
      
      console.log(`📋 Found ${stations?.length || 0} stations matching "${searchTerm}"`);
      if (stations && stations.length > 0) {
        stations.forEach(station => {
          console.log(`  - ${station.title} (${station.operator}) at ${station.latitude}, ${station.longitude}`);
        });
      }
      
      return stations || [];
    } catch (error) {
      console.error('❌ Failed to search stations:', error);
      throw error;
    }
  },

  // Get sync status and statistics
  async getSyncStatus() {
    try {
      const { data: stats, error } = await supabase
        .from('charging_stations')
        .select('operator, city, last_synced')
        .order('last_synced', { ascending: false });
      
      if (error) throw error;
      
      const operatorCounts = stats?.reduce((acc, station) => {
        acc[station.operator] = (acc[station.operator] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      const cityCount = new Set(stats?.map(s => s.city)).size || 0;
      const lastSync = stats?.[0]?.last_synced || null;
      
      return {
        totalStations: stats?.length || 0,
        operatorCounts,
        cityCount,
        lastSync,
      };
    } catch (error) {
      console.error('❌ Failed to get sync status:', error);
      throw error;
    }
  }
};

// Haversine formula for distance calculation
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};