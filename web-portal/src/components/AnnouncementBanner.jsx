import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X, Megaphone } from 'lucide-react';

const API = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : `http://${window.location.hostname}:5000/api`;

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get(`${API}/config`);
        if (res.data.activeAnnouncements && res.data.activeAnnouncements.length > 0) {
          const storedDismissed = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]');
          setDismissed(storedDismissed);
          setAnnouncements(res.data.activeAnnouncements.filter(a => !storedDismissed.includes(a._id)));
        }
      } catch (err) {
        console.error('Failed to fetch announcements', err);
      }
    };
    fetchAnnouncements();
  }, []);

  const handleDismiss = (id) => {
    const newDismissed = [...dismissed, id];
    setDismissed(newDismissed);
    localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed));
    setAnnouncements(announcements.filter(a => a._id !== id));
  };

  if (announcements.length === 0) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
      <AnimatePresence>
        {announcements.map((a, index) => {
          let bgColor = '#1e3a8a'; // info
          let icon = <Info size={18} />;
          if (a.type === 'warning') { bgColor = '#b45309'; icon = <AlertCircle size={18} />; }
          if (a.type === 'danger') { bgColor = '#9f1239'; icon = <Megaphone size={18} />; }
          if (a.type === 'success') { bgColor = '#14532d'; icon = <CheckCircle size={18} />; }

          return (
            <motion.div
              key={a._id}
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ delay: index * 0.1, type: 'spring', stiffness: 120, damping: 14 }}
              style={{
                background: bgColor,
                color: 'white',
                padding: '12px 24px',
                borderRadius: '0 0 16px 16px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                maxWidth: '600px',
                marginBottom: '8px',
                pointerEvents: 'auto',
                border: '1px solid rgba(255,255,255,0.1)',
                borderTop: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '50%' }}>
                {icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{a.title}</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{a.message}</div>
              </div>
              <button 
                onClick={() => handleDismiss(a._id)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex' }}
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
