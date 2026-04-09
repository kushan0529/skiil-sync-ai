const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const dns = require('dns').promises;

function signToken(payload, expiresIn = '7d') {
  const secret = process.env.JWT_SECRET || 'fallback_secret';
  return jwt.sign(payload, secret, { expiresIn });
}

exports.register = async (req, res, next) => {
  const { name, password, email } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Enter all required fields (name, email, password)' });
    }

    // 1. Basic format check (Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // 2. Official existence check (DNS MX records)
    const domain = email.split('@')[1];
    try {
      const mxRecords = await dns.resolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        return res.status(400).json({ error: 'This email domain does not exist or cannot receive emails.' });
      }
    } catch (dnsErr) {
      console.error(`[auth] DNS Check failed for ${domain}:`, dnsErr.message);
      return res.status(400).json({ error: 'Email domain verification failed. Please use a valid, existing email.' });
    }
    
    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ error: 'User Already Exists' });
    }
    
    const hashed = await bcrypt.hash(password, 10);
    const role = req.body.role || 'member';
    
    let isApproved = true;
    if (role === 'manager') {
      isApproved = false;
    }

    if (role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount >= 1) {
        return res.status(400).json({ error: 'Maximum number of administrators (1) already reached.' });
      }
    }

    const user = await User.create({ name, email, password: hashed, role, isApproved });
  
    const token = signToken({ id: user._id });
    
    res.json({ 
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved },
      token,
      message: role === 'manager' ? 'Registration successful. Please wait for admin approval.' : undefined
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing Fields' });
    }
    
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    if (!user.isApproved) {
      return res.status(403).json({ error: 'Your account is pending administrator approval.' });
    }
    
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).json({ error: 'Invalid password' });
    }
    
    const token = signToken({ id: user._id });
    res.json({ 
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved }, 
      token 
    });
  } catch (err) {
    next(err);
  }
};
