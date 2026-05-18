import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL, COLORS } from '@/constants/Config';

export default function LoansScreen() {
  const { token } = useAuth();
  const [loans, setLoans] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [form, setForm] = useState({ amount: '', duration: '12', purpose: '', income: '' });
  const [msg, setMsg] = useState('');

  const fetch = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/portfolio`, { headers: { 'x-auth-token': token } });
      setLoans(res.data?.loans || []);
    } catch (err) { console.error('Fetch loans failed:', err); }
  };

  useEffect(() => { fetch(); }, [token]);
  const onRefresh = async () => { setRefreshing(true); await fetch(); setRefreshing(false); };

  const handleApply = async () => {
    if (!form.amount || !form.purpose || !form.income) { Alert.alert('Error', 'Please fill all fields'); return; }
    setRefreshing(true);
    try {
      await axios.post(`${API_URL}/me/loans`, {
        amount: Number(form.amount),
        durationMonths: Number(form.duration),
        purpose: form.purpose,
        monthlyIncome: Number(form.income)
      }, { headers: { 'x-auth-token': token } });
      setForm({ amount: '', duration: '12', purpose: '', income: '' });
      setMsg('Application submitted successfully! 🚀');
      await fetch();
      setApplying(false);
      setTimeout(() => setMsg(''), 5000);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.msg || 'Failed to submit application');
    } finally {
      setRefreshing(false);
    }
  };

  const total = loans.reduce((s, l) => s + (l.amount || 0), 0);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <Text style={s.title}>My Loans</Text>
          {!applying && (
            <TouchableOpacity onPress={() => setApplying(true)} style={{ backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}>
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 12 }}>+ Apply New</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={s.sub}>{loans.length} active loans</Text>

        {msg ? <View style={s.msgBox}><Text style={s.msgText}>{msg}</Text></View> : null}

        {applying ? (
          <View style={s.card}>
            <Text style={[s.cardTitle, { padding: 0, marginBottom: 20 }]}>Loan Application 📝</Text>
            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>Amount Required ($)</Text>
              <TextInput style={s.fieldInput} value={form.amount} onChangeText={v => setForm({...form, amount: v})} keyboardType="numeric" placeholder="e.g. 5000" placeholderTextColor="#555" />
            </View>
            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>Duration (Months)</Text>
              <TextInput style={s.fieldInput} value={form.duration} onChangeText={v => setForm({...form, duration: v})} keyboardType="numeric" placeholder="e.g. 12" placeholderTextColor="#555" />
            </View>
            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>Purpose of Loan</Text>
              <TextInput style={s.fieldInput} value={form.purpose} onChangeText={v => setForm({...form, purpose: v})} placeholder="e.g. Business expansion" placeholderTextColor="#555" />
            </View>
            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>Monthly Income ($)</Text>
              <TextInput style={s.fieldInput} value={form.income} onChangeText={v => setForm({...form, income: v})} keyboardType="numeric" placeholder="e.g. 3000" placeholderTextColor="#555" />
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: COLORS.primary, flex: 1 }]} onPress={handleApply}>
                <Text style={s.actionBtnText}>Submit Application</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.cardBorder, flex: 1 }]} onPress={() => setApplying(false)}>
                <Text style={[s.actionBtnText, { color: COLORS.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={s.totalCard}>
              <Text style={s.totalLabel}>Total Outstanding</Text>
              <Text style={s.totalValue}>${total.toLocaleString()}</Text>
            </View>

            {loans.length > 0 ? loans.map((loan: any, i: number) => (
              <View key={loan._id || i} style={s.card}>
                <View style={s.cardTop}>
                  <View>
                    <Text style={s.loanType}>{loan.purpose || 'Personal Loan'}</Text>
                    <Text style={{ fontSize: 10, color: COLORS.textMuted }}>{loan.loanId || loan._id.slice(-6)}</Text>
                  </View>
                  <View style={[s.activeBadge, { backgroundColor: (loan.status === 'active' || loan.status === 'approved') ? 'rgba(34,197,94,0.15)' : loan.status === 'pending' ? 'rgba(251,191,36,0.15)' : 'rgba(239,68,68,0.15)' }]}>
                    <Text style={[s.activeText, { color: (loan.status === 'active' || loan.status === 'approved') ? COLORS.success : loan.status === 'pending' ? COLORS.warning : COLORS.danger }]}>{loan.status?.toUpperCase() || 'ACTIVE'}</Text>
                  </View>
                </View>
                <View style={s.cardRow}>
                  <View><Text style={s.label}>Amount</Text><Text style={[s.val, { color: loan.status === 'approved' ? 'white' : COLORS.textSecondary }]}>${loan.amount?.toLocaleString()}</Text></View>
                  <View><Text style={s.label}>EMI</Text><Text style={s.val}>${loan.emiAmount?.toLocaleString() || '—'}/mo</Text></View>
                  <View><Text style={s.label}>Duration</Text><Text style={s.val}>{loan.durationMonths}mo</Text></View>
                </View>
                {loan.status === 'approved' && (
                  <>
                    <View style={s.progressBg}><View style={[s.progressFill, { width: '0%' }]} /></View>
                    <Text style={s.progressText}>0% repaid</Text>
                  </>
                )}
              </View>
            )) : (
              <View style={s.emptyCard}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>🏦</Text>
                <Text style={s.emptyTitle}>No Active Loans</Text>
                <Text style={s.emptyDesc}>Apply for a loan to get started with your financial growth.</Text>
                <TouchableOpacity onPress={() => setApplying(true)} style={{ marginTop: 20, backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 }}>
                  <Text style={{ color: 'white', fontWeight: '700' }}>Apply Now</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
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
  totalCard: { backgroundColor: '#1a1020', borderWidth: 1, borderColor: 'rgba(239,68,68,0.15)', borderRadius: 16, padding: 24, marginBottom: 20 },
  totalLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', textTransform: 'uppercase' },
  totalValue: { color: COLORS.danger, fontSize: 32, fontWeight: '800', marginTop: 4 },
  card: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder, borderRadius: 14, padding: 18, marginBottom: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  loanType: { color: 'white', fontSize: 16, fontWeight: '700' },
  activeBadge: { backgroundColor: 'rgba(251,191,36,0.15)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  activeText: { color: COLORS.warning, fontSize: 12, fontWeight: '700' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  label: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  val: { color: 'white', fontSize: 16, fontWeight: '700' },
  progressBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: COLORS.success, borderRadius: 3 },
  progressText: { color: COLORS.textSecondary, fontSize: 12, marginTop: 6, textAlign: 'right' },
  emptyCard: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder, borderRadius: 16, padding: 40, alignItems: 'center' },
  emptyTitle: { color: 'white', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptyDesc: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center' },
  cardTitle: { color: 'white', fontSize: 18, fontWeight: '800', marginBottom: 20 },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },
  fieldInput: { backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: COLORS.cardBorder, borderRadius: 10, padding: 14, color: 'white', fontSize: 15 },
  actionBtn: { borderRadius: 10, padding: 14, alignItems: 'center', justifyContent: 'center' },
  actionBtnText: { color: 'white', fontSize: 15, fontWeight: '700' },
  msgBox: { backgroundColor: 'rgba(34,197,94,0.1)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)', borderRadius: 12, padding: 12, marginBottom: 16 },
  msgText: { color: COLORS.success, fontSize: 14, textAlign: 'center', fontWeight: '600' },
});
