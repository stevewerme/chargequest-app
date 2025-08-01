import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sakweromcxocuaaaamqc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNha3dlcm9tY3hvY3VhYWFhbXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NTI2NTQsImV4cCI6MjA2OTQyODY1NH0.fZtf6w5w7jzFKM9IL858FWkyvmCkxbNUqYo-EkssTA8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for TypeScript
export interface UserProgress {
  id: string;
  user_id: string;
  total_xp: number;
  current_level: number;
  discovered_stations: string[];
  created_at: string;
  updated_at: string;
}

export interface StationDiscovery {
  id: string;
  user_id: string;
  station_id: string;
  nobil_station_id?: string;
  discovered_at: string;
  xp_awarded: number;
  bonus_type?: string;
  latitude: number;
  longitude: number;
}

// Supabase service functions
export const supabaseService = {
  // User progress operations
  async getUserProgress(userId: string): Promise<UserProgress | null> {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user progress:', error);
      return null;
    }
    
    return data;
  },

  async createUserProgress(userId: string, initialData: Partial<UserProgress>): Promise<UserProgress | null> {
    const { data, error } = await supabase
      .from('user_progress')
      .insert({
        user_id: userId,
        total_xp: initialData.total_xp || 0,
        current_level: initialData.current_level || 1,
        discovered_stations: initialData.discovered_stations || [],
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user progress:', error);
      return null;
    }
    
    return data;
  },

  async updateUserProgress(userId: string, updates: Partial<UserProgress>): Promise<UserProgress | null> {
    const { data, error } = await supabase
      .from('user_progress')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user progress:', error);
      return null;
    }
    
    return data;
  },

  // Station discovery operations
  async addStationDiscovery(discovery: Omit<StationDiscovery, 'id' | 'discovered_at'>): Promise<StationDiscovery | null> {
    const { data, error } = await supabase
      .from('station_discoveries')
      .insert({
        ...discovery,
        discovered_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding station discovery:', error);
      return null;
    }
    
    return data;
  },

  async getUserDiscoveries(userId: string): Promise<StationDiscovery[]> {
    const { data, error } = await supabase
      .from('station_discoveries')
      .select('*')
      .eq('user_id', userId)
      .order('discovered_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user discoveries:', error);
      return [];
    }
    
    return data || [];
  },
}; 