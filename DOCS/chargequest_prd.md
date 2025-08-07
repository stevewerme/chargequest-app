r# ChargeQuest MVP - Product Requirements Document

## Overview
ChargeQuest transforms EV charging into an engaging treasure hunt game. Users explore Stockholm's charging network by unlocking stations on a fog-of-war map and claiming digital rewards.

## Business Objective
Prove that gamification increases charging frequency among Recharge users by 25%+ within 8 weeks, leading to a **19,995 SEK/month + 5 SEK/active user** SaaS partnership.

## Target Users
- **Primary**: EV drivers in Stockholm who charge 2-6 times per year
- **Focus**: Recharge network users (opportunity to discover more stations)
- **MVP Goal**: 200 active users in 4 weeks

## Core Features

### 1. Fog-of-War Map
- **Black map background** covering Stockholm area
- **Glowing energy cells** marking charging station locations
- **GPS-triggered unlock** when user comes within 25m of station
- **Permanent area reveal** once station is discovered
- **Progress tracking**: "X/50 stations discovered"

### 2. Station Discovery System
- **Real-time location detection** using device GPS
- **Unlock animation** when approaching energy cell
- **Station information display** after unlock (name, type, availability)
- **Achievement badges** for discovery milestones

### 3. Digital Treasure System
- **One treasure per unlocked station** (digital vouchers)
- **Treasure types**: Coffee vouchers (10-25 SEK), retail discounts (50 SEK), premium rewards (100+ SEK)
- **Weekly respawn** of treasures on all discovered stations
- **Instant redemption** via QR codes or voucher codes

### 4. XP Progression & User Profile
- **XP System**: Discovery actions grant experience points (100 XP per station + bonuses)
- **Level progression**: 5 levels with meaningful unlocks enhancing exploration
- **Discovery counter**: Stations unlocked out of total with XP progress bar
- **Level unlocks**: Energy Radar, Treasure Preview, Explorer's Eye, Master Tracker
- **Personal map** showing all discovered areas with progression statistics

### 5. Push Notifications
- **Weekly treasure alerts**: "3 new treasures available at your discovered stations"
- **Discovery encouragement**: "New energy cell detected nearby"
- **Achievement notifications**

## Technical Requirements

### Data Source
- **Nobil API** for real-time charging station data
  - Endpoint: `https://nobil.no/api/server/search.php`
  - Parameters: `country=SE`, `municipality=Stockholm`, `format=json`
- **Filter**: Recharge network operators only
- **Coverage**: Stockholm metropolitan area (~50 stations)

### Platform
- **React Native + Expo** for cross-platform development
- **iOS and Android** support
- **GPS location services** with background capability

### Authentication ✅
- **Supabase Auth** for user management
- **Native Apple Sign-In** - Fully implemented with HIG compliance
- **Professional login screen** with ChargeQuest branding and map preview
- **Logout functionality** with progress preservation

### Data Storage
- **Local-first development strategy**: AsyncStorage with Zustand persistence for rapid iteration
- **XP progression tracking** locally with robust persistence layer
- **Discovered stations and user progress** stored locally initially
- **Week 6 seamless migration**: Zero-data-loss migration to Supabase cloud sync
- **Migration benefits**: Multi-device support, user analytics, and cloud backup
- **Risk mitigation**: Local state provides reliable fallback and faster development cycles

### Database Schema (Supabase)
```sql
-- Core tables for user progress and discoveries
user_progress (user_id, total_xp, current_level, discovered_stations[])
station_discoveries (user_id, station_id, discovered_at, xp_awarded, bonus_type)

-- Treasure System Implementation (Option A - Minimal Viable Schema)
user_treasure_state (
  user_id, 
  total_collected, common_collected, rare_collected, super_rare_collected,
  epic_collected, mythic_collected, legendary_collected,
  equipped_slot1, equipped_slot2, equipped_slot3,
  current_week_id, last_treasure_refresh,
  created_at, updated_at
)

-- Future expansion (Option B)
user_treasure_collections (user_id, treasure_id, rarity, collected_at, ...) -- Future analytics
```
- **Row Level Security**: User data isolation with Supabase Auth integration
- **Real-time sync**: Multi-device progress synchronization including treasure stats and equipped tools
- **Treasure system**: Fully implemented with Brawl Stars rarity system and cloud sync
- **Tool equipment**: Cross-device tool slot synchronization

