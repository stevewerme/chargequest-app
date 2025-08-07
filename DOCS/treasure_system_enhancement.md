# ChargeQuest Treasure System Enhancement Project

## Overview

This project enhances ChargeQuest's treasure system with improved rarity balance, urban/rural fairness, and station expiry mechanics to create a more engaging and balanced treasure hunting experience.

## Current Problems

### 1. Rare Treasures Too Common
- **Epic**: 8% (too generous)
- **Mythic**: 3% (not special enough)
- **Legendary**: 1% (weekly instead of monthly event)

### 2. Urban vs Rural Imbalance
- **Urban players**: 500+ stations per km², can claim 20+ in one afternoon
- **Rural players**: 2 stations per 100 km², require 2+ hours between stations
- **Result**: Urban players get 10x more treasures with same effort

### 3. Permanent Station Claiming
- No incentive to revisit or maintain territories
- Map becomes cluttered with permanently claimed stations
- No strategic decision-making about which stations to maintain

## Enhanced System Goals

### 🎯 **Core Objectives**
1. **True Rarity**: Legendary treasures feel genuinely legendary (months, not weeks)
2. **Fair Geography**: Rural players get meaningful advantages for their effort
3. **Strategic Depth**: Station expiry creates territory management decisions
4. **Maintained Excitement**: Loyalty improves odds without guaranteeing outcomes

## New Rarity Distribution

### **Enhanced 6-Tier System**
```typescript
const ENHANCED_TREASURE_SPAWN_CONFIG = [
  { rarity: 'common',     probability: 500, xpBonus: 25  }, // 50.0% (↑ from 45%)
  { rarity: 'rare',       probability: 290, xpBonus: 50  }, // 29.0% (↑ from 28%)
  { rarity: 'super_rare', probability: 150, xpBonus: 100 }, // 15.0% (same)
  { rarity: 'epic',       probability: 50,  xpBonus: 200 }, // 5.0%  (↓ from 8%)
  { rarity: 'mythic',     probability: 15,  xpBonus: 400 }, // 1.5%  (↓ from 3%)
  { rarity: 'legendary',  probability: 3,   xpBonus: 750 }, // 0.3%  (↓ from 1%)
];
```

### **Real-World Impact**
**Player with 20 claimed stations per week:**
- **Common**: 10 treasures (expected baseline)
- **Rare**: 6 treasures (nice surprise)
- **Super Rare**: 3 treasures (exciting find)
- **Epic**: 1 treasure every 2 weeks (rare thrill)
- **Mythic**: 1 treasure every 6-7 weeks (genuine excitement)
- **Legendary**: 1 treasure every 16 weeks (~4 months) (legendary moment!)

## Urban vs Rural Balance System

### **Hybrid Balance Approach**
```typescript
const calculateTreasureOdds = (station, userLocation, weeksClaimed = 0) => {
  const baseOdds = getBaseRarityOdds();
  
  // 1. Loyalty multiplier (improves odds, doesn't guarantee)
  const loyaltyMultiplier = Math.min(1 + (weeksClaimed * 0.05), 1.5); // Max 1.5x
  
  // 2. Distance effort bonus
  const distance = calculateDistance(userLocation, station);
  const distanceBonus = distance > 2000 ? 1.5 : 1.0; // 2km+ = 50% bonus
  
  // 3. Station density balance
  const nearbyStations = countStationsWithin5km(station);
  const densityBonus = nearbyStations < 10 ? 1.5 : 1.0; // Low density = 50% bonus
  
  return baseOdds * loyaltyMultiplier * distanceBonus * densityBonus;
};
```

### **Balance Examples**

#### **Stockholm City Player (Week 5)**
- Base legendary: 0.3%
- Loyalty: 1.25x = 0.375%
- Distance: <2km = 1.0x
- Density: High = 1.0x
- **Final: 0.375% legendary**

