const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  medicineName: { type: String, required: true },
  medicineType: { type: String, enum: ['Medicine', 'Injection'], default: 'Medicine' },
  dosage:       { type: String, default: '' },
  frequency:    { type: String, default: '' },
  duration:     { type: String, default: '' },
});

const PrescriptionSchema = new mongoose.Schema({
  patientId:              { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId:               { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor',  required: true },
  symptoms:               { type: String, default: '' },
  diagnosis:              { type: String, default: '' },
  consultationFee:        { type: Number, default: 0 },
  medicines:              [MedicineSchema],
  additionalInstructions: { type: String, default: '' },
  notesForPatient:        { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Prescription', PrescriptionSchema);
