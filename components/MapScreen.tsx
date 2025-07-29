import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Alert, TouchableOpacity } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useGameStore } from '../stores/gameStore';
import { locationService } from '../services/locationService';

const { width, height } = Dimensions.get('window');

// Exact recreation of user's reference character
const PixelArtCharacter = () => {
  return (
    <View style={styles.pixelCharacter}>
      {/* Row 1 - Hair top with outline */}
      <View style={styles.characterRow}>
        <View style={[styles.pixel, styles.transparent]} />
        <View style={[styles.pixel, styles.transparent]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.transparent]} />
        <View style={[styles.pixel, styles.transparent]} />
      </View>
      
      {/* Row 2 - Hair outline and brown */}
      <View style={styles.characterRow}>
        <View style={[styles.pixel, styles.transparent]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.pixelBrownDark]} />
        <View style={[styles.pixel, styles.pixelBrownLight]} />
        <View style={[styles.pixel, styles.pixelBrownDark]} />
        <View style={[styles.pixel, styles.pixelBrownLight]} />
        <View style={[styles.pixel, styles.pixelBrownDark]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.transparent]} />
      </View>
      
      {/* Row 3 - More hair */}
      <View style={styles.characterRow}>
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.pixelBrownDark]} />
        <View style={[styles.pixel, styles.pixelBrownLight]} />
        <View style={[styles.pixel, styles.pixelBrownDark]} />
        <View style={[styles.pixel, styles.pixelBrownLight]} />
        <View style={[styles.pixel, styles.pixelBrownDark]} />
        <View style={[styles.pixel, styles.pixelBrownLight]} />
        <View style={[styles.pixel, styles.pixelBrownDark]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
      </View>
      
      {/* Row 4 - Forehead */}
      <View style={styles.characterRow}>
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.pixelSkinLight]} />
        <View style={[styles.pixel, styles.pixelSkin]} />
        <View style={[styles.pixel, styles.pixelSkinLight]} />
        <View style={[styles.pixel, styles.pixelSkin]} />
        <View style={[styles.pixel, styles.pixelSkinLight]} />
        <View style={[styles.pixel, styles.pixelSkin]} />
        <View style={[styles.pixel, styles.pixelSkinLight]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
      </View>
      
      {/* Row 5 - Eyes */}
      <View style={styles.characterRow}>
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.pixelSkinLight]} />
        <View style={[styles.pixel, styles.pixelBlack]} />
        <View style={[styles.pixel, styles.pixelBlack]} />
        <View style={[styles.pixel, styles.pixelSkin]} />
        <View style={[styles.pixel, styles.pixelBlack]} />
        <View style={[styles.pixel, styles.pixelBlack]} />
        <View style={[styles.pixel, styles.pixelSkinLight]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
      </View>
      
      {/* Row 6 - Nose/mouth */}
      <View style={styles.characterRow}>
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.pixelSkinLight]} />
        <View style={[styles.pixel, styles.pixelSkin]} />
        <View style={[styles.pixel, styles.pixelSkinDark]} />
        <View style={[styles.pixel, styles.pixelSkinDark]} />
        <View style={[styles.pixel, styles.pixelSkinDark]} />
        <View style={[styles.pixel, styles.pixelSkin]} />
        <View style={[styles.pixel, styles.pixelSkinLight]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
      </View>
      
      {/* Row 7 - Shirt top */}
      <View style={styles.characterRow}>
        <View style={[styles.pixel, styles.transparent]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.pixelRedDark]} />
        <View style={[styles.pixel, styles.pixelRed]} />
        <View style={[styles.pixel, styles.pixelRedLight]} />
        <View style={[styles.pixel, styles.pixelRed]} />
        <View style={[styles.pixel, styles.pixelRedDark]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.transparent]} />
      </View>
      
      {/* Row 8 - Shirt middle */}
      <View style={styles.characterRow}>
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.pixelRedLight]} />
        <View style={[styles.pixel, styles.pixelRed]} />
        <View style={[styles.pixel, styles.pixelRedLight]} />
        <View style={[styles.pixel, styles.pixelRed]} />
        <View style={[styles.pixel, styles.pixelRedLight]} />
        <View style={[styles.pixel, styles.pixelRed]} />
        <View style={[styles.pixel, styles.pixelRedLight]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
      </View>
      
      {/* Row 9 - Arms/shirt */}
      <View style={styles.characterRow}>
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.pixelSkinLight]} />
        <View style={[styles.pixel, styles.pixelRedDark]} />
        <View style={[styles.pixel, styles.pixelRed]} />
        <View style={[styles.pixel, styles.pixelRedLight]} />
        <View style={[styles.pixel, styles.pixelRed]} />
        <View style={[styles.pixel, styles.pixelRedDark]} />
        <View style={[styles.pixel, styles.pixelSkinLight]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
      </View>
      
      {/* Row 10 - Shirt bottom */}
      <View style={styles.characterRow}>
        <View style={[styles.pixel, styles.transparent]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.pixelTealDark]} />
        <View style={[styles.pixel, styles.pixelTeal]} />
        <View style={[styles.pixel, styles.pixelTealLight]} />
        <View style={[styles.pixel, styles.pixelTeal]} />
        <View style={[styles.pixel, styles.pixelTealDark]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.transparent]} />
      </View>
      
      {/* Row 11 - Pants top */}
      <View style={styles.characterRow}>
        <View style={[styles.pixel, styles.transparent]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.pixelTeal]} />
        <View style={[styles.pixel, styles.pixelTealLight]} />
        <View style={[styles.pixel, styles.transparent]} />
        <View style={[styles.pixel, styles.pixelTealLight]} />
        <View style={[styles.pixel, styles.pixelTeal]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.transparent]} />
      </View>
      
      {/* Row 12 - Pants middle */}
      <View style={styles.characterRow}>
        <View style={[styles.pixel, styles.transparent]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.pixelTealDark]} />
        <View style={[styles.pixel, styles.pixelTeal]} />
        <View style={[styles.pixel, styles.transparent]} />
        <View style={[styles.pixel, styles.pixelTeal]} />
        <View style={[styles.pixel, styles.pixelTealDark]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.transparent]} />
      </View>
      
      {/* Row 13 - Pants bottom */}
      <View style={styles.characterRow}>
        <View style={[styles.pixel, styles.transparent]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.pixelTeal]} />
        <View style={[styles.pixel, styles.pixelTealLight]} />
        <View style={[styles.pixel, styles.transparent]} />
        <View style={[styles.pixel, styles.pixelTealLight]} />
        <View style={[styles.pixel, styles.pixelTeal]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.transparent]} />
      </View>
      
      {/* Row 14 - Shoes */}
      <View style={styles.characterRow}>
        <View style={[styles.pixel, styles.transparent]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.transparent]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.transparent]} />
      </View>
    </View>
  );
};

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
        "color": "#0a0a0a" // Much darker for mysterious exploration feel
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

  useEffect(() => {
    if (!isDiscovered && !isUnlocking) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
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

      return () => {
        pulseAnimation.stop();
        pulseAnim.setValue(1); // Reset to default scale
      };
    } else {
      // Reset animation when not pulsing
      pulseAnim.setValue(1);
    }
  }, [isDiscovered, isUnlocking, pulseAnim]);

  const handlePress = () => {
    if (isDiscoverable && !isUnlocking && !isDiscovered) {
      onUnlock(stationId);
    }
  };

  const getCrystalColors = () => {
    if (isDiscovered) return { base: '#0088ff', light: '#00aaff', dark: '#0066cc' };
    if (isDiscoverable) return { base: '#ffdd00', light: '#ffff44', dark: '#ffaa00' }; // Much brighter yellow
    return { base: '#00ff88', light: '#33ffaa', dark: '#00cc66' };
  };

  const colors = getCrystalColors();
  
  // Use conditional pixel sizing for different crystal sizes
  const pixelStyle = isDiscovered ? styles.crystalPixelDiscovered : styles.crystalPixel;

  return (
    <TouchableOpacity onPress={handlePress} style={styles.energyCell}>
      {/* Enhanced discoverable glow effect */}
      {isDiscoverable && !isDiscovered && (
        <Animated.View style={[
          styles.discoverableGlow,
          { transform: [{ scale: pulseAnim }] }
        ]} />
      )}
      
      <Animated.View style={[
        isDiscovered ? styles.pixelCrystalDiscovered : styles.pixelCrystal,
        { transform: [{ scale: pulseAnim }] }
      ]}>
        {/* High-res Pixel Art Crystal matching character resolution */}
        
        {/* Row 1 - Top point with outline */}
        <View style={styles.crystalRow}>
          <View style={[pixelStyle, styles.crystalTransparent]} />
          <View style={[pixelStyle, styles.crystalTransparent]} />
          <View style={[pixelStyle, styles.crystalTransparent]} />
          <View style={[pixelStyle, { backgroundColor: '#000000' }]} />
          <View style={[pixelStyle, styles.crystalTransparent]} />
          <View style={[pixelStyle, styles.crystalTransparent]} />
          <View style={[pixelStyle, styles.crystalTransparent]} />
        </View>
        
        {/* Row 2 - Upper outline */}
        <View style={styles.crystalRow}>
          <View style={[pixelStyle, styles.crystalTransparent]} />
          <View style={[pixelStyle, styles.crystalTransparent]} />
          <View style={[pixelStyle, { backgroundColor: '#000000' }]} />
          <View style={[pixelStyle, { backgroundColor: colors.light }]} />
          <View style={[pixelStyle, { backgroundColor: '#000000' }]} />
          <View style={[pixelStyle, styles.crystalTransparent]} />
          <View style={[pixelStyle, styles.crystalTransparent]} />
        </View>
        
        {/* Row 3 - Upper crystal */}
        <View style={styles.crystalRow}>
          <View style={[pixelStyle, styles.crystalTransparent]} />
          <View style={[pixelStyle, { backgroundColor: '#000000' }]} />
          <View style={[pixelStyle, { backgroundColor: colors.light }]} />
          <View style={[pixelStyle, { backgroundColor: colors.base }]} />
          <View style={[pixelStyle, { backgroundColor: colors.dark }]} />
          <View style={[pixelStyle, { backgroundColor: '#000000' }]} />
          <View style={[pixelStyle, styles.crystalTransparent]} />
        </View>
        
        {/* Row 4 - Middle crystal */}
        <View style={styles.crystalRow}>
          <View style={[pixelStyle, { backgroundColor: '#000000' }]} />
          <View style={[pixelStyle, { backgroundColor: colors.light }]} />
          <View style={[pixelStyle, { backgroundColor: colors.base }]} />
          <View style={[pixelStyle, { backgroundColor: colors.base }]} />
          <View style={[pixelStyle, { backgroundColor: colors.base }]} />
          <View style={[pixelStyle, { backgroundColor: colors.dark }]} />
          <View style={[pixelStyle, { backgroundColor: '#000000' }]} />
        </View>
        
        {/* Row 5 - Lower crystal */}
        <View style={styles.crystalRow}>
          <View style={[pixelStyle, styles.crystalTransparent]} />
          <View style={[pixelStyle, { backgroundColor: '#000000' }]} />
          <View style={[pixelStyle, { backgroundColor: colors.dark }]} />
          <View style={[pixelStyle, { backgroundColor: colors.base }]} />
          <View style={[pixelStyle, { backgroundColor: colors.dark }]} />
          <View style={[pixelStyle, { backgroundColor: '#000000' }]} />
          <View style={[pixelStyle, styles.crystalTransparent]} />
        </View>
        
        {/* Row 6 - Lower outline */}
        <View style={styles.crystalRow}>
          <View style={[pixelStyle, styles.crystalTransparent]} />
          <View style={[pixelStyle, styles.crystalTransparent]} />
          <View style={[pixelStyle, { backgroundColor: '#000000' }]} />
          <View style={[pixelStyle, { backgroundColor: colors.dark }]} />
          <View style={[pixelStyle, { backgroundColor: '#000000' }]} />
          <View style={[pixelStyle, styles.crystalTransparent]} />
          <View style={[pixelStyle, styles.crystalTransparent]} />
        </View>
        
        {/* Row 7 - Bottom point */}
        <View style={styles.crystalRow}>
          <View style={[pixelStyle, styles.crystalTransparent]} />
          <View style={[pixelStyle, styles.crystalTransparent]} />
          <View style={[pixelStyle, styles.crystalTransparent]} />
          <View style={[pixelStyle, { backgroundColor: '#000000' }]} />
          <View style={[pixelStyle, styles.crystalTransparent]} />
          <View style={[pixelStyle, styles.crystalTransparent]} />
          <View style={[pixelStyle, styles.crystalTransparent]} />
        </View>
        
        {/* High-res Progress Bar */}
        {isUnlocking && (
          <View style={styles.pixelProgressContainer}>
            {/* Pixel-style progress bar with outline */}
            <View style={styles.pixelProgressOutline}>
              <View style={styles.pixelProgressBar}>
                <View 
                  style={[
                    styles.pixelProgressFill, 
                    { width: `${unlockProgress * 100}%` }
                  ]} 
                />
              </View>
            </View>
            <View style={styles.pixelTapHint}>
              <Text style={styles.pixelTapText}>TAP</Text>
            </View>
          </View>
        )}
        
        {/* Discovered indicator */}
        {isDiscovered && (
          <View style={styles.pixelDiscoveredIndicator} />
        )}
      </Animated.View>
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

  // Get discovered stations for reveals  
  const getDiscoveredStations = () => {
    return safeChargingStations.filter(s => s.isDiscovered);
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

  const handleCenterOnUser = () => {
    if (currentLocation) {
      const newRegion = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      };
      setMapRegion(newRegion);
    }
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
        
        {/* Pixel art buttons */}
        <View style={styles.buttonRow}>
          {/* Reset Progress Button */}
          <TouchableOpacity style={styles.pixelButton} onPress={handleReset}>
            <View style={styles.pixelButtonBorder}>
              <Text style={styles.pixelButtonText}>🔄 RESET</Text>
            </View>
          </TouchableOpacity>
          
          {/* Center on User Button */}
          <TouchableOpacity style={styles.pixelButton} onPress={handleCenterOnUser}>
            <View style={styles.pixelButtonBorder}>
              <Text style={styles.pixelButtonText}>📍 CENTER</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {isLoading && (
          <Text style={styles.statusText}>Initializing...</Text>
        )}
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>

      {/* Map with pristine native components - no fog interference */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapViewRef}
          style={styles.map}
          region={mapRegion}
          customMapStyle={mapStyle}
          showsUserLocation={false} // Disable default blue dot for custom character
          showsMyLocationButton={false}
          showsCompass={false}
          toolbarEnabled={false}
        >
          {/* Custom 8-bit player character */}
          {currentLocation && locationPermissionGranted && (
            <Marker
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude
              }}
              anchor={{ x: 0.5, y: 0.5 }}
              flat={true}
            >
              <PixelArtCharacter />
            </Marker>
          )}

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

      {/* Simple fog overlay - basic atmospheric dimming */}
      <View style={styles.fogOverlay} pointerEvents="none">
        <View style={styles.baseFog} />
      </View>

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
    zIndex: 1, // Base layer for proper fog overlay positioning
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
  pixelCrystal: {
    width: 21, // 7 pixels wide * 3px each (undiscovered size)
    height: 21, // 7 pixels tall * 3px each
    justifyContent: 'center',
    alignItems: 'center',
  },
  pixelCrystalDiscovered: {
    width: 28, // 7 pixels wide * 4px each (discovered size)  
    height: 28, // 7 pixels tall * 4px each
    justifyContent: 'center',
    alignItems: 'center',
  },
  crystalRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  crystalPixel: {
    width: 3, // Same 3px pixel size as character (undiscovered)
    height: 3,
    borderRadius: 0.5, // Same border radius as character
  },
  crystalPixelDiscovered: {
    width: 4, // Bigger 4px pixels for discovered crystals
    height: 4,
    borderRadius: 0.5,
  },
  crystalTransparent: {
    backgroundColor: 'transparent',
  },
  pixelProgressContainer: {
    position: 'absolute',
    bottom: -12, // Below the crystal, clearly visible
    left: -3, // Slightly wider than crystal for better visibility
    right: -3,
    height: 8, // Clearly visible progress bar
    alignItems: 'center',
  },
  pixelProgressOutline: {
    width: '100%', // Full width within the container
    height: '100%',
    backgroundColor: '#000000', // Black outline like character
    padding: 1, // 1px border
    borderRadius: 2,
    justifyContent: 'center',
  },
  pixelProgressBar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#444444', // Darker background for better contrast
    borderRadius: 1,
  },
  pixelProgressFill: {
    height: '100%',
    backgroundColor: '#ffdd00', // Bright yellow like discoverable crystals
    borderRadius: 1,
  },
  pixelTapHint: {
    position: 'absolute',
    bottom: -22, // Above the progress bar, below crystal
    alignSelf: 'center',
    backgroundColor: '#ffdd00', // Bright yellow background
    paddingHorizontal: 4, // Compact padding
    paddingVertical: 2,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#000000', // Black border for definition
  },
  pixelTapText: {
    color: '#000000', // Black text on bright yellow
    fontSize: 12, // Increased font size
    fontWeight: 'bold',
  },
  pixelDiscoveredIndicator: {
    position: 'absolute',
    width: 3, // Match 3px pixel size
    height: 3,
    borderRadius: 0.5,
    backgroundColor: '#ffffff',
    top: 12, // Centered in 28px discovered crystal
    opacity: 1,
  },
  fogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2, // Above map (1), below UI elements (1000)
    pointerEvents: 'none', // Completely non-interactive
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

  // Simple non-SVG fog test
  simpleFogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2, // Above map (1), below UI elements (1000)
    pointerEvents: 'none', // Completely non-interactive
    backgroundColor: 'rgba(5, 15, 25, 0.2)', // Reasonable atmospheric effect
  },
  // Clean Pixel Art Character
  pixelCharacter: {
    width: 27, // 9 pixels wide * 3px each
    height: 42, // 14 pixels tall * 3px each  
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  pixel: {
    width: 3, // Smaller pixels for higher resolution
    height: 3,
    borderRadius: 0.5,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  green: {
    backgroundColor: '#00ff88',
  },
  lightGreen: {
    backgroundColor: '#00ffaa',
  },
  skin: {
    backgroundColor: '#ffd700',
  },
  black: {
    backgroundColor: '#000000',
  },
  brown: {
    backgroundColor: '#8b4513',
  },
  lightBrown: {
    backgroundColor: '#deb887',
  },
  blue: {
    backgroundColor: '#0077ff',
  },
  lightBlue: {
    backgroundColor: '#00aaff',
  },
  darkBlue: {
    backgroundColor: '#0055cc',
  },
  darkSkin: {
    backgroundColor: '#ffc107',
  },
  pixelRed: {
    backgroundColor: '#ff4444',
  },
  pixelRedLight: {
    backgroundColor: '#ff6666',
  },
  pixelTeal: {
    backgroundColor: '#008888',
  },
  pixelTealLight: {
    backgroundColor: '#00aaaa',
  },
  pixelBlack: {
    backgroundColor: '#000000',
  },
  pixelSkinDark: {
    backgroundColor: '#ffd700',
  },
  pixelBrown: {
    backgroundColor: '#8B4513',
  },
  pixelSkin: {
    backgroundColor: '#FFDBAC',
  },
  pixelOutline: {
    backgroundColor: '#000000',
  },
  pixelSkinLight: {
    backgroundColor: '#FFDBAC',
  },
  pixelRedDark: {
    backgroundColor: '#cc0000',
  },
  pixelTealDark: {
    backgroundColor: '#005555',
  },
  pixelBrownDark: {
    backgroundColor: '#553300',
  },
  pixelBrownLight: {
    backgroundColor: '#8B4513',
  },
  discoverableGlow: {
    position: 'absolute',
    width: 21, // Match undiscovered crystal size
    height: 21,
    borderRadius: 10.5, // Half of width/height
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Subtle glow
    opacity: 0.8,
    zIndex: -1, // Below the crystal itself
  },
  baseFog: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 15, 25, 0.2)', // Reasonable atmospheric effect
  },

  // Pixel art button styles
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  pixelButton: {
    backgroundColor: 'transparent',
  },
  pixelButtonBorder: {
    backgroundColor: '#000000', // Black background like character
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#ffffff', // White border for definition
  },
  pixelButtonText: {
    color: '#ffffff', // White text on black background
    fontSize: 10,
    fontWeight: 'bold',
  },
}); 