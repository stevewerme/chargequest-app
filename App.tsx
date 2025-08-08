import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { trackEvent } from './services/analytics';
import MapScreen from './components/MapScreen';
import AuthScreen from './components/AuthScreen';
import { useGameStore } from './stores/gameStore';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }>{
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    // Best-effort analytics for crash
    trackEvent('error', { name: error.name, message: error.message }).catch(() => {});
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={{ color: '#fff', fontSize: 16, marginBottom: 12 }}>Something went wrong</Text>
          <TouchableOpacity onPress={() => this.setState({ hasError: false })} style={{ paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#333', borderRadius: 6 }}>
            <Text style={{ color: '#fff' }}>Return to app</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

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
    // Minimal analytics: app_open
    trackEvent('app_open').catch(() => {});
  }, []);

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        {/* Show auth screen if not authenticated, otherwise show main app */}
        {!isAuthenticated ? (
          <AuthScreen />
        ) : (
          <MapScreen />
        )}
        <StatusBar style="light" />
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
