const jwt     = require('jsonwebtoken');
const Doctor  = require('../models/Doctor');
const Patient = require('../models/Patient');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      if (decoded.role === 'doctor') {
        req.user = await Doctor.findById(decoded.id).select('-password');
      } else {
        req.user = await Patient.findById(decoded.id).select('-password');
      }

      req.role = decoded.role;
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

// Only doctors allowed
const doctorOnly = (req, res, next) => {
  if (req.role !== 'doctor') {
    return res.status(403).json({ success: false, message: 'Access denied. Doctors only.' });
  }
  next();
};

// Only patients allowed
const patientOnly = (req, res, next) => {
  if (req.role !== 'patient') {
    return res.status(403).json({ success: false, message: 'Access denied. Patients only.' });
  }
  next();
};

module.exports = { protect, doctorOnly, patientOnly };
