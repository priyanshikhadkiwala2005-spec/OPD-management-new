const express = require('express');
const router  = express.Router();
const { protect, doctorOnly, patientOnly } = require('../middleware/authMiddleware');
const {
  getBills, createBill, updateBill,
  deleteBill, getPatientBills,
} = require('../controllers/billingController');

// Doctor routes
router.get('/',       protect, doctorOnly,  getBills);
router.post('/',      protect, doctorOnly,  createBill);
router.put('/:id',    protect, doctorOnly,  updateBill);
router.delete('/:id', protect, doctorOnly,  deleteBill);

// Patient routes
router.get('/my',     protect, patientOnly, getPatientBills);

module.exports = router;
