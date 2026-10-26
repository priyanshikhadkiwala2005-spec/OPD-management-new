const { google } = require('googleapis');

const {
  getDoctorGoogleAuth
} = require('./googleAuth');


// ============================================================
// CREATE GOOGLE MEET FOR SPECIFIC DOCTOR
// ============================================================

async function createGoogleMeet(
  doctorId
) {

  if (!doctorId) {

    throw new Error(
      'Doctor ID is required to create Google Meet.'
    );

  }


  // ==========================================================
  // GET THAT DOCTOR'S GOOGLE AUTH
  // ==========================================================

  const auth =
    await getDoctorGoogleAuth(
      doctorId
    );


  // ==========================================================
  // GOOGLE MEET API
  // ==========================================================

  const meet =
    google.meet({
      version: 'v2',
      auth
    });


  // ==========================================================
  // CREATE REAL GOOGLE MEET SPACE
  // ==========================================================

  const response =
    await meet.spaces.create({
      requestBody: {}
    });


  if (
    !response ||
    !response.data ||
    !response.data.meetingUri
  ) {

    throw new Error(
      'Google Meet room could not be created.'
    );

  }


  return {

    meetingUrl:
      response.data.meetingUri,

    spaceName:
      response.data.name

  };

}


module.exports = {

  createGoogleMeet

};