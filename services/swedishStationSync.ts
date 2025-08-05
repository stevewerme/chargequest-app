import { supabase } from './supabaseClient';

interface SwedishSyncResult {
  success: boolean;
  regionsProcessed?: number;
  stationsFound?: number;
  validTransformations?: number;
  stationsUpserted?: number;
  totalStationsInDb?: number;
  haggvikStationsFound?: number;
  haggvikDetails?: Array<{title: string; operator: string; city: string}>;
  errors?: string[];
  message?: string;
  error?: string;
}

export const swedishStationSyncService = {
  
  // Trigger the comprehensive Swedish stations sync via Edge Function
  async syncAllSwedishStations(): Promise<SwedishSyncResult> {
    try {
      console.log('🇸🇪 Starting comprehensive Swedish stations sync via Edge Function...');
      
      // Call the WORKING Edge Function  
      const { data, error } = await supabase.functions.invoke('swedish-sync-working', {
        body: {}
      });
      
      if (error) {
        console.error('❌ Edge Function error:', error);
        throw error;
      }
      
      console.log('✅ Swedish sync completed:', data);
      return data as SwedishSyncResult;
      
    } catch (error) {
      console.error('❌ Failed to sync Swedish stations:', error);
      throw error;
    }
  },
  
  // Get statistics about Swedish stations in database
  async getSwedishStationStats() {
    try {
      console.log('📊 Getting Swedish station statistics...');
      
      // Get total count
      const { count: totalStations, error: countError } = await supabase
        .from('charging_stations')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('❌ Count error:', countError);
        throw countError;
      }
      
      // Get operator breakdown for Swedish stations
      const { data: operators, error: opError } = await supabase
        .from('charging_stations')
        .select('operator')
        .not('operator', 'is', null);
      
      if (opError) {
        console.error('❌ Operators error:', opError);
        throw opError;
      }
      
      // Count operators
      const operatorCounts: { [key: string]: number } = {};
      operators?.forEach(station => {
        const op = station.operator || 'Unknown';
        operatorCounts[op] = (operatorCounts[op] || 0) + 1;
      });
      
      // Get cities breakdown
      const { data: cities, error: cityError } = await supabase
        .from('charging_stations')
        .select('city')
        .not('city', 'is', null);
      
      if (cityError) {
        console.error('❌ Cities error:', cityError);
        throw cityError;
      }
      
      const cityCount = new Set(cities?.map(s => s.city)).size;
      
      // Look for Häggvik specifically
      const { data: haggvikStations, error: haggvikError } = await supabase
        .from('charging_stations')
        .select('*')
        .or('title.ilike.%häggvik%,title.ilike.%haggvik%');
      
      if (haggvikError) {
        console.error('❌ Häggvik search error:', haggvikError);
        throw haggvikError;
      }
      
      return {
        totalStations: totalStations || 0,
        operatorCounts,
        cityCount,
        haggvikStations: haggvikStations || [],
        haggvikCount: haggvikStations?.length || 0
      };
      
    } catch (error) {
      console.error('❌ Failed to get Swedish station stats:', error);
      throw error;
    }
  }
};

export default swedishStationSyncService;