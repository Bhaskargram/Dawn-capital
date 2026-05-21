# 🏛️ DAWN CAPITAL - Fintech Platform

A comprehensive fintech platform for loans and investments with mobile app, web admin panel, and customer portal.

## 📱 Project Overview

**DAWN CAPITAL** is an all-in-one financial services platform enabling users to:
- 📊 Apply for loans with instant approvals
- 💰 Invest in FDs and RDs
- 📈 Track portfolio performance
- 🏦 Receive real-time notifications
- 👨‍💼 KYC verification and compliance

---

## 🎯 Features

### Customer Mobile App
- ✅ Email/Phone-based authentication (OTP in production, bypass in testing)
- ✅ Complete KYC during registration
- ✅ View loan applications and status
- ✅ Check investment portfolio
- ✅ Real-time notifications for approvals/rejections
- ✅ Transaction history
- ✅ Dark mode UI

### Admin Web Dashboard
- ✅ Loan application management (approve/reject/overdue)
- ✅ Investment tracking and status updates
- ✅ User management and KYC verification
- ✅ Announcement management
- ✅ System configuration (email, SMS, gateways)
- ✅ Lead management
- ✅ Real-time notifications to customers

### Backend API
- ✅ Express.js REST API with JWT authentication
- ✅ Automated notifications for all status changes
- ✅ SMS integration (Twilio)
- ✅ Email integration (SMTP, AWS SES)
- ✅ MongoDB for data persistence
- ✅ Role-based access control (admin/customer)

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Email**: Nodemailer (SMTP, AWS SES)
- **SMS**: Twilio, AWS SNS

### Mobile
- **Framework**: Expo React Native
- **Language**: TypeScript
- **HTTP Client**: Axios
- **Storage**: Secure Store

### Web
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: CSS + Inline styles
- **UI Components**: Lucide React icons
- **Routing**: React Router v6
- **HTTP**: Axios

---

## 📂 Project Structure

```
dawn-capital/
│
├── 📁 backend/
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API endpoints
│   ├── controllers/         # Business logic
│   ├── middleware/          # Auth, validation
│   ├── utils/               # Email, SMS, notifications
│   ├── config/              # Database config
│   ├── server.js            # Express server
│   └── package.json
│
├── 📁 mobile/
│   ├── app/                 # Expo Router pages
│   │   ├── (auth)/          # Login, signup, OTP
│   │   └── (tabs)/          # Main app tabs
│   ├── components/          # Reusable components
│   ├── contexts/            # React contexts (Auth)
│   ├── constants/           # Config, colors, fonts
│   ├── hooks/               # Custom hooks
│   ├── app.json             # Expo config
│   └── package.json
│
├── 📁 web-portal/
│   ├── src/
│   │   ├── pages/           # Dashboard, admin, customer portals
│   │   ├── components/      # UI components
│   │   ├── assets/          # Images, icons
│   │   ├── App.jsx          # Main app component
│   │   ├── App.css          # Global styles
│   │   └── main.jsx         # Entry point
│   ├── vite.config.js
│   └── package.json
│
├── 📄 README.md             # This file
├── 📄 GITHUB_SETUP.md       # GitHub setup guide
└── 📄 SETUP.md              # Local development setup
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Expo CLI (`npm install -g expo-cli`)

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI, Twilio keys, email config

npm run dev
```

### Mobile App Setup

```bash
cd mobile
npm install

# Update LAN_IP in constants/Config.ts
npx expo start

# Scan QR code with Expo Go app or press 'i' for iOS / 'a' for Android
```

### Web Portal Setup

```bash
cd web-portal
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

npm run dev
```

---

## 🔑 Key Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP (production only)
- `POST /api/auth/forgot-password` - Password reset

### Loans
- `POST /api/admin/loans` - Create loan
- `PUT /api/admin/loans/:id/status` - Update loan status (triggers notification)
- `GET /api/admin/loans/all` - Get all loans
- `GET /api/portfolio` - Get user's loans

### Investments
- `POST /api/admin/investments` - Create investment (triggers notification)
- `PUT /api/admin/investments/:id/status` - Update investment status
- `GET /api/admin/investments/all` - Get all investments
- `GET /api/portfolio` - Get user's investments

### Notifications
- `GET /api/me/notifications` - Get user's notifications
- `POST /api/admin/notifications` - Send notification

### Users & KYC
- `GET /api/users` - Get all users
- `PUT /api/admin/users/:id` - Update user (triggers KYC notifications)

---

## 🔔 Notification System

### Auto-Triggered Notifications

When an admin updates a loan/investment/KYC status, the system automatically:
1. Creates an in-app notification in the database
2. Sends an email (if configured)
3. Sends an SMS via Twilio (if configured)

