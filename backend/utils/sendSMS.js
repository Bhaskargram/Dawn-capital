const SystemConfig = require('../models/SystemConfig');

const sendSMS = async (options) => {
  try {
    const config = await SystemConfig.findOne();
    
    // Check if SMS is configured
    if (!config || !config.smsGateway || config.smsGateway.provider === 'none') {
      console.log('SMS sending skipped: No provider configured.');
      return { success: false, message: 'SMS provider not configured' };
    }

    const { provider, accountSid, authToken, fromNumber } = config.smsGateway;

    if (provider === 'twilio') {
      const twilio = require('twilio');
      const client = twilio(accountSid, authToken);

      const message = await client.messages.create({
        body: options.body,
        from: fromNumber,
        to: options.to
      });

      console.log(`SMS sent successfully: ${message.sid}`);
      return { success: true, messageId: message.sid };
    } else if (provider === 'aws_sns') {
      // AWS SNS integration
      const AWS = require('aws-sdk');
      const sns = new AWS.SNS({
        accessKeyId: config.smsGateway.accessKeyId,
        secretAccessKey: config.smsGateway.secretAccessKey,
        region: config.smsGateway.region || 'us-east-1'
      });

      const params = {
        Message: options.body,
        PhoneNumber: options.to
      };

      const result = await sns.publish(params).promise();
      console.log(`SMS sent via AWS SNS: ${result.MessageId}`);
      return { success: true, messageId: result.MessageId };
    } else {
      console.warn(`SMS provider '${provider}' not implemented`);
      return { success: false, message: 'SMS provider not implemented' };
    }
  } catch (err) {
    console.error('SMS send error:', err.message);
    return { success: false, error: err.message };
  }
};

module.exports = sendSMS;
