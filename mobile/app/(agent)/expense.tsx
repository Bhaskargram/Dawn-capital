import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL, COLORS } from '@/constants/Config';
import axios from 'axios';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';

const pc = '#C21B2F';

export default function ExpenseLogger() {
  const router = useRouter();
  const { token, user } = useAuth();
  
  const [form, setForm] = useState({ category: '', amount: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!form.category || !form.amount) {
      Alert.alert('Error', 'Please enter a category and amount.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/admin/accounting/ledger`, {
        type: 'expense',
        category: form.category,
        amount: Number(form.amount),
        description: form.description
      }, { headers: { 'x-auth-token': token } });
      
      setSuccess(true);
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.response?.data?.msg || 'Failed to submit expense.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <CheckCircle color="#22c55e" size={64} />
        <Text style={{ color: 'white', fontSize: 24, fontWeight: '700', marginTop: 16 }}>Expense Logged!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Expense</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>Submit a field expense. This will be recorded directly into the company's accounting ledger under your name.</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Category</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g. Travel, Marketing, Client Lunch" 
            placeholderTextColor="#555"
            value={form.category}
            onChangeText={v => setForm({ ...form, category: v })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Amount (₹)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="0.00" 
            placeholderTextColor="#555"
            keyboardType="numeric"
            value={form.amount}
            onChangeText={v => setForm({ ...form, amount: v })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Notes / Description</Text>
          <TextInput 
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
            placeholder="Optional details about this expense" 
            placeholderTextColor="#555"
            multiline
            value={form.description}
            onChangeText={v => setForm({ ...form, description: v })}
          />
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Submit Expense</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 60, backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: '#222' },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '700' },
  content: { padding: 20 },
  infoCard: { backgroundColor: '#1E293B', padding: 16, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: '#334155' },
  infoText: { color: '#94A3B8', fontSize: 14, lineHeight: 20 },
  formGroup: { marginBottom: 20 },
  label: { color: 'white', fontSize: 14, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#141422', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, color: 'white', fontSize: 16 },
  btn: { backgroundColor: pc, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
