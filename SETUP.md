# 🚀 DAWN CAPITAL - Local Development Setup Guide

Complete step-by-step guide to get the entire DAWN CAPITAL platform running locally.

---

## 📋 Prerequisites

- **Node.js**: 18.0.0 or higher
- **MongoDB**: Local installation or Atlas cloud
- **Git**: For version control
- **Expo CLI**: For mobile development
- **Twilio Account**: Free trial or paid (for SMS)
- **Email Provider**: Gmail or AWS SES account

---

## Step 1: MongoDB Setup

### Option A: Local MongoDB

```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Linux
sudo apt-get install mongodb
sudo service mongodb start

# Windows
# Download from https://www.mongodb.com/try/download/community
# Run installer and start MongoDB service
```

### Option B: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/neera`

---

## Step 2: Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your credentials
# - MONGODB_URI
# - JWT_SECRET (generate random string)
# - Email credentials
# - Twilio credentials
```

### Generate JWT Secret

```bash
# macOS/Linux
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy the output to JWT_SECRET in .env
```

### Start Backend

```bash
npm run dev
# Should show: "Server running on port 5000"
```

### Test Backend

```bash
# In another terminal
curl http://localhost:5000/api/config
```

---

## Step 3: MongoDB Configuration Setup

Before starting the app, configure email/SMS in MongoDB:

```bash
# Open MongoDB Compass or use mongo shell
# Connect to your database
# Create or update SystemConfig:

db.systemconfigs.updateOne(
  { _id: ObjectId("default") },
  {
    $set: {
      emailGateway: {
        provider: "smtp",
        host: "smtp.gmail.com",
        port: 587,
        user: "your-email@gmail.com",
        pass: "your-app-password",
        fromEmail: "noreply@dawncapital.com"
      },
      smsGateway: {
        provider: "twilio",
        accountSid: "ACxxxxxx",
        authToken: "xxxxxx",
        fromNumber: "+1234567890"
      }
    }
  },
  { upsert: true }
)
```

---

## Step 4: Mobile App Setup

```bash
# Navigate to mobile
cd ../mobile

# Install dependencies
npm install

# Update machine IP in constants/Config.ts
# Edit LAN_IP with your actual IP address
```

### Find Your Machine IP

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# Look for 192.168.x.x or similar
```

**Windows:**
```bash
ipconfig
# Look for IPv4 Address under your network adapter
```

### Update Config

Edit `mobile/constants/Config.ts`:
```typescript
const LAN_IP = '192.168.1.100'; // Your actual machine IP
```

### Start Mobile App

```bash
# Terminal 1: Start Expo
npm run dev

# Or use:
npx expo start

# Scan QR code with:
# - Expo Go app on phone, OR
# - Press 'i' for iOS simulator, 'a' for Android emulator
```

---

## Step 5: Web Portal Setup

```bash
# Navigate to web portal
cd ../web-portal

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start development server
npm run dev
# Should show: http://localhost:5173
```

---

## Step 6: Test the Complete System

### 6.1 Admin Dashboard

1. Open browser: http://localhost:5173
2. Click "Admin" (or login as admin)
3. Default admin credentials (check backend seed data):
   ```
   Email: admin@dawncapital.com
   Password: admin123
   ```
4. Should see dashboard with loans, investments, users, etc.

### 6.2 Mobile App

1. Open Expo app or simulator
2. Login with test credentials
3. Navigate through app sections
4. Should NOT require OTP in dev mode (testing mode)

### 6.3 Test Notifications

**Create a test loan:**
1. Admin Dashboard → Applications tab
2. Create a new loan for a test customer
3. Approve the loan
4. Check:
   - ✅ In-app notification appears
   - ✅ Backend logs show notification created
   - ✅ Email sent (check backend logs)
   - ✅ SMS sent (check Twilio console)

---

## 📁 Project Structure Verification

