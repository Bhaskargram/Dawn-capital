const nodemailer = require('nodemailer');
const SystemConfig = require('../models/SystemConfig');

// ══════════ EMAIL TEMPLATES ══════════

const buildBaseTemplate = (config, bodyContent) => {
  const primaryColor = config?.branding?.primaryColor || '#C21B2F';
  const logoUrl = config?.branding?.logoUrl || 'https://dawnlogos.s3.amazonaws.com/dawn6.png';
  const companyName = config?.branding?.companyName || 'Dawn Multipurpose';
  const year = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:'Segoe UI','Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table cellpadding="0" cellspacing="0" width="100%" style="max-width:620px;margin:0 auto;">
    <!-- Header -->
    <tr>
      <td style="background:linear-gradient(135deg,#0a0a14 0%,#1a1a2e 100%);padding:32px 30px;text-align:center;border-radius:16px 16px 0 0;">
        <img src="${logoUrl}" alt="${companyName}" style="max-height:48px;width:auto;" />
      </td>
    </tr>
    <!-- Accent Bar -->
    <tr><td style="height:4px;background:linear-gradient(90deg,${primaryColor},#ff6b6b,${primaryColor});"></td></tr>
    <!-- Body -->
    <tr>
      <td style="background:#ffffff;padding:40px 36px;color:#1a1a2e;line-height:1.7;font-size:15px;">
        ${bodyContent}
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="background:#f8fafc;padding:24px 30px;text-align:center;border-radius:0 0 16px 16px;border-top:1px solid #e2e8f0;">
        <p style="margin:0 0 8px;color:#64748b;font-size:13px;">Need help? Contact us at <a href="mailto:support@dawncapital.online" style="color:${primaryColor};text-decoration:none;font-weight:600;">support@dawncapital.online</a></p>
        <p style="margin:0;color:#94a3b8;font-size:12px;">&copy; ${year} ${companyName}. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

const emailTemplates = {
  loan_submitted: (vars) => `
    <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:22px;">📩 Loan Application Received</h2>
    <p>Dear <strong>${vars.userName}</strong>,</p>
    <p>Your loan application has been successfully submitted and is under review.</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f8fafc;border-radius:12px;overflow:hidden;">
      <tr><td style="padding:14px 20px;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;">Loan ID</td><td style="padding:14px 20px;font-weight:700;color:#1a1a2e;">${vars.loanId || '—'}</td></tr>
      <tr style="border-top:1px solid #e2e8f0;"><td style="padding:14px 20px;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;">Amount</td><td style="padding:14px 20px;font-weight:700;color:#1a1a2e;">₹${vars.amount ? Number(vars.amount).toLocaleString('en-IN') : '—'}</td></tr>
      <tr style="border-top:1px solid #e2e8f0;"><td style="padding:14px 20px;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;">Status</td><td style="padding:14px 20px;"><span style="background:#fef3c7;color:#92400e;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;">PENDING REVIEW</span></td></tr>
    </table>
    <p style="color:#64748b;">Our team will review your application and update you within 24-48 hours.</p>`,

  loan_approved: (vars) => `
    <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:22px;">🎉 Loan Approved!</h2>
    <p>Dear <strong>${vars.userName}</strong>,</p>
    <p>Great news! Your loan application has been <strong style="color:#16a34a;">approved</strong>.</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f0fdf4;border-radius:12px;overflow:hidden;border:1px solid #bbf7d0;">
      <tr><td style="padding:14px 20px;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;">Loan ID</td><td style="padding:14px 20px;font-weight:700;color:#1a1a2e;">${vars.loanId || '—'}</td></tr>
      <tr style="border-top:1px solid #bbf7d0;"><td style="padding:14px 20px;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;">Approved Amount</td><td style="padding:14px 20px;font-weight:700;color:#16a34a;font-size:18px;">₹${vars.amount ? Number(vars.amount).toLocaleString('en-IN') : '—'}</td></tr>
      <tr style="border-top:1px solid #bbf7d0;"><td style="padding:14px 20px;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;">Status</td><td style="padding:14px 20px;"><span style="background:#dcfce7;color:#166534;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;">APPROVED</span></td></tr>
    </table>
    <p>Log in to your dashboard to view disbursement details and repayment schedule.</p>`,

  loan_rejected: (vars) => `
    <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:22px;">❌ Loan Application Update</h2>
    <p>Dear <strong>${vars.userName}</strong>,</p>
    <p>We regret to inform you that your loan application could not be approved at this time.</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#fef2f2;border-radius:12px;overflow:hidden;border:1px solid #fecaca;">
      <tr><td style="padding:14px 20px;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;">Loan ID</td><td style="padding:14px 20px;font-weight:700;color:#1a1a2e;">${vars.loanId || '—'}</td></tr>
      <tr style="border-top:1px solid #fecaca;"><td style="padding:14px 20px;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;">Reason</td><td style="padding:14px 20px;color:#dc2626;font-weight:600;">${vars.reason || 'Application criteria not met'}</td></tr>
    </table>
    <p style="color:#64748b;">You may reapply after addressing the above. Contact support for assistance.</p>`,

  loan_payment_status: (vars) => `
    <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:22px;">💰 Loan Payment ${vars.status}</h2>
    <p>Dear <strong>${vars.userName}</strong>,</p>
    <p>Your loan payment status has been updated to <strong>${vars.status}</strong>.</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f8fafc;border-radius:12px;overflow:hidden;">
      <tr><td style="padding:14px 20px;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;">Loan ID</td><td style="padding:14px 20px;font-weight:700;color:#1a1a2e;">${vars.loanId || '—'}</td></tr>
    </table>
    <p style="color:#64748b;">Log in to your dashboard to view the full details.</p>`,

  investment_received: (vars) => `
    <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:22px;">✅ Investment Confirmed</h2>
    <p>Dear <strong>${vars.userName}</strong>,</p>
    <p>Your investment has been successfully recorded and is now active.</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f0fdf4;border-radius:12px;overflow:hidden;border:1px solid #bbf7d0;">
      <tr><td style="padding:14px 20px;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;">Type</td><td style="padding:14px 20px;font-weight:700;color:#1a1a2e;">${vars.investmentType || 'Fixed Deposit'}</td></tr>
      <tr style="border-top:1px solid #bbf7d0;"><td style="padding:14px 20px;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;">Amount</td><td style="padding:14px 20px;font-weight:700;color:#16a34a;font-size:18px;">₹${vars.amount ? Number(vars.amount).toLocaleString('en-IN') : '—'}</td></tr>
    </table>
    <p>Track your investment growth from your dashboard.</p>`,

  investment_matured: (vars) => `
    <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:22px;">🎊 Investment Matured!</h2>
    <p>Dear <strong>${vars.userName}</strong>,</p>
    <p>Your ${vars.investmentType || 'investment'} has reached maturity.</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#fffbeb;border-radius:12px;overflow:hidden;border:1px solid #fde68a;">
      <tr><td style="padding:14px 20px;color:#64748b;font-size:13px;font-weight:600;">Principal</td><td style="padding:14px 20px;font-weight:700;">₹${vars.amount ? Number(vars.amount).toLocaleString('en-IN') : '—'}</td></tr>
      <tr style="border-top:1px solid #fde68a;"><td style="padding:14px 20px;color:#64748b;font-size:13px;font-weight:600;">Maturity Amount</td><td style="padding:14px 20px;font-weight:700;color:#16a34a;font-size:18px;">₹${vars.maturityAmount ? Number(vars.maturityAmount).toLocaleString('en-IN') : '—'}</td></tr>
    </table>
    <p>Log in to withdraw or reinvest your returns.</p>`,

  kyc_submitted: (vars) => `
    <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:22px;">📝 KYC Documents Received</h2>
    <p>Dear <strong>${vars.userName}</strong>,</p>
    <p>Your KYC documents have been submitted successfully and are now under review. We will notify you once the verification is complete.</p>
    <p style="color:#64748b;font-size:13px;">This usually takes 1-3 business days.</p>`,

  kyc_approved: (vars) => `
    <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:22px;">✅ KYC Verified!</h2>
    <p>Dear <strong>${vars.userName}</strong>,</p>
    <p>Congratulations! Your KYC verification is <strong style="color:#16a34a;">approved</strong>. You now have full access to all features including investments and loans.</p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;text-align:center;margin:20px 0;">
      <span style="font-size:36px;">✅</span>
      <p style="margin:10px 0 0;font-weight:700;color:#166534;font-size:16px;">Account Fully Verified</p>
    </div>`,

  kyc_rejected: (vars) => `
    <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:22px;">❌ KYC Verification Failed</h2>
    <p>Dear <strong>${vars.userName}</strong>,</p>
    <p>Your KYC verification could not be completed.</p>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px 20px;margin:20px 0;">
      <p style="margin:0;color:#dc2626;font-weight:600;">Reason: ${vars.reason || 'Incomplete documentation'}</p>
    </div>
    <p>Please resubmit your documents with the corrections and try again.</p>`,

  credit_score_update: (vars) => `
    <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:22px;">📊 Credit Score Updated</h2>
    <p>Dear <strong>${vars.userName}</strong>,</p>
    <p>Your credit score has been updated by our system.</p>
    <div style="text-align:center;margin:24px 0;padding:30px;background:linear-gradient(135deg,#0a0a14,#1a1a2e);border-radius:16px;">
      <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">Your Credit Score</p>
      <p style="margin:0;font-size:48px;font-weight:900;color:${vars.creditScore >= 750 ? '#22c55e' : vars.creditScore >= 600 ? '#fbbf24' : '#ef4444'};">${vars.creditScore || '—'}</p>
      <p style="margin:8px 0 0;color:${vars.creditScore >= 750 ? '#22c55e' : vars.creditScore >= 600 ? '#fbbf24' : '#ef4444'};font-weight:700;text-transform:uppercase;letter-spacing:1px;font-size:14px;">${vars.creditScore >= 750 ? 'Excellent' : vars.creditScore >= 650 ? 'Good' : vars.creditScore >= 600 ? 'Fair' : 'Needs Improvement'}</p>
    </div>
    <p style="color:#64748b;">Log in to your dashboard for a detailed view of your credit profile.</p>`,

  account_activity: (vars) => `
    <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:22px;">🔔 Account Activity</h2>
    <p>Dear <strong>${vars.userName}</strong>,</p>
    <p>${vars.message || 'There has been activity on your account.'}</p>
    <p style="color:#64748b;font-size:13px;">If this wasn't you, please contact support immediately.</p>`,

  general: (vars) => `
    <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:22px;">📌 ${vars.title || 'Notification'}</h2>
    <p>Dear <strong>${vars.userName}</strong>,</p>
    <p>${vars.message || ''}</p>`
};

// ══════════ EMAIL SENDER WITH RETRY ══════════

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const sendEmail = async (options, retryCount = 0) => {
  const MAX_RETRIES = 3;
  const RETRY_DELAYS = [2000, 4000, 8000]; // exponential backoff

  try {
    const config = await SystemConfig.findOne();

    // Check if email notifications are enabled
    if (config?.emailNotifications?.enabled === false) {
      console.log('Email notifications disabled by admin');
      return;
    }

    // Check per-type toggle
    if (options.type && config?.emailNotifications?.types?.[options.type] === false) {
      console.log(`Email notifications disabled for type: ${options.type}`);
      return;
    }

    // Try SystemConfig first, then fall back to .env
    const emailCfg = config?.emailGateway?.provider && config.emailGateway.provider !== 'none'
      ? {
          provider: config.emailGateway.provider,
          host: config.emailGateway.smtpHost || config.emailGateway.host,
          port: config.emailGateway.smtpPort || config.emailGateway.port || 587,
          user: config.emailGateway.smtpUser || config.emailGateway.user,
          pass: config.emailGateway.smtpPass || config.emailGateway.pass,
          fromEmail: config.emailGateway.fromEmail,
          fromName: config.emailGateway.fromName
        }
      : {
          provider: process.env.EMAIL_PROVIDER || 'none',
          host: process.env.EMAIL_HOST,
          port: Number(process.env.EMAIL_PORT) || 587,
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
          fromEmail: process.env.EMAIL_FROM,
          fromName: config?.branding?.companyName || 'Dawn Multipurpose'
        };

    if (!emailCfg.provider || emailCfg.provider === 'none' || !emailCfg.host || !emailCfg.user) {
      console.log('Email sending skipped: No provider configured');
      return;
    }

    const transporter = nodemailer.createTransport({
      host: emailCfg.host,
      port: emailCfg.port,
      secure: emailCfg.port === 465,
      auth: { user: emailCfg.user, pass: emailCfg.pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000
    });

    // Build HTML using template if type is specified
    let htmlContent = options.html || '';
    if (options.type && emailTemplates[options.type] && options.vars) {
      htmlContent = emailTemplates[options.type](options.vars);
    }

    const fullHtml = buildBaseTemplate(config, htmlContent);

    const message = {
      from: `${emailCfg.fromName || 'Dawn Multipurpose'} <${emailCfg.fromEmail || 'noreply@dawncapital.online'}>`,
      to: options.to,
      subject: options.subject,
      html: fullHtml
    };

    const info = await transporter.sendMail(message);
    console.log('Email sent: %s to %s', info.messageId, options.to);
    return info;
  } catch (err) {
    console.error(`Email send attempt ${retryCount + 1} failed:`, err.message);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying email in ${RETRY_DELAYS[retryCount]}ms...`);
      await sleep(RETRY_DELAYS[retryCount]);
      return sendEmail(options, retryCount + 1);
    }
    
    console.error('Email permanently failed after', MAX_RETRIES, 'retries:', err.message);
  }
};

module.exports = sendEmail;
