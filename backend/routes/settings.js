const express = require('express');

const router = express.Router();

const {
  protect,
  doctorOnly,
  patientOnly
} = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

const {
  getSettings,
  updateSettings,
  uploadProfileImage,
  changePassword,
  getReports,
  getDoctorStats,
  getPatientStats,
} = require('../controllers/settingsController');

// ======================================================
// DOCTOR ROUTES
// ======================================================

router.get(
  '/',
  protect,
  doctorOnly,
  getSettings
);

router.post(
  '/',
  protect,
  doctorOnly,
  updateSettings
);

// ======================================================
// DOCTOR PROFILE PHOTO
// ======================================================

router.post(
  '/profile-photo',
  protect,
  doctorOnly,
  upload.single('profileImage'),
  uploadProfileImage
);

router.post(
  '/change-password',
  protect,
  changePassword
);

router.get(
  '/stats',
  protect,
  doctorOnly,
  getDoctorStats
);

router.get(
  '/reports',
  protect,
  doctorOnly,
  getReports
);

// ======================================================
// PATIENT ROUTES
// ======================================================

router.get(
  '/patient-stats',
  protect,
  patientOnly,
  getPatientStats
);

// ======================================================
// CHANGE PASSWORD - BOTH DOCTOR AND PATIENT
// ======================================================

router.post(
  '/change-password',
  protect,
  changePassword
);

module.exports = router;