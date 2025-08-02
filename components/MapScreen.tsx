import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Alert, TouchableOpacity } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Haptics from 'expo-haptics';
import { useGameStore } from '../stores/gameStore';
import { locationService } from '../services/locationService';
import { ChargingStation } from '../types/ChargingStation';

const { width, height } = Dimensions.get('window');

// Portrait avatar version (head and upper body)
const PixelAvatarPortrait = () => {
  return (
    <View style={styles.pixelAvatar}>
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
    </View>
  );
};

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

// Claim Popover Component
interface ClaimPopoverProps {
  visible: boolean;
  stationName: string;
  onClaim: () => void;
  onCancel: () => void;
}

function ClaimPopover({ visible, stationName, onClaim, onCancel }: ClaimPopoverProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Press and hold claim state
  const [claimProgress, setClaimProgress] = useState(0); // 0 to 1
  const [isClaiming, setIsClaiming] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const claimTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      // Reset claim state when popover opens
      setClaimProgress(0);
      setIsClaiming(false);
      setIsCompleted(false);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Clear any ongoing claim process when popover closes
      if (claimTimerRef.current) {
        clearTimeout(claimTimerRef.current);
        claimTimerRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setClaimProgress(0);
      setIsClaiming(false);
      setIsCompleted(false);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  // Press and hold claim handlers
  const startClaim = () => {
    if (isCompleted) return; // Prevent multiple claims
    
    setIsClaiming(true);
    setClaimProgress(0);
    
    const startTime = Date.now();
    const duration = 3000; // 3 seconds
    
    // Update progress every 50ms for smooth animation
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setClaimProgress(progress);
      
      if (progress >= 1) {
        // Claim completed!
        completeClaim();
      }
    }, 50);
    
    // Backup timer to ensure completion after exactly 3 seconds
    claimTimerRef.current = setTimeout(() => {
      completeClaim();
    }, duration);
  };

  const cancelClaim = () => {
    if (isCompleted) return;
    
    // Clear timers
    if (claimTimerRef.current) {
      clearTimeout(claimTimerRef.current);
      claimTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    // Reset state
    setIsClaiming(false);
    setClaimProgress(0);
  };

  const completeClaim = () => {
    if (isCompleted) return;
    
    // Clear timers
    if (claimTimerRef.current) {
      clearTimeout(claimTimerRef.current);
      claimTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    // Mark as completed
    setIsCompleted(true);
    setIsClaiming(false);
    setClaimProgress(1);
    
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Brief delay to show "CLAIMED!" then execute claim
    setTimeout(() => {
      onClaim();
    }, 500);
  };

  return visible ? (
    <Animated.View 
      style={[
        styles.popoverContainer,
        {
          opacity: fadeAnim,
          transform: [
            {
              scale: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        },
      ]}
      pointerEvents="auto"
    >
              <View style={styles.nesPopoverContent} pointerEvents="auto">
          <View style={styles.popoverHeader}>
            <Text style={styles.nesPopoverTitle}>ENERGY CELL DISCOVERED!</Text>
          </View>
        
        <View style={styles.locationInfo}>
          <View style={styles.locationIcon}>
            <Text style={styles.locationEmoji}>⚡</Text>
          </View>
          <Text style={styles.nesLocationName}>{stationName}</Text>
        </View>
        
                  <TouchableOpacity 
            style={styles.nesClaimButton} 
            onPressIn={startClaim}
            onPressOut={cancelClaim}
            activeOpacity={0.9}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            disabled={isCompleted}
          >
            <View style={styles.nesClaimBorder} pointerEvents="none">
              <View style={[styles.nesClaimInner, {
                backgroundColor: isCompleted ? '#00aa00' : 
                  isClaiming ? '#008800' : '#00cc00'
              }]} pointerEvents="none">
                {/* Progress bar background */}
                <View style={[
                  styles.claimProgressBar,
                  { width: `${claimProgress * 100}%` }
                ]} />
                
                {/* Button content */}
                <View style={styles.claimButtonContent}>
                  <Text style={styles.nesClaimIcon}>💎</Text>
                  <Text style={styles.nesClaimText}>
                    {isCompleted ? 'CLAIMED!' : 
                     isClaiming ? 'HOLD TO CLAIM...' : 
                     'HOLD TO CLAIM'}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.nesCancelButton} 
            onPress={onCancel}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.nesCancelBorder} pointerEvents="none">
              <Text style={styles.nesCancelText}>CANCEL</Text>
            </View>
          </TouchableOpacity>
      </View>
      
      {/* Popover arrow */}
      <View style={styles.popoverArrow} />
    </Animated.View>
  ) : null;
}

// Animated Energy Cell Component
interface AnimatedEnergyCellProps {
  isDiscovered: boolean;
  isDiscoverable: boolean;
  isUnlocking: boolean;
  unlockProgress: number;
  stationId: string;
  stationName: string;
  onShowPopover: (stationId: string, stationName: string) => void;
}

function AnimatedEnergyCell({ 
  isDiscovered, 
  isDiscoverable, 
  isUnlocking, 
  unlockProgress, 
  stationId, 
  stationName,
  onShowPopover 
}: AnimatedEnergyCellProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isDiscoverable && !isDiscovered && !isUnlocking) {
      // Gentle breathing animation for purple crystals only
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08, // Smaller scale change for subtle breathing
            duration: 1000, // 2-second cycle (1 second up, 1 second down)
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
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
  }, [isDiscovered, isDiscoverable, isUnlocking, pulseAnim]);

  const handlePress = () => {
    if (isDiscovered || isUnlocking) {
      return; // Already claimed or popover already open
    }
    
    if (isDiscoverable) {
      // Show claim popover
      onShowPopover(stationId, stationName);
    }
  };

  const getCrystalColors = () => {
    if (isDiscovered) return { base: '#00ff88', light: '#33ffaa', dark: '#00cc66' }; // Green - claimed/completed
    if (isDiscoverable) return { base: '#8B4BBE', light: '#A855D4', dark: '#7C3AED' }; // Purple - active/interactive
    return { base: '#DC2626', light: '#EF4444', dark: '#B91C1C' }; // Red - undiscovered/mysterious
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
    totalXP,
    currentLevel,
    levelTitle,
    xpToNextLevel,
    mapBounds,
    initializePermissions, 
    startLocationTracking,
    completeUnlock,
    resetProgress,
    signOut,
    currentLocation,
    isLoading,
    error,
    locationPermissionGranted 
  } = useGameStore();

  // Popover state
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [selectedStation, setSelectedStation] = useState<{id: string, name: string} | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  // XP Progress calculation
  const getXPProgress = () => {
    if (!xpToNextLevel) return 100; // Max level reached
    
    // XP requirements for each level
    const levelRequirements = [0, 300, 800, 1500, 2500];
    const currentLevelXP = levelRequirements[currentLevel - 1] || 0;
    const nextLevelXP = xpToNextLevel;
    const progressXP = totalXP - currentLevelXP;
    const levelRange = nextLevelXP - currentLevelXP;
    
    return Math.min(100, Math.max(0, (progressXP / levelRange) * 100));
  };

  // Energy Radar (Level 2+ feature)
  const getNearestUndiscoveredStation = (): { station: ChargingStation, distance: number } | null => {
    if (!currentLocation || currentLevel < 2) return null;
    
    const undiscoveredStations = safeChargingStations.filter(station => !station.isDiscovered);
    if (undiscoveredStations.length === 0) return null;
    
    let nearestStation: { station: ChargingStation, distance: number } | null = null;
    let shortestDistance = Infinity;
    
    undiscoveredStations.forEach(station => {
      const distance = Math.sqrt(
        Math.pow(station.latitude - currentLocation.latitude, 2) + 
        Math.pow(station.longitude - currentLocation.longitude, 2)
      ) * 111000; // Rough conversion to meters
      
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestStation = { station, distance: Math.round(distance) };
      }
    });
    
    return nearestStation;
  };

  const nearestStation = getNearestUndiscoveredStation();

  // Popover handlers
  const handleShowPopover = (stationId: string, stationName: string) => {
    setSelectedStation({ id: stationId, name: stationName });
    setPopoverVisible(true);
    
    // Force a tiny map region update centered on the tapped station
    // This fixes the initial positioning issue
    const tappedStation = safeChargingStations.find(s => s.id === stationId);
    if (mapViewRef.current && tappedStation) {
      setTimeout(() => {
        if (mapViewRef.current && tappedStation) {
          mapViewRef.current.animateToRegion({
            latitude: tappedStation.latitude,
            longitude: tappedStation.longitude,
            latitudeDelta: mapRegion.latitudeDelta * 0.9, // Slightly zoom in to ensure visibility
            longitudeDelta: mapRegion.longitudeDelta * 0.9,
          }, 150); // Quick animation to refresh positions and center on station
        }
      }, 100);
    }
  };

  const handleClosePopover = () => {
    setPopoverVisible(false);
    setSelectedStation(null);
  };

  const handleClaim = () => {
    if (selectedStation) {
      completeUnlock(selectedStation.id);
      handleClosePopover();
    }
  };

  // Safety check: ensure chargingStations is always an array
  const safeChargingStations = chargingStations || [];
  
  // Performance monitoring - log render performance with stations
  useEffect(() => {
    const renderStart = performance.now();
    const cleanup = () => {
      const renderEnd = performance.now();
      console.log(`🚀 MapScreen rendered ${safeChargingStations.length} stations in ${(renderEnd - renderStart).toFixed(2)}ms`);
    };
    return cleanup;
  }, [safeChargingStations.length]);
  
  // Dynamic map region state
  const [mapRegion, setMapRegion] = useState<Region>(FALLBACK_REGION);
  const [lastUpdateLocation, setLastUpdateLocation] = useState<{lat: number, lon: number} | null>(null);

  // MapView reference for coordinate conversions
  const mapViewRef = useRef<MapView>(null);

  // Auto-fit map to show nearest stations when bounds change
  useEffect(() => {
    if (mapBounds && mapViewRef.current) {
      console.log('🎯 Auto-fitting map to nearest stations bounds');
      mapViewRef.current.fitToCoordinates([
        mapBounds.northeast,
        mapBounds.southwest
      ], {
        edgePadding: { top: 150, right: 50, bottom: 200, left: 50 },
        animated: true,
      });
    }
  }, [mapBounds]);

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
      'This will reload Stockholm stations and reset your progress. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            try {
              await resetProgress();
            } catch (error) {
              console.error('Failed to reset progress:', error);
            }
          }
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

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? Your game progress will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'default',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Failed to logout:', error);
            }
          }
        }
      ]
    );
  };

  if (error && !locationPermissionGranted) {
    handlePermissionError();
  }

  return (
    <View style={styles.container}>
            {/* Centered Header with Logo and Progress */}
      <View style={styles.cohesiveHeader}>
        {/* Header row: Logo only */}
        <View style={styles.headerTopRow}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>⚡</Text>
            <Text style={styles.logoCharge}>CHARGE</Text>
            <Text style={styles.logoQuest}>QUEST</Text>
            <Text style={styles.logoIconEnd}>⚡</Text>
          </View>
        </View>
        
        {/* Bottom row: Level, XP bar, and XP numbers */}
        <View style={styles.headerBottomRow}>
          <Text style={styles.levelText}>Level {currentLevel}</Text>
          
          {/* 10-segment XP progress bar */}
          <View style={styles.xpBarContainer}>
            {Array.from({ length: 10 }, (_, index) => {
              const segmentFilled = (getXPProgress() / 100) * 10 > index;
              return (
                <View
                  key={index}
                  style={[
                    styles.xpSegment,
                    segmentFilled ? styles.xpSegmentFilled : styles.xpSegmentEmpty
                  ]}
                />
              );
            })}
          </View>
          
          <Text style={styles.xpNumbers}>
            {totalXP}{xpToNextLevel ? `/${xpToNextLevel}` : ''} XP
          </Text>
        </View>
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
              anchor={{ x: 0.5, y: 0.5 }}
              centerOffset={{ x: 0, y: 0 }}
            >
              <AnimatedEnergyCell 
                isDiscovered={station.isDiscovered}
                isDiscoverable={station.isDiscoverable}
                isUnlocking={station.isUnlocking}
                unlockProgress={station.unlockProgress}
                stationId={station.id}
                stationName={station.title}
                onShowPopover={handleShowPopover}
              />
            </Marker>
          ))}

          
        </MapView>
      </View>

      {/* Claim Popover - Positioned at screen level to avoid UI conflicts */}
      {popoverVisible && selectedStation && (
        <ClaimPopover
          visible={popoverVisible}
          stationName={selectedStation.name}
          onClaim={handleClaim}
          onCancel={handleClosePopover}
        />
      )}

      {/* Simple fog overlay - basic atmospheric dimming */}
      <View style={styles.fogOverlay} pointerEvents="none">
        <View style={styles.baseFog} />
      </View>

      {/* Additional mystery vignette */}
      <View style={styles.vignette} pointerEvents="none" />

      {/* Avatar Menu Button - Bottom Left */}
      <TouchableOpacity 
        style={styles.avatarMenuButton}
        onPress={() => setShowMenu(!showMenu)}
      >
        <View style={styles.avatarMenuButtonBorder}>
          <View style={styles.avatarMenuButtonInner}>
            <PixelAvatarPortrait />
          </View>
        </View>
      </TouchableOpacity>

      {/* Center Location Button - Bottom Right */}
      <TouchableOpacity 
        style={styles.centerLocationButton}
        onPress={handleCenterOnUser}
      >
        <View style={styles.centerLocationButtonBorder}>
          <View style={styles.centerLocationButtonInner}>
            <Text style={styles.centerLocationButtonIcon}>📍</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Centered Menu Modal */}
      {showMenu && (
        <TouchableOpacity 
          style={styles.slideUpMenu}
          onPress={() => setShowMenu(false)}
          activeOpacity={1}
        >
          <View 
            style={styles.menuModal}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.menuContent}>
            {/* Reset Progress Button */}
            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={() => {
                handleReset();
                setShowMenu(false);
              }}
            >
              <Text style={styles.menuButtonIcon}>🔄</Text>
              <Text style={styles.menuButtonText}>Reset Progress</Text>
            </TouchableOpacity>

            {/* Logout Button */}
            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={() => {
                setShowMenu(false);
                handleLogout();
              }}
            >
              <Text style={styles.menuButtonIcon}>🚪</Text>
              <Text style={styles.menuButtonText}>Logout</Text>
            </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      )}
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
    top: 80,
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
  // Popover styles - Center on screen to avoid header and bottom UI
  popoverContainer: {
    position: 'absolute',
    top: '40%', // Position in middle area, avoiding header and bottom buttons
    left: 20,
    right: 20,
    zIndex: 10000, // Higher than header (1000) and all other UI elements
    alignItems: 'center',
    elevation: 15, // Higher Android elevation
    pointerEvents: 'auto', // Ensure touch events work
  },
  popoverContent: {
    backgroundColor: '#000000',
    borderRadius: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: '#ffdd00',
    minWidth: 200,
    alignItems: 'center',
  },
  popoverTitle: {
    color: '#ffdd00',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  popoverLocationName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  swipeToClaimButton: {
    width: '100%',
    marginBottom: 12,
  },
  swipeBackground: {
    backgroundColor: '#ffdd00',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  swipeText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.7,
  },
  popoverArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#ffdd00',
    marginTop: -1,
  },
  // XP System styles
  xpContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  xpBar: {
    width: 200,
    marginBottom: 2,
  },
  xpBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ffdd00',
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#ffdd00',
    borderRadius: 3,
  },
  xpText: {
    color: '#ffffff',
    fontSize: 10,
    opacity: 0.8,
  },
  
  // Centered Header - Pixel Art Style
  cohesiveHeader: {
    position: 'absolute',
    top: 70,
    left: 20,
    right: 20,
    zIndex: 1000,
    backgroundColor: '#2a2a2a', // Solid dark gray like NES buttons
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 0, // Sharp pixel corners
    borderWidth: 3,
    borderTopColor: '#555555', // 3D bevel effect
    borderLeftColor: '#555555',
    borderRightColor: '#111111',
    borderBottomColor: '#111111',
    // Subtle shadow for depth
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 0, // Sharp shadow for pixel art
    elevation: 8, // Android shadow
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center the logo now that avatar is moved
    marginBottom: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoIcon: {
    color: '#ffdd00',
    fontSize: 16,
    marginRight: 6,
  },
  logoCharge: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  logoQuest: {
    color: '#00ff88',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  logoIconEnd: {
    color: '#ffdd00',
    fontSize: 16,
    marginLeft: 6,
  },
  // Avatar Menu Button - Bottom Left
  avatarMenuButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    zIndex: 1000,
  },
  headerBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center the progress info under the logo
  },
  levelText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginRight: 12, // Space between "Level 1" and progress bar
  },
  xpBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12, // Space between progress bar and XP numbers
  },
  xpSegment: {
    width: 14,
    height: 8,
    borderWidth: 1,
    borderColor: '#000000', // Black borders for more contrast
    marginRight: 1,
  },
  xpSegmentFilled: {
    backgroundColor: '#ffdd00',
    borderColor: '#cc9900', // Darker border for filled segments
  },
  xpSegmentEmpty: {
    backgroundColor: '#222222', // Darker empty background
    borderColor: '#444444', // Subtle border for empty segments
  },
  xpNumbers: {
    color: '#cccccc',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  

  nesButton: {
    minWidth: 80,
  },
  nesButtonBorder: {
    backgroundColor: '#4a4a4a',
    borderWidth: 3,
    borderTopColor: '#888888',
    borderLeftColor: '#888888', 
    borderRightColor: '#222222',
    borderBottomColor: '#222222',
    borderRadius: 0,
  },
  nesButtonInner: {
    backgroundColor: '#666666',
    borderWidth: 1,
    borderColor: '#555555',
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  nesButtonIcon: {
    fontSize: 12,
    marginBottom: 2,
  },
  nesButtonText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  
  // Enhanced NES-Style Popover
  nesPopoverContent: {
    backgroundColor: '#1a1a1a',
    borderWidth: 3,
    borderColor: '#ffdd00',
    borderRadius: 0,
    padding: 0,
    minWidth: 240,
    alignItems: 'center',
    elevation: 15, // Even higher elevation for Android
    shadowColor: '#000000', // iOS shadow for better visibility
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  popoverHeader: {
    backgroundColor: '#ffdd00',
    width: '100%',
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#cc9900',
  },
  nesPopoverTitle: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  locationIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#333333',
    borderWidth: 2,
    borderColor: '#666666',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationEmoji: {
    fontSize: 16,
  },
  nesLocationName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    flex: 1,
  },
  nesClaimButton: {
    marginBottom: 8,
  },
  nesClaimBorder: {
    backgroundColor: '#00aa00',
    borderWidth: 3,
    borderTopColor: '#00ff00',
    borderLeftColor: '#00ff00',
    borderRightColor: '#006600',
    borderBottomColor: '#006600',
    borderRadius: 0,
  },
  nesClaimInner: {
    backgroundColor: '#00cc00',
    borderWidth: 1,
    borderColor: '#009900',
    paddingVertical: 8,
    paddingHorizontal: 16,
    position: 'relative',
    overflow: 'hidden', // Ensure progress bar doesn't overflow
    alignItems: 'center',
    justifyContent: 'center',
  },
  nesClaimIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  nesClaimText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  nesCancelButton: {
    marginBottom: 12,
  },
  nesCancelBorder: {
    backgroundColor: '#666666',
    borderWidth: 2,
    borderColor: '#888888',
    borderRadius: 0,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  nesCancelText: {
    color: '#ffffff',
    fontSize: 10,
    fontFamily: 'monospace',
  },

  
  // Press and Hold Claim Styles
  claimProgressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#00ff00',
    opacity: 0.6,
    borderRadius: 0,
  },
  claimButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  
  // Avatar Portrait Styles
  pixelAvatar: {
    width: 27, // 9 pixels * 3px each = 27px
    height: 24, // 8 rows * 3px each = 24px
    alignItems: 'center',
    justifyContent: 'center',
  },


  avatarMenuButtonBorder: {
    backgroundColor: '#4a4a4a',
    borderWidth: 3,
    borderTopColor: '#888888',
    borderLeftColor: '#888888', 
    borderRightColor: '#222222',
    borderBottomColor: '#222222',
    borderRadius: 0,
    padding: 4,
  },
  avatarMenuButtonInner: {
    backgroundColor: '#666666',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 0,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Center Location Button - Bottom Right
  centerLocationButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    zIndex: 1000,
  },
  centerLocationButtonBorder: {
    backgroundColor: '#4a4a4a',
    borderWidth: 3,
    borderTopColor: '#888888',
    borderLeftColor: '#888888', 
    borderRightColor: '#222222',
    borderBottomColor: '#222222',
    borderRadius: 0,
    minWidth: 50,
    minHeight: 50,
  },
  centerLocationButtonInner: {
    backgroundColor: '#666666',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 0,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  centerLocationButtonIcon: {
    fontSize: 20,
  },

  // Centered Menu Overlay
  slideUpMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent backdrop
    paddingHorizontal: 20,
    zIndex: 1500, // Higher z-index to be above everything
    justifyContent: 'center', // Center the entire menu
    alignItems: 'center',
  },

  menuModal: {
    backgroundColor: 'rgba(42, 42, 42, 0.95)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffdd00',
    padding: 20,
    minWidth: 250,
  },

  menuContent: {
    alignItems: 'center',
  },

  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderWidth: 2,
    borderColor: '#666666',
    borderRadius: 0,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginVertical: 8, // More space between buttons
    minWidth: 220,
  },

  menuButtonIcon: {
    fontSize: 16,
    marginRight: 12,
  },

  menuButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
}); 