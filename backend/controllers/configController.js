const SystemConfig = require('../models/SystemConfig');

// @route   GET api/config
// @desc    Get system configuration
// @access  Public (for fetching branding/features)
exports.getConfig = async (req, res) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({});
    }
    
    // Check if maintenance mode is enabled
    if (config.maintenance.enabled && (!req.user || req.user.role !== 'admin')) {
      return res.status(503).json({ maintenance: true, config: config.maintenance });
    }
    
    // Fetch active announcements
    const Announcement = require('../models/Announcement');
    const announcements = await Announcement.find({ isActive: true }).sort({ createdAt: -1 });
    
    // Send both in a combined object
    const configObj = config.toObject();
    configObj.activeAnnouncements = announcements;
    
    res.json(configObj);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   PUT api/config
// @desc    Update system configuration
// @access  Private (Admin only)
exports.updateConfig = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admins only.' });
    }
    let config = await SystemConfig.findOne();
    if (!config) {
      config = new SystemConfig(req.body);
      await config.save();
    } else {
      config = await SystemConfig.findOneAndUpdate(
        {},
        { $set: req.body },
        { new: true }
      );
    }
    res.json(config);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   PUT api/config/mode
// @desc    Switch between test and production mode (with data cleanup)
// @access  Private (Admin only)
exports.switchMode = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admins only.' });
    }
    
    const { newMode } = req.body;
    if (!['testing', 'production'].includes(newMode)) {
      return res.status(400).json({ msg: 'Invalid mode. Must be testing or production.' });
    }

    const config = await SystemConfig.findOne();
    const oldMode = config.system_mode;
    
    // If switching TO production, clean up test data
    if (newMode === 'production' && oldMode === 'testing') {
      const User = require('../models/User');
      const Loan = require('../models/Loan');
      const Investment = require('../models/Investment');
      const Transaction = require('../models/Transaction');
      
      // Delete test users (those with test emails or marked as test accounts)
      // Keep admin accounts
      await User.deleteMany({
        $and: [
          { role: { $ne: 'admin' } },
          {
            $or: [
              { email: { $regex: 'test|demo|dummy' } },
              { name: { $regex: 'test|demo|dummy' } }
            ]
          }
        ]
      });
      
      // Delete related test data
      const testUserIds = await User.find({ email: { $regex: 'test|demo|dummy' } }).select('_id');
      if (testUserIds.length > 0) {
        await Loan.deleteMany({ user: { $in: testUserIds.map(u => u._id) } });
        await Investment.deleteMany({ user: { $in: testUserIds.map(u => u._id) } });
        await Transaction.deleteMany({ user: { $in: testUserIds.map(u => u._id) } });
      }
    }
    
    config.system_mode = newMode;
    await config.save();
    
    res.json({ msg: `System switched to ${newMode} mode`, config });
  } catch (err) {
    console.error('MODE SWITCH ERROR:', err.message);
    res.status(500).json({ msg: 'Failed to switch mode', error: err.message });
  }
};

// @route   PUT api/config/maintenance
// @desc    Toggle maintenance mode
// @access  Private (Admin only)
exports.toggleMaintenance = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admins only.' });
    }
    
    const config = await SystemConfig.findOne();
    config.maintenance.enabled = !config.maintenance.enabled;
    await config.save();
    
    res.json({ msg: `Maintenance mode ${config.maintenance.enabled ? 'enabled' : 'disabled'}`, config: config.maintenance });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Failed to toggle maintenance mode', error: err.message });
  }
};