### Key Dependencies
```json
{
  "react-native-maps": "latest",
  "expo-location": "latest",
  "@react-native-async-storage/async-storage": "latest (primary storage Week 4-5)",  
  "expo-haptics": "latest",
  "zustand": "latest (with persist middleware)",
  "@supabase/supabase-js": "latest (Week 6 migration)"
}
```

### Development Tooling (MCP Integration)
- **Direct Database Access**: `mcp_supabase_apply_migration` for schema management
- **Real-time SQL Execution**: `mcp_supabase_execute_sql` for testing and debugging
- **Type Generation**: `mcp_supabase_generate_typescript_types` for automatic type safety
- **Monitoring**: `mcp_supabase_get_logs` and `mcp_supabase_get_advisors` for development insights
- **Rapid Iteration**: Direct database operations without leaving development environment

## XP Progression System

### XP Sources
- **New station discovered**: +100 XP (core action)
- **Area bonus**: +200 XP (first discovery in new neighborhood)
- **Weekend discovery**: +50 XP (encourages off-peak exploration)
- **Future - Charging session**: +500 XP (actual charging detected)

### Level Progression (5 Levels MVP)
- **Level 1** (0 XP): "Energy Seeker" - Starting level
- **Level 2** (300 XP): "Grid Explorer" - Unlocks Energy Radar
- **Level 3** (800 XP): "Charge Hunter" - Unlocks Treasure Preview
- **Level 4** (1500 XP): "Power Tracker" - Unlocks Explorer's Eye
- **Level 5** (2500 XP): "Energy Master" - Unlocks Master Tracker

### Level Unlocks (Tool System Implementation)
- **Energy Radar** (Level 2): Distance indicator to nearest undiscovered station - Equipped via tool slot 1
- **Treasure Preview** (Level 3): See available rewards at discovered stations - Equipped via tool slot 2  
- **Explorer's Eye** (Level 4): Highlight stations not visited in 7+ days - Equipped via tool slot 3
- **Master Tracker** (Level 5): Personal discovery statistics and heatmap - Advanced analytics overlay

## Migration Strategy

### Local State Implementation (Week 4-5)
- **XP System**: Implemented in Zustand store with AsyncStorage persistence
- **Robust data structure**: XP, level, discovered stations, and timestamps
- **Real data integration**: Stockholm charging stations with local XP tracking
- **User benefit**: Fast, reliable progression system with instant responsiveness

### Supabase Migration (Week 6 - MCP Enhanced)
- **MCP-Powered Setup**: Direct database schema creation using `mcp_supabase_apply_migration`
- **Zero data loss**: Automatic detection and migration of local progress on first cloud login
- **Migration process**: Read local AsyncStorage → Upload via MCP tools → Verify sync → Clear local cache
- **Real-time debugging**: Use `mcp_supabase_get_logs` and `mcp_supabase_execute_sql` for development
- **Enhanced features**: Multi-device sync, user analytics, cloud backup, and treasure system foundation

## User Journey

### First-Time User
1. Download app, create account (Level 1: "Energy Seeker")
2. See black map with mysterious glowing points and XP progress bar
3. Drive to nearest energy cell (charging station)
4. Unlock first area, gain +100 XP, claim first treasure
5. Understand discovery mechanic and XP progression toward Level 2

### Returning User
1. Open app, see weekly treasure notification and XP progress
2. Check map for discovered stations with new treasures (if Level 3+)
3. Plan route to collect treasures and gain additional XP
4. Discover new stations for XP bonuses and level progression

