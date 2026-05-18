import React from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle, ArrowRight, Shield, Download, UserPlus, FileText, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HowToUse() {
  const pc = '#C21B2F';

  const steps = [
    {
      icon: <UserPlus size={32} color={pc} />,
      title: "Step 1: Create Account",
      desc: "Register with your basic details and verify your mobile number. It only takes 2 minutes."
    },
    {
      icon: <Shield size={32} color={pc} />,
      title: "Step 2: Complete KYC",
      desc: "Upload your identification documents for a secure and verified experience."
    },
    {
      icon: <FileText size={32} color={pc} />,
      title: "Step 3: Apply for Services",
      desc: "Choose from our range of loans or investment products and submit your application."
    },
    {
      icon: <Wallet size={32} color={pc} />,
      title: "Step 4: Get Funded",
      desc: "Once approved, funds are disbursed directly to your account or investment portfolio starts growing."
    }
  ];

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {/* Header Area */}
      <section style={{ background: '#111', color: 'white', padding: '100px 5%', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(circle at center, ${pc}20, transparent 70%)`, pointerEvents: 'none' }} />
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '20px' }}>Getting Started with Dawn</motion.h1>
        <p style={{ fontSize: '1.2rem', color: '#ccc', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>Your journey to financial freedom made simple. Follow these easy steps to get started with our platform.</p>
      </section>

      {/* Steps Section */}
      <section style={{ padding: '100px 5%', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
          {steps.map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ padding: '40px', borderRadius: '20px', backgroundColor: '#f8f9fa', border: '1px solid #eee', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-20px', left: '40px', width: '60px', height: '60px', borderRadius: '15px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
                {step.icon}
              </div>
              <div style={{ marginTop: '30px' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '15px', color: '#111' }}>{step.title}</h3>
                <p style={{ color: '#666', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Video / Visual Guide Placeholder */}
      <section style={{ padding: '80px 5%', backgroundColor: '#f0f2f5' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '20px' }}>Why Choose Us?</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                "100% Digital Process with zero paperwork",
                "Trusted by over 1.2 million happy customers",
                "Secure data encryption and privacy protection",
                "Instant approval and fast disbursals"
              ].map((text, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <CheckCircle size={24} color="#22c55e" />
                  <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ backgroundColor: '#111', borderRadius: '24px', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'linear-gradient(45deg, #111, #333)', opacity: 0.8 }} />
            <div style={{ zIndex: 1, textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: pc, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', cursor: 'pointer' }}>
                <Play size={32} color="white" fill="white" />
              </div>
              <span style={{ color: 'white', fontWeight: '700' }}>Watch Video Guide</span>
            </div>
          </div>
        </div>
      </section>

      {/* App Promotion */}
      <section style={{ padding: '100px 5%', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.8rem', fontWeight: '900', marginBottom: '20px' }}>Take Dawn Everywhere</h2>
        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '40px' }}>Download our mobile app for a seamless experience on the go.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <button style={{ padding: '16px 40px', borderRadius: '12px', backgroundColor: '#000', color: 'white', fontWeight: '700', border: 'none', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <Download size={20} /> App Store
          </button>
          <button style={{ padding: '16px 40px', borderRadius: '12px', backgroundColor: '#000', color: 'white', fontWeight: '700', border: 'none', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <Download size={20} /> Google Play
          </button>
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ padding: '80px 5%', background: pc, color: 'white', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '20px' }}>Ready to Begin?</h2>
        <Link to="/login?mode=signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '18px 48px', backgroundColor: 'white', color: pc, borderRadius: '50px', fontWeight: '800', textDecoration: 'none', fontSize: '1.2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          Get Started Now <ArrowRight size={24} />
        </Link>
      </section>
    </div>
  );
}
