const SystemConfig = require('../models/SystemConfig');

module.exports = async function(req, res, next) {
  try {
    const config = await SystemConfig.findOne();
    if (config) {
      req.systemMode = config.system_mode;
      req.isTestMode = config.system_mode === 'testing';
    } else {
      req.systemMode = 'testing';
      req.isTestMode = true;
    }
    next();
  } catch (err) {
    console.error('System Mode Middleware Error:', err.message);
    res.status(500).json({ msg: 'Server Error in System Mode Check' });
  }
};
