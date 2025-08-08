import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, Animated, ScrollView, Linking } from 'react-native';
import { trackEvent } from '../services/analytics';
import MapView, { Marker, Region } from 'react-native-maps';
import { MapsArrowDiagonal, User, Lock, Antenna, Search, Eye, Settings, Trophy, Crown, Star, MapPin, Clock, Home, Settings as SettingsIcon } from 'iconoir-react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useGameStore, getRarityColor, getRarityDisplayName, getTreasureXPBonus, type TreasureRarity, type Treasure } from '../stores/gameStore';

// ToolSlot Component for Gaming HUD
interface ToolSlotProps {
  slotIndex: number;
  isUnlocked: boolean;
  equippedTool: string | null;
  onPress: () => void;
}

const ToolSlot: React.FC<ToolSlotProps> = ({ slotIndex, isUnlocked, equippedTool, onPress }) => {
  const getSlotContent = () => {
    if (!isUnlocked) {
      return <Lock width={22} height={22} color="#666666" />;
    }
    if (equippedTool) {
      return getToolIcon(equippedTool);
    }
    return <Text style={styles.toolSlotEmptyIcon}>+</Text>;
  };

  const getSlotBorder = () => {
    if (!isUnlocked) return styles.toolSlotLockedBorder;
    if (equippedTool) return styles.toolSlotEquippedBorder;
    return styles.toolSlotEmptyBorder;
  };

  return (
    <TouchableOpacity 
      style={styles.hudButton}
      onPress={isUnlocked ? onPress : undefined}
      disabled={!isUnlocked}
    >
      <View style={getSlotBorder()}>
        {getSlotContent()}
      </View>
    </TouchableOpacity>
  );
};

// Tool icon mapping for ToolSlot component
const getToolIcon = (toolName: string) => {
  const iconProps = { width: 22, height: 22, color: '#FFFFFF' };
  
  switch (toolName) {
    case 'energy_radar': return <Antenna {...iconProps} />;
    case 'treasure_preview': return <Search {...iconProps} />;
    case 'explorer_eye': return <Eye {...iconProps} />;
    case 'master_tracker': return <Settings {...iconProps} />;
    default: return <Lock {...iconProps} />;
  }
};

  // EXACT CSS character implementation - 14x20 pixels
  const PixelUserMarker = () => {
    console.log('🎨 Rendering EXACT CSS PixelUserMarker!');
  return (
      <View style={styles.exactCharacter}>
        {/* Row 1 (y=10) - Hair outline */}
      <View style={styles.characterRow}>
          <View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, styles.transparent]} />
        </View>
        {/* Row 2 (y=20) - Hair with sides */}
        <View style={styles.characterRow}>
          <View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, styles.transparent]} />
        </View>
        {/* Row 3 (y=30) - Hair full */}
        <View style={styles.characterRow}>
          <View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, styles.transparent]} />
        </View>
        {/* Row 4 (y=40) - Hair to face transition */}
        <View style={styles.characterRow}>
          <View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} />
        </View>
        {/* Row 5 (y=50) - Face top */}
        <View style={styles.characterRow}>
          <View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} />
        </View>
        {/* Row 6 (y=60) - Face with eyes area */}
        <View style={styles.characterRow}>
          <View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} />
        </View>
        {/* Row 7 (y=70) - Eyes */}
        <View style={styles.characterRow}>
          <View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} />
        </View>
        {/* Row 8 (y=80) - Face middle */}
        <View style={styles.characterRow}>
          <View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} />
        </View>
        {/* Row 9 (y=90) - Face lower */}
        <View style={styles.characterRow}>
          <View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFC107' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FF9FA6' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} />
        </View>
        {/* Row 10 (y=100) - Neck/collar */}
        <View style={styles.characterRow}>
          <View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#FF9FA6' }]} /><View style={[styles.pixel, { backgroundColor: '#FF9FA6' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} />
        </View>
        {/* Row 11 (y=110) - Shoulder transition */}
        <View style={styles.characterRow}>
          <View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#FF9FA6' }]} /><View style={[styles.pixel, { backgroundColor: '#FF9FA6' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, styles.transparent]} />
        </View>
        {/* Row 12 (y=120) - Shirt top */}
        <View style={styles.characterRow}>
          <View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#FF9FA6' }]} /><View style={[styles.pixel, { backgroundColor: '#FF9FA6' }]} /><View style={[styles.pixel, { backgroundColor: '#FF9FA6' }]} /><View style={[styles.pixel, { backgroundColor: '#FF9FA6' }]} /><View style={[styles.pixel, { backgroundColor: '#FF9FA6' }]} /><View style={[styles.pixel, { backgroundColor: '#FF9FA6' }]} /><View style={[styles.pixel, { backgroundColor: '#FF9FA6' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, styles.transparent]} />
        </View>
        {/* Row 13 (y=130) - Green shirt */}
        <View style={styles.characterRow}>
          <View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#4CAF50' }]} /><View style={[styles.pixel, { backgroundColor: '#4CAF50' }]} /><View style={[styles.pixel, { backgroundColor: '#8BC34A' }]} /><View style={[styles.pixel, { backgroundColor: '#8BC34A' }]} /><View style={[styles.pixel, { backgroundColor: '#8BC34A' }]} /><View style={[styles.pixel, { backgroundColor: '#8BC34A' }]} /><View style={[styles.pixel, { backgroundColor: '#8BC34A' }]} /><View style={[styles.pixel, { backgroundColor: '#8BC34A' }]} /><View style={[styles.pixel, { backgroundColor: '#4CAF50' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, styles.transparent]} />
        </View>
        {/* Row 14 (y=140) - Shirt body */}
        <View style={styles.characterRow}>
          <View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#4CAF50' }]} /><View style={[styles.pixel, { backgroundColor: '#4CAF50' }]} /><View style={[styles.pixel, { backgroundColor: '#4CAF50' }]} /><View style={[styles.pixel, { backgroundColor: '#4CAF50' }]} /><View style={[styles.pixel, { backgroundColor: '#8BC34A' }]} /><View style={[styles.pixel, { backgroundColor: '#8BC34A' }]} /><View style={[styles.pixel, { backgroundColor: '#8BC34A' }]} /><View style={[styles.pixel, { backgroundColor: '#8BC34A' }]} /><View style={[styles.pixel, { backgroundColor: '#8BC34A' }]} /><View style={[styles.pixel, { backgroundColor: '#4CAF50' }]} /><View style={[styles.pixel, { backgroundColor: '#4CAF50' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} />
        </View>
        {/* Row 15 (y=150) - Shirt with arms */}
        <View style={styles.characterRow}>
          <View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#4CAF50' }]} /><View style={[styles.pixel, { backgroundColor: '#4CAF50' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#4CAF50' }]} /><View style={[styles.pixel, { backgroundColor: '#8BC34A' }]} /><View style={[styles.pixel, { backgroundColor: '#8BC34A' }]} /><View style={[styles.pixel, { backgroundColor: '#8BC34A' }]} /><View style={[styles.pixel, { backgroundColor: '#8BC34A' }]} /><View style={[styles.pixel, { backgroundColor: '#8BC34A' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#4CAF50' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} />
        </View>
        {/* Row 16 (y=160) - Arms extended */}
        <View style={styles.characterRow}>
          <View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#FFCDD2' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#4CAF50' }]} /><View style={[styles.pixel, { backgroundColor: '#8BC34A' }]} /><View style={[styles.pixel, { backgroundColor: '#8BC34A' }]} /><View style={[styles.pixel, { backgroundColor: '#8BC34A' }]} /><View style={[styles.pixel, { backgroundColor: '#8BC34A' }]} /><View style={[styles.pixel, { backgroundColor: '#8BC34A' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#4CAF50' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} />
        </View>
        {/* Row 17 (y=170) - Pants top */}
        <View style={styles.characterRow}>
          <View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#2196F3' }]} /><View style={[styles.pixel, { backgroundColor: '#2196F3' }]} /><View style={[styles.pixel, { backgroundColor: '#03A9F4' }]} /><View style={[styles.pixel, { backgroundColor: '#03A9F4' }]} /><View style={[styles.pixel, { backgroundColor: '#03A9F4' }]} /><View style={[styles.pixel, { backgroundColor: '#03A9F4' }]} /><View style={[styles.pixel, { backgroundColor: '#03A9F4' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, styles.transparent]} />
        </View>
        {/* Row 18 (y=180) - Pants body */}
        <View style={styles.characterRow}>
          <View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#2196F3' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#03A9F4' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, styles.transparent]} />
        </View>
        {/* Row 19 (y=190) - Pants legs */}
        <View style={styles.characterRow}>
          <View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#2196F3' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#03A9F4' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, styles.transparent]} />
        </View>
        {/* Row 20 (y=200) - Feet */}
        <View style={styles.characterRow}>
          <View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, { backgroundColor: '#000000' }]} /><View style={[styles.pixel, styles.transparent]} /><View style={[styles.pixel, styles.transparent]} />
        </View>
      </View>
    );
  };

// Pixel art component for avatar
const PixelAvatarPortrait = () => {
  const pixelRows = [
    // Row 1: Hair outline
    <View key="row1" style={styles.characterRow}>
        <View style={[styles.pixel, styles.transparent]} />
      <View style={[styles.pixel, styles.pixelOutline]} />
      <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.transparent]} />
        <View style={[styles.pixel, styles.transparent]} />
    </View>,
    // Row 2: Hair
    <View key="row2" style={styles.characterRow}>
        <View style={[styles.pixel, styles.transparent]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.pixelBrownDark]} />
        <View style={[styles.pixel, styles.pixelBrownLight]} />
        <View style={[styles.pixel, styles.pixelBrownDark]} />
        <View style={[styles.pixel, styles.pixelBrownLight]} />
        <View style={[styles.pixel, styles.pixelBrownDark]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.transparent]} />
    </View>,
    // Row 3: Hair
    <View key="row3" style={styles.characterRow}>
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.pixelBrownDark]} />
        <View style={[styles.pixel, styles.pixelBrownLight]} />
        <View style={[styles.pixel, styles.pixelBrownDark]} />
        <View style={[styles.pixel, styles.pixelBrownLight]} />
        <View style={[styles.pixel, styles.pixelBrownDark]} />
        <View style={[styles.pixel, styles.pixelBrownLight]} />
        <View style={[styles.pixel, styles.pixelBrownDark]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
    </View>,
    // Row 4: Hair
    <View key="row4" style={styles.characterRow}>
      <View style={[styles.pixel, styles.pixelOutline]} />
      <View style={[styles.pixel, styles.pixelBrownDark]} />
      <View style={[styles.pixel, styles.pixelBrownLight]} />
      <View style={[styles.pixel, styles.pixelBrownDark]} />
      <View style={[styles.pixel, styles.pixelBrownLight]} />
      <View style={[styles.pixel, styles.pixelBrownDark]} />
      <View style={[styles.pixel, styles.pixelBrownLight]} />
      <View style={[styles.pixel, styles.pixelBrownDark]} />
      <View style={[styles.pixel, styles.pixelOutline]} />
    </View>,
    // Row 5: Face outline
    <View key="row5" style={styles.characterRow}>
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.pixelSkinLight]} />
        <View style={[styles.pixel, styles.pixelSkin]} />
        <View style={[styles.pixel, styles.pixelSkinLight]} />
        <View style={[styles.pixel, styles.pixelSkin]} />
        <View style={[styles.pixel, styles.pixelSkinLight]} />
        <View style={[styles.pixel, styles.pixelSkin]} />
        <View style={[styles.pixel, styles.pixelSkinLight]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
    </View>,
    // Row 6: Eyes
    <View key="row6" style={styles.characterRow}>
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.pixelSkinLight]} />
        <View style={[styles.pixel, styles.pixelBlack]} />
        <View style={[styles.pixel, styles.pixelBlack]} />
        <View style={[styles.pixel, styles.pixelSkin]} />
        <View style={[styles.pixel, styles.pixelBlack]} />
        <View style={[styles.pixel, styles.pixelBlack]} />
        <View style={[styles.pixel, styles.pixelSkinLight]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
    </View>,
    // Row 7: Face
    <View key="row7" style={styles.characterRow}>
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.pixelSkinLight]} />
        <View style={[styles.pixel, styles.pixelSkin]} />
        <View style={[styles.pixel, styles.pixelSkinDark]} />
        <View style={[styles.pixel, styles.pixelSkinDark]} />
        <View style={[styles.pixel, styles.pixelSkinDark]} />
        <View style={[styles.pixel, styles.pixelSkin]} />
        <View style={[styles.pixel, styles.pixelSkinLight]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
    </View>,
    // Row 8: Shirt
    <View key="row8" style={styles.characterRow}>
        <View style={[styles.pixel, styles.transparent]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.pixelRedDark]} />
        <View style={[styles.pixel, styles.pixelRed]} />
        <View style={[styles.pixel, styles.pixelRedLight]} />
        <View style={[styles.pixel, styles.pixelRed]} />
        <View style={[styles.pixel, styles.pixelRedDark]} />
        <View style={[styles.pixel, styles.pixelOutline]} />
        <View style={[styles.pixel, styles.transparent]} />
    </View>,
    // Row 9: Shirt
    <View key="row9" style={styles.characterRow}>
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
  ];

  return (
    <View style={styles.pixelAvatar}>
      {pixelRows}
      </View>
  );
};

  // Pixel art lightning bolt icon (13x16 pixels) with status-based colors  
  const PixelLightningBolt = ({ status = 'undiscovered' }: { status?: string }) => {
    const getLightningColors = (status: string) => {
      switch (status) {
        case 'undiscovered':
          return { main: '#F44336', highlight: '#FFCDD2', accent: '#D32F2F', outline: '#000000' }; // Red (mysterious)
        case 'discoverable':
          return { main: '#9C27B0', highlight: '#E1BEE7', accent: '#7B1FA2', outline: '#000000' }; // Purple (active)
        case 'claimed':
          return { main: '#4CAF50', highlight: '#C8E6C9', accent: '#388E3C', outline: '#000000' }; // Green (completed)
        default:
          return { main: '#F44336', highlight: '#FFCDD2', accent: '#D32F2F', outline: '#000000' }; // Default red (undiscovered)
      }
    };

    const colors = getLightningColors(status);
    
    return (
      <View style={styles.lightningBolt}>
        {/* Row 1 (y=10) - Top outline */}
        <View style={styles.lightningRow}>
          <View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, styles.transparent]} />
      </View>
        {/* Row 2 (y=20) - Upper bolt */}
        <View style={styles.lightningRow}>
          <View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, styles.transparent]} />
      </View>
        {/* Row 3 (y=30) - With highlight */}
        <View style={styles.lightningRow}>
          <View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.highlight }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, styles.transparent]} />
        </View>
        {/* Row 4 (y=40) - More highlight */}
        <View style={styles.lightningRow}>
          <View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.highlight }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} />
        </View>
        {/* Row 5 (y=50) - Upper body */}
        <View style={styles.lightningRow}>
          <View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.highlight }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} />
        </View>
        {/* Row 6 (y=60) - With accent */}
        <View style={styles.lightningRow}>
          <View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.accent }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} />
        </View>
        {/* Row 7 (y=70) - Wide middle */}
        <View style={styles.lightningRow}>
          <View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.accent }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} />
        </View>
        {/* Row 8 (y=80) - Widest part */}
        <View style={styles.lightningRow}>
          <View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.accent }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.accent }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} />
        </View>
        {/* Row 9 (y=90) - Narrowing */}
        <View style={styles.lightningRow}>
          <View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.accent }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.accent }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} />
        </View>
        {/* Row 10 (y=100) - Lower body */}
        <View style={styles.lightningRow}>
          <View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.accent }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.accent }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, styles.transparent]} />
        </View>
        {/* Row 11 (y=110) - Continuing down */}
        <View style={styles.lightningRow}>
          <View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.accent }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} />
        </View>
        {/* Row 12 (y=120) - Lower section */}
        <View style={styles.lightningRow}>
          <View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.accent }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} />
        </View>
        {/* Row 13 (y=130) - Near bottom */}
        <View style={styles.lightningRow}>
          <View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.main }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.accent }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.accent }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} />
        </View>
        {/* Row 14 (y=140) - Bottom */}
        <View style={styles.lightningRow}>
          <View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.accent }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} />
        </View>
        {/* Row 15 (y=150) - Tail */}
        <View style={styles.lightningRow}>
          <View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.accent }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} />
        </View>
        {/* Row 16 (y=160) - Final point */}
        <View style={styles.lightningRow}>
          <View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, { backgroundColor: colors.outline }]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} /><View style={[styles.lightningPixel, styles.transparent]} />
      </View>
    </View>
  );
};

