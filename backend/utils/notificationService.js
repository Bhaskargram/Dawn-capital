const Notification = require('../models/Notification');
const sendEmail = require('./sendEmail');

// ══════════ CORE NOTIFICATION ENGINE ══════════

/**
 * Create in-app notification, send FCM push, and optionally email
 */
const createNotification = async (userId, title, message, type = 'general', options = {}) => {
  try {
    const { email, phone, metadata = {}, actionUrl } = options;

    // 1. Create in-app notification
    const notification = new Notification({
      user: userId,
      title,
      message,
      type: type || 'general',
      metadata,
      actionUrl: actionUrl || null
    });
    await notification.save();

    // 2. Fetch user for FCM + email
    const User = require('../models/User');
    const user = await User.findById(userId).select('fcmTokens email phone name');

    // 3. Firebase FCM Push Notification
    if (user && user.fcmTokens && user.fcmTokens.length > 0) {
      try {
        const admin = require('firebase-admin');
        if (admin.apps.length > 0) {
          const fcmPayload = {
            notification: { title, body: message },
            data: {
              type: type || 'general',
              notificationId: notification._id.toString(),
              clickAction: actionUrl || type || 'dashboard'
            }
          };
          const response = await admin.messaging().sendEachForMulticast({
            ...fcmPayload,
            tokens: user.fcmTokens
          });
          // Clean up invalid tokens
          if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
              if (!resp.success) {
                if (resp.error?.code === 'messaging/invalid-registration-token' ||
                    resp.error?.code === 'messaging/registration-token-not-registered') {
                  failedTokens.push(user.fcmTokens[idx]);
                }
              }
            });
            if (failedTokens.length > 0) {
              await User.findByIdAndUpdate(userId, { $pullAll: { fcmTokens: failedTokens } });
            }
          }
        }
      } catch (fcmErr) {
        console.error('FCM send failed:', fcmErr.message);
      }
    }

    // 4. Send email notification (with professional template)
    const targetEmail = email || user?.email;
    if (targetEmail) {
      sendEmail({
        to: targetEmail,
        subject: title,
        type,
        vars: {
          userName: user?.name || 'Valued Customer',
          title,
          message,
          ...metadata
        }
      }).catch(err => console.error('Email send failed:', err.message));
    }

    return notification;
  } catch (err) {
    console.error('Notification creation error:', err.message);
    throw err;
  }
};

// ══════════ LOAN NOTIFICATIONS ══════════

const notifyLoanSubmitted = async (userId, loanAmount, loanId, userEmail) => {
  return createNotification(
    userId,
    '📩 Loan Application Received',
    `Your loan application for ₹${Number(loanAmount).toLocaleString('en-IN')} (ID: ${loanId}) has been received. Our review team will contact you soon.`,
    'loan_submitted',
    {
      email: userEmail,
      metadata: { loanId, amount: loanAmount },
      actionUrl: 'portfolio'
    }
  );
};

const notifyLoanApproved = async (userId, loanAmount, loanId, userEmail) => {
  return createNotification(
    userId,
    '🎉 Loan Approved!',
    `Your loan application for ₹${Number(loanAmount).toLocaleString('en-IN')} (ID: ${loanId}) has been approved. Check your account for disbursement details.`,
    'loan_approved',
    {
      email: userEmail,
      metadata: { loanId, amount: loanAmount, status: 'approved' },
      actionUrl: 'portfolio'
    }
  );
};

const notifyLoanRejected = async (userId, loanId, reason, userEmail) => {
  return createNotification(
    userId,
    '❌ Loan Application Rejected',
    `Your loan application (ID: ${loanId}) has been rejected. Reason: ${reason || 'Application review complete'}. Please contact support for more information.`,
    'loan_rejected',
    {
      email: userEmail,
      metadata: { loanId, reason: reason || 'Application criteria not met' },
      actionUrl: 'portfolio'
    }
  );
};

const notifyLoanOverdue = async (userId, loanId, overdueAmount, userEmail) => {
  return createNotification(
    userId,
    '⚠️ Loan Payment Overdue',
    `Your loan (ID: ${loanId}) has an outstanding payment of ₹${Number(overdueAmount).toLocaleString('en-IN')}. Please make the payment immediately to avoid penalties.`,
    'loan_overdue',
    {
      email: userEmail,
      metadata: { loanId, amount: overdueAmount },
      actionUrl: 'portfolio'
    }
  );
};

const notifyLoanPaymentStatus = async (userId, loanId, status, userEmail) => {
  return createNotification(
    userId,
    `💰 Loan Payment ${status}`,
    `Your loan (ID: ${loanId}) payment status has been updated to ${status}.`,
    'loan_payment_status',
    {
      email: userEmail,
      metadata: { loanId, status },
      actionUrl: 'portfolio'
    }
  );
};

