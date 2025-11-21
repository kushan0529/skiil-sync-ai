const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

module.exports = async function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Authorization header required' });

  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token not provided' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('-password');
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
