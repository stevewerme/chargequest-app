import * as Location from 'expo-location';
import { UserLocation, ChargingStation, ProximityEvent } from '../types/ChargingStation';

class LocationService {
  private watchId: Location.LocationSubscription | null = null;
  private lastLocation: UserLocation | null = null;
  private lastUpdateTime: number = 0;
  private consecutiveSmallMovements: number = 0;
  private isStationary: boolean = false;

  /**
   * Requests location permissions from the user
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn('Location permission denied');
        return false;
      }

      // Request background permissions for better experience
      const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus.status !== 'granted') {
        console.log('Background location permission denied, but foreground is available');
      }

      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  /**
   * Gets the current location once
   */
  async getCurrentLocation(): Promise<UserLocation | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const userLocation: UserLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        timestamp: location.timestamp,
      };

      this.lastLocation = userLocation;
      return userLocation;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  /**
   * Starts watching for location changes with smart battery optimization
   */
  async startLocationTracking(
    onLocationUpdate: (location: UserLocation) => void,
    onError?: (error: string) => void
  ): Promise<boolean> {
    try {
      if (this.watchId) {
        await this.stopLocationTracking();
      }

      // Reset tracking state
      this.consecutiveSmallMovements = 0;
      this.isStationary = false;
      this.lastUpdateTime = Date.now();

      this.watchId = await Location.watchPositionAsync(
        this.getOptimalLocationOptions(),
        (location) => {
          this.handleLocationUpdate(location, onLocationUpdate);
        }
      );

      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      onError?.('Failed to start location tracking');
      return false;
    }
  }

  /**
   * Gets optimal location tracking options based on current state
   */
  private getOptimalLocationOptions(): Location.LocationOptions {
    // Adaptive time intervals based on movement patterns
    const baseTimeInterval = this.isStationary ? 30000 : 10000; // 30s when stationary, 10s when moving
    const distanceInterval = this.isStationary ? 25 : 15; // Larger distance threshold when stationary

    console.log(`📍 Location tracking config: ${this.isStationary ? 'STATIONARY' : 'MOVING'} mode (${baseTimeInterval/1000}s interval)`);

    return {
      accuracy: Location.Accuracy.Balanced, // Balanced accuracy for better battery life
      timeInterval: baseTimeInterval,
      distanceInterval: distanceInterval,
      mayShowUserSettingsDialog: false, // Don't interrupt user experience
    };
  }

  /**
   * Handles incoming location updates with smart filtering
   */
  private handleLocationUpdate(
    location: Location.LocationObject,
    onLocationUpdate: (location: UserLocation) => void
  ): void {
    const now = Date.now();
    const timeSinceLastUpdate = now - this.lastUpdateTime;

    console.log('📍 Raw location update:', {
      lat: location.coords.latitude.toFixed(6),
      lng: location.coords.longitude.toFixed(6),
      accuracy: location.coords.accuracy,
      timeDelta: `${(timeSinceLastUpdate/1000).toFixed(1)}s`,
      timestamp: new Date(location.timestamp).toLocaleTimeString()
    });

    const userLocation: UserLocation = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy || undefined,
      timestamp: location.timestamp,
    };

    // Apply smart filtering to reduce battery drain
    if (this.shouldProcessLocationUpdate(userLocation, timeSinceLastUpdate)) {
      this.lastLocation = userLocation;
      this.lastUpdateTime = now;
      onLocationUpdate(userLocation);

      // Update adaptive tracking if movement patterns changed
      this.updateAdaptiveTracking();
    }
  }

  /**
   * Determines if a location update should be processed
   */
  private shouldProcessLocationUpdate(location: UserLocation, timeDelta: number): boolean {
    // Always process first location
    if (!this.lastLocation) {
      console.log('📍 Processing first location update');
      return true;
    }

    // Calculate movement distance
    const distance = this.calculateDistance(
      this.lastLocation.latitude,
      this.lastLocation.longitude,
      location.latitude,
      location.longitude
    );

    console.log(`🚶 Movement: ${distance.toFixed(1)}m, accuracy: ${location.accuracy?.toFixed(1) || 'unknown'}m`);

    // Filter out GPS noise and very small movements
    const accuracyThreshold = (location.accuracy || 10);
    const minimumMovement = Math.max(1, accuracyThreshold * 0.5); // Adaptive minimum based on GPS accuracy

    if (distance < minimumMovement) {
      this.consecutiveSmallMovements++;
      console.log(`📍 Skipping small movement (${distance.toFixed(1)}m < ${minimumMovement.toFixed(1)}m) - count: ${this.consecutiveSmallMovements}`);
      
      // After 3 consecutive small movements, consider user stationary
      if (this.consecutiveSmallMovements >= 3 && !this.isStationary) {
        this.isStationary = true;
        console.log('🏠 User appears stationary - reducing location polling frequency');
      }
      
      return false;
    }

    // Reset stationary state if significant movement detected
    if (distance > 10 && this.isStationary) {
      this.isStationary = false;
      this.consecutiveSmallMovements = 0;
      console.log('🚶 User moving again - increasing location polling frequency');
    } else if (distance > minimumMovement) {
      this.consecutiveSmallMovements = 0;
    }

    // Throttle updates to prevent excessive processing
    const minimumTimeInterval = this.isStationary ? 15000 : 5000; // 15s when stationary, 5s when moving
    if (timeDelta < minimumTimeInterval) {
      console.log(`⏱️ Throttling update - only ${(timeDelta/1000).toFixed(1)}s since last (min: ${minimumTimeInterval/1000}s)`);
      return false;
    }

    console.log(`✅ Processing location update - movement: ${distance.toFixed(1)}m, time: ${(timeDelta/1000).toFixed(1)}s`);
    return true;
  }

  /**
   * Updates adaptive tracking configuration if needed
   */
  private async updateAdaptiveTracking(): Promise<void> {
    // Restart tracking with new configuration if movement state changed significantly
    // This is expensive so only do it when really needed
    if (this.consecutiveSmallMovements === 3 || (this.isStationary && this.consecutiveSmallMovements === 0)) {
      console.log('🔄 Adaptive tracking: Restarting with optimized configuration');
      // Note: In a production app, we might restart the location tracking here
      // For now, we rely on the existing configuration and filtering
    }
  }

  /**
   * Stops location tracking and resets adaptive state
   */
  async stopLocationTracking(): Promise<void> {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
    
    // Reset adaptive tracking state
    this.consecutiveSmallMovements = 0;
    this.isStationary = false;
    this.lastUpdateTime = 0;
    console.log('📍 Location tracking stopped - adaptive state reset');
  }

  /**
   * Calculates distance between two coordinates using Haversine formula
   * Returns distance in meters
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Checks if user is within proximity of any charging stations
   * Returns proximity events for stations in range
   */
  checkProximity(
    userLocation: UserLocation,
    stations: ChargingStation[],
    proximityRadius: number = 25 // 25 meters as per PRD
  ): ProximityEvent[] {
    const proximityEvents: ProximityEvent[] = [];

    stations.forEach((station) => {
      const distance = this.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        station.latitude,
        station.longitude
      );

      const isInRange = distance <= proximityRadius;

      proximityEvents.push({
        stationId: station.id,
        distance,
        isInRange,
      });
    });

    return proximityEvents.filter(event => event.isInRange);
  }

  /**
   * Gets the last known location
   */
  getLastLocation(): UserLocation | null {
    return this.lastLocation;
  }
}

export const locationService = new LocationService(); 