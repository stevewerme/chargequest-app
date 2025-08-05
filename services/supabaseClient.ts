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

export interface UserTreasureState {
  id: string;
  user_id: string;
  total_collected: number;
  common_collected: number;
  rare_collected: number;
  super_rare_collected: number;
  epic_collected: number;
  mythic_collected: number;
  legendary_collected: number;
  equipped_slot1: string | null;
  equipped_slot2: string | null;
  equipped_slot3: string | null;
  current_week_id: string;
  last_treasure_refresh: string | null;
  created_at: string;
  updated_at: string;
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

  // Treasure system operations
  async getUserTreasureState(userId: string): Promise<UserTreasureState | null> {
    const { data, error } = await supabase
      .from('user_treasure_state')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No record found - this is normal for new users
        return null;
      }
      console.error('Error fetching user treasure state:', error);
      return null;
    }
    
    return data;
  },

  async createUserTreasureState(userId: string, initialData: Partial<UserTreasureState>): Promise<UserTreasureState | null> {
    const { data, error } = await supabase
      .from('user_treasure_state')
      .insert({
        user_id: userId,
        total_collected: initialData.total_collected || 0,
        common_collected: initialData.common_collected || 0,
        rare_collected: initialData.rare_collected || 0,
        super_rare_collected: initialData.super_rare_collected || 0,
        epic_collected: initialData.epic_collected || 0,
        mythic_collected: initialData.mythic_collected || 0,
        legendary_collected: initialData.legendary_collected || 0,
        equipped_slot1: initialData.equipped_slot1 || null,
        equipped_slot2: initialData.equipped_slot2 || null,
        equipped_slot3: initialData.equipped_slot3 || null,
        current_week_id: initialData.current_week_id || '',
        last_treasure_refresh: initialData.last_treasure_refresh || null,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user treasure state:', error);
      return null;
    }
    
    return data;
  },

  async updateUserTreasureState(userId: string, updates: Partial<UserTreasureState>): Promise<UserTreasureState | null> {
    const { data, error } = await supabase
      .from('user_treasure_state')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user treasure state:', error);
      return null;
    }
    
    return data;
  },

  async syncUserTreasureState(userId: string, localState: {
    treasureStats: any;
    equippedTools: any;
    currentWeekId: string;
    lastTreasureRefresh: Date | null;
  }): Promise<UserTreasureState | null> {
    try {
      // Try to get existing state
      let treasureState = await this.getUserTreasureState(userId);
      
      const treasureData = {
        total_collected: localState.treasureStats.totalCollected,
        common_collected: localState.treasureStats.commonCollected,
        rare_collected: localState.treasureStats.rareCollected,
        super_rare_collected: localState.treasureStats.superRareCollected,
        epic_collected: localState.treasureStats.epicCollected,
        mythic_collected: localState.treasureStats.mythicCollected,
        legendary_collected: localState.treasureStats.legendaryCollected,
        equipped_slot1: localState.equippedTools.slot1,
        equipped_slot2: localState.equippedTools.slot2,
        equipped_slot3: localState.equippedTools.slot3,
        current_week_id: localState.currentWeekId,
        last_treasure_refresh: localState.lastTreasureRefresh?.toISOString() || null,
      };
      
      if (!treasureState) {
        // Create new treasure state
        treasureState = await this.createUserTreasureState(userId, treasureData);
      } else {
        // Update existing treasure state
        treasureState = await this.updateUserTreasureState(userId, treasureData);
      }
      
      return treasureState;
    } catch (error) {
      console.error('Error syncing user treasure state:', error);
      return null;
    }
  },
}; 