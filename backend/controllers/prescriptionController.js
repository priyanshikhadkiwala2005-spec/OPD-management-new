const mongoose = require('mongoose');

const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

// ============================================================
// FEE RULES
// ============================================================

const DEFAULT_FEES = {
  General: 400,
  Emergency: 800,
  'Follow-up': 300,
  Review: 300,
};

// ============================================================
// HELPER - CHECK VALID OBJECT ID
// ============================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ============================================================
// HELPER - NORMALIZE APPOINTMENT TYPE
// ============================================================

const normalizeAppointmentType = (type) => {
  if (!type) {
    return 'General';
  }

  const value = String(type).trim();

  if (value.toLowerCase() === 'general') {
    return 'General';
  }

  if (value.toLowerCase() === 'emergency') {
    return 'Emergency';
  }

  if (
    value.toLowerCase() === 'follow-up' ||
    value.toLowerCase() === 'follow up' ||
    value.toLowerCase() === 'followup'
  ) {
    return 'Follow-up';
  }

  if (value.toLowerCase() === 'review') {
    return 'Review';
  }

  return 'General';
};

// ============================================================
// GET DOCTOR'S CONSULTATIONS
// GET /api/prescriptions
// ============================================================

const getConsultations = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const prescriptions = await Prescription.find({
      doctorId: req.user._id,
    })
      .populate(
        'patientId',
        'fullName age gender bloodGroup'
      )
      .sort({
        createdAt: -1,
      });

    const formatted = prescriptions.map((prescription) => ({
      id: prescription._id,

      patient_id:
        prescription.patientId?._id || null,

      patient_name:
        prescription.patientId?.fullName || '-',

      age:
        prescription.patientId?.age ?? '',

      gender:
        prescription.patientId?.gender || '',

      blood_group:
        prescription.patientId?.bloodGroup || '',

      symptoms:
        prescription.symptoms || '',

      diagnosis:
        prescription.diagnosis || '',

      consultation_fee:
        Number(
          prescription.consultationFee || 0
        ),

      additional_instructions:
        prescription.additionalInstructions || '',

      notes_for_patient:
        prescription.notesForPatient || '',

      created_at:
        prescription.createdAt || null,

      medicines: Array.isArray(
        prescription.medicines
      )
        ? prescription.medicines.map((medicine) => ({
            id: medicine._id,

            medicine_name:
              medicine.medicineName || '',

            medicine_type:
              medicine.medicineType || 'Medicine',

            dosage:
              medicine.dosage || '',

            frequency:
              medicine.frequency || '',

            duration:
              medicine.duration || '',
          }))
        : [],
    }));

    // ========================================================
    // STATS
    // ========================================================

    const total_rx = formatted.length;

    const total_meds = formatted.reduce(
      (sum, prescription) =>
        sum +
        (Array.isArray(prescription.medicines)
          ? prescription.medicines.length
          : 0),
      0
    );

    const total_rev = formatted.reduce(
      (sum, prescription) =>
        sum +
        Number(
          prescription.consultation_fee || 0
        ),
      0
    );

    return res.status(200).json({
      success: true,

      data: {
        consultations: formatted,

        stats: {
          total_rx,
          total_meds,
          total_rev,
        },
      },
    });
  } catch (error) {
    console.error(
      'Get consultations error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        'Failed to get consultations.',
    });
  }
};

// ============================================================
// SAVE PRESCRIPTION
// POST /api/prescriptions
// ============================================================

const savePrescription = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const {
      patient_id,
      consultation_fee,
      symptoms,
      diagnosis,
      additional_instructions,
      notes_for_patient,
      medicines,
    } = req.body || {};

    // ========================================================
    // VALIDATE PATIENT ID
    // ========================================================

    if (!patient_id) {
      return res.status(400).json({
        success: false,
        message: 'Please select a patient.',
      });
    }

    if (!isValidObjectId(patient_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID.',
      });
    }

    // ========================================================
    // CHECK PATIENT EXISTS
    // ========================================================

    const patient = await Patient.findById(
      patient_id
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found.',
      });
    }

    // ========================================================
    // PREPARE MEDICINES
    // ========================================================

    const safeMedicines = Array.isArray(medicines)
      ? medicines
          .filter((medicine) => medicine)
          .map((medicine) => ({
            medicineName:
              medicine.name ||
              medicine.medicine_name ||
              '',

            medicineType:
              medicine.type ||
              medicine.medicine_type ||
              'Medicine',

            dosage:
              medicine.dosage || '',

            frequency:
              medicine.frequency || '',

            duration:
              medicine.duration || '',
          }))
          .filter(
            (medicine) =>
              medicine.medicineName.trim() !== ''
          )
      : [];

    // ========================================================
    // CREATE PRESCRIPTION
    // ========================================================

    const prescription =
      await Prescription.create({
        patientId: patient_id,

        doctorId: req.user._id,

        symptoms:
          typeof symptoms === 'string'
            ? symptoms.trim()
            : '',

        diagnosis:
          typeof diagnosis === 'string'
            ? diagnosis.trim()
            : '',

        consultationFee:
          Number(consultation_fee) || 0,

        additionalInstructions:
          typeof additional_instructions ===
          'string'
            ? additional_instructions.trim()
            : '',

        notesForPatient:
          typeof notes_for_patient === 'string'
            ? notes_for_patient.trim()
            : '',

        medicines: safeMedicines,
      });

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(201).json({
      success: true,

      message:
        'Prescription saved successfully!',

      data: {
        id: prescription._id,
      },
    });
  } catch (error) {
    console.error(
      'Save prescription error:',
      error
    );

    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(
        error.errors || {}
      ).map((err) => err.message);

      return res.status(400).json({
        success: false,
        message:
          messages.length > 0
            ? messages.join(', ')
            : 'Invalid prescription data.',
      });
    }

    // Invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message:
          'Invalid patient or prescription ID.',
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        'Failed to save prescription.',
    });
  }
};

