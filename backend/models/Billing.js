const mongoose = require('mongoose');

const BillingSchema = new mongoose.Schema({
  patientId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor',  required: true },
  amount:        { type: Number, required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Billing', BillingSchema);
