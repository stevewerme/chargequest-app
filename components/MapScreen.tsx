import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Alert, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import MapView, { Marker, Region } from 'react-native-maps';
import Svg, { Defs, Mask, Rect, Circle } from 'react-native-svg';
import { useGameStore } from '../stores/gameStore';
import { locationService } from '../services/locationService';

const { width, height } = Dimensions.get('window');

// Fallback region for Töjnan area (used when no location available)
const FALLBACK_REGION = {
  latitude: 59.4235, // Center of user's Töjnan coordinates
  longitude: 17.9342, // Center of user's Töjnan coordinates
  latitudeDelta: 0.008, // Default neighborhood view
  longitudeDelta: 0.008, // Default neighborhood view
};

// Adaptive zoom configuration
const ZOOM_CONFIG = {
  MIN_DELTA: 0.002,    // Tightest zoom - street level
  MAX_DELTA: 0.015,    // Widest zoom - neighborhood view
  DEFAULT_DELTA: 0.008, // Fallback zoom
  NEARBY_RADIUS: 500,   // Consider cells within 500m
  NEARBY_COUNT: 5,      // Use up to 5 nearest cells for zoom calculation
  UPDATE_THRESHOLD: 100, // Only update region if moved 100m+
};

// Note: Energy cells now come from the game store

const mapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#1a1a1a"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#0d1f0d"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#2a2a2a"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#1a1a1a"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#333333"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#1a1a1a"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#2a2a2a"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#0f1419"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  }
];

// Animated Energy Cell Component
interface AnimatedEnergyCellProps {
  isDiscovered: boolean;
  isDiscoverable: boolean;
  isUnlocking: boolean;
  unlockProgress: number;
  stationId: string;
  onUnlock: (stationId: string) => void;
}

