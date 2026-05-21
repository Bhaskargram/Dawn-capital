import React, { useState, useEffect, memo, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, Briefcase, FileText, Activity, Bell, Gift, 
  ShieldCheck, LogOut, User, Menu, X, Settings, 
  CreditCard, TrendingUp, Clock, ChevronRight, PieChart,
  ArrowUpRight, AlertCircle, CheckCircle, Info, HelpCircle, BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CreditScoreMeter from '../components/CreditScoreMeter';
import AnnouncementMarquee from '../components/AnnouncementMarquee';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : `http://${window.location.hostname}:5000/api`);
const pc = '#C21B2F';
const formatINR = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

// ══════════ REUSABLE COMPONENTS ══════════

const GlassCard = memo(({ children, style, className }) => (
  <div className={`glass-card ${className}`} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '24px', borderRadius: '16px', ...style }}>
    {children}
  </div>
));

const FormField = memo(({ label, children }) => (
  <div style={{ marginBottom: '18px' }}>
    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '700', color: '#8a8aa0' }}>{label}</label>
    {children}
  </div>
));

// ══════════ TAB COMPONENTS ══════════

const DashboardTab = memo(({ user, portfolio, score, scoreColor, scoreLabel, notifications }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '6px' }}>Dashboard</h1>
        <p style={{ color: '#8a8aa0' }}>Overview of your financial standing at Dawn Capital.</p>
      </div>
      
      <CreditScoreMeter score={score} lastUpdated={user?.updatedAt} />
      
      <div style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ color: '#8a8aa0', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>KYC Status</div>
        <div style={{ fontSize: '1.1rem', fontWeight: '900', color: user?.kycStatus === 'approved' ? '#22c55e' : user?.kycStatus === 'rejected' ? '#ef4444' : '#fbbf24', marginTop: '6px', textTransform: 'capitalize' }}>
          {user?.kycStatus || 'pending'}
        </div>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
      {[
        { label: 'Total Portfolio', value: portfolio?.summary?.netWorth || 0, icon: <PieChart size={20} />, color: '#fff' },
        { label: 'Active Investments', value: portfolio?.summary?.totalInvestments || 0, icon: <TrendingUp size={20} />, color: '#22c55e' },
        { label: 'Total Outstanding', value: portfolio?.summary?.totalLoans || 0, icon: <Activity size={20} />, color: '#ef4444' },
      ].map((stat, i) => (
        <GlassCard key={i}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#8a8aa0', fontSize: '0.85rem', marginBottom: '12px', fontWeight: '700' }}>
            <div style={{ color: stat.color }}>{stat.icon}</div> {stat.label}
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '900', color: stat.color }}>{formatINR(stat.value)}</div>
        </GlassCard>
      ))}
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '30px' }} className="stack-on-mobile">
      <GlassCard title="Quick Portfolio">
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Briefcase size={18} color={pc} /> Active Products</h3>
        {(portfolio?.investments?.length > 0 || portfolio?.loans?.length > 0) ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>Product</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {portfolio.investments.map(inv => (
                  <tr key={inv._id}>
                    <td><div style={{ fontWeight: '700' }}>{inv.type}</div><div style={{ fontSize: '0.75rem', color: '#555' }}>Fixed Return</div></td>
                    <td style={{ color: '#22c55e', fontWeight: '700' }}>+{formatINR(inv.amount)}</td>
                    <td><span className="badge badge-approved">Active</span></td>
                  </tr>
                ))}
                {portfolio.loans.map(loan => (
                  <tr key={loan._id}>
                    <td><div style={{ fontWeight: '700' }}>Loan</div><div style={{ fontSize: '0.75rem', color: '#555' }}>{loan.loanId || loan._id.slice(-6)}</div></td>
                    <td style={{ color: '#ef4444', fontWeight: '700' }}>{formatINR(loan.amount)}</td>
                    <td><span className={`badge badge-${loan.status === 'approved' || loan.status === 'active' ? 'approved' : 'pending'}`}>{loan.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#555' }}>No active assets. Apply for a loan to get started!</div>
        )}
      </GlassCard>

      <GlassCard>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Bell size={18} color="#fbbf24" /> Recent Notifications</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.length > 0 ? notifications.slice(0, 5).map(n => (
            <div key={n._id} style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', borderLeft: `3px solid ${pc}` }}>
              <div style={{ fontWeight: '800', fontSize: '0.9rem', marginBottom: '4px' }}>{n.title}</div>
              <div style={{ fontSize: '0.85rem', color: '#8a8aa0', lineHeight: '1.4' }}>{n.message}</div>
            </div>
          )) : <div style={{ textAlign: 'center', color: '#555', padding: '20px' }}>No new updates.</div>}
        </div>
      </GlassCard>
    </div>
  </motion.div>
));