**Notification Types:**
- `loan_approved` - Loan approved with disbursement details
- `loan_rejected` - Loan rejected with reason
- `loan_overdue` - Payment overdue alert
- `investment_received` - Investment successfully received
- `investment_rejected` - Investment not processed
- `investment_matured` - Investment matured, action needed
- `kyc_approved` - KYC verified, full access granted
- `kyc_rejected` - KYC failed, resubmit required

---

## 📱 Mobile App Features

### Testing vs Production Mode

**Testing Mode** (`__DEV__ = true`):
- ✅ OTP login is **bypassed**
- ✅ Quick testing without phone verification
- ✅ Warning message shown in UI

**Production Mode** (`__DEV__ = false`):
- ✅ OTP required for all logins
- ✅ SMS sent via Twilio
- ✅ Secure phone-based authentication

### User Registration Flow

1. Email and password
2. Phone number and address
3. KYC details:
   - PAN number
   - Aadhaar number
   - Date of birth
   - Occupation
   - Annual income
   - Nominee details

4. Account created
5. Await admin KYC verification

---

## 🛡️ Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with Bcrypt
- ✅ Role-based access control (admin/customer)
- ✅ Protected API routes with middleware
- ✅ Secure token storage (Expo SecureStore)
- ✅ HTTPS-ready for production
- ✅ Environment variable isolation

---

## 📝 Environment Configuration

### Backend (.env)

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/neera
JWT_SECRET=your-strong-secret-key
PORT=5000

# Email (Twilio SendGrid, AWS SES, or Gmail SMTP)
EMAIL_PROVIDER=smtp
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# SMS (Twilio or AWS SNS)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Mobile (constants/Config.ts)

```typescript
const LAN_IP = '192.168.1.4';  // Your machine's IP for testing
export const IS_TESTING_MODE = __DEV__; // Bypass OTP in dev
```

### Web Portal (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Deployment

### Backend (Heroku/Railway)
```bash
git push heroku main
```

### Mobile (EAS Build)
```bash
eas build --platform ios
eas build --platform android
```

### Web Portal (Vercel)
```bash
vercel deploy --prod
```

---

## 📊 Loan ID Generation

Loan IDs are automatically generated with the **DAWN** prefix:
- Format: `DAWN-LN-1001`, `DAWN-LN-1002`, etc.
- Unique sequential numbering
- Fallback to timestamp if count fails

---

## 🐛 Known Issues & Fixes Applied

✅ Fixed: Admin panel lint errors
✅ Fixed: Loan status update notifications
✅ Fixed: Investment creation notifications
✅ Fixed: KYC approval/rejection alerts
✅ Fixed: Mobile OTP bypass in testing mode
✅ Fixed: Backend syntax validation

## 🔁 Recent Updates (21 May 2026)

Summary of changes applied during the current sprint:
- Standardised currency display to Indian Rupee (₹) and used `toLocaleString('en-IN')` for formatting across mobile and web where updated.
- Prevented negative/`-` displays for loan liabilities in UI components (show positive liability values instead).
- Removed Clerk integration remnants and restored traditional email/password auth (cleanup of pages and server utils completed earlier).
- Fixed backend loan save hook and corrected non-blocking notification dispatch on loan events.

Files updated in this pass (representative):
- mobile/app/(tabs)/loans.tsx
- mobile/app/(tabs)/index.tsx
- mobile/app/(tabs)/profile.tsx
- mobile/app/(tabs)/investments.tsx
- web-portal/src/pages/CustomerPortal.jsx
- web-portal/src/pages/AdminCRM.jsx

Remaining work / recommended follow-ups:
- Sweep the repo for any remaining `$` currency strings and convert to INR formatting (e.g. `web-portal/src/pages/LandingPage.jsx`, `web-portal/src/pages/AboutUs.jsx` found in a quick scan).
- Run the web and mobile dev servers and manually verify pages with loans/investments for correct formatting and no negative values.
- Run unit/integration tests (if available) and fix any regressions.
- Commit and push the branch, then run CI to validate changes.

If you want, I can run a repo-wide search and apply remaining currency fixes automatically, then run the dev servers and report back.

---

## 📞 Support

For setup issues or questions:
1. Check environment variables (.env files)
2. Ensure MongoDB is running
3. Verify Twilio/email credentials
4. Check console logs for error messages
5. Restart all services after config changes

---

## 📄 License

ISC

---

## 👨‍💻 Development

**Last Updated**: May 21, 2026

### Contributors
- Backend: Notification system, Twilio/Email integration
- Mobile: OTP authentication, Testing mode
- Web: Admin dashboard, Bug fixes

---

**Ready to launch DAWN CAPITAL! 🚀**