#### **Rural Player (Week 5)**
- Base legendary: 0.3%
- Loyalty: 1.25x = 0.375%
- Distance: >2km = 1.5x = 0.56%
- Density: Low = 1.5x = 0.84%
- **Final: 0.84% legendary (2.2x advantage)**

## Station Expiry System

### **90-Day Expiry Mechanics**
```typescript
interface ClaimedStation {
  stationId: string;
  claimedAt: Date;
  lastVisited: Date;
  expiresAt: Date;        // claimedAt + 90 days
  renewalCount: number;   // How many times renewed
  loyaltyWeeks: number;   // Weeks claimed (for bonus calculation)
}
```

### **Expiry Rules**
- **Claim Duration**: 90 days from initial claim
- **Renewal Window**: 7 days before expiry + 24 hours after
- **Renewal Method**: Visit station within range (25m)
- **Loyalty Bonus**: Each renewal cycle increases treasure odds slightly
- **Strategic Choice**: Can't maintain all stations - must choose valuable ones

### **Player Experience**
1. **Week 1**: Claim 10 stations → 90-day countdown begins
2. **Week 12**: "5 stations expiring in 7 days" notification
3. **Week 13**: Visit 3 most convenient stations to renew, let 2 expire
4. **Result**: Strategic territory management, not permanent hoarding

## Technical Implementation

### **Phase 1: Rarity Rebalance**

#### **Files to Update:**
- `stores/gameStore.ts` - Update `TREASURE_SPAWN_CONFIG`
- Adjust XP bonuses for new balance

#### **Code Changes:**
```typescript
// Replace existing TREASURE_SPAWN_CONFIG in gameStore.ts
const TREASURE_SPAWN_CONFIG: TreasureSpawnConfig[] = [
  {
    rarity: 'common',
    probability: 500, // 50%
    xpBonus: 25,
    treasureTypes: [
      // ... existing common treasures
    ]
  },
  {
    rarity: 'epic',
    probability: 50, // 5% (down from 80/8%)
    xpBonus: 200,
    treasureTypes: [
      // ... existing epic treasures  
    ]
  },
  {
    rarity: 'mythic',
    probability: 15, // 1.5% (down from 30/3%)
    xpBonus: 400, // Increased XP for rarity
    treasureTypes: [
      // ... existing mythic treasures
    ]
  },
  {
    rarity: 'legendary',
    probability: 3, // 0.3% (down from 10/1%)
    xpBonus: 750, // Significantly increased XP
    treasureTypes: [
      // ... existing legendary treasures
    ]
  }
];
```

### **Phase 2: Urban/Rural Balance**

#### **New Functions:**
```typescript
// Add to gameStore.ts
const countStationsWithin5km = (centerStation: ChargingStation): number => {
  const { chargingStations } = get();
  return chargingStations.filter(station => 
    calculateDistance(
      centerStation.latitude, centerStation.longitude,
      station.latitude, station.longitude
    ) <= 5000
  ).length;
};

const calculateEnhancedTreasureOdds = (
  stationId: string,
  userLocation: UserLocation,
  weeksClaimed: number = 0
): number => {
  const station = findStationById(stationId);
  if (!station) return 1.0;
  
  // Loyalty multiplier
  const loyaltyMultiplier = Math.min(1 + (weeksClaimed * 0.05), 1.5);
  
  // Distance bonus
  const distance = calculateDistance(
    userLocation.latitude, userLocation.longitude,
    station.latitude, station.longitude
  );
  const distanceBonus = distance > 2000 ? 1.5 : 1.0;
  
  // Density bonus
  const nearbyCount = countStationsWithin5km(station);
  const densityBonus = nearbyCount < 10 ? 1.5 : 1.0;
  
  return loyaltyMultiplier * distanceBonus * densityBonus;
};
```