const NotificationsTab = memo(({ notifications }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '30px' }}>Notifications</h1>
    <div style={{ display: 'grid', gap: '20px' }}>
      {notifications.length > 0 ? notifications.map(notification => (
        <GlassCard key={notification._id} style={{ borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
            <div>
              <div style={{ fontWeight: '900', fontSize: '1rem' }}>{notification.title}</div>
              <div style={{ color: '#8a8aa0', fontSize: '0.9rem', marginTop: '4px' }}>{new Date(notification.createdAt).toLocaleString()}</div>
            </div>
            <span className={`badge badge-${notification.type === 'announcement' ? 'approved' : notification.type.includes('rejected') ? 'pending' : 'approved'}`} style={{ alignSelf: 'flex-start' }}>{notification.type.replace('_', ' ')}</span>
          </div>
          <p style={{ color: '#cbd5e1', marginTop: '14px', lineHeight: '1.6' }}>{notification.message}</p>
        </GlassCard>
      )) : (
        <GlassCard>
          <p style={{ color: '#8a8aa0' }}>No notifications yet. Important updates will appear here.</p>
        </GlassCard>
      )}
    </div>
  </motion.div>
));

const PortfolioTab = memo(({ portfolio }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '30px' }}>My Portfolio</h1>
    
    <div style={{ marginBottom: '40px' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px', color: '#22c55e' }}>Investments (FD/RD)</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {portfolio?.investments?.length > 0 ? portfolio.investments.map(inv => (
          <GlassCard key={inv._id} style={{ borderLeft: '4px solid #22c55e' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>{inv.type} Deposit</span>
              <span className="badge badge-approved">ACTIVE</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '15px' }}>{formatINR(inv.amount)}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div><div style={{ fontSize: '0.7rem', color: '#8a8aa0', textTransform: 'uppercase' }}>Interest Rate</div><div style={{ fontWeight: '700' }}>{inv.interestRate}% APY</div></div>
              <div><div style={{ fontSize: '0.7rem', color: '#8a8aa0', textTransform: 'uppercase' }}>Maturity</div><div style={{ fontWeight: '700' }}>{new Date(inv.maturityDate).toLocaleDateString()}</div></div>
            </div>
          </GlassCard>
        )) : <p style={{ color: '#555' }}>No active investments found.</p>}
      </div>
    </div>

    <div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px', color: pc }}>Active Loans</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {portfolio?.loans?.length > 0 ? portfolio.loans.map(loan => (
          <GlassCard key={loan._id} style={{ borderLeft: `4px solid ${loan.status === 'approved' ? '#22c55e' : pc}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>{loan.purpose || 'Personal Loan'}</span>
              <span className={`badge badge-${loan.status === 'approved' || loan.status === 'active' ? 'approved' : 'pending'}`}>{loan.status?.toUpperCase()}</span>
            </div>
            <div style={{ color: '#8a8aa0', fontSize: '0.8rem', fontWeight: '800', marginBottom: '10px' }}>Loan ID: {loan.loanId || loan._id}</div>
            <div style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '15px' }}>{formatINR(loan.amount)}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div><div style={{ fontSize: '0.7rem', color: '#8a8aa0', textTransform: 'uppercase' }}>EMI</div><div style={{ fontWeight: '700' }}>{loan.emiAmount != null ? formatINR(loan.emiAmount) : '—'}</div></div>
              <div><div style={{ fontSize: '0.7rem', color: '#8a8aa0', textTransform: 'uppercase' }}>Rate</div><div style={{ fontWeight: '700' }}>{loan.interestRate || '—'}%</div></div>
              <div><div style={{ fontSize: '0.7rem', color: '#8a8aa0', textTransform: 'uppercase' }}>Term</div><div style={{ fontWeight: '700' }}>{loan.durationMonths}mo</div></div>
            </div>
          </GlassCard>
        )) : <p style={{ color: '#555' }}>No loan applications found.</p>}
      </div>
    </div>
  </motion.div>
));

const ApplyTab = memo(({ loanForm, setLoanForm, handleApplyLoan }) => (
  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} style={{ maxWidth: '600px', margin: '0 auto' }}>
     <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '10px' }}>Loan Application</h1>
     <p style={{ color: '#8a8aa0', marginBottom: '30px' }}>Submit your details for a quick institutional credit review.</p>
     <GlassCard>
       <form onSubmit={handleApplyLoan}>
         <FormField label="Requested Amount (₹)"><input type="number" className="admin-input" value={loanForm.amount} onChange={e => setLoanForm({...loanForm, amount: e.target.value})} required /></FormField>
         <FormField label="Loan Purpose">
           <select className="admin-input" value={loanForm.purpose} onChange={e => setLoanForm({...loanForm, purpose: e.target.value})} required>
             <option value="">Select Purpose...</option>
             <option value="Personal">Personal / Medical</option>
             <option value="Business">Business Expansion</option>
             <option value="Education">Higher Education</option>
             <option value="Home">Home Renovation</option>
           </select>
         </FormField>
         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <FormField label="Term (Months)"><input type="number" className="admin-input" value={loanForm.durationMonths} onChange={e => setLoanForm({...loanForm, durationMonths: e.target.value})} required /></FormField>
            <FormField label="Monthly Income (₹)"><input type="number" className="admin-input" value={loanForm.monthlyIncome} onChange={e => setLoanForm({...loanForm, monthlyIncome: e.target.value})} required /></FormField>
         </div>
         <button type="submit" className="action-btn-primary" style={{ width: '100%', padding: '16px', marginTop: '10px', fontSize: '1rem' }}>Submit Loan Request</button>
       </form>
     </GlassCard>
  </motion.div>
));

const KYCTab = memo(({ user, kycForm, setKycForm, handleUpdateKyc }) => {
  const [photoMode, setPhotoMode] = useState(false);
  const [videoMode, setVideoMode] = useState(false);
  const [stream, setStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recording, setRecording] = useState(false);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  const startCamera = async (type) => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: type === 'video' });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
      if (type === 'photo') setPhotoMode(true);
      else setVideoMode(true);
    } catch (err) {
      alert('Camera access denied or unavailable.');
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    setStream(null);
    setPhotoMode(false);
    setVideoMode(false);
    setRecording(false);
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setKycForm({ ...kycForm, livePhotoUrl: dataUrl });
    stopCamera();
  };

  const startRecording = () => {
    const recorder = new MediaRecorder(stream);
    const chunks = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        setKycForm({ ...kycForm, liveVideoUrl: reader.result });
      };
    };
    recorder.start();
    setMediaRecorder(recorder);
    setRecording(true);
    setTimeout(() => {
      if (recorder.state === 'recording') stopRecording(recorder);
    }, 5000); // 5 sec max
  };

  const stopRecording = (recorder = mediaRecorder) => {
    if (recorder) recorder.stop();
    stopCamera();
  };

  return (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '850px', margin: '0 auto' }}>
    <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '10px' }}>KYC Verification</h1>
    <p style={{ color: '#8a8aa0', marginBottom: '24px' }}>Keep your PAN, Aadhaar, income, nominee, and document links ready for admin verification.</p>
    <GlassCard style={{ marginBottom: '24px', borderLeft: `4px solid ${user?.kycStatus === 'approved' ? '#22c55e' : user?.kycStatus === 'rejected' ? '#ef4444' : '#fbbf24'}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '18px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <div style={{ color: '#8a8aa0', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Current Review Status</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '900', textTransform: 'capitalize', marginTop: '4px' }}>{user?.kycStatus || 'pending'}</div>
        </div>
        {user?.kyc?.rejectionReason && (
          <div style={{ color: '#f87171', fontWeight: '700', maxWidth: '420px' }}>Reason: {user.kyc.rejectionReason}</div>
        )}
      </div>
    </GlassCard>
    <GlassCard>
      <form onSubmit={handleUpdateKyc}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }} className="stack-on-mobile">
          <FormField label="PAN Number"><input className="admin-input" value={kycForm.panNumber} onChange={e => setKycForm({...kycForm, panNumber: e.target.value.toUpperCase()})} required /></FormField>
          <FormField label="Aadhaar Number"><input className="admin-input" value={kycForm.aadhaarNumber} onChange={e => setKycForm({...kycForm, aadhaarNumber: e.target.value})} required /></FormField>
          <FormField label="Date of Birth"><input className="admin-input" type="date" value={kycForm.dateOfBirth} onChange={e => setKycForm({...kycForm, dateOfBirth: e.target.value})} required /></FormField>
          <FormField label="Occupation"><input className="admin-input" value={kycForm.occupation} onChange={e => setKycForm({...kycForm, occupation: e.target.value})} required /></FormField>
          <FormField label="Annual Income"><input className="admin-input" type="number" value={kycForm.annualIncome} onChange={e => setKycForm({...kycForm, annualIncome: e.target.value})} required /></FormField>
          <FormField label="Nominee Name"><input className="admin-input" value={kycForm.nomineeName} onChange={e => setKycForm({...kycForm, nomineeName: e.target.value})} /></FormField>
          <FormField label="Nominee Relation"><input className="admin-input" value={kycForm.nomineeRelation} onChange={e => setKycForm({...kycForm, nomineeRelation: e.target.value})} /></FormField>
          <FormField label="PAN Document (Upload or Camera)"><input className="admin-input" type="file" accept="image/*,application/pdf" capture="environment" onChange={e => {
            const file = e.target.files[0];
            if(file){ const reader = new FileReader(); reader.onloadend = () => setKycForm({...kycForm, panDocumentUrl: reader.result}); reader.readAsDataURL(file); }
          }} required={!kycForm.panDocumentUrl} /></FormField>
          <FormField label="Aadhaar Document (Upload or Camera)"><input className="admin-input" type="file" accept="image/*,application/pdf" capture="environment" onChange={e => {
            const file = e.target.files[0];
            if(file){ const reader = new FileReader(); reader.onloadend = () => setKycForm({...kycForm, aadhaarDocumentUrl: reader.result}); reader.readAsDataURL(file); }
          }} required={!kycForm.aadhaarDocumentUrl} /></FormField>
          <FormField label="Address Proof (Upload or Camera)"><input className="admin-input" type="file" accept="image/*,application/pdf" capture="environment" onChange={e => {
            const file = e.target.files[0];
            if(file){ const reader = new FileReader(); reader.onloadend = () => setKycForm({...kycForm, addressProofUrl: reader.result}); reader.readAsDataURL(file); }
          }} required={!kycForm.addressProofUrl} /></FormField>
          
          <FormField label="Live Photo Capture (Selfie)">
            {kycForm.livePhotoUrl ? <div style={{ color: '#22c55e', fontWeight: 'bold' }}>✓ Photo Captured</div> : (
              <input className="admin-input" type="file" accept="image/*" capture="user" onChange={e => {
                const file = e.target.files[0];
                if(file){ const reader = new FileReader(); reader.onloadend = () => setKycForm({...kycForm, livePhotoUrl: reader.result}); reader.readAsDataURL(file); }
              }} required />
            )}
          </FormField>
          <FormField label="Live Video Capture (Optional)">
            {kycForm.liveVideoUrl ? <div style={{ color: '#22c55e', fontWeight: 'bold' }}>✓ Video Captured</div> : (
              <input className="admin-input" type="file" accept="video/*" capture="user" onChange={e => {
                const file = e.target.files[0];
                if(file){ const reader = new FileReader(); reader.onloadend = () => setKycForm({...kycForm, liveVideoUrl: reader.result}); reader.readAsDataURL(file); }
              }} />
            )}
          </FormField>
        </div>

        {(photoMode || videoMode) && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <video ref={videoRef} autoPlay playsInline muted style={{ maxWidth: '90%', maxHeight: '70vh', borderRadius: '12px', background: 'black' }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
              {photoMode && <button type="button" onClick={capturePhoto} className="action-btn-primary" style={{ background: '#22c55e' }}>Capture Photo</button>}
              {videoMode && !recording && <button type="button" onClick={startRecording} className="action-btn-primary" style={{ background: '#ef4444' }}>Record (5s)</button>}
              {videoMode && recording && <button type="button" onClick={() => stopRecording()} className="action-btn-primary" style={{ background: '#22c55e' }}>Stop Recording</button>}
              <button type="button" onClick={stopCamera} className="action-btn-primary" style={{ background: '#555' }}>Cancel</button>
            </div>
          </div>
        )}

        <button type="submit" className="action-btn-primary" style={{ marginTop: '24px', width: '100%' }}>Submit KYC for Review</button>
      </form>
    </GlassCard>
  </motion.div>
  );
});

