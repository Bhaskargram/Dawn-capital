import React, { memo } from 'react';
import { motion } from 'framer-motion';

const CreditScoreMeter = memo(({ score = 0, lastUpdated }) => {
  const normalizedScore = Math.min(Math.max(score, 300), 850);
  const percentage = score === 0 ? 0 : ((normalizedScore - 300) / 550) * 100;
  
  // Color and label based on score
  let color = '#ef4444';
  let label = 'Poor';
  let bgGradient = 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02))';
  if (score === 0) { color = '#64748b'; label = 'N/A'; bgGradient = 'linear-gradient(135deg, rgba(100,116,139,0.08), rgba(100,116,139,0.02))'; }
  else if (score >= 750) { color = '#22c55e'; label = 'Excellent'; bgGradient = 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.02))'; }
  else if (score >= 650) { color = '#3b82f6'; label = 'Good'; bgGradient = 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.02))'; }
  else if (score >= 600) { color = '#fbbf24'; label = 'Fair'; bgGradient = 'linear-gradient(135deg, rgba(251,191,36,0.08), rgba(251,191,36,0.02))'; }

  // SVG Gauge Calculations
  const radius = 65;
  const strokeWidth = 12;
  const circumference = Math.PI * radius;
  const strokeDashoffset = score === 0 ? circumference : circumference - (percentage / 100) * circumference;

  // Gradient stops for the arc
  const gradientId = `scoreGrad-${score}`;

  return (
    <div style={{ 
      padding: '28px', 
      background: bgGradient,
      borderRadius: '20px', 
      border: `1px solid ${color}15`,
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      minWidth: '200px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '120px', height: '120px', borderRadius: '50%',
        background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
        filter: 'blur(20px)', pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', position: 'relative' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '0.5px' }}>Credit Score</h3>
        <div style={{ 
          padding: '3px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: '800', 
          textTransform: 'uppercase', letterSpacing: '1px',
          background: `${color}18`, color: color, border: `1px solid ${color}30`
        }}>
          {label}
        </div>
      </div>
      
      {score === 0 ? (
        <div style={{ padding: '24px 10px', textAlign: 'center' }}>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: '2.5rem', marginBottom: '12px' }}
          >
            📊
          </motion.div>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>No Score Available</div>
          <p style={{ color: '#64748b', fontSize: '0.75rem', lineHeight: '1.6', margin: 0 }}>
            Your credit score will be updated soon. We will notify you once available.
          </p>
        </div>
      ) : (
        <>
          <div style={{ position: 'relative', width: '170px', height: '90px', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
            <svg width="170" height="90" viewBox="0 0 170 90">
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="35%" stopColor="#fbbf24" />
                  <stop offset="65%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>
              {/* Background Arc */}
              <path
                d="M 10 80 A 75 75 0 0 1 160 80"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
              {/* Colored Arc */}
              <motion.path
                d="M 10 80 A 75 75 0 0 1 160 80"
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
              />
              {/* Needle indicator dot */}
              <motion.circle
                cx="85"
                cy="80"
                r="5"
                fill={color}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                style={{ filter: `drop-shadow(0 0 6px ${color})` }}
              />
            </svg>
            
            <div style={{ position: 'absolute', bottom: '0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                style={{ fontSize: '2.8rem', fontWeight: '900', color: '#fff', lineHeight: '1', textShadow: `0 0 20px ${color}40` }}
              >
                {score}
              </motion.div>
            </div>
          </div>

          {/* Score range labels */}
          <div style={{ marginTop: '16px', width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.5px' }}>
            <span style={{ color: '#ef4444' }}>300</span>
            <span style={{ color: '#fbbf24' }}>600</span>
            <span style={{ color: '#3b82f6' }}>700</span>
            <span style={{ color: '#22c55e' }}>850</span>
          </div>
          
          {lastUpdated && (
            <div style={{ marginTop: '12px', fontSize: '0.7rem', color: '#64748b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Updated: {new Date(lastUpdated).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          )}
        </>
      )}
    </div>
  );
});

export default CreditScoreMeter;
