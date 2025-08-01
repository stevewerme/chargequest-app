import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from './supabaseClient';
import { Platform } from 'react-native';

// General auth service for all authentication methods
export const authService = {
  // Logout function that works for all auth methods
  logout: async () => {
    try {
      console.log('🚪 Logging out...');
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log('✅ Successfully logged out');
      return { success: true };
    } catch (error) {
      console.error('❌ Logout error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
};

export const appleAuthService = {
  // Handle Apple Sign-In using native Apple authentication (recommended by Supabase for React Native)
  signInWithApple: async () => {
    try {
      console.log('🍎 Starting native Apple Sign-In...');

      // Check if Apple Authentication is available on this device
      if (Platform.OS !== 'ios') {
        return { success: false, error: 'Apple Sign-In is only available on iOS devices' };
      }

      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        return { success: false, error: 'Apple Sign-In is not available on this device' };
      }

      console.log('📱 Requesting Apple authentication...');

      // Request Apple authentication
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log('✅ Apple authentication successful, signing in with Supabase...');

      // Sign in with Supabase using the Apple ID token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken!,
      });

      if (error) {
        console.error('❌ Supabase sign-in failed:', error);
        throw error;
      }

      console.log('🎉 Successfully signed in with Apple!');
      return { success: true, data };

    } catch (error: any) {
      console.error('💥 Apple Sign-In error:', error);
      
      if (error.code === 'ERR_REQUEST_CANCELED') {
        return { success: false, error: 'Apple Sign-In was cancelled' };
      }
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
}; 