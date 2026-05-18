import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [contactInfo, setContactInfo] = useState({ email: 'support@dawncapital.com', phone: '+91 1800-DAWN-CAP', address: 'BKC, Mumbai, Maharashtra 400051', whatsapp: '' });

  const API = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : `http://${window.location.hostname}:5000/api`;

  useEffect(() => {
    axios.get(`${API}/config`)
      .then(res => {
        if (res.data?.contact) {
          setContactInfo({
            email: res.data.contact.email || contactInfo.email,
            phone: res.data.contact.phone || contactInfo.phone,
            address: res.data.contact.address || contactInfo.address,
            whatsapp: res.data.contact.whatsapp || contactInfo.whatsapp
          });
        }
      })
      .catch(err => console.error('Failed to load contact config', err));
  }, [API]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setError('');

    if (!form.name || !form.email || !form.subject || !form.message) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      await axios.post(`${API}/leads`, {
        name: form.name,
        email: form.email,
        phone: contactInfo.phone || 'N/A',
        loanAmount: 'Contact Inquiry',
        purpose: form.subject,
        message: form.message
      });
      setSent(true);
      setStatus('Your message has been received. Our team will contact you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 5000);
    } catch (err) {
      console.error(err);
      setError('Unable to submit right now. Please try again later.');
    }
  };

  return (
    <div style={{ background: '#0a0a0f', color: 'white', minHeight: '100vh' }}>
      <nav style={{ padding: '20px 5%', background: 'rgba(15,15,26,0.95)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Link to="/" style={{ color: '#C21B2F', fontWeight: '700', textDecoration: 'none' }}>&larr; Back to Home</Link>
      </nav>

      {/* Header */}
      <section style={{ padding: '100px 20px 40px', textAlign: 'center', background: 'radial-gradient(circle at top, rgba(194, 27, 47, 0.12) 0%, transparent 70%)' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '16px' }}>Get in <span style={{ color: '#C21B2F' }}>Touch</span></h1>
        <p style={{ color: '#8a8aa0', fontSize: '1.15rem', maxWidth: '700px', margin: '0 auto' }}>
          Have questions? Our team is here to help you with loan options, contact details, and instant support for your financial goals.
        </p>
      </section>

      <section style={{ padding: '60px 20px 100px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '50px' }}>
          <div>
            <div className="glass-card" style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ width: '50px', height: '50px', background: 'rgba(194, 27, 47, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C21B2F' }}>
                  <Mail size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Email Us</h4>
                  <p style={{ color: '#8a8aa0' }}>{contactInfo.email}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ width: '50px', height: '50px', background: 'rgba(194, 27, 47, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C21B2F' }}>
                  <Phone size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Call Us</h4>
                  <p style={{ color: '#8a8aa0' }}>{contactInfo.phone}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ width: '50px', height: '50px', background: 'rgba(194, 27, 47, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C21B2F' }}>
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Visit Us</h4>
                  <p style={{ color: '#8a8aa0' }}>{contactInfo.address}</p>
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(194, 27, 47, 0.15) 0%, transparent 100%)' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MessageSquare size={20} color="#C21B2F" /> Live Chat
              </h4>
              <p style={{ color: '#8a8aa0', marginBottom: '20px' }}>Instant support available during business hours (9 AM - 6 PM IST).</p>
              <button className="btn-primary" style={{ width: '100%' }}>Start Chat</button>
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '30px' }}>Send a Message</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#8a8aa0' }}>Name</label>
                  <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="form-input" placeholder="John Doe" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#8a8aa0' }}>Email</label>
                  <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="form-input" placeholder="john@example.com" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#8a8aa0' }}>Subject</label>
                <input type="text" required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="form-input" placeholder="How can we help?" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#8a8aa0' }}>Message</label>
                <textarea required value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="form-input" style={{ minHeight: '150px' }} placeholder="Your message here..." />
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                {sent ? '✅ Message Sent!' : <><Send size={18} /> Send Message</>}
              </button>
              {status && <div style={{ color: '#16a34a', fontWeight: '700' }}>{status}</div>}
              {error && <div style={{ color: '#b91c1c', fontWeight: '700' }}>{error}</div>}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