## Success Metrics

### Primary KPIs
- **Active users**: 200+ within 4 weeks
- **Station discovery rate**: Average 5+ stations per user
- **Retention**: 60%+ weekly active users
- **Charging behavior**: 25%+ increase in sessions per user

### Secondary Metrics
- **XP progression**: Average user reaches Level 3+ within 2 weeks
- **Level distribution**: 60%+ of active users at Level 2 or higher
- **Treasure redemption rate**: 70%+ of claimed treasures used
- **App session duration**: 2+ minutes average
- **Geographic spread**: Users discovering stations across Stockholm

## User Stories

### Core MVP User Stories
1. **As an EV driver**, I want to see a mysterious map of Stockholm so that I'm curious about what energy cells represent
2. **As an EV driver**, I want to unlock areas by visiting charging stations so that I feel like I'm exploring and discovering
3. **As an EV driver**, I want to claim digital treasures at stations so that I have an immediate reward for visiting
4. **As an EV driver**, I want to earn XP and level up from discoveries so that I feel continuous progression and unlock helpful exploration features
5. **As an EV driver**, I want to receive notifications about new treasures so that I'm reminded to return to discovered stations

### Technical User Stories
1. **As a developer**, I want to fetch charging station data from Nobil API so that the app shows real station locations
2. **As a developer**, I want to detect user proximity to stations so that areas unlock automatically
3. **As a developer**, I want to persist user progress so that discoveries remain after app restarts
4. **As a developer**, I want to send push notifications so that users are re-engaged weekly

## Non-Goals for MVP
- ❌ Complex point systems or levels
- ❌ Social features or leaderboards  
- ❌ Real-money transactions
- ❌ Multiple charging networks
- ❌ Advanced AR features
- ❌ Offline map downloads
- ❌ Route planning integration
- ❌ Complex backend infrastructure blocking core gameplay development

## Development Timeline

### Week 1-2: Foundation ✅
- [x] Expo project setup with TypeScript
- [x] React Native Maps with Google Maps integration
- [x] Fog-of-war map styling with atmospheric effects
- [x] Animated energy cell markers with glowing effects
- [x] Basic app structure and navigation

### Week 3: Core Gameplay ✅
- [x] GPS permissions and location tracking setup
- [x] Proximity detection system (25m trigger radius)
- [x] Local state management with Zustand + AsyncStorage
- [x] Station unlock functionality and animations
- [x] Progress tracking with persistent storage

### Week 4: Enhanced Experience ✅
- [x] Unlock animations and haptic feedback
- [x] Area reveal effects after discovery
- [x] XP progression system with 5 levels and exploration-focused unlocks (local AsyncStorage)
- [x] Polish gameplay mechanics and UX with NES-inspired pixel art interface

### Week 5: Data Integration ✅
- [x] Nobil API service implementation with comprehensive Stockholm mock data
- [x] Replace mock data with real Stockholm charging stations (~30 stations ready)
- [x] Integrate real data with existing local XP progression system
- [x] Error handling and loading states with retry logic and caching
- [x] Performance optimization for large datasets with offline fallbacks
- [x] **API Key Integration** - Live Nobil API fully integrated with location-based filtering
- [x] **Location Intelligence** - Nearest 10 stations discovery with smart map bounds

### Week 6: Backend Integration & Migration (Using Supabase MCP) ✅
- [x] **6A: Database Setup** - Schema creation using `mcp_supabase_apply_migration`
- [x] **6B: Authentication** - Supabase Auth integration with email/password
- [x] **6C: Data Sync** - Zero-data-loss migration with conflict resolution
- [x] **6D: Testing** - Multi-device sync and performance validation
- [x] **Treasure System Foundation** - Database schema for future rewards system