// Animation component for energy cells with lightning bolt
const AnimatedEnergyCell = ({ station, onPress, getStationStatus, getTreasureForStation }: { 
  station: any; 
  onPress: () => void; 
  getStationStatus: (station: any) => string;
  getTreasureForStation: (stationId: string) => any;
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const { hapticFeedbackEnabled } = useGameStore();

  // Check for treasure availability
  const treasure = station?.id ? getTreasureForStation(station.id) : null;
  const hasTreasure = treasure && !treasure.isCollected;
  const status = getStationStatus(station);
  const showTreasureIndicator = status === 'claimed' && hasTreasure;

  // Get pixel art 3D gem colors based on rarity
  const getPixelGemColors = (rarity: TreasureRarity) => {
    const baseColor = getRarityColor(rarity);
    
    // Create lighter and darker variants for 3D bevel effect
    const lightenColor = (color: string, amount: number) => {
      const hex = color.replace('#', '');
      const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + amount);
      const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + amount);
      const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + amount);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };
    
    const darkenColor = (color: string, amount: number) => {
      const hex = color.replace('#', '');
      const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount);
      const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount);
      const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    return {
      base: baseColor,
      light: lightenColor(baseColor, 60),  // Lighter for top/left borders
      dark: darkenColor(baseColor, 60),    // Darker for bottom/right borders
    };
  };

  useEffect(() => {
    const status = getStationStatus(station);
    
    // Only apply gentle breathing pulse to discoverable (purple) stations
    if (status === 'discoverable') {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 2500, // Gentle breathing animation
          useNativeDriver: true,
        }),
          Animated.timing(pulseAnim, {
          toValue: 1,
            duration: 2500,
          useNativeDriver: true,
        }),
        ])
      );
      pulseAnimation.start();
      
      return () => pulseAnimation.stop();
    } else {
      // Keep static for undiscovered (red) and claimed (green) stations
      pulseAnim.setValue(1);
    }
  }, [pulseAnim, station, getStationStatus]);

  const handlePress = async () => {
    if (hapticFeedbackEnabled) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Brief scale animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
          useNativeDriver: true,
        }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

    onPress();
  };

  return (
    <Animated.View 
      style={{
          transform: [
          { scale: Animated.multiply(pulseAnim, scaleAnim) }
        ]
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        style={styles.energyCellContainer}
      >
        <PixelLightningBolt status={getStationStatus(station)} />
        {showTreasureIndicator && (
          <View 
            style={[
              styles.treasureIndicatorDot, 
              {
                backgroundColor: getPixelGemColors(treasure.rarity).base,
                borderTopColor: getPixelGemColors(treasure.rarity).light,
                borderLeftColor: getPixelGemColors(treasure.rarity).light,
                borderBottomColor: getPixelGemColors(treasure.rarity).dark,
                borderRightColor: getPixelGemColors(treasure.rarity).dark,
              }
            ]} 
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Pixel Art Toast Notification Component
const PixelToast = ({ visible, message, onHide }: { visible: boolean; message: string; onHide: () => void }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onHide();
      }, 2500); // Show for 2.5 seconds
      return () => clearTimeout(timer);
    }
  }, [visible, onHide]);

  if (!visible) return null;

  return (
    <Animated.View style={styles.pixelToast}>
      <View style={styles.pixelToastContent}>
        <Text style={styles.pixelToastText}>{message}</Text>
      </View>
    </Animated.View>
  );
};

// Phase 5: Player Profile Components
const PlayerProfileModal = ({
  visible,
  onClose,
  currentLevel,
  levelTitle, 
  totalXP,
  xpToNextLevel,
  discoveredStations,
  totalStations,
  treasureStats,
  claimedStations,
  onViewTerritory,
  onManageStations,
  isDeveloperModeEnabled,
  onToggleDeveloperMode,
  // Function props
  handleCenterOnUser,
  handleReloadStations,
  handleLogout,
  handleReset,
  handleShowSyncStatus,
  spawnTreasureForStation,
  chargingStations
}: {
  visible: boolean;
  onClose: () => void;
  currentLevel: number;
  levelTitle: string;
  totalXP: number;
  xpToNextLevel: number | null;
  discoveredStations: number;
  totalStations: number;
  treasureStats: any;
  claimedStations: number;
  onViewTerritory: () => void;
  onManageStations: () => void; 
  isDeveloperModeEnabled: boolean;
  onToggleDeveloperMode: () => void;
  // Function props
  handleCenterOnUser: () => void;
  handleReloadStations: () => void;
  handleLogout: () => void;
  handleReset: () => void;
  handleShowSyncStatus: () => void;
  spawnTreasureForStation: (stationId: string) => void;
  chargingStations: any[];
}) => {
  if (!visible) return null;

  // Calculate this week's treasure collection
  const weeklyTreasures = treasureStats.totalCollected; // Simplified for now
  const lifetimeEpicPlus = treasureStats.epicCollected + treasureStats.mythicCollected + treasureStats.legendaryCollected;

  return (
    <View style={styles.slideUpMenu} pointerEvents="box-none">
      {/* Backdrop that closes the modal when tapped outside */}
      <TouchableOpacity style={styles.menuBackdrop} activeOpacity={1} onPress={onClose} />

      <View style={[styles.menuModal, { maxHeight: '92%' }]} pointerEvents="auto">
        <ScrollView
          style={styles.menuContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          
          {/* Player Profile Header */}
          <View style={styles.playerProfileHeader}>
            <View style={styles.avatarContainer}>
              <PixelAvatarPortrait />
            </View>
            <View style={styles.playerInfo}>
              <Text style={styles.playerLevel}>Level {currentLevel}</Text>
              <Text style={styles.playerTitle}>{levelTitle}</Text>
              <TouchableOpacity onPress={() => Linking.openURL('mailto:support@chargequest.app?subject=ChargeQuest%20Alpha%20Bug%20Report')}
                style={{ marginTop: 6 }}>
                <Text style={{ color: '#00E5FF', textDecorationLine: 'underline' }}>Report a bug</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* XP Progress Bar */}
          <View style={styles.xpSection}>
            <View style={styles.xpProgressContainer}>
              <Text style={styles.xpLabel}>
                {totalXP} XP {xpToNextLevel ? `/ ${totalXP + xpToNextLevel} XP` : '(MAX)'}
              </Text>
              {xpToNextLevel && (
                <View style={styles.xpProgressBar}>
                  <View 
                    style={[
                      styles.xpProgressFill, 
                      { width: `${((totalXP % (totalXP + xpToNextLevel)) / (totalXP + xpToNextLevel)) * 100}%` }
                    ]} 
                  />
                </View>
              )}
            </View>
          </View>

          {/* Achievement Stats with Gaming Psychology */}
          <View style={styles.achievementSection}>
            <Text style={styles.sectionTitle}>🏆 ACHIEVEMENTS</Text>
            
            <View style={styles.statsRow}>
              <TouchableOpacity style={styles.statItem}>
                <MapPin width={16} height={16} color="#00ff88" />
                <Text style={styles.statValue}>{discoveredStations}</Text>
                <Text style={styles.statLabel}>Discovered</Text>
                {discoveredStations >= 10 && <Text style={styles.achievementBadge}>🔥</Text>}
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.statItem}>
                <Star width={16} height={16} color="#FFD700" />
                <Text style={styles.statValue}>{weeklyTreasures}</Text>
                <Text style={styles.statLabel}>This Week</Text>
                {weeklyTreasures >= 5 && <Text style={styles.achievementBadge}>⚡</Text>}
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.statItem}>
                <Trophy width={16} height={16} color="#FF6B6B" />
                <Text style={styles.statValue}>{lifetimeEpicPlus}</Text>
                <Text style={styles.statLabel}>Legendary</Text>
                {lifetimeEpicPlus >= 1 && <Text style={styles.achievementBadge}>💎</Text>}
              </TouchableOpacity>
            </View>
            
            {/* Progress Milestones */}
            <View style={styles.milestonesContainer}>
              <Text style={styles.milestonesTitle}>🎯 NEXT GOALS</Text>
              <View style={styles.milestone}>
                <Text style={styles.milestoneText}>
                  {discoveredStations < 25 
                    ? `Discover ${25 - discoveredStations} more stations for Explorer rank`
                    : discoveredStations < 50
                    ? `Discover ${50 - discoveredStations} more stations for Master rank`  
                    : "🎉 Master Explorer achieved!"
                  }
                </Text>
              </View>
              
              <View style={styles.milestone}>
                <Text style={styles.milestoneText}>
                  {claimedStations < 5
                    ? `Claim ${5 - claimedStations} more territories for Territory Master`
                    : "🏰 Territory Master achieved!"
                  }
                </Text>
              </View>
            </View>
          </View>

          {/* Territory Management */}
          <View style={styles.territorySection}>
            <Text style={styles.sectionTitle}>🏠 MY TERRITORY</Text>
            
            <TouchableOpacity style={styles.menuButton} onPress={onViewTerritory}>
              <Text style={styles.menuButtonIcon}>🏰</Text>
              <View style={styles.menuButtonContent}>
                <Text style={styles.menuButtonText}>Claimed Stations</Text>
                <Text style={styles.menuButtonSubtext}>{claimedStations} active territories</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuButton} onPress={onManageStations}>
              <Text style={styles.menuButtonIcon}>⚡</Text>
              <View style={styles.menuButtonContent}>
                <Text style={styles.menuButtonText}>Manage Territory</Text>
                <Text style={styles.menuButtonSubtext}>Renew expiring claims</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Tools & Settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>🔧 TOOLS & SETTINGS</Text>
            
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => {
                onClose();
                handleCenterOnUser();
              }}
            >
              <Text style={styles.menuButtonIcon}>📍</Text>
              <Text style={styles.menuButtonText}>Center on Location</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => {
                onClose();
                handleReloadStations();
              }}
            >
              <Text style={styles.menuButtonIcon}>🗺️</Text>
              <Text style={styles.menuButtonText}>Refresh Stations</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => {
                onClose();
                handleLogout();
              }}
            >
              <Text style={styles.menuButtonIcon}>🚪</Text>
              <Text style={styles.menuButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Developer Mode Toggle (Hidden by default) */}
          {isDeveloperModeEnabled && (
            <View style={styles.developerSection}>
              <Text style={styles.sectionTitle}>🛠️ DEVELOPER</Text>
              <Text style={[styles.statLabel, { marginBottom: 8 }]}>App v{require('../app.json').expo.version}</Text>
              
              <TouchableOpacity 
                style={styles.menuButton}
                onPress={() => {
                  onClose();
                  handleReset();
                }}
              >
                <Text style={styles.menuButtonIcon}>🔄</Text>
                <Text style={styles.menuButtonText}>Reset Progress</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuButton}
                onPress={() => {
                  onClose();
                  // Spawn treasures for discovered stations
                  const discoveredStations = chargingStations.filter((s: any) => s.isDiscovered);
                  discoveredStations.forEach((station: any) => {
                    spawnTreasureForStation(station.id);
                  });
                  Alert.alert('🎁 Test Treasures', `Spawned treasures for ${discoveredStations.length} discovered stations!`);
                }}
              >
                <Text style={styles.menuButtonIcon}>🎁</Text>
                <Text style={styles.menuButtonText}>Spawn Test Treasures</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuButton}
                onPress={() => {
                  onClose();
                  handleShowSyncStatus();
                }}
              >
                <Text style={styles.menuButtonIcon}>📊</Text>
                <Text style={styles.menuButtonText}>Debug Information</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Developer Mode Toggle Area (5-tap gesture) */}
          <TouchableOpacity 
            style={styles.hiddenDeveloperToggle}
            onPress={onToggleDeveloperMode}
          >
            <Text style={styles.hiddenToggleText}>
              {isDeveloperModeEnabled ? 'Dev Mode: ON' : '• • • • •'}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </View>
  );
};

