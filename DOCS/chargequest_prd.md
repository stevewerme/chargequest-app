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

### Authentication
- **Supabase Auth** for user management
- **Email/password registration**
- **Social login** (Google, Apple) - nice to have

### Data Storage
- **Local-first development strategy**: AsyncStorage with Zustand persistence for rapid iteration
- **XP progression tracking** locally with robust persistence layer
- **Discovered stations and user progress** stored locally initially
- **Week 6 seamless migration**: Zero-data-loss migration to Supabase cloud sync
- **Migration benefits**: Multi-device support, user analytics, and cloud backup
- **Risk mitigation**: Local state provides reliable fallback and faster development cycles

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

### Level Unlocks
- **Energy Radar**: Distance indicator to nearest undiscovered station
- **Treasure Preview**: See available rewards at discovered stations
- **Explorer's Eye**: Highlight stations not visited in 7+ days
- **Master Tracker**: Personal discovery statistics and heatmap

## Migration Strategy

### Local State Implementation (Week 4-5)
- **XP System**: Implemented in Zustand store with AsyncStorage persistence
- **Robust data structure**: XP, level, discovered stations, and timestamps
- **Real data integration**: Stockholm charging stations with local XP tracking
- **User benefit**: Fast, reliable progression system with instant responsiveness

### Supabase Migration (Week 6)
- **Zero data loss**: Automatic detection and migration of local progress on first cloud login
- **Migration process**: Read local AsyncStorage → Upload to Supabase → Verify sync → Clear local cache
- **Fallback protection**: Local data retained until successful cloud verification
- **Enhanced features**: Multi-device sync, user analytics, and cloud backup unlock

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

### Week 5: Data Integration (Ready - Awaiting API Key)
- [x] Nobil API service implementation with comprehensive Stockholm mock data
- [x] Replace mock data with real Stockholm charging stations (~30 stations ready)
- [x] Integrate real data with existing local XP progression system
- [x] Error handling and loading states with retry logic and caching
- [x] Performance optimization for large datasets with offline fallbacks

### Week 6: Backend Integration & Migration
- [ ] Supabase project setup and authentication
- [ ] Implement zero-data-loss migration from local AsyncStorage to cloud
- [ ] User profiles and cross-device progress synchronization
- [ ] Treasure system with digital rewards
- [ ] Migration testing with existing local user data

### Week 7-8: Launch Preparation
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
- [ ] App successfully builds for both iOS and Android
- [ ] Core gameplay loop is fully functional
- [ ] User can discover minimum 5 stations in Stockholm
- [ ] Authentication and data persistence work reliably
- [ ] Basic treasure system generates and awards vouchers
- [ ] App passed testing with 10+ beta users
- [ ] Performance metrics meet acceptable thresholds

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