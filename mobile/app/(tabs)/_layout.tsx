import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/Config';

type TabIconProps = { label: string; icon: string; focused: boolean };

function TabIcon({ label, icon, focused }: TabIconProps) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 6 }}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <Text style={{ fontSize: 10, fontWeight: focused ? '700' : '400', color: focused ? COLORS.primary : COLORS.textMuted, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: COLORS.card, borderTopColor: COLORS.cardBorder, borderTopWidth: 1, height: 70, paddingBottom: 8 },
      tabBarShowLabel: false,
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textMuted,
    }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ focused }) => <TabIcon label="Home" icon="🏠" focused={focused} /> }} />
      <Tabs.Screen name="investments" options={{ title: 'Investments', tabBarIcon: ({ focused }) => <TabIcon label="Invest" icon="📊" focused={focused} /> }} />
      <Tabs.Screen name="loans" options={{ title: 'Loans', tabBarIcon: ({ focused }) => <TabIcon label="Loans" icon="🏦" focused={focused} /> }} />
      <Tabs.Screen name="notifications" options={{ title: 'Notifications', tabBarIcon: ({ focused }) => <TabIcon label="Alerts" icon="🔔" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ focused }) => <TabIcon label="Profile" icon="👤" focused={focused} /> }} />
    </Tabs>
  );
}
