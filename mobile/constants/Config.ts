import { Platform } from 'react-native';

// Declare __DEV__ as a global variable (Expo/React Native provides this)
declare const __DEV__: boolean;

// Centralized API URL — change LAN_IP to your machine's IP for physical device testing
const LAN_IP = '192.168.1.4';

// TESTING MODE: Set to true to bypass OTP in development, false for production
export const IS_TESTING_MODE = __DEV__; // This uses Expo's __DEV__ global flag

const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    // On web, detect if running on localhost or LAN
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      return `http://${window.location.hostname}:5000/api`;
    }
    return 'http://localhost:5000/api';
  }
  if (Platform.OS === 'android') return `http://${LAN_IP}:5000/api`; // Physical device
  return `http://${LAN_IP}:5000/api`; // iOS physical device
};

export const API_URL = getBaseUrl();

export const COLORS = {
  primary: '#C21B2F',
  bg: '#0a0a14',
  card: '#141422',
  cardBorder: 'rgba(255,255,255,0.06)',
  text: '#FFFFFF',
  textSecondary: '#8a8aa0',
  textMuted: '#555',
  success: '#22c55e',
  warning: '#fbbf24',
  danger: '#ef4444',
  accent: '#38bdf8',
};

export const FONTS = {
  regular: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', fontWeight: '400' as const },
  medium: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', fontWeight: '500' as const },
  semibold: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium', fontWeight: '600' as const },
  bold: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium', fontWeight: '700' as const },
  heavy: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium', fontWeight: '800' as const },
};
