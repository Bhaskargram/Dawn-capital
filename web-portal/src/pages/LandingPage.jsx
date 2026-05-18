import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import AnnouncementMarquee from '../components/AnnouncementMarquee';
import {
  ArrowRight,
  Banknote,
  Building2,
  CheckCircle,
  FileCheck2,
  Landmark,
  Mail,
  Menu,
  Phone,
  Shield,
  TrendingUp,
  Users,
  WalletCards,
  X,
} from 'lucide-react';

const DEFAULT_HERO_IMAGE = '/dawn-hero-building.jpg';

const DEFAULT_SERVICES = [
  {
    title: 'Business Lending',
    description: 'Working capital, secured business loans, and structured credit support for growing companies.',
    icon: 'Landmark',
  },
  {
    title: 'Investor Products',
    description: 'FD, RD, wallet, and curated investment tracking with transparent maturity visibility.',
    icon: 'TrendingUp',
  },
  {
    title: 'Digital Finance',
    description: 'Fast onboarding, secure document verification, EMI tracking, and customer self-service.',
    icon: 'Shield',
  },
];

const DEFAULT_FAQ = [
  { question: 'How fast can I apply?', answer: 'Most digital applications can be submitted in a few minutes after basic KYC details are ready.' },
  { question: 'Can I track my application?', answer: 'Yes. Use your application or loan ID to view the latest status from the customer portal.' },
  { question: 'Is the platform admin editable?', answer: 'Yes. Branding, landing content, lead forms, achievers, and contact details are designed to come from admin configuration.' },
];

const iconMap = {
  Landmark,
  TrendingUp,
  Shield,
  Banknote,
  WalletCards,
  FileCheck2,
  Building2,
};

const TypingHeadline = ({ text }) => {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setTyped(text.slice(0, index));
      if (index >= text.length) clearInterval(timer);
    }, 42);

    return () => clearInterval(timer);
  }, [text]);

  return (
    <span>
      {typed}
      <span className="dc-type-cursor" />
    </span>
  );
};

const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const text = String(value);
    const number = Number(text.replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(number)) {
      return;
    }

    const prefix = text.match(/^[^0-9]*/)?.[0] || '';
    const suffix = text.match(/[^0-9.]*$/)?.[0] || '';
    const decimals = text.includes('.') ? 1 : 0;
    let frame = 0;
    const totalFrames = 36;
    const timer = setInterval(() => {
      frame += 1;
      const eased = 1 - Math.pow(1 - frame / totalFrames, 3);
      const current = number * eased;
      setDisplay(`${prefix}${current.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}${suffix}`);
      if (frame >= totalFrames) {
        setDisplay(value);
        clearInterval(timer);
      }
    }, 24);

    return () => clearInterval(timer);
  }, [value]);

  return display;
};

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '6px',
  background: '#fff',
  border: '1px solid #d7dde5',
  color: '#172033',
  fontSize: '0.98rem',
  outline: 'none',
};

import MaintenanceScreen from '../components/MaintenanceScreen';