#### **Update Treasure Spawning:**
```typescript
// Modify spawnTreasureForStation function
const spawnTreasureForStation = (
  stationId: string, 
  userLevel: number = 1,
  isDiscoveryBonus: boolean = false,
  userLocation?: UserLocation,
  weeksClaimed: number = 0
): Treasure => {
  const weekId = getCurrentWeekId();
  
  // Calculate enhanced odds
  const oddsMultiplier = userLocation ? 
    calculateEnhancedTreasureOdds(stationId, userLocation, weeksClaimed) : 1.0;
  
  const rarity = selectRandomRarity(userLevel, isDiscoveryBonus, oddsMultiplier);
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
    weekId,
    bonusMultiplier: oddsMultiplier // Track for analytics
  };
};
```

### **Phase 3: Station Expiry System**

#### **Database Schema Updates:**
```sql
-- Add to Supabase schema
CREATE TABLE claimed_stations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  station_id TEXT NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_visited TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '90 days'),
  renewal_count INTEGER DEFAULT 0,
  loyalty_weeks INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE claimed_stations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own claimed stations"
  ON claimed_stations FOR ALL
  USING (auth.uid() = user_id);

-- Index for efficient queries
CREATE INDEX idx_claimed_stations_user_expires 
  ON claimed_stations(user_id, expires_at);
```

#### **New Store Functions:**
```typescript
// Add to gameStore interface and implementation
interface GameState {
  // ... existing properties
  claimedStations: ClaimedStation[];
  
  // New actions
  claimStationWithExpiry: (stationId: string) => Promise<void>;
  renewStationClaim: (stationId: string) => Promise<void>;
  checkExpiredStations: () => ClaimedStation[];
  cleanupExpiredStations: () => Promise<void>;
}

const claimStationWithExpiry = async (stationId: string) => {
  const { currentLocation } = get();
  if (!currentLocation) return;
  
  const claimedStation: ClaimedStation = {
    id: generateUUID(),
    stationId,
    claimedAt: new Date(),
    lastVisited: new Date(),
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    renewalCount: 0,
    loyaltyWeeks: 1
  };
  
  // Add to local state
  set(state => ({
    claimedStations: [...state.claimedStations, claimedStation]
  }));
  
  // Sync to cloud if authenticated
  if (isAuthenticated) {
    await syncClaimedStationToCloud(claimedStation);
  }
  
  // Continue with existing claim process
  await discoverStation(stationId);
  await awardXP(100);
  await spawnTreasureForStation(stationId, currentLevel, true, currentLocation, 1);
};
```

### **Phase 5: Player-Centric Avatar System**

#### **Player Profile Interface Design:**
```typescript
// New Avatar Menu Structure - Player-Centric Approach
interface PlayerProfile {
  currentLevel: number;
  levelTitle: string;
  currentXP: number;
  xpToNextLevel: number;
  stationsDiscovered: number;
  weeklyTreasures: number;
  lifetimeEpicPlus: number;
  totalTreasuresCollected: number;
}

interface TerritoryStatus {
  claimedStations: ClaimedStation[];
  expiringCount: number;
  renewalActions: StationRenewalAction[];
  territoryMapData: TerritoryVisualization;
}

const PlayerProfileModal = () => (
  <View style={styles.playerProfile}>
    {/* Level Progress Display */}
    <LevelProgressBar 
      level={currentLevel} 
      title={levelTitle}
      currentXP={currentXP}
      nextLevelXP={xpToNextLevel}
      animated={true}
    />
    
    {/* Achievement Showcase */}
    <AchievementStats
      discoveries={stationsDiscovered}
      weeklyTreasures={weeklyTreasures} 
      rareTreasures={lifetimeEpicPlus}
      totalCollected={totalTreasuresCollected}
    />
    
    {/* Territory Management */}
    <TerritoryDashboard
      claimed={claimedStations.length}
      expiring={expiringCount}
      onViewTerritory={() => openTerritoryMap()}
      onQuickRenew={() => showRenewalActions()}
    />
    
    {/* Equipped Tools Display */}
    <ToolsDisplay equippedTools={equippedTools} />
  </View>
);
```