### Week 7: Authentication System Mastery & UX Polish ✅
- [x] **7A: Apple Sign-In** - Native AppleAuthentication.AppleAuthenticationButton implementation
- [x] **7B: Login Screen Redesign** - Professional ChargeQuest branding with map background
- [x] **7C: Apple Developer Console** - JWT token generation and OAuth configuration
- [x] **7D: Logout System** - Complete authentication flow with progress preservation
- [x] **7E: UX Bug Fixes** - Resolved unlock button z-index issues and popover positioning

### Week 8: Live Data Integration & Location Intelligence ✅
- [x] **8A: Nobil API v3 Integration** - Rectangle-based search with Stockholm bounding box coordinates
- [x] **8B: Location-Based Discovery** - Nearest 10 stations filtering with GPS distance calculation
- [x] **8C: Smart Map Auto-Zoom** - Automatic bounds calculation and optimal view framing
- [x] **8D: Enhanced Error Handling** - Comprehensive validation and debugging pipeline
- [x] **8E: Performance Optimization** - Reduced data load with intelligent caching

### Week 8.5: Claim Process Enhancement ✅
- [x] **8.5A: Map Centering** - Station tap centers and locks map focus with smooth animation
- [x] **8.5B: Hold-to-Claim Interaction** - Professional 1.7-second hold-to-claim with progress feedback
- [x] **8.5C: Proximity Integration** - Distance-based claiming using existing 25m isDiscoverable logic
- [x] **8.5D: Haptic & Visual Feedback** - Start/completion haptics and dynamic button styling
- [x] **8.5E: State Management** - Robust interaction handling with cleanup and interruption recovery

### Week 9: Popover System Mastery & UI Excellence ✅
- [x] **9A: Three-State Popover Redesign** - Undiscovered/Claimable/Claimed states with distinct visual hierarchy
- [x] **9B: Status Color Psychology** - Red/Purple/Green border theming with uniform white text for readability
- [x] **9C: Integrated Progress Indicators** - Hold-to-claim progress inside button with backdrop dimming focus
- [x] **9D: Professional Iconography** - Replaced emoji locks with Iconoir vector icons for cross-platform consistency
- [x] **9E: Interaction Polish** - Optimized positioning, tap-to-close, and spatial relationship improvements

### Week 10: Treasure System & Tool Implementation ✅
- [x] **10A: Treasure Data Foundation** - Brawl Stars 6-tier rarity system with Swedish reward catalog
- [x] **10B: Supabase Schema Extension** - user_treasure_state table with RLS policies and cloud sync
- [x] **10C: Treasure Collection Mechanics** - Proximity-based collection with rarity-based haptic feedback
- [x] **10D: Tool System Foundation** - Equipment slots with level-based unlocks and cloud synchronization
- [x] **10E: Weekly Reset System** - Automatic treasure respawn with Sunday reset functionality

### Week 10.5: Treasure UX Excellence & Visual Polish ✅
- [x] **10.5A: Progressive Disclosure System** - Distance-based treasure information reveal (teaser vs full details)
- [x] **10.5B: Professional Iconography** - Iconoir Lock icons replacing emojis with rarity-colored theming
- [x] **10.5C: Pixel Art Treasure Gems** - 3D beveled gems on map markers with rarity-based coloring
- [x] **10.5D: Toast Notification System** - Collection feedback with pixel art styling and auto-dismiss
- [x] **10.5E: Smooth Signin Flow** - Single-stage zoom eliminating jarring bounce animation

### Week 11: Tool Selection & Equipment Interface ✅
- [x] **11A: Tool Selection Modal Foundation** - Professional modal interface with backdrop dimming and pixel art styling
- [x] **11B: Horizontal Tool Discovery** - Scrollable tool cards with level-based unlocks and Iconoir professional icons
- [x] **11C: Unequip-First Workflow** - Clear equipment status with prominent red UNEQUIP buttons and state management
- [x] **11D: Equipment State Synchronization** - Fixed critical bug preventing UNEQUIP button visibility (key mismatch resolution)
- [x] **11E: Modal Persistence & UX Polish** - Modal stays open for seamless tool switching with specific slot messaging

