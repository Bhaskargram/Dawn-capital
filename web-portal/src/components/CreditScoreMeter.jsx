import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

const CreditScoreMeter = memo(({ score = 0, lastUpdated }) => {
  // Score ranges: 300 - 850
  const normalizedScore = Math.min(Math.max(score, 300), 850);
  const percentage = score === 0 ? 0 : ((normalizedScore - 300) / 550) * 100;
  
  let color = '#ef4444'; // Poor
  let label = 'Poor';
  if (score === 0) { color = '#64748b'; label = 'N/A'; }
  else if (score >= 750) { color = '#22c55e'; label = 'Excellent'; }
  else if (score >= 650) { color = '#3b82f6'; label = 'Good'; }
  else if (score >= 600) { color = '#fbbf24'; label = 'Fair'; }

  // SVG Gauge Calculations
  const strokeWidth = 10;
  const radius = 60;
  const circumference = Math.PI * radius; // Semi-circle
  const strokeDashoffset = score === 0 ? circumference : circumference - (percentage / 100) * circumference;

  return (
    <div style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#fff', margin: 0 }}>Credit Score</h3>
        <Info size={16} color="#8a8aa0" />
      </div>
      
      {score === 0 ? (
        <div style={{ padding: '30px 10px', textAlign: 'center' }}>
          <div style={{ color: '#8a8aa0', fontSize: '0.9rem', marginBottom: '10px' }}>No Score Available</div>
          <p style={{ color: '#64748b', fontSize: '0.75rem', lineHeight: '1.5' }}>Your credit score will be updated soon. We will notify you once available.</p>
        </div>
      ) : (
        <>
          <div style={{ position: 'relative', width: '160px', height: '80px', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
            {/* Background Arc */}
            <svg width="160" height="80" viewBox="0 0 160 80">
              <path
                d="M 10 75 A 70 70 0 0 1 150 75"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
              {/* Foreground Arc */}
              <motion.path
                d="M 10 75 A 70 70 0 0 1 150 75"
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </svg>
            
            <div style={{ position: 'absolute', bottom: '5px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff', lineHeight: '1' }}>{score}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color, textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
            </div>
          </div>
          
          <div style={{ marginTop: '20px', width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#8a8aa0', fontWeight: '600' }}>
            <span>300</span>
            {lastUpdated && <span>Updated: {new Date(lastUpdated).toLocaleDateString()}</span>}
            <span>850</span>
          </div>
        </>
      )}
    </div>
  );
});

export default CreditScoreMeter;
