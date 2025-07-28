import * as Location from 'expo-location';
import { UserLocation, ChargingStation, ProximityEvent } from '../types/ChargingStation';

class LocationService {
  private watchId: Location.LocationSubscription | null = null;
  private lastLocation: UserLocation | null = null;

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
   * Starts watching for location changes
   */
  async startLocationTracking(
    onLocationUpdate: (location: UserLocation) => void,
    onError?: (error: string) => void
  ): Promise<boolean> {
    try {
      if (this.watchId) {
        await this.stopLocationTracking();
      }

      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          const userLocation: UserLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || undefined,
            timestamp: location.timestamp,
          };

          this.lastLocation = userLocation;
          onLocationUpdate(userLocation);
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
   * Stops location tracking
   */
  async stopLocationTracking(): Promise<void> {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
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