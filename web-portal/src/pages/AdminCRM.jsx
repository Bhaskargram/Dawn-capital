import React, { useState, useEffect, useMemo, memo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Users, TrendingUp, Settings, LogOut,
  Search, CheckCircle, XCircle, Clock, Trash2, Plus,
  Shield, MessageSquare, Briefcase, Save,
  CreditCard, Lock, Menu,
  Layout, BarChart3, Megaphone,
  ArrowUpRight, ArrowDownLeft, DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : `http://${window.location.hostname}:5000/api`);
const pc = '#C21B2F';
const formatINR = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

// ══════════ STABLE UI UTILITIES ══════════

const SectionCard = memo(({ title, children, action }) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>{title}</h3>
      {action && action}
    </div>
    {children}
  </div>
));

const FormField = memo(({ label, children, helper }) => (
  <div style={{ marginBottom: '18px' }}>
    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#8a8aa0', marginBottom: '8px' }}>{label}</label>
    {children}
    {helper && <p style={{ fontSize: '0.75rem', color: '#555', marginTop: '4px' }}>{helper}</p>}
  </div>
));

const Grid = ({ children, cols = 2 }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '20px' }} className="admin-grid">
    {children}
  </div>
);

// ══════════ TAB COMPONENTS ══════════

const StatCard = memo(({ icon: Icon, label, value, trend, color }) => (
  <motion.div whileHover={{ transform: 'translateY(-5px)' }} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ fontSize: '0.85rem', color: '#8a8aa0', fontWeight: '600', margin: '0 0 12px 0' }}>{label}</p>
        <h3 style={{ fontSize: '2rem', fontWeight: '900', margin: '0', color: color || 'white' }}>{value}</h3>
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', color: trend > 0 ? '#22c55e' : '#ef4444', fontSize: '0.85rem', fontWeight: '700' }}>
            {trend > 0 ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div style={{ padding: '12px', borderRadius: '12px', background: `${color}20` }}>
        <Icon size={24} color={color} />
      </div>
    </div>
  </motion.div>
));

const DashboardTab = memo(({ users, loans, investments, leads }) => {
  const totalUsers = users.length;
  const activeLoans = loans.filter(l => l.status === 'approved' || l.status === 'active').length;
  const totalLoanValue = loans.reduce((sum, l) => sum + (l.amount || 0), 0);
  const totalInvestmentValue = investments.reduce((sum, i) => sum + (i.amount || 0), 0);
  const pendingApplications = loans.filter(l => l.status === 'pending').length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <StatCard icon={Users} label="Total Clients" value={totalUsers} trend={5.2} color="#3b82f6" />
        <StatCard icon={Clock} label="Pending Applications" value={pendingApplications} color="#fbbf24" />
        <StatCard icon={CheckCircle} label="Active Loans" value={activeLoans} trend={12.5} color="#22c55e" />
        <StatCard icon={DollarSign} label="Loan Portfolio" value={`₹${(totalLoanValue / 1000).toFixed(1)}K`} trend={8.3} color="#ef4444" />
        <StatCard icon={TrendingUp} label="Investments" value={`₹${(totalInvestmentValue / 1000).toFixed(1)}K`} trend={15.7} color="#10b981" />
        <StatCard icon={MessageSquare} label="New Inquiries" value={newLeads} color="#8b5cf6" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        <SectionCard title="📊 Recent Activities">
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead><tr><th>Type</th><th>Client</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {loans.slice(0, 8).map(loan => (
                  <tr key={loan._id}>
                    <td><Briefcase size={16} style={{ color: pc }} /></td>
                    <td>{loan.user?.name || 'Unknown'}</td>
                    <td>{formatINR(loan.amount)}</td>
                    <td><span className={`badge ${loan.status}`}>{loan.status}</span></td>
                    <td>{new Date(loan.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="🎯 Quick Stats">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px' }}>
              <p style={{ fontSize: '0.85rem', color: '#8a8aa0', margin: '0 0 8px 0' }}>Conversion Rate</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '68%', height: '100%', background: '#22c55e', borderRadius: '4px' }} />
                </div>
                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>68%</span>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px' }}>
              <p style={{ fontSize: '0.85rem', color: '#8a8aa0', margin: '0 0 8px 0' }}>Approval Rate</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '82%', height: '100%', background: '#3b82f6', borderRadius: '4px' }} />
                </div>
                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>82%</span>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px' }}>
              <p style={{ fontSize: '0.85rem', color: '#8a8aa0', margin: '0 0 8px 0' }}>Default Rate</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '5%', height: '100%', background: '#ef4444', borderRadius: '4px' }} />
                </div>
                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>5%</span>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </motion.div>
  );
});

