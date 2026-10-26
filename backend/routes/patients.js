const express = require('express');


const router = express.Router();

const {
  protect,
  doctorOnly,
  patientOnly
} = require('../middleware/authMiddleware');

const {
  getPatients,
  getAllPatientTokens,
  searchPatientById,
  assignPatientToDoctor,
  deletePatient,
  getProfile,
  updateProfile,
  getDoctorsList
} = require('../controllers/patientController');


// ======================================================
// DOCTOR ROUTES
// ======================================================


// ------------------------------------------------------
// Search patient using Patient ID
// GET /api/patients/search/PAT-862934
// ------------------------------------------------------

router.get(
  '/search/:patientId',
  protect,
  doctorOnly,
  searchPatientById
);


// ------------------------------------------------------
// Add existing patient to logged-in doctor's patient list
// POST /api/patients/assign
// ------------------------------------------------------

router.post(
  '/assign',
  protect,
  doctorOnly,
  assignPatientToDoctor
);


// ------------------------------------------------------
// Get all patients assigned to logged-in doctor
// GET /api/patients
// ------------------------------------------------------

router.get(
  '/',
  protect,
  doctorOnly,
  getPatients
);


// ------------------------------------------------------
// Remove patient from doctor's patient list
// DELETE /api/patients/:id
// ------------------------------------------------------


// ======================================================
// PATIENT ROUTES
// ======================================================


// ------------------------------------------------------
// Get logged-in patient's profile
// GET /api/patients/profile
// ------------------------------------------------------

router.get(
  '/profile',
  protect,
  patientOnly,
  getProfile
);


// ------------------------------------------------------
// Update logged-in patient's profile
// PUT /api/patients/profile
// ------------------------------------------------------

router.put(
  '/profile',
  protect,
  patientOnly,
  updateProfile
);

router.delete(
  '/:id',
  protect,
  doctorOnly,
  deletePatient
);

// ======================================================
// PUBLIC ROUTE
// ======================================================


// ------------------------------------------------------
// Get doctors list
// GET /api/patients/doctors-list
// ------------------------------------------------------

router.get(
  '/doctors-list',
  getDoctorsList
);

router.get(
  '/tokens',
  protect,
  doctorOnly,
  getAllPatientTokens
);


module.exports = router;