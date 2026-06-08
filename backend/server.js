require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect Database
connectDB();

// Init Firebase Admin
require('./config/firebase');

const app = express();

// Init Middleware — Allow ALL origins for mobile + web
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization'],
  credentials: true
}));
app.use(express.json({ extended: false, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Request logger for debugging 404s
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Define Routes
app.get('/', (req, res) => res.send('Dawn API Running'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/config', require('./routes/config'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/public', require('./routes/public'));
app.use('/api/admin', require('./routes/adminOps'));
app.use('/api/achievers', require('./routes/achievers'));
app.use('/api/me', require('./routes/me'));
app.use('/api/admin/accounting', require('./routes/accounting'));

const PORT = process.env.PORT || 5000;

// Bind to 0.0.0.0 so mobile devices on LAN can reach it
app.listen(PORT, '0.0.0.0', () => console.log(`Server started on port ${PORT} (accessible on all interfaces)`));