const UsersTab = memo(({ users, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [editForms, setEditForms] = useState({});
  
  const filteredUsers = useMemo(() => {
    return users
      .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'kyc') return (a.kycStatus || '').localeCompare(b.kycStatus || '');
        if (sortBy === 'credit') return (b.creditScore || 0) - (a.creditScore || 0);
        return 0;
      });
  }, [users, searchTerm, sortBy]);

  return (
    <SectionCard title="👥 Active Clients">
      <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8a8aa0' }} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            className="admin-input"
            style={{ paddingLeft: '40px' }}
          />
        </div>
        <select className="admin-input" style={{ width: '200px' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="kyc">Sort by KYC</option>
          <option value="credit">Sort by Credit Score</option>
        </select>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>KYC Status</th><th>Credit Score</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filteredUsers.map(user => {
              const isExpanded = expandedUserId === user._id;
              const form = editForms[user._id] || {
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                role: user.role || 'customer',
                creditScore: user.creditScore || 0,
                referralWallet: user.referralWallet || 0,
                kycStatus: user.kycStatus || 'pending',
                rejectionReason: user.kyc?.rejectionReason || ''
              };
              const setFormField = (key, value) => setEditForms(prev => ({ ...prev, [user._id]: { ...form, [key]: value } }));
              return (
                <React.Fragment key={user._id}>
                  <tr>
                    <td><div style={{ fontWeight: '700' }}>{user.name}</div><div style={{ fontSize: '0.8rem', color: '#555' }}>ID: {user._id.slice(-6)}</div></td>
                    <td style={{ fontSize: '0.9rem' }}>{user.email}</td>
                    <td>{user.phone || '—'}</td>
                    <td><span className={`badge ${user.kycStatus || 'pending'}`}>{user.kycStatus || 'pending'}</span></td>
                    <td style={{ fontWeight: '700', color: '#22c55e' }}>{user.creditScore || 0}</td>
                    <td><span className={`badge ${user.isBlocked ? 'danger' : 'approved'}`}>{user.isBlocked ? 'Blocked' : 'Active'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button onClick={() => {
                          setExpandedUserId(isExpanded ? null : user._id);
                          setEditForms(prev => ({ ...prev, [user._id]: form }));
                        }} className="icon-btn primary">{isExpanded ? 'Hide' : 'Edit/View'}</button>
                        <button onClick={() => onUpdate(user._id, { isBlocked: !user.isBlocked })} className={`icon-btn ${user.isBlocked ? 'danger' : 'primary'}`}><Lock size={16} /></button>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan="7">
                        <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '18px' }}>
                          <Grid>
                            <FormField label="Full Name"><input className="admin-input" value={form.name} onChange={e => setFormField('name', e.target.value)} /></FormField>
                            <FormField label="Email"><input className="admin-input" value={form.email} onChange={e => setFormField('email', e.target.value)} /></FormField>
                            <FormField label="Phone"><input className="admin-input" value={form.phone} onChange={e => setFormField('phone', e.target.value)} /></FormField>
                            <FormField label="Role">
                              <select className="admin-input" value={form.role} onChange={e => setFormField('role', e.target.value)}>
                                {['customer', 'support', 'manager', 'admin'].map(role => <option key={role} value={role}>{role}</option>)}
                              </select>
                            </FormField>
                            <FormField label="Credit Score"><input className="admin-input" type="number" value={form.creditScore} onChange={e => setFormField('creditScore', e.target.value)} /></FormField>
                            <FormField label="Referral Wallet"><input className="admin-input" type="number" value={form.referralWallet} onChange={e => setFormField('referralWallet', e.target.value)} /></FormField>
                            <FormField label="KYC Status">
                              <select className="admin-input" value={form.kycStatus} onChange={e => setFormField('kycStatus', e.target.value)}>
                                {['pending', 'submitted', 'approved', 'rejected'].map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </FormField>
                            <FormField label="Rejection Reason"><input className="admin-input" value={form.rejectionReason} onChange={e => setFormField('rejectionReason', e.target.value)} /></FormField>
                          </Grid>
                          <FormField label="Address"><textarea className="admin-input" value={form.address} onChange={e => setFormField('address', e.target.value)} style={{ minHeight: '72px' }} /></FormField>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '18px', color: '#d1d5db' }}>
                            <div><strong>PAN:</strong> {user.kyc?.panNumber || '—'}</div>
                            <div><strong>Aadhaar:</strong> {user.kyc?.aadhaarNumber || '—'}</div>
                            <div><strong>DOB:</strong> {user.kyc?.dateOfBirth || '—'}</div>
                            <div><strong>Occupation:</strong> {user.kyc?.occupation || '—'}</div>
                            <div><strong>Income:</strong> {user.kyc?.annualIncome ? formatINR(user.kyc.annualIncome) : '—'}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '18px' }}>
                            {user.kyc?.panDocumentUrl && <a href={user.kyc.panDocumentUrl} target="_blank" rel="noreferrer" style={{ color: pc }}>PAN Document</a>}
                            {user.kyc?.aadhaarDocumentUrl && <a href={user.kyc.aadhaarDocumentUrl} target="_blank" rel="noreferrer" style={{ color: pc }}>Aadhaar Document</a>}
                            {user.kyc?.addressProofUrl && <a href={user.kyc.addressProofUrl} target="_blank" rel="noreferrer" style={{ color: pc }}>Address Proof</a>}
                          </div>
                          <button className="action-btn-primary" onClick={() => onUpdate(user._id, {
                            name: form.name,
                            email: form.email,
                            phone: form.phone,
                            address: form.address,
                            role: form.role,
                            creditScore: form.creditScore,
                            referralWallet: form.referralWallet,
                            kycStatus: form.kycStatus,
                            kyc: { rejectionReason: form.rejectionReason }
                          })}>Save Customer Details</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionCard>
);});

