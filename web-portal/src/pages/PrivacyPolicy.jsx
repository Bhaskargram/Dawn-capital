import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div style={{ background: '#0a0a0f', color: 'white', minHeight: '100vh', padding: '120px 20px' }}>
      <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', padding: '60px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>Privacy Policy</h1>
        
        <div style={{ color: '#8a8aa0', lineHeight: '1.8' }}>
          <p style={{ marginBottom: '24px' }}>Last Updated: May 15, 2026</p>
          
          <h3 style={{ color: 'white', marginBottom: '16px', marginTop: '32px' }}>1. Information We Collect</h3>
          <p style={{ marginBottom: '16px' }}>
            We collect information you provide directly to us, such as when you create an account, apply for a loan, or communicate with our support team. This may include:
          </p>
          <ul style={{ paddingLeft: '20px', marginBottom: '24px' }}>
            <li>Name, email address, and phone number</li>
            <li>Financial information and credit history</li>
            <li>Government-issued identification</li>
            <li>Employment and income details</li>
          </ul>

          <h3 style={{ color: 'white', marginBottom: '16px', marginTop: '32px' }}>2. How We Use Your Information</h3>
          <p style={{ marginBottom: '16px' }}>
            We use the information we collect to:
          </p>
          <ul style={{ paddingLeft: '20px', marginBottom: '24px' }}>
            <li>Process loan applications and assess creditworthiness</li>
            <li>Provide and improve our services</li>
            <li>Communicate with you about your account</li>
            <li>Prevent fraud and ensure security</li>
          </ul>

          <h3 style={{ color: 'white', marginBottom: '16px', marginTop: '32px' }}>3. Data Security</h3>
          <p style={{ marginBottom: '24px' }}>
            We implement industry-standard security measures to protect your personal information from unauthorized access, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
          </p>

          <h3 style={{ color: 'white', marginBottom: '16px', marginTop: '32px' }}>4. Sharing of Information</h3>
          <p style={{ marginBottom: '24px' }}>
            We do not sell your personal information. We may share your data with trusted partners (e.g., credit bureaus, payment processors) strictly for the purpose of providing our services.
          </p>

          <h3 style={{ color: 'white', marginBottom: '16px', marginTop: '32px' }}>5. Your Rights</h3>
          <p style={{ marginBottom: '24px' }}>
            You have the right to access, correct, or delete your personal information. Please contact our support team to exercise these rights.
          </p>

          <div style={{ marginTop: '60px', padding: '30px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ color: 'white', marginBottom: '10px' }}>Questions?</h4>
            <p>If you have any questions about this Privacy Policy, please contact us at privacy@dawncapital.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
