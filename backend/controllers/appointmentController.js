const Appointment = require('../models/Appointment');
const { createGoogleMeet } = require('../config/meetService');


// ============================================================
// GET ALL APPOINTMENTS
// Every doctor can see appointments of ALL patients/doctors
// ============================================================

// @desc  Get all appointments
// @route GET /api/appointments
const getAppointments = async (req, res) => {
  try {

    const { filter } = req.query;

    const today = new Date().toISOString().split('T')[0];

    let query = {};

    // --------------------------------------------------------
    // DATE FILTER
    // --------------------------------------------------------

    if (filter === 'today') {
      query.appointmentDate = today;
    }

    if (filter === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      query.appointmentDate =
        tomorrow.toISOString().split('T')[0];
    }

    if (filter === 'week') {
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() + 6);

      query.appointmentDate = {
        $gte: today,
        $lte: weekEnd.toISOString().split('T')[0],
      };
    }


    // --------------------------------------------------------
    // GET ALL APPOINTMENTS
    // --------------------------------------------------------

    const appointments = await Appointment.find(query)
      .populate(
        'patientId',
        'fullName mobile'
      )
      .populate(
        'doctorId',
        'fullName specialization'
      )
      .sort({
        appointmentDate: -1,
        appointmentTime: -1,
      });


    // --------------------------------------------------------
    // FORMAT DATA FOR FRONTEND
    // --------------------------------------------------------

    const formatted = appointments.map((a) => ({
      id: a._id,

      patient_id:
        a.patientId ? a.patientId._id : null,

      patient_name:
        a.patientId ? a.patientId.fullName : '-',

      patient_mobile:
        a.patientId ? a.patientId.mobile : '-',

      doctor_id:
        a.doctorId ? a.doctorId._id : null,

      doctor_name:
        a.doctorId ? a.doctorId.fullName : '-',

      specialization:
        a.doctorId ? a.doctorId.specialization : '',

      appointment_date:
        a.appointmentDate,

      appointment_time:
        a.appointmentTime,

      // EXISTING
      type:
        a.type,

      // ONLINE CONSULTATION
      consultation_type:
        a.consultationType || 'In-person',

      consultation_id:
        a.consultationId || null,

      // GOOGLE MEET
      meeting_url:
        a.meetingUrl || null,

      // NEW
      consultation_status:
        a.consultationStatus || 'Waiting',

      // EXISTING
      status:
        a.status || 'Pending',
    }));


    // --------------------------------------------------------
    // STATS — ALL APPOINTMENTS
    // --------------------------------------------------------

    const allAppts =
      await Appointment.find({});

    const total =
      allAppts.length;

    const pending =
      allAppts.filter(
        (a) => a.status === 'Pending'
      ).length;

    const inprogress =
      allAppts.filter(
        (a) => a.status === 'In Progress'
      ).length;

    const completed =
      allAppts.filter(
        (a) => a.status === 'Completed'
      ).length;

    const cancelled =
      allAppts.filter(
        (a) => a.status === 'Cancelled'
      ).length;


    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    res.json({
      success: true,

      data: {
        appointments: formatted,

        stats: {
          total,
          pending,
          inprogress,
          completed,
          cancelled,
        },
      },
    });

  } catch (error) {

    console.error(
      'GET APPOINTMENTS ERROR:',
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ============================================================
// DOCTOR BOOK APPOINTMENT
// ============================================================

// @desc  Book appointment
// @route POST /api/appointments
const createAppointment = async (req, res) => {
  try {

    const {
      patient_id,
      appointment_date,
      appointment_time,
      type,
      consultation_type,
    } = req.body;


    if (
      !patient_id ||
      !appointment_date ||
      !appointment_time
    ) {

      return res.status(400).json({
        success: false,
        message:
          'patient_id, appointment_date, and appointment_time are required.',
      });
    }


    // --------------------------------------------------------
    // CREATE CONSULTATION ID ONLY FOR ONLINE
    // --------------------------------------------------------

    let consultationId = null;

    if (consultation_type === 'Online') {
      consultationId =
        `consultation-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`;
    }


    const appointment =
      await Appointment.create({

        patientId:
          patient_id,

        doctorId:
          req.user._id,

        appointmentDate:
          appointment_date,

        appointmentTime:
          appointment_time,

        // EXISTING
        type:
          type || 'General',

        // ONLINE
        consultationType:
          consultation_type || 'In-person',

        consultationId:
          consultationId,

        // GOOGLE MEET
        meetingUrl:
          null,

        // NEW
        consultationStatus:
          consultation_type === 'Online'
            ? 'Waiting'
            : 'Waiting',

        // EXISTING
        status:
          'Pending',
      });


    res.status(201).json({

      success: true,

      message:
        'Appointment booked successfully!',

      data: {
        id: appointment._id,

        consultation_type:
          appointment.consultationType,

        consultation_id:
          appointment.consultationId,

        meeting_url:
          appointment.meetingUrl,

        consultation_status:
          appointment.consultationStatus,
      },
    });

  } catch (error) {

    console.error(
      'CREATE APPOINTMENT ERROR:',
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ============================================================
// START ONLINE CONSULTATION
// ============================================================

// @desc  Doctor starts online consultation
// @route PATCH /api/appointments/:id/consultation/start
const startConsultation = async (req, res) => {
  try {

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID is required.',
      });
    }


    // --------------------------------------------------------
    // FIND ONLINE APPOINTMENT
    // --------------------------------------------------------

    const appointment =
      await Appointment.findById(id);


    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }


    // --------------------------------------------------------
    // ONLY ONLINE APPOINTMENT CAN START CONSULTATION
    // --------------------------------------------------------

    if (appointment.consultationType !== 'Online') {
      return res.status(400).json({
        success: false,
        message:
          'This appointment is not an online consultation.',
      });
    }


    // --------------------------------------------------------
    // CONSULTATION ROOM MUST EXIST
    // --------------------------------------------------------

    if (!appointment.consultationId) {
      return res.status(400).json({
        success: false,
        message:
          'Consultation room is not available.',
      });
    }


    // --------------------------------------------------------
    // CHECK IF ALREADY ENDED
    // --------------------------------------------------------

    if (
      appointment.consultationStatus === 'Ended'
    ) {
      return res.status(400).json({
        success: false,
        message:
          'This consultation has already ended.',
      });
    }


    // --------------------------------------------------------
    // CREATE REAL GOOGLE MEET
    // Only create it when doctor starts consultation
    // --------------------------------------------------------

    if (!appointment.meetingUrl) {

     const meeting =
  await createGoogleMeet(
    req.user._id
  );

      if (!meeting || !meeting.meetingUrl) {
        return res.status(500).json({
          success: false,
          message:
            'Google Meet could not be created.',
        });
      }

      appointment.meetingUrl =
        meeting.meetingUrl;
    }


    // --------------------------------------------------------
    // START CONSULTATION
    // --------------------------------------------------------

    appointment.consultationStatus =
      'Started';

    await appointment.save();


    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    res.json({

      success: true,

      message:
        'Online consultation started successfully.',

      data: {
        id: appointment._id,

        consultation_id:
          appointment.consultationId,

        meeting_url:
          appointment.meetingUrl,

        consultation_status:
          appointment.consultationStatus,
      },
    });

  } catch (error) {

    console.error(
      'START CONSULTATION ERROR:',
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ============================================================
// END ONLINE CONSULTATION
// ============================================================

// @desc  Doctor ends online consultation
// @route PATCH /api/appointments/:id/consultation/end
const endConsultation = async (req, res) => {
  try {

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID is required.',
      });
    }


    // --------------------------------------------------------
    // FIND APPOINTMENT
    // --------------------------------------------------------

    const appointment =
      await Appointment.findById(id);


    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }


    // --------------------------------------------------------
    // ONLY ONLINE
    // --------------------------------------------------------

    if (appointment.consultationType !== 'Online') {
      return res.status(400).json({
        success: false,
        message:
          'This appointment is not an online consultation.',
      });
    }


    // --------------------------------------------------------
    // END CONSULTATION
    // --------------------------------------------------------

    appointment.consultationStatus =
      'Ended';

    await appointment.save();


    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    res.json({

      success: true,

      message:
        'Online consultation ended successfully.',

      data: {
        id: appointment._id,

        consultation_id:
          appointment.consultationId,

        meeting_url:
          appointment.meetingUrl,

        consultation_status:
          appointment.consultationStatus,
      },
    });

  } catch (error) {

    console.error(
      'END CONSULTATION ERROR:',
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ============================================================
// UPDATE APPOINTMENT STATUS
// ============================================================

// @desc  Update appointment status
// @route PUT /api/appointments/:id
const updateAppointment = async (req, res) => {
  try {

    const { status } = req.body;

    const allowed = [
      'Pending',
      'In Progress',
      'Completed',
      'Cancelled',
    ];


    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required.',
      });
    }


    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status.',
      });
    }


    if (!req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID is required.',
      });
    }


    const appointment =
      await Appointment.findOneAndUpdate(
        {
          _id: req.params.id,
        },
        {
          status: status,
        },
        {
          new: true,
        }
      );


    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }


    res.json({

      success: true,

      message:
        'Appointment status updated successfully!',

      data: {
        id: appointment._id,
        status: appointment.status,
      },
    });

  } catch (error) {

    console.error(
      'UPDATE APPOINTMENT ERROR:',
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ============================================================
// DELETE APPOINTMENT
// ============================================================

// @desc  Delete appointment
// @route DELETE /api/appointments/:id
const deleteAppointment = async (req, res) => {
  try {

    if (!req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID is required.',
      });
    }


    const appointment =
      await Appointment.findOneAndDelete({
        _id: req.params.id,
      });


    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }


    res.json({
      success: true,
      message: 'Appointment deleted!',
    });

  } catch (error) {

    console.error(
      'DELETE APPOINTMENT ERROR:',
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ============================================================
// GET PATIENT'S OWN APPOINTMENTS
// ============================================================

// @desc  Get patient's appointments
// @route GET /api/appointments/my
const getPatientAppointments = async (req, res) => {
  try {

    const appointments =
      await Appointment.find({
        patientId: req.user._id,
      })
      .populate(
        'doctorId',
        'fullName specialization'
      )
      .sort({
        appointmentDate: -1,
        appointmentTime: -1,
      });


    const formatted =
      appointments.map((a) => ({

        id:
          a._id,

        doctor_name:
          a.doctorId
            ? a.doctorId.fullName
            : '-',

        specialization:
          a.doctorId
            ? a.doctorId.specialization
            : '',

        appointment_date:
          a.appointmentDate,

        appointment_time:
          a.appointmentTime,

        // EXISTING
        type:
          a.type,

        // ONLINE
        consultation_type:
          a.consultationType || 'In-person',

        consultation_id:
          a.consultationId || null,

        // GOOGLE MEET
        meeting_url:
          a.meetingUrl || null,

        // NEW
        consultation_status:
          a.consultationStatus || 'Waiting',

        // EXISTING
        status:
          a.status || 'Pending',
      }));


    res.json({

      success: true,

      data: {
        appointments:
          formatted,
      },
    });

  } catch (error) {

    console.error(
      'GET PATIENT APPOINTMENTS ERROR:',
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ============================================================
// PATIENT BOOK APPOINTMENT
// ============================================================

// @desc  Patient book appointment
// @route POST /api/appointments/book
const bookAppointment = async (req, res) => {
  try {

    const {
      doctor_id,
      appointment_date,
      appointment_time,
      type,
      consultation_type,
    } = req.body;


    if (
      !doctor_id ||
      !appointment_date ||
      !appointment_time
    ) {

      return res.status(400).json({

        success: false,

        message:
          'Doctor, date and time are required.',
      });
    }


    // --------------------------------------------------------
    // CREATE CONSULTATION ID ONLY FOR ONLINE
    // --------------------------------------------------------

    let consultationId = null;

    if (consultation_type === 'Online') {
      consultationId =
        `consultation-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`;
    }


    const appointment =
      await Appointment.create({

        patientId:
          req.user._id,

        doctorId:
          doctor_id,

        appointmentDate:
          appointment_date,

        appointmentTime:
          appointment_time,

        // EXISTING
        type:
          type || 'General',

        // ONLINE
        consultationType:
          consultation_type || 'In-person',

        consultationId:
          consultationId,

        // GOOGLE MEET
        meetingUrl:
          null,

        // NEW
        consultationStatus:
          consultation_type === 'Online'
            ? 'Waiting'
            : 'Waiting',

        // EXISTING
        status:
          'Pending',
      });


    res.status(201).json({

      success: true,

      message:
        'Appointment booked successfully!',

      data: {
        id: appointment._id,

        consultation_type:
          appointment.consultationType,

        consultation_id:
          appointment.consultationId,

        meeting_url:
          appointment.meetingUrl,

        consultation_status:
          appointment.consultationStatus,
      },
    });

  } catch (error) {

    console.error(
      'BOOK APPOINTMENT ERROR:',
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getAppointments,
  createAppointment,
  startConsultation,
  endConsultation,
  updateAppointment,
  deleteAppointment,
  getPatientAppointments,
  bookAppointment,
};