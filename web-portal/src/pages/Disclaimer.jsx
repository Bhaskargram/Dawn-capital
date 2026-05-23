import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Disclaimer() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API_URL || 'https://api.dawncapital.online/api';

  useEffect(() => {
    axios.get(`${API}/config`)
      .then(res => setContent(res.data?.legals?.disclaimer || 'Disclaimer content not found.'))
      .catch(err => {
        console.error(err);
        setContent('Error loading content.');
      })
      .finally(() => setLoading(false));
  }, [API]);

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', color: 'white' }}>Loading...</div>;

  return (
    <div style={{ background: '#0a0a0f', color: 'white', minHeight: '100vh', padding: '20px 20px 80px' }}>
      <nav style={{ padding: '20px 0' }}>
        <Link to="/" style={{ color: '#C21B2F', fontWeight: '700', textDecoration: 'none' }}>&larr; Back to Home</Link>
      </nav>
      <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto', padding: '50px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '30px', color: '#C21B2F' }}>Disclaimer</h1>
        <div style={{ lineHeight: '1.8', color: '#d1d5db', whiteSpace: 'pre-wrap' }}>
          {content}
        </div>
      </div>
    </div>
  );
}
