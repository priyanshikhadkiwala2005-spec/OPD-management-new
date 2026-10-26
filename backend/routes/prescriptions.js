const express = require('express');

const router = express.Router();

const {
  protect,
  doctorOnly,
  patientOnly,
} = require('../middleware/authMiddleware');

const {
  getConsultations,
  savePrescription,
  deleteConsultation,
  getPatientPrescriptions,
  getPatientFee,
} = require('../controllers/prescriptionController');


// ============================================================
// PATIENT ROUTES
// ============================================================

// Get prescriptions of the currently logged-in patient
// GET /api/prescriptions/my
//
// IMPORTANT:
// Keep this route BEFORE /:id
router.get(
  '/my',
  protect,
  patientOnly,
  getPatientPrescriptions
);


// ============================================================
// DOCTOR ROUTES
// ============================================================

// Get all consultations of the logged-in doctor
// GET /api/prescriptions
router.get(
  '/',
  protect,
  doctorOnly,
  getConsultations
);


// Save a new prescription
// POST /api/prescriptions
router.post(
  '/',
  protect,
  doctorOnly,
  savePrescription
);


// Get consultation fee for a patient
// GET /api/prescriptions/fee/:patientId
//
// General   → ₹400
// Emergency → ₹800
// Follow-up → ₹300
// Review    → ₹300
router.get(
  '/fee/:patientId',
  protect,
  doctorOnly,
  getPatientFee
);


// Delete a consultation
// DELETE /api/prescriptions/:id
router.delete(
  '/:id',
  protect,
  doctorOnly,
  deleteConsultation
);


module.exports = router;