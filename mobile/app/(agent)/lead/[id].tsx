import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const pc = '#C21B2F';

export default function LeadDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [note, setNote] = useState('');

  const handleCall = () => {
    // Native linking to call
    alert('Calling lead...');
  };

  const saveNote = () => {
    if (!note) return;
    alert('Interaction saved!');
    setNote('');
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.leadName}>Lead Profile</Text>
        <Text style={styles.info}>ID: {id}</Text>
        <Text style={styles.info}>Phone: +91 9876543210</Text>
        <Text style={styles.info}>Email: contact@example.com</Text>
        
        <TouchableOpacity style={styles.primaryBtn} onPress={handleCall}>
          <Text style={styles.btnText}>📞 Tap to Call</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Log Interaction</Text>
      <TextInput 
        style={styles.input}
        placeholder="Enter call notes or email summary..."
        placeholderTextColor="#475569"
        multiline
        value={note}
        onChangeText={setNote}
      />
      <TouchableOpacity style={styles.saveBtn} onPress={saveNote}>
        <Text style={styles.btnText}>Save Note</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1326', padding: 20 },
  backBtn: { marginTop: 40, marginBottom: 20 },
  backText: { color: '#94a3b8', fontSize: 16 },
  card: { backgroundColor: '#0F172A', padding: 20, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: '#1E293B' },
  leadName: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  info: { color: '#94a3b8', fontSize: 14, marginBottom: 8 },
  primaryBtn: { backgroundColor: pc, padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 12 },
  input: { backgroundColor: '#020617', color: '#fff', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#334155', minHeight: 100, textAlignVertical: 'top', marginBottom: 16 },
  saveBtn: { backgroundColor: '#1E293B', padding: 14, borderRadius: 8, alignItems: 'center' }
});