### Week 12: Launch Preparation
- [ ] Push notification system
- [ ] Beta testing with real users
- [ ] Performance monitoring and optimization
- [ ] App store preparation and submission

## Risk Mitigation

### Technical Risks
- **GPS accuracy**: Test proximity detection thoroughly in various conditions
- **Battery drain**: Optimize location tracking for minimal impact
- **API reliability**: Implement caching and fallback mechanisms
- **Performance**: Test with large datasets and optimize rendering

### Business Risks
- **User adoption**: Focus on clear onboarding and immediate value demonstration
- **Partner interest**: Validate concept with charging operators early
- **Competition**: Monitor existing gamification apps in mobility space

### Data Considerations
- **Privacy**: Clear location data usage policies
- **GDPR compliance**: Proper consent and data handling
- **API limits**: Respect Nobil API rate limits and caching

## Definition of Done
- [x] App successfully builds for both iOS and Android
- [x] Core gameplay loop is fully functional
- [x] User can discover minimum 5 stations in Stockholm
- [x] Authentication and data persistence work reliably
- [x] Basic treasure system generates and awards vouchers
- [x] Tool system with level-based unlocks implemented
- [x] Multi-device cloud synchronization for all user data
- [x] UI integration for treasure collection (progressive disclosure, toast notifications, pixel art gems)
- [x] UI integration for tool selection modal and equipment interface
- [ ] App passed testing with 10+ beta users
- [ ] Performance metrics meet acceptable thresholds

## Current Status (Week 11.0 Complete)
- ✅ **Authentication System**: Native Apple Sign-In fully functional
- ✅ **Core Gameplay**: Discovery, XP progression, level unlocks working
- ✅ **Data Persistence**: Local storage with comprehensive cloud sync capability
- ✅ **Professional UX**: Polished login screen and interaction flows
- ✅ **Live Data Integration**: Nobil API v3 with Stockholm charging stations
- ✅ **Location Intelligence**: User-centered discovery with nearest 10 stations
- ✅ **Smart Map Features**: Auto-zoom and optimal bounds calculation
- ✅ **Claim Process**: Hold-to-claim mechanics with map centering and haptic feedback
- ✅ **Popover System Excellence**: Three-state status hierarchy with professional UI polish
- ✅ **Visual Identity**: Status-based color psychology and consistent iconography
- ✅ **Interaction Design**: Backdrop dimming, integrated progress indicators, optimized positioning
- ✅ **Treasure System Foundation**: Brawl Stars 6-tier rarity system with Swedish rewards and cloud sync
- ✅ **Tool System Architecture**: Level-based unlocks with equipment slots and multi-device synchronization
- ✅ **Weekly Reset System**: Automatic treasure respawn with Sunday reset functionality
- ✅ **Treasure UX Excellence**: Progressive disclosure system with professional icons and pixel art gems
- ✅ **Collection Experience**: Toast notifications, 3D treasure gems, smooth signin flow
- ✅ **Tool Selection Interface**: Professional equipment modal with horizontal scrolling and persistent state
- ✅ **Equipment Management**: Unequip-first workflow with visual feedback and state synchronization
- ✅ **Enhanced Rarity Distribution**: Epic 5%, Mythic 1.5%, Legendary 0.3% for truly special rare finds
- ✅ **Urban/Rural Balance System**: Distance and density bonuses ensuring fair gameplay across geographic areas
- ✅ **Geographic Fairness**: Rural players receive up to 2.25x better treasure odds rewarding exploration effort
- ✅ **Station Expiry System**: 90-day claim duration with renewal mechanics and loyalty bonuses
- ✅ **Strategic Territory Management**: Players must choose which stations to maintain
- ✅ **Supabase Cloud Sync**: Multi-device territory management with real-time synchronization
- ✅ **Conflict Resolution**: Smart server-authoritative expiry handling with latest-timestamp-wins updates
- ✅ **Migration System**: Seamless local-to-cloud transition with zero data loss
- ✅ **Player-Centric Avatar System**: Professional gaming profile with real-time XP progress and achievement showcase
- ✅ **Territory Management Hub**: Strategic overview of claimed stations with expiry dashboard and renewal planning
- ✅ **Gaming Psychology Integration**: Achievement badges, milestone tracking, and strategic progression interface
- ✅ **Developer Mode Isolation**: 5-tap gesture toggle for clean production experience with full debug access
- ⏳ **Next Phase**: Performance optimization and beta launch preparation

