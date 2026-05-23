import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, LogBox, Image } from 'react-native';
import { COLORS, API_URL } from '@/constants/Config';
import Animated, { FadeIn, FadeOut, SlideInUp, SlideOutUp, ZoomIn } from 'react-native-reanimated';
import axios from 'axios';
import { X, Info, AlertCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

LogBox.ignoreLogs(['props.pointerEvents is deprecated']);

function MobileAnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get(`${API_URL}/config`);
        if (res.data?.activeAnnouncements?.length > 0) {
          setAnnouncements(res.data.activeAnnouncements);
        }
      } catch (err) {}
    };
    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 60000);
    return () => clearInterval(interval);
  }, []);

  if (announcements.length === 0) return null;

  return (
    <View style={{ position: 'absolute', top: 50, left: 16, right: 16, zIndex: 9999 }}>
      {announcements.map((a, i) => {
        let bgColor = '#1e3a8a';
        let Icon = Info;
        if (a.type === 'warning') { bgColor = '#b45309'; Icon = AlertCircle; }
        if (a.type === 'danger') { bgColor = '#9f1239'; Icon = AlertCircle; }
        if (a.type === 'success') { bgColor = '#14532d'; }

        return (
          <Animated.View key={a._id} entering={SlideInUp.delay(i * 100)} exiting={SlideOutUp} style={[s.bannerCard, { backgroundColor: bgColor }]}>
            <Icon size={20} color="white" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>{a.title}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 2 }}>{a.message}</Text>
            </View>
            <TouchableOpacity onPress={() => setAnnouncements(announcements.filter(x => x._id !== a._id))} style={{ padding: 4 }}>
              <X size={16} color="white" />
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
}

function CustomSplashScreen() {
  return (
    <Animated.View exiting={FadeOut.duration(500)} style={s.splashContainer}>
      <Animated.View entering={ZoomIn.duration(800).springify()}>
        <Image source={require('@/assets/images/dawn-logo-original.png')} style={s.splashLogo} resizeMode="contain" />
      </Animated.View>
    </Animated.View>
  );
}

function AuthGate() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === '(auth)';
    if (!user && !inAuth) router.replace('/(auth)/login');
    else if (user && inAuth) router.replace('/(tabs)');
  }, [user, loading, segments]);

  if (loading) return <CustomSplashScreen />;

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.bg } }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      {user && <MobileAnnouncementBanner />}
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AuthGate />
    </AuthProvider>
  );
}

const s = StyleSheet.create({
  splashContainer: { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' },
  splashLogo: { width: 200, height: 200 },
  bannerCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 8, boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)', elevation: 8 }
});