// ══════════ INVESTMENT NOTIFICATIONS ══════════

const notifyInvestmentReceived = async (userId, investmentAmount, investmentType, userEmail) => {
  return createNotification(
    userId,
    '✅ Investment Received',
    `Your ${investmentType} investment of ₹${Number(investmentAmount).toLocaleString('en-IN')} has been successfully received and is now active.`,
    'investment_received',
    {
      email: userEmail,
      metadata: { amount: investmentAmount, investmentType },
      actionUrl: 'portfolio'
    }
  );
};

const notifyInvestmentRejected = async (userId, investmentType, reason, userEmail) => {
  return createNotification(
    userId,
    '❌ Investment Not Processed',
    `Your ${investmentType} investment could not be processed. Reason: ${reason || 'Review complete'}. Please try again or contact support.`,
    'investment_rejected',
    {
      email: userEmail,
      metadata: { investmentType, reason: reason || 'Review complete' },
      actionUrl: 'portfolio'
    }
  );
};

const notifyInvestmentMatured = async (userId, investmentAmount, maturityAmount, investmentType, userEmail) => {
  return createNotification(
    userId,
    '🎊 Investment Matured',
    `Your ${investmentType} investment of ₹${Number(investmentAmount).toLocaleString('en-IN')} has matured. Total amount: ₹${Number(maturityAmount).toLocaleString('en-IN')}.`,
    'investment_matured',
    {
      email: userEmail,
      metadata: { amount: investmentAmount, maturityAmount, investmentType },
      actionUrl: 'portfolio'
    }
  );
};

// ══════════ KYC NOTIFICATIONS ══════════

const notifyKYCSubmitted = async (userId, userEmail) => {
  return createNotification(
    userId,
    '📝 KYC Submitted',
    'Your KYC documents have been submitted successfully and are now under review. We will update you once verification is complete.',
    'kyc_submitted',
    {
      email: userEmail,
      actionUrl: 'kyc'
    }
  );
};

const notifyKYCApproved = async (userId, userEmail) => {
  return createNotification(
    userId,
    '✅ KYC Verified',
    'Your KYC verification has been approved! Your account now has full access to all features and investment options.',
    'kyc_approved',
    {
      email: userEmail,
      actionUrl: 'kyc'
    }
  );
};

const notifyKYCRejected = async (userId, reason, userEmail) => {
  return createNotification(
    userId,
    '❌ KYC Verification Failed',
    `Your KYC verification was not approved. Reason: ${reason || 'Incomplete documentation'}. Please resubmit with correct documents.`,
    'kyc_rejected',
    {
      email: userEmail,
      metadata: { reason: reason || 'Incomplete documentation' },
      actionUrl: 'kyc'
    }
  );
};

// ══════════ CREDIT SCORE NOTIFICATIONS ══════════

const notifyCreditScoreUpdate = async (userId, newScore, userEmail) => {
  const label = newScore >= 750 ? 'Excellent' : newScore >= 650 ? 'Good' : newScore >= 600 ? 'Fair' : 'Needs Improvement';
  return createNotification(
    userId,
    '📊 Credit Score Updated',
    `Your credit score has been updated to ${newScore} (${label}). Log in to view your full credit profile.`,
    'credit_score_update',
    {
      email: userEmail,
      metadata: { creditScore: newScore, label },
      actionUrl: 'credit-score'
    }
  );
};

// ══════════ ACCOUNT ACTIVITY NOTIFICATIONS ══════════

const notifyAccountActivity = async (userId, title, message, userEmail) => {
  return createNotification(
    userId,
    title,
    message,
    'account_activity',
    {
      email: userEmail,
      metadata: { message },
      actionUrl: 'dashboard'
    }
  );
};

// ══════════ GENERAL NOTIFICATIONS ══════════

const notifyGeneral = async (userId, title, message, userEmail) => {
  return createNotification(userId, title, message, 'general', {
    email: userEmail
  });
};

module.exports = {
  createNotification,
  notifyLoanApproved,
  notifyLoanRejected,
  notifyLoanSubmitted,
  notifyLoanOverdue,
  notifyLoanPaymentStatus,
  notifyInvestmentReceived,
  notifyInvestmentRejected,
  notifyInvestmentMatured,
  notifyKYCSubmitted,
  notifyKYCApproved,
  notifyKYCRejected,
  notifyCreditScoreUpdate,
  notifyAccountActivity,
  notifyGeneral
};