## 🛠️ **Manual Implementation Steps**

### **Step 1: Install MapLibre**
```bash
npx expo install @maplibre/maplibre-react-native
```

### **Step 2: Create MapLibre Component**
Create a new file `components/MapLibreScreen.tsx` with this content:

```typescript
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { useGameStore } from '../stores/gameStore';

const { width, height } = Dimensions.get('window');

// MapLibre requires null token (not using Mapbox)
MapLibreGL.setAccessToken(null);

// GDPR-friendly map style using OpenStreetMap data
const MAPLIBRE_STYLE = {
  version: 8,
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-background',
      type: 'background',
      paint: {
        'background-color': '#000000',
      },
    },
    {
      id: 'osm-tiles-layer',
      type: 'raster',
      source: 'osm-tiles',
      paint: {
        'raster-opacity': 0.1, // Very low opacity for fog-of-war effect
        'raster-contrast': -0.8,
        'raster-brightness-min': 0,
        'raster-brightness-max': 0.3,
      },
    },
  ],
};

export default function MapLibreScreen() {
  const { 
    chargingStations, 
    totalDiscovered, 
    initializePermissions, 
    startLocationTracking,
    isLoading,
    error,
    locationPermissionGranted,
    currentLocation
  } = useGameStore();

  useEffect(() => {
    initializePermissions();
  }, []);

  useEffect(() => {
    if (locationPermissionGranted) {
      startLocationTracking();
    }
  }, [locationPermissionGranted]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>ChargeQuest</Text>
        <Text style={styles.counterText}>
          {totalDiscovered}/{chargingStations.length} Energy Cells Discovered
        </Text>
        <Text style={styles.privacyText}>🇪🇺 GDPR-Compliant • OpenStreetMap</Text>
      </View>

      {/* MapLibre with fog-of-war styling */}
      <MapLibreGL.MapView
        style={styles.map}
        styleJSON={JSON.stringify(MAPLIBRE_STYLE)}
        logoEnabled={false}
        attributionEnabled={true}
      >
        <MapLibreGL.Camera
          centerCoordinate={[18.0686, 59.3293]} // [longitude, latitude]
          zoomLevel={11}
        />

        {/* Energy cells as markers */}
        {chargingStations.map((station) => (
          <MapLibreGL.PointAnnotation
            key={station.id}
            id={`station-${station.id}`}
            coordinate={[station.longitude, station.latitude]}
          >
            <View style={styles.energyCell}>
              <View style={styles.energyCellCore} />
            </View>
          </MapLibreGL.PointAnnotation>
        ))}
      </MapLibreGL.MapView>

      {/* Atmospheric effects */}
      <BlurView intensity={12} style={styles.fogOverlay} tint="dark" pointerEvents="none">
        <View style={styles.fogGradient} />
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
  },
  headerText: {
    color: '#00ff88',
    fontSize: 24,
    fontWeight: 'bold',
  },
  counterText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 5,
  },
  privacyText: {
    color: '#00ff88',
    fontSize: 10,
    marginTop: 2,
    opacity: 0.7,
  },
  map: { flex: 1 },
  energyCell: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  energyCellCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00ff88',
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  fogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
    opacity: 0.4,
  },
  fogGradient: {
    flex: 1,
    backgroundColor: 'rgba(5, 15, 25, 0.3)',
  },
});