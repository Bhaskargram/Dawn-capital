const mongoose = require('mongoose');

const SystemConfigSchema = new mongoose.Schema({
  system_mode: {
    type: String,
    enum: ['production', 'testing'],
    default: 'testing'
  },
  maintenance: {
    enabled: { type: Boolean, default: false },
    title: { type: String, default: 'Under Maintenance' },
    description: { type: String, default: 'We are performing scheduled maintenance. Please check back soon.' },
    imageUrl: { type: String, default: '' },
    gifUrl: { type: String, default: '' },
    buttonText: { type: String, default: 'Contact Support' },
    contactInfo: { type: String, default: 'support@dawncapital.online' }
  },
  branding: {
    logoUrl: { type: String, default: '' },
    primaryColor: { type: String, default: '#C21B2F' },
    secondaryColor: { type: String, default: '#333333' },
    faviconUrl: { type: String, default: '' },
    companyName: { type: String, default: 'Dawn Capital' }
  },
  contact: {
    email: { type: String, default: 'support@dawncapital.online' },
    phone: { type: String, default: '+1234567890' },
    address: { type: String, default: '' },
    whatsapp: { type: String, default: '' }
  },
  features: {
    investments: { type: Boolean, default: true },
    loans: { type: Boolean, default: true },
    insurance: { type: Boolean, default: true },
    referrals: { type: Boolean, default: true },
    creditScore: { type: Boolean, default: true }
  },
  // Payment Gateway Configurations
  paymentGateways: {
    razorpay: {
      enabled: { type: Boolean, default: false },
      keyId: { type: String, default: '' },
      keySecret: { type: String, default: '' },
      testKeyId: { type: String, default: '' },
      testKeySecret: { type: String, default: '' }
    },
    cashfree: {
      enabled: { type: Boolean, default: false },
      appId: { type: String, default: '' },
      secretKey: { type: String, default: '' },
      testAppId: { type: String, default: '' },
      testSecretKey: { type: String, default: '' }
    },
    stripe: {
      enabled: { type: Boolean, default: false },
      publishableKey: { type: String, default: '' },
      secretKey: { type: String, default: '' },
      testPublishableKey: { type: String, default: '' },
      testSecretKey: { type: String, default: '' }
    },
    customProviders: [{
      name: { type: String, default: '' },
      providerKey: { type: String, default: '' },
      enabled: { type: Boolean, default: false },
      mode: { type: String, enum: ['testing', 'production'], default: 'testing' },
      publicKey: { type: String, default: '' },
      secretKey: { type: String, default: '' },
      webhookUrl: { type: String, default: '' },
      notes: { type: String, default: '' }
    }],
    bankAccount: {
      enabled: { type: Boolean, default: false },
      accountHolderName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      bankName: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      swiftCode: { type: String, default: '' },
      instructions: { type: String, default: '' }
    },
    upi: {
      enabled: { type: Boolean, default: false },
      upiId: { type: String, default: '' },
      recipientName: { type: String, default: '' },
      qrCodeUrl: { type: String, default: '' },
      instructions: { type: String, default: '' }
    }
  },
  // Email Notification Toggles
  emailNotifications: {
    enabled: { type: Boolean, default: true },
    types: {
      loan_submitted: { type: Boolean, default: true },
      loan_approved: { type: Boolean, default: true },
      loan_rejected: { type: Boolean, default: true },
      investment_received: { type: Boolean, default: true },
      investment_matured: { type: Boolean, default: true },
      kyc_submitted: { type: Boolean, default: true },
      kyc_approved: { type: Boolean, default: true },
      kyc_rejected: { type: Boolean, default: true },
      credit_score_update: { type: Boolean, default: true },
      account_activity: { type: Boolean, default: true },
      announcement: { type: Boolean, default: true }
    }
  },
  // Email Gateway Configuration
  emailGateway: {
    provider: { type: String, enum: ['none', 'smtp', 'sendgrid', 'mailgun', 'ses'], default: 'none' },
    smtpHost: { type: String, default: '' },
    smtpPort: { type: Number, default: 587 },
    smtpUser: { type: String, default: '' },
    smtpPass: { type: String, default: '' },
    sendgridApiKey: { type: String, default: '' },
    mailgunApiKey: { type: String, default: '' },
    mailgunDomain: { type: String, default: '' },
    fromEmail: { type: String, default: 'noreply@dawncapital.com' },
    fromName: { type: String, default: 'Dawn Capital' }
  },
  // SMS Gateway Configuration
  smsGateway: {
    provider: { type: String, enum: ['none', 'twilio', 'msg91', 'textlocal'], default: 'none' },
    twilioSid: { type: String, default: '' },
    twilioToken: { type: String, default: '' },
    twilioPhone: { type: String, default: '' },
    msg91AuthKey: { type: String, default: '' },
    msg91SenderId: { type: String, default: '' },
    textlocalApiKey: { type: String, default: '' },
    textlocalSender: { type: String, default: '' }
  },
  // WhatsApp Gateway
  whatsappGateway: {
    provider: { type: String, enum: ['none', 'twilio', 'wati', 'interakt'], default: 'none' },
    apiKey: { type: String, default: '' },
    phoneNumberId: { type: String, default: '' },
    businessAccountId: { type: String, default: '' }
  },
  // Landing page content
  landingPage: {
    heroTitle: { type: String, default: 'Institutional Precision. Global Reach.' },
    heroSubtitle: { type: String, default: 'Comprehensive financial solutions for individuals and enterprises.' },
    heroImageUrl: { type: String, default: '' },
    aboutUs: { type: String, default: 'Dawn Capital stands as a cornerstone of the global financial landscape.' },
    services: [{ title: String, description: String, icon: String }],
    faq: [{ question: String, answer: String }],
    ctaTitle: { type: String, default: 'Ready to Transform Your Financial Future?' },
    ctaSubtitle: { type: String, default: 'Join thousands of satisfied clients who trust Dawn Capital.' }
  },
  legals: {
    termsOfService: { type: String, default: 'Terms of Service...' },
    privacyPolicy: { type: String, default: 'Privacy Policy...' },
    disclaimer: { type: String, default: '' },
    refundPolicy: { type: String, default: '' }
  },
  // Social Media Links
  socialLinks: {
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' }
  }
}, { timestamps: true });

module.exports = mongoose.model('SystemConfig', SystemConfigSchema);
