const bcrypt  = require('bcryptjs');
const fs      = require('fs');
const path    = require('path');
const Doctor  = require('../models/Doctor');
const Patient = require('../models/Patient');

// @desc  Get doctor settings
// @route GET /api/settings
const getSettings = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user._id).select('-password');

    res.json({
      success: true,
      data: {
        profile: {
          id:             doctor._id,
          full_name:      doctor.fullName,
          email:          doctor.email,
          mobile:         doctor.mobile,
          specialization: doctor.specialization,
          profile_image:  doctor.profileImage || '',
        },
        clinic: {
          clinic_name:    doctor.clinicName,
          clinic_address: doctor.clinicAddress,
          clinic_phone:   doctor.clinicPhone,
          clinic_email:   doctor.clinicEmail,
        },
        fees: {
          fee_general:   doctor.feeGeneral,
          fee_emergency: doctor.feeEmergency,
          fee_followup:  doctor.feeFollowup,
          fee_review:    doctor.feeReview,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update settings
// @route POST /api/settings
const updateSettings = async (req, res) => {
  try {
    const { section } = req.body;

    if (section === 'profile') {
      const { full_name, email, mobile, specialization } = req.body;

      await Doctor.findByIdAndUpdate(req.user._id, {
        fullName: full_name,
        email,
        mobile,
        specialization,
      });

      return res.json({
        success: true,
        message: 'Profile updated successfully!'
      });
    }

    if (section === 'clinic') {
      const {
        clinic_name,
        clinic_address,
        clinic_phone,
        clinic_email
      } = req.body;

      await Doctor.findByIdAndUpdate(req.user._id, {
        clinicName: clinic_name,
        clinicAddress: clinic_address,
        clinicPhone: clinic_phone,
        clinicEmail: clinic_email,
      });

      return res.json({
        success: true,
        message: 'Clinic info updated successfully!'
      });
    }

    if (section === 'fees') {
      const {
        fee_general,
        fee_emergency,
        fee_followup,
        fee_review
      } = req.body;

      await Doctor.findByIdAndUpdate(req.user._id, {
        feeGeneral: fee_general,
        feeEmergency: fee_emergency,
        feeFollowup: fee_followup,
        feeReview: fee_review,
      });

      return res.json({
        success: true,
        message: 'Fee settings updated successfully!'
      });
    }

    res.status(400).json({
      success: false,
      message: 'Invalid section.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc  Upload doctor profile photo
// @route POST /api/settings/profile-photo
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image.',
      });
    }

    const doctor = await Doctor.findById(req.user._id);

    if (!doctor) {
      if (req.file.path) {
        fs.unlink(req.file.path, () => {});
      }

      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    const oldProfileImage = doctor.profileImage || '';

    const profileImage =
      `${req.protocol}://${req.get('host')}/uploads/doctors/${req.file.filename}`;

    doctor.profileImage = profileImage;

    await doctor.save();

    // Remove previous uploaded doctor photo
    if (
      oldProfileImage &&
      oldProfileImage.includes('/uploads/doctors/')
    ) {
      try {
        const oldFileName = path.basename(
          new URL(oldProfileImage).pathname
        );

        const oldFilePath = path.join(
          __dirname,
          '..',
          'uploads',
          'doctors',
          oldFileName
        );

        if (
          fs.existsSync(oldFilePath) &&
          oldFilePath !== req.file.path
        ) {
          fs.unlink(oldFilePath, () => {});
        }
      } catch (error) {
        console.error(
          'Old profile image delete error:',
          error
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully.',
      data: {
        profile_image: profileImage,
      },
    });
  } catch (error) {
    console.error(
      'Upload profile image error:',
      error
    );

    // Delete newly uploaded file if saving failed
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        'Unable to upload profile photo.',
    });
  }
};

// @desc  Change password
// @route POST /api/settings/change-password
const changePassword = async (req, res) => {
  try {
    const {
      current_password,
      new_password,
      confirm_password
    } = req.body;

    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.'
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match.'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.'
      });
    }

    let user;

    if (req.user.role === 'doctor') {
      user = await Doctor.findById(req.user._id);
    } else if (req.user.role === 'patient') {
      user = await Patient.findById(req.user._id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const isMatch = await bcrypt.compare(
      current_password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(
      new_password,
      salt
    );

    if (req.user.role === 'doctor') {
      await Doctor.findByIdAndUpdate(req.user._id, {
        password: hashedPassword
      });
    } else if (req.user.role === 'patient') {
      await Patient.findByIdAndUpdate(req.user._id, {
        password: hashedPassword
      });
    }

    res.json({
      success: true,
      message: 'Password updated successfully!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc  Get reports/stats
// @route GET /api/reports
const getReports = async (req, res) => {
  try {
    const Appointment  = require('../models/Appointment');
    const Prescription = require('../models/Prescription');
    const Billing      = require('../models/Billing');
    const Patient      = require('../models/Patient');

    const doctorId = req.user._id;

    const total_patients =
      await Patient.countDocuments();

    const total_appointments =
      await Appointment.countDocuments({ doctorId });

    const total_completed =
      await Prescription.countDocuments({ doctorId });

    const paidBills =
      await Billing.find({
        doctorId,
        paymentStatus: 'Paid'
      });

    const total_revenue =
      paidBills.reduce(
        (s, b) => s + b.amount,
        0
      );

    // Appointment status breakdown
    const appt_pending =
      await Appointment.countDocuments({
        doctorId,
        status: 'Pending'
      });

    const appt_completed =
      await Appointment.countDocuments({
        doctorId,
        status: 'Completed'
      });

    const appt_cancelled =
      await Appointment.countDocuments({
        doctorId,
        status: 'Cancelled'
      });

    const appt_inprogress =
      await Appointment.countDocuments({
        doctorId,
        status: 'In Progress'
      });

    // Gender breakdown
    const male_count =
      await Patient.countDocuments({
        gender: 'Male'
      });

    const female_count =
      await Patient.countDocuments({
        gender: 'Female'
      });

    const other_count =
      await Patient.countDocuments({
        gender: 'Other'
      });

    // Top medicines
    const prescriptions =
      await Prescription.find({
        doctorId
      });

    const medCount = {};

    prescriptions.forEach(p => {
      p.medicines.forEach(m => {
        const key =
          `${m.medicineName}||${m.medicineType}`;

        medCount[key] =
          (medCount[key] || 0) + 1;
      });
    });

    const top_medicines =
      Object.entries(medCount)
        .map(([key, count]) => {
          const [
            medicine_name,
            medicine_type
          ] = key.split('||');

          return {
            medicine_name,
            medicine_type,
            count
          };
        })
        .sort(
          (a, b) => b.count - a.count
        )
        .slice(0, 10);

    // Recent appointments
    const recentAppts =
      await Appointment.find({ doctorId })
        .populate(
          'patientId',
          'fullName'
        )
        .sort({
          appointmentDate: -1
        })
        .limit(10);

    const recent_appointments =
      recentAppts.map(a => ({
        id: a._id,
        patient_name:
          a.patientId.fullName,
        appointment_date:
          a.appointmentDate,
        appointment_time:
          a.appointmentTime,
        type: a.type,
        status: a.status,
      }));

    // Billing summary
    const allBills =
      await Billing.find({
        doctorId
      });

    const pending_bills =
      allBills.filter(
        b =>
          b.paymentStatus === 'Pending'
      );

    const pending_revenue =
      pending_bills.reduce(
        (s, b) => s + b.amount,
        0
      );

    res.json({
      success: true,
      data: {
        summary: {
          total_patients,
          total_appointments,
          total_consultations:
            total_completed,
          total_revenue,
          pending_revenue,
          total_bills:
            allBills.length,
        },
        appointment_status: {
          pending: appt_pending,
          completed: appt_completed,
          cancelled: appt_cancelled,
          inprogress: appt_inprogress,
        },
        patient_gender: {
          male: male_count,
          female: female_count,
          other: other_count
        },
        top_medicines,
        recent_appointments,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc  Doctor stats for dashboard
// @route GET /api/settings/stats
const getDoctorStats = async (req, res) => {
  try {
    const Appointment  = require('../models/Appointment');
    const Prescription = require('../models/Prescription');
    const Billing      = require('../models/Billing');
    const Patient      = require('../models/Patient');

    const doctorId = req.user._id;

    const total_patients =
      await Patient.countDocuments();

    const total_appointments =
      await Appointment.countDocuments({
        doctorId
      });

    const total_completed =
      await Prescription.countDocuments({
        doctorId
      });

    const paidBills =
      await Billing.find({
        doctorId,
        paymentStatus: 'Paid'
      });

    const total_revenue =
      paidBills.reduce(
        (s, b) => s + b.amount,
        0
      );

    res.json({
      success: true,
      data: {
        total_patients,
        total_appointments,
        total_completed,
        total_revenue
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc  Patient stats
// @route GET /api/settings/patient-stats
const getPatientStats = async (req, res) => {
  try {
    const Appointment  = require('../models/Appointment');
    const Prescription = require('../models/Prescription');
    const Billing      = require('../models/Billing');

    const patientId = req.user._id;

    const total_appointments =
      await Appointment.countDocuments({
        patientId
      });

    const total_consultations =
      await Prescription.countDocuments({
        patientId
      });

    const bills =
      await Billing.find({
        patientId
      });

    const total_bills =
      bills.length;

    const total_paid =
      bills
        .filter(
          b =>
            b.paymentStatus === 'Paid'
        )
        .reduce(
          (s, b) => s + b.amount,
          0
        );

    const total_pending =
      bills
        .filter(
          b =>
            b.paymentStatus === 'Pending'
        )
        .reduce(
          (s, b) => s + b.amount,
          0
        );

    res.json({
      success: true,
      data: {
        total_appointments,
        total_consultations,
        total_prescriptions:
          total_consultations,
        total_bills,
        total_paid,
        total_pending,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  uploadProfileImage,
  changePassword,
  getReports,
  getDoctorStats,
  getPatientStats
};