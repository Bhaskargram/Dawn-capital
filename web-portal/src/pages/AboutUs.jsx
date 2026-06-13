import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Target, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutUs() {
  return (
    <div style={{ background: '#0a0a0f', color: 'white', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={{ padding: '120px 20px 80px', textAlign: 'center', background: 'radial-gradient(circle at top, rgba(194, 27, 47, 0.15) 0%, transparent 70%)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '24px', letterSpacing: '-0.02em' }}
          >
            Empowering Your <span style={{ color: '#C21B2F' }}>Financial Future</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ fontSize: '1.25rem', color: '#8a8aa0', maxWidth: '700px', margin: '0 auto', lineHeight: '1.7' }}
          >
            Dawn Multipurpose is a premier financial technology firm dedicated to providing accessible, transparent, and innovative lending solutions for everyone.
          </motion.p>
        </div>
      </section>

      {/* Values Section */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', background: 'rgba(194, 27, 47, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#C21B2F' }}>
                <Shield size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px' }}>Trust & Security</h3>
              <p style={{ color: '#8a8aa0', lineHeight: '1.6' }}>Your data and financial security are our top priorities. We use enterprise-grade encryption for all transactions.</p>
            </div>
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', background: 'rgba(194, 27, 47, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#C21B2F' }}>
                <Users size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px' }}>Customer First</h3>
              <p style={{ color: '#8a8aa0', lineHeight: '1.6' }}>We build our products around your needs, ensuring a seamless experience from application to approval.</p>
            </div>
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', background: 'rgba(194, 27, 47, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#C21B2F' }}>
                <Target size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px' }}>Innovation</h3>
              <p style={{ color: '#8a8aa0', lineHeight: '1.6' }}>Leveraging advanced AI and data analytics to provide fair credit scoring and faster processing times.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section style={{ padding: '100px 20px', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '80px', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '24px' }}>Our Story</h2>
            <p style={{ color: '#8a8aa0', marginBottom: '20px', fontSize: '1.1rem' }}>
              Founded in 2023, Dawn Multipurpose emerged from a simple observation: traditional banking was too slow and often inaccessible to those who needed it most.
            </p>
            <p style={{ color: '#8a8aa0', marginBottom: '32px', fontSize: '1.1rem' }}>
              We've since helped thousands of individuals and small businesses secure the funding they need to grow, thrive, and achieve their dreams. Our platform is built for speed, fairness, and simplicity.
            </p>
            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
              <div><div style={{ fontSize: '2rem', fontWeight: '800', color: '#C21B2F' }}>50k+</div><div style={{ color: '#8a8aa0' }}>Users</div></div>
              <div><div style={{ fontSize: '2rem', fontWeight: '800', color: '#C21B2F' }}>$100M+</div><div style={{ color: '#8a8aa0' }}>Disbursed</div></div>
              <div><div style={{ fontSize: '2rem', fontWeight: '800', color: '#C21B2F' }}>4.8/5</div><div style={{ color: '#8a8aa0' }}>Rating</div></div>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '100%', height: '400px', background: 'linear-gradient(135deg, #C21B2F 0%, #1a1a2e 100%)', borderRadius: '24px', opacity: 0.8 }} />
            <div style={{ position: 'absolute', top: '20px', left: '20px', right: '-20px', bottom: '-20px', border: '1px solid #C21B2F', borderRadius: '24px', zIndex: -1 }} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 20px', textAlign: 'center' }}>
        <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 40px', background: 'linear-gradient(135deg, rgba(194, 27, 47, 0.1) 0%, rgba(26, 26, 46, 0.1) 100%)' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '16px' }}>Join the Financial Revolution</h2>
          <p style={{ color: '#8a8aa0', marginBottom: '32px', fontSize: '1.1rem' }}>Experience the future of lending today with Dawn Multipurpose.</p>
          <Link to="/login?mode=signup" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            Get Started Now <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
