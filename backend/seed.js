require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const SystemConfig = require('./models/SystemConfig');

const seedDB = async () => {
  await connectDB();

  try {
    // 1. Create Default Admin User
    const adminExists = await User.findOne({ email: 'admin@dawn.com' });
    if (!adminExists) {
      const admin = new User({
        name: 'Super Admin',
        email: 'admin@dawn.com',
        password: 'password123', // Will be hashed by pre-save hook
        role: 'admin'
      });
      await admin.save();
      console.log('Default Admin User Created (admin@dawn.com / password123)');
    } else {
      console.log('Admin already exists.');
    }

    // 2. Setup Premium Landing Page Defaults (Stitch Design System aligned)
    const landingConfig = {
      heroTitle: 'Institutional Precision. Global Reach.',
      heroSubtitle: 'Comprehensive financial solutions for individuals and enterprises. We combine institutional precision with a global vision to secure your legacy.',
      aboutUs: 'Dawn Multipurpose stands as a cornerstone of the global financial landscape. As a leading financial holding company, we provide diverse solutions across sectors including housing finance, asset management, life insurance, and advisory services. Our approach is rooted in precision and transparency, serving a sophisticated clientele of institutional investors and high-net-worth individuals.',
      services: [
        { title: 'Housing Finance', description: 'Strategic capital solutions for premium real estate acquisitions and developments.', icon: 'Home' },
        { title: 'Asset Management', description: 'Expert portfolio optimization focused on long-term capital preservation and growth.', icon: 'TrendingUp' },
        { title: 'Life Insurance', description: 'Comprehensive protection strategies tailored for complex estate planning requirements.', icon: 'Shield' },
        { title: 'Advisory Services', description: 'Institutional-grade strategic consulting for mergers and corporate restructures.', icon: 'Briefcase' }
      ],
      faq: [
        { question: 'How do I start an investment with Dawn Multipurpose?', answer: 'You can begin by creating a customer account through our portal. Once registered, your dedicated advisor will help you explore FD, RD, and other investment vehicles tailored to your risk profile.' },
        { question: 'What are the current interest rates for Fixed Deposits?', answer: 'Our FD rates are competitive and vary between 6.5% to 8.2% APY depending on the tenure and amount. Contact your advisor or check your dashboard for the latest personalized rates.' },
        { question: 'How can I track my portfolio performance?', answer: 'Once logged in, your Customer Dashboard provides a real-time view of your net worth, active investments, loan obligations, and credit score — all in one place.' },
        { question: 'Is my data secure with Dawn Multipurpose?', answer: 'Absolutely. We use bank-grade encryption (AES-256), JWT-based authentication, and follow strict data privacy protocols compliant with RBI and international standards.' }
      ]
    };

    let config = await SystemConfig.findOne();
    if (config) {
      config.landingPage = landingConfig;
      config.branding.primaryColor = '#C21B2F';
      config.contact = {
        email: 'contact@dawncapital.com',
        phone: '+1 (800) DAWN-MULTI'
      };
      await config.save();
      console.log('Updated SystemConfig with Stitch Premium Theme');
    } else {
      await SystemConfig.create({
        landingPage: landingConfig,
        branding: { primaryColor: '#C21B2F' },
        contact: { email: 'contact@dawncapital.com', phone: '+1 (800) DAWN-MULTI' }
      });
      console.log('Created new SystemConfig with Stitch Premium Theme');
    }

    console.log('Seeding Complete. Exiting...');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
