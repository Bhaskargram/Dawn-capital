import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, API_URL } from '@/constants/Config';

export default function ProfileScreen() {
  const { user, token, logout, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editingKyc, setEditingKyc] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  const formatINR = (value) => `₹${Math.abs(Number(value || 0)).toLocaleString('en-IN')}`;
  const [form, setForm] = useState({ name: user?.name || '', phone: (user as any)?.phone || '', address: (user as any)?.address || '' });
  const [kycForm, setKycForm] = useState({
    panNumber: (user as any)?.kyc?.panNumber || '',
    aadhaarNumber: (user as any)?.kyc?.aadhaarNumber || '',
    dateOfBirth: (user as any)?.kyc?.dateOfBirth || '',
    occupation: (user as any)?.kyc?.occupation || '',
    annualIncome: String((user as any)?.kyc?.annualIncome || ''),
    nomineeName: (user as any)?.kyc?.nomineeName || '',
    nomineeRelation: (user as any)?.kyc?.nomineeRelation || '',
    panDocumentUrl: (user as any)?.kyc?.panDocumentUrl || '',
    aadhaarDocumentUrl: (user as any)?.kyc?.aadhaarDocumentUrl || '',
    addressProofUrl: (user as any)?.kyc?.addressProofUrl || '',
  });
  const [pwdForm, setPwdForm] = useState({ current: '', newPwd: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/me`, form, { headers: { 'x-auth-token': token } });
      await refreshUser();
      setEditing(false);
      setMsg('Profile updated!');
      setTimeout(() => setMsg(''), 2000);
    } catch { Alert.alert('Error', 'Failed to update profile'); }
    setSaving(false);
  };

  const handleChangePwd = async () => {
    if (pwdForm.newPwd !== pwdForm.confirm) { Alert.alert('Error', 'Passwords do not match'); return; }
    if (pwdForm.newPwd.length < 6) { Alert.alert('Error', 'Password must be at least 6 characters'); return; }
    setSaving(true);
    try {
      await axios.put(`${API_URL}/me/password`, { currentPassword: pwdForm.current, newPassword: pwdForm.newPwd }, { headers: { 'x-auth-token': token } });
      setChangingPwd(false);
      setPwdForm({ current: '', newPwd: '', confirm: '' });
      setMsg('Password changed!');
      setTimeout(() => setMsg(''), 2000);
    } catch (err: any) { Alert.alert('Error', err.response?.data?.msg || 'Failed'); }
    setSaving(false);
  };

  const handleSaveKyc = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/me`, { kyc: kycForm }, { headers: { 'x-auth-token': token } });
      await refreshUser();
      setEditingKyc(false);
      setMsg('KYC submitted for review!');
      setTimeout(() => setMsg(''), 2000);
    } catch { Alert.alert('Error', 'Failed to update KYC'); }
    setSaving(false);
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out?')) {
        await logout();
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); } },
      ]);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll}>
        <Text style={s.title}>My Profile</Text>

        {msg ? <View style={s.msgBox}><Text style={s.msgText}>{msg}</Text></View> : null}

        {/* Avatar */}
        <View style={s.avatarSection}>
          <View style={s.avatarLarge}><Text style={s.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text></View>
          <Text style={s.name}>{user?.name}</Text>
          <Text style={s.email}>{user?.email}</Text>
        </View>

        {editing ? (
          <View style={s.card}>
            <Text style={s.cardTitle}>Edit Profile</Text>
            {[{ label: 'Name', key: 'name', kb: 'default' as const }, { label: 'Phone', key: 'phone', kb: 'phone-pad' as const }, { label: 'Address', key: 'address', kb: 'default' as const }].map(f => (
              <View key={f.key} style={s.fieldWrap}>
                <Text style={s.fieldLabel}>{f.label}</Text>
                <TextInput style={s.fieldInput} value={(form as any)[f.key]} onChangeText={v => setForm({ ...form, [f.key]: v })} keyboardType={f.kb} placeholderTextColor="#555" />
              </View>
            ))}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: COLORS.primary, flex: 1 }]} onPress={handleSaveProfile} disabled={saving}>
                {saving ? <ActivityIndicator color="white" /> : <Text style={s.actionBtnText}>Save Changes</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.cardBorder, flex: 1 }]} onPress={() => setEditing(false)}>
                <Text style={[s.actionBtnText, { color: COLORS.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : editingKyc ? (
          <View style={s.card}>
            <Text style={s.cardTitle}>KYC Verification</Text>
            {[
              { label: 'PAN Number', key: 'panNumber', kb: 'default' as const },
              { label: 'Aadhaar Number', key: 'aadhaarNumber', kb: 'number-pad' as const },
              { label: 'Date of Birth (YYYY-MM-DD)', key: 'dateOfBirth', kb: 'default' as const },
              { label: 'Occupation', key: 'occupation', kb: 'default' as const },
              { label: 'Annual Income', key: 'annualIncome', kb: 'number-pad' as const },
              { label: 'Nominee Name', key: 'nomineeName', kb: 'default' as const },
              { label: 'Nominee Relation', key: 'nomineeRelation', kb: 'default' as const },
              { label: 'PAN Document URL', key: 'panDocumentUrl', kb: 'url' as const },
              { label: 'Aadhaar Document URL', key: 'aadhaarDocumentUrl', kb: 'url' as const },
              { label: 'Address Proof URL', key: 'addressProofUrl', kb: 'url' as const },
            ].map(f => (
              <View key={f.key} style={s.fieldWrap}>
                <Text style={s.fieldLabel}>{f.label}</Text>
                <TextInput style={s.fieldInput} value={(kycForm as any)[f.key]} onChangeText={v => setKycForm({ ...kycForm, [f.key]: f.key === 'panNumber' ? v.toUpperCase() : v })} keyboardType={f.kb} placeholderTextColor="#555" />
              </View>
            ))}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, paddingHorizontal: 16, marginBottom: 16 }}>
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: COLORS.primary, flex: 1 }]} onPress={handleSaveKyc} disabled={saving}>
                {saving ? <ActivityIndicator color="white" /> : <Text style={s.actionBtnText}>Submit KYC</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.cardBorder, flex: 1 }]} onPress={() => setEditingKyc(false)}>
                <Text style={[s.actionBtnText, { color: COLORS.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : changingPwd ? (
          <View style={s.card}>
            <Text style={s.cardTitle}>Change Password</Text>
            
            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>Current Password</Text>
              <View style={{ position: 'relative' }}>
                <TextInput style={[s.fieldInput, { paddingRight: 50 }]} value={pwdForm.current} onChangeText={v => setPwdForm({...pwdForm, current: v})} secureTextEntry={!showCurrent} placeholderTextColor="#555" placeholder="Current password" />
                <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={s.eyeBtnProfile}>
                  <Text style={{ fontSize: 16 }}>{showCurrent ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>New Password</Text>
              <View style={{ position: 'relative' }}>
                <TextInput style={[s.fieldInput, { paddingRight: 50 }]} value={pwdForm.newPwd} onChangeText={v => setPwdForm({...pwdForm, newPwd: v})} secureTextEntry={!showNew} placeholderTextColor="#555" placeholder="Min 6 characters" />
                <TouchableOpacity onPress={() => setShowNew(!showNew)} style={s.eyeBtnProfile}>
                  <Text style={{ fontSize: 16 }}>{showNew ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>Confirm Password</Text>
              <View style={{ position: 'relative' }}>
                <TextInput style={[s.fieldInput, { paddingRight: 50 }]} value={pwdForm.confirm} onChangeText={v => setPwdForm({...pwdForm, confirm: v})} secureTextEntry={!showConfirm} placeholderTextColor="#555" placeholder="Repeat new password" />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={s.eyeBtnProfile}>
                  <Text style={{ fontSize: 16 }}>{showConfirm ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, paddingHorizontal: 16, marginBottom: 16 }}>
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: COLORS.primary, flex: 1 }]} onPress={handleChangePwd} disabled={saving}>
                {saving ? <ActivityIndicator color="white" /> : <Text style={s.actionBtnText}>Update Password</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.cardBorder, flex: 1 }]} onPress={() => setChangingPwd(false)}>
                <Text style={[s.actionBtnText, { color: COLORS.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : showSupport ? (
          <View style={s.card}>
            <Text style={s.cardTitle}>Support & Contact</Text>
            <View style={s.fieldWrap}>
              <Text style={{ color: 'white', fontSize: 15, marginBottom: 8 }}>Email: support@dawncapital.online</Text>
              <Text style={{ color: 'white', fontSize: 15, marginBottom: 8 }}>Phone 1: +91 9862519900</Text>
              <Text style={{ color: 'white', fontSize: 15, marginBottom: 8 }}>Phone 2: +91 9233777509</Text>
            </View>
            <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.cardBorder }]} onPress={() => setShowSupport(false)}>
                <Text style={[s.actionBtnText, { color: COLORS.textSecondary }]}>Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : showAbout ? (
          <View style={s.card}>
            <Text style={s.cardTitle}>About Dawn Multipurpose</Text>
            <View style={s.fieldWrap}>
              <Text style={{ color: 'white', fontSize: 14, lineHeight: 22 }}>Dawn Multipurpose is a leading financial services firm dedicated to empowering individuals and businesses with robust investment opportunities and accessible credit solutions.</Text>
            </View>
            <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.cardBorder }]} onPress={() => setShowAbout(false)}>
                <Text style={[s.actionBtnText, { color: COLORS.textSecondary }]}>Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={s.card}>
              {[
                { label: 'Full Name', value: user?.name || '—' },
                { label: 'Email', value: user?.email || '—' },
                { label: 'Phone', value: (user as any)?.phone || '—' },
                { label: 'KYC Status', value: (user as any)?.kycStatus || 'pending' },
                { label: 'Credit Score', value: user?.creditScore ? String(user.creditScore) : '—' },
                { label: 'Referral Wallet', value: formatINR(user?.referralWallet || 0) },
                { label: 'Wallet Balance', value: formatINR((user as any)?.walletBalance || 0) },
              ].map((r, i, arr) => (
                <View key={i} style={[s.row, i < arr.length - 1 && s.rowBorder]}>
                  <Text style={s.rowLabel}>{r.label}</Text>
                  <Text style={s.rowValue}>{r.value}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={s.editBtn} onPress={() => { setEditing(true); setForm({ name: user?.name || '', phone: (user as any)?.phone || '', address: (user as any)?.address || '' }); }} activeOpacity={0.8}>
              <Text style={s.editBtnText}>✏️ Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[s.editBtn, { borderColor: COLORS.success + '40' }]} onPress={() => {
              setEditingKyc(true);
              setKycForm({
                panNumber: (user as any)?.kyc?.panNumber || '',
                aadhaarNumber: (user as any)?.kyc?.aadhaarNumber || '',
                dateOfBirth: (user as any)?.kyc?.dateOfBirth || '',
                occupation: (user as any)?.kyc?.occupation || '',
                annualIncome: String((user as any)?.kyc?.annualIncome || ''),
                nomineeName: (user as any)?.kyc?.nomineeName || '',
                nomineeRelation: (user as any)?.kyc?.nomineeRelation || '',
                panDocumentUrl: (user as any)?.kyc?.panDocumentUrl || '',
                aadhaarDocumentUrl: (user as any)?.kyc?.aadhaarDocumentUrl || '',
                addressProofUrl: (user as any)?.kyc?.addressProofUrl || '',
              });
            }} activeOpacity={0.8}>
              <Text style={[s.editBtnText, { color: COLORS.success }]}>✅ Update KYC</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[s.editBtn, { borderColor: COLORS.warning + '40' }]} onPress={() => setChangingPwd(true)} activeOpacity={0.8}>
              <Text style={[s.editBtnText, { color: COLORS.warning }]}>🔒 Change Password</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[s.editBtn, { borderColor: COLORS.primary + '40' }]} onPress={() => setShowSupport(true)} activeOpacity={0.8}>
              <Text style={[s.editBtnText, { color: COLORS.primary }]}>🎧 Support & Contact</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[s.editBtn, { borderColor: COLORS.primary + '40' }]} onPress={() => setShowAbout(true)} activeOpacity={0.8}>
              <Text style={[s.editBtnText, { color: COLORS.primary }]}>ℹ️ About Us</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={s.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={s.version}>Dawn Multipurpose v1.0.0</Text>
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1, padding: 20 },
  title: { color: 'white', fontSize: 24, fontWeight: '800', marginBottom: 24 },
  msgBox: { backgroundColor: 'rgba(34,197,94,0.1)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)', borderRadius: 12, padding: 12, marginBottom: 16 },
  msgText: { color: COLORS.success, fontSize: 14, textAlign: 'center', fontWeight: '600' },
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: 'white', fontSize: 32, fontWeight: '800' },
  name: { color: 'white', fontSize: 20, fontWeight: '700' },
  email: { color: COLORS.textSecondary, fontSize: 14, marginTop: 2 },
  card: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder, borderRadius: 14, overflow: 'hidden', marginBottom: 16, padding: 0 },
  cardTitle: { color: 'white', fontSize: 17, fontWeight: '700', padding: 16, paddingBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  rowLabel: { color: COLORS.textSecondary, fontSize: 14 },
  rowValue: { color: 'white', fontSize: 14, fontWeight: '600' },
  fieldWrap: { paddingHorizontal: 16, marginBottom: 12 },
  fieldLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 6 },
  fieldInput: { backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: COLORS.cardBorder, borderRadius: 10, padding: 14, color: 'white', fontSize: 15 },
  actionBtn: { borderRadius: 10, padding: 14, alignItems: 'center' },
  actionBtnText: { color: 'white', fontSize: 15, fontWeight: '700' },
  editBtn: { borderWidth: 1, borderColor: COLORS.primary + '40', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12 },
  editBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
  logoutBtn: { borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  logoutText: { color: COLORS.danger, fontSize: 16, fontWeight: '700' },
  version: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center', marginTop: 20 },
  eyeBtnProfile: { position: 'absolute', right: 12, top: 12, zIndex: 10 },
});
