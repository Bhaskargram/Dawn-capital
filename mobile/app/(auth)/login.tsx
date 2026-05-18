import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { COLORS, API_URL, IS_TESTING_MODE } from '@/constants/Config';
import axios from 'axios';

export default function LoginScreen() {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'otp'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [kyc, setKyc] = useState({
    panNumber: '',
    aadhaarNumber: '',
    dateOfBirth: '',
    occupation: '',
    annualIncome: '',
    nomineeName: '',
    nomineeRelation: '',
  });
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async () => {
    // OTP verification
    if (mode === 'otp') {
      if (!otp) {
        setError('Please enter OTP');
        return;
      }
      setLoading(true);
      setError('');
      try {
        await axios.post(`${API_URL}/auth/verify-otp`, { email, otp });
        setSuccess('OTP verified! Logging in...');
        await login(email, password);
      } catch (err: any) {
        setError(err.response?.data?.msg || 'Invalid OTP');
      }
      setLoading(false);
      return;
    }

    // Regular login
    if (mode === 'forgot' && !email) {
      setError('Please enter your email address');
      return;
    }
    if (mode === 'login' && (!email || !password)) {
      setError('Please fill in all required fields');
      return;
    }
    if (mode === 'signup' && (!name || !email || !password || !phone || !address || !kyc.panNumber || !kyc.aadhaarNumber || !kyc.dateOfBirth || !kyc.occupation || !kyc.annualIncome)) {
      setError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (mode === 'forgot') {
        const res = await axios.post(`${API_URL}/auth/forgot-password`, { email });
        setSuccess(res.data.msg);
        setLoading(false);
        return;
      }
      if (mode === 'signup') await register(name, email, password, phone, address, kyc);
      else {
        // Login with OTP check
        if (!IS_TESTING_MODE) {
          // Send OTP for production
          await axios.post(`${API_URL}/auth/send-otp`, { email, phone });
          setSuccess('OTP sent to your phone!');
          setMode('otp');
          setLoading(false);
          return;
        } else {
          // Testing mode: skip OTP
          console.log('⚠️ TESTING MODE: OTP verification skipped');
          await login(email, password);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Something went wrong');
    }
    setLoading(false);
  };

  const switchMode = (m: 'login' | 'signup' | 'forgot') => { setMode(m); setError(''); setSuccess(''); setOtp(''); };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={s.logoWrap}>
          <Image source={{ uri: 'https://dawnlogos.s3.amazonaws.com/dawn6.png' }} style={s.logoImg} resizeMode="contain" />
        </View>

        <Text style={s.heading}>{mode === 'signup' ? 'Create Account' : mode === 'otp' ? 'Verify OTP' : mode === 'forgot' ? 'Reset Password' : 'Welcome Back'}</Text>
        <Text style={s.subheading}>{mode === 'signup' ? 'Start your financial journey today' : mode === 'otp' ? 'Enter the code sent to your phone' : mode === 'forgot' ? 'Enter your email to get a reset link' : 'Sign in to your portfolio'}</Text>

        {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View> : null}
        {success ? <View style={s.successBox}><Text style={s.successText}>{success}</Text></View> : null}

        {/* Name */}
        {mode === 'signup' && (
          <View style={s.inputWrap}>
            <Text style={s.inputLabel}>Full Name</Text>
            <TextInput style={s.input} value={name} onChangeText={setName} placeholder="John Doe" placeholderTextColor="#555" autoCapitalize="words" />
          </View>
        )}

        {/* Email */}
        <View style={s.inputWrap}>
          <Text style={s.inputLabel}>Email Address</Text>
          <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor="#555" keyboardType="email-address" autoCapitalize="none" />
        </View>

        {/* Phone */}
        {mode === 'signup' && (
          <View style={s.inputWrap}>
            <Text style={s.inputLabel}>Mobile Number</Text>
            <TextInput style={s.input} value={phone} onChangeText={setPhone} placeholder="+91 9876543210" placeholderTextColor="#555" keyboardType="phone-pad" />
          </View>
        )}

        {mode === 'signup' && (
          <>
            <View style={s.inputWrap}>
              <Text style={s.inputLabel}>Address</Text>
              <TextInput style={[s.input, s.multiline]} value={address} onChangeText={setAddress} placeholder="Current residential address" placeholderTextColor="#555" multiline />
            </View>
            <View style={s.kycBox}>
              <Text style={s.kycTitle}>KYC Details</Text>
              <TextInput style={s.input} value={kyc.panNumber} onChangeText={(v) => setKyc({ ...kyc, panNumber: v.toUpperCase() })} placeholder="PAN Number" placeholderTextColor="#555" autoCapitalize="characters" />
              <TextInput style={s.input} value={kyc.aadhaarNumber} onChangeText={(v) => setKyc({ ...kyc, aadhaarNumber: v })} placeholder="Aadhaar Number" placeholderTextColor="#555" keyboardType="number-pad" />
              <TextInput style={s.input} value={kyc.dateOfBirth} onChangeText={(v) => setKyc({ ...kyc, dateOfBirth: v })} placeholder="Date of Birth (YYYY-MM-DD)" placeholderTextColor="#555" />
              <TextInput style={s.input} value={kyc.occupation} onChangeText={(v) => setKyc({ ...kyc, occupation: v })} placeholder="Occupation" placeholderTextColor="#555" />
              <TextInput style={s.input} value={kyc.annualIncome} onChangeText={(v) => setKyc({ ...kyc, annualIncome: v })} placeholder="Annual Income" placeholderTextColor="#555" keyboardType="number-pad" />
              <TextInput style={s.input} value={kyc.nomineeName} onChangeText={(v) => setKyc({ ...kyc, nomineeName: v })} placeholder="Nominee Name" placeholderTextColor="#555" />
              <TextInput style={s.input} value={kyc.nomineeRelation} onChangeText={(v) => setKyc({ ...kyc, nomineeRelation: v })} placeholder="Nominee Relation" placeholderTextColor="#555" />
            </View>
          </>
        )}

        {/* Password */}
        {mode !== 'forgot' && mode !== 'otp' && (
          <View style={s.inputWrap}>
            <Text style={s.inputLabel}>Password</Text>
            <View style={{ position: 'relative' }}>
              <TextInput style={[s.input, { paddingRight: 50 }]} value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor="#555" secureTextEntry={!showPassword} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
                <Text style={{ color: '#888', fontSize: 14 }}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* OTP Input */}
        {mode === 'otp' && (
          <View style={s.inputWrap}>
            <Text style={s.inputLabel}>Enter OTP</Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginBottom: 8 }}>Sent to {email}</Text>
            <TextInput 
              style={s.input} 
              value={otp} 
              onChangeText={setOtp} 
              placeholder="000000" 
              placeholderTextColor="#555" 
              keyboardType="number-pad"
              maxLength={6}
            />
            {IS_TESTING_MODE && (
              <Text style={{ color: COLORS.warning, fontSize: 12, marginTop: 8, fontWeight: '600' }}>
                🧪 Testing Mode: OTP check bypassed on login
              </Text>
            )}
          </View>
        )}

        {/* Forgot Link */}
        {mode === 'login' && (
          <TouchableOpacity onPress={() => switchMode('forgot')} style={{ alignSelf: 'flex-end', marginBottom: 8 }}>
            <Text style={{ color: COLORS.primary, fontSize: 13, fontWeight: '600' }}>Forgot Password?</Text>
          </TouchableOpacity>
        )}

        {/* Submit */}
        <TouchableOpacity style={s.btn} onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={s.btnText}>{mode === 'otp' ? 'Verify & Login' : mode === 'forgot' ? 'Send Reset Link' : mode === 'signup' ? 'Create Account' : 'Sign In'}</Text>}
        </TouchableOpacity>

        {/* Toggle */}
        <View style={s.toggleRow}>
          {mode === 'login' && <>
            <Text style={s.toggleText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => switchMode('signup')}><Text style={s.toggleLink}>Sign Up</Text></TouchableOpacity>
          </>}
          {mode === 'signup' && <>
            <Text style={s.toggleText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => switchMode('login')}><Text style={s.toggleLink}>Sign In</Text></TouchableOpacity>
          </>}
          {mode === 'forgot' && (
            <TouchableOpacity onPress={() => switchMode('login')}><Text style={s.toggleLink}>← Back to Sign In</Text></TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  logoWrap: { alignItems: 'center', marginBottom: 40 },
  logoImg: { width: 80, height: 80 },
  heading: { color: 'white', fontSize: 28, fontWeight: '800', marginBottom: 6, textAlign: 'center' },
  subheading: { color: COLORS.textSecondary, fontSize: 15, textAlign: 'center', marginBottom: 32 },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', borderRadius: 12, padding: 12, marginBottom: 16 },
  errorText: { color: COLORS.danger, fontSize: 14, textAlign: 'center' },
  successBox: { backgroundColor: 'rgba(34,197,94,0.1)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)', borderRadius: 12, padding: 12, marginBottom: 16 },
  successText: { color: COLORS.success, fontSize: 14, textAlign: 'center' },
  inputWrap: { marginBottom: 18 },
  inputLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder, borderRadius: 12, padding: 16, color: 'white', fontSize: 16 },
  multiline: { minHeight: 82, textAlignVertical: 'top' },
  kycBox: { gap: 12, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: COLORS.cardBorder, borderRadius: 16, padding: 14, marginBottom: 18 },
  kycTitle: { color: 'white', fontSize: 15, fontWeight: '800', marginBottom: 2 },
  eyeBtn: { position: 'absolute', right: 16, top: 16 },
  btn: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8, marginBottom: 20 },
  btnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  toggleRow: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  toggleText: { color: COLORS.textSecondary, fontSize: 14 },
  toggleLink: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
});
