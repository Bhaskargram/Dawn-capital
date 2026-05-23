import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL, COLORS } from '@/constants/Config';
import Animated, { FadeInDown, FadeInRight, ZoomIn } from 'react-native-reanimated';
import { TrendingUp, Activity, PieChart, Bell, ShieldCheck } from 'lucide-react-native';
import CreditScoreGauge from '@/components/CreditScoreGauge';

const { width } = Dimensions.get('window');
const pc = '#C21B2F';

const formatINR = (value: any) => `₹${Math.abs(Number(value || 0)).toLocaleString('en-IN')}`;

// ═══════ Reusable Glass Card ═══════
function GlassCard({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[s.glassCard, style]}>{children}</View>;
}

export default function DashboardScreen() {
  const { user, token, refreshUser } = useAuth();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [config, setConfig] = useState<any>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    const h = { 'x-auth-token': token };
    try {
      const [portRes, notifRes, configRes] = await Promise.all([
        axios.get(`${API_URL}/portfolio`, { headers: h }),
        axios.get(`${API_URL}/me/notifications`, { headers: h }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/config`).catch(() => ({ data: {} })),
      ]);
      setPortfolio(portRes.data);
      setNotifications(notifRes.data);
      setConfig(configRes.data);
      await refreshUser();
    } catch (e) { console.error(e); }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  const score = (user as any)?.creditScore || 0;
  const kycStatus = (user as any)?.kycStatus || 'pending';
  const kycColor = kycStatus === 'approved' ? '#22c55e' : kycStatus === 'rejected' ? '#ef4444' : '#fbbf24';

  const statCards = [
    {
      label: 'Total Portfolio',
      value: portfolio?.summary?.netWorth || 0,
      icon: <PieChart size={18} color="#fff" />,
      color: '#fff',
      bg: 'rgba(255,255,255,0.04)',
    },
    {
      label: 'Active Investments',
      value: portfolio?.summary?.totalInvestments || 0,
      icon: <TrendingUp size={18} color="#22c55e" />,
      color: '#22c55e',
      bg: 'rgba(34,197,94,0.06)',
    },
    {
      label: 'Total Outstanding',
      value: portfolio?.summary?.totalLoans || 0,
      icon: <Activity size={18} color="#ef4444" />,
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.06)',
    },
  ];

  const investments = portfolio?.investments || [];
  const loans = portfolio?.loans || [];
  const hasProducts = investments.length > 0 || loans.length > 0;
  const recentNotifs = notifications.slice(0, 5);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={pc} />}
      >
        {/* ═══════ HEADER ═══════ */}
        <Animated.View entering={FadeInDown.duration(400)} style={s.header}>
          <View style={s.headerLeft}>
            <Image
              source={{ uri: config?.branding?.logoUrl || 'https://dawnlogos.s3.amazonaws.com/dawn6.png' }}
              style={s.logoImg}
              resizeMode="contain"
            />
            <View>
              <Text style={s.headerTitle}>Dashboard</Text>
              <Text style={s.headerSub}>Overview of your financial standing</Text>
            </View>
          </View>
          <View style={s.headerRight}>
            <View style={[s.kycBadge, { backgroundColor: kycColor + '18', borderColor: kycColor + '35' }]}>
              <ShieldCheck size={13} color={kycColor} />
              <Text style={[s.kycText, { color: kycColor }]}>KYC {kycStatus}</Text>
            </View>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
            </View>
          </View>
        </Animated.View>

        {/* ═══════ CREDIT SCORE ═══════ */}
        <Animated.View entering={ZoomIn.duration(500).delay(100)}>
          <CreditScoreGauge score={score} lastUpdated={(user as any)?.updatedAt} />
        </Animated.View>

        {/* ═══════ 3 STAT CARDS ═══════ */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={s.statGrid}>
          {statCards.map((stat, i) => (
            <View key={i} style={[s.statCard, { backgroundColor: stat.bg }]}>
              <View style={s.statIconRow}>
                {stat.icon}
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
              <Text style={[s.statValue, { color: stat.color }]}>{formatINR(stat.value)}</Text>
            </View>
          ))}
        </Animated.View>

        {/* ═══════ ACTIVE PRODUCTS ═══════ */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text style={s.sectionTitle}>📊 Active Products</Text>
          <GlassCard>
            {hasProducts ? (
              <View>
                {/* Table Header */}
                <View style={s.tableHeader}>
                  <Text style={[s.tableHeaderText, { flex: 2 }]}>Product</Text>
                  <Text style={[s.tableHeaderText, { flex: 1.5, textAlign: 'right' }]}>Amount</Text>
                  <Text style={[s.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Status</Text>
                </View>

                {/* Investment rows */}
                {investments.map((inv: any) => (
                  <View key={inv._id} style={s.tableRow}>
                    <View style={{ flex: 2 }}>
                      <Text style={s.productName}>{inv.type} Deposit</Text>
                      <Text style={s.productSub}>Fixed Return</Text>
                    </View>
                    <Text style={[s.productAmount, { color: '#22c55e', flex: 1.5, textAlign: 'right' }]}>+{formatINR(inv.amount)}</Text>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <View style={s.activeBadge}>
                        <Text style={s.activeBadgeText}>Active</Text>
                      </View>
                    </View>
                  </View>
                ))}

                {/* Loan rows */}
                {loans.map((loan: any) => (
                  <View key={loan._id} style={s.tableRow}>
                    <View style={{ flex: 2 }}>
                      <Text style={s.productName}>Loan</Text>
                      <Text style={s.productSub}>{loan.loanId || loan._id?.slice(-6)}</Text>
                    </View>
                    <Text style={[s.productAmount, { color: '#ef4444', flex: 1.5, textAlign: 'right' }]}>{formatINR(loan.amount)}</Text>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <View style={[
                        s.activeBadge,
                        {
                          backgroundColor: (loan.status === 'approved' || loan.status === 'active')
                            ? 'rgba(34,197,94,0.12)' : 'rgba(251,191,36,0.12)',
                        }
                      ]}>
                        <Text style={[
                          s.activeBadgeText,
                          {
                            color: (loan.status === 'approved' || loan.status === 'active')
                              ? '#22c55e' : '#fbbf24',
                          }
                        ]}>{loan.status}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={s.emptyState}>
                <Text style={s.emptyIcon}>📋</Text>
                <Text style={s.emptyTitle}>No Active Assets</Text>
                <Text style={s.emptyDesc}>Apply for a loan to get started!</Text>
              </View>
            )}
          </GlassCard>
        </Animated.View>

        {/* ═══════ RECENT NOTIFICATIONS ═══════ */}
        <Animated.View entering={FadeInRight.delay(400).duration(400)}>
          <Text style={s.sectionTitle}>🔔 Recent Notifications</Text>
          <GlassCard>
            {recentNotifs.length > 0 ? (
              <View style={s.notifList}>
                {recentNotifs.map((n: any) => (
                  <View key={n._id} style={s.notifItem}>
                    <View style={s.notifAccent} />
                    <View style={s.notifContent}>
                      <Text style={s.notifTitle}>{n.title}</Text>
                      <Text style={s.notifMessage} numberOfLines={2}>{n.message}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={s.emptyState}>
                <Bell size={32} color="#555" />
                <Text style={[s.emptyTitle, { marginTop: 12 }]}>No New Updates</Text>
                <Text style={s.emptyDesc}>Important notifications will appear here.</Text>
              </View>
            )}
          </GlassCard>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0a0f' },
  scroll: { flex: 1, padding: 16 },

  // ─── Header ───
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoImg: {
    width: 38,
    height: 38,
    borderRadius: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerSub: {
    color: '#8a8aa0',
    fontSize: 11,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  kycText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: pc,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: pc + '50',
  },
  avatarText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800',
  },

  // ─── Glass Card ───
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },

  // ─── Stat Cards ───
  statGrid: {
    marginTop: 20,
    marginBottom: 4,
    gap: 12,
  },
  statCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  statLabel: {
    color: '#8a8aa0',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  // ─── Section ───
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    marginTop: 4,
  },

  // ─── Table ───
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    marginBottom: 4,
  },
  tableHeaderText: {
    color: '#555',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  productName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  productSub: {
    color: '#555',
    fontSize: 11,
    marginTop: 2,
  },
  productAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  activeBadge: {
    backgroundColor: 'rgba(34,197,94,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  activeBadgeText: {
    color: '#22c55e',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // ─── Notifications ───
  notifList: {
    gap: 10,
  },
  notifItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  notifAccent: {
    width: 4,
    backgroundColor: pc,
  },
  notifContent: {
    flex: 1,
    padding: 14,
  },
  notifTitle: {
    color: 'white',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  notifMessage: {
    color: '#8a8aa0',
    fontSize: 12,
    lineHeight: 18,
  },

  // ─── Empty States ───
  emptyState: {
    alignItems: 'center',
    padding: 28,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  emptyTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyDesc: {
    color: '#555',
    fontSize: 13,
    textAlign: 'center',
  },
});
