import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { useGameStore } from '../stores/gameStore';

const { width, height } = Dimensions.get('window');

// Stockholm coordinates
const STOCKHOLM_REGION = {
  centerCoordinate: [18.0686, 59.3293], // [longitude, latitude] for MapLibre
  zoomLevel: 11,
};

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

// Animated Energy Cell Component
interface AnimatedEnergyCellProps {
  isDiscovered: boolean;
}

function AnimatedEnergyCell({ isDiscovered }: AnimatedEnergyCellProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isDiscovered) {
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
  }, [isDiscovered]);

  return (
    <View style={styles.energyCell}>
      <View style={[
        styles.energyCellOuterGlow, 
        isDiscovered && styles.discoveredOuterGlow
      ]} />
      <View style={[
        styles.energyCellGlow, 
        isDiscovered && styles.discoveredGlow
      ]} />
      <View style={[
        styles.energyCellCore, 
        isDiscovered && styles.discoveredCore
      ]} />
      {!isDiscovered && (
        <Animated.View 
          style={[
            styles.energyCellPulse,
            {
              transform: [{ scale: pulseAnim }],
            }
          ]} 
        />
      )}
      {isDiscovered && (
        <View style={styles.discoveredIndicator} />
      )}
    </View>
  );
}

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

  if (error && !locationPermissionGranted) {
    handlePermissionError();
  }

  return (
    <View style={styles.container}>
      {/* Header with discovery counter */}
      <View style={styles.header}>
        <Text style={styles.headerText}>ChargeQuest</Text>
        <Text style={styles.counterText}>
          {totalDiscovered}/{chargingStations.length} Energy Cells Discovered
        </Text>
        <Text style={styles.privacyText}>🇪🇺 GDPR-Compliant • OpenStreetMap</Text>
        {isLoading && (
          <Text style={styles.statusText}>Initializing...</Text>
        )}
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>

      {/* MapLibre with fog-of-war styling */}
      <View style={styles.mapContainer}>
        <MapLibreGL.MapView
          style={styles.map}
          zoomEnabled={true}
          scrollEnabled={true}
          pitchEnabled={false}
          rotateEnabled={false}
          logoEnabled={false}
        >
          <MapLibreGL.Camera
            centerCoordinate={STOCKHOLM_REGION.centerCoordinate}
            zoomLevel={STOCKHOLM_REGION.zoomLevel}
            animationMode="flyTo"
            animationDuration={1000}
          />

          {/* User location (if available) */}
          {locationPermissionGranted && currentLocation && (
            <MapLibreGL.PointAnnotation
              id="user-location"
              coordinate={[currentLocation.longitude, currentLocation.latitude]}
            >
              <View style={styles.userLocation}>
                <View style={styles.userLocationDot} />
                <View style={styles.userLocationPulse} />
              </View>
            </MapLibreGL.PointAnnotation>
          )}

          {/* Energy cells */}
          {chargingStations.map((station) => (
            <MapLibreGL.PointAnnotation
              key={station.id}
              id={`station-${station.id}`}
              coordinate={[station.longitude, station.latitude]}
              title={station.title}
            >
              <AnimatedEnergyCell isDiscovered={station.isDiscovered} />
            </MapLibreGL.PointAnnotation>
          ))}
        </MapLibreGL.MapView>
      </View>

      {/* Atmospheric fog overlay - non-interactive */}
      <BlurView 
        intensity={12} 
        style={styles.fogOverlay} 
        tint="dark"
        pointerEvents="none"
      >
        <View style={styles.fogGradient} />
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
  mapContainer: {
    flex: 1,
    opacity: 0.7,
  },
  map: {
    flex: 1,
  },
  // User location styles
  userLocation: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#ffffff',
    zIndex: 2,
  },
  userLocationPulse: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    opacity: 0.3,
  },
  // Energy cell styles (same as before)
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
  // Atmospheric effects
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
}); 