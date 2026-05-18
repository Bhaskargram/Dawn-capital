const Notification = require('../models/Notification');
const sendEmail = require('./sendEmail');
const sendSMS = require('./sendSMS');

/**
 * Create in-app notification and optionally send email/SMS
 */
const createNotification = async (userId, title, message, type = 'general', contactMethods = {}) => {
  try {
    // Create in-app notification
    const notification = new Notification({
      user: userId,
      title,
      message,
      type: type || 'general'
    });
    await notification.save();

    const User = require('../models/User');
    const user = await User.findById(userId).select('fcmTokens email phone');

    // Firebase FCM integration
    if (user && user.fcmTokens && user.fcmTokens.length > 0) {
      try {
        const admin = require('firebase-admin');
        const fcmPayload = {
          notification: { title, body: message },
          data: { type: type || 'general' }
        };
        // Clean up invalid tokens
        const response = await admin.messaging().sendEachForMulticast({ ...fcmPayload, tokens: user.fcmTokens });
        if (response.failureCount > 0) {
          const failedTokens = [];
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              if (resp.error.code === 'messaging/invalid-registration-token' ||
                  resp.error.code === 'messaging/registration-token-not-registered') {
                failedTokens.push(user.fcmTokens[idx]);
              }
            }
          });
          if (failedTokens.length > 0) {
            await User.findByIdAndUpdate(userId, { $pullAll: { fcmTokens: failedTokens } });
          }
        }
      } catch (fcmErr) {
        console.error('FCM send failed:', fcmErr.message);
      }
    }

    // Send email if enabled
    if (contactMethods.email || (user && user.email)) {
      const targetEmail = contactMethods.email || user.email;
      await sendEmail({
        to: targetEmail,
        subject: title,
        html: `<p>${message}</p>`
      }).catch(err => console.error('Email send failed:', err.message));
    }

    // Send SMS if enabled
    if (contactMethods.phone && contactMethods.sms) {
      await sendSMS({
        to: contactMethods.phone,
        body: `${title}: ${message}`
      }).catch(err => console.error('SMS send failed:', err.message));
    }

    return notification;
  } catch (err) {
    console.error('Notification creation error:', err.message);
    throw err;
  }
};

/**
 * Loan Status Notifications
 */
const notifyLoanApproved = async (userId, loanAmount, loanId, userEmail, userPhone) => {
  const title = '🎉 Loan Approved!';
  const message = `Your loan application for ₹${Number(loanAmount).toLocaleString()} (ID: ${loanId}) has been approved. Check your account for disbursement details.`;

  return createNotification(userId, title, message, 'loan_approved', {
    email: userEmail,
    phone: userPhone,
    sms: true
  });
};

const notifyLoanRejected = async (userId, loanId, reason, userEmail, userPhone) => {
  const title = '❌ Loan Application Rejected';
  const message = `Your loan application (ID: ${loanId}) has been rejected. Reason: ${reason || 'Application review complete'}. Please contact support for more information.`;

  return createNotification(userId, title, message, 'loan_rejected', {
    email: userEmail,
    phone: userPhone,
    sms: true
  });
};

const notifyLoanSubmitted = async (userId, loanAmount, loanId, userEmail, userPhone) => {
  const title = '📩 Loan Application Received';
  const message = `Your loan application for ₹${Number(loanAmount).toLocaleString()} (ID: ${loanId}) has been received. Our review team will contact you soon.`;

  return createNotification(userId, title, message, 'loan_submitted', {
    email: userEmail,
    phone: userPhone,
    sms: true
  });
};

const notifyLoanOverdue = async (userId, loanId, overdueAmount, userEmail, userPhone) => {
  const title = '⚠️ Loan Payment Overdue';
  const message = `Your loan (ID: ${loanId}) has an outstanding payment of ₹${Number(overdueAmount).toLocaleString()}. Please make the payment immediately to avoid penalties.`;

  return createNotification(userId, title, message, 'loan_overdue', {
    email: userEmail,
    phone: userPhone,
    sms: true
  });
};

/**
 * Investment Status Notifications
 */
const notifyInvestmentReceived = async (userId, investmentAmount, investmentType, userEmail, userPhone) => {
  const title = '✅ Investment Received';
  const message = `Your ${investmentType} investment of ₹${Number(investmentAmount).toLocaleString()} has been successfully received and is now active. You will earn regular interest.`;

  return createNotification(userId, title, message, 'investment_received', {
    email: userEmail,
    phone: userPhone,
    sms: true
  });
};

const notifyInvestmentRejected = async (userId, investmentType, reason, userEmail, userPhone) => {
  const title = '❌ Investment Not Processed';
  const message = `Your ${investmentType} investment could not be processed. Reason: ${reason || 'Review complete'}. Please try again or contact support.`;

  return createNotification(userId, title, message, 'investment_rejected', {
    email: userEmail,
    phone: userPhone,
    sms: true
  });
};

const notifyInvestmentMatured = async (userId, investmentAmount, maturityAmount, investmentType, userEmail, userPhone) => {
  const title = '🎊 Investment Matured';
  const message = `Your ${investmentType} investment of ₹${Number(investmentAmount).toLocaleString()} has matured. Total amount with interest: ₹${Number(maturityAmount).toLocaleString()}. Action needed to withdraw or reinvest.`;

  return createNotification(userId, title, message, 'investment_matured', {
    email: userEmail,
    phone: userPhone,
    sms: true
  });
};

/**
 * KYC Status Notifications
 */
const notifyKYCApproved = async (userId, userEmail, userPhone) => {
  const title = '✅ KYC Verified';
  const message = 'Your KYC verification has been approved! Your account now has full access to all features and investment options.';

  return createNotification(userId, title, message, 'kyc_approved', {
    email: userEmail,
    phone: userPhone,
    sms: true
  });
};

const notifyKYCRejected = async (userId, reason, userEmail, userPhone) => {
  const title = '❌ KYC Verification Failed';
  const message = `Your KYC verification was not approved. Reason: ${reason || 'Incomplete documentation'}. Please resubmit with correct documents.`;

  return createNotification(userId, title, message, 'kyc_rejected', {
    email: userEmail,
    phone: userPhone,
    sms: true
  });
};

const notifyKYCSubmitted = async (userId, userEmail, userPhone) => {
  const title = '📝 KYC Submitted';
  const message = 'Your KYC documents have been submitted successfully and are now under review. We will update you once verification is complete.';

  return createNotification(userId, title, message, 'kyc_submitted', {
    email: userEmail,
    phone: userPhone,
    sms: true
  });
};

/**
 * General Notifications
 */
const notifyGeneral = async (userId, title, message, userEmail, userPhone, sendSMS = false) => {
  return createNotification(userId, title, message, 'general', {
    email: userEmail,
    phone: userPhone,
    sms: sendSMS
  });
};

module.exports = {
  createNotification,
  notifyLoanApproved,
  notifyLoanRejected,
  notifyLoanSubmitted,
  notifyLoanOverdue,
  notifyInvestmentReceived,
  notifyInvestmentRejected,
  notifyInvestmentMatured,
  notifyKYCSubmitted,
  notifyKYCApproved,
  notifyKYCRejected,
  notifyGeneral
};
