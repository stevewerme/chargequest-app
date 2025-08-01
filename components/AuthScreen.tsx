import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import MapView from 'react-native-maps';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useGameStore } from '../stores/gameStore';

const { width, height } = Dimensions.get('window');

export default function AuthScreen() {
  const { 
    signInWithApple,
    isAuthenticated,
    currentLocation,
    initializePermissions,
    isLoading,
    error
  } = useGameStore();

  // Initialize location services when component mounts
  useEffect(() => {
    initializePermissions();
  }, []);

  // Default location (Stockholm) if user location not available
  const mapRegion = currentLocation ? {
    latitude: currentLocation.latitude,
    longitude: currentLocation.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  } : {
    latitude: 59.3293, // Stockholm
    longitude: 18.0686,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Map Background */}
      <MapView
        style={styles.backgroundMap}
        region={mapRegion}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        mapType="standard"
      />
      
      {/* Dark Overlay */}
      <View style={styles.overlay} />
      
      {/* Content */}
      <View style={styles.content}>
        {/* ChargeQuest Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>CHARGE</Text>
          <Text style={styles.logoTextAccent}>QUEST</Text>
          <Text style={styles.logoSubtitle}>Discover • Explore • Conquer</Text>
        </View>
        
        {/* Apple Sign In Button */}
        <View style={styles.buttonContainer}>
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
            cornerRadius={12}
            style={styles.appleSignInButton}
            onPress={signInWithApple}
          />
          
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
        </View>
        
        {/* Game Preview Text */}
        <View style={styles.previewContainer}>
          <Text style={styles.previewText}>
            Explore charging stations in your area
          </Text>
          <Text style={styles.previewSubtext}>
            Level up by discovering new locations
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundMap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)', // Dark transparent overlay
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingTop: 80,
    paddingBottom: 60,
    zIndex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  logoTextAccent: {
    fontSize: 48,
    fontWeight: '900',
    color: '#00ff88',
    letterSpacing: 4,
    marginTop: -8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  logoSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 8,
    letterSpacing: 2,
    textAlign: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appleSignInButton: {
    width: 280,
    height: 50,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  previewText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '600',
  },
  previewSubtext: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.7,
    textAlign: 'center',
  },
}); 