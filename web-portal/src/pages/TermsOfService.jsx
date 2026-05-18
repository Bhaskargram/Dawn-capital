import React from 'react';

export default function TermsOfService() {
  return (
    <div style={{ background: '#0a0a0f', color: 'white', minHeight: '100vh', padding: '120px 20px' }}>
      <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', padding: '60px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>Terms of Service</h1>
        
        <div style={{ color: '#8a8aa0', lineHeight: '1.8' }}>
          <p style={{ marginBottom: '24px' }}>Last Updated: May 15, 2026</p>
          
          <h3 style={{ color: 'white', marginBottom: '16px', marginTop: '32px' }}>1. Acceptance of Terms</h3>
          <p style={{ marginBottom: '24px' }}>
            By accessing and using the Dawn Capital platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>

          <h3 style={{ color: 'white', marginBottom: '16px', marginTop: '32px' }}>2. Eligibility</h3>
          <p style={{ marginBottom: '24px' }}>
            To use our services, you must be at least 18 years old and have the legal capacity to enter into a binding agreement. You are responsible for ensuring that all information you provide is accurate and up-to-date.
          </p>

          <h3 style={{ color: 'white', marginBottom: '16px', marginTop: '32px' }}>3. Loan Applications</h3>
          <p style={{ marginBottom: '16px' }}>
            Submitting a loan application does not guarantee approval. Approvals are subject to our internal credit assessment and risk management policies.
          </p>
          <ul style={{ paddingLeft: '20px', marginBottom: '24px' }}>
            <li>Interest rates are determined based on your credit profile.</li>
            <li>Repayment schedules must be strictly followed.</li>
            <li>Defaulting on payments may lead to legal action and credit score impact.</li>
          </ul>

          <h3 style={{ color: 'white', marginBottom: '16px', marginTop: '32px' }}>4. User Conduct</h3>
          <p style={{ marginBottom: '24px' }}>
            You agree not to use our platform for any illegal activities, including fraud, money laundering, or unauthorized access to our systems.
          </p>

          <h3 style={{ color: 'white', marginBottom: '16px', marginTop: '32px' }}>5. Limitation of Liability</h3>
          <p style={{ marginBottom: '24px' }}>
            Dawn Capital shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services or inability to access the platform.
          </p>

          <h3 style={{ color: 'white', marginBottom: '16px', marginTop: '32px' }}>6. Modifications</h3>
          <p style={{ marginBottom: '24px' }}>
            We reserve the right to modify these terms at any time. Continued use of our services after such changes constitutes your acceptance of the new terms.
          </p>

          <div style={{ marginTop: '60px', padding: '30px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ color: 'white', marginBottom: '10px' }}>Legal Inquiries</h4>
            <p>For any legal matters, please reach out to legal@dawncapital.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
