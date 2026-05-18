import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Megaphone } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : `http://${window.location.hostname}:5000/api`);

export default function AnnouncementMarquee({ target = 'both' }) {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    axios.get(`${API}/public/announcements?target=${target}`)
      .then(res => setAnnouncements(res.data))
      .catch(err => console.error('Failed to load announcements', err));
  }, [target]);

  if (!announcements || announcements.length === 0) return null;

  return (
    <div style={{ background: 'linear-gradient(to right, #C21B2F, #a31525)', color: 'white', padding: '8px 20px', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 2, background: 'linear-gradient(to right, #C21B2F, #a31525)', paddingRight: '15px' }}>
        <Megaphone size={16} />
        <span style={{ fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Updates:</span>
      </div>
      
      <div className="marquee-container" style={{ flex: 1, overflow: 'hidden', position: 'relative', whiteSpace: 'nowrap' }}>
        <div className="marquee-content" style={{ display: 'inline-block' }}>
          {announcements.map((ann, idx) => (
            <span key={ann._id} style={{ marginRight: '50px', fontSize: '0.9rem' }}>
              <strong style={{ opacity: 0.9 }}>{ann.title}</strong>: {ann.message} 
              {ann.link && (
                <a href={ann.link} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'underline', marginLeft: '5px', fontWeight: 'bold' }}>
                  Learn More
                </a>
              )}
            </span>
          ))}
          {/* Duplicate for infinite scrolling effect */}
          {announcements.map((ann, idx) => (
            <span key={`${ann._id}-dup`} style={{ marginRight: '50px', fontSize: '0.9rem' }}>
              <strong style={{ opacity: 0.9 }}>{ann.title}</strong>: {ann.message} 
              {ann.link && (
                <a href={ann.link} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'underline', marginLeft: '5px', fontWeight: 'bold' }}>
                  Learn More
                </a>
              )}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        .marquee-content {
          animation: marquee 30s linear infinite;
        }
        .marquee-container:hover .marquee-content {
          animation-play-state: paused;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
