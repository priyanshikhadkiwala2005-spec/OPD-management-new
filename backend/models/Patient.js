const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema(
  {
    // ==========================================
    // PATIENT ID
    // ==========================================
    patientId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    // ==========================================
    // BASIC INFORMATION
    // ==========================================
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: [true, 'Password is required']
    },

    mobile: {
      type: String,
      default: '',
      trim: true
    },

    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', ''],
      default: ''
    },

    dob: {
      type: String,
      default: ''
    },

    age: {
      type: Number,
      default: 0
    },

    bloodGroup: {
      type: String,
      default: ''
    },

    address: {
      type: String,
      default: ''
    },

    // ==========================================
    // ROLE
    // ==========================================
    role: {
      type: String,
      default: 'patient'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Patient', PatientSchema);