function AnimatedEnergyCell({ 
  isDiscovered, 
  isDiscoverable, 
  isUnlocking, 
  unlockProgress, 
  stationId, 
  onUnlock 
}: AnimatedEnergyCellProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isDiscovered && !isUnlocking) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.4,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => pulseAnimation.stop();
    }
  }, [isDiscovered, isUnlocking]);

  useEffect(() => {
    if (isDiscoverable && !isUnlocking) {
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1.8,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      glowAnimation.start();

      return () => glowAnimation.stop();
    }
  }, [isDiscoverable, isUnlocking]);

  const handlePress = () => {
    if (isDiscoverable && !isUnlocking && !isDiscovered) {
      onUnlock(stationId);
    }
  };

  const getEnergyColors = () => {
    if (isDiscovered) return { core: '#0088ff', glow: '#0088ff' };
    if (isDiscoverable) return { core: '#ffaa00', glow: '#ffaa00' };
    return { core: '#00ff88', glow: '#00ff88' };
  };

  const colors = getEnergyColors();

  return (
    <TouchableOpacity 
      style={styles.energyCell} 
      onPress={handlePress}
      disabled={!isDiscoverable || isUnlocking || isDiscovered}
      activeOpacity={0.8}
    >
      <View style={[
        styles.energyCellOuterGlow, 
        { shadowColor: colors.glow },
        isDiscovered && styles.discoveredOuterGlow
      ]} />
      <Animated.View style={[
        styles.energyCellGlow, 
        { 
          shadowColor: colors.glow,
          transform: isDiscoverable ? [{ scale: glowAnim }] : undefined
        },
        isDiscovered && styles.discoveredGlow
      ]} />
      <View style={[
        styles.energyCellCore, 
        { 
          backgroundColor: colors.core,
          shadowColor: colors.core 
        },
        isDiscovered && styles.discoveredCore
      ]} />
      
      {/* Pulse animation for undiscovered stations */}
      {!isDiscovered && !isDiscoverable && (
        <Animated.View 
          style={[
            styles.energyCellPulse,
            {
              borderColor: colors.core,
              transform: [{ scale: pulseAnim }],
            }
          ]} 
        />
      )}

      {/* Unlock progress indicator */}
      {isUnlocking && (
        <View style={styles.unlockProgress}>
          <View 
            style={[
              styles.progressBar,
              { width: `${unlockProgress}%` }
            ]} 
          />
        </View>
      )}

      {/* Discovered indicator */}
      {isDiscovered && (
        <View style={styles.discoveredIndicator} />
      )}

      {/* Discoverable tap hint */}
      {isDiscoverable && !isUnlocking && (
        <View style={styles.tapHint}>
          <Text style={styles.tapHintText}>TAP</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function MapScreen() {
  const { 
    chargingStations, 
    totalDiscovered, 
    initializePermissions, 
    startLocationTracking,
    startUnlock,
    resetProgress,
    currentLocation,
    isLoading,
    error,
    locationPermissionGranted 
  } = useGameStore();

  // Safety check: ensure chargingStations is always an array
  const safeChargingStations = chargingStations || [];
  
  // Dynamic map region state
  const [mapRegion, setMapRegion] = useState<Region>(FALLBACK_REGION);
  const [lastUpdateLocation, setLastUpdateLocation] = useState<{lat: number, lon: number} | null>(null);

  // MapView reference for coordinate conversions
  const mapViewRef = useRef<MapView>(null);

  // Convert GPS coordinates to screen pixels for SVG positioning
  const convertGPSToScreen = (latitude: number, longitude: number) => {
    // Calculate relative position to current map region center
    const latDiff = latitude - mapRegion.latitude;
    const lonDiff = longitude - mapRegion.longitude;
    
    // Convert to screen coordinates
    const screenX = width / 2 + (lonDiff / mapRegion.longitudeDelta) * width;
    const screenY = height / 2 - (latDiff / mapRegion.latitudeDelta) * height;
    
    return { x: screenX, y: screenY };
  };

  // Calculate 50m radius in screen pixels
  const getRevealRadius = () => {
    // 50 meters ≈ ~0.00045 degrees at Sollentuna latitude (59.4°)
    const metersInDegrees = 0.00045;
    const radiusInScreenPixels = (metersInDegrees / mapRegion.latitudeDelta) * height;
    return Math.max(40, Math.min(120, radiusInScreenPixels)); // Clamp between 40-120px
  };

  // Calculate adaptive zoom based on nearby energy cells
  const calculateAdaptiveZoom = (userLat: number, userLon: number) => {
    if (!safeChargingStations.length) return ZOOM_CONFIG.DEFAULT_DELTA;

    // Find nearby stations within radius
    const nearbyStations = safeChargingStations
      .map(station => ({
        ...station,
        distance: locationService.calculateDistance(userLat, userLon, station.latitude, station.longitude)
      }))
      .filter(station => station.distance <= ZOOM_CONFIG.NEARBY_RADIUS)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, ZOOM_CONFIG.NEARBY_COUNT);

    if (nearbyStations.length === 0) return ZOOM_CONFIG.DEFAULT_DELTA;

    // Use the furthest nearby station to determine zoom
    const furthestDistance = nearbyStations[nearbyStations.length - 1].distance;
    
    // Convert distance to zoom level (more distance = wider zoom)
    let zoomDelta;
    if (furthestDistance < 100) zoomDelta = ZOOM_CONFIG.MIN_DELTA;      // Very close - tight zoom
    else if (furthestDistance < 200) zoomDelta = ZOOM_CONFIG.MIN_DELTA * 1.5; // Close - medium-tight
    else if (furthestDistance < 350) zoomDelta = ZOOM_CONFIG.DEFAULT_DELTA;   // Medium distance
    else zoomDelta = ZOOM_CONFIG.MAX_DELTA;                            // Far - wide zoom

    // Clamp to min/max limits
    return Math.max(ZOOM_CONFIG.MIN_DELTA, Math.min(ZOOM_CONFIG.MAX_DELTA, zoomDelta));
  };

  // Update map region when user location changes significantly  
  const updateMapRegion = (userLat: number, userLon: number) => {
    // Check if we should update (moved enough distance)
    if (lastUpdateLocation) {
      const distanceMoved = locationService.calculateDistance(
        lastUpdateLocation.lat, lastUpdateLocation.lon, userLat, userLon
      );
      if (distanceMoved < ZOOM_CONFIG.UPDATE_THRESHOLD) return; // Don't update if haven't moved enough
    }

    const adaptiveZoom = calculateAdaptiveZoom(userLat, userLon);
    
    const newRegion: Region = {
      latitude: userLat,
      longitude: userLon,
      latitudeDelta: adaptiveZoom,
      longitudeDelta: adaptiveZoom,
    };

    setMapRegion(newRegion);
    setLastUpdateLocation({ lat: userLat, lon: userLon });
  };

  useEffect(() => {
    initializePermissions();
  }, []);

  useEffect(() => {
    if (locationPermissionGranted) {
      startLocationTracking();
    }
  }, [locationPermissionGranted]);

  // Update map region when user location changes
  useEffect(() => {
    if (currentLocation && locationPermissionGranted) {
      updateMapRegion(currentLocation.latitude, currentLocation.longitude);
    }
  }, [currentLocation, safeChargingStations.length]); // Also update when stations change (reset)

  const handlePermissionError = () => {
    Alert.alert(
      'Location Permission Required',
      'ChargeQuest needs location access to detect when you\'re near charging stations.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Retry', onPress: initializePermissions }
      ]
    );
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Progress',
      'This will clear all discovered energy cells and reset your progress. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: resetProgress
        }
      ]
    );
  };

  if (error && !locationPermissionGranted) {
    handlePermissionError();
  }

  return (
    <View style={styles.container}>
      {/* Header with discovery counter */}
      <View style={styles.header}>
        <Text style={styles.headerText}>ChargeQuest</Text>
        <Text style={styles.counterText}>
          {totalDiscovered}/{safeChargingStations.length} Energy Cells Discovered
        </Text>
        <Text style={styles.privacyText}>🇪🇺 Privacy-First • Apple Maps</Text>
        
        {/* Temporary Reset Button for Development */}
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>🔄 Reset Progress</Text>
        </TouchableOpacity>
        
        {isLoading && (
          <Text style={styles.statusText}>Initializing...</Text>
        )}
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>

      {/* Map with fog-of-war styling and opacity */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapViewRef}
          style={styles.map}
          region={mapRegion}
          customMapStyle={mapStyle}
          showsUserLocation={locationPermissionGranted}
          showsMyLocationButton={false}
          showsCompass={false}
          toolbarEnabled={false}
        >
          {safeChargingStations.map((station) => (
            <Marker
              key={station.id}
              coordinate={{
                latitude: station.latitude,
                longitude: station.longitude,
              }}
              title={station.title}
              description={station.description}
              anchor={{ x: 0.5, y: 0.5 }}
              centerOffset={{ x: 0, y: 0 }}
            >
              <AnimatedEnergyCell 
                isDiscovered={station.isDiscovered}
                isDiscoverable={station.isDiscoverable}
                isUnlocking={station.isUnlocking}
                unlockProgress={station.unlockProgress}
                stationId={station.id}
                onUnlock={startUnlock}
              />
            </Marker>
          ))}
        </MapView>
      </View>

      {/* Dynamic fog overlay with reveals around discovered stations */}
      <BlurView 
        intensity={12} 
        style={styles.fogOverlay} 
        tint="dark"
        pointerEvents="none"
      >
        <View style={styles.fogGradient} />
        
        {/* SVG Mask for discovered station reveals */}
        <Svg style={StyleSheet.absoluteFill}>
          <Defs>
            <Mask id="fogRevealMask">
              {/* White background = fog visible */}
              <Rect width="100%" height="100%" fill="white" />
              
              {/* Black circles = transparent holes around discovered stations */}
              {safeChargingStations && safeChargingStations.length > 0 && 
                safeChargingStations
                  .filter(station => station && station.isDiscovered)
                  .map(station => {
                    if (!station.latitude || !station.longitude) return null;
                    
                    const screenPos = convertGPSToScreen(station.latitude, station.longitude);
                    const radius = getRevealRadius();
                    
                    // Safety check for valid screen coordinates
                    if (!screenPos || isNaN(screenPos.x) || isNaN(screenPos.y) || isNaN(radius)) {
                      return null;
                    }
                    
                    return (
                      <Circle
                        key={`reveal-${station.id}`}
                        cx={screenPos.x}
                        cy={screenPos.y}
                        r={radius}
                        fill="black" // Black = transparent in mask
                      />
                    );
                  })
                  .filter(Boolean) // Remove any null entries
              }
            </Mask>
          </Defs>
          
          {/* Apply the mask to create fog with holes */}
          <Rect 
            width="100%" 
            height="100%" 
            fill="rgba(5, 15, 25, 0.6)" // Dark fog color
            mask="url(#fogRevealMask)" 
          />
        </Svg>
      </BlurView>

      {/* Additional mystery vignette */}
      <View style={styles.vignette} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerText: {
    color: '#00ff88',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: '#00ff88',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  counterText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 5,
    opacity: 0.8,
  },
  privacyText: {
    color: '#00ff88',
    fontSize: 10,
    marginTop: 2,
    opacity: 0.7,
  },
  mapContainer: {
    flex: 1,
    opacity: 0.7,
  },
  map: {
    width: width,
    height: height,
  },
  energyCell: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  energyCellOuterGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    opacity: 0.1,
  },
  energyCellGlow: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: 'transparent',
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    opacity: 0.4,
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
    zIndex: 10,
  },
  energyCellPulse: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#00ff88',
    opacity: 0.6,
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
  vignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 150,
    borderRadius: width / 2,
  },
  // Discovered station styles
  discoveredOuterGlow: {
    backgroundColor: 'transparent',
    shadowColor: '#0088ff',
    shadowOpacity: 0.6,
    shadowRadius: 20,
    opacity: 0.15,
  },
  discoveredGlow: {
    backgroundColor: 'transparent',
    shadowColor: '#0088ff',
    shadowOpacity: 0.8,
    shadowRadius: 12,
    opacity: 0.5,
  },
  discoveredCore: {
    backgroundColor: '#0088ff',
    shadowColor: '#0088ff',
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  discoveredIndicator: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
    top: 12,
    opacity: 0.9,
  },
  unlockProgress: {
    position: 'absolute',
    bottom: -5,
    left: 5,
    right: 5,
    height: 4, // Increased from 2 to 4 for better visibility
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 2, // Increased from 1 to 2 to match height
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ffaa00',
    borderRadius: 2, // Increased from 1 to 2 to match unlockProgress
  },
  tapHint: {
    position: 'absolute',
    bottom: -15,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 170, 0, 0.8)',
    paddingHorizontal: 6, // Increased from 4 to 6
    paddingVertical: 2, // Increased from 1 to 2
    borderRadius: 4, // Increased from 3 to 4
  },
  tapHintText: {
    color: '#000000',
    fontSize: 12, // Increased from 8 to 12 for better readability
    fontWeight: 'bold',
  },
  // Status text styles
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: 2,
    opacity: 0.7,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 2,
    opacity: 0.9,
  },
  
  // Reset button styles (temporary for development)
  resetButton: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.4)',
  },
  resetButtonText: {
    color: '#ff6b6b',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 