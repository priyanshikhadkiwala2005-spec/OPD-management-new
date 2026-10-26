const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');


// ============================================================
// PATIENT RESPONSE FORMATTER
// ============================================================
// IMPORTANT:
// Database fields:
// patientId, fullName, bloodGroup, createdAt
//
// Frontend fields:
// patient_id, full_name, blood_group, created_at
//
// Patient ID itself is the TOKEN shown in Doctor > Patients.
// ============================================================

const formatPatient = (patient) => {
  if (!patient) return null;

  return {
    id: patient._id,

    // IMPORTANT: Patient registration ID / Token
    patient_id: patient.patientId,

    // Also expose token explicitly so frontend can use either field
    token: patient.patientId,

    full_name: patient.fullName,
    email: patient.email,
    mobile: patient.mobile,
    gender: patient.gender,
    age: patient.age,
    blood_group: patient.bloodGroup,
    dob: patient.dob,
    address: patient.address,
    created_at: patient.createdAt
  };
};


// ============================================================
// GET ALL PATIENTS ASSIGNED TO LOGGED-IN DOCTOR
// @route GET /api/patients
// @access Doctor
// ============================================================

const getPatients = async (req, res) => {
  try {
    const { search } = req.query;

    const doctor = await Doctor.findById(req.user._id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.'
      });
    }

    // Make sure patients array always exists
    const assignedPatientIds = doctor.patients || [];

    // ========================================================
    // BASE QUERY
    // ========================================================

    let query = {
      _id: {
        $in: assignedPatientIds
      }
    };

    // ========================================================
    // SEARCH ASSIGNED PATIENTS
    // ========================================================

    if (search && search.trim()) {
      const cleanSearch = search.trim();

      query = {
        $and: [
          {
            _id: {
              $in: assignedPatientIds
            }
          },
          {
            $or: [
              {
                fullName: {
                  $regex: cleanSearch,
                  $options: 'i'
                }
              },
              {
                email: {
                  $regex: cleanSearch,
                  $options: 'i'
                }
              },
              {
                mobile: {
                  $regex: cleanSearch,
                  $options: 'i'
                }
              },
              {
                patientId: {
                  $regex: cleanSearch,
                  $options: 'i'
                }
              }
            ]
          }
        ]
      };
    }

    // ========================================================
    // GET PATIENTS
    // ========================================================

    const patients = await Patient.find(query)
      .select('-password')
      .sort({
        createdAt: -1
      });

    // ========================================================
    // FORMAT PATIENTS
    // ========================================================

    const formatted = patients.map(formatPatient);

    // ========================================================
    // STATS
    // ========================================================

    const total_all = assignedPatientIds.length;

    const total_male = await Patient.countDocuments({
      _id: {
        $in: assignedPatientIds
      },
      gender: 'Male'
    });

    const total_female = await Patient.countDocuments({
      _id: {
        $in: assignedPatientIds
      },
      gender: 'Female'
    });

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,
      data: {
        patients: formatted,
        total: formatted.length,
        total_all,
        total_male,
        total_female
      }
    });

  } catch (error) {
    console.error('Get patients error:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to load patients.'
    });
  }
};


// ============================================================
// SEARCH PATIENT BY PATIENT ID / TOKEN
// @route GET /api/patients/search/:patientId
// @access Doctor
// ============================================================

const searchPatientById = async (req, res) => {
  try {
    const { patientId } = req.params;

    // ========================================================
    // VALIDATE ID
    // ========================================================

    if (!patientId || !patientId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required.'
      });
    }

    // ========================================================
    // CLEAN ID
    // ========================================================

    const cleanPatientId = patientId
      .trim()
      .toUpperCase();

    // ========================================================
    // FIND PATIENT
    // ========================================================

    const patient = await Patient.findOne({
      patientId: cleanPatientId
    }).select('-password');

    // ========================================================
    // NOT FOUND
    // ========================================================

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found. Please check the Patient ID.'
      });
    }

    // ========================================================
    // SUCCESS
    // ========================================================

    return res.status(200).json({
      success: true,
      message: 'Patient found successfully.',
      data: {
        patient: formatPatient(patient)
      }
    });

  } catch (error) {
    console.error('Search patient error:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to search patient.'
    });
  }
};


// ============================================================
// ASSIGN PATIENT TO LOGGED-IN DOCTOR
// @route POST /api/patients/assign
// @access Doctor
// ============================================================