const LoansTab = memo(({ loans, onDecision, setLoanForm }) => {
  const [filterStatus, setFilterStatus] = useState('pending');
  
  const filteredLoans = useMemo(() => {
    if (filterStatus === 'all') return loans;
    return loans.filter(l => l.status === filterStatus);
  }, [loans, filterStatus]);

  return (
    <SectionCard title="📄 Loan Applications">
      <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['pending', 'approved', 'rejected', 'all'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: filterStatus === status ? pc : 'rgba(255,255,255,0.05)',
                color: filterStatus === status ? 'white' : '#8a8aa0',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s',
                fontSize: '0.85rem'
              }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead><tr><th>Loan ID</th><th>Applicant</th><th>Details</th><th>Status</th><th>Offer Details</th><th>Actions</th></tr></thead>
          <tbody>
            {filteredLoans.filter(l => l.status === filterStatus || filterStatus === 'all').map(loan => (
              <tr key={loan._id}>
                <td><div style={{ fontWeight: '800', color: pc }}>{loan.loanId || loan._id}</div><div style={{ fontSize: '0.75rem', color: '#555' }}>{loan._id}</div></td>
                <td><div style={{ fontWeight: '700' }}>{loan.user?.name || 'Unknown'}</div><div style={{ fontSize: '0.8rem', color: '#555' }}>{formatINR(loan.amount)}</div></td>
                <td><div style={{ fontWeight: '600' }}>{loan.purpose}</div><div style={{ fontSize: '0.75rem', color: '#8a8aa0' }}>{loan.durationMonths} Months</div></td>
                <td><span className={`badge ${loan.status}`}>{loan.status}</span></td>
                <td>
                  {loan.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input placeholder="Rate %" type="number" className="admin-input sm" onChange={e => setLoanForm(loan._id, 'rate', e.target.value)} />
                      <input placeholder="EMI Amt" type="number" className="admin-input sm" onChange={e => setLoanForm(loan._id, 'emi', e.target.value)} />
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.9rem' }}>
                      <div>Rate: {loan.interestRate || '—'}%</div>
                      <div>EMI: {loan.emiAmount != null ? formatINR(loan.emiAmount) : '—'}</div>
                    </div>
                  )}
                </td>
                <td>
                  {loan.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => onDecision(loan._id, 'approved')} className="icon-btn success"><CheckCircle size={16} /></button>
                      <button onClick={() => onDecision(loan._id, 'rejected')} className="icon-btn danger"><XCircle size={16} /></button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#8a8aa0' }}>Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
});

const ActiveLoansTab = memo(({ loans }) => (
  <SectionCard title="💼 Managed Portfolio">
    <div style={{ overflowX: 'auto' }}>
      <table className="admin-table">
        <thead><tr><th>Loan ID</th><th>Client</th><th>Amount</th><th>EMI</th><th>Status</th></tr></thead>
        <tbody>
          {loans.filter(l => l.status !== 'pending').map(loan => (
            <tr key={loan._id}>
              <td><div style={{ fontWeight: '800', color: pc }}>{loan.loanId || loan._id}</div><div style={{ fontSize: '0.75rem', color: '#555' }}>{loan._id}</div></td>
              <td>{loan.user?.name}</td>
              <td style={{ fontWeight: '700' }}>{formatINR(loan.amount)}</td>
              <td>{formatINR(loan.emiAmount)}</td>
              <td><span className={`badge ${loan.status}`}>{loan.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </SectionCard>
));

const InvestmentsTab = memo(({ users, investments, onAdd, onDelete }) => {
  const [form, setForm] = useState({ userId: '', type: 'FD', amount: '', rate: '', duration: '' });
  const handleSubmit = (e) => { e.preventDefault(); onAdd(form); setForm({ userId: '', type: 'FD', amount: '', rate: '', duration: '' }); };
  return (
    <Grid>
      <SectionCard title="➕ Assign Investment">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <FormField label="Target User">
            <select className="admin-input" value={form.userId} onChange={e => setForm({...form, userId: e.target.value})} required>
              <option value="">Select User...</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
            </select>
          </FormField>
          <FormField label="Type">
            <select className="admin-input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option value="FD">Fixed Deposit (FD)</option>
              <option value="RD">Recurring Deposit (RD)</option>
            </select>
          </FormField>
          <Grid>
            <FormField label="Amount (₹)"><input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="admin-input" required /></FormField>
            <FormField label="Rate (%)"><input type="number" step="0.1" value={form.rate} onChange={e => setForm({...form, rate: e.target.value})} className="admin-input" required /></FormField>
          </Grid>
          <FormField label="Duration (Months)"><input type="number" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} className="admin-input" required /></FormField>
          <button type="submit" className="action-btn-primary" style={{ marginTop: '10px' }}>Create Investment</button>
        </form>
      </SectionCard>
      <SectionCard title="📈 Portfolio Overview">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead><tr><th>User</th><th>Type</th><th>Amount</th><th>Actions</th></tr></thead>
            <tbody>
              {investments.map(inv => (
                <tr key={inv._id}>
                  <td>{inv.user?.name}</td>
                  <td>{inv.type}</td>
                  <td style={{ color: '#22c55e', fontWeight: '700' }}>{formatINR(inv.amount)}</td>
                  <td><button onClick={() => onDelete(inv._id)} className="icon-btn danger"><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </Grid>
  );
});

const WebsiteTab = memo(({ config, setLocalConfig }) => (
  <Grid cols={1}>
    <SectionCard title="🎨 Branding & Visuals">
      <Grid>
        <FormField label="Company Name"><input className="admin-input" value={config?.branding?.companyName || ''} onChange={e => setLocalConfig('branding', 'companyName', e.target.value)} /></FormField>
        <FormField label="Logo URL"><input className="admin-input" value={config?.branding?.logoUrl || ''} onChange={e => setLocalConfig('branding', 'logoUrl', e.target.value)} /></FormField>
      </Grid>
      <Grid>
        <FormField label="Primary Color">
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="color" value={config?.branding?.primaryColor || pc} onChange={e => setLocalConfig('branding', 'primaryColor', e.target.value)} style={{ width: '40px', height: '40px' }} />
            <input className="admin-input" value={config?.branding?.primaryColor || pc} onChange={e => setLocalConfig('branding', 'primaryColor', e.target.value)} />
          </div>
        </FormField>
        <FormField label="Secondary Color">
           <div style={{ display: 'flex', gap: '10px' }}>
            <input type="color" value={config?.branding?.secondaryColor || '#333'} onChange={e => setLocalConfig('branding', 'secondaryColor', e.target.value)} style={{ width: '40px', height: '40px' }} />
            <input className="admin-input" value={config?.branding?.secondaryColor || '#333'} onChange={e => setLocalConfig('branding', 'secondaryColor', e.target.value)} />
          </div>
        </FormField>
      </Grid>
    </SectionCard>

    <SectionCard title="🚀 Landing Page Content">
      <FormField label="Hero Title"><input className="admin-input" value={config?.landingPage?.heroTitle || ''} onChange={e => setLocalConfig('landingPage', 'heroTitle', e.target.value)} /></FormField>
      <FormField label="Hero Subtitle"><textarea className="admin-input" value={config?.landingPage?.heroSubtitle || ''} onChange={e => setLocalConfig('landingPage', 'heroSubtitle', e.target.value)} style={{ minHeight: '80px' }} /></FormField>
      <FormField label="About Us Text"><textarea className="admin-input" value={config?.landingPage?.aboutUs || ''} onChange={e => setLocalConfig('landingPage', 'aboutUs', e.target.value)} style={{ minHeight: '120px' }} /></FormField>
      
      <div style={{ marginTop: '20px' }}>
        <h4 style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Services (Dynamic List)</h4>
        {config?.landingPage?.services?.map((svc, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input className="admin-input" placeholder="Title" value={svc.title} onChange={e => {
              const newServices = [...config.landingPage.services];
              newServices[i].title = e.target.value;
              setLocalConfig('landingPage', 'services', newServices);
            }} />
            <input className="admin-input" placeholder="Description" value={svc.description} onChange={e => {
              const newServices = [...config.landingPage.services];
              newServices[i].description = e.target.value;
              setLocalConfig('landingPage', 'services', newServices);
            }} />
            <button className="icon-btn danger" onClick={() => {
              const newServices = config.landingPage.services.filter((_, idx) => idx !== i);
              setLocalConfig('landingPage', 'services', newServices);
            }}><Trash2 size={16} /></button>
          </div>
        ))}
        <button className="action-btn-primary" onClick={() => setLocalConfig('landingPage', 'services', [...(config?.landingPage?.services || []), { title: '', description: '', icon: '' }])}>Add Service</button>
      </div>
    </SectionCard>

    <SectionCard title="📱 Contact & Support">
      <Grid>
        <FormField label="Support Email"><input className="admin-input" value={config?.contact?.email || ''} onChange={e => setLocalConfig('contact', 'email', e.target.value)} /></FormField>
        <FormField label="Phone Number"><input className="admin-input" value={config?.contact?.phone || ''} onChange={e => setLocalConfig('contact', 'phone', e.target.value)} /></FormField>
      </Grid>
      <Grid>
        <FormField label="WhatsApp Number"><input className="admin-input" value={config?.contact?.whatsapp || ''} onChange={e => setLocalConfig('contact', 'whatsapp', e.target.value)} /></FormField>
        <FormField label="Office Address"><input className="admin-input" value={config?.contact?.address || ''} onChange={e => setLocalConfig('contact', 'address', e.target.value)} /></FormField>
      </Grid>
    </SectionCard>
  </Grid>
));

const GatewayTab = memo(({ config, setLocalConfig }) => {
  const customProviders = config?.paymentGateways?.customProviders || [];
  const updateCustomGateway = (index, key, value) => {
    const next = customProviders.map((gateway, i) => i === index ? { ...gateway, [key]: value } : gateway);
    setLocalConfig('paymentGateways', 'customProviders', next);
  };
  const addCustomGateway = () => {
    setLocalConfig('paymentGateways', 'customProviders', [
      ...customProviders,
      { name: 'New Gateway', providerKey: '', enabled: false, mode: config?.system_mode || 'testing', publicKey: '', secretKey: '', webhookUrl: '', notes: '' }
    ]);
  };
  const removeCustomGateway = (index) => {
    setLocalConfig('paymentGateways', 'customProviders', customProviders.filter((_, i) => i !== index));
  };

  return (
  <Grid cols={1}>
    <SectionCard title="💳 Payment Gateways">
      <div style={{ marginBottom: '18px', padding: '14px 16px', borderRadius: '12px', background: config?.system_mode === 'testing' ? 'rgba(251,191,36,0.12)' : 'rgba(34,197,94,0.12)', color: config?.system_mode === 'testing' ? '#fbbf24' : '#22c55e', fontWeight: 800 }}>
        Active gateway mode: {(config?.system_mode || 'testing').toUpperCase()}. Testing mode should use sandbox/test credentials only.
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
        <h4 style={{ marginBottom: '15px' }}>Razorpay</h4>
        <Grid>
          <FormField label="Enabled"><input type="checkbox" checked={config?.paymentGateways?.razorpay?.enabled || false} onChange={e => setLocalConfig('paymentGateways.razorpay', 'enabled', e.target.checked)} /></FormField>
          <FormField label="Live Key ID"><input className="admin-input" value={config?.paymentGateways?.razorpay?.keyId || ''} onChange={e => setLocalConfig('paymentGateways.razorpay', 'keyId', e.target.value)} /></FormField>
          <FormField label="Live Key Secret"><input className="admin-input" type="password" value={config?.paymentGateways?.razorpay?.keySecret || ''} onChange={e => setLocalConfig('paymentGateways.razorpay', 'keySecret', e.target.value)} /></FormField>
          <FormField label="Test Key ID"><input className="admin-input" value={config?.paymentGateways?.razorpay?.testKeyId || ''} onChange={e => setLocalConfig('paymentGateways.razorpay', 'testKeyId', e.target.value)} /></FormField>
          <FormField label="Test Key Secret"><input className="admin-input" type="password" value={config?.paymentGateways?.razorpay?.testKeySecret || ''} onChange={e => setLocalConfig('paymentGateways.razorpay', 'testKeySecret', e.target.value)} /></FormField>
        </Grid>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
        <h4 style={{ marginBottom: '15px' }}>Cashfree</h4>
        <Grid>
          <FormField label="Enabled"><input type="checkbox" checked={config?.paymentGateways?.cashfree?.enabled || false} onChange={e => setLocalConfig('paymentGateways.cashfree', 'enabled', e.target.checked)} /></FormField>
          <FormField label="Live App ID"><input className="admin-input" value={config?.paymentGateways?.cashfree?.appId || ''} onChange={e => setLocalConfig('paymentGateways.cashfree', 'appId', e.target.value)} /></FormField>
          <FormField label="Live Secret Key"><input className="admin-input" type="password" value={config?.paymentGateways?.cashfree?.secretKey || ''} onChange={e => setLocalConfig('paymentGateways.cashfree', 'secretKey', e.target.value)} /></FormField>
          <FormField label="Test App ID"><input className="admin-input" value={config?.paymentGateways?.cashfree?.testAppId || ''} onChange={e => setLocalConfig('paymentGateways.cashfree', 'testAppId', e.target.value)} /></FormField>
          <FormField label="Test Secret Key"><input className="admin-input" type="password" value={config?.paymentGateways?.cashfree?.testSecretKey || ''} onChange={e => setLocalConfig('paymentGateways.cashfree', 'testSecretKey', e.target.value)} /></FormField>
        </Grid>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
        <h4 style={{ marginBottom: '15px' }}>Stripe</h4>
        <Grid>
          <FormField label="Enabled"><input type="checkbox" checked={config?.paymentGateways?.stripe?.enabled || false} onChange={e => setLocalConfig('paymentGateways.stripe', 'enabled', e.target.checked)} /></FormField>
          <FormField label="Live Publishable Key"><input className="admin-input" value={config?.paymentGateways?.stripe?.publishableKey || ''} onChange={e => setLocalConfig('paymentGateways.stripe', 'publishableKey', e.target.value)} /></FormField>
          <FormField label="Live Secret Key"><input className="admin-input" type="password" value={config?.paymentGateways?.stripe?.secretKey || ''} onChange={e => setLocalConfig('paymentGateways.stripe', 'secretKey', e.target.value)} /></FormField>
          <FormField label="Test Publishable Key"><input className="admin-input" value={config?.paymentGateways?.stripe?.testPublishableKey || ''} onChange={e => setLocalConfig('paymentGateways.stripe', 'testPublishableKey', e.target.value)} /></FormField>
          <FormField label="Test Secret Key"><input className="admin-input" type="password" value={config?.paymentGateways?.stripe?.testSecretKey || ''} onChange={e => setLocalConfig('paymentGateways.stripe', 'testSecretKey', e.target.value)} /></FormField>
        </Grid>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '15px' }}>
          <h4 style={{ margin: 0 }}>Custom Gateway CRUD</h4>
          <button type="button" className="action-btn-primary" onClick={addCustomGateway}><Plus size={16} /> Add Gateway</button>
        </div>
        {customProviders.length === 0 && <p style={{ color: '#8a8aa0' }}>No custom gateways added yet.</p>}
        {customProviders.map((gateway, index) => (
          <div key={index} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
            <Grid>
              <FormField label="Gateway Name"><input className="admin-input" value={gateway.name || ''} onChange={e => updateCustomGateway(index, 'name', e.target.value)} /></FormField>
              <FormField label="Provider Key"><input className="admin-input" value={gateway.providerKey || ''} onChange={e => updateCustomGateway(index, 'providerKey', e.target.value)} placeholder="internal_gateway_slug" /></FormField>
              <FormField label="Enabled"><input type="checkbox" checked={gateway.enabled || false} onChange={e => updateCustomGateway(index, 'enabled', e.target.checked)} /></FormField>
              <FormField label="Mode">
                <select className="admin-input" value={gateway.mode || 'testing'} onChange={e => updateCustomGateway(index, 'mode', e.target.value)}>
                  <option value="testing">Testing</option>
                  <option value="production">Production</option>
                </select>
              </FormField>
              <FormField label="Public Key"><input className="admin-input" value={gateway.publicKey || ''} onChange={e => updateCustomGateway(index, 'publicKey', e.target.value)} /></FormField>
              <FormField label="Secret Key"><input className="admin-input" type="password" value={gateway.secretKey || ''} onChange={e => updateCustomGateway(index, 'secretKey', e.target.value)} /></FormField>
              <FormField label="Webhook URL"><input className="admin-input" value={gateway.webhookUrl || ''} onChange={e => updateCustomGateway(index, 'webhookUrl', e.target.value)} /></FormField>
              <FormField label="Notes"><input className="admin-input" value={gateway.notes || ''} onChange={e => updateCustomGateway(index, 'notes', e.target.value)} /></FormField>
            </Grid>
            <button type="button" className="icon-btn danger" onClick={() => removeCustomGateway(index)}><Trash2 size={16} /> Delete Gateway</button>
          </div>
        ))}
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', marginTop: '16px' }}>
        <h4 style={{ marginBottom: '15px' }}>Custom Bank Account Transfer</h4>
        <Grid>
          <FormField label="Enabled"><input type="checkbox" checked={config?.paymentGateways?.bankAccount?.enabled || false} onChange={e => setLocalConfig('paymentGateways.bankAccount', 'enabled', e.target.checked)} /></FormField>
          <FormField label="Account Holder Name"><input className="admin-input" value={config?.paymentGateways?.bankAccount?.accountHolderName || ''} onChange={e => setLocalConfig('paymentGateways.bankAccount', 'accountHolderName', e.target.value)} /></FormField>
          <FormField label="Account Number"><input className="admin-input" value={config?.paymentGateways?.bankAccount?.accountNumber || ''} onChange={e => setLocalConfig('paymentGateways.bankAccount', 'accountNumber', e.target.value)} /></FormField>
          <FormField label="Bank Name"><input className="admin-input" value={config?.paymentGateways?.bankAccount?.bankName || ''} onChange={e => setLocalConfig('paymentGateways.bankAccount', 'bankName', e.target.value)} /></FormField>
          <FormField label="IFSC Code"><input className="admin-input" value={config?.paymentGateways?.bankAccount?.ifscCode || ''} onChange={e => setLocalConfig('paymentGateways.bankAccount', 'ifscCode', e.target.value)} /></FormField>
          <FormField label="SWIFT Code"><input className="admin-input" value={config?.paymentGateways?.bankAccount?.swiftCode || ''} onChange={e => setLocalConfig('paymentGateways.bankAccount', 'swiftCode', e.target.value)} /></FormField>
        </Grid>
        <FormField label="Transfer Instructions"><textarea className="admin-input" value={config?.paymentGateways?.bankAccount?.instructions || ''} onChange={e => setLocalConfig('paymentGateways.bankAccount', 'instructions', e.target.value)} style={{ minHeight: '60px' }} /></FormField>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', marginTop: '16px' }}>
        <h4 style={{ marginBottom: '15px' }}>Custom UPI Transfer</h4>
        <Grid>
          <FormField label="Enabled"><input type="checkbox" checked={config?.paymentGateways?.upi?.enabled || false} onChange={e => setLocalConfig('paymentGateways.upi', 'enabled', e.target.checked)} /></FormField>
          <FormField label="UPI ID / VPA"><input className="admin-input" value={config?.paymentGateways?.upi?.upiId || ''} onChange={e => setLocalConfig('paymentGateways.upi', 'upiId', e.target.value)} /></FormField>
          <FormField label="Recipient Name"><input className="admin-input" value={config?.paymentGateways?.upi?.recipientName || ''} onChange={e => setLocalConfig('paymentGateways.upi', 'recipientName', e.target.value)} /></FormField>
          <FormField label="QR Code URL (Image)"><input className="admin-input" value={config?.paymentGateways?.upi?.qrCodeUrl || ''} onChange={e => setLocalConfig('paymentGateways.upi', 'qrCodeUrl', e.target.value)} /></FormField>
        </Grid>
        <FormField label="Payment Instructions"><textarea className="admin-input" value={config?.paymentGateways?.upi?.instructions || ''} onChange={e => setLocalConfig('paymentGateways.upi', 'instructions', e.target.value)} style={{ minHeight: '60px' }} /></FormField>
      </div>
    </SectionCard>

    <SectionCard title="📧 Email & Messaging">
       <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
        <h4 style={{ marginBottom: '15px' }}>SMTP (Email)</h4>
        <Grid>
          <FormField label="Host"><input className="admin-input" value={config?.emailGateway?.smtpHost || ''} onChange={e => setLocalConfig('emailGateway', 'smtpHost', e.target.value)} /></FormField>
          <FormField label="Port"><input className="admin-input" type="number" value={config?.emailGateway?.smtpPort || ''} onChange={e => setLocalConfig('emailGateway', 'smtpPort', e.target.value)} /></FormField>
        </Grid>
        <Grid>
          <FormField label="User"><input className="admin-input" value={config?.emailGateway?.smtpUser || ''} onChange={e => setLocalConfig('emailGateway', 'smtpUser', e.target.value)} /></FormField>
          <FormField label="Pass"><input className="admin-input" type="password" value={config?.emailGateway?.smtpPass || ''} onChange={e => setLocalConfig('emailGateway', 'smtpPass', e.target.value)} /></FormField>
        </Grid>
      </div>
       <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px' }}>
        <h4 style={{ marginBottom: '15px' }}>WhatsApp (Twilio/WATI)</h4>
        <Grid>
          <FormField label="Provider">
            <select className="admin-input" value={config?.whatsappGateway?.provider || 'none'} onChange={e => setLocalConfig('whatsappGateway', 'provider', e.target.value)}>
              <option value="none">None</option>
              <option value="twilio">Twilio</option>
              <option value="wati">WATI</option>
            </select>
          </FormField>
          <FormField label="API Key/Token"><input className="admin-input" value={config?.whatsappGateway?.apiKey || ''} onChange={e => setLocalConfig('whatsappGateway', 'apiKey', e.target.value)} /></FormField>
        </Grid>
      </div>
    </SectionCard>
  </Grid>
  );
});

const SettingsTab = memo(({ config, setLocalConfig, announcements, onAddAnn, onDeleteAnn, users, onSendNotification }) => {
  const [annForm, setAnnForm] = useState({ title: '', message: '', type: 'info' });
  const [alertForm, setAlertForm] = useState({ title: '', message: '', target: 'all', userIds: [], sendSMS: false });

  const toggleRecipient = (id) => {
    setAlertForm(prev => {
      const has = prev.userIds.includes(id);
      return { ...prev, userIds: has ? prev.userIds.filter(uid => uid !== id) : [...prev.userIds, id] };
    });
  };

  return (
    <Grid cols={1}>
      <SectionCard title="⚙️ System Control">
        <Grid>
          <FormField label="System Mode">
            <select className="admin-input" value={config?.system_mode || 'testing'} onChange={e => setLocalConfig('', 'system_mode', e.target.value)}>
              <option value="testing">Testing Mode</option>
              <option value="production">Production Mode</option>
            </select>
          </FormField>
          <FormField label="Maintenance Mode">
             <input type="checkbox" checked={config?.maintenance?.enabled || false} onChange={e => setLocalConfig('maintenance', 'enabled', e.target.checked)} />
             <span style={{ marginLeft: '8px', fontSize: '0.85rem', color: '#8a8aa0' }}>Blocks customer access</span>
          </FormField>
        </Grid>
        <Grid>
          <FormField label="Enable Investments">
             <input type="checkbox" checked={config?.features?.investments ?? true} onChange={e => setLocalConfig('features', 'investments', e.target.checked)} />
          </FormField>
          <FormField label="Enable Loans">
             <input type="checkbox" checked={config?.features?.loans ?? true} onChange={e => setLocalConfig('features', 'loans', e.target.checked)} />
          </FormField>
        </Grid>
        <Grid>
          <FormField label="Enable Credit Scoring">
             <input type="checkbox" checked={config?.features?.creditScore ?? true} onChange={e => setLocalConfig('features', 'creditScore', e.target.checked)} />
          </FormField>
        </Grid>
      </SectionCard>
      <SectionCard title="📣 Targeted Alerts">
        <form onSubmit={async e => { e.preventDefault(); onSendNotification(alertForm); setAlertForm({ title: '', message: '', target: 'all', userIds: [], sendSMS: false }); }} style={{ display: 'grid', gap: '16px' }}>
          <Grid>
            <FormField label="Notification Title"><input className="admin-input" value={alertForm.title} onChange={e => setAlertForm({ ...alertForm, title: e.target.value })} required /></FormField>
            <FormField label="Message"><textarea className="admin-input" value={alertForm.message} onChange={e => setAlertForm({ ...alertForm, message: e.target.value })} required style={{ minHeight: '80px' }} /></FormField>
          </Grid>
          <Grid>
            <FormField label="Send To">
              <select className="admin-input" value={alertForm.target} onChange={e => setAlertForm({ ...alertForm, target: e.target.value, userIds: [] })}>
                <option value="all">All Users</option>
                <option value="selected">Selected Users</option>
              </select>
            </FormField>
            <FormField label="Send SMS Alerts">
              <input type="checkbox" checked={alertForm.sendSMS} onChange={e => setAlertForm({ ...alertForm, sendSMS: e.target.checked })} />
            </FormField>
          </Grid>

          {alertForm.target === 'selected' && (
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '14px', maxHeight: '260px', overflowY: 'auto' }}>
              <div style={{ marginBottom: '12px', color: '#8a8aa0', fontWeight: '700' }}>Select recipients ({alertForm.userIds.length} selected)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {users.map(user => (
                  <button key={user._id} type="button" onClick={() => toggleRecipient(user._id)} className={`icon-btn ${alertForm.userIds.includes(user._id) ? 'active' : ''}`} style={{ justifyContent: 'space-between', padding: '10px 12px' }}>
                    <span>{user.name || user.email}</span>
                    <span style={{ opacity: alertForm.userIds.includes(user._id) ? 1 : 0.4 }}>{alertForm.userIds.includes(user._id) ? '✓' : '+'}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className="action-btn-primary">Send Targeted Alert</button>
        </form>
      </SectionCard>

      <SectionCard title="🔗 Social Media Links">
        <Grid>
          <FormField label="LinkedIn"><input className="admin-input" value={config?.socialLinks?.linkedin || ''} onChange={e => setLocalConfig('socialLinks', 'linkedin', e.target.value)} /></FormField>
          <FormField label="Twitter/X"><input className="admin-input" value={config?.socialLinks?.twitter || ''} onChange={e => setLocalConfig('socialLinks', 'twitter', e.target.value)} /></FormField>
        </Grid>
        <Grid>
          <FormField label="Facebook"><input className="admin-input" value={config?.socialLinks?.facebook || ''} onChange={e => setLocalConfig('socialLinks', 'facebook', e.target.value)} /></FormField>
          <FormField label="Instagram"><input className="admin-input" value={config?.socialLinks?.instagram || ''} onChange={e => setLocalConfig('socialLinks', 'instagram', e.target.value)} /></FormField>
        </Grid>
      </SectionCard>
    </Grid>
  );
});

const AnnouncementsTab = memo(({ announcements, onAddAnn, onDeleteAnn }) => {
  const [annForm, setAnnForm] = useState({ title: '', message: '', type: 'info', target: 'both', link: '' });
  return (
    <Grid cols={1}>
      <SectionCard title="📢 Broadcast Manager & Announcements">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' }}>
          <form onSubmit={e => { e.preventDefault(); onAddAnn(annForm); setAnnForm({ title: '', message: '', type: 'info', target: 'both', link: '' }); }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <FormField label="Title"><input className="admin-input" value={annForm.title} onChange={e => setAnnForm({...annForm, title: e.target.value})} required /></FormField>
            <FormField label="Message"><textarea className="admin-input" value={annForm.message} onChange={e => setAnnForm({...annForm, message: e.target.value})} required style={{ minHeight: '80px' }} /></FormField>
            <FormField label="Link (Optional)"><input className="admin-input" value={annForm.link} onChange={e => setAnnForm({...annForm, link: e.target.value})} placeholder="https://..." /></FormField>
            <FormField label="Show To (Target)">
              <select className="admin-input" value={annForm.target} onChange={e => setAnnForm({...annForm, target: e.target.value})}>
                <option value="both">Both (Landing Page & Portal)</option>
                <option value="landing">Landing Page Only</option>
                <option value="portal">Customer Portal Only (Logged In Users)</option>
              </select>
            </FormField>
            <button type="submit" className="action-btn-primary">Post Announcement</button>
          </form>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <h4 style={{ fontSize: '0.85rem', marginBottom: '10px', color: '#8a8aa0' }}>Existing Announcements</h4>
            {announcements.map(a => (
              <div key={a._id} style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <div><div style={{ fontWeight: '700' }}>{a.title} <span style={{fontSize: '0.7rem', background: '#333', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px'}}>{a.target || 'both'}</span></div><div style={{ fontSize: '0.75rem' }}>{a.message.slice(0, 50)}...</div></div>
                <button onClick={() => onDeleteAnn(a._id)} className="icon-btn danger"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </Grid>
  );
});

const LegalTab = memo(({ config, setLocalConfig }) => (
  <Grid cols={1}>
    <SectionCard title="📜 Documents & Policies">
      <FormField label="Terms of Service"><textarea className="admin-input" value={config?.legals?.termsOfService || ''} onChange={e => setLocalConfig('legals', 'termsOfService', e.target.value)} style={{ minHeight: '150px' }} /></FormField>
      <FormField label="Privacy Policy"><textarea className="admin-input" value={config?.legals?.privacyPolicy || ''} onChange={e => setLocalConfig('legals', 'privacyPolicy', e.target.value)} style={{ minHeight: '150px' }} /></FormField>
      <FormField label="Disclaimer"><textarea className="admin-input" value={config?.legals?.disclaimer || ''} onChange={e => setLocalConfig('legals', 'disclaimer', e.target.value)} style={{ minHeight: '100px' }} /></FormField>
      <FormField label="Refund Policy"><textarea className="admin-input" value={config?.legals?.refundPolicy || ''} onChange={e => setLocalConfig('legals', 'refundPolicy', e.target.value)} style={{ minHeight: '100px' }} /></FormField>
    </SectionCard>
  </Grid>
));

const LeadsTab = memo(({ leads, onUpdateStatus, onDelete }) => (
  <SectionCard title="📭 Inbound Inquiries">
    <div style={{ overflowX: 'auto' }}>
      <table className="admin-table">
        <thead><tr><th>Date</th><th>Contact</th><th>Request</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {leads.map(lead => (
            <tr key={lead._id}>
              <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
              <td><div style={{ fontWeight: '700' }}>{lead.name}</div><div style={{ fontSize: '0.8rem', color: '#8a8aa0' }}>{lead.email}</div></td>
              <td><div style={{ fontWeight: '600' }}>{lead.loanAmount}</div><div style={{ fontSize: '0.75rem', color: '#555' }}>{lead.purpose}</div></td>
              <td>
                <select className="admin-input" style={{ width: 'auto', padding: '4px 8px' }} value={lead.status} onChange={e => onUpdateStatus(lead._id, e.target.value)}>
                  {['new', 'contacted', 'qualified', 'converted', 'rejected'].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                </select>
              </td>
              <td><button onClick={() => onDelete(lead._id)} className="icon-btn danger"><Trash2 size={16} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </SectionCard>
));

// ══════════ MAIN COMPONENT ══════════

export default function AdminCRM() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [allLoans, setAllLoans] = useState([]);
  const [allInvestments, setAllInvestments] = useState([]);
  const [allLeads, setAllLeads] = useState([]);
  const [allAnnouncements, setAllAnnouncements] = useState([]);
  const [config, setConfig] = useState(null);
  const [loanForm, setLoanFormState] = useState({});
  const navigate = useNavigate();

  const setLoanForm = (id, key, val) => setLoanFormState(prev => ({...prev, [id]: {...prev[id], [key]: val}}));

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    const headers = { 'x-auth-token': token };
    try {
      const [uRes, lRes, iRes, ldRes, aRes, cRes] = await Promise.all([
        axios.get(`${API}/users`, { headers }),
        axios.get(`${API}/admin/loans/all`, { headers }),
        axios.get(`${API}/admin/investments/all`, { headers }),
        axios.get(`${API}/admin/leads/all`, { headers }),
        axios.get(`${API}/admin/announcements/all`, { headers }),
        axios.get(`${API}/config`, { headers })
      ]);
      setAllUsers(uRes.data);
      setAllLoans(lRes.data);
      setAllInvestments(iRes.data);
      setAllLeads(ldRes.data);
      setAllAnnouncements(aRes.data);
      setConfig(cRes.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) navigate('/customer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateUser = async (id, data) => {
    try {
      await axios.put(`${API}/admin/users/${id}`, data, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      fetchData();
    } catch (err) { console.error(err); alert('Update failed'); }
  };

  const handleLoanDecision = async (loanId, status) => {
    try {
      const { rate, emi } = loanForm[loanId] || {};
      await axios.put(`${API}/admin/loans/${loanId}/status`, { status, interestRate: rate, emiAmount: emi }, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      fetchData();
      setLoanFormState(prev => { const n = {...prev}; delete n[loanId]; return n; });
    } catch (err) { console.error(err); alert('Action failed'); }
  };

  const handleAddInvestment = async (data) => {
    try {
      await axios.post(`${API}/admin/investments`, {
        userId: data.userId,
        type: data.type,
        amount: Number(data.amount),
        interestRate: Number(data.rate ?? data.interestRate),
        durationMonths: Number(data.duration ?? data.durationMonths)
      }, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      fetchData();
    } catch (err) { console.error(err); alert('Failed to add investment'); }
  };

  const handleDeleteInvestment = async (id) => {
    try {
      await axios.delete(`${API}/admin/investments/${id}`, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      fetchData();
    } catch (err) { console.error(err); alert('Delete failed'); }
  };

  const handleSaveConfig = async () => {
    try {
      await axios.put(`${API}/config`, config, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      alert('Configuration saved successfully!');
    } catch (err) { console.error(err); alert('Failed to save config'); }
  };

  const setLocalConfig = (section, key, value) => {
    setConfig(prev => {
      const updated = { ...prev };
      if (!section) {
         updated[key] = value;
      } else if (section.includes('.')) {
        const parts = section.split('.');
        let current = updated;
        for (let i = 0; i < parts.length - 1; i++) {
          current[parts[i]] = { ...current[parts[i]] };
          current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = { ...current[parts[parts.length - 1]], [key]: value };
      } else {
        updated[section] = { ...updated[section], [key]: value };
      }
      return updated;
    });
  };

  const handleAddAnn = async (data) => {
    try {
      await axios.post(`${API}/admin/announcements`, data, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      fetchData();
    } catch (err) { console.error(err); alert('Post failed'); }
  };

  const handleSendNotification = async (data) => {
    try {
      const payload = {
        title: data.title,
        message: data.message,
        sendSMS: data.sendSMS || false,
        all: data.target === 'all',
        userIds: data.target === 'selected' ? data.userIds : undefined,
        type: 'announcement'
      };
      await axios.post(`${API}/admin/notifications`, payload, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      alert('Notification(s) sent successfully');
      fetchData();
    } catch (err) { console.error(err); alert('Send failed'); }
  };

  const handleDeleteAnn = async (id) => {
    try {
      await axios.delete(`${API}/admin/announcements/${id}`, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      fetchData();
    } catch (err) { console.error(err); alert('Delete failed'); }
  };

  const handleUpdateLead = async (id, status) => {
    try {
      await axios.put(`${API}/admin/leads/${id}/status`, { status }, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      fetchData();
    } catch (err) { console.error(err); alert('Update failed'); }
  };

  const handleDeleteLead = async (id) => {
    try {
      await axios.delete(`${API}/admin/leads/${id}`, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      fetchData();
    } catch (err) { console.error(err); alert('Delete failed'); }
  };

  if (loading) return <div className="admin-loading"><span>DAWN CONTROL</span></div>;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={18} /> },
    { id: 'users', label: 'Clients', icon: <Users size={18} /> },
    { id: 'loans', label: 'Applications', icon: <Clock size={18} /> },
    { id: 'active_loans', label: 'Portfolio', icon: <TrendingUp size={18} /> },
    { id: 'investments', label: 'Investments', icon: <DollarSign size={18} /> },
    { id: 'leads', label: 'Inquiries', icon: <MessageSquare size={18} /> },
    { id: 'website', label: 'CMS/Content', icon: <Layout size={18} /> },
    { id: 'announcements', label: 'Announcements', icon: <Megaphone size={18} /> },
    { id: 'gateways', label: 'Gateways', icon: <CreditCard size={18} /> },
    { id: 'settings', label: 'System Settings', icon: <Settings size={18} /> },
    { id: 'legal', label: 'Legals', icon: <Shield size={18} /> },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0a0f', color: 'white' }}>
      {/* Sidebar */}
      <motion.div animate={{ width: sidebarOpen ? '280px' : '80px' }} style={{ background: '#111', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '30px 15px', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'flex-start' : 'center', gap: '15px', marginBottom: '40px', overflow: 'hidden' }}>
          <img src={config?.branding?.logoUrl || 'https://dawnlogos.s3.amazonaws.com/dawn6.png'} alt="Dawn" style={{ width: sidebarOpen ? '48px' : '40px', height: sidebarOpen ? '48px' : '40px', objectFit: 'contain', transition: 'all 0.3s' }} />
        </div>
        
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`nav-item ${activeTab === t.id ? 'active' : ''}`}>
              {t.icon} {sidebarOpen && <span>{t.label}</span>}
            </button>
          ))}
        </nav>

        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="nav-item danger">
          <LogOut size={18} /> {sidebarOpen && <span>Logout</span>}
        </button>
      </motion.div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0a0f' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="icon-btn"><Menu size={24} /></button>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>{tabs.find(t => t.id === activeTab)?.label}</h2>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {['website', 'gateways', 'settings', 'legal'].includes(activeTab) && (
              <button onClick={handleSaveConfig} className="action-btn-primary" style={{ padding: '10px 24px' }}>
                <Save size={18} /> Save All Changes
              </button>
            )}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#8a8aa0' }}>System Status: Operational</span>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
          {activeTab === 'dashboard' && <DashboardTab users={allUsers} loans={allLoans} investments={allInvestments} leads={allLeads} />}
          {activeTab === 'users' && <UsersTab users={allUsers} onUpdate={handleUpdateUser} />}
          {activeTab === 'loans' && <LoansTab loans={allLoans} onDecision={handleLoanDecision} loanForm={loanForm} setLoanForm={setLoanForm} />}
          {activeTab === 'active_loans' && <ActiveLoansTab loans={allLoans} />}
          {activeTab === 'investments' && <InvestmentsTab users={allUsers} investments={allInvestments} onAdd={handleAddInvestment} onDelete={handleDeleteInvestment} />}
          {activeTab === 'leads' && <LeadsTab leads={allLeads} onUpdateStatus={handleUpdateLead} onDelete={handleDeleteLead} />}
          {activeTab === 'website' && <WebsiteTab config={config} setLocalConfig={setLocalConfig} />}
          {activeTab === 'announcements' && <AnnouncementsTab announcements={allAnnouncements} onAddAnn={handleAddAnn} onDeleteAnn={handleDeleteAnn} />}
          {activeTab === 'gateways' && <GatewayTab config={config} setLocalConfig={setLocalConfig} />}
          {activeTab === 'settings' && <SettingsTab config={config} setLocalConfig={setLocalConfig} users={allUsers} onSendNotification={handleSendNotification} />}
          {activeTab === 'legal' && <LegalTab config={config} setLocalConfig={setLocalConfig} />}
        </main>
      </div>

      <style>{`
        .nav-item { display: flex; align-items: center; gap: 15px; padding: 14px 20px; width: 100%; background: none; border: none; color: #8a8aa0; cursor: pointer; border-radius: 12px; font-weight: 700; transition: all 0.3s; margin-bottom: 2px; }
        .nav-item:hover { background: rgba(255,255,255,0.03); color: white; }
        .nav-item.active { background: ${pc}15; color: ${pc}; }
        .nav-item.danger:hover { background: rgba(239,68,68,0.1); color: #ef4444; }
        .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
        .admin-table th { padding: 15px; color: #555; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .admin-table td { padding: 18px 15px; border-bottom: 1px solid rgba(255,255,255,0.03); font-size: 0.9rem; }
        .admin-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px 16px; color: white; outline: none; width: 100%; transition: all 0.3s; font-size: 0.9rem; }
        .admin-input:focus { border-color: ${pc}; background: rgba(255,255,255,0.08); }
        .admin-input.sm { padding: 6px 12px; font-size: 0.8rem; }
        .badge { padding: 6px 12px; borderRadius: 20px; fontSize: 0.75rem; fontWeight: 800; textTransform: uppercase; display: 'inline-block'; }
        .badge.pending { background: rgba(251,191,36,0.1); color: #fbbf24; }
        .badge.approved, .badge.active { background: rgba(34,197,94,0.1); color: #22c55e; }
        .badge.rejected { background: rgba(239,68,68,0.1); color: #ef4444; }
        .badge.verified, .badge.approved { background: rgba(34,197,94,0.1); color: #22c55e; }
        .badge.danger { background: rgba(239,68,68,0.1); color: #ef4444; }
        .icon-btn { width: 34px; height: 34px; borderRadius: 10px; display: flex; alignItems: center; justifyContent: center; cursor: pointer; border: none; background: rgba(255,255,255,0.05); color: #8a8aa0; transition: all 0.3s; }
        .icon-btn.primary:hover { background: ${pc}; color: white; }
        .icon-btn.success:hover { background: #22c55e; color: white; }
        .icon-btn.danger:hover { background: #ef4444; color: white; }
        .action-btn-primary { background: ${pc}; color: white; border: none; padding: 12px 20px; borderRadius: 12px; fontWeight: 800; cursor: pointer; display: flex; alignItems: center; gap: 10px; transition: all 0.3s; }
        .action-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 20px ${pc}40; }
        .admin-loading { height: 100vh; display: flex; alignItems: center; justifyContent: center; background: #0a0a0f; color: ${pc}; font-weight: 900; letter-spacing: 5px; font-size: 2rem; }
      `}</style>
    </div>
  );
}