export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [trackId, setTrackId] = useState('');
  const [tracking, setTracking] = useState(false);
  const [trackResult, setTrackResult] = useState(null);
  const [trackError, setTrackError] = useState('');
  const [quoteForm, setQuoteForm] = useState({ name: '', email: '', phone: '', loanAmount: '', purpose: '' });
  const [quoteStatus, setQuoteStatus] = useState('');
  const [quoteError, setQuoteError] = useState('');
  const [openFaq, setOpenFaq] = useState(0);
  const [config, setConfig] = useState(null);
  const [maintenance, setMaintenance] = useState(null);

  const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : `http://${window.location.hostname}:5000/api`);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get(`${API}/config`, { timeout: 2500 });
        setConfig(res.data);
      } catch (error) {
        if (error.response?.status === 503 && error.response?.data?.maintenance) {
          setMaintenance(error.response.data.config);
        } else {
          console.error('Failed to load config', error);
        }
      }
    };

    fetchConfig();
  }, [API]);

  if (maintenance) {
    return <MaintenanceScreen config={maintenance} />;
  }

  const handleTrack = async (event) => {
    event?.preventDefault();
    if (!trackId.trim()) {
      setTrackError('Please enter a valid application ID.');
      return;
    }

    setTracking(true);
    setTrackError('');
    setTrackResult(null);

    try {
      const res = await axios.get(`${API}/config/track/${trackId.trim()}`);
      setTrackResult(res.data);
    } catch (error) {
      console.error('Application tracking failed', error);
      setTrackError('Application not found. Please check your ID.');
    } finally {
      setTracking(false);
    }
  };

  const handleQuoteSubmit = async (event) => {
    event.preventDefault();
    setQuoteStatus('Processing...');
    setQuoteError('');

    try {
      await axios.post(`${API}/leads`, { ...quoteForm, purpose: quoteForm.purpose || 'Personal Loan' });
      setQuoteStatus('Submitted. Our team will contact you shortly.');
      setQuoteForm({ name: '', email: '', phone: '', loanAmount: '', purpose: '' });
    } catch (error) {
      console.error('Lead submission failed', error);
      setQuoteError('Submission failed. Please try again.');
      setQuoteStatus('');
    }
  };

  const lp = config?.landingPage || {};
  const branding = config?.branding || {};
  const contact = config?.contact || {};
  const systemMode = config?.system_mode || config?.systemMode;
  const primary = branding.primaryColor || '#d90429';
  const companyName = branding.companyName || 'Dawn Capital';
  const services = lp.services?.length ? lp.services : DEFAULT_SERVICES;
  const faq = lp.faq?.length ? lp.faq : DEFAULT_FAQ;
  const heroImage = lp.heroImageUrl || lp.heroImage || branding.heroImage || DEFAULT_HERO_IMAGE;
  const heroTitle = lp.heroTitle || 'Smart Finance for Every Need';
  const LOGO_LIGHT = branding.logoUrl || 'https://dawnlogos.s3.amazonaws.com/dawn3.png';
  const LOGO_DARK = 'https://dawnlogos.s3.amazonaws.com/dawn6.png';

  return (
    <div className="dc-page" style={{ '--dc-primary': primary }}>
      {systemMode === 'testing' && (
        <div className="dc-test-banner">TEST ENVIRONMENT</div>
      )}

      <header className="dc-header">
        <Link to="/" className="dc-brand" aria-label={`${companyName} home`}>
            <img src={LOGO_LIGHT} alt={companyName} style={{ height: '44px', width: 'auto', objectFit: 'contain' }} />
        </Link>

        <nav className="dc-nav" aria-label="Primary navigation">
          <a href="#businesses">Businesses</a>
          <a href="#investors">Investors</a>
          <Link className="dc-nav-strong" to="/login">Customer Login</Link>
        </nav>

        <button className="dc-mobile-toggle" onClick={() => setMobileMenu((open) => !open)} aria-label="Toggle menu">
          {mobileMenu ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {mobileMenu && (
        <div className="dc-mobile-menu">
          <img src={LOGO_DARK} alt={companyName} style={{ height: '40px', width: 'auto', objectFit: 'contain', marginBottom: '8px' }} />
          <a href="#businesses" onClick={() => setMobileMenu(false)}>Businesses</a>
          <a href="#investors" onClick={() => setMobileMenu(false)}>Investors</a>
          <a href="#tracking" onClick={() => setMobileMenu(false)}>Track Application</a>
          <a href="#faq" onClick={() => setMobileMenu(false)}>FAQ</a>
          <Link to="/login" onClick={() => setMobileMenu(false)}>Customer Login</Link>
          <Link to="/login?mode=signup" onClick={() => setMobileMenu(false)} className="dc-mobile-cta">Open Account</Link>
        </div>
      )}

      <AnnouncementMarquee target="landing" />

      <main>
        <section className="dc-hero" style={{ backgroundImage: `linear-gradient(rgba(5, 12, 20, 0.7), rgba(5, 12, 20, 0.74)), url(${heroImage})` }}>
          <motion.div className="dc-hero-inner" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }}>
            <h1><TypingHeadline key={heroTitle} text={heroTitle} /></h1>
            <p>{lp.heroSubtitle || 'Delivering trusted financial solutions including loans, insurance, investments, and wealth management across India.'}</p>
            <a href="#businesses" className="dc-primary-btn">Explore Solutions</a>
          </motion.div>
        </section>

        <section className="dc-stats" aria-label="Company highlights">
          <motion.div initial={{ y: 14 }} whileInView={{ y: 0 }} viewport={{ once: false, amount: 0.7 }} transition={{ duration: 0.35 }}>
            <strong><AnimatedNumber key={lp.statsAum || '$64.9B+'} value={lp.statsAum || '$64.9B+'} /></strong>
            <span>Assets Under Management</span>
          </motion.div>
          <motion.div initial={{ y: 14 }} whileInView={{ y: 0 }} viewport={{ once: false, amount: 0.7 }} transition={{ duration: 0.35, delay: 0.06 }}>
            <strong><AnimatedNumber key={lp.statsEmployees || '66,000+'} value={lp.statsEmployees || '66,000+'} /></strong>
            <span>Employees Nationwide</span>
          </motion.div>
          <motion.div initial={{ y: 14 }} whileInView={{ y: 0 }} viewport={{ once: false, amount: 0.7 }} transition={{ duration: 0.35, delay: 0.12 }}>
            <strong><AnimatedNumber key={lp.statsBranches || '1,700+'} value={lp.statsBranches || '1,700+'} /></strong>
            <span>Branches & Touchpoints</span>
          </motion.div>
        </section>

        <motion.section className="dc-section dc-intro" id="businesses" initial={{ opacity: 0.96, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.25 }} transition={{ duration: 0.42 }}>
          <div>
            <span className="dc-kicker">Businesses</span>
            <h2>Capital, credit, and operating tools for ambitious teams.</h2>
          </div>
          <p>
            {lp.aboutUs || 'Dawn Capital combines lending workflows, investment records, CRM, KYC verification, and wallet ledgers in one configurable financial ecosystem.'}
          </p>
        </motion.section>

        <section className="dc-section dc-services" id="investors">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon] || iconMap[service.iconName] || Landmark;
            return (
              <motion.article className="dc-service-card" key={`${service.title}-${index}`} initial={{ opacity: 0.98, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.25 }} transition={{ delay: index * 0.06 }} whileHover={{ y: -8 }}>
                <Icon size={30} />
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <Link to="/login">
                  View Details <ArrowRight size={16} />
                </Link>
              </motion.article>
            );
          })}
        </section>

        <section className="dc-section dc-split" id="tracking">
          <div className="dc-panel">
            <span className="dc-kicker">Application Status</span>
            <h2>Track your finance request.</h2>
            <form className="dc-inline-form" onSubmit={handleTrack}>
              <input style={inputStyle} placeholder="e.g. DAWN-LN-1001" value={trackId} onChange={(event) => setTrackId(event.target.value)} />
              <button type="submit" disabled={tracking}>{tracking ? 'Tracking' : 'Track'}</button>
            </form>
            {trackResult && (
              <div className="dc-result">
                <CheckCircle size={20} />
                <div>
                  <strong>{trackResult.status?.toUpperCase() || 'FOUND'}</strong>
                  <span>{trackResult.loanId || trackId} {trackResult.amount ? `• ${trackResult.amount}` : ''}</span>
                </div>
              </div>
            )}
            {trackError && <p className="dc-error">{trackError}</p>}
          </div>

          <div className="dc-panel">
            <span className="dc-kicker">Lead Desk</span>
            <h2>Request a callback.</h2>
            <form className="dc-lead-form" onSubmit={handleQuoteSubmit}>
              <input style={inputStyle} placeholder="Full Name" required value={quoteForm.name} onChange={(event) => setQuoteForm({ ...quoteForm, name: event.target.value })} />
              <input style={inputStyle} placeholder="Email" type="email" required value={quoteForm.email} onChange={(event) => setQuoteForm({ ...quoteForm, email: event.target.value })} />
              <input style={inputStyle} placeholder="Phone" required value={quoteForm.phone} onChange={(event) => setQuoteForm({ ...quoteForm, phone: event.target.value })} />
              <select style={inputStyle} required value={quoteForm.loanAmount} onChange={(event) => setQuoteForm({ ...quoteForm, loanAmount: event.target.value })}>
                <option value="">Desired Loan Amount</option>
                <option value="100000">Up to Rs. 1,00,000</option>
                <option value="500000">Rs. 1,00,000 - Rs. 5,00,000</option>
                <option value="1000000">Rs. 5,00,000+</option>
              </select>
              <button type="submit">Submit Enquiry</button>
              {quoteStatus && <p className="dc-success">{quoteStatus}</p>}
              {quoteError && <p className="dc-error">{quoteError}</p>}
            </form>
          </div>
        </section>

        <section className="dc-section dc-trust">
          <div>
            <FileCheck2 size={34} />
            <strong>KYC & Compliance</strong>
            <span>PAN/Aadhaar document flows, verification status, passbook exports, and TDS records.</span>
          </div>
          <div>
            <Users size={34} />
            <strong>Customer + CRM</strong>
            <span>Lead capture, ticket workflows, role-based access, and customer self-service.</span>
          </div>
        </section>

        <section className="dc-section dc-faq" id="faq">
          <span className="dc-kicker">Questions</span>
          <h2>Clear answers for customers and teams.</h2>
          <div>
            {faq.map((item, index) => (
              <article key={`${item.question}-${index}`}>
                <button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)} className="dc-faq-question">
                  <h3>{item.question}</h3>
                  <span>{openFaq === index ? '-' : '+'}</span>
                </button>
                {openFaq === index && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.2 }}>{item.answer}</motion.p>
                )}
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="dc-footer">
        <div className="dc-footer-grid">
          <div className="dc-footer-brand">
            <img src={LOGO_DARK} alt={companyName} style={{ height: '50px', width: 'auto', objectFit: 'contain', marginBottom: '12px' }} />
            <span>{contact.address || 'A white-label digital finance platform for lending, investments, KYC, CRM, and customer self-service.'}</span>
            <div className="dc-footer-badges">
              <span>Bank-grade security</span>
              <span>KYC ready</span>
              <span>Testing mode supported</span>
            </div>
          </div>
          <div>
            <h4>Solutions</h4>
            <Link to="/login">Customer Portal</Link>
            <a href="#businesses">Business Loans</a>
            <a href="#investors">FD/RD Investments</a>
            <a href="#investors">Digital Wallet</a>
          </div>
          <div>
            <h4>Company</h4>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
          <div>
            <h4>Contact Desk</h4>
            <span><Phone size={16} /> {contact.phone || '+91 00000 00000'}</span>
            <span><Mail size={16} /> {contact.email || 'support@dawncapital.in'}</span>
            <Link className="dc-footer-cta" to="/login?mode=signup">Open Account</Link>
          </div>
        </div>
        <div className="dc-footer-bottom">
          <span>© {new Date().getFullYear()} {companyName}. All rights reserved.</span>
          <span>Secure financial technology platform</span>
        </div>
      </footer>

      <style>{`
        .dc-page {
          background: #ffffff;
          color: #172033;
          min-height: 100vh;
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .dc-test-banner {
          position: sticky;
          top: 0;
          z-index: 1200;
          background: #111827;
          color: #fff;
          text-align: center;
          padding: 8px 16px;
          font-size: 0.82rem;
          font-weight: 900;
          letter-spacing: 0.14em;
        }

        .dc-header {
          height: 78px;
          padding: 0 5.5%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fff;
          border-bottom: 1px solid #eef1f5;
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .dc-brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          color: var(--dc-primary);
          text-decoration: none;
          font-size: 1.45rem;
          font-weight: 950;
          letter-spacing: 0.02em;
          white-space: nowrap;
        }

        .dc-brand img {
          max-width: 42px;
          max-height: 42px;
          object-fit: contain;
        }

        .dc-brand-mark {
          display: grid;
          place-items: center;
          color: var(--dc-primary);
        }

        .dc-nav {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .dc-nav a {
          color: #323947;
          text-decoration: none;
          font-weight: 800;
          font-size: 0.95rem;
        }

        .dc-nav a:hover,
        .dc-nav .dc-nav-strong {
          color: var(--dc-primary);
        }

        .dc-mobile-toggle {
          display: none;
          border: 0;
          background: transparent;
          color: #172033;
          padding: 8px;
        }

        .dc-mobile-menu {
          display: none;
        }

        .dc-hero {
          min-height: 620px;
          display: grid;
          place-items: center;
          background-size: cover;
          background-position: center;
          text-align: center;
          color: #fff;
          padding: 80px 5%;
        }

        .dc-hero-inner {
          width: min(850px, 100%);
          display: grid;
          justify-items: center;
        }

        .dc-hero h1 {
          margin: 0;
          font-size: clamp(3rem, 7vw, 5.5rem);
          line-height: 1.08;
          font-weight: 950;
          letter-spacing: 0;
          text-wrap: balance;
        }

        .dc-type-cursor {
          display: inline-block;
          width: 0.08em;
          height: 0.82em;
          margin-left: 0.08em;
          background: #fff;
          animation: dcBlink 0.9s steps(2, start) infinite;
          vertical-align: -0.06em;
        }

        @keyframes dcBlink {
          0%, 45% { opacity: 1; }
          46%, 100% { opacity: 0; }
        }

        .dc-hero p {
          width: min(760px, 100%);
          margin: 26px 0 38px;
          color: rgba(255,255,255,0.9);
          font-size: clamp(1rem, 2vw, 1.35rem);
          line-height: 1.7;
          font-weight: 650;
        }

        .dc-primary-btn,
        .dc-inline-form button,
        .dc-lead-form button {
          border: 0;
          background: var(--dc-primary);
          color: #fff;
          text-decoration: none;
          min-height: 52px;
          padding: 0 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 2px;
          font-weight: 900;
          cursor: pointer;
        }

        .dc-stats {
          background: var(--dc-primary);
          color: #fff;
          min-height: 150px;
          padding: 28px 5%;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 26px;
          align-items: center;
          justify-items: center;
          text-align: center;
        }

        .dc-stats div {
          display: grid;
          gap: 6px;
        }

        .dc-stats strong {
          font-size: clamp(2rem, 3vw, 3rem);
          line-height: 1;
          font-weight: 950;
        }

        .dc-stats span {
          font-weight: 650;
          color: rgba(255,255,255,0.9);
        }

        .dc-section {
          width: min(1180px, 90%);
          margin: 0 auto;
          padding: 90px 0;
        }

        .dc-kicker {
          color: var(--dc-primary);
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 0.14em;
          font-weight: 950;
        }

        .dc-intro {
          display: grid;
          grid-template-columns: 0.95fr 1.05fr;
          gap: 70px;
          align-items: center;
        }

        .dc-intro h2,
        .dc-panel h2,
        .dc-faq h2 {
          margin: 12px 0 0;
          font-size: clamp(2rem, 4vw, 3.25rem);
          line-height: 1.1;
          color: #111827;
          letter-spacing: 0;
        }

        .dc-intro p {
          margin: 0;
          color: #566173;
          font-size: 1.1rem;
          line-height: 1.8;
          font-weight: 560;
        }

        .dc-services {
          padding-top: 10px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
        }

        .dc-service-card,
        .dc-panel,
        .dc-faq article {
          background: #fff;
          border: 1px solid #e6ebf2;
          box-shadow: 0 18px 45px rgba(17, 24, 39, 0.08);
        }

        .dc-service-card {
          will-change: transform;
        }

        .dc-service-card {
          min-height: 280px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
        }

        .dc-service-card svg,
        .dc-trust svg {
          color: var(--dc-primary);
        }

        .dc-service-card h3 {
          margin: 0;
          color: #111827;
          font-size: 1.35rem;
        }

        .dc-service-card p {
          margin: 0;
          color: #667085;
          line-height: 1.65;
          flex: 1;
        }

        .dc-service-card a {
          color: var(--dc-primary);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          font-weight: 900;
        }

        .dc-split {
          width: 100%;
          max-width: none;
          background: #f4f6f9;
          padding: 90px 5%;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 560px));
          justify-content: center;
          gap: 28px;
        }

        .dc-panel {
          padding: 34px;
        }

        .dc-panel h2 {
          font-size: clamp(1.8rem, 3vw, 2.6rem);
          margin-bottom: 24px;
        }

        .dc-inline-form,
        .dc-lead-form {
          display: grid;
          gap: 14px;
        }

        .dc-inline-form {
          grid-template-columns: 1fr auto;
        }

        .dc-result {
          margin-top: 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #047857;
          font-weight: 800;
        }

        .dc-result span {
          display: block;
          color: #566173;
          font-weight: 650;
          margin-top: 3px;
        }

        .dc-success,
        .dc-error {
          margin: 0;
          font-weight: 800;
        }

        .dc-success {
          color: #047857;
        }

        .dc-error {
          color: var(--dc-primary);
        }

        .dc-trust {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 30px;
          text-align: center;
        }

        .dc-trust div {
          display: grid;
          justify-items: center;
          gap: 12px;
        }

        .dc-trust strong {
          color: #111827;
          font-size: 1.15rem;
        }

        .dc-trust span {
          color: #667085;
          line-height: 1.6;
        }

        .dc-faq {
          padding-top: 20px;
        }

        .dc-faq > div {
          margin-top: 28px;
          display: grid;
          gap: 16px;
        }

        .dc-faq article {
          padding: 24px 28px;
        }

        .dc-faq h3 {
          margin: 0;
          color: #111827;
          font-size: 1.12rem;
        }

        .dc-faq-question {
          width: 100%;
          border: 0;
          background: transparent;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          cursor: pointer;
          text-align: left;
        }

        .dc-faq-question span {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: var(--dc-primary);
          color: #fff;
          display: grid;
          place-items: center;
          font-weight: 900;
          flex: 0 0 auto;
        }

        .dc-faq p {
          margin: 0;
          color: #667085;
          line-height: 1.65;
        }

        .dc-footer {
          background: #111827;
          color: #fff;
          padding: 58px 5% 28px;
        }

        .dc-footer-grid {
          display: grid;
          grid-template-columns: 1.6fr repeat(3, 1fr);
          gap: 42px;
          width: min(1180px, 100%);
          margin: 0 auto;
        }

        .dc-footer-grid > div {
          display: grid;
          align-content: start;
          gap: 12px;
        }

        .dc-footer strong {
          font-size: 1.5rem;
          color: #fff;
        }

        .dc-footer h4 {
          margin: 0 0 8px;
          color: #fff;
          font-size: 0.98rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .dc-footer span,
        .dc-footer a {
          color: rgba(255,255,255,0.78);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          line-height: 1.6;
        }

        .dc-footer a:hover {
          color: #fff;
        }

        .dc-footer-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .dc-footer-badges span {
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 0.78rem;
        }

        .dc-footer-cta {
          margin-top: 8px;
          width: fit-content;
          background: var(--dc-primary);
          color: #fff !important;
          padding: 10px 16px;
          border-radius: 3px;
          font-weight: 900;
        }

        .dc-footer-bottom {
          width: min(1180px, 100%);
          margin: 36px auto 0;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.1);
          display: flex;
          justify-content: space-between;
          gap: 18px;
          flex-wrap: wrap;
        }

        @media (max-width: 900px) {
          .dc-header {
            height: 68px;
          }

          .dc-nav {
            display: none;
          }

          .dc-mobile-toggle {
            display: inline-flex;
          }

          .dc-mobile-menu {
            display: grid;
            position: sticky;
            top: 68px;
            z-index: 999;
            background: #fff;
            border-bottom: 1px solid #e6ebf2;
            box-shadow: 0 24px 50px rgba(17, 24, 39, 0.12);
          }

          .dc-mobile-menu-head {
            padding: 16px 5%;
            color: var(--dc-primary);
            font-weight: 950;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }

          .dc-mobile-menu a {
            color: #172033;
            padding: 16px 5%;
            text-decoration: none;
            font-weight: 850;
            border-top: 1px solid #eef1f5;
          }

          .dc-mobile-menu .dc-mobile-cta {
            background: var(--dc-primary);
            color: #fff;
            margin: 12px 5% 18px;
            justify-content: center;
            border-radius: 4px;
            border-top: 0;
          }

          .dc-hero {
            min-height: 560px;
            padding: 70px 5%;
          }

          .dc-stats,
          .dc-intro,
          .dc-services,
          .dc-split,
          .dc-trust {
            grid-template-columns: 1fr;
          }

          .dc-stats {
            gap: 30px;
          }

          .dc-intro {
            gap: 24px;
          }

          .dc-inline-form {
            grid-template-columns: 1fr;
          }

          .dc-footer-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 560px) {
          .dc-brand {
            font-size: 1.1rem;
          }

          .dc-brand-mark svg {
            width: 22px;
          }

          .dc-section,
          .dc-split {
            padding-top: 60px;
            padding-bottom: 60px;
          }

          .dc-hero h1 {
            font-size: 2.55rem;
          }

          .dc-panel,
          .dc-service-card,
          .dc-faq article {
            padding: 24px;
          }

          .dc-footer-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
