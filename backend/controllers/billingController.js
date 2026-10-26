const Billing = require('../models/Billing');
const Patient = require('../models/Patient');

// @desc  Get doctor's bills
// @route GET /api/billing
const getBills = async (req, res) => {
  try {
    const bills = await Billing.find({ doctorId: req.user._id })
      .populate('patientId', 'fullName')
      .sort({ createdAt: -1 });

    const formatted = bills.map(b => ({
      id:             b._id,
      patient_id:     b.patientId._id,
      patient_name:   b.patientId.fullName,
      amount:         b.amount,
      payment_status: b.paymentStatus,
      created_at:     b.createdAt,
    }));

    const total_paid    = formatted.filter(b => b.payment_status === 'Paid').reduce((s, b) => s + b.amount, 0);
    const total_pending = formatted.filter(b => b.payment_status === 'Pending').reduce((s, b) => s + b.amount, 0);
    const total_bills   = formatted.length;

    res.json({
      success: true,
      data: { bills: formatted, total_paid, total_pending, total_bills },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Generate bill
// @route POST /api/billing
const createBill = async (req, res) => {
  try {
    const { patient_id, amount, payment_status } = req.body;

    if (!patient_id || !amount) {
      return res.status(400).json({ success: false, message: 'Patient and amount are required.' });
    }

    const bill = await Billing.create({
      patientId:     patient_id,
      doctorId:      req.user._id,
      amount:        parseFloat(amount),
      paymentStatus: payment_status || 'Pending',
    });

    res.status(201).json({ success: true, message: 'Bill generated successfully!', data: { id: bill._id } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update payment status
// @route PUT /api/billing/:id
const updateBill = async (req, res) => {
  try {
    const { payment_status } = req.body;
    if (!['Pending', 'Paid'].includes(payment_status)) {
      return res.status(400).json({ success: false, message: 'Invalid payment status.' });
    }

    await Billing.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.user._id },
      { paymentStatus: payment_status }
    );

    res.json({ success: true, message: 'Payment status updated!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Delete bill
// @route DELETE /api/billing/:id
const deleteBill = async (req, res) => {
  try {
    await Billing.findOneAndDelete({ _id: req.params.id, doctorId: req.user._id });
    res.json({ success: true, message: 'Bill deleted!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get patient's bills
// @route GET /api/billing/my
const getPatientBills = async (req, res) => {
  try {
    const bills = await Billing.find({ patientId: req.user._id })
      .populate('doctorId', 'fullName')
      .sort({ createdAt: -1 });

    const formatted = bills.map(b => ({
      id:             b._id,
      doctor_name:    b.doctorId.fullName,
      amount:         b.amount,
      payment_status: b.paymentStatus,
      created_at:     b.createdAt,
    }));

    const total_paid    = formatted.filter(b => b.payment_status === 'Paid').reduce((s, b) => s + b.amount, 0);
    const total_pending = formatted.filter(b => b.payment_status === 'Pending').reduce((s, b) => s + b.amount, 0);

    res.json({ success: true, data: { bills: formatted, total_paid, total_pending } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getBills, createBill, updateBill, deleteBill, getPatientBills };
