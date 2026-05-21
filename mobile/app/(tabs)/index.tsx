import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL, COLORS } from '@/constants/Config';
import Animated, { FadeInDown, FadeInRight, ZoomIn } from 'react-native-reanimated';
import { TrendingUp, TrendingDown, Bell, ShieldCheck, Wallet, Activity } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { user, token, refreshUser } = useAuth();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const formatINR = (value) => `₹${Math.abs(Number(value || 0)).toLocaleString('en-IN')}`;

  const fetchData = useCallback(async () => {
    if (!token) return;
    const h = { 'x-auth-token': token };
    try {
      const [portRes, notifRes] = await Promise.all([
        axios.get(`${API_URL}/portfolio`, { headers: h }),
        axios.get(`${API_URL}/me/notifications`, { headers: h }).catch(() => ({ data: [] })),
      ]);
      setPortfolio(portRes.data);
      setNotifications(notifRes.data);
      await refreshUser();
    } catch (e) { console.error(e); }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  const score = user?.creditScore || 0;
  const scoreColor = score >= 750 ? '#00D09C' : score >= 600 ? '#FFB800' : score > 0 ? '#FF5050' : '#888';
  
  const totalNetWorth = portfolio?.summary?.netWorth || 0;
  const isPositive = totalNetWorth > 0;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00D09C" />}>
        
        {/* Header - Upstox style minimal header */}
        <Animated.View entering={FadeInDown.duration(400)} style={s.header}>
          <View>
            <Text style={s.userName}>Hi, {user?.name?.split(' ')[0] || 'User'}</Text>
            <Text style={s.greeting}>Welcome to your financial hub</Text>
          </View>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
          </View>
        </Animated.View>

        {/* Hero Portfolio Card */}
        <Animated.View entering={ZoomIn.duration(500)} style={s.heroCard}>
          <Text style={s.heroLabel}>Total Portfolio Value</Text>
          <Text style={s.heroValue}>{formatINR(totalNetWorth)}</Text>
          <View style={s.heroChangeBox}>
            {isPositive ? <TrendingUp size={16} color="#00D09C" /> : <TrendingDown size={16} color="#FF5050" />}
            <Text style={[s.heroChange, { color: isPositive ? '#00D09C' : '#FF5050' }]}> 
              {isPositive ? '+' : '-'}{formatINR(totalNetWorth * 0.05)} (5.0%) today
            </Text>
          </View>
          <View style={s.heroGrid}>
            <View style={s.heroGridItem}>
              <Text style={s.heroGridLabel}>Invested</Text>
              <Text style={s.heroGridValue}>{formatINR(portfolio?.summary?.totalInvestments || 0)}</Text>
            </View>
            <View style={s.heroGridItem}>
              <Text style={s.heroGridLabel}>Current</Text>
              <Text style={s.heroGridValue}>{formatINR(totalNetWorth)}</Text>

        {/* Quick Stats Row */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={s.quickStats}>
          <View style={s.quickStatBox}>
            <Activity size={20} color={scoreColor} style={{ marginBottom: 8 }} />
            <Text style={s.quickStatLabel}>Credit Score</Text>
            <Text style={[s.quickStatValue, { color: scoreColor }]}>{score || 'N/A'}</Text>
          </View>
          <View style={s.quickStatBox}>
            <Wallet size={20} color="#38bdf8" style={{ marginBottom: 8 }} />
            <Text style={s.quickStatLabel}>Wallet</Text>
            <Text style={[s.quickStatValue, { color: '#38bdf8' }]}>{formatINR(user?.referralWallet || 0)}</Text>
          </View>
          <View style={s.quickStatBox}>
            <ShieldCheck size={20} color={(user as any)?.kycStatus === 'verified' || (user as any)?.kycStatus === 'approved' ? '#00D09C' : '#FFB800'} style={{ marginBottom: 8 }} />
            <Text style={s.quickStatLabel}>KYC</Text>
            <Text style={[s.quickStatValue, { color: (user as any)?.kycStatus === 'verified' || (user as any)?.kycStatus === 'approved' ? '#00D09C' : '#FFB800', textTransform: 'capitalize' }]}>{(user as any)?.kycStatus || 'pending'}</Text>
          </View>
        </Animated.View>

        {/* Holdings List */}
        <Text style={s.sectionTitle}>Your Assets</Text>
        {portfolio?.investments?.length > 0 ? portfolio.investments.map((inv: any, i: number) => (
          <Animated.View entering={FadeInRight.delay(300 + i * 100).duration(400)} key={inv._id} style={s.assetCard}>
            <View style={s.assetHeader}>
              <Text style={s.assetName}>{inv.type} Investment</Text>
              <Text style={s.assetAmount}>{formatINR(inv.amount)}</Text>
            </View>
            <View style={s.assetFooter}>
              <Text style={s.assetInfo}>{inv.durationMonths} Months • {inv.interestRate}% APY</Text>
              <Text style={[s.assetChange, { color: '#00D09C' }]}>+{formatINR(Math.round(inv.amount * (inv.interestRate / 100)))}</Text>
            </View>
          </Animated.View>
        )) : <Text style={s.emptyText}>No active assets yet</Text>}

        {/* Loans List */}
        {portfolio?.loans?.length > 0 && <>
          <Text style={[s.sectionTitle, { marginTop: 20 }]}>Liabilities</Text>
          {portfolio.loans.map((loan: any, i: number) => (
            <Animated.View entering={FadeInRight.delay(400 + i * 100).duration(400)} key={loan._id} style={s.assetCard}>
              <View style={s.assetHeader}>
                <Text style={s.assetName}>Personal Loan</Text>
                <Text style={s.assetAmount}>{formatINR(loan.amount)}</Text>
              </View>
              <View style={s.assetFooter}>
                <Text style={s.assetInfo}>EMI: {loan.emiAmount != null ? `${formatINR(loan.emiAmount)}/mo` : '—'}</Text>
                <Text style={[s.assetChange, { color: '#FF5050' }]}>{loan.interestRate}% Interest</Text>
              </View>
            </Animated.View>
          ))}
        </>}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0a0f' },
  scroll: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 8 },
  userName: { color: 'white', fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  greeting: { color: '#888', fontSize: 13, marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#C21B2F', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: 'white', fontSize: 18, fontWeight: '800' },
  heroCard: { backgroundColor: '#13131c', borderRadius: 20, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  heroLabel: { color: '#888', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  heroValue: { color: 'white', fontSize: 38, fontWeight: '900', marginTop: 8, letterSpacing: -1 },
  heroChangeBox: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, marginBottom: 24 },
  heroChange: { fontSize: 14, fontWeight: '700' },
  heroGrid: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 20 },
  heroGridItem: { flex: 1 },
  heroGridLabel: { color: '#888', fontSize: 12, marginBottom: 4 },
  heroGridValue: { color: 'white', fontSize: 16, fontWeight: '700' },
  quickStats: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  quickStatBox: { flex: 1, backgroundColor: '#13131c', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  quickStatLabel: { color: '#888', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  quickStatValue: { fontSize: 20, fontWeight: '800' },
  sectionTitle: { color: 'white', fontSize: 18, fontWeight: '800', marginBottom: 16 },
  assetCard: { backgroundColor: '#13131c', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' },
  assetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  assetName: { color: 'white', fontSize: 16, fontWeight: '700' },
  assetAmount: { color: 'white', fontSize: 16, fontWeight: '800' },
  assetFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  assetInfo: { color: '#888', fontSize: 13 },
  assetChange: { fontSize: 13, fontWeight: '700' },
  emptyText: { color: '#555', fontSize: 14, textAlign: 'center', padding: 20 },
});
