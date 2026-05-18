import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL, COLORS } from '@/constants/Config';
import { Bell, Clock, CheckCircle, AlertTriangle } from 'lucide-react-native';

export default function NotificationsScreen() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/me/notifications`, { headers: { 'x-auth-token': token } });
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Fetch notifications failed', err);
    }
  }, [token]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const onRefresh = async () => { setRefreshing(true); await fetchNotifications(); setRefreshing(false); };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}>
        <Text style={s.title}>Notifications</Text>
        <Text style={s.subtitle}>Real-time account alerts and updates.</Text>

        {notifications.length === 0 ? (
          <View style={s.emptyState}>
            <Bell size={48} color={COLORS.textMuted} />
            <Text style={s.emptyText}>No notifications yet.</Text>
            <Text style={s.emptySub}>Important updates will appear here.</Text>
          </View>
        ) : notifications.map((n, index) => {
          const variant = n.type?.includes('rejected') ? '#ef4444' : n.type?.includes('approved') ? '#22c55e' : n.type === 'announcement' ? '#3b82f6' : '#fbbf24';
          const Icon = n.type?.includes('rejected') ? AlertTriangle : n.type?.includes('approved') ? CheckCircle : Bell;
          return (
            <View key={n._id || index} style={[s.card, { borderLeftColor: variant }]}> 
              <View style={s.cardHeader}> 
                <View style={s.iconWrapper}><Icon size={18} color={variant} /></View>
                <Text style={s.cardTitle}>{n.title}</Text>
              </View>
              <Text style={s.cardMessage}>{n.message}</Text>
              <Text style={s.cardTime}>{new Date(n.createdAt).toLocaleString()}</Text>
            </View>
          );
        })}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1, padding: 18 },
  title: { color: 'white', fontSize: 28, fontWeight: '900', marginBottom: 8 },
  subtitle: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 24 },
  card: { backgroundColor: COLORS.card, borderRadius: 18, padding: 18, marginBottom: 14, borderLeftWidth: 5, borderColor: '#3b82f6' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  iconWrapper: { width: 30, height: 30, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  cardTitle: { color: 'white', fontSize: 16, fontWeight: '800', flex: 1 },
  cardMessage: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 20 },
  cardTime: { color: '#777', fontSize: 12, marginTop: 12 },
  emptyState: { alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 80 },
  emptyText: { color: 'white', fontSize: 18, fontWeight: '700' },
  emptySub: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', maxWidth: 260 },
});
