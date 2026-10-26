const express = require('express');

const router =
  express.Router();

const {
  register,
  doctorLogin,
  patientLogin,
  googleConnect,
  googleCallback,
  logout
} = require('../controllers/authController');

const {
  protect,
  doctorOnly
} = require('../middleware/authMiddleware');


// ============================================================
// NORMAL AUTH
// ============================================================

router.post(
  '/register',
  register
);

router.post(
  '/doctor-login',
  doctorLogin
);

router.post(
  '/patient-login',
  patientLogin
);

router.post(
  '/logout',
  logout
);


// ============================================================
// GOOGLE ACCOUNT CONNECTION
// ============================================================

// Frontend first calls this while doctor is logged in
router.get(
  '/google',
  protect,
  doctorOnly,
  googleConnect
);


// Google redirects here after authorization
router.get(
  '/google/callback',
  googleCallback
);


module.exports = router;