```
dawn-capital/
├── backend/
│   ├── .env                    ✅ Created from .env.example
│   ├── server.js               ✅ Running on :5000
│   ├── utils/
│   │   ├── sendEmail.js       ✅ Email service
│   │   ├── sendSMS.js         ✅ Twilio SMS
│   │   └── notificationService.js ✅ Notification logic
│   └── package.json            ✅ Dependencies installed
│
├── mobile/
│   ├── constants/Config.ts     ✅ LAN_IP configured
│   ├── app/(auth)/login.tsx    ✅ OTP support added
│   └── package.json            ✅ Dependencies installed
│
├── web-portal/
│   ├── .env                    ✅ VITE_API_URL set
│   ├── src/pages/AdminCRM.jsx  ✅ Admin dashboard
│   └── package.json            ✅ Dependencies installed
│
├── README.md                   ✅ Project overview
├── FEATURES.md                 ✅ Feature documentation
├── GITHUB_SETUP.md            ✅ GitHub guide
└── .env.example               ✅ Environment template
```

---

## 🧪 Verification Checklist

- [ ] Backend running on port 5000
- [ ] MongoDB connected (check backend logs)
- [ ] Admin dashboard loads at localhost:5173
- [ ] Mobile app starts with Expo
- [ ] Can login to admin dashboard
- [ ] Can view loans, investments, users
- [ ] Loan approval triggers notification
- [ ] Email service configured (in .env)
- [ ] SMS service configured (in .env)
- [ ] OTP bypassed in mobile testing mode
- [ ] All three services running simultaneously

---

## 🔧 Troubleshooting

### Backend won't start

```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill the process using that port
kill -9 <PID>

# Check MongoDB connection
# Add console.log in server.js to debug
```

### Mobile app can't connect to backend

```bash
# 1. Verify LAN_IP in Config.ts matches your machine
# 2. Ensure backend is running on :5000
# 3. Check firewall settings (allow port 5000)
# 4. Try pinging your IP from phone
# 5. Check mobile console for exact error message
```

### Email/SMS not sending

```bash
# Check backend logs for:
# "Email sending skipped: No provider configured."

# Solution: Configure in MongoDB:
db.systemconfigs.updateOne(
  {},
  { $set: { emailGateway: {...}, smsGateway: {...} } },
  { upsert: true }
)
```

### Admin login fails

```bash
# Check backend database for admin user:
db.users.findOne({ email: "admin@dawncapital.com" })

# If not found, run seed script:
node seed.js
```

### Port conflicts

```bash
# Check what's using ports
lsof -i :5000   # Backend
lsof -i :5173   # Web portal
lsof -i :8081   # Expo (usually)

# Change port in code if needed:
# Backend: backend/server.js (PORT env var)
# Web: web-portal/vite.config.js
# Expo: npx expo start --port 8082
```

---

## 🚀 Running Everything

### Terminal 1: Backend
```bash
cd backend
npm run dev
```

### Terminal 2: Web Portal
```bash
cd web-portal
npm run dev
```

### Terminal 3: Mobile
```bash
cd mobile
npx expo start
```

### Browser
Open http://localhost:5173

---

## 📊 Monitoring

### Backend Logs
- API requests/responses
- Database queries
- Error stack traces
- Email/SMS delivery status
- Notification creation

### MongoDB
- Number of users
- Loan applications count
- Investment records
- Notification delivery status

### Expo
- App build status
- Network requests
- Warnings/errors

---

## 🔐 Security Notes for Development

⚠️ **NOT for production!**
- JWT secrets are exposed in .env
- Admin credentials are in seed.js
- CORS is open (development only)
- No rate limiting
- No request validation

**For production:**
- Use strong secrets
- Implement rate limiting
- Add request validation
- Enable CORS restrictions
- Use HTTPS only
- Add authentication to all endpoints

---

## 📞 Support Commands

```bash
# Clear all node_modules (nuclear option)
find . -name node_modules -type d -exec rm -rf {} +
npm install # in each directory

# Check Node version
node --version

# Check npm version
npm --version

# View backend logs in real-time
npm run dev 2>&1 | grep -E "error|warning|notification"

# Reset local MongoDB (if using local)
mongod --dbpath /path/to/data --drop
```

---

## ✅ You're Ready!

Your local development environment is now fully configured with:
- ✅ Backend API with notification system
- ✅ Mobile app with OTP support
- ✅ Web admin dashboard
- ✅ Email/SMS integration
- ✅ MongoDB persistence
- ✅ Real-time notifications

**Next Steps:**
1. Test all three apps
2. Create test data
3. Verify notifications work
4. Set up GitHub repository
5. Prepare for deployment

---

**Happy Development! 🎉**