// ============================================================
// DELETE CONSULTATION
// DELETE /api/prescriptions/:id
// ============================================================

const deleteConsultation = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const prescriptionId =
      req.params?.id;

    if (!prescriptionId) {
      return res.status(400).json({
        success: false,
        message:
          'Prescription ID is required.',
      });
    }

    if (!isValidObjectId(prescriptionId)) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid prescription ID.',
      });
    }

    const deleted =
      await Prescription.findOneAndDelete({
        _id: prescriptionId,
        doctorId: req.user._id,
      });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message:
          'Consultation not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message:
        'Consultation deleted successfully!',
    });
  } catch (error) {
    console.error(
      'Delete consultation error:',
      error
    );

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message:
          'Invalid prescription ID.',
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        'Failed to delete consultation.',
    });
  }
};

// ============================================================
// GET PATIENT'S PRESCRIPTIONS
// GET /api/prescriptions/my
// ============================================================

const getPatientPrescriptions = async (
  req,
  res
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const prescriptions =
      await Prescription.find({
        patientId: req.user._id,
      })
        .populate(
          'doctorId',
          'fullName specialization'
        )
        .sort({
          createdAt: -1,
        });

    const formatted = prescriptions.map(
      (prescription) => ({
        id: prescription._id,

        doctor_name:
          prescription.doctorId?.fullName ||
          '-',

        specialization:
          prescription.doctorId
            ?.specialization || '',

        symptoms:
          prescription.symptoms || '',

        diagnosis:
          prescription.diagnosis || '',

        consultation_fee:
          Number(
            prescription.consultationFee || 0
          ),

        additional_instructions:
          prescription.additionalInstructions ||
          '',

        notes_for_patient:
          prescription.notesForPatient || '',

        created_at:
          prescription.createdAt || null,

        medicines: Array.isArray(
          prescription.medicines
        )
          ? prescription.medicines.map(
              (medicine) => ({
                id: medicine._id,

                medicine_name:
                  medicine.medicineName ||
                  '',

                medicine_type:
                  medicine.medicineType ||
                  'Medicine',

                dosage:
                  medicine.dosage || '',

                frequency:
                  medicine.frequency || '',

                duration:
                  medicine.duration || '',
              })
            )
          : [],
      })
    );

    return res.status(200).json({
      success: true,

      data: {
        prescriptions: formatted,
      },
    });
  } catch (error) {
    console.error(
      'Get patient prescriptions error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        'Failed to get patient prescriptions.',
    });
  }
};

// ============================================================
// GET AUTO FEE BY PATIENT APPOINTMENT TYPE
// GET /api/prescriptions/fee/:patientId
// ============================================================

const getPatientFee = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const patientId =
      req.params?.patientId;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message:
          'Patient ID is required.',
      });
    }

    if (!isValidObjectId(patientId)) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid patient ID.',
      });
    }

    const doctorId = req.user._id;

    // ========================================================
    // CHECK PATIENT EXISTS
    // ========================================================

    const patient =
      await Patient.findById(patientId).select(
        '_id'
      );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message:
          'Patient not found.',
      });
    }

    // ========================================================
    // FIND LATEST APPOINTMENT
    // FOR CURRENT DOCTOR + PATIENT
    // ========================================================

    const lastAppt =
      await Appointment.findOne({
        patientId: patientId,
        doctorId: doctorId,
      }).sort({
        appointmentDate: -1,
        appointmentTime: -1,
        createdAt: -1,
      });

    // ========================================================
    // GET APPOINTMENT TYPE
    // ========================================================

    const type =
      normalizeAppointmentType(
        lastAppt?.type
      );

    // ========================================================
    // GET DOCTOR CUSTOM FEE
    // ========================================================

    const doctor = req.user;

    let fee = 0;

    switch (type) {
      case 'General':
        fee =
          Number(doctor.feeGeneral) ||
          DEFAULT_FEES.General;
        break;

      case 'Emergency':
        fee =
          Number(doctor.feeEmergency) ||
          DEFAULT_FEES.Emergency;
        break;

      case 'Follow-up':
        fee =
          Number(doctor.feeFollowup) ||
          DEFAULT_FEES['Follow-up'];
        break;

      case 'Review':
        fee =
          Number(doctor.feeReview) ||
          DEFAULT_FEES.Review;
        break;

      default:
        fee = DEFAULT_FEES.General;
        break;
    }

    // ========================================================
    // LOG
    // ========================================================

    console.log(
      'Prescription fee calculation:',
      {
        patientId,
        doctorId,
        appointmentId:
          lastAppt?._id || null,
        appointmentType: type,
        fee,
      }
    );

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,

      data: {
        type,

        fee,

        appointment_id:
          lastAppt?._id || null,
      },
    });
  } catch (error) {
    console.error(
      'Get patient fee error:',
      error
    );

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message:
          'Invalid patient or appointment ID.',
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        'Failed to calculate patient fee.',
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getConsultations,
  savePrescription,
  deleteConsultation,
  getPatientPrescriptions,
  getPatientFee,
};