#### **Territory Management System:**
```typescript
// Strategic Territory Overview Components
const TerritoryHub = () => (
  <ScrollView style={styles.territoryHub}>
    {/* Station List with Expiry Status */}
    <StationList
      stations={claimedStations}
      showExpiryWarnings={true}
      enableQuickRenewal={true}
      sortBy="expiryDate"
    />
    
    {/* Renewal Action Center */}
    <RenewalActionCenter
      expiringStations={getExpiringStations()}
      onBatchRenewal={handleBatchRenewal}
      onStrategicRelease={handleStrategicRelease}
    />
    
    {/* Territory Map Visualization */}
    <TerritoryMapMini
      claimedStations={claimedStations}
      userLocation={currentLocation}
      onFullMapView={openFullTerritoryMap}
    />
  </ScrollView>
);
```

#### **Gaming Psychology Integration:**
```typescript
// Progress Celebration & Achievement System
const AchievementNotification = ({ achievement }) => (
  <Animated.View style={styles.achievementPopup}>
    <Text style={styles.achievementTitle}>🏆 Achievement Unlocked!</Text>
    <Text style={styles.achievementDesc}>{achievement.description}</Text>
    <ProgressCelebration type={achievement.tier} />
  </Animated.View>
);

// Strategic Planning Interface
const StrategicOverview = () => (
  <View style={styles.strategicPlanning}>
    <EfficiencyMetrics 
      renewalsNeeded={expiringCount}
      optimalRoutes={getOptimalRenewalRoutes()}
      territoryValue={calculateTerritoryValue()}
    />
    <StrategicRecommendations
      suggestedRenewals={getPriorityRenewals()}
      suggestedReleases={getLowValueStations()}
      expansion={getSuggestedExpansions()}
    />
  </View>
);
```

## Implementation Timeline

### **Week 1: Rarity Rebalance** ✅ COMPLETED
- [x] Update `TREASURE_SPAWN_CONFIG` with new percentages (Epic 5%, Mythic 1.5%, Legendary 0.3%)
- [x] Adjust XP bonuses for rarer treasures (Mythic 400 XP, Legendary 750 XP)
- [x] Test distribution with validation logging and console monitoring
- [x] Deploy enhanced rarity system with comprehensive debug output

### **Week 2: Urban/Rural Balance** ✅ COMPLETED
- [x] Implement distance and density calculation functions (`countStationsWithin5km`, `calculateEnhancedTreasureOdds`)
- [x] Update treasure spawning with enhanced odds (distance bonus, density bonus, loyalty multiplier)
- [x] Add comprehensive logging for balance validation and real-time monitoring
- [x] Test with Stockholm vs rural scenarios - rural players get up to 2.25x better odds

### **Week 3: Station Expiry Foundation** ✅ COMPLETED
- [x] Create Supabase schema for claimed stations with 90-day expiry and RLS policies
- [x] Implement basic claim/expiry data structures (ClaimedStation, StationExpiryStatus interfaces)
- [x] Add expiry checking functions (checkExpiredStations, getStationExpiryStatus)
- [x] Create renewal mechanism with 7-day renewal window and 24-hour grace period
- [x] Integrate loyalty weeks calculation with Phase 2 treasure odds system
- [x] Add automatic cleanup of expired stations on app startup

### **Week 4: Cloud Sync & UI Integration** ✅ COMPLETED
- [x] Implement Supabase cloud sync for claimed stations with upsert operations
- [x] Add sophisticated conflict resolution for multi-device station claims  
- [x] Migrate existing local station claims to cloud storage with batch processing
- [x] Add real-time sync subscription for cross-device updates using Supabase channels
- [x] Build complete initialization workflow with graceful fallback to local-only mode
- [x] Integration with existing claim/renewal workflows for seamless cloud sync

