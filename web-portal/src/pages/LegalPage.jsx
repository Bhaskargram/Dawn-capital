import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function LegalPage({ type }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  const API = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : `http://${window.location.hostname}:5000/api`;

  useEffect(() => {
    axios.get(`${API}/config`)
      .then(res => {
        if (type === 'terms') {
          setContent(res.data?.legals?.termsOfService || 'Terms of Service not found.');
        } else {
          setContent(res.data?.legals?.privacyPolicy || 'Privacy Policy not found.');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load config", err);
        setContent('Error loading content.');
        setLoading(false);
      });
  }, [type, API]);

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>Loading...</div>;

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', color: '#333' }}>
      <nav style={{ padding: '20px 5%', backgroundColor: '#ffffff', borderBottom: '1px solid #eee' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#C21B2F', fontWeight: 'bold' }}>&larr; Back to Home</Link>
      </nav>
      <div className="legal-content-card" style={{ maxWidth: '800px', margin: '50px auto', padding: '40px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h1 style={{ marginBottom: '30px', color: '#C21B2F' }}>
          {type === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
        </h1>
        <div style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
          {content}
        </div>
      </div>
    </div>
  );
}
