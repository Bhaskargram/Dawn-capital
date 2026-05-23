import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building, Lock, Mail, ArrowRight, User, Phone, Eye, EyeOff, BookOpen } from 'lucide-react';
import MaintenanceScreen from '../components/MaintenanceScreen';

const API = import.meta.env.VITE_API_URL || 'https://api.dawncapital.online/api';

export default function Login() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'login'); // login | signup | forgot
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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [maintenance, setMaintenance] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Also check on load just in case
    axios.get(`${API}/config`).catch(err => {
      if (err.response?.status === 503 && err.response?.data?.maintenance) {
        setMaintenance(err.response.data.config);
      }
    });
  }, [API]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (mode === 'forgot') {
        const res = await axios.post(`${API}/auth/forgot-password`, { email });
        setSuccess(res.data.msg);
        setLoading(false);
        return;
      }
      const url = mode === 'signup' ? `${API}/auth/register` : `${API}/auth/login`;
      const body = mode === 'signup' ? { name, email, password, phone, address, kyc } : { email, password };
      const res = await axios.post(url, body);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userRole', res.data.user.role);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/customer');
    } catch (err) {
      if (err.response?.status === 503 && err.response?.data?.maintenance) {
        setMaintenance(err.response.data.maintenance);
      } else {
        setError(err.response?.data?.msg || 'Something went wrong. Please try again.');
      }
    }
    setLoading(false);
  };

  const titles = { login: 'Sign In', signup: 'Create Account', forgot: 'Reset Password' };
  const subtitles = { login: 'Enter your credentials to continue', signup: 'Fill in your details to get started', forgot: 'Enter your email to receive a reset link' };

  if (maintenance) {
    // Requires MaintenanceScreen
    return <MaintenanceScreen config={maintenance} />;
  }

  return (
    <div className="login-wrapper" style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #0a0a14 0%, #1a1028 50%, #0f1829 100%)', position: 'relative', overflow: 'hidden' }}>
      <div className="bg-gradient-decoration" style={{ position: 'absolute', top: '-150px', right: '-50px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(194,27,47,0.1), transparent 70%)', filter: 'blur(60px)' }} />
      <div className="bg-gradient-decoration" style={{ position: 'absolute', bottom: '-150px', left: '-50px', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.06), transparent 70%)', filter: 'blur(60px)' }} />

      {/* Left branding */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', position: 'relative', zIndex: 10 }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', marginBottom: '50px' }}>
          <img src="https://dawnlogos.s3.amazonaws.com/dawn6.png" alt="Dawn Capital" style={{ height: '55px', width: 'auto', objectFit: 'contain' }} />
        </Link>
        <h1 style={{ fontSize: '3rem', fontWeight: '900', color: 'white', lineHeight: '1.1', marginBottom: '20px', letterSpacing: '-0.03em' }}>
          {mode === 'signup' ? 'Start your\nfinancial journey.' : mode === 'forgot' ? 'Forgot your\npassword?' : 'Welcome back to\nyour financial hub.'}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', maxWidth: '400px', lineHeight: '1.7', marginBottom: '40px' }}>
          {mode === 'signup' ? 'Create an account to access investments, loans, and portfolio tracking tools.' : mode === 'forgot' ? "No worries! Enter your registered email and we'll send you a reset link." : 'Securely access your portfolio, investments, and financial tools — all in one place.'}
        </p>
        
        {/* How to use link */}
        <Link to="/how-to-use" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', textDecoration: 'none', fontWeight: '600', width: 'fit-content', padding: '12px 20px', background: 'rgba(56,189,248,0.1)', borderRadius: '30px', border: '1px solid rgba(56,189,248,0.2)' }}>
          <BookOpen size={18} /> How to Use Dawn Capital
        </Link>
      </div>

      {/* Right form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
        <motion.div key={mode} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ width: mode === 'signup' ? '560px' : '420px', maxWidth: '92vw', maxHeight: '92vh', overflowY: 'auto', padding: '48px', background: 'rgba(20,20,40,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', backdropFilter: 'blur(16px)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px', color: 'white' }}>{titles[mode]}</h2>
          <p style={{ color: '#8a8aa0', marginBottom: '30px', fontSize: '0.95rem' }}>{subtitles[mode]}</p>

          {error && <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#f87171', marginBottom: '20px', fontSize: '0.9rem' }}>{error}</div>}
          {success && <div style={{ padding: '12px 16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', color: '#22c55e', marginBottom: '20px', fontSize: '0.9rem' }}>{success}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {mode === 'signup' && (<>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#8a8aa0', fontSize: '0.85rem', fontWeight: '600' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8a8aa0' }} />
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="form-input" style={{ paddingLeft: '44px' }} placeholder="John Doe" required />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#8a8aa0', fontSize: '0.85rem', fontWeight: '600' }}>Mobile Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8a8aa0' }} />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="form-input" style={{ paddingLeft: '44px' }} placeholder="+91 9876543210" required />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#8a8aa0', fontSize: '0.85rem', fontWeight: '600' }}>Address</label>
                <textarea value={address} onChange={e => setAddress(e.target.value)} className="form-input" placeholder="Current residential address" required style={{ minHeight: '76px' }} />
              </div>
              <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ color: 'white', fontWeight: '800', marginBottom: '12px' }}>KYC Details</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="login-kyc-grid">
                  <input className="form-input" placeholder="PAN Number" value={kyc.panNumber} onChange={e => setKyc({...kyc, panNumber: e.target.value.toUpperCase()})} required />
                  <input className="form-input" placeholder="Aadhaar Number" value={kyc.aadhaarNumber} onChange={e => setKyc({...kyc, aadhaarNumber: e.target.value})} required />
                  <input className="form-input" type="date" value={kyc.dateOfBirth} onChange={e => setKyc({...kyc, dateOfBirth: e.target.value})} required />
                  <input className="form-input" placeholder="Occupation" value={kyc.occupation} onChange={e => setKyc({...kyc, occupation: e.target.value})} required />
                  <input className="form-input" type="number" placeholder="Annual Income" value={kyc.annualIncome} onChange={e => setKyc({...kyc, annualIncome: e.target.value})} required />
                  <input className="form-input" placeholder="Nominee Name" value={kyc.nomineeName} onChange={e => setKyc({...kyc, nomineeName: e.target.value})} />
                  <input className="form-input" placeholder="Nominee Relation" value={kyc.nomineeRelation} onChange={e => setKyc({...kyc, nomineeRelation: e.target.value})} />
                </div>
                <p style={{ color: '#8a8aa0', fontSize: '0.78rem', lineHeight: 1.5, margin: '12px 0 0' }}>
                  Document URLs can be added from your customer profile and verified by admin.
                </p>
              </div>
            </>)}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#8a8aa0', fontSize: '0.85rem', fontWeight: '600' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8a8aa0' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-input" style={{ paddingLeft: '44px' }} placeholder="you@example.com" required />
              </div>
            </div>
            {mode !== 'forgot' && (
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#8a8aa0', fontSize: '0.85rem', fontWeight: '600' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8a8aa0' }} />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="form-input" style={{ paddingLeft: '44px', paddingRight: '44px' }} placeholder="••••••••" required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8a8aa0', padding: 0 }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <button type="button" onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }} style={{ background: 'none', border: 'none', color: '#C21B2F', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', textAlign: 'right', padding: 0 }}>
                Forgot Password?
              </button>
            )}

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px' }}>
              {loading ? 'Please wait...' : <><span>{mode === 'forgot' ? 'Send Reset Link' : titles[mode]}</span> <ArrowRight size={18} /></>}
            </button>
          </form>

          <div style={{ marginTop: 22, display: 'grid', gap: 12 }}>
            <div style={{ textAlign: 'center', marginTop: '24px', color: '#8a8aa0', fontSize: '0.9rem' }}>
              {mode === 'login' && <>Don't have an account? <button onClick={() => { setMode('signup'); setError(''); setSuccess(''); }} style={{ background: 'none', border: 'none', color: '#C21B2F', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' }}>Sign Up</button></>}
              {mode === 'signup' && <>Already have an account? <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }} style={{ background: 'none', border: 'none', color: '#C21B2F', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' }}>Sign In</button></>}
              {mode === 'forgot' && <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }} style={{ background: 'none', border: 'none', color: '#C21B2F', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' }}>← Back to Sign In</button>}
            </div>
          </div>
        </motion.div>
      </div>
      <style>{`
        @media (max-width: 720px) {
          .login-wrapper {
            flex-direction: column;
            overflow-y: auto !important;
          }
          .login-wrapper > div:first-of-type {
            padding: 32px 24px !important;
          }
          .login-wrapper > div:nth-of-type(2) {
            padding: 24px !important;
          }
          .login-wrapper form {
            max-height: none;
          }
          .login-kyc-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
