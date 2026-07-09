const auth = require('./auth');

const adminAuth = [
  auth,
  async (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admins only.' });
    }
    next();
  }
];

module.exports = adminAuth;