const ProfileTab = memo(({ user, profileForm, setProfileForm, handleUpdateProfile, passwordForm, setPasswordForm, handleUpdatePassword }) => (
  <div style={{ maxWidth: '700px', margin: '0 auto' }}>
    <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '30px' }}>Account Settings</h1>
    
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <GlassCard>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px' }}>Personal Information</h3>
        <form onSubmit={handleUpdateProfile}>
          <FormField label="Full Name"><input className="admin-input" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} /></FormField>
          <FormField label="Phone Number"><input className="admin-input" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} /></FormField>
          <FormField label="Home Address"><textarea className="admin-input" value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} style={{ minHeight: '80px' }} /></FormField>
          <button type="submit" className="action-btn-primary">Update Profile</button>
        </form>
      </GlassCard>

      <GlassCard>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px' }}>Security & Password</h3>
        <form onSubmit={handleUpdatePassword}>
          <FormField label="Current Password"><input className="admin-input" type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} /></FormField>
          <FormField label="New Password"><input className="admin-input" type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} /></FormField>
          <button type="submit" className="action-btn-primary">Change Password</button>
        </form>
      </GlassCard>
    </div>
  </div>
));

const SupportTab = memo(() => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '800px', margin: '0 auto' }}>
    <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '10px' }}>Support & Contact</h1>
    <p style={{ color: '#8a8aa0', marginBottom: '24px' }}>We are here to help you. Reach out to our support team.</p>
    
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="stack-on-mobile">
      <GlassCard>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${pc}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Info color={pc} size={24} />
            </div>
            <div>
              <div style={{ color: '#8a8aa0', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Email Support</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>support@dawncapital.online</div>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#3b82f620', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <HelpCircle color="#3b82f6" size={24} />
            </div>
            <div>
              <div style={{ color: '#8a8aa0', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Phone Support</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>+91 9862519900</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>+91 9233777509</div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  </motion.div>
));

const AboutUsTab = memo(() => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '800px', margin: '0 auto' }}>
    <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '10px' }}>About Dawn Capital</h1>
    <GlassCard>
      <div style={{ lineHeight: '1.8', color: '#e2e8f0', fontSize: '1.05rem' }}>
        <p style={{ marginBottom: '15px' }}>Dawn Capital is a leading financial services firm dedicated to empowering individuals and businesses with robust investment opportunities and accessible credit solutions.</p>
        <p style={{ marginBottom: '15px' }}>With a commitment to transparency, rapid processing, and personalized financial planning, we strive to build long-lasting relationships with our clients worldwide.</p>
        <p>Our core values are integrity, innovation, and client-centricity. Whether you're applying for a personal loan, business capital, or growing your wealth through our investment portfolios, Dawn Capital is your trusted partner.</p>
      </div>
    </GlassCard>
  </motion.div>
));

