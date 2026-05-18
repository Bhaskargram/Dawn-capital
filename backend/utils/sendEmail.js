const nodemailer = require('nodemailer');
const SystemConfig = require('../models/SystemConfig');

const sendEmail = async (options) => {
  try {
    const config = await SystemConfig.findOne();
    
    // Try SystemConfig first, then fall back to .env
    const emailCfg = config?.emailGateway?.provider && config.emailGateway.provider !== 'none'
      ? config.emailGateway
      : {
          provider: process.env.EMAIL_PROVIDER || 'none',
          host: process.env.EMAIL_HOST,
          port: Number(process.env.EMAIL_PORT) || 587,
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
          fromEmail: process.env.EMAIL_FROM
        };

    if (!emailCfg.provider || emailCfg.provider === 'none' || !emailCfg.host || !emailCfg.user) {
      console.log('Email sending skipped: No provider configured in DB or .env');
      return;
    }

    const { provider, host, port, user, pass, fromEmail } = emailCfg;

    // Create a transporter
    let transporter;
    if (provider === 'smtp') {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for 465, false for other ports
        auth: { user, pass }
      });
    } else {
      // Stub for SendGrid/Mailgun mapping (we would map to their SMTP or APIs)
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email', // Fallback for dev
        port: 587,
        auth: {
          user: 'test@ethereal.email',
          pass: 'testpass'
        }
      });
    }

    // Default Template Wrapper
    // Default Template Wrapper
    const primaryColor = config?.branding?.primaryColor || '#C21B2F';
    const logoUrl = config?.branding?.logoUrl || 'https://dawnlogos.s3.amazonaws.com/dawn6.png';
    const companyName = config?.branding?.companyName || 'Dawn Capital';

    const htmlTemplate = `
      <div style="font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f4f4f5; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
        <div style="background-color: #0f1829; padding: 30px 20px; text-align: center; border-bottom: 3px solid ${primaryColor};">
          <img src="${logoUrl}" alt="${companyName}" style="max-height: 50px; width: auto;" />
        </div>
        <div style="background-color: #ffffff; padding: 40px 30px; color: #333333; line-height: 1.6; font-size: 16px;">
          ${options.html}
        </div>
        <div style="background-color: #f8fafc; padding: 20px 30px; text-align: center; color: #64748b; font-size: 13px; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0 0 10px 0;">Need help? Contact us at <a href="mailto:support@dawncapital.online" style="color: ${primaryColor}; text-decoration: none;">support@dawncapital.online</a></p>
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        </div>
      </div>
    `;

    const message = {
      from: `${config.branding?.companyName || 'Dawn Capital'} <${fromEmail || 'noreply@dawncapital.com'}>`,
      to: options.email,
      subject: options.subject,
      html: htmlTemplate
    };

    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
  } catch (err) {
    console.error('Email could not be sent', err);
  }
};

module.exports = sendEmail;
