import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL, COLORS } from '@/constants/Config';

export default function InvestmentsScreen() {
  const { token } = useAuth();
  const [investments, setInvestments] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const formatINR = (value) => `₹${Math.abs(Number(value || 0)).toLocaleString('en-IN')}`;

  const fetch = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/portfolio`, { headers: { 'x-auth-token': token } });
      setInvestments(res.data?.investments || []);
    } catch (err) { console.error('Fetch investments failed:', err); }
  };

  useEffect(() => { fetch(); }, [token]);
  const onRefresh = async () => { setRefreshing(true); await fetch(); setRefreshing(false); };

  const total = investments.reduce((s, i) => s + (i.amount || 0), 0);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}>
        <Text style={s.title}>My Investments</Text>
        <Text style={s.sub}>{investments.length} active products</Text>

        {/* Total Card */}
        <View style={s.totalCard}>
          <Text style={s.totalLabel}>Total Invested</Text>
          <Text style={s.totalValue}>{formatINR(total)}</Text>
        </View>

        {/* List */}
        {investments.length > 0 ? investments.map((inv: any, i: number) => (
          <View key={inv._id || i} style={s.card}>
            <View style={s.cardTop}>
              <View style={[s.typeBadge, { backgroundColor: inv.type === 'FD' ? 'rgba(34,197,94,0.15)' : 'rgba(56,189,248,0.15)' }]}>
                <Text style={[s.typeBadgeText, { color: inv.type === 'FD' ? COLORS.success : COLORS.accent }]}>{inv.type}</Text>
              </View>
              <Text style={s.status}>Active</Text>
            </View>
            <View style={s.cardRow}>
              <View><Text style={s.label}>Principal</Text><Text style={s.val}>{formatINR(inv.amount)}</Text></View>
              <View><Text style={s.label}>Rate</Text><Text style={s.val}>{inv.interestRate}% APY</Text></View>
              <View><Text style={s.label}>Duration</Text><Text style={s.val}>{inv.durationMonths}mo</Text></View>
            </View>
          </View>
        )) : (
          <View style={s.emptyCard}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>📊</Text>
            <Text style={s.emptyTitle}>No Investments Yet</Text>
            <Text style={s.emptyDesc}>Contact your advisor to start investing</Text>
          </View>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1, padding: 20 },
  title: { color: 'white', fontSize: 24, fontWeight: '800', marginBottom: 4 },
  sub: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 20 },
  totalCard: { backgroundColor: COLORS.primary, borderRadius: 16, padding: 24, marginBottom: 20 },
  totalLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600', textTransform: 'uppercase' },
  totalValue: { color: 'white', fontSize: 32, fontWeight: '800', marginTop: 4 },
  card: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder, borderRadius: 14, padding: 18, marginBottom: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  typeBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  typeBadgeText: { fontSize: 13, fontWeight: '700' },
  status: { color: COLORS.success, fontSize: 13, fontWeight: '600' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  val: { color: 'white', fontSize: 16, fontWeight: '700' },
  emptyCard: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder, borderRadius: 16, padding: 40, alignItems: 'center' },
  emptyTitle: { color: 'white', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptyDesc: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center' },
});
