
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

const {
  generateGoogleAuthUrl,
  handleGoogleCallback
} = require('../config/googleAuth');


// ============================================================
// GENERATE UNIQUE PATIENT ID
// ============================================================

const generatePatientId = async () => {

  let patientId;
  let exists = true;

  while (exists) {

    const randomNumber =
      Math.floor(
        100000 +
        Math.random() * 900000
      );

    patientId =
      `PAT-${randomNumber}`;

    exists =
      await Patient.exists({
        patientId
      });

  }

  return patientId;

};


// ============================================================
// GENERATE JWT TOKEN
// ============================================================

const generateToken = (
  id,
  role
) => {

  return jwt.sign(
    {
      id,
      role
    },
    process.env.JWT_SECRET,
    {
      expiresIn:
        process.env.JWT_EXPIRE
    }
  );

};


// ============================================================
// REGISTER DOCTOR / PATIENT
// ============================================================

const register = async (
  req,
  res
) => {

  try {

    const {
      type,
      fullName,
      email,
      password,
      mobile,
      gender,
      age,
      dob,
      specialization,
      bloodGroup,
      address
    } = req.body;


    if (
      !type ||
      !fullName ||
      !email ||
      !password
    ) {

      return res.status(400).json({
        success: false,
        message:
          'Please fill all required fields.'
      });

    }


    const salt =
      await bcrypt.genSalt(10);

    const hashedPassword =
      await bcrypt.hash(
        password,
        salt
      );


    // ========================================================
    // DOCTOR REGISTRATION
    // ========================================================

    if (type === 'doctor') {

      const exists =
        await Doctor.findOne({
          email:
            email.toLowerCase()
        });


      if (exists) {

        return res.status(400).json({
          success: false,
          message:
            'Doctor with this email already exists.'
        });

      }


      const doctor =
        await Doctor.create({

          fullName,

          email:
            email.toLowerCase(),

          password:
            hashedPassword,

          mobile:
            mobile || '',

          gender:
            gender || '',

          age:
            age || 0,

          dob:
            dob || '',

          specialization:
            specialization || '',

          address:
            address || ''

        });


      return res.status(201).json({

        success: true,

        message:
          'Registration successful! Please login.',

        data: {
          id:
            doctor._id
        }

      });

    }


    // ========================================================
    // PATIENT REGISTRATION
    // ========================================================

    if (type === 'patient') {

      const exists =
        await Patient.findOne({
          email:
            email.toLowerCase()
        });


      if (exists) {

        return res.status(400).json({

          success: false,

          message:
            'Patient with this email already exists.'

        });

      }


      const patientId =
        await generatePatientId();


      const patient =
        await Patient.create({

          patientId,

          fullName,

          email:
            email.toLowerCase(),

          password:
            hashedPassword,

          mobile:
            mobile || '',

          gender:
            gender || '',

          age:
            age || 0,

          dob:
            dob || '',

          bloodGroup:
            bloodGroup || '',

          address:
            address || ''

        });


      return res.status(201).json({

        success: true,

        message:
          'Registration successful! Please save your Patient ID.',

        data: {

          id:
            patient._id,

          patientId:
            patient.patientId

        }

      });

    }


    return res.status(400).json({

      success: false,

      message:
        'Invalid type. Use doctor or patient.'

    });


  } catch (error) {

    console.error(
      'Register error:',
      error
    );

    return res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

};


// ============================================================
// DOCTOR LOGIN
// ============================================================

const doctorLogin = async (
  req,
  res
) => {

  try {

    const {
      email,
      password
    } = req.body;


    if (
      !email ||
      !password
    ) {

      return res.status(400).json({

        success: false,

        message:
          'Email and password are required.'

      });

    }


    const doctor =
      await Doctor.findOne({
        email:
          email.toLowerCase()
      });


    if (!doctor) {

      return res.status(401).json({

        success: false,

        message:
          'Invalid email or password.'

      });

    }


    const isMatch =
      await bcrypt.compare(
        password,
        doctor.password
      );


    if (!isMatch) {

      return res.status(401).json({

        success: false,

        message:
          'Invalid email or password.'

      });

    }


    const token =
      generateToken(
        doctor._id,
        'doctor'
      );


    return res.json({

      success: true,

      message:
        'Login successful',

      token,

      data: {

        doctor: {

          id:
            doctor._id,

          full_name:
            doctor.fullName,

          email:
            doctor.email,

          mobile:
            doctor.mobile,

          specialization:
            doctor.specialization,

            profile_image:
  doctor.profileImage || '',


          google_email:
            doctor.googleEmail || '',

          google_connected:
            !!(
              doctor.googleOAuth &&
              (
                doctor.googleOAuth.refreshToken ||
                doctor.googleOAuth.accessToken
              )
            ),

          role:
            'doctor'

        }

      }

    });


  } catch (error) {

    console.error(
      'Doctor login error:',
      error
    );

    return res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

};


// ============================================================
// PATIENT LOGIN
// ============================================================

const patientLogin = async (
  req,
  res
) => {

  try {

    const {
      email,
      password
    } = req.body;


    if (
      !email ||
      !password
    ) {

      return res.status(400).json({

        success: false,

        message:
          'Email and password are required.'

      });

    }


    const patient =
      await Patient.findOne({

        email:
          email.toLowerCase()

      });


    if (!patient) {

      return res.status(401).json({

        success: false,

        message:
          'Invalid email or password.'

      });

    }


    const isMatch =
      await bcrypt.compare(
        password,
        patient.password
      );


    if (!isMatch) {

      return res.status(401).json({

        success: false,

        message:
          'Invalid email or password.'

      });

    }


    const token =
      generateToken(
        patient._id,
        'patient'
      );


    return res.json({

      success: true,

      message:
        'Login successful',

      token,

      data: {

        patient: {

          id:
            patient._id,

          patient_id:
            patient.patientId,

          full_name:
            patient.fullName,

          email:
            patient.email,

          mobile:
            patient.mobile,

          age:
            patient.age,

          gender:
            patient.gender,

          blood_group:
            patient.bloodGroup,

          role:
            'patient'

        }

      }

    });


  } catch (error) {

    console.error(
      'Patient login error:',
      error
    );

    return res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

};


// ============================================================
// GOOGLE AUTH URL
// ============================================================

const googleConnect = async (
  req,
  res
) => {

  try {

    if (!req.user || !req.user._id) {

      return res.status(401).json({

        success: false,

        message:
          'Doctor authentication required.'

      });

    }


    const url =
      generateGoogleAuthUrl(
        req.user._id
      );


    return res.json({

      success: true,

      url

    });


  } catch (error) {

    console.error(
      'GOOGLE CONNECT ERROR:',
      error
    );

    return res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

};


// ============================================================
// GOOGLE CALLBACK
// ============================================================

const googleCallback = async (
  req,
  res
) => {

  console.log('');
  console.log('======================================');
  console.log('GOOGLE CALLBACK RECEIVED');
  console.log('======================================');

  try {

    const {
      code,
      state,
      error,
      error_description
    } = req.query;


    console.log(
      'Google code received:',
      !!code
    );

    console.log(
      'Google state received:',
      !!state
    );

    if (error) {

      console.error(
        'Google returned an error:',
        error
      );

      console.error(
        'Google error description:',
        error_description || 'No description'
      );

      const frontendUrl =
        process.env.FRONTEND_URL ||
        'http://localhost:5173';

      return res.redirect(
        `${frontendUrl}/doctor/dashboard?google=error&message=${encodeURIComponent(
          error_description || error
        )}`
      );

    }


    if (!code) {

      throw new Error(
        'Google authorization code was not received.'
      );

    }


    if (!state) {

      throw new Error(
        'Google authorization state was not received.'
      );

    }


    console.log(
      'Processing Google authorization...'
    );


    const result =
      await handleGoogleCallback(
        code,
        state
      );


    console.log('');
    console.log('======================================');
    console.log('GOOGLE ACCOUNT CONNECTED SUCCESSFULLY');
    console.log('======================================');

    console.log(
      'Doctor ID:',
      result.doctor._id.toString()
    );

    console.log(
      'Google Email:',
      result.googleEmail
    );

    console.log(
      'Google Access Token saved:',
      !!result.doctor.googleOAuth?.accessToken
    );

    console.log(
      'Google Refresh Token saved:',
      !!result.doctor.googleOAuth?.refreshToken
    );

    console.log(
      '======================================'
    );


    const frontendUrl =
      process.env.FRONTEND_URL ||
      'http://localhost:5173';


    console.log(
      'Redirecting to:',
      `${frontendUrl}/doctor/dashboard?google=connected`
    );


    return res.redirect(
      `${frontendUrl}/doctor/dashboard?google=connected`
    );


  } catch (error) {

    console.error('');
    console.error('======================================');
    console.error('GOOGLE CALLBACK ERROR');
    console.error('======================================');

    console.error(
      'Error message:',
      error.message
    );

    console.error(
      'Full error:',
      error
    );

    console.error(
      'Stack:',
      error.stack
    );

    console.error('======================================');


    const frontendUrl =
      process.env.FRONTEND_URL ||
      'http://localhost:5173';


    return res.redirect(
      `${frontendUrl}/doctor/dashboard?google=error&message=${encodeURIComponent(
        error.message
      )}`
    );

  }

};


// ============================================================
// LOGOUT
// ============================================================

const logout = async (
  req,
  res
) => {

  return res.json({

    success: true,

    message:
      'Logged out successfully'

  });

};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

  register,

  doctorLogin,

  patientLogin,

  googleConnect,

  googleCallback,

  logout

};

