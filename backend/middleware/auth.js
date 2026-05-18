const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Fetch full user from DB so role/isBlocked are available
    const user = await User.findById(decoded.user.id).select('-password');
    if (!user) return res.status(401).json({ msg: 'User not found' });
    if (user.isBlocked) return res.status(403).json({ msg: 'Account is blocked' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