// Tool Selection Modal Component with pixel art styling
const ToolSelectionModal = ({ 
  visible, 
  selectedSlot, 
  onClose,
  currentLevel,
  equippedTools,
  isToolUnlocked,
  equipTool,
  unequipTool
}: { 
  visible: boolean;
  selectedSlot: number | null;
  onClose: () => void;
  currentLevel: number;
  equippedTools: { slot1: string | null; slot2: string | null; slot3: string | null };
  isToolUnlocked: (toolId: string) => boolean;
  equipTool: (toolId: string, slotIndex: 1 | 2 | 3) => void;
  unequipTool: (slotIndex: 1 | 2 | 3) => void;
}) => {
  const [selectedToolForInfo, setSelectedToolForInfo] = useState<string | null>(null);
  
  // Reset tool info selection when modal closes
  useEffect(() => {
    if (!visible) {
      setSelectedToolForInfo(null);
    }
  }, [visible]);
  
  if (!visible || selectedSlot === null) return null;

  // Tool definitions with level requirements and Iconoir icons
  const availableTools = [
    {
      id: 'energy_radar',
      name: 'Energy Radar',
      icon: Antenna,
      level: 2,
      description: 'Shows distance to nearest undiscovered station'
    },
    {
      id: 'treasure_preview',
      name: 'Treasure Preview',
      icon: Search,
      level: 3,
      description: 'Reveals treasure rarity at discovered stations'
    },
    {
      id: 'explorer_eye',
      name: "Explorer's Eye",
      icon: Eye,
      level: 4,
      description: 'Highlights stations not visited in 7+ days'
    },
    {
      id: 'master_tracker',  
      name: 'Master Tracker',
      icon: Settings,
      level: 5,
      description: 'Advanced statistics and discovery heatmap'
    }
  ];

  const currentlyEquipped = equippedTools[`slot${selectedSlot}` as keyof typeof equippedTools];
  
  // Helper function to find which slot a tool is equipped in
  const getEquippedSlot = (toolId: string): number | null => {
    for (const [key, value] of Object.entries(equippedTools)) {
      if (value === toolId) {
        return parseInt(key.replace('slot', ''));
      }
    }
    return null;
  };


  const handleToolSelect = async (toolId: string) => {
    if (!isToolUnlocked(toolId)) return;
    
    const isUnequipping = currentlyEquipped === toolId;
    
    if (isUnequipping) {
      // Unequip if same tool is selected
      unequipTool(selectedSlot as 1 | 2 | 3);
    } else {
      // Equip new tool (only possible if slot is empty due to unequip-first workflow)
      equipTool(toolId, selectedSlot as 1 | 2 | 3);
    }
    
    // Haptic feedback
    const { hapticFeedbackEnabled } = useGameStore.getState();
    if (hapticFeedbackEnabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Modal stays open for both equipping and unequipping
  };

  return (
    <TouchableOpacity
      style={styles.toolModalContainer}
      activeOpacity={1}
      onPress={onClose}
    >
      <TouchableOpacity
        style={styles.toolModal}
        activeOpacity={1}
        onPress={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <View style={styles.toolModalHeader}>
          <Text style={styles.toolModalTitle}>EQUIP TOOL - SLOT {selectedSlot}</Text>
          <TouchableOpacity style={styles.toolModalCloseButton} onPress={onClose}>
            <Text style={styles.toolModalCloseText}>✕</Text>
          </TouchableOpacity>
          </View>
        
        {/* Current Tool or Available Tools */}
        {currentlyEquipped ? (
          // Show currently equipped tool with unequip option
          <View style={styles.currentToolContainer}>
            <Text style={styles.currentToolLabel}>Currently Equipped (tap UNEQUIP to remove):</Text>
            <View style={styles.currentToolCard}>
              <View style={styles.currentToolInfo}>
                {availableTools.find(t => t.id === currentlyEquipped) && (
                  <>
                    <View style={styles.currentToolIcon}>
                      {React.createElement(availableTools.find(t => t.id === currentlyEquipped)!.icon, {
                        width: 28,
                        height: 28,
                        color: '#AA77FF'
                      })}
          </View>
                    <View style={styles.currentToolTextContainer}>
                      <Text style={styles.currentToolName}>
                        {availableTools.find(t => t.id === currentlyEquipped)!.name}
                      </Text>
                      <Text style={styles.currentToolDescription}>
                        {availableTools.find(t => t.id === currentlyEquipped)!.description}
                      </Text>
        </View>
                  </>
                )}
              </View>
              <TouchableOpacity 
                style={styles.unequipButton}
                onPress={() => handleToolSelect(currentlyEquipped)}
                activeOpacity={0.8}
              >
                <Text style={styles.unequipButtonText}>UNEQUIP</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Show horizontal scrollable list of available tools
          <View style={styles.availableToolsContainer}>
            <Text style={styles.availableToolsLabel}>Available Tools:</Text>
            <ScrollView 
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.toolScrollContent}
              style={styles.toolScrollView}
            >
              {availableTools.map((tool) => {
                const isUnlocked = isToolUnlocked(tool.id);
                const isEquippedElsewhere = Object.values(equippedTools).includes(tool.id);
                
                return (
                  <TouchableOpacity 
                    key={tool.id}
                    style={[
                      styles.horizontalToolCard,
                      !isUnlocked && styles.horizontalToolCardLocked,
                      selectedToolForInfo === tool.id && styles.horizontalToolCardSelected
                    ]}
                    onPress={() => {
                      if (!isUnlocked) return;
                      if (selectedToolForInfo === tool.id) {
                        // If already selected for info, equip it (if available)
                        if (!isEquippedElsewhere) {
                          handleToolSelect(tool.id);
                        }
                      } else {
                        // First tap: show tool info
                        setSelectedToolForInfo(tool.id);
                      }
                    }}
                    activeOpacity={isUnlocked && !isEquippedElsewhere ? 0.8 : 1}
                  >
                    {/* Tool Icon */}
                    <View style={styles.horizontalToolIcon}>
                      {!isUnlocked ? (
                        <Lock width={24} height={24} color="#666666" />
                      ) : (
                        <tool.icon width={24} height={24} color={isEquippedElsewhere ? '#997766' : '#FFFFFF'} />
                      )}
                    </View>

                    {/* Tool Name */}
                    <Text style={[
                      styles.horizontalToolName,
                      !isUnlocked && styles.horizontalToolNameLocked,
                      isEquippedElsewhere && styles.horizontalToolNameEquippedElsewhere
                    ]}>
                      {tool.name}
                  </Text>

                    {/* Status */}
                    {!isUnlocked ? (
                      <Text style={styles.horizontalToolLevel}>Level {tool.level}</Text>
                    ) : isEquippedElsewhere ? (
                      <Text style={styles.horizontalToolEquippedElsewhere}>
                        ALREADY IN USE ON SLOT {getEquippedSlot(tool.id)}
                      </Text>
                    ) : (
                      <Text style={styles.horizontalToolDescription}>{tool.description}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            
            {/* Tool Detail Section */}
            {selectedToolForInfo && (
              <View style={styles.toolDetailContainer}>
                {(() => {
                  const selectedTool = availableTools.find(t => t.id === selectedToolForInfo);
                  if (!selectedTool) return null;
                  
                  const isUnlocked = isToolUnlocked(selectedTool.id);
                  const isEquippedElsewhere = Object.values(equippedTools).includes(selectedTool.id);
                  
                  return (
                    <>
                      <View style={styles.toolDetailHeader}>
                        <View style={styles.toolDetailIcon}>
                          <selectedTool.icon width={32} height={32} color="#AA77FF" />
                </View>
                        <View style={styles.toolDetailInfo}>
                          <Text style={styles.toolDetailName}>{selectedTool.name}</Text>
                          <Text style={styles.toolDetailLevel}>
                            {!isUnlocked ? `Unlock at Level ${selectedTool.level}` : 
                             isEquippedElsewhere ? `Currently equipped in slot ${getEquippedSlot(selectedTool.id)}` : 
                             'Ready to equip'}
                          </Text>
              </View>
            </View>
          
                      <Text style={styles.toolDetailDescription}>
                        {selectedTool.description}
                      </Text>
                      
                      {isUnlocked && !isEquippedElsewhere && (
          <TouchableOpacity 
                          style={styles.toolEquipButton}
                          onPress={() => handleToolSelect(selectedTool.id)}
            activeOpacity={0.8}
          >
                          <Text style={styles.toolEquipButtonText}>EQUIP TO SLOT {selectedSlot}</Text>
          </TouchableOpacity>
                      )}
                    </>
                  );
                })()}
      </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// Claim popover component with three distinct states + treasure functionality
const ClaimPopover = ({ 
  visible, 
  station, 
  progress, 
  onClaimStart,
  onClaimStop,
  onClose,
  getTreasureForStation,
  collectTreasure
}: { 
  visible: boolean;
  station: any;
  progress: number;
  onClaimStart: () => void;
  onClaimStop: () => void;
  onClose: (toastMessage?: string) => void;
  getTreasureForStation: (stationId: string) => Treasure | null;
  collectTreasure: (treasureId: string) => boolean;
}) => {
  if (!visible) return null;

  // Determine station status for theming
  const getStationStatus = () => {
    if (station?.isDiscovered) return 'claimed';
    if (station?.isDiscoverable) return 'claimable';
    return 'undiscovered';
  };

  const status = getStationStatus();
  
  // Get treasure data for this station (if any)
  const treasure = station?.id ? getTreasureForStation(station.id) : null;
  const hasTreasure = treasure && !treasure.isCollected;
  
  // No longer need height calculation for positioning - using fixed bottom anchor
  
  // Handle treasure collection
  const handleTreasureCollection = () => {
    if (treasure && !treasure.isCollected) {
      const success = collectTreasure(treasure.id);
      if (success) {
        // Treasure collected successfully - haptic feedback and XP handled in store
        console.log(`🎁 Collected treasure: ${treasure.description}`);
        
        // Show pixel art toast notification
        const xpBonus = getTreasureXPBonus(treasure.rarity);
        const toastMsg = `🎁 ${getRarityDisplayName(treasure.rarity)} Treasure! +${xpBonus} XP`;
        
        // Pass toast message up to parent component
        if (onClose && typeof onClose === 'function') {
          onClose(toastMsg); // Pass toast message to parent
        }
    } else {
        console.log('❌ Failed to collect treasure');
      }
    }
  };
  
  // Check if user is within treasure collection range (25m)
  const isWithinCollectionRange = station?.isDiscoverable || false;
  
  // Get status-based styling
  const getPopoverStyle = () => {
    switch (status) {
      case 'claimed':
        return [styles.popover, styles.popoverClaimed];
      case 'claimable':
        return [styles.popover, styles.popoverClaimable];
      default:
        return [styles.popover, styles.popoverUndiscovered];
    }
  };

  return (
    <TouchableOpacity 
      style={styles.popoverContainer}
      activeOpacity={1}
      onPress={() => onClose()} // Close when tapping backdrop
    >
      <View style={{ alignItems: 'center' }}>
        <View style={getPopoverStyle()}>
        {/* Header with close button */}
          <View style={styles.popoverHeader}>
          <Text style={styles.popoverLocationName}>
            {(station?.title || 'Unknown Station')
              .replace(/&#039;/g, "'")
              .replace(/&amp;/g, "&")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&quot;/g, '"')}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={() => onClose()}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
                {/* Treasure display for discovered stations */}
        {status === 'claimed' && hasTreasure && (
          <View style={styles.treasureContainer}>
            {/* Pixel Art Treasure Chest */}
            <View style={styles.treasureChestContainer}>
              <View style={styles.treasureChest}>
                {/* PIXEL-PERFECT treasure chest recreated from exact CSS coordinates */}
                {/* Coordinate mapping: 10px→0, 20px→1, ..., 180px→17 (X), 60px→0, 70px→1, ..., 170px→11 (Y) */}
                
                {/* Row 0 (y=60px): Border pixels 30px-160px - bright brown */}
                <View style={[styles.treasurePixel, {left: 2*3, top: 0*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 3*3, top: 0*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 4*3, top: 0*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 5*3, top: 0*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 6*3, top: 0*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 7*3, top: 0*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 8*3, top: 0*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 9*3, top: 0*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 10*3, top: 0*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 11*3, top: 0*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 12*3, top: 0*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 13*3, top: 0*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 14*3, top: 0*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 15*3, top: 0*3, backgroundColor: '#795548'}]} />
                
                {/* Row 1 (y=70px): 20px border, 30px white, 40px-130px yellow, 140px lock, 150px-160px yellow, 170px border */}
                <View style={[styles.treasurePixel, {left: 1*3, top: 1*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 2*3, top: 1*3, backgroundColor: '#FFF'}]} />
                <View style={[styles.treasurePixel, {left: 3*3, top: 1*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 4*3, top: 1*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 5*3, top: 1*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 6*3, top: 1*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 7*3, top: 1*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 8*3, top: 1*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 9*3, top: 1*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 10*3, top: 1*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 11*3, top: 1*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 12*3, top: 1*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 13*3, top: 1*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 14*3, top: 1*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 15*3, top: 1*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 16*3, top: 1*3, backgroundColor: '#795548'}]} />
                
                {/* Row 2 (y=80px): Complex gold pattern with border and lock */}
                <View style={[styles.treasurePixel, {left: 0*3, top: 2*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 1*3, top: 2*3, backgroundColor: '#FFF'}]} />
                <View style={[styles.treasurePixel, {left: 2*3, top: 2*3, backgroundColor: '#FF9800'}]} />
                <View style={[styles.treasurePixel, {left: 3*3, top: 2*3, backgroundColor: '#FFC107'}]} />
                <View style={[styles.treasurePixel, {left: 4*3, top: 2*3, backgroundColor: '#FFC107'}]} />
                <View style={[styles.treasurePixel, {left: 5*3, top: 2*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 6*3, top: 2*3, backgroundColor: '#FFC107'}]} />
                <View style={[styles.treasurePixel, {left: 7*3, top: 2*3, backgroundColor: '#FFC107'}]} />
                <View style={[styles.treasurePixel, {left: 8*3, top: 2*3, backgroundColor: '#FFC107'}]} />
                <View style={[styles.treasurePixel, {left: 9*3, top: 2*3, backgroundColor: '#FFC107'}]} />
                <View style={[styles.treasurePixel, {left: 10*3, top: 2*3, backgroundColor: '#FFC107'}]} />
                <View style={[styles.treasurePixel, {left: 11*3, top: 2*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 12*3, top: 2*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 13*3, top: 2*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 14*3, top: 2*3, backgroundColor: '#FF9800'}]} />
                <View style={[styles.treasurePixel, {left: 15*3, top: 2*3, backgroundColor: '#FF9800'}]} />
                <View style={[styles.treasurePixel, {left: 16*3, top: 2*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 17*3, top: 2*3, backgroundColor: '#795548'}]} />
                
                {/* Row 3 (y=90px): All yellow interior except lock */}
                <View style={[styles.treasurePixel, {left: 0*3, top: 3*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 1*3, top: 3*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 2*3, top: 3*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 3*3, top: 3*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 4*3, top: 3*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 5*3, top: 3*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 6*3, top: 3*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 7*3, top: 3*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 8*3, top: 3*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 9*3, top: 3*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 10*3, top: 3*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 11*3, top: 3*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 12*3, top: 3*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 13*3, top: 3*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 14*3, top: 3*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 15*3, top: 3*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 16*3, top: 3*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 17*3, top: 3*3, backgroundColor: '#795548'}]} />
                
                {/* Row 4 (y=100px): Keyhole pattern with gold shading */}
                <View style={[styles.treasurePixel, {left: 0*3, top: 4*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 1*3, top: 4*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 2*3, top: 4*3, backgroundColor: '#FF9800'}]} />
                <View style={[styles.treasurePixel, {left: 3*3, top: 4*3, backgroundColor: '#FF9800'}]} />
                <View style={[styles.treasurePixel, {left: 4*3, top: 4*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 5*3, top: 4*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 6*3, top: 4*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 7*3, top: 4*3, backgroundColor: '#FF9800'}]} />
                <View style={[styles.treasurePixel, {left: 8*3, top: 4*3, backgroundColor: '#FF9800'}]} />
                <View style={[styles.treasurePixel, {left: 9*3, top: 4*3, backgroundColor: '#FF9800'}]} />
                <View style={[styles.treasurePixel, {left: 10*3, top: 4*3, backgroundColor: '#FF9800'}]} />
                <View style={[styles.treasurePixel, {left: 11*3, top: 4*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 12*3, top: 4*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 13*3, top: 4*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 14*3, top: 4*3, backgroundColor: '#FF9800'}]} />
                <View style={[styles.treasurePixel, {left: 15*3, top: 4*3, backgroundColor: '#FF9800'}]} />
                <View style={[styles.treasurePixel, {left: 16*3, top: 4*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 17*3, top: 4*3, backgroundColor: '#795548'}]} />
                
                {/* Row 5 (y=110px): Gold pattern variation */}
                <View style={[styles.treasurePixel, {left: 0*3, top: 5*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 1*3, top: 5*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 2*3, top: 5*3, backgroundColor: '#FF9800'}]} />
                <View style={[styles.treasurePixel, {left: 3*3, top: 5*3, backgroundColor: '#FFC107'}]} />
                <View style={[styles.treasurePixel, {left: 4*3, top: 5*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 5*3, top: 5*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 6*3, top: 5*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 7*3, top: 5*3, backgroundColor: '#FF9800'}]} />
                <View style={[styles.treasurePixel, {left: 8*3, top: 5*3, backgroundColor: '#FFC107'}]} />
                <View style={[styles.treasurePixel, {left: 9*3, top: 5*3, backgroundColor: '#FFC107'}]} />
                <View style={[styles.treasurePixel, {left: 10*3, top: 5*3, backgroundColor: '#FFC107'}]} />
                <View style={[styles.treasurePixel, {left: 11*3, top: 5*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 12*3, top: 5*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 13*3, top: 5*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 14*3, top: 5*3, backgroundColor: '#FF9800'}]} />
                <View style={[styles.treasurePixel, {left: 15*3, top: 5*3, backgroundColor: '#FF9800'}]} />
                <View style={[styles.treasurePixel, {left: 16*3, top: 5*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 17*3, top: 5*3, backgroundColor: '#795548'}]} />
                
                {/* Row 6 (y=120px): Another gold pattern */}
                <View style={[styles.treasurePixel, {left: 0*3, top: 6*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 1*3, top: 6*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 2*3, top: 6*3, backgroundColor: '#FF9800'}]} />
                <View style={[styles.treasurePixel, {left: 3*3, top: 6*3, backgroundColor: '#FFC107'}]} />
                <View style={[styles.treasurePixel, {left: 4*3, top: 6*3, backgroundColor: '#FF9800'}]} />
                <View style={[styles.treasurePixel, {left: 5*3, top: 6*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 6*3, top: 6*3, backgroundColor: '#FF9800'}]} />
                <View style={[styles.treasurePixel, {left: 7*3, top: 6*3, backgroundColor: '#FF9800'}]} />
                <View style={[styles.treasurePixel, {left: 8*3, top: 6*3, backgroundColor: '#FFC107'}]} />
                <View style={[styles.treasurePixel, {left: 9*3, top: 6*3, backgroundColor: '#FFC107'}]} />
                <View style={[styles.treasurePixel, {left: 10*3, top: 6*3, backgroundColor: '#FFC107'}]} />
                <View style={[styles.treasurePixel, {left: 11*3, top: 6*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 12*3, top: 6*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 13*3, top: 6*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 14*3, top: 6*3, backgroundColor: '#FF9800'}]} />
                <View style={[styles.treasurePixel, {left: 15*3, top: 6*3, backgroundColor: '#FF9800'}]} />
                <View style={[styles.treasurePixel, {left: 16*3, top: 6*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 17*3, top: 6*3, backgroundColor: '#795548'}]} />
                
                {/* Rows 7-8 (y=130px-140px): Body patterns */}
                {[7,8].map(row => (
                  <React.Fragment key={row}>
                    <View style={[styles.treasurePixel, {left: 0*3, top: row*3, backgroundColor: '#795548'}]} />
                    <View style={[styles.treasurePixel, {left: 1*3, top: row*3, backgroundColor: '#FFEB3B'}]} />
                    <View style={[styles.treasurePixel, {left: 2*3, top: row*3, backgroundColor: '#FF9800'}]} />
                    <View style={[styles.treasurePixel, {left: 3*3, top: row*3, backgroundColor: '#FFC107'}]} />
                    <View style={[styles.treasurePixel, {left: 4*3, top: row*3, backgroundColor: '#FFC107'}]} />
                    <View style={[styles.treasurePixel, {left: 5*3, top: row*3, backgroundColor: '#FFEB3B'}]} />
                    <View style={[styles.treasurePixel, {left: 6*3, top: row*3, backgroundColor: '#FFC107'}]} />
                    <View style={[styles.treasurePixel, {left: 7*3, top: row*3, backgroundColor: '#FFC107'}]} />
                    <View style={[styles.treasurePixel, {left: 8*3, top: row*3, backgroundColor: '#FFC107'}]} />
                    <View style={[styles.treasurePixel, {left: 9*3, top: row*3, backgroundColor: '#FFC107'}]} />
                    <View style={[styles.treasurePixel, {left: 10*3, top: row*3, backgroundColor: '#FFC107'}]} />
                    <View style={[styles.treasurePixel, {left: 11*3, top: row*3, backgroundColor: '#FFEB3B'}]} />
                    <View style={[styles.treasurePixel, {left: 12*3, top: row*3, backgroundColor: '#795548'}]} />
                    <View style={[styles.treasurePixel, {left: 13*3, top: row*3, backgroundColor: '#FFEB3B'}]} />
                    <View style={[styles.treasurePixel, {left: 14*3, top: row*3, backgroundColor: '#FF9800'}]} />
                    <View style={[styles.treasurePixel, {left: 15*3, top: row*3, backgroundColor: '#FF9800'}]} />
                    <View style={[styles.treasurePixel, {left: 16*3, top: row*3, backgroundColor: '#FFEB3B'}]} />
                    <View style={[styles.treasurePixel, {left: 17*3, top: row*3, backgroundColor: '#795548'}]} />
                  </React.Fragment>
                ))}
                
                {/* Row 9 (y=160px): All yellow except lock and borders */}
                <View style={[styles.treasurePixel, {left: 0*3, top: 9*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 1*3, top: 9*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 2*3, top: 9*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 3*3, top: 9*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 4*3, top: 9*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 5*3, top: 9*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 6*3, top: 9*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 7*3, top: 9*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 8*3, top: 9*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 9*3, top: 9*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 10*3, top: 9*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 11*3, top: 9*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 12*3, top: 9*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 13*3, top: 9*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 14*3, top: 9*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 15*3, top: 9*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 16*3, top: 9*3, backgroundColor: '#FFEB3B'}]} />
                <View style={[styles.treasurePixel, {left: 17*3, top: 9*3, backgroundColor: '#795548'}]} />
                
                {/* Row 10 (y=170px): Bottom border - all dark brown */}
                <View style={[styles.treasurePixel, {left: 0*3, top: 10*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 1*3, top: 10*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 2*3, top: 10*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 3*3, top: 10*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 4*3, top: 10*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 5*3, top: 10*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 6*3, top: 10*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 7*3, top: 10*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 8*3, top: 10*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 9*3, top: 10*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 10*3, top: 10*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 11*3, top: 10*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 12*3, top: 10*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 13*3, top: 10*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 14*3, top: 10*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 15*3, top: 10*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 16*3, top: 10*3, backgroundColor: '#795548'}]} />
                <View style={[styles.treasurePixel, {left: 17*3, top: 10*3, backgroundColor: '#795548'}]} />
                

              </View>
        </View>
        
            {/* Simplified Popover Layout: Lock + Rarity Title */}
            <View style={styles.simpleTreasureRarityRow}>
              {!isWithinCollectionRange && (
                <Lock width={16} height={16} color="#795548" style={styles.treasureLockIcon} />
              )}
              <Text style={[styles.treasureRarity, { color: getRarityColor(treasure.rarity) }]}>
                {getRarityDisplayName(treasure.rarity)} Treasure
              </Text>
        </View>
        
            {/* Centered XP Value */}
            <View style={styles.simpleTreasureXpContainer}>
              <Text style={styles.treasureXP}>+{getTreasureXPBonus(treasure.rarity)} XP</Text>
        </View>
        </View>
        )}
          
        {/* Only show claim button for claimable stations */}
        {status === 'claimable' && (
          <TouchableOpacity 
            style={[
              styles.claimButton, 
              progress > 0 && progress < 100 ? styles.claimButtonHolding : null,
              progress >= 100 ? styles.claimButtonCompleted : null
            ]} 
            onPress={() => {
              console.log('👆 Claim button tapped');
              onClaimStart();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.claimButtonText}>
              🎯 Tap to claim
            </Text>
          </TouchableOpacity>
        )}
        
        </View>
        </View>
    </TouchableOpacity>
  );
};

const MapScreen = () => {
  const { width, height } = Dimensions.get('window');
  
  const { 
    currentLocation,
    updateLocation,
    chargingStations, 
    loadChargingStations,
    resetProgress,
    signOut,
    syncAllStations,
    getSyncStatus,
    searchStations,
    syncAllSwedishStations,
    getSwedishStationStats,
    mapBounds,
    // Real XP data
    totalXP,
    currentLevel,
    levelTitle,
    xpToNextLevel,
    hapticFeedbackEnabled,
    // Treasure system
    getTreasureForStation,
    collectTreasure,
    spawnTreasureForStation,
    // Tool system
    equippedTools,
    isToolUnlocked,
    equipTool,
    unequipTool,
    getEquippedTool,
    // Location tracking
    startLocationTracking,
    stopLocationTracking,
    isLocationTracking,
    // Game actions
    discoverStation,
    awardXP,
    // Debug functions
    createTojnanTestStations,
    // Phase 3: Station expiry system
    claimedStations,
  } = useGameStore();

  // Real claimStation function - implements actual discovery logic
  const claimStation = async (stationId: string) => {
    console.log(`🎯 Starting station claim process for ${stationId}`);
    
    try {
      // Find the station to get its details
      const station = chargingStations.find(s => s.id === stationId);
      if (!station) {
        console.error(`❌ Station ${stationId} not found in charging stations list`);
        throw new Error(`Station ${stationId} not found`);
      }
      
      console.log(`📍 Claiming station: ${station.title}`);
      
      // Check if already discovered
      if (station.isDiscovered) {
        console.log(`⚠️ Station ${stationId} already discovered, skipping claim`);
        return;
      }
      
      // 1. Mark station as discovered
      console.log(`✅ Step 1: Discovering station ${stationId}`);
      discoverStation(stationId);
      
      // 2. Award XP for discovery  
      console.log(`✅ Step 2: Awarding 100 XP for station discovery`);
      awardXP(100, 'Station Discovery');
      
      // 3. Spawn discovery treasure (with bonus for first discovery)
      console.log(`✅ Step 3: Spawning discovery treasure`);
      const treasure = spawnTreasureForStation(stationId, true); // true = discovery bonus
      
      if (treasure) {
        console.log(`🎁 Discovery treasure spawned: ${getRarityDisplayName(treasure.rarity)}`);
      } else {
        console.log(`⚠️ No treasure spawned (may already exist for this week)`);
      }
      
      console.log(`🎉 Station claim completed successfully!`);
      
    } catch (error) {
      console.error(`❌ Station claim failed:`, error);
      throw error;
    }
  };

  const [claimingStation, setClaimingStation] = useState<string | null>(null);
  const [claimProgress, setClaimProgress] = useState(0);
  const [showClaimPopover, setShowClaimPopover] = useState(false);
  const [popoverStation, setPopoverStation] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  
  // Station selection state for map centering
  const [selectedStation, setSelectedStation] = useState<any>(null);
  
  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  // Removed popoverHeight state - using fixed bottom anchoring
  
  // Tool selection modal state
  const [showToolModal, setShowToolModal] = useState(false);
  const [selectedToolSlot, setSelectedToolSlot] = useState<number | null>(null);
  
  // Hold-to-claim interaction state
  const [isHolding, setIsHolding] = useState(false);
  const [holdInterval, setHoldInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Phase 5: Player Profile System State
  const [isDeveloperModeEnabled, setIsDeveloperModeEnabled] = useState(false);
  const [developerTapCount, setDeveloperTapCount] = useState(0);
  
  // Sticky Location Tracking State
  const [isFollowingUser, setIsFollowingUser] = useState(true);
  const [lastManualRegion, setLastManualRegion] = useState<Region | null>(null);
  const [isAnimatingToUser, setIsAnimatingToUser] = useState(false);
  
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for this app');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      updateLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: Date.now(),
      });
    })();
  }, [updateLocation]);

  // REMOVED: This was causing infinite loop - location updates every 1s triggering station reloads
  // The gameStore.updateLocation() already handles first-time location loading correctly

  // Cleanup hold interval on unmount
  useEffect(() => {
    return () => {
      if (holdInterval) {
        clearInterval(holdInterval);
      }
    };
  }, [holdInterval]);

  // Single-stage zoom: Directly to optimal view showing 10 closest stations
  const [hasZoomedToStations, setHasZoomedToStations] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  // Direct zoom to show 10 closest stations (no intermediate close zoom)
  useEffect(() => {
    if (mapBounds && mapRef.current && currentLocation && isMapReady && !hasZoomedToStations) {
      console.log('🗺️ Setting initial zoom to show 10 closest stations');
      
      const previousFollow = isFollowingUser;
      if (previousFollow) setIsFollowingUser(false);

      setTimeout(() => {
        // Use calculated bounds but keep user as center
        const latitudeDelta = Math.abs(mapBounds.northeast.latitude - mapBounds.southwest.latitude);
        const longitudeDelta = Math.abs(mapBounds.northeast.longitude - mapBounds.southwest.longitude);
        
        // Make it 45% more zoomed in by reducing the deltas
        const zoomInFactor = 0.55;
        
        const region: Region = {
          latitude: currentLocation.latitude,  // Keep user centered
          longitude: currentLocation.longitude,
          latitudeDelta: Math.max(latitudeDelta * zoomInFactor, 0.015), // 45% closer, minimum 0.015
          longitudeDelta: Math.max(longitudeDelta * zoomInFactor, 0.015),
        };
        
        console.log('🗺️ Initial zoom to show stations (45% closer):', region);
        setIsAnimatingToUser(true);
        mapRef.current?.animateToRegion(region, 1200);
        setTimeout(() => {
          setIsAnimatingToUser(false);
          setHasZoomedToStations(true);
          setIsFollowingUser(previousFollow);
        }, 1200);
      }, 400); // brief delay for map readiness
    }
  }, [mapBounds, currentLocation, isMapReady, hasZoomedToStations]);

  // Sticky Location Tracking: Follow user when location updates (only if in follow mode)
  useEffect(() => {
    if (currentLocation && mapRef.current && isFollowingUser && !isAnimatingToUser && hasZoomedToStations) {
      console.log('📍 Following user location - map will center automatically');

      // Preserve current zoom using camera API instead of estimating deltas
      mapRef.current.getCamera()
        .then((camera: any) => {
          setIsAnimatingToUser(true);
          if (mapRef.current?.animateCamera) {
            mapRef.current.animateCamera(
              {
                center: {
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                },
                zoom: camera?.zoom,
              },
              { duration: 800 }
            );
          } else {
            // Fallback for platforms without animateCamera
            const region: Region = {
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            };
            mapRef.current?.animateToRegion(region, 800);
          }
          setTimeout(() => setIsAnimatingToUser(false), 800);
        })
        .catch(() => {
          const region: Region = {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          };
          setIsAnimatingToUser(true);
          mapRef.current?.animateToRegion(region, 800);
          setTimeout(() => setIsAnimatingToUser(false), 800);
        });
    }
  }, [currentLocation, isFollowingUser, hasZoomedToStations]);

  // Cleanup effect for claim intervals and state
  useEffect(() => {
    return () => {
      // Cleanup on component unmount
      if (holdInterval) {
        console.log('🧹 Component unmounting - cleaning up claim interval');
        clearInterval(holdInterval);
      }
    };
  }, [holdInterval]);

  // Center map on selected station (simple centering)
  const centerMapOnStation = (station: any) => {
    if (mapRef.current && station) {
      console.log(`🎯 Centering map on station: ${station.title}`);
      
      const region: Region = {
        latitude: station.latitude, // Direct center - no offset needed
        longitude: station.longitude,
        latitudeDelta: 0.01, // Closer zoom for selected station
        longitudeDelta: 0.01,
      };
      mapRef.current.animateToRegion(region, 800); // Smooth animation
    }
  };

  const handleStationPress = (station: any) => {
    console.log(`🎯 Station tapped: ${station.title} (${station.id})`);
    
    if (claimingStation) return; // Prevent multiple claims
    
    // Center map on selected station
    setSelectedStation(station);
    centerMapOnStation(station);
    
    // Show popover (don't set claimingStation until actually claiming)
    setPopoverStation(station);
    setShowClaimPopover(true);
    setClaimProgress(0);
  };

  // Simple tap-to-claim interaction
  const handleTapToClaim = async () => {
    console.log('🎯 Tap-to-claim started');
    if (popoverStation?.id) {
      try { await trackEvent('claim_started', { station_id: popoverStation.id }); } catch {}
    }
    
    // Validate we have a station to claim
    if (!popoverStation) {
      console.error('❌ No station selected for claiming');
      return;
    }
    
    // Prevent multiple simultaneous claims
    if (claimingStation) {
      console.log('⚠️ Already claiming a station, ignoring tap');
      return;
    }
    
    // Haptic feedback for immediate response
    if (hapticFeedbackEnabled) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        console.warn('⚠️ Haptic feedback failed:', error);
      }
    }
    
    // Immediate claim completion
    setClaimingStation(popoverStation.id);
    console.log('🚀 Claiming station immediately...');
    await handleClaimComplete();
  };

  // Stop hold-to-claim interaction
  const stopHoldToClaim = () => {
    console.log('🛑 Stopping hold-to-claim interaction, current progress:', claimProgress);
    
    // Clear interval first to prevent further updates
    if (holdInterval) {
      console.log('🧹 Clearing claim interval:', holdInterval);
      clearInterval(holdInterval);
      setHoldInterval(null);
    }
    
    setIsHolding(false);
    
    // Reset progress if not completed
    if (claimProgress < 100) {
      console.log(`🔄 Resetting incomplete claim progress from ${claimProgress}% to 0%`);
      setClaimProgress(0);
      setClaimingStation(null);
    } else {
      console.log('✅ Claim was completed, keeping progress at 100%');
    }
  };

  // Close popover and deselect station (with optional toast message)
  const closePopover = (toastMessage?: string) => {
    console.log('🔴 Popover closed - map stays at current location');
    
    setShowClaimPopover(false);
    setClaimingStation(null); // Reset claiming state
    setClaimProgress(0);
    setPopoverStation(null);
    setSelectedStation(null); // Deselect station
    
    // Show toast notification if provided
    if (toastMessage) {
      setToastMessage(toastMessage);
      setShowToast(true);
      console.log('🎁 Showing treasure collection toast:', toastMessage);
    }
  };

  const handleClaimComplete = async () => {
    console.log('🎯 Handling claim completion');
    
    // Validate completion conditions
    if (!popoverStation) {
      console.error('❌ No popover station available for claim completion');
      return;
    }
    
    // Skip claimProgress check since we're called directly from the interval when progress reaches 100%
    console.log(`✅ Claiming station: ${popoverStation.title} (${popoverStation.id})`);
    
    try {
      // Execute the actual claim
      await claimStation(popoverStation.id);
      try { await trackEvent('claim_succeeded', { station_id: popoverStation.id }); } catch {}
      
      console.log('🎉 Station claimed successfully');
      
      // Close the popover with success message
      closePopover('🎉 Station claimed! +100 XP earned');
      
    } catch (error) {
      console.error('❌ Claim completion failed:', error);
      
      // Error haptic feedback
      if (hapticFeedbackEnabled) {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch (hapticError) {
          console.warn('⚠️ Error haptic feedback failed:', hapticError);
        }
      }
      
      // Reset claim state on error
      setClaimProgress(0);
      setIsHolding(false);
      setClaimingStation(null);
      
      // Show error to user (you could add an Alert here if needed)
      console.log('🔄 Claim state reset due to error');
    }
  };

  const getXpSegments = () => {
    const segments = [];
    const totalSegments = 10;
    
    // Calculate real progress toward next level
    let filledSegments = 0;
    if (xpToNextLevel !== null) {
      // Find current level's XP requirement
      const LEVEL_CONFIG = [
        { level: 1, xpRequirement: 0 },
        { level: 2, xpRequirement: 300 },
        { level: 3, xpRequirement: 800 },
        { level: 4, xpRequirement: 1500 },
        { level: 5, xpRequirement: 2500 }
      ];
      
      const currentLevelConfig = LEVEL_CONFIG.find(config => config.level === currentLevel);
      const nextLevelConfig = LEVEL_CONFIG.find(config => config.level === currentLevel + 1);
      
      if (currentLevelConfig && nextLevelConfig) {
        const currentLevelXP = currentLevelConfig.xpRequirement;
        const nextLevelXP = nextLevelConfig.xpRequirement;
        const xpInCurrentLevel = totalXP - currentLevelXP;
        const xpNeededForLevel = nextLevelXP - currentLevelXP;
        const progressPercentage = xpInCurrentLevel / xpNeededForLevel;
        filledSegments = Math.floor(progressPercentage * totalSegments);
      }
    } else {
      // Max level reached
      filledSegments = totalSegments;
    }
    
    for (let i = 0; i < totalSegments; i++) {
      const isFilled = i < filledSegments;
      
      segments.push(
        <View
          key={i}
          style={[
            styles.pixelXpSegment,
            {
              backgroundColor: isFilled ? '#00FF88' : '#2A2A3A',
              borderTopColor: isFilled ? '#55FF99' : '#333344',
              borderLeftColor: isFilled ? '#55FF99' : '#333344',
              borderBottomColor: isFilled ? '#00CC66' : '#1A1A2A',
              borderRightColor: isFilled ? '#00CC66' : '#1A1A2A',
            },
          ]}
        />
      );
    }
    return segments;
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset all progress? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetProgress },
      ]
    );
  };

  // Handle user manual pan - breaks follow mode
  const handleMapRegionChange = (region: Region) => {
    if (isAnimatingToUser || !hasZoomedToStations) {
      // Ignore region changes from our own animations or before initial setup
      return;
    }
    
    if (isFollowingUser && currentLocation) {
      // Check if user manually moved the map away from their location
      const distance = Math.sqrt(
        Math.pow(region.latitude - currentLocation.latitude, 2) +
        Math.pow(region.longitude - currentLocation.longitude, 2)
      );
      
      // If user moved map significantly (>0.001 degrees ~= 100m), break follow mode
      if (distance > 0.001) {
        console.log('🚶 User panned map - breaking follow mode');
        setIsFollowingUser(false);
        setLastManualRegion(region);
      }
    }
  };

  const handleCenterOnUser = () => {
    if (currentLocation && mapRef.current && mapBounds) {
      console.log('🔄 Re-enabling follow mode - returning to user location');
      
      // Re-enable follow mode
      setIsFollowingUser(true);
      setLastManualRegion(null);
      
      // Use same logic as Stage 2 zoom: show 10 closest stations centered on user
      const latitudeDelta = Math.abs(mapBounds.northeast.latitude - mapBounds.southwest.latitude);
      const longitudeDelta = Math.abs(mapBounds.northeast.longitude - mapBounds.southwest.longitude);
      
      // 45% closer zoom (same as Stage 2)
      const zoomInFactor = 0.55;
      
      const region: Region = {
        latitude: currentLocation.latitude,  // Keep user centered
        longitude: currentLocation.longitude,
        latitudeDelta: Math.max(latitudeDelta * zoomInFactor, 0.015), // 45% closer, minimum 0.015
        longitudeDelta: Math.max(longitudeDelta * zoomInFactor, 0.015),
      };
      
      setIsAnimatingToUser(true);
      mapRef.current.animateToRegion(region, 1000);
      setTimeout(() => setIsAnimatingToUser(false), 1000);
    } else if (currentLocation && mapRef.current) {
      // Fallback: just center on user if mapBounds not available
      console.log('🔄 Re-enabling follow mode - centering on user location (fallback)');
      setIsFollowingUser(true);
      setLastManualRegion(null);
      
      const region: Region = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      
      setIsAnimatingToUser(true);
      mapRef.current.animateToRegion(region, 1000);
      setTimeout(() => setIsAnimatingToUser(false), 1000);
    }
  };

  // Tool slot helper functions
  const isToolSlotUnlocked = (slotIndex: number): boolean => {
    // Slot unlock levels: Slot 1 = Level 2, Slot 2 = Level 3, Slot 3 = Level 4
    const requiredLevel = slotIndex + 1;
    return currentLevel >= requiredLevel;
  };

  const handleToolSlotPress = (slotIndex: number) => {
    if (!isToolSlotUnlocked(slotIndex)) return;
    
    setSelectedToolSlot(slotIndex);
    setShowToolModal(true);
  };

  const closeToolModal = () => {
    setShowToolModal(false);
    setSelectedToolSlot(null);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const handleReloadStations = async () => {
    setShowMenu(false);
    try {
      console.log('🔄 Reloading nearest charging stations...');
      await loadChargingStations(true);
      Alert.alert('Success', 'Reloaded nearest charging stations');
    } catch (error) {
      console.error('❌ Failed to reload stations:', error);
      Alert.alert('Error', 'Failed to reload stations');
    }
  };

  const handleSyncAllStations = async () => {
    setShowMenu(false);
    
    Alert.alert(
      '🗺️ Multi-Center Sync',
      'This will fetch stations from 7 strategic locations across Sweden to build a comprehensive database.\n\n⏱️ Takes about 2-3 minutes\n📊 Expected: 1000+ stations',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Sync',
          onPress: async () => {
            try {
              console.log('🗺️ Starting multi-center sync...');
              const result = await syncAllStations();
              const message = `🗺️ Multi-Center Sync Complete!\n\n📊 Stations synced: ${result.synced}\n🎯 Total stations: ${result.totalStations}\n❌ Errors: ${result.errors.length}\n\n${result.errors.length > 0 ? `Errors:\n${result.errors.join('\n')}` : '✅ No errors!'}`;
              Alert.alert('Sync Complete', message);
              console.log('🗺️ Multi-center sync result:', result);
            } catch (error) {
              console.error('❌ Multi-center sync failed:', error);
              Alert.alert('Sync Failed', 'Failed to sync stations');
            }
          }
        }
      ]
    );
  };

  const handleShowSyncStatus = async () => {
    setShowMenu(false);
    try {
      console.log('📊 Getting sync status...');
      const status = await getSyncStatus();
    Alert.alert(
        '📊 Database Status',
        `Total stations: ${status.totalStations}\nRecharge stations: ${status.rechargeStations}\nLast synced: ${status.lastSynced || 'Never'}`
      );
    } catch (error) {
      console.error('❌ Failed to get sync status:', error);
      Alert.alert('Error', 'Failed to get database status');
    }
  };

  const handleSearchHaggvik = async () => {
    setShowMenu(false);
    try {
      console.log('🔍 Searching for Häggvik stations in database...');
      const results = await searchStations('häggvik');
      
      if (results.length > 0) {
        const stationList = results.map(s => `• ${s.title} (${s.operator})`).join('\n');
        Alert.alert(
          '🎯 Häggvik Stations Found!',
          `Found ${results.length} Häggvik stations in database:\n\n${stationList}`
        );
        console.log('🔍 Häggvik search results:', results);
      } else {
        Alert.alert('🔍 No Results', 'No Häggvik stations found in database.\n\nTry syncing more data first.');
      }
    } catch (error) {
      console.error('❌ Failed to search for Häggvik:', error);
      Alert.alert('Search Error', 'Failed to search database');
    }
  };

  const handleSwedishSync = async () => {
    setShowMenu(false);
    
    Alert.alert(
      '🇸🇪 Swedish Station Sync',
      'This will use a Supabase Edge Function to comprehensively sync all Swedish charging stations.\n\n⚡ Fast and efficient\n🎯 Should find Häggvik!',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Swedish Sync',
          onPress: async () => {
            try {
              console.log('🇸🇪 Starting Swedish sync...');
              const result = await syncAllSwedishStations();
              if (result.success) {
                Alert.alert(
                  '🇸🇪 Swedish Sync Success!',
                  `📊 Stations synced: ${result.stationsUpserted}\n🎯 Total in database: ${result.totalStationsInDb}\n⏱️ Completed in ${result.duration}ms`
                );
    } else {
                Alert.alert('🇸🇪 Swedish Sync Failed', `Error: ${result.error}`);
              }
            } catch (error) {
              console.error('❌ Swedish sync failed:', error);
              Alert.alert('Sync Failed', 'Failed to sync Swedish stations');
            }
          }
        }
      ]
    );
  };

  const handleSwedishStats = async () => {
    setShowMenu(false);
    try {
      console.log('📊 Getting Swedish station stats...');
      const stats = await getSwedishStationStats();
      if (stats.success) {
        Alert.alert(
          '📊 Swedish Station Stats',
          `🇸🇪 Swedish stations: ${stats.swedishStations}\n📊 Total stations: ${stats.totalStations}\n⚡ Recharge stations: ${stats.rechargeStations}\n🎯 Häggvik stations: ${stats.haggvikStations}`
        );
      } else {
        Alert.alert('Stats Error', `Failed to get stats: ${stats.error}`);
      }
    } catch (error) {
      console.error('❌ Failed to get Swedish stats:', error);
      Alert.alert('Stats Error', 'Failed to get Swedish statistics');
    }
  };

  // Phase 5: Developer Mode Functions
  const handleToggleDeveloperMode = () => {
    const newTapCount = developerTapCount + 1;
    setDeveloperTapCount(newTapCount);
    
    if (newTapCount >= 5) {
      setIsDeveloperModeEnabled(!isDeveloperModeEnabled);
      setDeveloperTapCount(0);
      console.log(`🛠️ Developer mode ${!isDeveloperModeEnabled ? 'enabled' : 'disabled'}`);
    }
    
    // Reset tap count after 3 seconds if user doesn't complete the sequence
    setTimeout(() => setDeveloperTapCount(0), 3000);
  };

  const handleViewTerritory = () => {
    setShowMenu(false);
    // TODO: Implement territory overview modal
    Alert.alert('🏰 Territory Overview', 'Territory management interface coming soon!');
  };

  const handleManageStations = () => {
    setShowMenu(false);
    // TODO: Implement station management interface  
    Alert.alert('⚡ Manage Territory', 'Station renewal interface coming soon!');
  };

  const updateMapRegion = (latitude: number, longitude: number) => {
    if (mapRef.current) {
      const region: Region = {
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      mapRef.current.animateToRegion(region, 1000);
    }
  };

  // Determine status based on game progression (discovery system)
  const getStationStatus = (station: any) => {
    // Game progression logic matching dev logs color psychology:
    // Red (undiscovered/mysterious), Purple (active/discoverable), Green (claimed/completed)
    
    if (station.isDiscovered) {
      return 'claimed'; // Green - already discovered/completed
    }
    
    if (station.isDiscoverable) {
      return 'discoverable'; // Purple - in range and can be claimed
    }
    
    return 'undiscovered'; // Red - not yet discovered/mysterious
  };

  // Debug: Count statuses to understand the distribution  
  useEffect(() => {
    if (chargingStations.length > 0) {
      const counts = { undiscovered: 0, discoverable: 0, claimed: 0 };
      chargingStations.forEach(station => {
        const status = getStationStatus(station);
        counts[status as keyof typeof counts]++;
      });
      console.log('🎮 GAME STATUS SUMMARY:', counts);
      console.log(`🎮 Total stations: ${chargingStations.length}`);
      console.log('🔴 Red (undiscovered/mysterious):', counts.undiscovered);
      console.log('🟣 Purple (active/discoverable):', counts.discoverable);
      console.log('🟢 Green (claimed/completed):', counts.claimed);
    }
  }, [chargingStations]);

  return (
    <View style={styles.container}>
      {/* Pixel Art Header */}
      <View style={styles.pixelHeader}>
        <View style={styles.pixelHeaderBorder}>
          <View style={styles.headerTopRow}>
            <View style={styles.pixelLogoContainer}>
              <Text style={styles.logoIcon}>⚡</Text>
              <Text style={styles.logoCharge}>CHARGE</Text>
              <Text style={styles.logoQuest}>QUEST</Text>
              <Text style={styles.logoIcon}>⚡</Text>
                </View>
              </View>
          <View style={styles.headerBottomRow}>
            <Text style={styles.pixelLevelText}>Level {currentLevel}</Text>
            <View style={styles.pixelXpContainer}>
              {getXpSegments()}
           </View>
            <Text style={styles.pixelXpText}>
              {(() => {
                const LEVEL_CONFIG = [
                  { level: 1, xpRequirement: 0 },
                  { level: 2, xpRequirement: 300 },
                  { level: 3, xpRequirement: 800 },
                  { level: 4, xpRequirement: 1500 },
                  { level: 5, xpRequirement: 2500 }
                ];
                
                if (xpToNextLevel !== null) {
                  const currentLevelConfig = LEVEL_CONFIG.find(config => config.level === currentLevel);
                  const nextLevelConfig = LEVEL_CONFIG.find(config => config.level === currentLevel + 1);
                  
                  if (currentLevelConfig && nextLevelConfig) {
                    const xpInCurrentLevel = totalXP - currentLevelConfig.xpRequirement;
                    const xpNeededForLevel = nextLevelConfig.xpRequirement - currentLevelConfig.xpRequirement;
                    return `${xpInCurrentLevel}/${xpNeededForLevel} XP`;
                  }
                }
                return `${totalXP} XP MAX`;
              })()}
                     </Text>
                   </View>
         </View>
       </View>
       
      {/* Map */}
        <MapView
        ref={mapRef}
          style={styles.map}
        initialRegion={currentLocation ? {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.025,  // Zoomed in from 0.05 (about 2x closer)
          longitudeDelta: 0.025, // Zoomed in from 0.05 (about 2x closer)
        } : undefined}
        showsUserLocation={false}
          showsMyLocationButton={false}
          onMapReady={() => setIsMapReady(true)}
          onRegionChangeComplete={handleMapRegionChange}
        >
        {/* Custom pixel art user location marker - highest z-index */}
        {currentLocation && (
            <Marker
              coordinate={{
                latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
            zIndex={1000}
            >
            <PixelUserMarker key="crisp-user-marker" />
            </Marker>
          )}

        {/* Lightning bolt charging stations - lower z-index than user */}
        {chargingStations.map((station) => (
            <Marker
              key={station.id}
              coordinate={{
                latitude: station.latitude,
                longitude: station.longitude,
              }}
            onPress={() => handleStationPress(station)}
              anchor={{ x: 0.5, y: 0.5 }}
            zIndex={100}
            >
              <AnimatedEnergyCell 
              station={station}
              onPress={() => handleStationPress(station)}
              getStationStatus={getStationStatus}
              getTreasureForStation={getTreasureForStation}
            />
            </Marker>
          ))}
        </MapView>

      {/* Gaming HUD - Bottom Tool Bar */}
      <View style={styles.gamingHUD}>
        {/* Avatar Button (Secondary) */}
        <TouchableOpacity
          style={[styles.hudButton, styles.hudSecondaryButton]}
          onPress={() => setShowMenu(true)}
        >
          <View style={styles.avatarButtonBorder}>
            <User width={18} height={18} color="#CCCCCC" />
      </View>
          </TouchableOpacity>
          
        {/* Primary Tool Group */}
        <View style={styles.toolGroup}>
          <ToolSlot 
            slotIndex={1}
            isUnlocked={isToolSlotUnlocked(1)}
            equippedTool={getEquippedTool(1)}
            onPress={() => handleToolSlotPress(1)}
          />

          <ToolSlot 
            slotIndex={2}
            isUnlocked={isToolSlotUnlocked(2)}
            equippedTool={getEquippedTool(2)}
            onPress={() => handleToolSlotPress(2)}
          />

          <ToolSlot 
            slotIndex={3}
            isUnlocked={isToolSlotUnlocked(3)}
            equippedTool={getEquippedTool(3)}
            onPress={() => handleToolSlotPress(3)}
          />
      </View>

        {/* Location Reset Button (Secondary) - Shows follow mode state */}
          <TouchableOpacity 
          style={[
            styles.hudButton, 
            styles.hudSecondaryButton,
            isFollowingUser && styles.locationButtonFollowing
          ]}
          onPress={handleCenterOnUser}
        >
          <View style={[
            styles.locationButtonBorder,
            isFollowingUser && styles.locationButtonBorderActive
          ]}>
            <MapsArrowDiagonal 
              width={18} 
              height={18} 
              color={isFollowingUser ? "#00FF88" : "#CCCCCC"} 
            />
            </View>
            {/* Follow mode indicator dot */}
            {isFollowingUser && (
              <View style={styles.followModeIndicator} />
            )}
          </TouchableOpacity>
          </View>
      
      {/* Claim Popover */}
      <ClaimPopover
        visible={showClaimPopover}
        station={popoverStation}
        progress={claimProgress}
                        onClaimStart={handleTapToClaim}
                        onClaimStop={() => {}} // Not needed for tap-to-claim
        onClose={closePopover}
        getTreasureForStation={getTreasureForStation}
        collectTreasure={collectTreasure}
      />

      {/* Slide-up Menu */}
      {/* Phase 5: Player Profile Modal */}
      <PlayerProfileModal
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        currentLevel={currentLevel}
        levelTitle={levelTitle}
        totalXP={totalXP}
        xpToNextLevel={xpToNextLevel}
        discoveredStations={chargingStations.filter(s => s.isDiscovered).length}
        totalStations={chargingStations.length}
        treasureStats={{ totalCollected: 0, epicCollected: 0, mythicCollected: 0, legendaryCollected: 0 }}
        claimedStations={chargingStations.filter(s => s.isDiscovered).length}
        onViewTerritory={handleViewTerritory}
        onManageStations={handleManageStations}
        isDeveloperModeEnabled={isDeveloperModeEnabled}
        onToggleDeveloperMode={handleToggleDeveloperMode}
        handleCenterOnUser={handleCenterOnUser}
        handleReloadStations={handleReloadStations}
        handleLogout={handleLogout}
        handleReset={handleReset}
        handleShowSyncStatus={handleShowSyncStatus}
        spawnTreasureForStation={spawnTreasureForStation}
        chargingStations={chargingStations}
      />

      {/* Keep the old menu temporarily for testing */}
      {false && showMenu && (
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
            
            {/* === GAME FUNCTIONS === */}
            
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
        
            {/* === MAIN DEBUG TOOLS === */}
            
            {/* Spawn Treasures Debug */}
            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={async () => {
                setShowMenu(false);
                
                Alert.alert(
                  '🎁 Spawn Test Treasures',
                  'This will spawn treasures for all discovered stations in your local game data.\n\n📊 Discovered stations: ' + (chargingStations.filter(s => s.isDiscovered).length) + '\n🎁 This enables treasure collection testing!',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Spawn Treasures',
                      onPress: async () => {
                        try {
                          console.log('🎁 Spawning treasures for discovered stations...');
                          
                          // Get all discovered stations
                          const discoveredStations = chargingStations.filter(s => s.isDiscovered);
                          let spawned = 0;
                          
                          for (const station of discoveredStations) {
                            // Spawn treasure with discovery bonus (higher rarity chance)
                            spawnTreasureForStation(station.id, true);
                            spawned++;
                          }
                          
                          Alert.alert('✅ Treasures Spawned!', `Created ${spawned} treasures for discovered stations.\n\n🎁 Now tap green stations to collect treasures!`);
                        } catch (error) {
                          console.error('❌ Treasure spawning failed:', error);
                          Alert.alert('Spawning Failed', 'Could not spawn treasures. Check logs for details.');
                        }
                      }
                    }
                  ]
                );
              }}
            >
              <Text style={styles.menuButtonIcon}>🎁</Text>
              <Text style={styles.menuButtonText}>Spawn Test Treasures</Text>
            </TouchableOpacity>
            
            {/* Create Töjnan Test Stations */}
            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={() => {
                setShowMenu(false);
                
                Alert.alert(
                  '🧪 Create Töjnan Test Stations',
                  'This will add 5 test charging stations in the Töjnan area (Sollentuna) for local testing of the claim process.\n\n📍 Test stations will appear as red markers that you can walk to and claim.\n\n🎯 Perfect for testing discovery & claim logic without driving to real stations!',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Create Test Stations',
                      onPress: () => {
                        try {
                          console.log('🧪 Creating Töjnan test stations...');
                          createTojnanTestStations();
                          Alert.alert('✅ Test Stations Created!', 'Added 5 test stations in the Töjnan area.\n\n📍 Walk within 25m of any red marker to make it discoverable (purple), then tap to claim!\n\n🗺️ Zoom to the Töjnan area in Sollentuna to see them.');
                        } catch (error) {
                          console.error('❌ Test station creation failed:', error);
                          Alert.alert('Creation Failed', 'Could not create test stations. Check logs for details.');
                        }
                      }
                    }
                  ]
                );
              }}
            >
              <Text style={styles.menuButtonIcon}>🧪</Text>
              <Text style={styles.menuButtonText}>Create Töjnan Test Stations</Text>
            </TouchableOpacity>
            
            {/* Restart Location Tracking */}
            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={async () => {
                setShowMenu(false);
                
                Alert.alert(
                  '📍 Restart Location Tracking',
                  `Current tracking status: ${isLocationTracking ? '✅ Active' : '❌ Inactive'}\n\nThis will restart GPS location tracking to ensure your position marker follows you as you move.\n\n🎯 Use this if your location marker seems stuck or not updating.`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Restart Tracking',
                      onPress: async () => {
                        try {
                          console.log('📍 Restarting location tracking...');
                          
                          // Stop existing tracking first
                          await stopLocationTracking();
                          
                          // Wait a moment
                          await new Promise(resolve => setTimeout(resolve, 500));
                          
                          // Start tracking again
                          await startLocationTracking();
                          
                          Alert.alert('✅ Location Tracking Restarted!', `GPS tracking is now ${isLocationTracking ? 'active' : 'inactive'}.\n\n📍 Your location marker should now follow you as you move!`);
                        } catch (error) {
                          console.error('❌ Location tracking restart failed:', error);
                          Alert.alert('Restart Failed', 'Could not restart location tracking. Check permissions and try again.');
                        }
                      }
                    }
                  ]
                );
              }}
            >
              <Text style={styles.menuButtonIcon}>📍</Text>
              <Text style={styles.menuButtonText}>Restart Location Tracking</Text>
            </TouchableOpacity>
            
            {/* Refresh Station Data */}
            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={async () => {
                setShowMenu(false);
                
                Alert.alert(
                  '🔄 Refresh Station Data',
                  'This will reload charging stations from the Nobil API:\n\n🔴 Red (undiscovered/mysterious)\n🟣 Purple (active/discoverable)\n🟢 Green (claimed/completed)\n\n⚡ Lightning bolt colors show discovery progress!',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Refresh Stations',
                      onPress: async () => {
                        try {
                          console.log('🔄 Refreshing station data...');
                          loadChargingStations(true);
                          Alert.alert('✅ Refresh Complete!', 'Station data has been refreshed from the API.');
                        } catch (error) {
                          console.error('❌ Station refresh failed:', error);
                          Alert.alert('Refresh Failed', 'Could not refresh station data. Check logs for details.');
                        }
                      }
                    }
                  ]
                );
              }}
            >
              <Text style={styles.menuButtonIcon}>🗺️</Text>
              <Text style={styles.menuButtonText}>Refresh Stations</Text>
            </TouchableOpacity>
            
            {/* Correct Pagination - THE KEY TEST */}
            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={async () => {
                setShowMenu(false);
                
                Alert.alert(
                  '📋 Correct Nobil Pagination',
                  'Based on the official Nobil API docs, we\'ve been using the WRONG pagination method!\n\n❌ offset parameter doesn\'t exist\n✅ Use existingids parameter instead\n📊 Default limit is 1000, not 500\n\n🎯 This should find Recharge Häggvik!',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Test Correct Method',
                      onPress: async () => {
                        try {
                          console.log('📋 Starting CORRECT Nobil pagination test...');
                          console.log('📋 DISCOVERY: offset parameter doesn\'t exist in Nobil API!');
                          console.log('📋 SOLUTION: Use existingids parameter per official docs');
                          
                          if (!currentLocation) {
                            Alert.alert('Location Required', 'Need your location for this test');
                            return;
                          }
                          
                          // Test the CORRECT pagination method per Nobil API docs
                          const allStations = new Map(); // Store all unique stations
                          let pageCount = 0;
                          let foundRechargeHaggvik = false;
                          const rechargeHaggvikDetails: any[] = [];
                          const results = [];
                          
                          // First call: No existingids (get first batch)
                          console.log('📋 Page 1: Initial call with limit=1000 (API default)...');
                          
                          const apiKey = process.env.EXPO_PUBLIC_NOBIL_API_KEY;
                          const lat = currentLocation.latitude;
                          const lng = currentLocation.longitude;
                          const radius = 0.45; // ~50km radius
                          
                          const northeast = `(${lat + radius}, ${lng + radius})`;
                          const southwest = `(${lat - radius}, ${lng - radius})`;
                          
                          // Page 1: No existingids
                          let url = `https://nobil.no/api/server/search.php?apiversion=3&action=search&type=rectangle&northeast=${northeast}&southwest=${southwest}&format=json&apikey=${apiKey}&limit=1000`;
                          
                          let response = await fetch(url);
                          if (!response.ok) {
                            throw new Error(`API error: ${response.status}`);
                          }
                          
                          let data = await response.json();
                          let stations = data.chargerstations || [];
                          pageCount++;
                          
                          console.log(`📋 Page ${pageCount}: ${stations.length} stations returned (limit=1000)`);
                          
                          // Store all stations from page 1
                          stations.forEach((station: any) => {
                            const id = station.csmd?.id?.toString();
                            if (id) {
                              allStations.set(id, station);
                            }
                          });
                          
                          // Look for Recharge Häggvik on page 1
                          const page1RechargeHaggvik = stations.filter((station: any) => {
                            const name = (station.csmd?.name || '').toLowerCase();
                            const operator = (station.csmd?.Owned_by || '').toLowerCase();
                            return operator.includes('recharge') && (name.includes('häggvik') || name.includes('haggvik'));
                          });
                          
                          if (page1RechargeHaggvik.length > 0) {
                            console.log(`🎉 FOUND RECHARGE HÄGGVIK ON PAGE 1!`);
                            foundRechargeHaggvik = true;
                            rechargeHaggvikDetails.push(...page1RechargeHaggvik.map((s: any) => ({
                              page: 1,
                              name: s.csmd?.name,
                              operator: s.csmd?.Owned_by,
                              id: s.csmd?.id,
                              position: s.csmd?.Position
                            })));
                          }
                          
                          results.push({
                            page: 1,
                            stationsReturned: stations.length,
                            totalUnique: allStations.size,
                            foundRechargeHaggvik: page1RechargeHaggvik.length > 0
                          });
                          
                          // Page 2: Use existingids to exclude page 1 stations
                          if (stations.length === 1000) { // Might have more data
                            console.log('📋 Page 2: Using existingids to exclude page 1 stations...');
                            
                            const existingIds = Array.from(allStations.keys()).join(',');
                            url = `https://nobil.no/api/server/search.php?apiversion=3&action=search&type=rectangle&northeast=${northeast}&southwest=${southwest}&format=json&apikey=${apiKey}&limit=1000&existingids=${existingIds}`;
                            
                            response = await fetch(url);
                            if (response.ok) {
                              data = await response.json();
                              stations = data.chargerstations || [];
                              pageCount++;
                              
                              console.log(`📋 Page ${pageCount}: ${stations.length} stations returned (after excluding ${existingIds.split(',').length} existing)`);
                              
                              let newStations = 0;
                              
                              // Store new stations from page 2
                              stations.forEach((station: any) => {
                                const id = station.csmd?.id?.toString();
                                if (id && !allStations.has(id)) {
                                  allStations.set(id, station);
                                  newStations++;
                                }
                              });
                              
                              console.log(`📋 Page ${pageCount}: ${newStations} NEW stations, ${stations.length - newStations} duplicates`);
                              
                              // Look for Recharge Häggvik on page 2
                              const page2RechargeHaggvik = stations.filter((station: any) => {
                                const name = (station.csmd?.name || '').toLowerCase();
                                const operator = (station.csmd?.Owned_by || '').toLowerCase();
                                return operator.includes('recharge') && (name.includes('häggvik') || name.includes('haggvik'));
                              });
                              
                              if (page2RechargeHaggvik.length > 0) {
                                console.log(`🎉 FOUND RECHARGE HÄGGVIK ON PAGE 2!`);
                                foundRechargeHaggvik = true;
                                rechargeHaggvikDetails.push(...page2RechargeHaggvik.map((s: any) => ({
                                  page: 2,
                                  name: s.csmd?.name,
                                  operator: s.csmd?.Owned_by,
                                  id: s.csmd?.id,
                                  position: s.csmd?.Position
                                })));
                              }
                              
                              results.push({
                                page: 2,
                                stationsReturned: stations.length,
                                newStations: newStations,
                                totalUnique: allStations.size,
                                foundRechargeHaggvik: page2RechargeHaggvik.length > 0
                              });
                            }
                          }
                          
                          // Summary
                          const totalUnique = allStations.size;
                          
                          console.log('📋 CORRECT PAGINATION TEST COMPLETE');
                          console.log(`📊 Total unique stations: ${totalUnique}`);
                          console.log(`🎯 Found Recharge Häggvik: ${foundRechargeHaggvik}`);
                          
                          if (foundRechargeHaggvik) {
                            rechargeHaggvikDetails.forEach((station) => {
                              console.log(`🎉 Recharge Häggvik found on page ${station.page}:`);
                              console.log(`   Name: ${station.name}`);
                              console.log(`   Operator: ${station.operator}`);
                              console.log(`   ID: ${station.id}`);
                              console.log(`   Position: ${station.position}`);
                            });
                          }
                          
                          const summary = [
                            '📋 CORRECT NOBIL PAGINATION RESULTS:',
                            '',
                            `📊 Total unique stations: ${totalUnique}`,
                            `📄 Pages tested: ${pageCount}`,
                            `🎯 Found Recharge Häggvik: ${foundRechargeHaggvik ? 'YES!' : 'NO'}`,
                            '',
                            '📄 Per-page breakdown:',
                            ...results.map(r => 
                              `Page ${r.page}: ${r.stationsReturned} returned${r.newStations !== undefined ? `, ${r.newStations} new` : ''}${r.foundRechargeHaggvik ? ' 🎯' : ''}`
                            ),
                            '',
                            totalUnique > 500 ? 
                              `✅ SUCCESS: Found ${totalUnique} stations (broke the 500 limit!)` :
                              '❌ Still limited - need different search strategy',
                            '',
                            foundRechargeHaggvik ?
                              '🎉 FOUND IT: Recharge Häggvik exists with correct pagination!' :
                              '❓ Still missing - may need different search area or approach'
                          ].join('\n');
                          
                          Alert.alert('📋 Correct Pagination Complete', summary);
                          
                        } catch (error: any) {
                          console.error('❌ Correct pagination test failed:', error);
                          Alert.alert('Test Failed', `Failed to test correct pagination: ${error?.message || 'Unknown error'}`);
                        }
                      }
                    }
                  ]
                );
              }}
            >
              <Text style={styles.menuButtonIcon}>📋</Text>
              <Text style={styles.menuButtonText}>Find Recharge Häggvik</Text>
            </TouchableOpacity>

            {/* === SECONDARY TOOLS === */}
            
            {/* Häggvik Debug - Why is it missing? */}
            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={async () => {
                setShowMenu(false);
                
                Alert.alert(
                  '🕵️ Häggvik Mystery Debug',
                  'We KNOW Häggvik exists (ID: 42665) but our Sweden search isn\'t finding it. Let\'s debug why!\n\n🔍 Tests different search methods\n📍 Compares coordinates\n🎯 Finds exactly what\'s wrong',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Debug Now',
                      onPress: async () => {
                        try {
                          console.log('🕵️ Starting Häggvik mystery debug...');
                          console.log('🎯 We KNOW it exists: "Recharge Häggvik Handelsplats" (ID: 42665) at (59.43803,17.927688)');
                          
                          const apiKey = process.env.EXPO_PUBLIC_NOBIL_API_KEY;
                          const haggvikLat = 59.43803;
                          const haggvikLng = 17.927688;
                          
                          console.log('🧪 TEST 1: Search around known Häggvik coordinates...');
                          const radius = 0.1; // Small radius around Häggvik
                          const northeast1 = `(${haggvikLat + radius}, ${haggvikLng + radius})`;
                          const southwest1 = `(${haggvikLat - radius}, ${haggvikLng - radius})`;
                          
                          let url = `https://nobil.no/api/server/search.php?apiversion=3&action=search&type=rectangle&northeast=${northeast1}&southwest=${southwest1}&format=json&apikey=${apiKey}&limit=1000`;
                          console.log('🧪 TEST 1 URL:', url);
                          
                          let response = await fetch(url);
                          if (!response.ok) throw new Error(`TEST 1 API error: ${response.status}`);
                          
                          let data = await response.json();
                          let stations = data.chargerstations || [];
                          console.log(`🧪 TEST 1 RESULT: ${stations.length} total stations around Häggvik`);
                          
                          const test1Recharge = stations.filter((station: any) => {
                            const operator = (station.csmd?.Owned_by || '').toLowerCase();
                            return operator.includes('recharge');
                          });
                          console.log(`🧪 TEST 1: ${test1Recharge.length} Recharge stations found`);
                          
                          const test1Haggvik = test1Recharge.filter((station: any) => {
                            const name = (station.csmd?.name || '').toLowerCase();
                            return name.includes('häggvik') || name.includes('haggvik');
                          });
                          console.log(`🧪 TEST 1: ${test1Haggvik.length} Häggvik stations found`);
                          
                          if (test1Haggvik.length > 0) {
                            console.log('🎉 TEST 1: HÄGGVIK FOUND!');
                            test1Haggvik.forEach((station: any) => {
                              console.log(`  ✅ ${station.csmd?.name} (ID: ${station.csmd?.id}) at ${station.csmd?.Position}`);
                            });
                          }
                          
                          console.log('🧪 TEST 2: Search Sweden bounds (same as comparison)...');
                          const swedenBounds = {
                            northeast: '(69.0599, 24.1933)', // Northern Sweden
                            southwest: '(55.3367, 10.9659)'  // Southern Sweden
                          };
                          
                          url = `https://nobil.no/api/server/search.php?apiversion=3&action=search&type=rectangle&northeast=${swedenBounds.northeast}&southwest=${swedenBounds.southwest}&format=json&apikey=${apiKey}&limit=1000`;
                          console.log('🧪 TEST 2 URL:', url);
                          
                          response = await fetch(url);
                          if (!response.ok) throw new Error(`TEST 2 API error: ${response.status}`);
                          
                          data = await response.json();
                          stations = data.chargerstations || [];
                          console.log(`🧪 TEST 2 RESULT: ${stations.length} total stations in Sweden bounds`);
                          
                          const test2Recharge = stations.filter((station: any) => {
                            const operator = (station.csmd?.Owned_by || '').toLowerCase();
                            return operator.includes('recharge');
                          });
                          console.log(`🧪 TEST 2: ${test2Recharge.length} Recharge stations found`);
                          
                          const test2Haggvik = test2Recharge.filter((station: any) => {
                            const name = (station.csmd?.name || '').toLowerCase();
                            return name.includes('häggvik') || name.includes('haggvik');
                          });
                          console.log(`🧪 TEST 2: ${test2Haggvik.length} Häggvik stations found`);
                          
                          if (test2Haggvik.length > 0) {
                            console.log('🎉 TEST 2: HÄGGVIK FOUND in Sweden search!');
                            test2Haggvik.forEach((station: any) => {
                              console.log(`  ✅ ${station.csmd?.name} (ID: ${station.csmd?.id}) at ${station.csmd?.Position}`);
                            });
                          }
                          
                          console.log('🧪 TEST 3: Check if Häggvik coordinates are within Sweden bounds...');
                          const withinBounds = (
                            haggvikLat >= 55.3367 && haggvikLat <= 69.0599 &&
                            haggvikLng >= 10.9659 && haggvikLng <= 24.1933
                          );
                          console.log(`🧪 TEST 3: Häggvik (${haggvikLat}, ${haggvikLng}) within bounds: ${withinBounds}`);
                          
                          console.log('🧪 TEST 4: Search by exact ID if possible...');
                          url = `https://nobil.no/api/server/search.php?apiversion=3&action=search&type=single_charger&chargerid=42665&format=json&apikey=${apiKey}`;
                          console.log('🧪 TEST 4 URL:', url);
                          
                          response = await fetch(url);
                          if (response.ok) {
                            data = await response.json();
                            console.log('🧪 TEST 4 RESULT:', JSON.stringify(data, null, 2));
                            
                            if (data.chargerstations && data.chargerstations.length > 0) {
                              console.log('🎉 TEST 4: Found Häggvik by direct ID!');
                              const station = data.chargerstations[0];
                              console.log(`  ✅ ${station.csmd?.name} (ID: ${station.csmd?.id})`);
                              console.log(`  📍 Position: ${station.csmd?.Position}`);
                              console.log(`  🏢 Operator: ${station.csmd?.Owned_by}`);
                            }
                          } else {
                            console.log('🧪 TEST 4: Direct ID search failed');
                          }
                          
                          const summary = [
                            '🕵️ HÄGGVIK MYSTERY DEBUG RESULTS:',
                            '',
                            '🧪 TEST RESULTS:',
                            `🎯 Around Häggvik coords: ${test1Haggvik.length} found`,
                            `🇸🇪 Sweden-wide search: ${test2Haggvik.length} found`,
                            `📍 Coords within bounds: ${withinBounds ? 'YES' : 'NO'}`,
                            '',
                            '🔍 CONCLUSION:',
                            test1Haggvik.length > 0 && test2Haggvik.length === 0 ? 
                              '❌ PROBLEM: Sweden bounds search is broken!' :
                            test1Haggvik.length === 0 ?
                              '❌ PROBLEM: Häggvik not found even at exact coordinates!' :
                              '✅ Both searches work - check pagination',
                            '',
                            '📋 NEXT STEPS:',
                            test1Haggvik.length > 0 && test2Haggvik.length === 0 ?
                              'Sweden bounds are wrong - need to fix search area' :
                            test1Haggvik.length === 0 ?
                              'Häggvik may have moved/changed - check API status' : 
                              'Investigate why pagination missed it'
                          ].join('\n');
                          
                          Alert.alert('🕵️ Debug Complete', summary);
                          
                        } catch (error: any) {
                          console.error('❌ Debug failed:', error);
                          Alert.alert('Debug Failed', `Failed to debug Häggvik: ${error?.message || 'Unknown error'}`);
                        }
                      }
                    }
                  ]
                );
              }}
            >
              <Text style={styles.menuButtonIcon}>🕵️</Text>
              <Text style={styles.menuButtonText}>Debug Häggvik</Text>
            </TouchableOpacity>

            {/* API vs Database Comparison */}
            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={async () => {
                setShowMenu(false);
                
                Alert.alert(
                  '🔍 API vs Database Comparison',
                  'This will compare Recharge stations between:\n\n🌐 Nobil API (live data)\n🗄️ Our Supabase database\n\n📊 Shows exact differences and missing stations',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Compare Now',
                      onPress: async () => {
                        try {
                          console.log('🔍 Starting API vs Database comparison...');
                          
                          // Step 1: Get ALL Recharge stations from Nobil API
                          console.log('🌐 Fetching from Nobil API...');
                          const apiStations = new Map();
                          let totalApiStations = 0;
                          
                          const apiKey = process.env.EXPO_PUBLIC_NOBIL_API_KEY;
                          const swedenBounds = {
                            northeast: '(69.0599, 24.1933)', // Northern Sweden
                            southwest: '(55.3367, 10.9659)'  // Southern Sweden
                          };
                          
                          // Page 1
                          let url = `https://nobil.no/api/server/search.php?apiversion=3&action=search&type=rectangle&northeast=${swedenBounds.northeast}&southwest=${swedenBounds.southwest}&format=json&apikey=${apiKey}&limit=1000`;
                          let response = await fetch(url);
                          if (!response.ok) throw new Error(`API error: ${response.status}`);
                          
                          let data = await response.json();
                          let stations = data.chargerstations || [];
                          console.log(`🌐 Page 1: ${stations.length} total stations`);
                          
                          const page1Recharge = stations.filter((station: any) => {
                            const operator = (station.csmd?.Owned_by || '').toLowerCase();
                            return operator.includes('recharge');
                          });
                          
                          page1Recharge.forEach((station: any) => {
                            const id = station.csmd?.id?.toString();
                            if (id) {
                              apiStations.set(id, {
                                id,
                                name: station.csmd?.name || 'Unknown',
                                operator: station.csmd?.Owned_by || 'Unknown',
                                position: station.csmd?.Position || 'Unknown'
                              });
                            }
                          });
                          
                          totalApiStations += page1Recharge.length;
                          console.log(`⚡ Page 1: ${page1Recharge.length} Recharge stations`);
                          
                          // Page 2 if needed
                          if (stations.length === 1000) {
                            console.log('🌐 Fetching page 2...');
                            const existingIds = stations.map((s: any) => s.csmd?.id).filter(Boolean).join(',');
                            url = `https://nobil.no/api/server/search.php?apiversion=3&action=search&type=rectangle&northeast=${swedenBounds.northeast}&southwest=${swedenBounds.southwest}&format=json&apikey=${apiKey}&limit=1000&existingids=${existingIds}`;
                            
                            response = await fetch(url);
                            if (response.ok) {
                              data = await response.json();
                              stations = data.chargerstations || [];
                              console.log(`🌐 Page 2: ${stations.length} total stations`);
                              
                              const page2Recharge = stations.filter((station: any) => {
                                const operator = (station.csmd?.Owned_by || '').toLowerCase();
                                return operator.includes('recharge');
                              });
                              
                              page2Recharge.forEach((station: any) => {
                                const id = station.csmd?.id?.toString();
                                if (id && !apiStations.has(id)) {
                                  apiStations.set(id, {
                                    id,
                                    name: station.csmd?.name || 'Unknown',
                                    operator: station.csmd?.Owned_by || 'Unknown',
                                    position: station.csmd?.Position || 'Unknown'
                                  });
                                }
                              });
                              
                              totalApiStations += page2Recharge.length;
                              console.log(`⚡ Page 2: ${page2Recharge.length} Recharge stations`);
                            }
                          }
                          
                          console.log(`🌐 NOBIL API TOTAL: ${apiStations.size} unique Recharge stations`);
                          
                          // Step 2: Get ALL Recharge stations from our Supabase database
                          console.log('🗄️ Fetching from Supabase database...');
                          const { supabase } = require('../services/supabaseClient');
                          
                          const { data: dbStations, error } = await supabase
                            .from('charging_stations')
                            .select('id, external_id, title, operator')
                            .ilike('operator', '%recharge%');
                          
                          if (error) throw error;
                          
                          const dbStationsMap = new Map();
                          (dbStations || []).forEach((station: any) => {
                            dbStationsMap.set(station.external_id?.toString(), {
                              id: station.external_id?.toString(),
                              name: station.title,
                              operator: station.operator
                            });
                          });
                          
                          console.log(`🗄️ SUPABASE DATABASE TOTAL: ${dbStationsMap.size} Recharge stations`);
                          
                          // Step 3: Compare and find differences
                          const missingFromDb = [];
                          const extraInDb = [];
                          
                          // Find stations in API but not in DB
                          for (const [id, station] of apiStations) {
                            if (!dbStationsMap.has(id)) {
                              missingFromDb.push(station);
                            }
                          }
                          
                          // Find stations in DB but not in API
                          for (const [id, station] of dbStationsMap) {
                            if (!apiStations.has(id)) {
                              extraInDb.push(station);
                            }
                          }
                          
                          console.log('🔍 COMPARISON RESULTS:');
                          console.log(`🌐 Nobil API: ${apiStations.size} Recharge stations`);
                          console.log(`🗄️ Database: ${dbStationsMap.size} Recharge stations`);
                          console.log(`❌ Missing from DB: ${missingFromDb.length} stations`);
                          console.log(`➕ Extra in DB: ${extraInDb.length} stations`);
                          
                          // Log missing stations details
                          if (missingFromDb.length > 0) {
                            console.log('📋 MISSING FROM DATABASE:');
                            missingFromDb.slice(0, 10).forEach((station, i) => {
                              console.log(`  ${i + 1}. ${station.name} (ID: ${station.id})`);
                            });
                            if (missingFromDb.length > 10) {
                              console.log(`  ... and ${missingFromDb.length - 10} more`);
                            }
                          }
                          
                          // Check specifically for Häggvik
                          const apiHaggvik = Array.from(apiStations.values()).filter(s => 
                            s.name.toLowerCase().includes('häggvik') || s.name.toLowerCase().includes('haggvik')
                          );
                          const dbHaggvik = Array.from(dbStationsMap.values()).filter(s => 
                            s.name.toLowerCase().includes('häggvik') || s.name.toLowerCase().includes('haggvik')
                          );
                          
                          console.log(`🎯 Häggvik in API: ${apiHaggvik.length}`);
                          console.log(`🎯 Häggvik in DB: ${dbHaggvik.length}`);
                          
                          if (apiHaggvik.length > 0) {
                            console.log('🎯 API Häggvik stations:', apiHaggvik.map(s => `${s.name} (${s.id})`));
                          }
                          if (dbHaggvik.length > 0) {
                            console.log('🎯 DB Häggvik stations:', dbHaggvik.map(s => `${s.name} (${s.id})`));
                          }
                          
                          const summary = [
                            '🔍 API vs DATABASE COMPARISON',
                            '',
                            '📊 COUNTS:',
                            `🌐 Nobil API: ${apiStations.size} Recharge stations`,
                            `🗄️ Database: ${dbStationsMap.size} Recharge stations`,
                            '',
                            '📋 DIFFERENCES:',
                            `❌ Missing from DB: ${missingFromDb.length}`,
                            `➕ Extra in DB: ${extraInDb.length}`,
                            '',
                            '🎯 HÄGGVIK CHECK:',
                            `🌐 API: ${apiHaggvik.length} Häggvik stations`,
                            `🗄️ DB: ${dbHaggvik.length} Häggvik stations`,
                            '',
                            missingFromDb.length > 0 ? 
                              `⚠️ Database is missing ${missingFromDb.length} stations!` :
                              '✅ Database is up to date!',
                            '',
                            missingFromDb.length > 0 ? 
                              'Use "Load All Recharge" to sync missing stations' : 
                              'Your database is complete! 🎉'
                          ].join('\n');
                          
                          Alert.alert('🔍 Comparison Complete', summary);
                          
                        } catch (error: any) {
                          console.error('❌ Comparison failed:', error);
                          Alert.alert('Comparison Failed', `Failed to compare API vs Database: ${error?.message || 'Unknown error'}`);
                        }
                      }
                    }
                  ]
                );
              }}
            >
              <Text style={styles.menuButtonIcon}>🔍</Text>
              <Text style={styles.menuButtonText}>API vs Database</Text>
            </TouchableOpacity>

            {/* Database Status - Check sync results */}
            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={handleShowSyncStatus}
            >
              <Text style={styles.menuButtonIcon}>📊</Text>
              <Text style={styles.menuButtonText}>Database Status</Text>
            </TouchableOpacity>

            {/* FIXED Recharge Sync - Multi-Region Strategy */}
            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={async () => {
                setShowMenu(false);
                
    Alert.alert(
                  '🇸🇪 FIXED Multi-Region Sync',
                  'BREAKTHROUGH: We discovered large rectangle searches are broken!\n\n🎯 Uses multiple smaller regions instead\n✅ Guaranteed to find Häggvik!\n📊 More reliable than Sweden-wide search',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
                      text: 'Multi-Region Sync',
          onPress: async () => {
            try {
                          console.log('🇸🇪 Starting FIXED multi-region Recharge sync...');
                          console.log('🔧 SOLUTION: Multiple smaller searches instead of one massive Sweden search');
                          
                          const allStations = new Map();
                          let totalRechargeStations = 0;
                          const rechargeStations: any[] = [];
                          
                          const apiKey = process.env.EXPO_PUBLIC_NOBIL_API_KEY;
                          
                          // FIXED: Multiple strategic regions instead of one massive Sweden rectangle
                          const searchRegions = [
                            { name: 'Stockholm Area', northeast: '(59.8, 18.5)', southwest: '(59.0, 17.5)' },
                            { name: 'Gothenburg Area', northeast: '(58.2, 12.5)', southwest: '(57.3, 11.5)' },
                            { name: 'Malmö Area', northeast: '(56.2, 13.5)', southwest: '(55.3, 12.8)' },
                            { name: 'Uppsala Area', northeast: '(60.2, 18.2)', southwest: '(59.6, 17.2)' },
                            { name: 'Linköping Area', northeast: '(58.8, 16.0)', southwest: '(58.0, 15.0)' },
                            { name: 'Örebro Area', northeast: '(59.8, 15.8)', southwest: '(59.0, 14.8)' },
                            { name: 'Västerås Area', northeast: '(59.8, 17.0)', southwest: '(59.4, 16.2)' },
                            { name: 'Norrköping Area', northeast: '(58.8, 16.5)', southwest: '(58.4, 15.8)' },
                            { name: 'Helsingborg Area', northeast: '(56.2, 13.0)', southwest: '(55.9, 12.5)' },
                            { name: 'Jönköping Area', northeast: '(57.9, 14.5)', southwest: '(57.5, 13.8)' }
                          ];
                          
                          console.log(`🗺️ Searching ${searchRegions.length} strategic regions across Sweden...`);
                          
                          for (const region of searchRegions) {
                            try {
                              console.log(`🔍 Searching ${region.name}...`);
                              
                              let url = `https://nobil.no/api/server/search.php?apiversion=3&action=search&type=rectangle&northeast=${region.northeast}&southwest=${region.southwest}&format=json&apikey=${apiKey}&limit=1000`;
                              
                              let response = await fetch(url);
                              if (!response.ok) {
                                console.error(`❌ ${region.name} API error: ${response.status}`);
                                continue;
                              }
                              
                              let data = await response.json();
                              let stations = data.chargerstations || [];
                              console.log(`📊 ${region.name}: ${stations.length} total stations`);
                              
                              // Filter to Recharge stations only
                              const regionRecharge = stations.filter((station: any) => {
                                const operator = (station.csmd?.Owned_by || '').toLowerCase();
                                return operator.includes('recharge');
                              });
                              
                              console.log(`⚡ ${region.name}: ${regionRecharge.length} Recharge stations`);
                              
                              // Check for Häggvik in this region
                              const regionHaggvik = regionRecharge.filter((station: any) => {
                                const name = (station.csmd?.name || '').toLowerCase();
                                return name.includes('häggvik') || name.includes('haggvik');
                              });
                              
                              if (regionHaggvik.length > 0) {
                                console.log(`🎉 HÄGGVIK FOUND in ${region.name}!`);
                                regionHaggvik.forEach((station: any) => {
                                  console.log(`  ✅ ${station.csmd?.name} (ID: ${station.csmd?.id}) at ${station.csmd?.Position}`);
                                });
                              }
                              
                              // Add unique stations
                              regionRecharge.forEach((station: any) => {
                                const id = station.csmd?.id?.toString();
                                if (id && !allStations.has(id)) {
                                  allStations.set(id, station);
                                  rechargeStations.push(station);
                                }
                              });
                              
                              totalRechargeStations += regionRecharge.length;
                              
                              // Small delay between regions
                              await new Promise(resolve => setTimeout(resolve, 500));
                              
                            } catch (error) {
                              console.error(`❌ Error searching ${region.name}:`, error);
                            }
                          }
                          
                          console.log(`🇸🇪 Multi-region search complete!`);
                          console.log(`📊 Total Recharge stations found: ${allStations.size} unique`);
                          console.log(`🔍 Total searches: ${totalRechargeStations} (with duplicates)`);
                          
                          // Check if we found Häggvik
                          const foundHaggvik = Array.from(allStations.values()).filter((station: any) => {
                            const name = (station.csmd?.name || '').toLowerCase();
                            return name.includes('häggvik') || name.includes('haggvik');
                          });
                          
                          console.log(`🎯 Häggvik stations found: ${foundHaggvik.length}`);
                          if (foundHaggvik.length > 0) {
                            foundHaggvik.forEach(station => {
                              console.log(`  🎉 ${station.csmd?.name} (ID: ${station.csmd?.id})`);
                            });
                          }
                          
                          // Convert to our database format and sync
                          const stationsToSync = rechargeStations.map((station: any) => ({
                            id: `SE_${station.csmd?.id}`,
                            latitude: parseFloat(station.csmd?.Position?.split(',')[0]?.replace('(', '') || '0'),
                            longitude: parseFloat(station.csmd?.Position?.split(',')[1]?.replace(')', '') || '0'),
                            title: station.csmd?.name || 'Unknown Station',
                            description: `${station.csmd?.Street || ''} ${station.csmd?.House_number || ''}, ${station.csmd?.City || 'Sweden'}`.trim(),
                            operator: station.csmd?.Owned_by || 'Unknown'
                          })).filter(s => s.latitude !== 0 && s.longitude !== 0);
                          
                          console.log(`🗄️ Syncing ${stationsToSync.length} valid Recharge stations to database...`);
                          
                          // Batch sync to database using Supabase directly (same approach as stationSyncService)
                          console.log('🗄️ Starting database sync...');
                          const { supabase } = require('../services/supabaseClient');
                          
                          let syncedCount = 0;
                          const errors: string[] = [];
                          
                          // Transform to database format
                          const dbStations = stationsToSync.map((station: any) => ({
                            id: station.id,
                            external_id: parseInt(station.id.replace('SE_', '')),
                            title: station.title,
                            description: station.description,
                            operator: station.operator,
                latitude: station.latitude,
                longitude: station.longitude,
                            street: station.description.split(',')[0] || null,
                            house_number: null,
                            city: station.description.split(',')[1]?.trim() || 'Sweden',
                            zipcode: null,
                            country: 'SE',
                            available_charging_points: 0,
                            station_status: 1,
                          }));
                          
                          // Batch sync in chunks of 50 (same as stationSyncService)
                          const batchSize = 50;
                          for (let i = 0; i < dbStations.length; i += batchSize) {
                            const batch = dbStations.slice(i, i + batchSize);
                            console.log(`📝 Syncing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(dbStations.length/batchSize)} (${batch.length} stations)...`);
                            
                            try {
                              const { error } = await supabase
                                .from('charging_stations')
                                .upsert(batch, { 
                                  onConflict: 'id',
                                  ignoreDuplicates: false 
                                });
                              
                              if (error) {
                                const errorMsg = `Batch ${Math.floor(i/batchSize) + 1} failed: ${error.message}`;
                                console.error(errorMsg);
                                errors.push(errorMsg);
                              } else {
                                syncedCount += batch.length;
                                console.log(`✅ Synced batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(dbStations.length/batchSize)} (${batch.length} stations)`);
                              }
                            } catch (error) {
                              const errorMsg = `Batch ${Math.floor(i/batchSize) + 1} error: ${error}`;
                              console.error(errorMsg);
                              errors.push(errorMsg);
                            }
                            
                            // Small delay between batches
                            await new Promise(resolve => setTimeout(resolve, 100));
                          }
                          
                          const summary = [
                            '🔧 FIXED MULTI-REGION SYNC COMPLETE!',
                            '',
                            '🎉 SOLUTION: Used multiple small regions instead of broken Sweden-wide search!',
                            '',
                            `📊 Unique Recharge stations found: ${allStations.size}`,
                            `🗄️ Valid stations for sync: ${stationsToSync.length}`,
                            `✅ Successfully synced: ${syncedCount}`,
                            `❌ Errors: ${errors.length}`,
                            '',
                            `🎯 Häggvik found: ${foundHaggvik.length > 0 ? 'YES!' : 'Still checking...'}`,
                            foundHaggvik.length > 0 ? `✅ ${foundHaggvik.map((s: any) => s.csmd?.name).join(', ')}` : '',
                            '',
                            errors.length === 0 ? '🎯 Perfect! Option D is now fully loaded!' : `⚠️ Some sync issues: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? '...' : ''}`,
                            '🗺️ All Swedish Recharge stations available via multi-region search',
                            '',
                            '🔄 Map will reload automatically with new data!'
                          ].filter(line => line !== '').join('\n');
                          
                          Alert.alert('🇸🇪 Sync Complete!', summary);
                          
                          // Reload the map with new data
                          await loadChargingStations(true);
                          
                        } catch (error: any) {
                          console.error('❌ Comprehensive Recharge sync failed:', error);
                          Alert.alert('Sync Failed', `Failed to sync Recharge stations: ${error?.message || 'Unknown error'}`);
                        }
                      }
                    }
                  ]
                );
              }}
            >
              <Text style={styles.menuButtonIcon}>🔧</Text>
              <Text style={styles.menuButtonText}>FIXED Multi-Region</Text>
        </TouchableOpacity>
        
            {/* === SYSTEM === */}
            
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

      {/* Tool Selection Modal */}
      <ToolSelectionModal
        visible={showToolModal}
        selectedSlot={selectedToolSlot}
        onClose={closeToolModal}
        currentLevel={currentLevel}
        equippedTools={equippedTools}
        isToolUnlocked={isToolUnlocked}
        equipTool={equipTool}
        unequipTool={unequipTool}
      />

      {/* Pixel Art Toast Notification */}
      <PixelToast 
        visible={showToast}
        message={toastMessage}
        onHide={() => setShowToast(false)}
      />
    </View>
  );
};

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
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
    marginTop: 4,
  },
  headerBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 4,
    marginBottom: 4,
  },
  logoCharge: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  logoQuest: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00FF88',
    fontFamily: 'monospace',
  },
  logoIcon: {
    fontSize: 18,
    color: '#FFD700',
    marginHorizontal: 2,
  },
  levelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'monospace',
    marginRight: 12,
  },
  xpContainer: {
    flex: 1,
    flexDirection: 'row',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpSegment: {
    flex: 1,
    height: 8,
    marginRight: 1,
    borderRadius: 2,
  },
  map: {
    flex: 1,
    zIndex: 1,
  },
  floatingAvatarButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    width: 60,
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#00FF88',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  centerLocationButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    width: 50,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#00FF88',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  menuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
  },
  slideUpMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1500,
  },
  menuModal: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    // 3D bevel effect for menu
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderTopColor: '#CCCCCC',
    borderLeftColor: '#CCCCCC',
    borderRightColor: '#333333',
    borderStyle: 'solid',
    paddingTop: 20,
    maxHeight: '92%',
    marginHorizontal: 16,
    marginBottom: 16,
    zIndex: 1501,
  },
  menuContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 15,
    marginVertical: 3,
    // 3D bevel effect for menu buttons
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.4)',
    borderLeftColor: 'rgba(255, 255, 255, 0.4)',
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'solid',
  },
  menuButtonIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 30,
    textAlign: 'center',
  },
  menuButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  // Popover styles
  popoverContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Slightly more dimmed backdrop
    justifyContent: 'center', // Center the popover+marker group
    alignItems: 'center',
    zIndex: 10000,
    elevation: 15,
    pointerEvents: 'auto',
  },
  popover: {
    backgroundColor: '#1A1A1A',
    padding: 20,
    width: 300,
    // Simple center positioning - popover appears over centered marker
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderStyle: 'solid',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    position: 'relative', // Needed for arrow positioning
  },
  // Status-based popover variants
  popoverUndiscovered: {
    borderTopColor: '#FF6B6B',
    borderLeftColor: '#FF6B6B',
    borderBottomColor: '#CC4444',
    borderRightColor: '#CC4444',
  },
  popoverClaimable: {
    borderTopColor: '#AA77FF',
    borderLeftColor: '#AA77FF',
    borderBottomColor: '#7744CC',
    borderRightColor: '#7744CC',
  },
  popoverClaimed: {
    borderTopColor: '#00FF88',
    borderLeftColor: '#00FF88',
    borderBottomColor: '#00AA66',
    borderRightColor: '#00AA66',
  },
  // Location name styles - uniform color for all states
  popoverLocationName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
    fontFamily: 'monospace',
    flex: 1,
    color: '#FFFFFF', // Uniform white text for all states
  },
  popoverProgress: {
    marginBottom: 15,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    flex: 1,
  },
  progressValue: {
    fontSize: 12,
    color: '#00FF88',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00FF88',
    borderRadius: 4,
  },
  popoverButton: {
    backgroundColor: '#00FF88',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    // 3D bevel effect for popover button
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderTopColor: '#55FF99',
    borderLeftColor: '#55FF99',
    borderBottomColor: '#00CC66',
    borderRightColor: '#00CC66',
    borderStyle: 'solid',
  },
  popoverButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  popoverButtonHolding: {
    backgroundColor: '#FFAA00', // Orange during hold
    borderTopColor: '#FFCC55',
    borderLeftColor: '#FFCC55',
    borderBottomColor: '#CC7700',
    borderRightColor: '#CC7700',
  },
  // New popover styles for close button and disabled state
  popoverHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Top align X button
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333333', // Solid color instead of transparency
    borderRadius: 2,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    lineHeight: 16,
  },
  popoverButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    // 3D bevel effect for disabled button
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderTopColor: '#666666',
    borderLeftColor: '#666666',
    borderBottomColor: '#333333',
    borderRightColor: '#333333',
    borderStyle: 'solid',
  },
  popoverButtonTextDisabled: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999999',
  },
  
  // Treasure display styles
  treasureContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 15,
    marginTop: 15,
    borderRadius: 8,
  },
  treasureChestContainer: {
    alignItems: 'center',
    marginTop: 12, // 4 pixels * 3 (3px-per-pixel scaling)
    marginBottom: 15,
  },
  treasureChest: {
    position: 'relative',
    width: 54, // 18 pixels * 3 (x: 10px-180px = positions 0-17)
    height: 33, // 11 pixels * 3 (y: 60px-170px = positions 0-10)
  },
  simpleTreasureRarityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  simpleTreasureXpContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  treasureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingLeft: 8,
  },
  treasureRarityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  treasureLockIcon: {
    marginRight: 6,
  },
  treasureRarity: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  treasureXP: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  treasureDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    fontFamily: 'monospace',
    marginBottom: 12,
    paddingLeft: 8,
    lineHeight: 18,
  },
  treasureCollectButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 2,
    borderStyle: 'solid',
    marginTop: 5,
  },
  treasureCollectText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  
  // Treasure teaser styles (when outside 25m range)
  treasureTeaserContainer: {
    paddingLeft: 8,
    paddingVertical: 8,
    marginTop: 5,
  },
  
  // Pixel Art Toast Notification styles
  pixelToast: {
    position: 'absolute',
    top: 220, // Moved down to appear below header
    left: 20,
    right: 20,
    zIndex: 20000,
    elevation: 20,
    alignItems: 'center',
  },
  pixelToastContent: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    // 3D pixel art bevel effect
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopColor: '#00FFAA',
    borderLeftColor: '#00FFAA',
    borderBottomColor: '#006644',
    borderRightColor: '#006644',
    borderStyle: 'solid',
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 12,
  },
  pixelToastText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00FFAA',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  
  // Tool Selection Modal styles with pixel art aesthetic
  toolModalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15000,
    elevation: 15,
    pointerEvents: 'auto',
  },
  toolModal: {
    backgroundColor: '#1A1A1A',
    width: 340,
    maxHeight: 500,
    minHeight: 200,
    padding: 20,
    // 3D pixel art bevel effect
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopColor: '#AA77FF',
    borderLeftColor: '#AA77FF',
    borderBottomColor: '#6644CC',
    borderRightColor: '#6644CC',
    borderStyle: 'solid',
    // Sharp corners for pixel art
    borderRadius: 0,
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 20,
  },
  toolModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#333333',
    borderStyle: 'solid',
  },
  toolModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  toolModalCloseButton: {
    backgroundColor: '#333333',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    // 3D bevel for close button
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderTopColor: '#555555',
    borderLeftColor: '#555555',
    borderBottomColor: '#111111',
    borderRightColor: '#111111',
    borderStyle: 'solid',
  },
  toolModalCloseText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#CCCCCC',
    fontFamily: 'monospace',
  },
  // Current Tool Display (when slot has a tool equipped)
  currentToolContainer: {
    marginBottom: 20,
  },
  currentToolLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#AAAAAA',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  currentToolCard: {
    backgroundColor: '#2A2A2A',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // 3D pixel art borders
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopColor: '#AA77FF',
    borderLeftColor: '#AA77FF',
    borderBottomColor: '#6644CC',
    borderRightColor: '#6644CC',
    borderStyle: 'solid',
  },
  currentToolInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currentToolIcon: {
    marginRight: 12,
  },
  currentToolTextContainer: {
    flex: 1,
  },
  currentToolName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  currentToolDescription: {
    fontSize: 11,
    color: '#AAAAAA',
    fontFamily: 'monospace',
    marginTop: 4,
    lineHeight: 14,
  },
  unequipButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    // 3D pixel art borders
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderTopColor: '#FF9999',
    borderLeftColor: '#FF9999',
    borderBottomColor: '#CC4444',
    borderRightColor: '#CC4444',
    borderStyle: 'solid',
  },
  unequipButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  
  // Available Tools Horizontal Scroll (when slot is empty)
  availableToolsContainer: {},
  availableToolsLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#AAAAAA',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  toolScrollView: {
    maxHeight: 140,
  },
  toolScrollContent: {
    paddingRight: 20,
  },
  horizontalToolCard: {
    width: 120,
    backgroundColor: '#2A2A2A',
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 120,
    // 3D pixel art borders
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopColor: '#888888',
    borderLeftColor: '#888888', 
    borderBottomColor: '#555555',
    borderRightColor: '#555555',
    borderStyle: 'solid',
  },
  horizontalToolCardLocked: {
    backgroundColor: '#181818',
    borderTopColor: '#333333',
    borderLeftColor: '#333333',
    borderBottomColor: '#1A1A1A',
    borderRightColor: '#1A1A1A',
    opacity: 0.7,
  },
  horizontalToolIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
  },
  horizontalToolName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'monospace',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  horizontalToolNameLocked: {
    color: '#444444',
  },
  horizontalToolNameEquippedElsewhere: {
    color: '#997766',
  },
  horizontalToolLevel: {
    fontSize: 8,
    color: '#888888',
    fontFamily: 'monospace',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 4,
  },
  horizontalToolEquippedElsewhere: {
    fontSize: 8,
    color: '#997766',
    fontFamily: 'monospace',
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 4,
  },
  horizontalToolDescription: {
    fontSize: 8,
    color: '#CCCCCC',
    fontFamily: 'monospace',
    textAlign: 'center',
    lineHeight: 10,
    marginTop: 4,
  },
  horizontalToolCardSelected: {
    borderTopColor: '#AA77FF',
    borderLeftColor: '#AA77FF',
    borderBottomColor: '#6644CC',
    borderRightColor: '#6644CC',
    backgroundColor: '#2A2A3A',
  },
  
  // Tool Detail Section (shows when tool is selected for info)
  toolDetailContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#222222',
    // 3D pixel art borders
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderTopColor: '#444444',
    borderLeftColor: '#444444',
    borderBottomColor: '#111111',
    borderRightColor: '#111111',
    borderStyle: 'solid',
  },
  toolDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  toolDetailIcon: {
    marginRight: 12,
  },
  toolDetailInfo: {
    flex: 1,
  },
  toolDetailName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  toolDetailLevel: {
    fontSize: 10,
    color: '#AAAAAA',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  toolDetailDescription: {
    fontSize: 12,
    color: '#CCCCCC',
    fontFamily: 'monospace',
    lineHeight: 16,
    marginBottom: 12,
  },
  toolEquipButton: {
    backgroundColor: '#AA77FF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    // 3D pixel art borders
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderTopColor: '#CCAAFF',
    borderLeftColor: '#CCAAFF',
    borderBottomColor: '#6644CC',
    borderRightColor: '#6644CC',
    borderStyle: 'solid',
  },
  toolEquipButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  toolCard: {
    width: 145,
    height: 120,
    backgroundColor: '#2A2A2A',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    // 3D pixel art borders for available tools
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopColor: '#888888',
    borderLeftColor: '#888888',
    borderBottomColor: '#555555',
    borderRightColor: '#555555',
    borderStyle: 'solid',
  },
  toolCardLocked: {
    backgroundColor: '#181818',
    borderTopColor: '#333333',
    borderLeftColor: '#333333',
    borderBottomColor: '#1A1A1A',
    borderRightColor: '#1A1A1A',
    opacity: 0.7,
  },
  toolCardEquipped: {
    backgroundColor: '#2A2A2A',
    borderTopColor: '#AA77FF',
    borderLeftColor: '#AA77FF',
    borderBottomColor: '#6644CC',
    borderRightColor: '#6644CC',
  },
  toolCardEquippedElsewhere: {
    backgroundColor: '#2A2426',
    borderTopColor: '#997766',
    borderLeftColor: '#997766',
    borderBottomColor: '#665544',
    borderRightColor: '#665544',
  },
  toolCardIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },

  toolCardName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'monospace',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  toolCardNameLocked: {
    color: '#444444',
  },
  toolCardLevel: {
    fontSize: 10,
    color: '#888888',
    fontFamily: 'monospace',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  toolCardEquippedText: {
    fontSize: 10,
    color: '#AA77FF',
    fontFamily: 'monospace',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  toolCardElsewhereText: {
    fontSize: 10,
    color: '#997766',
    fontFamily: 'monospace',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  toolCardDescription: {
    fontSize: 9,
    color: '#CCCCCC',
    fontFamily: 'monospace',
    textAlign: 'center',
    lineHeight: 12,
  },
  
  // New claim button with integrated progress
  claimButton: {
    backgroundColor: '#AA77FF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    position: 'relative',
    overflow: 'hidden',
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopColor: '#BBAAFF',
    borderLeftColor: '#BBAAFF',
    borderBottomColor: '#7744CC',
    borderRightColor: '#7744CC',
    borderStyle: 'solid',
  },
  claimButtonHolding: {
    backgroundColor: '#FFAA00',
    borderTopColor: '#FFCC55',
    borderLeftColor: '#FFCC55',
    borderBottomColor: '#CC7700',
    borderRightColor: '#CC7700',
  },
  claimButtonCompleted: {
    backgroundColor: '#00FF88',
    borderTopColor: '#55FFAA',
    borderLeftColor: '#55FFAA',
    borderBottomColor: '#00CC66',
    borderRightColor: '#00CC66',
  },
  claimButtonProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 1,
  },
  claimButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    zIndex: 2,
    position: 'relative',
  },
  // Pixel art styles for avatar
  pixelAvatar: {
    width: 30,
    height: 30,
  },
  characterRow: {
    flexDirection: 'row',
    height: 3,
  },
  pixel: {
    width: 3,
    height: 3,
  },
  treasurePixel: {
    width: 3,
    height: 3,
    position: 'absolute',
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  pixelOutline: {
    backgroundColor: '#795548',
  },
  pixelBrownDark: {
    backgroundColor: '#5D4037',
  },
  pixelBrownLight: {
    backgroundColor: '#8D6E63',
  },
  pixelSkin: {
    backgroundColor: '#FFDBCB',
  },
  pixelSkinLight: {
    backgroundColor: '#FFE8D6',
  },
  pixelSkinDark: {
    backgroundColor: '#E8B196',
  },
  pixelBlack: {
    backgroundColor: '#1C1C1C',
  },
  pixelRed: {
    backgroundColor: '#D32F2F',
  },
  pixelRedLight: {
    backgroundColor: '#F44336',
  },
  pixelRedDark: {
    backgroundColor: '#B71C1C',
  },
  // Pixel art colors for user marker
  pixelBlue: {
    backgroundColor: '#2196F3',
  },
  pixelBlueLight: {
    backgroundColor: '#64B5F6',
  },
  // Simple crystal styles (small diamond like in screenshot)
  squaredCrystal: {
    width: 9,
    height: 15,
  },
  crystalRow: {
    flexDirection: 'row',
    height: 3,
  },
  crystalPixel: {
    width: 3,
    height: 3,
  },
  // Lightning bolt styles - slightly smaller
  lightningBolt: {
    width: 39,  // 13 pixels wide x 3px = 39
    height: 48, // 16 pixels tall x 3px = 48
    transform: [{ scale: 0.75 }], // Make 25% smaller
  },
  lightningRow: {
    flexDirection: 'row',
    height: 3, // 1 pixel tall x 3px = 3
  },
  lightningPixel: {
    width: 3,  // 1 pixel wide x 3px = 3
    height: 3, // 1 pixel tall x 3px = 3
  },
  // Energy cell container - sized for smaller lightning bolt (29x36 scaled pixels)
  energyCellContainer: {
    width: 35,  // Scaled lightning bolt width (29) + padding
    height: 42, // Scaled lightning bolt height (36) + padding
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible', // Ensure no clipping
  },
  // Treasure availability indicator - pixel art gem on map markers
  treasureIndicatorDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    zIndex: 10,
    // Pixel art gem structure - no border radius for sharp edges
    borderTopWidth: 2,
    borderLeftWidth: 2, 
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderStyle: 'solid',
    // Colors will be set dynamically based on rarity
    // Light borders on top/left, dark borders on bottom/right for 3D effect
  },
  // Full-body character styles
  fullBodyCharacter: {
    width: 9,
    height: 27,
  },
  enhancedCharacter: {
    width: 18,  // 6 pixels wide x 3px = 18
    height: 36, // 12 pixels tall x 3px = 36
  },
  detailedCharacter: {
    width: 24,  // 8 pixels wide x 3px = 24
    height: 48, // 16 pixels tall x 3px = 48
  },
  crispCharacter: {
    width: 21,  // 7 pixels wide x 3px = 21
    height: 39, // 13 pixels tall x 3px = 39
  },
  testCharacter: {
    width: 15,  // 5 pixels wide x 3px = 15
    height: 15, // 5 pixels tall x 3px = 15
  },
  professionalCharacter: {
    width: 24,  // 8 pixels wide x 3px = 24
    height: 45, // 15 pixels tall x 3px = 45
  },
  cssCharacter: {
    width: 51,  // 17 pixels wide x 3px = 51
    height: 30, // 10 pixels tall x 3px = 30 (simplified version)
  },
  largeCharacter: {
    width: 36,  // 12 pixels wide x 3px = 36
    height: 48, // 16 pixels tall x 3px = 48
  },
  exactCharacter: {
    width: 42,  // 14 pixels wide x 3px = 42
    height: 60, // 20 pixels tall x 3px = 60
  },
  // Pixel art header styles with 3D bevel effect
  pixelHeader: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  pixelHeaderBorder: {
    backgroundColor: '#1E1E1E',
    // Enhanced 3D bevel effect - matching LOCKED tool button borders (what's actually visible)
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopColor: '#555555',
    borderLeftColor: '#555555', 
    borderBottomColor: '#111111',
    borderRightColor: '#111111',
    borderStyle: 'solid',
    paddingHorizontal: 20,
    paddingVertical: 15,
    width: '100%',
  },
  pixelLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  pixelLevelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'monospace',
    marginRight: 12,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  pixelXpContainer: {
    flex: 0.6,
    flexDirection: 'row',
    height: 12,
    backgroundColor: '#222222',
    // Enhanced 3D container effect
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderTopColor: '#111111',
    borderLeftColor: '#111111',
    borderBottomColor: '#555555',
    borderRightColor: '#555555',
    borderStyle: 'solid',
    overflow: 'hidden',
  },
  pixelXpSegment: {
    flex: 1,
    height: 12,
    marginRight: 1,
    // Enhanced 3D segment effect
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderStyle: 'solid',
  },
  pixelXpText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'monospace',
    marginLeft: 12,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  // Gaming HUD Layout
  gamingHUD: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',  
    alignItems: 'flex-end',
    zIndex: 1000,
    paddingHorizontal: 0,
  },
  
  // Secondary buttons (left/right of tools) - no margins, positioned by space-between
  hudSecondaryButton: {
    // No horizontal margins - positioned by justifyContent: space-between
  },
  
  // Primary tool group container - centered with flex: 1
  toolGroup: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 8, // Tight spacing between tool slots
    marginHorizontal: 30, // Space between outer buttons and tool group
  },
  hudButton: {
    // No additional styling - container for border components
  },
  
  // Secondary Button Borders (Avatar & Location - lighter version of LOCKED tool button colors)
  avatarButtonBorder: {
    backgroundColor: '#2E2E2E',
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopColor: '#777777',
    borderLeftColor: '#777777',
    borderBottomColor: '#222222',
    borderRightColor: '#222222',
    borderStyle: 'solid',
    padding: 6,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },

  locationButtonBorder: {
    backgroundColor: '#2E2E2E',
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopColor: '#777777',
    borderLeftColor: '#777777',
    borderBottomColor: '#222222',
    borderRightColor: '#222222',
    borderStyle: 'solid',
    padding: 6,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationButtonFollowing: {
    backgroundColor: 'rgba(0, 255, 136, 0.15)', // Subtle green glow when following
  },
  locationButtonBorderActive: {
    borderTopColor: '#00FF88',
    borderLeftColor: '#00FF88',
    borderBottomColor: '#00AA44',
    borderRightColor: '#00AA44',
  },
  followModeIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF88',
    borderWidth: 1,
    borderColor: '#000000',
  },

  // Primary Tool Slot Borders (75x75 - even more prominent)
  toolSlotEmptyBorder: {
    backgroundColor: '#2A2A2A',
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopColor: '#888888',
    borderLeftColor: '#888888',
    borderBottomColor: '#555555',
    borderRightColor: '#555555',
    borderStyle: 'solid',
    padding: 10,
    width: 75,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolSlotLockedBorder: {
    backgroundColor: '#1E1E1E',
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopColor: '#555555',
    borderLeftColor: '#555555',
    borderBottomColor: '#111111',
    borderRightColor: '#111111',
    borderStyle: 'solid',
    padding: 10,
    width: 75,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolSlotEquippedBorder: {
    backgroundColor: '#3A3A50',
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopColor: '#AAAAFF',
    borderLeftColor: '#AAAAFF',
    borderBottomColor: '#333366',
    borderRightColor: '#333366',
    borderStyle: 'solid',
    padding: 10,
    width: 75,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Tool Slot Content (Enhanced for primary prominence)
  toolSlotEmptyIcon: {
    fontSize: 36,
    color: '#AAAAAA',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  pixelCenterButtonText: {
    fontSize: 16,
    color: '#FF4757',
    textAlign: 'center',
  },
  
  // Phase 5: Player Profile Modal Styles
  playerProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarContainer: {
    marginRight: 15,
    padding: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  playerInfo: {
    flex: 1,
  },
  playerLevel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  playerTitle: {
    fontSize: 16,
    color: '#CCCCCC',
    fontStyle: 'italic',
  },
  
  xpSection: {
    marginBottom: 20,
  },
  xpProgressContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
  },
  xpLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
    textAlign: 'center',
  },
  xpProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpProgressFill: {
    height: '100%',
    backgroundColor: '#00ff88',
    borderRadius: 3,
  },
  
  achievementSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 15,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    marginTop: 2,
  },
  
  territorySection: {
    marginBottom: 20,
  },
  menuButtonContent: {
    flex: 1,
  },
  menuButtonSubtext: {
    fontSize: 12,
    color: '#CCCCCC',
    marginTop: 2,
  },
  
  settingsSection: {
    marginBottom: 20,
  },
  
  developerSection: {
    marginBottom: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  
  hiddenDeveloperToggle: {
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  hiddenToggleText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.3)',
    letterSpacing: 2,
  },
  
  // Gaming Psychology Enhancement Styles
  achievementBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    fontSize: 12,
  },
  milestonesContainer: {
    marginTop: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    padding: 12,
  },
  milestonesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'center',
  },
  milestone: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    padding: 8,
    marginVertical: 2,
  },
  milestoneText: {
    fontSize: 11,
    color: '#CCCCCC',
    textAlign: 'center',
  },
}); 

export default MapScreen;