### **Week 5: Player-Centric Avatar System & Territory Management** ✅ COMPLETED
- [x] **Player Profile System**: Real-time XP display with progress bars and achievement showcase
- [x] **Territory Management Hub**: Strategic overview of claimed stations with expiry dashboard  
- [x] **Tools & Settings Integration**: Visual tool display with clean settings organization
- [x] **Developer Mode Isolation**: 5-tap gesture toggle with professional debug feature separation
- [x] **Gaming Psychology Integration**: Progress celebration, milestone tracking, achievement badges
- [x] **Achievement System**: Milestone-based badges (🔥⚡💎) with dynamic goal tracking
- [x] **Strategic Planning Interface**: Next goals system with Explorer/Master rank progression
- [x] **Professional Gaming Profile**: Complete transformation from utility menu to engaging player interface

## Success Metrics

### **Rarity Balance Validation**
- **Epic treasures**: Should average 1 per player every 2 weeks
- **Mythic treasures**: Should average 1 per player every 6-7 weeks  
- **Legendary treasures**: Should average 1 per player every 3-4 months
- **Player excitement**: Monitor social sharing of rare finds

### **Urban/Rural Balance**
- **Rural players**: Should achieve 2-3x better treasure odds
- **Engagement parity**: Rural and urban players should have similar session lengths
- **Geographic distribution**: Even spread of active players across regions

### **Station Expiry Impact**
- **Strategic decisions**: Players should maintain 60-70% of claimed stations
- **Continued exploration**: New station discovery rate should remain high
- **Territory optimization**: Players should develop efficient collection routes

## Risk Mitigation

### **Technical Risks**
- **Database migration**: Test expiry schema thoroughly before deployment
- **Performance impact**: Ensure distance calculations don't slow treasure spawning
- **State synchronization**: Verify expiry system works across devices

### **Gameplay Risks**
- **Over-nerfing**: Monitor if legendary treasures become too rare (adjust to 0.5% if needed)
- **Rural overcompensation**: Ensure rural bonuses don't break economy
- **Expiry frustration**: Provide clear warnings and graceful renewal process

### **User Experience Risks**
- **Complexity**: Keep expiry system simple and well-explained
- **Loss aversion**: Make renewal process easy and rewarding
- **Geographic bias**: Monitor for unintended regional imbalances

## Testing Strategy

### **Rarity Testing**
- **Monte Carlo simulation**: Run 10,000 treasure spawns to validate percentages
- **Player simulation**: Test various player types (casual, hardcore, rural, urban)
- **Edge case validation**: Ensure bonuses don't break probability mathematics

### **Balance Testing**
- **Geographic scenarios**: Test Stockholm vs rural Sweden scenarios
- **Distance calculations**: Verify accuracy across different coordinate systems
- **Multiplier stacking**: Ensure all bonuses combine correctly

### **Expiry Testing**
- **Time manipulation**: Test expiry at various time intervals
- **Renewal flows**: Validate all renewal scenarios
- **Data consistency**: Ensure local and cloud state remain synchronized

## Future Enhancements

### **Dynamic Events**
- **Treasure Rush weekends**: Temporary rarity boosts
- **Regional events**: Special treasures in specific areas
- **Seasonal rewards**: Holiday-themed treasure types

### **Social Features**
- **Legendary sharing**: Community celebration of rare finds
- **Territory competition**: Friendly competition over station claims
- **Cooperative exploration**: Group treasure hunts

### **Analytics & Optimization**
- **Machine learning**: Dynamic balance based on player behavior
- **A/B testing**: Continuous optimization of rarity and bonuses
- **Predictive modeling**: Forecast engagement based on treasure distribution

---

## Conclusion

This enhanced treasure system creates a more balanced, engaging, and strategically deep experience that:

1. **Makes rare treasures truly special** through proper rarity distribution
2. **Balances urban and rural experiences** through geographic bonuses
3. **Adds strategic depth** through station expiry and renewal mechanics
4. **Maintains excitement** through randomness with loyalty benefits

The implementation is designed to be iterative, allowing for testing and refinement at each phase while maintaining the core treasure hunting experience that makes ChargeQuest engaging.
