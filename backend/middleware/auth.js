const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) {
      console.log('❌ No token in cookies:', req.cookies);
      return res.status(401).json({ message: 'Unauthorized - No token' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.log('❌ User not found for token');
      return res.status(401).json({ message: 'Unauthorized - User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.log('❌ Auth error:', err.message);
    return res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
};
