const express = require('express');

const router = express.Router();

const {
  protect,
  doctorOnly,
  patientOnly
} = require('../middleware/authMiddleware');

const {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getPatientAppointments,
  bookAppointment,
  startConsultation,
  endConsultation
} = require('../controllers/appointmentController');


// ============================================================
// PATIENT ROUTES
// ============================================================

// Get logged-in patient's appointments
// GET /api/appointments/my

router.get(
  '/my',
  protect,
  patientOnly,
  getPatientAppointments
);


// Patient books appointment with doctor
// POST /api/appointments/book

router.post(
  '/book',
  protect,
  patientOnly,
  bookAppointment
);


// ============================================================
// DOCTOR ROUTES
// ============================================================

// Get doctor's appointments
// GET /api/appointments

router.get(
  '/',
  protect,
  doctorOnly,
  getAppointments
);


// Doctor creates appointment
// POST /api/appointments

router.post(
  '/',
  protect,
  doctorOnly,
  createAppointment
);


// ============================================================
// ONLINE CONSULTATION
// ============================================================

// Doctor starts online consultation
// PATCH /api/appointments/:id/consultation/start

router.patch(
  '/:id/consultation/start',
  protect,
  doctorOnly,
  startConsultation
);


// Doctor ends online consultation
// PATCH /api/appointments/:id/consultation/end

router.patch(
  '/:id/consultation/end',
  protect,
  doctorOnly,
  endConsultation
);


// ============================================================
// APPOINTMENT STATUS
// ============================================================

// Doctor updates appointment status
// PUT /api/appointments/:id

router.put(
  '/:id',
  protect,
  doctorOnly,
  updateAppointment
);


// ============================================================
// DELETE APPOINTMENT
// ============================================================

// DELETE /api/appointments/:id

router.delete(
  '/:id',
  protect,
  doctorOnly,
  deleteAppointment
);


module.exports = router;