import { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://api.dawncapital.online/api';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/reset-password/${token}`, { password });
      setSuccess(res.data.msg || 'Password reset successfully');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.msg || 'Something went wrong. The link might be expired.');
    }
    setLoading(false);
  };

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
          Reset your<br />password.
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', maxWidth: '400px', lineHeight: '1.7', marginBottom: '40px' }}>
          Enter your new password below to regain access to your account. Make sure it's strong and secure.
        </p>
      </div>

      {/* Right form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', position: 'relative', zIndex: 10 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: '450px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'white', marginBottom: '8px' }}>Create New Password</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}>Secure your account with a new password</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {error && (
              <div style={{ padding: '12px 16px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '12px', color: '#f87171', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ padding: '12px 16px', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: '12px', color: '#4ade80', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {success}
              </div>
            )}

            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }}>
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px 48px', color: 'white', fontSize: '1rem', outline: 'none', transition: 'all 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#C21B2F'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }}>
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px 48px', color: 'white', fontSize: '1rem', outline: 'none', transition: 'all 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#C21B2F'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', background: 'linear-gradient(to right, #C21B2F, #a31525)', color: 'white', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '10px', boxShadow: '0 10px 25px -5px rgba(194,27,47,0.4)' }}
            >
              {loading ? 'Resetting...' : 'Reset Password'} <ArrowRight size={20} />
            </button>
          </form>

          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <Link to="/login" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'white'} onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}>
              Return to Login
            </Link>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .login-wrapper { flex-direction: column; }
          .login-wrapper > div:first-child { padding: 40px 20px 20px; flex: 0 0 auto; align-items: center; text-align: center; }
          .login-wrapper > div:first-child h1 { font-size: 2.2rem; }
          .login-wrapper > div:last-child { padding: 20px; flex: 1 0 auto; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}
