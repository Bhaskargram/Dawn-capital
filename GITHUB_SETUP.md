# GitHub Setup & Deployment Guide

## Step 1: Create a GitHub Repository

```bash
# Initialize git (if not already done)
cd '/home/bhaskar/Neera project/Dawn Multipurpose'
git init
```

## Step 2: Add All Files to Git

```bash
git add .

# Create .gitignore to exclude node_modules, env files, etc.
```

## Step 3: Create Initial Commit

```bash
git commit -m "Initial commit: Dawn Multipurpose Fintech Platform"
```

## Step 4: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `dawn-capital` (or your preferred name)
3. Description: "Dawn Multipurpose - Fintech Platform for Loans & Investments"
4. Choose: Public or Private
5. Do NOT initialize with README (we'll push our existing one)
6. Click "Create repository"

## Step 5: Connect Local to GitHub

Replace `YOUR_USERNAME` with your actual GitHub username:

```bash
git remote add origin https://github.com/YOUR_USERNAME/dawn-capital.git
git branch -M main
git push -u origin main
```

## Step 6: Add Protection Rules (Optional but Recommended)

On GitHub:
1. Go to Settings → Branches
2. Add rule for `main` branch
3. Require pull request reviews before merging
4. Require status checks to pass

## Project Structure in GitHub

```
dawn-capital/
├── backend/          # Node.js/Express server
├── mobile/           # Expo React Native app
├── web-portal/       # Vite React admin/customer portal
├── README.md         # Project overview
├── .gitignore        # Ignore files
└── SETUP.md          # Setup instructions
```

## Environment Variables Setup

### Backend (.env)

```bash
# Copy the template
cp backend/.env.example backend/.env

# Edit and add your credentials
nano backend/.env
```

### Mobile (app.json)

Update the API_URL in `mobile/constants/Config.ts`:

```typescript
const LAN_IP = 'your-machine-ip'; // For local testing
const getBaseUrl = () => {
  if (Platform.OS === 'web') return 'http://localhost:5000/api';
  return `http://${LAN_IP}:5000/api`;
};
```

### Web Portal (.env)

Create `web-portal/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

## Installation & Running

### Backend Setup

```bash
cd backend
npm install
npm run dev  # or node server.js
```

### Mobile Setup

```bash
cd mobile
npm install
npx expo start
```

### Web Portal Setup

```bash
cd web-portal
npm install
npm run dev
```

## Key Environment Variables to Configure

1. **MongoDB Connection**: MONGODB_URI
2. **Twilio**: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
3. **Email Provider**: Gmail/SendGrid/AWS SES credentials
4. **JWT Secret**: Strong random string
5. **Admin URLs**: For frontend redirects

## Deployment Options

### Backend
- Heroku, Railway, or Render
- Docker containerization recommended

### Mobile
- EAS Build for iOS/Android
- Expo Go for development

### Web Portal
- Vercel, Netlify, or similar
- Requires environment variables at build time

## Continuous Integration

Create `.github/workflows/deploy.yml` for automatic deployments on push to main.

## Security Best Practices

1. ✅ Never commit `.env` file to Git
2. ✅ Use environment variable secrets on GitHub
3. ✅ Enable branch protection
4. ✅ Regular dependency updates
5. ✅ Code review before merging

---

**Repository is now ready for collaboration and deployment!**
