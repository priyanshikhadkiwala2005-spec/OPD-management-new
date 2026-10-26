const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({

  patientId: {

    type: mongoose.Schema.Types.ObjectId,

    ref: 'Patient',

    required: true

  },

  doctorId: {

    type: mongoose.Schema.Types.ObjectId,

    ref: 'Doctor',

    required: true

  },

  appointmentDate: {

    type: String,

    required: true

  },

  appointmentTime: {

    type: String,

    required: true

  },

  type: {

    type: String,

    enum: ['General', 'Emergency', 'Follow-up', 'Review'],

    default: 'General'

  },

  // ============================================================
  // ONLINE / IN-PERSON CONSULTATION
  // ============================================================

  consultationType: {

    type: String,

    enum: ['In-person', 'Online'],

    default: 'In-person'

  },

  // ============================================================
  // SAME CONSULTATION ROOM ID
  // Patient and doctor use the same room
  // ============================================================

  consultationId: {

    type: String,

    default: null

  },

  // ============================================================
  // GOOGLE MEET URL
  // Real Google Meet link created when doctor starts consultation
  // ============================================================

  meetingUrl: {

    type: String,

    default: null

  },

  // ============================================================
  // CONSULTATION ROOM STATUS
  //
  // Waiting = Doctor has not started consultation
  // Started = Doctor has started consultation
  // Ended = Doctor has ended consultation
  // ============================================================

  consultationStatus: {

    type: String,

    enum: ['Waiting', 'Started', 'Ended'],

    default: 'Waiting'

  },

  // ============================================================
  // APPOINTMENT STATUS
  // ============================================================

  status: {

    type: String,

    enum: [
      'Pending',
      'In Progress',
      'Completed',
      'Cancelled'
    ],

    default: 'Pending'

  },

}, {

  timestamps: true

});

module.exports =
  mongoose.model(
    'Appointment',
    AppointmentSchema
  );