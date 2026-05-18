import React from 'react';
import { Settings, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MaintenanceScreen({ config }) {
  const { title = 'Under Maintenance', description = 'We are performing scheduled maintenance. Please check back soon.', contactInfo = 'support@dawnfintech.com', buttonText = 'Contact Support' } = config || {};
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center', color: 'white' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '600px', background: 'rgba(255,255,255,0.03)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <Settings size={64} color="#C21B2F" style={{ marginBottom: '24px', animation: 'spin 4s linear infinite' }} />
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '16px' }}>{title}</h1>
        <p style={{ color: '#8a8aa0', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '32px' }}>{description}</p>
        
        {contactInfo && (
          <a href={`mailto:${contactInfo}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#C21B2F', color: 'white', padding: '14px 28px', borderRadius: '12px', textDecoration: 'none', fontWeight: '800' }}>
            <Mail size={20} /> {buttonText}
          </a>
        )}
      </motion.div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