const CreditScoreTab = memo(({ user }) => {
  const score = user?.creditScore || 0;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '30px' }}>Credit Score</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="stack-on-mobile">
        <div style={{ gridColumn: '1 / -1' }}>
          <CreditScoreMeter score={score} lastUpdated={user?.updatedAt} />
        </div>
        
        <GlassCard>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#8a8aa0', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Score Range</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: score >= 750 ? '#22c55e' : score >= 600 ? '#fbbf24' : score > 0 ? '#ef4444' : '#64748b' }}>
              {score > 0 ? `${score} / 850` : '\u2014'}
            </div>
          </div>
        </GlassCard>
        
        <GlassCard>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#8a8aa0', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Rating</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: score >= 750 ? '#22c55e' : score >= 650 ? '#3b82f6' : score >= 600 ? '#fbbf24' : score > 0 ? '#ef4444' : '#64748b' }}>
              {score >= 750 ? 'Excellent' : score >= 650 ? 'Good' : score >= 600 ? 'Fair' : score > 0 ? 'Needs Improvement' : 'N/A'}
            </div>
          </div>
        </GlassCard>
      </div>

      {score === 0 && (
        <GlassCard style={{ marginTop: '24px', textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>📊</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '12px', color: '#fff' }}>Score Not Available Yet</h3>
          <p style={{ color: '#8a8aa0', lineHeight: '1.7', maxWidth: '400px', margin: '0 auto' }}>
            Your credit score will be updated soon. We will notify you via email and push notification once your score is available.
          </p>
        </GlassCard>
      )}

      <GlassCard style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '16px', color: '#fff' }}>📋 Score Breakdown</h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          {[
            { range: '750-850', label: 'Excellent', color: '#22c55e', desc: 'Best rates, instant approval', min: 750 },
            { range: '650-749', label: 'Good', color: '#3b82f6', desc: 'Competitive rates available', min: 650 },
            { range: '600-649', label: 'Fair', color: '#fbbf24', desc: 'Some limitations may apply', min: 600 },
            { range: '300-599', label: 'Poor', color: '#ef4444', desc: 'Limited options, work to improve', min: 300 },
          ].map(tier => (
            <div key={tier.range} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', background: score >= tier.min && score > 0 ? `${tier.color}10` : 'transparent', borderRadius: '10px', border: `1px solid ${score >= tier.min && score > 0 ? tier.color + '30' : 'rgba(255,255,255,0.03)'}` }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: tier.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{tier.range} — {tier.label}</div>
                <div style={{ color: '#8a8aa0', fontSize: '0.75rem' }}>{tier.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
});


// ══════════ MAIN PORTAL COMPONENT ══════════

export default function CustomerPortal() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [config, setConfig] = useState(null);
  
  // Form States
  const [loanForm, setLoanForm] = useState({ amount: '', durationMonths: '12', purpose: '', monthlyIncome: '' });
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', address: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [kycForm, setKycForm] = useState({
    panNumber: '',
    aadhaarNumber: '',
    dateOfBirth: '',
    occupation: '',
    annualIncome: '',
    nomineeName: '',
    nomineeRelation: '',
    panDocumentUrl: '',
    aadhaarDocumentUrl: '',
    addressProofUrl: '',
    livePhotoUrl: '',
    liveVideoUrl: '',
  });

  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    const headers = { 'x-auth-token': token };
    try {
      const [uRes, pRes, nRes, cRes] = await Promise.all([
        axios.get(`${API}/me`, { headers }),
        axios.get(`${API}/portfolio`, { headers }),
        axios.get(`${API}/me/notifications`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API}/config`).catch(() => ({ data: {} }))
      ]);
      setUser(uRes.data);
      setPortfolio(pRes.data);
      setConfig(cRes.data);
      setProfileForm({ name: uRes.data.name, phone: uRes.data.phone || '', address: uRes.data.address || '' });
      setKycForm({
        panNumber: uRes.data.kyc?.panNumber || '',
        aadhaarNumber: uRes.data.kyc?.aadhaarNumber || '',
        dateOfBirth: uRes.data.kyc?.dateOfBirth || '',
        occupation: uRes.data.kyc?.occupation || '',
        annualIncome: uRes.data.kyc?.annualIncome || '',
        nomineeName: uRes.data.kyc?.nomineeName || '',
        nomineeRelation: uRes.data.kyc?.nomineeRelation || '',
        panDocumentUrl: uRes.data.kyc?.panDocumentUrl || '',
        aadhaarDocumentUrl: uRes.data.kyc?.aadhaarDocumentUrl || '',
        addressProofUrl: uRes.data.kyc?.addressProofUrl || '',
        livePhotoUrl: uRes.data.kyc?.livePhotoUrl || uRes.data.kyc?.selfieUrl || '',
        liveVideoUrl: uRes.data.kyc?.liveVideoUrl || uRes.data.kyc?.videoUrl || '',
      });
      setNotifications(nRes.data);
    } catch (err) {
      if (err.response?.status === 401) { localStorage.clear(); navigate('/login'); }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { 
    fetchData(); 
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [fetchData]);

  const handleApplyLoan = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/me/loans`, loanForm, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      alert('Application Submitted! Tracking ID will be generated shortly.');
      setLoanForm({ amount: '', durationMonths: '12', purpose: '', monthlyIncome: '' });
      setActiveTab('portfolio');
      fetchData();
    } catch (err) { alert('Application failed. Please try again.'); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/me`, profileForm, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      alert('Profile updated successfully!');
      fetchData();
    } catch (err) { alert('Update failed.'); }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/me/password`, passwordForm, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      alert('Password updated!');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) { alert('Failed: ' + (err.response?.data?.msg || 'Error')); }
  };

  const handleUpdateKyc = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/me`, { kyc: kycForm }, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      alert('KYC submitted for admin review.');
      fetchData();
    } catch (err) { alert('KYC update failed.'); }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.replace('/login');
  };

  if (loading) return (
    <div className="portal-loading">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTop: `3px solid ${pc}`, borderRadius: '50%' }} />
        <span>DAWN</span>
      </div>
    </div>
  );

  const score = user?.creditScore || 0;
  const scoreColor = score >= 750 ? '#22c55e' : score >= 600 ? '#fbbf24' : '#ef4444';
  const scoreLabel = score >= 750 ? 'Excellent' : score >= 600 ? 'Good' : score > 0 ? 'Fair' : 'N/A';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Activity size={18} /> },
    { id: 'portfolio', label: 'My Portfolio', icon: <Briefcase size={18} /> },
    { id: 'apply', label: 'Apply Loan', icon: <FileText size={18} /> },
    { id: 'credit-score', label: 'Credit Score', icon: <BarChart3 size={18} /> },
    { id: 'kyc', label: 'KYC', icon: <ShieldCheck size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} />, badge: notifications.filter(n => !n.isRead).length || null },
    { id: 'profile', label: 'Settings', icon: <Settings size={18} /> },
    { id: 'support', label: 'Support', icon: <HelpCircle size={18} /> },
    { id: 'about', label: 'About Us', icon: <Info size={18} /> },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0a0f', color: 'white' }}>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 998, backdropFilter: 'blur(3px)' }}
        />
      )}

      {/* Sidebar */}
      <motion.div 
        animate={{ width: sidebarOpen ? '280px' : (isMobile ? '0px' : '80px'), x: (!sidebarOpen && isMobile) ? -280 : 0 }} 
        style={{ 
          background: '#111', 
          borderRight: '1px solid rgba(255,255,255,0.05)', 
          padding: sidebarOpen || !isMobile ? '30px 15px' : '0px', 
          display: 'flex', 
          flexDirection: 'column',
          position: isMobile ? 'fixed' : 'relative',
          height: '100vh',
          zIndex: 999,
          overflow: 'hidden'
        }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center', gap: '15px', marginBottom: '40px' }}>
          <img src={config?.branding?.logoUrl || 'https://dawnlogos.s3.amazonaws.com/dawn6.png'} alt="Dawn" style={{ width: sidebarOpen ? '48px' : '40px', height: sidebarOpen ? '48px' : '40px', objectFit: 'contain', transition: 'all 0.3s' }} />
          {isMobile && sidebarOpen && (
            <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          )}
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); if (isMobile) setSidebarOpen(false); }} className={`nav-item ${activeTab === item.id ? 'active' : ''}`}>
              <span style={{ position: 'relative' }}>
                {item.icon}
                {item.badge && <span style={{ position: 'absolute', top: '-4px', right: '-6px', width: '14px', height: '14px', borderRadius: '50%', background: pc, fontSize: '0.55rem', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>{item.badge > 9 ? '9+' : item.badge}</span>}
              </span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        
        {sidebarOpen && (
          <div style={{ padding: '15px', textAlign: 'center', color: '#555', fontSize: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '20px', marginBottom: '10px' }}>
            Support: <a href="mailto:support@dawncapital.online" style={{ color: pc, textDecoration: 'none' }}>support@dawncapital.online</a>
          </div>
        )}

        <button onClick={handleLogout} className="nav-item danger">
          <LogOut size={18} /> {sidebarOpen && <span>Sign Out</span>}
        </button>
      </motion.div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="icon-btn"><Menu size={24} /></button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
             <div style={{ textAlign: 'right' }}>
               <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>{user?.name}</div>
               <div style={{ fontSize: '0.75rem', color: '#8a8aa0' }}>{user?.email}</div>
             </div>
             <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${pc}30` }}>
               <User size={20} color={pc} />
             </div>
          </div>
        </header>

        <AnnouncementMarquee target="portal" />

        <main style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {activeTab === 'dashboard' && <DashboardTab user={user} portfolio={portfolio} score={score} scoreColor={scoreColor} scoreLabel={scoreLabel} notifications={notifications} />}
            {activeTab === 'notifications' && <NotificationsTab notifications={notifications} />}
            {activeTab === 'portfolio' && <PortfolioTab portfolio={portfolio} />}
            {activeTab === 'apply' && <ApplyTab loanForm={loanForm} setLoanForm={setLoanForm} handleApplyLoan={handleApplyLoan} />}
            {activeTab === 'credit-score' && <CreditScoreTab user={user} />}
            {activeTab === 'kyc' && <KYCTab user={user} kycForm={kycForm} setKycForm={setKycForm} handleUpdateKyc={handleUpdateKyc} />}
            {activeTab === 'profile' && <ProfileTab user={user} profileForm={profileForm} setProfileForm={setProfileForm} handleUpdateProfile={handleUpdateProfile} passwordForm={passwordForm} setPasswordForm={setPasswordForm} handleUpdatePassword={handleUpdatePassword} />}
            {activeTab === 'support' && <SupportTab />}
            {activeTab === 'about' && <AboutUsTab />}
          </div>
        </main>
      </div>

      <style>{`
        .nav-item { display: flex; align-items: center; gap: 15px; padding: 14px 20px; width: 100%; background: none; border: none; color: #8a8aa0; cursor: pointer; border-radius: 12px; font-weight: 700; transition: all 0.3s; white-space: nowrap; }
        .nav-item:hover { background: rgba(255,255,255,0.03); color: white; }
        .nav-item.active { background: ${pc}15; color: ${pc}; }
        .nav-item.danger:hover { background: rgba(239,68,68,0.1); color: #ef4444; }
        .data-table { width: 100%; border-collapse: collapse; text-align: left; }
        .data-table th { padding: 12px; color: #555; font-size: 0.75rem; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .data-table td { padding: 15px 12px; border-bottom: 1px solid rgba(255,255,255,0.03); font-size: 0.9rem; }
        .badge { padding: 4px 10px; borderRadius: 20px; fontSize: 0.7rem; fontWeight: 800; textTransform: uppercase; }
        .badge-approved { background: rgba(34,197,94,0.1); color: #22c55e; }
        .badge-pending { background: rgba(251,191,36,0.1); color: #fbbf24; }
        .icon-btn { background: none; border: none; color: #8a8aa0; cursor: pointer; padding: 5px; }
        .admin-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px 16px; color: white; outline: none; width: 100%; transition: all 0.3s; font-size: 0.9rem; }
        .admin-input:focus { border-color: ${pc}; background: rgba(255,255,255,0.08); }
        .action-btn-primary { background: ${pc}; color: white; border: none; padding: 12px 24px; borderRadius: 10px; fontWeight: 800; cursor: pointer; transition: all 0.3s; }
        .action-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 20px ${pc}40; }
        .portal-loading { height: 100vh; display: flex; alignItems: center; justifyContent: center; background: #0a0a0f; color: ${pc}; font-weight: 900; letter-spacing: 5px; font-size: 2rem; }
        @media (max-width: 968px) {
          .stack-on-mobile { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          main { padding: 20px !important; }
          header { padding: 20px !important; }
        }
      `}</style>
    </div>
  );
}