const assignPatientToDoctor = async (req, res) => {
  try {
    const { patientId } = req.body;

    // ========================================================
    // VALIDATE PATIENT ID
    // ========================================================

    if (!patientId || !patientId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required.'
      });
    }

    const cleanPatientId = patientId
      .trim()
      .toUpperCase();

    // ========================================================
    // FIND PATIENT USING REGISTERED PATIENT ID
    // ========================================================

    const patient = await Patient.findOne({
      patientId: cleanPatientId
    }).select('-password');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found. Please check the Patient ID.'
      });
    }

    // ========================================================
    // FIND DOCTOR
    // ========================================================

    const doctor = await Doctor.findById(req.user._id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.'
      });
    }

    // ========================================================
    // MAKE SURE PATIENT ARRAY EXISTS
    // ========================================================

    if (!Array.isArray(doctor.patients)) {
      doctor.patients = [];
    }

    // ========================================================
    // CHECK ALREADY ASSIGNED
    // ========================================================

    const alreadyAssigned = doctor.patients.some(
      id =>
        id &&
        id.toString() === patient._id.toString()
    );

    if (alreadyAssigned) {
      return res.status(400).json({
        success: false,
        message:
          'This patient is already added to your patient list.',
        data: {
          patient: formatPatient(patient)
        }
      });
    }

    // ========================================================
    // ADD PATIENT TO DOCTOR
    // ========================================================

    doctor.patients.push(patient._id);

    await doctor.save();

    // ========================================================
    // SUCCESS RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,
      message:
        'Patient added successfully to your patient list.',
      data: {
        patient: formatPatient(patient)
      }
    });

  } catch (error) {
    console.error('Assign patient error:', error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        'Unable to add patient.'
    });
  }
};


// ============================================================
// DELETE / REMOVE PATIENT FROM DOCTOR'S LIST
// @route DELETE /api/patients/:id
// @access Doctor
// ============================================================

const deletePatient = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user._id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.'
      });
    }

    // ========================================================
    // MAKE SURE PATIENT ARRAY EXISTS
    // ========================================================

    if (!Array.isArray(doctor.patients)) {
      doctor.patients = [];
    }

    // ========================================================
    // CHECK PATIENT ASSIGNED
    // ========================================================

    const patientIdToRemove =
      req.params.id.toString();

    const isAssigned = doctor.patients.some(
      id =>
        id &&
        id.toString() === patientIdToRemove
    );

    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message:
          'This patient is not assigned to you.'
      });
    }

    // ========================================================
    // REMOVE PATIENT
    // ========================================================

    doctor.patients = doctor.patients.filter(
      id =>
        id &&
        id.toString() !== patientIdToRemove
    );

    await doctor.save();

    return res.status(200).json({
      success: true,
      message:
        'Patient removed from your patient list successfully.'
    });

  } catch (error) {
    console.error('Delete patient error:', error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        'Unable to remove patient.'
    });
  }
};


// ============================================================
// GET PATIENT PROFILE
// @route GET /api/patients/profile
// @access Patient
// ============================================================

const getProfile = async (req, res) => {
  try {
    const patient = await Patient.findById(
      req.user._id
    ).select('-password');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        profile: formatPatient(patient)
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        'Unable to get patient profile.'
    });
  }
};


// ============================================================
// UPDATE PATIENT PROFILE
// @route PUT /api/patients/profile
// @access Patient
// ============================================================

const updateProfile = async (req, res) => {
  try {
    const {
      full_name,
      email,
      mobile,
      gender,
      age,
      blood_group,
      address
    } = req.body;

    // ========================================================
    // FIND LOGGED-IN PATIENT
    // ========================================================

    const patient = await Patient.findById(
      req.user._id
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found.'
      });
    }

    // ========================================================
    // UPDATE ONLY PROVIDED VALUES
    // ========================================================

    if (full_name !== undefined) {
      patient.fullName = full_name;
    }

    if (email !== undefined) {
      patient.email = email;
    }

    if (mobile !== undefined) {
      patient.mobile = mobile;
    }

    if (gender !== undefined) {
      patient.gender = gender;
    }

    if (age !== undefined) {
      patient.age = age;
    }

    if (blood_group !== undefined) {
      patient.bloodGroup = blood_group;
    }

    if (address !== undefined) {
      patient.address = address;
    }

    await patient.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!'
    });

  } catch (error) {
    console.error('Update profile error:', error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        'Unable to update profile.'
    });
  }
};


// ============================================================
// GET ALL DOCTORS
// @route GET /api/patients/doctors-list
// @access Public
// ============================================================

// ============================================================
// GET ALL DOCTORS
// @route GET /api/patients/doctors-list
// @access Public
// ============================================================

const getDoctorsList = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .select('fullName specialization mobile email profileImage')
      .sort({
        fullName: 1
      });

    const formatted = doctors.map((d) => ({
      id: d._id,
      full_name: d.fullName,
      specialization: d.specialization,
      mobile: d.mobile,
      email: d.email,
      profile_image: d.profileImage || ''
    }));

    return res.status(200).json({
      success: true,
      data: {
        doctors: formatted
      }
    });

  } catch (error) {
    console.error('Get doctors list error:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to load doctors.'
    });
  }
};


// ============================================================
// GET ALL PATIENT TOKENS
// @route GET /api/patients/tokens
// ============================================================

const getAllPatientTokens = async (req, res) => {
  try {
    const patients = await Patient.find({})
      .select('patientId fullName')
      .sort({
        createdAt: -1
      });

    const tokens = patients.map((patient) => ({
      id: patient._id,
      patient_id: patient.patientId,
      token: patient.patientId,
      full_name: patient.fullName
    }));

    return res.status(200).json({
      success: true,
      data: {
        patients: tokens
      }
    });

  } catch (error) {
    console.error('Get all patient tokens error:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to load patient tokens.'
    });
  }
};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getPatients,
  getAllPatientTokens,
  searchPatientById,
  assignPatientToDoctor,
  deletePatient,
  getProfile,
  updateProfile,
  getDoctorsList
};