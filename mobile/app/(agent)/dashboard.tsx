import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

const pc = '#C21B2F';

export default function AgentDashboard() {
  const router = useRouter();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetch for demonstration
    setTimeout(() => {
      setLeads([
        { _id: '1', name: 'John Doe', priority: 'High', funnelStage: 'New', expectedLoanValue: 50000 },
        { _id: '2', name: 'Alice Smith', priority: 'Medium', funnelStage: 'Attempted to Contact', expectedLoanValue: 120000 }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator color={pc} /></View>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Agent Dashboard</Text>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
        <View style={[styles.summaryCard, { flex: 1, marginBottom: 0, marginRight: 10 }]}>
          <Text style={styles.summaryTitle}>Tasks Due Today</Text>
          <Text style={styles.summaryCount}>3</Text>
        </View>
        <TouchableOpacity 
          style={[styles.summaryCard, { flex: 1, marginBottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(194, 27, 47, 0.15)', borderWidth: 1, borderColor: pc }]} 
          onPress={() => router.push('/(agent)/expense')}
        >
          <Text style={{ color: pc, fontWeight: 'bold', fontSize: 16 }}>+ Log Expense</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>My Assigned Leads</Text>
      {leads.map(lead => (
        <TouchableOpacity 
          key={lead._id} 
          style={styles.card}
          onPress={() => router.push(`/lead/${lead._id}`)}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.leadName}>{lead.name}</Text>
            <Text style={[styles.priorityBadge, lead.priority === 'High' && styles.highPriority]}>
              {lead.priority}
            </Text>
          </View>
          <Text style={styles.leadDetail}>Stage: {lead.funnelStage}</Text>
          <Text style={styles.leadValue}>₹{lead.expectedLoanValue.toLocaleString()}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1326', padding: 20 },
  center: { flex: 1, backgroundColor: '#0b1326', justifyContent: 'center', alignItems: 'center' },
  header: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 20, marginTop: 40 },
  summaryCard: { backgroundColor: '#1E293B', padding: 20, borderRadius: 12, marginBottom: 24 },
  summaryTitle: { color: '#94a3b8', fontSize: 14, fontWeight: '600' },
  summaryCount: { color: pc, fontSize: 32, fontWeight: 'bold', marginTop: 8 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 12 },
  card: { backgroundColor: '#0F172A', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#1E293B' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  leadName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  priorityBadge: { backgroundColor: 'rgba(148,163,184,0.15)', color: '#94a3b8', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, fontSize: 10, fontWeight: 'bold' },
  highPriority: { backgroundColor: 'rgba(194,27,47,0.15)', color: pc },
  leadDetail: { color: '#94a3b8', fontSize: 14, marginBottom: 4 },
  leadValue: { color: '#22c55e', fontSize: 14, fontWeight: 'bold' }
});
