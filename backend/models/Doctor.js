const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    // ==========================================
    // BASIC DOCTOR INFORMATION
    // ==========================================

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    googleEmail: {
      type: String,
      default: '',
    },

    googleOAuth: {
      accessToken: {
        type: String,
        default: '',
      },
      refreshToken: {
        type: String,
        default: '',
      },
      expiryDate: {
        type: Number,
        default: null,
      },
    },

    password: {
      type: String,
      required: true,
    },

    mobile: {
      type: String,
      default: '',
    },

    specialization: {
      type: String,
      default: '',
    },

    gender: {
      type: String,
      default: '',
    },

    dob: {
      type: String,
      default: '',
    },

    age: {
      type: Number,
      default: null,
    },

    address: {
      type: String,
      default: '',
    },

    // ==========================================
    // DOCTOR PROFILE PHOTO
    // ==========================================

    profileImage: {
      type: String,
      default: '',
    },

    // ==========================================
    // ROLE
    // ==========================================

    role: {
      type: String,
      default: 'doctor',
    },

    // ==========================================
    // PATIENTS
    // ==========================================

    patients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
      },
    ],

    // ==========================================
    // CLINIC INFORMATION
    // ==========================================

    clinicName: {
      type: String,
      default: '',
    },

    clinicAddress: {
      type: String,
      default: '',
    },

    clinicPhone: {
      type: String,
      default: '',
    },

    clinicEmail: {
      type: String,
      default: '',
    },

    // ==========================================
    // CONSULTATION FEES
    // ==========================================

    feeGeneral: {
      type: Number,
      default: 500,
    },

    feeEmergency: {
      type: Number,
      default: 800,
    },

    feeFollowup: {
      type: Number,
      default: 400,
    },

    feeReview: {
      type: Number,
      default: 400,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Doctor', doctorSchema);