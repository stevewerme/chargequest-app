import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useEffect } from 'react';
import MapScreen from './components/MapScreen';
import AuthScreen from './components/AuthScreen';
import { useGameStore } from './stores/gameStore';

export default function App() {
  const { 
    initializeSupabase, 
    isAuthenticated, 
    isCloudSyncEnabled,
    initializePermissions 
  } = useGameStore();

  useEffect(() => {
    // Initialize Supabase and permissions on app start
    initializeSupabase();
    initializePermissions();
  }, []);

  return (
    <View style={styles.container}>
      {/* Show auth screen if not authenticated, otherwise show main app */}
      {!isAuthenticated ? (
        <AuthScreen />
      ) : (
        <MapScreen />
      )}
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
