import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

type AnalyticsEventType =
  | 'app_open'
  | 'claim_started'
  | 'claim_succeeded'
  | 'treasure_spawned'
  | 'treasure_collected'
  | 'error';

type AnalyticsEvent = {
  type: AnalyticsEventType;
  payload?: Record<string, unknown>;
};

const DEVICE_ID_KEY = 'analytics_device_id_v1';
let cachedDeviceId: string | null = null;
let cachedSessionId: string | null = null;

const EVENTS_API_URL = process.env.EXPO_PUBLIC_EVENTS_API_URL;
const EVENTS_API_TOKEN = process.env.EXPO_PUBLIC_EVENTS_API_TOKEN;

function generateId(prefix: string): string {
  const rnd = Math.random().toString(36).slice(2);
  const ts = Date.now().toString(36);
  return `${prefix}_${ts}_${rnd}`;
}

async function getDeviceId(): Promise<string> {
  if (cachedDeviceId) return cachedDeviceId;
  try {
    const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (existing) {
      cachedDeviceId = existing;
      return existing;
    }
    const newId = generateId('dev');
    await AsyncStorage.setItem(DEVICE_ID_KEY, newId);
    cachedDeviceId = newId;
    return newId;
  } catch {
    // Fallback ephemeral
    const fallback = generateId('dev');
    cachedDeviceId = fallback;
    return fallback;
  }
}

function getSessionId(): string {
  if (!cachedSessionId) {
    cachedSessionId = generateId('sess');
  }
  return cachedSessionId;
}

function getAppVersion(): string {
  // Use Expo constants; fallback to unknown
  const version = Constants?.expoConfig?.version || Constants?.manifest2?.extra?.expoClient?.version;
  return version ?? 'unknown';
}

async function postEvent(event: AnalyticsEvent) {
  const deviceId = await getDeviceId();
  const sessionId = getSessionId();

  const envelope = {
    type: event.type,
    payload: event.payload ?? {},
    device_id: deviceId,
    session_id: sessionId,
    app_version: getAppVersion(),
    platform: Platform.OS,
    created_at: new Date().toISOString(),
  };

  if (!EVENTS_API_URL || !EVENTS_API_TOKEN) {
    // Console-backed for alpha if API not configured
    // Keep logs concise but structured
    // eslint-disable-next-line no-console
    console.log('📈 ANALYTICS', envelope);
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    await fetch(`${EVENTS_API_URL.replace(/\/$/, '')}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${EVENTS_API_TOKEN}`,
      },
      body: JSON.stringify(envelope),
      signal: controller.signal,
    });
    clearTimeout(timeout);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('📉 ANALYTICS POST FAILED (console fallback)', {
      type: event.type,
      reason: (err as Error)?.message,
    });
    // Best-effort fallback
    // eslint-disable-next-line no-console
    console.log('📈 ANALYTICS', envelope);
  }
}

export async function trackEvent(type: AnalyticsEventType, payload?: Record<string, unknown>) {
  await postEvent({ type, payload });
}


