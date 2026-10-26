const express    = require('express');
const dotenv     = require('dotenv');
const cors       = require('cors');
const path       = require('path');
const connectDB  = require('./config/db');

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ── Middleware ──────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175', 
]; 
 
app.use(cors({ 
  origin: function (origin, callback) { 
    if (!origin || allowedOrigins.includes(origin)) { 
      callback(null, true); 
    } else { 
      callback(new Error('Not allowed by CORS')); 
    } 
  }, 
  credentials: true, 
})); 
 
app.use(express.json()); 

// ── Uploaded Files ──────────────────────────────────────
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

// ── Routes ────────────────────────────────────────────── 
app.use('/api/auth',          require('./routes/auth')); 
app.use('/api/appointments',  require('./routes/appointments')); 
app.use('/api/patients',      require('./routes/patients')); 
app.use('/api/prescriptions', require('./routes/prescriptions')); 
app.use('/api/billing',       require('./routes/billing')); 
app.use('/api/settings',      require('./routes/settings')); 
app.use('/api/reports',       require('./routes/settings')); // reports reuse settings router 
 
// ── Health check ──────────────────────────────────────── 
app.get('/', (req, res) => { 
  res.json({ 
    success: true, 
    message: '🏥 MedCare OPD Backend is running!', 
    version: '1.0.0', 
    endpoints: { 
      auth:          '/api/auth', 
      appointments:  '/api/appointments', 
      patients:      '/api/patients', 
      prescriptions: '/api/prescriptions', 
      billing:       '/api/billing', 
      settings:      '/api/settings', 
      reports:       '/api/reports', 
    }, 
  }); 
}); 
 
// ── 404 handler ───────────────────────────────────────── 
app.use((req, res) => { 
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }); 
}); 
 
// ── Error handler ──────────────────────────────────────── 
app.use((err, req, res, next) => { 
  console.error(err.stack); 
  res.status(500).json({ success: false, message: err.message || 'Server Error' }); 
}); 
 
// ── Start server ───────────────────────────────────────── 
const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => { 
  console.log(`🚀 Server running on http://localhost:${PORT}`); 
  console.log(`📦 Environment: development`); 
});