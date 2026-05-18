const admin = require('firebase-admin');

// You can either use a serviceAccountKey.json file or environment variables
// For production, environment variables are safer

try {
  let serviceAccount = null;
  
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Attempt to parse JSON string from .env
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // Attempt to require the local file if it exists
    try {
      serviceAccount = require('../serviceAccountKey.json');
    } catch (e) {
      console.warn('FCM Setup Warning: No serviceAccountKey.json found and FIREBASE_SERVICE_ACCOUNT env var is missing. Push notifications will be disabled.');
    }
  }

  if (serviceAccount && admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully');
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error.message);
}

module.exports = admin;
