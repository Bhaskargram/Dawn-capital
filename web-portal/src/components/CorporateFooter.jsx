import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Building2, Mail, Phone, ShieldCheck } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://api.dawncapital.online/api';

const footerStyle = {
  background: '#111827',
  color: '#fff',
  padding: '52px 5% 26px',
  borderTop: '1px solid rgba(255,255,255,0.08)',
};

export default function CorporateFooter() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    axios.get(`${API}/config`, { timeout: 2500 }).then((res) => setConfig(res.data)).catch(() => {});
  }, []);

  const branding = config?.branding || {};
  const contact = config?.contact || {};
  const companyName = branding.companyName || 'Dawn Capital';
  const primary = branding.primaryColor || '#e0002a';

  return (
    <footer style={footerStyle}>
      <div className="corp-footer-grid">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: primary, fontWeight: 950, fontSize: '1.35rem', marginBottom: 14 }}>
            {branding.logoUrl ? <img src={branding.logoUrl} alt={companyName} style={{ width: 28, height: 28, objectFit: 'contain' }} /> : <Building2 size={24} />}
            {companyName.toUpperCase()}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.74)', lineHeight: 1.7, margin: 0 }}>
            Digital lending, investments, KYC, payments, CRM, and customer service in one controlled financial ecosystem.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
            {['Secure portal', 'KYC workflow', 'Admin CMS'].map((item) => (
              <span key={item} style={{ border: '1px solid rgba(255,255,255,0.14)', borderRadius: 999, padding: '7px 11px', color: 'rgba(255,255,255,0.78)', fontSize: '0.78rem' }}>{item}</span>
            ))}
          </div>
        </div>
        <div>
          <h4>Products</h4>
          <Link to="/login?mode=signup">Open Account</Link>
          <Link to="/login">Customer Login</Link>
          <Link to="/how-to-use">How To Use</Link>
        </div>
        <div>
          <h4>Company</h4>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
        <div>
          <h4>Support</h4>
          <span><Phone size={16} /> {contact.phone || '+91 00000 00000'}</span>
          <span><Mail size={16} /> {contact.email || 'support@dawncapital.in'}</span>
          <span><ShieldCheck size={16} /> Bank-grade controls</span>
        </div>
      </div>
      <div className="corp-footer-bottom">
        <span>© {new Date().getFullYear()} {companyName}. All rights reserved.</span>
        <span>Production-ready fintech operations</span>
      </div>
      <style>{`
        .corp-footer-grid {
          width: min(1180px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.5fr repeat(3, 1fr);
          gap: 38px;
        }
        .corp-footer-grid h4 {
          margin: 0 0 12px;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 0.9rem;
        }
        .corp-footer-grid a,
        .corp-footer-grid span {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255,255,255,0.74);
          text-decoration: none;
          line-height: 1.8;
        }
        .corp-footer-grid a:hover { color: #fff; }
        .corp-footer-bottom {
          width: min(1180px, 100%);
          margin: 34px auto 0;
          padding-top: 18px;
          border-top: 1px solid rgba(255,255,255,0.1);
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
          color: rgba(255,255,255,0.62);
          font-size: 0.88rem;
        }
        @media (max-width: 820px) {
          .corp-footer-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 560px) {
          .corp-footer-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </footer>
  );
}
